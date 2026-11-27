// نافذة مخفية تسجّل صوت التبويب. تعيد تشغيل الصوت للمستخدم كي لا يُكتم التبويب أثناء التسجيل.
let rec = null, chunks = [], ctx = null, timer = null, t0 = 0, stream = null;
chrome.runtime.onMessage.addListener((m, _s, reply) => {
  if (m.target !== 'offscreen') return;
  if (m.type === 'start') { start(m.streamId, m.maxSec || 30).then(() => reply({ ok: true }), e => reply({ ok: false, err: String(e) })); return true; }
  if (m.type === 'stop') { stop(); reply({ ok: true }); }
  if (m.type === 'status') reply({ recording: !!rec, elapsed: rec ? (Date.now() - t0) / 1000 : 0 });
});
async function start(streamId, maxSec) {
  if (rec) throw new Error('التسجيل يعمل بالفعل');
  stream = await navigator.mediaDevices.getUserMedia({ audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } }, video: false });
  ctx = new AudioContext();
  ctx.createMediaStreamSource(stream).connect(ctx.destination);
  chunks = [];
  rec = new MediaRecorder(stream);
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  rec.onstop = async () => {
    clearTimeout(timer);
    stream.getTracks().forEach(t => t.stop());
    try { ctx.close(); } catch (e) {}
    rec = null;
    try {
      const { wav, dur } = await blobToWav(new Blob(chunks));
      await putRef(wav);
      chrome.runtime.sendMessage({ type: 'recorded', dur });
    } catch (e) { chrome.runtime.sendMessage({ type: 'error', err: 'تعذّر تجهيز التسجيل: ' + e }); }
  };
  rec.start(); t0 = Date.now();
  timer = setTimeout(stop, maxSec * 1000);
}
function stop() { if (rec && rec.state !== 'inactive') rec.stop(); }
