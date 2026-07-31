const liveCoachingService = require('../services/liveCoaching.service');

// POST /api/live-coaching/sessions/:userId — Start / save a session
async function startSession(req, res) {
  const { userId } = req.params;
  const { exercise_type, started_at } = req.body;

  if (!exercise_type) return res.status(400).json({ error: 'exercise_type is required' });

  try {
    const [result] = await liveCoachingService.startSession(userId, exercise_type, started_at);
    res.status(201).json({ message: 'Session started', session_id: result.insertId });
  } catch (err) {
    console.error('[COACHING] Start session error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/live-coaching/sessions/:sessionId/end — End a session and save summary
async function endSession(req, res) {
  const { sessionId } = req.params;
  const { ended_at, total_reps, avg_alignment, avg_velocity, avg_symmetry } = req.body;

  try {
    const [result] = await liveCoachingService.endSession(sessionId, {
      ended_at, total_reps, avg_alignment, avg_velocity, avg_symmetry,
    });

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Session not found' });

    res.json({ message: 'Session ended', session_id: Number(sessionId) });
  } catch (err) {
    console.error('[COACHING] End session error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// POST /api/live-coaching/sessions/:sessionId/reps — Log a single rep
async function logRep(req, res) {
  const { sessionId } = req.params;
  const { rep_number, feedback_text, alignment, velocity, symmetry } = req.body;

  try {
    const [result] = await liveCoachingService.logRep(sessionId, {
      rep_number, feedback_text, alignment, velocity, symmetry,
    });
    res.status(201).json({ message: 'Rep logged', rep_id: result.insertId });
  } catch (err) {
    console.error('[COACHING] Log rep error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/live-coaching/sessions/:userId — All sessions for a user
async function getSessions(req, res) {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const { rows, total } = await liveCoachingService.getSessionsForUser(userId, limit, offset);
    res.json({ records: rows, total });
  } catch (err) {
    console.error('[COACHING] Fetch sessions error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/live-coaching/sessions/:sessionId/reps — Reps for a session
async function getReps(req, res) {
  const { sessionId } = req.params;

  try {
    const rows = await liveCoachingService.getRepsForSession(sessionId);
    res.json({ reps: rows, total: rows.length });
  } catch (err) {
    console.error('[COACHING] Fetch reps error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/live-coaching/summary/:userId/:date — Daily coaching summary
async function getDailySummary(req, res) {
  const { userId, date } = req.params;

  try {
    const row = await liveCoachingService.getDailySummary(userId, date);
    res.json(row);
  } catch (err) {
    console.error('[COACHING] Daily summary error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { startSession, endSession, logRep, getSessions, getReps, getDailySummary };
