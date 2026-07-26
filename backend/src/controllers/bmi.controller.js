const bmiService = require('../services/bmi.service');
const { callGeminiWithFallback } = require('../config/gemini');

// Save BMI and return AI suggestion
async function saveBmi(req, res) {
  const { userId } = req.params;
  const { weight_kg, height_cm, age, gender } = req.body;

  if (!weight_kg || !height_cm) {
    return res.status(400).json({ error: 'weight_kg and height_cm are required' });
  }

  const heightM = parseFloat(height_cm) / 100;
  const bmi = parseFloat((parseFloat(weight_kg) / (heightM * heightM)).toFixed(2));
  const category = bmiService.getBmiCategory(bmi);

  try {
    const [result] = await bmiService.insertBmiRecord(
      userId, parseFloat(weight_kg), parseFloat(height_cm), bmi, category
    );

    // FIX: keep user_profiles.height_cm / weight_kg in sync with the
    // latest BMI log, so the Profile page (which computes BMI live
    // from user_profiles) reflects this calculation immediately.
    // Requires a UNIQUE constraint on user_profiles.user_id.
    await bmiService.syncUserProfile(userId, parseFloat(height_cm), parseFloat(weight_kg));

    // Generate AI suggestion
    const prompt = `You are Vitalis AI, a clinical health advisor.
            A user has the following stats:
            - BMI: ${bmi} (${category})
            - Weight: ${weight_kg} kg
            - Height: ${height_cm} cm
            ${age ? `- Age: ${age}` : ''}
            ${gender ? `- Gender: ${gender}` : ''}

            Give a 2-3 sentence personalized health recommendation based on their           BMI.
            Be direct, warm, and actionable. No disclaimers.`;

    let aiSuggestion = '';
    try {
      aiSuggestion = await callGeminiWithFallback(prompt);
    } catch (aiErr) {
      console.error('[BMI] AI Error:', aiErr.message);
      aiSuggestion = 'Focus on balanced nutrition and consistent activity to optimize your body composition.';
    }

    console.log(`[BMI] Saved — userId:${userId} bmi:${bmi} category:${category}`);
    res.status(200).json({ message: 'BMI saved', id: result.insertId, bmi, category, aiSuggestion });

  } catch (err) {
    console.error('[BMI] Insert Error:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

// Get BMI history
async function getBmiHistory(req, res) {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const { rows, total } = await bmiService.getBmiHistory(userId, limit, offset);
    res.json({ records: rows, total });
  } catch (err) {
    console.error('[BMI] Fetch Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { saveBmi, getBmiHistory };
