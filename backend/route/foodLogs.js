const express            = require('express');
const router             = express.Router();
const crypto             = require('crypto');
const db                 = require('../config/db');
const notificationRouter = require('./notification');
const { analyzeFoodImage, suggestPlanForMeal } = require('../config/gemini');
const { sendMealSummaryEmail }                 = require('../config/mailer');
const clients = notificationRouter.clients;

// IMAGE ANALYSIS CACHE
const analysisCache = new Map();
const CACHE_TTL_MS  = 15 * 60 * 1000;

function imageHash(base64Image) {
  return crypto
    .createHash('sha256')
    .update(base64Image.slice(0, 2000))
    .digest('hex');
}

function getCached(base64Image) {
  const key   = imageHash(base64Image);
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
    let oldestTs  = Infinity;
    for (const [k, v] of analysisCache) {
      if (v.ts < oldestTs) { oldestTs = v.ts; oldestKey = k; }
    }
    if (oldestKey) analysisCache.delete(oldestKey);
  }
  analysisCache.set(imageHash(base64Image), { result, ts: Date.now() });
}


// POST /api/food-logs/analyze-pic
router.post('/analyze-pic', async (req, res) => {
  const { base64Image } = req.body;
  if (!base64Image) return res.status(400).json({ error: 'No image provided' });

  // Cache hit return immediately, no AI call
  const cached = getCached(base64Image);
  if (cached) {
    console.log('[analyze-pic] ✅ Cache hit — returning stored result');
    return res.json(cached);
  }

  try {
    // analyzeFoodImage now returns a JSON string
    const raw = await analyzeFoodImage(base64Image);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Shouldn't happen since gemini.js always returns valid JSON, but just in case
      const match = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim().match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Could not parse AI response as JSON');
      parsed = JSON.parse(match[0]);
    }

    // Final safety clamp
    parsed.calories = Math.max(0, Math.round(Number(parsed.calories) || 0));
    parsed.protein  = Math.max(0, Math.round(Number(parsed.protein)  || 0));
    parsed.carbs    = Math.max(0, Math.round(Number(parsed.carbs)    || 0));
    parsed.fat      = Math.max(0, Math.round(Number(parsed.fat)      || 0));

    // ── Store in cache for next time the same image is analyzed ────────────
    setCache(base64Image, parsed);

    res.json(parsed);
  } catch (err) {
    console.error('[analyze-pic] ERROR:', err.message);
    res.status(500).json({ error: 'AI failed to analyze the image. Please try again.' });
  }
});


// POST /api/food-logs/:userId/suggest-plan

router.post('/:userId/suggest-plan', async (req, res) => {
  const { userId } = req.params;
  const { food_name, calories, protein, carbs, fat } = req.body;

  if (!food_name) return res.status(400).json({ error: 'food_name is required' });

  try {
    const [plans] = await db.execute(
      `SELECT p.*, IF(up.user_id IS NULL, 0, 1) AS is_enrolled
       FROM plans p
       LEFT JOIN user_plans up ON p.id = up.plan_id AND up.user_id = ?
       ORDER BY p.id ASC`,
      [userId]
    );

    const [[{ caloriesSoFar }]] = await db.execute(
      `SELECT COALESCE(SUM(calories), 0) AS caloriesSoFar
       FROM food_logs WHERE user_id = ? AND DATE(logged_at) = CURDATE()`,
      [userId]
    );

    const meal         = { food_name, calories: calories || 0, protein: protein || 0, carbs: carbs || 0, fat: fat || 0 };
    const dailyContext = { caloriesSoFar: Math.round(caloriesSoFar), calorieGoal: 2000 };

    const raw       = await suggestPlanForMeal(meal, plans, dailyContext);
    const cleanJson = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    let aiResult;
    try {
      aiResult = JSON.parse(cleanJson);
    } catch {
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Could not parse AI suggestion as JSON');
      aiResult = JSON.parse(match[0]);
    }

    const recommendedPlan = plans.find(p => String(p.id) === String(aiResult.recommended_plan_id)) || null;
    const recommendedSource = recommendedPlan
      ? (recommendedPlan.is_enrolled === 1 ? 'enrolled' : 'marketplace')
      : null;

    res.json({
      food_name:          meal.food_name,
      calories:           meal.calories,
      message:            aiResult.message,
      reasoning:          aiResult.reasoning,
      estimated_minutes:  aiResult.estimated_minutes ?? null,
      recommended_plan:   recommendedPlan,
      recommended_source: recommendedSource,
      has_enrolled_plans: plans.some(p => p.is_enrolled === 1),
      has_any_plans:      plans.length > 0,
    });
  } catch (err) {
    console.error('[suggest-plan] ERROR:', err.message);
    res.status(500).json({ error: 'AI coach could not generate a suggestion' });
  }
});


