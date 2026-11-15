/// مكتبة القراءة: 5 أقسام × 100 نص = 500 نص.
/// كل قسم فيه 10 قوالب مكتوبة يدوياً، ولكل قالب 10 صيغ ببيانات مختلفة.
/// النصوص تُركَّب عند الطلب فلا تأخذ مساحة، ويمكن إضافة نصوص جديدة من ملف المحتوى الخارجي.
library;

import '../core/generators.dart';
import 'pro_books.dart';

class ReadingText {
  const ReadingText({required this.id, required this.cat, required this.level, required this.title, required this.lines, required this.vocab, required this.quiz});
  final String id;
  final String cat;
  final String level;
  final String title;
  final List<String> lines;
  final List<Vocab> vocab;
  final List<Quiz> quiz;
}

class ReadingCat {
  const ReadingCat(this.id, this.titleAr, this.emoji, this.aboutAr);
  final String id;
  final String titleAr;
  final String emoji;
  final String aboutAr;
}

const readingCats = <ReadingCat>[
  ReadingCat('stories', 'قصص', '📖', 'حكايات قصيرة عن مواقف وأشخاص'),
  ReadingCat('science', 'علوم وطبيعة', '🔬', 'حيوانات، كواكب، ظواهر، واختراعات'),
  ReadingCat('daily', 'حياة يومية', '🏠', 'البيت، التسوق، العادات، والقرارات'),
  ReadingCat('work', 'عمل', '💼', 'الوظيفة، الاجتماعات، والمهارات المهنية'),
  ReadingCat('travel', 'ثقافة وسفر', '✈️', 'مدن، معالم، عادات، ونصائح سفر'),
];

class _F {
  const _F(this.level, this.title, this.lines, this.rows, this.vocab, this.qs);
  final String level;
  final String title;
  final List<String> lines;

  /// 10 صفوف، كل صف قيم الخانات {0} {1} {2} ...
  final List<List<String>> rows;

  /// أزواج متتالية: إنجليزي ثم عربي.
  final List<String> vocab;

  /// كل سؤال: [نص السؤال، رقم الخانة التي فيها الجواب].
  final List<List<Object>> qs;
}

String _cap(String s) => s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);

String _fill(String t, List<String> row) {
  var out = t;
  for (var i = 0; i < row.length; i++) {
    out = out.replaceAll('{$i^}', _cap(row[i])).replaceAll('{$i}', row[i]);
  }
  return out;
}

class Library {
  /// نصوص إضافية تأتي من ملف المحتوى الخارجي، مفتاحها معرّف القسم.
  static final Map<String, List<ReadingText>> extra = {};

  static const perCat = 100;

  static int count(String cat) => perCat + (extra[cat]?.length ?? 0);

  static int get total => readingCats.fold(0, (a, c) => a + count(c.id));

  /// النص رقم [i] في القسم. النصوص الخارجية تأتي أولاً لأنها الأحدث.
  static ReadingText get(String cat, int i) {
    final ex = extra[cat] ?? const <ReadingText>[];
    if (i < ex.length) return ex[ex.length - 1 - i];
    final k = (i - ex.length) % perCat;
    final frames = _frames[cat] ?? _frames['stories']!;
    final f = frames[k % frames.length];
    final r = (k ~/ frames.length) % f.rows.length;
    final row = f.rows[r];
    final quiz = <Quiz>[];
    for (final q in f.qs) {
      final slot = q[1] as int;
      final answer = row[slot];
      final others = <String>[];
      for (var d = 1; d < f.rows.length && others.length < 2; d++) {
        final v = f.rows[(r + d * 3) % f.rows.length][slot];
        if (v != answer && !others.contains(v)) others.add(v);
      }
      if (others.length < 2) continue;
      final options = <String>[answer, ...others];
      // ترتيب ثابت يعتمد على رقم النص حتى لا يتغير عند إعادة الفتح.
      final shift = (k + slot) % 3;
      final ordered = [for (var x = 0; x < 3; x++) options[(x + shift) % 3]];
      quiz.add(Quiz(_fill(q[0] as String, row), ordered.map(_cap).toList(), ordered.indexOf(answer)));
    }
    return ReadingText(
      id: '${cat}_$k',
      cat: cat,
      level: f.level,
      title: _fill(f.title, row),
      lines: [for (final l in f.lines) _fill(l, row)],
      vocab: [for (var v = 0; v + 1 < f.vocab.length; v += 2) Vocab(f.vocab[v], f.vocab[v + 1])],
      quiz: quiz,
    );
  }
}

/// كتاب صوتي: كل قالب في المكتبة كتاب من 10 فصول قصيرة حول موضوع واحد.
class BookInfo {
  const BookInfo(this.cat, this.frame, this.level, this.titleAr, {this.pro});
  final String cat;
  final int frame;
  final String level;
  final String titleAr;

  /// كتاب أصلي مكتوب يدوياً (وإلا فهو كتاب مركّب من قالب).
  final ProBook? pro;

  static const chapters = 10;
  static final Map<String, List<ReadingText>> _proCache = {};

  /// عدد فصول هذا الكتاب.
  int get count => pro?.chapters.length ?? chapters;

  ReadingText chapter(int i) {
    final p = pro;
    if (p != null) {
      final list = _proCache.putIfAbsent(p.id, () => proBookTexts(p));
      return list[i % list.length];
    }
    return Library.get(cat, (Library.extra[cat]?.length ?? 0) + frame + 10 * (i % chapters));
  }

  String get id => pro?.id ?? 'book_${cat}_$frame';
}

const _bookTitles = <String, List<String>>{
  'stories': ['أشياء مفقودة', 'هدايا لمن نحب', 'يوم فاتتني فيه الرحلة', 'مفاجآت صغيرة', 'بداية مهنة جديدة', 'أصدقائي حول العالم', 'أعطال وإصلاحات', 'لقاءات غير متوقعة', 'أشهر الأكلات وأسرارها', 'امتحانات صعبة'],
  'science': ['حيوانات نعرفها', 'رحلة في المجموعة الشمسية', 'كيف تساعدنا الطبيعة', 'تفسير ظواهر الطبيعة', 'فواكه لذيذة', 'الحياة في أماكن عجيبة', 'اختراعات غيّرت العالم', 'جسمي المدهش', 'حيوانات مذهلة', 'حماية كوكبنا'],
  'daily': ['صباح مزدحم', 'في المحلات', 'تجارب في المطبخ', 'مشكلات في البيت', 'عادات أفضل', 'عائلتي', 'زيارات ومعاملات', 'دروس من الناس', 'هواياتي', 'خياران'],
  'work': ['وظائف', 'أول يوم في العمل', 'اجتماعات الفريق', 'مقابلات العمل', 'مهارات العمل', 'مكتبي', 'رحلات عمل', 'مشاريع صغيرة', 'مكالمات العمل', 'مكان العمل الحديث'],
  'travel': ['رحلات إلى مدن', 'في المطار', 'احتفالات الشعوب', 'نصائح السفر', 'في الفندق', 'أماكن مشهورة', 'عادات حول العالم', 'بطاقات بريدية', 'أنواع السياحة', 'يوم في مكان جميل'],
};

/// كل الكتب الصوتية (50 كتاباً مركّباً + 18 كتاباً أصلياً)، يمكن تصفيتها بالمستوى.
List<BookInfo> allBooks() {
  final out = <BookInfo>[];
  for (final c in readingCats) {
    final frames = _frames[c.id] ?? const <_F>[];
    final titles = _bookTitles[c.id] ?? const <String>[];
    for (var f = 0; f < frames.length; f++) {
      out.add(BookInfo(c.id, f, frames[f].level, f < titles.length ? titles[f] : c.titleAr));
    }
  }
  for (var i = 0; i < proBooks.length; i++) {
    final b = proBooks[i];
    out.add(BookInfo(b.cat, 1000 + i, b.level, b.titleAr, pro: b));
  }
  return out;
}

