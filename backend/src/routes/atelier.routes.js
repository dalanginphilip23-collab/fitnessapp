const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const atelierController = require('../controllers/atelier.controller');

router.get('/summary/:userId', requireAuth, verifyOwnUserId, atelierController.summary);

module.exports = router;
