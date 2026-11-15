import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;

/// التذكير اليومي بإشعار محلي (بلا خادم).
///
/// مكتوب لواجهة flutter_local_notifications الإصدار 19.
/// في الإصدار 20 وما بعده صارت المعاملات مسمّاة (settings: و id: ...)، فلا ترفع الإصدار
/// في pubspec.yaml قبل تعديل هذا الملف.
class Reminders {
  static final FlutterLocalNotificationsPlugin _plugin = FlutterLocalNotificationsPlugin();
  static bool _ready = false;
  static const int _id = 1;

  static Future<void> _init() async {
    if (_ready) return;
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const settings = InitializationSettings(android: android);
    await _plugin.initialize(settings);
    _ready = true;
  }

  /// يطلب إذن الإشعارات (أندرويد 13 فأحدث). يعيد false إذا رفض المستخدم.
  static Future<bool> requestPermission() async {
    try {
      await _init();
      final impl = _plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
      final ok = await impl?.requestNotificationsPermission();
      return ok ?? true;
    } catch (_) {
      return false;
    }
  }

  /// يجدول إشعاراً يومياً في الساعة المحددة بتوقيت الجهاز.
  ///
  /// نحسب اللحظة التالية بتوقيت الجهاز ثم نحولها إلى UTC، فلا نحتاج قاعدة بيانات المناطق الزمنية.
  /// يُعاد الجدولة عند كل فتح للتطبيق، فيتصحح الموعد تلقائياً بعد تغيير التوقيت الصيفي.
  static Future<bool> schedule(int hour, int minute) async {
    try {
      await _init();
      await _plugin.cancel(_id);
      final now = DateTime.now();
      var next = DateTime(now.year, now.month, now.day, hour, minute);
      if (!next.isAfter(now)) next = next.add(const Duration(days: 1));
      final when = tz.TZDateTime.from(next, tz.UTC);
      const details = NotificationDetails(
        android: AndroidNotificationDetails(
          'daily_reminder',
          'التذكير اليومي',
          channelDescription: 'تذكير بموعد تمرين الإنجليزية اليومي',
          importance: Importance.high,
          priority: Priority.high,
        ),
      );
      await _plugin.zonedSchedule(
        _id,
        'حان وقت الإنجليزية',
        'عشر دقائق اليوم تحافظ على سلسلتك. ابدأ بجملة واحدة.',
        when,
        details,
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        matchDateTimeComponents: DateTimeComponents.time,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  static Future<void> cancel() async {
    try {
      await _init();
      await _plugin.cancel(_id);
    } catch (_) {}
  }

  /// إشعار فوري (للتحديثات ورسائل الإدارة).
  static Future<void> notifyNow(int id, String title, String body) async {
    try {
      await _init();
      await requestPermission();
      const details = NotificationDetails(
        android: AndroidNotificationDetails(
          'admin_notices',
          'إشعارات مغرّد',
          channelDescription: 'تحديثات التطبيق ورسائل من الإدارة',
          importance: Importance.high,
          priority: Priority.high,
        ),
      );
      await _plugin.show(id, title, body, details);
    } catch (_) {}
  }
}
