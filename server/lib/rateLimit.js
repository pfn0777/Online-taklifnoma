// In-memory fixed-window limiter. Fine for one process; resets on restart.
function createRateLimiter({ max, windowMs }) {
  const hits = new Map();

  function prune(now) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }

  return function allow(key, now = Date.now()) {
    prune(now);
    const entry = hits.get(key);
    if (!entry) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= max;
  };
}

module.exports = { createRateLimiter };
