const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// ─── MEAL SUMMARY EMAIL ──────────────────────────────────────────────────────
async function sendMealSummaryEmail(to, summary) {
  const mailOptions = {
    from:    `"Vitalis" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🥗 Your Daily Nutrition Summary — Vitalis',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f0f;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#a3e635;margin:0;font-size:24px;letter-spacing:2px;">VITALIS</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0;">PERFORMANCE OS</p>
        </div>

        <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Daily Nutrition Summary</h2>
        <p style="color:#aaa;font-size:14px;margin:0 0 24px;">
          Here's what you've consumed today. Keep fueling your performance!
        </p>

        <table style="width:100%;border-collapse:collapse;background:#1a1a1a;border-radius:8px;overflow:hidden;">
          <tr style="background:#1f1f1f;">
            <td style="padding:14px 16px;color:#888;font-size:13px;">🔥 Calories</td>
            <td style="padding:14px 16px;color:#a3e635;font-weight:bold;font-size:16px;text-align:right;">
              ${Math.round(summary.calories)} kcal
            </td>
          </tr>
          <tr>
            <td style="padding:14px 16px;color:#888;font-size:13px;">💪 Protein</td>
            <td style="padding:14px 16px;color:#60a5fa;font-weight:bold;font-size:16px;text-align:right;">
              ${Math.round(summary.protein)}g
            </td>
          </tr>
          <tr style="background:#1f1f1f;">
            <td style="padding:14px 16px;color:#888;font-size:13px;">🍚 Carbs</td>
            <td style="padding:14px 16px;color:#a3e635;font-weight:bold;font-size:16px;text-align:right;">
              ${Math.round(summary.carbs)}g
            </td>
          </tr>
          <tr>
            <td style="padding:14px 16px;color:#888;font-size:13px;">🥑 Fat</td>
            <td style="padding:14px 16px;color:#fb923c;font-weight:bold;font-size:16px;text-align:right;">
              ${Math.round(summary.fat)}g
            </td>
          </tr>
        </table>

        <p style="color:#555;font-size:11px;text-align:center;margin-top:32px;">
          You received this because you logged a meal on Vitalis.<br/>
          © ${new Date().getFullYear()} Vitalis Performance OS
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// ─── PASSWORD RESET EMAIL ─────────────────────────────────────────────────────
async function sendPasswordResetEmail(to, resetLink) {
  const mailOptions = {
    from:    `"Vitalis" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔐 Reset Your Vitalis Password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f0f;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#a3e635;margin:0;font-size:24px;letter-spacing:2px;">VITALIS</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0;">PERFORMANCE OS</p>
        </div>

        <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Password Reset Request</h2>
        <p style="color:#aaa;font-size:14px;margin:0 0 24px;">
          We received a request to reset your password. Click the button below to continue.
          This link expires in <strong style="color:#fff;">1 hour</strong>.
        </p>

        <div style="text-align:center;margin:32px 0;">
          <a href="${resetLink}"
             style="background:#a3e635;color:#000;padding:14px 32px;border-radius:8px;
                    text-decoration:none;font-weight:bold;font-size:15px;letter-spacing:1px;">
            RESET PASSWORD
          </a>
        </div>

        <p style="color:#555;font-size:12px;">
          If you didn't request this, you can safely ignore this email.
          Your password will not be changed.
        </p>

        <p style="color:#555;font-size:11px;text-align:center;margin-top:32px;">
          © ${new Date().getFullYear()} Vitalis Performance OS
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// ─── WELCOME EMAIL ────────────────────────────────────────────────────────────
async function sendWelcomeEmail(to, name) {
  const mailOptions = {
    from:    `"Vitalis" <${process.env.EMAIL_USER}>`,
    to,
    subject: '⚡ Welcome to Vitalis Performance OS',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f0f;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#a3e635;margin:0;font-size:24px;letter-spacing:2px;">VITALIS</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0;">PERFORMANCE OS</p>
        </div>

        <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Welcome, ${name}! 👋</h2>
        <p style="color:#aaa;font-size:14px;margin:0 0 24px;">
          Your Vitalis account is ready. Start tracking your nutrition, workouts, 
          sleep, and recovery — all in one place.
        </p>

        <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="color:#a3e635;font-weight:bold;margin:0 0 12px;">What you can do:</p>
          <p style="color:#aaa;font-size:13px;margin:6px 0;">🍗 AI-powered meal analysis</p>
          <p style="color:#aaa;font-size:13px;margin:6px 0;">💪 Camera workout tracking</p>
          <p style="color:#aaa;font-size:13px;margin:6px 0;">😴 Sleep & recovery monitoring</p>
          <p style="color:#aaa;font-size:13px;margin:6px 0;">📊 Clinical health insights</p>
          <p style="color:#aaa;font-size:13px;margin:6px 0;">🗺️ Activity map & run analysis</p>
        </div>

        <p style="color:#555;font-size:11px;text-align:center;margin-top:32px;">
          © ${new Date().getFullYear()} Vitalis Performance OS
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendMealSummaryEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};