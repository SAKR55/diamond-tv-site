import 'dart:async';
import 'dart:math';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';

import '../core/buddy.dart';
import '../core/coach.dart';
import '../core/store.dart';
import '../data/content.dart';
import '../ui/common.dart';

// =====================================================================
// قائمة الأصدقاء
// =====================================================================

class FriendsScreen extends StatefulWidget {
  const FriendsScreen({super.key});

  @override
  State<FriendsScreen> createState() => _FriendsScreenState();
}

class _FriendsScreenState extends State<FriendsScreen> {
  final _code = TextEditingController();
  bool _busy = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    Buddy.publishProfile();
  }

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  Future<void> _add() async {
    if (_busy) return;
    setState(() {
      _busy = true;
      _error = '';
    });
    final err = await Buddy.addFriend(_code.text);
    if (!mounted) return;
    setState(() {
      _busy = false;
      _error = err ?? '';
    });
    if (err == null) {
      _code.clear();
      FocusScope.of(context).unfocus();
      toast(context, 'أُضيف الصديق. ابدأ المحادثة!');
    }
  }

  Future<void> _newGroup() async {
    final ctrl = TextEditingController();
    final title = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('مجموعة دراسية جديدة'),
        content: TextField(controller: ctrl, decoration: const InputDecoration(hintText: 'اسم المجموعة')),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('إلغاء')),
          TextButton(onPressed: () => Navigator.of(ctx).pop(ctrl.text), child: const Text('إنشاء')),
        ],
      ),
    );
    if (title == null || !mounted) return;
    final code = await Buddy.createGroup(title);
    if (!mounted) return;
    if (code == null) {
      toast(context, 'تعذر إنشاء المجموعة. تحقق من الإنترنت.');
    } else {
      await Clipboard.setData(ClipboardData(text: code));
      if (mounted) toast(context, 'أُنشئت المجموعة. رمز الدعوة $code نُسخ، أرسله لأصدقائك.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تدرّب مع صديق')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          AppCard(
            color: kTint,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('كود صداقتك', style: TextStyle(fontWeight: FontWeight.w800, color: kTeal, fontSize: 13)),
                Row(
                  children: [
                    Expanded(child: SelectableText(Buddy.myCode, textDirection: TextDirection.ltr, style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900, letterSpacing: 4, color: kInk))),
                    IconButton(
                      tooltip: 'نسخ',
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: Buddy.myCode));
                        toast(context, 'نُسخ الكود');
                      },
                      icon: const Icon(Icons.copy_rounded, color: kTeal),
                    ),
                  ],
                ),
                const Text('أرسله لصديقك ليضيفك، أو أدخل كوده هنا. لا يظهر حسابك لأحد لا يملك كودك.', style: TextStyle(color: kMuted, fontSize: 12.5, height: 1.6)),
              ],
            ),
          ),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _code,
                  textDirection: TextDirection.ltr,
                  textCapitalization: TextCapitalization.characters,
                  autocorrect: false,
                  decoration: InputDecoration(hintText: 'كود صديق أو رمز مجموعة', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14))),
                ),
              ),
              const SizedBox(width: 8),
              FilledButton(
                style: FilledButton.styleFrom(minimumSize: const Size(90, 54)),
                onPressed: _busy ? null : _add,
                child: Text(_busy ? '...' : 'إضافة'),
              ),
            ],
          ),
          if (_error.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 10), child: FeedbackBox(ok: false, text: _error)),
          const SizedBox(height: 10),
          OutlinedButton.icon(onPressed: _newGroup, icon: const Icon(Icons.groups_rounded), label: const Text('إنشاء مجموعة دراسية برمز دعوة')),
          const SizedBox(height: 16),
          const Text('أصدقائي', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: kMuted)),
          const SizedBox(height: 8),
          StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
            stream: Buddy.myRooms(),
            builder: (context, snap) {
              if (snap.hasError) return const FeedbackBox(ok: false, text: 'تعذر تحميل الأصدقاء. تحقق من الإنترنت ومن قواعد Firestore.');
              if (!snap.hasData) return const Padding(padding: EdgeInsets.all(20), child: Center(child: CircularProgressIndicator()));
              final docs = snap.data!.docs.toList();
              int ms(QueryDocumentSnapshot<Map<String, dynamic>> d) => (d.data()['lastAt'] is Timestamp) ? (d.data()['lastAt'] as Timestamp).millisecondsSinceEpoch : 0;
              docs.sort((a, b) => ms(b).compareTo(ms(a)));
              if (docs.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.only(top: 30),
                  child: Text('لا أصدقاء بعد.\nأضف صديقاً بكوده وتدربا معاً بالكتابة أو بمكالمة صوتية.', textAlign: TextAlign.center, style: TextStyle(color: kMuted, height: 1.8)),
                );
              }
              return Column(
                children: [
                  for (final d in docs)
                    Builder(builder: (context) {
                      final data = d.data();
                      final members = ((data['members'] as List?) ?? []).map((e) => e.toString()).toList();
                      final other = members.firstWhere((m) => m != Buddy.uid, orElse: () => '');
                      final names = data['names'] is Map ? data['names'] as Map : const {};
                      final isGroup = data['group'] == true;
                      final name = isGroup ? (data['title'] ?? 'مجموعة').toString() : (names[other] ?? 'صديق').toString();
                      final call = data['call'] is Map ? data['call'] as Map : const {};
                      final ringing = call['status'] == 'ringing' && call['from'] != Buddy.uid;
                      return ActivityTile(
                        emoji: ringing ? '📞' : (isGroup ? '👥' : '🧑'),
                        title: name,
                        subtitle: ringing
                            ? 'يتصل بك الآن...'
                            : (isGroup ? '${members.length} أعضاء · رمز الدعوة ${data['invite'] ?? ''} · ' : '') + (data['lastText'] ?? 'ابدأ المحادثة').toString(),
                        badge: ringing ? 'مكالمة' : null,
                        onTap: () => push(context, BuddyChatScreen(roomId: d.id, friendName: name)),
                      );
                    }),
                ],
              );
            },
          ),
          const SizedBox(height: 10),
          const Text(
            'المكالمة ترنّ عند صديقك فقط إذا كان التطبيق مفتوحاً عنده. اتفقا على وقت للتدرب.',
            style: TextStyle(color: kMuted, fontSize: 12.5, height: 1.7),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// المحادثة والمكالمة الصوتية
// =====================================================================

class BuddyChatScreen extends StatefulWidget {
  const BuddyChatScreen({super.key, required this.roomId, required this.friendName});
  final String roomId;
  final String friendName;

  @override
  State<BuddyChatScreen> createState() => _BuddyChatScreenState();
}

class _BuddyChatScreenState extends State<BuddyChatScreen> with TimedState<BuddyChatScreen> {
  final _input = TextEditingController();
  final _rnd = Random();
  final Map<String, GrammarHit> _tips = {};
  String _topic = '';
  int _memberCount = 2;
  final Set<String> _revealed = {};

  // ----- حالة المكالمة -----
  StreamSubscription<DocumentSnapshot<Map<String, dynamic>>>? _roomSub;
  StreamSubscription<QuerySnapshot<Map<String, dynamic>>>? _candSub;
  RTCPeerConnection? _pc;
  MediaStream? _mic;
  final List<RTCIceCandidate> _pending = [];
  bool _remoteSet = false;
  String _callId = '';
  String _callState = ''; // '' | calling | incoming | active
  Map _incoming = const {};
  bool _muted = false;
  bool _speaker = true;
  int _seconds = 0;
  Timer? _timer;

  DocumentReference<Map<String, dynamic>> get _room => Buddy.room(widget.roomId);

  @override
  void initState() {
    super.initState();
    _roomSub = _room.snapshots().listen(_onRoom);
  }

  @override
  void dispose() {
    _roomSub?.cancel();
    if (_callState.isNotEmpty) _room.set({'call': {'status': 'ended'}}, SetOptions(merge: true)).catchError((_) {});
    _closeCall();
    _input.dispose();
    super.dispose();
  }

  // ---------- الرسائل ----------

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty) return;
    _input.clear();
    final hit = checkCommonErrors(text);
    if (hit != null) {
      setState(() => _tips[text] = hit);
      AppStore.I.addMistake(kind: 'grammar', prompt: 'جملة كتبتها لصديقك', wrong: text, correct: hit.corrected, note: hit.noteAr);
    }
    try {
      await Buddy.send(widget.roomId, text);
    } catch (_) {
      if (mounted) toast(context, 'لم تُرسل الرسالة. تحقق من الإنترنت.');
    }
  }

  /// تحدي كلمات: يرسل جملة بالعربية، والآخرون يحاولون قولها بالإنجليزية ثم يكشفون الجواب.
  Future<void> _challenge() async {
    final p = phrases[_rnd.nextInt(phrases.length)];
    try {
      await Buddy.send(widget.roomId, 'تحدٍّ: كيف تقول بالإنجليزية «${p.ar}»؟', answer: p.en);
    } catch (_) {
      if (mounted) toast(context, 'لم يُرسل التحدي. تحقق من الإنترنت.');
    }
  }

  void _suggest() {
    final t = minuteTopics[_rnd.nextInt(minuteTopics.length)];
    setState(() => _topic = '${t.en}\n${t.ar}');
  }

  // ---------- المكالمة ----------

  void _onRoom(DocumentSnapshot<Map<String, dynamic>> snap) {
    final data = snap.data();
    if (!mounted || data == null) return;
    final n = (data['members'] as List?)?.length ?? 2;
    if (n != _memberCount) setState(() => _memberCount = n);
    final call = data['call'] is Map ? data['call'] as Map : const {};
    final status = (call['status'] ?? '').toString();
    final from = (call['from'] ?? '').toString();
    final id = (call['id'] ?? '').toString();

    if (status == 'ringing' && from != Buddy.uid && _callState.isEmpty) {
      setState(() {
        _callState = 'incoming';
        _incoming = call;
      });
    } else if (status == 'ended' && _callState.isNotEmpty) {
      _closeCall();
      if (mounted) setState(() {});
    } else if (_callState == 'calling' && id == _callId && call['answer'] is Map && !_remoteSet) {
      final a = call['answer'] as Map;
      _setRemote(RTCSessionDescription(a['sdp'].toString(), a['type'].toString()));
    }
  }

  Future<void> _setRemote(RTCSessionDescription d) async {
    final pc = _pc;
    if (pc == null || _remoteSet) return;
    _remoteSet = true;
    try {
      await pc.setRemoteDescription(d);
      for (final c in _pending) {
        await pc.addCandidate(c);
      }
      _pending.clear();
    } catch (_) {}
  }

  Future<bool> _preparePeer(String callId) async {
    try {
      _callId = callId;
      _remoteSet = false;
      _pending.clear();
      final pc = await createPeerConnection({
        'iceServers': [
          {'urls': ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']},
        ],
      });
      _pc = pc;
      final mic = await navigator.mediaDevices.getUserMedia({'audio': true, 'video': false});
      _mic = mic;
      for (final track in mic.getAudioTracks()) {
        await pc.addTrack(track, mic);
      }
      pc.onIceCandidate = (c) {
        if (c.candidate == null) return;
        _room.collection('candidates').add({'callId': callId, 'from': Buddy.uid, 'candidate': c.candidate, 'sdpMid': c.sdpMid, 'sdpMLineIndex': c.sdpMLineIndex});
      };
      pc.onConnectionState = (state) {
        if (!mounted) return;
        if (state == RTCPeerConnectionState.RTCPeerConnectionStateConnected) {
          _startTimer();
          setState(() => _callState = 'active');
        } else if (state == RTCPeerConnectionState.RTCPeerConnectionStateFailed) {
          toast(context, 'تعذر الاتصال الصوتي على هذه الشبكة. جرّبا شبكة أخرى.');
          _hangUp();
        }
      };
      _candSub = _room.collection('candidates').where('callId', isEqualTo: callId).snapshots().listen((q) {
        for (final ch in q.docChanges) {
          if (ch.type != DocumentChangeType.added) continue;
          final d = ch.doc.data();
          if (d == null || d['from'] == Buddy.uid) continue;
          final cand = RTCIceCandidate(d['candidate']?.toString(), d['sdpMid']?.toString(), (d['sdpMLineIndex'] as num?)?.toInt());
          if (_remoteSet) {
            _pc?.addCandidate(cand);
          } else {
            _pending.add(cand);
          }
        }
      });
      await Helper.setSpeakerphoneOn(_speaker);
      return true;
    } catch (_) {
      _closeCall();
      if (mounted) toast(context, 'تعذر تشغيل الميكروفون. امنح الإذن ثم حاول.');
      return false;
    }
  }

  Future<void> _startCall() async {
    if (_callState.isNotEmpty) return;
    setState(() => _callState = 'calling');
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    if (!await _preparePeer(id)) {
      if (mounted) setState(() {});
      return;
    }
    try {
      final offer = await _pc!.createOffer({'offerToReceiveAudio': true});
      await _pc!.setLocalDescription(offer);
      await _room.set({
        'call': {'id': id, 'from': Buddy.uid, 'status': 'ringing', 'offer': {'sdp': offer.sdp, 'type': offer.type}, 'answer': null},
      }, SetOptions(merge: true));
    } catch (_) {
      _hangUp();
    }
  }

  Future<void> _accept() async {
    final call = _incoming;
    final o = call['offer'] is Map ? call['offer'] as Map : null;
    final id = (call['id'] ?? '').toString();
    if (o == null || id.isEmpty) return;
    setState(() => _callState = 'active');
    if (!await _preparePeer(id)) {
      if (mounted) setState(() {});
      return;
    }
    try {
      await _setRemote(RTCSessionDescription(o['sdp'].toString(), o['type'].toString()));
      final answer = await _pc!.createAnswer({'offerToReceiveAudio': true});
      await _pc!.setLocalDescription(answer);
      await _room.set({
        'call': {'status': 'active', 'answer': {'sdp': answer.sdp, 'type': answer.type}},
      }, SetOptions(merge: true));
    } catch (_) {
      _hangUp();
    }
  }

  Future<void> _hangUp() async {
    final talked = _seconds;
    _closeCall();
    if (mounted) setState(() {});
    if (talked >= 30) AppStore.I.bump('say');
    try {
      await _room.set({'call': {'status': 'ended'}}, SetOptions(merge: true));
    } catch (_) {}
  }

  void _closeCall() {
    _timer?.cancel();
    _timer = null;
    _candSub?.cancel();
    _candSub = null;
    try {
      _mic?.getTracks().forEach((t) => t.stop());
      _mic?.dispose();
      _pc?.close();
    } catch (_) {}
    _mic = null;
    _pc = null;
    _callState = '';
    _incoming = const {};
    _seconds = 0;
    _muted = false;
  }

  void _startTimer() {
    if (_timer != null) return;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _seconds++);
    });
  }

  void _toggleMute() {
    setState(() => _muted = !_muted);
    for (final t in _mic?.getAudioTracks() ?? <MediaStreamTrack>[]) {
      t.enabled = !_muted;
    }
  }

  void _toggleSpeaker() {
    setState(() => _speaker = !_speaker);
    Helper.setSpeakerphoneOn(_speaker);
  }

  // ---------- الواجهة ----------

  Widget _callBar() {
    if (_callState == 'incoming') {
      return Container(
        color: kOkBg,
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
        child: Row(
          children: [
            Expanded(child: Text('📞 ${widget.friendName} يتصل بك', style: const TextStyle(fontWeight: FontWeight.w800, color: kInk))),
            TextButton(onPressed: _hangUp, child: const Text('رفض', style: TextStyle(color: kBad))),
            FilledButton(style: FilledButton.styleFrom(minimumSize: const Size(80, 44), backgroundColor: kOk), onPressed: _accept, child: const Text('رد')),
          ],
        ),
      );
    }
    final mm = (_seconds ~/ 60).toString().padLeft(2, '0');
    final ss = (_seconds % 60).toString().padLeft(2, '0');
    return Container(
      color: kTeal,
      padding: const EdgeInsets.fromLTRB(16, 8, 8, 8),
      child: Row(
        children: [
          Expanded(
            child: Text(
              _callState == 'calling' ? 'جارٍ الاتصال بـ ${widget.friendName}...' : (_timer == null ? 'جارٍ التوصيل...' : 'مكالمة جارية · $mm:$ss'),
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
            ),
          ),
          IconButton(tooltip: 'كتم', onPressed: _toggleMute, icon: Icon(_muted ? Icons.mic_off_rounded : Icons.mic_rounded, color: Colors.white)),
          IconButton(tooltip: 'مكبر الصوت', onPressed: _toggleSpeaker, icon: Icon(_speaker ? Icons.volume_up_rounded : Icons.hearing_rounded, color: Colors.white)),
          IconButton(tooltip: 'إنهاء', onPressed: _hangUp, icon: const Icon(Icons.call_end_rounded, color: kCoral, size: 30)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.friendName),
        actions: [
          IconButton(tooltip: 'اقترح موضوعاً', onPressed: _suggest, icon: const Icon(Icons.lightbulb_rounded, color: kGold)),
          IconButton(tooltip: 'تحدي كلمات', onPressed: _challenge, icon: const Icon(Icons.quiz_rounded, color: kCoral)),
          // المكالمة الصوتية بين شخصين فقط؛ المجموعات للمحادثة الكتابية والتحديات.
          if (_memberCount <= 2) IconButton(tooltip: 'مكالمة صوتية', onPressed: _callState.isEmpty ? _startCall : null, icon: const Icon(Icons.call_rounded, color: kOk)),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            if (_callState.isNotEmpty) _callBar(),
            if (_topic.isNotEmpty)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                padding: const EdgeInsets.fromLTRB(12, 8, 4, 8),
                decoration: BoxDecoration(color: const Color(0xFFFFF6DC), borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    Expanded(child: Text('موضوع للحديث:\n$_topic', style: const TextStyle(fontSize: 13.5, height: 1.6, color: kInk))),
                    IconButton(onPressed: _suggest, icon: const Icon(Icons.refresh_rounded, color: kMuted)),
                    IconButton(onPressed: () => setState(() => _topic = ''), icon: const Icon(Icons.close_rounded, color: kMuted)),
                  ],
                ),
              ),
            Expanded(
              child: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
                stream: _room.collection('messages').orderBy('at', descending: true).limit(100).snapshots(),
                builder: (context, snap) {
                  if (snap.hasError) return const Center(child: Text('تعذر تحميل الرسائل', style: TextStyle(color: kMuted)));
                  if (!snap.hasData) return const Center(child: CircularProgressIndicator());
                  final docs = snap.data!.docs;
                  if (docs.isEmpty) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(30),
                        child: Text('اكتبا بالإنجليزية فقط.\nاضغط المصباح لاقتراح موضوع، أو السماعة لمكالمة صوتية.', textAlign: TextAlign.center, style: TextStyle(color: kMuted, height: 1.8)),
                      ),
                    );
                  }
                  return ListView.builder(
                    reverse: true,
                    padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
                    itemCount: docs.length,
                    itemBuilder: (context, i) {
                      final d = docs[i].data();
                      final mine = d['from'] == Buddy.uid;
                      final text = (d['text'] ?? '').toString();
                      final tip = mine ? _tips[text] : null;
                      final answer = (d['answer'] ?? '').toString();
                      final sender = (d['name'] ?? '').toString();
                      if (d['type'] == 'challenge' && answer.isNotEmpty) {
                        final open = _revealed.contains(docs[i].id);
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: const Color(0xFFFFF6DC), borderRadius: BorderRadius.circular(16), border: Border.all(color: kGold)),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text('🎯 ${mine ? 'تحدّيك' : 'تحدٍّ من $sender'}', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: kCoral)),
                              Text(text, style: const TextStyle(fontSize: 15.5, height: 1.6, color: kInk, fontWeight: FontWeight.w700)),
                              if (open) En(answer, style: const TextStyle(fontSize: 16.5, fontWeight: FontWeight.w800, color: kTeal)),
                              if (!open) TextButton(onPressed: () => setState(() => _revealed.add(docs[i].id)), child: const Text('اكتب جوابك في المحادثة ثم اكشف الإجابة')),
                            ],
                          ),
                        );
                      }
                      return Column(
                        crossAxisAlignment: mine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                        textDirection: TextDirection.ltr,
                        children: [
                          if (!mine && _memberCount > 2 && sender.isNotEmpty) Text(sender, style: const TextStyle(fontSize: 11.5, color: kMuted)),
                          Container(
                            margin: EdgeInsets.only(bottom: tip == null ? 8 : 3, left: mine ? 40 : 0, right: mine ? 0 : 40),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(color: mine ? kTeal : Colors.white, borderRadius: BorderRadius.circular(18), border: mine ? null : Border.all(color: kLine)),
                            child: En(text, style: TextStyle(fontSize: 16, height: 1.4, color: mine ? Colors.white : kInk)),
                          ),
                          if (tip != null)
                            Container(
                              margin: const EdgeInsets.only(bottom: 8, left: 40),
                              padding: const EdgeInsets.all(9),
                              decoration: BoxDecoration(color: const Color(0xFFFFF6DC), borderRadius: BorderRadius.circular(12)),
                              child: Text('تصحيح لك وحدك: ${tip.corrected}\n${tip.noteAr}', style: const TextStyle(fontSize: 12.5, height: 1.6, color: kInk)),
                            ),
                        ],
                      );
                    },
                  );
                },
              ),
            ),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _input,
                      textDirection: TextDirection.ltr,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _send(),
                      decoration: InputDecoration(
                        hintText: 'Write in English…',
                        hintTextDirection: TextDirection.ltr,
                        filled: true,
                        fillColor: kSand,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(99), borderSide: BorderSide.none),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(onPressed: _send, icon: const Icon(Icons.send_rounded)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
