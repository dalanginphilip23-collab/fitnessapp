const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');

function stream(req, res) {
  const { userId } = req.params;
  const userKey = String(userId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  notificationService.registerClient(userKey, res);
  logger.info(`âœ… SSE connected: user ${userId} (total: ${notificationService.clients.size})`);

  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (_) {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    notificationService.removeClient(userKey, res);
    logger.info(`âŒ SSE disconnected: user ${userId} (total: ${notificationService.clients.size})`);
  });
}

// GET notifications + unread count
// GET /api/notifications/:userId
async function getForUser(req, res) {
  const { userId } = req.params;
  try {
    const count = await notificationService.getUnreadCount(userId);
    const notifications = await notificationService.getRecentNotifications(userId);
    res.json({ count, notifications });
  } catch (err) {
    logger.error('GET /api/notifications/:userId failed:', err);
    res.status(500).json({ error: err.message });
  }
}

// CREATE notification + push to SSE client
// POST /api/notifications/
async function create(req, res) {
  const { user_id, message, type = 'info' } = req.body;

  // Fail fast with a clear message instead of letting a bad insert throw a vague 500
  if (!user_id || !message) {
    return res.status(400).json({ error: 'user_id and message are required' });
  }

  try {
    await notificationService.insertNotification(user_id, message, type);
    notificationService.pushToClient(user_id, message, type);
    res.json({ success: true });
  } catch (err) {
    logger.error('POST /api/notifications failed:', err);
    res.status(500).json({ error: err.message });
  }
}

// Mark single notification as read
// PUT /api/notifications/:id/read
async function markRead(req, res) {
  const { id } = req.params;
  try {
    await notificationService.markAsRead(id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    logger.error('PUT /api/notifications/:id/read failed:', err);
    res.status(500).json({ error: err.message });
  }
}

// Mark all as read for a user
// PUT /api/notifications/read-all/:userId
async function markAllRead(req, res) {
  const { userId } = req.params;
  try {
    await notificationService.markAllAsRead(userId);
    res.json({ success: true });
  } catch (err) {
    logger.error('PUT /api/notifications/read-all/:userId failed:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { stream, getForUser, create, markRead, markAllRead };
