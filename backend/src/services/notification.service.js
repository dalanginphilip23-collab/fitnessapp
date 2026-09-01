const db = require('../config/db');
const clients = require('./sseClients');
const logger = require('../utils/logger');

function registerClient(userKey, res) {
  // Close any existing connection for this user (e.g. tab reload / remount)
  const existing = clients.get(userKey);
  if (existing) {
    try { existing.end(); } catch (_) {}
  }
  clients.set(userKey, res);
}

function removeClient(userKey, res) {
  if (clients.get(userKey) === res) {
    clients.delete(userKey);
  }
}

async function getUnreadCount(userId) {
  const [[result]] = await db.execute(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );
  return result.count;
}

async function getRecentNotifications(userId) {
  const [notifications] = await db.execute(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
    [userId]
  );
  return notifications;
}

async function insertNotification(user_id, message, type) {
  return db.execute(
    'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
    [user_id, message, type]
  );
}

function pushToClient(userId, message, type) {
  const client = clients.get(String(userId));
  if (client) {
    try {
      client.write(`data: ${JSON.stringify({ message, type })}\n\n`);
    } catch (writeErr) {
      // Client disconnected between the map lookup and the write â€” clean up
      clients.delete(String(userId));
      logger.warn(`SSE write failed for user ${userId}, removed from clients`);
    }
  }
}

async function markAsRead(id, userId) {
  return db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
}

async function markAllAsRead(userId) {
  return db.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
}

module.exports = {
  clients,
  registerClient,
  removeClient,
  getUnreadCount,
  getRecentNotifications,
  insertNotification,
  pushToClient,
  markAsRead,
  markAllAsRead,
};
