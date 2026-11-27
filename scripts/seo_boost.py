# -*- coding: utf-8 -*-
import re,os,json
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));B="https://diamond-tv.shop"
for u in ["/business/","/business/tools/","/cv/","/studio/","/studio/design/","/studio/video/","/studio/voice/","/studio/photos/","/library/","/articles/","/ecommerce/","/claude/","/store/"]:
    f=R+u+"index.html"
    if not os.path.exists(f):continue
    h=open(f,encoding="utf-8").read()
    if '"ItemList"' in h:continue
    m=re.search(r"<main.*?</main>",h,re.S)
    if not m:continue
    items=[];seen=set()
    for href,inner in re.findall(r'<a[^>]+href="(/[^"#]+/)"[^>]*>(.*?)</a>',m.group(0),re.S):
        t=re.sub(r"<[^>]+>","",inner).strip()
        if len(t)<6 or href in seen or href==u:continue
        seen.add(href);items.append((t[:90],href))
    items=items[:40]
    if len(items)<3:continue
    ld={"@context":"https://schema.org","@type":"ItemList","itemListElement":[{"@type":"ListItem","position":i+1,"name":n,"url":B+x} for i,(n,x) in enumerate(items)]}
    h=h.replace("</head>",'<script type="application/ld+json">'+json.dumps(ld,ensure_ascii=False)+"</script></head>",1)
    open(f,"w",encoding="utf-8").write(h);print("itemlist",u,len(items))
