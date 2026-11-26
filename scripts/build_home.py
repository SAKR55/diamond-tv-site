# -*- coding: utf-8 -*-
"""يولّد الصفحة الرئيسية الجديدة (بوابة). تشغيل: python3 scripts/build_home.py"""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from portal_common import *
from ecom_articles2 import ARTICLES2
from ecom_content import ARTICLES as A1

SITE_FAQ = [
 ("ما هو DIAMOND HUB؟", "منصة عربية مجانية تضم أكاديمية Claude وكورس ChatGPT، مكتبة أطفال، تعلّم الإنجليزية، قسم التجارة الإلكترونية بأدواته ومقالاته، وتطبيق IPTV للمشاهدة."),
 ("هل المحتوى والأدوات مجانية؟", "نعم، الكورسات والأدوات والمقالات مجانية وتعمل في متصفحك دون تسجيل. كذلك تطبيق المشاهدة مجاني بكود تفعيل."),
 ("من أين أبدأ في تعلّم Claude؟", "ابدأ من أكاديمية Claude: كورس من درسين إلى عشرين درسًا بمستويات، ثم استخدم أداة كتابة المتطلبات والبرومت والخطة."),
 ("هل يوجد قسم للتجار؟", "نعم، قسم التجارة الإلكترونية فيه حاسبات الهامش وROAS وتكلفة الاستيراد وقوالب الموردين والعملاء ومقالات الإدارة وحل المشكلات."),
 ("أين تطبيق المشاهدة؟", "كل ما يخص تطبيق DIAMOND TV من تحميل وتفعيل وشرح وأسئلة موجود الآن في قسم التطبيق /app/."),
 ("هل بياناتي تُحفظ على خوادمكم؟", "الأدوات تعمل في متصفحك، وتقدّمك يُحفظ محليًا على جهازك فقط. لا نرسل ما تكتبه في الأدوات."),
]
SECS = [
 ("🤖","أكاديمية Claude","كورس موسّع بمستويات، وأداة تكتب المتطلبات والبرومت والخطة، ومقالات تطبيقية.","#7c3aed",[("الكورس","/claude/course/"),("أداة البرومت","/claude/prompt-builder/"),("الأكاديمية","/claude/")]),
 ("💬","مختبر ChatGPT","دروس وأدلة وأدوات لاستخدام ChatGPT في العمل والدراسة.","#0f9f6e",[("المختبر","/prompt-studio/")]),
 ("📚","مكتبة الأطفال","كتب وقصص وأنشطة للأطفال مع نصائح للقراءة.","#ec4899",[("المكتبة","/store/")]),
 ("🗣️","تعلّم الإنجليزية","خطة تعلّم وعبارات يومية وممارسة للمحادثة.","#2563eb",[("ابدأ","/mugharrid/")]),
 ("🛒","التجارة الإلكترونية","أدوات وقوالب ومقالات للاستيراد والبيع أونلاين وإدارة المتجر وحل المشكلات.","#fb923c",[("المركز","/ecommerce/"),("الأدوات","/ecommerce/tools/"),("حاسبة الاستيراد","/import/calc.html")]),
 ("🧰","أدوات الأعمال","أكثر من 150 أداة للمحاسبة والتسويق ودراسة السوق والإدارة والموارد البشرية وأدوات الموظف، وبعضها يجهّز لك برومت للذكاء الاصطناعي.","#0ea5e9",[("كل الأدوات","/business/"),("محاسبة","/business/finance/"),("تسويق","/business/marketing/"),("موارد بشرية","/business/hr/")]),
 ("🧮","مرجع المحاسب","43 معيارًا دوليًا بملخصات وقيود ونصائح، وأدوات ذكية للمطابقات والفحوص.","#0891b2",[("المرجع","/accounting/"),("مطابقة البنك","/business/tools/bank-reconciliation-matcher/")]),
 ("📄","السيرة الذاتية","200 قالب سيرة، فحص ATS، تحسين الإنجازات، خطاب تقديم وتحضير مقابلات.","#14b8a6",[("المركز","/cv/"),("ابنِ سيرتك","/cv/builder/"),("فحص ATS","/cv/ats-checker/")]),
 ("📖","كتب الذكاء الاصطناعي","8 كتب عربية مجانية عن الذكاء الاصطناعي وتطبيقاته للقراءة أو الطباعة.","#8b5cf6",[("المكتبة","/library/")]),
 ("📺","تطبيق DIAMOND TV","مشغّل IPTV عربي مجاني: تحميل وتفعيل وشرح كامل.","#7c3aed",[("التطبيق","/app/"),("تحميل","/download/")]),
]
body = '<header class="phero"><div class="wrap center"><span class="pill">💎 منصة عربية مجانية للتعلّم والأدوات</span>' \
 '<h1>تعلّم، أنشئ، وتاجر<br><span class="g-text">كل ذلك في مكان واحد</span></h1>' \
 '<p class="lead">كورسات الذكاء الاصطناعي، أدوات التجار، مكتبة الأطفال، تعلّم الإنجليزية، وتطبيق المشاهدة — مجانًا وبالعربية.</p>' \
 '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px"><a class="btn btn-g" href="/claude/course/">🚀 ابدأ كورس Claude</a><a class="btn btn-o" href="/ecommerce/">🛒 أدوات التجار</a></div>' \
 '<div class="path"><a href="/claude/prompt-builder/">✍️ أنشئ برومت احترافيًا</a><a href="/ecommerce/tools/margin-calculator/">🧮 احسب سعر البيع</a><a href="/mugharrid/">🗣️ تدرّب على الإنجليزية</a><a href="/search/">🔍 ابحث في الموقع</a></div>' \
 '<div class="stats"><div class="stat"><b>9</b><span>أقسام</span></div><div class="stat"><b>+210</b><span>مقالًا ودليلًا</span></div><div class="stat"><b>+150</b><span>أداة مجانية</span></div><div class="stat"><b>0</b><span>رسوم أو تسجيل</span></div></div></div></header><main>'
