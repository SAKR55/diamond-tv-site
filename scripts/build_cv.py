# -*- coding: utf-8 -*-
import json, sys
sys.path.insert(0, '.')
from portal_common import *
from cv_data import PRESETS, KEYWORDS, VERBS, WEAK
CR = '<a href="/">الرئيسية</a> › <a href="/cv/">السيرة الذاتية</a>'
CSS = '<link rel="stylesheet" href="/assets/cv.css">'
URLS = []
PRE = r'''<script>
const $=id=>document.getElementById(id),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const AR=s=>String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').toLowerCase();
function aiBox(t,id){return '<pre class="tpl" id="'+(id||'pr')+'">'+esc(t)+'</pre><div class="aibar"><a class="btn btn-g" target="_blank" rel="noopener" href="https://claude.ai/new?q='+encodeURIComponent(t)+'">افتح في Claude ↗</a><a class="btn btn-o" target="_blank" rel="noopener" href="https://chatgpt.com/?q='+encodeURIComponent(t)+'">ChatGPT ↗</a><button class="btn btn-s" type="button" onclick="navigator.clipboard.writeText(document.getElementById(\''+(id||'pr')+'\').innerText);this.textContent=\'تم النسخ ✅\'">نسخ</button></div>'}
</script>'''

def tool_page(slug, title, desc, icon, body_html, js, faq, extra_h=""):
    path = f"/cv/{slug}/"
    b = hero(f"{icon} {e(title)}", e(desc), CR, "مجانًا · بالعربية · على جهازك")
    b += '<main><section class="s"><div class="wrap">' + body_html + '</div></section>'
    b += '<section class="s alt"><div class="wrap narrow"><h2 class="h2">أسئلة شائعة</h2>' + faq_html(faq) + '</div></section></main>' + PRE + '<script>' + js + '</script><script src="/assets/cv-import.js" defer></script>'
    ldx = breadcrumb([("الرئيسية", "/"), ("السيرة الذاتية", "/cv/"), (title, path)]) + faq_ld(faq) + ld({"@context": "https://schema.org", "@type": "WebApplication", "name": title, "url": BASE + path, "applicationCategory": "BusinessApplication", "operatingSystem": "Any", "inLanguage": "ar", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "SAR"}, "description": desc})
    write(f"cv/{slug}/index.html", page(path, f"{title} | DIAMOND HUB", desc, b, ldx, "/cv/", css_extra=CSS))
    URLS.append((path, "0.9"))

