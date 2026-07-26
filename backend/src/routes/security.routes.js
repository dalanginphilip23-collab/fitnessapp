const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const verifyUser = require('../middleware/verifyUser');

console.log('verifyUser type:', typeof verifyUser);

router.get('/', verifyUser, securityController.getSessions);
router.delete('/:sessionId', verifyUser, securityController.revokeSession);

module.exports = router;
