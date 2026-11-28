# -*- coding: utf-8 -*-
"""مرور نهائي للسيو: يشغَّل بعد كل البناء. يقصّ الأوصاف الطويلة، يُكمل القصيرة، ويضيف وسوم OG الناقصة. آمن للتكرار."""
import re, glob, html, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SKIP = ('admin', 'voice-extension', 'mugharrid-app/admin', 'distributor', 'account', 'apk', 'download', 'node_modules')
B = 'https://diamond-tv.shop'
def trim(t, n=158):
    if len(t) <= n: return t
    c = t[:n]
    for sep in ('. ', '، ', ' — ', ' '):
        i = c.rfind(sep)
        if i > 90: c = c[:i]; break
    return c.rstrip(' .،—-') + '.'
ch = 0
for f in glob.glob('**/*.html', recursive=True):
    if f.startswith(SKIP) or f.startswith('google'): continue
    s = open(f, encoding='utf-8', errors='ignore').read()
    if 'noindex' in s or '<head' not in s: continue
    o = s
    m = re.search(r'<meta name="description" content="([^"]*)"', s)
    if m:
        d = html.unescape(m.group(1)); nd = d
        if len(d) > 175: nd = trim(d)
        elif len(d) < 50: nd = d.rstrip('. ') + '. شرح عملي بالعربية مع أمثلة وخطوات تطبيق على DIAMOND HUB.'
        if nd != d:
            e = html.escape(nd, quote=True)
            s = s.replace(m.group(0), '<meta name="description" content="' + e + '"')
            s = re.sub(r'(<meta property="og:description" content=")[^"]*"', lambda x: x.group(1) + e + '"', s, 1)
            s = re.sub(r'(<meta name="twitter:description" content=")[^"]*"', lambda x: x.group(1) + e + '"', s, 1)
    if 'og:image' not in s:
        t = re.search(r'<title>(.*?)</title>', s, re.S); d2 = re.search(r'name="description" content="([^"]*)"', s)
        u = '/' + f[:-10] if f.endswith('/index.html') else '/' + f
        if t and d2:
            ex = ''
            if 'og:title' not in s: ex += '<meta property="og:title" content="%s">' % html.escape(t.group(1).strip(), quote=True)
            if 'og:description' not in s: ex += '<meta property="og:description" content="%s">' % d2.group(1)
            if 'og:url' not in s: ex += '<meta property="og:url" content="%s%s">' % (B, u)
            if 'og:type' not in s: ex += '<meta property="og:type" content="website">'
            ex += '<meta property="og:image" content="%s/assets/og.png">' % B
            if 'twitter:card' not in s: ex += '<meta name="twitter:card" content="summary_large_image">'
            s = s.replace('</head>', ex + '</head>', 1)
    if s != o:
        open(f, 'w', encoding='utf-8').write(s); ch += 1
print('seo_finalize changed', ch)
