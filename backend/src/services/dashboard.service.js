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

async function getActivePlan(userId) {
  const [rows] = await db.execute(
    `SELECT p.id, p.title, p.duration_days, p.target_focus, p.image_seed,
            up.enrolled_at,
            COUNT(upp.id) AS completed_days
     FROM user_plans up
     JOIN plans p ON p.id = up.plan_id
     LEFT JOIN user_plan_progress upp ON upp.plan_id = p.id AND upp.user_id = up.user_id AND upp.is_completed = 1
     WHERE up.user_id = ?
     GROUP BY p.id, p.title, p.duration_days, p.target_focus, p.image_seed, up.enrolled_at
     ORDER BY up.enrolled_at DESC
     LIMIT 1`,
    [userId]
  );

  const [countRow] = await db.execute(
    'SELECT COUNT(*) AS count FROM user_plans WHERE user_id = ?',
    [userId]
  );

  const plan = rows[0] || null;
  const totalDays = plan?.duration_days || 0;
  const completedDays = plan?.completed_days || 0;

  return {
    count: Number(countRow?.[0]?.count) || 0,
    plan: plan
      ? {
          id:           plan.id,
          title:        plan.title,
          duration_days: totalDays,
          target_focus: plan.target_focus,
          image_seed:   plan.image_seed,
          enrolled_at:  plan.enrolled_at,
          completed_days: completedDays,
          progress_pct: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
        }
      : null,
  };
}

async function searchUsers(q) {
  const [results] = await db.execute(
    'SELECT name, avatar_url FROM users WHERE name LIKE ? LIMIT 5',
    [`%${q}%`]
  );
  return results;
}

module.exports = { getTodayStats, getUserProfile, getSleepGraphData, getActivePlan, searchUsers };
