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
var F='Cairo,Tahoma,"Segoe UI",sans-serif';
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function hsl(h,s,l,a){return'hsla('+(((h%360)+360)%360)+','+s+'%,'+l+'%,'+(a==null?1:a)+')'}
function frame(hue,r){ctx.direction=AR?'rtl':'ltr';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.globalAlpha=1;
 ctx.fillStyle=hsl(hue+220,45,7);ctx.fillRect(0,0,1080,1350);
 [[200,150,720,hue,.55],[900,420,640,hue+70,.45],[300,1150,760,hue+150,.4]].forEach(function(b){var g=ctx.createRadialGradient(b[0],b[1],0,b[0],b[1],b[2]);g.addColorStop(0,hsl(b[3],85,48,b[4]));g.addColorStop(1,hsl(b[3],85,48,0));ctx.fillStyle=g;ctx.fillRect(0,0,1080,1350)});
 ctx.fillStyle='rgba(255,255,255,.07)';for(var x=40;x<1080;x+=36)for(var y=40;y<1350;y+=36){ctx.fillRect(x,y,2,2)}
 rr(44,44,992,1262,56);ctx.fillStyle='rgba(255,255,255,.055)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=2;ctx.stroke()}
function chip(t,x,y,hue,fs){ctx.font='700 '+(fs||26)+'px '+F;var w=ctx.measureText(t).width+44,h=(fs||26)+26;rr(x-w/2,y-h/2,w,h,h/2);ctx.fillStyle='rgba(255,255,255,.1)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#fff';ctx.textBaseline='middle';ctx.fillText(t,x,y+2);ctx.textBaseline='alphabetic';return w}
function orb(cx,cy,R,hue,r){var g=ctx.createRadialGradient(cx-R*.3,cy-R*.35,R*.1,cx,cy,R);g.addColorStop(0,hsl(hue+40,95,78));g.addColorStop(.55,hsl(hue,85,55));g.addColorStop(1,hsl(hue-30,80,28));
 ctx.save();ctx.shadowColor=hsl(hue,90,55,.7);ctx.shadowBlur=90;ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.fill();ctx.restore();
 for(var i=1;i<=3;i++){ctx.strokeStyle='rgba(255,255,255,'+(.34-i*.08)+')';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(cx,cy,R*(1+i*.22),R*(.34+i*.07),-.45+i*.1,0,6.283);ctx.stroke()}
 ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(cx-R*.32,cy-R*.4,R*.22,R*.12,-.7,0,6.283);ctx.fill();
 for(var k=0;k<14;k++){var a=r()*6.283,d=R*(1.15+r()*.9),sz=2+r()*5;ctx.fillStyle='rgba(255,255,255,'+(.4+r()*.5)+')';ctx.beginPath();ctx.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.8,sz,0,6.283);ctx.fill()}}
function grad(t,x,y,fs,hue,maxW){ctx.font='900 '+fs+'px '+F;var w=Math.min(maxW,ctx.measureText(t).width),g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,hsl(hue+30,95,82));g.addColorStop(1,hsl(hue+110,95,72));ctx.fillStyle=g;ctx.fillText(t,x,y,maxW)}
function strip(x,y,w,h,seed){var r=R(seed),cx=x;ctx.fillStyle='rgba(255,255,255,.75)';while(cx<x+w-4){var bw=2+Math.floor(r()*5);ctx.fillRect(cx,y,bw,h);cx+=bw+2+Math.floor(r()*4)}}
function foot(){ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='600 24px '+F;ctx.fillText('diamond-tv.shop',540,1282)}
function museum(txt){var s=H(txt),r=R(s),hue=s%360,name=pick(r,T.pre)+pick(r,T.suf),sl=pick(r,T.sl).replace('{i}',txt),no=(1000+s%9000).toLocaleString('en-US'),room=pick(r,T.room),yr=pick(r,T.yr),mat=pick(r,T.mat);
 frame(hue,r);chip('🏛  '+T.inv,540,118,hue,26);ctx.fillStyle='rgba(255,255,255,.6)';ctx.font='600 26px '+F;ctx.fillText(room,540,184);
 orb(540,470,150,hue,r);
 ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(120,740,840,2);
 ctx.fillStyle='rgba(255,255,255,.78)';ctx.font='700 40px '+F;var y=wrap('« '+txt+' »',540,805,840,56,3);
 grad(name,540,y+62,108,hue,860);
 ctx.fillStyle='rgba(255,255,255,.72)';ctx.font='500 31px '+F;y=wrap(sl,540,y+128,820,46,3);
 var cy=1120;ctx.setLineDash([10,10]);ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(110,cy-46);ctx.lineTo(970,cy-46);ctx.stroke();ctx.setLineDash([]);
 chip(T.made+': '+mat,300,cy,hue,23);chip(yr,790,cy,hue,23);
 strip(120,cy+44,400,46,s);ctx.textAlign='right';ctx.direction='ltr';ctx.fillStyle='#fff';ctx.font='800 40px '+F;ctx.fillText('#'+no,960,cy+84);ctx.font='500 19px '+F;ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillText(T.ex,960,cy+36);ctx.textAlign='center';ctx.direction=AR?'rtl':'ltr';
 foot();
 $('#mu-out').innerHTML='<b>'+name+'</b> — '+sl}
