/* شريط مشاركة خفيف: واتساب، إكس، تيليجرام، نسخ الرابط، مشاركة الجهاز. */
(function () {
  if (document.getElementById("dt-share")) return;
  var h1 = document.querySelector("h1"); if (!h1) return;
  var u = location.href.split("#")[0], t = document.title;
  var bar = document.createElement("div"); bar.id = "dt-share"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "مشاركة الصفحة");
  bar.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:14px 0;font:700 14px Cairo,system-ui,sans-serif";
  function a(txt, href, bg) { var e = document.createElement("a"); e.textContent = txt; e.href = href; e.target = "_blank"; e.rel = "noopener noreferrer"; e.style.cssText = "background:" + bg + ";color:#fff;border-radius:999px;padding:6px 14px;text-decoration:none"; return e; }
  var q = encodeURIComponent;
  bar.appendChild(a("واتساب", "https://wa.me/?text=" + q(t + " " + u), "#16a34a"));
  bar.appendChild(a("إكس", "https://twitter.com/intent/tweet?text=" + q(t) + "&url=" + q(u), "#111827"));
  bar.appendChild(a("تيليجرام", "https://t.me/share/url?url=" + q(u) + "&text=" + q(t), "#0284c7"));
  var c = document.createElement("button"); c.type = "button"; c.textContent = "نسخ الرابط";
  c.style.cssText = "background:#7c3aed;color:#fff;border:0;border-radius:999px;padding:6px 14px;cursor:pointer;font:inherit";
  c.onclick = function () { (navigator.share ? navigator.share({ title: t, url: u }) : navigator.clipboard.writeText(u)).then(function () { c.textContent = "✅ تم"; }, function () { }); };
  bar.appendChild(c);
  var host = h1.closest("header,.phero,.hero") || h1; host.parentNode.insertBefore(bar, host.nextSibling);
})();
