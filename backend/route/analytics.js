const express = require('express');
const router = express.Router();
const db = require('../config/db');

// SUMMARY 
router.get('/summary/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.execute(`
            SELECT 
                ROUND(AVG(sleep_quality), 1)   as hrv,
                ROUND(AVG(recovery_score), 1)  as vo2_max,
                ROUND(AVG(sleep_duration), 1)  as stress
            FROM sleep_logs
            WHERE user_id = ?
              AND recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
            [userId]
        );
        res.json(rows[0] || { vo2_max: 0, hrv: 0, stress: 0 });
    } catch (err) {
        console.error('[Summary] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

//  ZONES 
router.get('/zones/:userId', async (req, res) => {
    const { userId } = req.params;
    const { timeframe = 'weekly' } = req.query;

    const intervalMap = {
        weekly:    '7 DAY',
        monthly:   '30 DAY',
        quarterly: '90 DAY',
    };
    const interval = intervalMap[timeframe.toLowerCase()] || '7 DAY';

    try {
        const [rows] = await db.execute(`
            SELECT 
                CASE 
                    WHEN workout_type IN ('HIIT', 'Sprinting', 'Boxing')       THEN 5
                    WHEN workout_type IN ('Running', 'Cycling', 'Jump Rope')   THEN 4
                    WHEN workout_type IN ('Jogging', 'Swimming', 'Rowing')     THEN 3
                    WHEN workout_type IN ('Walking', 'Yoga', 'Stretching')     THEN 1
                    ELSE 2
                END as zone,
                CASE 
                    WHEN workout_type IN ('HIIT', 'Sprinting', 'Boxing')       THEN 'Zone 5 (Anaerobic)'
                    WHEN workout_type IN ('Running', 'Cycling', 'Jump Rope')   THEN 'Zone 4 (Threshold)'
                    WHEN workout_type IN ('Jogging', 'Swimming', 'Rowing')     THEN 'Zone 3 (Tempo)'
                    WHEN workout_type IN ('Walking', 'Yoga', 'Stretching')     THEN 'Zone 1 (Recovery)'
                    ELSE 'Zone 2 (Aerobic Base)'
                END as label,
                COUNT(*) as minutes,
                ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 0) as pct
            FROM workout_logs
            WHERE user_id = ?
              AND start_time >= DATE_SUB(NOW(), INTERVAL ${interval})
              AND status = 'completed'
            GROUP BY zone, label
            ORDER BY zone DESC`,
            [userId]
        );

        if (!rows.length) return res.json([]);

        res.json(rows.map(row => ({
            zone:    row.zone,
            label:   row.label,
            minutes: row.minutes,
            value:   `${row.pct}%`,
        })));

    } catch (err) {
        console.error('[Zones] Error:', err.message);
        res.json([]);
    }
});

// VO2 
router.get('/vo2/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.execute(`
            SELECT 
                recovery_score as value,
                DATE_FORMAT(recorded_at, '%m/%d') as date
            FROM sleep_logs
            WHERE user_id = ?
              AND recovery_score > 0
            ORDER BY recorded_at ASC
            LIMIT 7`,
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error('[VO2] Error:', err.message);
        res.json([]);
    }
});

module.exports = router;