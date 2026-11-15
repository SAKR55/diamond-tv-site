/// المحتوى الثابت للتطبيق: اختبار المستوى، الدروس، جمل «ردد بعدي»، وغيرها.
/// لإضافة محتوى جديد أضف عناصر إلى القوائم هنا، ولا حاجة لتعديل الشاشات.
library;

import 'pro_extra.dart';

// ---------- اختبار تحديد المستوى ----------

class PlacementQ {
  const PlacementQ(this.q, this.options, this.answer, this.level, {this.skill = 'grammar', this.audio = '', this.passage = ''});
  final String q;
  final List<String> options;
  final int answer;
  final String level;

  /// grammar قواعد، vocab مفردات، reading قراءة، listening استماع
  final String skill;

  /// في أسئلة الاستماع: الجملة التي تُنطق ولا تُعرض.
  final String audio;

  /// في أسئلة القراءة: الفقرة التي يُسأل عنها.
  final String passage;
}

const skillNamesAr = {'grammar': 'القواعد', 'vocab': 'المفردات', 'reading': 'القراءة', 'listening': 'الاستماع'};

const _pA1 = 'Sara is a nurse. She works in a big hospital. She starts work at seven in the morning. On Friday she does not work. She visits her mother.';
const _pA2 = 'Last summer, Omar travelled to Turkey with two friends. They stayed in a small hotel near the sea. The weather was hot, so they swam every day. Omar liked the food so much that he wants to go back next year.';
const _pB1 = 'Although remote work saves employees hours of travel, it is not suitable for everyone. Some people find it difficult to separate their job from their private life, and they end up working longer hours than before. Companies that succeed with remote work usually set clear rules about when employees are expected to be available.';

/// أسئلة المهارات الأخرى في اختبار المستوى الشامل.
const placementSkills = <PlacementQ>[
  // مفردات
  PlacementQ('The opposite of "hot" is ___.', ['cold', 'big', 'fast'], 0, 'A1', skill: 'vocab'),
  PlacementQ('You sleep in a ___.', ['kitchen', 'bedroom', 'garden'], 1, 'A1', skill: 'vocab'),
  PlacementQ('A person who teaches is a ___.', ['driver', 'teacher', 'doctor'], 1, 'A1', skill: 'vocab'),
  PlacementQ('I need to ___ a table at the restaurant.', ['book', 'read', 'lend'], 0, 'A2', skill: 'vocab'),
  PlacementQ('The flight was ___ because of bad weather.', ['delayed', 'delicious', 'crowded'], 0, 'A2', skill: 'vocab'),
  PlacementQ('Can you ___ me your pen for a minute?', ['borrow', 'lend', 'rent'], 1, 'A2', skill: 'vocab'),
  PlacementQ('The manager decided to ___ the meeting until next week.', ['postpone', 'attend', 'cancel out'], 0, 'B1', skill: 'vocab'),
  PlacementQ('She is very ___; you can always depend on her.', ['reliable', 'sensible', 'available'], 0, 'B1', skill: 'vocab'),
  PlacementQ('We need to ___ a solution before the deadline.', ['come up with', 'get on with', 'put up with'], 0, 'B1', skill: 'vocab'),
  // استماع
  PlacementQ('What did you hear?', ['My name is Adam.', 'My name is Anna.', 'My game is on.'], 0, 'A1', skill: 'listening', audio: 'My name is Adam.'),
  PlacementQ('What time is the lesson?', ['At three', 'At five', 'At nine'], 1, 'A1', skill: 'listening', audio: 'The lesson starts at five.'),
  PlacementQ('Where is the bag?', ['On the chair', 'Under the table', 'In the car'], 1, 'A1', skill: 'listening', audio: 'Your bag is under the table.'),
  PlacementQ('Why was the man late?', ['He missed the bus', 'He was sick', 'He forgot'], 0, 'A2', skill: 'listening', audio: 'Sorry I am late. I missed the bus and had to walk.'),
  PlacementQ('What will the woman do tomorrow?', ['Go shopping', 'Visit the doctor', 'Stay at home'], 1, 'A2', skill: 'listening', audio: 'I cannot come tomorrow because I have an appointment with the doctor.'),
  PlacementQ('How much is the ticket?', ['Fifteen dollars', 'Fifty dollars', 'Five dollars'], 1, 'A2', skill: 'listening', audio: 'A return ticket costs fifty dollars.'),
  PlacementQ('What does the speaker suggest?', ['Cancelling the project', 'Hiring more people', 'Extending the deadline'], 2, 'B1', skill: 'listening', audio: 'Instead of hiring more people, I think we should ask the client for two more weeks.'),
  PlacementQ('How does the speaker feel about the new system?', ['Completely satisfied', 'Doubtful at first, now positive', 'Angry'], 1, 'B1', skill: 'listening', audio: 'I had my doubts about the new system at first, but I have to admit it has made our work much easier.'),
  PlacementQ('What happened to the order?', ['It arrived early', 'It was sent to the wrong address', 'It was cancelled'], 1, 'B1', skill: 'listening', audio: 'We apologise for the delay. Your order was sent to the wrong address by mistake, and we are sending a new one today.'),
  // قراءة
  PlacementQ('Where does Sara work?', ['In a school', 'In a hospital', 'In a shop'], 1, 'A1', skill: 'reading', passage: _pA1),
  PlacementQ('What does Sara do on Friday?', ['She works', 'She visits her mother', 'She goes to the hospital'], 1, 'A1', skill: 'reading', passage: _pA1),
  PlacementQ('Where did Omar stay?', ['With his family', 'In a hotel near the sea', 'In a big city hotel'], 1, 'A2', skill: 'reading', passage: _pA2),
  PlacementQ('Why did they swim every day?', ['The hotel was small', 'The weather was hot', 'The food was good'], 1, 'A2', skill: 'reading', passage: _pA2),
  PlacementQ('What problem do some remote workers have?', ['They travel too much', 'They work longer hours', 'They lose their jobs'], 1, 'B1', skill: 'reading', passage: _pB1),
  PlacementQ('What do successful companies do?', ['Stop remote work', 'Set clear rules about availability', 'Pay less'], 1, 'B1', skill: 'reading', passage: _pB1),
];

