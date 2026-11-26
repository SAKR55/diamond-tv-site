# -*- coding: utf-8 -*-
"""موسوعة Claude، الشهادة، البحث، PWA. تشغيل: python3 scripts/build_extras.py"""
import os, sys, re, json, glob
sys.path.insert(0, os.path.dirname(__file__))
from portal_common import *
URLS = []

GL = [
("Prompt (البرومت)","النص أو التعليمات التي ترسلها إلى النموذج. جودته تحدد جودة الناتج."),
("System prompt (رسالة النظام)","تعليمات عامة تحدد دور النموذج وقواعده قبل بدء المحادثة."),
("Token (الرمز)","وحدة نص يعالجها النموذج (جزء من كلمة غالبًا). تُحسب بها المدخلات والمخرجات والكلفة."),
("Context window (نافذة السياق)","أقصى كمية نص يستطيع النموذج أخذها في الحسبان في طلب واحد (المحادثة والملفات)."),
("Hallucination (الهلوسة)","معلومة خاطئة أو مختلقة يقدمها النموذج بثقة. تُقلَّل بالمصادر والتحقق."),
("Few-shot (التعلّم بالأمثلة)","إعطاء النموذج أمثلة قليلة للمخرج المطلوب داخل الطلب."),
("Zero-shot","طلب مهمة دون أي أمثلة."),
("Chain of thought (سلسلة التفكير)","جعل النموذج يستدل خطوة بخطوة قبل الجواب لتحسين الدقة في المسائل المعقدة."),
("Extended thinking (التفكير الممتد)","وضع يخصص فيه النموذج وقتًا أطول للاستدلال قبل الإجابة، في الإصدارات التي تدعمه."),
("XML tags (وسوم)","وسوم مثل <context> تفصل أجزاء الطلب فيفهمها النموذج بدقة."),
("Temperature (الحرارة)","معامل في الواجهة البرمجية يتحكم بعشوائية الإجابات: منخفض للثبات، مرتفع للإبداع."),
("Artifact","مخرج مستقل (صفحة، وثيقة، رسم، تطبيق صغير) يظهر بجانب المحادثة ويمكن تعديله."),
("Project (المشروع)","مساحة تجمع محادثات وملفات وتعليمات مخصصة لموضوع واحد."),
("Memory (الذاكرة)","تفضيلات وسياق تُحفظ بين المحادثات بحسب إعداداتك."),
("MCP","معيار مفتوح لربط النماذج بأدوات وبيانات خارجية عبر خوادم (موصّلات)."),
("Connector (موصّل)","اتصال بتطبيق أو خدمة (بريد، مستندات…) يتيح لـClaude القراءة أو التنفيذ بصلاحياتك."),
("Skill (مهارة)","حزمة تعليمات وملفات يحمّلها Claude عند مناسبة المهمة."),
("Agent (وكيل)","نظام يستخدم النموذج في حلقة: يخطط ويستدعي أدوات ويقرر الخطوة التالية."),
("Subagent (وكيل فرعي)","وكيل متخصص بسياق مستقل يستدعيه وكيل رئيسي لمهمة محددة."),
("Tool use (استخدام الأدوات)","قدرة النموذج على طلب استدعاء دوال تعرّفها له ثم استخدام نتائجها."),
("Workflow (سير عمل)","سلسلة خطوات ثابتة تستدعي النموذج في مراحل محددة مسبقًا."),
("Prompt chaining (تسلسل الطلبات)","تقسيم مهمة كبيرة إلى طلبات متتابعة يغذي ناتج كل منها التالي."),
("Prompt caching (التخزين المؤقت)","إعادة استخدام جزء ثابت طويل من الطلب لتقليل الكلفة والزمن، حيث يتوفر."),
("Batch (معالجة دفعية)","إرسال كثير من الطلبات غير العاجلة معًا لمعالجتها بكلفة أقل."),
("Streaming (البث)","استقبال الإجابة تدريجيًا أثناء توليدها."),
("Multimodal (متعدد الوسائط)","يتعامل مع أكثر من نوع إدخال مثل النص والصور."),
("RAG","استرجاع معلومات من مصادرك ثم تمريرها للنموذج ليجيب بالاعتماد عليها."),
("Embedding (التضمين)","تمثيل رقمي للنص يُستخدم في البحث الدلالي والمقارنة."),
("Fine-tuning (الضبط الدقيق)","تدريب إضافي لنموذج على بيانات محددة. غالبًا يكفي برومت جيد قبل التفكير فيه."),
("Prompt injection (حقن الأوامر)","نص خبيث داخل محتوى (صفحة/رسالة) يحاول توجيه النموذج. تُحذَّر منه المصادر غير الموثوقة."),
("Guardrails (حواجز الحماية)","قواعد وفحوص تحدّ من مخرجات أو إجراءات غير مرغوبة."),
("Evals (التقييمات)","مجموعة حالات اختبار تقيس جودة البرومت أو النظام بالأرقام."),
("Latency (زمن الاستجابة)","الوقت بين الطلب وبدء/اكتمال الإجابة."),
("Rate limit (حد المعدل)","حد أقصى لعدد الطلبات أو الرموز في فترة معينة."),
("API key (مفتاح الواجهة)","سر يصادق تطبيقك أمام الخدمة. لا يوضع في كود المتصفح."),
("SDK","مكتبة برمجية تسهّل استخدام الواجهة بلغة برمجة معينة."),
("CLAUDE.md","ملف تعليمات مشروع يقرؤه Claude Code تلقائيًا."),
("Slash command (أمر مائل)","اختصار يبدأ بـ/ لتنفيذ طلب أو إجراء متكرر."),
("Hook (خُطّاف)","أمر يُنفَّذ تلقائيًا عند حدث معين أثناء عمل الوكيل."),
("Plan mode (وضع الخطة)","وضع يعرض فيه الوكيل خطته للموافقة قبل التنفيذ."),
("Structured output (مخرجات منظمة)","إجابات بصيغة ثابتة مثل JSON ليسهل معالجتها آليًا."),
]
CHEAT = [("صيغة الطلب القوية","الهدف + السياق + الجمهور + القيود + الشكل المطلوب + مثال."),
("قبل التنفيذ","اطلب خطة أو أسئلة توضيحية أولًا."),
("عند الشك","اطلب المصادر وقل «إن لم تكن متأكدًا فقل لا أعرف»."),
("للتحسين","غيّر عنصرًا واحدًا في كل مرة وقارن."),
("للأمان","لا تلصق بيانات حساسة، وامنح أقل صلاحية للموصّلات."),
("للتكرار","احفظ الناجح في مكتبة وأنشئ مشروعًا أو مهارة.")]