// POST /api/food-logs/:userId
//
// NOTE: The response is sent to the client immediately after the INSERT
// succeeds. Sending the meal-summary email and writing the notification
// happen AFTER that, in the background, so a slow/hanging Gmail SMTP
// connection can no longer make the frontend's "Saving…" spinner hang.
// If the background steps fail, they only log to the server console —
// they must NOT try to call res.* again, since the response has already
// been sent.
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { food_name, calories, protein, carbs, fat, image_url } = req.body;

  if (!food_name) return res.status(400).json({ error: 'food_name is required' });

  try {
    const [result] = await db.execute(
      `INSERT INTO food_logs (user_id, food_name, calories, protein, carbs, fat, image_url, logged_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, food_name, calories || 0, protein || 0, carbs || 0, fat || 0, image_url || null]
    );

    // ✅ Respond immediately — the meal is saved, don't make the user wait
    // on email or notifications.
    res.status(200).json({ message: 'Food log saved', id: result.insertId });

    // ── Everything below runs in the background, after the response ────────
    try {
      const [[user]]    = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
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

      if (user?.email) {
        sendMealSummaryEmail(user.email, summary).catch(err =>
          console.error('❌ MAILER FAILED:', err.message)
        );
      }

      const msg = `Meal logged! Today: ${Math.round(summary.calories)} kcal | P: ${Math.round(summary.protein)}g | C: ${Math.round(summary.carbs)}g | F: ${Math.round(summary.fat)}g`;
      await db.execute('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [userId, msg]);
      clients.get(String(userId))?.write(`data: ${JSON.stringify({ message: msg, type: 'success' })}\n\n`);
    } catch (err) {
      // Response already sent — just log it, never call res.* here
      console.error('❌ POST-SAVE BACKGROUND TASK FAILED:', err.message);
    }

  } catch (err) {
    console.error('[food-log POST] ERROR:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});


// GET /api/food-logs/:userId
// Raised default limit to 200 so all records are available for client-side
// date filtering (DailySummary and MealHistory both rely on full history).
//
// NOTE: LIMIT/OFFSET are inlined (not bound as `?` params) because MySQL's
// binary prepared-statement protocol (used by db.execute()) does not
// reliably support LIMIT/OFFSET as bound parameters — it throws
// "Incorrect arguments to mysqld_stmt_execute" even when the values are
// valid integers. This is safe from SQL injection because `limit` and
// `offset` are forced through parseInt(...) || default, so they can only
// ever be actual numbers, never arbitrary strings.
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const limit  = parseInt(req.query.limit)  || 200;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const [rows] = await db.execute(
      `SELECT id, food_name, calories, protein, carbs, fat, image_url,
              DATE_FORMAT(logged_at, '%Y-%m-%d %H:%i') AS logged_at
       FROM food_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT ${limit} OFFSET ${offset}`,
      [userId]
    );
    const [[{ total }]] = await db.execute(
      'SELECT COUNT(*) AS total FROM food_logs WHERE user_id = ?',
      [userId]
    );
    res.json({ records: rows, total });
  } catch (err) {
    console.error('[food-log GET] ERROR:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/food-logs/:userId/:mealId
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:userId/:mealId', async (req, res) => {
  const { userId, mealId } = req.params;

  try {
    const [result] = await db.execute(
      'DELETE FROM food_logs WHERE id = ? AND user_id = ?',
      [mealId, userId]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Meal not found or already deleted' });

    res.json({ success: true, message: 'Meal deleted' });
  } catch (err) {
    console.error('[food-log DELETE] ERROR:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;