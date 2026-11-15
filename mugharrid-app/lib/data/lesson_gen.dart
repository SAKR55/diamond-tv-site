/// مولّد الدروس: يكمل الدروس إلى 250 درساً.
///   6 دروس مكتوبة يدوياً (في content.dart)
///   40 درساً لمقابلات العمل (10 قوالب × 4 وظائف)
///   204 دروس مواقف مبنية من بنك المحادثات
/// كل درس مولّد فيه تمارين استماع (النص مخفي) وترتيب جمل.
library;

import 'content.dart';
import 'pro_interviews.dart';
import 'talks.dart';

bool _built = false;

const _generic = ['yes', 'no', 'thank', 'sure', 'of course', 'okay', 'great', 'perfect', 'deal', 'here', 'that is fine', 'see you'];

bool _isGeneric(String h) {
  final l = h.toLowerCase();
  return h.split(' ').length < 3 || _generic.any((g) => l.startsWith(g));
}

/// يرتب الخيارات بترتيب ثابت يعتمد على [seed] ويعيد [الخيارات، موضع الصحيح].
List<Object> _mix(String correct, List<String> wrong, int seed) {
  final all = <String>[correct, ...wrong.take(2)];
  final shift = seed % all.length;
  final ordered = [for (var i = 0; i < all.length; i++) all[(i + shift) % all.length]];
  return [ordered, ordered.indexOf(correct)];
}

LessonStep _listen(String coach, String correct, List<String> wrong, int seed) {
  final m = _mix(correct, wrong, seed);
  return LessonStep(
    type: 'mcq',
    promptAr: 'استمع واختر الرد المناسب',
    en: coach,
    hideText: true,
    options: m[0] as List<String>,
    answer: m[1] as int,
    enOptions: true,
    why: 'الرد المناسب: $correct',
  );
}

LessonStep _order(String coach, String reply) {
  return LessonStep(
    type: 'build',
    promptAr: 'قيل لك: «$coach»\nرتّب الكلمات لتكوّن ردّك',
    en: coach,
    words: reply.split(' '),
    kind: 'grammar',
    why: 'الجملة الصحيحة: $reply',
  );
}

// ---------- مقابلات العمل ----------

const _jobs = <List<String>>[
  ['an accountant', 'finance', 'attention to detail', 'محاسب'],
  ['a sales representative', 'sales', 'communication', 'مندوب مبيعات'],
  ['a software developer', 'technology', 'problem solving', 'مبرمج'],
  ['a customer service agent', 'customer service', 'patience', 'خدمة عملاء'],
];

/// كل قالب: [العنوان، سؤال 1، جواب 1، سؤال 2، جواب 2]
const _interviews = <List<String>>[
  ['عرّف بنفسك', 'Tell me about yourself.', 'I am {0} with three years of experience in {1}.', 'Why do you want this job?', 'Because I want to grow my career in {1}.'],
  ['نقاط القوة والضعف', 'What are your strengths?', 'My main strength is {2}.', 'What is your biggest weakness?', 'I sometimes take on too many tasks, but I am learning to plan better.'],
  ['لماذا نوظفك؟', 'Why should we hire you?', 'I have the right experience in {1} and I learn fast.', 'Where do you see yourself in five years?', 'I see myself leading a small team in {1}.'],
  ['وظيفتك السابقة', 'Why did you leave your last job?', 'I am looking for a new challenge in {1}.', 'What do you know about our company?', 'I know that you are one of the leaders in {1}.'],
  ['الضغط والعمل الجماعي', 'How do you handle pressure?', 'I stay calm and divide the work into small steps.', 'Can you work in a team?', 'Yes, I enjoy working with others and sharing ideas.'],
  ['مشكلة قمت بحلها', 'Describe a problem you solved.', 'A client was unhappy, so I listened and found a quick solution.', 'What did you learn from it?', 'I learned that {2} matters in every job.'],
  ['الراتب وموعد البدء', 'What salary do you expect?', 'I expect a fair salary for {0} with my experience.', 'When can you start?', 'I can start two weeks after your offer.'],
  ['تنظيم العمل والأخطاء', 'How do you organise your day?', 'I write a list and start with the most important task.', 'How do you deal with mistakes?', 'I admit the mistake, fix it, and learn from it.'],
  ['ما الذي يحفزك؟', 'What motivates you?', 'I feel motivated when I see real results in {1}.', 'Do you prefer to work alone or in a team?', 'I can do both, but I enjoy teamwork more.'],
  ['أسئلتك في نهاية المقابلة', 'Do you have any questions for us?', 'Yes. What does a normal day look like for {0} here?', 'Is there anything else you want to add?', 'I am excited about this role and ready to start.'],
];

