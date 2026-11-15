/// بنك المحادثات: 10 أقسام، 72 موقفاً، ولكل موقف 6 صيغ = 672 محادثة.
/// يمكن إضافة مواقف جديدة لأي قسم من ملف المحتوى الخارجي (المفتاح talks).
library;

import 'dart:math';

import '../core/generators.dart';

class TalkCat {
  const TalkCat(this.id, this.titleAr, this.emoji);
  final String id;
  final String titleAr;
  final String emoji;
}

const talkCats = <TalkCat>[
  TalkCat('travel', 'سفر', '✈️'),
  TalkCat('food', 'مطاعم وطعام', '🍽️'),
  TalkCat('shopping', 'تسوق', '🛍️'),
  TalkCat('work', 'عمل', '💼'),
  TalkCat('health', 'صحة ورياضة', '🩺'),
  TalkCat('services', 'خدمات', '🏦'),
  TalkCat('social', 'علاقات اجتماعية', '🤝'),
  TalkCat('study', 'دراسة', '🎓'),
  TalkCat('phone', 'مكالمات هاتفية', '📞'),
  TalkCat('home', 'البيت والحياة اليومية', '🏠'),
];

class TalkVariant {
  const TalkVariant(this.cat, this.scenario, this.row, this.level, this.talk);
  final TalkCat cat;
  final int scenario;
  final int row;
  final String level;
  final Talk talk;
}

class _S {
  const _S(this.titleAr, this.roleAr, this.scenarioEn, this.turns, this.goals, this.rows);
  final String titleAr;
  final String roleAr;
  final String scenarioEn;

  /// كل دور: [كلام المدرب، تلميح 1، تلميح 2]
  final List<List<String>> turns;

  /// كل هدف: [الوصف بالعربية، كلمة مفتاحية 1، كلمة مفتاحية 2 ...]
  final List<List<String>> goals;
  final List<List<String>> rows;
}

String _cap(String s) => s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);

String _fill(String t, List<String> row) {
  var out = t;
  for (var i = 0; i < row.length; i++) {
    out = out.replaceAll('{$i^}', _cap(row[i])).replaceAll('{$i}', row[i]);
  }
  return out;
}

class TalkBank {
  static final Random _r = Random();

  /// محادثات إضافية من ملف المحتوى الخارجي، مفتاحها معرّف القسم.
  static final Map<String, List<Talk>> extra = {};

  static int count(String cat) => (_all[cat]?.length ?? 0) * 6 + (extra[cat]?.length ?? 0);

  static int get total => talkCats.fold(0, (a, c) => a + count(c.id));

  /// محادثة عشوائية من القسم. [avoidTitle] لتجنب تكرار الموقف السابق مباشرة.
  static Talk make(String cat, {String avoidTitle = ''}) {
    final ex = extra[cat] ?? const <Talk>[];
    final list = _all[cat] ?? const <_S>[];
    final n = list.length + ex.length;
    if (n == 0) return TalkGenerator.make();
    for (var attempt = 0; attempt < 6; attempt++) {
      final i = _r.nextInt(n);
      final t = i < ex.length ? ex[i] : _build(list[i - ex.length]);
      if (t.titleAr != avoidTitle || attempt == 5) return t;
    }
    return TalkGenerator.make();
  }

  /// «محادثة اليوم»: موقف يتغير كل يوم بترتيب ثابت، فيرى كل المستخدمين الموقف نفسه في اليوم نفسه.
  static Talk daily(int day) {
    final cat = talkCats[day % talkCats.length].id;
    final ex = extra[cat] ?? const <Talk>[];
    // المحادثات القادمة من ملف المحتوى لها الأولوية في أيام متفرقة لأنها الأحدث.
    if (ex.isNotEmpty && day % 3 == 0) return ex[(day ~/ 3) % ex.length];
    final list = _all[cat]!;
    final k = day ~/ talkCats.length;
    final s = list[k % list.length];
    return _build(s, row: (k ~/ list.length) % s.rows.length);
  }

  static String dailyCat(int day) => talkCats[day % talkCats.length].id;

  static Talk _build(_S s, {int? row}) {
    return _make(s, s.rows[row ?? _r.nextInt(s.rows.length)]);
  }

  /// كل الصيغ بترتيب ثابت (صيغة من كل موقف ثم التي تليها)، تُستخدم لتوليد الدروس وحلقات الحوار.
  /// بدون [all] تُرجع صيغ المواقف الأساسية فقط حتى لا تتغير أرقام الدروس المولّدة.
  static List<TalkVariant> variants({bool all = false}) {
    final out = <TalkVariant>[];
    for (var r = 0; r < 6; r++) {
      for (var c = 0; c < talkCats.length; c++) {
        final list = _bank[talkCats[c].id] ?? const <_S>[];
        for (var i = 0; i < list.length; i++) {
          final s = list[i];
          if (r >= s.rows.length) continue;
          out.add(TalkVariant(talkCats[c], i, r, const ['A1', 'A2', 'B1'][(i + c) % 3], _make(s, s.rows[r])));
        }
      }
    }
    if (all) {
      for (var r = 0; r < 6; r++) {
        for (var c = 0; c < talkCats.length; c++) {
          final base = (_bank[talkCats[c].id] ?? const <_S>[]).length;
          final list = _all[talkCats[c].id] ?? const <_S>[];
          for (var i = base; i < list.length; i++) {
            final s = list[i];
            if (r >= s.rows.length) continue;
            out.add(TalkVariant(talkCats[c], i, r, const ['A1', 'A2', 'B1'][(i + c) % 3], _make(s, s.rows[r])));
          }
        }
      }
    }
    return out;
  }

  static Talk _make(_S s, List<String> row) {
    return Talk(
      titleAr: s.titleAr,
      roleAr: s.roleAr,
      scenarioEn: s.scenarioEn,
      turns: [for (final t in s.turns) TalkTurn(_fill(t[0], row), [_fill(t[1], row), _fill(t[2], row)])],
      goals: [for (final g in s.goals) TalkGoal(g[0], g.sublist(1))],
    );
  }
}

