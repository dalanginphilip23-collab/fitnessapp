const feedbackService = require('../services/feedback.service');

// PUBLIC FEEDBACK ROUTE
// POST /api/feedback
async function submitFeedback(req, res) {
  try {
    const { name, email, message } = req.body;

    // VALIDATION
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'All fields are required.'
      });
    }

    await feedbackService.sendFeedbackEmail({ name, email, message });

    res.json({
      success: true,
      message: 'Feedback sent successfully.'
    });

  } catch (err) {
    console.error('Feedback Error:', err.message);

    res.status(500).json({
      error: err.message
    });
  }
}

module.exports = { submitFeedback };
