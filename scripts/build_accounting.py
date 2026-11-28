# -*- coding: utf-8 -*-
import sys, json, re, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from portal_common import *
from acc_standards import STD
import importlib, glob as _g
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
DEEPA = {}
for _f in sorted(_g.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)),'lib','accdeep*.py'))):
    _d = importlib.import_module(os.path.basename(_f)[:-3]).DEEPA
    for _k, _v in _d.items():
        if _f.endswith('accdeepx.py'): DEEPA.setdefault(_k, []).extend(_v)   # إضافات تُدمج بعد الأساس
        else: DEEPA[_k] = _v
def deep_a(code):
    o = ''
    for h, ps in DEEPA.get(code, []):
        o += f'<h2>{e(h)}</h2>'; ul = []
        for q in ps:
            if q.startswith('• '): ul.append(q[2:]); continue
            if ul: o += '<ul>' + ''.join(f'<li>{e(x)}</li>' for x in ul) + '</ul>'; ul = []
            o += f'<p class="je">{e(q)}</p>' if q.startswith('قيد:') else f'<p>{e(q)}</p>'
        if ul: o += '<ul>' + ''.join(f'<li>{e(x)}</li>' for x in ul) + '</ul>'
    return o
CR = '<a href="/">الرئيسية</a> › <a href="/accounting/">مرجع المحاسب</a>'
URLS = []
def sl(c): return c.lower().replace(' ', '-')
SMART = [("bank-reconciliation-matcher","🏦 مطابقة التسوية البنكية"),("duplicate-invoice-detector","🧾 كاشف الفواتير المكررة"),("trial-balance-checker","⚖️ فاحص ميزان المراجعة"),("ar-ap-aging-report","⏳ أعمار الذمم"),("three-way-match","🔗 المطابقة الثلاثية"),("budget-vs-actual-variance","📉 انحراف الموازنة"),("supplier-statement-reconciliation","📨 مطابقة كشف المورد"),("inventory-count-reconciliation","📋 مطابقة الجرد"),("journal-entry-validator","✅ مدقق القيود"),("expense-smart-categorizer","🏷️ مصنف المصروفات"),("cash-flow-statement-indirect","💧 التدفقات النقدية"),("fixed-asset-register","🏗️ سجل الأصول"),("accruals-prepayments-calculator","🗓️ مستحقات ومقدمة"),("fx-revaluation-ias21","💱 فروق العملة"),("zakat-base-estimator","🕌 وعاء الزكاة"),("financial-ratios-analyzer","📊 النسب المالية")]
GUIDES = [
("month-end-close-checklist","قائمة إقفال الشهر للمحاسب","خطوات إقفال شهري منظمة تمنع الأخطاء وتسرّع القوائم.",
 [("قبل الإقفال",["أوقف الترحيل في الفترة السابقة بعد اعتماد الإقفال.","تأكد من ترحيل كل القيود اليومية والفواتير والإيصالات."]),
  ("التسويات",["التسوية البنكية لكل حساب.","مطابقة الذمم المدينة والدائنة مع الأستاذ المساعد.","مطابقة الجرد والمخزون وتسجيل فروقه.","قيود المستحقات والمدفوعات المقدمة والإهلاك والمخصصات."]),
  ("المراجعة",["ميزان المراجعة وتحليل الأرصدة غير المعتادة.","مقارنة الفعلي بالموازنة والشهر السابق وتفسير الانحرافات.","مراجعة قيود الإقفال اليدوية بموافقة ثانية."]),
  ("بعد الإقفال",["إعداد القوائم والإيضاحات وتوقيع الاعتماد.","أرشفة المستندات الداعمة وتسجيل ملاحظات للتحسين."])],"trial-balance-checker"),
("common-journal-entries-cheat-sheet","ورقة القيود اليومية الشائعة","قيود جاهزة للعمليات المتكررة مع المعيار المرتبط.",
 [("مبيعات ومشتريات",["بيع آجل: مدين ذمم مدينة / دائن إيراد (+ ضريبة مستحقة).","شراء نقدي: مدين مخزون / دائن نقدية.","مرتجع مبيعات: مدين مردودات المبيعات / دائن ذمم مدينة."]),
  ("مصروفات وتسويات",["مصروف مستحق: مدين مصروف / دائن مصروفات مستحقة.","مصروف مدفوع مقدمًا: مدين مدفوعات مقدمة / دائن نقدية ثم يُحمَّل شهريًا.","إهلاك: مدين مصروف إهلاك / دائن مجمع إهلاك."]),
  ("ذمم وموظفون",["مخصص خسائر ائتمانية: مدين مصروف / دائن مخصص.","رواتب مستحقة: مدين مصروف رواتب / دائن رواتب مستحقة.","مكافأة نهاية الخدمة: مدين مصروف منافع / دائن التزام منافع."]),
  ("ضريبة وأخرى",["ضريبة قيمة مضافة على المبيعات: دائن ضريبة مستحقة.","ضريبة المدخلات: مدين ضريبة قابلة للخصم.","فروق صرف: مدين/دائن ربح أو خسارة فروق عملة."])],"journal-entry-generator-ifrs"),
("financial-analysis-formulas-reference","مرجع معادلات التحليل المالي","أهم النسب والمعادلات مع طريقة تفسيرها.",
 [("السيولة",["نسبة التداول = الأصول المتداولة ÷ الالتزامات المتداولة.","النسبة السريعة = (المتداولة − المخزون) ÷ الالتزامات المتداولة."]),
  ("الربحية",["هامش مجمل الربح = (الإيراد − تكلفة المبيعات) ÷ الإيراد.","العائد على الأصول = صافي الربح ÷ إجمالي الأصول.","العائد على الملكية = صافي الربح ÷ حقوق الملكية."]),
  ("النشاط",["دوران المخزون = تكلفة المبيعات ÷ متوسط المخزون.","أيام التحصيل = الذمم ÷ المبيعات × 365.","دورة النقد = أيام المخزون + أيام التحصيل − أيام السداد."]),
  ("المديونية",["الدين إلى الملكية = إجمالي الديون ÷ حقوق الملكية.","تغطية الفوائد = EBIT ÷ مصروف الفوائد."])],"financial-ratios-analyzer"),
("audit-evidence-and-controls-tips","نصائح الضبط الداخلي وأدلة المراجعة للمحاسب","ضوابط عملية تقلل الأخطاء والاحتيال وتسهل المراجعة.",
 [("فصل المهام",["لا يجمع شخص واحد بين الإذن والتسجيل والحفظ والتسوية."]),
  ("الضوابط الأساسية",["موافقات متدرجة على المشتريات والمدفوعات.","مطابقة ثلاثية قبل السداد.","تسويات دورية يراجعها شخص مستقل.","صلاحيات نظام محاسبي حسب الدور وسجل تدقيق."]),
  ("تحضير المراجعة",["رتب المستندات الداعمة حسب البند.","جهّز جداول الأرصدة وتفسيرات الانحرافات.","وثّق التقديرات والأحكام الهامة."])],"journal-entry-validator"),
("accounting-policies-manual-template","قالب دليل السياسات المحاسبية","هيكل لدليل سياسات منشأتك يوحد المعالجة ويدعم المراجعة.",
 [("هيكل الدليل",["نبذة عن المنشأة وإطار التقرير (IFRS أو المنشآت الصغيرة).","السياسات: الإيراد، المخزون، الأصول الثابتة، الأدوات المالية، الإيجارات، المخصصات، العملات.","حدود الرسملة والأعمار الإنتاجية ونسب المخصصات."]),
  ("الحوكمة",["صلاحيات الاعتماد وجدول الإقفال.","إجراءات تغيير السياسات وتوثيق التقديرات."])],"accounting-standards-finder"),
]
import accguides_a, accguides_b
GUIDES = accguides_a.G + accguides_b.G
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def tool_url(s):
    for b in ('business/tools', 'tools'):
        if os.path.isdir(os.path.join(_ROOT, b, s)): return f'/{b}/{s}/'
    return ''
