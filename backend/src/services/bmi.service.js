const db = require('../config/db');

const getBmiCategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25.0) return 'Healthy Weight';
  if (bmi < 30.0) return 'Overweight';
  return 'Obese';
};

async function insertBmiRecord(userId, weight_kg, height_cm, bmi, category, connection = db) {
  return connection.execute(
    `INSERT INTO bmi_records (user_id, weight_kg, height_cm, bmi, bmi_category, recorded_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [userId, weight_kg, height_cm, bmi, category]
  );
}

async function syncUserProfile(userId, height_cm, weight_kg, connection = db) {
  await connection.execute(`
    INSERT INTO user_profiles (user_id, height_cm, weight_kg)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
        height_cm = VALUES(height_cm),
        weight_kg = VALUES(weight_kg)
  `, [userId, height_cm, weight_kg]);
}
async function saveBmiAndSyncProfile(userId, weight_kg, height_cm, bmi, category) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await insertBmiRecord(userId, weight_kg, height_cm, bmi, category, connection);
    await syncUserProfile(userId, height_cm, weight_kg, connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function getBmiHistory(userId, limit, offset) {
  const [rows] = await db.execute(
    `SELECT id, weight_kg, height_cm, bmi, bmi_category,
            DATE_FORMAT(recorded_at, '%Y-%m-%d %H:%i') AS recorded_at
     FROM bmi_records
     WHERE user_id = ?
     ORDER BY recorded_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const [[{ total }]] = await db.execute(
    `SELECT COUNT(*) AS total FROM bmi_records WHERE user_id = ?`,
    [userId]
  );

  return { rows, total };
}

module.exports = {
  getBmiCategory,
  insertBmiRecord,
  syncUserProfile,
  saveBmiAndSyncProfile,
  getBmiHistory,
};