# -*- coding: utf-8 -*-
"""Job-oriented hub pages (/jobs/...) so people searching for a job/role find the matching tools."""
import re,os,json,html
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));B="https://diamond-tv.shop";D="2026-11-28"
esc=lambda s:html.escape(s,quote=True)
SI={x["u"]:x for x in json.load(open(ROOT+"/search-index.json",encoding="utf-8"))}
def cards(cat):
    s=open(ROOT+"/business/%s/index.html"%cat,encoding="utf-8").read(); r=[]
    for m in re.finditer(r'<a class="card" href="([^"]+)"[^>]*>(?:<div class="ic">(.*?)</div>)?<h3[^>]*>(.*?)</h3>(?:<p>(.*?)</p>)?',s):
        r.append((m.group(1),re.sub(r'\s*مجانًا$','',re.sub('<[^>]+>','',m.group(3))).strip(),re.sub('<[^>]+>','',m.group(4) or '')))
    return r
def tool(u):
    x=SI.get(u); 
    if not x: return None
    t=re.split(r'\s[—:|]\s',x["t"])[0]; t=re.sub(r'\s*\(.*?\)','',t); t=re.sub(r'\s*مجانًا$','',t).strip(); return (u,t,x["d"])
TPL=open(ROOT+"/accounting/guides/month-end-close-checklist/index.html",encoding="utf-8").read()
HEAD=TPL[:TPL.index('<header class="phero">')]; TAIL=TPL[TPL.index('</article>'):]
TAIL=TAIL.replace('</article></div></section></main>','</div></section></main>',1)
JOBS=[
 dict(slug="hr",name="الموارد البشرية والرواتب",kw="موظف موارد بشرية، أخصائي رواتب، مسؤول توظيف",
  title="أدوات الموارد البشرية والرواتب والتوظيف المجانية",
  desc="أدوات مجانية لمسؤول الموارد البشرية: سندات رواتب لكل موظف، حاسبة الرواتب ونهاية الخدمة في السعودية، وصف وظيفي، مقابلات التوظيف وتقييم الأداء.",
  intro="تدير الموارد البشرية دورة الموظف كاملة: توظيف، وعقود، ورواتب، وإجازات، وتقييم أداء، ومكافأة نهاية الخدمة. تجمع هذه الصفحة الأدوات التي يحتاجها الأخصائي يوميًا، وكلها تعمل في المتصفح دون تسجيل.",
  duties=["إعداد مسير الرواتب وإصدار سند راتب لكل موظف","حساب نهاية الخدمة والإجازات والتأمينات","كتابة الوصف الوظيفي وأسئلة المقابلة وتقييم المرشحين","متابعة الأداء والأهداف (OKR) وتكلفة دوران الموظفين"],
  cats=["hr"],extra=["/tools/receipt-payment-voucher/","/tools/payroll-calculator-saudi/","/tools/end-of-service-calculator-saudi/","/accounting/guides/payroll-vouchers-from-excel-pdf/","/accounting/guides/payroll-and-end-of-service-accounting-saudi/","/tools/age-calculator/","/tools/hijri-gregorian-converter/","/cv/"],
  faq=[("ما أفضل أداة مجانية لإصدار سند راتب لكل موظف؟","أداة السندات في DIAMOND HUB: ترفع كشف الرواتب بصيغة Excel أو CSV أو PDF فتنشئ سندًا مفصلًا لكل موظف بالراتب الأساسي والبدلات والخصومات وتطبعها دفعة واحدة."),("كيف أحسب مكافأة نهاية الخدمة في السعودية؟","استخدم حاسبة نهاية الخدمة وفق نظام العمل السعودي؛ أدخل الراتب ومدة الخدمة وسبب إنهاء العقد فتظهر المكافأة المستحقة."),("هل أحتاج لتسجيل حساب؟","لا، كل الأدوات تعمل مباشرة داخل المتصفح ولا تُرسل بيانات الموظفين إلى أي خادم.")]),
 dict(slug="sales",name="المبيعات وخدمة العملاء",kw="مندوب مبيعات، مدير مبيعات، مسؤول حسابات عملاء",
  title="أدوات مندوب ومدير المبيعات: عروض أسعار وفواتير وتحصيل",
  desc="أدوات مجانية للمبيعات: عروض أسعار وفواتير بالعربية والإنجليزية، سندات قبض واستلام دفعات وشيكات، تقارير تحصيل الذمم، تسعير وخصومات وتحليل أداء المبيعات.",
  intro="يحتاج مندوب المبيعات ومديره إلى عرض سعر سريع، وفاتورة صحيحة، وسند استلام للدفعة، ومتابعة للتحصيل وتحليل للأداء. هذه الصفحة تجمع الأدوات المناسبة لكل خطوة في رحلة البيع.",
  duties=["إعداد عروض الأسعار والفواتير للعملاء","استلام الدفعات والعربون والشيكات وإصدار سندات القبض","متابعة أعمار الذمم وتحصيل المتأخرات","تسعير المنتجات والخصومات وتحليل المبيعات والعملاء"],
  cats=["sales"],extra=["/tools/quotation-maker/","/tools/receipt-payment-voucher/","/tools/receivables-aging-report/","/tools/zatca-invoice-qr/","/tools/vat-calculator/","/tools/percentage-calculator/","/tools/whatsapp-link-generator/","/tools/break-even-calculator/"],
  faq=[("كيف أعد عرض سعر احترافي بالعربية والإنجليزية؟","استخدم أداة عروض الأسعار: أدخل البنود والكميات والأسعار فيُحسب المجموع والضريبة، وتختار اللغة عربي أو إنجليزي أو الاثنين وتطبع أو تحفظ PDF."),("كيف أستلم دفعة من عميل وأثبتها؟","أصدر سند قبض أو سند عربون أو سند استلام شيك من أداة السندات بترويسة شركتك وختمك."),("كيف أتابع العملاء المتأخرين في السداد؟","تقرير أعمار الذمم المدينة يصنّف الفواتير حسب مدة التأخر ويحسب مخصص الخسائر المتوقعة.")]),
 dict(slug="warehouse",name="أمين المخزن واللوجستيات",kw="أمين مخزن، مشرف مستودع، مسؤول لوجستيات",
  title="أدوات أمين المخزن والمستودعات: جرد وملصقات وشحن",
  desc="أدوات مجانية لأمين المخزن: بطاقات جرد الرفوف، ملصقات الأسعار والشحن، إثبات التسليم، تحليل ABC للمخزون، نقطة إعادة الطلب وسندات الاستلام والصرف.",
  intro="يقيس نجاح المستودع بدقة الجرد وسرعة الاستلام والصرف وسلامة التسليم. تساعدك هذه الأدوات على طباعة بطاقات الجرد والملصقات وتوثيق الاستلام والتسليم وتحليل المخزون.",
  duties=["جرد المخزون وطباعة بطاقات الرفوف","طباعة ملصقات الأسعار والباركود وملصقات الشحن","توثيق استلام وتسليم البضائع بسند وإثبات تسليم","تحليل المخزون (ABC) وتحديد نقطة إعادة الطلب"],
  cats=[],extra=["/tools/shelf-count-cards/","/tools/shelf-print-assets/","/tools/price-label-maker/","/tools/shipping-label-maker/","/tools/delivery-proof/","/tools/receipt-payment-voucher/","/tools/qr-code-generator/","/tools/unit-converter/","/accounting/guides/inventory-costing-fifo-weighted-average-example/"],
  match=r'المخزون|الجرد|إعادة الطلب|الرفوف|ABC|تقادم|مستودع',
  faq=[("كيف أطبع بطاقات جرد للرفوف؟","أداة بطاقات جرد الرفوف تنشئ بطاقات جاهزة للطباعة بالأصناف والكميات وخانات العد."),("كيف أوثق استلام وتسليم البضاعة؟","أصدر سند استلام أو تسليم وإثبات تسليم بتوقيع المستلم وباركود QR من الأدوات المرتبطة."),("ما تحليل ABC للمخزون؟","يصنّف الأصناف حسب قيمتها إلى A وB وC لتركيز الجرد والرقابة على الأصناف الأعلى قيمة.")]),
 dict(slug="accountant",name="المحاسبة والمالية",kw="محاسب، أمين صندوق، مراجع حسابات، مدير مالي",
  title="أدوات المحاسب وأمين الصندوق: سندات وقيود وضريبة وزكاة",
  desc="أدوات مجانية للمحاسب وأمين الصندوق: سندات قبض وصرف، ميزان مراجعة، قيود يومية، ضريبة القيمة المضافة والزكاة، إهلاك الأصول، أعمار الذمم ومعايير IFRS.",
  intro="يتعامل المحاسب وأمين الصندوق مع السندات والقيود والتسويات والضرائب والتقارير. تجمع هذه الصفحة الأدوات والأدلة المرجعية التي تختصر العمل اليومي وإقفال الشهر.",
  duties=["إصدار سندات القبض والصرف وقيود اليومية","إعداد ميزان المراجعة والتسويات البنكية","حساب ضريبة القيمة المضافة والزكاة والاستقطاع","إقفال الشهر وإعداد القوائم المالية وتحليلها"],
  cats=["finance"],extra=["/tools/receipt-payment-voucher/","/tools/general-ledger-trial-balance/","/tools/journal-entries-guide/","/tools/vat-calculator/","/tools/zakat-calculator/","/tools/withholding-tax-calculator-saudi/","/tools/depreciation-calculator/","/tools/receivables-aging-report/","/tools/financial-ratios-analyzer/","/tools/zatca-invoice-qr/","/tools/pdf-to-excel/","/accounting/","/accounting/guides/voucher-receipt-payment-guide/","/accounting/guides/month-end-close-checklist/","/accounting/guides/bank-reconciliation-step-by-step/"],
  faq=[("ما أفضل برنامج مجاني لسندات القبض والصرف؟","أداة السندات في DIAMOND HUB بتفقيط تلقائي وقوالب وشعار وختم وطباعة PDF، وتعمل بلا تسجيل."),("أين أجد أدلة المحاسبة ومعايير IFRS بالعربية؟","في مرجع المحاسب بالموقع: معايير IAS وIFRS مختصرة وأدلة عملية للإقفال والتسوية والقيود."),("كيف أحوّل PDF إلى Excel للمحاسبة؟","أداة PDF إلى Excel تستخرج الجداول من الملفات النصية وتصدّرها لتكمل عليها التحليل.")]),
]
def pick(j):
    seen=set();out=[]
    def add(t):
        if t and t[0] not in seen: seen.add(t[0]); out.append(t)
    for u in j["extra"]:
        if u in ("/accounting/","/cv/"): 
            x=SI.get(u); add((u,re.split(r'[:|—]',x["t"])[0].strip() if x else u,x["d"] if x else ""))
        else: add(tool(u))
    for c in j["cats"]:
        for u,t,d in cards(c): 
            if u not in seen: seen.add(u); out.append((u,t,d))
    if j.get("match"):
        for u,x in SI.items():
            if u.startswith(("/business/tools/","/ecommerce/tools/")) and re.search(j["match"],x["t"]) and u not in seen: add(tool(u))
    return out[:36]
