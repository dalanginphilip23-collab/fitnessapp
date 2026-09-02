const dashboardService = require('../services/dashboard.service');
const logger = require('../utils/logger');

async function getDashboard(req, res) {
  const { userId } = req.params;
  try {
    const [stats, user, sleepData, plans, weeklyRows] = await Promise.all([
      dashboardService.getTodayStats(userId),
      dashboardService.getUserProfile(userId),
      dashboardService.getSleepGraphData(userId),
      dashboardService.getActivePlan(userId),
      dashboardService.getWeeklySteps(userId),
    ]);

    // Build map YYYY-MM-DD -> steps for the 7-day window
    const weeklyMap = {};
    for (const r of weeklyRows) {
      const key = r.stat_date instanceof Date ? r.stat_date.toISOString().slice(0,10) : String(r.stat_date).slice(0,10);
      weeklyMap[key] = Number(r.steps) || 0;
    }

    res.json({
      stats: {
        ...(stats[0] || { calories_burned: 0, steps: 0, workout_duration_mins: 0, water_intake_ml: 0 }),
        active_program_count: plans.count,
      },
      active_plan: plans.plan,
      profile: user[0] || { name: "Guest" },
      hrv_data: sleepData || [],
      weeklyActivity: weeklyRows,
      weeklyMap,
    });

  } catch (e) {
    logger.error('DASHBOARD ERROR:', e.message);
    logger.error('DASHBOARD STACK:', e.stack);
    res.status(500).json({ error: e.message });
  }
}

async function search(req, res) {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const results = await dashboardService.searchUsers(q);
    res.json(results);
  } catch (e) {
    logger.error('SEARCH ERROR:', e.message);
    res.status(500).json({ error: e.message });
  }
}

module.exports = { getDashboard, search };
