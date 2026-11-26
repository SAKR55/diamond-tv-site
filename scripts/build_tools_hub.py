# -*- coding: utf-8 -*-
"""مركز الأدوات /tools/: دليل موحّد منظّم لكل أدوات الموقع. تشغيل: python3 scripts/build_tools_hub.py"""
import os, sys, re, io, contextlib, glob, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from portal_common import *
with contextlib.redirect_stdout(io.StringIO()):
    import build_business as BB
T, CATS = BB.T, BB.CATS
HERE = os.path.dirname(os.path.abspath(__file__))
NEW = set()
for f in ('biz_tools14.py', 'biz_tools15.py', 'biz_tools16.py'):
    NEW |= set(re.findall(r"^add\('([a-z0-9-]+)'", open(os.path.join(HERE, f), encoding='utf-8').read(), re.M))

EXTRA = [
 ('creative', '🎨', 'التصميم والصور والفيديو', 'محررات تعمل في المتصفح دون رفع ملفاتك.', [
  ('/studio/design/', '🎨', 'محرر التصميم', 'قوالب وخطوط عربية ودفعات وباركود وكاروسيل بانورامي.'),
  ('/studio/video/', '🎬', 'صانع الفيديو', 'اجمع الصور والتصاميم في فيديو بانتقالات وموسيقى.'),
  ('/studio/photos/', '🖼️', 'أدوات الصور', 'ضغط وتحويل وتغيير حجم وعلامة مائية وكولاج وPDF.')]),
 ('ai', '🤖', 'الذكاء الاصطناعي والبرومت', 'أدوات تجهيز الطلبات واستخدام Claude وChatGPT باحتراف.', [
  ('/claude/prompt-builder/', '🧩', 'باني برومت Claude', 'متطلبات وبرومت وخطة واختبارات في أداة واحدة.'),
  ('/prompt-studio/', '✍️', 'مختبر ChatGPT', 'تجهيز الطلبات والدورة التطبيقية.'),
  ('/tools/ai-skill-quiz/', '🎯', 'اختبار مستواك في الذكاء الاصطناعي', '10 أسئلة وبطاقة نتيجة تشاركها.')]),
 ('career', '📄', 'السيرة الذاتية والتوظيف', 'من بناء السيرة إلى التحضير للمقابلة.', [
  ('/cv/builder/', '📄', 'منشئ السيرة الذاتية', '440 قالبًا مع تصدير PDF.'),
  ('/cv/ats-checker/', '✅', 'فاحص ATS', 'درجة سيرتك ومطابقتها لكلمات الوظيفة.'),
  ('/cv/bullet-improver/', '⚡', 'محسّن نقاط السيرة', 'حوّل المهام إلى إنجازات قابلة للقياس.'),
  ('/cv/cover-letter/', '✉️', 'خطاب التقديم', 'مولّد خطاب بالعربية.'),
  ('/cv/interview-prep/', '🎤', 'التحضير للمقابلة', 'أسئلة وقالب STAR وتدريب.'),
  ('/cv/keywords/', '🔑', 'كلمات مفتاحية للسيرة', '14 مجالًا وظيفيًا.'),
  ('/cv/linkedin-summary/', '💼', 'نبذة لينكدإن', 'عنوان ونبذة جاهزان.')]),
 ('shop', '🛒', 'أدوات المتجر السريعة', 'حاسبات وقوائم لمن يبدأ متجرًا إلكترونيًا.', [
  ('/ecommerce/tools/margin-calculator/', '📈', 'حاسبة هامش الربح', 'السعر والتكلفة والعمولات.'),
  ('/ecommerce/tools/roas-breakeven/', '🎯', 'ROAS التعادلي', 'أقل عائد إعلاني تحتاجه.'),
  ('/ecommerce/tools/product-description/', '📝', 'وصف المنتج', 'مولّد وصف جذاب.'),
  ('/ecommerce/tools/product-idea-score/', '💡', 'تقييم فكرة منتج', 'درجة جدوى سريعة.'),
  ('/ecommerce/tools/supplier-compare/', '⚖️', 'مقارنة الموردين', 'السعر والجودة والشحن.'),
  ('/ecommerce/tools/supplier-message/', '💬', 'رسالة للمورد', 'قوالب تفاوض ومراسلة.'),
  ('/ecommerce/tools/launch-checklist/', '🚀', 'قائمة إطلاق المتجر', 'تحقق قبل الإطلاق.'),
  ('/tools/whatsapp-link-generator/', '🟢', 'رابط واتساب ورمز QR', 'رابط مباشر مع رسالة جاهزة ورمز QR وكود زر لموقعك.')]),
]
def card(url, ic, title, desc, key, new=False, ai=False):
    badge = ('<span class="tbadge">جديد</span>' if new else '') + ('<span class="badge-ai">AI</span>' if ai else '')
    return (f'<div class="tc" data-k="{key}" data-t="{e(title+" "+desc)}"{" data-new=1" if new else ""}>'
            f'<button type="button" class="fav" aria-label="أضف للمفضلة" title="مفضلة">☆</button>'
            f'<a class="card" href="{url}"><div class="ic">{ic}</div><h3>{e(title)}{badge}</h3><p>{e(desc)}</p><span class="more">افتح الأداة ←</span></a></div>')
