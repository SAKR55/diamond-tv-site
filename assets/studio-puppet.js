/* استوديو الدمى: حرّك شخصية ثنائية الأبعاد بحركة شخص في فيديو (جسم، رأس، ذراعان، فم، رمش) مع مزامنة الفم على الصوت المستنسخ. كل المعالجة داخل المتصفح. */
(function () {
  var root = document.getElementById('puppet'); if (!root) return;
  function $(s) { return root.querySelector(s); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var AC = window.AudioContext || window.webkitAudioContext;
  var st = document.createElement('style');
  st.textContent = '#puppet{max-width:1000px;margin:0 auto;padding:14px;direction:rtl;color:#f1f5f9;font-family:inherit}#puppet .vc{background:#1e1b2e;border:1px solid #3b3558;border-radius:14px;padding:14px;margin:12px 0}#puppet h2{font-size:1.05rem;margin:0 0 8px;color:#c4b5fd}#puppet .hint{font-size:12px;color:#94a3b8;margin:4px 0 8px;line-height:1.7}#puppet .rw{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px}#puppet .rw span{flex:0 0 130px}#puppet .rw input[type=range]{flex:1}#puppet .rw b{flex:0 0 56px;direction:ltr;color:#a78bfa;text-align:left}#puppet button,#puppet select,#puppet input[type=number]{font:inherit;font-size:13px;background:#2a2542;color:#f1f5f9;border:1px solid #4c4580;border-radius:8px;padding:7px 10px}#puppet button{cursor:pointer}#puppet button:disabled{opacity:.5;cursor:wait}#puppet .pri{background:#7c3aed;border-color:#7c3aed;font-weight:700}#puppet .gr{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;align-items:center}#puppet canvas{max-width:100%;background:#120f1f;border-radius:10px;display:block;margin:8px 0}#puppet .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:700px){#puppet .two{grid-template-columns:1fr}}#puppet .msg{font-size:13px;color:#c4b5fd;min-height:20px;margin:6px 0}#puppet label.f{display:inline-flex;gap:6px;align-items:center;background:#2a2542;border:1px dashed #6d5fc7;border-radius:8px;padding:7px 12px;cursor:pointer;font-size:13px}#puppet label.f.ok{border-style:solid;border-color:#4ade80}#puppet input[type=file]{display:none}#puppet .pv button.on{background:#7c3aed;border-color:#a78bfa}';
  document.head.appendChild(st);

  var LAY = [['body', '🧍 الجسم'], ['head', '🙂 الرأس'], ['armA', '💪 ذراع على يسار الشاشة'], ['armB', '💪 ذراع على يمين الشاشة'], ['mouth', '👄 فم مفتوح (اختياري)'], ['eyes', '😑 عينان مغمضتان (اختياري)']];
  root.innerHTML =
    '<div class="vc"><h2>① طبقات الشخصية</h2><p class="hint">ارفع طبقات الشخصية كصور PNG شفافة <b>بنفس الأبعاد تمامًا ومحاذاة بعضها</b> (مثل تصدير طبقات من Photoshop أو Figma أو Procreate): الجسم، الرأس، ذراعان، وفم مفتوح وعينان مغمضتان اختياريان. الجسم والرأس كافيان للبدء. الأداة تقترح المفاصل تلقائيًا، وتضغط على الصورة لتعديلها. استخدم شخصيات رسمتها أنت أو لديك حقها.</p>' +
    '<div class="gr" id="pp-up">' + LAY.map(function (l) { return '<label class="f" id="pp-l-' + l[0] + '">' + l[1] + '<input type="file" accept="image/png,image/webp,image/*" data-l="' + l[0] + '"></label>'; }).join('') + '</div>' +
    '<div class="gr pv" id="pp-pv"><span class="hint">ضع المفصل بالنقر على المعاينة:</span><button data-p="head">مفصل الرأس (الرقبة)</button><button data-p="armA">كتف اليسار</button><button data-p="armB">كتف اليمين</button><button data-p="mouth">مركز الفم</button></div>' +
    '<canvas id="pp-cv0" width="400" height="400" style="max-height:320px;cursor:crosshair"></canvas></div>' +

    '<div class="vc"><h2>② الحركة من فيديو</h2><p class="hint">ارفع فيديو شخص يؤدي الحركة (يظهر جسمه من الكتفين فأعلى، والأفضل خلفية بسيطة وإضاءة جيدة). تُستخرج حركته داخل متصفحك باستخدام نماذج MediaPipe (تُحمَّل من الإنترنت أول مرة). ابدأ بجسم مرتاح ويدين نازلتين ليكون الوضع المبدئي صحيحًا.</p>' +
    '<div class="gr"><label class="f" id="pp-l-vid">🎬 فيديو الحركة<input type="file" id="pp-vf" accept="video/*"></label><button class="pri" id="pp-an">🔍 حلّل الحركة</button><label>معدّل التحليل <select id="pp-fps"><option>10</option><option selected>15</option><option>24</option></select></label><span class="hint" id="pp-ai"></span></div>' +
    '<div class="rw"><span>قوة حركة الجسم</span><input type="range" id="pp-gm" min="0" max="3" step="0.05" value="1"><b id="pp-gmv">1.00</b></div>' +
    '<div class="rw"><span>قوة ميل الجسم</span><input type="range" id="pp-gt" min="0" max="2" step="0.05" value="1"><b id="pp-gtv">1.00</b></div>' +
    '<div class="rw"><span>قوة حركة الرأس</span><input type="range" id="pp-gh" min="0" max="2" step="0.05" value="1"><b id="pp-ghv">1.00</b></div>' +
    '<div class="rw"><span>قوة الذراعين</span><input type="range" id="pp-ga" min="0" max="1.5" step="0.05" value="1"><b id="pp-gav">1.00</b></div>' +
    '<div class="rw"><span>تنعيم الحركة</span><input type="range" id="pp-sm" min="0" max="0.9" step="0.05" value="0.4"><b id="pp-smv">0.40</b></div>' +
    '<div class="gr"><label><input type="checkbox" id="pp-mr"> اعكس الشخصية أفقيًا</label></div></div>' +

    '<div class="vc"><h2>③ الصوت</h2><p class="hint">ارفع الصوت المستنسخ (WAV من تطبيق الاستنساخ أو من مولّد الأصوات)، وسيحرّك فم الشخصية بحسب علوّ الصوت. بدون صوت مرفوع يُستخدم فم الفيديو المرجعي إن وُجد وجه.</p>' +
    '<div class="gr"><label class="f" id="pp-l-vo">🗣 الصوت<input type="file" id="pp-af" accept="audio/*,video/*"></label><label><input type="checkbox" id="pp-ls" checked> مزامنة الفم على الصوت</label><label><input type="checkbox" id="pp-oa"> استخدم صوت فيديو الحركة الأصلي</label></div>' +
    '<div class="rw"><span>حساسية الفم</span><input type="range" id="pp-jg" min="0.3" max="2.5" step="0.05" value="1.2"><b id="pp-jgv">1.20</b></div>' +
    '<div class="rw"><span>إزاحة الصوت</span><input type="range" id="pp-off" min="-2" max="2" step="0.01" value="0"><b id="pp-offv">0.00</b></div></div>' +

    '<div class="vc"><h2>④ الخلفية والإخراج</h2>' +
    '<div class="gr"><label>لون الخلفية <input type="color" id="pp-bc" value="#1e293b" style="width:44px;height:30px;padding:0"></label><label class="f" id="pp-l-bg">🏞 صورة/فيديو خلفية<input type="file" id="pp-bf" accept="image/*,video/*"></label><label><input type="checkbox" id="pp-tr"> خلفية شفافة (WebM مع ألفا إن دعمه المتصفح)</label></div>' +
    '<div class="rw"><span>حجم الشخصية</span><input type="range" id="pp-sc" min="20" max="150" value="90"><b id="pp-scv">90%</b></div>' +
    '<div class="rw"><span>الموضع أفقيًا</span><input type="range" id="pp-x" min="0" max="100" value="50"><b id="pp-xv">50%</b></div>' +
    '<div class="rw"><span>الموضع رأسيًا</span><input type="range" id="pp-y" min="0" max="100" value="100"><b id="pp-yv">100%</b></div>' +
    '<canvas id="pp-cv" width="640" height="360" style="width:100%;max-height:420px;object-fit:contain"></canvas>' +
    '<div class="gr"><button id="pp-play">▶ معاينة</button><button id="pp-stop">⏹ إيقاف</button><button id="pp-dj">⬇ بيانات الحركة JSON</button><label>الصيغة <select id="pp-fm"><option value="webm">WebM</option><option value="mp4">MP4 (إن دعمه المتصفح)</option></select></label><button class="pri" id="pp-ex">🚀 صدّر الفيديو</button></div><div class="msg" id="pp-m"></div></div>';

  var L = {}, piv = { head: null, armA: null, armB: null, mouth: null }, selP = 'head', tracks = [], base = null, tfps = 15;
  var vidBuf = null, voBuf = null, voEnv = null, bgImg = null, bgVid = null, busy = false, playing = false, P = { ac: null };
  var cv = $('#pp-cv'), cx = cv.getContext('2d'), c0 = $('#pp-cv0'), x0 = c0.getContext('2d');

  function bbox(img) { /* حدود الجزء غير الشفاف */
    var w = img.naturalWidth, h = img.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0); var d = x.getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (var y = 0; y < h; y += 2) for (var xx = 0; xx < w; xx += 2) if (d[(y * w + xx) * 4 + 3] > 20) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return x1 < 0 ? { x: 0, y: 0, w: w, h: h } : { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  function autoPivots() {
    if (L.head) { var b = bbox(L.head); piv.head = [(b.x + b.w / 2) / L.head.naturalWidth, (b.y + b.h * 0.95) / L.head.naturalHeight]; piv.mouth = [(b.x + b.w / 2) / L.head.naturalWidth, (b.y + b.h * 0.72) / L.head.naturalHeight]; }
    ['armA', 'armB'].forEach(function (k) { if (L[k]) { var a = bbox(L[k]); piv[k] = [(a.x + a.w / 2) / L[k].naturalWidth, (a.y + a.h * 0.06) / L[k].naturalHeight]; } });
  }
  function dims() { var o = L.body || L.head; return o ? { w: o.naturalWidth, h: o.naturalHeight } : { w: 400, h: 400 }; }
  function drawLayers(ctx, d) { ['body', 'armA', 'armB', 'head', 'mouth', 'eyes'].forEach(function (k) { if (L[k] && (k !== 'mouth' && k !== 'eyes')) ctx.drawImage(L[k], 0, 0, d.w, d.h); }); }
  function prev() {
    var d = dims(); c0.width = d.w; c0.height = d.h; x0.clearRect(0, 0, d.w, d.h); x0.fillStyle = '#1a1630'; x0.fillRect(0, 0, d.w, d.h); drawLayers(x0, d);
    var cols = { head: '#f59e0b', armA: '#22d3ee', armB: '#a3e635', mouth: '#f472b6' };
    Object.keys(piv).forEach(function (k) { var p = piv[k]; if (!p) return; x0.beginPath(); x0.arc(p[0] * d.w, p[1] * d.h, Math.max(5, d.w / 70), 0, 7); x0.fillStyle = cols[k]; x0.fill(); x0.strokeStyle = '#000'; x0.lineWidth = 2; x0.stroke(); });
  }
  [].forEach.call(root.querySelectorAll('#pp-up input'), function (inp) {
    inp.onchange = function () { var f = this.files[0]; if (!f) return; var k = this.dataset.l, im = new Image(), lab = this.parentNode; im.onload = function () { L[k] = im; lab.classList.add('ok'); autoPivots(); prev(); paint(0); }; im.src = URL.createObjectURL(f); };
  });
  [].forEach.call(root.querySelectorAll('#pp-pv button'), function (b) { b.onclick = function () { selP = b.dataset.p;[].forEach.call(root.querySelectorAll('#pp-pv button'), function (x) { x.classList.toggle('on', x === b); }); }; });
  c0.onclick = function (e) { var r = c0.getBoundingClientRect(); piv[selP] = [clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1)]; prev(); paint(curT()); };

  function lbl(id, d2) { var e = $('#' + id), b = $('#' + id + 'v'); e.addEventListener('input', function () { b.textContent = d2 ? (+e.value).toFixed(2) : e.value + '%'; if (!playing) paint(curT()); }); }
  ['pp-gm', 'pp-gt', 'pp-gh', 'pp-ga', 'pp-sm', 'pp-jg'].forEach(function (i) { lbl(i, 1); }); ['pp-sc', 'pp-x', 'pp-y'].forEach(function (i) { lbl(i, 0); });
  $('#pp-off').oninput = function () { $('#pp-offv').textContent = (+this.value).toFixed(2); };
  ['pp-mr', 'pp-bc', 'pp-tr'].forEach(function (i) { $('#' + i).onchange = function () { if (!playing) paint(curT()); }; });

  /* ---------- تحليل الحركة ---------- */
  var MPV = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
  $('#pp-vf').onchange = async function () {
    var f = this.files[0]; if (!f) return; this.parentNode.classList.add('ok'); window._ppFile = f; vidBuf = null;
    try { var ac = new AC(); vidBuf = await ac.decodeAudioData(await f.arrayBuffer()); ac.close(); } catch (e) { vidBuf = null; }
  };
  function smoothFill(arr, a) { for (var i = 1; i < arr.length; i++) { var p = arr[i - 1], c = arr[i]; Object.keys(c).forEach(function (k) { if (typeof c[k] === 'number' && typeof p[k] === 'number') c[k] = p[k] * a + c[k] * (1 - a); }); } }
  function frameFromLm(lm, bs) {
    var s1 = lm[11], s2 = lm[12], A = s1.x < s2.x ? 11 : 12, B = A === 11 ? 12 : 11, a = lm[A], b = lm[B], sw = Math.hypot(a.x - b.x, a.y - b.y) || 0.1, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, n = lm[0], e1 = lm[2].x < lm[5].x ? lm[2] : lm[5], e2 = e1 === lm[2] ? lm[5] : lm[2];
    function arm(sh, wr, el) { var w = lm[wr].visibility > 0.3 ? lm[wr] : lm[el]; return Math.atan2(w.y - lm[sh].y, w.x - lm[sh].x); }
    return { mx: mx, my: my, sw: sw, tilt: Math.atan2(b.y - a.y, b.x - a.x), roll: Math.atan2(e2.y - e1.y, e2.x - e1.x), hx: (n.x - mx) / sw, hy: (n.y - my) / sw, aA: arm(A, A + 4, A + 2), aB: arm(B, B + 4, B + 2), jaw: bs.jawOpen || 0, bl: ((bs.eyeBlinkLeft || 0) + (bs.eyeBlinkRight || 0)) / 2 };
  }
  function setBase() { var n = Math.min(8, tracks.length), z = { mx: 0, my: 0, sw: 0, tilt: 0, roll: 0, hx: 0, hy: 0, aA: 0, aB: 0 }; for (var i = 0; i < n; i++) Object.keys(z).forEach(function (k) { z[k] += tracks[i][k] / n; }); base = z; }
  function setTracks(t, fps) { tracks = t; tfps = fps || 15; smoothFill(tracks, +$('#pp-sm').value); setBase(); paint(0); }
  window.Puppet = { setTracks: function (t, f) { setTracks(t, f); }, tracks: function () { return tracks; } };
  $('#pp-an').onclick = async function () {
    if (!window._ppFile) return ($('#pp-ai').textContent = 'اختر فيديو الحركة أولًا.');
    var btn = this; btn.disabled = true; busy = true; $('#pp-ai').textContent = 'جارٍ تحميل نماذج التحليل…';
    try {
      var mod = await import(MPV + '/vision_bundle.mjs'), fs = await mod.FilesetResolver.forVisionTasks(MPV + '/wasm');
      var pose = await mod.PoseLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task' }, runningMode: 'VIDEO', numPoses: 1 });
      var face = null; try { face = await mod.FaceLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task' }, runningMode: 'VIDEO', numFaces: 1, outputFaceBlendshapes: true }); } catch (e) { face = null; }
      var v = document.createElement('video'); v.muted = true; v.playsInline = true; v.src = URL.createObjectURL(window._ppFile); await new Promise(function (ok, no) { v.onloadeddata = ok; v.onerror = no; });
      if (!isFinite(v.duration) && window.PerfFixDur) await window.PerfFixDur(v);
      var fps = +$('#pp-fps').value, N = Math.max(1, Math.floor(v.duration * fps)), out = [], last = null;
      for (var i = 0; i < N; i++) {
        v.currentTime = i / fps; await new Promise(function (ok) { v.onseeked = ok; }); var ts = i * 1000 / fps + 1, pr = pose.detectForVideo(v, ts), bs = {};
        if (face) { var fr = face.detectForVideo(v, ts + 0.5); if (fr.faceBlendshapes && fr.faceBlendshapes[0]) fr.faceBlendshapes[0].categories.forEach(function (c) { bs[c.categoryName] = c.score; }); }
        if (pr.landmarks && pr.landmarks[0]) last = frameFromLm(pr.landmarks[0], bs); if (last) { last = Object.assign({}, last, { jaw: bs.jawOpen || 0, bl: ((bs.eyeBlinkLeft || 0) + (bs.eyeBlinkRight || 0)) / 2 }); out.push(last); } else if (out.length) out.push(Object.assign({}, out[out.length - 1]));
        if (i % 3 === 0) $('#pp-ai').textContent = 'تحليل الحركة… ' + Math.round(i * 100 / N) + '%';
      }
      pose.close(); face && face.close();
      if (out.length < 3) throw new Error('لم يُكتشف شخص في الفيديو');
      setTracks(out, fps); $('#pp-ai').textContent = 'تم ✅ ' + out.length + ' إطار حركة' + (face ? '' : ' (بدون تعابير الوجه)');
    } catch (e) { $('#pp-ai').textContent = 'تعذّر التحليل: ' + (e.message || e) + ' (يحتاج إنترنتًا لتحميل النماذج أول مرة).'; }
    btn.disabled = false; busy = false;
  };
  $('#pp-dj').onclick = function () { if (!tracks.length) return; var b = new Blob([JSON.stringify({ fps: tfps, tracks: tracks })], { type: 'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'motion.json'; a.click(); };

  /* ---------- الصوت ---------- */
  function env(buf, rate) { var sr = buf.sampleRate, hop = Math.floor(sr / rate), m = Math.floor(buf.length / hop), o = new Float32Array(m), ch = buf.numberOfChannels; for (var c = 0; c < ch; c++) { var d = buf.getChannelData(c); for (var i = 0; i < m; i++) { var s = 0, b = i * hop; for (var j = 0; j < hop; j++) { var x = d[b + j] || 0; s += x * x; } o[i] += Math.sqrt(s / hop) / ch; } } var sorted = Array.from(o).sort(function (a, b) { return a - b; }), p = sorted[Math.floor(sorted.length * 0.95)] || 1; for (var k = 0; k < m; k++) o[k] = clamp(o[k] / (p || 1), 0, 1.3); for (k = 1; k < m; k++) o[k] = o[k - 1] * 0.35 + o[k] * 0.65; return o; }
  $('#pp-af').onchange = async function () { var f = this.files[0]; if (!f) return; try { var ac = new AC(); voBuf = await ac.decodeAudioData(await f.arrayBuffer()); ac.close(); voEnv = env(voBuf, 50); this.parentNode.classList.add('ok'); $('#pp-m').textContent = 'تم تحميل الصوت (' + voBuf.duration.toFixed(1) + ' ث).'; } catch (e) { $('#pp-m').textContent = 'تعذّر فك الصوت.'; } };
  $('#pp-bf').onchange = function () { var f = this.files[0]; if (!f) return; this.parentNode.classList.add('ok'); bgImg = null; if (bgVid) { bgVid.pause(); bgVid = null; } if (/^image/.test(f.type)) { var im = new Image(); im.onload = function () { bgImg = im; paint(curT()); }; im.src = URL.createObjectURL(f); } else { bgVid = document.createElement('video'); bgVid.src = URL.createObjectURL(f); bgVid.loop = true; bgVid.muted = true; bgVid.playsInline = true; bgVid.onloadeddata = function () { paint(curT()); }; } };

  /* ---------- الرسم ---------- */
  function at(t) { if (!tracks.length) return null; var f = t * tfps, i = clamp(Math.floor(f), 0, tracks.length - 1), j = Math.min(tracks.length - 1, i + 1), u = clamp(f - i, 0, 1), a = tracks[i], b = tracks[j], o = {}; Object.keys(a).forEach(function (k) { o[k] = a[k] + (b[k] - a[k]) * u; }); return o; }
  function jawAt(t, tr) { if ($('#pp-ls').checked && voEnv) { var k = (t - (+$('#pp-off').value)) * 50; if (k < 0 || k >= voEnv.length) return 0; return clamp(voEnv[Math.floor(k)] * +$('#pp-jg').value * 0.9, 0, 1); } return tr ? clamp((tr.jaw || 0) * +$('#pp-jg').value * 1.5, 0, 1) : 0; }
  var T0 = 0, tNow = 0; function curT() { return tNow; }
  function drawChar(c, W, H, t) {
    var d = dims(), tr = at(t), sc = (+$('#pp-sc').value / 100) * H / d.h, px = (W - d.w * sc) * ($('#pp-x').value / 100), py = (H - d.h * sc) * ($('#pp-y').value / 100), gm = +$('#pp-gm').value, gt = +$('#pp-gt').value, gh = +$('#pp-gh').value, ga = +$('#pp-ga').value;
    c.save(); c.translate(px, py); c.scale(sc, sc); if ($('#pp-mr').checked) { c.translate(d.w, 0); c.scale(-1, 1); }
    var dx = 0, dy = 0, rot = 0, bs = 1, hr = 0, hdx = 0, hdy = 0, aa = 0, ab = 0, bl = 0;
    if (tr && base) { dx = (tr.mx - base.mx) * d.w * gm * 1.5; dy = (tr.my - base.my) * d.h * gm * 1.5; rot = (tr.tilt - base.tilt) * gt; bs = clamp(1 + (tr.sw / base.sw - 1) * 0.5 * gm, 0.85, 1.2); hr = (tr.roll - base.roll) * gh; hdx = (tr.hx - base.hx) * d.w * 0.12 * gh; hdy = (tr.hy - base.hy) * d.h * 0.12 * gh; aa = (tr.aA - base.aA) * ga; ab = (tr.aB - base.aB) * ga; bl = tr.bl || 0; }
    var cxx = d.w / 2, cyy = d.h * 0.7; c.translate(cxx + dx, cyy + dy); c.rotate(rot); c.scale(bs, bs); c.translate(-cxx, -cyy);
    function part(k, ang) { if (!L[k]) return; var p = piv[k] || [0.5, 0.5], X = p[0] * d.w, Y = p[1] * d.h; c.save(); c.translate(X, Y); c.rotate(ang); c.translate(-X, -Y); c.drawImage(L[k], 0, 0, d.w, d.h); c.restore(); }
    part('armA', aa); if (L.body) c.drawImage(L.body, 0, 0, d.w, d.h); part('armB', ab);
    if (L.head) {
      var hp = piv.head || [0.5, 0.9], hx = hp[0] * d.w, hy = hp[1] * d.h; c.save(); c.translate(hx + hdx, hy + hdy); c.rotate(hr); c.translate(-hx, -hy); c.drawImage(L.head, 0, 0, d.w, d.h);
      var j = jawAt(t, tr); if (L.mouth && j > 0.05) { var mp = piv.mouth || [0.5, 0.7], mx = mp[0] * d.w, my = mp[1] * d.h; c.save(); c.translate(mx, my); c.scale(1, clamp(j, 0.08, 1)); c.translate(-mx, -my); c.drawImage(L.mouth, 0, 0, d.w, d.h); c.restore(); }
      if (L.eyes && bl > 0.5) c.drawImage(L.eyes, 0, 0, d.w, d.h); c.restore();
    }
    c.restore();
  }
  function outDims() { if (bgVid && bgVid.videoWidth) return { w: bgVid.videoWidth, h: bgVid.videoHeight }; if (bgImg) return { w: bgImg.naturalWidth, h: bgImg.naturalHeight }; var d = dims(); return { w: Math.round(d.w / 2) * 2, h: Math.round(d.h / 2) * 2 }; }
  function frame(c, W, H, t, transparent) {
    c.clearRect(0, 0, W, H);
    if (!transparent) { c.fillStyle = $('#pp-bc').value; c.fillRect(0, 0, W, H); if (bgVid && bgVid.videoWidth) c.drawImage(bgVid, 0, 0, W, H); else if (bgImg) c.drawImage(bgImg, 0, 0, W, H); }
    drawChar(c, W, H, t);
  }
  function paint(t) { tNow = t || 0; var o = outDims(), s = Math.min(1, 960 / o.w); cv.width = Math.round(o.w * s); cv.height = Math.round(o.h * s); frame(cx, cv.width, cv.height, tNow, false); }
  function duration() { var a = tracks.length ? tracks.length / tfps : 0, b = voBuf ? voBuf.duration + Math.max(0, +$('#pp-off').value) : 0; return Math.max(a, b, 1); }

  /* ---------- التشغيل والتصدير ---------- */
  function ctxAudio(rec) {
    if (!P.ac) P.ac = new AC(); var ac = P.ac, dest = rec ? ac.createMediaStreamDestination() : null, out = dest || ac.destination, srcs = [];
    function add(buf, off, gain) { var s = ac.createBufferSource(); s.buffer = buf; var g = ac.createGain(); g.gain.value = gain; s.connect(g); g.connect(out); var t0 = ac.currentTime + 0.1; if (off >= 0) s.start(t0 + off, 0); else s.start(t0, -off); srcs.push(s); }
    var o = +$('#pp-off').value; if (voBuf) add(voBuf, o, 1); if ($('#pp-oa').checked && vidBuf) add(vidBuf, 0, 0.8);
    return { dest: dest, stop: function () { srcs.forEach(function (s) { try { s.stop(); } catch (e) { } }); }, t0: ac.currentTime + 0.1 };
  }
  var A = null;
  function stopAll() { playing = false; A && A.stop(); A = null; bgVid && bgVid.pause(); }
  $('#pp-stop').onclick = stopAll;
  $('#pp-play').onclick = async function () {
    if (!L.body && !L.head) return ($('#pp-m').textContent = 'ارفع طبقة الجسم أو الرأس أولًا.'); stopAll(); await (P.ac || (P.ac = new AC())).resume(); A = ctxAudio(false); if (bgVid) { bgVid.currentTime = 0; bgVid.play(); }
    var D = duration(), t0 = performance.now(); playing = true; (function tick() { if (!playing) return; var t = (performance.now() - t0) / 1000; paint(t); if (t >= D) { stopAll(); paint(0); return; } requestAnimationFrame(tick); })();
  };
  function pickMime(pref, alpha) { var l = alpha ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'] : (pref === 'mp4' ? ['video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'] : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']); for (var i = 0; i < l.length; i++) if (window.MediaRecorder && MediaRecorder.isTypeSupported(l[i])) return l[i]; return ''; }
  $('#pp-ex').onclick = async function () {
    if (busy) return; if (!L.body && !L.head) return ($('#pp-m').textContent = 'ارفع طبقة الجسم أو الرأس أولًا.'); if (!tracks.length) return ($('#pp-m').textContent = 'حلّل فيديو الحركة أولًا.');
    if (!window.MediaRecorder) return ($('#pp-m').textContent = 'متصفحك لا يدعم التسجيل. استخدم Chrome أو Edge.'); busy = true; stopAll();
    try {
      var o = outDims(), s = Math.min(1, 1920 / Math.max(o.w, o.h)), W = Math.round(o.w * s / 2) * 2, H = Math.round(o.h * s / 2) * 2, tr = $('#pp-tr').checked, c2 = document.createElement('canvas'); c2.width = W; c2.height = H; var x2 = c2.getContext('2d'), stream = c2.captureStream(30);
      await (P.ac || (P.ac = new AC())).resume(); A = ctxAudio(true); A.dest.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); });
      var mime = pickMime($('#pp-fm').value, tr), rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 8e6 } : { videoBitsPerSecond: 8e6 }), chunks = []; rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); }; var done = new Promise(function (ok) { rec.onstop = ok; });
      if (bgVid) { bgVid.currentTime = 0; bgVid.play(); } var D = duration(), t0 = performance.now(); frame(x2, W, H, 0, tr); rec.start(250);
      await new Promise(function (ok) { (function tick() { var t = (performance.now() - t0) / 1000; frame(x2, W, H, t, tr); $('#pp-m').textContent = 'جارٍ التصدير بزمن حقيقي… ' + Math.round(clamp(t / D, 0, 1) * 100) + '%'; if (t >= D) return ok(); requestAnimationFrame(tick); })(); });
      stopAll(); await new Promise(function (r) { setTimeout(r, 300); }); rec.stop(); await done;
      var ext = /mp4/.test(rec.mimeType) ? 'mp4' : 'webm', blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'puppet-animation.' + ext; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 1500);
      $('#pp-m').textContent = 'تم ✅ ' + (blob.size / 1048576).toFixed(1) + ' م.ب.';
    } catch (e) { $('#pp-m').textContent = 'تعذّر التصدير: ' + (e.message || e); }
    busy = false; paint(0);
  };
  paint(0); prev();
})();
