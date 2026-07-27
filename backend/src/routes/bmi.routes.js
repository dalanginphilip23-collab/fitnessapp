const express = require('express');
const router = express.Router();
const bmiController = require('../controllers/bmi.controller');

router.post('/:userId', bmiController.saveBmi);
router.get('/:userId', bmiController.getBmiHistory);

module.exports = router;
