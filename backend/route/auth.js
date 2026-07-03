const express    = require('express');
const router     = express.Router();
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const db         = require('../config/db');
const UAParser   = require('ua-parser-js');
const { OAuth2Client } = require('google-auth-library');

// ─── FIX: Disable SSL verification on localhost (dev only) ───
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// ─── Google OAuth Client ───
const googleClient = new OAuth2Client({
  clientId:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

// ─── RATE LIMITER (IN-MEMORY, PER EMAIL) ───
const loginAttempts = new Map();

function getRateLimit(email) {
  if (!loginAttempts.has(email)) return { count: 0, lockedUntil: null };
  return loginAttempts.get(email);
}

function recordFailedAttempt(email) {
  const record = getRateLimit(email);
  const count  = record.count + 1;

  let lockedUntil = null;
  if (count >= 20) {
    lockedUntil = Date.now() + 30 * 60 * 1000;
  } else if (count >= 10) {
    lockedUntil = Date.now() + 30 * 1000;
  }

  loginAttempts.set(email, { count, lockedUntil });
  return count;
}

function clearAttempts(email) {
  loginAttempts.delete(email);
}

function checkRateLimit(email) {
  const record = getRateLimit(email);
  if (!record.lockedUntil) return null;

  const remaining = record.lockedUntil - Date.now();
  if (remaining <= 0) {
    loginAttempts.set(email, { count: 0, lockedUntil: null });
    return null;
  }

  if (record.count >= 20) {
    const mins = Math.ceil(remaining / 60000);
    return {
      message:    `Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`,
      retryAfter: Math.ceil(remaining / 1000),
    };
  } else {
    const secs = Math.ceil(remaining / 1000);
    return {
      message:    `Too many failed attempts. Try again in ${secs} second${secs !== 1 ? 's' : ''}.`,
      retryAfter: Math.ceil(remaining / 1000),
    };
  }
}

// ─── COOKIE HELPERS ───
const COOKIE_NAME = 'vitalis_session';

function getCookieOptions(req) {
  const isSecure =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure:   isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000,
    path:     '/',
  };
}

function setSessionCookie(res, userId, email, req) {
  const token = jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie(COOKIE_NAME, token, getCookieOptions(req));
  return token;
}

// ─── SESSION LOGGING ───
const logUserSession = async (req, userId) => {
  try {
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();

    const device  = result.device.type || 'Desktop';
    const browser = result.browser.name || 'Unknown';
    const os      = result.os.name || 'Unknown';

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress ||
      req.ip ||
      'Unknown';

    const location = 'Unknown';

    await db.execute(
      'UPDATE user_sessions SET is_current = false WHERE user_id = ?',
      [userId]
    );

    await db.execute(
      `INSERT INTO user_sessions
       (user_id, device, browser, os, ip_address, location, is_current)
       VALUES (?, ?, ?, ?, ?, ?, true)`,
      [userId, device, browser, os, ip, location]
    );
  } catch (err) {
    console.error('SESSION LOG ERROR:', err);
  }
};

// ─── GET /api/auth/me ───
router.get('/me', async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) return res.status(200).json({ user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.execute(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.fitness_goal,
        p.avatar_url AS avatar
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE u.id = ?
    `, [decoded.id]);

    if (rows.length === 0) {
      res.clearCookie(COOKIE_NAME, getCookieOptions(req));
      return res.status(200).json({ user: null });
    }

    const user = rows[0];
    res.json({
      user: {
        id:     user.id,
        name:   user.name,
        email:  user.email,
        avatar: user.avatar,
        goal:   user.fitness_goal,
      },
    });
  } catch (err) {
    res.clearCookie(COOKIE_NAME, getCookieOptions(req));
    return res.status(200).json({ user: null });
  }
});

// ─── POST /api/auth/register ───
router.post('/register', async (req, res) => {
  const { name, email, password, fitness_goal } = req.body;

  try {
    const [existing] = await db.execute(
      'SELECT email FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered in Vitalis labs.' });
    }

    const salt     = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(password, salt);

    await db.execute(
      'INSERT INTO users (name, email, password, fitness_goal, is_online) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPw, fitness_goal, 0]
    );

    res.status(201).json({ success: true, message: 'Identity created.' });
  } catch (err) {
    res.status(500).json({ error: 'Database rejection: ' + err.message });
  }
});

// ─── POST /api/auth/login ───
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const lockStatus = checkRateLimit(email);
  if (lockStatus) {
    return res.status(429).json({
      message:    lockStatus.message,
      retryAfter: lockStatus.retryAfter,
    });
  }

  try {
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?', [email]
    );

    if (users.length === 0) {
      recordFailedAttempt(email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user    = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const attempts = recordFailedAttempt(email);

      let hint = 'Invalid credentials';
      if (attempts >= 20) hint = 'Too many failed attempts. Try again in 30 minutes.';
      else if (attempts >= 10) hint = 'Too many failed attempts. Try again in 30 seconds.';

      return res.status(401).json({ message: hint });
    }

    clearAttempts(email);
    await db.execute('UPDATE users SET is_online = 1 WHERE id = ?', [user.id]);

    const [profileRows] = await db.execute(
      'SELECT avatar_url FROM user_profiles WHERE user_id = ?', [user.id]
    );
    const latestAvatar = profileRows[0]?.avatar_url || user.avatar_url || null;

    setSessionCookie(res, user.id, user.email, req);
    await logUserSession(req, user.id);

    res.json({
      id:     user.id,
      name:   user.name,
      email:  user.email,
      avatar: latestAvatar,
      goal:   user.fitness_goal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during initialization' });
  }
});

// ─── POST /api/auth/google-login ───
router.post('/google-login', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Missing authorization code' });
  }

  try {
    // Exchange auth code for tokens
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: 'postmessage',
    });

    if (!tokens.id_token) {
      return res.status(401).json({ message: 'No ID token returned from Google' });
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken:  tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload                  = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(401).json({ message: 'Google account has no email' });
    }

    // Check if user exists
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?', [email]
    );

    let user;

    if (users.length === 0) {
      // Create new user
      const salt           = await bcrypt.genSalt(10);
      const randomHashedPw = await bcrypt.hash(
        Math.random().toString(36).slice(-10), salt
      );
      const defaultGoal = 'Unspecified (Google Auth)';

      const [insertResult] = await db.execute(
        'INSERT INTO users (name, email, password, fitness_goal, is_online, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, randomHashedPw, defaultGoal, 1, picture]
      );

      const [newUsers] = await db.execute(
        'SELECT * FROM users WHERE id = ?', [insertResult.insertId]
      );
      user = newUsers[0];
    } else {
      user = users[0];
      await db.execute('UPDATE users SET is_online = 1 WHERE id = ?', [user.id]);
    }

    const [profileRows] = await db.execute(
      'SELECT avatar_url FROM user_profiles WHERE user_id = ?', [user.id]
    );
    const latestAvatar = profileRows[0]?.avatar_url || user.avatar_url || picture;

    setSessionCookie(res, user.id, user.email, req);
    await logUserSession(req, user.id);

    res.json({
      id:     user.id,
      name:   user.name,
      email:  user.email,
      avatar: latestAvatar,
      goal:   user.fitness_goal,
    });
  } catch (err) {
    console.error('Google Login Error:', err.message);
    res.status(401).json({ message: 'Google authentication failed: ' + err.message });
  }
});

// ─── POST /api/auth/change-password ───
router.post('/change-password', async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Session expired — please log in again.' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT password FROM users WHERE id = ?', [decoded.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const salt    = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [newHash, decoded.id]);

    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('Change Password Error:', err);
    res.status(500).json({ error: 'Could not update password' });
  }
});

// ─── POST /api/auth/logout ───
router.post('/logout', async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await db.execute('UPDATE users SET is_online = 0 WHERE id = ?', [decoded.id]);
    } catch (_) {}
  }

  res.clearCookie(COOKIE_NAME, getCookieOptions(req));
  res.json({ success: true, message: 'User logged out.' });
});

module.exports = router;