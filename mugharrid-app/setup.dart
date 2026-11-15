// سكربت تجهيز مشروع «مغرّد» تلقائياً.
// يقوم بالخطوات من 1 إلى 4 في ملف README_AR.md بدلاً منك.
//
// التشغيل: افتح الطرفية داخل هذا المجلد ثم:
//     dart setup.dart
// إن لم يعمل الأمر dart فاستخدم المسار الكامل:
//     <مسار Flutter>/bin/dart setup.dart
// ثم بعده:
//     flutter run
//
// السكربت آمن للتكرار: تشغيله مرتين لا يُفسد شيئاً.

import 'dart:io';

const projectName = 'kalima_english';
const org = 'com.example'; // غيّره إلى نطاقك قبل النشر على المتجر
const appLabel = 'مغرّد';

final root = Directory.current;
var changed = <String>[];
var skipped = <String>[];

void main(List<String> args) async {
  print('— تجهيز مشروع «مغرّد» —\n');

  if (!File('${root.path}/pubspec.yaml').existsSync() || !Directory('${root.path}/lib').existsSync()) {
    fail('شغّل السكربت من داخل مجلد المشروع (الذي يحتوي pubspec.yaml ومجلد lib).');
  }

  final flutter = await findFlutter();
  print('Flutter: $flutter');
  final ver = await run(flutter, ['--version'], quiet: true);
  print(ver.trim().split('\n').first);
  print('');

  await scaffoldAndroid(flutter);
  patchManifest();
  patchGradle();
  installIcons();
  dropAnalysisOptions();
  deleteDefaultTest();

  print('\n— ما تم تغييره —');
  for (final c in changed) {
    print('  ✓ $c');
  }
  for (final s in skipped) {
    print('  · $s');
  }

  print('\n— تثبيت الحزم —');
  final pub = await Process.start(flutter, ['pub', 'get'], mode: ProcessStartMode.inheritStdio, workingDirectory: root.path);
  final code = await pub.exitCode;
  if (code != 0) {
    print('\nفشل flutter pub get. انسخ الخطأ أعلاه وأرسله.');
    exit(code);
  }

  print('\n✅ المشروع جاهز.');
  print('وصّل جوالك بالكمبيوتر وشغّل:  flutter run');
  print('(الميكروفون والنطق لا يعملان جيداً على المحاكي، استخدم جوالاً حقيقياً.)');
}

void fail(String message) {
  print('✗ $message');
  exit(1);
}

Future<String> findFlutter() async {
  final names = Platform.isWindows ? ['flutter.bat', 'flutter'] : ['flutter'];
  for (final n in names) {
    try {
      final r = await Process.run(n, ['--version'], runInShell: true);
      if (r.exitCode == 0) return n;
    } catch (_) {}
  }
  fail('لم أجد أمر flutter. افتح طرفية Android Studio أو أضف مجلد flutter/bin إلى PATH ثم أعد المحاولة.');
  return '';
}

Future<String> run(String exe, List<String> a, {bool quiet = false, String? cwd}) async {
  final r = await Process.run(exe, a, runInShell: true, workingDirectory: cwd ?? root.path);
  if (r.exitCode != 0 && !quiet) {
    print(r.stdout);
    print(r.stderr);
    fail('فشل الأمر: $exe ${a.join(' ')}');
  }
  return '${r.stdout}';
}

/// ينشئ مجلدات أندرويد بنسخة Flutter الموجودة على جهازك، مع الحفاظ على lib و pubspec.
Future<void> scaffoldAndroid(String flutter) async {
  if (Directory('${root.path}/android').existsSync()) {
    skipped.add('مجلد android موجود مسبقاً (لم يُنشأ من جديد)');
    return;
  }
  print('إنشاء ملفات أندرويد باستخدام flutter create...');

  final backup = Directory('${root.path}/.kalima_backup');
  if (backup.existsSync()) backup.deleteSync(recursive: true);
  backup.createSync();
  copyDir(Directory('${root.path}/lib'), Directory('${backup.path}/lib'));
  File('${root.path}/pubspec.yaml').copySync('${backup.path}/pubspec.yaml');

  await run(flutter, ['create', '--project-name', projectName, '--org', org, '--platforms', 'android', '.']);

  // flutter create يستبدل lib و pubspec بالقالب، فنرجّع ملفاتنا فوقها.
  final lib = Directory('${root.path}/lib');
  if (lib.existsSync()) lib.deleteSync(recursive: true);
  copyDir(Directory('${backup.path}/lib'), lib);
  File('${backup.path}/pubspec.yaml').copySync('${root.path}/pubspec.yaml');
  backup.deleteSync(recursive: true);

  changed.add('أُنشئت ملفات أندرويد وأُعيد lib و pubspec.yaml الخاصان بالتطبيق');
}

