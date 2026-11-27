/* استوديو نقل الأداء: تجهيز فيديو مرجعي وصورة الشخصية للأدوات السحابية، ثم تركيب النتيجة مع الصوت المستنسخ بمحاذاة تلقائية. كل المعالجة داخل المتصفح. */
(function () {
  var root = document.getElementById('perf'); if (!root) return;
  function $(s, r) { return (r || root).querySelector(s); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var AC = window.AudioContext || window.webkitAudioContext;
  var st = document.createElement('style');
  st.textContent = '#perf{max-width:1000px;margin:0 auto;padding:14px;direction:rtl;color:#f1f5f9;font-family:inherit}#perf .vc{background:#1e1b2e;border:1px solid #3b3558;border-radius:14px;padding:14px;margin:12px 0}#perf h2{font-size:1.05rem;margin:0 0 8px;color:#c4b5fd}#perf .hint{font-size:12px;color:#94a3b8;margin:4px 0 8px;line-height:1.7}#perf .rw{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px}#perf .rw span{flex:0 0 120px}#perf .rw input[type=range]{flex:1}#perf .rw b{flex:0 0 56px;direction:ltr;color:#a78bfa;text-align:left}#perf button,#perf select,#perf input[type=number]{font:inherit;font-size:13px;background:#2a2542;color:#f1f5f9;border:1px solid #4c4580;border-radius:8px;padding:7px 10px}#perf button{cursor:pointer}#perf button:hover{background:#3a3363}#perf button:disabled{opacity:.5;cursor:wait}#perf .pri{background:#7c3aed;border-color:#7c3aed;font-weight:700}#perf .gr{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;align-items:center}#perf video,#perf canvas{max-width:100%;background:#120f1f;border-radius:10px;display:block;margin:8px 0}#perf .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:700px){#perf .two{grid-template-columns:1fr}}#perf .ck{font-size:13px;line-height:1.9}#perf .ok{color:#4ade80}#perf .wn{color:#fbbf24}#perf .msg{font-size:13px;color:#c4b5fd;min-height:20px;margin:6px 0}#perf label.f{display:inline-flex;gap:6px;align-items:center;background:#2a2542;border:1px dashed #6d5fc7;border-radius:8px;padding:7px 12px;cursor:pointer;font-size:13px}#perf input[type=file]{display:none}';
  document.head.appendChild(st);

  /* ---------- أدوات ---------- */
  function dl(b, n) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = n; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
  function wav(chs, sr) { var n = chs[0].length, c = chs.length, buf = new ArrayBuffer(44 + n * c * 2), v = new DataView(buf); function s(o, t) { for (var i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); } s(0, 'RIFF'); v.setUint32(4, 36 + n * c * 2, true); s(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, c, true); v.setUint32(24, sr, true); v.setUint32(28, sr * c * 2, true); v.setUint16(32, c * 2, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, n * c * 2, true); var o = 44; for (var i = 0; i < n; i++) for (var k = 0; k < c; k++) { var x = clamp(chs[k][i], -1, 1); v.setInt16(o, x < 0 ? x * 32768 : x * 32767, true); o += 2; } return new Blob([buf], { type: 'audio/wav' }); }
  var CT = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u) { var c = 0xFFFFFFFF; for (var i = 0; i < u.length; i++) c = CT[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) { /* ضغط بدون ضغط (store) */
    var enc = new TextEncoder(), parts = [], cd = [], off = 0;
    files.forEach(function (f) {
      var nm = enc.encode(f.name), crc = crc32(f.data), h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, 0, true); h.setUint16(12, 0x21, true);
      h.setUint32(14, crc, true); h.setUint32(18, f.data.length, true); h.setUint32(22, f.data.length, true); h.setUint16(26, nm.length, true); h.setUint16(28, 0, true);
      parts.push(h.buffer, nm, f.data);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true);
      c.setUint32(16, crc, true); c.setUint32(20, f.data.length, true); c.setUint32(24, f.data.length, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
      cd.push(c.buffer, nm); off += 30 + nm.length + f.data.length;
    });
    var cs = 0; cd.forEach(function (x) { cs += x.byteLength; });
    var e = new DataView(new ArrayBuffer(22)); e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
    return new Blob(parts.concat(cd, [e.buffer]), { type: 'application/zip' });
  }
  function fmt(s) { s = Math.max(0, s || 0); var m = Math.floor(s / 60); return m + ':' + ('0' + (s - m * 60).toFixed(1)).slice(-4); }
  function once(el, ev) { return new Promise(function (ok) { el.addEventListener(ev, function f() { el.removeEventListener(ev, f); ok(); }); }); }
  function seek(v, t) { return new Promise(function (ok) { if (Math.abs(v.currentTime - t) < 0.001) return ok(); var f = function () { v.removeEventListener('seeked', f); ok(); }; v.addEventListener('seeked', f); v.currentTime = t; }); }
  function pickMime(pref) {
    var list = pref === 'mp4' ? ['video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'] : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    for (var i = 0; i < list.length; i++) if (window.MediaRecorder && MediaRecorder.isTypeSupported(list[i])) return list[i];
    return '';
  }
  function decode(ab) { return new Promise(function (ok, no) { var ac = new AC(); ac.decodeAudioData(ab, function (b) { ac.close(); ok(b); }, function () { ac.close(); no(new Error('decode')); }); }); }
  function envelope(buf, rate) { /* غلاف طاقة بمعدل rate لكل ثانية */
    var n = buf.length, ch = buf.numberOfChannels, sr = buf.sampleRate, hop = Math.floor(sr / rate), m = Math.floor(n / hop), out = new Float32Array(m);
    for (var c = 0; c < ch; c++) { var d = buf.getChannelData(c); for (var i = 0; i < m; i++) { var s = 0, b = i * hop; for (var j = 0; j < hop; j++) { var x = d[b + j] || 0; s += x * x; } out[i] += Math.sqrt(s / hop) / ch; } }
    var mean = 0; for (var k = 0; k < m; k++) mean += out[k]; mean /= m || 1; var sd = 0; for (k = 0; k < m; k++) { out[k] -= mean; sd += out[k] * out[k]; } sd = Math.sqrt(sd / (m || 1)) || 1; for (k = 0; k < m; k++) out[k] /= sd; return out;
  }
  function bestLag(a, b, maxLag) { /* b متأخر عن a بـ lag عيّنة: أعلى ارتباط */
    var best = -1e9, bl = 0; for (var L = -maxLag; L <= maxLag; L++) { var s = 0, c = 0; for (var i = 0; i < a.length; i++) { var j = i - L; if (j < 0 || j >= b.length) continue; s += a[i] * b[j]; c++; } if (c > 20) { s /= c; if (s > best) { best = s; bl = L; } } } return { lag: bl, score: best };
  }

  /* ---------- الواجهة ---------- */
  root.innerHTML =
    '<div class="vc"><h2>① فيديو الأداء المرجعي</h2><p class="hint">الفيديو الذي فيه الحركة والتعابير المطلوب نقلها. اقصّ المقطع المطلوب، وحدّد النسبة والدقة والإطارات، ثم صدّر نسخة مجهّزة تناسب الأدوات السحابية. كل شيء يتم داخل متصفحك.</p>' +
    '<div class="gr"><label class="f">🎬 اختر فيديو المرجع<input type="file" id="p-rf" accept="video/*"></label><span id="p-ri" class="hint"></span></div>' +
    '<div class="two"><div><video id="p-rv" controls playsinline style="width:100%;max-height:300px"></video></div><div><canvas id="p-cv" width="360" height="360" style="width:100%;max-height:300px;object-fit:contain"></canvas><div class="hint" id="p-cvh">معاينة القص النهائي</div></div></div>' +
    '<div class="rw"><span>بداية المقطع</span><input type="range" id="p-in" min="0" max="10" step="0.05" value="0"><b id="p-inv">0.0 ث</b></div>' +
    '<div class="rw"><span>نهاية المقطع</span><input type="range" id="p-out" min="0" max="10" step="0.05" value="10"><b id="p-outv">10.0 ث</b></div>' +
    '<div class="gr"><label>النسبة <select id="p-ar"><option value="0">كما هي</option><option value="0.5625">9:16 عمودي</option><option value="1.7778">16:9 أفقي</option><option value="1">1:1 مربع</option><option value="0.8">4:5</option><option value="0.75">3:4</option></select></label>' +
    '<label>الارتفاع <select id="p-hh"><option value="480">480</option><option value="720" selected>720</option><option value="1080">1080</option></select></label>' +
    '<label>الإطارات/ث <select id="p-fps"><option>24</option><option selected>25</option><option>30</option></select></label>' +
    '<label>حدّ مدة الأداة (ث) <input type="number" id="p-lim" min="1" max="300" value="10" style="width:70px"></label></div>' +
    '<div class="rw"><span>تركيز القص أفقيًا</span><input type="range" id="p-fx" min="0" max="100" value="50"><b id="p-fxv">50%</b></div>' +
    '<div class="rw"><span>تركيز القص رأسيًا</span><input type="range" id="p-fy" min="0" max="100" value="35"><b id="p-fyv">35%</b></div>' +
    '<div class="ck" id="p-ck"></div>' +
    '<div class="gr"><button class="pri" id="p-rexp">🎞 صدّر المرجع المجهّز</button><button id="p-fr">🖼 استخرج الإطارات (ZIP)</button><select id="p-frs"><option value="2">2 إطار/ث</option><option value="4" selected>4 إطار/ث</option><option value="8">8 إطار/ث</option></select><button id="p-au">🔊 استخرج الصوت (WAV)</button><label><input type="checkbox" id="p-mute"> بدون صوت في الفيديو المجهّز</label></div><div class="msg" id="p-m1"></div></div>' +

    '<div class="vc"><h2>② صورة الشخصية الهدف</h2><p class="hint">الصورة التي ستتحرك بحركة المرجع (شخصيتك أو وجهك أنت أو من لديك إذنه). تُقصّ بنفس نسبة الفيديو المجهّز. الأفضل وجه واضح مواجه للكاميرا وإضاءة جيدة.</p>' +
    '<div class="gr"><label class="f">🖼 اختر صورة الشخصية<input type="file" id="p-tf" accept="image/*"></label><button id="p-texp">⬇ صدّر الصورة المقصوصة (PNG)</button></div><canvas id="p-tc" width="360" height="360" style="max-height:300px;width:auto"></canvas>' +
    '<div class="rw"><span>تركيز القص أفقيًا</span><input type="range" id="p-tx" min="0" max="100" value="50"><b id="p-txv">50%</b></div>' +
    '<div class="rw"><span>تركيز القص رأسيًا</span><input type="range" id="p-ty" min="0" max="100" value="35"><b id="p-tyv">35%</b></div></div>' +

    '<div class="vc"><h2>③ الأدوات التي تنقل الحركة</h2><p class="hint">ارفع الملفين المجهّزين (فيديو المرجع + صورة الشخصية) إلى أداة نقل الأداء السحابية التي تختارها، مثل Runway (Act-Two) أو Kling أو Wan Animate أو غيرها مما يتوفر عندك. تتغير الخدمات وحدودها بسرعة، فتأكد من شروطها (مدة، دقة، ترخيص) قبل الرفع. هذه الأدوات تُجري التوليد على خوادمها، وهذه الصفحة لا ترسل لها شيئًا تلقائيًا. بعد أن تستلم النتيجة انتقل إلى الخطوة التالية.</p></div>' +

    '<div class="vc"><h2>④ التركيب النهائي: نتيجة الأداة + الصوت المستنسخ</h2><p class="hint">ارفع الفيديو الناتج من الأداة السحابية، وأضف الصوت المستنسخ (ملف من تطبيق الاستنساخ أو من مولّد الأصوات). اضبط التزامن يدويًا أو ابدأ بالمحاذاة التلقائية إن كان الفيديو الناتج يحتفظ بصوت الأداء الأصلي. لا يوجد مزامنة شفاه تلقائية، فالتزامن هنا على الزمن فقط.</p>' +
    '<div class="gr"><label class="f">🎬 فيديو النتيجة<input type="file" id="p-xf" accept="video/*"></label><label class="f">🗣 الصوت المستنسخ<input type="file" id="p-vf" accept="audio/*,video/*"></label><button id="p-vg">🎙 خذ مسار مولّد الأصوات</button></div><span id="p-xi" class="hint"></span>' +
    '<video id="p-xv" controls playsinline style="width:100%;max-height:340px"></video>' +
    '<div class="rw"><span>إزاحة الصوت</span><input type="range" id="p-off" min="-3" max="3" step="0.01" value="0"><b id="p-offv">0.00 ث</b></div>' +
    '<div class="rw"><span>مستوى الصوت المستنسخ</span><input type="range" id="p-vg2" min="0" max="2" step="0.05" value="1"><b id="p-vgv">100%</b></div>' +
    '<div class="rw"><span>صوت الفيديو الأصلي</span><input type="range" id="p-og" min="0" max="1" step="0.05" value="0"><b id="p-ogv">0%</b></div>' +
    '<div class="gr"><button id="p-al">🧭 محاذاة تلقائية</button><button id="p-pv">▶ معاينة مع الصوت</button><button id="p-ps">⏹ إيقاف</button><label><input type="checkbox" id="p-fz" checked> ثبّت آخر إطار حتى ينتهي الصوت</label><label>الصيغة <select id="p-fm"><option value="webm">WebM</option><option value="mp4">MP4 (إن دعمه المتصفح)</option></select></label><button class="pri" id="p-xe">🚀 صدّر الفيديو النهائي</button></div><div class="msg" id="p-m2"></div></div>';

  var S = { r: null, rb: null, t: null, x: null, vo: null, xb: null, busy: false };
  var rv = $('#p-rv'), cv = $('#p-cv'), xv = $('#p-xv'), tc = $('#p-tc');

  /* ---------- حسابات القص ---------- */
  function outDims() {
    var vw = rv.videoWidth || 16, vh = rv.videoHeight || 9, ar = +$('#p-ar').value || vw / vh, H = +$('#p-hh').value;
    if (!+$('#p-ar').value) H = Math.min(H, vh);
    var W = Math.max(2, Math.round(H * ar / 2) * 2); H = Math.max(2, Math.round(H / 2) * 2); return { w: W, h: H, ar: W / H };
  }
  function cropRect(sw, sh, ar, fx, fy) {
    var sa = sw / sh, cw = sw, ch = sh;
    if (sa > ar) cw = sh * ar; else ch = sw / ar;
    return { x: (sw - cw) * fx, y: (sh - ch) * fy, w: cw, h: ch };
  }
  function drawCrop(ctx, src, sw, sh, d, fx, fy) { var c = cropRect(sw, sh, d.ar, fx, fy); ctx.drawImage(src, c.x, c.y, c.w, c.h, 0, 0, d.w, d.h); }
  function paintRef() {
    if (!S.r || !rv.videoWidth) return; var d = outDims(); cv.width = d.w; cv.height = d.h;
    drawCrop(cv.getContext('2d'), rv, rv.videoWidth, rv.videoHeight, d, $('#p-fx').value / 100, $('#p-fy').value / 100);
    $('#p-cvh').textContent = 'القص النهائي ' + d.w + '×' + d.h;
  }
  function paintTgt() {
    if (!S.t) return; var d = outDims(); tc.width = d.w; tc.height = d.h;
    drawCrop(tc.getContext('2d'), S.t, S.t.naturalWidth, S.t.naturalHeight, d, $('#p-tx').value / 100, $('#p-ty').value / 100);
  }
  function check() {
    if (!S.r) { $('#p-ck').innerHTML = ''; return; }
    var inn = +$('#p-in').value, out = +$('#p-out').value, len = out - inn, lim = +$('#p-lim').value, d = outDims(), L = [];
    L.push([len > 0.3, 'مدة المقطع ' + len.toFixed(1) + ' ث']);
    L.push([len <= lim, 'ضمن حدّ الأداة (' + lim + ' ث)' + (len > lim ? ': اقصّ المقطع أو غيّر الحد حسب شروط أداتك' : '')]);
    L.push([Math.max(d.w, d.h) >= 720, 'الدقة ' + d.w + '×' + d.h + (Math.max(d.w, d.h) < 720 ? ' (منخفضة، يفضّل 720 فأكثر)' : '')]);
    L.push([S.t ? Math.abs(d.ar - tc.width / tc.height) < 0.01 : true, S.t ? 'نسبة الصورة تطابق الفيديو' : 'لم تُرفع صورة الشخصية بعد']);
    $('#p-ck').innerHTML = L.map(function (x) { return '<div class="' + (x[0] ? 'ok' : 'wn') + '">' + (x[0] ? '✅ ' : '⚠ ') + x[1] + '</div>'; }).join('');
  }
  function bindR(id, u, f) { var e = $('#' + id), b = $('#' + id + 'v'); e.oninput = function () { b.textContent = (u === '%' ? e.value + '%' : (+e.value).toFixed(u === 's2' ? 2 : 1) + ' ث'); f && f(); }; }

  /* ---------- ① المرجع ---------- */
  $('#p-rf').onchange = function () {
    var f = this.files[0]; if (!f) return; S.r = f; rv.src = URL.createObjectURL(f); S.rb = null;
    rv.onloadedmetadata = function () {
      var d = rv.duration || 10; ['p-in', 'p-out'].forEach(function (i) { $('#' + i).max = d; });
      $('#p-in').value = 0; $('#p-out').value = Math.min(d, +$('#p-lim').value); $('#p-inv').textContent = '0.0 ث'; $('#p-outv').textContent = (+$('#p-out').value).toFixed(1) + ' ث';
      $('#p-ri').textContent = rv.videoWidth + '×' + rv.videoHeight + ' — ' + fmt(d);
      seek(rv, 0).then(function () { paintRef(); check(); });
    };
  };
  bindR('p-in', 's', function () { if (+$('#p-in').value >= +$('#p-out').value) $('#p-out').value = Math.min(+$('#p-in').value + 0.5, rv.duration || 10); seek(rv, +$('#p-in').value).then(function () { paintRef(); check(); }); });
  bindR('p-out', 's', check);
  ['p-fx', 'p-fy'].forEach(function (i) { bindR(i, '%', paintRef); });
  ['p-tx', 'p-ty'].forEach(function (i) { bindR(i, '%', paintTgt); });
  $('#p-ar').onchange = $('#p-hh').onchange = function () { paintRef(); paintTgt(); check(); };
  $('#p-lim').onchange = check;
  rv.addEventListener('seeked', function () { if (!S.busy) paintRef(); });

  function setBusy(b, ids) { S.busy = b;[].forEach.call(root.querySelectorAll('button'), function (x) { x.disabled = b && x.id !== 'p-ps'; }); }

  $('#p-rexp').onclick = async function () {
    if (!S.r) return ($('#p-m1').textContent = 'اختر فيديو المرجع أولًا.');
    if (!window.MediaRecorder) return ($('#p-m1').textContent = 'متصفحك لا يدعم التسجيل. استخدم Chrome أو Edge.');
    var inn = +$('#p-in').value, out = +$('#p-out').value, fps = +$('#p-fps').value, d = outDims(), mute = $('#p-mute').checked, fx = $('#p-fx').value / 100, fy = $('#p-fy').value / 100;
    if (out - inn < 0.3) return ($('#p-m1').textContent = 'المقطع قصير جدًا.');
    setBusy(true);
    try {
      var c2 = document.createElement('canvas'); c2.width = d.w; c2.height = d.h; var cx = c2.getContext('2d'), stream = c2.captureStream(fps), ac = null, dest = null, node = null;
      if (!mute) { try { ac = new AC(); await ac.resume(); node = ac.createMediaElementSource(rv); dest = ac.createMediaStreamDestination(); node.connect(dest); dest.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); }); } catch (e) { ac = null; } }
      var mime = pickMime('webm'), rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 8e6 } : { videoBitsPerSecond: 8e6 }), chunks = [];
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      var done = new Promise(function (ok) { rec.onstop = ok; });
      rv.pause(); await seek(rv, inn); rv.muted = false; rv.volume = 1; rv.playbackRate = 1;
      drawCrop(cx, rv, rv.videoWidth, rv.videoHeight, d, fx, fy); rec.start(250); await rv.play();
      await new Promise(function (ok) {
        function tick() { drawCrop(cx, rv, rv.videoWidth, rv.videoHeight, d, fx, fy); var p = clamp((rv.currentTime - inn) / (out - inn), 0, 1); $('#p-m1').textContent = 'جارٍ التصدير بزمن حقيقي… ' + Math.round(p * 100) + '%'; if (rv.currentTime >= out - 0.02 || rv.ended) return ok(); if (rv.requestVideoFrameCallback) rv.requestVideoFrameCallback(tick); else requestAnimationFrame(tick); }
        tick();
      });
      rv.pause(); await new Promise(function (r) { setTimeout(r, 300); }); rec.stop(); await done; try { ac && ac.close(); } catch (e) { }
      var ext = /mp4/.test(rec.mimeType) ? 'mp4' : 'webm', blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' });
      dl(blob, 'reference-prepared-' + d.w + 'x' + d.h + '.' + ext); $('#p-m1').textContent = 'تم ✅ الملف المجهّز ' + (blob.size / 1048576).toFixed(1) + ' م.ب. إن رفضته أداتك لصيغة WebM فحوّله إلى MP4 ببرنامج تحويل.';
    } catch (e) { $('#p-m1').textContent = 'تعذّر التصدير: ' + (e.message || e) + '. جرّب فيديو بصيغة MP4/WebM قياسية.'; }
    setBusy(false); seek(rv, inn).then(paintRef);
  };

  $('#p-fr').onclick = async function () {
    if (!S.r) return ($('#p-m1').textContent = 'اختر فيديو المرجع أولًا.');
    var inn = +$('#p-in').value, out = +$('#p-out').value, rate = +$('#p-frs').value, d = outDims(), fx = $('#p-fx').value / 100, fy = $('#p-fy').value / 100;
    var n = Math.min(400, Math.max(1, Math.floor((out - inn) * rate))); setBusy(true);
    try {
      var c2 = document.createElement('canvas'); c2.width = d.w; c2.height = d.h; var cx = c2.getContext('2d'), files = [];
      rv.pause();
      for (var i = 0; i < n; i++) {
        await seek(rv, inn + i / rate); drawCrop(cx, rv, rv.videoWidth, rv.videoHeight, d, fx, fy);
        var b = await new Promise(function (ok) { c2.toBlob(ok, 'image/png'); }); files.push({ name: 'frame_' + ('0000' + (i + 1)).slice(-4) + '.png', data: new Uint8Array(await b.arrayBuffer()) });
        $('#p-m1').textContent = 'استخراج الإطارات… ' + (i + 1) + '/' + n;
      }
      files.push({ name: 'info.json', data: new TextEncoder().encode(JSON.stringify({ frames: n, rate: rate, start: inn, end: out, width: d.w, height: d.h, source: S.r.name }, null, 2)) });
      dl(zip(files), 'reference-frames.zip'); $('#p-m1').textContent = 'تم ✅ ' + n + ' إطارًا في ملف ZIP.';
    } catch (e) { $('#p-m1').textContent = 'تعذّر الاستخراج: ' + (e.message || e); }
    setBusy(false); seek(rv, inn).then(paintRef);
  };

  $('#p-au').onclick = async function () {
    if (!S.r) return ($('#p-m1').textContent = 'اختر فيديو المرجع أولًا.');
    setBusy(true); $('#p-m1').textContent = 'جارٍ استخراج الصوت…';
    try {
      var buf = await decode(await S.r.arrayBuffer()), inn = +$('#p-in').value, out = +$('#p-out').value, sr = buf.sampleRate, a = Math.floor(inn * sr), b = Math.min(buf.length, Math.floor(out * sr)), chs = [];
      for (var c = 0; c < Math.min(2, buf.numberOfChannels); c++) chs.push(buf.getChannelData(c).slice(a, b));
      dl(wav(chs, sr), 'reference-audio.wav'); $('#p-m1').textContent = 'تم ✅ صوت المقطع. استخدمه مرجعًا لاستنساخ الصوت، أو اقرأ النص نفسه بصوتك.';
    } catch (e) { $('#p-m1').textContent = 'تعذّر فك الصوت من هذا الملف (قد لا يحتوي صوتًا).'; }
    setBusy(false);
  };

  /* ---------- ② الشخصية ---------- */
  $('#p-tf').onchange = function () {
    var f = this.files[0]; if (!f) return; var im = new Image(); im.onload = function () { S.t = im; paintTgt(); check(); }; im.src = URL.createObjectURL(f);
  };
  $('#p-texp').onclick = function () { if (!S.t) return; tc.toBlob(function (b) { dl(b, 'character-' + tc.width + 'x' + tc.height + '.png'); }, 'image/png'); };

  /* ---------- ④ التركيب ---------- */
  $('#p-xf').onchange = async function () {
    var f = this.files[0]; if (!f) return; S.x = f; xv.src = URL.createObjectURL(f); S.xb = null;
    xv.onloadedmetadata = function () { $('#p-xi').textContent = 'الفيديو ' + xv.videoWidth + '×' + xv.videoHeight + ' — ' + fmt(xv.duration); };
    try { S.xb = await decode(await f.arrayBuffer()); } catch (e) { S.xb = null; }
  };
  $('#p-vf').onchange = async function () {
    var f = this.files[0]; if (!f) return; try { S.vo = await decode(await f.arrayBuffer()); $('#p-m2').textContent = 'تم تحميل الصوت: ' + fmt(S.vo.duration); } catch (e) { $('#p-m2').textContent = 'تعذّر فك هذا الصوت.'; }
  };
  $('#p-vg').onclick = function () {
    if (!window.indexedDB) return ($('#p-m2').textContent = 'المتصفح لا يدعم ذلك.');
    var rq = indexedDB.open('dh_voice', 1); rq.onupgradeneeded = function () { rq.result.createObjectStore('k'); };
    rq.onsuccess = function () { var g = rq.result.transaction('k').objectStore('k').get('track'); g.onsuccess = function () { var r = g.result; if (!r) return ($('#p-m2').textContent = 'لا يوجد مسار مُرسَل. أرسله من مولّد الأصوات أولًا.'); var ac = new AC(), bf = ac.createBuffer(1, r.data.length, r.sr); bf.getChannelData(0).set(r.data); ac.close(); S.vo = bf; $('#p-m2').textContent = 'تم أخذ مسار المولّد: ' + fmt(bf.duration); }; };
  };
  bindR('p-off', 's2', null); $('#p-off').oninput = function () { $('#p-offv').textContent = (+this.value).toFixed(2) + ' ث'; };
  $('#p-vg2').oninput = function () { $('#p-vgv').textContent = Math.round(this.value * 100) + '%'; applyGain(); };
  $('#p-og').oninput = function () { $('#p-ogv').textContent = Math.round(this.value * 100) + '%'; applyGain(); };

  $('#p-al').onclick = function () {
    if (!S.xb || !S.vo) return ($('#p-m2').textContent = 'تحتاج فيديو نتيجة يحتفظ بصوته الأصلي وصوتًا مستنسخًا. إن لم يكن في الفيديو صوت فاضبط الإزاحة يدويًا.');
    var R = 50, a = envelope(S.xb, R), b = envelope(S.vo, R), r = bestLag(a, b, 3 * R), off = r.lag / R;
    if (r.score < 0.15) return ($('#p-m2').textContent = 'الارتباط ضعيف (' + r.score.toFixed(2) + '): الصوتان لا يتطابقان في الإيقاع. اضبط يدويًا.');
    $('#p-off').value = off.toFixed(2); $('#p-off').oninput(); $('#p-m2').textContent = 'تمت المحاذاة: إزاحة ' + off.toFixed(2) + ' ث (جودة الارتباط ' + r.score.toFixed(2) + '). راجع بالمعاينة.';
  };

  var P = { ac: null, src: null, node: null, gO: null, gV: null };
  function applyGain() { if (P.gO) { P.gO.gain.value = +$('#p-og').value; P.gV.gain.value = +$('#p-vg2').value; } }
  function stopP() { try { P.src && P.src.stop(); } catch (e) { } P.src = null; xv.pause(); }
  $('#p-ps').onclick = stopP;
  function graph(forRec) {
    if (!P.ac) { P.ac = new AC(); P.node = P.ac.createMediaElementSource(xv); P.gO = P.ac.createGain(); P.gV = P.ac.createGain(); P.node.connect(P.gO); }
    try { P.gO.disconnect(); P.gV.disconnect(); } catch (e) { }
    var dest = null; if (forRec) { dest = P.ac.createMediaStreamDestination(); P.gO.connect(dest); P.gV.connect(dest); } else { P.gO.connect(P.ac.destination); P.gV.connect(P.ac.destination); }
    applyGain(); return dest;
  }
  async function startAudio(off) {
    await P.ac.resume(); if (P.src) { try { P.src.stop(); } catch (e) { } }
    if (!S.vo) return;
    var s = P.ac.createBufferSource(); s.buffer = S.vo; s.connect(P.gV); var t0 = P.ac.currentTime + 0.05;
    if (off >= 0) s.start(t0 + off, 0); else s.start(t0, Math.min(-off, S.vo.duration - 0.01)); P.src = s;
  }
  $('#p-pv').onclick = async function () {
    if (!S.x) return ($('#p-m2').textContent = 'ارفع فيديو النتيجة أولًا.'); if (!S.vo) return ($('#p-m2').textContent = 'ارفع الصوت المستنسخ أولًا.');
    stopP(); graph(false); xv.currentTime = 0; await seek(xv, 0); await startAudio(+$('#p-off').value); await xv.play();
  };

  $('#p-xe').onclick = async function () {
    if (!S.x) return ($('#p-m2').textContent = 'ارفع فيديو النتيجة أولًا.'); if (!S.vo) return ($('#p-m2').textContent = 'ارفع الصوت المستنسخ أولًا.');
    if (!window.MediaRecorder) return ($('#p-m2').textContent = 'متصفحك لا يدعم التسجيل. استخدم Chrome أو Edge.');
    setBusy(true); stopP();
    try {
      var off = +$('#p-off').value, W = xv.videoWidth, H = xv.videoHeight, sc = Math.min(1, 1920 / Math.max(W, H)); W = Math.round(W * sc / 2) * 2; H = Math.round(H * sc / 2) * 2;
      var c2 = document.createElement('canvas'); c2.width = W; c2.height = H; var cx = c2.getContext('2d'), fps = 30, stream = c2.captureStream(fps), dest = graph(true);
      dest.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); });
      var mime = pickMime($('#p-fm').value), rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 10e6 } : { videoBitsPerSecond: 10e6 }), chunks = [];
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      var done = new Promise(function (ok) { rec.onstop = ok; });
      await seek(xv, 0); cx.drawImage(xv, 0, 0, W, H); rec.start(250);
      var vEnd = Math.max(0, off) + S.vo.duration - Math.max(0, -off), total = $('#p-fz').checked ? Math.max(xv.duration, vEnd) : xv.duration, t0 = performance.now();
      await startAudio(off); await xv.play();
      await new Promise(function (ok) {
        function tick() { var el = (performance.now() - t0) / 1000; if (!xv.ended && !xv.paused) cx.drawImage(xv, 0, 0, W, H); $('#p-m2').textContent = 'جارٍ التصدير بزمن حقيقي… ' + Math.round(clamp(el / total, 0, 1) * 100) + '%'; if (el >= total) return ok(); requestAnimationFrame(tick); }
        tick();
      });
      xv.pause(); try { P.src && P.src.stop(); } catch (e) { } await new Promise(function (r) { setTimeout(r, 300); }); rec.stop(); await done;
      var ext = /mp4/.test(rec.mimeType) ? 'mp4' : 'webm', blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' });
      dl(blob, 'final-performance.' + ext); $('#p-m2').textContent = 'تم ✅ الفيديو النهائي ' + (blob.size / 1048576).toFixed(1) + ' م.ب.';
    } catch (e) { $('#p-m2').textContent = 'تعذّر التصدير: ' + (e.message || e); }
    setBusy(false); graph(false);
  };

  window.PerfStudio = { zip: zip, crc32: crc32, envelope: envelope, bestLag: bestLag, cropRect: cropRect };
})();
