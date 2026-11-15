import 'package:flutter/material.dart';

import '../core/speech.dart';
import '../core/store.dart';
import '../data/content.dart';
import '../ui/common.dart';

// =====================================================================
// تدريب تركيب الجمل للكبار: رتّب الكلمات لتكوّن الجملة
// =====================================================================

/// جمل إضافية تركز على ترتيب الكلمات الذي يخطئ فيه المتحدث بالعربية.
const _patterns = <Phrase>[
  Phrase('I usually drink coffee in the morning.', 'أشرب القهوة عادة في الصباح.', 'A1'),
  Phrase('She has a big red car.', 'عندها سيارة حمراء كبيرة.', 'A1'),
  Phrase('Where do you live?', 'أين تسكن؟', 'A1'),
  Phrase('There is a book on the table.', 'يوجد كتاب على الطاولة.', 'A1'),
  Phrase('My brother is taller than me.', 'أخي أطول مني.', 'A1'),
  Phrase('What time does the shop open?', 'متى يفتح المحل؟', 'A2'),
  Phrase('I have never been to London.', 'لم أزر لندن من قبل.', 'A2'),
  Phrase('He always arrives late on Mondays.', 'يصل متأخراً دائماً يوم الاثنين.', 'A2'),
  Phrase('Can you tell me where the station is?', 'هل تخبرني أين المحطة؟', 'A2'),
  Phrase('We did not go out because it was raining.', 'لم نخرج لأنها كانت تمطر.', 'A2'),
  Phrase('I am not used to waking up early.', 'لست معتاداً على الاستيقاظ مبكراً.', 'B1'),
  Phrase('The email was sent to all employees yesterday.', 'أُرسل البريد إلى كل الموظفين أمس.', 'B1'),
  Phrase('If it rains tomorrow, we will stay at home.', 'إذا أمطرت غداً سنبقى في البيت.', 'B1'),
  Phrase('She asked me whether I had finished the report.', 'سألتني هل أنهيت التقرير.', 'B1'),
  Phrase('Not only is he smart, but he is also kind.', 'ليس ذكياً فقط، بل طيب أيضاً.', 'B1'),
];

class BuildScreen extends StatefulWidget {
  const BuildScreen({super.key});

  @override
  State<BuildScreen> createState() => _BuildScreenState();
}

class _BuildScreenState extends State<BuildScreen> with TimedState<BuildScreen> {
  late final List<Phrase> _list;
  int _i = 0;
  List<String> _target = [];
  List<int> _pool = [];
  List<String> _shuffled = [];
  final List<int> _chosen = [];
  bool? _ok;
  int _right = 0;

  Phrase get _p => _list[_i];

  @override
  void initState() {
    super.initState();
    final level = AppStore.I.level.isEmpty ? 'A1' : AppStore.I.level;
    _list = [..._patterns.where((p) => p.level == level), ...phrasesFor(level)]..shuffle();
    _prepare();
  }

  void _prepare() {
    _target = _p.en.split(' ');
    _shuffled = List<String>.from(_target);
    // نضمن أن الترتيب المعروض يختلف عن الصحيح.
    for (var t = 0; t < 5 && _shuffled.join(' ') == _target.join(' ') && _target.length > 1; t++) {
      _shuffled.shuffle();
    }
    if (_shuffled.join(' ') == _target.join(' ') && _target.length > 1) _shuffled = _shuffled.reversed.toList();
    _pool = [for (var k = 0; k < _shuffled.length; k++) k];
    _chosen.clear();
    _ok = null;
  }

  void _tap(int k) {
    if (_ok != null) return;
    setState(() {
      _pool.remove(k);
      _chosen.add(k);
    });
    if (_pool.isEmpty) _check();
  }

  void _undo(int k) {
    if (_ok != null) return;
    setState(() {
      _chosen.remove(k);
      _pool.add(k);
      _pool.sort();
    });
  }

  void _check() {
    final made = _chosen.map((k) => _shuffled[k]).join(' ');
    final ok = made == _p.en;
    setState(() => _ok = ok);
    Speech.I.say(_p.en);
    if (ok) {
      _right++;
      AppStore.I.bump('build');
    } else {
      AppStore.I.addMistake(kind: 'grammar', prompt: 'رتّب الجملة: ${_p.ar}', wrong: made, correct: _p.en, note: 'انتبه لترتيب الكلمات في الجملة الإنجليزية.');
    }
  }