# ================= BUILDER =================
TPLS = [("classic", "كلاسيكي"), ("modern", "عصري بشريط جانبي"), ("minimal", "بسيط"), ("executive", "تنفيذي"), ("compact", "مضغوط"), ("timeline", "خط زمني"), ("bold", "عنوان بارز"), ("elegant", "أنيق"), ("left", "شريط يسار"), ("ats", "ATS نظيف"), ("sidebar", "شريط جانبي داكن كامل"), ("split", "عمودان متساويان"), ("cards", "بطاقات"), ("tech", "تقني (كود)"), ("creative", "إبداعي بشكل هندسي"), ("ribbon", "عناوين شريطية"), ("framed", "بإطار رسمي"), ("soft", "ناعم بمنحنى"), ("newspaper", "صحيفة"), ("rightbar", "شريط ملوّن عمودي"), ("duo", "رأس ثنائي"), ("pills", "كبسولات")]
PJ = {k: v[1] for k, v in PRESETS.items()}
PN = {k: v[0] for k, v in PRESETS.items()}
builder_html = '''
<div class="cvapp">
 <div class="cvpanel">
  <div class="tpls"><span class="tpl-h">نموذج جاهز:</span>''' + ''.join(f'<button type="button" class="chip" data-pre="{k}">{n}</button>' for k, n in PN.items()) + '''<button type="button" class="chip add" id="clr">سيرة فارغة</button></div>
  <h3>اختر شكل القالب (22 تصميمًا — معاينة حقيقية بسيرتك)</h3><div class="tgrid" id="tsel"></div><details class="galbox"><summary>🎨 معرض 440 قالبًا (22 تصميمًا × 10 ألوان × خطين)</summary><label class="field">التصميم<select id="gl"></select></label><div class="gal" id="gal"></div></details>
  <div class="row2"><label class="field">اللون<div class="sw" id="sw"></div></label><label class="field">حجم الخط<select id="fs"><option value="12">صغير</option><option value="13" selected>متوسط</option><option value="14">كبير</option></select></label>
  <label class="field">لغة السيرة<select id="dir"><option value="rtl">عربية (يمين لليسار)</option><option value="ltr">English (LTR)</option></select></label></div>
  <h3>البيانات</h3>
  <div class="row2"><label class="field">الاسم<input id="name"></label><label class="field">المسمى الوظيفي<input id="title"></label>
  <label class="field">البريد<input id="email"></label><label class="field">الجوال<input id="phone"></label>
  <label class="field">المدينة<input id="city"></label><label class="field">رابط (لينكدإن/موقع)<input id="link"></label></div>
  <label class="field wide">الملخص المهني (3-4 أسطر)<textarea id="summary" rows="4"></textarea></label>
  <label class="field wide">الخبرات <small>كل خبرة: سطر «المسمى | الشركة | الفترة» ثم نقاط تبدأ بـ - ، وسطر فارغ بين الخبرات</small><textarea id="exp" rows="10"></textarea></label>
  <label class="field wide">التعليم <small>سطر لكل مؤهل: الشهادة | الجهة | السنة</small><textarea id="edu" rows="3"></textarea></label>
  <label class="field wide">المهارات <small>افصل بفاصلة</small><textarea id="skills" rows="2"></textarea></label>
  <div class="row2"><label class="field">اللغات<input id="langs"></label></div>
  <label class="field wide">الدورات والشهادات <small>سطر لكل دورة: الاسم | السنة</small><textarea id="courses" rows="3"></textarea></label>
 </div>
 <div class="cvside"><div class="toolbar"><button class="btn btn-g" id="pdf" type="button">🖨️ حفظ PDF / طباعة</button><button class="btn btn-s" id="txt" type="button">⬇️ نص ATS</button><button class="btn btn-s" id="exp1" type="button">💾 تصدير JSON</button><label class="btn btn-s">📂 استيراد<input id="imp" type="file" accept=".json" hidden></label><a class="btn btn-o" href="/cv/ats-checker/" id="toats">✅ افحص ATS</a></div>
 <div class="cvwrap" id="cvwrap"><div id="cv"></div></div><div id="recs" class="recs"></div><p class="muted">القوالب 1-2 صفحة A4. لأفضل توافق مع أنظمة التوظيف استخدم قالب «ATS نظيف» أو «كلاسيكي» وتجنب الصور والجداول.</p></div>
</div>'''
builder_js = r'''
const PRES=%s;const TP=%s;const COLORS=['#7c3aed','#2563eb','#0f766e','#b45309','#be123c','#334155','#047857','#7e22ce','#0e7490','#111827'];const CN=['بنفسجي','أزرق','أخضر مزرق','ذهبي','عنابي','رمادي','أخضر','أرجواني','سماوي','أسود'];
const F=['name','title','email','phone','city','link','summary','exp','edu','skills','langs','courses'];
let S={tpl:'classic',color:COLORS[0],fs:'13',dir:'rtl',font:'sans'};const KEY='dt-cv-v1';
function load(o){F.forEach(f=>$(f).value=o[f]||'')}
function get(){const o={};F.forEach(f=>o[f]=$(f).value);return o}
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s){S=Object.assign(S,s.S||{});load(s.d||{})}else load(PRES.sales)}catch(e){load(PRES.sales)}
$('fs').value=S.fs;$('dir').value=S.dir;
let _tt=null;function thumbs(){clearTimeout(_tt);_tt=setTimeout(()=>{if(!LAST)return;$('tsel').innerHTML=TP.map(t=>'<button type="button" class="gc tp'+(t[0]===S.tpl?' on':'')+'" data-t="'+t[0]+'" title="'+t[1]+'"><span class="gpv"><span class="gpi">'+cvHtml({tpl:t[0],color:S.color,font:S.font,dir:S.dir,fs:'13'},13)+'</span></span><b>'+t[1]+'</b></button>').join('')},350)}
$('sw').innerHTML=COLORS.map(c=>'<i data-c="'+c+'" style="background:'+c+'"></i>').join('');
function parseExp(t){return t.split(/\n\s*\n/).map(b=>{const L=b.split('\n').map(x=>x.trim()).filter(Boolean);if(!L.length)return null;const h=L[0].split('|').map(x=>x.trim());return{role:h[0]||'',org:h[1]||'',per:h[2]||'',pts:L.slice(1).map(x=>x.replace(/^[-•*]\s*/,''))}}).filter(Boolean)}
function lines(t){return t.split('\n').map(x=>x.trim()).filter(Boolean).map(x=>x.split('|').map(y=>y.trim()))}
let LAST=null;function cvHtml(st,fs){const q=LAST;return '<div class="cv t-'+st.tpl+'" dir="'+st.dir+'" style="--ac:'+st.color+';font-size:'+(fs||st.fs)+'px;font-family:'+(st.font==='serif'?"Georgia,'Times New Roman',serif":'Cairo,Arial,sans-serif')+'"><header class="cvh"><h1>'+esc(q.d.name)+'</h1><div class="ttl">'+esc(q.d.title)+'</div><div class="ct">'+q.ct+'</div></header><div class="cvb"><div class="cvm">'+q.main+'</div><aside class="cva">'+q.side+'</aside></div></div>'}
function render(){const d=get(),ar=S.dir==='rtl';const T=ar?{sum:'الملخص المهني',exp:'الخبرات',edu:'التعليم',sk:'المهارات',lg:'اللغات',cr:'الدورات والشهادات'}:{sum:'Summary',exp:'Experience',edu:'Education',sk:'Skills',lg:'Languages',cr:'Courses & Certificates'};
 const ct=[d.email,d.phone,d.city,d.link].filter(Boolean).map(x=>'<span>'+esc(x)+'</span>').join('');
 const exp=parseExp(d.exp).map(x=>'<div class="it"><div class="r1"><b>'+esc(x.role)+'</b><em>'+esc(x.per)+'</em></div><div class="org">'+esc(x.org)+'</div>'+(x.pts.length?'<ul>'+x.pts.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>':'')+'</div>').join('');
 const edu=lines(d.edu).map(x=>'<div class="it"><div class="r1"><b>'+esc(x[0])+'</b><em>'+esc(x[2]||'')+'</em></div><div class="org">'+esc(x[1]||'')+(x[3]?' · '+esc(x[3]):'')+'</div></div>').join('');
 const sk=d.skills.split(/[,،\n]/).map(x=>x.trim()).filter(Boolean).map(x=>'<span class="tg">'+esc(x)+'</span>').join('');
 const lg=d.langs.split(/[,،]/).map(x=>x.trim()).filter(Boolean).map(x=>'<li>'+esc(x)+'</li>').join('');
 const cr=lines(d.courses).map(x=>'<li>'+esc(x[0])+(x[1]?' <em>'+esc(x[1])+'</em>':'')+'</li>').join('');
 const sec=(h,c)=>c?'<section><h2>'+h+'</h2>'+c+'</section>':'';
 const side=sec(T.sk,sk?'<div class="tags">'+sk+'</div>':'')+sec(T.lg,lg?'<ul class="pl">'+lg+'</ul>':'')+sec(T.cr,cr?'<ul class="pl">'+cr+'</ul>':'');
 const main=sec(T.sum,d.summary?'<p>'+esc(d.summary)+'</p>':'')+sec(T.exp,exp)+sec(T.edu,edu);
 LAST={d:d,ct:ct,main:main,side:side};$('cv').innerHTML=cvHtml(S);
 fit();recs();try{localStorage.setItem(KEY,JSON.stringify({S:S,d:d}));localStorage.setItem('dt-cv-text',plain())}catch(e){}
 thumbs();document.querySelectorAll('#tsel .gc').forEach(b=>b.classList.toggle('on',b.dataset.t===S.tpl));
 document.querySelectorAll('#sw i').forEach(i=>i.classList.toggle('on',i.dataset.c===S.color))}
const WK=%s,VB=%s;
function recs(){const d=get(),E=parseExp(d.exp),R=[];let sc=0;const ok=(c,pts,good,bad)=>{R.push({ok:c,t:c?good:bad});if(c)sc+=pts};
 ok(d.name&&d.title,8,'الاسم والمسمى موجودان','أضف الاسم والمسمى الوظيفي المستهدف');
 ok(d.email&&d.phone,8,'وسائل التواصل مكتملة','أضف بريدًا إلكترونيًا ورقم جوال');
 const sw=d.summary.trim().split(/\s+/).filter(Boolean).length;ok(sw>=25&&sw<=80,10,'الملخص بطول مناسب ('+sw+' كلمة)',sw<25?'الملخص قصير: اكتب 3-4 أسطر فيها سنوات الخبرة وأبرز إنجاز وتخصصك':'الملخص طويل: اختصره إلى 60 كلمة تقريبًا');
 const pts=E.reduce((a,x)=>a.concat(x.pts),[]);ok(E.length>=1,8,'الخبرات مضافة','أضف خبراتك أو تدريبك أو مشاريعك');
 ok(E.length&&E.every(x=>x.pts.length>=2),8,'لكل خبرة نقاط كافية','اجعل لكل خبرة من 3 إلى 5 نقاط إنجاز');
 const nn=pts.filter(x=>/\d/.test(x)).length;ok(pts.length&&nn/pts.length>=0.5,14,'أغلب نقاطك فيها أرقام',nn+' من '+pts.length+' نقطة فيها رقم: أضف نسبًا وأعدادًا ومبالغ ومدة');
 const vb=pts.filter(x=>VB.some(v=>AR(x).startsWith(AR(v)))).length;ok(pts.length&&vb/pts.length>=0.5,10,'تبدأ النقاط بأفعال قوية','ابدأ النقاط بأفعال إنجاز: حققت، أدرت، خفضت، طورت');
 const wk=pts.filter(x=>WK.some(w=>AR(x).includes(AR(w)))).length;ok(wk===0,6,'لا عبارات ضعيفة','استبدل عبارات مثل «مسؤول عن» بإنجاز قابل للقياس ('+wk+' نقاط)');
 const sk=d.skills.split(/[,،\n]/).filter(x=>x.trim()).length;ok(sk>=6&&sk<=14,8,'المهارات مناسبة ('+sk+')',sk<6?'أضف 6 مهارات على الأقل مطابقة لإعلانات الوظائف':'قلّل المهارات إلى أهمها (حتى 12)');
 ok(!!d.edu.trim(),6,'التعليم موجود','أضف مؤهلك الدراسي');
 const tw=plain().split(/\s+/).length;ok(tw>=250&&tw<=650,8,'طول السيرة مناسب (~'+tw+' كلمة)',tw<250?'السيرة قصيرة: أضف إنجازات وتفاصيل':'السيرة طويلة: اجعلها صفحة أو صفحتين');
 ok(['ats','classic','minimal'].includes(S.tpl)||S.tpl==='compact',6,'القالب مناسب للأنظمة','للتقديم عبر أنظمة ATS اختر قالب «ATS نظيف» أو «كلاسيكي»');
 ok(!!d.link,4,'رابط مهني موجود','أضف رابط لينكدإن أو موقعك');
 const pct=Math.min(100,sc);const col=pct>=80?'#16a34a':pct>=60?'#d97706':'#dc2626';
 $('recs').innerHTML='<div class="rh"><b>💡 توصيات سيرتك</b><span style="color:'+col+'">جاهزية '+pct+'%%</span></div><div class="bar"><i style="width:'+pct+'%%;background:'+col+'"></i></div><ul>'+R.sort((a,b)=>a.ok-b.ok).map(r=>'<li class="'+(r.ok?'g':'w')+'">'+(r.ok?'✅ ':'⚠️ ')+esc(r.t)+'</li>').join('')+'</ul><a class="btn btn-o" href="/cv/bullet-improver/">حسّن نقاطك</a> <a class="btn btn-o" href="/cv/ats-checker/">افحص مطابقة الوظيفة</a>'}
function fit(){const w=$('cvwrap').clientWidth,z=Math.min(1,(w-2)/794);$('cv').style.zoom=z}
function plain(){const d=get();let o=[d.name,d.title,[d.email,d.phone,d.city,d.link].filter(Boolean).join(' | '),'','الملخص المهني / SUMMARY',d.summary,'','الخبرات / EXPERIENCE'];parseExp(d.exp).forEach(x=>{o.push(x.role+' - '+x.org+' ('+x.per+')');x.pts.forEach(p=>o.push('- '+p));o.push('')});o.push('التعليم / EDUCATION',d.edu,'','المهارات / SKILLS',d.skills,'','اللغات / LANGUAGES',d.langs,'','الدورات / COURSES',d.courses);return o.join('\n')}
document.querySelectorAll('input,textarea,select').forEach(x=>{if(x.id&&x.id!=='imp')x.addEventListener('input',()=>{S.fs=$('fs').value;S.dir=$('dir').value;render()})});
$('tsel').onclick=e=>{const b=e.target.closest('[data-t]');if(b){S.tpl=b.dataset.t;render()}};
$('sw').onclick=e=>{const c=e.target.dataset.c;if(c){S.color=c;render()}};
document.querySelectorAll('[data-pre]').forEach(b=>b.onclick=()=>{load(PRES[b.dataset.pre]);render()});
$('clr').onclick=()=>{load({});render()};
$('pdf').onclick=()=>print();$('txt').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+plain()],{type:'text/plain;charset=utf-8'}));a.download='cv-ats.txt';a.click()};
$('exp1').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({S:S,d:get()})],{type:'application/json'}));a.download='cv.json';a.click()};
$('imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const o=JSON.parse(t);S=Object.assign(S,o.S||{});load(o.d||{});$('fs').value=S.fs;$('dir').value=S.dir;render()}catch(x){alert('ملف غير صالح')}})};
function gal(){if(!LAST)render();const g=$('gl').value,h=[];COLORS.forEach((c,ci)=>['sans','serif'].forEach(fo=>{const st={tpl:g,color:c,font:fo,dir:S.dir,fs:'13'};h.push('<button type="button" class="gc" data-t="'+g+'" data-c="'+c+'" data-f="'+fo+'"><span class="gpv"><span class="gpi">'+cvHtml(st,13)+'</span></span><b>'+CN[ci]+(fo==='serif'?' · سيريف':'')+'</b></button>')}));$('gal').innerHTML=h.join('')}
$('gl').innerHTML=TP.map(t=>'<option value="'+t[0]+'">'+t[1]+'</option>').join('');$('gl').onchange=gal;gal();
$('gal').onclick=e=>{const b=e.target.closest('.gc');if(!b)return;S.tpl=b.dataset.t;S.color=b.dataset.c;S.font=b.dataset.f;render()};
addEventListener('resize',fit);render();
''' % (json.dumps({k: v[1] for k, v in PRESETS.items()}, ensure_ascii=False), json.dumps(TPLS, ensure_ascii=False), json.dumps(WEAK, ensure_ascii=False), json.dumps(VERBS, ensure_ascii=False))
faq_b = [("هل منشئ السيرة الذاتية مجاني؟", "نعم مجاني بالكامل، ولا يحتاج تسجيلًا. بياناتك تبقى على جهازك ولا تُرسل لأي خادم."),
         ("كيف أحفظ السيرة بصيغة PDF؟", "اضغط «حفظ PDF / طباعة» ثم اختر «حفظ كملف PDF» من نافذة الطباعة. ستُطبع السيرة وحدها بحجم A4."),
         ("أي قالب أفضل لأنظمة ATS؟", "قالب «ATS نظيف» أو «الكلاسيكي»: عمود واحد، عناوين واضحة، بلا صور أو جداول. بعدها افحص سيرتك في أداة فحص ATS."),
         ("هل أضع صورتي؟", "في السعودية ودول الخليج قد تُقبل الصورة بحسب الشركة، لكن أنظمة ATS لا تقرؤها ولذلك لا نضعها في القوالب. أضفها فقط إن طلبت الجهة."),
         ("كم صفحة يجب أن تكون السيرة؟", "صفحة واحدة لمن خبرته أقل من 5 سنوات، وحتى صفحتين لمن لديه خبرة أطول. اكتب الأهم أولًا.")]
