import 'package:flutter/material.dart';

import '../core/account.dart';
import '../core/speech.dart';
import '../core/store.dart';
import '../data/library.dart';
import '../data/talks.dart';
import '../ui/common.dart';
import 'account.dart';
import 'coach_screen.dart';

/// رقم «نص اليوم» في القسم: يتغير كل يوم ولا يتكرر قبل انتهاء نصوص القسم.
int dailyReadingIndex(String cat) {
  final n = Library.count(cat);
  final extra = Library.extra[cat]?.length ?? 0;
  // النصوص المضافة حديثاً من الإدارة تظهر أولاً، ثم تدور بقية النصوص يومياً.
  if (extra > 0 && todayNumber() % 2 == 0) return (todayNumber() ~/ 2) % extra;
  return extra + (todayNumber() * 7) % (n - extra);
}

// =====================================================================
// قسم القراءة
// =====================================================================

class ReadingHome extends StatelessWidget {
  const ReadingHome({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) {
        final s = AppStore.I;
        return Scaffold(
          appBar: AppBar(title: const Text('قسم القراءة')),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              Text('${Library.total} نصاً في ${readingCats.length} أقسام · قرأت ${s.count('reads')}', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              const Text('نصوص اليوم', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: kCoral)),
              const SizedBox(height: 8),
              SizedBox(
                height: 118,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    for (final c in readingCats)
                      Builder(builder: (context) {
                        final i = dailyReadingIndex(c.id);
                        final t = Library.get(c.id, i);
                        return Padding(
                          padding: const EdgeInsetsDirectional.only(end: 10),
                          child: SizedBox(
                            width: 190,
                            child: Material(
                              color: s.isRead(t.id) ? kOkBg : kTint,
                              borderRadius: BorderRadius.circular(18),
                              clipBehavior: Clip.antiAlias,
                              child: InkWell(
                                onTap: () => push(context, ReadingScreen(cat: c.id, index: i)),
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('${c.emoji} ${c.titleAr}${s.isRead(t.id) ? ' ✓' : ''}', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: kTeal)),
                                      const Spacer(),
                                      En(t.title, style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w800, color: kInk)),
                                      Text(t.level, textDirection: TextDirection.ltr, style: const TextStyle(fontSize: 12, color: kMuted)),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text('الأقسام', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: kMuted)),
              const SizedBox(height: 8),
              for (final c in readingCats)
                ActivityTile(
                  emoji: c.emoji,
                  title: c.titleAr,
                  subtitle: '${c.aboutAr} · قرأت ${s.readInCat(c.id)} من ${Library.count(c.id)}',
                  badge: Account.I.hasAccess ? null : '🔒',
                  onTap: () {
                    if (requirePremium(context)) push(context, ReadingListScreen(cat: c));
                  },
                ),
              const SizedBox(height: 6),
              const Text(
                'النصوص مرتبة بثلاثة مستويات (A1، A2، B1). في كل نص: استماع لكل جملة، كلمات تُحفظ في مفرداتي، وأسئلة فهم.',
                style: TextStyle(color: kMuted, fontSize: 12.5, height: 1.7),
              ),
            ],
          ),
        );
      },
    );
  }
}

class ReadingListScreen extends StatefulWidget {
  const ReadingListScreen({super.key, required this.cat});
  final ReadingCat cat;

  @override
  State<ReadingListScreen> createState() => _ReadingListScreenState();
}

class _ReadingListScreenState extends State<ReadingListScreen> {
  String _level = '';

