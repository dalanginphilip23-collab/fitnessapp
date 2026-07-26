const db = require('../config/db');

// NOTE: preserved exactly as in the original route/dailyNutrition.js.
// Despite the filename/mount path ("/api/nutrition"), this actually
// writes to workout_sessions, not a nutrition table. Flagged for the
// team but left unchanged per "no logic changes" instruction.
async function saveCoachingSession(userId, { reps, alignment, velocity, symmetry }) {
  return db.execute(
    `INSERT INTO workout_sessions 
    (user_id, workout_label, reps, alignment, velocity, symmetry, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      userId,
      'Live Coached Session', // Generic label since coach chooses workout
      reps || 0,
      alignment || 0,
      velocity || 0,
      symmetry || 0
    ]
  );
}

module.exports = { saveCoachingSession };
