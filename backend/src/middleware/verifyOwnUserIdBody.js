// Backwards-compatible re-export — logic lives in verifyOwnership factory.
const { verifyOwnUserIdBody } = require('./verifyOwnership');
module.exports = verifyOwnUserIdBody;
