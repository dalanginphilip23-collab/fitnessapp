const db = require('../config/db');

async function saveActivity({ userId, duration, distance, pace, calories, route }) {
  return db.execute(
    `INSERT INTO activity_logs 
    (user_id, duration, distance, pace, calories, route)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, duration, distance, pace, calories, JSON.stringify(route)]
  );
}

async function getUserStats(userId) {
  const [rows] = await db.execute(
    `SELECT 
        COUNT(*)        AS totalRuns,
        SUM(distance)   AS totalDistance,
        SUM(duration)   AS totalDuration,
        SUM(calories)   AS totalCalories
     FROM activity_logs
     WHERE user_id = ?`,
    [userId]
  );
  return rows[0];
}

async function getActivityDetail(id) {
  const [rows] = await db.execute(
    `SELECT * FROM activity_logs WHERE id = ?`,
    [id]
  );
  return rows[0];
}

async function getUserActivities(userId) {
  const [rows] = await db.execute(
    `SELECT * FROM activity_logs 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function deleteActivity(id) {
  return db.execute(
    `DELETE FROM activity_logs WHERE id = ?`,
    [id]
  );
}

module.exports = { saveActivity, getUserStats, getActivityDetail, getUserActivities, deleteActivity };
