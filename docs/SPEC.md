# SPEC — Jasmine Taklifnoma v2 (redizayn)

**Sana:** 2026-09-19
**Holat:** v1 tahlil qilindi → v2 spec tasdiqlanishi kerak
**Referens:** https://chorlove.uz/templates (24 ta shablon, `jasmine-white` — bevosita manba)

---

## 1. Kontekst

v1 — `chorlove.uz/templates/jasmine-white` shablonining qo'lda qayta qurilgan nusxasi.
Backend yo'q, `localStorage`da ishlaydi, admin paneli bor.

> **Yangilanish:** B1/B2 hal qilindi — ma'lumot va tilaklar Supabase'da (RLS), admin kirishi
> Supabase Auth, tilak yuborish Vercel Function `api/wishes.js` (IP rate-limit). K1 (klientdagi
> parol) olib tashlandi. B3 (RSVP) hali qilinmagan. Quyidagi matn tarixiy holatni tasvirlaydi.

Bu spec quyidagilarni qamrab oladi:
1. chorlove shablonlari bilan solishtirish (fakt asosida, sayt kodidan olingan)
2. v1 kritikasi (dizayn + kod + mahsulot)
3. v2 redizayn talablari

---

## 2. Referens tahlili — chorlove.uz

### 2.1 Shablon katalogi (24 ta)

`modern-floral`, `luxury-gold`, `spring-bahor`, `green-white`, `green-gold`,
`purple-flower`, `orchid-amplop`, `golden-card`, `cloud-castle`, `love-sakura`,
`royal-red`, `royal-blue`, `royal-green`, `glass-pink`, `red-rose-card`,
`ivory-love`, `green-garden`, `velvet-romance`, `jasmine-white`, `royal-purple`,
`pink-lotus`, `palace-rose`.

Hammasi "Premium" deb belgilangan. Segmentatsiya rang bo'yicha, struktura bo'yicha emas —
ya'ni **bitta skelet + N ta tema**. Bu muhim: mahsulot arxitekturasi shablon emas, **tema tizimi**.

### 2.2 jasmine-white — haqiqiy dizayn tokenlari (sahifa kodidan)

| Token | Qiymat | Izoh |
|---|---|---|
| Fon | `#FFFAF7` / `rgb(255,250,247)` | **iliq ivory**, oq emas |
| Asosiy | `#404A1D` | zaytun-yashil |
| Asosiy (ochiq) | `#5a6628` | hover/ikkilamchi |
| Neytral | `#A69689` | taupe — **faqat chiziq/ornament** |
| Chiziq | `#E5E0D8` | qog'oz hoshiyasi |
| Shriftlar | `Playfair Display`, `Cormorant`, `Great Vibes`, `Baskerville` | **serif-dominant** |
| Musiqa | `Patrick Watson — Je te laisserai des mots` (mp3) | to'y janri standarti |

**Diqqat:** chorlove'da **oltin rang yo'q**. Yashil + ivory + taupe.

### 2.3 Struktura (jasmine-white va velvet-romance)

```
Konvert / muqova  → "Assalomu alaykum, aziz mehmon" + ismlar + ochish
Asosiy taklif     → NIKOH TO'YI + sana + oila
Galereya          → "Bizning hikoyamiz" (6 rasm, +N overlay)
Kalendar          → dekabr 2026, 16 belgilangan + Google Calendar
Countdown         → kun/soat/daqiqa/soniya
Manzil            → "To'y manzili" + Yandex Maps
Dastur            → "To'y Dasturi", 5 band, ikonkalar bilan
Tilaklar          → "Mehmonlar tilaklari", 6 ta yozuv + yuborish
To'yona           → "Sovg'a yuborish" — kartochka variantlari
Kontakt           → tel / Telegram / Instagram
Footer            → yakuniy matn + chorlove.uz krediti
```

