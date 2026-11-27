// يمرّر الصوت المرجعي القادم من الإضافة إلى صفحة المولّد (صفحة الموقع تستمع لرسالة dhRef)
chrome.runtime.onMessage.addListener((m, _s, reply) => {
  if (m.type !== 'ref') return;
  const bin = atob(m.b64), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  window.postMessage({ dhRef: true, buf: u.buffer }, location.origin, [u.buffer]);
  reply({ ok: true });
});
