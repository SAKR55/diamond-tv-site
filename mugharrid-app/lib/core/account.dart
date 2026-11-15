import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../firebase_options.dart';
import 'store.dart';

/// وسيلة التواصل التي تظهر للمستخدم ليطلب كود الاشتراك. غيّرها إلى رقمك.
const kContactInfo = 'واتساب: +966507844688';

/// رقم واتساب للتواصل (بصيغة دولية بلا + ولا مسافات) والبريد.
const kWhatsApp = '966507844688';
const kSalesEmail = 'sales@diamond-tv.shop';

/// مدة التجربة المجانية بالأيام، تُحسب من تاريخ إنشاء الحساب في Firebase.
const kTrialDays = 7;

/// حساب المستخدم والاشتراك (Firebase Authentication + Firestore).
///
/// الاشتراك بالأكواد: أنت تنشئ الكود في قاعدة البيانات (مجموعة codes)، وترسله للمستخدم بعد التواصل.
/// المستخدم يدخله في التطبيق فيُربط بحسابه مرة واحدة ولا يصلح لغيره.
/// مدة الاشتراك تُحسب من الكود نفسه (حقل days)، فلا يستطيع المستخدم تزويرها.
class Account extends ChangeNotifier {
  Account._();
  static final Account I = Account._();
  static const _prefKey = 'bulbul_premium_until';

  bool ready = false;
  String initError = '';
  User? user;
  String name = '';
  String phone = '';
  String code = '';
  DateTime? premiumUntil;

  FirebaseFirestore get _db => FirebaseFirestore.instance;

  bool get signedIn => user != null;
  bool get isPremium => premiumUntil != null && premiumUntil!.isAfter(DateTime.now());
  /// نهاية التجربة المجانية: تاريخ إنشاء الحساب على الخادم + 7 أيام (لا يتغير بإعادة تثبيت التطبيق).
  DateTime? get trialEnds {
    final created = user?.metadata.creationTime;
    return created?.add(const Duration(days: kTrialDays));
  }

  bool get inTrial => trialEnds != null && trialEnds!.isAfter(DateTime.now());
  int get trialDaysLeft => inTrial ? trialEnds!.difference(DateTime.now()).inHours ~/ 24 + 1 : 0;

  /// يستطيع استخدام التطبيق: مشترك أو ما زال في التجربة المجانية.
  /// التطبيق مجاني بالكامل: لا تجربة ولا اشتراك. الدخول بحساب فقط لميزات الأصدقاء وحفظ التقدم.
  bool get hasAccess => true;

  /// الإدارة أوقفت هذا الحساب من لوحة التحكم.
  bool blocked = false;

  int get daysLeft => isPremium ? premiumUntil!.difference(DateTime.now()).inDays + 1 : 0;

  Future<void> init() async {
    try {
      await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
      final prefs = await SharedPreferences.getInstance();
      final ms = prefs.getInt(_prefKey) ?? 0;
      if (ms > 0) premiumUntil = DateTime.fromMillisecondsSinceEpoch(ms);
      user = FirebaseAuth.instance.currentUser;
      FirebaseAuth.instance.authStateChanges().listen((u) {
        user = u;
        if (u == null) {
          name = '';
          phone = '';
          code = '';
          _setPremium(null);
        }
        notifyListeners();
        if (u != null) refresh();
      });
    } catch (e) {
      initError = e.toString();
    }
    ready = true;
    notifyListeners();
  }

