/* ============================================================
   JASMINE TAKLIFNOMA v3 — publik sahifa logikasi
   Barcha ma'lumot Store orqali (store.js).
   innerHTML ishlatilmaydi — faqat textContent / createElement.
   ============================================================ */

let data = Store.load();

const $ = (id) => document.getElementById(id);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const UZ_DOW = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
const UZ_MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
                   'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

const PETAL_COUNT_MOBILE = 5;
const PETAL_COUNT_DESKTOP = 9;
const MOBILE_MAX_WIDTH = 700;
const GALLERY_VISIBLE = 4;
const MSG_TIMEOUT_MS = 3000;
const ENVELOPE_ANIM_MS = 900;
const REVEAL_FALLBACK_MS = 400;   // IO ishlamasa ko’rinadigan qismni ochish
const GIFT_OPEN_MS = 800;         // quti qopqog'i ko'tarilishi (style.css --t-slow)
const GIFT_BURST_MS = 1100;       // gulbarg portlashi
const GIFT_BURST_COUNT = 8;

const MAGIC_WISHES = [
  "Baxtingiz abadiy, oilangiz doimo mehr va quvonchga to'la bo'lsin!",
  "Nikoh to'yingiz muborak! Bir umr ahil va baxtli yashanglar.",
  "Yangi hayotingiz sevgi, hurmat va unutilmas lahzalarga boy bo'lsin!",
  "Ikki qalb, bir orzu — to'ylaringiz muborak bo'lsin!",
  "Alloh oilangizga tinchlik, baraka va cheksiz baxt ato etsin!"
];

/* ---------- SVG ikonka yasash ---------- */
function icon(name, className) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', className || 'orn');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#i-' + name);
  svg.appendChild(use);
  return svg;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function flash(target, text, isError) {
  target.textContent = text;
  target.classList.toggle('is-error', Boolean(isError));
  clearTimeout(target._timer);
  target._timer = setTimeout(() => { target.textContent = ''; }, MSG_TIMEOUT_MS);
}

/* ---------- 0. Tema ---------- */
function applyTheme() {
  const theme = getTheme(data.theme);
  document.body.dataset.theme = theme.id;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme.themeColor);

  // Bo'lim ajratgichi — har tema o'z ornamentini ishlatadi
  document.querySelectorAll('.orn-sprig use').forEach(use => {
    use.setAttribute('href', '#' + theme.sprig);
  });

  renderFlorals(theme);
  renderCornerOrnaments(theme);
}

// Akvarel gul dastalari — bo'limning chap va o'ng chetida, matn ostida.
// Assetlar Stitch'da generatsiya qilingan (config.js: FLORAL_SET).
function renderFlorals(theme) {
  document.querySelectorAll('.floral').forEach(node => node.remove());
  if (!theme.floral) return;

  Object.keys(theme.floral).forEach(selector => {
    const host = document.querySelector(selector);
    if (!host) return;

    const pair = theme.floral[selector];
    host.classList.add('has-floral');

    ['l', 'r'].forEach((side, i) => {
      const src = pair[i];
      // Vertikal dastalar plita chetida kesilgan — uchlari CSS'da yumshatiladi
      const kind = src.indexOf('spray') !== -1 ? ' floral--spray' : '';
      const img = el('img', 'floral floral--' + side + kind);
      img.src = src;
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      // Konvert darrov ko'rinadi, qolganlari scroll bilan keladi
      img.loading = selector === '.envelope' ? 'eager' : 'lazy';
      img.onerror = () => img.remove();
      host.prepend(img);
    });
  });
}

// Line-art burchak novdasi — faqat akvarel gul qo'yilmagan bo'limlarda
function renderCornerOrnaments(theme) {
  document.querySelectorAll('.sheet-orn').forEach(node => node.remove());
  if (!theme.cornerOrnament) return;

  const name = theme.cornerOrnament.replace(/^i-/, '');
  document.querySelectorAll('.sheet').forEach((sheet, i) => {
    if (sheet.classList.contains('has-floral')) return;
    sheet.prepend(icon(name, 'sheet-orn ' + (i % 2 ? 'br' : 'tl')));
  });
}

