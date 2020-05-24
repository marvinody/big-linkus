import { User, RefreshToken, AccessToken, Broadcast } from "../db";
import axios from "axios";
import qs from "qs";
import dotenv from "dotenv";
import moment from "moment";
dotenv.config();
import { getLatestTokens, refreshAccessToken, YoutubeApi } from "../utils";

const postToDiscord = (ytBroadcast) => {
  console.log("WE LIVE");
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
  // no nested query so we don't fetch all tokens
  const users = await User.findAll();
  await Promise.all(
    users.map(async (user) => {
      try {
        let [accessToken, refreshToken] = await getLatestTokens(user.id);

        const expired = moment() > moment(accessToken.expires);
        if (expired) {
          console.log(`${user.username} expired, fetching new`);
          accessToken = await refreshAccessToken(refreshToken.token, user.id);
        }
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
        const changedToLive =
          broadcast.status !== "live" && ytBroadcast.status === "live";
        const newlyMadeLive = created && broadcast.status === "live";

        // if desirable state, let's post to discord
        if (changedToLive || newlyMadeLive) {
          await postToDiscord(ytBroadcast);
        }

        // if we haven't newly created, then let's just update it to w/e
        if (!created) {
          await broadcast.update({
            status: ytBroadcast.status,
          });
        }
      } catch (err) {
        console.log(`Crashed on user: ${user.username} - ${user.id}`);
        if (err.isAxiosError) {
          console.error(err.response.data.error);
        } else {
          console.error(err);
        }
      }
    })
  );
})();
