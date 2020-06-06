export function post(req, res, next) {
  req.session.destroy();
  res.sendStatus(200);
}