/* ---------- 1. Matn maydonlari ---------- */
function fillText() {
  document.querySelectorAll('[data-f]').forEach(node => {
    const key = node.getAttribute('data-f');
    if (data[key] !== undefined) node.textContent = data[key];
  });

  const fullTitle = 'Taklifnoma — ' + data.groom + ' & ' + data.bride;
  document.title = fullTitle;

  // Ijtimoiy tarmoq preview
  $('ogTitle').setAttribute('content', data.groom + ' & ' + data.bride + ' — Taklifnoma');
  $('ogDesc').setAttribute('content', data.introText);
  $('ogImage').setAttribute('content', data.ogImage || data.venuePhoto || '');

  // To'yxona surati
  const photo = $('venuePhoto');
  if (data.venuePhoto) {
    photo.src = data.venuePhoto;
    photo.alt = data.venueName;
    photo.onerror = () => photo.closest('.venue-photo').classList.add('is-empty');
  } else {
    photo.closest('.venue-photo').classList.add('is-empty');
  }

  // Xarita
  const query = data.mapQuery || (data.venueName + ' ' + data.venueAddress);
  $('mapFrame').src = mapEmbedUrl(query, data.mapProvider);
  $('mapLink').href = mapLinkUrl(query, data.mapProvider);

  // Kalendar havolasi
  $('addCal').href = buildCalendarLink(data);

  // To'yona
  $('cardNumber').textContent = data.cardNumber;
  const pay = $('payLink');
  if (data.paymentLink) {
    pay.href = data.paymentLink;
    pay.hidden = false;
  }
}

/* ---------- 2. Galereya ---------- */
function renderGallery() {
  const host = $('gallery');
  host.textContent = '';
  const photos = (data.gallery || []).filter(Boolean);

  photos.slice(0, GALLERY_VISIBLE).forEach((src, i) => {
    const fig = el('figure');
    const img = el('img');
    img.src = src;
    img.alt = "To'y surati " + (i + 1);
    img.loading = 'lazy';
    img.onerror = () => { img.src = placeholderImage(data.groom, data.bride); };
    fig.appendChild(img);

    const hidden = photos.length - GALLERY_VISIBLE;
    if (i === GALLERY_VISIBLE - 1 && hidden > 0) {
      fig.appendChild(el('div', 'more', '+' + hidden));
    }

    fig.addEventListener('click', () => openLightbox(src, img.alt));
    host.appendChild(fig);
  });
}

function cssVar(name, fallback) {
  const v = getComputedStyle(document.body).getPropertyValue(name).trim();
  return v || fallback;
}

function placeholderImage(groom, bride) {
  const bg = cssVar('--paper-2', '#F3EDE4');
  const fg = cssVar('--primary', '#404A1D');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700">'
    + '<rect width="100%" height="100%" fill="' + bg + '"/>'
    + '<text x="50%" y="52%" fill="' + fg + '" font-family="Georgia,serif" font-size="42" text-anchor="middle">'
    + groom + ' &amp; ' + bride + '</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ---------- 3. Kalendar ---------- */
function renderCalendar() {
  const wedding = new Date(data.dateISO);
  const year = wedding.getFullYear();
  const month = wedding.getMonth();
  const weddingDay = wedding.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // JS: 0=Yakshanba. Bizda hafta Dushanbadan boshlanadi.
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;

  const host = $('calendar');
  host.textContent = '';
  host.appendChild(el('div', 'cal-head', UZ_MONTHS[month] + ' ' + year));

  const grid = el('div', 'cal-grid');
  UZ_DOW.forEach(d => grid.appendChild(el('div', 'dow', d)));
  for (let i = 0; i < leadingBlanks; i++) grid.appendChild(el('div'));
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = el('div', 'day' + (day === weddingDay ? ' is-wedding' : ''), String(day));
    if (day === weddingDay) cell.setAttribute('aria-label', "To'y kuni: " + day);
    grid.appendChild(cell);
  }
  host.appendChild(grid);
}

/* ---------- 4. Countdown ---------- */
function renderCountdown() {
  const target = new Date(data.dateISO).getTime();
  let left = Math.max(0, target - Date.now());

  const days = Math.floor(left / 86400000);  left -= days * 86400000;
  const hours = Math.floor(left / 3600000);  left -= hours * 3600000;
  const mins = Math.floor(left / 60000);     left -= mins * 60000;
  const secs = Math.floor(left / 1000);

  const pad = (n) => String(n).padStart(2, '0');
  $('cd-d').textContent = pad(days);
  $('cd-h').textContent = pad(hours);
  $('cd-m').textContent = pad(mins);
  $('cd-s').textContent = pad(secs);
}

/* ---------- 5. Dastur ---------- */
function renderSchedule() {
  const host = $('timeline');
  host.textContent = '';
  (data.schedule || []).forEach(item => {
    const li = el('li');
    const iconBox = el('span', 't-icon');
    iconBox.appendChild(icon(item.icon || 'rings'));
    const body = el('div');
    body.appendChild(el('span', 't-time', item.time));
    body.appendChild(el('div', 't-label', item.label));
    li.append(iconBox, body);
    host.appendChild(li);
  });
}

