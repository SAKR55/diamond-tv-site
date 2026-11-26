# -*- coding: utf-8 -*-
"""اختبار مهارة الذكاء الاصطناعي: عربي /tools/ai-skill-quiz/ وإنجليزي /en/ai-skill-quiz/"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from portal_common import *
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def write(p, s):
    os.makedirs(os.path.dirname(os.path.join(R, p)), exist_ok=True); open(os.path.join(R, p), 'w', encoding='utf-8').write(s)
AR_U, EN_U = '/tools/ai-skill-quiz/', '/en/ai-skill-quiz/'
CSS = '''<style>.aq{max-width:680px;margin:0 auto;padding:18px}.aq-bg{height:8px;background:#ece8fb;border-radius:8px;overflow:hidden;margin:8px 0 18px}#aq-bar{height:100%;width:0;background:#7c3aed;transition:width .3s}
.aq h2{font-size:21px;line-height:1.6;margin:6px 0 14px}.aq-opt{display:block;width:100%;text-align:start;padding:14px;margin:8px 0;border:1px solid #d8d4ee;border-radius:12px;background:#fff;font:inherit;cursor:pointer}.aq-opt:hover,.aq-opt:focus{border-color:#7c3aed;background:#faf9ff}
#aq-res{display:none;text-align:center}#aq-pct{font-size:78px;font-weight:900;color:#7c3aed;line-height:1.1}#aq-lv{font-size:26px;font-weight:800}.aq-btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:18px 0}.aq-btns button{padding:11px 16px;border:0;border-radius:10px;background:#7c3aed;color:#fff;font:inherit;font-weight:700;cursor:pointer}.aq-btns button.s{background:#25D366}
.aq-r{text-align:start;background:#faf9ff;border:1px solid #e6e1fb;border-radius:12px;padding:12px;margin:8px 0}#aq-ch{display:none;background:#fff7e6;border:1px solid #f5d28a;border-radius:12px;padding:12px;margin:0 0 14px;font-weight:700}.aq-info{max-width:680px;margin:6px auto 30px;padding:0 18px;line-height:1.9}</style>'''
def widget(ar):
    L = dict(rv='ما يمكنك تحسينه' if ar else 'What to improve', dl='حمّل بطاقة النتيجة' if ar else 'Download result card', sh='شارك النتيجة' if ar else 'Share result', cp='انسخ رابط التحدي' if ar else 'Copy challenge link', re='أعد الاختبار' if ar else 'Retake')
    return f'''<main class="aq"><div id="aq-ch"></div><div id="aq-quiz"><div id="aq-n" style="font-weight:700"></div><div class="aq-bg"><div id="aq-bar"></div></div><h2 id="aq-t"></h2><div id="aq-o"></div></div>
<div id="aq-res"><div id="aq-pct"></div><div id="aq-lv"></div><p id="aq-ds"></p><div class="aq-btns"><button class="s" id="aq-sh" type="button">{L['sh']}</button><button id="aq-dl" type="button">{L['dl']}</button><button id="aq-cp" type="button">{L['cp']}</button><button id="aq-re" type="button">{L['re']}</button></div><h3>{L['rv']}</h3><div id="aq-rev"></div></div></main>'''
AR_F = [("هل النتيجة تقييم رسمي؟","لا، هو اختبار تعليمي سريع لعاداتك في الاستعمال، وليس شهادة."),("هل تُحفظ إجاباتي؟","لا. كل شيء يجري في متصفحك ولا يُرسل لأي خادم."),("كم يستغرق؟","نحو دقيقتين لعشرة أسئلة."),("كيف أشارك نتيجتي؟","حمّل بطاقة النتيجة كصورة أو انسخ رابط التحدي وأرسله لأصدقائك ليجرّبوا ويقارنوا.")]
EN_F = [("Is this an official assessment?","No. It is a quick educational check of your AI habits, not a certificate."),("Are my answers saved?","No. Everything runs in your browser and nothing is sent to a server."),("How long does it take?","About two minutes for ten questions."),("How do I share my result?","Download the result card as an image or copy the challenge link and send it to friends so they can try and compare.")]
def ld(p): return '<script type="application/ld+json">'+json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in p]},ensure_ascii=False)+'</script>'
ALT = f'<link rel="alternate" hreflang="ar" href="{BASE}{AR_U}"><link rel="alternate" hreflang="en" href="{BASE}{EN_U}"><link rel="alternate" hreflang="x-default" href="{BASE}{EN_U}">'
info = ''.join(f'<h3>{q}</h3><p>{a}</p>' for q, a in AR_F)
body = hero('ما مستواك في الذكاء الاصطناعي؟', 'عشرة أسئلة سريعة عن عادات الاستعمال والتحقق والخصوصية، ثم بطاقة نتيجة تشاركها مع أصدقائك.', eyebrow='🎯 اختبار مجاني')
body += CSS + widget(True) + f'<section class="aq-info"><h2>أسئلة شائعة</h2>{info}<p><a href="/claude/course/">📘 تعلّم أكثر في دورة Claude</a> · <a href="/tools/">كل الأدوات</a></p></section><script src="/assets/aiquiz.js" defer></script>'
write(AR_U.strip('/') + '/index.html', page(AR_U, 'اختبار: ما مستواك في الذكاء الاصطناعي؟ | DIAMOND HUB', 'اختبار مجاني من 10 أسئلة يقيس عاداتك في استعمال الذكاء الاصطناعي، مع نتيجة وبطاقة تشاركها مع أصدقائك.', body, extra_ld=ALT + ld(AR_F) + breadcrumb([("الرئيسية","/"),("الأدوات","/tools/"),("اختبار الذكاء الاصطناعي",AR_U)]), active='/tools/'))
t, d = 'AI Skill Quiz: How Good Are You With AI? | DIAMOND HUB', 'Free 10-question quiz on how you use AI: prompting, verifying answers and privacy. Get a score and a shareable result card.'
info = ''.join(f'<h3>{q}</h3><p>{a}</p>' for q, a in EN_F)
en = f'''<!DOCTYPE html>
<html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{t}</title><meta name="description" content="{d}"><link rel="canonical" href="{BASE}{EN_U}"><meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:site_name" content="DIAMOND HUB"><meta property="og:title" content="{t}"><meta property="og:description" content="{d}"><meta property="og:url" content="{BASE}{EN_U}"><meta property="og:image" content="{BASE}/assets/og.png"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#7c3aed"><link rel="icon" href="/assets/icon.svg" type="image/svg+xml">{ALT}{ld(EN_F)}
<style>body{{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1c1830}}header.h{{background:linear-gradient(135deg,#4c1d95,#7c3aed);color:#fff;padding:34px 18px;text-align:center}}header.h h1{{margin:0 0 8px;font-size:30px}}header.h p{{margin:0 auto;max-width:600px;opacity:.92}}footer.f{{text-align:center;padding:24px;color:#666;font-size:14px}}a{{color:#6d28d9}}</style></head><body>
<header class="h"><div style="margin-bottom:8px"><a href="/" style="color:#fff">DIAMOND HUB</a> · <a href="{AR_U}" style="color:#fff">العربية</a></div><h1>How good are you with AI?</h1><p>Ten quick questions about prompting, verifying answers and privacy. Get your score and a card to share with friends.</p></header>
{CSS}{widget(False)}<section class="aq-info"><h2>FAQ</h2>{info}</section><footer class="f">© 2026 DIAMOND HUB · <a href="/">Home</a> · <a href="{AR_U}">العربية</a></footer><script src="/assets/aiquiz.js" defer></script></body></html>'''
write(EN_U.strip('/') + '/index.html', en)
print('quiz built')
