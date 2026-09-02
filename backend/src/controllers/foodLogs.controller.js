const foodLogsService = require('../services/foodLogs.service');
const logger = require('../utils/logger');

// POST /api/food-logs/analyze-pic â€” optimized: size guard, cache, no fallback poison
async function analyzePic(req, res) {
  const { base64Image, mimeType } = req.body;
  if (!base64Image) return res.status(400).json({ error: 'No image provided' });
  if (base64Image.length > 2_000_000) return res.status(413).json({ error: 'Image too large (max ~1.5MB). Try a smaller photo.' });
  const mime = (mimeType && String(mimeType).startsWith('image/')) ? mimeType : 'image/jpeg';

  const cached = foodLogsService.getCached(base64Image, mime);
  if (cached) {
    logger.info('[analyze-pic] âœ… Cache hit â€” returning stored result');
    return res.json(cached);
  }

  try {
    // analyzeFoodImage now returns a JSON string
    const raw = await foodLogsService.runFoodImageAnalysis(base64Image, mime);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Shouldn't happen since gemini.js always returns valid JSON, but just in case
      const match = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim().match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Could not parse AI response as JSON');
      parsed = JSON.parse(match[0]);
    }

    parsed.calories = Math.max(0, Math.round(Number(parsed.calories) || 0));
    parsed.protein = Math.max(0, Math.round(Number(parsed.protein) || 0));
    parsed.carbs = Math.max(0, Math.round(Number(parsed.carbs) || 0));
    parsed.fat = Math.max(0, Math.round(Number(parsed.fat) || 0));

    foodLogsService.setCache(base64Image, parsed, mime);

    res.json(parsed);
  } catch (err) {
    logger.error('[analyze-pic] ERROR:', err.message);
    res.status(500).json({ error: 'AI failed to analyze the image. Please try again.' });
  }
}

// POST /api/food-logs/:userId/suggest-plan
async function suggestPlan(req, res) {
  const { userId } = req.params;
  const { food_name, calories, protein, carbs, fat } = req.body;

  if (!food_name) return res.status(400).json({ error: 'food_name is required' });

  try {
    const [plans, caloriesSoFar] = await Promise.all([
      foodLogsService.getPlansForUser(userId),
      foodLogsService.getCaloriesSoFar(userId),
    ]);

    const meal = { food_name, calories: calories || 0, protein: protein || 0, carbs: carbs || 0, fat: fat || 0 };
    const dailyContext = { caloriesSoFar: Math.round(caloriesSoFar), calorieGoal: 2000 };

    const raw = await foodLogsService.getPlanSuggestion(meal, plans, dailyContext);
    const cleanJson = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    let aiResult;
    try {
      aiResult = JSON.parse(cleanJson);
    } catch {
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (!match) {
        return res.json({
          food_name: meal.food_name,
          calories: meal.calories,
          message: raw || "AI coach is temporarily unavailable. Your meal has been logged!",
          reasoning: "",
          estimated_minutes: null,
          recommended_plan: null,
          recommended_source: null,
          has_enrolled_plans: plans.some(p => p.is_enrolled === 1),
          has_any_plans: plans.length > 0,
        });
      }
      aiResult = JSON.parse(match[0]);
    }

    const recommendedPlan = plans.find(p => String(p.id) === String(aiResult.recommended_plan_id)) || null;
    const recommendedSource = recommendedPlan
      ? (recommendedPlan.is_enrolled === 1 ? 'enrolled' : 'marketplace')
      : null;

    res.json({
      food_name: meal.food_name,
      calories: meal.calories,
      message: aiResult.message,
      reasoning: aiResult.reasoning,
      estimated_minutes: aiResult.estimated_minutes ?? null,
      recommended_plan: recommendedPlan,
      recommended_source: recommendedSource,
      has_enrolled_plans: plans.some(p => p.is_enrolled === 1),
      has_any_plans: plans.length > 0,
    });
  } catch (err) {
    logger.error('[suggest-plan] ERROR:', err.message);
    res.status(500).json({ error: 'AI coach could not generate a suggestion' });
  }
}

// POST /api/food-logs/:userId
async function createLog(req, res) {
  const { userId } = req.params;
  const { food_name, calories, protein, carbs, fat, image_url, emoji } = req.body;

  if (!food_name) return res.status(400).json({ error: 'food_name is required' });

  try {
    const [result] = await foodLogsService.insertFoodLog(userId, { food_name, calories, protein, carbs, fat, image_url, emoji });

    res.status(200).json({ message: 'Food log saved', id: result.insertId });

    try {
      const user = await foodLogsService.getUserEmail(userId);
      const summary = await foodLogsService.getTodaySummary(userId);

      if (user?.email) {
        foodLogsService.sendMealEmail(user.email, summary).catch(err =>
          logger.error('âŒ MAILER FAILED:', err.message)
        );
      }

      const msg = `Meal logged! Today: ${Math.round(summary.calories)} kcal | P: ${Math.round(summary.protein)}g | C: ${Math.round(summary.carbs)}g | F: ${Math.round(summary.fat)}g`;
      await foodLogsService.insertMealNotification(userId, msg);
      foodLogsService.pushMealNotification(userId, msg);
    } catch (err) {
      // Response already sent â€” just log it, never call res.* here
      logger.error('âŒ POST-SAVE BACKGROUND TASK FAILED:', err.message);
    }

  } catch (err) {
    logger.error('[food-log POST] ERROR:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
}

async function getLogs(req, res) {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 200;
  const offset = parseInt(req.query.offset) || 0;
  const date = req.query.date || null;

  try {
    const { rows, total } = await foodLogsService.getFoodLogs(userId, limit, offset, date);
    res.json({ records: rows, total });
  } catch (err) {
    logger.error('[food-log GET] ERROR:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
}

// DELETE /api/food-logs/:userId/:mealId
async function deleteLog(req, res) {
  const { userId, mealId } = req.params;

  try {
    const result = await foodLogsService.deleteFoodLog(mealId, userId);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Meal not found or already deleted' });

    res.json({ success: true, message: 'Meal deleted' });
  } catch (err) {
    logger.error('[food-log DELETE] ERROR:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
}

module.exports = { analyzePic, suggestPlan, createLog, getLogs, deleteLog };
