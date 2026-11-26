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
function frame(hue){var g=ctx.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'hsl('+hue+',55%,14%)');g.addColorStop(1,'hsl('+((hue+50)%360)+',60%,26%)');ctx.fillStyle=g;ctx.fillRect(0,0,1080,1350);
 ctx.strokeStyle='#e8c97a';ctx.lineWidth=6;ctx.strokeRect(46,46,988,1258);ctx.lineWidth=2;ctx.strokeRect(66,66,948,1218);
 var r=R(hue*7);for(var i=0;i<40;i++){ctx.fillStyle='rgba(255,255,255,'+(.05+r()*.25)+')';ctx.beginPath();ctx.arc(90+r()*900,100+r()*1150,1+r()*3,0,6.3);ctx.fill()}ctx.direction=AR?'rtl':'ltr';ctx.textAlign='center'}
var F='Cairo,Tahoma,"Segoe UI",sans-serif';
function art(r,hue){var cx=540,cy=560;for(var i=0;i<7;i++){ctx.fillStyle='hsla('+((hue+i*35)%360)+',80%,'+(55+r()*15)+'%,'+(.18+r()*.3)+')';ctx.beginPath();var rad=70+r()*200,x=cx+(r()-.5)*360,y=cy+(r()-.5)*300;ctx.arc(x,y,rad,0,6.3);ctx.fill()}
 ctx.strokeStyle='#e8c97a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,230,0,6.3);ctx.stroke()}
function museum(txt){var s=H(txt),r=R(s),hue=s%360,name=pick(r,T.pre)+pick(r,T.suf),sl=pick(r,T.sl).replace('{i}',txt),no=(1000+s%9000).toLocaleString('en-US');
 frame(hue);ctx.fillStyle='#e8c97a';ctx.font='700 34px '+F;ctx.fillText(T.inv,540,140);ctx.font='28px '+F;ctx.fillStyle='#cbd5e1';ctx.fillText(pick(r,T.room)+' · '+pick(r,T.yr),540,190);
 art(r,hue);ctx.fillStyle='#fff';ctx.font='900 40px '+F;var yy=wrap('« '+txt+' »',540,900,860,56,3);
 ctx.fillStyle='#e8c97a';ctx.font='900 70px '+F;ctx.fillText(name,540,yy+60);ctx.fillStyle='#e2e8f0';ctx.font='30px '+F;yy=wrap(sl,540,yy+120,840,44,3);
 ctx.fillStyle='#94a3b8';ctx.font='26px '+F;ctx.fillText(T.made+': '+pick(r,T.mat),540,1190);ctx.fillStyle='#e8c97a';ctx.font='700 32px '+F;ctx.fillText(T.ex+' '+no,540,1245);ctx.fillStyle='#64748b';ctx.font='22px '+F;ctx.fillText('diamond-tv.shop',540,1285);
 $('#mu-out').innerHTML='<b>'+name+'</b> — '+sl}
function nick(n){var d=new Date(),k=n+'|'+d.getFullYear()+d.getMonth()+d.getDate()+d.getHours(),s=H(k),r=R(s),hue=s%360,a=pick(r,T.adj),nn=pick(r,T.noun),nx=new Date(d);nx.setHours(d.getHours()+1,0,0,0);
 var t=AR?nn+' '+a:a+' '+nn;frame(hue);ctx.fillStyle='#e8c97a';ctx.font='700 36px '+F;ctx.fillText(T.nl,540,150);art(r,hue);ctx.fillStyle='#cbd5e1';ctx.font='32px '+F;ctx.fillText(T.own.replace('{n}',n),540,860);
 ctx.fillStyle='#fff';ctx.font='900 78px '+F;var y=wrap(t,540,970,880,96,2);ctx.fillStyle='#94a3b8';ctx.font='28px '+F;ctx.fillText(T.tm+' '+('0'+nx.getHours()).slice(-2)+':00',540,y+40);ctx.fillStyle='#64748b';ctx.font='22px '+F;ctx.fillText('diamond-tv.shop',540,1285);
 $('#mu-out').innerHTML='<b>'+t+'</b>'}
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
