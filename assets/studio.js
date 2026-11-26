/* DIAMOND HUB Studio — محرر التصميم (Canvas) */
(function(){
var SD=window.SD;
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var D=null,sel=[],hist=[],hp=-1,zoom=1,IM={},clip=null,uid=1,drag=null,guides=[];
var DEF={op:1,rot:0};
function nid(){return 'e'+(uid++)}
function clone(o){return JSON.parse(JSON.stringify(o))}
function newDesign(w,h){return{w:w,h:h,bg:{t:'solid',c:['#ffffff']},els:[],assets:{}}}
/* ---------- صور ---------- */
function getImg(key){if(IM[key])return IM[key];var src=D.assets[key];if(!src)return null;var im=new Image();im.onload=function(){IM[key].ok=1;draw()};im.src=src;IM[key]=im;return im}
function addAsset(dataURL){var k='a'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);D.assets[k]=dataURL;return k}
/* ---------- خطوط ---------- */
var FL={};function loadFont(f){if(!f||FL[f])return;FL[f]=1;try{document.fonts.load('700 24px "'+f+'"').then(function(){draw()});document.fonts.load('400 24px "'+f+'"').then(function(){draw()})}catch(e){}}
/* ---------- رسم ---------- */
function paint(ctx,fill,w,h){if(!fill)return'transparent';if(typeof fill==='string')return fill;var g=fill.g,a=(g[2]||0)*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a),cx=w/2,cy=h/2,L=Math.abs(w*dx)/2+Math.abs(h*dy)/2;var gr=ctx.createLinearGradient(cx-dx*L,cy-dy*L,cx+dx*L,cy+dy*L);gr.addColorStop(0,g[0]);gr.addColorStop(1,g[1]);return gr}
function fontOf(e){return(e.fi?'italic ':'')+(e.fw||'700')+' '+e.fs+'px "'+(e.ff||'Cairo')+'",sans-serif'}
function layoutText(ctx,e){ctx.font=fontOf(e);try{ctx.letterSpacing=(e.ls||0)+'px'}catch(x){}var out=[];String(e.t||'').split('\n').forEach(function(par){var words=par.split(' '),cur='';words.forEach(function(w){var t=cur?cur+' '+w:w;if(cur&&ctx.measureText(t).width>e.w){out.push(cur);cur=w}else cur=t});out.push(cur)});return out}
function bgDraw(ctx,D,W,H){var b=D.bg||{t:'solid',c:['#fff']};ctx.save();if(b.t==='solid'){ctx.fillStyle=b.c[0];ctx.fillRect(0,0,W,H)}
else if(b.t==='grad'){ctx.fillStyle=paint(ctx,{g:b.c},W,H);ctx.fillRect(0,0,W,H)}
else if(b.t==='pat'){SD.drawPattern(ctx,W,H,b.c[2],b.c[1],b.c[0],b.c[3]||60)}
else if(b.t==='img'&&D.assets[b.src]){var im=getImg(b.src);if(im&&im.complete&&im.naturalWidth){var s=Math.max(W/im.naturalWidth,H/im.naturalHeight),iw=im.naturalWidth*s,ih=im.naturalHeight*s;if(b.f)ctx.filter=b.f;ctx.drawImage(im,(W-iw)/2,(H-ih)/2,iw,ih)}else{ctx.fillStyle='#ddd';ctx.fillRect(0,0,W,H)}}
ctx.restore()}
function filterStr(f){if(!f)return'none';var a=[];if(f.b!=null&&f.b!==100)a.push('brightness('+f.b+'%)');if(f.c!=null&&f.c!==100)a.push('contrast('+f.c+'%)');if(f.s!=null&&f.s!==100)a.push('saturate('+f.s+'%)');if(f.bl)a.push('blur('+f.bl+'px)');if(f.g)a.push('grayscale('+f.g+'%)');if(f.se)a.push('sepia('+f.se+'%)');if(f.h)a.push('hue-rotate('+f.h+'deg)');return a.length?a.join(' '):'none'}
function drawEl(ctx,e){if(e.hide)return;ctx.save();var w=e.w,h=e.h;
 if(e.type==='text'){var L=layoutText(ctx,e);e.h=h=Math.max(e.fs*(e.lh||1.25),L.length*e.fs*(e.lh||1.25))}
 ctx.translate(e.x+w/2,e.y+h/2);if(e.rot)ctx.rotate(e.rot*Math.PI/180);ctx.translate(-w/2,-h/2);ctx.globalAlpha=e.op==null?1:e.op;
 if(e.sh){ctx.shadowColor=e.sh.c;ctx.shadowBlur=e.sh.b;ctx.shadowOffsetX=e.sh.x;ctx.shadowOffsetY=e.sh.y}
 if(e.type==='shape'){var p=SD.shapePath(e.k,w,h,e.r);if(e.fill){ctx.fillStyle=paint(ctx,e.fill,w,h);ctx.fill(p,e.k==='ring'?'evenodd':'nonzero')}if(e.stroke&&e.sw){ctx.shadowColor='transparent';ctx.strokeStyle=e.stroke;ctx.lineWidth=e.sw;ctx.lineJoin='round';ctx.stroke(p)}}
 else if(e.type==='text'){var L2=layoutText(ctx,e),lh=e.fs*(e.lh||1.25);var rtl=/[֐-ࣿ]/.test(e.t||'');try{ctx.direction=rtl?'rtl':'ltr'}catch(x){}ctx.textBaseline='middle';var al=e.ta||'center';ctx.textAlign=al;var tx=al==='left'?0:al==='right'?w:w/2;
  if(e.tbg){var mx=0,pad=e.fs*.3;L2.forEach(function(l){mx=Math.max(mx,ctx.measureText(l).width)});var bx=al==='left'?-pad:al==='right'?w-mx-pad:w/2-mx/2-pad;ctx.save();ctx.shadowColor='transparent';ctx.fillStyle=e.tbg;var bp=SD.shapePath('round',mx+pad*2,h+pad*.2,e.fs*.3);ctx.translate(bx,-pad*.1);ctx.fill(bp);ctx.restore()}
  L2.forEach(function(l,i){var y=i*lh+lh/2;if(e.stroke&&e.sw){ctx.save();ctx.shadowColor='transparent';ctx.lineJoin='round';ctx.lineWidth=e.sw*2;ctx.strokeStyle=e.stroke;ctx.strokeText(l,tx,y);ctx.restore()}ctx.fillStyle=paint(ctx,e.col||'#000',w,h);ctx.fillText(l,tx,y);if(e.ul){var m=ctx.measureText(l).width,x0=al==='left'?0:al==='right'?w-m:w/2-m/2;ctx.fillRect(x0,y+e.fs*.45,m,Math.max(1,e.fs*.06))}})}
 else if(e.type==='icon'){var ic=SD.icons.filter(function(i){return i[0]===e.ic})[0];if(ic){ctx.scale(w/24,h/24);var P=new Path2D(ic[1]);if(ic[2]){ctx.strokeStyle=e.col||'#000';ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(P)}else{ctx.fillStyle=e.col||'#000';ctx.fill(P)}}else{ctx.font=(w*.82)+'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(e.ic||'⭐',w/2,h/2+w*.05)}}
 else if(e.type==='image'){var im=getImg(e.src);ctx.save();var cp=SD.shapePath(e.clip||'rect',w,h,e.r);ctx.clip(cp);if(im&&im.complete&&im.naturalWidth){var z=e.z||1,s=Math.max(w/im.naturalWidth,h/im.naturalHeight)*z,iw=im.naturalWidth*s,ih=im.naturalHeight*s;ctx.filter=filterStr(e.fl);ctx.translate(w/2+(e.ox||0)*w,h/2+(e.oy||0)*h);ctx.scale(e.fx?-1:1,e.fy?-1:1);ctx.drawImage(im,-iw/2,-ih/2,iw,ih)}else{ctx.fillStyle='#e2e8f0';ctx.fillRect(0,0,w,h)}ctx.restore();if(e.stroke&&e.sw){ctx.strokeStyle=e.stroke;ctx.lineWidth=e.sw;ctx.stroke(cp)}}
 ctx.restore()}
function render(ctx,D,W,H){ctx.clearRect(0,0,W,H);bgDraw(ctx,D,W,H);D.els.forEach(function(e){drawEl(ctx,e)})}
SD.render=render;SD.drawEl=drawEl;SD.bgDraw=bgDraw;
/* ---------- واجهة ---------- */
var root,cv,ov,cx,ox,wrap;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ui(){
 root.innerHTML='<div class="st-top"><div class="st-grp"><select id="st-size" title="مقاس التصميم"></select><button id="st-undo" title="تراجع">↶</button><button id="st-redo" title="إعادة">↷</button></div>'+
 '<div class="st-grp"><button id="st-zo">−</button><span id="st-zv">100%</span><button id="st-zi">+</button><button id="st-fit">ملاءمة</button></div>'+
 '<div class="st-grp"><button id="st-new">جديد</button><button id="st-save">💾 حفظ</button><button id="st-open">📂 فتح</button><button id="st-video" title="أرسل التصميم كمشهد لاستوديو الفيديو">🎬 إلى الفيديو</button><select id="st-exp"><option value="">⬇️ تصدير…</option><option value="png">PNG</option><option value="png2">PNG عالي الدقة ×2</option><option value="jpg">JPG</option><option value="pdf">PDF</option><option value="webp">WebP</option></select></div></div>'+
 '<div class="st-main"><aside class="st-left"><div class="st-tabs" id="st-tabs"></div><div class="st-pane" id="st-pane"></div></aside><section class="st-stage" id="st-stage"><div class="st-cwrap" id="st-cw"><canvas id="st-cv"></canvas><canvas id="st-ov"></canvas></div></section><aside class="st-right" id="st-props"></aside></div>'+
 '<input type="file" id="st-file" accept="image/*" multiple hidden><input type="file" id="st-proj" accept=".json,application/json" hidden>';
 cv=$('#st-cv');ov=$('#st-ov');cx=cv.getContext('2d');ox=ov.getContext('2d');wrap=$('#st-cw');
 var s=$('#st-size');s.innerHTML=SD.sizes.map(function(z,i){return'<option value="'+i+'">'+z[0]+' — '+z[1]+'×'+z[2]+'</option>'}).join('')+'<option value="c">مقاس مخصص…</option>';
 s.onchange=function(){if(s.value==='c'){var w=+prompt('العرض بالبكسل','1080'),h=+prompt('الارتفاع بالبكسل','1080');if(w>50&&h>50)resize(Math.min(w,6000),Math.min(h,6000))}else{var z=SD.sizes[+s.value];resize(z[1],z[2])}};
 $('#st-undo').onclick=undo;$('#st-redo').onclick=redo;$('#st-zi').onclick=function(){setZoom(zoom*1.2)};$('#st-zo').onclick=function(){setZoom(zoom/1.2)};$('#st-fit').onclick=fit;
 $('#st-new').onclick=function(){if(confirm('بدء تصميم جديد؟ سيُفقد غير المحفوظ.')){D=newDesign(D.w,D.h);sel=[];push();fit();ptabs();props()}};
 $('#st-save').onclick=function(){save(true)};$('#st-open').onclick=function(){$('#st-proj').click()};
 $('#st-proj').onchange=function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{D=JSON.parse(r.result);D.assets=D.assets||{};IM={};sel=[];push();fit();props()}catch(e){alert('ملف مشروع غير صالح')}};r.readAsText(f);this.value=''};
 $('#st-exp').onchange=function(){var v=this.value;this.value='';if(v)exportAs(v)};
 $('#st-video').onclick=toVideo;
 $('#st-file').onchange=function(){var fs=[].slice.call(this.files);this.value='';fs.forEach(readImg)};
 var tabs=[['tpl','🎨 قوالب'],['text','🔤 نص'],['shape','◼ أشكال'],['icon','⭐ أيقونات'],['img','🖼️ صور'],['bg','🌈 خلفية'],['lay','🗂 طبقات']];
 $('#st-tabs').innerHTML=tabs.map(function(t){return'<button data-t="'+t[0]+'">'+t[1]+'</button>'}).join('');
 $$('#st-tabs button').forEach(function(b){b.onclick=function(){tab=b.dataset.t;ptabs()}});
 ov.addEventListener('pointerdown',pdown);window.addEventListener('pointermove',pmove);window.addEventListener('pointerup',pup);ov.addEventListener('dblclick',function(){var t=$('#p-text');if(t){t.focus();t.select()}});
 document.addEventListener('keydown',key);window.addEventListener('resize',function(){});
 ov.addEventListener('wheel',function(ev){if(ev.ctrlKey){ev.preventDefault();setZoom(zoom*(ev.deltaY<0?1.1:.9))}},{passive:false});
 window.addEventListener('paste',function(ev){if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;var it=(ev.clipboardData||{}).items||[];for(var i=0;i<it.length;i++)if(it[i].type.indexOf('image')===0){readImg(it[i].getAsFile())}});
}
var tab='tpl';
function readImg(f){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var max=2400,sc=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight));var c=document.createElement('canvas');c.width=im.naturalWidth*sc;c.height=im.naturalHeight*sc;c.getContext('2d').drawImage(im,0,0,c.width,c.height);var url=c.toDataURL(f.type==='image/png'?'image/png':'image/jpeg',.9);var k=addAsset(url);UP.push(k);addImage(k,im.naturalWidth/im.naturalHeight);if(tab==='img')ptabs()};im.src=r.result};r.readAsDataURL(f)}
var UP=[];
function addImage(k,ar){var ph=sel.length===1&&byId(sel[0])&&byId(sel[0]).ph?byId(sel[0]):null;if(ph){ph.type='image';ph.src=k;ph.clip=ph.k||'round';delete ph.fill;delete ph.ph;push();draw();props();return}
 var w=Math.min(D.w*.6,D.h*.6*ar),h=w/ar;var e={id:nid(),type:'image',x:(D.w-w)/2,y:(D.h-h)/2,w:w,h:h,src:k,clip:'rect',name:'صورة'};D.els.push(e);sel=[e.id];push();draw();props()}
