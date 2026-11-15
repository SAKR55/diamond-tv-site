import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';

import '../core/speech.dart';
import '../core/store.dart';
import '../data/content.dart';
import '../ui/common.dart';
import '../ui/speech_review.dart';

// =====================================================================
// تحدي الدقيقة: يتحدث المتعلم دقيقة كاملة عن موضوع، ونعدّ الكلمات التي قالها.
// =====================================================================

class MinuteChallengeScreen extends StatefulWidget {
  const MinuteChallengeScreen({super.key});

  @override
  State<MinuteChallengeScreen> createState() => _MinuteChallengeScreenState();
}

class _MinuteChallengeScreenState extends State<MinuteChallengeScreen> with TimedState<MinuteChallengeScreen> {
  final Random _r = Random();
  late Topic _topic;
  int _left = 60;
  bool _running = false;
  bool _done = false;
  bool _noMic = false;
  int _words = 0;
  final List<String> _finals = [];
  String _partial = '';
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _topic = minuteTopics[_r.nextInt(minuteTopics.length)];
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _newTopic() {
    if (_running) return;
    setState(() {
      _topic = minuteTopics[_r.nextInt(minuteTopics.length)];
      _done = false;
    });
  }

  Future<void> _start() async {
    final ok = await Speech.I.ensureStt();
    if (!mounted) return;
    if (!ok) {
      setState(() => _noMic = true);
      return;
    }
    setState(() {
      _running = true;
      _done = false;
      _noMic = false;
      _left = 60;
      _finals.clear();
      _partial = '';
    });
    Speech.I.onStatus = _onStatus;
    _listen();
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() => _left--);
      if (_left <= 0) _finish();
    });
  }

  void _listen() {
    Speech.I.listen(
      listenFor: const Duration(seconds: 60),
      pauseFor: const Duration(seconds: 6),
      onText: (text, isFinal) {
        if (!mounted || !_running) return;
        setState(() {
          if (isFinal) {
            if (text.trim().isNotEmpty) _finals.add(text);
            _partial = '';
          } else {
            _partial = text;
          }
        });
      },
    );
  }

  /// محرك التعرف على الكلام يتوقف عند الصمت، فنعيد تشغيله ما دام الوقت جارياً.
  void _onStatus(String status) {
    if (status != 'done' || !_running || !mounted) return;
    if (_partial.trim().isNotEmpty) {
      _finals.add(_partial);
      _partial = '';
    }
    Future<void>.delayed(const Duration(milliseconds: 350), () {
      if (mounted && _running) _listen();
    });
  }

  Future<void> _finish() async {
    if (!_running) return;
    _timer?.cancel();
    _running = false;
    await Speech.I.stopListening();
    if (!mounted) return;
    final words = countWords('${_finals.join(' ')} $_partial');
    setState(() {
      _words = words;
      _done = true;
    });
    if (words > 0) AppStore.I.reportWpm(words);
  }

  String get _verdict {
    if (_words == 0) return 'لم ألتقط كلاماً. جرّب مرة أخرى في مكان هادئ وبصوت أعلى.';
    if (_words < 40) return 'بداية جيدة. استخدم جملاً قصيرة ولا تتوقف عند الكلمة التي لا تعرفها.';
    if (_words < 80) return 'جيد. حاول أن تربط جملك بكلمات مثل and و because و then.';
    if (_words < 120) return 'ممتاز. هذا قريب من سرعة حديث هادئ.';
    return 'رائع. أنت تتحدث بسرعة قريبة من المحادثة الطبيعية.';
  }

  @override
  Widget build(BuildContext context) {
    final transcript = '${_finals.join(' ')} $_partial'.trim();
    return Scaffold(
      appBar: AppBar(title: const Text('تحدي الدقيقة')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: kLine)),
              child: Column(
                children: [
                  const Text('موضوعك', style: TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  En(_topic.en, align: TextAlign.center, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w700, color: kInk)),
                  const SizedBox(height: 6),
                  Text(_topic.ar, textAlign: TextAlign.center, style: const TextStyle(color: kMuted)),
                  if (!_running) TextButton(onPressed: _newTopic, child: const Text('موضوع آخر')),
                ],
              ),
            ),
            const SizedBox(height: 22),
            Center(
              child: Text(
                '$_left',
                textDirection: TextDirection.ltr,
                style: TextStyle(fontSize: 76, fontWeight: FontWeight.w900, color: _running ? kCoral : kInk),
              ),
            ),
            const Center(child: Text('ثانية', style: TextStyle(color: kMuted))),
            const SizedBox(height: 16),
            if (_running)
              OutlinedButton(onPressed: _finish, child: const Text('أنهِ الآن'))
            else
              FilledButton(onPressed: _start, child: Text(_done ? 'حاول مرة أخرى' : 'ابدأ التحدث')),
            if (_noMic) ...[
              const SizedBox(height: 12),
              const FeedbackBox(ok: false, text: 'هذا التحدي يحتاج الميكروفون وخدمة التعرف على الكلام. امنح الإذن ثم حاول مرة أخرى.'),
            ],
            if (transcript.isNotEmpty) ...[
              const SizedBox(height: 16),
              En(transcript, style: const TextStyle(fontSize: 15.5, height: 1.6, color: kMuted)),
            ],
            if (_done) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: kOkBg, borderRadius: BorderRadius.circular(18)),
                child: Column(
                  children: [
                    Text('$_words', textDirection: TextDirection.ltr, style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w900, color: kOk)),
                    const Text('كلمة في الدقيقة تقريباً', style: TextStyle(color: kInk)),
                    const SizedBox(height: 8),
                    Text(_verdict, textAlign: TextAlign.center, style: const TextStyle(height: 1.7, color: kInk)),
                    const SizedBox(height: 6),
                    Text('أفضل رقم لك: ${AppStore.I.bestWpm}', style: const TextStyle(color: kMuted, fontSize: 13)),
                  ],
                ),
              ),
            ],
            if (_done && _words > 0) SpeechReviewCard(_finals.join(' '), topic: _topic.en),
            const SizedBox(height: 14),
            const Text(
              'العدد تقريبي: يحسب الكلمات التي التقطها الجوال فقط، وقد يفوته بعض الكلام.',
              textAlign: TextAlign.center,
              style: TextStyle(color: kMuted, fontSize: 12, height: 1.6),
            ),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// أذن عربية: تمييز الأصوات المتقاربة التي لا تفرق بينها العربية.
