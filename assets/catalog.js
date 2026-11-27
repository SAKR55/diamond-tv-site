/* Offers magazine / catalog maker: canvas based, runs fully in the browser. Needs pricetag.js (PriceTag API) and qr.js */
(function () {
  var root = document.getElementById('ct-app'); if (!root || !window.PriceTag) return;
  var AR = document.documentElement.lang === 'ar', PT = window.PriceTag;
  function t(a, e) { return AR ? a : e }
  function $(s) { return root.querySelector(s) }
  var SIZES = [['a4p', 1240, 1754, t('A4 طولي (مجلة)', 'A4 portrait (magazine)')], ['a4l', 1754, 1240, t('A4 عرضي', 'A4 landscape')], ['a5p', 874, 1240, t('A5 طولي (كتيّب)', 'A5 portrait (booklet)')], ['sq', 1500, 1500, t('مربع (سوشيال)', 'Square (social)')], ['sl', 1920, 1080, t('عرض 16:9 (شاشة/واتساب)', 'Wide 16:9 (screen)')], ['st', 1080, 1920, t('ستوري 9:16', 'Story 9:16')]];
  var CPP = [[1, 1, 1], [2, 1, 2], [4, 2, 2], [6, 2, 3], [8, 2, 4], [9, 3, 3], [12, 3, 4], [16, 4, 4]];
  var THEMES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  var COVERS = [['band', t('شريط عريض', 'Big band')], ['burst', t('انفجار عروض', 'Offer burst')], ['split', t('نصفين', 'Split')], ['frame', t('إطار فاخر', 'Luxury frame')], ['diag', t('مائل', 'Diagonal')]];
  var C = { title: t('عروض الأسبوع', 'Weekly Offers'), sub: t('أقوى الأسعار على مدار الأسبوع', 'Best prices all week'), dates: '', store: '', phone: '', wa: '', addr: '', web: '', terms: t('العروض سارية حتى نفاد الكمية. الصور للتوضيح فقط.', 'Offers valid while stock lasts. Images are for illustration only.'), size: 'a4p', theme: 0, ff: 'Cairo', tpl: 'classic', cpp: 6, cover: 1, back: 1, cstyle: 'band', pat: 'dots', cur: 'ر.س', dec: 'auto', dig: 'latin', sbar: 1, badge: t('خصم', 'SALE'), qrt: '', cats: 0, mode: 'flyer',
    rows: [{ n: t('منتج 1', 'Product 1'), p: '19.99', o: '29.99', nt: '', im: null, cat: '', hero: 1 }, { n: t('منتج 2', 'Product 2'), p: '49', o: '65', nt: '', im: null, cat: '' }, { n: t('منتج 3', 'Product 3'), p: '9.5', o: '', nt: t('جديد', 'New'), im: null, cat: '' }, { n: t('منتج 4', 'Product 4'), p: '120', o: '150', nt: '', im: null, cat: '' }, { n: t('منتج 5', 'Product 5'), p: '35', o: '50', nt: '', im: null, cat: '' }, { n: t('منتج 6', 'Product 6'), p: '15', o: '22', nt: '', im: null, cat: '' }] };
  try { var sv = JSON.parse(localStorage.getItem('dh_ct') || 'null'); if (sv && sv.rows) { C = Object.assign(C, sv); C.rows.forEach(function (r) { r.im = null }) } } catch (e) { }
  var LOGO = null, COVIMG = null, IMS = [], PAGE = 0, TOK = 0;
  function save() { try { var c = Object.assign({}, C); c.rows = C.rows.map(function (r) { return Object.assign({}, r, { im: null }) }); localStorage.setItem('dh_ct', JSON.stringify(c)) } catch (e) { } }
  function esc(v) { return String(v == null ? '' : v).replace(/"/g, '&quot;') }
  function ip(id, lab, v, ty, ph) { return '<label class="pt-l">' + lab + '<input id="' + id + '" class="pt-i" type="' + (ty || 'text') + '" value="' + esc(v) + '" placeholder="' + (ph || '') + '"></label>' }
  function sel(id, lab, opts, v) { return '<label class="pt-l">' + lab + '<select id="' + id + '" class="pt-i">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] == v ? ' selected' : '') + '>' + o[1] + '</option>' }).join('') + '</select></label>' }
  function ck(id, lab, v) { return '<label class="pt-k"><input type="checkbox" id="' + id + '"' + (v ? ' checked' : '') + '> ' + lab + '</label>' }
  function readImg(f, cb) { var fr = new FileReader(); fr.onload = function () { var im = new Image(); im.onload = function () { cb(im) }; im.src = fr.result }; fr.readAsDataURL(f) }
  function dl(b, n) { var a = document.createElement('a'); a.download = n; a.href = URL.createObjectURL(b); a.click() }

  function build() {
    root.innerHTML = '<div class="pt-wrap"><div class="pt-side">' +
      '<details open class="pt-d"><summary>📰 ' + t('بيانات المجلة', 'Magazine info') + '</summary>' + ip('title', t('العنوان الرئيسي', 'Main title'), C.title) + ip('sub', t('عنوان فرعي', 'Subtitle'), C.sub) + ip('dates', t('مدة العروض', 'Offer dates'), C.dates, 'text', t('من 1 إلى 7 ديسمبر', 'Dec 1 – 7')) + ip('store', t('اسم المتجر', 'Store name'), C.store) + '</details>' +
      '<details open class="pt-d"><summary>📦 ' + t('المنتجات', 'Products') + ' (<span id="cnt"></span>)</summary><div id="rows"></div><div class="pt-btns"><button type="button" class="pt-b" id="add">➕ ' + t('منتج', 'Add') + '</button><button type="button" class="pt-b pt-g" id="bulk">📥 ' + t('لصق من Excel', 'Paste from Excel') + '</button><label class="pt-b pt-g" style="cursor:pointer">🖼 ' + t('رفع صور دفعة واحدة', 'Bulk images') + '<input type="file" id="bimg" accept="image/*" multiple hidden></label><button type="button" class="pt-b pt-g" id="clr">🗑</button></div><p class="pt-h">' + t('الأعمدة: الاسم، السعر، السعر القديم، ملاحظة، القسم. الصور المرفوعة دفعة واحدة تُوزَّع بالترتيب على المنتجات.', 'Columns: name, price, old price, note, category. Bulk images are assigned in order.') + '</p></details>' +
      '<details open class="pt-d"><summary>🎨 ' + t('التصميم', 'Design') + '</summary>' + sel('mode', t('نمط المجلة', 'Magazine style'), [['flyer', t('نشرة سوبرماركت (كثيفة)', 'Supermarket flyer (dense)')], ['cards', t('بطاقات أسعار', 'Price cards')]], C.mode) + sel('size', t('مقاس الصفحة', 'Page size'), SIZES.map(function (z) { return [z[0], z[3]] }), C.size) + '<div class="pt-pal">' + THEMES.map(function (i) { var p = PT.PAL[i]; return '<button type="button" class="pt-sw" data-th="' + i + '" title="' + p[4] + '" style="background:linear-gradient(135deg,' + p[0] + ' 50%,' + p[1] + ' 50%)' + (i === C.theme ? ';outline:3px solid #111' : '') + '"></button>' }).join('') + '</div>' + sel('cstyle', t('تصميم الغلاف', 'Cover style'), COVERS, C.cstyle) + sel('tpl', t('تصميم بطاقة السعر', 'Price card style'), PT.TPL, C.tpl) + sel('pat', t('نمط الخلفية', 'Background pattern'), PT.PATS, C.pat) + sel('ff', t('الخط', 'Font'), PT.FONTS.map(function (f) { return [f, f] }), C.ff) + sel('cpp', t('منتجات في الصفحة', 'Products per page'), CPP.map(function (c) { return [c[0], c[0]] }), C.cpp) + '<div class="pt-2">' + ip('cur', t('العملة', 'Currency'), C.cur) + sel('dig', t('الأرقام', 'Digits'), [['latin', '0123'], ['ar', '٠١٢٣']], C.dig) + '</div>' + ip('badge', t('نص شارة الخصم', 'Discount badge'), C.badge) + ck('cover', t('صفحة غلاف', 'Cover page'), C.cover) + ck('back', t('صفحة خلفية (تواصل)', 'Back page (contact)'), C.back) + ck('cats', t('عناوين الأقسام فوق المنتجات', 'Category headings'), C.cats) + '</details>' +
      '<details class="pt-d"><summary>🏷 ' + t('الشعار وصورة الغلاف', 'Logo & cover image') + '</summary><label class="pt-l">' + t('الشعار', 'Logo') + '<input type="file" id="logo" accept="image/*" class="pt-i"></label><label class="pt-l">' + t('صورة الغلاف (اختياري)', 'Cover image (optional)') + '<input type="file" id="cimg" accept="image/*" class="pt-i"></label></details>' +
      '<details class="pt-d"><summary>📞 ' + t('صفحة التواصل', 'Contact page') + '</summary>' + ip('phone', t('هاتف', 'Phone'), C.phone) + ip('wa', t('واتساب', 'WhatsApp'), C.wa) + ip('addr', t('العنوان / الفروع', 'Address / branches'), C.addr) + ip('web', t('الموقع أو الحساب', 'Website / handle'), C.web) + ip('qrt', t('رابط QR (اختياري)', 'QR link (optional)'), C.qrt, 'text', 'https://') + ip('terms', t('الشروط', 'Terms'), C.terms) + '</details></div>' +
      '<div class="pt-main"><div class="pt-bar"><button type="button" class="pt-b" id="prev">◀</button><b id="pg"></b><button type="button" class="pt-b" id="next">▶</button><span style="flex:1"></span><button type="button" class="pt-b pt-p" id="png">⬇ PNG</button><button type="button" class="pt-b pt-p" id="pdf">⬇ PDF</button><button type="button" class="pt-b pt-p" id="prt">🖨 ' + t('طباعة', 'Print') + '</button></div><canvas id="cv" class="pt-cv"></canvas><div class="pt-bar" id="strip"></div><div class="pt-bar"><button type="button" class="pt-b pt-g" id="sv">💾 ' + t('حفظ المشروع', 'Save project') + '</button><label class="pt-b pt-g" style="cursor:pointer">📂 ' + t('فتح مشروع', 'Open project') + '<input type="file" id="ld" accept=".json" hidden></label><button type="button" class="pt-b pt-g" id="allpng">⬇ ' + t('كل الصفحات PNG', 'All pages PNG') + '</button></div></div></div>';
    rowsUI()
  }
  function rowsUI() {
    $('#rows').innerHTML = C.rows.map(function (r, i) { return '<div class="pt-row ct-row" data-i="' + i + '"><input class="pt-i" data-k="n" placeholder="' + t('الاسم', 'Name') + '" value="' + esc(r.n) + '"><input class="pt-i pt-s" data-k="p" inputmode="decimal" placeholder="' + t('السعر', 'Price') + '" value="' + esc(r.p) + '"><input class="pt-i pt-s" data-k="o" inputmode="decimal" placeholder="' + t('القديم', 'Old') + '" value="' + esc(r.o) + '"><input class="pt-i" data-k="nt" placeholder="' + t('ملاحظة', 'Note') + '" value="' + esc(r.nt) + '"><input class="pt-i pt-s" data-k="cat" placeholder="' + t('القسم', 'Category') + '" value="' + esc(r.cat) + '"><button type="button" class="pt-b ' + (r.hero ? '' : 'pt-g') + '" data-hero="' + i + '" title="' + t('منتج مميز (خلية كبيرة)', 'Featured (big cell)') + '">⭐</button><label class="pt-b pt-g pt-im">' + (IMS[i] ? '✅' : '🖼') + '<input type="file" accept="image/*" data-im="' + i + '" hidden></label><button type="button" class="pt-b pt-g" data-del="' + i + '">✕</button></div>' }).join(''); $('#cnt').textContent = C.rows.length
  }
  function bind() {
    root.addEventListener('input', function (e) { var el = e.target;
      if (el.id && C[el.id] !== undefined && el.type !== 'file') { C[el.id] = el.type === 'checkbox' ? (el.checked ? 1 : 0) : (el.id === 'cpp' ? +el.value : el.value); if (el.id === 'cpp' || el.id === 'cover' || el.id === 'back') PAGE = Math.min(PAGE, 0); save(); render(); return }
      var row = el.closest('.ct-row'); if (row && el.dataset.k) { C.rows[+row.dataset.i][el.dataset.k] = el.value; save(); render() } });
    root.addEventListener('change', function (e) { var el = e.target;
      if (el.id === 'logo') return readImg(el.files[0], function (im) { LOGO = im; render() });
      if (el.id === 'cimg') return readImg(el.files[0], function (im) { COVIMG = im; render() });
      if (el.id === 'bimg') { var fl = [].slice.call(el.files).sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { numeric: true }) }), idx = [], i; for (i = 0; i < C.rows.length; i++)if (!IMS[i]) idx.push(i); var n = 0; fl.slice(0, idx.length).forEach(function (f, k) { readImg(f, function (im) { IMS[idx[k]] = im; if (++n === Math.min(fl.length, idx.length)) { rowsUI(); render() } }) }); return }
      if (el.dataset && el.dataset.im != null) { var j = +el.dataset.im; return readImg(el.files[0], function (im) { IMS[j] = im; rowsUI(); render() }) }
      if (el.id === 'ld') { var f = el.files[0]; if (!f) return; var fr = new FileReader(); fr.onload = function () { try { C = Object.assign(C, JSON.parse(fr.result)); C.rows.forEach(function (r) { r.im = null }); IMS = []; build(); render() } catch (x) { alert(t('ملف غير صالح', 'Invalid file')) } }; fr.readAsText(f) } });
    root.addEventListener('click', function (e) { var b = e.target.closest('button,[data-th]'); if (!b) return;
      if (b.dataset.th != null) { C.theme = +b.dataset.th; [].forEach.call(root.querySelectorAll('[data-th]'), function (x) { x.style.outline = x === b ? '3px solid #111' : '' }); save(); render(); return }
      if (b.dataset.hero != null) { var hr = C.rows[+b.dataset.hero]; hr.hero = hr.hero ? 0 : 1; rowsUI(); save(); render(); return }
      if (b.dataset.del != null) { C.rows.splice(+b.dataset.del, 1); IMS.splice(+b.dataset.del, 1); rowsUI(); save(); render(); return }
      if (b.id === 'add') { C.rows.push({ n: '', p: '', o: '', nt: '', im: null, cat: '' }); rowsUI(); save(); render() }
      if (b.id === 'clr') { if (confirm(t('مسح كل المنتجات؟', 'Clear all products?'))) { C.rows = [{ n: '', p: '', o: '', nt: '', im: null, cat: '' }]; IMS = []; rowsUI(); save(); render() } }
      if (b.id === 'bulk') { var tx = prompt(t('الصق الأسطر (الاسم، السعر، السعر القديم، ملاحظة، القسم)', 'Paste lines (name, price, old price, note, category)'), ''); if (!tx) return; tx.split(/\n/).forEach(function (l) { if (!l.trim()) return; var c = l.split(/\t|;|,(?![^"]*")/).map(function (x) { return x.trim().replace(/^"|"$/g, '') }); C.rows.push({ n: c[0] || '', p: c[1] || '', o: c[2] || '', nt: c[3] || '', cat: c[4] || '', im: null }) }); rowsUI(); save(); render() }
      if (b.id === 'prev') { PAGE = Math.max(0, PAGE - 1); render() } if (b.id === 'next') { PAGE++; render() }
      if (b.dataset.pg != null) { PAGE = +b.dataset.pg; render() }
      if (b.id === 'png') exportPage(PAGE, 1, function (cv) { cv.toBlob(function (bl) { dl(bl, 'catalog-page-' + (PAGE + 1) + '.png') }, 'image/png') });
      if (b.id === 'allpng') { var n2 = pageList().length, i2 = 0; (function nx() { if (i2 >= n2) return; exportPage(i2, 1, function (cv) { cv.toBlob(function (bl) { dl(bl, 'catalog-page-' + (i2 + 1) + '.png'); i2++; setTimeout(nx, 350) }, 'image/png') }) })() }
      if (b.id === 'pdf') exportPDF(false);
      if (b.id === 'prt') exportPDF(true);
      if (b.id === 'sv') dl(new Blob([JSON.stringify(C)], { type: 'application/json' }), 'catalog-project.json') })
  }

  /* ---------- layout ---------- */
  function sz() { return SIZES.filter(function (z) { return z[0] === C.size })[0] || SIZES[0] }
  function grid(W, H) { var g = CPP.filter(function (c) { return c[0] === +C.cpp })[0] || CPP[3], c = g[1], r = g[2]; if (W > H) { var m = Math.max(c, r), n = Math.min(c, r); c = m; r = n } else if (c > r) { var tt = c; c = r; r = tt } if (g[0] === 2 && W <= H) { c = 1; r = 2 } return { c: c, r: r, per: g[0] } }
  function items() { return C.rows.map(function (r, i) { return { r: r, i: i } }).filter(function (x) { return x.r.n || x.r.p }) }
  function packInto(pages, g, x) { var span = x.r.hero && C.mode === 'flyer' ? [Math.min(2, g.c), Math.min(2, g.r)] : [1, 1], pg, r, c, rr2, cc;
    for (var k = 0; k < pages.length; k++) { pg = pages[k]; for (r = 0; r + span[1] <= g.r; r++)for (c = 0; c + span[0] <= g.c; c++) { var ok = true; for (rr2 = 0; rr2 < span[1] && ok; rr2++)for (cc = 0; cc < span[0]; cc++)if (pg.occ[(r + rr2) * g.c + c + cc]) { ok = false; break } if (ok) { for (rr2 = 0; rr2 < span[1]; rr2++)for (cc = 0; cc < span[0]; cc++)pg.occ[(r + rr2) * g.c + c + cc] = 1; pg.cells.push({ x: x, col: c, row: r, cs: span[0], rs: span[1] }); return true } } }
    return false }
  function pageList() {
    var z = sz(), g = grid(z[1], z[2]), it = items(), L = [], i;
    if (+C.cover) L.push({ k: 'cover' });
    function flow(arr, cat) { var pages = []; arr.forEach(function (x) { if (!packInto(pages, g, x)) { pages.push({ k: 'p', occ: [], cells: [], cat: cat, items: [] }); packInto(pages, g, x) } }); pages.forEach(function (pg) { pg.items = pg.cells.map(function (c) { return c.x }); L.push(pg) }) }
    if (+C.cats) { var by = {}, order = []; it.forEach(function (x) { var k = x.r.cat || ''; if (!by[k]) { by[k] = []; order.push(k) } by[k].push(x) }); order.forEach(function (k) { flow(by[k], k) }) } else flow(it, '');
    if (!it.length && !+C.cover) L.push({ k: 'p', items: [], cells: [], occ: [] });
    if (+C.back) L.push({ k: 'back' }); return L }

  /* ---------- drawing ---------- */
  var ctx;
  function rr(x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath() }
  function F(sz, w) { return (w || 700) + ' ' + Math.round(sz) + 'px "' + C.ff + '",Cairo,sans-serif' }
  function tx(s, x, y, sz, w, col, al, maxW) { s = String(s == null ? '' : s); ctx.font = F(sz, w); if (maxW) { while (sz > 10 && ctx.measureText(s).width > maxW) { sz -= 2; ctx.font = F(sz, w) } } ctx.fillStyle = col; ctx.textAlign = al || 'center'; ctx.fillText(s, x, y); return sz }
  function wrapTx(s, x, y, maxW, sz, w, col, al, lh, maxL) { ctx.font = F(sz, w); var ws = String(s).split(/\s+/), L = [], cur = ''; ws.forEach(function (q) { var tt = cur ? cur + ' ' + q : q; if (ctx.measureText(tt).width > maxW && cur) { L.push(cur); cur = q } else cur = tt }); if (cur) L.push(cur); L = L.slice(0, maxL || 3); L.forEach(function (l, i) { tx(l, x, y + i * lh, sz, w, col, al) }); return L.length }
  function logoAt(x, y, w, h, al) { if (!LOGO) return 0; var s = Math.min(w / LOGO.width, h / LOGO.height), lw = LOGO.width * s, lh = LOGO.height * s, lx = al === 'center' ? x + (w - lw) / 2 : al === 'right' ? x + w - lw : x; ctx.drawImage(LOGO, lx, y + (h - lh) / 2, lw, lh); return lw }
  function pal() { var p = PT.PAL[C.theme] || PT.PAL[0]; return { p: p[0], a: p[1], tc: p[2], bg: p[3] } }
  function bgFill(W, H, c) { ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H); if (C.pat && C.pat !== 'none') { /* simple pattern via PriceTag card pattern is internal; draw dots/stripes here */ ctx.save(); ctx.globalAlpha = .06; ctx.fillStyle = c.p; ctx.strokeStyle = c.p; ctx.lineWidth = 2; var st = Math.min(W, H) * .045, i, j; if (C.pat === 'dots' || C.pat === 'conf' || C.pat === 'circles') { for (i = 0; i < W; i += st) for (j = 0; j < H; j += st) { ctx.beginPath(); ctx.arc(i + st / 2, j + st / 2, st * .1, 0, 6.283); ctx.fill() } } else if (C.pat === 'grid' || C.pat === 'geo') { for (i = 0; i < W; i += st * 1.4) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke() } for (j = 0; j < H; j += st * 1.4) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke() } } else if (C.pat === 'stripes' || C.pat === 'diag' || C.pat === 'zig' || C.pat === 'waves') { for (i = -H; i < W; i += st * 1.2) { ctx.beginPath(); ctx.moveTo(i, H); ctx.lineTo(i + H, 0); ctx.stroke() } } else { for (i = 0; i < W; i += st * 2) for (j = 0; j < H; j += st * 2) { ctx.beginPath(); for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4, rr2 = k % 2 ? st * .25 : st * .5; ctx.lineTo(i + Math.cos(a) * rr2, j + Math.sin(a) * rr2) } ctx.closePath(); ctx.fill() } } ctx.restore() } }
  function burst(cx, cy, R, n, col) { ctx.beginPath(); for (var i = 0; i < n * 2; i++) { var r = i % 2 ? R * .84 : R, a = i * Math.PI / n; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) } ctx.closePath(); ctx.fillStyle = col; ctx.fill() }

  function cover(W, H, c) {
    var u = Math.min(W, H), st = C.cstyle, rtl = AR, al = 'center', HASC = !COVIMG && IMS.some(Boolean) && C.mode === 'flyer', BH = (HASC || COVIMG) ? .8 : .62;
    bgFill(W, H, c);
    if (st === 'band') { var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, c.p); g.addColorStop(1, c.a); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * BH); ctx.fillStyle = c.bg; ctx.beginPath(); ctx.moveTo(0, H * (BH - .06)); ctx.quadraticCurveTo(W / 2, H * (BH + .08), W, H * (BH - .06)); ctx.lineTo(W, H * (BH + .02)); ctx.lineTo(0, H * (BH + .02)); ctx.fill() }
    if (st === 'split') { ctx.fillStyle = c.p; ctx.fillRect(0, 0, W, H * (BH - .07)); ctx.fillStyle = c.a; ctx.fillRect(0, H * (BH - .07), W, H * .06) }
    if (st === 'diag') { ctx.fillStyle = c.p; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H * .5); ctx.lineTo(0, H * .7); ctx.fill(); ctx.fillStyle = c.a; ctx.beginPath(); ctx.moveTo(0, H * .7); ctx.lineTo(W, H * .5); ctx.lineTo(W, H * .56); ctx.lineTo(0, H * .76); ctx.fill() }
    if (st === 'frame') { ctx.fillStyle = c.tc; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = c.a; ctx.lineWidth = u * .006; rr(u * .04, u * .04, W - u * .08, H - u * .08, 0); ctx.stroke(); rr(u * .055, u * .055, W - u * .11, H - u * .11, 0); ctx.lineWidth = u * .002; ctx.stroke() }
    if (st === 'burst') { ctx.fillStyle = c.p; ctx.fillRect(0, 0, W, H); burst(W / 2, H * .36, u * .5, 22, c.a) }
    var onDark = st !== 'burst' || true, tcol = st === 'frame' ? c.a : '#ffffff', hcol = (st === 'burst') ? c.p : tcol;
    if (COVIMG) { ctx.save(); var ix = W * .12, iy = H * .06, iw = W * .76, ih = H * .4; rr(ix, iy, iw, ih, u * .03); ctx.clip(); var s = Math.max(iw / COVIMG.width, ih / COVIMG.height); ctx.drawImage(COVIMG, ix + (iw - COVIMG.width * s) / 2, iy + (ih - COVIMG.height * s) / 2, COVIMG.width * s, COVIMG.height * s); ctx.restore() }
    if (HASC) collage(W, H, c);
    var ty = (COVIMG || HASC) ? H * .62 : H * .3;
    if (LOGO) { var lh = u * .12; logoAt(W * .3, u * .05, W * .4, lh, 'center') } else if (C.store) tx(C.store, W / 2, u * .1, u * .06, 900, tcol, 'center', W * .8);
    var ts = u * (st === 'burst' ? .13 : .11), tcol2 = st === 'burst' ? c.p : tcol;
    var n = wrapTx(C.title, W / 2, ty + ts * (st === 'burst' ? 0 : .4), W * (st === 'burst' ? .62 : .84), ts, 900, st === 'burst' ? c.p : tcol, 'center', ts * 1.15, 2);
    var sy = ty + ts * (.4 + n * 1.15) + (st === 'burst' ? ts * .2 : 0);
    if (C.sub) tx(C.sub, W / 2, sy, u * .045, 700, st === 'burst' ? '#fff' : (st === 'frame' ? '#fff' : '#fff'), 'center', W * .8);
    if (C.dates) { var dw = Math.min(W * .7, u * .8), dh = u * .08, dy = H * .78; rr(W / 2 - dw / 2, dy, dw, dh, dh / 2); ctx.fillStyle = c.a === '#ffffff' ? c.p : c.a; ctx.fill(); tx(C.dates, W / 2, dy + dh * .67, dh * .5, 900, c.a === '#ffffff' ? '#fff' : c.tc, 'center', dw * .9) }
    if (C.phone || C.web) tx([C.phone, C.web].filter(Boolean).join('   |   '), W / 2, H * .93, u * .035, 700, st === 'frame' ? c.a : c.tc, 'center', W * .85)
  }
  function header(W, H, c, pg, total, cat) {
    var u = Math.min(W, H), hh = u * .1; var g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, c.p); g.addColorStop(1, c.p); ctx.fillStyle = g; ctx.fillRect(0, 0, W, hh); ctx.fillStyle = c.a; ctx.fillRect(0, hh, W, u * .008);
    var pd = u * .03; if (LOGO) { logoAt(AR ? W - pd - u * .2 : pd, hh * .12, u * .2, hh * .76, AR ? 'right' : 'left') } else if (C.store) tx(C.store, AR ? W - pd : pd, hh * .64, hh * .42, 900, '#fff', AR ? 'right' : 'left', W * .3);
    tx(cat || C.title, W / 2, hh * .66, hh * .5, 900, '#fff', 'center', W * .5);
    if (C.dates) tx(C.dates, AR ? pd : W - pd, hh * .62, hh * .3, 700, c.a === '#ffffff' ? '#fff' : c.a, AR ? 'left' : 'right', W * .22);
    return hh + u * .008 }
  function footer(W, H, c, pg, total) { var u = Math.min(W, H), fh = u * .05; ctx.fillStyle = c.p; ctx.fillRect(0, H - fh, W, fh); var pd = u * .03, bits = [C.phone, C.wa && ('WhatsApp ' + C.wa), C.web].filter(Boolean).join('  •  '); if (bits) tx(bits, AR ? W - pd : pd, H - fh * .33, fh * .5, 700, '#fff', AR ? 'right' : 'left', W * .7); tx(String(pg), AR ? pd : W - pd, H - fh * .3, fh * .55, 900, c.a === '#ffffff' ? '#fff' : c.a, AR ? 'left' : 'right'); return fh }
  function productPage(W, H, c, P, pgNo, total) {
    var u = Math.min(W, H); bgFill(W, H, c); var top = header(W, H, c, pgNo, total, P.cat), fh = footer(W, H, c, pgNo, total), g = grid(W, H), pd = u * .035, gap = u * .025, aw = W - pd * 2 - gap * (g.c - 1), ah = H - top - fh - pd * 2 - gap * (g.r - 1), cw = aw / g.c, ch = ah / g.r;
    P.items.forEach(function (x, k) { var col = k % g.c, row = Math.floor(k / g.c); if (AR) col = g.c - 1 - col; var cx = pd + col * (cw + gap), cy = top + pd + row * (ch + gap), r = x.r;
      var cv = PT.makeSync({ n: r.n, p: r.p, o: r.o, nt: r.nt, b: '', im: null }, { tpl: C.tpl, ff: C.ff, c: [c.p, c.a, c.tc, c.bg === '#ffffff' ? '#ffffff' : c.bg].slice(0, 4), img: IMS[x.i] || null, logo: null, s: { cur: C.cur, pos: 'after', dec: C.dec, dig: C.dig, sbar: +C.sbar, badge: C.badge, border: 1, rad: 14, store: C.store } }, Math.round(cw), Math.round(ch));
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = u * .012; ctx.shadowOffsetY = u * .004; rr(cx, cy, cw, ch, u * .014); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore(); ctx.drawImage(cv, cx, cy) })
  }
  function money(v) { var n = parseFloat(String(v).replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632 }).replace(',', '.')); if (isNaN(n)) return ''; var d = C.dec === 'auto' ? (n % 1 ? 2 : 0) : +C.dec; var q = n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); return C.dig === 'ar' ? q.replace(/[0-9]/g, function (x) { return '٠١٢٣٤٥٦٧٨٩'[x] }) : q }
  function pnum(v) { var n = parseFloat(String(v).replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632 }).replace(',', '.')); return isNaN(n) ? null : n }
  function scallop(W, y, r, col) { ctx.fillStyle = col; var n = Math.ceil(W / (r * 2)); for (var i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(i * r * 2 + r, y, r, 0, Math.PI); ctx.fill() } }
  function flyHeader(W, H, c, cat) {
    var u = Math.min(W, H), hh = H * .115; ctx.fillStyle = c.p; ctx.fillRect(0, 0, W, hh); scallop(W, hh, u * .018, c.p); var pd = u * .03;
    if (LOGO) logoAt(AR ? W - pd - u * .2 : pd, hh * .1, u * .2, hh * .8, AR ? 'right' : 'left'); else if (C.store) tx(C.store, AR ? W - pd : pd, hh * .6, hh * .36, 900, '#fff', AR ? 'right' : 'left', W * .26);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowOffsetY = 3; ctx.shadowBlur = 6; tx(cat || C.title, W / 2, hh * .64, hh * .56, 900, '#fff', 'center', W * .46); ctx.restore();
    if (C.dates) { var dw = Math.min(W * .24, u * .3), dh = hh * .46, dx = AR ? pd : W - pd - dw, dy = hh * .27; rr(dx, dy, dw, dh, dh / 2); ctx.fillStyle = c.a === '#ffffff' ? '#fff' : c.a; ctx.fill(); tx(C.dates, dx + dw / 2, dy + dh * .68, dh * .52, 900, c.a === '#ffffff' ? c.p : c.tc, 'center', dw * .9) }
    return hh + u * .02 }
  function flyFooter(W, H, c, pg) { var u = Math.min(W, H), fh = H * .045; ctx.fillStyle = c.p; ctx.fillRect(0, H - fh, W, fh); ctx.fillStyle = c.a; ctx.fillRect(0, H - fh - u * .004, W, u * .004); var pd = u * .03; if (C.terms) tx(C.terms, W / 2, H - fh * .32, fh * .42, 700, '#fff', 'center', W * .5); tx(String(pg), AR ? pd : W - pd, H - fh * .28, fh * .55, 900, c.a === '#ffffff' ? '#fff' : c.a, AR ? 'left' : 'right'); var bits = [C.phone, C.web].filter(Boolean).join(' • '); if (bits) tx(bits, AR ? W - pd : pd, H - fh * .32, fh * .42, 700, '#fff', AR ? 'right' : 'left', W * .22); return fh + u * .004 }
  function tile(cx, cy, cw, ch, x, c, big) {
    var r = x.r, u = Math.min(cw, ch), im = IMS[x.i], p = pnum(r.p), o = pnum(r.o), d = p != null && o && o > p ? Math.round((o - p) / o * 100) : 0;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.16)'; ctx.shadowBlur = u * .05; ctx.shadowOffsetY = u * .015; rr(cx, cy, cw, ch, u * .06); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore(); ctx.save(); rr(cx, cy, cw, ch, u * .06); ctx.clip();
    var ih = ch * (big ? .66 : .6); var g = ctx.createLinearGradient(cx, cy, cx, cy + ih); g.addColorStop(0, c.bg); g.addColorStop(1, '#fff'); ctx.fillStyle = g; ctx.fillRect(cx, cy, cw, ih);
    if (im) { var s = Math.min((cw * .92) / im.width, (ih * .92) / im.height); ctx.drawImage(im, cx + (cw - im.width * s) / 2, cy + (ih - im.height * s) / 2, im.width * s, im.height * s) } else { ctx.globalAlpha = .18; burst(cx + cw / 2, cy + ih / 2, Math.min(cw, ih) * .36, 14, c.p); ctx.globalAlpha = 1; tx((r.n || '?').trim().charAt(0), cx + cw / 2, cy + ih / 2 + u * .09, u * .26, 900, c.p, 'center') }
    ctx.fillStyle = c.p; ctx.fillRect(cx, cy + ih, cw, Math.max(3, u * .012));
    var ny = cy + ih + u * .1, ns = u * (big ? .1 : .09), side = AR ? 'right' : 'left', px = AR ? cx + cw - u * .06 : cx + u * .06;
    ctx.font = F(ns, 900); var ws = String(r.n).split(/\s+/), L = [], cur = ''; ws.forEach(function (w) { var tt = cur ? cur + ' ' + w : w; if (ctx.measureText(tt).width > cw * .9 && cur) { L.push(cur); cur = w } else cur = tt }); if (cur) L.push(cur); L = L.slice(0, 2); L.forEach(function (l, k) { tx(l, px, ny + k * ns * 1.15, ns, 900, c.tc, side, cw * .88) });
    if (r.nt) tx(r.nt, px, ny + L.length * ns * 1.15 + ns * .1, ns * .7, 700, c.p, side, cw * .5);
    var R = u * (big ? .26 : .21), bx = AR ? cx + R * 1.05 : cx + cw - R * 1.05, by = cy + ih - R * .15;
    if (r.p !== '') { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 8; burst(bx, by, R, 16, c.a === '#ffffff' ? c.tc : c.a); ctx.restore(); burst(bx, by, R * .86, 16, c.p);
      var cur2 = C.cur || ''; tx(money(r.p), bx, by + R * .1, R * .52, 900, '#fff', 'center', R * 1.3); if (cur2) tx(cur2, bx, by + R * .5, R * .26, 700, '#fff', 'center', R * 1.1);
      if (o) { var os = money(r.o) + ' ' + cur2, sz2 = R * .26; ctx.font = F(sz2, 700); var ow = Math.min(ctx.measureText(os).width, R * 1.3); tx(os, bx, by - R * .5, sz2 * .9, 700, '#fff', 'center', R * 1.2); ctx.fillStyle = '#fff'; ctx.fillRect(bx - ow * .45, by - R * .57, ow * .9, 2) } }
    if (d && +C.sbar) { var dr = u * .11, dx = AR ? cx + cw - dr * 1.1 : cx + dr * 1.1, dy = cy + dr * 1.1; burst(dx, dy, dr, 12, '#ffd400'); tx('-' + d + '%', dx, dy + dr * .2, dr * .62, 900, '#c00', 'center', dr * 1.5) }
    ctx.restore() }
  function flyerPage(W, H, c, P, pgNo) {
    var u = Math.min(W, H); ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H); bgFill(W, H, c); ctx.save(); ctx.globalAlpha = .08; burst(W * .9, H * .55, u * .5, 18, c.p); burst(W * .05, H * .85, u * .35, 14, c.a); ctx.restore();
    var top = flyHeader(W, H, c, P.cat), fh = flyFooter(W, H, c, pgNo), g = grid(W, H), pd = u * .03, gap = u * .02, aw = W - pd * 2 - gap * (g.c - 1), ah = H - top - fh - pd * 1.5 - gap * (g.r - 1), cw = aw / g.c, ch = ah / g.r;
    (P.cells || []).forEach(function (q) { var col = AR ? g.c - q.col - q.cs : q.col, x0 = pd + col * (cw + gap), y0 = top + pd * .6 + q.row * (ch + gap), w = cw * q.cs + gap * (q.cs - 1), h = ch * q.rs + gap * (q.rs - 1); tile(x0, y0, w, h, q.x, c, q.cs > 1 || q.rs > 1) }) }
  function collage(W, H, c) { var ims = IMS.filter(Boolean).slice(0, 6); if (!ims.length) return; var cols = ims.length > 4 ? 3 : 2, rows = Math.ceil(ims.length / cols), cw = W * .78 / cols, ch = H * .5 / rows, x0 = W * .11, y0 = H * .1; ims.forEach(function (im, k) { var cx = x0 + (k % cols) * cw + cw / 2, cy = y0 + Math.floor(k / cols) * ch + ch / 2; ctx.save(); ctx.translate(cx, cy); ctx.rotate(((k * 37) % 7 - 3) * .018); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 14; rr(-cw * .46, -ch * .46, cw * .92, ch * .92, 14); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowBlur = 0; rr(-cw * .42, -ch * .42, cw * .84, ch * .84, 10); ctx.clip(); var s = Math.min(cw * .84 / im.width, ch * .84 / im.height); ctx.drawImage(im, -im.width * s / 2, -im.height * s / 2, im.width * s, im.height * s); ctx.restore() }) }
  function backPage(W, H, c) {
    var u = Math.min(W, H); bgFill(W, H, c); ctx.fillStyle = c.p; ctx.fillRect(0, 0, W, H * .32); ctx.fillStyle = c.a; ctx.fillRect(0, H * .32, W, u * .012);
    if (LOGO) logoAt(W * .3, H * .05, W * .4, H * .16, 'center'); else if (C.store) tx(C.store, W / 2, H * .15, u * .08, 900, '#fff', 'center', W * .8);
    tx(t('تواصل معنا', 'Contact us'), W / 2, H * .28, u * .06, 900, '#fff', 'center', W * .8);
    var L = []; if (C.phone) L.push(['📞', C.phone]); if (C.wa) L.push(['💬', 'WhatsApp: ' + C.wa]); if (C.web) L.push(['🌐', C.web]); if (C.addr) L.push(['📍', C.addr]); var y = H * .42, fs = u * .05;
    L.forEach(function (l) { rr(W * .1, y - fs * .85, W * .8, fs * 1.4, fs * .7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = c.p; ctx.lineWidth = 3; ctx.stroke(); tx(l[0] + '  ' + l[1], W / 2, y + fs * .1, fs, 700, c.tc, 'center', W * .74); y += fs * 1.8 });
    var q = C.qrt || C.web; if (q && window.QR) { try { var m = QR.make(q, 'M'), n = m.length, qs = Math.min(u * .22, H - y - u * .12), qx = W / 2 - qs / 2, qy = Math.max(y, H * .66); if (qy + qs < H - u * .06) { ctx.fillStyle = '#fff'; ctx.fillRect(qx, qy, qs, qs); ctx.fillStyle = '#000'; var q0 = 2, uu = qs / (n + q0 * 2); for (var r = 0; r < n; r++)for (var k = 0; k < n; k++)if (m[r][k]) ctx.fillRect(qx + (k + q0) * uu, qy + (r + q0) * uu, Math.ceil(uu), Math.ceil(uu)) } } catch (e) { } }
    if (C.terms) wrapTx(C.terms, W / 2, H * .94, W * .84, u * .028, 400, c.tc, 'center', u * .036, 2)
  }
  function drawPage(i, cv, sc) { var z = sz(), W = Math.round(z[1] * sc), H = Math.round(z[2] * sc); cv.width = W; cv.height = H; ctx = cv.getContext('2d'); var L = pageList(), P = L[Math.min(i, L.length - 1)], c = pal(); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    if (P.k === 'cover') cover(W, H, c); else if (P.k === 'back') backPage(W, H, c); else if (C.mode === 'flyer') flyerPage(W, H, c, P, i + 1); else productPage(W, H, c, P, i + 1, L.length) }
  function ready() { return Promise.all([PT.fonts(C.ff), PT.fonts('Cairo')]) }
  function exportPage(i, sc, cb) { ready().then(function () { var c = document.createElement('canvas'); drawPage(i, c, sc); cb(c) }) }
  function render() { var tok = ++TOK; ready().then(function () { if (tok !== TOK) return; var cv = $('#cv'); if (!cv) return; var L = pageList(); PAGE = Math.max(0, Math.min(PAGE, L.length - 1)); drawPage(PAGE, cv, 1); $('#pg').textContent = (PAGE + 1) + ' / ' + L.length; var st = $('#strip'); st.innerHTML = L.map(function (_, k) { return '<button type="button" class="pt-b ' + (k === PAGE ? '' : 'pt-g') + '" data-pg="' + k + '">' + (k + 1) + '</button>' }).join('') }) }

  /* ---------- PDF (JPEG pages, no libraries) ---------- */
  function exportPDF(print) {
    var L = pageList(), z = sz(), imgs = [], i = 0, win = print ? window.open('', '_blank') : null; ready().then(function () { (function nx() { if (i >= L.length) return fin(); var c = document.createElement('canvas'); drawPage(i, c, 1); c.toBlob(function (bl) { bl.arrayBuffer().then(function (ab) { imgs.push({ b: new Uint8Array(ab), w: c.width, h: c.height, u: win ? c.toDataURL('image/jpeg', .92) : null }); i++; nx() }) }, 'image/jpeg', .92) })() });
    function fin() { if (win) { win.document.write('<!doctype html><title>' + (C.title || 'catalog') + '</title><style>@page{size:' + (z[1] * 25.4 / 150) + 'mm ' + (z[2] * 25.4 / 150) + 'mm;margin:0}html,body{margin:0}img{width:' + (z[1] * 25.4 / 150) + 'mm;height:' + (z[2] * 25.4 / 150) + 'mm;display:block;page-break-after:always;break-after:page}img:last-of-type{page-break-after:auto}</style>' + imgs.map(function (m) { return '<img src="' + m.u + '">' }).join('') + '<script>onload=function(){setTimeout(function(){print()},600)}<\/script>'); win.document.close(); return }
      var enc = new TextEncoder(), parts = [], off = 0, xr = []; function add(x) { var u8 = typeof x === 'string' ? enc.encode(x) : x; parts.push(u8); off += u8.length }
      function obj(n, body) { xr[n] = off; add(n + ' 0 obj\n' + body + '\nendobj\n') }
      add('%PDF-1.4\n'); var N = imgs.length, kids = []; for (var k = 0; k < N; k++)kids.push((3 + k * 3) + ' 0 R');
      obj(1, '<< /Type /Catalog /Pages 2 0 R >>'); obj(2, '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + N + ' >>');
      imgs.forEach(function (m, k) { var pn = 3 + k * 3, cn = pn + 1, inn = pn + 2, pw = (m.w * 72 / 150).toFixed(2), ph = (m.h * 72 / 150).toFixed(2), cs = 'q ' + pw + ' 0 0 ' + ph + ' 0 0 cm /Im0 Do Q';
        obj(pn, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pw + ' ' + ph + '] /Resources << /XObject << /Im0 ' + inn + ' 0 R >> >> /Contents ' + cn + ' 0 R >>'); obj(cn, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream');
        xr[inn] = off; add(inn + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + m.w + ' /Height ' + m.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + m.b.length + ' >>\nstream\n'); add(m.b); add('\nendstream\nendobj\n') });
      var total = 3 + N * 3, xo = off; add('xref\n0 ' + total + '\n0000000000 65535 f \n'); for (var q = 1; q < total; q++)add(('0000000000' + xr[q]).slice(-10) + ' 00000 n \n'); add('trailer\n<< /Size ' + total + ' /Root 1 0 R >>\nstartxref\n' + xo + '\n%%EOF');
      dl(new Blob(parts, { type: 'application/pdf' }), 'catalog.pdf') }
  }
  build(); bind(); render();
})();
