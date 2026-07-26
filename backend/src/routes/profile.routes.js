const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const verifyUser = require('../middleware/verifyUser');

router.put('/update', verifyUser, profileController.updateProfile);
router.get('/:userId', profileController.getProfile);

module.exports = router;
