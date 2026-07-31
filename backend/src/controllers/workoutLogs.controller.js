const workoutLogsService = require('../services/workoutLogs.service');

async function start(req, res) {
  const { workout_type } = req.body;
  try {
    const log = await workoutLogsService.startLog(req.user.id, workout_type);
    res.status(201).json({ session_id: log.id, start_time: log.start_time });
  } catch (err) {
    console.error('start log error:', err.message);
    res.status(500).json({ message: 'Failed to start workout log' });
  }
}

async function end(req, res) {
  const logId = parseInt(req.params.id, 10);
  const { status = 'completed', rep_count = 0 } = req.body;
  try {
    const existing = await workoutLogsService.findOwnedLog(logId, req.user.id);
    if (!existing) return res.status(404).json({ message: 'Log not found' });
    if (existing.status !== 'active') return res.status(409).json({ message: `Already ${existing.status}` });

    const updated = await workoutLogsService.endLog(logId, status, rep_count);
    res.json(updated);
  } catch (err) {
    console.error('end log error:', err.message);
    res.status(500).json({ message: 'Failed to end workout log' });
  }
}

async function list(req, res) {
  try {
    const logs = await workoutLogsService.getLogs(req.user.id);
    res.json({ logs });
  } catch (err) {
    console.error('fetch logs error:', err.message);
    res.status(500).json({ message: 'Failed to fetch workout logs' });
  }
}

module.exports = { start, end, list };
