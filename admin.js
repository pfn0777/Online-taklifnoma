/* ============================================================
   JASMINE TAKLIFNOMA v3 — admin panel logikasi
   Kirish Supabase Auth orqali (email + parol), token store.js'da.
   ============================================================ */

const TOAST_MS = 2200;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_TOO_MANY = 429;

let data = null;

const $ = (id) => document.getElementById(id);

/* ---------- login ---------- */
async function tryLogin() {
  const email = $('loginEmail').value.trim();
  const value = $('loginPass').value;
  if (!email || !value) return;
  try {
    await Store.login(email, value);
  } catch (err) {
    console.warn('Login muvaffaqiyatsiz', err);
    $('loginError').textContent = loginErrorText(err);
    $('loginPass').value = '';
    $('loginPass').focus();
    return;
  }
  $('loginError').textContent = '';
  await showAdmin();
}

function loginErrorText(err) {
  if (err.status === HTTP_UNAUTHORIZED || err.status === HTTP_BAD_REQUEST) {
    return "Email yoki parol noto'g'ri. Qayta urinib ko'ring.";
  }
  if (err.status === HTTP_TOO_MANY) return "Juda ko'p urinish. Birozdan keyin qayta urining.";
  return "Serverga ulanib bo'lmadi. Internetni tekshiring.";
}

async function showAdmin() {
  data = await Store.load();
  $('loginScreen').style.display = 'none';
  $('admin').classList.add('is-visible');
  buildForm();
}

function logout() {
  Store.logout();
  location.reload();
}

// Token eskirgan bo'lsa login ekraniga qaytamiz; boshqa xatoni xabar qilamiz.
function handleRequestError(err, fallbackMessage) {
  console.error(fallbackMessage, err);
  if (err.status === HTTP_UNAUTHORIZED) {
    toast('Sessiya tugadi. Qayta kiring.');
    setTimeout(() => location.reload(), TOAST_MS);
    return;
  }
  toast(fallbackMessage);
}

/* ---------- maydonlar ---------- */
const SIMPLE_FIELDS = [
  'theme', 'lang',
  'groom', 'bride', 'family', 'eventType', 'greeting', 'inviteTitle',
  'introText', 'storyText', 'closingText',
  'weekday', 'dayNum', 'monthLabel', 'time', 'dateLine',
  'venueName', 'venueAddress', 'venuePhoto', 'mapQuery', 'mapProvider',
  'phone', 'telegram', 'instagram', 'musicUrl', 'ogImage',
  'giftTitle', 'giftText', 'cardNumber', 'cardHolder', 'cardBank', 'paymentLink'
];

const SCHEDULE_ICONS = ['guests', 'rings', 'camera', 'music', 'cake', 'gift', 'pin'];

function buildForm() {
  buildThemeSelect();
  SIMPLE_FIELDS.forEach(key => {
    const field = $('f-' + key);
    if (field) field.value = data[key] || '';
  });

  // Rus tilidagi variantlar
  data.ru = data.ru || {};
  TRANSLATABLE.forEach(key => {
    const field = $('f-ru-' + key);
    if (field) field.value = data.ru[key] || '';
  });

  // datetime-local uchun mahalliy vaqt formatida
  const d = data.dateISO ? new Date(data.dateISO) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  $('f-dateISO').value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
    + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());

  buildGalleryEditor();
  buildScheduleEditor();
  buildWishesEditor();
}

