const jwt = require('jsonwebtoken');
const db = require('../config/db');
const COOKIE_NAME = 'vitalis_session';

function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.clearCookie(COOKIE_NAME);
    return res.status(401).json({ message: 'Session expired' });
  }

  // Defense-in-depth: even with a valid JWT, the account must still exist and
  // must have a verified email. This also invalidates stale cookies issued
  // before the email-verification gate existed.
  db.execute('SELECT email_verified FROM users WHERE id = ?', [decoded.id])
    .then(([rows]) => {
      if (rows.length === 0 || Number(rows[0].email_verified) !== 1) {
        res.clearCookie(COOKIE_NAME);
        return res.status(401).json({ message: 'Session expired' });
      }
      req.user = decoded;
      next();
    })
    .catch((err) => {
      console.error('[requireAuth] DB check failed:', err.message);
      return res.status(503).json({ message: 'Service temporarily unavailable' });
    });
}

module.exports = requireAuth;