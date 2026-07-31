const socialService = require('../services/social.service');

async function getMessages(req, res) {
  const { userId, friendId } = req.params;
  try {
    const messages = await socialService.getMessages(userId, friendId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getMessages };
