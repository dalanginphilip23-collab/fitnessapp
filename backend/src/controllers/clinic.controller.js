const clinicService = require('../services/clinic.service');

async function createOrGetSession(req, res) {
  const { userId, doctorName } = req.body;

  try {
    const existing = await clinicService.findSession(userId, doctorName);

    if (existing.length > 0) {
      return res.json({ sessionId: existing[0].id });
    }

    const result = await clinicService.createSession(userId, doctorName);

    res.json({ sessionId: result.insertId });

  } catch (err) {
    console.error("Session error:", err.message);
    res.status(500).json({ error: 'Failed to create session' });
  }
}

async function sendMessage(req, res) {
  const { sessionId, message, doctorName, doctorSpecialty } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Save user message
    await clinicService.saveUserMessage(sessionId, message);

    // Load chat history for context (last 10 messages)
    const history = await clinicService.getRecentHistory(sessionId);

    // Format history into readable string for the prompt
    const conversationHistory = history
      .map(row => `${row.sender === 'user' ? 'Patient' : doctorName}: ${row.message}`)
      .join('\n');

    // Build prompt for Gemini
    const prompt = `You are ${doctorName}, a ${doctorSpecialty} at Vitalis Virtual Clinic.

                Rules:
                - You ONLY answer questions strictly related to your specialty: ${doctorSpecialty}.
                - If the patient asks about anything outside ${doctorSpecialty}, respond exactly: "I'm sorry, that's outside my area of expertise as a ${doctorSpecialty}. Please consult the               appropriate specialist for that concern."
                - Reply in 1-2 sentences ONLY. Never longer.
                - Be direct and natural like a real doctor texting a patient.
                - Respond specifically to what the patient just said.
                - No long disclaimers. Only add "see a real doctor" if it's truly urgent.

                ${conversationHistory.length > 0 ? `Chat so far:\n${conversationHistory}\n` : ''}
                Patient: ${message}
                ${doctorName}:`;

    // Call Gemini (with Groq fallback)
    const aiReply = await clinicService.getAiReply(prompt);

    // Save AI reply
    await clinicService.saveAiMessage(sessionId, aiReply);

    res.json({ reply: aiReply });

  } catch (err) {
    console.error("Message error:", err.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

async function getMessages(req, res) {
  const { sessionId } = req.params;

  try {
    const rows = await clinicService.getMessages(sessionId);
    res.json(rows);
  } catch (err) {
    console.error("Fetch messages error:", err.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

async function resetChat(req, res) {
  const { sessionId } = req.params;

  try {
    await clinicService.deleteMessages(sessionId);
    res.json({ success: true, message: 'Consultation reset successfully.' });
  } catch (err) {
    console.error('Reset error:', err.message);
    res.status(500).json({ error: 'Failed to reset consultation' });
  }
}

async function getDoctors(req, res) {
  const { category } = req.params;

  try {
    const rows = await clinicService.getDoctorsByCategory(category);
    res.json(rows);
  } catch (err) {
    console.error("Fetch doctors error:", err.message);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
}

module.exports = { createOrGetSession, sendMessage, getMessages, resetChat, getDoctors };
