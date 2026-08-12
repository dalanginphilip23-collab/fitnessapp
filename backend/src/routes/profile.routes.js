const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const profileController = require('../controllers/profile.controller');

router.put('/update', requireAuth, profileController.updateProfile);
router.get('/:userId', requireAuth, verifyOwnUserId, profileController.getProfile);

module.exports = router;
