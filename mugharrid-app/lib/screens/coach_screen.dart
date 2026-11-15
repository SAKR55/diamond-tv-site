import 'package:flutter/material.dart';

import '../core/coach.dart';
import '../core/generators.dart';
import '../core/speech.dart';
import '../core/store.dart';
import '../data/talks.dart';
import '../ui/common.dart';

class _Msg {
  _Msg(this.coach, this.text);
  final bool coach;
  final String text;
  String? fix;
  String note = '';
  bool ok = false;
}

/// المدرب: محادثة تمثيل أدوار. كل مرة موقف جديد من المولّد.
/// بلا خادم: المدرب يتبع حواراً مكتوباً ويفحص أخطاء شائعة محلياً.
/// مع خادم الذكاء الاصطناعي (من الإعدادات): محادثة حرة وتصحيح أدق.
class CoachScreen extends StatefulWidget {
  const CoachScreen({super.key, this.category, this.daily = false});

  /// قسم المحادثات (من بنك المحادثات). null = موقف عشوائي من المولّد العام.
  final String? category;

  /// محادثة اليوم: موقف ثابت لهذا اليوم.
  final bool daily;

  @override
  State<CoachScreen> createState() => _CoachScreenState();
}

class _CoachScreenState extends State<CoachScreen> with TimedState<CoachScreen> {
  late Talk _talk;
  int _turn = 0;
  final List<_Msg> _msgs = [];
  final TextEditingController _input = TextEditingController();
  final ScrollController _scroll = ScrollController();
  bool _busy = false;
  bool _listening = false;
  bool _voiceActive = false; // التسجيل الحالي بالصوت: يُرسل تلقائياً عند انتهائه
  bool _handsFree = false; // محادثة صوتية متواصلة: يفتح الميكروفون بعد كل رد من المدرب
  bool _done = false;
  bool _aiUsed = false;
  int _spoken = 0;
  bool _showHints = true;
  bool _dailyUsed = false;
  final Set<int> _goalsDone = {};
  final Set<int> _nudged = {};

