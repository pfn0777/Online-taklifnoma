/* ============================================================
   Har tema uchun vaqtinchalik oldindan ko'rish sahifasi yasaydi.
   Konvert avtomatik ochiladi va barcha bo'limlar ko'rinadi —
   shuning uchun butun sahifani bir marta suratga olish mumkin.

   Ishlatish:
     node scripts/make-preview.js            # .preview/ ga yozadi
     node scripts/shot.js .preview/green-white.html 430 out.png

   .preview/ papkasi vaqtinchalik — commit qilinmaydi.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '.preview');

const HARNESS =
  '<style>.reveal{opacity:1!important;transform:none!important}#petals{display:none}</style>\n' +
  '<script>window.addEventListener("load",function(){\n' +
  '  var b=document.getElementById("openInvite"); if(b) b.click();\n' +
  '});</script>';

const base = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// config.js dagi THEMES ro'yxatidan temalarni olamiz — qo'lda takrorlamaymiz
const cfg = fs.readFileSync(path.join(ROOT, 'config.js'), 'utf8');
const themes = [...cfg.matchAll(/id: '([\w-]+)',\s*\n\s*label:/g)].map(m => m[1]);

if (!themes.length) {
  console.error('config.js dan tema topilmadi');
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

for (const theme of themes) {
  const page = base
    .replace(/data-theme="[\w-]+"/, 'data-theme="' + theme + '"')
    .replace('<script src="store.js"></script>',
      '<script>DEFAULT_DATA.theme="' + theme + '";</script>\n<script src="store.js"></script>')
    .replace('</body>', HARNESS + '\n</body>');

  // .preview/ ichidan asosiy fayllarga yo'l bir daraja yuqoriga
  const fixed = page.replace(/(href|src)="(?!https?:|data:|#)([\w./-]+)"/g, '$1="../$2"');

  fs.writeFileSync(path.join(OUT, theme + '.html'), fixed);
  console.log('.preview/' + theme + '.html');
}
