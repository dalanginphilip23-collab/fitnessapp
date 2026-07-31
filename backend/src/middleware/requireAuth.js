const jwt = require('jsonwebtoken');
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
