// ─────────────────────────────────────────────────────────────────────────────
// One-shot SMTP test for the Vitalis Gmail account.
//
// Usage:
//   node scripts/test-email.js you@example.com
//
// It sends a simple verification-style email and reports success/failure so
// you can confirm EMAIL_USER / EMAIL_PASS in backend/.env are valid BEFORE
// redeploying. A failed send almost always means the App Password is wrong or
// 2-Step Verification is off on the Gmail account.
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config();

const { transporter } = require('../src/config/mailer');

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error('Usage: node scripts/test-email.js you@example.com');
    process.exit(1);
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error(
      '[TEST-EMAIL] EMAIL_USER / EMAIL_PASS are not set in backend/.env',
    );
    process.exit(1);
  }

  console.log(`[TEST-EMAIL] Verifying SMTP connection for ${process.env.EMAIL_USER}...`);

  try {
    await transporter.verify();
    console.log('[TEST-EMAIL] SMTP connection OK.');
  } catch (err) {
    console.error(
      `[TEST-EMAIL] SMTP verify FAILED: ${err.message}\n` +
        'Fix EMAIL_PASS in backend/.env (16-char Gmail App Password, requires 2-Step Verification).',
    );
    process.exit(1);
  }

  const mailOptions = {
    from: `"Vitalis" <${process.env.EMAIL_USER}>`,
    to,
    subject: '✅ Vitalis Test Email',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f0f;padding:32px;border-radius:12px;">
        <h1 style="color:#a3e635;margin:0;font-size:22px;letter-spacing:2px;">VITALIS</h1>
        <p style="color:#aaa;font-size:14px;">
          This is a test email. Your SMTP configuration is working correctly.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[TEST-EMAIL] Sent successfully. Message ID: ${info.messageId}`);
    console.log(`[TEST-EMAIL] Check the inbox for ${to} (and spam).`);
    process.exit(0);
  } catch (err) {
    console.error(`[TEST-EMAIL] sendMail FAILED: ${err.message}`);
    process.exit(1);
  }
}

main();