function nick(n){var d=new Date(),k=n+'|'+d.getFullYear()+d.getMonth()+d.getDate()+d.getHours(),s=H(k),r=R(s),hue=s%360,a=pick(r,T.adj),nn=pick(r,T.noun),nx=new Date(d);nx.setHours(d.getHours()+1,0,0,0);
 var t=AR?nn+' '+a:a+' '+nn,pc=(d.getMinutes()*60+d.getSeconds())/3600;
 frame(hue,r);chip('✦  '+T.nl,540,118,hue,26);orb(540,430,150,hue,r);
 ctx.fillStyle='rgba(255,255,255,.62)';ctx.font='600 32px '+F;ctx.fillText(T.own.replace('{n}',n),540,730);
 ctx.fillStyle='#fff';var parts=t.split(' '),l1=parts.slice(0,Math.ceil(parts.length/2)).join(' '),l2=parts.slice(Math.ceil(parts.length/2)).join(' ');
 if(ctx.measureText(t).width<0)l2='';grad(l1,540,850,118,hue,900);if(l2)grad(l2,540,985,118,hue+40,900);
 var by=1110;rr(160,by,760,14,7);ctx.fillStyle='rgba(255,255,255,.14)';ctx.fill();var g=ctx.createLinearGradient(160,0,920,0);g.addColorStop(0,hsl(hue+30,95,75));g.addColorStop(1,hsl(hue+110,95,65));rr(160,by,Math.max(14,760*pc),14,7);ctx.fillStyle=g;ctx.fill();
 ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='600 26px '+F;ctx.fillText(T.tm+' '+('0'+nx.getHours()).slice(-2)+':00',540,1178);
 foot();$('#mu-out').innerHTML='<b>'+t+'</b>'}
function go(){var v=$('#mu-in').value.trim();if(!v){$('#mu-in').focus();return}(mode==='mu'?museum:nick)(v);$('#mu-res').style.display='block';try{history.replaceState(null,'','?m='+mode+'&i='+encodeURIComponent(v))}catch(e){}}
function setMode(m){mode=m;[].forEach.call(M.querySelectorAll('.mu-tab'),function(b){b.classList.toggle('on',b.dataset.m===m)});$('#mu-in').placeholder=m==='mu'?pick(R(Date.now()%997),T.ph):T.nm;$('#mu-res').style.display='none'}
[].forEach.call(M.querySelectorAll('.mu-tab'),function(b){b.onclick=function(){setMode(b.dataset.m)}});
$('#mu-go').onclick=go;$('#mu-in').onkeydown=function(e){if(e.key==='Enter')go()};
$('#mu-dl').onclick=function(){var a=document.createElement('a');a.download='diamond-hub-'+mode+'.png';a.href=cv.toDataURL('image/png');a.click()};
$('#mu-cp').onclick=function(){var u=location.href;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){$('#mu-cp').textContent='✓'},function(){prompt('',u)})};
$('#mu-sh').onclick=function(){var u=location.href,t=$('#mu-out').textContent;if(navigator.share)navigator.share({title:document.title,text:t,url:u}).catch(function(){});else window.open('https://wa.me/?text='+encodeURIComponent(t+' '+u))};
var q=new URLSearchParams(location.search);setMode(q.get('m')==='nk'?'nk':'mu');if(q.get('i')){$('#mu-in').value=q.get('i');go()}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if($('#mu-res').style.display==='block')go()});
})();