tool_page("builder", "منشئ السيرة الذاتية الاحترافي (440 قالبًا + PDF)", "أنشئ سيرة ذاتية احترافية بالعربية أو الإنجليزية: 440 قالبًا، نماذج جاهزة لـ10 وظائف، ألوان، تنزيل PDF ونص ATS، مجانًا.", "📄", builder_html, builder_js, faq_b)

# ================= ATS =================
ats_html = '''<div class="tool-layout"><div class="tool"><h3>سيرتك</h3><label class="field wide">الصق نص السيرة الذاتية<textarea id="cvt" rows="14" placeholder="الصق هنا نص سيرتك الذاتية…"></textarea></label><div class="toolbar"><button class="btn btn-s" id="fromb" type="button">استيراد من منشئ السير</button><button class="btn btn-s" id="demo" type="button">مثال</button></div>
<h3>الوصف الوظيفي (اختياري لكن مهم)</h3><label class="field wide">الصق إعلان الوظيفة<textarea id="jd" rows="9" placeholder="الصق متطلبات الوظيفة لمقارنة الكلمات المفتاحية…"></textarea></label></div>
<div class="out-col"><div class="tool"><h3>نتيجة الفحص</h3><div id="res" class="result" aria-live="polite"></div></div></div></div>'''
ats_js = r'''
const STOP=new Set('في من على الى عن مع هذا هذه ذلك او و ان التي الذي كان يكون لدى بعد قبل حتى كل بين عند لدي ما لا هو هي نحن انت the and for with you your our are will from that this have has all not but can they their been who job work team years year experience ability strong skills required preferred plus must should also into more than using use able well'.split(' '));
const VERBS=%s.map(AR),WEAK=%s.map(AR);
function stem(x){return x.length>4&&/[؀-ۿ]/.test(x)?x.replace(/^(وال|بال|لل|ال|و|ب|ل)/,''):x}
function toks(t){return AR(t).split(/[^a-z0-9؀-ۿ+#.]+/).map(x=>stem(x.replace(/^\.+|\.+$/g,''))).filter(x=>x.length>=2)}
function run(){const cv=$('cvt').value,jd=$('jd').value;if(!cv.trim()){$('res').innerHTML='<p class="muted">الصق سيرتك لبدء الفحص.</p>';return}
 const ct=toks(cv),cset=new Set(ct),words=ct.length,A=AR(cv);const R=[];let sc=0,max=0;
 const add=(name,pts,mx,ok,msg)=>{max+=mx;sc+=pts;R.push({name:name,pts:pts,mx:mx,ok:ok,msg:msg})};
 // contact
 const em=/[\w.+-]+@[\w-]+\.[\w.]+/.test(cv),ph=/(\+?\d[\d\s-]{7,}\d)/.test(cv.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
 add('بيانات التواصل',(em?5:0)+(ph?5:0),10,em&&ph,(em?'':'أضف بريدًا إلكترونيًا. ')+(ph?'':'أضف رقم جوال. ')||'البريد والجوال موجودان.');
 // sections
 const secs=[['الملخص',/ملخص|نبذه|summary|profile|objective/],['الخبرات',/خبر|experience|employment/],['التعليم',/تعليم|مؤهل|education|بكالوريوس|دبلوم|ماجستير|degree/],['المهارات',/مهار|skills|competenc/]];
 const miss=secs.filter(s=>!s[1].test(A)).map(s=>s[0]);add('الأقسام الأساسية',Math.round(20*(secs.length-miss.length)/secs.length),20,!miss.length,miss.length?'أقسام ناقصة أو بعناوين غير معتادة: '+miss.join('، ')+'. استخدم عناوين قياسية.':'كل الأقسام الأساسية موجودة بعناوين واضحة.');
 // length
 const lp=words>=250&&words<=800?10:words>=150?6:words>=100?3:0;add('الطول',lp,10,lp===10,'عدد الكلمات '+words+(lp===10?' (مناسب).':words<250?': قصير؛ أضف إنجازات وتفاصيل.':': طويل؛ اختصر لصفحتين.'));
 // numbers
 const nums=(cv.match(/\d+[\d,.]*\s?%%?|\d{2,}/g)||[]).length;const np=Math.min(15,nums*2);add('الإنجازات بالأرقام',np,15,nums>=6,'وجدت '+nums+' رقمًا/نسبة. '+(nums>=6?'ممتاز.':'أضف أرقامًا: نسبة نمو، عدد عملاء، مبالغ، وقت موفر.'));
 // verbs
 const vc=VERBS.filter(v=>cset.has(v)||A.includes(v)).length;const vp=Math.min(10,vc*2);add('أفعال الإنجاز',vp,10,vc>=5,'أفعال قوية: '+vc+'. '+(vc>=5?'جيد.':'ابدأ النقاط بأفعال مثل: حققت، أدرت، خفضت، طورت.'));
 // weak
 const wk=WEAK.filter(w=>A.includes(w));add('العبارات الضعيفة',wk.length?Math.max(0,5-wk.length*2):5,5,!wk.length,wk.length?'عبارات عامة: '+wk.join('، ')+'. استبدلها بإنجاز قابل للقياس.':'لا عبارات ضعيفة ظاهرة.');
 // formatting
 const fm=[];if((cv.match(/\t/g)||[]).length>8)fm.push('رموز جدولة كثيرة تدل على جداول/أعمدة');if(/[│┃║■□●◆★✓✔➤➜]/.test(cv))fm.push('رموز خاصة قد لا تقرؤها الأنظمة');if(!/(19|20)\d\d/.test(cv.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d))))fm.push('لا توجد تواريخ/سنوات');
 add('التنسيق',fm.length?Math.max(0,5-fm.length*2):5,5,!fm.length,fm.length?fm.join('؛ ')+'.':'التنسيق نصي نظيف.');
 // keywords
 let kwHtml='',missing=[];
 if(jd.trim()){const jt=toks(jd).filter(x=>!STOP.has(x)&&!/^\d+$/.test(x)&&x.length>=3);const f={};jt.forEach(x=>f[x]=(f[x]||0)+1);const top=Object.keys(f).sort((a,b)=>f[b]-f[a]||b.length-a.length).slice(0,30);
  const hit=top.filter(k=>cset.has(k)),mis=top.filter(k=>!cset.has(k));missing=mis;
  const kp=Math.round(40*hit.length/Math.max(1,top.length));add('مطابقة الكلمات المفتاحية',kp,40,kp>=28,'طابقت '+hit.length+' من '+top.length+' كلمة رئيسية في الوصف الوظيفي.');
  kwHtml='<h4>كلمات الوظيفة الناقصة في سيرتك</h4><div class="tags">'+(mis.map(k=>'<span class="tg bad">'+esc(k)+'</span>').join('')||'<span class="tg good">لا شيء ناقص</span>')+'</div><h4>كلمات مطابقة</h4><div class="tags">'+hit.map(k=>'<span class="tg good">'+esc(k)+'</span>').join('')+'</div>'}
 else kwHtml='<p class="muted">أضف الوصف الوظيفي لتظهر مطابقة الكلمات المفتاحية (أهم عامل في أنظمة ATS، 40 درجة).</p>';
 const pct=Math.round(sc/max*100),col=pct>=75?'#16a34a':pct>=55?'#d97706':'#dc2626';
 let h='<div class="ring" style="--p:'+pct+';--c:'+col+'"><b>'+pct+'%%</b><span>درجة ATS</span></div><p class="muted center">'+(pct>=75?'سيرتك جاهزة تقريبًا.':pct>=55?'جيدة لكنها تحتاج تحسينات.':'تحتاج تحسينًا ملحوظًا قبل التقديم.')+'</p>';
 const pr5=R.filter(r=>!r.ok).sort((a,b)=>(b.mx-b.pts)-(a.mx-a.pts)).slice(0,5);if(pr5.length)h+='<div class="chk no"><b>🎯 أهم التحسينات بالأولوية</b><ol class="sug">'+pr5.map(r=>'<li><b>'+r.name+'</b> (+'+(r.mx-r.pts)+' درجة): '+esc(r.msg)+'</li>').join('')+'</ol></div>';
 h+=R.map(r=>'<div class="chk '+(r.ok?'ok':'no')+'"><div class="hd"><b>'+(r.ok?'✅':'⚠️')+' '+r.name+'</b><span>'+r.pts+'/'+r.mx+'</span></div><div class="bar"><i style="width:'+Math.round(r.pts/r.mx*100)+'%%"></i></div><small>'+esc(r.msg)+'</small></div>').join('');
 h+=kwHtml;
 const pr='أنت خبير سير ذاتية وأنظمة ATS. حسّن سيرتي الذاتية لتناسب هذا الوصف الوظيفي دون اختلاق خبرات: أعد صياغة الملخص والنقاط بأفعال قوية وأرقام، وأدرج الكلمات المفتاحية الناقصة فقط حيث تنطبق فعلًا.\n'+(missing.length?'<الكلمات الناقصة>'+missing.join('، ')+'</الكلمات الناقصة>\n':'')+'<الوصف الوظيفي>\n'+(jd||'[ألصقه]')+'\n</الوصف الوظيفي>\n<سيرتي>\n'+cv+'\n</سيرتي>\nاعرض: 1) ملخصًا جديدًا 2) النقاط المحسّنة لكل وظيفة 3) ما ينقصني فعلًا.';
 h+='<h4>حسّن سيرتك بالذكاء الاصطناعي</h4>'+aiBox(pr);
 $('res').innerHTML=h}
['cvt','jd'].forEach(i=>$(i).addEventListener('input',run));
$('fromb').onclick=()=>{try{$('cvt').value=localStorage.getItem('dt-cv-text')||'';run()}catch(e){}};
$('demo').onclick=()=>{$('cvt').value='أحمد محمد\nمندوب مبيعات\nahmed@example.com | +966500000000\nالملخص المهني\nمندوب مبيعات بخبرة 4 سنوات.\nالخبرات\nمندوب مبيعات - شركة الأفق (2022-الآن)\n- مسؤول عن المبيعات.\n- حققت 112%% من الهدف وأدرت 85 عميلا.\nالتعليم\nبكالوريوس إدارة أعمال 2020\nالمهارات\nالتفاوض, CRM, Excel';$('jd').value='مطلوب مندوب مبيعات لديه خبرة في المبيعات الميدانية والتفاوض وإدارة العملاء واستخدام CRM وتحقيق الأهداف وإعداد تقارير المبيعات.';run()};
run();
''' % (json.dumps(VERBS, ensure_ascii=False), json.dumps(WEAK, ensure_ascii=False))
ats_js = ats_js.replace('%%', '%')
faq_a = [("ما هو نظام ATS؟", "نظام تتبع المتقدمين (Applicant Tracking System) يستخدمه كثير من الشركات لاستقبال السير وفرزها بحسب الكلمات المفتاحية والأقسام قبل أن يراها المسؤول."),
         ("كيف تحسب الأداة الدرجة؟", "من 100: مطابقة الكلمات المفتاحية 40 (عند إدخال الوصف)، الأقسام 20، الإنجازات بالأرقام 15، التواصل 10، الطول 10، أفعال الإنجاز 10، التنسيق والعبارات الضعيفة 5 لكل منهما. الأرقام تقديرية."),
         ("هل الدرجة تضمن القبول؟", "لا. هي مؤشر تقريبي، وأنظمة الشركات تختلف. استخدمها لتحسين الوضوح والمطابقة ولا تحشر الكلمات بلا خبرة حقيقية."),
         ("هل سيرتي تُرسل لأي خادم؟", "لا. الفحص يتم في متصفحك فقط.")]
