const express = require('express');
const router = express.Router();
const bmiController = require('../controllers/bmi.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.post('/:userId', requireAuth, verifyOwnUserId, bmiController.saveBmi);
router.get('/:userId', requireAuth, verifyOwnUserId, bmiController.getBmiHistory);

module.exports = router;
