/* Studio: رفع صورة تصميم وتفكيكها إلى طبقات (خلفية، أشكال، صور، نصوص) — تحليل ألوان وحواف بدون ذكاء اصطناعي، وOCR اختياري للنصوص */
(function(){
var SD=window.SD;if(!SD||!SD.tabFn||!SD.tabFn.ext)return;
var orig=SD.tabFn.ext,LAST=null;
function $(s,r){return(r||document).querySelector(s)}
function hex(r,g,b){return'#'+[r,g,b].map(function(v){v=Math.max(0,Math.min(255,Math.round(v)));return(v<16?'0':'')+v.toString(16)}).join('')}
function dist(a,b){var d0=a[0]-b[0],d1=a[1]-b[1],d2=a[2]-b[2];return Math.sqrt(d0*d0+d1*d1+d2*d2)}
function loadImg(f){return new Promise(function(res,rej){if(window.loadImageFile){loadImageFile(f,2400).then(function(r){res(r.canvas)},rej);return}var u=URL.createObjectURL(f),im=new Image();im.onload=function(){var c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);URL.revokeObjectURL(u);res(c)};im.onerror=rej;im.src=u})}
/* ---------- التحليل ---------- */
function analyze(src,o){
 var MAXD=1400,S=Math.min(1,MAXD/Math.max(src.width,src.height)),w=Math.max(8,Math.round(src.width*S)),h=Math.max(8,Math.round(src.height*S));
 var cv=document.createElement('canvas');cv.width=w;cv.height=h;var cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(src,0,0,w,h);
 var id=cx.getImageData(0,0,w,h),P=id.data,N=w*h;
 // --- نموذج الخلفية: ألوان الزوايا (استيفاء ثنائي)
 function corner(x0,y0){var s=[0,0,0],n=0,k=Math.max(3,Math.round(Math.min(w,h)*.02));for(var y=y0;y<y0+k;y++)for(var x=x0;x<x0+k;x++){var i=(y*w+x)*4;s[0]+=P[i];s[1]+=P[i+1];s[2]+=P[i+2];n++}return[s[0]/n,s[1]/n,s[2]/n]}
 var k0=Math.max(3,Math.round(Math.min(w,h)*.02)),cTL=corner(0,0),cTR=corner(w-k0,0),cBL=corner(0,h-k0),cBR=corner(w-k0,h-k0);
 // هل الحواف بلون متجانس؟ نقيس انحراف عيّنات الحواف عن النموذج
 var bgAt=function(x,y){var u=x/(w-1),v=y/(h-1),r=[0,0,0];for(var c=0;c<3;c++)r[c]=(cTL[c]*(1-u)+cTR[c]*u)*(1-v)+(cBL[c]*(1-u)+cBR[c]*u)*v;return r};
 var thr=o.sens||42;
 // --- k-means
 var K=o.k||10,pts=[],step=Math.max(1,Math.floor(N/9000));for(var i=0;i<N;i+=step)pts.push([P[i*4],P[i*4+1],P[i*4+2]]);
 var cen=[pts[0]];while(cen.length<K){var best=-1,bd=-1;for(var j=0;j<pts.length;j+=3){var dm=1e9;for(var c=0;c<cen.length;c++){var d=dist(pts[j],cen[c]);if(d<dm)dm=d}if(dm>bd){bd=dm;best=j}}cen.push(pts[best].slice())}
 for(var it=0;it<7;it++){var sm=cen.map(function(){return[0,0,0,0]});pts.forEach(function(p){var bi=0,bd2=1e9;for(var c=0;c<K;c++){var d=dist(p,cen[c]);if(d<bd2){bd2=d;bi=c}}var s=sm[bi];s[0]+=p[0];s[1]+=p[1];s[2]+=p[2];s[3]++});sm.forEach(function(s,c){if(s[3])cen[c]=[s[0]/s[3],s[1]/s[3],s[2]/s[3]]})}
 var cache=new Int8Array(32768).fill(-1),L=new Int8Array(N);
 for(var q=0;q<N;q++){var r=P[q*4],g=P[q*4+1],b=P[q*4+2],key=(r>>3)<<10|(g>>3)<<5|(b>>3),l=cache[key];if(l<0){var bi2=0,bd3=1e9;for(var c2=0;c2<K;c2++){var cc=cen[c2],dd=(cc[0]-r)*(cc[0]-r)+(cc[1]-g)*(cc[1]-g)+(cc[2]-b)*(cc[2]-b);if(dd<bd3){bd3=dd;bi2=c2}}l=cache[key]=bi2}L[q]=l}
 // --- مرشّح الأغلبية لإزالة هالات الحواف
 var L2=new Int8Array(L);for(var y=1;y<h-1;y++)for(var x=1;x<w-1;x++){var p0=y*w+x,a=L[p0-1],bb=L[p0+1],cu=L[p0-w],dn=L[p0+w],c0=L[p0];if(c0!==a&&c0!==bb&&c0!==cu&&c0!==dn){var cnt=(a===bb)+(a===cu)+(a===dn);if(a===bb||a===cu||a===dn)L2[p0]=a;else if(bb===cu||bb===dn)L2[p0]=bb}}
 L=L2;
 // --- انحراف عن الخلفية (قبل كشف الصور)
 var DV=new Uint8Array(N);for(var yv=0;yv<h;yv++)for(var xv=0;xv<w;xv++){var pv=yv*w+xv,bv=bgAt(xv,yv);if(dist([P[pv*4],P[pv*4+1],P[pv*4+2]],bv)>thr)DV[pv]=1}
 // --- كشف مناطق الصور (تنوّع ألوان المقدمة)
 var BS=Math.max(8,Math.round(Math.min(w,h)/70)),bw=Math.ceil(w/BS),bh=Math.ceil(h/BS),busy=new Uint8Array(bw*bh);
 for(var by=0;by<bh;by++)for(var bx=0;bx<bw;bx++){var cnts={},tot=0,fg=0,tr=0;for(var yy=by*BS;yy<Math.min(h,by*BS+BS);yy++)for(var xx=bx*BS;xx<Math.min(w,bx*BS+BS);xx++){var pp=yy*w+xx;tot++;if(!DV[pp])continue;fg++;cnts[L[pp]]=(cnts[L[pp]]||0)+1;if(xx+1<w&&DV[pp+1]&&L[pp+1]!==L[pp])tr++;if(yy+1<h&&DV[pp+w]&&L[pp+w]!==L[pp])tr++}
  var nl=0;for(var kk in cnts)if(cnts[kk]>=fg*.1)nl++;if(o.photos&&fg>tot*.4&&nl>=3&&tr>fg*.12)busy[by*bw+bx]=1}
 // تنظيف: إغلاق ثم إزالة البقع الصغيرة
 function dil(m){var r=new Uint8Array(m.length);for(var y=0;y<bh;y++)for(var x=0;x<bw;x++){if(m[y*bw+x]){for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){var yy=y+dy,xx=x+dx;if(yy>=0&&yy<bh&&xx>=0&&xx<bw)r[yy*bw+xx]=1}}}return r}
 function ero(m){var r=new Uint8Array(m.length);for(var y=0;y<bh;y++)for(var x=0;x<bw;x++){var ok=1;for(var dy=-1;dy<=1&&ok;dy++)for(var dx=-1;dx<=1;dx++){var yy=y+dy,xx=x+dx;if(yy<0||yy>=bh||xx<0||xx>=bw||!m[yy*bw+xx]){ok=0;break}}r[y*bw+x]=ok}return r}
 var pm=ero(dil(dil(busy))),photos=[];
 var seen=new Uint8Array(bw*bh);for(var s0=0;s0<bw*bh;s0++){if(!pm[s0]||seen[s0])continue;var st=[s0],x0=1e9,y0=1e9,x1=-1,y1=-1,ar=0;seen[s0]=1;while(st.length){var cu2=st.pop(),cx2=cu2%bw,cy2=(cu2/bw)|0;ar++;if(cx2<x0)x0=cx2;if(cx2>x1)x1=cx2;if(cy2<y0)y0=cy2;if(cy2>y1)y1=cy2;[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(dd){var nx=cx2+dd[0],ny=cy2+dd[1];if(nx>=0&&nx<bw&&ny>=0&&ny<bh&&pm[ny*bw+nx]&&!seen[ny*bw+nx]){seen[ny*bw+nx]=1;st.push(ny*bw+nx)}})}
  var X0=x0*BS,Y0=y0*BS,X1=Math.min(w,(x1+1)*BS),Y1=Math.min(h,(y1+1)*BS);if((X1-X0)*(Y1-Y0)>=N*.012&&ar*1.0/((x1-x0+1)*(y1-y0+1))>.45)photos.push({x:X0,y:Y0,w:X1-X0,h:Y1-Y0})}
 var inPhoto=new Uint8Array(N);photos.forEach(function(p){for(var y=p.y;y<p.y+p.h;y++)for(var x=p.x;x<p.x+p.w;x++)inPhoto[y*w+x]=1});
 var photoArea=photos.reduce(function(a,p){return a+p.w*p.h},0);
 // --- المقدمة F
 var F=new Uint8Array(N),fc=0;for(var y2=0;y2<h;y2++)for(var x2=0;x2<w;x2++){var pi=y2*w+x2;if(inPhoto[pi])continue;F[pi]=1;fc++}
 var res={w:w,h:h,S:S,cv:cv,P:P,photos:photos,bg:{tl:cTL,tr:cTR,bl:cBL,br:cBR},els:[],stats:{}};
 if(photoArea>N*.7){res.fallback=true;return res}
 // --- مكوّنات متصلة بنفس اللون
 var C=new Int32Array(N),comps=[null],nc=0;
 for(var s=0;s<N;s++){if(!F[s]||C[s])continue;nc++;var lab=L[s],stk=[s],bx0=1e9,by0=1e9,bx1=-1,by1=-1,area=0,sr=0,sg=0,sb=0;C[s]=nc;while(stk.length){var cur=stk.pop(),cxp=cur%w,cyp=(cur/w)|0;area++;sr+=P[cur*4];sg+=P[cur*4+1];sb+=P[cur*4+2];if(cxp<bx0)bx0=cxp;if(cxp>bx1)bx1=cxp;if(cyp<by0)by0=cyp;if(cyp>by1)by1=cyp;
   for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;var nx=cxp+dx,ny=cyp+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;var np=ny*w+nx;if(F[np]&&!C[np]&&L[np]===lab){C[np]=nc;stk.push(np)}}}
  comps.push({x0:bx0,y0:by0,x1:bx1,y1:by1,a:area,s:[sr,sg,sb]})}
 // --- دمج المتجاورة المتقاربة لونًا (تدرجات)
 var uf=[];for(var u=0;u<=nc;u++)uf.push(u);function fd(a){while(uf[a]!==a){uf[a]=uf[uf[a]];a=uf[a]}return a}
 var mean=function(c){return[c.s[0]/c.a,c.s[1]/c.a,c.s[2]/c.a]};
 var pairs={};for(var y3=0;y3<h;y3++)for(var x3=0;x3<w;x3++){var p1=y3*w+x3,a1=C[p1];if(!a1)continue;[[1,0],[0,1],[1,1]].forEach(function(dd){var nx=x3+dd[0],ny=y3+dd[1];if(nx>=w||ny>=h)return;var a2=C[ny*w+nx];if(a2&&a2!==a1){var kx=a1<a2?a1*(nc+1)+a2:a2*(nc+1)+a1;pairs[kx]=1}})}
 Object.keys(pairs).forEach(function(kx){kx=+kx;var a=Math.floor(kx/(nc+1)),b=kx%(nc+1);if(dist(mean(comps[a]),mean(comps[b]))<(o.merge||40)){var ra=fd(a),rb=fd(b);if(ra!==rb)uf[rb]=ra}});
 var roots={};for(var c3=1;c3<=nc;c3++){var r3=fd(c3),cc3=comps[c3],R=roots[r3];if(!R)R=roots[r3]={id:r3,x0:1e9,y0:1e9,x1:-1,y1:-1,a:0,s:[0,0,0]};R.x0=Math.min(R.x0,cc3.x0);R.y0=Math.min(R.y0,cc3.y0);R.x1=Math.max(R.x1,cc3.x1);R.y1=Math.max(R.y1,cc3.y1);R.a+=cc3.a;R.s[0]+=cc3.s[0];R.s[1]+=cc3.s[1];R.s[2]+=cc3.s[2]}
 var list=Object.keys(roots).map(function(k){var R=roots[k];R.w=R.x1-R.x0+1;R.h=R.y1-R.y0+1;R.m=[R.s[0]/R.a,R.s[1]/R.a,R.s[2]/R.a];return R}).filter(function(R){return R.a>=Math.max(6,N*.00002)});
 function owns(R,p){var c=C[p];return c&&fd(c)===R.id}
 // استبعاد مناطق الخلفية: متصلة بحافة الصورة وقريبة لونيًا من نموذج الخلفية
 var fgArea=0,keep=[];list.forEach(function(R){var tb=R.x0<=0||R.y0<=0||R.x1>=w-1||R.y1>=h-1;if(tb){var n=0,dv=0,st=Math.max(1,Math.floor(R.a/3000));for(var y=R.y0;y<=R.y1;y++)for(var x=R.x0;x<=R.x1;x+=1){var p=y*w+x;if((p%st)===0&&owns(R,p)){dv+=dist([P[p*4],P[p*4+1],P[p*4+2]],bgAt(x,y));n++}}if(n&&dv/n<thr*.9)return}
  if(R.a/(R.w*R.h)<.35&&R.a/(2*(R.w+R.h))<2.6&&R.w+R.h>120)return;fgArea+=R.a;keep.push(R)});
 list=keep;if(fgArea>N*.6){res.fallback=true;return res}
 var big=[],small=[];list.forEach(function(R){(R.a>=N*.005&&(R.w>=w*.12||R.h>=h*.12)?big:small).push(R)});
 // --- نصوص: تجميع الصغيرة في أسطر
 var su=small.map(function(_,i){return i});function sf(a){while(su[a]!==a){su[a]=su[su[a]];a=su[a]}return a}
 for(var i1=0;i1<small.length&&i1<900;i1++)for(var j1=i1+1;j1<small.length&&j1<900;j1++){var A=small[i1],B=small[j1],hh=Math.max(A.h,B.h),hm=Math.min(A.h,B.h);if(hh>hm*3.2)continue;if(dist(A.m,B.m)>80)continue;var gapx=Math.max(A.x0,B.x0)-Math.min(A.x1,B.x1),gapy=Math.max(A.y0,B.y0)-Math.min(A.y1,B.y1);if(gapx<hh*1.3&&gapy<hh*.2){var ra2=sf(i1),rb2=sf(j1);if(ra2!==rb2)su[rb2]=ra2}}
 var groups={};small.forEach(function(R,i){var g=sf(i);(groups[g]=groups[g]||[]).push(R)});
 var blocks=Object.keys(groups).map(function(g){var a=groups[g],B={parts:a,x0:1e9,y0:1e9,x1:-1,y1:-1,a:0,s:[0,0,0]};a.forEach(function(R){B.x0=Math.min(B.x0,R.x0);B.y0=Math.min(B.y0,R.y0);B.x1=Math.max(B.x1,R.x1);B.y1=Math.max(B.y1,R.y1);B.a+=R.a;B.s[0]+=R.s[0];B.s[1]+=R.s[1];B.s[2]+=R.s[2]});B.w=B.x1-B.x0+1;B.h=B.y1-B.y0+1;B.m=[B.s[0]/B.a,B.s[1]/B.a,B.s[2]/B.a];return B});
 // دمج الكتل الصغيرة الواقعة داخل كتلة نص أكبر
 blocks.sort(function(a,b){return b.w*b.h-a.w*a.h});
 for(var bi=0;bi<blocks.length;bi++){var Bg=blocks[bi];if(Bg.parts.length<2)continue;for(var bj=bi+1;bj<blocks.length;bj++){var T=blocks[bj],tcx=(T.x0+T.x1)/2,tcy=(T.y0+T.y1)/2;if(tcx>=Bg.x0-2&&tcx<=Bg.x1+2&&tcy>=Bg.y0-2&&tcy<=Bg.y1+2&&T.h<=Bg.h*1.1){T.parts.forEach(function(Q){Bg.parts.push(Q)});Bg.a+=T.a;Bg.x0=Math.min(Bg.x0,T.x0);Bg.y0=Math.min(Bg.y0,T.y0);Bg.x1=Math.max(Bg.x1,T.x1);Bg.y1=Math.max(Bg.y1,T.y1);Bg.w=Bg.x1-Bg.x0+1;Bg.h=Bg.y1-Bg.y0+1;blocks.splice(bj,1);bj--}}}
 // امتصاص شظايا الحواف (ألوان تمويه الحواف) في أسطر النص المجاورة أو إسقاطها
 var hosts=blocks.filter(function(B){return B.parts.length>=2});
 blocks=blocks.filter(function(T){if(T.parts.length!==1||!(T.w<=3||T.h<=3))return true;var cxm=(T.x0+T.x1)/2,cym=(T.y0+T.y1)/2;for(var q=0;q<hosts.length;q++){var H=hosts[q];if(cxm>=H.x0-4&&cxm<=H.x1+4&&cym>=H.y0-4&&cym<=H.y1+4){H.parts.push(T.parts[0]);H.x0=Math.min(H.x0,T.x0);H.y0=Math.min(H.y0,T.y0);H.x1=Math.max(H.x1,T.x1);H.y1=Math.max(H.y1,T.y1);H.w=H.x1-H.x0+1;H.h=H.y1-H.y0+1;return false}}return T.a>=40});
 // --- أدوات القص
 function cutout(owner,B,pad){ // owner: function(p)->bool
  pad=pad||1;var x0=Math.max(0,B.x0-pad),y0=Math.max(0,B.y0-pad),cw=Math.min(w,B.x1+pad+1)-x0,ch=Math.min(h,B.y1+pad+1)-y0,c=document.createElement('canvas');c.width=cw;c.height=ch;var cc=c.getContext('2d'),d=cc.createImageData(cw,ch),M=new Uint8Array(cw*ch);
  for(var y=0;y<ch;y++)for(var x=0;x<cw;x++){var p=(y0+y)*w+x0+x;if(owner(p))M[y*cw+x]=1}
  for(var y4=0;y4<ch;y4++)for(var x4=0;x4<cw;x4++){var on=M[y4*cw+x4];if(!on){for(var dy=-1;dy<=1&&!on;dy++)for(var dx=-1;dx<=1;dx++){var yy=y4+dy,xx=x4+dx;if(yy>=0&&yy<ch&&xx>=0&&xx<cw&&M[yy*cw+xx]){on=2;break}}}if(on){var p2=(y0+y4)*w+x0+x4,k=(y4*cw+x4)*4;d.data[k]=P[p2*4];d.data[k+1]=P[p2*4+1];d.data[k+2]=P[p2*4+2];d.data[k+3]=255}}
  cc.putImageData(d,0,0);return{canvas:c,x:x0,y:y0,w:cw,h:ch,mask:M}}
 function stdOf(R){var n=0,m=[0,0,0],m2=0,st=Math.max(1,Math.floor(R.a/1500));for(var y=R.y0;y<=R.y1;y++)for(var x=R.x0;x<=R.x1;x++){var p=y*w+x;if(owns(R,p)&&((p%st)===0)){var r=P[p*4],g=P[p*4+1],b=P[p*4+2];m[0]+=r;m[1]+=g;m[2]+=b;m2+=r*r+g*g+b*b;n++}}if(!n)return 0;var mm=(m[0]*m[0]+m[1]*m[1]+m[2]*m[2])/(n*n);return Math.sqrt(Math.max(0,m2/n-mm))}
 function geom(R){var rows=0,mid=0,my=R.y0+((R.h/2)|0),cw=R.w;for(var y=R.y0;y<=R.y1;y++){var f=-1,l=-1;for(var x=R.x0;x<=R.x1;x++)if(owns(R,y*w+x)){if(f<0)f=x;l=x}if(f>=0){rows+=l-f+1;if(y===my)mid=l-f+1}}return{span:rows/(R.w*R.h),mid:mid/cw}}
 // --- بناء العناصر (من الأسفل للأعلى)
 var els=[];
 photos.forEach(function(p){els.push({kind:'image',name:'صورة',x:p.x,y:p.y,w:p.w,h:p.h,crop:{x:p.x,y:p.y,w:p.w,h:p.h,full:true}})});
 big.sort(function(a,b){return b.a-a.a});
 big.forEach(function(R){var sd=stdOf(R),g=geom(R);
  if(sd<16&&g.span>.74){var m=R.m,col=hex(m[0],m[1],m[2]);
   if(g.span>.955)els.push({kind:'shape',k:'rect',x:R.x0,y:R.y0,w:R.w,h:R.h,fill:col,name:'مستطيل'});
   else if(g.mid>.97){var r=Math.sqrt(Math.max(0,(1-g.span)*R.w*R.h/(4-Math.PI)));if(r>=Math.min(R.w,R.h)*.46)els.push({kind:'shape',k:'ellipse',x:R.x0,y:R.y0,w:R.w,h:R.h,fill:col,name:'دائرة'});else els.push({kind:'shape',k:'round',x:R.x0,y:R.y0,w:R.w,h:R.h,fill:col,r:Math.min(r,Math.min(R.w,R.h)/2),name:'زر / بطاقة'})}
   else if(Math.abs(g.span-.785)<.06)els.push({kind:'shape',k:'ellipse',x:R.x0,y:R.y0,w:R.w,h:R.h,fill:col,name:'دائرة'});
   else els.push({kind:'image',name:'شكل',cut:cutout(function(p){return owns(R,p)},R)})}
  else els.push({kind:'image',name:sd>=16?'عنصر ملوّن':'شكل',cut:cutout(function(p){return owns(R,p)},R)})});
 blocks.sort(function(a,b){return a.y0-b.y0});
 blocks.forEach(function(B){var isText=B.parts.length>=2&&B.w>B.h*1.1||(B.parts.length===1&&B.w>B.h*2.2&&B.h<h*.2);
  if(isText){var ow=B.parts.map(function(R){return R.id}),set={};ow.forEach(function(i){set[i]=1});var cut=cutout(function(p){var c=C[p];return c&&set[fd(c)]},B,1);els.push({kind:'text',name:'نص',cut:cut,x:B.x0,y:B.y0,w:B.w,h:B.h,col:hex(B.m[0],B.m[1],B.m[2]),dens:B.a/(B.w*B.h)})}
  else{var R=B.parts[0],sd=stdOf(R),g=geom(R);if(B.parts.length===1&&sd<14&&g.span>.955&&B.w>6&&B.h>6)els.push({kind:'shape',k:'rect',x:R.x0,y:R.y0,w:R.w,h:R.h,fill:hex(R.m[0],R.m[1],R.m[2]),name:'مستطيل'});
   else if(B.parts.length===1&&sd<14&&Math.abs(g.span-.785)<.06&&B.w>6)els.push({kind:'shape',k:'ellipse',x:R.x0,y:R.y0,w:R.w,h:R.h,fill:hex(R.m[0],R.m[1],R.m[2]),name:'دائرة'});
   else{var set2={};B.parts.forEach(function(Q){set2[Q.id]=1});els.push({kind:'image',name:'أيقونة / زخرفة',cut:cutout(function(p){var c=C[p];return c&&set2[fd(c)]},B,1)})}}});
 res.dbg={blocks:blocks.map(function(B){return[B.parts.length,B.x0,B.y0,B.w,B.h]}),nsmall:small.length,nbig:big.length};res.els=els.slice(0,500);res.stats={photos:photos.length,shapes:els.filter(function(e){return e.kind==='shape'}).length,images:els.filter(function(e){return e.kind==='image'}).length,texts:els.filter(function(e){return e.kind==='text'}).length};
 return res}
