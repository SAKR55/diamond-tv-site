import 'package:flutter/material.dart';

import '../core/account.dart';
import '../core/generators.dart';
import '../core/speech.dart';
import '../core/store.dart';
import '../data/library.dart';
import '../data/long_podcasts.dart';
import '../data/talks.dart';
import '../ui/common.dart';
import 'account.dart';
import 'reading.dart';

/// قسم الاستماع: بودكاست مغرّد (6 برامج) والكتب الصوتية (72 كتاباً).
/// الصوت من محرك النطق في الجوال، بصوتين مختلفين النبرة، مع سرعتين وأسئلة فهم ومفردات.

const kFreeEpisodes = 5;

class AudioLine {
  const AudioLine(this.text, this.pitch, {this.narration = false});
  final String text;
  final double pitch;

  /// سطر تقديم (المقدّم) وليس من صلب الموضوع.
  final bool narration;
}

class AudioEpisode {
  const AudioEpisode({required this.id, required this.title, required this.level, required this.lines, this.vocab = const [], this.quiz = const []});
  final String id;
  final String title;
  final String level;
  final List<AudioLine> lines;
  final List<Vocab> vocab;
  final List<Quiz> quiz;
}

AudioEpisode _fromText(ReadingText t, String intro) {
  return AudioEpisode(
    id: t.id,
    title: t.title,
    level: t.level,
    vocab: t.vocab,
    quiz: t.quiz,
    lines: [
      AudioLine(intro, 1.0, narration: true),
      AudioLine('${t.title}.', 1.0, narration: true),
      for (final l in t.lines) AudioLine(l, 0.85),
      if (t.vocab.isNotEmpty) const AudioLine('Now, the key words.', 1.0, narration: true),
      for (final v in t.vocab) AudioLine('${v.en}.', 1.0, narration: true),
      const AudioLine('Now answer the questions. Thank you for listening.', 1.0, narration: true),
    ],
  );
}

AudioEpisode _fromTalk(TalkVariant v) {
  final t = v.talk;
  String reply(TalkTurn turn) => turn.hints.isEmpty ? 'Okay.' : turn.hints.first;
  return AudioEpisode(
    id: 'dlg_${v.cat.id}_${v.scenario}_${v.row}',
    title: t.scenarioEn,
    level: v.level,
    quiz: [
      // سؤال فهم: ماذا قال الشخص الثاني رداً على أول جملة؟
      Quiz('What did the second speaker say first?', [reply(t.turns[0]), reply(t.turns[2]), reply(t.turns[4])], 0),
    ],
    lines: [
      const AudioLine('Welcome to Mugharrid Podcast. Listen to this conversation.', 1.0, narration: true),
      AudioLine('${t.scenarioEn}.', 1.0, narration: true),
      for (final turn in t.turns) ...[AudioLine(turn.coach, 0.85), AudioLine(reply(turn), 1.25)],
      const AudioLine('That is the end of the conversation. Now answer the question.', 1.0, narration: true),
    ],
  );
}

class AudioShow {
  const AudioShow(this.id, this.emoji, this.titleAr, this.aboutAr, this.count, this.build);
  final String id;
  final String emoji;
  final String titleAr;
  final String aboutAr;
  final int count;
  final AudioEpisode Function(int index) build;
}

List<TalkVariant>? _variantsCache;
List<TalkVariant> get _variants => _variantsCache ??= TalkBank.variants(all: true);

const _showNames = <String, String>{
  'stories': 'حكايات مغرّد',
  'science': 'عالم العلوم',
  'daily': 'يومياتنا',
  'work': 'في العمل',
  'travel': 'حول العالم',
};

List<AudioShow> podcastShows() {
  return [
    AudioShow('dialogues', '🗣️', 'حوارات حقيقية', 'محادثات بصوتين في مواقف الحياة والعمل', _variants.length, (i) => _fromTalk(_variants[i % _variants.length])),
    AudioShow('long', '🎙️', 'بودكاست طويل', 'حلقات من 4 إلى 5 دقائق بمواضيع مفيدة: تعلم، عمل، صحة، سفر', longPodcasts.length,
        (i) => _fromText(longPodcasts[i % longPodcasts.length], 'Welcome to Mugharrid Podcast. Long episode ${i % longPodcasts.length + 1}.')),
    for (final c in readingCats)
      AudioShow(
        c.id,
        c.emoji,
        _showNames[c.id] ?? c.titleAr,
        c.aboutAr,
        Library.perCat,
        (i) => _fromText(Library.get(c.id, (Library.extra[c.id]?.length ?? 0) + i % Library.perCat), 'Welcome to Mugharrid Podcast. Episode ${i % Library.perCat + 1}.'),
      ),
  ];
}

