// Backwards-compatible re-export — logic lives in verifyOwnership factory.
const { verifyOwnUserId } = require('./verifyOwnership');
module.exports = verifyOwnUserId;
