import 'package:flutter/material.dart';

import '../core/speech.dart';
import '../core/store.dart';
import '../data/content.dart';
import '../ui/common.dart';
import 'builder.dart';
import 'kids_course.dart';
import 'stories.dart';

const _kidsBg = BoxDecoration(
  gradient: LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFBFE8FF), Color(0xFFE9F8FF), Color(0xFFFFF7D6)],
  ),
);

/// الصفحة الرئيسية لقسم الأطفال. لا إعلانات ولا محادثة مفتوحة، والإعدادات خلف سؤال للكبار.
class KidsHome extends StatelessWidget {
  const KidsHome({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) {
        final limit = AppStore.I.count('kidLimit');
        final limitReached = limit > 0 && AppStore.I.todayMinutes >= limit;
        return Scaffold(
          body: Container(
            decoration: _kidsBg,
            child: SafeArea(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 24),
                children: [
                  Row(
                    children: [
                      const Expanded(child: Text('مرحباً يا بطل!', style: TextStyle(fontSize: 25, fontWeight: FontWeight.w900, color: kInk))),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(99)),
                        child: Text('⭐ ${AppStore.I.stars}', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      const Text('🌟', style: TextStyle(fontSize: 66)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22)),
                          child: const Text('أنا مغرّد الصغير! ماذا نتعلم اليوم؟', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700, height: 1.5)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  if (limitReached)
                    Container(
                      padding: const EdgeInsets.all(22),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(26)),
                      child: const Text('🌙\nانتهى وقت اللعب اليوم!\nأحسنت، نكمل غداً.', textAlign: TextAlign.center, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, height: 1.6, color: kInk)),
                    ),
                  if (!limitReached) ...[
                  _KidCard(color: const Color(0xFF00A6A6), emoji: '🎓', title: 'منهجي', subtitle: 'الحروف، الأرقام، الألوان، والكلمات وحدة وحدة', onTap: () => push(context, const KidsCourseScreen())),
                  _KidCard(color: const Color(0xFF7A5CF0), emoji: '🍎', title: 'طابق الكلمة', subtitle: 'انظر إلى الصورة واختر اسمها', onTap: () => push(context, const KidsGameScreen(game: 'match'))),
                  _KidCard(color: const Color(0xFF39C9A0), emoji: '👂', title: 'استمع واختر', subtitle: 'اسمع الكلمة واختر صورتها', onTap: () => push(context, const KidsGameScreen(game: 'listen'))),
                  _KidCard(color: const Color(0xFFFF7AA2), emoji: '🗣️', title: 'قل معي', subtitle: 'اسمع ثم قل الكلمة بصوتك', onTap: () => push(context, const KidsGameScreen(game: 'say'))),
                  _KidCard(color: const Color(0xFFFF9F43), emoji: '🏭', title: 'مصنع الجمل', subtitle: 'اصنع جملتك من الصور واسمعها', onTap: () => push(context, const SentenceFactoryScreen())),
                  _KidCard(color: const Color(0xFF3FB0E6), emoji: '📖', title: 'قصة جديدة', subtitle: 'قصة قصيرة مختلفة في كل مرة', onTap: () => push(context, const StoriesScreen(kids: true))),
                  ],
                  const SizedBox(height: 8),
                  Center(
                    child: TextButton(
                      onPressed: () => push(context, const ParentGateScreen()),
                      child: const Text('ركن ولي الأمر', style: TextStyle(color: Color(0xFF35607A), fontWeight: FontWeight.w700, decoration: TextDecoration.underline)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _KidCard extends StatelessWidget {
  const _KidCard({required this.color, required this.emoji, required this.title, required this.subtitle, required this.onTap});
  final Color color;
  final String emoji;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: color,
        borderRadius: BorderRadius.circular(26),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Text(emoji, style: const TextStyle(fontSize: 42)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                      Text(subtitle, style: const TextStyle(color: Colors.white, fontSize: 14)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Round {
  _Round(this.word, this.options);
  final KidWord word;
  final List<KidWord> options;
}

/// ألعاب الأطفال الثلاث: match (صورة ثم كلمة)، listen (صوت ثم صورة)، say (نطق الكلمة).
class KidsGameScreen extends StatefulWidget {
  const KidsGameScreen({super.key, required this.game});
  final String game;

  @override
  State<KidsGameScreen> createState() => _KidsGameScreenState();
}

class _KidsGameScreenState extends State<KidsGameScreen> with TimedState<KidsGameScreen> {
  late List<_Round> _rounds;
  int _i = 0;
  int? _picked;
  int _earned = 0;
  bool _listening = false;
  bool _saidOk = false;
  bool _tried = false;

  _Round get _r => _rounds[_i];
  bool get _finished => _i >= _rounds.length;

  @override
  void initState() {
    super.initState();
    _build();
    Speech.I.onStatus = (status) {
      if (!mounted) return;
      if ((status == 'done' || status == 'notListening') && _listening) setState(() => _listening = false);
    };
    if (widget.game != 'match') {
      WidgetsBinding.instance.addPostFrameCallback((_) => Speech.I.say(_r.word.en, rate: 0.36));
    }
  }

  void _build() {
    final pool = List<KidWord>.from(kidWords)..shuffle();
    final count = widget.game == 'say' ? 5 : 6;
    _rounds = pool.take(count).map((w) {
      final others = kidWords.where((x) => x.en != w.en).toList()..shuffle();
      final options = <KidWord>[w, ...others.take(2)]..shuffle();
      return _Round(w, options);
    }).toList();
    _i = 0;
    _picked = null;
    _earned = 0;
    _saidOk = false;
    _tried = false;
  }

  void _star() {
    _earned++;
    AppStore.I.addStars(1);
  }

  void _pick(int index) {
    if (_picked != null) return;
    final ok = _r.options[index].en == _r.word.en;
    setState(() => _picked = index);
    if (ok) _star();
    Speech.I.say(_r.word.en, rate: 0.36);
  }

  void _next() {
    setState(() {
      _i++;
      _picked = null;
      _saidOk = false;
      _tried = false;
    });
    if (_finished) {
      AppStore.I.markActive();
    } else if (widget.game != 'match') {
      Speech.I.say(_r.word.en, rate: 0.36);
    }
  }

  Future<void> _listenToChild() async {
    if (_listening) {
      await Speech.I.stopListening();
      return;
    }
    setState(() => _listening = true);
    final target = _r.word.en;
    final ok = await Speech.I.listen(
      listenFor: const Duration(seconds: 6),
      onText: (text, isFinal) {
        if (!mounted || _saidOk) return;
        if (splitWords(text).contains(target)) {
          setState(() {
            _saidOk = true;
            _listening = false;
          });
          _star();
          Speech.I.stopListening();
        } else if (isFinal) {
          setState(() {
            _tried = true;
            _listening = false;
          });
        }
      },
    );
    if (!mounted) return;
    if (!ok) {
      setState(() {
        _listening = false;
        _tried = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: _kidsBg,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    IconButton(onPressed: () => Navigator.of(context).pop(), icon: const Icon(Icons.close_rounded, size: 30, color: kInk)),
                    const Spacer(),
                    Text('⭐ $_earned', style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w900)),
                  ],
                ),
                Expanded(child: _finished ? _end() : (widget.game == 'say' ? _say() : _choose())),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _choose() {
    final listen = widget.game == 'listen';
    final answered = _picked != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Spacer(),
        Text(listen ? 'أين هذه الكلمة؟' : 'ما هذا؟', textAlign: TextAlign.center, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
        const SizedBox(height: 12),
        if (listen)
          Center(child: _BigRound(icon: Icons.volume_up_rounded, color: const Color(0xFF3FB0E6), onTap: () => Speech.I.say(_r.word.en, rate: 0.36)))
        else
          Text(_r.word.emoji, textAlign: TextAlign.center, style: const TextStyle(fontSize: 120)),
        const SizedBox(height: 22),
        Row(
          textDirection: TextDirection.ltr,
          children: [
            for (var k = 0; k < _r.options.length; k++)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 5),
                  child: Material(
                    color: !answered ? Colors.white : (_r.options[k].en == _r.word.en ? const Color(0xFFC9F5DC) : (k == _picked ? const Color(0xFFFFD9D2) : Colors.white)),
                    borderRadius: BorderRadius.circular(22),
                    clipBehavior: Clip.antiAlias,
                    child: InkWell(
                      onTap: answered ? null : () => _pick(k),
                      child: Container(
                        height: 92,
                        alignment: Alignment.center,
                        child: Text(
                          listen ? _r.options[k].emoji : _r.options[k].en,
                          textDirection: TextDirection.ltr,
                          style: TextStyle(fontSize: listen ? 46 : 21, fontWeight: FontWeight.w900, color: kInk),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 14),
        if (answered)
          Text(
            '${_r.word.emoji}  ${_r.word.en} = ${_r.word.ar}',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: kInk),
          ),
        const Spacer(),
        if (answered) _KidButton(text: _r.options[_picked!].en == _r.word.en ? 'رائع! التالي' : 'التالي', onTap: _next),
      ],
    );
  }

  Widget _say() {
    final w = _r.word;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Spacer(),
        Text(w.emoji, textAlign: TextAlign.center, style: const TextStyle(fontSize: 120)),
        Text(w.en, textAlign: TextAlign.center, textDirection: TextDirection.ltr, style: const TextStyle(fontSize: 44, fontWeight: FontWeight.w900, color: kInk)),
        Text(w.ar, textAlign: TextAlign.center, style: const TextStyle(fontSize: 20, color: kMuted)),
        const SizedBox(height: 18),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _BigRound(icon: Icons.volume_up_rounded, color: const Color(0xFF3FB0E6), onTap: () => Speech.I.say(w.en, rate: 0.36)),
            const SizedBox(width: 22),
            _BigRound(icon: _listening ? Icons.stop_rounded : Icons.mic_rounded, color: _listening ? kCoral : const Color(0xFFFF7AA2), onTap: _listenToChild),
          ],
        ),
        const SizedBox(height: 14),
        Text(
          _saidOk ? 'أحسنت! سمعتك تقول ${w.en} ⭐' : (_listening ? 'أسمعك...' : (_tried ? 'حاول مرة أخرى، أو اضغط «قلتها»' : 'اسمع ثم اضغط الميكروفون وقل الكلمة')),
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: kInk),
        ),
        const Spacer(),
        if (_saidOk)
          _KidButton(text: 'التالي', onTap: _next)
        else
          _KidButton(
            text: 'قلتها! ⭐',
            onTap: () {
              _star();
              _next();
            },
          ),
      ],
    );
  }

  Widget _end() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Spacer(),
        const Text('🏆', textAlign: TextAlign.center, style: TextStyle(fontSize: 110)),
        const Text('أحسنت!', textAlign: TextAlign.center, style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900)),
        Text('ربحت $_earned نجوم', textAlign: TextAlign.center, style: const TextStyle(fontSize: 20)),
        const Spacer(),
        _KidButton(text: 'العب مرة أخرى', onTap: () => setState(_build)),
        const SizedBox(height: 10),
        TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('لعبة أخرى', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800))),
      ],
    );
  }
}

class _BigRound extends StatelessWidget {
  const _BigRound({required this.icon, required this.color, required this.onTap});
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color,
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(onTap: onTap, child: SizedBox(width: 88, height: 88, child: Icon(icon, color: Colors.white, size: 44))),
    );
  }
}

class _KidButton extends StatelessWidget {
  const _KidButton({required this.text, required this.onTap});
  final String text;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      style: FilledButton.styleFrom(
        backgroundColor: kCoral,
        minimumSize: const Size.fromHeight(60),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        textStyle: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
      ),
      onPressed: onTap,
      child: Text(text),
    );
  }
}

