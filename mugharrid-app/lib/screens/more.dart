import 'dart:math';

import 'package:flutter/material.dart';

import '../core/speech.dart';
import '../core/store.dart';
import '../data/content.dart';
import '../ui/common.dart';

// =====================================================================
// مفرداتي: بطاقات تُراجع بالتكرار المتباعد
// =====================================================================

class VocabScreen extends StatefulWidget {
  const VocabScreen({super.key});

  @override
  State<VocabScreen> createState() => _VocabScreenState();
}

class _VocabScreenState extends State<VocabScreen> with TimedState<VocabScreen> {
  bool _shown = false;

  void _grade(SavedWord w, bool ok) {
    setState(() => _shown = false);
    AppStore.I.gradeWord(w, ok);
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) {
        final s = AppStore.I;
        final due = s.dueWords;
        final SavedWord? w = due.isNotEmpty ? due.first : null;
        return Scaffold(
          appBar: AppBar(title: const Text('مفرداتي')),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              if (s.words.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 60),
                  child: Text(
                    '🔖\n\nلا كلمات محفوظة بعد.\nاضغط أي كلمة في «كلمات القصة» أو زر الحفظ في «تعبير اليوم» لتُضاف هنا، ثم نراجعها معك حتى تثبت.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: kMuted, height: 1.8, fontSize: 15.5),
                  ),
                )
              else if (w != null)
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('مراجعة اليوم · بقي ${due.length}', style: const TextStyle(color: kCoral, fontWeight: FontWeight.w800, fontSize: 13)),
                      const SizedBox(height: 18),
                      Text(w.ar, textAlign: TextAlign.center, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: kInk)),
                      const SizedBox(height: 6),
                      const Text('ما مقابلها بالإنجليزية؟ قلها بصوتك ثم اكشف الإجابة', textAlign: TextAlign.center, style: TextStyle(color: kMuted)),
                      const SizedBox(height: 16),
                      if (!_shown)
                        FilledButton(
                          onPressed: () {
                            setState(() => _shown = true);
                            Speech.I.say(w.en);
                          },
                          child: const Text('اكشف الإجابة'),
                        )
                      else ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SpeakButton(w.en),
                            Flexible(child: En(w.en, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: kTeal))),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(child: OutlinedButton(onPressed: () => _grade(w, false), child: const Text('نسيتها'))),
                            const SizedBox(width: 10),
                            Expanded(child: FilledButton(onPressed: () => _grade(w, true), child: const Text('تذكرتها'))),
                          ],
                        ),
                      ],
                    ],
                  ),
                )
              else
                const FeedbackBox(ok: true, text: 'راجعت كل كلمات اليوم. الكلمات تعود إليك بعد يوم ثم يومين ثم 4 ثم 8 أيام حتى تثبت.'),
              if (s.words.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text('كل الكلمات (${s.words.length}) · ثبّتّ ${s.masteredWords}', style: const TextStyle(fontWeight: FontWeight.w800, color: kMuted)),
                const SizedBox(height: 8),
                for (final x in s.words)
                  Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsetsDirectional.only(start: 14, end: 4, top: 4, bottom: 4),
                    decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: kLine)),
                    child: Row(
                      children: [
                        Expanded(child: Text(x.ar, style: const TextStyle(color: kMuted, fontSize: 14.5))),
                        En(x.en, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: kInk)),
                        Text(x.mastered ? '  ✅' : '', style: const TextStyle(fontSize: 13)),
                        SpeakButton(x.en),
                        IconButton(
                          tooltip: 'حذف',
                          onPressed: () => s.removeWord(x),
                          icon: const Icon(Icons.close_rounded, color: kMuted, size: 20),
                        ),
                      ],
                    ),
                  ),
              ],
            ],
          ),
        );
      },
    );
  }
}

// =====================================================================
// قلها بالإنجليزية: ترى الجملة بالعربية وتقولها بالإنجليزية
// =====================================================================

class SayItScreen extends StatefulWidget {
  const SayItScreen({super.key});

  @override
  State<SayItScreen> createState() => _SayItScreenState();
}

class _SayItScreenState extends State<SayItScreen> with TimedState<SayItScreen> {
  late final List<Phrase> _list;
  int _i = 0;
  String _heard = '';
  PronResult? _result;
  bool _listening = false;
  bool _noMic = false;
  bool _revealed = false;

