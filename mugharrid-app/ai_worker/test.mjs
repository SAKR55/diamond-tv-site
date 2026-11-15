import w from './worker.js';
const store = new Map();
const env = { PROVIDER: 'gemini', GEMINI_API_KEY: 'k', APP_SECRET: 's', DAILY_PER_USER: '2', DAILY_GLOBAL: '10',
  LIMITS: { get: async (k) => store.get(k) ?? null, put: async (k, v) => store.set(k, v) } };
let last;
globalThis.fetch = async (url, init) => { last = { url, init };
  const t = JSON.stringify({ reply: 'Hi! What is your name?', corrected: '', note_ar: '', score: 80 });
  if (url.includes('generativelanguage')) return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'ok ' + t }] } }] }));
  if (url.includes('anthropic')) return new Response(JSON.stringify({ content: [{ text: t }] }));
  return new Response(JSON.stringify({ choices: [{ message: { content: t } }] })); };
const call = (body, h = {}, e = env) => w.fetch(new Request('https://x/', { method: 'POST', body: JSON.stringify(body), headers: { 'x-app-key': 's', 'x-device': 'd1', ...h } }), e);
const show = async (n, r) => console.log(n, r.status, (await r.text()).slice(0, 70));
await show('chat', await call({ kind: 'chat', history: [{ role: 'learner', text: 'hello' }] }));
console.log('gemini url ok:', last.url.includes('gemini-2.5-flash-lite'), 'key header:', last.init.headers['x-goog-api-key']);
await show('review', await call({ kind: 'review', question: 'q', model: 'm', said: 'i has experience' }));
await show('limit(3rd)', await call({ kind: 'chat' }));
await show('other device', await call({ kind: 'chat' }, { 'x-device': 'd2', 'cf-connecting-ip': '2.2.2.2' }));
await show('no secret', await w.fetch(new Request('https://x/', { method: 'POST', body: '{}' }), env));
for (const p of ['anthropic', 'deepseek']) { await show(p, await call({ kind: 'story' }, { 'x-device': p, 'cf-connecting-ip': p }, { ...env, PROVIDER: p, ANTHROPIC_API_KEY: 'a', DEEPSEEK_API_KEY: 'd', LIMITS: undefined })); console.log(' url:', last.url); }
await show('GET', await w.fetch(new Request('https://x/'), env));
