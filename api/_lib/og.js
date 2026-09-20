const OG_SUFFIX = { uz: 'Taklifnoma', ru: 'Приглашение' };
const DEFAULT_LANG = 'uz';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pickLang(value) {
  return value === 'ru' ? 'ru' : DEFAULT_LANG;
}

function field(data, key, lang) {
  if (lang === 'ru' && data.ru && data.ru[key]) return data.ru[key];
  return data[key];
}

function buildOg(data, lang) {
  const couple = field(data, 'groom', lang) + ' & ' + field(data, 'bride', lang);
  return {
    title: couple + ' — ' + OG_SUFFIX[lang],
    description: field(data, 'introText', lang) || '',
    image: data.ogImage || data.venuePhoto || '',
    imageAlt: field(data, 'venueName', lang) || ''
  };
}

function setMetaContent(html, property, value) {
  const tag = new RegExp('(<meta property="' + property + '" content=")[^"]*(")');
  return html.replace(tag, (m, a, b) => a + escapeHtml(value) + b);
}

function applyOg(html, og) {
  let out = html.replace(/<title>[^<]*<\/title>/, '<title>' + escapeHtml(og.title) + '</title>');
  out = out.replace(/(<meta name="description" content=")[^"]*(")/, (m, a, b) => a + escapeHtml(og.description) + b);
  out = setMetaContent(out, 'og:title', og.title);
  out = setMetaContent(out, 'og:description', og.description);
  if (og.image) out = setMetaContent(out, 'og:image', og.image);
  out = setMetaContent(out, 'og:image:alt', og.imageAlt);
  return out;
}

module.exports = { escapeHtml, pickLang, buildOg, applyOg };
