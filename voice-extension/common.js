// أدوات مشتركة: تخزين المرجع في IndexedDB (مشترك بين النافذة المخفية وشاشة التسجيل والخلفية) وتحويل WAV
function idb() {
  return new Promise((ok, no) => {
    const r = indexedDB.open('dhv', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('k');
    r.onsuccess = () => ok(r.result);
    r.onerror = () => no(r.error);
  });
}
async function putRef(buf) {
  const d = await idb();
  return new Promise((ok, no) => { const t = d.transaction('k', 'readwrite'); t.objectStore('k').put(buf, 'ref'); t.oncomplete = ok; t.onerror = () => no(t.error); });
}
async function getRef() {
  const d = await idb();
  return new Promise((ok, no) => { const q = d.transaction('k').objectStore('k').get('ref'); q.onsuccess = () => ok(q.result || null); q.onerror = () => no(q.error); });
}
function toWav(samples, sr) {
  const n = samples.length, b = new ArrayBuffer(44 + n * 2), v = new DataView(b);
  const s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); s(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, n * 2, true);
  let o = 44;
  for (let i = 0; i < n; i++) { const x = Math.max(-1, Math.min(1, samples[i])); v.setInt16(o, x < 0 ? x * 32768 : x * 32767, true); o += 2; }
  return b;
}

// يحذف فترات الصمت الطويلة (يبقي 0.15 ث) ويقتصر على أول maxSec ثانية من الكلام الفعلي
function trimSilence(d, sr, maxSec) {
  const fr = Math.round(sr * 0.03), n = Math.floor(d.length / fr);
  if (n < 5) return d;
  const e = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < fr; j++) { const v = d[i * fr + j]; s += v * v; } e[i] = Math.sqrt(s / fr); }
  const sorted = Array.from(e).sort((a, b) => a - b);
  const floor = sorted[Math.floor(n * 0.1)], thr = Math.max(0.012, floor * 3, sorted[n - 1] * 0.04);
  const keepPad = Math.round(0.15 / 0.03), maxGap = Math.round(0.5 / 0.03);
  const keep = new Uint8Array(n);
  let last = -1e9;
  for (let i = 0; i < n; i++) if (e[i] > thr) { for (let k = Math.max(0, i - keepPad); k <= i; k++) keep[k] = 1; last = i; } else if (i - last <= maxGap) keep[i] = 1;
  const out = [];
  let total = 0, speech = 0;
  for (let i = 0; i < n && speech < maxSec; i++) if (keep[i]) { for (let j = 0; j < fr; j++) out.push(d[i * fr + j]); total += fr; if (e[i] > thr) speech += 0.03; }
  return out.length > sr ? Float32Array.from(out) : d;
}
// يفك تسجيل المتصفح (webm/opus) إلى WAV أحادي 24 كيلوهرتز مع تطبيع المستوى
async function blobToWav(blob, smart) {
  const ac = new AudioContext();
  const buf = await ac.decodeAudioData(await blob.arrayBuffer());
  await ac.close();
  const SR = 24000, len = Math.ceil(buf.duration * SR);
  const oc = new OfflineAudioContext(1, len, SR);
  const src = oc.createBufferSource(); src.buffer = buf; src.connect(oc.destination); src.start();
  const r = await oc.startRendering();
  let d = r.getChannelData(0).slice();
  if (smart) d = trimSilence(d, SR, 20);
  let pk = 0; for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i]));
  if (pk > 1e-4) { const g = 0.9 / pk; for (let i = 0; i < d.length; i++) d[i] *= g; }
  return { wav: toWav(d, SR), dur: d.length / SR };
}
function b64(buf) { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
