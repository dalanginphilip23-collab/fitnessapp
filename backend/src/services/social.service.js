// NOTE: this route file is NOT mounted anywhere in server.js/app.js —
// it was already dead code in the original project. It also has a
// broken import here (`require('../db')` — there is no db.js at that
// path, it should be `require('../config/db')`). Preserved exactly as
// found, per "don't change any logic" instructions. Flagging this for
// you to decide whether to wire it up (and fix the import) or delete it.
const db = require('../db');

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
