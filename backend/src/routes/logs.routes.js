const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');

router.post('/:userId', logsController.logActivity);
router.get('/history/:userId', logsController.getHistory);

module.exports = router;