const placementQuestions = <PlacementQ>[
  PlacementQ('She ___ a teacher.', ['am', 'is', 'are'], 1, 'A1'),
  PlacementQ('I ___ coffee every morning.', ['drink', 'drinks', 'drinking'], 0, 'A1'),
  PlacementQ('___ is your name?', ['Who', 'What', 'Where'], 1, 'A1'),
  PlacementQ('There ___ two books on the table.', ['is', 'are', 'be'], 1, 'A1'),
  PlacementQ('Yesterday I ___ to the market.', ['go', 'went', 'gone'], 1, 'A2'),
  PlacementQ('He is ___ than his brother.', ['tall', 'taller', 'tallest'], 1, 'A2'),
  PlacementQ('I have lived here ___ 2020.', ['for', 'since', 'from'], 1, 'A2'),
  PlacementQ('We ___ dinner when the phone rang.', ['had', 'were having', 'have'], 1, 'A2'),
  PlacementQ('If I ___ more time, I would travel more.', ['have', 'had', 'will have'], 1, 'B1'),
  PlacementQ('The report ___ by the manager yesterday.', ['wrote', 'was written', 'has written'], 1, 'B1'),
  PlacementQ('She asked me where I ___.', ['live', 'lived', 'am living'], 1, 'B1'),
  PlacementQ('I am looking forward to ___ you.', ['see', 'seeing', 'seen'], 1, 'B1'),
  // بنك موسّع: يُسحب منه 4 أسئلة عشوائية لكل مستوى في كل محاولة.
  PlacementQ('They ___ my friends.', ['is', 'are', 'am'], 1, 'A1'),
  PlacementQ('This is ___ apple.', ['a', 'an', 'the'], 1, 'A1'),
  PlacementQ('He ___ football every Friday.', ['play', 'plays', 'playing'], 1, 'A1'),
  PlacementQ('___ you like tea?', ['Do', 'Does', 'Are'], 0, 'A1'),
  PlacementQ('The book is ___ the table.', ['on', 'at', 'to'], 0, 'A1'),
  PlacementQ('I ___ got a brother.', ['has', 'have', 'am'], 1, 'A1'),
  PlacementQ('How ___ is this shirt?', ['many', 'much', 'old'], 1, 'A1'),
  PlacementQ('We ___ students.', ['are', 'is', 'be'], 0, 'A1'),
  PlacementQ('I ___ TV when you called.', ['watched', 'was watching', 'watch'], 1, 'A2'),
  PlacementQ('This is the ___ film I have ever seen.', ['good', 'better', 'best'], 2, 'A2'),
  PlacementQ('She has ___ finished her homework.', ['yet', 'already', 'ever'], 1, 'A2'),
  PlacementQ('We are going ___ visit our uncle tomorrow.', ['to', 'for', 'at'], 0, 'A2'),
  PlacementQ('There is not ___ milk in the fridge.', ['many', 'much', 'few'], 1, 'A2'),
  PlacementQ('You ___ wear a seat belt. It is the law.', ['must', 'can', 'might'], 0, 'A2'),
  PlacementQ('He ___ to school by bus when he was young.', ['goes', 'went', 'has gone'], 1, 'A2'),
  PlacementQ('Have you ___ been to Paris?', ['ever', 'never', 'yet'], 0, 'A2'),
  PlacementQ('If it rains, we ___ at home.', ['stay', 'will stay', 'stayed'], 1, 'B1'),
  PlacementQ('I wish I ___ more free time.', ['have', 'had', 'will have'], 1, 'B1'),
  PlacementQ('The man ___ lives next door is a doctor.', ['who', 'which', 'whose'], 0, 'B1'),
  PlacementQ('By the time we arrived, the film ___.', ['started', 'had started', 'has started'], 1, 'B1'),
  PlacementQ('She suggested ___ a taxi.', ['to take', 'taking', 'take'], 1, 'B1'),
  PlacementQ('He is used to ___ early.', ['wake up', 'waking up', 'woke up'], 1, 'B1'),
  PlacementQ('The bridge ___ built in 1990.', ['is', 'was', 'has'], 1, 'B1'),
  PlacementQ('I would rather ___ at home tonight.', ['stay', 'to stay', 'staying'], 0, 'B1'),
];

