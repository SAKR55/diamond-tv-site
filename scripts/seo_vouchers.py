# -*- coding: utf-8 -*-
"""SEO pass for the voucher tool + two guides (idempotent)."""
import re, os, json, html
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));B="https://diamond-tv.shop";D="2026-11-28"
def esc(s): return html.escape(s,quote=True)
def ld(o): return '<script type="application/ld+json">'+json.dumps(o,ensure_ascii=False)+'</script>'

TITLE="سند قبض وسند صرف وسند راتب جاهز للطباعة PDF مجانًا | DIAMOND HUB"
DESC="أنشئ سند قبض أو صرف أو راتب أو سلفة أو إيجار مجانًا: تفقيط المبلغ تلقائيًا، شعار وختم وباركود QR، جدول تفصيل الراتب، وسندات رواتب لكل موظف دفعة واحدة من Excel أو PDF."
KW="سند قبض, سند صرف, سند راتب, سند سلفة, سند عهدة, سند مصروفات نثرية, سند استلام شيك, سند قبض إيجار, سند عربون, نموذج سند قبض, نموذج سند صرف, سند قبض جاهز للطباعة, سند صرف PDF, سندات رواتب, كشف رواتب, مسير رواتب, برنامج سندات مجاني, تفقيط المبلغ, محاسب, أمين صندوق, موارد بشرية"
FAQ=[
("ما الفرق بين سند القبض وسند الصرف؟","سند القبض مستند يثبت استلام مبلغ من عميل أو جهة، وسند الصرف مستند يثبت دفع مبلغ لمورد أو موظف أو جهة. كلاهما يحمل رقمًا وتاريخًا والمبلغ رقمًا وكتابة وطريقة الدفع والبيان وتوقيعات المستلم والمحاسب والمدير."),
("هل أستطيع إنشاء سند قبض أو سند صرف مجانًا وطباعته PDF؟","نعم. الأداة مجانية وتعمل داخل المتصفح بلا تسجيل. بعد تعبئة البيانات اضغط طباعة واختر «حفظ بصيغة PDF» أو اطبع مباشرة على A4 أو A5 أو إيصال حراري 80 مم."),
("هل يُكتب المبلغ بالحروف تلقائيًا؟","نعم، يُفقَّط المبلغ بالعربية تلقائيًا مع اسم العملة (ريال سعودي، درهم، دينار، دولار وغيرها) ويظهر معه تفقيط إنجليزي عند اختيار السند ثنائي اللغة."),
("كيف أنشئ سند راتب لكل موظف من ملف Excel أو PDF؟","افتح قسم «إنشاء سندات دفعة واحدة» وارفع كشف الرواتب بصيغة Excel أو CSV أو PDF. تتعرف الأداة على أعمدة الاسم والرقم الوظيفي والوظيفة والقسم والفرع وصافي الراتب، وتنشئ سندًا مفصلًا لكل موظف فيه الراتب الأساسي والبدلات والخصومات."),
("هل تقرأ الأداة كشوف الرواتب المصدّرة من Excel إلى PDF؟","نعم، تقرأ جدول الـPDF النصي بأعمدته وصفوفه وتعرض معاينة كاملة للأعمدة المستخرجة لتراجعها قبل الإنشاء. الملفات الممسوحة ضوئيًا كصور تحتاج أولًا تحويلها إلى نص."),
("هل يمكن إضافة بدلات وخصومات يدوية مثل التأمينات أو بدل الطعام؟","نعم. أضف بنودًا يدوية بمبلغ ثابت أو كنسبة من الراتب الأساسي (مثل تأمينات اجتماعية 9.75%) فتُضاف لكل السندات ويُحسب الصافي تلقائيًا."),
("هل أضيف شعار الشركة والختم والتوقيعات والفرع؟","نعم. ارفع الشعار وصورة الختم واختر مكانه في خانة الختم، وأضف اسم الفرع وعنوانه ورقم السجل التجاري والرقم الضريبي. تُحفظ الترويسة في متصفحك فقط."),
("كم سندًا أطبع في الصفحة الواحدة؟","اختر سندًا واحدًا يملأ صفحة A4 كاملة أو سندين أو ثلاثة في الصفحة. يظهر في كل سند باركود QR واسم الموقع والشعار."),
("ما أنواع السندات المتاحة؟","سند قبض، سند صرف، سند راتب، سلفة وعهدة، مصروفات نثرية، رد مبلغ، عربون ودفعة مقدمة، قبض إيجار، استلام شيك، تأمين مسترد، إيداع بنكي، تحويل بنكي، وسند قيد يومية."),
("هل بياناتي آمنة؟","كل المعالجة داخل متصفحك. لا يُرفع كشف الرواتب ولا بيانات السندات إلى أي خادم، وتبقى الترويسة المحفوظة على جهازك فقط."),
]
TYPES=["سند قبض","سند صرف","سند راتب","سند سلفة / عهدة","سند مصروفات نثرية","سند رد مبلغ","سند عربون / دفعة مقدمة","سند قبض إيجار","سند استلام شيك","سند تأمين مسترد","سند إيداع بنكي","سند تحويل بنكي","سند قيد يومية"]
WHO=[("المحاسب","إصدار سندات القبض والصرف وقيود اليومية وتوثيق كل حركة نقدية."),("أمين الصندوق","إثبات المقبوضات والمدفوعات النقدية والمصروفات النثرية والعهد يوميًا."),("مسؤول الموارد البشرية والرواتب","إنشاء سند راتب لكل موظف من مسير الرواتب مع تفصيل البدلات والخصومات."),("مدير المبيعات والمندوب","سند استلام دفعة أو عربون أو شيك من العميل."),("مدير المشروع والمشتريات","سندات صرف للموردين والمقاولين ودفعات المشاريع."),("المؤجر وإدارة العقارات","سند قبض إيجار وتأمين مسترد للمستأجر."),("أصحاب المشاريع الصغيرة والمتاجر","سندات رسمية بشعارك وختمك بدل الدفاتر الورقية.")]

