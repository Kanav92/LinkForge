const redisClient = require('../config/redis');
const db = require('../config/db');

async function getCachedUrl(shortCode) {
  const cached = await redisClient.get(`url:${shortCode}`);
  if (cached) return JSON.parse(cached);

  const result = await db.query(
    `SELECT * FROM urls WHERE short_code = $1
     AND (expires_at IS NULL OR expires_at > NOW())`,
    [shortCode]
  );
  if (!result.rows[0]) return null;

  await redisClient.setEx(`url:${shortCode}`, 3600, JSON.stringify(result.rows[0]));
  return result.rows[0];
}

async function invalidateCache(shortCode) {
  await redisClient.del(`url:${shortCode}`);
}

module.exports = { getCachedUrl, invalidateCache };
