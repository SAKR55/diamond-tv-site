# -*- coding: utf-8 -*-
import sys, os
_d=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,_d); sys.path.insert(0,_d+'/lib')
from portal_common import *
CSS='<link rel="stylesheet" href="/assets/studio.css">'
CR='<a href="/">الرئيسية</a> › <a href="/studio/">استوديو التصميم</a>'
FEATS=[("🎨","محرر تصميم احترافي","اسحب وغيّر الحجم وأدر العناصر، طبقات، محاذاة، وخطوط إرشاد ذكية مثل كانفا."),
("🧩","1000+ قالب جاهز","منشورات وستوري وصور مصغرة ليوتيوب وبطاقات أعمال وعروض تخفيضات، تتكيف مع أي مقاس."),
("🔤","38 خطًا عربيًا ولاتينيًا","كايرو وتجوّل والمراعي والأميري ولالزار وغيرها، مع نص بإطار ونيون وخلفية."),
("◼","26 شكلًا و60+ أيقونة","أشكال متجهية وأيقونات تتلوّن، مع 250+ إيموجي ورمز."),
("🌈","خلفيات وتدرجات وأنماط","24 تدرجًا و14 نمطًا مولَّدًا بالألوان التي تختارها أو صورة خلفية."),
("🖼️","فلاتر وقص الصور","ارفع صورك، قصّها بأشكال (دائرة، قلب، سداسي…) وطبّق فلاتر وسطوعًا وتباينًا."),
("⬇️","تصدير بجودة عالية","PNG وJPG وWebP وPDF بدقة ×2، وحفظ المشروع وفتحه لاحقًا."),
("📄","صفحات متعددة وPDF وZIP","اصنع عروضًا متعددة الصفحات، وصدّر PDF أو ZIP، أو كل المقاسات دفعة واحدة بضغطة."),
("✂️","إزالة الخلفية وأدوات متقدمة","إزالة خلفية الصور، مزج الألوان، نص منحنٍ، تجميع، محاذاة وتوزيع، شبكة ومغناطيس."),
("🏷","هوية العلامة والمشاريع","احفظ ألوانك وخطوطك وشعارك، ومشاريعك بصورها المصغّرة، وولّد تصميمًا من نص فورًا."),
("📊","مخططات وعناصر تسويقية","مخططات أعمدة ودائري وخطي، وشارات خصم وأزرار وكوبونات وعدّاد تنازلي جاهزة."),
("🖼","أدوات الصور","ضغط وتحويل وتغيير حجم دفعي، علامة مائية، صور إلى PDF، كولاج، أيقونات فافيكون وقص دائري."),
("🎬","استوديو الفيديو","حوّل تصاميمك وصورك إلى فيديو بانتقالات وحركة وموسيقى وتنزيله مباشرة.")]
FAQ=[("هل الاستوديو مجاني؟","نعم، مجاني بالكامل ويعمل في متصفحك دون تسجيل، وصورك لا تغادر جهازك."),
("هل يدعم الخطوط العربية؟","نعم، أكثر من 20 خطًا عربيًا احترافيًا من Google Fonts، مع دعم الكتابة من اليمين لليسار."),
("كيف أحفظ تصميمي؟","يُحفظ تلقائيًا في المتصفح، ويمكنك تصدير المشروع كملف JSON وفتحه لاحقًا، أو تصدير صورة أو PDF."),
("ما مقاسات الشبكات الاجتماعية المتاحة؟","إنستغرام (منشور، بورتريه، ستوري)، يوتيوب، فيسبوك، X، لينكدإن، واتساب، بوستر A4، بطاقة أعمال، شعار، وغيرها، مع مقاس مخصص."),
("كيف أصنع فيديو من تصاميمي؟","في المحرر اضغط «إلى الفيديو» ليُضاف التصميم كمشهد، ثم افتح استوديو الفيديو لترتيب المشاهد وإضافة الانتقالات والموسيقى وتنزيل الفيديو.")]
APPJS='<script>(function(){function h(){var n=document.querySelector(".pnav,#dh-sb");document.documentElement.style.setProperty("--nh",(n?n.offsetHeight:66)+"px")}h();addEventListener("resize",h);addEventListener("load",h);var b=document.createElement("button");b.className="st-aboutb";b.type="button";b.textContent="ℹ️ عن الأداة";b.onclick=function(){var a=document.getElementById("about");a.hidden=!a.hidden};document.body.appendChild(b)})()</script>'
def about(inner): return '<div id="about" class="st-about" hidden><button type="button" class="st-aclose" onclick="this.parentNode.hidden=true">✕</button><div class="wrap narrow">'+inner+'</div></div>'+APPJS
def hub():
    cards=''.join(f'<div class="card"><div style="font-size:30px">{i}</div><h3>{e(t)}</h3><p>{e(d)}</p></div>' for i,t,d in FEATS)
    body=hero('استوديو التصميم والفيديو','صمّم منشورات وستوري وشعارات وصورًا مصغرة وفيديوهات احترافية بقوالب وخطوط عربية وأدوات مثل كانفا — مجانًا من المتصفح.',CR,'🎨 جديد',dark=True,
      extra='<p style="margin-top:18px"><a class="btn btn-g" href="/studio/design/">ابدأ التصميم الآن</a> &nbsp; <a class="btn btn-o" href="/studio/video/">استوديو الفيديو</a> &nbsp; <a class="btn btn-o" href="/studio/photos/">أدوات الصور</a></p>')
    body+=f'<main class="wrap"><section class="sec"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">{cards}</div></section><section class="sec"><h2>أسئلة شائعة</h2>{faq_html(FAQ)}</section></main>'
    write('studio/index.html',page('/studio/','استوديو التصميم والفيديو المجاني — بديل كانفا بالعربي | DIAMOND HUB','محرر تصميم وفيديو عربي مجاني: قوالب منشورات وستوري وشعارات، خطوط عربية، أشكال وأيقونات وخلفيات، فلاتر صور، تصدير PNG وPDF وفيديو.',body,extra_ld=breadcrumb([("الرئيسية","/"),("استوديو التصميم","/studio/")])+faq_ld(FAQ),active='/studio/',css_extra=''))