/// اختبار شامل متغيّر: لكل مستوى سؤالا قواعد وسؤال مفردات وسؤال استماع وسؤال قراءة = 15 سؤالاً.
List<PlacementQ> drawPlacement() {
  final out = <PlacementQ>[];
  List<PlacementQ> pick(List<PlacementQ> from, String lvl, String skill, int n) {
    final pool = from.where((q) => q.level == lvl && q.skill == skill).toList()..shuffle();
    return pool.take(n).toList();
  }

  for (final lvl in const ['A1', 'A2', 'B1']) {
    out.addAll(pick(placementQuestions, lvl, 'grammar', 2));
    out.addAll(pick(placementSkills, lvl, 'vocab', 1));
    out.addAll(pick(placementSkills, lvl, 'listening', 1));
    out.addAll(pick(placementSkills, lvl, 'reading', 1));
  }
  return out;
}

/// 9 صحيحة فأكثر = B1، 5 فأكثر = A2، أقل = A1.
String levelFromScore(int correct) {
  if (correct >= 9) return 'B1';
  if (correct >= 5) return 'A2';
  return 'A1';
}

const levelNamesAr = {'A1': 'مبتدئ', 'A2': 'أساسي', 'B1': 'متوسط'};

// ---------- الدروس ----------

class LessonStep {
  const LessonStep({
    required this.type,
    required this.promptAr,
    required this.why,
    this.en = '',
    this.options = const [],
    this.answer = 0,
    this.words = const [],
    this.enOptions = false,
    this.kind = 'vocab',
    this.hideText = false,
  });

  /// 'mcq' اختيار من متعدد، 'build' ترتيب كلمات
  final String type;
  final String promptAr;
  final String why;

  /// جملة إنجليزية تُعرض وتُنطق (اختياري)
  final String en;
  final List<String> options;
  final int answer;
  final List<String> words;
  final bool enOptions;

  /// نوع الخطأ عند الحفظ في الدفتر: grammar أو vocab
  final String kind;

  /// تمرين استماع: تُنطق الجملة ولا يظهر نصها إلا بعد الإجابة.
  final bool hideText;
}

class Lesson {
  const Lesson({required this.id, required this.level, required this.titleAr, required this.emoji, required this.steps});
  final String id;
  final String level;
  final String titleAr;
  final String emoji;
  final List<LessonStep> steps;
}

