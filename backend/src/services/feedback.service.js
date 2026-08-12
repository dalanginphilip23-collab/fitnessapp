const nodemailer = require('nodemailer');

// Escape user-supplied fields before embedding them in the HTML email so a
// visitor can't inject markup/scripts that the recipient's mail client renders.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendFeedbackEmail({ name, email, message }) {
  // TRANSPORTER
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  // EMAIL
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject: 'New Feedback Message',
    html: `
                <div style="font-family: Arial; padding: 20px;">

                    <h2>New Feedback</h2>

                    <p>
                        <strong>Name:</strong> ${escapeHtml(name)}
                    </p>

                    <p>
                        <strong>Email:</strong> ${escapeHtml(email)}
                    </p>

                    <p>
                        <strong>Message:</strong>
                    </p>

                    <div style="
                        background: #f4f4f4;
                        padding: 15px;
                        border-radius: 8px;
                    ">
                        ${escapeHtml(message)}
                    </div>

                </div>
            `,
  });
}

module.exports = { sendFeedbackEmail };