**v1'da yo'q, chorlove'da bor:**
- Konvert ochilish animatsiyasi (`velvet-romance`) — eng kuchli emotsional moment
- **Yandex Maps** (Google emas)
- Til almashtirgich (O'Z / RU)
- Dastur bandlariga ikonkalar
- To'yona — bosiladigan kartochkalar

---

## 3. v1 kritikasi

### 3.1 Bloker — mahsulot ishlamaydi

| # | Muammo | Oqibat |
|---|---|---|
| B1 | Barcha ma'lumot `localStorage`da | Admin telefonida tahrirlaydi → mehmon o'z telefonida **default matnni** ko'radi. Mahsulot sotib bo'lmaydi. |
| B2 | Tilaklar ham `localStorage`da | Mehmon tilak yozadi → **faqat o'zi ko'radi**. Kelin-kuyov hech qachon ko'rmaydi. Xotira kitobining butun ma'nosi yo'q. |
| B3 | **RSVP yo'q** | Kelin-kuyovga eng kerak narsa — necha kishi keladi. Umuman yo'q. |
| B4 | To'yona — faqat 🎁 emoji | Karta raqami yo'q, Payme/Click yo'q. Bo'lim hech narsa qilmaydi. |

`localStorage` — arxitektura chegarasi, bug emas. Backend tanlash **sizning qaroringiz**,
shuning uchun v2'da men uni **adapter seam** (`store.js`) orqali ajratdim: bugun localStorage,
ertaga Supabase — `index.html`/`app.js` o'zgarmaydi.

### 3.2 Dizayn

| # | Muammo | Nega yomon |
|---|---|---|
| D1 | `--bg: #ffffff` sof oq | Telefonda "Word hujjati" effekti. chorlove `#FFFAF7` — qog'oz hissi shu yerdan keladi. |
| D2 | `--gold: #c2a05a` | chorlove'da yo'q. Zaytun bilan urishadi. Va `#c2a05a` oq fonda **2.3:1** — WCAG buziladi. |
| D3 | **Emoji**: 🎁 📞 ✈️ 📸 🌿 🔐 👰 | Har qurilmada boshqacha chiziladi (iPhone ≠ Android ≠ Windows). Premium hissini bir zumda o'ldiradi. |
| D4 | Tushayotgan gullar — **matn glifi** `🌸 ❀ ✿` | iPhone'da rangli sticker yomg'iri. 26 ta DOM elementi doim animatsiyada. |
| D5 | `Jost` (geometrik sans) — asosiy matn shrifti | "SaaS landing page" ohangi. chorlove butunlay serif. |
| D6 | Hamma narsa markazda, konteynersiz oqim | Taklifnoma — **qog'oz buyum**. Ramka/karta yo'q, shuning uchun raqamli varaqqa o'xshaydi. |
| D7 | `@media (max-width: 820px)` — desktop-first | 95% mehmon Telegram'dan telefonda ochadi. Asosiy holat — fallback sifatida yozilgan. |
| D8 | "Taklifnomani ochish" tugmasi faqat `scrollIntoView` | Eng qimmatli moment behuda ketgan. chorlove bu yerda konvert ochadi. |

### 3.3 Kod / UX

| # | Muammo | Fayl |
|---|---|---|
| K1 | `ADMIN_PASS = '1234'` klient JS ichida | `admin.js:5` — himoya emas, teatr. View Source → tugadi. |
| K2 | `.reveal { opacity: 0 }` — JS o'chsa **butun sahifa oq** | `style.css:762`. `<noscript>` fallback yo'q. |
| K3 | Musiqani majburan yoqish: `scroll`/`wheel`/`pointerdown` capture listener | `app.js:288` — foydalanuvchi shunchaki scroll qildi, musiqa boshlandi. Dushmanona. |
| K4 | `musiqa.mp3` — **4.2 MB**, lekin `musicUrl: ''` | Fayl umuman ishlatilmaydi. O'lik yuk. |
| K5 | `prefers-reduced-motion` yo'q | Vestibulyar buzilishi bor foydalanuvchi uchun muammo. |
| K6 | OG/Twitter meta teglari yo'q | Havola Telegram'ga tashlanadi → 200 mehmon **birinchi** ko'radigan narsa preview. Hozir preview yo'q. |
| K7 | `.day.today` — aslida to'y kuni, bugun emas | `app.js:97` — semantik xato, `::after` da yana emoji. |
| K8 | Countdown: `d` padded emas, `h/m/s` padded | `app.js:113-116` — ustunlar sakraydi. |
| K9 | `renderContact` `innerHTML` bilan | `app.js:187` — admin kiritgan matn sanitizatsiyasiz. |
| K10 | i18n yo'q | chorlove'da O'Z/RU bor. Ruszabon mehmonlar — real segment. |

---

## 4. v2 talablari

### 4.1 Dizayn tizimi

```
--paper:    #FBF7F2   iliq ivory fon
--paper-2:  #F3EDE4   bo'lim fonini ajratish
--ink:      #2A2A24   asosiy matn
--ink-2:    #6B6458   ikkilamchi matn (paper'da 5.5:1 — AA ✓)
--olive:    #404A1D   asosiy (paper'da 8.9:1 — AAA ✓)
--olive-2:  #5A6628   hover
--taupe:    #A69689   FAQAT chiziq/ornament, hech qachon matn emas
--line:     #E0D8CC   hoshiya
```

Oltin **olib tashlanadi**.

**Shrift rollari** (v1'da rol taqsimoti umuman yo'q edi):
- `Great Vibes` → **faqat ismlar**
- `Cormorant Garamond` → sarlavha + asosiy matn
- `Jost` → faqat uppercase yorliq va tugmalar

**Ornamentlar:** barcha emoji va matn glifi → **inline SVG** (jasmin novdasi, ajratgich,
kontakt/dastur ikonkalari). Bitta `<svg>` sprite, `<use>` orqali.

**Gullar:** SVG data-URI gulbarg, 8 (mobil) / 14 (desktop), `prefers-reduced-motion`da o'chadi.

**Qog'oz konteyner:** kontent `max-width: 560px` "varaq" ichida, ichki hoshiya bilan.

**Mobile-first:** asosiy CSS — telefon. `@media (min-width: 760px)` — kengaytma.

### 4.2 Yangi funksiyalar

| # | Funksiya | Tafsilot |
|---|---|---|
| F1 | **Konvert ochilishi** | Muqova = muhrlangan konvert. Bosilganda qopqoq 3D ochiladi, karta ko'tariladi, kontent ochiladi. |
| F2 | **RSVP** | "Kelaman / Kelolmayman" + ism + mehmonlar soni. Adminda javoblar ro'yxati + sanoq. |
| F3 | **To'yona — real** | Karta raqami + "Nusxa olish" tugmasi, karta egasi ismi, ixtiyoriy Payme/Click havolasi. |
| F4 | **Yandex Maps** | Asosiy — Yandex (O'zbekistonda Google ma'lumoti zaif). Google — ikkilamchi havola. |
| F5 | **OG meta** | `og:title`, `og:description`, `og:image` — Telegram preview uchun. |
| F6 | Dastur ikonkalari | Har bandga SVG ikonka. |
| F7 | `<noscript>` + reveal fallback | JS o'chsa ham sahifa to'liq o'qiladi. |
| F8 | Musiqa — halol | Default **o'chiq**, avtoplay majburlash yo'q, faqat tugma. |

**v2'da qamrab olinmaydi** (alohida qaror kerak):
- Backend (Supabase) — `store.js` seam tayyor, ulash sizning tasdiqingiz bilan
- RU tili — struktura tayyor (`data.lang`), tarjima matnlari kerak
- Admin parolini serverga ko'chirish — backendsiz ma'nosiz

### 4.3 Fayl tuzilmasi (v2)

```
index.html      publik sahifa (konvert + SVG sprite + OG)
style.css       v2 dizayn tizimi, mobile-first
app.js          sahifa logikasi
store.js        YANGI — ma'lumot adapteri (localStorage → keyinchalik API)
config.js       default ma'lumotlar modeli (+ rsvp, card, mapProvider)
admin.html/.js/.css   admin (+ RSVP javoblari, + to'yona maydonlari)
docs/SPEC.md    shu hujjat
```

### 4.4 Qabul mezonlari

- [ ] Sahifada bitta ham emoji yo'q
- [ ] Barcha matn ranglari WCAG AA (4.5:1) dan o'tadi
- [ ] JS o'chirilgan holda kontent to'liq ko'rinadi
- [ ] `prefers-reduced-motion: reduce` — gullar va reveal o'chadi
- [ ] 360px kenglikda gorizontal scroll yo'q
- [ ] Telegram'ga havola tashlanganda preview chiqadi
- [ ] RSVP javobi adminda ko'rinadi
- [ ] Karta raqami bir bosishda nusxalanadi
- [ ] Musiqa o'zi boshlanmaydi

---

## 5. Keyingi qaror (sizdan)

1. **Backend** — Supabase ulaymizmi? Busiz B1/B2/B3 hal bo'lmaydi va mahsulot sotilmaydi.
2. **RU tili** — kerakmi?
3. **Tema tizimi** — chorlove kabi bitta skelet + N tema qilamizmi (bir marta yozib, 20 ta shablon sotish)?

---

# v3 — Tema tizimi + green-white

**Sana:** 2026-09-19
**Referens:** https://chorlove.uz/templates/green-white

## 1. Nega

chorlove'ning 22 ta shabloni — bitta skelet + N ta tema. v2 da palitra `style.css`
`:root` ga qattiq yozilgan edi, ya'ni har yangi shablon = butun CSS ni qayta yozish.
v3 da rang/shrift tokenlari `themes.css` ga ajratildi: yangi tema ~15 daqiqa.

## 2. green-white tahlili

Tokenlar sahifa kodidan olingan (`chorlove.uz/templates/green-white`):

| Token | green-white | jasmine-white (bizda) |
|---|---|---|
| Fon | `#FFFDFB` sovuq oq | `#FBF7F2` iliq bej |
| Asosiy | `#2D321B` | `#404A1D` |
| Ikkilamchi | `#666947` — **matnga yaroqli 5.6:1** | `#6B6458` (taupe `#A69689` matnga yaroqsiz) |
| Chiziq | `#E5E0D8` | `#E0D8CC` |
| Display | **Marcellus** (formal antiqva, UPPERCASE) | **Great Vibes** (script) |
| Matn | Cormorant | Cormorant |
| Yorliq | Jost | Jost |
| Bezak | `cloud.webp` / `flower.webp` / `divider.webp` — qatlamli rastr | ingichka chiziqli SVG |

### Ulardan olingani

1. **Marcellus uppercase** — script shrift to'y taklifnomalarida haddan ko'p ishlatiladi.
   Antiqva formalroq va katta o'lchamda o'qiladi. green-white ning eng kuchli qarori.
2. **Sovuq oq fon** — yashil bilan kontrastni kuchaytiradi.
3. **Qatlamli botanika** — premium farqi tipografiyada emas, aynan shu yerda.

### Bizda qolgani (green-white'da yo'q)

RSVP, karta raqami + nusxa olish, OG meta teglar, `prefers-reduced-motion`,
`<noscript>` fallback, konvert ochilish animatsiyasi.

### Qo'shilmagani (siz rad etdingiz)

Bismillah sarlavhasi, Qur'on oyati (Rum 21), "Kelin & Kuyov" portret bloki.

## 3. Bezaklar — Stitch

chorlove ning `*.webp` fayllari **nusxa olinmadi** (ularning mulki).
O'rniga Google Stitch'da original botanik to'plam generatsiya qilindi:

- Loyiha: `projects/14118045967099546965`
- Dizayn tizimi: `assets/2678199059822881172`
- Natija: `stitch/green-white/02-ornaments.{png,html}`

Stitch chiqargan **inline SVG** to'g'ridan-to'g'ri sprite'ga ko'chirildi
(`#i-novda-gw`, `#i-ajratgich-gw`, `#i-gul-gw`, `#i-gul-tupi-gw`,
`#i-burchak-gw`, `#i-bulut-gw`). `#2D321B` → `currentColor` ga almashtirildi,
shuning uchun ornamentlar tema rangiga bo'ysunadi.

**Stitch cheklovlari (bilib qo'ying):**
- Shrift ro'yxatida Cormorant / Marcellus / Great Vibes **yo'q**. Maketlarda
  Playfair / EB Garamond / Montserrat ishlatildi — production CSS haqiqiy
  Google Fonts'ni saqlaydi.
- Stitch sahifaga ilova chrome'i (yuqori panel, pastki tab bar) qo'shishga moyil.
  Promptda ochiq taqiqlash kerak.
- Stitch **kod tahlilchisi emas** — mavjud CSS/JS ni o'qiy olmaydi.

## 4. Arxitektura

```
style.css    struktura: ritm, tuzilma, holat. :root da faqat
             --sheet-w --gap --radius --shadow --t-* --ease
themes.css   [data-theme="..."] bloklari: rang + shrift + ornament
config.js    THEMES ro'yxati (id, label, themeColor, sprig, cornerOrnament)
app.js       applyTheme() -> body.dataset.theme + ornament almashuvi
index.html   <body data-theme="jasmine-white"> — JS o'chsa ham to'g'ri chiqadi
```

Token nomlari semantik qilindi: `--olive` → `--primary`, `--olive-2` → `--primary-2`,
`--taupe` → `--accent`. Tema tizimida rang nomi ("olive") token nomi bo'la olmaydi.

Script va antiqva shriftlar bitta qoidada tura olmaydi, shuning uchun uchta
boshqaruvchi token: `--display-case`, `--display-tracking`, `--display-scale`.
Marcellus bir xil kegelda Great Vibes'dan ancha yirik ko'rinadi → `--display-scale: 0.72`.

## 5. Yangi tema qo'shish (5 qadam)

1. `themes.css` ga `[data-theme="nom"] { ... }` bloki
2. `index.html` `<head>` ga kerakli Google Font
3. Ornament kerak bo'lsa — sprite'ga `<symbol id="i-*-nom">`
4. `config.js` `THEMES` ga yozuv
5. Tekshirish: `node scripts/verify.js`

## 6. Tekshirish vositalari

| Buyruq | Nima qiladi |
|---|---|
| `node scripts/verify.js` | id havolalari, SVG ornamentlar, tema tokenlari to'liqligi, WCAG kontrast, emoji, eski token qoldiqlari |
| `node scripts/make-preview.js` | har tema uchun `.preview/*.html` (konvert ochiq, bo'limlar ko'rinadi) |
| `node scripts/shot.js <fayl> <kenglik> <out.png>` | CDP orqali brauzerda ochadi, gorizontal overflow va konsol xatolarini o'lchaydi, sahifani bo'laklab suratga oladi |

`shot.js` Playwright talab qilmaydi — Node'ning o'zidagi `WebSocket` va
`ms-playwright` bilan kelgan Chromium ishlatiladi.

## 7. v3 da tuzatilgan xatolar

| Xato | Qayerda |
|---|---|
| Konvert qopqog'i salomlashuv matnini bekitardi (`padding-top` 3.25rem < qopqoq 5.5rem) | `style.css` `.env-card` → 6.5rem |
| Muhr ichidagi 4 bargli gul "+" belgisiga o'xshardi | `index.html` `#i-bloom` → 5 bargli |
| `placeholderImage()` jasmine ranglarini qattiq yozgan edi | `app.js` → `cssVar()` orqali temadan |
| IntersectionObserver ishlamasa sahifa bo'sh qolardi | `app.js` `bindReveal()` → `REVEAL_FALLBACK_MS` xavfsizlik to'ri |

## 8. Hali ham ochiq

v2 dagi bloker o'zgarmadi: **`localStorage`**. Admin tahrirlaganini mehmon ko'rmaydi,
mehmon yozgan tilak va RSVP javobi faqat o'sha brauzerda qoladi.
`store.js` seam tayyor — backend ulash sizning qaroringiz.