def build(j):
    tl=pick(j); url="%s/jobs/%s/"%(B,j["slug"])
    h=HEAD
    for pat,val in [(r'<title>.*?</title>','<title>'+esc(j["title"])+' | DIAMOND HUB</title>'),(r'<meta name="description" content="[^"]*">','<meta name="description" content="'+esc(j["desc"])+'">'),(r'<link rel="canonical" href="[^"]*">','<link rel="canonical" href="'+url+'">'),(r'<meta property="og:title" content="[^"]*">','<meta property="og:title" content="'+esc(j["title"])+'">'),(r'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="'+esc(j["desc"])+'">'),(r'<meta property="og:url" content="[^"]*">','<meta property="og:url" content="'+url+'">'),(r'<meta name="twitter:title" content="[^"]*">','<meta name="twitter:title" content="'+esc(j["title"])+'">'),(r'<meta name="twitter:description" content="[^"]*">','<meta name="twitter:description" content="'+esc(j["desc"])+'">'),(r'<meta property="og:type" content="article">','<meta property="og:type" content="website">')]:
        h=re.sub(pat,lambda m:val,h,count=1,flags=re.S)
    ld=lambda o:'<script type="application/ld+json">'+json.dumps(o,ensure_ascii=False)+'</script>'
    js=ld({"@context":"https://schema.org","@type":"CollectionPage","name":j["title"],"description":j["desc"],"url":url,"inLanguage":"ar","keywords":j["kw"],"isPartOf":{"@type":"WebSite","name":"DIAMOND HUB","url":B},"mainEntity":{"@type":"ItemList","numberOfItems":len(tl),"itemListElement":[{"@type":"ListItem","position":i+1,"name":t,"url":B+u} for i,(u,t,d) in enumerate(tl)]}})
    js+=ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in j["faq"]]})
    js+=ld({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"الرئيسية","item":B+"/"},{"@type":"ListItem","position":2,"name":"أدوات حسب الوظيفة","item":B+"/jobs/"},{"@type":"ListItem","position":3,"name":j["name"],"item":url}]})
    h=re.sub(r'<script type="application/ld\+json">.*</script></head>',lambda m:js+'</head>',h,count=1,flags=re.S)
    b='<header class="phero"><div class="wrap narrow center"><div class="crumbs"><a href="/">الرئيسية</a> › <a href="/jobs/">أدوات حسب الوظيفة</a></div><h1>'+j["title"]+'</h1><p class="lead">'+j["desc"]+'</p></div></header><main><section class="s"><div class="wrap">'
    b+='<article class="prose" style="max-width:820px;margin:0 auto 22px"><p>'+j["intro"]+'</p><h2>مهام %s التي تغطيها الأدوات</h2><ul>'%j["name"]+''.join('<li>%s</li>'%d for d in j["duties"])+'</ul><p><b>مناسب لـ:</b> '+j["kw"]+'.</p></article>'
    b+='<h2 class="h2">الأدوات والأدلة (%d)</h2><div class="grid g3" style="margin-top:12px">'%len(tl)+''.join('<a class="card" href="%s"><h3 style="font-size:1rem">%s</h3><p>%s</p></a>'%(u,esc(t),esc(d[:140])) for u,t,d in tl)+'</div>'
    b+='<article class="prose" style="max-width:820px;margin:26px auto 0"><h2>أسئلة شائعة</h2>'+''.join('<details><summary><b>%s</b></summary><p>%s</p></details>'%(q,a) for q,a in j["faq"])+'<p>أدوات وظائف أخرى: '+' · '.join('<a href="/jobs/%s/">%s</a>'%(k["slug"],k["name"]) for k in JOBS if k["slug"]!=j["slug"])+'</p></article></div></section></main>'
    os.makedirs(ROOT+"/jobs/"+j["slug"],exist_ok=True); open(ROOT+"/jobs/%s/index.html"%j["slug"],"w",encoding="utf-8").write(h+b+TAIL.replace('</article></div></section></main>','',1) if False else h+b+TAIL[TAIL.index('<footer'):])
    return len(tl)