def tool_section():
    h='<section class="seo" data-seo="2" style="max-width:900px;margin:28px auto 0;padding:0 14px;line-height:1.9">'
    h+='<h2>برنامج سندات القبض والصرف والرواتب أونلاين مجانًا</h2><p>سند القبض يثبت استلام مبلغ، وسند الصرف يثبت دفعه، وسند الراتب يثبت صرف الأجر مع تفصيل بنوده. تتيح لك هذه الأداة إصدار سند احترافي بهوية شركتك خلال دقيقة: تفقيط تلقائي للمبلغ، ترويسة وشعار وختم، باركود QR، جدول تفصيل (أساسي، بدلات، خصومات، ضريبة)، وطباعة جاهزة على A4 أو A5 أو إيصال حراري 80 مم أو حفظ PDF. وللمنشآت التي تصرف رواتب شهرية ترفع كشف الرواتب فتخرج لك سندات لكل موظف دفعة واحدة.</p>'
    h+='<h2>أنواع السندات المتاحة</h2><ul>'+''.join('<li>'+t+'</li>' for t in TYPES)+'</ul>'
    h+='<h2>لمن هذه الأداة؟ (وظائف وأعمال تحتاج السندات يوميًا)</h2><ul>'+''.join('<li><b>%s:</b> %s</li>'%w for w in WHO)+'</ul>'
    h+='<h2>مميزات الأداة</h2><ul><li>تفقيط المبلغ بالعربية والإنجليزية بعدة عملات.</li><li>قوالب احترافية وألوان وترويسة وشعار وختم قابل للنقل.</li><li>جدول تفصيل احترافي بقوالب جاهزة، وبنود بالعربية مع ترجمة إنجليزية تحتها.</li><li>رقم متسلسل تلقائي لكل نوع سند، وفروع محفوظة.</li><li>سندات رواتب دفعة واحدة من Excel أو CSV أو PDF مع معاينة الأعمدة.</li><li>طباعة سند واحد يملأ الصفحة أو 2 و3 في الصفحة، وفي كل سند QR واسم الموقع والشعار.</li><li>تعمل داخل المتصفح بلا تسجيل ولا رفع بيانات.</li></ul>'
    h+='<h2>كيف تستخدمها؟</h2><ol><li>اختر نوع السند والقالب وعملة المبلغ.</li><li>أدخل اسم الطرف والمبلغ والبيان وطريقة الدفع، وأضف الترويسة والشعار والختم.</li><li>أضف بنود التفصيل إن لزم، ثم اطبع أو احفظ PDF.</li><li>للرواتب: ارفع كشف الرواتب، راجع الأعمدة المستخرجة، واضغط «إنشاء السندات».</li></ol>'
    h+='<h2>أسئلة شائعة</h2>'+''.join('<details><summary><b>%s</b></summary><p>%s</p></details>'%(q,a) for q,a in FAQ)
    h+='<h2>أدلة وأدوات ذات صلة</h2><p class="lk" style="display:flex;flex-wrap:wrap;gap:8px">'
    for u,t in [("/accounting/guides/voucher-receipt-payment-guide/","دليل سند القبض وسند الصرف: الفرق والبيانات ونموذج"),("/accounting/guides/payroll-vouchers-from-excel-pdf/","سندات رواتب لكل موظف من Excel أو PDF"),("/accounting/guides/petty-cash-imprest-system-guide/","دليل العهدة والمصروفات النثرية"),("/tools/payroll-calculator-saudi/","حاسبة الرواتب في السعودية"),("/tools/number-to-words-arabic/","تفقيط الأرقام بالعربية"),("/tools/zatca-invoice-qr/","باركود الفاتورة الضريبية ZATCA"),("/tools/quotation-maker/","عروض الأسعار والفواتير"),("/tools/receivables-aging-report/","تقرير أعمار الذمم")]:
        h+='<a style="background:#f5f3ff;color:#5b21b6;border-radius:999px;padding:6px 14px;text-decoration:none;font-weight:700" href="%s">%s</a>'%(u,t)
    h+='</p><p style="font-size:.85rem;color:#64748b">تعمل الأداة داخل متصفحك ولا تُرسل بياناتك. الأرقام والنسب إرشادية؛ تحقق من الأنظمة السارية.</p></section>'
    return h

