/* قوالب Studio: تُولَّد نسبيًا لتناسب أي مقاس */
(function(){
var SD=window.SD;
function sh(k,x,y,w,h,fill,o){return Object.assign({type:'shape',k:k,x:x,y:y,w:w,h:h,fill:fill},o||{})}
function tx(t,x,y,w,fs,col,o){return Object.assign({type:'text',t:t,x:x,y:y,w:w,h:fs*1.4,fs:fs,col:col,ff:'Cairo',fw:'700',ta:'center',lh:1.25},o||{})}
function ic(e,x,y,s,o){return Object.assign({type:'icon',ic:e,x:x,y:y,w:s,h:s},o||{})}
var L={};
// كل تخطيط: (W,H,p) => {bg,els}
L.quote=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'grad',c:[p.c1,p.c2,135]},els:[
 sh('ellipse',-m*.15,-m*.15,m*.55,m*.55,'rgba(255,255,255,.12)'),sh('ellipse',W-m*.35,H-m*.35,m*.6,m*.6,'rgba(255,255,255,.1)'),
 tx('❝',W/2-m*.1,H*.12,m*.2,m*.26,'#ffffff',{ff:'Playfair Display',op:.85}),
 tx('النجاح لا يأتي صدفة، بل هو نتيجة عادات صغيرة تُكرَّر كل يوم.',W*.1,H*.3,W*.8,m*.07,'#ffffff',{lh:1.5,ff:'Almarai'}),
 sh('rect',W/2-m*.06,H*.68,m*.12,m*.008,p.ac),
 tx('— اسم صاحب الاقتباس',W*.2,H*.72,W*.6,m*.035,'#ffffff',{fw:'400',op:.9})]}};
L.sale=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'solid',c:[p.bg]},els:[
 sh('burst',W/2-m*.34,H*.12,m*.68,m*.68,{g:[p.c1,p.c2,135]},{sh:{c:'rgba(0,0,0,.25)',b:30,x:0,y:14}}),
 tx('خصم',W/2-m*.3,H*.2,m*.6,m*.09,'#fff',{ff:'Lalezar'}),tx('50%',W/2-m*.3,H*.28,m*.6,m*.22,'#fff',{ff:'Lalezar'}),
 tx('على كل المنتجات',W*.1,H*.64,W*.8,m*.06,p.tx,{ff:'Tajawal',fw:'700'}),
 sh('round',W/2-m*.2,H*.78,m*.4,m*.09,p.ac,{r:m*.045}),tx('تسوّق الآن',W/2-m*.2,H*.795,m*.4,m*.045,p.bg,{ff:'Cairo'}),
 tx('العرض ساري حتى نفاد الكمية',W*.1,H*.92,W*.8,m*.025,p.tx,{fw:'400',op:.7})]}};
L.announce=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'solid',c:[p.bg]},els:[
 sh('rect',0,0,W*.42,H,{g:[p.c1,p.c2,160]}),sh('ellipse',W*.3,H*.55,m*.5,m*.5,'rgba(255,255,255,.14)'),
 ic('📣',W*.07,H*.35,m*.2),
 tx('إعلان مهم',W*.46,H*.2,W*.5,m*.05,p.ac,{ta:'right',ff:'Tajawal'}),
 tx('اكتب عنوانك الرئيسي هنا بخط عريض واضح',W*.46,H*.28,W*.5,m*.085,p.tx,{ta:'right',lh:1.2,ff:'Cairo',fw:'900'}),
 tx('نص توضيحي قصير يشرح التفاصيل والفائدة بأسلوب مباشر.',W*.46,H*.58,W*.5,m*.035,p.tx,{ta:'right',fw:'400',lh:1.6,op:.85}),
 sh('round',W*.62,H*.8,W*.34,m*.075,p.c1,{r:m*.04}),tx('اعرف المزيد',W*.62,H*.8+m*.012,W*.34,m*.04,'#fff',{})]}};
