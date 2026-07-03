const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/stats/daily/:userId
router.get('/daily/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    const [stats] = await db.execute(
      'SELECT calories_burned, steps, workout_duration_mins FROM daily_stats WHERE user_id = ? AND stat_date = ?',
      [userId, today]
    );

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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;