importScripts('common.js');
const SITE = 'https://diamond-tv.shop/studio/voice/#ext';
const LOCAL = 'http://127.0.0.1:7861/ref';
async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['USER_MEDIA'], justification: 'تسجيل صوت التبويب كصوت مرجعي' });
}
chrome.runtime.onMessage.addListener((m, _s, reply) => {
  if (m.target === 'offscreen') return;
  (async () => {
    try {
      if (m.type === 'startTab') {
        await ensureOffscreen();
        const r = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'start', streamId: m.streamId, maxSec: m.maxSec });
        reply(r);
      } else if (m.type === 'stopTab') {
        await chrome.runtime.sendMessage({ target: 'offscreen', type: 'stop' }); reply({ ok: true });
      } else if (m.type === 'statusTab') {
        if (!(await chrome.offscreen.hasDocument())) return reply({ recording: false, elapsed: 0 });
        reply(await chrome.runtime.sendMessage({ target: 'offscreen', type: 'status' }));
      } else if (m.type === 'hasRef') {
        const r = await getRef(); reply({ has: !!r, bytes: r ? r.byteLength : 0 });
      } else if (m.type === 'sendLocal') {
        const r = await getRef(); if (!r) return reply({ ok: false, err: 'لا يوجد تسجيل' });
        const res = await fetch(LOCAL, { method: 'POST', headers: { 'X-DH-Ext': '1', 'Content-Type': 'audio/wav' }, body: r });
        reply({ ok: res.ok, err: res.ok ? '' : 'رفض التطبيق المحلي: ' + res.status });
      } else if (m.type === 'sendSite') {
        const r = await getRef(); if (!r) return reply({ ok: false, err: 'لا يوجد تسجيل' });
        const tab = await chrome.tabs.create({ url: SITE });
        await new Promise(ok => { const f = (id, i) => { if (id === tab.id && i.status === 'complete') { chrome.tabs.onUpdated.removeListener(f); ok(); } }; chrome.tabs.onUpdated.addListener(f); });
        const data = b64(r);
        for (let i = 0; i < 12; i++) {
          try { await chrome.tabs.sendMessage(tab.id, { type: 'ref', b64: data }); return reply({ ok: true }); }
          catch (e) { await new Promise(ok => setTimeout(ok, 500)); }
        }
        reply({ ok: false, err: 'لم تستجب صفحة المولّد (تأكد أنها فُتحت)' });
      }
    } catch (e) { reply({ ok: false, err: String(e) }); }
  })();
  return true;
});
