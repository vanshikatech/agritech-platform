const WINDOW_MS = 15 * 60 * 1000;

const makeLimiter = ({ limit, windowMs = WINDOW_MS, message }) => {
  const clients = new Map();
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of clients) {
      if (entry.resetAt <= now) clients.delete(key);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    let entry = clients.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      clients.set(key, entry);
    }
    entry.count += 1;
    res.set('RateLimit-Limit', String(limit));
    res.set('RateLimit-Remaining', String(Math.max(0, limit - entry.count)));
    res.set('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
    if (entry.count > limit) {
      return res.status(429).json({ success: false, message, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) });
    }
    return next();
  };
};

// In-memory limits protect a single Node process. Multi-instance deployments should
// use a shared store or enforce equivalent limits at the hosting proxy.
const apiRateLimit = makeLimiter({
  limit: 600,
  message: 'Too many requests. Please wait a few minutes and try again.',
});

const authRateLimit = makeLimiter({
  limit: 10,
  message: 'Too many authentication attempts. Wait 15 minutes before trying again.',
});

module.exports = { apiRateLimit, authRateLimit };
