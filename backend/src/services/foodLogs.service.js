const crypto = require('crypto');
const db = require('../config/db');
const { analyzeFoodImage, suggestPlanForMeal } = require('../config/gemini');
const { sendMealSummaryEmail } = require('../services/mail');
const clients = require('./sseClients');

// IMAGE ANALYSIS CACHE — full hash + mime, LRU O(1), TTL 15m
const analysisCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_MAX = 200;

function imageHash(base64Image, mimeType = 'image/jpeg') {
  return crypto
    .createHash('sha256')
    .update(`${mimeType}:${base64Image}`)
    .digest('hex');
}

function getCached(base64Image, mimeType) {
  const key = imageHash(base64Image, mimeType);
  const entry = analysisCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    analysisCache.delete(key);
    return null;
  }
  // LRU: move to end on hit
  analysisCache.delete(key);
  analysisCache.set(key, entry);
  return entry.result;
}

function setCache(base64Image, result, mimeType) {
  // Don't cache the generic fallback — it would poison the same image for 15m after a key/quota failure.
  if (result?.food_name === 'Meal (tap to edit name)') return;
  const key = imageHash(base64Image, mimeType);
  if (analysisCache.has(key)) analysisCache.delete(key);
  if (analysisCache.size >= CACHE_MAX) {
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey) analysisCache.delete(oldestKey);
  }
  analysisCache.set(key, { result, ts: Date.now() });
}

function clearCache() {
  analysisCache.clear();
}

// In-flight dedup: same image arriving twice concurrently shares one AI call
const inFlight = new Map();

async function runFoodImageAnalysis(base64Image, mimeType) {
  const key = imageHash(base64Image, mimeType);
  if (inFlight.has(key)) return inFlight.get(key);
  const promise = analyzeFoodImage(base64Image, mimeType).finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
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

async function insertFoodLog(userId, { food_name, calories, protein, carbs, fat, image_url, emoji }) {
  return db.execute(
    `INSERT INTO food_logs (user_id, food_name, calories, protein, carbs, fat, image_url, emoji, logged_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [userId, food_name, calories || 0, protein || 0, carbs || 0, fat || 0, image_url || null, emoji || null]
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

async function getFoodLogs(userId, limit, offset, date) {
  const safeLimit = Math.min(Math.max(1, Math.floor(Number(limit) || 200)), 500);
  const safeOffset = Math.max(0, Math.floor(Number(offset) || 0));

  let query = `SELECT id, food_name, calories, protein, carbs, fat, image_url, emoji,
                      DATE_FORMAT(logged_at, '%Y-%m-%d %H:%i') AS logged_at
               FROM food_logs WHERE user_id = ?`;
  const params = [userId];

  if (date) {
    query += ` AND DATE(logged_at) = ?`;
    params.push(date);
  }

  query += ` ORDER BY logged_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

  const [rows] = await db.execute(query, params);

  let countQuery = 'SELECT COUNT(*) AS total FROM food_logs WHERE user_id = ?';
  const countParams = [userId];
  if (date) {
    countQuery += ' AND DATE(logged_at) = ?';
    countParams.push(date);
  }
  const [[{ total }]] = await db.execute(countQuery, countParams);

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
  clearCache,
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