tool_page("ats-checker", "فاحص سيرة ATS: درجة ومطابقة كلمات الوظيفة", "افحص سيرتك الذاتية مجانًا: درجة ATS، مطابقة الكلمات المفتاحية مع الوصف الوظيفي، الأقسام، الأرقام، الأفعال، مع برومت للتحسين بالذكاء الاصطناعي.", "✅", ats_html, ats_js, faq_a)

# ================= bullets =================
bl_html = '''<div class="tool-layout"><div class="tool"><h3>نقطتك الحالية</h3><label class="field wide">اكتب نقطة من سيرتك (واحدة أو أكثر، كل سطر نقطة)<textarea id="b" rows="6">مسؤول عن المبيعات وزيارة العملاء\nشاركت في تحسين خدمة العملاء</textarea></label>
<div class="row2"><label class="field">وظيفتك<input id="role" value="مندوب مبيعات"></label><label class="field">رقم أو نتيجة تعرفها (اختياري)<input id="num" placeholder="مثال: زيادة 20%% خلال 6 أشهر"></label></div></div>
<div class="out-col"><div class="tool"><h3>التحسين</h3><div id="res" class="result"></div></div></div></div>''' % ()
bl_html = bl_html.replace('%%', '%')
bl_js = r'''
const V=['حققت','أدرت','طورت','خفضت','زدت','أطلقت','نفذت','حسّنت','قدت','أنجزت'];
const WK=%s;
function run(){const L=$('b').value.split('\n').map(x=>x.trim()).filter(Boolean),role=$('role').value,num=$('num').value;let h='';
 L.forEach((x,i)=>{const w=WK.filter(k=>AR(x).includes(AR(k)));const hasN=/\d/.test(x);const sc=100-w.length*25-(hasN?0:30);
  h+='<div class="chk '+(sc>=70?'ok':'no')+'"><div class="hd"><b>'+esc(x)+'</b><span>'+Math.max(0,sc)+'/100</span></div><small>'+(w.length?'عبارة ضعيفة: '+w.join('، ')+'. ':'')+(hasN?'':'لا يوجد رقم. ')+(sc>=70?'نقطة جيدة.':'أعد كتابتها بالصيغة: فعل + ما أنجزت + رقم + أثر.')+'</small>';
  const core=x.replace(/^(مسؤول(ة)? عن|شاركت في|ساعدت في|قمت بـ?|أعمل على)\s*/,'');
  h+='<ul class="sug"><li>'+V[i%%V.length]+' '+esc(core)+(num?' و'+esc(num):' ← أضف نتيجة رقمية')+'</li><li>'+V[(i+3)%%V.length]+' '+esc(core)+' بمعدل [الرقم] خلال [المدة] مما أدى إلى [الأثر]</li></ul></div>'});
 const pr='أنت خبير سير ذاتية. أعد كتابة النقاط التالية لوظيفة '+role+' بصيغة: فعل قوي + ما أنجزت + رقم + الأثر على العمل. اعطني 3 صيغ لكل نقطة بأسلوب مختلف. لا تخترع أرقامًا؛ ضع [الرقم] حيث ينقص.\nالنقاط:\n'+L.join('\n');
 $('res').innerHTML=h+'<h4>تحسين بالذكاء الاصطناعي</h4>'+aiBox(pr)}
['b','role','num'].forEach(i=>$(i).addEventListener('input',run));run();
''' % json.dumps(WEAK, ensure_ascii=False)
bl_js = bl_js.replace('%%', '%')
tool_page("bullet-improver", "محسّن نقاط السيرة الذاتية: من وصف مهام إلى إنجازات", "حوّل نقاط خبراتك الضعيفة إلى إنجازات بأفعال قوية وأرقام، مع تقييم لكل نقطة وبرومت جاهز.", "✍️", bl_html, bl_js,
  [("لماذا أكتب إنجازات لا مهام؟", "لأن المسؤول يريد معرفة أثرك لا وصف وظيفتك. الإنجاز بالأرقام أقنع وأسهل للمقارنة."), ("ما صيغة النقطة الجيدة؟", "فعل قوي + ما أنجزت + رقم + الأثر. مثال: خفضت زمن الرد 25% بإنشاء 30 قالب رد."), ("وإن لم أعرف الأرقام؟", "قدّر بصدق: عدد العملاء، الوقت الموفر، الحجم. وإن لم تتوفر فاستخدم نطاقًا تقريبيًا بأمانة.")])

