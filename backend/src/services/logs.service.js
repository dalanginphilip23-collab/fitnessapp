const db = require('../config/db');

async function upsertDailyStats(userId, calories, steps, minutes) {
  return db.execute(
    `INSERT INTO daily_stats (user_id, stat_date, calories_burned, steps, workout_duration_mins)
     VALUES (?, CURDATE(), ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
         calories_burned       = calories_burned       + VALUES(calories_burned),
         steps                 = steps                 + VALUES(steps),
         workout_duration_mins = workout_duration_mins + VALUES(workout_duration_mins)`,
    [userId, calories, steps, minutes]
  );
}

async function getWorkoutHistory(userId) {
  const [rows] = await db.execute(
    `SELECT id, start_time, end_time, status 
     FROM workout_sessions 
     WHERE user_id = ? 
     ORDER BY start_time DESC 
     LIMIT 50`,
    [userId]
  );
  return rows;
}

module.exports = { upsertDailyStats, getWorkoutHistory };
