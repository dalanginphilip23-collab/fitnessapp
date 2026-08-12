const logsService = require('../services/logs.service');
const plansService = require('../services/plans.service');

async function logActivity(req, res) {
  const { userId } = req.params;
  const { calories, steps, minutes } = req.body;

  const cal = parseInt(calories) || 0;
  const stp = parseInt(steps) || 0;
  const min = parseInt(minutes) || 0;

  console.log(`[LOGS] Received — userId:${userId} calories:${cal} steps:${stp} minutes:${min}`);

  try {
    await logsService.logDailyActivity(userId, cal, stp, min);
    console.log(`[LOGS] OK — userId:${userId}`);

    // Best-effort: if the logged duration covers the plan's current day,
    // mark it complete. A failure here must never break the log save.
    if (min > 0) {
      try {
        const completed = await plansService.autoCompleteDayForWorkout(userId, min);
        if (completed.completed) {
          console.log(`[LOGS] Plan day auto-completed — plan:${completed.planId} day:${completed.dayNumber}`);
        }
      } catch (err) {
        console.error("[LOGS] Plan auto-complete skipped:", err.message);
      }
    }

    res.status(200).json({ message: "Activity logged successfully" });
  } catch (err) {
    console.error("[LOGS] DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

async function getHistory(req, res) {
  const { userId } = req.params;
  try {
    const rows = await logsService.getWorkoutHistory(userId);
    res.json(rows);
  } catch (err) {
    console.error("History fetch error:", err.message);
    res.status(500).json({ error: "Failed to retrieve archives" });
  }
}

module.exports = { logActivity, getHistory };
