import 'coach.dart';
import 'speech.dart';

/// إجابة مقترحة تُعرض بعد كل سؤال في المقابلة.
class Suggestion {
  const Suggestion(this.label, this.text, this.hintAr);
  final String label;
  final String text;
  final String hintAr;
}

/// تقييم إجابة واحدة، كله محلي بلا إنترنت.
class AnswerReview {
  AnswerReview({
    required this.said,
    required this.polished,
    required this.corrected,
    required this.noteAr,
    required this.score,
    required this.good,
    required this.fixes,
    required this.missing,
    required this.suggestions,
  });

  final String said;

  /// ما قلته مكتوباً بصيغة سليمة (حرف كبير ونقطة) دون تغيير الكلمات.
  final String polished;

  /// الجملة بعد تصحيح الخطأ النحوي إن وُجد، وإلا null.
  final String? corrected;
  final String noteAr;
  final int score;
  final List<String> good;
  final List<String> fixes;
  final List<String> missing;
  final List<Suggestion> suggestions;
}

/// يكتب كلام المتعلم كما يُكتب عادة: I كبيرة، أول حرف كبير، نقطة في النهاية.
String polishSpoken(String t) {
  var x = t.trim().replaceAll(RegExp(r'\s+'), ' ');
  if (x.isEmpty) return x;
  x = x.replaceAllMapped(RegExp(r'\bi\b'), (m) => 'I');
  x = x[0].toUpperCase() + x.substring(1);
  if (!RegExp(r'[.!?]$').hasMatch(x)) x = '$x.';
  return x;
}

const _stop = {
  'about', 'after', 'again', 'because', 'before', 'being', 'could', 'every', 'which', 'their', 'there', 'these', 'those', 'would', 'should',
  'where', 'while', 'other', 'really', 'always', 'something', 'through', 'thing', 'things', 'people', 'little', 'under',
};

List<String> _keywords(String model) {
  final seen = <String>{};
  final out = <String>[];
  for (final w in splitWords(model)) {
    if (w.length <= 5 || _stop.contains(w)) continue;
    if (seen.add(w)) out.add(w);
  }
  return out;
}

bool _said(Set<String> mine, String key) {
  final stem = key.length > 6 ? key.substring(0, key.length - 2) : key;
  return mine.any((m) => m == key || m.startsWith(stem));
}

String _closer(String q) {
  final s = q.toLowerCase();
  if (s.contains('weakness')) return 'To improve, I set a weekly plan, and I already see good progress.';
  if (s.contains('strength')) return 'For example, last year I used this strength to finish an important project ahead of schedule.';
  if (s.contains('hire you') || s.contains('why should we')) return 'I am confident I can add value from my first month.';
  if (s.contains('salary') || s.contains('expect')) return 'I am flexible and open to discussing a fair package.';
  if (s.contains('yourself')) return 'I am excited about this opportunity and ready to contribute.';
  if (s.contains('conflict') || s.contains('difficult') || s.contains('mistake') || s.contains('challenge')) {
    return 'In the end, we solved it calmly, and I learned a lot from the experience.';
  }
  if (s.contains('five years') || s.contains('goal') || s.contains('future')) return 'I see this role as the first step toward that goal.';
  return 'For example, in my previous role I applied this, and the result was positive for the team.';
}

List<String> _sentences(String t) => t.split(RegExp(r'(?<=[.!?])\s+')).where((e) => e.trim().isNotEmpty).toList();

