const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/wishes');
const { validateWish, clientKey, WISH_NAME_MAX, WISH_TEXT_MAX } = require('../api/_lib/wish');

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

function mockRes() {
  const res = { headers: {}, statusCode: 200, body: null };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
}

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

// Replaces global fetch with a scripted sequence: [rateLimitResponse, insertResponse].
function scriptFetch(...responses) {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    return responses.shift();
  };
  return calls;
}

const okReq = () => ({ method: 'POST', headers: { 'x-forwarded-for': '1.2.3.4' }, body: { name: 'Ali', text: 'Baxt tilayman' } });

test('validateWish trims and enforces limits', () => {
  assert.deepEqual(validateWish({ name: ' Ali ', text: ' Hi ' }).value, { name: 'Ali', text: 'Hi' });
  assert.ok(validateWish({ name: '', text: 'x' }).error);
  assert.ok(validateWish({ name: 'a'.repeat(WISH_NAME_MAX + 1), text: 'x' }).error);
  assert.ok(validateWish({ name: 'a', text: 'x'.repeat(WISH_TEXT_MAX + 1) }).error);
  assert.ok(validateWish(null).error);
});

test('clientKey uses first forwarded IP and hashes it', () => {
  const a = clientKey({ 'x-forwarded-for': '1.1.1.1, 9.9.9.9' });
  assert.equal(a, clientKey({ 'x-forwarded-for': '1.1.1.1' }));
  assert.notEqual(a, clientKey({ 'x-forwarded-for': '2.2.2.2' }));
  assert.ok(!a.includes('1.1.1.1'));
});

test('rejects non-POST with 405', async () => {
  const res = mockRes();
  await handler({ method: 'GET', headers: {} }, res);
  assert.equal(res.statusCode, 405);
});

test('rejects invalid body with 400 before touching Supabase', async () => {
  const calls = scriptFetch();
  const res = mockRes();
  await handler({ method: 'POST', headers: {}, body: { name: '', text: '' } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(calls.length, 0);
});

test('returns 429 when rate limit is exceeded and does not insert', async () => {
  const calls = scriptFetch(jsonResponse(200, false));
  const res = mockRes();
  await handler(okReq(), res);
  assert.equal(res.statusCode, 429);
  assert.equal(calls.length, 1);
});

test('creates a wish and returns id, name, text, date label', async () => {
  const calls = scriptFetch(
    jsonResponse(200, true),
    jsonResponse(201, [{ id: 7, name: 'Ali', text: 'Baxt tilayman', created_at: '2026-09-19T10:00:00Z' }])
  );
  const res = mockRes();
  await handler(okReq(), res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { id: 7, name: 'Ali', text: 'Baxt tilayman', date: '19.09.2026' });
  assert.equal(calls[1].url, 'https://example.supabase.co/rest/v1/wishes');
});

test('maps the DB wish-limit trigger to 409', async () => {
  scriptFetch(jsonResponse(200, true), jsonResponse(400, { code: 'P0001', message: 'wish_limit_reached' }));
  const res = mockRes();
  await handler(okReq(), res);
  assert.equal(res.statusCode, 409);
});

test('returns 500 when Supabase fails unexpectedly', async () => {
  scriptFetch(jsonResponse(500, {}));
  const res = mockRes();
  const originalError = console.error;
  console.error = () => {};
  try {
    await handler(okReq(), res);
  } finally {
    console.error = originalError;
  }
  assert.equal(res.statusCode, 500);
});