# reference
rows = ''.join(f'<tr><td><b>{e(a)}</b></td><td style="white-space:normal">{e(b)}</td></tr>' for a, b in GL)
ch = '<div class="grid g3">' + ''.join(f'<div class="card"><h3>{e(a)}</h3><p>{e(b)}</p></div>' for a, b in CHEAT) + '</div>'
body = hero("موسوعة Claude: مصطلحات وملخص سريع", f"{len(GL)} مصطلحًا ومرجع سريع لأهم قواعد الكتابة والأمان.", '<a href="/">الرئيسية</a> › <a href="/claude/">أكاديمية Claude</a> › الموسوعة')
body += '<main><section class="s"><div class="wrap narrow"><h2 class="h2">ورقة غش سريعة</h2><br>' + ch + '<br><h2 class="h2">المصطلحات</h2><table class="t"><tr><th>المصطلح</th><th>المعنى</th></tr>' + rows + '</table><div class="note">قد تتغير الميزات والتسميات. راجع وثائق Anthropic الرسمية.</div><p class="center"><a class="btn btn-g" href="/claude/course/">ابدأ الكورس</a></p></div></section></main>'
write("claude/reference/index.html", page("/claude/reference/", "موسوعة Claude: شرح مصطلحات الذكاء الاصطناعي والبرومت | DIAMOND HUB", "شرح عربي مبسط لـ40 مصطلحًا: token وMCP وAgent وprompt caching وغيرها مع ورقة غش لكتابة الطلبات.", body,
  breadcrumb([("الرئيسية","/"),("أكاديمية Claude","/claude/"),("الموسوعة","/claude/reference/")]) + ld({"@context":"https://schema.org","@type":"DefinedTermSet","name":"موسوعة Claude","hasDefinedTerm":[{"@type":"DefinedTerm","name":a,"description":b} for a,b in GL]}), "/claude/"))
