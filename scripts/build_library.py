# -*- coding: utf-8 -*-
import sys, json
import os; _d=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,_d); sys.path.insert(0,_d+'/lib')
from portal_common import *
from books1 import B1, B2
from books2 import B3, B4, B5
from books3 import B6, B7, B8
from books4 import B9, B10
BOOKS = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10]
from ext1 import EXT
from ext2 import EXT2
from ext3 import EXT3
import importlib, glob as _g
DEEP = {}
for _f in sorted(_g.glob(os.path.join(_d,'lib','deep*.py'))):
    DEEP.update(importlib.import_module(os.path.basename(_f)[:-3]).DEEP)
def deep(b, i): return DEEP.get(b['slug'], {}).get(i, [])
def deep_html(b, i):
    out = ''
    for h, ps in deep(b, i):
        out += f'<h2 class="h2">{e(h)}</h2>'; ul = []
        for p in ps:
            if p.startswith('• '): ul.append(p[2:]); continue
            if ul: out += '<ul>' + ''.join(f'<li>{e(x)}</li>' for x in ul) + '</ul>'; ul = []
            out += f'<p>{e(p)}</p>'
        if ul: out += '<ul>' + ''.join(f'<li>{e(x)}</li>' for x in ul) + '</ul>'
    return out
def deep_words(b, i): return sum(len(p.split()) for _, ps in deep(b, i) for p in ps)
EXTS = {}; EXTS.update(EXT); EXTS.update(EXT2); EXTS.update(EXT3)
def ext(b, i):
    x = EXTS.get(b['slug'], [])
    return x[i] if i < len(x) else None
def ext_html(b, i):
    x = ext(b, i)
    if not x: return ''
    return '<div class="ex"><h3>🧪 مثال تطبيقي</h3><p>' + e(x[0]) + '</p><h3>⚠️ أخطاء شائعة</h3><ul>' + ''.join(f'<li>{e(m)}</li>' for m in x[1]) + '</ul><h3>✍️ تمرين</h3><p>' + e(x[2]) + '</p></div>'
CR = '<a href="/">الرئيسية</a> › <a href="/library/">مكتبة الذكاء الاصطناعي</a>'
URLS = []
def words(b): return sum(deep_words(b, i) + len(" ".join(p).split()) + (len(" ".join([ext(b,i)[0]]+ext(b,i)[1]+[ext(b,i)[2]]).split()) if ext(b,i) else 0) for i, (_, p, _) in enumerate(b['chapters']))
def mins(b): return max(5, round(words(b) / 180))
def cslug(i): return f"chapter-{i+1}"
CSS = '<link rel="stylesheet" href="/assets/library.css">'
COLS = [("#7c3aed", "#2563eb"), ("#0f766e", "#16a34a"), ("#be123c", "#7c3aed"), ("#b45309", "#dc2626"), ("#1d4ed8", "#0e7490"), ("#334155", "#7c3aed"), ("#047857", "#2563eb"), ("#9333ea", "#db2777")]
def cover(b, i):
    c = COLS[i % len(COLS)]
    return f'<div class="cover" style="--c1:{c[0]};--c2:{c[1]}" aria-hidden="true"><span class="ci">{b["icon"]}</span><span class="ct">{e(b["title"])}</span><span class="cb">DIAMOND HUB</span></div>'
def toc(b):
    return '<ol class="toc">' + ''.join(f'<li><a href="/library/{b["slug"]}/{cslug(i)}/">{e(c[0])}</a></li>' for i, c in enumerate(b['chapters'])) + '</ol>'
