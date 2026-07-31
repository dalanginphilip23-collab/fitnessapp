const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plans.controller');

router.post('/enroll', plansController.enroll);
router.post('/progress/complete', plansController.completeDay);
router.get('/progress/:userId/:planId', plansController.getProgress);
router.get('/content/:planId', plansController.getContent);
router.get('/:userId', plansController.getMarketplace);

module.exports = router;
