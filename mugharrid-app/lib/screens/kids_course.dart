import 'package:flutter/material.dart';

import '../core/speech.dart';
import '../core/store.dart';
import '../ui/common.dart';
import 'settings.dart';

/// منهج الأطفال: وحدات مرتبة، في كل وحدة «تعلّم» ببطاقات ثم «اختبر نفسك».
/// الترتيب مقصود: الحروف والأصوات، ثم الأرقام والألوان، ثم كلمات المحيط القريب، ثم جمل قصيرة.

class KidItem {
  const KidItem(this.show, this.en, this.ar, {this.say = '', this.color});

  /// ما يُعرض كبيراً: إيموجي أو حرف أو رقم.
  final String show;
  final String en;
  final String ar;

  /// ما يُنطق إن اختلف عن [en] (مثل: A. Apple).
  final String say;
  final Color? color;
}

class KidUnit {
  const KidUnit(this.id, this.emoji, this.titleAr, this.aboutAr, this.items);
  final String id;
  final String emoji;
  final String titleAr;
  final String aboutAr;
  final List<KidItem> items;
}

const kidUnits = <KidUnit>[
  KidUnit('abc1', '🔤', 'الحروف A إلى M', 'شكل الحرف واسمه وكلمة تبدأ به', [
    KidItem('A a', 'Apple', 'تفاحة 🍎', say: 'A. Apple.'), KidItem('B b', 'Ball', 'كرة ⚽', say: 'B. Ball.'), KidItem('C c', 'Cat', 'قطة 🐱', say: 'C. Cat.'),
    KidItem('D d', 'Dog', 'كلب 🐶', say: 'D. Dog.'), KidItem('E e', 'Egg', 'بيضة 🥚', say: 'E. Egg.'), KidItem('F f', 'Fish', 'سمكة 🐟', say: 'F. Fish.'),
    KidItem('G g', 'Goat', 'ماعز 🐐', say: 'G. Goat.'), KidItem('H h', 'Hat', 'قبعة 🎩', say: 'H. Hat.'), KidItem('I i', 'Ice', 'ثلج 🧊', say: 'I. Ice.'),
    KidItem('J j', 'Juice', 'عصير 🧃', say: 'J. Juice.'), KidItem('K k', 'Key', 'مفتاح 🔑', say: 'K. Key.'), KidItem('L l', 'Lion', 'أسد 🦁', say: 'L. Lion.'),
    KidItem('M m', 'Moon', 'قمر 🌙', say: 'M. Moon.'),
  ]),
  KidUnit('abc2', '🔡', 'الحروف N إلى Z', 'نكمل الحروف مع كلمات جديدة', [
    KidItem('N n', 'Nose', 'أنف 👃', say: 'N. Nose.'), KidItem('O o', 'Orange', 'برتقالة 🍊', say: 'O. Orange.'), KidItem('P p', 'Pen', 'قلم 🖊️', say: 'P. Pen.'),
    KidItem('Q q', 'Queen', 'ملكة 👑', say: 'Q. Queen.'), KidItem('R r', 'Rabbit', 'أرنب 🐰', say: 'R. Rabbit.'), KidItem('S s', 'Sun', 'شمس ☀️', say: 'S. Sun.'),
    KidItem('T t', 'Tree', 'شجرة 🌳', say: 'T. Tree.'), KidItem('U u', 'Umbrella', 'مظلة ☂️', say: 'U. Umbrella.'), KidItem('V v', 'Van', 'شاحنة صغيرة 🚐', say: 'V. Van.'),
    KidItem('W w', 'Water', 'ماء 💧', say: 'W. Water.'), KidItem('X x', 'Box', 'صندوق 📦', say: 'X. Box.'), KidItem('Y y', 'Yellow', 'أصفر 💛', say: 'Y. Yellow.'),
    KidItem('Z z', 'Zebra', 'حمار وحشي 🦓', say: 'Z. Zebra.'),
  ]),
  KidUnit('num', '🔢', 'الأرقام 1 إلى 10', 'نعدّ معاً بالإنجليزية', [
    KidItem('1', 'One', 'واحد'), KidItem('2', 'Two', 'اثنان'), KidItem('3', 'Three', 'ثلاثة'), KidItem('4', 'Four', 'أربعة'), KidItem('5', 'Five', 'خمسة'),
    KidItem('6', 'Six', 'ستة'), KidItem('7', 'Seven', 'سبعة'), KidItem('8', 'Eight', 'ثمانية'), KidItem('9', 'Nine', 'تسعة'), KidItem('10', 'Ten', 'عشرة'),
  ]),
  KidUnit('col', '🎨', 'الألوان', 'أسماء الألوان التي نراها كل يوم', [
    KidItem('●', 'Red', 'أحمر', color: Color(0xFFE53935)), KidItem('●', 'Blue', 'أزرق', color: Color(0xFF1E88E5)), KidItem('●', 'Green', 'أخضر', color: Color(0xFF43A047)),
    KidItem('●', 'Yellow', 'أصفر', color: Color(0xFFFDD835)), KidItem('●', 'Orange', 'برتقالي', color: Color(0xFFFB8C00)), KidItem('●', 'Pink', 'وردي', color: Color(0xFFF06292)),
    KidItem('●', 'Purple', 'بنفسجي', color: Color(0xFF8E24AA)), KidItem('●', 'Black', 'أسود', color: Color(0xFF212121)), KidItem('●', 'Brown', 'بني', color: Color(0xFF6D4C41)),
  ]),
  KidUnit('ani', '🦁', 'الحيوانات', 'حيوانات المزرعة والغابة', [
    KidItem('🐱', 'Cat', 'قطة'), KidItem('🐶', 'Dog', 'كلب'), KidItem('🐮', 'Cow', 'بقرة'), KidItem('🐴', 'Horse', 'حصان'), KidItem('🐑', 'Sheep', 'خروف'),
    KidItem('🐔', 'Chicken', 'دجاجة'), KidItem('🦁', 'Lion', 'أسد'), KidItem('🐘', 'Elephant', 'فيل'), KidItem('🐵', 'Monkey', 'قرد'), KidItem('🐦', 'Bird', 'طائر'),
  ]),
  KidUnit('fam', '👨‍👩‍👧', 'عائلتي', 'أفراد الأسرة', [
    KidItem('👨', 'Father', 'أب'), KidItem('👩', 'Mother', 'أم'), KidItem('👦', 'Brother', 'أخ'), KidItem('👧', 'Sister', 'أخت'),
    KidItem('👴', 'Grandfather', 'جد'), KidItem('👵', 'Grandmother', 'جدة'), KidItem('👶', 'Baby', 'طفل رضيع'),
  ]),
  KidUnit('body', '🖐️', 'جسمي', 'أعضاء الجسم', [
    KidItem('👁️', 'Eye', 'عين'), KidItem('👂', 'Ear', 'أذن'), KidItem('👃', 'Nose', 'أنف'), KidItem('👄', 'Mouth', 'فم'),
    KidItem('🖐️', 'Hand', 'يد'), KidItem('🦶', 'Foot', 'قدم'), KidItem('🦷', 'Tooth', 'سن'), KidItem('💇', 'Hair', 'شعر'),
  ]),
  KidUnit('food', '🍎', 'الطعام', 'ماذا نأكل ونشرب؟', [
    KidItem('🍎', 'Apple', 'تفاحة'), KidItem('🍌', 'Banana', 'موزة'), KidItem('🍞', 'Bread', 'خبز'), KidItem('🥛', 'Milk', 'حليب'), KidItem('🧀', 'Cheese', 'جبن'),
    KidItem('🥚', 'Egg', 'بيضة'), KidItem('🍚', 'Rice', 'أرز'), KidItem('💧', 'Water', 'ماء'), KidItem('🍰', 'Cake', 'كعكة'),
  ]),
  KidUnit('home', '🏠', 'في البيت والمدرسة', 'أشياء حولنا', [
    KidItem('🚪', 'Door', 'باب'), KidItem('🪟', 'Window', 'نافذة'), KidItem('🛏️', 'Bed', 'سرير'), KidItem('🪑', 'Chair', 'كرسي'),
    KidItem('📕', 'Book', 'كتاب'), KidItem('✏️', 'Pencil', 'قلم رصاص'), KidItem('🎒', 'Bag', 'حقيبة'), KidItem('🕐', 'Clock', 'ساعة'),
  ]),
  KidUnit('say', '💬', 'جمل قصيرة', 'أول جمل نقولها', [
    KidItem('👋', 'Hello!', 'مرحباً'), KidItem('🙂', 'My name is Adam.', 'اسمي آدم', say: 'My name is Adam.'), KidItem('🙏', 'Thank you.', 'شكراً'),
    KidItem('😊', 'I am happy.', 'أنا سعيد'), KidItem('🍎', 'I like apples.', 'أحب التفاح'), KidItem('❓', 'What is this?', 'ما هذا؟'),
    KidItem('🌙', 'Good night.', 'تصبح على خير'), KidItem('👋', 'Goodbye!', 'مع السلامة'),
  ]),
];