URLS.append(("/claude/reference/", "0.8"))

# certificate
cert = hero("🎓 شهادة إتمام كورس Claude", "أكمل الدروس ثم اكتب اسمك واطبع شهادتك.", '<a href="/claude/">أكاديمية Claude</a> › الشهادة')
cert += '''<main><section class="s"><div class="wrap narrow center"><div class="tool"><p id="prog" class="lead"></p><div class="meter"><i id="bar"></i></div><label class="field">اسمك على الشهادة<input id="nm" placeholder="الاسم الكامل" maxlength="60"></label><button class="btn btn-g" id="mk">إنشاء الشهادة</button></div>
<div id="cert" hidden style="margin:24px auto;border:8px double #7c3aed;border-radius:18px;padding:40px 20px;background:#fff;max-width:760px"><div style="font-size:48px">💎</div><h2 style="font-size:30px;font-weight:900">شهادة إتمام</h2><p style="font-size:18px">تشهد منصة DIAMOND HUB بأن</p><h3 id="cn" style="font-size:34px;color:#5b21b6;font-weight:900;margin:10px 0"></h3><p style="font-size:18px">قد أنهى متعلّمًا كورس <b>Claude الاحترافي</b> بمستوياته الستة</p><p id="cd" class="muted"></p></div>
<button class="btn btn-o" id="pr" hidden onclick="print()">🖨️ طباعة / حفظ PDF</button><div class="note">الشهادة تعريفية وليست مؤهلًا رسميًا، ويُحسب تقدمك محليًا على جهازك.</div></div></section></main>
<script>const $=i=>document.getElementById(i);let done=[];try{done=JSON.parse(localStorage.getItem('diamond-claude-course-v1')||'[]')}catch(e){}
const N=33,c=Array.isArray(done)?done.length:0,p=Math.min(100,Math.round(c/N*100));$('bar').style.width=p+'%';$('prog').textContent='تقدمك: '+c+' من '+N+' درسًا ('+p+'%)';
$('mk').onclick=()=>{const n=$('nm').value.trim();if(!n){$('nm').focus();return}if(p<80&&!confirm('لم تُكمل 80% من الدروس بعد. هل تريد إنشاء شهادة على أي حال؟'))return;$('cn').textContent=n;$('cd').textContent=new Date().toLocaleDateString('ar-SA');$('cert').hidden=false;$('pr').hidden=false;$('cert').scrollIntoView({behavior:'smooth'})}</script>'''
write("claude/certificate/index.html", page("/claude/certificate/", "شهادة إتمام كورس Claude الاحترافي | DIAMOND HUB", "اطبع شهادة إتمام كورس Claude بعد إنهاء الدروس. تقدمك يُحفظ على جهازك.", cert, breadcrumb([("الرئيسية","/"),("أكاديمية Claude","/claude/"),("الشهادة","/claude/certificate/")]), "/claude/"))
URLS.append(("/claude/certificate/", "0.5"))

