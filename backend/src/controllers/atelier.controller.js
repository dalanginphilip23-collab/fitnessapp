const atelierService = require('../services/atelier.service');

async function summary(req, res) {
  const { userId } = req.params;
  try {
    const result = await atelierService.getSummary(userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { summary };
