const publicService = require('../services/public.service');

// Public, unauthenticated endpoint — powers the landing page "live" counters.
// Only aggregate counts are exposed; no user data ever leaves this endpoint.
async function getStats(req, res) {
  try {
    const stats = await publicService.getPublicStats();
    res.json({ success: true, ...stats });
  } catch (err) {
    console.error('public stats fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { getStats };
