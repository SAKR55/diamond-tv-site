import 'dart:convert';

import 'dart:math';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'feed.dart';
import 'generators.dart';
import 'store.dart';

/// نتيجة فحص الأخطاء الشائعة.
class GrammarHit {
  const GrammarHit(this.corrected, this.noteAr);
  final String corrected;
  final String noteAr;
}

/// فاحص محلي بسيط لأخطاء يكثر وقوع المتحدث بالعربية فيها. يعمل بلا إنترنت.
/// يغطي عدداً محدوداً من الأنماط فقط، وليس مدققاً نحوياً كاملاً.
GrammarHit? checkCommonErrors(String input) {
  final text = input.trim();
  if (text.isEmpty) return null;
  var out = text;
  String? note;

  final agree = RegExp(r"\b(i am|i'm) agree\b", caseSensitive: false);
  if (agree.hasMatch(out)) {
    out = out.replaceAll(agree, 'I agree');
    note ??= 'agree فعل وليس صفة، فنقول I agree بلا am.';
  }

  final amVerb = RegExp(r"^(i am|i'm) (work|live|go|study|want|like|need|have)\b", caseSensitive: false);
  out = out.replaceFirstMapped(amVerb, (m) {
    note ??= 'لا نجمع am مع الفعل المجرد. قل I work أو I am working.';
    return 'I ${m.group(2)}';
  });

  final noBe = RegExp(
    r"^(i|he|she|it|we|they|you)\s+(happy|tired|hungry|thirsty|ready|late|sorry|fine|busy|sick|married|from|a student|an engineer|a teacher|a doctor)\b",
    caseSensitive: false,
  );
  out = out.replaceFirstMapped(noBe, (m) {
    note ??= 'الجملة الإنجليزية تحتاج فعل الكينونة (am / is / are) حتى لو لم يظهر في العربية.';
    final s = m.group(1)!;
    const be = {'i': 'am', 'he': 'is', 'she': 'is', 'it': 'is'};
    final subject = s.toLowerCase() == 'i' ? 'I' : s;
    return '$subject ${be[s.toLowerCase()] ?? 'are'} ${m.group(2)}';
  });

  final third = RegExp(r"^(he|she|it)\s+(go|want|like|work|live|have|need|speak|study)\b", caseSensitive: false);
  out = out.replaceFirstMapped(third, (m) {
    note ??= 'مع he / she / it نضيف s للفعل في المضارع البسيط.';
    const forms = {'go': 'goes', 'have': 'has', 'study': 'studies'};
    final v = m.group(2)!.toLowerCase();
    return '${m.group(1)} ${forms[v] ?? '${v}s'}';
  });

  final age = RegExp(r"\bi have (\d+) years\b(?!\s+(of|experience))", caseSensitive: false);
  out = out.replaceAllMapped(age, (m) {
    note ??= 'للعمر نستخدم am وليس have: I am 25 years old.';
    return 'I am ${m.group(1)} years old';
  });

  const swaps = <String, List<String>>{
    'more better': ['better', 'better هي صيغة المقارنة أصلاً، فلا تسبقها more.'],
    'discuss about': ['discuss', 'discuss لا يتبعها about.'],
    'informations': ['information', 'information اسم غير معدود ولا يُجمع.'],
    'advices': ['advice', 'advice اسم غير معدود ولا يُجمع.'],
    'peoples': ['people', 'people جمع أصلاً، فلا نضيف s.'],
    'childrens': ['children', 'children جمع أصلاً، فلا نضيف s.'],
    'furnitures': ['furniture', 'furniture اسم غير معدود ولا يُجمع.'],
  };
  swaps.forEach((bad, fix) {
    final re = RegExp('\\b$bad\\b', caseSensitive: false);
    if (re.hasMatch(out)) {
      out = out.replaceAll(re, fix[0]);
      note ??= fix[1];
    }
  });

  // أنماط إضافية شائعة عند المتحدث بالعربية: [النمط، البديل، الشرح]
  const rules = <List<String>>[
    [r"\b(he|she|it) don'?t\b", r'$1 does not', 'مع he / she / it نقول does not وليس do not.'],
    [r"\b(i|you|we|they) doesn'?t\b", r'$1 do not', 'مع I / you / we / they نقول do not.'],
    [r"\bdidn'?t went\b", 'did not go', 'بعد did not يأتي الفعل في صورته الأصلية: did not go.'],
    [r"\bdidn'?t saw\b", 'did not see', 'بعد did not يأتي الفعل في صورته الأصلية: did not see.'],
    [r"\bdidn'?t came\b", 'did not come', 'بعد did not يأتي الفعل في صورته الأصلية: did not come.'],
    [r"\bdidn'?t had\b", 'did not have', 'بعد did not يأتي الفعل في صورته الأصلية: did not have.'],
    [r"\b(can|must|should|will|could) to\b", r'$1', 'بعد can / must / should / will لا نضع to.'],
    [r"\bwant (go|buy|eat|see|learn|travel|speak|know|make|be|have)\b", r'want to $1', 'بعد want نضع to قبل الفعل: want to go.'],
    [r"\bneed (go|buy|eat|see|learn|travel|speak|know|make)\b", r'need to $1', 'بعد need نضع to قبل الفعل.'],
    [r"\bi am not agree\b", 'I do not agree', 'agree فعل: I do not agree.'],
    [r"\bexplain me\b", 'explain to me', 'نقول explain to me.'],
    [r"\bsaid me\b", 'told me', 'نقول told me أو said to me.'],
    [r"\bsay me\b", 'tell me', 'نقول tell me.'],
    [r"\bmarried with\b", 'married to', 'نقول married to وليس with.'],
    [r"\bdepends? of\b", 'depends on', 'نقول depends on.'],
    [r"\blisten(ing)? (music|the radio|him|her|me)\b", r'listen$1 to $2', 'listen يتبعها to.'],
    [r"\bgo(ing)? to home\b", r'go$1 home', 'نقول go home بلا to.'],
    [r"\bi am boring\b", 'I am bored', 'bored = أشعر بالملل، boring = أنا ممل.'],
    [r"\bi am interesting in\b", 'I am interested in', 'interested in = مهتم بـ.'],
    [r"\bi am exciting\b", 'I am excited', 'excited = متحمس، exciting = مثير.'],
    [r"\bsince (\d+|two|three|four|five|six|ten|many) (years|months|weeks|days)\b", r'for $1 $2', 'مع المدة نستخدم for، ومع نقطة البداية since.'],
    [r"\ban (university|uniform|european)\b", r'a $1', 'نقول a قبل الكلمات التي تبدأ بصوت «يو».'],
    [r"\ba (hour|honest)\b", r'an $1', 'حرف h هنا صامت، فنقول an.'],
    [r"\bi very like\b", 'I really like', 'نقول I really like أو I like it very much.'],
    [r"\bdo(ing)? a mistake\b", r'mak$1 a mistake', 'نقول make a mistake.'],
    [r"\benjoy to (\w+)\b", r'enjoy $1ing', 'بعد enjoy يأتي الفعل مع ing.'],
    [r"\blook(ing)? forward to (see|meet|hear|work)\b", r'look$1 forward to $2ing', 'بعد look forward to يأتي الفعل مع ing.'],
    [r"\bpeople is\b", 'people are', 'people جمع: people are.'],
    [r"\b(everybody|everyone) are\b", r'$1 is', 'everybody / everyone مفرد: is.'],
    [r"\bmuch (people|friends|books|cars|problems)\b", r'many $1', 'مع المعدود نستخدم many.'],
    [r"\bmany (money|time|water|information|work)\b", r'much $1', 'مع غير المعدود نستخدم much.'],
    [r"\bin (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b", r'on $1', 'مع الأيام نستخدم on.'],
    [r"\bin night\b", 'at night', 'نقول at night.'],
    [r"\bi born\b", 'I was born', 'نقول I was born.'],
    [r"\bthe life is\b", 'life is', 'عند الكلام العام لا نضع the قبل life.'],
    [r"\bi have (hungry|thirsty|afraid)\b", r'I am $1', 'نقول I am hungry / I am cold بفعل الكينونة.'],
    [r"\bhow is called\b", 'what is it called', 'نقول What is it called?'],
    [r"\bmore (easy|big|small|fast|cheap|old|tall)\b", r'$1er', 'الصفات القصيرة تأخذ er: easier, bigger.'],
  ];
  for (final r in rules) {
    final re = RegExp(r[0], caseSensitive: false);
    if (!re.hasMatch(out)) continue;
    out = out.replaceAllMapped(re, (m) {
      var rep = r[1];
      for (var g = 1; g <= m.groupCount; g++) {
        rep = rep.replaceAll('\$$g', m.group(g) ?? '');
      }
      return rep;
    });
    note ??= r[2];
  }
  out = out.replaceAll('mak a mistake', 'make a mistake').replaceAll('easyer', 'easier').replaceAll('biger', 'bigger');

  if (out == text || note == null) return null;
  return GrammarHit(out, note!);
}

