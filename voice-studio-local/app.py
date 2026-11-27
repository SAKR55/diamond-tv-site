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

import re


def split_text(text, maxlen=180):
    """يقسّم النص الطويل على علامات الترقيم العربية واللاتينية إلى مقاطع قصيرة (الجودة أعلى مع الجمل القصيرة)."""
    text = re.sub(r"\s+", " ", text.strip())
    parts = re.split(r"(?<=[\.\!\?\؟\؛\:\n])\s+|(?<=،)\s+", text)
    out, cur = [], ""
    for p in parts:
        if not p:
            continue
        if len(cur) + len(p) + 1 <= maxlen:
            cur = (cur + " " + p).strip()
        else:
            if cur:
                out.append(cur)
            while len(p) > maxlen:
                cut = p.rfind(" ", 0, maxlen)
                cut = cut if cut > 40 else maxlen
                out.append(p[:cut].strip())
                p = p[cut:].strip()
            cur = p
    if cur:
        out.append(cur)
    return out


def prep_reference(path, max_sec=20.0, target_sr=24000):
    """يجهّز الصوت المرجعي: أحادي، قص الصمت، اختيار أعلى مقطع نظيف بطول max_sec، تطبيع المستوى. يعيد (مسار، مدة، ملاحظة)."""
    wav, sr = ta.load(path)
    wav = wav.mean(0, keepdim=True)
    if sr != target_sr:
        wav = ta.functional.resample(wav, sr, target_sr)
        sr = target_sr
    x = wav[0].numpy().astype("float32")
    frame = int(0.03 * sr)
    n = len(x) // frame
    if n < 10:
        raise gr.Error("الصوت المرجعي قصير جدًا.")
    e = np.sqrt((x[: n * frame].reshape(n, frame) ** 2).mean(1) + 1e-12)
    thr = max(np.percentile(e, 20) * 1.5, e.max() * 0.03)
    voiced = np.where(e > thr)[0]
    if len(voiced) == 0:
        raise gr.Error("لم أجد كلامًا واضحًا في المرجع.")
    a, b = voiced[0] * frame, (voiced[-1] + 1) * frame
    x = x[a:b]
    win = int(max_sec * sr)
    if len(x) > win:
        step = int(sr)
        best, bi = -1.0, 0
        for i in range(0, len(x) - win + 1, step):
            seg = x[i:i + win]
            ee = np.sqrt((seg[: (len(seg) // frame) * frame].reshape(-1, frame) ** 2).mean(1))
            score = float((ee > thr).mean()) * 2 + float(np.median(ee[ee > thr]) if (ee > thr).any() else 0)
            if score > best:
                best, bi = score, i
        x = x[bi:bi + win]
    pk = float(np.abs(x).max()) or 1.0
    x = x / pk * 0.9
    dur = len(x) / sr
    note = ""
    if dur < 6:
        note = "المرجع أقصر من 6 ثوانٍ؛ سجّل 10–20 ثانية لنتيجة أدق."
    outp = os.path.join(tempfile.gettempdir(), f"dh_ref_{os.getpid()}.wav")
    ta.save(outp, torch.from_numpy(x).unsqueeze(0), sr)
    return outp, dur, note


def speaker_embed(model, wav_t, sr):
    """بصمة المتكلم من مشفّر النموذج إن توفّر (للمفاضلة بين المحاولات)، وإلا None."""
    try:
        w = wav_t.squeeze().cpu().numpy()
        if sr != 16000:
            w = ta.functional.resample(torch.from_numpy(w).unsqueeze(0), sr, 16000).squeeze().numpy()
        e = model.ve.embeds_from_wavs([w], sample_rate=16000)
        e = np.asarray(e).mean(0)
        return e / (np.linalg.norm(e) + 1e-9)
    except Exception:
        return None


import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

INBOX = os.path.join(tempfile.gettempdir(), "dh_voice_inbox.wav")


class _Recv(BaseHTTPRequestHandler):
    """يستقبل الصوت المرجعي من إضافة المتصفح على 127.0.0.1:7861 فقط. يرفض الطلبات التي لا تحمل ترويسة الإضافة."""

    def do_POST(self):
        if self.path != "/ref" or self.headers.get("X-DH-Ext") != "1":
            self.send_response(403); self.end_headers(); return
        n = int(self.headers.get("Content-Length", 0))
        if n <= 0 or n > 60 * 1024 * 1024:
            self.send_response(413); self.end_headers(); return
        with open(INBOX, "wb") as f:
            f.write(self.rfile.read(n))
        self.send_response(200); self.end_headers(); self.wfile.write(b"ok")

    def do_OPTIONS(self):
        self.send_response(403); self.end_headers()

    def log_message(self, *a):
        pass


def start_receiver():
    try:
        srv = HTTPServer(("127.0.0.1", 7861), _Recv)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        print("جاهز لاستقبال الصوت من إضافة المتصفح على المنفذ 7861")
    except OSError as e:
        print("تعذّر فتح المنفذ 7861:", e)


def take_inbox():
    if not os.path.exists(INBOX):
        raise gr.Error("لا يوجد صوت قادم من الإضافة بعد. أرسله من نافذة الإضافة أولًا.")
    return INBOX, INBOX


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


def say(text, ref_audio, lang, exaggeration, cfg, temperature, seed, tries):
    if not text or not text.strip():
        raise gr.Error("اكتب النص أولًا.")
    if ref_audio is None:
        raise gr.Error("ارفع أو سجّل صوتًا مرجعيًا (10–20 ثانية من كلام واضح).")
    m = get_tts()
    ref_path, dur, note = prep_reference(ref_audio)
    print(f"المرجع بعد التجهيز: {dur:.1f} ث. {note}")
    ref_emb = None
    try:
        rw, rsr = ta.load(ref_path)
        ref_emb = speaker_embed(m, rw, rsr)
    except Exception:
        pass
    chunks = split_text(text)
    tries = max(1, int(tries))
    base_seed = int(seed) if seed and int(seed) > 0 else int(np.random.randint(1, 10**6))
    pieces = []
    for ci, chunk in enumerate(chunks):
        best, best_s = None, -2.0
        for t in range(tries):
            torch.manual_seed(base_seed + ci * 101 + t)
            wav = _call(m.generate, text=chunk, language_id=lang, audio_prompt_path=ref_path,
                        exaggeration=float(exaggeration), cfg_weight=float(cfg), temperature=float(temperature))
            if wav.dim() == 1:
                wav = wav.unsqueeze(0)
            score = 0.0
            if ref_emb is not None and tries > 1:
                e = speaker_embed(m, wav, m.sr)
                score = float(np.dot(e, ref_emb)) if e is not None else 0.0
            if best is None or score > best_s:
                best, best_s = wav, score
        pieces.append(best.cpu())
    gap = torch.zeros(1, int(0.18 * m.sr))
    full = pieces[0]
    for p in pieces[1:]:
        full = torch.cat([full, gap, p], dim=1)
    pk = float(full.abs().max()) or 1.0
    full = full / pk * 0.92
    return _save(full, m.sr)


def convert(src_audio, ref_audio):
    if src_audio is None or ref_audio is None:
        raise gr.Error("ارفع الصوت الأصلي والصوت المرجعي.")
    m = get_vc()
    wav = m.generate(src_audio, target_voice_path=ref_audio)
    return _save(wav, m.sr)


CSS = "body,.gradio-container{direction:rtl;font-family:'Segoe UI',Tahoma,sans-serif}"

with gr.Blocks(title="DIAMOND Voice Studio", css=CSS) as demo:
    gr.Markdown("## 🎙 DIAMOND Voice Studio (محلي)\nاستنساخ الصوت والنطق بالعربية على جهازك. **استخدم صوتك أنت أو صوتًا لديك إذن صريح من صاحبه، ولا تستخدم النتيجة للانتحال أو الخداع.**")
    inbox = gr.Button("📥 استخدم المرجع القادم من الإضافة")
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
            tries = gr.Slider(1, 5, 3, step=1, label="عدد المحاولات (يختار الأقرب للمرجع)")
        go = gr.Button("🎙 ولّد الصوت", variant="primary")
        out = gr.Audio(label="النتيجة", type="filepath")

        def guarded_say(ok_, *a):
            if not ok_:
                raise gr.Error("أكّد أولًا أن الصوت المرجعي صوتك أو لديك إذن صاحبه.")
            return say(*a)
        go.click(guarded_say, [ok, text, ref, lang, ex, cfg, temp, seed, tries], out)
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
    inbox.click(take_inbox, None, [ref, ref2])
    gr.Markdown("ملاحظة: الملفات الناتجة تحمل علامة مائية غير مسموعة (Perth) من النموذج لتمييز الصوت المولّد. أول تشغيل ينزّل النموذج (عدة جيجابايت).")

if __name__ == "__main__":
    start_receiver()
    demo.queue().launch(inbrowser=True, server_name="127.0.0.1")
