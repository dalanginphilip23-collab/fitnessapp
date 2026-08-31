const { sendEmail } = require("../services/mail");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendFeedbackEmail({ name, email, message }) {
  const receiverEmail = process.env.RECEIVER_EMAIL;
  if (!receiverEmail) {
    throw new Error('RECEIVER_EMAIL environment variable is not configured');
  }
  await sendEmail({
    to: receiverEmail,
    subject: "New Feedback Message",
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
