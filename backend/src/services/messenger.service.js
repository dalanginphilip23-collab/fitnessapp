const db = require('../config/db');

async function getContacts(userId) {
  const query = `
        SELECT u.id, u.name, u.avatar_url, u.is_online, u.fitness_goal
        FROM users u
        INNER JOIN friendships f ON (f.friend_id = u.id OR f.user_id = u.id)
        WHERE (f.user_id = ? OR f.friend_id = ?) 
        AND u.id != ?
    `;
  const [rows] = await db.execute(query, [userId, userId, userId]);
  return rows;
}

async function getMessageHistory(userId, contactId) {
  const [rows] = await db.execute(
    `SELECT id, sender_id, receiver_id, content, latitude, longitude, is_read,
     DATE_FORMAT(sent_at, '%H:%i') as time,
     IF(sender_id = ?, 1, 0) as isMe
     FROM messages 
     WHERE (sender_id = ? AND receiver_id = ?) 
        OR (sender_id = ? AND receiver_id = ?)
     ORDER BY sent_at ASC`,
    [userId, userId, contactId, contactId, userId]
  );
  return rows;
}

async function sendMessage(sender_id, receiver_id, content) {
  const [result] = await db.execute(
    `INSERT INTO messages (sender_id, receiver_id, content, sent_at, is_read)
     VALUES (?, ?, ?, NOW(), 0)`,
    [sender_id, receiver_id, content.trim()]
  );
  const [rows] = await db.execute(
    `SELECT id, sender_id, receiver_id, content,
     DATE_FORMAT(sent_at, '%H:%i') as time,
     IF(sender_id = ?, 1, 0) as isMe
     FROM messages WHERE id = ?`,
    [sender_id, result.insertId]
  );
  return rows[0];
}

async function searchUsers(query, excludeId) {
  if (!query?.trim()) return [];
  let sql = 'SELECT id, name, avatar_url, is_online FROM users WHERE name LIKE ?';
  const params = [`%${query}%`];
  if (excludeId) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }
  sql += ' LIMIT 10';
  const [rows] = await db.execute(sql, params);
  return rows;
}

async function addFriend(userId, friendId) {
  return db.execute(
    'INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
    [userId, friendId, 'close_friend', 'close_friend']
  );
}

module.exports = { getContacts, getMessageHistory, sendMessage, searchUsers, addFriend };