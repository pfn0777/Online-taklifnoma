/* ============================================================
   JASMINE TAKLIFNOMA v3 — ma'lumot modeli (default qiymatlar)
   Saqlash/o'qish store.js ichida. Bu fayl faqat MODEL.
   ============================================================ */

/* Mavjud temalar. Yangi tema qo'shish yo'riqnomasi — themes.css boshida. */
/* Akvarel gul assetlari — Stitch'da generatsiya qilingan.
   Manba plitalar: stitch/jasmine-akvarel/, qayta ishlash: scripts/make-assets.py
   Kalit = bo'lim selektori, qiymat = [chap rasm, o'ng rasm]. */
const FLORAL_SET = {
  '.envelope':      ['assets/floral-tl.webp',  'assets/floral-br.webp'],
  '.sheet.intro':   ['assets/spray-left.webp', 'assets/floral-tr.webp'],
  '.sheet.savedate':['assets/floral-bl.webp',  'assets/spray-right.webp'],
  '.sheet.gift':    ['assets/floral-tl.webp',  'assets/floral-tr.webp'],
  'footer':         ['assets/spray-left.webp', 'assets/spray-right.webp']
};

const THEMES = [
  {
    id: 'jasmine-white',
    label: 'Jasmine White',
    themeColor: '#FBF7F2',
    sprig: 'i-sprig',            // bo'lim ajratgichi
    cornerOrnament: 'i-vine',    // burchak novdasi (line-art, ikkinchi qatlam)
    floral: FLORAL_SET           // akvarel gullar
  },
  {
    id: 'green-white',
    label: 'Green White',
    themeColor: '#FFFDFB',
    sprig: 'i-ajratgich-gw',
    cornerOrnament: 'i-gul-tupi-gw',
    floral: FLORAL_SET
  }
];

const DEFAULT_THEME = 'jasmine-white';

