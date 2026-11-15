import 'package:flutter/material.dart';

import '../core/feed.dart';
import '../core/reminders.dart';
import '../core/speech.dart';
import '../core/store.dart';
import '../data/content.dart';
import '../ui/common.dart';
import 'account.dart';
import 'placement.dart';

/// الإعدادات وركن ولي الأمر: الهدف اليومي، التذكير، المستوى، ربط الذكاء الاصطناعي، وتبديل القسم.
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final TextEditingController _endpoint;

  @override
  void initState() {
    super.initState();
    _endpoint = TextEditingController(text: AppStore.I.aiEndpoint);
  }

  @override
  void dispose() {
    _endpoint.dispose();
    super.dispose();
  }

  String _two(int n) => n.toString().padLeft(2, '0');

  Future<void> _toggleReminder(bool on) async {
    final s = AppStore.I;
    if (!on) {
      s.setReminder(on: false);
      await Reminders.cancel();
      return;
    }
    final allowed = await Reminders.requestPermission();
    if (!mounted) return;
    if (!allowed) {
      toast(context, 'لم يُمنح إذن الإشعارات. فعّله من إعدادات الجوال ثم حاول مرة أخرى.');
      return;
    }
    final ok = await Reminders.schedule(s.reminderHour, s.reminderMinute);
    if (!mounted) return;
    if (ok) {
      s.setReminder(on: true);
      toast(context, 'سنذكّرك يومياً الساعة ${_two(s.reminderHour)}:${_two(s.reminderMinute)}');
    } else {
      toast(context, 'تعذر ضبط التذكير على هذا الجهاز.');
    }
  }

  Future<void> _pickTime() async {
    final s = AppStore.I;
    final t = await showTimePicker(context: context, initialTime: TimeOfDay(hour: s.reminderHour, minute: s.reminderMinute));
    if (t == null || !mounted) return;
    s.setReminder(on: s.reminderOn, hour: t.hour, minute: t.minute);
    if (s.reminderOn) await Reminders.schedule(t.hour, t.minute);
  }

  Future<void> _pickVoice() async {
    final voices = await Speech.I.englishVoices();
    final current = (await Speech.I.savedVoice()).split('|').first;
    if (!mounted) return;
    if (voices.isEmpty) {
      toast(context, 'لم أجد أصواتاً إنجليزية. نزّل صوت الإنجليزية من إعدادات الجوال ← تحويل النص إلى كلام.');
      return;
    }
    await showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => SafeArea(
        child: ListView(
          children: [
            const Padding(padding: EdgeInsets.all(16), child: Text('اضغط الصوت لتجربته واختياره', style: TextStyle(fontWeight: FontWeight.w800))),
            ListTile(
              title: const Text('صوت الجوال الافتراضي'),
              trailing: current.isEmpty ? const Icon(Icons.check_rounded, color: kOk) : null,
              onTap: () async {
                await Speech.I.setVoice('', '');
                if (ctx.mounted) Navigator.of(ctx).pop();
              },
            ),
            for (var vi = 0; vi < voices.length; vi++)
              ListTile(
                title: Text(voices[vi]['name'] ?? '', textDirection: TextDirection.ltr),
                subtitle: Text('${vi < 3 ? '⭐ موصى به · ' : ''}${voices[vi]['locale'] ?? ''}', textDirection: TextDirection.ltr),
                trailing: current == voices[vi]['name'] ? const Icon(Icons.check_rounded, color: kOk) : null,
                onTap: () async {
                  await Speech.I.setVoice(voices[vi]['name'] ?? '', voices[vi]['locale'] ?? '');
                  await Speech.I.say('Hello! This is how I sound. Welcome to Mugharrid.');
                  if (ctx.mounted) Navigator.of(ctx).pop();
                },
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickRate() async {
    const options = <List<Object>>[
      ['بطيئة جداً', 0.65],
      ['بطيئة', 0.82],
      ['عادية', 1.0],
      ['أسرع', 1.15],
    ];
    await showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Padding(padding: EdgeInsets.all(16), child: Text('اختر السرعة وسنجرّبها لك', style: TextStyle(fontWeight: FontWeight.w800))),
            for (final o in options)
              ListTile(
                title: Text(o[0] as String),
                trailing: (Speech.I.rateScale - (o[1] as double)).abs() < 0.05 ? const Icon(Icons.check_rounded, color: kOk) : null,
                onTap: () async {
                  await Speech.I.setRateScale(o[1] as double);
                  await Speech.I.say('Hello! This is my speaking speed. I hope it is clear.');
                  if (ctx.mounted) Navigator.of(ctx).pop();
                },
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _reset() async {
    final sure = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('مسح كل التقدم؟'),
        content: const Text('سيُحذف المستوى والسلسلة والنجوم ودفتر الأخطاء من هذا الجهاز، ولا يمكن التراجع.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('إلغاء')),
          TextButton(onPressed: () => Navigator.of(ctx).pop(true), child: const Text('امسح', style: TextStyle(color: kBad))),
        ],
      ),
    );
    if (sure != true || !mounted) return;
    Navigator.of(context).popUntil((route) => route.isFirst);
    await AppStore.I.resetAll();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) {
        final s = AppStore.I;
        final kid = s.section == 'kid';
        return Scaffold(
          appBar: AppBar(title: Text(kid ? 'ركن ولي الأمر' : 'الإعدادات')),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('ملخص التقدم', style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Text(
                      'سلسلة الأيام: ${s.streak}\n'
                      'دقائق اليوم: ${s.todayMinutes}\n'
                      'إجمالي الدقائق: ${s.totalSeconds ~/ 60}\n'
                      'النجوم: ${s.stars}\n'
                      'قصص مقروءة: ${s.storiesRead}\n'
                      '${kid ? '' : 'محادثات مكتملة: ${s.talksDone}\nدروس مكتملة: ${s.doneLessons.length} من ${lessons.length}\nأخطاء في الدفتر: ${s.mistakes.length} (أُتقن ${s.masteredCount})'}',
                      style: const TextStyle(height: 1.9, color: kInk),
                    ),
                  ],
                ),
              ),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('الهدف اليومي', style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: [
                        for (final m in const [5, 10, 15, 20])
                          ChoiceChip(label: Text('$m دقائق'), selected: s.goalMinutes == m, onSelected: (_) => s.setGoal(m)),
                      ],
                    ),
                  ],
                ),
              ),
              AppCard(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Column(
                  children: [
                    SwitchListTile(
                      title: const Text('تذكير يومي', style: TextStyle(fontWeight: FontWeight.w800)),
                      subtitle: const Text('إشعار في الوقت الذي تختاره ليحافظ على سلسلتك'),
                      value: s.reminderOn,
                      onChanged: _toggleReminder,
                    ),
                    ListTile(
                      title: const Text('وقت التذكير'),
                      trailing: Text('${_two(s.reminderHour)}:${_two(s.reminderMinute)}', textDirection: TextDirection.ltr, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
                      onTap: _pickTime,
                    ),
                  ],
                ),
              ),
              AppCard(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: ListTile(
                  title: const Text('صوت القراءة', style: TextStyle(fontWeight: FontWeight.w800)),
                  subtitle: const Text('اختر الصوت الإنجليزي الأوضح على جوالك'),
                  trailing: const Icon(Icons.record_voice_over_rounded),
                  onTap: _pickVoice,
                ),
              ),
              AppCard(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: ListTile(
                  title: const Text('سرعة النطق', style: TextStyle(fontWeight: FontWeight.w800)),
                  subtitle: const Text('أبطأ للمبتدئين، أسرع للمتقدمين'),
                  trailing: const Icon(Icons.speed_rounded),
                  onTap: _pickRate,
                ),
              ),
              if (!kid)
                AppCard(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: ListTile(
                    title: const Text('مستواي', style: TextStyle(fontWeight: FontWeight.w800)),
                    subtitle: Text('${s.level} · ${levelNamesAr[s.level] ?? ''} · اضغط لإعادة اختبار المستوى'),
                    trailing: const Icon(Icons.chevron_left_rounded),
                    onTap: () => push(context, const PlacementScreen()),
                  ),
                ),
              if (ContentFeed.I.aiEndpoint.isEmpty)
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('ربط الذكاء الاصطناعي (اختياري)', style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 6),
                    const Text(
                      'بلا رابط يعمل التطبيق كاملاً على الجوال وبلا تكلفة. ضع رابط خادمك هنا لتصبح المحادثات حرة والقصص من الذكاء الاصطناعي. التفاصيل في ملف التعليمات.',
                      style: TextStyle(color: kMuted, height: 1.7, fontSize: 13.5),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _endpoint,
                      textDirection: TextDirection.ltr,
                      keyboardType: TextInputType.url,
                      decoration: InputDecoration(
                        hintText: 'https://your-server.example/coach',
                        hintTextDirection: TextDirection.ltr,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton(
                      onPressed: () {
                        s.setAiEndpoint(_endpoint.text);
                        FocusScope.of(context).unfocus();
                        toast(context, s.aiEndpoint.isEmpty ? 'الوضع المحلي بلا إنترنت مفعّل' : 'حُفظ الرابط');
                      },
                      child: const Text('حفظ'),
                    ),
                  ],
                ),
              ),
              AppCard(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Column(
                  children: [
                    ListTile(
                      title: const Text('حسابي', style: TextStyle(fontWeight: FontWeight.w800)),
                      trailing: const Icon(Icons.person_rounded),
                      onTap: () => push(context, const AccountScreen()),
                    ),
                    ListTile(
                      title: Text(kid ? 'الانتقال إلى قسم الكبار' : 'الانتقال إلى قسم الأطفال', style: const TextStyle(fontWeight: FontWeight.w800)),
                      trailing: const Icon(Icons.swap_horiz_rounded),
                      onTap: () {
                        Navigator.of(context).popUntil((route) => route.isFirst);
                        s.setSection(kid ? 'adult' : 'kid');
                      },
                    ),
                    ListTile(
                      title: const Text('مسح كل التقدم', style: TextStyle(color: kBad, fontWeight: FontWeight.w800)),
                      trailing: const Icon(Icons.delete_outline_rounded, color: kBad),
                      onTap: _reset,
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
