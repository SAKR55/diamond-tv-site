/* DIAMOND HUB Studio — بيانات: خطوط، ألوان، تدرجات، أنماط، أشكال، أيقونات، قوالب */
(function(){
var SD=window.SD={};
SD.fonts=[
['Cairo','عربي'],['Tajawal','عربي'],['Almarai','عربي'],['Changa','عربي'],['El Messiri','عربي'],['Lalezar','عربي'],['Reem Kufi','عربي'],['Amiri','عربي'],['Harmattan','عربي'],['Mada','عربي'],['Markazi Text','عربي'],['Rakkas','عربي'],['Aref Ruqaa','عربي'],['Lemonada','عربي'],['Katibeh','عربي'],['Scheherazade New','عربي'],['IBM Plex Sans Arabic','عربي'],['Noto Kufi Arabic','عربي'],['Noto Naskh Arabic','عربي'],['Baloo Bhaijaan 2','عربي'],['Readex Pro','عربي'],['Vazirmatn','عربي'],['Alexandria','عربي'],['Rubik','عربي/لاتيني'],
['Poppins','لاتيني'],['Montserrat','لاتيني'],['Playfair Display','لاتيني'],['Bebas Neue','لاتيني'],['Oswald','لاتيني'],['Pacifico','لاتيني'],['Lobster','لاتيني'],['Anton','لاتيني'],['Raleway','لاتيني'],['Dancing Script','لاتيني'],['Righteous','لاتيني'],['Permanent Marker','لاتيني'],['Abril Fatface','لاتيني'],['Bangers','لاتيني']];
SD.fontsURL='https://fonts.googleapis.com/css2?'+SD.fonts.map(function(f){return 'family='+f[0].replace(/ /g,'+')+':wght@400;700'}).join('&')+'&display=swap';
SD.sizes=[
['منشور إنستغرام',1080,1080],['بورتريه إنستغرام',1080,1350],['ستوري / ريلز / تيك توك',1080,1920],['غلاف يوتيوب (صورة مصغرة)',1280,720],['منشور فيسبوك',1200,630],['غلاف فيسبوك',1640,624],['منشور X (تويتر)',1600,900],['بنر لينكدإن',1584,396],['حالة واتساب',1080,1920],['بوستر A4',2480,3508],['فلاير A5',1748,2480],['بطاقة أعمال',1050,600],['شعار',1000,1000],['بنر متجر',1920,600],['عرض تقديمي 16:9',1920,1080],['بطاقة دعوة',1200,1600],['أيقونة تطبيق',1024,1024]];
SD.pal=[
{n:'ياقوتي',bg:'#1e1b4b',c1:'#7c3aed',c2:'#06b6d4',tx:'#ffffff',ac:'#fbbf24'},
{n:'غروب',bg:'#fff7ed',c1:'#f97316',c2:'#db2777',tx:'#431407',ac:'#7c2d12'},
{n:'زمردي',bg:'#022c22',c1:'#10b981',c2:'#84cc16',tx:'#ecfdf5',ac:'#fde047'},
{n:'ليلي ذهبي',bg:'#0f172a',c1:'#fbbf24',c2:'#f59e0b',tx:'#f8fafc',ac:'#fbbf24'},
{n:'وردي ناعم',bg:'#fdf2f8',c1:'#ec4899',c2:'#a855f7',tx:'#500724',ac:'#be185d'},
{n:'محيط',bg:'#ecfeff',c1:'#0891b2',c2:'#2563eb',tx:'#083344',ac:'#0e7490'},
{n:'أبيض أنيق',bg:'#ffffff',c1:'#111827',c2:'#6b7280',tx:'#111827',ac:'#b45309'},
{n:'أحمر قوي',bg:'#450a0a',c1:'#ef4444',c2:'#f97316',tx:'#fff1f2',ac:'#fde68a'}];
SD.swatches=['#000000','#ffffff','#f8fafc','#e2e8f0','#94a3b8','#475569','#0f172a','#ef4444','#f97316','#f59e0b','#fbbf24','#84cc16','#22c55e','#10b981','#14b8a6','#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e','#7c2d12','#78350f','#365314','#134e4a','#1e3a8a','#4c1d95','#831843','#fecaca','#fed7aa','#fde68a','#bbf7d0','#a5f3fc','#bfdbfe','#ddd6fe','#fbcfe8'];
SD.grads=[['#7c3aed','#06b6d4',135],['#f97316','#db2777',135],['#10b981','#84cc16',135],['#0f172a','#334155',160],['#fbbf24','#f97316',135],['#ec4899','#8b5cf6',135],['#0ea5e9','#6366f1',135],['#22c55e','#06b6d4',90],['#ef4444','#f59e0b',135],['#111827','#7c3aed',135],['#fdf2f8','#ddd6fe',135],['#ecfeff','#bfdbfe',160],['#fef3c7','#fecaca',135],['#1e1b4b','#4c1d95',150],['#064e3b','#0f766e',135],['#fff','#e2e8f0',180],['#f43f5e','#fb923c',90],['#06b6d4','#3b82f6',45],['#a3e635','#22d3ee',135],['#000','#434343',180],['#ff9a9e','#fad0c4',135],['#a18cd1','#fbc2eb',135],['#84fab0','#8fd3f4',135],['#fccb90','#d57eeb',135]];
SD.pats=[['dots','نقاط'],['grid','شبكة'],['lines','خطوط مائلة'],['hlines','خطوط أفقية'],['checks','مربعات'],['circles','دوائر'],['waves','موجات'],['zig','متعرّج'],['plus','علامات +'],['tri','مثلثات'],['hex','سداسي'],['stars','نجوم'],['islamic','نجمة إسلامية'],['diamond','معينات']];
SD.shapes=[['rect','مستطيل'],['round','مستطيل مدوّر'],['ellipse','دائرة'],['tri','مثلث'],['diamond','معين'],['pent','خماسي'],['hex','سداسي'],['oct','ثماني'],['star5','نجمة'],['star4','نجمة رباعية'],['burst','انفجار'],['badge','ختم'],['heart','قلب'],['arrow','سهم'],['chevron','شيفرون'],['para','متوازي'],['trap','شبه منحرف'],['bubble','فقاعة'],['cross','زائد'],['ring','حلقة'],['blob','شكل عضوي'],['ribbon','شريط'],['moon','هلال'],['cloud','سحابة'],['line','خط'],['drop','قطرة']];
// أيقونات متجهية (24×24): s=true للخطية
SD.icons=[
['star','M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z'],
['heart','M12 21s-8-4.9-9.6-10C1.3 7.300 3.400 4.500 6.400 4.500c2 0 3.600 1.200 5.600 3.200 2-2 3.600-3.200 5.600-3.200 3 0 5.100 2.800 4 6.500C20 16.100 12 21 12 21z'],
['bolt','M13 2L4 14h6l-1 8 9-12h-6z'],['play','M7 4l13 8-13 8z'],['pause','M6 4h4v16H6zM14 4h4v16h-4z'],
['check','M4 12.500l5 5L20 6.500',1],['close','M5 5l14 14M19 5L5 19',1],['plus','M12 4v16M4 12h16',1],['minus','M4 12h16',1],
['arrow-r','M4 12h16M14 6l6 6-6 6',1],['arrow-l','M20 12H4M10 6l-6 6 6 6',1],['arrow-u','M12 20V4M6 10l6-6 6 6',1],['arrow-d','M12 4v16M6 14l6 6 6-6',1],
['search','M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5',1],['menu','M4 6h16M4 12h16M4 18h16',1],
['phone','M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',1],
['mail','M3 5h18v14H3zM3 6l9 7 9-7',1],
['pin','M12 21s-7-6.500-7-12a7 7 0 0114 0c0 5.500-7 12-7 12zM12 6.500a2.500 2.500 0 100 5 2.500 2.500 0 000-5z',1],
['home','M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',1],['user','M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',1],
['users','M9 11a3.500 3.500 0 100-7 3.500 3.500 0 000 7zM2 20a7 7 0 0114 0M16 4a3.500 3.500 0 010 7M18 14a7 7 0 013 6',1],
['cart','M3 4h3l2.500 11h10l2-8H7M9 20.500a.5.500 0 100 .01M18 20.500a.5.500 0 100 .01',1],
['clock','M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2',1],['calendar','M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',1],
['bell','M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21h4',1],['lock','M5 11h14v10H5zM8 11V7a4 4 0 018 0v4',1],['eye','M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z',1],
['camera','M3 7h4l2-3h6l2 3h4v13H3zM12 10a4 4 0 100 8 4 4 0 000-8z',1],['image','M3 4h18v16H3zM3 16l5-5 4 4 3-3 6 6M15.500 9a1.500 1.500 0 100-3 1.500 1.500 0 000 3',1],
['gift','M3 9h18v4H3zM5 13h14v8H5zM12 9v12M12 9c-3 0-5-1-5-3s3-3 5 3c2-6 5-5 5-3s-2 3-5 3',1],['tag','M3 12V4h8l10 10-8 8zM7.500 8.500a1 1 0 100 .01',1],
['globe','M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',1],['share','M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.500 13.500l7 4M15.500 6.500l-7 4',1],
['thumb','M7 11v10H3V11zM7 11l4-8c2 0 3 1 3 3v3h6l-1.500 9a2 2 0 01-2 2H7',1],['chat','M4 4h16v12H9l-5 4z',1],['settings','M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2',1],
['shield','M12 2l8 3v6c0 5-3.500 9-8 11-4.500-2-8-6-8-11V5z',1],['chart','M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3',1],['trend','M3 17l6-6 4 4 8-9M15 6h6v6',1],['target','M12 3a9 9 0 100 18 9 9 0 000-18zM12 7a5 5 0 100 10 5 5 0 000-10zM12 11a1 1 0 100 2 1 1 0 000-2z',1],
['bulb','M9 18h6M10 21h4M12 3a6 6 0 00-4 10.500V16h8v-2.500A6 6 0 0012 3z',1],['rocket','M12 2c4 2 6 6 6 10l-3 3H9l-3-3c0-4 2-8 6-10zM9 15l-2 5 5-2M15 15l2 5-5-2M12 9a1.500 1.500 0 100 3 1.500 1.500 0 000-3',1],
['crown','M3 8l4 4 5-7 5 7 4-4-2 11H5z'],['diamond','M6 3h12l4 6-10 12L2 9z'],['medal','M12 14a6 6 0 100-12 6 6 0 000 12zM8 13l-2 9 6-3 6 3-2-9'],
['fire','M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-4 3-6 1 2 2 2 3 0 0-2 0-4 0-6z'],['sun','M12 8a4 4 0 100 8 4 4 0 000-8zM12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M20 4l-2 2M6 18l-2 2',1],['moon','M20 14A8 8 0 019.500 3.500 8 8 0 1020 14z'],
['music','M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z',1],['video','M3 6h12v12H3zM15 10l6-3v10l-6-3',1],['mic','M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3zM5 11a7 7 0 0014 0M12 18v4',1],
['wifi','M2 9a15 15 0 0120 0M5 13a10 10 0 0114 0M8.500 16.500a5 5 0 017 0M12 20a1 1 0 100 .01',1],['download','M12 3v12M6 10l6 6 6-6M4 21h16',1],['upload','M12 17V5M6 10l6-6 6 6M4 21h16',1],['link','M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1',1],
['qr','M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 14h2v2M14 19h2v2M18 18h3v3',1],['truck','M2 6h12v10H2zM14 9h4l4 4v3h-8zM6 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z',1],['wallet','M3 7h16a2 2 0 012 2v10H3zM3 7V5a2 2 0 012-2h12M16 14h2',1],['coin','M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v10M9 9.500c0-1 1-1.500 3-1.500s3 .8 3 2-1 1.500-3 2-3 1-3 2.200 1 2 3 2 3-.5 3-1.500',1]];
SD.emoji={
'أعمال':'💼 📈 📊 💰 💵 💳 🏦 🧾 📦 🚚 🛒 🛍️ 🏷️ 🎯 🤝 🏆 🥇 🎖️ 💡 🚀 ⚡ 🔥 ✅ ❌ ⭐ 🌟 ✨ 💎 👑 🔔 📣 📢 📱 💻 🖥️ ⌚ 🎧 📷 🎥',
'وجوه':'😀 😁 😂 🤣 😊 😍 🥰 😎 🤩 🥳 😇 🤔 😴 😢 😡 🤯 🙌 👏 👍 👎 👌 ✌️ 🤞 💪 🙏 👋 ☝️ 👉 👈 🫶',
'طعام':'🍕 🍔 🍟 🌮 🍣 🍜 🍩 🍰 🎂 🍫 🍿 ☕ 🍵 🥤 🍉 🍓 🍎 🍌 🥑 🥗 🍗 🥩 🍞 🧀',
'طبيعة':'🌹 🌸 🌻 🌴 🌲 🍃 🌿 🌵 🌈 ☀️ 🌙 ⭐ ☁️ ⛅ 🌧️ ❄️ 🔥 💧 🌊 🏔️ 🏜️ 🏝️ 🦋 🐝 🐶 🐱 🦁 🐎 🐪 🦅',
'مناسبات':'🎉 🎊 🎈 🎁 🎀 🕌 🌙 ⭐ 🕋 📿 🤲 🕯️ 🪔 🎄 🎃 💐 💍 💒 🎓 🏅 🎤 🎵 🎬 ⚽ 🏀 🎮 🎲 ✈️ 🚗 🏠',
'رموز':'❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💯 ✔️ ➕ ➖ ➡️ ⬅️ ⬆️ ⬇️ 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🔺 🔻 ◆ ● ■ ▲ ★ ☆ ✦ ❝ ❞ ✿ ❀ ✪'};
// مولّد نمط
SD.drawPattern=function(ctx,w,h,kind,c,bgc,s){
  s=s||60;ctx.save();if(bgc){ctx.fillStyle=bgc;ctx.fillRect(0,0,w,h)}
  ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=Math.max(1.5,s/22);ctx.lineCap='round';
  var x,y,i;
  if(kind==='dots'){for(y=s/2;y<h+s;y+=s)for(x=s/2+((y/s|0)%2?s/2:0);x<w+s;x+=s){ctx.beginPath();ctx.arc(x,y,s/9,0,6.3);ctx.fill()}}
  else if(kind==='grid'){ctx.beginPath();for(x=0;x<=w;x+=s){ctx.moveTo(x,0);ctx.lineTo(x,h)}for(y=0;y<=h;y+=s){ctx.moveTo(0,y);ctx.lineTo(w,y)}ctx.stroke()}
  else if(kind==='lines'){ctx.beginPath();for(x=-h;x<w+h;x+=s/1.5){ctx.moveTo(x,h);ctx.lineTo(x+h,0)}ctx.stroke()}
  else if(kind==='hlines'){ctx.beginPath();for(y=s/2;y<h;y+=s/2){ctx.moveTo(0,y);ctx.lineTo(w,y)}ctx.stroke()}
  else if(kind==='checks'){for(y=0;y*s<h;y++)for(x=0;x*s<w;x++)if((x+y)%2===0)ctx.fillRect(x*s,y*s,s,s)}
  else if(kind==='circles'){for(y=s/2;y<h+s;y+=s)for(x=s/2;x<w+s;x+=s){ctx.beginPath();ctx.arc(x,y,s/2.6,0,6.3);ctx.stroke()}}
  else if(kind==='waves'){for(y=s/2;y<h+s;y+=s/1.4){ctx.beginPath();for(x=0;x<=w+s;x+=s/6){var yy=y+Math.sin(x/s*3.14)*s/5;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}ctx.stroke()}}
  else if(kind==='zig'){for(y=s/2;y<h+s;y+=s/1.3){ctx.beginPath();for(x=0,i=0;x<=w+s;x+=s/2,i++){i%2?ctx.lineTo(x,y+s/5):(x?ctx.lineTo(x,y-s/5):ctx.moveTo(x,y-s/5))}ctx.stroke()}}
  else if(kind==='plus'){for(y=s/2;y<h+s;y+=s)for(x=s/2;x<w+s;x+=s){ctx.beginPath();ctx.moveTo(x-s/6,y);ctx.lineTo(x+s/6,y);ctx.moveTo(x,y-s/6);ctx.lineTo(x,y+s/6);ctx.stroke()}}
  else if(kind==='tri'){for(y=0;y<h+s;y+=s)for(x=0;x<w+s;x+=s){ctx.beginPath();ctx.moveTo(x,y+s*.8);ctx.lineTo(x+s/2,y+s*.2);ctx.lineTo(x+s,y+s*.8);ctx.closePath();ctx.stroke()}}
  else if(kind==='hex'){var r=s/2,hh=r*Math.sqrt(3);for(y=0,i=0;y<h+hh;y+=hh/2*1,i++)for(x=(i%2)*r*1.5;x<w+s;x+=r*3){ctx.beginPath();for(var k=0;k<6;k++){var a=k*Math.PI/3;ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a))}ctx.closePath();ctx.stroke()}}
  else if(kind==='stars'){for(y=s/2;y<h+s;y+=s)for(x=s/2+((y/s|0)%2?s/2:0);x<w+s;x+=s){ctx.beginPath();for(var k=0;k<10;k++){var rr=k%2?s/16:s/7,a=k*Math.PI/5-Math.PI/2;ctx.lineTo(x+rr*Math.cos(a),y+rr*Math.sin(a))}ctx.closePath();ctx.fill()}}
  else if(kind==='islamic'){for(y=s/2;y<h+s;y+=s)for(x=s/2;x<w+s;x+=s){ctx.beginPath();for(var k=0;k<16;k++){var rr=k%2?s*.2:s*.42,a=k*Math.PI/8;ctx.lineTo(x+rr*Math.cos(a),y+rr*Math.sin(a))}ctx.closePath();ctx.stroke()}}
  else if(kind==='diamond'){for(y=0;y<h+s;y+=s/2)for(x=((y/(s/2)|0)%2)*s/2;x<w+s;x+=s){ctx.beginPath();ctx.moveTo(x,y-s/4);ctx.lineTo(x+s/4,y);ctx.lineTo(x,y+s/4);ctx.lineTo(x-s/4,y);ctx.closePath();ctx.fill()}}
  ctx.restore()};