function buildThemeSelect() {
  const select = $('f-theme');
  select.textContent = '';
  THEMES.forEach(theme => {
    const opt = document.createElement('option');
    opt.value = theme.id;
    opt.textContent = theme.label;
    select.appendChild(opt);
  });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function input(className, placeholder, value) {
  const node = document.createElement('input');
  node.className = className;
  node.placeholder = placeholder;
  node.value = value == null ? '' : value;
  return node;
}

function delButton(onClick) {
  const b = el('button', 'le-del', '×');
  b.type = 'button';
  b.title = "O'chirish";
  b.addEventListener('click', onClick);
  return b;
}

function addButton(label, onClick) {
  const b = el('button', 'le-add', '+ ' + label);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}

/* ---------- galereya ---------- */
function buildGalleryEditor() {
  const host = $('galleryEditor');
  host.textContent = '';
  (data.gallery || []).forEach((src, i) => {
    const item = el('div', 'le-item');
    const row = el('div', 'le-row le-row-wide');
    row.append(
      input('le-a', 'Surat havolasi (https://...)', src),
      delButton(() => { data.gallery.splice(i, 1); buildGalleryEditor(); })
    );
    item.appendChild(row);
    host.appendChild(item);
  });
  host.appendChild(addButton("Surat qo'shish", () => {
    data.gallery = data.gallery || [];
    data.gallery.push('');
    buildGalleryEditor();
  }));
}

/* ---------- dastur ---------- */
function buildScheduleEditor() {
  const host = $('scheduleEditor');
  host.textContent = '';
  (data.schedule || []).forEach((item, i) => {
    const box = el('div', 'le-item');
    const row = el('div', 'le-row le-row-sched');

    const select = el('select', 'le-icon');
    SCHEDULE_ICONS.forEach(name => {
      const opt = el('option', null, name);
      opt.value = name;
      if (name === item.icon) opt.selected = true;
      select.appendChild(opt);
    });

    row.append(
      input('le-a', '18:00', item.time),
      input('le-b', 'Band nomi', item.label),
      input('le-b2', 'Band nomi (RU)', item.labelRu),
      select,
      delButton(() => { data.schedule.splice(i, 1); buildScheduleEditor(); })
    );
    box.appendChild(row);
    host.appendChild(box);
  });
  host.appendChild(addButton("Band qo'shish", () => {
    data.schedule = data.schedule || [];
    data.schedule.push({ time: '18:00', label: '', labelRu: '', icon: 'rings' });
    buildScheduleEditor();
  }));
}

/* ---------- tilaklar (faqat ko'rish va o'chirish; o'chirish darrov serverga ketadi) ---------- */
function buildWishesEditor() {
  const host = $('wishesEditor');
  host.textContent = '';
  const wishes = data.wishes || [];
  if (!wishes.length) host.appendChild(el('p', 'hint', "Hozircha tilaklar yo'q."));

  wishes.forEach(w => {
    const box = el('div', 'le-item');
    const row = el('div', 'le-row le-row-wide');
    row.append(
      el('strong', null, w.name + ' • ' + w.date),
      delButton(() => removeWish(w))
    );
    box.append(row, el('div', null, w.text));
    host.appendChild(box);
  });
}

async function removeWish(wish) {
  if (!confirm("Bu tilak o'chiriladi. Davom etasizmi?")) return;
  try {
    await Store.deleteWish(wish.id);
  } catch (err) {
    handleRequestError(err, "Tilakni o'chirib bo'lmadi");
    return;
  }
  data.wishes = data.wishes.filter(w => w.id !== wish.id);
  buildWishesEditor();
  toast("Tilak o'chirildi");
}

/* ---------- saqlash ---------- */
function collectForm() {
  SIMPLE_FIELDS.forEach(key => {
    const field = $('f-' + key);
    if (field) data[key] = field.value;
  });

  data.ru = data.ru || {};
  TRANSLATABLE.forEach(key => {
    const field = $('f-ru-' + key);
    if (field) data.ru[key] = field.value.trim();
  });

  const dt = $('f-dateISO').value;
  if (dt) data.dateISO = new Date(dt).toISOString();

  data.gallery = [...$('galleryEditor').querySelectorAll('.le-a')]
    .map(i => i.value.trim())
    .filter(Boolean);

  data.schedule = [...$('scheduleEditor').querySelectorAll('.le-item')]
    .map(item => ({
      time: item.querySelector('.le-a').value.trim(),
      label: item.querySelector('.le-b').value.trim(),
      labelRu: item.querySelector('.le-b2').value.trim(),
      icon: item.querySelector('.le-icon').value
    }))
    .filter(x => x.time || x.label);
}

async function save() {
  collectForm();
  try {
    await Store.save(data);
  } catch (err) {
    handleRequestError(err, "Saqlab bo'lmadi — server javob bermadi");
    return;
  }
  toast('Saqlandi');
  refreshPreview();
}

async function resetAll() {
  if (!confirm("Barcha o'zgarishlar va mehmon tilaklari o'chadi. Davom etasizmi?")) return;
  try {
    await Store.reset();
  } catch (err) {
    handleRequestError(err, "Qayta tiklab bo'lmadi");
    return;
  }
  data = await Store.load();
  buildForm();
  toast('Boshlang’ich holatga qaytarildi');
  refreshPreview();
}

function refreshPreview() {
  $('preview').src = 'index.html?lang=' + $('previewLang').value + '&t=' + Date.now();
}

/* ---------- mehmonga yuboriladigan havola ---------- */
function inviteUrl(lang) {
  const url = new URL('index.html', location.href);
  url.searchParams.set('lang', lang);
  return url.toString();
}

async function copyInviteLink(lang) {
  const link = inviteUrl(lang);
  try {
    await navigator.clipboard.writeText(link);
    toast('Havola nusxalandi: ' + link);
  } catch (err) {
    console.warn('Clipboard ishlamadi, fallback', err);
    const tmp = el('textarea');
    tmp.value = link;
    tmp.setAttribute('readonly', '');
    tmp.style.position = 'fixed';
    tmp.style.opacity = '0';
    document.body.appendChild(tmp);
    tmp.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(tmp);
    toast(ok ? 'Havola nusxalandi: ' + link : 'Nusxa olinmadi — ' + link);
  }
}

function toast(message) {
  const t = $('toast');
  t.textContent = message;
  t.classList.add('is-visible');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('is-visible'), TOAST_MS);
}

/* ---------- init ---------- */
function init() {
  $('loginBtn').addEventListener('click', tryLogin);
  $('loginEmail').addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin(); });
  $('loginPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin(); });
  $('logoutBtn').addEventListener('click', logout);
  $('saveBtn').addEventListener('click', save);
  $('resetBtn').addEventListener('click', resetAll);
  $('copyUzLink').addEventListener('click', () => copyInviteLink('uz'));
  $('copyRuLink').addEventListener('click', () => copyInviteLink('ru'));
  $('previewLang').addEventListener('change', refreshPreview);
  $('viewLink').addEventListener('click', (e) => {
    e.currentTarget.href = inviteUrl($('f-lang').value);
  });

  if (Store.isAuthed()) showAdmin();
  else $('loginEmail').focus();
}

init();
