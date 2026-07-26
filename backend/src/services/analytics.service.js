const db = require('../config/db');

async function getSummary(userId) {
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
  return rows[0];
}

const INTERVAL_MAP = {
  weekly: '7 DAY',
  monthly: '30 DAY',
  quarterly: '90 DAY',
};

async function getZones(userId, timeframe) {
  const interval = INTERVAL_MAP[timeframe.toLowerCase()] || '7 DAY';

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

  return rows;
}

async function getVo2(userId) {
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
  return rows;
}

module.exports = { getSummary, getZones, getVo2 };
