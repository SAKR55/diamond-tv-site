import 'dart:math';

/// مولّد القصص والمحادثات.
///
/// يعمل بلا إنترنت: يركّب كل قصة أو محادثة من قوالب وعناصر عشوائية (أشخاص، أماكن، أشياء...)
/// فينتج آلاف التركيبات المختلفة. لزيادة التنوع أضف عناصر إلى القوائم أو قوالب جديدة.
/// عند ربط خادم الذكاء الاصطناعي تأتي القصص والمحادثات منه بلا حدود فعلاً (انظر coach.dart).

class Vocab {
  const Vocab(this.en, this.ar);
  final String en;
  final String ar;
}

class Quiz {
  const Quiz(this.question, this.options, this.answer);
  final String question;
  final List<String> options;
  final int answer;
}

class Story {
  const Story({required this.title, required this.lines, required this.vocab, required this.quiz, this.fromAi = false});
  final String title;
  final List<String> lines;
  final List<Vocab> vocab;
  final List<Quiz> quiz;
  final bool fromAi;
}

class TalkTurn {
  const TalkTurn(this.coach, this.hints);
  final String coach;
  final List<String> hints;
}

/// هدف داخل المحادثة: يتحقق إذا احتوى كلام المتعلم على إحدى الكلمات المفتاحية.
class TalkGoal {
  const TalkGoal(this.labelAr, this.keys);
  final String labelAr;
  final List<String> keys;
}

class Talk {
  const Talk({required this.titleAr, required this.roleAr, required this.scenarioEn, required this.turns, this.goals = const []});
  final String titleAr;
  final String roleAr;
  final String scenarioEn;
  final List<TalkTurn> turns;
  final List<TalkGoal> goals;
}

// ---------- عناصر القصص ----------

class _Person {
  const _Person(this.name, this.he, this.him, this.his);
  final String name;
  final String he;
  final String him;
  final String his;
}

const _people = <_Person>[
  _Person('Omar', 'he', 'him', 'his'),
  _Person('Sara', 'she', 'her', 'her'),
  _Person('Ali', 'he', 'him', 'his'),
  _Person('Mona', 'she', 'her', 'her'),
  _Person('Khalid', 'he', 'him', 'his'),
  _Person('Nora', 'she', 'her', 'her'),
  _Person('Yusuf', 'he', 'him', 'his'),
  _Person('Layla', 'she', 'her', 'her'),
  _Person('Adam', 'he', 'him', 'his'),
  _Person('Huda', 'she', 'her', 'her'),
  _Person('Faisal', 'he', 'him', 'his'),
  _Person('Reem', 'she', 'her', 'her'),
];

class _Place {
  const _Place(this.short, this.to, this.at, this.ar);
  final String short;
  final String to;
  final String at;
  final String ar;
}

const _places = <_Place>[
  _Place('market', 'to the market', 'at the market', 'السوق'),
  _Place('airport', 'to the airport', 'at the airport', 'المطار'),
  _Place('park', 'to the park', 'in the park', 'الحديقة'),
  _Place('library', 'to the library', 'at the library', 'المكتبة'),
  _Place('hospital', 'to the hospital', 'at the hospital', 'المستشفى'),
  _Place('beach', 'to the beach', 'at the beach', 'الشاطئ'),
  _Place('mall', 'to the mall', 'at the mall', 'المركز التجاري'),
  _Place('train station', 'to the train station', 'at the train station', 'محطة القطار'),
  _Place('museum', 'to the museum', 'at the museum', 'المتحف'),
  _Place('restaurant', 'to the restaurant', 'at the restaurant', 'المطعم'),
  _Place('university', 'to the university', 'at the university', 'الجامعة'),
  _Place('bus station', 'to the bus station', 'at the bus station', 'محطة الحافلات'),
];

class _Thing {
  const _Thing(this.full, this.short, this.ar);
  final String full;
  final String short;
  final String ar;
}

