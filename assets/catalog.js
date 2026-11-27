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
  var C = { title: t('عروض الأسبوع', 'Weekly Offers'), sub: t('أقوى الأسعار على مدار الأسبوع', 'Best prices all week'), dates: '', store: '', phone: '', wa: '', addr: '', web: '', terms: t('العروض سارية حتى نفاد الكمية. الصور للتوضيح فقط.', 'Offers valid while stock lasts. Images are for illustration only.'), size: 'a4p', theme: 0, ff: 'Cairo', tpl: 'classic', cpp: 6, cover: 1, back: 1, cstyle: 'band', pat: 'dots', cur: 'ر.س', dec: 'auto', dig: 'latin', sbar: 1, badge: t('خصم', 'SALE'), qrt: '', cats: 0,
    rows: [{ n: t('منتج 1', 'Product 1'), p: '19.99', o: '29.99', nt: '', im: null, cat: '' }, { n: t('منتج 2', 'Product 2'), p: '49', o: '65', nt: '', im: null, cat: '' }, { n: t('منتج 3', 'Product 3'), p: '9.5', o: '', nt: t('جديد', 'New'), im: null, cat: '' }, { n: t('منتج 4', 'Product 4'), p: '120', o: '150', nt: '', im: null, cat: '' }, { n: t('منتج 5', 'Product 5'), p: '35', o: '50', nt: '', im: null, cat: '' }, { n: t('منتج 6', 'Product 6'), p: '15', o: '22', nt: '', im: null, cat: '' }] };
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
      '<details open class="pt-d"><summary>🎨 ' + t('التصميم', 'Design') + '</summary>' + sel('size', t('مقاس الصفحة', 'Page size'), SIZES.map(function (z) { return [z[0], z[3]] }), C.size) + '<div class="pt-pal">' + THEMES.map(function (i) { var p = PT.PAL[i]; return '<button type="button" class="pt-sw" data-th="' + i + '" title="' + p[4] + '" style="background:linear-gradient(135deg,' + p[0] + ' 50%,' + p[1] + ' 50%)' + (i === C.theme ? ';outline:3px solid #111' : '') + '"></button>' }).join('') + '</div>' + sel('cstyle', t('تصميم الغلاف', 'Cover style'), COVERS, C.cstyle) + sel('tpl', t('تصميم بطاقة السعر', 'Price card style'), PT.TPL, C.tpl) + sel('pat', t('نمط الخلفية', 'Background pattern'), PT.PATS, C.pat) + sel('ff', t('الخط', 'Font'), PT.FONTS.map(function (f) { return [f, f] }), C.ff) + sel('cpp', t('منتجات في الصفحة', 'Products per page'), CPP.map(function (c) { return [c[0], c[0]] }), C.cpp) + '<div class="pt-2">' + ip('cur', t('العملة', 'Currency'), C.cur) + sel('dig', t('الأرقام', 'Digits'), [['latin', '0123'], ['ar', '٠١٢٣']], C.dig) + '</div>' + ip('badge', t('نص شارة الخصم', 'Discount badge'), C.badge) + ck('cover', t('صفحة غلاف', 'Cover page'), C.cover) + ck('back', t('صفحة خلفية (تواصل)', 'Back page (contact)'), C.back) + ck('cats', t('عناوين الأقسام فوق المنتجات', 'Category headings'), C.cats) + '</details>' +
      '<details class="pt-d"><summary>🏷 ' + t('الشعار وصورة الغلاف', 'Logo & cover image') + '</summary><label class="pt-l">' + t('الشعار', 'Logo') + '<input type="file" id="logo" accept="image/*" class="pt-i"></label><label class="pt-l">' + t('صورة الغلاف (اختياري)', 'Cover image (optional)') + '<input type="file" id="cimg" accept="image/*" class="pt-i"></label></details>' +
      '<details class="pt-d"><summary>📞 ' + t('صفحة التواصل', 'Contact page') + '</summary>' + ip('phone', t('هاتف', 'Phone'), C.phone) + ip('wa', t('واتساب', 'WhatsApp'), C.wa) + ip('addr', t('العنوان / الفروع', 'Address / branches'), C.addr) + ip('web', t('الموقع أو الحساب', 'Website / handle'), C.web) + ip('qrt', t('رابط QR (اختياري)', 'QR link (optional)'), C.qrt, 'text', 'https://') + ip('terms', t('الشروط', 'Terms'), C.terms) + '</details></div>' +
      '<div class="pt-main"><div class="pt-bar"><button type="button" class="pt-b" id="prev">◀</button><b id="pg"></b><button type="button" class="pt-b" id="next">▶</button><span style="flex:1"></span><button type="button" class="pt-b pt-p" id="png">⬇ PNG</button><button type="button" class="pt-b pt-p" id="pdf">⬇ PDF</button><button type="button" class="pt-b pt-p" id="prt">🖨 ' + t('طباعة', 'Print') + '</button></div><canvas id="cv" class="pt-cv"></canvas><div class="pt-bar" id="strip"></div><div class="pt-bar"><button type="button" class="pt-b pt-g" id="sv">💾 ' + t('حفظ المشروع', 'Save project') + '</button><label class="pt-b pt-g" style="cursor:pointer">📂 ' + t('فتح مشروع', 'Open project') + '<input type="file" id="ld" accept=".json" hidden></label><button type="button" class="pt-b pt-g" id="allpng">⬇ ' + t('كل الصفحات PNG', 'All pages PNG') + '</button></div></div></div>';
    rowsUI()
  }
  function rowsUI() {
    $('#rows').innerHTML = C.rows.map(function (r, i) { return '<div class="pt-row ct-row" data-i="' + i + '"><input class="pt-i" data-k="n" placeholder="' + t('الاسم', 'Name') + '" value="' + esc(r.n) + '"><input class="pt-i pt-s" data-k="p" inputmode="decimal" placeholder="' + t('السعر', 'Price') + '" value="' + esc(r.p) + '"><input class="pt-i pt-s" data-k="o" inputmode="decimal" placeholder="' + t('القديم', 'Old') + '" value="' + esc(r.o) + '"><input class="pt-i" data-k="nt" placeholder="' + t('ملاحظة', 'Note') + '" value="' + esc(r.nt) + '"><input class="pt-i pt-s" data-k="cat" placeholder="' + t('القسم', 'Category') + '" value="' + esc(r.cat) + '"><label class="pt-b pt-g pt-im">' + (IMS[i] ? '✅' : '🖼') + '<input type="file" accept="image/*" data-im="' + i + '" hidden></label><button type="button" class="pt-b pt-g" data-del="' + i + '">✕</button></div>' }).join(''); $('#cnt').textContent = C.rows.length
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
  function pageList() {
    var z = sz(), g = grid(z[1], z[2]), it = items(), L = [], i;
    if (+C.cover) L.push({ k: 'cover' });
    if (+C.cats) { var by = {}, order = []; it.forEach(function (x) { var k = x.r.cat || ''; if (!by[k]) { by[k] = []; order.push(k) } by[k].push(x) }); order.forEach(function (k) { for (i = 0; i < by[k].length; i += g.per) L.push({ k: 'p', items: by[k].slice(i, i + g.per), cat: k }) }) }
    else for (i = 0; i < it.length; i += g.per) L.push({ k: 'p', items: it.slice(i, i + g.per) });
    if (!it.length && !+C.cover) L.push({ k: 'p', items: [] });
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
    var u = Math.min(W, H), st = C.cstyle, rtl = AR, al = 'center';
    bgFill(W, H, c);
    if (st === 'band') { var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, c.p); g.addColorStop(1, c.a); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * .62); ctx.fillStyle = c.bg; ctx.beginPath(); ctx.moveTo(0, H * .56); ctx.quadraticCurveTo(W / 2, H * .7, W, H * .56); ctx.lineTo(W, H * .64); ctx.lineTo(0, H * .64); ctx.fill() }
    if (st === 'split') { ctx.fillStyle = c.p; ctx.fillRect(0, 0, W, H * .55); ctx.fillStyle = c.a; ctx.fillRect(0, H * .55, W, H * .06) }
    if (st === 'diag') { ctx.fillStyle = c.p; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H * .5); ctx.lineTo(0, H * .7); ctx.fill(); ctx.fillStyle = c.a; ctx.beginPath(); ctx.moveTo(0, H * .7); ctx.lineTo(W, H * .5); ctx.lineTo(W, H * .56); ctx.lineTo(0, H * .76); ctx.fill() }
    if (st === 'frame') { ctx.fillStyle = c.tc; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = c.a; ctx.lineWidth = u * .006; rr(u * .04, u * .04, W - u * .08, H - u * .08, 0); ctx.stroke(); rr(u * .055, u * .055, W - u * .11, H - u * .11, 0); ctx.lineWidth = u * .002; ctx.stroke() }
    if (st === 'burst') { ctx.fillStyle = c.p; ctx.fillRect(0, 0, W, H); burst(W / 2, H * .36, u * .5, 22, c.a) }
    var onDark = st !== 'burst' || true, tcol = st === 'frame' ? c.a : '#ffffff', hcol = (st === 'burst') ? c.p : tcol;
    if (COVIMG) { ctx.save(); var ix = W * .12, iy = H * .06, iw = W * .76, ih = H * .4; rr(ix, iy, iw, ih, u * .03); ctx.clip(); var s = Math.max(iw / COVIMG.width, ih / COVIMG.height); ctx.drawImage(COVIMG, ix + (iw - COVIMG.width * s) / 2, iy + (ih - COVIMG.height * s) / 2, COVIMG.width * s, COVIMG.height * s); ctx.restore() }
    var ty = COVIMG ? H * .56 : H * .3;
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
    if (P.k === 'cover') cover(W, H, c); else if (P.k === 'back') backPage(W, H, c); else productPage(W, H, c, P, i + 1, L.length) }
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
