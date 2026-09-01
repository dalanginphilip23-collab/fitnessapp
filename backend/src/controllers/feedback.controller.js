const feedbackService = require('../services/feedback.service');
const logger = require('../utils/logger');

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

    try {
      await feedbackService.sendFeedbackEmail({ name, email, message });
    } catch (mailErr) {
      logger.error('Feedback email failed to send:', mailErr.message);
      return res.status(502).json({
        error: 'Could not send feedback email.'
      });
    }

    res.json({
      success: true,
      message: 'Feedback sent successfully.'
    });

  } catch (err) {
    logger.error('Feedback Error:', err.message);

    res.status(500).json({
      error: err.message
    });
  }
}

module.exports = { submitFeedback };
