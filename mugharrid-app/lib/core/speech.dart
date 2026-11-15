import 'package:shared_preferences/shared_preferences.dart';
import 'dart:math';

import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:http/http.dart' as http;
import 'package:speech_to_text/speech_to_text.dart';

import 'feed.dart';

/// النطق (TTS) والتعرف على الكلام (STT) من محركات الجوال نفسه، بلا إنترنت وبلا تكلفة.
class Speech {
  Speech._();
  static final Speech I = Speech._();

  final FlutterTts _tts = FlutterTts();
  final SpeechToText _stt = SpeechToText();

  bool _ttsReady = false;
  bool sttAvailable = false;

  /// يُستدعى عند تغير حالة الاستماع: listening أو notListening أو done.
  void Function(String status)? onStatus;

  Future<void> _initTts() async {
    if (_ttsReady) return;
    try {
      // على أندرويد: محرك Google أوضح وأقرب للبشري من محركات الشركات الأخرى إن كان موجوداً.
      try {
        final engines = await _tts.getEngines;
        if (engines is List && engines.contains('com.google.android.tts')) {
          await _tts.setEngine('com.google.android.tts');
        }
      } catch (_) {}
      await _tts.setLanguage('en-US');
      await _tts.setPitch(1.0);
      await _tts.awaitSpeakCompletion(true);
    } catch (_) {}
    _ttsReady = true;
  }

  // ---------- جودة الصوت ----------

  /// درجة جودة صوت: كلما زادت كان أقرب للبشري. الأصوات «الشبكية/العصبية/المحسّنة» تتقدم.
  static int voiceScore(Map v) {
    final name = (v['name'] ?? '').toString().toLowerCase();
    final loc = (v['locale'] ?? '').toString().toLowerCase().replaceAll('_', '-');
    final quality = (v['quality'] ?? '').toString().toLowerCase();
    var s = 0;
    if (loc == 'en-us') {
      s += 30;
    } else if (loc == 'en-gb') {
      s += 22;
    } else if (loc == 'en-au' || loc == 'en-ca') {
      s += 12;
    } else if (loc.startsWith('en')) {
      s += 5;
    }
    for (final k in const ['neural', 'wavenet', 'studio', 'natural', 'premium', 'enhanced', 'network']) {
      if (name.contains(k) || quality.contains(k)) s += 25;
    }
    if (name.contains('compact') || name.contains('espeak') || name.contains('novelty')) s -= 60;
    const warm = ['samantha', 'ava', 'allison', 'nicky', 'zoe', 'evan', 'daniel', 'serena', 'karen', 'susan', 'aaron'];
    for (final w in warm) {
      if (name.contains(w)) {
        s += 12;
        break;
      }
    }
    return s;
  }

  /// أفضل صوت إنجليزي على الجهاز، أو null إن لم يوجد.
  Future<Map<String, String>?> bestVoice() async {
    try {
      await _initTts();
      final raw = await _tts.getVoices;
      if (raw is! List) return null;
      Map? best;
      var top = -1000;
      for (final v in raw) {
        if (v is! Map) continue;
        final loc = (v['locale'] ?? '').toString().toLowerCase();
        if (!loc.startsWith('en')) continue;
        final sc = voiceScore(v);
        if (sc > top) {
          top = sc;
          best = v;
        }
      }
      if (best == null) return null;
      return {'name': (best['name'] ?? '').toString(), 'locale': (best['locale'] ?? '').toString()};
    } catch (_) {
      return null;
    }
  }

  static const _rateKey = 'tts_rate_scale';
  double _rateScale = 1.0;
  bool _rateLoaded = false;

  double get rateScale => _rateScale;

  Future<void> _loadRate() async {
    if (_rateLoaded) return;
    _rateLoaded = true;
    try {
      final p = await SharedPreferences.getInstance();
      _rateScale = (p.getDouble(_rateKey) ?? 1.0).clamp(0.6, 1.3).toDouble();
    } catch (_) {}
  }

  /// سرعة عامة لكل الأصوات: 0.6 بطيء جداً ... 1.0 عادي ... 1.3 أسرع.
  Future<void> setRateScale(double v) async {
    _rateScale = v.clamp(0.6, 1.3).toDouble();
    _rateLoaded = true;
    try {
      final p = await SharedPreferences.getInstance();
      await p.setDouble(_rateKey, _rateScale);
    } catch (_) {}
  }

  static const _voiceKey = 'tts_voice';
  bool _voiceLoaded = false;

