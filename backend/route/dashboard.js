const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/dashboard/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [stats] = await db.execute(
            `SELECT calories_burned, steps, workout_duration_mins
             FROM daily_stats 
             WHERE user_id = ? AND stat_date = CURDATE()`,
            [userId]
        );

        const [user] = await db.execute(
            `SELECT name, fitness_goal, avatar_url
             FROM users
             WHERE id = ?`,
            [userId]
        );

        const [sleepData] = await db.execute(
            `SELECT DATE_FORMAT(recorded_at, '%H:%i') AS label, AVG(sleep_duration) AS value
             FROM sleep_logs
             WHERE user_id = ? AND DATE(recorded_at) = CURDATE()
             GROUP BY label ORDER BY label ASC LIMIT 20`,
            [userId]
        );

        res.json({
            stats:    stats[0]  || { calories_burned: 0, steps: 0, workout_duration_mins: 0, water_intake_ml: 0 },
            profile:  user[0]   || { name: "Guest" },
            hrv_data: sleepData || []
        });

    } catch (e) {
        console.error('DASHBOARD ERROR:', e.message);
        console.error('DASHBOARD STACK:', e.stack);
        res.status(500).json({ error: e.message });
    }
});

router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const [results] = await db.execute(
            'SELECT name, avatar_url FROM users WHERE name LIKE ? LIMIT 5',
            [`%${q}%`]
        );
        res.json(results);
    } catch (e) {
        console.error('SEARCH ERROR:', e.message);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;