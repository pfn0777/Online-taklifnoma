const crypto = require('node:crypto');

const WISH_NAME_MAX = 60;
const WISH_TEXT_MAX = 500;
const WISH_RATE_MAX = 5;
const WISH_RATE_WINDOW_SECONDS = 10 * 60;
const DATE_TIME_ZONE = 'Asia/Tashkent';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: DATE_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateWish(body) {
  if (!isPlainObject(body)) return { error: 'Body must be an object' };
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!name || !text) return { error: 'name and text are required' };
  if (name.length > WISH_NAME_MAX) return { error: 'name is too long' };
  if (text.length > WISH_TEXT_MAX) return { error: 'text is too long' };
  return { value: { name, text } };
}

function dateLabel(isoString) {
  return dateFormat.format(new Date(isoString)).replace(/\//g, '.');
}

// Vercel overwrites x-forwarded-for, so its first entry is the real client.
function clientKey(headers) {
  const forwarded = String(headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwarded || String(headers['x-real-ip'] || '') || 'unknown';
  return 'wish:' + crypto.createHash('sha256').update(ip).digest('hex');
}

module.exports = {
  validateWish, dateLabel, clientKey,
  WISH_NAME_MAX, WISH_TEXT_MAX, WISH_RATE_MAX, WISH_RATE_WINDOW_SECONDS
};