class KidsCourseScreen extends StatelessWidget {
  const KidsCourseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) {
        final s = AppStore.I;
        final done = kidUnits.where((u) => s.count('ku:${u.id}') > 0).length;
        return Scaffold(
          appBar: AppBar(title: const Text('منهج مغرّد الصغير')),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              Text('أكملت $done من ${kidUnits.length} وحدات', style: const TextStyle(fontWeight: FontWeight.w800, color: kMuted)),
              const SizedBox(height: 10),
              for (var i = 0; i < kidUnits.length; i++)
                ActivityTile(
                  emoji: s.count('ku:${kidUnits[i].id}') > 0 ? '✅' : kidUnits[i].emoji,
                  title: '${i + 1}. ${kidUnits[i].titleAr}',
                  subtitle: '${kidUnits[i].aboutAr} · ${kidUnits[i].items.length} كلمات',
                  onTap: () => push(context, KidUnitScreen(unit: kidUnits[i])),
                ),
            ],
          ),
        );
      },
    );
  }
}

class KidUnitScreen extends StatefulWidget {
  const KidUnitScreen({super.key, required this.unit});
  final KidUnit unit;

  @override
  State<KidUnitScreen> createState() => _KidUnitScreenState();
}

class _KidUnitScreenState extends State<KidUnitScreen> with TimedState<KidUnitScreen> {
  /// 0 تعلّم، 1 اختبار، 2 النهاية
  int _phase = 0;
  int _i = 0;
  late List<KidItem> _quiz;
  List<KidItem> _options = [];
  int? _picked;
  int _score = 0;