  @override
  void initState() {
    super.initState();
    _level = AppStore.I.level;
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) {
        final n = Library.count(widget.cat.id);
        final items = <int>[];
        final texts = <int, ReadingText>{};
        for (var i = 0; i < n; i++) {
          final t = Library.get(widget.cat.id, i);
          if (_level.isEmpty || t.level == _level) {
            items.add(i);
            texts[i] = t;
          }
        }
        return Scaffold(
          appBar: AppBar(title: Text('${widget.cat.emoji} ${widget.cat.titleAr}')),
          body: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 0, 14, 8),
                child: Row(
                  children: [
                    for (final l in const ['', 'A1', 'A2', 'B1'])
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: ChoiceChip(label: Text(l.isEmpty ? 'الكل' : l), selected: _level == l, onSelected: (_) => setState(() => _level = l)),
                      ),
                    const Spacer(),
                    Text('${items.length} نصاً', style: const TextStyle(color: kMuted, fontSize: 13)),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(18, 4, 18, 18),
                  itemCount: items.length,
                  itemBuilder: (context, k) {
                    final i = items[k];
                    final t = texts[i]!;
                    final read = AppStore.I.isRead(t.id);
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: Material(
                        color: kCard,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: kLine)),
                        clipBehavior: Clip.antiAlias,
                        child: InkWell(
                          onTap: () => push(context, ReadingScreen(cat: widget.cat.id, index: i)),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            child: Row(
                              children: [
                                Icon(read ? Icons.check_circle_rounded : Icons.menu_book_rounded, color: read ? kOk : kTeal, size: 22),
                                const SizedBox(width: 10),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(color: kTint, borderRadius: BorderRadius.circular(7)),
                                  child: Text(t.level, textDirection: TextDirection.ltr, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: kTeal)),
                                ),
                                const SizedBox(width: 10),
                                Expanded(child: En(t.title, align: TextAlign.right, style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w700, color: kInk))),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class ReadingScreen extends StatefulWidget {
  const ReadingScreen({super.key, required this.cat, required this.index});
  final String cat;
  final int index;

  @override
  State<ReadingScreen> createState() => _ReadingScreenState();
}

class _ReadingScreenState extends State<ReadingScreen> with TimedState<ReadingScreen> {
  late int _index;
  late ReadingText _t;
  List<int?> _answers = [];
  bool _reading = false;

  @override
  void initState() {
    super.initState();
    _open(widget.index);
  }

  void _open(int i) {
    _index = i % Library.count(widget.cat);
    _t = Library.get(widget.cat, _index);
    _answers = List<int?>.filled(_t.quiz.length, null);
    _reading = false;
  }

  Future<void> _readAll() async {
    final t = _t;
    if (_reading) {
      setState(() => _reading = false);
      Speech.I.stopSpeaking();
      return;
    }
    setState(() => _reading = true);
    for (final line in t.lines) {
      if (!mounted || !_reading || _t != t) break;
      await Speech.I.say(line);
    }
    if (mounted && _t == t) setState(() => _reading = false);
  }

  void _answer(int q, int o) {
    if (_answers[q] != null) return;
    setState(() => _answers[q] = o);
    if (o != _t.quiz[q].answer) {
      AppStore.I.addMistake(
        kind: 'vocab',
        prompt: 'سؤال فهم من نص «${_t.title}»: ${_t.quiz[q].question}',
        wrong: _t.quiz[q].options[o],
        correct: _t.quiz[q].options[_t.quiz[q].answer],
        note: 'أعد قراءة النص وابحث عن الجواب.',
      );
    }
    if (!_answers.contains(null)) AppStore.I.markRead(_t.id);
  }

  @override
  Widget build(BuildContext context) {
    final t = _t;
    final done = AppStore.I.isRead(t.id);
    return Scaffold(
      appBar: AppBar(title: Text('نص ${_index + 1} · ${t.level}')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            En(t.title, style: const TextStyle(fontSize: 23, fontWeight: FontWeight.w900, color: kInk)),
            const SizedBox(height: 4),
            const Text('اضغط أي جملة لتسمعها', style: TextStyle(color: kMuted, fontSize: 13)),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: _readAll,
              icon: Icon(_reading ? Icons.stop_rounded : Icons.play_arrow_rounded),
              label: Text(_reading ? 'إيقاف' : 'استمع للنص كاملاً'),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: kLine)),
              child: Column(
                children: [
                  for (final line in t.lines)
                    InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () => Speech.I.say(line),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        child: En(line, style: const TextStyle(fontSize: 18.5, height: 1.55, color: kInk)),
                      ),
                    ),
                ],
              ),
            ),
            if (t.vocab.isNotEmpty) ...[
              const SizedBox(height: 14),
              const Text('كلمات النص · اضغط لتسمع وتحفظ في مفرداتي', style: TextStyle(fontWeight: FontWeight.w800, color: kMuted, fontSize: 13)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final v in t.vocab)
                    ActionChip(
                      avatar: Icon(AppStore.I.hasWord(v.en) ? Icons.bookmark_rounded : Icons.bookmark_add_outlined, size: 18, color: kTeal),
                      label: Text('${v.ar} · ${v.en}', style: const TextStyle(fontSize: 13.5)),
                      onPressed: () {
                        Speech.I.say(v.en);
                        if (AppStore.I.saveWord(v.en, v.ar)) {
                          setState(() {});
                          toast(context, 'حُفظت «${v.en}» في مفرداتي');
                        }
                      },
                    ),
                ],
              ),
            ],
            for (var q = 0; q < t.quiz.length; q++) ...[
              const SizedBox(height: 18),
              En(t.quiz[q].question, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: kInk)),
              const SizedBox(height: 8),
              for (var o = 0; o < t.quiz[q].options.length; o++)
                OptionButton(
                  text: t.quiz[q].options[o],
                  english: true,
                  state: _answers[q] == null ? 0 : (o == t.quiz[q].answer ? 1 : (o == _answers[q] ? 2 : 0)),
                  onTap: _answers[q] != null ? null : () => _answer(q, o),
                ),
            ],
            const SizedBox(height: 12),
            if (done) const FeedbackBox(ok: true, text: 'أكملت هذا النص ✓'),
            if (!done && t.quiz.isEmpty)
              OutlinedButton(
                onPressed: () {
                  AppStore.I.markRead(t.id);
                  setState(() {});
                },
                child: const Text('قرأته'),
              ),
            const SizedBox(height: 8),
            FilledButton(
              onPressed: () {
                if (requirePremium(context)) setState(() => _open(_index + 1));
              },
              child: Text(Account.I.hasAccess ? 'النص التالي' : '🔒 النص التالي (للمشتركين)'),
            ),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// اختيار موضوع المحادثة
