const db = require("../config/db");

const getBmiCategory = (bmi) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25.0) return "Healthy Weight";
  if (bmi < 30.0) return "Overweight";
  return "Obese";
};

const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary", multiplier: 1.2 },
  { id: "light", label: "Light Exercise", multiplier: 1.375 },
  { id: "moderate", label: "Moderate Exercise", multiplier: 1.55 },
  { id: "heavy", label: "Heavy Exercise", multiplier: 1.725 },
  { id: "athlete", label: "Athlete", multiplier: 1.9 },
];

function calcBMR({ sex, kg, cm, age }) {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return sex === "female" ? base - 161 : base + 5;
}

function calcTdee({ sex, kg, cm, age, activityId }) {
  if (!age || !activityId) return null;

  const bmr = calcBMR({ sex, kg, cm, age });
  const activity =
    ACTIVITY_LEVELS.find((a) => a.id === activityId) ?? ACTIVITY_LEVELS[1];
  const tdeeExact = bmr * activity.multiplier;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdeeExact),
    tdeeWeekly: Math.round(tdeeExact * 7),
    goals: {
      maintenance: Math.round(tdeeExact),
      cutting: Math.round(tdeeExact - 500),
      bulking: Math.round(tdeeExact + 500),
    },
  };
}

async function insertBmiRecord(
  userId,
  weight_kg,
  height_cm,
  bmi,
  category,
  age,
  activity_level,
  bmr,
  tdee,
  connection,
) {
  if (!connection) connection = db;
  var userIdNum = Number(userId);
  var columns = await getExistingColumns();
  var hasExtra = columns.indexOf('age') !== -1;

  if (hasExtra) {
    return connection.execute(
      'INSERT INTO bmi_records (user_id, weight_kg, height_cm, bmi, bmi_category, age, activity_level, bmr, tdee, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [userIdNum, weight_kg, height_cm, bmi, category, age, activity_level, bmr, tdee],
    );
  }
  return connection.execute(
    'INSERT INTO bmi_records (user_id, weight_kg, height_cm, bmi, bmi_category, recorded_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [userIdNum, weight_kg, height_cm, bmi, category],
  );
}

async function syncUserProfile(userId, height_cm, weight_kg, connection = db) {
  await connection.execute(
    `
    INSERT INTO user_profiles (user_id, height_cm, weight_kg)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
        height_cm = VALUES(height_cm),
        weight_kg = VALUES(weight_kg)
  `,
    [userId, height_cm, weight_kg],
  );
}

async function saveBmiAndSyncProfile(
  userId,
  weight_kg,
  height_cm,
  bmi,
  category,
  age,
  activity_level,
  bmr,
  tdee,
) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await insertBmiRecord(
      userId,
      weight_kg,
      height_cm,
      bmi,
      category,
      age,
      activity_level,
      bmr,
      tdee,
      connection,
    );
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
  const userIdNum = Number(userId);
  const columns = await getExistingColumns();
  const hasExtra = columns.indexOf('age') !== -1;

  var rows;

  if (hasExtra) {
    [rows] = await db.query(
      `SELECT id, weight_kg, height_cm, bmi, bmi_category, age, activity_level, bmr, tdee,
              DATE_FORMAT(recorded_at, '%Y-%m-%d %H:%i') AS recorded_at
       FROM bmi_records
       WHERE user_id = ?
       ORDER BY recorded_at DESC
       LIMIT ? OFFSET ?`,
      [userIdNum, limit, offset],
    );
  } else {
    [rows] = await db.query(
      `SELECT id, weight_kg, height_cm, bmi, bmi_category,
              DATE_FORMAT(recorded_at, '%Y-%m-%d %H:%i') AS recorded_at
       FROM bmi_records
       WHERE user_id = ?
       ORDER BY recorded_at DESC
       LIMIT ? OFFSET ?`,
      [userIdNum, limit, offset],
    );
  }

  var total = 0;
  try {
    [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM bmi_records WHERE user_id = ?`,
      [userIdNum],
    );
  } catch (e) {
    total = 0;
  }

  return { rows, total };
}

async function getExistingColumns() {
  try {
    const [colRows] = await db.query('SHOW COLUMNS FROM bmi_records');
    return colRows.map(function (r) { return r.Field; });
  } catch (e) {
    return [];
  }
}

module.exports = {
  getBmiCategory,
  ACTIVITY_LEVELS,
  calcBMR,
  calcTdee,
  insertBmiRecord,
  syncUserProfile,
  saveBmiAndSyncProfile,
  getBmiHistory,
};
