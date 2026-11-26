(function(){
var M=document.getElementById('mu'); if(!M)return;
var AR=M.dataset.l==='ar',$=function(s){return M.querySelector(s)};
function H(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function R(seed){var s=seed||1;return function(){s=Math.imul(s^s>>>15,1|s);s^=s+Math.imul(s^s>>>7,61|s);return((s^s>>>14)>>>0)/4294967296}}
function pick(r,a){return a[Math.floor(r()*a.length)]}
var D={
ar:{
 pre:['نوفا','زيرو','لوما','كوزمو','ميرا','أوريون','فلو','تيرا','سيلا','نيو','أوبال','دلتا','ريما','هيلو'],suf:['كس','ري','تيك','زا','ون','لي','فاي','نو','ماتيك','يا'],
 room:['قاعة المستحيلات','جناح الأحلام الجانبية','رواق الأفكار الهاربة','معرض ما بعد الغد','صالة الاختراعات الخجولة'],
 mat:['خيوط الغيم','ضحكات مضغوطة','ذكريات مُعاد تدويرها','ضوء القمر المعبّأ','شغف مُجفَّف','هواء الإجازة','صبر مبلّل بالقهوة'],
 yr:['2087','2301','عام لم يأتِ بعد','قبل الأمس بقليل','سنة 3000'],
 sl:['{i}… لأن العالم يستحق مفاجأة.','جرّب {i} قبل أن يخترعوه.','{i}: الحل الذي لم يطلبه أحد.','مع {i} كل شيء ممكن، تقريبًا.','{i}. بسيط. غريب. لا غنى عنه.'],
 ph:['اكتب اختراعًا مستحيلًا… مثل: مظلة تحمي من الملل','مثال: قهوة بنكهة الأمس','مثال: ساعة تؤخّر المواعيد المملة'],
 adj:['الشجاع','الهادئ','العاصف','اللامع','الغامض','الصبور','السريع','الحالم','الماكر','النبيل','المرِح','الذكي'],
 noun:['صقر الظهيرة','نمر الليل','قمر الوادي','ثعلب القهوة','نجم الصباح','أسد الغيم','طائر الفكرة','عاصفة الابتسامة','بحّار الأرقام','حارس الشاي','رحّالة الضوء','مهندس الأحلام'],
 tm:'لقبك حتى الساعة',own:'لقب {n} الحالي',
 ex:'معروضة رقم',made:'مصنوع من',inv:'متحف الأشياء التي لم تُصنع',nm:'اكتب اسمك',
 nl:'جديد كل ساعة'},
en:{
 pre:['Nova','Zero','Luma','Cosmo','Mira','Orion','Flo','Terra','Sila','Neo','Opal','Delta','Rima','Hello'],suf:['x','ry','tek','za','on','ly','fy','no','matic','ya'],
 room:['Hall of Impossibles','Wing of Side-Dreams','Corridor of Escaped Ideas','Day-After-Tomorrow Gallery','Room of Shy Inventions'],
 mat:['cloud thread','compressed laughter','recycled memories','bottled moonlight','dried enthusiasm','vacation air','coffee-soaked patience'],
 yr:['2087','2301','a year that has not come','a bit before yesterday','year 3000'],
 sl:['{i}… because the world deserves a surprise.','Try {i} before they invent it.','{i}: the fix nobody asked for.','With {i}, everything is possible. Almost.','{i}. Simple. Strange. Essential.'],
 ph:['Describe an impossible invention… e.g. an umbrella against boredom','e.g. coffee that tastes like yesterday','e.g. a watch that delays boring meetings'],
 adj:['Brave','Calm','Stormy','Shiny','Mysterious','Patient','Swift','Dreamy','Cunning','Noble','Playful','Clever'],
 noun:['Noon Falcon','Night Tiger','Valley Moon','Coffee Fox','Morning Star','Cloud Lion','Idea Bird','Smile Storm','Number Sailor','Tea Guardian','Light Wanderer','Dream Engineer'],
 tm:'Your nickname until',own:"{n}'s current nickname",
 ex:'Exhibit No.',made:'Made of',inv:'Museum of Unmade Things',nm:'Type your name',
 nl:'New every hour'}};
var T=D[AR?'ar':'en'],mode='mu',cv=$('#mu-cv'),ctx=cv.getContext('2d');
function wrap(t,x,y,w,lh,max){var words=t.split(/\s+/),ln='',n=0;for(var i=0;i<words.length;i++){var tt=ln?ln+' '+words[i]:words[i];if(ctx.measureText(tt).width>w&&ln){ctx.fillText(ln,x,y);y+=lh;ln=words[i];if(++n>=max-1&&0)break}else ln=tt}ctx.fillText(ln,x,y);return y+lh}
var F='Cairo,Tahoma,"Segoe UI",sans-serif',SEED=0,ST=0;
var FU={ar:{tab:'هويتك في 2050',job:['مروّض روبوتات','مهندس أحلام رقمية','طبيب ذكريات','مرشد سياحي على المريخ','مصمّم طقس','مدرّب ذكاء اصطناعي','حارس بيانات','مزارع عمودي في السحاب','مبرمج مشاعر','قبطان مدينة عائمة','خبير رائحة افتراضية','مصلّح الزمن المعطّل'],city:['مدينة عائمة قرب جدة','برج سحابي في الرياض','قبّة زجاجية على المريخ','واحة ذكية في العلا','جزيرة صناعية في المحيط','محطة مدارية حول القمر'],car:['سحابة طائرة','كبسولة مغناطيسية','دراجة ضوئية','طائرة شخصية صغيرة','لا حاجة، تنتقل بالفكرة'],gift:['تحدّث 12 لغة بنقرة','تتذكر كل ما قرأت','تنام في دقيقتين','تحضّر القهوة بالتفكير','تكتشف الأكاذيب بنظرة'],lab:['الوظيفة','المدينة','المركبة','موهبتك'],hd:'بطاقة هوية المستقبل',yr:'عام 2050',id:'رقم الهوية',ok:'احتمال تحقق التوقع'},
 en:{tab:'Your 2050 ID',job:['Robot Whisperer','Digital Dream Engineer','Memory Doctor','Mars Tour Guide','Weather Designer','AI Coach','Data Guardian','Cloud Farmer','Emotion Programmer','Floating-City Captain','Virtual Scent Expert','Time-Glitch Fixer'],city:['Floating city near Jeddah','Cloud tower in Riyadh','Glass dome on Mars','Smart oasis in AlUla','Artificial island at sea','Orbital station around the Moon'],car:['Flying cloud','Magnetic pod','Light bike','Personal mini-jet','None: you travel by thought'],gift:['Speak 12 languages on tap','Remember everything you read','Sleep in two minutes','Brew coffee by thinking','Spot lies at a glance'],lab:['Job','City','Ride','Talent'],hd:'Future ID Card',yr:'Year 2050',id:'ID No.',ok:'Prediction chance'}};
var TF=FU[AR?'ar':'en'];
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function hsl(h,s,l,a){return'hsla('+(((h%360)+360)%360)+','+s+'%,'+l+'%,'+(a==null?1:a)+')'}
function blob(x,y,r,h,a){var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,hsl(h,85,50,a));g.addColorStop(1,hsl(h,85,50,0));ctx.fillStyle=g;ctx.fillRect(0,0,1080,1350)}
function frame(st,hue,r){ctx.direction=AR?'rtl':'ltr';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.globalAlpha=1;ctx.setLineDash([]);
 if(st===0||st===1){ctx.fillStyle=hsl(hue+220,45,7);ctx.fillRect(0,0,1080,1350);blob(200,150,720,hue,.55);blob(900,420,640,hue+70,.45);blob(300,1150,760,hue+150,.4);
  if(st===1){for(var b=0;b<4;b++){var g=ctx.createLinearGradient(0,0,1080,0);g.addColorStop(0,hsl(hue+b*40,90,60,0));g.addColorStop(.5,hsl(hue+b*40+30,90,62,.35));g.addColorStop(1,hsl(hue+b*40+70,90,60,0));ctx.strokeStyle=g;ctx.lineWidth=70-b*10;ctx.beginPath();for(var x=0;x<=1080;x+=20){var y=300+b*120+Math.sin(x/170+b*1.3+hue)*90;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}}
  ctx.fillStyle='rgba(255,255,255,.06)';for(var x=40;x<1080;x+=36)for(var y=40;y<1350;y+=36)ctx.fillRect(x,y,2,2);
  rr(44,44,992,1262,56);ctx.fillStyle='rgba(255,255,255,.055)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=2;ctx.stroke()}
 else if(st===2){var g=ctx.createLinearGradient(0,0,0,1350);g.addColorStop(0,hsl(hue+240,60,8));g.addColorStop(.55,hsl(hue+290,70,18));g.addColorStop(1,hsl(hue+330,80,26));ctx.fillStyle=g;ctx.fillRect(0,0,1080,1350);
  for(var k=0;k<60;k++){ctx.fillStyle='rgba(255,255,255,'+(.2+r()*.6)+')';ctx.fillRect(r()*1080,r()*640,2,2)}
  var hz=700;ctx.strokeStyle=hsl(hue+320,100,65,.55);ctx.lineWidth=2;for(var i=-12;i<=12;i++){ctx.beginPath();ctx.moveTo(540+i*30,hz);ctx.lineTo(540+i*190,1350);ctx.stroke()}for(var j=1;j<=9;j++){var yy=hz+Math.pow(j/9,2.2)*650;ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(1080,yy);ctx.stroke()}
  rr(48,48,984,1254,30);ctx.strokeStyle=hsl(hue+320,100,70,.9);ctx.lineWidth=4;ctx.shadowColor=hsl(hue+320,100,60);ctx.shadowBlur=24;ctx.stroke();ctx.shadowBlur=0}
 else{ctx.fillStyle=hsl(hue,50,12);ctx.fillRect(0,0,1080,1350);[[880,200,330,hue+20],[120,1060,300,hue+170],[960,1000,200,hue+90]].forEach(function(c){ctx.fillStyle=hsl(c[3],80,52,.9);ctx.beginPath();ctx.arc(c[0],c[1],c[2],0,6.283);ctx.fill()});ctx.fillStyle=hsl(hue,50,12,.82);ctx.fillRect(0,0,1080,1350);
  ctx.fillStyle=hsl(hue+170,90,60);rr(66,66,960,1230,34);ctx.fill();ctx.fillStyle=hsl(hue,52,10);rr(54,54,960,1230,34);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke()}}
function chip(t,x,y,fs){ctx.font='700 '+(fs||26)+'px '+F;var w=ctx.measureText(t).width+44,h=(fs||26)+26;rr(x-w/2,y-h/2,w,h,h/2);ctx.fillStyle='rgba(255,255,255,.1)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#fff';ctx.textBaseline='middle';ctx.fillText(t,x,y+2);ctx.textBaseline='alphabetic';return w}
function art(st,cx,cy,R0,hue,r){
 if(st===0||st===1){var g=ctx.createRadialGradient(cx-R0*.3,cy-R0*.35,R0*.1,cx,cy,R0);g.addColorStop(0,hsl(hue+40,95,78));g.addColorStop(.55,hsl(hue,85,55));g.addColorStop(1,hsl(hue-30,80,28));
  ctx.save();ctx.shadowColor=hsl(hue,90,55,.7);ctx.shadowBlur=90;
  if(st===0){ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R0,0,6.283);ctx.fill()}
  else{ctx.fillStyle=g;ctx.beginPath();for(var i=0;i<6;i++){var a=i*Math.PI/3-Math.PI/2;ctx.lineTo(cx+Math.cos(a)*R0*1.05,cy+Math.sin(a)*R0*1.05)}ctx.closePath();ctx.fill()}ctx.restore();
  if(st===1){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;for(var i=0;i<6;i++){var a=i*Math.PI/3-Math.PI/2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*R0*1.05,cy+Math.sin(a)*R0*1.05);ctx.stroke()}ctx.fillStyle='rgba(255,255,255,.2)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(-Math.PI/2)*R0*1.05,cy+Math.sin(-Math.PI/2)*R0*1.05);ctx.lineTo(cx+Math.cos(-Math.PI/6)*R0*1.05,cy+Math.sin(-Math.PI/6)*R0*1.05);ctx.closePath();ctx.fill()}
  else{ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.ellipse(cx-R0*.32,cy-R0*.4,R0*.22,R0*.12,-.7,0,6.283);ctx.fill()}
  for(var i=1;i<=3;i++){ctx.strokeStyle='rgba(255,255,255,'+(.34-i*.08)+')';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(cx,cy,R0*(1+i*.22),R0*(.34+i*.07),-.45+i*.1,0,6.283);ctx.stroke()}
  for(var k=0;k<14;k++){var a2=r()*6.283,d=R0*(1.15+r()*.9);ctx.fillStyle='rgba(255,255,255,'+(.4+r()*.5)+')';ctx.beginPath();ctx.arc(cx+Math.cos(a2)*d,cy+Math.sin(a2)*d*.8,2+r()*5,0,6.283);ctx.fill()}}
 else if(st===2){var g2=ctx.createLinearGradient(0,cy-R0,0,cy+R0);g2.addColorStop(0,hsl(hue+40,100,65));g2.addColorStop(1,hsl(hue+320,100,55));ctx.save();ctx.shadowColor=hsl(hue+320,100,60);ctx.shadowBlur=70;ctx.fillStyle=g2;ctx.beginPath();ctx.arc(cx,cy,R0,0,6.283);ctx.fill();ctx.restore();ctx.fillStyle=hsl(hue+250,60,12);for(var b=0;b<7;b++){var yy=cy+R0*.1+b*R0*.18;ctx.fillRect(cx-R0,yy,R0*2,3+b*3)}}
 else{var c1=hsl(hue+170,90,60),c2=hsl(hue+30,95,62),c3=hsl(hue+100,90,70);ctx.fillStyle=c2;ctx.beginPath();ctx.arc(cx-R0*.35,cy,R0*.8,0,6.283);ctx.fill();ctx.fillStyle=c1;ctx.beginPath();ctx.arc(cx+R0*.4,cy+R0*.1,R0*.6,Math.PI,0);ctx.closePath();ctx.fill();ctx.fillStyle=c3;ctx.beginPath();ctx.moveTo(cx-R0*.1,cy-R0*.9);ctx.lineTo(cx+R0*.55,cy-R0*.1);ctx.lineTo(cx-R0*.75,cy-R0*.1);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx-R0*.35,cy,R0*.8,0,6.283);ctx.stroke()}}

function ridge(x,y,w,base,amp,col,r,rough){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y+base+amp);var py=base;for(var i=0;i<=w;i+=14){py+=(r()-.5)*rough;py=Math.max(base-amp,Math.min(base+amp,py));ctx.lineTo(x+i,y+py)}ctx.lineTo(x+w,y+base+amp*3);ctx.lineTo(x,y+base+amp*3);ctx.closePath();ctx.fill()}
function stars(x,y,w,h,r,n){for(var i=0;i<n;i++){var a=.3+r()*.7,sz=r()<.1?2.6:1.3;ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.beginPath();ctx.arc(x+r()*w,y+r()*h,sz,0,6.283);ctx.fill()}}
function cloud(cx,cy,sc,a){ctx.fillStyle='rgba(255,255,255,'+a+')';[[0,0,40],[34,-12,34],[70,0,38],[34,10,40]].forEach(function(c){ctx.beginPath();ctx.arc(cx+c[0]*sc,cy+c[1]*sc,c[2]*sc,0,6.283);ctx.fill()})}
function scene(st,x,y,w,h,hue,r){ctx.save();rr(x,y,w,h,40);ctx.clip();var g,i;
 if(st===0){g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,hsl(hue+230,60,9));g.addColorStop(.6,hsl(hue+260,65,24));g.addColorStop(1,hsl(hue+300,70,42));ctx.fillStyle=g;ctx.fillRect(x,y,w,h);stars(x,y,w,h*.7,r,90);
  var px=x+w*.62,py=y+h*.38,R0=h*.27;var pg=ctx.createRadialGradient(px-R0*.4,py-R0*.4,R0*.1,px,py,R0);pg.addColorStop(0,hsl(hue+40,95,80));pg.addColorStop(.5,hsl(hue,85,56));pg.addColorStop(1,hsl(hue-40,80,24));ctx.save();ctx.shadowColor=hsl(hue,95,60,.8);ctx.shadowBlur=70;ctx.fillStyle=pg;ctx.beginPath();ctx.arc(px,py,R0,0,6.283);ctx.fill();ctx.restore();
  ctx.save();ctx.beginPath();ctx.arc(px,py,R0,0,6.283);ctx.clip();for(i=0;i<9;i++){ctx.fillStyle='rgba(0,0,0,.14)';ctx.beginPath();ctx.arc(px+(r()-.5)*R0*1.5,py+(r()-.5)*R0*1.5,6+r()*R0*.16,0,6.283);ctx.fill()}ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(px,py,R0*1.7,R0*.4,-.35,Math.PI*1.02,Math.PI*1.98);ctx.stroke();ctx.beginPath();ctx.ellipse(px,py,R0*1.7,R0*.4,-.35,0,Math.PI);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(x+w*.18,y+h*.22,18,0,6.283);ctx.fill();ctx.fillStyle=hsl(hue+260,65,22);ctx.beginPath();ctx.arc(x+w*.18+8,y+h*.22-5,16,0,6.283);ctx.fill();
  ridge(x,y,w,h*.74,h*.07,hsl(hue+270,55,16),r,40);ridge(x,y,w,h*.84,h*.06,hsl(hue+280,60,10),r,36);ridge(x,y,w,h*.93,h*.04,hsl(hue+290,60,6),r,24)}
 else if(st===1){g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,hsl(hue+220,60,8));g.addColorStop(1,hsl(hue+250,55,22));ctx.fillStyle=g;ctx.fillRect(x,y,w,h);stars(x,y,w,h*.6,r,70);
  for(i=0;i<4;i++){var ag=ctx.createLinearGradient(0,y,0,y+h*.6);ag.addColorStop(0,hsl(hue+90+i*25,95,62,0));ag.addColorStop(.5,hsl(hue+90+i*25,95,62,.55));ag.addColorStop(1,hsl(hue+90+i*25,95,62,0));ctx.fillStyle=ag;ctx.beginPath();ctx.moveTo(x,y+h*.1);for(var t=0;t<=w;t+=16){ctx.lineTo(x+t,y+h*.12+i*34+Math.sin(t/110+i*1.7+hue)*50)}for(var t2=w;t2>=0;t2-=16){ctx.lineTo(x+t2,y+h*.5+i*34+Math.sin(t2/90+i*1.3)*40)}ctx.closePath();ctx.fill()}
  [[.2,.75,.34],[.55,.7,.42],[.85,.78,.3]].forEach(function(m,k){var mx=x+w*m[0],my=y+h*m[1],mw=w*m[2];ctx.fillStyle=hsl(hue+240,45,14+k*3);ctx.beginPath();ctx.moveTo(mx-mw,y+h);ctx.lineTo(mx,my-h*.2);ctx.lineTo(mx+mw,y+h);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.moveTo(mx,my-h*.2);ctx.lineTo(mx-mw*.22,my-h*.2+mw*.28);ctx.lineTo(mx-mw*.07,my-h*.2+mw*.2);ctx.lineTo(mx+mw*.06,my-h*.2+mw*.3);ctx.lineTo(mx+mw*.22,my-h*.2+mw*.28);ctx.closePath();ctx.fill()});
  var lg=ctx.createLinearGradient(0,y+h*.82,0,y+h);lg.addColorStop(0,hsl(hue+120,70,40,.85));lg.addColorStop(1,hsl(hue+200,70,15,.95));ctx.fillStyle=lg;ctx.fillRect(x,y+h*.84,w,h*.2);ctx.fillStyle='rgba(255,255,255,.25)';for(i=0;i<8;i++){ctx.fillRect(x+r()*w,y+h*.86+r()*h*.12,40+r()*80,2)}}
 else if(st===2){g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,hsl(hue+250,70,12));g.addColorStop(.5,hsl(hue+300,80,32));g.addColorStop(1,hsl(hue+340,95,55));ctx.fillStyle=g;ctx.fillRect(x,y,w,h);stars(x,y,w,h*.4,r,50);
  var sx=x+w/2,sy=y+h*.5,sr=h*.3,sg=ctx.createLinearGradient(0,sy-sr,0,sy+sr);sg.addColorStop(0,hsl(hue+50,100,68));sg.addColorStop(1,hsl(hue+330,100,58));ctx.save();ctx.shadowColor=hsl(hue+330,100,60);ctx.shadowBlur=80;ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sx,sy,sr,0,6.283);ctx.fill();ctx.restore();ctx.fillStyle=hsl(hue+300,80,20);for(i=0;i<6;i++){ctx.fillRect(sx-sr,sy+sr*.05+i*sr*.15,sr*2,2+i*2.5)}
  for(var l=0;l<2;l++){var bx=x-10,col=hsl(hue+280,60,l?9:15);while(bx<x+w){var bw=40+r()*70,bh=h*(l?.18:.28)+r()*h*(l?.18:.3);ctx.fillStyle=col;ctx.fillRect(bx,y+h*.9-bh,bw,bh+h);if(!l){ctx.fillStyle=hsl(hue+50,100,70,.85);for(var wy=y+h*.9-bh+10;wy<y+h*.9-6;wy+=18){for(var wx=bx+8;wx<bx+bw-10;wx+=14){if(r()<.35)ctx.fillRect(wx,wy,6,9)}}}bx+=bw+4}}
  ctx.strokeStyle=hsl(hue+320,100,65,.7);ctx.lineWidth=2;for(i=-9;i<=9;i++){ctx.beginPath();ctx.moveTo(sx+i*20,y+h*.9);ctx.lineTo(sx+i*120,y+h);ctx.stroke()}ctx.beginPath();ctx.moveTo(x,y+h*.9);ctx.lineTo(x+w,y+h*.9);ctx.stroke()}
 else{g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,hsl(hue+190,75,70));g.addColorStop(1,hsl(hue+30,90,82));ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
  ctx.save();ctx.shadowColor='#fff';ctx.shadowBlur=60;ctx.fillStyle='rgba(255,255,230,.95)';ctx.beginPath();ctx.arc(x+w*.8,y+h*.2,h*.1,0,6.283);ctx.fill();ctx.restore();
  for(i=0;i<6;i++)cloud(x+r()*w,y+h*(.1+r()*.6),.7+r()*.9,.55+r()*.35);
  [[.25,.62,.32],[.7,.74,.4]].forEach(function(m,k){var ix=x+w*m[0],iy=y+h*m[1],iw=w*m[2]*.5;ctx.fillStyle=hsl(hue+20,50,40);ctx.beginPath();ctx.moveTo(ix-iw,iy);ctx.quadraticCurveTo(ix,iy+iw*1.4,ix+iw,iy);ctx.closePath();ctx.fill();ctx.fillStyle=hsl(hue+110,60,48);rr(ix-iw,iy-14,iw*2,22,11);ctx.fill();for(var t=0;t<4;t++){var tx=ix-iw*.7+t*iw*.45,th=40+r()*40;ctx.fillStyle=hsl(hue+120,55,30);ctx.fillRect(tx-3,iy-14-th*.3,6,th*.3);ctx.fillStyle=hsl(hue+130,60,38+t*2);ctx.beginPath();ctx.moveTo(tx,iy-14-th);ctx.lineTo(tx-20,iy-14-th*.25);ctx.lineTo(tx+20,iy-14-th*.25);ctx.closePath();ctx.fill()}});
  var bx2=x+w*.5,by2=y+h*.38,br=h*.2;var bg=ctx.createLinearGradient(bx2-br,0,bx2+br,0);bg.addColorStop(0,hsl(hue+330,85,58));bg.addColorStop(.5,hsl(hue+40,95,62));bg.addColorStop(1,hsl(hue+330,85,58));ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(bx2-br,by2);ctx.bezierCurveTo(bx2-br,by2-br*1.5,bx2+br,by2-br*1.5,bx2+br,by2);ctx.bezierCurveTo(bx2+br,by2+br*.8,bx2+br*.25,by2+br*1.1,bx2+br*.2,by2+br*1.2);ctx.lineTo(bx2-br*.2,by2+br*1.2);ctx.bezierCurveTo(bx2-br*.25,by2+br*1.1,bx2-br,by2+br*.8,bx2-br,by2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx2,by2-br*1.1);ctx.bezierCurveTo(bx2-br*.5,by2,bx2-br*.3,by2+br,bx2,by2+br*1.2);ctx.moveTo(bx2,by2-br*1.1);ctx.bezierCurveTo(bx2+br*.5,by2,bx2+br*.3,by2+br,bx2,by2+br*1.2);ctx.stroke();ctx.fillStyle=hsl(hue+20,50,30);rr(bx2-18,by2+br*1.35,36,26,5);ctx.fill();ctx.strokeStyle='rgba(60,40,30,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx2-br*.2,by2+br*1.2);ctx.lineTo(bx2-16,by2+br*1.35);ctx.moveTo(bx2+br*.2,by2+br*1.2);ctx.lineTo(bx2+16,by2+br*1.35);ctx.stroke()}
 var ca=ctx.createRadialGradient(x+w/2,y+h*.55,10,x+w/2,y+h*.55,h*.62);ca.addColorStop(0,'rgba(255,255,255,.28)');ca.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=ca;ctx.fillRect(x,y,w,h);anime(x+w/2,y+h*.5,h/560*.96,hue,R((r()*1e9)>>>0));
 ctx.restore();rr(x,y,w,h,40);ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=3;ctx.stroke()}

