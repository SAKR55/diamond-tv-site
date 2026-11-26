# -*- coding: utf-8 -*-
"""أدوات قسم التجارة الإلكترونية: (slug, icon, title, desc, html, js)."""
from ecom_content import LAUNCH_CHECKLIST
import json

COMMON = "const $=id=>document.getElementById(id);const n=id=>parseFloat($(id).value)||0;const f=(x,d=2)=>(isFinite(x)?x:0).toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d});"

def fld(id, label, val="", ph="", small=""):
    return f'<label class="field">{label}{" <small>"+small+"</small>" if small else ""}<input id="{id}" type="number" step="any" inputmode="decimal" value="{val}" placeholder="{ph}"></label>'

TOOLS = []

# 1 margin
TOOLS.append(("margin-calculator", "🧮", "حاسبة الهامش وسعر البيع",
 "احسب سعر البيع المناسب لتحقق هامش ربح صافٍ مستهدفًا بعد الشحن والعمولات والإعلان والمرتجعات والضريبة.",
 '<div class="row2">' + fld("cost","تكلفة الوحدة الواصلة (ريال)","40","40","منتج + شحن دولي + جمارك") + fld("ship","شحن العميل الذي تتحمله (ريال)","8") + fld("ad","تكلفة الإعلان لكل بيعة (ريال)","12") +
 fld("fee","عمولة الدفع %","3") + fld("ret","تكلفة المرتجعات والتالف % من السعر","4") + fld("vat","ضريبة القيمة المضافة %","15","","0 إن لم تنطبق") + fld("target","هامش الربح الصافي المستهدف %","25") + fld("myprice","سعرك الحالي قبل الضريبة (اختياري)","","","لاختبار هامشك الفعلي") +
 '</div><button class="btn btn-g" id="go">احسب</button><div class="result" id="out" aria-live="polite"></div>',
 """$('go').onclick=calc;document.querySelectorAll('input').forEach(i=>i.oninput=calc);
function calc(){const fixed=n('cost')+n('ship')+n('ad');const pct=(n('fee')+n('ret'))/100;const tg=n('target')/100;
const den=1-pct-tg;let h='';
if(den<=0.02){$('out').innerHTML='<b>الهامش المستهدف مع العمولات مرتفع جدًا.</b> خفّض الهامش أو العمولات.';return}
const P=fixed/den;const withVat=P*(1+n('vat')/100);
h+='<div class="kpis"><div class="kpi good"><b>'+f(P)+'</b><span>السعر المقترح قبل الضريبة</span></div><div class="kpi"><b>'+f(withVat)+'</b><span>السعر شاملًا الضريبة</span></div><div class="kpi"><b>'+f(P-fixed-P*pct)+'</b><span>ربح الوحدة الصافي</span></div></div>';
const be=fixed/(1-pct);h+='<p>سعر التعادل (ربح صفر): <b>'+f(be)+'</b> ريال قبل الضريبة.</p>';
const mp=n('myprice');if(mp>0){const prof=mp-fixed-mp*pct;const mg=prof/mp*100;h+='<p>عند سعرك '+f(mp)+': ربح الوحدة <b>'+f(prof)+'</b> ريال وهامش صافٍ <b>'+f(mg,1)+'%</b> '+(mg<10?'⚠️ هامش ضعيف':mg>=n('target')?'✅ يحقق الهدف':'')+'.</p>'}
h+='<p class="muted">الحساب تقديري. راجع وضعك الضريبي مع الجهة الرسمية أو محاسب.</p>';$('out').innerHTML=h}calc();"""))

