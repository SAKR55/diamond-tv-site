/* واجهة العمليات المحاسبية: أدخل العملية فتظهر الخطوات والقيود والقوانين والمستندات والضوابط */
(function(){
var A=window.ACCOPS;if(!A)return;var f=A.f;
var KW={'credit-sale':'بيع آجل مبيعات فاتورة عميل بضاعة','cash-sale':'بيع نقدي كاشير بطاقة مبيعات نقدية','sales-return':'مرتجع مردودات اشعار دائن ارجاع','customer-receipt':'تحصيل قبض عميل سند قبض سداد عميل','purchase-credit':'شراء آجل مشتريات فاتورة مورد مخزون','supplier-payment':'سداد مورد دفع مورد خصم مكتسب','vat-settlement':'ضريبة القيمة المضافة اقرار تسوية الضريبة','prepaid':'مقدما مدفوع مقدم ايجار مقدم تأمين مقدم','accrued':'مستحق مصروف مستحق استحقاق','unearned':'ايراد مقبوض مقدما ايراد مؤجل اشتراك','year-end-close':'اقفال نهاية السنة اقفال ختامي','asset-purchase':'شراء اصل اصل ثابت اهلاك سيارة معدات','asset-disposal':'بيع اصل استبعاد اصل ثابت','lease':'ايجار عقد ايجار حق استخدام ifrs 16','invprop':'عقار استثماري قيمة عادلة','grant':'منحة حكومية دعم','payroll':'رواتب مرتبات اجور تامينات','eosb':'نهاية الخدمة مكافأة استقالة','loan':'قرض تمويل بنكي اقساط فوائد','ecl':'ديون مشكوك مخصص خسائر ائتمان ذمم متعثرة','fx':'عملة اجنبية صرف دولار يورو','inv-nrv':'مخزون راكد تخفيض مخزون تالف صافي القيمة','impairment':'انخفاض قيمة اصل اضمحلال','provision':'مخصص قضية ضمان التزام محتمل','deferred-tax':'ضريبة مؤجلة','sbp':'خيارات اسهم موظفين دفع بالاسهم','multi-element':'عقد متعدد توزيع السعر','goodwill':'استحواذ شهرة شراء شركة','eps':'ربحية السهم','equity-tx':'رأس المال مسحوبات توزيعات ارباح شريك','bank-rec':'تسوية بنكية كشف حساب بنك','petty-cash':'عهدة نثرية صندوق نثرية'};
function norm(s){return(s||'').replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').toLowerCase()}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function find(id){for(var i=0;i<A.O.length;i++)if(A.O[i].id===id)return A.O[i]}
function guess(t){t=norm(t);var best=null,bs=0;A.O.forEach(function(o){var w=norm(o.t+' '+(KW[o.id]||'')).split(/\s+/),s=0;w.forEach(function(x){if(x.length>2&&t.indexOf(x)>-1)s+=x.length});if(s>bs){bs=s;best=o}});return best}
function nums(t){var m=(t||'').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/,/g,'').match(/\d+(\.\d+)?/g);return m?m.map(Number):[]}
function init(root){
 var ids=(root.dataset.ops||'').split(',').filter(Boolean),full=!ids.length,list=full?A.O:ids.map(find).filter(Boolean);
 var cur=list[0],vals={},h='';
 if(full){h+='<div class="aw-ask"><label>اكتب العملية بكلماتك (مثال: بعنا بضاعة آجل بمبلغ 50000 لعميل)</label><div class="aw-row"><input class="aw-q" type="text" placeholder="اكتب عملية محاسبية…"><button class="btn aw-go" type="button">حلّل العملية</button></div><div class="aw-msg"></div></div>'}
 h+='<div class="aw-sel"><label>العملية</label><select class="aw-op">';
 if(full){A.C.forEach(function(g,gi){h+='<optgroup label="'+esc(g)+'">';A.O.forEach(function(o){if(o.g===gi)h+='<option value="'+o.id+'">'+esc(o.t)+'</option>'});h+='</optgroup>'})}
 else list.forEach(function(o){h+='<option value="'+o.id+'">'+esc(o.t)+'</option>'});
 h+='</select></div><div class="aw-body"></div>';root.innerHTML=h;
 var sel=root.querySelector('.aw-op'),body=root.querySelector('.aw-body');
 var qs=new URLSearchParams(location.search);if(full&&qs.get('op')&&find(qs.get('op')))cur=find(qs.get('op'));
 sel.value=cur.id;
 function draw(keep){cur=find(sel.value);if(!keep)vals={};
  var s='<div class="aw-form">';cur.f.forEach(function(x){var v=vals[x[0]]!=null?vals[x[0]]:x[2];
   if(x[3])s+='<label>'+esc(x[1])+'<select data-k="'+x[0]+'">'+x[3].map(function(o){return'<option value="'+o[0]+'"'+(o[0]==v?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select></label>';
   else s+='<label>'+esc(x[1])+'<input data-k="'+x[0]+'" type="number" step="any" value="'+v+'"></label>'});
  s+='<label>تاريخ العملية<input data-k="__d" type="date" value="'+(vals.__d||new Date().toISOString().slice(0,10))+'"></label></div><div class="aw-out"></div>';body.innerHTML=s;
  body.querySelectorAll('[data-k]').forEach(function(i){i.oninput=i.onchange=calc});calc()}
 function read(){var v={},d;body.querySelectorAll('[data-k]').forEach(function(i){var k=i.dataset.k;if(k==='__d'){d=i.value;vals.__d=d;return}vals[k]=i.value;v[k]=i.tagName==='SELECT'?i.value:(parseFloat(i.value)||0)});return{v:v,d:d}}
 function calc(){var r=read(),res;try{res=cur.run(r.v,r.d)}catch(e){body.querySelector('.aw-out').innerHTML='<div class="aw-bad">تحقق من المدخلات</div>';return}
  var o='<div class="aw-kpis">'+res.kpi.map(function(k){return'<div><span>'+esc(k[0])+'</span><b>'+esc(k[1])+'</b></div>'}).join('')+'</div>';
  o+='<h4>① الخطوات والإجراءات</h4><ol class="aw-steps">'+res.steps.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ol>';
  o+='<h4>② القيود المحاسبية <small>'+esc(r.d)+'</small></h4>';var tsv='';
  res.je.forEach(function(j){var d=0,c=0;o+='<div class="aw-je"><div class="aw-jt">'+esc(j.t)+'</div><table><thead><tr><th>الحساب</th><th>مدين</th><th>دائن</th></tr></thead><tbody>';tsv+=j.t+'\n';
   j.l.forEach(function(l){d+=+l[1];c+=+l[2];o+='<tr><td class="'+(+l[2]>0&&!+l[1]?'aw-cr':'')+'">'+esc(l[0])+'</td><td>'+(+l[1]?f(l[1]):'')+'</td><td>'+(+l[2]?f(l[2]):'')+'</td></tr>';tsv+=r.d+'\t'+l[0]+'\t'+(+l[1]||'')+'\t'+(+l[2]||'')+'\n'});
   var ok=Math.abs(d-c)<.015;o+='</tbody><tfoot><tr><td>الإجمالي</td><td>'+f(d)+'</td><td>'+f(c)+'</td></tr></tfoot></table><div class="'+(ok?'aw-ok':'aw-bad')+'">'+(ok?'✓ القيد متوازن':'✗ القيد غير متوازن')+'</div></div>';tsv+='\n'});
  if(res.table){o+='<h4>③ الجدول التفصيلي</h4><div class="aw-tw"><table><thead><tr>'+res.table.h.map(function(x){return'<th>'+esc(x)+'</th>'}).join('')+'</tr></thead><tbody>'+res.table.r.map(function(rw){return'<tr>'+rw.map(function(x){return'<td>'+esc(x)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'}
  function blk(t,a,c){return a&&a.length?'<h4>'+t+'</h4><ul class="aw-'+c+'">'+a.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul>':''}
  o+=blk('④ القوانين والمعايير الحاكمة',res.rules,'rules')+blk('⑤ المستندات المطلوبة',res.docs,'docs')+blk('⑥ ضوابط ومراجعات',res.checks,'chk')+blk('⚠ أخطاء شائعة',res.err,'err');
  o+='<div class="aw-act"><button class="btn aw-cp" type="button">نسخ القيود (Excel)</button><button class="btn btn-o aw-pr" type="button">طباعة</button></div><p class="aw-n">أرقام توضيحية وفق مدخلاتك؛ تحقق من النسب والأنظمة السارية قبل التطبيق.</p>';
  var out=body.querySelector('.aw-out');out.innerHTML=o;
  out.querySelector('.aw-cp').onclick=function(){var b=this;(navigator.clipboard?navigator.clipboard.writeText(tsv):Promise.reject()).then(function(){b.textContent='تم النسخ ✓'},function(){var t=document.createElement('textarea');t.value=tsv;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();b.textContent='تم النسخ ✓'})};
  out.querySelector('.aw-pr').onclick=function(){window.print()}}
 sel.onchange=function(){draw(false)};draw(false);
 if(full){var q=root.querySelector('.aw-q'),msg=root.querySelector('.aw-msg');
  function go(){var t=q.value.trim();if(!t)return;var o=guess(t);if(!o){msg.textContent='لم أتعرف على العملية؛ اختر من القائمة أو أعد الصياغة (مثال: شراء أصل، رواتب، قرض).';return}
   sel.value=o.id;vals={};var n=nums(t);draw(false);var first=body.querySelector('input[type=number]');if(n.length&&first){first.value=n[0];vals[first.dataset.k]=n[0];calc()}
   msg.textContent='تم التعرّف على العملية: '+o.t+(n.length?' — وُضع المبلغ '+n[0]+' في أول حقل، عدّل بقية الحقول حسب حالتك.':'')}
  root.querySelector('.aw-go').onclick=go;q.onkeydown=function(e){if(e.key==='Enter')go()}}}
document.querySelectorAll('.accwiz').forEach(init);
})();
