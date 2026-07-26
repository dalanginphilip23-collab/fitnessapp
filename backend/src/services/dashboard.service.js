const db = require('../config/db');

async function getTodayStats(userId) {
  const [stats] = await db.execute(
    `SELECT calories_burned, steps, workout_duration_mins
     FROM daily_stats 
     WHERE user_id = ? AND stat_date = CURDATE()`,
    [userId]
  );
  return stats;
}

async function getUserProfile(userId) {
  const [user] = await db.execute(
    `SELECT name, fitness_goal, avatar_url
     FROM users
     WHERE id = ?`,
    [userId]
  );
  return user;
}

async function getSleepGraphData(userId) {
  const [sleepData] = await db.execute(
    `SELECT DATE_FORMAT(recorded_at, '%H:%i') AS label, AVG(sleep_duration) AS value
     FROM sleep_logs
     WHERE user_id = ? AND DATE(recorded_at) = CURDATE()
     GROUP BY label ORDER BY label ASC LIMIT 20`,
    [userId]
  );
  return sleepData;
}

async function searchUsers(q) {
  const [results] = await db.execute(
    'SELECT name, avatar_url FROM users WHERE name LIKE ? LIMIT 5',
    [`%${q}%`]
  );
  return results;
}

module.exports = { getTodayStats, getUserProfile, getSleepGraphData, searchUsers };
