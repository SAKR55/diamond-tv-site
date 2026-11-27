/* Studio: رفع صورة تصميم وتفكيكها إلى طبقات (خلفية، أشكال، صور، نصوص) — تحليل ألوان وحواف بدون ذكاء اصطناعي، وOCR اختياري للنصوص */
(function(){
var SD=window.SD;if(!SD||!SD.tabFn||!SD.tabFn.ext)return;
var orig=SD.tabFn.ext,LAST=null;
function $(s,r){return(r||document).querySelector(s)}
function hex(r,g,b){return'#'+[r,g,b].map(function(v){v=Math.max(0,Math.min(255,Math.round(v)));return(v<16?'0':'')+v.toString(16)}).join('')}
function dist(a,b){var d0=a[0]-b[0],d1=a[1]-b[1],d2=a[2]-b[2];return Math.sqrt(d0*d0+d1*d1+d2*d2)}
function loadImg(f){return new Promise(function(res,rej){if(window.loadImageFile){loadImageFile(f,2400).then(function(r){res(r.canvas)},rej);return}var u=URL.createObjectURL(f),im=new Image();im.onload=function(){var c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);URL.revokeObjectURL(u);res(c)};im.onerror=rej;im.src=u})}

/* نموذج خلفية ملساء: سطح متعدد الحدود (درجة 3) بانحدار مرجّح متكرر يتجاهل الأجسام */
function fitBG(P,w,h){
 var N=w*h,st=Math.max(1,Math.floor(Math.sqrt(N/12000))),S=[];
 for(var y=0;y<h;y+=st)for(var x=0;x<w;x+=st){var i=(y*w+x)*4,u=x/(w-1)*2-1,v=y/(h-1)*2-1,edge=Math.min(x,y,w-1-x,h-1-y)<Math.min(w,h)*.08;S.push({u:u,v:v,c:[P[i],P[i+1],P[i+2]],w:edge?1:.25})}
 function B(u,v){var o=[];for(var i=0;i<=4;i++)for(var j=0;i+j<=4;j++)o.push(Math.pow(u,i)*Math.pow(v,j));return o}
 var K=15,coef=[[],[],[]];
 function solve(){var A=[],R=[[],[],[]];for(var i=0;i<K;i++){A.push(new Float64Array(K));for(var c=0;c<3;c++)R[c].push(0)}
  S.forEach(function(p){var b=B(p.u,p.v);for(var i=0;i<K;i++){for(var j=0;j<K;j++)A[i][j]+=p.w*b[i]*b[j];for(var c=0;c<3;c++)R[c][i]+=p.w*b[i]*p.c[c]}});
  for(var i2=0;i2<K;i2++)A[i2][i2]+=1e-6;
  for(var c2=0;c2<3;c2++){var M=A.map(function(r,i){return Array.prototype.slice.call(r).concat([R[c2][i]])});
   for(var i3=0;i3<K;i3++){var mx=i3;for(var r=i3+1;r<K;r++)if(Math.abs(M[r][i3])>Math.abs(M[mx][i3]))mx=r;var t=M[i3];M[i3]=M[mx];M[mx]=t;var d=M[i3][i3]||1e-9;for(var r2=i3+1;r2<K;r2++){var f=M[r2][i3]/d;for(var j2=i3;j2<=K;j2++)M[r2][j2]-=f*M[i3][j2]}}
   var x=new Array(K).fill(0);for(var i4=K-1;i4>=0;i4--){var sm=M[i4][K];for(var j3=i4+1;j3<K;j3++)sm-=M[i4][j3]*x[j3];x[i4]=sm/(M[i4][i4]||1e-9)}coef[c2]=x}}
 function pred(u,v){var b=B(u,v),o=[0,0,0];for(var c=0;c<3;c++){var s=0;for(var i=0;i<K;i++)s+=coef[c][i]*b[i];o[c]=s}return o}
 for(var it=0;it<10;it++){solve();S.forEach(function(p){var q=pred(p.u,p.v),d=Math.sqrt((q[0]-p.c[0])*(q[0]-p.c[0])+(q[1]-p.c[1])*(q[1]-p.c[1])+(q[2]-p.c[2])*(q[2]-p.c[2]));p.w=it<4?1/(1+(d/14)*(d/14)):(d<22?1:.01)})}
 solve();var out=new Uint8ClampedArray(N*3);
 for(var y2=0;y2<h;y2++){var v2=y2/(h-1)*2-1;for(var x2=0;x2<w;x2++){var u2=x2/(w-1)*2-1,q2=pred(u2,v2),k=(y2*w+x2)*3;out[k]=q2[0];out[k+1]=q2[1];out[k+2]=q2[2]}}
 return out}
/* انحراف مراعٍ للظل: اللون (كروما) بوزن كامل والإضاءة بوزن مخفّض عند الخلفيات الملوّنة */
function devPix(r,g,b,br,bg,bb){var L=.299*r+.587*g+.114*b,BL=.299*br+.587*bg+.114*bb,Lp=Math.max(L,14),Lb=Math.max(BL,14),c0=(r-L)/Lp-(br-BL)/Lb,c1=(g-L)/Lp-(bg-BL)/Lb,c2=(b-L)/Lp-(bb-BL)/Lb,dc=Math.sqrt(c0*c0+c1*c1+c2*c2)*130,bc=Math.sqrt((br-BL)*(br-BL)+(bg-BL)*(bg-BL)+(bb-BL)*(bb-BL)),wl=bc<14?1:.1;return dc*1.2+Math.abs(L-BL)*wl}
/* قناع جسم داخل مستطيل: انحراف عن الخلفية + ملء الثقوب + مكوّنات منفصلة بحواف ناعمة */
function objectsIn(P,BG,w,h,rc,thr,minA){
 var x0=rc.x,y0=rc.y,cw=rc.w,ch=rc.h,M=new Uint8Array(cw*ch);
 for(var y=0;y<ch;y++)for(var x=0;x<cw;x++){var p=(y0+y)*w+x0+x,i=p*4,j=p*3;if(devPix(P[i],P[i+1],P[i+2],BG[j],BG[j+1],BG[j+2])>thr)M[y*cw+x]=1}
 // فتح خفيف لإزالة الضجيج
 var E=new Uint8Array(M.length);for(var y1=1;y1<ch-1;y1++)for(var x1=1;x1<cw-1;x1++){var q=y1*cw+x1;E[q]=(M[q]&&M[q-1]&&M[q+1]&&M[q-cw]&&M[q+cw])?1:0}
 var Dl=new Uint8Array(M.length);for(var y2=1;y2<ch-1;y2++)for(var x2=1;x2<cw-1;x2++){var q2=y2*cw+x2;if(E[q2]||E[q2-1]||E[q2+1]||E[q2-cw]||E[q2+cw]||E[q2-cw-1]||E[q2+cw+1]||E[q2-cw+1]||E[q2+cw-1])Dl[q2]=M[q2]}
 M=Dl;
 // ملء الثقوب: ما لا يصل إليه الفيض من الحدود
 var out=new Uint8Array(M.length),st=[];for(var x3=0;x3<cw;x3++){st.push(x3);st.push((ch-1)*cw+x3)}for(var y3=0;y3<ch;y3++){st.push(y3*cw);st.push(y3*cw+cw-1)}
 while(st.length){var c=st.pop();if(M[c]||out[c])continue;out[c]=1;var cx=c%cw,cy=(c/cw)|0;if(cx>0)st.push(c-1);if(cx<cw-1)st.push(c+1);if(cy>0)st.push(c-cw);if(cy<ch-1)st.push(c+cw)}
 for(var i2=0;i2<M.length;i2++)M[i2]=out[i2]?0:1;
 // إغلاق مورفولوجي لسدّ الثقوب المفتوحة داخل الجسم (أسطح مشابهة للخلفية)
 (function(){var r=Math.max(4,Math.round(Math.min(cw,ch)*.012));function pass(src,grow){var T=new Uint8Array(src.length);for(var y=1;y<ch-1;y++)for(var x=1;x<cw-1;x++){var q=y*cw+x;T[q]=grow?(src[q]||src[q-1]||src[q+1]||src[q-cw]||src[q+cw]?1:0):(src[q]&&src[q-1]&&src[q+1]&&src[q-cw]&&src[q+cw]?1:0)}return T}
  var A=M;for(var i=0;i<r;i++)A=pass(A,1);for(var j=0;j<r;j++)A=pass(A,0);for(var q=0;q<M.length;q++)if(A[q])M[q]=1})();
 // فصل الأجسام الملتصقة: تآكل ثم مكوّنات ثم نمو العلامات داخل القناع (شبه watershed) مع زيادة التآكل حتى تنفصل
 var Mtot=0;for(var iq=0;iq<M.length;iq++)Mtot+=M[iq];
 function labelAt(re){var Er=new Uint8Array(M);
  for(var it=0;it<re;it++){var T=new Uint8Array(Er.length);for(var yy=1;yy<ch-1;yy++)for(var xx=1;xx<cw-1;xx++){var q3=yy*cw+xx;T[q3]=(Er[q3]&&Er[q3-1]&&Er[q3+1]&&Er[q3-cw]&&Er[q3+cw])?1:0}Er=T}
  var lab=new Int32Array(M.length),n=0,seeds=[];
  for(var s0=0;s0<M.length;s0++){if(!Er[s0]||lab[s0])continue;n++;var stk=[s0];lab[s0]=n;while(stk.length){var c2=stk.pop();seeds.push(c2);var cx2=c2%cw,cy2=(c2/cw)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nx=cx2+d[0],ny=cy2+d[1];if(nx>=0&&nx<cw&&ny>=0&&ny<ch){var j=ny*cw+nx;if(Er[j]&&!lab[j]){lab[j]=n;stk.push(j)}}})}}
  var q=seeds,qi=0;while(qi<q.length){var c3=q[qi++],l3=lab[c3],cx3=c3%cw,cy3=(c3/cw)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nx=cx3+d[0],ny=cy3+d[1];if(nx>=0&&nx<cw&&ny>=0&&ny<ch){var j=ny*cw+nx;if(M[j]&&!lab[j]){lab[j]=l3;q.push(j)}}})}
  var st2={};for(var y5=0;y5<ch;y5++)for(var x5=0;x5<cw;x5++){var l=lab[y5*cw+x5];if(!l||!M[y5*cw+x5])continue;var o=st2[l]||(st2[l]={id:l,x0:1e9,y0:1e9,x1:-1,y1:-1,a:0});o.a++;if(x5<o.x0)o.x0=x5;if(x5>o.x1)o.x1=x5;if(y5<o.y0)o.y0=y5;if(y5>o.y1)o.y1=y5}
  var objs=Object.keys(st2).map(function(k){return st2[k]}).filter(function(o){return o.a>=minA});return{lab:lab,objs:objs}}
 var base=Math.max(3,Math.round(Math.min(cw,ch)*.009)),best=labelAt(base);
 // تقسيم الكتل الكبيرة الملتصقة بتحويل المسافة (watershed): بذور = قلوب سميكة، والعنق الرفيع يفصل
 function splitBig(res,round){var out=[];var next=0;res.objs.forEach(function(o){if(o.a<Mtot*.18){out.push(o);return}
   var bw=o.x1-o.x0+1,bh=o.y1-o.y0+1,DT=new Float32Array(bw*bh),ids=res.lab;
   for(var y=0;y<bh;y++)for(var x=0;x<bw;x++){var q=(o.y0+y)*cw+o.x0+x;DT[y*bw+x]=(M[q]&&ids[q]===o.id)?1e4:0}
   for(var y2=0;y2<bh;y2++)for(var x2=0;x2<bw;x2++){var k=y2*bw+x2;if(!DT[k])continue;var v=(y2===0||x2===0)?1:Math.min(DT[k-1],DT[k-bw])+1;DT[k]=Math.min(DT[k],v)}
   for(var y3=bh-1;y3>=0;y3--)for(var x3=bw-1;x3>=0;x3--){var k2=y3*bw+x3;if(!DT[k2])continue;var v2=(y3===bh-1||x3===bw-1)?1:Math.min(DT[k2+1],DT[k2+bw])+1;DT[k2]=Math.min(DT[k2],v2)}
   var mx=0;for(var i=0;i<DT.length;i++)if(DT[i]>mx)mx=DT[i];
   var thr=mx*(round?.62:.5),sd=new Int32Array(DT.length),sn=0,sq=[];
   for(var s0=0;s0<DT.length;s0++){if(DT[s0]<thr||sd[s0])continue;sn++;var st=[s0];sd[s0]=sn;while(st.length){var c=st.pop();sq.push(c);var cx=c%bw,cy=(c/bw)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nx=cx+d[0],ny=cy+d[1];if(nx>=0&&nx<bw&&ny>=0&&ny<bh){var j=ny*bw+nx;if(DT[j]>=thr&&!sd[j]){sd[j]=sn;st.push(j)}}})}}
   if(sn<2){out.push(o);return}
   var qi=0;while(qi<sq.length){var c2=sq[qi++],l=sd[c2],cx2=c2%bw,cy2=(c2/bw)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nx=cx2+d[0],ny=cy2+d[1];if(nx>=0&&nx<bw&&ny>=0&&ny<bh){var j=ny*bw+nx;if(DT[j]>0&&!sd[j]){sd[j]=l;sq.push(j)}}})}
   var parts={};for(var y4=0;y4<bh;y4++)for(var x4=0;x4<bw;x4++){var l2=sd[y4*bw+x4];if(!l2)continue;var q2=(o.y0+y4)*cw+o.x0+x4,P2=parts[l2]||(parts[l2]={id:1e6+(++next)+round*1e5,x0:1e9,y0:1e9,x1:-1,y1:-1,a:0,l:l2});P2.a++;var X=o.x0+x4,Y=o.y0+y4;if(X<P2.x0)P2.x0=X;if(X>P2.x1)P2.x1=X;if(Y<P2.y0)P2.y0=Y;if(Y>P2.y1)P2.y1=Y;ids[q2]=P2.id}
   Object.keys(parts).forEach(function(k){if(parts[k].a>=minA)out.push(parts[k])})});
  res.objs=out;return res}
 best=splitBig(splitBig(best,0),1);
 return{M:M,lab:best.lab,objs:best.objs,cw:cw,ch:ch}}
