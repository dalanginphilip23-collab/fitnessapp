const jwt = require('jsonwebtoken');
const db = require('../config/db');

const COOKIE_NAME = 'vitalis_session';

// Socket.io exposes the handshake as raw headers, so parse the session
// cookie manually instead of depending on express cookie-parser.
function parseCookies(header) {
  if (!header) return {};
  return header.split(';').reduce((cookies, part) => {
    const [key, ...rest] = part.trim().split('=');
    if (!key) return cookies;
    cookies[key] = rest.join('=');
    return cookies;
  }, {});
}

module.exports = (io) => {
    // Refuse connections without a valid session — every event below
    // binds the acting user from the verified token, never from the client.
    io.use((socket, next) => {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        const token = cookies[COOKIE_NAME];
        if (!token) return next(new Error('Not authenticated'));

        try {
            socket.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
            next();
        } catch {
            next(new Error('Invalid session'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User Connected:', socket.id);

        socket.on('join-room', () => {
            socket.join(`user_${socket.user.id}`);
            console.log(`User ${socket.user.id} joined private room user_${socket.user.id}`);
        });

        socket.on('send-chat', async (msg) => {
            const { receiver_id, content, latitude, longitude } = msg;
            if (!receiver_id || !content?.trim()) return;

            const sender_id = socket.user.id;
            try {
                const [result] = await db.execute(
                    `INSERT INTO messages (sender_id, receiver_id, content, latitude, longitude, is_read, sent_at) 
                     VALUES (?, ?, ?, ?, ?, 0, NOW())`,
                    [sender_id, receiver_id, content, latitude || null, longitude || null]
                );
                io.to(`user_${receiver_id}`).emit('receive-chat', {
                    id: result.insertId, sender_id, receiver_id, content, latitude, longitude,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: false
                });
            } catch (err) {
                console.error("SQL Insert Error:", err);
            }
        });

        socket.on('share-location', (data) => {
            socket.broadcast.emit('friend-moved', data);
        });

        socket.on('send-pose-alert', async (data) => {
            const { sessionId, issueType, feedbackText } = data;
            const userId = socket.user.id;
            try {
                await db.execute(
                    `INSERT INTO posture_alerts (session_id, issue_type, feedback_text) VALUES (?, ?, ?)`,
                    [sessionId, issueType, feedbackText]
                );
                io.to(`user_${userId}`).emit('new-clinical-insight', {
                    text: feedbackText, type: issueType, time: new Date().toLocaleTimeString()
                });
            } catch (err) {
                console.error("Alert Save Error:", err);
            }
        });

        socket.on('disconnect', () => console.log('User disconnected'));
    });
};