/* ---------- 6. Tilaklar ---------- */
function renderWishes() {
  const host = $('wishesList');
  host.textContent = '';
  (data.wishes || []).slice().reverse().forEach(w => {
    const li = el('li');
    const head = el('div', 'w-head');
    head.append(el('span', 'w-name', w.name), el('span', 'w-date', w.date));
    li.append(head, el('div', 'w-text', w.text));
    host.appendChild(li);
  });
}

function todayLabel() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return pad(now.getDate()) + '.' + pad(now.getMonth() + 1) + '.' + now.getFullYear();
}

function submitWish(e) {
  e.preventDefault();
  const msg = $('wishMsg');
  const name = $('wishName').value.trim();
  const text = $('wishText').value.trim();

  if (!name || !text) {
    flash(msg, 'Ism va tilak matnini to’ldiring.', true);
    return;
  }

  data = Store.addWish({ name, date: todayLabel(), text });
  renderWishes();
  $('wishForm').reset();
  flash(msg, 'Rahmat! Tilagingiz qo’shildi.');
}

/* ---------- 8. To'yona — raqamdan nusxa ---------- */
function bindCopyCard() {
  const msg = $('copyMsg');
  $('copyCard').addEventListener('click', async () => {
    const number = data.cardNumber.replace(/\s+/g, '');
    try {
      await navigator.clipboard.writeText(number);
      flash(msg, 'Karta raqami nusxalandi.');
    } catch (err) {
      console.warn('Clipboard ishlamadi, fallback', err);
      const tmp = el('textarea');
      tmp.value = number;
      tmp.setAttribute('readonly', '');
      tmp.style.position = 'fixed';
      tmp.style.opacity = '0';
      document.body.appendChild(tmp);
      tmp.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(tmp);
      flash(msg, ok ? 'Karta raqami nusxalandi.' : 'Nusxa olinmadi — qo’lda ko’chiring.', !ok);
    }
  });
}

/* ---------- 8b. To'yona — sovg'a qutisini ochish ---------- */
function burstPetals() {
  if (prefersReducedMotion) return;
  const host = $('giftBurst');
  if (!host) return;

  for (let i = 0; i < GIFT_BURST_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / GIFT_BURST_COUNT + Math.random() * 0.4;
    const dist = 3.5 + Math.random() * 2.5;   // rem
    const spark = icon(i % 2 ? 'rose' : 'leaf', 'spark');
    spark.style.setProperty('--bx', (Math.cos(angle) * dist).toFixed(2) + 'rem');
    spark.style.setProperty('--by', (Math.sin(angle) * dist - 1).toFixed(2) + 'rem');
    spark.style.animationDelay = (i * 40) + 'ms';
    host.appendChild(spark);
  }
  setTimeout(() => { host.textContent = ''; }, GIFT_BURST_MS + GIFT_BURST_COUNT * 40);
}

function bindGiftBox() {
  const card = $('giftCard');
  const btn = $('giftBoxBtn');
  const reveal = $('giftReveal');
  if (!card || !btn || !reveal) return;

  btn.addEventListener('click', () => {
    if (card.classList.contains('is-opening')) return;
    btn.setAttribute('aria-expanded', 'true');
    card.classList.add('is-opening');
    burstPetals();

    const show = () => {
      card.classList.add('is-open');
      reveal.hidden = false;
    };

    if (prefersReducedMotion) show();
    else setTimeout(show, GIFT_OPEN_MS * 0.55);
  });
}

/* ---------- 9. Kontakt ---------- */
function renderContact() {
  const host = $('contactCards');
  host.textContent = '';

  const cards = [
    { icon: 'phone',     title: 'Telefon',   value: data.phone,           href: 'tel:' + data.phone.replace(/[^+\d]/g, '') },
    { icon: 'telegram',  title: 'Telegram',  value: '@' + data.telegram,  href: 'https://t.me/' + data.telegram },
    { icon: 'instagram', title: 'Instagram', value: '@' + data.instagram, href: 'https://instagram.com/' + data.instagram }
  ];

  cards.forEach(card => {
    const a = el('a');
    a.href = card.href;
    if (card.icon !== 'phone') { a.target = '_blank'; a.rel = 'noopener'; }
    const box = el('span', 'c-icon');
    box.appendChild(icon(card.icon));
    const body = el('span');
    body.append(el('span', 'c-title', card.title), el('span', 'c-value', card.value));
    a.append(box, body);
    host.appendChild(a);
  });
}

/* ---------- 10. Musiqa (konvert ochilganda boshlanadi) ---------- */
let audioEl = null;

function ensureAudio() {
  if (!audioEl) {
    audioEl = el('audio');
    audioEl.src = data.musicUrl;
    audioEl.loop = true;
    audioEl.preload = 'auto';
    document.body.appendChild(audioEl);
  }
  return audioEl;
}

