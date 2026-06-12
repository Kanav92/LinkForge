const express = require('express');
const db = require('../config/db');
const { getCachedUrl } = require('../services/cache');

const router = express.Router();

router.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  try {
    const url = await getCachedUrl(shortCode);
    if (!url) return res.status(404).json({ error: 'URL not found' });
    if (url.expires_at && new Date(url.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This link has expired' });
    }
    await db.query(
      'INSERT INTO clicks (url_id, ip, user_agent) VALUES ($1, $2, $3)',
      [url.id, req.ip, req.headers['user-agent']]
    );
    res.redirect(302, url.original_url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