  List<KidItem> get _items => widget.unit.items;

  @override
  void initState() {
    super.initState();
    _quiz = List<KidItem>.from(_items)..shuffle();
    if (_quiz.length > 6) _quiz = _quiz.sublist(0, 6);
    WidgetsBinding.instance.addPostFrameCallback((_) => _speak(_items[0]));
  }

  void _speak(KidItem k) => Speech.I.say(k.say.isEmpty ? k.en : k.say, rate: 0.36);

  void _nextCard() {
    if (_i + 1 < _items.length) {
      setState(() => _i++);
      _speak(_items[_i]);
    } else {
      setState(() {
        _phase = 1;
        _i = 0;
        _prepareQuiz();
      });
      Speech.I.say(_quiz[0].en, rate: 0.36);
    }
  }

  void _prepareQuiz() {
    final target = _quiz[_i];
    final others = _items.where((x) => x.en != target.en).toList()..shuffle();
    _options = <KidItem>[target, ...others.take(2)]..shuffle();
    _picked = null;
  }

  void _pick(int k) {
    if (_picked != null) return;
    final ok = _options[k].en == _quiz[_i].en;
    setState(() => _picked = k);
    if (ok) {
      _score++;
      AppStore.I.addStars(1);
    }
    Speech.I.say(_quiz[_i].en, rate: 0.36);
  }

  void _nextQuiz() {
    if (_i + 1 < _quiz.length) {
      setState(() {
        _i++;
        _prepareQuiz();
      });
      Speech.I.say(_quiz[_i].en, rate: 0.36);
    } else {
      setState(() => _phase = 2);
      if (_score * 2 >= _quiz.length) AppStore.I.bump('ku:${widget.unit.id}');
    }
  }

