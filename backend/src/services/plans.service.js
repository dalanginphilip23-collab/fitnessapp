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

// Best-effort auto-completion for the manually logged dashboard workout:
// find the user's most recently enrolled plan, locate its first uncompleted
// day, and if the logged duration is >= that day's planned duration, mark it
// complete. Never throws so logging always succeeds even if this is skipped.
async function autoCompleteDayForWorkout(userId, durationMinutes) {
  const [planRows] = await db.execute(
    'SELECT plan_id FROM user_plans WHERE user_id = ? ORDER BY enrolled_at DESC LIMIT 1',
    [userId]
  );
  const planId = planRows[0]?.plan_id;
  if (!planId) return { completed: false, reason: 'no_plan' };

  const [days] = await db.execute(
    'SELECT day_number, duration_mins FROM plan_contents WHERE plan_id = ? ORDER BY day_number ASC',
    [planId]
  );
  if (days.length === 0) return { completed: false, reason: 'no_content' };

  const [progressRows] = await db.execute(
    'SELECT day_number FROM user_plan_progress WHERE user_id = ? AND plan_id = ? AND is_completed = 1',
    [userId, planId]
  );
  const completedDays = new Set(progressRows.map(r => r.day_number));

  const nextDay = days.find(d => !completedDays.has(d.day_number));
  if (!nextDay) return { completed: false, reason: 'all_complete' };

  const targetMinutes = nextDay.duration_mins || 0;
  if (targetMinutes <= 0 || durationMinutes < targetMinutes) {
    return { completed: false, reason: 'duration_short' };
  }

  await completeDay(userId, planId, nextDay.day_number);
  return { completed: true, planId, dayNumber: nextDay.day_number };
}

module.exports = { enroll, completeDay, getProgress, getPlanContent, getMarketplace, autoCompleteDayForWorkout };
