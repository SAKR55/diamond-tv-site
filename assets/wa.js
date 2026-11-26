/* مولّد رابط واتساب وQR — يعمل بالكامل في المتصفح بلا إرسال بيانات */
(function(){
var AR=document.documentElement.lang==='ar';
var T=AR?{copied:'تم النسخ ✓',copy:'نسخ',bad:'أدخل رقمًا صحيحًا (7 إلى 15 رقمًا مع رمز الدولة).',long:'الرابط أطول من أن يُحوَّل إلى QR؛ اختصر الرسالة.',empty:'أدخل الرقم أولًا',btn:'راسلنا على واتساب'}:{copied:'Copied ✓',copy:'Copy',bad:'Enter a valid number (7–15 digits including country).',long:'The link is too long for a QR code; shorten the message.',empty:'Enter the number first',btn:'Chat on WhatsApp'};
var C=[['966','SA','السعودية','Saudi Arabia'],['971','AE','الإمارات','United Arab Emirates'],['965','KW','الكويت','Kuwait'],['974','QA','قطر','Qatar'],['973','BH','البحرين','Bahrain'],['968','OM','عُمان','Oman'],['20','EG','مصر','Egypt'],['962','JO','الأردن','Jordan'],['961','LB','لبنان','Lebanon'],['964','IQ','العراق','Iraq'],['212','MA','المغرب','Morocco'],['213','DZ','الجزائر','Algeria'],['216','TN','تونس','Tunisia'],['249','SD','السودان','Sudan'],['967','YE','اليمن','Yemen'],['90','TR','تركيا','Turkey'],['1','US','أمريكا وكندا','United States / Canada'],['44','GB','بريطانيا','United Kingdom'],['49','DE','ألمانيا','Germany'],['33','FR','فرنسا','France'],['34','ES','إسبانيا','Spain'],['39','IT','إيطاليا','Italy'],['31','NL','هولندا','Netherlands'],['351','PT','البرتغال','Portugal'],['52','MX','المكسيك','Mexico'],['55','BR','البرازيل','Brazil'],['54','AR','الأرجنتين','Argentina'],['57','CO','كولومبيا','Colombia'],['56','CL','تشيلي','Chile'],['51','PE','بيرو','Peru'],['91','IN','الهند','India'],['92','PK','باكستان','Pakistan'],['880','BD','بنغلاديش','Bangladesh'],['62','ID','إندونيسيا','Indonesia'],['60','MY','ماليزيا','Malaysia'],['63','PH','الفلبين','Philippines'],['65','SG','سنغافورة','Singapore'],['66','TH','تايلاند','Thailand'],['84','VN','فيتنام','Vietnam'],['81','JP','اليابان','Japan'],['82','KR','كوريا الجنوبية','South Korea'],['61','AU','أستراليا','Australia'],['27','ZA','جنوب أفريقيا','South Africa'],['234','NG','نيجيريا','Nigeria'],['254','KE','كينيا','Kenya'],['7','RU','روسيا','Russia'],['380','UA','أوكرانيا','Ukraine']];
var $=function(i){return document.getElementById(i)};
var sel=$('wa-cc');C.forEach(function(c){var o=document.createElement('option');o.value=c[0];o.textContent=c[1]+' +'+c[0]+' — '+(AR?c[2]:c[3]);sel.appendChild(o)});
try{var z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';var m={'Asia/Riyadh':'966','Asia/Dubai':'971','Africa/Cairo':'20','Asia/Kuwait':'965','Asia/Qatar':'974','America/New_York':'1','Europe/London':'44','Asia/Kolkata':'91','Asia/Calcutta':'91','America/Mexico_City':'52','America/Sao_Paulo':'55','Europe/Madrid':'34'};if(m[z])sel.value=m[z]}catch(e){}
var lastLink='',cv=$('wa-qr'),fg=$('wa-fg');
function digits(s){return (s||'').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/\D/g,'')}
function build(){
 var p=digits($('wa-num').value);var cc=sel.value;
 if(!p){lastLink='';$('wa-link').value='';$('wa-msg').textContent=T.empty;cv.style.display='none';return}
 if($('wa-num').value.trim().charAt(0)==='+'||p.indexOf(cc)===0&&p.length>=11){}else{p=p.replace(/^0+/,'');p=cc+p}
 if(p.length<7||p.length>15){lastLink='';$('wa-link').value='';$('wa-msg').textContent=T.bad;cv.style.display='none';return}
 var t=$('wa-text').value.trim();lastLink='https://wa.me/'+p+(t?'?text='+encodeURIComponent(t):'');
 $('wa-link').value=lastLink;$('wa-msg').textContent='';
 $('wa-html').value='<a href="'+lastLink+'" target="_blank" rel="noopener" style="display:inline-block;background:#25D366;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-family:sans-serif">'+T.btn+'</a>';
 draw();
}
function draw(){
 if(!lastLink)return;
 try{var M=QR.make(lastLink,'M'),n=M.length,mg=4,u=Math.max(6,Math.floor(600/(n+2*mg))),S=(n+2*mg)*u;cv.width=cv.height=S;var x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,S,S);x.fillStyle=fg.value;for(var y=0;y<n;y++)for(var i=0;i<n;i++)if(M[y][i])x.fillRect((i+mg)*u,(y+mg)*u,u,u);cv.style.display='block';$('wa-dl').disabled=false}
 catch(e){cv.style.display='none';$('wa-dl').disabled=true;$('wa-msg').textContent=T.long}
}
['wa-num','wa-text'].forEach(function(i){$(i).addEventListener('input',build)});sel.addEventListener('change',build);fg.addEventListener('input',draw);
function cp(id,b){var el=$(id);if(!el.value)return;el.select();try{navigator.clipboard.writeText(el.value)}catch(e){document.execCommand('copy')}var o=b.textContent;b.textContent=T.copied;setTimeout(function(){b.textContent=o},1400)}
$('wa-cplink').onclick=function(){cp('wa-link',this)};$('wa-cphtml').onclick=function(){cp('wa-html',this)};
$('wa-open').onclick=function(){if(lastLink)window.open(lastLink,'_blank','noopener')};
$('wa-dl').onclick=function(){if(!lastLink||cv.style.display==='none')return;var a=document.createElement('a');a.download='whatsapp-qr.png';a.href=cv.toDataURL('image/png');a.click()};
build();
})();
