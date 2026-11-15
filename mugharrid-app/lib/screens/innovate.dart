import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../core/account.dart';
import '../core/coach.dart';
import '../core/interview_coach.dart';
import '../core/speech.dart';
import '../core/store.dart';
import '../data/content.dart';
import '../data/lesson_gen.dart';
import '../data/pro_careers.dart';
import '../ui/common.dart';

// =====================================================================
// 1) مدرّب أخطائي: يحلل أخطاءك المتكررة ويبني تمارين عليها
// =====================================================================

class ErrorPattern {
  const ErrorPattern(this.id, this.titleAr, this.tipAr, this.keys, this.pairs);
  final String id;
  final String titleAr;
  final String tipAr;

  /// كلمات إن وُجدت في شرح الخطأ المحفوظ دلّت على هذا النمط.
  final List<String> keys;

  /// تمارين: [الصحيح، الخطأ]
  final List<List<String>> pairs;
}

const errorPatterns = <ErrorPattern>[
  ErrorPattern('third', 'فعل المفرد الغائب', 'مع he / she / it نضيف s للفعل، وفي النفي does not.', ['he / she / it', 'does not', ' s '], [
    ['She works in a bank.', 'She work in a bank.'], ['He does not like tea.', 'He do not like tea.'], ['My brother plays football.', 'My brother play football.'], ['It rains a lot here.', 'It rain a lot here.'],
  ]),
  ErrorPattern('be', 'فعل الكينونة', 'لا تبدأ الجملة الاسمية بلا am / is / are، ولا تضع am قبل فعل عادي.', ['الكينونة', 'am +', 'agree', 'I was born'], [
    ['I am tired today.', 'I tired today.'], ['I agree with you.', 'I am agree with you.'], ['She is a doctor.', 'She a doctor.'], ['I was born in Jeddah.', 'I born in Jeddah.'],
  ]),
  ErrorPattern('past', 'الماضي بعد did', 'بعد did و did not يعود الفعل لصورته الأصلية.', ['did not'], [
    ['I did not go yesterday.', 'I did not went yesterday.'], ['Did you see him?', 'Did you saw him?'], ['She did not call me.', 'She did not called me.'], ['We did not have time.', 'We did not had time.'],
  ]),
  ErrorPattern('modal', 'بعد can و must و should', 'بعد الأفعال الناقصة يأتي الفعل مباشرة بلا to، وبعد want و need نضع to.', ['can / must', 'want', 'need'], [
    ['I can swim.', 'I can to swim.'], ['You must go now.', 'You must to go now.'], ['I want to learn English.', 'I want learn English.'], ['We should leave early.', 'We should to leave early.'],
  ]),
  ErrorPattern('quant', 'much و many', 'many مع المعدود، و much مع غير المعدود.', ['many', 'much', 'المعدود'], [
    ['I have many friends.', 'I have much friends.'], ['I do not have much time.', 'I do not have many time.'], ['How much money do you need?', 'How many money do you need?'], ['There are many cars.', 'There are much cars.'],
  ]),
  ErrorPattern('prep', 'حروف الجر', 'on مع الأيام، at مع الساعة و night، in مع الشهور والسنوات.', [' on ', 'at night', 'depends on', 'married to', 'listen'], [
    ['I work on Monday.', 'I work in Monday.'], ['I study at night.', 'I study in night.'], ['It depends on the price.', 'It depends of the price.'], ['I listen to music.', 'I listen music.'],
  ]),
  ErrorPattern('adj', 'صفات ed و ing', 'bored = أشعر بالملل، boring = الشيء ممل. وكذلك interested / interesting.', ['bored', 'interested', 'excited'], [
    ['I am bored.', 'I am boring.'], ['I am interested in history.', 'I am interesting in history.'], ['The film was boring.', 'The film was bored.'], ['We are excited about the trip.', 'We are exciting about the trip.'],
  ]),
  ErrorPattern('time', 'since و for', 'for مع المدة (three years)، و since مع نقطة البداية (2020).', ['for،', 'since'], [
    ['I have lived here for three years.', 'I have lived here since three years.'], ['I have worked here since 2020.', 'I have worked here for 2020.'], ['She has been sick for two days.', 'She has been sick since two days.'], ['We have known him since school.', 'We have known him for school.'],
  ]),
  ErrorPattern('art', 'أدوات التعريف a و an و the', 'an قبل صوت متحرك، ولا نضع the عند الكلام العام.', [' an', ' a ', 'the life', 'the قبل'], [
    ['She is an engineer.', 'She is a engineer.'], ['Life is beautiful.', 'The life is beautiful.'], ['He goes to a university.', 'He goes to an university.'], ['I waited for an hour.', 'I waited for a hour.'],
  ]),
  ErrorPattern('order', 'ترتيب الجملة', 'في الإنجليزية: الفاعل ثم الفعل ثم المفعول، والصفة قبل الاسم.', ['ترتيب'], [
    ['She has a big red car.', 'She has a car big red.'], ['I really like it.', 'I very like it.'], ['Where do you live?', 'Where you live?'], ['I always drink coffee.', 'I drink always coffee.'],
  ]),
];

