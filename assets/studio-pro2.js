/* Studio: أدوات احترافية — تحرير صور متقدم (مستويات/منحنيات/حرارة/ظلال وإضاءات/حدّة/وضوح/حبيبات/بكسلة/ثنائي اللون/إطار معتم)،
   فرشاة وممحاة على طبقة رسم، وتصدير بدقة عالية (حتى 8×) مع DPI وجودة قابلة للضبط */
(function(){
var SD=window.SD;if(!SD||!SD.tabFn||!SD.tabFn.ext)return;
var orig=SD.tabFn.ext;
function $(s,r){return(r||document).querySelector(s)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function hex2rgb(h){h=(h||'#000').replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');return[parseInt(h.substr(0,2),16)||0,parseInt(h.substr(2,2),16)||0,parseInt(h.substr(4,2),16)||0]}
(function(){var s=document.createElement('style');s.textContent='.p2r{display:flex;align-items:center;gap:6px;font-size:12px;margin:5px 0}.p2r span{flex:0 0 74px}.p2r input[type=range]{flex:1;min-width:0}.p2r b{flex:0 0 34px;text-align:left;font-weight:600;color:#a78bfa;direction:ltr}.p2g{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.p2g button{font-size:11px;padding:5px 8px}.p2pv{display:block;max-width:100%;margin:8px auto;border-radius:6px;background:repeating-conic-gradient(#8883 0 25%,#0000 0 50%) 0 0/14px 14px}';document.head.appendChild(s)})();

/* ---------- معالجة البكسلات ---------- */
var DEF={exp:0,blk:0,wht:255,gam:1,c1:64,c2:128,c3:192,hl:0,sh:0,tmp:0,tnt:0,vib:0,sat:0,shp:0,clr:0,den:0,grn:0,pix:0,pst:0,duo:0,d1:'#1e1b4b',d2:'#fde68a',vig:0};
function curveLUT(P){var xs=[0,64,128,192,255],ys=[0,P.c1,P.c2,P.c3,255],n=5,m=[],d=[],i;
 for(i=0;i<n-1;i++)d[i]=(ys[i+1]-ys[i])/(xs[i+1]-xs[i]);m[0]=d[0];m[n-1]=d[n-2];for(i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
 for(i=0;i<n-1;i++){if(d[i]===0){m[i]=m[i+1]=0}else{var a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b;if(s>9){var t=3/Math.sqrt(s);m[i]=t*a*d[i];m[i+1]=t*b*d[i]}}}
 var L=new Uint8ClampedArray(256);for(var x=0;x<256;x++){var k=0;while(k<n-2&&x>xs[k+1])k++;var h=xs[k+1]-xs[k],t2=(x-xs[k])/h,t3=t2*t2,t4=t3*t2;L[x]=(2*t4-3*t3+1)*ys[k]+(t4-2*t3+t2)*h*m[k]+(-2*t4+3*t3)*ys[k+1]+(t4-t3)*h*m[k+1]}return L}
function toneLUT(P){var cl=curveLUT(P),L=new Uint8ClampedArray(256),ex=Math.pow(2,P.exp),rg=Math.max(1,P.wht-P.blk);
 for(var i=0;i<256;i++){var v=clamp(i*ex,0,255);v=clamp((v-P.blk)/rg,0,1);v=Math.pow(v,1/P.gam)*255;L[i]=cl[Math.round(clamp(v,0,255))]}return L}
function boxBlur(src,w,h,r){if(r<1)return src.slice();var tmp=new Float32Array(src.length),out=new Float32Array(src.length),k=2*r+1;
 for(var y=0;y<h;y++){for(var c=0;c<3;c++){var s=0,o=y*w*4+c,i;for(i=-r;i<=r;i++)s+=src[o+clamp(i,0,w-1)*4];for(var x=0;x<w;x++){tmp[o+x*4]=s/k;s+=src[o+clamp(x+r+1,0,w-1)*4]-src[o+clamp(x-r,0,w-1)*4]}}}
 for(var x2=0;x2<w;x2++){for(var c2=0;c2<3;c2++){var s2=0,o2=x2*4+c2,j;for(j=-r;j<=r;j++)s2+=tmp[o2+clamp(j,0,h-1)*w*4];for(var y2=0;y2<h;y2++){out[o2+y2*w*4]=s2/k;s2+=tmp[o2+clamp(y2+r+1,0,h-1)*w*4]-tmp[o2+clamp(y2-r,0,h-1)*w*4]}}}
 return out}
function process(src,P){var w=src.width,h=src.height,c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d',{willReadFrequently:true});x.drawImage(src,0,0);
 if(P.pix>1){var bs=Math.max(2,Math.round(P.pix*w/800)),sw=Math.max(1,Math.ceil(w/bs)),sh2=Math.max(1,Math.ceil(h/bs)),t=document.createElement('canvas');t.width=sw;t.height=sh2;var tx=t.getContext('2d');tx.imageSmoothingQuality='high';tx.drawImage(c,0,0,sw,sh2);x.imageSmoothingEnabled=false;x.clearRect(0,0,w,h);x.drawImage(t,0,0,sw,sh2,0,0,sw*bs,sh2*bs);x.imageSmoothingEnabled=true}
 var id=x.getImageData(0,0,w,h),d=id.data,n=w*h;
 var tone=toneLUT(P),r2=P.tmp/100,t2=P.tnt/100,hlk=P.hl/100,shk=P.sh/100,vb=P.vib/100,sa=1+P.sat/100,dr1=hex2rgb(P.d1),dr2=hex2rgb(P.d2),ps=P.pst>1?P.pst:0;
 var needLum=hlk||shk||vb||P.duo;
 for(var i=0;i<n;i++){var p=i*4,r=tone[d[p]],g=tone[d[p+1]],b=tone[d[p+2]];
  if(r2||t2){r+=r2*28-t2*0;b-=r2*28;g+=t2*-18;r+=t2*10;b+=t2*10}
  var l=(r*.299+g*.587+b*.114)/255;
  if(hlk||shk){var hm=l*l,sm=(1-l)*(1-l),adj=hlk*hm*70+shk*sm*70;r+=adj;g+=adj;b+=adj}
  if(vb||P.sat){var mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat0=mx>0?(mx-mn)/mx:0,k=sa*(1+vb*(1-sat0)),ll=(r+g+b)/3;r=ll+(r-ll)*k;g=ll+(g-ll)*k;b=ll+(b-ll)*k}
  if(P.duo){var q=clamp((r*.299+g*.587+b*.114)/255,0,1);r=dr1[0]+(dr2[0]-dr1[0])*q;g=dr1[1]+(dr2[1]-dr1[1])*q;b=dr1[2]+(dr2[2]-dr1[2])*q}
  if(ps){var st=255/(ps-1);r=Math.round(r/st)*st;g=Math.round(g/st)*st;b=Math.round(b/st)*st}
  d[p]=r<0?0:r>255?255:r;d[p+1]=g<0?0:g>255?255:g;d[p+2]=b<0?0:b>255?255:b}
 void needLum;
 function mixBlur(r,amt,thr){var bl=boxBlur(d,w,h,r);for(var i2=0;i2<n;i2++){var p2=i2*4;for(var q2=0;q2<3;q2++){var o=d[p2+q2],df=o-bl[p2+q2];if(Math.abs(df)<thr)continue;var v=o+df*amt;d[p2+q2]=v<0?0:v>255?255:v}}}
 if(P.den>0){var db=boxBlur(d,w,h,Math.max(1,Math.round(w/900*(1+P.den/40))));var m=P.den/100*.85;for(var a=0;a<d.length;a++)if((a&3)!==3)d[a]=d[a]*(1-m)+db[a]*m}
 if(P.clr>0)mixBlur(Math.max(4,Math.round(w/60)),P.clr/100*1.3,0);
 if(P.shp>0)mixBlur(Math.max(1,Math.round(w/900)),P.shp/100*2.2,2);
 if(P.grn>0){var amp=P.grn*.9;for(var g2=0;g2<n;g2++){var nz=(Math.random()+Math.random()+Math.random()-1.5)*amp,p3=g2*4;d[p3]=clamp(d[p3]+nz,0,255);d[p3+1]=clamp(d[p3+1]+nz,0,255);d[p3+2]=clamp(d[p3+2]+nz,0,255)}}
 if(P.vig>0){var cx=w/2,cy=h/2,mr=Math.sqrt(cx*cx+cy*cy),vk=P.vig/100;for(var yy=0;yy<h;yy++)for(var xx=0;xx<w;xx++){var dd=Math.sqrt((xx-cx)*(xx-cx)+(yy-cy)*(yy-cy))/mr,f=1-vk*Math.pow(Math.max(0,dd-.35)/.65,2),pp=(yy*w+xx)*4;d[pp]*=f;d[pp+1]*=f;d[pp+2]*=f}}
 x.putImageData(id,0,0);return c}
function autoLevels(src){var s=document.createElement('canvas'),k=Math.min(1,400/Math.max(src.width,src.height));s.width=Math.max(1,Math.round(src.width*k));s.height=Math.max(1,Math.round(src.height*k));var x=s.getContext('2d');x.drawImage(src,0,0,s.width,s.height);var d=x.getImageData(0,0,s.width,s.height).data,H=new Array(256).fill(0),N=0;for(var i=0;i<d.length;i+=4){if(d[i+3]<20)continue;H[Math.round(d[i]*.299+d[i+1]*.587+d[i+2]*.114)]++;N++}
 var lo=0,hi=255,c=0;for(var a=0;a<256;a++){c+=H[a];if(c>N*.005){lo=a;break}}c=0;for(var b=255;b>=0;b--){c+=H[b];if(c>N*.005){hi=b;break}}
 var mean=0;for(var m=0;m<256;m++)mean+=m*H[m];mean=(mean/Math.max(1,N)-lo)/Math.max(1,hi-lo);var gam=clamp(Math.log(.5)/Math.log(clamp(mean,.1,.9)),.6,1.7);return{blk:lo,wht:Math.max(lo+20,hi),gam:+gam.toFixed(2)}}
var LOOKS=[['أصلي',{}],['تحسين تلقائي',null],['سينمائي (تيل/برتقالي)',{c1:52,c3:205,tmp:18,tnt:-8,sat:6,vig:30,clr:20}],['مات ناعم',{blk:18,c1:78,c3:200,sat:-12,hl:-20}],['ذهبي دافئ',{tmp:45,exp:.15,sat:12,vig:20,hl:-12}],['بارد أزرق',{tmp:-45,sat:6,c3:200,vig:16}],['تباين درامي',{c1:44,c3:216,clr:60,sat:10,vig:36}],['فيلم قديم',{blk:12,wht:240,tmp:22,sat:-18,grn:35,vig:44}],['أبيض وأسود',{sat:-100,clr:30,c1:50,c3:210}],['ثنائي لون',{duo:1}],['بوب مشبّع',{vib:60,sat:25,shp:40}],['إشراق ناعم',{exp:.25,sh:40,hl:-25,clr:15,sat:6}]];

/* ---------- واجهة اللوحة ---------- */
var P=Object.assign({},DEF),src=null,srcKey=null,pvTimer=0;
function a(){return window.Studio.api}
function selImg(){var E=a().selEls();return E.length&&E[0].type==='image'?E[0]:null}
function row(id,lb,min,max,step){return'<label class="p2r"><span>'+lb+'</span><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+(step||1)+'"><b></b></label>'}
function loadSrc(cb){var e=selImg();if(!e){a().toast('اختر صورة على اللوحة أولًا');return}var key=e.orig||e.src,im=a().getImg(key);if(!im){a().toast('تعذّر قراءة الصورة');return}
 function go(){var k=Math.min(1,3200/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);src=c;srcKey=key;cb(e)}
 if(im.complete&&im.naturalWidth)go();else im.addEventListener('load',go,{once:true})}
function preview(pane){if(!src)return;var k=Math.min(1,460/Math.max(src.width,src.height)),sm=document.createElement('canvas');sm.width=Math.max(1,Math.round(src.width*k));sm.height=Math.max(1,Math.round(src.height*k));sm.getContext('2d').drawImage(src,0,0,sm.width,sm.height);var out=process(sm,P),pv=$('#p2-pv',pane);pv.width=out.width;pv.height=out.height;pv.getContext('2d').drawImage(out,0,0)}
function syncUI(pane){Object.keys(DEF).forEach(function(k){var el=$('#p2-'+k,pane);if(!el)return;if(el.type==='checkbox')el.checked=!!P[k];else el.value=P[k];var b=el.parentNode.querySelector&&el.parentNode.querySelector('b');if(b&&el.type==='range')b.textContent=P[k]})}
function sched(pane){clearTimeout(pvTimer);pvTimer=setTimeout(function(){preview(pane)},60)}
function hasAlpha(c){var x=c.getContext('2d'),d=x.getImageData(0,0,Math.min(c.width,512),Math.min(c.height,512)).data;for(var i=3;i<d.length;i+=16)if(d[i]<250)return true;return false}
function applyFull(pane){var e=selImg();if(!e||!src){a().toast('اختر صورة ثم اضغط «ابدأ التحرير»');return}a().toast('⏳ جارٍ المعالجة بالدقة الكاملة…');
 setTimeout(function(){var out=process(src,P),al=hasAlpha(src),url=al?out.toDataURL('image/png'):out.toDataURL('image/jpeg',.95);if(!e.orig)e.orig=e.src;var old=e.adjKey;var k=a().addAsset(url);e.src=k;e.adjKey=k;e.adj=Object.assign({},P);if(old&&old!==e.orig&&old!==k)delete a().D().assets[old];a().push();a().draw();a().toast('تم تطبيق التعديلات ✅ (يمكنك العودة للأصل)')},30)}
function adjPane(p){
 var h='<h4>🎛 تحرير الصور المتقدم</h4><p class="st-hint">اختر صورة على اللوحة ثم «ابدأ التحرير». المعاينة فورية، والتطبيق يتم على الدقة الكاملة، ويبقى الأصل محفوظًا للرجوع إليه.</p><button class="st-big" id="p2-go">🎚 ابدأ تحرير الصورة المحددة</button><div id="p2-box" hidden><canvas class="p2pv" id="p2-pv"></canvas><div class="p2g">'+LOOKS.map(function(l,i){return'<button data-lk="'+i+'">'+l[0]+'</button>'}).join('')+'</div>'+
 '<b style="font-size:12px">النغمة</b>'+row('p2-exp','تعريض',-2,2,.05)+row('p2-blk','مستوى الأسود',0,120)+row('p2-wht','مستوى الأبيض',135,255)+row('p2-gam','غاما',.4,2.5,.02)+row('p2-hl','الإضاءات',-100,100)+row('p2-sh','الظلال',-100,100)+
 '<b style="font-size:12px">المنحنى (RGB)</b>'+row('p2-c1','ظلال',0,128)+row('p2-c2','وسط',40,220)+row('p2-c3','إضاءات',128,255)+
 '<b style="font-size:12px">اللون</b>'+row('p2-tmp','حرارة',-100,100)+row('p2-tnt','صبغة',-100,100)+row('p2-vib','حيوية',-100,100)+row('p2-sat','تشبّع',-100,100)+
 '<b style="font-size:12px">التفاصيل والتأثيرات</b>'+row('p2-shp','حدّة',0,100)+row('p2-clr','وضوح (Clarity)',0,100)+row('p2-den','تقليل التشويش',0,100)+row('p2-grn','حبيبات فيلم',0,100)+row('p2-pix','بكسلة',0,60)+row('p2-pst','تقسيم لوني (Posterize)',0,16)+row('p2-vig','إطار معتم',0,100)+
 '<label class="p2r"><span>ثنائي اللون</span><input type="checkbox" id="p2-duo"><input type="color" id="p2-d1"><input type="color" id="p2-d2"></label>'+
 '<div class="p2g"><button id="p2-auto">✨ تحسين تلقائي</button><button id="p2-rs">↺ تصفير</button></div><button class="st-big" id="p2-ap">✅ تطبيق بالدقة الكاملة</button><button class="st-big" id="p2-orig" style="background:#334155">↩ العودة للصورة الأصلية</button></div>';
 var w=document.createElement('div');w.innerHTML=h;while(w.firstChild)p.appendChild(w.firstChild);
 function bind(){var box=$('#p2-box',p);
  Object.keys(DEF).forEach(function(k){var el=$('#p2-'+k,p);if(!el)return;el.oninput=function(){P[k]=el.type==='checkbox'?(el.checked?1:0):(el.type==='color'?el.value:+el.value);var b=el.parentNode.querySelector('b');if(b&&el.type==='range')b.textContent=el.value;sched(p)}});
  $('#p2-go',p).onclick=function(){loadSrc(function(e){P=Object.assign({},DEF,e.adj||{});box.hidden=false;syncUI(p);preview(p)})};
  $('#p2-auto',p).onclick=function(){if(!src)return;Object.assign(P,autoLevels(src));syncUI(p);preview(p)};
  $('#p2-rs',p).onclick=function(){P=Object.assign({},DEF);syncUI(p);preview(p)};
  [].forEach.call(p.querySelectorAll('[data-lk]'),function(b){b.onclick=function(){if(!src)return;var l=LOOKS[+b.dataset.lk],v=l[1];P=Object.assign({},DEF);if(v===null)Object.assign(P,autoLevels(src));else Object.assign(P,v);syncUI(p);preview(p)}});
  $('#p2-ap',p).onclick=function(){applyFull(p)};
  $('#p2-orig',p).onclick=function(){var e=selImg();if(!e||!e.orig){a().toast('هذه الصورة لم تُعدَّل');return}var old=e.adjKey;e.src=e.orig;delete e.orig;delete e.adj;delete e.adjKey;if(old)delete a().D().assets[old];a().push();a().draw();P=Object.assign({},DEF);syncUI(p);a().toast('عادت الصورة الأصلية')}}
 bind()}

/* ---------- الفرشاة ---------- */
var BR={on:false,mode:'pen',size:12,col:'#7c3aed',op:100,hard:80},cwrap=null,layer=null,lcv=null,lx=null,lastP=null,drawing=false;
function stage(){return document.getElementById('st-ov')}
function pos(ev){var ov=stage(),r=ov.getBoundingClientRect(),D=a().D();return[(ev.clientX-r.left)*D.w/r.width,(ev.clientY-r.top)*D.h/r.height,ev.pressure&&ev.pointerType==='pen'?ev.pressure:1]}
function findLayer(){var D=a().D(),E=a().selEls();var e=E[0];if(e&&e.dr)return e;for(var i=D.els.length-1;i>=0;i--)if(D.els[i].dr&&!D.els[i].lock)return D.els[i];return null}
function beginStroke(ev){var D=a().D();layer=findLayer();lcv=document.createElement('canvas');lcv.width=D.w;lcv.height=D.h;lx=lcv.getContext('2d');lx.lineCap='round';lx.lineJoin='round';
 if(layer){var im=a().getImg(layer.src);if(im&&im.complete&&im.naturalWidth)lx.drawImage(im,0,0,D.w,D.h);layer.hide=true;a().draw()}
 var ov=stage();lcv.style.cssText=ov.style.cssText;lcv.className=ov.className;lcv.style.position='absolute';lcv.style.pointerEvents='none';lcv.id='p2-live';ov.parentNode.appendChild(lcv);
 drawing=true;lastP=pos(ev);dot(lastP)}
function setPen(){lx.globalCompositeOperation=BR.mode==='eraser'?'destination-out':'source-over';lx.strokeStyle=lx.fillStyle=BR.col;lx.globalAlpha=BR.mode==='marker'?Math.min(.45,BR.op/100):BR.op/100}
function dot(q){setPen();var s=BR.size*(BR.mode==='marker'?2.4:1)*(.35+.65*q[2]);lx.beginPath();lx.arc(q[0],q[1],s/2,0,6.283);if(BR.hard<100){lx.shadowColor=BR.col;lx.shadowBlur=s*(1-BR.hard/100)*.8}else lx.shadowBlur=0;lx.fill();lx.shadowBlur=0}
function moveStroke(ev){if(!drawing)return;var q=pos(ev);setPen();var s=BR.size*(BR.mode==='marker'?2.4:1)*(.35+.65*q[2]);lx.lineWidth=s;if(BR.hard<100){lx.shadowColor=BR.col;lx.shadowBlur=s*(1-BR.hard/100)*.8}else lx.shadowBlur=0;var mx=(lastP[0]+q[0])/2,my=(lastP[1]+q[1])/2;lx.beginPath();lx.moveTo(lastP[0],lastP[1]);lx.quadraticCurveTo(lastP[0],lastP[1],mx,my);lx.lineTo(q[0],q[1]);lx.stroke();lx.shadowBlur=0;lastP=q}
function endStroke(){if(!drawing)return;drawing=false;var D=a().D(),url=lcv.toDataURL('image/png'),k=a().addAsset(url);
 if(layer){var old=layer.src;layer.src=k;layer.hide=false;delete D.assets[old]}else{var el=a().norm([{type:'image',src:k,x:0,y:0,w:D.w,h:D.h,name:'رسم',clip:'rect'}])[0];el.dr=true;D.els.push(el);a().setSel([el.id])}
 if(lcv.parentNode)lcv.parentNode.removeChild(lcv);lcv=null;a().push();a().draw()}
function onDown(ev){if(!BR.on)return;ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();beginStroke(ev)}
function onMove(ev){if(!BR.on||!drawing)return;ev.preventDefault();moveStroke(ev)}
function onUp(){if(drawing)endStroke()}
function setBrush(on){BR.on=on;var w=document.getElementById('st-cw')||(stage()&&stage().parentNode);if(!w)return;if(on&&!cwrap){cwrap=w;w.addEventListener('pointerdown',onDown,true);window.addEventListener('pointermove',onMove);window.addEventListener('pointerup',onUp)}
 var ov=stage();if(ov)ov.style.cursor=on?'crosshair':''}
function brushPane(p){var h='<h4>🖌 فرشاة وممحاة</h4><p class="st-hint">ارسم بحرية فوق التصميم على طبقة «رسم» مستقلة (تظل قابلة للنقل والتعديل). تدعم ضغط القلم على الشاشات التي تتيح ذلك.</p><div class="p2g"><button id="p2-bon" class="st-big">▶ تشغيل وضع الرسم</button></div><div class="p2g"><button data-bm="pen" class="on">✏️ قلم</button><button data-bm="marker">🖍 ماركر</button><button data-bm="eraser">🧽 ممحاة</button></div>'+row('p2-bs','الحجم',1,200)+row('p2-bo','الشفافية',5,100)+row('p2-bh','نعومة الحافة (صلابة)',0,100)+'<label class="p2r"><span>اللون</span><input type="color" id="p2-bc" value="#7c3aed"></label><div class="p2g"><button id="p2-bclr">🗑 مسح طبقة الرسم المحددة</button></div>';
 var w=document.createElement('div');w.innerHTML=h;while(w.firstChild)p.appendChild(w.firstChild);
 var bs=$('#p2-bs',p),bo=$('#p2-bo',p),bh=$('#p2-bh',p);bs.value=BR.size;bo.value=BR.op;bh.value=BR.hard;[bs,bo,bh].forEach(function(el){el.parentNode.querySelector('b').textContent=el.value});
 bs.oninput=function(){BR.size=+bs.value;bs.parentNode.querySelector('b').textContent=bs.value};bo.oninput=function(){BR.op=+bo.value;bo.parentNode.querySelector('b').textContent=bo.value};bh.oninput=function(){BR.hard=+bh.value;bh.parentNode.querySelector('b').textContent=bh.value};$('#p2-bc',p).oninput=function(){BR.col=this.value};
 var on=$('#p2-bon',p);function lab(){on.textContent=BR.on?'⏹ إيقاف وضع الرسم (يعمل الآن)':'▶ تشغيل وضع الرسم'}lab();on.onclick=function(){setBrush(!BR.on);lab()};
 [].forEach.call(p.querySelectorAll('[data-bm]'),function(b){b.classList.toggle('on',b.dataset.bm===BR.mode);b.onclick=function(){BR.mode=b.dataset.bm;[].forEach.call(p.querySelectorAll('[data-bm]'),function(x){x.classList.toggle('on',x===b)})}});
 $('#p2-bclr',p).onclick=function(){var D=a().D(),E=a().selEls();if(E[0]&&E[0].dr){D.els.splice(D.els.indexOf(E[0]),1);a().setSel([]);a().push();a().draw()}else a().toast('اختر طبقة رسم أولًا')}}

/* ---------- تصدير احترافي ---------- */
var CT=null;function crc(u,s,e){if(!CT){CT=[];for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;CT[n]=c>>>0}}var c2=-1;for(var i=s;i<e;i++)c2=CT[(c2^u[i])&255]^(c2>>>8);return(c2^-1)>>>0}
function pngDPI(buf,dpi){var u=new Uint8Array(buf),ppm=Math.round(dpi/.0254),ck=new Uint8Array(21),dv=new DataView(ck.buffer);dv.setUint32(0,9);ck.set([112,72,89,115],4);dv.setUint32(8,ppm);dv.setUint32(12,ppm);ck[16]=1;dv.setUint32(17,crc(ck,4,17));var o=new Uint8Array(u.length+21),ih=8+8+13+4;o.set(u.subarray(0,ih),0);o.set(ck,ih);o.set(u.subarray(ih),ih+21);return o}
function exportPane(p){var h='<h4>📤 تصدير احترافي</h4><p class="st-hint">صدّر بدقة أعلى من حجم اللوحة (حتى 8×) للطباعة واللوحات الإعلانية، مع تحديد الصيغة والجودة وDPI.</p>'+
 '<label class="p2r"><span>الصيغة</span><select id="p2-ef"><option value="png">PNG (شفافية)</option><option value="jpg">JPG</option><option value="webp">WebP</option></select></label>'+
 '<label class="p2r"><span>الدقة</span><select id="p2-es"><option>1</option><option>2</option><option selected>3</option><option>4</option><option>6</option><option>8</option></select><b>×</b></label>'+
 row('p2-eq','الجودة %',50,100)+'<label class="p2r"><span>DPI (PNG)</span><select id="p2-ed"><option value="72">72 شاشة</option><option value="150">150</option><option value="300" selected>300 طباعة</option></select></label>'+
 '<div class="st-hint" id="p2-esz"></div><button class="st-big" id="p2-ex">⬇ تصدير الآن</button>';
 var w=document.createElement('div');w.innerHTML=h;while(w.firstChild)p.appendChild(w.firstChild);
 var q=$('#p2-eq',p);q.value=95;q.parentNode.querySelector('b').textContent=95;q.oninput=function(){q.parentNode.querySelector('b').textContent=q.value};
 function info(){var D=a().D(),s=+$('#p2-es',p).value,W=D.w*s,H=D.h*s;$('#p2-esz',p).textContent='الناتج: '+W+' × '+H+' بكسل'+(W*H>1.6e8?' — كبير جدًا قد يفشل المتصفح، خفّض الدقة':'')}
 $('#p2-es',p).onchange=info;info();
 $('#p2-ex',p).onclick=function(){var D=a().D(),f=$('#p2-ef',p).value,s=+$('#p2-es',p).value,qq=+q.value/100,dpi=+$('#p2-ed',p).value;var W=D.w*s,H=D.h*s;while(W>16384||H>16384||W*H>2.68e8){s-=.5;W=D.w*s;H=D.h*s}
  a().toast('⏳ جارٍ التصدير…');setTimeout(function(){var c=a().outPage({bg:D.bg,els:D.els},s,f==='jpg');var mime=f==='png'?'image/png':f==='jpg'?'image/jpeg':'image/webp';
   c.toBlob(function(b){if(!b){a().toast('فشل التصدير — خفّض الدقة');return}if(f==='png'){b.arrayBuffer().then(function(ab){a().dl(new Blob([pngDPI(ab,dpi)],{type:'image/png'}),'design-'+c.width+'x'+c.height+'.png')})}else a().dl(b,'design-'+c.width+'x'+c.height+'.'+f);a().toast('تم التصدير ✅')},mime,qq)},40)}}

/* ---------- أصوات ---------- */
function voicePane(p){var w=document.createElement('div');w.innerHTML='<h4>🎙 مولّد نبرات الصوت</h4><p class="st-hint">حوّل نصًا إلى صوت بنبرات مختلفة (إعلان، هادئ، خبري، طفل، ضخم…) أو غيّر نبرة تسجيلك وحمّله لتضعه على الفيديو.</p><a class="st-big" style="display:block;text-align:center;text-decoration:none" href="/studio/voice/" target="_blank">🎙 افتح مولّد الأصوات</a>';while(w.firstChild)p.appendChild(w.firstChild)}

SD.tabFn.ext=function(p){orig(p);adjPane(p);brushPane(p);exportPane(p);voicePane(p)};
})();
