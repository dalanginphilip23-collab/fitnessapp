const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const clients = new Map();

router.get('/stream/:userId', (req, res) => {
  const { userId } = req.params;
  const userKey = String(userId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Close any existing connection for this user (e.g. tab reload / remount)
  const existing = clients.get(userKey);
  if (existing) {
    try { existing.end(); } catch (_) {}
  }

  clients.set(userKey, res);
  console.log(`✅ SSE connected: user ${userId} (total: ${clients.size})`);


  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (_) {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    if (clients.get(userKey) === res) {
      clients.delete(userKey);
    }
    console.log(`❌ SSE disconnected: user ${userId} (total: ${clients.size})`);
  });
});


// GET notifications + unread count
// GET /api/notifications/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [[result]] = await db.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    const [notifications] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [userId]
    );
    res.json({ count: result.count, notifications });
  } catch (err) {
    console.error('GET /api/notifications/:userId failed:', err);
    res.status(500).json({ error: err.message });
  }
});


// CREATE notification + push to SSE client
// POST /api/notifications/
router.post('/', async (req, res) => {
  const { user_id, message, type = 'info' } = req.body;

  // Fail fast with a clear message instead of letting a bad insert throw a vague 500
  if (!user_id || !message) {
    return res.status(400).json({ error: 'user_id and message are required' });
  }

  try {
    await db.execute(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
      [user_id, message, type]
    );

    const client = clients.get(String(user_id));
    if (client) {
      try {
        client.write(`data: ${JSON.stringify({ message, type })}\n\n`);
      } catch (writeErr) {
        // Client disconnected between the map lookup and the write — clean up
        clients.delete(String(user_id));
        console.warn(`SSE write failed for user ${user_id}, removed from clients`);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/notifications failed:', err);
    res.status(500).json({ error: err.message });
  }
});


// Mark single notification as read
// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/notifications/:id/read failed:', err);
    res.status(500).json({ error: err.message });
  }
});


// Mark all as read for a user
// PUT /api/notifications/read-all/:userId
router.put('/read-all/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await db.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/notifications/read-all/:userId failed:', err);
    res.status(500).json({ error: err.message });
  }
});

router.clients = clients;
module.exports = router;