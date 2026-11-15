import 'package:flutter/material.dart';

import '../core/feed.dart';

import '../core/speech.dart';
import '../core/store.dart';

// هوية «بلبل»: بنفسجي نيلي عميق + برتقالي منقار البلبل + ذهبي للإنجازات.
// الأسماء القديمة (kTeal, kSand...) باقية حتى لا تتغير بقية الملفات: kTeal هو اللون الأساسي.
const kAppName = 'مغرّد';
const kAppSlogan = 'غرّد بالإنجليزية بطلاقة';
const kInk = Color(0xFF1B1840);
const kTeal = Color(0xFF4B3BCB);
const kCoral = Color(0xFFFF6B4A);
const kGold = Color(0xFFFFC233);
const kSand = Color(0xFFF6F5FC);
const kCard = Color(0xFFFFFFFF);
const kLine = Color(0xFFE4E1F3);
const kMuted = Color(0xFF6B6887);
const kTint = Color(0xFFECE9FC);
const kOk = Color(0xFF2E8B57);
const kBad = Color(0xFFC2452D);
const kOkBg = Color(0xFFE6F4EC);
const kBadBg = Color(0xFFFBE9E5);

Future<T?> push<T>(BuildContext context, Widget page) {
  return Navigator.of(context).push<T>(MaterialPageRoute<T>(builder: (_) => page));
}

/// نص إنجليزي يُعرض من اليسار إلى اليمين داخل واجهة عربية.
class En extends StatelessWidget {
  const En(this.text, {super.key, this.style, this.align = TextAlign.left});
  final String text;
  final TextStyle? style;
  final TextAlign align;

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Text(text, style: style, textAlign: align),
    );
  }
}

class AppCard extends StatelessWidget {
  const AppCard({super.key, required this.child, this.onTap, this.color = kCard, this.padding = const EdgeInsets.all(16)});
  final Widget child;
  final VoidCallback? onTap;
  final Color color;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: color,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: kLine)),
        clipBehavior: Clip.antiAlias,
        child: InkWell(onTap: onTap, child: Padding(padding: padding, child: child)),
      ),
    );
  }
}

/// زر النطق: يقرأ النص الإنجليزي بصوت الجوال.
class SpeakButton extends StatelessWidget {
  const SpeakButton(this.text, {super.key, this.slow = false, this.color = kTeal});
  final String text;
  final bool slow;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      tooltip: slow ? 'استمع ببطء' : 'استمع',
      onPressed: () => Speech.I.say(text, rate: slow ? 0.3 : 0.45),
      icon: Icon(slow ? Icons.slow_motion_video : Icons.volume_up_rounded, color: color),
    );
  }
}

/// بطاقة نشاط في الصفحة الرئيسية.
class ActivityTile extends StatelessWidget {
  const ActivityTile({super.key, required this.emoji, required this.title, required this.subtitle, required this.onTap, this.badge});
  final String emoji;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    // المشرف يستطيع إخفاء أي بطاقة من لوحة التحكم.
    final hidden = ContentFeed.I.hiddenTiles;
    if (hidden.isNotEmpty && hidden.any((h) => h.isNotEmpty && title.startsWith(h))) return const SizedBox.shrink();
    return AppCard(
      onTap: onTap,
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: kTint, borderRadius: BorderRadius.circular(14)),
            child: Text(emoji, style: const TextStyle(fontSize: 24)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 16.5, fontWeight: FontWeight.w800, color: kInk)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(fontSize: 13, color: kMuted, height: 1.5)),
              ],
            ),
          ),
          if (badge != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: kCoral, borderRadius: BorderRadius.circular(99)),
              child: Text(badge!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12.5)),
            )
          else
            const Icon(Icons.chevron_left_rounded, color: kMuted),
        ],
      ),
    );
  }
}

/// رسالة ملونة: صح أو خطأ مع الشرح.
class FeedbackBox extends StatelessWidget {
  const FeedbackBox({super.key, required this.ok, required this.text});
  final bool ok;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: ok ? kOkBg : kBadBg, borderRadius: BorderRadius.circular(16)),
      child: Text(text, style: TextStyle(color: ok ? const Color(0xFF1D5C3A) : const Color(0xFF8A2D1C), height: 1.7, fontSize: 14.5)),
    );
  }
}

