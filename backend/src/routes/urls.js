const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const { generateShortCode } = require('../services/shortener');
const { invalidateCache } = require('../services/cache');

const router = express.Router();
router.use(authMiddleware);
router.use(rateLimiter);

router.post('/', async (req, res) => {
  const { originalUrl, alias, expiresAt } = req.body;
  if (!originalUrl) return res.status(400).json({ error: 'originalUrl is required' });
  try {
    let shortCode = alias || await generateShortCode();
    if (alias) {
      if (!/^[a-zA-Z0-9-]{3,30}$/.test(alias)) {
        return res.status(400).json({ error: 'Invalid alias format' });
      }
      const taken = await db.query('SELECT id FROM urls WHERE short_code = $1', [alias]);
      if (taken.rows.length) return res.status(409).json({ error: 'Alias already taken' });
    }
    const result = await db.query(
      `INSERT INTO urls (user_id, original_url, short_code, is_custom, expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, originalUrl, shortCode, !!alias, expiresAt || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { search, from, to, sortBy = 'created_at', order = 'desc' } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  try {
    const result = await db.query(
      `SELECT u.*, COUNT(c.id)::int as click_count
       FROM urls u
       LEFT JOIN clicks c ON c.url_id = u.id
       WHERE u.user_id = $1
         AND ($2::text IS NULL OR u.original_url ILIKE '%' || $2 || '%'
              OR u.short_code ILIKE '%' || $2 || '%')
         AND ($3::date IS NULL OR u.created_at >= $3)
         AND ($4::date IS NULL OR u.created_at <= $4)
       GROUP BY u.id
       ORDER BY ${sortBy === 'clicks' ? 'click_count' : 'u.created_at'} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $5 OFFSET $6`,
      [req.userId, search || null, from || null, to || null, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { originalUrl, expiresAt } = req.body;
  try {
    const result = await db.query(
      `UPDATE urls SET original_url = COALESCE($1, original_url),
       expires_at = COALESCE($2, expires_at)
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [originalUrl || null, expiresAt || null, req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'URL not found' });
    await invalidateCache(result.rows[0].short_code);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM urls WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'URL not found' });
    await invalidateCache(result.rows[0].short_code);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