# ================= cover letter =================
cl_html = '''<div class="tool-layout"><div class="tool"><h3>بياناتك</h3><div class="row2"><label class="field">اسمك<input id="n" value="أحمد محمد"></label><label class="field">الوظيفة المتقدم لها<input id="j" value="مندوب مبيعات"></label>
<label class="field">الشركة<input id="c" value="شركة الأفق"></label><label class="field">سنوات الخبرة<input id="y" value="4"></label>
<label class="field wide">أبرز إنجاز بالأرقام<input id="a" value="حققت 112% من الهدف السنوي"></label><label class="field wide">3 نقاط قوة (بفاصلة)<input id="s" value="التفاوض, بناء العلاقات, المتابعة"></label>
<label class="field">النبرة<select id="t"><option value="0">رسمية</option><option value="1">ودودة مهنية</option><option value="2">مباشرة موجزة</option></select></label></div></div>
<div class="out-col"><div class="tool"><h3>خطاب التقديم</h3><div id="res" class="result"></div></div></div></div>'''
cl_js = r'''
function run(){const n=$('n').value,j=$('j').value,c=$('c').value,y=$('y').value,a=$('a').value,s=$('s').value.split(/[,،]/).map(x=>x.trim()).filter(Boolean),t=+$('t').value;
 const T=[
 'السادة/ '+c+' المحترمين،\n\nتحية طيبة وبعد،\n\nأتقدم بطلبي لوظيفة '+j+' لديكم، ولدي خبرة '+y+' سنوات في المجال. من أبرز إنجازاتي: '+a+'.\n\nأتميز بـ'+s.join('، ')+'، وأطمح للإسهام في نجاح '+c+' وتحقيق أهدافها.\n\nيسعدني لقاؤكم لمناقشة كيف أضيف قيمة لفريقكم. مرفق سيرتي الذاتية.\n\nمع خالص التقدير،\n'+n,
 'مرحبًا فريق '+c+'،\n\nأكتب إليكم لأعبّر عن اهتمامي بوظيفة '+j+'. خلال '+y+' سنوات تعلمت أن النجاح يأتي من الاهتمام بالعميل والمتابعة؛ ومن ثمار ذلك: '+a+'.\n\nأعتمد في عملي على '+s.join('، ')+'، وأحب بيئات العمل التي تقدّر الإنجاز والتعاون، وهذا ما أراه في '+c+'.\n\nسأكون سعيدًا بمحادثة قصيرة معكم.\n\nشكرًا لوقتكم،\n'+n,
 'السادة '+c+'،\n\nأتقدم لوظيفة '+j+'. خبرتي '+y+' سنوات، وأبرز نتيجة: '+a+'.\n\nمهاراتي: '+s.join('، ')+'.\n\nمتاح للمقابلة في أي وقت.\n\n'+n];
 const pr='اكتب خطاب تقديم لوظيفة '+j+' في '+c+' بنبرة '+['رسمية','ودودة مهنية','مباشرة وموجزة'][t]+' في 150 كلمة. المتقدم: '+n+'، خبرة '+y+' سنوات، إنجاز: '+a+'، نقاط القوة: '+s.join('، ')+'. اربط خبرتي باحتياج الشركة، ولا تخترع معلومات غير مذكورة، وانهِ بدعوة لمقابلة.';
 $('res').innerHTML='<pre class="tpl" id="cl">'+esc(T[t])+'</pre><div class="toolbar"><button class="btn btn-s" onclick="navigator.clipboard.writeText($(\'cl\').innerText);this.textContent=\'تم ✅\'">نسخ الخطاب</button></div><h4>نسخة بالذكاء الاصطناعي</h4>'+aiBox(pr,'pr2')}
document.querySelectorAll('input,select').forEach(x=>x.addEventListener('input',run));run();
'''
tool_page("cover-letter", "مولّد خطاب التقديم (Cover Letter) بالعربية", "اكتب خطاب تقديم احترافي في ثوانٍ بـ3 نبرات، مع برومت لتخصيصه بالذكاء الاصطناعي.", "💌", cl_html, cl_js,
  [("هل خطاب التقديم ضروري؟", "ليس دائمًا، لكنه يميّزك حين تُطلب الشخصية أو الدافع. اجعله قصيرًا ومخصصًا للشركة."), ("كم طوله المناسب؟", "من 120 إلى 200 كلمة في ثلاث فقرات: لماذا أنت، ما إنجازك، ماذا تقدم لهم."), ("هل أرسل نفس الخطاب للجميع؟", "لا؛ خصّصه باسم الشركة والوظيفة وما يهمهم.")])

