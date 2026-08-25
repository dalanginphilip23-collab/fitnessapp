// NOTE: originally dead code with broken import `require('../db')`.
// Fixed to `../config/db` as part of hygiene pass — file remains unmounted
// (intentionally preserved) but is now importable without crashing if wired.
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
