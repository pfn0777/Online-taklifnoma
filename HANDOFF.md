# Handoff — 2026-10-15

## Git holati
- Branch `main`, `origin/main` bilan sinxron, working tree toza (bu fayldan tashqari).
- Oxirgi 5 commit:
  - `5085d8d` feat: implement Open Graph meta tags and language handling for invitations
  - `d52c265` feat(admin): add dynamic URL language persistence and update view link
  - `071e2bc` feat(music): update musicUrl to default to 'musiqa.mp3'
  - `78af82e` o'chirildi
  - `3d7f568` asasas

## Joriy bosqich
Production'dagi saytni ishga tushirish: kod tayyor, faqat Vercel sozlamasi qoldi.

## Nima qilindi
- Hetzner'ga deploy qilish rejasi **bekor qilindi**. Loyiha Vercel + Supabase'da qoladi. Serverda hech narsa o'zgartirilmadi.
- Diagnostika natijalari:
  - `npm test`: 11/11 o'tdi. `node scripts/verify.js`: "Hammasi joyida".
  - Supabase `taklifnoma` (`gearyufbppfwfyjlbwzy`) holati ACTIVE_HEALTHY. `invitation` (id=1), `wishes` va `rate_limits` jadvallari bor, RLS yoqilgan.
  - **Sayt ishlamasligining sababi:** Vercel loyihasi `online-taklifnoma` (`prj_WChNot49cD0Q0DyVJgufvMtIrtuF`, team `pfn0777s-projects`) manzillari Vercel Authentication (SSO) bilan yopiq: `online-taklifnoma-pfn0777s-projects.vercel.app` ochilganda 302 bilan vercel.com/sso-api'ga yo'naltiradi.
  - `online-taklifnoma.vercel.app` **boshqa odamning sayti** (Tailwind, `broken_angel.mp3`). U bizniki emas, ishlatmaslik kerak.
- Vercel MCP bu loyihaga kira olmaydi (get_project 404, list_deployments 403, bypass 403). Sozlamani foydalanuvchi dashboard'da qo'lda o'zgartiradi.

## Nima qoldi
1. Foydalanuvchi Vercel'da bajaradi:
   - **Settings → Domains**'da bo'sh `*.vercel.app` nom qo'shadi.
   - **Settings → Deployment Protection**'da Vercel Authentication'ni o'chiradi.
2. Yangi domen bo'yicha tekshiruv:
   - `/` 200 beradi va 36 KB'li `index.html` qaytadi.
   - `/app.js` va `/admin.html` 200 beradi.
   - `POST /api/wishes` noto'g'ri body bilan 400 qaytaradi.
   - `TelegramBot` UA bilan `/` so'ralganda `<title>` ichida kelin-kuyov ismlari bo'ladi.
3. Ixtiyoriy: Supabase Auth'da leaked password protection'ni yoqish (advisor WARN).

## Qabul qilingan qarorlar
- Hosting: Vercel (statik fayllar + `api/wishes.js`, `api/page.js`), backend: Supabase. Hetzner ishlatilmaydi.
- `rate_limits` jadvalida RLS policy yo'q, bu ataylab qilingan: unga faqat service role (Vercel function) kiradi.
- `SUPABASE_SERVICE_ROLE_KEY` faqat Vercel env'da turadi, kodga yozilmaydi.
