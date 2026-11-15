import 'package:flutter/material.dart';

import '../core/speech.dart';
import '../core/store.dart';
import '../data/content.dart';
import '../ui/common.dart';

class _PreparedQ {
  _PreparedQ(this.q, this.options, this.correct, this.skill, this.audio, this.passage);
  final String q;
  final List<String> options;
  final String correct;
  final String skill;
  final String audio;
  final String passage;
}

/// اختبار تحديد المستوى: 12 سؤالاً قصيراً تحدد من أين يبدأ المتعلم.
class PlacementScreen extends StatefulWidget {
  const PlacementScreen({super.key});

  @override
  State<PlacementScreen> createState() => _PlacementScreenState();
}

class _PlacementScreenState extends State<PlacementScreen> {
  late List<_PreparedQ> _qs;
  bool _saved = false;
  int _index = 0;
  int _correct = 0;
  String? _picked;
  bool _started = false;
  final Map<String, int> _right = {};
  final Map<String, int> _asked = {};

  @override
  void dispose() {
    Speech.I.stopSpeaking();
    super.dispose();
  }

  void _playIfAudio() {
    if (_index < _qs.length && _qs[_index].audio.isNotEmpty) Speech.I.say(_qs[_index].audio, rate: 0.42);
  }

  @override
  void initState() {
    super.initState();
    // نخلط ترتيب الاختيارات حتى لا يكون الجواب في الموضع نفسه دائماً.
    _qs = drawPlacement().map((p) {
      final options = List<String>.from(p.options)..shuffle();
      return _PreparedQ(p.q, options, p.options[p.answer], p.skill, p.audio, p.passage);
    }).toList();
  }

  void _finish(String level) {
    AppStore.I.setLevel(level);
    // إذا فُتح الاختبار من الإعدادات نعود للخلف، وإلا تنتقل الواجهة تلقائياً للرئيسية.
    if (Navigator.of(context).canPop()) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final Widget body;
    if (!_started) {
      body = _intro();
    } else if (_index >= _qs.length) {
      body = _result();
    } else {
      body = _question();
    }
    return Scaffold(
      appBar: AppBar(title: const Text('اختبار تحديد المستوى')),
      body: SafeArea(child: Padding(padding: const EdgeInsets.all(18), child: body)),
    );
  }

