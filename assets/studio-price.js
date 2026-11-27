/* DIAMOND Studio — بطاقة سعر / عرض: تُدرج كصورة داخل التصميم (تستخدم assets/pricetag.js) */
(function(){
var SD=window.SD;if(!SD||!SD.tabFn||!SD.tabFn.ext)return;
var orig=SD.tabFn.ext,loading=null;
function load(){if(window.PriceTag)return Promise.resolve();if(loading)return loading;loading=new Promise(function(ok,no){var s=document.createElement('script');s.src='/assets/pricetag.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});return loading}
var SZ=[['1080x1080','مربع 1080×1080'],['1080x1350','بوست 4:5'],['1080x1920','ستوري 9:16'],['1200x800','أفقي 3:2'],['1200x400','شريط 3:1'],['800x1100','ملصق رف']];
SD.tabFn.ext=function(p){orig(p);var a=window.Studio.api;
 var box=document.createElement('div');
 box.innerHTML='<h4>🏷 بطاقة سعر / عرض</h4><p class="st-hint">اصنع بطاقة سعر أو عرض جاهزة بـ 15 تصميمًا وتُدرج كصورة داخل لوحتك. لأوراق A4 كاملة بالطباعة استخدم <a href="/tools/price-tag-generator/" target="_blank">مولّد بطاقات الأسعار</a>.</p>'+
 '<input class="st-search" id="pc-n" placeholder="اسم المنتج" value="اسم المنتج"><div class="st-row"><label>السعر <input id="pc-p" value="49.99" style="width:70px"></label><label>القديم <input id="pc-o" value="79.99" style="width:70px"></label></div><input class="st-search" id="pc-nt" placeholder="ملاحظة (اختياري)"><input class="st-search" id="pc-b" placeholder="نص الشارة مثل: عرض خاطف" value="خصم">'+
 '<div class="st-row"><label>القالب <select id="pc-t"></select></label></div><div class="st-row"><label>الألوان <select id="pc-c"></select></label><label>الخط <select id="pc-f"></select></label></div><div class="st-row"><label>العملة <input id="pc-cu" value="ر.س" style="width:56px"></label><label>الحجم <select id="pc-z"></select></label></div>'+
 '<button class="st-big" id="pc-go">➕ أدرج بطاقة السعر</button>';
 while(box.firstChild)p.appendChild(box.firstChild);
 var q=function(s){return p.querySelector(s)};
 SZ.forEach(function(z){q('#pc-z').add(new Option(z[1],z[0]))});
 load().then(function(){var P=window.PriceTag;P.TPL.forEach(function(t){q('#pc-t').add(new Option(t[1],t[0]))});P.PAL.forEach(function(c,i){q('#pc-c').add(new Option(c[4],i))});P.FONTS.forEach(function(f){q('#pc-f').add(new Option(f,f))})});
 q('#pc-go').onclick=function(){var b=this;b.disabled=true;load().then(function(){var P=window.PriceTag,z=q('#pc-z').value.split('x'),w=+z[0],h=+z[1],pal=P.PAL[+q('#pc-c').value||0];
   return P.make({n:q('#pc-n').value,p:q('#pc-p').value,o:q('#pc-o').value,nt:q('#pc-nt').value,b:'',im:null},{tpl:q('#pc-t').value,ff:q('#pc-f').value,c:pal.slice(0,4),s:{badge:q('#pc-b').value,cur:q('#pc-cu').value,pos:'after',dec:'auto',dig:'latin',sbar:1,border:1,rad:18,store:'',vfor:'',showBc:0,showQr:0,lpos:'top',lsz:60}},w,h)}).then(function(c){var k=a.addAsset(c.toDataURL('image/png'));a.addImage(k,c.width/c.height);a.toast('✅ أُدرجت البطاقة')}).catch(function(){a.toast('تعذّر التحميل')}).then(function(){b.disabled=false})}
};
})();
