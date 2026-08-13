const dns = require("dns");

// Force Node to prefer IPv4 for DNS lookups globally (safe fix for Render)
dns.setDefaultResultOrder("ipv4first");

// ─── EMAIL PROVIDER (HTTP API ONLY) ──────────────────────────────────────────
// Render blocks ALL outbound SMTP (ports 25/465/587 drop every provider), so we
// send email over HTTPS via Brevo. No SMTP/Gmail configuration is needed.
// Requires BREVO_API_KEY and a verified sender (BREVO_SENDER_EMAIL).

// CONNECTION CHECK
// Confirms Brevo is configured before the server starts.
async function verifyTransport() {
  if (!process.env.BREVO_API_KEY) {
    console.warn(
      "[MAILER] BREVO_API_KEY is not set. Email sending is disabled.",
    );
    return false;
  }
  console.log("[MAILER] Email provider ready: Brevo (HTTP API).");
  return true;
}

// ─── BREVO SENDER (HTTP API on port 443) ─────────────────────────────────────
// Brevo delivers to ANY recipient once the FROM address (BREVO_SENDER_EMAIL or
// BREVO_FROM) is a verified sender in the Brevo dashboard (Settings > Senders &
// IP). Note: Brevo does NOT accept free-email senders like @gmail.com — the
// sender needs a domain you control (a free subdomain such as is-a.dev works).
// Requires BREVO_API_KEY (xkeysib-...) from app.brevo.com/settings/keys/api.
// Both naming conventions are accepted so the configured Render env names don't
// matter.
async function sendViaBrevo({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY is not configured");

  const fromEmail = process.env.BREVO_SENDER_EMAIL || process.env.BREVO_FROM;
  if (!fromEmail) throw new Error("BREVO_FROM / BREVO_SENDER_EMAIL (a verified Brevo sender) is not configured");

  const fromName = process.env.BREVO_SENDER_NAME || process.env.BREVO_FROM_NAME || "Vitalis";
  const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`Brevo API error ${resp.status}: ${JSON.stringify(data)}`);
  }
  return { messageId: data.messageId };
}

// ─── UNIFIED SENDER ───────────────────────────────────────────────────────────
// Sends via Brevo over HTTPS. The FROM address is set by the Brevo config
// (BREVO_SENDER_EMAIL / BREVO_FROM), so mailOptions.from is not used.
async function sendEmail(mailOptions) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error(
      "No email provider configured (set BREVO_API_KEY).",
    );
  }

  const mail = {
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
  };

  return sendViaBrevo(mail);
}

// ─── MEAL SUMMARY EMAIL ──────────────────────────────────────────────────────
async function sendMealSummaryEmail(to, summary) {
  const mailOptions = {
    to,
    subject: "🥗 Your Daily Nutrition Summary — Vitalis",
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

  return sendEmail(mailOptions);
}

// ─── PASSWORD RESET EMAIL ─────────────────────────────────────────────────────
async function sendPasswordResetEmail(to, resetLink) {
  const mailOptions = {
    to,
    subject: "🔐 Reset Your Vitalis Password",
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

  return sendEmail(mailOptions);
}

// ─── WELCOME EMAIL ────────────────────────────────────────────────────────────
async function sendWelcomeEmail(to, name) {
  const mailOptions = {
    to,
    subject: "⚡ Welcome to Vitalis Performance OS",
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

  return sendEmail(mailOptions);
}

// ─── EMAIL VERIFICATION ───────────────────────────────────────────────────────
async function sendVerificationEmail(to, verifyLink) {
  const mailOptions = {
    to,
    subject: "✅ Verify Your Vitalis Account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f0f;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#a3e635;margin:0;font-size:24px;letter-spacing:2px;">VITALIS</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0;">PERFORMANCE OS</p>
        </div>

        <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Confirm Your Email</h2>
        <p style="color:#aaa;font-size:14px;margin:0 0 24px;">
          Thanks for signing up. Click the button below to verify your email
          and activate your account. This link expires in
          <strong style="color:#fff;">24 hours</strong>.
        </p>

        <div style="text-align:center;margin:32px 0;">
          <a href="${verifyLink}"
             style="background:#a3e635;color:#000;padding:14px 32px;border-radius:8px;
                    text-decoration:none;font-weight:bold;font-size:15px;letter-spacing:1px;">
            VERIFY EMAIL
          </a>
        </div>

        <p style="color:#555;font-size:12px;">
          If you didn't create a Vitalis account, you can safely ignore this email.
        </p>

        <p style="color:#555;font-size:11px;text-align:center;margin-top:32px;">
          © ${new Date().getFullYear()} Vitalis Performance OS
        </p>
      </div>
    `,
  };

  return sendEmail(mailOptions);
}

module.exports = {
  verifyTransport,
  sendEmail,
  sendMealSummaryEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
};