const _things = <_Thing>[
  _Thing('a red bag', 'bag', 'حقيبة'),
  _Thing('a new phone', 'phone', 'هاتف'),
  _Thing('an old book', 'book', 'كتاب'),
  _Thing('a small key', 'key', 'مفتاح'),
  _Thing('a brown wallet', 'wallet', 'محفظة'),
  _Thing('a blue umbrella', 'umbrella', 'مظلة'),
  _Thing('a passport', 'passport', 'جواز سفر'),
  _Thing('a silver watch', 'watch', 'ساعة يد'),
  _Thing('a train ticket', 'ticket', 'تذكرة'),
  _Thing('a black camera', 'camera', 'كاميرا'),
];

class _Helper {
  const _Helper(this.a, this.the, this.ar);
  final String a;
  final String the;
  final String ar;
}

const _helpers = <_Helper>[
  _Helper('a kind old man', 'the old man', 'رجل مسن طيب'),
  _Helper('a police officer', 'the police officer', 'شرطي'),
  _Helper('a young student', 'the student', 'طالب شاب'),
  _Helper('a taxi driver', 'the taxi driver', 'سائق تاكسي'),
  _Helper('a shop owner', 'the shop owner', 'صاحب متجر'),
  _Helper('a teacher', 'the teacher', 'معلم'),
  _Helper('a friendly tourist', 'the tourist', 'سائح ودود'),
  _Helper('a security guard', 'the security guard', 'حارس أمن'),
];

const _spots = <String>[
  'under a chair',
  'next to the door',
  'on a table near the window',
  'behind a big plant',
  'at the information desk',
  'on a bench outside',
];

const _times = <String>[
  'Last Friday',
  'Yesterday morning',
  'One sunny day',
  'Last week',
  'On Monday evening',
  'Two days ago',
];

String _cap(String s) => s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);

T _pick<T>(Random r, List<T> list) => list[r.nextInt(list.length)];

/// سؤال بثلاثة اختيارات: الصحيح مع اثنين مختلفين من القائمة، بترتيب عشوائي.
Quiz _quiz(Random r, String question, String correct, List<String> pool) {
  final others = pool.where((o) => o != correct).toList()..shuffle(r);
  final options = <String>[correct, ...others.take(2)]..shuffle(r);
  return Quiz(question, options, options.indexOf(correct));
}

class StoryGenerator {
  static final Random _r = Random();

  static Story make(String level, {bool kids = false}) {
    if (kids) return _kids(_r);
    return _r.nextBool() ? _lost(_r, level) : _helping(_r, level);
  }

