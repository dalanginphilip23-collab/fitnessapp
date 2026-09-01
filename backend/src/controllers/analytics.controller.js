const analyticsService = require('../services/analytics.service');
const logger = require('../utils/logger');

async function summary(req, res) {
  const { userId } = req.params;
  try {
    const result = await analyticsService.getSummary(userId);
    res.json(result || { vo2_max: 0, hrv: 0, stress: 0 });
  } catch (err) {
    logger.error('[Summary] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function zones(req, res) {
  const { userId } = req.params;
  const { timeframe = 'weekly' } = req.query;

  try {
    const rows = await analyticsService.getZones(userId, timeframe);

    if (!rows.length) return res.json([]);

    res.json(rows.map(row => ({
      zone: row.zone,
      label: row.label,
      minutes: row.minutes,
      value: `${row.pct}%`,
    })));

  } catch (err) {
    logger.error('[Zones] Error:', err.message);
    res.json([]);
  }
}

async function vo2(req, res) {
  const { userId } = req.params;
  try {
    const rows = await analyticsService.getVo2(userId);
    res.json(rows);
  } catch (err) {
    logger.error('[VO2] Error:', err.message);
    res.json([]);
  }
}

module.exports = { summary, zones, vo2 };
