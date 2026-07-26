const db = require('../config/db');

async function getDailyStats(userId, today) {
  const [stats] = await db.execute(
    'SELECT calories_burned, steps, workout_duration_mins FROM daily_stats WHERE user_id = ? AND stat_date = ?',
    [userId, today]
  );
  return stats;
}

module.exports = { getDailyStats };