// =====================================================================

class SoundPairsScreen extends StatefulWidget {
  const SoundPairsScreen({super.key});

  @override
  State<SoundPairsScreen> createState() => _SoundPairsScreenState();
}

class _SoundPairsScreenState extends State<SoundPairsScreen> with TimedState<SoundPairsScreen> {
  static const int _rounds = 10;
  final Random _r = Random();
  late List<SoundPair> _order;
  int _i = 0;
  int _score = 0;
  late String _target;
  String? _picked;

  SoundPair get _pair => _order[_i % _order.length];

  @override
  void initState() {
    super.initState();
    _order = List<SoundPair>.from(soundPairs)..shuffle();
    _target = _r.nextBool() ? _pair.a : _pair.b;
    WidgetsBinding.instance.addPostFrameCallback((_) => Speech.I.say(_target, rate: 0.4));
  }

  void _pick(String word) {
    if (_picked != null) return;
    final ok = word == _target;
    setState(() {
      _picked = word;
      if (ok) _score++;
    });
    if (!ok) {
      AppStore.I.addMistake(
        kind: 'pron',
        prompt: 'تمييز صوتي بين ${_pair.label}: سمعت كلمة وظننتها $word',
        wrong: word,
        correct: _target,
        note: 'استمع للكلمتين متتاليتين وقارن بين الصوتين.',
      );
    }
  }

  void _next() {
    setState(() {
      _i++;
      _picked = null;
      if (_i < _rounds) _target = _r.nextBool() ? _pair.a : _pair.b;
    });
    if (_i < _rounds) {
      Speech.I.say(_target, rate: 0.4);
    } else {
      AppStore.I.markActive();
    }
  }

  void _restart() {
    setState(() {
      _order = List<SoundPair>.from(soundPairs)..shuffle();
      _i = 0;
      _score = 0;
      _picked = null;
      _target = _r.nextBool() ? _pair.a : _pair.b;
    });
    Speech.I.say(_target, rate: 0.4);
  }