body += '<section class="s" id="sections"><div class="wrap"><div class="center"><span class="eyebrow">الأقسام</span><h2 class="h2">اختر ما يناسبك</h2></div><br><div class="grid g3">' + ''.join(
  f'<div class="card sec-card" style="--c:{c}"><div class="ic">{ic}</div><h3>{t}</h3><p>{d}</p><div class="links">' + ''.join(f'<a href="{u}">{n}</a>' for n, u in ls) + '</div></div>' for ic, t, d, c, ls in SECS) + '</div></div></section>'
body += '<section class="s alt"><div class="wrap"><div data-spark="all"></div></div></section>'
feat = [("🎯","مخطط الأرباح العكسي","/business/tools/reverse-profit-planner/"),("🧮","حاسبة الهامش وسعر البيع","/ecommerce/tools/margin-calculator/"),("🤖","مجهّز برومت المحاسب","/business/tools/finance-ai-prompts/"),("✍️","أداة كتابة البرومت والخطة","/claude/prompt-builder/"),("🧳","حاسبة نهاية الخدمة","/business/tools/end-of-service/")]
body += '<section class="s"><div class="wrap"><div class="center"><span class="eyebrow">الأكثر استخدامًا</span><h2 class="h2">أدوات تعمل فورًا</h2></div><br><div class="grid g4">' + ''.join(f'<a class="card" href="{u}"><div class="ic">{i}</div><h3>{t}</h3><span class="more">افتحها ←</span></a>' for i, t, u in feat) + '</div></div></section>'
arts = [("/articles/claude-prompt-writing-guide/","الذكاء الاصطناعي","كيف تكتب برومت ناجحًا لـClaude","قواعد عملية وقالب جاهز."),
        ("/articles/solve-low-sales-new-store/","حلول مشكلات","متجري لا يبيع: تشخيص من 7 خطوات","اعرف أين تضيع مبيعاتك."),
        ("/articles/ecommerce-pricing-margin-guide/","التسعير","كيف تحسب سعر البيع وهامش الربح","مثال بالأرقام وحاسبة."),
        ("/articles/cash-flow-small-store/","إدارة مالية","إدارة السيولة في المتجر الصغير","لماذا يخسر المربحون؟")]
body += '<section class="s alt"><div class="wrap"><div class="center"><span class="eyebrow">مقالات مختارة</span><h2 class="h2">اقرأ وتعلّم</h2></div><br><div class="grid g4">' + ''.join(f'<a class="card" href="{u}"><span class="tag">{t}</span><h3>{h}</h3><p>{p}</p></a>' for u, t, h, p in arts) + '</div><p class="center"><a class="btn btn-o" href="/articles/">كل المقالات</a></p></div></section>'
body += '<section class="s"><div class="wrap narrow"><div class="center"><h2 class="h2">أسئلة شائعة</h2></div><br>' + faq_html(SITE_FAQ) + '</div></section>'
body += '''<section class="s alt" id="contact"><div class="wrap narrow center"><span class="eyebrow">تواصل معنا</span><h2 class="h2">يسعدنا سماعك</h2><p class="lead">للاستفسار أو الاقتراح أو طلب كود التطبيق المجاني.</p><br><a class="btn btn-g" href="mailto:sales@diamond-tv.shop" data-mail-text>sales@diamond-tv.shop</a><div class="social-wrap" style="margin-top:20px"><div class="social-bar" id="socialMain"></div></div></div></section></main>'''
body += '<script>/* مصادر الروابط الاجتماعية */</script>' + open('/tmp/contact_script.html', encoding='utf-8').read()

org = {"@context": "https://schema.org", "@graph": [
 {"@type": "Organization", "name": "DIAMOND HUB", "url": BASE + "/", "email": "sales@diamond-tv.shop", "logo": BASE + "/assets/og.png", "description": "منصة عربية مجانية للتعلّم والأدوات والتجارة الإلكترونية."},
 {"@type": "WebSite", "name": "DIAMOND HUB", "url": BASE + "/", "inLanguage": "ar", "potentialAction": {"@type": "SearchAction", "target": BASE + "/search/?q={search_term_string}", "query-input": "required name=search_term_string"}}]}
title = "DIAMOND HUB | أكاديمية Claude والتجارة الإلكترونية وتعلّم الإنجليزية ومكتبة الأطفال"
desc = "منصة عربية مجانية: كورس Claude الاحترافي وأداة البرومت، أدوات التجار وحاسبة الهامش، مكتبة الأطفال، تعلّم الإنجليزية، وتطبيق DIAMOND TV."
h = page("/", title, desc, body, ld(org) + faq_ld(SITE_FAQ), "/",
         css_extra='<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"><link rel="alternate" type="application/rss+xml" title="مقالات DIAMOND HUB" href="/feed.xml"><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1133894458639371" crossorigin="anonymous"></script>')
write("index.html", h)
print("home", len(h))
