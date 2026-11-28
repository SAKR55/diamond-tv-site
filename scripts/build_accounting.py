# -*- coding: utf-8 -*-
import sys, json, re, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from portal_common import *
from acc_standards import STD
import importlib, glob as _g
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
DEEPA = {}
for _f in sorted(_g.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)),'lib','accdeep*.py'))):
    DEEPA.update(importlib.import_module(os.path.basename(_f)[:-3]).DEEPA)
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
def tool_link(s):
    return f'<a class="btn btn-o" href="/business/tools/{s}/">🧰 افتح الأداة المرتبطة ←</a>' if s else ''
# صفحات المعايير
for code, name, summ, pts, ent, tips, tool in STD:
    s = sl(code); u = f"/accounting/standards/{s}/"
    b = hero(f"{code}: {name}", summ, CR + ' › المعايير')
    b += '<main><section class="s"><div class="wrap narrow"><article class="prose">'
    b += f'<h2>ملخص المعيار</h2><p>{e(summ)}</p><h2>أهم النقاط</h2><ul>' + ''.join(f'<li>{e(p)}</li>' for p in pts) + '</ul>'
    b += f'<h2>المعالجة المحاسبية / القيد</h2><p>{e(ent)}</p><h2>نصائح وتوصيات للمحاسب</h2><ul>' + ''.join(f'<li>{e(t)}</li>' for t in tips) + '</ul>'
    b += deep_a(code)
    b += '<div class="note">مرجع تعليمي مختصر. اعتمد دائمًا نص المعيار الأصلي وسياسات منشأتك واستشر مراجعًا معتمدًا في الحالات المعقدة.</div>'
    b += '<p>' + tool_link(tool) + ' <a class="btn btn-o" href="/accounting/">← كل المعايير</a></p></article></div></section></main>'
    art = ld({"@context": "https://schema.org", "@type": "Article", "headline": f"{code} {name}", "description": summ, "inLanguage": "ar", "mainEntityOfPage": BASE + u, "author": {"@type": "Organization", "name": "DIAMOND HUB"}, "publisher": {"@type": "Organization", "name": "DIAMOND HUB"}})
    write(u.strip('/') + '/index.html', page(u, f"{code} {name}: ملخص ومعالجة محاسبية ونصائح | DIAMOND HUB", f"{name} ({code}): {summ} أهم النقاط والقيود والتوصيات للمحاسب.", b, art + breadcrumb([("الرئيسية", "/"), ("مرجع المحاسب", "/accounting/"), (code, u)]), "/accounting/", "article"))
    URLS.append((u, "0.7"))
# أدلة
for slug, title, desc, secs, tool in GUIDES:
    u = f"/accounting/guides/{slug}/"
    b = hero(title, desc, CR + ' › أدلة')
    b += '<main><section class="s"><div class="wrap narrow"><article class="prose">' + ''.join(f'<h2>{e(h)}</h2><ul>' + ''.join(f'<li>{e(p)}</li>' for p in ps) + '</ul>' for h, ps in secs) + '<p>' + tool_link(tool) + '</p></article></div></section></main>'
    art = ld({"@context": "https://schema.org", "@type": "Article", "headline": title, "description": desc, "inLanguage": "ar", "mainEntityOfPage": BASE + u, "author": {"@type": "Organization", "name": "DIAMOND HUB"}})
    write(u.strip('/') + '/index.html', page(u, f"{title} | DIAMOND HUB", desc, b, art + breadcrumb([("الرئيسية", "/"), ("مرجع المحاسب", "/accounting/"), (title, u)]), "/accounting/", "article"))
    URLS.append((u, "0.7"))
