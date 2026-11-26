# -*- coding: utf-8 -*-
"""يضيف Open Graph/Twitter وبيانات منظمة للصفحات العامة التي تفتقدها (آمن للتكرار)."""
import os, re, json, glob, html
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = "https://diamond-tv.shop"
SKIP = ("/admin/", "/claude/", "404.html", "/apk/", "/distributor/", "/evening/", "google", "/mugharrid-app/", "series.html")
changed = 0
for f in sorted(glob.glob(R + "/**/*.html", recursive=True)):
    rel = f[len(R):]
    if "/.git/" in f or any(k in rel for k in SKIP): continue
    s = open(f, encoding="utf-8").read()
    t = re.search(r"<title>(.*?)</title>", s, re.S); d = re.search(r'<meta name="description" content="(.*?)"', s)
    c = re.search(r'<link rel="canonical" href="(.*?)"', s)
    if not (t and d and c) or "noindex" in s: continue
    add = ""
    if 'og:title' not in s:
        tt, dd, cc = t.group(1).strip(), d.group(1), c.group(1)
        add += (f'<meta property="og:type" content="website"><meta property="og:site_name" content="DIAMOND HUB"><meta property="og:locale" content="ar_AR">'
                f'<meta property="og:title" content="{tt}"><meta property="og:description" content="{dd}"><meta property="og:url" content="{cc}"><meta property="og:image" content="{B}/og.png">'
                f'<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{tt}"><meta name="twitter:description" content="{dd}"><meta name="twitter:image" content="{B}/og.png">')
    if "application/ld+json" not in s:
        url = c.group(1); name = html.unescape(t.group(1).split("|")[0].strip())
        crumbs = [("الرئيسية", "/")]
        if rel.startswith("/articles/") and rel != "/articles/index.html": crumbs += [("المقالات", "/articles/")]
        crumbs += [(name, url.replace(B, ""))]
        typ = "Article" if rel.startswith("/articles/") and rel != "/articles/index.html" else ("CollectionPage" if rel == "/articles/index.html" else "WebPage")
        main = {"@context": "https://schema.org", "@type": typ, "name": name, "description": html.unescape(d.group(1)), "url": url, "inLanguage": "ar",
                "publisher": {"@type": "Organization", "name": "DIAMOND HUB", "url": B}}
        if typ == "Article":
            main.update({"headline": name, "image": B + "/og.png", "dateModified": "2026-11-26", "mainEntityOfPage": url})
        bc = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": B + u} for i, (n, u) in enumerate(crumbs)]}
        add += "".join('<script type="application/ld+json">' + json.dumps(o, ensure_ascii=False) + "</script>" for o in (main, bc))
    if add:
        s = s.replace("</head>", add + "</head>", 1); open(f, "w", encoding="utf-8").write(s); changed += 1; print("enriched", rel)
print("changed", changed)
