// Ensures a userId supplied in the request BODY matches the authenticated
// user's id. Must run AFTER requireAuth (relies on req.user being set).
//
// Some endpoints take the target user from req.body (e.g. { userId, ... })
// instead of the URL — same IDOR risk as the params version, just a
// different source. Accepts `userId`, `user_id`, or `sender_id` to match the
// varying naming already used across controllers.
function verifyOwnUserIdBody(req, res, next) {
  const bodyUserId = req.body.userId ?? req.body.user_id ?? req.body.sender_id;

  if (!req.user || String(req.user.id) !== String(bodyUserId)) {
    return res
      .status(403)
      .json({ error: 'Forbidden: you can only act on your own account' });
  }

  next();
}

module.exports = verifyOwnUserIdBody;
