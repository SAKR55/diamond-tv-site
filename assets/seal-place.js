/* وضع الأختام والتوقيعات على أي مستند: سحب + حجم + دوران + شفافية. يقرأ من مكتبة مصمم الأختام (sg_lib). */
(function () {
  var W = window;
  var CSS = '.sp-layer{position:absolute;inset:0;pointer-events:none;z-index:5}.sp-i{position:absolute;pointer-events:auto;cursor:move;touch-action:none;user-select:none}.sp-i img{display:block;width:100%;height:auto;pointer-events:none;-webkit-user-drag:none}.sp-i.on{outline:2px dashed #7c3aed;outline-offset:3px}.sp-h{position:absolute;inset-inline-start:-9px;bottom:-9px;width:18px;height:18px;border-radius:50%;background:#7c3aed;border:2px solid #fff;cursor:nwse-resize;display:none}.sp-i.on .sp-h{display:block}' +
    '.spp{display:flex;flex-direction:column;gap:10px}.spp .r{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.spp .b{border:0;background:var(--soft,#e6e9f0);color:var(--ink,#14213d);border-radius:10px;padding:8px 12px;cursor:pointer;font:600 .85rem inherit}.spp .b.p{background:var(--acc,#e8590c);color:var(--acc-ink,#fff)}.spp .lib{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px}.spp .lib img{width:100%;border:1px solid var(--line,#d8dce5);border-radius:8px;cursor:pointer;background:repeating-conic-gradient(#e5e7eb 0 25%,#fff 0 50%) 0 0/12px 12px;padding:3px}.spp .ch{display:flex;gap:6px;flex-wrap:wrap}.spp .ch button{border:2px solid var(--line,#d8dce5);background:var(--card,#fff);border-radius:10px;padding:2px;cursor:pointer}.spp .ch button.on{border-color:var(--acc,#e8590c)}.spp .ch img{height:36px;display:block}.spp .g{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px 12px}.spp label{display:flex;flex-direction:column;gap:2px;font-size:.82rem;color:var(--mut,#667085)}.spp input[type=range]{width:100%;accent-color:var(--acc,#e8590c)}' +
    '@media print{.sp-i{outline:0!important}.sp-h{display:none!important}}';
  function $(s, r) { return (r || document).querySelector(s); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { } }
  W.SealPlace = {
    init: function (o) {
      var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      var host = $(o.host), mount = $(o.mount), key = 'sp_' + o.key, items = [], sel = -1, layers = [];
      try { items = JSON.parse(ls(key) || '[]'); } catch (e) { items = []; }
      function save() { try { localStorage.setItem(key, JSON.stringify(items)); } catch (e) { } }
      function boxes() { return [].slice.call(host.querySelectorAll(o.box)); }
      function build() {
        layers = [];
        boxes().forEach(function (bx) {
          if (getComputedStyle(bx).position === 'static') bx.style.position = 'relative';
          var old = bx.querySelector(':scope > .sp-layer'); if (old) old.remove();
          var ly = document.createElement('div'); ly.className = 'sp-layer'; bx.appendChild(ly); layers.push(ly);
          items.forEach(function (it, i) {
            var d = document.createElement('div'); d.className = 'sp-i' + (i === sel ? ' on' : ''); d.dataset.i = i;
            d.style.cssText = 'left:' + it.x + '%;top:' + it.y + '%;width:' + it.w + '%;transform:translate(-50%,-50%) rotate(' + it.r + 'deg)';
            d.innerHTML = '<img alt="" src="' + it.d + '" style="opacity:' + it.o / 100 + ';' + (it.m ? 'mix-blend-mode:multiply;' : '') + (it.f ? 'transform:scaleX(-1);' : '') + '"><span class="sp-h"></span>';
            ly.appendChild(d); bind(d, bx, i);
          });
        });
      }
      var drag = null;
      function bind(d, bx, i) {
        d.onmousedown = function (e) { e.preventDefault(); };
        d.onpointerdown = function (e) {
          e.preventDefault(); e.stopPropagation(); d.setPointerCapture(e.pointerId);
          sel = i; var r = bx.getBoundingClientRect(), it = items[i];
          drag = { mode: e.target.classList.contains('sp-h') ? 'rs' : 'mv', sx: e.clientX, sy: e.clientY, x0: it.x, y0: it.y, w0: it.w, r: r, i: i };
          refreshSel();
        };
        d.onpointermove = function (e) {
          if (!drag || drag.i !== i) return; var it = items[i], r = drag.r;
          if (drag.mode === 'mv') { it.x = Math.max(0, Math.min(100, drag.x0 + (e.clientX - drag.sx) / r.width * 100)); it.y = Math.max(0, Math.min(100, drag.y0 + (e.clientY - drag.sy) / r.height * 100)); }
          else { var cx = r.left + r.width * it.x / 100, cy = r.top + r.height * it.y / 100, dist = Math.hypot(e.clientX - cx, e.clientY - cy); it.w = Math.max(3, Math.min(100, dist * 2 / Math.SQRT2 / r.width * 100)); }
          place(); syncCtl();
        };
        d.onpointerup = d.onpointercancel = function () { if (drag) { drag = null; save(); } };
      }
      function place() { layers.forEach(function (ly) { [].forEach.call(ly.children, function (d) { var it = items[+d.dataset.i]; if (!it) return; d.style.left = it.x + '%'; d.style.top = it.y + '%'; d.style.width = it.w + '%'; d.style.transform = 'translate(-50%,-50%) rotate(' + it.r + 'deg)'; var im = d.firstChild; im.style.opacity = it.o / 100; im.style.mixBlendMode = it.m ? 'multiply' : ''; im.style.transform = it.f ? 'scaleX(-1)' : ''; }); }); }
      function refreshSel() { layers.forEach(function (ly) { [].forEach.call(ly.children, function (d) { d.classList.toggle('on', +d.dataset.i === sel); }); }); ui(); }
      function add(src) { items.push({ d: src, x: 75, y: 82, w: 24, r: 0, o: 92, m: 1, f: 0 }); sel = items.length - 1; save(); build(); ui(); }
      var LIB = function () { try { return JSON.parse(ls('sg_lib') || '[]'); } catch (e) { return []; } };
      var cur = null;
      function ui() {
        var lib = LIB(), it = items[sel];
        mount.innerHTML = '<div class="spp"><div class="r"><button type="button" class="b p" id="spAdd">+ إضافة ختم / توقيع من مكتبتي</button><label class="b" style="flex-direction:row;cursor:pointer">🖼 رفع صورة<input type="file" id="spUp" accept="image/*" hidden></label><a class="b" href="/tools/signature-stamp-designer/" target="_blank" rel="noopener" style="text-decoration:none">✍ استوديو الأختام</a></div>' +
          '<div class="lib" id="spLib" hidden>' + (lib.length ? lib.map(function (l, k) { return '<img src="' + l.d + '" data-k="' + k + '" alt="' + l.t + '">'; }).join('') : '<p style="grid-column:1/-1;font-size:.85rem;margin:0">مكتبتك فارغة. صمّم ختمًا أو توقيعًا واضغط «حفظ في مكتبتي»، أو ارفع صورة.</p>') + '</div>' +
          (items.length ? '<div class="ch">' + items.map(function (x, k) { return '<button type="button" data-s="' + k + '" class="' + (k === sel ? 'on' : '') + '"><img src="' + x.d + '" alt=""></button>'; }).join('') + '</div>' : '<p style="font-size:.85rem;margin:0;color:var(--mut,#667085)">أضف ختمًا أو توقيعًا، ثم اسحبه على المستند وحرّك مقبض الزاوية لتغيير الحجم.</p>') +
          (it ? '<div class="g"><label>الحجم: <output id="oW">' + Math.round(it.w) + '</output>%<input type="range" id="sW" min="3" max="100" value="' + it.w + '"></label><label>الدوران: <output id="oR">' + Math.round(it.r) + '</output>°<input type="range" id="sR" min="-180" max="180" value="' + it.r + '"></label><label>الشفافية: <output id="oO">' + it.o + '</output>%<input type="range" id="sO" min="15" max="100" value="' + it.o + '"></label><label>الموضع الأفقي: <output id="oX">' + Math.round(it.x) + '</output>%<input type="range" id="sX" min="0" max="100" value="' + it.x + '"></label><label>الموضع الرأسي: <output id="oY">' + Math.round(it.y) + '</output>%<input type="range" id="sY" min="0" max="100" value="' + it.y + '"></label></div>' +
            '<div class="r"><label class="b" style="flex-direction:row;gap:6px"><input type="checkbox" id="sM"' + (it.m ? ' checked' : '') + '> مزج واقعي مع الورق</label><label class="b" style="flex-direction:row;gap:6px"><input type="checkbox" id="sF"' + (it.f ? ' checked' : '') + '> قلب أفقي</label><button type="button" class="b" id="sC">توسيط</button><button type="button" class="b" id="sBL">أسفل يسار</button><button type="button" class="b" id="sBR">أسفل يمين</button><button type="button" class="b" id="sDup">تكرار</button><button type="button" class="b" id="sDel">حذف</button></div>' : '') + '</div>';
        var q = function (s) { return $(s, mount); };
        q('#spAdd').onclick = function () { var l = q('#spLib'); l.hidden = !l.hidden; };
        [].forEach.call(mount.querySelectorAll('#spLib img'), function (im) { im.onclick = function () { add(im.src); }; });
        q('#spUp').onchange = function (e) { var f = e.target.files[0]; e.target.value = ''; if (!f) return; var im = new Image(); im.onload = function () { var k = Math.min(1, 700 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); add(c.toDataURL('image/png')); }; im.src = URL.createObjectURL(f); };
        [].forEach.call(mount.querySelectorAll('.ch button'), function (b) { b.onclick = function () { sel = +b.dataset.s; refreshSel(); }; });
        if (!it) return;
        var bind2 = function (id, k, out, sc) { q(id).oninput = function () { it[k] = +this.value; var oo = q(out); if (oo) oo.textContent = Math.round(it[k]); place(); save(); }; };
        bind2('#sW', 'w', '#oW'); bind2('#sR', 'r', '#oR'); bind2('#sO', 'o', '#oO'); bind2('#sX', 'x', '#oX'); bind2('#sY', 'y', '#oY');
        q('#sM').onchange = function () { it.m = this.checked ? 1 : 0; place(); save(); };
        q('#sF').onchange = function () { it.f = this.checked ? 1 : 0; place(); save(); };
        q('#sC').onclick = function () { it.x = 50; it.y = 50; place(); save(); syncCtl(); };
        q('#sBL').onclick = function () { it.x = 22; it.y = 84; place(); save(); syncCtl(); };
        q('#sBR').onclick = function () { it.x = 78; it.y = 84; place(); save(); syncCtl(); };
        q('#sDup').onclick = function () { var c = JSON.parse(JSON.stringify(it)); c.x = Math.min(95, c.x + 6); c.y = Math.min(95, c.y + 6); items.push(c); sel = items.length - 1; save(); build(); ui(); };
        q('#sDel').onclick = function () { items.splice(sel, 1); sel = items.length - 1; save(); build(); ui(); };
      }
      function syncCtl() { var it = items[sel]; if (!it) return;[['W', 'w'], ['R', 'r'], ['O', 'o'], ['X', 'x'], ['Y', 'y']].forEach(function (p) { var s = $('#s' + p[0], mount), t = $('#o' + p[0], mount); if (s) s.value = it[p[1]]; if (t) t.textContent = Math.round(it[p[1]]); }); }
      var mo = new MutationObserver(function () { var bs = boxes(); if (bs.length !== layers.length || bs.some(function (b, k) { return !layers[k] || layers[k].parentNode !== b; })) { mo.disconnect(); build(); mo.observe(host, { childList: true, subtree: true }); } });
      mo.observe(host, { childList: true, subtree: true });
      host.addEventListener('pointerdown', function (e) { if (!e.target.closest('.sp-i') && sel !== -1) { sel = -1; refreshSel(); } });
      window.addEventListener('storage', function (e) { if (e.key === 'sg_lib') ui(); });
      build(); ui();
    }
  };
})();
