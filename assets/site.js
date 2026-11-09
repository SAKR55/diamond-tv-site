/* =========================================================
   DIAMOND TV — إعدادات مشتركة لكل الصفحات
   غيّر رابط التحميل من هنا فقط (يطبَّق على كل الموقع)
   ========================================================= */
window.SITE = {
  // ملف التطبيق داخل الموقع نفسه (مجلد app/) — استبدله بنفس الاسم عند كل إصدار جديد
  // يعمل من أي جهاز بدون تسجيل دخول
  APK_URL: "app/diamond-tv.apk",
  APK_NAME: "DIAMOND-TV.apk",
};

(function () {
  // جذر الموقع محسوب من مكان هذا الملف، فتعمل الروابط من أي مجلد (مثل /articles/)
  const ROOT = (document.currentScript && document.currentScript.src || "").replace(/assets\/site\.js.*$/, "");
  const configReady = window.DIAMOND_CONFIG_READY || fetch(ROOT + "assets/site-config.json", { cache: "no-cache" }).then(function (response) { return response.ok ? response.json() : {}; }).catch(function () { return {}; });
  const parts = location.pathname.split("/").filter(Boolean);
  const inArticles = parts.includes("articles");
  const inStore = parts.includes("store");
  const inEvening = parts.includes("evening");
  const page = inArticles ? "articles" : inStore ? "store" : inEvening ? "evening" : parts.includes("download") ? "download" : ((parts.pop() || "index.html").replace(".html", "") || "index");
  const links = [
    ["index", "index.html#board-heading", "⚽ المباريات مباشر"],
    ["movies", "movies.html", "🎬 أفضل الأفلام"],
    ["series", "series.html", "📺 أفضل المسلسلات"],
    ["arabic", "arabic.html", "🌙 الأفضل عربياً"],
    ["evening", "evening/", "✨ ترشيحات السهرة"],
    ["articles", "articles/", "📰 المقالات"],
    ["store", "store/", "🛍️ المتجر"],
    ["download", "download/", "📱 التطبيق"],
  ];
  const artwork = links.filter(([key]) => ["movies", "series", "arabic"].includes(key));
  const primary = links.filter(([key]) => !["movies", "series", "arabic"].includes(key));
  const header = document.createElement("header");
  header.className = "top";
  header.innerHTML = `
    <div class="wrap">
      <a class="brand" href="${ROOT}index.html" aria-label="DIAMOND TV الرئيسية"><i></i>DIAMOND TV</a>
      <nav class="nav" aria-label="القائمة الرئيسية">${primary.slice(0, 1).map(([k, h, t]) =>
        `<a href="${ROOT}${h}" class="${k === page ? "on" : ""}">${t}</a>`).join("")}
        <button type="button" id="artwork-menu-toggle" class="nav-group-button ${artwork.some(([k]) => k === page) ? "on" : ""}" aria-controls="artwork-navigation-menu" aria-expanded="false">🎭 واحة أفضل الأعمال الفنية <span aria-hidden="true">⌄</span></button>
        ${primary.slice(1).map(([k, h, t]) => `<a href="${ROOT}${h}" class="${k === page ? "on" : ""}">${t}</a>`).join("")}</nav>
      <a class="dl" href="${/^https?:/.test(SITE.APK_URL) ? SITE.APK_URL : ROOT + SITE.APK_URL}" download="${SITE.APK_NAME}">⬇ تحميل التطبيق</a>
    </div>`;
  document.body.prepend(header);

  const artworkToggle = header.querySelector("#artwork-menu-toggle");
  const artworkMenu = document.createElement("div");
  artworkMenu.id = "artwork-navigation-menu";
  artworkMenu.className = "nav-group-menu";
  artworkMenu.hidden = true;
  artworkMenu.setAttribute("role", "group");
  artworkMenu.setAttribute("aria-label", "واحة أفضل الأعمال الفنية");
  artworkMenu.innerHTML = artwork.map(([key, href, title]) =>
    `<a href="${ROOT}${href}" class="${key === page ? "on" : ""}">${title}</a>`).join("");
  header.after(artworkMenu);
  function closeArtworkMenu() { artworkMenu.hidden = true; artworkToggle.setAttribute("aria-expanded", "false"); }
  artworkToggle.addEventListener("click", function (event) {
    event.stopPropagation();
    const opening = artworkMenu.hidden;
    if (!opening) { closeArtworkMenu(); return; }
    const rect = artworkToggle.getBoundingClientRect();
    artworkMenu.hidden = false;
    const menuHeight = artworkMenu.offsetHeight;
    const menuTop = rect.bottom + 8 + menuHeight > window.innerHeight ? Math.max(12, rect.top - menuHeight - 8) : rect.bottom + 8;
    artworkMenu.style.top = menuTop + "px";
    artworkMenu.style.right = Math.max(12, window.innerWidth - rect.right) + "px";
    artworkToggle.setAttribute("aria-expanded", "true");
  });
  artworkMenu.addEventListener("click", closeArtworkMenu);
  document.addEventListener("click", function (event) {
    if (!artworkMenu.hidden && !artworkMenu.contains(event.target) && !artworkToggle.contains(event.target)) closeArtworkMenu();
  });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeArtworkMenu(); });
  window.addEventListener("resize", closeArtworkMenu);
  window.addEventListener("scroll", closeArtworkMenu, true);

  const footer = document.createElement("footer");
  footer.innerHTML = `<div class="wrap">
    <nav class="flinks">${links.map(([, h, t]) => `<a href="${ROOT}${h}">${t.replace(/^\S+\s/, "")}</a>`).join("")}</nav>
    DIAMOND TV © ${new Date().getFullYear()} — تمت التقنية بواسطة SAKR OMAR ·
    <a href="mailto:sales@diamond-tv.shop">sales@diamond-tv.shop</a></div>`;
  document.body.append(footer);
  function applySiteConfig(config) {
    const theme = config && config.theme || {};
    if (/^#[0-9a-f]{6}$/i.test(theme.accent || "")) document.documentElement.style.setProperty("--accent", theme.accent);
    if (/^#[0-9a-f]{6}$/i.test(theme.accent2 || "")) document.documentElement.style.setProperty("--accent2", theme.accent2);
    const sections = config && config.sections || {};
    document.querySelectorAll('a[href*="/store/"], a[href="store/"]').forEach(function (link) { link.hidden = sections.store === false; });
    document.querySelectorAll('a[href*="/evening/"], a[href="evening/"]').forEach(function (link) { link.hidden = sections.recommendations === false; });
  }
  Promise.resolve(configReady).then(applySiteConfig);
  window.addEventListener("diamond:config-updated", function (event) { applySiteConfig(event.detail || window.DIAMOND_CONFIG || {}); });
})();


