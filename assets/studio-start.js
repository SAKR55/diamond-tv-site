/* شاشة «مشروع جديد» + تحسينات واجهة المحرر */
(function(){
var SD=window.SD,S=window.Studio;if(!SD||!S)return;
var root,ov;
function $(s,r){return (r||document).querySelector(s)}
var IC={
 undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',redo:'<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
 grid:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',magnet:'<path d="M6 15a6 6 0 0 0 12 0V3h-4v12a2 2 0 0 1-4 0V3H6z"/><path d="M6 8h4M14 8h4"/>',
 save:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',open:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 proj:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 multi:'<rect x="3" y="5" width="12" height="14" rx="1"/><path d="M18 8h3v11H9"/>',video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
 keys:'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',focus:'<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/>'};
function ic(n,l){return '<svg class="ico" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>'+(l?'<span class="bl">'+l+'</span>':'')}
function setBtn(id,n,l,title){var b=$('#'+id);if(!b)return;b.innerHTML=ic(n,l);if(title)b.title=title;b.setAttribute('aria-label',title||l||id)}
function polish(){
 setBtn('st-undo','undo','','تراجع (Ctrl+Z)');setBtn('st-redo','redo','','إعادة (Ctrl+Shift+Z)');setBtn('st-zo','minus','','تصغير');setBtn('st-zi','plus','','تكبير');setBtn('st-fit','fit','ملاءمة','ملاءمة الشاشة');
 setBtn('st-grid','grid','','إظهار الشبكة');setBtn('st-snap','magnet','','مغناطيس الشبكة');
 setBtn('st-new','plus','جديد','مشروع جديد');setBtn('st-save','save','حفظ','حفظ في المتصفح');setBtn('st-open','open','فتح','افتح صورة أو ملف مشروع');
 setBtn('st-proj2','proj','مشاريعي');setBtn('st-multi','multi','مقاسات');setBtn('st-video','video','إلى الفيديو','أرسل التصميم كمشهد لاستوديو الفيديو');
 var nw=$('#st-new');if(nw)nw.classList.add('prim');
 var tb=$('#st-tabs');if(tb){[].forEach.call(tb.querySelectorAll('button'),function(b){if(b.dataset.ui)return;var t=b.textContent.trim(),m=t.match(/^(\S+)\s+(.*)$/);if(m){b.innerHTML='<i>'+m[1]+'</i><span>'+m[2]+'</span>';b.dataset.ui=1}})}
 var tp=$('.st-top .st-grp:last-child');
 if(tp&&!$('#st-keys')){var k=document.createElement('button');k.id='st-keys';k.type='button';k.innerHTML=ic('keys','');k.title='اختصارات لوحة المفاتيح';k.onclick=keys;var f=document.createElement('button');f.id='st-focus';f.type='button';f.innerHTML=ic('focus','');f.title='وضع التركيز: إخفاء اللوحات';f.onclick=function(){root.classList.toggle('focus');this.classList.toggle('on');setTimeout(S.api.fit,80)};tp.appendChild(k);tp.appendChild(f)}
 var nb=$('#st-new');if(nb)nb.onclick=function(){start(true)};
}
function keys(){var m=document.createElement('div');m.className='st-modal';m.onclick=function(e){if(e.target===m)m.remove()};
 var L=[['Ctrl + Z / Y','تراجع / إعادة'],['Ctrl + D','تكرار العنصر'],['Ctrl + C / V','نسخ / لصق'],['Ctrl + A','تحديد الكل'],['Delete','حذف المحدد'],['الأسهم','تحريك 1px (مع Shift: 10px)'],['Esc','إلغاء التحديد'],['Ctrl + عجلة الماوس','تكبير وتصغير'],['سحب صورة إلى الصفحة','إضافتها مباشرة'],['Ctrl + V (صورة منسوخة)','لصقها في التصميم']];
 m.innerHTML='<div class="st-mbox"><h3 style="margin:0 0 10px">⌨️ اختصارات المحرر</h3><table class="st-kt">'+L.map(function(r){return '<tr><td><kbd>'+r[0]+'</kbd></td><td>'+r[1]+'</td></tr>'}).join('')+'</table><button type="button" class="st-big" onclick="this.closest(\'.st-modal\').remove()">إغلاق</button></div>';document.body.appendChild(m)}
/* ---- شاشة البداية ---- */
var CATS=[['all','الكل'],['social','السوشال ميديا'],['print','طباعة'],['screen','عروض وتطبيقات'],['ads','إعلانات وبنرات المتاجر']];
function cat(n,after){if(after)return 'ads';if(/إنستغرام|ستوري|يوتيوب|فيسبوك|X|لينكدإن|واتساب/.test(n))return 'social';if(/بوستر|فلاير|بطاقة/.test(n))return 'print';return 'screen'}
function list(){var a=[],after=false;SD.sizes.forEach(function(z,i){if(!z[1]){after=true;return}a.push({i:i,n:z[0],w:z[1],h:z[2],c:cat(z[0],after)})});return a}
function saved(){try{var s=JSON.parse(localStorage.getItem('dh_studio_prev')||localStorage.getItem('dh_studio'));if(s&&s.els&&(s.els.length||s.bg))return s}catch(e){}return null}
function create(w,h,tpl){var d={w:w,h:h,bg:{t:'solid',c:['#ffffff']},els:[],assets:{}};S.api.setD(d);var idx=SD.sizes.findIndex(function(z){return z[1]===w&&z[2]===h});var sel=$('#st-size');if(sel)sel.value=idx>-1?idx:'0';close();var tb=$('#st-tabs [data-t="tpl"]');if(tb)tb.click();S.api.toast('✨ مشروع جديد '+w+'×'+h)}
function close(){if(ov){ov.remove();ov=null}}
function start(fromBtn){close();var cur='all',q='',all=list(),sv=saved();ov=document.createElement('div');ov.className='st-start';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','مشروع جديد');
 ov.innerHTML='<div class="st-sbox"><button type="button" class="st-sx" aria-label="إغلاق">✕</button><div class="st-sh"><div><h2>مشروع جديد</h2><p>اختر المقاس المناسب للمنصة التي ستنشر عليها، أو افتح عملك السابق.</p></div></div>'+
 '<div class="st-sq"><input type="search" id="st-sq" placeholder="ابحث عن مقاس: ستوري، يوتيوب، بطاقة…" aria-label="بحث"></div><div class="st-schips" id="st-sc"></div><div class="st-sgrid" id="st-sg2"></div>'+
 '<div class="st-sbot"><div class="st-cust"><b>مقاس مخصص</b><input type="number" id="st-cw2" value="1080" min="50" max="6000" aria-label="العرض"><span>×</span><input type="number" id="st-ch2" value="1080" min="50" max="6000" aria-label="الارتفاع"><button type="button" class="st-go" id="st-cgo">إنشاء</button></div>'+
 '<div class="st-acts" id="st-acts"></div></div></div>';
 root.appendChild(ov);
 function draw(){$('#st-sc',ov).innerHTML=CATS.map(function(c){return '<button type="button" data-c="'+c[0]+'" class="'+(cur===c[0]?'on':'')+'">'+c[1]+'</button>'}).join('');
  var f=all.filter(function(z){return (cur==='all'||z.c===cur)&&(!q||z.n.indexOf(q)>-1||(z.w+'×'+z.h).indexOf(q)>-1)});
  $('#st-sg2',ov).innerHTML=f.length?f.map(function(z){var r=z.w/z.h,w=r>=1?46:Math.max(14,46*r),h=r>=1?Math.max(10,46/r):46;return '<button type="button" class="st-sc" data-i="'+z.i+'"><span class="st-thumb"><i style="width:'+w+'px;height:'+h+'px"></i></span><b>'+z.n+'</b><small>'+z.w+' × '+z.h+'</small></button>'}).join(''):'<p class="st-none">لا توجد مقاسات مطابقة.</p>';
  [].forEach.call(ov.querySelectorAll('#st-sc button'),function(b){b.onclick=function(){cur=b.dataset.c;draw()}});
  [].forEach.call(ov.querySelectorAll('.st-sc'),function(b){b.onclick=function(){var z=SD.sizes[+b.dataset.i];create(z[1],z[2])}})}
 draw();$('#st-sq',ov).oninput=function(){q=this.value.trim();draw()};
 $('#st-cgo',ov).onclick=function(){var w=Math.round(+$('#st-cw2',ov).value),h=Math.round(+$('#st-ch2',ov).value);if(w>=50&&h>=50&&w<=6000&&h<=6000)create(w,h);else S.api.toast('أدخل أبعادًا بين 50 و6000 بكسل')};
 var A=$('#st-acts',ov),btn=function(t,fn,cls){var b=document.createElement('button');b.type='button';b.className=cls||'st-ghost';b.innerHTML=t;b.onclick=fn;A.appendChild(b)};
 if(sv)btn('↩ متابعة آخر مشروع <small>('+sv.w+'×'+sv.h+')</small>',function(){try{S.api.setD(sv);var i=SD.sizes.findIndex(function(z){return z[1]===sv.w&&z[2]===sv.h}),sl=$('#st-size');if(sl)sl.value=i>-1?i:'c'}catch(e){}close()},'st-go');
 btn('📂 فتح صورة أو مشروع',function(){close();$('#st-open').click()});
 var pj=$('#st-proj2');if(pj)btn('📁 مشاريعي',function(){close();pj.click()});
 $('.st-sx',ov).onclick=close;ov.addEventListener('click',function(e){if(e.target===ov)close()});
 ov.addEventListener('keydown',function(e){if(e.key==='Escape')close()});setTimeout(function(){var i=$('#st-sq',ov);if(i)i.focus()},50)}

/* ---- ترتيب التبويبات في مجموعات ---- */
var GR=[['ابدأ من هنا',['tpl','bg','mat','brand']],['أضف إلى التصميم',['text','shape','icon','orn','logo','img','elm']],['أدوات وتحكّم',['fx','ext','lay']]];
var LB={ext:['🚀','إضافات متقدمة']};
function organize(){var t=$('#st-tabs');if(!t||t.dataset.org==='1'&&t.querySelectorAll('.st-tg').length===GR.length&&!t.querySelector(':scope>button'))return;
 var by={};[].forEach.call(t.querySelectorAll('button'),function(b){by[b.dataset.t]=b});
 var need=['tpl','bg','mat','orn'];if(need.some(function(k){return !by[k]}))return setTimeout(organize,300);
 var used={};t.innerHTML='';
 GR.forEach(function(g){var w=document.createElement('div');w.className='st-tg';w.innerHTML='<div class="st-tgl">'+g[0]+'</div>';var gr=document.createElement('div');gr.className='st-tgg';g[1].forEach(function(k){if(by[k]){if(LB[k]){by[k].innerHTML='<i>'+LB[k][0]+'</i><span>'+LB[k][1]+'</span>'}gr.appendChild(by[k]);used[k]=1}});w.appendChild(gr);t.appendChild(w)});
 var rest=Object.keys(by).filter(function(k){return !used[k]});if(rest.length){var w=document.createElement('div');w.className='st-tg';w.innerHTML='<div class="st-tgl">أخرى</div>';var gr=document.createElement('div');gr.className='st-tgg';rest.forEach(function(k){gr.appendChild(by[k])});w.appendChild(gr);t.appendChild(w)}
 t.dataset.org='1'}
function emptyCard(){var st=$('#st-stage');if(!st)return;var c=$('#st-empty'),D=S.api.D(),show=D.els.length===0&&!ov&&!(D.pages&&D.pages.length>1);
 if(!show){if(c)c.remove();return}if(c)return;c=document.createElement('div');c.id='st-empty';c.className='st-empty';
 c.innerHTML='<b>لوحة بيضاء جاهزة</b><span>ابدأ بإضافة عنصر أو اختر قالبًا من اللوحة اليمنى</span><div><button type="button" data-a="text">🔤 نص</button><button type="button" data-a="tpl">🎨 قالب</button><button type="button" data-a="img">🖼️ صورة</button><button type="button" data-a="shape">◼ شكل</button><button type="button" data-a="orn">💠 زخرفة</button></div>';
 c.onclick=function(e){var b=e.target.closest('button');if(!b)return;var a=b.dataset.a;if(a==='img'){$('#st-file').click();return}var t=$('#st-tabs [data-t="'+a+'"]');if(t)t.click()};st.appendChild(c)}
function boot(){root=document.getElementById('studio');if(!root||!$('.st-top',root)){return setTimeout(boot,120)}
 polish();setTimeout(organize,500);setTimeout(organize,1400);var skip0=/[?&]tpl=/.test(location.search)||location.hash==='#continue'||location.hash==='#edit';if(!skip0){try{var cur=JSON.parse(localStorage.getItem('dh_studio'));if(cur&&cur.els&&cur.els.length)localStorage.setItem('dh_studio_prev',JSON.stringify(cur));var D0=S.api.D();if(D0.els.length||D0.pages){S.api.setD({w:1080,h:1080,bg:{t:'solid',c:['#ffffff']},els:[],assets:{}});var sl0=$('#st-size');if(sl0)sl0.value='0'}}catch(e){}}var skip=/[?&]tpl=/.test(location.search)||location.hash==='#continue'||location.hash==='#edit';if(!skip)start();
 setInterval(emptyCard,500);var obs=new MutationObserver(function(){polish()});var t=$('#st-tabs');if(t)obs.observe(t,{childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,0)});else setTimeout(boot,0);
})();