void copyDir(Directory from, Directory to) {
  to.createSync(recursive: true);
  for (final e in from.listSync(recursive: true)) {
    final rel = e.path.substring(from.path.length + 1);
    if (e is Directory) {
      Directory('${to.path}/$rel').createSync(recursive: true);
    } else if (e is File) {
      Directory(File('${to.path}/$rel').parent.path).createSync(recursive: true);
      e.copySync('${to.path}/$rel');
    }
  }
}

void patchManifest() {
  final f = File('${root.path}/android/app/src/main/AndroidManifest.xml');
  if (!f.existsSync()) fail('لم أجد AndroidManifest.xml');
  var s = f.readAsStringSync();
  final before = s;

  const perms = '''
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.RECORD_AUDIO"/>
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
''';

  const receivers = '''
        <!-- التذكير اليومي -->
        <receiver android:exported="false" android:name="com.dexterous.flutterlocalnotifications.ScheduledNotificationReceiver"/>
        <receiver android:exported="false" android:name="com.dexterous.flutterlocalnotifications.ScheduledNotificationBootReceiver">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED"/>
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED"/>
                <action android:name="android.intent.action.QUICKBOOT_POWERON"/>
                <action android:name="com.htc.intent.action.QUICKBOOT_POWERON"/>
            </intent-filter>
        </receiver>
''';

  const speechQueries = '''
        <intent>
            <action android:name="android.speech.RecognitionService"/>
        </intent>
        <intent>
            <action android:name="android.intent.action.TTS_SERVICE"/>
        </intent>
''';

  // (1) الأذونات
  if (!s.contains('android.permission.RECORD_AUDIO')) {
    final i = s.indexOf('>', s.indexOf('<manifest'));
    s = '${s.substring(0, i + 1)}\n$perms${s.substring(i + 1)}';
    changed.add('أُضيفت الأذونات (ميكروفون، إشعارات، إنترنت)');
  } else {
    skipped.add('الأذونات موجودة مسبقاً');
  }

  // (1ب) أذونات المكالمات الصوتية
  if (!s.contains('android.permission.MODIFY_AUDIO_SETTINGS')) {
    final i = s.indexOf('>', s.indexOf('<manifest'));
    s = '${s.substring(0, i + 1)}\n    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>${s.substring(i + 1)}';
    changed.add('أُضيفت أذونات المكالمات الصوتية');
  }

  // (2) مستقبِلات الإشعارات
  if (!s.contains('ScheduledNotificationReceiver')) {
    final i = s.lastIndexOf('</application>');
    if (i < 0) fail('لم أجد </application> في AndroidManifest.xml');
    s = '${s.substring(0, i)}$receivers${s.substring(i)}';
    changed.add('أُضيفت مستقبِلات التذكير اليومي');
  } else {
    skipped.add('مستقبِلات التذكير موجودة مسبقاً');
  }

  // (3) queries للتعرف على الصوت والنطق
  if (!s.contains('android.speech.RecognitionService')) {
    final i = s.lastIndexOf('</queries>');
    if (i >= 0) {
      s = '${s.substring(0, i)}$speechQueries${s.substring(i)}';
    } else {
      final j = s.lastIndexOf('</manifest>');
      s = '${s.substring(0, j)}    <queries>\n$speechQueries    </queries>\n${s.substring(j)}';
    }
    changed.add('أُضيفت queries للتعرف على الصوت وتحويل النص إلى كلام');
  } else {
    skipped.add('queries الصوت موجودة مسبقاً');
  }

  // (3ب) queries لفتح واتساب والبريد
  if (!s.contains('android.intent.action.SENDTO')) {
    const linkQueries = '''
        <intent>
            <action android:name="android.intent.action.VIEW"/>
            <data android:scheme="https"/>
        </intent>
        <intent>
            <action android:name="android.intent.action.SENDTO"/>
            <data android:scheme="mailto"/>
        </intent>
''';
    final i = s.lastIndexOf('</queries>');
    if (i >= 0) {
      s = '${s.substring(0, i)}$linkQueries${s.substring(i)}';
      changed.add('أُضيفت queries لزر واتساب والبريد');
    }
  }

  // (4) اسم التطبيق على الجوال
  final label = RegExp(r'android:label="[^"]*"');
  if (s.contains('android:label="$appLabel"')) {
    skipped.add('اسم التطبيق مضبوط مسبقاً');
  } else if (label.hasMatch(s)) {
    s = s.replaceFirst(label, 'android:label="$appLabel"');
    changed.add('اسم التطبيق على الجوال: $appLabel');
  }

  if (s != before) f.writeAsStringSync(s);
}