# ================= interview =================
QS = {"عامة": ["حدثنا عن نفسك.", "لماذا تريد هذه الوظيفة؟", "ما نقاط قوتك وضعفك؟", "أين ترى نفسك بعد 5 سنوات؟", "لماذا تركت وظيفتك السابقة؟", "ما توقعاتك للراتب؟"],
      "سلوكية (STAR)": ["حدثنا عن موقف حللت فيه مشكلة صعبة.", "مثال على خلاف مع زميل وكيف تصرفت.", "موقف أخطأت فيه وماذا تعلمت.", "مثال على عمل تحت ضغط الوقت.", "إنجاز تفخر به."],
      "مبيعات": ["كيف تتعامل مع اعتراض السعر؟", "كيف تبني قائمة عملاء جدد؟", "كيف تتابع عميلًا متردّدًا؟", "كيف تحقق هدفًا صعبًا؟"],
      "محاسبة": ["كيف تتأكد من دقة القيود؟", "كيف تتعامل مع فرق في المطابقة البنكية؟", "ما خطوات الإقفال الشهري؟", "كيف تتعامل مع ضريبة القيمة المضافة؟"],
      "موارد بشرية": ["كيف تستقطب مرشحين نادرين؟", "كيف تتعامل مع شكوى موظف؟", "كيف تقيس أداء الموظفين؟", "ما أهم بنود نظام العمل التي تطبقها؟"],
      "برمجة": ["كيف تتعامل مع كود غير مفهوم ورثته؟", "اشرح مشروعًا أنجزته تقنيًا.", "كيف تختبر عملك؟", "كيف تحسن أداء تطبيق بطيء؟"],
      "تسويق": ["كيف تقيس نجاح حملة؟", "كيف توزع ميزانية إعلانية صغيرة؟", "كيف تحسن معدل التحويل؟", "كيف تتعامل مع حملة لم تنجح؟"],
      "خدمة عملاء": ["كيف تتعامل مع عميل غاضب؟", "كيف تتصرف عند عدم معرفتك الجواب؟", "كيف تحافظ على الهدوء تحت الضغط؟"]}