class ErrorCoachScreen extends StatelessWidget {
  const ErrorCoachScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) {
        final s = AppStore.I;
        final hits = <String, int>{};
        for (final m in s.mistakes) {
          final text = '${m.note} ${m.correct}';
          for (final p in errorPatterns) {
            if (p.keys.any((k) => text.contains(k))) hits[p.id] = (hits[p.id] ?? 0) + 1;
          }
          if (m.prompt.contains('رتّب')) hits['order'] = (hits['order'] ?? 0) + 1;
        }
        final ranked = List<ErrorPattern>.from(errorPatterns)..sort((a, b) => (hits[b.id] ?? 0).compareTo(hits[a.id] ?? 0));
        final pron = s.mistakes.where((m) => m.kind == 'pron').length;
        final grammar = s.mistakes.where((m) => m.kind == 'grammar').length;
        final vocab = s.mistakes.where((m) => m.kind == 'vocab').length;
        final found = ranked.where((p) => (hits[p.id] ?? 0) > 0).length;
        return Scaffold(
          appBar: AppBar(title: const Text('مدرّب أخطائي')),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              AppCard(
                color: kTint,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('تقريرك الشخصي', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: kInk)),
                    const SizedBox(height: 6),
                    Text(
                      s.mistakes.isEmpty
                          ? 'لا أخطاء مسجلة بعد. كلما تدربت في الدروس والمحادثات صار تقريرك أدق. ابدأ الآن بأشهر أخطاء المتحدثين بالعربية.'
                          : 'سجّلنا ${s.mistakes.length} خطأ: $grammar في القواعد، $vocab في المفردات والفهم، $pron في النطق.\n'
                              '${found == 0 ? 'لم نجد نمطاً متكرراً بعد.' : 'وجدنا $found أنماط تتكرر عندك، مرتبة من الأكثر تكراراً.'}',
                      style: const TextStyle(color: kInk, height: 1.7),
                    ),
                  ],
                ),
              ),
              for (final p in ranked)
                ActivityTile(
                  emoji: s.count('fix:${p.id}') > 0 ? '✅' : ((hits[p.id] ?? 0) > 0 ? '🎯' : '📘'),
                  title: p.titleAr,
                  subtitle: (hits[p.id] ?? 0) > 0 ? 'تكرر عندك ${hits[p.id]} مرات · تمرين علاجي' : 'تمرين وقائي',
                  badge: (hits[p.id] ?? 0) > 0 ? '${hits[p.id]}' : null,
                  onTap: () => push(context, PatternDrillScreen(pattern: p)),
                ),
            ],
          ),
        );
      },
    );
  }
}

class PatternDrillScreen extends StatefulWidget {
  const PatternDrillScreen({super.key, required this.pattern});
  final ErrorPattern pattern;

  @override
  State<PatternDrillScreen> createState() => _PatternDrillScreenState();
}

class _PatternDrillScreenState extends State<PatternDrillScreen> with TimedState<PatternDrillScreen> {
  late final List<List<String>> _items;
  late List<String> _options;
  int _i = 0;
  String? _picked;
  int _right = 0;

  @override
  void initState() {
    super.initState();
    _items = List<List<String>>.from(widget.pattern.pairs)..shuffle();
    _options = List<String>.from(_items[0])..shuffle();
  }

  void _pick(String o) {
    if (_picked != null) return;
    setState(() => _picked = o);
    if (o == _items[_i][0]) _right++;
    Speech.I.say(_items[_i][0]);
  }

  void _next() {
    setState(() {
      _i++;
      _picked = null;
      if (_i < _items.length) _options = List<String>.from(_items[_i])..shuffle();
    });
    if (_i >= _items.length && _right == _items.length) AppStore.I.bump('fix:${widget.pattern.id}');
  }