/// بوابة ولي الأمر: سؤال حسابي بسيط قبل الإعدادات.
class ParentGateScreen extends StatefulWidget {
  const ParentGateScreen({super.key});

  @override
  State<ParentGateScreen> createState() => _ParentGateScreenState();
}

class _ParentGateScreenState extends State<ParentGateScreen> {
  bool _wrong = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('للكبار فقط')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 30),
            const Text('للدخول إلى ركن ولي الأمر:', style: TextStyle(fontSize: 17, color: kMuted)),
            const SizedBox(height: 10),
            const Text('7 + 5 = ؟', textDirection: TextDirection.ltr, style: TextStyle(fontSize: 34, fontWeight: FontWeight.w900)),
            const SizedBox(height: 22),
            Row(
              children: [
                for (final n in const [10, 12, 14])
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: OutlinedButton(
                        onPressed: () {
                          if (n == 12) {
                            Navigator.of(context).pushReplacement(MaterialPageRoute<void>(builder: (_) => const ParentCornerScreen()));
                          } else {
                            setState(() => _wrong = true);
                          }
                        },
                        child: Text('$n'),
                      ),
                    ),
                  ),
              ],
            ),
            if (_wrong) const Padding(padding: EdgeInsets.only(top: 16), child: Text('إجابة غير صحيحة', style: TextStyle(color: kBad))),
          ],
        ),
      ),
    );
  }
}
