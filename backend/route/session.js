const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');

const COOKIE_NAME = 'vitalis_session';

// auth middleware using the same cookie pattern as the rest of the app
function requireAuth(req, res, next) {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.clearCookie(COOKIE_NAME);
        return res.status(401).json({ message: 'Session expired' });
    }
}

// POST /api/workout-sessions/start
router.post('/start', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const planId = req.body.plan_id ?? null;

    try {
        const [result] = await db.execute(
            `INSERT INTO workout_sessions (user_id, plan_id, status)
             VALUES (?, ?, 'active')`,
            [userId, planId]
        );

        const sessionId = result.insertId;
        const [[session]] = await db.execute(
            `SELECT id, start_time FROM workout_sessions WHERE id = ?`,
            [sessionId]
        );

        res.status(201).json({
            session_id: session.id,
            start_time: session.start_time,
        });

    } catch (err) {
        console.error('start session error:', err.message);
        res.status(500).json({ message: 'Failed to start session: ' + err.message });
    }
});

// PATCH /api/workout-sessions/:id/end
router.patch('/:id/end', requireAuth, async (req, res) => {
    const sessionId = parseInt(req.params.id, 10);
    const userId    = req.user.id;
    const status    = req.body.status === 'cancelled' ? 'cancelled' : 'completed';

    if (!sessionId || isNaN(sessionId)) {
        return res.status(400).json({ message: 'Invalid session id' });
    }

    try {
        const [[existing]] = await db.execute(
            `SELECT id, user_id, status FROM workout_sessions WHERE id = ? AND user_id = ?`,
            [sessionId, userId]
        );

        if (!existing) {
            return res.status(404).json({ message: 'Session not found' });
        }


        if (existing.status !== 'active') {
            return res.status(409).json({ message: `Session already ${existing.status}` });
        }

        await db.execute(
            `UPDATE workout_sessions
             SET end_time = NOW(), status = ?
             WHERE id = ?`,
            [status, sessionId]
        );


        const [[updated]] = await db.execute(
            `SELECT id,
                    start_time,
                    end_time,
                    status,
                    TIMESTAMPDIFF(SECOND, start_time, end_time) AS duration_seconds
             FROM workout_sessions
             WHERE id = ?`,
            [sessionId]
        );

        res.json({
            session_id:       updated.id,
            start_time:       updated.start_time,
            end_time:         updated.end_time,
            status:           updated.status,
            duration_seconds: updated.duration_seconds,
        });

    } catch (err) {
        console.error('end session error:', err.message);
        res.status(500).json({ message: 'Failed to end session: ' + err.message });
    }
});

// GET /api/workout-sessions
router.get('/', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const limit  = Math.min(parseInt(req.query.limit,  10) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0,  0);

    try {
        const [sessions] = await db.execute(
            `SELECT id,
                    plan_id,
                    start_time,
                    end_time,
                    status,
                    TIMESTAMPDIFF(SECOND, start_time, end_time) AS duration_seconds
             FROM workout_sessions
             WHERE user_id = ?
             ORDER BY start_time DESC
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );


        const [[{ total }]] = await db.execute(
            `SELECT COUNT(*) AS total FROM workout_sessions WHERE user_id = ?`,
            [userId]
        );

        res.json({ sessions, total, limit, offset });

    } catch (err) {
        console.error('fetch sessions error:', err.message);
        res.status(500).json({ message: 'Failed to fetch sessions: ' + err.message });
    }
});

module.exports = router;