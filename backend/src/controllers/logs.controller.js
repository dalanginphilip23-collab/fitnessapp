const logsService = require('../services/logs.service');

async function logActivity(req, res) {
  const { userId } = req.params;
  const { calories, steps, minutes } = req.body;

  console.log(`[LOGS] Received — userId:${userId} calories:${calories} steps:${steps} minutes:${minutes}`);

  try {
    const [result] = await logsService.upsertDailyStats(
      userId, parseInt(calories) || 0, parseInt(steps) || 0, parseInt(minutes) || 0
    );
    console.log(`[LOGS] OK — affectedRows:${result.affectedRows}`);
    res.status(200).json({ message: "Activity logged successfully" });
  } catch (err) {
    console.error("[LOGS] DB Error:", err.message);
    res.status(500).json({ error: 'Failed to log activity' });
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
