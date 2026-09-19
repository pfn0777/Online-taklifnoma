/* ============================================================
   Brauzer tekshiruvi — Chrome DevTools Protocol orqali.
   Playwright kerak emas, Node'ning o'zidagi WebSocket ishlatiladi.

   Ishlatish:
     node scripts/shot.js <fayl.html> <kenglik> <chiqish.png>

   Chiqishda gorizontal overflow va konsol xatolari ham yoziladi.
   ============================================================ */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = path.join(os.homedir(),
  'AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe');
const PORT = 9333;

const [, , fileArg, widthArg, outArg] = process.argv;
const file = path.resolve(fileArg || 'index.html');
const width = parseInt(widthArg || '430', 10);
const out = outArg || 'shot.png';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function connect() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:' + PORT + '/json/list');
      const tabs = await res.json();
      const page = tabs.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) { /* hali ko'tarilmadi */ }
    await sleep(250);
  }
  throw new Error('Chrome debug portiga ulanib bo’lmadi');
}

function client(ws) {
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    } else if (msg.method) {
      events.push(msg);
    }
  });
  return {
    events,
    send(method, params) {
      const msgId = ++id;
      return new Promise((resolve, reject) => {
        pending.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
      });
    }
  };
}

(async () => {
  const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-'));
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + userDir,
    'about:blank'
  ], { stdio: 'ignore' });

  try {
    const wsUrl = await connect();
    const ws = new WebSocket(wsUrl);
    await new Promise(r => ws.addEventListener('open', r));
    const cdp = client(ws);

    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await cdp.send('Log.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width, height: 900, deviceScaleFactor: 1, mobile: true
    });

    await cdp.send('Page.navigate', { url: 'file:///' + file.replace(/\\/g, '/') });
    await sleep(2500);

    // Konvertni ochish
    await cdp.send('Runtime.evaluate', {
      expression: 'document.getElementById("openInvite") && document.getElementById("openInvite").click()'
    });
    await sleep(1500);

    // O'lchovlar
    const probe = await cdp.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const de = document.documentElement;
        const over = [];
        document.querySelectorAll('body *').forEach(n => {
          const r = n.getBoundingClientRect();
          if (r.width > 0 && (r.right > de.clientWidth + 1 || r.left < -1)) {
            over.push(n.tagName.toLowerCase() + (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\\s+/).join('.') : '')
              + ' [' + Math.round(r.left) + '..' + Math.round(r.right) + ']');
          }
        });
        return {
          viewport: de.clientWidth,
          scrollWidth: de.scrollWidth,
          scrollHeight: de.scrollHeight,
          theme: document.body.dataset.theme,
          overflow: over.slice(0, 12)
        };
      })()`
    });
    const info = probe.result.value;

    console.log('tema:        ' + info.theme);
    console.log('viewport:    ' + info.viewport + 'px');
    console.log('scrollWidth: ' + info.scrollWidth + 'px'
      + (info.scrollWidth > info.viewport ? '  <-- GORIZONTAL OVERFLOW' : '  (ok)'));
    console.log('balandlik:   ' + info.scrollHeight + 'px');
    if (info.overflow.length) {
      console.log('chetga chiqqan elementlar:');
      info.overflow.forEach(o => console.log('  ' + o));
    }

    // Ixtiyoriy tekshiruv: PROBE muhit o'zgaruvchisidagi selektorlar uchun
    // hisoblangan font-family / rang qiymatlari
    if (process.env.PROBE) {
      const res = await cdp.send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(${JSON.stringify(process.env.PROBE.split('|'))}).map(sel => {
          const n = document.querySelector(sel);
          if (!n) return sel + ' -> TOPILMADI';
          const c = getComputedStyle(n);
          return sel + ' -> ' + c.fontFamily + ' / ' + c.fontSize + ' / ' + c.textTransform;
        })`
      });
      console.log('probe:');
      res.result.value.forEach(l => console.log('  ' + l));
    }

    const errors = cdp.events.filter(e => e.method === 'Log.entryAdded'
      && e.params.entry.level === 'error');
    console.log('konsol xatolari: ' + (errors.length || 'yo’q'));
    errors.slice(0, 5).forEach(e => console.log('  ' + e.params.entry.text));

    // Sahifani ekran balandligidagi bo'laklarga bo'lib suratga olamiz —
    // 6000px+ bitta rasm o'qishga yaroqsiz bo'lib qoladi.
    const step = 900;
    const count = Math.min(Math.ceil(info.scrollHeight / step), 10);
    const base = out.replace(/\.png$/i, '');

    for (let i = 0; i < count; i++) {
      await cdp.send('Runtime.evaluate', { expression: 'window.scrollTo(0,' + (i * step) + ')' });
      await sleep(400);
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const name = base + '-' + String(i + 1).padStart(2, '0') + '.png';
      fs.writeFileSync(name, Buffer.from(shot.data, 'base64'));
    }
    console.log('saqlandi: ' + count + ' ta bo’lak -> ' + base + '-NN.png');

    ws.close();
  } finally {
    chrome.kill();
  }
})().catch(e => { console.error(e.message); process.exit(1); });