/* ---------- بناء مستند المحرر ---------- */
function buildDesign(R,srcCanvas){
 var f=1080/Math.max(R.w,R.h),W=Math.round(R.w*f),H=Math.round(R.h*f),assets={},n=0,els=[];
 function asset(c,type){var k='sp'+(++n);assets[k]=c.toDataURL(type||'image/png');return k}
 function avg(a,b){return[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2]}
 var bg,B=R.bg,topc=avg(B.tl,B.tr),botc=avg(B.bl,B.br),lc=avg(B.tl,B.bl),rc=avg(B.tr,B.br);
 if(R.fallback){var fc=document.createElement('canvas');fc.width=R.w;fc.height=R.h;fc.getContext('2d').drawImage(R.cv,0,0);bg={t:'img',src:asset(fc,'image/jpeg')}}
 else if(dist(topc,botc)<14&&dist(lc,rc)<14)bg={t:'solid',c:[hex.apply(null,avg(topc,botc))]};
 else if(dist(topc,botc)>=dist(lc,rc))bg={t:'grad',c:[hex.apply(null,topc),hex.apply(null,botc),180]};
 else bg={t:'grad',c:[hex.apply(null,lc),hex.apply(null,rc),90]};
 R.els.forEach(function(e,i){
  if(e.kind==='shape'){var s={type:'shape',k:e.k,x:e.x*f,y:e.y*f,w:e.w*f,h:e.h*f,fill:e.fill,name:e.name};if(e.r)s.r=e.r*f;els.push(s)}
  else if(e.kind==='image'){var cv2,x,y,w,h;if(e.cut){cv2=e.cut.canvas;x=e.cut.x;y=e.cut.y;w=e.cut.w;h=e.cut.h}else{var cr=e.crop;cv2=document.createElement('canvas');cv2.width=cr.w;cv2.height=cr.h;cv2.getContext('2d').drawImage(R.cv,cr.x,cr.y,cr.w,cr.h,0,0,cr.w,cr.h);x=cr.x;y=cr.y;w=cr.w;h=cr.h}
   els.push({type:'image',src:asset(cv2,e.cut?'image/png':'image/jpeg'),clip:'rect',x:x*f,y:y*f,w:w*f,h:h*f,name:e.name})}
  else if(e.kind==='text'){var c=e.cut;els.push({type:'image',src:asset(c.canvas,'image/png'),clip:'rect',x:c.x*f,y:c.y*f,w:c.w*f,h:c.h*f,name:'نص (صورة) — حوّله لنص',sptxt:1,spcol:e.col,spdens:e.dens,spbox:[e.x*f,e.y*f,e.w*f,e.h*f],spmask:{w:c.w,h:c.h}});c.mask=c.mask;e.mask=c.mask;e.cw=c.w;e.ch=c.h}});
 return{w:W,h:H,bg:bg,els:els,assets:assets}}
