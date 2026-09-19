/* ============================================================
   Statik tekshiruv — brauzersiz ishlaydi.
   Ishga tushirish:  node scripts/verify.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

let failures = 0;
function check(label, ok, detail) {
  console.log((ok ? '  OK    ' : '  XATO  ') + label + (detail ? ' — ' + detail : ''));
  if (!ok) failures++;
}

/* ---------- 1. HTML id  <->  JS $('id') ---------- */
function idsIn(file) {
  return new Set([...read(file).matchAll(/id="([\w-]+)"/g)].map(m => m[1]));
}
function refsIn(file) {
  return new Set([...read(file).matchAll(/\$\('([\w-]+)'\)/g)].map(m => m[1]));
}

console.log('\n[1] Element id havolalari');
for (const [js, html] of [['app.js', 'index.html'], ['admin.js', 'admin.html']]) {
  const have = idsIn(html);
  const missing = [...refsIn(js)].filter(x => !have.has(x));
  check(js + ' -> ' + html, missing.length === 0, missing.length ? missing.join(', ') : refsIn(js).size + ' ta id');
}

/* ---------- 2. SVG sprite havolalari ---------- */
console.log('\n[2] SVG ornament havolalari');
const html = read('index.html');
const symbols = new Set([...html.matchAll(/<symbol id="(i-[\w-]+)"/g)].map(m => m[1]));
const used = new Set([...html.matchAll(/href="#(i-[\w-]+)"/g)].map(m => m[1]));

const cfg = read('config.js');
for (const m of cfg.matchAll(/icon: '([\w-]+)'/g)) used.add('i-' + m[1]);
for (const m of cfg.matchAll(/(?:sprig|cornerOrnament): '(i-[\w-]+)'/g)) used.add(m[1]);
for (const m of read('admin.js').matchAll(/SCHEDULE_ICONS = \[([^\]]+)\]/g)) {
  for (const n of m[1].match(/'([\w-]+)'/g) || []) used.add('i-' + n.replace(/'/g, ''));
}

const badIcons = [...used].filter(x => !symbols.has(x));
check('barcha #i-* mavjud', badIcons.length === 0,
  badIcons.length ? 'yo’q: ' + badIcons.join(', ') : symbols.size + ' symbol / ' + used.size + ' ishlatilgan');

/* ---------- 3. Tema tokenlari to'liqligi ---------- */
console.log('\n[3] Tema tokenlari');
const themes = read('themes.css');
const style = read('style.css');

// style.css qaysi tokenlarni talab qiladi
const required = new Set([...style.matchAll(/var\((--[\w-]+)(?:,[^)]*)?\)/g)].map(m => m[1]));
// struktura tokenlari :root da
const rootBlock = style.slice(style.indexOf(':root {'), style.indexOf('}', style.indexOf(':root {')));
const inRoot = new Set([...rootBlock.matchAll(/(--[\w-]+):/g)].map(m => m[1]));
// fallback bilan yozilganlar majburiy emas
const withFallback = new Set([...style.matchAll(/var\((--[\w-]+),[^)]*\)/g)].map(m => m[1]));