  // ----- حبكة 1: شيء ضائع -----
  static Story _lost(Random r, String level) {
    final p = _pick(r, _people);
    final pl = _pick(r, _places);
    final th = _pick(r, _things);
    final h = _pick(r, _helpers);
    final spot = _pick(r, _spots);
    final time = _pick(r, _times);
    final he = p.he;
    final his = p.his;
    final him = p.him;
    final minutes = 10 + r.nextInt(4) * 5;

    final List<String> lines;
    final List<Quiz> quiz;
    if (level == 'A1') {
      lines = [
        '${p.name} is ${pl.at}.',
        '${_cap(he)} has ${th.full}.',
        '${_cap(he)} likes $his ${th.short} very much.',
        'Now ${p.name} cannot find the ${th.short}.',
        '${_cap(h.a)} helps $him.',
        'They look everywhere.',
        'The ${th.short} is $spot.',
        '${p.name} is happy now.',
      ];
      quiz = [
        _quiz(r, 'Where is ${p.name}?', pl.at, _places.map((e) => e.at).toList()),
        _quiz(r, 'What can ${p.name} not find?', 'the ${th.short}', _things.map((e) => 'the ${e.short}').toList()),
      ];
    } else if (level == 'B1') {
      lines = [
        '$time, ${p.name} was ${pl.at} when something unexpected happened.',
        '${_cap(he)} had brought ${th.full}, which was very important to $him.',
        'As soon as $he realised that the ${th.short} was missing, $he started to feel worried.',
        'Luckily, ${h.a}, who was standing nearby, offered to help.',
        'They searched for almost $minutes minutes before they found it $spot.',
        '${p.name} was so relieved that $he could not stop smiling.',
        'That day, $he learned that asking for help is always better than panicking.',
      ];
      quiz = [
        _quiz(r, 'Where was ${p.name} when the problem happened?', pl.at, _places.map((e) => e.at).toList()),
        _quiz(r, 'Who offered to help?', h.the, _helpers.map((e) => e.the).toList()),
        _quiz(r, 'How did ${p.name} feel at the end?', 'relieved', ['relieved', 'angry', 'bored', 'tired']),
      ];
    } else {
      lines = [
        '$time, ${p.name} went ${pl.to}.',
        '${_cap(he)} took ${th.full} with $him.',
        'After an hour, $he could not find $his ${th.short}.',
        '${_cap(he)} felt very worried.',
        '${_cap(he)} asked ${h.a} for help.',
        'Together they looked everywhere.',
        'Finally, they found the ${th.short} $spot.',
        '${p.name} said, "Thank you very much!" and felt happy again.',
      ];
      quiz = [
        _quiz(r, 'Where did ${p.name} go?', pl.to, _places.map((e) => e.to).toList()),
        _quiz(r, 'What did ${p.name} lose?', 'the ${th.short}', _things.map((e) => 'the ${e.short}').toList()),
      ];
    }
    return Story(
      title: '${p.name} and the lost ${th.short}',
      lines: lines,
      vocab: [
        Vocab(pl.short, pl.ar),
        Vocab(th.short, th.ar),
        Vocab(h.a, h.ar),
        if (level == 'A1') const Vocab('everywhere', 'في كل مكان'),
        if (level == 'A2') const Vocab('worried', 'قلق'),
        if (level == 'B1') const Vocab('relieved', 'مرتاح بعد قلق'),
        if (level == 'B1') const Vocab('nearby', 'قريب'),
      ],
      quiz: quiz,
    );
  }

  // ----- حبكة 2: مساعدة شخص تائه -----
  static Story _helping(Random r, String level) {
    final p = _pick(r, _people);
    final pl = _pick(r, _places);
    var dest = _pick(r, _places);
    while (dest.short == pl.short) {
      dest = _pick(r, _places);
    }
    final h = _pick(r, _helpers);
    final time = _pick(r, _times);
    final he = p.he;
    final minutes = 5 + r.nextInt(4) * 5;

    final List<String> lines;
    final List<Quiz> quiz;
    if (level == 'A1') {
      lines = [
        '${p.name} is ${pl.at}.',
        '${_cap(he)} sees ${h.a}.',
        '${_cap(h.the)} looks lost.',
        '"Can I help you?" asks ${p.name}.',
        '${_cap(h.the)} wants to go ${dest.to}.',
        '${p.name} shows the way.',
        '${_cap(h.the)} says, "Thank you!"',
        '${p.name} feels happy.',
      ];
      quiz = [
        _quiz(r, 'Who does ${p.name} help?', h.the, _helpers.map((e) => e.the).toList()),
        _quiz(r, 'Where does ${h.the} want to go?', dest.to, _places.map((e) => e.to).toList()),
      ];
    } else if (level == 'B1') {
      lines = [
        '$time, while ${p.name} was waiting ${pl.at}, $he noticed ${h.a} who seemed to be lost.',
        'Although $he was in a hurry, ${p.name} decided to offer some help.',
        '${_cap(h.the)} explained that the way ${dest.to} was not clear at all.',
        'Instead of just giving directions, ${p.name} walked there together with ${h.the}.',
        'It took about $minutes minutes, and on the way they talked about the city and its people.',
        '${p.name} arrived late that day, but $he felt that helping someone was worth it.',
      ];
      quiz = [
        _quiz(r, 'Where was ${p.name} waiting?', pl.at, _places.map((e) => e.at).toList()),
        _quiz(r, 'What did ${p.name} do instead of giving directions?', 'walked there with ${h.the}', [
          'walked there with ${h.the}',
          'called a taxi',
          'drew a map',
          'asked a friend',
        ]),
        _quiz(r, 'How long did it take?', 'about $minutes minutes', [
          'about $minutes minutes',
          'about ${minutes + 20} minutes',
          'about an hour',
          'two hours',
        ]),
      ];
    } else {
      lines = [
        '$time, ${p.name} was ${pl.at}.',
        '${_cap(he)} saw ${h.a} who looked lost.',
        '${p.name} asked, "Can I help you?"',
        '${_cap(h.the)} wanted to go ${dest.to} but did not know the way.',
        '${p.name} walked with ${h.the} for $minutes minutes and showed the way.',
        '${_cap(h.the)} smiled and said, "You are very kind."',
        '${p.name} went home feeling happy.',
      ];
      quiz = [
        _quiz(r, 'Who did ${p.name} help?', h.the, _helpers.map((e) => e.the).toList()),
        _quiz(r, 'Where did ${h.the} want to go?', dest.to, _places.map((e) => e.to).toList()),
      ];
    }
    return Story(
      title: '${p.name} helps ${h.a}',
      lines: lines,
      vocab: [
        Vocab(pl.short, pl.ar),
        Vocab(dest.short, dest.ar),
        Vocab(h.a, h.ar),
        const Vocab('lost', 'تائه'),
        if (level == 'B1') const Vocab('in a hurry', 'مستعجل'),
        if (level == 'B1') const Vocab('worth it', 'يستحق العناء'),
      ],
      quiz: quiz,
    );
  }

