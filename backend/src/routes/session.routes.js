const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const requireAuth = require('../middleware/requireAuth');

router.post('/start', requireAuth, sessionController.start);
router.patch('/:id/end', requireAuth, sessionController.end);
router.get('/', requireAuth, sessionController.list);

module.exports = router;