L.product=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'grad',c:[p.bg,p.bg,180]},els:[
 sh('ellipse',W/2-m*.42,H*.1,m*.84,m*.84,{g:[p.c1,p.c2,135]}),
 sh('round',W/2-m*.27,H*.17,m*.54,m*.54,'rgba(255,255,255,.9)',{r:m*.06,ph:1,name:'مكان صورة المنتج',sh:{c:'rgba(0,0,0,.3)',b:40,x:0,y:20}}),
 tx('📷 ضع صورة المنتج',W/2-m*.2,H*.4,m*.4,m*.035,'#64748b',{fw:'400'}),
 tx('اسم المنتج',W*.1,H*.74,W*.8,m*.075,p.tx,{ff:'Cairo',fw:'900'}),
 tx('وصف مختصر يبرز ميزة المنتج الأساسية',W*.1,H*.83,W*.8,m*.035,p.tx,{fw:'400',op:.8}),
 sh('badge',W-m*.3,H*.04,m*.26,m*.26,p.ac,{rot:12}),tx('199 ر.س',W-m*.3,H*.04+m*.095,m*.26,m*.05,p.bg,{rot:12,ff:'Cairo'})]}};
L.thumb=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'grad',c:['#0f172a',p.c1,120]},els:[
 sh('burst',W*.58,H*.05,H*.9,H*.9,p.ac,{op:.25}),
 sh('round',W*.06,H*.12,W*.38,H*.76,'rgba(255,255,255,.12)',{r:H*.05,ph:1,name:'مكان صورتك'}),tx('📷 صورتك',W*.06,H*.45,W*.38,H*.06,'#fff',{fw:'400',op:.7}),
 tx('عنوان صادم',W*.48,H*.1,W*.48,H*.17,'#fff',{ff:'Lalezar',ta:'right',stroke:'#000',sw:H*.012}),
 tx('لن تصدق النتيجة!',W*.48,H*.42,W*.48,H*.12,p.ac,{ff:'Lalezar',ta:'right'}),
 ic('➡️',W*.5,H*.7,H*.18),sh('round',W*.62,H*.72,W*.3,H*.15,'#ef4444',{r:H*.04}),tx('شاهد الآن',W*.62,H*.745,W*.3,H*.09,'#fff',{})]}};
L.logo=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'solid',c:[p.bg]},els:[
 sh('hex',W/2-m*.26,H*.2,m*.52,m*.52,{g:[p.c1,p.c2,135]},{sh:{c:'rgba(0,0,0,.25)',b:30,x:0,y:12}}),tx('D',W/2-m*.26,H*.27,m*.52,m*.3,'#fff',{ff:'Poppins',fw:'700'}),
 tx('اسم علامتك',W*.1,H*.68,W*.8,m*.1,p.tx,{ff:'Cairo',fw:'900'}),sh('rect',W/2-m*.1,H*.82,m*.2,m*.008,p.ac),tx('شعارك التجاري هنا',W*.1,H*.85,W*.8,m*.035,p.tx,{fw:'400',op:.7})]}};
L.event=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'grad',c:[p.c1,p.c2,150]},els:[
 sh('round',W*.08,H*.08,W*.84,H*.84,'rgba(255,255,255,.95)',{r:m*.04,sh:{c:'rgba(0,0,0,.3)',b:40,x:0,y:16}}),
 sh('round',W*.14,H*.14,m*.22,m*.26,p.c1,{r:m*.03}),tx('15',W*.14,H*.155,m*.22,m*.11,'#fff',{ff:'Poppins'}),tx('ديسمبر',W*.14,H*.275,m*.22,m*.04,'#fff',{}),
 tx('اسم الفعالية',W*.1,H*.42,W*.8,m*.08,p.bg==='#ffffff'?'#111827':'#111827',{ff:'Cairo',fw:'900'}),
 tx('وصف قصير للحدث ومن المستهدف',W*.12,H*.53,W*.76,m*.035,'#475569',{fw:'400',lh:1.5}),
 ic('📍',W*.2,H*.68,m*.06),tx('الرياض، قاعة المؤتمرات',W*.3,H*.685,W*.5,m*.04,'#334155',{ta:'right',fw:'400'}),
 ic('🕗',W*.2,H*.76,m*.06),tx('8:00 مساءً',W*.3,H*.765,W*.5,m*.04,'#334155',{ta:'right',fw:'400'})]}};
