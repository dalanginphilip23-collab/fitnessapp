// NOTE: this file is not mounted anywhere (see app.js) — the Social
// frontend talks to the messenger routes instead, and this module's
// GET /messages/:userId/:friendId duplicates that functionality. The
// import below was previously broken (`require('../db')` — no such file).
const db = require('../config/db');

async function getMessages(userId, friendId) {
  const [messages] = await db.execute(
    `SELECT * FROM messages 
     WHERE (sender_id = ? AND receiver_id = ?) 
     OR (sender_id = ? AND receiver_id = ?) 
     ORDER BY sent_at ASC`,
    [userId, friendId, friendId, userId]
  );
  return messages;
}

module.exports = { getMessages };