/// الاتصال بخادم الذكاء الاصطناعي الخاص بك (اختياري).
///
/// التطبيق لا يحتوي أي مفتاح API. ضع رابط خادمك في الإعدادات، والخادم هو من يحمل المفتاح
/// ويتصل بنموذج الذكاء الاصطناعي. مثال جاهز في مجلد backend_example.
///
/// الطلب (POST بصيغة JSON):
///   محادثة: {"kind":"chat","level":"A2","scenario":"...","history":[{"role":"coach|learner","text":"..."}]}
///   قصة:    {"kind":"story","level":"A2","kids":false}
/// الرد:
///   محادثة: {"reply":"...","corrected":"...","note_ar":"..."}
///   قصة:    {"title":"...","lines":["..."],"vocab":[{"en":"..","ar":".."}],"quiz":[{"q":"..","options":["..",".."],"answer":0}]}
class RemoteAi {
  /// رابط المستخدم إن وضعه بنفسه، وإلا الرابط المنشور من لوحة الإدارة.
  static String get endpoint {
    final mine = AppStore.I.aiEndpoint.trim();
    return mine.isNotEmpty ? mine : ContentFeed.I.aiEndpoint;
  }

  static bool get enabled => endpoint.isNotEmpty;

  /// مفتاح خفيف يقابل APP_SECRET في الخادم (ليس سراً حقيقياً، الحماية الفعلية هي الحدود اليومية في الخادم).
  static const appKey = String.fromEnvironment('AI_APP_KEY');
  static String? _device;