# chapters
for bi, b in enumerate(BOOKS):
    n = len(b['chapters'])
    for i, (t, ps, keys) in enumerate(b['chapters']):
        path = f"/library/{b['slug']}/{cslug(i)}/"
        title = f"{t} | {b['title']}"
        desc = (ps[0][:150] + "…")
        body = hero(e(t), f"الفصل {i+1} من {n} في كتاب «{e(b['title'])}»", CR + f' › <a href="/library/{b["slug"]}/">{e(b["title"])}</a>', f"{b['icon']} الفصل {i+1}")
        pn = '<div class="pn">' + (f'<a class="btn btn-o" href="/library/{b["slug"]}/{cslug(i-1)}/">← السابق</a>' if i else '<span></span>') + (f'<a class="btn btn-g" href="/library/{b["slug"]}/{cslug(i+1)}/">التالي: {e(b["chapters"][i+1][0])} →</a>' if i < n - 1 else f'<a class="btn btn-g" href="/library/{b["slug"]}/">فهرس الكتاب</a>') + '</div>'
        body += '<div id="rp"></div><main><section class="s"><div class="wrap narrow"><div class="rtools"><button type="button" id="fp" aria-label="تكبير الخط">A+</button><button type="button" id="fm" aria-label="تصغير الخط">A-</button><button type="button" id="dm">🌙</button><span class="ch">الفصل %d / %d · ' % (i+1, n) + str(max(1, round((sum(len(x.split()) for x in ps)+deep_words(b, i))/180))) + ' د قراءة</span></div><div class="prose">' + ''.join(f'<p>{e(p)}</p>' for p in ps) + deep_html(b, i) + ext_html(b, i) + '<div class="keys"><h3>خلاصة الفصل</h3><ul>' + ''.join(f'<li>{e(k)}</li>' for k in keys) + '</ul></div>' + pn
        others = [x for x in BOOKS if x is not b][:3]
        body += '<h3>كتب أخرى في المكتبة</h3><div class="grid g3">' + ''.join(f'<a class="card" href="/library/{x["slug"]}/"><div class="ic">{x["icon"]}</div><h3>{e(x["title"])}</h3></a>' for x in others) + '</div></div></section></main>'
        ldx = breadcrumb([("الرئيسية", "/"), ("مكتبة الذكاء الاصطناعي", "/library/"), (b['title'], f"/library/{b['slug']}/"), (t, path)]) + ld({"@context": "https://schema.org", "@type": "Article", "headline": t, "description": desc, "inLanguage": "ar", "mainEntityOfPage": BASE + path, "isPartOf": {"@type": "Book", "name": b['title'], "url": BASE + f"/library/{b['slug']}/"}, "author": {"@type": "Organization", "name": "DIAMOND HUB"}, "publisher": {"@type": "Organization", "name": "DIAMOND HUB"}, "datePublished": DATE, "dateModified": DATE})
        write(f"library/{b['slug']}/{cslug(i)}/index.html", page(path, title, desc, body, ldx, "/library/", "article", CSS))
        URLS.append((path, "0.7"))
    # book landing
    path = f"/library/{b['slug']}/"
    faq = [(f"ما هو كتاب {b['title']}؟", b['desc']), ("هل الكتاب مجاني؟", "نعم، مجاني بالكامل للقراءة على الموقع، مع نسخة كاملة للطباعة أو الحفظ PDF."), ("لمن هذا الكتاب؟", f"مستواه {b['level']} ويناسب كل من يريد تطبيق الذكاء الاصطناعي في تعلمه أو عمله."), ("كم يستغرق قراءته؟", f"نحو {mins(b)} دقيقة على {n} فصول.")]
    body = hero(f"{b['icon']} {e(b['title'])}", e(b['sub']), CR, f"{b['level']} · {n} فصول · {mins(b)} دقيقة")
    body += f'<main><section class="s"><div class="wrap narrow"><div class="book">{cover(b, bi)}<div><p class="lead">{e(b["desc"])}</p><p><a class="btn btn-g" href="/library/{b["slug"]}/chapter-1/">ابدأ القراءة ←</a> <a class="btn btn-o" href="/library/{b["slug"]}/full/">النسخة الكاملة / PDF</a></p></div></div><h2 class="h2">فهرس الكتاب</h2>{toc(b)}<h2 class="h2">أسئلة شائعة</h2>{faq_html(faq)}</div></section></main>'
    ldx = breadcrumb([("الرئيسية", "/"), ("مكتبة الذكاء الاصطناعي", "/library/"), (b['title'], path)]) + faq_ld(faq) + ld({"@context": "https://schema.org", "@type": "Book", "name": b['title'], "description": b['desc'], "inLanguage": "ar", "url": BASE + path, "genre": "الذكاء الاصطناعي", "isAccessibleForFree": True, "numberOfPages": n, "author": {"@type": "Organization", "name": "DIAMOND HUB"}, "publisher": {"@type": "Organization", "name": "DIAMOND HUB"}, "hasPart": [{"@type": "Chapter", "name": c[0], "url": BASE + f"/library/{b['slug']}/{cslug(i)}/"} for i, c in enumerate(b['chapters'])]})
    write(f"library/{b['slug']}/index.html", page(path, f"كتاب {b['title']} | قراءة مجانية", b['desc'], body, ldx, "/library/", "book", CSS)); URLS.append((path, "0.9"))
    # full
    fp = f"/library/{b['slug']}/full/"
    body = hero(e(b['title']), e(b['sub']), CR + f' › <a href="/library/{b["slug"]}/">{e(b["title"])}</a>', "نسخة كاملة للطباعة / حفظ PDF")
    body += '<main><section class="s"><div class="wrap narrow prose"><p><button class="btn btn-g" onclick="print()">🖨️ طباعة / حفظ PDF</button></p>' + ''.join(f'<h2 class="h2">{i+1}. {e(c[0])}</h2>' + ''.join(f'<p>{e(p)}</p>' for p in c[1]) + deep_html(b, i) + ext_html(b, i) + '<div class="keys"><ul>' + ''.join(f'<li>{e(k)}</li>' for k in c[2]) + '</ul></div>' for i, c in enumerate(b['chapters'])) + '</div></section></main>'
    write(f"library/{b['slug']}/full/index.html", page(fp, f"{b['title']} - النسخة الكاملة", b['desc'], body, breadcrumb([("الرئيسية", "/"), ("مكتبة الذكاء الاصطناعي", "/library/"), (b['title'], f"/library/{b['slug']}/")]), "/library/", "book", CSS)); URLS.append((fp, "0.6"))