  @override
  Widget build(BuildContext context) {
    final done = _i >= _items.length;
    return Scaffold(
      appBar: AppBar(title: Text(widget.pattern.titleAr)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            AppCard(color: const Color(0xFFFFF6DC), child: Text('القاعدة: ${widget.pattern.tipAr}', style: const TextStyle(color: kInk, height: 1.7, fontWeight: FontWeight.w600))),
            if (done) ...[
              const SizedBox(height: 20),
              Text(_right == _items.length ? '🏆' : '💪', textAlign: TextAlign.center, style: const TextStyle(fontSize: 70)),
              Text('$_right من ${_items.length}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
              Text(_right == _items.length ? 'أتقنت هذا النمط.' : 'أعد التمرين حتى تجيب عن الكل.', textAlign: TextAlign.center, style: const TextStyle(color: kMuted)),
              const SizedBox(height: 20),
              FilledButton(onPressed: () => Navigator.of(context).pop(), child: const Text('رجوع')),
            ] else ...[
              Text('أي الجملتين صحيحة؟ · ${_i + 1} من ${_items.length}', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              for (final o in _options)
                OptionButton(
                  text: o,
                  english: true,
                  state: _picked == null ? 0 : (o == _items[_i][0] ? 1 : (o == _picked ? 2 : 0)),
                  onTap: _picked != null ? null : () => _pick(o),
                ),
              if (_picked != null) FilledButton(onPressed: _next, child: const Text('التالي')),
            ],
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// 2) وضع المقابلة الحقيقية: أسئلة بالصوت، مؤقت، وتقييم نهائي
// =====================================================================

class InterviewSetupScreen extends StatefulWidget {
  const InterviewSetupScreen({super.key});

  @override
  State<InterviewSetupScreen> createState() => _InterviewSetupScreenState();
}

class _InterviewSetupScreenState extends State<InterviewSetupScreen> {
  int _n = 6;

  @override
  Widget build(BuildContext context) {
    final jobs = interviewJobsAr();
    return Scaffold(
      appBar: AppBar(title: const Text('مقابلة عمل حقيقية')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          AppCard(
            color: kTint,
            child: Text(
              'المحاور يسألك بالصوت، وأمامك 45 ثانية للإجابة بصوتك. بعد كل إجابة تحصل على تصحيح وإجابات مقترحة، وفي النهاية تقييم شامل. ${jobs.length} وظيفة، ولكل وظيفة أكثر من ${interviewQA(0).length} سؤالاً تتغير في كل مرة.',
              style: const TextStyle(color: kInk, height: 1.7),
            ),
          ),
          const Text('طول المقابلة', style: TextStyle(fontWeight: FontWeight.w800, color: kMuted)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              for (final n in const [6, 10, 15])
                ChoiceChip(label: Text('$n أسئلة'), selected: _n == n, onSelected: (_) => setState(() => _n = n)),
            ],
          ),
          const SizedBox(height: 14),
          const Text('اختر الوظيفة', style: TextStyle(fontWeight: FontWeight.w800, color: kMuted)),
          const SizedBox(height: 8),
          for (var j = 0; j < jobs.length; j++)
            ActivityTile(emoji: '💼', title: jobs[j], subtitle: '${interviewQA(j).length} سؤالاً وجواباً نموذجياً', onTap: () => push(context, InterviewScreen(job: j, jobAr: jobs[j], count: _n))),
          Text('مقابلات أكملتها: ${AppStore.I.count('interview')} · أفضل نتيجة: ${AppStore.I.count('interviewBest')}%', style: const TextStyle(color: kMuted)),
        ],
      ),
    );
  }
}

class _Answer {
  _Answer(this.question, this.model, this.said, this.score, this.notes, {this.review});
  final AnswerReview? review;
  final String question;
  final String model;
  final String said;
  final int score;
  final List<String> notes;
}

class InterviewScreen extends StatefulWidget {
  const InterviewScreen({super.key, required this.job, required this.jobAr, this.count = 6});
  final int job;
  final String jobAr;
  final int count;

  @override
  State<InterviewScreen> createState() => _InterviewScreenState();
}

class _InterviewScreenState extends State<InterviewScreen> with TimedState<InterviewScreen> {
  static const _limit = 45;
  final _typed = TextEditingController();
  late final List<List<String>> _qs;
  final List<_Answer> _answers = [];
  int _i = 0;
  int _left = _limit;
  Timer? _timer;
  String _heard = '';
  bool _listening = false;
  bool _asking = true;
  bool _saved = false;
  AnswerReview? _review;
  int _shadowIdx = -1;
  String _shadowHeard = '';
  bool _shadowListening = false;

  @override
  void initState() {
    super.initState();
    _qs = (interviewQA(widget.job)..shuffle()).take(widget.count).toList();
    Speech.I.onStatus = (status) {
      if (!mounted) return;
      if ((status == 'done' || status == 'notListening') && (_listening || _shadowListening)) {
        setState(() {
          _listening = false;
          _shadowListening = false;
        });
      }
    };
    WidgetsBinding.instance.addPostFrameCallback((_) => _ask());
  }

  @override
  void dispose() {
    _timer?.cancel();
    _typed.dispose();
    super.dispose();
  }

  Future<void> _ask() async {
    setState(() {
      _asking = true;
      _heard = '';
      _typed.clear();
      _left = _limit;
    });
    await Speech.I.say(_qs[_i][0]);
    if (!mounted) return;
    setState(() => _asking = false);
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      if (_left <= 1) {
        _submit();
      } else {
        setState(() => _left--);
      }
    });
    _record();
  }

  Future<void> _record() async {
    if (_listening) return;
    setState(() => _listening = true);
    final ok = await Speech.I.listen(
      listenFor: const Duration(seconds: _limit),
      pauseFor: const Duration(seconds: 6),
      onText: (text, isFinal) {
        if (mounted) setState(() => _heard = text);
      },
    );
    if (mounted && !ok) setState(() => _listening = false);
  }

  void _submit() {
    _timer?.cancel();
    Speech.I.stopListening();
    final said = (_typed.text.trim().isNotEmpty ? _typed.text : _heard).trim();
    final model = _qs[_i][1];
    final r = reviewAnswer(_qs[_i][0], said, model);
    if (r.corrected != null) {
      AppStore.I.addMistake(kind: 'grammar', prompt: 'إجابة في مقابلة عمل', wrong: said, correct: r.corrected!, note: r.noteAr);
    }
    _answers.add(_Answer(_qs[_i][0], model, said, r.score, r.fixes.isNotEmpty ? r.fixes : r.good, review: r));
    setState(() {
      _review = r;
      _listening = false;
      _shadowIdx = -1;
      _shadowHeard = '';
    });
    _aiUpgrade(r, said, _qs[_i][0], model);
  }

  /// إن كان خادم الذكاء الاصطناعي مضبوطاً، يستبدل التقييم المحلي بتقييمه عند وصوله. وإلا يبقى المحلي.
  Future<void> _aiUpgrade(AnswerReview local, String said, String q, String model) async {
    if (!RemoteAi.enabled || said.isEmpty) return;
    final idx = _answers.length - 1;
    final j = await RemoteAi.review(question: q, model: model, said: said);
    if (j == null || !mounted || _review != local) return;
    List<String> list(dynamic v) => v is List ? v.map((e) => e.toString()).where((e) => e.trim().isNotEmpty).toList() : <String>[];
    final fixes = list(j['fixes']);
    final good = list(j['good']);
    final c = (j['corrected'] ?? '').toString().trim();
    final note = (j['note_ar'] ?? '').toString().trim();
    final score = (j['score'] as num).toInt().clamp(0, 100);
    final r = AnswerReview(
      said: local.said,
      polished: local.polished,
      corrected: c.isNotEmpty && c != said ? c : null,
      noteAr: note,
      score: score,
      good: good.isNotEmpty ? good : local.good,
      fixes: fixes,
      missing: local.missing,
      suggestions: local.suggestions,
    );
    _answers[idx] = _Answer(q, model, said, score, fixes.isNotEmpty ? fixes : r.good, review: r);
    setState(() => _review = r);
  }

  void _next() {
    Speech.I.stopSpeaking();
    Speech.I.stopListening();
    setState(() {
      _review = null;
      _i++;
    });
    if (_i < _qs.length) _ask();
  }

  Future<void> _shadow(int i) async {
    await Speech.I.stopSpeaking();
    if (!mounted) return;
    setState(() {
      _shadowIdx = i;
      _shadowHeard = '';
      _shadowListening = true;
    });
    final ok = await Speech.I.listen(
      listenFor: const Duration(seconds: 40),
      pauseFor: const Duration(seconds: 5),
      onText: (text, isFinal) {
        if (mounted) setState(() => _shadowHeard = text);
      },
    );
    if (mounted && !ok) setState(() => _shadowListening = false);
  }

  Widget _bullets(String title, List<String> items, Color color, {String mark = '•'}) {
    if (items.isEmpty) return const SizedBox.shrink();
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(fontWeight: FontWeight.w900, color: color, fontSize: 14)),
          const SizedBox(height: 6),
          for (final t in items) Padding(padding: const EdgeInsets.only(bottom: 4), child: Text('$mark $t', style: const TextStyle(color: kInk, fontSize: 14, height: 1.6))),
        ],
      ),
    );
  }

  Widget _reviewView() {
    final r = _review!;
    final last = _i >= _qs.length - 1;
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        AppCard(
          child: Row(
            children: [
              Expanded(child: En(_qs[_i][0], style: const TextStyle(fontWeight: FontWeight.w800, color: kInk, fontSize: 16))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(color: r.score >= 70 ? kTint : kBadBg, borderRadius: BorderRadius.circular(14)),
                child: Text('${r.score}%', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: r.score >= 70 ? kOk : kBad)),
              ),
            ],
          ),
        ),
        if (r.said.isNotEmpty)
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('ما قلته', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: kMuted)),
                En(r.said, style: const TextStyle(color: kInk, fontSize: 15, height: 1.5)),
                const Divider(height: 18, color: kLine),
                Text(r.corrected != null ? 'بعد التصحيح' : 'مكتوباً بشكل سليم', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: kTeal)),
                Row(children: [Expanded(child: En(r.corrected ?? r.polished, style: const TextStyle(color: kInk, fontSize: 15.5, fontWeight: FontWeight.w700, height: 1.5))), SpeakButton(r.corrected ?? r.polished)]),
                if (r.noteAr.isNotEmpty) Text(r.noteAr, style: const TextStyle(color: kBad, fontSize: 13.5, height: 1.6)),
              ],
            ),
          ),
        _bullets('ما أحسنت فيه', r.good, kOk, mark: '✓'),
        _bullets('ما يمكن تحسينه', r.fixes, kCoral, mark: '←'),
        if (r.missing.isNotEmpty)
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('كلمات مفيدة في هذا الجواب', style: TextStyle(fontWeight: FontWeight.w900, color: kTeal, fontSize: 14)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final w in r.missing)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: kTint, borderRadius: BorderRadius.circular(99)),
                        child: En(w, style: const TextStyle(fontWeight: FontWeight.w800, color: kInk)),
                      ),
                  ],
                ),
              ],
            ),
          ),
        const Padding(padding: EdgeInsets.fromLTRB(4, 10, 4, 6), child: Text('إجابات مقترحة: استمع ثم كرّرها', style: TextStyle(fontWeight: FontWeight.w900, color: kInk, fontSize: 16))),
        for (var i = 0; i < r.suggestions.length; i++)
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(r.suggestions[i].label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: kTeal)),
                Text(r.suggestions[i].hintAr, style: const TextStyle(fontSize: 12.5, color: kMuted)),
                const SizedBox(height: 6),
                En(r.suggestions[i].text, style: const TextStyle(color: kInk, fontSize: 15.5, height: 1.55)),
                Row(
                  children: [
                    SpeakButton(r.suggestions[i].text),
                    SpeakButton(r.suggestions[i].text, slow: true),
                    const Spacer(),
                    TextButton.icon(
                      onPressed: _shadowListening && _shadowIdx == i ? null : () => _shadow(i),
                      icon: Icon(_shadowListening && _shadowIdx == i ? Icons.hearing_rounded : Icons.mic_rounded),
                      label: Text(_shadowListening && _shadowIdx == i ? 'أسمعك...' : 'جرّب قولها'),
                    ),
                  ],
                ),
                if (_shadowIdx == i && _shadowHeard.isNotEmpty) _shadowResult(r.suggestions[i].text),
              ],
            ),
          ),
        const SizedBox(height: 6),
        FilledButton(onPressed: _next, child: Text(last ? 'عرض النتيجة النهائية' : 'السؤال التالي')),
      ],
    );
  }

  Widget _shadowResult(String target) {
    final res = comparePronunciation(target, _shadowHeard);
    return Container(
      margin: const EdgeInsets.only(top: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: kTint, borderRadius: BorderRadius.circular(14)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('وضوح الكلمات: ${res.percent}%', style: const TextStyle(fontWeight: FontWeight.w900, color: kInk)),
          const SizedBox(height: 6),
          Directionality(
            textDirection: TextDirection.ltr,
            child: Wrap(
              spacing: 6,
              runSpacing: 4,
              children: [for (final w in res.words) Text(w.word, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: w.ok ? kOk : kBad))],
            ),
          ),
          const SizedBox(height: 4),
          const Text('الأخضر: فهمه الجوال. الأحمر: لم يتضح. هذا قياس لوضوح الكلمات وليس تحليلاً صوتياً دقيقاً.', style: TextStyle(color: kMuted, fontSize: 12, height: 1.5)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final done = _i >= _qs.length;
    return Scaffold(
      appBar: AppBar(title: Text('مقابلة: ${widget.jobAr}')),
      body: SafeArea(child: done ? _report() : (_review != null ? _reviewView() : _question())),
    );
  }

  Widget _question() {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        Row(
          children: [
            Expanded(child: Text('السؤال ${_i + 1} من ${_qs.length}', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w800))),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(color: _left <= 10 ? kBadBg : kTint, borderRadius: BorderRadius.circular(99)),
              child: Text('⏱ $_left', style: TextStyle(fontWeight: FontWeight.w900, color: _left <= 10 ? kBad : kTeal)),
            ),
          ],
        ),
        const SizedBox(height: 14),
        AppCard(
          child: Column(
            children: [
              const Text('👔', style: TextStyle(fontSize: 46)),
              const SizedBox(height: 6),
              En(_qs[_i][0], align: TextAlign.center, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: kInk)),
              SpeakButton(_qs[_i][0]),
            ],
          ),
        ),
        Text(
          _asking ? 'المحاور يسأل...' : (_listening ? '🎙️ أسمعك، أجب الآن' : 'اضغط الميكروفون أو اكتب إجابتك'),
          textAlign: TextAlign.center,
          style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 10),
        if (_heard.isNotEmpty) AppCard(color: kTint, child: En(_heard, style: const TextStyle(fontSize: 16, color: kInk, height: 1.5))),
        if (!_asking && !_listening)
          Center(child: IconButton.filled(iconSize: 34, onPressed: _record, icon: const Icon(Icons.mic_rounded))),
        const SizedBox(height: 8),
        TextField(
          controller: _typed,
          textDirection: TextDirection.ltr,
          maxLines: 2,
          decoration: InputDecoration(hintText: 'أو اكتب إجابتك بالإنجليزية', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14))),
        ),
        const SizedBox(height: 12),
        FilledButton(onPressed: _asking ? null : _submit, child: const Text('أنهيت إجابتي')),
      ],
    );
  }

  Widget _report() {
    final total = _answers.isEmpty ? 0 : _answers.fold<int>(0, (a, b) => a + b.score) ~/ _answers.length;
    if (!_saved) {
      _saved = true;
      Future.microtask(() {
        AppStore.I.bump('interview');
        if (total > AppStore.I.count('interviewBest')) AppStore.I.setCount('interviewBest', total);
      });
    }
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF6A56E8), Color(0xFF3A2BA8)]), borderRadius: BorderRadius.circular(22)),
          child: Column(
            children: [
              const Text('نتيجة المقابلة', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w700)),
              Text('$total%', style: const TextStyle(color: Colors.white, fontSize: 46, fontWeight: FontWeight.w900)),
              Text(total >= 75 ? 'أداء قوي. أنت جاهز تقريباً.' : (total >= 50 ? 'بداية جيدة. راجع الإجابات المقترحة وأعد.' : 'تحتاج تدريباً أكثر. كرّر الإجابات المقترحة بصوتك.'), textAlign: TextAlign.center, style: const TextStyle(color: kGold, fontWeight: FontWeight.w700)),
            ],
          ),
        ),
        for (final a in _answers)
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: En(a.question, style: const TextStyle(fontWeight: FontWeight.w800, color: kInk, fontSize: 15.5))),
                    Text('${a.score}%', style: TextStyle(fontWeight: FontWeight.w900, color: a.score >= 70 ? kOk : kCoral)),
                  ],
                ),
                const SizedBox(height: 6),
                En(a.said.isEmpty ? '—' : a.said, style: const TextStyle(color: kMuted, fontSize: 14.5, height: 1.5)),
                const SizedBox(height: 6),
                for (final n in a.notes) Text('• $n', style: const TextStyle(color: kInk, fontSize: 13.5, height: 1.6)),
                if (a.review?.corrected != null) ...[
                  const SizedBox(height: 4),
                  const Text('بعد التصحيح', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: kTeal)),
                  En(a.review!.corrected!, style: const TextStyle(color: kInk, fontSize: 14.5, height: 1.5)),
                ],
                const Divider(height: 18, color: kLine),
                const Text('جواب نموذجي', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: kTeal)),
                Row(children: [Expanded(child: En(a.model, style: const TextStyle(color: kInk, fontSize: 15, height: 1.5))), SpeakButton(a.model)]),
              ],
            ),
          ),
        const Text('التقييم آلي: يقيس طول الإجابة وسلامتها من الأخطاء الشائعة وصلتها بالسؤال ووجود مثال وطلاقتها، وليس حكم محاور بشري. الإجابات المقترحة نماذج للتدرب وليست الوحيدة الصحيحة.', style: TextStyle(color: kMuted, fontSize: 12.5, height: 1.6)),
        const SizedBox(height: 10),
        FilledButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إنهاء')),
      ],
    );
  }
}

