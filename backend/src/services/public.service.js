const db = require('../config/db');

// User-generated tables that count as "data points" on the landing page.
// Excludes reference/seed data (plans, plan_contents, plan_exercises, doctors).
const DATA_POINT_TABLES = [
  'activity_logs',
  'ai_insight_cache',
  'biometric_logs',
  'bmi_records',
  'chat_sessions',
  'clinic_messages',
  'coaching_reps',
  'coaching_sessions',
  'daily_stats',
  'food_logs',
  'friendships',
  'messages',
  'notifications',
  'posture_alerts',
  'sleep_logs',
  'user_plan_progress',
  'user_plans',
  'user_sessions',
  'workout_logs',
  'workout_sessions',
];

async function getPublicStats() {
  const [[{ userCount }]] = await db.query(
    'SELECT COUNT(*) AS userCount FROM users'
  );

  const [[{ onlineCount }]] = await db.query(
    'SELECT COUNT(*) AS onlineCount FROM users WHERE is_online = 1'
  );

  // Every successful login (email or Google) inserts a user_sessions row,
  // so this is a true "times people have signed in" counter.
  const [[{ loginCount }]] = await db.query(
    'SELECT COUNT(*) AS loginCount FROM user_sessions'
  );

  const [[{ activeToday }]] = await db.query(
    `SELECT COUNT(DISTINCT user_id) AS activeToday FROM daily_stats
     WHERE stat_date = CURDATE()`
  );

  const [[{ workoutCount }]] = await db.query(
    `SELECT COUNT(*) AS workoutCount FROM workout_logs
     WHERE status = 'completed'`
  );

  let dataPoints = 0;
  for (const table of DATA_POINT_TABLES) {
    const [[row]] = await db.query(`SELECT COUNT(*) AS c FROM \`${table}\``);
    dataPoints += Number(row.c || 0);
  }

  return {
    users: Number(userCount || 0),
    onlineUsers: Number(onlineCount || 0),
    logins: Number(loginCount || 0),
    activeToday: Number(activeToday || 0),
    workouts: Number(workoutCount || 0),
    dataPoints,
  };
}

module.exports = { getPublicStats };
