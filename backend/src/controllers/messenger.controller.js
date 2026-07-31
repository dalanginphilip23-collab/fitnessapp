const messengerService = require('../services/messenger.service');

async function getContacts(req, res) {
  const { userId } = req.params;
  try {
    const rows = await messengerService.getContacts(userId);
    res.json(rows);
  } catch (err) {
    console.error("Contacts Error:", err);
    res.status(500).json({ error: "Database Error fetching contacts" });
  }
}

async function getMessageHistory(req, res) {
  const { userId, contactId } = req.params;
  try {
    const rows = await messengerService.getMessageHistory(userId, contactId);
    res.json(rows);
  } catch (err) {
    console.error("History Error:", err);
    res.status(500).json({ error: "Database Error fetching history" });
  }
}

async function sendMessage(req, res) {
  const { sender_id, receiver_id, content } = req.body;
  if (!sender_id || !receiver_id || !content?.trim()) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const message = await messengerService.sendMessage(sender_id, receiver_id, content);
    res.status(201).json(message);
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ error: "Could not save message" });
  }
}

async function searchUsers(req, res) {
  const { query, excludeId } = req.query;
  if (!query?.trim()) return res.json([]);
  try {
    const rows = await messengerService.searchUsers(query, excludeId);
    res.json(rows);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Search failed" });
  }
}

async function addFriend(req, res) {
  const { userId, friendId } = req.body;
  if (!userId || !friendId) {
    return res.status(400).json({ error: "Missing userId or friendId" });
  }
  try {
    await messengerService.addFriend(userId, friendId);
    res.json({ success: true, message: "Added to Close Friends" });
  } catch (err) {
    console.error("Add Friend Error:", err);
    res.status(500).json({ error: "Could not add friend" });
  }
}

module.exports = { getContacts, getMessageHistory, sendMessage, searchUsers, addFriend };
