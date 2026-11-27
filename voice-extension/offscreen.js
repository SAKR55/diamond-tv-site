// نافذة مخفية تسجّل صوت التبويب. تعيد تشغيل الصوت للمستخدم كي لا يُكتم التبويب أثناء التسجيل.
let smart = true, speech = 0, vad = null, rec = null, chunks = [], ctx = null, timer = null, t0 = 0, stream = null;
chrome.runtime.onMessage.addListener((m, _s, reply) => {
  if (m.target !== 'offscreen') return;
  if (m.type === 'start') { start(m.streamId, m.maxSec || 60, m.smart !== false).then(() => reply({ ok: true }), e => reply({ ok: false, err: String(e) })); return true; }
  if (m.type === 'stop') { stop(); reply({ ok: true }); }
  if (m.type === 'status') reply({ recording: !!rec, elapsed: rec ? (Date.now() - t0) / 1000 : 0, speech });
});
async function start(streamId, maxSec, sm) {
  smart = sm; speech = 0;
  if (rec) throw new Error('التسجيل يعمل بالفعل');
  stream = await navigator.mediaDevices.getUserMedia({ audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } }, video: false });
  ctx = new AudioContext();
  const srcNode = ctx.createMediaStreamSource(stream);
  srcNode.connect(ctx.destination);
  const an = ctx.createAnalyser(); an.fftSize = 2048; srcNode.connect(an);
  const buf = new Float32Array(an.fftSize); let floor = 0.02;
  vad = setInterval(() => { an.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; const r = Math.sqrt(s / buf.length); floor = Math.min(floor * 1.02 + 1e-5, Math.max(r, 1e-4)); if (r > Math.max(0.012, floor * 3)) { speech += 0.1; if (smart && speech >= 20) stop(); } }, 100);
  chunks = [];
  rec = new MediaRecorder(stream);
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  rec.onstop = async () => {
    clearTimeout(timer); clearInterval(vad);
    stream.getTracks().forEach(t => t.stop());
    try { ctx.close(); } catch (e) {}
    rec = null;
    try {
      const { wav, dur } = await blobToWav(new Blob(chunks), smart);
      await putRef(wav);
      chrome.runtime.sendMessage({ type: 'recorded', dur });
    } catch (e) { chrome.runtime.sendMessage({ type: 'error', err: 'تعذّر تجهيز التسجيل: ' + e }); }
  };
  rec.start(); t0 = Date.now();
  timer = setTimeout(stop, maxSec * 1000);
}
function stop() { if (rec && rec.state !== 'inactive') rec.stop(); }
