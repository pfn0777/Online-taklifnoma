const { verifyPassword, signToken, verifyToken } = require('./auth');
const { createRateLimiter } = require('./rateLimit');
const { validateWish, validateInvitation } = require('./validate');

const INVITATION_BODY_MAX = 256 * 1024;
const SMALL_BODY_MAX = 8 * 1024;
const WISH_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const LOGIN_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function readJson(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new HttpError(413, 'Body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'));
      } catch (err) {
        reject(new HttpError(400, 'Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function createHandler({ store, config }) {
  const allowWish = createRateLimiter(WISH_LIMIT);
  const allowLogin = createRateLimiter(LOGIN_LIMIT);

  function clientIp(req) {
    if (config.trustProxy) {
      const forwarded = String(req.headers['x-forwarded-for'] || '').split(',');
      const last = forwarded[forwarded.length - 1].trim();
      if (last) return last;
    }
    return req.socket.remoteAddress || 'unknown';
  }

  function send(res, status, body, headers = {}) {
    const payload = body === undefined ? '' : JSON.stringify(body);
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
    res.end(payload);
  }

  function corsHeaders(req) {
    const origin = req.headers.origin;
    if (!origin || !config.allowedOrigins.includes(origin)) return {};
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '600',
      Vary: 'Origin'
    };
  }

  function requireAdmin(req) {
    const header = String(req.headers.authorization || '');
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!verifyToken(token, config.tokenSecret)) throw new HttpError(401, 'Unauthorized');
  }

  async function route(req, res, cors) {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    const method = req.method;

    if (method === 'GET' && path === '/api/health') {
      return send(res, 200, { ok: true }, cors);
    }

    if (method === 'GET' && path === '/api/invitation') {
      return send(res, 200, { data: store.getInvitation(), wishes: store.listWishes() },
        { ...cors, 'Cache-Control': 'no-store' });
    }

    if (method === 'POST' && path === '/api/wishes') {
      if (!allowWish(clientIp(req))) throw new HttpError(429, 'Too many wishes, try later');
      const parsed = validateWish(await readJson(req, SMALL_BODY_MAX));
      if (parsed.error) throw new HttpError(400, parsed.error);
      const wish = store.addWish(parsed.value);
      if (!wish) throw new HttpError(409, 'Wish limit reached');
      return send(res, 201, wish, cors);
    }

    if (method === 'POST' && path === '/api/login') {
      if (!allowLogin(clientIp(req))) throw new HttpError(429, 'Too many attempts, try later');
      const body = await readJson(req, SMALL_BODY_MAX);
      const password = body && typeof body.password === 'string' ? body.password : '';
      if (!password || !verifyPassword(password, config.adminPasswordHash)) {
        throw new HttpError(401, 'Wrong password');
      }
      return send(res, 200, { token: signToken(config.tokenSecret) }, cors);
    }

    if (method === 'PUT' && path === '/api/invitation') {
      requireAdmin(req);
      const parsed = validateInvitation(await readJson(req, INVITATION_BODY_MAX));
      if (parsed.error) throw new HttpError(400, parsed.error);
      store.saveInvitation(parsed.value);
      return send(res, 200, { ok: true }, cors);
    }

    const wishMatch = path.match(/^\/api\/wishes\/(\d+)$/);
    if (method === 'DELETE' && wishMatch) {
      requireAdmin(req);
      if (!store.deleteWish(Number(wishMatch[1]))) throw new HttpError(404, 'Not found');
      return send(res, 200, { ok: true }, cors);
    }

    if (method === 'POST' && path === '/api/reset') {
      requireAdmin(req);
      store.reset();
      return send(res, 200, { ok: true }, cors);
    }

    throw new HttpError(404, 'Not found');
  }

  return async function handle(req, res) {
    const cors = corsHeaders(req);
    if (req.method === 'OPTIONS') {
      res.writeHead(204, cors);
      res.end();
      return;
    }
    try {
      await route(req, res, cors);
    } catch (err) {
      if (err instanceof HttpError) {
        send(res, err.status, { error: err.message }, cors);
        return;
      }
      console.error('Unhandled error', req.method, req.url, err);
      send(res, 500, { error: 'Internal error' }, cors);
    }
  };
}

module.exports = { createHandler };
