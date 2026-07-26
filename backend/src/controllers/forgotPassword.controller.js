const forgotPasswordService = require('../services/forgotPassword.service');
const { bcrypt, crypto } = forgotPasswordService;

async function sendOtp(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const users = await forgotPasswordService.findUserByEmail(email);

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
    await forgotPasswordService.sendOtpEmail(email, user.name, otp);

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

  try {
    const users = await forgotPasswordService.findUserIdByEmail(email);

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

  try {
    const users = await forgotPasswordService.findUserIdByEmail(email);

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
