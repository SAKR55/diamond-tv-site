/* تبويب الزخارف: نجوم وهلال وفواصل وإطارات وأقواس وفوانيس وأطقم جاهزة وبلاط زخرفي */
(function(){
var SD=window.SD,S=window.Studio;if(!SD||!S||!SD.tabFn)return;
var R2=function(n){return Math.round(n*100)/100};
/* ---- بناء المسارات: قطع مطلقة ثم تطبيع إلى 24×24 ---- */
function pts(arr){var s=[];arr.forEach(function(p,i){s.push([i?'L':'M',p[0],p[1]])});s.push(['Z']);return s}
function rad(a){return a*Math.PI/180}
function arc(cx,cy,r,a0,a1,n){var o=[],k;n=n||48;for(k=0;k<=n;k++){var a=rad(a0+(a1-a0)*k/n);o.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}return o}
function circ(cx,cy,r,rev){var a=arc(cx,cy,r,0,rev?-360:360,40);a.pop();return pts(a)}
function star(cx,cy,n,R,r,rot,rev){var o=[],i;for(i=0;i<n*2;i++){var a=rad((rot||-90)+(rev?-1:1)*i*180/n),rr=i%2?r:R;o.push([cx+rr*Math.cos(a),cy+rr*Math.sin(a)])}return pts(o)}
function rect(x1,y1,x2,y2,rev){return pts(rev?[[x1,y1],[x1,y2],[x2,y2],[x2,y1]]:[[x1,y1],[x2,y1],[x2,y2],[x1,y2]])}
function ell(cx,cy,rx,ry,ang,n){var o=[],c=Math.cos(rad(ang)),s=Math.sin(rad(ang)),k;n=n||36;for(k=0;k<n;k++){var t=rad(k*360/n),x=rx*Math.cos(t),y=ry*Math.sin(t);o.push([cx+x*c-y*s,cy+x*s+y*c])}return pts(o)}
function cat(){var o=[];[].slice.call(arguments).forEach(function(a){o=o.concat(a)});return o}
function toD(segs,W,H){var sx=24/W,sy=24/H;return segs.map(function(s){if(s[0]==='Z')return 'Z';return s[0]+R2(s[1]*sx)+' '+R2(s[2]*sy)}).join('')}
function crescent(){var R=48,r=40,d=18,cx=50,cy=50,x=(R*R-r*r+d*d)/(2*d),y=Math.sqrt(R*R-x*x),t=Math.atan2(y,x)*180/Math.PI,ph=Math.atan2(y,x-d)*180/Math.PI;
 return pts(cat(arc(cx,cy,R,t,360-t,70),arc(cx+d,cy,r,360-ph,ph,70)))}
function frame(W,H){var m=Math.min(W,H);var t=m*.014,g=m*.045,c=m*.034;return cat(rect(0,0,W,H),rect(t,t,W-t,H-t,1),rect(g,g,W-g,H-g),rect(g+t*.5,g+t*.5,W-g-t*.5,H-g-t*.5,1),circ(g,g,c),circ(W-g,g,c),circ(g,H-g,c),circ(W-g,H-g,c),circ(W/2,g,c*.8),circ(W/2,H-g,c*.8),circ(g,H/2,c*.8),circ(W-g,H/2,c*.8))}
var O=[];function def(name,W,H,segs,grp){O.push({n:'زخرفة · '+name,W:W,H:H,d:toD(segs,W,H),g:grp||'z'})}
function reg(o){if(!SD.icons.some(function(i){return i[0]===o.n}))SD.icons.push([o.n,o.d,false,'orn'])}
/* نجوم وأشكال هندسية */
def('نجمة ثمانية',100,100,cat(star(50,50,8,50,34),circ(50,50,12,1)),'s');
def('نجمة اثنا عشرية',100,100,cat(star(50,50,12,50,40),circ(50,50,10,1)),'s');
def('نجمة شعاعية',100,100,star(50,50,16,50,32),'s');
def('نجمة خماسية',100,100,star(50,52,5,50,20),'s');
def('نجمة سداسية',100,100,cat(pts(arc(50,50,50,-90,270,3).slice(0,3)),pts(arc(50,50,50,90,450,3).slice(0,3))),'s');
def('هلال',100,100,crescent(),'s');
(function(){var c=crescent(),st=star(66,50,5,13,5.4,-90);def('هلال ونجمة',100,100,cat(c,st),'s')})();
def('زهرة ثمانية البتلات',100,100,cat.apply(null,[0,45,90,135].map(function(a){return ell(50+0,50,14,44,a,36)})),'s');
def('معين مزخرف',100,100,cat(pts([[50,0],[100,50],[50,100],[0,50]]),pts([[50,14],[14,50],[50,86],[86,50]].reverse()),circ(50,50,12)),'s');
def('شعاع الشمس',100,100,(function(){var o=[],i;for(i=0;i<24;i++){var a=i*15;o=o.concat(pts([[50+30*Math.cos(rad(a-5)),50+30*Math.sin(rad(a-5))],[50+50*Math.cos(rad(a)),50+50*Math.sin(rad(a))],[50+30*Math.cos(rad(a+5)),50+30*Math.sin(rad(a+5))]]))}return cat(o,circ(50,50,25))})(),'s');
def('ختم مسنن',100,100,(function(){var o=[],i;for(i=0;i<240;i++){var a=rad(i*1.5),r=46+4*Math.cos(a*24);o.push([50+r*Math.cos(a),50+r*Math.sin(a)])}return cat(pts(o),circ(50,50,38,1),circ(50,50,32))})(),'s');
/* فواصل وشرائط */
def('فاصل ملكي',240,32,cat(rect(10,15,96,17),rect(144,15,230,17),pts([[120,2],[134,16],[120,30],[106,16]]),pts([[120,9],[127,16],[120,23],[113,16]].reverse()),circ(100,16,3.5),circ(140,16,3.5),pts([[4,16],[10,12],[16,16],[10,20]]),pts([[224,16],[230,12],[236,16],[230,20]])),'d');
def('فاصل موجي',240,24,(function(){var t=[],b=[],x;for(x=0;x<=240;x+=4){var y=12+6*Math.sin(x/240*Math.PI*8);t.push([x,y-1.3]);b.push([x,y+1.3])}return pts(t.concat(b.reverse()))})(),'d');
def('فاصل نقاط',240,16,cat(circ(120,8,6),circ(98,8,4),circ(142,8,4),circ(80,8,3),circ(160,8,3),circ(64,8,2),circ(176,8,2),rect(10,7,52,9),rect(188,7,230,9)),'d');
def('شريط عنوان',240,60,cat(rect(24,4,216,40),pts([[0,16],[34,16],[34,52],[0,52],[12,34]]),pts([[240,16],[206,16],[206,52],[240,52],[228,34]])),'d');
def('غصن زيتون',200,60,cat(rect(8,29,192,31),[].concat.apply([],[24,52,80,108,136,164].map(function(x,i){return ell(x,i%2?39:21,17,6.5,i%2?-28:28,28)}))),'d');
/* عمارة */
def('قوس إسلامي',100,140,cat(pts(cat(arc(50,50,50,180,360,40),[[100,140],[0,140]]).map(function(p){return p})),pts(cat([[6,140],[94,140]],arc(50,50,44,0,-180,40)).map(function(p){return p}))),'a');
def('مسجد ومئذنتان',200,120,cat(pts(cat(arc(100,60,40,180,360,36),[[140,110],[60,110]])),rect(99,4,101,20),circ(100,2.5,4),pts([[20,34],[26,10],[32,34]]),rect(20,34,32,110),pts([[168,34],[174,10],[180,34]]),rect(168,34,180,110),rect(0,110,200,120)),'a');
def('فانوس',70,130,cat(circ(35,8,6),pts([[20,24],[50,24],[42,14],[28,14]]),pts([[18,26],[52,26],[60,60],[52,100],[18,100],[10,60]]),pts([[26,36],[44,36],[50,60],[44,92],[26,92],[20,60]].reverse()),pts([[14,100],[56,100],[50,112],[20,112]]),pts([[32,112],[38,112],[35,128]])),'a');
/* زوايا وإطارات */
def('زاوية مزخرفة',100,100,cat(rect(0,0,90,4),rect(0,0,4,90),rect(10,10,70,12),rect(10,10,12,70),circ(20,20,7),circ(95,2,4),circ(2,95,4)),'f');
def('إطار عمودي',200,280,frame(200,280),'f');def('إطار أفقي',280,200,frame(280,200),'f');def('إطار مربع',240,240,frame(240,240),'f');
/* أشياء ومناسبات ونباتات */
def('قلب',100,90,(function(){var o=[],i;for(i=0;i<80;i++){var t=i/80*2*Math.PI,x=16*Math.pow(Math.sin(t),3),y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);o.push([50+x*3,38-y*3.1])}return pts(o)})(),'m');
def('تاج',100,70,cat(pts([[4,60],[0,14],[26,36],[50,2],[74,36],[100,14],[96,60]]),rect(4,62,96,70),circ(0,12,5),circ(50,3,5),circ(100,12,5)),'m');
def('ورقة شجر',60,100,(function(){var L=[],R=[],i;for(i=0;i<=40;i++){var t=i/40,w=27*Math.pow(Math.sin(Math.PI*t),.85)*(1-.18*t);L.push([30-w,t*96]);R.push([30+w,t*96])}return cat(pts(L.concat(R.reverse())),rect(29,60,31,100))})(),'m');
def('نخلة',100,130,cat(pts([[46,50],[54,50],[58,130],[42,130]]),[].concat.apply([],[-80,-45,-15,15,45,80].map(function(a,i){return ell(50+Math.sin(rad(a))*18,44-Math.cos(rad(a))*4+(i%2?2:0),30,6,a>0?a-90+40:a+90-40,28)}))),'m');
def('هدية',100,100,cat(rect(8,38,92,96),rect(2,26,98,40),rect(46,26,54,96,1),pts([[50,26],[30,6],[20,16],[34,26]]),pts([[50,26],[70,6],[80,16],[66,26]])),'m');
def('بالون',60,110,cat(ell(30,36,26,32,0,40),pts([[30,68],[24,76],[36,76]]),rect(29,76,31,110)),'m');
def('سحابة',120,70,cat(circ(36,44,22),circ(62,32,28),circ(88,46,20),rect(30,46,98,66)),'m');
def('برق',60,100,pts([[36,0],[6,56],[28,56],[18,100],[54,40],[30,40],[46,0]]),'m');
def('فقاعة كلام',100,80,pts([[14,0],[86,0],[100,14],[100,46],[86,60],[58,60],[40,80],[44,60],[14,60],[0,46],[0,14]]),'m');
def('علامة صح',100,100,cat(circ(50,50,50),pts([[26,52],[34,44],[44,54],[68,28],[76,36],[44,70]].reverse())),'m');
def('سهم',100,60,pts([[0,22],[62,22],[62,4],[100,30],[62,56],[62,38],[0,38]]),'m');
def('قطرة',70,100,pts([[35,0]].concat(arc(35,68,31,-52,232,40))),'m');
def('كأس',100,110,cat(pts(cat([[18,0],[82,0],[78,40]],arc(50,40,28,10,170,12),[[22,40]])),rect(44,64,56,84),rect(26,84,74,96),rect(18,96,82,108),pts([[18,6],[0,10],[4,30],[22,40]]),pts([[82,6],[100,10],[96,30],[78,40]])),'m');
def('إطار دائري',100,100,cat(circ(50,50,50),circ(50,50,46,1),circ(50,50,42),circ(50,50,40,1)),'f');
def('إطار بيضاوي',100,130,cat(ell(50,65,50,65,0,60),ell(50,65,45,60,0,60).reverse()),'f');
def('حد مثلثات',240,20,(function(){var o=[],i;for(i=0;i<12;i++)o=o.concat(pts([[i*20,20],[i*20+10,0],[i*20+20,20]]));return o})(),'d');
def('حد معينات',240,20,(function(){var o=[],i;for(i=0;i<12;i++)o=o.concat(pts([[i*20,10],[i*20+10,0],[i*20+20,10],[i*20+10,20]]));return cat(o,rect(0,9.2,240,10.8,0))})(),'d');
def('حد دوائر متصلة',240,20,(function(){var o=[],i;for(i=0;i<12;i++)o=o.concat(circ(i*20+10,10,8));return o})(),'d');
def('فاصل نجمي',240,24,cat(rect(8,11,98,13),rect(142,11,232,13),star(120,12,5,11,4.5),star(104,12,5,5,2),star(136,12,5,5,2)),'d');
O.forEach(reg);
var COL=['#d4af37','#f5d77a','#ffffff','#111827','#7c3aed','#0f766e','#9f1239','#06b6d4'],col='#d4af37',size=25,last=null,GN={s:'نجوم وأشكال',d:'فواصل وحدود',a:'عمارة إسلامية',m:'أشياء ومناسبات',f:'زوايا وإطارات'};
function api(){return S.api}
function put(o,opt){var a=api(),D=a.D(),m=Math.min(D.w,D.h),w=m*(opt&&opt.s||size)/100,h=w*o.H/o.W;if(w>D.w*.96){w=D.w*.96;h=w*o.H/o.W}
 var e={id:a.nid(),type:'icon',ic:o.n,x:(opt&&opt.x!=null?opt.x:(D.w-w)/2),y:(opt&&opt.y!=null?opt.y:(D.h-h)/2),w:w,h:h,col:(opt&&opt.c)||col,op:opt&&opt.op!=null?opt.op:1,rot:opt&&opt.r||0};
 if(opt&&opt.back)D.els.unshift(e);else D.els.push(e);return e}
function done(ids){var a=api();a.push();a.draw();if(ids)a.setSel(ids);else a.props()}
function find(n){return O.filter(function(o){return o.n==='زخرفة · '+n})[0]}
function frameFor(){var D=api().D(),W=D.w,H=D.h,k=Math.round(W/H*20)/20,n='زخرفة · إطار الصفحة '+k;if(!SD.icons.some(function(i){return i[0]===n}))SD.icons.push([n,toD(frame(1000,1000/k),1000,1000/k),false,'orn']);return n}
var KITS=[
 ['🌙 ترويسة رمضانية',function(){var D=api().D(),m=Math.min(D.w,D.h),ids=[],c=find('هلال ونجمة'),d=find('فاصل ملكي'),l=find('فانوس');var a=put(c,{s:22,y:D.h*.06}),b=put(d,{s:60,y:D.h*.06+m*.26}),lf=put(l,{s:12,x:D.w*.08,y:D.h*.04}),rt=put(l,{s:12,x:D.w*.92-m*.12,y:D.h*.04});return[a.id,b.id,lf.id,rt.id]}],
 ['🖼 إطار حول الصفحة',function(){var D=api().D(),n=frameFor(),e={id:api().nid(),type:'icon',ic:n,x:D.w*.03,y:D.h*.03,w:D.w*.94,h:D.h*.94,col:col,op:1,rot:0};D.els.push(e);return[e.id]}],
 ['📐 أربع زوايا مزخرفة',function(){var D=api().D(),c=find('زاوية مزخرفة'),m=Math.min(D.w,D.h),s=m*.16,ids=[],q=D.w*.03,p=D.h*.03;[[q,p,0],[D.w-q-s,p,90],[D.w-q-s,D.h-p-s,180],[q,D.h-p-s,270]].forEach(function(z){var e=put(c,{s:16,x:z[0],y:z[1],r:z[2]});ids.push(e.id)});return ids}],
 ['🏅 ختم جودة',function(){var s=find('ختم مسنن'),t=find('نجمة خماسية'),D=api().D(),m=Math.min(D.w,D.h),a=put(s,{s:34}),b=put(t,{s:14,c:'#ffffff'});return[a.id,b.id]}],
 ['🕌 مشهد مسجد وهلال',function(){var D=api().D(),m=Math.min(D.w,D.h),a=put(find('مسجد ومئذنتان'),{s:60,y:D.h*.62}),b=put(find('هلال'),{s:16,x:D.w*.7,y:D.h*.12}),c=put(find('نجمة خماسية'),{s:6,x:D.w*.55,y:D.h*.2});return[a.id,b.id,c.id]}]];
function tile(){var a=api(),D=a.D(),srcEl=a.selEls()[0],o=(srcEl&&srcEl.type==='icon'?O.filter(function(x){return x.n===srcEl.ic})[0]:null)||last||O[0];var m=Math.min(D.w,D.h),w=m*.09,h=w*o.H/o.W,gx=w*1.5,gy=h*1.5,cols=Math.ceil(D.w/gx)+1,rows=Math.ceil(D.h/gy)+1,n=0,ids=[];if(cols*rows>420){gx*=1.6;gy*=1.6;cols=Math.ceil(D.w/gx)+1;rows=Math.ceil(D.h/gy)+1}
 for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var e=put(o,{s:w/m*100,x:c*gx+(r%2?gx/2:0)-w/2,y:r*gy-h/2,c:col,op:.16,back:1});n++}
 done();a.toast('🧩 أُضيف '+n+' عنصرًا بالخلفية (اضغط تراجع للإزالة)')}