  // ----- قصص الأطفال -----
  static const _animals = <List<String>>[
    ['cat', 'قطة', '🐱'],
    ['dog', 'كلب', '🐶'],
    ['bird', 'عصفور', '🐦'],
    ['rabbit', 'أرنب', '🐰'],
    ['fish', 'سمكة', '🐟'],
    ['lion', 'أسد', '🦁'],
    ['duck', 'بطة', '🦆'],
    ['horse', 'حصان', '🐴'],
  ];
  static const _colors = <List<String>>[
    ['red', 'أحمر'],
    ['blue', 'أزرق'],
    ['green', 'أخضر'],
    ['yellow', 'أصفر'],
    ['white', 'أبيض'],
    ['black', 'أسود'],
    ['brown', 'بني'],
    ['orange', 'برتقالي'],
  ];
  static const _toys = <List<String>>[
    ['ball', 'كرة', '⚽'],
    ['apple', 'تفاحة', '🍎'],
    ['hat', 'قبعة', '🎩'],
    ['book', 'كتاب', '📖'],
    ['kite', 'طائرة ورقية', '🪁'],
    ['cake', 'كعكة', '🎂'],
  ];
  static const _kidPlaces = <List<String>>[
    ['garden', 'الحديقة'],
    ['park', 'المتنزه'],
    ['farm', 'المزرعة'],
    ['house', 'البيت'],
    ['school', 'المدرسة'],
  ];

  static Story _kids(Random r) {
    final a = _pick(r, _animals);
    final c = _pick(r, _colors);
    final t = _pick(r, _toys);
    final pl = _pick(r, _kidPlaces);
    final n = 2 + r.nextInt(4);
    const numbers = ['zero', 'one', 'two', 'three', 'four', 'five'];
    return Story(
      title: 'The ${c[0]} ${a[0]} ${a[2]}',
      lines: [
        'This is a ${c[0]} ${a[0]}. ${a[2]}',
        'The ${a[0]} is in the ${pl[0]}.',
        'The ${a[0]} has a ${t[0]}. ${t[2]}',
        'The ${a[0]} has ${numbers[n]} friends.',
        'They play with the ${t[0]}.',
        'The ${c[0]} ${a[0]} is happy!',
      ],
      vocab: [Vocab(a[0], a[1]), Vocab(c[0], c[1]), Vocab(t[0], t[1]), Vocab(pl[0], pl[1])],
      quiz: [
        _quiz(r, 'What colour is the ${a[0]}?', c[0], _colors.map((e) => e[0]).toList()),
        _quiz(r, 'What does the ${a[0]} have?', 'a ${t[0]}', _toys.map((e) => 'a ${e[0]}').toList()),
      ],
    );
  }
}

