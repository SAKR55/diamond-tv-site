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
const aiOut=t=>'<pre class="tpl" id="pr">'+esc(t)+'</pre><div class="aibar"><a class="btn btn-g" target="_blank" rel="noopener" href="https://claude.ai/new?q='+encodeURIComponent(t)+'">افتح في Claude ↗</a><a class="btn btn-o" target="_blank" rel="noopener" href="https://chatgpt.com/?q='+encodeURIComponent(t)+'">افتح في ChatGPT ↗</a></div>'+note('الأداة تجهّز لك البرومت فقط؛ المعالجة تتم في حسابك مع الذكاء الاصطناعي. راجع المخرجات قبل الاعتماد عليها.');
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
$('rst').onclick=()=>{try{localStorage.removeItem(KEY)}catch(e){}location.reload()};
run();
'''