/* ---------- OCR اختياري ---------- */
var TS=null;
function loadTess(){if(window.Tesseract)return Promise.resolve();if(TS)return TS;TS=new Promise(function(res,rej){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=res;s.onerror=function(){rej(new Error('تعذّر تحميل مكتبة التعرّف على النص (تحتاج اتصالًا بالإنترنت)'))};document.head.appendChild(s)});return TS}
function ocrInput(e,a){ // أسود على أبيض من قناع النص
 var D=a.D(),src=D.assets[e.src],im=new Image();return new Promise(function(res){im.onload=function(){var c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;var x=c.getContext('2d');x.drawImage(im,0,0);var d=x.getImageData(0,0,c.width,c.height),o=x.createImageData(c.width,c.height);for(var i=0;i<c.width*c.height;i++){var al=d.data[i*4+3];var v=al>128?0:255;o.data[i*4]=o.data[i*4+1]=o.data[i*4+2]=v;o.data[i*4+3]=255}
  var big=document.createElement('canvas'),k=Math.max(1,Math.min(4,80/c.height)),pad=12;big.width=Math.round(c.width*k)+pad*2;big.height=Math.round(c.height*k)+pad*2;var bx=big.getContext('2d');bx.fillStyle='#fff';bx.fillRect(0,0,big.width,big.height);var t=document.createElement('canvas');t.width=c.width;t.height=c.height;t.getContext('2d').putImageData(o,0,0);bx.imageSmoothingEnabled=true;bx.drawImage(t,pad,pad,big.width-pad*2,big.height-pad*2);res(big)};im.src=src})}
