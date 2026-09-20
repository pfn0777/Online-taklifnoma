const test = require('node:test');
const assert = require('node:assert/strict');
const { buildOg, applyOg, pickLang } = require('../api/_lib/og');

const HTML = '<title>x</title><meta name="description" content="d">'
  + '<meta property="og:title" content="old" id="ogTitle">'
  + '<meta property="og:description" content="old">'
  + '<meta property="og:image" content="old.jpg">'
  + '<meta property="og:image:alt" content="old">';
const DATA = {
  groom: 'Ali', bride: 'Vali <b>', introText: 'Hi', venuePhoto: 'v.jpg', venueName: 'Hall',
  ru: { groom: 'Али', bride: 'Вали' }
};

test('applies uz names and escapes html', () => {
  const out = applyOg(HTML, buildOg(DATA, 'uz'));
  assert.match(out, /content="Ali &amp; Vali &lt;b&gt; — Taklifnoma"/);
  assert.match(out, /og:image" content="v.jpg"/);
});

test('uses ru names when lang is ru', () => {
  assert.match(applyOg(HTML, buildOg(DATA, 'ru')), /Али &amp; Вали — Приглашение/);
});

test('unknown lang falls back to uz', () => {
  assert.equal(pickLang('en'), 'uz');
});
