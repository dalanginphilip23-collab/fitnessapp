const jwt = require('jsonwebtoken');

// NOTE: This was previously duplicated verbatim in route/session.js and
// route/workoutLogs.js (both defined an identical local requireAuth()).
// Extracted here as a single shared middleware — behavior is unchanged.
const COOKIE_NAME = 'vitalis_session';

function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie(COOKIE_NAME);
    return res.status(401).json({ message: 'Session expired' });
  }
}

module.exports = requireAuth;
