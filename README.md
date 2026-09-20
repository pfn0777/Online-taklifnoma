# Jasmine Taklifnoma v3

Elektron to'y taklifnomasi — o'zbek tilida, to'liq tahrirlanadigan, backend talab qilmaydi.
chorlove.uz shablonlari asosida, lekin qayta loyihalangan.
**Ikkita tema:** `jasmine-white` va `green-white`.

Tahlil, kritika va redizayn qarorlari: **[docs/SPEC.md](docs/SPEC.md)**

## Fayllar

| Fayl | Vazifa |
|------|--------|
| `index.html` | Publik sahifa — konvert, SVG sprite, OG teglar |
| `style.css` | Struktura — mobile-first, temadan mustaqil |
| `themes.css` | Tema tokenlari — rang, shrift, ornament |
| `app.js` | Sahifa logikasi |
| `store.js` | Ma'lumot adapteri (localStorage → keyinchalik API) |
| `config.js` | Default ma'lumot modeli |
| `i18n.js` | Interfeys lug'atlari (uz / ru), til aniqlash |
| `admin.html` / `admin.js` / `admin.css` | Admin panel + tema tanlash |
| `assets/` | Akvarel gul va sovg'a qutisi rasmlari (WebP + PNG) |
| `scripts/` | Tekshirish vositalari va asset generatori (quyida) |
| `stitch/green-white/` | Stitch maketlari (referens) |
| `stitch/jasmine-akvarel/` | Stitch akvarel plitalari (asset manbasi) |

## Bezaklar

Akvarel gullar va sovg'a qutisi **Stitch**'da generatsiya qilingan
(`stitch/jasmine-akvarel/*-hi.png`, 1024x1024, tekis krem fonda).
Ulardan sayt assetlarini yasash:

```bash
python scripts/make-assets.py
```

Skript plitalarni kesadi, fonni flood fill bilan shaffof qiladi, kesib
kichraytiradi va `assets/` ga WebP + PNG qilib yozadi. Gullarni sahifaga
`app.js` dagi `renderFlorals()` joylashtiradi, qaysi bo'limga qaysi rasm
tushishi `config.js` dagi `FLORAL_SET` da.

## Ishlatish

**Mehmon uchun** — `index.html`. Konvert ochiladi, so'ng: kirish → galereya →
sana va countdown → manzil → dastur → tilaklar → to'yona → kontakt.

**Tahrirlash** — `admin.html`, email + parol bilan Supabase Auth orqali kiriladi.
Barcha maydonlarni to'ldiring → **Saqlash** — o'zgarish hamma mehmonga ko'rinadi.

**Backend** — Supabase (Postgres + Auth + RLS), tilak yuborish — Vercel Function
`api/wishes.js`. Sozlash: Supabase'da admin user yarating (Authentication → Users,
"Allow new users to sign up" o'chiq), Vercel'da env: `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY` (faqat Vercel'da, kodga yozilmaydi).

## v1'dan farqi

- Konvert ochilish animatsiyasi (oldin tugma faqat scroll qilardi)
- **To'yona** — karta raqami + bir bosishda nusxa olish, ixtiyoriy Payme/Click havolasi
- **Yandex Maps** (O'zbekistonda Google ma'lumoti zaif)
- Barcha emoji va matn glifi → **inline SVG** ornamentlar
- Oltin rang olib tashlandi; palitra chorlove bilan moslandi (`#FBF7F2` / `#404A1D` / `#A69689`)
- Mobile-first CSS, WCAG AA kontrast, `prefers-reduced-motion`, `<noscript>` fallback
- OG meta teglari — Telegram'da havola preview'i
- Musiqa "Taklifnomani ochish" bosilganda boshlanadi; `musicUrl` bo'sh bo'lsa tugma ko'rinmaydi

## Ikki til (uz / ru)

Til **havolada** bo'ladi — mehmon qaysi qurilmada ochsa ham o'sha tilni ko'radi:

| Havola | Til |
|---|---|
| `index.html` yoki `index.html?lang=uz` | o'zbekcha |
| `index.html?lang=ru` | ruscha |

`?lang=` bo'lmasa admin paneldagi **Default til** ishlatiladi. Noto'g'ri qiymat
(masalan `?lang=de`) o'zbekchaga tushadi.

Admin panelda:

- **Rus tilidagi matnlar (RU)** paneli — har bir matn maydonining ruscha varianti.
  Bo'sh qolsa o'sha joyda o'zbekcha matn ko'rinadi.
- **Mehmonga yuboriladigan havola** paneli — ikkala tildagi havolani bir bosishda nusxalash.
- To'y dasturining har bandida "Band nomi (RU)" maydoni.
- Jonli ko'rinishni UZ/RU da ko'rish uchun til selekti.

Bo'lim sarlavhalari, tugmalar, oy va hafta nomlari, countdown yorliqlari —
avtomatik, `i18n.js` dagi `UI` lug'atidan.

**Yangi interfeys matni qo'shsangiz:** HTML'ga `data-t="kalit"` yozing
(atribut uchun `data-t-ph` / `data-t-aria` / `data-t-title`) va `UI.uz` bilan
`UI.ru` ikkalasiga qiymat qo'shing. `node scripts/verify.js` buni tekshiradi.

**Yangi tarjima qilinadigan maydon qo'shsangiz:** `config.js` dagi `TRANSLATABLE`
ro'yxatiga kalitni, `DEFAULT_DATA.ru` ga qiymatni va `admin.html` ga
`id="f-ru-<kalit>"` maydonini qo'shing.

## Temalar

| Tema | Fon | Asosiy | Display shrift |
|---|---|---|---|
| `jasmine-white` | `#FBF7F2` iliq ivory | `#404A1D` | Great Vibes (script) |
| `green-white` | `#FFFDFB` sovuq oq | `#2D321B` | Marcellus (antiqva, UPPERCASE) |

Temani admin panelda tanlaysiz. Yangi tema qo'shish — `themes.css` boshidagi 5 qadam.

green-white ornamentlari Google Stitch'da generatsiya qilingan (chorlove fayllari
nusxa olinmagan) — `stitch/green-white/`, batafsil `docs/SPEC.md`.

## Tekshirish

```bash
node scripts/verify.js                                  # id, ornament, token, kontrast, emoji, i18n
node scripts/make-preview.js                            # .preview/<tema>.html
node scripts/shot.js .preview/green-white.html 430 out.png   # brauzerda o'lchash + surat
```

`shot.js` Playwright talab qilmaydi — Node'ning `WebSocket`i va `ms-playwright`
bilan kelgan Chromium orqali Chrome DevTools Protocol'ga ulanadi.
Gorizontal overflow, konsol xatolari va sahifa bo'laklarini beradi.

## Ma'lum cheklovlar

Ma'lumot va tilaklar Supabase'da. Supabase yoki internet o'chsa mehmon oxirgi
keshlangan yoki default matnni ko'radi, lekin tilak yozib bo'lmaydi. Bepul Supabase
loyihasi 1 hafta faolliksiz qolsa pauza qilinadi.

Admin tilaklarni faqat ko'ra va o'chira oladi (tahrirlash/qo'shish yo'q).

`musiqa.mp3` (4.2 MB) repoda turibdi, lekin `musicUrl` bo'sh — ishlatilmayapti.
Kerak bo'lsa admin panelda `musiqa.mp3` deb yozing, aks holda faylni o'chirish mumkin.