/* hub: tools as a grid; click a tool to show only its options */
(function(){
function hub(name,extra,intro){var O=SD.tabFn[name];if(!O)return;
 SD.tabFn[name]=function(p){var t=document.createElement('div');t.className='tl-wrap';O(t);var nodes=[].slice.call(t.childNodes),panels=[],cur=null;
  nodes.forEach(function(n){if(n.nodeName==='H4'){cur={t:n.textContent.trim(),n:[]};panels.push(cur)}else if(cur)cur.n.push(n)});
  if(extra)extra.forEach(function(e){var c=document.createElement('div');e.fn(c);panels.push({t:e.t,n:[c]})});
  t.innerHTML='';var grid=document.createElement('div');grid.className='tl-grid';
  var intr=document.createElement('p');intr.className='st-hint';intr.textContent=intro;
  panels.forEach(function(c){var w=document.createElement('div');w.className='tl-panel';w.hidden=true;
   var bar=document.createElement('button');bar.type='button';bar.className='tl-back';bar.textContent='→ كل الأدوات';w.appendChild(bar);
   var h=document.createElement('div');h.className='tl-title';h.textContent=c.t;w.appendChild(h);c.n.forEach(function(x){w.appendChild(x)});t.appendChild(w);
   var m=c.t.match(/^(\S+)\s+(.*)$/),ic=m?m[1]:'🔧',lb=(m?m[2]:c.t).replace(/\s*\(.*\)\s*$/,'');
   var b=document.createElement('button');b.type='button';b.className='tl-btn';b.innerHTML='<i>'+ic+'</i><span>'+lb+'</span>';
   b.onclick=function(){grid.hidden=true;intr.hidden=true;w.hidden=false;p.scrollTop=0};bar.onclick=function(){w.hidden=true;grid.hidden=false;intr.hidden=false};grid.appendChild(b)});
  p.innerHTML='';p.appendChild(intr);p.appendChild(grid);p.appendChild(t)}}
hub('ext',[{t:'🛠 مساعد التصميم',fn:function(c){SD.tabFn.help(c)}}],'اختر أداة لتظهر خياراتها هنا:');
hub('fx',null,'اختر أداة لتظهر خياراتها هنا:');
})();