  /// أسماء الأصوات الإنجليزية المتاحة على الجوال، كل عنصر {name, locale}.
  Future<List<Map<String, String>>> englishVoices() async {
    try {
      await _initTts();
      final raw = await _tts.getVoices;
      final out = <Map<String, String>>[];
      if (raw is List) {
        for (final v in raw) {
          if (v is! Map) continue;
          final name = (v['name'] ?? '').toString();
          final locale = (v['locale'] ?? '').toString();
          if (name.isNotEmpty && locale.toLowerCase().startsWith('en')) {
            out.add({'name': name, 'locale': locale, 'score': voiceScore(v).toString()});
          }
        }
      }
      // الأوضح والأقرب للبشري أولاً.
      out.sort((a, b) => int.parse(b['score']!).compareTo(int.parse(a['score']!)));
      return out;
    } catch (_) {
      return [];
    }
  }

  Future<String> savedVoice() async {
    try {
      final p = await SharedPreferences.getInstance();
      return p.getString(_voiceKey) ?? '';
    } catch (_) {
      return '';
    }
  }

  /// يختار صوتاً ويحفظه. اسم فارغ = صوت الجوال الافتراضي.
  Future<void> setVoice(String name, String locale) async {
    try {
      final p = await SharedPreferences.getInstance();
      await p.setString(_voiceKey, name.isEmpty ? '' : '$name|$locale');
      await _initTts();
      if (name.isNotEmpty) await _tts.setVoice({'name': name, 'locale': locale});
      _voiceLoaded = true;
    } catch (_) {}
  }

  Future<void> _applySavedVoice() async {
    if (_voiceLoaded) return;
    _voiceLoaded = true;
    try {
      final p = await SharedPreferences.getInstance();
      if (!p.containsKey(_voiceKey)) {
        // أول تشغيل: اختر أوضح صوت متاح تلقائياً.
        final want = ContentFeed.I.voiceName.toLowerCase();
        if (want.isNotEmpty) {
          try {
            final raw = await _tts.getVoices;
            if (raw is List) {
              for (final v in raw) {
                if (v is Map && (v['name'] ?? '').toString().toLowerCase().contains(want) && (v['locale'] ?? '').toString().toLowerCase().startsWith('en')) {
                  await _tts.setVoice({'name': v['name'].toString(), 'locale': v['locale'].toString()});
                  return;
                }
              }
            }
          } catch (_) {}
        }
        final b = await bestVoice();
        if (b != null && (b['name'] ?? '').isNotEmpty) {
          await _tts.setVoice({'name': b['name']!, 'locale': b['locale']!});
        }
        return;
      }
    } catch (_) {}
    final v = await savedVoice();
    final parts = v.split('|');
    if (parts.length == 2 && parts[0].isNotEmpty) {
      try {
        await _tts.setVoice({'name': parts[0], 'locale': parts[1]});
      } catch (_) {}
    }
  }

  int _sayId = 0;

  /// يهيّئ النص ليُنطق بإيقاع أطبع: يوسّع الاختصارات ويحافظ على علامات الوقف.
  static String _prep(String t) {
    var x = t.replaceAll('\n', '. ').replaceAll(RegExp(r'\s+'), ' ').trim();
    const abbr = {'Mr.': 'Mister', 'Mrs.': 'Missus', 'Dr.': 'Doctor', 'vs.': 'versus', 'etc.': 'et cetera', 'e.g.': 'for example', 'i.e.': 'that is'};
    abbr.forEach((k, v) => x = x.replaceAll(k, v));
    return x;
  }

  /// ينطق نصاً إنجليزياً وينتظر حتى ينتهي. rate: 0.45 عادي، 0.3 بطيء.
  /// يقسّم النص إلى جمل بفواصل قصيرة بينها فيبدو أقرب لحديث إنسان.
  // ===== صوت سحابي من رابط يحدده المشرف =====
  final AudioPlayer _player = AudioPlayer();
  final Map<String, Uint8List> _audioCache = {};

  Future<Uint8List?> _fetchAudio(String url) async {
    final hit = _audioCache[url];
    if (hit != null) return hit;
    try {
      final r = await http.get(Uri.parse(url)).timeout(const Duration(seconds: 12));
      if (r.statusCode != 200 || r.bodyBytes.length < 500) return null;
      if (_audioCache.length > 80) _audioCache.remove(_audioCache.keys.first);
      return _audioCache[url] = r.bodyBytes;
    } catch (_) {
      return null;
    }
  }

