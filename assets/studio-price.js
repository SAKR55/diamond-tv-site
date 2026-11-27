/* DIAMOND Studio — بطاقة سعر قابلة للتحرير + استيراد المجلات وأوراق الأسعار كطبقات (تستخدم assets/pricetag.js) */
(function(){
var SD=window.SD;if(!SD||!SD.tabFn||!SD.tabFn.ext)return;
var orig=SD.tabFn.ext,loading=null;
function load(){if(window.PriceTag)return Promise.resolve();if(loading)return loading;loading=new Promise(function(ok,no){var s=document.createElement('script');s.src='/assets/pricetag.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});return loading}
var SZ=[['1080x1080','مربع 1080×1080'],['1080x1350','بوست 4:5'],['1080x1920','ستوري 9:16'],['1200x800','أفقي 3:2'],['1200x400','شريط 3:1'],['800x1100','ملصق رف']];
SD.tabFn.ext=function(p){orig(p);var a=window.Studio.api;
 var box=document.createElement('div');
 box.innerHTML='<h4>🏷 بطاقة سعر / عرض</h4><p class="st-hint">بطاقة سعر جاهزة بـ 20 تصميمًا تُدرج كطبقات: كل نص (الاسم، السعر، السعر القديم…) عنصر مستقل تعدّله وتحرّكه وتغيّر خطه ولونه. لأوراق A4 كاملة استخدم <a href="/tools/price-tag-generator/" target="_blank">مولّد بطاقات الأسعار</a> ثم «افتح في الاستوديو».</p>'+
 '<input class="st-search" id="pc-n" placeholder="اسم المنتج" value="اسم المنتج"><div class="st-row"><label>السعر <input id="pc-p" value="49.99" style="width:70px"></label><label>القديم <input id="pc-o" value="79.99" style="width:70px"></label></div><input class="st-search" id="pc-nt" placeholder="ملاحظة (اختياري)"><input class="st-search" id="pc-b" placeholder="نص الشارة مثل: عرض خاطف" value="خصم">'+
 '<div class="st-row"><label>القالب <select id="pc-t"></select></label></div><div class="st-row"><label>الألوان <select id="pc-c"></select></label><label>الخط <select id="pc-f"></select></label></div><div class="st-row"><label>العملة <input id="pc-cu" value="ر.س" style="width:56px"></label><label>الحجم <select id="pc-z"></select></label></div>'+
 '<label class="st-row"><input type="checkbox" id="pc-ed" checked> طبقات قابلة للتحرير (نصوص منفصلة)</label><button class="st-big" id="pc-go">➕ أدرج بطاقة السعر</button>'+
 '<h4>📰 مجلة عروض / كتالوج</h4><p class="st-hint">صمّم المجلة في <a href="/tools/offers-catalog-maker/" target="_blank">صانع المجلات</a> ثم اضغط «افتح في الاستوديو»؛ تصل كل صفحة هنا بنصوصها وصورها كعناصر تتحكم بها بالكامل.</p><button class="st-big" id="pc-imp" style="background:#334155">📥 استيراد آخر مجلة / ورقة أسعار أُرسلت</button>';
 while(box.firstChild)p.appendChild(box.firstChild);
 var q=function(s){return p.querySelector(s)};
 SZ.forEach(function(z){q('#pc-z').add(new Option(z[1],z[0]))});
 load().then(function(){var P=window.PriceTag;P.TPL.forEach(function(t){q('#pc-t').add(new Option(t[1],t[0]))});P.PAL.forEach(function(c,i){q('#pc-c').add(new Option(c[4],i))});P.FONTS.forEach(function(f){q('#pc-f').add(new Option(f,f))})});
 q('#pc-go').onclick=function(){var b=this;b.disabled=true;load().then(function(){var P=window.PriceTag,z=q('#pc-z').value.split('x'),w=+z[0],h=+z[1],pal=P.PAL[+q('#pc-c').value||0],ff=q('#pc-f').value;
   var o={tpl:q('#pc-t').value,ff:ff,c:pal.slice(0,4),s:{badge:q('#pc-b').value,cur:q('#pc-cu').value,pos:'after',dec:'auto',dig:'latin',sbar:1,border:1,rad:18,store:'',vfor:'',showBc:0,showQr:0,lpos:'top',lsz:60}};
   var row={n:q('#pc-n').value,p:q('#pc-p').value,o:q('#pc-o').value,nt:q('#pc-nt').value,b:'',im:null};
   return P.fonts(ff).then(function(){
    if(q('#pc-ed').checked){var L=P.layers(row,o,w,h),D=a.D(),sc=Math.min(D.w*.9/w,D.h*.9/h),els=P.toEls(L,(D.w-w*sc)/2,(D.h-h*sc)/2,sc,a.addAsset,'');els=a.norm(els);els.forEach(function(e){D.els.push(e)});a.setSel(els.map(function(e){return e.id}));a.push();a.draw();a.props();a.toast('✅ أُدرجت البطاقة كطبقات قابلة للتحرير')}
    else{var c=P.makeSync(row,o,w,h),k=a.addAsset(c.toDataURL('image/png'));a.addImage(k,c.width/c.height);a.toast('✅ أُدرجت البطاقة')}})}).catch(function(e){a.toast('تعذّر: '+(e&&e.message||'')) }).then(function(){b.disabled=false})};
 q('#pc-imp').onclick=function(){importBridge(true)};
};
/* ---- استيراد من المجلات وأوراق الأسعار ---- */
function idbGet(cb){try{var rq=indexedDB.open('dh_bridge',1);rq.onupgradeneeded=function(){rq.result.createObjectStore('kv')};rq.onsuccess=function(){var g=rq.result.transaction('kv','readonly').objectStore('kv').get('studio-import');g.onsuccess=function(){cb(g.result)};g.onerror=function(){cb(null)}};rq.onerror=function(){cb(null)}}catch(e){cb(null)}}
function importBridge(manual){var a=window.Studio&&window.Studio.api;if(!a||!a.D()){return setTimeout(function(){importBridge(manual)},300)}
 idbGet(function(d){if(!d){if(manual)a.toast('لا يوجد شيء مُرسل بعد');return}
  var st=document.querySelector('.st-start');if(st)st.remove();
  var pages=(d.pages||[{bg:d.bg,els:d.els}]).map(function(pg){return{bg:pg.bg,els:a.norm(pg.els)}});
  var D={w:d.w,h:d.h,bg:pages[0].bg,els:pages[0].els,assets:d.assets||{},pages:pages,pi:0};
  a.setD(D);a.toast('✅ تم الاستيراد: '+pages.length+' صفحة قابلة للتحرير')})}
if(/[?&]import=1/.test(location.search)){setTimeout(function(){importBridge(false)},900)}
})();