// ---------- مولّد المحادثات ----------

class TalkGenerator {
  static final Random _r = Random();

  static const _dishes = ['grilled chicken', 'fish with rice', 'vegetable soup', 'beef steak', 'pasta', 'lamb kebab'];
  static const _drinks = ['Orange juice', 'Mint tea', 'Lemonade', 'Coffee', 'Sparkling water'];
  static const _desserts = ['ice cream', 'chocolate cake', 'fruit salad'];
  static const _cities = ['Dubai', 'London', 'Istanbul', 'Paris', 'Jeddah', 'Kuala Lumpur', 'Cairo', 'Doha'];
  static const _clothes = ['a jacket', 'a white shirt', 'a pair of shoes', 'a winter coat', 'a pair of jeans'];
  static const _colors = ['Black', 'Blue', 'Grey', 'Brown', 'Dark green'];
  static const _pains = ['a headache', 'a sore throat', 'a cough', 'a stomach ache', 'a cold'];
  static const _days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  static const _hours = ['nine', 'ten', 'eleven', 'two', 'four', 'half past five'];
  static const _spots = ['bank', 'pharmacy', 'supermarket', 'metro station', 'post office', 'hotel'];
  static const _fields = ['business', 'engineering', 'accounting', 'marketing', 'computer science'];
  static const _names = ['Daniel', 'Emma', 'James', 'Sophie', 'Michael', 'Anna'];
  static const _taxiPlaces = ['airport', 'city centre', 'train station', 'Grand Hotel', 'university'];

  static String _p(List<String> l) => l[_r.nextInt(l.length)];
  static int _n(int min, int max) => min + _r.nextInt(max - min + 1);

  static Talk make() {
    final makers = <Talk Function()>[
      _restaurant,
      _hotel,
      _airport,
      _pharmacy,
      _shop,
      _taxi,
      _interview,
      _colleague,
      _clinic,
      _directions,
    ];
    return makers[_r.nextInt(makers.length)]();
  }

  static Talk _restaurant() {
    final d1 = _p(_dishes);
    var d2 = _p(_dishes);
    while (d2 == d1) {
      d2 = _p(_dishes);
    }
    return Talk(titleAr: 'في المطعم', roleAr: 'أنت الزبون، والمدرب هو النادل', scenarioEn: 'ordering food at a restaurant; you are the waiter', turns: [
      const TalkTurn('Good evening! Welcome. A table for how many people?', ['A table for two, please.', 'Just one, please.']),
      TalkTurn("Here is the menu. Today's special is $d1. What would you like to eat?", ['I would like the $d1, please.', 'Can I have the $d2, please?']),
      TalkTurn('Good choice. And what would you like to drink?', ['${_p(_drinks)}, please.', 'Just water, please.']),
      TalkTurn('Would you like anything for dessert?', ['Yes, ${_p(_desserts)}, please.', 'No, thank you. I am full.']),
      TalkTurn('Here is your bill. It is ${_n(18, 60)} dollars. How would you like to pay?', ['By card, please.', 'Cash, please. Keep the change.']),
    ]);
  }

  static Talk _hotel() {
    final nights = _n(2, 7);
    return Talk(titleAr: 'في الفندق', roleAr: 'أنت النزيل، والمدرب موظف الاستقبال', scenarioEn: 'checking in at a hotel; you are the receptionist', turns: [
      const TalkTurn('Good afternoon. Do you have a reservation?', ['Yes, I have a reservation.', 'No. Do you have a free room?']),
      TalkTurn('How many nights will you stay?', ['$nights nights, please.', 'I am staying for $nights nights.']),
      const TalkTurn('Would you like a room with a sea view or a city view?', ['A sea view, please.', 'A city view is fine.']),
      TalkTurn('Breakfast is from ${_n(6, 7)} to ${_n(9, 11)} in the morning. Would you like breakfast?', ['Yes, please.', 'No, thank you.']),
      TalkTurn('Here is your key. Your room is number ${_n(101, 920)}. Do you need help with your bags?', ['Yes, please. They are heavy.', 'No, thank you. I can manage.']),
    ]);
  }

