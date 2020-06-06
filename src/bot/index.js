import { User, RefreshToken, AccessToken, Broadcast } from "../db";
import axios from "axios";
import qs from "qs";
import dotenv from "dotenv";
import moment from "moment";
dotenv.config();

import { getLatestTokens, refreshAccessToken, YoutubeApi } from "../utils";

const postToDiscord = (ytBroadcast, { username }) => {
  console.timeLog("bot", `${username} (${ytBroadcast.id}) is live!`);
  const url = `https://www.youtube.com/watch?v=${ytBroadcast.id}`;
  const thumb = ytBroadcast.snippet.thumbnails.standard.url;
  return axios.post(process.env.DISCORD_WEBHOOK, {
    embeds: [
      {
        title: ytBroadcast.snippet.title,
        description: ytBroadcast.snippet.description,
        url,
        image: {
          url: thumb,
        },
      },
    ],
    username: "DEV LINKUS",
  });
};

(async () => {
  console.time("bot", "fetching all users");
  // no nested query so we don't fetch all tokens
  const users = await User.findAll();
  console.timeLog("bot", `${users.length} users found, checking each`);
  await Promise.all(
    users.map(async (user) => {
      try {
        console.timeLog("bot", `checking ${user.username}`);
        // some ID for this guy
        let [accessToken, refreshToken] = await getLatestTokens(user.id);
        // do we need to refresh our ID?
        const expired = moment() > moment(accessToken.expires);
        if (expired) {
          console.timeLog("bot", `${user.username} expired, fetching new`);
          accessToken = await refreshAccessToken(refreshToken.token, user.id);
        }
        // now let's see their status
        const ytApi = YoutubeApi(accessToken.token);
        const ytBroadcast = await ytApi.getLatestBroadcast();
        const [broadcast, created] = await Broadcast.findOrCreate({
          where: {
            ytId: ytBroadcast.id,
          },
          defaults: {
            ytId: ytBroadcast.id,
            status: ytBroadcast.status,
            userId: user.id,
          },
        });
        // only two cases we care to show currently
        const changedToLive =
          broadcast.status !== "live" && ytBroadcast.status === "live";
        const newlyMadeLive = created && broadcast.status === "live";

        // if desirable state, let's post to discord
        if (changedToLive || newlyMadeLive) {
          await postToDiscord(ytBroadcast, user);
        }

        // if we haven't newly created, then let's just update it to w/e
        if (!created) {
          await broadcast.update({
            status: ytBroadcast.status,
          });
        }
      } catch (err) {
        console.timeLog(
          "bot",
          `Crashed on user: ${user.username} - ${user.id}`
        );
        if (err.isAxiosError) {
          console.timeLog("bot", err.response.data.error);
        } else {
          console.timeLog("bot", err);
        }
      }
    })
  );

  console.timeEnd("bot", "done");
})();