function getTheme(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

/* Ikki tilda to'ldiriladigan maydonlar.
   UZ qiymat — DEFAULT_DATA ildizida, RU qiymat — DEFAULT_DATA.ru ichida.
   Yangi matn maydoni qo'shsangiz va u tarjima talab qilsa — shu ro'yxatga qo'shing,
   admin.html ga id="f-ru-<kalit>" maydonini qo'shing (verify.js tekshiradi). */
const TRANSLATABLE = [
  'groom', 'bride', 'family', 'eventType', 'greeting', 'inviteTitle',
  'introText', 'storyText', 'closingText',
  'weekday', 'monthLabel', 'dateLine',
  'venueName', 'venueAddress',
  'giftTitle', 'giftText', 'cardHolder', 'cardBank'
];

const DEFAULT_DATA = {
  // ---- Tema ----
  theme: DEFAULT_THEME,

  // ---- Default til (havolada ?lang=... bo'lmaganda) ----
  lang: DEFAULT_LANG,

  // ---- Juftlik ----
  groom: 'Muhammad',
  bride: 'Xadicha',
  family: 'Abdurahmonovlar oilasi',
  eventType: "NIKOH TO'YI",

  // ---- Konvert (muqova) ----
  greeting: 'Assalomu alaykum, aziz mehmon',
  inviteTitle: 'Taklifnoma',

  // ---- Sana / vaqt ----
  dateISO: '2026-12-16T18:00:00',     // countdown va kalendar shundan hisoblanadi
  weekday: 'CHORSHANBA',
  dayNum: '16',
  monthLabel: 'DEKABR 2026',
  time: '18:00',
  dateLine: "CHORSHANBA • 16 Dekabr 2026 • 18:00",

  // ---- Taklif matni ----
  introText: "Sizni hayotimizdagi eng baxtli kun — to'yimizga taklif qilamiz",
  storyText: "Ikki yurak, bitta yo'l — bizning hikoyamiz mana shunday boshlandi.",
  closingText: 'Abadiy baxtli hayot boshlanishi',

  // ---- Manzil ----
  venueName: "Navro'z To'yxonasi",
  venueAddress: 'Toshkent viloyati, Chirchiq shahri',
  venuePhoto: 'https://images.unsplash.com/photo-1712314947761-a8d718bd8c32?w=900&h=600&fit=crop&auto=format&q=80',
  mapQuery: "Navro'z To'yxonasi, Chirchiq",
  mapProvider: 'yandex',              // 'yandex' | 'google'

  // ---- Bog'lanish ----
  phone: '+998 90 374 74 83',
  telegram: 'chorlove_uz',
  instagram: 'chorlove.uz',

  // ---- Musiqa (default o'chiq; avtoplay majburlanmaydi) ----
  musicUrl: '',

  // ---- Ijtimoiy ulashish (Telegram preview) ----
  ogImage: '',

  // ---- Galereya ----
  gallery: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=700&h=700&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=700&h=700&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=700&h=700&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=700&h=700&fit=crop&auto=format&q=80'
  ],

  // ---- To'y dasturi (icon: SVG sprite kaliti) ----
  schedule: [
    { time: '18:00', label: 'Mehmonlarni kutib olish', labelRu: 'Встреча гостей',        icon: 'guests' },
    { time: '18:30', label: 'Nikoh marosimi',          labelRu: 'Церемония бракосочетания', icon: 'rings' },
    { time: '18:45', label: 'Foto sessiya',            labelRu: 'Фотосессия',            icon: 'camera' },
    { time: '19:00', label: 'Bazm va tantana',         labelRu: 'Банкет и торжество',    icon: 'music' },
    { time: '21:00', label: 'Tort va xayrlashuv',      labelRu: 'Торт и прощание',       icon: 'cake' }
  ],

  // ---- To'yona (sovg'a) ----
  giftTitle: "Sovg'a yuborish",
  giftText: "Sizning duolaringiz — biz uchun eng katta sovg'a. Ammo yurakdan biror narsa taqdim etmoqchi bo'lsangiz, quyidagi quti sizga yo'l ko'rsatadi.",
  cardNumber: '8600 1234 5678 9012',
  cardHolder: 'MUHAMMAD ABDURAHMONOV',
  cardBank: 'Uzcard',
  paymentLink: '',                    // ixtiyoriy Payme / Click havolasi

  // ---- Rus tilidagi variantlar (bo'sh qolsa o'zbekcha matn ishlatiladi) ----
  ru: {
    groom: 'Мухаммад',
    bride: 'Хадича',
    family: 'Семья Абдурахмановых',
    eventType: 'СВАДЕБНОЕ ТОРЖЕСТВО',
    greeting: 'Здравствуйте, дорогой гость',
    inviteTitle: 'Приглашение',
    introText: 'Приглашаем вас на самый счастливый день нашей жизни — нашу свадьбу',
    storyText: 'Два сердца, один путь — так началась наша история.',
    closingText: 'Начало долгой и счастливой жизни',
    weekday: 'СРЕДА',
    monthLabel: 'ДЕКАБРЬ 2026',
    dateLine: 'СРЕДА • 16 декабря 2026 • 18:00',
    venueName: 'Ресторан «Навруз»',
    venueAddress: 'Ташкентская область, город Чирчик',
    giftTitle: 'Подарок молодожёнам',
    giftText: 'Ваши добрые пожелания — самый большой подарок для нас. Но если вы хотите преподнести что-то от души, воспользуйтесь коробочкой ниже.',
    cardHolder: 'MUHAMMAD ABDURAHMONOV',
    cardBank: 'Uzcard'
  },

  // ---- Mehmon tilaklari ----
  wishes: [
    { name: 'Azizbek',  date: '16.09.2026', text: "Baxtingiz abadiy, oilangiz doimo mehr va quvonchga to'la bo'lsin!" },
    { name: 'Madina',   date: '17.09.2026', text: "Nikoh to'yingiz muborak! Bir umr ahil va baxtli yashanglar." },
    { name: 'Shahzoda', date: '18.09.2026', text: "Yangi hayotingiz sevgi, hurmat va unutilmas lahzalarga boy bo'lsin!" }
  ]
};

const EVENT_DURATION_MS = 3 * 60 * 60 * 1000;   // to'y ~3 soat

/* Maydonning tanlangan tildagi qiymati. RU bo'sh bo'lsa — UZ qaytadi. */
function fieldValue(data, key, lang) {
  if (lang === 'ru' && data.ru && data.ru[key]) return data.ru[key];
  return data[key];
}

/* ---- Xarita havolalari ---- */
function mapEmbedUrl(query, provider, lang) {
  const q = encodeURIComponent(query);
  if (provider === 'google') {
    return 'https://maps.google.com/maps?q=' + q + '&z=15&output=embed';
  }
  const locale = I18N_MAP_LOCALE[lang] || I18N_MAP_LOCALE[DEFAULT_LANG];
  return 'https://yandex.uz/map-widget/v1/?text=' + q + '&z=15&lang=' + locale;
}

function mapLinkUrl(query, provider) {
  const q = encodeURIComponent(query);
  if (provider === 'google') {
    return 'https://www.google.com/maps/search/?api=1&query=' + q;
  }
  return 'https://yandex.uz/maps/?text=' + q;
}

function buildCalendarLink(data, lang) {
  const start = new Date(data.dateISO);
  const end = new Date(start.getTime() + EVENT_DURATION_MS);
  const fmt = (dt) => dt.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const v = (key) => fieldValue(data, key, lang);
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(v('groom') + ' & ' + v('bride') + ' — ' + v('eventType'))
    + '&dates=' + fmt(start) + '/' + fmt(end)
    + '&location=' + encodeURIComponent(v('venueName') + ', ' + v('venueAddress'))
    + '&details=' + encodeURIComponent(v('introText'));
}

