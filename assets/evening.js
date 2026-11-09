(function () {
  "use strict";
  var host = document.getElementById("evening-grid");
  if (!host) return;
  var editorial = [
    { id: "guide-ramadan-series", kind: "series", type: "مسلسلات · رمضان 2027", title: "دليل المسلسلات والقنوات المعلنة", description: "تعرف على الأعمال المعلن عنها، وتحقق من القنوات والمواعيد من مصادرها.", image: "../assets/ramadan-series-2027.svg", imageAlt: "هلال وفانوس يرمزان إلى دراما رمضان 2027", url: "../articles/ramadan-series-2027.html", label: "افتح دليل المسلسلات" },
    { id: "guide-ramadan-programs", kind: "series", type: "برامج · رمضان 2027", title: "دليل برامج رمضان والقنوات", description: "تابع الإعلانات المؤكدة عن البرامج والقنوات، وحدّث معلوماتك من المصدر.", image: "../assets/ramadan-programs-2027.svg", imageAlt: "هلال وميكروفون لبرامج رمضان", url: "../articles/ramadan-programs-2027.html", label: "افتح دليل البرامج" },
    { id: "guide-arabic-series", kind: "series", type: "مسلسلات عربية", title: "أعمال عربية تستحق إعادة المشاهدة", description: "قائمة تحريرية لمسلسلات عربية خالدة ولمحات عن أسباب بقائها في الذاكرة.", url: "../articles/best-arabic-series-of-all-time.html", label: "اقرأ ترشيحات المسلسلات" },
    { id: "guide-sci-fi-movies", kind: "movie", type: "أفلام · خيال علمي", title: "أفلام خيال علمي لسهرة مميزة", description: "اختيارات لعشاق الفضاء والقصص التي تطرح أسئلة عن المستقبل.", url: "../articles/best-sci-fi-movies.html", label: "اقرأ ترشيحات الأفلام" },
    { id: "guide-movies", kind: "movie", type: "أفلام", title: "تصفح أفضل الأفلام", description: "انتقل إلى صفحة الأفلام لاستكشاف المزيد من الاختيارات والمعلومات.", url: "../movies.html", label: "استكشف الأفلام" },
    { id: "live-events", kind: "sports", type: "أحداث رياضية", title: "تابع مباريات الدوريات الكبرى", description: "افتح جدول الأسبوع لمعرفة المواعيد والنتائج والإحصاءات المتاحة للمباريات.", url: "../index.html#board-heading", label: "افتح جدول المباريات" }
  ];
  var items = editorial.slice(), kind = "all", query = "", savedOnly = false, sortMode = "recommended", saved = new Set();
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(value) {
    try { var url = new URL(value, location.href); return url.protocol === "https:" || url.origin === location.origin ? url.href : ""; }
    catch (_) { return ""; }
  }
  function stripHtml(value) { return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); }
  function readSaved() {
    try { saved = new Set(JSON.parse(localStorage.getItem("diamond-evening-saved") || "[]").map(String)); }
    catch (_) { saved = new Set(); }
  }
  function writeSaved() {
    try { localStorage.setItem("diamond-evening-saved", JSON.stringify(Array.from(saved))); } catch (_) {}
    document.getElementById("evening-saved-count").textContent = String(saved.size);
  }
  function ratingText(item) {
    if (!Number.isFinite(item.rating) || item.rating <= 0) return "";
    return '<span class="tvmaze-rating">★ ' + item.rating.toFixed(1) + ' / 10 · ' + esc(item.ratingSource || "تقييم") + '</span>';
  }
  function card(item) {
    var image = item.image ? safeUrl(item.image) : "";
    var url = safeUrl(item.url);
    var isExternal = url && new URL(url).origin !== location.origin;
    var isSaved = saved.has(item.id);
    return '<article class="recommend-card evening-card ' + (item.kind === "sports" ? "recommend-sport" : "") + '">' +
      (image ? '<img class="recommend-cover" src="' + esc(image) + '" alt="' + esc(item.imageAlt || item.title) + '" loading="lazy">' : '') +
      '<span class="recommend-type">' + esc(item.type) + '</span><h3>' + esc(item.title) + '</h3>' +
      ratingText(item) + '<p>' + esc(item.description) + '</p>' +
      '<div class="evening-card-actions">' + (url ? '<a class="recommend-link" href="' + esc(url) + '"' + (isExternal ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(item.label || "التفاصيل") + ' ←</a>' : '') +
      '<button type="button" class="evening-save ' + (isSaved ? "saved" : "") + '" data-evening-save="' + esc(item.id) + '" aria-pressed="' + isSaved + '" aria-label="' + (isSaved ? "إزالة من المحفوظات" : "حفظ الترشيح") + '">' + (isSaved ? "♥ محفوظ" : "♡ احفظ") + '</button></div></article>';
  }
  function render() {
    var filtered = items.filter(function (item) {
      var text = [item.title, item.description, item.type, (item.genres || []).join(" ")].join(" ").toLowerCase();
      return (kind === "all" || item.kind === kind) && (!savedOnly || saved.has(item.id)) && (!query || text.includes(query));
    });
    if (sortMode === "name") filtered.sort(function (a, b) { return a.title.localeCompare(b.title, "ar"); });
    else filtered.sort(function (a, b) {
      var ar = Number.isFinite(a.rating) ? a.rating : -1, br = Number.isFinite(b.rating) ? b.rating : -1;
      return br - ar || (a.order || 0) - (b.order || 0);
    });
    host.innerHTML = filtered.length ? filtered.map(card).join("") : '<div class="store-empty"><b>لا توجد ترشيحات مطابقة</b><p>' + (savedOnly ? "احفظ بعض الاختيارات لتظهر هنا." : "جرّب نوعًا آخر أو غيّر عبارة البحث.") + '</p></div>';
    document.getElementById("evening-count").textContent = "عرض " + filtered.length + " من " + items.length + " ترشيحًا";
    document.getElementById("evening-saved-toggle").setAttribute("aria-pressed", savedOnly ? "true" : "false");
    document.getElementById("evening-saved-toggle").classList.toggle("active", savedOnly);
    document.querySelectorAll("#evening-filters [data-kind]").forEach(function (button) {
      var selected = button.dataset.kind === kind;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    writeSaved();
  }
  function showRatingData(config) {
    var rec = config.recommendations || {}, ids = Array.from(new Set((rec.tvmazeIds || []).map(Number).filter(function (id) { return Number.isInteger(id) && id > 0; }))).slice(0, 12);
    (Array.isArray(rec.movies) ? rec.movies : []).slice(0, 12).forEach(function (movie, index) {
      var rating = String(movie.rating || "").trim() ? Number(movie.rating) : NaN;
      items.push({ id: "movie-" + (movie.id || index), kind: "movie", type: "فيلم · اختيار تحريري", title: movie.title || "فيلم مختار", description: movie.description || "ترشيح تحريري من DIAMOND TV.", image: /^https:\/\//.test(movie.image || "") ? movie.image : "", imageAlt: movie.imageAlt, url: /^https:\/\//.test(movie.url || "") ? movie.url : "", label: "تفاصيل الفيلم", rating: Number.isFinite(rating) && rating > 0 ? rating : -1, ratingSource: movie.ratingSource || "تحريري", order: 50 + index });
    });
    if (!ids.length) { render(); return; }
    var tasks = ids.map(async function (id, index) {
      try {
        var cached = JSON.parse(localStorage.getItem("diamond-tvmaze-" + id) || "null"), show;
        if (cached && Date.now() - cached.at < 12 * 60 * 60 * 1000) show = cached.show;
        else {
          var response = await fetch("https://api.tvmaze.com/shows/" + id, { cache: "no-cache" });
          if (!response.ok) throw new Error("TVMaze unavailable");
          show = await response.json();
          try { localStorage.setItem("diamond-tvmaze-" + id, JSON.stringify({ at: Date.now(), show: show })); } catch (_) {}
        }
        if (!show || !show.name) return;
        var rating = Number(show.rating && show.rating.average);
        items.push({ id: "tvmaze-" + id, kind: "series", type: "مسلسل · TVMaze", title: show.name, description: stripHtml(show.summary).slice(0, 230) || "تفاصيل المسلسل وتقييمه من TVMaze.", image: show.image && show.image.medium || "", imageAlt: "ملصق مسلسل " + show.name, url: /^https:\/\/www\.tvmaze\.com\//.test(show.url || "") ? show.url : "https://www.tvmaze.com/", label: "تفاصيل العمل ومصدر التقييم", rating: Number.isFinite(rating) ? rating : -1, ratingSource: "TVMaze", genres: show.genres || [], order: 10 + index });
      } catch (_) {}
    });
    Promise.allSettled(tasks).then(render);
  }
  document.getElementById("evening-search").addEventListener("input", function (event) { query = event.target.value.trim().toLowerCase(); render(); });
  document.getElementById("evening-sort").addEventListener("change", function (event) { sortMode = event.target.value; render(); });
  document.getElementById("evening-filters").addEventListener("click", function (event) {
    var button = event.target.closest("[data-kind]");
    if (!button) return;
    kind = button.dataset.kind;
    render();
  });
  document.getElementById("evening-saved-toggle").addEventListener("click", function () { savedOnly = !savedOnly; render(); });
  host.addEventListener("click", function (event) {
    var button = event.target.closest("[data-evening-save]");
    if (!button) return;
    var id = button.dataset.eveningSave;
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    render();
  });
  readSaved();
  window.DIAMOND_CONFIG_READY.then(showRatingData).catch(render);
})();

