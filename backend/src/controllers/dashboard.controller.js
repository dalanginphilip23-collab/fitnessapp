const dashboardService = require('../services/dashboard.service');

async function getDashboard(req, res) {
  const { userId } = req.params;
  try {
    const stats = await dashboardService.getTodayStats(userId);
    const user = await dashboardService.getUserProfile(userId);
    const sleepData = await dashboardService.getSleepGraphData(userId);
    const plans = await dashboardService.getActivePlan(userId);

    res.json({
      stats: {
        ...(stats[0] || { calories_burned: 0, steps: 0, workout_duration_mins: 0, water_intake_ml: 0 }),
        active_program_count: plans.count,
      },
      active_plan: plans.plan,
      profile: user[0] || { name: "Guest" },
      hrv_data: sleepData || []
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
