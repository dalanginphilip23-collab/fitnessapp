// Shared ownership guard factory — single source for IDOR checks.
// Used by verifyOwnUserId and verifyOwnUserIdBody for backward compatibility.

function createVerifyOwnership({ source, bodyKeys = ['userId', 'user_id', 'sender_id'] }) {
  return function verifyOwnership(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let targetId = null;
    if (source === 'params') {
      targetId = req.params.userId ?? req.params.id ?? null;
      // support generic :userId param check
      if (!targetId && req.params.userId) targetId = req.params.userId;
    } else if (source === 'body') {
      for (const k of bodyKeys) {
        if (req.body && req.body[k] != null) { targetId = req.body[k]; break; }
      }
    } else if (source === 'either') {
      targetId = req.params.userId ?? null;
      if (!targetId && req.body) {
        for (const k of bodyKeys) {
          if (req.body[k] != null) { targetId = req.body[k]; break; }
        }
      }
    }

    // If no targetId found, let controller decide (some routes use body fallback)
    // For strict routes, require match when targetId exists
    if (targetId != null && String(req.user.id) !== String(targetId)) {
      return res.status(403).json({ error: 'Forbidden: you can only access your own data' });
    }

    // For params-guarded routes, require param to exist and match
    if (source === 'params' && targetId == null) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    next();
  };
}

const verifyOwnUserId = createVerifyOwnership({ source: 'params' });
const verifyOwnUserIdBody = createVerifyOwnership({ source: 'body' });

module.exports = { verifyOwnUserId, verifyOwnUserIdBody };