// =====================================================================

class TalkTopicsScreen extends StatelessWidget {
  const TalkTopicsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final today = TalkBank.daily(todayNumber());
    return Scaffold(
      appBar: AppBar(title: const Text('المحادثات')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text('${TalkBank.total} محادثة في ${talkCats.length} أقسام · أنهيت ${AppStore.I.talksDone}', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          Material(
            borderRadius: BorderRadius.circular(22),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: () => push(context, const CoachScreen(daily: true)),
              child: Ink(
                decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xFF6A56E8), Color(0xFF3A2BA8)], begin: Alignment.topRight, end: Alignment.bottomLeft)),
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('محادثة اليوم', style: TextStyle(color: kGold, fontWeight: FontWeight.w800, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text(today.titleAr, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                    Text(today.roleAr, style: const TextStyle(color: Colors.white70, fontSize: 13.5, height: 1.6)),
                    const SizedBox(height: 8),
                    const Text('ابدأ ←', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text('اختر موضوعاً', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: kMuted)),
          const SizedBox(height: 8),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.45,
            children: [
              for (final c in talkCats)
                Material(
                  color: kCard,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: const BorderSide(color: kLine)),
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap: () {
                      if (requirePremium(context)) push(context, CoachScreen(category: c.id));
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(c.emoji, style: const TextStyle(fontSize: 28)),
                          const Spacer(),
                          Text(c.titleAr, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: kInk)),
                          Text('${Account.I.hasAccess ? '' : '🔒 '}${TalkBank.count(c.id)} محادثة', style: const TextStyle(fontSize: 12.5, color: kMuted)),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          ActivityTile(emoji: '🎲', title: 'فاجئني', subtitle: 'موقف عشوائي من أي قسم', onTap: () => push(context, const CoachScreen())),
          const Text(
            'في كل محادثة مهمة من هدفين تتحقق تلقائياً من كلامك. اضغط المصباح أعلى المحادثة لإخفاء التلميحات (وضع التحدي).',
            style: TextStyle(color: kMuted, fontSize: 12.5, height: 1.7),
          ),
        ],
      ),
    );
  }
}
