const statsService = require('../services/stats.service');

async function getDaily(req, res) {
  const { userId } = req.params;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    const stats = await statsService.getDailyStats(userId, today);

    if (stats.length === 0) {
      return res.json({
        calories_burned: 0,
        steps: 0,
        workout_duration_mins: 0,
      });
    }

    res.json(stats[0]);
  } catch (err) {
    console.error('daily stats fetch error:', err.message);
    res.status(500).json({ error: 'Failed to load daily stats' });
  }
}

module.exports = { getDaily };
