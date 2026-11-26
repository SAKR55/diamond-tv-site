/* DIAMOND Studio — أشكال إضافية + تأثيرات نص + أنماط + ملصقات + مرشدات + دوتون */
(function(){
var SD=window.SD;if(!SD)return;
var TAU=Math.PI*2;
// ===== أشكال جديدة =====
function pts(p,a,w,h){a.forEach(function(q,i){var x=q[0]*w,y=q[1]*h;i?p.lineTo(x,y):p.moveTo(x,y)});p.closePath()}
function star(p,n,ri,rot,w,h){var cx=w/2,cy=h/2;for(var i=0;i<n*2;i++){var a=rot+i*Math.PI/n,r=i%2?ri:1,x=cx+Math.cos(a)*cx*r,y=cy+Math.sin(a)*cy*r;i?p.lineTo(x,y):p.moveTo(x,y)}p.closePath()}
function ngon(p,n,rot,w,h){var cx=w/2,cy=h/2;for(var i=0;i<n;i++){var a=rot+i*TAU/n,x=cx+Math.cos(a)*cx,y=cy+Math.sin(a)*cy;i?p.lineTo(x,y):p.moveTo(x,y)}p.closePath()}
function circ(p,x,y,r){p.moveTo(x+r,y);p.arc(x,y,r,0,TAU)}
function hole(p,x,y,r){p.moveTo(x+r,y);p.arc(x,y,r,0,TAU,true)}
var NEW={
star6:function(p,w,h){star(p,6,.55,-Math.PI/2,w,h)},
star8:function(p,w,h){star(p,8,.55,-Math.PI/2,w,h)},
star12:function(p,w,h){star(p,12,.75,-Math.PI/2,w,h)},
seal24:function(p,w,h){star(p,24,.9,0,w,h)},
hept:function(p,w,h){ngon(p,7,-Math.PI/2,w,h)},
nona:function(p,w,h){ngon(p,9,-Math.PI/2,w,h)},
deca:function(p,w,h){ngon(p,10,-Math.PI/2,w,h)},
dodec:function(p,w,h){ngon(p,12,-Math.PI/2,w,h)},
hex2:function(p,w,h){ngon(p,6,-Math.PI/2,w,h)},
arrowL:function(p,w,h){pts(p,[[1,.3],[.4,.3],[.4,0],[0,.5],[.4,1],[.4,.7],[1,.7]],w,h)},
arrowU:function(p,w,h){pts(p,[[.3,1],[.3,.4],[0,.4],[.5,0],[1,.4],[.7,.4],[.7,1]],w,h)},
arrowD:function(p,w,h){pts(p,[[.3,0],[.7,0],[.7,.6],[1,.6],[.5,1],[0,.6],[.3,.6]],w,h)},
dblarrow:function(p,w,h){pts(p,[[0,.5],[.22,0],[.22,.3],[.78,.3],[.78,0],[1,.5],[.78,1],[.78,.7],[.22,.7],[.22,1]],w,h)},
pentarrow:function(p,w,h){pts(p,[[0,0],[.72,0],[1,.5],[.72,1],[0,1]],w,h)},
chevL:function(p,w,h){pts(p,[[.3,0],[1,0],[.7,.5],[1,1],[.3,1],[0,.5]],w,h)},
notch:function(p,w,h){pts(p,[[0,0],[.7,0],[1,.5],[.7,1],[0,1],[.25,.5]],w,h)},
sparkle:function(p,w,h){var cx=w/2,cy=h/2;p.moveTo(cx,0);p.quadraticCurveTo(cx,cy,w,cy);p.quadraticCurveTo(cx,cy,cx,h);p.quadraticCurveTo(cx,cy,0,cy);p.quadraticCurveTo(cx,cy,cx,0);p.closePath()},
bolt:function(p,w,h){pts(p,[[.62,0],[.15,.56],[.45,.56],[.33,1],[.85,.4],[.55,.4],[.72,0]],w,h)},
sun:function(p,w,h){var cx=w/2,cy=h/2;for(var i=0;i<12;i++){var a=i*TAU/12,b=.13;p.moveTo(cx+Math.cos(a-b)*cx*.62,cy+Math.sin(a-b)*cy*.62);p.lineTo(cx+Math.cos(a)*cx,cy+Math.sin(a)*cy);p.lineTo(cx+Math.cos(a+b)*cx*.62,cy+Math.sin(a+b)*cy*.62);p.closePath()}p.moveTo(cx+cx*.6,cy);p.ellipse(cx,cy,cx*.6,cy*.6,0,0,TAU)},
gear:function(p,w,h){var cx=w/2,cy=h/2,n=8,st=TAU/n,k=0;for(var i=0;i<n;i++){var a=i*st;[[-.2,.78],[-.11,1],[.11,1],[.2,.78]].forEach(function(q){var aa=a+q[0]*st*1.2,x=cx+Math.cos(aa)*cx*q[1],y=cy+Math.sin(aa)*cy*q[1];k++?p.lineTo(x,y):p.moveTo(x,y)})}p.closePath();p.moveTo(cx+cx*.3,cy);p.ellipse(cx,cy,cx*.3,cy*.3,0,0,TAU,true)},
flower:function(p,w,h){var cx=w/2,cy=h/2;for(var i=0;i<6;i++){var a=i*TAU/6,x=cx+Math.cos(a)*cx*.52,y=cy+Math.sin(a)*cy*.52;p.moveTo(x+cx*.5,y);p.ellipse(x,y,cx*.5,cy*.5,0,0,TAU)}p.moveTo(cx+cx*.45,cy);p.ellipse(cx,cy,cx*.45,cy*.45,0,0,TAU)},
clover:function(p,w,h){var cx=w/2,cy=h/2,r=.27;[[.5,.27],[.5,.73],[.27,.5],[.73,.5]].forEach(function(q){p.moveTo(q[0]*w+w*r,q[1]*h);p.ellipse(q[0]*w,q[1]*h,w*r,h*r,0,0,TAU)});p.rect(w*.3,h*.3,w*.4,h*.4)},
scallop:function(p,w,h){var cx=w/2,cy=h/2;for(var i=0;i<14;i++){var a=i*TAU/14,x=cx+Math.cos(a)*cx*.8,y=cy+Math.sin(a)*cy*.8;p.moveTo(x+cx*.2,y);p.ellipse(x,y,cx*.2,cy*.2,0,0,TAU)}p.moveTo(cx+cx*.82,cy);p.ellipse(cx,cy,cx*.82,cy*.82,0,0,TAU)},
wave:function(p,w,h){p.moveTo(0,0);p.lineTo(w,0);p.lineTo(w,h*.8);p.bezierCurveTo(w*.75,h*.55,w*.65,h*1.05,w*.5,h*.8);p.bezierCurveTo(w*.35,h*.55,w*.25,h*1.05,0,h*.8);p.closePath()},
semi:function(p,w,h){p.moveTo(0,h);p.ellipse(w/2,h,w/2,h,0,Math.PI,0);p.closePath()},
quarter:function(p,w,h){p.moveTo(0,h);p.lineTo(0,0);p.ellipse(0,h,w,h,0,-Math.PI/2,0);p.closePath()},
arch:function(p,w,h){var r=w/2;p.moveTo(0,h);p.lineTo(0,r);p.arc(r,r,r,Math.PI,0);p.lineTo(w,h);p.closePath()},
frame:function(p,w,h){var t=Math.min(w,h)*.14;p.rect(0,0,w,h);p.moveTo(t,t);p.lineTo(t,h-t);p.lineTo(w-t,h-t);p.lineTo(w-t,t);p.closePath()},
shield:function(p,w,h){var cx=w/2;p.moveTo(cx,0);p.bezierCurveTo(w*.7,h*.1,w*.9,h*.12,w,h*.12);p.lineTo(w,h*.5);p.bezierCurveTo(w,h*.8,w*.62,h*.92,cx,h);p.bezierCurveTo(w*.38,h*.92,0,h*.8,0,h*.5);p.lineTo(0,h*.12);p.bezierCurveTo(w*.1,h*.12,w*.3,h*.1,cx,0);p.closePath()},
pin:function(p,w,h){var r=w/2;p.moveTo(r,h);p.bezierCurveTo(w*.15,h*.68,0,h*.5,0,r);p.arc(r,r,r,Math.PI,0);p.bezierCurveTo(w,h*.5,w*.85,h*.68,r,h);p.closePath();hole(p,r,r,r*.42)},
tag:function(p,w,h){pts(p,[[.22,0],[1,0],[1,1],[.22,1],[0,.5]],w,h);hole(p,w*.15,h*.5,Math.min(w,h)*.07)},
ticket:function(p,w,h){var r=h*.14,cy=h/2;p.moveTo(0,0);p.lineTo(w,0);p.lineTo(w,cy-r);p.arc(w,cy,r,-Math.PI/2,Math.PI/2,true);p.lineTo(w,h);p.lineTo(0,h);p.lineTo(0,cy+r);p.arc(0,cy,r,Math.PI/2,-Math.PI/2,true);p.closePath()},
banner:function(p,w,h){pts(p,[[.1,0],[.9,0],[.9,.15],[1,.15],[.93,.5],[1,.85],[.9,.85],[.9,1],[.1,1],[.1,.85],[0,.85],[.07,.5],[0,.15],[.1,.15]],w,h)},
flag:function(p,w,h){p.rect(0,0,w*.07,h);p.moveTo(w*.07,h*.02);p.bezierCurveTo(w*.35,h*.18,w*.65,-h*.02,w,h*.12);p.lineTo(w,h*.52);p.bezierCurveTo(w*.65,h*.38,w*.35,h*.58,w*.07,h*.42);p.closePath()},
speech:function(p,w,h){p.moveTo(w,h*.4);p.ellipse(w/2,h*.4,w/2,h*.4,0,0,TAU);p.moveTo(w*.25,h*.7);p.lineTo(w*.45,h*.78);p.lineTo(w*.12,h);p.closePath()},
thought:function(p,w,h){p.moveTo(w,h*.38);p.ellipse(w/2,h*.38,w/2,h*.38,0,0,TAU);circ(p,w*.25,h*.82,h*.08);circ(p,w*.12,h*.95,h*.045)},
check:function(p,w,h){pts(p,[[0,.55],[.15,.4],[.4,.65],[.85,.15],[1,.3],[.4,.95]],w,h)},
xmark:function(p,w,h){var t=.33,L=[[t,0],[1-t,0],[1-t,t],[1,t],[1,1-t],[1-t,1-t],[1-t,1],[t,1],[t,1-t],[0,1-t],[0,t],[t,t]].map(function(q){var x=q[0]-.5,y=q[1]-.5,c=.7071;return[.5+(x*c-y*c)*.98,.5+(x*c+y*c)*.98]});pts(p,L,w,h)},
house:function(p,w,h){pts(p,[[.5,0],[1,.45],[.85,.45],[.85,1],[.15,1],[.15,.45],[0,.45]],w,h)},
rtri:function(p,w,h){pts(p,[[0,0],[1,1],[0,1]],w,h)},
lens:function(p,w,h){var cy=h/2;p.moveTo(0,cy);p.quadraticCurveTo(w/2,-cy,w,cy);p.quadraticCurveTo(w/2,h+cy,0,cy);p.closePath()},
leaf:function(p,w,h){p.moveTo(0,h);p.quadraticCurveTo(0,0,w,0);p.quadraticCurveTo(w,h,0,h);p.closePath()},
snip:function(p,w,h){var r=Math.min(w,h)*.2;pts(p,[[r/w,0],[1-r/w,0],[1,r/h],[1,1-r/h],[1-r/w,1],[r/w,1],[0,1-r/h],[0,r/h]],w,h)},
pill:function(p,w,h){var r=Math.min(w,h)/2;p.moveTo(r,0);p.arcTo(w,0,w,h,r);p.arcTo(w,h,0,h,r);p.arcTo(0,h,0,0,r);p.arcTo(0,0,w,0,r);p.closePath()},
slant:function(p,w,h){pts(p,[[0,0],[1,0],[1,.7],[0,1]],w,h)},
tabs:function(p,w,h){pts(p,[[0,.2],[.08,0],[.4,0],[.48,.2],[1,.2],[1,1],[0,1]],w,h)},
cresc:function(p,w,h){var cx=w/2,cy=h/2;p.moveTo(cx,0);p.bezierCurveTo(w*1.05,h*.1,w*1.05,h*.9,cx,h);p.bezierCurveTo(w*.62,h*.82,w*.62,h*.18,cx,0);p.closePath()},
infin:function(p,w,h){var cy=h/2;p.moveTo(w/2,cy);p.bezierCurveTo(w*.62,-h*.15,w*1.05,-h*.1,w*1.05,cy);p.bezierCurveTo(w*1.05,h*1.1,w*.62,h*1.15,w/2,cy);p.bezierCurveTo(w*.38,-h*.15,-w*.05,-h*.1,-w*.05,cy);p.bezierCurveTo(-w*.05,h*1.1,w*.38,h*1.15,w/2,cy);p.closePath()}
};
var NAMES={star6:'نجمة سداسية',star8:'نجمة ثمانية',star12:'نجمة 12',seal24:'ختم 24',hept:'سباعي',nona:'تساعي',deca:'عشاري',dodec:'اثنا عشري',hex2:'سداسي رأسي',arrowL:'سهم يسار',arrowU:'سهم أعلى',arrowD:'سهم أسفل',dblarrow:'سهم مزدوج',pentarrow:'سهم خماسي',chevL:'شيفرون يسار',notch:'سهم مشقوق',sparkle:'بريق',bolt:'صاعقة',sun:'شمس',gear:'ترس',flower:'زهرة',clover:'برسيم',scallop:'ختم متموج',wave:'موجة',semi:'نصف دائرة',quarter:'ربع دائرة',arch:'قوس',frame:'إطار',shield:'درع',pin:'دبوس موقع',tag:'بطاقة سعر',ticket:'تذكرة',banner:'لافتة',flag:'علم',speech:'فقاعة دائرية',thought:'فقاعة تفكير',check:'صح',xmark:'خطأ',house:'منزل',rtri:'مثلث قائم',lens:'عدسة',leaf:'ورقة',snip:'زوايا مقطوعة',pill:'كبسولة',slant:'مائل',tabs:'تبويب',cresc:'هلال ناعم',infin:'لانهاية'};
var old=SD.shapePath;
SD.shapePath=function(k,w,h,r){if(NEW[k]){var p=new Path2D();NEW[k](p,w,h);return p}return old(k,w,h,r)};
Object.keys(NEW).forEach(function(k){SD.shapes.push([k,NAMES[k]||k])});

// ===== تبويب التأثيرات والأدوات =====
var GD={c:0,t:0,g:0,d:0,m:0};
var prevO=SD.overlayFn;
SD.overlayFn=function(o,D,z){if(prevO)prevO(o,D,z);if(!(GD.c||GD.t||GD.g||GD.d||GD.m))return;var W=D.w,H=D.h;o.save();o.lineWidth=1.5/z;o.strokeStyle='rgba(6,182,212,.9)';o.setLineDash([8/z,6/z]);o.beginPath();
 function L(x1,y1,x2,y2){o.moveTo(x1,y1);o.lineTo(x2,y2)}
 if(GD.c){L(W/2,0,W/2,H);L(0,H/2,W,H/2)}
 if(GD.t){L(W/3,0,W/3,H);L(W*2/3,0,W*2/3,H);L(0,H/3,W,H/3);L(0,H*2/3,W,H*2/3)}
 if(GD.g){var f=.382;L(W*f,0,W*f,H);L(W*(1-f),0,W*(1-f),H);L(0,H*f,W,H*f);L(0,H*(1-f),W,H*(1-f))}
 if(GD.d){L(0,0,W,H);L(W,0,0,H)}
 if(GD.m){var m=Math.min(W,H)*.06;o.rect(m,m,W-2*m,H-2*m)}
 o.stroke();o.restore()};
function api(){return window.Studio.api}
function copyEl(e,over){var c=JSON.parse(JSON.stringify(e));c.id=api().nid();delete c.gid;return Object.assign(c,over||{})}
function insertBefore(e,list){var D=api().D(),i=D.els.indexOf(e);list.forEach(function(c,k){D.els.splice(i+k,0,c)})}
function selOf(type){var E=api().selEls().filter(function(e){return e.type===type});if(!E.length){api().toast(type==='text'?'اختر عنصر نص أولًا':'اختر صورة أولًا');return null}return E}
function tfx(kind,c1,c2){var E=selOf('text');if(!E)return;var a=api();E.forEach(function(e){var L=[],col=typeof e.col==='string'?e.col:'#ffffff',gid='g'+Date.now()+Math.random();
 function off(dx,dy,color,extra){return copyEl(e,Object.assign({x:e.x+dx,y:e.y+dy,col:color,sh:null,gid:gid},extra||{}))}
 if(kind==='3d'){for(var i=14;i>=1;i--)L.push(off(i*1.6,i*1.6,c2))}
 else if(kind==='long'){for(var i=60;i>=1;i--)L.push(off(i*1.2,i*1.2,c2))}
 else if(kind==='retro'){L.push(off(10,10,c2),off(5,5,c1))}
 else if(kind==='glitch'){L.push(off(-6,0,'#ff0040'),off(6,0,'#00e5ff'))}
 else if(kind==='neon'){L.push(off(0,0,c1,{sh:{c:c1,b:60,x:0,y:0}}),off(0,0,c1,{sh:{c:c1,b:25,x:0,y:0}}));e.col='#ffffff';e.sh={c:c1,b:8,x:0,y:0}}
 else if(kind==='outline'){var r=Math.max(2,e.fs*.04);for(var k=0;k<12;k++){var an=k*Math.PI/6;L.push(off(Math.cos(an)*r,Math.sin(an)*r,c2))}}
 else if(kind==='emboss'){L.push(off(-2,-2,'#ffffff'),off(3,3,'#000000'))}
 else if(kind==='echo'){for(var i=4;i>=1;i--)L.push(off(-i*14,0,c1,{op:(e.op==null?1:e.op)*(.18+.1*(4-i))}))}
 L.forEach(function(c){c.gid=gid});e.gid=gid;insertBefore(e,L)});a.push();a.draw();a.props();a.toast('طُبّق التأثير — العناصر مجمّعة ويمكن فكّ التجميع')}
function bake(e,fn){var a=api(),im=a.getImg(e.src);if(!im||!im.complete||!im.naturalWidth){a.toast('انتظر تحميل الصورة');return}var c=document.createElement('canvas');var sc=Math.min(1,1600/Math.max(im.naturalWidth,im.naturalHeight));c.width=im.naturalWidth*sc;c.height=im.naturalHeight*sc;var x=c.getContext('2d');x.drawImage(im,0,0,c.width,c.height);var d=x.getImageData(0,0,c.width,c.height);fn(d.data,c.width,c.height,x,c);if(!fn.skipPut)x.putImageData(d,0,0);e.src=a.addAsset(c.toDataURL('image/png'));a.push();a.draw();a.props()}
function hx(h){h=h.replace('#','');return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)]}
function ifx(kind,v){var E=selOf('image');if(!E)return;E.forEach(function(e){bake(e,function(d,w,h,x,c){
 if(kind==='duo'){var A=hx(v[0]),B=hx(v[1]);for(var i=0;i<d.length;i+=4){var l=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)/255;d[i]=A[0]+(B[0]-A[0])*l;d[i+1]=A[1]+(B[1]-A[1])*l;d[i+2]=A[2]+(B[2]-A[2])*l}}
 else if(kind==='invert'){for(var i=0;i<d.length;i+=4){d[i]=255-d[i];d[i+1]=255-d[i+1];d[i+2]=255-d[i+2]}}
 else if(kind==='poster'){var n=v||4,st=255/(n-1);for(var i=0;i<d.length;i+=4){for(var k=0;k<3;k++)d[i+k]=Math.round(d[i+k]/st)*st}}
 else if(kind==='pixel'){var s=v||14,o=document.createElement('canvas');o.width=Math.max(1,Math.round(w/s));o.height=Math.max(1,Math.round(h/s));var ox=o.getContext('2d');ox.putImageData(x.getImageData(0,0,w,h),0,0);var t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d').putImageData(d,0,0);ox.clearRect(0,0,o.width,o.height);ox.drawImage(t,0,0,o.width,o.height);x.imageSmoothingEnabled=false;x.clearRect(0,0,w,h);x.drawImage(o,0,0,w,h);fn.skipPut=true;return}
 else if(kind==='key'){var K=hx(v[0]),tol=v[1];for(var i=0;i<d.length;i+=4){var dist=Math.sqrt(Math.pow(d[i]-K[0],2)+Math.pow(d[i+1]-K[1],2)+Math.pow(d[i+2]-K[2],2));if(dist<tol)d[i+3]=0;else if(dist<tol*1.5)d[i+3]=Math.round(255*(dist-tol)/(tol*.5))}}
 else if(kind==='sharp'){var o2=new Uint8ClampedArray(d);for(var y=1;y<h-1;y++)for(var xx=1;xx<w-1;xx++){var p=(y*w+xx)*4;for(var k=0;k<3;k++)d[p+k]=Math.max(0,Math.min(255,5*o2[p+k]-o2[p-4+k]-o2[p+4+k]-o2[p-w*4+k]-o2[p+w*4+k]))}}
 else if(kind==='rot'){var t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d').putImageData(d,0,0);c.width=h;c.height=w;x.setTransform(1,0,0,1,0,0);x.translate(h,0);x.rotate(Math.PI/2);x.drawImage(t,0,0);var tmp=e.w;e.w=e.h;e.h=tmp;fn.skipPut=true;return}
 else if(kind==='noise'){for(var i=0;i<d.length;i+=4){var nz=(Math.random()-.5)*v;d[i]+=nz;d[i+1]+=nz;d[i+2]+=nz}}
 else if(kind==='border'){x.putImageData(d,0,0);x.lineWidth=Math.max(6,w*.025)*2;x.strokeStyle=v;x.strokeRect(0,0,w,h);fn.skipPut=true;return}
 fn.skipPut=false});fn.skipPut=false});api().toast('طُبّق على الصورة ✓')}
// أنماط
var PAT=[['نقاط','dots'],['خطوط مائلة','diag'],['شبكة','grid'],['موجات','wave'],['مثلثات','tri'],['علامات +','plus'],['نجوم','star'],['سداسيات','hex'],['زجزاج','zig'],['دوائر متداخلة','rings'],['مربعات شطرنج','check'],['إسلامي نجمي','isl']];
function pattern(kind,c1,c2,sz){var W=1200,H=1200,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');x.fillStyle=c1;x.fillRect(0,0,W,H);x.fillStyle=c2;x.strokeStyle=c2;x.lineWidth=Math.max(2,sz*.12);var s=sz;
 for(var j=0;j<H/s+1;j++)for(var i=0;i<W/s+1;i++){var px=i*s,py=j*s;x.save();x.translate(px,py);
  if(kind==='dots'){x.beginPath();x.arc(s/2+(j%2)*s/2,s/2,s*.18,0,TAU);x.fill()}
  else if(kind==='diag'){x.beginPath();x.moveTo(0,s);x.lineTo(s,0);x.stroke()}
  else if(kind==='grid'){x.strokeRect(0,0,s,s)}
  else if(kind==='wave'){x.beginPath();x.moveTo(0,s/2);x.quadraticCurveTo(s/4,0,s/2,s/2);x.quadraticCurveTo(s*3/4,s,s,s/2);x.stroke()}
  else if(kind==='tri'){x.beginPath();x.moveTo(s/2,s*.15);x.lineTo(s*.85,s*.85);x.lineTo(s*.15,s*.85);x.closePath();if((i+j)%2)x.fill();else x.stroke()}
  else if(kind==='plus'){x.beginPath();x.moveTo(s/2,s*.3);x.lineTo(s/2,s*.7);x.moveTo(s*.3,s/2);x.lineTo(s*.7,s/2);x.stroke()}
  else if(kind==='star'){x.beginPath();for(var k=0;k<10;k++){var r=k%2?s*.12:s*.3,an=-Math.PI/2+k*Math.PI/5;k?x.lineTo(s/2+Math.cos(an)*r,s/2+Math.sin(an)*r):x.moveTo(s/2+Math.cos(an)*r,s/2+Math.sin(an)*r)}x.closePath();x.fill()}
  else if(kind==='hex'){x.translate((j%2)*s/2,0);x.beginPath();for(var k=0;k<6;k++){var an=k*Math.PI/3;k?x.lineTo(s/2+Math.cos(an)*s*.42,s/2+Math.sin(an)*s*.42):x.moveTo(s/2+Math.cos(an)*s*.42,s/2+Math.sin(an)*s*.42)}x.closePath();x.stroke()}
  else if(kind==='zig'){x.beginPath();x.moveTo(0,s*.3);x.lineTo(s/4,s*.7);x.lineTo(s/2,s*.3);x.lineTo(s*.75,s*.7);x.lineTo(s,s*.3);x.stroke()}
  else if(kind==='rings'){x.beginPath();x.arc(0,0,s*.5,0,TAU);x.stroke();x.beginPath();x.arc(s,s,s*.5,0,TAU);x.stroke()}
  else if(kind==='check'){if((i+j)%2)x.fillRect(0,0,s,s)}
  else if(kind==='isl'){x.beginPath();for(var k=0;k<16;k++){var r=k%2?s*.26:s*.44,an=k*Math.PI/8;k?x.lineTo(s/2+Math.cos(an)*r,s/2+Math.sin(an)*r):x.moveTo(s/2+Math.cos(an)*r,s/2+Math.sin(an)*r)}x.closePath();x.stroke()}
  x.restore()}
 return c}
var STK='😀 😍 🔥 ⭐ ✨ 💎 👑 🎁 🎉 🏆 💯 ❤️ 👍 🚀 💡 📣 🛒 💰 🏷️ ✅ ❌ ⚡ 🌙 ☀️ 🌟 🎯 📱 💻 📸 🎬 🎵 ☕ 🍔 🍕 🌹 🌸 🕌 🐪 🌴 ✈️ 🚗 🏠 📍 📞 ✉️ 🔔 🛍️ 💳 🎓 📚 🖌️ 🧿 🌈 🎈 🧁 🍰'.split(' ');
SD.tabFn.fx=function(p){var a=api();
 var h='<h4>🔤 تأثيرات النص (اختر نصًا)</h4><div class="st-row"><label>لون 1 <input type="color" id="fx-c1" value="#ff2bd6"></label><label>لون 2 <input type="color" id="fx-c2" value="#1e1b4b"></label></div><div class="pb fl" id="fx-t">'+[['3d','3D'],['long','ظل طويل'],['retro','ريترو'],['glitch','جليتش'],['neon','نيون'],['outline','حدود'],['emboss','نقش'],['echo','صدى']].map(function(x){return'<button data-k="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div><div class="pb fl" id="fx-case"><button data-c="u">ABC</button><button data-c="l">abc</button><button data-c="t">Abc</button></div>'+
 '<h4>🖼 أدوات الصورة (اختر صورة)</h4><div class="st-row"><label>دوتون <input type="color" id="fx-d1" value="#1e1b4b"><input type="color" id="fx-d2" value="#f472b6"></label></div><div class="pb fl" id="fx-i"><button data-k="duo">دوتون</button><button data-k="invert">عكس الألوان</button><button data-k="poster">بوستر</button><button data-k="pixel">بكسلة</button><button data-k="sharp">حدّة</button><button data-k="noise">حبيبات</button><button data-k="rot">تدوير 90°</button><button data-k="border">إطار</button></div><div class="st-row"><label>إزالة لون <input type="color" id="fx-k" value="#ffffff"></label><input type="range" id="fx-kt" min="10" max="160" value="60"><button class="st-big" id="fx-kb" style="background:#0f766e">إزالة اللون المختار (خلفية شفافة)</button></div>'+
 '<h4>🎨 قطّارة الألوان</h4><button class="st-big" id="fx-eye" style="background:#334155">اختر لونًا من الشاشة وطبّقه على العنصر</button>'+
 '<h4>🔁 تكرار</h4><div class="st-row"><label>صفوف <input type="number" id="fx-r" value="3" min="1" max="12" style="width:50px"></label><label>أعمدة <input type="number" id="fx-cl" value="3" min="1" max="12" style="width:50px"></label><label>مسافة <input type="number" id="fx-g" value="20" style="width:50px"></label></div><div class="pb"><button id="fx-grid">تكرار شبكي</button><button id="fx-rad">تكرار دائري</button></div>'+
 '<h4>📐 مرشدات</h4><div class="pb fl" id="fx-gd">'+[['c','المنتصف'],['t','الأثلاث'],['g','النسبة الذهبية'],['d','أقطار'],['m','هوامش']].map(function(x){return'<button data-k="'+x[0]+'" class="'+(GD[x[0]]?'on':'')+'">'+x[1]+'</button>'}).join('')+'</div>'+
 '<h4>🧩 أنماط وخلفيات</h4><div class="st-row"><label>لون <input type="color" id="fx-p1" value="#faf5ff"><input type="color" id="fx-p2" value="#c4b5fd"></label><label>حجم <input type="range" id="fx-ps" min="30" max="160" value="70"></label></div><div class="st-chips pats" id="fx-p">'+PAT.map(function(x){return'<button data-k="'+x[1]+'">'+x[0]+'</button>'}).join('')+'</div>'+
 '<h4>😀 ملصقات</h4><div class="st-igrid" id="fx-s" style="max-height:140px;overflow:auto"></div>';
 p.innerHTML=h;var q=function(s){return p.querySelector(s)},qa=function(s){return[].slice.call(p.querySelectorAll(s))};
 qa('#fx-t button').forEach(function(b){b.onclick=function(){tfx(b.dataset.k,q('#fx-c1').value,q('#fx-c2').value)}});
 qa('#fx-case button').forEach(function(b){b.onclick=function(){var E=selOf('text');if(!E)return;E.forEach(function(e){var t=e.t||'';e.t=b.dataset.c==='u'?t.toUpperCase():b.dataset.c==='l'?t.toLowerCase():t.replace(/\b[a-z]/g,function(m){return m.toUpperCase()})});a.push();a.draw();a.props()}});
 qa('#fx-i button').forEach(function(b){b.onclick=function(){var k=b.dataset.k,v=null;if(k==='duo')v=[q('#fx-d1').value,q('#fx-d2').value];if(k==='poster')v=4;if(k==='pixel')v=14;if(k==='noise')v=40;if(k==='border')v=q('#fx-c1').value;ifx(k,v)}});
 q('#fx-kb').onclick=function(){ifx('key',[q('#fx-k').value,+q('#fx-kt').value])};
 q('#fx-eye').onclick=function(){if(!window.EyeDropper){a.toast('متصفحك لا يدعم القطّارة — استخدم كروم/إيدج');return}new EyeDropper().open().then(function(r){var E=a.selEls();if(!E.length){a.toast('اختر عنصرًا أولًا ('+r.sRGBHex+')');return}E.forEach(function(e){if(e.type==='text')e.col=r.sRGBHex;else if(e.type==='icon')e.col=r.sRGBHex;else e.fill=r.sRGBHex});a.push();a.draw();a.props();a.toast('طُبّق '+r.sRGBHex)}).catch(function(){})};
 q('#fx-grid').onclick=function(){var E=a.selEls();if(!E.length){a.toast('اختر عنصرًا');return}var e=E[0],R=+q('#fx-r').value,C=+q('#fx-cl').value,g=+q('#fx-g').value,gid='g'+Date.now(),D=a.D(),ids=[];for(var r=0;r<R;r++)for(var c=0;c<C;c++){var n=(r||c)?copyEl(e,{x:e.x+c*(e.w+g),y:e.y+r*(e.h+g),gid:gid}):e;n.gid=gid;if(r||c)D.els.push(n);ids.push(n.id)}a.setSel(ids);a.push();a.draw()};
 q('#fx-rad').onclick=function(){var E=a.selEls();if(!E.length){a.toast('اختر عنصرًا');return}var e=E[0],n=Math.max(2,+q('#fx-cl').value*+q('#fx-r').value>24?24:+q('#fx-cl').value*+q('#fx-r').value),D=a.D(),cx=D.w/2,cy=D.h/2,ids=[e.id],gid='g'+Date.now();var ex=e.x+e.w/2-cx,ey=e.y+e.h/2-cy;e.gid=gid;for(var i=1;i<n;i++){var an=i*TAU/n,x=ex*Math.cos(an)-ey*Math.sin(an),y=ex*Math.sin(an)+ey*Math.cos(an);var c=copyEl(e,{x:cx+x-e.w/2,y:cy+y-e.h/2,rot:((e.rot||0)+an*180/Math.PI)%360,gid:gid});D.els.push(c);ids.push(c.id)}a.setSel(ids);a.push();a.draw()};
 qa('#fx-gd button').forEach(function(b){b.onclick=function(){GD[b.dataset.k]=GD[b.dataset.k]?0:1;b.classList.toggle('on');a.draw()}});
 qa('#fx-p button').forEach(function(b){b.onclick=function(){var cv=pattern(b.dataset.k,q('#fx-p1').value,q('#fx-p2').value,+q('#fx-ps').value),k=a.addAsset(cv.toDataURL('image/png')),D=a.D();var e={id:a.nid(),type:'image',src:k,x:0,y:0,w:D.w,h:D.h,rot:0,op:1,clip:'rect',z:1};D.els.unshift(e);a.setSel([e.id]);a.push();a.draw();a.toast('أُضيف النمط خلف العناصر')}});
 var sg=q('#fx-s');STK.forEach(function(s){var b=document.createElement('button');b.textContent=s;b.style.fontSize='22px';b.onclick=function(){var D=a.D(),e={id:a.nid(),type:'text',t:s,x:D.w/2-D.w*.08,y:D.h/2-D.w*.08,w:D.w*.16,fs:D.w*.12,col:'#000',ff:'Cairo',fw:'400',ta:'center',lh:1.2,op:1,rot:0};D.els.push(e);a.setSel([e.id]);a.push();a.draw()};sg.appendChild(b)})};
})();