function objectCutout(P,w,rc,O,ob){
 var x0=Math.max(0,ob.x0-2),y0=Math.max(0,ob.y0-2),x1=Math.min(O.cw-1,ob.x1+2),y1=Math.min(O.ch-1,ob.y1+2),cw=x1-x0+1,ch=y1-y0+1,c=document.createElement('canvas');c.width=cw;c.height=ch;var cc=c.getContext('2d'),d=cc.createImageData(cw,ch),Mo=new Uint8Array(cw*ch);
 for(var y=0;y<ch;y++)for(var x=0;x<cw;x++){var q=(y0+y)*O.cw+x0+x;if(O.M[q]&&O.lab[q]===ob.id)Mo[y*cw+x]=1}
 for(var y2=0;y2<ch;y2++)for(var x2=0;x2<cw;x2++){var sm=0,n=0;for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){var yy=y2+dy,xx=x2+dx;if(yy>=0&&yy<ch&&xx>=0&&xx<cw){sm+=Mo[yy*cw+xx];n++}}var a=sm/n;if(a>0){var p=((rc.y+y0+y2)*w+rc.x+x0+x2)*4,k=(y2*cw+x2)*4;d.data[k]=P[p];d.data[k+1]=P[p+1];d.data[k+2]=P[p+2];d.data[k+3]=Math.min(255,Math.round(a*255*1.6))}}
 cc.putImageData(d,0,0);return{canvas:c,x:rc.x+x0,y:rc.y+y0,w:cw,h:ch}}