  Widget _visual(KidItem k, double size) {
    return Text(k.show, textDirection: TextDirection.ltr, style: TextStyle(fontSize: size, fontWeight: FontWeight.w900, color: k.color ?? kInk, height: 1.1));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.unit.titleAr)),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: _phase == 0 ? _learn() : (_phase == 1 ? _test() : _end()),
        ),
      ),
    );
  }

  Widget _learn() {
    final k = _items[_i];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('تعلّم · ${_i + 1} من ${_items.length}', textAlign: TextAlign.center, style: const TextStyle(color: kMuted, fontWeight: FontWeight.w800)),
        const Spacer(),
        Center(child: _visual(k, 110)),
        const SizedBox(height: 10),
        Text(k.en, textAlign: TextAlign.center, textDirection: TextDirection.ltr, style: const TextStyle(fontSize: 38, fontWeight: FontWeight.w900, color: kTeal)),
        Text(k.ar, textAlign: TextAlign.center, style: const TextStyle(fontSize: 22, color: kMuted)),
        const SizedBox(height: 14),
        Center(
          child: Material(
            color: kCoral,
            shape: const CircleBorder(),
            clipBehavior: Clip.antiAlias,
            child: InkWell(onTap: () => _speak(k), child: const SizedBox(width: 76, height: 76, child: Icon(Icons.volume_up_rounded, color: Colors.white, size: 40))),
          ),
        ),
        const Spacer(),
        FilledButton(onPressed: _nextCard, child: Text(_i + 1 < _items.length ? 'التالي' : 'هيا نختبر أنفسنا!')),
      ],
    );
  }

  Widget _test() {
    final target = _quiz[_i];
    final answered = _picked != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('اختبار · ${_i + 1} من ${_quiz.length} · ⭐ $_score', textAlign: TextAlign.center, style: const TextStyle(color: kMuted, fontWeight: FontWeight.w800)),
        const Spacer(),
        const Text('اسمع واختر', textAlign: TextAlign.center, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
        const SizedBox(height: 12),
        Center(
          child: Material(
            color: kTeal,
            shape: const CircleBorder(),
            clipBehavior: Clip.antiAlias,
            child: InkWell(onTap: () => Speech.I.say(target.en, rate: 0.36), child: const SizedBox(width: 84, height: 84, child: Icon(Icons.volume_up_rounded, color: Colors.white, size: 44))),
          ),
        ),
        const SizedBox(height: 22),
        Row(
          textDirection: TextDirection.ltr,
          children: [
            for (var k = 0; k < _options.length; k++)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 5),
                  child: Material(
                    color: !answered ? Colors.white : (_options[k].en == target.en ? kOkBg : (k == _picked ? kBadBg : Colors.white)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: kLine)),
                    clipBehavior: Clip.antiAlias,
                    child: InkWell(
                      onTap: answered ? null : () => _pick(k),
                      child: Container(
                        height: 110,
                        alignment: Alignment.center,
                        padding: const EdgeInsets.all(4),
                        child: FittedBox(child: _visual(_options[k], 46)),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 14),
        if (answered) Text('${target.en} = ${target.ar}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
        const Spacer(),
        if (answered) FilledButton(onPressed: _nextQuiz, child: const Text('التالي')),
      ],
    );
  }

  Widget _end() {
    final passed = _score * 2 >= _quiz.length;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Spacer(),
        Text(passed ? '🏆' : '💪', textAlign: TextAlign.center, style: const TextStyle(fontSize: 100)),
        Text(passed ? 'أحسنت! أكملت الوحدة' : 'حاول مرة أخرى', textAlign: TextAlign.center, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
        Text('$_score من ${_quiz.length}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 20, color: kMuted)),
        const Spacer(),
        FilledButton(onPressed: () => Navigator.of(context).pop(), child: const Text('العودة للمنهج')),
      ],
    );
  }
}

// =====================================================================
// ركن ولي الأمر
// =====================================================================

class ParentCornerScreen extends StatelessWidget {
  const ParentCornerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppStore.I,
      builder: (context, _) {
        final s = AppStore.I;
        final week = s.lastDaysSeconds(7);
        final limit = s.count('kidLimit');
        final units = kidUnits.where((u) => s.count('ku:${u.id}') > 0).toList();
        final maxSec = week.fold<int>(60, (a, b) => a > b ? a : b);
        return Scaffold(
          appBar: AppBar(title: const Text('ركن ولي الأمر')),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('تقرير طفلك', style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.w800, color: kInk)),
                    const SizedBox(height: 8),
                    Text(
                      'اليوم: ${s.todayMinutes} دقيقة\n'
                      'آخر 7 أيام: ${week.fold<int>(0, (a, b) => a + b) ~/ 60} دقيقة في ${week.where((x) => x >= 60).length} أيام\n'
                      'سلسلة الأيام: ${s.streak}\n'
                      'النجوم: ${s.stars}\n'
                      'وحدات المنهج المكتملة: ${units.length} من ${kidUnits.length}\n'
                      'قصص مقروءة: ${s.storiesRead}',
                      style: const TextStyle(height: 1.9, color: kInk),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      height: 70,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          for (final sec in week)
                            Expanded(
                              child: Container(
                                height: 6 + 60 * (sec / maxSec),
                                margin: const EdgeInsets.symmetric(horizontal: 6),
                                decoration: BoxDecoration(color: sec > 0 ? kTeal : kLine, borderRadius: BorderRadius.circular(6)),
                              ),
                            ),
                        ],
                      ),
                    ),
                    if (units.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      Text('أتقن: ${units.map((u) => u.titleAr).join('، ')}', style: const TextStyle(color: kMuted, height: 1.6)),
                    ],
                  ],
                ),
              ),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('حد وقت اللعب اليومي', style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.w800, color: kInk)),
                    const Text('عند بلوغه تُقفل الألعاب حتى الغد.', style: TextStyle(color: kMuted, fontSize: 13)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: [
                        for (final m in const [0, 10, 20, 30, 45])
                          ChoiceChip(label: Text(m == 0 ? 'بلا حد' : '$m دقيقة'), selected: limit == m, onSelected: (_) => s.setCount('kidLimit', m)),
                      ],
                    ),
                  ],
                ),
              ),
              const AppCard(
                color: kTint,
                child: Text(
                  'نصائح: 10 إلى 15 دقيقة يومياً أفضل من ساعة في يوم واحد. اجلس مع طفلك في أول الوحدات وردّد معه. امدح المحاولة لا النتيجة.',
                  style: TextStyle(color: kInk, height: 1.7),
                ),
              ),
              OutlinedButton(onPressed: () => push(context, const SettingsScreen()), child: const Text('الإعدادات والحساب وتبديل القسم')),
            ],
          ),
        );
      },
    );
  }
}