  static Talk _airport() {
    final city = _p(_cities);
    return Talk(titleAr: 'في المطار', roleAr: 'أنت المسافر، والمدرب موظف شركة الطيران', scenarioEn: 'airport check-in desk; you are the check-in agent', turns: [
      TalkTurn('Good morning. Where are you flying today?', ['I am flying to $city.', 'To $city, please.']),
      const TalkTurn('May I see your passport, please?', ['Here you are.', 'Sure. Here is my passport.']),
      const TalkTurn('Would you like a window seat or an aisle seat?', ['A window seat, please.', 'An aisle seat, please.']),
      TalkTurn('How many bags are you checking in?', ['${_n(1, 3) == 1 ? 'One bag' : 'Two bags'}.', 'I only have hand luggage.']),
      TalkTurn('Your flight leaves from gate ${_p(['A', 'B', 'C', 'D'])}${_n(2, 28)} at ${_p(_hours)}. Anything else?', ['No, thank you.', 'Where is the gate, please?']),
    ]);
  }

  static Talk _pharmacy() {
    final pain = _p(_pains);
    return Talk(titleAr: 'في الصيدلية', roleAr: 'أنت الزبون، والمدرب هو الصيدلي', scenarioEn: 'buying something at a pharmacy; you are the pharmacist', turns: [
      TalkTurn('Hello. How can I help you?', ['I have $pain.', 'I need something for $pain.']),
      TalkTurn('How long have you had it?', ['Since yesterday.', 'For ${_n(2, 5)} days.']),
      const TalkTurn('Are you taking any other medicine?', ['No, I am not.', 'Yes, I take vitamins.']),
      TalkTurn('Take this ${_p(['once', 'twice', 'three times'])} a day after food. Is that clear?', ['Yes, thank you.', 'Sorry, can you repeat that?']),
      TalkTurn('That is ${_n(4, 25)} dollars. Do you need a bag?', ['No, thank you.', 'Yes, please.']),
    ]);
  }

  static Talk _shop() {
    final item = _p(_clothes);
    return Talk(titleAr: 'في متجر الملابس', roleAr: 'أنت الزبون، والمدرب هو البائع', scenarioEn: 'shopping for clothes; you are the shop assistant', turns: [
      TalkTurn('Hi! Are you looking for something special?', ['I am looking for $item.', 'Yes, I need $item.']),
      const TalkTurn('What size do you wear?', ['Medium, please.', 'Large, I think.']),
      TalkTurn('What colour would you like?', ['${_p(_colors)}, please.', 'What colours do you have?']),
      const TalkTurn('The fitting room is over there. How does it fit?', ['It fits well.', 'It is too small. Do you have a bigger size?']),
      TalkTurn('It costs ${_n(25, 140)} dollars. Would you like to buy it?', ['Yes, I will take it.', 'It is a bit expensive. Is there a discount?']),
    ]);
  }

  static Talk _taxi() {
    final place = _p(_taxiPlaces);
    return Talk(titleAr: 'في التاكسي', roleAr: 'أنت الراكب، والمدرب هو السائق', scenarioEn: 'taking a taxi; you are the driver', turns: [
      TalkTurn('Hello. Where would you like to go?', ['To the $place, please.', 'Can you take me to the $place?']),
      const TalkTurn('Sure. Is it your first time in the city?', ['Yes, it is my first time.', 'No, I come here often.']),
      const TalkTurn('The traffic is heavy now. Is it OK if I take another road?', ['Yes, no problem.', 'How long will it take?']),
      const TalkTurn('Would you like the air conditioning on?', ['Yes, please. It is hot.', 'No, thank you. I am fine.']),
      TalkTurn('We are here. That is ${_n(8, 45)} dollars, please.', ['Here you are. Thank you.', 'Can I pay by card?']),
    ]);
  }

