import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../data/content.dart';
import '../data/library.dart';
import '../data/talks.dart';
import 'generators.dart';

/// رابط ملف المحتوى الذي يتحكم به صاحب التطبيق (ملف JSON على أي استضافة https).
/// اتركه فارغاً ليعمل التطبيق بالمحتوى المدمج فقط.
/// عدّل الملف على الاستضافة فتصل الدروس والمواضيع الجديدة لكل المستخدمين بلا تحديث من المتجر.
/// الصيغة مشروحة في ADMIN_AR.md، ومثال جاهز في admin/content.json
const kContentUrl = '';

/// المحتوى المتجدد: يضيف دروساً وجملاً وتعابير ومواضيع من ملف خارجي، ويحفظ آخر نسخة للعمل بلا إنترنت.
class ContentFeed extends ChangeNotifier {
  ContentFeed._();
  static final ContentFeed I = ContentFeed._();
  static const _cacheKey = 'bulbul_feed_v1';

  /// رسالة من الإدارة تظهر أعلى الصفحة الرئيسية (فارغة = لا شيء).
  String announcement = '';

  /// معرّفات الدروس التي جاءت من الملف الخارجي، لتمييزها بعلامة «جديد».
  final Set<String> remoteLessonIds = {};

  int added = 0;

  // ===== إعدادات يتحكم بها المشرف من اللوحة (settings) =====
  /// عناوين البطاقات المخفية من الرئيسية.
  Set<String> hiddenTiles = {};
  /// رابط صوت سحابي: يحتوي {text} و {lang}. فارغ = أصوات الجوال.
  String voiceUrl = '';
  /// اسم صوت الجوال المفضّل افتراضياً (جزء من الاسم يكفي).
  String voiceName = '';
  double? ttsPitch;
  double? ttsRate;
  /// رسالة صيانة: إن لم تكن فارغة يظهر التطبيق مغلقاً مؤقتاً.
  String maintenance = '';

  /// رابط خادم الذكاء الاصطناعي الذي تنشره من لوحة الإدارة، يُستعمل لكل المستخدمين.
  String aiEndpoint = '';

  /// إصدار جديد من التطبيق: {build, version, url, notes, force}. فارغ = لا تحديث.
  Map<String, dynamic> update = {};

  /// إشعارات من الإدارة: [{id, title, body, url}] تظهر لكل مستخدم مرة واحدة.
  List<Map<String, String>> notices = [];