# 2 roas
TOOLS.append(("roas-breakeven", "📈", "حاسبة ROAS ونقطة التعادل",
 "اعرف أقل ROAS تحتاجه حتى لا تخسر، وأقصى تكلفة تدفعها للحصول على عميل، وقيّم حملتك الحالية.",
 '<div class="row2">' + fld("price","سعر البيع قبل الضريبة (ريال)","100") + fld("vc","التكاليف المتغيرة بدون إعلان (ريال)","55","","منتج + شحن + عمولات + مرتجعات") + fld("goal","هامش ربح مستهدف بعد الإعلان %","10") +
 fld("spend","إنفاق الحملة الحالي (ريال)","","","اختياري") + fld("rev","إيراد الحملة (ريال)","","","اختياري") + '</div><button class="btn btn-g" id="go">احسب</button><div class="result" id="out" aria-live="polite"></div>',
 """$('go').onclick=calc;document.querySelectorAll('input').forEach(i=>i.oninput=calc);
function calc(){const p=n('price'),vc=n('vc');const gm=p-vc;if(p<=0||gm<=0){$('out').innerHTML='التكاليف تتجاوز السعر: لا يوجد هامش قبل الإعلان.';return}
const m=gm/p;const be=1/m;const tg=n('goal')/100;const tgR=(m-tg)>0?1/(m-tg):0;
let h='<div class="kpis"><div class="kpi"><b>'+f(m*100,1)+'%</b><span>الهامش قبل الإعلان</span></div><div class="kpi bad"><b>'+f(be)+'</b><span>ROAS التعادل</span></div><div class="kpi"><b>'+f(gm)+'</b><span>أقصى CPA للتعادل</span></div><div class="kpi good"><b>'+(tgR?f(tgR):'—')+'</b><span>ROAS لهدفك</span></div></div>';
if(tgR)h+='<p>للحصول على ربح '+f(n('goal'),0)+'% بعد الإعلان اجعل CPA ≤ <b>'+f(gm-p*tg)+'</b> ريال.</p>';
if(n('spend')>0){const r=n('rev')/n('spend');const profit=(n('rev')/p)*gm-n('spend');h+='<p>ROAS حملتك: <b>'+f(r)+'</b> — '+(r>=be?'✅ فوق التعادل':'⚠️ تحت التعادل')+'. الربح التقريبي بعد الإعلان: <b>'+f(profit)+'</b> ريال.</p>'}
$('out').innerHTML=h}calc();"""))

# 3 supplier message
TOOLS.append(("supplier-message", "✉️", "مولّد رسالة المورد (RFQ)",
 "اكتب رسالة طلب عرض سعر واضحة للمورد بالإنجليزية والعربية، جاهزة للنسخ.",
 '<div class="row2"><label class="field">اسم المنتج<input id="pn" value="Silicone phone case"></label><label class="field">المواصفات<textarea id="sp" rows="2">Material: silicone, colors: black/blue, size: iPhone 15</textarea></label>'
 '<label class="field">الكمية التجريبية<input id="q1" type="number" value="200"></label><label class="field">الكمية المتوقعة لاحقًا<input id="q2" type="number" value="2000"></label>'
 '<label class="field">بلد الوجهة<input id="co" value="Saudi Arabia"></label><label class="field">طريقة الشحن<select id="sh"><option>Air freight</option><option>Sea freight</option><option>Express (DHL/FedEx)</option></select></label>'
 '<label class="field">التغليف<input id="pk" value="Individual OPP bag + custom logo box"></label><label class="field">اسمك / شركتك<input id="me" value=""></label></div>'
 '<button class="btn btn-g" id="go">ولّد الرسالة</button><div class="result"><pre class="tpl" id="out" dir="ltr" style="text-align:left"></pre><button class="btn btn-s" id="cp">نسخ</button> <span id="ok"></span></div>',
 """const V=id=>$(id).value;
function gen(){$('out').textContent='Hello,\\n\\nI am interested in '+V('pn')+' and would like a quotation.\\n\\nSpecifications: '+V('sp')+'\\nTrial order: '+V('q1')+' units\\nExpected future volume: '+V('q2')+' units\\nDestination: '+V('co')+' ('+V('sh')+')\\nPackaging: '+V('pk')+'\\n\\nPlease confirm:\\n1. Unit price at each quantity tier\\n2. MOQ\\n3. Sample price and lead time\\n4. Production time\\n5. Payment terms\\n6. Defect/replacement policy\\n7. Trade term (EXW/FOB) and shipping estimate\\n\\nThank you,\\n'+(V('me')||'[Your name]')}
$('go').onclick=gen;document.querySelectorAll('input,select,textarea').forEach(i=>i.oninput=gen);
$('cp').onclick=()=>{navigator.clipboard.writeText($('out').textContent).then(()=>{$('ok').textContent='✅ تم النسخ'},()=>{$('ok').textContent='انسخ يدويًا'})};gen();"""))