void patchGradle() {
  final kts = File('${root.path}/android/app/build.gradle.kts');
  final groovy = File('${root.path}/android/app/build.gradle');
  if (kts.existsSync()) {
    _patchKts(kts);
  } else if (groovy.existsSync()) {
    _patchGroovy(groovy);
  } else {
    fail('لم أجد ملف build.gradle الخاص بالتطبيق');
  }
}

void _patchKts(File f) {
  var s = f.readAsStringSync();
  final before = s;

  if (!s.contains('isCoreLibraryDesugaringEnabled')) {
    final i = s.indexOf('compileOptions {');
    if (i < 0) fail('لم أجد compileOptions في build.gradle.kts');
    final j = s.indexOf('\n', i);
    s = '${s.substring(0, j)}\n        isCoreLibraryDesugaringEnabled = true${s.substring(j)}';
    changed.add('فُعّل desugaring (لازم لمكتبة الإشعارات)');
  } else {
    skipped.add('desugaring مفعّل مسبقاً');
  }

  if (!s.contains('desugar_jdk_libs')) {
    s = '$s\ndependencies {\n    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.4")\n}\n';
    changed.add('أُضيفت مكتبة desugar_jdk_libs');
  } else {
    skipped.add('desugar_jdk_libs موجودة مسبقاً');
  }

  // مكتبة الإشعارات 19 تحتاج compileSdk 35 على الأقل
  if (s.contains('compileSdk = flutter.compileSdkVersion')) {
    s = s.replaceFirst('compileSdk = flutter.compileSdkVersion', 'compileSdk = maxOf(35, flutter.compileSdkVersion)');
    changed.add('compileSdk صار 35 كحد أدنى');
  } else {
    final m = RegExp(r'compileSdk\s*=\s*(\d+)').firstMatch(s);
    if (m != null && int.parse(m.group(1)!) < 35) {
      s = s.replaceFirst(m.group(0)!, 'compileSdk = 35');
      changed.add('compileSdk صار 35');
    } else {
      skipped.add('compileSdk مناسب مسبقاً');
    }
  }

  if (s != before) f.writeAsStringSync(s);
}

void _patchGroovy(File f) {
  var s = f.readAsStringSync();
  final before = s;

  if (!s.contains('coreLibraryDesugaringEnabled')) {
    final i = s.indexOf('compileOptions {');
    if (i < 0) fail('لم أجد compileOptions في build.gradle');
    final j = s.indexOf('\n', i);
    s = '${s.substring(0, j)}\n        coreLibraryDesugaringEnabled true${s.substring(j)}';
    changed.add('فُعّل desugaring (لازم لمكتبة الإشعارات)');
  } else {
    skipped.add('desugaring مفعّل مسبقاً');
  }

  if (!s.contains('desugar_jdk_libs')) {
    s = "$s\ndependencies {\n    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.1.4'\n}\n";
    changed.add('أُضيفت مكتبة desugar_jdk_libs');
  } else {
    skipped.add('desugar_jdk_libs موجودة مسبقاً');
  }

  final m = RegExp(r'compileSdk(?:Version)?\s+(\d+)').firstMatch(s);
  if (m != null && int.parse(m.group(1)!) < 35) {
    s = s.replaceFirst(m.group(0)!, 'compileSdk 35');
    changed.add('compileSdk صار 35');
  }

  if (s != before) f.writeAsStringSync(s);
}

/// ينسخ أيقونة «مغرّد» من مجلد branding إلى مجلدات أندرويد.
void installIcons() {
  final src = Directory('${root.path}/branding/android');
  final res = Directory('${root.path}/android/app/src/main/res');
  if (!src.existsSync() || !res.existsSync()) {
    skipped.add('لم تُنسخ الأيقونة (مجلد branding غير موجود)');
    return;
  }
  copyDir(src, res);
  changed.add('نُسخت أيقونة التطبيق الجديدة');
}

/// ملف التحليل الذي يولّده flutter create يشير إلى حزمة flutter_lints غير الموجودة في pubspec، فنحذفه.
void dropAnalysisOptions() {
  final f = File('${root.path}/analysis_options.yaml');
  if (!f.existsSync()) return;
  if (f.readAsStringSync().contains('flutter_lints')) {
    f.deleteSync();
    changed.add('حُذف analysis_options.yaml (كان يشير إلى حزمة غير مثبتة)');
  }
}

void deleteDefaultTest() {
  final f = File('${root.path}/test/widget_test.dart');
  if (f.existsSync()) {
    f.deleteSync();
    changed.add('حُذف الاختبار الافتراضي test/widget_test.dart');
  }
}