const _bank = <String, List<_S>>{
  'travel': [
    _S('تأجير سيارة', 'أنت تستأجر سيارة، والمدرب موظف المكتب', 'Renting a car at a rental office', [
      ['Good morning. Welcome to City Car Rental. How can I help you?', 'I would like to rent a car.', 'I need a car for {1} days.'],
      ['Sure. We have {0} available. Is that okay?', 'Yes, that is fine.', 'Do you have a bigger one?'],
      ['May I see your driving licence and passport, please?', 'Here you are.', 'Of course.'],
      ['Would you like to add insurance?', 'Yes, please. How much is it?', 'No, thank you.'],
      ['Great. Please return the car with a full tank. Any questions?', 'Where do I return it?', 'No, everything is clear.'],
    ], [
      ['اطلب استئجار سيارة', 'rent', 'need a car'],
      ['اسأل عن السعر أو مكان الإرجاع', 'how much', 'where'],
    ], [
      ['a small car', '3'], ['a family car', '5'], ['an SUV', '7'], ['an automatic car', '2'], ['an electric car', '4'], ['a seven-seat van', '6'],
    ]),
    _S('عند موظف الجوازات', 'وصلت إلى بلد جديد، والمدرب موظف الجوازات', 'Passport control at the airport', [
      ['Good evening. Passport, please.', 'Here you are.', 'Good evening. Here it is.'],
      ['What is the purpose of your visit?', 'I am here on holiday.', 'I am here for business.'],
      ['How long are you going to stay?', 'For {0}.', 'About {0}.'],
      ['Where will you be staying?', 'At {1}.', 'With my friends.'],
      ['Thank you. Enjoy your stay.', 'Thank you very much.', 'Have a nice day.'],
    ], [
      ['اذكر سبب الزيارة', 'holiday', 'business', 'visit', 'study', 'work'],
      ['اذكر مدة الإقامة', 'day', 'week', 'month'],
    ], [
      ['one week', 'the Plaza Hotel'], ['ten days', 'a hotel in the city centre'], ['two weeks', 'the Garden Inn'], ['five days', 'a rented flat'], ['three days', 'the Airport Hotel'], ['a month', 'a student residence'],
    ]),
    _S('حقيبة مفقودة', 'حقيبتك لم تصل، والمدرب موظف الأمتعة', 'Reporting lost baggage at the airport', [
      ['Hello. This is the baggage service desk. How can I help?', 'My bag did not arrive.', 'I cannot find my suitcase.'],
      ['I am sorry about that. Which flight were you on?', 'The flight from {0}.', 'I came from {0}.'],
      ['Can you describe your bag?', 'It is {1}.', 'It is {1} with a name tag.'],
      ['Thank you. Where should we deliver it when we find it?', 'To my hotel, please.', 'To this address.'],
      ['We will call you within 24 hours. Is there anything else?', 'Can I have a reference number?', 'No, thank you for your help.'],
    ], [
      ['صف الحقيبة', 'black', 'blue', 'red', 'grey', 'green', 'brown', 'suitcase', 'bag', 'backpack'],
      ['اطلب رقماً مرجعياً أو اشكر الموظف', 'reference', 'thank'],
    ], [
      ['Cairo', 'a large black suitcase'], ['Istanbul', 'a small blue suitcase'], ['Dubai', 'a red travel bag'], ['Paris', 'a grey backpack'], ['Jeddah', 'a brown leather bag'], ['London', 'a green suitcase'],
    ]),
    _S('شراء تذكرة قطار', 'أنت في محطة القطار، والمدرب بائع التذاكر', 'Buying a train ticket', [
      ['Next, please. Where would you like to go?', 'A ticket to {0}, please.', 'I would like to go to {0}.'],
      ['Single or return?', 'Return, please.', 'Single, please.'],
      ['The next train leaves at {1}. Is that okay?', 'Yes, perfect.', 'Is there a later one?'],
      ['First class or standard?', 'Standard, please.', 'How much is first class?'],
      ['Here is your ticket. Platform 4.', 'Thank you. Where is platform 4?', 'Thanks a lot.'],
    ], [
      ['حدد وجهتك', 'to ', 'ticket'],
      ['اسأل سؤالاً واحداً على الأقل', 'where', 'how much', 'is there', 'what time'],
    ], [
      ['Manchester', 'ten fifteen'], ['Lyon', 'half past two'], ['Alexandria', 'nine in the morning'], ['Ankara', 'quarter to five'], ['Milan', 'noon'], ['Tangier', 'seven thirty'],
    ]),
    _S('في الفندق: مشكلة في الغرفة', 'أنت نزيل في فندق، والمدرب موظف الاستقبال', 'Reporting a problem with a hotel room', [
      ['Reception, good evening. How can I help you?', 'There is a problem in my room.', 'Hello. {0} in my room.'],
      ['I am sorry to hear that. What is your room number?', 'It is room {1}.', 'Room {1}, please.'],
      ['Thank you. I can send someone in ten minutes. Is that okay?', 'Yes, that is fine.', 'Could you send someone sooner?'],
      ['Would you like to change rooms instead?', 'Yes, if possible.', 'No, I prefer to stay here.'],
      ['All right. Is there anything else I can do for you?', 'Could I have an extra towel?', 'No, thank you for your help.'],
    ], [
      ['اشرح المشكلة', 'problem', 'not working', 'broken', 'no hot', 'noisy', 'dirty', 'does not'],
      ['اذكر رقم غرفتك', 'room'],
    ], [
      ['The air conditioner is not working', '204'], ['There is no hot water', '315'], ['The television does not work', '108'], ['The room is very noisy', '422'], ['The door lock is broken', '517'], ['The internet does not work', '609'],
    ]),
  ],
  'food': [
    _S('طلب توصيل بالهاتف', 'أنت تطلب طعاماً بالهاتف، والمدرب موظف المطعم', 'Ordering food delivery by phone', [
      ['Hello, {0}. Can I take your order?', 'I would like to order {1}.', 'Can I have {1}, please?'],
      ['Sure. Anything to drink?', 'An orange juice, please.', 'No, thanks.'],
      ['What is your address?', 'It is 12 Park Street.', 'I live near the main square.'],
      ['Will you pay by cash or card?', 'Cash, please.', 'By card.'],
      ['Your order will arrive in thirty minutes.', 'Great, thank you.', 'Can you make it faster?'],
    ], [
      ['اطلب طعاماً', 'order', 'have', 'like'],
      ['اذكر طريقة الدفع', 'cash', 'card'],
    ], [
      ['Pizza House', 'a large cheese pizza'], ['Burger Corner', 'two chicken burgers'], ['Grill Palace', 'a mixed grill'], ['Noodle Bar', 'chicken noodles'], ['Sandwich Stop', 'three falafel sandwiches'], ['Sweet Home', 'a box of baklava'],
    ]),
    _S('شكوى في المطعم', 'طبقك فيه مشكلة، والمدرب النادل', 'Complaining politely in a restaurant', [
      ['Is everything okay with your meal?', 'I am sorry, but {0}.', 'Excuse me, {0}.'],
      ['I am very sorry. Would you like me to change it?', 'Yes, please.', 'Could you bring a new one?'],
      ['It will take about ten minutes. Is that all right?', 'That is fine.', 'Please be quick.'],
      ['Can I offer you a free drink while you wait?', 'That would be nice.', 'No, thank you.'],
      ['Here you are. I hope it is better now.', 'It is perfect, thank you.', 'Much better.'],
    ], [
      ['اشرح المشكلة بأدب', 'sorry', 'excuse'],
      ['اطلب تغيير الطبق', 'change', 'new', 'another', 'bring', 'yes'],
    ], [
      ['the soup is cold'], ['my steak is not cooked well'], ['this is not what I ordered'], ['the food is too salty'], ['there is a hair in my salad'], ['the rice is burnt'],
    ]),
    _S('حجز طاولة', 'أنت تحجز طاولة بالهاتف، والمدرب موظف المطعم', 'Booking a table at a restaurant', [
      ['Good afternoon, {0} Restaurant. How can I help?', 'I would like to book a table.', 'Do you have a table for tonight?'],
      ['For how many people?', 'For {1}.', '{1^}, please.'],
      ['What time would you like?', 'At eight.', 'Around half past seven.'],
      ['Inside or on the terrace?', 'Inside, please.', 'On the terrace, if possible.'],
      ['May I have your name, please?', 'My name is Ahmed.', 'It is Sara.'],
    ], [
      ['اطلب حجز طاولة', 'book', 'table', 'reserve'],
      ['اذكر الوقت', 'at ', 'around', 'seven', 'eight', 'nine'],
    ], [
      ['Olive', 'two people'], ['Blue Sea', 'four people'], ['Garden', 'six people'], ['Saffron', 'three people'], ['Old House', 'five people'], ['Sunset', 'eight people'],
    ]),
    _S('في المقهى مع صديق', 'أنت تجلس مع صديق في مقهى، والمدرب صديقك', 'Chatting with a friend at a cafe', [
      ['Hi! Good to see you. What would you like to drink?', 'I will have {0}.', '{0^}, please.'],
      ['Good choice. How was your week?', 'It was busy.', 'It was great.'],
      ['Really? What happened?', 'I had a lot of work.', 'I started a new course.'],
      ['Do you have any plans for the weekend?', 'I am going to {1}.', 'Not yet. And you?'],
      ['That sounds fun. Let us do this again soon.', 'Sure, see you next week.', 'Definitely.'],
    ], [
      ['تحدث عن أسبوعك', 'week', 'work', 'busy', 'great', 'good', 'course'],
      ['اذكر خطتك', 'going to', 'will', 'plan'],
    ], [
      ['a cappuccino', 'visit my family'], ['a green tea', 'watch a football match'], ['an iced coffee', 'go to the beach'], ['a hot chocolate', 'study for my exam'], ['a lemonade', 'go shopping'], ['a Turkish coffee', 'stay at home and rest'],
    ]),
    _S('طلب خاص في المطعم', 'لديك طلب خاص في طعامك، والمدرب النادل', 'Ordering with a special request', [
      ['Good evening. Are you ready to order?', 'Yes. What do you recommend?', 'Yes, I would like the {0}.'],
      ['The {0} is very popular. Would you like to try it?', 'Yes, but {1}, please.', 'Does it have nuts in it?'],
      ['Of course. I will tell the chef. Anything on the side?', 'A small salad, please.', 'Just some bread.'],
      ['And to drink?', 'Water, please.', 'A fresh juice, please.'],
      ['Perfect. Your food will be ready in fifteen minutes.', 'Thank you very much.', 'Great, thanks.'],
    ], [
      ['اذكر طلبك الخاص', 'without', 'no ', 'less', 'not too', 'extra', 'well done'],
      ['اطلب مشروباً أو طبقاً جانبياً', 'water', 'juice', 'salad', 'bread', 'tea'],
    ], [
      ['grilled chicken', 'without onions'], ['beef burger', 'well done'], ['pasta', 'with less salt'], ['vegetable soup', 'not too hot'], ['fish', 'with extra lemon'], ['rice dish', 'with no spicy sauce'],
    ]),
  ],
  'shopping': [
    _S('إرجاع منتج', 'اشتريت شيئاً وتريد إرجاعه، والمدرب موظف المتجر', 'Returning a product to a shop', [
      ['Hello. How can I help you today?', 'I would like to return {0}.', 'I bought {0} here yesterday.'],
      ['What is the problem with it?', '{1^}.', 'I do not like it.'],
      ['Do you have the receipt?', 'Yes, here it is.', 'I am afraid I lost it.'],
      ['Would you like a refund or an exchange?', 'A refund, please.', 'I would like to exchange it.'],
      ['No problem. It is done.', 'Thank you for your help.', 'That was easy.'],
    ], [
      ['اشرح سبب الإرجاع', 'small', 'big', 'work', 'fit', 'colour', 'color', 'sound', 'uncomfortable', 'wrong', 'like'],
      ['اختر استرداداً أو استبدالاً', 'refund', 'exchange'],
    ], [
      ['this jacket', 'it is too small'], ['these shoes', 'they are uncomfortable'], ['this phone case', 'it does not fit my phone'], ['this blender', 'it does not work'], ['this shirt', 'the colour is different'], ['these headphones', 'the sound is bad'],
    ]),
    _S('المساومة في السوق', 'أنت في سوق شعبي، والمدرب البائع', 'Bargaining in a traditional market', [
      ['Welcome, my friend! This {0} is very special.', 'How much is it?', 'It is nice. What is the price?'],
      ['For you, only {1} dollars.', 'That is too expensive.', 'Can you give me a discount?'],
      ['It is handmade. What is your price?', 'I can pay less.', 'What is your best price?'],
      ['Okay, okay. I will take ten dollars off.', 'A little more, please.', 'Deal.'],
      ['You are a good customer. Shall I put it in a bag?', 'Yes, please.', 'Thank you.'],
    ], [
      ['اسأل عن السعر', 'how much', 'price'],
      ['اطلب خصماً', 'discount', 'expensive', 'less', 'best price', 'cheaper', 'more'],
    ], [
      ['carpet', '120'], ['lamp', '60'], ['leather bag', '90'], ['silver ring', '75'], ['scarf', '40'], ['wooden box', '55'],
    ]),
    _S('شراء هاتف جديد', 'أنت في متجر هواتف، والمدرب البائع', 'Buying a new phone', [
      ['Hi there. Are you looking for anything in particular?', 'I am looking for a new phone.', 'I need a phone with {0}.'],
      ['This model has {0}. What is your budget?', 'Around {1} dollars.', 'Not more than {1} dollars.'],
      ['This one fits your budget. Would you like to try it?', 'Yes, please.', 'Does it have a warranty?'],
      ['It comes with a two-year warranty. Which colour do you prefer?', 'Black, please.', 'Do you have it in blue?'],
      ['Great choice. Cash or card?', 'Card, please.', 'I will pay in cash.'],
    ], [
      ['اذكر ما تبحث عنه', 'looking for', 'need', 'want'],
      ['اسأل عن الضمان أو اختر اللون', 'warranty', 'colour', 'color', 'blue', 'black', 'white'],
    ], [
      ['a good camera', '400'], ['a big battery', '300'], ['a large screen', '500'], ['a lot of storage', '600'], ['fast charging', '350'], ['a strong body', '250'],
    ]),
    _S('في السوبرماركت', 'أنت تبحث عن منتج، والمدرب موظف السوبرماركت', 'Asking for help in a supermarket', [
      ['Excuse me, can I help you find something?', 'Where can I find {0}?', 'I am looking for {0}.'],
      ['It is in aisle {1}, next to the bread.', 'Thank you. Is it on offer today?', 'Thanks. And the milk?'],
      ['Yes, there is a special offer: buy two, get one free.', 'Great, I will take three.', 'Just one, thanks.'],
      ['Do you need a bag?', 'Yes, please.', 'No, I have my own.'],
      ['Have a nice day!', 'You too.', 'Thanks, bye.'],
    ], [
      ['اسأل عن مكان منتج', 'where', 'looking for', 'find'],
      ['رد التحية في النهاية', 'you too', 'thank', 'bye'],
    ], [
      ['olive oil', '3'], ['rice', '5'], ['coffee', '7'], ['cheese', '2'], ['honey', '4'], ['pasta', '6'],
    ]),
    _S('شراء ملابس', 'أنت في محل ملابس، والمدرب البائع', 'Buying clothes and asking about sizes', [
      ['Hello! Can I help you find something?', 'I am looking for {0}.', 'Do you have {0}?'],
      ['Yes, we do. What size do you wear?', '{1^}, please.', 'I am not sure. Can I try it on?'],
      ['Here you are. The fitting room is over there.', 'Thank you.', 'Do you have it in another colour?'],
      ['How does it fit?', 'It fits well.', 'It is a little tight. Do you have a bigger size?'],
      ['Great. Would you like to buy it?', 'Yes, I will take it.', 'How much is it?'],
    ], [
      ['اذكر ما تبحث عنه', 'looking for', 'do you have', 'need', 'want'],
      ['اسأل عن المقاس أو اللون أو السعر', 'size', 'colour', 'color', 'how much', 'bigger', 'smaller', 'try'],
    ], [
      ['a white shirt', 'medium'], ['a winter jacket', 'large'], ['black trousers', 'small'], ['a blue dress', 'medium'], ['running shoes', 'size forty-two'], ['a grey suit', 'large'],
    ]),
  ],
  'work': [
    _S('حديث مع المدير', 'طلبت لقاء مديرك، والمدرب هو المدير', 'Talking to your manager about a request', [
      ['Come in. You wanted to talk to me?', 'Yes. I would like to talk about {0}.', 'Do you have a few minutes?'],
      ['Of course. Tell me more.', 'I think {1}.', 'In my opinion, {1}.'],
      ['I see. Why do you think so?', 'Because it will help the team.', 'Because I have worked hard this year.'],
      ['That is a fair point. What do you suggest?', 'Could we try it for one month?', 'I suggest we start next week.'],
      ['All right. Send me an email with the details.', 'I will send it today.', 'Thank you for listening.'],
    ], [
      ['اعرض موضوعك', 'talk about', 'like to', 'about'],
      ['قدّم اقتراحاً', 'suggest', 'could we', 'try', 'propose'],
    ], [
      ['my working hours', 'I could work better with flexible hours'], ['a training course', 'a course would improve my skills'], ['my salary', 'my salary should be reviewed'], ['a new project', 'I am ready to lead a small project'], ['working from home', 'two days at home would save time'], ['my workload', 'I have too many tasks'],
    ]),
    _S('عرض منتج على عميل', 'أنت مندوب مبيعات، والمدرب عميل محتمل', 'Presenting your product to a client', [
      ['Thanks for coming. So, what does your company offer?', 'We offer {0}.', 'Our company provides {0}.'],
      ['Interesting. How is it different from others?', 'It is {1}.', 'The main advantage is that it is {1}.'],
      ['And what about the price?', 'It starts from one hundred dollars a month.', 'We have flexible plans.'],
      ['Can we try it before we buy?', 'Yes, there is a free trial.', 'Of course, for two weeks.'],
      ['Good. Please send me a proposal.', 'I will send it tomorrow.', 'Thank you for your time.'],
    ], [
      ['قدّم ما تعرضه شركتك', 'offer', 'provide'],
      ['اذكر ميزة', 'advantage', 'easy', 'faster', 'cheaper', 'reliable', 'practical', 'accurate', 'better'],
    ], [
      ['an accounting system', 'easy to use'], ['a delivery service', 'faster than others'], ['cleaning services', 'more reliable'], ['a training programme', 'more practical'], ['a booking app', 'cheaper'], ['security cameras', 'more accurate'],
    ]),
    _S('الاعتذار عن التأخر', 'ستتأخر عن العمل وتتصل بالمكتب، والمدرب زميلك', 'Calling the office to say you will be late', [
      ['Hello, this is the office. Who is speaking?', 'This is Ahmed from sales.', 'Hello, it is Sara.'],
      ['Hi. Is everything okay?', 'I am going to be late because {0}.', 'I am sorry, {0}.'],
      ['Oh no. When will you arrive?', 'In about {1}.', 'I will be there in {1}.'],
      ['You have a meeting at ten. Shall I move it?', 'Yes, please move it.', 'No, I will join online.'],
      ['Okay. Drive safely.', 'Thank you so much.', 'See you soon.'],
    ], [
      ['اعتذر', 'sorry', 'apolog'],
      ['اذكر وقت وصولك', 'minute', 'hour'],
    ], [
      ['my car broke down', 'an hour'], ['I missed the bus', 'forty minutes'], ['there is heavy traffic', 'thirty minutes'], ['my son is sick', 'two hours'], ['the train was cancelled', 'ninety minutes'], ['I have a flat tyre', 'an hour and a half'],
    ]),
    _S('طلب مساعدة من زميل', 'لديك عمل كثير، والمدرب زميلك', 'Asking a colleague for help', [
      ['Hey, you look busy. What are you working on?', 'I am working on {0}.', 'I have to finish {0}.'],
      ['That sounds like a lot. When is the deadline?', 'It is {1}.', 'I have until {1}.'],
      ['Do you need any help?', 'Yes, could you check the numbers?', 'That would be great.'],
      ['Sure. Send me the file.', 'I will send it now.', 'Thanks, I owe you one.'],
      ['No problem. Let us finish it together.', 'You are a great colleague.', 'Thank you.'],
    ], [
      ['اشرح ما تعمل عليه', 'working on', 'finish', 'have to'],
      ['اطلب المساعدة بأدب', 'could you', 'can you', 'please', 'would'],
    ], [
      ['the monthly report', 'tomorrow morning'], ['a presentation', 'Thursday'], ['the budget file', 'the end of the day'], ['a client proposal', 'Monday'], ['the sales summary', 'tonight'], ['the training plan', 'next week'],
    ]),
    _S('أول تعارف مع فريق العمل', 'هذا يومك الأول، والمدرب زميل يرحب بك', 'Introducing yourself to a new team', [
      ['Hi, you must be the new colleague. Welcome to the team!', 'Thank you. Nice to meet you.', 'Thanks. I am happy to be here.'],
      ['What will you be doing with us?', 'I am the new {0}.', 'I will work as {0}.'],
      ['Great. Where did you work before?', 'I worked at {1}.', 'I was at {1} for three years.'],
      ['Nice. Do you have any questions about the office?', 'Where can I find the meeting room?', 'What time do we start?'],
      ['We start at nine. Let me show you around.', 'That would be great.', 'Thank you, I appreciate it.'],
    ], [
      ['عرّف بوظيفتك الجديدة', 'i am', 'i will', 'work as', 'new'],
      ['اسأل سؤالاً عن المكتب', 'where', 'what time', 'when', 'who', 'how'],
    ], [
      ['accountant', 'a small company'], ['designer', 'an advertising agency'], ['sales representative', 'a car company'], ['developer', 'a start-up'], ['project coordinator', 'a construction firm'], ['office manager', 'a law firm'],
    ]),
  ],
  'health': [
    _S('عند طبيب الأسنان', 'أنت مريض، والمدرب طبيب الأسنان', 'Visiting the dentist', [
      ['Hello. Please sit down. What seems to be the problem?', 'I have {0}.', 'My tooth hurts.'],
      ['How long have you had it?', 'For {1}.', 'Since last week.'],
      ['Does it hurt when you eat something cold?', 'Yes, a lot.', 'Only sometimes.'],
      ['I need to take an X-ray. Is that okay?', 'Yes, of course.', 'Will it hurt?'],
      ['You need a small filling. We can do it today.', 'Okay, let us do it.', 'How much will it cost?'],
    ], [
      ['صف المشكلة', 'hurt', 'pain', 'ache', 'broken', 'tooth', 'filling', 'swollen'],
      ['اسأل سؤالاً', 'how much', 'will it', 'how long'],
    ], [
      ['a toothache', 'two days'], ['a broken tooth', 'three days'], ['pain in my gums', 'a week'], ['a sensitive tooth', 'a month'], ['a swollen cheek', 'one day'], ['a loose filling', 'five days'],
    ]),
    _S('في صالة الرياضة', 'أنت مشترك جديد، والمدرب مدرب الصالة', 'Joining a gym', [
      ['Welcome to the gym! Is this your first time here?', 'Yes, it is.', 'Yes, I want to join.'],
      ['Great. What is your goal?', 'I want to {0}.', 'My goal is to {0}.'],
      ['How many days a week can you train?', '{1^} days.', 'About {1} days.'],
      ['Do you have any injuries?', 'No, I am fine.', 'I have a weak knee.'],
      ['Perfect. Let us start with a light programme.', 'Sounds good.', 'When can I start?'],
    ], [
      ['اذكر هدفك', 'want to', 'goal'],
      ['اذكر عدد أيام التمرين', 'day'],
    ], [
      ['lose weight', 'three'], ['build muscle', 'four'], ['get fit', 'two'], ['improve my health', 'five'], ['run a marathon', 'six'], ['reduce stress', 'three'],
    ]),
    _S('عند طبيب العيون', 'نظرك ضعف، والمدرب طبيب العيون', 'Visiting the eye doctor', [
      ['Good morning. What brings you here today?', 'I cannot see {0} clearly.', 'I have trouble seeing {0}.'],
      ['Do you wear glasses?', 'Yes, I do.', 'No, I do not.'],
      ['Do you get headaches?', 'Yes, in the evening.', 'Not really.'],
      ['Please read the letters on the wall.', 'I can read the first three lines.', 'The last line is not clear.'],
      ['You need new glasses. Here is your prescription.', 'Thank you, doctor.', 'Where can I buy them?'],
    ], [
      ['صف مشكلة النظر', 'see', 'read', 'clear'],
      ['اشكر الطبيب أو اسأله', 'thank', 'where'],
    ], [
      ['far things'], ['small letters'], ['the board at work'], ['road signs at night'], ['my phone screen'], ['the television'],
    ]),
    _S('نصيحة غذائية', 'أنت تزور أخصائي تغذية، والمدرب هو الأخصائي', 'Talking to a nutritionist', [
      ['Hello. I am the nutritionist. Tell me about your eating habits.', 'I usually eat {0}.', 'I eat a lot of {0}.'],
      ['And how much water do you drink?', 'About {1} glasses a day.', 'Not much.'],
      ['Do you eat breakfast?', 'Yes, every day.', 'No, I usually skip it.'],
      ['I suggest more vegetables and less sugar. Can you do that?', 'I will try.', 'It is hard, but okay.'],
      ['Good. Let us meet again in two weeks.', 'See you then.', 'Thank you for the advice.'],
    ], [
      ['صف عاداتك الغذائية', 'eat', 'usually'],
      ['اذكر كمية الماء', 'glass', 'water', 'much'],
    ], [
      ['fast food', 'three'], ['rice and bread', 'four'], ['sweets', 'two'], ['fried food', 'five'], ['late dinners', 'six'], ['snacks', 'three'],
    ]),
    _S('في الصيدلية: دواء بوصفة', 'معك وصفة طبية، والمدرب الصيدلي', 'Collecting a prescription at the pharmacy', [
      ['Good afternoon. How can I help you?', 'I have a prescription.', 'Hello. I need this medicine, please.'],
      ['Let me see. This is for {0}. Have you taken it before?', 'No, this is the first time.', 'Yes, I have.'],
      ['Take it {1}. Do you have any allergies?', 'No, I do not.', 'Yes, I am allergic to penicillin.'],
      ['Good. Do not take it on an empty stomach. Any questions?', 'Are there any side effects?', 'Can I take it with other medicines?'],
      ['You may feel a little sleepy. That is all.', 'Thank you for your advice.', 'How much is it?'],
    ], [
      ['قدّم الوصفة', 'prescription', 'medicine'],
      ['اسأل عن الدواء', 'side effects', 'can i', 'how much', 'how many', 'how long'],
    ], [
      ['a cough', 'twice a day'], ['a headache', 'every eight hours'], ['a stomach problem', 'after meals'], ['an allergy', 'once a day'], ['a sore throat', 'three times a day'], ['back pain', 'before bed'],
    ]),
  ],
  'services': [
    _S('فتح حساب بنكي', 'أنت في البنك، والمدرب موظف البنك', 'Opening a bank account', [
      ['Good morning. How may I help you?', 'I would like to open {0}.', 'I want to open an account.'],
      ['Certainly. May I see your ID?', 'Here it is.', 'Is a passport okay?'],
      ['What is your job?', 'I am {1}.', 'I work as {1}.'],
      ['Would you like a debit card?', 'Yes, please.', 'Is it free?'],
      ['Your account is ready. Anything else?', 'How do I use online banking?', 'No, thank you.'],
    ], [
      ['اطلب فتح حساب', 'open', 'account'],
      ['اذكر عملك', 'i am', 'work as', 'i work'],
    ], [
      ['a savings account', 'a teacher'], ['a current account', 'an engineer'], ['a student account', 'a student'], ['a business account', 'a shop owner'], ['a joint account', 'a nurse'], ['a savings account', 'a driver'],
    ]),
    _S('مشكلة في الإنترنت', 'تتصل بخدمة العملاء، والمدرب موظف الدعم', 'Calling customer service about an internet problem', [
      ['Thank you for calling. How can I help you?', 'My internet is {0}.', 'I have a problem. The internet is {0}.'],
      ['I am sorry to hear that. Since when?', 'Since {1}.', 'It started {1}.'],
      ['Have you tried restarting the router?', 'Yes, twice.', 'No, not yet.'],
      ['I will send a technician. Is tomorrow morning okay?', 'Yes, that works.', 'Can he come today?'],
      ['Done. You will receive a message.', 'Thank you for your help.', 'Great, thanks.'],
    ], [
      ['اشرح المشكلة', 'slow', 'not working', 'problem', 'down', 'cutting', 'unstable'],
      ['اتفق على موعد', 'tomorrow', 'today', 'yes', 'morning'],
    ], [
      ['very slow', 'yesterday'], ['not working', 'this morning'], ['cutting out every hour', 'last night'], ['slow in the evening', 'Monday'], ['down completely', 'two days ago'], ['unstable', 'the weekend'],
    ]),
    _S('في مكتب البريد', 'تريد إرسال شيء، والمدرب موظف البريد', 'Sending something at the post office', [
      ['Hello. What can I do for you?', 'I want to send {0} to {1}.', 'I would like to send this to {1}.'],
      ['Normal or express delivery?', 'Express, please.', 'How long does normal take?'],
      ['Normal takes about ten days. Express takes three.', 'Express, then.', 'Normal is fine.'],
      ['What is inside?', 'Some clothes.', 'Just documents.'],
      ['That will be twenty dollars.', 'Here you are.', 'Can I pay by card?'],
    ], [
      ['اذكر ما تريد إرساله وإلى أين', 'send'],
      ['اختر نوع التوصيل', 'express', 'normal'],
    ], [
      ['a package', 'Germany'], ['a letter', 'Canada'], ['a box of books', 'Morocco'], ['a small parcel', 'Saudi Arabia'], ['some documents', 'Turkey'], ['a gift', 'Jordan'],
    ]),
    _S('استئجار شقة', 'تتصل بصاحب شقة للإيجار، والمدرب هو المالك', 'Calling about a flat for rent', [
      ['Hello. Are you calling about the flat?', 'Yes. Is it still available?', 'Yes, the one in {0}.'],
      ['It is. It has {1} and a small kitchen.', 'How much is the rent?', 'Is it furnished?'],
      ['It is six hundred dollars a month, with furniture.', 'Does that include bills?', 'That is a bit high.'],
      ['Water is included. When would you like to see it?', 'Tomorrow afternoon.', 'Can I come today?'],
      ['Fine. I will send you the address.', 'Thank you. See you then.', 'Perfect.'],
    ], [
      ['اسأل عن الإيجار أو الأثاث', 'rent', 'how much', 'furnished'],
      ['حدد موعد المعاينة', 'tomorrow', 'today', 'come', 'see it'],
    ], [
      ['the city centre', 'two bedrooms'], ['the old town', 'one bedroom'], ['the university area', 'a large living room'], ['the seaside district', 'three bedrooms'], ['the new quarter', 'two bathrooms'], ['the quiet suburb', 'a balcony'],
    ]),
    _S('تجديد وثيقة رسمية', 'أنت في مكتب حكومي، والمدرب الموظف', 'Renewing an official document', [
      ['Next, please. What can I do for you?', 'I would like to renew {0}.', 'I need to renew {0}, please.'],
      ['Do you have your old one and a photo?', 'Yes, here they are.', 'I have the old one, but no photo.'],
      ['Please fill in this form. Do you need help?', 'No, I can do it.', 'Yes, what should I write here?'],
      ['The fee is {1} dollars. How would you like to pay?', 'By card, please.', 'In cash.'],
      ['It will be ready in five working days.', 'Can I get it sooner?', 'Thank you. Where do I collect it?'],
    ], [
      ['اذكر الوثيقة التي تريد تجديدها', 'renew'],
      ['اختر طريقة الدفع', 'card', 'cash'],
    ], [
      ['my passport', 'sixty'], ['my driving licence', 'thirty'], ['my ID card', 'twenty'], ['my residence permit', 'eighty'], ['my car registration', 'forty'], ['my health card', 'fifteen'],
    ]),
  ],
  'social': [
    _S('جار جديد', 'انتقلت إلى سكن جديد، والمدرب جارك', 'Meeting a new neighbour', [
      ['Hi! I do not think we have met. I live next door.', 'Nice to meet you. I am new here.', 'Hello! I moved in {0}.'],
      ['Welcome! Where are you from?', 'I am from Egypt.', 'I come from Jordan.'],
      ['And what do you do?', 'I am {1}.', 'I work as {1}.'],
      ['Do you like the neighbourhood so far?', 'Yes, it is quiet.', 'It is nice, but I do not know it well.'],
      ['If you need anything, just knock.', 'That is very kind of you.', 'Thank you so much.'],
    ], [
      ['عرّف بنفسك', 'i am', 'my name', 'i moved', 'i come'],
      ['اشكر الجار', 'thank', 'kind'],
    ], [
      ['yesterday', 'an accountant'], ['last week', 'a nurse'], ['two days ago', 'a teacher'], ['on Monday', 'a programmer'], ['this month', 'a chef'], ['last weekend', 'a student'],
    ]),
    _S('دعوة من صديق', 'صديقك يدعوك، والمدرب هو الصديق', 'Accepting an invitation from a friend', [
      ['Hey! Are you free {0}?', 'Yes, I am. Why?', 'I think so.'],
      ['I am having {1}. Would you like to come?', 'I would love to.', 'Sounds great. What time?'],
      ['Around seven. Can you bring something?', 'Sure. I will bring dessert.', 'What should I bring?'],
      ['Dessert would be perfect. Do you know my address?', 'Yes, I remember.', 'Please send it to me.'],
      ['Great. See you then!', 'See you!', 'Thanks for inviting me.'],
    ], [
      ['اقبل الدعوة', 'love to', 'sounds', 'yes', 'sure'],
      ['اسأل عن الوقت أو ما تحضره', 'what time', 'bring', 'when'],
    ], [
      ['on Friday evening', 'a small dinner'], ['this Saturday', 'a birthday party'], ['tomorrow night', 'a barbecue'], ['on Sunday', 'a family lunch'], ['next Thursday', 'a game night'], ['this weekend', 'a housewarming party'],
    ]),
    _S('الحديث عن الهوايات', 'تتعرف على شخص جديد، والمدرب يسألك عن هواياتك', 'Talking about hobbies', [
      ['So, what do you do in your free time?', 'I enjoy {0}.', 'I like {0}.'],
      ['Nice! How often do you do it?', '{1^}.', 'About {1}.'],
      ['How did you start?', 'A friend taught me.', 'I learned from videos.'],
      ['Is it expensive?', 'Not really.', 'A little.'],
      ['Maybe I should try it too.', 'You should! I can show you.', 'Yes, it is fun.'],
    ], [
      ['اذكر هوايتك', 'enjoy', 'like', 'love'],
      ['اذكر كم مرة تمارسها', 'week', 'month', 'every', 'once', 'twice', 'times'],
    ], [
      ['playing football', 'twice a week'], ['cooking', 'every weekend'], ['reading novels', 'every night'], ['hiking', 'once a month'], ['photography', 'every Friday'], ['swimming', 'three times a week'],
    ]),
    _S('تهنئة صديق', 'صديقك عنده خبر سعيد، والمدرب هو الصديق', 'Congratulating a friend', [
      ['Guess what? I have some news: {0}!', 'Congratulations!', 'That is wonderful news!'],
      ['Thank you! I still cannot believe it.', 'You deserve it.', 'I am so happy for you.'],
      ['It was not easy, to be honest.', 'I know. You worked hard.', 'How long did it take?'],
      ['We should celebrate. Are you free {1}?', 'Yes, of course.', 'Let me check my calendar.'],
      ['Great, I will book a place.', 'I cannot wait.', 'See you then!'],
    ], [
      ['هنّئ صديقك', 'congratulations', 'happy for you', 'wonderful', 'great news'],
      ['وافق على الاحتفال', 'yes', 'of course', 'free', 'sure'],
    ], [
      ['I got a new job', 'on Friday'], ['I passed my exam', 'tomorrow'], ['I am getting married', 'next week'], ['we had a baby girl', 'on Sunday'], ['I bought a house', 'this weekend'], ['I got a promotion', 'tonight'],
    ]),
    _S('اعتذار لصديق', 'تأخرت على صديقك أو نسيت موعداً، والمدرب هو الصديق', 'Apologising to a friend', [
      ['Hey. I waited for you for an hour yesterday.', 'I am so sorry. {0^}.', 'I am really sorry about that.'],
      ['You could have called me.', 'You are right. I should have called.', 'My phone battery was dead.'],
      ['Okay. I was just worried about you.', 'Thank you for understanding.', 'It will not happen again.'],
      ['So, how can you make it up to me?', 'Let me invite you to {1}.', 'How about {1}? My treat.'],
      ['Deal. But do not be late this time!', 'I promise.', 'I will be there early.'],
    ], [
      ['اعتذر', 'sorry', 'apolog'],
      ['اعرض تعويضاً أو وعداً', 'invite', 'how about', 'promise', 'treat', 'will not'],
    ], [
      ['I was stuck in traffic', 'dinner'], ['I completely forgot', 'coffee'], ['I had an emergency at work', 'lunch'], ['my car broke down', 'a film'], ['I fell asleep', 'breakfast'], ['I had to take my son to the doctor', 'ice cream'],
    ]),
  ],
  'study': [
    _S('التسجيل في دورة', 'أنت في مركز لغات، والمدرب موظف الاستقبال', 'Registering for a course', [
      ['Hello. Welcome to the language centre. How can I help?', 'I want to join {0}.', 'I am interested in {0}.'],
      ['Great. What is your level?', 'I am a beginner.', 'I think I am intermediate.'],
      ['Classes are {1}. Is that okay?', 'Yes, that suits me.', 'Do you have evening classes?'],
      ['The course costs two hundred dollars. Would you like to register?', 'Yes, please.', 'Is there a discount for students?'],
      ['Please fill in this form.', 'Sure. Do you have a pen?', 'Thank you.'],
    ], [
      ['اذكر الدورة التي تريدها', 'join', 'interested', 'want'],
      ['اذكر مستواك', 'beginner', 'intermediate', 'advanced', 'level'],
    ], [
      ['an English course', 'on Mondays and Wednesdays'], ['a conversation class', 'every Saturday'], ['an IELTS course', 'three evenings a week'], ['a business English course', 'on Sunday mornings'], ['a writing workshop', 'twice a week'], ['a pronunciation class', 'on Tuesdays'],
    ]),
    _S('سؤال المعلم بعد الدرس', 'لم تفهم جزءاً من الدرس، والمدرب معلمك', 'Asking the teacher for help after class', [
      ['Yes? Do you have a question?', 'Yes. I did not understand {0}.', 'Could you explain {0} again?'],
      ['Of course. Which part is difficult?', 'The examples.', 'When to use it.'],
      ['Look at this sentence. Is it clearer now?', 'Yes, much clearer.', 'A little. Can you give another example?'],
      ['Good. Try to write three sentences at home.', 'I will. When should I bring them?', 'Okay, thank you.'],
      ['Bring them {1}. Well done for asking.', 'Thank you, teacher.', 'See you then.'],
    ], [
      ['اطلب الشرح بأدب', 'could you', 'can you', 'explain', 'understand'],
      ['اشكر المعلم', 'thank'],
    ], [
      ['the present perfect', 'tomorrow'], ['the passive voice', 'on Monday'], ['the conditionals', 'next lesson'], ['the articles', 'on Thursday'], ['reported speech', 'next week'], ['phrasal verbs', 'after the weekend'],
    ]),
    _S('في المكتبة', 'تبحث عن كتاب، والمدرب أمين المكتبة', 'Borrowing a book at the library', [
      ['Hello. Can I help you?', 'I am looking for a book about {0}.', 'Do you have books on {0}?'],
      ['Yes, on the second floor. Do you have a library card?', 'Yes, here it is.', 'No. How can I get one?'],
      ['You can borrow it for {1}.', 'Can I renew it?', 'That is enough, thanks.'],
      ['Yes, you can renew it online once.', 'Great.', 'How do I do that?'],
      ['Please be quiet in the reading room.', 'Of course.', 'Sure, thank you.'],
    ], [
      ['اسأل عن كتاب', 'book', 'looking for'],
      ['اسأل عن التجديد أو البطاقة', 'renew', 'card', 'how'],
    ], [
      ['history', 'two weeks'], ['computer science', 'three weeks'], ['cooking', 'ten days'], ['psychology', 'a month'], ['business', 'two weeks'], ['English grammar', 'one week'],
    ]),
    _S('مشروع جماعي', 'تخطط لمشروع مع زملائك، والمدرب أحد أعضاء الفريق', 'Planning a group project', [
      ['Okay team, we need to plan our project about {0}.', 'I can do the research.', 'I will prepare the slides.'],
      ['Good. Who will present?', 'I can present.', 'I prefer not to present.'],
      ['When can we meet again?', 'How about {1}?', 'I am free {1}.'],
      ['Fine. What do we need before then?', 'We need more information.', 'Each of us should finish one part.'],
      ['Great teamwork. Let us start.', 'Let us do it.', 'I will send my part soon.'],
    ], [
      ['اعرض مهمتك', 'i can', 'i will'],
      ['اقترح موعداً', 'how about', 'free', 'tuesday', 'tomorrow', 'thursday', 'saturday', 'tonight', 'after'],
    ], [
      ['climate change', 'on Tuesday'], ['social media', 'tomorrow evening'], ['healthy food', 'on Thursday'], ['renewable energy', 'after class'], ['tourism in our country', 'on Saturday'], ['online learning', 'tonight'],
    ]),
    _S('التحضير لامتحان مع زميل', 'تذاكر مع زميلك، والمدرب هو الزميل', 'Preparing for an exam with a classmate', [
      ['The {0} exam is next week. Are you ready?', 'Not really. I am worried.', 'I think so, but I need more practice.'],
      ['Which part is the hardest for you?', '{1^} is the hardest.', 'I find {1} difficult.'],
      ['Me too. How do you usually study?', 'I make short notes.', 'I solve old exam papers.'],
      ['Good idea. Shall we study together?', 'Yes, let us meet tomorrow.', 'Sure. Where shall we meet?'],
      ['The library at five. Bring your notes.', 'I will. See you there.', 'Okay, see you at five.'],
    ], [
      ['اذكر الجزء الأصعب', 'hardest', 'difficult', 'hard'],
      ['اتفق على موعد المذاكرة', 'tomorrow', 'meet', 'see you', 'where', 'library'],
    ], [
      ['English', 'grammar'], ['maths', 'geometry'], ['history', 'remembering dates'], ['science', 'chemistry'], ['computer', 'programming'], ['business', 'accounting'],
    ]),
  ],
};

