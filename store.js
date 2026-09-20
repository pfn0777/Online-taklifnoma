/* ============================================================
   JASMINE TAKLIFNOMA v3 — ma'lumot adapteri (Supabase)
   index.html va admin.html FAQAT shu API bilan gaplashadi.

   API (hammasi Promise qaytaradi):
     Store.load()                 -> data  (server ishlamasa: oxirgi nusxa yoki default)
     Store.addWish(wish)          -> wish  (mehmon, Vercel /api/wishes orqali)
     Store.login(email, password) -> void  (admin, Supabase Auth, token sessionStorage'da)
     Store.isAuthed()             -> boolean
     Store.logout()               -> void
     Store.save(data)             -> void  (admin)
     Store.deleteWish(id)         -> void  (admin)
     Store.reset()                -> void  (admin)
   Admin so'rovi 401 qaytarsa — token tozalanadi va xato status=401 bilan tashlanadi.
   ============================================================ */

const CACHE_KEY = 'jasmine_taklifnoma_cache';
const TOKEN_KEY = 'jasmine_taklifnoma_token';
const REQUEST_TIMEOUT_MS = 4000;
const WISH_DATE_LOCALE = 'en-GB';
const WISH_DATE_TIME_ZONE = 'Asia/Tashkent';
const INVITATION_ID = 1;

const Store = (() => {
  const wishDateFormat = new Intl.DateTimeFormat(WISH_DATE_LOCALE, {
    timeZone: WISH_DATE_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Default model ustiga server qiymatlarini qo'yadi.
  // Yangi maydon qo'shilsa, eski saqlangan ma'lumot buzilmaydi.
  function merge(base, over) {
    const out = deepClone(base);
    for (const k in over) {
      if (over[k] !== undefined && over[k] !== null) out[k] = over[k];
    }
    return out;
  }

  function getToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Store: sessionStorage o\'qib bo\'lmadi', e);
      return null;
    }
  }

  function setToken(token) {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Store: sessionStorage yozib bo\'lmadi', e);
    }
  }

  // Supabase (PostgREST / Auth) va o'z /api/* ga umumiy so'rov.
  async function request(method, url, { body, auth, headers: extra } = {}) {
    const headers = { ...extra };
    if (url.startsWith(SUPABASE_URL)) {
      headers.apikey = SUPABASE_ANON_KEY;
      headers.Authorization = 'Bearer ' + (auth ? getToken() : SUPABASE_ANON_KEY);
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let res;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }

    let json = null;
    try {
      json = await res.json();
    } catch (e) {
      // bo'sh yoki JSON bo'lmagan javob — pastda status bo'yicha ishlanadi
    }
    if (!res.ok) {
      if (res.status === 401 && auth) setToken(null);
      const message = json && (json.error || json.message || json.msg || json.error_description);
      const err = new Error(message || 'HTTP ' + res.status);
      err.status = res.status;
      throw err;
    }
    return json;
  }

  function toWish(row) {
    return {
      id: row.id,
      name: row.name,
      text: row.text,
      date: wishDateFormat.format(new Date(row.created_at)).replace(/\//g, '.')
    };
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? merge(DEFAULT_DATA, JSON.parse(raw)) : null;
    } catch (e) {
      console.warn('Store: keshni o\'qib bo\'lmadi', e);
      return null;
    }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Store: keshga yozib bo\'lmadi', e);
    }
  }

  async function load() {
    try {
      const [invitation, wishes] = await Promise.all([
        request('GET', SUPABASE_URL + '/rest/v1/invitation?select=data&id=eq.' + INVITATION_ID),
        request('GET', SUPABASE_URL + '/rest/v1/wishes?select=id,name,text,created_at&order=id.asc')
      ]);
      const data = merge(DEFAULT_DATA, (invitation[0] && invitation[0].data) || {});
      data.wishes = wishes.map(toWish);
      writeCache(data);
      return data;
    } catch (e) {
      console.warn('Store: server javob bermadi, kesh/default ishlatiladi', e);
      return readCache() || deepClone(DEFAULT_DATA);
    }
  }

  async function login(email, password) {
    const res = await request('POST', SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      body: { email, password }
    });
    setToken(res.access_token);
  }

  async function patchInvitation(data) {
    const rows = await request('PATCH', SUPABASE_URL + '/rest/v1/invitation?id=eq.' + INVITATION_ID, {
      body: { data },
      auth: true,
      headers: { Prefer: 'return=representation' }
    });
    // RLS ruxsat bermasa PostgREST xatosiz bo'sh massiv qaytaradi.
    if (!rows.length) {
      const err = new Error('Not saved');
      err.status = 401;
      setToken(null);
      throw err;
    }
  }

  function save(data) {
    const { wishes, ...rest } = data;
    return patchInvitation(rest);
  }

  function addWish({ name, text }) {
    return request('POST', '/api/wishes', { body: { name, text } });
  }

  function deleteWish(id) {
    return request('DELETE', SUPABASE_URL + '/rest/v1/wishes?id=eq.' + encodeURIComponent(id), { auth: true });
  }

  async function reset() {
    await request('DELETE', SUPABASE_URL + '/rest/v1/wishes?id=gt.0', { auth: true });
    await patchInvitation({});
  }

  return {
    load, login, save, addWish, deleteWish, reset,
    isAuthed: () => Boolean(getToken()),
    logout: () => setToken(null),
    deepClone
  };
})();
