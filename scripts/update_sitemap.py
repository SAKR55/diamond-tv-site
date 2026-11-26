# -*- coding: utf-8 -*-
import re, os, glob
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));B="https://diamond-tv.shop";D="2026-11-26"
sm=open(ROOT+"/sitemap.xml",encoding="utf-8").read()
have=set(re.findall(r"<loc>%s(/[^<]*)</loc>"%B,sm))
cands=[]
for pat in ("claude/course/*/index.html","articles/*/index.html","ecommerce/**/index.html","business/**/index.html","cv/**/index.html","library/**/index.html","accounting/**/index.html","studio/**/index.html","claude/*/index.html"):
    for f in glob.glob(ROOT+"/"+pat,recursive=True):
        u="/"+os.path.relpath(os.path.dirname(f),ROOT).replace(os.sep,"/")+"/"
        h=open(f,encoding="utf-8",errors="ignore").read()
        if "noindex" in h[:3000]: continue
        cands.append(u)
cands+=["/ecommerce/","/business/","/search/","/app/","/cv/","/library/","/accounting/","/studio/","/studio/design/","/studio/video/","/studio/photos/"]
add=[u for u in sorted(set(cands)) if u not in have]
ent="".join('  <url><loc>%s%s</loc><lastmod>%s</lastmod></url>\n'%(B,u,D) for u in add)
sm=sm.replace("</urlset>",ent+"</urlset>")
# refresh lastmod of key pages
for u in ["/","/app/","/claude/","/claude/course/","/articles/","/import/"]:
    sm=re.sub(r"(<loc>%s%s</loc>\s*<lastmod>)[^<]*"%(re.escape(B),re.escape(u)),r"\g<1>"+D,sm)
open(ROOT+"/sitemap.xml","w",encoding="utf-8").write(sm)
print("added",len(add),"total",sm.count("<loc>"))
