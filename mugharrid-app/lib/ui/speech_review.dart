import 'package:flutter/material.dart';

import '../core/interview_coach.dart';
import '../core/speech.dart';
import 'common.dart';

/// بطاقة «تحسينات مقترحة» تُعرض بعد أي كلام حر للمتعلم: تصحيح، صيغة سليمة، ملاحظات، وصيغة أقوى.
/// تعمل محلياً بلا إنترنت، وتفحص أخطاء شائعة فقط، وليست مدققاً نحوياً كاملاً.
class SpeechReviewCard extends StatelessWidget {
  const SpeechReviewCard(this.text, {super.key, this.topic = ''});
  final String text;
  final String topic;

  @override
  Widget build(BuildContext context) {
    if (countWords(text) < 3) return const SizedBox.shrink();
    final r = reviewAnswer(topic, text, '');
    final better = r.suggestions.isEmpty ? null : r.suggestions.last;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('تحسينات مقترحة', style: TextStyle(fontWeight: FontWeight.w900, color: kTeal, fontSize: 15)),
          const SizedBox(height: 8),
          Text(r.corrected != null ? 'بعد التصحيح' : 'مكتوباً بشكل سليم', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: kMuted)),
          Row(children: [Expanded(child: En(r.corrected ?? r.polished, style: const TextStyle(color: kInk, fontSize: 15, fontWeight: FontWeight.w700, height: 1.5))), SpeakButton(r.corrected ?? r.polished)]),
          if (r.noteAr.isNotEmpty) Text(r.noteAr, style: const TextStyle(color: kBad, fontSize: 13.5, height: 1.6)),
          for (final f in r.fixes) Padding(padding: const EdgeInsets.only(top: 4), child: Text('← $f', style: const TextStyle(color: kInk, fontSize: 13.5, height: 1.6))),
          for (final g in r.good) Padding(padding: const EdgeInsets.only(top: 4), child: Text('✓ $g', style: const TextStyle(color: kOk, fontSize: 13.5, height: 1.6))),
          if (better != null) ...[
            const Divider(height: 20, color: kLine),
            Text(better.label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: kTeal)),
            Row(children: [Expanded(child: En(better.text, style: const TextStyle(color: kInk, fontSize: 15, height: 1.5))), SpeakButton(better.text)]),
          ],
        ],
      ),
    );
  }
}
