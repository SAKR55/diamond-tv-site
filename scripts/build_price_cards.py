# -*- coding: utf-8 -*-
"""أدوات يومية بلا ذكاء اصطناعي (عربي وإنجليزي): تعمل بالكامل داخل المتصفح."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from portal_common import *
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def wr(p, s):
    os.makedirs(os.path.dirname(os.path.join(R, p)), exist_ok=True); open(os.path.join(R, p), 'w', encoding='utf-8').write(s)
def fld(p): return '<script type="application/ld+json">'+json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in p]},ensure_ascii=False)+'</script>'


HUB_AR, HUB_EN = '/tools/everyday/', '/en/everyday-tools/'
AU, EU = '/tools/price-tag-generator/', '/en/price-tag-generator/'
CSS = '''<style>.pt-wrap{display:grid;grid-template-columns:minmax(300px,380px) 1fr;gap:14px;max-width:1200px;margin:0 auto;padding:14px;align-items:start}@media(max-width:860px){.pt-wrap{grid-template-columns:1fr}}.pt-side{display:grid;gap:10px}.pt-d{background:#fff;border:1px solid #e4ddfb;border-radius:14px;padding:10px 12px}.pt-d summary{font-weight:800;cursor:pointer;padding:4px 0}.pt-d>*{margin-top:8px}.pt-l{display:grid;gap:4px;font-weight:700;font-size:13px}.pt-i{padding:9px;border:1px solid #d8d4ee;border-radius:10px;font:inherit;width:100%;box-sizing:border-box;background:#fff}.pt-c{width:100%;height:38px;padding:2px;border:1px solid #d8d4ee;border-radius:10px}.pt-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pt-4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.pt-k{display:flex;gap:6px;align-items:center;font-size:13px;font-weight:600}.pt-b{padding:9px 12px;border:0;border-radius:10px;background:#7c3aed;color:#fff;font:inherit;font-weight:700;cursor:pointer;display:inline-block}.pt-g{background:#ece8fb;color:#3b1d7a}.pt-p{background:#16a34a}.pt-btns,.pt-bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.pt-h{font-size:12px;color:#666;margin:6px 0 0}.pt-pal{display:flex;gap:6px;flex-wrap:wrap}.pt-sw{width:34px;height:34px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #bbb;cursor:pointer}.pt-row{display:grid;grid-template-columns:1.4fr .6fr .6fr 1fr .8fr auto auto;gap:4px;margin-bottom:6px}.pt-row .pt-i{padding:7px;font-size:13px}.pt-s{min-width:0}.pt-main{display:grid;gap:10px;position:sticky;top:8px}.pt-cv{width:100%;height:auto;border:1px solid #ddd;border-radius:10px;background:#fff;box-shadow:0 6px 24px rgba(0,0,0,.08)}@media(max-width:560px){.pt-row{grid-template-columns:1fr 1fr}}.pt-gal{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-height:420px;overflow:auto}.pt-th{width:100%;height:auto;border-radius:8px;cursor:pointer;border:1px solid #ddd}.pt-th:hover{outline:3px solid #7c3aed}.u-ab{max-width:820px;margin:0 auto;padding:18px}</style>'''
def lang_js(en):
    return ("<script>(function(){try{var q=location.search;if(/[?&]lang=/.test(q))return;var EN='"+en+"',st=localStorage.getItem('dh_lang');"
    "if(st){if(st==='en')location.replace(EN+q+location.hash);return}"
    "if(/bot|crawl|spider|slurp|google|bing|yandex|baidu|duckduck|lighthouse|facebookexternalhit|preview/i.test(navigator.userAgent))return;"
    "var l=((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();if(l.indexOf('ar')===0)return;"
    "var tz=(Intl.DateTimeFormat().resolvedOptions().timeZone||'');"
    "if(/^(Asia\\/(Riyadh|Dubai|Muscat|Kuwait|Qatar|Bahrain|Baghdad|Amman|Beirut|Damascus|Aden|Gaza|Hebron)|Africa\\/(Cairo|Tripoli|Tunis|Algiers|Casablanca|El_Aaiun|Khartoum|Juba|Djibouti|Mogadishu|Nouakchott)|Indian\\/Comoro)$/.test(tz))return;"
    "location.replace(EN+q+location.hash)}catch(e){}})()</script>")
def sw(u, label, v): return f'<div style="text-align:center;margin:10px 0"><a href="{u}" onclick="try{{localStorage.setItem(\'dh_lang\',\'{v}\')}}catch(e){{}}" style="display:inline-block;padding:8px 18px;border-radius:999px;background:#7c3aed;color:#fff;text-decoration:none;font-weight:700">🌐 {label}</a></div>'
def en_page(url, title, desc, h1, sub, ar_url, inner, extra=''):
    return f'''<!DOCTYPE html>
<html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><meta name="description" content="{desc}"><link rel="canonical" href="{BASE}{url}"><meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:site_name" content="DIAMOND HUB"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{BASE}{url}"><meta property="og:image" content="{BASE}/assets/og.png"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#7c3aed"><link rel="icon" href="/assets/icon.svg" type="image/svg+xml"><link rel="alternate" hreflang="ar" href="{BASE}{ar_url}"><link rel="alternate" hreflang="en" href="{BASE}{url}"><link rel="alternate" hreflang="x-default" href="{BASE}{url}">{extra}
<style>body{{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1c1830}}header.h{{background:linear-gradient(135deg,#4c1d95,#7c3aed);color:#fff;padding:34px 18px;text-align:center}}header.h h1{{margin:0 0 8px;font-size:30px}}header.h p{{margin:0 auto;max-width:600px;opacity:.92}}footer.f{{text-align:center;padding:24px;color:#666;font-size:14px}}a{{color:#6d28d9}}</style></head><body>
<header class="h"><div style="margin-bottom:8px"><a href="/" style="color:#fff">DIAMOND HUB</a> · <a href="{ar_url}" onclick="try{{localStorage.setItem('dh_lang','ar')}}catch(e){{}}" style="display:inline-block;padding:5px 14px;border-radius:999px;background:#fff;color:#4c1d95;text-decoration:none;font-weight:700">🌐 العربية</a></div><h1>{h1}</h1><p>{sub}</p></header>
{CSS}{inner}<footer class="f">© 2026 DIAMOND HUB · <a href="/">Home</a> · <a href="{HUB_EN}">Everyday tools</a> · <a href="{ar_url}">العربية</a></footer></body></html>'''

FAQ_AR=[('كيف أضيف عشرات المنتجات بسرعة؟','اضغط «لصق من Excel/CSV» والصق الأسطر: الاسم، السعر، السعر القديم، ملاحظة، باركود. ستتوزع على صفحات A4 تلقائيًا.'),('هل يحسب نسبة الخصم؟','نعم، إذا أدخلت السعر القديم تظهر نسبة الخصم تلقائيًا على البطاقة.'),('هل أستطيع إضافة شعاري وتغيير الخط واللون؟','نعم، ارفع الشعار واختر ألوانك وخطك من 10 خطوط عربية.'),('ما أحجام الورق؟','A3 وA4 وA5 وA6 وLetter طوليًا أو عرضيًا، مع تقسيمات جاهزة أو عدد أعمدة وصفوف مخصص.'),('هل تُرفع بياناتي لأي خادم؟','لا، كل شيء يعمل داخل متصفحك.')]
FAQ_EN=[('How do I add many products fast?','Use "Paste from Excel/CSV" with lines: name, price, old price, note, barcode. They flow across A4 pages automatically.'),('Does it calculate the discount?','Yes. Enter the old price and the discount % shows on the tag.'),('Can I add my logo, font and colors?','Yes: upload a logo, pick your colors and one of 10 Arabic-friendly fonts.'),('Which paper sizes?','A3, A4, A5, A6 and Letter in portrait or landscape, with ready grids or a custom columns × rows.'),('Is my data uploaded?','No, everything runs in your browser.')]
AT,ASUB='مولّد بطاقات الأسعار والعروض','صمّم بطاقات أسعار وعروض احترافية: 200 تصميم، ألوان وخطوط وشعارك، باركود وQR، وطباعة A4 أو PNG مجانًا.'
ET,ESUB='Price Tag & Offer Card Generator','Create professional price tags and offer cards: 200 designs, your colors, fonts and logo, barcode & QR, print on A4 or export PNG, free.'
alt=f'<link rel="alternate" hreflang="ar" href="{BASE}{AU}"><link rel="alternate" hreflang="en" href="{BASE}{EU}"><link rel="alternate" hreflang="x-default" href="{BASE}{EU}">'
def app(): return '<div id="pt-app"></div><script src="/assets/qr.js"></script><script src="/assets/pricetag.js" defer></script>'
aab='صمّم بطاقات الأسعار للمحلات والمتاجر والبقالات والعروض الموسمية: قوالب للعرض الخاطف والتصفية وخصم كبير واشترِ واحصل، مع أحجام متعددة. يمكنك أيضًا إدراج بطاقة سعر داخل <a href="/studio/design/">محرر التصميم</a>.'
eab='Design price tags for shops, supermarkets and seasonal offers: flash sale, clearance, giant discount and buy-and-get templates in many sizes. You can also insert a price card inside the <a href="/studio/design/">design editor</a>.'
body=lang_js(EU)+hero(AT,ASUB,eyebrow='🏷 أداة مجانية')+sw(EU,'English','en')+CSS+app()+f'<section class="u-ab"><p>{aab}</p><h2>أسئلة شائعة</h2>'+''.join(f'<h3>{q}</h3><p>{a}</p>' for q,a in FAQ_AR)+f'<p><a href="{HUB_AR}">كل الأدوات اليومية</a></p></section>'
wr(AU.strip('/')+'/index.html',page(AU,f'{AT} | DIAMOND HUB',ASUB,body,extra_ld=alt+fld(FAQ_AR)+breadcrumb([("الرئيسية","/"),("الأدوات","/tools/"),(AT,AU)])))
inner=app()+f'<section class="u-ab"><p>{eab}</p><h2>FAQ</h2>'+''.join(f'<h3>{q}</h3><p>{a}</p>' for q,a in FAQ_EN)+'</section>'
wr(EU.strip('/')+'/index.html',en_page(EU,f'{ET} | DIAMOND HUB',ESUB,ET,ESUB,AU,inner,fld(FAQ_EN)))
print('price built')

# ---- offers magazine / catalog maker ----
CU, CE = '/tools/offers-catalog-maker/', '/en/offers-catalog-maker/'
CAT, CASUB = 'صانع مجلات العروض والكتالوجات', 'اصنع مجلة عروض أو كتالوج منتجات احترافي: غلاف وصفحات أسعار وصفحة تواصل، 20 ثيمًا، وتصدير PDF وPNG مجانًا.'
CET, CESUB = 'Offers Magazine & Catalog Maker', 'Build a professional offers magazine or product catalog: cover, price pages and contact page, 20 themes, free PDF and PNG export.'
CFAQ_AR = [('كيف أصنع مجلة عروض؟', 'أدخل عنوان المجلة واسم المتجر، أضف منتجاتك يدويًا أو بلصقها من Excel، ارفع صور المنتجات دفعة واحدة، ثم اختر الثيم والمقاس وصدّر PDF.'), ('ما المقاسات المتاحة؟', 'A4 طولي وعرضي وA5 ومربع للسوشيال وعرض 16:9 للشاشات وستوري 9:16.'), ('كم منتجًا في الصفحة؟', 'من منتج واحد إلى 16 منتجًا في الصفحة، وتتوزع الصفحات تلقائيًا.'), ('هل أستطيع تقسيم المنتجات لأقسام؟', 'نعم، اكتب القسم لكل منتج وفعّل عناوين الأقسام فتظهر كل مجموعة في صفحات خاصة.'), ('هل تُرفع صوري لخادم؟', 'لا، كل شيء يعمل داخل متصفحك.')]
CFAQ_EN = [('How do I make an offers magazine?', 'Enter the title and store name, add products by hand or paste from Excel, upload product photos in bulk, pick a theme and size, then export PDF.'), ('Which sizes are available?', 'A4 portrait and landscape, A5, square for social, 16:9 for screens and 9:16 story.'), ('How many products per page?', 'From 1 to 16 per page, with pages created automatically.'), ('Can I group products by category?', 'Yes. Add a category to each product and enable category headings so each group gets its own pages.'), ('Are my photos uploaded?', 'No, everything runs in your browser.')]
calt = f'<link rel="alternate" hreflang="ar" href="{BASE}{CU}"><link rel="alternate" hreflang="en" href="{BASE}{CE}"><link rel="alternate" hreflang="x-default" href="{BASE}{CE}">'
def capp(): return '<div id="ct-app"></div><script src="/assets/qr.js"></script><script src="/assets/pricetag.js" defer></script><script src="/assets/catalog.js" defer></script>'
cab = 'للمحلات والسوبرماركت والمتاجر الإلكترونية: مجلة عروض أسبوعية أو كتالوج موسمي بتصميم جاهز وبطاقات أسعار مميزة. جرّب أيضًا <a href="/tools/price-tag-generator/">مولّد بطاقات الأسعار</a>.'
ceb = 'For shops, supermarkets and online stores: a weekly offers magazine or seasonal catalog with ready designs and standout price cards. Also try the <a href="/en/price-tag-generator/">price tag generator</a>.'
body = lang_js(CE) + hero(CAT, CASUB, eyebrow='📰 أداة مجانية') + sw(CE, 'English', 'en') + CSS + capp() + f'<section class="u-ab"><p>{cab}</p><h2>أسئلة شائعة</h2>' + ''.join(f'<h3>{q}</h3><p>{a}</p>' for q, a in CFAQ_AR) + f'<p><a href="{HUB_AR}">كل الأدوات اليومية</a></p></section>'
wr(CU.strip('/') + '/index.html', page(CU, f'{CAT} | DIAMOND HUB', CASUB, body, extra_ld=calt + fld(CFAQ_AR) + breadcrumb([("الرئيسية", "/"), ("الأدوات", "/tools/"), (CAT, CU)])))
inner = capp() + f'<section class="u-ab"><p>{ceb}</p><h2>FAQ</h2>' + ''.join(f'<h3>{q}</h3><p>{a}</p>' for q, a in CFAQ_EN) + '</section>'
wr(CE.strip('/') + '/index.html', en_page(CE, f'{CET} | DIAMOND HUB', CESUB, CET, CESUB, CU, inner, fld(CFAQ_EN)))
print('catalog built')
