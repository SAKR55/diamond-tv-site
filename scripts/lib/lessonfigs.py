# -*- coding: utf-8 -*-
"""رسوم SVG توضيحية لدروس المستوى 9."""
import html, math
E=html.escape
C=['#7c3aed','#06b6d4','#f59e0b','#10b981','#ec4899','#3b82f6']
def wrap(inner,h,title):
    return ('<svg viewBox="0 0 720 %d" role="img" aria-label="%s" xmlns="http://www.w3.org/2000/svg" style="width:100%%;height:auto;max-width:720px;font-family:inherit;direction:ltr">'
      '<rect width="720" height="%d" rx="14" fill="#0f172a"/>%s</svg>')%(h,E(title),h,inner)
def t(x,y,s,sz=15,fill='#fff',w='700',a='middle'):
    return '<text x="%s" y="%s" font-size="%s" fill="%s" font-weight="%s" text-anchor="%s">%s</text>'%(x,y,sz,fill,w,a,E(s))
def box(x,y,w,h,col,title,sub=None):
    s='<rect x="%s" y="%s" width="%s" height="%s" rx="12" fill="%s" opacity=".92"/>'%(x,y,w,h,col)
    if sub: s+=t(x+w/2,y+h/2-4,title,14)+t(x+w/2,y+h/2+16,sub,11,'#f1f5f9','400')
    else: s+=t(x+w/2,y+h/2+5,title,14)
    return s
def hub(center,items,title):
    cx,cy=360,200;s='';n=len(items)
    pos=[]
    for i,it in enumerate(items):
        a=-math.pi/2+i*2*math.pi/n;x=cx+250*math.cos(a);y=cy+142*math.sin(a);pos.append((x,y))
        s+='<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="#475569" stroke-width="2"/>'%(cx,cy,x,y)
    s+='<circle cx="%s" cy="%s" r="52" fill="#7c3aed"/>'%(cx,cy)+t(cx,cy+6,center,18)
    for i,(x,y) in enumerate(pos):
        s+=box(x-64,y-24,128,48,C[i%6],items[i][0],items[i][1] if len(items[i])>1 else None)
    return wrap(s,400,title)
def flow(steps,title):
    s='';per=4 if len(steps)>4 else len(steps);rows=(len(steps)+per-1)//per
    W=150;G=(720-per*W)/(per+1)
    for i,st in enumerate(steps):
        r,c=divmod(i,per);x=720-G-W-c*(W+G);y=30+r*105
        s+=box(x,y,W,70,C[i%6],st[0],st[1] if len(st)>1 else None)
        s+=t(x+14,y+16,str(i+1),12,'#fde68a')
        if c<per-1 and i<len(steps)-1: s+='<path d="M%s %s l-%s 0" stroke="#94a3b8" stroke-width="3" marker-end="url(#ar)"/>'%(x,y+35,G-4)
    s='<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="#94a3b8"/></marker></defs>'+s
    return wrap(s,40+rows*105,title)
def ladder(levels,title):
    n=len(levels);s='';h=60+n*62
    for i,(a,b) in enumerate(levels):
        w=260+i*(420/max(1,n-1)) if n>1 else 500;y=20+i*62
        s+='<rect x="%s" y="%s" width="%s" height="50" rx="10" fill="%s"/>'%(700-w,y,w,C[i%6])+t(700-14,y+22,a,15,'#fff','700','end')+t(700-14,y+41,b,11,'#f1f5f9','400','end')
    return wrap(s,h,title)
def cols(columns,title):
    n=len(columns);W=(700-(n-1)*12)/n;s='';mx=max(len(c[1]) for c in columns)
    for i,(h,rows) in enumerate(columns):
        x=710-(i+1)*W-i*12
        s+='<rect x="%s" y="16" width="%s" height="%d" rx="12" fill="#1e293b" stroke="%s" stroke-width="2"/>'%(x,W,56+mx*30,C[i%6])
        s+='<rect x="%s" y="16" width="%s" height="40" rx="12" fill="%s"/>'%(x,W,C[i%6])+t(x+W/2,42,h,14)
        for j,r in enumerate(rows): s+=t(x+W/2,84+j*30,r,12,'#e2e8f0','400')
    return wrap(s,56+mx*30+40,title)