  Widget _intro() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Spacer(),
        const Text('🎯', textAlign: TextAlign.center, style: TextStyle(fontSize: 64)),
        const SizedBox(height: 12),
        const Text('لنعرف من أين تبدأ', textAlign: TextAlign.center, style: TextStyle(fontSize: 23, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        const Text(
          'اختبار شامل من 15 سؤالاً يتغير في كل محاولة:\nقواعد، مفردات، استماع، وقراءة. يأخذ نحو خمس دقائق.\nأجب بما تعرفه فقط، ولا بأس بالخطأ.',
          textAlign: TextAlign.center,
          style: TextStyle(color: kMuted, height: 1.8, fontSize: 15),
        ),
        if (AppStore.I.attempts.isNotEmpty) ...[
          const SizedBox(height: 14),
          const Text('محاولاتك السابقة', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.w800, color: kInk)),
          for (final a in AppStore.I.attempts.take(4))
            Text(
              '${_ago((a['day'] as num?)?.toInt() ?? 0)} · ${a['score']} من ${a['total']} · ${a['level']}',
              textAlign: TextAlign.center,
              style: const TextStyle(color: kMuted, height: 1.8),
            ),
        ],
        const Spacer(),
        FilledButton(
          onPressed: () {
            setState(() => _started = true);
            _playIfAudio();
          },
          child: const Text('ابدأ الاختبار'),
        ),
        const SizedBox(height: 10),
        OutlinedButton(onPressed: () => _finish('A1'), child: const Text('أنا مبتدئ، تخطَّ الاختبار')),
      ],
    );
  }

  Widget _question() {
    final q = _qs[_index];
    final listening = q.audio.isNotEmpty;
    return ListView(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(9),
          child: LinearProgressIndicator(value: _index / _qs.length, minHeight: 8, color: kCoral, backgroundColor: kLine),
        ),
        const SizedBox(height: 8),
        Text('السؤال ${_index + 1} من ${_qs.length} · ${skillNamesAr[q.skill] ?? ''}', style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
        const SizedBox(height: 14),
        if (q.passage.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: kTint, borderRadius: BorderRadius.circular(16)),
            child: En(q.passage, style: const TextStyle(fontSize: 16.5, height: 1.6, color: kInk)),
          ),
        if (listening)
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: kTint, borderRadius: BorderRadius.circular(16)),
            child: Row(
              children: [
                IconButton.filled(onPressed: _playIfAudio, icon: const Icon(Icons.volume_up_rounded)),
                const SizedBox(width: 10),
                const Expanded(child: Text('استمع ثم أجب. يمكنك إعادة الاستماع.', style: TextStyle(color: kInk, fontWeight: FontWeight.w700))),
              ],
            ),
          ),
        Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: kLine)),
          child: En(q.q, align: TextAlign.center, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: kInk)),
        ),
        const SizedBox(height: 14),
        for (final o in q.options)
          OptionButton(
            text: o,
            english: true,
            state: _picked == null ? 0 : (o == q.correct ? 1 : (o == _picked ? 2 : 0)),
            onTap: _picked != null
                ? null
                : () => setState(() {
                      _picked = o;
                      _asked[q.skill] = (_asked[q.skill] ?? 0) + 1;
                      if (o == q.correct) {
                        _correct++;
                        _right[q.skill] = (_right[q.skill] ?? 0) + 1;
                      }
                    }),
          ),
        const SizedBox(height: 10),
        FilledButton(
          onPressed: _picked == null
              ? null
              : () {
                  Speech.I.stopSpeaking();
                  setState(() {
                    _index++;
                    _picked = null;
                  });
                  _playIfAudio();
                },
          child: const Text('التالي'),
        ),
      ],
    );
  }

  String _ago(int day) {
    final d = todayNumber() - day;
    if (d <= 0) return 'اليوم';
    if (d == 1) return 'أمس';
    return 'قبل $d يوماً';
  }

  Widget _result() {
    // 15 سؤالاً: 11 فأكثر متوسط، 6 فأكثر أساسي.
    final level = _correct >= 11 ? 'B1' : (_correct >= 6 ? 'A2' : 'A1');
    if (!_saved) {
      _saved = true;
      // نحفظ المحاولة بعد انتهاء بناء الواجهة.
      Future.microtask(() => AppStore.I.addAttempt(_correct, _qs.length, level));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Spacer(),
        const Text('🏁', textAlign: TextAlign.center, style: TextStyle(fontSize: 64)),
        const SizedBox(height: 10),
        Text('مستواك: $level · ${levelNamesAr[level]}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        Text(
          'أجبت إجابة صحيحة عن $_correct من ${_qs.length}.\nسنخصص لك الدروس والنصوص والحلقات المناسبة لهذا المستوى.',
          textAlign: TextAlign.center,
          style: const TextStyle(color: kMuted, height: 1.8, fontSize: 15),
        ),
        const SizedBox(height: 14),
        for (final k in skillNamesAr.keys)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 20),
            child: Row(
              children: [
                SizedBox(width: 84, child: Text(skillNamesAr[k]!, style: const TextStyle(fontWeight: FontWeight.w700, color: kInk))),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(value: (_asked[k] ?? 0) == 0 ? 0 : (_right[k] ?? 0) / _asked[k]!, minHeight: 9, color: kTeal, backgroundColor: kLine),
                  ),
                ),
                const SizedBox(width: 10),
                Text('${_right[k] ?? 0}/${_asked[k] ?? 0}', textDirection: TextDirection.ltr, style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        const Spacer(),
        FilledButton(onPressed: () => _finish(level), child: const Text('ابدأ التعلم')),
      ],
    );
  }
}