// =====================================================================
// 3) إنجليزية مهنتك: مسارات مهنية
// =====================================================================

class CareerTrack {
  const CareerTrack(this.id, this.emoji, this.titleAr, this.phrases);
  final String id;
  final String emoji;
  final String titleAr;
  final List<Phrase> phrases;
}

const _baseTracks = <CareerTrack>[
  CareerTrack('sales', '📈', 'المبيعات', [
    Phrase('How can I help you today?', 'كيف أساعدك اليوم؟', 'A2'), Phrase('This is our best-selling product.', 'هذا أكثر منتجاتنا مبيعاً.', 'A2'),
    Phrase('It comes with a two-year warranty.', 'يأتي مع ضمان سنتين.', 'A2'), Phrase('We can offer you a ten percent discount.', 'نستطيع أن نقدم لك خصم عشرة بالمئة.', 'A2'),
    Phrase('What is your budget?', 'ما ميزانيتك؟', 'A2'), Phrase('Let me show you how it works.', 'دعني أريك كيف يعمل.', 'A2'),
    Phrase('The price includes delivery.', 'السعر يشمل التوصيل.', 'A2'), Phrase('I will send you a quotation today.', 'سأرسل لك عرض سعر اليوم.', 'B1'),
    Phrase('Would you like to place an order?', 'هل تود تقديم طلب؟', 'B1'), Phrase('Thank you for your business.', 'شكراً لتعاملك معنا.', 'B1'),
  ]),
  CareerTrack('medical', '🩺', 'الطب والتمريض', [
    Phrase('Where does it hurt?', 'أين الألم؟', 'A2'), Phrase('How long have you had this pain?', 'منذ متى عندك هذا الألم؟', 'A2'),
    Phrase('Are you allergic to any medicine?', 'هل لديك حساسية من أي دواء؟', 'A2'), Phrase('Please take a deep breath.', 'خذ نفساً عميقاً من فضلك.', 'A2'),
    Phrase('I need to check your blood pressure.', 'أحتاج أن أقيس ضغط دمك.', 'A2'), Phrase('Take this tablet twice a day.', 'خذ هذا القرص مرتين يومياً.', 'A2'),
    Phrase('You need to rest for a few days.', 'تحتاج أن ترتاح بضعة أيام.', 'A2'), Phrase('The results will be ready tomorrow.', 'النتائج تكون جاهزة غداً.', 'A2'),
    Phrase('Do you have any other symptoms?', 'هل عندك أعراض أخرى؟', 'B1'), Phrase('Please come back if it gets worse.', 'عد من فضلك إن ساءت الحالة.', 'B1'),
  ]),
  CareerTrack('hotel', '🏨', 'الضيافة والفنادق', [
    Phrase('Welcome to our hotel.', 'أهلاً بك في فندقنا.', 'A1'), Phrase('Do you have a reservation?', 'هل لديك حجز؟', 'A2'),
    Phrase('May I see your passport, please?', 'هل لي أن أرى جواز سفرك؟', 'A2'), Phrase('Your room is on the third floor.', 'غرفتك في الطابق الثالث.', 'A1'),
    Phrase('Breakfast is served from seven to ten.', 'الفطور يُقدَّم من السابعة إلى العاشرة.', 'A2'), Phrase('Would you like help with your bags?', 'هل تود مساعدة في حقائبك؟', 'A2'),
    Phrase('I apologise for the inconvenience.', 'أعتذر عن الإزعاج.', 'B1'), Phrase('I will send someone right away.', 'سأرسل أحداً حالاً.', 'A2'),
    Phrase('Check-out is at noon.', 'المغادرة عند الظهر.', 'A2'), Phrase('We hope you enjoyed your stay.', 'نتمنى أنك استمتعت بإقامتك.', 'B1'),
  ]),
  CareerTrack('tech', '💻', 'البرمجة والتقنية', [
    Phrase('I found a bug in the code.', 'وجدت خطأً في الشيفرة.', 'A2'), Phrase('Can you review my pull request?', 'هل تراجع طلب الدمج الخاص بي؟', 'B1'),
    Phrase('The server is down.', 'الخادم متوقف.', 'A2'), Phrase('We need to fix this before the release.', 'يجب أن نصلح هذا قبل الإصدار.', 'B1'),
    Phrase('I will push the changes today.', 'سأرفع التعديلات اليوم.', 'B1'), Phrase('The feature is ready for testing.', 'الميزة جاهزة للاختبار.', 'A2'),
    Phrase('Could you share your screen?', 'هل تشارك شاشتك؟', 'A2'), Phrase('It works on my machine.', 'يعمل على جهازي.', 'A2'),
    Phrase('We should back up the database first.', 'علينا أن ننسخ قاعدة البيانات احتياطياً أولاً.', 'B1'), Phrase('The deadline is next Friday.', 'الموعد النهائي الجمعة القادمة.', 'A2'),
  ]),
];

