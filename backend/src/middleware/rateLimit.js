// Lightweight in-memory sliding-window rate limiter.
//
// NOTE: this is per-process state — it resets on restart and is not shared
// across multiple instances. Good enough for a single-instance deployment;
// swap for a Redis-backed limiter (e.g. express-rate-limit + ioredis) when
// scaling horizontally.

const buckets = new Map();

// Prune stale buckets once a minute so the Map doesn't grow without bound.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.startedAt > 60 * 60 * 1000) {
      buckets.delete(key);
    }
  }
}, 60 * 1000).unref();

function keyFor(req) {
  // Prefer the authenticated user id so a shared device/proxy IP can't lock
  // everyone out; fall back to the remote address.
  return req.user && req.user.id != null
    ? `u:${req.user.id}`
    : `ip:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
}

// windowMs: sliding window length in ms, max: max requests allowed per window.
function rateLimit({ windowMs, max }) {
  return (req, res, next) => {
    const key = keyFor(req);
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now - bucket.startedAt >= windowMs) {
      buckets.set(key, { startedAt: now, count: 1 });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfter = Math.ceil((windowMs - (now - bucket.startedAt)) / 1000);
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        retryAfter,
      });
    }

    next();
  };
}

module.exports = rateLimit;