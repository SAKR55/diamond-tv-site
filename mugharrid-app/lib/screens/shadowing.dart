import 'package:flutter/material.dart';

import '../core/speech.dart';
import '../core/store.dart';
import '../data/content.dart';
import '../ui/common.dart';

/// ردد بعدي: يسمع المتعلم الجملة ثم يكررها، والجوال يحدد الكلمات التي لم يلتقطها.
class ShadowingScreen extends StatefulWidget {
  const ShadowingScreen({super.key});

  @override
  State<ShadowingScreen> createState() => _ShadowingScreenState();
}

class _ShadowingScreenState extends State<ShadowingScreen> with TimedState<ShadowingScreen> {
  late final List<Phrase> _list;
  int _i = 0;
  String _heard = '';
  PronResult? _result;
  bool _listening = false;
  bool _noMic = false;

  Phrase get _p => _list[_i];

  @override
  void initState() {
    super.initState();
    _list = List<Phrase>.from(phrasesFor(AppStore.I.level))..shuffle();
    Speech.I.onStatus = _onStatus;
    WidgetsBinding.instance.addPostFrameCallback((_) => Speech.I.say(_p.en));
  }

  void _onStatus(String status) {
    if (!mounted || !_listening) return;
    if (status == 'done' || status == 'notListening') {
      setState(() => _listening = false);
      if (_result == null && _heard.trim().isNotEmpty) _evaluate();
    }
  }

  Future<void> _record() async {
    if (_listening) {
      await Speech.I.stopListening();
      return;
    }
    setState(() {
      _heard = '';
      _result = null;
      _listening = true;
      _noMic = false;
    });
    final ok = await Speech.I.listen(
      onText: (text, isFinal) {
        if (!mounted) return;
        setState(() => _heard = text);
        if (isFinal) _evaluate();
      },
    );
    if (!mounted) return;
    if (!ok) {
      setState(() {
        _listening = false;
        _noMic = true;
      });
    }
  }

  void _evaluate() {
    if (_result != null) return;
    final r = comparePronunciation(_p.en, _heard);
    setState(() {
      _result = r;
      _listening = false;
    });
    for (final w in r.missed.take(3)) {
      AppStore.I.addMistake(
        kind: 'pron',
        prompt: 'كلمة لم تتضح في الجملة: ${_p.en}',
        wrong: '',
        correct: w,
        note: 'استمع للكلمة ببطء ثم كررها ثلاث مرات.',
      );
    }
    if (r.percent >= 80) AppStore.I.bump('shadow');
  }

  void _next() {
    setState(() {
      _i = (_i + 1) % _list.length;
      _heard = '';
      _result = null;
      _noMic = false;
    });
    Speech.I.say(_p.en);
  }

  @override
  Widget build(BuildContext context) {
    final r = _result;
    return Scaffold(
      appBar: AppBar(title: const Text('ردد بعدي')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            Text('الجملة ${_i + 1} من ${_list.length}', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: kLine)),
              child: Column(
                children: [
                  En(_p.en, align: TextAlign.center, style: const TextStyle(fontSize: 23, fontWeight: FontWeight.w700, color: kInk, height: 1.4)),
                  const SizedBox(height: 8),
                  Text(_p.ar, textAlign: TextAlign.center, style: const TextStyle(color: kMuted, fontSize: 15)),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [SpeakButton(_p.en), SpeakButton(_p.en, slow: true)],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),
            Center(
              child: GestureDetector(
                onTap: _record,
                child: Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(color: _listening ? kCoral : kTeal, shape: BoxShape.circle),
                  child: Icon(_listening ? Icons.stop_rounded : Icons.mic_rounded, color: Colors.white, size: 44),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              _listening ? 'أسمعك الآن... اضغط للإيقاف' : 'اضغط ثم قل الجملة بصوت واضح',
              textAlign: TextAlign.center,
              style: const TextStyle(color: kMuted),
            ),
            if (_noMic) ...[
              const SizedBox(height: 12),
              const FeedbackBox(
                ok: false,
                text: 'تعذر تشغيل الميكروفون. تأكد من منح إذن الميكروفون ومن وجود خدمة التعرف على الكلام من Google في الجوال. تستطيع مواصلة التمرين بالاستماع والتكرار.',
              ),
            ],
            if (_heard.isNotEmpty && r == null) ...[
              const SizedBox(height: 14),
              En(_heard, align: TextAlign.center, style: const TextStyle(fontSize: 16, color: kMuted)),
            ],
            if (r != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: r.percent >= 80 ? kOkBg : kBadBg, borderRadius: BorderRadius.circular(18)),
                child: Column(
                  children: [
                    Text('${r.percent}%', textDirection: TextDirection.ltr, style: TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: r.percent >= 80 ? kOk : kBad)),
                    const SizedBox(height: 6),
                    Directionality(
                      textDirection: TextDirection.ltr,
                      child: Wrap(
                        alignment: WrapAlignment.center,
                        spacing: 6,
                        runSpacing: 4,
                        children: [
                          for (final w in r.words)
                            Text(
                              w.word,
                              style: TextStyle(
                                fontSize: 19,
                                fontWeight: FontWeight.w700,
                                color: w.ok ? kOk : kBad,
                                decoration: w.ok ? TextDecoration.none : TextDecoration.underline,
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      r.percent == 100
                          ? 'ممتاز، كل الكلمات واضحة.'
                          : (r.percent >= 80 ? 'جيد جداً. الكلمات الحمراء لم تتضح، وأضفناها لدفتر أخطائك.' : 'الكلمات الحمراء لم تتضح. استمع ببطء وحاول مرة أخرى.'),
                      textAlign: TextAlign.center,
                      style: const TextStyle(height: 1.6, color: kInk),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 18),
            FilledButton(onPressed: _next, child: const Text('الجملة التالية')),
            const SizedBox(height: 14),
            const Text(
              'التقييم يعتمد على ما يفهمه محرك التعرف على الكلام في جوالك: يقيس وضوح الكلمة لا دقة مخارج الحروف.',
              textAlign: TextAlign.center,
              style: TextStyle(color: kMuted, fontSize: 12, height: 1.6),
            ),
          ],
        ),
      ),
    );
  }
}
