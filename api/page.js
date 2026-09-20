const fs = require('node:fs');
const path = require('node:path');
const { pickLang, buildOg, applyOg } = require('./_lib/og');

const INVITATION_ID = 1;
const FETCH_TIMEOUT_MS = 3000;
const SUPABASE_FALLBACK_URL = 'https://gearyufbppfwfyjlbwzy.supabase.co';
// Publishable (public) key — same one shipped in config.js; RLS protects the data.
const SUPABASE_ANON_KEY = 'sb_publishable_LFKZVRjtFmSchcqDJjds3A_rhqRJU59';
const CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';

async function loadInvitation() {
  const base = process.env.SUPABASE_URL || SUPABASE_FALLBACK_URL;
  const res = await fetch(base + '/rest/v1/invitation?select=data&id=eq.' + INVITATION_ID, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  });
  if (!res.ok) throw new Error('invitation fetch failed: HTTP ' + res.status);
  const rows = await res.json();
  return (rows[0] && rows[0].data) || null;
}

module.exports = async function handler(req, res) {
  const lang = pickLang(new URL(req.url, 'http://localhost').searchParams.get('lang'));
  let html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  try {
    const data = await loadInvitation();
    if (data) html = applyOg(html, buildOg(data, lang));
  } catch (err) {
    console.error('api/page: OG fallback to static tags', err);
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', CACHE_CONTROL);
  res.status(200).send(html);
};
