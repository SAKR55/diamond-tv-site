import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/account.dart';
import '../ui/common.dart';

/// التطبيق مجاني: تعيد true دائماً (أُبقيت للتوافق).
bool requirePremium(BuildContext context) {
  if (Account.I.hasAccess) return true;
  push(context, const AccountScreen());
  return false;
}

/// يفتح محادثة واتساب مباشرة مع رسالة جاهزة. إن تعذر الفتح ينسخ الرقم.
Future<void> openWhatsApp(BuildContext context) async {
  final msg = Uri.encodeComponent('مرحباً، عندي ملاحظة على تطبيق $kAppName. بريدي: ${Account.I.user?.email ?? ''}');
  try {
    final ok = await launchUrl(Uri.parse('https://wa.me/$kWhatsApp?text=$msg'), mode: LaunchMode.externalApplication);
    if (ok) return;
  } catch (_) {}
  await Clipboard.setData(const ClipboardData(text: '+$kWhatsApp'));
  if (context.mounted) toast(context, 'نُسخ رقم الواتساب: +$kWhatsApp');
}

Future<void> openEmail(BuildContext context) async {
  try {
    final ok = await launchUrl(Uri.parse('mailto:$kSalesEmail?subject=${Uri.encodeComponent('ملاحظة على $kAppName')}'), mode: LaunchMode.externalApplication);
    if (ok) return;
  } catch (_) {}
  await Clipboard.setData(const ClipboardData(text: kSalesEmail));
  if (context.mounted) toast(context, 'نُسخ البريد: $kSalesEmail');
}

// =====================================================================
// تسجيل الدخول وإنشاء الحساب
// =====================================================================

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _pass = TextEditingController();
  bool _register = true;
  bool _busy = false;
  String _error = '';

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _email.dispose();
    _pass.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_busy) return;
    if (_email.text.trim().isEmpty || _pass.text.isEmpty || (_register && (_name.text.trim().isEmpty || _phone.text.trim().isEmpty))) {
      setState(() => _error = 'أكمل كل الخانات.');
      return;
    }
    setState(() {
      _busy = true;
      _error = '';
    });
    final err = _register
        ? await Account.I.signUp(name: _name.text, phone: _phone.text, email: _email.text, password: _pass.text)
        : await Account.I.signIn(email: _email.text, password: _pass.text);
    if (!mounted) return;
    setState(() {
      _busy = false;
      _error = err ?? '';
    });
  }

  Future<void> _forgot() async {
    if (_email.text.trim().isEmpty) {
      setState(() => _error = 'اكتب بريدك أولاً ثم اضغط «نسيت كلمة المرور».');
      return;
    }
    final err = await Account.I.resetPassword(_email.text);
    if (!mounted) return;
    toast(context, err ?? 'أرسلنا رابط تغيير كلمة المرور إلى بريدك.');
  }

  Widget _field(TextEditingController c, String label, {bool ltr = false, bool secret = false, TextInputType? type}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: c,
        obscureText: secret,
        keyboardType: type,
        textDirection: ltr ? TextDirection.ltr : null,
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0xFF5A48DC), kInk])),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(22, 30, 22, 24),
            children: [
              const Row(
                children: [
                  BulbulLogo(size: 56, onDark: true),
                  SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(kAppName, style: TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900, height: 1.1)),
                      Text(kAppSlogan, style: TextStyle(color: kGold, fontSize: 14, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 28),
              Text(_register ? 'أنشئ حسابك' : 'تسجيل الدخول', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
              const SizedBox(height: 14),
              if (Account.I.initError.isNotEmpty)
                const FeedbackBox(ok: false, text: 'خدمة الحسابات غير مهيأة في هذه النسخة. راجع ملف FIREBASE_AR.md.'),
              if (_register) _field(_name, 'الاسم'),
              if (_register) _field(_phone, 'رقم الجوال (واتساب)', ltr: true, type: TextInputType.phone),
              _field(_email, 'البريد الإلكتروني', ltr: true, type: TextInputType.emailAddress),
              _field(_pass, 'كلمة المرور', ltr: true, secret: true),
              if (_error.isNotEmpty) FeedbackBox(ok: false, text: _error),
              FilledButton(
                style: FilledButton.styleFrom(backgroundColor: kCoral),
                onPressed: _busy ? null : _submit,
                child: _busy ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white)) : Text(_register ? 'إنشاء الحساب' : 'دخول'),
              ),
              const SizedBox(height: 6),
              TextButton(
                onPressed: () => setState(() {
                  _register = !_register;
                  _error = '';
                }),
                child: Text(_register ? 'عندي حساب · تسجيل الدخول' : 'ليس عندي حساب · إنشاء حساب', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
              ),
              if (!_register) TextButton(onPressed: _forgot, child: const Text('نسيت كلمة المرور', style: TextStyle(color: Colors.white70))),
            ],
          ),
        ),
      ),
    );
  }
}

// =====================================================================
// حسابي
// =====================================================================

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key, this.locked = false});

  /// true عند انتهاء التجربة بلا اشتراك: تظهر الشاشة مكان التطبيق ولا يمكن تجاوزها.
  final bool locked;

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  @override
  void initState() {
    super.initState();
    Account.I.refresh();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Account.I,
      builder: (context, _) {
        final a = Account.I;
        return Scaffold(
          appBar: AppBar(title: const Text('حسابي')),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(a.name.isEmpty ? 'مستخدم مغرّد' : a.name, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w900, color: kInk)),
                    Text(a.user?.email ?? '', textDirection: TextDirection.ltr, style: const TextStyle(color: kMuted)),
                    if (a.phone.isNotEmpty) Text(a.phone, textDirection: TextDirection.ltr, style: const TextStyle(color: kMuted)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.all(18),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF6A56E8), Color(0xFF3A2BA8)]),
                  borderRadius: BorderRadius.circular(22),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('مغرّد مجاني بالكامل 🎉', style: TextStyle(color: Colors.white, fontSize: 21, fontWeight: FontWeight.w900)),
                    SizedBox(height: 4),
                    Text('كل الدروس والمحادثات والقراءة والبودكاست والكتب الصوتية ومقابلات العمل مفتوحة لك بلا اشتراك ولا أكواد.', style: TextStyle(color: Colors.white70, height: 1.6)),
                  ],
                ),
              ),
              AppCard(
                color: const Color(0xFFFFF6DC),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('اقتراح أو مشكلة؟', style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF7A5A00))),
                    const SizedBox(height: 4),
                    const Text('يسعدنا سماع رأيك لنطوّر التطبيق:', style: TextStyle(color: kInk)),
                    const SizedBox(height: 10),
                    FilledButton.icon(
                      style: FilledButton.styleFrom(backgroundColor: const Color(0xFF25D366)),
                      onPressed: () => openWhatsApp(context),
                      icon: const Icon(Icons.chat_rounded),
                      label: const Text('تواصل عبر واتساب'),
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton.icon(onPressed: () => openEmail(context), icon: const Icon(Icons.email_outlined), label: const Text(kSalesEmail)),
                  ],
                ),
              ),
              OutlinedButton(
                onPressed: () async {
                  if (!widget.locked) Navigator.of(context).popUntil((route) => route.isFirst);
                  await Account.I.signOut();
                },
                child: const Text('تسجيل الخروج'),
              ),
            ],
          ),
        );
      },
    );
  }
}
