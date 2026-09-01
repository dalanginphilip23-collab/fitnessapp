const jwt = require('jsonwebtoken');
const db = require('../config/db');
const logger = require('../utils/logger');

const COOKIE_NAME = 'vitalis_session';

// Extracts and verifies the JWT from the Socket.IO handshake. The app stores
// the session in an httpOnly cookie, so the cookie is the primary source; a
// `token` in handshake.auth is accepted as a fallback for non-browser clients.
function getUserIdFromHandshake(socket) {
  if (socket.handshake.auth && socket.handshake.auth.token) {
    try {
      const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      return decoded.id;
    } catch {
      return null;
    }
  }

  const cookies = socket.handshake.headers && socket.handshake.headers.cookie;
  if (cookies) {
    const match = cookies
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (match) {
      const token = match.slice(COOKIE_NAME.length + 1);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        return decoded.id;
      } catch {
        return null;
      }
    }
  }

  return null;
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        const authenticatedUserId = getUserIdFromHandshake(socket);

        if (authenticatedUserId == null) {
            socket.emit('auth-error', { message: 'Not authenticated' });
            socket.disconnect(true);
            return;
        }

        // Prevent a client from impersonating another user on any socket event.
        socket.userId = String(authenticatedUserId);

        // Simple per-socket chat rate limit (e.g. 10 messages / 5 seconds).
        let chatTimestamps = [];
        const isChatRateLimited = () => {
            const now = Date.now();
            chatTimestamps = chatTimestamps.filter((t) => now - t < 5000);
            if (chatTimestamps.length >= 10) return true;
            chatTimestamps.push(now);
            return false;
        };

        logger.info('User Connected:', socket.id, '-> user', socket.userId);

        socket.on('join-room', (userId) => {
            // Only ever let a user join their own private room.
            if (String(userId) !== socket.userId) {
                return socket.emit('auth-error', { message: 'Forbidden room' });
            }
            socket.join(`user_${socket.userId}`);
            logger.info(`User ${socket.userId} joined private room user_${socket.userId}`);
        });

        socket.on('send-chat', async (msg) => {
            const { sender_id, receiver_id, content, latitude, longitude } = msg;

            if (!sender_id || String(sender_id) !== socket.userId) {
                return socket.emit('chat-error', { message: 'Forbidden: sender does not match session' });
            }
            if (!receiver_id || !content || !content.trim()) {
                return socket.emit('chat-error', { message: 'Missing receiver or content' });
            }
            if (isChatRateLimited()) {
                return socket.emit('chat-error', { message: 'Slow down â€” too many messages' });
            }

            try {
                const [result] = await db.execute(
                    `INSERT INTO messages (sender_id, receiver_id, content, latitude, longitude, is_read, sent_at) 
                     VALUES (?, ?, ?, ?, ?, 0, NOW())`,
                    [sender_id, receiver_id, content.trim(), latitude || null, longitude || null]
                );
                io.to(`user_${receiver_id}`).emit('receive-chat', {
                    id: result.insertId, sender_id, receiver_id, content, latitude, longitude,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: false
                });
            } catch (err) {
                logger.error("SQL Insert Error:", err);
            }
        });

        socket.on('share-location', (data) => {
            // Emit only to the user's private room (their own connected devices)
            // instead of broadcasting to all users. Friends receive location
            // via a separate request or a targeted room mechanism.
            io.to(`user_${socket.userId}`).emit('friend-moved', data);
        });

        socket.on('send-pose-alert', async (data) => {
            const { sessionId, issueType, feedbackText, userId } = data;

            if (!userId || String(userId) !== socket.userId) {
                return socket.emit('auth-error', { message: 'Forbidden: user does not match session' });
            }

            if (isChatRateLimited()) {
                return socket.emit('auth-error', { message: 'Slow down â€” too many requests' });
            }

            try {
                const [[session]] = await db.execute(
                    `SELECT user_id FROM coaching_sessions WHERE id = ?`,
                    [sessionId]
                );
                if (!session || String(session.user_id) !== socket.userId) {
                    return socket.emit('auth-error', { message: 'Forbidden: session does not belong to you' });
                }

                await db.execute(
                    `INSERT INTO posture_alerts (user_id, alert_type) VALUES (?, ?)`,
                    [socket.userId, issueType]
                );
                io.to(`user_${socket.userId}`).emit('new-clinical-insight', {
                    text: feedbackText, type: issueType, time: new Date().toLocaleTimeString()
                });
            } catch (err) {
                logger.error("Alert Save Error:", err);
            }
        });

        socket.on('disconnect', () => logger.info('User disconnected:', socket.id));
    });
};