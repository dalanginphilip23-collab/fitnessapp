const express = require('express');
const router = express.Router();
const sleepController = require('../controllers/sleep.controller');

router.post('/:userId', sleepController.create);
router.get('/:userId/today', sleepController.getToday);
router.get('/:userId', sleepController.getGraph);
router.get('/:userId/analysis', sleepController.getAnalysis);
router.get('/:userId/scatter', sleepController.getScatter);

module.exports = router;