  static Future<String> _deviceId() async {
    if (_device != null) return _device!;
    final p = await SharedPreferences.getInstance();
    var id = p.getString('ai_device');
    if (id == null) {
      final r = Random.secure();
      id = List.generate(20, (_) => r.nextInt(36).toRadixString(36)).join();
      await p.setString('ai_device', id);
    }
    return _device = id;
  }

  static Future<Map<String, dynamic>?> _post(Map<String, dynamic> body) async {
    final url = endpoint;
    if (url.isEmpty) return null;
    try {
      final res = await http
          .post(Uri.parse(url),
              headers: {'Content-Type': 'application/json', 'x-device': await _deviceId(), if (appKey.isNotEmpty) 'x-app-key': appKey},
              body: jsonEncode(body))
          .timeout(const Duration(seconds: 25));
      if (res.statusCode != 200) return null;
      final j = jsonDecode(utf8.decode(res.bodyBytes));
      return j is Map<String, dynamic> ? j : null;
    } catch (_) {
      return null;
    }
  }

  /// يعيد null إذا لم يُضبط الخادم أو فشل الاتصال، فيعود التطبيق للوضع المحلي.
  static Future<Map<String, dynamic>?> chat({
    required String level,
    required String scenario,
    required List<Map<String, String>> history,
  }) async {
    final j = await _post({'kind': 'chat', 'level': level, 'scenario': scenario, 'history': history});
    if (j == null || j['reply'] is! String || (j['reply'] as String).trim().isEmpty) return null;
    return j;
  }

  /// تقييم إجابة مقابلة. يعيد null عند الفشل فيبقى التقييم المحلي.
  static Future<Map<String, dynamic>?> review({required String question, required String model, required String said}) async {
    if (said.trim().isEmpty) return null;
    final j = await _post({'kind': 'review', 'question': question, 'model': model, 'said': said});
    if (j == null || j['score'] is! num) return null;
    return j;
  }

  /// شرح خطأ بالعربية مع أمثلة. يعيد null عند الفشل.
  static Future<Map<String, dynamic>?> explain({required String wrong, required String correct}) async {
    final j = await _post({'kind': 'explain', 'wrong': wrong, 'correct': correct});
    if (j == null || (j['explain_ar'] ?? '').toString().trim().isEmpty) return null;
    return j;
  }

  static Future<Story?> story({required String level, required bool kids}) async {
    final j = await _post({'kind': 'story', 'level': level, 'kids': kids});
    if (j == null) return null;
    try {
      final lines = (j['lines'] as List).map((e) => e.toString()).where((e) => e.trim().isNotEmpty).toList();
      if (lines.isEmpty) return null;
      final vocab = ((j['vocab'] as List?) ?? [])
          .whereType<Map>()
          .map((e) => Vocab((e['en'] ?? '').toString(), (e['ar'] ?? '').toString()))
          .where((v) => v.en.isNotEmpty)
          .toList();
      final quiz = <Quiz>[];
      for (final q in ((j['quiz'] as List?) ?? []).whereType<Map>()) {
        final options = ((q['options'] as List?) ?? []).map((e) => e.toString()).toList();
        final answer = (q['answer'] as num?)?.toInt() ?? 0;
        if (options.length >= 2 && answer >= 0 && answer < options.length) {
          quiz.add(Quiz((q['q'] ?? '').toString(), options, answer));
        }
      }
      return Story(title: (j['title'] ?? 'Story').toString(), lines: lines, vocab: vocab, quiz: quiz, fromAi: true);
    } catch (_) {
      return null;
    }
  }
}
