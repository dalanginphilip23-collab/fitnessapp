const analyticsService = require('../services/analytics.service');

async function summary(req, res) {
  const { userId } = req.params;
  try {
    const result = await analyticsService.getSummary(userId);
    res.json(result || { vo2_max: 0, hrv: 0, stress: 0 });
  } catch (err) {
    console.error('[Summary] Error:', err.message);
    res.status(500).json({ error: 'Failed to load summary' });
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
    console.error('[Zones] Error:', err.message);
    res.status(500).json({ error: 'Failed to load zone data' });
  }
}

async function vo2(req, res) {
  const { userId } = req.params;
  try {
    const rows = await analyticsService.getVo2(userId);
    res.json(rows);
  } catch (err) {
    console.error('[VO2] Error:', err.message);
    res.status(500).json({ error: 'Failed to load VO2 data' });
  }
}

module.exports = { summary, zones, vo2 };
