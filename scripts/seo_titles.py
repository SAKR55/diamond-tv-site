# -*- coding: utf-8 -*-
"""Site-wide SEO hygiene: shorten long <title>, fix short/long meta descriptions, add missing JSON-LD. Idempotent."""
import glob,re,os,json,html
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));B="https://diamond-tv.shop"
st=dict(t=0,ds=0,dl=0,ld=0)
def strip(x): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',x))).strip()
def short_title(x):
    x=html.unescape(x).strip()
    if len(x)<=62: return None
    y=x
    m=re.match(r'^(.*?)\s*\|\s*DIAMOND HUB$',y)
    if m and len(m.group(1))>=20: y=m.group(1)
    if len(y)>68:
        for sep in (' — ',' – ',': ',' - ','، '):
            if sep in y:
                a=y.split(sep)[0].strip()
                if 20<=len(a)<=68: y=a; break
    return y if y!=x and len(y)<len(x) else None
def cut_desc(d):
    d=html.unescape(d)
    if len(d)<=165: return None
    c=d[:160]; i=max(c.rfind('. '),c.rfind('، '),c.rfind(' — '),c.rfind(' '))
    c=c[:i].rstrip(' ،—-.') if i>110 else c
    return c+'.'
for f in glob.glob(ROOT+'/**/index.html',recursive=True):
    rel=os.path.relpath(f,ROOT).replace(os.sep,'/')
    if rel.startswith(('admin','scripts','supabase','apk','tools/receipt-payment-voucher')) or rel=='index.html': continue
    s=o=open(f,encoding='utf-8',errors='ignore').read()
    if 'noindex' in s[:4000]: continue
    m=re.search(r'<title>(.*?)</title>',s,re.S)
    if m:
        n=short_title(m.group(1))
        if n: s=s.replace(m.group(0),'<title>'+html.escape(n,quote=False)+'</title>',1); st['t']+=1
    d=re.search(r'<meta name="description" content="([^"]*)"',s)
    if d:
        v=html.unescape(d.group(1))
        if len(v)<70:
            p=re.search(r'<p class="lead">(.*?)</p>',s,re.S) or re.search(r'<main.*?<p[^>]*>(.*?)</p>',s,re.S) or re.search(r'<article.*?<p[^>]*>(.*?)</p>',s,re.S)
            if p:
                t=strip(p.group(1))
                if t and t not in v:
                    nv=(v.rstrip('. ')+'. '+t)
                    if len(nv)>160: nv=nv[:160].rsplit(' ',1)[0].rstrip(' ،.-')+'.'
                    if len(nv)>len(v)+15: s=s.replace(d.group(0),'<meta name="description" content="'+html.escape(nv)+'">',1); st['ds']+=1
        else:
            n=cut_desc(v)
            if n: s=s.replace(d.group(0),'<meta name="description" content="'+html.escape(n)+'">',1); st['dl']+=1
    if 'application/ld+json' not in s:
        t=m and strip(m.group(1)) or ''; u=B+'/'+rel[:-len('index.html')]
        parts=[p for p in rel[:-len('/index.html')].split('/') if p]
        bc=[{"@type":"ListItem","position":1,"name":"الرئيسية","item":B+"/"}]
        acc='';
        for i,p in enumerate(parts):
            acc+='/'+p+'/'; bc.append({"@type":"ListItem","position":i+2,"name":(t if i==len(parts)-1 else p),"item":B+acc})
        dd=re.search(r'<meta name="description" content="([^"]*)"',s)
        j=json.dumps({"@context":"https://schema.org","@graph":[{"@type":"WebPage","name":t,"url":u,"description":html.unescape(dd.group(1)) if dd else '',"inLanguage":"en" if rel.startswith('en/') else "ar","isPartOf":{"@type":"WebSite","name":"DIAMOND HUB","url":B}},{"@type":"BreadcrumbList","itemListElement":bc}]},ensure_ascii=False)
        s=s.replace('</head>','<script type="application/ld+json">'+j+'</script></head>',1); st['ld']+=1
    if s!=o: open(f,'w',encoding='utf-8').write(s)
print(st)