class PodcastHome extends StatelessWidget {
  const PodcastHome({super.key});

  @override
  Widget build(BuildContext context) {
    final shows = podcastShows();
    final total = shows.fold<int>(0, (a, s) => a + s.count);
    return ListenableBuilder(
      listenable: Listenable.merge([AppStore.I, Account.I]),
      builder: (context, _) {
        final s = AppStore.I;
        return Scaffold(
          appBar: AppBar(title: const Text('بودكاست مغرّد')),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              Text('$total حلقة في ${shows.length} برامج · سمعت ${s.count('pods')}', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              const Text('حلقات اليوم', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: kCoral)),
              const SizedBox(height: 8),
              for (final show in shows)
                Builder(builder: (context) {
                  // حلقة اليوم تتغير يومياً، وتختلف عن «نص اليوم» في قسم القراءة.
                  final i = show.id == 'dialogues' ? (todayNumber() * 11) % show.count : (dailyReadingIndex(show.id) + 50) % show.count;
                  final ep = show.build(i);
                  return ActivityTile(
                    emoji: s.isHeard(ep.id) ? '✅' : '🎧',
                    title: show.titleAr,
                    subtitle: 'الحلقة ${i + 1} · ${ep.title} · ${ep.level}',
                    onTap: () => push(context, AudioPlayerScreen(show: show, index: i, free: true)),
                  );
                }),
              const SizedBox(height: 10),
              const Text('كل البرامج', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: kMuted)),
              const SizedBox(height: 8),
              for (final show in shows)
                ActivityTile(
                  emoji: show.emoji,
                  title: show.titleAr,
                  subtitle: '${show.aboutAr} · ${show.count} حلقة',
                  onTap: () => push(context, AudioShowScreen(show: show)),
                ),
              const SizedBox(height: 6),
              const Text(
                'الحلقات تُقرأ بصوت الجوال. اختر الصوت الأفضل من الإعدادات ← صوت القراءة. أبقِ الشاشة مفتوحة أثناء الاستماع.',
                style: TextStyle(color: kMuted, fontSize: 12.5, height: 1.7),
              ),
            ],
          ),
        );
      },
    );
  }
}

class AudioShowScreen extends StatefulWidget {
  const AudioShowScreen({super.key, required this.show});
  final AudioShow show;

  @override
  State<AudioShowScreen> createState() => _AudioShowScreenState();
}

class _AudioShowScreenState extends State<AudioShowScreen> {
  String _level = '';

