const db = require('../config/db');

// NOTE: preserved exactly as in the original route/dailyNutrition.js.
// Despite the filename/mount path ("/api/nutrition"), this actually
// writes to workout_sessions, not a nutrition table. Flagged for the
// team but left unchanged per "no logic changes" instruction.
async function saveCoachingSession(userId, { reps, alignment, velocity, symmetry }) {
  return db.execute(
    `INSERT INTO coaching_sessions 
    (user_id, exercise_type, total_reps, avg_alignment, avg_velocity, avg_symmetry, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      userId,
      'Live Coached Session',
      reps || 0,
      alignment || 0,
      velocity || 0,
      symmetry || 0
    ]
  );
}

module.exports = { saveCoachingSession };