final lessons = <Lesson>[
  Lesson(id: 'a1_meet', level: 'A1', titleAr: 'التعارف', emoji: '👋', steps: [
    LessonStep(type: 'mcq', promptAr: 'استمع واختر المعنى', en: 'Nice to meet you.', options: ['تشرفت بمعرفتك', 'إلى اللقاء', 'كيف حالك؟'], answer: 0, why: 'تقال عند لقاء شخص لأول مرة.'),
    LessonStep(type: 'build', promptAr: 'رتّب: «أنا من مصر»', words: ['I', 'am', 'from', 'Egypt'], why: 'لا تحذف am. الجملة الإنجليزية تحتاج فعل الكينونة.', kind: 'grammar'),
    LessonStep(type: 'mcq', promptAr: 'أي الجملتين صحيحة؟', options: ['My name Ahmed.', 'My name is Ahmed.'], answer: 1, enOptions: true, why: 'خطأ شائع عند المتحدث بالعربية: حذف is.', kind: 'grammar'),
    LessonStep(type: 'mcq', promptAr: 'كيف تسأل شخصاً عن عمله؟', options: ['What do you do?', 'What you do?', 'What are you do?'], answer: 0, enOptions: true, why: 'السؤال في المضارع البسيط يحتاج do قبل الفاعل.', kind: 'grammar'),
  ]),
  Lesson(id: 'a1_cafe', level: 'A1', titleAr: 'في المقهى', emoji: '☕', steps: [
    LessonStep(type: 'mcq', promptAr: 'استمع واختر المعنى', en: 'Can I have a coffee, please?', options: ['أين القهوة؟', 'هل يمكنني الحصول على قهوة من فضلك؟', 'القهوة ساخنة'], answer: 1, why: 'Can I have ...? طريقة مهذبة للطلب.'),
    LessonStep(type: 'build', promptAr: 'رتّب: «أريد كوب ماء»', words: ['I', 'would', 'like', 'a', 'glass', 'of', 'water'], why: 'I would like أكثر تهذيباً من I want.'),
    LessonStep(type: 'mcq', promptAr: 'النادل يسأل: Anything else? ماذا يقصد؟', options: ['هل تريد شيئاً آخر؟', 'هل انتهيت؟', 'كم العدد؟'], answer: 0, why: 'else تعني «آخر» أو «غير ذلك».'),
    LessonStep(type: 'mcq', promptAr: 'كيف تسأل عن السعر؟', options: ['How much is it?', 'How many is it?', 'How price?'], answer: 0, enOptions: true, why: 'How much للسعر وللأشياء غير المعدودة.', kind: 'grammar'),
  ]),
  Lesson(id: 'a2_airport', level: 'A2', titleAr: 'في المطار', emoji: '✈️', steps: [
    LessonStep(type: 'mcq', promptAr: 'استمع واختر المعنى', en: 'Where is the boarding gate?', options: ['متى تقلع الطائرة؟', 'أين بوابة الصعود؟', 'أين حقيبتي؟'], answer: 1, why: 'boarding gate هي بوابة الصعود إلى الطائرة.'),
    LessonStep(type: 'build', promptAr: 'رتّب: «أريد مقعداً بجانب النافذة»', words: ['I', 'would', 'like', 'a', 'window', 'seat'], why: 'window seat بجانب النافذة، aisle seat بجانب الممر.'),
    LessonStep(type: 'mcq', promptAr: 'أي الجملتين صحيحة؟', options: ['My bag heavy.', 'My bag is heavy.'], answer: 1, enOptions: true, why: 'الصفة بعد الاسم تحتاج is قبلها.', kind: 'grammar'),
    LessonStep(type: 'mcq', promptAr: 'كيف تسأل عن موعد الإقلاع؟', options: ['What time does the flight leave?', 'What time the flight leave?', 'When time flight?'], answer: 0, enOptions: true, why: 'نستخدم does مع المفرد الغائب في السؤال.', kind: 'grammar'),
  ]),
  Lesson(id: 'a2_doctor', level: 'A2', titleAr: 'عند الطبيب', emoji: '🩺', steps: [
    LessonStep(type: 'mcq', promptAr: 'استمع واختر المعنى', en: 'I have had a headache since yesterday.', options: ['كان عندي صداع أمس فقط', 'عندي صداع منذ أمس', 'سيكون عندي صداع غداً'], answer: 1, why: 'have had مع since تعني أن الحالة بدأت في الماضي وما زالت.'),
    LessonStep(type: 'mcq', promptAr: 'اختر الكلمة الصحيحة: I have lived here ___ three years.', options: ['since', 'for', 'from'], answer: 1, enOptions: true, why: 'for مع المدة (three years)، since مع نقطة البداية (2020).', kind: 'grammar'),
    LessonStep(type: 'build', promptAr: 'رتّب: «أحتاج أن أرى طبيباً»', words: ['I', 'need', 'to', 'see', 'a', 'doctor'], why: 'بعد need نستخدم to ثم الفعل.', kind: 'grammar'),
    LessonStep(type: 'mcq', promptAr: 'الطبيب يقول: Take it twice a day. كم مرة؟', options: ['مرة واحدة', 'مرتين', 'ثلاث مرات'], answer: 1, why: 'once مرة، twice مرتين، three times ثلاث مرات.'),
  ]),
  Lesson(id: 'b1_interview', level: 'B1', titleAr: 'مقابلة عمل', emoji: '💼', steps: [
    LessonStep(type: 'mcq', promptAr: 'استمع واختر المعنى', en: 'What are your strengths and weaknesses?', options: ['ما راتبك المتوقع؟', 'ما نقاط قوتك وضعفك؟', 'ما خبرتك السابقة؟'], answer: 1, why: 'strengths نقاط القوة، weaknesses نقاط الضعف.'),
    LessonStep(type: 'mcq', promptAr: 'أي الجملتين صحيحة؟', options: ['I have five years of experience.', 'I have experience five years.'], answer: 0, enOptions: true, why: 'الترتيب: المدة ثم of ثم experience.', kind: 'grammar'),
    LessonStep(type: 'build', promptAr: 'رتّب: «أتطلع إلى العمل معكم»', words: ['I', 'look', 'forward', 'to', 'working', 'with', 'you'], why: 'بعد look forward to يأتي الفعل بصيغة ing.', kind: 'grammar'),
    LessonStep(type: 'mcq', promptAr: 'اختر الأنسب: I am responsible ___ the sales team.', options: ['for', 'of', 'about'], answer: 0, enOptions: true, why: 'responsible for وليس of. حرف الجر هنا يُحفظ مع الصفة.', kind: 'grammar'),
  ]),
  Lesson(id: 'b1_meeting', level: 'B1', titleAr: 'اجتماع عمل', emoji: '📊', steps: [
    LessonStep(type: 'mcq', promptAr: 'استمع واختر المعنى', en: 'Could we postpone the meeting until Thursday?', options: ['هل نلغي الاجتماع؟', 'هل يمكن تأجيل الاجتماع إلى الخميس؟', 'هل الاجتماع يوم الخميس؟'], answer: 1, why: 'postpone تأجيل، cancel إلغاء.'),
    LessonStep(type: 'mcq', promptAr: 'أي الجملتين صحيحة؟', options: ['I agree with you.', 'I am agree with you.'], answer: 0, enOptions: true, why: 'agree فعل وليس صفة، فلا يسبقه am.', kind: 'grammar'),
    LessonStep(type: 'build', promptAr: 'رتّب: «لنناقش الميزانية»', words: ["Let's", 'discuss', 'the', 'budget'], why: 'discuss لا يتبعها about. نقول discuss the budget مباشرة.', kind: 'grammar'),
    LessonStep(type: 'mcq', promptAr: 'اختر: If we ___ now, we will finish on time.', options: ['start', 'started', 'will start'], answer: 0, enOptions: true, why: 'بعد if في الحالة الأولى يأتي المضارع البسيط، والنتيجة مع will.', kind: 'grammar'),
  ]),
];

