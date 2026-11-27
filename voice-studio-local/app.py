# -*- coding: utf-8 -*-
"""DIAMOND Voice Studio (محلي) — استنساخ الصوت ونص إلى كلام بالعربية على جهازك.
يعمل بالكامل محليًا: لا يُرسل صوتك ولا نصك لأي خادم (بعد تنزيل النموذج أول مرة).
النموذج: Chatterbox Multilingual (ترخيص MIT) — يدعم العربية.
"""
import inspect
import os
import sys
import tempfile

import gradio as gr
import numpy as np
import torch
import torchaudio as ta

DEVICE = "cuda" if torch.cuda.is_available() else ("mps" if getattr(torch.backends, "mps", None) and torch.backends.mps.is_available() else "cpu")
print(f"الجهاز المستخدم: {DEVICE}")

_tts = None
_vc = None


def get_tts():
    global _tts
    if _tts is None:
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        try:
            _tts = ChatterboxMultilingualTTS.from_pretrained(device=DEVICE, t3_model="v3")
        except TypeError:
            _tts = ChatterboxMultilingualTTS.from_pretrained(device=DEVICE)
    return _tts


def get_vc():
    global _vc
    if _vc is None:
        from chatterbox.vc import ChatterboxVC
        _vc = ChatterboxVC.from_pretrained(DEVICE)
    return _vc


def _save(wav, sr):
    if isinstance(wav, np.ndarray):
        wav = torch.from_numpy(wav)
    if wav.dim() == 1:
        wav = wav.unsqueeze(0)
    path = os.path.join(tempfile.gettempdir(), f"dh_voice_{os.getpid()}_{np.random.randint(1e9)}.wav")
    ta.save(path, wav.cpu(), sr)
    return path


def _call(fn, **kw):
    """يمرّر فقط الوسائط التي تدعمها نسخة المكتبة المثبّتة."""
    ok = set(inspect.signature(fn).parameters)
    return fn(**{k: v for k, v in kw.items() if k in ok and v is not None})


def say(text, ref_audio, lang, exaggeration, cfg, temperature, seed):
    if not text or not text.strip():
        raise gr.Error("اكتب النص أولًا.")
    if ref_audio is None:
        raise gr.Error("ارفع أو سجّل صوتًا مرجعيًا (10–20 ثانية من كلام واضح).")
    m = get_tts()
    if seed and int(seed) > 0:
        torch.manual_seed(int(seed))
    wav = _call(m.generate, text=text.strip(), language_id=lang, audio_prompt_path=ref_audio,
                exaggeration=float(exaggeration), cfg_weight=float(cfg), temperature=float(temperature))
    return _save(wav, m.sr)


def convert(src_audio, ref_audio):
    if src_audio is None or ref_audio is None:
        raise gr.Error("ارفع الصوت الأصلي والصوت المرجعي.")
    m = get_vc()
    wav = m.generate(src_audio, target_voice_path=ref_audio)
    return _save(wav, m.sr)


CSS = "body,.gradio-container{direction:rtl;font-family:'Segoe UI',Tahoma,sans-serif}"

with gr.Blocks(title="DIAMOND Voice Studio", css=CSS) as demo:
    gr.Markdown("## 🎙 DIAMOND Voice Studio (محلي)\nاستنساخ الصوت والنطق بالعربية على جهازك. **استخدم صوتك أنت أو صوتًا لديك إذن صريح من صاحبه، ولا تستخدم النتيجة للانتحال أو الخداع.**")
    ok = gr.Checkbox(label="أؤكد أن الصوت المرجعي صوتي أنا أو لدي إذن صاحبه", value=False)
    with gr.Tab("نص ← كلام بصوت المرجع"):
        text = gr.Textbox(label="النص", lines=5, rtl=True, placeholder="اكتب النص بالعربية (التشكيل الخفيف يحسّن النطق أحيانًا)")
        ref = gr.Audio(label="الصوت المرجعي (10–20 ثانية نظيفة، بلا موسيقى)", sources=["upload", "microphone"], type="filepath")
        lang = gr.Dropdown([("العربية", "ar"), ("English", "en"), ("Français", "fr"), ("Español", "es"), ("Türkçe", "tr"), ("עברית", "he")], value="ar", label="اللغة")
        with gr.Row():
            ex = gr.Slider(0.25, 2.0, 0.5, step=0.05, label="الانفعال")
            cfg = gr.Slider(0.0, 1.0, 0.5, step=0.05, label="التمسّك بالمرجع (CFG)")
            temp = gr.Slider(0.3, 1.2, 0.8, step=0.05, label="التنويع")
            seed = gr.Number(0, label="بذرة (0 = عشوائي)", precision=0)
        go = gr.Button("🎙 ولّد الصوت", variant="primary")
        out = gr.Audio(label="النتيجة", type="filepath")

        def guarded_say(ok_, *a):
            if not ok_:
                raise gr.Error("أكّد أولًا أن الصوت المرجعي صوتك أو لديك إذن صاحبه.")
            return say(*a)
        go.click(guarded_say, [ok, text, ref, lang, ex, cfg, temp, seed], out)
    with gr.Tab("تحويل تسجيل إلى صوت المرجع"):
        gr.Markdown("سجّل كلامك أو ارفع ملفًا، فيتحوّل إلى نبرة الصوت المرجعي مع بقاء كلامك وإيقاعك.")
        src = gr.Audio(label="كلامك (الأصل)", sources=["upload", "microphone"], type="filepath")
        ref2 = gr.Audio(label="الصوت المرجعي", sources=["upload", "microphone"], type="filepath")
        go2 = gr.Button("🔁 حوّل", variant="primary")
        out2 = gr.Audio(label="النتيجة", type="filepath")

        def guarded_conv(ok_, a, b):
            if not ok_:
                raise gr.Error("أكّد أولًا أن الصوت المرجعي صوتك أو لديك إذن صاحبه.")
            return convert(a, b)
        go2.click(guarded_conv, [ok, src, ref2], out2)
    gr.Markdown("ملاحظة: الملفات الناتجة تحمل علامة مائية غير مسموعة (Perth) من النموذج لتمييز الصوت المولّد. أول تشغيل ينزّل النموذج (عدة جيجابايت).")

if __name__ == "__main__":
    demo.queue().launch(inbrowser=True, server_name="127.0.0.1")
