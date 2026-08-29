const dashboardService = require('../services/dashboard.service');

async function getDashboard(req, res) {
  const { userId } = req.params;
  try {
    const stats = await dashboardService.getTodayStats(userId);
    const user = await dashboardService.getUserProfile(userId);
    const sleepData = await dashboardService.getSleepGraphData(userId);
    const plans = await dashboardService.getActivePlan(userId);
    const weeklyRows = await dashboardService.getWeeklySteps(userId);

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
    console.error('DASHBOARD ERROR:', e.message);
    console.error('DASHBOARD STACK:', e.stack);
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
    console.error('SEARCH ERROR:', e.message);
    res.status(500).json({ error: e.message });
  }
}

module.exports = { getDashboard, search };