// ---------- ردد بعدي ووضع الاستماع ----------

class Phrase {
  const Phrase(this.en, this.ar, this.level);
  final String en;
  final String ar;
  final String level;
}

final phrases = <Phrase>[
  Phrase('Good morning. How are you?', 'صباح الخير. كيف حالك؟', 'A1'),
  Phrase('My name is Ahmed.', 'اسمي أحمد.', 'A1'),
  Phrase('I am from Egypt.', 'أنا من مصر.', 'A1'),
  Phrase('Where is the bus stop?', 'أين موقف الحافلة؟', 'A1'),
  Phrase('I would like a cup of tea.', 'أريد كوب شاي.', 'A1'),
  Phrase('How much is this?', 'بكم هذا؟', 'A1'),
  Phrase('I do not understand.', 'لا أفهم.', 'A1'),
  Phrase('Can you help me, please?', 'هل يمكنك مساعدتي من فضلك؟', 'A1'),
  Phrase('I went to the market yesterday.', 'ذهبت إلى السوق أمس.', 'A2'),
  Phrase('Could you speak more slowly, please?', 'هل يمكنك التحدث ببطء أكثر من فضلك؟', 'A2'),
  Phrase('I have lived here for three years.', 'أعيش هنا منذ ثلاث سنوات.', 'A2'),
  Phrase('What time does the train leave?', 'متى يغادر القطار؟', 'A2'),
  Phrase('I am looking for a pharmacy.', 'أبحث عن صيدلية.', 'A2'),
  Phrase('This is better than the other one.', 'هذا أفضل من الآخر.', 'A2'),
  Phrase('I would like to book a table for two.', 'أريد حجز طاولة لشخصين.', 'A2'),
  Phrase('Please park the car behind the building.', 'من فضلك أوقف السيارة خلف المبنى.', 'A2'),
  Phrase('I have five years of experience in sales.', 'لدي خمس سنوات من الخبرة في المبيعات.', 'B1'),
  Phrase('I am looking forward to working with you.', 'أتطلع إلى العمل معكم.', 'B1'),
  Phrase('If I had more time, I would learn another language.', 'لو كان لدي وقت أكثر لتعلمت لغة أخرى.', 'B1'),
  Phrase('Could we postpone the meeting until Thursday?', 'هل يمكننا تأجيل الاجتماع إلى الخميس؟', 'B1'),
  Phrase('The project was finished ahead of schedule.', 'انتهى المشروع قبل موعده.', 'B1'),
  Phrase('I completely agree with your point of view.', 'أتفق تماماً مع وجهة نظرك.', 'B1'),
  Phrase('Would you mind sending me the report by email?', 'هل تمانع في إرسال التقرير لي بالبريد؟', 'B1'),
  Phrase('It was very valuable advice, thank you.', 'كانت نصيحة قيّمة جداً، شكراً لك.', 'B1'),
  for (final r in proExtraPhrases)
    if (r.split('|').length == 3) Phrase(r.split('|')[1], r.split('|')[2], r.split('|')[0]),
];