const themeIds = [...themes.matchAll(/\[data-theme="([\w-]+)"\] \{/g)].map(m => m[1]);
check('temalar topildi', themeIds.length >= 2, themeIds.join(', '));

for (const id of themeIds) {
  const start = themes.indexOf('[data-theme="' + id + '"] {');
  const block = themes.slice(start, themes.indexOf('}', start));
  const defined = new Set([...block.matchAll(/(--[\w-]+):/g)].map(m => m[1]));
  const missing = [...required].filter(t => !inRoot.has(t) && !defined.has(t) && !withFallback.has(t));
  check('tema "' + id + '" to’liq', missing.length === 0,
    missing.length ? 'yetishmaydi: ' + missing.join(', ') : defined.size + ' token');
}

/* ---------- 4. Kontrast (WCAG) ---------- */
console.log('\n[4] Matn kontrasti (WCAG AA = 4.5:1)');
function luminance(hex) {
  const v = hex.replace('#', '');
  const ch = [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

for (const id of themeIds) {
  const start = themes.indexOf('[data-theme="' + id + '"] {');
  const block = themes.slice(start, themes.indexOf('}', start));
  const token = (name) => (block.match(new RegExp('--' + name + ':\\s*(#[0-9A-Fa-f]{6})')) || [])[1];

  const paper = token('paper');
  if (!paper) continue;
  for (const name of ['ink', 'ink-2', 'primary']) {
    const c = token(name);
    if (!c) continue;
    const r = ratio(c, paper);
    check(id + ' · --' + name + ' / --paper', r >= 4.5, r.toFixed(2) + ':1');
  }
  // --accent matn uchun ishlatilmasligi kerak
  const accent = token('accent');
  if (accent) {
    const r = ratio(accent, paper);
    check(id + ' · --accent faqat bezak uchun', r < 4.5,
      r.toFixed(2) + ':1 — matnga ishlatilmasin');
  }
}

/* ---------- 5. Emoji ---------- */
console.log('\n[5] Emoji nazorati');
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2764}]/u;
const files = ['index.html', 'admin.html', 'style.css', 'themes.css', 'admin.css',
               'app.js', 'admin.js', 'config.js', 'store.js', 'i18n.js'];
const dirty = files.filter(f => EMOJI.test(read(f)));
check('emoji yo’q', dirty.length === 0, dirty.length ? dirty.join(', ') : files.length + ' fayl tekshirildi');

/* ---------- 6. Eski token qoldiqlari ---------- */
console.log('\n[6] Eski token qoldiqlari');
const stale = ['style.css', 'admin.css', 'themes.css']
  .filter(f => /var\(--(olive|taupe|script)\b/.test(read(f)));
check('--olive / --taupe / --script qolmagan', stale.length === 0, stale.join(', '));

/* ---------- 7. Ikki til to'liqligi ---------- */
console.log('\n[7] Ikki til (uz / ru)');

// i18n.js va config.js ning top-level qismi brauzer API'siga tegmaydi —
// shuning uchun ularni shu yerda bemalol baholash mumkin.
const { UI, LANGS, TRANSLATABLE, DEFAULT_DATA } = new Function(
  read('i18n.js') + '\n' + read('config.js') +
  '\nreturn { UI, LANGS, TRANSLATABLE, DEFAULT_DATA };'
)();

check('tillar', LANGS.length >= 2, LANGS.join(', '));

// HTML data-t* va app.js tr('...') kalitlari ikkala lug'atda bo'lishi kerak
const usedKeys = new Set([
  ...[...html.matchAll(/data-t(?:-ph|-aria|-title)?="([\w-]+)"/g)].map(m => m[1]),
  ...[...read('app.js').matchAll(/tr\('([\w-]+)'\)/g)].map(m => m[1])
]);

for (const lang of LANGS) {
  const missing = [...usedKeys].filter(k => UI[lang][k] === undefined);
  check('UI.' + lang + ' to’liq', missing.length === 0,
    missing.length ? 'yetishmaydi: ' + missing.join(', ') : usedKeys.size + ' kalit');
}

// Lug'atlar bir-biriga mos bo'lsin (ru'da ortiqcha/kam kalit qolmasin)
const uzKeys = Object.keys(UI.uz);
const ruExtra = Object.keys(UI.ru).filter(k => uzKeys.indexOf(k) === -1);
const ruMissing = uzKeys.filter(k => UI.ru[k] === undefined);
check('UI.uz <-> UI.ru mos', ruExtra.length === 0 && ruMissing.length === 0,
  [ruMissing.length ? 'ru’da yo’q: ' + ruMissing.join(', ') : '',
   ruExtra.length ? 'ru’da ortiqcha: ' + ruExtra.join(', ') : ''].filter(Boolean).join(' | ')
  || uzKeys.length + ' kalit');

// Har bir tarjima qilinadigan maydon uchun admin'da RU input bo'lsin
const adminIds = idsIn('admin.html');
const noInput = TRANSLATABLE.filter(k => !adminIds.has('f-ru-' + k));
check('admin.html RU maydonlari', noInput.length === 0,
  noInput.length ? 'yo’q: ' + noInput.map(k => 'f-ru-' + k).join(', ') : TRANSLATABLE.length + ' maydon');

// DEFAULT_DATA.ru default qiymatlari
const noDefault = TRANSLATABLE.filter(k => !DEFAULT_DATA.ru || !DEFAULT_DATA.ru[k]);
check('DEFAULT_DATA.ru to’liq', noDefault.length === 0,
  noDefault.length ? 'yo’q: ' + noDefault.join(', ') : Object.keys(DEFAULT_DATA.ru).length + ' qiymat');

// Dastur bandlarida RU nomi
const noLabelRu = (DEFAULT_DATA.schedule || []).filter(x => !x.labelRu);
check('schedule labelRu', noLabelRu.length === 0,
  noLabelRu.length ? noLabelRu.map(x => x.label).join(', ') : DEFAULT_DATA.schedule.length + ' band');

/* ---------- natija ---------- */
console.log('\n' + (failures ? failures + ' ta xato' : 'Hammasi joyida') + '\n');
process.exit(failures ? 1 : 0);
