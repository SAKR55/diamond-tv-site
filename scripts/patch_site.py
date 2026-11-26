# -*- coding: utf-8 -*-
"""دمج أكاديمية Claude والمحتوى المتجدد في صفحات الموقع الحالية (آمن للتكرار)."""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()
def wr(p, s): open(os.path.join(ROOT, p), "w", encoding="utf-8").write(s)
def must(s, old, new, count=1):
    assert old in s, "missing: " + old[:60]
    return s.replace(old, new, count) if count else s.replace(old, new)

SPARK = '<script src="/assets/spark.js" defer></script>'

# ---------- home ----------
s = rd("index.html")
if "spark-home" not in s:
    s = s.replace("DIAMOND HUB | التعليم والأدوات والمكتبة والترفيه", "DIAMOND HUB | أكاديمية Claude، التعليم، المكتبة والترفيه")
    s = s.replace("استكشف كورس ChatGPT ومختبر الطلبات", "استكشف كورس Claude الاحترافي وأداة كتابة البرومت والخطة وكورس ChatGPT")
    s = must(s, '<a href="/prompt-studio/course/">الكورس</a><a href="/prompt-studio/">المختبر</a>',
             '<a href="/claude/">Claude</a><a href="/claude/course/">الكورس</a><a href="/claude/prompt-builder/">أداة البرومت</a><a href="/prompt-studio/">ChatGPT</a>')
    claude_sec = ('<section><h2>أكاديمية Claude</h2><p>كورس موسّع من 19 درسًا، وأداة تكتب المتطلبات والبرومت والخطة والاختبارات.</p>'
                  '<div><a href="/claude/course/">الكورس الاحترافي</a><a href="/claude/prompt-builder/">أداة المتطلبات والبرومت</a><a href="/articles/#ai">مقالات الذكاء الاصطناعي</a></div></section>')
    s = must(s, '<div class="hub-grid"><section><h2>أكاديمية ChatGPT</h2>', '<div class="hub-grid">' + claude_sec + '<section><h2>أكاديمية ChatGPT</h2>')
    spark = ('<section id="spark-home" style="background:linear-gradient(145deg,#fff7ed,#f6f0ff);padding:clamp(28px,5vw,60px) 0"><div class="wrap">'
             '<div class="center"><div class="eyebrow">يتجدد كل يوم</div><h2 class="h2">✨ إبداع اليوم في كل قسم</h2>'
             '<p class="lead">تحدٍّ في البرومت، ونشاط للأطفال، وعبارة إنجليزية، ونصيحة تاجر، ونصيحة مشاهدة، واقتراح للقراءة. عُد غدًا لتجد جديدًا.</p></div>'
             '<div data-spark="all"></div></div></section>' + SPARK)
    s = must(s, "</div></div></main>", "</div></div></main>\n" + spark)
    faq_d = '<details><summary>هل يوجد كورس مجاني لتعلّم Claude؟</summary><p>نعم، <a href="/claude/course/" style="color:var(--violet2)">كورس Claude</a> من 19 درسًا مجاني على الموقع، ومعه <a href="/claude/prompt-builder/" style="color:var(--violet2)">أداة تكتب المتطلبات والبرومت والخطة</a>. تحتاج فقط إلى حساب في Claude.</p></details>'
    s = must(s, '<details><summary>كيف أصبح موزّعًا؟</summary>', faq_d + '<details><summary>كيف أصبح موزّعًا؟</summary>')
    s = must(s, '{"@type":"Question","name":"هل يعمل على التلفزيون؟"',
             '{"@type":"Question","name":"هل يوجد كورس مجاني لتعلّم Claude؟","acceptedAnswer":{"@type":"Answer","text":"نعم، كورس Claude من 19 درسًا مجاني على موقع DIAMOND TV، ومعه أداة تكتب المتطلبات والبرومت والخطة. تحتاج فقط إلى حساب في Claude."}},\n{"@type":"Question","name":"هل يعمل على التلفزيون؟"')
    s = s.replace('<a href="/articles/" style="color:var(--violet2);font-weight:700;margin-inline:8px">المقالات</a>',
                  '<a href="/claude/" style="color:var(--violet2);font-weight:700;margin-inline:8px">أكاديمية Claude</a>·<a href="/articles/" style="color:var(--violet2);font-weight:700;margin-inline:8px">المقالات</a>', 1)
    wr("index.html", s)

# ---------- articles index ----------
a = rd("articles/index.html")
if "claude-prompt-writing-guide" not in a:
    a = must(a, '<section id="ai"><h2>دليل مختبر ChatGPT</h2>',
        '<section id="ai"><h2>الذكاء الاصطناعي: Claude والسيو</h2><ul class="directory">'
        '<li><a href="/claude/">أكاديمية Claude: الكورس والأداة</a></li>'
        '<li><a href="/articles/claude-prompt-writing-guide/">كيف تكتب برومت ناجحًا لـClaude</a></li>'
        '<li><a href="/articles/ten-claude-prompts-small-business/">10 برومتات جاهزة لصاحب المشروع الصغير</a></li>'
        '<li><a href="/articles/claude-projects-save-time/">مشاريع Claude: تعليمات مرة واحدة</a></li>'
        '<li><a href="/articles/claude-vs-chatgpt-how-to-choose/">Claude أم ChatGPT؟ كيف تختار بنفسك</a></li>'
        '<li><a href="/articles/reduce-ai-hallucinations/">كيف تقلل أخطاء الذكاء الاصطناعي</a></li>'
        '<li><a href="/articles/learn-english-with-ai-conversation/">تعلّم الإنجليزية بمحادثة مع الذكاء الاصطناعي</a></li>'
        '<li><a href="/articles/ai-content-for-seo-without-penalty/">كتابة مقالات السيو بالذكاء الاصطناعي</a></li>'
        '<li><a href="/articles/website-indexing-checklist/">قائمة فحص لأرشفة موقعك وفهرسته</a></li></ul>'
        '<h2>دليل مختبر ChatGPT</h2>')
    a = a.replace("دليل مقالات استخدام ChatGPT،", "دليل مقالات الذكاء الاصطناعي (Claude وChatGPT)، السيو،", 1)
    a = must(a, "</main>", '<div data-spark="articles"></div>' + SPARK + "</main>")
    wr("articles/index.html", a)

# ---------- creative blocks in other sections ----------
def inject(path, key, anchor, before=True):
    t = rd(path)
    if 'data-spark="%s"' % key in t: return
    blk = '<div data-spark="%s"></div>%s\n' % (key, SPARK)
    assert anchor in t, (path, anchor)
    t = t.replace(anchor, blk + anchor if before else anchor + blk, 1)
    wr(path, t)
inject("store/index.html", "library", "</main>")
inject("import/index.html", "import", "<footer>")
inject("mugharrid/index.html", "english", "<footer>")
inject("app/index.html", "app", "<footer>")
inject("prompt-studio/index.html", "claude", "<footer>")

# prompt studio: pointer to Claude
p = rd("prompt-studio/index.html")
if "/claude/" not in p.split("<main>")[0]:
    p = p.replace('<a href="#guides">دليل الأداة</a>', '<a href="#guides">دليل الأداة</a><a href="/claude/">أكاديمية Claude</a>', 1)
    wr("prompt-studio/index.html", p)
print("patched")
