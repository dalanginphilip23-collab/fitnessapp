const bmiService = require("../services/bmi.service");
const { callGeminiWithFallback } = require("../config/gemini");
const logger = require('../utils/logger');

async function saveBmi(req, res) {
  const { userId } = req.params;
  const { weight_kg, height_cm, age, gender, activity_level } = req.body;

  if (!weight_kg || !height_cm) {
    return res
      .status(400)
      .json({ error: "weight_kg and height_cm are required" });
  }

  const heightM = parseFloat(height_cm) / 100;
  const bmi = parseFloat(
    (parseFloat(weight_kg) / (heightM * heightM)).toFixed(2),
  );
  const category = bmiService.getBmiCategory(bmi);
  const ageNum = age ? parseInt(age, 10) : null;
  const sex = gender === "female" ? "female" : "male";
  const tdeeResult = bmiService.calcTdee({
    sex,
    kg: parseFloat(weight_kg),
    cm: parseFloat(height_cm),
    age: ageNum,
    activityId: activity_level,
  });

  try {
    const [result] = await bmiService.insertBmiRecord(
      userId,
      parseFloat(weight_kg),
      parseFloat(height_cm),
      bmi,
      category,
      ageNum,
      activity_level || null,
      tdeeResult?.bmr ?? null,
      tdeeResult?.tdee ?? null,
    );

    await bmiService.syncUserProfile(
      userId,
      parseFloat(height_cm),
      parseFloat(weight_kg),
    );

    // Generate AI suggestion â€” now aware of TDEE/calorie target when available
    const prompt = `You are Vitalis AI, a clinical health advisor.
            A user has the following stats:
            - BMI: ${bmi} (${category})
            - Weight: ${weight_kg} kg
            - Height: ${height_cm} cm
            ${age ? `- Age: ${age}` : ""}
            ${gender ? `- Gender: ${gender}` : ""}
            ${tdeeResult ? `- Estimated maintenance calories (TDEE): ${tdeeResult.tdee} kcal/day` : ""}

            Give a 2-3 sentence personalized health recommendation based on their           BMI${tdeeResult ? " and daily calorie needs" : ""}.
            Be direct, warm, and actionable. No disclaimers.`;

    let aiSuggestion = "";
    try {
      aiSuggestion = await callGeminiWithFallback(prompt);
    } catch (aiErr) {
      logger.error("[BMI] AI Error:", aiErr.message);
      aiSuggestion =
        "Focus on balanced nutrition and consistent activity to optimize your body composition.";
    }

    logger.info(
      `[BMI] Saved â€” userId:${userId} bmi:${bmi} category:${category}${tdeeResult ? ` tdee:${tdeeResult.tdee}` : ""}`,
    );
    res.status(200).json({
      message: "BMI saved",
      id: result.insertId,
      bmi,
      category,
      aiSuggestion,
      bmr: tdeeResult?.bmr ?? null,
      tdee: tdeeResult?.tdee ?? null,
      tdeeWeekly: tdeeResult?.tdeeWeekly ?? null,
      goals: tdeeResult?.goals ?? null,
    });
  } catch (err) {
    logger.error("[BMI] Insert Error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
}

// Get BMI history
async function getBmiHistory(req, res) {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const { rows, total } = await bmiService.getBmiHistory(
      userId,
      limit,
      offset,
    );
    res.json({ records: rows, total });
  } catch (err) {
    logger.error("[BMI] Fetch Error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { saveBmi, getBmiHistory };