  void _next() {
    setState(() {
      _i = (_i + 1) % _list.length;
      _prepare();
    });
  }

  Widget _chip(int k, VoidCallback onTap, Color bg, Color fg) {
    return Material(
      color: bg,
      borderRadius: BorderRadius.circular(12),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Text(_shuffled[k], style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: fg)),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final done = _ok != null;
    return Scaffold(
      appBar: AppBar(title: const Text('تركيب الجمل')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            Text('رتّب الكلمات لتكوّن الجملة · صحيح حتى الآن: $_right', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            AppCard(child: Text(_p.ar, textAlign: TextAlign.center, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: kInk, height: 1.6))),
            Container(
              constraints: const BoxConstraints(minHeight: 96),
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: done ? (_ok! ? kOkBg : kBadBg) : Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: done ? (_ok! ? kOk : kBad) : kLine, width: 1.5),
              ),
              child: Directionality(
                textDirection: TextDirection.ltr,
                child: Wrap(spacing: 8, runSpacing: 8, children: [for (final k in _chosen) _chip(k, () => _undo(k), kTeal, Colors.white)]),
              ),
            ),
            const SizedBox(height: 16),
            Directionality(
              textDirection: TextDirection.ltr,
              child: Wrap(alignment: WrapAlignment.center, spacing: 8, runSpacing: 8, children: [for (final k in _pool) _chip(k, () => _tap(k), kTint, kInk)]),
            ),
            const SizedBox(height: 18),
            if (done) ...[
              FeedbackBox(ok: _ok!, text: _ok! ? 'ترتيب صحيح!' : 'الترتيب الصحيح:\n${_p.en}\nأضفناها إلى دفتر أخطائك.'),
              FilledButton(onPressed: _next, child: const Text('الجملة التالية')),
            ] else
              const Text('اضغط الكلمة لإضافتها، واضغطها في الأعلى لإرجاعها.', textAlign: TextAlign.center, style: TextStyle(color: kMuted, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// مصنع الجمل للأطفال: اختر من؟ ماذا يفعل؟ ماذا؟ واسمع جملتك
// =====================================================================

class _Who {
  const _Who(this.emoji, this.en, this.ar, this.fem);
  final String emoji;
  final String en;
  final String ar;
  final bool fem;
}

class _Verb {
  const _Verb(this.emoji, this.en, this.arM, this.arF);
  final String emoji;
  final String en;
  final String arM;
  final String arF;
}

class _What {
  const _What(this.emoji, this.en, this.ar);
  final String emoji;
  final String en;
  final String ar;
}

const _whos = <_Who>[
  _Who('🐱', 'The cat', 'القطة', true),
  _Who('🐶', 'The dog', 'الكلب', false),
  _Who('👦', 'The boy', 'الولد', false),
  _Who('👧', 'The girl', 'البنت', true),
  _Who('🐵', 'The monkey', 'القرد', false),
  _Who('👩', 'My mum', 'أمي', true),
];

const _verbs = <_Verb>[
  _Verb('👀', 'sees', 'يرى', 'ترى'),
  _Verb('❤️', 'likes', 'يحب', 'تحب'),
  _Verb('🤲', 'has', 'عنده', 'عندها'),
  _Verb('🙏', 'wants', 'يريد', 'تريد'),
  _Verb('🔍', 'finds', 'يجد', 'تجد'),
];

const _whats = <_What>[
  _What('🍎', 'an apple', 'تفاحة'),
  _What('⚽', 'a ball', 'كرة'),
  _What('🐟', 'a fish', 'سمكة'),
  _What('📕', 'a book', 'كتاباً'),
  _What('🍌', 'a banana', 'موزة'),
  _What('🎈', 'a balloon', 'بالوناً'),
  _What('🌸', 'a flower', 'زهرة'),
];

class SentenceFactoryScreen extends StatefulWidget {
  const SentenceFactoryScreen({super.key});

  @override
  State<SentenceFactoryScreen> createState() => _SentenceFactoryScreenState();
}

class _SentenceFactoryScreenState extends State<SentenceFactoryScreen> with TimedState<SentenceFactoryScreen> {
  int? _w;
  int? _v;
  int? _o;
  final Set<String> _made = {};

  /// جملة التحدي: أرقام [من، الفعل، ماذا]. null = لعب حر.
  List<int>? _goal;

  bool get _complete => _w != null && _v != null && _o != null;
  String get _en => '${_whos[_w!].en} ${_verbs[_v!].en} ${_whats[_o!].en}.';

  String _ar(int w, int v, int o) => '${_whos[w].ar} ${_whos[w].fem ? _verbs[v].arF : _verbs[v].arM} ${_whats[o].ar}';

  void _newGoal() {
    final r = DateTime.now().microsecondsSinceEpoch;
    setState(() {
      _goal = [r % _whos.length, (r ~/ 7) % _verbs.length, (r ~/ 53) % _whats.length];
      _w = null;
      _v = null;
      _o = null;
    });
  }

  void _pick(int column, int index) {
    setState(() {
      if (column == 0) _w = index;
      if (column == 1) _v = index;
      if (column == 2) _o = index;
    });
    if (!_complete) {
      final word = column == 0 ? _whos[index].en : (column == 1 ? _verbs[index].en : _whats[index].en);
      Speech.I.say(word, rate: 0.36);
      return;
    }
    final sentence = _en;
    Speech.I.say(sentence, rate: 0.36);
    final g = _goal;
    if (g != null) {
      if (g[0] == _w && g[1] == _v && g[2] == _o) {
        AppStore.I.addStars(2);
        AppStore.I.markActive();
        toast(context, 'أحسنت! ⭐⭐');
        setState(() => _goal = null);
      }
    } else if (_made.add(sentence) && _made.length <= 10) {
      AppStore.I.addStars(1);
      AppStore.I.markActive();
    }
  }

  Widget _column(String title, int column, int count, String Function(int) emoji, String Function(int) label, int? selected) {
    return Expanded(
      child: Column(
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w900, color: kInk, fontSize: 15)),
          const SizedBox(height: 6),
          for (var k = 0; k < count; k++)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
              child: Material(
                color: selected == k ? kGold : Colors.white,
                borderRadius: BorderRadius.circular(16),
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () => _pick(column, k),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Column(
                      children: [
                        Text(emoji(k), style: const TextStyle(fontSize: 26)),
                        Text(label(k), textDirection: TextDirection.ltr, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: kInk)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final g = _goal;
    return Scaffold(
      appBar: AppBar(title: const Text('مصنع الجمل')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(14),
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: kTint, borderRadius: BorderRadius.circular(20)),
              child: Column(
                children: [
                  if (g != null) Text('اصنع هذه الجملة: ${_ar(g[0], g[1], g[2])}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: kCoral)),
                  if (_complete) ...[
                    Text('${_whos[_w!].emoji} ${_verbs[_v!].emoji} ${_whats[_o!].emoji}', style: const TextStyle(fontSize: 40)),
                    En(_en, align: TextAlign.center, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: kInk)),
                    Text(_ar(_w!, _v!, _o!), style: const TextStyle(fontSize: 17, color: kMuted)),
                    IconButton(onPressed: () => Speech.I.say(_en, rate: 0.36), icon: const Icon(Icons.volume_up_rounded, color: kTeal, size: 34)),
                  ] else if (g == null)
                    const Text('اختر من كل عمود واحدة واسمع جملتك!', textAlign: TextAlign.center, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: kInk)),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Directionality(
              textDirection: TextDirection.ltr,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _column('من؟', 0, _whos.length, (k) => _whos[k].emoji, (k) => _whos[k].en, _w),
                  _column('يفعل ماذا؟', 1, _verbs.length, (k) => _verbs[k].emoji, (k) => _verbs[k].en, _v),
                  _column('ماذا؟', 2, _whats.length, (k) => _whats[k].emoji, (k) => _whats[k].en, _o),
                ],
              ),
            ),
            const SizedBox(height: 10),
            FilledButton(onPressed: _newGoal, child: Text(g == null ? 'تحدّي: اصنع جملة أطلبها منك ⭐⭐' : 'تحدٍّ آخر')),
            const SizedBox(height: 6),
            Text('جمل صنعتها اليوم: ${_made.length} · ${_whos.length * _verbs.length * _whats.length} جملة ممكنة', textAlign: TextAlign.center, style: const TextStyle(color: kMuted, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