function fitText(t,boxW,boxH,dens){var c=document.createElement('canvas').getContext('2d'),fw=dens<.16?'400':'700';c.font=fw+' 100px Cairo, Tajawal, sans-serif';var lines=t.split('\n'),m=0;lines.forEach(function(l){m=Math.max(m,c.measureText(l).width)});var fs=100*boxW/Math.max(1,m);fs=Math.min(fs,boxH/lines.length*1.05);return{fs:Math.max(8,fs),fw:fw}}
async function runOCR(a,setMsg){
 var D=a.D(),targets=D.els.filter(function(e){return e.sptxt});if(!targets.length){setMsg('لا توجد نصوص مفكّكة لتحويلها.');return}
 setMsg('⏳ تحميل محرك التعرّف على النص…');await loadTess();
 var worker=await Tesseract.createWorker(['ara','eng']);var ok=0,fail=0;
 for(var i=0;i<targets.length;i++){var e=targets[i];setMsg('⏳ قراءة النصوص '+(i+1)+'/'+targets.length);
  try{var inp=await ocrInput(e,a);try{await worker.setParameters({tessedit_pageseg_mode:'7'})}catch(_){}var r=await worker.recognize(inp),txt=(r.data.text||'').replace(/\s+$/,'').replace(/\n+/g,' ').trim(),conf=r.data.confidence||0;
   if(txt&&conf>=45){var bx=e.spbox,ft=fitText(txt,bx[2],bx[3],e.spdens||.3);var cur=a.D();var idx=cur.els.indexOf(e);if(idx<0)continue;
    var ne={id:e.id,type:'text',t:txt,x:bx[0]-bx[2]*.03,y:bx[1]+bx[3]/2-ft.fs*.7,w:bx[2]*1.06,h:ft.fs*1.4,fs:ft.fs,ff:'Cairo',fw:ft.fw,col:e.spcol||'#111111',ta:'center',lh:1.25,op:1,rot:0,name:'نص: '+txt.slice(0,18)};cur.els[idx]=ne;ok++}else fail++}catch(err){fail++}}
 try{await worker.terminate()}catch(_){}
 a.push();a.draw();a.props();setMsg('✅ تحوّل '+ok+' نصًا إلى نص قابل للتعديل'+(fail?' — وبقي '+fail+' كصورة (ثقة منخفضة)':'')+'. الخط المختار تقريبي: عدّله من لوحة النص.')}
