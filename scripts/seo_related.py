# -*- coding: utf-8 -*-
"""Internal-link block (related tools + job hubs) for tool pages lacking one. Idempotent via data-rel marker."""
import re,os,glob,json,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import seo_jobs as J
ROOT=J.ROOT
SI=J.SI
def tl(u):
    t=J.tool(u); return t
n=0
for f in sorted(glob.glob(ROOT+"/tools/*/index.html")):
    s=open(f,encoding="utf-8").read()
    if 'data-rel="1"' in s or 'ذات صلة' in s or '<footer class="pf"' not in s: continue
    slug=f.split('/')[-2]; me="/tools/%s/"%slug
    hubs=[j for j in J.JOBS if me in j["extra"]]
    links=[];seen={me}
    for j in hubs:
        for u in j["extra"]:
            if u in seen or u in ("/accounting/","/cv/"): continue
            t=tl(u)
            if t: links.append(t); seen.add(u)
    if len(links)<6:
        for u in ["/tools/receipt-payment-voucher/","/tools/quotation-maker/","/tools/vat-calculator/","/tools/pdf-to-excel/","/tools/qr-code-generator/","/tools/percentage-calculator/","/tools/unit-converter/"]:
            if u not in seen and len(links)<6:
                t=tl(u)
                if t: links.append(t); seen.add(u)
    links=links[:6]
    who=''
    if hubs: who='<p>مفيدة خصوصًا لـ: '+' · '.join('<a href="/jobs/%s/">%s</a>'%(j["slug"],j["name"]) for j in hubs)+'.</p>'
    else: who='<p>تصفّح <a href="/jobs/">الأدوات حسب وظيفتك</a> أو <a href="/tools/">كل الأدوات المجانية</a>.</p>'
    blk='<section class="s" data-rel="1" style="padding:22px 0"><div class="wrap narrow"><h2 style="font-size:1.15rem">أدوات وأدلة ذات صلة</h2>'+who+'<p style="display:flex;flex-wrap:wrap;gap:8px">'+''.join('<a style="background:#f5f3ff;color:#5b21b6;border-radius:999px;padding:6px 14px;text-decoration:none;font-weight:700" href="%s">%s</a>'%(u,t) for u,t,d in links)+'</p></div></section>'
    s=s.replace('<footer class="pf"',blk+'<footer class="pf"',1); open(f,"w",encoding="utf-8").write(s); n+=1
print("updated",n)
