# Stitch maketlari

Bu papka — **referens**, deploy'ga kirmaydi. Google Stitch'da generatsiya qilingan.

- Loyiha: `projects/14118045967099546965`
- Dizayn tizimi: `assets/2678199059822881172`

## green-white

| Fayl | Nima |
|---|---|
| `01-cover.png` | Muqova (konvert + muhr). Stitch ilova chrome'i qo'shgan — keyingi promptlarda taqiqlandi |
| `02-ornaments.png` / `.html` | **Botanik bezak katalogi.** HTML ichidagi inline SVG to'g'ridan-to'g'ri `index.html` sprite'iga ko'chirilgan |
| `03-intro-gallery.png` | Kirish + galereya |
| `04-savedate.png` | Sana, kalendar, countdown |
| `05-venue-program.png` | Manzil + to'y dasturi |
| `06-rsvp-gift-contact.png` | RSVP + tilaklar + to'yona + kontakt + footer |

## Kodga nima ko'chdi

**Faqat vizual qarorlar.** Stitch chiqargan Tailwind/HTML **ishlatilmadi** — loyihaning
semantik HTML va vanilla CSS strukturasi saqlandi.

Aniq ko'chganlar:
1. `02-ornaments.html` dagi 6 ta inline SVG → sprite'dagi `#i-*-gw` symbol'lari
   (`#2D321B` → `currentColor`, shuning uchun tema rangiga bo'ysunadi)
2. Palitra va Marcellus uppercase qarori → `themes.css` `[data-theme="green-white"]`
3. Burchak botanikasi kompozitsiyasi → `.sheet-orn` qoidalari

## Stitch cheklovlari (keyingi safar uchun)

1. **Shrift ro'yxatida Cormorant / Marcellus / Great Vibes yo'q.**
   Maketlarda Playfair Display / EB Garamond / Montserrat ishlatilgan.
   Production CSS haqiqiy Google Fonts'ni saqlaydi.
2. **Stitch ilova chrome'i qo'shishga moyil** (yuqori panel, pastki tab bar, ortga
   tugmasi). Promptda ochiq taqiqlash kerak: "a section of a single continuous
   scrolling page, NOT an app. No top app bar, no bottom navigation bar…"
3. **Stitch kod tahlilchisi emas** — mavjud CSS/JS ni o'qiy olmaydi va ularga
   kritika bera olmaydi.
4. Bezak kerak bo'lsa — alohida "ornament sheet" ekrani so'rang. Stitch shaffof
   fonli alohida fayl bermaydi, lekin **inline SVG** beradi, bu yetarli.