function byId(id){return D.els.filter(function(e){return e.id===id})[0]}
function selEls(){return sel.map(byId).filter(Boolean)}
/* ---------- تبويبات اليسار ---------- */
function ptabs(){$$('#st-tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.t===tab)});var p=$('#st-pane');
 if(tab==='tpl')pTpl(p);else if(tab==='text')pText(p);else if(tab==='shape')pShape(p);else if(tab==='icon')pIcon(p);else if(tab==='img')pImg(p);else if(tab==='bg')pBg(p);else pLay(p)}
var tplCat='all';
function pTpl(p){var cats=[['all','الكل'],['post','منشورات'],['story','ستوري'],['video','يوتيوب'],['brand','هوية']];p.innerHTML='<div class="st-chips">'+cats.map(function(c){return'<button class="'+(tplCat===c[0]?'on':'')+'" data-c="'+c[0]+'">'+c[1]+'</button>'}).join('')+'</div><p class="st-hint">اضغط قالبًا لتطبيقه على المقاس الحالي.</p><div class="st-tgrid" id="st-tg"></div>';
 $$('.st-chips button',p).forEach(function(b){b.onclick=function(){tplCat=b.dataset.c;pTpl(p)}});var g=$('#st-tg');
 SD.templates.filter(function(t){return tplCat==='all'||t.cat===tplCat}).forEach(function(t){var c=document.createElement('canvas');var aw=300,ah=Math.round(300*D.h/D.w);if(ah>420){ah=420;aw=Math.round(420*D.w/D.h)}c.width=aw;c.height=ah;var b=document.createElement('button');b.className='st-tcard';b.title=t.n;b.appendChild(c);var d=SD.build(t,D.w,D.h),dd={w:D.w,h:D.h,bg:d.bg,els:norm(d.els),assets:{}};var x=c.getContext('2d');x.scale(aw/D.w,ah/D.h);render(x,dd,D.w,D.h);var s=document.createElement('span');s.textContent=t.n;b.appendChild(s);b.onclick=function(){applyTpl(t)};g.appendChild(b)})}
function norm(els){return els.map(function(e){var o=Object.assign({id:nid(),op:1,rot:0},e);if(o.type==='text'){o.ff=o.ff||'Cairo';loadFont(o.ff);if(o.op==null)o.op=1}if(o.stroke&&o.type==='text'&&!o.sw)o.sw=2;return o})}
function applyTpl(t){var d=SD.build(t,D.w,D.h);D.bg=d.bg;D.els=norm(d.els);sel=[];D.els.forEach(function(e){e.ff&&loadFont(e.ff)});push();draw();props()}
function pText(p){var pre=[['إضافة عنوان','h',64,'Cairo','900'],['إضافة عنوان فرعي','s',40,'Tajawal','700'],['إضافة نص عادي','b',28,'Almarai','400'],['نص بإطار','o',72,'Lalezar','700','#ffffff','#000000'],['نص نيون','n',60,'Cairo','900','#22d3ee',null,{c:'#22d3ee',b:24,x:0,y:0}],['نص بخلفية','bg',44,'Cairo','700','#ffffff',null,null,'#7c3aed'],['نص ذهبي','g',70,'Reem Kufi','700',{g:['#fde68a','#d97706',90]}],['خط يدوي','hand',64,'Aref Ruqaa','700'],['إنجليزي أنيق','en',64,'Playfair Display','700'],['إنجليزي عريض','en2',80,'Bebas Neue','400']];
 p.innerHTML='<div class="st-list">'+pre.map(function(a,i){return'<button class="st-pre" data-i="'+i+'" style="font-family:\''+a[3]+'\';font-weight:'+a[4]+'">'+a[0]+'</button>'}).join('')+'</div><h4>الخطوط</h4><input class="st-search" id="st-fs" placeholder="ابحث عن خط…"><div class="st-fonts" id="st-fl"></div>';
 $$('.st-pre',p).forEach(function(b){b.onclick=function(){var a=pre[+b.dataset.i];loadFont(a[3]);var e={id:nid(),type:'text',t:a[0].replace('إضافة ',''),x:D.w*.1,y:D.h*.4,w:D.w*.8,fs:a[2]*(D.w/1080),ff:a[3],fw:a[4],col:a[5]||'#111827',ta:'center',lh:1.25,op:1,rot:0};if(a[6]){e.stroke=a[6];e.sw=a[2]*.05}if(a[7])e.sh=a[7];if(a[8])e.tbg=a[8];e.h=e.fs*1.4;D.els.push(e);sel=[e.id];push();draw();props()}});
 function fl(q){var h='';SD.fonts.forEach(function(f){if(q&&f[0].toLowerCase().indexOf(q.toLowerCase())<0)return;h+='<button class="st-font" data-f="'+f[0]+'" style="font-family:\''+f[0]+'\'">'+f[0]+' <small>'+f[1]+'</small></button>'});$('#st-fl').innerHTML=h;$$('.st-font').forEach(function(b){loadFont(b.dataset.f);b.onclick=function(){var t=selEls().filter(function(e){return e.type==='text'});if(!t.length){alert('حدّد عنصر نص أولًا');return}t.forEach(function(e){e.ff=b.dataset.f});loadFont(b.dataset.f);push();draw();props()}})}
 fl('');$('#st-fs').oninput=function(){fl(this.value)}}
function addShape(k){var m=Math.min(D.w,D.h)*.3;var e={id:nid(),type:'shape',k:k,x:(D.w-m)/2,y:(D.h-m)/2,w:k==='line'?m*1.5:m,h:k==='line'?m*.1:m,fill:{g:['#7c3aed','#06b6d4',135]},op:1,rot:0};if(k==='line')e.fill='#111827';D.els.push(e);sel=[e.id];push();draw();props()}
function pShape(p){p.innerHTML='<div class="st-igrid" id="st-sg"></div>';SD.shapes.forEach(function(s){var b=document.createElement('button');b.title=s[1];var c=document.createElement('canvas');c.width=c.height=56;var x=c.getContext('2d');x.translate(6,6);var ph=SD.shapePath(s[0],44,s[0]==='line'?10:44,10);x.fillStyle='#7c3aed';x.fill(ph,'evenodd');b.appendChild(c);b.onclick=function(){addShape(s[0])};$('#st-sg').appendChild(b)})}
function addIcon(name,isEmoji){var m=Math.min(D.w,D.h)*.2;var e={id:nid(),type:'icon',ic:name,x:(D.w-m)/2,y:(D.h-m)/2,w:m,h:m,col:'#7c3aed',op:1,rot:0};D.els.push(e);sel=[e.id];push();draw();props()}
function pIcon(p){var h='<h4>أيقونات متجهية (تتلوّن)</h4><div class="st-igrid">';SD.icons.forEach(function(i){h+='<button data-i="'+i[0]+'" title="'+i[0]+'"><svg viewBox="0 0 24 24" width="30" height="30" fill="'+(i[2]?'none':'#334155')+'" stroke="'+(i[2]?'#334155':'none')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="'+i[1]+'"/></svg></button>'});h+='</div>';
 Object.keys(SD.emoji).forEach(function(k){h+='<h4>'+k+'</h4><div class="st-igrid">'+SD.emoji[k].split(' ').map(function(e){return'<button data-i="'+e+'" class="em">'+e+'</button>'}).join('')+'</div>'});p.innerHTML=h;$$('button[data-i]',p).forEach(function(b){b.onclick=function(){addIcon(b.dataset.i)}})}
function pImg(p){p.innerHTML='<button class="st-big" id="st-up">⬆️ رفع صور من جهازك</button><p class="st-hint">يمكنك أيضًا لصق صورة (Ctrl+V). حدّد شكلًا بعلامة «مكان صورة» ثم ارفع صورة لتوضع داخله.</p><div class="st-igrid big" id="st-ug"></div>';$('#st-up').onclick=function(){$('#st-file').click()};UP.forEach(function(k){if(!D.assets[k])return;var b=document.createElement('button');var im=document.createElement('img');im.src=D.assets[k];b.appendChild(im);b.onclick=function(){var i=getImg(k);addImage(k,(i&&i.naturalWidth)?i.naturalWidth/i.naturalHeight:1.5)};$('#st-ug').appendChild(b)})}
function setBg(b){D.bg=b;push();draw();props()}
function pBg(p){var h='<h4>لون ثابت</h4><div class="st-sw">'+SD.swatches.map(function(c){return'<button data-c="'+c+'" style="background:'+c+'"></button>'}).join('')+'<input type="color" id="st-bgc" value="#ffffff" title="لون مخصص"></div><h4>تدرجات</h4><div class="st-gr">'+SD.grads.map(function(g,i){return'<button data-g="'+i+'" style="background:linear-gradient('+g[2]+'deg,'+g[0]+','+g[1]+')"></button>'}).join('')+'</div><h4>أنماط</h4><div class="st-row"><label>لون النمط <input type="color" id="st-pc" value="#c4b5fd"></label><label>الخلفية <input type="color" id="st-pb" value="#f5f3ff"></label><label>الحجم <input type="range" id="st-ps" min="24" max="160" value="60"></label></div><div class="st-chips pats">'+SD.pats.map(function(x){return'<button data-p="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div><h4>صورة خلفية</h4><button class="st-big" id="st-bgi">⬆️ رفع صورة كخلفية</button>';p.innerHTML=h;
 $$('[data-c]',p).forEach(function(b){b.onclick=function(){setBg({t:'solid',c:[b.dataset.c]})}});$('#st-bgc').oninput=function(){D.bg={t:'solid',c:[this.value]};draw()};$('#st-bgc').onchange=function(){push()};
 $$('[data-g]',p).forEach(function(b){b.onclick=function(){setBg({t:'grad',c:SD.grads[+b.dataset.g].slice()})}});
 $$('[data-p]',p).forEach(function(b){b.onclick=function(){setBg({t:'pat',c:[$('#st-pb').value,$('#st-pc').value,b.dataset.p,+$('#st-ps').value]})}});
 $('#st-bgi').onclick=function(){var i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=function(){var f=i.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var k=addAsset(r.result);setBg({t:'img',src:k})};r.readAsDataURL(f)};i.click()}}
function pLay(p){var L=D.els.slice().reverse();p.innerHTML='<div class="st-lay">'+(L.length?L.map(function(e){var n=e.type==='text'?(e.t||'').slice(0,18):e.type==='image'?'🖼 صورة':e.type==='icon'?(e.ic.length<3?e.ic:'أيقونة '+e.ic):'◼ '+(e.name||e.k);return'<div class="st-li'+(sel.indexOf(e.id)>-1?' on':'')+'" data-id="'+e.id+'"><span class="n">'+esc(n)+'</span><button data-a="hide" title="إخفاء">'+(e.hide?'🚫':'👁')+'</button><button data-a="lock" title="قفل">'+(e.lock?'🔒':'🔓')+'</button><button data-a="up" title="للأمام">▲</button><button data-a="dn" title="للخلف">▼</button></div>'}).join(''):'<p class="st-hint">لا توجد عناصر بعد.</p>')+'</div>';
 $$('.st-li',p).forEach(function(r){var id=r.dataset.id;r.onclick=function(ev){var a=ev.target.dataset&&ev.target.dataset.a;var e=byId(id);if(a==='hide')e.hide=!e.hide;else if(a==='lock')e.lock=!e.lock;else if(a==='up')order(e,1);else if(a==='dn')order(e,-1);else{sel=[id];props()}push();draw();pLay(p)}})}
function order(e,d){var i=D.els.indexOf(e),j=Math.max(0,Math.min(D.els.length-1,i+d));D.els.splice(i,1);D.els.splice(j,0,e)}
/* ---------- لوحة الخصائص ---------- */
function row(l,inner){return'<div class="pr"><label>'+l+'</label>'+inner+'</div>'}
function colorIn(id,v){return'<input type="color" id="'+id+'" value="'+(/^#[0-9a-f]{6}$/i.test(v)?v:'#000000')+'">'}
function rng(id,v,a,b,s){return'<input type="range" id="'+id+'" min="'+a+'" max="'+b+'" step="'+(s||1)+'" value="'+v+'">'}
function props(){var P=$('#st-props'),E=selEls();if(!P)return;
 if(!E.length){P.innerHTML='<h3>الخصائص</h3><p class="st-hint">حدّد عنصرًا على اللوحة لتعديله، أو أضف من القوائم على اليمين.</p><div class="st-sc"><b>اختصارات</b><br>Delete حذف · Ctrl+Z تراجع · Ctrl+Y إعادة · Ctrl+D تكرار · Ctrl+C/V نسخ ولصق · الأسهم تحريك · Shift مع النقر لتحديد أكثر من عنصر</div>';return}
 var e=E[0],h='<h3>'+(E.length>1?E.length+' عناصر':e.type==='text'?'نص':e.type==='image'?'صورة':e.type==='icon'?'أيقونة':'شكل')+'</h3><div class="pb">';
 h+='<button data-a="dup">⧉ تكرار</button><button data-a="del">🗑 حذف</button><button data-a="fr">⬆ للأمام</button><button data-a="bk">⬇ للخلف</button><button data-a="fl">⇋ قلب</button></div><div class="pb">'+['l:⇤','c:↔','r:⇥','t:⤒','m:↕','b:⤓'].map(function(a){a=a.split(':');return'<button data-al="'+a[0]+'" title="محاذاة">'+a[1]+'</button>'}).join('')+'</div>';
 if(e.ph)h+='<button class="st-big" id="p-ph">📷 ضع صورة داخل هذا المكان</button>';
 if(e.type==='text'){h+=row('النص','<textarea id="p-text" rows="3">'+esc(e.t||'')+'</textarea>')+row('الخط','<select id="p-ff">'+SD.fonts.map(function(f){return'<option'+(f[0]===e.ff?' selected':'')+'>'+f[0]+'</option>'}).join('')+'</select>')+row('الحجم','<input type="number" id="p-fs" value="'+Math.round(e.fs)+'" min="6" max="600">'+rng('p-fsr',Math.round(e.fs),6,400))+row('اللون',colorIn('p-col',typeof e.col==='string'?e.col:'#000000'))+'<div class="pb"><button data-t="fw" class="'+(e.fw==='700'||e.fw==='900'?'on':'')+'"><b>B</b></button><button data-t="fi" class="'+(e.fi?'on':'')+'"><i>I</i></button><button data-t="ul" class="'+(e.ul?'on':'')+'"><u>U</u></button><button data-ta="right" class="'+(e.ta==='right'?'on':'')+'">يمين</button><button data-ta="center" class="'+(e.ta==='center'?'on':'')+'">وسط</button><button data-ta="left" class="'+(e.ta==='left'?'on':'')+'">يسار</button></div>'+row('ارتفاع السطر',rng('p-lh',e.lh||1.25,.8,2.5,.05))+row('تباعد الحروف',rng('p-ls',e.ls||0,-5,40,.5))+row('عرض الصندوق',rng('p-w',Math.round(e.w),50,D.w))+row('خلفية النص','<input type="checkbox" id="p-tbgc" '+(e.tbg?'checked':'')+'>'+colorIn('p-tbg',e.tbg||'#7c3aed'))}
 if(e.type==='shape'){var g=e.fill&&typeof e.fill==='object';h+=row('النوع','<select id="p-k">'+SD.shapes.map(function(s){return'<option value="'+s[0]+'"'+(s[0]===e.k?' selected':'')+'>'+s[1]+'</option>'}).join('')+'</select>')+row('تعبئة','<select id="p-ft"><option value="s"'+(g?'':' selected')+'>لون</option><option value="g"'+(g?' selected':'')+'>تدرج</option><option value="n">بدون</option></select>')+row('اللون 1',colorIn('p-f1',g?e.fill.g[0]:(e.fill||'#ffffff')))+(g?row('اللون 2',colorIn('p-f2',e.fill.g[1]))+row('الزاوية',rng('p-fa',e.fill.g[2],0,360)):'')+row('استدارة الزوايا',rng('p-r',Math.round(e.r||0),0,Math.round(Math.min(e.w,e.h)/2)))}
 if(e.type==='icon'){h+=row('اللون',colorIn('p-col',e.col||'#000000'))}
 if(e.type==='image'){var f=e.fl||{};h+=row('الشكل','<select id="p-clip">'+['rect:مستطيل','round:مدوّر','ellipse:دائرة','heart:قلب','hex:سداسي','star5:نجمة','blob:عضوي','diamond:معين','badge:ختم'].map(function(s){s=s.split(':');return'<option value="'+s[0]+'"'+((e.clip||'rect')===s[0]?' selected':'')+'>'+s[1]+'</option>'}).join('')+'</select>')+row('تكبير/قص',rng('p-z',e.z||1,1,4,.05))+row('إزاحة أفقية',rng('p-ox',e.ox||0,-1,1,.01))+row('إزاحة رأسية',rng('p-oy',e.oy||0,-1,1,.01))+'<h4>فلاتر</h4><div class="pb fl">'+[['none','أصلي'],['bw','أبيض وأسود'],['vint','قديم'],['warm','دافئ'],['cool','بارد'],['vivid','حيوي'],['fade','باهت'],['drama','درامي']].map(function(x){return'<button data-fp="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'+row('السطوع',rng('f-b',f.b==null?100:f.b,0,200))+row('التباين',rng('f-c',f.c==null?100:f.c,0,200))+row('التشبّع',rng('f-s',f.s==null?100:f.s,0,300))+row('ضبابية',rng('f-bl',f.bl||0,0,20,.5))+row('تدرج رمادي',rng('f-g',f.g||0,0,100))+row('سيبيا',rng('f-se',f.se||0,0,100))+row('تدوير اللون',rng('f-h',f.h||0,0,360))+'<div class="pb"><button data-t="fx" class="'+(e.fx?'on':'')+'">قلب أفقي</button><button data-t="fy" class="'+(e.fy?'on':'')+'">قلب رأسي</button></div><button class="st-big" id="p-rep">استبدال الصورة</button>'}
 if(e.type!=='icon'||1){h+=row('الشفافية',rng('p-op',Math.round((e.op==null?1:e.op)*100),0,100))+row('الدوران',rng('p-rot',Math.round(e.rot||0),-180,180))}
 if(e.type==='shape'||e.type==='text'||e.type==='image'){h+=row('إطار','<input type="checkbox" id="p-stc" '+(e.stroke?'checked':'')+'>'+colorIn('p-st',e.stroke||'#000000')+rng('p-sw',e.sw||0,0,40,.5))}
 h+=row('ظل','<input type="checkbox" id="p-shc" '+(e.sh?'checked':'')+'>'+colorIn('p-shcol',e.sh&&/^#/.test(e.sh.c)?e.sh.c:'#000000')+rng('p-shb',e.sh?e.sh.b:20,0,80)+rng('p-shy',e.sh?e.sh.y:8,-40,40));
 P.innerHTML=h;wireProps(E)}
function each(E,fn){E.forEach(fn)}
function wireProps(E){var e=E[0];var P=$('#st-props');
 function on(id,fn,commit){var el=$('#'+id);if(!el)return;el.oninput=function(){fn(el.type==='checkbox'?el.checked:el.value,el);draw()};el.onchange=function(){push();if(commit)props()}}
 $$('[data-a]',P).forEach(function(b){b.onclick=function(){var a=b.dataset.a;if(a==='del')del();else if(a==='dup')dup();else if(a==='fr'){E.forEach(function(x){order(x,999)})}else if(a==='bk'){E.forEach(function(x){order(x,-999)})}else if(a==='fl'){E.forEach(function(x){x.fx=!x.fx})}push();draw();props()}});
 $$('[data-al]',P).forEach(function(b){b.onclick=function(){var a=b.dataset.al;each(E,function(x){if(a==='l')x.x=0;if(a==='r')x.x=D.w-x.w;if(a==='c')x.x=(D.w-x.w)/2;if(a==='t')x.y=0;if(a==='b')x.y=D.h-x.h;if(a==='m')x.y=(D.h-x.h)/2});push();draw()}});
 $$('[data-t]',P).forEach(function(b){b.onclick=function(){var k=b.dataset.t;each(E,function(x){if(k==='fw')x.fw=(x.fw==='700'||x.fw==='900')?'400':'700';else x[k]=!x[k]});push();draw();props()}});
 $$('[data-ta]',P).forEach(function(b){b.onclick=function(){each(E,function(x){x.ta=b.dataset.ta});push();draw();props()}});
 if($('#p-ph'))$('#p-ph').onclick=function(){$('#st-file').click()};
 on('p-text',function(v){e.t=v});on('p-ff',function(v){each(E,function(x){x.ff=v});loadFont(v)});
 on('p-fs',function(v){each(E,function(x){x.fs=+v});$('#p-fsr').value=v});on('p-fsr',function(v){each(E,function(x){x.fs=+v});$('#p-fs').value=v});
 on('p-col',function(v){each(E,function(x){x.col=v})});on('p-lh',function(v){each(E,function(x){x.lh=+v})});on('p-ls',function(v){each(E,function(x){x.ls=+v})});on('p-w',function(v){each(E,function(x){x.w=+v})});
 on('p-tbgc',function(v){e.tbg=v?$('#p-tbg').value:null});on('p-tbg',function(v){e.tbg=v;$('#p-tbgc').checked=true});
 on('p-k',function(v){e.k=v},1);
 function fill(){var t=$('#p-ft').value,c1=$('#p-f1').value,c2=$('#p-f2')?$('#p-f2').value:'#06b6d4',a=$('#p-fa')?+$('#p-fa').value:135;e.fill=t==='n'?null:t==='g'?{g:[c1,c2,a]}:c1}
 on('p-ft',function(){fill();draw()},1);on('p-f1',fill);on('p-f2',fill);on('p-fa',fill);on('p-r',function(v){e.r=+v});
 on('p-clip',function(v){e.clip=v});on('p-z',function(v){e.z=+v});on('p-ox',function(v){e.ox=+v});on('p-oy',function(v){e.oy=+v});
 ['b','c','s','bl','g','se','h'].forEach(function(k){on('f-'+k,function(v){e.fl=e.fl||{};e.fl[k]=+v})});
 $$('[data-fp]',P).forEach(function(b){b.onclick=function(){var m={none:{},bw:{g:100,c:110},vint:{se:60,c:90,b:105,s:80},warm:{se:25,s:130,h:350,b:105},cool:{h:20,s:110,b:100,c:105},vivid:{s:170,c:115},fade:{c:80,b:115,s:85},drama:{c:150,b:90,s:110}};e.fl=Object.assign({},m[b.dataset.fp]);push();draw();props()}});
 if($('#p-rep'))$('#p-rep').onclick=function(){var i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=function(){var f=i.files[0];if(!f)return;var r=new FileReader();r.onload=function(){e.src=addAsset(r.result);push();draw()};r.readAsDataURL(f)};i.click()};
 on('p-op',function(v){each(E,function(x){x.op=v/100})});on('p-rot',function(v){each(E,function(x){x.rot=+v})});
 function st(){each(E,function(x){if($('#p-stc').checked){x.stroke=$('#p-st').value;x.sw=+$('#p-sw').value}else{x.stroke=null;x.sw=0}})}
 on('p-stc',st);on('p-st',function(){$('#p-stc').checked=true;st()});on('p-sw',function(){$('#p-stc').checked=true;st()});
 function shd(){each(E,function(x){x.sh=$('#p-shc').checked?{c:$('#p-shcol').value,b:+$('#p-shb').value,x:0,y:+$('#p-shy').value}:null})}
 on('p-shc',shd);on('p-shcol',function(){$('#p-shc').checked=true;shd()});on('p-shb',function(){$('#p-shc').checked=true;shd()});on('p-shy',function(){$('#p-shc').checked=true;shd()})}
function del(){D.els=D.els.filter(function(e){return sel.indexOf(e.id)<0||e.lock});sel=[];push();draw();props()}
function dup(){var n=[];selEls().forEach(function(e){var c=clone(e);c.id=nid();c.x+=D.w*.03;c.y+=D.w*.03;D.els.push(c);n.push(c.id)});sel=n;push();draw();props()}
/* ---------- تفاعل ---------- */
function pt(ev){var r=ov.getBoundingClientRect();return{x:(ev.clientX-r.left)/r.width*D.w,y:(ev.clientY-r.top)/r.height*D.h}}
function loc(e,p){var cxx=e.x+e.w/2,cyy=e.y+e.h/2,a=-(e.rot||0)*Math.PI/180,dx=p.x-cxx,dy=p.y-cyy;return{x:dx*Math.cos(a)-dy*Math.sin(a),y:dx*Math.sin(a)+dy*Math.cos(a)}}
function hit(p){for(var i=D.els.length-1;i>=0;i--){var e=D.els[i];if(e.hide||e.lock)continue;var l=loc(e,p);if(Math.abs(l.x)<=e.w/2&&Math.abs(l.y)<=e.h/2)return e}return null}
var HS=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
function handleAt(p){var E=selEls();if(E.length!==1)return null;var e=E[0],l=loc(e,p),s=12/zoom;if(Math.hypot(l.x,l.y+e.h/2+34/zoom)<s)return{rot:1};for(var i=0;i<8;i++){var hx=HS[i][0]*e.w/2,hy=HS[i][1]*e.h/2;if(Math.abs(l.x-hx)<s&&Math.abs(l.y-hy)<s)return{h:HS[i]}}return null}
function pdown(ev){ev.preventDefault();ov.setPointerCapture&&ov.setPointerCapture(ev.pointerId);var p=pt(ev),ha=handleAt(p);
 if(ha){var e=selEls()[0];drag=ha.rot?{m:'rot',e:e}:{m:'rs',e:e,h:ha.h,o:clone(e)};return}
 var e2=hit(p);if(!e2){if(!ev.shiftKey)sel=[];drag=null;props();draw();return}
 if(ev.shiftKey){var i=sel.indexOf(e2.id);if(i>-1)sel.splice(i,1);else sel.push(e2.id)}else if(sel.indexOf(e2.id)<0)sel=[e2.id];
 drag={m:'mv',p0:p,o:selEls().map(function(x){return{e:x,x:x.x,y:x.y}}),moved:0};props();draw();if(tab==='lay')pLay($('#st-pane'))}
function pmove(ev){if(!drag){if(ev.target===ov){var p=pt(ev),ha=handleAt(p);ov.style.cursor=ha?(ha.rot?'grab':'nwse-resize'):(hit(p)?'move':'default')}return}
 var p=pt(ev);guides=[];
 if(drag.m==='mv'){var dx=p.x-drag.p0.x,dy=p.y-drag.p0.y;drag.moved=1;var th=8/zoom;drag.o.forEach(function(o){o.e.x=o.x+dx;o.e.y=o.y+dy});if(drag.o.length===1&&!ev.altKey){var e=drag.o[0].e,ecx=e.x+e.w/2,ecy=e.y+e.h/2;if(Math.abs(ecx-D.w/2)<th){e.x=D.w/2-e.w/2;guides.push(['v',D.w/2])}if(Math.abs(ecy-D.h/2)<th){e.y=D.h/2-e.h/2;guides.push(['h',D.h/2])}if(Math.abs(e.x)<th){e.x=0;guides.push(['v',0])}if(Math.abs(e.x+e.w-D.w)<th){e.x=D.w-e.w;guides.push(['v',D.w])}if(Math.abs(e.y)<th){e.y=0;guides.push(['h',0])}if(Math.abs(e.y+e.h-D.h)<th){e.y=D.h-e.h;guides.push(['h',D.h])}}}
 else if(drag.m==='rot'){var e=drag.e,c={x:e.x+e.w/2,y:e.y+e.h/2},a=Math.atan2(p.y-c.y,p.x-c.x)*180/Math.PI+90;if(ev.shiftKey)a=Math.round(a/15)*15;e.rot=Math.round(a*10)/10}
 else if(drag.m==='rs'){var e=drag.e,o=drag.o,h=drag.h,l=loc(o,p);var ow=o.w,oh=o.h;var nw=ow,nh=oh;if(h[0])nw=Math.max(20,h[0]*l.x*2/1);if(h[1])nh=Math.max(10,h[1]*l.y*2/1);
  // الزاوية تحافظ على النسبة
  if(h[0]&&h[1]&&(e.type!=='shape'||ev.shiftKey)){var s=Math.max(nw/ow,nh/oh);nw=ow*s;nh=oh*s}
  // نقطة الارتكاز: الحافة المقابلة
  var ax=-h[0]*ow/2,ay=-h[1]*oh/2;var ex=-h[0]*nw/2,ey=-h[1]*nh/2;var a=(o.rot||0)*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);var ocx=o.x+ow/2,ocy=o.y+oh/2;var ap={x:ocx+ax*ca-ay*sa,y:ocy+ax*sa+ay*ca};var ncx=ap.x-(ex*ca-ey*sa),ncy=ap.y-(ex*sa+ey*ca);
  if(e.type==='text'){if(h[0]&&h[1]){e.fs=Math.max(6,o.fs*nw/ow);e.w=nw}else if(h[0])e.w=nw;e.x=ncx-e.w/2;e.y=ncy-e.h/2;if(h[1]&&!h[0]){e.y=o.y}else{}}else{e.w=nw;e.h=nh;e.x=ncx-nw/2;e.y=ncy-nh/2}}
 draw()}
function pup(){if(!drag)return;var d=drag;drag=null;guides=[];if(d.m!=='mv'||d.moved)push();draw();props()}
function key(ev){if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)||!root||!root.isConnected)return;var k=ev.key,c=ev.ctrlKey||ev.metaKey;
 if(k==='Delete'||k==='Backspace'){if(sel.length){ev.preventDefault();del()}}
 else if(c&&k.toLowerCase()==='z'){ev.preventDefault();ev.shiftKey?redo():undo()}else if(c&&k.toLowerCase()==='y'){ev.preventDefault();redo()}
 else if(c&&k.toLowerCase()==='d'){ev.preventDefault();dup()}
 else if(c&&k.toLowerCase()==='c'){clip=clone(selEls())}
 else if(c&&k.toLowerCase()==='v'&&clip&&clip.length){var n=[];clip.forEach(function(e){var x=clone(e);x.id=nid();x.x+=D.w*.03;x.y+=D.w*.03;D.els.push(x);n.push(x.id)});sel=n;push();draw();props()}
 else if(c&&k.toLowerCase()==='a'){ev.preventDefault();sel=D.els.map(function(e){return e.id});draw();props()}
 else if(k==='Escape'){sel=[];draw();props()}
 else if(k.indexOf('Arrow')===0&&sel.length){ev.preventDefault();var s=ev.shiftKey?10:1;selEls().forEach(function(e){if(k==='ArrowLeft')e.x-=s;if(k==='ArrowRight')e.x+=s;if(k==='ArrowUp')e.y-=s;if(k==='ArrowDown')e.y+=s});draw();clearTimeout(key.t);key.t=setTimeout(push,400)}}
/* ---------- رسم الشاشة ---------- */
function draw(){if(!cv)return;render(cx,D,D.w,D.h);ox.clearRect(0,0,D.w,D.h);var E=selEls();var lw=2/zoom;ox.lineWidth=lw;
 guides.forEach(function(g){ox.strokeStyle='#f43f5e';ox.beginPath();if(g[0]==='v'){ox.moveTo(g[1],0);ox.lineTo(g[1],D.h)}else{ox.moveTo(0,g[1]);ox.lineTo(D.w,g[1])}ox.stroke()});
 E.forEach(function(e){ox.save();ox.translate(e.x+e.w/2,e.y+e.h/2);ox.rotate((e.rot||0)*Math.PI/180);ox.strokeStyle='#7c3aed';ox.strokeRect(-e.w/2,-e.h/2,e.w,e.h);if(E.length===1&&!e.lock){var s=10/zoom;ox.fillStyle='#fff';HS.forEach(function(h){ox.beginPath();ox.rect(h[0]*e.w/2-s/2,h[1]*e.h/2-s/2,s,s);ox.fill();ox.stroke()});ox.beginPath();ox.moveTo(0,-e.h/2);ox.lineTo(0,-e.h/2-34/zoom);ox.stroke();ox.beginPath();ox.arc(0,-e.h/2-34/zoom,s*.65,0,6.3);ox.fill();ox.stroke()}ox.restore()});
 clearTimeout(draw.t);draw.t=setTimeout(autosave,900)}
function setZoom(z){zoom=Math.max(.05,Math.min(4,z));cv.style.width=ov.style.width=D.w*zoom+'px';cv.style.height=ov.style.height=D.h*zoom+'px';wrap.style.width=D.w*zoom+'px';wrap.style.height=D.h*zoom+'px';$('#st-zv').textContent=Math.round(zoom*100)+'%';draw()}
function fit(){var st=$('#st-stage');var z=Math.min((st.clientWidth-40)/D.w,(st.clientHeight-40)/D.h);setZoom(Math.max(.05,z))}
function resize(w,h){var sx=w/D.w,sy=h/D.h,s=Math.min(sx,sy);D.els.forEach(function(e){e.x*=sx;e.y*=sy;e.w*=sx;e.h*=sy;if(e.type==='text'){e.fs*=s}});D.w=w;D.h=h;cv.width=ov.width=w;cv.height=ov.height=h;push();fit()}
/* ---------- تاريخ وحفظ ---------- */
function snap(){var o=clone(D);o.assets={};return JSON.stringify(o)}
function push(){var s=snap();if(hist[hp]===s)return;hist=hist.slice(0,hp+1);hist.push(s);if(hist.length>80)hist.shift();hp=hist.length-1}
function restore(s){var o=JSON.parse(s);o.assets=D.assets;D=o;cv.width=ov.width=D.w;cv.height=ov.height=D.h;sel=sel.filter(byId);setZoom(zoom);props()}
function undo(){if(hp>0){hp--;restore(hist[hp])}}function redo(){if(hp<hist.length-1){hp++;restore(hist[hp])}}
function autosave(){save(false)}
function save(manual){try{localStorage.setItem('dh_studio',JSON.stringify(D));if(manual)toast('تم الحفظ في المتصفح ✅')}catch(e){if(manual){var b=new Blob([JSON.stringify(D)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='design.json';a.click();toast('الذاكرة ممتلئة: نُزِّل المشروع كملف')}}}
function toast(t){var d=document.createElement('div');d.className='st-toast';d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},2200)}
/* ---------- تصدير ---------- */
function out(scale){var c=document.createElement('canvas');c.width=Math.round(D.w*scale);c.height=Math.round(D.h*scale);var x=c.getContext('2d');x.scale(scale,scale);render(x,D,D.w,D.h);return c}
function dl(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove()}
function exportAs(t){var sc=t==='png2'?2:1;var c=out(sc);
 if(t==='png'||t==='png2')c.toBlob(function(b){dl(b,'design.png')},'image/png');
 else if(t==='webp')c.toBlob(function(b){dl(b,'design.webp')},'image/webp',.92);
 else if(t==='jpg'){var c2=document.createElement('canvas');c2.width=c.width;c2.height=c.height;var x=c2.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(c,0,0);c2.toBlob(function(b){dl(b,'design.jpg')},'image/jpeg',.93)}
 else if(t==='pdf'){var c3=document.createElement('canvas');c3.width=c.width;c3.height=c.height;var x3=c3.getContext('2d');x3.fillStyle='#fff';x3.fillRect(0,0,c.width,c.height);x3.drawImage(c,0,0);c3.toBlob(function(b){var r=new FileReader();r.onload=function(){dl(pdf(new Uint8Array(r.result),c3.width,c3.height),'design.pdf')};r.readAsArrayBuffer(b)},'image/jpeg',.93)}}
function pdf(jpg,w,h){var enc=new TextEncoder(),parts=[],off=[],len=0;function add(x){var b=typeof x==='string'?enc.encode(x):x;parts.push(b);len+=b.length}function obj(n,s){off[n]=len;add(n+' 0 obj\n'+s+'\nendobj\n')}
 var pw=w*.75,ph=h*.75;add('%PDF-1.4\n');obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,'<</Type/Pages/Kids[3 0 R]/Count 1>>');obj(3,'<</Type/Page/Parent 2 0 R/MediaBox[0 0 '+pw.toFixed(2)+' '+ph.toFixed(2)+']/Resources<</XObject<</Im0 4 0 R>>>>/Contents 5 0 R>>');
 off[4]=len;add('4 0 obj\n<</Type/XObject/Subtype/Image/Width '+w+'/Height '+h+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+jpg.length+'>>\nstream\n');add(jpg);add('\nendstream\nendobj\n');
 var cs='q '+pw.toFixed(2)+' 0 0 '+ph.toFixed(2)+' 0 0 cm /Im0 Do Q';obj(5,'<</Length '+cs.length+'>>\nstream\n'+cs+'\nendstream');
 var xr=len;add('xref\n0 6\n0000000000 65535 f \n');for(var i=1;i<=5;i++)add(('0000000000'+off[i]).slice(-10)+' 00000 n \n');add('trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n'+xr+'\n%%EOF');return new Blob(parts,{type:'application/pdf'})}
function toVideo(){var sc=Math.min(1,960/Math.max(D.w,D.h));var c=out(sc);var url=c.toDataURL('image/jpeg',.82);try{var a=JSON.parse(localStorage.getItem('dh_video_scenes')||'[]');a.push({img:url,w:c.width,h:c.height});localStorage.setItem('dh_video_scenes',JSON.stringify(a));toast('أُضيف مشهدًا لاستوديو الفيديو 🎬 ('+a.length+')')}catch(e){toast('تعذّر الإرسال: الذاكرة ممتلئة. صدّر PNG وارفعه في الفيديو')}}
/* ---------- بدء ---------- */
function init(){root=document.getElementById('studio');if(!root)return;var link=document.createElement('link');link.rel='stylesheet';link.href=SD.fontsURL;document.head.appendChild(link);ui();
 var s=null;try{s=JSON.parse(localStorage.getItem('dh_studio'))}catch(e){}
 if(s&&s.els&&(s.els.length||s.bg)&&location.hash!=='#new'){D=s;D.assets=D.assets||{}}else{D=newDesign(1080,1080);D.bg={t:'grad',c:['#7c3aed','#06b6d4',135]}}
 D.els.forEach(function(e){if(e.id){var n=+String(e.id).slice(1);if(n>=uid)uid=n+1}if(e.ff)loadFont(e.ff)});
 var q=location.search.match(/tpl=(\w+)/);cv.width=ov.width=D.w;cv.height=ov.height=D.h;
 var idx=SD.sizes.findIndex(function(z){return z[1]===D.w&&z[2]===D.h});$('#st-size').value=idx>-1?idx:'0';
 if(!D.els.length){applyTpl(SD.templates[q?Math.max(0,SD.templates.findIndex(function(t){return t.id===q[1]})):0])}
 push();ptabs();props();setTimeout(fit,60);window.addEventListener('resize',fit);
 if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',function(){draw()})}
window.Studio={init:init};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