groups = []
for c, (ic, nm, ds) in CATS.items():
    cards = [card(f'/business/tools/{t["slug"]}/', t['icon'], t['title'], t['desc'], t['slug'], t['slug'] in NEW, bool(t['ai'])) for t in T if t['cat'] == c]
    groups.append((c, ic, nm, ds, cards))
for g, ic, nm, ds, items in EXTRA:
    groups.append((g, ic, nm, ds, [card(u, i, t, d, u) for u, i, t, d in items]))
total = sum(len(g[4]) for g in groups)
newc = sum(1 for g in groups for c in g[4] if 'data-new' in c)
chips = '<button type="button" class="chip on" data-f="all">الكل <i>%d</i></button><button type="button" class="chip" data-f="fav">⭐ المفضلة <i id="favn">0</i></button><button type="button" class="chip" data-f="new">🆕 جديد <i>%d</i></button>' % (total, newc)
chips += ''.join(f'<button type="button" class="chip" data-f="{g[0]}">{g[1]} {g[2]} <i>{len(g[4])}</i></button>' for g in groups)
sections = ''.join(f'<section class="tsec" data-g="{g[0]}" id="{g[0]}"><div class="thead"><h2>{g[1]} {g[2]}</h2><p>{g[3]}</p></div><div class="grid g3">{"".join(g[4])}</div></section>' for g in groups)
CSS = '''<style>
.thub-hero{padding:28px 0 8px;text-align:center}.thub-hero h1{font-size:clamp(1.6rem,4vw,2.3rem);margin:6px 0}.thub-hero p{color:#6b6490;margin:0 auto;max-width:640px}
.tbar{position:sticky;top:var(--nh,66px);z-index:20;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-bottom:1px solid #ece8fb;padding:12px 0;margin-top:14px}
.tbar input{width:100%;padding:13px 18px;border:2px solid #e4def9;border-radius:14px;font:inherit;font-size:1rem}.tbar input:focus{outline:none;border-color:#7c3aed;box-shadow:0 0 0 4px #7c3aed22}
.chips{display:flex;gap:8px;overflow-x:auto;padding:10px 2px 2px;scrollbar-width:thin}.chip{flex:none;border:1.5px solid #e4def9;background:#fff;border-radius:999px;padding:7px 14px;font:inherit;font-size:.88rem;font-weight:700;color:#3b2d73;cursor:pointer;white-space:nowrap}
.chip i{font-style:normal;background:#f1edff;border-radius:999px;padding:1px 8px;margin-inline-start:4px;font-size:.78rem;color:#5b21b6}.chip.on{background:linear-gradient(135deg,#7c3aed,#db2777);border-color:transparent;color:#fff}.chip.on i{background:#ffffff33;color:#fff}
.tsec{padding:26px 0 6px}.thead h2{margin:0;font-size:1.35rem}.thead p{margin:4px 0 14px;color:#6b6490}
.tc{position:relative}.tc .card{height:100%}.fav{position:absolute;top:10px;inset-inline-end:10px;z-index:2;border:0;background:#f5f3ff;border-radius:50%;width:32px;height:32px;font-size:17px;cursor:pointer;color:#a78bfa}.fav.on{color:#f59e0b;background:#fef3c7}
.tbadge{background:#10b981;color:#fff;border-radius:6px;font-size:.68rem;padding:2px 7px;margin-inline-start:6px;vertical-align:middle}
.tempty{text-align:center;padding:40px 0;color:#6b6490;display:none}
@media(max-width:600px){.tbar{padding:8px 0}.thub-hero{padding-top:16px}}
</style>'''
JS = '''<script>(function(){var K='dh-favs',F=[];try{F=JSON.parse(localStorage.getItem(K)||'[]')}catch(e){}
var q=document.getElementById('tq'),cards=[].slice.call(document.querySelectorAll('.tc')),secs=[].slice.call(document.querySelectorAll('.tsec[data-g]')),cur='all',em=document.getElementById('tempty');
function sv(){try{localStorage.setItem(K,JSON.stringify(F))}catch(e){}document.getElementById('favn').textContent=F.length}
cards.forEach(function(c){var b=c.querySelector('.fav'),k=c.dataset.k;if(F.indexOf(k)>=0){b.classList.add('on');b.textContent='★'}b.onclick=function(ev){ev.preventDefault();var i=F.indexOf(k);if(i>=0){F.splice(i,1);b.classList.remove('on');b.textContent='☆'}else{F.push(k);b.classList.add('on');b.textContent='★'}sv();apply()}});
function apply(){var w=q.value.trim().toLowerCase(),n=0;cards.forEach(function(c){var g=c.closest('.tsec').dataset.g,ok=(!w||c.dataset.t.toLowerCase().indexOf(w)>=0)&&(cur==='all'||(cur==='fav'?F.indexOf(c.dataset.k)>=0:cur==='new'?c.hasAttribute('data-new'):g===cur));c.style.display=ok?'':'none';if(ok)n++});
 secs.forEach(function(s){s.style.display=[].some.call(s.querySelectorAll('.tc'),function(c){return c.style.display!=='none'})?'':'none'});em.style.display=n?'none':'block'}
q.oninput=apply;[].forEach.call(document.querySelectorAll('.chip'),function(b){b.onclick=function(){cur=b.dataset.f;[].forEach.call(document.querySelectorAll('.chip'),function(x){x.classList.toggle('on',x===b)});apply();if(window.scrollY>260)document.querySelector('.tbar').scrollIntoView({behavior:'smooth'})}});
(function(){var R=[];try{R=JSON.parse(localStorage.getItem('dh-recent')||'[]')}catch(e){}if(!R.length)return;var g=document.getElementById('recentg');R.slice(0,6).forEach(function(r){var a=document.createElement('a');a.className='card';a.href='/business/tools/'+r.s+'/';a.innerHTML='<div class="ic"></div><h3></h3><span class="more">افتح ←</span>';a.querySelector('.ic').textContent=r.i;a.querySelector('h3').textContent=r.t;g.appendChild(a)});document.getElementById('recent').style.display=''})();
sv();var h=location.hash.slice(1);if(h&&document.querySelector('.chip[data-f="'+h+'"]'))document.querySelector('.chip[data-f="'+h+'"]').click();
document.addEventListener('keydown',function(ev){if(ev.key==='/'&&document.activeElement!==q){ev.preventDefault();q.focus()}})})();</script>'''
body = (f'<header class="thub-hero"><div class="wrap narrow"><div class="crumbs"><a href="/">الرئيسية</a> › الأدوات</div><h1>🛠️ كل <span class="g-text">الأدوات</span> في مكان واحد</h1>'
        f'<p>{total} أداة مجانية تعمل في متصفحك، مرتّبة بالفئات. ابحث، رشّح، وأضف المفضلة لتعود إليها بسرعة. اضغط «/» للبحث.</p></div></header>'
        f'<div class="tbar"><div class="wrap"><input id="tq" type="search" placeholder="ابحث في {total} أداة: ضريبة، سيرة، تصميم، شحن…" aria-label="بحث في الأدوات"><div class="chips">{chips}</div></div></div>'
        f'<main class="wrap"><section class="tsec" id="recent" style="display:none"><div class="thead"><h2>🕘 آخر ما استخدمت</h2><p>أدوات فتحتها مؤخرًا على هذا الجهاز.</p></div><div class="grid g3" id="recentg"></div></section>{sections}<div class="tempty" id="tempty">لا توجد أدوات مطابقة. جرّب كلمة أخرى أو اختر «الكل».</div></main>' + JS)
t = f'كل الأدوات المجانية ({total}) — أعمال وتصميم وسيرة ذاتية وذكاء اصطناعي | DIAMOND HUB'
d = f'دليل منظّم لـ {total} أداة مجانية بالعربية: حاسبات مالية وتسويق وتجارة إلكترونية واستيراد وموارد بشرية، محرر تصميم وفيديو، سيرة ذاتية، وأدوات الذكاء الاصطناعي.'
items = [(u, ti) for g in EXTRA for u, ic, ti, de in g[4]][:0]
write('tools/index.html', page('/tools/', t, d, body, breadcrumb([("الرئيسية", "/"), ("الأدوات", "/tools/")]), active='/tools/', css_extra=CSS))
print('tools hub:', total, 'tools,', newc, 'new')