  @override
  void initState() {
    super.initState();
    Speech.I.onStatus = (status) {
      if (!mounted) return;
      if ((status == 'done' || status == 'notListening') && _listening) {
        setState(() => _listening = false);
        _finishVoice();
      }
    };
    _startTalk();
  }

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _startTalk() {
    final previous = _msgs.isEmpty ? '' : _talk.titleAr;
    if (widget.daily && !_dailyUsed) {
      _talk = TalkBank.daily(todayNumber());
      _dailyUsed = true;
    } else if (widget.category != null) {
      _talk = TalkBank.make(widget.category!, avoidTitle: previous);
    } else if (widget.daily) {
      _talk = TalkBank.make(TalkBank.dailyCat(todayNumber()), avoidTitle: previous);
    } else {
      _talk = TalkGenerator.make();
    }
    _goalsDone.clear();
    _nudged.clear();
    _turn = 0;
    _done = false;
    _aiUsed = false;
    _spoken = 0;
    _msgs
      ..clear()
      ..add(_Msg(true, _talk.turns[0].coach));
    final first = _talk.turns[0].coach;
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await Speech.I.say(first);
      _autoListen();
    });
  }

  /// في الوضع المتواصل: بعد أن يتكلم المدرب يبدأ الميكروفون وحده.
  void _autoListen() {
    if (!mounted || !_handsFree || _done || _busy || _listening) return;
    _mic();
  }

  /// يرسل ما قاله الطالب بصوته مباشرة عند انتهاء التسجيل، إلا إن بدأ يكتب بيده فيبقى الإرسال يدوياً.
  void _finishVoice() {
    if (!_voiceActive) return;
    _voiceActive = false;
    if (_input.text.trim().isEmpty) {
      toast(context, 'لم أسمع شيئاً. اضغط الميكروفون وتكلم بالإنجليزية.');
      return;
    }
    _send();
  }

  void _scrollDown() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  Future<void> _mic() async {
    if (_listening) {
      await Speech.I.stopListening();
      return;
    }
    _input.clear();
    setState(() {
      _listening = true;
      _voiceActive = true;
    });
    final ok = await Speech.I.listen(
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 2),
      onText: (text, isFinal) {
        if (!mounted || !_voiceActive) return; // وصل بعد الإرسال أو بعد أن كتب الطالب بيده
        _input.value = TextEditingValue(text: text, selection: TextSelection.collapsed(offset: text.length));
        if (isFinal) {
          setState(() => _listening = false);
          _finishVoice();
        }
      },
    );
    if (!mounted) return;
    if (!ok) {
      setState(() {
        _listening = false;
        _voiceActive = false;
      });
      toast(context, 'تعذر تشغيل الميكروفون. اكتب ردك أو امنح إذن الميكروفون.');
    }
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty || _busy || _done) return;
    _voiceActive = false;
    if (_listening) await Speech.I.stopListening();
    if (!mounted) return;
    final me = _Msg(false, text);
    setState(() {
      _msgs.add(me);
      _input.clear();
      _busy = true;
      _listening = false;
      _spoken++;
    });
    _scrollDown();

    final lower = text.toLowerCase();
    for (var g = 0; g < _talk.goals.length; g++) {
      if (_talk.goals[g].keys.any((k) => lower.contains(k))) _goalsDone.add(g);
    }
    final local = checkCommonErrors(text);
    String? reply;
    String? corrected;
    var note = '';

    if (RemoteAi.enabled) {
      final history = _msgs.map((m) => {'role': m.coach ? 'coach' : 'learner', 'text': m.text}).toList();
      final res = await RemoteAi.chat(level: AppStore.I.level, scenario: _talk.scenarioEn, history: history);
      if (res != null) {
        reply = (res['reply'] as String).trim();
        final c = (res['corrected'] ?? '').toString().trim();
        if (c.isNotEmpty && c.toLowerCase() != text.toLowerCase()) {
          corrected = c;
          note = (res['note_ar'] ?? '').toString();
        }
        _aiUsed = true;
      }
    }
    if (!mounted) return;

    if (corrected == null && local != null) {
      corrected = local.corrected;
      note = local.noteAr;
    }
    var finished = false;
    final String line;
    if (reply != null) {
      line = reply;
    } else {
      // الوضع المحلي الذكي: إن كان الرد كلمة واحدة نطلب جملة كاملة مرة واحدة، ثم نعلّق على الرد وننتقل.
      final words = text.split(RegExp(r'\s+')).where((w) => w.isNotEmpty).length;
      final hints = _turn < _talk.turns.length ? _talk.turns[_turn].hints : const <String>[];
      if (words < 2 && hints.isNotEmpty && _nudged.add(_turn)) {
        line = 'Can you say that in a full sentence? For example: ${hints.first}';
      } else if (++_turn < _talk.turns.length) {
        final String ack;
        if (lower.contains('thank')) {
          ack = 'You are welcome. ';
        } else if (lower.contains('sorry')) {
          ack = 'No problem. ';
        } else if (corrected != null) {
          ack = 'I understand. ';
        } else {
          ack = const ['I see. ', 'Okay. ', 'Great. ', 'All right. ', 'Got it. '][(_turn + words) % 5];
        }
        line = ack + _talk.turns[_turn].coach;
      } else {
        line = 'It was great talking to you. Well done!';
        finished = true;
      }
    }
    if (corrected != null) {
      me.fix = corrected;
      me.note = note;
      AppStore.I.addMistake(kind: 'grammar', prompt: 'جملة قلتها في محادثة «${_talk.titleAr}»', wrong: text, correct: corrected, note: note);
    } else {
      me.ok = true;
    }
    setState(() {
      _msgs.add(_Msg(true, line));
      _busy = false;
      if (finished) _done = true;
    });
    if (finished) {
      AppStore.I.talkDone();
      if (_talk.goals.isNotEmpty && _goalsDone.length == _talk.goals.length) AppStore.I.addStars(1);
    }
    _scrollDown();
    await Speech.I.say(line);
    if (!finished) _autoListen();
  }

  void _end() {
    if (_busy || _done) return;
    setState(() => _done = true);
    if (_spoken > 0) AppStore.I.talkDone();
    _scrollDown();
  }

  @override
  Widget build(BuildContext context) {
    final hints = (_showHints && !_done && !_aiUsed && !_listening && _turn < _talk.turns.length) ? _talk.turns[_turn].hints : const <String>[];
    return Scaffold(
      appBar: AppBar(
        title: Text(_talk.titleAr),
        actions: [
          IconButton(
            tooltip: _handsFree ? 'إيقاف المحادثة الصوتية المتواصلة' : 'محادثة صوتية متواصلة: يسمعك بعد كل رد',
            onPressed: () {
              setState(() => _handsFree = !_handsFree);
              if (_handsFree) {
                toast(context, 'المحادثة الصوتية المتواصلة تعمل: تكلم بعد كل رد من المدرب.');
                _autoListen();
              } else {
                Speech.I.stopListening();
              }
            },
            icon: Icon(_handsFree ? Icons.record_voice_over_rounded : Icons.voice_over_off_rounded, color: _handsFree ? kTeal : kMuted),
          ),
          IconButton(
            tooltip: _showHints ? 'إخفاء التلميحات (وضع التحدي)' : 'إظهار التلميحات',
            onPressed: () => setState(() => _showHints = !_showHints),
            icon: Icon(_showHints ? Icons.lightbulb_rounded : Icons.lightbulb_outline_rounded, color: kGold),
          ),
          if (!_done) TextButton(onPressed: _end, child: const Text('إنهاء', style: TextStyle(color: kCoral, fontWeight: FontWeight.w800))),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(color: const Color(0xFFFFF6DC), borderRadius: BorderRadius.circular(12)),
              child: Text(
                RemoteAi.enabled ? '${_talk.roleAr} · محادثة حرة بالذكاء الاصطناعي' : _talk.roleAr,
                style: const TextStyle(fontSize: 13, color: Color(0xFF7A5A00), height: 1.5),
              ),
            ),
            if (_talk.goals.isNotEmpty)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(color: kTint, borderRadius: BorderRadius.circular(12)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('مهمتك في هذه المحادثة · ${_goalsDone.length} من ${_talk.goals.length}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: kTeal)),
                    for (var g = 0; g < _talk.goals.length; g++)
                      Row(
                        children: [
                          Icon(_goalsDone.contains(g) ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded, size: 17, color: _goalsDone.contains(g) ? kOk : kMuted),
                          const SizedBox(width: 6),
                          Expanded(child: Text(_talk.goals[g].labelAr, style: TextStyle(fontSize: 13, color: _goalsDone.contains(g) ? kMuted : kInk))),
                        ],
                      ),
                  ],
                ),
              ),
            Expanded(
              child: ListView(
                controller: _scroll,
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                children: [
                  for (final m in _msgs) ..._bubble(m),
                  if (_busy)
                    const Align(
                      alignment: AlignmentDirectional.centerStart,
                      child: Padding(padding: EdgeInsets.all(8), child: SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5))),
                    ),
                  if (_done) _summary(),
                ],
              ),
            ),
            if (hints.isNotEmpty)
              Container(
                width: double.infinity,
                color: kTint,
                padding: const EdgeInsets.fromLTRB(14, 8, 14, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('ردود مقترحة · اضغط للاختيار، واضغط مطولاً للإرسال فوراً', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: kMuted)),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      textDirection: TextDirection.ltr,
                      children: [
                        for (final h in hints)
                          GestureDetector(
                            onLongPress: () {
                              _input.text = h;
                              _send();
                            },
                            child: ActionChip(
                              avatar: const Icon(Icons.volume_up_rounded, size: 16, color: kTeal),
                              label: En(h, style: const TextStyle(fontSize: 13.5)),
                              onPressed: () {
                                Speech.I.say(h);
                                _input.value = TextEditingValue(text: h, selection: TextSelection.collapsed(offset: h.length));
                              },
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            if (!_done && _listening)
              Container(
                width: double.infinity,
                color: const Color(0xFFFFF1EC),
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                child: Row(
                  children: [
                    const _Pulse(),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ListenableBuilder(
                        listenable: _input,
                        builder: (context, _) => Text(
                          _input.text.isEmpty ? 'أسمعك… تكلم بالإنجليزية' : _input.text,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          textDirection: _input.text.isEmpty ? TextDirection.rtl : TextDirection.ltr,
                          style: TextStyle(fontSize: 14.5, height: 1.4, color: _input.text.isEmpty ? kMuted : kInk, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                    const Text('يُرسل عند صمتك', style: TextStyle(fontSize: 11.5, color: kMuted)),
                  ],
                ),
              ),
            if (!_done)
              Container(
                color: Colors.white,
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
                child: Row(
                  children: [
                    _RoundButton(icon: _listening ? Icons.stop_rounded : Icons.mic_rounded, color: _listening ? kCoral : kTeal, onTap: _mic),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _input,
                        textDirection: TextDirection.ltr,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _send(),
                        onChanged: (_) {
                          // الطالب كتب بيده: يبقى الإرسال يدوياً بزر الإرسال.
                          if (_voiceActive) {
                            _voiceActive = false;
                            Speech.I.stopListening();
                            setState(() => _listening = false);
                          }
                        },
                        decoration: InputDecoration(
                          hintText: _listening ? 'أسمعك… تكلم بالإنجليزية' : 'Speak or type in English…',
                          hintTextDirection: TextDirection.ltr,
                          filled: true,
                          fillColor: kSand,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(99), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    _RoundButton(icon: Icons.send_rounded, color: kTeal, onTap: _send),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  List<Widget> _bubble(_Msg m) {
    if (m.coach) {
      return [
        Align(
          alignment: Alignment.centerLeft,
          child: Container(
            margin: const EdgeInsets.only(bottom: 9, right: 40),
            padding: const EdgeInsets.fromLTRB(4, 4, 14, 4),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: kLine)),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              textDirection: TextDirection.ltr,
              children: [
                SpeakButton(m.text),
                Flexible(child: En(m.text, style: const TextStyle(fontSize: 16, height: 1.45, color: kInk))),
              ],
            ),
          ),
        ),
      ];
    }
    return [
      Align(
        alignment: Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.only(bottom: 6, left: 40),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
          decoration: BoxDecoration(color: kTeal, borderRadius: BorderRadius.circular(18)),
          child: En(m.text, style: const TextStyle(fontSize: 16, height: 1.45, color: Colors.white)),
        ),
      ),
      if (m.fix != null)
        Align(
          alignment: Alignment.centerRight,
          child: Container(
            margin: const EdgeInsets.only(bottom: 9, left: 40),
            padding: const EdgeInsets.all(11),
            decoration: BoxDecoration(color: const Color(0xFFFFF6DC), borderRadius: BorderRadius.circular(14)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('الأفضل أن تقول', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF7A5A00))),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  textDirection: TextDirection.ltr,
                  children: [
                    Flexible(child: En(m.fix!, style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w700, color: kInk))),
                    SpeakButton(m.fix!),
                  ],
                ),
                if (m.note.isNotEmpty) Text(m.note, style: const TextStyle(fontSize: 13, height: 1.6, color: kInk)),
              ],
            ),
          ),
        )
      else if (m.ok && RemoteAi.enabled)
        const Align(
          alignment: Alignment.centerRight,
          child: Padding(
            padding: EdgeInsets.only(bottom: 9),
            child: Text('✓ جملة سليمة', style: TextStyle(color: kOk, fontSize: 12.5, fontWeight: FontWeight.w700)),
          ),
        )
      else
        const SizedBox(height: 4),
    ];
  }

  /// مؤشرات الأداء في نهاية المحادثة: الدقة وطول الجملة وعدد الكلمات.
  Widget _stats() {
    final mine = _msgs.where((m) => !m.coach).toList();
    if (mine.isEmpty) return const SizedBox.shrink();
    final words = mine.fold<int>(0, (a, m) => a + countWords(m.text));
    final clean = mine.where((m) => m.fix == null).length;
    final accuracy = (clean * 100 / mine.length).round();
    final avg = (words / mine.length).toStringAsFixed(1);
    Widget box(String v, String label, Color c) => Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(color: kTint, borderRadius: BorderRadius.circular(12)),
            child: Column(children: [
              Text(v, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: c)),
              Text(label, style: const TextStyle(fontSize: 11.5, color: kMuted)),
            ]),
          ),
        );
    return Row(children: [
      box('$accuracy%', 'جمل بلا أخطاء', accuracy >= 70 ? kOk : kCoral),
      const SizedBox(width: 8),
      box(avg, 'كلمات في الجملة', kTeal),
      const SizedBox(width: 8),
      box('$words', 'كلمة قلتها', kTeal),
    ]);
  }

  Widget _summary() {
    final fixes = _msgs.where((m) => m.fix != null).toList();
    return AppCard(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('ملخص المحادثة', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          _stats(),
          const SizedBox(height: 4),
          Text(
            'جمل قلتها: $_spoken · تصحيحات: ${fixes.length}${_talk.goals.isEmpty ? '' : ' · أهداف المهمة: ${_goalsDone.length} من ${_talk.goals.length}'}',
            style: const TextStyle(color: kMuted),
          ),
          if (_talk.goals.isNotEmpty && _goalsDone.length == _talk.goals.length)
            const Padding(padding: EdgeInsets.only(top: 6), child: Text('أنجزت المهمة كاملة ⭐', style: TextStyle(color: kOk, fontWeight: FontWeight.w800))),
          for (final m in fixes) ...[
            const Divider(),
            En(m.text, style: const TextStyle(color: kMuted, decoration: TextDecoration.lineThrough)),
            En(m.fix!, style: const TextStyle(fontWeight: FontWeight.w700, color: kInk)),
          ],
          const SizedBox(height: 8),
          Text(
            fixes.isEmpty ? 'لم يُرصد خطأ في هذه المحادثة.' : 'حُفظت هذه التصحيحات في دفتر أخطائك وستعود إليك في المراجعة.',
            style: const TextStyle(color: kMuted, height: 1.6, fontSize: 13.5),
          ),
          const SizedBox(height: 12),
          FilledButton(onPressed: () => setState(_startTalk), child: const Text('محادثة جديدة بموقف آخر')),
        ],
      ),
    );
  }
}

class _RoundButton extends StatelessWidget {
  const _RoundButton({required this.icon, required this.color, required this.onTap});
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color,
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(width: 46, height: 46, child: Icon(icon, color: Colors.white, size: 22)),
      ),
    );
  }
}

/// نقطة نابضة تدل على أن الميكروفون يسمع.
class _Pulse extends StatefulWidget {
  const _Pulse();
  @override
  State<_Pulse> createState() => _PulseState();
}

class _PulseState extends State<_Pulse> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..repeat(reverse: true);

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (context, _) => Container(
        width: 14 + 8 * _c.value,
        height: 14 + 8 * _c.value,
        decoration: BoxDecoration(color: Color.lerp(kCoral, Colors.white, _c.value * 0.6)!, shape: BoxShape.circle),
      ),
    );
  }
}