  /// يشغّل الجملة من الصوت السحابي. يعيد false إن فشل لنرجع لصوت الجوال.
  Future<bool> _sayCloud(String part, double rate) async {
    final tpl = ContentFeed.I.voiceUrl;
    if (tpl.isEmpty) return false;
    final url = tpl.replaceAll('{text}', Uri.encodeComponent(part)).replaceAll('{lang}', 'en-US');
    final bytes = await _fetchAudio(url);
    if (bytes == null) return false;
    try {
      await _player.setPlaybackRate(((rate / 0.45) * _rateScale).clamp(0.6, 1.4).toDouble());
      final done = _player.onPlayerComplete.first;
      await _player.play(BytesSource(bytes));
      await done.timeout(const Duration(seconds: 40));
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> say(String text, {double rate = 0.45, double pitch = 1.0}) async {
    if (text.trim().isEmpty) return;
    rate = ContentFeed.I.ttsRate ?? rate;
    if (pitch == 1.0 && ContentFeed.I.ttsPitch != null) pitch = ContentFeed.I.ttsPitch!;
    try {
      await _initTts();
      await _applySavedVoice();
      await _loadRate();
      await _tts.stop();
      await _player.stop();
      final id = ++_sayId;
      await _tts.setSpeechRate((rate * _rateScale).clamp(0.15, 0.9).toDouble());
      await _tts.setPitch(pitch);
      final parts = _prep(text).split(RegExp(r'(?<=[.!?;:])\s+')).where((e) => e.trim().isNotEmpty).toList();
      for (var i = 0; i < parts.length; i++) {
        if (id != _sayId) return;
        if (ContentFeed.I.voiceUrl.isNotEmpty) {
          await _loadRate();
          if (await _sayCloud(parts[i], rate)) {
            if (i < parts.length - 1 && id == _sayId) await Future<void>.delayed(const Duration(milliseconds: 180));
            continue;
          }
          if (id != _sayId) return;
        }
        await _tts.speak(parts[i]);
        if (i < parts.length - 1 && id == _sayId) {
          await Future<void>.delayed(const Duration(milliseconds: 220));
        }
      }
    } catch (_) {}
  }

  Future<void> stopSpeaking() async {
    try {
      _sayId++;
      await _tts.stop();
      await _player.stop();
    } catch (_) {}
  }

  /// يجهز الميكروفون ويطلب الإذن أول مرة. يعيد false إذا رُفض الإذن أو لا توجد خدمة تعرف على الكلام.
  Future<bool> ensureStt() async {
    if (sttAvailable) return true;
    try {
      sttAvailable = await _stt.initialize(
        onError: (e) => onStatus?.call('done'),
        onStatus: (s) => onStatus?.call(s),
      );
    } catch (_) {
      sttAvailable = false;
    }
    return sttAvailable;
  }

  bool get isListening => _stt.isListening;

  /// يبدأ الاستماع بالإنجليزية. onText يستقبل النص الجزئي ثم النهائي.
  Future<bool> listen({
    required void Function(String text, bool isFinal) onText,
    Duration listenFor = const Duration(seconds: 15),
    Duration pauseFor = const Duration(seconds: 3),
  }) async {
    if (!await ensureStt()) return false;
    try {
      await stopSpeaking();
      await _stt.listen(
        onResult: (result) => onText(result.recognizedWords, result.finalResult),
        localeId: 'en_US',
        listenFor: listenFor,
        pauseFor: pauseFor,
        listenOptions: SpeechListenOptions(partialResults: true, cancelOnError: true),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> stopListening() async {
    try {
      await _stt.stop();
    } catch (_) {}
  }
}

// ---------- مقارنة ما قاله المتعلم بالجملة المطلوبة ----------

class WordCheck {
  const WordCheck(this.word, this.ok);
  final String word;
  final bool ok;
}

class PronResult {
  const PronResult(this.words, this.percent);
  final List<WordCheck> words;
  final int percent;

  List<String> get missed => words.where((w) => !w.ok).map((w) => _norm(w.word)).where((w) => w.isNotEmpty).toList();
}

String _norm(String w) => w.toLowerCase().replaceAll(RegExp(r"[^a-z0-9]"), '');

List<String> splitWords(String s) => s.split(RegExp(r'\s+')).map(_norm).where((w) => w.isNotEmpty).toList();

int countWords(String s) => splitWords(s).length;

/// يحدد أي كلمات الجملة المطلوبة ظهرت بالترتيب فيما سمعه الجوال.
/// هذا يقيس هل فُهمت الكلمة، وليس تحليلاً صوتياً دقيقاً لمخارج الحروف.
PronResult comparePronunciation(String target, String heard) {
  final display = target.split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
  final t = display.map(_norm).toList();
  final h = splitWords(heard);
  final n = t.length;
  final m = h.length;
  final dp = List.generate(n + 1, (_) => List<int>.filled(m + 1, 0));
  for (var i = n - 1; i >= 0; i--) {
    for (var j = m - 1; j >= 0; j--) {
      dp[i][j] = t[i] == h[j] ? dp[i + 1][j + 1] + 1 : max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  final ok = List<bool>.filled(n, false);
  var i = 0;
  var j = 0;
  while (i < n && j < m) {
    if (t[i] == h[j]) {
      ok[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  final words = <WordCheck>[];
  var good = 0;
  for (var k = 0; k < n; k++) {
    words.add(WordCheck(display[k], ok[k]));
    if (ok[k]) good++;
  }
  final percent = n == 0 ? 0 : (good * 100 / n).round();
  return PronResult(words, percent);
}