/// المسارات المهنية: الجمل الأساسية + الجمل الموسّعة من ملف pro_careers (12 مساراً).
final List<CareerTrack> careerTracks = _buildTracks();

String _phraseLevel(String en) {
  final w = en.split(' ').length;
  return w <= 4 ? 'A1' : (w <= 7 ? 'A2' : 'B1');
}

List<CareerTrack> _buildTracks() {
  final out = <CareerTrack>[];
  final seen = <String>{};
  for (final b in _baseTracks) {
    final list = <Phrase>[...b.phrases];
    final have = {for (final p in list) p.en.toLowerCase()};
    for (final d in proCareerData) {
      if (d[0] != b.id) continue;
      for (var i = 3; i < d.length; i++) {
        final kv = d[i].split('|');
        if (kv.length == 2 && have.add(kv[0].toLowerCase())) list.add(Phrase(kv[0], kv[1], _phraseLevel(kv[0])));
      }
    }
    out.add(CareerTrack(b.id, b.emoji, b.titleAr, list));
    seen.add(b.id);
  }
  for (final d in proCareerData) {
    if (seen.contains(d[0])) continue;
    out.add(CareerTrack(d[0], d[1], d[2], [
      for (var i = 3; i < d.length; i++)
        if (d[i].split('|').length == 2) Phrase(d[i].split('|')[0], d[i].split('|')[1], _phraseLevel(d[i].split('|')[0])),
    ]));
  }
  return out;
}