def patch_tool():
    p=ROOT+"/tools/receipt-payment-voucher/index.html"; s=open(p,encoding='utf-8').read()
    s=re.sub(r'<title>.*?</title>','<title>'+esc(TITLE)+'</title>',s,count=1,flags=re.S)
    s=re.sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="'+esc(DESC)+'">',s,count=1)
    if '<meta name="keywords"' in s: s=re.sub(r'<meta name="keywords" content="[^"]*">','<meta name="keywords" content="'+esc(KW)+'">',s,count=1)
    else: s=s.replace('<meta name="robots"','<meta name="keywords" content="'+esc(KW)+'"><meta name="robots"',1)
    s=re.sub(r'<meta property="og:title" content="[^"]*">','<meta property="og:title" content="'+esc(TITLE)+'">',s,count=1)
    s=re.sub(r'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="'+esc(DESC)+'">',s,count=1)
    s=re.sub(r'<meta name="twitter:title" content="[^"]*">','<meta name="twitter:title" content="'+esc(TITLE)+'">',s,count=1)
    url=B+"/tools/receipt-payment-voucher/"
    g={"@context":"https://schema.org","@graph":[
     {"@type":"WebApplication","name":"سندات القبض والصرف والرواتب","alternateName":["برنامج سند قبض","برنامج سند صرف","مولّد سندات رواتب"],"url":url,"description":DESC,"applicationCategory":"BusinessApplication","applicationSubCategory":"Accounting","operatingSystem":"Any","browserRequirements":"Requires JavaScript","inLanguage":["ar","en"],"isAccessibleForFree":True,"keywords":KW,
      "audience":{"@type":"Audience","audienceType":"محاسبون، أمناء صندوق، موارد بشرية، أصحاب مشاريع"},
      "featureList":["تفقيط المبلغ تلقائيًا","13 نوع سند","ترويسة وشعار وختم وباركود QR","جدول تفصيل الراتب","سندات رواتب دفعة واحدة من Excel وCSV وPDF","طباعة A4 وA5 وحراري 80 مم وPDF","ثنائي اللغة عربي وإنجليزي"],
      "offers":{"@type":"Offer","price":"0","priceCurrency":"SAR"},"publisher":{"@type":"Organization","name":"DIAMOND HUB","url":B}},
     {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"الرئيسية","item":B+"/"},{"@type":"ListItem","position":2,"name":"الأدوات","item":B+"/tools/"},{"@type":"ListItem","position":3,"name":"سندات القبض والصرف والرواتب","item":url}]},
     {"@type":"HowTo","name":"كيفية إنشاء سند قبض أو صرف أو راتب وطباعته","totalTime":"PT2M","step":[{"@type":"HowToStep","name":"اختر نوع السند","text":"حدد سند قبض أو صرف أو راتب أو سلفة والقالب والعملة."},{"@type":"HowToStep","name":"أدخل البيانات","text":"اكتب اسم الطرف والمبلغ والبيان وطريقة الدفع وأضف الشعار والختم."},{"@type":"HowToStep","name":"أضف التفصيل","text":"أضف بنود الراتب أو الضريبة إن لزم."},{"@type":"HowToStep","name":"اطبع أو احفظ PDF","text":"اضغط طباعة واختر الطابعة أو حفظ بصيغة PDF."}]},
     {"@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in FAQ]}]}
    s=re.sub(r'<script type="application/ld\+json">.*?</script>',lambda m:ld(g),s,count=1,flags=re.S)
    s=re.sub(r'<section class="seo" data-seo="\d"[^>]*>.*?</section>',lambda m:tool_section(),s,count=1,flags=re.S)
    open(p,"w",encoding="utf-8").write(s)

# ---------- guides ----------
TPL=open(ROOT+"/accounting/guides/month-end-close-checklist/index.html",encoding="utf-8").read()
HEAD_END=TPL.index('<header class="phero">'); HEAD=TPL[:HEAD_END]; TAIL=TPL[TPL.index('</article>'):]
HEAD_STYLE=re.search(r'<meta property="og:type".*?<script type="application/ld\+json">',HEAD,re.S)
def page(slug,title,desc,lead,body,faq):
    url=B+"/accounting/guides/"+slug+"/"
    h=HEAD
    h=re.sub(r'<title>.*?</title>','<title>'+esc(title)+' | DIAMOND HUB</title>',h,count=1,flags=re.S)
    h=re.sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="'+esc(desc)+'">',h,count=1)
    h=re.sub(r'<link rel="canonical" href="[^"]*">','<link rel="canonical" href="'+url+'">',h,count=1)
    h=re.sub(r'<meta property="og:title" content="[^"]*">','<meta property="og:title" content="'+esc(title)+' | DIAMOND HUB">',h,count=1)
    h=re.sub(r'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="'+esc(desc)+'">',h,count=1)
    h=re.sub(r'<meta property="og:url" content="[^"]*">','<meta property="og:url" content="'+url+'">',h,count=1)
    h=re.sub(r'<meta name="twitter:title" content="[^"]*">','<meta name="twitter:title" content="'+esc(title)+'">',h,count=1)
    h=re.sub(r'<meta name="twitter:description" content="[^"]*">','<meta name="twitter:description" content="'+esc(desc)+'">',h,count=1)
    j=ld({"@context":"https://schema.org","@type":"Article","headline":title,"description":desc,"inLanguage":"ar","datePublished":D,"dateModified":D,"mainEntityOfPage":url,"author":{"@type":"Organization","name":"DIAMOND HUB"},"publisher":{"@type":"Organization","name":"DIAMOND HUB","url":B}})
    j+=ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faq]})
    j+=ld({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"الرئيسية","item":B+"/"},{"@type":"ListItem","position":2,"name":"مرجع المحاسب","item":B+"/accounting/"},{"@type":"ListItem","position":3,"name":title,"item":url}]})
    h=re.sub(r'<script type="application/ld\+json">.*</script></head>',lambda m:j+'</head>',h,count=1,flags=re.S)
    hero='<header class="phero"><div class="wrap narrow center"><div class="crumbs"><a href="/">الرئيسية</a> › <a href="/accounting/">مرجع المحاسب</a> › أدلة</div><h1>'+title+'</h1><p class="lead">'+lead+'</p></div></header><main><section class="s"><div class="wrap narrow"><article class="prose">'
    fq='<h2>أسئلة شائعة</h2>'+''.join('<details><summary><b>%s</b></summary><p>%s</p></details>'%(q,a) for q,a in faq)
    os.makedirs(ROOT+"/accounting/guides/"+slug,exist_ok=True)
    open(ROOT+"/accounting/guides/"+slug+"/index.html","w",encoding="utf-8").write(h+hero+body+fq+TAIL)

