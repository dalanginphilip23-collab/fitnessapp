const bmiService = require("../services/bmi.service");
const { callGeminiWithFallback } = require("../config/gemini");

async function saveBmi(req, res) {
  const { userId } = req.params;
  const { weight_kg, height_cm, age, gender, activity_level } = req.body;

  if (!weight_kg || !height_cm) {
    return res
      .status(400)
      .json({ error: "weight_kg and height_cm are required" });
  }

  const weightNum = parseFloat(weight_kg);
  const heightNum = parseFloat(height_cm);
  if (!(weightNum > 0) || !(heightNum > 50) || !(heightNum < 300)) {
    return res
      .status(400)
      .json({ error: "Invalid weight or height values" });
  }

  const heightM = heightNum / 100;
  const bmi = parseFloat((weightNum / (heightM * heightM)).toFixed(2));
  const category = bmiService.getBmiCategory(bmi);
  const ageNum = age ? parseInt(age, 10) : null;
  const sex = gender === "female" ? "female" : "male";
  const tdeeResult = bmiService.calcTdee({
    sex,
    kg: weightNum,
    cm: heightNum,
    age: ageNum,
    activityId: activity_level,
  });

  try {
    const [result] = await bmiService.insertBmiRecord(
      userId,
      weightNum,
      heightNum,
      bmi,
      category,
      ageNum,
      activity_level || null,
      tdeeResult?.bmr ?? null,
      tdeeResult?.tdee ?? null,
    );

    await bmiService.syncUserProfile(
      userId,
      heightNum,
      weightNum,
    );

    // Generate AI suggestion — now aware of TDEE/calorie target when available
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
      console.error("[BMI] AI Error:", aiErr.message);
      aiSuggestion =
        "Focus on balanced nutrition and consistent activity to optimize your body composition.";
    }

    console.log(
      `[BMI] Saved — userId:${userId} bmi:${bmi} category:${category}${tdeeResult ? ` tdee:${tdeeResult.tdee}` : ""}`,
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
    console.error("[BMI] Insert Error:", err.message);
    res.status(500).json({ error: "Failed to save BMI" });
  }
}

// Get BMI history
async function getBmiHistory(req, res) {
  const { userId } = req.params;
  const parsedLimit = parseInt(req.query.limit, 10);
  const limit = Math.min(Math.max(isNaN(parsedLimit) ? 10 : parsedLimit, 1), 100);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

  try {
    const { rows, total } = await bmiService.getBmiHistory(
      userId,
      limit,
      offset,
    );
    res.json({ records: rows, total });
  } catch (err) {
    console.error("[BMI] Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch BMI history" });
  }
}

module.exports = { saveBmi, getBmiHistory };
