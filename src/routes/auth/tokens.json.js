export function get(req, res, next) {
  res.json({
    google: req.session.google_token,
  });
}