/* شخصيات أنمي أصلية مرسومة بالكود */
function tri(x1,y1,x2,y2,x3,y3,f){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.closePath();ctx.fillStyle=f;ctx.fill()}
function anime(cx,cy,sc,hue,r){var hh=Math.floor(r()*360),hs=60+r()*35,hl=38+r()*26,skin=['#ffe0cc','#ffd3b8','#f6c7a5','#fbe6d6'][Math.floor(r()*4)],eh=Math.floor(r()*360),ofh=Math.floor(r()*360),style=Math.floor(r()*4),acc=Math.floor(r()*5),mouth=Math.floor(r()*3);
 var H1=hsl(hh,hs,hl),H2=hsl(hh+15,hs,Math.min(80,hl+22)),H0=hsl(hh-10,hs,Math.max(14,hl-18));
 ctx.save();ctx.translate(cx,cy);ctx.scale(sc,sc);
 function hairBack(){var g=ctx.createLinearGradient(0,-200,0,260);g.addColorStop(0,H2);g.addColorStop(.35,H1);g.addColorStop(1,H0);ctx.fillStyle=g;
  if(style===0){ctx.beginPath();ctx.moveTo(-190,40);ctx.bezierCurveTo(-230,-260,230,-260,190,40);ctx.bezierCurveTo(215,140,205,250,130,300);ctx.lineTo(-130,300);ctx.bezierCurveTo(-205,250,-215,140,-190,40);ctx.fill()}
  else if(style===1){ctx.beginPath();ctx.ellipse(0,-30,190,200,0,0,6.283);ctx.fill();[-1,1].forEach(function(d){ctx.save();ctx.translate(d*235,80);ctx.rotate(d*.18);ctx.beginPath();ctx.moveTo(-34,-70);ctx.bezierCurveTo(-60,60,-40,200,0,300);ctx.bezierCurveTo(40,200,60,60,34,-70);ctx.closePath();ctx.fill();ctx.fillStyle=hsl(ofh,85,60);ctx.beginPath();ctx.arc(0,-74,26,0,6.283);ctx.fill();ctx.fillStyle=g;ctx.restore()})}
  else if(style===2){ctx.beginPath();ctx.ellipse(0,-30,190,200,0,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(0,-250,80,0,6.283);ctx.fill();ctx.fillStyle=hsl(ofh,85,62);ctx.beginPath();ctx.ellipse(0,-196,56,16,0,0,6.283);ctx.fill()}
  else{ctx.beginPath();ctx.ellipse(0,-30,188,196,0,0,6.283);ctx.fill();for(var i=0;i<5;i++){var a=-2.5+i*.5;tri(Math.cos(a)*150,Math.sin(a)*160-30,Math.cos(a)*250,Math.sin(a)*270-50,Math.cos(a+.3)*150,Math.sin(a+.3)*160-30,H1)}}}
 hairBack();
 var og=hsl(ofh,70,52),og2=hsl(ofh,70,36);ctx.fillStyle=og;ctx.beginPath();ctx.ellipse(0,330,250,150,0,Math.PI,0);ctx.fill();ctx.fillStyle=og2;ctx.beginPath();ctx.ellipse(0,330,250,150,0,Math.PI,0);ctx.lineTo(0,330);ctx.globalAlpha=.25;ctx.fill();ctx.globalAlpha=1;
 ctx.fillStyle=skin;ctx.fillRect(-34,150,68,80);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-70,196);ctx.lineTo(0,260);ctx.lineTo(70,196);ctx.lineTo(0,176);ctx.closePath();ctx.fill();ctx.fillStyle=hsl(ofh+160,85,55);tri(-24,222,24,222,0,300,hsl(ofh+160,85,55));ctx.beginPath();ctx.arc(0,222,16,0,6.283);ctx.fill();
 ctx.fillStyle=skin;ctx.beginPath();ctx.moveTo(-140,-30);ctx.bezierCurveTo(-150,100,-70,178,0,184);ctx.bezierCurveTo(70,178,150,100,140,-30);ctx.bezierCurveTo(130,-140,-130,-140,-140,-30);ctx.fill();
 ctx.fillStyle='rgba(0,0,0,.06)';ctx.beginPath();ctx.ellipse(0,170,70,12,0,0,6.283);ctx.fill();
 [-1,1].forEach(function(d){var ex=d*68,ey=20;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(ex,ey,44,56,0,0,6.283);ctx.fill();var ig=ctx.createLinearGradient(0,ey-50,0,ey+54);ig.addColorStop(0,hsl(eh,70,26));ig.addColorStop(.55,hsl(eh,85,52));ig.addColorStop(1,hsl(eh+20,90,72));ctx.fillStyle=ig;ctx.beginPath();ctx.ellipse(ex,ey+4,35,48,0,0,6.283);ctx.fill();ctx.fillStyle='#14091f';ctx.beginPath();ctx.ellipse(ex,ey+4,16,26,0,0,6.283);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(ex-12,ey-16,11,13,0,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(ex+14,ey+24,6,0,6.283);ctx.fill();
  ctx.strokeStyle='#1b0f2a';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(ex-d*46,ey-4);ctx.quadraticCurveTo(ex,ey-66,ex+d*46,ey-8);ctx.stroke();ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(ex-d*30,ey-76);ctx.quadraticCurveTo(ex,ey-96,ex+d*34,ey-84);ctx.strokeStyle=H0;ctx.stroke();
  ctx.fillStyle='rgba(255,90,120,.28)';ctx.beginPath();ctx.ellipse(ex+d*8,ey+82,28,15,0,0,6.283);ctx.fill()});
 ctx.fillStyle='rgba(120,60,50,.5)';ctx.beginPath();ctx.arc(0,92,4,0,6.283);ctx.fill();
 ctx.strokeStyle='#8a2f3c';ctx.lineWidth=6;ctx.lineCap='round';
 if(mouth===0){ctx.beginPath();ctx.moveTo(-26,120);ctx.quadraticCurveTo(0,148,26,120);ctx.stroke()}
 else if(mouth===1){ctx.fillStyle='#9a2640';ctx.beginPath();ctx.moveTo(-30,118);ctx.quadraticCurveTo(0,172,30,118);ctx.quadraticCurveTo(0,128,-30,118);ctx.fill();ctx.fillStyle='#ff8fa3';ctx.beginPath();ctx.ellipse(0,142,13,8,0,0,6.283);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(-18,119,36,8)}
 else{ctx.beginPath();ctx.moveTo(-22,124);ctx.quadraticCurveTo(-8,140,0,124);ctx.quadraticCurveTo(8,140,22,124);ctx.stroke()}
 var fg=ctx.createLinearGradient(0,-160,0,-20);fg.addColorStop(0,H2);fg.addColorStop(1,H1);ctx.fillStyle=fg;
 ctx.beginPath();ctx.moveTo(-160,-20);ctx.bezierCurveTo(-190,-170,190,-170,160,-20);ctx.lineTo(150,-20);var n=5+Math.floor(r()*3),w0=300/n;for(var i=0;i<n;i++){var x0=150-i*w0,x1=x0-w0;ctx.lineTo((x0+x1)/2+(r()-.5)*14,-10-r()*60);ctx.lineTo(x1,-86-r()*20)}ctx.lineTo(-150,-20);ctx.closePath();ctx.fill();
 ctx.fillStyle=H1;[-1,1].forEach(function(d){ctx.beginPath();ctx.moveTo(d*150,-60);ctx.bezierCurveTo(d*185,20,d*175,120,d*150,170);ctx.lineTo(d*128,160);ctx.bezierCurveTo(d*150,100,d*154,30,d*128,-50);ctx.closePath();ctx.fill()});
 ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-90,-96);ctx.quadraticCurveTo(-30,-130,30,-110);ctx.stroke();
 if(acc===0){[-1,1].forEach(function(d){tri(d*60,-150,d*150,-140,d*160,-260,H1);tri(d*84,-160,d*140,-150,d*148,-228,'#ffb3c7')})}
 else if(acc===1){ctx.strokeStyle='#2b2f55';ctx.lineWidth=7;[-1,1].forEach(function(d){ctx.beginPath();ctx.ellipse(d*68,22,56,62,0,0,6.283);ctx.stroke()});ctx.beginPath();ctx.moveTo(-14,18);ctx.lineTo(14,18);ctx.stroke()}
 else if(acc===2){ctx.strokeStyle=hsl(ofh+160,90,58);ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(-150,-70);ctx.bezierCurveTo(-100,-170,100,-170,150,-70);ctx.stroke()}
 else if(acc===3){ctx.fillStyle='#ffd84a';for(var q=0;q<10;q++){var a=q*Math.PI/5-Math.PI/2,rr0=q%2?12:28;ctx.lineTo(0,0)}ctx.beginPath();for(var q2=0;q2<10;q2++){var a2=q2*Math.PI/5-Math.PI/2,rd=q2%2?13:30;ctx.lineTo(-110+Math.cos(a2)*rd,-100+Math.sin(a2)*rd)}ctx.closePath();ctx.fill()}
 else{ctx.strokeStyle='#ffe38a';ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(0,-210,100,22,0,0,6.283);ctx.stroke()}
 ctx.restore()}
