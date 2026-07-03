const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyUser = require('../middleware/verifyUser');

console.log('verifyUser type:', typeof verifyUser);

// GET /api/security - fetch all sessions for the logged in user
router.get('/', verifyUser, async (req, res) => {
    const userId = req.user.id;

    try {
        // aliased to match what SecurityCard expects on the frontend
        const [rows] = await db.execute(`
            SELECT
                id,
                device      AS device_type,
                browser,
                os,
                ip_address,
                city,
                country,
                created_at  AS last_active,
                is_current
            FROM user_sessions
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);

        res.json(rows);

    } catch (err) {
        console.error('fetch sessions error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/security/:sessionId - remove a specific session
router.delete('/:sessionId', verifyUser, async (req, res) => {
    const userId = req.user.id;
    const { sessionId } = req.params;

    try {
        // user_id check makes sure you can only delete your own sessions
        await db.execute(`
            DELETE FROM user_sessions
            WHERE id = ? AND user_id = ?
        `, [sessionId, userId]);

        res.json({ success: true, message: 'Session removed' });

    } catch (err) {
        console.error('delete session error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;