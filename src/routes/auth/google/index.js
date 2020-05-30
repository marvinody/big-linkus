import qs from "qs";

export function get(req, res, next) {
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    " openid profile",
  ].join(" ");

  const url =
    "https://accounts.google.com/o/oauth2/auth?" +
    qs.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT,
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      response_type: "code",
    });
  res.redirect(url);
}
