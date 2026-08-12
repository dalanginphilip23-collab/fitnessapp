const db = require('../config/db');

async function startSession(userId, exercise_type, started_at) {
  return db.execute(
    `INSERT INTO coaching_sessions (user_id, exercise_type, started_at)
     VALUES (?, ?, ?)`,
    [userId, exercise_type, started_at || new Date()]
  );
}

async function getSessionOwner(sessionId) {
  const [rows] = await db.execute(
    'SELECT user_id FROM coaching_sessions WHERE id = ?',
    [sessionId]
  );
  return rows[0] ? rows[0].user_id : null;
}

async function endSession(sessionId, { ended_at, total_reps, avg_alignment, avg_velocity, avg_symmetry }) {
  return db.execute(
    `UPDATE coaching_sessions
     SET ended_at      = ?,
         total_reps    = ?,
         avg_alignment = ?,
         avg_velocity  = ?,
         avg_symmetry  = ?,
         duration_secs = TIMESTAMPDIFF(SECOND, started_at, ?)
     WHERE id = ?`,
    [
      ended_at || new Date(),
      total_reps || 0,
      avg_alignment ?? null,
      avg_velocity ?? null,
      avg_symmetry ?? null,
      ended_at || new Date(),
      sessionId,
    ]
  );
}

async function logRep(sessionId, { rep_number, feedback_text, alignment, velocity, symmetry }) {
  return db.execute(
    `INSERT INTO coaching_reps
         (session_id, rep_number, feedback_text, alignment, velocity, symmetry, logged_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      sessionId,
      rep_number || 0,
      feedback_text || null,
      alignment ?? null,
      velocity ?? null,
      symmetry ?? null,
    ]
  );
}

async function getSessionsForUser(userId, limit, offset) {
  const [rows] = await db.execute(
    `SELECT
         id,
         exercise_type,
         started_at,
         ended_at,
         duration_secs,
         total_reps,
         avg_alignment,
         avg_velocity,
         avg_symmetry,
         DATE_FORMAT(started_at, '%Y-%m-%d %H:%i') AS started_label
     FROM coaching_sessions
     WHERE user_id = ?
     ORDER BY started_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const [[{ total }]] = await db.execute(
    `SELECT COUNT(*) AS total FROM coaching_sessions WHERE user_id = ?`,
    [userId]
  );

  return { rows, total };
}

async function getRepsForSession(sessionId) {
  const [rows] = await db.execute(
    `SELECT
         id,
         rep_number,
         feedback_text,
         alignment,
         velocity,
         symmetry,
         DATE_FORMAT(logged_at, '%H:%i:%s') AS logged_at
     FROM coaching_reps
     WHERE session_id = ?
     ORDER BY rep_number ASC`,
    [sessionId]
  );
  return rows;
}

async function getDailySummary(userId, date) {
  const [rows] = await db.execute(
    `SELECT
         COUNT(*)            AS total_sessions,
         SUM(total_reps)     AS total_reps,
         SUM(duration_secs)  AS total_duration_secs,
         AVG(avg_alignment)  AS avg_alignment,
         AVG(avg_velocity)   AS avg_velocity,
         AVG(avg_symmetry)   AS avg_symmetry
     FROM coaching_sessions
     WHERE user_id = ? AND DATE(started_at) = ?`,
    [userId, date]
  );
  return rows[0];
}

module.exports = { startSession, getSessionOwner, endSession, logRep, getSessionsForUser, getRepsForSession, getDailySummary };
