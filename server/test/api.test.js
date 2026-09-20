const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { hashPassword } = require('../lib/auth');
const { openStore } = require('../lib/db');
const { createHandler } = require('../lib/handler');

const ORIGIN = 'https://site.example';
const PASSWORD = 'correct horse battery';

async function startServer() {
  const store = openStore(':memory:');
  const config = {
    adminPasswordHash: hashPassword(PASSWORD),
    tokenSecret: 's'.repeat(32),
    allowedOrigins: [ORIGIN],
    trustProxy: false
  };
  const server = http.createServer(createHandler({ store, config }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;

  async function call(method, path, { body, token, origin } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    if (origin) headers.Origin = origin;
    const res = await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await res.text();
    return { status: res.status, headers: res.headers, json: text ? JSON.parse(text) : null };
  }

  return {
    call,
    async close() {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
      store.close();
    }
  };
}

async function login(api) {
  const res = await api.call('POST', '/api/login', { body: { password: PASSWORD } });
  assert.equal(res.status, 200);
  return res.json.token;
}

test('admin endpoints require a valid token', async () => {
  const api = await startServer();
  try {
    assert.equal((await api.call('PUT', '/api/invitation', { body: { groom: 'A' } })).status, 401);
    assert.equal((await api.call('DELETE', '/api/wishes/1')).status, 401);
    assert.equal((await api.call('POST', '/api/reset')).status, 401);
    assert.equal((await api.call('PUT', '/api/invitation', { body: {}, token: 'bad.token' })).status, 401);
  } finally {
    await api.close();
  }
});

test('login rejects wrong password and rate-limits attempts', async () => {
  const api = await startServer();
  try {
    for (let i = 0; i < 5; i++) {
      assert.equal((await api.call('POST', '/api/login', { body: { password: 'nope' } })).status, 401);
    }
    assert.equal((await api.call('POST', '/api/login', { body: { password: PASSWORD } })).status, 429);
  } finally {
    await api.close();
  }
});

test('admin saves invitation and it is served publicly', async () => {
  const api = await startServer();
  try {
    assert.deepEqual((await api.call('GET', '/api/invitation')).json, { data: null, wishes: [] });
    const token = await login(api);
    const put = await api.call('PUT', '/api/invitation', { token, body: { groom: 'Ali', wishes: [{ x: 1 }] } });
    assert.equal(put.status, 200);
    const got = await api.call('GET', '/api/invitation');
    assert.deepEqual(got.json.data, { groom: 'Ali' });
  } finally {
    await api.close();
  }
});

test('guest wishes: add, rate-limit, admin delete', async () => {
  const api = await startServer();
  try {
    const first = await api.call('POST', '/api/wishes', { body: { name: 'Ali', text: 'Congrats' } });
    assert.equal(first.status, 201);
    assert.equal((await api.call('POST', '/api/wishes', { body: { name: '', text: 'x' } })).status, 400);
    for (let i = 0; i < 3; i++) await api.call('POST', '/api/wishes', { body: { name: 'B', text: 'x' } });
    assert.equal((await api.call('POST', '/api/wishes', { body: { name: 'C', text: 'x' } })).status, 429);

    const token = await login(api);
    assert.equal((await api.call('DELETE', '/api/wishes/' + first.json.id, { token })).status, 200);
    assert.equal((await api.call('DELETE', '/api/wishes/' + first.json.id, { token })).status, 404);
  } finally {
    await api.close();
  }
});

test('CORS allows only configured origins', async () => {
  const api = await startServer();
  try {
    const ok = await api.call('GET', '/api/health', { origin: ORIGIN });
    assert.equal(ok.headers.get('access-control-allow-origin'), ORIGIN);
    const bad = await api.call('GET', '/api/health', { origin: 'https://evil.example' });
    assert.equal(bad.headers.get('access-control-allow-origin'), null);
  } finally {
    await api.close();
  }
});