FIGS={
'claude-apps-map':hub('Claude',[('التطبيق الأساسي','ويب · سطح مكتب · جوال'),('Claude Code','برمجة'),('Chrome','المواقع'),('أوفيس / Workspace','ملفاتك'),('Slack · Claude Tag','الفريق'),('API · Console','بناء منتجك')],'خريطة منتجات Claude'),
'claude-web-desktop-mobile':flow([('محادثة',''),('ملفات وصور','رفع'),('بحث وويب','مصادر'),('مخرجات','صفحات ومستندات'),('Project','سياق ثابت'),('ذاكرة','بين المحادثات')],'مكونات التطبيق الأساسي'),
'claude-models-tiers':ladder([('Haiku','أسرع وأخف — مهام كبيرة بسيطة'),('Sonnet','التوازن اليومي'),('Opus','عمق ومهام طويلة'),('Fable / Mythos','أعلى فئة — وصول مقيّد حسب النموذج')],'سلّم النماذج'),
'claude-code-complete':flow([('اقرأ المشروع','CLAUDE.md'),('خطة','دون تنفيذ'),('تنفيذ صغير','خطوة خطوة'),('اختبارات','تشغيل وتحقق'),('مراجعة','قبل الدمج'),('طلب دمج','بإذنك')],'دورة عمل Claude Code'),
'claude-in-chrome-browser':flow([('طلبك','مهمة محددة'),('Claude يتصفح','قراءة ونقر'),('محتوى الصفحة','بيانات لا أوامر'),('توقف للتأكيد','شراء · إرسال · حذف'),('أنت تقرر','موافقة صريحة')],'تدفق الأمان في المتصفح'),
'claude-office-addins':cols([('Excel',['معادلات','نماذج','تنظيف بيانات']),('PowerPoint',['من مذكرة لعرض','تحسين شرائح','ملاحظات']),('Word',['صياغة','تحرير','تنسيق محفوظ']),('Outlook',['تلخيص سلاسل','مسودات ردود','مراجعتك أولًا'])],'إضافات أوفيس'),
'claude-slack-tag-teams':flow([('تذكره بـ @','في القناة'),('يقرأ السياق','ضمن أذوناته'),('ينفّذ','تلخيص · بحث · صياغة'),('الفريق يراجع','نفس الشاشة')],'Claude Tag داخل الفريق'),
'claude-api-console':flow([('Console','مفتاح وحدود'),('طلبك','Messages'),('النموذج','+ رسالة نظام'),('أدوات','Tool use'),('ردّ','Streaming'),('مراقبة','تكلفة واستخدام')],'مسار طلب API'),
'claude-connectors-skills-plugins':cols([('موصل (MCP)',['وصول لتطبيق','بريد · ملفات','قراءة وكتابة']),('مهارة (Skill)',['طريقة عمل','خطوات ثابتة','تُحمَّل عند الحاجة']),('إضافة (Plugin)',['تجمع الاثنين','لفريق أو وظيفة','قابلة للمشاركة'])],'الفرق بين الموصل والمهارة والإضافة'),
'claude-science-security-industries':cols([('Claude Science',['بحث علمي','أدبيات وبيانات','على أجهزة المختبر']),('Claude Security',['فحص الشيفرة','ثغرات','اقتراح إصلاحات']),('حزم القطاعات',['قانون · مال','مهارات + موصلات','مراجعة بشرية'])],'منتجات متخصصة'),
'claude-privacy-plans-admin':flow([('إعدادات الذاكرة','تحكم وحذف'),('وضع خفي','بلا ذاكرة'),('خطتك','مزايا وحدود'),('لوحة الإدارة','للفرق'),('مركز المساعدة','المصدر الرسمي')],'مستويات التحكم'),
'claude-choose-your-setup':flow([('أسبوع 1','أساسي + Project'),('أسبوع 2','تعليمات وقوالب'),('أسبوع 3','موصل + إضافة'),('أسبوع 4','مهارة + قياس')],'خطة 30 يومًا'),
}
