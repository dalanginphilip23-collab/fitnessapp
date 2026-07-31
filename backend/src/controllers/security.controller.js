const securityService = require('../services/security.service');

// GET /api/security - fetch all sessions for the logged in user
async function getSessions(req, res) {
  const userId = req.user.id;

  try {
    const rows = await securityService.getSessionsForUser(userId);
    res.json(rows);
  } catch (err) {
    console.error('fetch sessions error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/security/:sessionId - remove a specific session
async function revokeSession(req, res) {
  const userId = req.user.id;
  const { sessionId } = req.params;

  try {
    // user_id check makes sure you can only delete your own sessions
    await securityService.deleteSession(sessionId, userId);
    res.json({ success: true, message: 'Session removed' });
  } catch (err) {
    console.error('delete session error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getSessions, revokeSession };
