/* ============================================================
   JASMINE TAKLIFNOMA v3 — ikki til (uz / ru)

   Til havoladan olinadi:  index.html?lang=ru
   Havolada bo'lmasa — admin tanlagan default (data.lang), u ham
   bo'lmasa DEFAULT_LANG.

   Yangi interfeys matni qo'shsangiz: HTML'ga data-t="kalit" yozing
   va UI.uz / UI.ru ikkalasiga ham qiymat qo'shing.
   scripts/verify.js buni tekshiradi.
   ============================================================ */

const LANGS = ['uz', 'ru'];
const DEFAULT_LANG = 'uz';

const UI = {
  uz: {
    /* konvert */
    openBtn: 'Taklifnomani ochish',

    /* kirish */
    timeLabel: 'Vaqt',
    regardsLabel: 'Hurmat bilan',

    /* hikoya */
    storyEyebrow: 'Bizning hikoyamiz',
    storyTitle: 'Bizning hikoyamiz',

    /* sana */
    dateEyebrow: 'Muhim sana',
    dateTitle: 'Sanamizni eslab qoling',
    addCalendar: "Kalendariga qo'shish",
    countdownCaption: 'Eng baxtli kungacha',
    cdDays: 'Kun',
    cdHours: 'Soat',
    cdMinutes: 'Daqiqa',
    cdSeconds: 'Soniya',

    /* manzil */
    venueEyebrow: 'Qayerda',
    venueTitle: "To'y manzili",
    mapLink: "Xaritada ko'rish",
    mapTitle: "To'y manzili xaritada",

    /* dastur */
    scheduleEyebrow: 'Kun tartibi',
    scheduleTitle: "To'y dasturi",

    /* tilaklar */
    wishesEyebrow: 'Xotira kitobi',
    wishesTitle: 'Mehmonlar tilaklari',
    wishNameLabel: 'Ismingiz',
    wishNamePh: 'Ism',
    wishTextLabel: 'Tilagingiz',
    wishTextPh: 'Kelin-kuyovga tilagingiz...',
    wishSubmit: 'Tilak yuborish',
    wishMagic: 'Tayyor tilak',
    wishEmpty: 'Ism va tilak matnini to’ldiring.',
    wishThanks: 'Rahmat! Tilagingiz qo’shildi.',
    wishFailed: 'Tilakni yuborib bo’lmadi. Birozdan keyin qayta urinib ko’ring.',

    /* to'yona */
    giftEyebrow: "E'tibor uchun",
    giftBoxHint: 'Ochish uchun bosing',
    copyCard: 'Raqamdan nusxa olish',
    payLink: "To'lov havolasi",
    copyOk: 'Karta raqami nusxalandi.',
    copyFail: 'Nusxa olinmadi — qo’lda ko’chiring.',

    /* kontakt */
    contactEyebrow: "Bog'lanish uchun",
    contactTitle: "Bog'lanish uchun",
    contactLede: "Savollaringiz bo'lsa, bemalol murojaat qiling.",
    contactPhone: 'Telefon',
    contactTelegram: 'Telegram',
    contactInstagram: 'Instagram',

    /* lightbox va boshqa */
    lightboxLabel: 'Surat',
    lightboxClose: 'Yopish',
    galleryAlt: "To'y surati",
    weddingDayLabel: "To'y kuni",
    docTitle: 'Taklifnoma',
    ogSuffix: 'Taklifnoma',
    musicOn: "Musiqani o'chirish",
    musicOff: 'Musiqani yoqish'
  },

  ru: {
    /* konvert */
    openBtn: 'Открыть приглашение',

    /* kirish */
    timeLabel: 'Время',
    regardsLabel: 'С уважением',

    /* hikoya */
    storyEyebrow: 'Наша история',
    storyTitle: 'Наша история',

    /* sana */
    dateEyebrow: 'Важная дата',
    dateTitle: 'Запомните нашу дату',
    addCalendar: 'Добавить в календарь',
    countdownCaption: 'До самого счастливого дня',
    cdDays: 'Дней',
    cdHours: 'Часов',
    cdMinutes: 'Минут',
    cdSeconds: 'Секунд',

    /* manzil */
    venueEyebrow: 'Где',
    venueTitle: 'Место торжества',
    mapLink: 'Посмотреть на карте',
    mapTitle: 'Место торжества на карте',

    /* dastur */
    scheduleEyebrow: 'Распорядок дня',
    scheduleTitle: 'Программа торжества',

    /* tilaklar */
    wishesEyebrow: 'Книга пожеланий',
    wishesTitle: 'Пожелания гостей',
    wishNameLabel: 'Ваше имя',
    wishNamePh: 'Имя',
    wishTextLabel: 'Ваше пожелание',
    wishTextPh: 'Пожелание молодожёнам...',
    wishSubmit: 'Отправить пожелание',
    wishMagic: 'Готовое пожелание',
    wishEmpty: 'Заполните имя и текст пожелания.',
    wishThanks: 'Спасибо! Ваше пожелание добавлено.',
    wishFailed: 'Не удалось отправить пожелание. Попробуйте чуть позже.',

    /* to'yona */
    giftEyebrow: 'Обратите внимание',
    giftBoxHint: 'Нажмите, чтобы открыть',
    copyCard: 'Скопировать номер',
    payLink: 'Ссылка для оплаты',
    copyOk: 'Номер карты скопирован.',
    copyFail: 'Не удалось скопировать — перепишите вручную.',

    /* kontakt */
    contactEyebrow: 'Для связи',
    contactTitle: 'Для связи',
    contactLede: 'Если есть вопросы — обращайтесь, будем рады.',
    contactPhone: 'Телефон',
    contactTelegram: 'Telegram',
    contactInstagram: 'Instagram',

    /* lightbox va boshqa */
    lightboxLabel: 'Фото',
    lightboxClose: 'Закрыть',
    galleryAlt: 'Свадебное фото',
    weddingDayLabel: 'День свадьбы',
    docTitle: 'Приглашение',
    ogSuffix: 'Приглашение',
    musicOn: 'Выключить музыку',
    musicOff: 'Включить музыку'
  }
};