List<Phrase> phrasesFor(String level) {
  final own = phrases.where((p) => p.level == level).toList();
  return own.isEmpty ? phrases.where((p) => p.level == 'A1').toList() : own;
}

// ---------- أذن عربية: أصوات يخلط بينها المتحدث بالعربية ----------

class SoundPair {
  const SoundPair(this.a, this.b, this.label);
  final String a;
  final String b;
  final String label;
}

const soundPairs = <SoundPair>[
  SoundPair('park', 'bark', 'P و B'),
  SoundPair('pen', 'Ben', 'P و B'),
  SoundPair('pear', 'bear', 'P و B'),
  SoundPair('pack', 'back', 'P و B'),
  SoundPair('pray', 'bray', 'P و B'),
  SoundPair('van', 'fan', 'V و F'),
  SoundPair('very', 'ferry', 'V و F'),
  SoundPair('vine', 'fine', 'V و F'),
  SoundPair('vast', 'fast', 'V و F'),
  SoundPair('ship', 'sheep', 'i القصيرة و ee الطويلة'),
  SoundPair('sit', 'seat', 'i القصيرة و ee الطويلة'),
  SoundPair('live', 'leave', 'i القصيرة و ee الطويلة'),
  SoundPair('bit', 'beat', 'i القصيرة و ee الطويلة'),
  SoundPair('pen', 'pan', 'e و a'),
  SoundPair('bed', 'bad', 'e و a'),
];

// ---------- تحدي الدقيقة ----------

class Topic {
  const Topic(this.en, this.ar);
  final String en;
  final String ar;
}