function grad(t,x,y,fs,hue,maxW){ctx.font='900 '+fs+'px '+F;var w=Math.min(maxW,ctx.measureText(t).width),g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);if(ST===3){ctx.fillStyle='#fff'}else{g.addColorStop(0,hsl(hue+30,95,82));g.addColorStop(1,hsl(hue+110,95,72));ctx.fillStyle=g}ctx.fillText(t,x,y,maxW)}
function strip(x,y,w,h,seed){var r=R(seed),cx=x;ctx.fillStyle='rgba(255,255,255,.75)';while(cx<x+w-4){var bw=2+Math.floor(r()*5);ctx.fillRect(cx,y,bw,h);cx+=bw+2+Math.floor(r()*4)}}
function foot(){ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='600 24px '+F;ctx.fillText('diamond-tv.shop',540,1282)}
var SL={ar:{mu:['الغرابة','الفائدة','الجمال'],nk:['القوة','الذكاء','الحظ'],fu:['الابتكار','التأثير','الحظ']},en:{mu:['Weirdness','Usefulness','Beauty'],nk:['Power','Wit','Luck'],fu:['Innovation','Impact','Luck']}}[AR?'ar':'en'],RA=AR?['عادية','نادرة','ملحمية','أسطورية']:['Common','Rare','Epic','Legendary'];
var FOILS=[['#fff1b0','#f2c14e','#b8862b','#f7e08a'],['#ff7ab8','#ffd36b','#7bf1a8','#6bb8ff'],['#f4f7fb','#aab4c4','#6d7a90','#e9eef6'],['#9bf6e3','#34c8b0','#1d7f8f','#7be0ff'],['#ffc2d1','#f0668a','#a3264f','#ffd1dc']];
function foil(x0,y0,x1,y1,k){var g=ctx.createLinearGradient(x0,y0,x1,y1),f=FOILS[k%5];f.forEach(function(c,i){g.addColorStop(i/(f.length-1),c)});return g}
function crest(cx,cy,R0,k){ctx.beginPath();for(var i=0;i<6;i++){var a=i*Math.PI/3-Math.PI/2;ctx.lineTo(cx+Math.cos(a)*R0,cy+Math.sin(a)*R0)}ctx.closePath();ctx.fillStyle=foil(cx-R0,cy-R0,cx+R0,cy+R0,k);ctx.fill();ctx.fillStyle='#1a1208';ctx.beginPath();for(var j=0;j<10;j++){var b=j*Math.PI/5-Math.PI/2,rr0=j%2?R0*.28:R0*.58;ctx.lineTo(cx+Math.cos(b)*rr0,cy+Math.sin(b)*rr0)}ctx.closePath();ctx.fill()}
function collect(o){var s=o.s,r=R(s^777),hue=o.hue,k=o.k,st=ST;ctx.direction=AR?'rtl':'ltr';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.globalAlpha=1;ctx.setLineDash([]);
 var bgc=ctx.createLinearGradient(0,0,1080,1350);bgc.addColorStop(0,hsl(hue+220,50,8));bgc.addColorStop(1,hsl(hue+260,55,17));ctx.fillStyle=bgc;ctx.fillRect(0,0,1080,1350);
 rr(30,30,1020,1290,64);ctx.fillStyle=foil(0,0,1080,1350,k);ctx.fill();
 rr(54,54,972,1242,46);ctx.fillStyle=hsl(hue+225,48,9);ctx.fill();ctx.save();rr(54,54,972,1242,46);ctx.clip();blob(180,160,700,hue,.4);blob(900,1100,700,hue+90,.35);
 ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=2;for(var d=-1400;d<1400;d+=44){ctx.beginPath();ctx.moveTo(d,0);ctx.lineTo(d+1350,1350);ctx.stroke()}ctx.restore();
 ctx.beginPath();ctx.arc(140,128,50,0,6.283);ctx.fillStyle=foil(90,78,190,178,k);ctx.fill();ctx.fillStyle='#1a1208';ctx.font='900 46px '+F;ctx.textBaseline='middle';ctx.fillText(o.no,140,132);ctx.textBaseline='alphabetic';
 ctx.fillStyle='#fff';ctx.font='800 31px '+F;ctx.fillText(o.title,540,138,640);
 crest(940,128,52,k);
 scene(st,86,206,908,560,hue,r);
 var by=700;ctx.save();ctx.translate(540,by+70);ctx.rotate(-.0208);ctx.translate(-540,-(by+70));ctx.beginPath();ctx.moveTo(52,by);ctx.lineTo(1028,by);ctx.lineTo(1028,by+140);ctx.lineTo(52,by+140);ctx.closePath();ctx.fillStyle=foil(52,by,1028,by+140,k);ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=30;ctx.shadowOffsetY=10;ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(52,by+8,976,5);ctx.fillStyle='#1c1307';ctx.font='900 '+(o.fs||84)+'px '+F;ctx.textBaseline='middle';ctx.fillText(o.name,540,by+74,860);ctx.textBaseline='alphabetic';ctx.restore();
 ctx.fillStyle='rgba(255,255,255,.82)';ctx.font='600 31px '+F;var y=905;(o.lines||[]).forEach(function(l){y=wrap(l,540,y,860,46,2)});
 var xs=[200,540,880];o.stats.forEach(function(v,i){var x=xs[i];ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='700 24px '+F;ctx.fillText(SL[o.mode][i],x,1105);rr(x-120,1124,240,16,8);ctx.fillStyle='rgba(255,255,255,.15)';ctx.fill();rr(x-120,1124,Math.max(16,240*v/100),16,8);ctx.fillStyle=foil(x-120,0,x+120,0,k);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 30px '+F;ctx.fillText(v,x,1182)});
 ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=2;ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(100,1214);ctx.lineTo(980,1214);ctx.stroke();ctx.setLineDash([]);
 ctx.textAlign=AR?'right':'left';ctx.fillStyle='rgba(255,255,255,.65)';ctx.font='700 24px '+F;ctx.direction='ltr';ctx.fillText(o.serial,AR?980:100,1262);ctx.textAlign=AR?'left':'right';ctx.fillText(RA[o.rar],AR?100:980,1262);ctx.textAlign='center';ctx.direction=AR?'rtl':'ltr';ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='600 22px '+F;ctx.fillText('diamond-tv.shop',540,1262);
 ctx.save();rr(30,30,1020,1290,64);ctx.clip();ctx.globalCompositeOperation='screen';var sh=ctx.createLinearGradient(0,150,1080,1200);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.32,'rgba(255,255,255,0)');sh.addColorStop(.45,'rgba(255,200,255,.2)');sh.addColorStop(.52,'rgba(190,255,255,.26)');sh.addColorStop(.6,'rgba(255,255,200,.18)');sh.addColorStop(.72,'rgba(255,255,255,0)');ctx.fillStyle=sh;ctx.fillRect(0,0,1080,1350);for(var q=0;q<26;q++){ctx.fillStyle='rgba(255,255,255,'+(.3+r()*.5)+')';var px=60+r()*960,py=60+r()*1230,sz=2+r()*4;ctx.beginPath();ctx.moveTo(px,py-sz*2);ctx.lineTo(px+sz*.5,py);ctx.lineTo(px,py+sz*2);ctx.lineTo(px-sz*.5,py);ctx.closePath();ctx.fill()}ctx.restore()}
function stats(r){return[55+Math.floor(r()*44),55+Math.floor(r()*44),55+Math.floor(r()*44)]}
function rar(st){var a=(st[0]+st[1]+st[2])/3;return a>88?3:a>78?2:a>68?1:0}
function museum(txt){var s=(H(txt)^Math.imul(SEED,2654435761))>>>0,r=R(s),hue=s%360,name=pick(r,T.pre)+pick(r,T.suf),sl=pick(r,T.sl).replace('{i}',txt),room=pick(r,T.room),yr=pick(r,T.yr),mat=pick(r,T.mat),stt=stats(r),k=s%5;
 collect({s:s,hue:hue,k:k,mode:'mu',no:String(s%99+1),title:T.inv,name:name,fs:96,lines:['« '+txt+' »',room+' · '+yr],stats:stt,rar:rar(stt),serial:'No. '+(1000+s%9000)+' / 9999'});
 $('#mu-out').innerHTML='<b>'+name+'</b> — '+sl}
function nick(n){var d=new Date(),kk=n+'|'+d.getFullYear()+d.getMonth()+d.getDate()+d.getHours(),s=(H(kk)^Math.imul(SEED,2654435761))>>>0,r=R(s),hue=s%360,a=pick(r,T.adj),nn=pick(r,T.noun),nx=new Date(d);nx.setHours(d.getHours()+1,0,0,0);
 var t=AR?nn+' '+a:a+' '+nn,stt=stats(r);
 collect({s:s,hue:hue,k:s%5,mode:'nk',no:String(s%99+1),title:T.nl,name:t,fs:t.length>16?66:84,lines:[T.own.replace('{n}',n),T.tm+' '+('0'+nx.getHours()).slice(-2)+':00'],stats:stt,rar:rar(stt),serial:'No. '+(1000+s%9000)+' / 9999'});
 $('#mu-out').innerHTML='<b>'+t+'</b>'}
function future(n){var s=(H(n)^Math.imul(SEED,2654435761))>>>0,r=R(s),hue=s%360,job=pick(r,TF.job),city=pick(r,TF.city),car=pick(r,TF.car),gift=pick(r,TF.gift),pr=71+Math.floor(r()*28),stt=[pr,55+Math.floor(r()*44),55+Math.floor(r()*44)];
 collect({s:s,hue:hue,k:s%5,mode:'fu',no:'50',title:TF.hd+' · '+TF.yr,name:n,fs:90,lines:[TF.lab[0]+': '+job,TF.lab[1]+': '+city],stats:stt,rar:rar(stt),serial:'ID DH-'+(100000+s%900000)});
 $('#mu-out').innerHTML='<b>'+job+'</b> — '+city+' · '+TF.lab[2]+': '+car+' · '+TF.lab[3]+': '+gift}
function draw(){var v=$('#mu-in').value.trim();({mu:museum,nk:nick,fu:future})[mode](v)}
function go(re){var v=$('#mu-in').value.trim();if(!v){$('#mu-in').focus();return}if(re!==false||!SEED){SEED=1+Math.floor(Math.random()*99999)}ST=SEED%4;draw();$('#mu-res').style.display='block';try{history.replaceState(null,'','?m='+mode+'&i='+encodeURIComponent(v)+'&s='+SEED)}catch(e){}}
function setMode(m){mode=m;[].forEach.call(M.querySelectorAll('.mu-tab'),function(b){b.classList.toggle('on',b.dataset.m===m)});$('#mu-in').placeholder=m==='mu'?pick(R(Date.now()%997),T.ph):T.nm;$('#mu-res').style.display='none'}
[].forEach.call(M.querySelectorAll('.mu-tab'),function(b){b.onclick=function(){setMode(b.dataset.m)}});
$('#mu-go').onclick=function(){go()};var rb=$('#mu-rr');if(rb)rb.onclick=function(){go()};$('#mu-in').onkeydown=function(e){if(e.key==='Enter')go()};
$('#mu-dl').onclick=function(){var a=document.createElement('a');a.download='diamond-hub-'+mode+'.png';a.href=cv.toDataURL('image/png');a.click()};
$('#mu-cp').onclick=function(){var u=location.href;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){$('#mu-cp').textContent='✓'},function(){prompt('',u)})};
$('#mu-sh').onclick=function(){var u=location.href,t=$('#mu-out').textContent;if(navigator.share)navigator.share({title:document.title,text:t,url:u}).catch(function(){});else window.open('https://wa.me/?text='+encodeURIComponent(t+' '+u))};
var q=new URLSearchParams(location.search);setMode(['nk','fu'].indexOf(q.get('m'))>-1?q.get('m'):'mu');if(q.get('i')){$('#mu-in').value=q.get('i');SEED=+q.get('s')||0;go(false)}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if($('#mu-res').style.display==='block')draw()});
})();
