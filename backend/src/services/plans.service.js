const db = require('../config/db');

async function enroll(userId, planId) {
  return db.execute(
    `INSERT INTO user_plans (user_id, plan_id, enrolled_at) VALUES (?, ?, NOW())`,
    [userId, planId]
  );
}

async function completeDay(userId, planId, dayNumber) {
  return db.execute(
    `INSERT INTO user_plan_progress (user_id, plan_id, day_number, is_completed, completed_at)
     VALUES (?, ?, ?, 1, NOW())
     ON DUPLICATE KEY UPDATE is_completed = 1, completed_at = NOW()`,
    [userId, planId, dayNumber]
  );
}

async function getProgress(userId, planId) {
  const [rows] = await db.execute(
    'SELECT day_number, is_completed FROM user_plan_progress WHERE user_id = ? AND plan_id = ?',
    [userId, planId]
  );
  return rows;
}

async function getPlanContent(planId) {
  const [days] = await db.execute(
    `SELECT id, day_number, title, activity_type, description, duration_mins
     FROM plan_contents WHERE plan_id = ? ORDER BY day_number ASC`,
    [planId]
  );

  if (days.length === 0) {
    return [];
  }

  const dayIds = days.map(d => d.id);
  const placeholders = dayIds.map(() => '?').join(',');
  const [exerciseRows] = await db.execute(
    `SELECT plan_content_id, exercise_order, exercise_name, sets, reps, duration_seconds, rest_seconds, notes
     FROM plan_exercises
     WHERE plan_content_id IN (${placeholders})
     ORDER BY plan_content_id ASC, exercise_order ASC`,
    dayIds
  );

  const exercisesByDay = {};
  for (const ex of exerciseRows) {
    if (!exercisesByDay[ex.plan_content_id]) exercisesByDay[ex.plan_content_id] = [];
    exercisesByDay[ex.plan_content_id].push({
      order: ex.exercise_order,
      name: ex.exercise_name,
      sets: ex.sets,
      reps: ex.reps,
      durationSeconds: ex.duration_seconds,
      restSeconds: ex.rest_seconds,
      notes: ex.notes,
    });
  }

  return days.map(day => ({
    ...day,
    exercises: exercisesByDay[day.id] || [],
  }));
}

async function getMarketplace(userId) {
  const [rows] = await db.execute(
    `SELECT p.*, IF(up.user_id IS NULL, 0, 1) as is_enrolled
     FROM plans p
     LEFT JOIN user_plans up ON p.id = up.plan_id AND up.user_id = ?
     ORDER BY p.id ASC`,
    [userId]
  );
  return rows;
}

module.exports = { enroll, completeDay, getProgress, getPlanContent, getMarketplace };
