# -*- coding: utf-8 -*-
"""يولّد /business/: أدوات المحاسبة والتسويق والتجارة والإدارة والموارد + مقالاتها."""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from portal_common import *
from biz_tools import T, CATS
import biz_tools2  # يضيف أدوات وفئات
from biz_articles import BIZ
from prompt_articles import PROMPT
BIZ = BIZ + PROMPT
from biz_runtime import RT
URLS = []
NOTE = "الأدوات تقديرية للتخطيط والتعلّم، وتعمل في متصفحك دون إرسال بياناتك. للقرارات المالية والنظامية راجع مختصًا مرخصًا."
from tool_guides import guide
BIZ = BIZ + [guide(t, CATS) for t in T]
CR = '<a href="/">الرئيسية</a> › <a href="/business/">أدوات الأعمال</a>'
byslug = {t['slug']: t for t in T}
bycat = {c: [t for t in T if t['cat'] == c] for c in CATS}
arts_for = {}
for a in BIZ:
    arts_for.setdefault(a['tool'][0].rstrip('/').split('/')[-1], []).append(a)

def tcard(t):
    ai = '<span class="badge-ai">AI</span>' if t['ai'] else ''
    return f'<a class="card" href="/business/tools/{t["slug"]}/" data-t="{e(t["title"]+" "+t["desc"])}"><div class="ic">{t["icon"]}</div><h3>{e(t["title"])}{ai}</h3><p>{e(t["desc"])}</p><span class="more">افتح الأداة ←</span></a>'
def acard(a):
    return f'<a class="card" href="/articles/{a["slug"]}/"><span class="tag">{e(a["tag"])}</span><h3>{e(a["title"])}</h3><p>{e(a["desc"])}</p><span class="more">اقرأ ({a["read"]} د) ←</span></a>'
catbar = lambda on='': '<div class="catbar">' + ''.join(f'<a href="/business/{c}/"{" class=on" if c == on else ""}>{v[0]} {v[1]}</a>' for c, v in CATS.items()) + '</div>'

# hub
body = hero("أدوات <span class='g-text'>الأعمال</span>: محاسبة وتسويق وإدارة وموارد بشرية",
  f"{len(T)} أداة تعمل في متصفحك، وبعضها يجهّز لك برومت للذكاء الاصطناعي، و{len(BIZ)} مقالًا تطبيقيًا.", CR, "🧰 مجانًا وبالعربية",
  extra='<div class="search-box"><input id="sq" type="search" placeholder="ابحث في الأدوات: ضريبة، قسط، مقابلة…" aria-label="بحث"></div>' + catbar() +
        f'<div class="stats"><div class="stat"><b>{len(T)}</b><span>أداة</span></div><div class="stat"><b>{len(BIZ)}</b><span>مقالًا</span></div><div class="stat"><b>{len(CATS)}</b><span>مجالات</span></div><div class="stat"><b>0</b><span>رسوم</span></div></div>')
body += '<main>'
for c, (ic, nm, ds) in CATS.items():
    body += f'<section class="s{" alt" if list(CATS).index(c) % 2 else ""}" id="{c}"><div class="wrap"><div class="center"><h2 class="h2">{ic} {nm}</h2><p class="lead">{ds}</p></div><br><div class="grid g3" data-grid>' + ''.join(tcard(t) for t in bycat[c]) + f'</div><p class="center" style="margin-top:14px"><a class="btn btn-o" href="/business/{c}/">كل أدوات ومقالات {nm}</a></p></div></section>'
body += '<section class="s"><div class="wrap narrow"><div class="note">' + e(NOTE) + '</div></div></section></main>'
body += '<script>const q=document.getElementById("sq");q.oninput=()=>{const w=q.value.trim().toLowerCase();document.querySelectorAll("[data-t]").forEach(a=>{a.style.display=!w||a.dataset.t.toLowerCase().includes(w)?"":"none"})}</script>'
t = "أدوات الأعمال: محاسبة وتسويق وإدارة وموارد بشرية بالذكاء الاصطناعي | DIAMOND TV"
d = f"{len(T)} أداة مجانية بالعربية: حاسبة ضريبة وقسط ونقطة تعادل، قائمة دخل، تقويم محتوى، OKR، وصف وظيفي، نهاية خدمة، ومجهزات برومت بالذكاء الاصطناعي."
write("business/index.html", page("/business/", t, d, body, breadcrumb([("الرئيسية", "/"), ("أدوات الأعمال", "/business/")]) + ld({"@context": "https://schema.org", "@type": "CollectionPage", "name": "أدوات الأعمال", "url": BASE + "/business/", "description": d, "inLanguage": "ar"}), "/business/"))
URLS.append(("/business/", "0.9"))

# categories
for c, (ic, nm, ds) in CATS.items():
    arts = [a for a in BIZ if any(tt['cat'] == c for tt in [byslug.get(a['tool'][0].rstrip('/').split('/')[-1], {'cat': ''})])]
    b = hero(f"{ic} {nm}", ds, CR + f' › {nm}') + '<main><section class="s"><div class="wrap">' + catbar(c) + '<div class="grid g3">' + ''.join(tcard(t) for t in bycat[c]) + '</div>'
    if arts: b += '<br><h2 class="h2 center">مقالات</h2><br><div class="grid g3">' + ''.join(acard(a) for a in arts) + '</div>'
    b += '<div class="note" style="margin-top:20px">' + e(NOTE) + '</div></div></section></main>'
    write(f"business/{c}/index.html", page(f"/business/{c}/", f"{nm}: أدوات ومقالات مجانية | DIAMOND TV", ds + f" {len(bycat[c])} أداة.", b, breadcrumb([("الرئيسية", "/"), ("أدوات الأعمال", "/business/"), (nm, f"/business/{c}/")]), "/business/"))
    URLS.append((f"/business/{c}/", "0.8"))