NEWT = [("general-ledger-trial-balance","📒","اليومية والأستاذ وميزان المراجعة","سجّل القيود فتحصل على الأستاذ والميزان وقائمتي الدخل والمركز المالي"),("journal-entries-guide","🧾","دليل القيود المحاسبية","36 قيدًا بالشرح والحسابات T وضريبة 15%"),("depreciation-calculator","🏭","حاسبة الإهلاك","أربع طرق مع الجدول وقيد الإهلاك"),("break-even-calculator","⚖️","حاسبة نقطة التعادل","هامش المساهمة والأمان والربح المستهدف برسم بياني"),("withholding-tax-calculator-saudi","🛂","ضريبة الاستقطاع","5% و15% و20% بالإجمالي أو الصافي مع القيد"),("payroll-calculator-saudi","👥","كشف الرواتب والتأمينات","الصافي وتكلفة المنشأة لعدة موظفين"),("vat-calculator","🧮","حاسبة ضريبة القيمة المضافة","إضافة واستخراج 15%"),("zakat-calculator","🕌","حاسبة الزكاة","وعاء الزكاة وقدرها"),("end-of-service-calculator-saudi","🏁","مكافأة نهاية الخدمة","وفق نظام العمل السعودي"),("loan-calculator","🏦","حاسبة القروض","القسط وجدول السداد"),("pdf-to-excel","📊","PDF to Excel","حوّل كشوف وجداول PDF إلى Excel منسّق"),("quotation-maker","📄","عرض سعر وفاتورة","بشعارك وضريبة 15%")]
# المركز
def card(code, name, summ): return f'<a class="card std" href="/accounting/standards/{sl(code)}/" data-q="{e(code+" "+name+" "+summ)}"><h3><span class="pill">{e(code)}</span> {e(name)}</h3><p>{e(summ)}</p></a>'
b = hero("مرجع المحاسب: المعايير والأدوات والأدلة", f"{len(STD)} معيارًا دوليًا بملخص ومعالجة ونصائح، و28 أداة وحاسبة (يومية وأستاذ وميزان، إهلاك، تعادل، استقطاع، رواتب، مطابقات وفحوص)، وأدلة عملية للإقفال والضبط الداخلي.", CR)
b += '<main><section class="s"><div class="wrap"><h2 class="h2">🧮 حاسبات وأدوات الحسابات والتقارير</h2><div class="grid g4" style="margin-top:12px">' + ''.join(f'<a class="card" href="/tools/{s}/"><h3 style="font-size:1rem">{i} {t}</h3><p style="font-size:.85rem">{d}</p></a>' for s, i, t, d in NEWT) + '</div>'
b += '<h2 class="h2" style="margin-top:34px">🧰 أدوات المحاسب الذكية</h2><div class="grid g4" style="margin-top:12px">' + ''.join(f'<a class="card" href="/business/tools/{s}/"><h3 style="font-size:1rem">{t}</h3></a>' for s, t in SMART) + '</div>'
b += '<h2 class="h2" style="margin-top:34px">📘 أدلة عملية</h2><div class="grid g3" style="margin-top:12px">' + ''.join(f'<a class="card" href="/accounting/guides/{s}/"><h3>{e(t)}</h3><p>{e(d)}</p></a>' for s, t, d, _, _ in GUIDES) + '</div>'
b += '<h2 class="h2" style="margin-top:34px">📚 المعايير المحاسبية الدولية</h2><input id="q" type="search" placeholder="ابحث: إيجار، مخزون، IFRS 16 ..." style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid #cbd5e1;margin:12px 0;font:inherit"><div class="grid g3" id="gs">' + ''.join(card(c, n, s) for c, n, s, *_ in STD) + '</div></div></section></main>'
b += '<script>const q=document.getElementById("q");q.oninput=()=>{const v=q.value.trim().toLowerCase();document.querySelectorAll("#gs .std").forEach(c=>{c.style.display=!v||c.dataset.q.toLowerCase().includes(v)?"":"none"})}</script>'
items = ld({"@context": "https://schema.org", "@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": f"{c} {n}", "url": BASE + f"/accounting/standards/{sl(c)}/"} for i, (c, n, *_ ) in enumerate(STD)]})
write("accounting/index.html", page("/accounting/", "مرجع المحاسب: المعايير المحاسبية الدولية IFRS وأدوات المطابقة | DIAMOND HUB", f"مرجع عربي للمحاسب: {len(STD)} معيارًا (IAS وIFRS) بملخص ومعالجة ونصائح، وأدوات ذكية لمطابقة البنك والفواتير والميزان والذمم، وأدلة الإقفال والضبط.", b, items + breadcrumb([("الرئيسية", "/"), ("مرجع المحاسب", "/accounting/")]), "/accounting/"))
URLS.insert(0, ("/accounting/", "0.9"))
json.dump(URLS, open(os.path.dirname(os.path.abspath(__file__)) + "/.acc_urls.json", "w"))
print("accounting built", len(URLS))
