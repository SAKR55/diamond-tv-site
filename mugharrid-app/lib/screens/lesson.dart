import 'package:flutter/material.dart';

import '../core/speech.dart';
import '../core/feed.dart';
import '../core/store.dart';
import '../data/content.dart';
import '../ui/common.dart';
import 'coach_screen.dart';

/// قائمة كل الدروس مرتبة حسب المستوى.
class LessonsListScreen extends StatelessWidget {
  const LessonsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) {
        final done = AppStore.I.doneLessons;
        return Scaffold(
          appBar: AppBar(title: const Text('كل الدروس')),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              for (final level in const ['A1', 'A2', 'B1']) ...[
                Padding(
                  padding: const EdgeInsets.fromLTRB(2, 6, 2, 8),
                  child: Text('$level · ${levelNamesAr[level]}', style: const TextStyle(fontWeight: FontWeight.w800, color: kMuted)),
                ),
                for (final l in lessons.where((x) => x.level == level))
                  ActivityTile(
                    emoji: l.emoji,
                    title: l.titleAr,
                    subtitle: done.contains(l.id) ? '✓ مكتمل · أعده للمراجعة' : '${l.steps.length} خطوات',
                    badge: !done.contains(l.id) && ContentFeed.I.remoteLessonIds.contains(l.id) ? 'جديد' : null,
                    onTap: () => push(context, LessonScreen(lesson: l)),
                  ),
              ],
            ],
          ),
        );
      },
    );
  }
}

/// شاشة الدرس: خطوات قصيرة (اختيار أو ترتيب كلمات) ثم دعوة للتحدث مع المدرب.
class LessonScreen extends StatefulWidget {
  const LessonScreen({super.key, required this.lesson});
  final Lesson lesson;