final minuteTopics = <Topic>[
  Topic('Describe your morning routine.', 'صف روتينك الصباحي.'),
  Topic('Talk about your favourite food.', 'تحدث عن طعامك المفضل.'),
  Topic('Describe your city to a visitor.', 'صف مدينتك لزائر.'),
  Topic('Talk about your job or your studies.', 'تحدث عن عملك أو دراستك.'),
  Topic('What did you do last weekend?', 'ماذا فعلت في عطلة نهاية الأسبوع الماضية؟'),
  Topic('Describe a person you admire.', 'صف شخصاً تُعجب به.'),
  Topic('What are your plans for next year?', 'ما خططك للعام القادم؟'),
  Topic('Talk about a trip you enjoyed.', 'تحدث عن رحلة استمتعت بها.'),
  Topic('Why are you learning English?', 'لماذا تتعلم الإنجليزية؟'),
  Topic('Describe your home.', 'صف بيتك.'),
  Topic('Talk about your family.', 'تحدث عن عائلتك.'),
  Topic('What do you do to relax?', 'ماذا تفعل لتسترخي؟'),
  for (final r in proExtraMinuteTopics)
    if (r.split('|').length == 2) Topic(r.split('|')[0], r.split('|')[1]),
];

// ---------- مهمة اليوم في الحياة الواقعية ----------

final dailyMissions = <String>[
  'اطلب مشروبك اليوم بالإنجليزية، ولو مع نفسك أمام المرآة.',
  'سمِّ بالإنجليزية خمسة أشياء تراها حولك الآن بصوت مسموع.',
  'اكتب رسالة قصيرة بالإنجليزية لصديق أو زميل.',
  'صف ما تفعله الآن بجملتين بصوت مسموع.',
  'غيّر لغة جوالك إلى الإنجليزية لمدة ساعة.',
  'شاهد دقيقتين من مقطع إنجليزي واكتب ثلاث كلمات سمعتها.',
  'عرّف بنفسك بالإنجليزية في ثلاثين ثانية وسجّل صوتك.',
  'اقرأ لافتة أو ملصقاً بالإنجليزية وابحث عن كلمة لا تعرفها.',
  'قل بالإنجليزية ماذا ستفعل غداً بثلاث جمل.',
  'علّم شخصاً في بيتك كلمة إنجليزية جديدة.',
  'عدّ من واحد إلى عشرين بالإنجليزية ثم عكسياً.',
  'صف وجبتك اليوم بالإنجليزية: ما هي وما طعمها.',
  'فكّر بالإنجليزية لمدة دقيقة وأنت تمشي.',
  'اسأل نفسك ثلاثة أسئلة بالإنجليزية وأجب عنها.',
  'اكتب ثلاث جمل عن أسبوعك الماضي بالإنجليزية.',
  'اختر كلمتين جديدتين اليوم واستعملهما في جملتين.',
  'سجّل رسالة صوتية بالإنجليزية وأعد سماعها.',
  'صف غرفتك بالإنجليزية بأربع جمل.',
  'اكتب سؤالاً تريد أن تسأله لمدرّب إنجليزي ثم أجب عنه بنفسك.',
  'قل بالإنجليزية ثلاثة أشياء تحبها وثلاثة لا تحبها.',
  ...proExtraMissions,
];

// ---------- كلمات الأطفال ----------

class KidWord {
  const KidWord(this.en, this.emoji, this.ar);
  final String en;
  final String emoji;
  final String ar;
}

final kidWords = <KidWord>[
  KidWord('apple', '🍎', 'تفاحة'),
  KidWord('cat', '🐱', 'قطة'),
  KidWord('sun', '☀️', 'شمس'),
  KidWord('fish', '🐟', 'سمكة'),
  KidWord('ball', '⚽', 'كرة'),
  KidWord('book', '📖', 'كتاب'),
  KidWord('car', '🚗', 'سيارة'),
  KidWord('moon', '🌙', 'قمر'),
  KidWord('dog', '🐶', 'كلب'),
  KidWord('tree', '🌳', 'شجرة'),
  KidWord('banana', '🍌', 'موزة'),
  KidWord('house', '🏠', 'بيت'),
  KidWord('bird', '🐦', 'عصفور'),
  KidWord('milk', '🥛', 'حليب'),
  KidWord('star', '⭐', 'نجمة'),
  KidWord('flower', '🌸', 'زهرة'),
  for (final r in proExtraKidWords)
    if (r.split('|').length == 3) KidWord(r.split('|')[0], r.split('|')[1], r.split('|')[2]),
];

