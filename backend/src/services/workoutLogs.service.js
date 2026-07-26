const db = require('../config/db');

async function startLog(userId, workout_type) {
  const [result] = await db.execute(
    `INSERT INTO workout_logs (user_id, workout_type, status)
     VALUES (?, ?, 'active')`,
    [userId, workout_type ?? 'unknown']
  );
  const [[log]] = await db.execute(
    `SELECT id, start_time FROM workout_logs WHERE id = ?`,
    [result.insertId]
  );
  return log;
}

async function findOwnedLog(logId, userId) {
  const [[existing]] = await db.execute(
    `SELECT id, status FROM workout_logs WHERE id = ? AND user_id = ?`,
    [logId, userId]
  );
  return existing;
}

async function endLog(logId, status, rep_count) {
  await db.execute(
    `UPDATE workout_logs
        SET end_time = NOW(),
            status = ?,
            rep_count = ?,
            duration_seconds = TIMESTAMPDIFF(SECOND, start_time, NOW())
      WHERE id = ?`,
    [status, rep_count, logId]
  );

  const [[updated]] = await db.execute(
    `SELECT id, workout_type, rep_count, start_time, end_time, status, duration_seconds
       FROM workout_logs WHERE id = ?`,
    [logId]
  );
  return updated;
}

async function getLogs(userId) {
  const [logs] = await db.execute(
    `SELECT id, workout_type, rep_count, start_time, end_time, status, duration_seconds
       FROM workout_logs
      WHERE user_id = ?
      ORDER BY start_time DESC LIMIT 50`,
    [userId]
  );
  return logs;
}

module.exports = { startLog, findOwnedLog, endLog, getLogs };
