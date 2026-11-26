# -*- coding: utf-8 -*-
"""مولّد رابط واتساب وQR: نسخة عربية /tools/whatsapp-link-generator/ وإنجليزية /en/whatsapp-link-generator/"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from portal_common import *
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def write(p, s):
    os.makedirs(os.path.dirname(os.path.join(R, p)), exist_ok=True)
    open(os.path.join(R, p), 'w', encoding='utf-8').write(s)
AR_U, EN_U = '/tools/whatsapp-link-generator/', '/en/whatsapp-link-generator/'
CSS = '''<style>.wa{max-width:760px;margin:0 auto;padding:18px}.wa label{display:block;font-weight:700;margin:12px 0 4px}.wa input,.wa select,.wa textarea{width:100%;padding:11px;border:1px solid #d8d4ee;border-radius:10px;font:inherit;box-sizing:border-box;background:#fff}
.wa .row{display:flex;gap:8px;flex-wrap:wrap}.wa .row>*{flex:1;min-width:0}.wa button{padding:10px 16px;border:0;border-radius:10px;background:#7c3aed;color:#fff;font:inherit;font-weight:700;cursor:pointer}.wa button:disabled{opacity:.5}.wa .g{background:#25D366}
.wa .box{background:#faf9ff;border:1px solid #e6e1fb;border-radius:14px;padding:14px;margin-top:14px}.wa canvas{max-width:260px;width:100%;margin:10px auto;display:block;border:1px solid #eee;border-radius:10px}.wa .err{color:#b91c1c;min-height:20px;margin-top:8px}.wa input[type=color]{height:42px;padding:3px;width:70px;flex:none}
.wa-info{max-width:760px;margin:10px auto 30px;padding:0 18px;line-height:1.9}.wa-info h2{margin-top:26px}</style>'''
def form(ar):
    L = dict(cc='رمز الدولة' if ar else 'Country code', num='رقم الهاتف' if ar else 'Phone number', ph='مثال: 5xxxxxxxx' if ar else 'e.g. 5551234567',
             txt='رسالة جاهزة (اختياري)' if ar else 'Pre-filled message (optional)', tph='مرحبًا، أريد الاستفسار عن...' if ar else 'Hi, I would like to ask about...',
             link='رابطك المباشر' if ar else 'Your direct link', cp='نسخ' if ar else 'Copy', op='فتح للتجربة' if ar else 'Open to test', qr='رمز QR' if ar else 'QR code',
             col='لون الرمز' if ar else 'QR color', dl='تحميل PNG' if ar else 'Download PNG', hb='كود زر HTML لموقعك' if ar else 'HTML button for your website')
    return f'''<main class="wa"><div class="row"><div><label for="wa-cc">{L['cc']}</label><select id="wa-cc"></select></div><div><label for="wa-num">{L['num']}</label><input id="wa-num" inputmode="tel" placeholder="{L['ph']}" autocomplete="off" style="direction:ltr"></div></div>
<label for="wa-text">{L['txt']}</label><textarea id="wa-text" rows="3" placeholder="{L['tph']}"></textarea><div class="err" id="wa-msg" role="alert"></div>
<div class="box"><label for="wa-link">{L['link']}</label><input id="wa-link" readonly style="direction:ltr"><div class="row" style="margin-top:8px"><button class="g" id="wa-cplink" type="button">{L['cp']}</button><button id="wa-open" type="button">{L['op']}</button></div></div>
<div class="box"><b>{L['qr']}</b><canvas id="wa-qr" style="display:none"></canvas><div class="row" style="align-items:center"><div style="flex:none"><label for="wa-fg" style="margin:0">{L['col']}</label></div><input type="color" id="wa-fg" value="#075e54"><button id="wa-dl" type="button" disabled>{L['dl']}</button></div></div>
<div class="box"><label for="wa-html">{L['hb']}</label><textarea id="wa-html" rows="3" readonly style="direction:ltr;font-size:12px"></textarea><button id="wa-cphtml" type="button" style="margin-top:8px">{L['cp']}</button></div></main>'''
AR_FAQ = [("هل تُرسل بياناتي إلى أي جهة؟","لا. كل شيء يُحسب داخل متصفحك، ولا يُخزَّن رقمك ولا رسالتك."),
 ("كيف أكتب الرقم؟","اختر الدولة واكتب الرقم دون صفر البداية، مثل 5xxxxxxxx للسعودية. يمكنك أيضًا لصق الرقم كاملًا بالرمز الدولي."),
 ("هل يعمل الرابط مع واتساب للأعمال؟","نعم، رابط wa.me يعمل مع واتساب العادي وواتساب للأعمال، ويفتح محادثة مع الرقم ومعها الرسالة الجاهزة."),
 ("لماذا لا يظهر رمز QR؟","إن كانت الرسالة طويلة جدًا فلن يتسع الرمز لها؛ اختصرها أو اترك الرسالة فارغة."),
 ("أين أستعمل الرمز؟","في بطاقات العمل والفواتير والملصقات ومنتجاتك، ليبدأ العميل المحادثة بمسح الرمز فقط.")]
EN_FAQ = [("Is my data sent anywhere?","No. Everything is calculated in your browser; your number and message are never stored."),
 ("How do I enter the number?","Pick the country and type the number without the leading zero. You can also paste the full number with the international prefix."),
 ("Does it work with WhatsApp Business?","Yes. A wa.me link opens a chat with that number, with your message pre-filled, in both WhatsApp and WhatsApp Business."),
 ("Why is the QR code missing?","If the message is very long the code cannot hold it. Shorten the message or leave it empty."),
 ("Where can I use the QR code?","On business cards, invoices, flyers and product packaging, so customers start a chat by scanning.")]
def faq_ld(p): return '<script type="application/ld+json">'+json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in p]},ensure_ascii=False)+'</script>'
ALT = f'<link rel="alternate" hreflang="ar" href="{BASE}{AR_U}"><link rel="alternate" hreflang="en" href="{BASE}{EN_U}"><link rel="alternate" hreflang="x-default" href="{BASE}{EN_U}">'
# ---- عربي
info = ''.join(f'<h3>{q}</h3><p>{a}</p>' for q, a in AR_FAQ)
body = hero('مولّد رابط واتساب ورمز QR', 'اكتب رقمك ورسالتك واحصل على رابط wa.me مباشر ورمز QR جاهز للطباعة وكود زر لموقعك — مجانًا وبلا تسجيل.', eyebrow='🟢 أداة مجانية')
body += CSS + form(True) + f'<section class="wa-info"><h2>كيف تستعمل الرابط؟</h2><p>ضع الرابط في سيرتك على إنستغرام، وفي توقيع بريدك، وفي إعلاناتك. حين يضغط العميل عليه تُفتح محادثة واتساب معك والرسالة مكتوبة مسبقًا، فلا يضيع وقت في كتابة رقمك أو حفظه.</p><h2>أسئلة شائعة</h2>{info}<p><a href="/tools/">← كل الأدوات المجانية</a></p></section><script src="/assets/qr.js"></script><script src="/assets/wa.js" defer></script>'
write(AR_U.strip('/') + '/index.html', page(AR_U, 'مولّد رابط واتساب ورمز QR مجاني | DIAMOND HUB', 'أنشئ رابط واتساب مباشرًا ورمز QR للطباعة وكود زر لموقعك، مع رسالة جاهزة. مجاني وبلا تسجيل ويعمل في متصفحك.', body, extra_ld=ALT + faq_ld(AR_FAQ) + breadcrumb([("الرئيسية","/"),("الأدوات","/tools/"),("مولّد رابط واتساب",AR_U)]), active='/tools/'))
# ---- English
info = ''.join(f'<h3>{q}</h3><p>{a}</p>' for q, a in EN_FAQ)
t, d = 'Free WhatsApp Link & QR Code Generator | DIAMOND HUB', 'Create a direct WhatsApp chat link, a printable QR code and a website button with a pre-filled message. Free, no sign-up, runs in your browser.'
page_en = f'''<!DOCTYPE html>
<html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{t}</title><meta name="description" content="{d}"><link rel="canonical" href="{BASE}{EN_U}"><meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:site_name" content="DIAMOND HUB"><meta property="og:title" content="{t}"><meta property="og:description" content="{d}"><meta property="og:url" content="{BASE}{EN_U}"><meta property="og:image" content="{BASE}/assets/og.png"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#7c3aed"><link rel="icon" href="/assets/icon.svg" type="image/svg+xml">{ALT}{faq_ld(EN_FAQ)}
<style>body{{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1c1830;background:#fff}}header.h{{background:linear-gradient(135deg,#4c1d95,#7c3aed);color:#fff;padding:34px 18px;text-align:center}}header.h h1{{margin:0 0 8px;font-size:30px}}header.h p{{margin:0 auto;max-width:620px;opacity:.92}}footer.f{{text-align:center;padding:24px;color:#666;font-size:14px}}a{{color:#6d28d9}}</style></head><body>
<header class="h"><div style="margin-bottom:8px"><a href="/" style="color:#fff">DIAMOND HUB</a> · <a href="{AR_U}" style="color:#fff">العربية</a></div><h1>WhatsApp Link &amp; QR Code Generator</h1><p>Enter a number and an optional message. Get a direct wa.me link, a printable QR code and a ready-made website button — free, no sign-up.</p></header>
{CSS}{form(False)}<section class="wa-info"><h2>How to use your link</h2><p>Add the link to your Instagram bio, email signature, ads or website. When a customer taps it, a WhatsApp chat opens with your number and the message already typed, so nobody has to save or retype your number.</p><h2>FAQ</h2>{info}</section>
<footer class="f">© 2026 DIAMOND HUB · <a href="/">Home</a> · <a href="{AR_U}">العربية</a></footer><script src="/assets/qr.js"></script><script src="/assets/wa.js" defer></script></body></html>'''
write(EN_U.strip('/') + '/index.html', page_en)
print('wa pages built')
