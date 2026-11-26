/* اختبار مهارة الذكاء الاصطناعي — بلا خادم، النتيجة قابلة للمشاركة */
(function(){
var AR=document.documentElement.lang==='ar';
var Q=[
['يعطيك النموذج إجابة واثقة بمعلومة تبدو غريبة. ما تفعله؟','What do you do when the model gives a confident answer with a surprising fact?',
 ['أنسخها كما هي لأنها مكتوبة بثقة','أسأله «هل أنت متأكد؟» فقط','أتحقق منها من مصدر موثوق قبل استعمالها'],['Copy it because it sounds confident','Just ask "are you sure?"','Check it against a reliable source before using it'],
 'النماذج تولّد نصًا محتملًا وقد تخطئ بثقة، والتحقق المستقل هو الحماية الحقيقية.','Models generate plausible text and can be confidently wrong; independent checking is the real safeguard.'],
['أي طلب سيعطيك نتيجة أفضل غالبًا؟','Which prompt will usually give a better result?',
 ['اكتب لي إعلانًا','اكتب إعلانًا جيدًا لمنتجي','اكتب إعلانًا من 30 كلمة لعطر خشبي للرجال، بنبرة راقية، ويُختم بدعوة للشراء'],['Write me an ad','Write a good ad for my product','Write a 30-word ad for a woody men\'s perfume, elegant tone, ending with a call to buy'],
 'التفاصيل (الجمهور والطول والنبرة والشكل) تقلل التخمين وترفع جودة المخرج.','Details (audience, length, tone, format) reduce guessing and raise output quality.'],
['لديك عقد عميل فيه بيانات حقيقية وتريد تلخيصه. ماذا تفعل؟','You have a client contract with real data to summarise. What do you do?',
 ['ألصقه كاملًا في أي أداة','أحذف الأسماء والأرقام الحساسة أو أستعمل أداة معتمدة من جهة عملي','لا أستعمل أي أداة أبدًا'],['Paste it whole into any tool','Remove names and sensitive figures, or use a tool approved by my organisation','Never use any tool at all'],
 'الحل الوسط: إخفاء الحساسيات أو استعمال أداة معتمدة، فلا مخاطرة بالخصوصية ولا خسارة للفائدة.','The balanced answer: redact sensitive details or use an approved tool.'],
['الإجابة الأولى لم تناسبك تمامًا. أفضل خطوة؟','The first answer is not quite right. Best next step?',
 ['أبدأ محادثة جديدة بالطلب نفسه','أطلب تعديلًا محددًا: «اختصر إلى النصف وأضف مثالًا»','أقبلها كما هي'],['Start a new chat with the same prompt','Ask for a specific change: "halve the length and add an example"','Accept it as is'],
 'التحسين التدريجي بتعليمة محددة في كل جولة أسرع وأدق من البدء من الصفر.','Iterating with one specific instruction per round beats starting over.'],
['ما فائدة إعطاء النموذج مثالًا على المخرج الذي تريده؟','Why give the model an example of the output you want?',
 ['لا فائدة منه','يوضح الشكل والنبرة المطلوبين فيقلل الاختلاف عن توقعاتك','يجعل الإجابة أطول فقط'],['No benefit','It shows the format and tone you expect, reducing mismatch','It only makes answers longer'],
 'الأمثلة من أقوى طرق توجيه الشكل والأسلوب.','Examples are one of the strongest ways to steer format and style.'],
['تحتاج قرارًا طبيًا أو قانونيًا مهمًا. دور الذكاء الاصطناعي؟','You face an important medical or legal decision. What role should AI play?',
 ['يقرر عني','يساعدني على فهم المصطلحات وتحضير أسئلتي، ثم أستشير مختصًا','لا أستفيد منه إطلاقًا'],['Decide for me','Help me understand terms and prepare questions, then consult a professional','Useless for this'],
 'هو مساعد للفهم والتحضير لا بديل عن المختص المرخّص.','It helps with understanding and preparation, not a replacement for a licensed professional.'],
['طلبت منه مصادر لمعلومة. ماذا تفعل بها؟','You asked for sources for a claim. What do you do with them?',
 ['أنشرها مباشرة','أفتح كل مصدر وأتأكد أنه موجود ويقول ذلك فعلًا','أتجاهل المصادر'],['Publish them directly','Open each source and confirm it exists and says that','Ignore sources'],
 'قد تُختلق المراجع، فلا تُعتمد قبل فتحها بنفسك.','References can be fabricated; verify by opening them.'],
['مهمة معقدة من عدة أجزاء. كيف تطلبها؟','A complex multi-part task. How do you ask?',
 ['كل شيء في طلب واحد طويل','أقسمها إلى خطوات وأطلبها واحدة بعد أخرى مع مراجعة كل ناتج','لا أحاول'],['Everything in one long prompt','Split into steps, one at a time, reviewing each output','Don\'t try'],
 'تقسيم المهمة يزيد الدقة ويسهّل اكتشاف الخطأ مبكرًا.','Splitting the task improves accuracy and catches errors early.'],
['أي مهمة تناسب الذكاء الاصطناعي أكثر كمسودة أولى؟','Which task suits AI best as a first draft?',
 ['صياغة رد على رسالة عميل ثم مراجعتها','اتخاذ قرار توظيف نهائي','حساب ضريبتك النهائية دون مراجعة'],['Drafting a reply to a customer message, then reviewing it','Making the final hiring decision','Calculating your final tax without checking'],
 'الصياغة والتلخيص مع مراجعة بشرية استخدام آمن ومفيد؛ القرارات النهائية والأرقام تحتاج إنسانًا.','Drafting and summarising with human review is safe and useful; final decisions and figures need a person.'],
['كيف تحكم أن أداة الذكاء الاصطناعي وفّرت وقتك فعلًا؟','How do you know AI actually saved you time?',
 ['أشعر أنها مفيدة','أقيس الزمن قبل وبعد لمهمة متكررة لأسبوعين','لا أقيس'],['It feels useful','I measure time before and after on a repeated task for two weeks','I don\'t measure'],
 'القياس يكشف هل المهمة والطلب مناسبان أم يحتاجان تغييرًا.','Measuring shows whether the task and prompt are working.']];
var PTS=[[0,1,2],[0,1,2],[0,2,1],[1,2,0],[1,2,0],[0,2,1],[0,2,1],[1,2,0],[2,0,0],[1,2,0]];
var L=AR?[[35,'مبتدئ واعد','تعرف الأساسيات وتحتاج لتعوّد على كتابة الطلبات والتحقق من الإجابات.'],[65,'مستخدم متوسط','تستعمل الأداة جيدًا، وبقي أن تتقن التحقق وتقسيم المهام.'],[85,'مستخدم متقدم','عاداتك سليمة؛ حسّن القوالب وقِس الوقت الموفَّر.'],[101,'محترف','تتعامل مع الذكاء الاصطناعي بوعي ومسؤولية، وتستحق أن تعلّم غيرك.']]:[[35,'Promising beginner','You know the basics; practise prompting and verifying answers.'],[65,'Intermediate user','You use it well; master verification and task splitting.'],[85,'Advanced user','Your habits are sound; refine templates and measure time saved.'],[101,'Expert','You work with AI responsibly and could teach others.']];
var $=function(i){return document.getElementById(i)},i=0,sc=[],ans=[];
var T=AR?{q:'السؤال',of:'من',res:'نتيجتك',again:'أعد الاختبار',dl:'حمّل بطاقة النتيجة',sh:'شارك النتيجة',cp:'انسخ رابط التحدي',copied:'تم النسخ ✓',rev:'ما يمكنك تحسينه',ch:'تحدّاك صديق: حصل على %s٪ — هل تتفوق عليه؟',ok:'إجابة قوية',tip:'فرصة للتحسين',site:'diamond-tv.shop',ttl:'مستواي في الذكاء الاصطناعي'}:{q:'Question',of:'of',res:'Your score',again:'Retake',dl:'Download result card',sh:'Share result',cp:'Copy challenge link',copied:'Copied ✓',rev:'What to improve',ch:'A friend scored %s% — can you beat that?',ok:'Strong answer',tip:'Room to improve',site:'diamond-tv.shop',ttl:'My AI skill level'};
function show(){var q=Q[i],k=AR?0:1;$('aq-n').textContent=T.q+' '+(i+1)+' '+T.of+' '+Q.length;$('aq-bar').style.width=(i/Q.length*100)+'%';$('aq-t').textContent=q[k];var o=$('aq-o');o.innerHTML='';var idx=[0,1,2];
 // ترتيب ثابت لكل سؤال لكن غير مرتب بالقوة: نخلط بذرة بسيطة
 var perm=[[2,0,1],[1,2,0],[0,2,1],[2,1,0],[1,0,2]][i%5];perm.forEach(function(p){var b=document.createElement('button');b.type='button';b.className='aq-opt';b.textContent=q[2+k][p];b.onclick=function(){pick(p)};o.appendChild(b)})}
function pick(p){ans[i]=p;sc[i]=PTS[i][p];i++;if(i<Q.length)show();else done()}
function done(){var sum=0;sc.forEach(function(s){sum+=s});var pct=Math.round(sum/(Q.length*2)*100);$('aq-quiz').style.display='none';$('aq-res').style.display='block';var lv=L.filter(function(l){return pct<l[0]})[0];$('aq-pct').textContent=pct+'%';$('aq-lv').textContent=lv[1];$('aq-ds').textContent=lv[2];
 var w=$('aq-rev');w.innerHTML='';var k=AR?0:1;Q.forEach(function(q,n){if(sc[n]<2){var d=document.createElement('div');d.className='aq-r';d.innerHTML='<b>'+(n+1)+'. '+T.tip+'</b><br>'+q[4+k];w.appendChild(d)}});if(!w.children.length)w.textContent=T.ok;
 window._aq={pct:pct,lv:lv[1]};try{history.replaceState(null,'','?s='+pct)}catch(e){}}
function card(){var p=window._aq,c=document.createElement('canvas');c.width=c.height=1080;var x=c.getContext('2d'),g=x.createLinearGradient(0,0,1080,1080);g.addColorStop(0,'#4c1d95');g.addColorStop(1,'#7c3aed');x.fillStyle=g;x.fillRect(0,0,1080,1080);x.textAlign='center';x.fillStyle='#fff';x.direction=AR?'rtl':'ltr';x.font='bold 54px sans-serif';x.fillText(T.ttl,540,200);x.font='bold 280px sans-serif';x.fillText(p.pct+'%',540,560);x.font='bold 72px sans-serif';x.fillText(p.lv,540,700);x.font='40px sans-serif';x.globalAlpha=.85;x.fillText('💎 DIAMOND HUB — '+T.site,540,960);return c}
function url(){return location.origin+location.pathname+'?s='+window._aq.pct}
$('aq-dl').onclick=function(){var a=document.createElement('a');a.download='ai-skill-result.png';a.href=card().toDataURL('image/png');a.click()};
$('aq-cp').onclick=function(){var b=this;try{navigator.clipboard.writeText(url())}catch(e){}var o=b.textContent;b.textContent=T.copied;setTimeout(function(){b.textContent=o},1400)};
$('aq-sh').onclick=function(){var u=url();if(navigator.share){navigator.share({title:T.ttl,text:T.ttl+': '+window._aq.pct+'%',url:u}).catch(function(){})}else{$('aq-cp').click()}};
$('aq-re').onclick=function(){i=0;sc=[];ans=[];$('aq-res').style.display='none';$('aq-quiz').style.display='block';try{history.replaceState(null,'',location.pathname)}catch(e){}show()};
var m=/[?&]s=(\d{1,3})/.exec(location.search);if(m&&+m[1]<=100){$('aq-ch').style.display='block';$('aq-ch').textContent=T.ch.replace('%s',m[1])}
show();
})();
