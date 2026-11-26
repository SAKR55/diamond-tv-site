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
var WK=0;
function wp(x,y,w,h){var k=WK;if(k===0)return rr(x,y,w,h,40);ctx.beginPath();
 if(k===1){ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,6.283)}
 else if(k===2){var c=96;ctx.moveTo(x+c,y);ctx.lineTo(x+w-c,y);ctx.lineTo(x+w,y+c);ctx.lineTo(x+w,y+h-c);ctx.lineTo(x+w-c,y+h);ctx.lineTo(x+c,y+h);ctx.lineTo(x,y+h-c);ctx.lineTo(x,y+c)}
 else if(k===3){ctx.moveTo(x,y+h);ctx.lineTo(x,y+190);ctx.bezierCurveTo(x,y-40,x+w,y-40,x+w,y+190);ctx.lineTo(x+w,y+h)}
 else{ctx.moveTo(x+70,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w-70,y+h);ctx.lineTo(x,y+h)}
 ctx.closePath()}
function scene(st,x,y,w,h,hue,r){ctx.save();wp(x,y,w,h);ctx.clip();var g,i;
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
 ctx.restore();wp(x,y,w,h);ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=4;ctx.stroke()}

/* شخصيات أنمي أصلية مرسومة بالكود */
function tri(x1,y1,x2,y2,x3,y3,f){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.closePath();ctx.fillStyle=f;ctx.fill()}
function ell(x,y,a,b,f){ctx.fillStyle=f;ctx.beginPath();ctx.ellipse(x,y,a,b,0,0,6.283);ctx.fill()}
function star5(x,y,R0,f){ctx.beginPath();for(var q=0;q<10;q++){var a=q*Math.PI/5-Math.PI/2,rd=q%2?R0*.45:R0;ctx.lineTo(x+Math.cos(a)*rd,y+Math.sin(a)*rd)}ctx.closePath();ctx.fillStyle=f;ctx.fill()}
function anime(cx,cy,sc,hue,r){
 for(var bz=0;bz<6;bz++)r();var P={g:Math.floor(r()*3),hh:Math.floor(r()*360),hs:55+r()*40,hl:30+r()*38,skin:['#ffe3d0','#ffd3b8','#f1bd98','#d9a07a','#b97c58','#8d5a3c','#f9e8dc'][Math.floor(r()*7)],eh:Math.floor(r()*360),oh:Math.floor(r()*360),hair:Math.floor(r()*8),bang:Math.floor(r()*4),eye:Math.floor(r()*5),out:Math.floor(r()*7),mouth:Math.floor(r()*4),a1:Math.floor(r()*11),a2:Math.floor(r()*11),mark:Math.floor(r()*5)};
 if(r()<.4){var nt=[[25,45,18],[30,50,32],[40,70,62],[0,0,14],[15,55,28],[210,30,20]][Math.floor(r()*6)];P.hh=nt[0];P.hs=nt[1];P.hl=nt[2]}
 var M=P.g===1,hh=P.hh,H1=hsl(hh,P.hs,P.hl),H2=hsl(hh+14,P.hs,Math.min(82,P.hl+24)),H0=hsl(hh-10,P.hs,Math.max(12,P.hl-18)),skin=P.skin,skD=hsl(20,35,50,.18);
 if(P.hair===3&&r()<.5)P.hair=6;
 ctx.save();ctx.translate(cx,cy);ctx.scale(sc,sc);
 var fw=M?138:146,chin=M?190:184;
 function hg(){var g=ctx.createLinearGradient(0,-210,0,280);g.addColorStop(0,H2);g.addColorStop(.35,H1);g.addColorStop(1,H0);return g}
 /* خلف الشعر */
 ctx.fillStyle=hg();var hr=P.hair;
 if(hr===0){ctx.beginPath();ctx.moveTo(-195,40);ctx.bezierCurveTo(-235,-260,235,-260,195,40);ctx.bezierCurveTo(220,150,210,260,130,310);ctx.lineTo(-130,310);ctx.bezierCurveTo(-210,260,-220,150,-195,40);ctx.fill()}
 else if(hr===1){ell(0,-30,190,200,ctx.fillStyle);[-1,1].forEach(function(d){ctx.save();ctx.translate(d*240,90);ctx.rotate(d*.2);ctx.fillStyle=hg();ctx.beginPath();ctx.moveTo(-34,-70);ctx.bezierCurveTo(-64,70,-40,200,0,310);ctx.bezierCurveTo(40,200,64,70,34,-70);ctx.closePath();ctx.fill();ell(0,-74,26,26,hsl(P.oh,85,60));ctx.restore()})}
 else if(hr===2){ell(0,-30,190,200,ctx.fillStyle);ell(0,-255,82,82,ctx.fillStyle);ell(0,-196,56,16,hsl(P.oh,85,62))}
 else if(hr===3||hr===6){ell(0,-30,188,196,ctx.fillStyle);for(var i2=0;i2<7;i2++){var a=-2.7+i2*.38;tri(Math.cos(a)*140,Math.sin(a)*150-30,Math.cos(a)*(250+r()*40),Math.sin(a)*(270+r()*30)-50,Math.cos(a+.34)*140,Math.sin(a+.34)*150-30,H1)}}
 else if(hr===4){ctx.beginPath();ctx.moveTo(-200,-20);ctx.bezierCurveTo(-240,-250,240,-250,200,-20);ctx.lineTo(205,150);ctx.quadraticCurveTo(0,200,-205,150);ctx.closePath();ctx.fill()}
 else if(hr===5){ell(0,-30,190,200,ctx.fillStyle);ctx.save();ctx.translate(215,-120);ctx.rotate(.5);ctx.fillStyle=hg();ctx.beginPath();ctx.moveTo(-30,-20);ctx.bezierCurveTo(30,120,80,250,20,340);ctx.bezierCurveTo(-30,240,-60,120,-30,-20);ctx.fill();ell(-4,-14,22,22,hsl(P.oh,85,60));ctx.restore()}
 else{ctx.beginPath();ctx.moveTo(-200,40);ctx.bezierCurveTo(-250,-250,250,-250,200,40);for(var w=0;w<6;w++){ctx.quadraticCurveTo(190-w*70,150+(w%2)*60,170-w*70-60,100+(w%2)*40)}ctx.lineTo(-200,40);ctx.fill()}
 /* الملابس */
 var oc=hsl(P.oh,66,48),oc2=hsl(P.oh,66,34),ocl=hsl(P.oh,60,70);
 if(P.out===1){ctx.fillStyle=oc2;ctx.beginPath();ctx.ellipse(0,170,150,120,0,Math.PI,0);ctx.fill()}
 if(P.out===3){ctx.fillStyle='#8892a6';[-1,1].forEach(function(d){ctx.beginPath();ctx.ellipse(d*185,285,95,60,d*.4,0,6.283);ctx.fill();ctx.fillStyle='#c4cad6';ctx.beginPath();ctx.ellipse(d*185,270,70,34,d*.4,0,6.283);ctx.fill();ctx.fillStyle='#8892a6'})}
 ctx.fillStyle=oc;ctx.beginPath();ctx.ellipse(0,340,255,152,0,Math.PI,0);ctx.fill();ctx.fillStyle='rgba(0,0,0,.14)';ctx.beginPath();ctx.ellipse(0,340,255,152,0,Math.PI,Math.PI*1.5);ctx.lineTo(0,340);ctx.fill();
 ctx.fillStyle=skin;ctx.fillRect(-32,140,64,92);ctx.fillStyle=skD;ctx.fillRect(-32,140,64,26);
 if(P.out===0){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-76,200);ctx.lineTo(0,268);ctx.lineTo(76,200);ctx.lineTo(0,176);ctx.closePath();ctx.fill();tri(-26,224,26,224,0,310,hsl(P.oh+170,85,55));ell(0,224,17,15,hsl(P.oh+170,85,55))}
 else if(P.out===1){ctx.fillStyle=oc2;ctx.beginPath();ctx.moveTo(-90,180);ctx.quadraticCurveTo(0,250,90,180);ctx.lineTo(70,160);ctx.quadraticCurveTo(0,215,-70,160);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=5;[-1,1].forEach(function(d){ctx.beginPath();ctx.moveTo(d*22,222);ctx.lineTo(d*26,300);ctx.stroke()})}
 else if(P.out===2){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-90,190);ctx.lineTo(40,300);ctx.lineTo(70,270);ctx.lineTo(-40,170);ctx.closePath();ctx.fill();ctx.fillStyle=ocl;ctx.beginPath();ctx.moveTo(90,190);ctx.lineTo(-40,300);ctx.lineTo(-70,270);ctx.lineTo(40,170);ctx.closePath();ctx.fill();ctx.fillStyle=hsl(P.oh+180,80,45);ctx.fillRect(-200,300,400,40)}
 else if(P.out===4){ctx.fillStyle=hsl(P.oh+200,70,42);ctx.beginPath();ctx.ellipse(0,205,112,44,0,0,6.283);ctx.fill();ctx.fillStyle=hsl(P.oh+200,70,52);ctx.beginPath();ctx.ellipse(0,190,100,30,0,0,6.283);ctx.fill();ctx.fillStyle=hsl(P.oh+200,70,36);ctx.fillRect(40,205,36,110)}
 else if(P.out===5){ctx.strokeStyle='#e8eef9';ctx.lineWidth=22;ctx.beginPath();ctx.ellipse(0,200,96,32,0,0,6.283);ctx.stroke();ell(-110,300,22,22,'#ffd23a');ell(110,300,22,22,'#35d49a')}
 else{ctx.fillStyle='#fff';ctx.fillRect(-14,200,28,150);ctx.fillStyle=ocl;ctx.beginPath();ctx.moveTo(-70,180);ctx.lineTo(-14,236);ctx.lineTo(-14,180);ctx.fill();ctx.beginPath();ctx.moveTo(70,180);ctx.lineTo(14,236);ctx.lineTo(14,180);ctx.fill()}
 /* الوجه */
 ctx.fillStyle=skin;ctx.beginPath();ctx.moveTo(-fw,-30);ctx.bezierCurveTo(-fw-8,100,-70,chin-6,0,chin);ctx.bezierCurveTo(70,chin-6,fw+8,100,fw,-30);ctx.bezierCurveTo(fw-10,-140,-fw+10,-140,-fw,-30);ctx.fill();
 if(M){ctx.fillStyle='rgba(0,0,0,.05)';ctx.fillRect(-fw,70,fw*2,10)}
 /* العيون */
 var ey=18,sx=M?64:68,E=P.eye;
 [-1,1].forEach(function(d){var ex=d*sx;
  if(E===3){ctx.strokeStyle='#1b0f2a';ctx.lineWidth=11;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(ex-38,ey+14);ctx.quadraticCurveTo(ex,ey-32,ex+38,ey+14);ctx.stroke()}
  else{var rx=E===1?42:44,ry=E===1?40:E===2?42:56;ctx.save();if(E===1){ctx.translate(ex,ey);ctx.rotate(d*-.1);ctx.translate(-ex,-ey)}
   ell(ex,ey,rx,ry,'#fff');var ig=ctx.createLinearGradient(0,ey-ry,0,ey+ry);ig.addColorStop(0,hsl(P.eh,70,24));ig.addColorStop(.55,hsl(P.eh,88,52));ig.addColorStop(1,hsl(P.eh+20,92,74));ctx.fillStyle=ig;ctx.beginPath();ctx.ellipse(ex,ey+4,rx-8,ry-8,0,0,6.283);ctx.fill();
   if(E===4){star5(ex,ey+4,24,'#14091f')}else ell(ex,ey+4,16,E===1?20:26,'#14091f');
   ell(ex-12,ey-14,11,13,'#fff');ell(ex+14,ey+ry*.45,6,6,'#fff');
   if(E===2){ctx.fillStyle=skin;ctx.fillRect(ex-rx-4,ey-ry-4,rx*2+8,ry*.85)}
   ctx.strokeStyle='#1b0f2a';ctx.lineWidth=M?8:10;ctx.lineCap='round';ctx.beginPath();if(E===2){ctx.moveTo(ex-rx,ey-ry*.15);ctx.lineTo(ex+rx,ey-ry*.15)}else{ctx.moveTo(ex-d*rx-d*2,ey-2);ctx.quadraticCurveTo(ex,ey-ry-10,ex+d*rx,ey-8)}ctx.stroke();ctx.restore()}
  ctx.lineWidth=M?9:5;ctx.strokeStyle=H0;ctx.lineCap='round';ctx.beginPath();var by=ey-ry0(E)-24;ctx.moveTo(ex-d*32,by+(M?-6:4));ctx.quadraticCurveTo(ex,by-(M?10:20),ex+d*36,by+(M?8:-4));ctx.stroke();
  if(!M||P.mouth===1)ell(ex+d*10,ey+82,26,14,'rgba(255,90,120,.26)')});
 function ry0(e){return e===1?40:e===2?42:56}
 ctx.fillStyle='rgba(120,60,50,.5)';ctx.beginPath();ctx.arc(0,92,4,0,6.283);ctx.fill();
 ctx.strokeStyle='#8a2f3c';ctx.lineWidth=6;ctx.lineCap='round';var Mo=P.mouth;
 if(Mo===0){ctx.beginPath();ctx.moveTo(-26,122);ctx.quadraticCurveTo(0,150,26,122);ctx.stroke()}
 else if(Mo===1){ctx.fillStyle='#9a2640';ctx.beginPath();ctx.moveTo(-30,118);ctx.quadraticCurveTo(0,176,30,118);ctx.quadraticCurveTo(0,128,-30,118);ctx.fill();ell(0,144,13,8,'#ff8fa3');ctx.fillStyle='#fff';ctx.fillRect(-18,119,36,8)}
 else if(Mo===2){ctx.beginPath();ctx.moveTo(-22,126);ctx.quadraticCurveTo(-8,142,0,126);ctx.quadraticCurveTo(8,142,22,126);ctx.stroke()}
 else{ctx.beginPath();ctx.moveTo(-20,128);ctx.lineTo(24,122);ctx.stroke();tri(14,122,28,122,22,136,'#fff')}
 if(P.mark===0){ctx.fillStyle='rgba(150,80,60,.5)';[[-80,70],[-60,80],[-96,84],[80,70],[60,80],[96,84]].forEach(function(f){ell(f[0],f[1],3,3,ctx.fillStyle)})}
 else if(P.mark===1){ctx.strokeStyle='#f2f2ff';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(96,60);ctx.lineTo(120,100);ctx.stroke();ctx.beginPath();ctx.moveTo(116,56);ctx.lineTo(92,98);ctx.stroke()}
 else if(P.mark===2){star5(-100,96,14,'#ffd84a')}
 else if(P.mark===3){ctx.strokeStyle='#c0392b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-106,-6);ctx.lineTo(-62,72);ctx.stroke()}
 /* الغرّة */
 var fg=ctx.createLinearGradient(0,-170,0,-10);fg.addColorStop(0,H2);fg.addColorStop(1,H1);ctx.fillStyle=fg;var B=P.bang;
 ctx.beginPath();ctx.moveTo(-fw-12,-20);ctx.bezierCurveTo(-fw-40,-170,fw+40,-170,fw+12,-20);ctx.lineTo(fw+2,-14);
 if(B===0){ctx.quadraticCurveTo(70,-120,6,-24);ctx.quadraticCurveTo(-20,-110,-70,-100);ctx.quadraticCurveTo(-120,-80,-fw-2,-14)}
 else if(B===1){ctx.lineTo(fw,-62);ctx.lineTo(-fw,-62)}
 else if(B===2){var n=6,w0=(fw*2+4)/n;for(var k=0;k<n;k++){var x0=fw+2-k*w0,x1=x0-w0;ctx.lineTo((x0+x1)/2+(r()-.5)*18,-4-r()*60);ctx.lineTo(x1,-92-r()*22)}}
 else{ctx.quadraticCurveTo(80,-120,-20,-60);ctx.quadraticCurveTo(-70,-100,-fw,-120)}
 ctx.closePath();ctx.fill();
 ctx.fillStyle=H1;[-1,1].forEach(function(d){if(hr===4||hr===1||hr===0||hr===7||hr===2||hr===5){ctx.beginPath();ctx.moveTo(d*(fw+6),-60);ctx.bezierCurveTo(d*(fw+44),20,d*(fw+34),120,d*(fw+8),180);ctx.lineTo(d*(fw-16),166);ctx.bezierCurveTo(d*(fw+6),100,d*(fw+10),30,d*(fw-20),-50);ctx.closePath();ctx.fill()}});
 ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-96,-100);ctx.quadraticCurveTo(-30,-134,34,-112);ctx.stroke();
 if(hr===6||hr===3){ctx.strokeStyle=H1;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(0,-150);ctx.quadraticCurveTo(-30,-230,10,-250);ctx.stroke()}
 /* الإكسسوارات */
 function acc(a){
  if(a===0){[-1,1].forEach(function(d){tri(d*60,-150,d*150,-140,d*162,-262,H1);tri(d*86,-160,d*142,-150,d*150,-230,'#ffb3c7')})}
  else if(a===1){ctx.strokeStyle='#2b2f55';ctx.lineWidth=7;[-1,1].forEach(function(d){ctx.beginPath();ctx.ellipse(d*sx,ey+2,56,62,0,0,6.283);ctx.stroke()});ctx.beginPath();ctx.moveTo(-12,ey-2);ctx.lineTo(12,ey-2);ctx.stroke()}
  else if(a===2){ctx.strokeStyle=hsl(P.oh+160,90,58);ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(-fw-8,-60);ctx.bezierCurveTo(-100,-160,100,-160,fw+8,-60);ctx.stroke()}
  else if(a===3){star5(-112,-100,30,'#ffd84a')}
  else if(a===4){ctx.strokeStyle='#ffe38a';ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(0,-215,100,22,0,0,6.283);ctx.stroke()}
  else if(a===5){ctx.strokeStyle='#2a2d3f';ctx.lineWidth=16;ctx.beginPath();ctx.arc(0,-20,fw+20,Math.PI*1.02,Math.PI*1.98);ctx.stroke();[-1,1].forEach(function(d){ctx.fillStyle='#e94e77';ctx.beginPath();ctx.ellipse(d*(fw+24),-10,26,44,0,0,6.283);ctx.fill();ctx.fillStyle='#2a2d3f';ctx.beginPath();ctx.ellipse(d*(fw+30),-10,14,32,0,0,6.283);ctx.fill()})}
  else if(a===6){ctx.fillStyle='#1e2233';ctx.beginPath();ctx.ellipse(-sx,ey,52,58,0,0,6.283);ctx.fill();ctx.strokeStyle='#1e2233';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-sx-50,ey-30);ctx.lineTo(sx+50,ey-60);ctx.stroke()}
  else if(a===7){var fc=hsl(P.oh+90,90,70);for(var q=0;q<5;q++){var an=q*1.2566;ell(-118+Math.cos(an)*20,-118+Math.sin(an)*20,13,13,fc)}ell(-118,-118,10,10,'#ffd84a')}
  else if(a===8){[-1,1].forEach(function(d){tri(d*70,-160,d*118,-150,d*104,-250,'#f4f0e6')})}
  else if(a===9){ctx.fillStyle='#fff';ctx.fillRect(70,60,50,34);ctx.strokeStyle='#d96b6b';ctx.lineWidth=3;ctx.strokeRect(70,60,50,34);ctx.beginPath();ctx.moveTo(95,60);ctx.lineTo(95,94);ctx.moveTo(70,77);ctx.lineTo(120,77);ctx.stroke()}
  else{[-1,1].forEach(function(d){ell(d*(fw-4),66,10,10,'#ffd84a');ctx.strokeStyle='#ffd84a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(d*(fw-4),76);ctx.lineTo(d*(fw-4),96);ctx.stroke()})}}
 acc(P.a1);if(P.a2!==P.a1&&r()<.55)acc(P.a2);
 ctx.restore()}
function grad(t,x,y,fs,hue,maxW){ctx.font='900 '+fs+'px '+F;var w=Math.min(maxW,ctx.measureText(t).width),g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);if(ST===3){ctx.fillStyle='#fff'}else{g.addColorStop(0,hsl(hue+30,95,82));g.addColorStop(1,hsl(hue+110,95,72));ctx.fillStyle=g}ctx.fillText(t,x,y,maxW)}
function strip(x,y,w,h,seed){var r=R(seed),cx=x;ctx.fillStyle='rgba(255,255,255,.75)';while(cx<x+w-4){var bw=2+Math.floor(r()*5);ctx.fillRect(cx,y,bw,h);cx+=bw+2+Math.floor(r()*4)}}
function foot(){ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='600 24px '+F;ctx.fillText('diamond-tv.shop',540,1282)}
var SITE='https://diamond-tv.shop/tools/museum-of-unmade/',CT=function(){var e=document.getElementById('mu-ct');return e?e.value.trim().slice(0,40):''};
var SL={ar:{mu:['الغرابة','الفائدة','الجمال'],nk:['القوة','الذكاء','الحظ'],fu:['الابتكار','التأثير','الحظ'],pc:['الإبداع','الطاقة','الكاريزما']},en:{mu:['Weirdness','Usefulness','Beauty'],nk:['Power','Wit','Luck'],fu:['Innovation','Impact','Luck'],pc:['Creativity','Energy','Charisma']}}[AR?'ar':'en'],RA=AR?['عادية','نادرة','ملحمية','أسطورية']:['Common','Rare','Epic','Legendary'];
var FOILS=[['#fff1b0','#f2c14e','#b8862b','#f7e08a'],['#ff7ab8','#ffd36b','#7bf1a8','#6bb8ff'],['#f4f7fb','#aab4c4','#6d7a90','#e9eef6'],['#9bf6e3','#34c8b0','#1d7f8f','#7be0ff'],['#ffc2d1','#f0668a','#a3264f','#ffd1dc']];
function foil(x0,y0,x1,y1,k){var g=ctx.createLinearGradient(x0,y0,x1,y1),f=FOILS[k%5];f.forEach(function(c,i){g.addColorStop(i/(f.length-1),c)});return g}
function crest(cx,cy,R0,k){ctx.beginPath();for(var i=0;i<6;i++){var a=i*Math.PI/3-Math.PI/2;ctx.lineTo(cx+Math.cos(a)*R0,cy+Math.sin(a)*R0)}ctx.closePath();ctx.fillStyle=foil(cx-R0,cy-R0,cx+R0,cy+R0,k);ctx.fill();ctx.fillStyle='#1a1208';ctx.beginPath();for(var j=0;j<10;j++){var b=j*Math.PI/5-Math.PI/2,rr0=j%2?R0*.28:R0*.58;ctx.lineTo(cx+Math.cos(b)*rr0,cy+Math.sin(b)*rr0)}ctx.closePath();ctx.fill()}

function qrTile(data,x,y,Q){rr(x,y,Q,Q,16);ctx.fillStyle='#fff';ctx.fill();var m;try{m=QR.make(data,'M')}catch(e){try{m=QR.make(data,'L')}catch(e2){return}}var n=m.length,pad=Math.round(Q*.07),cs=(Q-pad*2)/n;ctx.fillStyle='#10131f';for(var r2=0;r2<n;r2++)for(var c2=0;c2<n;c2++)if(m[r2][c2])ctx.fillRect(x+pad+c2*cs,y+pad+r2*cs,Math.ceil(cs),Math.ceil(cs))}
function qrRow(list,id){var n=list.length,gap=24,Q=n===1?164:n===2?236:n===3?226:Math.floor((880-3*gap)/4),tw=n*Q+(n-1)*gap,x0=540-tw/2,y0=n===1?1052:1010;ctx.textAlign='center';
 if(id){var cy0=n===1?1004:962;rr(540-170,cy0,340,40,20);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#fff';ctx.font='800 24px '+F;ctx.direction='ltr';ctx.textBaseline='middle';ctx.fillText('ID  '+id,540,cy0+22);ctx.textBaseline='alphabetic'}
 list.forEach(function(it,i){var x=x0+i*(Q+gap);qrTile(it.data,x,y0,Q);ctx.fillStyle='#fff';ctx.font='800 24px '+F;ctx.direction='rtl';if(n===1){ctx.fillText(AR?'بيانات التواصل':'Contact info',x+Q/2,y0+Q+30,Q+120);ctx.direction='ltr';ctx.fillStyle='rgba(255,255,255,.85)';ctx.font='800 22px '+F;ctx.fillText('Scan',x+Q/2,y0+Q+58,Q)}else{ctx.fillText(it.ic+' '+it.name,x+Q/2,y0+Q+32,Q);ctx.fillStyle='rgba(255,255,255,.8)';ctx.font='700 22px '+F;ctx.fillText('سكان · Scan',x+Q/2,y0+Q+62,Q)}});ctx.direction=AR?'rtl':'ltr'}
var CV=0;
function cp(x,y,w,h,r,d){var v=CV,x2=x+w,y2=y+h,c;ctx.beginPath();
 if(v===1){c=96-d;ctx.moveTo(x,y+c);ctx.lineTo(x+c,y);ctx.lineTo(x2-r,y);ctx.arcTo(x2,y,x2,y+r,r);ctx.lineTo(x2,y2-c);ctx.lineTo(x2-c,y2);ctx.lineTo(x+r,y2);ctx.arcTo(x,y2,x,y2-r,r);ctx.closePath();return}
 if(v===2){c=64-d*.6;ctx.moveTo(x+c,y);ctx.lineTo(x2-c,y);ctx.lineTo(x2,y+c);ctx.lineTo(x2,y2-c);ctx.lineTo(x2-c,y2);ctx.lineTo(x+c,y2);ctx.lineTo(x,y2-c);ctx.lineTo(x,y+c);ctx.closePath();return}
 if(v===3){var ny=905,nr=40-d*.4;ctx.moveTo(x+r,y);ctx.arcTo(x2,y,x2,y+r,r);ctx.lineTo(x2,ny-nr);ctx.arc(x2,ny,nr,-Math.PI/2,Math.PI/2,true);ctx.lineTo(x2,y2-r);ctx.arcTo(x2,y2,x2-r,y2,r);ctx.lineTo(x+r,y2);ctx.arcTo(x,y2,x,y2-r,r);ctx.lineTo(x,ny+nr);ctx.arc(x,ny,nr,Math.PI/2,-Math.PI/2,true);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();return}
 if(v===4){var big=150-d*.6,sm=22-d*.3;ctx.moveTo(x+big,y);ctx.lineTo(x2-sm,y);ctx.arcTo(x2,y,x2,y+sm,sm);ctx.lineTo(x2,y2-big);ctx.arcTo(x2,y2,x2-big,y2,big);ctx.lineTo(x+sm,y2);ctx.arcTo(x,y2,x,y2-sm,sm);ctx.lineTo(x,y+big);ctx.arcTo(x,y,x+big,y,big);ctx.closePath();return}
 rr(x,y,w,h,r)}
function collect(o){var s=o.s,r=R(s^777),hue=o.hue,k=o.k,st=ST;WK=(s>>5)%5;CV=(s>>9)%5;ctx.direction=AR?'rtl':'ltr';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.globalAlpha=1;ctx.setLineDash([]);
 var bgc=ctx.createLinearGradient(0,0,1080,1350);bgc.addColorStop(0,hsl(hue+220,50,8));bgc.addColorStop(1,hsl(hue+260,55,17));ctx.fillStyle=bgc;ctx.fillRect(0,0,1080,1350);
 cp(30,30,1020,1290,64,0);ctx.fillStyle=foil(0,0,1080,1350,k);ctx.fill();
 cp(54,54,972,1242,46,24);ctx.fillStyle=hsl(hue+225,48,9);ctx.fill();ctx.save();cp(54,54,972,1242,46,24);ctx.clip();blob(180,160,700,hue,.4);blob(900,1100,700,hue+90,.35);
 ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=2;for(var d=-1400;d<1400;d+=44){ctx.beginPath();ctx.moveTo(d,0);ctx.lineTo(d+1350,1350);ctx.stroke()}ctx.restore();
 ctx.beginPath();ctx.arc(140,128,50,0,6.283);ctx.fillStyle=foil(90,78,190,178,k);ctx.fill();ctx.fillStyle='#1a1208';ctx.font='900 46px '+F;ctx.textBaseline='middle';ctx.fillText(o.no,140,132);ctx.textBaseline='alphabetic';
 ctx.fillStyle='#fff';ctx.font='800 31px '+F;ctx.fillText(o.title,540,138,640);
 crest(940,128,52,k);
 (o.art?o.art(86,206,908,560,hue,r):scene(st,86,206,908,560,hue,r));
 var by=700;ctx.save();ctx.translate(540,by+70);ctx.rotate([-.0208,.0208,0][(o.s>>3)%3]);ctx.translate(-540,-(by+70));ctx.beginPath();ctx.moveTo(52,by);ctx.lineTo(1028,by);ctx.lineTo(1028,by+140);ctx.lineTo(52,by+140);ctx.closePath();ctx.fillStyle=foil(52,by,1028,by+140,k);ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=30;ctx.shadowOffsetY=10;ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(52,by+8,976,5);ctx.fillStyle='#1c1307';ctx.font='900 '+(o.fs||84)+'px '+F;ctx.textBaseline='middle';ctx.fillText(o.name,540,by+74,860);ctx.textBaseline='alphabetic';ctx.restore();
 ctx.fillStyle='rgba(255,255,255,.82)';ctx.font='600 31px '+F;var y=905;(o.lines||[]).forEach(function(l){y=wrap(l,540,y,860,46,2)});
 if(o.qrs&&o.stats){var xs0=[200,540,880];o.stats.forEach(function(v,i){var x=xs0[i];ctx.fillStyle='rgba(255,255,255,.78)';ctx.font='700 22px '+F;ctx.fillText(SL[o.mode][i],x,944);rr(x-120,956,240,12,6);ctx.fillStyle='rgba(255,255,255,.15)';ctx.fill();rr(x-120,956,Math.max(12,240*v/100),12,6);ctx.fillStyle=foil(x-120,0,x+120,0,k);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 26px '+F;ctx.fillText(v,x,992)})}
 if(!o.qrs){
 var xs=[200,540,880];o.stats.forEach(function(v,i){var x=xs[i];ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='700 23px '+F;ctx.fillText(SL[o.mode][i],x,1004);rr(x-120,1018,240,14,7);ctx.fillStyle='rgba(255,255,255,.15)';ctx.fill();rr(x-120,1018,Math.max(14,240*v/100),14,7);ctx.fillStyle=foil(x-120,0,x+120,0,k);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 28px '+F;ctx.fillText(v,x,1070)});
 ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=2;ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(100,1100);ctx.lineTo(980,1100);ctx.stroke();ctx.setLineDash([]);

 }
 if(o.qrs){qrRow(o.qrs,o.id)}else{
 var qx=AR?100:830,qy=1122,QS=150;rr(qx,qy,QS,QS,16);ctx.fillStyle='#fff';ctx.fill();
 try{var M2=o.qr?o.qr():(window.QR&&QR.make(SITE,'M'));if(M2){var n2=M2.length,cs=(QS-20)/n2;ctx.fillStyle='#10131f';for(var qr=0;qr<n2;qr++)for(var qc=0;qc<n2;qc++)if(M2[qr][qc])ctx.fillRect(qx+10+qc*cs,qy+10+qr*cs,Math.ceil(cs),Math.ceil(cs))}}catch(e){}
 var tx=AR?980:100,ta=AR?'right':'left',ct=(CT()||'sales@diamond-tv.shop');ctx.textAlign=ta;ctx.direction=AR?'rtl':'ltr';
 if(o.cl){ctx.fillStyle='#fff';ctx.font='700 27px '+F;o.cl.slice(0,3).forEach(function(l,i){ctx.fillText(l,tx,1166+i*42,640)});}
 else{ctx.fillStyle='#fff';ctx.font='900 32px '+F;ctx.fillText('DIAMOND HUB',tx,1166);
 ctx.fillStyle='rgba(255,255,255,.85)';ctx.font='700 26px '+F;ctx.fillText('🌐 diamond-tv.shop',tx,1208,640);
 ctx.font='700 26px '+F;ctx.fillText((/^[\d+\s-]{7,}$/.test(ct)?'📞 ':/^@/.test(ct)?'📸 ':/@/.test(ct)?'✉️ ':'💬 ')+'\u202A'+ct+'\u202C',tx,1250,640)}
 ctx.direction='ltr';ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='700 21px '+F;ctx.fillText(o.serial+'  ·  '+RA[o.rar],tx,1286,640);
 }ctx.textAlign='center';ctx.direction=AR?'rtl':'ltr';
 ctx.save();cp(30,30,1020,1290,64,0);ctx.clip();ctx.globalCompositeOperation='screen';var sh=ctx.createLinearGradient(0,150,1080,1200);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.32,'rgba(255,255,255,0)');sh.addColorStop(.45,'rgba(255,200,255,.2)');sh.addColorStop(.52,'rgba(190,255,255,.26)');sh.addColorStop(.6,'rgba(255,255,200,.18)');sh.addColorStop(.72,'rgba(255,255,255,0)');ctx.fillStyle=sh;ctx.fillRect(0,0,1080,1350);for(var q=0;q<26;q++){ctx.fillStyle='rgba(255,255,255,'+(.3+r()*.5)+')';var px=60+r()*960,py=60+r()*1230,sz=2+r()*4;ctx.beginPath();ctx.moveTo(px,py-sz*2);ctx.lineTo(px+sz*.5,py);ctx.lineTo(px,py+sz*2);ctx.lineTo(px-sz*.5,py);ctx.closePath();ctx.fill()}ctx.restore()}
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

var PH=null;

var AIC=null,AIST=0,LOC='/assets/ai/',MODEL=LOC+'face_paint_512_v2_0.onnx',MODEL_X='https://huggingface.co/akhaliq/AnimeGANv2-ONNX/resolve/main/face_paint_512_v2_0.onnx',ORT=LOC+'ort.min.js',ORT_X='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.1/dist/ort.min.js',SESS=null,AIX=0;
function ldS(u){return new Promise(function(res,rej){if(window.ort)return res();var e=document.createElement('script');e.src=u;e.onload=res;e.onerror=rej;document.head.appendChild(e)})}
async function aiLoad(){
 try{await ldS(ORT);ort.env.wasm.wasmPaths=LOC;ort.env.wasm.numThreads=1;if(!SESS)SESS=await ort.InferenceSession.create(MODEL,{executionProviders:['wasm']});return}catch(e){}
 SESS=null;window.ort=null;var old=document.querySelector('script[src="'+ORT+'"]');if(old)old.remove();
 await ldS(ORT_X);ort.env.wasm.numThreads=1;SESS=await ort.InferenceSession.create(MODEL_X,{executionProviders:['wasm']})}
function aiMsg(t){var e=$('#pc-st');if(e)e.textContent=t}
async function aiAnime(img){if(!SESS)await aiLoad();
 var S0=512,c=document.createElement('canvas');c.width=c.height=S0;var x=c.getContext('2d'),m=Math.min(img.width,img.height),sx=(img.width-m)/2,sy=(img.height-m)*.12;x.drawImage(img,sx,sy,m,m,0,0,S0,S0);var d=x.getImageData(0,0,S0,S0).data,N=S0*S0,nchw=new Float32Array(3*N),nhwc=new Float32Array(3*N),i;
 for(i=0;i<N;i++){for(var ch=0;ch<3;ch++){var v=d[i*4+ch]/127.5-1;nchw[ch*N+i]=v;nhwc[i*3+ch]=v}}
 var out,name=SESS.inputNames[0],layout='nchw';
 try{out=await SESS.run({[name]:new ort.Tensor('float32',nchw,[1,3,S0,S0])})}catch(e){layout='nhwc';out=await SESS.run({[name]:new ort.Tensor('float32',nhwc,[1,S0,S0,3])})}
 var t=out[SESS.outputNames[0]],dm=t.dims,o=t.data,isC=dm[1]===3,oc=document.createElement('canvas');oc.width=oc.height=S0;var ox=oc.getContext('2d'),im=ox.createImageData(S0,S0);
 for(i=0;i<N;i++){for(var k=0;k<3;k++){var val=isC?o[k*N+i]:o[i*3+k];im.data[i*4+k]=Math.max(0,Math.min(255,(val+1)*127.5))}im.data[i*4+3]=255}
 ox.putImageData(im,0,0);
 var fc=document.createElement('canvas');fc.width=fc.height=1024;var fx=fc.getContext('2d');fx.imageSmoothingEnabled=true;fx.imageSmoothingQuality='high';fx.filter='saturate(1.3) contrast(1.1) brightness(1.03)';fx.drawImage(oc,0,0,1024,1024);fx.filter='none';
 var W=1024,id2=fx.getImageData(0,0,W,W),D=id2.data,cp=new Uint8ClampedArray(D),j,q,c3,L=new Float32Array(W*W);
 for(j=0;j<W*W;j++)L[j]=.299*cp[j*4]+.587*cp[j*4+1]+.114*cp[j*4+2];
 var st=36;
 for(j=1;j<W-1;j++)for(q=1;q<W-1;q++){var i0=j*W+q,gx=L[i0+1]+2*L[i0+1+W]+2*L[i0+1-W]-L[i0-1]-2*L[i0-1+W]-2*L[i0-1-W],gy=L[i0+W]+2*L[i0+W+1]+2*L[i0+W-1]-L[i0-W]-2*L[i0-W+1]-2*L[i0-W-1],ed=Math.sqrt(gx*gx+gy*gy),p0=i0*4,ln=Math.max(0,Math.min(1,(ed-70)/110));
  for(c3=0;c3<3;c3++){var v=cp[p0+c3],qv=Math.round(v/st)*st;v=v*.45+qv*.55;v=v*(1-ln*.88)+8*ln*.88;D[p0+c3]=v}}
 fx.putImageData(id2,0,0);
 var gl=document.createElement('canvas');gl.width=gl.height=256;var gx2=gl.getContext('2d');gx2.drawImage(fc,0,0,256,256);fx.save();fx.globalCompositeOperation='screen';fx.globalAlpha=.28;fx.filter='blur(10px) saturate(1.4)';fx.drawImage(gl,0,0,W,W);fx.restore();fx.filter='none';
 return fc}
function startAI(){if(AIC||AIST||!PH)return;AIST=1;aiMsg(AR?'⏳ جارٍ تحويل صورتك إلى أنمي بالذكاء الاصطناعي (أول مرة يحمّل النموذج ~9MB)…':'⏳ Converting your photo to anime with AI (first run downloads ~9MB)…');
 aiAnime(PH).then(function(c){AIC=c;AIST=2;aiMsg(AR?'✅ تم التحويل بالذكاء الاصطناعي':'✅ AI anime conversion done');if(mode==='pc')draw()}).catch(function(e){AIST=3;aiMsg(AR?'تعذّر تشغيل نموذج الأنمي، استُخدم التأثير الكرتوني البديل':'Anime AI model unavailable, used the cartoon effect instead')})}
function toon(img,hu){var W2=600,H2=370,c=document.createElement('canvas');c.width=W2;c.height=H2;var x=c.getContext('2d'),sc=Math.max(W2/img.width,H2/img.height),sw=img.width*sc,sh=img.height*sc;try{x.filter='saturate(1.25) contrast(1.08) brightness(1.06)'}catch(e){}x.drawImage(img,(W2-sw)/2,Math.min(0,(H2-sh)*.2),sw,sh);try{x.filter='none'}catch(e){}
 var d=x.getImageData(0,0,W2,H2),p=d.data,N=W2*H2,W1=W2+1,i,y,xx;
 var SR=new Float64Array(W1*(H2+1)),SG=new Float64Array(W1*(H2+1)),SB=new Float64Array(W1*(H2+1)),SL=new Float64Array(W1*(H2+1)),SQ=new Float64Array(W1*(H2+1));
 for(y=0;y<H2;y++){var rs=0,gs=0,bs=0,ls=0,qs=0;for(xx=0;xx<W2;xx++){var k=(y*W2+xx)*4,l=.299*p[k]+.587*p[k+1]+.114*p[k+2];rs+=p[k];gs+=p[k+1];bs+=p[k+2];ls+=l;qs+=l*l;var j=(y+1)*W1+xx+1,u=y*W1+xx+1;SR[j]=SR[u]+rs;SG[j]=SG[u]+gs;SB[j]=SB[u]+bs;SL[j]=SL[u]+ls;SQ[j]=SQ[u]+qs}}
 function box(S,x0,y0,x1,y1){return S[(y1+1)*W1+x1+1]-S[y0*W1+x1+1]-S[(y1+1)*W1+x0]+S[y0*W1+x0]}
 var out=new Uint8ClampedArray(p.length),lum=new Float32Array(N),R2=3;
 for(y=0;y<H2;y++)for(xx=0;xx<W2;xx++){var best=1e18,br=0,bg=0,bb=0,quads=[[-R2,-R2,0,0],[0,-R2,R2,0],[-R2,0,0,R2],[0,0,R2,R2]];
  for(var q=0;q<4;q++){var x0=Math.max(0,xx+quads[q][0]),y0=Math.max(0,yy2(y,quads[q][1])),x1=Math.min(W2-1,xx+quads[q][2]),y1=Math.min(H2-1,y+quads[q][3]);var cnt=(x1-x0+1)*(y1-y0+1),ml=box(SL,x0,y0,x1,y1)/cnt,v=box(SQ,x0,y0,x1,y1)/cnt-ml*ml;if(v<best){best=v;br=box(SR,x0,y0,x1,y1)/cnt;bg=box(SG,x0,y0,x1,y1)/cnt;bb=box(SB,x0,y0,x1,y1)/cnt}}
  var o=(y*W2+xx)*4;out[o]=br;out[o+1]=bg;out[o+2]=bb;out[o+3]=255;lum[y*W2+xx]=.299*br+.587*bg+.114*bb}
 function yy2(y,dy){return y+dy}
 var edge=new Uint8Array(N);for(y=1;y<H2-1;y++)for(xx=1;xx<W2-1;xx++){var k2=y*W2+xx,gx=-lum[k2-W2-1]-2*lum[k2-1]-lum[k2+W2-1]+lum[k2-W2+1]+2*lum[k2+1]+lum[k2+W2+1],gy=-lum[k2-W2-1]-2*lum[k2-W2]-lum[k2-W2+1]+lum[k2+W2-1]+2*lum[k2+W2]+lum[k2+W2+1];edge[k2]=Math.sqrt(gx*gx+gy*gy)>150?1:0}
 var F2=[.78,.9,1,1.06,1.12];
 for(i=0;i<N;i++){var o2=i*4,r0=out[o2],g0=out[o2+1],b0=out[o2+2],l0=lum[i],band=Math.min(4,Math.floor(l0/51)),f=F2[band],gray=l0;r0=gray+(r0-gray)*1.45;g0=gray+(g0-gray)*1.45;b0=gray+(b0-gray)*1.45;
  /* تقسيم الألوان إلى درجات (cel) */
  r0=Math.round(r0*f/28)*28;g0=Math.round(g0*f/28)*28;b0=Math.round(b0*f/28)*28;out[o2]=Math.min(255,r0+6);out[o2+1]=Math.min(255,g0+6);out[o2+2]=Math.min(255,b0+8)}
 for(y=1;y<H2-1;y++)for(xx=1;xx<W2-1;xx++){var k3=y*W2+xx;if(edge[k3]||(edge[k3-1]&&edge[k3+1])||(edge[k3-W2]&&edge[k3+W2])){var o3=k3*4;out[o3]=34;out[o3+1]=20;out[o3+2]=48}}
 d.data.set(out);x.putImageData(d,0,0);
 try{var bl=document.createElement('canvas');bl.width=W2;bl.height=H2;var bx=bl.getContext('2d');bx.filter='blur(10px) brightness(1.25)';bx.drawImage(c,0,0);x.globalCompositeOperation='screen';x.globalAlpha=.32;x.drawImage(bl,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over'}catch(e){}
 return c}
function vcard(o){var L=['BEGIN:VCARD','VERSION:3.0','FN:'+o.n];if(o.job)L.push('TITLE:'+o.job);if(o.ph)L.push('TEL:'+o.ph);if(o.em)L.push('EMAIL:'+o.em);if(o.web)L.push('URL:'+o.web);if(o.ig)L.push('NOTE:Instagram @'+o.ig);L.push('END:VCARD');return L.join('\n')}
function pcard(n){var g=function(i){var e=$('#'+i);return e?e.value.trim():''},job=g('pc-job'),ph=g('pc-ph').replace(/[^\d+]/g,''),ig=g('pc-ig').replace(/^@/,''),em=g('pc-em'),web=g('pc-web');
 if(web&&!/^https?:/i.test(web))web='https://'+web;var s=(H(n+job)^Math.imul(SEED,2654435761))>>>0,r=R(s),hue=s%360,stt=[60+Math.floor(r()*39),60+Math.floor(r()*39),60+Math.floor(r()*39)],tc=null;
 var qrs=[],tries=[];
 function vc(o){var L=['BEGIN:VCARD','VERSION:3.0','FN:'+n];if(o.job&&job)L.push('TITLE:'+job);if(ph){L.push('TEL;TYPE=CELL:'+ph);if(o.wa)L.push('URL;TYPE=WhatsApp:https://wa.me/'+ph.replace(/^\+/,''))}if(em)L.push('EMAIL:'+em);if(web)L.push('URL:'+web);if(ig&&o.ig)L.push('URL;TYPE=Instagram:https://instagram.com/'+ig);L.push('END:VCARD');return L.join('\n')}
 [{job:1,wa:1,ig:1},{job:0,wa:1,ig:1},{job:0,wa:0,ig:1},{job:0,wa:0,ig:0}].forEach(function(o){tries.push(vc(o))});
 var data=tries[tries.length-1];for(var ti=0;ti<tries.length;ti++){try{QR.make(tries[ti],'L');data=tries[ti];break}catch(e){}}
 qrs.push({data:data,ic:'📇',name:AR?'بطاقة الاتصال الكاملة':'Full contact card'});
 var sl=[AR?['الإبداع','الطاقة','الكاريزما']:['Creativity','Energy','Charisma']][0];var SL0=SL.pc=sl;
 var cardArt=function(x,y,w,h,hu,rr0){if(AIC){tc=AIC}else{if(PH&&!tc)tc=toon(PH,hu);startAI()}ctx.save();wp(x,y,w,h);ctx.clip();var gg=ctx.createLinearGradient(x,y,x+w,y+h);gg.addColorStop(0,hsl(hu,80,60));gg.addColorStop(1,hsl(hu+90,80,45));ctx.fillStyle=gg;ctx.fillRect(x,y,w,h);if(tc){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';var sc2=Math.max(w/tc.width,h/tc.height),dw=tc.width*sc2,dh=tc.height*sc2;ctx.drawImage(tc,x+(w-dw)/2,y+Math.min(0,(h-dh)*.2),dw,dh)}
  ctx.globalCompositeOperation='soft-light';ctx.fillStyle=hsl(hu,90,55,.22);ctx.fillRect(x,y,w,h);ctx.globalCompositeOperation='source-over';
  var vg=ctx.createRadialGradient(x+w/2,y+h*.45,h*.4,x+w/2,y+h/2,h*.98);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.32)');ctx.fillStyle=vg;ctx.fillRect(x,y,w,h);
  var sg=ctx.createLinearGradient(x,y,x+w*.6,y+h);sg.addColorStop(0,'rgba(255,255,255,.18)');sg.addColorStop(.35,'rgba(255,255,255,0)');ctx.fillStyle=sg;ctx.fillRect(x,y,w,h);
  for(var q=0;q<10;q++){star5(x+rr0()*w,y+rr0()*h,6+rr0()*12,'rgba(255,255,255,'+(.5+rr0()*.4)+')')}ctx.restore();var kk=s%5;wp(x,y,w,h);ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=22;ctx.stroke();ctx.strokeStyle=foil(x,y,x+w,y+h,kk);ctx.lineWidth=14;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2.5;ctx.stroke();
  ctx.save();wp(x,y,w,h);ctx.clip();wp(x,y,w,h);ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=6;ctx.stroke();ctx.restore();
  [[x+34,y+34],[x+w-34,y+34]].forEach(function(p2){star5(p2[0],p2[1],12,'rgba(255,255,255,.95)')})};
 collect({s:s,hue:hue,k:s%5,mode:'pc',no:String(s%99+1),title:AR?'بطاقة تعريف':'Profile card',name:n,fs:90,lines:[job||(AR?'مرحبًا! هذه بطاقتي':'Hi! This is my card')],stats:stt,rar:rar(stt),serial:'',id:'DH-'+(100000+s%900000),art:cardArt,qrs:qrs});
 $('#mu-out').innerHTML='<b>'+n+'</b>'+(job?' — '+job:'')}
function draw(){var v=$('#mu-in').value.trim();if(mode==='pc'&&!PH){$('#mu-out').textContent=AR?'اختر صورتك أولًا':'Pick your photo first';$('#mu-res').style.display='block';return}({mu:museum,nk:nick,fu:future,pc:pcard})[mode](v)}
function go(re){var v=$('#mu-in').value.trim();if(!v){$('#mu-in').focus();return}if(re!==false||!SEED){SEED=1+Math.floor(Math.random()*99999)}ST=SEED%4;draw();$('#mu-res').style.display='block';try{history.replaceState(null,'','?m='+mode+'&i='+encodeURIComponent(v)+'&s='+SEED)}catch(e){}}
function setMode(m){mode=m;[].forEach.call(M.querySelectorAll('.mu-tab'),function(b){b.classList.toggle('on',b.dataset.m===m)});$('#mu-in').placeholder=m==='mu'?pick(R(Date.now()%997),T.ph):T.nm;$('#mu-res').style.display='none';var f=$('#mu-pc');if(f)f.style.display=m==='pc'?'block':'none';var c=$('#mu-ct');if(c)c.style.display=m==='pc'?'none':'block'}
[].forEach.call(M.querySelectorAll('.mu-tab'),function(b){b.onclick=function(){setMode(b.dataset.m)}});
$('#mu-go').onclick=function(){go()};var rb=$('#mu-rr');if(rb)rb.onclick=function(){go()};$('#mu-in').onkeydown=function(e){if(e.key==='Enter')go()};
$('#mu-dl').onclick=function(){var a=document.createElement('a');a.download='diamond-hub-'+mode+'.png';a.href=cv.toDataURL('image/png');a.click()};
$('#mu-cp').onclick=function(){var u=location.href;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){$('#mu-cp').textContent='✓'},function(){prompt('',u)})};
$('#mu-sh').onclick=function(){var u=location.href,t=$('#mu-out').textContent;if(navigator.share)navigator.share({title:document.title,text:t,url:u}).catch(function(){});else window.open('https://wa.me/?text='+encodeURIComponent(t+' '+u))};
var pf=$('#pc-f');if(pf)pf.onchange=function(){var f=this.files[0];if(!f)return;var im=new Image();im.onload=function(){PH=im;AIC=null;AIST=0;$('#pc-fn').textContent='✓ '+f.name;if($('#mu-in').value.trim()&&mode==='pc')go()};im.src=URL.createObjectURL(f)};
var q=new URLSearchParams(location.search);setMode(['nk','fu','pc'].indexOf(q.get('m'))>-1?q.get('m'):'mu');if(q.get('i')){$('#mu-in').value=q.get('i');SEED=+q.get('s')||0;go(false)}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if($('#mu-res').style.display==='block')draw()});
})();
