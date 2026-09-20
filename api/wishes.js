const {
  validateWish, dateLabel, clientKey, WISH_RATE_MAX, WISH_RATE_WINDOW_SECONDS
} = require('./_lib/wish');

const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_CONFLICT = 409;
const HTTP_TOO_MANY = 429;
const HTTP_SERVER_ERROR = 500;
const PG_RAISE_EXCEPTION = 'P0001';

function parseBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (err) {
      return null;
    }
  }
  return req.body;
}

async function supabase(path, init) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return fetch(process.env.SUPABASE_URL + path, {
    ...init,
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      ...init.headers
    }
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(HTTP_METHOD_NOT_ALLOWED).json({ error: 'Method not allowed' });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('api/wishes: SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY yo\'q');
    return res.status(HTTP_SERVER_ERROR).json({ error: 'Server misconfigured' });
  }

  const parsed = validateWish(parseBody(req));
  if (parsed.error) return res.status(HTTP_BAD_REQUEST).json({ error: parsed.error });

  try {
    const limitRes = await supabase('/rest/v1/rpc/check_rate_limit', {
      method: 'POST',
      body: JSON.stringify({
        p_key: clientKey(req.headers),
        p_max: WISH_RATE_MAX,
        p_window_seconds: WISH_RATE_WINDOW_SECONDS
      })
    });
    if (!limitRes.ok) throw new Error('rate limit rpc failed: HTTP ' + limitRes.status);
    if (!(await limitRes.json())) {
      return res.status(HTTP_TOO_MANY).json({ error: 'Too many wishes, try later' });
    }

    const insertRes = await supabase('/rest/v1/wishes', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(parsed.value)
    });
    if (!insertRes.ok) {
      const failure = await insertRes.json().catch(() => ({}));
      if (failure.code === PG_RAISE_EXCEPTION) {
        return res.status(HTTP_CONFLICT).json({ error: 'Wish limit reached' });
      }
      throw new Error('insert failed: HTTP ' + insertRes.status + ' ' + JSON.stringify(failure));
    }
    const [row] = await insertRes.json();
    return res.status(HTTP_CREATED).json({
      id: row.id, name: row.name, text: row.text, date: dateLabel(row.created_at)
    });
  } catch (err) {
    console.error('api/wishes failed', err);
    return res.status(HTTP_SERVER_ERROR).json({ error: 'Internal error' });
  }
};
