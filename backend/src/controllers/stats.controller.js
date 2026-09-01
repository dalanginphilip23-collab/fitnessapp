const statsService = require('../services/stats.service');
const logger = require('../utils/logger');

async function getDaily(req, res) {
  const { userId } = req.params;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  // Optional ?date=YYYY-MM-DD (used by the meal tracker to show a day's
  // burned calories). Defaults to today (UTC) to preserve prior behaviour.
  const dateParam = req.query.date || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  try {
    const stats = await statsService.getDailyStats(userId, dateParam);

    if (stats.length === 0) {
      return res.json({
        calories_burned: 0,
        steps: 0,
        workout_duration_mins: 0,
      });
    }

    res.json(stats[0]);
  } catch (err) {
    logger.error('daily stats fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

module.exports = { getDaily };
