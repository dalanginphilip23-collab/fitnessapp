const publicService = require('../services/public.service');
const logger = require('../utils/logger');

// Public, unauthenticated endpoint â€” powers the landing page "live" counters.
// Only aggregate counts are exposed; no user data ever leaves this endpoint.
async function getStats(req, res) {
  try {
    const stats = await publicService.getPublicStats();
    res.json({ success: true, ...stats });
  } catch (err) {
    logger.error('public stats fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { getStats };
