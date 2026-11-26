# -*- coding: utf-8 -*-
"""صفحة حسابي /account/ + تقرير الزوار /admin/visitors/ — تشغيل: python3 scripts/build_account.py"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from portal_common import *

CSS = '''<style>
.acc{max-width:560px;margin:0 auto}.acc .card{padding:22px}.acc label{display:block;font-weight:700;margin:12px 0 5px;font-size:.92em}.acc input{width:100%;padding:12px 14px;border:1px solid #d6d3e6;border-radius:12px;font:inherit;background:#fff}
.acc .tabs{display:flex;gap:8px;margin-bottom:6px}.acc .tabs button{flex:1;padding:10px;border-radius:12px;border:1px solid #d6d3e6;background:#fff;font:inherit;font-weight:800;cursor:pointer}.acc .tabs button.on{background:#7c3aed;color:#fff;border-color:#7c3aed}
.msg{margin-top:12px;padding:10px 12px;border-radius:10px;font-size:.92em;display:none}.msg.ok{display:block;background:#ecfdf5;color:#065f46}.msg.er{display:block;background:#fef2f2;color:#991b1b}
.acc .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.acc .btn{cursor:pointer}.acc .mut{color:#64748b;font-size:.88em;line-height:1.8}.acc a.lnk{color:#6d28d9;cursor:pointer;font-weight:700}
.kv{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:8px 0}.kv b{color:#475569}
</style>'''

ACCOUNT = '''<header class="phero"><div class="wrap center"><span class="pill">👤 حسابي</span><h1>حسابك في <span class="g-text">DIAMOND HUB</span></h1><p class="lead">سجّل دخولك لحفظ بياناتك (هويتك وتصاميمك وسيناريوهاتك) ومزامنتها بين أجهزتك.</p></div></header>
<main><section class="s"><div class="wrap"><div class="acc" id="acc"><div class="card" id="box">جارٍ التحميل…</div>
<p class="mut" style="text-align:center;margin-top:14px">بياناتك محمية بسياسات أمان على مستوى الصف: لا يقرأها غيرك. اقرأ <a class="lnk" href="/privacy/">سياسة الخصوصية</a>.</p></div></div></section></main>
<script src="/assets/dh-auth.js"></script><script>
(function(){
var $=function(s,r){return(r||document).querySelector(s)},box=$('#box'),mode='in';
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function msg(t,k){var m=$('#m');if(!m)return;m.className='msg '+(k||'er');m.textContent=t}
function authView(){
 box.innerHTML='<div class="tabs"><button data-m="in" class="'+(mode==='in'?'on':'')+'">تسجيل الدخول</button><button data-m="up" class="'+(mode==='up'?'on':'')+'">حساب جديد</button></div>'+
 (mode==='up'?'<label>الاسم</label><input id="nm" autocomplete="name" placeholder="اسمك">':'')+
 '<label>البريد الإلكتروني</label><input id="em" type="email" autocomplete="email" dir="ltr" placeholder="you@example.com"><label>كلمة المرور</label><input id="pw" type="password" autocomplete="'+(mode==='up'?'new-password':'current-password')+'" dir="ltr" placeholder="6 أحرف على الأقل">'+
 '<div class="row"><button class="btn btn-g" id="go">'+(mode==='up'?'إنشاء الحساب':'دخول')+'</button></div>'+
 (mode==='in'?'<p class="mut"><a class="lnk" id="fg">نسيت كلمة المرور؟</a></p>':'<p class="mut">قد تصلك رسالة تأكيد على بريدك قبل أول دخول.</p>')+'<div class="msg" id="m"></div>';
 box.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){mode=b.dataset.m;authView()}});
 $('#go').onclick=async function(){var em=$('#em').value.trim(),pw=$('#pw').value;if(!em||!pw){msg('أدخل البريد وكلمة المرور');return}this.disabled=true;try{if(mode==='up'){var r=await DHAuth.signUp(em,pw,$('#nm').value.trim());if(r.confirm){msg('تم إنشاء الحساب. افتح بريدك وأكّد الرسالة ثم سجّل الدخول.','ok');this.disabled=false;return}}else await DHAuth.signIn(em,pw);home()}catch(e){msg(e.message);this.disabled=false}};
 var fg=$('#fg');if(fg)fg.onclick=async function(){var em=$('#em').value.trim();if(!em){msg('اكتب بريدك أولًا');return}try{await DHAuth.recover(em);msg('أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك.','ok')}catch(e){msg(e.message)}};
 box.querySelectorAll('input').forEach(function(i){i.onkeydown=function(e){if(e.key==='Enter')$('#go').click()}})}
function keys(){var o={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^(dh_|dt-)/.test(k)&&!/^(dh_auth|dh_sid|dh_vid|dh_notrack|dh_last)$/.test(k))o[k]=localStorage.getItem(k)}return o}
async function home(){var s=await DHAuth.session();if(!s){authView();return}
 var prof=null;try{var p=await DHAuth.rest('dh_profiles?id=eq.'+s.user.id+'&select=name');prof=p&&p[0]}catch(e){}
 var nm=(prof&&prof.name)||(s.user.user_metadata&&s.user.user_metadata.name)||'';
 box.innerHTML='<h2 style="margin:0 0 8px">أهلًا '+esc(nm||'بك')+' 👋</h2><div class="kv"><b>البريد</b><span dir="ltr">'+esc(s.user.email)+'</span><b>الاسم</b><span><input id="nm" value="'+esc(nm)+'" style="padding:8px 10px"></span></div>'+
 '<div class="row"><button class="btn btn-o" id="sv">حفظ الاسم</button></div><hr style="border:0;border-top:1px solid #eee;margin:18px 0"><h3 style="margin:0 0 6px">☁️ نسخ احتياطي لبياناتي</h3><p class="mut">يحفظ هويتك البصرية ومشاريع التصميم وسيناريوهات الحاسبات المخزنة في هذا المتصفح، لتستعيدها على أي جهاز.</p><div class="row"><button class="btn btn-g" id="up">⬆️ احفظ بياناتي الآن</button><button class="btn btn-o" id="dn">⬇️ استعد بياناتي</button></div><div class="row"><button class="btn btn-o" id="out">تسجيل الخروج</button></div><div class="msg" id="m"></div>';
 $('#sv').onclick=async function(){try{await DHAuth.rest('dh_profiles',{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:{id:s.user.id,name:$('#nm').value.trim()}});msg('تم الحفظ ✓','ok')}catch(e){msg(e.message)}};
 $('#up').onclick=async function(){var d=keys(),n=Object.keys(d).length;if(!n){msg('لا توجد بيانات محفوظة في هذا المتصفح بعد (جرّب المحرر أو الحاسبات أولًا).');return}try{await DHAuth.rest('dh_user_data',{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:{user_id:s.user.id,data:d,updated_at:new Date().toISOString()}});msg('تم حفظ '+n+' عنصرًا ✓','ok')}catch(e){msg(e.message)}};
 $('#dn').onclick=async function(){try{var r=await DHAuth.rest('dh_user_data?user_id=eq.'+s.user.id+'&select=data,updated_at'),d=r&&r[0]&&r[0].data;if(!d||!Object.keys(d).length){msg('لا توجد نسخة محفوظة بعد.');return}if(!confirm('سيُستبدل ما في هذا المتصفح من بيانات الموقع بالنسخة المحفوظة. متابعة؟'))return;Object.keys(d).forEach(function(k){if(/^(dh_|dt-)/.test(k))localStorage.setItem(k,d[k])});msg('استُعيد '+Object.keys(d).length+' عنصرًا ✓','ok')}catch(e){msg(e.message)}};
 $('#out').onclick=async function(){await DHAuth.signOut();mode='in';authView()}}
home();
})();</script>'''

ADMIN = '''<header class="phero"><div class="wrap center"><span class="pill">📊 للمشرف فقط</span><h1>تقرير <span class="g-text">الزوار</span></h1><p class="lead">زيارات الموقع وأكثر الصفحات والمصادر والأجهزة والمسجّلون.</p></div></header>
<main><section class="s"><div class="wrap" id="rp"><div class="card acc" style="max-width:460px;margin:auto" id="lg">جارٍ التحميل…</div></div></section></main>
<script src="/assets/dh-auth.js"></script><script>
(function(){
var $=function(s){return document.querySelector(s)},rp=$('#rp');var days=30;
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function flag(c){if(!c||c.length!==2||c==='?'||c==='XX')return'🏳';return String.fromCodePoint.apply(null,c.toUpperCase().split('').map(function(ch){return 127397+ch.charCodeAt(0)}))}
function n(x){return Number(x||0).toLocaleString('en-US')}
function login(m){rp.innerHTML='<div class="card acc" style="max-width:460px;margin:auto"><h3 style="margin:0 0 6px">دخول المشرف</h3><label>البريد</label><input id="em" type="email" dir="ltr"><label>كلمة المرور</label><input id="pw" type="password" dir="ltr"><div class="row"><button class="btn btn-g" id="go">دخول</button></div><div class="msg '+(m?'er':'')+'" id="m">'+esc(m||'')+'</div></div>';
 $('#go').onclick=async function(){try{await DHAuth.signIn($('#em').value.trim(),$('#pw').value);show()}catch(e){login(e.message)}};$('#pw').onkeydown=function(e){if(e.key==='Enter')$('#go').click()}}
function bar(rows,k,v,color){var mx=Math.max.apply(null,rows.map(function(r){return r[v]}).concat([1]));return rows.map(function(r){return'<div style="display:flex;align-items:center;gap:8px;margin:5px 0;font-size:.9em"><span style="min-width:120px;max-width:46%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" dir="auto" title="'+esc(r[k])+'">'+esc(r[k])+'</span><div style="flex:1;background:#f1ecff;border-radius:6px;height:14px"><div style="width:'+(100*r[v]/mx).toFixed(1)+'%;height:100%;background:'+(color||'#7c3aed')+';border-radius:6px"></div></div><b style="min-width:44px;text-align:left">'+n(r[v])+'</b></div>'}).join('')||'<p class="mut">لا بيانات بعد.</p>'}
function chart(d){if(!d.length)return'<p class="mut">لا بيانات بعد.</p>';var W=760,Hh=200,pad=36,mx=Math.max.apply(null,d.map(function(r){return r.views}).concat([1])),bw=(W-pad)/d.length;var s='<svg viewBox="0 0 '+W+' '+(Hh+26)+'" style="width:100%;height:auto" role="img" aria-label="الزيارات اليومية">';for(var i=0;i<=4;i++){var y=Hh-Hh*i/4;s+='<line x1="'+pad+'" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="#eee"/><text x="2" y="'+(y+4)+'" font-size="10" fill="#94a3b8">'+Math.round(mx*i/4)+'</text>'}d.forEach(function(r,i){var h=Hh*r.views/mx,x=pad+i*bw;s+='<rect x="'+(x+1)+'" y="'+(Hh-h)+'" width="'+Math.max(1,bw-2)+'" height="'+h+'" rx="2" fill="#7c3aed"><title>'+r.day+': '+r.views+' زيارة، '+r.visitors+' زائر</title></rect>';if(d.length<=16||i%Math.ceil(d.length/8)===0)s+='<text x="'+(x+bw/2)+'" y="'+(Hh+16)+'" font-size="10" fill="#64748b" text-anchor="middle">'+r.day.slice(5)+'</text>'});return s+'</svg>'}
async function show(){rp.innerHTML='<div class="card">جارٍ تحميل التقرير…</div>';var s=await DHAuth.session();if(!s){login();return}
 try{localStorage.setItem('dh_notrack','1')}catch(e){}
 var r;try{r=await DHAuth.rpc('dh_report',{p_days:days})}catch(e){rp.innerHTML='<div class="card acc" style="max-width:520px;margin:auto"><p>⚠️ '+esc(/not allowed/.test(e.message)?'هذا الحساب ليس مشرفًا. أضف بريدك إلى جدول المشرفين (انظر ملف SQL).':e.message)+'</p><div class="row"><button class="btn btn-o" id="out">تسجيل الخروج</button></div></div>';$('#out').onclick=async function(){await DHAuth.signOut();login()};return}
 var hrs=[];for(var h=0;h<24;h++){var f=(r.hours||[]).filter(function(x){return x.h===h})[0];hrs.push({h:(h<10?'0':'')+h+':00',views:f?f.views:0})}
 var K=[['⏱','صفحات/جلسة',r.pages_per_session==null?'—':r.pages_per_session],['↩️','معدل الارتداد %',r.bounce_pct==null?'—':r.bounce_pct],['👁','الزيارات',r.views],['🧑','الجلسات',r.sessions],['🧍','زوار فريدون',r.visitors],['🆕','زوار جدد',r.new_visitors],['🟢','متصلون الآن',r.online_now],['👤','مستخدمون مسجّلون',r.users_total]];
 rp.innerHTML='<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:14px"><div>'+[7,30,90,365].map(function(d){return'<button class="btn '+(d===days?'btn-g':'btn-o')+'" data-d="'+d+'" style="padding:8px 16px">'+(d===365?'سنة':d+' يومًا')+'</button>'}).join(' ')+'</div><div><button class="btn btn-o" id="rf">🔄 تحديث</button> <button class="btn btn-o" id="out">خروج</button></div></div>'+
 '<div class="grid g3" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">'+K.map(function(k){return'<div class="card" style="text-align:center"><div style="font-size:1.4em">'+k[0]+'</div><div style="font-size:1.8em;font-weight:900;color:#4c1d95">'+n(k[2])+'</div><div class="mut">'+k[1]+'</div></div>'}).join('')+'</div><br>'+
 '<div class="card"><h3 style="margin:0 0 8px">الزيارات اليومية</h3>'+chart(r.daily||[])+'</div><br><div class="grid g2"><div class="card"><h3 style="margin:0 0 8px">أكثر الصفحات زيارة</h3>'+bar(r.top_pages||[],'path','views')+'</div><div class="card"><h3 style="margin:0 0 8px">مصادر الزيارات</h3>'+bar(r.referrers||[],'ref','views','#0ea5e9')+'</div></div><br>'+
 '<div class="grid g2"><div class="card"><h3 style="margin:0 0 8px">🌍 الدول</h3>'+bar((r.countries||[]).map(function(c){return{country:flag(c.country)+' '+c.country,views:c.views}}),'country','views','#0ea5e9')+'</div><div class="card"><h3 style="margin:0 0 8px">📍 المدن</h3>'+bar(r.cities||[],'city','views','#10b981')+'</div></div><br><div class="grid g3"><div class="card"><h3 style="margin:0 0 8px">🌐 المتصفحات</h3>'+bar(r.browsers||[],'browser','views','#6366f1')+'</div><div class="card"><h3 style="margin:0 0 8px">💻 أنظمة التشغيل</h3>'+bar(r.oses||[],'os','views','#14b8a6')+'</div><div class="card"><h3 style="margin:0 0 8px">🎯 حملات / مصادر UTM</h3>'+bar(r.campaigns||[],'utm','views','#f97316')+'</div></div><br><div class="card"><h3 style="margin:0 0 8px">🚪 صفحات الدخول (أول صفحة في الجلسة)</h3>'+bar(r.entry_pages||[],'path','sessions','#a855f7')+'</div><br><div class="grid g3"><div class="card"><h3 style="margin:0 0 8px">الأجهزة</h3>'+bar(r.devices||[],'device','views','#10b981')+'</div><div class="card"><h3 style="margin:0 0 8px">لغة المتصفح</h3>'+bar(r.languages||[],'lang','views','#f59e0b')+'</div><div class="card"><h3 style="margin:0 0 8px">ساعات الذروة (توقيت الرياض)</h3>'+bar(hrs.filter(function(x){return x.views}).sort(function(a,b){return b.views-a.views}).slice(0,8),'h','views','#ec4899')+'</div></div><br>'+
 '<div class="card"><h3 style="margin:0 0 8px">آخر المسجّلين ('+n(r.users_total)+' إجمالًا) — زيارات المسجّلين: '+n(r.logged_in_views)+'</h3><div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:.9em"><tr style="text-align:right;color:#64748b"><th>البريد</th><th>الاسم</th><th>التسجيل</th><th>آخر دخول</th><th>مؤكَّد</th></tr>'+(r.users_recent||[]).map(function(u){return'<tr style="border-top:1px solid #eee"><td dir="ltr">'+esc(u.email)+'</td><td>'+esc(u.name||'—')+'</td><td>'+esc((u.created_at||'').slice(0,10))+'</td><td>'+esc((u.last_sign_in_at||'—').slice(0,10))+'</td><td>'+(u.confirmed?'✅':'—')+'</td></tr>'}).join('')+'</table></div></div>'+
 '<p class="mut" style="margin-top:12px">لا تُحسب زياراتك أنت بعد دخولك هنا. العدّاد لا يستخدم كوكيز ويتجاهل من فعّل «عدم التتبع».</p>';
 rp.querySelectorAll('[data-d]').forEach(function(b){b.onclick=function(){days=+b.dataset.d;show()}});$('#rf').onclick=show;$('#out').onclick=async function(){await DHAuth.signOut();login()}}
show();
})();</script>'''

def noindex(h): return h.replace('content="index,follow,max-image-preview:large"', 'content="noindex,nofollow"')

h = page("/account/", "حسابي | DIAMOND HUB", "سجّل الدخول لحفظ بياناتك ومزامنتها بين أجهزتك.", ACCOUNT, "", "/account/", css_extra=CSS)
write("account/index.html", noindex(h))
h2 = page("/admin/visitors/", "تقرير الزوار | DIAMOND HUB", "تقرير زوار الموقع للمشرف.", ADMIN, "", "/admin/", css_extra=CSS)
write("admin/visitors/index.html", noindex(h2))
print("account + admin/visitors built")