  static Talk _interview() {
    final field = _p(_fields);
    return Talk(titleAr: 'مقابلة عمل', roleAr: 'أنت المتقدم للوظيفة، والمدرب هو المحاور', scenarioEn: 'a job interview; you are the interviewer', turns: [
      TalkTurn('Thank you for coming. Can you tell me about yourself?', ['I studied $field and I have ${_n(2, 8)} years of experience.', 'I am hard-working and I like learning new things.']),
      const TalkTurn('Why do you want this job?', ['Because I want to grow and learn new skills.', 'I like working with people.']),
      const TalkTurn('What is your biggest strength?', ['I am organised and I learn fast.', 'I work well in a team.']),
      const TalkTurn('Can you work under pressure? Please give me an example.', ['Yes. In my last job I finished a big project in one week.', 'Yes, I stay calm and make a plan.']),
      const TalkTurn('When can you start?', ['I can start next month.', 'I can start immediately.']),
    ]);
  }

  static Talk _colleague() {
    final name = _p(_names);
    return Talk(titleAr: 'زميل جديد', roleAr: 'أنت موظف، والمدرب زميل جديد في الشركة', scenarioEn: 'small talk with a new colleague at work; you are the new colleague', turns: [
      TalkTurn('Hi, I am $name. I am new here. What is your name?', ['Nice to meet you, $name. My name is ...', 'Welcome! I am ...']),
      const TalkTurn('Nice to meet you. What do you do in the company?', ['I work in the sales team.', 'I am an accountant.']),
      TalkTurn('How long have you worked here?', ['For ${_n(1, 9)} years.', 'Since last year.']),
      const TalkTurn('What do you usually do at lunch time?', ['I usually eat with my team.', 'I bring food from home.']),
      const TalkTurn('It was nice talking to you. Shall we have coffee tomorrow?', ['Sure, that sounds great.', 'Sorry, I am busy tomorrow. Maybe on Thursday?']),
    ]);
  }

  static Talk _clinic() {
    final day = _p(_days);
    return Talk(titleAr: 'حجز موعد بالهاتف', roleAr: 'أنت المريض، والمدرب موظف العيادة', scenarioEn: 'booking a clinic appointment by phone; you are the receptionist', turns: [
      const TalkTurn('Good morning, City Clinic. How can I help you?', ['I would like to make an appointment.', 'Can I see a doctor this week?']),
      TalkTurn('Of course. What is the problem?', ['I have ${_p(_pains)}.', 'I need a general check-up.']),
      TalkTurn('Can you come on $day at ${_p(_hours)}?', ['Yes, that is fine.', 'Sorry, can I come later?']),
      const TalkTurn('Can I have your name and phone number, please?', ['My name is ... and my number is ...', 'Sure. It is ...']),
      TalkTurn('Thank you. See you on $day. Anything else?', ['No, thank you. Goodbye.', 'Where is the clinic, please?']),
    ]);
  }

  static Talk _directions() {
    final spot = _p(_spots);
    return Talk(titleAr: 'سائح يسألك عن الطريق', roleAr: 'أنت من أهل المدينة، والمدرب سائح', scenarioEn: 'a tourist asking a local for directions; you are the tourist', turns: [
      const TalkTurn('Excuse me, do you speak English?', ['Yes, a little. How can I help?', 'Yes, I do.']),
      TalkTurn('Is there a $spot near here?', ['Yes. Go straight and turn left.', 'Yes, it is next to the mosque.']),
      TalkTurn('How far is it?', ['About ${_n(3, 15)} minutes on foot.', 'It is very close.']),
      const TalkTurn('Is it open now?', ['Yes, I think so.', 'I am not sure, sorry.']),
      const TalkTurn('Thank you so much! Have a nice day.', ['You are welcome.', 'No problem. Enjoy your visit!']),
    ]);
  }
}
