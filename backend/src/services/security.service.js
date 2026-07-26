const db = require('../config/db');

async function getSessionsForUser(userId) {
  const [rows] = await db.execute(`
        SELECT
            id,
            device      AS device_type,
            browser,
            os,
            ip_address,
            city,
            country,
            created_at  AS last_active,
            is_current
        FROM user_sessions
        WHERE user_id = ?
        ORDER BY created_at DESC
    `, [userId]);
  return rows;
}

async function deleteSession(sessionId, userId) {
  return db.execute(`
        DELETE FROM user_sessions
        WHERE id = ? AND user_id = ?
    `, [sessionId, userId]);
}


module.exports = { getSessionsForUser, deleteSession };
