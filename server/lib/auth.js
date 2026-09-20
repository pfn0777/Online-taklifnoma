const crypto = require('node:crypto');

const SCRYPT_KEY_LEN = 64;
const SALT_BYTES = 16;
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const HASH_PREFIX = 'scrypt';

function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_BYTES);
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEY_LEN);
  return [HASH_PREFIX, salt.toString('hex'), hash.toString('hex')].join('$');
}

function verifyPassword(password, stored) {
  const [prefix, saltHex, hashHex] = String(stored).split('$');
  if (prefix !== HASH_PREFIX || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function signToken(secret, now = Date.now(), ttlMs = TOKEN_TTL_MS) {
  const payload = Buffer.from(JSON.stringify({ exp: now + ttlMs })).toString('base64url');
  return payload + '.' + sign(payload, secret);
}

function verifyToken(token, secret, now = Date.now()) {
  if (typeof token !== 'string') return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > now;
  } catch (err) {
    console.warn('auth: token payload is not valid JSON', err);
    return false;
  }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, TOKEN_TTL_MS };