// مسارات الأشكال داخل مستطيل w×h
SD.shapePath=function(k,w,h,r){
  var p=new Path2D(),i,a,cx=w/2,cy=h/2;
  function poly(n,rot,ri){for(i=0;i<n*(ri?2:1);i++){a=rot+i*Math.PI*2/(n*(ri?2:1));var rr=ri?(i%2?ri:1):1,x=cx+Math.cos(a)*cx*rr,y=cy+Math.sin(a)*cy*rr;i?p.lineTo(x,y):p.moveTo(x,y)}p.closePath()}
  switch(k){
  case 'rect':p.rect(0,0,w,h);break;
  case 'round':r=Math.min(r||Math.min(w,h)*.18,w/2,h/2);p.moveTo(r,0);p.arcTo(w,0,w,h,r);p.arcTo(w,h,0,h,r);p.arcTo(0,h,0,0,r);p.arcTo(0,0,w,0,r);p.closePath();break;
  case 'ellipse':p.ellipse(cx,cy,cx,cy,0,0,6.2832);break;
  case 'tri':p.moveTo(cx,0);p.lineTo(w,h);p.lineTo(0,h);p.closePath();break;
  case 'diamond':p.moveTo(cx,0);p.lineTo(w,cy);p.lineTo(cx,h);p.lineTo(0,cy);p.closePath();break;
  case 'pent':poly(5,-Math.PI/2);break;case 'hex':poly(6,0);break;case 'oct':poly(8,Math.PI/8);break;
  case 'star5':poly(5,-Math.PI/2,.42);break;case 'star4':poly(4,-Math.PI/2,.3);break;
  case 'burst':poly(14,-Math.PI/2,.8);break;
  case 'badge':poly(20,0,.9);break;
  case 'heart':p.moveTo(cx,h);p.bezierCurveTo(-w*.1,h*.55,w*.05,-h*.05,cx,h*.28);p.bezierCurveTo(w*.95,-h*.05,w*1.1,h*.55,cx,h);p.closePath();break;
  case 'arrow':p.moveTo(0,h*.3);p.lineTo(w*.6,h*.3);p.lineTo(w*.6,0);p.lineTo(w,cy);p.lineTo(w*.6,h);p.lineTo(w*.6,h*.7);p.lineTo(0,h*.7);p.closePath();break;
  case 'chevron':p.moveTo(0,0);p.lineTo(w*.7,0);p.lineTo(w,cy);p.lineTo(w*.7,h);p.lineTo(0,h);p.lineTo(w*.3,cy);p.closePath();break;
  case 'para':p.moveTo(w*.2,0);p.lineTo(w,0);p.lineTo(w*.8,h);p.lineTo(0,h);p.closePath();break;
  case 'trap':p.moveTo(w*.2,0);p.lineTo(w*.8,0);p.lineTo(w,h);p.lineTo(0,h);p.closePath();break;
  case 'bubble':p.moveTo(w*.1,0);p.lineTo(w*.9,0);p.arcTo(w,0,w,h*.1,w*.1);p.lineTo(w,h*.65);p.arcTo(w,h*.75,w*.9,h*.75,w*.1);p.lineTo(w*.4,h*.75);p.lineTo(w*.2,h);p.lineTo(w*.25,h*.75);p.lineTo(w*.1,h*.75);p.arcTo(0,h*.75,0,h*.65,w*.1);p.lineTo(0,h*.1);p.arcTo(0,0,w*.1,0,w*.1);p.closePath();break;
  case 'cross':var t=.33;p.moveTo(w*t,0);p.lineTo(w*(1-t),0);p.lineTo(w*(1-t),h*t);p.lineTo(w,h*t);p.lineTo(w,h*(1-t));p.lineTo(w*(1-t),h*(1-t));p.lineTo(w*(1-t),h);p.lineTo(w*t,h);p.lineTo(w*t,h*(1-t));p.lineTo(0,h*(1-t));p.lineTo(0,h*t);p.lineTo(w*t,h*t);p.closePath();break;
  case 'ring':p.ellipse(cx,cy,cx,cy,0,0,6.2832);p.moveTo(cx+cx*.62,cy);p.ellipse(cx,cy,cx*.62,cy*.62,0,0,6.2832,true);break;
  case 'blob':p.moveTo(w*.5,0);p.bezierCurveTo(w*.85,-h*.02,w*1.05,h*.3,w*.95,h*.55);p.bezierCurveTo(w*.9,h*.9,w*.55,h*1.02,w*.3,h*.92);p.bezierCurveTo(w*-.02,h*.8,-w*.05,h*.4,w*.15,h*.2);p.bezierCurveTo(w*.25,h*.05,w*.38,0,w*.5,0);p.closePath();break;
  case 'ribbon':p.moveTo(0,0);p.lineTo(w,0);p.lineTo(w*.92,cy);p.lineTo(w,h);p.lineTo(0,h);p.lineTo(w*.08,cy);p.closePath();break;
  case 'moon':p.arc(cx,cy,cx,Math.PI*.2,Math.PI*1.8);p.arc(cx*1.45,cy,cx*.85,Math.PI*1.65,Math.PI*.35,true);p.closePath();break;
  case 'cloud':p.moveTo(w*.25,h);p.arc(w*.25,h*.65,h*.35,Math.PI*.5,Math.PI*1.5);p.arc(w*.45,h*.38,h*.3,Math.PI,Math.PI*1.9);p.arc(w*.7,h*.45,h*.3,Math.PI*1.4,Math.PI*.4);p.arc(w*.78,h*.7,h*.3,Math.PI*1.5,Math.PI*.5);p.closePath();break;
  case 'drop':p.moveTo(cx,0);p.bezierCurveTo(w*.9,h*.45,w,h*.62,w,h*.68);p.arc(cx,h*.68,cx,0,Math.PI);p.bezierCurveTo(0,h*.62,w*.1,h*.45,cx,0);p.closePath();break;
  case 'line':p.rect(0,cy-Math.max(2,h*.05)/2,w,Math.max(2,h*.05));break;
  default:p.rect(0,0,w,h)}
  return p};
})();
