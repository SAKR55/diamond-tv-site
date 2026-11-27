/* إدراج شخص من فيديو في فيديو آخر: عزل الشخص (مفتاح لوني أو قناع ذكي) ثم تركيبه فوق خلفية جديدة مع صوته الأصلي. */
(function () {
  var root = document.getElementById('perf'); if (!root) return;
  function $(s) { return root.querySelector(s); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var AC = window.AudioContext || window.webkitAudioContext;
  function dl(b, n) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = n; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
  function seek(v, t) { return new Promise(function (ok) { if (Math.abs(v.currentTime - t) < 0.001) return ok(); var f = function () { v.removeEventListener('seeked', f); ok(); }; v.addEventListener('seeked', f); v.currentTime = t; }); }
  function pickMime(pref) { var l = pref === 'mp4' ? ['video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'] : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']; for (var i = 0; i < l.length; i++) if (window.MediaRecorder && MediaRecorder.isTypeSupported(l[i])) return l[i]; return ''; }

  var sec = document.createElement('div'); sec.className = 'vc';
  sec.innerHTML = '<h2>⑤ أدخل الشخص نفسه من فيديو في فيديو آخر</h2><p class="hint">هذا هو الإدراج الحرفي: يُعزل الشخص كما هو في تسجيله (شكله وحركته وصوته الأصلي) ويوضع فوق فيديو أو صورة أخرى. لا يعيد توليد الشخص ولا يغيّر حركته. الأفضل تصوير الشخص أمام ستارة خضراء أو زرقاء فيعزله المفتاح اللوني بدقة. بدون ستارة جرّب «قناع ذكي» (يحمّل نموذجًا صغيرًا من الإنترنت أول مرة، وجودته على الحواف متفاوتة). استخدمه لمن لهم إذن بظهورهم.</p>' +
    '<div class="gr"><label class="f">🧍 فيديو الشخص<input type="file" id="q-pf" accept="video/*"></label><label class="f">🏞 الخلفية (فيديو أو صورة)<input type="file" id="q-bf" accept="video/*,image/*"></label><span class="hint" id="q-i"></span></div>' +
    '<div class="gr"><label>العزل <select id="q-md"><option value="key">مفتاح لوني (ستارة خضراء/زرقاء)</option><option value="ai">قناع ذكي بدون ستارة</option></select></label><label>لون الخلفية المراد حذفها <input type="color" id="q-kc" value="#00b140" style="width:44px;height:30px;padding:0"></label><button id="q-auto">🎯 التقط من زوايا الفيديو</button><label><input type="checkbox" id="q-inv"> عكس القناع الذكي</label></div>' +
    '<div class="hint">اضغط على الخلفية في المعاينة أدناه لتأخذ اللون من الصورة مباشرة.</div>' +
    '<div class="two"><div><canvas id="q-pc" width="320" height="180" style="width:100%;cursor:crosshair"></canvas><div class="hint">معاينة الشخص بعد العزل (مربعات = شفاف)</div></div><div><canvas id="q-cv" width="640" height="360" style="width:100%"></canvas><div class="hint">المعاينة النهائية</div></div></div>' +
    '<div class="rw"><span>حساسية الحذف</span><input type="range" id="q-tol" min="2" max="80" value="28"><b id="q-tolv">28</b></div>' +
    '<div class="rw"><span>نعومة الحواف</span><input type="range" id="q-soft" min="1" max="60" value="14"><b id="q-softv">14</b></div>' +
    '<div class="rw"><span>الحجم</span><input type="range" id="q-sc" min="10" max="200" value="80"><b id="q-scv">80%</b></div>' +
    '<div class="rw"><span>الموضع أفقيًا</span><input type="range" id="q-x" min="0" max="100" value="50"><b id="q-xv">50%</b></div>' +
    '<div class="rw"><span>الموضع رأسيًا</span><input type="range" id="q-y" min="0" max="100" value="100"><b id="q-yv">100%</b></div>' +
    '<div class="rw"><span>صوت الشخص</span><input type="range" id="q-pg" min="0" max="2" step="0.05" value="1"><b id="q-pgv">100%</b></div>' +
    '<div class="rw"><span>صوت الخلفية</span><input type="range" id="q-bg" min="0" max="1" step="0.05" value="0.25"><b id="q-bgv">25%</b></div>' +
    '<div class="gr"><label><input type="checkbox" id="q-fl"> اقلب الشخص أفقيًا</label><button id="q-pv">▶ معاينة</button><button id="q-ps">⏹</button><label>الصيغة <select id="q-fm"><option value="webm">WebM</option><option value="mp4">MP4 (إن دعمه المتصفح)</option></select></label><button class="pri" id="q-ex">🚀 صدّر الفيديو</button></div><div class="msg" id="q-m"></div>';
  root.appendChild(sec);

  /* ---- تسجيل تبويب/شاشة كمرجع ---- */
  var RC = { rec: null, st: null, t0: 0, tm: 0, btn: null, target: null, msg: null };
  function recStop() { if (RC.rec && RC.rec.state !== 'inactive') RC.rec.stop(); }
  async function recStart(btn, inputSel, msgEl) {
    if (RC.rec && RC.rec.state !== 'inactive') return recStop();
    if (!root.querySelector('#p-okrec').checked) { msgEl.textContent = 'أكّد أولًا أن الفيديو لك أو لديك إذن استخدامه (المربع أعلاه).'; return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia || !window.MediaRecorder) { msgEl.textContent = 'متصفحك لا يدعم تسجيل الشاشة. استخدم Chrome أو Edge على الكمبيوتر.'; return; }
    try {
      var st = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true }); RC.st = st; var chunks = [], mime = pickMime('webm');
      if (!st.getAudioTracks().length) msgEl.textContent = 'لم يُلتقط صوت: عند الاختيار فعّل «مشاركة صوت التبويب».';
      var rec = new MediaRecorder(st, mime ? { mimeType: mime, videoBitsPerSecond: 8e6 } : { videoBitsPerSecond: 8e6 }); RC.rec = rec;
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      rec.onstop = function () {
        clearInterval(RC.tm); st.getTracks().forEach(function (t) { t.stop(); }); btn.textContent = btn.dataset.t;
        var blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' }); if (!blob.size) { msgEl.textContent = 'لم يُسجَّل شيء.'; return; }
        var f = new File([blob], 'screen-recording.webm', { type: blob.type }), dt = new DataTransfer(); dt.items.add(f); var inp = root.querySelector(inputSel); inp.files = dt.files; inp.dispatchEvent(new Event('change'));
        msgEl.textContent = 'تم التسجيل (' + ((Date.now() - RC.t0) / 1000).toFixed(0) + ' ث) وتحميله في الأداة ✅';
      };
      st.getVideoTracks()[0].addEventListener('ended', recStop);
      RC.t0 = Date.now(); rec.start(500); btn.textContent = '⏹ إيقاف التسجيل (0 ث)'; RC.tm = setInterval(function () { btn.textContent = '⏹ إيقاف التسجيل (' + Math.round((Date.now() - RC.t0) / 1000) + ' ث)'; }, 500);
      msgEl.textContent = 'يسجّل الآن: شغّل الفيديو في التبويب المختار، ثم اضغط إيقاف.';
    } catch (e) { msgEl.textContent = 'أُلغي التسجيل أو رُفض الإذن.'; }
  }
  function addRec(afterInputSel, msgSel) {
    var inp = root.querySelector(afterInputSel), lab = inp.parentNode, b = document.createElement('button'); b.textContent = b.dataset.t = '🔴 سجّل تبويبًا/شاشة'; b.title = 'مثلًا فيديو يوتيوب مفتوح في تبويب';
    b.onclick = function () { recStart(b, afterInputSel, root.querySelector(msgSel)); }; lab.parentNode.insertBefore(b, lab.nextSibling);
  }
  var okl = document.createElement('label'); okl.className = 'ck'; okl.style.cssText = 'display:block;margin:6px 0'; okl.innerHTML = '<input type="checkbox" id="p-okrec"> أؤكد أن الفيديو الذي سأسجّله لي أو لدي إذن باستخدامه (لا تسجّل محتوى لا تملك حقه).';
  var first = root.querySelector('.vc'); first.insertBefore(okl, first.querySelector('.gr'));
  addRec('#p-rf', '#p-m1'); addRec('#q-pf', '#q-m');

  var pv = document.createElement('video'), bv = document.createElement('video'); pv.playsInline = bv.playsInline = true; pv.preload = bv.preload = 'auto'; pv.crossOrigin = bv.crossOrigin = 'anonymous'; bv.loop = true;
  var bimg = null, pf = false, bf = false, busy = false, seg = null, segTried = false, segMask = null, segW = 0, segH = 0, running = false;
  var cv = $('#q-cv'), cx = cv.getContext('2d'), pc = $('#q-pc'), pcx = pc.getContext('2d');
  var off = document.createElement('canvas'), ox = off.getContext('2d', { willReadFrequently: true });
  var P = { ac: null, a: null, b: null, gp: null, gb: null };

  function kc() { var h = $('#q-kc').value; return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function cbcr(r, g, b) { return [-0.168736 * r - 0.331264 * g + 0.5 * b, 0.5 * r - 0.418688 * g - 0.081312 * b]; }
  function fitPerson() { var mh = Math.min(720, pv.videoHeight || 360), w = Math.round((pv.videoWidth || 640) * mh / (pv.videoHeight || 360)); if (off.width !== w || off.height !== mh) { off.width = w; off.height = mh; } }
  function cut() { /* يرسم الإطار الحالي للشخص في off ويحذف الخلفية */
    fitPerson(); ox.drawImage(pv, 0, 0, off.width, off.height);
    var id = ox.getImageData(0, 0, off.width, off.height), d = id.data, n = off.width * off.height;
    if ($('#q-md').value === 'ai' && segMask && segW * segH > 0) {
      var inv = $('#q-inv').checked, sw = segW, sh = segH, W = off.width, H = off.height;
      for (var y = 0; y < H; y++) { var sy = Math.min(sh - 1, Math.floor(y * sh / H)) * sw; for (var x = 0; x < W; x++) { var m = segMask[sy + Math.min(sw - 1, Math.floor(x * sw / W))]; if (inv) m = 1 - m; var a = m < 0.4 ? 0 : m > 0.6 ? 1 : (m - 0.4) / 0.2; d[(y * W + x) * 4 + 3] = Math.round(a * 255); } }
    } else {
      var k = kc(), kcc = cbcr(k[0], k[1], k[2]), tol = +$('#q-tol').value, soft = +$('#q-soft').value, gdom = k[1] > k[0] && k[1] > k[2], bdom = k[2] > k[0] && k[2] > k[1];
      for (var i = 0; i < n; i++) {
        var p = i * 4, r = d[p], g = d[p + 1], b = d[p + 2], c = cbcr(r, g, b), dx = c[0] - kcc[0], dy = c[1] - kcc[1], dist = Math.sqrt(dx * dx + dy * dy), a = dist <= tol ? 0 : dist >= tol + soft ? 1 : (dist - tol) / soft;
        if (a < 1) { a = a * a * (3 - 2 * a); }
        if (a > 0 && a < 1 || (a === 1 && dist < tol + soft * 2)) { if (gdom) { var lim = Math.max(r, b); if (g > lim) d[p + 1] = lim; } else if (bdom) { var lm = Math.max(r, g); if (b > lm) d[p + 2] = lm; } }
        d[p + 3] = Math.round(a * 255);
      }
    }
    ox.putImageData(id, 0, 0);
  }
  function chk(c, w, h) { var s = 12; for (var y = 0; y < h; y += s) for (var x = 0; x < w; x += s) { c.fillStyle = ((x / s + y / s) & 1) ? '#2a2542' : '#1a1630'; c.fillRect(x, y, s, s); } }
  function dims() { var W = 1280, H = 720; if (bv.videoWidth) { W = bv.videoWidth; H = bv.videoHeight; } else if (bimg) { W = bimg.naturalWidth; H = bimg.naturalHeight; } var s = Math.min(1, 1920 / Math.max(W, H)); return { w: Math.round(W * s / 2) * 2, h: Math.round(H * s / 2) * 2 }; }
  function render(target, tx, w, h) {
    tx.fillStyle = '#000'; tx.fillRect(0, 0, w, h);
    if (bv.videoWidth) tx.drawImage(bv, 0, 0, w, h); else if (bimg) tx.drawImage(bimg, 0, 0, w, h);
    if (!pf) return; cut();
    var ph = h * (+$('#q-sc').value / 100), pw = ph * off.width / off.height, px = (w - pw) * ($('#q-x').value / 100), py = (h - ph) * ($('#q-y').value / 100);
    tx.save(); if ($('#q-fl').checked) { tx.translate(px + pw / 2, 0); tx.scale(-1, 1); tx.translate(-(px + pw / 2), 0); } tx.drawImage(off, px, py, pw, ph); tx.restore();
  }
  function paint() {
    var d = dims(); cv.width = Math.min(d.w, 960); cv.height = Math.round(cv.width * d.h / d.w); render(cv, cx, cv.width, cv.height);
    if (pf) { var pw = 320, ph = Math.round(pw * off.height / off.width) || 180; pc.width = pw; pc.height = ph; chk(pcx, pw, ph); pcx.drawImage(off, 0, 0, pw, ph); }
  }
  function lbl(id, u) { var e = $('#' + id), b = $('#' + id + 'v'); e.addEventListener('input', function () { b.textContent = e.value + (u || ''); if (!running) paint(); }); }
  lbl('q-tol'); lbl('q-soft'); lbl('q-sc', '%'); lbl('q-x', '%'); lbl('q-y', '%');
  $('#q-pg').oninput = function () { $('#q-pgv').textContent = Math.round(this.value * 100) + '%'; gains(); };
  $('#q-bg').oninput = function () { $('#q-bgv').textContent = Math.round(this.value * 100) + '%'; gains(); };
  ['q-kc', 'q-inv', 'q-fl', 'q-md'].forEach(function (i) { $('#' + i).addEventListener('change', function () { if (i === 'q-md' && this.value === 'ai') loadSeg(); if (!running) { cut(); paint(); } }); });

  $('#q-pf').onchange = function () {
    var f = this.files[0]; if (!f) return; pf = false; pv.src = URL.createObjectURL(f);
    pv.onloadeddata = async function () { if (window.PerfFixDur) await window.PerfFixDur(pv); pf = true; seek(pv, Math.min(0.1, pv.duration / 2)).then(function () { $('#q-i').textContent = 'الشخص: ' + pv.videoWidth + '×' + pv.videoHeight + ' — ' + pv.duration.toFixed(1) + ' ث'; cut(); paint(); }); };
  };
  $('#q-bf').onchange = function () {
    var f = this.files[0]; if (!f) return; bf = false; bimg = null;
    if (/^image/.test(f.type)) { var im = new Image(); im.onload = function () { bimg = im; bv.removeAttribute('src'); bf = true; paint(); }; im.src = URL.createObjectURL(f); }
    else { bv.src = URL.createObjectURL(f); bv.onloadeddata = function () { bf = true; seek(bv, 0).then(paint); }; }
  };
  pc.onclick = function (e) { if (!pf) return; var r = pc.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) * pc.width / r.width), y = Math.floor((e.clientY - r.top) * pc.height / r.height), t = document.createElement('canvas'); t.width = off.width; t.height = off.height; var c = t.getContext('2d', { willReadFrequently: true }); c.drawImage(pv, 0, 0, t.width, t.height); var px = c.getImageData(Math.floor(x * t.width / pc.width), Math.floor(y * t.height / pc.height), 1, 1).data; $('#q-kc').value = '#' + [px[0], px[1], px[2]].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join(''); $('#q-md').value = 'key'; cut(); paint(); };
  $('#q-auto').onclick = function () { if (!pf) return; var t = document.createElement('canvas'); t.width = off.width; t.height = off.height; var c = t.getContext('2d', { willReadFrequently: true }); c.drawImage(pv, 0, 0, t.width, t.height); var pts = [[2, 2], [t.width - 3, 2], [2, t.height - 3], [t.width - 3, t.height - 3], [Math.floor(t.width / 2), 2]], s = [0, 0, 0]; pts.forEach(function (p) { var d = c.getImageData(p[0], p[1], 1, 1).data; s[0] += d[0]; s[1] += d[1]; s[2] += d[2]; }); $('#q-kc').value = '#' + s.map(function (v) { return ('0' + Math.round(v / pts.length).toString(16)).slice(-2); }).join(''); $('#q-md').value = 'key'; cut(); paint(); };

  async function loadSeg() {
    if (seg || segTried) return; segTried = true; $('#q-m').textContent = 'جارٍ تحميل نموذج العزل الذكي…';
    try {
      var V = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14', mod = await import(V + '/vision_bundle.mjs'), fs = await mod.FilesetResolver.forVisionTasks(V + '/wasm');
      seg = await mod.ImageSegmenter.createFromOptions(fs, { baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite' }, runningMode: 'VIDEO', outputConfidenceMasks: true, outputCategoryMask: false });
      $('#q-m').textContent = 'تم تحميل القناع الذكي ✅ إن بدا الشخص شفافًا والخلفية ظاهرة فاضغط «عكس القناع الذكي».'; runSeg();
    } catch (e) { seg = null; $('#q-m').textContent = 'تعذّر تحميل النموذج (إنترنت أو حظر). استخدم المفتاح اللوني.'; $('#q-md').value = 'key'; }
  }
  function runSeg() { if (!seg || !pf) return; try { var r = seg.segmentForVideo(pv, performance.now()), ms = r.confidenceMasks, m = ms.length > 1 ? ms[1] : ms[0]; segMask = m.getAsFloat32Array().slice(); segW = m.width; segH = m.height; r.close && r.close(); } catch (e) { } }

  function graph(rec) {
    if (!P.ac) { P.ac = new AC(); P.gp = P.ac.createGain(); P.gb = P.ac.createGain(); P.a = P.ac.createMediaElementSource(pv); P.a.connect(P.gp); try { P.b = P.ac.createMediaElementSource(bv); P.b.connect(P.gb); } catch (e) { } }
    try { P.gp.disconnect(); P.gb.disconnect(); } catch (e) { }
    var dest = null; if (rec) { dest = P.ac.createMediaStreamDestination(); P.gp.connect(dest); P.gb.connect(dest); } else { P.gp.connect(P.ac.destination); P.gb.connect(P.ac.destination); }
    gains(); return dest;
  }
  function gains() { if (P.gp) { P.gp.gain.value = +$('#q-pg').value; P.gb.gain.value = +$('#q-bg').value; } }
  function stop() { running = false; pv.pause(); bv.pause(); }
  $('#q-ps').onclick = stop;
  function loop(draw, end) { running = true; (function t() { if (!running) return; if ($('#q-md').value === 'ai') runSeg(); draw(); if (end && end()) { running = false; return; } requestAnimationFrame(t); })(); }

  $('#q-pv').onclick = async function () {
    if (!pf) return ($('#q-m').textContent = 'اختر فيديو الشخص أولًا.'); if (!bf) return ($('#q-m').textContent = 'اختر الخلفية أولًا.');
    stop(); graph(false); await P.ac.resume(); await seek(pv, 0); if (bv.videoWidth) await seek(bv, 0); if (bv.videoWidth) bv.play(); await pv.play();
    loop(paint, function () { return pv.ended; });
  };
  $('#q-ex').onclick = async function () {
    if (!pf) return ($('#q-m').textContent = 'اختر فيديو الشخص أولًا.'); if (!bf) return ($('#q-m').textContent = 'اختر الخلفية أولًا.');
    if (!window.MediaRecorder) return ($('#q-m').textContent = 'متصفحك لا يدعم التسجيل. استخدم Chrome أو Edge.');
    if (busy) return; busy = true; stop();
    try {
      var d = dims(), c2 = document.createElement('canvas'); c2.width = d.w; c2.height = d.h; var x2 = c2.getContext('2d'), stream = c2.captureStream(30), dest = graph(true);
      dest.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); });
      var mime = pickMime($('#q-fm').value), rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 10e6 } : { videoBitsPerSecond: 10e6 }), chunks = [];
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); }; var done = new Promise(function (ok) { rec.onstop = ok; });
      await P.ac.resume(); await seek(pv, 0); if (bv.videoWidth) await seek(bv, 0); render(c2, x2, d.w, d.h); rec.start(250); if (bv.videoWidth) bv.play(); await pv.play();
      await new Promise(function (ok) { loop(function () { render(c2, x2, d.w, d.h); $('#q-m').textContent = 'جارٍ التصدير بزمن حقيقي… ' + Math.round(clamp(pv.currentTime / pv.duration, 0, 1) * 100) + '%'; }, function () { if (pv.ended) { ok(); return true; } return false; }); });
      stop(); await new Promise(function (r) { setTimeout(r, 300); }); rec.stop(); await done;
      var ext = /mp4/.test(rec.mimeType) ? 'mp4' : 'webm', blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' }); dl(blob, 'person-composited.' + ext); $('#q-m').textContent = 'تم ✅ ' + (blob.size / 1048576).toFixed(1) + ' م.ب.';
    } catch (e) { $('#q-m').textContent = 'تعذّر التصدير: ' + (e.message || e); }
    busy = false; graph(false); paint();
  };
})();
