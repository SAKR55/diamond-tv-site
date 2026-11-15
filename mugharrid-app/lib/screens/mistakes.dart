import 'package:flutter/material.dart';

import '../core/coach.dart';
import '../core/store.dart';
import '../ui/common.dart';

const _kindNames = {'grammar': 'قواعد', 'vocab': 'مفردات', 'pron': 'نطق'};

/// دفتر أخطائي: كل خطأ يُحفظ ويعود للمراجعة بفواصل متباعدة حتى يُتقن.
class MistakesScreen extends StatefulWidget {
  const MistakesScreen({super.key});

  @override
  State<MistakesScreen> createState() => _MistakesScreenState();
}

class _MistakesScreenState extends State<MistakesScreen> with TimedState<MistakesScreen> {
  String _forId = '';
  List<String> _options = [];
  String? _picked;

  void _grade(Mistake m, bool ok) {
    setState(() {
      _picked = null;
      _forId = '';
    });
    AppStore.I.gradeMistake(m, ok);
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) {
        final s = AppStore.I;
        final due = s.dueMistakes;
        final Mistake? current = due.isNotEmpty ? due.first : null;
        if (current != null && current.id != _forId) {
          _forId = current.id;
          _picked = null;
          _options = [current.wrong, current.correct]..shuffle();
        }
        return Scaffold(
          appBar: AppBar(title: const Text('دفتر أخطائي')),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              if (s.mistakes.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 60),
                  child: Text(
                    '📒\n\nالدفتر فارغ.\nكل خطأ في الدروس أو المحادثات أو النطق سيُحفظ هنا تلقائياً ليعود إليك حتى تتقنه.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: kMuted, height: 1.8, fontSize: 15.5),
                  ),
                )
              else if (current != null)
                _review(current, due.length)
              else
                const FeedbackBox(ok: true, text: 'لا مراجعات مستحقة اليوم. عد غداً، فالتكرار المتباعد يثبت التصحيح في الذاكرة.'),
              if (s.mistakes.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  'كل الأخطاء (${s.mistakes.length}) · أتقنت ${s.masteredCount}',
                  style: const TextStyle(fontWeight: FontWeight.w800, color: kMuted),
                ),
                const SizedBox(height: 8),
                for (final m in s.mistakes) _row(m),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _review(Mistake m, int dueCount) {
    final selfGrade = m.kind == 'pron' || m.wrong.trim().isEmpty || m.wrong == m.correct;
    return AppCard(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('مراجعة اليوم · بقي $dueCount', style: const TextStyle(color: kCoral, fontWeight: FontWeight.w800, fontSize: 13)),
          const SizedBox(height: 8),
          Text(m.prompt, style: const TextStyle(fontSize: 15, height: 1.7, color: kInk)),
          const SizedBox(height: 12),
          if (selfGrade) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SpeakButton(m.correct),
                SpeakButton(m.correct, slow: true),
                Flexible(child: En(m.correct, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: kInk))),
              ],
            ),
            const SizedBox(height: 6),
            if (m.note.isNotEmpty) Text(m.note, textAlign: TextAlign.center, style: const TextStyle(color: kMuted, height: 1.6)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: OutlinedButton(onPressed: () => _grade(m, false), child: const Text('ليس بعد'))),
                const SizedBox(width: 10),
                Expanded(child: FilledButton(onPressed: () => _grade(m, true), child: const Text('أتقنتها'))),
              ],
            ),
          ] else ...[
            const Text('أيهما الصحيح؟', style: TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            for (final o in _options)
              OptionButton(
                text: o,
                english: true,
                state: _picked == null ? 0 : (o == m.correct ? 1 : (o == _picked ? 2 : 0)),
                onTap: _picked != null ? null : () => setState(() => _picked = o),
              ),
            if (_picked != null) ...[
              FeedbackBox(ok: _picked == m.correct, text: (_picked == m.correct ? 'صحيح. ' : 'ما زال يحتاج مراجعة. ') + m.note),
              FilledButton(onPressed: () => _grade(m, _picked == m.correct), child: const Text('التالي')),
            ],
          ],
        ],
      ),
    );
  }

  Future<void> _explain(Mistake m) async {
    if (!RemoteAi.enabled) {
      toast(context, m.note.isNotEmpty ? m.note : 'فعّل رابط الخادم في الإعدادات لتحصل على شرح مفصل');
      return;
    }
    toast(context, 'جارٍ تجهيز الشرح...');
    final j = await RemoteAi.explain(wrong: m.wrong, correct: m.correct);
    if (!mounted) return;
    if (j == null) {
      toast(context, m.note.isNotEmpty ? m.note : 'تعذّر الشرح الآن، حاول لاحقاً');
      return;
    }
    final ex = (j['examples'] is List) ? (j['examples'] as List).map((e) => e.toString()).toList() : <String>[];
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            En(m.correct, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: kInk)),
            const SizedBox(height: 8),
            Text((j['explain_ar'] ?? '').toString(), style: const TextStyle(height: 1.7, color: kInk, fontSize: 14.5)),
            if (ex.isNotEmpty) const SizedBox(height: 10),
            for (final e in ex) Padding(padding: const EdgeInsets.only(bottom: 4), child: En(e, style: const TextStyle(color: kTeal, fontSize: 14.5))),
          ],
        ),
      ),
    );
  }

  Widget _row(Mistake m) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () => _explain(m),
      child: _rowBody(m),
    );
  }

  Widget _rowBody(Mistake m) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: kLine)),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: kTint, borderRadius: BorderRadius.circular(8)),
            child: Text(_kindNames[m.kind] ?? m.kind, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: kTeal)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                En(m.correct, align: TextAlign.left, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15.5, color: kInk)),
                if (m.wrong.trim().isNotEmpty && m.wrong != m.correct)
                  En(m.wrong, align: TextAlign.left, style: const TextStyle(fontSize: 13.5, color: kMuted, decoration: TextDecoration.lineThrough)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(m.mastered ? '✅' : '●' * m.strength + '○' * (3 - m.strength), style: const TextStyle(color: kCoral, fontSize: 13)),
        ],
      ),
    );
  }
}