  Phrase get _p => _list[_i];

  @override
  void initState() {
    super.initState();
    _list = List<Phrase>.from(phrasesFor(AppStore.I.level))..shuffle();
    Speech.I.onStatus = (status) {
      if (!mounted || !_listening) return;
      if (status == 'done' || status == 'notListening') {
        setState(() => _listening = false);
        if (_result == null && _heard.trim().isNotEmpty) _evaluate();
      }
    };
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
      _revealed = true;
    });
    if (r.percent >= 70) {
      AppStore.I.bump('say');
    } else {
      AppStore.I.addMistake(kind: 'grammar', prompt: 'قلها بالإنجليزية: ${_p.ar}', wrong: _heard, correct: _p.en, note: 'قل الجملة كاملة بصوتك ثلاث مرات.');
    }
    Speech.I.say(_p.en);
  }

  void _next() {
    setState(() {
      _i = (_i + 1) % _list.length;
      _heard = '';
      _result = null;
      _noMic = false;
      _revealed = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final r = _result;
    return Scaffold(
      appBar: AppBar(title: const Text('قلها بالإنجليزية')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            const Text('فكّر بالإنجليزية مباشرة: اقرأ الجملة بالعربية وقلها بالإنجليزية من عندك.', style: TextStyle(color: kMuted, height: 1.6)),
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                children: [
                  Text(_p.ar, textAlign: TextAlign.center, style: const TextStyle(fontSize: 23, fontWeight: FontWeight.w800, color: kInk, height: 1.6)),
                  if (_revealed) ...[
                    const Divider(height: 26, color: kLine),
                    En(_p.en, align: TextAlign.center, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: kTeal, height: 1.4)),
                    SpeakButton(_p.en),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 14),
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
            Text(_listening ? 'أسمعك الآن...' : 'اضغط وقل الجملة بالإنجليزية', textAlign: TextAlign.center, style: const TextStyle(color: kMuted)),
            if (_heard.isNotEmpty && r == null) ...[
              const SizedBox(height: 12),
              En(_heard, align: TextAlign.center, style: const TextStyle(fontSize: 16, color: kMuted)),
            ],
            if (_noMic) ...[
              const SizedBox(height: 12),
              const FeedbackBox(ok: false, text: 'تعذر تشغيل الميكروفون. قل الجملة بصوتك ثم اضغط «أرني الإجابة» وقارن بنفسك.'),
            ],
            if (r != null) ...[
              const SizedBox(height: 12),
              FeedbackBox(
                ok: r.percent >= 70,
                text: r.percent >= 70
                    ? 'ممتاز (${r.percent}%). قلت: $_heard'
                    : 'قلت: $_heard\nالصياغة المتوقعة في الأعلى. أضفناها إلى دفتر أخطائك. قد تكون جملتك صحيحة بصياغة أخرى، فالمقارنة هنا بالكلمات.',
              ),
            ],
            const SizedBox(height: 6),
            if (!_revealed)
              OutlinedButton(
                onPressed: () {
                  setState(() => _revealed = true);
                  Speech.I.say(_p.en);
                },
                child: const Text('أرني الإجابة'),
              ),
            const SizedBox(height: 10),
            FilledButton(onPressed: _next, child: const Text('الجملة التالية')),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// إملاء ذكي: اسمع الجملة واكتب الكلمة الناقصة
// =====================================================================

class ClozeScreen extends StatefulWidget {
  const ClozeScreen({super.key});

  @override
  State<ClozeScreen> createState() => _ClozeScreenState();
}

class _ClozeScreenState extends State<ClozeScreen> with TimedState<ClozeScreen> {
  final _input = TextEditingController();
  final _rnd = Random();
  late final List<Phrase> _list;
  int _i = 0;
  List<String> _words = [];
  int _gap = 0;
  bool? _ok;
  int _right = 0;

  Phrase get _p => _list[_i];
  String _clean(String w) => w.toLowerCase().replaceAll(RegExp(r'[^a-z]'), '');

  @override
  void initState() {
    super.initState();
    _list = List<Phrase>.from(phrasesFor(AppStore.I.level))..shuffle();
    _prepare();
    WidgetsBinding.instance.addPostFrameCallback((_) => Speech.I.say(_p.en, rate: 0.4));
  }

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  void _prepare() {
    _words = _p.en.split(' ');
    final candidates = <int>[];
    for (var k = 0; k < _words.length; k++) {
      if (_clean(_words[k]).length >= 3) candidates.add(k);
    }
    _gap = candidates.isEmpty ? 0 : candidates[_rnd.nextInt(candidates.length)];
    _ok = null;
    _input.clear();
  }

  void _check() {
    if (_ok != null || _input.text.trim().isEmpty) return;
    final target = _clean(_words[_gap]);
    final ok = _clean(_input.text) == target;
    setState(() => _ok = ok);
    FocusScope.of(context).unfocus();
    if (ok) {
      _right++;
      AppStore.I.bump('cloze');
    } else {
      AppStore.I.addMistake(kind: 'vocab', prompt: 'إملاء: الكلمة الناقصة في «${_p.ar}»', wrong: _input.text.trim(), correct: target, note: 'الجملة: ${_p.en}');
    }
  }

  void _next() {
    setState(() {
      _i = (_i + 1) % _list.length;
      _prepare();
    });
    Speech.I.say(_p.en, rate: 0.4);
  }

  @override
  Widget build(BuildContext context) {
    final done = _ok != null;
    return Scaffold(
      appBar: AppBar(title: const Text('إملاء ذكي')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            Text('اسمع الجملة واكتب الكلمة الناقصة · صحيح حتى الآن: $_right', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                children: [
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [SpeakButton(_p.en), SpeakButton(_p.en, slow: true)]),
                  const SizedBox(height: 8),
                  Directionality(
                    textDirection: TextDirection.ltr,
                    child: Wrap(
                      alignment: WrapAlignment.center,
                      spacing: 7,
                      runSpacing: 8,
                      children: [
                        for (var k = 0; k < _words.length; k++)
                          k == _gap
                              ? Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
                                  decoration: BoxDecoration(color: done ? (_ok! ? kOkBg : kBadBg) : kTint, borderRadius: BorderRadius.circular(8)),
                                  child: Text(done ? _words[k] : '_____', style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: done ? (_ok! ? kOk : kBad) : kTeal)),
                                )
                              : Text(_words[k], style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w600, color: kInk)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(_p.ar, textAlign: TextAlign.center, style: const TextStyle(color: kMuted)),
                ],
              ),
            ),
            TextField(
              controller: _input,
              enabled: !done,
              textDirection: TextDirection.ltr,
              autocorrect: false,
              enableSuggestions: false,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _check(),
              decoration: InputDecoration(
                hintText: 'اكتب الكلمة الناقصة',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
            const SizedBox(height: 12),
            if (done) FeedbackBox(ok: _ok!, text: _ok! ? 'صحيح!' : 'الكلمة هي: ${_words[_gap]} · أضفناها إلى دفتر أخطائك.'),
            if (!done) FilledButton(onPressed: _check, child: const Text('تحقق')) else FilledButton(onPressed: _next, child: const Text('التالي')),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// تحدي صديق: لاعبان على جوال واحد
// =====================================================================

class DuelScreen extends StatefulWidget {
  const DuelScreen({super.key});

  @override
  State<DuelScreen> createState() => _DuelScreenState();
}

class _DuelScreenState extends State<DuelScreen> with TimedState<DuelScreen> {
  static const _perPlayer = 5;
  late List<Phrase> _questions;
  late List<List<String>> _options;
  int _q = 0;
  final List<int> _score = [0, 0];
  String? _picked;

  bool get _finished => _q >= _questions.length;
  int get _player => _q % 2;

  @override
  void initState() {
    super.initState();
    _build();
  }

  void _build() {
    final pool = List<Phrase>.from(phrases)..shuffle();
    _questions = pool.take(_perPlayer * 2).toList();
    _options = [
      for (final p in _questions)
        (<String>[p.en, ...(phrases.where((x) => x.en != p.en).toList()..shuffle()).take(2).map((x) => x.en)]..shuffle()),
    ];
    _q = 0;
    _score[0] = 0;
    _score[1] = 0;
    _picked = null;
  }

  void _pick(String o) {
    if (_picked != null) return;
    final ok = o == _questions[_q].en;
    setState(() {
      _picked = o;
      if (ok) _score[_player]++;
    });
    Speech.I.say(_questions[_q].en);
  }

  void _next() {
    setState(() {
      _q++;
      _picked = null;
    });
    if (_finished) AppStore.I.bump('duel');
  }

  @override
  Widget build(BuildContext context) {
    const names = ['اللاعب الأول', 'اللاعب الثاني'];
    const colors = [kTeal, kCoral];
    return Scaffold(
      appBar: AppBar(title: const Text('تحدي صديق')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            Row(
              children: [
                for (var k = 0; k < 2; k++)
                  Expanded(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: !_finished && _player == k ? colors[k] : kCard,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: colors[k], width: 2),
                      ),
                      child: Column(
                        children: [
                          Text(names[k], style: TextStyle(fontWeight: FontWeight.w800, color: !_finished && _player == k ? Colors.white : kInk)),
                          Text('${_score[k]}', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: !_finished && _player == k ? Colors.white : colors[k])),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 18),
            if (_finished) ...[
              const Text('🏆', textAlign: TextAlign.center, style: TextStyle(fontSize: 80)),
              Text(
                _score[0] == _score[1] ? 'تعادل!' : 'الفائز: ${names[_score[0] > _score[1] ? 0 : 1]}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: kInk),
              ),
              const SizedBox(height: 20),
              FilledButton(onPressed: () => setState(_build), child: const Text('جولة جديدة')),
            ] else ...[
              Text('دور ${names[_player]} · سؤال ${_q ~/ 2 + 1} من $_perPlayer', textAlign: TextAlign.center, style: TextStyle(color: colors[_player], fontWeight: FontWeight.w800)),
              const SizedBox(height: 10),
              Text('كيف تقول بالإنجليزية؟', textAlign: TextAlign.center, style: const TextStyle(color: kMuted)),
              const SizedBox(height: 6),
              Text(_questions[_q].ar, textAlign: TextAlign.center, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: kInk, height: 1.6)),
              const SizedBox(height: 14),
              for (final o in _options[_q])
                OptionButton(
                  text: o,
                  english: true,
                  state: _picked == null ? 0 : (o == _questions[_q].en ? 1 : (o == _picked ? 2 : 0)),
                  onTap: _picked != null ? null : () => _pick(o),
                ),
              if (_picked != null) FilledButton(onPressed: _next, child: Text(_q + 1 >= _questions.length ? 'النتيجة' : 'أعطِ الجوال للاعب الآخر')),
            ],
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// تقدّمي: مستوى الخبرة، رسم الأسبوع، الشارات
// =====================================================================

const xpTitles = ['مبتدئ', 'مجتهد', 'مثابر', 'متحدث', 'منطلق', 'فصيح', 'محترف', 'مغرّد'];

int xpLevel(int xp) => xp ~/ 150 + 1;
String xpTitle(int xp) => xpTitles[min(xpLevel(xp) - 1, xpTitles.length - 1)];
double xpProgress(int xp) => (xp % 150) / 150;

class Medal {
  const Medal(this.emoji, this.title, this.how, this.earned);
  final String emoji;
  final String title;
  final String how;
  final bool Function(AppStore s) earned;
}

final badges = <Medal>[
  Medal('🌱', 'البداية', 'أكمل أول درس', (s) => s.doneLessons.isNotEmpty),
  Medal('🔥', 'ثلاثة أيام', 'سلسلة 3 أيام متتالية', (s) => s.bestStreak >= 3),
  Medal('⚡', 'أسبوع كامل', 'سلسلة 7 أيام متتالية', (s) => s.bestStreak >= 7),
  Medal('🏅', 'شهر التزام', 'سلسلة 30 يوماً متتالياً', (s) => s.bestStreak >= 30),
  Medal('💬', 'محاور', 'أكمل 5 محادثات', (s) => s.talksDone >= 5),
  Medal('📖', 'قارئ', 'اقرأ 5 قصص', (s) => s.storiesRead >= 5),
  Medal('📚', 'دودة كتب', 'اقرأ 25 قصة', (s) => s.storiesRead >= 25),
  Medal('🔖', 'جامع كلمات', 'احفظ 20 كلمة في مفرداتي', (s) => s.words.length >= 20),
  Medal('🧠', 'ذاكرة قوية', 'ثبّت 10 كلمات', (s) => s.masteredWords >= 10),
  Medal('📒', 'مصحح نفسه', 'أتقن 10 أخطاء من الدفتر', (s) => s.masteredCount >= 10),
  Medal('🗣️', 'يفكر بالإنجليزية', 'قل 20 جملة في «قلها بالإنجليزية»', (s) => s.count('say') >= 20),
  Medal('✍️', 'أذن وقلم', '20 إجابة صحيحة في الإملاء', (s) => s.count('cloze') >= 20),
  Medal('⏱️', 'طلاقة', '80 كلمة في تحدي الدقيقة', (s) => s.bestWpm >= 80),
  Medal('🤝', 'روح المنافسة', 'أكمل 3 تحديات مع صديق', (s) => s.count('duel') >= 3),
  Medal('🎓', 'خريج المستوى', 'أكمل كل الدروس', (s) => s.doneLessons.length >= lessons.length),
  Medal('⏳', 'عشر ساعات', 'تعلّم 600 دقيقة إجمالاً', (s) => s.totalSeconds >= 36000),
];

class ProgressScreen extends StatelessWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = AppStore.I;
    final week = s.lastDaysSeconds(7);
    final maxSec = max(week.reduce(max), s.goalMinutes * 60);
    const dayNames = ['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح']; // الاثنين .. الأحد
    final today = DateTime.now().weekday; // 1 = الاثنين
    final earned = badges.where((b) => b.earned(s)).length;
    final weekMinutes = week.fold<int>(0, (a, b) => a + b) ~/ 60;
    final activeDays = week.where((x) => x >= 60).length;

    return Scaffold(
      appBar: AppBar(title: const Text('تقدّمي')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF6A56E8), Color(0xFF3A2BA8)], begin: Alignment.topRight, end: Alignment.bottomLeft),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('المستوى ${xpLevel(s.xp)} · ${xpTitle(s.xp)}', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                Text('${s.xp} نقطة خبرة · بقي ${150 - s.xp % 150} للمستوى التالي', style: const TextStyle(color: Colors.white70)),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(9),
                  child: LinearProgressIndicator(value: xpProgress(s.xp), minHeight: 10, color: kGold, backgroundColor: Colors.white24),
                ),
              ],
            ),
          ),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('آخر 7 أيام', style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.w800, color: kInk)),
                Text('$weekMinutes دقيقة · $activeDays أيام نشطة · أفضل سلسلة ${s.bestStreak}', style: const TextStyle(color: kMuted, fontSize: 13)),
                const SizedBox(height: 14),
                SizedBox(
                  height: 130,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      for (var k = 0; k < 7; k++)
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Text('${week[k] ~/ 60}', style: const TextStyle(fontSize: 11, color: kMuted)),
                              const SizedBox(height: 3),
                              Container(
                                height: 6 + 84 * (week[k] / maxSec),
                                margin: const EdgeInsets.symmetric(horizontal: 7),
                                decoration: BoxDecoration(
                                  color: week[k] >= s.goalMinutes * 60 ? kCoral : (week[k] > 0 ? kTeal : kLine),
                                  borderRadius: BorderRadius.circular(7),
                                ),
                              ),
                              const SizedBox(height: 5),
                              Text(dayNames[(today - 1 - (6 - k) + 14) % 7], style: TextStyle(fontSize: 12.5, fontWeight: k == 6 ? FontWeight.w900 : FontWeight.w500, color: k == 6 ? kInk : kMuted)),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                const Text('البرتقالي = يوم أكملت فيه هدفك', style: TextStyle(color: kMuted, fontSize: 12)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(2, 6, 2, 10),
            child: Text('الشارات · $earned من ${badges.length}', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: kMuted)),
          ),
          for (final b in badges)
            Builder(builder: (context) {
              final got = b.earned(s);
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: got ? const Color(0xFFFFF6DC) : kCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: got ? kGold : kLine)),
                child: Row(
                  children: [
                    Opacity(opacity: got ? 1 : 0.3, child: Text(b.emoji, style: const TextStyle(fontSize: 30))),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(b.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15.5, color: kInk)),
                          Text(b.how, style: const TextStyle(color: kMuted, fontSize: 13)),
                        ],
                      ),
                    ),
                    if (got) const Icon(Icons.verified_rounded, color: kGold),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}
