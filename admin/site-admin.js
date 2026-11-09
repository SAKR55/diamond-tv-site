(function () {
  "use strict";
  const OWNER = "SAKR55";
  const REPO = "diamond-tv-site";
  const BRANCH = "main";
  const API = "https://api.github.com/repos/" + OWNER + "/" + REPO;
  const app = document.getElementById("app");
  if (!app) return;

  let token = "";
  let treeFiles = [];
  let original = Object.create(null);
  let pending = Object.create(null);
  let binaryPending = Object.create(null);
  let selectedPath = "";
  let selectedOriginal = "";
  let siteConfig = null;

  const subsPanel = document.createElement("section");
  subsPanel.id = "subscriptionsPanel";
  subsPanel.className = "site-tab-panel";
  Array.from(app.childNodes).forEach(function (node) { subsPanel.appendChild(node); });
  const sitePanel = document.createElement("section");
  sitePanel.id = "siteControlPanel";
  sitePanel.className = "site-tab-panel";
  sitePanel.hidden = true;
  sitePanel.innerHTML =
    '<div class="sa-heading"><div><span class="sa-eyebrow">إدارة DIAMOND TV</span><h2>التحكم بالموقع</h2>' +
    '<p class="hint">إدارة الصفحات والمقالات والتصميم من رابط لوحة الاشتراكات نفسه.</p></div>' +
    '<span class="sa-status" id="saStatus">غير متصل</span></div>' +
    '<div class="sa-connect card" id="saConnect">' +
    '<div class="sa-connect-copy"><b>اربط المستودع لتحرير الموقع ونشر التغييرات</b>' +
    '<p class="hint">أنشئ رمز وصول مقيّدًا بهذا المستودع، بصلاحية Contents للقراءة والكتابة. يبقى الرمز في الذاكرة لهذه الجلسة فقط.</p>' +
    '<a class="sa-help-link" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">إعداد رمز الوصول في GitHub ↗</a>' +
    '</div><div class="sa-token-row"><input id="saToken" type="password" autocomplete="off" spellcheck="false" placeholder="ألصق رمز GitHub هنا" aria-label="رمز الوصول إلى GitHub">' +
    '<button id="saConnectBtn">اتصال</button></div><p class="hint sa-token-hint">حدّد المستودع SAKR55/diamond-tv-site وصلاحية Contents: Read and write فقط.</p></div>' +
    '<div id="saWorkspace" hidden>' +
    '<div class="sa-tabs" role="tablist" aria-label="أقسام إدارة الموقع">' +
    '<button class="sa-tab active" data-view="files">ملفات الموقع</button>' +
    '<button class="sa-tab" data-view="articles">إضافة مقال أو صفحة</button>' +
    '<button class="sa-tab" data-view="publish">مراجعة ونشر</button></div>' +
    '<div class="sa-view" id="saFilesView"><div class="sa-toolbar card">' +
    '<div class="sa-file-search"><label for="saSearch">البحث في صفحات وملفات الموقع</label><input id="saSearch" type="search" placeholder="مثال: index.html أو style.css"></div>' +
    '<button class="ghost sm" id="saRefresh">تحديث الملفات</button><button class="ghost sm" id="saDisconnect">فصل الاتصال</button></div>' +
    '<div class="sa-editor-layout"><div class="sa-file-card card"><div class="sa-card-title">ملفات الموقع</div><label class="sa-upload-box">إضافة أو استبدال صورة للموقع<input id="saUpload" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple><span class="hint">PNG أو JPG أو WebP أو GIF أو AVIF · حتى 4 ميغابايت للصورة</span></label><div id="saFileList" class="sa-file-list"><p class="hint">جارٍ تحميل الملفات…</p></div></div>' +
    '<div class="sa-editor-card card"><div class="sa-editor-head"><div><b id="saEditorTitle">اختر ملفًا للتحرير</b><div id="saEditorMeta" class="hint"></div></div><button class="sm" id="saStageFile" disabled>إضافة التعديل</button></div>' +
    '<textarea id="saEditor" spellcheck="false" aria-label="محتوى الملف" placeholder="اختر ملفًا من القائمة"></textarea>' +
    '<div class="hint sa-editor-note">تظهر التعديلات في قائمة المراجعة أولًا، ولا تُنشر إلا عند الضغط على زر النشر.</div></div></div></div>' +
    '<div class="sa-view" id="saArticlesView" hidden><div class="sa-intro card"><h3>إنشاء محتوى جديد</h3>' +
    '<p class="hint">يُنشأ المحتوى مع عنوان ووصف لمحركات البحث وبيانات منظمة، ويُضاف المقال تلقائيًا إلى فهرس المقالات وخريطة الموقع.</p></div>' +
    '<div class="sa-create-grid"><form id="saArticleForm" class="card sa-form"><h3>مقال جديد</h3>' +
    '<label>عنوان المقال<input name="title" required maxlength="100" placeholder="عنوان واضح ومفيد للقارئ"></label>' +
    '<label>الرابط المختصر (إنجليزي)<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxlength="80" placeholder="ramadan-2027-series-guide"></label>' +
    '<label>وصف نتائج البحث<textarea name="description" required maxlength="160" rows="3" placeholder="ملخص دقيق يساعد القارئ على معرفة محتوى المقال"></textarea></label>' +
    '<div class="sa-two-col"><label>القسم<select name="category"><option value="مسلسلات">مسلسلات</option><option value="سينما">سينما</option><option value="رياضة">رياضة</option><option value="التطبيق">التطبيق</option></select></label>' +
    '<label>اسم الكاتب<input name="author" value="فريق DIAMOND TV" maxlength="60"></label></div>' +
    '<label>رابط صورة الغلاف (اختياري)<input name="image" type="url" placeholder="https://..."></label>' +
    '<label>وصف الصورة البديل<input name="imageAlt" maxlength="150" placeholder="وصف موجز للصورة"></label>' +
    '<label>محتوى المقال<textarea name="body" required rows="12" placeholder="اكتب محتوى أصليًا ومفيدًا. افصل الفقرات بسطر فارغ، واكتب ## قبل العنوان الفرعي، وابدأ كل نقطة بشرطة - ."></textarea></label>' +
    '<div class="sa-inline-form"><button type="button" class="ghost" id="saDraftOutline">إنشاء مخطط قابل للتحرير</button><button type="button" class="ghost" id="saSeoAudit">فحص المقال لمحركات البحث</button></div><div id="saSeoReport" class="sa-audit-report" hidden></div>' +
    '<button type="submit">إضافة المقال إلى قائمة النشر</button></form>' +
    '<form id="saPageForm" class="card sa-form"><h3>صفحة جديدة</h3>' +
    '<label>عنوان الصفحة<input name="title" required maxlength="100" placeholder="عنوان الصفحة"></label>' +
    '<label>الرابط المختصر (إنجليزي)<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxlength="80" placeholder="about-our-service"></label>' +
    '<label>وصف نتائج البحث<textarea name="description" required maxlength="160" rows="3"></textarea></label>' +
    '<label>محتوى الصفحة<textarea name="body" required rows="16" placeholder="اكتب معلومات دقيقة وواضحة. افصل الفقرات بسطر فارغ، واكتب ## قبل العنوان الفرعي، وابدأ كل نقطة بشرطة - ."></textarea></label>' +
    '<button type="submit">إضافة الصفحة إلى قائمة النشر</button></form></div></div>' +
    '<div class="sa-view" id="saPublishView" hidden><div class="card sa-publish-card"><div class="sa-editor-head"><div><h3>مراجعة التعديلات</h3><p class="hint">تُجمع الملفات في تحديث واحد. ستبقى النسخة المنشورة كما هي حتى نجاح النشر.</p></div>' +
    '<button id="saPublish" disabled>نشر التعديلات</button></div><div id="saPendingList" class="sa-pending-list"><p class="hint">لا توجد تعديلات معلّقة.</p></div>' +
    '<label class="sa-commit-label">وصف التحديث<input id="saCommitMessage" value="تحديث محتوى وتصميم DIAMOND TV" maxlength="120"></label><div id="saPublishError" class="sa-error" role="status"></div></div></div>' +
    '<div id="saToast" class="sa-toast" role="status" aria-live="polite"></div></div>';

  const dashboard = document.createElement("div");
  dashboard.id = "saDashboardView";
  dashboard.className = "sa-view";
  dashboard.innerHTML =
    '<div class="sa-dashboard-intro card"><span class="sa-eyebrow">إدارة سهلة</span><h3>لوحة الموقع</h3><p class="hint">عدّل الألوان والأقسام والبطولات، وأضف الترشيحات والمنتجات. راجع التغييرات ثم انشرها مرة واحدة.</p></div>' +
    '<div class="sa-dashboard-grid">' +
    '<section class="card sa-manager-card"><h3>ألوان الموقع</h3><label>اللون الرئيسي<input id="saAccent" type="color"></label><label>اللون المساند<input id="saAccent2" type="color"></label><button type="button" id="saSaveTheme">حفظ الألوان</button></section>' +
    '<section class="card sa-manager-card"><h3>أقسام الصفحة الرئيسية</h3><label class="sa-check"><input id="saLiveEnabled" type="checkbox"> المباريات المباشرة</label><label class="sa-check"><input id="saRecommendationsEnabled" type="checkbox"> ترشيحات السهرة</label><label class="sa-check"><input id="saStoreEnabled" type="checkbox"> المتجر</label><button type="button" id="saSaveSections">حفظ الأقسام</button></section>' +
    '<section class="card sa-manager-card sa-manager-wide"><h3>البطولات والقنوات</h3><p class="hint">سطر لكل بطولة: رمز البطولة | الاسم بالعربية | القنوات المعتادة مفصولة بفواصل.</p><textarea id="saLeagueEditor" rows="8" dir="auto"></textarea><button type="button" id="saSaveLeagues">حفظ البطولات</button></section>' +
    '<section class="card sa-manager-card sa-manager-wide"><h3>مسلسلات TVMaze</h3><p class="hint">ابحث عن مسلسل وأضفه؛ تُحدّث تقييماته تلقائيًا من المصدر.</p><div class="sa-inline-form"><input id="saTvSearch" placeholder="اسم المسلسل"><button type="button" id="saTvSearchBtn">بحث</button></div><div id="saTvResults" class="sa-manager-list"></div><h4>المسلسلات المختارة</h4><div id="saTvSelected" class="sa-manager-list"></div></section>' +
    '<section class="card sa-manager-card sa-manager-wide"><h3>ترشيحات الأفلام اليدوية</h3><p class="hint">تقييم أو وصف الأفلام هنا تحريري، وليس من مصدر خارجي.</p><form id="saMovieForm" class="sa-manager-form"><input name="title" required maxlength="100" placeholder="اسم الفيلم"><input name="image" type="url" placeholder="رابط صورة HTTPS (اختياري)"><input name="url" type="url" placeholder="رابط التفاصيل HTTPS (اختياري)"><textarea name="description" required rows="2" maxlength="260" placeholder="لماذا ترشحه؟"></textarea><button type="submit">إضافة الفيلم</button></form><div id="saMovieList" class="sa-manager-list"></div></section>' +
    '<section class="card sa-manager-card sa-manager-wide"><h3>منتجات المتجر</h3><p class="hint">أضف وصف المنتج والسعر ورابط الطلب. الدفع الإلكتروني يحتاج مزود دفع منفصل.</p><form id="saProductForm" class="sa-manager-form"><input name="id" type="hidden"><div class="sa-manager-two"><input name="title" required maxlength="100" placeholder="اسم المنتج"><input name="category" maxlength="50" placeholder="القسم"></div><textarea name="description" required rows="2" maxlength="300" placeholder="وصف المنتج"></textarea><div class="sa-manager-two"><input name="price" maxlength="40" placeholder="السعر (اختياري)"><input name="currency" maxlength="12" value="ر.س" placeholder="العملة"></div><div class="sa-manager-two"><input name="image" type="url" placeholder="رابط صورة HTTPS (اختياري)"><input name="imageAlt" maxlength="140" placeholder="وصف الصورة"></div><input name="url" type="url" placeholder="رابط التفاصيل أو الطلب HTTPS"><label class="sa-check"><input name="active" type="checkbox" checked> المنتج متاح للعرض</label><button type="submit">حفظ المنتج</button></form><div id="saProductList" class="sa-manager-list"></div></section>' +
    '</div><div class="sa-manager-footer card"><span>كل تغيير يضاف لقائمة المراجعة؛ النشر يبدأ عند الضغط على «نشر التعديلات».</span><button type="button" class="ghost sm" id="saStageConfig">حفظ تغييرات لوحة الموقع</button></div>';
  sitePanel.querySelector(".sa-tabs").innerHTML =
    '<button class="sa-tab active" data-view="dashboard">لوحة الموقع</button>' +
    '<button class="sa-tab" data-view="articles">المقالات وفحص SEO</button>' +
    '<button class="sa-tab" data-view="publish">مراجعة ونشر</button>' +
    '<button class="sa-tab" data-view="files">ملفات متقدمة</button>';
  sitePanel.querySelector("#saFilesView").before(dashboard);

  const nav = document.createElement("nav");
  nav.className = "site-main-tabs";
  nav.setAttribute("aria-label", "أقسام لوحة الإدارة");
  nav.innerHTML = '<button class="site-main-tab active" data-panel="siteControlPanel">إدارة الموقع</button>' +
    '<button class="site-main-tab" data-panel="subscriptionsPanel">الاشتراكات</button>';
  app.appendChild(nav);
  app.appendChild(sitePanel);
  app.appendChild(subsPanel);

  function $(selector) { return sitePanel.querySelector(selector); }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }
  function toast(message) {
    const element = $("#saToast");
    element.textContent = message;
    element.classList.add("show");
    window.clearTimeout(element._timer);
    element._timer = window.setTimeout(function () { element.classList.remove("show"); }, 2800);
  }
  function setStatus(message, connected) {
    const status = $("#saStatus");
    status.textContent = message;
    status.classList.toggle("connected", Boolean(connected));
  }
  async function api(path, options) {
    const opts = options || {};
    const response = await fetch(API + path, {
      method: opts.method || "GET",
      headers: {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) throw new Error(data.message || ("GitHub أعاد الحالة " + response.status));
    return data;
  }
  function apiPath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }
  function decodeBase64(text) {
    const binary = atob(text.replace(/\s/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }
  async function loadTree() {
    setStatus("جارٍ تحميل ملفات الموقع…", false);
    const branch = await api("/branches/" + BRANCH);
    const commit = branch.commit.sha;
    const treeSha = branch.commit.commit.tree.sha;
    const tree = await api("/git/trees/" + treeSha + "?recursive=1");
    treeFiles = (tree.tree || []).filter(function (entry) {
      return entry.type === "blob" && /\.(html?|css|js|json|xml|txt|md|svg|webmanifest|png|jpe?g|webp|gif|avif)$/i.test(entry.path);
    }).sort(function (a, b) { return a.path.localeCompare(b.path); });
    if (tree.truncated) toast("قائمة الملفات كبيرة؛ تعرض الملفات التي أعادها GitHub فقط.");
    $("#saFileList").replaceChildren();
    if (!treeFiles.length) $("#saFileList").innerHTML = '<p class="hint">لم تُعثر على ملفات نصية.</p>';
    renderFileList();
    await loadDashboardConfig();
    setStatus("متصل بالمستودع · main", true);
    $("#saWorkspace").hidden = false;
    $("#saConnect").hidden = true;
    return { commit: commit, tree: tree };
  }
  function renderFileList() {
    const list = $("#saFileList");
    const query = ($("#saSearch").value || "").trim().toLowerCase();
    const matches = treeFiles.filter(function (item) { return !query || item.path.toLowerCase().includes(query); });
    list.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "hint";
      empty.textContent = "لا توجد ملفات تطابق البحث.";
      list.appendChild(empty);
      return;
    }
    matches.forEach(function (item) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sa-file" + (item.path === selectedPath ? " selected" : "");
      button.textContent = item.path;
      button.title = item.path;
      button.addEventListener("click", function () { openFile(item.path); });
      list.appendChild(button);
    });
  }
  async function fetchFile(path) {
    const data = await api("/contents/" + apiPath(path) + "?ref=" + encodeURIComponent(BRANCH));
    const content = decodeBase64(data.content || "");
    original[path] = { sha: data.sha, content: content };
    return content;
  }
  async function openFile(path) {
    selectedPath = path;
    renderFileList();
    $("#saEditorTitle").textContent = path;
    $("#saEditor").value = "";
    $("#saEditor").disabled = true;
    $("#saStageFile").disabled = true;
    const file = treeFiles.find(function (item) { return item.path === path; });
    if (/\.(png|jpe?g|webp|gif|avif)$/i.test(path)) {
      selectedOriginal = "";
      if (file && !original[path]) original[path] = { sha: file.sha, content: "" };
      $("#saEditorMeta").textContent = "صورة موجودة. استخدم خيار إضافة أو استبدال صورة لحفظ نسخة جديدة.";
      return;
    }
    $("#saEditor").value = "جارٍ تحميل الملف…";
    try {
      const content = await fetchFile(path);
      selectedOriginal = content;
      $("#saEditor").value = Object.prototype.hasOwnProperty.call(pending, path) ? pending[path] : content;
      $("#saEditor").disabled = false;
      $("#saStageFile").disabled = false;
      $("#saEditorMeta").textContent = "آخر نسخة من الفرع " + BRANCH + (pending[path] ? " · يوجد تعديل معلّق" : "");
    } catch (error) {
      $("#saEditor").value = "";
      $("#saEditorMeta").textContent = error.message;
      toast("تعذّر فتح الملف.");
    }
  }
  function renderPending() {
    const list = $("#saPendingList");
    const paths = Array.from(new Set(Object.keys(pending).concat(Object.keys(binaryPending)))).sort();
    list.replaceChildren();
    if (!paths.length) {
      list.innerHTML = '<p class="hint">لا توجد تعديلات معلّقة.</p>';
      $("#saPublish").disabled = true;
      return;
    }
    paths.forEach(function (path) {
      const row = document.createElement("div"); row.className = "sa-pending-row";
      const name = document.createElement("span"); name.textContent = path + (binaryPending[path] ? " · صورة" : "");
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "ghost sm"; remove.textContent = "إزالة";
      remove.addEventListener("click", function () {
        delete pending[path]; delete binaryPending[path];
        if (selectedPath === path) { $("#saEditor").value = original[path] ? original[path].content : ""; $("#saEditorMeta").textContent = "تمت إزالة التعديل المعلّق."; }
        renderPending(); renderFileList();
      });
      row.append(name, remove); list.appendChild(row);
    });
    $("#saPublish").disabled = false;
  }
  function stage(path, content, baseContent) {
    delete binaryPending[path];
    pending[path] = content;
    if (!original[path]) original[path] = { sha: null, content: baseContent || "" };
    renderPending();
    renderFileList();
    toast("أُضيف " + path + " إلى قائمة النشر.");
  }
  function defaultSiteConfig() {
    return {
      version: 1,
      theme: { accent: "#6d4aff", accent2: "#0c9fa2" },
      sections: { live: true, recommendations: true, store: true },
      leagues: [],
      recommendations: { tvmazeIds: [], movies: [] },
      products: []
    };
  }
  async function loadDashboardConfig() {
    try {
      const raw = await fetchFile("assets/site-config.json");
      siteConfig = Object.assign(defaultSiteConfig(), JSON.parse(raw));
    } catch (_) { siteConfig = siteConfig || defaultSiteConfig(); }
    siteConfig.theme = Object.assign({ accent: "#6d4aff", accent2: "#0c9fa2" }, siteConfig.theme || {});
    siteConfig.sections = Object.assign({ live: true, recommendations: true, store: true }, siteConfig.sections || {});
    siteConfig.recommendations = Object.assign({ tvmazeIds: [], movies: [] }, siteConfig.recommendations || {});
    siteConfig.leagues = Array.isArray(siteConfig.leagues) ? siteConfig.leagues : [];
    siteConfig.products = Array.isArray(siteConfig.products) ? siteConfig.products : [];
    renderDashboard();
  }
  function renderDashboard() {
    if (!siteConfig) return;
    $("#saAccent").value = /^#[0-9a-f]{6}$/i.test(siteConfig.theme.accent || "") ? siteConfig.theme.accent : "#6d4aff";
    $("#saAccent2").value = /^#[0-9a-f]{6}$/i.test(siteConfig.theme.accent2 || "") ? siteConfig.theme.accent2 : "#0c9fa2";
    $("#saLiveEnabled").checked = siteConfig.sections.live !== false;
    $("#saRecommendationsEnabled").checked = siteConfig.sections.recommendations !== false;
    $("#saStoreEnabled").checked = siteConfig.sections.store !== false;
    $("#saLeagueEditor").value = siteConfig.leagues.map(function (league) {
      return [league.id, league.ar, (league.tv || []).join("، ")].join(" | ");
    }).join("\n");
    $("#saTvSelected").innerHTML = siteConfig.recommendations.tvmazeIds.map(function (id) {
      return '<div class="sa-manager-row"><span>مسلسل TVMaze رقم ' + escapeHtml(id) + '</span><button type="button" class="ghost sm" data-remove-show="' + escapeHtml(id) + '">حذف</button></div>';
    }).join("") || '<p class="hint">لم تُضف مسلسلات بعد.</p>';
    $("#saMovieList").innerHTML = siteConfig.recommendations.movies.map(function (movie, index) {
      return '<div class="sa-manager-row"><span><b>' + escapeHtml(movie.title) + '</b><small>' + escapeHtml(movie.description) + '</small></span><button type="button" class="ghost sm" data-remove-movie="' + index + '">حذف</button></div>';
    }).join("") || '<p class="hint">لم تُضف أفلامًا بعد.</p>';
    $("#saProductList").innerHTML = siteConfig.products.map(function (product, index) {
      return '<div class="sa-manager-row"><span><b>' + escapeHtml(product.title) + '</b><small>' + escapeHtml(product.price || "بدون سعر") + (product.active === false ? " · مخفي" : " · ظاهر") + '</small></span>' +
        '<span class="sa-manager-actions"><button type="button" class="ghost sm" data-edit-product="' + index + '">تعديل</button><button type="button" class="ghost sm" data-remove-product="' + index + '">حذف</button></span></div>';
    }).join("") || '<p class="hint">المتجر فارغ؛ أضف أول منتج من النموذج.</p>';
  }
  function stageDashboardConfig(message) {
    stage("assets/site-config.json", JSON.stringify(siteConfig, null, 2) + "\n", original["assets/site-config.json"] && original["assets/site-config.json"].content);
    if (message) toast(message);
  }
  function safeDashboardUrl(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    try { const url = new URL(text); return url.protocol === "https:" ? url.href : ""; } catch (_) { return ""; }
  }
  async function searchTvMaze() {
    const query = $("#saTvSearch").value.trim();
    if (query.length < 2) { toast("اكتب اسم مسلسل للبحث."); return; }
    $("#saTvSearchBtn").disabled = true;
    $("#saTvResults").innerHTML = '<p class="hint">جارٍ البحث في TVMaze…</p>';
    try {
      const response = await fetch("https://api.tvmaze.com/search/shows?q=" + encodeURIComponent(query));
      if (!response.ok) throw new Error("تعذّر الاتصال بمصدر المسلسلات.");
      const results = await response.json();
      $("#saTvResults").innerHTML = results.slice(0, 8).map(function (result) {
        const show = result.show || {};
        const rating = show.rating && show.rating.average ? " · ★ " + show.rating.average : "";
        return '<div class="sa-manager-row"><span><b>' + escapeHtml(show.name || "مسلسل") + '</b><small>' + escapeHtml(show.premiered || "") + escapeHtml(rating) + '</small></span><button type="button" class="ghost sm" data-add-show="' + Number(show.id) + '">إضافة</button></div>';
      }).join("") || '<p class="hint">لا توجد نتائج بهذا الاسم.</p>';
    } catch (error) {
      $("#saTvResults").innerHTML = '<p class="hint">' + escapeHtml(error.message || "تعذّر البحث.") + '</p>';
    } finally { $("#saTvSearchBtn").disabled = false; }
  }
  function switchView(name) {
    sitePanel.querySelectorAll(".sa-tab").forEach(function (button) {
      button.classList.toggle("active", button.dataset.view === name);
    });
    $("#saDashboardView").hidden = name !== "dashboard";
    $("#saFilesView").hidden = name !== "files";
    $("#saArticlesView").hidden = name !== "articles";
    $("#saPublishView").hidden = name !== "publish";
  }
  function metaField(form, name) { return String(new FormData(form).get(name) || "").trim(); }
  function formatBody(text) {
    const blocks = String(text || "").trim().split(/\n\s*\n/).map(function (block) { return block.trim(); }).filter(Boolean);
    return blocks.map(function (block) {
      if (block.indexOf("### ") === 0) return "<h3>" + escapeHtml(block.slice(4)) + "</h3>";
      if (block.indexOf("## ") === 0) return "<h2>" + escapeHtml(block.slice(3)) + "</h2>";
      const lines = block.split(/\r?\n/);
      if (lines.every(function (line) { return /^\s*-\s+/.test(line); })) return "<ul>" + lines.map(function (line) { return "<li>" + escapeHtml(line.replace(/^\s*-\s+/, "")) + "</li>"; }).join("") + "</ul>";
      return "<p>" + escapeHtml(block).replace(/\r?\n/g, "<br>") + "</p>";
    }).join("\n");
  }
  function articleTemplate(data, path, isArticle) {
    const now = new Date().toISOString().slice(0, 10);
    const canonical = "https://diamond-tv.shop/" + path;
    const safeTitle = escapeHtml(data.title);
    const safeDescription = escapeHtml(data.description);
    const safeImage = escapeHtml(data.image || "https://diamond-tv.shop/assets/og.png");
    const articleType = isArticle ? "Article" : "WebPage";
    const schema = {
      "@context": "https://schema.org",
      "@type": articleType,
      "headline": data.title,
      "name": data.title,
      "description": data.description,
      "url": canonical,
      "inLanguage": "ar",
      "datePublished": now,
      "dateModified": now
    };
    if (data.image) schema.image = data.image;
    if (isArticle) schema.author = { "@type": "Person", "name": data.author || "فريق DIAMOND TV" };
    return '<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n' +
      '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<title>' + safeTitle + ' | DIAMOND TV</title>\n' +
      '<meta name="description" content="' + safeDescription + '">\n' +
      '<link rel="canonical" href="' + escapeHtml(canonical) + '">\n' +
      '<meta property="og:type" content="' + (isArticle ? "article" : "website") + '"><meta property="og:title" content="' + safeTitle + ' | DIAMOND TV">\n' +
      '<meta property="og:description" content="' + safeDescription + '"><meta property="og:url" content="' + escapeHtml(canonical) + '"><meta property="og:image" content="' + safeImage + '">\n' +
      '<link rel="stylesheet" href="../assets/style.css">\n' +
      '<script src="../assets/site-config.js"></script>\n' +
      '<script type="application/ld+json">' + JSON.stringify(schema).replace(/</g, "\\u003c") + '</script>\n' +
      '</head>\n<body>\n<main class="wrap sa-content-page">\n' +
      '<nav class="sa-breadcrumb"><a href="../index.html">الرئيسية</a> / ' + (isArticle ? '<a href="./">المقالات</a> / ' : "") + safeTitle + '</nav>\n' +
      '<article class="sa-article"><p class="pill">' + escapeHtml(data.category || "DIAMOND TV") + '</p><h1>' + safeTitle + '</h1>\n' +
      '<p class="sa-article-lead">' + safeDescription + '</p>\n' +
      (data.image ? '<figure><img src="' + safeImage + '" alt="' + escapeHtml(data.imageAlt || data.title) + '" loading="lazy"></figure>\n' : "") +
      '<div class="sa-article-body">\n' + data.body + '\n</div>\n' +
      '<p class="hint sa-updated">آخر تحديث: <time datetime="' + now + '">' + now + '</time></p></article>\n' +
      '</main>\n<script src="../assets/site.js"></script>\n</body>\n</html>\n';
  }
  async function prepareNewContent(form, kind) {
    if (!form.reportValidity()) return;
    const data = {
      title: metaField(form, "title"),
      slug: metaField(form, "slug"),
      description: metaField(form, "description"),
      body: formatBody(metaField(form, "body")),
      category: metaField(form, "category"),
      author: metaField(form, "author"),
      image: metaField(form, "image"),
      imageAlt: metaField(form, "imageAlt")
    };
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
      toast("اكتب الرابط المختصر بأحرف إنجليزية صغيرة وأرقام وواصلات.");
      return;
    }
    const article = kind === "article";
    const path = article ? "articles/" + data.slug + ".html" : "pages/" + data.slug + ".html";
    if (treeFiles.some(function (item) { return item.path === path; }) || pending[path]) {
      toast("هذا الرابط مستخدم بالفعل.");
      return;
    }
    const content = articleTemplate(data, path, article);
    stage(path, content, "");
    const today = new Date().toISOString().slice(0, 10);
    const canonical = "https://diamond-tv.shop/" + path;
    if (article) {
      try {
        let listing = pending["articles/index.html"];
        if (!listing) listing = await fetchFile("articles/index.html");
        if (listing.indexOf('href="' + data.slug + '.html"') !== -1) throw new Error("المقال موجود مسبقًا في فهرس المقالات.");
        const card = '<a class="card" data-c="' + escapeHtml(data.category || "مسلسلات") + '" href="' + data.slug + '.html"><span class="tag">' +
          escapeHtml(data.category || "مسلسلات") + '</span><h3>' + escapeHtml(data.title) + '</h3><p>' + escapeHtml(data.description) + '</p></a>';
        const endMarker = "</div></main>";
        const endAt = listing.lastIndexOf(endMarker);
        if (endAt < 0) throw new Error("تعذّر تحديد مكان إضافة المقال إلى صفحة الفهرس.");
        listing = listing.slice(0, endAt) + card + "\n" + listing.slice(endAt);
        const schemaTag = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
        const match = listing.match(schemaTag);
        if (match) {
          const graph = JSON.parse(match[1]);
          const itemList = (graph["@graph"] || []).find(function (item) { return item["@type"] === "ItemList"; });
          if (itemList) {
            itemList.itemListElement = itemList.itemListElement || [];
            itemList.itemListElement.push({
              "@type": "ListItem",
              "position": itemList.itemListElement.length + 1,
              "url": canonical,
              "name": data.title
            });
            listing = listing.replace(match[0], '<script type="application/ld+json">' + JSON.stringify(graph) + "</script>");
          }
        }
        stage("articles/index.html", listing, original["articles/index.html"] && original["articles/index.html"].content);
      } catch (error) {
        delete pending[path];
        renderPending();
        toast(error.message || "تعذّرت إضافة المقال إلى الفهرس.");
        return;
      }
    }
    try {
      let sitemap = pending["sitemap.xml"];
      if (!sitemap) sitemap = await fetchFile("sitemap.xml");
      if (sitemap.indexOf("<loc>" + canonical + "</loc>") === -1) {
        const at = sitemap.lastIndexOf("</urlset>");
        if (at < 0) throw new Error("تعذّرت إضافة الرابط إلى خريطة الموقع.");
        sitemap = sitemap.slice(0, at) + "  <url><loc>" + canonical + "</loc><lastmod>" + today +
          "</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n" + sitemap.slice(at);
        stage("sitemap.xml", sitemap, original["sitemap.xml"] && original["sitemap.xml"].content);
      }
    } catch (error) {
      delete pending[path];
      if (article) delete pending["articles/index.html"];
      renderPending();
      toast(error.message || "تعذّرت تحديث خريطة الموقع.");
      return;
    }
    form.reset();
    toast(article ? "أُضيف المقال مع الفهرس وخريطة الموقع." : "أُضيفت الصفحة مع خريطة الموقع.");
    switchView("publish");
  }
  function switchMainPanel(panelId) {
    nav.querySelectorAll(".site-main-tab").forEach(function (button) {
      button.classList.toggle("active", button.dataset.panel === panelId);
    });
    sitePanel.hidden = panelId !== sitePanel.id;
    subsPanel.hidden = panelId !== subsPanel.id;
  }

  nav.addEventListener("click", function (event) {
    const button = event.target.closest("[data-panel]");
    if (button) switchMainPanel(button.dataset.panel);
  });
  sitePanel.addEventListener("click", function (event) {
    const tab = event.target.closest(".sa-tab");
    if (tab) switchView(tab.dataset.view);
  });
  $("#saSaveTheme").addEventListener("click", function () {
    siteConfig.theme = { accent: $("#saAccent").value, accent2: $("#saAccent2").value };
    stageDashboardConfig("تم حفظ الألوان للمراجعة.");
  });
  $("#saSaveSections").addEventListener("click", function () {
    siteConfig.sections = { live: $("#saLiveEnabled").checked, recommendations: $("#saRecommendationsEnabled").checked, store: $("#saStoreEnabled").checked };
    stageDashboardConfig("تم حفظ إعدادات الأقسام للمراجعة.");
  });
  $("#saSaveLeagues").addEventListener("click", function () {
    const rows = $("#saLeagueEditor").value.split(/\r?\n/).map(function (line) { return line.split("|").map(function (part) { return part.trim(); }); }).filter(function (parts) { return parts.length >= 2 && parts[0] && parts[1]; });
    if (!rows.length) { toast("أدخل بطولة واحدة على الأقل."); return; }
    if (rows.some(function (parts) { return !/^[a-z0-9.]+$/i.test(parts[0]); })) { toast("رمز البطولة يجب أن يتكوّن من أحرف إنجليزية وأرقام ونقاط."); return; }
    siteConfig.leagues = rows.map(function (parts) { return { id: parts[0], ar: parts[1], tv: (parts[2] || "").split(/[،,]/).map(function (name) { return name.trim(); }).filter(Boolean) }; });
    stageDashboardConfig("تم حفظ البطولات والقنوات للمراجعة.");
  });
  $("#saStageConfig").addEventListener("click", function () { stageDashboardConfig("أُضيفت إعدادات الموقع إلى قائمة النشر."); });
  $("#saTvSearchBtn").addEventListener("click", searchTvMaze);
  $("#saTvSearch").addEventListener("keydown", function (event) { if (event.key === "Enter") { event.preventDefault(); searchTvMaze(); } });
  $("#saTvResults").addEventListener("click", function (event) {
    const button = event.target.closest("[data-add-show]");
    if (!button) return;
    const id = Number(button.dataset.addShow), ids = siteConfig.recommendations.tvmazeIds || [];
    if (!Number.isInteger(id) || id <= 0 || ids.includes(id)) return;
    siteConfig.recommendations.tvmazeIds = ids.concat([id]).slice(0, 12);
    renderDashboard(); stageDashboardConfig("أُضيف المسلسل إلى الترشيحات.");
  });
  dashboard.addEventListener("click", function (event) {
    const show = event.target.closest("[data-remove-show]");
    if (show) { siteConfig.recommendations.tvmazeIds = siteConfig.recommendations.tvmazeIds.filter(function (id) { return String(id) !== show.dataset.removeShow; }); renderDashboard(); stageDashboardConfig("حُذف المسلسل من الترشيحات."); return; }
    const movie = event.target.closest("[data-remove-movie]");
    if (movie) { siteConfig.recommendations.movies.splice(Number(movie.dataset.removeMovie), 1); renderDashboard(); stageDashboardConfig("حُذف الفيلم من الترشيحات."); return; }
    const remove = event.target.closest("[data-remove-product]");
    if (remove) { siteConfig.products.splice(Number(remove.dataset.removeProduct), 1); renderDashboard(); stageDashboardConfig("حُذف المنتج من قائمة العرض."); return; }
    const edit = event.target.closest("[data-edit-product]");
    if (edit) {
      const item = siteConfig.products[Number(edit.dataset.editProduct)], form = $("#saProductForm");
      if (!item) return;
      Object.keys(item).forEach(function (key) { if (form.elements[key]) form.elements[key].value = item[key] == null ? "" : item[key]; });
      form.elements.active.checked = item.active !== false;
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
  $("#saMovieForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget, data = new FormData(form), title = String(data.get("title") || "").trim(), description = String(data.get("description") || "").trim();
    if (!title || !description) return;
    function safeUrl(value) { try { const url = new URL(String(value || "").trim()); return url.protocol === "https:" ? url.href : ""; } catch (_) { return ""; } }
    siteConfig.recommendations.movies = siteConfig.recommendations.movies.concat([{ title: title, description: description, image: safeUrl(data.get("image")), url: safeUrl(data.get("url")) }]).slice(0, 12);
    form.reset(); renderDashboard(); stageDashboardConfig("أُضيف الفيلم إلى الترشيحات اليدوية.");
  });
  $("#saProductForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget, data = new FormData(form), title = String(data.get("title") || "").trim(), description = String(data.get("description") || "").trim();
    if (!title || !description) return;
    function safeUrl(value) { try { const url = new URL(String(value || "").trim()); return url.protocol === "https:" ? url.href : ""; } catch (_) { return ""; } }
    const currentId = String(data.get("id") || "");
    const product = { id: currentId || "product-" + Date.now(), title: title, category: String(data.get("category") || "").trim(), description: description, price: String(data.get("price") || "").trim(), currency: String(data.get("currency") || "").trim(), image: safeUrl(data.get("image")), imageAlt: String(data.get("imageAlt") || "").trim(), url: safeUrl(data.get("url")), active: form.elements.active.checked };
    const index = siteConfig.products.findIndex(function (item) { return item.id === currentId; });
    if (index >= 0) siteConfig.products[index] = product; else siteConfig.products.push(product);
    form.reset(); form.elements.currency.value = "ر.س"; form.elements.active.checked = true;
    renderDashboard(); stageDashboardConfig("تم حفظ المنتج في قائمة النشر.");
  });
  $("#saConnectBtn").addEventListener("click", async function () {
    token = $("#saToken").value.trim();
    if (!token) { toast("أدخل رمز الوصول أولًا."); return; }
    $("#saConnectBtn").disabled = true;
    try { await loadTree(); }
    catch (error) {
      token = "";
      $("#saToken").value = "";
      setStatus("تعذّر الاتصال", false);
      toast("فشل الاتصال: " + error.message);
    } finally { $("#saConnectBtn").disabled = false; }
  });
  $("#saToken").addEventListener("keydown", function (event) {
    if (event.key === "Enter") $("#saConnectBtn").click();
  });
  $("#saUpload").addEventListener("change", async function (event) {
    const files = Array.from(event.target.files || []);
    for (const file of files) {
      if (!/\.(png|jpe?g|webp|gif|avif)$/i.test(file.name)) { toast("ارفع صورة PNG أو JPG أو WebP أو GIF أو AVIF."); continue; }
      if (file.size > 4 * 1024 * 1024) { toast("حجم الصورة يتجاوز 4 ميغابايت."); continue; }
      const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^\.+/, "");
      if (!name) { toast("اسم الملف غير صالح."); continue; }
      const path = "assets/" + name;
      const exists = treeFiles.find(function (item) { return item.path === path; });
      if (exists && !window.confirm("استبدال الصورة " + path + "؟")) continue;
      const reader = new FileReader();
      const base64 = await new Promise(function (resolve, reject) { reader.onload = function () { resolve(String(reader.result).split(",")[1] || ""); }; reader.onerror = reject; reader.readAsDataURL(file); });
      if (!original[path]) original[path] = { sha: exists ? exists.sha : null, content: "" };
      binaryPending[path] = base64; delete pending[path];
    }
    event.target.value = ""; renderPending(); renderFileList();
    if (Object.keys(binaryPending).length) toast("أُضيفت الصورة إلى قائمة النشر.");
  });
  $("#saSearch").addEventListener("input", renderFileList);
  $("#saRefresh").addEventListener("click", async function () {
    try { await loadTree(); toast("تم تحديث قائمة الملفات."); }
    catch (error) { toast("تعذّر تحديث الملفات: " + error.message); }
  });
  $("#saDisconnect").addEventListener("click", function () {
    token = "";
    treeFiles = [];
    original = Object.create(null);
    pending = Object.create(null);
    binaryPending = Object.create(null);
    selectedPath = "";
    $("#saWorkspace").hidden = true;
    $("#saConnect").hidden = false;
    $("#saToken").value = "";
    $("#saEditor").value = "";
    setStatus("غير متصل", false);
    renderPending();
    toast("تم فصل الاتصال ومسح التعديلات غير المنشورة.");
  });
  $("#saStageFile").addEventListener("click", function () {
    if (!selectedPath || $("#saEditor").disabled) return;
    stage(selectedPath, $("#saEditor").value, selectedOriginal);
    $("#saEditorMeta").textContent = "التعديل جاهز للمراجعة والنشر.";
  });
  function articleAudit(form) {
    const value = function (name) { return String(new FormData(form).get(name) || "").trim(); };
    const title = value("title"), description = value("description"), body = value("body");
    const words = body.split(/\s+/).filter(Boolean).length;
    const headings = (body.match(/^#{2,3}\s+/gm) || []).length;
    const checks = [
      ["العنوان", title.length >= 30 && title.length <= 60, title.length + " حرفًا؛ استهدف عادةً 30–60."],
      ["وصف نتائج البحث", description.length >= 80 && description.length <= 160, description.length + " حرفًا؛ اجعله واضحًا ومحددًا."],
      ["محتوى مفيد", words >= 300, words + " كلمة؛ أضف معلومات أصلية ومصادر موثوقة."],
      ["عناوين فرعية", headings >= 2, headings + " عنوانًا بصيغة ## أو ###."],
      ["رابط مختصر", /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value("slug")), "استخدم رابطًا قصيرًا يسهل قراءته."],
      ["وصف الصورة", !value("image") || Boolean(value("imageAlt")), value("image") && !value("imageAlt") ? "أضف نصًا بديلًا للصورة." : "مناسب."]
    ];
    const passed = checks.filter(function (check) { return check[1]; }).length;
    $("#saSeoReport").innerHTML = '<div class="sa-audit-score">' + passed + ' من ' + checks.length + ' نقاط مكتملة</div>' +
      checks.map(function (check) { return '<div class="sa-audit-row ' + (check[1] ? "good" : "needs-work") + '"><b>' + (check[1] ? "✓ " : "• ") + escapeHtml(check[0]) + '</b><span>' + escapeHtml(check[2]) + '</span></div>'; }).join("") +
      '<p class="hint">هذا فحص تحريري إرشادي ولا يضمن ترتيبًا في نتائج البحث.</p>';
    $("#saSeoReport").hidden = false;
  }
  $("#saSeoAudit").addEventListener("click", function () { articleAudit($("#saArticleForm")); });
  $("#saDraftOutline").addEventListener("click", function () {
    const form = $("#saArticleForm"), title = metaField(form, "title"), description = metaField(form, "description");
    if (!title || !description) { toast("أدخل العنوان والوصف أولًا لصنع مخطط المقال."); return; }
    const body = form.elements.body;
    if (body.value.trim() && !window.confirm("سيُستبدل النص الحالي بمخطط قابل للتحرير. متابعة؟")) return;
    body.value = description + "\n\n## ما الذي يحتاج القارئ إلى معرفته؟\n\nاكتب إجابة مباشرة ومدعومة بمعلومات دقيقة عن: " + title +
      "\n\n## التفاصيل الأساسية\n\nأضف الحقائق والأسماء والتواريخ والمصادر التي راجعتها.\n\n## نقاط المقارنة أو الاختيار\n\nاشرح الخيارات والفروق العملية بوضوح، مع تجنب التكرار.\n\n## أسئلة شائعة\n\n### ما أهم سؤال يطرحه القارئ؟\n\nأجب بإيجاز، ثم أضف أسئلة مرتبطة بالموضوع.\n\n## خلاصة\n\nلخّص ما يحتاج القارئ إلى تذكره.";
    articleAudit(form);
    toast("أُنشئ مخطط قابل للتحرير. راجع الحقائق واكتب محتوى أصليًا قبل النشر.");
  });
  $("#saArticleForm").addEventListener("submit", function (event) {
    event.preventDefault();
    prepareNewContent(event.currentTarget, "article");
  });
  $("#saPageForm").addEventListener("submit", function (event) {
    event.preventDefault();
    prepareNewContent(event.currentTarget, "page");
  });
  $("#saPublish").addEventListener("click", async function () {
    const paths = Array.from(new Set(Object.keys(pending).concat(Object.keys(binaryPending)))).sort();
    if (!paths.length) return;
    $("#saPublish").disabled = true;
    $("#saPublishError").textContent = "";
    setStatus("جارٍ نشر التغييرات…", false);
    try {
      const branch = await api("/branches/" + BRANCH);
      const baseCommit = branch.commit.sha;
      const baseTree = branch.commit.commit.tree.sha;
      const currentTree = await api("/git/trees/" + baseTree + "?recursive=1");
      const currentMap = Object.create(null);
      (currentTree.tree || []).forEach(function (entry) { currentMap[entry.path] = entry.sha; });
      for (const path of paths) {
        const expected = original[path] ? original[path].sha : null;
        const latest = currentMap[path] || null;
        if (expected !== latest) throw new Error("تغيّر الملف " + path + " على GitHub منذ فتحه. حدّثه وراجع التعديل مجددًا.");
      }
      const treeEntries = [];
      for (const path of paths) {
        if (binaryPending[path]) {
          const blob = await api("/git/blobs", { method: "POST", body: { content: binaryPending[path], encoding: "base64" } });
          treeEntries.push({ path: path, mode: "100644", type: "blob", sha: blob.sha });
        } else treeEntries.push({ path: path, mode: "100644", type: "blob", content: pending[path] });
      }
      const newTree = await api("/git/trees", { method: "POST", body: { base_tree: baseTree, tree: treeEntries } });
      const commit = await api("/git/commits", { method: "POST", body: {
        message: ($("#saCommitMessage").value || "تحديث محتوى DIAMOND TV").trim(),
        tree: newTree.sha,
        parents: [baseCommit]
      } });
      await api("/git/refs/heads/" + BRANCH, { method: "PATCH", body: { sha: commit.sha, force: false } });
      pending = Object.create(null);
      binaryPending = Object.create(null);
      original = Object.create(null);
      renderPending();
      await loadTree();
      $("#saEditor").value = "";
      $("#saEditorMeta").textContent = "";
      $("#saEditorTitle").textContent = "اختر ملفًا للتحرير";
      selectedPath = "";
      setStatus("تم النشر · main", true);
      toast("نُشرت التغييرات في تحديث واحد.");
    } catch (error) {
      $("#saPublishError").textContent = error.message || "تعذّر النشر.";
      setStatus("يوجد خطأ يحتاج مراجعة", false);
    } finally { $("#saPublish").disabled = Object.keys(pending).length + Object.keys(binaryPending).length === 0; }
  });
  window.addEventListener("beforeunload", function () {
    token = "";
  });
  switchMainPanel(sitePanel.id);
  switchView("dashboard");
})();
