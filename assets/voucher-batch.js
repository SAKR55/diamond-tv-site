/* إنشاء سندات دفعة واحدة من Excel / CSV / PDF (كشف رواتب أو مصروفات). يعمل داخل المتصفح. */
(function () {
  var AR = /[؀-ۿﭐ-﷿ﹰ-﻿]/;
  var host = document.getElementById('batchpanel'); if (!host) return;
  var PV = null, ROWS = [], REC = [], SH = [], ZIPF = null;
  var $ = function (s) { return host.querySelector(s); };
  function nz(s) { s = String(s == null ? '' : s).replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 1632; }).replace(/[۰-۹]/g, function (c) { return c.charCodeAt(0) - 1776; }); if (/[ﭐ-﷿ﹰ-﻿]/.test(s)) s = s.normalize('NFKC'); return s.replace(/[‎‏‪-‮]/g, '').trim(); }
  function num(s) { var m = nz(s).replace(/[,٬\s]/g, '').replace(/٫/g, '.').match(/-?\d+(?:\.\d+)?/); return m ? parseFloat(m[0]) : NaN; }
  function loadScript(s) { return new Promise(function (ok, no) { if (document.querySelector('script[data-l="' + s + '"]')) return ok(); var e = document.createElement('script'); e.src = s; e.dataset.l = s; e.onload = ok; e.onerror = function () { no(new Error('load ' + s)); }; document.head.appendChild(e); }); }
  function getZip() { return window.JSZip ? Promise.resolve(window.JSZip) : loadScript('/assets/vendor/jszip/jszip.min.js').then(function () { return window.JSZip; }); }
  var _pj = null; function getPdfjs() { if (_pj) return _pj; _pj = import('/assets/vendor/pdfjs/pdf.min.mjs').then(function (m) { m.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdfjs/pdf.worker.min.mjs'; return m; }); return _pj; }
  function rd(f, t) { return new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(r.result); }; r.onerror = no; t ? r.readAsText(f) : r.readAsArrayBuffer(f); }); }
  var CSS = '.bt{width:100%;border-collapse:collapse;font-size:.82rem;margin-top:8px}.bt th,.bt td{border:1px solid var(--line,#d8dce5);padding:4px 7px;text-align:right;white-space:nowrap;max-width:200px;overflow:hidden;text-overflow:ellipsis}.bt th{background:var(--soft,#e6e9f0)}.bsc{overflow:auto;max-height:260px;border-radius:10px}.bgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px 12px;margin-top:10px}.bgrid label{display:flex;flex-direction:column;gap:2px;font-size:.82rem;color:var(--mut,#667085)}.bgrid input[type=text],.bgrid input[type=number],.bgrid select{background:var(--field,#f7f8fb);border:1px solid var(--line,#d8dce5);border-radius:10px;padding:8px 10px;width:100%}.bres{margin-top:12px;font-weight:600}.bpages{display:none}' +
    '@media print{body.batch .wrap>*:not(#bprint){display:none!important}body.batch .wrap>#bprint{display:block!important}body.batch .wrap{padding:0!important;max-width:none!important}#bprint .bp{page-break-after:always;break-after:page;padding:8mm 0}#bprint .bp.per2{page-break-after:auto;break-after:auto;page-break-inside:avoid;break-inside:avoid;padding:3mm 0}#bprint .bp.brk{page-break-after:always;break-after:page}#bprint .bp:last-child{page-break-after:auto}}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  host.innerHTML = '<p class="hint" style="margin-top:0">ارفع كشف رواتب أو مصروفات (Excel .xlsx أو CSV أو PDF) فيُنشأ سند لكل صف تلقائيًا، ثم تطبعها كلها دفعة واحدة. لا يُرفع الملف لأي خادم.</p>' +
    '<div class="acts" style="margin-top:0"><label class="btn" style="cursor:pointer;flex-direction:row">📂 رفع ملف (Excel / CSV / PDF)<input type="file" id="bf" accept=".xlsx,.csv,.txt,.pdf" hidden></label><button class="btn alt" id="bpaste" type="button">لصق جدول من Excel</button></div>' +
    '<textarea id="bta" hidden placeholder="انسخ الأعمدة من Excel والصقها هنا (الصف الأول عناوين)" style="margin-top:8px;min-height:90px"></textarea><div class="acts" id="bpa" hidden style="margin-top:6px"><button class="btn" id="bpar" type="button">قراءة الجدول</button></div>' +
    '<div id="bsheet" class="bgrid" hidden></div><div id="bprev"></div><div id="bmap" hidden></div><div class="bres" id="bres"></div><div class="acts" id="bact" hidden></div><div id="bout"></div>';
  var $f = $('#bf');
  $('#bpaste').onclick = function () { $('#bta').hidden = !$('#bta').hidden; $('#bpa').hidden = $('#bta').hidden; };
  $('#bpar').onclick = function () { ROWS = parseText($('#bta').value); afterParse(); };
  function parseText(t) { var d = /\t/.test(t) ? '\t' : (t.split(';').length > t.split(',').length ? ';' : ','), rows = [], r = [], c = '', q = false; for (var i = 0; i < t.length; i++) { var ch = t[i]; if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; } else if (ch === '"') q = true; else if (ch === d) { r.push(c); c = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; r.push(c); c = ''; if (r.some(function (x) { return x.trim(); })) rows.push(r); r = []; } else c += ch; } r.push(c); if (r.some(function (x) { return x.trim(); })) rows.push(r); return rows.map(function (r) { return r.map(function (x) { return nz(x); }); }); }
  function colIdx(ref) { var s = ref.replace(/\d/g, ''), n = 0; for (var i = 0; i < s.length; i++) n = n * 26 + s.charCodeAt(i) - 64; return n - 1; }
  function xml(s) { return new DOMParser().parseFromString(s, 'application/xml'); }
  function readXlsx(buf) {
    return getZip().then(function (Z) { return Z.loadAsync(buf); }).then(function (z) {
      ZIPF = z; var wb = z.file('xl/workbook.xml'), rel = z.file('xl/_rels/workbook.xml.rels');
      if (!wb) throw new Error('bad');
      return Promise.all([wb.async('string'), rel ? rel.async('string') : '', z.file('xl/sharedStrings.xml') ? z.file('xl/sharedStrings.xml').async('string') : '']).then(function (a) {
        var w = xml(a[0]), rl = a[1] ? xml(a[1]) : null, rm = {};
        if (rl) [].forEach.call(rl.getElementsByTagName('Relationship'), function (r) { rm[r.getAttribute('Id')] = r.getAttribute('Target'); });
        SH = [].map.call(w.getElementsByTagName('sheet'), function (s, i) { var rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'), t = rm[rid] || ('worksheets/sheet' + (i + 1) + '.xml'); t = t.replace(/^\//, ''); if (!/^xl\//.test(t)) t = 'xl/' + t; return { n: s.getAttribute('name'), p: t }; });
        var ss = []; if (a[2]) [].forEach.call(xml(a[2]).getElementsByTagName('si'), function (si) { var t = ''; [].forEach.call(si.getElementsByTagName('t'), function (x) { t += x.textContent; }); ss.push(t); });
        ZIPF.ss = ss; return loadSheet(0);
      });
    });
  }
  function loadSheet(k) {
    var f = ZIPF.file(SH[k].p); if (!f) return [];
    return f.async('string').then(function (x) {
      var d = xml(x), rows = [];
      [].forEach.call(d.getElementsByTagName('row'), function (r) { var row = []; [].forEach.call(r.getElementsByTagName('c'), function (c) { var i = colIdx(c.getAttribute('r') || 'A1'), t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0], val = ''; if (t === 's') val = ZIPF.ss[+(v ? v.textContent : 0)] || ''; else if (t === 'inlineStr') val = c.textContent; else val = v ? v.textContent : ''; row[i] = nz(val); }); for (var j = 0; j < row.length; j++) if (row[j] === undefined) row[j] = ''; if (row.some(function (q) { return q; })) rows.push(row); });
      return rows;
    });
  }
  function rev(w) { return w.split('').reverse().join(''); }
  function fixVis(c) { if (!c.v) return c.t; var t = c.p.map(function (q) { var x = q.s; if (!q.pf && x.length > 1 && /[\u0600-\u06FF]/.test(x)) x = rev(x); return (q.sp ? ' ' : '') + x; }).join('');
    return t.split(' ').reverse().map(function (w) { return /[\u0600-\u06FF]/.test(w) ? rev(w).replace(/[0-9.,]+/g, rev) : w; }).join(' '); }
  function lam(x) { return x.replace(/[\uFEF5\uFEF6]/g, 'آل').replace(/[\uFEF7\uFEF8]/g, 'أل').replace(/[\uFEF9\uFEFA]/g, 'إل').replace(/[\uFEFB\uFEFC]/g, 'ال'); }
  function readPdfLines(buf) {
    return getPdfjs().then(function (m) { return m.getDocument({ data: new Uint8Array(buf), disableFontFace: true, useSystemFonts: false, standardFontDataUrl: '/assets/vendor/pdfjs/standard_fonts/', cMapUrl: '/assets/vendor/pdfjs/cmaps/', cMapPacked: true, wasmUrl: '/assets/vendor/pdfjs/wasm/', iccUrl: '/assets/vendor/pdfjs/iccs/' }).promise; }).then(function (pdf) {
      var out = [], i = 1;
      return new Promise(function (ok, no) {
        (function step() { if (i > pdf.numPages) return ok(out); pdf.getPage(i).then(function (pg) { return pg.getTextContent(); }).then(function (tc) {
          var its = []; tc.items.forEach(function (it) { if (it.str && it.str.trim()) its.push({ v: /[\uFB50-\uFDFF\uFE70-\uFEFF]/.test(it.str), s: nz(lam(it.str)), x: it.transform[4], y: it.transform[5], w: it.width, h: it.height || 10 }); });
          its.sort(function (a, b) { return b.y - a.y || a.x - b.x; }); var rows = [];
          its.forEach(function (it) { var r = rows[rows.length - 1]; if (r && Math.abs(r.y - it.y) <= Math.max(2, Math.min(r.h, it.h) * .5)) r.it.push(it); else rows.push({ y: it.y, h: it.h, it: [it] }); });
          rows.forEach(function (r) { r.it.sort(function (a, b) { return a.x - b.x; }); var cells = [], c = null; r.it.forEach(function (it) { if (c && it.x - c.x1 < Math.max(r.h * .6, 4)) { var sp = it.x - c.x1 > r.h * .15; c.t += (sp ? ' ' : '') + it.s; c.p.push({ s: it.s, sp: sp, pf: it.v }); c.x1 = Math.max(c.x1, it.x + it.w); c.v = c.v || it.v; } else { c = { t: it.s, x1: it.x + it.w, v: it.v, p: [{ s: it.s, sp: false, pf: it.v }] }; cells.push(c); } });
            var txt = cells.map(function (q) { return fixVis(q); }), ar = AR.test(txt.join('')); if (ar) txt.reverse(); if (txt.length) out.push(txt); });
          i++; step(); }).catch(no); })();
      });
    });
  }

  var META = {};
  function fixLA(t) { return t.replace(/(^|[\s\/(])ا([أإآا])ل/g, '$1ال$2').replace(/هللا/g, 'الله').replace(/[إا]ل?كي?ر? ?ونية/g, 'إلكترونية'); }
  var MONRX = /(يناير|فبراير|مارس|[أإا]بريل|مايو|يونيو|يوليو|[أا]غسطس|سبتمبر|[أا]كتوبر|نوفمبر|ديسمبر)/;
  function cellText(list) {
    var main = list.filter(function (x) { return x.w > 0.5; }).sort(function (a, b) { return b.y - a.y; }), zw = list.filter(function (x) { return x.w <= 0.5; }), lines = [];
    main.forEach(function (it) { var l = lines[lines.length - 1]; if (l && Math.abs(l.y - it.y) <= 2.6) l.it.push(it); else lines.push({ y: it.y, it: [it] }); });
    if (!lines.length) return '';
    zw.forEach(function (z) { var b = null, bd = 99; lines.forEach(function (l) { var d = Math.abs(l.y - z.y); if (d < bd) { bd = d; b = l; } }); if (b && bd <= 4.5) b.it.push(z); });
    return lines.map(function (l) {
      if (!l.it.some(function (q) { return q.v; })) {
        var wi = l.it.filter(function (q) { return q.w > .5; }).map(function (q) { return { x: q.x, e: q.x + q.w, s: q.s, lead: q.lead, trail: q.trail, h: q.h }; });
        l.it.filter(function (q) { return q.w <= .5; }).forEach(function (z) { var b = null, bd = 1e9; wi.forEach(function (q) { if (z.x >= q.x - 1.5 && z.x <= q.e + 1.5 && Math.abs(z.x - q.x) < bd) { bd = Math.abs(z.x - q.x); b = q; } }); if (b) b.s += z.s; else wi.push({ x: z.x, e: z.x, s: z.s, h: 8 }); });
        wi.sort(function (a, b) { return b.x - a.x; });
        return wi.reduce(function (t, q, k) { if (!k) return q.s; var pv = wi[k - 1], sp = pv.e - q.e > -1 && (pv.x - q.e > Math.max(q.h, 6) * .15) || ((q.lead || pv.trail) && pv.s.length > 1 && q.s.length > 1) || (pv.s.length > 3 && q.s.length > 3); return t + (sp ? ' ' : '') + q.s; }, '');
      }
      l.it.sort(function (a, b) { return a.x - b.x; });
      var c = null, prev = null;
      l.it.forEach(function (it) { var sp = prev && (it.x - prev.e > Math.max(it.h, 6) * .15 || prev.lead || it.trail); if (!c) c = { t: it.s, v: it.v, p: [{ s: it.s, sp: false, pf: it.v }] }; else { c.t += (sp ? ' ' : '') + it.s; c.v = c.v || it.v; c.p.push({ s: it.s, sp: !!sp, pf: it.v }); } prev = { e: Math.max(prev ? prev.e : -1e9, it.x + it.w), lead: it.lead }; });
      return fixVis(c);
    }).join(' ').replace(/\s+/g, ' ').trim();
  }
  function tableFromItems(its) {
    var an = findAnchors(its);
    if (an.length < 2) return null;
    var cnt = {}; an.forEach(function (a) { var k = Math.round(a.x / 4); cnt[k] = (cnt[k] || 0) + 1; }); var bk = null; for (var k in cnt) if (bk === null || cnt[k] > cnt[bk]) bk = k;
    an = an.filter(function (a) { return Math.abs(Math.round(a.x / 4) - bk) <= 1; }).sort(function (a, b) { return b.y - a.y; });
    if (an.length < 2) return null;
    var gp = []; for (var i = 1; i < an.length; i++) gp.push(an[i - 1].y - an[i].y); gp.sort(function (a, b) { return a - b; }); var sp = gp[Math.floor(gp.length / 2)] || 10, cap = Math.max(3.5, sp * .5);
    var data = an.map(function () { return []; }), head = [], anc = {}; an.forEach(function (a, i) { anc[an.indexOf(a)] = 1; data[i].push(a); });
    its.forEach(function (it) { if (an.indexOf(it) >= 0) return; var bi = -1, bd = 1e9; an.forEach(function (a, i) { var d = Math.abs(a.y - it.y); if (d < bd) { bd = d; bi = i; } }); if (bd <= cap) data[bi].push(it); else if (it.y > an[0].y && it.y - an[0].y < 400) head.push(it); });
    var iv = []; data.forEach(function (r) { r.forEach(function (it) { if (it.w > 0.5) iv.push([it.x, it.x + it.w]); }); }); iv.sort(function (a, b) { return a[0] - b[0]; });
    var cols = []; iv.forEach(function (q) { var c = cols[cols.length - 1]; if (c && q[0] - c[1] < 4) c[1] = Math.max(c[1], q[1]); else cols.push([q[0], q[1]]); });
    var colOf = function (x, w, tol) { var cx = x + w / 2, b = -1, bd = 1e9; cols.forEach(function (c, j) { if (cx >= c[0] - tol && cx <= c[1] + tol) { var d = Math.abs(cx - (c[0] + c[1]) / 2); if (d < bd) { bd = d; b = j; } } }); return b; };
    // header zone
    var hm = head.filter(function (x) { return x.w > 0.5; }).sort(function (a, b) { return a.y - b.y; }), hl = [];
    hm.forEach(function (it) { var l = hl[hl.length - 1]; if (l && Math.abs(it.y - l.y) <= 2.6) l.it.push(it); else hl.push({ y: it.y, it: [it] }); });
    var inc = [], prev = an[0].y; for (var q = 0; q < hl.length; q++) { var gap = hl[q].y - prev, lim = q === 0 ? Math.max(18, sp * 2.3) : Math.max(9, sp * 1.2); if (gap > lim) break; inc.push(hl[q]); prev = hl[q].y; }
    var top = inc.length ? inc[inc.length - 1].y + 3 : an[0].y + 3, hz = head.filter(function (x) { return x.y <= top; }), hc = cols.map(function () { return []; });
    hz.forEach(function (it) { var j = colOf(it.x, it.w, it.w > .5 ? 6 : 16); if (j >= 0) hc[j].push(it); });
    var ar = false, rows = data.map(function (r) { var cc = cols.map(function () { return []; }); r.forEach(function (it) { var j = colOf(it.x, it.w, it.w > .5 ? 1.5 : 6); if (j >= 0) cc[j].push(it); }); return cc.map(cellText); });
    ar = AR.test(rows.slice(0, 5).map(function (r) { return r.join(''); }).join('')); var hd = hc.map(cellText).map(function (t, j) { return t || ('عمود ' + (j + 1)); });
    var ord = cols.map(function (c, j) { return j; }); if (ar) ord.reverse();
    var out = [ord.map(function (j) { return hd[j]; })].concat(rows.map(function (r) { return ord.map(function (j) { return r[j]; }); }));
    // meta: month / year
    var txt = its.filter(function (x) { return x.y > an[0].y; }).map(function (x) { return x.s; }).join(' '), mm = txt.match(MONRX), yy = txt.match(/\b(20\d\d)\b/); META = { month: mm ? mm[1] : '', year: yy ? yy[1] : '' };
    return out.map(function (r) { return r.map(function (t) { return fixLA(t); }); });
  }

  function findAnchors(its) {
    var a = its.filter(function (it) { return /^[A-Za-z]{1,6}\s*[\/\-]\s*\d{2,}$/.test(it.s); }); if (a.length >= 2) return a;
    var cand = its.filter(function (it) { return it.w > .5 && /^[A-Za-z0-9\-\/]{1,14}$/.test(it.s) && /\d/.test(it.s); }), bs = {};
    cand.forEach(function (it) { var k = Math.round(it.x / 5); (bs[k] = bs[k] || []).push(it); });
    var best = null, bsc = 0;
    Object.keys(bs).forEach(function (k) {
      var l = (bs[+k - 1] || []).concat(bs[k], bs[+k + 1] || []), seen = {}; l = l.filter(function (it) { var kk = Math.round(it.y); if (seen[kk]) return false; seen[kk] = 1; return Math.abs(it.x - bs[k][0].x) <= 7; });
      if (l.length < 3) return; l.sort(function (x, y) { return y.y - x.y; });
      var vs = l.map(function (it) { return it.s; }), du = {}; vs.forEach(function (v) { du[v] = 1; }); if (Object.keys(du).length < l.length * .9) return;
      var sc = 0; if (vs.every(function (v) { return /^\d{1,4}$/.test(v); })) { var st = 0; for (var i = 1; i < vs.length; i++) if (+vs[i] === +vs[i - 1] + 1) st++; if (st >= (vs.length - 1) * .7) sc = 3 * l.length; }
      else if (vs.every(function (v) { return /[A-Za-z]/.test(v) || v.length >= 6; })) sc = 2 * l.length;
      if (sc > bsc) { bsc = sc; best = l; }
    });
    return best || [];
  }
  function isNumS(v) { return /^[\s\-\(]*[\d.,٬]+\)?\s*(ر\.?س|SAR|ريال)?\s*$/i.test(nz(v)); }
  function smart() {
    var lim = Math.min(25, ROWS.length), bi = 0, bn = 0, bm = {};
    for (var i = 0; i < lim; i++) { var g = guess(ROWS[i].map(function (c) { return c || ''; })), n = Object.keys(g).length + (g.n !== undefined ? 1 : 0) + (g.a !== undefined ? 1 : 0); if (n > bn) { bn = n; bi = i; bm = g; } }
    var w0 = Math.max.apply(null, ROWS.map(function (r) { return r.length; }));
    if (bn >= 1) { ROWS = ROWS.slice(bi); MAP = bm; } else { var h = []; for (var k = 0; k < w0; k++) h.push('عمود ' + (k + 1)); ROWS = [h].concat(ROWS); MAP = {}; }
    var body = ROWS.slice(1, 80), used = function (j) { return Object.keys(MAP).some(function (f) { return MAP[f] === j; }); }, st = [];
    for (var j = 0; j < w0; j++) { var c = body.map(function (r) { return nz(r[j]); }).filter(Boolean), nn = c.filter(isNumS).length, idl = c.filter(function (v) { return /^[A-Za-z]{0,6}[\/\-]?\d{3,}$/.test(v) && (/[A-Za-z\/\-]/.test(v) || v.length >= 9); }).length, tx = c.filter(function (v) { return !isNumS(v) && /[A-Za-z؀-ۿ]{2,}/.test(v); }).length, len = c.reduce(function (a, v) { return a + v.length; }, 0) / (c.length || 1); st.push({ c: c.length, nn: nn / (c.length || 1), idl: idl / (c.length || 1), tx: tx / (c.length || 1), len: len }); }
    if (MAP.n === undefined) { var bj = -1, bv = 0; st.forEach(function (q, j) { if (!used(j) && q.tx >= .6 && q.idl < .5 && q.len >= 4 && q.c * q.len > bv) { bv = q.c * q.len; bj = j; } }); if (bj >= 0) MAP.n = bj; }
    if (MAP.i === undefined) { st.forEach(function (q, j) { if (MAP.i === undefined && !used(j) && q.idl >= .6) MAP.i = j; }); }
    if (MAP.a === undefined) { var lj = -1; st.forEach(function (q, j) { if (!used(j) && q.nn >= .6 && q.c >= 1) lj = j; }); if (lj >= 0) MAP.a = lj; }
  }
  function readPdf(buf) {
    return getPdfjs().then(function (m) { return m.getDocument({ data: new Uint8Array(buf.slice(0)), disableFontFace: true, useSystemFonts: false, standardFontDataUrl: '/assets/vendor/pdfjs/standard_fonts/', cMapUrl: '/assets/vendor/pdfjs/cmaps/', cMapPacked: true, wasmUrl: '/assets/vendor/pdfjs/wasm/', iccUrl: '/assets/vendor/pdfjs/iccs/' }).promise; }).then(function (pdf) {
      var its = [], i = 1;
      return new Promise(function (ok, no) { (function step() { if (i > pdf.numPages) return ok(its); var pn = i; pdf.getPage(i).then(function (pg) { return pg.getTextContent(); }).then(function (tc) { tc.items.forEach(function (it) { if (it.str && it.str.trim()) its.push({ raw: it.str, v: /[ﭐ-﷿ﹰ-﻿]/.test(it.str), s: nz(lam(it.str)), lead: /^\s/.test(it.str), trail: /\s$/.test(it.str), x: it.transform[4], y: it.transform[5] - (pn - 1) * 5000, w: it.width, h: it.height || 10 }); }); i++; step(); }).catch(no); })(); });
    }).then(function (its) { var t = null; try { t = tableFromItems(its); } catch (e) { t = null; } if (t && t.length > 1) return t; META = {}; return readPdfLines(buf); });
  }
  $f.onchange = function (e) {
    var f = e.target.files[0]; e.target.value = ''; if (!f) return; var n = f.name.toLowerCase(); $('#bres').textContent = 'جارٍ قراءة الملف…'; ZIPF = null; SH = []; META = {}; $('#bsheet').hidden = true;
    var p;
    if (/\.xlsx$/.test(n)) p = rd(f).then(readXlsx);
    else if (/\.pdf$/.test(n)) p = rd(f).then(readPdf);
    else if (/\.xls$/.test(n)) { $('#bres').textContent = 'صيغة .xls القديمة غير مدعومة. افتح الملف في Excel واحفظه بصيغة .xlsx أو CSV ثم ارفعه.'; return; }
    else p = rd(f, true).then(parseText);
    p.then(function (r) { ROWS = r; afterParse(); }).catch(function () { $('#bres').textContent = 'تعذّر قراءة الملف. جرّب حفظه بصيغة CSV أو لصق الجدول.'; });
  };
  var HDR = true, MAP = {};
  var BKADD = /أساسي|مستحق|بدل|عمولة|إضافي|اضافي|مكافأة|مكافاة|حوافز|basic|allowance|bonus|overtime|commission|incentive/i, BKSUB = /خصم|سلفة|تأمينات|غياب|جزاء|استقطاع|deduction|gosi|loan|advance|penalty|absence/i;
  var FIELDS = [['n', 'الاسم / الجهة *'], ['a', 'المبلغ *'], ['d', 'البيان / الوصف'], ['i', 'رقم الهوية / الموظف'], ['r', 'المرجع / الآيبان / البنك'], ['p', 'الوظيفة'], ['g', 'القسم / الإدارة'], ['b', 'الفرع']];
  function guess(h) { var rules = { n: [/اسم|name/i, /الموظف|المستفيد|الجهة|employee|beneficiary|payee/i], p: [/الوظيفة|المسمى|المهنة|\bjob\b|title|position/i], g: [/قسم|إدارة|department|dept/i], b: [/فرع|branch/i, /مكان العمل|الموقع|location/i], a: [/صافي|net/i, /المبلغ|amount|قيمة|value/i, /راتب|salary|pay/i, /إجمالي|اجمالي|total/i], d: [/بيان|وصف|ملاحظ|description|note|details|remark/i], i: [/الرقم الوظيفي|رقم الموظف|هوية|إقامة|اقامة|\bid\b|iqama|emp/i], r: [/آيبان|ايبان|iban|بنك|bank|مرجع|ref|حساب|account/i] }, m = {}; for (var k in rules) { for (var q = 0; q < rules[k].length && m[k] === undefined; q++) h.forEach(function (c, i) { if (m[k] === undefined && rules[k][q].test(c)) m[k] = i; }); } return m; }
  function numCol(j) { var c = ROWS.slice(1, 80).map(function (r) { return nz(r[j]); }).filter(Boolean); return c.length >= 1 && c.filter(isNumS).length / c.length >= .8; }
  function bkOpts(rx) { var o = ''; for (var j = 0; j < ROWS[0].length; j++) { var h = ROWS[0][j] || ('عمود ' + (j + 1)); o += '<option value="' + j + '"' + ((rx.test(h) || (rx === BKADD && numCol(j) && !BKSUB.test(h))) && !/مجموع|إجمالي|اجمالي|صافي|total|net|gross/i.test(h) && Object.keys(MAP).every(function (f) { return MAP[f] !== j; }) ? ' selected' : '') + '>' + h.slice(0, 30) + '</option>'; } return o; }
  function afterParse() {
    if (!ROWS.length) { $('#bres').textContent = 'لم يُعثر على صفوف في الملف.'; return; }
    var w = Math.max.apply(null, ROWS.map(function (r) { return r.length; }));
    HDR = true; smart(); w = Math.max.apply(null, ROWS.map(function (r) { return r.length; }));
    if (SH.length > 1) { $('#bsheet').hidden = false; $('#bsheet').innerHTML = '<label>الورقة<select id="bsel">' + SH.map(function (s, i) { return '<option value="' + i + '">' + s.n + '</option>'; }).join('') + '</select></label>'; $('#bsel').onchange = function () { loadSheet(+this.value).then(function (r) { ROWS = r; afterParse(); }); }; }
    var pv = ROWS.slice(0, 8), opts = function (sel) { var o = '<option value="">— بدون —</option>'; for (var j = 0; j < w; j++) o += '<option value="' + j + '"' + (sel === j ? ' selected' : '') + '>' + (HDR && ROWS[0][j] ? ROWS[0][j].slice(0, 28) : 'عمود ' + (j + 1)) + '</option>'; return o; };
    function pvHtml() { var inv = {}; FIELDS.forEach(function (f) { if (MAP[f[0]] !== undefined) inv[MAP[f[0]]] = (inv[MAP[f[0]]] ? inv[MAP[f[0]]] + ' + ' : '') + f[1].replace(/ \*|\s*\/.*/g, ''); });
      var bkc = {}; ['bka', 'bks'].forEach(function (id) { var e = $('#' + id); if (e) [].forEach.call(e.selectedOptions, function (o) { bkc[+o.value] = id === 'bka' ? 'بند +' : 'خصم −'; }); });
      var bad = '<tr>' + Array.apply(null, Array(w)).map(function (_, c) { var t = inv[c] || bkc[c] || ''; return '<td style="background:' + (inv[c] ? '#dcfce7' : bkc[c] ? '#fef9c3' : 'transparent') + ';font-size:.7rem;font-weight:700;text-align:center">' + t + '</td>'; }).join('') + '</tr>';
      return '<div class="bsc" style="max-height:340px"><table class="bt"><thead>' + bad + '</thead><tbody>' + ROWS.slice(0, 300).map(function (r, ri) { var h = ''; for (var c = 0; c < w; c++) h += (ri === 0 ? '<th>' : '<td>') + (r[c] == null ? '' : r[c].replace(/</g, '&lt;')) + (ri === 0 ? '</th>' : '</td>'); return '<tr>' + h + '</tr>'; }).join('') + '</tbody></table></div><p class="hint">' + (ROWS.length - 1) + ' صفًا (موظف/سجل) تم استخراجها. الأخضر = الحقول المطابقة، الأصفر = بنود السند. عدّل الاختيار أدناه إن لزم.</p>'; }
    PV = pvHtml; $('#bprev').innerHTML = pvHtml();
    $('#bmap').hidden = false;
    $('#bmap').innerHTML = '<div class="bgrid">' + FIELDS.map(function (f) { return '<label>' + f[1] + '<select data-f="' + f[0] + '">' + opts(MAP[f[0]]) + '</select></label>'; }).join('') +
      '<label class="full" style="grid-column:1/-1">أعمدة تفصيل الاستحقاقات (أجر أساسي، بدلات…) — تُعرض كبنود إضافة<select id="bka" multiple size="4">'+bkOpts(BKADD)+'</select></label><label class="full" style="grid-column:1/-1">أعمدة الخصومات (سلف، تأمينات، غياب…)<select id="bks" multiple size="4">'+bkOpts(BKSUB)+'</select></label><label>الصف الأول عناوين<select id="bh"><option value="1">نعم (تخطّيه)</option><option value="0">لا (كل الصفوف بيانات)</option></select></label>' +
      '<div class="full" style="grid-column:1/-1;border:1px dashed #94a3b8;border-radius:10px;padding:10px"><b>➕ بنود يدوية تُضاف لكل السندات (بدلات / خصومات)</b><div class="hint" style="font-size:.8rem;margin:4px 0 8px">مثال: بدل طعام 300 لكل موظف، أو تأمينات 9.75% من الأجر الأساسي. تُضاف فوق أعمدة الملف ويُحسب الصافي تلقائيًا.</div><div id="bman"></div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button type="button" class="btn alt" id="bmadd">+ بند يدوي</button><button type="button" class="btn alt" id="bmgosi">+ تأمينات 9.75%</button><button type="button" class="btn alt" id="bmfood">+ بدل طعام</button></div></div>'+
      '<label>نوع السند<select id="bt">'+Object.keys(VT).filter(function(k){return !VT[k].jv}).map(function(k){return '<option value="'+k+'"'+(k==='p'?' selected':'')+'>'+VT[k].ta+'</option>'}).join('')+'</select></label>' +
      '<label>البيان (يمكن استخدام {الاسم} {المبلغ} {البيان} {الوظيفة} {القسم} {الفرع})<input type="text" id="bd" value="راتب شهر ' + (META.month ? META.month + ' ' + (META.year || '') : ((new Date()).getMonth() + 1) + '/' + (new Date()).getFullYear()) + '"></label>' +
      '<label>طريقة الدفع<select id="bm"><option>تحويل بنكي</option><option>نقدًا</option><option>شيك</option><option>بطاقة مدى/ائتمان</option></select></label>' +
      '<label>عدد السندات في الصفحة<select id="bn"><option value="1">1 (A4 كاملة)</option><option value="2">2 في الصفحة</option><option value="3">3 في الصفحة</option></select></label>' +
      '<label>تاريخ السندات<input type="text" id="bdt" value="' + ($('#vd') ? document.getElementById('vd').value : '') + '"></label></div><div class="acts"><button class="btn" id="bgo" type="button">⚙ إنشاء السندات</button></div>';
    host.querySelectorAll('#bmap select[data-f]').forEach(function (s) { s.onchange = function () { MAP[s.dataset.f] = s.value === '' ? undefined : +s.value; $('#bprev').innerHTML = PV(); }; });
    $('#bmadd').onclick = function () { manRow('', '+', 'f', ''); }; $('#bmgosi').onclick = function () { manRow('تأمينات اجتماعية', '-', 'p', 9.75); }; $('#bmfood').onclick = function () { manRow('بدل طعام', '+', 'f', 300); };
    ['bka', 'bks'].forEach(function (id) { $('#' + id).onchange = function () { $('#bprev').innerHTML = PV(); }; }); $('#bprev').innerHTML = PV();
    $('#bgo').onclick = gen; $('#bres').textContent = '';
  }
  function gen() {
    var hdr = $('#bh').value === '1', rows = hdr ? ROWS.slice(1) : ROWS, desc = $('#bd').value, rec = [], skip = 0;
    rows.forEach(function (r) { var name = nz(r[MAP.n]), amt = num(r[MAP.a]); var bk = []; var hh = hdr ? ROWS[0] : []; ['bka', 'bks'].forEach(function (id) { [].forEach.call($('#' + id).selectedOptions, function (o) { var j = +o.value, v = num(r[j]); v = Math.abs(isNaN(v) ? 0 : v); if (v >= 0) bk.push({ l: (hh[j] || 'بند ' + (j + 1)), a: v, t: id === 'bka' ? '+' : '-' }); }); });
      var MI = manItems(); if (MI.length) { var base = (bk.filter(function (q) { return q.t === '+'; })[0] || {}).a || (amt > 0 ? amt : 0); MI.forEach(function (x) { var a = x.m === 'p' ? Math.round(base * x.v) / 100 : x.v; if (a > 0) bk.push({ l: x.l, a: a, t: x.t }); }); if (bk.length) { var nt = bk.reduce(function (y, q) { return y + (q.t === '-' ? -1 : 1) * q.a; }, 0); if (nt > 0) amt = Math.round(nt * 100) / 100; } }
      if (isNaN(amt) || !(amt > 0)) { var nn = bk.reduce(function (x, q) { return x + (q.t === '-' ? -1 : 1) * q.a; }, 0); if (nn > 0) amt = nn; }
      if (!name || !(amt > 0) || /^(الإجمالي|اجمالي|الاجمالي|المجموع|مجموع|total|sum|grand)/i.test(name)) { skip++; return; } var gv = function (k) { return MAP[k] !== undefined ? nz(r[MAP[k]]) : ''; }, job = gv('p'), dep = gv('g'); rec.push({ bk: bk, name: name, amt: amt, job: job, dept: dep, br: gv('b'), d: MAP.d !== undefined ? nz(r[MAP.d]) : [job, dep].filter(Boolean).join(' - '), id: MAP.i !== undefined ? nz(r[MAP.i]) : '', ref: MAP.r !== undefined ? nz(r[MAP.r]) : '' }); });
    REC = rec; var tot = rec.reduce(function (a, b) { return a + b.amt; }, 0);
    $('#bres').innerHTML = rec.length ? '✅ تم تجهيز <b>' + rec.length + '</b> سندًا — إجمالي المبالغ <b>' + nf(tot) + '</b>' + (skip ? ' (تم تخطي ' + skip + ' صفًا فارغًا أو إجماليًا)' : '') : 'لم يُعثر على صفوف صالحة. تأكد من اختيار عمودي الاسم والمبلغ.';
    if (rec.length) $('#bres').innerHTML += '<div class="bsc" style="max-height:300px;margin-top:8px"><table class="bt"><thead><tr><th>#</th><th>الاسم</th><th>الرقم</th><th>الوظيفة</th><th>القسم</th><th>الفرع</th><th>البنود</th><th>الصافي</th></tr></thead><tbody>' + rec.map(function (r, k) { return '<tr><td>' + (k + 1) + '</td><td>' + r.name.replace(/</g, '&lt;') + '</td><td>' + r.id + '</td><td>' + (r.job || '') + '</td><td>' + (r.dept || '') + '</td><td>' + (r.br || '') + '</td><td>' + r.bk.map(function (q) { return q.l + ' ' + (q.t === '-' ? '−' : '+') + q.a; }).join(' ، ') + '</td><td><b>' + nf(r.amt) + '</b></td></tr>'; }).join('') + '</tbody></table></div>';
    var act = $('#bact'); act.hidden = !rec.length; act.innerHTML = '<button class="btn" id="bpr" type="button">🖨 طباعة / حفظ PDF لكل السندات</button><button class="btn alt" id="bcsv" type="button">⬇ سجل السندات CSV</button>';
    $('#bpr').onclick = printAll; $('#bcsv').onclick = csv; build();
  }
  function fill(rec, n) { return (typeof $$ === 'function' ? 0 : 0); }
  function sealSB() { var it = []; try { it = JSON.parse(localStorage.getItem('sp_voucher') || '[]'); } catch (e) { } var vd = document.querySelector('#doc .vd'), sb = vd && vd.querySelector('.sb>div'); if (!it.length || !sb) return null; var rv = vd.getBoundingClientRect(), rs = sb.getBoundingClientRect(), cx = rs.left + rs.width / 2 - rv.left, cy = rs.top + rs.height / 2 - rv.top;
    return it.map(function (x) { var dx = x.snap ? 0 : x.x / 100 * rv.width - cx, dy = x.snap ? 0 : x.y / 100 * rv.height - cy, w = x.w / 100 * rv.width; return '<div style="position:absolute;left:calc(50% + ' + dx.toFixed(1) + 'px);top:calc(50% + ' + dy.toFixed(1) + 'px);width:' + w.toFixed(1) + 'px;transform:translate(-50%,-50%) rotate(' + x.r + 'deg);pointer-events:none;z-index:5"><img alt="" src="' + x.d + '" style="display:block;width:100%;opacity:' + x.o / 100 + ';' + (x.m ? 'mix-blend-mode:multiply;' : '') + (x.f ? 'transform:scaleX(-1);' : '') + '"></div>'; }).join(''); }
  function sealHTML() { var it = []; try { it = JSON.parse(localStorage.getItem('sp_voucher') || '[]'); } catch (e) { } if (!it.length) return ''; return '<div class="sp-layer" style="position:absolute;inset:0;pointer-events:none">' + it.map(function (x) { return '<div class="sp-i" style="position:absolute;left:' + x.x + '%;top:' + x.y + '%;width:' + x.w + '%;transform:translate(-50%,-50%) rotate(' + x.r + 'deg)"><img alt="" src="' + x.d + '" style="display:block;width:100%;opacity:' + x.o / 100 + ';' + (x.m ? 'mix-blend-mode:multiply;' : '') + (x.f ? 'transform:scaleX(-1);' : '') + '"></div>'; }).join('') + '</div>'; }

  var MANP = ['أجر أساسي','بدل سكن','بدل نقل','بدل اتصال','بدل طعام','بدل طبيعة عمل','ساعات إضافية','عمولة','مكافأة','حوافز','خصم غياب','خصم تأخير','سلفة','قسط قرض','تأمينات اجتماعية','تأمين طبي','خصم جزاء','ضريبة'];
  function manRow(l, t, m, v) { var d = document.createElement('div'); d.className = 'bmr'; d.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1.2fr 1fr 34px;gap:6px;margin-bottom:6px'; d.innerHTML = '<input list="bmlist" placeholder="اسم البند" value="' + (l || '') + '"><select><option value="+"' + (t === '-' ? '' : ' selected') + '>إضافة +</option><option value="-"' + (t === '-' ? ' selected' : '') + '>خصم −</option></select><select><option value="f"' + (m === 'p' ? '' : ' selected') + '>مبلغ ثابت</option><option value="p"' + (m === 'p' ? ' selected' : '') + '>% من الأساسي</option></select><input type="number" step="0.01" min="0" placeholder="القيمة" value="' + (v || '') + '"><button type="button" class="btn alt" style="padding:0">×</button>'; d.lastChild.onclick = function () { d.remove(); }; $('#bman').appendChild(d); }
  if (!document.getElementById('bmlist')) { var dl = document.createElement('datalist'); dl.id = 'bmlist'; dl.innerHTML = MANP.map(function (x) { return '<option value="' + x + '">'; }).join(''); document.body.appendChild(dl); }
  function manItems() { return [].map.call(document.querySelectorAll('#bman .bmr'), function (d) { var i = d.querySelectorAll('input,select'); return { l: i[0].value.trim(), t: i[1].value, m: i[2].value, v: +i[3].value || 0 }; }).filter(function (x) { return x.l && x.v > 0; }); }
  function build() {
    var g = function (id) { return document.getElementById(id); }, keep = {}; ['vt', 'vw', 'va', 'vp', 'vn', 'vr', 'vm', 'vd', 'vid', 'vbr', 'vcc', 'vcopy', 'vtot', 'vst'].forEach(function (i) { keep[i] = g(i).type === 'checkbox' ? g(i).checked : g(i).value; });
    var tp = $('#bt').value, per = +$('#bn').value, seq = (+ls('vc_seq_' + tp) || 0), pre = VT[tp].p, out = [];
    g('vt').value = tp; var _dv = g('vp').value; g('vm').value = $('#bm').value; g('vd').value = $('#bdt').value || keep.vd; g('vcopy').checked = false; g('vtot').value = 0; g('vst').value = '';
    window.EMPL = REC.some(function (r) { return r.job || r.dept; }) || /الوظيفي|الموظف|emp/i.test((ROWS[0] || [])[MAP.i] || '');
    REC.forEach(function (r, k) { g('vw').value = r.name; g('va').value = r.amt; g('vn').value = pre + String(seq + k + 1).padStart(4, '0'); g('vp').value = $('#bd').value.replace(/\{الاسم\}/g, r.name).replace(/\{المبلغ\}/g, nf(r.amt)).replace(/\{البيان\}/g, r.d).replace(/\{الوظيفة\}/g, r.job || '').replace(/\{القسم\}/g, r.dept || '').replace(/\{الفرع\}/g, r.br || '') + (r.d && $('#bd').value.indexOf('{البيان}') < 0 ? ' - ' + r.d : ''); g('vr').value = r.ref; g('vid').value = r.id; if (r.br) g('vbr').value = r.br; if (r.dept) g('vcc').value = r.dept; r.no = g('vn').value; window.BKX = r.bk; out.push(html(false)); window.BKX = null; });
    window.EMPL = false;
    Object.keys(keep).forEach(function (i) { if (g(i).type === 'checkbox') g(i).checked = keep[i]; else g(i).value = keep[i]; });
    var sl = sealHTML(); out = out.map(function (h) { if (sl) { var inn = sealSB(); if (inn && /class="sb"/.test(h)) h = h.replace(/(<div class="sb"><div)([^>]*)>([\s\S]*?)<\/div><\/div>/, function (m, a1, a2, a3) { return a1 + ' class="f" style="position:relative;overflow:visible">' + inn + '</div></div>'; }); else h = h.replace(/<\/div>$/, sl + '</div>'); } return h + (typeof siteF === 'function' ? siteF() : ''); });
    var pr = document.getElementById('bprint'); if (!pr) { pr = document.createElement('div'); pr.id = 'bprint'; pr.style.display = 'none'; document.querySelector('.wrap').appendChild(pr); }
    pr.innerHTML = out.map(function (h, k) { return '<div class="bp' + (per > 1 ? ' per2' + ((k + 1) % per === 0 ? ' brk' : '') : '') + '">' + h + '</div>'; }).join('');
    $('#bout').innerHTML = '<p class="hint">معاينة أول 3 سندات (الباقي يُطبع مع الجميع):</p><div style="display:grid;gap:12px;margin-top:6px">' + out.slice(0, 3).map(function (h) { return '<div style="transform-origin:top;overflow:hidden;border-radius:8px">' + h + '</div>'; }).join('') + '</div>';
  }
  function printAll() { if (!REC.length || !document.querySelector('#bprint .vd')) { alert('لا توجد سندات جاهزة للطباعة. اختر عمودي الاسم والمبلغ ثم اضغط «إنشاء السندات».'); return; } document.body.classList.add('batch'); var tp = $('#bt').value; var done = function () { document.body.classList.remove('batch'); window.removeEventListener('afterprint', done); }; window.addEventListener('afterprint', done); try { localStorage.setItem('vc_seq_' + tp, String((+localStorage.getItem('vc_seq_' + tp) || 0) + REC.length)); } catch (e) { } window.print(); }
  function csv() { var rows = [['رقم السند', 'الاسم', 'المبلغ', 'البيان', 'رقم الهوية', 'المرجع']].concat(REC.map(function (r) { return [r.no, r.name, r.amt, r.d, r.id, r.ref]; })); var s = '﻿' + rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n'), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv;charset=utf-8' })); a.download = 'vouchers-register.csv'; a.click(); }
})();
