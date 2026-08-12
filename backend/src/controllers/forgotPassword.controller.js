const forgotPasswordService = require('../services/forgotPassword.service');
const { bcrypt, crypto } = forgotPasswordService;

// ─── RATE LIMITERS (IN-MEMORY, PER EMAIL) ───
// Guards the OTP flow against brute-force (6-digit codes) and email flooding.
// Keyed per email so attackers can't hammer one account. Same caveat as the
// login limiter: in-memory, so it resets on restart — swap for Redis at scale.
const otpSendBuckets = new Map();
const otpTryBuckets = new Map();
const resetBuckets = new Map();

function allowWithin(buckets, key, max, windowMs) {
  const now = Date.now();
  const rec = buckets.get(key);
  if (!rec || now - rec.startedAt >= windowMs) {
    buckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  rec.count += 1;
  return rec.count <= max;
}

async function sendOtp(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!allowWithin(otpSendBuckets, normalizedEmail, 5, 10 * 60 * 1000)) {
    return res.status(429).json({ message: 'Too many OTP requests. Try again in 10 minutes.' });
  }

  try {
    const users = await forgotPasswordService.findUserByEmail(normalizedEmail);

    // Always return success
    if (users.length === 0) {
      return res.json({ success: true, message: 'If that email exists, a code was sent.' });
    }

    const user = users[0];

    // Invalidate any existing unused OTPs for this user
    await forgotPasswordService.invalidateExistingOtps(user.id);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await forgotPasswordService.insertOtp(user.id, otpHash, expiresAt);

    // Send email
    await forgotPasswordService.sendOtpEmail(normalizedEmail, user.name, otp);

    res.json({ success: true, message: 'If that email exists, a code was sent.' });

  } catch (err) {
    console.error('SEND OTP ERROR:', err);
    res.status(500).json({ message: 'Failed to send reset code.' });
  }
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and code are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Rate-limit BEFORE any DB work — 6-digit codes are brute-forceable without
  // this, and every bad guess otherwise costs a DB round-trip.
  if (!allowWithin(otpTryBuckets, normalizedEmail, 5, 10 * 60 * 1000)) {
    return res.status(429).json({ message: 'Too many attempts. Request a new code and try again later.' });
  }

  try {
    const users = await forgotPasswordService.findUserIdByEmail(normalizedEmail);

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid code.' });
    }

    const user = users[0];
    const otpHash = crypto.createHash('sha256').update(otp.toString()).digest('hex');

    const otps = await forgotPasswordService.findValidOtp(user.id, otpHash);

    if (otps.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    // OTP is valid — swap it for a short-lived reset token (5 min)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await forgotPasswordService.swapOtpForResetToken(otps[0].id, resetTokenHash, resetExpiry);

    otpTryBuckets.delete(normalizedEmail);

    res.json({ success: true, resetToken });

  } catch (err) {
    console.error('VERIFY OTP ERROR:', err);
    res.status(500).json({ message: 'Verification failed.' });
  }
}

async function resetPassword(req, res) {
  const { email, resetToken, newPassword } = req.body;

  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!allowWithin(resetBuckets, normalizedEmail, 10, 10 * 60 * 1000)) {
    return res.status(429).json({ message: 'Too many reset attempts. Try again later.' });
  }

  try {
    const users = await forgotPasswordService.findUserIdByEmail(normalizedEmail);

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid request.' });
    }

    const user = users[0];
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    const otps = await forgotPasswordService.findValidOtp(user.id, tokenHash);

    if (otps.length === 0) {
      return res.status(400).json({ message: 'Reset session expired. Please start over.' });
    }

    // Hash and update the new password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await forgotPasswordService.updatePassword(user.id, hashed);

    // Consume the reset token
    await forgotPasswordService.consumeOtp(otps[0].id);

    // Invalidate all active sessions
    await forgotPasswordService.invalidateAllSessions(user.id);

    res.json({ success: true, message: 'Password updated successfully.' });

  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
}

module.exports = { sendOtp, verifyOtp, resetPassword };