/* ---------- التحليل ---------- */
function analyze(src,o){
 var MAXD=1400,S=Math.min(1,MAXD/Math.max(src.width,src.height)),w=Math.max(8,Math.round(src.width*S)),h=Math.max(8,Math.round(src.height*S));
 var cv=document.createElement('canvas');cv.width=w;cv.height=h;var cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(src,0,0,w,h);
 var id=cx.getImageData(0,0,w,h),P=id.data,N=w*h;
 // --- نموذج الخلفية: ألوان الزوايا (استيفاء ثنائي)
 function corner(x0,y0){var s=[0,0,0],n=0,k=Math.max(3,Math.round(Math.min(w,h)*.02));for(var y=y0;y<y0+k;y++)for(var x=x0;x<x0+k;x++){var i=(y*w+x)*4;s[0]+=P[i];s[1]+=P[i+1];s[2]+=P[i+2];n++}return[s[0]/n,s[1]/n,s[2]/n]}
 var k0=Math.max(3,Math.round(Math.min(w,h)*.02)),cTL=corner(0,0),cTR=corner(w-k0,0),cBL=corner(0,h-k0),cBR=corner(w-k0,h-k0);
 // هل الحواف بلون متجانس؟ نقيس انحراف عيّنات الحواف عن النموذج
 var BG=fitBG(P,w,h),bgAt=function(x,y){var i=(y*w+x)*3;return[BG[i],BG[i+1],BG[i+2]]};
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
 var DV=new Uint8Array(N);for(var yv=0;yv<h;yv++)for(var xv=0;xv<w;xv++){var pv=yv*w+xv,bv=bgAt(xv,yv);if(devPix(P[pv*4],P[pv*4+1],P[pv*4+2],bv[0],bv[1],bv[2])>thr)DV[pv]=1}
 // --- أجسام ملوّنة (منتجات، أشخاص، صور): مكوّنات الانحراف عن الخلفية متعددة الألوان
 var OB=objectsIn(P,BG,w,h,{x:0,y:0,w:w,h:h},Math.max(24,thr*.75),Math.max(150,N*.0012)),photos=[],objList=[],inPhoto=new Uint8Array(N);
 OB.objs.forEach(function(ob){var cnt={},tot=0;for(var y=ob.y0;y<=ob.y1;y++)for(var x=ob.x0;x<=ob.x1;x++){var q=y*w+x;if(OB.M[q]&&OB.lab[q]===ob.id){cnt[L[q]]=(cnt[L[q]]||0)+1;tot++}}
  var nl=0;for(var kk in cnt)if(cnt[kk]>=tot*.06)nl++;var bw0=ob.x1-ob.x0+1,bh0=ob.y1-ob.y0+1;
  if(o.photos&&(nl>=4||(ob.a>=N*.02&&nl>=3))&&bw0>w*.04&&bh0>h*.04){objList.push(ob);photos.push({x:ob.x0,y:ob.y0,w:bw0,h:bh0})}});
 objList.forEach(function(ob){for(var y=Math.max(0,ob.y0-2);y<=Math.min(h-1,ob.y1+2);y++)for(var x=Math.max(0,ob.x0-2);x<=Math.min(w-1,ob.x1+2);x++){var q=y*w+x;if(OB.M[q]&&OB.lab[q]===ob.id)inPhoto[q]=1}});
 // توسيع قناع الأجسام بمقدار 2 بكسل لاستبعاد هالاتها من المقدمة
 (function(){var cp=new Uint8Array(inPhoto);for(var y=2;y<h-2;y++)for(var x=2;x<w-2;x++){var q=y*w+x;if(cp[q]){for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++)inPhoto[q+dy*w+dx]=1}}})();
 var photoArea=0;objList.forEach(function(ob){photoArea+=ob.a});
 // --- المقدمة F
 var F=new Uint8Array(N),fc=0;for(var y2=0;y2<h;y2++)for(var x2=0;x2<w;x2++){var pi=y2*w+x2;if(inPhoto[pi])continue;F[pi]=1;fc++}
 var res={w:w,h:h,S:S,cv:cv,P:P,photos:photos,bg:{tl:cTL,tr:cTR,bl:cBL,br:cBR},els:[],stats:{}};
 (function(){var bc=document.createElement('canvas');bc.width=w;bc.height=h;var bx=bc.getContext('2d'),id2=bx.createImageData(w,h);for(var i=0;i<N;i++){id2.data[i*4]=BG[i*3];id2.data[i*4+1]=BG[i*3+1];id2.data[i*4+2]=BG[i*3+2];id2.data[i*4+3]=255}bx.putImageData(id2,0,0);res.bgCanvas=bc;res.bgFit=BG;res.devAt=function(x,y){var p=y*w+x,j=p*3;return{px:[P[p*4],P[p*4+1],P[p*4+2]],bg:[BG[j],BG[j+1],BG[j+2]],d:devPix(P[p*4],P[p*4+1],P[p*4+2],BG[j],BG[j+1],BG[j+2]),thr:thr}}})();
 if(photoArea>N*.42){res.fallback=true;return res}
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
 var fgArea=0,keep=[];list.forEach(function(R){var tb=R.x0<=0||R.y0<=0||R.x1>=w-1||R.y1>=h-1;if(tb||R.a>=N*.01){var n=0,dv=0,st=Math.max(1,Math.floor(R.a/3000));for(var y=R.y0;y<=R.y1;y++)for(var x=R.x0;x<=R.x1;x+=1){var p=y*w+x;if((p%st)===0&&owns(R,p)){var bb=bgAt(x,y);dv+=devPix(P[p*4],P[p*4+1],P[p*4+2],bb[0],bb[1],bb[2]);n++}}if(n&&dv/n<thr*.9)return}
  if(R.a<N*.01){var nm=0,pm=0,pst=Math.max(1,Math.floor(Math.sqrt(R.a)/40)),dm=0,dn=0;for(var y=R.y0;y<=R.y1;y+=1){for(var x=R.x0;x<=R.x1;x+=pst){var p=y*w+x;if(!owns(R,p))continue;var bb=bgAt(x,y);dm+=devPix(P[p*4],P[p*4+1],P[p*4+2],bb[0],bb[1],bb[2]);dn++;[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nx=x+d[0],ny=y+d[1];if(nx<0||ny<0||nx>=w||ny>=h)return;var q=ny*w+nx;if(!owns(R,q)&&!inPhoto[q]){pm++;if(!DV[q])nm++}})}}if(dn&&pm>8&&dm/dn<thr*.8&&nm/pm>.5)return}
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
 var usedObj=0;
 objList.sort(function(a,b){return b.a-a.a});
 objList.slice(0,60).forEach(function(ob,i){els.push({kind:'image',name:'جسم '+(i+1),cut:objectCutout(P,w,{x:0,y:0,w:w,h:h},OB,ob)});usedObj++});
 res.objCount=usedObj;
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

/* ---------- خلفيات معقّدة: كشف أسطر النص بالتنائية المحلية + ترميم الخلفية خلفها ---------- */
function analyzeComplex(src,o){
 var MAXD=1400,S=Math.min(1,MAXD/Math.max(src.width,src.height)),w=Math.max(8,Math.round(src.width*S)),h=Math.max(8,Math.round(src.height*S));
 var cv=document.createElement('canvas');cv.width=w;cv.height=h;var cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(src,0,0,w,h);
 var P=cx.getImageData(0,0,w,h).data,N=w*h,lum=new Float32Array(N);for(var i=0;i<N;i++)lum[i]=.299*P[i*4]+.587*P[i*4+1]+.114*P[i*4+2];
 var BS=Math.max(8,Math.round(Math.min(w,h)/90)),bw=Math.ceil(w/BS),bh=Math.ceil(h/BS),T=new Uint8Array(bw*bh);
 function two(x0,y0,x1,y1){ // 2-means على الإضاءة ثم متوسطات الألوان
  var lo=255,hi=0;for(var y=y0;y<y1;y++)for(var x=x0;x<x1;x++){var l=lum[y*w+x];if(l<lo)lo=l;if(l>hi)hi=l}
  if(hi-lo<70)return null;var t=(lo+hi)/2;
  for(var it=0;it<4;it++){var s0=0,n0=0,s1=0,n1=0;for(var y=y0;y<y1;y++)for(var x=x0;x<x1;x++){var l=lum[y*w+x];if(l<t){s0+=l;n0++}else{s1+=l;n1++}}if(!n0||!n1)return null;t=(s0/n0+s1/n1)/2}
  var A=[0,0,0],B=[0,0,0],na=0,nb=0,v0=0,v1=0;
  for(var y=y0;y<y1;y++)for(var x=x0;x<x1;x++){var p=(y*w+x)*4;if(lum[y*w+x]<t){A[0]+=P[p];A[1]+=P[p+1];A[2]+=P[p+2];na++}else{B[0]+=P[p];B[1]+=P[p+1];B[2]+=P[p+2];nb++}}
  A=[A[0]/na,A[1]/na,A[2]/na];B=[B[0]/nb,B[1]/nb,B[2]/nb];
  for(var y=y0;y<y1;y++)for(var x=x0;x<x1;x++){var p=(y*w+x)*4,c=[P[p],P[p+1],P[p+2]];if(lum[y*w+x]<t)v0+=dist(c,A);else v1+=dist(c,B)}
  return{t:t,A:A,B:B,na:na,nb:nb,sd:Math.max(v0/na,v1/nb),sep:dist(A,B)}}
 for(var by=0;by<bh;by++)for(var bx=0;bx<bw;bx++){var r=two(bx*BS,by*BS,Math.min(w,bx*BS+BS),Math.min(h,by*BS+BS));if(r&&r.sep>=95&&r.sd<38&&Math.min(r.na,r.nb)>=(BS*BS)*.1&&Math.min(r.na,r.nb)<=(BS*BS)*.6)T[by*bw+bx]=1}
 // إغلاق أفقي لربط الحروف في أسطر
 var G=Math.max(2,Math.round(BS*.0+3)),M=new Uint8Array(T.length);
 for(var y=0;y<bh;y++){var last=-99;for(var x=0;x<bw;x++){if(T[y*bw+x]){if(x-last<=G&&last>=0)for(var q=last;q<=x;q++)M[y*bw+q]=1;M[y*bw+x]=1;last=x}}}
 var seen=new Uint8Array(M.length),boxes=[];
 for(var s0=0;s0<M.length;s0++){if(!M[s0]||seen[s0])continue;var st=[s0],x0=1e9,y0=1e9,x1=-1,y1=-1,cnt=0,tc=0;seen[s0]=1;
  while(st.length){var c=st.pop(),cxp=c%bw,cyp=(c/bw)|0;cnt++;tc+=T[c];if(cxp<x0)x0=cxp;if(cxp>x1)x1=cxp;if(cyp<y0)y0=cyp;if(cyp>y1)y1=cyp;[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].forEach(function(d){var nx=cxp+d[0],ny=cyp+d[1];if(nx>=0&&nx<bw&&ny>=0&&ny<bh&&M[ny*bw+nx]&&!seen[ny*bw+nx]){seen[ny*bw+nx]=1;st.push(ny*bw+nx)}})}
  var X0=Math.max(0,x0*BS-BS),Y0=Math.max(0,y0*BS-Math.round(BS*.5)),X1=Math.min(w,(x1+1)*BS+BS),Y1=Math.min(h,(y1+1)*BS+Math.round(BS*.5)),bwp=X1-X0,bhp=Y1-Y0;
  if(tc<4||bhp<h*.012||bhp>h*.2||bwp<bhp*1.3||bwp<w*.06)continue;if(tc/((x1-x0+1)*(y1-y0+1))<.28)continue;boxes.push({x:X0,y:Y0,w:bwp,h:bhp})}
 // إزالة التداخل
 boxes.sort(function(a,b){return b.w*b.h-a.w*a.h});var keep=[];boxes.forEach(function(b){for(var i=0;i<keep.length;i++){var k=keep[i],ix=Math.max(0,Math.min(b.x+b.w,k.x+k.w)-Math.max(b.x,k.x)),iy=Math.max(0,Math.min(b.y+b.h,k.y+k.h)-Math.max(b.y,k.y));if(ix*iy>b.w*b.h*.5)return}keep.push(b)});
 var out=document.createElement('canvas');out.width=w;out.height=h;var ox=out.getContext('2d');ox.drawImage(cv,0,0);var OD=ox.getImageData(0,0,w,h),O=OD.data,Msk=new Uint8Array(N),els=[];
 keep.forEach(function(b){var r=two(b.x,b.y,b.x+b.w,b.y+b.h);if(!r)return;var tcol,bcol,tIsLow=r.na<r.nb;tcol=tIsLow?r.A:r.B;bcol=tIsLow?r.B:r.A;
  var cw=b.w,ch=b.h,c=document.createElement('canvas');c.width=cw;c.height=ch;var cc=c.getContext('2d'),d=cc.createImageData(cw,ch),m=new Uint8Array(cw*ch),cnt=0;
  for(var y=0;y<ch;y++)for(var x=0;x<cw;x++){var p=((b.y+y)*w+b.x+x)*4,col=[P[p],P[p+1],P[p+2]];if(dist(col,tcol)<dist(col,bcol)&&dist(col,tcol)<110){m[y*cw+x]=1;cnt++}}
  if(cnt<cw*ch*.04)return;
  // توسيع القناع بمقدار بكسل لتغطية حواف التنعيم
  var m2=new Uint8Array(m);for(var y=1;y<ch-1;y++)for(var x=1;x<cw-1;x++)if(!m[y*cw+x]&&(m[y*cw+x-1]||m[y*cw+x+1]||m[(y-1)*cw+x]||m[(y+1)*cw+x]))m2[y*cw+x]=1;
  var x0m=1e9,y0m=1e9,x1m=-1,y1m=-1;for(var y=0;y<ch;y++)for(var x=0;x<cw;x++)if(m[y*cw+x]){if(x<x0m)x0m=x;if(x>x1m)x1m=x;if(y<y0m)y0m=y;if(y>y1m)y1m=y}
  for(var y=0;y<ch;y++)for(var x=0;x<cw;x++){if(m2[y*cw+x]){var p=((b.y+y)*w+b.x+x)*4,k=(y*cw+x)*4;d.data[k]=P[p];d.data[k+1]=P[p+1];d.data[k+2]=P[p+2];d.data[k+3]=255;Msk[(b.y+y)*w+b.x+x]=1}}
  cc.putImageData(d,0,0);
  els.push({kind:'text',name:'نص',cut:{canvas:c,x:b.x,y:b.y,w:cw,h:ch,mask:m2},x:b.x+x0m,y:b.y+y0m,w:x1m-x0m+1,h:y1m-y0m+1,col:hex(tcol[0],tcol[1],tcol[2]),dens:cnt/(cw*ch)})});
 // ترميم: تعبئة بكسلات النص الممسوحة من محيطها (انتشار تدريجي)
 var known=new Uint8Array(N),q=[];for(var i=0;i<N;i++)known[i]=Msk[i]?0:1;
 for(var i=0;i<N;i++)if(!known[i]){var x=i%w,y=(i/w)|0;if((x>0&&known[i-1])||(x<w-1&&known[i+1])||(y>0&&known[i-w])||(y<h-1&&known[i+w]))q.push(i)}
 while(q.length){var nq=[],fills=[];q.forEach(function(i){if(known[i])return;var x=i%w,y=(i/w)|0,s=[0,0,0],n=0;[[-1,0],[1,0],[0,-1],[0,1]].forEach(function(d){var nx=x+d[0],ny=y+d[1];if(nx<0||ny<0||nx>=w||ny>=h)return;var j=ny*w+nx;if(known[j]){s[0]+=O[j*4];s[1]+=O[j*4+1];s[2]+=O[j*4+2];n++}});if(n)fills.push([i,s[0]/n,s[1]/n,s[2]/n])});
  if(!fills.length)break;fills.forEach(function(f){var i=f[0];if(known[i])return;O[i*4]=f[1];O[i*4+1]=f[2];O[i*4+2]=f[3];known[i]=1;var x=i%w,y=(i/w)|0;[[-1,0],[1,0],[0,-1],[0,1]].forEach(function(d){var nx=x+d[0],ny=y+d[1];if(nx>=0&&ny>=0&&nx<w&&ny<h&&!known[ny*w+nx])nq.push(ny*w+nx)})});q=nq}
 ox.putImageData(OD,0,0);
 return{w:w,h:h,S:S,cv:out,P:P,photos:[],bg:{tl:[0,0,0],tr:[0,0,0],bl:[0,0,0],br:[0,0,0]},els:els,fallback:true,complex:true,stats:{photos:0,shapes:0,images:0,texts:els.length}}}
/* ---------- بناء مستند المحرر ---------- */
function buildDesign(R,srcCanvas){
 var k=srcCanvas.width/R.w,W=srcCanvas.width,H=srcCanvas.height,f=k,assets={},n=0,els=[];
 function asset(c,type,q){var key='sp'+(++n);assets[key]=c.toDataURL(type||'image/png',q);return key}
 function avg(a,b){return[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2]}
 // قصّ بدقة كاملة من الأصل بقناع ألفا مأخوذ من التحليل (يُكبَّر بسلاسة)
 function fullCut(cut){var fw=Math.max(1,Math.round(cut.w*k)),fh=Math.max(1,Math.round(cut.h*k)),c=document.createElement('canvas');c.width=fw;c.height=fh;var x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(srcCanvas,cut.x*k,cut.y*k,cut.w*k,cut.h*k,0,0,fw,fh);x.globalCompositeOperation='destination-in';x.imageSmoothingEnabled=true;x.drawImage(cut.canvas,0,0,fw,fh);return c}
 // قناع العناصر المستخرجة (بدقة التحليل) لإعادة بناء الخلفية خلفها
 var Mk=new Uint8Array(R.w*R.h);
 function markAlpha(cut){var d=cut.canvas.getContext('2d').getImageData(0,0,cut.w,cut.h).data;for(var y=0;y<cut.h;y++)for(var x=0;x<cut.w;x++)if(d[(y*cut.w+x)*4+3]>200){var X=cut.x+x,Y=cut.y+y;if(X>=0&&Y>=0&&X<R.w&&Y<R.h)Mk[Y*R.w+X]=1}}
 function markRect(e){for(var y=Math.max(0,e.y);y<Math.min(R.h,e.y+e.h);y++)for(var x=Math.max(0,e.x);x<Math.min(R.w,e.x+e.w);x++)Mk[y*R.w+x]=1}
 R.els.forEach(function(e){if(e.cut)markAlpha(e.cut);else if(e.kind==='shape')markRect(e)});
 function composeBG(fill){ // الأصل بدقته + استبدال المناطق المغطّاة بالخلفية النظيفة
  var m=document.createElement('canvas');m.width=R.w;m.height=R.h;var mx=m.getContext('2d'),md=mx.createImageData(R.w,R.h);
  for(var q=0;q<R.w*R.h;q++)if(Mk[q])md.data[q*4+3]=255
  // توسيع إضافي بكسل واحد
  mx.putImageData(md,0,0);
  var out=document.createElement('canvas');out.width=W;out.height=H;var ox=out.getContext('2d');ox.imageSmoothingQuality='high';ox.drawImage(srcCanvas,0,0);
  var t=document.createElement('canvas');t.width=W;t.height=H;var tx=t.getContext('2d');tx.imageSmoothingEnabled=true;tx.imageSmoothingQuality='high';tx.drawImage(fill,0,0,W,H);tx.globalCompositeOperation='destination-in';tx.drawImage(m,0,0,W,H);
  ox.drawImage(t,0,0);return out}
 var bg,B=R.bg,topc=avg(B.tl,B.tr),botc=avg(B.bl,B.br),lc=avg(B.tl,B.bl),rc=avg(B.tr,B.br);
 function bgImage(fill){var c=composeBG(fill);return{t:'img',src:asset(c,'image/jpeg',.97)}}
 if(R.complex)bg=bgImage(R.cv);
 else if(R.fallback){var fc=document.createElement('canvas');fc.width=W;fc.height=H;fc.getContext('2d').drawImage(srcCanvas,0,0);bg={t:'img',src:asset(fc,'image/jpeg',.97)}}
 else if(dist(topc,botc)<14&&dist(lc,rc)<14&&!(R.objCount>0))bg={t:'solid',c:[hex.apply(null,avg(topc,botc))]};
 else if(R.bgCanvas){var BGf=R.bgFit,ci=((R.h>>1)*R.w+(R.w>>1))*3,mid=avg(topc,botc),lin=dist([BGf[ci],BGf[ci+1],BGf[ci+2]],mid);
  if(lin>14||R.objCount>0)bg=bgImage(R.bgCanvas);else if(dist(topc,botc)>=dist(lc,rc))bg={t:'grad',c:[hex.apply(null,topc),hex.apply(null,botc),180]};else bg={t:'grad',c:[hex.apply(null,lc),hex.apply(null,rc),90]}}
 else if(dist(topc,botc)>=dist(lc,rc))bg={t:'grad',c:[hex.apply(null,topc),hex.apply(null,botc),180]};
 else bg={t:'grad',c:[hex.apply(null,lc),hex.apply(null,rc),90]};
 R.els.forEach(function(e){
  if(e.kind==='shape'){var s={type:'shape',k:e.k,x:e.x*f,y:e.y*f,w:e.w*f,h:e.h*f,fill:e.fill,name:e.name};if(e.r)s.r=e.r*f;els.push(s)}
  else if(e.kind==='image'){var cv2,x,y,w,h;if(e.cut){cv2=fullCut(e.cut);x=e.cut.x;y=e.cut.y;w=e.cut.w;h=e.cut.h}else{var cr=e.crop;cv2=document.createElement('canvas');cv2.width=Math.round(cr.w*k);cv2.height=Math.round(cr.h*k);cv2.getContext('2d').drawImage(srcCanvas,cr.x*k,cr.y*k,cr.w*k,cr.h*k,0,0,cv2.width,cv2.height);x=cr.x;y=cr.y;w=cr.w;h=cr.h}
   els.push({type:'image',src:asset(cv2,'image/png'),clip:'rect',x:x*f,y:y*f,w:w*f,h:h*f,name:e.name})}
  else if(e.kind==='text'){var c=e.cut;els.push({type:'image',src:asset(fullCut(c),'image/png'),clip:'rect',x:c.x*f,y:c.y*f,w:c.w*f,h:c.h*f,name:'نص (صورة) — حوّله لنص',sptxt:1,spcol:e.col,spdens:e.dens,spbox:[e.x*f,e.y*f,e.w*f,e.h*f]})}});
 return{w:W,h:H,bg:bg,els:els,assets:assets}}
/* ---------- OCR اختياري ---------- */
var TS=null;
function loadTess(){if(window.Tesseract)return Promise.resolve();if(TS)return TS;TS=new Promise(function(res,rej){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=res;s.onerror=function(){rej(new Error('تعذّر تحميل مكتبة التعرّف على النص (تحتاج اتصالًا بالإنترنت)'))};document.head.appendChild(s)});return TS}
function ocrInput(e,a){ // أسود على أبيض من قناع النص
 var D=a.D(),src=D.assets[e.src],im=new Image();return new Promise(function(res){im.onload=function(){var c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;var x=c.getContext('2d');x.drawImage(im,0,0);var d=x.getImageData(0,0,c.width,c.height),o=x.createImageData(c.width,c.height);for(var i=0;i<c.width*c.height;i++){var al=d.data[i*4+3];var v=al>128?0:255;o.data[i*4]=o.data[i*4+1]=o.data[i*4+2]=v;o.data[i*4+3]=255}
  var big=document.createElement('canvas'),k=Math.max(1,Math.min(4,80/c.height)),pad=12;big.width=Math.round(c.width*k)+pad*2;big.height=Math.round(c.height*k)+pad*2;var bx=big.getContext('2d');bx.fillStyle='#fff';bx.fillRect(0,0,big.width,big.height);var t=document.createElement('canvas');t.width=c.width;t.height=c.height;t.getContext('2d').putImageData(o,0,0);bx.imageSmoothingEnabled=true;bx.drawImage(t,pad,pad,big.width-pad*2,big.height-pad*2);res(big)};im.src=src})}
function fitText(t,boxW,boxH,dens){var c=document.createElement('canvas').getContext('2d'),fw=dens<.16?'400':'700';c.font=fw+' 100px Cairo, Tajawal, sans-serif';var lines=t.split('\n'),m=0;lines.forEach(function(l){m=Math.max(m,c.measureText(l).width)});var fs=100*boxW/Math.max(1,m);fs=Math.min(fs,boxH/lines.length*1.05);return{fs:Math.max(8,fs),fw:fw}}
function toTextEl(e,txt,ff){var bx=e.spbox,ft=fitText(txt,bx[2],bx[3],e.spdens||.3);return{id:e.id,type:'text',t:txt,x:bx[0]-bx[2]*.03,y:bx[1]+bx[3]/2-ft.fs*.7,w:bx[2]*1.06,h:ft.fs*1.4,fs:ft.fs,ff:ff||'Cairo',fw:ft.fw,col:e.spcol||'#111111',ta:'center',lh:1.25,op:1,rot:0,name:'نص: '+txt.slice(0,18)}}
function applyText(a,id,txt,ff){var D=a.D(),i=D.els.findIndex(function(x){return x.id===id&&x.sptxt});if(i<0||!txt)return false;D.els[i]=toTextEl(D.els[i],txt,ff);try{window.Studio.api.D().els&&0}catch(_){}return true}
function renderList(box,a){var D=a.D(),L=$('#sp-list',box);if(!L)return;var T=D.els.filter(function(e){return e.sptxt});if(!T.length){L.innerHTML='';return}
 L.innerHTML='<h4 style="margin:10px 0 4px">✏️ النصوص المكتشفة ('+T.length+')</h4><p class="st-hint">اكتب النص الصحيح في كل خانة ثم «تطبيق»، فيتحوّل إلى نص حقيقي بنفس الحجم واللون والمكان تقريبًا. أو استخدم زر القراءة التلقائية (OCR) أعلاه.</p>'+T.map(function(e,i){return'<div class="sp-row" data-id="'+e.id+'"><div class="sp-th"><img src="'+D.assets[e.src]+'"></div><input class="st-search sp-in" placeholder="اكتب النص هنا"><button class="sp-ap">تطبيق</button></div>'}).join('')+'<button class="st-big" id="sp-apall" style="background:#334155">تطبيق كل النصوص المكتوبة</button>';
 function doOne(row){var id=row.dataset.id,v=$('.sp-in',row).value.trim();if(!v)return false;var ok=applyText(a,id,v,($('#sp-ff',box)||{}).value);if(ok){row.remove()}return ok}
 $$all('.sp-row',L).forEach(function(r){$('.sp-ap',r).onclick=function(){if(doOne(r)){a.push();a.draw();a.props()}}});
 $('#sp-apall',L).onclick=function(){var n=0;$$all('.sp-row',L).forEach(function(r){if(doOne(r))n++});if(n){a.push();a.draw();a.props();a.toast('✅ تحوّل '+n+' نصًا')}}}
function $$all(s,r){return[].slice.call((r||document).querySelectorAll(s))}
async function runOCR(a,setMsg){
 var D=a.D(),targets=D.els.filter(function(e){return e.sptxt});if(!targets.length){setMsg('لا توجد نصوص مفكّكة لتحويلها.');return}
 setMsg('⏳ تحميل محرك التعرّف على النص…');await loadTess();
 var worker=await Tesseract.createWorker(['ara','eng']);var ok=0,fail=0;
 for(var i=0;i<targets.length;i++){var e=targets[i];setMsg('⏳ قراءة النصوص '+(i+1)+'/'+targets.length);
  try{var inp=await ocrInput(e,a);try{await worker.setParameters({tessedit_pageseg_mode:'7'})}catch(_){}var r=await worker.recognize(inp),txt=(r.data.text||'').replace(/\s+$/,'').replace(/\n+/g,' ').trim(),conf=r.data.confidence||0;
   if(txt&&conf>=45){var bx=e.spbox,ft=fitText(txt,bx[2],bx[3],e.spdens||.3);var cur=a.D();var idx=cur.els.indexOf(e);if(idx<0)continue;
    cur.els[idx]=toTextEl(e,txt,(document.querySelector('#sp-ff')||{}).value);ok++}else fail++}catch(err){fail++}}
 try{await worker.terminate()}catch(_){}
 a.push();a.draw();a.props();try{renderList(document.querySelector('#sp-ff').closest('div[data-sp]')||document,a)}catch(_){}setMsg('✅ تحوّل '+ok+' نصًا إلى نص قابل للتعديل'+(fail?' — وبقي '+fail+' كصورة (ثقة منخفضة)':'')+'. الخط المختار تقريبي: عدّله من لوحة النص.')}
/* ---------- الواجهة ---------- */
SD.tabFn.ext=function(p){orig(p);var a=window.Studio.api;
 if(!document.getElementById('sp-css')){var st=document.createElement('style');st.id='sp-css';st.textContent='.sp-row{display:grid;grid-template-columns:90px 1fr auto;gap:6px;align-items:center;margin:6px 0}.sp-th{background:#1e2140;border:1px solid #2e3358;border-radius:6px;height:44px;display:flex;align-items:center;justify-content:center;overflow:hidden}.sp-th img{max-width:100%;max-height:100%;object-fit:contain;background:repeating-conic-gradient(#2a2e55 0 25%,#1b1e3b 0 50%) 0 0/10px 10px}.sp-ap{background:#7c3aed;color:#fff;border:0;border-radius:8px;padding:6px 10px;cursor:pointer;font:inherit;font-weight:700}';document.head.appendChild(st)}
 var box=document.createElement('div');
 box.innerHTML='<h4>🧬 رفع تصميم وتفكيكه</h4><p class="st-hint">ارفع صورة تصميم (بوستر، بنر، إعلان). يفصل المحرر الخلفية والأشكال والصور والنصوص إلى طبقات مستقلة تحرّكها وتغيّرها وتحذفها. تحليل ألوان وحواف داخل متصفحك دون ذكاء اصطناعي ودون رفع الصورة لأي خادم.</p>'+
 '<button class="st-big" id="sp-up">⬆️ اختر صورة التصميم</button><input type="file" id="sp-f" accept="image/*" style="display:none">'+
 '<div class="st-row"><label>تفاصيل الألوان <input type="range" id="sp-k" min="6" max="16" value="10"></label></div><div class="st-row"><label>حساسية فصل الخلفية <input type="range" id="sp-s" min="20" max="90" value="42"></label></div><div class="st-row"><label><input type="checkbox" id="sp-ph" checked> اكتشف الصور والمناطق المعقّدة</label></div><div class="st-row"><label><input type="checkbox" id="sp-cx"> خلفية فوتوغرافية/معقّدة: افصل النصوص فقط ورمّم الخلفية خلفها</label></div>'+
 '<div class="st-row"><label>خط النصوص المحوّلة <select id="sp-ff">'+SD.fonts.filter(function(f){return f[1]==='عربي'}).map(function(f){return'<option>'+f[0]+'</option>'}).join('')+'</select></label></div><div id="sp-msg" class="st-hint" style="min-height:20px"></div><div id="sp-list" data-sp="1"></div><button class="st-big" id="sp-ocr" style="background:#334155;display:none">🔤 حوّل النصوص المفكّكة إلى نص قابل للتعديل (OCR)</button>';
 while(box.firstChild)p.appendChild(box.firstChild);box=p;
 var msg=function(t){$('#sp-msg',box).textContent=t};
 $('#sp-up',box).onclick=function(){$('#sp-f',box).click()};
 $('#sp-f',box).onchange=function(){var f=this.files[0];this.value='';if(!f)return;msg('⏳ تحليل الصورة…');
  loadImg(f).then(function(cv){setTimeout(function(){try{
   var R=$('#sp-cx',box).checked?analyzeComplex(cv):analyze(cv,{k:+$('#sp-k',box).value,sens:+$('#sp-s',box).value,photos:$('#sp-ph',box).checked});if(R.fallback&&!R.complex&&R.els.length===0)R=analyzeComplex(cv);var d=buildDesign(R,cv);
   var D0=a.D();if(D0&&D0.els&&D0.els.length&&!confirm('سيُستبدل التصميم الحالي بالتصميم المفكّك. متابعة؟ (يمكنك التراجع بـ Ctrl+Z)'))return msg('أُلغي.');
   var st=document.querySelector('.st-start');if(st)st.remove();
   var D={w:d.w,h:d.h,bg:d.bg,els:a.norm(d.els),assets:d.assets};a.setD(D);
   msg(R.complex?'ℹ️ الخلفية معقّدة (ثلاثية الأبعاد أو فوتوغرافية): فُصل '+d.els.length+' نصًا وعنصرًا وبقي باقي المشهد كخلفية بدقته الأصلية. النصوص المجسّمة أو المتوهجة قد لا تُكتشف.':'✅ فُكِّكت إلى '+d.els.length+' طبقة: '+R.stats.shapes+' شكل، '+R.stats.images+' صورة/زخرفة، '+R.stats.texts+' نص. حدّد أي عنصر لتعدّله.');
   $('#sp-ocr',box).style.display=R.stats&&R.stats.texts?'':'none';renderList(box,a);
  }catch(e){msg('تعذّر التفكيك: '+e.message);console.error(e)}},30)},function(){msg('تعذّر قراءة الصورة')})};
 $('#sp-ocr',box).onclick=function(){var b=this;b.disabled=true;runOCR(a,msg).catch(function(e){msg('⚠️ '+(e&&e.message||e))}).then(function(){b.disabled=false})};
};
window.SplitDesign={analyze:analyze,analyzeComplex:analyzeComplex,buildDesign:buildDesign,fitText:fitText};
})();
