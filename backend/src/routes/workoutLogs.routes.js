const express = require('express');
const router = express.Router();
const workoutLogsController = require('../controllers/workoutLogs.controller');
const requireAuth = require('../middleware/requireAuth');

router.post('/start', requireAuth, workoutLogsController.start);
router.patch('/:id/end', requireAuth, workoutLogsController.end);
router.get('/', requireAuth, workoutLogsController.list);

module.exports = router;
