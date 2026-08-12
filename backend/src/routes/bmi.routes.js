const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const bmiController = require('../controllers/bmi.controller');

router.post('/:userId', requireAuth, verifyOwnUserId, bmiController.saveBmi);
router.get('/:userId', requireAuth, verifyOwnUserId, bmiController.getBmiHistory);

module.exports = router;
