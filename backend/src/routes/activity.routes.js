const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');

router.post('/save', activityController.save);
router.get('/stats/:userId', activityController.getStats);
router.get('/detail/:id', activityController.getDetail);
router.get('/:userId', activityController.getAllForUser);
router.delete('/:id', activityController.remove);

module.exports = router;
