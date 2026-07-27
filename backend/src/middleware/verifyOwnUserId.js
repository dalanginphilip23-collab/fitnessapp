// Ensures the `:userId` route param matches the authenticated user's id.
// Must run AFTER requireAuth (relies on req.user being set).
//
// Without this, any logged-in user could read/write another user's data
// just by changing the userId in the URL (IDOR vulnerability), e.g.
// GET /api/bmi/6 while logged in as user 4.
function verifyOwnUserId(req, res, next) {
  const { userId } = req.params;

  if (!req.user || String(req.user.id) !== String(userId)) {
    return res
      .status(403)
      .json({ error: 'Forbidden: you can only access your own data' });
  }

  next();
}

module.exports = verifyOwnUserId;
