/* إبداع اليوم: محتوى متجدد لكل قسم. يعمل بلا خادم، ويتغير يوميًا. */
(function () {
  var S = {
    claude: {
      icon: "🤖", title: "تحدّي البرومت اليوم", cta: "جرّبه في أداة Claude", href: "/claude/prompt-builder/", param: "idea",
      items: [
        "اكتب طلبًا يحوّل فوضى أفكارك لهذا الأسبوع إلى خطة من ثلاث أولويات فقط.",
        "اطلب من Claude أن يشرح فكرة صعبة لطفل في العاشرة ثم يسألك سؤالًا واحدًا ليتأكد من فهمك.",
        "ألصق رسالة طويلة وصلتك، واطلب ملخصًا في سطرين وثلاث ردود محتملة بنبرات مختلفة.",
        "اطلب 5 عناوين لمنشور عن مشروعك، ثم اطلب نقدًا صريحًا لأضعفها.",
        "اطلب من Claude أن يسألك خمسة أسئلة تكشف أضعف نقطة في فكرة مشروعك قبل أن يقترح أي حل.",
        "حوّل قائمة مهامك العشوائية إلى جدول بالأولوية والجهد والمخرج.",
        "اطلب من Claude أن يمثل دور عميل متردد، وتدرب على الرد على اعتراضه بثلاث جولات.",
        "اكتب تعليمات مشروع من أربعة أسطر لمهمة تتكرر في عملك.",
        "اطلب مقارنة بين خيارين تفكر بهما في جدول، مع معيار قرار تحدده أنت.",
        "اطلب من Claude قائمة بالادعاءات في نص كتبته تحتاج إلى مصدر."
      ]
    },
    library: {
      icon: "📚", title: "نشاط عائلي من المكتبة الماسية", cta: "تصفّح الكتب والقصص", href: "/store/",
      items: [
        "اصنعوا كتابًا من أربع صفحات: صفحة لكل حرف من اسم طفلك، وارسموا شيئًا يبدأ بهذا الحرف.",
        "لعبة «من أنا؟»: صف شخصية من قصة اليوم بثلاث جمل ودع الطفل يخمّن.",
        "اقرأوا صفحة واحدة بأصوات مختلفة للشخصيات، ودع الطفل يختار صوت البطل.",
        "ارسموا نهاية بديلة للقصة، ثم تبادلوا حكايتها بصوتكم.",
        "قبل القراءة اسأل الطفل: ماذا تتوقع أن يحدث؟ وبعدها قارنوا توقعه بالنهاية.",
        "بعد القراءة اسأل: لو كنت مكان البطل ماذا كنت ستفعل؟ واستمع دون تصحيح.",
        "صندوق الكلمات: اختر خمس كلمات جديدة من الكتاب وعلّقوها في مكان بارز في البيت.",
        "عشر دقائق قراءة قبل النوم دون شاشات، والطفل هو من يقلّب الصفحات.",
        "حوّلوا القصة إلى مسرحية صغيرة بدمى أو أغراض منزلية.",
        "اسأل الطفل: ما أجمل صورة في الكتاب ولماذا؟"
      ]
    },
    english: {
      icon: "🗣️", title: "عبارة إنجليزية اليوم", cta: "تدرّب مع تطبيق مغرّد", href: "/mugharrid/",
      items: [
        ["Could you say that again, please?", "هل يمكنك أن تعيد ذلك من فضلك؟"],
        ["I'd like to book a table for two.", "أود حجز طاولة لشخصين."],
        ["What do you recommend?", "بماذا تنصحني؟"],
        ["I'm still learning, so please speak slowly.", "ما زلت أتعلم، فتحدث ببطء من فضلك."],
        ["Let me think about it.", "دعني أفكر في الأمر."],
        ["I'm looking forward to it.", "أتطلع إليه."],
        ["Could I get the bill, please?", "هل أستطيع الحصول على الفاتورة من فضلك؟"],
        ["It was nice meeting you.", "سررت بلقائك."],
        ["How do I get to the station?", "كيف أصل إلى المحطة؟"],
        ["I'll get back to you by Thursday.", "سأعود إليك بحلول الخميس."]
      ],
      task: "التحدي: قلها بصوت عالٍ ثلاث مرات، ثم ركّب بها جملة عن يومك."
    },
    import: {
      icon: "🛒", title: "نصيحة تاجر اليوم", cta: "افتح حاسبة الهامش", href: "/ecommerce/tools/margin-calculator/",
      items: [
        "قبل طلب العينة اكتب أسئلتك للمورد: الحد الأدنى للطلب، مدة الإنتاج، التغليف، الضمان، وشروط الدفع.",
        "احسب التكلفة الإجمالية (المنتج والشحن والجمارك والرسوم والتغليف) قبل تحديد السعر، لا سعر المصنع وحده.",
        "ابدأ بكمية تجريبية صغيرة في أول مرة بدل طلب كبير.",
        "اطلب صورًا وفيديو حقيقيًا للمنتج من المورد قبل الدفع.",
        "تحقق من المنتجات المقيّدة والمواصفات المطلوبة لدى الجهات الرسمية قبل الشراء.",
        "اترك هامشًا للعيوب والمرتجعات عند حساب ربحك.",
        "قارن عرضين على الأقل لنفس المنتج، وانتبه لاختلاف الجودة لا السعر فقط.",
        "وثّق كل اتفاق مع المورد كتابةً، واحتفظ بنسخة من المحادثات.",
        "راقب CPA يوميًا: إن تجاوز أقصى مبلغ يمكنك دفعه لكل عميل أوقف الإعلان وعدّل.",
        "رد على رسائل العملاء في أقل وقت ممكن، فالسرعة ترفع نسبة الشراء.",
        "سجّل سبب كل مرتجع، فهو أرخص مصدر لتحسين منتجك."
      ]
    },
    app: {
      icon: "📺", title: "نصيحة مشاهدة اليوم", cta: "دليل التطبيق", href: "/app/",
      items: [
        "إذا تكرر التقطيع فأعد تشغيل الراوتر، وجرّب قناة أخرى لمعرفة إن كان السبب في الشبكة.",
        "استخدم الشبكة السلكية على التلفزيون عند الإمكان لثبات أفضل في البث.",
        "فعّل القفل الأبوي لقنوات الأطفال قبل أن يستخدم أبناؤك الجهاز.",
        "احتفظ بكود التفعيل في مكان آمن حتى تعيد التفعيل بسهولة على جهاز جديد.",
        "حدّث التطبيق من صفحة التحميل لتحصل على آخر التحسينات.",
        "استخدم دليل البرامج لتخطيط مشاهدتك بدل التنقل بين القنوات."
      ]
    },
    articles: {
      icon: "📰", title: "اقرأ اليوم", cta: "مركز المقالات", href: "/articles/",
      items: [
        ["كيف تكتب برومت ناجحًا لـClaude", "/articles/claude-prompt-writing-guide/"],
        ["10 برومتات جاهزة لصاحب المشروع الصغير", "/articles/ten-claude-prompts-small-business/"],
        ["قائمة فحص من 12 نقطة لفهرسة موقعك", "/articles/website-indexing-checklist/"],
        ["كيف تقلل أخطاء الذكاء الاصطناعي", "/articles/reduce-ai-hallucinations/"],
        ["تعلّم الإنجليزية بمحادثة مع الذكاء الاصطناعي", "/articles/learn-english-with-ai-conversation/"],
        ["مشاريع Claude: اكتب تعليماتك مرة واحدة", "/articles/claude-projects-save-time/"],
        ["Claude أم ChatGPT؟ كيف تختار بنفسك", "/articles/claude-vs-chatgpt-how-to-choose/"],
        ["مقالات السيو بالذكاء الاصطناعي دون عقوبة", "/articles/ai-content-for-seo-without-penalty/"]
      ]
    }
  };

  var css = ".spark-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px;margin:18px 0}" +
    ".spark-card{background:#fff;border:1px solid #ded5ec;border-top:4px solid #ec4899;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:10px;font-family:inherit;color:#1a1333}" +
    ".spark-card h3{margin:0;font-size:1.05rem}.spark-card .sp-eye{font-size:.8rem;color:#7c3aed;font-weight:800}" +
    ".spark-card p{margin:0;line-height:1.9}.spark-card .en{direction:ltr;text-align:left;font-weight:800;font-size:1.1rem}" +
    ".spark-card .sp-actions{margin-top:auto;display:flex;gap:10px;flex-wrap:wrap;align-items:center}" +
    ".spark-card a.sp-go{background:#51368d;color:#fff;border-radius:999px;padding:6px 16px;text-decoration:none;font-weight:700;font-size:.9rem}" +
    ".spark-card button{background:#f0edf7;color:#51368d;border:0;border-radius:999px;padding:6px 14px;cursor:pointer;font:inherit;font-size:.9rem}" +
    ".spark-wrap{max-width:1140px;margin:0 auto;padding:18px}.spark-wrap>h2{margin:0 0 4px}";

  function day() { return Math.floor(Date.now() / 864e5); }
  var keys = Object.keys(S);

  function card(key) {
    var d = S[key], idx = (day() + keys.indexOf(key) * 3) % d.items.length;
    var el = document.createElement("div"); el.className = "spark-card";
    var eye = document.createElement("span"); eye.className = "sp-eye"; eye.textContent = "✨ إبداع اليوم";
    var h = document.createElement("h3"); h.textContent = d.icon + " " + d.title;
    var body = document.createElement("div");
    var actions = document.createElement("div"); actions.className = "sp-actions";
    var go = document.createElement("a"); go.className = "sp-go"; go.textContent = d.cta + " ←";
    var more = document.createElement("button"); more.type = "button"; more.textContent = "اقتراح آخر";
    function show() {
      body.replaceChildren();
      var it = d.items[idx], go2 = d.href;
      if (key === "english") {
        var en = document.createElement("p"); en.className = "en"; en.lang = "en"; en.textContent = it[0];
        var ar = document.createElement("p"); ar.textContent = it[1];
        var t = document.createElement("p"); t.textContent = d.task;
        body.append(en, ar, t);
      } else if (key === "articles") {
        var p = document.createElement("p"); p.textContent = it[0]; body.append(p); go2 = it[1];
      } else {
        var p2 = document.createElement("p"); p2.textContent = it; body.append(p2);
        if (d.param) go2 = d.href + "?" + d.param + "=" + encodeURIComponent(it);
      }
      go.href = go2;
    }
    more.onclick = function () { idx = (idx + 1) % d.items.length; show(); };
    actions.append(go, more); el.append(eye, h, body, actions); show();
    return el;
  }

  function mount() {
    if (!document.getElementById("spark-css")) {
      var st = document.createElement("style"); st.id = "spark-css"; st.textContent = css; document.head.append(st);
    }
    document.querySelectorAll("[data-spark]").forEach(function (host) {
      var k = host.getAttribute("data-spark"); host.replaceChildren();
      if (k === "all") {
        host.classList.add("spark-grid"); keys.forEach(function (x) { host.append(card(x)); });
      } else if (S[k]) { var w = document.createElement("div"); w.className = "spark-wrap"; w.append(card(k)); host.append(w); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();

(function(){var s=document.createElement("script");s.src="/assets/ico.js?v=3";s.defer=true;document.head.appendChild(s)})();