// ---------- تعبير اليوم: تعابير يستخدمها أهل اللغة ولا تُفهم حرفياً ----------

class Idiom {
  const Idiom(this.en, this.ar, this.example);
  final String en;
  final String ar;
  final String example;
}

final idioms = <Idiom>[
  Idiom('a piece of cake', 'شيء سهل جداً', 'The exam was a piece of cake.'),
  Idiom('break the ice', 'يكسر الحاجز في بداية اللقاء', 'He told a joke to break the ice.'),
  Idiom('once in a blue moon', 'نادراً جداً', 'I eat fast food once in a blue moon.'),
  Idiom('under the weather', 'متوعك قليلاً', 'I feel a bit under the weather today.'),
  Idiom('call it a day', 'ننهي العمل لهذا اليوم', 'We are tired. Let us call it a day.'),
  Idiom('hit the books', 'يذاكر بجد', 'I have a test tomorrow, so I need to hit the books.'),
  Idiom('on the same page', 'متفقان ونفهم الأمر بالطريقة نفسها', 'Let us make sure we are on the same page.'),
  Idiom('cost an arm and a leg', 'غالٍ جداً', 'This phone cost an arm and a leg.'),
  Idiom('keep in touch', 'نبقى على تواصل', 'Please keep in touch after you move.'),
  Idiom('better late than never', 'أن تصل متأخراً خير من ألا تصل', 'You finally started learning. Better late than never.'),
  Idiom('it is up to you', 'القرار لك', 'We can walk or take a taxi. It is up to you.'),
  Idiom('take your time', 'خذ وقتك', 'There is no hurry. Take your time.'),
  Idiom('make up your mind', 'احسم قرارك', 'Tea or coffee? Make up your mind.'),
  Idiom('in a hurry', 'مستعجل', 'Sorry, I cannot talk now. I am in a hurry.'),
  Idiom('so far so good', 'الأمور جيدة حتى الآن', 'How is the new job? So far so good.'),
  Idiom('get in touch', 'يتواصل مع', 'I will get in touch with you next week.'),
  Idiom('by heart', 'عن ظهر قلب', 'She knows the poem by heart.'),
  Idiom('from scratch', 'من الصفر', 'He built the business from scratch.'),
  Idiom('give me a hand', 'ساعدني', 'Can you give me a hand with these bags?'),
  Idiom('no worries', 'لا مشكلة', 'Thanks for waiting. No worries.'),
  Idiom('long story short', 'باختصار', 'Long story short, we missed the flight.'),
  Idiom('hang in there', 'اصبر وتماسك', 'Hang in there. The hard part is almost over.'),
  Idiom('sooner or later', 'عاجلاً أم آجلاً', 'Sooner or later, you will speak fluently.'),
  Idiom('on the other hand', 'من ناحية أخرى', 'It is cheap. On the other hand, it is slow.'),
  Idiom('as a matter of fact', 'في الحقيقة', 'As a matter of fact, I lived there for two years.'),
  Idiom('to be honest', 'بصراحة', 'To be honest, I did not like the movie.'),
  Idiom('figure it out', 'يكتشف الحل', 'Do not worry. We will figure it out.'),
  Idiom('the ball is in your court', 'الدور عليك لتقرر', 'I sent my offer. Now the ball is in your court.'),
  Idiom('miss the boat', 'تفوته الفرصة', 'If you wait too long, you will miss the boat.'),
  Idiom('spill the beans', 'يفشي السر', 'Who spilled the beans about the surprise party?'),
  Idiom('let it go', 'اتركه ولا تتمسك به', 'It is the past. Let it go.'),
  Idiom('get used to', 'يعتاد على', 'I am getting used to the new schedule.'),
  Idiom('make sense', 'منطقي ومفهوم', 'Your explanation makes sense to me.'),
  for (final r in proExtraIdioms)
    if (r.split('|').length == 3) Idiom(r.split('|')[0], r.split('|')[1], r.split('|')[2]),
];
