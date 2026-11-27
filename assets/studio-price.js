/* DIAMOND Studio — بطاقة سعر (كل الخيارات) + صانع مجلة العروض + استيراد كطبقات قابلة للتحرير (يعتمد على pricetag.js وcatalog.js) */
(function(){
var SD=window.SD;if(!SD||!SD.tabFn||!SD.tabFn.ext)return;
var orig=SD.tabFn.ext,loading={};
function js(src,test){if(test&&test())return Promise.resolve();if(loading[src])return loading[src];loading[src]=new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)});return loading[src]}
function load(){return js('/assets/pricetag.js',function(){return window.PriceTag})}
function loadCat(){return load().then(function(){return js('/assets/qr.js',function(){return window.QR})}).then(function(){return js('/assets/catalog.js',function(){return window.CatalogMaker})})}
(function css(){if(document.getElementById('stp-css'))return;var s=document.createElement('style');s.id='stp-css';s.textContent='.ct-st .pt-side{display:grid;gap:8px}.ct-st .pt-d{background:#161a33;border:1px solid #2e3358;border-radius:12px;padding:8px 10px;color:#e5e7eb}.ct-st .pt-d summary{font-weight:800;cursor:pointer;padding:3px 0}.ct-st .pt-d>*{margin-top:8px}.ct-st .pt-l{display:grid;gap:4px;font-weight:700;font-size:12px}.ct-st .pt-i{padding:8px;border:1px solid #3a4070;border-radius:9px;font:inherit;width:100%;box-sizing:border-box;background:#0f1226;color:#fff}.ct-st .pt-c{width:100%;height:34px;padding:2px}.ct-st .pt-2{display:grid;grid-template-columns:1fr 1fr;gap:6px}.ct-st .pt-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}.ct-st .pt-k{display:flex;gap:6px;align-items:center;font-size:12px}.ct-st .pt-b{padding:8px 10px;border:0;border-radius:9px;background:#7c3aed;color:#fff;font:inherit;font-weight:700;cursor:pointer;display:inline-block;font-size:12px}.ct-st .pt-g{background:#2a2f55;color:#ddd}.ct-st .pt-p{background:#16a34a}.ct-st .pt-btns{display:flex;gap:6px;flex-wrap:wrap}.ct-st .pt-h{font-size:11px;color:#9aa3c7;margin:4px 0 0}.ct-st .pt-pal{display:flex;gap:5px;flex-wrap:wrap}.ct-st .pt-sw{width:28px;height:28px;border-radius:50%;border:2px solid #fff;cursor:pointer}.ct-st .pt-row{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #2e3358}.ct-st .pt-row .pt-i{padding:6px;font-size:12px}';document.head.appendChild(s)})();
var SZ=[['1080x1080','مربع 1080×1080'],['1080x1350','بوست 4:5'],['1080x1920','ستوري 9:16'],['1200x800','أفقي 3:2'],['1200x400','شريط 3:1'],['800x1100','ملصق رف'],['1240x1754','A4 طولي'],['600x800','بطاقة رف 3:4']];
function img(f,cb){var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){cb(im)};im.src=fr.result};fr.readAsDataURL(f)}
var PIMG=null,PLOGO=null,PINL=[];
SD.tabFn.ext=function(p){orig(p);var a=window.Studio.api;
 var box=document.createElement('div');
 box.innerHTML='<h4>🏷 بطاقة سعر / عرض</h4><p class="st-hint">اختر من 200 تصميم أو صمّم بنفسك (قالب، ألوان، خط، نمط، زخرفة، تقسيط). تُدرج البطاقة كطبقات: كل نص عنصر مستقل تعدّله بالكامل. لأوراق كاملة استخدم <a href="/tools/price-tag-generator/" target="_blank">مولّد الأوراق</a> ثم «افتح في الاستوديو».</p>'+
 '<div class="st-row"><label>تصميم جاهز <select id="pc-des"></select></label></div>'+
 '<input class="st-search" id="pc-n" placeholder="اسم المنتج" value="اسم المنتج"><div class="st-row"><label>السعر <input id="pc-p" value="49.99" style="width:70px"></label><label>القديم <input id="pc-o" value="79.99" style="width:70px"></label></div><input class="st-search" id="pc-nt" placeholder="ملاحظة (اختياري)"><div class="st-row"><label>الشارة <input id="pc-b" value="خصم" style="width:90px"></label><label>المتجر <input id="pc-sn" style="width:90px"></label></div>'+
 '<div class="st-row"><label>القالب <select id="pc-t"></select></label></div><div class="st-row"><label>الألوان <select id="pc-c"></select></label><label>الخط <select id="pc-f"></select></label></div>'+
 '<div class="st-row"><label>أساسي <input type="color" id="pc-c0" value="#e11d48"></label><label>ثانوي <input type="color" id="pc-c1" value="#fde047"></label><label>نص <input type="color" id="pc-c2" value="#111827"></label><label>خلفية <input type="color" id="pc-c3" value="#ffffff"></label></div>'+
 '<div class="st-row"><label>النمط <select id="pc-pat"></select></label><label>الزخرفة <select id="pc-orn"></select></label></div>'+
 '<div class="st-row"><label>العملة <input id="pc-cu" value="ر.س" style="width:56px"></label><label>الزوايا <input type="number" id="pc-rad" value="18" style="width:52px"></label><label>اسم % <input type="number" id="pc-ns" value="100" style="width:52px"></label><label>سعر % <input type="number" id="pc-ps" value="100" style="width:52px"></label></div>'+
 '<div class="st-row"><label>الحجم <select id="pc-z"></select></label></div>'+
 '<div class="st-row"><label>صورة المنتج <input type="file" id="pc-img" accept="image/*"></label></div><div class="st-row"><label>الشعار <input type="file" id="pc-logo" accept="image/*"></label></div>'+
 '<label class="st-row"><input type="checkbox" id="pc-in"> خيار التقسيط</label><div class="st-row"><label>الدفعات <input type="number" id="pc-inn" value="4" style="width:50px"></label><label>النص <input id="pc-inl" placeholder="قسّطها على" style="width:100px"></label></div><div class="st-row"><label>شعارات شركات التقسيط <input type="file" id="pc-inf" accept="image/*" multiple></label></div><input class="st-search" id="pc-inm" placeholder="أو أسماء نصية: Tabby, Tamara">'+
 '<label class="st-row"><input type="checkbox" id="pc-ed" checked> طبقات قابلة للتحرير (نصوص منفصلة)</label><button class="st-big" id="pc-go">➕ أدرج بطاقة السعر</button>'+
 '<h4>📰 صانع مجلة العروض</h4><p class="st-hint">كل خيارات المجلة هنا: بيانات، منتجات (لصق من Excel وصور دفعة واحدة)، 20 ثيمًا، أقسام، غلاف وصفحة تواصل. اضغط «أنشئ صفحات المجلة» فتظهر كل الصفحات في المحرر بنصوصها وصورها كعناصر قابلة للتعديل.</p><div id="ct-host" class="ct-st"></div>'+
 '<h4>📥 استيراد من الأدوات</h4><p class="st-hint">أرسلت مجلة أو ورقة أسعار من صفحات الأدوات؟ استوردها هنا.</p><button class="st-big" id="pc-imp" style="background:#334155">📥 استيراد آخر ما أُرسل</button>';
 while(box.firstChild)p.appendChild(box.firstChild);
 var q=function(s){return p.querySelector(s)};
 SZ.forEach(function(z){q('#pc-z').add(new Option(z[1],z[0]))});
 var P0=null;
 function setPal(i){var pl=P0.PAL[i];if(!pl)return;['c0','c1','c2','c3'].forEach(function(id,k){q('#pc-'+id).value=pl[k]})}
 load().then(function(){var P=P0=window.PriceTag;P.TPL.forEach(function(t){q('#pc-t').add(new Option(t[1],t[0]))});P.PAL.forEach(function(c,i){q('#pc-c').add(new Option(c[4],i))});P.FONTS.forEach(function(f){q('#pc-f').add(new Option(f,f))});P.PATS.forEach(function(c){q('#pc-pat').add(new Option(c[1],c[0]))});P.ORNS.forEach(function(c){q('#pc-orn').add(new Option(c[1],c[0]))});q('#pc-des').add(new Option('— اختر (200 تصميم) —',''));for(var i=0;i<200;i++)q('#pc-des').add(new Option('تصميم رقم '+(i+1),i));setPal(0)});
 q('#pc-c').onchange=function(){setPal(+this.value)};
 q('#pc-des').onchange=function(){if(this.value==='')return;var d=P0.design(+this.value);q('#pc-t').value=d.tpl;q('#pc-c').value=d.pi;setPal(d.pi);q('#pc-pat').value=d.pat;q('#pc-orn').value=d.orn;q('#pc-rad').value=d.rad};
 q('#pc-img').onchange=function(){if(this.files[0])img(this.files[0],function(im){PIMG=im})};
 q('#pc-logo').onchange=function(){if(this.files[0])img(this.files[0],function(im){PLOGO=im})};
 q('#pc-inf').onchange=function(){PINL=[];var fl=[].slice.call(this.files).slice(0,4);fl.forEach(function(f,i){img(f,function(im){PINL[i]=im})})};
 q('#pc-go').onclick=function(){var b=this;b.disabled=true;load().then(function(){var P=window.PriceTag,z=q('#pc-z').value.split('x'),w=+z[0],h=+z[1],ff=q('#pc-f').value;
   var o={tpl:q('#pc-t').value,ff:ff,c:[q('#pc-c0').value,q('#pc-c1').value,q('#pc-c2').value,q('#pc-c3').value],img:PIMG,logo:PLOGO,inl:PINL.filter(Boolean),s:{badge:q('#pc-b').value,cur:q('#pc-cu').value,pos:'after',dec:'auto',dig:'latin',sbar:1,border:1,rad:+q('#pc-rad').value||0,store:q('#pc-sn').value,vfor:'',showBc:0,showQr:0,lpos:'top',lsz:60,pat:q('#pc-pat').value,orn:q('#pc-orn').value,nsc:+q('#pc-ns').value||100,psc:+q('#pc-ps').value||100,inst:q('#pc-in').checked?1:0,instN:+q('#pc-inn').value||4,instLabel:q('#pc-inl').value,instNames:q('#pc-inm').value}};
   var row={n:q('#pc-n').value,p:q('#pc-p').value,o:q('#pc-o').value,nt:q('#pc-nt').value,b:'',im:null};
   return P.fonts(ff).then(function(){
    if(q('#pc-ed').checked){var L=P.layers(row,o,w,h),D=a.D(),sc=Math.min(D.w*.9/w,D.h*.9/h),els=P.toEls(L,(D.w-w*sc)/2,(D.h-h*sc)/2,sc,a.addAsset,'');els=a.norm(els);els.forEach(function(e){D.els.push(e)});a.setSel(els.map(function(e){return e.id}));a.push();a.draw();a.props();a.toast('✅ أُدرجت البطاقة كطبقات قابلة للتحرير')}
    else{var c=P.makeSync(row,o,w,h),k=a.addAsset(c.toDataURL('image/png'));a.addImage(k,c.width/c.height);a.toast('✅ أُدرجت البطاقة')}})}).catch(function(e){a.toast('تعذّر: '+(e&&e.message||''))}).then(function(){b.disabled=false})};
 q('#pc-imp').onclick=function(){importBridge(true)};
 loadCat().then(function(){var h=q('#ct-host');if(h)window.CatalogMaker.mount(h,true)}).catch(function(){var h=q('#ct-host');if(h)h.textContent='تعذّر تحميل صانع المجلة'});
};
/* ---- استيراد كطبقات ---- */
function applyDesign(d,ask){var a=window.Studio.api,D0=a.D();if(ask&&D0&&D0.els&&D0.els.length&&!confirm('سيُستبدل التصميم الحالي بصفحات المجلة. هل تريد المتابعة؟ (يمكنك التراجع بـ Ctrl+Z)'))return;
 var st=document.querySelector('.st-start');if(st)st.remove();
 var pages=(d.pages||[{bg:d.bg,els:d.els}]).map(function(pg){return{bg:pg.bg,els:a.norm(pg.els)}});
 var D={w:d.w,h:d.h,bg:pages[0].bg,els:pages[0].els,assets:d.assets||{},pages:pages,pi:0};
 a.setD(D);a.toast('✅ '+pages.length+' صفحة قابلة للتحرير في المحرر')}