function setMusicState(on) {
  const btn = $('musicToggle');
  if (!btn) return;
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  btn.setAttribute('aria-label', on ? "Musiqani o'chirish" : 'Musiqani yoqish');
}

// Musiqani boshlash (mp3 berilgan bo'lsa). Promise qaytaradi.
function playMusic() {
  if (!data.musicUrl) return Promise.resolve();
  const a = ensureAudio();
  if (!a.paused) return Promise.resolve();
  return a.play()
    .then(() => setMusicState(true))
    .catch(err => console.warn('Musiqa chalinmadi', err));
}

function pauseMusic() {
  if (audioEl && !audioEl.paused) audioEl.pause();
  setMusicState(false);
}

function bindMusic() {
  const btn = $('musicToggle');
  if (!data.musicUrl) {
    btn.remove();
    return;
  }
  btn.addEventListener('click', () => {
    if (audioEl && !audioEl.paused) pauseMusic();
    else playMusic();
  });
}

/* ---------- 11. Lightbox ---------- */
function openLightbox(src, alt) {
  const img = $('lbImg');
  img.src = src;
  img.alt = alt || '';
  $('lightbox').classList.add('is-open');
  $('lbClose').focus();
}

function closeLightbox() {
  $('lightbox').classList.remove('is-open');
}

/* ---------- 12. Gullar ---------- */
function spawnPetals() {
  if (prefersReducedMotion) return;
  const host = $('petals');
  const count = window.innerWidth < MOBILE_MAX_WIDTH ? PETAL_COUNT_MOBILE : PETAL_COUNT_DESKTOP;
  // Har xil to'kiladigan bezaklar: gulbarg, gul, barg
  const kinds = [
    { make: () => el('span', 'petal') },
    { make: () => icon('flower', 'petal petal--flower') },
    { make: () => icon('leaf', 'petal petal--leaf') },
    { make: () => icon('rose', 'petal petal--rose') },
    { make: () => icon('bloom', 'petal petal--bloom') }
  ];

  for (let i = 0; i < count; i++) {
    const p = kinds[i % kinds.length].make();
    // 0..94% — kattaroq bezaklar o'ng chetdan chiqib ketmasligi uchun
    p.style.left = Math.random() * 94 + '%';
    p.style.setProperty('--drift', (Math.random() * 6 - 3) + 'rem');
    p.style.animationDuration = (10 + Math.random() * 9) + 's';
    p.style.animationDelay = (Math.random() * 12) + 's';
    host.appendChild(p);
  }
}

/* ---------- 13. Reveal ---------- */
function bindReveal() {
  const targets = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach(t => t.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

  targets.forEach(t => io.observe(t));

  // Xavfsizlik to'ri: IntersectionObserver ishlamay qolsa (ba'zi brauzerlar,
  // prerender, headless muhit) sahifa bo'sh qolmasligi kerak.
  setTimeout(() => {
    targets.forEach(t => {
      if (t.classList.contains('is-visible')) return;
      const box = t.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) {
        t.classList.add('is-visible');
        io.unobserve(t);
      }
    });
  }, REVEAL_FALLBACK_MS);
}

/* ---------- 14. Konvertni ochish ---------- */
function openEnvelope() {
  playMusic(); // konvert ochilganda musiqa boshlanadi
  const envelope = $('envelope');
  envelope.classList.add('is-opening');

  const reveal = () => {
    envelope.classList.add('is-open');
    document.body.classList.remove('is-sealed');
    $('invite').classList.add('is-visible');
    bindReveal();
    // Konvert to'liq yo'qolgach DOM'dan olib tashlaymiz
    setTimeout(() => envelope.remove(), ENVELOPE_ANIM_MS);
  };

  if (prefersReducedMotion) reveal();
  else setTimeout(reveal, ENVELOPE_ANIM_MS / 2);
}

/* ---------- init ---------- */
function init() {
  applyTheme();
  fillText();
  renderGallery();
  renderCalendar();
  renderCountdown();
  renderSchedule();
  renderWishes();
  renderContact();
  spawnPetals();
  bindCopyCard();
  bindGiftBox();
  bindMusic();

  $('openInvite').addEventListener('click', openEnvelope);
  $('wishForm').addEventListener('submit', submitWish);
  $('magicBtn').addEventListener('click', () => {
    $('wishText').value = MAGIC_WISHES[Math.floor(Math.random() * MAGIC_WISHES.length)];
    $('wishText').focus();
  });

  $('lbClose').addEventListener('click', closeLightbox);
  $('lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  setInterval(renderCountdown, 1000);
}

init();
