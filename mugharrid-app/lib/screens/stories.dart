import 'package:flutter/material.dart';

import '../core/coach.dart';
import '../core/generators.dart';
import '../core/speech.dart';
import '../core/store.dart';
import '../ui/common.dart';

/// قصص بلا حدود: قصة جديدة في كل مرة بمستوى المتعلم، مع مفردات وأسئلة فهم.
class StoriesScreen extends StatefulWidget {
  const StoriesScreen({super.key, this.kids = false});
  final bool kids;

  @override
  State<StoriesScreen> createState() => _StoriesScreenState();
}

class _StoriesScreenState extends State<StoriesScreen> with TimedState<StoriesScreen> {
  Story? _story;
  bool _loading = true;
  bool _reading = false;
  bool _counted = false;
  List<int?> _answers = [];

  String get _level => AppStore.I.level.isEmpty ? 'A1' : AppStore.I.level;

  /// نحذف الرموز غير اللاتينية (مثل الإيموجي) قبل النطق.
  String _speakable(String s) => s.replaceAll(RegExp(r'[^\x00-\x7F]'), '').trim();

  @override
  void initState() {
    super.initState();
    if (RemoteAi.enabled) {
      _load();
    } else {
      _apply(StoryGenerator.make(_level, kids: widget.kids));
    }
  }

  void _apply(Story story) {
    _story = story;
    _answers = List<int?>.filled(story.quiz.length, null);
    _counted = false;
    _loading = false;
  }

  Future<void> _load() async {
    _reading = false;
    Speech.I.stopSpeaking();
    if (!_loading) setState(() => _loading = true);
    Story? s;
    if (RemoteAi.enabled) s = await RemoteAi.story(level: _level, kids: widget.kids);
    if (!mounted) return;
    final story = s ?? StoryGenerator.make(_level, kids: widget.kids);
    setState(() => _apply(story));
  }

  Future<void> _readAll() async {
    final story = _story;
    if (story == null) return;
    if (_reading) {
      setState(() => _reading = false);
      Speech.I.stopSpeaking();
      return;
    }
    setState(() => _reading = true);
    for (final line in story.lines) {
      if (!mounted || !_reading || _story != story) break;
      await Speech.I.say(_speakable(line), rate: widget.kids ? 0.36 : 0.45);
    }
    if (mounted && _story == story) setState(() => _reading = false);
  }

  void _answer(int q, int option) {
    final story = _story;
    if (story == null || _answers[q] != null) return;
    setState(() => _answers[q] = option);
    if (!_counted && !_answers.contains(null)) {
      _counted = true;
      AppStore.I.storyRead();
      if (widget.kids) {
        var right = 0;
        for (var i = 0; i < story.quiz.length; i++) {
          if (_answers[i] == story.quiz[i].answer) right++;
        }
        AppStore.I.addStars(right);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final story = _story;
    final big = widget.kids;
    return Scaffold(
      appBar: AppBar(title: Text(big ? 'قصة جديدة' : 'قصص بلا حدود')),
      body: SafeArea(
        child: _loading || story == null
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.all(18),
                children: [
                  En(story.title, style: TextStyle(fontSize: big ? 26 : 22, fontWeight: FontWeight.w800, color: kInk)),
                  const SizedBox(height: 4),
                  Text(
                    story.fromAi ? 'قصة من الذكاء الاصطناعي · المستوى $_level' : (big ? 'اضغط على أي جملة لتسمعها' : 'المستوى $_level · اضغط على أي جملة لتسمعها'),
                    style: const TextStyle(color: kMuted, fontSize: 13),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _readAll,
                    icon: Icon(_reading ? Icons.stop_rounded : Icons.play_arrow_rounded),
                    label: Text(_reading ? 'إيقاف القراءة' : 'استمع للقصة كاملة'),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: kLine)),
                    child: Column(
                      children: [
                        for (final line in story.lines)
                          InkWell(
                            borderRadius: BorderRadius.circular(12),
                            onTap: () => Speech.I.say(_speakable(line), rate: big ? 0.36 : 0.45),
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              child: En(line, style: TextStyle(fontSize: big ? 22 : 18, height: 1.5, color: kInk)),
                            ),
                          ),
                      ],
                    ),
                  ),
                  if (story.vocab.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Text(big ? 'كلمات القصة' : 'كلمات القصة · اضغط الكلمة لتسمعها وتحفظها في مفرداتي', style: const TextStyle(fontWeight: FontWeight.w800, color: kMuted)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final v in story.vocab)
                          ActionChip(
                            onPressed: () {
                              Speech.I.say(v.en);
                              if (!big && AppStore.I.saveWord(v.en, v.ar)) {
                                setState(() {});
                                toast(context, 'حُفظت «${v.en}» في مفرداتي');
                              }
                            },
                            avatar: big ? null : Icon(AppStore.I.hasWord(v.en) ? Icons.bookmark_rounded : Icons.bookmark_add_outlined, size: 18, color: kTeal),
                            label: Text('${v.ar} · ${v.en}', style: const TextStyle(fontSize: 13.5)),
                          ),
                      ],
                    ),
                  ],
                  for (var q = 0; q < story.quiz.length; q++) ...[
                    const SizedBox(height: 18),
                    En(story.quiz[q].question, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: kInk)),
                    const SizedBox(height: 8),
                    for (var o = 0; o < story.quiz[q].options.length; o++)
                      OptionButton(
                        text: story.quiz[q].options[o],
                        english: true,
                        state: _answers[q] == null ? 0 : (o == story.quiz[q].answer ? 1 : (o == _answers[q] ? 2 : 0)),
                        onTap: _answers[q] != null ? null : () => _answer(q, o),
                      ),
                  ],
                  const SizedBox(height: 16),
                  FilledButton(onPressed: _load, child: const Text('قصة جديدة')),
                  if (!story.fromAi) ...[
                    const SizedBox(height: 12),
                    const Text(
                      'القصص هنا تُركَّب على الجوال من قوالب وعناصر متغيرة، فتتنوع التفاصيل وتتشابه البنية. اربط خادم الذكاء الاصطناعي من الإعدادات لقصص مختلفة كلياً.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: kMuted, fontSize: 12, height: 1.6),
                    ),
                  ],
                ],
              ),
      ),
    );
  }
}