def index():
    t="أدوات مجانية حسب الوظيفة: محاسب، موارد بشرية، مبيعات، أمين مخزن";dsc="اختر وظيفتك لتجد الأدوات المجانية المناسبة: المحاسب وأمين الصندوق، الموارد البشرية والرواتب، مندوب ومدير المبيعات، أمين المخزن والمستودعات."
    url=B+"/jobs/"; h=HEAD
    for pat,val in [(r'<title>.*?</title>','<title>'+esc(t)+' | DIAMOND HUB</title>'),(r'<meta name="description" content="[^"]*">','<meta name="description" content="'+esc(dsc)+'">'),(r'<link rel="canonical" href="[^"]*">','<link rel="canonical" href="'+url+'">'),(r'<meta property="og:title" content="[^"]*">','<meta property="og:title" content="'+esc(t)+'">'),(r'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="'+esc(dsc)+'">'),(r'<meta property="og:url" content="[^"]*">','<meta property="og:url" content="'+url+'">'),(r'<meta name="twitter:title" content="[^"]*">','<meta name="twitter:title" content="'+esc(t)+'">'),(r'<meta name="twitter:description" content="[^"]*">','<meta name="twitter:description" content="'+esc(dsc)+'">')]:
        h=re.sub(pat,lambda m:val,h,count=1,flags=re.S)
    js='<script type="application/ld+json">'+json.dumps({"@context":"https://schema.org","@graph":[{"@type":"CollectionPage","name":t,"description":dsc,"url":url,"inLanguage":"ar"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"الرئيسية","item":B+"/"},{"@type":"ListItem","position":2,"name":"أدوات حسب الوظيفة","item":url}]}]},ensure_ascii=False)+'</script>'
    h=re.sub(r'<script type="application/ld\+json">.*</script></head>',lambda m:js+'</head>',h,count=1,flags=re.S)
    b='<header class="phero"><div class="wrap narrow center"><div class="crumbs"><a href="/">الرئيسية</a></div><h1>'+t+'</h1><p class="lead">'+dsc+'</p></div></header><main><section class="s"><div class="wrap"><div class="grid g3">'+''.join('<a class="card" href="/jobs/%s/"><h3>%s</h3><p>%s</p></a>'%(j["slug"],j["name"],j["desc"]) for j in JOBS)+'</div></div></section></main>'
    os.makedirs(ROOT+"/jobs",exist_ok=True); open(ROOT+"/jobs/index.html","w",encoding="utf-8").write(h+b+TAIL[TAIL.index('<footer'):])
