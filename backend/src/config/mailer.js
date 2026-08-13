const nodemailer = require("nodemailer");
const dns = require("dns");
const tls = require("tls");

// Force Node to prefer IPv4 for DNS lookups globally (safe fix for Render)
dns.setDefaultResultOrder("ipv4first");

// ─── TRANSPORTER (LAZY + IPv4-PINNED + MULTI-ENDPOINT FALLBACK) ──────────────
// smtp.gmail.com has AAAA (IPv6) records. On hosts like Render the IPv6 route
// is unreachable, so nodemailer fails with "connect ENETUNREACH <ipv6>:465".
// We fix that by pinning a literal IPv4 address (the real hostname is still
// used for EHLO/SNI/cert validation via `name`, `servername` and
// checkServerIdentity). We also try several endpoints in order (587 STARTTLS
// then 465 SSL, IPv4-pinned then hostname) because some networks block one
// port or one Google IP. The first endpoint that fully handshakes (`verify()`)
// becomes the active transporter, so every send uses a proven-working
// connection. A Proxy keeps the `transporter` API identical for callers.
let initPromise = null;
let lastFailure = null;
let lastFailureAt = 0;

async function resolveIPv4(host) {
  try {
    const { address } = await dns.promises.lookup(host, { family: 4 });
    return address;
  } catch {
    return host; // fall back to the hostname if resolution fails
  }
}

function candidateConfigs(ip) {
  return [
    { host: ip, name: "smtp.gmail.com", port: 587, secure: false, requireTLS: true },
    { host: ip, name: "smtp.gmail.com", port: 465, secure: true },
    { host: "smtp.gmail.com", name: "smtp.gmail.com", port: 587, secure: false, requireTLS: true },
    { host: "smtp.gmail.com", name: "smtp.gmail.com", port: 465, secure: true },
  ];
}

