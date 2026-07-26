const express = require('express');
const router = express.Router();
const atelierController = require('../controllers/atelier.controller');

router.get('/summary/:userId', atelierController.summary);

module.exports = router;
