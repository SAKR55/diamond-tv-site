import 'package:flutter/material.dart';

import '../core/feed.dart';
import '../core/speech.dart';
import '../core/store.dart';
import '../data/content.dart';
import '../data/library.dart';
import '../ui/common.dart';
import '../core/account.dart';
import 'account.dart';
import 'extras.dart';
import 'innovate.dart';
import 'lesson.dart';
import 'mistakes.dart';
import 'buddy.dart';
import 'builder.dart';
import 'more.dart';
import 'podcast.dart';
import 'reading.dart';
import 'settings.dart';
import 'shadowing.dart';
import 'stories.dart';

/// الصفحة الرئيسية لقسم الكبار.
class AdultHome extends StatelessWidget {
  const AdultHome({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([AppStore.I, ContentFeed.I, Account.I]),
      builder: (context, _) {
        final s = AppStore.I;
        final myLessons = lessons.where((l) => l.level == s.level).toList();
        final next = myLessons.where((l) => !s.doneLessons.contains(l.id)).toList();
        final Lesson? lesson = next.isNotEmpty ? next.first : (myLessons.isNotEmpty ? myLessons.first : null);
        final due = s.dueMistakes.length;
        final mission = dailyMissions[todayNumber() % dailyMissions.length];
        final idiom = idioms[todayNumber() % idioms.length];
        final dueWords = s.dueWords.length;
        final news = ContentFeed.I.announcement;
        final isNew = lesson != null && ContentFeed.I.remoteLessonIds.contains(lesson.id);

        return Scaffold(
          body: SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 24),
              children: [
                Row(
                  children: [
                    const BulbulLogo(size: 44),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(kAppName, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: kInk, height: 1.1)),
                          Text('المستوى ${xpLevel(s.xp)} · ${xpTitle(s.xp)} · ${s.xp} نقطة', style: const TextStyle(fontSize: 12.5, color: kMuted)),
                        ],
                      ),
                    ),
                    IconButton(
                      tooltip: 'تقدّمي',
                      onPressed: () => push(context, const ProgressScreen()),
                      icon: const Icon(Icons.emoji_events_rounded, color: kGold),
                    ),
                    IconButton(
                      tooltip: 'الإعدادات',
                      onPressed: () => push(context, const SettingsScreen()),
                      icon: const Icon(Icons.settings_rounded, color: kInk),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: _Stat(value: '${s.streak}', label: 'يوماً متتالياً', color: kTeal, textColor: Colors.white)),
                    const SizedBox(width: 8),
                    Expanded(child: _Stat(value: '${s.todayMinutes}/${s.goalMinutes}', label: 'دقيقة اليوم', color: kCoral, textColor: Colors.white)),
                    const SizedBox(width: 8),
                    Expanded(child: _Stat(value: s.level, label: levelNamesAr[s.level] ?? '', color: kGold, textColor: const Color(0xFF3A2A00))),
                  ],
                ),
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(9),
                  child: LinearProgressIndicator(value: s.goalProgress, minHeight: 9, color: kCoral, backgroundColor: kLine),
                ),
                const SizedBox(height: 6),
                Text(
                  s.goalProgress >= 1 ? 'أكملت هدف اليوم. أحسنت!' : 'هدفك اليومي ${s.goalMinutes} دقائق',
                  style: const TextStyle(color: kMuted, fontSize: 13),
                ),
                const SizedBox(height: 14),
                if (news.isNotEmpty)
                  AppCard(
                    color: kTint,
                    child: Row(
                      children: [
                        const Text('📣', style: TextStyle(fontSize: 22)),
                        const SizedBox(width: 10),
                        Expanded(child: Text(news, style: const TextStyle(color: kInk, height: 1.6, fontWeight: FontWeight.w600))),
                      ],
                    ),
                  ),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('خطة اليوم · ${s.planDone} من 3', style: const TextStyle(fontWeight: FontWeight.w800, color: kTeal, fontSize: 13)),
                      const SizedBox(height: 8),
                      _PlanRow(done: s.doneToday('learn'), text: 'تعلّم: درس أو قصة'),
                      _PlanRow(done: s.doneToday('speak'), text: 'تكلّم: محادثة أو ردد بعدي أو قلها بالإنجليزية'),
                      _PlanRow(done: s.doneToday('review'), text: 'راجع: دفتر أخطائي أو مفرداتي'),
                      if (s.planDone == 3) const Padding(padding: EdgeInsets.only(top: 6), child: Text('أكملت خطة اليوم 🎉', style: TextStyle(color: kOk, fontWeight: FontWeight.w800))),
                    ],
                  ),
                ),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('تعبير اليوم', style: TextStyle(fontWeight: FontWeight.w800, color: kCoral, fontSize: 13)),
                      Row(
                        children: [
                          Expanded(child: En(idiom.en, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: kInk))),
                          IconButton(
                            tooltip: 'احفظ في مفرداتي',
                            onPressed: () {
                              if (s.saveWord(idiom.en, idiom.ar)) toast(context, 'حُفظ في مفرداتي');
                            },
                            icon: Icon(s.hasWord(idiom.en) ? Icons.bookmark_rounded : Icons.bookmark_add_outlined, color: kTeal),
                          ),
                          SpeakButton(idiom.en),
                        ],
                      ),
                      Text(idiom.ar, style: const TextStyle(color: kInk, fontSize: 15)),
                      const SizedBox(height: 6),
                      InkWell(
                        onTap: () => Speech.I.say(idiom.example),
                        child: En(idiom.example, style: const TextStyle(color: kMuted, fontSize: 14.5, fontStyle: FontStyle.italic)),
                      ),
                    ],
                  ),
                ),
                AppCard(
                  color: const Color(0xFFFFF6DC),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('مهمة اليوم في الحياة الواقعية', style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF7A5A00), fontSize: 13)),
                      const SizedBox(height: 6),
                      Text(mission, style: const TextStyle(fontSize: 15.5, height: 1.7, color: kInk)),
                      const SizedBox(height: 8),
                      Align(
                        alignment: AlignmentDirectional.centerStart,
                        child: s.missionDoneToday
                            ? const Text('✓ أنجزتها اليوم', style: TextStyle(color: kOk, fontWeight: FontWeight.w800))
                            : TextButton(onPressed: s.completeMission, child: const Text('أنجزتها ⭐')),
                      ),
                    ],
                  ),
                ),
                _suggestionCard(context, s, due, dueWords),
                const _SectionTitle('تعلّم'),
                if (lesson != null)
                  ActivityTile(
                    emoji: lesson.emoji,
                    title: 'درس: ${lesson.titleAr}',
                    badge: isNew ? 'جديد' : null,
                    subtitle: next.isEmpty ? 'أنهيت دروس مستواك، أعد أي درس للمراجعة' : '${lesson.steps.length} خطوات ثم محادثة مع المدرب',
                    onTap: () => push(context, LessonScreen(lesson: lesson)),
                  ),
                ActivityTile(
                  emoji: '📚',
                  title: 'كل الدروس',
                  subtitle: 'أنهيت ${s.doneLessons.length} من ${lessons.length}',
                  onTap: () => push(context, const LessonsListScreen()),
                ),
                ActivityTile(
                  emoji: '💬',
                  title: 'المحادثات',
                  subtitle: 'محادثة اليوم + 10 مواضيع تختار منها · أنهيت ${s.talksDone}',
                  badge: 'اليوم',
                  onTap: () => push(context, const TalkTopicsScreen()),
                ),
                ActivityTile(
                  emoji: '📰',
                  title: 'قسم القراءة',
                  subtitle: '${Library.total} نصاً: قصص، علوم، حياة يومية، عمل، وسفر · قرأت ${s.count('reads')}',
                  badge: 'اليوم',
                  onTap: () => push(context, const ReadingHome()),
                ),
                ActivityTile(
                  emoji: '📖',
                  title: 'قصص بلا حدود',
                  subtitle: 'قصة جديدة بمستواك مع أسئلة فهم · قرأت ${s.storiesRead}',
                  onTap: () => push(context, const StoriesScreen()),
                ),
                const _SectionTitle('تمرّن'),
                ActivityTile(
                  emoji: '🧠',
                  title: 'قلها بالإنجليزية',
                  subtitle: 'ترى الجملة بالعربية وتقولها بالإنجليزية من عندك',
                  onTap: () => push(context, const SayItScreen()),
                ),
                ActivityTile(
                  emoji: '🔖',
                  title: 'مفرداتي',
                  subtitle: dueWords > 0 ? 'كلمات حان موعد مراجعتها' : 'حفظت ${s.words.length} كلمة · ثبّتّ ${s.masteredWords}',
                  badge: dueWords > 0 ? '$dueWords' : null,
                  onTap: () => push(context, const VocabScreen()),
                ),
                ActivityTile(
                  emoji: '🧩',
                  title: 'تركيب الجمل',
                  subtitle: 'رتّب الكلمات لتكوّن جملة صحيحة',
                  onTap: () => push(context, const BuildScreen()),
                ),
                ActivityTile(
                  emoji: '✍️',
                  title: 'إملاء ذكي',
                  subtitle: 'اسمع الجملة واكتب الكلمة الناقصة',
                  onTap: () => push(context, const ClozeScreen()),
                ),
                ActivityTile(
                  emoji: '🎙️',
                  title: 'ردد بعدي',
                  subtitle: 'اسمع الجملة وكررها، والجوال يحدد الكلمات التي لم تتضح',
                  onTap: () => push(context, const ShadowingScreen()),
                ),
                ActivityTile(
                  emoji: '📒',
                  title: 'دفتر أخطائي',
                  subtitle: due > 0 ? 'أخطاء حان موعد مراجعتها' : 'أتقنت ${s.masteredCount} من ${s.mistakes.length}',
                  badge: due > 0 ? '$due' : null,
                  onTap: () => push(context, const MistakesScreen()),
                ),
                ActivityTile(
                  emoji: '⏱️',
                  title: 'تحدي الدقيقة',
                  subtitle: s.bestWpm > 0 ? 'تحدث دقيقة كاملة · أفضل رقم ${s.bestWpm} كلمة' : 'تحدث دقيقة كاملة عن موضوع، وقِس طلاقتك',
                  onTap: () => push(context, const MinuteChallengeScreen()),
                ),
                ActivityTile(
                  emoji: '👂',
                  title: 'أذن عربية',
                  subtitle: 'ميّز الأصوات التي نخلط بينها: P و B، V و F',
                  onTap: () => push(context, const SoundPairsScreen()),
                ),
                ActivityTile(
                  emoji: '🎧',
                  title: 'وضع الاستماع',
                  subtitle: 'جمل تُقرأ لك تلقائياً وأنت في الطريق، بلا لمس الشاشة',
                  onTap: () => push(context, const ListeningScreen()),
                ),
                ActivityTile(
                  emoji: '🎙️',
                  title: 'بودكاست مغرّد',
                  subtitle: 'حوارات بصوتين وحلقات في 6 برامج · سمعت ${s.count('pods')}',
                  badge: 'اليوم',
                  onTap: () => push(context, const PodcastHome()),
                ),
                ActivityTile(
                  emoji: '📚',
                  title: 'المكتبة الصوتية',
                  subtitle: '72 كتاباً صوتياً مرتبة حسب مستواك',
                  onTap: () => push(context, const AudioBooksScreen()),
                ),
                const _SectionTitle('مع الآخرين'),
                ActivityTile(
                  emoji: '🧑‍🤝‍🧑',
                  title: 'تدرّب مع صديق',
                  subtitle: 'محادثة، مكالمات صوتية، مجموعات دراسية، وتحديات كلمات',
                  onTap: () => push(context, const FriendsScreen()),
                ),
                const _SectionTitle('مميزات مغرّد'),
                ActivityTile(
                  emoji: '🩺',
                  title: 'مدرّب أخطائي',
                  subtitle: 'يحلل أخطاءك المتكررة ويبني لك تمارين علاجية',
                  onTap: () => push(context, const ErrorCoachScreen()),
                ),
                ActivityTile(
                  emoji: '👔',
                  title: 'مقابلة عمل حقيقية',
                  subtitle: 'مقابلة بالصوت مع تصحيح فوري وإجابات مقترحة بعد كل سؤال',
                  onTap: () => push(context, const InterviewSetupScreen()),
                ),
                ActivityTile(
                  emoji: '💼',
                  title: 'إنجليزية مهنتك',
                  subtitle: 'مبيعات، طب، ضيافة، وبرمجة',
                  onTap: () => push(context, const CareerTracksScreen()),
                ),
                ActivityTile(
                  emoji: '🥇',
                  title: 'الدوري الأسبوعي',
                  subtitle: 'تنافس مع بقية المتعلمين بدقائق تعلمك',
                  onTap: () => push(context, const LeagueScreen()),
                ),
                ActivityTile(
                  emoji: '🎓',
                  title: 'شهادات المستوى',
                  subtitle: 'امتحان لكل مستوى وشهادة تشاركها',
                  onTap: () => push(context, const CertificatesScreen()),
                ),
                const _SectionTitle('تحدَّ'),
                ActivityTile(
                  emoji: '🤝',
                  title: 'تحدي صديق',
                  subtitle: 'لاعبان على جوال واحد: من يعرف جملاً أكثر؟',
                  onTap: () => push(context, const DuelScreen()),
                ),
                ActivityTile(
                  emoji: '👤',
                  title: 'حسابي',
                  subtitle: 'بياناتك والتواصل معنا · التطبيق مجاني بالكامل',
                  onTap: () => push(context, const AccountScreen()),
                ),
                ActivityTile(
                  emoji: '🏆',
                  title: 'تقدّمي وشاراتي',
                  subtitle: 'رسم الأسبوع، مستوى الخبرة، و${badges.length} شارة',
                  onTap: () => push(context, const ProgressScreen()),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _PlanRow extends StatelessWidget {
  const _PlanRow({required this.done, required this.text});
  final bool done;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Icon(done ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded, color: done ? kOk : kMuted, size: 21),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: TextStyle(color: done ? kMuted : kInk, fontSize: 14.5, decoration: done ? TextDecoration.lineThrough : TextDecoration.none))),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(2, 8, 2, 8),
      child: Text(text, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: kMuted)),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.value, required this.label, required this.color, required this.textColor});
  final String value;
  final String label;
  final Color color;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(18)),
      child: Column(
        children: [
          Text(value, textDirection: TextDirection.ltr, style: TextStyle(color: textColor, fontSize: 22, fontWeight: FontWeight.w900)),
          Text(label, textAlign: TextAlign.center, style: TextStyle(color: textColor, fontSize: 11.5)),
        ],
      ),
    );
  }
}