function buildTransport(cfg) {
  return nodemailer.createTransport({
    ...cfg,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Because `host` is a literal IPv4 address, TLS must identify itself with
    // the real hostname (SNI + cert validation against smtp.gmail.com).
    tls: {
      servername: "smtp.gmail.com",
      checkServerIdentity: (servername, cert) =>
        tls.checkServerIdentity("smtp.gmail.com", cert),
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

async function getTransporter() {
  const ip = await resolveIPv4("smtp.gmail.com");
  console.log(`[MAILER] smtp.gmail.com resolved to IPv4 ${ip}`);

  let lastErr = null;
  for (const cfg of candidateConfigs(ip)) {
    try {
      const t = buildTransport(cfg);
      await t.verify();
      console.log(`[MAILER] connected OK via ${cfg.name}:${cfg.port} (host=${cfg.host})`);
      return t;
    } catch (err) {
      lastErr = err;
      console.error(`[MAILER] endpoint ${cfg.name}:${cfg.port} (host=${cfg.host}) failed: ${err.code || err.message}`);
    }
  }
  throw new Error(`Gmail SMTP unreachable (tried 587/465): ${lastErr.code || lastErr.message}`);
}

function ensureTransporter() {
  // After a failed scan, fail fast for 60s instead of rescanning every request.
  if (Date.now() - lastFailureAt < 60000 && lastFailure) {
    return Promise.reject(lastFailure);
  }
  if (!initPromise) {
    initPromise = getTransporter().catch((err) => {
      initPromise = null; // allow a later call to retry after a transient failure
      lastFailure = err;
      lastFailureAt = Date.now();
      throw err;
    });
  }
  return initPromise;
}

const transporter = new Proxy(
  {},
  {
    get(_, prop) {
      return (...args) => ensureTransporter().then((t) => t[prop](...args));
    },
  },
);

// CONNECTION CHECK
// Verifies the SMTP credentials once at boot so a bad/expired Gmail App Password
// fails loudly instead of all verification emails silently going nowhere.
// If EMAIL_USER/EMAIL_PASS are not configured, SMTP is skipped entirely and the
// system relies on the HTTP providers (Brevo then Resend).
async function verifyTransport() {
  const httpConfigured = Boolean(
    process.env.BREVO_API_KEY || process.env.RESEND_API_KEY,
  );

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    if (httpConfigured) {
      console.log(
        "[MAILER] Gmail SMTP not configured — using HTTP email API (Brevo/Resend).",
      );
      return true;
    }
    console.warn(
      "[MAILER] No email provider configured (set EMAIL_USER/EMAIL_PASS for SMTP, or BREVO_API_KEY / RESEND_API_KEY). Email sending is disabled.",
    );
    return false;
  }

  try {
    await transporter.verify();
    console.log(
      `[MAILER] SMTP connection verified (${process.env.EMAIL_USER}).`,
    );
    return true;
  } catch (err) {
    if (httpConfigured) {
      console.warn(
        "[MAILER] SMTP unavailable (host may block outbound SMTP); will use HTTP email API (Brevo/Resend) instead.",
        err.code || err.message,
      );
      return true;
    }
    console.error(
      "[MAILER] SMTP connection FAILED — check EMAIL_PASS (Gmail requires a 16-char App Password with 2-Step Verification enabled):",
      err.message,
    );
    return false;
  }
}

// ─── RESEND FALLBACK (HTTP API on port 443) ───────────────────────────────────
// Render's network blocks ALL outbound SMTP (ports 25/465/587 drop every
// provider). HTTPS still works, so when SMTP fails we re-send the same email
// through Resend's REST API. Requires RESEND_API_KEY (from resend.com/api-keys).
// For testing without a custom domain, Resend allows sending from
// "onboarding@resend.dev"; set RESEND_FROM once you verify a domain.
async function sendViaResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const from = process.env.RESEND_FROM || "onboarding@resend.dev";
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Vitalis <${from}>`,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`Resend API error ${resp.status}: ${JSON.stringify(data)}`);
  }
  return { messageId: data.id };
}

// ─── BREVO FALLBACK (HTTP API on port 443) ────────────────────────────────────
// Preferred HTTP sender. Brevo delivers to ANY recipient once the FROM address
// (BREVO_SENDER_EMAIL or BREVO_FROM) is a verified sender in the Brevo dashboard
// (Settings > Senders & IP). Note: Brevo does NOT accept free-email senders like
// @gmail.com — the sender needs a domain you control (a free subdomain such as
// is-a.dev works). Requires BREVO_API_KEY (xkeysib-...) from
// app.brevo.com/settings/keys/api. Both naming conventions are accepted so the
// configured Render env names don't matter.
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
// Uses Gmail SMTP only when EMAIL_USER/EMAIL_PASS are configured; otherwise it
// skips SMTP entirely and sends via the HTTP API providers: Brevo first (if
// configured) then Resend. This allows a pure-Brevo deployment with no Gmail
// configuration at all.
async function sendEmail(mailOptions) {
  const mail = {
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
  };

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (smtpErr) {
      console.warn(
        "[MAILER] SMTP failed, falling back to HTTP API:",
        smtpErr.code || smtpErr.message,
      );
    }
  } else {
    console.log("[MAILER] No Gmail SMTP configured — using HTTP email API.");
  }

  if (process.env.BREVO_API_KEY) {
    return sendViaBrevo(mail);
  }
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(mail);
  }
  throw new Error(
    "No email provider configured (set EMAIL_USER/EMAIL_PASS for SMTP, or BREVO_API_KEY / RESEND_API_KEY).",
  );
}

// ─── MEAL SUMMARY EMAIL ──────────────────────────────────────────────────────
async function sendMealSummaryEmail(to, summary) {
  const mailOptions = {
    from: `"Vitalis" <${process.env.EMAIL_USER}>`,
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
    from: `"Vitalis" <${process.env.EMAIL_USER}>`,
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
    from: `"Vitalis" <${process.env.EMAIL_USER}>`,
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

  return transporter.sendMail(mailOptions);
}

// ─── EMAIL VERIFICATION ───────────────────────────────────────────────────────
async function sendVerificationEmail(to, verifyLink) {
  const mailOptions = {
    from: `"Vitalis" <${process.env.EMAIL_USER}>`,
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
  transporter,
  verifyTransport,
  sendMealSummaryEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
};