AnswerReview reviewAnswer(String question, String said, String model) {
  final text = said.trim();
  final n = countWords(text);
  final good = <String>[];
  final fixes = <String>[];
  final missing = <String>[];
  String? corrected;
  var noteAr = '';
  var score = 0;
  final polished = polishSpoken(text);

  if (n == 0) {
    fixes.add('لم تُسجَّل إجابة. اضغط الميكروفون وتحدث، أو اكتب إجابتك.');
  } else {
    final lower = text.toLowerCase();
    final mine = splitWords(text).toSet();

    // 1) الطول (25)
    score += n >= 20 ? 25 : (n >= 10 ? 18 : (n >= 6 ? 10 : n * 2));
    if (n < 8) {
      fixes.add('إجابتك قصيرة. المحاور يتوقع 3 جمل على الأقل: الجواب ثم السبب ثم مثال.');
    } else if (n > 70) {
      fixes.add('إجابتك طويلة. اجعلها بين 30 و 60 كلمة حتى لا يفقد المحاور التركيز.');
    } else {
      good.add('طول إجابتك مناسب.');
    }

    // 2) القواعد (25)
    final hit = checkCommonErrors(text);
    if (hit == null) {
      score += 25;
      good.add('لم أجد أخطاء شائعة في القواعد.');
    } else {
      score += 10;
      corrected = polishSpoken(hit.corrected);
      noteAr = hit.noteAr;
      fixes.add('خطأ نحوي: ${hit.noteAr}');
    }

    // 3) الصلة بالسؤال (25)
    if (model.trim().isEmpty) {
      score += 25; // كلام حر: لا جواب نموذجي للمقارنة
    } else {
      final keys = _keywords(model);
      final shared = keys.where((k) => _said(mine, k)).length;
      score += shared >= 4 ? 25 : shared * 6;
      for (final k in keys) {
        if (!_said(mine, k) && missing.length < 5) missing.add(k);
      }
      if (shared >= 3) {
        good.add('إجابتك قريبة من المطلوب.');
      } else {
        fixes.add('ابقَ في صلب السؤال. جرّب استخدام بعض الكلمات المقترحة أدناه.');
      }
    }

    // 4) التفاصيل والأمثلة (15)
    final hasExample = RegExp(r'for example|for instance|such as|last year|in my previous|at my previous|when i |as a result|so that').hasMatch(lower);
    final hasReason = RegExp(r'\bbecause\b|\bso\b|\bsince\b|\bthat is why\b').hasMatch(lower);
    if (hasExample) {
      score += 15;
      good.add('ذكرت مثالاً أو تجربة، وهذا يقنع المحاور.');
    } else if (hasReason) {
      score += 8;
      fixes.add('أضف مثالاً قصيراً من تجربتك: For example, last year I...');
    } else {
      fixes.add('أضف سبباً أو مثالاً: because... / For example...');
    }

    // 5) الطلاقة (10)
    final fillers = RegExp(r'\b(um+|uh+|erm|you know|kind of|sort of)\b').allMatches(lower).length;
    score += fillers == 0 ? 10 : (10 - fillers * 3).clamp(0, 10).toInt();
    if (fillers > 0) fixes.add('قلّلْ كلمات التردد (um, uh, you know). توقف قليلاً بدلها.');

    // كلمات ضعيفة وبدائلها
    final weak = <String, String>{
      r'\bvery good\b': 'excellent أو outstanding',
      r'\bgood\b': 'strong أو solid',
      r'\bnice\b': 'pleasant أو helpful',
      r'\bstuff\b': 'tasks أو responsibilities',
      r'\ba lot of\b': 'many أو a great deal of',
    };
    var shownWeak = 0;
    weak.forEach((re, alt) {
      if (shownWeak < 2 && RegExp(re).hasMatch(lower)) {
        fixes.add('كلمة عامة: استبدلها بـ $alt.');
        shownWeak++;
      }
    });
    if (RegExp(r'^i (think|guess)|maybe|i do not know|i don.t know').hasMatch(lower)) {
      fixes.add('تجنّب التردد (maybe / I think). قل رأيك بثقة: I am confident that...');
    }
  }

  final sug = <Suggestion>[];
  if (model.trim().isNotEmpty) sug.add(Suggestion('الجواب النموذجي', model, 'جواب متوازن يصلح لأغلب المقابلات.'));
  final ms = _sentences(model);
  if (ms.length >= 3) {
    sug.add(Suggestion('نسخة مختصرة', ms.take(2).join(' '), 'إن طلب المحاور جواباً سريعاً.'));
  }
  if (model.trim().isNotEmpty) sug.add(Suggestion('نسخة أقوى بمثال', '$model ${_closer(question)}', 'أضفنا جملة ختامية تقنع المحاور.'));
  if (n >= 4) {
    final base = corrected ?? polished;
    sug.add(Suggestion('كلامك بعد تحسينه', '$base ${_closer(question)}', 'كلامك نفسه مصحَّحاً ومعه جملة تُكمله.'));
  }

  return AnswerReview(
    said: text,
    polished: polished,
    corrected: corrected,
    noteAr: noteAr,
    score: score.clamp(0, 100).toInt(),
    good: good,
    fixes: fixes,
    missing: missing,
    suggestions: sug,
  );
}
