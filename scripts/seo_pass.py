# -*- coding: utf-8 -*-
"""تمريرة SEO نهائية (idempotent): تقصير العناوين والأوصاف، توحيد العلامة، lastmod من git. تُشغَّل بعد كل البناء."""
import re, os, glob, html, subprocess, datetime
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = ('scripts/', 'admin/', 'account/', 'supabase/', 'apk/', 'distributor/', 'mugharrid-app/')
SEP = ['—', ':', '|', '،', '(', '·', '-']
def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
def short_title(t):
    if len(t) <= 62: return t
    if t.endswith(' | DIAMOND HUB'): t = t[:-len(' | DIAMOND HUB')]
    if len(t) <= 66: return t
    cut = max((t.rfind(s, 28, 64) for s in SEP), default=-1)
    if cut < 28:
        cut = t.rfind(' ', 28, 64)
        if cut < 0: cut = 62
    return t[:cut].rstrip(' —:|،(·-')
def short_desc(d):
    if len(d) <= 160: return d
    c = d.rfind('. ', 90, 158)
    if c > 0: return d[:c + 1]
    c = d.rfind(' ', 90, 157)
    return d[:c if c > 0 else 157].rstrip(' ،,:—-') + '…'
n = {'t': 0, 'd': 0, 'b': 0}
files = [f for f in glob.glob(R + '/**/*.html', recursive=True)
         if not any(f[len(R) + 1:].startswith(s) for s in SKIP) and 'google' not in os.path.basename(f)]
for f in files:
    h = open(f, encoding='utf-8', errors='ignore').read()
    if 'noindex' in h: continue
    o = h
    rel = f[len(R) + 1:]
    m = re.search(r'<title>(.*?)</title>', h, re.S)
    if m:
        t = html.unescape(m.group(1)).strip()
        if '| DIAMOND TV' in t and (rel.startswith(('articles/prompt-', 'prompt-studio/')) or rel in ('privacy/index.html', '404.html')):
            t = t.replace('| DIAMOND TV', '| DIAMOND HUB'); n['b'] += 1
        if rel == 'articles/index.html': t = t.replace('DIAMOND TV', 'DIAMOND HUB'); n['b'] += 1
        nt = short_title(t)
        if rel.startswith('articles/guide-') and 'دليل' not in nt: nt = short_title('دليل: ' + nt)
        if nt != html.unescape(m.group(1)).strip():
            n['t'] += 1
            h = h.replace(m.group(0), '<title>%s</title>' % esc(nt), 1)
            h = re.sub(r'(<meta property="og:title" content=")[^"]*(")', lambda x: x.group(1) + esc(nt) + x.group(2), h, count=1)
            h = re.sub(r'(<meta name="twitter:title" content=")[^"]*(")', lambda x: x.group(1) + esc(nt) + x.group(2), h, count=1)
    dm = re.search(r'<meta name="description" content="([^"]*)"', h)
    if dm:
        d = html.unescape(dm.group(1)).strip()
        nd = short_desc(d)
        if len(nd) < 80 and 'DIAMOND HUB' not in nd: nd = nd.rstrip('. ') + ' — مجانًا وبالعربية على DIAMOND HUB.'
        if nd != d:
            n['d'] += 1
            h = h.replace(dm.group(0), '<meta name="description" content="%s"' % esc(nd), 1)
            h = re.sub(r'(<meta property="og:description" content=")[^"]*(")', lambda x: x.group(1) + esc(nd) + x.group(2), h, count=1)
            h = re.sub(r'(<meta name="twitter:description" content=")[^"]*(")', lambda x: x.group(1) + esc(nd) + x.group(2), h, count=1)
    if h != o: open(f, 'w', encoding='utf-8').write(h)
print('seo_pass:', n, 'of', len(files), 'files')

# ---- lastmod من تاريخ آخر تعديل فعلي في git ----
B = "https://diamond-tv.shop"
out = subprocess.run(['git', '-C', R, 'log', '--name-only', '--format=@%cs', '--', '*.html'], capture_output=True, text=True).stdout
last = {}; cur = None
for ln in out.splitlines():
    if ln.startswith('@'): cur = ln[1:]
    elif ln.strip() and ln not in last: last[ln] = cur
sm = open(R + '/sitemap.xml', encoding='utf-8').read()
def lm(m):
    loc = m.group(1); path = loc[len(B):]
    cand = [path.lstrip('/')] if path.endswith('.html') else [path.strip('/') + '/index.html' if path != '/' else 'index.html']
    d = next((last[c] for c in cand if c in last), None)
    return '<url><loc>%s</loc>%s' % (loc, '<lastmod>%s</lastmod>' % d if d else '') + '</url>'
sm2 = re.sub(r'<url><loc>([^<]+)</loc>(?:<lastmod>[^<]*</lastmod>)?</url>', lm, sm)
sm2 = re.sub(r'(<url><loc>[^<]+</loc>(?:<lastmod>[^<]*</lastmod>)?</url>)\s*(?=<url>)', r'\1\n  ', sm2)
if sm2 != sm: open(R + '/sitemap.xml', 'w', encoding='utf-8').write(sm2)
print('sitemap lastmod from git:', sm2.count('<lastmod>'), 'of', sm2.count('<loc>'))
# ---- llms.txt: أرقام حيّة ----
try:
    import sys, io, contextlib
    sys.path.insert(0, os.path.join(R, 'scripts'))
    ntools = len(glob.glob(R + '/business/tools/*/index.html'))
    nles = len(glob.glob(R + '/claude/course/*/index.html'))
    p = R + '/llms.txt'; s = open(p, encoding='utf-8').read()
    s = re.sub(r'\d+ أداة مجانية بالعربية ومجهّزات برومت', '%d أداة مجانية بالعربية ومجهّزات برومت' % ntools, s)
    s = re.sub(r'\d+ درسًا في \d+ مستويات', '%d درسًا في 9 مستويات' % nles, s)
    if '/tools/' not in s: s = s.replace('## أدوات الأعمال', '## كل الأدوات\n- [مركز الأدوات](https://diamond-tv.shop/tools/): دليل منظّم لكل الأدوات المجانية بالبحث والفئات والمفضلة\n\n## أدوات الأعمال', 1)
    open(p, 'w', encoding='utf-8').write(s)
except Exception as ex: print('llms skip', ex)