L.minimal=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'solid',c:['#ffffff']},els:[
 sh('rect',W*.06,H*.06,W*.88,H*.88,'rgba(0,0,0,0)',{stroke:'#111827',sw:Math.max(2,m*.004)}),
 tx('ABOUT',W*.1,H*.2,W*.8,m*.035,p.ac,{ff:'Poppins',ls:8,fw:'400'}),
 tx('عنوان بسيط وأنيق',W*.1,H*.3,W*.8,m*.1,'#111827',{ff:'Playfair Display',fw:'700'}),
 sh('rect',W/2-m*.05,H*.55,m*.1,m*.006,'#111827'),
 tx('نص قصير هادئ يكمل العنوان بأسلوب راقٍ وبسيط.',W*.18,H*.62,W*.64,m*.035,'#475569',{fw:'400',lh:1.7,ff:'Almarai'})]}};
L.story=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'grad',c:[p.c1,p.c2,160]},els:[
 sh('ellipse',-W*.3,H*.55,W*.9,W*.9,'rgba(255,255,255,.12)'),sh('ellipse',W*.5,-H*.05,W*.7,W*.7,'rgba(255,255,255,.1)'),
 tx('جديد',W*.1,H*.1,W*.8,W*.07,p.ac,{ff:'Lalezar'}),
 tx('عنوان القصة الرئيسي',W*.08,H*.2,W*.84,W*.13,'#fff',{ff:'Cairo',fw:'900',lh:1.2}),
 sh('round',W*.1,H*.42,W*.8,H*.3,'rgba(255,255,255,.18)',{r:W*.05,ph:1,name:'مكان صورة'}),tx('📷 ضع صورتك هنا',W*.1,H*.55,W*.8,W*.05,'#fff',{fw:'400',op:.8}),
 sh('round',W*.2,H*.82,W*.6,H*.07,'#fff',{r:H*.035}),tx('اسحب للأعلى ⬆️',W*.2,H*.835,W*.6,W*.045,p.c1,{})]}};
L.card=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'solid',c:[p.bg]},els:[
 sh('rect',0,0,W*.06,H,{g:[p.c1,p.c2,180]}),sh('ellipse',W*.72,-H*.3,H*1.1,H*1.1,{g:[p.c1,p.c2,135]},{op:.18}),
 tx('الاسم الكامل',W*.1,H*.2,W*.6,H*.14,p.tx,{ta:'right',ff:'Cairo',fw:'900'}),tx('المسمى الوظيفي',W*.1,H*.37,W*.6,H*.075,p.ac,{ta:'right',fw:'400',ff:'Tajawal'}),
 ic('📞',W*.1,H*.58,H*.09),tx('+966 5X XXX XXXX',W*.2,H*.59,W*.5,H*.07,p.tx,{ta:'right',fw:'400'}),
 ic('✉️',W*.1,H*.7,H*.09),tx('name@example.com',W*.2,H*.71,W*.5,H*.07,p.tx,{ta:'right',fw:'400'}),
 ic('🌐',W*.1,H*.82,H*.09),tx('www.example.com',W*.2,H*.83,W*.5,H*.07,p.tx,{ta:'right',fw:'400'})]}};
L.testi=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'solid',c:[p.bg]},els:[
 sh('round',W*.08,H*.14,W*.84,H*.6,'#ffffff',{r:m*.05,sh:{c:'rgba(0,0,0,.15)',b:40,x:0,y:14}}),
 tx('⭐⭐⭐⭐⭐',W*.1,H*.2,W*.8,m*.06,'#f59e0b',{}),
 tx('تجربة رائعة وخدمة احترافية. أنصح الجميع بالتعامل معهم!',W*.14,H*.34,W*.72,m*.05,'#1f2937',{fw:'700',lh:1.6,ff:'Almarai'}),
 sh('ellipse',W/2-m*.07,H*.78,m*.14,m*.14,{g:[p.c1,p.c2,135]},{ph:1,name:'صورة العميل'}),tx('اسم العميل',W*.2,H*.915,W*.6,m*.04,p.tx,{})]}};
