const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgotPassword.controller');
const rateLimit = require('../middleware/rateLimit');

const hour = 60 * 60 * 1000;

router.post('/send-otp', rateLimit({ windowMs: hour, max: 10 }), forgotPasswordController.sendOtp);
router.post('/verify-otp', rateLimit({ windowMs: hour, max: 15 }), forgotPasswordController.verifyOtp);
router.post('/reset-password', rateLimit({ windowMs: hour, max: 10 }), forgotPasswordController.resetPassword);

module.exports = router;
