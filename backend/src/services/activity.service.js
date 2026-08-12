const crypto = require('crypto');
const db = require('../config/db');

function generateShareToken() {
  return crypto.randomBytes(12).toString('hex'); // 24-char hex token
}

async function saveActivity({
  userId, duration, distance, pace, calories, route,
  type = 'run', title = null, place_name = null, is_public = 0, postToFeed = false, caption = null,
}) {
  const share_token = generateShareToken();

  const [result] = await db.execute(
    `INSERT INTO activity_logs 
    (user_id, type, title, place_name, is_public, share_token, duration, distance, pace, calories, route)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, type, title, place_name, is_public ? 1 : 0, share_token, duration, distance, pace, calories, JSON.stringify(route)]
  );

  if (postToFeed && result.insertId) {
    await createFeedPost(result.insertId, userId, caption);
  }

  return { id: result.insertId, share_token };
}

async function getUserStats(userId) {
  const [rows] = await db.execute(
    `SELECT 
        COUNT(*)        AS totalRuns,
        SUM(distance)   AS totalDistance,
        SUM(duration)   AS totalDuration,
        SUM(calories)   AS totalCalories
     FROM activity_logs
     WHERE user_id = ?`,
    [userId]
  );
  return rows[0];
}

async function getActivityDetail(id, userId) {
  const [rows] = await db.execute(
    `SELECT * FROM activity_logs WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  return rows[0];
}

async function getUserActivities(userId) {
  const [rows] = await db.execute(
    `SELECT * FROM activity_logs 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function deleteActivity(id, userId) {
  const [result] = await db.execute(
    `DELETE FROM activity_logs WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  return result;
}

// ─── Public share link ────────────────────────────────────────────────────────
// A random 24-char token is the access mechanism ("secret link" pattern like
// Strava) — no auth required, but the token itself is unguessable.
async function getByShareToken(token) {
  const [rows] = await db.execute(
    `SELECT al.*, u.name AS author_name, u.avatar_url AS author_avatar
     FROM activity_logs al
     JOIN users u ON u.id = al.user_id
     WHERE al.share_token = ? AND al.is_public = 1`,
    [token]
  );
  return rows[0];
}

async function setPublic(id, userId, isPublic) {
  await db.execute(
    `UPDATE activity_logs SET is_public = ? WHERE id = ? AND user_id = ?`,
    [isPublic ? 1 : 0, id, userId]
  );
  const [rows] = await db.execute(`SELECT share_token FROM activity_logs WHERE id = ?`, [id]);
  return rows[0] || null;
}

// ─── In-app feed (own + friends' posts) ──────────────────────────────────────
// Friends are users connected through the friendships table in either
// direction, mirroring messenger.service.getContacts.
async function getFeed(userId) {
  const [rows] = await db.execute(
    `SELECT 
        fp.id AS post_id,
        fp.activity_id,
        fp.caption,
        fp.created_at AS posted_at,
        u.id AS author_id,
        u.name AS author_name,
        u.avatar_url AS author_avatar,
        al.type,
        al.title,
        al.place_name,
        al.duration,
        al.distance,
        al.pace,
        al.calories,
        al.share_token,
        al.route,
        al.created_at AS activity_created_at
     FROM activity_feed_posts fp
     JOIN activity_logs al ON al.id = fp.activity_id
     JOIN users u ON u.id = fp.user_id
     WHERE fp.user_id = ?
        OR fp.user_id IN (
            SELECT f.friend_id FROM friendships f WHERE f.user_id = ? AND f.status = 'close_friend'
            UNION
            SELECT f.user_id FROM friendships f WHERE f.friend_id = ? AND f.status = 'close_friend'
        )
     ORDER BY fp.created_at DESC
     LIMIT 100`,
    [userId, userId, userId]
  );
  return rows.map((row) => ({ ...row, route: JSON.parse(row.route || '[]') }));
}

async function createFeedPost(activityId, userId, caption = null) {
  return db.execute(
    `INSERT INTO activity_feed_posts (activity_id, user_id, caption) VALUES (?, ?, ?)`,
    [activityId, userId, caption]
  );
}

async function deleteFeedPost(postId, userId) {
  const [result] = await db.execute(
    `DELETE FROM activity_feed_posts WHERE id = ? AND user_id = ?`,
    [postId, userId]
  );
  return result.affectedRows > 0;
}

// ─── Saved pins (custom waypoints) ───────────────────────────────────────────
async function listPins(userId) {
  const [rows] = await db.execute(
    `SELECT id, name, latitude, longitude, created_at FROM saved_pins WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map((row) => ({
    ...row,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
  }));
}

async function addPin(userId, { name, latitude, longitude }) {
  const [result] = await db.execute(
    `INSERT INTO saved_pins (user_id, name, latitude, longitude) VALUES (?, ?, ?, ?)`,
    [userId, name || null, latitude, longitude]
  );
  const [rows] = await db.execute(
    `SELECT id, name, latitude, longitude, created_at FROM saved_pins WHERE id = ?`,
    [result.insertId]
  );
  const pin = rows[0];
  return { ...pin, latitude: parseFloat(pin.latitude), longitude: parseFloat(pin.longitude) };
}

async function deletePin(id, userId) {
  const [result] = await db.execute(
    `DELETE FROM saved_pins WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  saveActivity,
  getUserStats,
  getActivityDetail,
  getUserActivities,
  deleteActivity,
  getByShareToken,
  setPublic,
  getFeed,
  createFeedPost,
  deleteFeedPost,
  listPins,
  addPin,
  deletePin,
};