/// اقتراح اليوم: يختار نشاطاً يناسب حالتك (أخطاء للمراجعة، كلمات، أقسام لم تجربها بعد).
Widget _suggestionCard(BuildContext context, AppStore s, int dueMistakes, int dueWords) {
  String emoji;
  String text;
  Widget Function() open;
  if (dueMistakes > 0) {
    emoji = '📒';
    text = 'عندك $dueMistakes أخطاء حان موعد مراجعتها. دقيقتان تكفيان لتثبيتها.';
    open = () => const MistakesScreen();
  } else if (dueWords > 0) {
    emoji = '🔖';
    text = 'حان موعد مراجعة $dueWords كلمة قبل أن تُنسى.';
    open = () => const VocabScreen();
  } else if (s.count('interview') == 0) {
    emoji = '👔';
    text = 'جرّب مقابلة عمل بالصوت: بعد كل جواب ستحصل على تصحيح وإجابات مقترحة.';
    open = () => const InterviewSetupScreen();
  } else if (s.bestWpm == 0) {
    emoji = '⏱️';
    text = 'جرّب تحدي الدقيقة: تحدث دقيقة كاملة وستحصل على تحسينات مقترحة لكلامك.';
    open = () => const MinuteChallengeScreen();
  } else if (s.count('pods') == 0) {
    emoji = '🎙️';
    text = 'استمع إلى حلقة من البودكاست لتعتاد أذنك على الحوار الطبيعي.';
    open = () => const PodcastHome();
  } else {
    final picks = <List<Object>>[
      ['🎙️', 'كرّر جملاً بصوتك في «ردد بعدي» ودع الجوال يكشف الكلمات غير الواضحة.'],
      ['🎧', 'شغّل وضع الاستماع أثناء مشيك أو سفرك.'],
      ['💬', 'خذ محادثة جديدة وتدرّب على الردود بصوتك.'],
      ['💼', 'تدرّب على جمل مهنتك من «إنجليزية مهنتك».'],
      ['📚', 'استمع إلى فصل من كتاب صوتي بمستواك.'],
      ['🧑‍🤝‍🧑', 'ادعُ صديقاً للتدرّب معاً في غرفة بكود.'],
    ];
    final i = todayNumber() % picks.length;
    emoji = picks[i][0] as String;
    text = picks[i][1] as String;
    const screens = <Widget Function()>[_openShadow, _openListening, _openTalks, _openCareers, _openBooks, _openFriends];
    open = screens[i];
  }
  return AppCard(
    color: kTint,
    onTap: () => push(context, open()),
    child: Row(
      children: [
        Text(emoji, style: const TextStyle(fontSize: 26)),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('اقتراح لك اليوم', style: TextStyle(fontWeight: FontWeight.w900, color: kTeal, fontSize: 13)),
              const SizedBox(height: 2),
              Text(text, style: const TextStyle(color: kInk, height: 1.6, fontSize: 14.5)),
            ],
          ),
        ),
        const Icon(Icons.chevron_left_rounded, color: kTeal),
      ],
    ),
  );
}

Widget _openShadow() => const ShadowingScreen();
Widget _openListening() => const ListeningScreen();
Widget _openTalks() => const TalkTopicsScreen();
Widget _openCareers() => const CareerTracksScreen();
Widget _openBooks() => const AudioBooksScreen();
Widget _openFriends() => const FriendsScreen();
