// ─────────────────────────────────────────────────────────────────────────────
// One-shot email test for Vitalis.
//
// Usage:
//   node scripts/test-email.js you@example.com
//
// It sends a simple verification-style email through the HTTP API provider
// (Brevo first, then Resend) and reports the result. No SMTP/Gmail config is
// needed — just BREVO_API_KEY (or RESEND_API_KEY) in backend/.env.
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config();

const { sendEmail } = require('../src/config/mailer');

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error('Usage: node scripts/test-email.js you@example.com');
    process.exit(1);
  }

  if (!process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY) {
    console.error(
      '[TEST-EMAIL] No provider configured — set BREVO_API_KEY or RESEND_API_KEY in backend/.env',
    );
    process.exit(1);
  }

  console.log(
    `[TEST-EMAIL] Sending via ${process.env.BREVO_API_KEY ? 'Brevo' : 'Resend'} to ${to}...`,
  );

  try {
    const info = await sendEmail({
      to,
      subject: '✅ Vitalis Test Email',
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f0f;padding:32px;border-radius:12px;">
        <h1 style="color:#a3e635;margin:0;font-size:22px;letter-spacing:2px;">VITALIS</h1>
        <p style="color:#aaa;font-size:14px;">
          This is a test email. Your email provider is working correctly.
        </p>
      </div>
    `,
    });
    console.log(`[TEST-EMAIL] Sent successfully. Message ID: ${info.messageId}`);
    console.log(`[TEST-EMAIL] Check the inbox for ${to} (and spam).`);
    process.exit(0);
  } catch (err) {
    console.error(`[TEST-EMAIL] Send FAILED: ${err.message}`);
    process.exit(1);
  }
}

main();