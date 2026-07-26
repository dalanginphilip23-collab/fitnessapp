const coachService = require('../services/coach.service');

async function getReply(req, res) {
  const { prompt, system } = req.body;
  try {
    const text = await coachService.getCoachReply(prompt, system);
    res.json({ text: text?.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getReply };