/// زر اختيار في الأسئلة، يتلون بعد الإجابة.
class OptionButton extends StatelessWidget {
  const OptionButton({super.key, required this.text, required this.onTap, this.state = 0, this.english = false});
  final String text;
  final VoidCallback? onTap;

  /// 0 عادي، 1 صحيح، 2 خطأ
  final int state;
  final bool english;

  @override
  Widget build(BuildContext context) {
    final border = state == 1 ? kOk : (state == 2 ? kBad : kLine);
    final bg = state == 1 ? kOkBg : (state == 2 ? kBadBg : Colors.white);
    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Material(
        color: bg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: border, width: 1.5)),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            child: english
                ? En(text, style: const TextStyle(fontSize: 16.5, fontWeight: FontWeight.w600, color: kInk))
                : Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: kInk)),
          ),
        ),
      ),
    );
  }
}

/// يحسب الوقت الذي يقضيه المتعلم في شاشة النشاط ويضيفه إلى دقائق اليوم.
mixin TimedState<T extends StatefulWidget> on State<T> {
  final Stopwatch _watch = Stopwatch();

  @override
  void initState() {
    super.initState();
    _watch.start();
  }

  @override
  void dispose() {
    _watch.stop();
    final seconds = _watch.elapsed.inSeconds;
    // نؤجل التحديث حتى لا نعيد بناء الواجهة أثناء إغلاق الشاشة.
    Future.microtask(() => AppStore.I.addSeconds(seconds));
    Speech.I.stopSpeaking();
    Speech.I.stopListening();
    Speech.I.onStatus = null;
    super.dispose();
  }
}

/// شعار «بلبل»: طائر داخل فقاعة كلام. مرسوم بالشيفرة فلا يحتاج ملف صورة.
class BulbulLogo extends StatelessWidget {
  const BulbulLogo({super.key, this.size = 56, this.onDark = false});
  final double size;

  /// على خلفية داكنة نرسم الفقاعة فقط بلا المربع الملون.
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    return SizedBox(width: size, height: size, child: CustomPaint(painter: _LogoPainter(onDark)));
  }
}

class _LogoPainter extends CustomPainter {
  _LogoPainter(this.onDark);
  final bool onDark;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    Offset p(double x, double y) => Offset(x * w, y * h);

    if (!onDark) {
      final bg = Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF6A56E8), Color(0xFF3A2BA8)],
        ).createShader(Offset.zero & size);
      canvas.drawRRect(RRect.fromRectAndRadius(Offset.zero & size, Radius.circular(w * 0.24)), bg);
    }

    final white = Paint()..color = Colors.white;
    final bubble = RRect.fromRectAndRadius(Rect.fromLTRB(w * 0.15, h * 0.16, w * 0.85, h * 0.72), Radius.circular(w * 0.2));
    canvas.drawRRect(bubble, white);
    final tail = Path()
      ..moveTo(w * 0.28, h * 0.68)
      ..lineTo(w * 0.24, h * 0.88)
      ..lineTo(w * 0.48, h * 0.70)
      ..close();
    canvas.drawPath(tail, white);

    final body = Paint()..color = kTeal;
    final feathers = Path()
      ..moveTo(w * 0.40, h * 0.42)
      ..lineTo(w * 0.24, h * 0.34)
      ..lineTo(w * 0.36, h * 0.54)
      ..close();
    canvas.drawPath(feathers, body);
    canvas.drawOval(Rect.fromCenter(center: p(0.49, 0.47), width: w * 0.34, height: h * 0.27), body);
    canvas.drawCircle(p(0.61, 0.36), w * 0.09, body);
    canvas.drawOval(Rect.fromCenter(center: p(0.46, 0.49), width: w * 0.18, height: h * 0.11), Paint()..color = const Color(0xFF8E7FF0));
    final beak = Path()
      ..moveTo(w * 0.685, h * 0.325)
      ..lineTo(w * 0.80, h * 0.365)
      ..lineTo(w * 0.685, h * 0.405)
      ..close();
    canvas.drawPath(beak, Paint()..color = kCoral);
    canvas.drawCircle(p(0.625, 0.345), w * 0.02, white);
  }

  @override
  bool shouldRepaint(covariant _LogoPainter oldDelegate) => oldDelegate.onDark != onDark;
}

void toast(BuildContext context, String message) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message), behavior: SnackBarBehavior.floating));
}