  @override
  Widget build(BuildContext context) {
    final finished = _i >= _rounds;
    return Scaffold(
      appBar: AppBar(title: const Text('أذن عربية')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: finished ? _end() : _round(),
        ),
      ),
    );
  }

  Widget _round() {
    final pair = _pair;
    final answered = _picked != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('${_i + 1} من $_rounds · ${pair.label}', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
        const Spacer(),
        const Text('أي كلمة سمعت؟', textAlign: TextAlign.center, style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800)),
        const SizedBox(height: 14),
        Center(
          child: GestureDetector(
            onTap: () => Speech.I.say(_target, rate: 0.4),
            child: Container(
              width: 92,
              height: 92,
              decoration: const BoxDecoration(color: kTeal, shape: BoxShape.circle),
              child: const Icon(Icons.volume_up_rounded, color: Colors.white, size: 42),
            ),
          ),
        ),
        const SizedBox(height: 6),
        const Text('اضغط لتسمع مرة أخرى', textAlign: TextAlign.center, style: TextStyle(color: kMuted)),
        const SizedBox(height: 22),
        Row(
          textDirection: TextDirection.ltr,
          children: [
            for (final w in [pair.a, pair.b]) ...[
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 5),
                  child: OptionButton(
                    text: w,
                    english: true,
                    state: !answered ? 0 : (w == _target ? 1 : (w == _picked ? 2 : 0)),
                    onTap: answered ? null : () => _pick(w),
                  ),
                ),
              ),
            ],
          ],
        ),
        if (answered)
          FeedbackBox(
            ok: _picked == _target,
            text: _picked == _target ? 'صحيح، الكلمة هي $_target.' : 'الكلمة كانت $_target. اضغط السماعة وقارن بينها وبين $_picked.',
          ),
        const Spacer(),
        FilledButton(onPressed: answered ? _next : null, child: const Text('التالي')),
      ],
    );
  }

  Widget _end() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Spacer(),
        const Text('👂', textAlign: TextAlign.center, style: TextStyle(fontSize: 64)),
        Text('$_score من $_rounds', textAlign: TextAlign.center, style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900)),
        const SizedBox(height: 8),
        Text(
          _score >= 9 ? 'أذنك تميّز هذه الأصوات جيداً.' : 'الأصوات التي أخطأت فيها أضيفت إلى دفتر أخطائك. تمرين قصير يومي يصنع الفرق.',
          textAlign: TextAlign.center,
          style: const TextStyle(color: kMuted, height: 1.8),
        ),
        const Spacer(),
        FilledButton(onPressed: _restart, child: const Text('جولة أخرى')),
        const SizedBox(height: 10),
        OutlinedButton(onPressed: () => Navigator.of(context).pop(), child: const Text('العودة')),
      ],
    );
  }
}

// =====================================================================
// وضع الاستماع: جمل تُقرأ تلقائياً ببطء ثم بسرعة عادية، بلا لمس الشاشة.
// =====================================================================

class ListeningScreen extends StatefulWidget {
  const ListeningScreen({super.key});

  @override
  State<ListeningScreen> createState() => _ListeningScreenState();
}

class _ListeningScreenState extends State<ListeningScreen> with TimedState<ListeningScreen> {
  late final List<Phrase> _list;
  int _i = 0;
  bool _playing = false;
  int _run = 0;

  @override
  void initState() {
    super.initState();
    _list = List<Phrase>.from(phrasesFor(AppStore.I.level))..shuffle();
  }

  @override
  void dispose() {
    _playing = false;
    _run++;
    super.dispose();
  }

  void _toggle() {
    if (_playing) {
      setState(() => _playing = false);
      _run++;
      Speech.I.stopSpeaking();
    } else {
      setState(() => _playing = true);
      _loop(++_run);
    }
  }

  bool _alive(int run) => mounted && _playing && run == _run;

  Future<void> _loop(int run) async {
    var played = 0;
    while (_alive(run)) {
      final p = _list[_i];
      await Speech.I.say(p.en, rate: 0.36);
      if (!_alive(run)) break;
      // مهلة ليكرر المتعلم الجملة بصوته.
      await Future<void>.delayed(const Duration(seconds: 3));
      if (!_alive(run)) break;
      await Speech.I.say(p.en);
      if (!_alive(run)) break;
      await Future<void>.delayed(const Duration(seconds: 2));
      if (!_alive(run)) break;
      played++;
      if (played == 5) AppStore.I.markActive();
      setState(() => _i = (_i + 1) % _list.length);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = _list[_i];
    return Scaffold(
      appBar: AppBar(title: const Text('وضع الاستماع')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'كل جملة تُقرأ ببطء، ثم مهلة لتكررها بصوتك، ثم تُقرأ بسرعة عادية. مناسب للطريق والمشي.',
                style: TextStyle(color: kMuted, height: 1.7),
              ),
              const Spacer(),
              Text('${_i + 1} / ${_list.length}', textAlign: TextAlign.center, textDirection: TextDirection.ltr, style: const TextStyle(color: kMuted)),
              const SizedBox(height: 10),
              En(p.en, align: TextAlign.center, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: kInk, height: 1.4)),
              const SizedBox(height: 10),
              Text(p.ar, textAlign: TextAlign.center, style: const TextStyle(fontSize: 17, color: kMuted)),
              const Spacer(),
              Center(
                child: GestureDetector(
                  onTap: _toggle,
                  child: Container(
                    width: 104,
                    height: 104,
                    decoration: BoxDecoration(color: _playing ? kCoral : kTeal, shape: BoxShape.circle),
                    child: Icon(_playing ? Icons.pause_rounded : Icons.play_arrow_rounded, color: Colors.white, size: 54),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Text(_playing ? 'يعمل الآن' : 'اضغط للتشغيل', textAlign: TextAlign.center, style: const TextStyle(color: kMuted)),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