/// مواقف إضافية: 5 جديدة لكل قسم، ولكل موقف 6 صيغ (240 محادثة جديدة).
const _bank2 = <String, List<_S>>{
  'travel': [
    _S('تغيير موعد الرحلة', 'تريد تغيير رحلتك، والمدرب موظف شركة الطيران', 'Changing a flight booking', [
      ['Good afternoon. How can I help you?', 'I would like to change my flight.', 'I need to travel on a different day.'],
      ['Of course. What is your booking number?', 'It is {1}.', 'Let me check. It is {1}.'],
      ['Which day would you like to travel instead?', 'I would like to travel on {0}.', 'Is there a flight on {0}?'],
      ['There is a seat available. The change fee is {2}. Is that okay?', 'Yes, that is fine.', 'Is there a cheaper option?'],
      ['All done. You will receive a new ticket by email.', 'Thank you very much.', 'Could you send it to my phone too?'],
    ], [
      ['اطلب تغيير الرحلة', 'change', 'different day', 'instead'],
      ['اذكر اليوم الجديد أو اسأل عن الرسوم', 'on ', 'fee', 'cheaper', 'how much'],
    ], [
      ['Friday', 'AB4521', 'twenty euros'], ['Monday', 'KL9033', 'thirty dollars'], ['Sunday', 'TR1170', 'fifty riyals'], ['Thursday', 'MS2208', 'twenty-five pounds'], ['Tuesday', 'QA7745', 'forty dirhams'], ['Saturday', 'EY3316', 'ten euros'],
    ]),
    _S('السؤال عن الطريق', 'أنت تائه في مدينة جديدة، والمدرب أحد المارة', 'Asking a stranger for directions', [
      ['Hello. You look lost. Can I help you?', 'Yes, please. Where is {0}?', 'Excuse me, how do I get to {0}?'],
      ['It is not far. Go straight and turn {1} at the traffic lights.', 'Straight, then {1}. Okay.', 'Could you say that again, please?'],
      ['Then walk for about {2} minutes.', 'Is it far from here?', 'Can I walk there?'],
      ['You will see it on your right, next to a big bank.', 'Thank you. Is there a bus?', 'Great. Is it open now?'],
      ['No problem. Have a nice day!', 'Thank you so much. Goodbye.', 'You were very kind. Bye.'],
    ], [
      ['اسأل عن مكان', 'where', 'how do i get', 'how can i get'],
      ['اطلب إعادة الشرح أو اشكر', 'again', 'thank', 'repeat'],
    ], [
      ['the museum', 'left', 'ten'], ['the train station', 'right', 'five'], ['the post office', 'left', 'fifteen'], ['the hospital', 'right', 'twenty'], ['the main market', 'left', 'seven'], ['the city library', 'right', 'twelve'],
    ]),
    _S('ركوب سيارة أجرة', 'أنت في سيارة أجرة، والمدرب السائق', 'Taking a taxi to a destination', [
      ['Good evening. Where to?', 'To {0}, please.', 'Can you take me to {0}?'],
      ['No problem. Do you know the way, or shall I use the map?', 'Please use the map.', 'Yes, go straight on this road.'],
      ['The traffic is heavy today. It will take about {1} minutes.', 'That is fine.', 'Is there a faster road?'],
      ['Here we are. The fare is {2}.', 'Here you are. Keep the change.', 'Can I pay by card?'],
      ['Thank you. Do not forget your bag.', 'Thanks. Goodbye.', 'I have everything. Have a good night.'],
    ], [
      ['اذكر وجهتك', 'to ', 'take me', 'please'],
      ['ادفع أو اسأل عن الطريق', 'pay', 'card', 'change', 'faster', 'here you are'],
    ], [
      ['the airport', 'forty', 'sixty riyals'], ['the central station', 'twenty', 'thirty dirhams'], ['City Hotel', 'fifteen', 'twenty euros'], ['the football stadium', 'thirty', 'forty dollars'], ['the university', 'twenty-five', 'thirty-five pounds'], ['the beach', 'thirty-five', 'fifty riyals'],
    ]),
    _S('جولة سياحية', 'تريد تذكرة جولة، والمدرب موظف المكتب السياحي', 'Booking a city tour at a tourist office', [
      ['Welcome to the tourist office. What can I do for you?', 'I would like to book a tour.', 'Do you have any tours today?'],
      ['We have a {0} tour. It lasts {1} hours. Are you interested?', 'Yes, how much is it?', 'What does it include?'],
      ['It costs {2} per person. Lunch is included.', 'That sounds good.', 'Is there a student discount?'],
      ['How many people are in your group?', 'There are three of us.', 'Just me, please.'],
      ['Perfect. The bus leaves at nine from the main square.', 'Thank you. I will be there.', 'Where exactly is the main square?'],
    ], [
      ['اسأل عن الجولة', 'tour', 'book', 'include', 'how much'],
      ['اذكر عدد الأشخاص', 'three', 'two', 'four', 'me', 'group', 'of us'],
    ], [
      ['city', 'three', 'twenty euros'], ['old town', 'two', 'fifteen dollars'], ['boat', 'four', 'thirty euros'], ['desert', 'five', 'sixty dollars'], ['museum', 'three', 'twelve pounds'], ['mountain', 'six', 'forty euros'],
    ]),
    _S('تسجيل الخروج من الفندق', 'أنت تغادر الفندق، والمدرب موظف الاستقبال', 'Checking out of a hotel', [
      ['Good morning. Are you checking out today?', 'Yes, I am checking out.', 'Yes. Room {0}, please.'],
      ['I hope you enjoyed your stay. Did you use the minibar?', 'No, I did not.', 'Yes, I had {1}.'],
      ['Thank you. Your total is {2}. How would you like to pay?', 'By card, please.', 'I will pay cash.'],
      ['Here is your receipt. Do you need a taxi?', 'Yes, please. To the airport.', 'No, thank you.'],
      ['Of course. It will be here in ten minutes. Safe travels!', 'Thank you for everything.', 'It was a lovely stay. Goodbye.'],
    ], [
      ['أبلغ بالمغادرة', 'check', 'checking out', 'leaving'],
      ['اختر طريقة الدفع', 'card', 'cash', 'pay'],
    ], [
      ['305', 'a bottle of water', 'two hundred dollars'], ['112', 'two sodas', 'three hundred riyals'], ['418', 'a juice', 'one hundred and fifty euros'], ['207', 'some chocolate', 'four hundred dirhams'], ['509', 'a bottle of water', 'one hundred and eighty pounds'], ['123', 'a coffee', 'two hundred and fifty euros'],
    ]),
  ],
  'food': [
    _S('طلب وجبة سريعة', 'أنت في مطعم وجبات سريعة، والمدرب الكاشير', 'Ordering at a fast-food restaurant', [
      ['Hi! Welcome. What would you like?', 'I would like {0}, please.', 'Can I have {0}?'],
      ['Would you like fries with that?', 'Yes, please.', 'No, thank you.'],
      ['What would you like to drink?', 'A {1}, please.', 'Just water, please.'],
      ['Is that for here or to take away?', 'To take away.', 'For here.'],
      ['That will be {2}. Please wait for your number.', 'Here you are. Thanks.', 'How long will it take?'],
    ], [
      ['اطلب وجبة', 'like', 'have', 'please'],
      ['حدد هل الطلب هنا أو للخارج', 'take away', 'for here', 'eat here'],
    ], [
      ['a chicken burger', 'cola', 'seven dollars'], ['a cheeseburger', 'orange juice', 'six euros'], ['two beef burgers', 'lemonade', 'twelve dollars'], ['a fish sandwich', 'cola', 'eight euros'], ['a chicken wrap', 'iced tea', 'five pounds'], ['a veggie burger', 'water', 'six dollars'],
    ]),
    _S('حجز حفل عيد ميلاد', 'تحجز حفلة في مطعم، والمدرب مديرة المطعم', 'Booking a birthday party at a restaurant', [
      ['Hello, thank you for calling. How can I help?', 'I would like to book a birthday party.', 'Do you have a table for a party?'],
      ['Certainly. How many guests will there be?', 'There will be {0} guests.', 'About {0} people.'],
      ['And what day and time would you like?', 'On {1} at seven.', 'Is {1} evening available?'],
      ['That is available. Would you like a cake?', 'Yes, a chocolate cake, please.', 'No, we will bring our own.'],
      ['Wonderful. May I have your name and phone number?', 'My name is Sam. My number is five five five.', 'Of course. It is in your system.'],
    ], [
      ['اذكر عدد الضيوف', 'guests', 'people', 'there will be', 'of us'],
      ['اذكر اليوم', 'on ', 'friday', 'saturday', 'sunday', 'evening'],
    ], [
      ['eight', 'Friday'], ['twelve', 'Saturday'], ['ten', 'Thursday'], ['fifteen', 'Sunday'], ['six', 'Friday'], ['twenty', 'Saturday'],
    ]),
    _S('الشراء من المخبز', 'أنت في مخبز، والمدرب البائع', 'Buying bread and cakes at a bakery', [
      ['Good morning! What can I get you?', 'I would like {0}, please.', 'Can I have {0}?'],
      ['Sure. They are still warm. Anything else?', 'Yes, I would also like {1}.', 'That is all, thanks.'],
      ['Would you like them in a bag or a box?', 'In a box, please.', 'A bag is fine.'],
      ['That comes to {2}.', 'Here you are.', 'Do you take cards?'],
      ['Thank you. Have a lovely day!', 'You too. Goodbye.', 'Thanks. The bread smells great.'],
    ], [
      ['اطلب شيئاً من المخبز', 'would like', 'have', 'please'],
      ['اختر الكيس أو العلبة أو ادفع', 'box', 'bag', 'here you are', 'card'],
    ], [
      ['two loaves of bread', 'a chocolate cake', 'nine dollars'], ['six croissants', 'a small cheesecake', 'eleven euros'], ['a large pizza', 'two cheese rolls', 'ten dollars'], ['four cupcakes', 'some biscuits', 'eight pounds'], ['a fruit tart', 'a loaf of brown bread', 'twelve euros'], ['ten date cookies', 'a cinnamon roll', 'seven dollars'],
    ]),
    _S('تقسيم الفاتورة', 'أنت تأكل مع أصدقائك، والمدرب النادل', 'Splitting the bill with friends', [
      ['Was everything good tonight?', 'Yes, it was delicious.', 'Yes, thank you. The {0} was great.'],
      ['I am glad. Would you like the bill?', 'Yes, please.', 'Could we have the bill, please?'],
      ['Here you are. The total is {1}.', 'Can we split it?', 'Let us pay separately.'],
      ['Of course. How many people?', 'Four of us.', 'There are three of us.'],
      ['Thank you. Is service included?', 'Yes, I think so.', 'Not sure. Let me check.'],
    ], [
      ['اطلب الفاتورة', 'bill', 'check'],
      ['اطلب تقسيم الدفع', 'split', 'separately', 'each'],
    ], [
      ['grilled chicken', 'ninety dollars'], ['seafood pasta', 'one hundred and twenty euros'], ['mixed grill', 'eighty-five dollars'], ['vegetable curry', 'seventy pounds'], ['steak', 'one hundred and ten dollars'], ['pizza', 'sixty euros'],
    ]),
    _S('طلب وصفة من صديق', 'تسأل صديقك عن وصفة، والمدرب صديقك', 'Asking a friend for a recipe', [
      ['I made {0} yesterday. Everyone loved it.', 'It sounds great. Can I have the recipe?', 'Wow! How did you make it?'],
      ['Sure. First you need some {1}.', 'How much do I need?', 'Where can I buy it?'],
      ['About two cups. Then you cook it for {2} minutes.', 'Is that all?', 'Do I need anything else?'],
      ['Yes, a little salt and some lemon juice.', 'That is easy.', 'I will write it down.'],
      ['Tell me how it turns out!', 'I will. Thanks a lot.', 'I will cook it this weekend.'],
    ], [
      ['اطلب الوصفة', 'recipe', 'how did you make', 'how'],
      ['اسأل عن الكمية أو المكونات', 'how much', 'need', 'where', 'anything'],
    ], [
      ['a chicken soup', 'chicken and carrots', 'thirty'], ['a vegetable rice dish', 'rice and vegetables', 'twenty'], ['lentil soup', 'red lentils', 'forty'], ['a tomato pasta', 'tomatoes', 'fifteen'], ['a fish stew', 'white fish', 'twenty-five'], ['baked potatoes', 'potatoes', 'forty-five'],
    ]),
  ],
  'shopping': [
    _S('شراء هدية', 'تبحث عن هدية، والمدرب بائع المتجر', 'Choosing a gift in a gift shop', [
      ['Hello. Are you looking for something special?', 'Yes, I need a gift for {0}.', 'I am looking for a present for {0}.'],
      ['What does {0} like?', 'They like {1}.', 'I am not sure. Maybe {1}.'],
      ['How about this one? It costs {2}.', 'It is nice. Do you have a cheaper one?', 'I love it. I will take it.'],
      ['Would you like me to gift-wrap it?', 'Yes, please.', 'No, thank you.'],
      ['Here you are. I hope they like it!', 'Thank you for your help.', 'I am sure they will.'],
    ], [
      ['اذكر لمن الهدية', 'gift', 'present', 'for my', 'for a'],
      ['وافق أو اسأل عن بديل أرخص', 'cheaper', 'take it', 'love it', 'another'],
    ], [
      ['my mother', 'flowers', 'thirty dollars'], ['my friend', 'books', 'twenty euros'], ['my boss', 'coffee', 'forty dollars'], ['my brother', 'football', 'fifty euros'], ['my teacher', 'pens', 'fifteen pounds'], ['my sister', 'jewellery', 'sixty dollars'],
    ]),
    _S('شراء حذاء', 'تجرب حذاءً، والمدرب البائع', 'Trying on shoes in a shoe shop', [
      ['Can I help you find something?', 'I am looking for {0}.', 'Yes, I need some {0}.'],
      ['What size are you?', 'I am size {1}.', 'I am not sure. Can you measure?'],
      ['Here you are. How do they feel?', 'They are a bit tight.', 'They are very comfortable.'],
      ['Would you like a bigger size?', 'Yes, size {2}, please.', 'No, these are perfect.'],
      ['Good. They are on sale today.', 'Great. I will take them.', 'How much are they?'],
    ], [
      ['اذكر مقاسك', 'size', 'forty', 'measure'],
      ['صف الراحة', 'tight', 'comfortable', 'big', 'small', 'feel'],
    ], [
      ['running shoes', 'forty-two', 'forty-three'], ['black leather shoes', 'forty-one', 'forty-two'], ['white trainers', 'thirty-nine', 'forty'], ['sandals', 'forty-three', 'forty-four'], ['boots', 'forty', 'forty-one'], ['sports shoes', 'forty-four', 'forty-five'],
    ]),
    _S('مقارنة حواسيب محمولة', 'تريد شراء لابتوب، والمدرب مستشار المبيعات', 'Comparing laptops in an electronics store', [
      ['Hello. What kind of laptop are you looking for?', 'I need a laptop for {0}.', 'Something good for {0}.'],
      ['What is your budget?', 'About {1}.', 'Not more than {1}.'],
      ['This one has a fast processor and a long battery life.', 'How long is the battery?', 'What about the screen size?'],
      ['The battery lasts ten hours. It also has a two-year warranty.', 'That is good. And this other model?', 'Is it heavy?'],
      ['That one is cheaper but slower. I recommend the first one.', 'I will take the first one.', 'Let me think about it.'],
    ], [
      ['اذكر ميزانيتك أو حاجتك', 'budget', 'for ', 'about', 'not more'],
      ['اسأل عن الميزات', 'battery', 'screen', 'warranty', 'heavy', 'processor'],
    ], [
      ['study', 'five hundred dollars'], ['work', 'eight hundred euros'], ['video editing', 'one thousand dollars'], ['gaming', 'one thousand two hundred dollars'], ['travel', 'seven hundred pounds'], ['school', 'four hundred euros'],
    ]),
    _S('استبدال مقاس', 'اشتريت ثوباً بمقاس خطأ، والمدرب موظف المتجر', 'Exchanging clothes for a different size', [
      ['Hello. How can I help you?', 'I bought this {0} yesterday, but it is too {1}.', 'I would like to exchange this {0}.'],
      ['Do you have your receipt?', 'Yes, here it is.', 'Sorry, I lost it.'],
      ['No problem. What size would you like instead?', 'A {2}, please.', 'One size bigger, please.'],
      ['Let me check the stock. Yes, we have one.', 'Perfect. Thank you.', 'Can I try it on first?'],
      ['Of course. The fitting room is on your left.', 'Thank you very much.', 'Great. I will be quick.'],
    ], [
      ['اشرح المشكلة', 'too', 'exchange', 'bought', 'size'],
      ['اطلب المقاس', 'size', 'bigger', 'smaller', 'medium', 'large'],
    ], [
      ['shirt', 'small', 'medium'], ['jacket', 'tight', 'large'], ['dress', 'big', 'small'], ['jeans', 'long', 'shorter one'], ['sweater', 'small', 'large'], ['coat', 'tight', 'bigger size'],
    ]),
    _S('مشكلة في طلب إلكتروني', 'طلبك لم يصل، والمدرب موظف خدمة العملاء', 'Calling about an online order that did not arrive', [
      ['Customer service. How can I help you?', 'My order has not arrived.', 'I ordered {0} {1} days ago, and it is late.'],
      ['I am sorry about that. Could you give me your order number?', 'It is {2}.', 'Yes, one moment. It is {2}.'],
      ['Thank you. I can see it is delayed at the post office.', 'When will it arrive?', 'Can I get a refund?'],
      ['It should arrive in two days. I can also give you a discount.', 'That is fair.', 'I prefer a refund.'],
      ['Done. Is there anything else I can help you with?', 'No, thank you.', 'No, that is all. Thanks.'],
    ], [
      ['اشرح المشكلة', 'not arrived', 'late', 'ordered', 'delayed'],
      ['اطلب حلاً', 'refund', 'when', 'discount', 'arrive'],
    ], [
      ['a phone case', 'five', 'A1234'], ['a jacket', 'ten', 'B5678'], ['two books', 'seven', 'C9012'], ['a pair of shoes', 'eight', 'D3456'], ['a watch', 'six', 'E7890'], ['a backpack', 'nine', 'F2468'],
    ]),
  ],
  'work': [
    _S('طلب إجازة', 'تطلب إجازة من مديرك، والمدرب هو المدير', 'Asking your manager for time off', [
      ['Hi. Do you have a minute?', 'Yes, of course.', 'Sure. What is it?'],
      ['I wanted to ask about taking some days off.', 'I would like to ask for {0} days off.', 'I need a holiday next month.'],
      ['When would you like to go?', 'From {1}.', 'I am thinking of {1}.'],
      ['That is a busy period. Can you finish your report first?', 'Yes, I will finish it before.', 'I can work extra hours this week.'],
      ['All right. Please send me an email.', 'I will send it today.', 'Thank you very much.'],
    ], [
      ['اطلب الإجازة', 'days off', 'holiday', 'leave', 'vacation'],
      ['حدد الموعد', 'from', 'next', 'month', 'week'],
    ], [
      ['three', 'the tenth'], ['five', 'the first of March'], ['two', 'next Monday'], ['four', 'the twentieth'], ['seven', 'the fifth of June'], ['ten', 'the first of August'],
    ]),
    _S('تقديم تحديث للفريق', 'في اجتماع الفريق، والمدرب مدير المشروع', 'Giving a progress update in a team meeting', [
      ['Good morning, everyone. Let us start. {0}, how is your part?', 'Good morning. I finished {1}.', 'I am working on {1} now.'],
      ['Great. Do you have any problems?', 'Not really, everything is fine.', 'Yes, I need more time.'],
      ['How much more time do you need?', 'About {2} days.', 'Until the end of the week.'],
      ['Is there anything the team can do to help?', 'Yes, I need some information.', 'No, thank you. I can manage.'],
      ['Okay, thank you. Let us meet again on Monday.', 'Sounds good.', 'See you on Monday.'],
    ], [
      ['اذكر ما أنجزته', 'finished', 'working on', 'done', 'completed'],
      ['اطلب مساعدة أو وقتاً', 'time', 'help', 'need', 'days'],
    ], [
      ['Sara', 'the report', 'two'], ['Omar', 'the design', 'three'], ['Layla', 'the budget', 'four'], ['Ali', 'the website', 'five'], ['Nour', 'the survey', 'two'], ['Adam', 'the slides', 'three'],
    ]),
    _S('مقابلة هاتفية أولية', 'تتلقى مكالمة من شركة، والمدرب مسؤولة التوظيف', 'A first phone screening for a job', [
      ['Hello, this is Anna from {0}. Is this a good time to talk?', 'Yes, it is a good time.', 'Hello. Yes, please go ahead.'],
      ['Thank you for applying. Can you tell me a little about yourself?', 'I am a {1} with three years of experience.', 'I work as a {1} at the moment.'],
      ['Why do you want to work with us?', 'I like your products.', 'I want to learn and grow.'],
      ['When could you start if we offer you the job?', 'In {2}.', 'I can start in {2}.'],
      ['Great. We will invite you for an interview. Thank you!', 'Thank you very much.', 'I look forward to it.'],
    ], [
      ['عرّف بنفسك', 'experience', 'work', 'i am', 'years'],
      ['اذكر موعد البدء', 'start', 'weeks', 'month', 'immediately'],
    ], [
      ['City Bank', 'accountant', 'two weeks'], ['Nova Tech', 'developer', 'one month'], ['Green Foods', 'sales assistant', 'three weeks'], ['Sky Hotels', 'receptionist', 'two weeks'], ['Alpha Media', 'designer', 'one month'], ['Metro Hospital', 'nurse', 'a month'],
    ]),
    _S('تحديد موعد مع عميل', 'تتصل بعميل، والمدرب العميل', 'Arranging a meeting with a client by phone', [
      ['Hello, {0} speaking.', 'Hello, this is Sam from {1}.', 'Good morning. I am calling about our proposal.'],
      ['Oh yes, nice to hear from you. How can I help?', 'I would like to arrange a meeting.', 'Could we meet this week?'],
      ['Let me check my calendar. What about {2}?', 'That works for me.', 'Sorry, I am busy then. Is there another time?'],
      ['How about the same day at four?', 'Perfect. Four it is.', 'Four is a bit late. Can we do three?'],
      ['Okay. Please send me a reminder by email.', 'I will do that right away.', 'Certainly. See you then.'],
    ], [
      ['اطلب اجتماعاً', 'meeting', 'meet', 'arrange'],
      ['قبل الموعد أو اقترح بديلاً', 'works', 'perfect', 'another', 'can we'],
    ], [
      ['Mr Khan', 'Alpha Group', 'Tuesday at ten'], ['Ms Brown', 'Delta Systems', 'Wednesday at two'], ['Mr Ali', 'Blue Sea', 'Thursday at eleven'], ['Mrs Taylor', 'Sun Energy', 'Monday at nine'], ['Mr Hassan', 'City Design', 'Friday at one'], ['Ms Garcia', 'Nova Foods', 'Tuesday at three'],
    ]),
    _S('طلب علاوة', 'تتحدث مع مديرك عن راتبك، والمدرب هو المدير', 'Asking for a pay rise', [
      ['Come in. What would you like to discuss?', 'Thank you for meeting me.', 'I would like to talk about my salary.'],
      ['Of course. What did you have in mind?', 'I have worked here for {0} and I have done {1}.', 'I think my work deserves a raise.'],
      ['I agree you are doing well. How much are you asking for?', 'About {2} percent.', 'I would like a fair increase.'],
      ['That is a lot. Let me talk to finance first.', 'Thank you. When can I hear back?', 'I understand.'],
      ['I will tell you by the end of next week.', 'That is fine. Thank you.', 'I appreciate your time.'],
    ], [
      ['اطلب العلاوة بأدب', 'salary', 'raise', 'increase', 'fair'],
      ['اسأل عن موعد الرد', 'when', 'hear back', 'thank'],
    ], [
      ['two years', 'many successful projects', 'ten'], ['three years', 'extra work last quarter', 'fifteen'], ['one year', 'good results every month', 'ten'], ['four years', 'training for new staff', 'twelve'], ['five years', 'a big sales contract', 'fifteen'], ['two years', 'a better customer system', 'eight'],
    ]),
  ],
  'health': [
    _S('حجز موعد طبيب بالهاتف', 'تحجز موعداً بالهاتف، والمدرب موظف العيادة', 'Booking a doctor appointment by phone', [
      ['City Clinic, good morning. How can I help?', 'I would like to make an appointment.', 'I need to see a doctor.'],
      ['What is the problem?', 'I have {0}.', 'I have had {0} for {1} days.'],
      ['I can offer you {2}. Is that suitable?', 'Yes, that is fine.', 'Do you have anything earlier?'],
      ['May I have your name and date of birth?', 'My name is Sam, and I was born in nineteen ninety.', 'Of course. It is Sam Ali.'],
      ['Thank you. Please arrive ten minutes early.', 'I will. Thank you.', 'See you then. Goodbye.'],
    ], [
      ['اشرح مشكلتك', 'have', 'pain', 'headache', 'fever', 'cough'],
      ['اقبل الموعد أو اطلب أبكر', 'fine', 'earlier', 'suitable', 'thank'],
    ], [
      ['a bad headache', 'three', 'tomorrow at ten'], ['a high temperature', 'two', 'today at four'], ['a sore throat', 'four', 'Monday at nine'], ['back pain', 'five', 'Tuesday at eleven'], ['a strong cough', 'six', 'Wednesday at two'], ['stomach pain', 'two', 'tomorrow at noon'],
    ]),
    _S('زيارة الطوارئ', 'أنت في قسم الطوارئ، والمدرب الممرض', 'Describing an injury at the emergency room', [
      ['Emergency room. What happened?', 'I {0}.', 'I had an accident. I {0}.'],
      ['Where does it hurt?', 'It hurts in my {1}.', 'My {1} hurts a lot.'],
      ['How bad is the pain from one to ten?', 'About {2}.', 'It is very bad.'],
      ['Do you have any allergies to medicine?', 'No, I do not.', 'Yes, I am allergic to penicillin.'],
      ['The doctor will see you soon. Please sit down.', 'Thank you. How long will I wait?', 'Okay. Thank you.'],
    ], [
      ['اشرح ما حدث', 'fell', 'cut', 'hurt', 'accident', 'burned'],
      ['حدد مكان الألم', 'hurts', 'pain', 'my '],
    ], [
      ['fell off my bike', 'right arm', 'seven'], ['cut my finger', 'left hand', 'five'], ['twisted my ankle', 'foot', 'eight'], ['hit my head', 'head', 'six'], ['burned my hand', 'hand', 'seven'], ['fell down the stairs', 'back', 'nine'],
    ]),
    _S('إصابة رياضية', 'أنت عند أخصائي العلاج الطبيعي، والمدرب هو الأخصائي', 'Seeing a physiotherapist about a sports injury', [
      ['Hello. Tell me what happened.', 'I hurt my {0} while playing {1}.', 'I have pain in my {0} since last week.'],
      ['Does it hurt when you move it?', 'Yes, a lot.', 'Only a little.'],
      ['I will check it. Please try to lift your arm slowly.', 'Like this?', 'Ouch! That hurts.'],
      ['It is not serious, but you need rest and exercises. No sports for {2}.', 'Okay. What exercises?', 'Can I walk in the meantime?'],
      ['I will show you some simple ones. Come back in a week.', 'Thank you very much.', 'I will come next week.'],
    ], [
      ['اشرح الإصابة', 'hurt', 'pain', 'injury', 'playing'],
      ['اسأل عن التمارين', 'exercise', 'rest', 'how long', 'when'],
    ], [
      ['knee', 'football', 'two weeks'], ['shoulder', 'tennis', 'three weeks'], ['ankle', 'basketball', 'ten days'], ['back', 'gym training', 'two weeks'], ['wrist', 'volleyball', 'a month'], ['leg', 'running', 'three weeks'],
    ]),
    _S('مشكلة في النوم', 'تستشير الطبيب في نومك، والمدرب هو الطبيب', 'Talking to a doctor about sleep problems', [
      ['What seems to be the problem?', 'I cannot sleep well.', 'I wake up many times at night.'],
      ['How long has this been happening?', 'For about {0}.', 'Since {0}.'],
      ['Do you drink coffee or use your phone before bed?', 'Yes, I drink {1}.', 'Yes, I use my phone for an hour.'],
      ['That can affect your sleep. Try to stop {2} before bed.', 'I will try.', 'What else can I do?'],
      ['Go to bed at the same time every night, and come back in two weeks.', 'Thank you, doctor.', 'I will follow your advice.'],
    ], [
      ['اشرح مشكلة النوم', 'sleep', 'wake up', 'night', 'tired'],
      ['اسأل عن النصائح', 'what else', 'advice', 'try', 'can i'],
    ], [
      ['two weeks', 'three coffees a day', 'caffeine'], ['a month', 'tea in the evening', 'drinking tea'], ['three weeks', 'energy drinks', 'energy drinks'], ['two months', 'coffee late at night', 'coffee'], ['ten days', 'a lot of cola', 'cola'], ['a few weeks', 'coffee after dinner', 'drinking coffee'],
    ]),
    _S('طلب نصيحة من الصيدلي', 'تشعر بزكام، والمدرب الصيدلي', 'Asking a pharmacist for advice about a cold', [
      ['Good afternoon. How can I help you?', 'I think I have a cold.', 'I have {0} and I feel tired.'],
      ['How long have you felt like this?', 'For {1} days.', 'Since yesterday.'],
      ['Do you have a fever?', 'No, I do not.', 'Yes, a little.'],
      ['I recommend these tablets. Take one {2}.', 'How many days?', 'Are there any side effects?'],
      ['For five days. Drink lots of water and rest.', 'Thank you. How much is it?', 'I will. Thanks for your advice.'],
    ], [
      ['اشرح الأعراض', 'cold', 'cough', 'sore throat', 'runny nose', 'feel'],
      ['اسأل عن الدواء', 'how many', 'side effect', 'how much', 'take'],
    ], [
      ['a sore throat', 'two', 'three times a day'], ['a runny nose', 'three', 'twice a day'], ['a cough', 'four', 'three times a day'], ['a headache', 'one', 'every eight hours'], ['a blocked nose', 'two', 'twice a day'], ['a high temperature', 'three', 'every six hours'],
    ]),
  ],
  'services': [
    _S('تغيير شريحة الجوال', 'أنت في متجر الاتصالات، والمدرب الموظف', 'Getting a new SIM card or phone plan', [
      ['Welcome to the mobile shop. How can I help?', 'I would like a new SIM card.', 'I need a better phone plan.'],
      ['Do you want a monthly plan or pay-as-you-go?', 'A monthly plan, please.', 'Pay-as-you-go is better for me.'],
      ['We have a plan with {0} of data for {1} a month.', 'That sounds good.', 'Do you have anything cheaper?'],
      ['May I see your ID, please?', 'Here you are.', 'I forgot it. Is a copy okay?'],
      ['Thank you. Your SIM will be active in {2}.', 'Great. Thank you.', 'How do I check my balance?'],
    ], [
      ['اطلب الباقة', 'plan', 'sim', 'data'],
      ['اسأل عن السعر أو الرصيد', 'cheaper', 'balance', 'how much', 'price'],
    ], [
      ['ten gigabytes', 'twenty dollars', 'ten minutes'], ['twenty gigabytes', 'thirty euros', 'five minutes'], ['five gigabytes', 'twelve dollars', 'an hour'], ['unlimited data', 'forty dollars', 'ten minutes'], ['fifteen gigabytes', 'twenty-five euros', 'half an hour'], ['thirty gigabytes', 'thirty-five dollars', 'ten minutes'],
    ]),
    _S('تصليح السيارة', 'سيارتك فيها عطل، والمدرب الميكانيكي', 'Explaining a car problem to a mechanic', [
      ['Hello. What is wrong with your car?', 'It makes a strange noise.', '{0}.'],
      ['When does it happen?', 'When I {1}.', 'Mostly in the morning.'],
      ['Let me check it. It will take about an hour.', 'How much will it cost?', 'Can I wait here?'],
      ['It needs a new part. The repair costs {2}.', 'That is okay.', 'That is expensive. Is there another option?'],
      ['It will be ready tomorrow afternoon.', 'Thank you. I will pick it up then.', 'Can you call me when it is ready?'],
    ], [
      ['اشرح العطل', 'noise', 'problem', 'does not', 'will not', 'broken'],
      ['اسأل عن التكلفة', 'cost', 'how much', 'expensive', 'price'],
    ], [
      ['The engine will not start', 'turn the key', 'two hundred dollars'], ['The brakes feel weak', 'brake', 'one hundred and fifty euros'], ['There is a strange smell', 'drive fast', 'eighty dollars'], ['The light on the dashboard is on', 'start the car', 'sixty pounds'], ['One tyre is flat', 'drive on the road', 'forty euros'], ['The air conditioner does not work', 'turn it on', 'ninety dollars'],
    ]),
    _S('عند الحلاق', 'تقص شعرك، والمدرب الحلاق', 'Getting a haircut', [
      ['Hello. Please take a seat. What would you like today?', 'Just a haircut, please.', 'A haircut and {0}, please.'],
      ['How short would you like it?', 'Short on the sides and {1} on top.', 'Just a little off, please.'],
      ['Okay. Is this length good?', 'A bit shorter, please.', 'Yes, that is perfect.'],
      ['All done. How do you like it?', 'It looks great.', 'Could you fix this part?'],
      ['That will be {2}.', 'Here you are. Keep the change.', 'Can I pay by card?'],
    ], [
      ['اطلب القصة', 'haircut', 'short', 'trim', 'beard'],
      ['اعلّق على النتيجة أو ادفع', 'great', 'perfect', 'here you are', 'card', 'looks'],
    ], [
      ['a beard trim', 'long', 'twenty dollars'], ['a shave', 'medium', 'twenty-five euros'], ['a beard trim', 'a little longer', 'fifteen dollars'], ['a hair wash', 'long', 'eighteen pounds'], ['a shave', 'short', 'twenty dollars'], ['a beard trim', 'medium', 'thirty euros'],
    ]),
    _S('المغسلة', 'تترك ملابس للغسيل، والمدرب موظف المغسلة', 'Leaving clothes at the laundry', [
      ['Hello. What can we do for you?', 'I would like to wash these clothes.', 'I need {0} dry cleaned.'],
      ['Let me count. You have {1} items. Any stains?', 'Yes, there is a stain on this one.', 'No, I think they are clean.'],
      ['We can remove it. When do you need them?', 'By {2}, please.', 'As soon as possible.'],
      ['That is possible. It costs fifteen dollars.', 'That is fine.', 'Is there an express service?'],
      ['Here is your ticket. Please bring it when you collect.', 'Thank you. See you later.', 'I will. Thanks.'],
    ], [
      ['اطلب خدمة الغسيل', 'wash', 'clean', 'dry clean'],
      ['حدد الموعد', 'by', 'when', 'tomorrow', 'friday', 'soon'],
    ], [
      ['two suits', 'five', 'Friday'], ['a jacket', 'three', 'tomorrow'], ['three shirts', 'six', 'Thursday'], ['a coat', 'four', 'Monday'], ['a dress', 'two', 'Saturday'], ['two sweaters', 'five', 'Wednesday'],
    ]),
    _S('بلاغ عطل في المنزل', 'عندك مشكلة في الأنابيب، والمدرب السباك', 'Calling a plumber about a leak', [
      ['Hello, quick repairs. How can I help?', 'I have a problem in my {0}.', 'There is a leak in my {0}.'],
      ['Is the water still running?', 'Yes, it is.', 'I turned it off.'],
      ['I understand. I can come {1}. What is your address?', 'It is twelve Palm Street.', 'Can you come sooner?'],
      ['I will be there within an hour. The visit costs {2}.', 'That is okay.', 'Please come as quickly as you can.'],
      ['Meanwhile, put a bucket under the leak.', 'Thank you. I will do that.', 'Good idea. See you soon.'],
    ], [
      ['اشرح المشكلة', 'leak', 'problem', 'water', 'broken'],
      ['أعطِ العنوان أو اطلب السرعة', 'street', 'address', 'sooner', 'quickly', 'soon'],
    ], [
      ['kitchen', 'this afternoon', 'fifty dollars'], ['bathroom', 'in an hour', 'sixty euros'], ['kitchen sink', 'tomorrow morning', 'forty dollars'], ['shower', 'this evening', 'seventy dollars'], ['basement', 'in two hours', 'eighty euros'], ['toilet', 'right now', 'fifty-five dollars'],
    ]),
  ],
  'social': [
    _S('التعارف في حفلة', 'أنت في حفلة، والمدرب شخص جديد', 'Meeting someone new at a party', [
      ['Hi! I do not think we have met. I am Alex.', 'Nice to meet you, Alex. I am Sam.', 'Hello. My name is Sam.'],
      ['How do you know the host?', 'We work together.', 'We studied at the same {0}.'],
      ['Oh, nice. What do you do?', 'I am a {1}.', 'I work as a {1}.'],
      ['That sounds interesting. Do you like it?', 'Yes, I really enjoy it.', 'Most of the time.'],
      ['Great to meet you. Maybe we can keep in touch.', 'Sure. Here is my number.', 'I would like that.'],
    ], [
      ['عرّف بنفسك', 'my name', 'i am', 'nice to meet'],
      ['اذكر عملك', 'work', 'job', 'i am a', 'i work'],
    ], [
      ['school', 'teacher'], ['university', 'engineer'], ['college', 'designer'], ['school', 'doctor'], ['university', 'programmer'], ['college', 'accountant'],
    ]),
    _S('دعوة لحفل زفاف', 'صديق يدعوك لزفافه، والمدرب هو الصديق', 'Being invited to a friend wedding', [
      ['I have some great news. I am getting married!', 'Congratulations! That is wonderful.', 'Wow! When is the wedding?'],
      ['It is on {0}. I would love you to come.', 'Of course. I will be there.', 'I would love to. Where is it?'],
      ['It is at {1}. It starts at seven.', 'That sounds beautiful.', 'Is there a dress code?'],
      ['Wear something smart. And please bring your {2}.', 'Sure, I will.', 'I would be happy to.'],
      ['Thank you. It means a lot to me.', 'I am very happy for you.', 'See you at the wedding!'],
    ], [
      ['هنّئ صديقك', 'congratulations', 'happy for you', 'wonderful'],
      ['اقبل الدعوة', 'will be there', 'would love', 'of course', 'come'],
    ], [
      ['the fifth of May', 'the Palace Hotel', 'family'], ['next Saturday', 'the Garden Hall', 'brother'], ['the twentieth of June', 'the City Club', 'sister'], ['the first of July', 'the Sea View Hotel', 'wife'], ['the tenth of April', 'the Royal Hall', 'cousin'], ['the fifteenth of August', 'a big garden', 'parents'],
    ]),
    _S('طلب خدمة من جار', 'تطلب مساعدة من جارك، والمدرب الجار', 'Asking a neighbour for a favour', [
      ['Hello! How are you?', 'I am fine, thank you. Can I ask you a favour?', 'Good, thanks. I need your help.'],
      ['Of course. What do you need?', 'I am going away for {0}. Could you water my plants?', 'Could you collect my post while I am away?'],
      ['No problem. When are you leaving?', 'I am leaving on {1}.', 'Tomorrow morning.'],
      ['Do you have a spare key?', 'Yes, I will give you one.', 'I will leave it under the mat.'],
      ['Fine. Have a safe trip!', 'Thank you so much. I owe you one.', 'I will bring you a gift.'],
    ], [
      ['اطلب الخدمة', 'favour', 'help', 'could you', 'can you'],
      ['اشكر جارك', 'thank', 'owe', 'gift'],
    ], [
      ['a week', 'Monday'], ['ten days', 'Friday'], ['two weeks', 'Sunday'], ['a few days', 'Thursday'], ['five days', 'Saturday'], ['three weeks', 'Tuesday'],
    ]),
    _S('مواساة صديق مريض', 'صديقك مريض، والمدرب هو الصديق', 'Calling a sick friend', [
      ['Hello?', 'Hi, it is Sam. I heard you are not well.', 'Hello. How are you feeling?'],
      ['Thanks for calling. I have {0}.', 'I am sorry to hear that.', 'Oh no. Did you see a doctor?'],
      ['Yes, the doctor said I need to rest for {1}.', 'Rest is important.', 'Is there anything I can do?'],
      ['Maybe you could bring me {2}.', 'Of course. I will bring it tonight.', 'No problem. Anything else?'],
      ['You are a great friend. Thank you.', 'Get well soon.', 'Take care. Call me if you need anything.'],
    ], [
      ['اسأل عن صحته', 'how are you', 'feeling', 'heard', 'sorry'],
      ['اعرض المساعدة', 'anything', 'can do', 'bring', 'help'],
    ], [
      ['the flu', 'a week', 'some soup'], ['a bad cold', 'three days', 'some fruit'], ['a stomach bug', 'two days', 'some medicine'], ['a fever', 'five days', 'some juice'], ['a sore throat', 'three days', 'honey and lemon'], ['a back problem', 'a week', 'some books'],
    ]),
    _S('التخطيط لرحلة مع الأصدقاء', 'تخططون لرحلة نهاية الأسبوع، والمدرب صديقك', 'Planning a weekend trip with friends', [
      ['Let us plan a trip this weekend. Any ideas?', 'How about {0}?', 'I would like to go to {0}.'],
      ['Good idea! How should we get there?', 'We can go by car.', 'Let us take the train.'],
      ['How long does it take?', 'About {1} hours.', 'Not long, only {1} hours.'],
      ['What should we do when we get there?', 'We can {2}.', 'I want to {2}.'],
      ['Sounds perfect. I will tell the others.', 'Great. Let us meet at eight.', 'I cannot wait!'],
    ], [
      ['اقترح مكاناً', 'how about', 'go to', 'let us go', 'trip'],
      ['اقترح نشاطاً', 'we can', 'want to', 'swim', 'walk', 'visit', 'eat'],
    ], [
      ['the beach', 'two', 'swim in the sea'], ['the mountains', 'three', 'walk in the forest'], ['the old city', 'one', 'visit the museums'], ['the lake', 'two', 'ride bikes'], ['the desert', 'four', 'watch the stars'], ['the countryside', 'two', 'have a picnic'],
    ]),
  ],
  'study': [
    _S('تمديد موعد التسليم', 'تطلب من أستاذك مهلة، والمدرب هو الأستاذ', 'Asking a teacher for more time on an assignment', [
      ['Hello. Did you want to see me?', 'Yes, I need to talk about my {0}.', 'Yes. I have a problem with the deadline.'],
      ['What seems to be the problem?', 'I was sick for {1}.', 'I had a lot of work this week.'],
      ['I see. How much time do you need?', 'Could I have {2} more days?', 'Until next Monday, if possible.'],
      ['All right. But please do not be late again.', 'I promise.', 'Thank you very much.'],
      ['Send it to me by email when it is ready.', 'I will. Thanks again.', 'Yes, I will. Goodbye.'],
    ], [
      ['اشرح المشكلة', 'deadline', 'problem', 'sick', 'work', 'busy'],
      ['اطلب المهلة', 'more days', 'could i have', 'extension', 'time'],
    ], [
      ['essay', 'three days', 'two'], ['project', 'a week', 'three'], ['report', 'four days', 'two'], ['presentation', 'two days', 'three'], ['homework', 'five days', 'two'], ['research paper', 'a week', 'four'],
    ]),
    _S('اختيار التخصص', 'تتحدث مع المرشد الأكاديمي، والمدرب هو المرشد', 'Choosing a university major with an advisor', [
      ['Welcome. How can I help you today?', 'I need help choosing a major.', 'I am not sure what to study.'],
      ['What subjects do you enjoy most?', 'I enjoy {0}.', 'I like {0} and {1}.'],
      ['Those are good. What job would you like in the future?', 'I would like to be a {2}.', 'I am not sure yet.'],
      ['Then I suggest you look at these programmes.', 'Can you give me the details?', 'What are the requirements?'],
      ['Here is a brochure. Come back after you read it.', 'Thank you for your advice.', 'I will come next week.'],
    ], [
      ['اذكر ما تحب', 'enjoy', 'like', 'love', 'interested'],
      ['اسأل عن التفاصيل', 'details', 'requirements', 'programme', 'cost'],
    ], [
      ['maths', 'computers', 'software engineer'], ['biology', 'chemistry', 'doctor'], ['drawing', 'design', 'architect'], ['languages', 'history', 'translator'], ['business', 'economics', 'manager'], ['physics', 'maths', 'engineer'],
    ]),
    _S('مقابلة القبول الجامعي', 'تتقدم لبرنامج دراسي، والمدرب عضو لجنة القبول', 'A university admissions interview', [
      ['Good morning. Please introduce yourself.', 'Good morning. My name is Sam, and I am {0} years old.', 'Thank you for having me. I am from {1}.'],
      ['Why did you choose this university?', 'It has an excellent programme.', 'I heard it has great teachers.'],
      ['What are your strengths?', 'I am hard-working and organised.', 'I learn quickly and work well in a team.'],
      ['What do you plan to do after you graduate?', 'I would like to work in {2}.', 'I want to continue my studies.'],
      ['Do you have any questions for us?', 'Yes, are there any scholarships?', 'No, thank you. You answered everything.'],
    ], [
      ['عرّف بنفسك', 'my name', 'years old', 'from'],
      ['اذكر نقاط قوتك', 'hard-working', 'organised', 'learn', 'team', 'strength'],
    ], [
      ['eighteen', 'Cairo', 'a hospital'], ['nineteen', 'Riyadh', 'a technology company'], ['twenty', 'Amman', 'a bank'], ['eighteen', 'Dubai', 'a school'], ['nineteen', 'Jeddah', 'a design studio'], ['twenty', 'Alexandria', 'a research centre'],
    ]),
    _S('الانضمام إلى نادٍ طلابي', 'تريد الانضمام إلى نادٍ، والمدرب رئيس النادي', 'Joining a student club', [
      ['Hi there. Are you interested in our club?', 'Yes, I would like to join.', 'Yes. Can you tell me about it?'],
      ['We meet every {0} at {1}. We practise and play games.', 'That sounds fun.', 'Is it free?'],
      ['It is free for students. Have you done this before?', 'Yes, a little.', 'No, I am a beginner.'],
      ['That is fine. Everyone is welcome. Can you come this week?', 'Yes, I can.', 'I will check my timetable.'],
      ['Great. Please write your name on this list.', 'Done. Thank you.', 'I look forward to it.'],
    ], [
      ['اعبّر عن رغبتك بالانضمام', 'join', 'interested', 'would like'],
      ['اذكر خبرتك', 'beginner', 'little', 'before', 'experience'],
    ], [
      ['Tuesday', 'five o clock'], ['Wednesday', 'four thirty'], ['Thursday', 'six o clock'], ['Monday', 'three o clock'], ['Friday', 'two o clock'], ['Sunday', 'five thirty'],
    ]),
    _S('شرح درس لزميل', 'زميلك لا يفهم، والمدرب هو الزميل', 'Explaining a lesson to a classmate', [
      ['Can you help me? I do not understand {0}.', 'Sure. Which part?', 'Of course. What is the problem?'],
      ['I do not understand {1}.', 'Let me explain it simply.', 'Look at this example.'],
      ['Oh, I see. So the answer is {2}?', 'Yes, exactly!', 'Almost. Try again.'],
      ['That makes sense now. Can I ask another question?', 'Of course.', 'Go ahead.'],
      ['Thank you so much. You are a great teacher.', 'You are welcome.', 'Any time. Good luck in the exam!'],
    ], [
      ['اعرض المساعدة', 'sure', 'explain', 'example', 'which part'],
      ['شجّع زميلك', 'exactly', 'good', 'welcome', 'luck'],
    ], [
      ['the lesson', 'the first question', 'twelve'], ['this exercise', 'the second part', 'fifteen'], ['the grammar rule', 'when to use it', 'has'], ['the maths problem', 'how to start', 'twenty'], ['the science chapter', 'the main idea', 'energy'], ['the history lesson', 'the dates', 'nineteen forty-five'],
    ]),
  ],
};

