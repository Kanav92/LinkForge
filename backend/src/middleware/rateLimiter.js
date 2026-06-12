const redisClient = require('../config/redis');

module.exports = async (req, res, next) => {
  const key = `rl:${req.ip}`;
  try {
    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.expire(key, 60);
    res.set('X-RateLimit-Limit', 100);
    res.set('X-RateLimit-Remaining', Math.max(0, 100 - count));
    if (count > 100) {
      const ttl = await redisClient.ttl(key);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: ttl,
      });
    }
    next();
  } catch (err) {
    next();
  }
};
