const dailyNutritionService = require('../services/dailyNutrition.service');

async function saveSession(req, res) {
  const { userId } = req.params;
  const { reps, alignment, velocity, symmetry } = req.body;

  try {
    const [result] = await dailyNutritionService.saveCoachingSession(userId, {
      reps, alignment, velocity, symmetry,
    });

    res.status(201).json({
      message: 'Coaching session saved successfully',
      sessionId: result.insertId
    });
  } catch (err) {
    console.error('Error saving coaching session:', err);
    res.status(500).json({ error: 'Database error' });
  }
}

module.exports = { saveSession };