def tool_link(s):
    u = tool_url(s) if s else ''
    return f'<a class="btn btn-o" href="{u}">🧰 افتح الأداة المرتبطة ←</a>' if u else ''
def render_blocks(blocks):
    o = ''; faq = []
    for b in blocks:
        k = b[0]
        if k == 'h': o += f'<h2>{e(b[1])}</h2>'
        elif k == 'p': o += f'<p>{e(b[1])}</p>'
        elif k == 'ul': o += '<ul>' + ''.join(f'<li>{e(x)}</li>' for x in b[1]) + '</ul>'
        elif k == 'ol': o += '<ol>' + ''.join(f'<li>{e(x)}</li>' for x in b[1]) + '</ol>'
        elif k == 't':
            o += '<div class="tw"><table><thead><tr>' + ''.join(f'<th>{e(c)}</th>' for c in b[1]) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{e(c)}</td>' for c in r) + '</tr>' for r in b[2]) + '</tbody></table></div>'
        elif k == 'je': o += f'<div class="jebox"><b>{e(b[1])}</b>' + ''.join(f'<div>{e(x)}</div>' for x in b[2]) + '</div>'
        elif k == 'note': o += f'<div class="note">{e(b[1])}</div>'
        elif k == 'faq':
            faq += b[1]; o += '<h2>أسئلة شائعة</h2>' + ''.join(f'<details class="fq"><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in b[1])
    return o, faq

OPSM = {"IAS 2":"inv-nrv,purchase-credit","IAS 12":"deferred-tax","IAS 16":"asset-purchase,asset-disposal","IAS 19":"payroll,eosb","IAS 20":"grant","IAS 21":"fx","IAS 23":"loan","IAS 33":"eps","IAS 36":"impairment","IAS 37":"provision","IAS 40":"invprop","IFRS 2":"sbp","IFRS 3":"goodwill","IFRS 9":"ecl,loan,customer-receipt","IFRS 15":"credit-sale,unearned,multi-element,sales-return","IFRS 16":"lease","IAS 1":"year-end-close,equity-tx","IAS 7":"bank-rec,petty-cash","IAS 32":"equity-tx"}
GOPS = {"vat-return-preparation-saudi":"vat-settlement,credit-sale,purchase-credit","bank-reconciliation-step-by-step":"bank-rec","fixed-assets-depreciation-guide":"asset-purchase,asset-disposal","inventory-costing-fifo-weighted-average-example":"purchase-credit,inv-nrv","payroll-and-end-of-service-accounting-saudi":"payroll,eosb","year-end-closing-entries-guide":"year-end-close,prepaid,accrued","receivables-expected-credit-loss-guide":"ecl,customer-receipt","petty-cash-imprest-system-guide":"petty-cash","common-journal-entries-cheat-sheet":"credit-sale,purchase-credit,prepaid,accrued,payroll","month-end-close-checklist":"prepaid,accrued,bank-rec,year-end-close"}
def wiz(ops, title="طبّق العملية بأرقامك: خطوات وقيود وقوانين"):
    return f'<section class="aw-embed"><h2>{title}</h2><div class="accwiz" data-ops="{ops}"></div><p><a class="btn btn-o" href="/accounting/operations/">كل العمليات المحاسبية ←</a></p></section><script src="/assets/acc-ops.js" defer></script><script src="/assets/acc-wizard.js" defer></script>'
# صفحات المعايير
import accfix
for code, name, summ, pts, ent, tips, tool in STD:
    if isinstance(tips, str): tips = accfix.TIPS.get(code) or [tips]
    if len(ent) < 55 and code in accfix.ENT: ent = accfix.ENT[code]
    if isinstance(pts, str): pts = [pts]
    s = sl(code); u = f"/accounting/standards/{s}/"
    b = hero(f"{code}: {name}", summ, CR + ' › المعايير')
    b += '<main><section class="s"><div class="wrap narrow"><article class="prose">'
    b += f'<h2>ملخص المعيار</h2><p>{e(summ)}</p><h2>أهم النقاط</h2><ul>' + ''.join(f'<li>{e(p)}</li>' for p in pts) + '</ul>'
    b += f'<h2>المعالجة المحاسبية / القيد</h2><p>{e(ent)}</p><h2>نصائح وتوصيات للمحاسب</h2><ul>' + ''.join(f'<li>{e(t)}</li>' for t in tips) + '</ul>'
    b += deep_a(code)
    b += wiz(OPSM.get(code,'credit-sale,purchase-credit,prepaid,accrued'))
    b += '<div class="note">مرجع تعليمي مختصر. اعتمد دائمًا نص المعيار الأصلي وسياسات منشأتك واستشر مراجعًا معتمدًا في الحالات المعقدة.</div>'
    b += '<p>' + tool_link(tool) + ' <a class="btn btn-o" href="/accounting/">← كل المعايير</a></p></article></div></section></main>'
    art = ld({"@context": "https://schema.org", "@type": "Article", "headline": f"{code} {name}", "description": summ, "inLanguage": "ar", "mainEntityOfPage": BASE + u, "author": {"@type": "Organization", "name": "DIAMOND HUB"}, "publisher": {"@type": "Organization", "name": "DIAMOND HUB"}})
    write(u.strip('/') + '/index.html', page(u, f"{code} {name}: ملخص ومعالجة محاسبية ونصائح | DIAMOND HUB", f"{name} ({code}): {summ} أهم النقاط والقيود والتوصيات للمحاسب.", b, art + breadcrumb([("الرئيسية", "/"), ("مرجع المحاسب", "/accounting/"), (code, u)]), "/accounting/", "article"))
    URLS.append((u, "0.7"))
# أدلة
for slug, title, desc, blocks, tool in GUIDES:
    u = f"/accounting/guides/{slug}/"
    b = hero(title, desc, CR + ' › أدلة')
    body, faq = render_blocks(blocks)
    rel = [g for g in GUIDES if g[0] != slug]
    i0 = [g[0] for g in GUIDES].index(slug)
    rel = [GUIDES[(i0 + k) % len(GUIDES)] for k in (1, 2, 3)]
    b += '<main><section class="s"><div class="wrap narrow"><article class="prose">' + body + '<p>' + tool_link(tool) + ' <a class="btn btn-o" href="/accounting/">← مرجع المحاسب</a></p>'
    b += wiz(GOPS.get(slug,'credit-sale,purchase-credit,prepaid,accrued'))
    b += '<h2>أدلة ذات صلة</h2><ul>' + ''.join(f'<li><a href="/accounting/guides/{g[0]}/">{e(g[1])}</a></li>' for g in rel) + '</ul>'
    b += '<div class="note">محتوى تعليمي بأرقام توضيحية، وليس استشارة محاسبية أو ضريبية. راجع الأنظمة المحدثة ومختصًا معتمدًا قبل التطبيق.</div></article></div></section></main>'
    art = ld({"@context": "https://schema.org", "@type": "Article", "headline": title, "description": desc, "inLanguage": "ar", "mainEntityOfPage": BASE + u, "author": {"@type": "Organization", "name": "DIAMOND HUB"}})
    if faq: art += ld({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]})
    write(u.strip('/') + '/index.html', page(u, f"{title} | DIAMOND HUB", desc, b, art + breadcrumb([("الرئيسية", "/"), ("مرجع المحاسب", "/accounting/"), (title, u)]), "/accounting/", "article"))
    URLS.append((u, "0.7"))