class CareerTracksScreen extends StatelessWidget {
  const CareerTracksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) => Scaffold(
        appBar: AppBar(title: const Text('إنجليزية مهنتك')),
        body: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            const Text('اختر مجالك وتدرّب على الجمل التي تحتاجها في عملك فعلاً.', style: TextStyle(color: kMuted, height: 1.6)),
            const SizedBox(height: 10),
            for (final t in careerTracks)
              ActivityTile(
                emoji: t.emoji,
                title: t.titleAr,
                subtitle: '${t.phrases.length} جمل أساسية · أتقنت ${AppStore.I.count('track:${t.id}')}',
                onTap: () => push(context, PhraseDrillScreen(title: t.titleAr, phrases: t.phrases, counter: 'track:${t.id}')),
              ),
            ActivityTile(emoji: '👔', title: 'مقابلة عمل حقيقية', subtitle: 'مقابلة بالصوت مع مؤقت وتقييم', onTap: () => push(context, const InterviewSetupScreen())),
          ],
        ),
      ),
    );
  }
}

/// تمرين جمل: استمع ثم قل الجملة، ويُحسب تطابق كلماتك.
class PhraseDrillScreen extends StatefulWidget {
  const PhraseDrillScreen({super.key, required this.title, required this.phrases, required this.counter});
  final String title;
  final List<Phrase> phrases;
  final String counter;

  @override
  State<PhraseDrillScreen> createState() => _PhraseDrillScreenState();
}

class _PhraseDrillScreenState extends State<PhraseDrillScreen> with TimedState<PhraseDrillScreen> {
  int _i = 0;
  String _heard = '';
  PronResult? _r;
  bool _listening = false;
  final Set<int> _passed = {};

  Phrase get _p => widget.phrases[_i];

  @override
  void initState() {
    super.initState();
    Speech.I.onStatus = (status) {
      if (!mounted || !_listening) return;
      if (status == 'done' || status == 'notListening') {
        setState(() => _listening = false);
        if (_r == null && _heard.trim().isNotEmpty) _evaluate();
      }
    };
    WidgetsBinding.instance.addPostFrameCallback((_) => Speech.I.say(_p.en));
  }

  Future<void> _record() async {
    if (_listening) {
      await Speech.I.stopListening();
      return;
    }
    setState(() {
      _heard = '';
      _r = null;
      _listening = true;
    });
    final ok = await Speech.I.listen(
      onText: (text, isFinal) {
        if (!mounted) return;
        setState(() => _heard = text);
        if (isFinal) _evaluate();
      },
    );
    if (mounted && !ok) {
      setState(() => _listening = false);
      toast(context, 'تعذر تشغيل الميكروفون.');
    }
  }

  void _evaluate() {
    if (_r != null) return;
    final r = comparePronunciation(_p.en, _heard);
    setState(() {
      _r = r;
      _listening = false;
    });
    if (r.percent >= 80 && _passed.add(_i)) {
      AppStore.I.bump('say');
      if (_passed.length > AppStore.I.count(widget.counter)) AppStore.I.setCount(widget.counter, _passed.length);
    }
  }

  void _go(int d) {
    setState(() {
      _i = (_i + d) % widget.phrases.length;
      if (_i < 0) _i += widget.phrases.length;
      _heard = '';
      _r = null;
    });
    Speech.I.say(_p.en);
  }

