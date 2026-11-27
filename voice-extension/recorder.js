let mr, ch = [], st, t0, iv;
go.onclick = async () => {
  try { st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); } catch (e) { m.textContent = '⚠ لم يُسمح بالميكروفون'; return; }
  ch = []; mr = new MediaRecorder(st); mr.ondataavailable = e => e.data.size && ch.push(e.data);
  mr.onstop = async () => { st.getTracks().forEach(t => t.stop()); clearInterval(iv); const { wav, dur } = await blobToWav(new Blob(ch)); await putRef(wav); m.textContent = '✅ تم التسجيل (' + dur.toFixed(1) + ' ث). افتح نافذة الإضافة وأرسله.'; go.disabled = false; end.disabled = true; };
  mr.start(); t0 = Date.now(); go.disabled = true; end.disabled = false; iv = setInterval(() => { const s = (Date.now() - t0) / 1000; m.textContent = '⏺ ' + s.toFixed(0) + ' ث'; if (s > 30) end.click(); }, 500);
};
end.onclick = () => mr && mr.state !== 'inactive' && mr.stop();