L.stats=function(W,H,p){var m=Math.min(W,H);var o=[tx('أرقامنا تتحدث',W*.1,H*.1,W*.8,m*.075,'#fff',{ff:'Cairo',fw:'900'})];
 [['+10K','عميل سعيد'],['98%','نسبة الرضا'],['24/7','دعم متواصل']].forEach(function(s,i){var y=H*.28+i*H*.22;o.push(sh('round',W*.1,y,W*.8,H*.18,'rgba(255,255,255,.14)',{r:m*.03}),tx(s[0],W*.14,y+H*.03,W*.34,m*.09,p.ac,{ff:'Poppins'}),tx(s[1],W*.48,y+H*.05,W*.4,m*.05,'#fff',{ta:'right',fw:'400'}))});
 return{bg:{t:'grad',c:[p.bg==='#ffffff'?p.c1:p.bg,p.c1,150]},els:o}};
L.menu=function(W,H,p){var m=Math.min(W,H);var o=[tx('قائمتنا',W*.1,H*.07,W*.8,m*.09,p.ac,{ff:'Lalezar'})];
 [['برجر لحم','25'],['بيتزا مارغريتا','32'],['سلطة سيزر','18'],['عصير طازج','12']].forEach(function(r,i){var y=H*.24+i*H*.15;o.push(tx(r[0],W*.1,y,W*.5,m*.05,p.tx,{ta:'right',ff:'Cairo'}),sh('rect',W*.1,y+m*.065,W*.8,2,'rgba(255,255,255,.2)'),tx(r[1]+' ر.س',W*.6,y,W*.3,m*.05,p.ac,{ta:'left',ff:'Poppins'}))});
 return{bg:{t:'solid',c:[p.bg==='#ffffff'?'#1f2937':p.bg]},els:o}};
L.promo=function(W,H,p){var m=Math.min(W,H);return{bg:{t:'pat',c:[p.bg,p.c1,'dots',m*.06]},els:[
 sh('round',W*.08,H*.28,W*.84,H*.44,p.c1,{r:m*.05,sh:{c:'rgba(0,0,0,.3)',b:30,x:0,y:16}}),
 tx('عرض نهاية الأسبوع',W*.1,H*.33,W*.8,m*.07,'#fff',{ff:'Lalezar'}),tx('اشترِ 2 واحصل على 1 مجانًا',W*.1,H*.45,W*.8,m*.06,p.ac,{ff:'Cairo',fw:'900'}),
 tx('تسوق الآن واستفد قبل انتهاء العرض',W*.1,H*.58,W*.8,m*.035,'#fff',{fw:'400'}),
 ic('🎁',W*.04,H*.17,m*.16,{rot:-15}),ic('⚡',W*.78,H*.7,m*.16,{rot:15})]}};
SD.layouts=[['quote','اقتباس','post'],['sale','تخفيضات','post'],['announce','إعلان','post'],['product','منتج','post'],['thumb','صورة مصغرة','video'],['logo','شعار','brand'],['event','فعالية','post'],['minimal','بسيط أنيق','post'],['story','ستوري','story'],['card','بطاقة أعمال','brand'],['testi','رأي عميل','post'],['stats','إحصائيات','post'],['menu','قائمة','post'],['promo','عرض ترويجي','post']];
SD.layoutFn=L;
SD.templates=[];
SD.layouts.forEach(function(l,i){for(var k=0;k<4;k++){SD.templates.push({id:l[0]+k,n:l[1],cat:l[2],l:l[0],p:(i+k*2)%SD.pal.length})}});
SD.build=function(t,W,H){var r=L[t.l](W,H,SD.pal[t.p]);return{bg:r.bg,els:r.els}};
})();
