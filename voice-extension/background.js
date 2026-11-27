importScripts('common.js');
const SITE = 'https://diamond-tv.shop/studio/voice/#ext';
const LOCAL = 'http://127.0.0.1:7861/ref';
const BASE = 'http://127.0.0.1:7861';
let job = { busy: false, err: '', has: false, t0: 0 };
const BAD = /^(chrome|edge|about|chrome-extension|devtools|view-source):|^https:\/\/(chrome|chromewebstore)\.google\.com\/webstore|^https:\/\/microsoftedge\.microsoft\.com\/addons/;
async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['USER_MEDIA'], justification: 'تسجيل صوت التبويب كصوت مرجعي' });
}
async function status() {
  if (!(await chrome.offscreen.hasDocument())) return { recording: false, elapsed: 0, speech: 0 };
  try { return await chrome.runtime.sendMessage({ target: 'offscreen', type: 'status' }); } catch (e) { return { recording: false, elapsed: 0, speech: 0 }; }
}
async function beginCapture(tab, smart) {
  if (!tab || !tab.id) return { ok: false, err: 'لا يوجد تبويب نشط.' };
  if (!tab.url || BAD.test(tab.url)) return { ok: false, err: 'Chrome يمنع التقاط الصوت من هذه الصفحة (صفحات المتصفح الداخلية والمتجر). افتح موقعًا عاديًا.' };
  try {
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
    await ensureOffscreen();
    const r = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'start', streamId, maxSec: 60, smart });
    if (r && r.ok) { chrome.action.setBadgeBackgroundColor({ color: '#dc2626' }); chrome.action.setBadgeText({ text: 'REC' }); }
    return r || { ok: false, err: 'لم تستجب نافذة التسجيل' };
  } catch (e) {
    const t = String(e && e.message || e);
    return { ok: false, err: /Cannot capture|activeTab|invoked/i.test(t) ? 'تعذّر الالتقاط: اضغط أيقونة الإضافة أو الاختصار على هذا التبويب مباشرة. (المواقع المحمية بحقوق النشر قد تمنع التقاط صوتها).' : t };
  }
}
async function toggle(tab) {
  const s = await status();
  if (s.recording) { await chrome.runtime.sendMessage({ target: 'offscreen', type: 'stop' }); return { ok: true, stopped: true }; }
  return beginCapture(tab, true);
}
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'dh-capture', title: 'DIAMOND: التقط صوت هذه الصفحة كمرجع (ابدأ/أوقف)', contexts: ['page', 'video', 'audio', 'frame', 'selection'] });
});
chrome.contextMenus.onClicked.addListener((info, tab) => { if (info.menuItemId === 'dh-capture') toggle(tab); });
chrome.commands.onCommand.addListener(async (cmd, tab) => {
  if (cmd !== 'toggle-capture') return;
  if (!tab) [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  toggle(tab);
});
chrome.runtime.onMessage.addListener((m, _s, reply) => {
  if (m.target === 'offscreen') return;
  if (m.type === 'recorded') { chrome.action.setBadgeBackgroundColor({ color: '#16a34a' }); chrome.action.setBadgeText({ text: '✓' }); return; }
  if (m.type === 'error') { chrome.action.setBadgeBackgroundColor({ color: '#d97706' }); chrome.action.setBadgeText({ text: '!' }); return; }
  (async () => {
    try {
      if (m.type === 'startTab') {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        reply(await beginCapture(tab, m.smart !== false));
      } else if (m.type === 'stopTab') {
        await chrome.runtime.sendMessage({ target: 'offscreen', type: 'stop' }); reply({ ok: true });
      } else if (m.type === 'statusTab') {
        reply(await status());
      } else if (m.type === 'hasRef') {
        const r = await getRef(); reply({ has: !!r, bytes: r ? r.byteLength : 0 });
      } else if (m.type === 'sendLocal') {
        const r = await getRef(); if (!r) return reply({ ok: false, err: 'لا يوجد تسجيل' });
        const res = await fetch(LOCAL, { method: 'POST', headers: { 'X-DH-Ext': '1', 'Content-Type': 'audio/wav' }, body: r });
        reply({ ok: res.ok, err: res.ok ? '' : 'رفض التطبيق المحلي: ' + res.status });
      } else if (m.type === 'ping') {
        try { const r = await fetch(BASE + '/ping', { headers: { 'X-DH-Ext': '1' } }); const j = await r.json(); reply({ ok: true, device: j.device, hasRef: j.hasRef }); }
        catch (e) { reply({ ok: false }); }
      } else if (m.type === 'cloneTts') {
        if (job.busy) return reply({ ok: false, err: 'مهمة قيد التنفيذ' });
        job = { busy: true, err: '', has: false, t0: Date.now() };
        reply({ ok: true });
        try {
          const r = await getRef();
          if (r) await fetch(BASE + '/ref', { method: 'POST', headers: { 'X-DH-Ext': '1' }, body: r });
          const res = await fetch(BASE + '/tts', { method: 'POST', headers: { 'X-DH-Ext': '1', 'Content-Type': 'application/json' }, body: JSON.stringify({ text: m.text, lang: m.lang || 'ar', tries: m.tries || 3 }) });
          if (!res.ok) throw new Error(await res.text() || ('HTTP ' + res.status));
          await putKey('out', await res.arrayBuffer());
          job.has = true; chrome.action.setBadgeBackgroundColor({ color: '#16a34a' }); chrome.action.setBadgeText({ text: '✓' });
        } catch (e) { job.err = String(e.message || e); chrome.action.setBadgeBackgroundColor({ color: '#d97706' }); chrome.action.setBadgeText({ text: '!' }); }
        job.busy = false;
      } else if (m.type === 'jobStatus') {
        reply({ busy: job.busy, err: job.err, has: job.has || !!(await getKey('out')), elapsed: job.busy ? (Date.now() - job.t0) / 1000 : 0 });
      } else if (m.type === 'getOut') {
        const o = await getKey('out'); reply({ ok: !!o, b64: o ? b64(o) : '' });
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
