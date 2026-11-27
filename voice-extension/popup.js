const $ = s => document.querySelector(s);
const st = t => $('#st').textContent = t;
let tick = null;
function refresh(has) { $('#site').disabled = !has; $('#local').disabled = !has; }
async function poll() {
  const s = await chrome.runtime.sendMessage({ type: 'statusTab' });
  $('#stop').disabled = !s.recording; $('#tab').disabled = s.recording;
  if (s.recording) st('⏺ يسجّل… ' + s.elapsed.toFixed(0) + ' ث'); else if (tick) { clearInterval(tick); tick = null; }
  const h = await chrome.runtime.sendMessage({ type: 'hasRef' }); refresh(h.has);
  if (!s.recording && h.has && !$('#st').textContent.startsWith('✅') && !$('#st').textContent.startsWith('⚠')) st('يوجد تسجيل جاهز للإرسال.');
}
$('#tab').onclick = async () => {
  if (!$('#ok').checked) return st('⚠ أكّد أولًا أن الصوت صوتك أو لديك إذنه.');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return st('⚠ لا يوجد تبويب نشط.');
  try {
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
    const r = await chrome.runtime.sendMessage({ type: 'startTab', streamId, maxSec: 30 });
    if (!r || !r.ok) return st('⚠ ' + ((r && r.err) || 'تعذّر بدء التسجيل'));
    st('⏺ يسجّل…'); tick = setInterval(poll, 800); poll();
  } catch (e) { st('⚠ ' + e.message); }
};
$('#stop').onclick = async () => { await chrome.runtime.sendMessage({ type: 'stopTab' }); st('جارٍ تجهيز التسجيل…'); setTimeout(poll, 1500); };
$('#mic').onclick = () => { if (!$('#ok').checked) return st('⚠ أكّد أولًا أن الصوت صوتك أو لديك إذنه.'); chrome.tabs.create({ url: chrome.runtime.getURL('recorder.html') }); };
$('#site').onclick = async () => { st('جارٍ الإرسال…'); const r = await chrome.runtime.sendMessage({ type: 'sendSite' }); st(r.ok ? '✅ أُرسل إلى مولّد الموقع' : '⚠ ' + r.err); };
$('#local').onclick = async () => { st('جارٍ الإرسال…'); const r = await chrome.runtime.sendMessage({ type: 'sendLocal' }); st(r.ok ? '✅ أُرسل. في التطبيق اضغط «استخدم المرجع القادم من الإضافة».' : '⚠ ' + (r.err || 'تأكد أن التطبيق المحلي يعمل')); };
chrome.runtime.onMessage.addListener(m => { if (m.type === 'recorded') { st('✅ تم التسجيل: ' + m.dur.toFixed(1) + ' ث'); poll(); } if (m.type === 'error') st('⚠ ' + m.err); });
poll();
