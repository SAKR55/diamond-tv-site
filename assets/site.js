/* =========================================================
   DIAMOND TV — إعدادات مشتركة لكل الصفحات
   غيّر رابط التحميل من هنا فقط (يطبَّق على كل الموقع)
   ========================================================= */
window.SITE = {
  // رابط ثابت لآخر إصدار منشور (Release) في مستودع الموقع العام diamond-tv-site
  // يعمل من أي جهاز بدون تسجيل دخول، ويتحدث تلقائياً عند رفع إصدار جديد بنفس اسم الملف
  APK_URL: "https://github.com/SAKR55/diamond-tv-site/releases/latest/download/diamond-tv.apk",
  APK_NAME: "DIAMOND-TV.apk",
};

(function () {
  // جذر الموقع محسوب من مكان هذا الملف، فتعمل الروابط من أي مجلد (مثل /articles/)
  const ROOT = (document.currentScript && document.currentScript.src || "").replace(/assets\/site\.js.*$/, "");
  const parts = location.pathname.split("/").filter(Boolean);
  const inArticles = parts.includes("articles");
  const page = inArticles ? "articles" : parts.includes("download") ? "download" : ((parts.pop() || "index.html").replace(".html", "") || "index");
  const links = [
    ["index", "index.html", "⚽ المباريات مباشر"],
    ["movies", "movies.html", "🎬 أفضل الأفلام"],
    ["series", "series.html", "📺 أفضل المسلسلات"],
    ["arabic", "arabic.html", "🌙 الأفضل عربياً"],
    ["articles", "articles/", "📰 المقالات"],
    ["download", "download/", "📱 التطبيق"],
  ];
  const header = document.createElement("header");
  header.className = "top";
  header.innerHTML = `
    <div class="wrap">
      <a class="brand" href="${ROOT}index.html" aria-label="DIAMOND TV الرئيسية"><i></i>DIAMOND TV</a>
      <nav class="nav" aria-label="القائمة الرئيسية">${links.map(([k, h, t]) =>
        `<a href="${ROOT}${h}" class="${k === page ? "on" : ""}">${t}</a>`).join("")}</nav>
      <a class="dl" href="${/^https?:/.test(SITE.APK_URL) ? SITE.APK_URL : ROOT + SITE.APK_URL}" download="${SITE.APK_NAME}">⬇ تحميل التطبيق</a>
    </div>`;
  document.body.prepend(header);

  const footer = document.createElement("footer");
  footer.innerHTML = `<div class="wrap">
    <nav class="flinks">${links.map(([, h, t]) => `<a href="${ROOT}${h}">${t.replace(/^\S+\s/, "")}</a>`).join("")}</nav>
    DIAMOND TV © ${new Date().getFullYear()} — تمت التقنية بواسطة SAKR OMAR ·
    <a href="mailto:sales@diamond-tv.shop">sales@diamond-tv.shop</a></div>`;
  document.body.append(footer);
})();
