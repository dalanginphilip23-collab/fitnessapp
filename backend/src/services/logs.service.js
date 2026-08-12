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

// Saves a manual dashboard log (daily_stats) AND a matching "Manual Workout"
// entry for the Activity Map in a single transaction, so one never succeeds
// without the other. The workout row is only created when there is actual
// workout data (calories and/or minutes); steps-only logs just update the
// daily aggregate.
async function logDailyActivity(userId, calories, steps, minutes) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute(
      `INSERT INTO daily_stats (user_id, stat_date, calories_burned, steps, workout_duration_mins)
       VALUES (?, CURDATE(), ?, ?, ?)
       ON DUPLICATE KEY UPDATE
           calories_burned       = calories_burned       + VALUES(calories_burned),
           steps                 = steps                 + VALUES(steps),
           workout_duration_mins = workout_duration_mins + VALUES(workout_duration_mins)`,
      [userId, calories, steps, minutes]
    );

    const createWorkout = minutes > 0 || calories > 0;
    if (createWorkout) {
      await connection.execute(
        `INSERT INTO activity_logs (user_id, type, title, duration, distance, pace, calories, route)
         VALUES (?, 'workout', 'Manual Workout', ?, 0, NULL, ?, '[]')`,
        [userId, minutes * 60, calories]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
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

module.exports = { upsertDailyStats, logDailyActivity, getWorkoutHistory };
