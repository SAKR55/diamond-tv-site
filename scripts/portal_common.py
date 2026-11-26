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


def nav(active=""):
    links = "".join('<a href="%s"%s>%s</a>' % (u, ' class="on"' if u == active else "", t) for u, t in NAV_ITEMS)
    return ('<nav class="pnav" aria-label="التنقل الرئيسي"><div class="wrap"><a class="logo" href="/"><svg class="gem" viewBox="0 0 40 40" width="30" height="30" aria-hidden="true"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><path d="M20 3 36 15 20 37 4 15Z" fill="url(#gg)"/><path d="M4 15h32M20 3l-6 12 6 22 6-22z" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/></svg><span class="lt"><b dir="ltr">DIAMOND <i class="tv">HUB</i></b><small>دايموند هب · الأدوات والتعلّم</small></span></a>'
            '<div class="links">%s<a class="keep" href="/search/">🔍 بحث</a></div></div></nav>' % links)


def footer():
    return ('<footer class="pf"><div class="wrap"><div class="cols">'
            '<div><h4>DIAMOND HUB</h4><p>منصة عربية للتعلّم والأدوات والتجارة الإلكترونية.</p></div>'
            '<div><h4>تعلّم</h4><ul><li><a href="/claude/">أكاديمية Claude</a></li><li><a href="/prompt-studio/">مختبر ChatGPT</a></li><li><a href="/mugharrid/">تعلّم الإنجليزية</a></li><li><a href="/store/">مكتبة الأطفال</a></li></ul></div>'
            '<div><h4>التجارة الإلكترونية</h4><ul><li><a href="/ecommerce/">المركز</a></li><li><a href="/ecommerce/tools/">الأدوات</a></li><li><a href="/business/">أدوات الأعمال</a></li><li><a href="/ecommerce/faq/">أسئلة شائعة</a></li><li><a href="/ecommerce/glossary/">القاموس</a></li><li><a href="/ecommerce/templates/">القوالب</a></li></ul></div>'
            '<div><h4>المزيد</h4><ul><li><a href="/app/">تطبيق DIAMOND TV</a></li><li><a href="/articles/">المقالات</a></li><li><a href="/#contact">تواصل معنا</a></li><li><a href="/sitemap.xml">خريطة الموقع</a></li></ul></div>'
            '</div><div class="copy">© 2026 DIAMOND HUB — المحتوى للتعريف والتعلّم ولا يغني عن استشارة مختص.</div></div></footer>')


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
