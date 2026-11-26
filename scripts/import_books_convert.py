# -*- coding: utf-8 -*-
"""يحوّل كتيّبي الاستيراد (import/book1, book2) إلى كتب في المكتبة: scripts/lib/books5.py + raw5.json"""
import re, json, html as H, os
R = os.path.dirname(os.path.abspath(__file__)) + '/..'
def txt(s): return H.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s))).strip()
META = [
 ('import/book1/index.html', 'import-from-china-guide', 'كيف تستورد من الصين إلى السعودية', 'دليل عملي من أول فكرة حتى أول بيعة', '🚢', 'متوسط', 'الاستيراد'),
 ('import/book2/index.html', 'start-store-10k-plan', 'ابدأ متجرك الإلكتروني بـ 10 آلاف ريال', 'خطة 30 يومًا من الميزانية إلى أول مبيعات', '🛍️', 'مبتدئ', 'الاستيراد والتجارة'),
]
books, raw = [], {}
for path, slug, title, sub, icon, level, tag in META:
    b = open(f'{R}/{path}', encoding='utf-8').read()
    desc = re.search(r'<meta name="description" content="(.*?)"', b).group(1)
    a = b[b.find('<article'):b.find('</article>')]
    parts = re.split(r'(?=<h2[ >])', a)[1:]
    chs, rw = [], {}
    for i, p in enumerate(parts):
        t = txt(re.search(r'<h2[^>]*>(.*?)</h2>', p, re.S).group(1))
        body = re.sub(r'<h2[^>]*>.*?</h2>', '', p, count=1, flags=re.S)
        body = re.sub(r'<div class="next">.*?</div>', '', body, flags=re.S).strip()
        m = re.search(r'<p>(.*?)</p>', body, re.S)
        first = txt(m.group(1)) if m else t
        if m: body = body.replace(m.group(0), '', 1)
        strongs = [txt(x) for x in re.findall(r'<strong>(.*?)</strong>', p, re.S) if 12 < len(txt(x)) < 140][:3]
        keys = strongs or [txt(x) for x in re.findall(r'<li>(.*?)</li>', p, re.S)[:3]] or [first[:120]]
        chs.append((re.sub(r'^الفصل \d+: |^الخطوة \d+: ', lambda s: s.group(0), t), [first], keys))
        rw[str(i)] = body
    books.append(dict(slug=slug, title=title, sub=sub, icon=icon, level=level, tag=tag, desc=desc, chapters=chs))
    raw[slug] = rw
with open(f'{R}/scripts/lib/books5.py', 'w', encoding='utf-8') as f:
    f.write('# -*- coding: utf-8 -*-\n# مولَّد من scripts/import_books_convert.py\n')
    for n, bk in zip(('B11', 'B12'), books): f.write(f'{n} = {bk!r}\n')
json.dump(raw, open(f'{R}/scripts/lib/raw5.json', 'w', encoding='utf-8'), ensure_ascii=False)
print([len(b['chapters']) for b in books])
