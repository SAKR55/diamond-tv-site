# -*- coding: utf-8 -*-
RT = r'''
const AR='٠١٢٣٤٥٦٧٨٩';
const $=id=>document.getElementById(id);
const norm=s=>String(s).replace(/[٠-٩]/g,d=>AR.indexOf(d)).replace(/٫/g,'.').replace(/[٬,]/g,'');
const num=x=>parseFloat(norm(x))||0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=(x,d=2)=>(isFinite(x)?x:0).toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d});
const kpi=(l,v,c='')=>'<div class="kpi '+c+'"><b>'+v+'</b><span>'+l+'</span></div>';
const kpis=a=>'<div class="kpis">'+a.join('')+'</div>';
const tbl=(h,rows)=>'<table class="t"><tr>'+h.map(x=>'<th>'+x+'</th>').join('')+'</tr>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</table>';
const lines=s=>String(s).split('\n').map(x=>x.trim()).filter(Boolean).map(x=>x.split('|').map(y=>y.trim()));
const note=t=>'<p class="muted" style="margin-top:10px">'+t+'</p>';
const AIOPT={ask:0,steps:0,table:0,review:0,short:0,en:0};try{Object.assign(AIOPT,JSON.parse(localStorage.getItem('dt-ai-opt')||'{}'))}catch(e){}
const AIX={ask:'قبل أن تبدأ اسألني حتى 5 أسئلة توضيحية إن نقصت معلومة مهمة.',steps:'فكّر خطوة بخطوة واعرض الخطوات قبل النتيجة النهائية.',table:'اعرض النتيجة النهائية في جدول منظم عند الإمكان.',review:'بعد الإجابة راجع عملك بنفسك وصحّح أي خطأ أو افتراض غير مؤكد، واذكر مستوى ثقتك.',short:'اجعل الرد مركّزًا ومختصرًا دون حشو.',en:'Reply in English.'};
const AIL={ask:'اسألني أولًا',steps:'تفكير بخطوات',table:'نتيجة بجدول',review:'مراجعة ذاتية',short:'مختصر',en:'English'};
function aiScore(t){const c=[[/أنت |You are|دور/,'دور'],[/<|:\n|السياق|النشاط|الجمهور/,'سياق'],[/المهمة|اكتب|حلّل|ابنِ|اقترح|لخّص|أعد|صمم|أنشئ/,'مهمة'],[/جدول|نقاط|قائمة|الشكل|JSON|عناصر|خطوات/,'شكل'],[/لا |تجنب|بدون|القواعد|قيود|لا تخترع/,'قيود'],[/مثال|مثلًا|نموذج/,'مثال']];let n=0,miss=[];c.forEach(x=>{x[0].test(t)?n++:miss.push(x[1])});return{n:n,t:c.length,miss:miss}}
const aiOut=t0=>{let t=t0;Object.keys(AIOPT).forEach(k=>{if(AIOPT[k])t+='\n'+AIX[k]});const sc=aiScore(t),pct=Math.round(sc.n/sc.t*100),w=t.trim().split(/\s+/).length,tok=Math.round(t.length/3.2);
 const opts='<div class="aiopts"><b>طبقات احترافية:</b>'+Object.keys(AIL).map(k=>'<label class="chip'+(AIOPT[k]?' my':'')+'"><input type="checkbox" '+(AIOPT[k]?'checked ':'')+'onchange="AIOPT.'+k+'=this.checked?1:0;try{localStorage.setItem(\'dt-ai-opt\',JSON.stringify(AIOPT))}catch(e){};run()" hidden>'+AIL[k]+'</label>').join('')+'</div>';
 const meter='<div class="aimeter"><div class="bar"><i style="width:'+pct+'%"></i></div><span>جودة البرومت '+pct+'% · '+w+' كلمة · ≈'+tok+' رمز'+(sc.miss.length?' · ينقصه: '+sc.miss.join('، '):' · مكتمل ✅')+'</span></div>';
 return meter+opts+'<pre class="tpl" id="pr">'+esc(t)+'</pre><div class="aibar"><a class="btn btn-g" target="_blank" rel="noopener" href="https://claude.ai/new?q='+encodeURIComponent(t)+'">افتح في Claude ↗</a><a class="btn btn-o" target="_blank" rel="noopener" href="https://chatgpt.com/?q='+encodeURIComponent(t)+'">افتح في ChatGPT ↗</a><a class="btn btn-o" target="_blank" rel="noopener" href="https://gemini.google.com/app">Gemini ↗</a></div>'+note('الأداة تجهّز لك البرومت فقط؛ المعالجة تتم في حسابك. اطلب دائمًا مراجعة المخرجات قبل الاعتماد عليها، ولا تلصق بيانات حساسة.')};
const box=$('form');
box.innerHTML=FIELDS.map(fl=>{let c;
 if(fl.t==='select')c='<select id="'+fl.id+'">'+fl.o.map(o=>'<option value="'+esc(o[0])+'"'+(String(o[0])===String(fl.v)?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>';
 else if(fl.t==='textarea')c='<textarea id="'+fl.id+'" rows="'+(fl.r||4)+'">'+esc(fl.v||'')+'</textarea>';
 else c='<input id="'+fl.id+'" type="'+(fl.t==='date'?'date':'text')+'"'+(fl.t==='n'?' inputmode="decimal"':'')+' value="'+esc(fl.v==null?'':fl.v)+'">';
 return '<label class="field'+((fl.t==='textarea'||fl.w)?' wide':'')+'">'+esc(fl.l)+(fl.h?' <small>'+esc(fl.h)+'</small>':'')+c+'</label>'}).join('');
const KEY='dt-biz-'+SLUG;
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s)FIELDS.forEach(fl=>{if(s[fl.id]!=null&&$(fl.id))$(fl.id).value=s[fl.id]})}catch(e){}
function vals(){const v={};FIELDS.forEach(fl=>{const x=$(fl.id).value;v[fl.id]=fl.t==='n'?num(x):x});return v}
function save(){try{const s={};FIELDS.forEach(fl=>s[fl.id]=$(fl.id).value);localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function run(){try{$('out').innerHTML=compute(vals())}catch(e){$('out').textContent='تحقق من المدخلات'}save()}
box.addEventListener('input',run);box.addEventListener('change',run);
$('cpy').onclick=()=>{const t=($('pr')||$('out')).innerText;navigator.clipboard.writeText(t).then(()=>{$('cpy').textContent='✅ تم النسخ'},()=>{});setTimeout(()=>$('cpy').textContent='📋 نسخ النتيجة',1800)};
$('prt').onclick=()=>print();
if($('dl'))$('dl').onclick=()=>{const t=document.title+'\n'+location.href+'\n\n'+(($('pr')||$('out')).innerText);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+t],{type:'text/plain;charset=utf-8'}));a.download=SLUG+'.txt';a.click()};
$('rst').onclick=()=>{try{localStorage.removeItem(KEY)}catch(e){}location.reload()};

(function(){const T=$('tpls');if(!T)return;let MY=[];const MK='dt-biz-my-'+SLUG;try{MY=JSON.parse(localStorage.getItem(MK)||'[]')}catch(e){}
function apply(d){Object.keys(d).forEach(k=>{if($(k))$(k).value=d[k]});run()}
function draw(){T.innerHTML='<span class="tpl-h">قوالب جاهزة:</span>';
 PRESETS.concat(MY.map(x=>[x.n,x.d,1])).forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.className='chip'+(p[2]?' my':'');b.textContent=p[0];b.onclick=()=>apply(p[1]);T.appendChild(b)});
 const s=document.createElement('button');s.type='button';s.className='chip add';s.textContent='＋ احفظ قالبي';
 s.onclick=()=>{const n=prompt('اسم القالب؟');if(!n)return;const d={};FIELDS.forEach(fl=>d[fl.id]=$(fl.id).value);MY.push({n:'⭐ '+n,d:d});try{localStorage.setItem(MK,JSON.stringify(MY))}catch(e){}draw()};T.appendChild(s)}
draw()})();
run();
'''