const _frames = <String, List<_F>>{
  // ============================== قصص ==============================
  'stories': [
    _F('A1', 'The Lost {0^}', [
      '{2} had a new {0}.',
      'One day, {2} went to the {1}.',
      'At the {1}, the {0} was gone.',
      '{2} looked everywhere and felt sad.',
      'Then a kind man said: Is this your {0}?',
      '{2} was very happy and said thank you.',
    ], [
      ['bag', 'park', 'Omar'], ['phone', 'market', 'Sara'], ['key', 'school', 'Ali'], ['watch', 'beach', 'Mona'], ['hat', 'zoo', 'Yusuf'],
      ['book', 'library', 'Layla'], ['wallet', 'station', 'Hassan'], ['umbrella', 'cafe', 'Nour'], ['ball', 'garden', 'Adam'], ['ring', 'mall', 'Salma'],
    ], ['gone', 'اختفى', 'everywhere', 'في كل مكان', 'kind', 'طيب'], [['What was lost?', 0], ['Where did {2} go?', 1]]),
    _F('A1', 'A Gift for {0^}', [
      'Tomorrow is a special day for {0}.',
      'I want to buy a gift.',
      'I go to the {2}.',
      'I see {1}. It is beautiful.',
      'I buy it and go home.',
      '{0^} opens the gift and smiles.',
    ], [
      ['my mother', 'a blue scarf', 'clothes shop'], ['my father', 'a brown wallet', 'gift shop'], ['my sister', 'a small bag', 'market'], ['my brother', 'a football', 'sports shop'], ['my friend', 'a good book', 'bookshop'],
      ['my teacher', 'a nice pen', 'stationery shop'], ['my grandmother', 'a warm blanket', 'home shop'], ['my grandfather', 'a new cap', 'hat shop'], ['my wife', 'a silver ring', 'jewellery shop'], ['my son', 'a toy car', 'toy shop'],
    ], ['gift', 'هدية', 'special', 'مميز', 'smile', 'يبتسم'], [['What is the gift?', 1], ['Who is the gift for?', 0]]),
    _F('A2', 'The Day {0} Missed the {1^}', [
      '{0} woke up late on Monday.',
      '{0} ran to the station, but the {1} had already left.',
      'The next {1} was in one hour.',
      'So {0} decided to take {3} to {2}.',
      'It was more expensive, but {0} arrived on time.',
      'Since that day, {0} has always set two alarms.',
    ], [
      ['Karim', 'bus', 'the office', 'a taxi'], ['Dina', 'train', 'the university', 'a shared taxi'], ['Sami', 'bus', 'the airport', 'a private car'], ['Huda', 'train', 'the hospital', 'a bus'], ['Tarek', 'ferry', 'the island', 'a small boat'],
      ['Rana', 'bus', 'the city centre', 'the metro'], ['Fadi', 'train', 'the meeting', 'a taxi'], ['Mariam', 'tram', 'the school', 'a bicycle'], ['Nabil', 'bus', 'the factory', 'a motorbike'], ['Jana', 'metro', 'the museum', 'a minibus'],
    ], ['already', 'بالفعل', 'decided', 'قرر', 'alarm', 'منبه'], [['What did {0} miss?', 1], ['How did {0} travel in the end?', 3]]),
    _F('A2', 'A Surprise in the {0^}', [
      '{2} was walking in the {0} in the evening.',
      'Suddenly, {2} heard a strange sound.',
      'It came from a dark corner.',
      '{2} looked carefully and found {1}.',
      'It was hungry and afraid.',
      '{2} gave it some food and called for help.',
    ], [
      ['park', 'a small cat', 'Lina'], ['garden', 'a little bird', 'Ziad'], ['forest', 'a baby deer', 'Maha'], ['village', 'a lost puppy', 'Khaled'], ['farm', 'a young goat', 'Reem'],
      ['field', 'a small rabbit', 'Anas'], ['valley', 'a baby fox', 'Hala'], ['street', 'a grey kitten', 'Majed'], ['yard', 'a tiny turtle', 'Dana'], ['hills', 'a little lamb', 'Bilal'],
    ], ['suddenly', 'فجأة', 'strange', 'غريب', 'afraid', 'خائف'], [['What did {2} find?', 1], ['Where was {2} walking?', 0]]),
    _F('B1', 'A New Career for {3}', [
      '{3} had worked as {0} for ten years.',
      'Although the salary was good, {3} wanted {2}.',
      'After thinking about it for months, {3} decided to become {1}.',
      'The first year was difficult, and many people said it was a mistake.',
      'However, {3} kept learning and never gave up.',
      'Today, {3} says it was the best decision ever made.',
    ], [
      ['an accountant', 'a chef', 'more creativity', 'Samir'], ['a banker', 'a teacher', 'more meaning in life', 'Noura'], ['an engineer', 'a photographer', 'more freedom', 'Walid'], ['a lawyer', 'a farmer', 'a quieter life', 'Amal'], ['a salesman', 'a programmer', 'a new challenge', 'Hani'],
      ['a nurse', 'a writer', 'more time to think', 'Suha'], ['a manager', 'a baker', 'something simpler', 'Rami'], ['a pharmacist', 'a tour guide', 'to meet new people', 'Lama'], ['a journalist', 'a carpenter', 'to build real things', 'Fares'], ['a secretary', 'a designer', 'more room for imagination', 'Ghada'],
    ], ['salary', 'راتب', 'although', 'مع أن', 'gave up', 'استسلم'], [['What was the old job?', 0], ['What is the new job?', 1]]),
    _F('A1', 'My Friend {0}', [
      '{0} is my friend.',
      '{0} is from {1}.',
      '{0} likes {2}.',
      '{0} loves {3}.',
      'We meet every Friday.',
      '{0} is a very good friend.',
    ], [
      ['Tom', 'England', 'football', 'pizza'], ['Maria', 'Spain', 'music', 'rice'], ['Ken', 'Japan', 'drawing', 'fish'], ['Anna', 'Germany', 'swimming', 'bread'], ['Luca', 'Italy', 'cooking', 'pasta'],
      ['Emre', 'Turkey', 'reading', 'kebab'], ['Priya', 'India', 'dancing', 'curry'], ['Paul', 'France', 'cycling', 'cheese'], ['Chen', 'China', 'tennis', 'noodles'], ['Sofia', 'Greece', 'painting', 'salad'],
    ], ['friend', 'صديق', 'meet', 'نلتقي', 'every', 'كل'], [['Where is {0} from?', 1], ['What does {0} like?', 2]]),
    _F('A2', 'The Broken {0^}', [
      'Last week, my {0} stopped working.',
      'I was worried because I needed it every day.',
      'First, I tried to fix it myself, but I could not.',
      'Then I took it to {1}.',
      'It was ready after {2}.',
      'Now it works better than before.',
    ], [
      ['phone', 'a repair shop', 'two hours'], ['laptop', 'a technician', 'three days'], ['car', 'a mechanic', 'one week'], ['bicycle', 'my neighbour', 'one hour'], ['washing machine', 'an engineer', 'two days'],
      ['watch', 'a watchmaker', 'four days'], ['fridge', 'a repair company', 'a day'], ['camera', 'a small shop', 'five days'], ['printer', 'the office technician', 'thirty minutes'], ['television', 'a service centre', 'ten days'],
    ], ['worried', 'قلق', 'fix', 'يصلح', 'ready', 'جاهز'], [['What stopped working?', 0], ['How long did the repair take?', 2]]),
    _F('B1', 'An Unexpected Meeting in {0}', [
      'While I was travelling through {0}, something unexpected happened.',
      'I was waiting in a queue when someone called my name.',
      'I turned around and saw {1}, whom I had not seen for {2}.',
      'We were both so surprised that we could not speak for a moment.',
      'We spent the whole evening talking about old memories.',
      'It reminded me that the world is smaller than we think.',
    ], [
      ['Istanbul', 'my old school friend', 'fifteen years'], ['London', 'my former teacher', 'twenty years'], ['Dubai', 'my first manager', 'eight years'], ['Paris', 'my childhood neighbour', 'twelve years'], ['Cairo', 'my university roommate', 'ten years'],
      ['Rome', 'an old colleague', 'six years'], ['Amman', 'my cousin', 'seven years'], ['Berlin', 'my old football coach', 'eighteen years'], ['Doha', 'a friend from my first job', 'nine years'], ['Kuala Lumpur', 'my former classmate', 'thirteen years'],
    ], ['unexpected', 'غير متوقع', 'queue', 'طابور', 'memories', 'ذكريات'], [['Where did the meeting happen?', 0], ['Who did the writer meet?', 1]]),
    _F('A2', 'The Best {0^} in Town', [
      '{1} has a small restaurant in the old town.',
      'People come from far away to eat the {0} there.',
      'One day, a customer asked about the secret.',
      '{1} smiled and said: The secret is {2}.',
      'The customer tried to make it at home, but it was not the same.',
      'Some things need many years of practice.',
    ], [
      ['lentil soup', 'Hamdi', 'fresh lemon'], ['bread', 'Salwa', 'a very hot oven'], ['grilled fish', 'Mustafa', 'fresh fish every morning'], ['falafel', 'Nader', 'a special mix of herbs'], ['rice', 'Fatima', 'good butter'],
      ['kebab', 'Jamal', 'a slow fire'], ['hummus', 'Widad', 'lots of patience'], ['pizza', 'Marco', 'a simple tomato sauce'], ['cake', 'Hanan', 'real vanilla'], ['tea', 'Osman', 'clean mountain water'],
    ], ['secret', 'سر', 'customer', 'زبون', 'practice', 'ممارسة'], [['What is the famous food?', 0], ['What is the secret?', 2]]),
    _F('B1', 'A Difficult Exam', [
      '{3} had always been afraid of {0}.',
      'Before the final exam, {3} failed the practice test with a score of {1}.',
      'Instead of giving up, {3} changed the way of studying and started {2}.',
      'It took a lot of effort, and progress was slow at first.',
      'On the day of the exam, {3} felt calm and prepared.',
      'The result was excellent, and it proved that the method matters more than talent.',
    ], [
      ['mathematics', '40 percent', 'solving ten problems every day', 'Ibrahim'], ['physics', '35 percent', 'studying with a small group', 'Shahd'], ['chemistry', '45 percent', 'watching short lessons every night', 'Mazen'], ['English grammar', '50 percent', 'writing five sentences every morning', 'Rawan'], ['statistics', '30 percent', 'explaining the lessons to a friend', 'Tamer'],
      ['history', '48 percent', 'making short summaries', 'Nada'], ['biology', '42 percent', 'drawing simple diagrams', 'Yazan'], ['accounting', '38 percent', 'practising with real examples', 'Lubna'], ['programming', '25 percent', 'building small projects', 'Qasim'], ['economics', '44 percent', 'reading one chapter a day', 'Asma'],
    ], ['effort', 'جهد', 'progress', 'تقدم', 'method', 'طريقة'], [['Which subject was difficult?', 0], ['What new method was used?', 2]]),
  ],

  // ============================== علوم وطبيعة ==============================
  'science': [
    _F('A1', 'The {0^}', [
      'The {0} is an animal.',
      'It lives in {1}.',
      'It eats {2}.',
      '{3}',
      'Many children like the {0}.',
    ], [
      ['lion', 'Africa', 'meat', 'It is very strong.'], ['elephant', 'Africa and Asia', 'plants', 'It is very big.'], ['camel', 'the desert', 'dry plants', 'It can go many days without water.'], ['penguin', 'cold places', 'fish', 'It cannot fly, but it swims well.'], ['giraffe', 'the African savanna', 'leaves', 'It has a very long neck.'],
      ['panda', 'China', 'bamboo', 'It is black and white.'], ['kangaroo', 'Australia', 'grass', 'It jumps very far.'], ['dolphin', 'the sea', 'small fish', 'It is very clever.'], ['polar bear', 'the Arctic', 'seals', 'It has thick white fur.'], ['monkey', 'forests', 'fruit', 'It climbs trees quickly.'],
    ], ['animal', 'حيوان', 'lives', 'يعيش', 'eats', 'يأكل'], [['Where does the {0} live?', 1], ['What does the {0} eat?', 2]]),
    _F('A2', 'Facts About {0^}', [
      '{0^} is part of our solar system.',
      'It is known as {1}.',
      '{2}',
      '{3}',
      'Scientists still study {0} to learn more about space.',
    ], [
      ['Mercury', 'the closest planet to the Sun', 'It is also the smallest planet.', 'A year there is only 88 Earth days.'],
      ['Venus', 'the hottest planet', 'It is covered by thick clouds.', 'It is almost the same size as Earth.'],
      ['Earth', 'the only planet known to have life', 'Most of its surface is covered by water.', 'It takes about 365 days to go around the Sun.'],
      ['Mars', 'the red planet', 'It has the highest volcano in the solar system.', 'A day there is a little longer than a day on Earth.'],
      ['Jupiter', 'the largest planet', 'It is made mostly of gas.', 'It has a giant storm called the Great Red Spot.'],
      ['Saturn', 'the planet with bright rings', 'Its rings are made of ice and rock.', 'It is the second largest planet.'],
      ['Uranus', 'the planet that spins on its side', 'It is extremely cold.', 'It takes about 84 Earth years to go around the Sun.'],
      ['Neptune', 'the farthest planet from the Sun', 'It has very strong winds.', 'It looks blue.'],
      ['the Moon', 'the natural satellite of Earth', 'It has no air to breathe.', 'People first walked on it in 1969.'],
      ['the Sun', 'the star at the centre of our solar system', 'It gives us light and heat.', 'It is much bigger than all the planets.'],
    ], ['solar system', 'المجموعة الشمسية', 'planet', 'كوكب', 'surface', 'سطح'], [['What is {0} known as?', 1]]),
    _F('A2', 'How {0^} Help Us', [
      '{0^} are very important for life on Earth.',
      'First, they {1}.',
      'Second, they {2}.',
      'However, {3}.',
      'That is why we must protect {0}.',
    ], [
      ['trees', 'give us oxygen', 'give shade and fruit', 'many trees are cut down every year'],
      ['bees', 'carry pollen from flower to flower', 'make honey', 'their numbers are falling in many places'],
      ['rivers', 'give us fresh water', 'help farmers grow food', 'many rivers are polluted'],
      ['forests', 'are home to many animals', 'clean the air', 'fires destroy large areas every year'],
      ['oceans', 'produce much of the oxygen we breathe', 'give us fish', 'plastic waste is a serious problem'],
      ['mountains', 'store water as snow and ice', 'are home to rare plants', 'the ice is melting faster than before'],
      ['wetlands', 'clean water naturally', 'protect land from floods', 'many wetlands have been dried'],
      ['earthworms', 'make the soil richer', 'help water reach the roots of plants', 'chemicals in the soil can kill them'],
      ['bats', 'eat huge numbers of insects', 'spread the seeds of some plants', 'they are losing their homes'],
      ['coral reefs', 'are home to thousands of sea animals', 'protect beaches from strong waves', 'warmer water is damaging them'],
    ], ['protect', 'يحمي', 'however', 'لكن', 'important', 'مهم'], [['What is the first way {0} help us?', 1], ['What is the problem?', 3]]),
    _F('B1', 'Explaining Nature: {0^}', [
      'Most people know what {0} is, but few can explain it.',
      '{1}',
      '{2}',
      'Understanding nature helps us prepare for it and respect it.',
    ], [
      ['rain', 'Water from seas and lakes turns into vapour, rises, and forms clouds.', 'When the drops in the clouds become heavy, they fall as rain.'],
      ['thunder', 'Lightning heats the air around it very quickly.', 'The hot air expands suddenly and makes the loud sound we call thunder.'],
      ['a rainbow', 'Sunlight looks white, but it is made of many colours.', 'When light passes through raindrops, it bends and the colours separate.'],
      ['wind', 'The Sun heats some parts of the Earth more than others.', 'Warm air rises and cooler air moves in to take its place, which creates wind.'],
      ['snow', 'High in the clouds, the air can be extremely cold.', 'Water vapour freezes into tiny ice crystals that join together and fall as snow.'],
      ['fog', 'Fog is simply a cloud that forms near the ground.', 'It appears when warm, wet air cools down quickly.'],
      ['the tide', 'The Moon pulls on the water of the oceans.', 'As the Earth turns, this pull makes the sea level rise and fall.'],
      ['an earthquake', 'The surface of the Earth is made of huge plates that move very slowly.', 'When two plates suddenly slip past each other, the ground shakes.'],
      ['a volcano', 'Deep under the ground, rock is so hot that it melts.', 'When pressure builds up, the melted rock escapes through an opening in the surface.'],
      ['lightning', 'Inside a storm cloud, tiny pieces of ice rub against each other and create electricity.', 'When the charge becomes strong enough, it jumps through the air as a bright flash.'],
    ], ['explain', 'يشرح', 'vapour', 'بخار', 'pressure', 'ضغط'], [['What does this text explain?', 0]]),
    _F('A1', 'The {0^}', [
      'The {0} is a fruit.',
      'It is {1}.',
      'It grows on {2}.',
      'It tastes {3}.',
      'It is good for your body.',
    ], [
      ['apple', 'red or green', 'apple trees', 'sweet'], ['banana', 'yellow', 'tall banana plants', 'soft and sweet'], ['lemon', 'bright yellow', 'lemon trees', 'sour'], ['orange', 'orange', 'orange trees', 'sweet and fresh'], ['grape', 'green or purple', 'vines', 'sweet and juicy'],
      ['strawberry', 'red', 'small plants', 'sweet and a little sour'], ['watermelon', 'green outside and red inside', 'the ground', 'fresh and watery'], ['date', 'brown', 'palm trees', 'very sweet'], ['mango', 'yellow and orange', 'mango trees', 'rich and sweet'], ['olive', 'green or black', 'olive trees', 'bitter'],
    ], ['fruit', 'فاكهة', 'grows', 'ينمو', 'tastes', 'طعمه'], [['What colour is the {0}?', 1], ['Where does it grow?', 2]]),
    _F('A2', 'Life in the {0^}', [
      'The {0} is a special place on our planet.',
      'Conditions there are {1}.',
      'Animals like {2} live there.',
      '{3}',
      'Life is not easy there, but nature always finds a way.',
    ], [
      ['desert', 'hot in the day and cold at night', 'camels and snakes', 'Plants there can store water for a long time.'],
      ['rainforest', 'warm and wet all year', 'monkeys and colourful birds', 'The trees are so tall that little light reaches the ground.'],
      ['Arctic', 'freezing for most of the year', 'polar bears and seals', 'Much of the sea there is covered with ice.'],
      ['savanna', 'warm with a long dry season', 'lions and zebras', 'It is covered with grass and a few trees.'],
      ['deep ocean', 'cold and completely dark', 'strange fish that make their own light', 'No plants can grow there because there is no sunlight.'],
      ['high mountain region', 'cold and windy', 'wild goats and eagles', 'The air has less oxygen than at sea level.'],
      ['coral reef', 'warm and clear', 'colourful fish and sea turtles', 'It is built slowly by tiny animals over many years.'],
      ['tundra', 'very cold with a short summer', 'reindeer and Arctic foxes', 'The ground stays frozen below the surface.'],
      ['wetland', 'wet for most of the year', 'frogs and water birds', 'It works like a natural filter that cleans water.'],
      ['grassland', 'windy with hot summers and cold winters', 'wild horses and rabbits', 'Its soil is very good for farming.'],
    ], ['conditions', 'ظروف', 'special', 'مميز', 'nature', 'الطبيعة'], [['Which animals live there?', 2], ['What are conditions like?', 1]]),
    _F('B1', 'Inventions: {0^}', [
      'It is hard to imagine modern life without {0}.',
      '{1}',
      'Before that, {2}.',
      'Today, {3}.',
      'This shows how one idea can change the lives of billions of people.',
    ], [
      ['the telephone', 'Alexander Graham Bell received a patent for it in 1876.', 'people had to send letters and wait days for an answer', 'we carry phones in our pockets and call anyone in seconds'],
      ['the electric light bulb', 'Thomas Edison developed a practical version in 1879.', 'people used candles and oil lamps after dark', 'cities are bright all night'],
      ['the airplane', 'The Wright brothers made the first powered flight in 1903.', 'crossing an ocean took weeks by ship', 'the same trip takes only a few hours'],
      ['the printing press', 'Johannes Gutenberg built it in the fifteenth century.', 'books were copied by hand and were very expensive', 'millions of books are printed every year'],
      ['the World Wide Web', 'Tim Berners-Lee invented it in 1989.', 'finding information meant going to a library', 'we can search for almost anything from home'],
      ['penicillin', 'Alexander Fleming discovered it in 1928.', 'a small infection could kill a healthy person', 'doctors use antibiotics to treat many diseases'],
      ['the steam engine', 'James Watt greatly improved it in the eighteenth century.', 'most work was done by people and animals', 'machines do much of the heavy work'],
      ['the radio', 'Guglielmo Marconi sent radio signals over long distances in the 1890s.', 'news travelled slowly from town to town', 'we receive news the moment it happens'],
      ['the vaccine', 'Edward Jenner tested the first vaccine in 1796.', 'diseases like smallpox killed millions of people', 'many dangerous diseases can be prevented'],
      ['the refrigerator', 'Home refrigerators became common in the twentieth century.', 'people kept food fresh with ice or salt', 'food stays fresh for days or weeks'],
    ], ['invention', 'اختراع', 'imagine', 'يتخيل', 'modern', 'حديث'], [['Which invention is the text about?', 0], ['What was life like before it?', 2]]),
    _F('A1', 'My Body: My {0^}', [
      'My body is amazing.',
      'I use my {0} to {1}.',
      'With my {0}, I can {1} {2}.',
      'I must take care of my {0}.',
      'A healthy body makes me happy.',
    ], [
      ['eyes', 'see', 'colours and shapes'], ['ears', 'hear', 'music and voices'], ['nose', 'smell', 'flowers and food'], ['tongue', 'taste', 'sweet and sour food'], ['hands', 'hold', 'a pen or a cup'],
      ['legs', 'walk', 'to school'], ['teeth', 'eat', 'apples and bread'], ['brain', 'think', 'about new ideas'], ['fingers', 'touch', 'soft and hard things'], ['lungs', 'breathe', 'fresh air'],
    ], ['body', 'جسم', 'take care', 'يعتني', 'healthy', 'صحي'], [['What do I use my {0} for?', 1]]),
    _F('A2', 'Amazing Animals: The {0^}', [
      'The {0} is {1}.',
      '{2}',
      '{3}',
      'Animals like this show us how wonderful nature is.',
    ], [
      ['cheetah', 'the fastest animal on land', 'It can reach about 100 kilometres per hour.', 'But it can only run that fast for a short time.'],
      ['blue whale', 'the largest animal on Earth', 'It can be about 30 metres long.', 'It eats tiny sea animals called krill.'],
      ['owl', 'a bird that hunts at night', 'It can turn its head very far to each side.', 'Its soft feathers help it fly quietly.'],
      ['octopus', 'a very clever sea animal', 'It has eight arms and three hearts.', 'It can change its colour to hide.'],
      ['chameleon', 'a lizard that changes colour', 'It can move each eye in a different direction.', 'It catches insects with its long tongue.'],
      ['hummingbird', 'one of the smallest birds', 'It can fly backwards.', 'It beats its wings many times every second.'],
      ['ant', 'a tiny but strong insect', 'It can carry things much heavier than its body.', 'Ants live and work together in large groups.'],
      ['bat', 'the only mammal that can truly fly', 'It finds its way in the dark using sound.', 'Many bats sleep upside down.'],
      ['salmon', 'a fish that makes a long journey', 'It is born in a river and then swims to the sea.', 'Years later, it returns to the same river.'],
      ['camel', 'an animal made for the desert', 'It stores fat in its hump.', 'It can close its nose during a sandstorm.'],
    ], ['amazing', 'مدهش', 'wonderful', 'رائع', 'journey', 'رحلة'], [['What is special about the {0}?', 1]]),
    _F('B1', 'Protecting the Planet: {0^}', [
      '{0^} is one of the environmental challenges of our time.',
      '{1}',
      'One practical solution is {2}.',
      'If enough people take this step, {3}.',
      'Small actions, repeated by millions, can make a real difference.',
    ], [
      ['plastic waste', 'A plastic bottle can take hundreds of years to break down.', 'to carry a reusable bottle and bag', 'far less plastic will reach the sea'],
      ['air pollution', 'Cars and factories release gases that harm our lungs.', 'to walk, cycle, or use public transport more often', 'the air in our cities will become cleaner'],
      ['water shortage', 'Fresh water is limited, and many regions do not have enough.', 'to fix leaks and take shorter showers', 'there will be more water for everyone'],
      ['food waste', 'A large amount of the food we produce is thrown away.', 'to buy only what we need and eat leftovers', 'we will save money and resources'],
      ['deforestation', 'Large areas of forest are cut down every year.', 'to use less paper and support tree planting', 'forests will have a chance to recover'],
      ['energy use', 'Much of our electricity still comes from burning fuel.', 'to switch off lights and devices we are not using', 'we will burn less fuel'],
      ['overfishing', 'In some seas, fish are caught faster than they can reproduce.', 'to choose fish from responsible sources', 'fish numbers can grow again'],
      ['electronic waste', 'Old phones and computers contain harmful materials.', 'to repair devices or recycle them properly', 'fewer harmful materials will enter the soil'],
      ['noise pollution', 'Constant noise in cities affects sleep and health.', 'to plant trees along busy roads', 'our neighbourhoods will be quieter'],
      ['fast fashion', 'Cheap clothes are often worn a few times and then thrown away.', 'to buy fewer clothes of better quality', 'less clothing will end up as waste'],
    ], ['challenge', 'تحدٍّ', 'solution', 'حل', 'waste', 'نفايات'], [['Which challenge does the text discuss?', 0], ['What solution is suggested?', 2]]),
  ],

  // ============================== حياة يومية ==============================
  'daily': [
    _F('A1', 'A Busy Morning', [
      '{0} wakes up at {1}.',
      '{0} washes and gets dressed.',
      'For breakfast, {0} has {2}.',
      'Then {0} goes to work by {3}.',
      'It is a busy morning.',
    ], [
      ['Ahmed', 'six', 'eggs and bread', 'bus'], ['Mona', 'seven', 'cheese and tea', 'car'], ['Ali', 'half past six', 'yogurt and honey', 'metro'], ['Sara', 'five', 'dates and milk', 'train'], ['Omar', 'eight', 'a sandwich and juice', 'bicycle'],
      ['Huda', 'quarter past seven', 'beans and bread', 'taxi'], ['Yusuf', 'half past five', 'oats and fruit', 'minibus'], ['Laila', 'half past seven', 'toast and jam', 'tram'], ['Hassan', 'quarter to seven', 'an omelette and coffee', 'motorbike'], ['Nour', 'quarter past six', 'fruit and tea', 'ferry'],
    ], ['wakes up', 'يستيقظ', 'breakfast', 'فطور', 'busy', 'مشغول'], [['What does {0} have for breakfast?', 2], ['How does {0} go to work?', 3]]),
    _F('A1', 'At the {0^}', [
      'Today I go to the {0}.',
      'I need {1} and {2}.',
      'I ask: How much is it?',
      'The man says: It is {3}.',
      'I pay and say thank you.',
    ], [
      ['supermarket', 'milk', 'eggs', 'five dollars'], ['bakery', 'bread', 'a cake', 'three dollars'], ['pharmacy', 'medicine', 'soap', 'eight dollars'], ['bookshop', 'a notebook', 'two pens', 'four dollars'], ['market', 'tomatoes', 'onions', 'two dollars'],
      ['butcher shop', 'meat', 'chicken', 'twenty dollars'], ['fruit shop', 'apples', 'bananas', 'six dollars'], ['clothes shop', 'a shirt', 'socks', 'thirty dollars'], ['phone shop', 'a charger', 'a cover', 'fifteen dollars'], ['flower shop', 'roses', 'a card', 'ten dollars'],
    ], ['need', 'أحتاج', 'how much', 'بكم', 'pay', 'أدفع'], [['Where do I go?', 0], ['How much is it?', 3]]),
    _F('A2', 'Cooking {0^}', [
      'Yesterday I cooked {0} for the first time.',
      'The main ingredient is {1}.',
      'My {3} taught me the recipe on the phone.',
      'It took about {2} to prepare.',
      'I made a few mistakes, but the taste was good.',
      'Next time, I will invite my friends.',
    ], [
      ['lentil soup', 'red lentils', 'forty minutes', 'mother'], ['chicken with rice', 'chicken', 'one hour', 'grandmother'], ['pasta', 'tomato sauce', 'twenty minutes', 'brother'], ['a big salad', 'fresh vegetables', 'ten minutes', 'sister'], ['grilled fish', 'fresh fish', 'thirty minutes', 'father'],
      ['an omelette', 'eggs', 'five minutes', 'friend'], ['stuffed vegetables', 'rice and minced meat', 'two hours', 'aunt'], ['pancakes', 'flour and milk', 'fifteen minutes', 'cousin'], ['beef stew', 'beef and potatoes', 'ninety minutes', 'uncle'], ['chocolate cake', 'chocolate and butter', 'fifty minutes', 'neighbour'],
    ], ['ingredient', 'مكوّن', 'recipe', 'وصفة', 'invite', 'يدعو'], [['What did the writer cook?', 0], ['How long did it take?', 2]]),
    _F('A2', 'A Problem at Home', [
      'Last night, there was a problem at home: {0}.',
      'I did not know how to fix it.',
      'In the morning, I called {1}.',
      'He came {2} and solved the problem quickly.',
      'I paid {3}.',
      'Now I know who to call next time.',
    ], [
      ['the kitchen tap was leaking', 'a plumber', 'after an hour', 'twenty dollars'], ['the lights went out', 'an electrician', 'at noon', 'thirty dollars'], ['the door lock was broken', 'a locksmith', 'in thirty minutes', 'twenty-five dollars'], ['the air conditioner stopped', 'a technician', 'in the afternoon', 'fifty dollars'], ['the washing machine made a loud noise', 'a repairman', 'the next day', 'forty dollars'],
      ['the internet was not working', 'a network technician', 'after two hours', 'ten dollars'], ['a window was broken', 'a glass worker', 'before lunch', 'thirty-five dollars'], ['the heater was cold', 'a heating engineer', 'in the evening', 'sixty dollars'], ['the sink was blocked', 'a handyman', 'within an hour', 'fifteen dollars'], ['the fridge was warm', 'an appliance technician', 'late in the afternoon', 'forty-five dollars'],
    ], ['fix', 'يصلح', 'solved', 'حلّ', 'quickly', 'بسرعة'], [['What was the problem?', 0], ['Who did the writer call?', 1]]),
    _F('B1', 'Better Habits: {0^}', [
      'Many adults struggle with {0}.',
      '{1}',
      'A simple technique that works for many people is {2}.',
      'It may feel strange at first, but after a few weeks it becomes a habit.',
      'The key is to start small and stay consistent.',
    ], [
      ['managing their time', 'There never seem to be enough hours in the day.', 'to plan the three most important tasks every morning'],
      ['saving money', 'Small daily expenses add up without our noticing.', 'to write down everything you spend for one month'],
      ['dealing with stress', 'Pressure at work and at home can affect our health.', 'to take a ten-minute walk without your phone'],
      ['getting enough sleep', 'Screens and late dinners keep the mind awake.', 'to go to bed at the same time every night'],
      ['spending less time on their phones', 'Notifications are designed to grab our attention.', 'to turn off all notifications except calls'],
      ['eating healthily', 'Fast food is cheap and available everywhere.', 'to prepare meals for the week on the weekend'],
      ['exercising regularly', 'After a long day, the sofa looks more attractive than the gym.', 'to exercise for only fifteen minutes, but every day'],
      ['keeping their homes tidy', 'Things pile up quickly when life gets busy.', 'to spend ten minutes tidying before bed'],
      ['reading more books', 'It is easy to say there is no time to read.', 'to read ten pages every night before sleeping'],
      ['staying in touch with friends', 'Everyone is busy, and months pass without a call.', 'to call one friend every weekend'],
    ], ['struggle', 'يعاني', 'habit', 'عادة', 'consistent', 'مواظب'], [['What technique is suggested?', 2], ['What is the text about?', 0]]),
    _F('A1', 'My {0^}', [
      'This is my {0}.',
      'My {0} is {2} years old.',
      'My {0} is {1}.',
      'My {0} likes {3}.',
      'I love my {0} very much.',
    ], [
      ['father', 'a doctor', 'fifty', 'reading'], ['mother', 'a teacher', 'forty-five', 'cooking'], ['brother', 'a student', 'twenty', 'football'], ['sister', 'a nurse', 'twenty-six', 'drawing'], ['grandfather', 'a farmer', 'seventy', 'gardening'],
      ['grandmother', 'a tailor', 'sixty-eight', 'telling stories'], ['uncle', 'a driver', 'forty', 'fishing'], ['aunt', 'a baker', 'thirty-eight', 'music'], ['cousin', 'an engineer', 'thirty', 'travelling'], ['husband', 'a pilot', 'thirty-five', 'swimming'],
    ], ['family', 'عائلة', 'years old', 'عمره', 'love', 'أحب'], [['What is the job?', 1], ['How old?', 2]]),
    _F('A2', 'A Visit to the {0^}', [
      'This morning I went to the {0}.',
      'I needed to {1}.',
      'There were many people, so I waited for {2}.',
      'The employee was {3} and explained everything.',
      'I finished everything in one visit.',
    ], [
      ['bank', 'open a new account', 'twenty minutes', 'very polite'], ['post office', 'send a package', 'ten minutes', 'friendly'], ['hospital', 'see a doctor', 'an hour', 'kind'], ['police station', 'report a lost passport', 'thirty minutes', 'helpful'], ['city office', 'renew my ID card', 'forty minutes', 'patient'],
      ['phone company', 'change my plan', 'fifteen minutes', 'professional'], ['embassy', 'apply for a visa', 'two hours', 'calm'], ['school', 'register my son', 'half an hour', 'welcoming'], ['library', 'get a membership card', 'five minutes', 'cheerful'], ['traffic office', 'renew my driving licence', 'fifty minutes', 'quick'],
    ], ['employee', 'موظف', 'explained', 'شرح', 'waited', 'انتظرت'], [['Why did the writer go there?', 1], ['How long was the wait?', 2]]),
    _F('B1', 'A Lesson from {0^}', [
      'I learned an important lesson from {0}.',
      '{1}',
      'At first, I did not understand why.',
      'Later, I realised that {2}.',
      'Since then, I have tried to do the same in my own life.',
    ], [
      ['my grandfather', 'He used to wake up before sunrise every single day.', 'the quiet morning hours gave him time to think'],
      ['my first boss', 'She never answered an angry email on the same day.', 'a calm reply is always better than a fast one'],
      ['a taxi driver', 'He greeted every passenger with a smile, even late at night.', 'a good mood is a choice we make'],
      ['my neighbour', 'She waters her plants at the same time every evening.', 'small daily care produces big results'],
      ['my daughter', 'She asks why about everything she sees.', 'curiosity is the beginning of all learning'],
      ['an old shopkeeper', 'He always gave customers a little more than they paid for.', 'generosity brings people back'],
      ['my sports coach', 'He made us repeat the basics in every training session.', 'mastery comes from simple things done well'],
      ['a stranger on a train', 'He gave his seat to an old man without being asked.', 'kindness does not need an invitation'],
      ['my mother', 'She writes a shopping list before leaving the house.', 'a little planning saves a lot of time'],
      ['a colleague', 'He says no politely when he is too busy.', 'respecting your limits is not rude'],
    ], ['lesson', 'درس', 'realised', 'أدركت', 'since then', 'منذ ذلك الحين'], [['Who taught the writer a lesson?', 0], ['What was the lesson?', 2]]),
    _F('A2', 'My Hobby: {0^}', [
      'In my free time, I enjoy {0}.',
      'I usually do it {1}.',
      'My favourite place for it is {2}.',
      'I like it because {3}.',
      'Everyone needs a hobby to relax.',
    ], [
      ['reading', 'before bed', 'my balcony', 'it takes me to other worlds'], ['running', 'early in the morning', 'the park near my house', 'it gives me energy'], ['cooking', 'on weekends', 'my small kitchen', 'I love sharing food'], ['fishing', 'on Fridays', 'a quiet lake', 'it teaches me patience'], ['drawing', 'in the evening', 'my desk by the window', 'it helps me relax'],
      ['gardening', 'after work', 'the roof of my building', 'I like watching things grow'], ['swimming', 'twice a week', 'the local pool', 'it is good for my back'], ['photography', 'at sunset', 'the old town', 'I notice beautiful details'], ['cycling', 'on Saturday mornings', 'the road by the sea', 'I feel free'], ['playing chess', 'at night', 'a small cafe', 'it trains my mind'],
    ], ['free time', 'وقت الفراغ', 'enjoy', 'أستمتع', 'relax', 'يسترخي'], [['What is the hobby?', 0], ['Why does the writer like it?', 3]]),
    _F('B1', 'Two Choices', [
      'Many people wonder whether they should {0}.',
      'On the one hand, {1}.',
      'On the other hand, {2}.',
      'There is no single answer that fits everyone.',
      'The best choice depends on your situation, your budget, and your goals.',
    ], [
      ['buy a house or rent one', 'owning a home gives stability', 'renting offers more freedom to move'],
      ['buy a new car or a used one', 'a new car has fewer problems', 'a used car costs much less'],
      ['cook at home or eat out', 'home cooking is cheaper and healthier', 'eating out saves time and effort'],
      ['work from home or go to the office', 'working from home saves travel time', 'the office makes teamwork easier'],
      ['live in a city or in a village', 'cities offer more jobs and services', 'villages are quieter and cleaner'],
      ['pay in cash or by card', 'cash helps you control your spending', 'cards are safer and more convenient'],
      ['shop online or in stores', 'online shopping offers more choice', 'in a store you can see the product before buying'],
      ['study in the morning or at night', 'the mind is fresh in the morning', 'the night is quiet and free of interruptions'],
      ['take the bus or drive', 'the bus is cheaper and you can read on the way', 'driving is faster and more comfortable'],
      ['have a big wedding or a small one', 'a big wedding brings the whole family together', 'a small one costs less and feels more personal'],
    ], ['wonder', 'يتساءل', 'on the other hand', 'من ناحية أخرى', 'depends on', 'يعتمد على'], [['Which choice is discussed?', 0]]),
  ],

  // ============================== عمل ==============================
  'work': [
    _F('A1', 'My Job', [
      '{0} is {1}.',
      '{0} works in {2}.',
      '{0} starts work at eight.',
      '{0} likes the job because {3}.',
      'It is a good job.',
    ], [
      ['Khaled', 'a teacher', 'a school', 'he helps children'], ['Rania', 'a nurse', 'a hospital', 'she helps sick people'], ['Sami', 'a cook', 'a restaurant', 'he loves food'], ['Dalia', 'a pilot', 'an airline', 'she sees new places'], ['Fuad', 'a driver', 'a delivery company', 'he likes the road'],
      ['Hind', 'a dentist', 'a clinic', 'she makes people smile'], ['Adel', 'a mechanic', 'a garage', 'he likes cars'], ['Zeina', 'a designer', 'an office', 'she loves colours'], ['Murad', 'a guard', 'a bank', 'he keeps people safe'], ['Abeer', 'a pharmacist', 'a pharmacy', 'she knows medicines'],
    ], ['job', 'وظيفة', 'works', 'يعمل', 'because', 'لأن'], [['What is the job?', 1], ['Where does {0} work?', 2]]),
    _F('A2', 'My First Day at Work', [
      'Today was my first day at {0}.',
      'I work there as {1}.',
      'A colleague called {2} showed me the office.',
      'My first task was to {3}.',
      'I was nervous in the morning, but everyone was helpful.',
      'I think I will like this job.',
    ], [
      ['a travel agency', 'a booking agent', 'Maher', 'answer customer emails'], ['a bank', 'a customer service officer', 'Lina', 'learn the computer system'], ['a hotel', 'a receptionist', 'Tony', 'welcome the guests'], ['a software company', 'a junior developer', 'Rita', 'read the project documents'], ['a hospital', 'an assistant nurse', 'Hiba', 'check the patient files'],
      ['a school', 'an English teacher', 'Basel', 'meet my students'], ['a supermarket', 'a cashier', 'Jad', 'learn the price system'], ['a newspaper', 'a junior reporter', 'Ruba', 'write a short news story'], ['a factory', 'a quality inspector', 'Nasser', 'check the products'], ['a law firm', 'a legal assistant', 'Carla', 'organise the case files'],
    ], ['colleague', 'زميل', 'task', 'مهمة', 'nervous', 'متوتر'], [['Where does the writer work?', 0], ['What was the first task?', 3]]),
    _F('A2', 'A Team Meeting', [
      'On {1}, we had a team meeting about {0}.',
      '{3} gave a short presentation.',
      'Everyone shared their opinion.',
      'In the end, we decided to {2}.',
      'The manager asked us to finish before the end of the month.',
      'It was a useful meeting.',
    ], [
      ['the new website', 'Monday', 'change the design', 'Rami'], ['customer complaints', 'Tuesday', 'answer every email within a day', 'Salma'], ['the summer sale', 'Wednesday', 'start it one week earlier', 'Wael'], ['the office move', 'Thursday', 'move in two stages', 'Nisreen'], ['the yearly budget', 'Sunday', 'reduce travel costs', 'Hatem'],
      ['the new product', 'Monday', 'test it with ten customers', 'Farah'], ['working hours', 'Tuesday', 'try flexible hours for a month', 'Ayman'], ['staff training', 'Wednesday', 'hold a workshop every month', 'Maysa'], ['late deliveries', 'Thursday', 'change the shipping company', 'Sharif'], ['social media', 'Sunday', 'post three times a week', 'Lujain'],
    ], ['meeting', 'اجتماع', 'opinion', 'رأي', 'decided', 'قررنا'], [['What was the meeting about?', 0], ['What was decided?', 2]]),
    _F('B1', 'An Interview for {0^}', [
      '{3} had an interview for the position of {0}.',
      'The most difficult question was: {1}',
      'Instead of giving a general answer, {3} {2}.',
      'The interviewers listened carefully and took notes.',
      'Two days later, {3} received a phone call with good news.',
      'Preparation and honest examples make a strong impression.',
    ], [
      ['sales manager', 'Why should we hire you?', 'described a real deal that had been saved at the last minute', 'Tariq'],
      ['project coordinator', 'How do you handle pressure?', 'explained how a late project had been delivered on time', 'Mirna'],
      ['accountant', 'What is your biggest weakness?', 'admitted a past mistake and what had been learned from it', 'Jawad'],
      ['customer service supervisor', 'How do you deal with angry customers?', 'told the story of a complaint that became a thank-you letter', 'Samar'],
      ['marketing specialist', 'What campaign are you most proud of?', 'showed the numbers before and after the campaign', 'Elias'],
      ['software engineer', 'How do you learn new technologies?', 'described a personal project built on weekends', 'Ola'],
      ['human resources officer', 'How do you solve a conflict between colleagues?', 'explained how two employees had been helped to agree', 'Mahmoud'],
      ['teacher', 'How do you motivate weak students?', 'gave the example of a student who had improved in one term', 'Shireen'],
      ['warehouse supervisor', 'How do you reduce mistakes?', 'described a simple checklist that had cut errors in half', 'Raed'],
      ['nurse', 'How do you stay calm in emergencies?', 'described a difficult night shift step by step', 'Ikram'],
    ], ['position', 'منصب', 'hire', 'يوظف', 'impression', 'انطباع'], [['Which position was the interview for?', 0], ['What was the most difficult question?', 1]]),
    _F('B1', 'Work Skills: {0^}', [
      'One of the most valuable skills at work is {0}.',
      '{1}',
      'Fortunately, it can be learned like any other skill.',
      'A good way to start is {2}.',
      'Employers notice people who keep improving, and they reward them.',
    ], [
      ['clear communication', 'Many problems at work begin with a misunderstood message.', 'to repeat what you understood before you start a task'],
      ['time management', 'Deadlines are missed more often because of poor planning than lack of ability.', 'to divide big tasks into small steps with dates'],
      ['teamwork', 'Few projects today can be completed by one person alone.', 'to ask your colleagues how you can make their work easier'],
      ['problem solving', 'Managers value employees who bring solutions, not only problems.', 'to suggest two possible solutions whenever you report a problem'],
      ['negotiation', 'Almost every agreement at work involves some give and take.', 'to find out what the other side really needs'],
      ['public speaking', 'Good ideas are often ignored when they are presented badly.', 'to practise your first minute until it feels natural'],
      ['writing emails', 'A long, unclear email wastes the time of everyone who reads it.', 'to put your request in the first two lines'],
      ['giving feedback', 'People cannot improve if nobody tells them the truth kindly.', 'to describe the action, not the person'],
      ['adaptability', 'Tools and markets change faster than ever before.', 'to learn one new tool every few months'],
      ['attention to detail', 'A small error in a number can cost a company a lot of money.', 'to check your work once more after a short break'],
    ], ['valuable', 'ثمين', 'deadline', 'موعد نهائي', 'improve', 'يتحسن'], [['Which skill is discussed?', 0], ['How can you start?', 2]]),
    _F('A1', 'My Desk', [
      'I work in an office.',
      'On my desk there is {0}.',
      'Next to it there is {1}.',
      'I use them every day.',
      'My colleague {2} sits near me.',
      'We drink {3} together at ten.',
    ], [
      ['a computer', 'a phone', 'Sami', 'coffee'], ['a laptop', 'a lamp', 'Rana', 'tea'], ['a printer', 'a calendar', 'Ali', 'juice'], ['a notebook', 'a pen', 'Maya', 'water'], ['a screen', 'a keyboard', 'Omar', 'green tea'],
      ['a tablet', 'a small plant', 'Hala', 'mint tea'], ['a file', 'a calculator', 'Ziad', 'milk tea'], ['a telephone', 'a cup', 'Dina', 'hot chocolate'], ['a camera', 'a headset', 'Karim', 'lemonade'], ['a scanner', 'a stapler', 'Noha', 'black coffee'],
    ], ['desk', 'مكتب', 'next to', 'بجانب', 'together', 'معاً'], [['What is on the desk?', 0], ['What do they drink?', 3]]),
    _F('A2', 'A Business Trip to {0}', [
      'Last month I travelled to {0} for work.',
      'The purpose of the trip was to {1}.',
      'I stayed there for {2}.',
      'There was one small problem: {3}.',
      'In the end, the trip was successful.',
      'My manager was happy with the results.',
    ], [
      ['Dubai', 'meet a new client', 'three days', 'my flight was late'], ['Riyadh', 'sign a contract', 'two days', 'the hotel lost my booking'], ['Istanbul', 'visit a factory', 'four days', 'I forgot my charger'], ['Cairo', 'attend a conference', 'five days', 'the traffic was terrible'], ['London', 'train a new team', 'a week', 'it rained every day'],
      ['Doha', 'present our product', 'one day', 'my laptop stopped working'], ['Amman', 'open a new branch', 'ten days', 'the office was not ready'], ['Casablanca', 'meet our suppliers', 'six days', 'my suitcase arrived a day late'], ['Kuwait City', 'solve a technical problem', 'two nights', 'the meeting room was too small'], ['Muscat', 'study the local market', 'eight days', 'I caught a cold'],
    ], ['purpose', 'هدف', 'successful', 'ناجح', 'results', 'نتائج'], [['Why did the writer travel?', 1], ['What was the problem?', 3]]),
    _F('B1', 'Starting a Small Business', [
      '{3} always dreamed of opening {0}.',
      'After saving money for several years, the dream finally came true.',
      'The first challenge was that {1}.',
      'To solve this, {3} decided to {2}.',
      'Slowly, the number of customers began to grow.',
      'The experience showed that patience is as important as money.',
    ], [
      ['a small bakery', 'few people knew about the shop', 'give free samples to people passing by', 'Khalil'],
      ['an online clothing store', 'customers did not trust a new website', 'offer free returns', 'Jumana'],
      ['a mobile repair shop', 'there were three competitors on the same street', 'repair phones in less than an hour', 'Shadi'],
      ['a coffee cart', 'the location was too quiet', 'move near the university', 'Tala'],
      ['a tutoring centre', 'parents wanted proof of results', 'offer the first lesson for free', 'Nizar'],
      ['a home cleaning service', 'it was hard to find reliable workers', 'train a small team personally', 'Sawsan'],
      ['a flower shop', 'many flowers were wasted every day', 'take orders in advance', 'Ramzi'],
      ['a delivery service', 'fuel costs were higher than expected', 'plan shorter routes', 'Hadeel'],
      ['a handmade soap brand', 'the product was unknown', 'sell at weekend markets', 'Maram'],
      ['a car wash', 'customers did not want to wait', 'offer a booking system by phone', 'Anwar'],
    ], ['challenge', 'تحدٍّ', 'customers', 'زبائن', 'patience', 'صبر'], [['What business was opened?', 0], ['What was the first challenge?', 1]]),
    _F('A2', 'A Phone Call at Work', [
      'This morning, {0} called our office.',
      'The caller wanted to {1}.',
      'I checked the system and found the information.',
      'I told the caller that {2}.',
      'The caller thanked me and ended the call.',
      'I wrote a short note about it for my manager.',
    ], [
      ['a customer', 'ask about a late order', 'the order would arrive tomorrow'], ['a supplier', 'confirm a delivery date', 'we expected the goods on Monday'], ['a new client', 'book a meeting', 'the manager was free on Wednesday'], ['a job applicant', 'ask about an interview', 'the interview was at ten on Sunday'], ['a bank officer', 'check a payment', 'the payment had been sent yesterday'],
      ['a hotel', 'confirm a reservation', 'we needed two rooms for three nights'], ['a technician', 'arrange a visit', 'the office was open until five'], ['a journalist', 'request an interview', 'the director would call back'], ['a delivery driver', 'find our address', 'the entrance was behind the building'], ['a teacher', 'ask about a school visit to our factory', 'visits were possible on Thursdays'],
    ], ['caller', 'المتصل', 'checked', 'تحققت', 'note', 'ملاحظة'], [['Who called?', 0], ['What did the caller want?', 1]]),
    _F('B1', 'The Modern Workplace', [
      'The modern workplace is changing, and one clear example is {0}.',
      'Supporters say that {1}.',
      'Critics, however, point out that {2}.',
      'Companies are still experimenting to find the right balance.',
      'What works in one company may fail in another, so flexibility is essential.',
    ], [
      ['remote work', 'employees save hours of travel every week', 'people can feel isolated from their team'],
      ['the four-day week', 'workers return more rested and focused', 'some jobs cannot be done in fewer days'],
      ['the open office', 'it makes communication faster', 'noise makes it harder to concentrate'],
      ['the online meeting', 'it connects teams across countries', 'too many meetings leave no time for real work'],
      ['the use of artificial intelligence tools', 'they finish routine tasks in seconds', 'people may depend on them too much'],
      ['flexible hours', 'parents can organise their day more easily', 'it becomes harder to find a time when everyone is available'],
      ['freelancing', 'people choose their own projects', 'income is less stable'],
      ['continuous training', 'skills stay up to date', 'it takes time away from daily tasks'],
      ['the performance bonus', 'it motivates people to work harder', 'it can create unhealthy competition'],
      ['the casual dress code', 'people feel more comfortable', 'some customers expect a formal look'],
    ], ['supporters', 'المؤيدون', 'critics', 'المنتقدون', 'flexibility', 'مرونة'], [['Which trend is discussed?', 0], ['What do critics say?', 2]]),
  ],

  // ============================== ثقافة وسفر ==============================
  'travel': [
    _F('A1', 'A Trip to {0}', [
      'I am in {0}.',
      '{0} is a city in {1}.',
      'Today I see {2}.',
      'For lunch, I eat {3}.',
      'The people are kind.',
      'I like this city.',
    ], [
      ['Paris', 'France', 'the Eiffel Tower', 'bread and cheese'], ['Rome', 'Italy', 'the Colosseum', 'pizza'], ['Cairo', 'Egypt', 'the Pyramids', 'koshari'], ['Istanbul', 'Turkey', 'the Blue Mosque', 'kebab'], ['London', 'England', 'Big Ben', 'fish and chips'],
      ['Tokyo', 'Japan', 'a big temple', 'sushi'], ['Agra', 'India', 'the Taj Mahal', 'rice and curry'], ['Athens', 'Greece', 'the Acropolis', 'salad'], ['Marrakesh', 'Morocco', 'the old market', 'couscous'], ['Barcelona', 'Spain', 'a famous church', 'paella'],
    ], ['city', 'مدينة', 'see', 'أرى', 'kind', 'طيبون'], [['Which country is it in?', 1], ['What do I see?', 2]]),
    _F('A2', 'At the Airport', [
      'My flight to {0} was at {3}.',
      'At the airport, I had a problem: {1}.',
      'I spoke to an employee at the information desk.',
      'She told me to {2}.',
      'Everything was fine after that.',
      'I learned to arrive early.',
    ], [
      ['Dubai', 'my bag was too heavy', 'move some things to my hand bag', 'noon'], ['Madrid', 'I could not find my gate', 'follow the yellow signs', 'six in the morning'], ['Jeddah', 'my name was spelled wrong on the ticket', 'go to the airline desk', 'midnight'], ['Vienna', 'the flight was delayed', 'wait in the cafe near gate five', 'three in the afternoon'], ['Tunis', 'I lost my boarding pass', 'print a new one at the machine', 'nine at night'],
      ['Singapore', 'the security queue was very long', 'use the fast lane for late passengers', 'seven in the evening'], ['Beirut', 'I could not find my passport', 'check every pocket calmly', 'ten in the morning'], ['Athens', 'the gate was changed', 'walk to the other side of the terminal', 'two in the afternoon'], ['Baku', 'my phone battery was dead', 'use the free charging station', 'five in the morning'], ['Lisbon', 'I had no local money', 'use the exchange office upstairs', 'eleven at night'],
    ], ['flight', 'رحلة جوية', 'gate', 'بوابة', 'delayed', 'متأخرة'], [['What was the problem?', 1], ['What did the employee say?', 2]]),
    _F('A2', 'Celebrations: {0^}', [
      '{0^} is celebrated in {1}.',
      '{2}',
      'Families and friends come together on this occasion.',
      'Visitors are usually welcome to join.',
      'It is a wonderful way to learn about the local culture.',
    ], [
      ['Eid al-Fitr', 'many countries around the world', 'It marks the end of the month of Ramadan.'], ['the Lantern Festival', 'China', 'People light colourful lanterns at night.'], ['Holi', 'India', 'People throw coloured powder at each other.'], ['the cherry blossom season', 'Japan', 'People have picnics under the flowering trees.'], ['Carnival', 'Brazil', 'There are big parades with music and dancing.'],
      ['Thanksgiving', 'the United States', 'Families share a large meal together.'], ['La Tomatina', 'Spain', 'People throw tomatoes at each other in the streets.'], ['Songkran', 'Thailand', 'People splash water on each other to welcome the new year.'], ['the Day of the Dead', 'Mexico', 'Families remember relatives who have died.'], ['Nowruz', 'Iran and Central Asia', 'It celebrates the beginning of spring.'],
    ], ['celebrated', 'يُحتفل به', 'occasion', 'مناسبة', 'culture', 'ثقافة'], [['Where is it celebrated?', 1], ['What happens?', 2]]),
    _F('B1', 'Travel Advice', [
      'Experienced travellers often give the same advice: {0}.',
      '{1}',
      'For example, {2}.',
      'It costs almost nothing, yet it can save your trip.',
      'Good travel is less about luck and more about preparation.',
    ], [
      ['pack less than you think you need', 'Heavy bags make every step of the journey harder.', 'most people wear only half of the clothes they bring'],
      ['learn a few words of the local language', 'A simple greeting opens doors everywhere.', 'saying thank you in the local language often earns a smile'],
      ['keep copies of your documents', 'Losing a passport abroad is stressful and slow to fix.', 'a photo of it on your phone speeds up the process'],
      ['arrive at the airport early', 'Queues are impossible to predict.', 'a ten-minute delay at security can make you miss a flight'],
      ['try the local food', 'Cuisine is one of the fastest ways to understand a culture.', 'a simple street meal can be the best memory of a trip'],
      ['respect local customs', 'What is polite in one country may be rude in another.', 'in many places you should remove your shoes before entering a home'],
      ['buy travel insurance', 'Medical care abroad can be extremely expensive.', 'a broken arm could cost more than the whole holiday'],
      ['walk as much as possible', 'You notice far more on foot than from a car window.', 'the best cafe is often in a street no tour bus enters'],
      ['carry a little cash', 'Cards are not accepted everywhere.', 'small shops and taxis often take only cash'],
      ['leave free time in your plan', 'A schedule that is too full creates stress.', 'an unplanned afternoon often becomes the highlight'],
    ], ['advice', 'نصيحة', 'experienced', 'ذو خبرة', 'preparation', 'تحضير'], [['What is the advice?', 0]]),
    _F('A1', 'In the Hotel', [
      'I am at a hotel.',
      'My room number is {0}.',
      'It is on the {1} floor.',
      'From the window, I can see {2}.',
      'Breakfast is at {3}.',
      'The room is clean and quiet.',
    ], [
      ['12', 'first', 'the sea', 'seven'], ['25', 'second', 'a garden', 'eight'], ['31', 'third', 'the mountains', 'half past seven'], ['48', 'fourth', 'the city', 'six'], ['56', 'fifth', 'a river', 'nine'],
      ['63', 'sixth', 'a park', 'half past six'], ['77', 'seventh', 'the old town', 'half past eight'], ['84', 'eighth', 'the beach', 'ten'], ['90', 'ninth', 'a lake', 'quarter past seven'], ['105', 'tenth', 'the desert', 'quarter to eight'],
    ], ['room', 'غرفة', 'floor', 'طابق', 'quiet', 'هادئ'], [['What can I see?', 2], ['Which floor?', 1]]),
    _F('A2', 'Famous Places: {0^}', [
      '{0^} is one of the most famous places in the world.',
      'It is in {1}.',
      '{2}',
      'Huge numbers of tourists visit it every year.',
      'If you go, take a good camera.',
    ], [
      ['the Eiffel Tower', 'Paris, France', 'It was built in 1889.'], ['the Great Wall', 'China', 'It is thousands of kilometres long.'], ['the Pyramids of Giza', 'Egypt', 'They are more than four thousand years old.'], ['Petra', 'Jordan', 'It is an ancient city cut into rose-coloured rock.'], ['the Taj Mahal', 'India', 'It is made of white marble.'],
      ['the Colosseum', 'Rome, Italy', 'Gladiators fought there in ancient times.'], ['Machu Picchu', 'Peru', 'It is an old city high in the mountains.'], ['the Statue of Liberty', 'New York', 'It was a gift from France.'], ['Hagia Sophia', 'Istanbul', 'It is almost fifteen hundred years old.'], ['the Alhambra', 'Granada, Spain', 'It is a palace with beautiful Islamic art.'],
    ], ['famous', 'مشهور', 'tourists', 'سياح', 'ancient', 'قديم'], [['Where is it?', 1], ['Which fact is in the text?', 2]]),
    _F('B1', 'Customs Around the World', [
      'Customs related to {0} differ greatly from one culture to another.',
      '{1}',
      '{2}',
      'Neither way is right or wrong; they are simply different.',
      'A wise traveller observes first and then follows the local way.',
    ], [
      ['greetings', 'In some countries, people shake hands firmly.', 'In others, they bow or place a hand on the heart.'],
      ['tipping', 'In some countries, leaving a tip is expected.', 'In others, it may be considered unnecessary.'],
      ['punctuality', 'In some cultures, arriving exactly on time is a sign of respect.', 'In others, arriving a little late is completely normal.'],
      ['giving gifts', 'In some places, a gift is opened immediately.', 'In others, it is polite to open it later in private.'],
      ['eating', 'In some countries, people eat with a knife and fork.', 'In others, they use chopsticks or their right hand.'],
      ['queuing', 'In some places, people form a strict line and wait.', 'In others, the system is more relaxed.'],
      ['hospitality', 'In some cultures, a guest is offered food several times.', 'In others, a host asks only once.'],
      ['bargaining', 'In some markets, discussing the price is part of the fun.', 'In others, prices are fixed and never discussed.'],
      ['personal space', 'In some cultures, people stand close when they talk.', 'In others, they prefer more distance.'],
      ['drinking tea and coffee', 'In some countries, coffee is drunk quickly while standing.', 'In others, tea is served slowly as a social event.'],
    ], ['customs', 'عادات', 'differ', 'تختلف', 'polite', 'مهذب'], [['Which custom is discussed?', 0]]),
    _F('A2', 'A Postcard from {0^}', [
      'Dear friend,',
      'I am writing to you from {0}.',
      'The weather is {1}.',
      'Yesterday we {2}.',
      'Tomorrow we are going to {3}.',
      'I wish you were here!',
    ], [
      ['the mountains of Lebanon', 'cool and fresh', 'walked in a cedar forest', 'visit an old village'], ['Alexandria', 'sunny and windy', 'swam in the sea', 'see the big library'], ['Cappadocia', 'dry and clear', 'watched the hot air balloons', 'explore a cave town'], ['Zanzibar', 'hot and humid', 'took a boat to a small island', 'visit a spice farm'], ['the Swiss Alps', 'cold and snowy', 'took a train up the mountain', 'try skiing'],
      ['Salalah', 'misty and green', 'drove through the hills', 'see the waterfalls'], ['Bali', 'warm and rainy', 'visited a rice field', 'watch a traditional dance'], ['Sharm El Sheikh', 'hot and sunny', 'went snorkelling', 'take a desert trip'], ['Granada', 'warm and dry', 'walked through the old streets', 'visit the Alhambra'], ['Sarajevo', 'mild and cloudy', 'drank coffee in the old bazaar', 'go to the mountains'],
    ], ['postcard', 'بطاقة بريدية', 'weather', 'الطقس', 'wish', 'أتمنى'], [['Where is the writer?', 0], ['What will they do tomorrow?', 3]]),
    _F('B1', 'Kinds of Tourism', [
      'Not everyone travels for the same reason, and {0} is growing in popularity.',
      '{1}',
      'It attracts people who {2}.',
      'Like any kind of travel, it has costs as well as benefits.',
      'The important thing is to choose the kind of trip that matches who you are.',
    ], [
      ['eco-tourism', 'It focuses on visiting natural areas without harming them.', 'care about the environment'],
      ['medical tourism', 'It involves travelling to another country for treatment.', 'are looking for quality care at a lower price'],
      ['cultural tourism', 'It is built around museums, historic sites, and local traditions.', 'love history and art'],
      ['adventure tourism', 'It includes activities such as climbing, diving, and rafting.', 'enjoy physical challenges'],
      ['food tourism', 'It turns local dishes and markets into the main attraction.', 'believe the best way to know a place is to taste it'],
      ['religious tourism', 'It takes people to places that are important to their faith.', 'want a spiritual experience'],
      ['educational tourism', 'It combines travel with language courses or training.', 'want to learn while they explore'],
      ['business tourism', 'It is connected to conferences, exhibitions, and meetings.', 'mix work with a little sightseeing'],
      ['rural tourism', 'It invites visitors to stay on farms and in small villages.', 'want to escape the noise of the city'],
      ['sports tourism', 'It is organised around big matches and tournaments.', 'follow their favourite teams'],
    ], ['popularity', 'شعبية', 'attracts', 'يجذب', 'benefits', 'فوائد'], [['Which kind of tourism is discussed?', 0], ['It attracts people who...', 2]]),
    _F('A1', 'A Day at the {0^}', [
      'Today I visit the {0} with my {3}.',
      'We see {1}.',
      'It is very interesting.',
      'Then we buy {2}.',
      'We take many photos.',
      'It is a happy day.',
    ], [
      ['museum', 'old coins', 'a small book', 'family'], ['zoo', 'lions and monkeys', 'ice cream', 'children'], ['old market', 'carpets and lamps', 'a small lamp', 'friend'], ['castle', 'big rooms and old swords', 'postcards', 'brother'], ['beach', 'boats and birds', 'cold juice', 'sister'],
      ['aquarium', 'sharks and colourful fish', 'a toy fish', 'son'], ['garden', 'roses and fountains', 'flowers', 'mother'], ['old port', 'fishing boats', 'fresh fish', 'father'], ['art gallery', 'beautiful paintings', 'a poster', 'cousin'], ['science centre', 'robots and rockets', 'a puzzle', 'daughter'],
    ], ['visit', 'أزور', 'interesting', 'ممتع', 'photos', 'صور'], [['What do we see?', 1], ['What do we buy?', 2]]),
  ],
};
