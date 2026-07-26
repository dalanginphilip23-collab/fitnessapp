const db = require('../config/db');

async function startSession(userId, planId) {
  const [result] = await db.execute(
    `INSERT INTO workout_sessions (user_id, plan_id, status)
     VALUES (?, ?, 'active')`,
    [userId, planId]
  );

  const sessionId = result.insertId;
  const [[session]] = await db.execute(
    `SELECT id, start_time FROM workout_sessions WHERE id = ?`,
    [sessionId]
  );
  return session;
}

async function findOwnedSession(sessionId, userId) {
  const [[existing]] = await db.execute(
    `SELECT id, user_id, status FROM workout_sessions WHERE id = ? AND user_id = ?`,
    [sessionId, userId]
  );
  return existing;
}

async function endSession(sessionId, status) {
  await db.execute(
    `UPDATE workout_sessions
     SET end_time = NOW(), status = ?
     WHERE id = ?`,
    [status, sessionId]
  );

  const [[updated]] = await db.execute(
    `SELECT id,
            start_time,
            end_time,
            status,
            TIMESTAMPDIFF(SECOND, start_time, end_time) AS duration_seconds
     FROM workout_sessions
     WHERE id = ?`,
    [sessionId]
  );
  return updated;
}

async function getSessions(userId, limit, offset) {
  const [sessions] = await db.execute(
    `SELECT id,
            plan_id,
            start_time,
            end_time,
            status,
            TIMESTAMPDIFF(SECOND, start_time, end_time) AS duration_seconds
     FROM workout_sessions
     WHERE user_id = ?
     ORDER BY start_time DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const [[{ total }]] = await db.execute(
    `SELECT COUNT(*) AS total FROM workout_sessions WHERE user_id = ?`,
    [userId]
  );

  return { sessions, total };
}

module.exports = { startSession, findOwnedSession, endSession, getSessions };
