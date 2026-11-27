/* DIAMOND HUB daily utilities: all run in the browser, no AI, no server. */
(function () {
  var root = document.getElementById('u-app');
  if (!root) return;
  var tool = root.getAttribute('data-tool'), AR = document.documentElement.lang === 'ar';
  function $(s, r) { return (r || root).querySelector(s); }
  function t(a, e) { return AR ? a : e; }
  function num(v) { var n = parseFloat(String(v).replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632 }).replace(/,/g, '.').replace(/[^0-9.\-]/g, '')); return isNaN(n) ? NaN : n }
  function fmt(n, d) { return isFinite(n) ? n.toLocaleString(AR ? 'ar-EG-u-nu-latn' : 'en-US', { maximumFractionDigits: d == null ? 2 : d }) : '—' }
  function out(html) { var o = $('.u-out'); o.innerHTML = html; o.style.display = html ? 'block' : 'none' }
  function row(l, v) { return '<div class="u-r"><span>' + l + '</span><b>' + v + '</b></div>' }
  function copyBtn(txt) { return '<button type="button" class="u-b u-cp" data-c="' + encodeURIComponent(txt) + '">' + t('📋 نسخ', '📋 Copy') + '</button>' }
  root.addEventListener('click', function (e) { var b = e.target.closest('.u-cp'); if (!b) return; var tx = decodeURIComponent(b.getAttribute('data-c')); try { navigator.clipboard.writeText(tx) } catch (x) { var a = document.createElement('textarea'); a.value = tx; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove() } var o = b.textContent; b.textContent = t('✓ تم النسخ', '✓ Copied'); setTimeout(function () { b.textContent = o }, 1400) });
  function mount(form) { root.innerHTML = '<div class="u-box">' + form + '</div><div class="u-out" style="display:none"></div>' }
  function inp(id, label, ph, type, val) { return '<label class="u-l">' + label + '<input id="' + id + '" class="u-i" type="' + (type || 'text') + '" inputmode="' + (type === 'number' ? 'decimal' : 'text') + '" placeholder="' + (ph || '') + '" value="' + (val == null ? '' : val) + '"></label>' }
  function sel(id, label, opts, v) { return '<label class="u-l">' + label + '<select id="' + id + '" class="u-i">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] == v ? ' selected' : '') + '>' + o[1] + '</option>' }).join('') + '</select></label>' }
  function on(ids, fn) { ids.forEach(function (i) { var el = $('#' + i); if (el) { el.addEventListener('input', fn); el.addEventListener('change', fn) } }); fn() }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) }
  function pd(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null }
  var DAY = 864e5;
  function dd(a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DAY) }
  function hijri(d) { try { var p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(d), o = {}; p.forEach(function (x) { o[x.type] = x.value }); return { y: +o.year, m: +o.month, d: +o.day } } catch (e) { return null } }
  var HM_AR = ['محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة'], HM_EN = ['Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II', 'Rajab', 'Shaʿban', 'Ramadan', 'Shawwal', 'Dhu al-Qaʿdah', 'Dhu al-Hijjah'];
  function hname(m) { return (AR ? HM_AR : HM_EN)[m - 1] }
  var GM_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'], GM_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function gname(d) { return d.getDate() + ' ' + (AR ? GM_AR : GM_EN)[d.getMonth()] + ' ' + d.getFullYear() }
  var WD_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], WD_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function wd(d) { return (AR ? WD_AR : WD_EN)[d.getDay()] }

  var T = {};
  /* 1. age */
  T.age = function () {
    mount(inp('d', t('تاريخ الميلاد', 'Date of birth'), '', 'date', '') + inp('to', t('احسب حتى تاريخ', 'Calculate up to'), '', 'date', today()));
    on(['d', 'to'], function () {
      var a = pd($('#d').value), b = pd($('#to').value); if (!a || !b) return out('');
      if (b < a) return out('<p class="u-w">' + t('تاريخ الحساب قبل تاريخ الميلاد.', 'The end date is before the birth date.') + '</p>');
      var y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
      if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate() } if (m < 0) { y--; m += 12 }
      var nb = new Date(b.getFullYear(), a.getMonth(), a.getDate()); if (nb < b) nb = new Date(b.getFullYear() + 1, a.getMonth(), a.getDate());
      var days = dd(a, b), h = hijri(a), hb = hijri(b), hy = hb && h ? hb.y - h.y - ((hb.m < h.m || (hb.m === h.m && hb.d < h.d)) ? 1 : 0) : null;
      out('<div class="u-big">' + y + ' ' + t('سنة', 'yrs') + ' · ' + m + ' ' + t('شهر', 'mo') + ' · ' + d + ' ' + t('يوم', 'd') + '</div>' + row(t('إجمالي الأيام', 'Total days'), fmt(days, 0)) + row(t('إجمالي الأسابيع', 'Total weeks'), fmt(Math.floor(days / 7), 0)) + row(t('إجمالي الأشهر', 'Total months'), fmt(y * 12 + m, 0)) + row(t('ساعات تقريبًا', 'Approx. hours'), fmt(days * 24, 0)) + (hy != null ? row(t('العمر بالهجري', 'Age in Hijri years'), hy + ' ' + t('سنة', 'yrs')) : '') + row(t('يوم الميلاد', 'Born on a'), wd(a)) + row(t('عيد الميلاد القادم', 'Next birthday'), gname(nb) + ' (' + t('بعد ', 'in ') + dd(b, nb) + t(' يوم', ' days') + ')'))
    })
  };
  /* 2. hijri converter */
  function toHijriStr(d) { var h = hijri(d); return h ? h.d + ' ' + hname(h.m) + ' ' + h.y + t(' هـ', ' AH') : '' }
  function hij2greg(y, m, d) { var yr = Math.floor(y * 0.970229 + 621.57) - 1, c = new Date(yr, 0, 1); for (var i = 0; i < 1100; i++) { var x = new Date(c.getTime() + i * DAY), h = hijri(x); if (h && h.y === y && h.m === m && h.d === d) return x } return null }
  T.hijri = function () {
    mount('<div class="u-2"><div><h3>' + t('ميلادي ← هجري', 'Gregorian → Hijri') + '</h3>' + inp('g', t('التاريخ الميلادي', 'Gregorian date'), '', 'date', today()) + '</div><div><h3>' + t('هجري ← ميلادي', 'Hijri → Gregorian') + '</h3><div class="u-3">' + inp('hd', t('يوم', 'Day'), '', 'number', '1') + sel('hm', t('الشهر', 'Month'), HM_AR.map(function (n, i) { return [i + 1, (AR ? HM_AR : HM_EN)[i]] }), 1) + inp('hy', t('السنة', 'Year'), '', 'number', '1447') + '</div></div></div>');
    on(['g', 'hd', 'hm', 'hy'], function () {
      var g = pd($('#g').value), o = '';
      var th = hijri(new Date()); if (th && !$('#hy').dataset.set) { $('#hy').value = th.y; $('#hm').value = th.m; $('#hd').value = th.d; $('#hy').dataset.set = 1 }
      if (g) o += '<h3>' + t('التاريخ الهجري', 'Hijri date') + '</h3><div class="u-big">' + toHijriStr(g) + '</div>' + row(t('اليوم', 'Weekday'), wd(g));
      var y = num($('#hy').value), m = num($('#hm').value), d = num($('#hd').value);
      if (y > 1300 && y < 1600 && d >= 1 && d <= 30) { var r = hij2greg(y, m, d); o += '<h3>' + t('التاريخ الميلادي', 'Gregorian date') + '</h3>' + (r ? '<div class="u-big">' + gname(r) + '</div>' + row(t('اليوم', 'Weekday'), wd(r)) : '<p class="u-w">' + t('تاريخ هجري غير صالح.', 'Invalid Hijri date.') + '</p>') }
      o += '<p class="u-n">' + t('يعتمد التحويل على تقويم أم القرى المدمج في المتصفح، وقد يختلف يومًا واحدًا عن الرؤية الشرعية.', 'Uses the Umm al-Qura calendar built into your browser; it may differ by a day from local moon sighting.') + '</p>';
      out(o)
    })
  };
  /* 3. VAT */
  T.vat = function () {
    mount(inp('a', t('المبلغ', 'Amount'), '1000', 'number', '') + inp('r', t('نسبة الضريبة %', 'VAT rate %'), '15', 'number', '15') + sel('m', t('نوع الحساب', 'Mode'), [['add', t('إضافة الضريبة على المبلغ', 'Add VAT to amount')], ['ext', t('استخراج الضريبة من مبلغ شامل', 'Extract VAT from a VAT-inclusive amount')]], 'add') + '<div class="u-ch">' + [['15', t('السعودية والبحرين 15% / 10%', 'KSA 15%')], ['5', t('الإمارات 5%', 'UAE 5%')], ['14', t('مصر 14%', 'Egypt 14%')], ['10', '10%']].map(function (p) { return '<button type="button" class="u-b u-s" data-r="' + p[0] + '">' + p[1] + '</button>' }).join('') + '</div>');
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-r]'); if (b) { $('#r').value = b.dataset.r; $('#r').dispatchEvent(new Event('input')) } });
    on(['a', 'r', 'm'], function () {
      var a = num($('#a').value), r = num($('#r').value); if (isNaN(a) || isNaN(r)) return out('');
      var net, vat, tot; if ($('#m').value === 'add') { net = a; vat = a * r / 100; tot = a + vat } else { tot = a; net = a / (1 + r / 100); vat = tot - net }
      out('<div class="u-big">' + fmt(tot) + '</div>' + row(t('المبلغ قبل الضريبة', 'Net amount'), fmt(net)) + row(t('قيمة الضريبة', 'VAT amount'), fmt(vat)) + row(t('الإجمالي شامل الضريبة', 'Total incl. VAT'), fmt(tot)))
    })
  };
  /* 4. tafqeet / number to words */
  var A1 = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'], A1F = ['', 'واحدة', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثماني', 'تسع', 'عشر'];
  var TEN = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'], HUN = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];
  function g3(n, fem) {
    var o = [], h = Math.floor(n / 100), r = n % 100; if (h) o.push(HUN[h]);
    if (r) { var u = r % 10, te = Math.floor(r / 10), s; var U = fem ? A1F : A1;
      if (r <= 10) s = U[r]; else if (r < 20) { if (r === 11) s = fem ? 'إحدى عشرة' : 'أحد عشر'; else if (r === 12) s = fem ? 'اثنتا عشرة' : 'اثنا عشر'; else s = (fem ? A1F[u] + ' عشرة' : A1[u] + ' عشر') }
      else s = (u ? (u === 1 ? (fem ? 'إحدى' : 'واحد') : u === 2 ? (fem ? 'اثنتان' : 'اثنان') : U[u]) + ' و' : '') + TEN[te]; o.push(s) }
    return o.join(' و')
  }
  var SC = [['', '', '', ''], ['ألف', 'ألفان', 'آلاف', 'ألفاً'], ['مليون', 'مليونان', 'ملايين', 'مليوناً'], ['مليار', 'ملياران', 'مليارات', 'ملياراً'], ['تريليون', 'تريليونان', 'تريليونات', 'تريليوناً']];
  function arWords(n, fem) {
    if (n === 0) return 'صفر'; var grp = [], x = n; while (x > 0) { grp.push(x % 1000); x = Math.floor(x / 1000) }
    var parts = []; for (var i = grp.length - 1; i >= 0; i--) { var g = grp[i]; if (!g) continue;
      if (i === 0) parts.push(g3(g, fem)); else { var s = SC[i], w;
        if (g === 1) w = s[0]; else if (g === 2) w = s[1]; else if (g <= 10) w = g3(g, false) + ' ' + s[2]; else if (g < 100) w = g3(g, false) + ' ' + s[3]; else if (g === 200) w = 'مئتا ' + s[0]; else { var rr = g % 100; w = g3(g, false) + ' ' + (rr >= 3 && rr <= 10 ? s[2] : rr >= 11 ? s[3] : s[0]) } parts.push(w) } }
    return parts.join(' و')
  }
  var CUR = { SAR: ['ريال سعودي', 'ريالان سعوديان', 'ريالات سعودية', 'ريالاً سعودياً', 'هللة', 'هللتان', 'هللات', 'هللة', true, 'Saudi riyal', 'halala'], AED: ['درهم إماراتي', 'درهمان إماراتيان', 'دراهم إماراتية', 'درهماً إماراتياً', 'فلس', 'فلسان', 'فلوس', 'فلساً', false, 'UAE dirham', 'fils'], EGP: ['جنيه مصري', 'جنيهان مصريان', 'جنيهات مصرية', 'جنيهاً مصرياً', 'قرش', 'قرشان', 'قروش', 'قرشاً', false, 'Egyptian pound', 'piastre'], KWD: ['دينار كويتي', 'ديناران كويتيان', 'دنانير كويتية', 'ديناراً كويتياً', 'فلس', 'فلسان', 'فلوس', 'فلساً', false, 'Kuwaiti dinar', 'fils'], QAR: ['ريال قطري', 'ريالان قطريان', 'ريالات قطرية', 'ريالاً قطرياً', 'درهم', 'درهمان', 'دراهم', 'درهماً', false, 'Qatari riyal', 'dirham'], USD: ['دولار أمريكي', 'دولاران أمريكيان', 'دولارات أمريكية', 'دولاراً أمريكياً', 'سنت', 'سنتان', 'سنتات', 'سنتاً', false, 'US dollar', 'cent'], '': ['', '', '', '', '', '', '', '', false, '', ''] };
  function cur(n, f, fem) { var w = arWords(n, fem), r = n % 100; if (n === 1) return f[0] + ' ' + (fem ? 'واحدة' : 'واحد'); if (n === 2) return f[1]; return w + ' ' + (r >= 3 && r <= 10 ? f[2] : r >= 11 ? f[3] : f[0]) }
  var E1 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], E10 = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'], ES = ['', 'thousand', 'million', 'billion', 'trillion'];
  function e3(n) { var o = ''; if (n >= 100) { o += E1[Math.floor(n / 100)] + ' hundred'; n %= 100; if (n) o += ' and ' } if (n) { if (n < 20) o += E1[n]; else o += E10[Math.floor(n / 10)] + (n % 10 ? '-' + E1[n % 10] : '') } return o }
  function enWords(n) { if (n === 0) return 'zero'; var g = [], x = n; while (x > 0) { g.push(x % 1000); x = Math.floor(x / 1000) } var p = []; for (var i = g.length - 1; i >= 0; i--) if (g[i]) p.push(e3(g[i]) + (ES[i] ? ' ' + ES[i] : '')); return p.join(', ').replace(/, ([^,]*)$/, function (m, l) { return (l.indexOf('and') < 0 && g.length > 1 && g[0] > 0 && g[0] < 100 ? ' and ' : ', ') + l }) }
  T.tafqeet = function () {
    mount(inp('a', t('المبلغ أو الرقم', 'Amount or number'), '1250.75', 'number', '') + sel('c', t('العملة', 'Currency'), [['SAR', t('ريال سعودي', 'Saudi riyal')], ['AED', t('درهم إماراتي', 'UAE dirham')], ['EGP', t('جنيه مصري', 'Egyptian pound')], ['KWD', t('دينار كويتي', 'Kuwaiti dinar')], ['QAR', t('ريال قطري', 'Qatari riyal')], ['USD', t('دولار أمريكي', 'US dollar')], ['', t('رقم فقط بدون عملة', 'Number only')]], 'SAR'));
    on(['a', 'c'], function () {
      var raw = $('#a').value, a = num(raw); if (isNaN(a) || a < 0 || a >= 1e15) return out(a >= 1e15 ? '<p class="u-w">' + t('الرقم كبير جدًا.', 'Number too large.') + '</p>' : '');
      var c = $('#c').value, f = CUR[c], neg = false, ip = Math.floor(a + 1e-9), fp = Math.round((a - ip) * 100); if (fp === 100) { ip++; fp = 0 }
      var kd = c === 'KWD', fpK = kd ? Math.round((a - ip) * 1000) : fp; if (kd && fpK === 1000) { ip++; fpK = 0 }
      var ar, en;
      if (!c) { ar = arWords(ip, false) + (fp ? ' فاصلة ' + arWords(fp, false) : ''); en = enWords(ip) + (fp ? ' point ' + (fp < 10 ? 'zero ' : '') + enWords(fp) : '') }
      else { var parts = [], ep = []; if (ip || !fpK) { parts.push(cur(ip, f, false)); ep.push(enWords(ip) + ' ' + f[9] + (ip === 1 ? '' : 's')) } if (fpK) { parts.push(cur(fpK, [f[4], f[5], f[6], f[7]], f[8])); ep.push(enWords(fpK) + ' ' + f[10] + (fpK === 1 ? '' : 's')) } ar = 'فقط ' + parts.join(' و') + ' لا غير'; en = ep.join(' and ') + ' only'; ar = ar.replace(/\s+/g, ' ') }
      var s = AR ? ar : en;
      out('<div class="u-big u-tx" dir="' + (AR ? 'rtl' : 'ltr') + '">' + s + '</div>' + copyBtn(s) + '<h3>' + t('بالإنجليزية', 'In Arabic') + '</h3><div class="u-tx" dir="' + (AR ? 'ltr' : 'rtl') + '">' + (AR ? en : ar) + '</div>' + copyBtn(AR ? en : ar))
    })
  };
  /* 5. text tools */
  T.text = function () {
    mount('<textarea id="x" class="u-i u-ta" placeholder="' + t('الصق نصك هنا…', 'Paste your text here…') + '"></textarea><div id="st" class="u-st"></div><div class="u-ch">' + [['dia', t('حذف التشكيل', 'Remove diacritics')], ['sp', t('حذف المسافات الزائدة', 'Trim extra spaces')], ['ln', t('حذف الأسطر الفارغة', 'Remove blank lines')], ['dup', t('حذف الأسطر المكررة', 'Remove duplicate lines')], ['up', 'UPPER'], ['lo', 'lower'], ['ti', 'Title Case'], ['rev', t('عكس النص', 'Reverse text')], ['num', t('أرقام عربية ← إنجليزية', 'Arabic digits → Western')], ['numA', t('أرقام إنجليزية ← عربية', 'Western digits → Arabic')], ['srt', t('ترتيب الأسطر أبجديًا', 'Sort lines A→Z')]].map(function (p) { return '<button type="button" class="u-b u-s" data-a="' + p[0] + '">' + p[1] + '</button>' }).join('') + '</div><div class="u-ch"><button type="button" class="u-b u-cp" id="cpx">' + t('📋 نسخ النص', '📋 Copy text') + '</button></div>');
    var x = $('#x');
    function stats() { var v = x.value, w = (v.trim().match(/\S+/g) || []).length, c = v.length, cs = v.replace(/\s/g, '').length, l = v ? v.split('\n').length : 0, sn = (v.match(/[.!?؟]+/g) || []).length; $('#st').innerHTML = [[t('كلمات', 'Words'), w], [t('حروف', 'Characters'), c], [t('بدون مسافات', 'No spaces'), cs], [t('أسطر', 'Lines'), l], [t('جمل', 'Sentences'), sn], [t('وقت القراءة', 'Reading time'), (Math.max(w ? 1 : 0, Math.ceil(w / 200))) + t(' د', ' min')]].map(function (p) { return '<div><b>' + p[1] + '</b><span>' + p[0] + '</span></div>' }).join('') }
    x.addEventListener('input', stats); stats(); $('#cpx').setAttribute('data-c', '');
    $('#cpx').onclick = function () { var b = this; try { navigator.clipboard.writeText(x.value) } catch (e) { x.select(); document.execCommand('copy') } var o = b.textContent; b.textContent = t('✓ تم النسخ', '✓ Copied'); setTimeout(function () { b.textContent = o }, 1400) };
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-a]'); if (!b) return; var v = x.value, a = b.dataset.a;
      if (a === 'dia') v = v.replace(/[ً-ٰٟۖ-ۭـ]/g, ''); if (a === 'sp') v = v.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim(); if (a === 'ln') v = v.split('\n').filter(function (l) { return l.trim() }).join('\n'); if (a === 'dup') { var s = {}; v = v.split('\n').filter(function (l) { if (s[l]) return false; s[l] = 1; return true }).join('\n') }
      if (a === 'up') v = v.toUpperCase(); if (a === 'lo') v = v.toLowerCase(); if (a === 'ti') v = v.toLowerCase().replace(/(^|\s)\S/g, function (m) { return m.toUpperCase() }); if (a === 'rev') v = Array.from(v).reverse().join('');
      if (a === 'num') v = v.replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632 }).replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 1776 }); if (a === 'numA') v = v.replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d] }); if (a === 'srt') v = v.split('\n').sort(function (p, q) { return p.localeCompare(q, AR ? 'ar' : 'en') }).join('\n');
      x.value = v; stats() })
  };
  /* 6. password generator */
  T.password = function () {
    mount(inp('n', t('الطول', 'Length'), '', 'number', '16') + '<div class="u-ch">' + [['up', 'A-Z', 1], ['lo', 'a-z', 1], ['di', '0-9', 1], ['sy', '!@#$', 1], ['am', t('بدون أحرف متشابهة (O0 Il1)', 'No look-alikes (O0 Il1)'), 0]].map(function (p) { return '<label class="u-k"><input type="checkbox" id="' + p[0] + '"' + (p[2] ? ' checked' : '') + '> ' + p[1] + '</label>' }).join('') + '</div><button type="button" class="u-b" id="gen">' + t('🔐 توليد كلمة مرور', '🔐 Generate password') + '</button>');
    function rnd(n) { var a = new Uint32Array(1); var lim = Math.floor(4294967296 / n) * n, v; do { crypto.getRandomValues(a); v = a[0] } while (v >= lim); return v % n }
    function gen() { var L = Math.max(4, Math.min(128, num($('#n').value) || 16)), sets = []; if ($('#up').checked) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); if ($('#lo').checked) sets.push('abcdefghijklmnopqrstuvwxyz'); if ($('#di').checked) sets.push('0123456789'); if ($('#sy').checked) sets.push('!@#$%^&*()-_=+[]{};:,.?'); if (!sets.length) return out('<p class="u-w">' + t('اختر نوع محارف واحدًا على الأقل.', 'Select at least one character type.') + '</p>');
      if ($('#am').checked) sets = sets.map(function (s) { return s.replace(/[O0Il1|]/g, '') }); var all = sets.join(''), p = sets.map(function (s) { return s[rnd(s.length)] }); while (p.length < L) p.push(all[rnd(all.length)]); for (var i = p.length - 1; i > 0; i--) { var j = rnd(i + 1), tmp = p[i]; p[i] = p[j]; p[j] = tmp } var pw = p.slice(0, L).join(''), bits = Math.round(L * Math.log(all.length) / Math.LN2), lv = bits < 50 ? [t('ضعيفة', 'Weak'), '#dc2626'] : bits < 75 ? [t('متوسطة', 'Fair'), '#d97706'] : bits < 100 ? [t('قوية', 'Strong'), '#16a34a'] : [t('ممتازة', 'Excellent'), '#059669'];
      out('<div class="u-big u-pw" dir="ltr">' + pw.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>' + copyBtn(pw) + '<div class="u-bar"><i style="width:' + Math.min(100, bits) + '%;background:' + lv[1] + '"></i></div>' + row(t('القوة', 'Strength'), lv[0] + ' (' + bits + ' bit)') + '<p class="u-n">' + t('تُولَّد داخل متصفحك بمولّد عشوائي آمن ولا تُرسل لأي خادم.', 'Generated in your browser with a secure random generator; never sent to any server.') + '</p>') }
    $('#gen').onclick = gen; gen()
  };
  /* 7. percentage */
  T.percent = function () {
    mount(sel('m', t('نوع الحساب', 'Calculation'), [['1', t('كم تساوي X% من Y؟', 'What is X% of Y?')], ['2', t('X يمثل كم % من Y؟', 'X is what % of Y?')], ['3', t('نسبة التغيّر من X إلى Y', '% change from X to Y')], ['4', t('زيادة X بنسبة Y%', 'Increase X by Y%')], ['5', t('خصم Y% من X', 'Decrease X by Y%')], ['6', t('X هو Y% من أي رقم؟', 'X is Y% of what number?')]], '1') + '<div class="u-2">' + inp('x', 'X', '', 'number', '') + inp('y', 'Y', '', 'number', '') + '</div>');
    on(['m', 'x', 'y'], function () { var m = $('#m').value, x = num($('#x').value), y = num($('#y').value); if (isNaN(x) || isNaN(y)) return out(''); var r, u = '';
      if (m === '1') r = x / 100 * y; if (m === '2') { r = x / y * 100; u = '%' } if (m === '3') { r = (y - x) / Math.abs(x) * 100; u = '%' } if (m === '4') r = x * (1 + y / 100); if (m === '5') r = x * (1 - y / 100); if (m === '6') r = x / (y / 100);
      out('<div class="u-big">' + fmt(r, 4) + u + '</div>' + (m === '3' ? '<p class="u-n">' + (r >= 0 ? t('زيادة', 'Increase') : t('انخفاض', 'Decrease')) + '</p>' : '')) })
  };
  /* 8. date difference */
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x }
  T.dates = function () {
    mount('<h3>' + t('الفرق بين تاريخين', 'Difference between two dates') + '</h3><div class="u-2">' + inp('a', t('من', 'From'), '', 'date', today()) + inp('b', t('إلى', 'To'), '', 'date', '') + '</div><h3>' + t('إضافة أو طرح أيام', 'Add or subtract days') + '</h3><div class="u-2">' + inp('s', t('التاريخ', 'Date'), '', 'date', today()) + inp('n', t('عدد الأيام (سالب للطرح)', 'Days (negative to subtract)'), '', 'number', '30') + '</div>');
    on(['a', 'b', 's', 'n'], function () { var o = '', a = pd($('#a').value), b = pd($('#b').value);
      if (a && b) { var days = dd(a, b), ad = Math.abs(days), s = a < b ? a : b, e = a < b ? b : a, y = e.getFullYear() - s.getFullYear(), m = e.getMonth() - s.getMonth(), d = e.getDate() - s.getDate(); if (d < 0) { m--; d += new Date(e.getFullYear(), e.getMonth(), 0).getDate() } if (m < 0) { y--; m += 12 } var wk = 0; for (var i = 0; i < ad && i < 40000; i++) { var w = addDays(s, i).getDay(); if (w !== 5 && w !== 6) wk++ } var wk2 = 0; for (i = 0; i < ad && i < 40000; i++) { var w2 = addDays(s, i).getDay(); if (w2 !== 0 && w2 !== 6) wk2++ }
        o += '<div class="u-big">' + fmt(ad, 0) + ' ' + t('يوم', 'days') + '</div>' + row(t('بالسنوات والأشهر والأيام', 'In Y/M/D'), y + t(' سنة ', 'y ') + m + t(' شهر ', 'm ') + d + t(' يوم', 'd')) + row(t('أسابيع', 'Weeks'), fmt(ad / 7, 1)) + row(t('أيام عمل (الأحد–الخميس)', 'Workdays (Sun–Thu)'), fmt(wk, 0)) + row(t('أيام عمل (الاثنين–الجمعة)', 'Workdays (Mon–Fri)'), fmt(wk2, 0)) }
      var sd = pd($('#s').value), n = num($('#n').value); if (sd && !isNaN(n)) { var r = addDays(sd, Math.round(n)); o += '<h3>' + t('النتيجة', 'Result') + '</h3><div class="u-big">' + gname(r) + '</div>' + row(t('اليوم', 'Weekday'), wd(r)) + (hijri(r) ? row(t('الهجري', 'Hijri'), toHijriStr(r)) : '') } out(o) })
  };
  /* 9. BMI + calories */
  T.bmi = function () {
    mount('<div class="u-2">' + inp('w', t('الوزن (كجم)', 'Weight (kg)'), '', 'number', '') + inp('h', t('الطول (سم)', 'Height (cm)'), '', 'number', '') + inp('a', t('العمر (سنة)', 'Age (years)'), '', 'number', '') + sel('g', t('الجنس', 'Sex'), [['m', t('ذكر', 'Male')], ['f', t('أنثى', 'Female')]], 'm') + '</div>' + sel('act', t('مستوى النشاط', 'Activity level'), [['1.2', t('خامل (مكتبي)', 'Sedentary')], ['1.375', t('خفيف (1–3 أيام/أسبوع)', 'Light (1–3 days/wk)')], ['1.55', t('متوسط (3–5 أيام)', 'Moderate (3–5 days)')], ['1.725', t('عالٍ (6–7 أيام)', 'High (6–7 days)')]], '1.375'));
    on(['w', 'h', 'a', 'g', 'act'], function () { var w = num($('#w').value), h = num($('#h').value), a = num($('#a').value); if (!(w > 0 && h > 0)) return out(''); var bmi = w / Math.pow(h / 100, 2), cat = bmi < 18.5 ? t('نقص في الوزن', 'Underweight') : bmi < 25 ? t('وزن طبيعي', 'Normal weight') : bmi < 30 ? t('زيادة في الوزن', 'Overweight') : t('سمنة', 'Obesity'), o = '<div class="u-big">' + fmt(bmi, 1) + '</div>' + row(t('التصنيف', 'Category'), cat) + row(t('الوزن المثالي التقريبي', 'Healthy weight range'), fmt(18.5 * Math.pow(h / 100, 2), 0) + ' – ' + fmt(24.9 * Math.pow(h / 100, 2), 0) + ' kg');
      if (a > 0) { var bmr = 10 * w + 6.25 * h - 5 * a + ($('#g').value === 'm' ? 5 : -161), tdee = bmr * num($('#act').value); o += '<h3>' + t('السعرات اليومية', 'Daily calories') + '</h3>' + row(t('معدل الأيض الأساسي', 'Basal metabolic rate'), fmt(bmr, 0) + ' kcal') + row(t('للحفاظ على الوزن', 'Maintain weight'), fmt(tdee, 0) + ' kcal') + row(t('لإنقاص الوزن تدريجيًا', 'Gradual weight loss'), fmt(tdee - 500, 0) + ' kcal') + row(t('لزيادة الوزن', 'Weight gain'), fmt(tdee + 400, 0) + ' kcal') }
      out(o + '<p class="u-n">' + t('تقديرات عامة لا تغني عن استشارة الطبيب أو أخصائي التغذية.', 'General estimates; not a substitute for advice from a doctor or dietitian.') + '</p>') })
  };
  /* 10. unit converter */
  var U = { len: { m: 1, km: 1000, cm: .01, mm: .001, mi: 1609.344, yd: .9144, ft: .3048, in: .0254 }, wt: { kg: 1, g: .001, mg: 1e-6, t: 1000, lb: .45359237, oz: .028349523 }, area: { 'm²': 1, 'km²': 1e6, 'ha': 1e4, 'ft²': .09290304, 'acre': 4046.8564, 'cm²': 1e-4 }, vol: { L: 1, mL: .001, 'm³': 1000, gal: 3.785411784, qt: .946352946, cup: .2365882365 }, spd: { 'km/h': 1, 'm/s': 3.6, mph: 1.609344, kn: 1.852 }, data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776, bit: .125 }, time: { s: 1, min: 60, h: 3600, day: 86400, wk: 604800, yr: 31557600 } };
  var UN = { len: t('الطول', 'Length'), wt: t('الوزن', 'Weight'), area: t('المساحة', 'Area'), vol: t('الحجم', 'Volume'), spd: t('السرعة', 'Speed'), data: t('البيانات', 'Data'), time: t('الزمن', 'Time'), tmp: t('الحرارة', 'Temperature') };
  T.units = function () {
    mount(sel('k', t('النوع', 'Type'), Object.keys(UN).map(function (k) { return [k, UN[k]] }), 'len') + '<div class="u-3">' + inp('v', t('القيمة', 'Value'), '', 'number', '1') + sel('f', t('من', 'From'), [], '') + sel('o', t('إلى', 'To'), [], '') + '</div>');
    function fill() { var k = $('#k').value, ks = k === 'tmp' ? ['°C', '°F', 'K'] : Object.keys(U[k]), h = ks.map(function (u) { return '<option>' + u + '</option>' }).join(''); $('#f').innerHTML = h; $('#o').innerHTML = h; $('#o').selectedIndex = Math.min(1, ks.length - 1) }
    $('#k').addEventListener('change', function () { fill(); calc() }); fill();
    function calc() { var k = $('#k').value, v = num($('#v').value), f = $('#f').value, o = $('#o').value; if (isNaN(v)) return out(''); var r;
      if (k === 'tmp') { var c = f === '°C' ? v : f === '°F' ? (v - 32) * 5 / 9 : v - 273.15; r = o === '°C' ? c : o === '°F' ? c * 9 / 5 + 32 : c + 273.15 } else r = v * U[k][f] / U[k][o];
      var all = ''; if (k !== 'tmp') { all = Object.keys(U[k]).map(function (u) { return '<div class="u-r"><span>' + u + '</span><b>' + fmt(v * U[k][f] / U[k][u], 6) + '</b></div>' }).join('') } out('<div class="u-big">' + fmt(r, 6) + ' ' + o + '</div>' + all) }
    on(['v', 'f', 'o'], calc)
  };
  /* ===== batch 2 ===== */
  T.zakat = function () {
    mount(inp('gp', t('سعر جرام الذهب عيار 24 (بعملتك)', 'Gold price per gram, 24k (your currency)'), '300', 'number', '') + '<div class="u-2">' + inp('cash', t('النقد والمدخرات', 'Cash & savings'), '0', 'number', '') + inp('gold', t('ذهب (جرام عيار 24)', 'Gold (grams, 24k)'), '0', 'number', '') + '</div><div class="u-2">' + inp('trade', t('عروض التجارة (قيمتها)', 'Trade goods (value)'), '0', 'number', '') + inp('recv', t('ديون مستحقة لك مرجوّة السداد', 'Debts owed to you (collectible)'), '0', 'number', '') + '</div>' + inp('liab', t('ديون عليك حالّة (تُخصم)', 'Debts you owe now (deducted)'), '0', 'number', ''));
    on(['gp', 'cash', 'gold', 'trade', 'recv', 'liab'], function () {
      var gp = num($('#gp').value); if (isNaN(gp) || gp <= 0) return out('');
      var v = function (i) { var n = num($('#' + i).value); return isNaN(n) ? 0 : n };
      var goldV = v('gold') * gp, tot = v('cash') + goldV + v('trade') + v('recv') - v('liab'), nis = 85 * gp, due = tot >= nis;
      out('<div class="u-big">' + fmt(due ? tot * .025 : 0) + '</div>' + row(t('إجمالي الأموال الزكوية الصافي', 'Net zakatable wealth'), fmt(tot)) + row(t('النصاب (85 جرام ذهب)', 'Nisab (85 g gold)'), fmt(nis)) + row(t('الحالة', 'Status'), due ? t('بلغ النصاب: الزكاة 2.5%', 'Nisab reached: 2.5% due') : t('لم يبلغ النصاب', 'Below nisab')) + '<p class="u-n">' + t('يشترط مرور الحول الهجري على المال. حاسبة تقريبية، ويُرجع في الحالات الخاصة إلى أهل العلم.', 'Requires one lunar year of ownership. This is an estimate; consult a scholar for special cases.') + '</p>')
    })
  };
  T.loan = function () {
    mount(inp('a', t('مبلغ التمويل', 'Loan amount'), '100000', 'number', '') + '<div class="u-2">' + inp('r', t('النسبة السنوية %', 'Annual rate %'), '5', 'number', '5') + inp('y', t('المدة بالسنوات', 'Term (years)'), '5', 'number', '5') + '</div>' + sel('m', t('طريقة الحساب', 'Method'), [['flat', t('نسبة ثابتة (مرابحة)', 'Flat rate (murabaha)')], ['red', t('متناقصة (أقساط متساوية)', 'Reducing balance (EMI)')]], 'flat') + '<label class="u-k"><input type="checkbox" id="tb"> ' + t('عرض جدول السداد', 'Show schedule') + '</label>');
    on(['a', 'r', 'y', 'm', 'tb'], function () {
      var a = num($('#a').value), r = num($('#r').value), y = num($('#y').value); if (isNaN(a) || isNaN(r) || isNaN(y) || a <= 0 || y <= 0) return out('');
      var n = Math.round(y * 12), mp, tot, rows = '';
      if ($('#m').value === 'flat') { tot = a * (1 + r / 100 * y); mp = tot / n; if ($('#tb').checked) for (var i = 1; i <= n && i <= 360; i++)rows += '<tr><td>' + i + '</td><td>' + fmt(a / n) + '</td><td>' + fmt(a * r / 100 * y / n) + '</td><td>' + fmt(mp) + '</td><td>' + fmt(tot - mp * i) + '</td></tr>' }
      else { var i2 = r / 1200; mp = i2 ? a * i2 / (1 - Math.pow(1 + i2, -n)) : a / n; tot = mp * n; var bal = a; if ($('#tb').checked) for (var k = 1; k <= n && k <= 360; k++) { var it = bal * i2, pr = mp - it; bal -= pr; rows += '<tr><td>' + k + '</td><td>' + fmt(pr) + '</td><td>' + fmt(it) + '</td><td>' + fmt(mp) + '</td><td>' + fmt(Math.max(0, bal)) + '</td></tr>' } }
      out('<div class="u-big">' + fmt(mp) + ' / ' + t('شهر', 'month') + '</div>' + row(t('عدد الأقساط', 'Installments'), n) + row(t('إجمالي السداد', 'Total payment'), fmt(tot)) + row(t('إجمالي الربح / الفائدة', 'Total profit / interest'), fmt(tot - a)) + (rows ? '<div style="overflow:auto;max-height:340px"><table class="u-t"><tr><th>#</th><th>' + t('أصل', 'Principal') + '</th><th>' + t('ربح', 'Profit') + '</th><th>' + t('القسط', 'Payment') + '</th><th>' + t('المتبقي', 'Balance') + '</th></tr>' + rows + '</table></div>' : ''))
    })
  };
  T.eos = function () {
    mount(inp('s', t('آخر أجر شهري (أساسي + بدلات ثابتة)', 'Last monthly wage (basic + fixed allowances)'), '8000', 'number', '') + '<div class="u-3">' + inp('y', t('سنوات', 'Years'), '0', 'number', '3') + inp('mo', t('أشهر', 'Months'), '0', 'number', '0') + inp('d', t('أيام', 'Days'), '0', 'number', '0') + '</div>' + sel('w', t('سبب إنهاء العقد', 'Reason'), [['t', t('انتهاء العقد أو فصل من صاحب العمل', 'Contract end / termination by employer')], ['r', t('استقالة العامل', 'Employee resignation')]], 't') + '<p class="u-n">' + t('وفق نظام العمل السعودي (المادتان 84 و85). للاسترشاد فقط.', 'Based on Saudi Labor Law (Articles 84–85). For guidance only.') + '</p>');
    on(['s', 'y', 'mo', 'd', 'w'], function () {
      var s = num($('#s').value), y = num($('#y').value) || 0, m = num($('#mo').value) || 0, d = num($('#d').value) || 0; if (isNaN(s) || s <= 0) return out('');
      var yrs = y + m / 12 + d / 365, full = yrs <= 5 ? yrs * s / 2 : 5 * s / 2 + (yrs - 5) * s, f = 1, note = '';
      if ($('#w').value === 'r') { f = yrs < 2 ? 0 : yrs < 5 ? 1 / 3 : yrs < 10 ? 2 / 3 : 1; note = row(t('نسبة الاستحقاق عند الاستقالة', 'Resignation entitlement'), (f * 100).toFixed(0) + '%') }
      out('<div class="u-big">' + fmt(full * f) + '</div>' + row(t('مدة الخدمة', 'Service'), fmt(yrs, 2) + ' ' + t('سنة', 'yrs')) + row(t('المكافأة كاملة', 'Full gratuity'), fmt(full)) + note)
    })
  };
  T.qr = function () {
    mount(sel('k', t('النوع', 'Type'), [['u', t('نص أو رابط', 'Text or URL')], ['w', t('واي فاي', 'Wi-Fi')], ['a', t('واتساب', 'WhatsApp')], ['m', t('بريد إلكتروني', 'Email')]], 'u') + '<div id="qf"></div><div class="u-2"><label class="u-l">' + t('لون الرمز', 'Foreground') + '<input type="color" id="fg" value="#000000" class="u-i"></label><label class="u-l">' + t('الخلفية', 'Background') + '<input type="color" id="bg" value="#ffffff" class="u-i"></label></div>' + inp('sz', t('الحجم بالبكسل', 'Size (px)'), '512', 'number', '512'));
    var F = { u: [['t', t('النص أو الرابط', 'Text or URL'), 'https://']], w: [['n', t('اسم الشبكة', 'Network name'), ''], ['p', t('كلمة المرور', 'Password'), '']], a: [['t', t('رقم الهاتف بالصيغة الدولية', 'Phone (international)'), '9665XXXXXXXX'], ['x', t('رسالة (اختياري)', 'Message (optional)'), '']], m: [['t', t('البريد', 'Email'), ''], ['x', t('الموضوع', 'Subject'), '']] };
    function fields() { var k = $('#k').value; $('#qf').innerHTML = F[k].map(function (f) { return inp('f_' + f[0], f[1], f[2], 'text', '') }).join(''); F[k].forEach(function (f) { $('#f_' + f[0]).addEventListener('input', draw) }); draw() }
    function val() { var k = $('#k').value, g = function (i) { return ($('#f_' + i) || { value: '' }).value }; if (k === 'u') return g('t'); if (k === 'w') return g('n') ? 'WIFI:T:WPA;S:' + g('n') + ';P:' + g('p') + ';;' : ''; if (k === 'a') return g('t') ? 'https://wa.me/' + g('t').replace(/\D/g, '') + (g('x') ? '?text=' + encodeURIComponent(g('x')) : '') : ''; return g('t') ? 'mailto:' + g('t') + (g('x') ? '?subject=' + encodeURIComponent(g('x')) : '') : '' }
    function draw() { var v = val(); if (!v) return out(''); var sz = Math.max(128, Math.min(2048, num($('#sz').value) || 512)), m; try { m = QR.make(v, 'M') } catch (e) { return out('<p class="u-n">' + t('النص طويل جدًا', 'Text too long') + '</p>') } var c = document.createElement('canvas'), n = m.length, q = 3, u = sz / (n + q * 2); c.width = c.height = sz; var x = c.getContext('2d'); x.fillStyle = $('#bg').value; x.fillRect(0, 0, sz, sz); x.fillStyle = $('#fg').value; for (var r = 0; r < n; r++)for (var k = 0; k < n; k++)if (m[r][k]) x.fillRect(Math.floor((k + q) * u), Math.floor((r + q) * u), Math.ceil(u), Math.ceil(u)); out('<div style="text-align:center"><img id="qi" alt="QR" src="' + c.toDataURL('image/png') + '" style="max-width:100%;width:280px;border:1px solid #ddd;border-radius:12px"><br><a class="u-b" download="qr-code.png" href="' + c.toDataURL('image/png') + '" style="display:inline-block;text-decoration:none;margin-top:10px">⬇ PNG</a></div>') }
    ['k', 'fg', 'bg', 'sz'].forEach(function (i) { $('#' + i).addEventListener('input', i === 'k' ? fields : draw) }); fields()
  };
  T.random = function () {
    mount(sel('m', t('الوضع', 'Mode'), [['p', t('اختيار فائز من قائمة', 'Pick winner(s) from a list')], ['s', t('خلط القائمة', 'Shuffle list')], ['g', t('تقسيم لفرق', 'Split into teams')], ['n', t('رقم عشوائي', 'Random number')], ['c', t('عملة ونرد', 'Coin & dice')]], 'p') + '<div id="rf"></div><button type="button" class="u-b" id="go">🎲 ' + t('نفّذ', 'Go') + '</button>');
    function fields() { var m = $('#m').value; $('#rf').innerHTML = (m === 'p' || m === 's' || m === 'g') ? '<label class="u-l">' + t('القائمة (اسم في كل سطر)', 'List (one per line)') + '<textarea id="l" class="u-i u-ta" style="min-height:120px"></textarea></label>' + (m === 'p' ? inp('c', t('عدد الفائزين', 'Winners'), '1', 'number', '1') : m === 'g' ? inp('c', t('عدد الفرق', 'Teams'), '2', 'number', '2') : '') : m === 'n' ? '<div class="u-2">' + inp('lo', t('من', 'From'), '1', 'number', '1') + inp('hi', t('إلى', 'To'), '100', 'number', '100') + '</div>' : ''; out('') }
    function R(n) { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n }
    function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = R(i + 1), x = a[i]; a[i] = a[j]; a[j] = x } return a }
    $('#m').addEventListener('change', fields); fields();
    $('#go').addEventListener('click', function () { var m = $('#m').value, L = ($('#l') || { value: '' }).value.split('\n').map(function (s) { return s.trim() }).filter(Boolean), h = '';
      if (m === 'p') { if (!L.length) return out(''); var c = Math.max(1, Math.min(L.length, num($('#c').value) || 1)); h = shuf(L).slice(0, c).map(function (x) { return '<div class="u-big">🏆 ' + x + '</div>' }).join('') }
      if (m === 's') { if (!L.length) return out(''); h = '<ol>' + shuf(L).map(function (x) { return '<li>' + x + '</li>' }).join('') + '</ol>' }
      if (m === 'g') { if (!L.length) return out(''); var k = Math.max(2, Math.min(20, num($('#c').value) || 2)), tm = []; for (var i = 0; i < k; i++)tm.push([]); shuf(L).forEach(function (x, i) { tm[i % k].push(x) }); h = tm.map(function (g, i) { return '<div class="u-r"><span>' + t('الفريق ', 'Team ') + (i + 1) + '</span><b>' + g.join('، ') + '</b></div>' }).join('') }
      if (m === 'n') { var lo = Math.ceil(num($('#lo').value)), hi = Math.floor(num($('#hi').value)); if (isNaN(lo) || isNaN(hi) || hi < lo) return out(''); h = '<div class="u-big">' + (lo + R(hi - lo + 1)) + '</div>' }
      if (m === 'c') h = '<div class="u-big">' + (R(2) ? t('🪙 صورة', '🪙 Heads') : t('🪙 كتابة', '🪙 Tails')) + '</div><div class="u-big">🎲 ' + (1 + R(6)) + '</div>';
      out(h) })
  };
  T.timer = function () {
    mount('<div class="u-big" id="tt" style="font-size:56px;text-align:center">25:00</div><div class="u-3">' + inp('fm', t('تركيز (دقيقة)', 'Focus (min)'), '25', 'number', '25') + inp('bm', t('راحة (دقيقة)', 'Break (min)'), '5', 'number', '5') + inp('lm', t('راحة طويلة', 'Long break'), '15', 'number', '15') + '</div><div class="u-2"><button type="button" class="u-b" id="st">▶ ' + t('ابدأ', 'Start') + '</button><button type="button" class="u-b u-s" id="rs">↺ ' + t('إعادة', 'Reset') + '</button></div><p class="u-n" id="ts"></p>');
    var left = 1500, run = 0, ph = 'f', cnt = 0, iv = null;
    function show() { var m = Math.floor(left / 60), s = left % 60; $('#tt').textContent = ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2); document.title = $('#tt').textContent + ' · ' + t('مؤقت', 'Timer'); $('#ts').textContent = (ph === 'f' ? t('وقت التركيز', 'Focus') : t('وقت الراحة', 'Break')) + ' · ' + t('جلسات مكتملة: ', 'Done: ') + cnt }
    function beep() { try { var c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(); o.connect(c.destination); o.frequency.value = 880; o.start(); setTimeout(function () { o.stop() }, 600) } catch (e) { } }
    function setP(p) { ph = p; left = 60 * (p === 'f' ? (num($('#fm').value) || 25) : p === 'b' ? (num($('#bm').value) || 5) : (num($('#lm').value) || 15)); show() }
    $('#st').addEventListener('click', function () { if (run) { run = 0; clearInterval(iv); this.textContent = '▶ ' + t('ابدأ', 'Start'); return } run = 1; this.textContent = '⏸ ' + t('إيقاف', 'Pause'); var end = Date.now() + left * 1000; iv = setInterval(function () { left = Math.max(0, Math.round((end - Date.now()) / 1000)); show(); if (left <= 0) { beep(); if (ph === 'f') { cnt++; setP(cnt % 4 === 0 ? 'l' : 'b') } else setP('f'); end = Date.now() + left * 1000 } }, 250) });
    $('#rs').addEventListener('click', function () { run = 0; clearInterval(iv); $('#st').textContent = '▶ ' + t('ابدأ', 'Start'); cnt = 0; setP('f') }); ['fm', 'bm', 'lm'].forEach(function (i) { $('#' + i).addEventListener('change', function () { if (!run) setP(ph) }) }); setP('f')
  };
  if (T[tool]) T[tool]();
})();