def lists():
    p=ROOT+"/sitemap.xml"; sm=open(p,encoding="utf-8").read()
    for u in ["/jobs/"]+["/jobs/%s/"%j["slug"] for j in JOBS]:
        if "<loc>%s%s</loc>"%(B,u) not in sm: sm=sm.replace("</urlset>",'  <url><loc>%s%s</loc><lastmod>%s</lastmod></url>\n</urlset>'%(B,u,D))
    open(p,"w",encoding="utf-8").write(sm)
    p=ROOT+"/search-index.json"; d=json.load(open(p,encoding="utf-8")); have={x["u"] for x in d}
    for j in JOBS:
        u="/jobs/%s/"%j["slug"]
        if u not in have: d.append({"t":j["title"],"u":u,"d":j["desc"]})
    json.dump(d,open(p,"w",encoding="utf-8"),ensure_ascii=False,separators=(",",":"))
    p=ROOT+"/llms.txt"; s=open(p,encoding="utf-8").read()
    if "/jobs/" not in s: s=s.rstrip("\n")+"\n- أدوات حسب الوظيفة: "+" · ".join("[%s](%s/jobs/%s/)"%(j["name"],B,j["slug"]) for j in JOBS)+"\n"; open(p,"w",encoding="utf-8").write(s)
    p=ROOT+"/robots.txt"
if __name__=="__main__":
    for j in JOBS: print(j["slug"],build(j))
    index(); lists()
