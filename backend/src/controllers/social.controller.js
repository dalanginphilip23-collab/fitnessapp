const socialService = require('../services/social.service');

async function getMessages(req, res) {
  const { userId, friendId } = req.params;
  try {
    const messages = await socialService.getMessages(userId, friendId);
    res.json(messages);
  } catch (err) {
    console.error('social messages error:', err.message);
    res.status(500).json({ error: 'Failed to load messages' });
  }
}

module.exports = { getMessages };
