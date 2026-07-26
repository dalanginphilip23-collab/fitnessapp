const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');

router.get('/messages/:userId/:friendId', socialController.getMessages);

module.exports = router;