const _badAnswers = ['I do not know, to be honest.', 'My last manager was terrible.', 'I just need the money.', 'I am often late in the morning.', 'No, nothing at all.', 'I do not like working with people.'];

String _job(String t, List<String> j) => t.replaceAll('{0}', j[0]).replaceAll('{1}', j[1]).replaceAll('{2}', j[2]);

List<Lesson> _interviewLessons() {
  final out = <Lesson>[];
  for (var t = 0; t < _interviews.length; t++) {
    for (var j = 0; j < _jobs.length; j++) {
      final iv = _interviews[t];
      final job = _jobs[j];
      final a1 = _job(iv[2], job);
      final a2 = _job(iv[4], job);
      final seed = t * 4 + j;
      out.add(Lesson(
        id: 'iv_${t}_$j',
        level: 'B1',
        titleAr: 'مقابلة عمل (${job[3]}): ${iv[0]}',
        emoji: '🤝',
        steps: [
          _listen(iv[1], a1, [_badAnswers[seed % 6], _badAnswers[(seed + 2) % 6]], seed),
          _order(iv[1], a1),
          _listen(iv[3], a2, [_badAnswers[(seed + 3) % 6], _badAnswers[(seed + 5) % 6]], seed + 1),
          _order(iv[3], a2),
        ],
      ));
    }
  }
  return out;
}

// ---------- دروس المواقف ----------

Lesson _talkLesson(TalkVariant v) {
  final turns = v.talk.turns;
  final seed = v.scenario * 7 + v.row;
  List<String> wrongFor(int turn) {
    final pool = <String>[];
    for (var d = 2; d < turns.length + 2; d++) {
      final other = (turn + d) % turns.length;
      if (other == turn) continue;
      for (final h in turns[other].hints) {
        if (!_isGeneric(h) && !pool.contains(h) && !turns[turn].hints.contains(h)) pool.add(h);
      }
    }
    for (final extra in const ['It is on the second floor.', 'I usually wake up at seven.']) {
      if (pool.length < 2) pool.add(extra);
    }
    return pool;
  }

  String best(int turn) {
    final h = turns[turn].hints;
    return h.firstWhere((x) => !_isGeneric(x), orElse: () => h.first);
  }

  return Lesson(
    id: 'talk_${v.cat.id}_${v.scenario}_${v.row}',
    level: v.level,
    titleAr: '${v.talk.titleAr} (${v.row + 1})',
    emoji: v.cat.emoji,
    steps: [
      _listen(turns[0].coach, best(0), wrongFor(0), seed),
      _order(turns[1].coach, best(1)),
      _listen(turns[2].coach, best(2), wrongFor(2), seed + 1),
      _order(turns[3].coach, best(3)),
      _listen(turns[4].coach, best(4), wrongFor(4), seed + 2),
    ],
  );
}

const kTotalLessons = 250;

/// يُستدعى مرة عند التشغيل، قبل تحميل المحتوى الخارجي.
void buildGeneratedLessons() {
  if (_built) return;
  _built = true;
  final iv = _interviewLessons();
  lessons.addAll(iv);
  final need = kTotalLessons - lessons.length;
  final vars = TalkBank.variants();
  for (var i = 0; i < vars.length && i < need; i++) {
    lessons.add(_talkLesson(vars[i]));
  }
}

/// أسماء الوظائف المتاحة في وضع المقابلة (24 وظيفة).
List<String> interviewJobsAr() => proJobTitles();

/// أسئلة المقابلة لوظيفة: كل عنصر [السؤال، الجواب النموذجي].
/// تجمع القوالب الأساسية (20) + الأسئلة العامة (30) + أسئلة الوظيفة نفسها (6).
List<List<String>> interviewQA(int job) {
  final j = proJobSlots(job);
  return [
    for (final iv in _interviews) ...[
      [iv[1], _job(iv[2], j)],
      [iv[3], _job(iv[4], j)],
    ],
    ...proGeneralQA(job),
    ...proJobQA(job),
  ];
}
