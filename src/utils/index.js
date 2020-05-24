import axios from "axios";
import { User, AccessToken, RefreshToken } from "../db";
import moment from "moment";

export const YoutubeApi = (token) => {
  const googleApi = axios.create({
    baseURL: "https://www.googleapis.com/",
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    getChannelInfo: async () => {
      const { data } = await googleApi.get("/youtube/v3/channels", {
        params: {
          mine: "true",
          part: ["snippet"].join(","),
        },
      });
      return data;
    },
    //returns a string for latest stream status. valid values:
    // complete – The broadcast is finished.
    // created – The broadcast has incomplete settings, so it is not ready to transition to a live or testing status, but it has been created and is otherwise valid.
    // live – The broadcast is active.
    // liveStarting – The broadcast is in the process of transitioning to live status.
    // ready – The broadcast settings are complete and the broadcast can transition to a live or testing status.
    // revoked – This broadcast was removed by an admin action.
    // testStarting – The broadcast is in the process of transitioning to testing status.
    // testing – The broadcast is only visible to the partner.
    getLatestBroadcast: async () => {
      const { data } = await googleApi.get("/youtube/v3/liveBroadcasts", {
        params: {
          mine: "true",
          part: ["snippet", "contentDetails", "status"].join(","),
          broadcastType: "all",
        },
      });
      const latest = data.items[0];
      return {
        id: latest.id,
        snippet: latest.snippet,
        status: latest.status.lifeCycleStatus,
      };
    },
  };
};

export const refreshAccessToken = async (refreshToken, userId) => {
  const { data } = await axios.post("https://oauth2.googleapis.com/token", {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  return createAccessToken({
    userId,
    access_token: data.access_token,
    expires_in: data.expires_in,
  });
};

export const getLatestTokens = (userId) =>
  Promise.all([
    AccessToken.findOne({
      where: {
        userId,
      },
      order: [["id", "DESC"]],
    }),
    RefreshToken.findOne({
      where: {
        userId,
      },
      order: [["id", "DESC"]],
    }),
  ]);

// grab the channel id
// create or find user in db
// update token entries if needed
export const handleUserLogin = async ({
  access_token,
  expires_in,
  refresh_token,
}) => {
  const yt = YoutubeApi(access_token);
  const info = await yt.getChannelInfo();
  const { id: channelId, ...userData } = info.items[0];
  const username = userData.snippet.title;
  const [user, created] = await User.findOrCreate({
    where: { channelId },
    defaults: {
      username,
      channelId,
    },
  });
  await updateUserTokens({
    user,
    access_token,
    expires_in,
    refresh_token,
  });
};

export const updateUserTokens = async ({
  user,
  access_token,
  expires_in,
  refresh_token,
}) => {
  await createAccessToken({ access_token, expires_in, userId: user.id });

  await RefreshToken.create({
    token: refresh_token,
    userId: user.id,
  });
};

const createAccessToken = ({ access_token, expires_in, userId }) => {
  return AccessToken.create({
    token: access_token,
    expires: moment().add(expires_in, "seconds").toISOString(),
    userId,
  });
};

export const GithubApi = () => {};
