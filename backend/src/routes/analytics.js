const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/:urlId', async (req, res) => {
  try {
    const urlCheck = await db.query(
      'SELECT * FROM urls WHERE id = $1 AND user_id = $2',
      [req.params.urlId, req.userId]
    );
    if (!urlCheck.rows.length) return res.status(404).json({ error: 'URL not found' });

    const totalClicks = await db.query(
      'SELECT COUNT(*)::int as count FROM clicks WHERE url_id = $1',
      [req.params.urlId]
    );

    const clicksByDay = await db.query(
      `SELECT DATE(clicked_at) as date, COUNT(*)::int as clicks
       FROM clicks WHERE url_id = $1
       AND clicked_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(clicked_at)
       ORDER BY date`,
      [req.params.urlId]
    );

    res.json({
      url: urlCheck.rows[0],
      totalClicks: totalClicks.rows[0].count,
      clicksByDay: clicksByDay.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
