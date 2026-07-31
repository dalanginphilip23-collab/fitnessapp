const atelierService = require('../services/atelier.service');

async function summary(req, res) {
  const { userId } = req.params;
  try {
    const result = await atelierService.getSummary(userId);
    res.json(result);
  } catch (err) {
    console.error('Atelier summary error:', err.message);
    res.status(500).json({ error: 'Failed to load summary' });
  }
}

module.exports = { summary };
