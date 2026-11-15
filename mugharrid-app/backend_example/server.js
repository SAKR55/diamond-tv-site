// مثال خادم صغير يربط تطبيق «مغرّد» بنموذج ذكاء اصطناعي.
// تنبيه: هذا مثال لم يُختبر. راجعه قبل الاستخدام، وأضف حداً للطلبات قبل فتحه للمستخدمين.
//
// التشغيل (Node 18 أو أحدث، بلا مكتبات إضافية):
//   ANTHROPIC_API_KEY=مفتاحك  MODEL=اسم_النموذج  node server.js
// ثم ضع رابط الخادم في إعدادات التطبيق. يجب أن يكون الرابط https (أندرويد يرفض http العادي)،
// فضع الخادم خلف استضافة تعطيك https مثل Render أو Railway أو Cloudflare Tunnel.
//
// المفتاح يبقى هنا على الخادم ولا يوضع داخل التطبيق أبداً.
// اسم النموذج يتغير مع الوقت، خذه من صفحة النماذج في وثائق المزوّد: https://docs.claude.com

const http = require('http');

const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.MODEL;
const PORT = process.env.PORT || 8787;

if (!KEY || !MODEL) {
  console.error('Set ANTHROPIC_API_KEY and MODEL first.');
  process.exit(1);
}

async function askModel(system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 900,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error('model error ' + res.status);
  const data = await res.json();
  const text = (data.content || []).map((c) => c.text || '').join('');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('no json in reply');
  return JSON.parse(text.slice(start, end + 1));
}

function chatPrompt(body) {
  const history = (body.history || [])
    .slice(-12)
    .map((m) => (m.role === 'coach' ? 'Coach: ' : 'Learner: ') + String(m.text || '').slice(0, 400))
    .join('\n');
  const system =
    'You are a friendly English speaking coach for Arabic-speaking learners. ' +
    'Learner level (CEFR): ' + (body.level || 'A2') + '. Scenario: ' + (body.scenario || 'free talk') + '. ' +
    'Stay in the scenario, use words suitable for the level, keep your reply to one or two short sentences and end with a question. ' +
    'If the learner\'s last message has a clear grammar or word mistake, give the corrected sentence and a one-line explanation in Arabic. ' +
    'Answer with JSON only: {"reply": string, "corrected": string, "note_ar": string}. Use empty strings when there is no mistake.';
  return [system, history || 'Learner: Hello'];
}

function storyPrompt(body) {
  const kids = body.kids === true;
  const system =
    'You write short original stories for Arabic-speaking learners of English. ' +
    (kids
      ? 'Audience: children aged 5 to 10. Gentle, safe, cheerful, 5 very short sentences. '
      : 'Audience: adults at CEFR level ' + (body.level || 'A2') + '. 7 to 9 sentences, everyday life. ') +
    'Answer with JSON only: {"title": string, "lines": [one sentence each], ' +
    '"vocab": [{"en": string, "ar": string}] (5 useful words with Arabic meaning), ' +
    '"quiz": [{"q": string, "options": [3 strings], "answer": index of the correct option}] (3 questions about the story)}.';
  return [system, 'Write a new story now. Pick a fresh topic.'];
}

http
  .createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(405).end();
      return;
    }
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 20000) req.destroy();
    });
    req.on('end', async () => {
      try {
        const body = JSON.parse(raw || '{}');
        const [system, user] = body.kind === 'story' ? storyPrompt(body) : chatPrompt(body);
        const out = await askModel(system, user);
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(out));
      } catch (e) {
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'failed' }));
      }
    });
  })
  .listen(PORT, () => console.log('listening on ' + PORT));