  @override
  Widget build(BuildContext context) {
    final r = _r;
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            Text('الجملة ${_i + 1} من ${widget.phrases.length} · أتقنت ${_passed.length}', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                children: [
                  En(_p.en, align: TextAlign.center, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: kInk, height: 1.4)),
                  const SizedBox(height: 6),
                  Text(_p.ar, textAlign: TextAlign.center, style: const TextStyle(color: kMuted, fontSize: 16)),
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [SpeakButton(_p.en), SpeakButton(_p.en, slow: true)]),
                ],
              ),
            ),
            Center(
              child: GestureDetector(
                onTap: _record,
                child: Container(
                  width: 92,
                  height: 92,
                  decoration: BoxDecoration(color: _listening ? kCoral : kTeal, shape: BoxShape.circle),
                  child: Icon(_listening ? Icons.stop_rounded : Icons.mic_rounded, color: Colors.white, size: 42),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(_listening ? 'أسمعك...' : 'اضغط وقل الجملة', textAlign: TextAlign.center, style: const TextStyle(color: kMuted)),
            if (r != null) ...[
              const SizedBox(height: 10),
              FeedbackBox(ok: r.percent >= 80, text: r.percent >= 80 ? 'ممتاز (${r.percent}%)' : 'تطابق ${r.percent}%. قلت: $_heard\nاستمع مرة أخرى وأعد.'),
            ],
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(child: OutlinedButton(onPressed: () => _go(-1), child: const Text('السابقة'))),
                const SizedBox(width: 10),
                Expanded(child: FilledButton(onPressed: () => _go(1), child: const Text('التالية'))),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// 4) الدوري الأسبوعي بين المستخدمين
// =====================================================================

/// رقم الأسبوع (يبدأ الاثنين) ودقائق التعلم فيه.
int weekId() => (todayNumber() + 3) ~/ 7;

int weekMinutes() {
  final dayInWeek = (todayNumber() + 3) % 7; // 0 = الاثنين
  final secs = AppStore.I.lastDaysSeconds(dayInWeek + 1);
  return secs.fold<int>(0, (a, b) => a + b) ~/ 60;
}

class LeagueScreen extends StatefulWidget {
  const LeagueScreen({super.key});

  @override
  State<LeagueScreen> createState() => _LeagueScreenState();
}

class _LeagueScreenState extends State<LeagueScreen> {
  late final CollectionReference<Map<String, dynamic>> _scores;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _scores = FirebaseFirestore.instance.collection('league').doc('w${weekId()}').collection('scores');
    _publish();
  }

  Future<void> _publish() async {
    final u = Account.I.user;
    if (u == null) return;
    try {
      await _scores.doc(u.uid).set({
        'name': Account.I.name.isEmpty ? 'متعلم' : Account.I.name,
        'score': weekMinutes(),
        'level': AppStore.I.level,
        'at': FieldValue.serverTimestamp(),
      });
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحديث نتيجتك. تحقق من الإنترنت.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final me = Account.I.user?.uid ?? '';
    final daysLeft = 7 - (todayNumber() + 3) % 7;
    return Scaffold(
      appBar: AppBar(title: const Text('الدوري الأسبوعي')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          AppCard(
            color: kTint,
            child: Text(
              'دقائقك هذا الأسبوع: ${weekMinutes()} · ينتهي الدوري بعد $daysLeft أيام ويبدأ من جديد كل اثنين.\nالترتيب بدقائق التعلم الفعلية.',
              style: const TextStyle(color: kInk, height: 1.7, fontWeight: FontWeight.w600),
            ),
          ),
          if (_error.isNotEmpty) FeedbackBox(ok: false, text: _error),
          StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
            stream: _scores.orderBy('score', descending: true).limit(30).snapshots(),
            builder: (context, snap) {
              if (snap.hasError) return const FeedbackBox(ok: false, text: 'تعذر تحميل الترتيب. تأكد من نشر قواعد Firestore الجديدة.');
              if (!snap.hasData) return const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()));
              final docs = snap.data!.docs;
              return Column(
                children: [
                  for (var i = 0; i < docs.length; i++)
                    Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: docs[i].id == me ? const Color(0xFFFFF6DC) : kCard,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: docs[i].id == me ? kGold : kLine),
                      ),
                      child: Row(
                        children: [
                          SizedBox(width: 34, child: Text(i < 3 ? const ['🥇', '🥈', '🥉'][i] : '${i + 1}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900))),
                          Expanded(child: Text('${docs[i].data()['name'] ?? 'متعلم'}${docs[i].id == me ? ' (أنت)' : ''}', style: const TextStyle(fontWeight: FontWeight.w800, color: kInk))),
                          Text('${docs[i].data()['level'] ?? ''}  ', textDirection: TextDirection.ltr, style: const TextStyle(color: kMuted, fontSize: 12)),
                          Text('${docs[i].data()['score'] ?? 0} د', style: const TextStyle(fontWeight: FontWeight.w900, color: kTeal)),
                        ],
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// 5) شهادة المستوى: امتحان ثم شهادة قابلة للمشاركة
// =====================================================================

class CertificatesScreen extends StatelessWidget {
  const CertificatesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) => Scaffold(
        appBar: AppBar(title: const Text('شهادات المستوى')),
        body: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            const Text('اجتز امتحان المستوى (10 أسئلة، النجاح من 8) لتحصل على شهادته.', style: TextStyle(color: kMuted, height: 1.6)),
            const SizedBox(height: 10),
            for (final l in const ['A1', 'A2', 'B1'])
              Builder(builder: (context) {
                final got = AppStore.I.count('cert:$l') > 0;
                return ActivityTile(
                  emoji: got ? '🎓' : '📝',
                  title: 'شهادة $l · ${levelNamesAr[l]}',
                  subtitle: got ? 'حصلت عليها · اضغط لعرضها' : 'ادخل الامتحان',
                  onTap: () => push(context, got ? CertificateView(level: l) : LevelExamScreen(level: l)),
                );
              }),
          ],
        ),
      ),
    );
  }
}

class LevelExamScreen extends StatefulWidget {
  const LevelExamScreen({super.key, required this.level});
  final String level;

  @override
  State<LevelExamScreen> createState() => _LevelExamScreenState();
}

class _LevelExamScreenState extends State<LevelExamScreen> {
  late final List<PlacementQ> _qs;
  late List<String> _options;
  int _i = 0;
  int _right = 0;
  String? _picked;

  @override
  void initState() {
    super.initState();
    final pool = [...placementQuestions, ...placementSkills].where((q) => q.level == widget.level).toList()..shuffle();
    _qs = pool.take(10).toList();
    _prepare();
  }

  @override
  void dispose() {
    Speech.I.stopSpeaking();
    super.dispose();
  }

  void _prepare() {
    _options = List<String>.from(_qs[_i].options)..shuffle();
    _picked = null;
    if (_qs[_i].audio.isNotEmpty) Speech.I.say(_qs[_i].audio, rate: 0.42);
  }

  void _next() {
    setState(() {
      _i++;
      if (_i < _qs.length) _prepare();
    });
    if (_i >= _qs.length && _right >= 8) AppStore.I.setCount('cert:${widget.level}', todayNumber());
  }

  @override
  Widget build(BuildContext context) {
    final done = _i >= _qs.length;
    return Scaffold(
      appBar: AppBar(title: Text('امتحان ${widget.level}')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: done
              ? [
                  const SizedBox(height: 30),
                  Text(_right >= 8 ? '🎓' : '📚', textAlign: TextAlign.center, style: const TextStyle(fontSize: 80)),
                  Text('$_right من ${_qs.length}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
                  Text(_right >= 8 ? 'مبروك! نجحت في امتحان ${widget.level}.' : 'لم تنجح هذه المرة. النجاح من 8. راجع دروس المستوى وأعد المحاولة.', textAlign: TextAlign.center, style: const TextStyle(color: kMuted, height: 1.7)),
                  const SizedBox(height: 24),
                  if (_right >= 8)
                    FilledButton(onPressed: () => Navigator.of(context).pushReplacement(MaterialPageRoute<void>(builder: (_) => CertificateView(level: widget.level))), child: const Text('اعرض شهادتي'))
                  else
                    FilledButton(onPressed: () => Navigator.of(context).pop(), child: const Text('رجوع')),
                ]
              : [
                  LinearProgressIndicator(value: _i / _qs.length, minHeight: 8, color: kCoral, backgroundColor: kLine),
                  const SizedBox(height: 8),
                  Text('السؤال ${_i + 1} من ${_qs.length} · ${skillNamesAr[_qs[_i].skill] ?? ''}', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  if (_qs[_i].passage.isNotEmpty) AppCard(color: kTint, child: En(_qs[_i].passage, style: const TextStyle(fontSize: 16, height: 1.6, color: kInk))),
                  if (_qs[_i].audio.isNotEmpty)
                    AppCard(
                      color: kTint,
                      child: Row(
                        children: [
                          IconButton.filled(onPressed: () => Speech.I.say(_qs[_i].audio, rate: 0.42), icon: const Icon(Icons.volume_up_rounded)),
                          const SizedBox(width: 10),
                          const Expanded(child: Text('استمع ثم أجب', style: TextStyle(fontWeight: FontWeight.w700, color: kInk))),
                        ],
                      ),
                    ),
                  AppCard(child: En(_qs[_i].q, align: TextAlign.center, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: kInk))),
                  for (final o in _options)
                    OptionButton(
                      text: o,
                      english: true,
                      state: _picked == null ? 0 : (o == _qs[_i].options[_qs[_i].answer] ? 1 : (o == _picked ? 2 : 0)),
                      onTap: _picked != null
                          ? null
                          : () => setState(() {
                                _picked = o;
                                if (o == _qs[_i].options[_qs[_i].answer]) _right++;
                              }),
                    ),
                  if (_picked != null) FilledButton(onPressed: _next, child: const Text('التالي')),
                ],
        ),
      ),
    );
  }
}

class CertificateView extends StatelessWidget {
  const CertificateView({super.key, required this.level});
  final String level;

  @override
  Widget build(BuildContext context) {
    final day = AppStore.I.count('cert:$level');
    final date = DateTime.fromMillisecondsSinceEpoch(day * 86400000, isUtc: true);
    final name = Account.I.name.isEmpty ? 'متعلم مغرّد' : Account.I.name;
    return Scaffold(
      appBar: AppBar(title: const Text('شهادتي')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(gradient: const LinearGradient(colors: [kGold, Color(0xFFFF9F43)]), borderRadius: BorderRadius.circular(22)),
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 26, 20, 26),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(17)),
              child: Column(
                children: [
                  const BulbulLogo(size: 62),
                  const SizedBox(height: 10),
                  const Text('شهادة إتمام مستوى', style: TextStyle(fontSize: 15, color: kMuted, fontWeight: FontWeight.w700)),
                  const Text('Certificate of Achievement', textDirection: TextDirection.ltr, style: TextStyle(fontSize: 13, color: kMuted, letterSpacing: 1)),
                  const SizedBox(height: 18),
                  const Text('يشهد تطبيق مغرّد بأن', style: TextStyle(color: kInk)),
                  const SizedBox(height: 6),
                  Text(name, textAlign: TextAlign.center, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: kTeal)),
                  const SizedBox(height: 6),
                  const Text('اجتاز بنجاح امتحان اللغة الإنجليزية للمستوى', textAlign: TextAlign.center, style: TextStyle(color: kInk)),
                  const SizedBox(height: 10),
                  Text('$level · ${levelNamesAr[level]}', textDirection: TextDirection.ltr, style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: kCoral)),
                  const SizedBox(height: 16),
                  Text('${date.year}/${date.month}/${date.day}', textDirection: TextDirection.ltr, style: const TextStyle(color: kMuted)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          const Text('لمشاركتها: التقط صورة للشاشة وأرسلها. الشهادة تثبت اجتياز امتحان داخل التطبيق، وليست شهادة معتمدة دولياً.', textAlign: TextAlign.center, style: TextStyle(color: kMuted, fontSize: 12.5, height: 1.7)),
        ],
      ),
    );
  }
}
