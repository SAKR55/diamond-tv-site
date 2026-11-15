import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import 'feed.dart';
import 'reminders.dart';

final GlobalKey<NavigatorState> appNavKey = GlobalKey<NavigatorState>();

/// يفحص تحديثات التطبيق ورسائل الإدارة بعد وصول المحتوى من لوحة التحكم.
/// - التحديث: إن كان رقم build في اللوحة أكبر من رقم النسخة المثبتة يظهر إشعار ونافذة بزر «حدّث الآن».
/// - الإلزامي (force): النافذة لا تُغلق حتى يحدّث المستخدم.
/// - الإشعارات: كل رسالة جديدة تظهر مرة واحدة لكل مستخدم (إشعار + نافذة).
class UpdateGate extends StatefulWidget {
  const UpdateGate({super.key, required this.child});
  final Widget child;
  @override
  State<UpdateGate> createState() => _UpdateGateState();
}

class _UpdateGateState extends State<UpdateGate> {
  bool _busy = false;
  bool _forceShown = false;

  @override
  void initState() {
    super.initState();
    ContentFeed.I.addListener(_check);
    WidgetsBinding.instance.addPostFrameCallback((_) => _check());
  }

  @override
  void dispose() {
    ContentFeed.I.removeListener(_check);
    super.dispose();
  }

  Future<void> _open(String url) async {
    final u = Uri.tryParse(url);
    if (u == null) return;
    try {
      await launchUrl(u, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }

  Future<void> _check() async {
    if (_busy) return;
    _busy = true;
    try {
      await _run();
    } catch (_) {}
    _busy = false;
  }

  Future<void> _run() async {
    final ctx = appNavKey.currentContext;
    if (ctx == null) return;
    final feed = ContentFeed.I;
    final prefs = await SharedPreferences.getInstance();

    // ===== تحديث التطبيق =====
    final up = feed.update;
    final newBuild = (up['build'] as num?)?.toInt() ?? 0;
    final url = (up['url'] ?? '').toString();
    if (newBuild > 0 && url.isNotEmpty) {
      int cur = 0;
      try {
        cur = int.tryParse((await PackageInfo.fromPlatform()).buildNumber) ?? 0;
      } catch (_) {}
      if (newBuild > cur) {
        final force = up['force'] == true;
        final ver = (up['version'] ?? '').toString();
        final notes = (up['notes'] ?? '').toString();
        final key = 'upd_seen_$newBuild';
        if (!prefs.containsKey(key)) {
          await prefs.setBool(key, true);
          Reminders.notifyNow(7001, 'تحديث جديد لمغرّد${ver.isEmpty ? '' : ' $ver'}', notes.isEmpty ? 'اضغط للتحديث الآن' : notes);
        }
        if (force && _forceShown) return;
        if (force) _forceShown = true;
        final c = appNavKey.currentContext;
        if (c == null || !c.mounted) return;
        await showDialog<void>(
          context: c,
          barrierDismissible: !force,
          builder: (_) => PopScope(
            canPop: !force,
            child: Directionality(
              textDirection: TextDirection.rtl,
              child: AlertDialog(
                title: Text('🚀 تحديث جديد${ver.isEmpty ? '' : ' ($ver)'}'),
                content: Text(notes.isEmpty ? 'تتوفر نسخة أحدث من مغرّد بتحسينات جديدة.' : notes),
                actions: [
                  if (!force) TextButton(onPressed: () => Navigator.of(c).pop(), child: const Text('لاحقاً')),
                  FilledButton(
                    style: FilledButton.styleFrom(minimumSize: const Size(120, 44)),
                    onPressed: () => _open(url),
                    child: const Text('حدّث الآن'),
                  ),
                ],
              ),
            ),
          ),
        );
        if (force) _forceShown = false;
        return; // لا نعرض الإشعارات فوق نافذة التحديث
      }
    }

    // ===== رسائل الإدارة =====
    final seen = (prefs.getStringList('notices_seen') ?? <String>[]).toSet();
    for (final n in feed.notices) {
      final id = n['id']!;
      if (seen.contains(id)) continue;
      seen.add(id);
      await prefs.setStringList('notices_seen', seen.toList());
      final title = n['title']!.isEmpty ? 'مغرّد' : n['title']!;
      Reminders.notifyNow(8000 + (id.hashCode & 0xfff), title, n['body']!);
      final c = appNavKey.currentContext;
      if (c == null || !c.mounted) return;
      final link = n['url']!;
      await showDialog<void>(
        context: c,
        builder: (_) => Directionality(
          textDirection: TextDirection.rtl,
          child: AlertDialog(
            title: Text('📢 $title'),
            content: Text(n['body']!),
            actions: [
              TextButton(onPressed: () => Navigator.of(c).pop(), child: const Text('حسناً')),
              if (link.isNotEmpty)
                FilledButton(
                  style: FilledButton.styleFrom(minimumSize: const Size(100, 44)),
                  onPressed: () => _open(link),
                  child: const Text('فتح'),
                ),
            ],
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
