import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// رقم اليوم الحالي (عدد الأيام منذ 1970) حسب تاريخ الجهاز المحلي.
int todayNumber() {
  final n = DateTime.now();
  return DateTime.utc(n.year, n.month, n.day).millisecondsSinceEpoch ~/ 86400000;
}

/// خطأ محفوظ في «دفتر أخطائي».
class Mistake {
  Mistake({
    required this.id,
    required this.kind,
    required this.prompt,
    required this.wrong,
    required this.correct,
    required this.note,
    this.strength = 0,
    this.dueDay = 0,
  });

  final String id;

  /// grammar | vocab | pron
  final String kind;
  final String prompt;
  final String wrong;
  final String correct;
  final String note;

  /// عدد مرات الإجابة الصحيحة المتتالية. عند 3 يعتبر الخطأ متقَناً.
  int strength;

  /// رقم اليوم الذي تحين فيه المراجعة التالية.
  int dueDay;

  bool get mastered => strength >= 3;

  Map<String, dynamic> toJson() => {
        'id': id,
        'kind': kind,
        'prompt': prompt,
        'wrong': wrong,
        'correct': correct,
        'note': note,
        'strength': strength,
        'dueDay': dueDay,
      };

  factory Mistake.fromJson(Map<String, dynamic> j) => Mistake(
        id: (j['id'] ?? '').toString(),
        kind: (j['kind'] ?? 'vocab').toString(),
        prompt: (j['prompt'] ?? '').toString(),
        wrong: (j['wrong'] ?? '').toString(),
        correct: (j['correct'] ?? '').toString(),
        note: (j['note'] ?? '').toString(),
        strength: (j['strength'] as num?)?.toInt() ?? 0,
        dueDay: (j['dueDay'] as num?)?.toInt() ?? 0,
      );
}

/// كلمة محفوظة في «مفرداتي» وتُراجع بالتكرار المتباعد.
class SavedWord {
  SavedWord({required this.en, required this.ar, this.strength = 0, this.dueDay = 0});

  final String en;
  final String ar;

  /// عدد مرات التذكر الصحيح المتتالية. عند 4 تعتبر الكلمة محفوظة.
  int strength;
  int dueDay;

  bool get mastered => strength >= 4;

  Map<String, dynamic> toJson() => {'en': en, 'ar': ar, 'strength': strength, 'dueDay': dueDay};

  factory SavedWord.fromJson(Map<String, dynamic> j) => SavedWord(
        en: (j['en'] ?? '').toString(),
        ar: (j['ar'] ?? '').toString(),
        strength: (j['strength'] as num?)?.toInt() ?? 0,
        dueDay: (j['dueDay'] as num?)?.toInt() ?? 0,
      );
}

/// حالة التطبيق كلها، محفوظة على الجهاز في مفتاح واحد.
class AppStore extends ChangeNotifier {
  AppStore._();
  static final AppStore I = AppStore._();
  static const _key = 'kalima_state_v1';

  SharedPreferences? _prefs;

  /// '' = لم يختر بعد، 'adult' أو 'kid'
  String section = '';

  /// '' = لم يُجرِ اختبار المستوى، وإلا A1 أو A2 أو B1
  String level = '';

  int _streak = 0;
  int lastActiveDay = 0;
  int _todaySeconds = 0;
  int _secondsDay = 0;
  int totalSeconds = 0;
  int goalMinutes = 10;

  int stars = 0;
  int storiesRead = 0;
  int talksDone = 0;
  int bestWpm = 0;
  int missionDoneDay = 0;

  bool reminderOn = false;
  int reminderHour = 20;
  int reminderMinute = 0;

  /// رابط خادم الذكاء الاصطناعي (اختياري). فارغ = الوضع المجاني بلا إنترنت.
  String aiEndpoint = '';

  List<String> doneLessons = [];
  List<Mistake> mistakes = [];
  List<SavedWord> words = [];
  int bestStreak = 0;

  /// الثواني التي قضاها المتعلم في كل يوم (آخر 60 يوماً)، للرسم الأسبوعي.
  final Map<int, int> _history = {};

  /// عدادات عامة للأنشطة (say, cloze ...) تُستخدم في الشارات ونقاط الخبرة.
  final Map<String, int> counters = {};

  // ---------- قراءة وحفظ ----------