G1_FAQ=[("هل سند القبض مستند رسمي؟","هو مستند داخلي يثبت الاستلام، ويكتسب قوته بالتوقيع والختم وتسلسل الأرقام وحفظ النسخ. لا يغني عن الفاتورة الضريبية عند بيع سلعة أو خدمة خاضعة لضريبة القيمة المضافة."),
("ما الحد الأدنى لبيانات سند القبض؟","رقم متسلسل، تاريخ، اسم الدافع، المبلغ بالأرقام والحروف، طريقة الدفع، البيان (سبب القبض)، واسم وتوقيع المستلم، مع ختم المنشأة."),
("هل أكتب المبلغ بالحروف دائمًا؟","نعم، كتابة المبلغ بالحروف تمنع التلاعب بالأرقام وهي ممارسة معتادة في السندات والشيكات."),
("كم نسخة أحتفظ بها من السند؟","تُصدر عادة نسختان: الأولى لمن استلم المستند أو دفع المبلغ، والثانية تُحفظ في ملفات المحاسبة بتسلسل الأرقام.")]
G1=("voucher-receipt-payment-guide","سند القبض وسند الصرف: الفرق والبيانات المطلوبة ونموذج جاهز","تعرّف على الفرق بين سند القبض وسند الصرف، والبيانات الإلزامية لكل منهما، وأخطاء شائعة، ونموذج جاهز للطباعة بالعربية والإنجليزية.",
"ما الفرق بين سند القبض وسند الصرف، وما الذي يجب أن يحتويه كل منهما، وكيف تنشئه جاهزًا للطباعة خلال دقيقة.")
G1_BODY='''<p>كل منشأة، صغيرة كانت أو كبيرة، تحتاج إلى مستندات تثبت الأموال الداخلة والخارجة. هذه المستندات هي <b>سند القبض</b> و<b>سند الصرف</b>، وهي أساس الصندوق والبنك في دفاتر المحاسب وأداة أمين الصندوق اليومية. يشرح هذا الدليل الفرق بينهما والبيانات المطلوبة وكيف تتجنب الأخطاء.</p>
<h2>الفرق بين سند القبض وسند الصرف</h2><div class="tw"><table><thead><tr><th>البند</th><th>سند القبض</th><th>سند الصرف</th></tr></thead><tbody><tr><td>الغرض</td><td>إثبات استلام مبلغ</td><td>إثبات دفع مبلغ</td></tr><tr><td>الطرف المذكور</td><td>الدافع (عميل، مستأجر، شريك)</td><td>المستفيد (مورد، موظف، مقاول)</td></tr><tr><td>أثره المحاسبي</td><td>مدين صندوق أو بنك، دائن حساب العميل أو الإيراد</td><td>مدين حساب المورد أو المصروف، دائن صندوق أو بنك</td></tr><tr><td>التوقيع الأساسي</td><td>المستلم (أمين الصندوق)</td><td>المستلم للمبلغ ثم المحاسب والمدير</td></tr></tbody></table></div>
<h2>البيانات التي يجب أن يحتويها السند</h2><ul><li>رقم متسلسل لا يتكرر، وتاريخ الإصدار.</li><li>اسم الطرف (الدافع أو المستفيد) ورقم هويته أو سجله عند الحاجة.</li><li>المبلغ بالأرقام وبالحروف مع اسم العملة.</li><li>طريقة الدفع: نقدًا، شيك (رقمه وبنكه)، أو تحويل بنكي (مرجع العملية).</li><li>البيان: سبب القبض أو الصرف بوضوح، مع رقم الفاتورة أو العقد المرتبط.</li><li>الفرع أو مركز التكلفة إن وُجد.</li><li>التوقيعات: المستلم، المحاسب، المدير، وختم المنشأة.</li></ul>
<h2>أنواع السندات المرتبطة</h2><p>إلى جانب القبض والصرف توجد سندات تخدم حالات متكررة: سند سلفة أو عهدة للموظف، سند مصروفات نثرية، سند عربون أو دفعة مقدمة، سند قبض إيجار، سند استلام شيك، سند تأمين مسترد، وسند رد مبلغ. تغطي أداة DIAMOND HUB كل هذه الأنواع بقالب واحد.</p>
<h2>أخطاء شائعة تجنّبها</h2><ol><li>إصدار سند بلا رقم متسلسل أو بتكرار الأرقام.</li><li>كتابة المبلغ بالأرقام فقط دون الحروف.</li><li>بيان غامض مثل «دفعة» دون ذكر السبب أو رقم الفاتورة.</li><li>عدم حفظ نسخة للمحاسبة.</li><li>الاعتماد على سند قبض بدل فاتورة ضريبية عند وجود ضريبة قيمة مضافة.</li></ol>
<h2>أنشئ سندك الآن</h2><p>استخدم <a href="/tools/receipt-payment-voucher/"><b>أداة سندات القبض والصرف المجانية</b></a>: تفقيط تلقائي للمبلغ، ترويسة وشعار وختم، باركود QR، طباعة A4 وA5 وحراري، وحفظ PDF. ولسندات الرواتب لكل موظف اقرأ <a href="/accounting/guides/payroll-vouchers-from-excel-pdf/">دليل سندات الرواتب من Excel أو PDF</a>.</p>
<h2>من يحتاج هذا الدليل؟</h2><p>المحاسب وأمين الصندوق ومسؤول الموارد البشرية والمشتريات ومدير المبيعات وأصحاب المشاريع الصغيرة وإدارات العقارات؛ أي وظيفة تتعامل مع الأموال النقدية والتحويلات تحتاج مستندًا يثبتها.</p>'''
G2_FAQ=[("هل تقبل الأداة ملف Excel وCSV وPDF؟","نعم، ترفع أيًّا منها أو تلصق الجدول من Excel. ملفات PDF يجب أن تكون نصية (مصدّرة من Excel أو برنامج الرواتب) لا صورة ممسوحة."),
("ماذا لو لم تُطابق الأعمدة تلقائيًا؟","تعرض الأداة معاينة كاملة للأعمدة، ويمكنك تغيير عمود الاسم أو المبلغ أو أي حقل يدويًا قبل الإنشاء."),
("هل أستطيع إضافة بدلات وخصومات غير موجودة في الملف؟","نعم، أضف بنودًا يدوية بمبلغ ثابت أو كنسبة من الأساسي، مثل بدل طعام أو تأمينات 9.75%."),
("هل بيانات الموظفين تُرفع إلى الإنترنت؟","لا. كل شيء يعمل داخل المتصفح ولا يُرسل الملف إلى أي خادم.")]
G2=("payroll-vouchers-from-excel-pdf","سندات رواتب لكل موظف من ملف Excel أو PDF خطوة بخطوة","حوّل كشف الرواتب من Excel أو CSV أو PDF إلى سند مفصل لكل موظف بالراتب الأساسي والبدلات والخصومات والفرع، وطباعتها دفعة واحدة مجانًا.",
"من كشف رواتب واحد إلى سند مفصل لكل موظف: الأعمدة تُقرأ تلقائيًا، والبدلات والخصومات تظهر في جدول، وتطبع الجميع دفعة واحدة.")
G2_BODY='''<p>إصدار سند راتب لكل موظف يدويًا يستهلك ساعات كل شهر. تقرأ أداة DIAMOND HUB كشف الرواتب وتنشئ سندًا مفصلًا لكل موظف تلقائيًا، فيحصل الموظف على مستند فيه رقمه الوظيفي ووظيفته وقسمه وفرعه وبنود راتبه.</p>
<h2>خطوات إنشاء سندات الرواتب</h2><ol><li>افتح <a href="/tools/receipt-payment-voucher/">أداة السندات</a> واختر قسم إنشاء السندات دفعة واحدة.</li><li>ارفع كشف الرواتب بصيغة Excel أو CSV أو PDF، أو الصق الجدول من Excel.</li><li>راجع معاينة الأعمدة: الأخضر للحقول (الاسم، الرقم الوظيفي، الوظيفة، القسم، الفرع، الصافي) والأصفر لبنود الراتب.</li><li>عدّل أي ربط خاطئ، وأضف بنودًا يدوية مثل بدل الطعام أو التأمينات.</li><li>اختر نوع السند (سند راتب أو صرف) وعدد السندات في الصفحة، واضغط إنشاء ثم طباعة أو حفظ PDF.</li></ol>
<h2>ماذا يظهر في سند الموظف؟</h2><ul><li>اسم الموظف والمبلغ بالأرقام والحروف (تفقيط تلقائي).</li><li>جدول تفصيل: الراتب الأساسي والبدلات في خانة الاستحقاقات، والسلف والتأمينات والخصومات في خانة الاستقطاعات، وصافي الراتب المستحق.</li><li>الرقم الوظيفي والقسم والفرع والوظيفة والشهر.</li><li>ترويسة الشركة وشعارها وختمها وباركود QR واسم الموقع.</li></ul>
<h2>الصيغ المدعومة</h2><div class="tw"><table><thead><tr><th>الصيغة</th><th>ملاحظات</th></tr></thead><tbody><tr><td>Excel (.xlsx)</td><td>اختيار الورقة المناسبة عند تعدد الأوراق</td></tr><tr><td>CSV / لصق من Excel</td><td>يُكتشف الفاصل تلقائيًا ويقبل الأرقام العربية</td></tr><tr><td>PDF نصي</td><td>جدول مصدّر من Excel أو نظام الرواتب؛ تُستخرج الأعمدة والصفوف ويُتجاهل صف الإجماليات</td></tr></tbody></table></div>
<h2>نصائح لنتيجة أدق</h2><ul><li>يفضَّل أن يكون الصف الأول عناوين واضحة مثل «اسم الموظف» و«صافي الراتب».</li><li>لا تدمج الخلايا في الجدول الأصلي.</li><li>راجع الأسماء بعد الاستخراج من PDF، فبعض الملفات تُفقد حروفها عند التصدير.</li><li>احتفظ بالسندات للتدقيق وربطها بمسير الرواتب. للحساب الدقيق للتأمينات ونهاية الخدمة استخدم <a href="/tools/payroll-calculator-saudi/">حاسبة الرواتب</a> و<a href="/tools/end-of-service-calculator-saudi/">حاسبة مكافأة نهاية الخدمة</a>.</li></ul>
<p>للتعرف على بيانات السند ونموذجه اقرأ <a href="/accounting/guides/voucher-receipt-payment-guide/">دليل سند القبض وسند الصرف</a>.</p>'''

