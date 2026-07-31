const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.get('/:userId', requireAuth, verifyOwnUserId, profileController.getProfile);
router.put('/update', requireAuth, profileController.updateProfile);

module.exports = router;
