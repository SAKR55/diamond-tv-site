const $ = s => document.querySelector(s);
const st = t => $('#st').textContent = t;
let tick = null;
function refresh(has) { $('#site').disabled = !has; $('#local').disabled = !has; }
async function poll() {
  const s = await chrome.runtime.sendMessage({ type: 'statusTab' });
  $('#stop').disabled = !s.recording; $('#tab').disabled = s.recording;
  if (s.recording) st('⏺ ' + s.elapsed.toFixed(0) + ' ث — كلام: ' + (s.speech || 0).toFixed(0) + '/20 ث'); else if (tick) { clearInterval(tick); tick = null; }
  const h = await chrome.runtime.sendMessage({ type: 'hasRef' }); refresh(h.has);
  if (!s.recording && h.has && !$('#st').textContent.startsWith('✅') && !$('#st').textContent.startsWith('⚠')) st('يوجد تسجيل جاهز للإرسال.');
}
$('#tab').onclick = async () => {
  if (!$('#ok').checked) return st('⚠ أكّد أولًا أن الصوت صوتك أو لديك إذنه.');
  const r = await chrome.runtime.sendMessage({ type: 'startTab', smart: $('#smart').checked });
  if (!r || !r.ok) return st('⚠ ' + ((r && r.err) || 'تعذّر بدء التسجيل'));
  st('⏺ يسجّل…'); tick = setInterval(poll, 700); poll();
};
$('#stop').onclick = async () => { await chrome.runtime.sendMessage({ type: 'stopTab' }); st('جارٍ تجهيز التسجيل…'); setTimeout(poll, 1500); };
$('#mic').onclick = () => { if (!$('#ok').checked) return st('⚠ أكّد أولًا أن الصوت صوتك أو لديك إذنه.'); chrome.tabs.create({ url: chrome.runtime.getURL('recorder.html') }); };
$('#site').onclick = async () => { st('جارٍ الإرسال…'); const r = await chrome.runtime.sendMessage({ type: 'sendSite' }); st(r.ok ? '✅ أُرسل إلى مولّد الموقع' : '⚠ ' + r.err); };
$('#local').onclick = async () => { st('جارٍ الإرسال…'); const r = await chrome.runtime.sendMessage({ type: 'sendLocal' }); st(r.ok ? '✅ أُرسل. في التطبيق اضغط «استخدم المرجع القادم من الإضافة».' : '⚠ ' + (r.err || 'تأكد أن التطبيق المحلي يعمل')); };
chrome.runtime.onMessage.addListener(m => { if (m.type === 'recorded') { st('✅ تم التسجيل: ' + m.dur.toFixed(1) + ' ث'); poll(); } if (m.type === 'error') st('⚠ ' + m.err); });
poll();

// ---- الاستنساخ عبر التطبيق المحلي ----
let outUrl = null;
async function engine() {
  const r = await chrome.runtime.sendMessage({ type: 'ping' });
  $('#eng').textContent = r && r.ok ? ((r.remote ? '✅ خادم Colab متصل (' : '✅ التطبيق المحلي متصل (') + r.device + ')') : '⚠ التطبيق المحلي غير متصل — شغّله (run_windows.bat) ثم أعد فتح النافذة.';
  return r && r.ok;
}
async function showOut() {
  const r = await chrome.runtime.sendMessage({ type: 'getOut' });
  if (!r || !r.ok) return;
  const bin = atob(r.b64), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  if (outUrl) URL.revokeObjectURL(outUrl);
  outUrl = URL.createObjectURL(new Blob([u], { type: 'audio/wav' }));
  $('#aud').src = outUrl; $('#aud').hidden = false; $('#dlout').hidden = false;
}
$('#dlout').onclick = () => { const a = document.createElement('a'); a.href = outUrl; a.download = 'cloned-voice.wav'; a.click(); };
let jt = null;
async function jobPoll() {
  const j = await chrome.runtime.sendMessage({ type: 'jobStatus' });
  if (j.busy) { st('⏳ يولّد الصوت… ' + j.elapsed.toFixed(0) + ' ث (قد يطول على المعالج)'); $('#clone').disabled = true; return; }
  clearInterval(jt); jt = null; $('#clone').disabled = false;
  if (j.err) st('⚠ ' + j.err); else if (j.has) { st('✅ تم التوليد'); showOut(); }
}
$('#clone').onclick = async () => {
  if (!$('#ok').checked) return st('⚠ أكّد أولًا أن الصوت صوتك أو لديك إذنه.');
  const text = $('#txt').value.trim(); if (!text) return st('⚠ اكتب النص أولًا.');
  const h = await chrome.runtime.sendMessage({ type: 'hasRef' }); if (!h.has) return st('⚠ سجّل صوتًا مرجعيًا أولًا.');
  if (!(await engine())) return st('⚠ شغّل التطبيق المحلي أولًا.');
  await chrome.runtime.sendMessage({ type: 'cloneTts', text, lang: $('#lang').value, tries: 3 });
  st('⏳ بدأ التوليد…'); jt = setInterval(jobPoll, 1000); jobPoll();
};
engine(); chrome.runtime.sendMessage({ type: 'jobStatus' }).then(j => { if (j.busy) { jt = setInterval(jobPoll, 1000); } else if (j.has) showOut(); });

chrome.storage.local.get('conn').then(({ conn }) => { if (conn && conn.url) $('#conn').value = conn.url + '#' + (conn.token || ''); });
$('#saveconn').onclick = async () => {
  const v = $('#conn').value.trim(); const i = v.indexOf('#');
  const url = (i < 0 ? v : v.slice(0, i)).trim(), token = i < 0 ? '' : v.slice(i + 1).trim();
  if (!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com\/?$/i.test(url)) return st('⚠ الرابط يجب أن يكون https://xxxx.trycloudflare.com#الرمز');
  await chrome.runtime.sendMessage({ type: 'setConn', conn: { url, token } }); st('تم الحفظ'); engine();
};
$('#localconn').onclick = async () => { await chrome.runtime.sendMessage({ type: 'setConn', conn: {} }); $('#conn').value = ''; st('يعمل الآن مع جهازك'); engine(); };
