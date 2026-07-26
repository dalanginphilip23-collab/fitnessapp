const db = require('../config/db');

async function updateUserName(userId, fullName) {
  return db.execute(
    'UPDATE users SET name = ? WHERE id = ?',
    [fullName, userId]
  );
}

async function upsertProfileDetails(userId, contact, bio, avatar_url) {
  return db.execute(`
        INSERT INTO user_profiles (user_id, contact, bio, avatar_url)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            contact    = VALUES(contact),
            bio        = VALUES(bio),
            avatar_url = VALUES(avatar_url)
    `, [
    userId,
    contact || null,
    bio || null,
    avatar_url || null,
  ]);
}

async function getSavedAvatar(userId) {
  const [saved] = await db.execute(
    'SELECT avatar_url FROM user_profiles WHERE user_id = ?',
    [userId]
  );
  return saved;
}

async function getProfile(userId) {
  const [rows] = await db.execute(`
        SELECT 
            u.name     AS fullName,
            u.email,
            p.contact,
            p.bio,
            p.avatar_url,
            p.height_cm,
            p.weight_kg
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.id = ?
    `, [userId]);
  return rows;
}

module.exports = { updateUserName, upsertProfileDetails, getSavedAvatar, getProfile };