  /// يُستدعى عند التشغيل: يطبق النسخة المحفوظة فوراً ثم يحدّث من الإنترنت في الخلفية.
  Future<void> start() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cached = prefs.getString(_cacheKey);
      if (cached != null && cached.isNotEmpty) _apply(cached);
      // المصدر الأول: لوحة التحكم (مستند config/content في Firestore).
      try {
        final doc = await FirebaseFirestore.instance.collection('config').doc('content').get().timeout(const Duration(seconds: 12));
        final raw = doc.data()?['json'];
        if (raw is String && raw.isNotEmpty && _apply(raw)) {
          await prefs.setString(_cacheKey, raw);
          return;
        }
      } catch (_) {}
      if (kContentUrl.isEmpty) return;
      final res = await http.get(Uri.parse(kContentUrl)).timeout(const Duration(seconds: 15));
      if (res.statusCode != 200) return;
      final body = utf8.decode(res.bodyBytes);
      if (_apply(body)) await prefs.setString(_cacheKey, body);
    } catch (_) {
      // بلا إنترنت أو ملف غير صالح: نكمل بالمحتوى الموجود.
    }
  }

  String _s(Object? v) => (v ?? '').toString().trim();
  List<Map> _maps(Object? v) => v is List ? v.whereType<Map>().toList() : const [];
  List<String> _strings(Object? v) => v is List ? v.map((e) => e.toString()).toList() : const [];

  bool _apply(String raw) {
    try {
      final j = jsonDecode(raw);
      if (j is! Map) return false;
      announcement = _s(j['announcement']);
      final up = j['update'];
      update = up is Map ? Map<String, dynamic>.from(up) : {};
      notices = _maps(j['notices'])
          .map((m) => {'id': _s(m['id']), 'title': _s(m['title']), 'body': _s(m['body']), 'url': _s(m['url'])})
          .where((m) => m['id']!.isNotEmpty && (m['title']!.isNotEmpty || m['body']!.isNotEmpty))
          .toList();
      final st = j['settings'];
      if (st is Map) {
        hiddenTiles = _strings(st['hiddenTiles']).toSet();
        voiceUrl = _s(st['voiceUrl']);
        voiceName = _s(st['voiceName']);
        ttsPitch = (st['pitch'] as num?)?.toDouble();
        ttsRate = (st['rate'] as num?)?.toDouble();
        maintenance = _s(st['maintenance']);
        final ai = _s(st['aiEndpoint']);
        aiEndpoint = ai.startsWith('https://') ? ai : '';
      } else {
        aiEndpoint = '';
        hiddenTiles = {};
        voiceUrl = '';
        voiceName = '';
        ttsPitch = null;
        ttsRate = null;
        maintenance = '';
      }

      for (final m in _maps(j['lessons'])) {
        final id = _s(m['id']);
        if (id.isEmpty || lessons.any((l) => l.id == id)) continue;
        final steps = <LessonStep>[];
        for (final st in _maps(m['steps'])) {
          final type = _s(st['type']) == 'build' ? 'build' : 'mcq';
          final options = _strings(st['options']);
          final words = _strings(st['words']);
          final answer = (st['answer'] as num?)?.toInt() ?? 0;
          if (type == 'mcq' && (options.length < 2 || answer < 0 || answer >= options.length)) continue;
          if (type == 'build' && words.length < 2) continue;
          steps.add(LessonStep(
            type: type,
            promptAr: _s(st['promptAr']),
            why: _s(st['why']),
            en: _s(st['en']),
            options: options,
            answer: answer,
            words: words,
            enOptions: st['enOptions'] == true,
            kind: _s(st['kind']) == 'grammar' ? 'grammar' : 'vocab',
          ));
        }
        if (steps.isEmpty) continue;
        final level = _s(m['level']);
        lessons.add(Lesson(
          id: id,
          level: levelNamesAr.containsKey(level) ? level : 'A1',
          titleAr: _s(m['titleAr']),
          emoji: _s(m['emoji']).isEmpty ? '🆕' : _s(m['emoji']),
          steps: steps,
        ));
        remoteLessonIds.add(id);
        added++;
      }

      for (final m in _maps(j['phrases'])) {
        final en = _s(m['en']);
        if (en.isEmpty || phrases.any((p) => p.en == en)) continue;
        final level = _s(m['level']);
        phrases.add(Phrase(en, _s(m['ar']), levelNamesAr.containsKey(level) ? level : 'A1'));
        added++;
      }

      for (final m in _maps(j['idioms'])) {
        final en = _s(m['en']);
        if (en.isEmpty || idioms.any((i) => i.en == en)) continue;
        idioms.add(Idiom(en, _s(m['ar']), _s(m['example'])));
        added++;
      }

      for (final m in _maps(j['topics'])) {
        final en = _s(m['en']);
        if (en.isEmpty || minuteTopics.any((t) => t.en == en)) continue;
        minuteTopics.add(Topic(en, _s(m['ar'])));
        added++;
      }

      for (final m in _maps(j['kidWords'])) {
        final en = _s(m['en']);
        if (en.isEmpty || kidWords.any((k) => k.en == en)) continue;
        kidWords.add(KidWord(en, _s(m['emoji']).isEmpty ? '⭐' : _s(m['emoji']), _s(m['ar'])));
        added++;
      }

      for (final t in _strings(j['missions'])) {
        if (t.trim().isEmpty || dailyMissions.contains(t)) continue;
        dailyMissions.add(t);
        added++;
      }

      // نصوص قراءة جديدة
      for (final m in _maps(j['readings'])) {
        final cat = _s(m['cat']);
        final title = _s(m['title']);
        final lines = _strings(m['lines']).where((l) => l.trim().isNotEmpty).toList();
        if (!readingCats.any((c) => c.id == cat) || title.isEmpty || lines.isEmpty) continue;
        final id = '${cat}_x_${title.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '_')}';
        final list = Library.extra.putIfAbsent(cat, () => []);
        if (list.any((t) => t.id == id)) continue;
        final quiz = <Quiz>[];
        for (final q in _maps(m['quiz'])) {
          final options = _strings(q['options']);
          final answer = (q['answer'] as num?)?.toInt() ?? 0;
          if (options.length >= 2 && answer >= 0 && answer < options.length) quiz.add(Quiz(_s(q['q']), options, answer));
        }
        final level = _s(m['level']);
        list.add(ReadingText(
          id: id,
          cat: cat,
          level: levelNamesAr.containsKey(level) ? level : 'A2',
          title: title,
          lines: lines,
          vocab: [for (final v in _maps(m['vocab'])) if (_s(v['en']).isNotEmpty) Vocab(_s(v['en']), _s(v['ar']))],
          quiz: quiz,
        ));
        added++;
      }

      // محادثات جديدة
      for (final m in _maps(j['talks'])) {
        final cat = _s(m['cat']);
        final title = _s(m['titleAr']);
        if (!talkCats.any((c) => c.id == cat) || title.isEmpty) continue;
        final turns = <TalkTurn>[];
        for (final t in _maps(m['turns'])) {
          final coach = _s(t['coach']);
          if (coach.isNotEmpty) turns.add(TalkTurn(coach, _strings(t['hints'])));
        }
        if (turns.isEmpty) continue;
        final list = TalkBank.extra.putIfAbsent(cat, () => []);
        if (list.any((t) => t.titleAr == title)) continue;
        list.add(Talk(
          titleAr: title,
          roleAr: _s(m['roleAr']),
          scenarioEn: _s(m['scenarioEn']),
          turns: turns,
          goals: [
            for (final g in _maps(m['goals']))
              if (_s(g['label']).isNotEmpty) TalkGoal(_s(g['label']), _strings(g['keys']).map((k) => k.toLowerCase()).toList()),
          ],
        ));
        added++;
      }

      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }
}
