const db = require('../config/db');

async function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const exists = await db.query('SELECT id FROM urls WHERE short_code = $1', [code]);
  if (exists.rows.length) return generateShortCode();
  return code;
}

module.exports = { generateShortCode };