# hub
tot = sum(len(b['chapters']) for b in BOOKS); tw = sum(words(b) for b in BOOKS)
body = hero("مكتبة <span class='g-text'>الذكاء الاصطناعي</span>: كتب عربية مجانية شاملة", f"{len(BOOKS)} كتب و{tot} فصلًا عن الذكاء الاصطناعي وتطبيقاته: الأساسيات، الأعمال، البرومت، التعليم، المحاسبة والموارد البشرية، الأخلاقيات، مستقبل العمل، والتطبيقات.", CR, "📚 اقرأ مجانًا")
body += '<main><section class="s"><div class="wrap"><div class="grid g2">' + ''.join(f'<a class="card libcard" href="/library/{b["slug"]}/"><div class="book">{cover(b, i)}<div><span class="tag">{e(b["tag"])}</span><h3>{e(b["title"])}</h3><p>{e(b["sub"])}</p><span class="more">{len(b["chapters"])} فصول · {mins(b)} د ←</span></div></div></a>' for i, b in enumerate(BOOKS)) + '</div></div></section>'
body += '<section class="s alt"><div class="wrap narrow"><h2 class="h2">مسار قراءة مقترح</h2><ol><li>ابدأ بـ«الذكاء الاصطناعي من الصفر».</li><li>تعلّم كتابة البرومت من «دليل البرومت».</li><li>طبّق في مجالك: الأعمال أو التعليم أو المحاسبة.</li><li>اقرأ الأخلاقيات ثم مستقبل العمل.</li></ol><p><a class="btn btn-o" href="/claude/prompt-builder/">أداة البرومت</a> <a class="btn btn-o" href="/business/">أدوات الأعمال</a> <a class="btn btn-o" href="/cv/">السيرة الذاتية</a></p></div></section></main>'
hubfaq = [("هل كتب المكتبة مجانية؟", "نعم، كلها مجانية للقراءة على الموقع."), ("هل يمكن حفظ الكتاب PDF؟", "نعم، من صفحة «النسخة الكاملة» لكل كتاب اختر طباعة ثم حفظ PDF."), ("هل المحتوى محدّث؟", "المبادئ ثابتة، أما الأدوات والميزات فتتغير بسرعة؛ راجع المواقع الرسمية للتفاصيل الحالية.")]
body = body.replace('</main>', '<section class="s"><div class="wrap narrow"><h2 class="h2">أسئلة شائعة</h2>' + faq_html(hubfaq) + '</div></section></main>')
write("library/index.html", page("/library/", "مكتبة الذكاء الاصطناعي: كتب عربية مجانية شاملة | DIAMOND HUB", f"{len(BOOKS)} كتب مجانية بالعربية عن الذكاء الاصطناعي وتطبيقاته: الأساسيات، الأعمال، البرومت، التعليم، المحاسبة، الأخلاقيات، مستقبل العمل.", body,
    breadcrumb([("الرئيسية", "/"), ("مكتبة الذكاء الاصطناعي", "/library/")]) + faq_ld(hubfaq) + ld({"@context": "https://schema.org", "@type": "CollectionPage", "name": "مكتبة الذكاء الاصطناعي", "url": BASE + "/library/", "inLanguage": "ar"}), "/library/", css_extra=CSS)); URLS.append(("/library/", "0.9"))
json.dump([u for u, _ in URLS], open('.lib_urls.json', 'w'))
print("library", len(BOOKS), "books", tot, "chapters", tw, "words", len(URLS), "pages")
