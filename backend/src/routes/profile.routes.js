const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const verifyUser = require('../middleware/verifyUser');
const requireAuth = require('../middleware/requireAuth');

router.put('/update', verifyUser, profileController.updateProfile);

// Intentionally NOT restricted to self-only: profile.controller.getProfile
// returns basic profile info and is used to view other users' profiles
// (e.g. from Messenger/social features). Restricting to self would break
// that. Login is still required so anonymous callers can't scrape profiles.
router.get('/:userId', requireAuth, profileController.getProfile);

module.exports = router;