  Future<void> load() async {
    try {
      _prefs = await SharedPreferences.getInstance();
      final raw = _prefs!.getString(_key);
      if (raw == null || raw.isEmpty) return;
      final j = jsonDecode(raw) as Map<String, dynamic>;
      section = (j['section'] ?? '').toString();
      level = (j['level'] ?? '').toString();
      _streak = (j['streak'] as num?)?.toInt() ?? 0;
      lastActiveDay = (j['lastActiveDay'] as num?)?.toInt() ?? 0;
      _todaySeconds = (j['todaySeconds'] as num?)?.toInt() ?? 0;
      _secondsDay = (j['secondsDay'] as num?)?.toInt() ?? 0;
      totalSeconds = (j['totalSeconds'] as num?)?.toInt() ?? 0;
      goalMinutes = (j['goalMinutes'] as num?)?.toInt() ?? 10;
      stars = (j['stars'] as num?)?.toInt() ?? 0;
      storiesRead = (j['storiesRead'] as num?)?.toInt() ?? 0;
      talksDone = (j['talksDone'] as num?)?.toInt() ?? 0;
      bestWpm = (j['bestWpm'] as num?)?.toInt() ?? 0;
      missionDoneDay = (j['missionDoneDay'] as num?)?.toInt() ?? 0;
      reminderOn = j['reminderOn'] == true;
      reminderHour = (j['reminderHour'] as num?)?.toInt() ?? 20;
      reminderMinute = (j['reminderMinute'] as num?)?.toInt() ?? 0;
      aiEndpoint = (j['aiEndpoint'] ?? '').toString();
      doneLessons = ((j['doneLessons'] as List?) ?? []).map((e) => e.toString()).toList();
      mistakes = ((j['mistakes'] as List?) ?? [])
          .whereType<Map>()
          .map((e) => Mistake.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      words = ((j['words'] as List?) ?? [])
          .whereType<Map>()
          .map((e) => SavedWord.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      bestStreak = (j['bestStreak'] as num?)?.toInt() ?? 0;
      attempts = ((j['attempts'] as List?) ?? []).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      final h = j['history'];
      if (h is Map) {
        h.forEach((k, v) {
          final d = int.tryParse(k.toString());
          final sec = (v as num?)?.toInt();
          if (d != null && sec != null) _history[d] = sec;
        });
      }
      final c = j['counters'];
      if (c is Map) {
        c.forEach((k, v) {
          final n = (v as num?)?.toInt();
          if (n != null) counters[k.toString()] = n;
        });
      }
    } catch (_) {
      // بيانات تالفة أو أول تشغيل: نبدأ بالقيم الافتراضية.
    }
  }

  Future<void> _save() async {
    try {
      final p = _prefs ?? await SharedPreferences.getInstance();
      _prefs = p;
      await p.setString(
        _key,
        jsonEncode({
          'section': section,
          'level': level,
          'streak': _streak,
          'lastActiveDay': lastActiveDay,
          'todaySeconds': _todaySeconds,
          'secondsDay': _secondsDay,
          'totalSeconds': totalSeconds,
          'goalMinutes': goalMinutes,
          'stars': stars,
          'storiesRead': storiesRead,
          'talksDone': talksDone,
          'bestWpm': bestWpm,
          'missionDoneDay': missionDoneDay,
          'reminderOn': reminderOn,
          'reminderHour': reminderHour,
          'reminderMinute': reminderMinute,
          'aiEndpoint': aiEndpoint,
          'doneLessons': doneLessons,
          'mistakes': mistakes.map((m) => m.toJson()).toList(),
          'words': words.map((w) => w.toJson()).toList(),
          'bestStreak': bestStreak,
          'attempts': attempts,
          'history': _history.map((k, v) => MapEntry(k.toString(), v)),
          'counters': counters,
        }),
      );
    } catch (_) {}
  }

  void _commit() {
    notifyListeners();
    _save();
  }

  // ---------- السلسلة والوقت ----------

  /// سلسلة الأيام المتتالية. تصبح صفراً إذا مرّ يوم كامل بلا نشاط.
  int get streak => lastActiveDay >= todayNumber() - 1 ? _streak : 0;

  bool get activeToday => lastActiveDay == todayNumber();

  int get todaySeconds => _secondsDay == todayNumber() ? _todaySeconds : 0;

  int get todayMinutes => todaySeconds ~/ 60;

  double get goalProgress => min(1.0, todaySeconds / (goalMinutes * 60));

  /// تُستدعى عند إكمال أي نشاط تعليمي.
  void markActive() {
    final d = todayNumber();
    if (lastActiveDay == d) return;
    _streak = lastActiveDay == d - 1 ? _streak + 1 : 1;
    if (_streak > bestStreak) bestStreak = _streak;
    lastActiveDay = d;
    _commit();
  }

  void addSeconds(int s) {
    if (s <= 0) return;
    final d = todayNumber();
    if (_secondsDay != d) {
      _secondsDay = d;
      _todaySeconds = 0;
    }
    _todaySeconds += s;
    totalSeconds += s;
    _history[d] = (_history[d] ?? 0) + s;
    _history.removeWhere((k, v) => k < d - 60);
    _commit();
  }

  // ---------- الإعدادات ----------

  void setSection(String s) {
    section = s;
    _commit();
  }

  void setLevel(String l) {
    level = l;
    _commit();
  }

  void setGoal(int minutes) {
    goalMinutes = minutes;
    _commit();
  }

  void setReminder({required bool on, int? hour, int? minute}) {
    reminderOn = on;
    if (hour != null) reminderHour = hour;
    if (minute != null) reminderMinute = minute;
    _commit();
  }

  void setAiEndpoint(String url) {
    aiEndpoint = url.trim();
    _commit();
  }

  // ---------- التقدم ----------

  void completeLesson(String id) {
    if (!doneLessons.contains(id)) doneLessons.add(id);
    _markToday('learn');
    markActive();
    _commit();
  }

  void addStars(int n) {
    stars += n;
    _commit();
  }

  void storyRead() {
    storiesRead++;
    _markToday('learn');
    markActive();
    _commit();
  }

  void talkDone() {
    talksDone++;
    _markToday('speak');
    markActive();
    _commit();
  }

  void reportWpm(int wpm) {
    if (wpm > bestWpm) bestWpm = wpm;
    _markToday('speak');
    markActive();
    _commit();
  }

  bool get missionDoneToday => missionDoneDay == todayNumber();

  void completeMission() {
    missionDoneDay = todayNumber();
    stars += 1;
    markActive();
    _commit();
  }

  // ---------- دفتر أخطائي ----------

  void addMistake({
    required String kind,
    required String prompt,
    required String wrong,
    required String correct,
    String note = '',
  }) {
    if (correct.trim().isEmpty) return;
    final id = '$kind|${correct.trim().toLowerCase()}';
    final i = mistakes.indexWhere((m) => m.id == id);
    if (i >= 0) {
      mistakes[i].strength = 0;
      mistakes[i].dueDay = todayNumber();
    } else {
      mistakes.insert(
        0,
        Mistake(
          id: id,
          kind: kind,
          prompt: prompt,
          wrong: wrong,
          correct: correct.trim(),
          note: note,
          dueDay: todayNumber(),
        ),
      );
    }
    if (mistakes.length > 300) mistakes.removeRange(300, mistakes.length);
    _commit();
  }

  List<Mistake> get dueMistakes {
    final d = todayNumber();
    return mistakes.where((m) => !m.mastered && m.dueDay <= d).toList();
  }

  int get masteredCount => mistakes.where((m) => m.mastered).length;

  /// المراجعة المتباعدة: صح = غداً ثم بعد 3 أيام ثم بعد 7 ثم يُتقن. خطأ = يعود غداً من البداية.
  void gradeMistake(Mistake m, bool ok) {
    final d = todayNumber();
    if (ok) {
      m.strength += 1;
      const gaps = [1, 3, 7];
      m.dueDay = d + gaps[min(m.strength - 1, 2)];
    } else {
      m.strength = 0;
      m.dueDay = d + 1;
    }
    _markToday('review');
    markActive();
    _commit();
  }

  // ---------- مفرداتي ----------

  bool hasWord(String en) {
    final key = en.trim().toLowerCase();
    return words.any((w) => w.en.toLowerCase() == key);
  }

  /// يحفظ الكلمة إن لم تكن محفوظة. يرجع true إذا أُضيفت الآن.
  bool saveWord(String en, String ar) {
    final e = en.trim();
    if (e.isEmpty || hasWord(e)) return false;
    words.insert(0, SavedWord(en: e, ar: ar.trim(), dueDay: todayNumber()));
    if (words.length > 500) words.removeRange(500, words.length);
    _commit();
    return true;
  }

  void removeWord(SavedWord w) {
    words.remove(w);
    _commit();
  }

  List<SavedWord> get dueWords {
    final d = todayNumber();
    return words.where((w) => !w.mastered && w.dueDay <= d).toList();
  }

  int get masteredWords => words.where((w) => w.mastered).length;

  /// تذكّر صحيح = بعد يوم ثم 2 ثم 4 ثم 8 ثم تُحفظ. نسيان = تعود غداً من البداية.
  void gradeWord(SavedWord w, bool ok) {
    final d = todayNumber();
    if (ok) {
      w.strength += 1;
      const gaps = [1, 2, 4, 8];
      w.dueDay = d + gaps[min(w.strength - 1, 3)];
    } else {
      w.strength = 0;
      w.dueDay = d + 1;
    }
    _markToday('review');
    markActive();
    _commit();
  }

  // ---------- العدادات والخبرة ----------

  int count(String key) => counters[key] ?? 0;

  /// يضبط قيمة عداد مباشرة (مثل حد وقت الطفل اليومي).
  void setCount(String key, int value) {
    counters[key] = value;
    _commit();
  }

  void bump(String key, [int n = 1]) {
    counters[key] = count(key) + n;
    if (key == 'say' || key == 'shadow') _markToday('speak');
    markActive();
    _commit();
  }

  /// علامات «خطة اليوم»: learn و speak و review. تُمسح تلقائياً في اليوم التالي.
  bool doneToday(String part) => count('day:${todayNumber()}:$part') > 0;

  void _markToday(String part) {
    final prefix = 'day:${todayNumber()}:';
    counters.removeWhere((k, v) => k.startsWith('day:') && !k.startsWith(prefix));
    counters['$prefix$part'] = 1;
  }

  // ---------- القراءة ----------

  bool isRead(String id) => count('r:$id') > 0;

  void markRead(String id) {
    if (isRead(id)) return;
    counters['r:$id'] = 1;
    counters['reads'] = count('reads') + 1;
    _markToday('learn');
    markActive();
    _commit();
  }

  int readInCat(String cat) => counters.keys.where((k) => k.startsWith('r:${cat}_')).length;

  // ---------- البودكاست ----------

  bool isHeard(String id) => count('p:$id') > 0;

  void markHeard(String id) {
    if (isHeard(id)) return;
    counters['p:$id'] = 1;
    counters['pods'] = count('pods') + 1;
    _markToday('learn');
    markActive();
    _commit();
  }

  int heardInShow(String cat) => counters.keys.where((k) => k.startsWith('p:${cat}_')).length;

  // ---------- محاولات اختبار المستوى ----------

  /// كل محاولة: {day, score, total, level}. الأحدث أولاً.
  List<Map<String, dynamic>> attempts = [];

  void addAttempt(int score, int total, String lvl) {
    attempts.insert(0, {'day': todayNumber(), 'score': score, 'total': total, 'level': lvl});
    if (attempts.length > 20) attempts.removeRange(20, attempts.length);
    _commit();
  }

  int get planDone => ['learn', 'speak', 'review'].where(doneToday).length;

  /// مجموع الخبرة محسوب من التقدم نفسه، فلا يحتاج حفظاً منفصلاً.
  int get xp =>
      stars * 5 +
      (totalSeconds ~/ 60) * 2 +
      doneLessons.length * 20 +
      storiesRead * 10 +
      talksDone * 15 +
      masteredCount * 5 +
      masteredWords * 5 +
      words.length +
      count('say') * 3 +
      count('cloze') * 2 +
      count('reads') * 8 +
      count('pods') * 8 +
      count('build') * 2;

  /// دقائق كل يوم من آخر [n] يوماً، الأقدم أولاً واليوم الحالي أخيراً.
  List<int> lastDaysSeconds(int n) {
    final d = todayNumber();
    return [for (var i = n - 1; i >= 0; i--) _history[d - i] ?? 0];
  }

  Future<void> resetAll() async {
    section = '';
    level = '';
    _streak = 0;
    lastActiveDay = 0;
    _todaySeconds = 0;
    _secondsDay = 0;
    totalSeconds = 0;
    goalMinutes = 10;
    stars = 0;
    storiesRead = 0;
    talksDone = 0;
    bestWpm = 0;
    missionDoneDay = 0;
    doneLessons = [];
    mistakes = [];
    words = [];
    bestStreak = 0;
    attempts = [];
    _history.clear();
    counters.clear();
    _commit();
  }
}