# search index from sitemap
sm = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
paths = set(re.findall(r"<loc>https://diamond-tv.shop(/[^<]*)</loc>", sm)) | {u for u, _ in URLS} | {u for u, _ in json.load(open(os.path.join(ROOT, "scripts/.ecom_urls.json")))}
idx = []
for u in sorted(paths):
    f = os.path.join(ROOT, u.lstrip("/"))
    f = f if f.endswith(".html") else os.path.join(f, "index.html")
    if not os.path.exists(f): continue
    h = open(f, encoding="utf-8", errors="ignore").read()
    t = re.search(r"<title>(.*?)</title>", h, re.S); d = re.search(r'<meta name="description" content="([^"]*)"', h)
    if t: idx.append({"t": html.unescape(t.group(1)).split(" | ")[0].strip(), "u": u, "d": html.unescape(d.group(1)) if d else ""})
json.dump(idx, open(os.path.join(ROOT, "search-index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
sb = hero("🔍 ابحث في DIAMOND HUB", f"ابحث في {len(idx)} صفحة: دروس، أدوات، مقالات، أسئلة.", '<a href="/">الرئيسية</a> › بحث')
sb += '''<main><section class="s"><div class="wrap narrow"><label class="field">اكتب كلمة البحث<input id="q" type="search" autofocus placeholder="مثال: هامش الربح، برومت، إنجليزية"></label><p class="muted" id="cnt"></p><div id="res" class="grid"></div></div></section></main>
<script>let D=[];const $=i=>document.getElementById(i);const norm=s=>s.toLowerCase().replace(/[\\u064b-\\u065f]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
fetch('/search-index.json').then(r=>r.json()).then(d=>{D=d;const q=new URLSearchParams(location.search).get('q');if(q)$('q').value=q;go()});
function go(){const q=norm($('q').value.trim()),r=$('res');r.replaceChildren();if(!q){$('cnt').textContent='';return}const ws=q.split(/\\s+/);
const hits=D.map(x=>{const t=norm(x.t),d=norm(x.d);let s=0;for(const w of ws){if(t.includes(w))s+=3;else if(d.includes(w))s+=1;else return null}return[s,x]}).filter(Boolean).sort((a,b)=>b[0]-a[0]).slice(0,30);
$('cnt').textContent=hits.length+' نتيجة';hits.forEach(([s,x])=>{const a=document.createElement('a');a.className='card';a.href=x.u;const h=document.createElement('h3');h.textContent=x.t;const p=document.createElement('p');p.textContent=x.d.slice(0,140);a.append(h,p);r.append(a)})}
$('q').oninput=go;</script>'''
write("search/index.html", page("/search/", "بحث في موقع DIAMOND HUB", "ابحث في دروس Claude وأدوات التجارة الإلكترونية والمقالات والأسئلة الشائعة.", sb, "", "/"))
URLS.append(("/search/", "0.4"))

# PWA
manifest = {"name": "DIAMOND HUB", "short_name": "DIAMOND", "lang": "ar", "dir": "rtl", "start_url": "/?source=pwa", "scope": "/", "display": "standalone",
            "background_color": "#ffffff", "theme_color": "#7c3aed", "icons": [{"src": "/assets/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any"}, {"src": "/assets/og.png", "sizes": "512x512", "type": "image/png"}]}
json.dump(manifest, open(os.path.join(ROOT, "manifest.webmanifest"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
write("sw.js", """const C='dt-v1';const CORE=['/','/assets/portal.css','/assets/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
e.respondWith(fetch(r).then(res=>{if(res.ok&&(r.mode==='navigate'||/\\.(css|js|svg|json)$/.test(r.url))){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('/'))))});""")
write("assets/pwa.js", """(function(){if(!document.querySelector('link[rel=manifest]')){var l=document.createElement('link');l.rel='manifest';l.href='/manifest.webmanifest';document.head.appendChild(l)}
if('serviceWorker' in navigator&&location.protocol==='https:'){navigator.serviceWorker.register('/sw.js').catch(function(){})}})();""")
json.dump(URLS, open(os.path.join(ROOT, "scripts/.extra_urls.json"), "w"))
print("extras", len(idx), "indexed")
