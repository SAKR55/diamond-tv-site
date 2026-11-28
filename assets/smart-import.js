/* DIAMOND HUB — الاستيراد الذكي للملفات في أدوات المطابقة والمحاسبة.
   يقرأ Excel (.xlsx) و CSV/TSV/TXT و PDF نصي، يكتشف صف العناوين وجدول البيانات، يطابق الأعمدة مع حقول الأداة
   (تاريخ/بيان/مدين/دائن/رصيد/كمية/سعر…)، يحسب الإشارة من مدين/دائن، ويملأ الحقل. كل شيء داخل المتصفح. */
(function () {
  'use strict';
  if (typeof FIELDS === 'undefined' || typeof SLUG === 'undefined') return;
  var $$ = function (id) { return document.getElementById(id); };
  var ARX = /[؀-ۿﭐ-﷿ﹰ-﻿]/;

  /* ---------- أدوات نصية ---------- */
  function nz(s) { s = String(s == null ? '' : s).replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 1632; }).replace(/[۰-۹]/g, function (c) { return c.charCodeAt(0) - 1776; }); if (/[ﭐ-﷿ﹰ-﻿]/.test(s)) s = s.normalize('NFKC'); return s.replace(/[‎‏‪-‮]/g, '').replace(/ /g, ' ').trim(); }
  function nrm(s) { return nz(s).toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^\p{L}\p{N}%#\/ ]/gu, ' ').replace(/\s+/g, ' ').trim(); }
  function loadScript(s) { return new Promise(function (ok, no) { if (document.querySelector('script[data-l="' + s + '"]')) return ok(); var e = document.createElement('script'); e.src = s; e.dataset.l = s; e.onload = ok; e.onerror = function () { no(new Error('load')); }; document.head.appendChild(e); }); }
  function getZip() { return window.JSZip ? Promise.resolve(window.JSZip) : loadScript('/assets/vendor/jszip/jszip.min.js').then(function () { return window.JSZip; }); }
  var _pj; function getPdfjs() { return _pj || (_pj = import('/assets/vendor/pdfjs/pdf.min.mjs').then(function (m) { m.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdfjs/pdf.worker.min.mjs'; return m; })); }
  function buf(f) { return new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(r.result); }; r.onerror = no; r.readAsArrayBuffer(f); }); }

  /* ---------- أرقام وتواريخ ---------- */
  function parseNum(v) {
    var s = nz(v).replace(/٫/g, '.').replace(/٬/g, ',').replace(/[A-Za-z؀-ۿ$€£﷼]+/g, function (m) { return /^(dr|cr)$/i.test(m) ? ' ' + m + ' ' : ' '; });
    if (!/\d/.test(s)) return NaN;
    var neg = /\(\s*[\d.,\s]+\)/.test(s) || /-\s*[\d.,]+|[\d.,]+\s*-\s*$/.test(s) || /\bdr\b/i.test(s) && false;
    var m = s.replace(/\b(dr|cr)\b/ig, '').match(/\d[\d.,\s]*/); if (!m) return NaN;
    var t = m[0].replace(/\s+/g, '').replace(/[.,]+$/, ''), lc = t.lastIndexOf(','), ld = t.lastIndexOf('.');
    if (lc >= 0 && ld >= 0) { if (lc > ld) t = t.replace(/\./g, '').replace(',', '.'); else t = t.replace(/,/g, ''); }
    else if (lc >= 0) { t = /,\d{3}(,|$)/.test(t) && t.split(',').length > 1 && !/,\d{1,2}$/.test(t) ? t.replace(/,/g, '') : (/,\d{1,2}$/.test(t) ? t.replace(',', '.') : t.replace(/,/g, '')); }
    else if ((t.match(/\./g) || []).length > 1) t = t.replace(/\./g, '');
    var n = parseFloat(t); if (isNaN(n)) return NaN; return neg ? -Math.abs(n) : n;
  }
  function z2(n) { return (n < 10 ? '0' : '') + n; }
  function iso(y, m, d) { y = +y; if (y < 100) y += 2000; m = +m; d = +d; if (m < 1 || m > 12 || d < 1 || d > 31) return ''; return y + '-' + z2(m) + '-' + z2(d); }
  var MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12, يناير: 1, فبراير: 2, مارس: 3, ابريل: 4, مايو: 5, يونيو: 6, يوليو: 7, اغسطس: 8, سبتمبر: 9, اكتوبر: 10, نوفمبر: 11, ديسمبر: 12 };
  function parseDate(v) {
    var s = nz(v); if (!s) return ''; var m;
    if (m = s.match(/(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/)) return iso(m[1], m[2], m[3]);
    if (m = s.match(/(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/)) { var a = +m[1], b = +m[2]; if (a > 12) return iso(m[3], b, a); if (b > 12) return iso(m[3], a, b); return iso(m[3], b, a); }
    if (m = nrm(s).match(/(\d{1,2}) ?([a-z]{3,9}|[؀-ۿ]{3,9}) ?,? ?(\d{2,4})/)) { var k = MON[m[2].slice(0, 3)] || MON[m[2]]; if (k) return iso(m[3], k, m[1]); }
    if (/^\d{5}(\.\d+)?$/.test(s) && +s > 20000 && +s < 80000) { var t = new Date(Math.round((+s - 25569) * 864e5)); return t.getUTCFullYear() + '-' + z2(t.getUTCMonth() + 1) + '-' + z2(t.getUTCDate()); }
    return '';
  }
  function isDateS(v) { var s = nz(v); return !!parseDate(s) && /[\/\-.]|[A-Za-z؀-ۿ]/.test(s) && !/^\d+\.\d+$/.test(s); }
  function isNumS(v) { var s = nz(v); return !!s && /^[\s\-\(+]*[\d.,٬٫\s]+\)?\s*-?\s*(dr|cr|ر\.?س|sar|ريال|usd|aed)?\s*$/i.test(s) && !isNaN(parseNum(s)); }

  /* ---------- قراءة الملفات ---------- */
  function decodeText(ab) { var u = new TextDecoder('utf-8', { fatal: false }).decode(ab); if (u.indexOf('�') >= 0) { try { u = new TextDecoder('windows-1256').decode(ab); } catch (e) { } } return u.replace(/^﻿/, ''); }
  function parseDelim(t) {
    var first = t.split(/\r?\n/).slice(0, 15).join('\n'), best = ',', bs = -1;
    ['\t', ';', ',', '|'].forEach(function (d) { var c = first.split(d).length - 1; if (c > bs && c >= first.split(/\n/).filter(Boolean).length * 0.8) { bs = c; best = d; } });
    var rows = [], r = [], c = '', q = false, d = best;
    for (var i = 0; i < t.length; i++) { var ch = t[i]; if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; } else if (ch === '"') q = true; else if (ch === d) { r.push(c); c = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; r.push(c); c = ''; if (r.some(function (x) { return x.trim(); })) rows.push(r); r = []; } else c += ch; }
    r.push(c); if (r.some(function (x) { return x.trim(); })) rows.push(r);
    return rows.map(function (r) { return r.map(nz); });
  }
  function xml(s) { return new DOMParser().parseFromString(s, 'application/xml'); }
  function colIdx(ref) { var s = ref.replace(/\d/g, ''), n = 0; for (var i = 0; i < s.length; i++) n = n * 26 + s.charCodeAt(i) - 64; return n - 1; }
  function readXlsx(ab) {
    return getZip().then(function (Z) { return Z.loadAsync(ab); }).then(function (z) {
      var get = function (p) { var f = z.file(p); return f ? f.async('string') : Promise.resolve(''); };
      return Promise.all([get('xl/workbook.xml'), get('xl/_rels/workbook.xml.rels'), get('xl/sharedStrings.xml'), get('xl/styles.xml')]).then(function (a) {
        var w = xml(a[0]), rm = {}; if (a[1]) [].forEach.call(xml(a[1]).getElementsByTagName('Relationship'), function (r) { rm[r.getAttribute('Id')] = r.getAttribute('Target'); });
        var ss = []; if (a[2]) [].forEach.call(xml(a[2]).getElementsByTagName('si'), function (si) { var t = ''; [].forEach.call(si.getElementsByTagName('t'), function (x) { t += x.textContent; }); ss.push(t); });
        var dateXf = {}; if (a[3]) { var sx = xml(a[3]), cf = {}; [].forEach.call(sx.getElementsByTagName('numFmt'), function (n) { cf[n.getAttribute('numFmtId')] = n.getAttribute('formatCode') || ''; });
          var xfs = sx.getElementsByTagName('cellXfs')[0]; if (xfs) [].forEach.call(xfs.getElementsByTagName('xf'), function (x, i) { var id = x.getAttribute('numFmtId'); if ((+id >= 14 && +id <= 22) || (+id >= 45 && +id <= 47) || (cf[id] && /[dmy]/i.test(cf[id].replace(/"[^"]*"/g, '')) && !/[#0]/.test(cf[id].replace(/\[[^\]]*\]|"[^"]*"|[dmyhs\/\-: ap\.,]/ig, '')))) dateXf[i] = 1; }); }
        var sheets = [].map.call(w.getElementsByTagName('sheet'), function (s, i) { var rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'), t = (rm[rid] || ('worksheets/sheet' + (i + 1) + '.xml')).replace(/^\//, ''); if (!/^xl\//.test(t)) t = 'xl/' + t; return { name: s.getAttribute('name'), p: t }; });
        return Promise.all(sheets.map(function (sh) { return get(sh.p).then(function (x) {
          var d = xml(x), rows = [];
          [].forEach.call(d.getElementsByTagName('row'), function (r) { var row = []; [].forEach.call(r.getElementsByTagName('c'), function (c) {
            var i = colIdx(c.getAttribute('r') || 'A1'), t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0], val = '';
            if (t === 's') val = ss[+(v ? v.textContent : 0)] || ''; else if (t === 'inlineStr') val = c.textContent; else val = v ? v.textContent : '';
            if (t !== 's' && t !== 'inlineStr' && t !== 'str' && val !== '' && dateXf[c.getAttribute('s')]) { var dt = parseDate(String(Math.floor(+val))); if (dt) val = dt; }
            row[i] = nz(val); });
            for (var j = 0; j < row.length; j++) if (row[j] === undefined) row[j] = ''; if (row.some(function (q) { return q; })) rows.push(row); });
          return { name: sh.name, rows: rows };
        }); }));
      });
    }).then(function (s) { return s.filter(function (x) { return x.rows.length; }); });
  }
  /* PDF: صفوف بحسب y، خلايا بحسب فجوات x، مع إحداثيات لبناء الأعمدة */
  function lam(x) { return x.replace(/[ﻵﻶ]/g, 'آل').replace(/[ﻷﻸ]/g, 'أل').replace(/[ﻹﻺ]/g, 'إل').replace(/[ﻻﻼ]/g, 'ال'); }
  function rev(w) { return w.split('').reverse().join(''); }
  function fixVis(c) { if (!c.v) return c.t; var t = c.p.map(function (q) { var x = q.s; if (!q.pf && x.length > 1 && /[\u0600-\u06FF]/.test(x)) x = rev(x); return (q.sp ? ' ' : '') + x; }).join('');
    return t.split(' ').reverse().map(function (w) { return /[\u0600-\u06FF]/.test(w) ? rev(w).replace(/[0-9.,]+/g, rev) : w; }).join(' '); }
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
  function fixLA(t) { return t.replace(/(^|[\s\/(])ا([أإآا])ل/g, '$1ال$2').replace(/هللا/g, 'الله'); }
  function readPdf(ab) {
    return getPdfjs().then(function (m) { return m.getDocument({ data: new Uint8Array(ab.slice(0)), disableFontFace: true, useSystemFonts: false, standardFontDataUrl: '/assets/vendor/pdfjs/standard_fonts/', cMapUrl: '/assets/vendor/pdfjs/cmaps/', cMapPacked: true, wasmUrl: '/assets/vendor/pdfjs/wasm/', iccUrl: '/assets/vendor/pdfjs/iccs/' }).promise; }).then(function (pdf) {
      var all = [], pn = 1;
      return new Promise(function (ok, no) { (function step() { if (pn > pdf.numPages) return ok(all); var p0 = pn; pdf.getPage(pn).then(function (pg) { return pg.getTextContent(); }).then(function (tc) {
        var its = []; tc.items.forEach(function (it) { if (it.str && it.str.trim()) its.push({ v: /[ﭐ-﷿ﹰ-﻿]/.test(it.str), vis: /[ﭐ-﷿ﹰ-﻿]/.test(it.str), s: nz(lam(it.str)), lead: /^\s/.test(it.str), trail: /\s$/.test(it.str), x: it.transform[4], y: it.transform[5], w: it.width, h: it.height || 10 }); });
        its.sort(function (a, b) { return b.y - a.y || a.x - b.x; }); var rows = [];
        its.forEach(function (it) { var r = rows[rows.length - 1]; if (r && Math.abs(r.y - it.y) <= Math.max(2, Math.min(r.h, it.h) * .55)) r.it.push(it); else rows.push({ y: it.y, h: it.h, it: [it] }); });
        rows.forEach(function (r) { r.it.sort(function (a, b) { return a.x - b.x; }); var cells = [], c = null;
          r.it.forEach(function (it) { if (c && it.x - c.x1 < Math.max(r.h * .55, 3.5)) { c.items.push(it); c.x1 = Math.max(c.x1, it.x + it.w); } else { c = { items: [it], x0: it.x, x1: it.x + it.w }; cells.push(c); } });
          cells.forEach(function (c) { c.t = fixLA(nz(cellText(c.items))); });
          all.push({ pg: p0, y: r.y, cells: cells }); });
        pn++; step(); }).catch(no); })(); });
    });
  }
  /* بناء جدول من صفوف PDF: أعمدة = تجميع فترات x المتداخلة */
  function pdfTable(prs) {
    var cells = []; prs.forEach(function (r) { r.cells.forEach(function (c) { cells.push(c); }); });
    var wide = 0; cells.forEach(function (c) { wide = Math.max(wide, c.x1); });
    var iv = cells.filter(function (c) { return c.x1 - c.x0 < wide * .45; }).map(function (c) { return [c.x0, c.x1]; }).sort(function (a, b) { return a[0] - b[0]; }), cols = [];
    iv.forEach(function (q) { var c = cols[cols.length - 1]; if (c && q[0] - c[1] < 3) c[1] = Math.max(c[1], q[1]); else cols.push([q[0], q[1]]); });
    if (cols.length < 2 || cols.length > 14) return null;
    var rows = prs.map(function (r) { var o = cols.map(function () { return ''; }); r.cells.forEach(function (c) { var cx = (c.x0 + c.x1) / 2, b = -1, bd = 1e9; cols.forEach(function (k, j) { var d = cx >= k[0] && cx <= k[1] ? 0 : Math.min(Math.abs(cx - k[0]), Math.abs(cx - k[1])); if (d < bd) { bd = d; b = j; } }); o[b] = (o[b] ? o[b] + ' ' : '') + c.t; }); return o; });
    var ar = ARX.test(rows.slice(0, 12).map(function (r) { return r.join(''); }).join('')); if (ar) rows = rows.map(function (r) { return r.slice().reverse(); });
    return rows;
  }
  /* بديل: استخراج بالصيغة (تاريخ + أرقام + نص) عندما يفشل تجميع الأعمدة */
  function pdfLoose(prs) {
    var out = [];
    prs.forEach(function (r) { var t = r.cells.map(function (c) { return c.t; }), dt = '', nums = [], txt = [];
      t.forEach(function (x) { if (!dt && isDateS(x)) dt = x; else if (isNumS(x)) nums.push(x); else txt.push(x); });
      if (dt || nums.length) out.push([dt, txt.join(' ')].concat(nums)); else out.push(t); });
    return out;
  }
  function loadFile(f) {
    var n = f.name.toLowerCase();
    if (/\.xlsx$|\.xlsm$/.test(n)) return buf(f).then(readXlsx);
    if (/\.xls$/.test(n)) return Promise.reject(new Error('xls'));
    if (/\.pdf$/.test(n)) return buf(f).then(readPdf).then(function (prs) { var t = pdfTable(prs); if (!t || !hdrScore(t).length) { var l = pdfLoose(prs); if (!t || (best(l).score < best(t).score)) t = l; } return [{ name: 'PDF', rows: t.filter(function (r) { return r.some(Boolean); }) }]; });
    return buf(f).then(function (ab) { return [{ name: f.name, rows: parseDelim(decodeText(ab)) }]; });
  }

  /* ---------- مفاهيم العناوين ---------- */
  var CON = {
    date: /تاريخ|\bdate\b|value date|posting|trans date|txn date|booking/, due: /استحقاق|\bdue\b|maturity/, desc: /بيان|وصف|تفاصيل|ملاحظ|description|narration|particulars|memo|details|remarks|transaction|reference text/,
    amt: /مبلغ|amount|قيمه|value|\btotal\b|اجمالي/, dr: /مدين|\bdebit\b|\bdr\b|withdraw|سحب|مسحوب|paid out|منصرف|صرف|charges?/, cr: /دائن|\bcredit\b|\bcr\b|deposit|ايداع|وارد|paid in|قبض|receipts?\b/,
    bal: /رصيد|balance|outstanding|متبقي|المتبقي/, ref: /مرجع|reference|\bref\b|رقم|\bno\b|number|مستند|document|\bdoc\b|#|شيك|cheque|check|voucher|سند|invoice no|فاتوره رقم/,
    party: /مورد|vendor|supplier|عميل|customer|client|جهه|طرف|payee|مستفيد|beneficiary/, item: /صنف|\bitem\b|product|sku|مادة|منتج|بند|article|اصل|asset/,
    qty: /كميه|qty|quantity|units|عدد|pcs/, price: /سعر|price|rate|تكلفه الوحده|unit cost|\bcost\b|unit price|تكلفه/, po: /امر|\bpo\b|order|ordered|purchase/, gr: /مستلم|استلام|received|\bgrn\b|receipt|delivered/,
    inv: /فاتوره|invoice|billed|\bbill\b/, sys: /نظام|system|\bbook\b|on hand|expected|دفتري|رصيد المخزون/, cnt: /فعلي|جرد|count|physical|actual|counted/, pct: /نسبه|%|percent/, acct: /حساب|account|\bgl\b|ledger|code/,
    type: /نوع|\btype\b|dr ?\/ ?cr|مدين ?\/ ?دائن/, cat: /فئه|category|class|تصنيف|group/, name: /اسم|\bname\b/, disc: /خصم|discount/, days: /ايام|days/, year: /سنه|year/, life: /عمر|life/, salv: /خرده|salvage|residual/, budget: /موازنه|budget|plan/, actual: /فعلي|actual/
  };
  var MODS = ['due', 'bal', 'po', 'gr', 'inv', 'sys', 'cnt', 'dr', 'cr', 'pct', 'disc', 'days', 'year', 'life', 'salv', 'type', 'acct', 'cat'];
  function concepts(s) { var n = nrm(s), r = {}; Object.keys(CON).forEach(function (k) { if (CON[k].test(n)) r[k] = 1; }); return r; }
  var NUMK = { amt: 1, dr: 1, cr: 1, bal: 1, qty: 1, price: 1, pct: 1, sys: 1, cnt: 1, disc: 1, days: 1, year: 1, life: 1, salv: 1, budget: 1, actual: 1 };
  function kindOf(T) { if (T.date || T.due) return 'date'; if (T.type) return 'text'; var nm = Object.keys(T).some(function (k) { return NUMK[k]; }); if (nm && !(T.item || T.party || T.desc || T.name)) return 'num'; return 'text'; }

  /* ---------- اكتشاف صف العناوين والجدول ---------- */
  function hdrScore(rows) { var out = []; for (var i = 0; i < Math.min(rows.length, 40); i++) { var h = rows[i], hits = 0, num = 0; h.forEach(function (c) { var s = nz(c); if (!s) return; if (isNumS(s) || isDateS(s)) { num++; return; } if (Object.keys(concepts(s)).length) hits++; }); if (hits >= 2 && num <= 1) out.push([i, hits]); } return out; }
  function best(rows) { var h = hdrScore(rows).sort(function (a, b) { return b[1] - a[1] || a[0] - b[0]; })[0]; return h ? { i: h[0], score: h[1] } : { i: -1, score: 0 }; }
  var TOT = /^(اجمالي|إجمالي|الاجمالي|الإجمالي|المجموع|مجموع|الكلي|total|grand total|sub ?total)(?![\p{L}])/iu, OPEN = /(الرصيد (السابق|الافتتاحي|الختامي|المرحل|النهائي)|رصيد (سابق|افتتاحي|ختامي|اول المده|أول المدة|اخر المده|آخر المدة)|opening balance|closing balance|balance (b\/?f|c\/?f|brought|carried)|brought forward|carried forward)/i;
  function tableOf(rows) {
    var b = best(rows), hi = b.i, head, body;
    if (hi >= 0) { head = rows[hi].map(nz); body = rows.slice(hi + 1); } else { var w = 0; rows.forEach(function (r) { w = Math.max(w, r.length); }); head = []; for (var k = 0; k < w; k++) head.push(''); body = rows.slice(); }
    var w2 = Math.max(head.length, 1); body.forEach(function (r) { w2 = Math.max(w2, r.length); }); while (head.length < w2) head.push('');
    var hs = head.map(nrm).join('|'), out = [], skipped = 0;
    body.forEach(function (r) {
      var cells = []; for (var j = 0; j < w2; j++) cells.push(nz(r[j])); var nn = cells.filter(Boolean).length; if (!nn) return;
      if (cells.map(nrm).join('|') === hs) return; /* عناوين مكررة بين الصفحات */
      var joined = cells.join(' ');
      if (TOT.test(nz(cells.find(Boolean) || '')) || OPEN.test(joined)) { skipped++; return; }
      out.push(cells);
    });
    /* دمج أسطر الوصف المتتابعة (صف بلا تاريخ ولا أرقام يُلحق بما قبله) */
    var dcol = -1; head.forEach(function (h, j) { if (dcol < 0 && /تاريخ|date/.test(nrm(h))) dcol = j; });
    if (dcol >= 0) { var m = []; out.forEach(function (r) { var numish = r.some(function (c, j) { return j !== dcol && isNumS(c) && /[.,]\d|\d{4,}/.test(c); }); if (m.length && !r[dcol] && !numish) { var tj = r.findIndex(function (c) { return c; }); if (tj >= 0) m[m.length - 1][tj] = (m[m.length - 1][tj] + ' ' + r[tj]).trim(); } else m.push(r); }); out = m; }
    return { head: head.map(function (h, j) { return h || ('عمود ' + (j + 1)); }), rawHead: head, rows: out, hdrFound: hi >= 0, skipped: skipped };
  }
  function profile(rows, j) {
    var c = rows.slice(0, 200).map(function (r) { return r[j]; }).filter(Boolean), n = c.length || 1, seq = 0;
    var nums = c.filter(isNumS).map(parseNum); for (var i = 1; i < nums.length; i++) if (nums[i] === nums[i - 1] + 1) seq++;
    return { n: c.length, date: c.filter(isDateS).length / n, num: c.filter(function (v) { return isNumS(v) && !isDateS(v); }).length / n, text: c.filter(function (v) { return !isNumS(v) && !isDateS(v) && /[A-Za-z؀-ۿ]{2,}/.test(v); }).length / n, serial: nums.length > 3 && seq >= (nums.length - 1) * .8, drcr: c.length > 0 && c.every(function (v) { return /^(dr|cr|d|c|مدين|دائن|debit|credit|\+|-)$/i.test(v); }), dec: c.filter(function (v) { return /[.,]\d{1,2}$/.test(v); }).length / n };
  }

  /* ---------- مطابقة الأعمدة ---------- */
  function score(T, tName, H, hName, P, tk, ti, hj, nT) {
    var s = 0, shared = 0, k;
    Object.keys(T).forEach(function (c) { if (H[c]) { s += 4; shared++; } });
    MODS.forEach(function (c) { if (H[c] && !T[c]) s -= 3; });
    if (!Object.keys(T).length) { var tw = nrm(tName).split(' '), hw = nrm(hName).split(' '); tw.forEach(function (w) { if (w.length > 1 && hw.indexOf(w) >= 0) s += 3; }); }
    var weakTxt = ['desc', 'item', 'party', 'name'].some(function (c) { return T[c]; }) && ['desc', 'item', 'party', 'name', 'ref'].some(function (c) { return H[c]; }); if (weakTxt && !shared) s += 1.5;
    if (tk === 'date') s += P.date >= .6 ? 3 : -8; else if (tk === 'num') s += P.num >= .6 ? 3 : -8; else { s += (P.text >= .5 ? 2 : (T.ref && (P.num >= .5 || P.text >= .3) ? 1 : -3)); if (P.date > .7) s -= 4; if (P.drcr) s -= 6; }
    if (P.serial && !H.ref) s -= 6; if (P.n === 0) s -= 8; s += (1 - Math.abs(ti / nT - hj / nT)) * .6; return s;
  }
  function conv() { return (SIC[SLUG] || {}); }
  var SIC = { 'bank-reconciliation-matcher': { b: 'cr', l: 'dr' }, 'supplier-statement-reconciliation': { s: 'dr', b: 'cr' } };
  var BALOK = { 'ar-ap-aging-report': 1, 'ifrs9-ecl-matrix': 1, 'budget-vs-actual-variance': 0 };

  function mapFor(F, tbl) {
    var targets = F.targets, T = targets.map(function (t) { return concepts(t); }), H = tbl.head.map(function (h) { return concepts(h); }), P = tbl.head.map(function (_, j) { return profile(tbl.rows, j); }), nT = Math.max(targets.length, tbl.head.length), pairs = [];
    targets.forEach(function (t, i) { var tk = kindOf(T[i]); tbl.head.forEach(function (h, j) { var sc = score(T[i], t, H[j], h, P[j], tk, i, j, nT); if (H[j].bal && T[i].amt && !T[i].bal && !BALOK[SLUG]) sc -= 4; if (BALOK[SLUG] && H[j].bal && T[i].amt) sc += 3; pairs.push([sc, i, j]); }); });
    pairs.sort(function (a, b) { return b[0] - a[0]; });
    var map = {}, used = {}, conf = {};
    pairs.forEach(function (p) { if (p[0] < 2.2 || map[p[1]] !== undefined || used[p[2]]) return; map[p[1]] = p[2]; used[p[2]] = 1; conf[p[1]] = p[0] >= 6 ? 2 : 1; });
    /* ملء المتبقي بحسب النوع من اليسار لليمين */
    targets.forEach(function (t, i) { if (map[i] !== undefined) return; var tk = kindOf(T[i]); for (var j = 0; j < tbl.head.length; j++) { if (used[j] || P[j].n === 0 || P[j].serial || P[j].drcr) continue; if (H[j].bal && !BALOK[SLUG] && T[i].amt) continue; if (tk === 'date' ? P[j].date >= .6 : tk === 'num' ? P[j].num >= .6 && !P[j].date : (P[j].text >= .5 || (T[i].ref && P[j].num > .5))) { map[i] = j; used[j] = 1; conf[i] = 0; break; } } });
    /* مبلغ مركّب من مدين/دائن */
    var comp = null;
    targets.forEach(function (t, i) { if (!(T[i].amt || (kindOf(T[i]) === 'num' && !T[i].qty && !T[i].price && !T[i].dr && !T[i].cr)) || T[i].dr || T[i].cr || T[i].bal) return;
      var drc = [], crc = [], amc = []; tbl.head.forEach(function (h, j) { if (P[j].num < .3 && P[j].n > 0 && P[j].dec < .3) return; if (H[j].dr && !H[j].cr) drc.push(j); else if (H[j].cr && !H[j].dr) crc.push(j); else if (H[j].amt && !H[j].bal && !H[j].dr && !H[j].cr) amc.push(j); });
      if ((drc.length || crc.length) && !(amc.length && !(drc.length && crc.length))) { comp = { i: i, dr: drc, cr: crc }; } });
    var tcol = -1; tbl.head.forEach(function (h, j) { if (tcol < 0 && P[j].drcr) tcol = j; });
    return { map: map, conf: conf, comp: comp, tcol: tcol, T: T };
  }

  function cleanText(v) { return nz(v).replace(/\s*\|\s*/g, ' / ').replace(/\s+/g, ' '); }
  function fmtN(n) { return (Math.round(n * 100) / 100).toString(); }
  function build(F, tbl, M, opt) {
    var lines = [], conventional = opt.conv; /* 'dr' | 'cr' */
    tbl.rows.forEach(function (r) {
      var out = F.targets.map(function (t, i) {
        var tk = kindOf(M.T[i]);
        if (M.comp && M.comp.i === i) {
          var sd = 0, sc = 0, any = false; M.comp.dr.forEach(function (j) { var v = parseNum(r[j]); if (!isNaN(v)) { sd += Math.abs(v); any = true; } }); M.comp.cr.forEach(function (j) { var v = parseNum(r[j]); if (!isNaN(v)) { sc += Math.abs(v); any = true; } });
          if (any) return fmtN(conventional === 'cr' ? sc - sd : sd - sc);
        }
        var j = M.map[i]; if (j === undefined || j < 0) return tk === 'num' ? '0' : '';
        var v = r[j];
        if (tk === 'date') return parseDate(v) || nz(v);
        if (tk === 'num') { var n = parseNum(v); if (isNaN(n)) return '0'; if (M.tcol >= 0 && M.T[i].amt && !M.T[i].dr && !M.T[i].cr) { var ty = nz(r[M.tcol]).toLowerCase(), isDr = /^(dr|d|مدين|debit|-)$/.test(ty); n = Math.abs(n) * ((conventional === 'cr' ? !isDr : isDr) ? 1 : -1); } else if (/\bcr\b/i.test(v) && M.T[i].amt) n = conventional === 'cr' ? Math.abs(n) : -Math.abs(n); else if (/\bdr\b/i.test(v) && M.T[i].amt) n = conventional === 'cr' ? -Math.abs(n) : Math.abs(n); return fmtN(n); }
        return cleanText(v);
      });
      if (out.every(function (x) { return x === '' || x === '0'; })) return;
      if (F.targets.length > 1 && !out.some(function (x, i) { return x && x !== '0' && kindOf(M.T[i]) !== 'num'; }) && !out.some(function (x, i) { return kindOf(M.T[i]) === 'num' && x && x !== '0'; })) return;
      lines.push(out.join(' | '));
    });
    return lines;
  }

  /* ---------- الواجهة ---------- */
  var CSS = '.si{margin:6px 0 2px}.si-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.si-bar .chip,.si-bar label.chip{cursor:pointer}.si-st{font-size:.82rem;color:#475569}.si-pn{margin-top:8px;padding:10px;border:1px solid #d8dce5;border-radius:12px;background:#f8fafc;font-size:.85rem}.si-pn[hidden]{display:none}.si-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin:8px 0}.si-g label{display:flex;flex-direction:column;gap:2px;font-weight:600}.si-g select{padding:6px;border:1px solid #cbd5e1;border-radius:8px}.si-ok{color:#15803d}.si-mid{color:#b45309}.si-no{color:#b91c1c}.si-pv{overflow:auto;max-height:190px}.si-pv table{width:100%;border-collapse:collapse}.si-pv th,.si-pv td{border:1px solid #d8dce5;padding:3px 6px;white-space:nowrap;text-align:right}.si-pv th{background:#e8ecf4}';
  var stl = document.createElement('style'); stl.textContent = CSS; document.head.appendChild(stl);

  FIELDS.forEach(function (F) {
    if (F.t !== 'textarea') return;
    var m = String(F.l).match(/\(([^()]*\|[^()]*)\)/); if (!m) return;
    F.targets = m[1].split('|').map(function (x) { return x.replace(/:.*$/, '').trim(); }).filter(Boolean); if (F.targets.length < 2) return;
    var ta = $$(F.id); if (!ta) return;
    var wrap = document.createElement('div'); wrap.className = 'si';
    wrap.innerHTML = '<div class="si-bar"><label class="chip my" style="cursor:pointer">📂 رفع ملف ذكي (Excel / CSV / PDF)<input type="file" accept=".xlsx,.xlsm,.csv,.tsv,.txt,.pdf,.xls" hidden></label><span class="si-st">أو الصق جدولًا منسوخًا من Excel مباشرة في الحقل.</span></div><div class="si-pn" hidden></div>';
    ta.parentNode.appendChild(wrap);
    var st = { sheets: [], si: 0, tbl: null, M: null, ov: {}, flip: false };
    var panel = wrap.querySelector('.si-pn'), stt = wrap.querySelector('.si-st');
    function convFor() { var c = (conv()[F.id]) || (/البنك|bank|مورد|statement/i.test(F.l) && /البنك|bank/i.test(F.l) ? 'cr' : 'dr'); if (st.flip) c = c === 'cr' ? 'dr' : 'cr'; return c; }
    function apply() {
      if (!st.tbl) return; var M = st.M;
      Object.keys(st.ov).forEach(function (i) { var v = st.ov[i]; if (v === -1) { delete M.map[i]; if (M.comp && M.comp.i === +i) M.comp = null; } else { M.map[i] = v; if (M.comp && M.comp.i === +i) M.comp = null; } });
      var L = build(F, st.tbl, M, { conv: convFor() }); ta.value = L.join('\n'); ta.rows = Math.min(14, Math.max(ta.rows || 5, L.length + 1)); ta.dispatchEvent(new Event('input', { bubbles: true }));
      stt.innerHTML = '✅ تم استيراد <b>' + L.length + '</b> صفًا' + (st.tbl.skipped ? ' (تجاهلت ' + st.tbl.skipped + ' صف إجمالي/رصيد افتتاحي)' : '') + (st.tbl.hdrFound ? '' : ' — لم أجد صف عناوين فطابقت بحسب محتوى الأعمدة');
      ui(L);
    }
    function ui(L) {
      var M = st.M, tbl = st.tbl, opts = '<option value="-1">— بدون —</option>' + tbl.head.map(function (h, j) { return '<option value="' + j + '">' + h.replace(/</g, '&lt;') + '</option>'; }).join('');
      var g = F.targets.map(function (t, i) { var comp = M.comp && M.comp.i === i, cf = comp ? 2 : (M.conf[i] === undefined ? -1 : M.conf[i]); return '<label>' + t + ' <small class="' + (cf === 2 ? 'si-ok' : cf === 1 ? 'si-mid' : cf === 0 ? 'si-mid' : 'si-no') + '">' + (comp ? '✓ من مدين/دائن' : cf === 2 ? '✓ مطابق' : cf === 1 ? '✓ محتمل' : cf === 0 ? '⚠ تخمين' : '✗ لم يوجد') + '</small><select data-i="' + i + '"' + (comp ? ' disabled' : '') + '>' + opts + '</select></label>'; }).join('');
      var hasAmt = F.targets.some(function (t, i) { return M.T[i].amt || (M.comp && M.comp.i === i); }), pv = '<table><tr>' + F.targets.map(function (t) { return '<th>' + t + '</th>'; }).join('') + '</tr>' + L.slice(0, 6).map(function (l) { return '<tr>' + l.split(' | ').map(function (c) { return '<td>' + c.replace(/</g, '&lt;') + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
      panel.hidden = false; panel.innerHTML = '<b>🔍 نتيجة القراءة الذكية</b>' + (st.sheets.length > 1 ? '<label class="si-g" style="grid-template-columns:1fr"><span>الورقة:</span><select class="si-sh">' + st.sheets.map(function (s, k) { return '<option value="' + k + '"' + (k === st.si ? ' selected' : '') + '>' + s.name + ' (' + s.rows.length + ' صف)</option>'; }).join('') + '</select></label>' : '') + '<div class="si-g">' + g + '</div>' + (hasAmt ? '<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" class="si-fl"' + (st.flip ? ' checked' : '') + '> عكس إشارة المبلغ (الحالي: ' + (convFor() === 'cr' ? 'الدائن موجب والمدين سالب' : 'المدين موجب والدائن سالب') + ')</label>' : '') + '<div class="si-pv">' + pv + '</div>';
      [].forEach.call(panel.querySelectorAll('select[data-i]'), function (s) { var i = +s.dataset.i, cur = st.ov[i] !== undefined ? st.ov[i] : (M.map[i] !== undefined ? M.map[i] : -1); s.value = String(cur); s.onchange = function () { st.ov[i] = +s.value; apply(); }; });
      var sh = panel.querySelector('.si-sh'); if (sh) sh.onchange = function () { st.si = +sh.value; st.ov = {}; useSheet(); };
      var fl = panel.querySelector('.si-fl'); if (fl) fl.onchange = function () { st.flip = fl.checked; apply(); };
    }
    function useSheet() {
      var sh = st.sheets[st.si]; st.tbl = tableOf(sh.rows); if (!st.tbl.rows.length) { stt.textContent = '⚠ لم أجد صفوف بيانات في هذه الورقة.'; return; }
      st.M = mapFor(F, st.tbl); apply();
    }
    function ingest(sheets) {
      if (!sheets || !sheets.length) { stt.textContent = '⚠ الملف فارغ أو لا يحتوي جدولًا.'; return; }
      /* اختر أنسب ورقة تلقائيًا */
      var bi = 0, bs = -1; sheets.forEach(function (s, k) { var t = tableOf(s.rows), sc = (t.hdrFound ? 100 : 0) + Math.min(t.rows.length, 90); if (sc > bs) { bs = sc; bi = k; } });
      st.sheets = sheets; st.si = bi; st.ov = {}; useSheet();
    }
    wrap.querySelector('input[type=file]').onchange = function (e) {
      var f = e.target.files[0]; e.target.value = ''; if (!f) return; stt.textContent = 'جارٍ قراءة الملف…';
      loadFile(f).then(ingest).catch(function (er) { stt.textContent = er && er.message === 'xls' ? '⚠ صيغة .xls القديمة غير مدعومة: افتح الملف في Excel واحفظه .xlsx أو CSV.' : '⚠ تعذّر قراءة الملف. جرّب CSV أو الصق الجدول.'; });
    };
    ta.addEventListener('paste', function (e) {
      var t = (e.clipboardData || window.clipboardData).getData('text'); if (!t || t.indexOf('\t') < 0 || t.indexOf('|') >= 0) return;
      e.preventDefault(); ingest([{ name: 'لصق', rows: parseDelim(t) }]);
    });
    ta.addEventListener('drop', function (e) { var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (!f) return; e.preventDefault(); stt.textContent = 'جارٍ قراءة الملف…'; loadFile(f).then(ingest).catch(function () { stt.textContent = '⚠ تعذّر قراءة الملف.'; }); });
  });
  window.SmartImport = { parseNum: parseNum, parseDate: parseDate, tableOf: tableOf, loadFile: loadFile };
})();
