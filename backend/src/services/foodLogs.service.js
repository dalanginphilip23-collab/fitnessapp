const crypto = require('crypto');
const db = require('../config/db');
const { analyzeFoodImage, suggestPlanForMeal } = require('../config/gemini');
const { sendMealSummaryEmail } = require('../services/mail');
const clients = require('./sseClients');

// IMAGE ANALYSIS CACHE
const analysisCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function imageHash(base64Image) {
  return crypto
    .createHash('sha256')
    .update(base64Image.slice(0, 2000))
    .digest('hex');
}

function getCached(base64Image) {
  const key = imageHash(base64Image);
  const entry = analysisCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    analysisCache.delete(key);
    return null;
  }
  return entry.result;
}

function setCache(base64Image, result) {
  if (analysisCache.size >= 200) {
    let oldestKey = null;
    let oldestTs = Infinity;
    for (const [k, v] of analysisCache) {
      if (v.ts < oldestTs) { oldestTs = v.ts; oldestKey = k; }
    }
    if (oldestKey) analysisCache.delete(oldestKey);
  }
  analysisCache.set(imageHash(base64Image), { result, ts: Date.now() });
}

async function runFoodImageAnalysis(base64Image) {
  return analyzeFoodImage(base64Image);
}

async function getPlansForUser(userId) {
  const [plans] = await db.execute(
    `SELECT p.*, IF(up.user_id IS NULL, 0, 1) AS is_enrolled
     FROM plans p
     LEFT JOIN user_plans up ON p.id = up.plan_id AND up.user_id = ?
     ORDER BY p.id ASC`,
    [userId]
  );
  return plans;
}

async function getCaloriesSoFar(userId) {
  const [[{ caloriesSoFar }]] = await db.execute(
    `SELECT COALESCE(SUM(calories), 0) AS caloriesSoFar
     FROM food_logs WHERE user_id = ? AND DATE(logged_at) = CURDATE()`,
    [userId]
  );
  return caloriesSoFar;
}

async function getPlanSuggestion(meal, plans, dailyContext) {
  return suggestPlanForMeal(meal, plans, dailyContext);
}

async function insertFoodLog(userId, { food_name, calories, protein, carbs, fat, image_url }) {
  return db.execute(
    `INSERT INTO food_logs (user_id, food_name, calories, protein, carbs, fat, image_url, logged_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [userId, food_name, calories || 0, protein || 0, carbs || 0, fat || 0, image_url || null]
  );
}

async function getUserEmail(userId) {
  const [[user]] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
  return user;
}

async function getTodaySummary(userId) {
  const [[summary]] = await db.execute(
    `SELECT
       COALESCE(SUM(calories), 0) AS calories,
       COALESCE(SUM(protein),  0) AS protein,
       COALESCE(SUM(carbs),    0) AS carbs,
       COALESCE(SUM(fat),      0) AS fat
     FROM food_logs
     WHERE user_id = ? AND DATE(logged_at) = CURDATE()`,
    [userId]
  );
  return summary;
}

async function sendMealEmail(email, summary) {
  return sendMealSummaryEmail(email, summary);
}

async function insertMealNotification(userId, msg) {
  return db.execute('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [userId, msg]);
}

function pushMealNotification(userId, msg) {
  clients.get(String(userId))?.write(`data: ${JSON.stringify({ message: msg, type: 'success' })}\n\n`);
}

async function getFoodLogs(userId, limit, offset) {
  const safeLimit = Math.min(Math.max(1, Math.floor(Number(limit) || 200)), 500);
  const safeOffset = Math.max(0, Math.floor(Number(offset) || 0));
  const [rows] = await db.execute(
    `SELECT id, food_name, calories, protein, carbs, fat, image_url,
            DATE_FORMAT(logged_at, '%Y-%m-%d %H:%i') AS logged_at
     FROM food_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
    [userId]
  );
  const [[{ total }]] = await db.execute(
    'SELECT COUNT(*) AS total FROM food_logs WHERE user_id = ?',
    [userId]
  );
  return { rows, total };
}

async function deleteFoodLog(mealId, userId) {
  const [result] = await db.execute(
    'DELETE FROM food_logs WHERE id = ? AND user_id = ?',
    [mealId, userId]
  );
  return result;
}

module.exports = {
  getCached,
  setCache,
  runFoodImageAnalysis,
  getPlansForUser,
  getCaloriesSoFar,
  getPlanSuggestion,
  insertFoodLog,
  getUserEmail,
  getTodaySummary,
  sendMealEmail,
  insertMealNotification,
  pushMealNotification,
  getFoodLogs,
  deleteFoodLog,
};