/* ---------- الواجهة ---------- */
SD.tabFn.ext=function(p){orig(p);var a=window.Studio.api;
 var box=document.createElement('div');
 box.innerHTML='<h4>🧬 رفع تصميم وتفكيكه</h4><p class="st-hint">ارفع صورة تصميم (بوستر، بنر، إعلان). يفصل المحرر الخلفية والأشكال والصور والنصوص إلى طبقات مستقلة تحرّكها وتغيّرها وتحذفها. تحليل ألوان وحواف داخل متصفحك دون ذكاء اصطناعي ودون رفع الصورة لأي خادم.</p>'+
 '<button class="st-big" id="sp-up">⬆️ اختر صورة التصميم</button><input type="file" id="sp-f" accept="image/*" style="display:none">'+
 '<div class="st-row"><label>تفاصيل الألوان <input type="range" id="sp-k" min="6" max="16" value="10"></label></div><div class="st-row"><label>حساسية فصل الخلفية <input type="range" id="sp-s" min="20" max="90" value="42"></label></div><div class="st-row"><label><input type="checkbox" id="sp-ph" checked> اكتشف الصور والمناطق المعقّدة</label></div>'+
 '<div id="sp-msg" class="st-hint" style="min-height:20px"></div><button class="st-big" id="sp-ocr" style="background:#334155;display:none">🔤 حوّل النصوص المفكّكة إلى نص قابل للتعديل (OCR)</button>';
 while(box.firstChild)p.appendChild(box.firstChild);box=p;
 var msg=function(t){$('#sp-msg',box).textContent=t};
 $('#sp-up',box).onclick=function(){$('#sp-f',box).click()};
 $('#sp-f',box).onchange=function(){var f=this.files[0];this.value='';if(!f)return;msg('⏳ تحليل الصورة…');
  loadImg(f).then(function(cv){setTimeout(function(){try{
   var R=analyze(cv,{k:+$('#sp-k',box).value,sens:+$('#sp-s',box).value,photos:$('#sp-ph',box).checked}),d=buildDesign(R,cv);
   var D0=a.D();if(D0&&D0.els&&D0.els.length&&!confirm('سيُستبدل التصميم الحالي بالتصميم المفكّك. متابعة؟ (يمكنك التراجع بـ Ctrl+Z)'))return msg('أُلغي.');
   var st=document.querySelector('.st-start');if(st)st.remove();
   var D={w:d.w,h:d.h,bg:d.bg,els:a.norm(d.els),assets:d.assets};a.setD(D);
   msg(R.fallback?'⚠️ الخلفية معقّدة (صورة فوتوغرافية أو نمط). وُضعت الصورة كخلفية كاملة ولم تُفكَّك. جرّب رفع نسخة بخلفية أبسط أو غيّر حساسية الفصل.':'✅ فُكِّكت إلى '+d.els.length+' طبقة: '+R.stats.shapes+' شكل، '+R.stats.images+' صورة/زخرفة، '+R.stats.texts+' نص. حدّد أي عنصر لتعدّله.');
   $('#sp-ocr',box).style.display=R.stats&&R.stats.texts?'':'none';
  }catch(e){msg('تعذّر التفكيك: '+e.message);console.error(e)}},30)},function(){msg('تعذّر قراءة الصورة')})};
 $('#sp-ocr',box).onclick=function(){var b=this;b.disabled=true;runOCR(a,msg).catch(function(e){msg('⚠️ '+(e&&e.message||e))}).then(function(){b.disabled=false})};
};
window.SplitDesign={analyze:analyze,buildDesign:buildDesign,fitText:fitText};
})();
