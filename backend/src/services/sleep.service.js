const db = require('../config/db');

async function insertLog(userId, sleep_duration, sleep_quality, recovery_score, water_intake_ml) {
  return db.execute(
    `INSERT INTO sleep_logs 
    (user_id, sleep_duration, sleep_quality, recovery_score, water_intake_ml)
    VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      Number(sleep_duration) || 0,
      Number(sleep_quality) || 0,
      Number(recovery_score) || 0,
      Number(water_intake_ml) || 0
    ]
  );
}

async function getTodayLatest(userId) {
  const [rows] = await db.execute(
    `SELECT sleep_duration, sleep_quality, recovery_score, water_intake_ml, recorded_at
     FROM sleep_logs
     WHERE user_id = ?
     AND sleep_duration > 0
     AND DATE(recorded_at) = CURDATE()
     ORDER BY recorded_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows;
}

const METRIC_MAP = { duration: 'sleep_duration', quality: 'sleep_quality', recovery: 'recovery_score' };

async function getGraph(userId, range, metric) {
  const interval = range === 'W' ? '7 DAY' : range === 'M' ? '30 DAY' : '1 DAY';
  const column = METRIC_MAP[metric] ?? 'sleep_duration';
  const isDaily = range === 'D';
  const labelFormat = isDaily ? '%H:%i' : '%m/%d';

  let query;
  if (isDaily) {
    // Calendar-day boundary (resets at local midnight, matches getTodayLatest
    // and the rest of the app) instead of a rolling "last 24 hours" window,
    // which never resets and lets last night's data bleed into today.
    query = `SELECT DATE_FORMAT(recorded_at, '${labelFormat}') AS label,
                    ${column} AS value
             FROM sleep_logs
             WHERE user_id = ?
               AND DATE(recorded_at) = CURDATE()
               AND ${column} > 0
             ORDER BY recorded_at ASC`;
  } else {
    query = `SELECT DATE_FORMAT(recorded_at, '${labelFormat}') AS label,
                    AVG(${column}) AS value
             FROM sleep_logs
             WHERE user_id = ?
               AND recorded_at >= DATE_SUB(NOW(), INTERVAL ${interval})
               AND ${column} > 0
             GROUP BY DATE_FORMAT(recorded_at, '${labelFormat}')
             ORDER BY MIN(recorded_at) ASC`;
  }

  const [rows] = await db.execute(query, [userId]);
  return rows;
}

const ANALYSIS_MAP = {
  sleep_hours: 'sleep_duration',
  recovery_score: 'recovery_score',
  efficiency: 'sleep_quality',
};

async function getAnalysis(userId, range, metric) {
  const column = ANALYSIS_MAP[metric] || 'sleep_duration';
  const isDaily = range === 'D';
  const interval = range === 'W' ? '7 DAY' : range === 'M' ? '30 DAY' : '1 DAY';
  const labelFormat = isDaily ? '%H:%i' : (range === 'W' ? '%a' : '%m/%d');

  // Daily view uses a calendar-day boundary (resets at local midnight) to
  // match getGraph/getTodayLatest, instead of a rolling 24-hour window.
  const dateFilter = isDaily
    ? 'DATE(recorded_at) = CURDATE()'
    : `recorded_at >= DATE_SUB(NOW(), INTERVAL ${interval})`;

  const [rows] = await db.execute(
    `SELECT DATE_FORMAT(recorded_at, '${labelFormat}') AS label, 
            AVG(${column}) AS value
     FROM sleep_logs
     WHERE user_id = ? 
       AND ${dateFilter}
     GROUP BY DATE_FORMAT(recorded_at, '${labelFormat}')
     ORDER BY MIN(recorded_at) ASC`,
    [userId]
  );
  return rows;
}

const SCATTER_INTERVAL_MAP = {
  weekly: '7 DAY',
  monthly: '30 DAY',
  quarterly: '90 DAY',
};

async function getScatter(userId, timeframe) {
  const interval = SCATTER_INTERVAL_MAP[timeframe] || '7 DAY';

  const [rows] = await db.execute(
    `SELECT 
       sleep_duration,
       sleep_quality,
       recovery_score,
       DATE_FORMAT(recorded_at, '%Y-%m-%d %H:%i') AS recorded_at
     FROM sleep_logs
     WHERE user_id = ?
       AND recorded_at >= DATE_SUB(NOW(), INTERVAL ${interval})
       AND sleep_duration > 0
       AND sleep_quality  > 0
     ORDER BY recorded_at ASC`,
    [userId]
  );
  return rows;
}

module.exports = { insertLog, getTodayLatest, getGraph, getAnalysis, getScatter };
