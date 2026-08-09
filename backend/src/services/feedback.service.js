const nodemailer = require('nodemailer');

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
                        <strong>Name:</strong> ${name}
                    </p>

                    <p>
                        <strong>Email:</strong> ${email}
                    </p>

                    <p>
                        <strong>Message:</strong>
                    </p>

                    <div style="
                        background: #f4f4f4;
                        padding: 15px;
                        border-radius: 8px;
                    ">
                        ${message}
                    </div>

                </div>
            `,
  });
}

module.exports = { sendFeedbackEmail };