/// كل المواقف: الأساسية ثم الإضافية.
// ---------- محادثات v11: 32 موقفاً جديداً بينها قسما «الهاتف» و«البيت» ----------

const _bank3 = <String, List<_S>>{
  'travel': [
    _S('الاستفسار عن مواعيد القطار', 'أنت في محطة القطار، والمدرب موظف الاستعلامات', 'Asking about train times', [
      ['Good morning. How can I help you?', 'I need a train to {0}.', 'Is there a train to {0} today?'],
      ['Yes. The next train leaves at {1}. Do you want a single or a return ticket?', 'A return ticket, please.', 'A single ticket, please.'],
      ['That will be thirty dollars. The train leaves from platform {2}.', 'Which platform, sorry?', 'Okay. Can I pay by card?'],
      ['Yes, you can. Please enter your card here.', 'Done. How long is the journey?', 'Done. Is the train on time?'],
      ['About two hours, and it is on time. Have a nice trip!', 'Thank you very much.', 'Thanks for your help. Goodbye.'],
    ], [
      ['اطلب تذكرة أو اسأل عن القطار', 'train', 'ticket', 'need'],
      ['اسأل عن الرصيف أو المدة', 'platform', 'how long', 'time'],
    ], [
      ['Boston', 'nine thirty', 'two'], ['Madrid', 'ten fifteen', 'five'], ['Cairo', 'eleven', 'three'], ['Paris', 'two forty', 'one'], ['Berlin', 'six twenty', 'four'], ['Rome', 'eight ten', 'six'],
    ]),
    _S('تسجيل الدخول في الفندق', 'وصلت الفندق، والمدرب موظف الاستقبال', 'Checking in at a hotel', [
      ['Welcome to our hotel. Do you have a reservation?', 'Yes, I have a reservation under my name.', 'Yes, for {0} nights.'],
      ['May I see your passport, please?', 'Here you are.', 'Of course. Here is my passport.'],
      ['Thank you. You have a {1} room on the {2} floor. Is that okay?', 'That is perfect.', 'Can I have a quiet room, please?'],
      ['Breakfast is served from seven to ten in the restaurant.', 'Is breakfast included?', 'Great. Is there Wi-Fi in the room?'],
      ['Yes, the Wi-Fi is free. Here is your key. Enjoy your stay!', 'Thank you very much.', 'Thanks. Where is the lift?'],
    ], [
      ['أكّد حجزك', 'reservation', 'booked', 'book'],
      ['اسأل عن الفطور أو الواي فاي', 'breakfast', 'wi-fi', 'wifi', 'included'],
    ], [
      ['two', 'double', 'third'], ['three', 'single', 'second'], ['four', 'twin', 'fifth'], ['five', 'double', 'first'], ['one', 'single', 'fourth'], ['six', 'family', 'sixth'],
    ]),
    _S('فقدان الحقيبة في المطار', 'وصلت ولم تجد حقيبتك، والمدرب موظف الأمتعة', 'Reporting a lost bag at the airport', [
      ['Hello. How can I help you?', 'My bag did not arrive.', 'I cannot find my suitcase.'],
      ['I am sorry to hear that. Which flight were you on?', 'I was on the flight from {1}.', 'The flight from {1}, this morning.'],
      ['What does your bag look like?', 'It is a {0} suitcase.', 'It is {0}, with a name tag.'],
      ['We will look for it. Where should we send it when we find it?', 'Please send it to my hotel.', 'Can you call me on this phone?'],
      ['We will contact you within {2} hours. Here is your reference number.', 'Thank you for your help.', 'Thanks. Please call me soon.'],
    ], [
      ['صف الحقيبة', 'suitcase', 'bag', 'color', 'black', 'blue', 'red'],
      ['اطلب إرسالها أو الاتصال بك', 'send', 'call', 'contact', 'hotel'],
    ], [
      ['black', 'London', 'twenty-four'], ['blue', 'Dubai', 'twelve'], ['red', 'Istanbul', 'twenty-four'], ['green', 'Rome', 'six'], ['grey', 'Cairo', 'eight'], ['brown', 'Paris', 'twelve'],
    ]),
  ],
  'food': [
    _S('طلب طعام بالتوصيل', 'تطلب وجبة بالهاتف، والمدرب موظف المطعم', 'Ordering food for delivery', [
      ['Good evening. How can I help you?', 'I would like to order food for delivery.', 'Can I order a {0}, please?'],
      ['Of course. What would you like?', 'I would like a {0}.', 'One {0} and a drink, please.'],
      ['Anything else?', 'No, that is all.', 'Yes, a salad too.'],
      ['What is your address?', 'It is {1}.', 'Building {1}, near the mosque.'],
      ['It will be there in {2} minutes. Pay by cash or card?', 'Cash, please.', 'By card, please. Thank you.'],
    ], [
      ['اطلب وجبتك', 'order', 'would like', 'can i have'],
      ['اذكر العنوان أو طريقة الدفع', 'address', 'cash', 'card', 'pay'],
    ], [
      ['chicken burger', 'twelve', 'thirty'], ['large pizza', 'fifteen', 'forty'], ['beef shawarma', 'twenty', 'twenty-five'], ['pasta', 'eight', 'thirty-five'], ['grilled fish', 'nine', 'forty-five'], ['vegetable soup', 'five', 'twenty'],
    ]),
    _S('الشكوى من طلب خاطئ', 'وصلك الطلب خطأً، والمدرب النادل', 'Complaining about a wrong order', [
      ['Here is your food. Enjoy your meal!', 'Excuse me, this is not what I ordered.', 'Sorry, I ordered {0}, not this.'],
      ['I am very sorry. What did you order?', 'I ordered the {0}.', 'The {0}, please.'],
      ['I will change it right away. Would you like anything to drink while you wait?', 'Just water, please.', 'Yes, a {1}, please.'],
      ['It will take about {2} minutes. Is that okay?', 'That is fine.', 'Okay, but please be quick.'],
      ['Thank you for your patience. The meal is on us.', 'That is very kind. Thank you.', 'Thank you for fixing it.'],
    ], [
      ['اشرح أن الطلب خطأ', 'not what', 'ordered', 'wrong'],
      ['اقبل الحل أو اطلب شيئاً', 'okay', 'fine', 'water', 'thank'],
    ], [
      ['grilled chicken', 'orange juice', 'ten'], ['beef steak', 'tea', 'fifteen'], ['vegetable pasta', 'lemonade', 'twelve'], ['fish and chips', 'cola', 'fifteen'], ['lamb rice', 'coffee', 'twenty'], ['mushroom soup', 'apple juice', 'eight'],
    ]),
    _S('حجز طاولة لمناسبة', 'تحجز لمناسبة، والمدرب موظف المطعم', 'Booking a table for an occasion', [
      ['Hello. Thank you for calling. How can I help?', 'I would like to book a table.', 'Can I reserve a table for {0} people?'],
      ['Of course. For which day and time?', 'On {2} at {1}.', 'Is {2} at {1} available?'],
      ['Yes, we have a table. Is it a special occasion?', 'Yes, it is a birthday.', 'It is a family dinner.'],
      ['Wonderful. Would you like a table inside or outside?', 'Inside, please.', 'Outside, if possible.'],
      ['Done. May I have your name and phone number?', 'Of course. Here is my number.', 'My name is Ahmed.'],
    ], [
      ['اطلب الحجز', 'book', 'reserve', 'table'],
      ['اذكر اليوم أو المناسبة', 'birthday', 'family', 'friday', 'saturday', 'day', 'occasion'],
    ], [
      ['six', 'seven thirty', 'Friday'], ['four', 'eight', 'Saturday'], ['eight', 'six', 'Thursday'], ['ten', 'nine', 'Sunday'], ['five', 'seven', 'Monday'], ['twelve', 'eight thirty', 'Tuesday'],
    ]),
  ],
  'shopping': [
    _S('إرجاع منتج', 'تريد إرجاع منتج، والمدرب موظف خدمة العملاء', 'Returning an item to a shop', [
      ['Hello. How can I help you today?', 'I would like to return this {0}.', 'I bought this {0} and it has a problem.'],
      ['I am sorry. What is the problem?', 'It is {1}.', 'It does not work. It is {1}.'],
      ['Do you have the receipt?', 'Yes, here it is.', 'I think I left it at home.'],
      ['You bought it {2} days ago, so you can return it. Would you like a refund or an exchange?', 'A refund, please.', 'An exchange, please.'],
      ['No problem. Please sign here.', 'Done. Thank you.', 'Thank you for your help.'],
    ], [
      ['اشرح المشكلة', 'return', 'problem', 'does not work', 'broken'],
      ['اختر استرداداً أو استبدالاً', 'refund', 'exchange', 'receipt'],
    ], [
      ['jacket', 'too small', 'three'], ['phone case', 'broken', 'five'], ['blender', 'not working', 'two'], ['shirt', 'the wrong colour', 'four'], ['lamp', 'damaged', 'six'], ['headphones', 'not working', 'seven'],
    ]),
    _S('شراء هاتف جديد', 'تشتري هاتفاً، والمدرب البائع', 'Buying a new phone', [
      ['Welcome! What are you looking for today?', 'I am looking for a new phone.', 'I would like to buy a phone.'],
      ['This is the {0}. It is very popular. What colour do you like?', 'I like the {1} one.', 'Do you have it in {1}?'],
      ['Yes, we do. It costs {2} dollars.', 'That is too expensive.', 'That sounds fair.'],
      ['It comes with a two-year warranty and a free case.', 'Great. I will take it.', 'Can I get a discount?'],
      ['Of course, ten percent off. Cash or card?', 'By card, please.', 'Cash, please.'],
    ], [
      ['اسأل عن اللون أو الموديل', 'looking for', 'colour', 'color', 'have it'],
      ['تفاوض على السعر', 'expensive', 'discount', 'price', 'take it'],
    ], [
      ['Galaxy A55', 'black', '350'], ['iPhone 14', 'white', '600'], ['Pixel 8', 'blue', '500'], ['Redmi Note 13', 'green', '220'], ['Galaxy S23', 'silver', '550'], ['Oppo Reno', 'gold', '300'],
    ]),
    _S('تجربة ملابس', 'تجرب ملابس، والمدرب البائع', 'Trying on clothes', [
      ['Hello. Can I help you?', 'Yes, I am looking for a {0}.', 'Do you have this {0} in my size?'],
      ['What size are you?', 'I am a {1}.', 'I think {1}.'],
      ['Here you are. The fitting rooms are over there.', 'Thank you.', 'Where are the fitting rooms?'],
      ['How does it fit?', 'It is a bit big. Do you have a smaller size?', 'It fits well. I will take it.'],
      ['Here is a smaller one in {2}. Is that okay?', 'Yes, perfect.', 'Great. Where do I pay?'],
    ], [
      ['اطلب القطعة والمقاس', 'looking for', 'size', 'do you have'],
      ['علّق على المقاس', 'big', 'small', 'fit', 'take it'],
    ], [
      ['jacket', 'medium', 'blue'], ['shirt', 'large', 'white'], ['dress', 'small', 'red'], ['coat', 'extra large', 'black'], ['sweater', 'medium', 'grey'], ['jeans', 'thirty-two', 'dark blue'],
    ]),
  ],
  'work': [
    _S('طلب إجازة', 'تطلب إجازة، والمدرب مديرك', 'Asking your manager for leave', [
      ['Hi. Do you have a minute?', 'Yes, of course.', 'Sure. I wanted to talk to you.'],
      ['What is it about?', 'I would like to take {0} days off.', 'I need some time off in {1}.'],
      ['I see. Is there a special reason?', 'I have a {2}.', 'I need to travel with my family.'],
      ['Is your work up to date? We have a big deadline.', 'Yes, I will finish everything before I go.', 'I will ask a colleague to help.'],
      ['Okay, I approve. Please send me the dates by email.', 'Thank you very much.', 'I will send them today.'],
    ], [
      ['اطلب الإجازة', 'days off', 'time off', 'leave', 'take'],
      ['اشرح السبب أو طمئن المدير', 'reason', 'finish', 'deadline', 'colleague', 'travel', 'wedding'],
    ], [
      ['five', 'March', 'family wedding'], ['three', 'June', 'medical appointment'], ['ten', 'August', 'family trip'], ['two', 'May', 'house move'], ['four', 'October', 'exam'], ['seven', 'December', 'holiday'],
    ]),
    _S('عرض تقديمي قصير', 'تقدّم عرضاً لفريقك، والمدرب زميلك', 'Giving a short presentation to your team', [
      ['Okay, we are ready. Please start your presentation.', 'Good morning, everyone. Today I will talk about {0}.', 'Thank you. Let me begin with {0}.'],
      ['Great. What are the main results?', 'Sales increased by {1} percent.', 'We improved a lot this {2}.'],
      ['That sounds good. What was the biggest challenge?', 'The deadline was very tight.', 'We did not have enough staff.'],
      ['How did you solve it?', 'We worked extra hours and shared the tasks.', 'We asked another team to help us.'],
      ['Excellent work. Do you have any questions for us?', 'No, thank you. That is all.', 'Thank you for listening.'],
    ], [
      ['ابدأ العرض', 'today', 'talk about', 'begin', 'present'],
      ['اذكر النتائج', 'increase', 'results', 'improved', 'percent'],
    ], [
      ['our new product', 'twenty', 'quarter'], ['customer service', 'fifteen', 'month'], ['online sales', 'thirty', 'year'], ['the new website', 'twelve', 'quarter'], ['our marketing plan', 'eighteen', 'month'], ['the training programme', 'ten', 'year'],
    ]),
    _S('حجز موعد بالهاتف مع عميل', 'تتصل لحجز اجتماع، والمدرب سكرتير العميل', 'Booking a meeting by phone', [
      ['Good morning. This is the office of Mr Hassan.', 'Good morning. I would like to book a meeting with Mr Hassan.', 'Hello. Can I arrange a meeting, please?'],
      ['Of course. May I ask what it is about?', 'It is about the new contract.', 'It is about our project.'],
      ['He is free on {0} at {1}. Does that suit you?', 'Yes, that suits me.', 'Can we make it a little later?'],
      ['Certainly. Could I have your name and company?', 'My name is Sami from {2}.', 'Sure. I am from {2}.'],
      ['Thank you. I will send you a confirmation email.', 'Thank you very much.', 'Great. I look forward to it.'],
    ], [
      ['اطلب الاجتماع', 'meeting', 'arrange', 'book'],
      ['اتفق على الموعد', 'suit', 'free', 'later', 'confirm', 'tuesday', 'monday'],
    ], [
      ['Tuesday', 'two o\'clock', 'Alfa Trading'], ['Monday', 'ten', 'Nile Systems'], ['Wednesday', 'three thirty', 'Blue Marketing'], ['Thursday', 'eleven', 'Gulf Logistics'], ['Sunday', 'one', 'Green Energy'], ['Tuesday', 'four', 'Delta Tech'],
    ]),
  ],
  'health': [
    _S('موعد عند طبيب الأسنان', 'تحجز عند طبيب الأسنان، والمدرب موظف الاستقبال', 'Booking a dentist appointment', [
      ['Good morning. Dental clinic. How can I help you?', 'I would like to make an appointment.', 'I have a toothache. Can I see the dentist?'],
      ['Of course. What is the problem?', 'I have a {2}.', 'It hurts when I eat.'],
      ['I see. The dentist is free on {0} at {1}. Is that good?', 'Yes, that is fine.', 'Do you have an earlier time?'],
      ['Could I have your name and phone number, please?', 'My name is Omar.', 'Of course. My number is on my file.'],
      ['Thank you. Please arrive ten minutes early.', 'I will. Thank you.', 'Okay. See you then.'],
    ], [
      ['اشرح مشكلتك', 'toothache', 'hurts', 'pain', 'problem'],
      ['اتفق على الموعد', 'appointment', 'tuesday', 'time', 'early', 'fine'],
    ], [
      ['Tuesday', 'ten', 'toothache'], ['Monday', 'three', 'broken tooth'], ['Wednesday', 'eleven', 'swollen gum'], ['Thursday', 'nine', 'sensitive tooth'], ['Sunday', 'four', 'lost filling'], ['Tuesday', 'five', 'sore tooth'],
    ]),
    _S('في الصيدلية', 'أنت في الصيدلية، والمدرب الصيدلي', 'At the pharmacy', [
      ['Hello. How can I help you?', 'I have a {0}. What do you recommend?', 'Can you give me something for a {0}?'],
      ['How long have you had it?', 'Since yesterday.', 'For about two days.'],
      ['Are you allergic to any medicine?', 'No, I am not.', 'Yes, I am allergic to penicillin.'],
      ['Then take this {1}. Take {2}, after food.', 'How many times a day?', 'Okay. Is it safe for children?'],
      ['Three times a day. If it does not get better in a few days, see a doctor.', 'Thank you very much.', 'Okay. How much is it?'],
    ], [
      ['اشرح الأعراض', 'have', 'pain', 'recommend', 'something for'],
      ['اسأل عن الجرعة', 'how many', 'times', 'after food', 'safe', 'allergic'],
    ], [
      ['headache', 'paracetamol', 'one tablet'], ['cough', 'syrup', 'one spoon'], ['sore throat', 'lozenges', 'one lozenge'], ['stomach ache', 'antacid', 'two tablets'], ['cold', 'nasal spray', 'two sprays'], ['fever', 'paracetamol', 'two tablets'],
    ]),
    _S('الاشتراك في نادٍ رياضي', 'تشترك في النادي، والمدرب موظف الاستقبال', 'Joining a gym', [
      ['Welcome to FitLife. Are you interested in a membership?', 'Yes, how much is it?', 'Yes, I would like to join.'],
      ['We have a {0}-month plan for {1} dollars a month.', 'Is there a cheaper plan?', 'That sounds good. What is included?'],
      ['It includes the gym, the pool and all classes.', 'Great. Are there evening classes?', 'Is there a trainer to help me?'],
      ['Yes, we have {2} classes in the evening, and a trainer for beginners.', 'Perfect. I want to start today.', 'Can I try one class first?'],
      ['Of course. Please fill in this form.', 'Here you are.', 'Thank you. Where do I sign?'],
    ], [
      ['اسأل عن الاشتراك', 'membership', 'join', 'how much', 'price'],
      ['اسأل عن الحصص أو المدرب', 'class', 'trainer', 'evening', 'try'],
    ], [
      ['three', 'thirty', 'yoga'], ['six', 'twenty-five', 'spinning'], ['twelve', 'twenty', 'swimming'], ['one', 'forty', 'boxing'], ['three', '35', 'fitness'], ['six', '30', 'dance'],
    ]),
  ],
  'services': [
    _S('فتح حساب بنكي', 'تفتح حساباً، والمدرب موظف البنك', 'Opening a bank account', [
      ['Good morning. How can I help you?', 'I would like to open a bank account.', 'I want to open a {0} account.'],
      ['Of course. Do you have your ID and a proof of address?', 'Yes, here they are.', 'I have my ID, but not the proof of address.'],
      ['Thank you. The monthly fee is {2}. Is that okay?', 'Yes, that is fine.', 'Is there a free account?'],
      ['Would you like a debit card and online banking?', 'Yes, both, please.', 'Just the card, please.'],
      ['Done. Your card will arrive in {1} days.', 'Thank you very much.', 'Great. How do I activate it?'],
    ], [
      ['اطلب فتح الحساب', 'open', 'account', 'would like'],
      ['اسأل عن الرسوم أو البطاقة', 'fee', 'card', 'online', 'free', 'activate'],
    ], [
      ['savings', 'five', 'ten dollars'], ['current', 'seven', 'five dollars'], ['student', 'three', 'nothing'], ['savings', 'ten', 'eight dollars'], ['current', 'five', 'twelve dollars'], ['business', 'seven', 'twenty dollars'],
    ]),
    _S('شراء شريحة جوال', 'تشتري شريحة، والمدرب موظف شركة الاتصالات', 'Buying a SIM card', [
      ['Hello. How can I help you?', 'I need a SIM card.', 'I would like a new SIM with internet.'],
      ['We have a {0} plan with {1} gigabytes. It costs {2} a month.', 'That is good. I will take it.', 'Do you have a cheaper plan?'],
      ['May I see your ID, please?', 'Here it is.', 'Of course. Do I need anything else?'],
      ['That is all. I will activate the SIM for you.', 'How long does it take?', 'Can I keep my old number?'],
      ['It takes five minutes. Your new number is on this paper.', 'Thank you very much.', 'Great. Goodbye.'],
    ], [
      ['اطلب الشريحة', 'sim', 'internet', 'need', 'would like'],
      ['اسأل عن الباقة أو الرقم', 'plan', 'cheaper', 'number', 'how long', 'gigabyte'],
    ], [
      ['monthly', 'twenty', 'thirty dollars'], ['monthly', 'fifty', 'forty dollars'], ['weekly', 'ten', 'ten dollars'], ['monthly', 'thirty', 'twenty dollars'], ['monthly', 'one hundred', 'fifty dollars'], ['weekly', 'five', 'five dollars'],
    ]),
    _S('استئجار سيارة', 'تستأجر سيارة، والمدرب موظف التأجير', 'Renting a car', [
      ['Welcome. What kind of car are you looking for?', 'I would like to rent a small car.', 'I need a car for {1} days.'],
      ['We have a {0}. It is {2} dollars a day.', 'That is good. I will take it.', 'Is insurance included?'],
      ['Basic insurance is included. May I see your driving licence?', 'Here is my licence.', 'Of course. Here you are.'],
      ['Please return the car with a full tank.', 'Okay. Where do I return it?', 'No problem. What time must I return it?'],
      ['Here are the keys. Have a safe trip!', 'Thank you very much.', 'Thanks. Goodbye.'],
    ], [
      ['اطلب سيارة', 'rent', 'car', 'looking for', 'need'],
      ['اسأل عن التأمين أو الإرجاع', 'insurance', 'return', 'licence', 'tank'],
    ], [
      ['Toyota Yaris', 'three', 'thirty-five'], ['Hyundai Elantra', 'five', 'forty'], ['Kia Picanto', 'two', 'twenty-five'], ['Nissan Sunny', 'seven', 'thirty'], ['Honda Civic', 'four', 'fifty'], ['Ford Focus', 'six', 'forty-five'],
    ]),
  ],
  'social': [
    _S('دعوة صديق لمناسبة', 'تدعو صديقاً لمناسبة، والمدرب صديقك', 'Inviting a friend to an event', [
      ['Hi! How are you?', 'I am fine, thanks. And you?', 'Great! I have some news.'],
      ['Oh, what is it?', 'I am having a {0} on {1}.', 'Would you like to come to my {0}?'],
      ['That sounds wonderful! What time does it start?', 'It starts at {2}.', 'Around {2}. Can you come?'],
      ['I would love to come. Can I bring something?', 'Just yourself!', 'Maybe some dessert, if you like.'],
      ['Perfect. See you then!', 'Thank you. See you there.', 'Great. I am so happy you can come.'],
    ], [
      ['وجّه الدعوة', 'invite', 'having', 'come', 'party'],
      ['اذكر الوقت', 'starts', 'time', 'at', 'around'],
    ], [
      ['birthday party', 'Friday', 'seven'], ['dinner', 'Saturday', 'eight'], ['barbecue', 'Thursday', 'six'], ['graduation party', 'Sunday', 'five'], ['picnic', 'Friday', 'ten in the morning'], ['housewarming', 'Saturday', 'seven thirty'],
    ]),
    _S('التعرف على جار جديد', 'تتعرف على جارك، والمدرب الجار', 'Meeting a new neighbour', [
      ['Hello! Are you my new neighbour?', 'Yes, I just moved in.', 'Yes, I live on the {0} floor.'],
      ['Welcome! My name is Sarah. What is your name?', 'My name is Ali. Nice to meet you.', 'I am Ali. Nice to meet you.'],
      ['Nice to meet you too. What do you do?', 'I work as {1}.', 'I am a {1}.'],
      ['That sounds interesting. Where are you from?', 'I am from {2}.', 'I come from {2}.'],
      ['Wonderful. If you need anything, please ask me.', 'Thank you. That is very kind.', 'Thanks. I will.'],
    ], [
      ['عرّف بنفسك', 'my name', 'nice to meet', 'live', 'moved'],
      ['اذكر عملك أو بلدك', 'work', 'from', 'am a', 'come from'],
    ], [
      ['third', 'an engineer', 'Egypt'], ['second', 'a teacher', 'Jordan'], ['fifth', 'a nurse', 'Saudi Arabia'], ['first', 'a designer', 'Morocco'], ['fourth', 'an accountant', 'Iraq'], ['sixth', 'a student', 'Lebanon'],
    ]),
    _S('الاعتذار عن موعد', 'تعتذر عن موعد، والمدرب صديقك', 'Cancelling plans politely', [
      ['Hey! Are we still meeting today?', 'I am so sorry, I cannot come.', 'Actually, I have a problem.'],
      ['Oh no. What happened?', 'I have {0}.', 'I need to {0}.'],
      ['I understand. Do not worry.', 'Thank you for understanding.', 'I feel bad about it.'],
      ['Can we meet another day?', 'Yes, how about {1}?', 'Of course. Are you free on {1}?'],
      ['{1} is perfect. At {2}?', 'Yes, that works for me.', 'Sure. See you then.'],
    ], [
      ['اعتذر', 'sorry', 'cannot', 'problem'],
      ['اقترح موعداً جديداً', 'how about', 'another day', 'free', 'works'],
    ], [
      ['a bad cold', 'Saturday', 'five'], ['a lot of work', 'Sunday', 'six'], ['a family visit', 'Monday', 'seven'], ['a car problem', 'Tuesday', 'four'], ['an exam tomorrow', 'Friday', 'eight'], ['a headache', 'Thursday', 'six thirty'],
    ]),
  ],
  'study': [
    _S('سؤال المعلم عن الواجب', 'تسأل معلمك، والمدرب المعلم', 'Asking the teacher about homework', [
      ['Yes? Do you have a question?', 'Yes, I have a question about the homework.', 'Excuse me. I did not understand the homework.'],
      ['Of course. What is the problem?', 'I do not understand the {0} exercise.', 'Could you explain it again, please?'],
      ['Sure. Read the instructions on page {2}, then write a short answer.', 'Thank you. When is it due?', 'Is it a long answer?'],
      ['It is due on {1}. About one page is enough.', 'Can I send it by email?', 'I understand now. Thank you.'],
      ['Yes, email is fine. Good luck!', 'Thank you very much.', 'Thanks. See you in class.'],
    ], [
      ['اسأل عن الواجب', 'homework', 'understand', 'explain', 'exercise'],
      ['اسأل عن الموعد', 'due', 'when', 'email', 'page'],
    ], [
      ['grammar', 'Monday', 'twelve'], ['reading', 'Sunday', 'twenty'], ['writing', 'Thursday', 'eight'], ['listening', 'Tuesday', 'fifteen'], ['vocabulary', 'Wednesday', 'ten'], ['speaking', 'Monday', 'thirty'],
    ]),
    _S('التسجيل في دورة', 'تسجل في دورة، والمدرب موظف المعهد', 'Registering for a course', [
      ['Hello. How can I help you?', 'I would like to register for a course.', 'Do you have English courses?'],
      ['Yes. We have a {0} course starting on {1}.', 'How long is the course?', 'How much does it cost?'],
      ['It is two months, and it costs {2} dollars.', 'That is good. Is there a discount?', 'Can I pay in two parts?'],
      ['Yes, you can pay half now and half later.', 'Great. I will register.', 'Okay. What documents do I need?'],
      ['Just your ID. Please fill in this form.', 'Here you are.', 'Thank you for your help.'],
    ], [
      ['اسأل عن الدورات', 'course', 'register', 'english'],
      ['اسأل عن السعر أو المدة', 'cost', 'how much', 'how long', 'discount', 'pay'],
    ], [
      ['conversation', 'Sunday', 'one hundred'], ['business English', 'Monday', 'one hundred fifty'], ['grammar', 'Tuesday', 'eighty'], ['IELTS', 'Saturday', 'two hundred'], ['writing', 'Wednesday', 'ninety'], ['pronunciation', 'Thursday', 'seventy'],
    ]),
    _S('العمل مع زميل على مشروع', 'تتحدث مع زميلك عن مشروع، والمدرب زميلك', 'Planning a group project', [
      ['Hi! Shall we start our project?', 'Yes, let us start.', 'Sure. What is the topic?'],
      ['Our topic is {0}. How shall we divide the work?', 'I can do the research.', 'I can write the first part.'],
      ['Good. I will make the {1}.', 'Great. When shall we meet again?', 'Perfect. Can you also check my part?'],
      ['Let us meet on {2}. Is that okay?', 'Yes, that is fine.', 'Can we meet a day earlier?'],
      ['Okay, we will make it a day earlier. Good work today!', 'Thanks. See you.', 'Thank you. Goodbye.'],
    ], [
      ['اقترح تقسيم العمل', 'i can', 'research', 'write', 'divide'],
      ['اتفق على موعد', 'meet', 'earlier', 'day', 'fine'],
    ], [
      ['climate change', 'slides', 'Monday'], ['healthy food', 'poster', 'Tuesday'], ['social media', 'report', 'Wednesday'], ['renewable energy', 'slides', 'Sunday'], ['public transport', 'survey', 'Thursday'], ['space travel', 'video', 'Monday'],
    ]),
  ],
  'phone': [
    _S('ترك رسالة لشخص', 'تتصل بمكتب وتترك رسالة، والمدرب موظف الاستقبال', 'Leaving a phone message', [
      ['Good afternoon. How can I help you?', 'Can I speak to {0}, please?', 'Hello. Is {0} there?'],
      ['I am sorry, {0} is not available. Would you like to leave a message?', 'Yes, please.', 'Can he call me back?'],
      ['Sure. What is your name?', 'My name is Khalid.', 'This is Khalid from Delta Company.'],
      ['And your phone number?', 'It is {1}.', 'You can reach me on {1}.'],
      ['I will give him the message. Is there a good time to call?', 'After {2}, please.', 'Any time after {2}.'],
    ], [
      ['اطلب الشخص', 'speak to', 'is there', 'can i speak'],
      ['اترك رسالة أو رقمك', 'message', 'number', 'call me', 'reach'],
    ], [
      ['Mr Salem', 'zero five five one two three', 'three o\'clock'], ['Ms Laila', 'zero five zero nine eight seven', 'noon'], ['Mr Karim', 'zero five three four five six', 'four'], ['Dr Hana', 'zero five six seven eight nine', 'two thirty'], ['Mr Omar', 'zero five four three two one', 'five'], ['Ms Nora', 'zero five two six five four', 'one'],
    ]),
    _S('الاتصال بخدمة العملاء', 'تتصل بخدمة العملاء، والمدرب الموظف', 'Calling customer service', [
      ['Customer service. How can I help you?', 'I have a problem with my {0}.', 'I would like to report a problem.'],
      ['I am sorry to hear that. Can you give me your account number?', 'Yes, it is {1}.', 'One moment, please. It is {1}.'],
      ['Thank you. I can see the problem. We will fix it by {2}.', 'Is that the earliest time?', 'Okay, thank you.'],
      ['I will also send you a confirmation message.', 'Great. Thank you.', 'Can you give me a reference number?'],
      ['Of course. Is there anything else I can help you with?', 'No, that is all.', 'No, thank you. Goodbye.'],
    ], [
      ['اشرح المشكلة', 'problem', 'report', 'not working'],
      ['اسأل عن الموعد أو رقم المرجع', 'reference', 'earliest', 'when', 'number'],
    ], [
      ['internet', 'four five six', 'tomorrow'], ['bill', 'seven eight nine', 'Friday'], ['order', 'one two three', 'Monday'], ['phone line', 'five five two', 'tonight'], ['subscription', 'nine nine one', 'Sunday'], ['delivery', 'three three eight', 'Thursday'],
    ]),
    _S('تأكيد موعد بالهاتف', 'تؤكد موعداً، والمدرب موظف العيادة', 'Confirming an appointment by phone', [
      ['Hello. This is the clinic calling about your appointment.', 'Yes, speaking.', 'Hello. Thank you for calling.'],
      ['Your appointment is on {0} at {1}. Can you confirm?', 'Yes, I can come.', 'Can we change it, please?'],
      ['No problem. Please arrive at the {2} on the first floor.', 'Where exactly is it?', 'Okay. Do I need to bring anything?'],
      ['Please bring your ID and your insurance card.', 'Okay. I will bring them.', 'Thank you for the reminder.'],
      ['Thank you. We will see you then. Goodbye!', 'Goodbye!', 'Thank you. Goodbye.'],
    ], [
      ['أكّد الموعد', 'confirm', 'come', 'change'],
      ['اسأل عن المكان أو الأوراق', 'where', 'bring', 'id', 'floor'],
    ], [
      ['Sunday', 'ten', 'reception'], ['Monday', 'nine thirty', 'waiting room'], ['Tuesday', 'eleven', 'front desk'], ['Wednesday', 'four', 'second office'], ['Thursday', 'two', 'main hall'], ['Sunday', 'twelve', 'blue door'],
    ]),
    _S('رقم خاطئ', 'يأتيك اتصال خاطئ، والمدرب المتصل', 'Handling a wrong number', [
      ['Hello. Is this {0}?', 'No, I think you have the wrong number.', 'Sorry, who are you calling?'],
      ['Oh, I am sorry. Is this {1}?', 'No, this is a different number.', 'No, you have the wrong number.'],
      ['I apologise for the mistake. I must have typed the wrong number.', 'No problem at all.', 'It is okay. It happens.'],
      ['Could you tell me what number this is?', 'Of course. It is {2}.', 'I would rather not say, sorry.'],
      ['Thank you. Sorry again for the trouble. Goodbye!', 'Goodbye!', 'No worries. Bye.'],
    ], [
      ['وضّح أنه رقم خاطئ', 'wrong number', 'different', 'who'],
      ['اقبل الاعتذار', 'no problem', 'okay', 'happens', 'no worries'],
    ], [
      ['Mr Adel', 'zero five five one one one', 'zero five five one one two'], ['Ms Rana', 'zero five zero two two two', 'zero five zero two two three'], ['the bakery', 'zero five three three three three', 'zero five three three four four'], ['Dr Samir', 'zero five six four four four', 'zero five six four four five'], ['Mr Yusuf', 'zero five four five five five', 'zero five four five five six'], ['the school', 'zero five two six six six', 'zero five two six six seven'],
    ]),
  ],
  'home': [
    _S('إصلاح عطل في البيت', 'تتصل بفني، والمدرب الفني', 'Calling a repairman', [
      ['Hello. How can I help you?', 'I have a problem with my {0}.', 'My {0} is not working.'],
      ['I see. When did it start?', 'It started yesterday.', 'This morning.'],
      ['I can come on {1}. Is that okay?', 'Yes, that is fine.', 'Can you come earlier?'],
      ['I will check it first. The visit costs {2} dollars.', 'That is okay.', 'Is that the final price?'],
      ['If we need parts, I will tell you before I buy anything. What is your address?', 'I will send it by message.', 'It is near the mall.'],
    ], [
      ['اشرح العطل', 'problem', 'not working', 'broken'],
      ['اسأل عن الموعد أو السعر', 'when', 'price', 'cost', 'earlier', 'fine'],
    ], [
      ['air conditioner', 'Tuesday', 'twenty'], ['washing machine', 'Monday', 'fifteen'], ['water heater', 'tomorrow', 'twenty-five'], ['fridge', 'Wednesday', 'thirty'], ['kitchen tap', 'Thursday', 'ten'], ['door lock', 'today', 'fifteen'],
    ]),
    _S('استئجار شقة', 'تسأل عن شقة للإيجار، والمدرب صاحب العقار', 'Asking about an apartment for rent', [
      ['Hello. Are you calling about the apartment?', 'Yes. Is it still available?', 'Yes, I would like to see it.'],
      ['It has {0} bedrooms and is on the {2} floor.', 'How much is the rent?', 'Is there parking?'],
      ['The rent is {1} a month, and parking is free.', 'That is a bit high.', 'That sounds good.'],
      ['Would you like to see it tomorrow?', 'Yes, what time?', 'Yes, I can come after work.'],
      ['Come at five. I will meet you in front of the building.', 'Thank you. See you then.', 'Great. Goodbye.'],
    ], [
      ['اسأل عن الشقة', 'available', 'see it', 'apartment'],
      ['اسأل عن الإيجار', 'rent', 'how much', 'parking', 'high'],
    ], [
      ['two', 'eight hundred dollars', 'third'], ['three', 'one thousand dollars', 'fifth'], ['one', 'five hundred dollars', 'second'], ['two', 'seven hundred dollars', 'first'], ['three', 'nine hundred dollars', 'fourth'], ['two', 'six hundred dollars', 'sixth'],
    ]),
    _S('طلب مساعدة من الجار', 'تطلب شيئاً من جارك، والمدرب الجار', 'Asking a neighbour for help', [
      ['Hello! How are you?', 'Hi! I am fine. I need your help.', 'Hello. Sorry to bother you.'],
      ['Of course. What do you need?', 'Could I borrow your {0}?', 'Do you have a {0}? I need it.'],
      ['Sure. When do you need it?', 'Until {1}, please.', 'Just for an hour, this {2}.'],
      ['No problem. I will bring it to you.', 'That is very kind of you.', 'Thank you so much.'],
      ['You are welcome. Neighbours should help each other.', 'I will return it soon.', 'You are very kind. Goodbye.'],
    ], [
      ['اطلب المساعدة', 'borrow', 'help', 'need', 'could i'],
      ['اشكر', 'thank', 'kind', 'return'],
    ], [
      ['ladder', 'tonight', 'afternoon'], ['drill', 'Friday', 'morning'], ['iron', 'tomorrow', 'evening'], ['tool box', 'Sunday', 'afternoon'], ['big pot', 'tonight', 'evening'], ['pump', 'Saturday', 'morning'],
    ]),
    _S('التسوق في السوبرماركت', 'تبحث عن منتج، والمدرب موظف المتجر', 'Finding items in a supermarket', [
      ['Hello. Can I help you find something?', 'Yes, where is the {0}?', 'Excuse me. I am looking for {0}.'],
      ['It is in aisle {1}, on the left.', 'Thank you. Is it on sale?', 'Do you have a bigger size?'],
      ['Yes, it is {2} dollars this week.', 'That is a good price.', 'I will take two.'],
      ['Do you need anything else?', 'Where can I find bread?', 'No, that is all.'],
      ['The bakery is at the back. The checkout is over there.', 'Thank you for your help.', 'Thanks. Goodbye.'],
    ], [
      ['اسأل عن مكان منتج', 'where', 'looking for', 'find'],
      ['اسأل عن العرض أو السعر', 'sale', 'price', 'how much', 'take'],
    ], [
      ['rice', 'four', 'three'], ['olive oil', 'six', 'eight'], ['milk', 'two', 'two'], ['coffee', 'five', 'six'], ['cheese', 'three', 'four'], ['eggs', 'one', 'three'],
    ]),
  ],
};

