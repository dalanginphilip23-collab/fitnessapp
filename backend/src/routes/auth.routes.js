const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const rateLimit = require('../middleware/rateLimit');

const hour = 60 * 60 * 1000;

router.get('/me', authController.getMe);
router.post('/register', rateLimit({ windowMs: hour, max: 10 }), authController.register);
router.post('/verify-email', rateLimit({ windowMs: hour, max: 20 }), authController.verifyEmail);
router.post('/resend-verification', rateLimit({ windowMs: hour, max: 5 }), authController.resendVerification);
router.post('/login', rateLimit({ windowMs: hour, max: 30 }), authController.login);
router.post('/google-login', rateLimit({ windowMs: hour, max: 30 }), authController.googleLogin);
router.post('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;
