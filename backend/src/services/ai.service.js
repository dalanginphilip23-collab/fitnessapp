const db = require('../config/db');
const { genAI, callGeminiWithFallback, withTimeout, TEXT_TIMEOUT_MS } = require('../config/gemini');

// ─── POSE ANALYSIS ───
async function analyzePoseImage(image, metadata) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
  const prompt = `
            Context: The user is exercising. 
            Skeletal Data: ${metadata}
            Task: Using the image and the skeletal data, give a 1-sentence coach's correction. 
            If the form is perfect, say something encouraging. 
            Be very concise.
        `.trim();
  const imageParts = [{ inlineData: { data: image.split(',')[1], mimeType: "image/jpeg" } }];
  const result = await withTimeout(
    () => model.generateContent([prompt, ...imageParts]),
    TEXT_TIMEOUT_MS,
    "analyzePose",
  );
  return result.response.text();
}

// ─── AI CHATBOT ───
async function getChatReply(message) {
  const systemPrompt = `
        Identity: You are Vitalis AI, a specialized Fitness and Health Assistant.
        Rules: 
        1. ONLY discuss fitness, health, and nutrition.
        2. For simple greetings (Hi, Hello), greet the user back naturally in ONE short sentence and ask what they'd like help with. Do NOT reply with generic hype phrases like "let's crush your goals" — actually acknowledge the greeting.
        3. REJECT any questions about CODING, PROGRAMMING, or MATH.
        4. Keep replies short — 1 sentence for greetings/small talk, up to 2-3 sentences only when the user asks something that actually needs detail.
        5. Never mention the current date unless the user explicitly asks what today's date is.
        6. Use an encouraging, professional tone like a knowledgeable personal trainer — but concise, not wordy.
        User message: "${message}"
    `;
  return callGeminiWithFallback(systemPrompt);
}

// ─── CLINICAL ANALYSIS ───
async function getUserBasic(userId) {
  const [userRows] = await db.execute(
    'SELECT name, fitness_goal FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  return userRows[0] || { name: 'Athlete', fitness_goal: 'general fitness' };
}

async function getLatestSleepRow(userId) {
  const [sleepRows] = await db.execute(
    `SELECT sleep_duration, sleep_quality, recovery_score, water_intake_ml, recorded_at
     FROM sleep_logs 
     WHERE user_id = ? 
       AND (sleep_duration > 0 OR sleep_quality > 0 OR water_intake_ml > 0)
     ORDER BY recorded_at DESC LIMIT 1`,
    [userId]
  );
  return sleepRows[0] || {};
}

async function getLatestActivityRow(userId) {
  const [activityRows] = await db.execute(
    'SELECT calories_burned, steps, workout_duration_mins FROM daily_stats WHERE user_id = ? ORDER BY stat_date DESC LIMIT 1',
    [userId]
  );
  return activityRows[0];
}

async function getCachedInsight(userId, signature) {
  const [cached] = await db.execute(
    `SELECT sleep_suggestion, activity_suggestion 
     FROM ai_insight_cache 
     WHERE user_id = ? AND insight_date = CURDATE() AND data_signature = ? 
     LIMIT 1`,
    [userId, signature]
  );
  return cached;
}

async function upsertInsight(userId, signature, sleep_suggestion, activity_suggestion) {
  return db.execute(
    `INSERT INTO ai_insight_cache (user_id, data_signature, sleep_suggestion, activity_suggestion, insight_date)
     VALUES (?, ?, ?, ?, CURDATE())
     ON DUPLICATE KEY UPDATE
       data_signature      = VALUES(data_signature),
       sleep_suggestion    = VALUES(sleep_suggestion),
       activity_suggestion = VALUES(activity_suggestion),
       created_at          = NOW()`,
    [userId, signature, JSON.stringify(sleep_suggestion), JSON.stringify(activity_suggestion)]
  );
}

async function callGemini(prompt) {
  return callGeminiWithFallback(prompt);
}

// ─── REAL-TIME COACHING ───
async function getCoachTip(landmarks, workoutType) {
  const prompt = `
            You are a real-time gym coach. Analyze these landmarks for a ${workoutType.toUpperCase()} set.
            Landmarks: ${JSON.stringify(landmarks)}
            Give ONE technical tip (max 10 words). 
            - If PUSHUP: focus on "flat back" or "elbow angle".
            - If SQUAT: focus on "depth" or "weight on heels".
            - If PLANK: focus on "hips height".
            Strict Rule: Only reply with the coaching tip text. No conversational filler.
            `.trim();
  const text = await callGeminiWithFallback(prompt);
  return text.trim();
}

// ─── AI HISTORY ───
async function getInsightHistory(userId) {
  const [rows] = await db.execute(
    `SELECT sleep_suggestion, activity_suggestion, created_at 
     FROM ai_insight_cache 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT 20`,
    [userId]
  );
  return rows;
}

// ─── LATEST ACTIVITY LOG ───
async function getLatestDailyStats(userId) {
  const [latestLog] = await db.execute(
    `SELECT calories_burned, steps, workout_duration_mins               
     FROM daily_stats 
     WHERE user_id = ? 
     ORDER BY stat_date DESC LIMIT 1`,
    [userId]
  );
  return latestLog;
}

async function getLatestSleepForLogs(userId) {
  const [latestSleep] = await db.execute(
    `SELECT * FROM sleep_logs 
     WHERE user_id = ? 
       AND (sleep_duration > 0 OR sleep_quality > 0 OR water_intake_ml > 0)
     ORDER BY recorded_at DESC LIMIT 1`,
    [userId]
  );
  return latestSleep;
}

// ─── RUN ANALYSIS ───
async function getRunHistory(userId) {
  const [runHistory] = await db.execute(
    `SELECT distance, duration, pace, calories, created_at
     FROM activity_logs
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 7`,
    [userId]
  );
  return runHistory;
}

async function insertRunNotification(userId, message) {
  return db.execute(
    'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
    [userId, message, 'info']
  );
}

module.exports = {
  analyzePoseImage,
  getChatReply,
  getUserBasic,
  getLatestSleepRow,
  getLatestActivityRow,
  getCachedInsight,
  upsertInsight,
  callGemini,
  getCoachTip,
  getInsightHistory,
  getLatestDailyStats,
  getLatestSleepForLogs,
  getRunHistory,
  insertRunNotification,
};