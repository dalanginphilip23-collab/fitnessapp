const nodemailer = require('nodemailer');
const db = require('../config/db');

async function ensureFeedbackTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        message text NOT NULL,
        email_status varchar(20) DEFAULT 'pending',
        created_at datetime DEFAULT current_timestamp(),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (err) {
    console.error('ensureFeedbackTable failed:', err.message);
  }
}

ensureFeedbackTable();

async function storeFeedback({ name, email, message }) {
  const [result] = await db.query(
    'INSERT INTO feedback (name, email, message, email_status) VALUES (?, ?, ?, ?)',
    [name, email, message, 'pending']
  );
  return result.insertId;
}

async function markEmailStatus(id, status) {
  try {
    await db.query('UPDATE feedback SET email_status = ? WHERE id = ?', [status, id]);
  } catch (_) {}
}

async function sendFeedbackEmail({ id, name, email, message }) {
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

  try {
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
    await markEmailStatus(id, 'sent');
  } catch (err) {
    await markEmailStatus(id, 'failed');
    throw err;
  }
}

module.exports = { storeFeedback, sendFeedbackEmail, markEmailStatus };