  Future<void> _setPremium(DateTime? until) async {
    premiumUntil = until;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_prefKey, until?.millisecondsSinceEpoch ?? 0);
    } catch (_) {}
  }

  /// يقرأ بيانات الحساب وحالة الاشتراك من الخادم، ثم يرفع ملخص التقدم لتراه في لوحة Firebase.
  Future<void> refresh() async {
    final u = user;
    if (u == null) return;
    try {
      final snap = await _db.collection('users').doc(u.uid).get();
      final d = snap.data() ?? <String, dynamic>{};
      name = (d['name'] ?? u.displayName ?? '').toString();
      phone = (d['phone'] ?? '').toString();
      code = (d['code'] ?? '').toString();
      blocked = d['blocked'] == true;
      if (code.isNotEmpty) {
        final c = await _db.collection('codes').doc(code).get();
        final cd = c.data();
        if (cd != null && cd['usedBy'] == u.uid && cd['usedAt'] is Timestamp) {
          final days = (cd['days'] as num?)?.toInt() ?? 30;
          await _setPremium((cd['usedAt'] as Timestamp).toDate().add(Duration(days: days)));
        } else if (cd == null || cd['usedBy'] != u.uid) {
          // الكود حُذف أو سُحب من هذا الحساب: ينتهي الاشتراك.
          await _setPremium(null);
        }
      } else {
        await _setPremium(null);
      }
      notifyListeners();
      await syncProgress();
      await _publishProfile();
    } catch (_) {
      // بلا إنترنت: نبقى على آخر حالة محفوظة.
    }
  }

  /// ينشر الاسم وكود الصداقة ليستطيع الأصدقاء إضافتك.
  Future<void> _publishProfile() async {
    final u = user;
    if (u == null || u.uid.length < 6) return;
    try {
      await _db.collection('profiles').doc(u.uid).set({
        'name': name.isEmpty ? 'صديق' : name,
        'code': u.uid.substring(0, 6).toUpperCase(),
        'level': AppStore.I.level,
      }, SetOptions(merge: true));
    } catch (_) {}
  }

  Future<void> syncProgress() async {
    final u = user;
    if (u == null) return;
    final s = AppStore.I;
    try {
      await _db.collection('users').doc(u.uid).set({
        'email': u.email ?? '',
        'section': s.section,
        'level': s.level,
        'streak': s.streak,
        'xp': s.xp,
        'minutes': s.totalSeconds ~/ 60,
        'premium': isPremium,
        'premiumUntil': premiumUntil == null ? null : Timestamp.fromDate(premiumUntil!),
        'lastActive': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    } catch (_) {}
  }

  String _authError(FirebaseAuthException e) {
    switch (e.code) {
      case 'email-already-in-use':
        return 'هذا البريد مسجل من قبل. جرّب تسجيل الدخول.';
      case 'invalid-email':
        return 'البريد الإلكتروني غير صحيح.';
      case 'weak-password':
        return 'كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.';
      case 'user-not-found':
      case 'wrong-password':
      case 'invalid-credential':
        return 'البريد أو كلمة المرور غير صحيحة.';
      case 'network-request-failed':
        return 'لا يوجد اتصال بالإنترنت.';
      case 'too-many-requests':
        return 'محاولات كثيرة. انتظر قليلاً ثم حاول.';
      default:
        return 'تعذر إتمام العملية (${e.code}).';
    }
  }

  /// كل الدوال التالية ترجع null عند النجاح، أو رسالة خطأ بالعربية.
  Future<String?> signUp({required String name, required String phone, required String email, required String password}) async {
    try {
      final cred = await FirebaseAuth.instance.createUserWithEmailAndPassword(email: email.trim(), password: password);
      final u = cred.user;
      if (u == null) return 'تعذر إنشاء الحساب.';
      await u.updateDisplayName(name.trim());
      await _db.collection('users').doc(u.uid).set({
        'name': name.trim(),
        'phone': phone.trim(),
        'email': email.trim(),
        'createdAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
      user = u;
      await refresh();
      return null;
    } on FirebaseAuthException catch (e) {
      return _authError(e);
    } catch (_) {
      return 'حدث خطأ. حاول مرة أخرى.';
    }
  }

  Future<String?> signIn({required String email, required String password}) async {
    try {
      await FirebaseAuth.instance.signInWithEmailAndPassword(email: email.trim(), password: password);
      return null;
    } on FirebaseAuthException catch (e) {
      return _authError(e);
    } catch (_) {
      return 'حدث خطأ. حاول مرة أخرى.';
    }
  }

  Future<String?> resetPassword(String email) async {
    try {
      await FirebaseAuth.instance.sendPasswordResetEmail(email: email.trim());
      return null;
    } on FirebaseAuthException catch (e) {
      return _authError(e);
    } catch (_) {
      return 'حدث خطأ. حاول مرة أخرى.';
    }
  }

  Future<void> signOut() async {
    try {
      await FirebaseAuth.instance.signOut();
    } catch (_) {}
  }

  /// يفعّل كود الاشتراك لهذا الحساب.
  Future<String?> redeem(String raw) async {
    final u = user;
    if (u == null) return 'سجّل الدخول أولاً.';
    final c = raw.trim().toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
    if (c.length < 6) return 'الكود غير صحيح.';
    try {
      final ref = _db.collection('codes').doc(c);
      final err = await _db.runTransaction<String?>((tx) async {
        final snap = await tx.get(ref);
        final d = snap.data();
        if (!snap.exists || d == null) return 'الكود غير موجود. تأكد من كتابته.';
        final usedBy = (d['usedBy'] ?? '').toString();
        if (usedBy.isNotEmpty && usedBy != u.uid) return 'هذا الكود مستخدم من حساب آخر.';
        if (usedBy.isEmpty) {
          tx.update(ref, {'usedBy': u.uid, 'usedAt': FieldValue.serverTimestamp(), 'usedEmail': u.email ?? ''});
        }
        tx.set(_db.collection('users').doc(u.uid), {'code': c}, SetOptions(merge: true));
        return null;
      });
      if (err != null) return err;
      await refresh();
      return isPremium ? null : 'فُعّل الكود لكن مدته منتهية.';
    } on FirebaseException catch (e) {
      return e.code == 'permission-denied' ? 'الكود غير صالح.' : 'تعذر الاتصال. تحقق من الإنترنت.';
    } catch (_) {
      return 'حدث خطأ. حاول مرة أخرى.';
    }
  }
}
