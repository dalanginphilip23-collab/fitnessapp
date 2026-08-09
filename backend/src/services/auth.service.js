const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const UAParser = require('ua-parser-js');
const { OAuth2Client } = require('google-auth-library');
const { sendVerificationEmail } = require('../config/mailer');

// ─── Google OAuth Client ───
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
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
  const count = record.count + 1;

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
      message: `Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`,
      retryAfter: Math.ceil(remaining / 1000),
    };
  } else {
    const secs = Math.ceil(remaining / 1000);
    return {
      message: `Too many failed attempts. Try again in ${secs} second${secs !== 1 ? 's' : ''}.`,
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
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
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

    const device = result.device.type || 'Desktop';
    const browser = result.browser.name || 'Unknown';
    const os = result.os.name || 'Unknown';

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

async function getUserFromToken(token) {
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

  return rows[0] || null;
}

async function findUserByEmail(email) {
  const [existing] = await db.execute(
    'SELECT email FROM users WHERE email = ?', [email]
  );
  return existing;
}

async function createUser({ name, email, hashedPw, fitness_goal }) {
  return db.execute(
    'INSERT INTO users (name, email, password, fitness_goal, is_online, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, hashedPw, fitness_goal, 0, 0]
  );
}

async function createGoogleUser({ name, email, hashedPw, fitness_goal, picture }) {
  return db.execute(
    'INSERT INTO users (name, email, password, fitness_goal, is_online, avatar_url, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, email, hashedPw, fitness_goal, 1, picture, 1]
  );
}


async function findFullUserByEmail(email) {
  const [users] = await db.execute(
    'SELECT * FROM users WHERE email = ?', [email]
  );
  return users;
}

async function setUserOnline(userId) {
  await db.execute('UPDATE users SET is_online = 1 WHERE id = ?', [userId]);
}

async function setUserOffline(userId) {
  await db.execute('UPDATE users SET is_online = 0 WHERE id = ?', [userId]);
}

async function getLatestAvatar(userId) {
  const [profileRows] = await db.execute(
    'SELECT avatar_url FROM user_profiles WHERE user_id = ?', [userId]
  );
  return profileRows[0]?.avatar_url;
}

async function findUserById(id) {
  const [newUsers] = await db.execute(
    'SELECT * FROM users WHERE id = ?', [id]
  );
  return newUsers[0];
}

async function getUserPasswordHash(userId) {
  const [rows] = await db.execute(
    'SELECT password FROM users WHERE id = ?', [userId]
  );
  return rows;
}

async function updateUserPassword(userId, newHash) {
  await db.execute('UPDATE users SET password = ? WHERE id = ?', [newHash, userId]);
}

async function markEmailVerified(userId) {
  await db.execute('UPDATE users SET email_verified = 1 WHERE id = ?', [userId]);
}

// ─── EMAIL VERIFICATION ───
// Builds a signed 24h token and sends the verification email. Shared by
// register and resend-verification so the token/link format stays identical.
async function sendEmailVerification(userId, email) {
  const verifyToken = jwt.sign(
    { id: userId, email, purpose: 'verify-email' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const baseUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || '').replace(/\/+$/, '');
  const verifyLink = `${baseUrl}/verify-email?token=${verifyToken}`;

  await sendVerificationEmail(email, verifyLink);
}

module.exports = {
  COOKIE_NAME,
  googleClient,
  checkRateLimit,
  recordFailedAttempt,
  clearAttempts,
  getCookieOptions,
  setSessionCookie,
  logUserSession,
  getUserFromToken,
  findUserByEmail,
  createUser,
  createGoogleUser,
  findFullUserByEmail,
  setUserOnline,
  setUserOffline,
  getLatestAvatar,
  findUserById,
  getUserPasswordHash,
  updateUserPassword,
  markEmailVerified,
  sendEmailVerification,
  bcrypt,
  jwt,
};