  @override
  Widget build(BuildContext context) {
    final show = widget.show;
    return ListenableBuilder(
      listenable: Listenable.merge([AppStore.I, Account.I]),
      builder: (context, _) {
        final items = <int>[];
        final eps = <int, AudioEpisode>{};
        for (var i = 0; i < show.count; i++) {
          final e = show.build(i);
          if (_level.isEmpty || e.level == _level) {
            items.add(i);
            eps[i] = e;
          }
        }
        return Scaffold(
          appBar: AppBar(title: Text(show.titleAr)),
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
                    Text('${items.length} حلقة', style: const TextStyle(color: kMuted, fontSize: 13)),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(18, 4, 18, 18),
                  itemCount: items.length,
                  itemBuilder: (context, k) {
                    final i = items[k];
                    final e = eps[i]!;
                    final heard = AppStore.I.isHeard(e.id);
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: Material(
                        color: kCard,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: kLine)),
                        clipBehavior: Clip.antiAlias,
                        child: InkWell(
                          onTap: () => push(context, AudioPlayerScreen(show: show, index: i)),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            child: Row(
                              children: [
                                Icon(heard ? Icons.check_circle_rounded : Icons.play_circle_fill_rounded, color: heard ? kOk : kTeal, size: 26),
                                const SizedBox(width: 10),
                                Text('${i + 1}', style: const TextStyle(fontWeight: FontWeight.w800, color: kMuted)),
                                const SizedBox(width: 10),
                                Expanded(child: En(e.title, align: TextAlign.right, style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w700, color: kInk))),
                                const SizedBox(width: 8),
                                Text(e.level, textDirection: TextDirection.ltr, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: kTeal)),
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

// =====================================================================
// الكتب الصوتية
// =====================================================================

class AudioBooksScreen extends StatefulWidget {
  const AudioBooksScreen({super.key});

  @override
  State<AudioBooksScreen> createState() => _AudioBooksScreenState();
}

class _AudioBooksScreenState extends State<AudioBooksScreen> {
  late String _level;
  late final List<BookInfo> _books;

  @override
  void initState() {
    super.initState();
    _level = AppStore.I.level.isEmpty ? 'A1' : AppStore.I.level;
    _books = allBooks();
  }

  AudioShow _showFor(BookInfo b) {
    return AudioShow(b.id, '📚', b.titleAr, '', b.count, (i) => _fromText(b.chapter(i), 'Chapter ${i % b.count + 1}.'));
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) {
        final list = _books.where((b) => b.level == _level).toList();
        return Scaffold(
          appBar: AppBar(title: const Text('المكتبة الصوتية')),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              Text('${_books.length} كتاباً صوتياً بفصول قصيرة', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              Row(
                children: [
                  for (final l in const ['A1', 'A2', 'B1'])
                    Padding(
                      padding: const EdgeInsetsDirectional.only(end: 8),
                      child: ChoiceChip(
                        label: Text(l == 'A1' ? 'مبتدئ A1' : (l == 'A2' ? 'أساسي A2' : 'متوسط B1')),
                        selected: _level == l,
                        onSelected: (_) => setState(() => _level = l),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              for (final b in list)
                Builder(builder: (context) {
                  var heard = 0;
                  for (var c = 0; c < b.count; c++) {
                    if (AppStore.I.isHeard(b.chapter(c).id)) heard++;
                  }
                  final cat = readingCats.firstWhere((c) => c.id == b.cat);
                  return ActivityTile(
                    emoji: heard == b.count ? '✅' : cat.emoji,
                    title: b.titleAr,
                    subtitle: '${cat.titleAr} · سمعت $heard من ${b.count} فصول',
                    onTap: () => push(context, AudioPlayerScreen(show: _showFor(b), index: heard % b.count, free: true, unit: 'الفصل')),
                  );
                }),
            ],
          ),
        );
      },
    );
  }
}

// =====================================================================
// المشغّل
// =====================================================================

class AudioPlayerScreen extends StatefulWidget {
  const AudioPlayerScreen({super.key, required this.show, required this.index, this.free = false, this.unit = 'الحلقة'});
  final AudioShow show;
  final int index;

  /// true = لا يُقفل «التالي» (حلقات اليوم والكتب).
  final bool free;
  final String unit;

  @override
  State<AudioPlayerScreen> createState() => _AudioPlayerScreenState();
}

class _AudioPlayerScreenState extends State<AudioPlayerScreen> with TimedState<AudioPlayerScreen> {
  late int _index;
  late AudioEpisode _e;
  int _pos = 0;
  int _session = 0;
  bool _playing = false;
  bool _finished = false;
  bool _showText = false;
  bool _slow = false;
  List<int?> _answers = [];

  @override
  void initState() {
    super.initState();
    _load(widget.index);
    WidgetsBinding.instance.addPostFrameCallback((_) => _play());
  }

  void _load(int i) {
    _index = i % widget.show.count;
    _e = widget.show.build(_index);
    _pos = 0;
    _finished = false;
    _showText = false;
    _answers = List<int?>.filled(_e.quiz.length, null);
  }

  Future<void> _play() async {
    if (_playing) return;
    final session = ++_session;
    setState(() {
      _playing = true;
      if (_pos >= _e.lines.length) _pos = 0;
    });
    while (mounted && session == _session && _pos < _e.lines.length) {
      final l = _e.lines[_pos];
      await Speech.I.say(l.text, rate: _slow ? 0.33 : 0.47, pitch: l.pitch);
      if (!mounted || session != _session) return;
      await Future<void>.delayed(Duration(milliseconds: _slow ? 600 : 300));
      if (!mounted || session != _session) return;
      setState(() => _pos++);
    }
    if (!mounted || session != _session) return;
    setState(() {
      _playing = false;
      _finished = true;
    });
    AppStore.I.markHeard(_e.id);
  }

  void _stop() {
    _session++;
    Speech.I.stopSpeaking();
  }

  void _pause() {
    _stop();
    setState(() => _playing = false);
  }

  void _seek(int delta) {
    final was = _playing;
    _stop();
    setState(() {
      _playing = false;
      _pos = (_pos + delta).clamp(0, _e.lines.length - 1).toInt();
    });
    if (was) _play();
  }

  void _next() {
    if (!widget.free && _index + 1 >= kFreeEpisodes && !requirePremium(context)) return;
    _stop();
    setState(() {
      _playing = false;
      _load(_index + 1);
    });
    _play();
  }

  @override
  Widget build(BuildContext context) {
    final e = _e;
    final progress = e.lines.isEmpty ? 0.0 : (_pos / e.lines.length).clamp(0.0, 1.0).toDouble();
    final canAnswer = _finished || AppStore.I.isHeard(e.id);
    return Scaffold(
      appBar: AppBar(title: Text('${widget.show.titleAr} · ${widget.unit} ${_index + 1}')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF6A56E8), Color(0xFF3A2BA8)], begin: Alignment.topRight, end: Alignment.bottomLeft),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  Text(widget.show.emoji, style: const TextStyle(fontSize: 44)),
                  const SizedBox(height: 6),
                  En(e.title, align: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 21, fontWeight: FontWeight.w900)),
                  Text(e.level, textDirection: TextDirection.ltr, style: const TextStyle(color: kGold, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 14),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(value: _finished ? 1.0 : progress, minHeight: 7, color: kGold, backgroundColor: Colors.white24),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    textDirection: TextDirection.ltr,
                    children: [
                      IconButton(tooltip: 'الجملة السابقة', onPressed: () => _seek(-1), icon: const Icon(Icons.replay_rounded, color: Colors.white, size: 30)),
                      const SizedBox(width: 10),
                      Material(
                        color: Colors.white,
                        shape: const CircleBorder(),
                        clipBehavior: Clip.antiAlias,
                        child: InkWell(
                          onTap: _playing ? _pause : _play,
                          child: SizedBox(width: 68, height: 68, child: Icon(_playing ? Icons.pause_rounded : Icons.play_arrow_rounded, color: kTeal, size: 42)),
                        ),
                      ),
                      const SizedBox(width: 10),
                      IconButton(tooltip: 'الجملة التالية', onPressed: () => _seek(1), icon: const Icon(Icons.skip_next_rounded, color: Colors.white, size: 32)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Text('الاستماع:', style: TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
                const SizedBox(width: 8),
                ChoiceChip(label: const Text('عادي'), selected: !_slow, onSelected: (_) => setState(() => _slow = false)),
                const SizedBox(width: 8),
                ChoiceChip(label: const Text('بطيء'), selected: _slow, onSelected: (_) => setState(() => _slow = true)),
              ],
            ),
            const SizedBox(height: 6),
            OutlinedButton.icon(
              onPressed: () => setState(() => _showText = !_showText),
              icon: Icon(_showText ? Icons.visibility_off_rounded : Icons.visibility_rounded),
              label: Text(_showText ? 'أخفِ النص' : 'أظهر النص (حاول الاستماع أولاً)'),
            ),
            if (_showText) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: kLine)),
                child: Column(
                  children: [
                    for (var k = 0; k < e.lines.length; k++)
                      InkWell(
                        borderRadius: BorderRadius.circular(10),
                        onTap: () => _seek(k - _pos),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(color: k == _pos && _playing ? kTint : null, borderRadius: BorderRadius.circular(10)),
                          child: En(
                            e.lines[k].text,
                            style: TextStyle(fontSize: 16.5, height: 1.5, color: e.lines[k].narration ? kMuted : (e.lines[k].pitch > 1.1 ? kTeal : kInk), fontWeight: e.lines[k].narration ? FontWeight.w500 : FontWeight.w600),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
            if (canAnswer)
              for (var q = 0; q < e.quiz.length; q++) ...[
                const SizedBox(height: 16),
                Text('سؤال الفهم ${q + 1}', style: const TextStyle(fontWeight: FontWeight.w800, color: kCoral, fontSize: 13)),
                En(e.quiz[q].question, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: kInk)),
                const SizedBox(height: 8),
                for (var o = 0; o < e.quiz[q].options.length; o++)
                  OptionButton(
                    text: e.quiz[q].options[o],
                    english: true,
                    state: _answers[q] == null ? 0 : (o == e.quiz[q].answer ? 1 : (o == _answers[q] ? 2 : 0)),
                    onTap: _answers[q] != null ? null : () => setState(() => _answers[q] = o),
                  ),
                if (_answers[q] != null && _answers[q] != e.quiz[q].answer) const FeedbackBox(ok: false, text: 'أعد الاستماع وركّز على هذا الجزء.'),
              ],
            if (e.vocab.isNotEmpty && canAnswer) ...[
              const SizedBox(height: 12),
              const Text('مفردات الحلقة · اضغط لتسمع وتحفظ', style: TextStyle(fontWeight: FontWeight.w800, color: kMuted, fontSize: 13)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final v in e.vocab)
                    ActionChip(
                      avatar: Icon(AppStore.I.hasWord(v.en) ? Icons.bookmark_rounded : Icons.bookmark_add_outlined, size: 18, color: kTeal),
                      label: Text('${v.ar} · ${v.en}', style: const TextStyle(fontSize: 13.5)),
                      onPressed: () {
                        if (!_playing) Speech.I.say(v.en);
                        if (AppStore.I.saveWord(v.en, v.ar)) {
                          setState(() {});
                          toast(context, 'حُفظت في مفرداتي');
                        }
                      },
                    ),
                ],
              ),
            ],
            const SizedBox(height: 14),
            FilledButton(onPressed: _next, child: Text('${widget.unit} التالي${widget.unit == 'الحلقة' ? 'ة' : ''}')),
          ],
        ),
      ),
    );
  }
}