/// مواقف إضافية جديدة (احترافية): عمل، صحة، خدمات، علاقات، دراسة، هاتف.
final Map<String, List<_S>> _bank4 = {
  'shopping': [
    _S('إرجاع منتج للمتجر', 'تريد إرجاع منتج، والمدرب موظف المتجر', 'Returning an item to a store', [
      ['Hello. How can I help you?', 'I would like to return this {0}.', 'Can I exchange this {0}?'],
      ['Of course. What is the problem with it?', 'It is {1}.', 'It does not work.'],
      ['Do you have the receipt?', 'Yes, here it is.', 'I lost it. Is that a problem?'],
      ['Would you like a refund or an exchange?', 'A refund, please.', 'An exchange, please.'],
      ['Done. The money will return to your card in three days.', 'Thank you for your help.', 'Great. Have a nice day.'],
    ], [
      ['اشرح سبب الإرجاع', 'broken', 'small', 'big', 'wrong', 'does not', 'damaged'],
      ['اختر استرداداً أو استبدالاً', 'refund', 'exchange', 'money'],
    ], [
      ['jacket', 'too small'], ['phone case', 'the wrong size'], ['lamp', 'broken'], ['shirt', 'too big'], ['kettle', 'damaged'], ['watch', 'not working'],
    ]),
  ],
  'food': [
    _S('حجز طاولة وطلب الطعام', 'تحجز طاولة في مطعم، والمدرب النادل', 'Booking a table and ordering at a restaurant', [
      ['Good evening. Do you have a reservation?', 'Yes, a table for {0}.', 'No. Do you have a table for {0}?'],
      ['Yes, please follow me. Here is the menu. Would you like something to drink?', 'Water, please.', 'A fresh juice, please.'],
      ['Are you ready to order?', 'I would like the {1}.', 'What do you recommend?'],
      ['Excellent choice. Would you like a salad with it?', 'Yes, please.', 'No, thank you.'],
      ['Here is your meal. Enjoy!', 'Thank you. It looks delicious.', 'Could we have the bill later, please?'],
    ], [
      ['اذكر عدد الأشخاص', 'two', 'three', 'four', 'five', 'table for'],
      ['اطلب طبقاً', 'would like', 'have', 'order', 'recommend'],
    ], [
      ['two', 'grilled chicken'], ['four', 'beef burger'], ['three', 'vegetable pasta'], ['two', 'fish and chips'], ['five', 'mixed grill'], ['six', 'pizza'],
    ]),
  ],
  'home': [
    _S('التحدث مع الجار', 'جارك يشتكي من الضجيج، والمدرب الجار', 'Talking to a neighbour about noise', [
      ['Hello. Sorry to disturb you. Do you have a minute?', 'Of course. What is it?', 'Sure. Is everything okay?'],
      ['There was a lot of noise from your flat last night.', 'I am very sorry. I did not know.', 'We had a small party. I apologize.'],
      ['It was after midnight, and my children could not sleep.', 'It will not happen again.', 'I will tell my friends to be quiet.'],
      ['Thank you. I understand parties are fun, but please tell me next time.', 'Yes, I will let you know in advance.', 'Good idea. I will give you my number.'],
      ['That is very kind. Have a nice day.', 'You too. Goodbye.', 'Thank you for telling me.'],
    ], [
      ['اعتذر بوضوح', 'sorry', 'apologize', 'my fault'],
      ['اوعد بعدم التكرار', 'will not', 'again', 'next time', 'quiet'],
    ], [
      ['a'], ['a'], ['a'], ['a'], ['a'], ['a'],
    ]),
  ],
  'work': [
    _S('طلب إجازة من المدير', 'تطلب إجازة، والمدرب مديرك في العمل', 'Asking your manager for time off', [
      ['Hi. You wanted to talk to me?', 'Yes. I would like to ask for some time off.', 'Do you have a minute? I need a day off.'],
      ['Of course. When do you need it?', 'I need {0}.', 'From {0}, if possible.'],
      ['Is there a reason? Is it urgent?', 'It is {1}.', 'I have {1}.'],
      ['I understand. Who will cover your work?', 'My colleague can cover it.', 'I will finish everything before I go.'],
      ['All right. Please send me an email, and I will approve it.', 'Thank you very much. I will send it today.', 'Thank you. I really appreciate it.'],
    ], [
      ['اذكر التاريخ المطلوب', 'monday', 'tuesday', 'friday', 'week', 'day', 'tomorrow', 'next'],
      ['اشرح السبب أو كيف ستغطي عملك', 'because', 'cover', 'finish', 'family', 'appointment'],
    ], [
      ['next Monday', 'a family matter'], ['two days next week', 'a medical appointment'], ['this Friday', 'a wedding to attend'], ['a week in December', 'a trip planned with my family'], ['tomorrow morning', 'a bank appointment'], ['three days next month', 'an exam to take'],
    ]),
    _S('تقديم نفسك في اجتماع', 'أول اجتماع لك مع فريق جديد، والمدرب زميل', 'Introducing yourself at a team meeting', [
      ['Welcome to the team. Could you introduce yourself?', 'Sure. My name is {0}.', 'Thank you. I am {0}.'],
      ['Nice to meet you. What did you do before this job?', 'I worked as {1}.', 'I was {1} for a few years.'],
      ['Interesting. What will you be working on here?', 'I will work on the new projects.', 'I will help the {2} team.'],
      ['Great. Is there anything you need from us?', 'Could you show me the system?', 'Who should I ask for help?'],
      ['Of course. Ask anytime. We are glad to have you.', 'Thank you. I am happy to be here.', 'Thanks. I am looking forward to working with you.'],
    ], [
      ['عرّف بنفسك واسمك', 'my name', 'i am', 'i\'m'],
      ['تكلم عن خبرتك السابقة', 'worked', 'was', 'experience', 'before'],
    ], [
      ['Omar', 'a sales assistant', 'sales'], ['Sara', 'an accountant', 'finance'], ['Khaled', 'a customer service agent', 'support'], ['Lina', 'a teacher', 'training'], ['Yousef', 'a warehouse supervisor', 'logistics'], ['Huda', 'a designer', 'marketing'],
    ]),
    _S('التفاوض على الموعد النهائي', 'المشروع تأخر، والمدرب عميل ينتظره', 'Negotiating a project deadline', [
      ['Hello. I wanted to check on the project. Is it ready?', 'Not yet. I need more time.', 'We are still working on it.'],
      ['I see. What is the problem?', 'We had {0}.', 'There was {0}.'],
      ['How much more time do you need?', 'I need {1}.', 'About {1}, I think.'],
      ['That is a bit late for us. Can you deliver part of it earlier?', 'Yes, I can send the first part earlier.', 'I will try my best.'],
      ['Okay. Please keep me updated every day.', 'Of course. I will send you an update daily.', 'Sure, and I apologize for the delay.'],
    ], [
      ['اشرح سبب التأخير', 'problem', 'delay', 'issue', 'because', 'late'],
      ['اقترح موعداً أو اعتذر', 'days', 'week', 'sorry', 'apologize', 'deliver', 'send'],
    ], [
      ['a technical problem', 'three more days'], ['some delays with the supplier', 'one more week'], ['a change in the requirements', 'two more days'], ['a problem with the data', 'until Thursday'], ['a team member who got sick', 'four more days'], ['unexpected extra work', 'five more days'],
    ]),
  ],
  'health': [
    _S('وصف الألم للطبيب', 'عندك ألم، والمدرب الطبيب', 'Describing symptoms to a doctor', [
      ['Good morning. What seems to be the problem?', 'I have {0}.', 'I do not feel well. I have {0}.'],
      ['How long have you had it?', 'For {1}.', 'Since {1}.'],
      ['Is the pain constant, or does it come and go?', 'It comes and goes.', 'It is constant.'],
      ['Are you taking any medicine? Do you have any allergies?', 'No allergies, and no medicine.', 'I am allergic to penicillin.'],
      ['Okay. I will give you a prescription. Rest and drink water.', 'Thank you, doctor. How often should I take it?', 'Thank you. When should I come back?'],
    ], [
      ['صف الأعراض', 'pain', 'headache', 'fever', 'cough', 'sore', 'hurts', 'stomach'],
      ['اذكر المدة', 'days', 'week', 'since', 'yesterday', 'hours'],
    ], [
      ['a bad headache', 'two days'], ['a sore throat and a cough', 'three days'], ['a pain in my stomach', 'yesterday evening'], ['a fever', 'since this morning'], ['a pain in my back', 'a week'], ['a pain in my knee', 'two weeks'],
    ]),
    _S('الصيدلية', 'تشتري دواءً، والمدرب الصيدلي', 'Buying medicine at a pharmacy', [
      ['Hello. How can I help you?', 'Do you have something for {0}?', 'I need medicine for {0}.'],
      ['Yes. Do you have any allergies?', 'No, I do not.', 'Yes, I am allergic to {1}.'],
      ['Take one tablet {2}, after eating.', 'How many days should I take it?', 'Can I take it with water?'],
      ['For three days. If it does not get better, see a doctor.', 'Okay. How much is it?', 'I understand. Thank you.'],
      ['It is twelve dollars. Here is your receipt.', 'Here you go. Thank you.', 'Thanks. Have a nice day.'],
    ], [
      ['اطلب دواءً لمشكلتك', 'medicine', 'something for', 'need', 'tablet'],
      ['اسأل عن الجرعة أو السعر', 'how many', 'how much', 'how often', 'days'],
    ], [
      ['a headache', 'aspirin', 'twice a day'], ['a cough', 'honey', 'three times a day'], ['a cold', 'penicillin', 'every eight hours'], ['stomach pain', 'nuts', 'once a day'], ['a sore throat', 'ibuprofen', 'every six hours'], ['allergies', 'dust', 'in the morning'],
    ]),
  ],
  'services': [
    _S('فتح حساب بنكي', 'تريد فتح حساب، والمدرب موظف البنك', 'Opening a bank account', [
      ['Good morning. How can I help you today?', 'I would like to open a bank account.', 'I want to open a {0} account.'],
      ['Of course. Do you have your ID and proof of address?', 'Yes, here you are.', 'I have my passport. Is that enough?'],
      ['Thank you. Would you like a debit card with it?', 'Yes, please.', 'What are the fees?'],
      ['There is a small monthly fee of {1} dollars. Is that okay?', 'Yes, that is fine.', 'Is there a cheaper option?'],
      ['Your account is ready. Your card will arrive in a week.', 'Thank you. Can I use the mobile app?', 'Great. Thank you for your help.'],
    ], [
      ['اطلب فتح الحساب', 'open', 'account'],
      ['اسأل عن الرسوم أو البطاقة', 'fee', 'card', 'how much', 'app'],
    ], [
      ['savings', 'three'], ['current', 'five'], ['student', 'two'], ['savings', 'four'], ['current', 'six'], ['joint', 'five'],
    ]),
    _S('تقديم شكوى لشركة', 'منتجك وصل تالفاً، والمدرب خدمة العملاء', 'Making a complaint to customer service', [
      ['Customer service. How may I help you?', 'I received a damaged product.', 'I am calling about my order.'],
      ['I am sorry to hear that. What is your order number?', 'It is {0}.', 'The number is {0}.'],
      ['Thank you. What exactly is the problem?', 'The {1} is broken.', 'The box was open, and the {1} is damaged.'],
      ['I can send a replacement or give you a refund. Which one do you prefer?', 'A replacement, please.', 'I would like a refund.'],
      ['Done. You will get an email within one hour. Anything else?', 'No, thank you for your help.', 'How long will it take?'],
    ], [
      ['اشرح المشكلة بوضوح', 'broken', 'damaged', 'problem', 'wrong', 'missing'],
      ['اختر الحل', 'replacement', 'refund', 'money back', 'exchange'],
    ], [
      ['4471', 'screen'], ['8820', 'charger'], ['3095', 'headphones'], ['6512', 'keyboard'], ['7743', 'lamp'], ['1208', 'phone case'],
    ]),
  ],
  'social': [
    _S('دعوة صديق وتنسيق الموعد', 'تدعو صديقاً للخروج، والمدرب صديقك', 'Inviting a friend and making plans', [
      ['Hey! Long time no see. How are you?', 'I am great. How about you?', 'Good, thanks. I missed you.'],
      ['Doing well. What have you been up to?', 'I have been busy with work.', 'Not much. I have been studying.'],
      ['We should meet up. Are you free this {0}?', 'Yes, I am free.', 'I am busy, but how about {1}?'],
      ['Sounds good. Where do you want to go?', 'How about a coffee shop?', 'Let us have dinner somewhere nice.'],
      ['Perfect. See you then. Do not be late!', 'I will not. See you soon!', 'Ha ha, I promise. Bye!'],
    ], [
      ['اقترح يوماً', 'friday', 'saturday', 'weekend', 'tomorrow', 'evening', 'free', 'sunday'],
      ['اقترح مكاناً', 'coffee', 'dinner', 'restaurant', 'park', 'cinema', 'lunch'],
    ], [
      ['weekend', 'Sunday'], ['Friday', 'Saturday'], ['Thursday evening', 'next week'], ['Saturday', 'Sunday afternoon'], ['weekend', 'Friday night'], ['week', 'Monday'],
    ]),
  ],
  'study': [
    _S('سؤال المعلم بعد الحصة', 'لم تفهم الدرس، والمدرب معلمك', 'Asking a teacher for help after class', [
      ['Hello. Do you have a question about the lesson?', 'Yes. I did not understand {0}.', 'Yes, please. I need help with {0}.'],
      ['Sure. Which part was difficult for you?', 'The {1} part.', 'I did not understand {1}.'],
      ['Let me explain it again in a simpler way. Does that make sense?', 'Yes, it is clearer now.', 'Could you give me an example?'],
      ['Here is an example. Now try one yourself.', 'Let me try. Is this correct?', 'I think I understand now.'],
      ['Very good. Practice at home, and come to me if you need more help.', 'Thank you very much, teacher.', 'Thanks. I will practice every day.'],
    ], [
      ['قل ما لم تفهمه', 'did not understand', 'difficult', 'help', 'do not understand', 'confused'],
      ['اطلب مثالاً أو توضيحاً', 'example', 'again', 'explain', 'repeat', 'slowly'],
    ], [
      ['the homework', 'last'], ['the grammar rule', 'second'], ['the new words', 'first'], ['the reading text', 'middle'], ['the exercise', 'last'], ['the past tense', 'second'],
    ]),
  ],
  'phone': [
    _S('حجز موعد بالهاتف', 'تحجز موعداً بالهاتف، والمدرب موظف الاستقبال', 'Booking an appointment by phone', [
      ['Good morning, {0}. How can I help you?', 'I would like to book an appointment.', 'Hello. Can I make an appointment, please?'],
      ['Certainly. What day would you prefer?', 'Is {1} possible?', 'Do you have anything on {1}?'],
      ['I have an opening at ten or at three. Which one is better?', 'Ten is better for me.', 'Three, please.'],
      ['May I have your name and phone number?', 'My name is Ali, and my number is 0501234567.', 'It is Sara, and my number is 0559876543.'],
      ['Thank you. Your appointment is confirmed. See you then.', 'Thank you. Goodbye.', 'Could you send me a message to confirm?'],
    ], [
      ['اطلب الموعد', 'appointment', 'book', 'reserve'],
      ['اذكر اليوم أو الوقت المناسب', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'ten', 'three', 'tomorrow'],
    ], [
      ['City Clinic', 'Monday'], ['Smile Dental Care', 'Tuesday'], ['Bright Eyes Center', 'Wednesday'], ['Green Fitness Club', 'Thursday'], ['Style Hair Salon', 'Friday'], ['Fast Car Service', 'Saturday'],
    ]),
  ],
};

final Map<String, List<_S>> _all = {
  for (final c in talkCats) c.id: [...?_bank[c.id], ...?_bank2[c.id], ...?_bank3[c.id], ...?_bank4[c.id]],
};
