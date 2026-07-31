const sessionService = require('../services/session.service');

// POST /api/workout-sessions/start
async function start(req, res) {
  const userId = req.user.id;
  const planId = req.body.plan_id ?? null;

  try {
    const session = await sessionService.startSession(userId, planId);

    res.status(201).json({
      session_id: session.id,
      start_time: session.start_time,
    });

  } catch (err) {
    console.error('start session error:', err.message);
    res.status(500).json({ message: 'Failed to start session' });
  }
}

// PATCH /api/workout-sessions/:id/end
async function end(req, res) {
  const sessionId = parseInt(req.params.id, 10);
  const userId = req.user.id;
  const status = req.body.status === 'cancelled' ? 'cancelled' : 'completed';

  if (!sessionId || isNaN(sessionId)) {
    return res.status(400).json({ message: 'Invalid session id' });
  }

  try {
    const existing = await sessionService.findOwnedSession(sessionId, userId);

    if (!existing) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (existing.status !== 'active') {
      return res.status(409).json({ message: `Session already ${existing.status}` });
    }

    const updated = await sessionService.endSession(sessionId, status);

    res.json({
      session_id: updated.id,
      start_time: updated.start_time,
      end_time: updated.end_time,
      status: updated.status,
      duration_seconds: updated.duration_seconds,
    });

  } catch (err) {
    console.error('end session error:', err.message);
    res.status(500).json({ message: 'Failed to end session' });
  }
}

// GET /api/workout-sessions
async function list(req, res) {
  const userId = req.user.id;
  const parsedLimit = parseInt(req.query.limit, 10);
  const limit = Math.min(Math.max(isNaN(parsedLimit) ? 20 : parsedLimit, 1), 100);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

  try {
    const { sessions, total } = await sessionService.getSessions(userId, limit, offset);
    res.json({ sessions, total, limit, offset });

  } catch (err) {
    console.error('fetch sessions error:', err.message);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
}

module.exports = { start, end, list };
