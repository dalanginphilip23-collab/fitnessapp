const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/me', authController.getMe);
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;
