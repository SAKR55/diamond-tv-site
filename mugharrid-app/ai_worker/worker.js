// خادم وسيط (Cloudflare Worker) بين تطبيق «مغرّد» ونموذج الذكاء الاصطناعي.
// المفاتيح تُخزَّن كأسرار في Cloudflare ولا توضع داخل التطبيق أبداً.
// تبديل المزوّد: غيّر المتغير PROVIDER إلى gemini أو anthropic أو deepseek (بلا تعديل في التطبيق).

const JSON_HEAD = { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' };

function out(status, obj) {
  return new Response(JSON.stringify(obj), { status, headers: JSON_HEAD });
}

// ---------- المزوّدات ----------
async function callGemini(env, system, user) {
  const model = env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 900, temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error('gemini ' + res.status);
  const d = await res.json();
  return (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
}

async function callAnthropic(env, system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
      max_tokens: 900,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error('anthropic ' + res.status);
  const d = await res.json();
  return (d.content || []).map((c) => c.text || '').join('');
}

async function callDeepseek(env, system, user) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + env.DEEPSEEK_API_KEY },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error('deepseek ' + res.status);
  const d = await res.json();
  return d.choices?.[0]?.message?.content || '';
}

const PROVIDERS = { gemini: callGemini, anthropic: callAnthropic, deepseek: callDeepseek };

function parseJson(text) {
  const s = text.indexOf('{');
  const e = text.lastIndexOf('}');
  if (s < 0 || e < 0) throw new Error('no json');
  return JSON.parse(text.slice(s, e + 1));
}

// ---------- الطلبات ----------
function clip(v, n) {
  return String(v == null ? '' : v).slice(0, n);
}

function chatPrompt(b) {
  const history = (Array.isArray(b.history) ? b.history : [])
    .slice(-12)
    .map((m) => (m.role === 'coach' ? 'Coach: ' : 'Learner: ') + clip(m.text, 400))
    .join('\n');
  const system =
    'You are a friendly English speaking coach for Arabic-speaking learners. ' +
    `Learner level (CEFR): ${clip(b.level, 3) || 'A2'}. Scenario: ${clip(b.scenario, 80) || 'free talk'}. ` +
    'Stay in the scenario, use words suitable for the level, keep your reply to one or two short sentences and end with a question. ' +
    "If the learner's last message has a clear grammar or word mistake, give the corrected sentence and a one-line explanation in Arabic. " +
    'Answer with JSON only: {"reply": string, "corrected": string, "note_ar": string}. Use empty strings when there is no mistake.';
  return [system, history || 'Learner: Hello'];
}

function storyPrompt(b) {
  const kids = b.kids === true;
  const system =
    'You write short original stories for Arabic-speaking learners of English. ' +
    (kids
      ? 'Audience: children aged 5 to 10. Gentle, safe, cheerful, 5 very short sentences. '
      : `Audience: adults at CEFR level ${clip(b.level, 3) || 'A2'}. 7 to 9 sentences, everyday life. `) +
    'Answer with JSON only: {"title": string, "lines": [one sentence each], ' +
    '"vocab": [{"en": string, "ar": string}] (5 useful words with Arabic meaning), ' +
    '"quiz": [{"q": string, "options": [3 strings], "answer": index of the correct option}] (3 questions about the story)}.';
  return [system, 'Write a new story now. Pick a fresh topic.'];
}

function reviewPrompt(b) {
  const system =
    'You are a job-interview English coach for Arabic-speaking learners. ' +
    'You get an interview question, a sample good answer, and what the learner said (speech-to-text, may lack punctuation). ' +
    'Judge only the language and content, not punctuation or capital letters. Be encouraging and brief. ' +
    'Answer with JSON only: {"score": integer 0-100, "corrected": the learner answer rewritten with grammar fixed (same meaning, empty string if already fine), ' +
    '"note_ar": one short Arabic sentence about the main mistake (empty if none), ' +
    '"good": [up to 2 short Arabic points], "fixes": [up to 3 short Arabic points]}.';
  const user =
    `Question: ${clip(b.question, 300)}\nSample answer: ${clip(b.model, 600)}\nLearner said: ${clip(b.said, 800)}`;
  return [system, user];
}

function explainPrompt(b) {
  const system =
    'You are an English teacher for Arabic speakers. Explain one learner mistake simply, in Arabic, in at most 3 short sentences, ' +
    'mentioning why the correct form is right and a tip to remember it. Give 2 short English example sentences using the correct form. ' +
    'Answer with JSON only: {"explain_ar": string, "examples": [2 English sentences]}.';
  const user = `Wrong: ${clip(b.wrong, 300)}\nCorrect: ${clip(b.correct, 300)}`;
  return [system, user];
}

// ---------- الحدود ----------
// يحتاج ربط KV باسم LIMITS. بدونه لا توجد حدود (لا تنشر هكذا).
async function allow(env, ip, device) {
  if (!env.LIMITS) return true;
  const day = new Date().toISOString().slice(0, 10);
  const perUser = parseInt(env.DAILY_PER_USER || '30', 10);
  const global = parseInt(env.DAILY_GLOBAL || '3000', 10);
  const keys = [`u:${day}:${device}`, `i:${day}:${ip}`];
  for (const k of keys) {
    const n = parseInt((await env.LIMITS.get(k)) || '0', 10);
    if (n >= perUser) return false;
  }
  const gk = `g:${day}`;
  const g = parseInt((await env.LIMITS.get(gk)) || '0', 10);
  if (g >= global) return false;
  for (const k of keys) {
    const n = parseInt((await env.LIMITS.get(k)) || '0', 10);
    await env.LIMITS.put(k, String(n + 1), { expirationTtl: 172800 });
  }
  await env.LIMITS.put(gk, String(g + 1), { expirationTtl: 172800 });
  return true;
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: { ...JSON_HEAD, 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST' } });
    }
    if (req.method !== 'POST') return out(405, { error: 'method' });

    if (env.APP_SECRET && req.headers.get('x-app-key') !== env.APP_SECRET) return out(401, { error: 'auth' });

    const raw = await req.text();
    if (raw.length > 20000) return out(413, { error: 'big' });
    let b;
    try {
      b = JSON.parse(raw || '{}');
    } catch (_) {
      return out(400, { error: 'json' });
    }

    const ip = req.headers.get('cf-connecting-ip') || 'x';
    const device = clip(req.headers.get('x-device') || 'anon', 64).replace(/[^\w-]/g, '');
    if (!(await allow(env, ip, device))) return out(429, { error: 'limit' });

    const name = (env.PROVIDER || 'gemini').toLowerCase();
    const call = PROVIDERS[name];
    if (!call) return out(500, { error: 'provider' });

    try {
      const [system, user] = b.kind === 'story' ? storyPrompt(b) : b.kind === 'review' ? reviewPrompt(b) : b.kind === 'explain' ? explainPrompt(b) : chatPrompt(b);
      const text = await call(env, system, user);
      return out(200, parseJson(text));
    } catch (e) {
      return out(502, { error: 'failed', detail: String((e && e.message) || e).slice(0, 80) });
    }
  },
};
