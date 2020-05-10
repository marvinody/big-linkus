import axios from "axios";
import qs from "qs";
import { handleUserLogin } from "../../../utils";

export async function get(req, res, next) {
  try {
    const { data } = await axios.post(
      "https://accounts.google.com/o/oauth2/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: req.query.code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT,
      }
    );
    const response = qs.parse(data);
    console.log({ response });
    req.session.google_token = response.access_token;
    await handleUserLogin(response);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
}