iv_html = '''<div class="tool-layout"><div class="tool"><h3>مقابلتك</h3><div class="row2"><label class="field">المجال<select id="k"></select></label><label class="field">الوظيفة<input id="j" value="مندوب مبيعات"></label></div>
<h4>قالب STAR للإجابة</h4><ul class="pl"><li><b>S</b> الموقف: ما السياق؟</li><li><b>T</b> المهمة: ما المطلوب منك؟</li><li><b>A</b> الإجراء: ماذا فعلت أنت؟</li><li><b>R</b> النتيجة: ما الأثر بالأرقام؟</li></ul>
<label class="field wide">اكتب إجابتك لسؤال لتقيّمها<textarea id="ans" rows="4"></textarea></label><div id="fb"></div></div>
<div class="out-col"><div class="tool"><h3>أسئلة محتملة</h3><div id="res" class="result"></div></div></div></div>'''
iv_js = r'''
const QS=%s;const sel=$('k');Object.keys(QS).forEach(k=>sel.add(new Option(k,k)));
function run(){const q=(QS['عامة'].concat(QS[sel.value]||[])).filter((x,i,a)=>a.indexOf(x)===i);
 const pr='أنت مُقابِل توظيف لوظيفة '+$('j').value+'. اطرح علي سؤال مقابلة واحدًا في كل دور، وانتظر إجابتي، ثم قيّمها بصيغة STAR مع درجة من 10 وتحسين مقترح. ابدأ بسؤال '+sel.value+'.';
 $('res').innerHTML='<ol class="qs">'+q.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><h4>تدرّب مع الذكاء الاصطناعي</h4>'+aiBox(pr)}
sel.onchange=$('j').oninput=run;
$('ans').oninput=()=>{const a=$('ans').value,w=a.trim().split(/\s+/).filter(Boolean).length,n=/\d/.test(a),ver=/(حققت|أدرت|قدت|طورت|خفضت|زدت|نفذت)/.test(a),s=/(موقف|كنت|عندما|في وقت)/.test(a);
 $('fb').innerHTML=w?'<div class="chk '+(n&&ver?'ok':'no')+'"><small>'+w+' كلمة · '+(s?'يوجد سياق ✅':'أضف الموقف ⚠️')+' · '+(ver?'يوجد فعل إجراء ✅':'اذكر ما فعلته أنت ⚠️')+' · '+(n?'يوجد رقم/نتيجة ✅':'أضف نتيجة رقمية ⚠️')+' · '+(w>=40&&w<=160?'الطول مناسب ✅':'اجعلها 40-160 كلمة ⚠️')+'</small></div>':''};
run();
''' % json.dumps(QS, ensure_ascii=False)
tool_page("interview-prep", "التحضير للمقابلة الشخصية: أسئلة وقالب STAR وتدريب", "أسئلة مقابلة محتملة لـ8 مجالات، قالب STAR، تقييم فوري لإجابتك، وبرومت للتدرب مع الذكاء الاصطناعي.", "🎤", iv_html, iv_js,
  [("ما هي طريقة STAR؟", "إطار للإجابة على الأسئلة السلوكية: الموقف، المهمة، الإجراء، النتيجة."), ("كيف أستعد للمقابلة؟", "اعرف الشركة والوظيفة، جهز 5 قصص إنجاز، تدرب بصوت عالٍ، وجهز أسئلتك لهم."), ("وماذا عن سؤال الراتب؟", "ابحث عن متوسط الراتب للوظيفة، وأجب بنطاق مبني على السوق وخبرتك.")])

# ================= linkedin =================
li_html = '''<div class="tool-layout"><div class="tool"><h3>بياناتك</h3><div class="row2"><label class="field">المسمى<input id="t" value="مندوب مبيعات"></label><label class="field">سنوات الخبرة<input id="y" value="4"></label><label class="field wide">تخصصك/ما تساعد به الناس<input id="w" value="مساعدة الشركات الصغيرة على زيادة مبيعاتها"></label>
<label class="field wide">إنجاز بالأرقام<input id="a" value="حققت 112% من الهدف وأدرت 85 عميلًا"></label><label class="field wide">مهاراتك<input id="s" value="التفاوض, CRM, إدارة العملاء"></label></div></div>
<div class="out-col"><div class="tool"><h3>نبذتك واتصالك</h3><div id="res" class="result"></div></div></div></div>'''
li_js = r'''
function run(){const t=$('t').value,y=$('y').value,w=$('w').value,a=$('a').value,s=$('s').value;
 const hl=t+' | '+w+' | '+s.split(/[,،]/).slice(0,3).join(' • ');
 const ab='أعمل في '+t+' منذ '+y+' سنوات، وأتخصص في '+w+'.\n\nمن إنجازاتي: '+a+'.\n\nأبرز مهاراتي: '+s+'.\n\nأحب التواصل مع المهتمين بـ'+t+' وتبادل الخبرات. للتواصل: [بريدك].';
 const pr='أنت خبير ملفات لينكدإن. اكتب لي: 1) عنوانًا مهنيًا (Headline) بـ3 صيغ 2) نبذة About في 120 كلمة بنبرة مهنية ودودة 3) 5 مهارات للإضافة. المعلومات: '+t+'، '+y+' سنوات، '+w+'، إنجاز: '+a+'، مهارات: '+s+'. لا تخترع معلومات.';
 $('res').innerHTML='<h4>العنوان المهني</h4><pre class="tpl">'+esc(hl)+'</pre><h4>نبذة About</h4><pre class="tpl">'+esc(ab)+'</pre><h4>برومت للتحسين</h4>'+aiBox(pr)}
document.querySelectorAll('input').forEach(x=>x.addEventListener('input',run));run();
'''
tool_page("linkedin-summary", "مولّد عنوان ونبذة لينكدإن بالعربية", "اكتب عنوانًا مهنيًا ونبذة About جذابة لملفك على لينكدإن، مع برومت للتحسين.", "💼", li_html, li_js,
  [("ما أهم جزء في ملف لينكدإن؟", "العنوان المهني والنبذة والصورة؛ ثم الخبرات بإنجازات رقمية."), ("هل أكتب بالعربية أم الإنجليزية؟", "اكتب بلغة سوق عملك، ويمكن إضافة اللغتين إن استهدفت أسواقًا مختلفة.")])