SD.tabFn.orn=function(p){var h='<h4>🎨 لون الزخرفة</h4><div class="st-sw" id="or-col">'+COL.map(function(c){return '<button type="button" data-c="'+c+'" style="background:'+c+(c===col?';outline:2px solid #a78bfa':'')+'" aria-label="'+c+'"></button>'}).join('')+'<input type="color" id="or-cp" value="'+col+'" aria-label="لون مخصص" style="width:30px;height:28px;border:0;background:none;padding:0">'+'</div>'+
 '<div class="pr"><label>الحجم عند الإضافة: <b id="or-sv">'+size+'%</b></label><input type="range" id="or-sz" min="6" max="100" value="'+size+'"></div>'+
 '<h4>✨ أطقم جاهزة</h4><div class="st-chips" id="or-kits">'+KITS.map(function(k,i){return '<button type="button" data-k="'+i+'">'+k[0]+'</button>'}).join('')+'</div>';
 Object.keys(GN).forEach(function(g){h+='<h4>'+GN[g]+'</h4><div class="st-igrid big orn-g">'+O.filter(function(o){return o.g===g||(g==='f'&&o.g==='f')}).map(function(o){var k=Math.max(o.W,o.H),w=Math.round(78*o.W/k),hh=Math.round(78*o.H/k);return '<button type="button" data-n="'+o.n+'" title="'+o.n.replace('زخرفة · ','')+'"><svg viewBox="0 0 24 24" preserveAspectRatio="none" width="'+w+'" height="'+hh+'" fill="#d4af37"><path d="'+o.d+'"/></svg></button>'}).join('')+'</div>'});
 h+='<h4>🧩 بلاط زخرفي للخلفية</h4><p class="st-hint">حدّد زخرفة على الصفحة (أو اخترها آخر مرة) ثم اضغط لتكرارها بنمط شفاف خلف تصميمك.</p><button type="button" class="st-big" id="or-tile">تكرار كخلفية</button>';
 p.innerHTML=h;
 [].forEach.call(p.querySelectorAll('#or-col button'),function(b){b.onclick=function(){col=b.dataset.c;var sel=api().selEls().filter(function(e){return e.type==='icon'&&String(e.ic).indexOf('زخرفة')===0});sel.forEach(function(e){e.col=col});if(sel.length){api().push();api().draw();api().props()}SD.tabFn.orn(p)}});
 p.querySelector('#or-cp').oninput=function(){col=this.value;var sel=api().selEls().filter(function(e){return e.type==='icon'&&String(e.ic).indexOf('zخ')===0||String(e.ic).indexOf('زخرفة')===0});sel.forEach(function(e){e.col=col});api().draw()};
 p.querySelector('#or-sz').oninput=function(){size=+this.value;p.querySelector('#or-sv').textContent=size+'%'};
 [].forEach.call(p.querySelectorAll('#or-kits button'),function(b){b.onclick=function(){var ids=KITS[+b.dataset.k][1]();done(ids)}});
 [].forEach.call(p.querySelectorAll('.orn-g button'),function(b){b.onclick=function(){var o=O.filter(function(x){return x.n===b.dataset.n})[0];last=o;var e=put(o);done([e.id])}});
 p.querySelector('#or-tile').onclick=tile};
/* إدراج التبويب في الشريط */
function addTab(){var t=document.getElementById('st-tabs');if(!t||t.querySelector('[data-t="orn"]'))return;var b=document.createElement('button');b.dataset.t='orn';b.innerHTML='<i>💠</i><span>زخارف</span>';b.dataset.ui=1;b.onclick=function(){api().ptabsSet?0:0;S.api.ptabs&&null;[].forEach.call(t.querySelectorAll('button'),function(x){x.classList.toggle('on',x===b)});SD.tabFn.orn(document.getElementById('st-pane'))};var ref=t.querySelector('[data-t="ext"]');t.insertBefore(b,ref||null)}
function boot(){var t=document.getElementById('st-tabs');if(!t||!t.children.length)return setTimeout(boot,150);addTab();[].forEach.call(t.querySelectorAll('button'),function(x){if(x.dataset.t!=='orn'){var o=x.onclick;x.onclick=function(ev){var on=t.querySelector('[data-t="orn"]');on&&on.classList.remove('on');return o.call(this,ev)}}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,60)});else setTimeout(boot,60);
})();