document.addEventListener('dh-studio-import',function(e){applyDesign(e.detail,true)});
function idbGet(cb){try{var rq=indexedDB.open('dh_bridge',1);rq.onupgradeneeded=function(){rq.result.createObjectStore('kv')};rq.onsuccess=function(){var g=rq.result.transaction('kv','readonly').objectStore('kv').get('studio-import');g.onsuccess=function(){cb(g.result)};g.onerror=function(){cb(null)}};rq.onerror=function(){cb(null)}}catch(e){cb(null)}}
function importBridge(manual){var a=window.Studio&&window.Studio.api;if(!a||!a.D()){return setTimeout(function(){importBridge(manual)},300)}
 idbGet(function(d){if(!d){if(manual)a.toast('لا يوجد شيء مُرسل بعد');return}applyDesign(d,manual)})}
if(/[?&]import=1/.test(location.search)){setTimeout(function(){importBridge(false)},900)}
/* ---- فتح لوحة الأداة مباشرة من الصفحة الرئيسية: ?tool=price | magazine ---- */
var TM=/[?&]tool=(price|magazine)/.exec(location.search);
if(TM){(function open(n){var a=window.Studio&&window.Studio.api,tab=document.querySelector('#st-tabs [data-t=ext]');if(!a||!a.D()||!tab){if(n<60)setTimeout(function(){open(n+1)},300);return}
 var st=document.querySelector('.st-start');if(st)st.remove();tab.click();
 (function pick(m){var key=TM[1]==='price'?'بطاقة سعر':'مجلة',b=[].slice.call(document.querySelectorAll('.tl-btn')).filter(function(x){return x.textContent.indexOf(key)>=0})[0];if(b){b.click();var s2=document.querySelector('.st-start');if(s2)s2.remove()}else if(m<20)setTimeout(function(){pick(m+1)},250)})(0)})(0)}
})();