# tools
body = hero("كل أدوات الأعمال", f"{len(T)} أداة مصنّفة.", CR + ' › الأدوات') + '<main><section class="s"><div class="wrap"><div class="grid g3">' + ''.join(tcard(t) for t in T) + '</div></div></section></main>'
write("business/tools/index.html", page("/business/tools/", "كل أدوات الأعمال المجانية | DIAMOND TV", f"قائمة {len(T)} أداة: محاسبة، تسويق، تجارة إلكترونية، إدارة، موارد بشرية.", body, breadcrumb([("الرئيسية", "/"), ("أدوات الأعمال", "/business/"), ("الأدوات", "/business/tools/")]), "/business/"))
URLS.append(("/business/tools/", "0.7"))
for t in T:
    ic, nm, _ = CATS[t['cat']]
    same = [x for x in bycat[t['cat']] if x['slug'] != t['slug']][:3]
    rel = arts_for.get(t['slug'], [])
    b = hero(f"{t['icon']} {e(t['title'])}", e(t['desc']), CR + f' › <a href="/business/{t["cat"]}/">{nm}</a>')
    b += '<main><section class="s"><div class="wrap"><div class="tool-layout"><div class="tool"><h3>المدخلات</h3><div class="row2" id="form"></div></div><div class="out-col"><div class="tool"><h3>النتيجة</h3><div id="out" class="result" aria-live="polite"></div><div class="toolbar"><button class="btn btn-s" id="cpy" type="button">📋 نسخ النتيجة</button><button class="btn btn-s" id="prt" type="button">🖨️ طباعة</button><button class="btn btn-s" id="rst" type="button">↺ إعادة الضبط</button></div></div></div></div>'
    b += '<div class="note" style="margin-top:18px">' + e(NOTE) + '</div>'
    if rel: b += '<h2 class="h2 center" style="margin-top:30px">اقرأ أيضًا</h2><br><div class="grid g3">' + ''.join(acard(a) for a in rel) + '</div>'
    b += '<h2 class="h2 center" style="margin-top:30px">أدوات أخرى في ' + nm + '</h2><br><div class="grid g3">' + ''.join(tcard(x) for x in same) + '</div></div></section></main>'
    b += '<script>const SLUG=' + json.dumps(t['slug']) + ';const FIELDS=' + json.dumps(t['fields'], ensure_ascii=False) + ';' + t['js'] + RT + '</script>'
    ldx = breadcrumb([("الرئيسية", "/"), ("أدوات الأعمال", "/business/"), (t['title'], f"/business/tools/{t['slug']}/")]) + ld({"@context": "https://schema.org", "@type": "WebApplication", "name": t['title'], "url": BASE + f"/business/tools/{t['slug']}/", "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "inLanguage": "ar", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "SAR"}, "description": t['desc']})
    write(f"business/tools/{t['slug']}/index.html", page(f"/business/tools/{t['slug']}/", f"{t['title']} — أداة مجانية | DIAMOND TV", t['desc'] + " مجانًا وبالعربية وتعمل في متصفحك.", b, ldx, "/business/"))
    URLS.append((f"/business/tools/{t['slug']}/", "0.7"))

# articles
NOTE_A = "المحتوى للتعريف والتعلّم وليس استشارة مالية أو قانونية. راجع مختصًا مرخصًا والجهات الرسمية لوضعك."
for a in BIZ:
    path = f"/articles/{a['slug']}/"
    toolslug = a['tool'][0].rstrip('/').split('/')[-1]
    cat = byslug.get(toolslug, {}).get('cat')
    others = [x for x in BIZ if x['slug'] != a['slug'] and x['tag'] == a['tag']][:2] or [x for x in BIZ if x['slug'] != a['slug']][:2]
    secs = ''.join(f'<h2>{e(h)}</h2>' + ''.join(f'<p>{e(p)}</p>' for p in ps) for h, ps in a['sections'])
    b = hero(e(a['title']), e(a['desc']), CR + ' › <a href="/articles/">المقالات</a>', f"{a['tag']} · {a['read']} دقائق قراءة")
    b += '<main><article class="s"><div class="wrap"><div class="prose">' + secs + f'<div class="tip">🛠️ جرّب: <a href="{a["tool"][0]}">{e(a["tool"][1])}</a></div>' + (('<h2>أسئلة شائعة</h2>' + faq_html(a['faq'])) if a['faq'] else '') + '<div class="note">' + e(NOTE_A) + '</div></div><h2 class="h2 center">مقالات ذات صلة</h2><br><div class="grid g3">' + ''.join(acard(x) for x in others) + '</div></div></article></main>'
    ldx = ld({"@context": "https://schema.org", "@type": "Article", "headline": a['title'], "description": a['desc'], "inLanguage": "ar", "datePublished": DATE, "dateModified": DATE, "mainEntityOfPage": BASE + path, "image": BASE + "/assets/og.png", "author": {"@type": "Organization", "name": "DIAMOND TV"}, "publisher": {"@type": "Organization", "name": "DIAMOND TV"}}) + breadcrumb([("الرئيسية", "/"), ("أدوات الأعمال", "/business/"), (a['title'], path)])
    write(f"articles/{a['slug']}/index.html", page(path, a['title'] + " | DIAMOND TV", a['desc'], b, ldx, "/business/", "article"))
    URLS.append((path, "0.7"))
json.dump(URLS, open(os.path.join(ROOT, "scripts", ".biz_urls.json"), "w"))
print("business built", len(URLS), "pages;", len(T), "tools,", len(BIZ), "articles")
