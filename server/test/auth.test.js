const test = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword, signToken, verifyToken } = require('../lib/auth');
const { createRateLimiter } = require('../lib/rateLimit');
const { validateWish, validateInvitation } = require('../lib/validate');

const SECRET = 'x'.repeat(32);

test('password hash verifies only the right password', () => {
  const stored = hashPassword('correct horse');
  assert.equal(verifyPassword('correct horse', stored), true);
  assert.equal(verifyPassword('wrong', stored), false);
  assert.equal(verifyPassword('anything', 'garbage'), false);
});

test('token is valid until expiry and rejects tampering', () => {
  const now = 1_000_000;
  const token = signToken(SECRET, now, 1000);
  assert.equal(verifyToken(token, SECRET, now + 500), true);
  assert.equal(verifyToken(token, SECRET, now + 1001), false);
  assert.equal(verifyToken(token, 'y'.repeat(32), now + 500), false);
  const [payload, sig] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ exp: now + 999_999 })).toString('base64url');
  assert.equal(verifyToken(forged + '.' + sig, SECRET, now + 500), false);
  assert.equal(verifyToken(undefined, SECRET, now), false);
  assert.ok(payload);
});

test('rate limiter blocks after max and recovers after the window', () => {
  const allow = createRateLimiter({ max: 2, windowMs: 1000 });
  assert.equal(allow('ip', 0), true);
  assert.equal(allow('ip', 1), true);
  assert.equal(allow('ip', 2), false);
  assert.equal(allow('other', 2), true);
  assert.equal(allow('ip', 1001), true);
});

test('wish validation trims and enforces limits', () => {
  assert.deepEqual(validateWish({ name: ' Ali ', text: ' hi ' }).value, { name: 'Ali', text: 'hi' });
  assert.ok(validateWish({ name: '', text: 'x' }).error);
  assert.ok(validateWish({ name: 'a'.repeat(61), text: 'x' }).error);
  assert.ok(validateWish({ name: 'a', text: 'x'.repeat(501) }).error);
  assert.ok(validateWish(null).error);
});

test('invitation validation strips wishes and rejects non-objects', () => {
  assert.deepEqual(validateInvitation({ groom: 'A', wishes: [1] }).value, { groom: 'A' });
  assert.ok(validateInvitation([]).error);
});
