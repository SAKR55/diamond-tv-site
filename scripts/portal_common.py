# -*- coding: utf-8 -*-
"""مكوّنات مشتركة لصفحات البوابة الجديدة (تصميم portal.css)."""
import html, json, os
e = html.escape
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://diamond-tv.shop"
DATE = "2026-11-26"

NAV_ITEMS = [("/", "الرئيسية"), ("/claude/", "Claude"), ("/prompt-studio/", "ChatGPT"),
             ("/ecommerce/", "التجارة الإلكترونية"), ("/business/", "أدوات الأعمال"), ("/accounting/", "مرجع المحاسب"), ("/cv/", "السيرة الذاتية"), ("/studio/", "استوديو التصميم"), ("/library/", "كتب الذكاء الاصطناعي"), ("/mugharrid/", "الإنجليزية"),
             ("/store/", "المكتبة"), ("/app/", "التطبيق"), ("/articles/", "المقالات")]


import re as _re, time as _time
ASSET_V = _time.strftime("%Y%m%d%H%M")
def _bust(c):
    return _re.sub(r'(/assets/[\w.-]+\.(?:css|js))(?=["\'])', r'\1?v=' + ASSET_V, c)


def write(path, content):
    if path.endswith('.html'):
        content = _bust(content)
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + "</script>"


def breadcrumb(items):
    return ld({"@context": "https://schema.org", "@type": "BreadcrumbList",
               "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + u} for i, (n, u) in enumerate(items)]})


def faq_ld(pairs):
    return ld({"@context": "https://schema.org", "@type": "FAQPage",
               "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pairs]})


NAV_GROUPS = [
 ("🎓", "التعلّم", [("/claude/", "أكاديمية Claude"), ("/prompt-studio/", "مختبر ChatGPT"), ("/library/", "كتب الذكاء الاصطناعي"), ("/mugharrid/", "تعلّم الإنجليزية"), ("/store/", "مكتبة الأطفال"), ("/articles/", "المقالات")]),
 ("🧰", "الأعمال", [("/business/", "أدوات الأعمال (220+)"), ("/ecommerce/", "التجارة الإلكترونية"), ("/accounting/", "مرجع المحاسب"), ("/cv/", "السيرة الذاتية")]),
 ("🎨", "الإبداع", [("/studio/design/", "محرر التصميم"), ("/studio/video/", "صانع الفيديو"), ("/studio/photos/", "أدوات الصور"), ("/studio/", "كل الاستوديو")]),
 ("📺", "التطبيق", [("/app/", "تطبيق DIAMOND TV"), ("/download/", "تحميل التطبيق")]),
]
def nav(active=""):
    def on(u): return u == active or (u != "/" and active and u.startswith(active) and active != "/") or (active and active.startswith(u) and u != "/" and len(u) > 1)
    parts = ['<a href="/"%s>🏠 الرئيسية</a>' % (' class="on"' if active == "/" else "")]
    for ic, t, items in NAV_GROUPS:
        cur = any(on(u) for u, _ in items)
        lis = "".join('<a href="%s"%s>%s</a>' % (u, ' class="on"' if on(u) else "", n) for u, n in items)
        parts.append('<div class="dd%s"><button type="button" class="ddb" aria-haspopup="true" aria-expanded="false">%s %s <span class="car">▾</span></button><div class="ddm">%s</div></div>' % (" cur" if cur else "", ic, t, lis))
    links = "".join(parts)
    return ('<nav class="pnav" aria-label="التنقل الرئيسي"><div class="wrap"><a class="logo" href="/"><svg class="gem" viewBox="0 0 40 40" width="30" height="30" aria-hidden="true"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><path d="M20 3 36 15 20 37 4 15Z" fill="url(#gg)"/><path d="M4 15h32M20 3l-6 12 6 22 6-22z" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/></svg><span class="lt"><b dir="ltr">DIAMOND <i class="tv">HUB</i></b><small>دايموند هب · الأدوات والتعلّم</small></span></a>'
            '<button type="button" class="burger" aria-label="القائمة" aria-expanded="false">☰</button>'
            '<div class="links">%s<a class="keep" href="/map/">🗺 خريطة الموقع</a><a class="keep" href="/search/">🔍 بحث</a><a class="keep" href="/account/">👤 حسابي</a></div></div></nav><script src="/assets/track.js" defer></script>'
            '<script>(function(){var n=document.querySelector(".pnav");if(!n)return;var b=n.querySelector(".burger"),L=n.querySelector(".links");b.onclick=function(){var o=L.classList.toggle("open");b.setAttribute("aria-expanded",o)};n.querySelectorAll(".ddb").forEach(function(x){x.onclick=function(e){e.stopPropagation();var d=x.parentNode,o=!d.classList.contains("open");n.querySelectorAll(".dd.open").forEach(function(y){y.classList.remove("open");y.firstChild.setAttribute("aria-expanded","false")});if(o){d.classList.add("open");x.setAttribute("aria-expanded","true")}}});document.addEventListener("click",function(){n.querySelectorAll(".dd.open").forEach(function(y){y.classList.remove("open")})})})()</script>' % links)


def footer():
    def col(t, items): return '<div><h4>%s</h4><ul>%s</ul></div>' % (t, ''.join('<li><a href="%s">%s</a></li>' % (u, n) for u, n in items))
    cols = ''.join(col(ic + " " + t, items) for ic, t, items in NAV_GROUPS)
    return ('<footer class="pf"><div class="wrap"><div class="cols pfc">'
            '<div><h4>DIAMOND HUB</h4><p>منصة عربية مجانية للتعلّم والأدوات والتجارة الإلكترونية والتصميم.</p><p><a href="/map/">🗺 خريطة الموقع</a> · <a href="/search/">🔍 بحث</a> · <a href="/#contact">تواصل معنا</a></p></div>'
            + cols + '</div><div class="copy">© 2026 DIAMOND HUB — المحتوى للتعريف والتعلّم ولا يغني عن استشارة مختص. · <a href="/privacy/">الخصوصية</a> · <a href="/sitemap.xml">sitemap.xml</a></div></div></footer>')


def page(path, title, desc, body, extra_ld="", active="", og_type="website", css_extra=""):
    url = BASE + path
    return f'''<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}"><meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="{og_type}"><meta property="og:locale" content="ar_AR"><meta property="og:site_name" content="DIAMOND HUB">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}/assets/og.png">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(desc)}">
<meta name="theme-color" content="#7c3aed"><link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/portal.css">{css_extra}
{extra_ld}</head><body>
{nav(active)}
{body}
{footer()}
<script src="/assets/spark.js" defer></script><script src="/assets/share.js" defer></script><script src="/assets/pwa.js" defer></script>
</body></html>'''


def hero(title, lead, crumbs="", eyebrow="", dark=False, extra=""):
    return (f'<header class="phero{" dark" if dark else ""}"><div class="wrap narrow center">'
            f'<div class="crumbs">{crumbs}</div>' + (f'<span class="pill">{eyebrow}</span>' if eyebrow else "") +
            f'<h1>{title}</h1><p class="lead">{lead}</p>{extra}</div></header>')


def faq_html(pairs):
    return '<div class="faq">' + "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in pairs) + '</div>'
