/* DIAMOND Studio — إضافات ذكية: تغيير المقاس الذكي (حزمة مقاسات)، تبديل لوحة ألوان التصميم، ألوان من صورة، فاحص جودة التصميم */
(function(){
var SD=window.SD,S=window.Studio;if(!SD||!S||!SD.tabFn)return;
function api(){return S.api}
function q(p,s){return p.querySelector(s)}
var SIZES=[['ig-post','منشور مربع',1080,1080],['ig-portrait','منشور طولي',1080,1350],['story','ستوري / ريلز',1080,1920],['fb-link','فيسبوك / رابط',1200,630],['x-post','تويتر X',1600,900],['yt','يوتيوب مصغّرة',1280,720],['wa','حالة واتساب',1080,1920],['a4','A4 (طباعة)',2480,3508]];
function lum(r,g,b){return[r,g,b].map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce(function(s,v,i){return s+v*[.2126,.7152,.0722][i]},0)}
function h2r(h){h=String(h||'#000').replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');return[parseInt(h.substr(0,2),16)||0,parseInt(h.substr(2,2),16)||0,parseInt(h.substr(4,2),16)||0]}
function r2h(a){return'#'+a.map(function(v){return('0'+Math.max(0,Math.min(255,Math.round(v))).toString(16)).slice(-2)}).join('')}
function ratio(a,b){var l1=lum.apply(0,a),l2=lum.apply(0,b);return(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)}
function isHex(c){return typeof c==='string'&&/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)}
function norm(c){c=c.toLowerCase();return c.length===4?c.replace(/./g,function(m,i){return i?m+m:m}):c}
// ---------- 1) تغيير المقاس الذكي ----------
function adapt(D,W,H){
 var els=JSON.parse(JSON.stringify(D.els)),sc=Math.min(W/D.w,H/D.h),cov=Math.max(W/D.w,H/D.h);
 els.forEach(function(e){
  var full=e.w>=D.w*.9&&e.h>=D.h*.9;
  if(full){if(e.type==='image'){var s=Math.max(W/e.w,H/e.h);var nw=e.w*s,nh=e.h*s;e.x=(W-nw)/2;e.y=(H-nh)/2;e.w=nw;e.h=nh}else{e.x=0;e.y=0;e.w=W;e.h=H}return}
  var cx=(e.x+e.w/2)/D.w*W,cy=(e.y+e.h/2)/D.h*H;
  e.w*=sc;e.h*=sc;e.x=cx-e.w/2;e.y=cy-e.h/2;
  if(e.x<0)e.x=0;if(e.y<0)e.y=0;if(e.x+e.w>W)e.x=Math.max(0,W-e.w);if(e.y+e.h>H)e.y=Math.max(0,H-e.h);
  if(e.type==='text'){e.fs*=sc;if(e.ls)e.ls*=sc}
  if(typeof e.sw==='number')e.sw*=sc;if(typeof e.r==='number')e.r*=sc;
  if(e.sh&&typeof e.sh==='object'){['x','y','b'].forEach(function(k){if(typeof e.sh[k]==='number')e.sh[k]*=sc})}
 });
 return {w:W,h:H,bg:JSON.parse(JSON.stringify(D.bg||{t:'solid',c:['#ffffff']})),els:els,assets:D.assets}}
function bytes(c){return new Promise(function(ok){c.toBlob(function(b){var r=new FileReader();r.onload=function(){ok(new Uint8Array(r.result))};r.readAsArrayBuffer(b)},'image/png')})}
// ---------- 2) الألوان ----------
function collect(D){var m={};function add(c){if(!isHex(c))return;c=norm(c);m[c]=(m[c]||0)+1}
 add(D.bg&&D.bg.c&&D.bg.c[0]);if(D.bg&&D.bg.c)D.bg.c.forEach(add);
 D.els.forEach(function(e){add(e.col);add(e.stroke);if(typeof e.fill==='string')add(e.fill);else if(e.fill&&e.fill.g){add(e.fill.g[0]);add(e.fill.g[1])}if(e.sh)add(e.sh.c)});
 return Object.keys(m).sort(function(a,b){return m[b]-m[a]})}
function swap(D,map){function f(c){return isHex(c)&&map[norm(c)]?map[norm(c)]:c}
 if(D.bg&&D.bg.c)D.bg.c=D.bg.c.map(f);
 D.els.forEach(function(e){if(e.col)e.col=f(e.col);if(e.stroke)e.stroke=f(e.stroke);if(typeof e.fill==='string')e.fill=f(e.fill);else if(e.fill&&e.fill.g){e.fill.g[0]=f(e.fill.g[0]);e.fill.g[1]=f(e.fill.g[1])}if(e.sh&&e.sh.c)e.sh.c=f(e.sh.c)})}
function fromImage(im,n){var c=document.createElement('canvas'),w=64,h=Math.max(8,Math.round(64*im.height/im.width));c.width=w;c.height=h;var x=c.getContext('2d');x.drawImage(im,0,0,w,h);var d=x.getImageData(0,0,w,h).data,b={};
 for(var i=0;i<d.length;i+=4){if(d[i+3]<128)continue;var k=(d[i]>>4)+','+(d[i+1]>>4)+','+(d[i+2]>>4);b[k]=(b[k]||[0,0,0,0]);b[k][0]+=d[i];b[k][1]+=d[i+1];b[k][2]+=d[i+2];b[k][3]++}
 var arr=Object.keys(b).map(function(k){var v=b[k];return{c:[v[0]/v[3],v[1]/v[3],v[2]/v[3]],n:v[3]}}).sort(function(a,b2){return b2.n-a.n}),out=[];
 arr.forEach(function(a){if(out.length>=n)return;if(out.every(function(o){var dx=o[0]-a.c[0],dy=o[1]-a.c[1],dz=o[2]-a.c[2];return Math.sqrt(dx*dx+dy*dy+dz*dz)>70}))out.push(a.c)});return out.map(r2h)}
// ---------- 3) فحص الجودة ----------
function under(D,e){var s=.25,w=Math.max(4,Math.round(D.w*s)),h=Math.max(4,Math.round(D.h*s)),c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');x.scale(s,s);var i=D.els.indexOf(e);api().render(x,{w:D.w,h:D.h,bg:D.bg,els:D.els.slice(0,i),assets:D.assets},D.w,D.h);
 var rx=Math.max(0,Math.round(e.x*s)),ry=Math.max(0,Math.round(e.y*s)),rw=Math.max(1,Math.min(w-rx,Math.round(e.w*s))),rh=Math.max(1,Math.min(h-ry,Math.round((e.h||e.fs*1.4)*s)));var d=x.getImageData(rx,ry,rw,rh).data,a=[0,0,0],n=0;for(var k=0;k<d.length;k+=4){a[0]+=d[k];a[1]+=d[k+1];a[2]+=d[k+2];n++}return n?a.map(function(v){return v/n}):[255,255,255]}
function audit(){var a=api(),D=a.D(),res=[],k=D.w/1080;
 D.els.forEach(function(e,i){var nm=(e.type==='text'?'نص «'+String(e.t||'').slice(0,18)+'»':(e.name||e.type));
  if(e.type==='text'){var fs=e.fs/k;if(fs<26)res.push({id:e.id,lv:1,m:nm+': الخط صغير ('+Math.round(fs)+') قد لا يُقرأ على الجوال'});
   try{var col=h2r(typeof e.col==='string'?e.col:'#ffffff'),u=under(D,e),r=ratio(col,u),big=fs>=40||(fs>=30&&(e.fw==='700'||e.fw==='900')),need=big?3:4.5;if(r<need)res.push({id:e.id,lv:2,m:nm+': التباين '+r.toFixed(1)+':1 والمطلوب '+need+':1'})}catch(x){}}
  if(e.x+e.w<0||e.y+e.h<0||e.x>D.w||e.y>D.h)res.push({id:e.id,lv:2,m:nm+': خارج حدود التصميم'});
  else if(e.type==='text'&&(e.x<D.w*.02||e.x+e.w>D.w*.98))res.push({id:e.id,lv:1,m:nm+': ملاصق لحافة التصميم، اترك هامشًا'});
  if((e.op!=null&&e.op<.08))res.push({id:e.id,lv:1,m:nm+': شبه شفاف جدًا ('+Math.round(e.op*100)+'%)'});
  if(e.type==='image'&&e.src&&D.assets&&D.assets[e.src]){var L=D.assets[e.src].length||0;if(L>6e6)res.push({id:e.id,lv:1,m:nm+': صورة ثقيلة جدًا، قد يبطؤ المحرر'})}});
 var txt=D.els.filter(function(e){return e.type==='text'}).length;if(txt>6)res.push({id:null,lv:1,m:'عدد النصوص '+txt+' — التصميم مزدحم، قلّل النصوص'});
 var fonts={};D.els.forEach(function(e){if(e.type==='text')fonts[e.ff||'Cairo']=1});if(Object.keys(fonts).length>3)res.push({id:null,lv:1,m:'أكثر من 3 خطوط ('+Object.keys(fonts).length+')، وحّد الخطوط'});
 return res}
// ---------- الواجهة ----------
SD.tabFn.plus=function(p){var a=api(),D=a.D(),cols=collect(D),map={};
 p.innerHTML='<h4>📐 تغيير المقاس الذكي</h4><p class="st-hint">يعيد ترتيب العناصر بنسبها دون تمطيط الخطوط والصور. حوّل تصميمك لمقاس آخر، أو صدّر حزمة كل المقاسات دفعة واحدة (ZIP).</p><div class="st-sw" style="display:flex;flex-wrap:wrap;gap:6px" id="pl-sz">'+SIZES.map(function(s,i){return '<label style="display:flex;gap:4px;align-items:center;font-size:.82rem"><input type="checkbox" data-i="'+i+'"'+(i<3?' checked':'')+'> '+s[1]+' <small dir="ltr">'+s[2]+'×'+s[3]+'</small></label>'}).join('')+'</div>'+
 '<div class="st-row"><select id="pl-one">'+SIZES.map(function(s,i){return '<option value="'+i+'">'+s[1]+' ('+s[2]+'×'+s[3]+')</option>'}).join('')+'</select></div><button class="st-big" id="pl-apply">↔ حوّل التصميم الحالي لهذا المقاس</button><button class="st-big" id="pl-zip" style="background:#334155">📦 صدّر المقاسات المحددة (ZIP)</button>'+
 '<h4>🎨 تبديل ألوان التصميم</h4><p class="st-hint">غيّر لونًا واحدًا فيتبدّل في كل مكان استُخدم فيه. مناسب لتحويل تصميم جاهز إلى هوية متجرك.</p><div id="pl-cols" style="display:flex;flex-wrap:wrap;gap:8px"></div><button class="st-big" id="pl-sw">✔ طبّق الألوان الجديدة</button>'+
 '<h4>🖼 ألوان من صورة أو شعار</h4><p class="st-hint">ارفع شعارك فنستخرج ألوانه ونطبّقها على التصميم بترتيب الدرجات (الأغمق بالأغمق).</p><input type="file" id="pl-img" accept="image/*" class="st-search"><div id="pl-pal" style="display:flex;gap:6px;margin:8px 0;flex-wrap:wrap"></div><button class="st-big" id="pl-pap" style="display:none">طبّق هذه الألوان</button>'+
 '<h4>✅ فاحص جودة التصميم</h4><p class="st-hint">يفحص كل النصوص: حجم الخط والتباين والحواف والزحام، ويدلّك على كل مشكلة.</p><button class="st-big" id="pl-aud" style="background:#0f9f6e">افحص التصميم</button><div id="pl-ar" class="st-hint"></div>';
 // مقاسات
 q(p,'#pl-apply').onclick=function(){var s=SIZES[+q(p,'#pl-one').value],D0=a.D();if(D0.pages&&D0.pages.length>1){a.toast('التحويل الذكي للصفحة الواحدة فقط');return}if(a.stash)a.stash();var nd=adapt(D0,s[2],s[3]);a.setD(nd);a.toast('✅ تم التحويل إلى '+s[1])};
 q(p,'#pl-zip').onclick=function(){var D0=a.D(),ch=[].filter.call(p.querySelectorAll('#pl-sz input'),function(c){return c.checked}).map(function(c){return SIZES[+c.dataset.i]});if(!ch.length){a.toast('حدّد مقاسًا واحدًا على الأقل');return}var btn=this,files=[],i=0;btn.disabled=true;
  (function step(){if(i>=ch.length){btn.disabled=false;btn.textContent='📦 صدّر المقاسات المحددة (ZIP)';a.dl(SD.ext.zip(files),'design-sizes.zip');a.toast('✅ '+files.length+' مقاسات');return}var s=ch[i],nd=adapt(D0,s[2],s[3]),c=document.createElement('canvas');c.width=s[2];c.height=s[3];var x=c.getContext('2d');a.render(x,nd,s[2],s[3]);btn.textContent='⏳ '+(i+1)+'/'+ch.length;bytes(c).then(function(u){files.push({name:s[0]+'-'+s[2]+'x'+s[3]+'.png',data:u});i++;setTimeout(step,0)})})()};
 // ألوان
 var box=q(p,'#pl-cols');box.innerHTML=cols.length?cols.map(function(c){return '<label style="display:flex;flex-direction:column;align-items:center;font-size:.7rem;gap:2px"><span dir="ltr">'+c+'</span><input type="color" data-o="'+c+'" value="'+c+'" style="width:46px;height:36px;padding:0"></label>'}).join(''):'<span class="st-hint">لا ألوان قابلة للتبديل</span>';
 q(p,'#pl-sw').onclick=function(){var m={},n=0;[].forEach.call(box.querySelectorAll('input'),function(i){if(norm(i.value)!==i.dataset.o){m[i.dataset.o]=i.value;n++}});if(!n){a.toast('غيّر لونًا أولًا');return}if(a.stash)a.stash();var D1=a.D();swap(D1,m);a.push();a.draw();a.props();SD.tabFn.plus(p);a.toast('✅ بُدّلت '+n+' ألوان')};
 // من صورة
 var pal=[];q(p,'#pl-img').onchange=function(e){var f=e.target.files[0];if(!f)return;var im=new Image();im.onload=function(){pal=fromImage(im,Math.max(3,Math.min(6,cols.length||4)));q(p,'#pl-pal').innerHTML=pal.map(function(c){return '<span style="width:38px;height:38px;border-radius:8px;background:'+c+';border:1px solid #888" title="'+c+'"></span>'}).join('');q(p,'#pl-pap').style.display=pal.length?'block':'none'};im.src=URL.createObjectURL(f)};
 q(p,'#pl-pap').onclick=function(){var cur=collect(a.D());if(!cur.length||!pal.length)return;function L(c){var r=h2r(c);return lum(r[0],r[1],r[2])}var A=cur.slice().sort(function(x,y){return L(x)-L(y)}),B=pal.slice().sort(function(x,y){return L(x)-L(y)}),m={};A.forEach(function(c,i){var j=Math.min(B.length-1,Math.round(i*(B.length-1)/Math.max(1,A.length-1)));m[c]=B[j]});if(a.stash)a.stash();swap(a.D(),m);a.push();a.draw();a.props();SD.tabFn.plus(p);a.toast('✅ طُبّقت ألوان الشعار')};
 // فحص
 q(p,'#pl-aud').onclick=function(){var r=audit(),o=q(p,'#pl-ar');if(!r.length){o.innerHTML='<b style="color:#34d399">✅ لا مشاكل ظاهرة. تصميم نظيف.</b>';return}
  o.innerHTML='<b>'+r.length+' ملاحظة:</b><br>'+r.map(function(x,i){return '<div style="margin:4px 0;padding:6px 8px;border-radius:8px;background:'+(x.lv===2?'rgba(239,68,68,.15)':'rgba(245,158,11,.14)')+';cursor:'+(x.id?'pointer':'default')+'" data-id="'+(x.id||'')+'">'+(x.lv===2?'❌ ':'⚠️ ')+x.m+'</div>'}).join('');
  [].forEach.call(o.querySelectorAll('[data-id]'),function(d){if(d.dataset.id)d.onclick=function(){a.setSel([d.dataset.id])}})}
};
function addTab(){var t=document.getElementById('st-tabs');if(!t)return setTimeout(addTab,150);if(t.querySelector('[data-t="plus"]'))return;var b=document.createElement('button');b.dataset.t='plus';b.dataset.ui=1;b.innerHTML='<i>✨</i><span>ذكي</span>';
 b.onclick=function(){[].forEach.call(t.querySelectorAll('button'),function(x){x.classList.toggle('on',x===b)});SD.tabFn.plus(document.getElementById('st-pane'))};var ref=t.querySelector('[data-t="ext"]');t.insertBefore(b,ref||null)}
addTab();
})();
