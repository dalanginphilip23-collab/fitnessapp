const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { callGeminiWithFallback } = require('../config/gemini');

//  CREATE / GET SESSION (auto-resets daily, race-proof)
router.post('/session', async (req, res) => {
    const { userId, doctorName } = req.body;

    if (!userId || !doctorName) {
        return res.status(400).json({ error: "userId and doctorName are required" });
    }

    try {
        // Atomically create-or-reuse today's session for this user+doctor.
        // Requires: UNIQUE KEY uniq_session_per_day (user_id, doctor_name, session_date)
        // If two requests race, MySQL serializes them and both resolve to the same row.
        const [result] = await db.execute(
            `INSERT INTO chat_sessions (user_id, doctor_name, session_date)
             VALUES (?, ?, CURDATE())
             ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
            [userId, doctorName]
        );

        res.json({ sessionId: result.insertId });

    } catch (err) {
        console.error("Session error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// SEND MESSAGE
router.post('/message', async (req, res) => {
    const { sessionId, message, doctorName, doctorSpecialty } = req.body;

    if (!sessionId || !message) {
        return res.status(400).json({ error: "sessionId and message are required" });
    }

    try {
        // Save user message
        await db.execute(
            'INSERT INTO clinic_messages (session_id, sender, message) VALUES (?, "user", ?)',
            [sessionId, message]
        );

        // Load chat history for context (last 10 messages)
        const [history] = await db.execute(
            `SELECT sender, message FROM clinic_messages 
             WHERE session_id = ? 
             ORDER BY created_at ASC 
             LIMIT 10`,
            [sessionId]
        );

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
        const aiReply = await callGeminiWithFallback(prompt);

        // Save AI reply
        await db.execute(
            'INSERT INTO clinic_messages (session_id, sender, message) VALUES (?, "ai", ?)',
            [sessionId, aiReply]
        );

        res.json({ reply: aiReply });

    } catch (err) {
        console.error("Message error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


//  GET MESSAGES (CHAT HISTORY)
router.get('/messages/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        const [rows] = await db.execute(
            `SELECT sender, message, created_at 
             FROM clinic_messages 
             WHERE session_id = ? 
             ORDER BY created_at ASC`,
            [sessionId]
        );

        res.json(rows);

    } catch (err) {
        console.error("Fetch messages error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// RESET CHAT (DELETE MESSAGES) — for manual "New Consultation" while working
router.delete('/messages/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        await db.execute(
            'DELETE FROM clinic_messages WHERE session_id = ?',
            [sessionId]
        );

        res.json({ success: true, message: 'Consultation reset successfully.' });

    } catch (err) {
        console.error('Reset error:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// GET DOCTORS BY CATEGORY
router.get('/doctors/:category', async (req, res) => {
    const { category } = req.params;

    try {
        const [rows] = await db.execute(
            'SELECT * FROM doctors WHERE category = ? ORDER BY id ASC',
            [category]
        );

        res.json(rows);

    } catch (err) {
        console.error("Fetch doctors error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;