  @override
  State<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonScreen> with TimedState<LessonScreen> {
  int _step = 0;
  int? _picked;
  List<String> _built = [];
  List<String> _bank = [];

  /// null لم يُتحقق بعد، true صحيح، false خطأ
  bool? _checked;
  int _wrong = 0;

  LessonStep get _s => widget.lesson.steps[_step];
  bool get _finished => _step >= widget.lesson.steps.length;

  @override
  void initState() {
    super.initState();
    _prepare();
  }

  void _prepare() {
    _picked = null;
    _checked = null;
    _built = [];
    _bank = [];
    if (_finished) return;
    if (_s.type == 'build') {
      _bank = List<String>.from(_s.words)..shuffle();
    }
    if (_s.en.isNotEmpty) Speech.I.say(_s.en);
  }

  void _pick(int i) {
    if (_picked != null) return;
    setState(() => _picked = i);
    if (i != _s.answer) {
      _wrong++;
      AppStore.I.addMistake(kind: _s.kind, prompt: _s.promptAr, wrong: _s.options[i], correct: _s.options[_s.answer], note: _s.why);
    }
  }

  void _check() {
    final ok = _built.join(' ') == _s.words.join(' ');
    setState(() => _checked = ok);
    if (ok) {
      Speech.I.say(_s.words.join(' '));
    } else {
      _wrong++;
      AppStore.I.addMistake(kind: _s.kind, prompt: _s.promptAr, wrong: _built.join(' '), correct: _s.words.join(' '), note: _s.why);
    }
  }

  void _next() {
    setState(() {
      _step++;
      _prepare();
    });
    if (_finished) AppStore.I.completeLesson(widget.lesson.id);
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.lesson.steps.length;
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.lesson.titleAr),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(10),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(9),
              child: LinearProgressIndicator(value: _finished ? 1.0 : _step / total, minHeight: 8, color: kCoral, backgroundColor: kLine),
            ),
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: _finished ? _end() : (_s.type == 'build' ? _buildStep() : _mcqStep()),
        ),
      ),
    );
  }

  Widget _mcqStep() {
    final s = _s;
    final answered = _picked != null;
    return ListView(
      children: [
        Text(s.promptAr, style: const TextStyle(fontSize: 15, color: kMuted, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        if (s.en.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.fromLTRB(8, 18, 16, 18),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: kLine)),
            child: Row(
              children: [
                SpeakButton(s.en),
                SpeakButton(s.en, slow: true),
                Expanded(
                  child: s.hideText && !answered
                      ? const Text('🎧 استمع جيداً ثم اختر', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: kMuted))
                      : En(s.en, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w700, color: kInk)),
                ),
              ],
            ),
          ),
        for (var i = 0; i < s.options.length; i++)
          OptionButton(
            text: s.options[i],
            english: s.enOptions,
            state: !answered ? 0 : (i == s.answer ? 1 : (i == _picked ? 2 : 0)),
            onTap: answered ? null : () => _pick(i),
          ),
        if (answered) ...[
          const SizedBox(height: 6),
          FeedbackBox(ok: _picked == s.answer, text: (_picked == s.answer ? 'صحيح! ' : 'ليست هذه. أضفناها إلى دفتر أخطائك. ') + s.why),
          FilledButton(onPressed: _next, child: const Text('التالي')),
        ],
      ],
    );
  }

  Widget _buildStep() {
    final s = _s;
    return ListView(
      children: [
        Text(s.promptAr, style: const TextStyle(fontSize: 15, color: kMuted, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          constraints: const BoxConstraints(minHeight: 66),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: kLine, width: 2)),
          child: Directionality(
            textDirection: TextDirection.ltr,
            child: Wrap(
              spacing: 7,
              runSpacing: 7,
              children: [
                for (var i = 0; i < _built.length; i++)
                  _WordChip(
                    word: _built[i],
                    onTap: _checked == true
                        ? null
                        : () => setState(() {
                              _bank.add(_built.removeAt(i));
                              _checked = null;
                            }),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Directionality(
          textDirection: TextDirection.ltr,
          child: Wrap(
            spacing: 7,
            runSpacing: 7,
            children: [
              for (var i = 0; i < _bank.length; i++)
                _WordChip(
                  word: _bank[i],
                  onTap: () => setState(() {
                    _built.add(_bank.removeAt(i));
                    _checked = null;
                  }),
                ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        if (_checked == null)
          FilledButton(onPressed: _bank.isEmpty ? _check : null, child: const Text('تحقق'))
        else if (_checked == true) ...[
          FeedbackBox(ok: true, text: 'ممتاز! ${s.why}'),
          FilledButton(onPressed: _next, child: const Text('التالي')),
        ] else ...[
          const FeedbackBox(ok: false, text: 'الترتيب غير صحيح. أضفنا الجملة إلى دفتر أخطائك، حاول مرة أخرى.'),
          OutlinedButton(
            onPressed: () => setState(() {
              _bank = List<String>.from(s.words)..shuffle();
              _built = [];
              _checked = null;
            }),
            child: const Text('حاول مرة أخرى'),
          ),
          const SizedBox(height: 8),
          TextButton(onPressed: _next, child: const Text('أرني الجواب وتابع')),
        ],
      ],
    );
  }

  Widget _end() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Spacer(),
        const Text('🎉', textAlign: TextAlign.center, style: TextStyle(fontSize: 64)),
        const SizedBox(height: 8),
        const Text('أنهيت الدرس', textAlign: TextAlign.center, style: TextStyle(fontSize: 23, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        Text(
          _wrong == 0
              ? 'بلا أي خطأ. الخطوة الأهم الآن: استخدم ما تعلمته في محادثة.'
              : 'أخطأت في $_wrong، وهي الآن في دفتر أخطائك لتراجعها. الخطوة الأهم الآن: استخدم ما تعلمته في محادثة.',
          textAlign: TextAlign.center,
          style: const TextStyle(color: kMuted, height: 1.8, fontSize: 15),
        ),
        const Spacer(),
        FilledButton(
          style: FilledButton.styleFrom(backgroundColor: kCoral),
          onPressed: () => Navigator.of(context).pushReplacement(MaterialPageRoute<void>(builder: (_) => const CoachScreen())),
          child: const Text('تحدث مع المدرب الآن'),
        ),
        const SizedBox(height: 10),
        OutlinedButton(onPressed: () => Navigator.of(context).pop(), child: const Text('العودة للرئيسية')),
      ],
    );
  }
}

class _WordChip extends StatelessWidget {
  const _WordChip({required this.word, required this.onTap});
  final String word;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: kLine, width: 1.5)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
          child: Text(word, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600, color: kInk)),
        ),
      ),
    );
  }
}
