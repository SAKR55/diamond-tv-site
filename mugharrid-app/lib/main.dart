import 'package:flutter/material.dart';

import 'core/account.dart';
import 'core/feed.dart';
import 'core/reminders.dart';
import 'core/updates.dart';
import 'core/store.dart';
import 'data/lesson_gen.dart';
import 'screens/account.dart';
import 'screens/home.dart';
import 'screens/kids.dart';
import 'screens/placement.dart';
import 'ui/common.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppStore.I.load();
  await Account.I.init();
  // نعيد جدولة التذكير عند كل تشغيل ليبقى موعده صحيحاً.
  if (AppStore.I.reminderOn) {
    Reminders.schedule(AppStore.I.reminderHour, AppStore.I.reminderMinute);
  }
  buildGeneratedLessons();
  // المحتوى المتجدد: لا ننتظره حتى لا يتأخر فتح التطبيق.
  ContentFeed.I.start();
  runApp(const KalimaApp());
}

class KalimaApp extends StatelessWidget {
  const KalimaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: kAppName,
      navigatorKey: appNavKey,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Tajawal',
        colorScheme: ColorScheme.fromSeed(seedColor: kTeal, primary: kTeal, secondary: kCoral, surface: kCard),
        scaffoldBackgroundColor: kSand,
        appBarTheme: const AppBarTheme(
          backgroundColor: kSand,
          foregroundColor: kInk,
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(color: kInk, fontSize: 19, fontWeight: FontWeight.w800),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            minimumSize: const Size.fromHeight(52),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            textStyle: const TextStyle(fontSize: 16.5, fontWeight: FontWeight.w800),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(52),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            textStyle: const TextStyle(fontSize: 16.5, fontWeight: FontWeight.w800),
          ),
        ),
      ),
      // الواجهة كلها من اليمين إلى اليسار.
      builder: (context, child) => Directionality(
        textDirection: TextDirection.rtl,
        child: UpdateGate(child: child ?? const SizedBox.shrink()),
      ),
      home: const RootGate(),
    );
  }
}

/// يحدد الشاشة الأولى حسب حالة المتعلم: اختيار القسم، ثم اختبار المستوى، ثم الرئيسية.
class RootGate extends StatelessWidget {
  const RootGate({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([AppStore.I, Account.I, ContentFeed.I]),
      builder: (context, _) {
        final s = AppStore.I;
        // الدخول بحساب مطلوب قبل استخدام التطبيق.
        if (ContentFeed.I.maintenance.isNotEmpty) {
          return Scaffold(
            body: Directionality(
              textDirection: TextDirection.rtl,
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    const Text('🛠️', style: TextStyle(fontSize: 56)),
                    const SizedBox(height: 12),
                    Text(ContentFeed.I.maintenance, textAlign: TextAlign.center, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  ]),
                ),
              ),
            ),
          );
        }
        if (!Account.I.signedIn) return const AuthScreen();
        if (Account.I.blocked) {
          return Scaffold(
            body: Directionality(
              textDirection: TextDirection.rtl,
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    const Text('⛔', style: TextStyle(fontSize: 56)),
                    const SizedBox(height: 12),
                    const Text('تم إيقاف هذا الحساب', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Text('للاستفسار تواصل معنا: $kContactInfo', textAlign: TextAlign.center),
                    const SizedBox(height: 16),
                    OutlinedButton(onPressed: () => Account.I.signOut(), child: const Text('تسجيل الخروج')),
                  ]),
                ),
              ),
            ),
          );
        }
        if (s.section.isEmpty) return const WelcomeScreen();
        if (s.section == 'kid') return const KidsHome();
        if (s.level.isEmpty) return const PlacementScreen();
        return const AdultHome();
      },
    );
  }
}

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0xFF5A48DC), kInk]),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(22, 34, 22, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    BulbulLogo(size: 64, onDark: true),
                    SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(kAppName, style: TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w900, height: 1.1)),
                        Text(kAppSlogan, style: TextStyle(color: kGold, fontSize: 15, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ],
                ),
                const Spacer(),
                const Text(
                  'تعلّم الإنجليزية بالتحدث،\nحتى تغرّد بها بطلاقة.',
                  style: TextStyle(color: Colors.white, fontSize: 23, fontWeight: FontWeight.w700, height: 1.5),
                ),
                const SizedBox(height: 18),
                _SectionButton(
                  emoji: '🧒',
                  title: 'قسم الأطفال',
                  subtitle: 'ألعاب وقصص وأصوات · 4 إلى 12 سنة',
                  background: const Color(0xFFFFD04D),
                  foreground: const Color(0xFF3A2A00),
                  onTap: () => AppStore.I.setSection('kid'),
                ),
                const SizedBox(height: 12),
                _SectionButton(
                  emoji: '🧑‍💼',
                  title: 'قسم الكبار',
                  subtitle: 'محادثة للعمل والسفر والدراسة',
                  background: Colors.white,
                  foreground: kInk,
                  onTap: () => AppStore.I.setSection('adult'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SectionButton extends StatelessWidget {
  const _SectionButton({
    required this.emoji,
    required this.title,
    required this.subtitle,
    required this.background,
    required this.foreground,
    required this.onTap,
  });

  final String emoji;
  final String title;
  final String subtitle;
  final Color background;
  final Color foreground;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: background,
      borderRadius: BorderRadius.circular(22),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 38)),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: TextStyle(color: foreground, fontSize: 19, fontWeight: FontWeight.w800)),
                    Text(subtitle, style: TextStyle(color: foreground, fontSize: 13.5)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