# 4 compare
TOOLS.append(("supplier-compare", "⚖️", "جدول مقارنة الموردين",
 "قارن حتى 3 موردين (أو منصات أو خيارات) بمعايير موزونة ليظهر الأفضل بالأرقام.",
 '<p class="muted">قيّم كل خيار من 1 (ضعيف) إلى 5 (ممتاز) وحدّد وزن كل معيار من 1 إلى 5.</p><div id="tb"></div><div class="result" id="out" aria-live="polite"></div>',
 """const C=['السعر','الجودة (عينة)','سرعة التوريد','MOQ مناسب','التواصل والرد','سياسة العيوب','سمعة المورد'];
let h='<table class="t"><tr><th>المعيار</th><th>الوزن</th><th><input class="nm" value="المورد أ" size="8"></th><th><input class="nm" value="المورد ب" size="8"></th><th><input class="nm" value="المورد ج" size="8"></th></tr>';
C.forEach((c,i)=>{h+='<tr><td>'+c+'</td><td><input type="number" min="1" max="5" value="3" data-w="'+i+'" style="width:56px"></td>'+[0,1,2].map(s=>'<td><input type="number" min="1" max="5" value="3" data-s="'+s+'" data-r="'+i+'" style="width:56px"></td>').join('')+'</tr>'});
$('tb').innerHTML=h+'</table>';
function calc(){const w=[...document.querySelectorAll('[data-w]')].map(x=>+x.value||0);const sw=w.reduce((a,b)=>a+b,0)||1;const names=[...document.querySelectorAll('.nm')].map(x=>x.value);
const tot=[0,1,2].map(s=>{let t=0;document.querySelectorAll('[data-s="'+s+'"]').forEach(x=>{t+=(+x.value||0)*w[+x.dataset.r]});return t/sw});
const best=tot.indexOf(Math.max(...tot));$('out').innerHTML='<div class="kpis">'+tot.map((t,i)=>'<div class="kpi'+(i==best?' good':'')+'"><b>'+t.toFixed(2)+'</b><span>'+names[i]+'</span></div>').join('')+'</div><p>الأعلى تقييمًا: <b>'+names[best]+'</b>. الأرقام تساعد القرار ولا تغني عن فحص العينة.</p>'}
document.addEventListener('input',calc);calc();"""))

# 5 idea score
TOOLS.append(("product-idea-score", "🎯", "مقيّم فكرة المنتج",
 "قيّم فكرة منتجك بسبعة معايير واحصل على درجة ونصيحة قبل أن تشتري المخزون.",
 '<div id="qs"></div><div class="result"><div class="meter"><i id="bar"></i></div><p id="out" aria-live="polite"></p></div>',
 """const Q=[['الطلب: هل يبحث الناس عنه؟','لا يوجد طلب واضح|طلب محدود|طلب جيد|طلب قوي ومتزايد'],['الهامش بعد الشحن والإعلان','ضعيف جدًا|مقبول|جيد|ممتاز'],['الحجم والوزن','كبير وثقيل|متوسط|صغير|صغير وخفيف'],['قابلية الكسر والعيوب','هشّ جدًا|بعض المخاطر|قليلة|متينة'],['المنافسة وإمكانية التميز','مشبع بلا ميزة|منافسة شديدة|زاوية تميز ممكنة|سوق مفتوح'],['إمكانية ضبط الجودة','صعبة|متوسطة|جيدة|مضمونة بعينة وتعاقد'],['خلوّه من القيود النظامية','مقيّد أو غير معروف|يحتاج تحققًا|غالبًا خالٍ|متحقق منه رسميًا']];
$('qs').innerHTML=Q.map((q,i)=>'<label class="field">'+(i+1)+') '+q[0]+'<select data-i="'+i+'">'+q[1].split('|').map((o,j)=>'<option value="'+(j+1)+'"'+(j==1?' selected':'')+'>'+o+'</option>').join('')+'</select></label>').join('');
function calc(){const v=[...document.querySelectorAll('select')].map(s=>+s.value);const t=v.reduce((a,b)=>a+b,0);const pct=Math.round((t-7)/21*100);$('bar').style.width=pct+'%';
let m=pct>=70?'✅ فكرة قوية: اطلب عينة وابدأ بكمية تجريبية.':pct>=45?'🟡 فكرة متوسطة: حسّن النقاط الضعيفة أو اختبر الطلب بإعلان صغير قبل الشراء.':'🔴 فكرة ضعيفة حاليًا: ابحث عن بديل أو غيّر الزاوية.';
const weak=v.map((x,i)=>[x,i]).filter(a=>a[0]<=1).map(a=>Q[a[1]][0].split(':')[0]);if(weak.length)m+=' نقاط الضعف: '+weak.join('، ')+'.';$('out').innerHTML='<b>'+pct+'/100</b> — '+m}
document.addEventListener('change',calc);calc();"""))

