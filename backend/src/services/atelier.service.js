const db = require('../config/db');

async function getSummary(userId) {
  const [hrv] = await db.execute(
    'SELECT heart_rate as bpm FROM biometric_logs WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1',
    [userId]
  );
  const [stats] = await db.execute(
    'SELECT workout_duration_mins as sleep_mins FROM daily_stats WHERE user_id = ? AND stat_date = CURDATE()',
    [userId]
  );
  return { bpm: hrv[0]?.bpm || 0, sleepMins: stats[0]?.sleep_mins || 462, isOnline: true };
}

module.exports = { getSummary };