b = hero("العمليات المحاسبية: أدخل العملية فتظهر الخطوات والقيود والقوانين", "اختر عملية أو اكتبها بكلماتك، أدخل أرقامك، فيعرض لك الإجراءات خطوة بخطوة والقيود المحاسبية المتوازنة والمعايير والأنظمة الحاكمة والمستندات والأخطاء الشائعة.", CR + " › العمليات")
b += '<main><section class="s"><div class="wrap narrow"><div class="accwiz" data-ops=""></div><div class="note">أرقام ونسب توضيحية؛ راجع الأنظمة السارية (الضريبة، العمل، التأمينات) ومختصًا معتمدًا قبل التطبيق.</div></div></section></main><script src="/assets/acc-ops.js" defer></script><script src="/assets/acc-wizard.js" defer></script>'
write("accounting/operations/index.html", page("/accounting/operations/", "العمليات المحاسبية: خطوات وقيود وقوانين لكل عملية | DIAMOND HUB", "اكتب العملية المحاسبية أو اخترها وأدخل أرقامك لتظهر الخطوات والقيود المتوازنة والمعايير والمستندات: مبيعات، مشتريات، ضريبة، أصول، رواتب، قروض، IFRS.", b, breadcrumb([("الرئيسية","/"),("مرجع المحاسب","/accounting/"),("العمليات","/accounting/operations/")]), "/accounting/"))
URLS.append(("/accounting/operations/","0.9"))
NEWT = [("general-ledger-trial-balance","📒","اليومية والأستاذ وميزان المراجعة","سجّل القيود فتحصل على الأستاذ والميزان وقائمتي الدخل والمركز المالي"),("journal-entries-guide","🧾","دليل القيود المحاسبية","36 قيدًا بالشرح والحسابات T وضريبة 15%"),("depreciation-calculator","🏭","حاسبة الإهلاك","أربع طرق مع الجدول وقيد الإهلاك"),("break-even-calculator","⚖️","حاسبة نقطة التعادل","هامش المساهمة والأمان والربح المستهدف برسم بياني"),("withholding-tax-calculator-saudi","🛂","ضريبة الاستقطاع","5% و15% و20% بالإجمالي أو الصافي مع القيد"),("payroll-calculator-saudi","👥","كشف الرواتب والتأمينات","الصافي وتكلفة المنشأة لعدة موظفين"),("vat-calculator","🧮","حاسبة ضريبة القيمة المضافة","إضافة واستخراج 15%"),("zakat-calculator","🕌","حاسبة الزكاة","وعاء الزكاة وقدرها"),("end-of-service-calculator-saudi","🏁","مكافأة نهاية الخدمة","وفق نظام العمل السعودي"),("loan-calculator","🏦","حاسبة القروض","القسط وجدول السداد"),("pdf-to-excel","📊","PDF to Excel","حوّل كشوف وجداول PDF إلى Excel منسّق"),("quotation-maker","📄","عرض سعر وفاتورة","بشعارك وضريبة 15%")]
# المركز
def card(code, name, summ): return f'<a class="card std" href="/accounting/standards/{sl(code)}/" data-q="{e(code+" "+name+" "+summ)}"><h3><span class="pill">{e(code)}</span> {e(name)}</h3><p>{e(summ)}</p></a>'
b = hero("مرجع المحاسب: المعايير والأدوات والأدلة", f"{len(STD)} معيارًا دوليًا بملخص ومعالجة ونصائح، و28 أداة وحاسبة (يومية وأستاذ وميزان، إهلاك، تعادل، استقطاع، رواتب، مطابقات وفحوص)، وأدلة عملية للإقفال والضبط الداخلي.", CR)
b += '<main><section class="s"><div class="wrap"><a class="card" href="/accounting/operations/" style="display:block;margin-bottom:22px;background:linear-gradient(135deg,#f5f3ff,#ede9fe)"><h3>🧭 العمليات المحاسبية: أدخل العملية واحصل على الخطوات والقيود والقوانين</h3><p>32 عملية: مبيعات، مشتريات، ضريبة، أصول، إيجارات، رواتب، قروض، IFRS — أو اكتب العملية بكلماتك.</p></a><h2 class="h2">🧮 حاسبات وأدوات الحسابات والتقارير</h2><div class="grid g4" style="margin-top:12px">' + ''.join(f'<a class="card" href="/tools/{s}/"><h3 style="font-size:1rem">{i} {t}</h3><p style="font-size:.85rem">{d}</p></a>' for s, i, t, d in NEWT) + '</div>'
b += '<h2 class="h2" style="margin-top:34px">🧰 أدوات المحاسب الذكية</h2><div class="grid g4" style="margin-top:12px">' + ''.join(f'<a class="card" href="/business/tools/{s}/"><h3 style="font-size:1rem">{t}</h3></a>' for s, t in SMART) + '</div>'
b += '<h2 class="h2" style="margin-top:34px">📘 أدلة عملية</h2><div class="grid g3" style="margin-top:12px">' + ''.join(f'<a class="card" href="/accounting/guides/{s}/"><h3>{e(t)}</h3><p>{e(d)}</p></a>' for s, t, d, _, _ in GUIDES) + '</div>'
b += '<h2 class="h2" style="margin-top:34px">📚 المعايير المحاسبية الدولية</h2><input id="q" type="search" placeholder="ابحث: إيجار، مخزون، IFRS 16 ..." style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid #cbd5e1;margin:12px 0;font:inherit"><div class="grid g3" id="gs">' + ''.join(card(c, n, s) for c, n, s, *_ in STD) + '</div></div></section></main>'
b += '<script>const q=document.getElementById("q");q.oninput=()=>{const v=q.value.trim().toLowerCase();document.querySelectorAll("#gs .std").forEach(c=>{c.style.display=!v||c.dataset.q.toLowerCase().includes(v)?"":"none"})}</script>'
items = ld({"@context": "https://schema.org", "@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": f"{c} {n}", "url": BASE + f"/accounting/standards/{sl(c)}/"} for i, (c, n, *_ ) in enumerate(STD)]})
write("accounting/index.html", page("/accounting/", "مرجع المحاسب: المعايير المحاسبية الدولية IFRS وأدوات المطابقة | DIAMOND HUB", f"مرجع عربي للمحاسب: {len(STD)} معيارًا (IAS وIFRS) بملخص ومعالجة ونصائح، وأدوات ذكية لمطابقة البنك والفواتير والميزان والذمم، وأدلة الإقفال والضبط.", b, items + breadcrumb([("الرئيسية", "/"), ("مرجع المحاسب", "/accounting/")]), "/accounting/"))
URLS.insert(0, ("/accounting/", "0.9"))
json.dump(URLS, open(os.path.dirname(os.path.abspath(__file__)) + "/.acc_urls.json", "w"))
print("accounting built", len(URLS))