# 6 checklist
chk_html = ''.join(f'<h3>{g}</h3>' + ''.join(f'<label class="chk"><input type="checkbox" data-k="{gi}-{ii}"><span>{t}</span></label>' for ii, t in enumerate(items)) for gi, (g, items) in enumerate(LAUNCH_CHECKLIST))
TOOLS.append(("launch-checklist", "✅", "قائمة إطلاق المتجر",
 "قائمة تحقق كاملة من الفكرة حتى أول طلب، تُحفظ تلقائيًا في متصفحك.",
 '<div class="meter"><i id="bar"></i></div><p id="out"></p>' + chk_html + '<button class="btn btn-s" id="rs">مسح التقدم</button>',
 """const K='diamond-ecom-launch-v1';let S={};try{S=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){}
const bx=[...document.querySelectorAll('[data-k]')];bx.forEach(b=>{b.checked=!!S[b.dataset.k];b.onchange=upd});
function upd(){const d={};bx.forEach(b=>{if(b.checked)d[b.dataset.k]=1});try{localStorage.setItem(K,JSON.stringify(d))}catch(e){}const c=Object.keys(d).length;const p=Math.round(c/bx.length*100);$('bar').style.width=p+'%';$('out').textContent='أنجزت '+c+' من '+bx.length+' ('+p+'%)'}
$('rs').onclick=()=>{bx.forEach(b=>b.checked=false);upd()};upd();"""))

# 7 description
TOOLS.append(("product-description", "📝", "مولّد وصف المنتج",
 "حوّل مواصفات منتجك إلى وصف مقنع بالبنية الخماسية، ثم عدّله بلمستك.",
 '<div class="row2"><label class="field">اسم المنتج<input id="a" value="حافظة سيليكون للجوال"></label><label class="field">الفائدة الأهم<input id="b" value="تحمي جوالك من السقوط وتمنحك قبضة مريحة"></label>'
 '<label class="field">لمن؟<input id="c" value="كل من يستخدم جواله يوميًا"></label><label class="field">المواصفات (سطر لكل نقطة)<textarea id="d" rows="4">سيليكون ناعم\nمقاوم للخدوش\nيدعم الشحن اللاسلكي</textarea></label>'
 '<label class="field">اعتراض شائع وردّك<input id="e" value="هل تناسب جوالي؟ نوضح الموديلات المدعومة في القائمة أعلاه"></label><label class="field">دعوة الشراء<input id="g" value="اطلبها الآن واستلمها خلال أيام"></label></div>'
 '<button class="btn btn-g" id="go">ولّد الوصف</button><div class="result"><pre class="tpl" id="out"></pre><button class="btn btn-s" id="cp">نسخ</button> <span id="ok"></span></div>',
 """const V=id=>$(id).value.trim();
function gen(){const pts=V('d').split('\\n').filter(Boolean).map(x=>'• '+x).join('\\n');$('out').textContent=V('a')+' — '+V('b')+'\\n\\nمثالية لـ'+V('c')+'. '+V('b')+'.\\n\\nالمواصفات:\\n'+pts+'\\n\\n'+V('e')+'\\n\\n'+V('g')+' ✨'}
$('go').onclick=gen;document.querySelectorAll('input,textarea').forEach(i=>i.oninput=gen);
$('cp').onclick=()=>{navigator.clipboard.writeText($('out').textContent).then(()=>{$('ok').textContent='✅ تم النسخ'},()=>{$('ok').textContent='انسخ يدويًا'})};gen();"""))