# ================= keywords bank =================
kw_html = '<div class="grid g3">' + ''.join(f'<div class="card"><h3>{e(k)}</h3><p class="tags2">' + ''.join(f'<span class="tg">{e(x.strip())}</span>' for x in v.split(',')) + f'</p><button class="btn btn-s" type="button" data-c="{e(v)}">نسخ الكلمات</button></div>' for k, v in KEYWORDS.items()) + '</div>'
kw_js = "document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{navigator.clipboard.writeText(b.dataset.c);b.textContent='تم النسخ ✅'})"
tool_page("keywords", "كلمات مفتاحية للسيرة الذاتية حسب الوظيفة (14 مجالًا)", "قوائم كلمات مفتاحية جاهزة للسيرة الذاتية لـ14 مجالًا: مبيعات، محاسبة، برمجة، تسويق، موارد بشرية وغيرها، لرفع درجة ATS.", "🔑", kw_html, kw_js,
  [("كيف أستخدم الكلمات المفتاحية؟", "اختر ما تمتلكه فعلًا من مهارات وأدرجها في الملخص والمهارات والنقاط بصياغة طبيعية."), ("هل أحشر الكلمات؟", "لا. الحشو يضر عند القراءة البشرية؛ استخدمها حيث تنطبق على خبرتك.")])

# ================= samples (SEO) =================
sm = ''
for k, (nm, d) in PRESETS.items():
    sm += f'<article class="card" id="{k}"><h3>نموذج سيرة ذاتية: {e(nm)}</h3><p><b>{e(d["title"])}</b></p><p>{e(d["summary"])}</p><p><b>أمثلة نقاط الخبرة:</b></p><ul>' + ''.join(f'<li>{e(x[2:])}</li>' for x in d["exp"].split("\n") if x.startswith("- "))[:900] + f'</ul><p><b>المهارات:</b> {e(d["skills"])}</p><a class="btn btn-g" href="/cv/builder/">استخدمه في المنشئ ←</a></article>'
path = "/cv/samples/"
b = hero("نماذج سير ذاتية جاهزة بالعربية لـ10 وظائف", "نماذج سيرة ذاتية واقعية: مندوب مبيعات، محاسب، مطور، تسويق، موارد بشرية، خدمة عملاء، حديث التخرج وغيرها. انسخ الأسلوب وعدّل بياناتك.", CR, "📑 نماذج")
b += '<main><section class="s"><div class="wrap"><div class="grid g2">' + sm + '</div></div></section></main>'
fq = [("هل أنسخ النموذج كما هو؟", "لا. استخدمه مرجعًا للصياغة وبدّل المعلومات بخبراتك وأرقامك الحقيقية."), ("كيف أحول النموذج إلى ملف PDF؟", "افتح منشئ السيرة، اختر نموذج وظيفتك، عدّل البيانات واحفظ PDF.")]
b = b.replace('</main>', '<section class="s alt"><div class="wrap narrow"><h2 class="h2">أسئلة شائعة</h2>' + faq_html(fq) + '</div></section></main>')
write("cv/samples/index.html", page(path, "نماذج سيرة ذاتية جاهزة بالعربية لـ10 وظائف | DIAMOND HUB", "نماذج سيرة ذاتية بالعربية لمندوب مبيعات ومحاسب ومطور وتسويق وموارد بشرية وخدمة عملاء وحديث التخرج ومهندس ومعلم ومصمم.", b, breadcrumb([("الرئيسية", "/"), ("السيرة الذاتية", "/cv/"), ("نماذج", path)]) + faq_ld(fq), "/cv/", css_extra=CSS)); URLS.append((path, "0.9"))

# ================= hub =================
cards = [("builder", "📄", "منشئ السيرة الذاتية", "440 قالبًا احترافية و10 نماذج جاهزة وتنزيل PDF."), ("ats-checker", "✅", "فاحص ATS", "درجة ومطابقة كلمات الوظيفة."), ("bullet-improver", "✍️", "محسّن النقاط", "حوّل المهام إلى إنجازات."),
         ("cover-letter", "💌", "خطاب التقديم", "3 نبرات وبرومت للتخصيص."), ("interview-prep", "🎤", "التحضير للمقابلة", "أسئلة وSTAR وتقييم."), ("linkedin-summary", "💼", "نبذة لينكدإن", "عنوان ونبذة جاهزة."),
         ("keywords", "🔑", "كلمات مفتاحية", "14 مجالًا."), ("samples", "📑", "نماذج جاهزة", "10 نماذج سير.")]
hub = hero("السيرة الذاتية و<span class='g-text'>التوظيف</span>: أنشئ سيرتك وافحص ATS وتجهّز للمقابلة", "أدوات مجانية بالعربية: منشئ سيرة ذاتية بـ440 قالبًا، فحص ATS، تحسين النقاط، خطاب تقديم، أسئلة مقابلة، ولينكدإن.", CR, "🎯 لتحصل على الوظيفة")
hub += '<main><section class="s"><div class="wrap"><div class="grid g3">' + ''.join(f'<a class="card" href="/cv/{s}/"><div class="ic">{i}</div><h3>{t}</h3><p>{d}</p><span class="more">افتح ←</span></a>' for s, i, t, d in cards) + '</div></div></section>'
hub += '<section class="s alt"><div class="wrap narrow"><h2 class="h2">مقالات تساعدك</h2><div id="cvarts" class="grid g2"></div></div></section></main><script>fetch("/search-index.json").then(r=>r.json()).then(d=>{const a=d.filter(x=>x.u.includes("/articles/cv-")).slice(0,8);document.getElementById("cvarts").innerHTML=a.map(x=>`<a class="card" href="${x.u}"><h3>${x.t}</h3></a>`).join("")}).catch(()=>{})</script>'
write("cv/index.html", page("/cv/", "السيرة الذاتية: منشئ وفاحص ATS وأدوات التوظيف | DIAMOND HUB", "أنشئ سيرة ذاتية احترافية مجانًا بـ440 قالبًا، افحص ATS، حسّن نقاط خبراتك، واكتب خطاب تقديم وتجهّز للمقابلة وحسّن لينكدإن.", hub,
    breadcrumb([("الرئيسية", "/"), ("السيرة الذاتية", "/cv/")]) + ld({"@context": "https://schema.org", "@type": "CollectionPage", "name": "السيرة الذاتية والتوظيف", "url": BASE + "/cv/", "inLanguage": "ar"}), "/cv/", css_extra=CSS)); URLS.append(("/cv/", "0.9"))
json.dump([u for u, _ in URLS], open('.cv_urls.json', 'w'))
print("cv built", len(URLS))
