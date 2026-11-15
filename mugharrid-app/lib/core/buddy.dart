import 'dart:math';

import 'package:cloud_firestore/cloud_firestore.dart';

import 'account.dart';
import 'store.dart';

/// التدرب مع صديق: إضافة الأصدقاء بالكود، غرف المحادثة، وإشارات المكالمة الصوتية.
/// كل شيء عبر Firestore:
///   profiles/{uid}            الاسم وكود الصداقة (يقرؤه أي مستخدم مسجل ليضيفك)
///   rooms/{a_b}               غرفة بين شخصين: الأعضاء، آخر رسالة، وحالة المكالمة
///   rooms/{a_b}/messages      الرسائل
///   rooms/{a_b}/candidates    عناوين الاتصال للمكالمة (WebRTC)
class Buddy {
  static FirebaseFirestore get _db => FirebaseFirestore.instance;
  static String get uid => Account.I.user?.uid ?? '';

  /// كود الصداقة: 6 خانات ثابتة مشتقة من معرّف الحساب.
  static String get myCode => uid.length < 6 ? '' : uid.substring(0, 6).toUpperCase();

  static String get myName => Account.I.name.isEmpty ? 'صديق' : Account.I.name;

  static Future<void> publishProfile() async {
    if (uid.isEmpty) return;
    try {
      await _db.collection('profiles').doc(uid).set({'name': myName, 'code': myCode, 'level': AppStore.I.level}, SetOptions(merge: true));
    } catch (_) {}
  }

  static String roomId(String a, String b) => a.compareTo(b) < 0 ? '${a}_$b' : '${b}_$a';

  static DocumentReference<Map<String, dynamic>> room(String id) => _db.collection('rooms').doc(id);

  static Stream<QuerySnapshot<Map<String, dynamic>>> myRooms() => _db.collection('rooms').where('members', arrayContains: uid).snapshots();

  /// يضيف صديقاً بكوده. يرجع null عند النجاح أو رسالة خطأ.
  static Future<String?> addFriend(String raw) async {
    final code = raw.trim().toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
    if (uid.isEmpty) return 'سجّل الدخول أولاً.';
    if (code.length == 7 && code.startsWith('G')) return joinGroup(code);
    if (code.length != 6) return 'كود الصداقة 6 خانات، ورمز المجموعة 7 خانات يبدأ بحرف G.';
    if (code == myCode) return 'هذا كودك أنت.';
    try {
      await publishProfile();
      final q = await _db.collection('profiles').where('code', isEqualTo: code).limit(1).get();
      if (q.docs.isEmpty) return 'لا يوجد مستخدم بهذا الكود.';
      final other = q.docs.first;
      await room(roomId(uid, other.id)).set({
        'members': [uid, other.id],
        'names': {uid: myName, other.id: (other.data()['name'] ?? 'صديق').toString()},
        'lastAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
      return null;
    } catch (_) {
      return 'تعذر الاتصال. تحقق من الإنترنت.';
    }
  }

  /// ينشئ مجموعة دراسية ويرجع رمز الدعوة، أو null عند الفشل.
  static Future<String?> createGroup(String title) async {
    if (uid.isEmpty) return null;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    final rnd = Random();
    final code = 'G${List.generate(6, (_) => chars[rnd.nextInt(chars.length)]).join()}';
    try {
      final ref = _db.collection('rooms').doc();
      await ref.set({
        'group': true,
        'title': title.trim().isEmpty ? 'مجموعة دراسية' : title.trim(),
        'invite': code,
        'members': [uid],
        'names': {uid: myName},
        'lastAt': FieldValue.serverTimestamp(),
      });
      await _db.collection('invites').doc(code).set({'roomId': ref.id, 'by': uid});
      return code;
    } catch (_) {
      return null;
    }
  }

  /// ينضم إلى مجموعة برمز الدعوة (يبدأ بحرف G وطوله 7). يرجع null عند النجاح.
  static Future<String?> joinGroup(String code) async {
    try {
      final inv = await _db.collection('invites').doc(code).get();
      final roomId = (inv.data()?['roomId'] ?? '').toString();
      if (roomId.isEmpty) return 'رمز الدعوة غير موجود.';
      await room(roomId).update({
        'members': FieldValue.arrayUnion([uid]),
        'names.$uid': myName,
        'lastAt': FieldValue.serverTimestamp(),
      });
      return null;
    } catch (_) {
      return 'تعذر الانضمام. قد تكون المجموعة ممتلئة (20 عضواً) أو الاتصال ضعيفاً.';
    }
  }

  static Future<void> send(String roomId, String text, {String answer = ''}) async {
    final t = text.trim();
    if (t.isEmpty || uid.isEmpty) return;
    final r = room(roomId);
    await r.collection('messages').add({
      'from': uid,
      'name': myName,
      'text': t,
      if (answer.isNotEmpty) 'type': 'challenge',
      if (answer.isNotEmpty) 'answer': answer,
      'at': FieldValue.serverTimestamp(),
    });
    await r.set({'lastText': t, 'lastAt': FieldValue.serverTimestamp()}, SetOptions(merge: true));
    AppStore.I.bump('buddy_msg');
  }

  static Future<void> removeFriend(String roomId) async {
    try {
      await room(roomId).delete();
    } catch (_) {}
  }
}
