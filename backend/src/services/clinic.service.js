const db = require('../config/db');
const { callGeminiWithFallback } = require('../config/gemini');

async function findSession(userId, doctorName) {
  const [existing] = await db.execute(
    'SELECT id FROM chat_sessions WHERE user_id = ? AND doctor_name = ? ORDER BY id DESC LIMIT 1',
    [userId, doctorName]
  );
  return existing;
}

async function getSessionOwner(sessionId) {
  const [rows] = await db.execute(
    'SELECT user_id FROM chat_sessions WHERE id = ?',
    [sessionId]
  );
  return rows[0] ? rows[0].user_id : null;
}

async function createSession(userId, doctorName) {
  const [result] = await db.execute(
    'INSERT INTO chat_sessions (user_id, doctor_name) VALUES (?, ?)',
    [userId, doctorName]
  );
  return result;
}

async function saveUserMessage(sessionId, message) {
  return db.execute(
    'INSERT INTO clinic_messages (session_id, sender, message) VALUES (?, ?, ?)',
    [sessionId, 'user', message]
  );
}

async function saveAiMessage(sessionId, message) {
  return db.execute(
    'INSERT INTO clinic_messages (session_id, sender, message) VALUES (?, ?, ?)',
    [sessionId, 'ai', message]
  );
}

async function getRecentHistory(sessionId) {
  const [history] = await db.execute(
    `SELECT sender, message FROM clinic_messages 
     WHERE session_id = ? 
     ORDER BY created_at ASC 
     LIMIT 10`,
    [sessionId]
  );
  return history;
}

async function getMessages(sessionId) {
  const [rows] = await db.execute(
    `SELECT sender, message, created_at 
     FROM clinic_messages 
     WHERE session_id = ? 
     ORDER BY created_at ASC`,
    [sessionId]
  );
  return rows;
}

async function deleteMessages(sessionId) {
  return db.execute(
    'DELETE FROM clinic_messages WHERE session_id = ?',
    [sessionId]
  );
}

async function getDoctorsByCategory(category) {
  const [rows] = await db.execute(
    'SELECT * FROM doctors WHERE category = ? ORDER BY id ASC',
    [category]
  );
  return rows;
}

async function getAiReply(prompt) {
  return callGeminiWithFallback(prompt);
}

module.exports = {
  findSession,
  createSession,
  getSessionOwner,
  saveUserMessage,
  saveAiMessage,
  getRecentHistory,
  getMessages,
  deleteMessages,
  getDoctorsByCategory,
  getAiReply,
};