# -*- coding: utf-8 -*-
"""يولّد قسم التجارة الإلكترونية. تشغيل: python3 scripts/build_ecommerce.py"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from portal_common import *
from ecom_content import NOTE_LEGAL, ARTICLES, GLOSSARY, FAQ, TEMPLATES
from ecom_articles2 import ARTICLES2
from ecom_tools import TOOLS, COMMON

ALL = ARTICLES + ARTICLES2
import glob as _g, importlib as _il
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
_AD = {}
for _f in sorted(_g.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib', 'artdeep*.py'))):
    _AD.update(_il.import_module(os.path.basename(_f)[:-3]).ART)
for _a in ALL:
    if _a['slug'] in _AD: _a['sections'] = list(_a['sections']) + list(_AD[_a['slug']])
URLS = []  # (path, priority)
CRUMB = '<a href="/">الرئيسية</a> › <a href="/ecommerce/">التجارة الإلكترونية</a>'

def tool_cards():
    return '<div class="grid g3">' + ''.join(
        f'<a class="card" href="/ecommerce/tools/{s}/"><div class="ic">{ic}</div><h3>{e(t)}</h3><p>{e(d)}</p><span class="more">افتح الأداة ←</span></a>' for s, ic, t, d, h, j in TOOLS) + '</div>'

def art_cards(lst):
    return '<div class="grid g3">' + ''.join(
        f'<a class="card" href="/articles/{a["slug"]}/"><span class="tag">{e(a["tag"])}</span><h3>{e(a["title"])}</h3><p>{e(a["desc"])}</p><span class="more">اقرأ ({a["read"]} د) ←</span></a>' for a in lst) + '</div>'

# ---- hub
hub_faq = FAQ[:6]
body = hero("التجارة الإلكترونية <span class='g-text'>من الفكرة إلى أول طلب</span>",
  "حاسبات وقوالب وأدلة عملية للاستيراد والبيع أونلاين وإدارة المتجر وحل المشكلات الشائعة، بالعربية ومجانًا.",
  CRUMB, "🛒 قسم التجارة الإلكترونية (الاستيراد سابقًا)",
  extra='<div class="path"><a href="/ecommerce/tools/margin-calculator/">🧮 احسب سعر البيع</a><a href="/import/calc.html">📦 تكلفة الاستيراد</a><a href="/ecommerce/tools/product-idea-score/">🎯 قيّم فكرتك</a><a href="/ecommerce/tools/launch-checklist/">✅ قائمة الإطلاق</a></div>'
  '<div class="stats"><div class="stat"><b>%d</b><span>أداة</span></div><div class="stat"><b>%d</b><span>مقالًا</span></div><div class="stat"><b>%d</b><span>سؤالًا</span></div><div class="stat"><b>%d</b><span>مصطلحًا</span></div><div class="stat"><b>%d</b><span>قالبًا</span></div></div>' % (len(TOOLS), len(ALL), len(FAQ), len(GLOSSARY), len(TEMPLATES)))
body += '<main>'
body += '<section class="s"><div class="wrap"><h2 class="h2 center">الأدوات</h2><p class="lead center">كلها تعمل في متصفحك دون تسجيل ولا إرسال بيانات.</p><br>' + tool_cards() + '</div></section>'
body += '<section class="s alt"><div class="wrap"><h2 class="h2 center">ابدأ من هنا</h2><br><div class="grid g4">' + ''.join(
  f'<a class="card" href="{u}"><div class="ic">{i}</div><h3>{t}</h3><p>{d}</p></a>' for i, t, d, u in [
  ("🚀","مسار المبتدئ","اختر المنتج ثم احسب ثم ابحث عن مورد ثم أطلق.","/articles/choose-first-product-idea/"),
  ("📦","أدلة الاستيراد","كتب وخدمات واستيراد من الصين خطوة بخطوة.","/import/"),
  ("🛠️","حلول المشكلات","متجر لا يبيع؟ مرتجعات؟ تأخر شحن؟","/articles/solve-low-sales-new-store/"),
  ("🤖","الذكاء الاصطناعي لمتجرك","قوالب برومبت لوصف المنتج والردود.","/claude/prompt-builder/")]) + '</div></div></section>'
body += '<section class="s"><div class="wrap"><h2 class="h2 center">مقالات التجارة والإدارة وحلول المشكلات</h2><br>' + art_cards(ALL) + '</div></section>'
body += '<section class="s alt"><div class="wrap narrow"><h2 class="h2 center">موارد جاهزة</h2><br><div class="grid g3"><a class="card" href="/ecommerce/faq/"><h3>❓ الأسئلة الشائعة</h3><p>%d سؤالًا بإجابات عملية.</p></a><a class="card" href="/ecommerce/glossary/"><h3>📖 قاموس المصطلحات</h3><p>MOQ وFOB وROAS وغيرها.</p></a><a class="card" href="/ecommerce/templates/"><h3>💬 قوالب الرسائل</h3><p>ردود وسياسات جاهزة للنسخ.</p></a></div></div></section>' % len(FAQ)
body += '<section class="s"><div class="wrap narrow"><h2 class="h2 center">أسئلة سريعة</h2><br>' + faq_html(hub_faq) + '<p class="center"><a class="btn btn-o" href="/ecommerce/faq/">كل الأسئلة</a></p><div class="note">' + e(NOTE_LEGAL) + '</div></div></section>'
body += '<section class="s alt"><div class="wrap"><div data-spark="import"></div></div></section></main>'
t = "التجارة الإلكترونية: أدوات وأدلة الاستيراد والبيع أونلاين | DIAMOND HUB"
d = "مركز عربي للتجارة الإلكترونية: حاسبة الهامش وROAS، مقيّم المنتج، قوالب الموردين والعملاء، مقالات إدارة وحلول المشكلات، وأسئلة شائعة."
write("ecommerce/index.html", page("/ecommerce/", t, d, body, faq_ld(hub_faq) + breadcrumb([("الرئيسية","/"),("التجارة الإلكترونية","/ecommerce/")]) +
  ld({"@context":"https://schema.org","@type":"CollectionPage","name":"التجارة الإلكترونية","url":BASE+"/ecommerce/","description":d,"inLanguage":"ar"}), "/ecommerce/"))
URLS.append(("/ecommerce/", "0.9"))

# ---- tools index + tools
body = hero("أدوات التجار", "سبع أدوات عملية تعمل داخل متصفحك.", CRUMB + ' › الأدوات') + '<main><section class="s"><div class="wrap">' + tool_cards() + '</div></section></main>'
write("ecommerce/tools/index.html", page("/ecommerce/tools/", "أدوات التجارة الإلكترونية المجانية | DIAMOND HUB", "حاسبة هامش، ROAS، مولّد رسالة مورد، مقارنة موردين، مقيّم منتج، قائمة إطلاق ومولّد وصف.", body, breadcrumb([("الرئيسية","/"),("التجارة الإلكترونية","/ecommerce/"),("الأدوات","/ecommerce/tools/")]), "/ecommerce/"))
URLS.append(("/ecommerce/tools/", "0.8"))
rel = {"margin-calculator": ["pricing","ecommerce-pricing-margin-guide"], "roas-breakeven": ["ads-roas-cpa-beginners"], "supplier-message": ["talk-to-suppliers-template"], "supplier-compare": ["new-importer-mistakes"], "product-idea-score": ["choose-first-product-idea"], "launch-checklist": ["build-customer-trust-online-store"], "product-description": ["product-description-that-sells"]}
for s, ic, tt, dd, h, j in TOOLS:
    r = [a for a in ALL if a["slug"] in rel.get(s, [])]
    more = [x for x in TOOLS if x[0] != s][:3]
    body = hero(f"{ic} {e(tt)}", e(dd), CRUMB + f' › <a href="/ecommerce/tools/">الأدوات</a>')
    body += '<main><section class="s"><div class="wrap narrow"><div class="tool">' + h + '</div><div class="note">' + e(NOTE_LEGAL) + '</div>'
    if r: body += '<h2 class="h2">اقرأ أيضًا</h2><br>' + art_cards(r)
    body += '<h2 class="h2">أدوات أخرى</h2><br><div class="grid g3">' + ''.join(f'<a class="card" href="/ecommerce/tools/{x[0]}/"><div class="ic">{x[1]}</div><h3>{e(x[2])}</h3></a>' for x in more) + '</div></div></section></main>'
    body += '<script>' + COMMON + j + '</script>'
    write(f"ecommerce/tools/{s}/index.html", page(f"/ecommerce/tools/{s}/", f"{tt} — مجانًا | DIAMOND HUB", dd, body,
      breadcrumb([("الرئيسية","/"),("التجارة الإلكترونية","/ecommerce/"),("الأدوات","/ecommerce/tools/"),(tt,f"/ecommerce/tools/{s}/")]) +
      ld({"@context":"https://schema.org","@type":"WebApplication","name":tt,"url":BASE+f"/ecommerce/tools/{s}/","applicationCategory":"BusinessApplication","operatingSystem":"Web","inLanguage":"ar","offers":{"@type":"Offer","price":"0","priceCurrency":"SAR"},"description":dd}), "/ecommerce/"))
    URLS.append((f"/ecommerce/tools/{s}/", "0.8"))

# ---- faq
body = hero("الأسئلة الشائعة في التجارة الإلكترونية", f"{len(FAQ)} سؤالًا وجوابًا للتاجر المبتدئ والمستورد.", CRUMB + ' › الأسئلة الشائعة') + '<main><section class="s"><div class="wrap narrow">' + faq_html(FAQ) + '<div class="note">' + e(NOTE_LEGAL) + '</div></div></section></main>'
write("ecommerce/faq/index.html", page("/ecommerce/faq/", "أسئلة شائعة في التجارة الإلكترونية والاستيراد | DIAMOND HUB", "إجابات عملية عن بدء المتجر، الموردين، التسعير، الإعلانات، الشحن والمرتجعات.", body, faq_ld(FAQ) + breadcrumb([("الرئيسية","/"),("التجارة الإلكترونية","/ecommerce/"),("الأسئلة الشائعة","/ecommerce/faq/")]), "/ecommerce/"))
URLS.append(("/ecommerce/faq/", "0.8"))

# ---- glossary
rows = ''.join(f'<tr><td><b>{e(a)}</b></td><td>{e(b)}</td><td style="white-space:normal">{e(c)}</td></tr>' for a, b, c in GLOSSARY)
body = hero("قاموس مصطلحات التجارة والاستيراد", f"{len(GLOSSARY)} مصطلحًا مهمًا بشرح مبسط.", CRUMB + ' › القاموس') + '<main><section class="s"><div class="wrap narrow"><table class="t"><tr><th>المصطلح</th><th>بالعربية</th><th>المعنى</th></tr>' + rows + '</table></div></section></main>'
write("ecommerce/glossary/index.html", page("/ecommerce/glossary/", "قاموس مصطلحات التجارة الإلكترونية والاستيراد (MOQ, FOB, ROAS...)", "شرح عربي مبسط لأهم مصطلحات التجارة والاستيراد والإعلانات.", body, breadcrumb([("الرئيسية","/"),("التجارة الإلكترونية","/ecommerce/"),("القاموس","/ecommerce/glossary/")]) +
  ld({"@context":"https://schema.org","@type":"DefinedTermSet","name":"قاموس التجارة الإلكترونية","hasDefinedTerm":[{"@type":"DefinedTerm","name":a,"description":b+": "+c} for a,b,c in GLOSSARY]}), "/ecommerce/"))
URLS.append(("/ecommerce/glossary/", "0.7"))

# ---- templates
tp = ''.join(f'<h3>{e(a)}</h3><pre class="tpl">{e(b)}</pre><button class="btn btn-s" onclick="cp(this)">نسخ</button>' for a, b in TEMPLATES)
body = hero("قوالب رسائل وسياسات جاهزة", "انسخ وعدّل الأقواس المربعة حسب حالتك.", CRUMB + ' › القوالب') + '<main><section class="s"><div class="wrap narrow">' + tp + '</div></section></main><script>function cp(b){var t=b.previousElementSibling.textContent;navigator.clipboard.writeText(t).then(function(){b.textContent="✅ تم"},function(){b.textContent="انسخ يدويًا"})}</script>'
write("ecommerce/templates/index.html", page("/ecommerce/templates/", "قوالب رسائل العملاء وسياسات المتجر الجاهزة | DIAMOND HUB", "عشرة قوالب جاهزة: تأكيد الطلب، الشحن، الاعتذار، الإرجاع، السلة المتروكة وغيرها.", body, breadcrumb([("الرئيسية","/"),("التجارة الإلكترونية","/ecommerce/"),("القوالب","/ecommerce/templates/")]), "/ecommerce/"))
URLS.append(("/ecommerce/templates/", "0.7"))

# ---- articles
for a in ALL:
    path = f"/articles/{a['slug']}/"
    others = [x for x in ALL if x['slug'] != a['slug'] and x['tag'] == a['tag']][:2] or [x for x in ALL if x['slug'] != a['slug']][:2]
    secs = ''.join(f'<h2>{e(h)}</h2>' + ''.join(f'<p>{e(p)}</p>' for p in ps) for h, ps in a['sections'])
    fq = a.get('faq') or []
    b = hero(e(a['title']), e(a['desc']), CRUMB + f' › <a href="/articles/">المقالات</a>', f"{a['tag']} · {a['read']} دقائق قراءة")
    b += '<main><article class="s"><div class="wrap"><div class="prose">' + secs
    b += f'<div class="tip">🛠️ جرّب: <a href="{a["tool"][0]}">{e(a["tool"][1])}</a></div>'
    if fq: b += '<h2>أسئلة شائعة</h2>' + faq_html(fq)
    b += '<div class="note">' + e(NOTE_LEGAL) + '</div></div><h2 class="h2 center">مقالات ذات صلة</h2><br>' + art_cards(others) + '</div></article></main>'
    ldx = ld({"@context":"https://schema.org","@type":"Article","headline":a['title'],"description":a['desc'],"inLanguage":"ar","datePublished":DATE,"dateModified":DATE,"mainEntityOfPage":BASE+path,"image":BASE+"/assets/og.png","author":{"@type":"Organization","name":"DIAMOND HUB"},"publisher":{"@type":"Organization","name":"DIAMOND HUB"}})
    ldx += breadcrumb([("الرئيسية","/"),("التجارة الإلكترونية","/ecommerce/"),(a['title'],path)]) + (faq_ld(fq) if fq else "")
    write(f"articles/{a['slug']}/index.html", page(path, a['title'] + " | DIAMOND HUB", a['desc'], b, ldx, "/ecommerce/", "article"))
    URLS.append((path, "0.7"))

import json
json.dump(URLS, open(os.path.join(ROOT, "scripts", ".ecom_urls.json"), "w"))
json.dump([{"t": a["title"], "u": f"/articles/{a['slug']}/", "d": a["desc"], "k": "مقال تجارة"} for a in ALL], open(os.path.join(ROOT, "scripts", ".ecom_search.json"), "w"), ensure_ascii=False)
print("built", len(URLS), "pages")
