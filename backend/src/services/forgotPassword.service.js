const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../config/db");
const { sendEmail } = require("../config/mailer");

async function findUserByEmail(email) {
  const [users] = await db.execute(
    "SELECT id, name FROM users WHERE email = ?",
    [email],
  );
  return users;
}

async function findUserIdByEmail(email) {
  const [users] = await db.execute("SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  return users;
}

async function invalidateExistingOtps(userId) {
  return db.execute(
    "UPDATE password_reset_otps SET used = 1 WHERE user_id = ? AND used = 0",
    [userId],
  );
}

async function insertOtp(userId, otpHash, expiresAt) {
  return db.execute(
    "INSERT INTO password_reset_otps (user_id, otp_hash, expires_at) VALUES (?, ?, ?)",
    [userId, otpHash, expiresAt],
  );
}

async function sendOtpEmail(email, name, otp) {
  return sendEmail({
    to: email,
    subject: "Your Vitalis Password Reset Code",
    html: `
        <div style="background:#0e0e0e;padding:40px 32px;font-family:'DM Sans',Arial,sans-serif;max-width:480px;margin:0 auto;border-radius:16px;border:1px solid rgba(255,255,255,0.06);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
            <div style="width:34px;height:34px;background:#c7f248;border-radius:8px;display:flex;align-items:center;justify-content:center;">
              <span style="color:#161f00;font-weight:900;font-size:16px;">V</span>
            </div>
            <span style="color:#e5e2e1;font-size:18px;font-weight:700;letter-spacing:0.1em;">VITALIS</span>
          </div>
          <h2 style="color:#e5e2e1;font-size:22px;margin:0 0 8px;font-weight:700;">Password Reset</h2>
          <p style="color:rgba(196,201,176,0.5);font-size:13px;margin:0 0 28px;line-height:1.6;">
            Hey ${name}, use the code below to reset your password. It expires in <strong style="color:#c7f248;">10 minutes</strong>.
          </p>
          <div style="background:rgba(199,242,72,0.06);border:1px solid rgba(199,242,72,0.15);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
            <span style="font-size:42px;font-weight:900;letter-spacing:0.3em;color:#c7f248;">${otp}</span>
          </div>
          <p style="color:rgba(196,201,176,0.35);font-size:11px;text-align:center;margin:0;line-height:1.6;">
            If you didn't request this, you can safely ignore this email.<br/>
            Never share this code with anyone.
          </p>
        </div>
      `,
  });
}

async function findValidOtp(userId, otpHash) {
  const [otps] = await db.execute(
    `SELECT id FROM password_reset_otps
     WHERE user_id = ? AND otp_hash = ? AND used = 0 AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [userId, otpHash],
  );
  return otps;
}

async function swapOtpForResetToken(otpId, resetTokenHash, resetExpiry) {
  return db.execute(
    "UPDATE password_reset_otps SET otp_hash = ?, expires_at = ? WHERE id = ?",
    [resetTokenHash, resetExpiry, otpId],
  );
}

async function updatePassword(userId, hashed) {
  return db.execute("UPDATE users SET password = ? WHERE id = ?", [
    hashed,
    userId,
  ]);
}

async function consumeOtp(otpId) {
  return db.execute("UPDATE password_reset_otps SET used = 1 WHERE id = ?", [
    otpId,
  ]);
}

async function invalidateAllSessions(userId) {
  return db.execute(
    "UPDATE user_sessions SET is_current = 0 WHERE user_id = ?",
    [userId],
  );
}

module.exports = {
  bcrypt,
  crypto,
  findUserByEmail,
  findUserIdByEmail,
  invalidateExistingOtps,
  insertOtp,
  sendOtpEmail,
  findValidOtp,
  swapOtpForResetToken,
  updatePassword,
  consumeOtp,
  invalidateAllSessions,
};