/* Kalendar uchun oy va hafta nomlari */
const I18N_MONTHS = {
  uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
       'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
};

const I18N_DOW = {
  uz: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
};

/* Yandex xarita widget tili */
const I18N_MAP_LOCALE = { uz: 'uz_UZ', ru: 'ru_RU' };

/* "Tayyor tilak" tugmasi uchun namunalar */
const MAGIC_WISHES_I18N = {
  uz: [
    "Baxtingiz abadiy, oilangiz doimo mehr va quvonchga to'la bo'lsin!",
    "Nikoh to'yingiz muborak! Bir umr ahil va baxtli yashanglar.",
    "Yangi hayotingiz sevgi, hurmat va unutilmas lahzalarga boy bo'lsin!",
    "Ikki qalb, bir orzu — to'ylaringiz muborak bo'lsin!",
    "Alloh oilangizga tinchlik, baraka va cheksiz baxt ato etsin!"
  ],
  ru: [
    'Пусть ваше счастье будет вечным, а дом всегда полон любви и радости!',
    'Поздравляем со свадьбой! Живите долго, дружно и счастливо.',
    'Пусть новая жизнь будет полна любви, уважения и незабываемых мгновений!',
    'Два сердца, одна мечта — поздравляем вас со свадьбой!',
    'Пусть в вашей семье всегда будут мир, достаток и бесконечное счастье!'
  ]
};

/* Havoladagi ?lang=... ustun; bo'lmasa fallback (admin default). */
function detectLang(fallback) {
  let param = null;
  try {
    param = new URLSearchParams(location.search).get('lang');
  } catch (e) {
    console.warn('i18n: URL o\'qib bo\'lmadi', e);
  }
  if (param && LANGS.indexOf(param) !== -1) return param;
  if (fallback && LANGS.indexOf(fallback) !== -1) return fallback;
  return DEFAULT_LANG;
}

function t(key, lang) {
  const dict = UI[lang] || UI[DEFAULT_LANG];
  if (dict[key] !== undefined) return dict[key];
  if (UI[DEFAULT_LANG][key] !== undefined) return UI[DEFAULT_LANG][key];
  console.warn('i18n: kalit topilmadi —', key);
  return key;
}

/* data-t / data-t-ph / data-t-aria / data-t-title atributlarini to'ldiradi */
function applyUiStrings(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-t]').forEach(node => {
    node.textContent = t(node.getAttribute('data-t'), lang);
  });
  document.querySelectorAll('[data-t-ph]').forEach(node => {
    node.placeholder = t(node.getAttribute('data-t-ph'), lang);
  });
  document.querySelectorAll('[data-t-aria]').forEach(node => {
    node.setAttribute('aria-label', t(node.getAttribute('data-t-aria'), lang));
  });
  document.querySelectorAll('[data-t-title]').forEach(node => {
    node.setAttribute('title', t(node.getAttribute('data-t-title'), lang));
  });
}