def update_lists():
    add=[(G1[0],G1[1],G1[2]),(G2[0],G2[1],G2[2])]
    # sitemap
    p=ROOT+"/sitemap.xml"; sm=open(p,encoding="utf-8").read()
    for slug,_,_ in add:
        u="/accounting/guides/%s/"%slug
        if "<loc>%s%s</loc>"%(B,u) not in sm: sm=sm.replace("</urlset>",'  <url><loc>%s%s</loc><lastmod>%s</lastmod></url>\n</urlset>'%(B,u,D))
    sm=re.sub(r"(<loc>%s/tools/receipt-payment-voucher/</loc>\s*<lastmod>)[^<]*"%re.escape(B),r"\g<1>"+D,sm)
    open(p,"w",encoding="utf-8").write(sm)
    # search index
    p=ROOT+"/search-index.json"; d=json.load(open(p,encoding="utf-8"))
    have={x["u"] for x in d}
    for slug,t,ds in add:
        u="/accounting/guides/%s/"%slug
        if u not in have: d.append({"t":t,"u":u,"d":ds})
    for x in d:
        if x["u"]=="/tools/receipt-payment-voucher/": x["t"]="سندات قبض وصرف ورواتب: قوالب احترافية وسندات دفعة واحدة"; x["d"]=DESC
    json.dump(d,open(p,"w",encoding="utf-8"),ensure_ascii=False,separators=(",",":"))
    # accounting index cards
    p=ROOT+"/accounting/index.html"; s=open(p,encoding="utf-8").read()
    for slug,t,ds in add:
        if "/accounting/guides/%s/"%slug not in s:
            s=s.replace('<h2 class="h2" style="margin-top:34px">📘 أدلة عملية</h2><div class="grid g3" style="margin-top:12px">','<h2 class="h2" style="margin-top:34px">📘 أدلة عملية</h2><div class="grid g3" style="margin-top:12px"><a class="card" href="/accounting/guides/%s/"><h3>%s</h3><p>%s</p></a>'%(slug,t,ds),1)
    open(p,"w",encoding="utf-8").write(s)
    # llms.txt
    p=ROOT+"/llms.txt"; s=open(p,encoding="utf-8").read()
    if "voucher-receipt-payment-guide" not in s:
        s=s.rstrip("\n")+"\n- [دليل سند القبض وسند الصرف](%s/accounting/guides/voucher-receipt-payment-guide/) · [سندات رواتب من Excel أو PDF](%s/accounting/guides/payroll-vouchers-from-excel-pdf/)\n"%(B,B)
        open(p,"w",encoding="utf-8").write(s)

if __name__=="__main__":
    patch_tool()
    page(G1[0],G1[1],G1[2],G1[3],G1_BODY,G1_FAQ)
    page(G2[0],G2[1],G2[2],G2[3],G2_BODY,G2_FAQ)
    update_lists(); print("ok")
