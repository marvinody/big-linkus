import axios from "axios";
import { User, AccessToken, RefreshToken } from "../db";
import moment from "moment";

export const YoutubeApi = (token) => {
  const ax = axios.create({
    baseURL: "https://www.googleapis.com/",
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    getChannelInfo: async () => {
      const { data } = await ax.get("/youtube/v3/channels", {
        params: {
          mine: "true",
          part: ["snippet"].join(","),
        },
      });
      return data;
    },
    getStreamingStatus: async () => {},
  };
};

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
  console.log({ created });
  console.log(JSON.stringify(user, null, 2));
};

export const updateUserTokens = async ({
  user,
  access_token,
  expires_in,
  refresh_token,
}) => {
  const expires = moment()
    .add(expires_in, "seconds")
    .format("YYYY-MM-DD hh:mm:ss");

  await AccessToken.create({
    token: access_token,
    expires,
    userId: user.id,
  });

  await RefreshToken.create({
    token: refresh_token,
    userId: user.id,
  });
};

export const GithubApi = () => {};
