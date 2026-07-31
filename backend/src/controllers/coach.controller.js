const coachService = require('../services/coach.service');

async function getReply(req, res) {
  const { prompt, system } = req.body;
  try {
    const text = await coachService.getCoachReply(prompt, system);
    res.json({ text: text?.trim() });
  } catch (err) {
    console.error('Coach error:', err.message);
    res.status(500).json({ error: 'Could not reach the coach' });
  }
}

module.exports = { getReply };