def design():
    body=f'<div id="studio" aria-label="محرر التصميم"></div><noscript>يتطلب المحرر تفعيل JavaScript.</noscript>'
    body+=about('<main class="wrap narrow"><section class="sec"><h1 style="font-size:1.4rem">محرر التصميم المجاني</h1><p>صمّم منشورات إنستغرام وستوري وصور يوتيوب المصغرة وبطاقات الأعمال والشعارات بقوالب جاهزة وخطوط عربية، ثم نزّلها PNG أو JPG أو PDF. كل شيء يعمل في متصفحك وملفاتك لا تُرفع لأي خادم.</p>'+faq_html(FAQ[:4])+'</section></main>')
    write('studio/design/index.html',page('/studio/design/','محرر تصميم مجاني أونلاين بالعربي — قوالب وخطوط وأيقونات | DIAMOND HUB','صمّم بوستات وستوري وشعارات وصور مصغرة بمحرر عربي مجاني: 1000+ قالب، 38 خطًا، أشكال وأيقونات وفلاتر، وتصدير PNG وPDF.',body,extra_ld=breadcrumb([("الرئيسية","/"),("استوديو التصميم","/studio/"),("المحرر","/studio/design/")]),active='/studio/',css_extra=CSS+'<script src="/assets/studio-data.js"></script><script src="/assets/studio-tpl.js"></script><script src="/assets/studio.js" defer></script><script src="/assets/studio-pro.js" defer></script><script src="/assets/qr.js"></script><script src="/assets/studio-more.js" defer></script>'))
def video():
    body='<div id="vstudio" aria-label="استوديو الفيديو"></div>'
    body+=about('<main class="wrap narrow"><section class="sec"><h1 style="font-size:1.4rem">استوديو الفيديو المجاني</h1><p>اجمع صورك وتصاميمك في فيديو بانتقالات وحركة كاميرا ونصوص متحركة وموسيقى، ونزّله بصيغة WebM أو MP4 (حسب متصفحك) دون رفع أي ملف لخادم.</p>'+faq_html(FAQ[4:])+'</section></main>')
    write('studio/video/index.html',page('/studio/video/','صانع فيديو مجاني من الصور أونلاين — انتقالات وموسيقى ونصوص | DIAMOND HUB','حوّل صورك وتصاميمك إلى فيديو احترافي بانتقالات وحركة وموسيقى ونصوص متحركة وتنزيل مباشر، مجانًا وبالعربي.',body,extra_ld=breadcrumb([("الرئيسية","/"),("استوديو التصميم","/studio/"),("الفيديو","/studio/video/")]),active='/studio/',css_extra=CSS+'<script src="/assets/studio-data.js"></script><script src="/assets/studio-tpl.js"></script><script src="/assets/studio-video.js" defer></script>'))
def photos():
    body='<div id="pstudio" aria-label="أدوات الصور"></div><noscript>تتطلب الأدوات تفعيل JavaScript.</noscript>'
    body+=about('<main class="wrap narrow"><section class="sec"><h1 style="font-size:1.4rem">أدوات الصور المجانية — ضغط وتحويل وعلامة مائية وPDF</h1><p>اضغط الصور وحوّلها بين JPG وPNG وWebP، غيّر الحجم دفعة واحدة، أضف علامة مائية، حوّل الصور إلى PDF، اصنع كولاج، ولّد أيقونات الفافيكون والتطبيقات، واقصّ الصور بأشكال، واستخرج ألوانها. كل شيء يعمل داخل متصفحك دون رفع صورك لأي خادم.</p></section></main>')
    write('studio/photos/index.html',page('/studio/photos/','أدوات الصور المجانية أونلاين — ضغط وتحويل وعلامة مائية | DIAMOND HUB','ضغط الصور وتحويلها JPG PNG WebP، تغيير الحجم دفعة واحدة، علامة مائية، صور إلى PDF، كولاج، أيقونات فافيكون، قص دائري — مجانًا وبخصوصية كاملة.',body,extra_ld=breadcrumb([("الرئيسية","/"),("استوديو التصميم","/studio/"),("أدوات الصور","/studio/photos/")]),active='/studio/',css_extra=CSS+'<script src="/assets/studio-photos.js" defer></script>'))
hub();design();video();photos();print('studio built')
