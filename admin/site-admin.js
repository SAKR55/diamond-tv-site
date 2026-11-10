(function () {
  "use strict";
  const OWNER = "SAKR55";
  const REPO = "diamond-tv-site";
  const BRANCH = "main";
  const API = "https://api.github.com/repos/" + OWNER + "/" + REPO;
  const DRAFT_CACHE_KEY = "diamond-tv-admin-pending-v1";
  const app = document.getElementById("app");
  if (!app) return;

  let token = "";
  let treeFiles = [];
  let original = Object.create(null);
  let pending = Object.create(null);
  let binaryPending = Object.create(null);
  let pendingDeletes = Object.create(null);
  let selectedPath = "";
  let selectedOriginal = "";
  let siteConfig = null;
  let autoPublishTimer = 0;
  let autoPublishPaths = new Set();
  let publishInProgress = false;
  let trendsLoaded = false;
  let trendItems = [];
  let trendUpdatedAt = "";
  let activeTrendFactReport = null;
  let activeResearchSources = [];
  let activeLinkCheckResults = [];
  let activeLinkCheckReport = null;
  let articleResearchInProgress = false;
  let articleLinkCheckInProgress = false;
  let productImportInProgress = false;
  let replaceTvMazeId = "";

  function restorePendingCache() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DRAFT_CACHE_KEY) || "null");
      if (!saved || typeof saved !== "object") return;
      Object.keys(saved.pending || {}).forEach(function (path) {
        if (/^(?:articles|pages|assets)\/[a-zA-Z0-9._/-]+$|^(?:sitemap\.xml)$/.test(path) && typeof saved.pending[path] === "string") pending[path] = saved.pending[path];
      });
      Object.keys(saved.binaryPending || {}).forEach(function (path) {
        if (/^assets\/[a-zA-Z0-9._-]+\.(?:png|jpe?g|webp|gif|avif|mp4|webm)$/i.test(path) && typeof saved.binaryPending[path] === "string") binaryPending[path] = saved.binaryPending[path];
      });
      Object.keys(saved.pendingDeletes || {}).forEach(function (path) {
        if (/^articles\/[a-zA-Z0-9._/-]+$/.test(path) && saved.pendingDeletes[path] === true) pendingDeletes[path] = true;
      });
      Object.keys(saved.original || {}).forEach(function (path) {
        const item = saved.original[path];
        if (item && (item.sha === null || typeof item.sha === "string") && typeof item.content === "string") original[path] = { sha: item.sha, content: item.content };
      });
    } catch (_) { /* An unavailable or invalid browser cache must not block the admin. */ }
  }
  restorePendingCache();

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
    '<button class="sa-tab" data-view="publish">حالة النشر</button></div>' +
    '<div class="sa-view" id="saFilesView"><div class="sa-toolbar card">' +
    '<div class="sa-file-search"><label for="saSearch">البحث في صفحات وملفات الموقع</label><input id="saSearch" type="search" placeholder="مثال: index.html أو style.css"></div>' +
    '<button class="ghost sm" id="saRefresh">تحديث الملفات</button><button class="ghost sm" id="saDisconnect">فصل الاتصال</button></div>' +
    '<div class="sa-editor-layout"><div class="sa-file-card card"><div class="sa-card-title">ملفات الموقع</div><label class="sa-upload-box">إضافة أو استبدال صورة للموقع<input id="saUpload" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple><span class="hint">PNG أو JPG أو WebP أو GIF أو AVIF · حتى 4 ميغابايت للصورة</span></label><div id="saFileList" class="sa-file-list"><p class="hint">جارٍ تحميل الملفات…</p></div></div>' +
    '<div class="sa-editor-card card"><div class="sa-editor-head"><div><b id="saEditorTitle">اختر ملفًا للتحرير</b><div id="saEditorMeta" class="hint"></div></div><button class="sm" id="saStageFile" disabled>حفظ ونشر التعديل</button></div>' +
    '<textarea id="saEditor" spellcheck="false" aria-label="محتوى الملف" placeholder="اختر ملفًا من القائمة"></textarea>' +
    '<div class="hint sa-editor-note">يحفظ التعديل مباشرة ثم يتحقق من ظهوره. تبقى الصور المختارة في قائمة النشر إلى أن تحفظها.</div></div></div></div>' +
    '<div class="sa-view" id="saArticlesView" hidden><section class="card sa-manager-card sa-article-manager"><h3>إدارة المقالات المنشورة</h3><p class="hint">عدّل المقال في محرر الملفات أو احذفه مع تحديث فهرس المقالات وخريطة الموقع.</p><div id="saArticleList" class="sa-manager-list"><p class="hint">جارٍ تحميل المقالات…</p></div></section><div class="sa-intro card"><h3>إنشاء محتوى جديد</h3>' +
    '<p class="hint">يُنشأ المحتوى مع عنوان ووصف لمحركات البحث وبيانات منظمة، ويُضاف المقال تلقائيًا إلى فهرس المقالات وخريطة الموقع.</p></div>' +
    '<div class="sa-create-grid"><form id="saArticleForm" class="card sa-form"><h3>مختبر المقالات</h3>' +
    '<section class="sa-trend-panel"><div class="sa-editor-head"><div><b>الموضوعات الرائجة في السعودية</b><p class="hint">تتحدث القائمة تلقائيًا كل 6 ساعات من Google Trends، وتُصفّى لموضوعات الرياضة والترفيه.</p></div><button type="button" class="ghost sm" id="saRefreshTrends">تحديث القائمة</button></div><div id="saTrendStatus" class="hint" aria-live="polite">جارٍ تحميل الترندات…</div><div id="saTrendList" class="sa-trend-list"></div><a class="sa-trend-source" href="https://trends.google.com/trending?geo=SA&amp;hl=ar" target="_blank" rel="noopener noreferrer">فتح مؤشرات Google Trends السعودية ↗</a></section>' +
    '<section class="sa-writer-tool" id="saWriterTool"><b>بحث الموضوع وكتابة المقال</b><p class="hint">اكتب موضوعًا أو اختر موضوعًا رائجًا. يجمع النظام نتائج عربية وسعودية ومصرية وإنجليزية من Google News وBing News، ويفحص حتى 12 مصدرًا معروفًا. يحاول قراءة نصوص الصفحات ويستخرج عدد الكلمات وزوايا التغطية والمفردات؛ ثم يبني مسودة مقارنة مع ملخص قصير لكل ناشر. لا يُحفظ النص الكامل، وقد تمنع بعض المواقع القراءة الآلية. راجع الوقائع وأضف فائدة أصلية قبل النشر. سيظهر تنبيه قبل إرسال الموضوع، وتُحفظ النتائج الموجزة والروابط في المستودع العام.</p>' +
    '<label>موضوع المقال<textarea id="saWriterTopic" rows="2" maxlength="180" placeholder="مثال: كيف تختار مسلسلًا مناسبًا للمشاهدة العائلية؟"></textarea></label>' +
    '<label>معلومات المقال أو نص أولي<textarea id="saWriterBrief" rows="4" maxlength="5000" placeholder="أضف النقاط والحقائق التي تحققت منها، أو الصق نصًا أوليًا ليُنظّم في أقسام. لا تضع كلمة مرور أو معلومات خاصة."></textarea></label>' +
    '<div class="sa-two-col"><label>الكلمة المفتاحية الرئيسية<input id="saWriterKeyword" maxlength="80" placeholder="مثال: مسلسلات عائلية"></label>' +
    '<label>القارئ المستهدف<select id="saWriterAudience"><option value="عام">جمهور عام</option><option value="المبتدئون">المبتدئون</option><option value="العائلات">العائلات</option><option value="عشاق الرياضة">عشاق الرياضة</option><option value="عشاق السينما">عشاق السينما</option></select></label></div>' +
    '<div class="sa-keyword-tools"><button type="button" class="ghost sm" id="saSuggestKeywords">اقتراح عبارات بحث</button><span class="hint">اقتراحات تحريرية بلا بيانات حجم بحث.</span></div><div class="sa-keyword-ideas" id="saKeywordIdeas"></div>' +
    '<div class="sa-two-col"><label>نية المقال<select id="saWriterIntent"><option value="guide">دليل عملي</option><option value="list">قائمة ترشيحات</option><option value="compare">مقارنة</option><option value="explainer">شرح مبسط</option></select></label>' +
    '<label>طول المسودة<select id="saWriterLength"><option value="short">مختصر</option><option value="standard" selected>متوسط</option><option value="long">موسع</option></select></label></div>' +
    '<label>نبرة الكتابة<select id="saWriterTone"><option value="natural">صحفية طبيعية</option><option value="analysis">تحليلية هادئة</option><option value="simple">مبسطة وقريبة للقارئ</option></select></label>' +
    '<button type="button" id="saGenerateArticle">ابحث واكتب المقال كاملًا</button><div id="saWriterNotice" class="hint" aria-live="polite"></div><div id="saWriterSourcesPreview" class="sa-source-review-list" hidden aria-live="polite"></div></section>' +
    '<label>عنوان المقال<input name="title" required maxlength="100" placeholder="عنوان واضح ومفيد للقارئ"></label>' +
    '<label>الرابط المختصر (إنجليزي)<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxlength="80" placeholder="ramadan-2027-series-guide"></label>' +
    '<label>وصف نتائج البحث<textarea name="description" required maxlength="160" rows="3" placeholder="ملخص دقيق يساعد القارئ على معرفة محتوى المقال"></textarea></label>' +
    '<div class="sa-two-col"><label>القسم<select name="category"><option value="عام">عام</option><option value="مسلسلات">مسلسلات</option><option value="سينما">سينما</option><option value="رياضة">رياضة</option><option value="التطبيق">التطبيق</option></select></label>' +
    '<label>اسم الكاتب<input name="author" value="فريق DIAMOND TV" maxlength="60"></label></div>' +
    '<label>رابط صورة الغلاف (اختياري)<input name="image" type="url" placeholder="https://..."></label>' +
    '<label>وصف الصورة البديل<input name="imageAlt" maxlength="150" placeholder="وصف موجز للصورة"></label>' +
    '<label>مصادر المقال (رابط في كل سطر)<textarea name="sources" rows="5" placeholder="الصق روابط المصدر المباشرة هنا"></textarea></label>' +
    '<div class="sa-inline-form"><button type="button" class="ghost" id="saCheckArticleLinks">فحص روابط المصادر بدقة</button></div><div id="saArticleLinkCheckResult" class="sa-source-review-list" hidden aria-live="polite"></div>' +
    '<p class="hint">يفحص الخادم استجابة HTTPS والعنوان النهائي، ويحاول استخراج نص المقال المتاح وعدد كلماته وزواياه. لا يخزن النص الكامل ولا يضمن الوصول إلى الصفحات المحمية أو الديناميكية؛ افتح الأصل وتحقق يدويًا.</p>' +
    '<div class="sa-editorial-checks"><label class="sa-check"><input id="saOriginalCheck" type="checkbox"> أضفت معلومة أصلية أو تحليلًا مفيدًا للقارئ</label><label class="sa-check"><input id="saFactCheck" type="checkbox"> راجعت الحقائق والأسماء والتواريخ والمصادر</label></div>' +
    '<label>محتوى المقال<textarea name="body" required rows="12" placeholder="اكتب محتوى أصليًا ومفيدًا. افصل الفقرات بسطر فارغ، واكتب ## قبل العنوان الفرعي، وابدأ كل نقطة بشرطة - ."></textarea></label>' +
    '<div class="sa-inline-form"><button type="button" class="ghost" id="saDraftOutline">إضافة مخطط للمقال</button><button type="button" class="ghost" id="saSeoAudit">مراجعة المقال الآن</button></div><div id="saSeoReport" class="sa-audit-report" hidden></div>' +
    '<section class="sa-search-preview" id="saSearchPreview" aria-label="معاينة نتيجة البحث"><b>معاينة نتيجة البحث</b><div class="sa-search-url" id="saPreviewUrl">diamond-tv.shop/articles/</div><div class="sa-search-title" id="saPreviewTitle">سيظهر عنوان المقال هنا</div><div class="sa-search-description" id="saPreviewDescription">سيظهر وصف المقال هنا</div><button type="button" class="ghost sm" id="saCopySnippet">نسخ العنوان والوصف</button></section>' +
    '<button type="submit">إضافة للمراجعة قبل النشر</button><p class="hint">تُحفظ المسودة في قائمة المراجعة أولًا. افتح المعاينة ثم اضغط «نشر الملفات المعلقة» عند الجاهزية.</p></form>' +
    '<form id="saPageForm" class="card sa-form"><h3>صفحة جديدة</h3>' +
    '<label>عنوان الصفحة<input name="title" required maxlength="100" placeholder="عنوان الصفحة"></label>' +
    '<label>الرابط المختصر (إنجليزي)<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxlength="80" placeholder="about-our-service"></label>' +
    '<label>وصف نتائج البحث<textarea name="description" required maxlength="160" rows="3"></textarea></label>' +
    '<label>محتوى الصفحة<textarea name="body" required rows="16" placeholder="اكتب معلومات دقيقة وواضحة. افصل الفقرات بسطر فارغ، واكتب ## قبل العنوان الفرعي، وابدأ كل نقطة بشرطة - ."></textarea></label>' +
    '<button type="submit">إضافة الصفحة إلى قائمة النشر</button></form></div></div>' +
    '<div class="sa-view" id="saPublishView" hidden><div class="card sa-publish-card"><div class="sa-editor-head"><div><h3>حالة النشر</h3><p class="hint">تُنشر إعدادات الألوان والأقسام والبطولات والترشيحات والمنتجات تلقائيًا عند حفظها. استخدم الزر هنا للصور أو الملفات المعلقة.</p></div>' +
    '<button id="saPublish" disabled>نشر الملفات المعلقة</button></div><div id="saPendingList" class="sa-pending-list"><p class="hint">لا توجد تعديلات معلّقة.</p></div>' +
    '<label class="sa-commit-label">وصف التحديث<input id="saCommitMessage" value="تحديث محتوى وتصميم DIAMOND TV" maxlength="120"></label><div id="saPublishError" class="sa-error" role="status"></div></div></div>' +
    '<div id="saToast" class="sa-toast" role="status" aria-live="polite"></div></div>';

  const previewDialog = document.createElement("dialog");
  previewDialog.id = "saPendingPreviewDialog";
  previewDialog.className = "sa-preview-dialog";
  previewDialog.innerHTML = '<div class="sa-preview-dialog-head"><b id="saPendingPreviewTitle">معاينة المقال</b><button type="button" class="ghost sm" id="saClosePendingPreview">إغلاق</button></div><iframe id="saPendingPreviewFrame" title="معاينة المحتوى المعلّق" sandbox=""></iframe>';
  sitePanel.appendChild(previewDialog);

  const dashboard = document.createElement("div");
  dashboard.id = "saDashboardView";
  dashboard.className = "sa-view";
  dashboard.innerHTML =
    '<div class="sa-dashboard-intro card"><span class="sa-eyebrow">إدارة سهلة</span><h3>لوحة الموقع</h3><p class="hint">احفظ الألوان والأقسام والبطولات والترشيحات والمنتجات؛ تُنشر إعداداتها تلقائيًا، ثم يتحقق الموقع من ظهورها.</p></div>' +
    '<div class="sa-dashboard-actions card"><div><b>أدوات سريعة</b><p class="hint">جهّز مقالًا من الترند أو راجع الصور والملفات التي ما زالت معلّقة.</p></div><button type="button" id="saQuickArticle">كاتب المقالات</button><button type="button" class="ghost" id="saQuickPublish">حالة النشر</button></div>' +
    '<div class="sa-dashboard-grid">' +
    '<section class="card sa-manager-card"><h3>ألوان الموقع</h3><label>اللون الرئيسي<input id="saAccent" type="color"></label><label>اللون المساند<input id="saAccent2" type="color"></label><button type="button" id="saSaveTheme">حفظ ونشر الألوان</button></section>' +
    '<section class="card sa-manager-card"><h3>أقسام الصفحة الرئيسية</h3><label class="sa-check"><input id="saLiveEnabled" type="checkbox"> المباريات المباشرة</label><label class="sa-check"><input id="saRecommendationsEnabled" type="checkbox"> ترشيحات السهرة</label><label class="sa-check"><input id="saStoreEnabled" type="checkbox"> المتجر</label><button type="button" id="saSaveSections">حفظ ونشر الأقسام</button></section>' +
    '<section class="card sa-manager-card sa-manager-wide"><h3>هوية المتجر وأقسامه</h3><p class="hint">غيّر شكل المتجر من هنا: ارفع الشعار وصور الأقسام، اختر ألوان المتجر، وأضف أو احذف الأقسام.</p><div class="sa-manager-two"><label>عنوان المتجر<input id="saStoreTitle" maxlength="80"></label><label>رابط الشعار<input id="saStoreLogo" placeholder="/assets/store-logo.svg أو رابط HTTPS"></label></div><div class="sa-manager-two sa-store-logo-row"><img id="saStoreLogoPreview" src="/assets/store-logo.svg" alt="معاينة الشعار"><label class="sa-upload-box">رفع شعار من الجهاز<input id="saStoreLogoUpload" type="file" accept="image/png,image/jpeg,image/webp,image/avif"><span class="hint">PNG أو JPG أو WebP أو AVIF · حتى 4 ميغابايت</span></label></div><label>وصف الواجهة<textarea id="saStoreSubtitle" rows="2" maxlength="240"></textarea></label><label>وصف محركات البحث<textarea id="saStoreMeta" rows="2" maxlength="170" placeholder="وصف موجز لنتيجة البحث"></textarea></label><label>شريط الإعلان<input id="saStoreAnnouncement" maxlength="140" placeholder="اختياري"></label><div class="sa-manager-two"><label>اللون الرئيسي للمتجر<input id="saStoreColor" type="color"></label><label>اللون المساند للمتجر<input id="saStoreColor2" type="color"></label></div><div class="sa-product-list-head"><b>أقسام المتجر</b><button type="button" class="ghost sm" id="saAddStoreCategory">إضافة قسم</button></div><div id="saStoreCategories" class="sa-store-category-editor"></div><button type="button" id="saSaveStorefront">حفظ ونشر هوية المتجر</button></section>' +
    '<section class="card sa-manager-card sa-manager-wide"><h3>البطولات والقنوات</h3><p class="hint">تشمل الدوريات المحلية والمنافسات الدولية. سطر لكل بطولة: رمز المصدر | الاسم بالعربية | القنوات المؤكدة إن وُجدت.</p><textarea id="saLeagueEditor" rows="12" dir="auto"></textarea><button type="button" id="saSaveLeagues">حفظ ونشر البطولات</button></section>' +
    '<section class="card sa-manager-card sa-manager-wide"><h3>مسلسلات TVMaze</h3><p class="hint">ابحث عن مسلسل وأضفه؛ تُحدّث تقييماته تلقائيًا من المصدر.</p><div class="sa-inline-form"><input id="saTvSearch" placeholder="اسم المسلسل"><button type="button" id="saTvSearchBtn">بحث</button></div><div id="saTvResults" class="sa-manager-list"></div><h4>المسلسلات المختارة</h4><div id="saTvSelected" class="sa-manager-list"></div></section>' +
    '<section class="card sa-manager-card sa-manager-wide"><h3>ترشيحات الأفلام اليدوية</h3><p class="hint">تقييم أو وصف الأفلام هنا تحريري، وليس من مصدر خارجي.</p><form id="saMovieForm" class="sa-manager-form"><input type="hidden" name="editIndex" value=""><input name="title" required maxlength="100" placeholder="اسم الفيلم"><input name="image" type="url" placeholder="رابط صورة HTTPS (اختياري)"><input name="url" type="url" placeholder="رابط التفاصيل HTTPS (اختياري)"><textarea name="description" required rows="2" maxlength="260" placeholder="لماذا ترشحه؟"></textarea><div class="sa-product-form-actions"><button type="submit">إضافة الفيلم</button><button type="button" class="ghost" id="saMovieClear">ترشيح جديد</button></div></form><div id="saMovieList" class="sa-manager-list"></div></section>' +
    '<section class="card sa-manager-card sa-manager-wide"><h3>استوديو المنتجات</h3><p class="hint">ألصق رابط صفحة منتج عام يسمح بالاستيراد؛ ستُملأ الحقول المتاحة لتراجعها قبل الحفظ. لا يتجاوز الاستيراد تسجيل الدخول أو الحماية. روابط Alibaba وAliExpress تتطلب تغذية API رسمية معتمدة.</p><div class="sa-inline-form sa-product-import"><input id="saProductImportUrl" type="url" placeholder="الصق رابط صفحة المنتج HTTPS"><button type="button" id="saProductImportBtn">استيراد من الرابط</button></div><label class="sa-check sa-product-import-rights"><input id="saProductImportRights" type="checkbox"> أملك إذن استخدام بيانات وصور المنتج من هذا المصدر</label><div id="saProductImportStatus" class="hint" role="status" aria-live="polite"></div>' +
    '<div class="sa-product-editor"><form id="saProductForm" class="sa-manager-form sa-product-form"><input name="id" type="hidden">' +
    '<label>اسم المنتج<input name="title" required maxlength="100" placeholder="اسم واضح للمنتج"></label>' +
    '<div class="sa-manager-two"><label>القسم<input name="category" maxlength="50" list="saProductCategories" placeholder="مثال: اشتراكات أو أجهزة"><datalist id="saProductCategories"><option value="اشتراكات"><option value="أجهزة"><option value="إكسسوارات"><option value="عروض"></datalist></label><label>العملة<input name="currency" maxlength="12" value="ر.س" placeholder="ر.س"></label></div>' +
    '<label>وصف المنتج<textarea name="description" required rows="3" maxlength="700" placeholder="صف المنتج بلغة واضحة، واعتمد على تفاصيل مؤكدة من المورد."></textarea></label>' +
    '<div class="sa-manager-three"><label>العلامة التجارية<input name="brand" maxlength="80" placeholder="اسم العلامة"></label><label>رمز المنتج SKU<input name="sku" maxlength="60" placeholder="اختياري"></label><label>الضمان<input name="warranty" maxlength="100" placeholder="مثال: سنة"></label></div>' +
    '<label>المميزات (ميزة في كل سطر)<textarea name="highlights" rows="3" maxlength="900" placeholder="مزايا مؤكدة ومفيدة للمشتري"></textarea></label>' +
    '<label>المواصفات (اسم الخاصية | القيمة في كل سطر)<textarea name="specifications" rows="4" maxlength="1200" placeholder="اللون | أسود&#10;المقاس | صغير"></textarea></label>' +
    '<div class="sa-manager-three"><label>السعر الحالي<input name="price" maxlength="30" placeholder="مثال: 99"></label><label>السعر السابق<input name="oldPrice" maxlength="30" placeholder="اختياري"></label><label>الكمية المتاحة<input name="stock" type="number" min="0" max="999999" placeholder="اختياري"></label></div>' +
    '<div class="sa-manager-two"><label>حالة المنتج<select name="availability"><option value="available">متوفر</option><option value="preorder">طلب مسبق</option><option value="unavailable">غير متاح مؤقتًا</option></select></label><label>مدة الشحن/التسليم<input name="delivery" maxlength="100" placeholder="مثال: 2–5 أيام عمل"></label></div>' +
    '<label>رابط الصورة الرئيسية<input name="image" type="text" inputmode="url" placeholder="HTTPS أو مسار داخل assets"></label><label class="sa-upload-box">رفع الصورة الرئيسية<input id="saProductImageUpload" type="file" accept="image/png,image/jpeg,image/webp,image/avif"><span class="hint">PNG أو JPG أو WebP أو AVIF · حتى 4 ميغابايت</span></label>' +
    '<label>صور إضافية (رابط في كل سطر)<textarea name="images" rows="3" maxlength="1800" placeholder="https://... أو /assets/صورة.jpg"></textarea></label>' +
    '<label class="sa-upload-box">رفع عدة صور للمعرض<input id="saProductGalleryUpload" type="file" accept="image/png,image/jpeg,image/webp,image/avif" multiple><span class="hint">حتى 8 صور إجمالًا · 4 ميغابايت للصورة</span></label>' +
    '<label>فيديوهات المنتج (رابط في كل سطر)<textarea name="videos" rows="2" maxlength="1200" placeholder="روابط MP4/WebM أو YouTube أو Vimeo"></textarea></label>' +
    '<label class="sa-upload-box">رفع فيديو MP4 أو WebM<input id="saProductVideoUpload" type="file" accept="video/mp4,video/webm" multiple><span class="hint">حتى فيديوهين · 15 ميغابايت لكل فيديو. الملفات الكبيرة استخدم لها رابط فيديو HTTPS.</span></label>' +
    '<label>رابط المصدر أو المورد<input name="sourceUrl" type="url" placeholder="HTTPS — مرجع المنتج عند المراجعة"></label>' +
    '<label>وسوم المنتج (افصل بفاصلة)<input name="tags" maxlength="260" placeholder="جديد، عرض، الأكثر طلبًا"></label>' +
    '<label>وصف الصورة البديل<input name="imageAlt" maxlength="140" placeholder="وصف يوضح ما يظهر في الصورة"></label>' +
    '<label>رابط الطلب أو التفاصيل<input name="url" type="url" placeholder="https://..."></label>' +
    '<div class="sa-manager-two"><label class="sa-check"><input name="featured" type="checkbox"> تمييز المنتج في المتجر</label><label class="sa-check"><input name="active" type="checkbox" checked> عرض المنتج في المتجر</label></div>' +
    '<div class="sa-product-form-actions"><button type="submit">حفظ المنتج</button><button type="button" class="ghost" id="saProductClear">منتج جديد</button></div></form>' +
    '<aside class="sa-product-preview"><b>معاينة البطاقة</b><div id="saProductPreviewCard" class="sa-product-preview-card"><div class="sa-product-preview-image">DIAMOND</div><div class="sa-product-preview-copy"><span class="hint">ستظهر المعاينة هنا</span></div></div><p class="hint">السعر والخصم والتوفر يعكسان البيانات التي أدخلتها فقط.</p></aside></div>' +
    '<div class="sa-product-list-head"><b>المنتجات المحفوظة</b><span class="hint" id="saProductCount"></span></div><div id="saProductList" class="sa-manager-list"></div></section>' +
    '</div><div class="sa-manager-footer card"><span>تُنشر إعدادات الألوان والأقسام والبطولات والترشيحات والمنتجات تلقائيًا بعد حفظها.</span><button type="button" class="ghost sm" id="saStageConfig">إعادة نشر الإعدادات</button></div>';
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
    if (!response.ok) {
      const error = new Error(data.message || ("GitHub أعاد الحالة " + response.status));
      error.status = response.status;
      error.githubMessage = data.message || "";
      throw error;
    }
    return data;
  }
  function friendlyGitHubError(error) {
    const raw = String(error && (error.githubMessage || error.message) || "");
    if ((error && error.status === 403) || /Resource not accessible by personal access token/i.test(raw)) {
      return "رفض GitHub الحفظ لأن رمز الوصول لا يملك صلاحية الكتابة. أنشئ Fine-grained token للمستودع SAKR55/diamond-tv-site، وامنحه Contents: Read and write، ثم أدخله من جديد. بقيت المسودات محفوظة في هذه الجلسة.";
    }
    if (error && error.status === 401) return "رمز GitHub غير صالح أو منتهي. أنشئ رمزًا جديدًا للمستودع ثم اتصل به.";
    return raw || "تعذّر النشر. بقيت التعديلات في قائمة المسودات.";
  }
  function persistPendingCache() {
    const payload = { pending: pending, binaryPending: binaryPending, pendingDeletes: pendingDeletes, original: original };
    try {
      let serialized = JSON.stringify(payload);
      if (serialized.length > 3_500_000) {
        payload.binaryPending = {};
        serialized = JSON.stringify(payload);
      }
      if (serialized.length > 3_500_000) {
        Object.keys(payload.original || {}).forEach(function (path) {
          payload.original[path] = { sha: payload.original[path].sha, content: "" };
        });
        serialized = JSON.stringify(payload);
      }
      if (serialized.length > 3_500_000) throw new Error("المسودات أكبر من المساحة المتاحة للحفظ في الجلسة.");
      sessionStorage.setItem(DRAFT_CACHE_KEY, serialized);
    } catch (_) { /* Keep the previous session snapshot if this update exceeds browser storage. */ }
  }
  function sanitizedPreview(content, path) {
    const doc = new DOMParser().parseFromString(String(content || ""), "text/html");
    doc.querySelectorAll("script,iframe,object,embed,form,base,meta[http-equiv='refresh'],link[rel='import']").forEach(function (node) { node.remove(); });
    doc.querySelectorAll("*").forEach(function (node) {
      Array.from(node.attributes).forEach(function (attr) {
        if (/^on/i.test(attr.name) || /^(?:javascript|vbscript):/i.test(attr.value.trim()) || /^data:text\/html/i.test(attr.value.trim())) node.removeAttribute(attr.name);
      });
    });
    const base = doc.createElement("base");
    base.href = new URL(path.split("/").map(encodeURIComponent).join("/"), location.origin + "/").href;
    doc.head.prepend(base);
    return "<!doctype html>" + doc.documentElement.outerHTML;
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
      return entry.type === "blob" && /\.(html?|css|js|json|xml|txt|md|svg|webmanifest|png|jpe?g|webp|gif|avif|mp4|webm)$/i.test(entry.path);
    }).sort(function (a, b) { return a.path.localeCompare(b.path); });
    if (tree.truncated) toast("قائمة الملفات كبيرة؛ تعرض الملفات التي أعادها GitHub فقط.");
    $("#saFileList").replaceChildren();
    if (!treeFiles.length) $("#saFileList").innerHTML = '<p class="hint">لم تُعثر على ملفات نصية.</p>';
    renderFileList();
    await loadDashboardConfig();
    await renderArticleManager();
    renderPending();
    setStatus("متصل بالمستودع · main", true);
    $("#saWorkspace").hidden = false;
    $("#saConnect").hidden = true;
    return { commit: commit, tree: tree };
  }
  async function renderArticleManager() {
    const list = $("#saArticleList");
    list.replaceChildren();
    try {
      let content = pending["articles/index.html"];
      if (!content) content = await fetchFile("articles/index.html");
      const doc = new DOMParser().parseFromString(content, "text/html");
      const rows = [], seen = new Set();
      Array.from(doc.querySelectorAll("a[href]")).forEach(function (link) {
        const href = (link.getAttribute("href") || "").split(/[?#]/)[0];
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/i.test(href) || seen.has(href)) return;
        const path = "articles/" + href;
        if (!treeFiles.some(function (file) { return file.path === path; }) && !Object.prototype.hasOwnProperty.call(pending, path)) return;
        seen.add(href); rows.push({ path: path, title: (link.querySelector("h3") || link).textContent.trim() || href });
      });
      rows.forEach(function (item) {
        const row = document.createElement("div"); row.className = "sa-manager-row";
        const label = document.createElement("span"); label.innerHTML = "<b>" + escapeHtml(item.title) + "</b><small>" + escapeHtml(item.path) + "</small>";
        const actions = document.createElement("span"); actions.className = "sa-manager-actions";
        const edit = document.createElement("button"); edit.type = "button"; edit.className = "ghost sm"; edit.dataset.editArticle = item.path; edit.textContent = "تعديل";
        const remove = document.createElement("button"); remove.type = "button"; remove.className = "ghost sm"; remove.dataset.removeArticle = item.path; remove.dataset.articleTitle = item.title; remove.textContent = "حذف";
        actions.append(edit, remove); row.append(label, actions); list.appendChild(row);
      });
      if (!rows.length) list.innerHTML = '<p class="hint">لا توجد مقالات HTML في الفهرس بعد.</p>';
    } catch (error) {
      list.innerHTML = '<p class="hint">تعذّر تحميل فهرس المقالات: ' + escapeHtml(error.message || "خطأ غير معروف") + '</p>';
    }
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
    const hasPending = Object.prototype.hasOwnProperty.call(pending, path) || Object.prototype.hasOwnProperty.call(binaryPending, path);
    if (!hasPending || !original[path]) original[path] = { sha: data.sha, content: content };
    return content;
  }
  async function fetchLatestFile(path) {
    const data = await api("/contents/" + apiPath(path) + "?ref=" + encodeURIComponent(BRANCH));
    const content = decodeBase64(data.content || "");
    const hasPending = Object.prototype.hasOwnProperty.call(pending, path) || Object.prototype.hasOwnProperty.call(binaryPending, path);
    if (!hasPending) original[path] = { sha: data.sha, content: content };
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
    if (pendingDeletes[path]) { $("#saEditorMeta").textContent = "هذا الملف ضمن قائمة الحذف. أزل الحذف من قائمة المراجعة أولًا."; return; }
    if (Object.prototype.hasOwnProperty.call(pending, path)) {
      selectedOriginal = original[path] ? original[path].content : "";
      $("#saEditor").value = pending[path]; $("#saEditor").disabled = false; $("#saStageFile").disabled = false;
      $("#saEditorMeta").textContent = "يوجد تعديل معلّق · راجعه ثم احفظه من جديد.";
      return;
    }
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
    persistPendingCache();
    const list = $("#saPendingList");
    const paths = Array.from(new Set(Object.keys(pending).concat(Object.keys(binaryPending), Object.keys(pendingDeletes)))).sort();
    list.replaceChildren();
    if (!paths.length) {
      list.innerHTML = '<p class="hint">لا توجد تعديلات معلّقة.</p>';
      $("#saPublish").disabled = true;
      return;
    }
    paths.forEach(function (path) {
      const row = document.createElement("div"); row.className = "sa-pending-row";
      const name = document.createElement("span"); name.textContent = path + (binaryPending[path] ? " · صورة" : "") + (pendingDeletes[path] ? " · حذف" : "");
      const actions = document.createElement("div"); actions.className = "sa-pending-actions";
      if (pending[path] && /\.html?$/i.test(path)) {
        const preview = document.createElement("button"); preview.type = "button"; preview.className = "ghost sm"; preview.textContent = "معاينة المحتوى";
        preview.addEventListener("click", function () {
          $("#saPendingPreviewTitle").textContent = "معاينة: " + path;
          $("#saPendingPreviewFrame").srcdoc = sanitizedPreview(pending[path], path);
          if (typeof previewDialog.showModal === "function") previewDialog.showModal();
          else previewDialog.setAttribute("open", "open");
        });
        actions.appendChild(preview);
      }
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "ghost sm"; remove.textContent = pendingDeletes[path] ? "إلغاء الحذف" : "إلغاء التعديل";
      remove.addEventListener("click", function () {
        delete pending[path]; delete binaryPending[path]; delete pendingDeletes[path];
        if (selectedPath === path) { $("#saEditor").value = original[path] ? original[path].content : ""; $("#saEditorMeta").textContent = "تمت إزالة التعديل المعلّق."; }
        renderPending(); renderFileList();
      });
      actions.appendChild(remove);
      row.append(name, actions); list.appendChild(row);
    });
    $("#saPublish").disabled = false;
  }
  $("#saClosePendingPreview").addEventListener("click", function () {
    if (typeof previewDialog.close === "function") previewDialog.close();
    else previewDialog.removeAttribute("open");
    $("#saPendingPreviewFrame").srcdoc = "";
  });
  async function waitForPublicFiles(snapshot) {
    const paths = Array.from(new Set(Object.keys(snapshot.text).concat(Object.keys(snapshot.binary))));
    if (!paths.length && !(snapshot.deletes || []).length) return true;
    for (let attempt = 0; attempt < 18; attempt += 1) {
      const checks = await Promise.all(paths.map(async function (path) {
        try {
          const target = new URL(path.split("/").map(encodeURIComponent).join("/"), location.origin + "/");
          target.searchParams.set("publish_check", String(Date.now()));
          const isBinary = Object.prototype.hasOwnProperty.call(snapshot.binary, path);
          const response = await fetch(target.href, { method: isBinary ? "HEAD" : "GET", cache: "no-store" });
          if (!response.ok) return false;
          if (isBinary) return true;
          return (await response.text()) === snapshot.text[path];
        } catch (_) { return false; }
      }));
      const deleted = await Promise.all((snapshot.deletes || []).map(async function (path) {
        try {
          const target = new URL(path.split("/").map(encodeURIComponent).join("/"), location.origin + "/");
          target.searchParams.set("publish_check", String(Date.now()));
          const response = await fetch(target.href, { method: "GET", cache: "no-store" });
          return response.status === 404;
        } catch (_) { return false; }
      }));
      if (checks.every(Boolean) && deleted.every(Boolean)) return true;
      if (attempt < 17) await new Promise(function (resolve) { window.setTimeout(resolve, 5000); });
    }
    return false;
  }
  function stage(path, content, baseContent) {
    delete binaryPending[path];
    delete pendingDeletes[path];
    pending[path] = content;
    if (!original[path]) original[path] = { sha: null, content: baseContent || "" };
    renderPending();
    renderFileList();
    toast("أُضيف " + path + " إلى قائمة النشر.");
  }
  function stageDelete(path) {
    const file = treeFiles.find(function (item) { return item.path === path; });
    if (!file) throw new Error("تعذّر العثور على الملف المطلوب حذفه.");
    delete pending[path]; delete binaryPending[path];
    pendingDeletes[path] = true;
    if (!original[path]) original[path] = { sha: file.sha, content: "" };
    renderPending(); renderFileList();
  }
  function defaultSiteConfig() {
    return {
      version: 1,
      theme: { accent: "#6d4aff", accent2: "#0c9fa2" },
      sections: { live: true, recommendations: true, store: true },
      leagues: [],
      recommendations: { tvmazeIds: [], movies: [] },
      storefront: {
        title: "متجر DIAMOND TV",
        subtitle: "اكتشف منتجات وخدمات مختارة بعناية، وتصفّح الأقسام واحفظ ما يناسبك.",
        metaDescription: "تصفح متجر DIAMOND TV لاكتشاف المنتجات والخدمات المختارة، واقرأ المواصفات والأسعار قبل الطلب.",
        announcement: "اختيارات DIAMOND TV في مكان واحد",
        logo: "/assets/store-logo.svg",
        colors: { primary: "#6d4aff", secondary: "#0c9fa2" },
        categories: [
          { name: "الاشتراكات الرقمية", description: "باقات وخدمات رقمية مختارة", image: "/assets/store-category-subscriptions.svg", color: "#6d4aff" },
          { name: "أجهزة البث", description: "أجهزة وتجهيزات للمشاهدة", image: "/assets/store-category-devices.svg", color: "#0c9fa2" },
          { name: "الإكسسوارات", description: "إضافات عملية لتجربتك", image: "/assets/store-category-accessories.svg", color: "#d879a3" },
          { name: "العروض", description: "خيارات وعروض مميزة", image: "/assets/store-category-offers.svg", color: "#339b75" }
        ]
      },
      products: []
    };
  }
  async function loadDashboardConfig() {
    try {
      const committedRaw = await fetchFile("assets/site-config.json");
      const raw = Object.prototype.hasOwnProperty.call(pending, "assets/site-config.json") ? pending["assets/site-config.json"] : committedRaw;
      siteConfig = Object.assign(defaultSiteConfig(), JSON.parse(raw));
    } catch (_) { siteConfig = siteConfig || defaultSiteConfig(); }
    siteConfig.theme = Object.assign({ accent: "#6d4aff", accent2: "#0c9fa2" }, siteConfig.theme || {});
    siteConfig.sections = Object.assign({ live: true, recommendations: true, store: true }, siteConfig.sections || {});
    siteConfig.storefront = Object.assign(defaultSiteConfig().storefront, siteConfig.storefront || {});
    siteConfig.storefront.colors = Object.assign({ primary: "#6d4aff", secondary: "#0c9fa2" }, siteConfig.storefront.colors || {});
    siteConfig.storefront.categories = Array.isArray(siteConfig.storefront.categories) ? siteConfig.storefront.categories : [];
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
    $("#saStoreTitle").value = String(siteConfig.storefront.title || "");
    $("#saStoreSubtitle").value = String(siteConfig.storefront.subtitle || "");
    $("#saStoreMeta").value = String(siteConfig.storefront.metaDescription || "");
    $("#saStoreAnnouncement").value = String(siteConfig.storefront.announcement || "");
    $("#saStoreLogo").value = String(siteConfig.storefront.logo || "");
    $("#saStoreLogoPreview").src = safeProductImage(siteConfig.storefront.logo) || "/assets/store-logo.svg";
    $("#saStoreColor").value = /^#[0-9a-f]{6}$/i.test(siteConfig.storefront.colors.primary || "") ? siteConfig.storefront.colors.primary : "#6d4aff";
    $("#saStoreColor2").value = /^#[0-9a-f]{6}$/i.test(siteConfig.storefront.colors.secondary || "") ? siteConfig.storefront.colors.secondary : "#0c9fa2";
    renderStoreCategoryEditor();
    $("#saLeagueEditor").value = siteConfig.leagues.map(function (league) {
      return [league.id, league.ar, (league.tv || []).join("، ")].join(" | ");
    }).join("\n");
    $("#saTvSelected").innerHTML = siteConfig.recommendations.tvmazeIds.map(function (id) {
      return '<div class="sa-manager-row"><span>مسلسل TVMaze رقم ' + escapeHtml(id) + '</span><span class="sa-manager-actions"><button type="button" class="ghost sm" data-replace-show="' + escapeHtml(id) + '">استبدال</button><button type="button" class="ghost sm" data-remove-show="' + escapeHtml(id) + '">حذف</button></span></div>';
    }).join("") || '<p class="hint">لم تُضف مسلسلات بعد.</p>';
    $("#saMovieList").innerHTML = siteConfig.recommendations.movies.map(function (movie, index) {
      return '<div class="sa-manager-row"><span><b>' + escapeHtml(movie.title) + '</b><small>' + escapeHtml(movie.description) + '</small></span><span class="sa-manager-actions"><button type="button" class="ghost sm" data-edit-movie="' + index + '">تعديل</button><button type="button" class="ghost sm" data-remove-movie="' + index + '">حذف</button></span></div>';
    }).join("") || '<p class="hint">لم تُضف أفلامًا بعد.</p>';
    $("#saProductList").innerHTML = siteConfig.products.map(function (product, index) {
      const availability = product.availability === "preorder" ? "طلب مسبق" : product.availability === "unavailable" ? "غير متاح" : "متوفر";
      const mediaCount = new Set([product.image].concat(Array.isArray(product.images) ? product.images : []).filter(Boolean)).size;
      const videoCount = Array.isArray(product.videos) ? product.videos.length : 0;
      return '<div class="sa-manager-row"><span><b>' + escapeHtml(product.title) + '</b><small>' + escapeHtml(product.category || "بلا قسم") + " · " + escapeHtml(product.price || "بدون سعر") + (product.currency ? " " + escapeHtml(product.currency) : "") + " · " + availability + " · " + mediaCount + " صور · " + videoCount + " فيديو" + (product.featured ? " · مميز" : "") + (product.active === false ? " · مخفي" : " · ظاهر") + '</small></span>' +
        '<span class="sa-manager-actions"><button type="button" class="ghost sm" data-edit-product="' + index + '">تعديل</button><button type="button" class="ghost sm" data-remove-product="' + index + '">حذف</button></span></div>';
    }).join("") || '<p class="hint">المتجر فارغ؛ أضف أول منتج من النموذج.</p>';
    $("#saProductCount").textContent = siteConfig.products.length + " منتج";
    renderProductPreview();
  }
  function renderStoreCategoryEditor() {
    const box = $("#saStoreCategories");
    if (!box || !siteConfig || !siteConfig.storefront) return;
    const categories = siteConfig.storefront.categories || [];
    box.innerHTML = categories.map(function (item, index) {
      const name = String(item.name || "");
      const description = String(item.description || "");
      const image = safeProductImage(item.image || "");
      const color = /^#[0-9a-f]{6}$/i.test(item.color || "") ? item.color : "#6d4aff";
      return '<article class="sa-store-category-row" data-store-category="' + index + '">' +
        '<div class="sa-manager-three"><label>اسم القسم<input data-store-category-field="name" maxlength="60" value="' + escapeHtml(name) + '" placeholder="مثال: أجهزة البث"></label><label>وصف مختصر<input data-store-category-field="description" maxlength="150" value="' + escapeHtml(description) + '" placeholder="سطر يوضح القسم"></label><label>لون القسم<input data-store-category-field="color" type="color" value="' + color + '"></label></div>' +
        '<div class="sa-store-category-media"><div class="sa-store-category-image-preview"><img src="' + escapeHtml(image || "/assets/store-category-default.svg") + '" alt="" data-store-category-preview></div><label>رابط الصورة<input data-store-category-field="image" maxlength="500" value="' + escapeHtml(item.image || "") + '" placeholder="/assets/صورة-القسم.png أو HTTPS"></label><label class="sa-upload-box">رفع صورة للقسم<input data-store-category-image-upload="' + index + '" type="file" accept="image/png,image/jpeg,image/webp,image/avif"><span class="hint">حتى 4 ميغابايت</span></label><button type="button" class="ghost sm" data-remove-store-category="' + index + '">حذف القسم</button></div></article>';
    }).join("") || '<p class="hint">لم تُضف أقسامًا بعد. اضغط «إضافة قسم» لبدء إعداد المتجر.</p>';
  }
  async function readStorefrontImage(file, purpose) {
    if (!file || !/^image\/(png|jpeg|webp|avif)$/.test(file.type) || file.size > 4 * 1024 * 1024) throw new Error("اختر صورة PNG أو JPG أو WebP أو AVIF بحجم 4 ميغابايت أو أقل.");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^\.+/, "").slice(-60) || "store-image";
    const path = "assets/store-" + purpose + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + "-" + safeName;
    const reader = new FileReader();
    const base64 = await new Promise(function (resolve, reject) {
      reader.onload = function () { resolve(String(reader.result).split(",")[1] || ""); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    binaryPending[path] = base64;
    original[path] = { sha: null, content: "" };
    return "/" + path;
  }
  function queueAutoPublish(paths) {
    (paths || []).forEach(function (path) { autoPublishPaths.add(path); });
    window.clearTimeout(autoPublishTimer);
    autoPublishTimer = window.setTimeout(function () {
      const queued = Array.from(autoPublishPaths);
      autoPublishPaths.clear();
      publishPendingPaths(queued);
    }, 350);
  }
  function stageDashboardConfig(message, extraPaths) {
    stage("assets/site-config.json", JSON.stringify(siteConfig, null, 2) + "\n", original["assets/site-config.json"] && original["assets/site-config.json"].content);
    if (message) toast(message);
    queueAutoPublish(["assets/site-config.json"].concat(extraPaths || []));
  }
  function safeDashboardUrl(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    try { const url = new URL(text); return url.protocol === "https:" ? url.href : ""; } catch (_) { return ""; }
  }
  function safeProductImage(value) {
    const text = String(value || "").trim();
    if (/^\/assets\/[a-zA-Z0-9._-]+$/.test(text)) return text;
    return safeDashboardUrl(text);
  }
  function renderProductPreview() {
    const form = $("#saProductForm");
    if (!form) return;
    const get = function (name) { return String(form.elements[name] && form.elements[name].value || "").trim(); };
    const image = safeProductImage(get("image"));
    const title = get("title") || "اسم المنتج";
    const category = get("category") || "القسم";
    const description = get("description") || "سيظهر وصف المنتج في هذه المساحة.";
    const price = get("price"), oldPrice = get("oldPrice"), currency = get("currency");
    const mediaImages = Array.from(new Set([image].concat(get("images").split(/\r?\n/).map(safeProductImage)).filter(Boolean)));
    const videoCount = get("videos").split(/\r?\n/).map(function (value) { return value.trim(); }).filter(Boolean).length;
    const availability = get("availability") === "preorder" ? "طلب مسبق" : get("availability") === "unavailable" ? "غير متاح مؤقتًا" : "متوفر";
    $("#saProductPreviewCard").innerHTML = (mediaImages[0] ? '<img src="' + escapeHtml(mediaImages[0]) + '" alt="">' : '<div class="sa-product-preview-image">✦ DIAMOND</div>') +
      (mediaImages.length > 1 ? '<div class="sa-product-preview-thumbs">' + mediaImages.slice(1, 5).map(function (src) { return '<img src="' + escapeHtml(src) + '" alt="">'; }).join("") + '</div>' : '') +
      '<div class="sa-product-preview-copy"><span class="hint">' + escapeHtml(category) + '</span><b>' + escapeHtml(title) + '</b><p>' + escapeHtml(description) + '</p>' +
      '<div class="sa-product-preview-price">' + (price ? '<strong>' + escapeHtml(price) + ' ' + escapeHtml(currency) + '</strong>' : '<span>السعر غير محدد</span>') + (oldPrice ? '<del>' + escapeHtml(oldPrice) + ' ' + escapeHtml(currency) + '</del>' : '') + '</div>' +
      '<span class="sa-product-preview-state">' + availability + (form.elements.featured.checked ? ' · مميز' : '') + ' · ' + mediaImages.length + ' صور · ' + videoCount + ' فيديو</span></div>';
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
      $("#saTvResults").innerHTML = results.slice(0, 10).map(function (result) {
        const show = result.show || {};
        const rating = show.rating && show.rating.average ? " · ★ " + show.rating.average : "";
        return '<div class="sa-manager-row"><span><b>' + escapeHtml(show.name || "مسلسل") + '</b><small>' + escapeHtml(show.premiered || "") + escapeHtml(rating) + '</small></span><button type="button" class="ghost sm" data-add-show="' + Number(show.id) + '">' + (replaceTvMazeId ? "استبدال" : "إضافة") + '</button></div>';
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
      if (lines.every(function (line) { return /^\s*\d+[.)]\s+/.test(line); })) return "<ol>" + lines.map(function (line) { return "<li>" + escapeHtml(line.replace(/^\s*\d+[.)]\s+/, "")) + "</li>"; }).join("") + "</ol>";
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
    const schema = isArticle ? {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "headline": data.title,
          "description": data.description,
          "url": canonical,
          "mainEntityOfPage": { "@type": "WebPage", "@id": canonical },
          "image": [data.image || "https://diamond-tv.shop/assets/og.png"],
          "inLanguage": "ar",
          "articleSection": data.category || "عام",
          "datePublished": now,
          "dateModified": now,
          "author": { "@type": "Organization", "name": data.author || "فريق DIAMOND TV", "url": "https://diamond-tv.shop/" },
          "publisher": { "@type": "Organization", "name": "DIAMOND TV", "url": "https://diamond-tv.shop/", "logo": { "@type": "ImageObject", "url": "https://diamond-tv.shop/assets/og.png" } }
        },
        { "@type": "BreadcrumbList", "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "https://diamond-tv.shop/" },
          { "@type": "ListItem", "position": 2, "name": "المقالات", "item": "https://diamond-tv.shop/articles/" },
          { "@type": "ListItem", "position": 3, "name": data.title, "item": canonical }
        ] }
      ]
    } : {
      "@context": "https://schema.org", "@type": "WebPage", "name": data.title,
      "description": data.description, "url": canonical, "inLanguage": "ar"
    };
    return '<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n' +
      '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<title>' + safeTitle + ' | DIAMOND TV</title>\n' +
      '<meta name="description" content="' + safeDescription + '">\n' +
      '<meta name="robots" content="index,follow,max-image-preview:large">\n' +
      '<link rel="canonical" href="' + escapeHtml(canonical) + '">\n' +
      '<meta property="og:type" content="' + (isArticle ? "article" : "website") + '"><meta property="og:title" content="' + safeTitle + ' | DIAMOND TV">\n' +
      '<meta property="og:description" content="' + safeDescription + '"><meta property="og:url" content="' + escapeHtml(canonical) + '"><meta property="og:image" content="' + safeImage + '">\n' +
      '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + safeTitle + ' | DIAMOND TV"><meta name="twitter:description" content="' + safeDescription + '"><meta name="twitter:image" content="' + safeImage + '">\n' +
      (isArticle ? '<meta property="article:published_time" content="' + now + '"><meta property="article:modified_time" content="' + now + '">\n' : '') +
      '<link rel="stylesheet" href="../assets/style.css">\n' +
      '<script src="../assets/site-config.js"></script>\n' +
      '<script type="application/ld+json">' + JSON.stringify(schema).replace(/</g, "\\u003c") + '</script>\n' +
      '</head>\n<body>\n<main class="wrap sa-content-page">\n' +
      '<nav class="sa-breadcrumb"><a href="../index.html">الرئيسية</a> / ' + (isArticle ? '<a href="./">المقالات</a> / ' : "") + safeTitle + '</nav>\n' +
      '<article class="sa-article"><p class="pill">' + escapeHtml(data.category || "DIAMOND TV") + '</p><h1>' + safeTitle + '</h1>\n' +
      '<p class="sa-article-lead">' + safeDescription + '</p>\n' +
      (isArticle ? '<p class="sa-article-author">بقلم <b>' + escapeHtml(data.author || "فريق DIAMOND TV") + '</b></p>\n' : "") +
      (data.image ? '<figure><img src="' + safeImage + '" alt="' + escapeHtml(data.imageAlt || data.title) + '" loading="lazy"></figure>\n' : "") +
      '<div class="sa-article-body">\n' + data.body + '\n</div>\n' +
      (isArticle && data.sources && data.sources.length ? '<section class="sa-article-sources"><h2>المصادر</h2><ul>' + data.sources.map(function (url) {
        const source = sourceEntriesFor(url)[0];
        const label = source ? (source.source ? source.source + " — " : "") + source.title : url.replace(/^https?:\/\//, "");
        return '<li><a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(label) + '</a></li>';
      }).join("") + '</ul></section>\n' : "") +
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
      imageAlt: metaField(form, "imageAlt"),
      sources: metaField(form, "sources").split(/\r?\n/).map(function (value) { return value.trim(); }).filter(Boolean)
    };
    if (data.sources.some(function (value) { try { return new URL(value).protocol !== "https:"; } catch (_) { return true; } })) {
      toast("تحقق من روابط المصادر؛ اقبل روابط HTTPS صحيحة فقط.");
      return;
    }
    if (data.image) {
      try { if (new URL(data.image).protocol !== "https:") throw new Error("secure image required"); }
      catch (_) { toast("رابط صورة المقال يجب أن يبدأ بـ HTTPS."); return; }
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
      toast("اكتب الرابط المختصر بأحرف إنجليزية صغيرة وأرقام وواصلات.");
      return;
    }
    const article = kind === "article";
    const publishPaths = [];
    if (article) {
      const review = articleAudit(form);
      if (review.sourceReview.trustedDomains < 2) {
        toast("أضف رابطين من نطاقين مستقلين معروفين أو جهات رسمية، ثم أعد فحص المقال.");
        switchView("articles");
        return;
      }
      if (review.factReport && !review.factReport.fresh) {
        toast("نتائج البحث عن المصادر أقدم من 48 ساعة؛ أعد البحث عن الموضوع قبل النشر.");
        switchView("articles");
        return;
      }
      if (review.factReport && review.factReport.readablePages < 2) {
        toast("لم يُقرأ نص كافٍ من مصدرين مستقلين؛ أعد البحث أو افحص روابط ناشرين آخرين قبل النشر.");
        switchView("articles");
        return;
      }
      const rawBody = metaField(form, "body");
      if (!$("#saWriterTopic").value.trim()) { toast("أدخل موضوع المقال حتى نراجع مطابقته."); $("#saWriterTopic").focus(); return; }
      if (/لا تتضمن المدخلات الحالية|أضف هنا المعلومات الفعلية|أجب هنا عن السؤال الأساسي/i.test(rawBody)) {
        toast("أكمل تعليمات المسودة بمعلومات وأمثلة حقيقية قبل إضافتها للنشر.");
        return;
      }
      if (!$("#saFactCheck").checked || !$("#saOriginalCheck").checked) {
        toast("راجع الحقائق وأضف فائدة أصلية، ثم أكمل مربعي المراجعة قبل النشر.");
        return;
      }
      if (/اليوم|غد|مباراة|مباريات|تقييم|القنوات|القناة|موعد|السعر|يعرض|عرض|رمضان\s*2027|2026|2027/i.test(rawBody) && !data.sources.length) {
        toast("أضف رابط مصدر موثوق لأن المقال يتناول معلومات قد تتغير.");
        return;
      }
    }
    const path = article ? "articles/" + data.slug + ".html" : "pages/" + data.slug + ".html";
    if (treeFiles.some(function (item) { return item.path === path; }) || pending[path]) {
      toast("هذا الرابط مستخدم بالفعل.");
      return;
    }
    const content = articleTemplate(data, path, article);
    stage(path, content, "");
    publishPaths.push(path);
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
        publishPaths.push("articles/index.html");
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
        publishPaths.push("sitemap.xml");
      }
    } catch (error) {
      delete pending[path];
      if (article) delete pending["articles/index.html"];
      renderPending();
      toast(error.message || "تعذّرت تحديث خريطة الموقع.");
      return;
    }
    form.reset();
    if (article) {
      await renderArticleManager();
      toast("أُضيف المقال والفهرس وخريطة الموقع إلى قائمة المراجعة؛ افتح المعاينة ثم انشر عند الجاهزية.");
      switchView("publish");
    } else {
      toast("أُضيفت الصفحة مع خريطة الموقع إلى قائمة النشر.");
      switchView("publish");
    }
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
    if (tab) { switchView(tab.dataset.view); return; }
    const editArticle = event.target.closest("[data-edit-article]");
    if (editArticle) { switchView("files"); openFile(editArticle.dataset.editArticle); return; }
    const removeArticle = event.target.closest("[data-remove-article]");
    if (removeArticle) removeArticleFromSite(removeArticle.dataset.removeArticle, removeArticle.dataset.articleTitle || "المقال");
  });
  $("#saSaveTheme").addEventListener("click", function () {
    siteConfig.theme = { accent: $("#saAccent").value, accent2: $("#saAccent2").value };
    stageDashboardConfig("تم حفظ الألوان للمراجعة.");
  });
  $("#saSaveSections").addEventListener("click", function () {
    siteConfig.sections = { live: $("#saLiveEnabled").checked, recommendations: $("#saRecommendationsEnabled").checked, store: $("#saStoreEnabled").checked };
    stageDashboardConfig("تم حفظ إعدادات الأقسام للمراجعة.");
  });
  $("#saSaveStorefront").addEventListener("click", function () {
    const title = $("#saStoreTitle").value.trim().slice(0, 80);
    const subtitle = $("#saStoreSubtitle").value.trim().slice(0, 240);
    const metaDescription = $("#saStoreMeta").value.trim().slice(0, 170);
    const announcement = $("#saStoreAnnouncement").value.trim().slice(0, 140);
    const logoRaw = $("#saStoreLogo").value.trim();
    const logo = logoRaw ? safeProductImage(logoRaw) : "";
    if (!title) { toast("اكتب اسم المتجر."); return; }
    if (logoRaw && !logo) { toast("رابط الشعار يجب أن يكون HTTPS أو مسارًا داخل assets."); return; }
    const categories = siteConfig.storefront.categories.map(function (item) {
      return {
        name: String(item.name || "").trim().slice(0, 60),
        description: String(item.description || "").trim().slice(0, 150),
        image: safeProductImage(item.image || ""),
        color: /^#[0-9a-f]{6}$/i.test(item.color || "") ? item.color : "#6d4aff"
      };
    });
    if (siteConfig.storefront.categories.some(function (item) { return !String(item.name || "").trim() || (String(item.image || "").trim() && !safeProductImage(item.image)); })) { toast("أكمل اسم كل قسم وتحقق من رابط صورته."); return; }
    if (categories.length > 12) { toast("يمكنك إضافة حتى 12 قسمًا."); return; }
    const colors = { primary: $("#saStoreColor").value, secondary: $("#saStoreColor2").value };
    siteConfig.storefront = { title: title, subtitle: subtitle, metaDescription: metaDescription, announcement: announcement, logo: logo, colors: colors, categories: categories };
    const linkedImages = new Set([logo].concat(categories.map(function (item) { return item.image; })).filter(Boolean));
    const imagePaths = Object.keys(binaryPending).filter(function (path) { return linkedImages.has("/" + path); });
    stageDashboardConfig("تم حفظ هوية المتجر وأقسامه وصورها.", imagePaths);
  });
  $("#saAddStoreCategory").addEventListener("click", function () {
    if (siteConfig.storefront.categories.length >= 12) { toast("يمكنك إضافة حتى 12 قسمًا."); return; }
    siteConfig.storefront.categories.push({ name: "قسم جديد", description: "", image: "/assets/store-category-default.svg", color: "#6d4aff" });
    renderStoreCategoryEditor();
    const inputs = $("#saStoreCategories").querySelectorAll('[data-store-category-field="name"]');
    if (inputs.length) { inputs[inputs.length - 1].focus(); inputs[inputs.length - 1].select(); }
  });
  $("#saStoreCategories").addEventListener("input", function (event) {
    const field = event.target.closest("[data-store-category-field]");
    const row = event.target.closest("[data-store-category]");
    if (!field || !row) return;
    const item = siteConfig.storefront.categories[Number(row.dataset.storeCategory)];
    if (!item) return;
    item[field.dataset.storeCategoryField] = field.value;
    if (field.dataset.storeCategoryField === "image") {
      const preview = row.querySelector("[data-store-category-preview]");
      const image = safeProductImage(field.value);
      if (preview && image) preview.src = image;
    }
  });
  $("#saStoreCategories").addEventListener("click", function (event) {
    const button = event.target.closest("[data-remove-store-category]");
    if (!button) return;
    siteConfig.storefront.categories.splice(Number(button.dataset.removeStoreCategory), 1);
    renderStoreCategoryEditor();
  });
  $("#saStoreCategories").addEventListener("change", async function (event) {
    const input = event.target.closest("[data-store-category-image-upload]");
    if (!input || !input.files || !input.files[0]) return;
    const index = Number(input.dataset.storeCategoryImageUpload), item = siteConfig.storefront.categories[index];
    if (!item) { input.value = ""; return; }
    try {
      item.image = await readStorefrontImage(input.files[0], "category");
      renderStoreCategoryEditor(); renderPending();
      toast("أُضيفت صورة القسم؛ احفظ هوية المتجر لنشرها.");
    } catch (error) { toast(error.message || "تعذّر رفع صورة القسم."); input.value = ""; }
  });
  $("#saStoreLogo").addEventListener("input", function (event) {
    const logo = safeProductImage(event.target.value);
    if (logo) $("#saStoreLogoPreview").src = logo;
  });
  $("#saStoreLogoUpload").addEventListener("change", async function (event) {
    if (!event.target.files || !event.target.files[0]) return;
    try {
      const logo = await readStorefrontImage(event.target.files[0], "logo");
      $("#saStoreLogo").value = logo;
      $("#saStoreLogoPreview").src = logo;
      renderPending();
      toast("أُضيف الشعار؛ احفظ هوية المتجر لنشره.");
    } catch (error) { toast(error.message || "تعذّر رفع الشعار."); }
    event.target.value = "";
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
    const id = Number(button.dataset.addShow), ids = (siteConfig.recommendations.tvmazeIds || []).slice();
    if (!Number.isInteger(id) || id <= 0) return;
    const replaceIndex = ids.indexOf(Number(replaceTvMazeId));
    if (replaceIndex >= 0) {
      if (ids.includes(id)) { toast("هذا المسلسل موجود بالفعل في الترشيحات."); return; }
      ids[replaceIndex] = id; replaceTvMazeId = "";
    } else { if (ids.includes(id)) return; ids.push(id); }
    siteConfig.recommendations.tvmazeIds = ids.slice(0, 12);
    renderDashboard(); stageDashboardConfig(replaceIndex >= 0 ? "تم استبدال المسلسل في الترشيحات." : "أُضيف المسلسل إلى الترشيحات.");
  });
  dashboard.addEventListener("click", function (event) {
    const replaceShow = event.target.closest("[data-replace-show]");
    if (replaceShow) { replaceTvMazeId = replaceShow.dataset.replaceShow; $("#saTvSearch").focus(); toast("ابحث عن مسلسل جديد ثم اضغط «إضافة» لاستبداله."); return; }
    const show = event.target.closest("[data-remove-show]");
    if (show) {
      if (!window.confirm("حذف هذا المسلسل من الترشيحات؟")) return;
      siteConfig.recommendations.tvmazeIds = siteConfig.recommendations.tvmazeIds.filter(function (id) { return String(id) !== show.dataset.removeShow; }); renderDashboard(); stageDashboardConfig("حُذف المسلسل من الترشيحات."); return;
    }
    const movieEdit = event.target.closest("[data-edit-movie]");
    if (movieEdit) {
      const index = Number(movieEdit.dataset.editMovie), item = siteConfig.recommendations.movies[index], form = $("#saMovieForm");
      if (!item) return;
      form.elements.editIndex.value = String(index); form.elements.title.value = item.title || ""; form.elements.description.value = item.description || ""; form.elements.image.value = item.image || ""; form.elements.url.value = item.url || "";
      form.querySelector('button[type="submit"]').textContent = "حفظ التعديل"; form.scrollIntoView({ behavior: "smooth", block: "center" }); return;
    }
    const movie = event.target.closest("[data-remove-movie]");
    if (movie) {
      const index = Number(movie.dataset.removeMovie), item = siteConfig.recommendations.movies[index];
      if (!item || !window.confirm("حذف الفيلم «" + item.title + "» من الترشيحات؟")) return;
      siteConfig.recommendations.movies.splice(index, 1); renderDashboard(); stageDashboardConfig("حُذف الفيلم من الترشيحات."); return;
    }
    const remove = event.target.closest("[data-remove-product]");
    if (remove) {
      const item = siteConfig.products[Number(remove.dataset.removeProduct)];
      if (!item || !window.confirm("حذف المنتج «" + item.title + "» من المتجر؟")) return;
      siteConfig.products.splice(Number(remove.dataset.removeProduct), 1); renderDashboard(); stageDashboardConfig("حُذف المنتج من قائمة العرض."); return;
    }
    const edit = event.target.closest("[data-edit-product]");
    if (edit) {
      const item = siteConfig.products[Number(edit.dataset.editProduct)], form = $("#saProductForm");
      if (!item) return;
      Object.keys(item).forEach(function (key) {
        if (!form.elements[key] || ["active", "featured", "highlights", "images", "videos", "specifications", "tags"].includes(key)) return;
        form.elements[key].value = item[key] == null ? "" : item[key];
      });
      form.elements.highlights.value = Array.isArray(item.highlights) ? item.highlights.join("\n") : String(item.highlights || "");
      form.elements.images.value = Array.isArray(item.images) ? item.images.join("\n") : "";
      form.elements.videos.value = Array.isArray(item.videos) ? item.videos.join("\n") : "";
      form.elements.specifications.value = Array.isArray(item.specifications) ? item.specifications.map(function (entry) { return [entry.name || "", entry.value || ""].join(" | "); }).join("\n") : "";
      form.elements.tags.value = Array.isArray(item.tags) ? item.tags.join("، ") : "";
      form.elements.active.checked = item.active !== false;
      form.elements.featured.checked = item.featured === true;
      renderProductPreview();
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
  $("#saQuickArticle").addEventListener("click", function () { switchView("articles"); $("#saWriterTopic").focus(); });
  $("#saQuickPublish").addEventListener("click", function () { switchView("publish"); });
  $("#saMovieForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget, data = new FormData(form), title = String(data.get("title") || "").trim(), description = String(data.get("description") || "").trim();
    if (!title || !description) return;
    function safeUrl(value) { try { const url = new URL(String(value || "").trim()); return url.protocol === "https:" ? url.href : ""; } catch (_) { return ""; } }
    const movie = { title: title, description: description, image: safeUrl(data.get("image")), url: safeUrl(data.get("url")) };
    const editValue = String(data.get("editIndex") || ""), editIndex = editValue === "" ? -1 : Number(editValue);
    if (Number.isInteger(editIndex) && editIndex >= 0 && editIndex < siteConfig.recommendations.movies.length) siteConfig.recommendations.movies[editIndex] = movie;
    else siteConfig.recommendations.movies = siteConfig.recommendations.movies.concat([movie]).slice(0, 12);
    form.reset(); form.elements.editIndex.value = ""; form.querySelector('button[type="submit"]').textContent = "إضافة الفيلم"; renderDashboard(); stageDashboardConfig(editIndex >= 0 ? "تم تحديث ترشيح الفيلم." : "أُضيف الفيلم إلى الترشيحات اليدوية.");
  });
  $("#saMovieClear").addEventListener("click", function () { const form = $("#saMovieForm"); form.reset(); form.elements.editIndex.value = ""; form.querySelector('button[type="submit"]').textContent = "إضافة الفيلم"; });
  $("#saProductImportBtn").addEventListener("click", async function () {
    const sourceField = $("#saProductImportUrl");
    const sourceUrl = sourceField.value.trim();
    const status = $("#saProductImportStatus");
    if (!sourceUrl) { toast("الصق رابط صفحة المنتج أولًا."); sourceField.focus(); return; }
    try {
      const parsed = new URL(sourceUrl);
      if (parsed.protocol !== "https:" || parsed.username || parsed.password || (parsed.port && parsed.port !== "443")) throw new Error("استخدم رابط HTTPS عامًّا من دون بيانات دخول.");
    } catch (error) { toast(error.message || "رابط المنتج غير صالح."); sourceField.focus(); return; }
    if (!$("#saProductImportRights").checked) { toast("أكد امتلاك إذن استخدام بيانات وصور هذا المنتج."); return; }
    if (productImportInProgress || articleResearchInProgress) { toast("انتظر اكتمال العملية الحالية."); return; }
    const form = $("#saProductForm");
    if ((form.elements.title.value.trim() || form.elements.description.value.trim()) &&
        !window.confirm("سيستبدل الاستيراد الحقول التي وجد لها بيانات في النموذج. هل تتابع؟")) return;
    const button = $("#saProductImportBtn");
    productImportInProgress = true;
    button.disabled = true;
    status.textContent = "سيتم جلب البيانات العامة المتاحة فقط؛ لا يُستخدم تسجيل دخول ولا يتم تجاوز حماية الموقع.";
    try {
      const result = await requestProductImport(sourceUrl);
      if (!result.ok || !result.product) throw new Error(result.error || "لم تظهر بيانات منتج قابلة للاستيراد في الصفحة.");
      const product = result.product, set = function (name, value) {
        if (value !== undefined && value !== null && String(value) !== "" && form.elements[name]) form.elements[name].value = String(value);
      };
      set("title", product.title);
      set("category", product.category);
      set("brand", product.brand);
      set("sku", product.sku);
      set("description", product.description);
      set("price", product.price);
      set("oldPrice", product.oldPrice);
      set("currency", product.currency);
      set("image", (product.images || [])[0] || product.image);
      set("images", (product.images || []).slice(1).join("\n"));
      set("videos", (product.videos || []).join("\n"));
      set("highlights", (product.highlights || []).join("\n"));
      set("specifications", (product.specifications || []).map(function (item) { return [item.name || "", item.value || ""].join(" | "); }).join("\n"));
      set("imageAlt", product.title);
      set("sourceUrl", result.finalUrl || product.sourceUrl || sourceUrl);
      if (product.availability && ["available", "preorder", "unavailable"].includes(product.availability)) form.elements.availability.value = product.availability;
      if (product.stock !== undefined && product.stock !== null) set("stock", product.stock);
      renderProductPreview();
      const fields = Array.isArray(result.found) ? result.found.join("، ") : "البيانات التي يدعمها النموذج";
      const warnings = Array.isArray(result.warnings) && result.warnings.length ? " ملاحظات: " + result.warnings.join(" · ") : "";
      status.textContent = "اكتمل الاستيراد. عُبئت: " + fields + ". راجع السعر والصور والوصف والمواصفات قبل حفظ المنتج." + warnings;
      form.elements.title.focus();
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      toast("تمت تعبئة بيانات المنتج؛ راجعها ثم احفظ.");
    } catch (error) {
      status.textContent = error.message || "تعذّر استيراد بيانات المنتج.";
      toast(error.message || "تعذّر استيراد بيانات المنتج.");
    } finally { productImportInProgress = false; button.disabled = false; }
  });
  $("#saProductForm").addEventListener("input", renderProductPreview);
  $("#saProductForm").addEventListener("change", renderProductPreview);
  $("#saProductClear").addEventListener("click", function () {
    const form = $("#saProductForm");
    form.reset();
    form.elements.id.value = "";
    renderProductPreview();
    form.elements.title.focus();
  });
  async function uploadProductMedia(files, kind, setAsCover) {
    const form = $("#saProductForm");
    const list = Array.from(files || []);
    if (!list.length) return;
    const currentImages = [form.elements.image.value.trim()].concat(form.elements.images.value.split(/\r?\n/).map(function (value) { return value.trim(); })).filter(Boolean);
    const currentVideos = form.elements.videos.value.split(/\r?\n/).map(function (value) { return value.trim(); }).filter(Boolean);
    const maxCount = kind === "image" ? 8 : 2;
    const remaining = maxCount - (kind === "image" ? currentImages.length : currentVideos.length);
    if (list.length > remaining) { toast(kind === "image" ? "يمكنك إضافة حتى 8 صور للمنتج." : "يمكنك إضافة فيديوهين كحد أقصى."); return; }
    const mimePattern = kind === "image" ? /^image\/(png|jpeg|webp|avif)$/ : /^video\/(mp4|webm)$/;
    const maxSize = kind === "image" ? 4 * 1024 * 1024 : 15 * 1024 * 1024;
    for (const file of list) {
      if (!mimePattern.test(file.type) || file.size > maxSize) {
        toast(kind === "image" ? "اختر صور PNG أو JPG أو WebP أو AVIF، بحد 4 ميغابايت للصورة." : "اختر فيديو MP4 أو WebM بحجم 15 ميغابايت أو أقل.");
        return;
      }
    }
    try {
      const created = [];
      for (const file of list) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^\.+/, "").slice(-70) || (kind === "image" ? "product-image" : "product-video");
        const path = "assets/store-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + "-" + safeName;
        const reader = new FileReader();
        const base64 = await new Promise(function (resolve, reject) {
          reader.onload = function () { resolve(String(reader.result).split(",")[1] || ""); };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        binaryPending[path] = base64;
        original[path] = { sha: null, content: "" };
        created.push({ path: "/" + path, name: file.name });
      }
      if (kind === "image") {
        if (setAsCover && created[0]) form.elements.image.value = created[0].path;
        const extras = created.slice(setAsCover ? 1 : 0).map(function (item) { return item.path; });
        form.elements.images.value = [form.elements.images.value.trim(), extras.join("\n")].filter(Boolean).join("\n");
        if (!form.elements.imageAlt.value.trim()) form.elements.imageAlt.value = form.elements.title.value.trim() || created[0].name;
      } else {
        form.elements.videos.value = [form.elements.videos.value.trim(), created.map(function (item) { return item.path; }).join("\n")].filter(Boolean).join("\n");
      }
      renderPending();
      renderProductPreview();
      toast(kind === "image" ? "أُضيفت الصور إلى معرض المنتج." : "أُضيفت الفيديوهات إلى المنتج.");
    } catch (_) { toast("تعذّرت قراءة أحد الملفات."); }
  }
  $("#saProductImageUpload").addEventListener("change", async function (event) {
    await uploadProductMedia(event.target.files, "image", true);
    event.target.value = "";
  });
  $("#saProductGalleryUpload").addEventListener("change", async function (event) {
    await uploadProductMedia(event.target.files, "image", false);
    event.target.value = "";
  });
  $("#saProductVideoUpload").addEventListener("change", async function (event) {
    await uploadProductMedia(event.target.files, "video", false);
    event.target.value = "";
  });
  $("#saProductForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget, data = new FormData(form), title = String(data.get("title") || "").trim(), description = String(data.get("description") || "").trim();
    if (!title || !description) return;
    const image = safeProductImage(data.get("image"));
    const url = safeDashboardUrl(data.get("url"));
    const sourceUrl = safeDashboardUrl(data.get("sourceUrl"));
    const imagesRaw = String(data.get("images") || "").split(/\r?\n/).map(function (value) { return value.trim(); }).filter(Boolean);
    const videosRaw = String(data.get("videos") || "").split(/\r?\n/).map(function (value) { return value.trim(); }).filter(Boolean);
    const images = imagesRaw.map(safeProductImage);
    const videos = videosRaw.map(safeProductImage);
    if (data.get("image") && !image) { toast("رابط الصورة يجب أن يكون HTTPS أو مسارًا آمنًا داخل assets."); return; }
    if (images.some(function (value) { return !value; })) { toast("تحقق من روابط الصور الإضافية: HTTPS أو مسار داخل assets."); return; }
    if (videos.some(function (value) { return !value; })) { toast("روابط الفيديو يجب أن تكون HTTPS أو مسارات داخل assets."); return; }
    if (images.length + (image ? 1 : 0) > 8 || videos.length > 6) { toast("الحد الأقصى 8 صور و6 روابط فيديو للمنتج."); return; }
    if (data.get("url") && !url) { toast("رابط الطلب يجب أن يكون HTTPS."); return; }
    if (data.get("sourceUrl") && !sourceUrl) { toast("رابط المصدر يجب أن يكون HTTPS."); return; }
    const specs = String(data.get("specifications") || "").split(/\r?\n/).map(function (line) {
      const parts = line.split("|").map(function (part) { return part.trim(); });
      return parts[0] && parts[1] ? { name: parts[0].slice(0, 80), value: parts.slice(1).join(" | ").slice(0, 160) } : null;
    }).filter(Boolean).slice(0, 24);
    const coverImage = image || images[0] || "";
    const currentId = String(data.get("id") || "");
    const existingProduct = siteConfig.products.find(function (item) { return item.id === currentId; });
    const product = {
      id: currentId || "product-" + Date.now(), title: title, category: String(data.get("category") || "").trim(),
      description: description, brand: String(data.get("brand") || "").trim(), sku: String(data.get("sku") || "").trim(),
      warranty: String(data.get("warranty") || "").trim(), delivery: String(data.get("delivery") || "").trim(),
      highlights: String(data.get("highlights") || "").split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean).slice(0, 16),
      specifications: specs, tags: String(data.get("tags") || "").split(/[،,]/).map(function (value) { return value.trim(); }).filter(Boolean).slice(0, 12),
      price: String(data.get("price") || "").trim(), oldPrice: String(data.get("oldPrice") || "").trim(), currency: String(data.get("currency") || "").trim(),
      stock: data.get("stock") === "" ? null : Math.max(0, Math.min(999999, Number(data.get("stock")) || 0)),
      image: coverImage, images: images, videos: videos, imageAlt: String(data.get("imageAlt") || title).trim(), url: url, sourceUrl: sourceUrl,
      availability: ["available", "preorder", "unavailable"].includes(String(data.get("availability"))) ? String(data.get("availability")) : "available",
      featured: form.elements.featured.checked, active: form.elements.active.checked,
      createdAt: existingProduct && existingProduct.createdAt ? existingProduct.createdAt : new Date().toISOString()
    };
    const index = siteConfig.products.findIndex(function (item) { return item.id === currentId; });
    if (index >= 0) siteConfig.products[index] = product; else siteConfig.products.push(product);
    const linkedMedia = new Set([product.image].concat(product.images || [], product.videos || []).filter(Boolean));
    const newMediaPaths = Object.keys(binaryPending).filter(function (path) { return linkedMedia.has("/" + path); });
    form.reset(); form.elements.currency.value = "ر.س"; form.elements.active.checked = true;
    form.elements.availability.value = "available";
    renderDashboard(); stageDashboardConfig("تم حفظ المنتج ووسائطه ونشرها مع الإعدادات.", newMediaPaths);
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
      toast("فشل الاتصال: " + friendlyGitHubError(error));
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
    persistPendingCache();
    selectedPath = "";
    $("#saWorkspace").hidden = true;
    $("#saConnect").hidden = false;
    $("#saToken").value = "";
    $("#saEditor").value = "";
    setStatus("غير متصل", false);
    renderPending();
    toast("تم فصل الاتصال مع الاحتفاظ بالمسودات المعلّقة في هذه الجلسة.");
  });
  $("#saStageFile").addEventListener("click", function () {
    if (!selectedPath || $("#saEditor").disabled) return;
    stage(selectedPath, $("#saEditor").value, selectedOriginal);
    $("#saEditorMeta").textContent = "التعديل جاهز للمراجعة والنشر.";
  });
  async function removeArticleFromSite(path, title) {
    const match = /^articles\/([a-z0-9]+(?:-[a-z0-9]+)*)\.html$/i.exec(path);
    if (!match || !window.confirm("حذف المقال «" + title + "»؟ سيتم تحديث الفهرس وخريطة الموقع أيضًا.")) return;
    const slug = match[1], canonical = "https://diamond-tv.shop/" + path;
    try {
      let listing = pending["articles/index.html"] || await fetchLatestFile("articles/index.html");
      const doc = new DOMParser().parseFromString(listing, "text/html");
      const links = Array.from(doc.querySelectorAll("a[href]")).filter(function (link) { return (link.getAttribute("href") || "").split(/[?#]/)[0] === slug + ".html"; });
      if (!links.length) throw new Error("لم أجد رابط المقال في فهرس المقالات.");
      links.forEach(function (link) { link.remove(); });
      const schema = Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).find(function (node) { return /"@graph"/.test(node.textContent); });
      if (schema) {
        try {
          const graph = JSON.parse(schema.textContent), itemList = (graph["@graph"] || []).find(function (item) { return item["@type"] === "ItemList"; });
          if (itemList) itemList.itemListElement = (itemList.itemListElement || []).filter(function (item) { return item.url !== canonical; }).map(function (item, index) { item.position = index + 1; return item; });
          schema.textContent = JSON.stringify(graph);
        } catch (_) { throw new Error("تعذّر تحديث بيانات المقال المنظمة في الفهرس."); }
      }
      listing = "<!doctype html>\n" + doc.documentElement.outerHTML + "\n";
      let sitemap = pending["sitemap.xml"] || await fetchLatestFile("sitemap.xml");
      const xml = new DOMParser().parseFromString(sitemap, "application/xml");
      if (xml.querySelector("parsererror")) throw new Error("تعذّر قراءة خريطة الموقع.");
      const entries = Array.from(xml.getElementsByTagName("url"));
      const entry = entries.find(function (node) { const loc = node.getElementsByTagName("loc")[0]; return loc && loc.textContent.trim() === canonical; });
      if (!entry) throw new Error("لم أجد رابط المقال في خريطة الموقع.");
      entry.parentNode.removeChild(entry);
      sitemap = new XMLSerializer().serializeToString(xml);
      stage("articles/index.html", listing, original["articles/index.html"] && original["articles/index.html"].content);
      stage("sitemap.xml", sitemap, original["sitemap.xml"] && original["sitemap.xml"].content);
      if (treeFiles.some(function (file) { return file.path === path; })) stageDelete(path);
      else { delete pending[path]; delete binaryPending[path]; delete original[path]; renderPending(); }
      await renderArticleManager();
      switchView("publish");
      toast("جارٍ حذف المقال وتحديث الفهرس وخريطة الموقع…");
      const saved = await publishPendingPaths([path, "articles/index.html", "sitemap.xml"]);
      if (saved) toast("تم حذف المقال وتحديث فهرسه وخريطة الموقع تلقائيًا.");
      else toast("تعذّر إكمال الحذف تلقائيًا؛ بقيت الملفات في قائمة المراجعة مع توضيح السبب.");
    } catch (error) { toast(error.message || "تعذّر تجهيز حذف المقال."); }
  }
  function normalizeSearchText(value) {
    return String(value || "").toLowerCase().replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
      .replace(/[^a-z0-9\u0600-\u06ff\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function countPhrase(text, phrase) {
    if (!phrase) return 0;
    let count = 0, from = 0, at;
    while ((at = text.indexOf(phrase, from)) !== -1) { count += 1; from = at + phrase.length; }
    return count;
  }
  function transliterateSlug(value) {
    const letters = { "ا":"a","أ":"a","إ":"i","آ":"aa","ب":"b","ت":"t","ث":"th","ج":"j","ح":"h","خ":"kh","د":"d","ذ":"dh","ر":"r","ز":"z","س":"s","ش":"sh","ص":"s","ض":"d","ط":"t","ظ":"z","ع":"a","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","ة":"h","و":"w","ي":"y","ى":"a","ؤ":"w","ئ":"y","ء":"" };
    return String(value || "").toLowerCase().replace(/[\u064b-\u065f\u0670]/g, "").split("").map(function (char) {
      return letters[char] !== undefined ? letters[char] : char;
    }).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/g, "");
  }
  function updateSearchPreview(form) {
    $("#saPreviewTitle").textContent = metaField(form, "title") || "سيظهر عنوان المقال هنا";
    $("#saPreviewDescription").textContent = metaField(form, "description") || "سيظهر وصف المقال هنا";
    const slug = metaField(form, "slug").replace(/[^a-z0-9-]/g, "");
    $("#saPreviewUrl").textContent = "diamond-tv.shop/articles/" + (slug || "");
  }
  function renderKeywordIdeas() {
    const topic = $("#saWriterTopic").value.trim(), ideas = $("#saKeywordIdeas");
    ideas.replaceChildren();
    if (!topic) return;
    [topic, "كيف تختار " + topic, "أفضل " + topic, "مميزات " + topic, "مقارنة " + topic, "أسئلة شائعة عن " + topic].forEach(function (phrase) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ghost sm";
      button.dataset.keyword = phrase;
      button.textContent = phrase;
      ideas.appendChild(button);
    });
  }
  const OFFICIAL_SOURCE_DOMAINS = ["fifa.com","uefa.com","the-afc.com","cafonline.com","icc-cricket.com","nba.com","nfl.com","premierleague.com","saudiproleague.com","spl.com.sa","laliga.com","bundesliga.com","legaseriea.it","ligue1.com","conmebol.com","fiba.basketball","saff.com.sa","egyptianproleague.com","spa.gov.sa","mbc.net","shahid.mbc.net","netflix.com","primevideo.com","disneyplus.com","osn.com","osnplus.com","starzplay.com","jawwy.tv"];
  const KNOWN_NEWS_DOMAINS = ["reuters.com","apnews.com","afp.com","bbc.com","bbc.co.uk","aljazeera.net","aljazeera.com","dawn.com","ndtv.com","ndtvprofit.com","minutemirror.com.pk","espn.com","espncricinfo.com","cricbuzz.com","skysports.com","arabnews.com","alarabiya.net","asharq.com","aawsat.com","theguardian.com","goal.com","kooora.com","thehindu.com","indiatoday.in","indianexpress.com","hindustantimes.com","timesofindia.indiatimes.com","variety.com","hollywoodreporter.com","deadline.com","indiewire.com","screenrant.com","yahoo.com","yahoo.net","cnn.com","npr.org","cbsnews.com","dw.com","france24.com","skynewsarabia.com","alaraby.co.uk","al-monitor.com","al-ain.com","almasryalyoum.com","ahram.org.eg","youm7.com","masrawy.com","elwatannews.com","alriyadh.com","okaz.com.sa","sabq.org","saudigazette.com.sa","arriyadiyah.com","nytimes.com","washingtonpost.com","theathletic.com","axios.com","nme.com","empireonline.com","independentarabia.com","akhbaar24.com","al-madina.com","albilad.com","alyaum.com","aleqt.com","rt.com"];
  function sourceAssessment(rawUrl, publisherDomain) {
    try {
      const url = new URL(String(rawUrl || "").trim());
      if (url.protocol !== "https:" || url.username || url.password) return { valid: false, trusted: false, official: false, host: "", label: "رابط غير آمن" };
      const declared = String(publisherDomain || "").toLowerCase().replace(/^www\./, "");
      const trustedHost = /^[a-z0-9.-]+$/.test(declared) && declared.indexOf(".") > 0 ? declared : "";
      const host = trustedHost || url.hostname.toLowerCase().replace(/^www\./, "");
      const officialDomain = OFFICIAL_SOURCE_DOMAINS.find(function (domain) { return host === domain || host.endsWith("." + domain); });
      const newsDomain = KNOWN_NEWS_DOMAINS.find(function (domain) { return host === domain || host.endsWith("." + domain); });
      const official = Boolean(officialDomain), trusted = official || Boolean(newsDomain);
      return { valid: true, trusted: trusted, official: official, host: host, publisher: officialDomain || newsDomain || host, label: official ? "جهة رسمية" : trusted ? "ناشر معروف" : "نطاق غير مدرج" };
    } catch (_) { return { valid: false, trusted: false, official: false, host: "", label: "رابط غير صالح" }; }
  }
  function sourceEntriesFor(url) {
    return activeLinkCheckResults.filter(function (entry) { return entry.url === url || entry.finalUrl === url; }).concat(
      activeResearchSources.filter(function (entry) { return entry.url === url || entry.finalUrl === url; }),
      trendItems.flatMap(function (trend) { return (trend.news || []).filter(function (entry) { return entry.url === url; }); })
    );
  }
  function reviewSourceSet(urls, topic) {
    const rows = urls.map(function (url) {
      const entries = sourceEntriesFor(url), entry = entries[0] || null;
      const check = sourceAssessment(url, entry && entry.domain);
      return { url: url, assessment: check, entry: entry, reachable: entry && typeof entry.reachable === "boolean" ? entry.reachable : null };
    });
    const domains = new Set(rows.filter(function (row) { return row.assessment.trusted; }).map(function (row) { return row.assessment.publisher; }));
    const matched = rows.filter(function (row) {
      if (!row.entry) return false;
      const sourceText = normalizeSearchText((row.entry.title || "") + " " + (row.entry.description || ""));
      const terms = normalizeSearchText(topic).split(" ").filter(function (term) { return term.length > 2; });
      return terms.length > 0 && terms.some(function (term) { return sourceText.includes(term); });
    }).length;
    return {
      rows: rows, trustedDomains: domains.size,
      summaryCount: rows.filter(function (row) { return row.entry && String(row.entry.description || "").trim().length >= 40; }).length,
      checkedCount: rows.filter(function (row) { return row.reachable !== null; }).length,
      reachableCount: rows.filter(function (row) { return row.reachable === true; }).length,
      matchedCount: matched
    };
  }
  function isRelevantTrend(item) {
    const title = normalizeSearchText(item.title || "");
    if (item.category === "sports") return /رياض|مبار|دوري|كره|منتخب|بطوله|كاس|\bvs\b|\bu\d{2}\b|\b(?:nba|nfl|afc|uefa|fifa|cricket|football|soccer|basketball|champions league|asia cup|world cup|premier league|warriors|pelicans|lakers|celtics)\b/.test(title);
    if (item.category === "entertainment") return /مسلسل|فيلم|سينما|دراما|ممثل|برنامج|رمضان|netflix|shahid|series|movie|film|actor|episode|season/.test(title);
    return false;
  }
  function renderTrendItems() {
    const list = $("#saTrendList");
    list.replaceChildren();
    if (!trendItems.length) {
      list.innerHTML = '<p class="hint">لا توجد موضوعات رياضية أو ترفيهية في آخر تحديث. حدّث القائمة لاحقًا.</p>';
      return;
    }
    trendItems.slice(0, 20).forEach(function (item, index) {
      const row = document.createElement("article");
      row.className = "sa-trend-item";
      const headline = document.createElement("b");
      headline.textContent = item.title;
      const details = document.createElement("span");
      details.className = "hint";
      details.textContent = (item.category === "sports" ? "رياضة" : "ترفيه") + (item.traffic ? " · " + item.traffic : "") + (item.publishedAt ? " · " + item.publishedAt : "");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ghost sm";
      button.dataset.trendIndex = String(index);
      button.textContent = "توليد مقال كامل وتحليله";
      row.append(headline, details, button);
      const news = (item.news || []).filter(function (entry) { return entry.title && /^https:\/\//i.test(entry.url || ""); }).slice(0, 10);
      if (news.length) {
        const sourceList = document.createElement("ul");
        sourceList.className = "sa-trend-headlines";
        news.forEach(function (entry) {
          const li = document.createElement("li"), link = document.createElement("a");
          link.href = entry.url; link.target = "_blank"; link.rel = "noopener noreferrer";
          const assessment = sourceAssessment(entry.url, entry.domain);
          link.textContent = entry.title + (entry.source ? " — " + entry.source : "");
          li.appendChild(link);
          const label = document.createElement("small");
          label.className = "sa-source-label";
          label.textContent = assessment.label + (entry.reachable === true ? " · الرابط متاح في آخر فحص" : entry.reachable === false ? " · تعذّر الوصول في آخر فحص" : " · لم يُفحص الاتصال بعد");
          li.appendChild(label);
          if (entry.description) {
            const summary = document.createElement("p");
            summary.className = "sa-trend-summary";
            summary.textContent = entry.description;
            li.appendChild(summary);
          }
          sourceList.appendChild(li);
        });
        row.appendChild(sourceList);
      }
      list.appendChild(row);
    });
  }
  async function loadTrendSnapshot(force) {
    const status = $("#saTrendStatus"), button = $("#saRefreshTrends");
    if (!force && trendsLoaded) return;
    button.disabled = true;
    status.textContent = "جارٍ تحميل آخر بيانات Google Trends…";
    try {
      const response = await fetch("../assets/google-trends.json?refresh=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      trendUpdatedAt = data.updatedAt || "";
      trendItems = Array.isArray(data.trends) ? data.trends.filter(function (item) { return item && item.title && isRelevantTrend(item); }) : [];
      trendsLoaded = true;
      const updated = data.updatedAt ? new Date(data.updatedAt) : null;
      status.textContent = updated && !Number.isNaN(updated.getTime())
        ? "آخر تحديث: " + new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" }).format(updated) + " · " + trendItems.length + " موضوعًا"
        : "لم يصل تحديث الترند بعد؛ يبدأ التحديث الدوري بعد تشغيل مهمة GitHub Actions.";
      renderTrendItems();
    } catch (_) {
      status.textContent = "تعذّر تحميل القائمة الآن. يمكنك تحديثها أو فتح Google Trends يدويًا.";
      trendItems = [];
      renderTrendItems();
    } finally { button.disabled = false; }
  }
  function researchTopicFromSnapshot(topic) {
    const normalizedTopic = normalizeSearchText(topic);
    const ignored = new Set(["الذي","التي","هذا","هذه","على","عن","في","من","ما","كيف","اخر","آخر","موضوع","مقال","حول","the","and","for","with"]);
    const terms = normalizedTopic.split(/\s+/).filter(function (term) { return term.length >= 3 && !ignored.has(term); });
    if (!terms.length) return null;
    const required = Math.max(1, Math.ceil(terms.length * 0.34));
    const ranked = trendItems.map(function (item) {
      const corpus = normalizeSearchText(item.title + " " + (item.news || []).map(function (entry) {
        return (entry.title || "") + " " + (entry.description || "");
      }).join(" "));
      const matches = terms.filter(function (term) { return corpus.indexOf(term) !== -1; }).length;
      const titleText = normalizeSearchText(item.title);
      const exactTitle = titleText === normalizedTopic || titleText.indexOf(normalizedTopic) !== -1 || normalizedTopic.indexOf(titleText) !== -1;
      return { item: item, matches: matches, exact: exactTitle };
    }).filter(function (row) { return row.exact || row.matches >= required; })
      .sort(function (a, b) { return (b.exact ? 100 : 0) + b.matches - ((a.exact ? 100 : 0) + a.matches); });
    if (!ranked.length) return null;
    const best = ranked[0];
    const related = ranked.filter(function (row) { return row.exact || row.matches >= Math.max(required, best.matches - 1); }).slice(0, 4);
    const entries = [];
    related.forEach(function (row) {
      (row.item.news || []).forEach(function (entry) {
        const text = normalizeSearchText((entry.title || "") + " " + (entry.description || ""));
        const matchCount = terms.filter(function (term) { return text.indexOf(term) !== -1; }).length;
        if (matchCount < Math.max(1, Math.ceil(terms.length * 0.25))) return;
        if (!/^https:\/\//i.test(entry.url || "")) return;
        entries.push(Object.assign({}, entry, { _topicMatch: matchCount }));
      });
    });
    const deduped = [];
    const seenUrls = new Set();
    entries.sort(function (a, b) {
      return b._topicMatch - a._topicMatch ||
        (Number(b.reachable === true) - Number(a.reachable === true)) ||
        (String(b.description || "").length - String(a.description || "").length);
    }).forEach(function (entry) {
      if (seenUrls.has(entry.url)) return;
      seenUrls.add(entry.url);
      delete entry._topicMatch;
      deduped.push(entry);
    });
    if (!deduped.length) return null;
    return {
      title: String(topic || "").trim(),
      category: best.item.category,
      traffic: best.item.traffic || "",
      publishedAt: best.item.publishedAt || "",
      news: deduped,
      researchMatchedTopics: related.map(function (row) { return row.item.title; })
    };
  }
  function useTrendItem(item) {
    const form = $("#saArticleForm");
    const title = String(item.title || "").trim();
    const validNews = selectTrendSources(item).slice(0, 12);
    if (!title || !validNews.length) {
      toast("لا تتوفر روابط أخبار موثوقة لهذا الموضوع بعد؛ اختر موضوعًا آخر أو أضف مصادر يدويًا.");
      return;
    }
    const topic = title;
    $("#saWriterTopic").value = topic;
    $("#saWriterKeyword").value = title;
    $("#saWriterBrief").value = "موضوع رائج: " + title + (item.traffic ? " · إشارة اهتمام تقريبية: " + item.traffic : "") +
      "\nسيُعاد البحث عن مصادر حديثة عند إنشاء المسودة. لا تعتمد على لقطة الترند وحدها لإثبات الوقائع."; 
    form.elements.sources.value = validNews.map(function (entry) { return entry.url; }).join("\n");
    form.elements.category.value = item.category === "sports" ? "رياضة" : "مسلسلات";
    generateArticleDraft({ trend: item });
  }
  function selectTrendSources(trend, includeUntrusted) {
    const candidates = (trend.news || []).filter(function (entry) {
      const assessment = sourceAssessment(entry.url, entry.domain);
      return entry.title && assessment.valid && (assessment.trusted || includeUntrusted === true);
    }).slice().sort(function (a, b) {
      const aa = sourceAssessment(a.url, a.domain), bb = sourceAssessment(b.url, b.domain);
      const score = function (entry, check) {
        return (entry.articleRead === true ? 1000 : 0) + Math.min(100, Number(entry.articleWordCount) || 0) +
          (entry.reachable === true ? 60 : 0) + (check.official ? 40 : 0) +
          (String(entry.description || "").trim().length >= 40 ? 20 : 0);
      };
      return score(b, bb) - score(a, aa);
    });
    const seen = new Set();
    return candidates.filter(function (entry) {
      const assessment = sourceAssessment(entry.url, entry.domain), publisher = assessment.publisher || assessment.host;
      if (!publisher || seen.has(publisher)) return false;
      seen.add(publisher);
      return true;
    });
  }
  function createTrendFactReview(trend, news) {
    const domains = new Set(news.map(function (entry) { return sourceAssessment(entry.url, entry.domain).publisher; }).filter(Boolean));
    const reachable = news.filter(function (entry) { return entry.reachable === true; }).length;
    const summaries = news.filter(function (entry) { return String(entry.description || "").trim().length >= 40; }).length;
    const readablePages = news.filter(function (entry) { return entry.articleRead === true; }).length;
    const extractedWords = news.reduce(function (sum, entry) { return sum + (Number(entry.articleWordCount) || 0); }, 0);
    const numericSources = Object.create(null);
    news.forEach(function (entry) {
      const text = String(entry.title || "") + " " + String(entry.description || "");
      const western = text.replace(/[٠-٩]/g, function (digit) { return String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)); });
      (western.match(/\b\d{1,3}\s*[-–/:]\s*\d{1,3}\b/g) || []).forEach(function (value) {
        const normalized = value.replace(/\s+/g, "");
        numericSources[normalized] = numericSources[normalized] || new Set();
        const source = sourceAssessment(entry.url, entry.domain);
        numericSources[normalized].add(source.publisher || source.host);
      });
    });
    const numericValues = Object.keys(numericSources);
    const possibleConflict = numericValues.length > 1;
    const sourceUpdatedAt = trend.updatedAt || trendUpdatedAt;
    const freshAt = sourceUpdatedAt ? new Date(sourceUpdatedAt) : null;
    const fresh = Boolean(freshAt && !Number.isNaN(freshAt.getTime()) && Date.now() - freshAt.getTime() <= 48 * 60 * 60 * 1000);
    const checks = [
      { title: "مصادر مختلفة معروفة", ok: domains.size >= 2, detail: domains.size + " نطاقًا معروفًا مختلفًا." },
      { title: "إتاحة صفحات المصادر", ok: reachable >= 2, detail: reachable + " صفحة استجابت عبر HTTPS." },
      { title: "قراءة نص صفحات الناشرين", ok: readablePages >= 2, detail: "استُخرج نص كافٍ من " + readablePages + " صفحات، بنحو " + extractedWords + " كلمة إجمالًا. النص الكامل غير محفوظ." },
      { title: "وجود ملخصات وصفية", ok: summaries >= 2, detail: summaries + " ملخصًا وصفيًا؛ العنوان وحده لا يؤكد التفاصيل." },
      { title: "حداثة بيانات البحث", ok: fresh, detail: fresh ? "جُمعت النتائج خلال آخر 48 ساعة." : "حدّث البحث عن المصادر قبل النشر." },
      { title: "القيم الرقمية في الملخصات", ok: !possibleConflict, detail: possibleConflict ? "ظهرت صيغ مختلفة (" + numericValues.join("، ") + ")؛ قارن المصدر الأصلي وتوقيت التحديث." : numericValues.length ? "لم يظهر اختلاف رقمي في الملخصات؛ راجع الأصل على أي حال." : "لم تظهر أرقام قابلة للمقارنة في الملخصات." }
    ];
    return { topic: String(trend.title || ""), domains: domains.size, reachable: reachable, summaries: summaries, readablePages: readablePages, extractedWords: extractedWords, total: news.length, updatedAt: sourceUpdatedAt, fresh: fresh, numericValues: numericValues, possibleConflict: possibleConflict, checks: checks };
  }
  function trendCoverageAnalysis(trend, news, report) {
    const text = news.map(function (entry) {
      return String(entry.title || "") + " " + String(entry.description || "") + " " +
        (entry.articleRead ? (entry.analysisTerms || []).join(" ") + " " + (entry.coverageDimensions || []).join(" ") : "");
    }).join(" ").toLowerCase();
    const sports = trend.category === "sports";
    const entertainment = trend.category === "entertainment";
    const dimensions = sports ? [
      ["الموعد أو الجدول", /موعد|توقيت|جدول|schedule|when|kick.?off|fixture/i],
      ["النتيجة أو الأداء", /نتيجة|فاز|خسر|score|result|innings|\b\d{1,3}\s*[-–/:]\s*\d{1,3}\b/i],
      ["البث والمتابعة", /بث|قناة|شاهد|stream|watch|broadcast|live/i],
      ["الجهة المنظمة", /fifa|uefa|the-afc|cafonline|icc-cricket|nba\.com|nfl\.com|premierleague|saudiproleague|spl\.com\.sa/i]
    ] : entertainment ? [
      ["موعد العرض", /موعد|يعرض|العرض|release|premiere|schedule|date/i],
      ["المنصة أو الإتاحة", /منصة|شاهد|نتفليكس|netflix|prime video|disney|streaming|watch/i],
      ["الأسماء أو فريق العمل", /ممثل|بطولة|أبطال|cast|actor|actress|starring|director/i],
      ["الجهة المنتجة أو الناشرة", /إنتاج|منتج|استوديو|mbc|netflix|primevideo|disney|production|studio/i]
    ] : [
      ["السياق أو الخلفية", /خلفية|تاريخ|سياق|background|history|context/i],
      ["الأرقام أو البيانات", /نسبة|عدد|إحصاء|بيانات|percent|data|statistics|\b\d+(?:[.,]\d+)?\b/i],
      ["المصدر الرسمي أو الجهة المعنية", /وزارة|هيئة|منظمة|رسمي|official|agency|ministry|authority/i],
      ["الأثر أو الخطوات العملية", /تأثير|أثر|خطوة|دليل|impact|effect|guide|how to/i]
    ];
    const extractedDimensions = new Set();
    news.filter(function (entry) { return entry.articleRead; }).forEach(function (entry) {
      (entry.coverageDimensions || []).forEach(function (dimension) { extractedDimensions.add(String(dimension)); });
    });
    const seen = dimensions.filter(function (item) {
      return item[1].test(text) || extractedDimensions.has(item[0]);
    }).map(function (item) { return item[0]; });
    const missing = dimensions.filter(function (item) { return !seen.includes(item[0]); }).map(function (item) { return item[0]; });
    const ignored = new Set(["الذي","التي","هذا","هذه","على","عن","في","من","ما","كيف","مع","بعد","قبل","عبر","ضمن","and","the","for","with","from","this"]);
    normalizeSearchText(trend.title).split(/\s+/).forEach(function (term) { ignored.add(term); });
    const termsByPublisher = new Map();
    news.forEach(function (entry) {
      const source = sourceAssessment(entry.url, entry.domain);
      const publisher = source.publisher || source.host;
      const sourceTerms = entry.articleRead && Array.isArray(entry.analysisTerms) && entry.analysisTerms.length
        ? entry.analysisTerms
        : normalizeSearchText((entry.title || "") + " " + (entry.description || "")).split(/\s+/);
      new Set(sourceTerms.map(normalizeSearchText)).forEach(function (term) {
        if (term.length < 4 || ignored.has(term)) return;
        if (!termsByPublisher.has(term)) termsByPublisher.set(term, new Set());
        termsByPublisher.get(term).add(publisher);
      });
    });
    const sharedTerms = Array.from(termsByPublisher.entries())
      .filter(function (row) { return row[1].size >= 2; })
      .sort(function (a, b) { return b[1].size - a[1].size || b[0].length - a[0].length; })
      .slice(0, 8).map(function (row) { return row[0]; });
    const distinctTerms = Array.from(termsByPublisher.entries())
      .filter(function (row) { return row[1].size === 1; })
      .sort(function (a, b) { return b[0].length - a[0].length; })
      .slice(0, 8).map(function (row) { return row[0]; });
    const coverageText = seen.length
      ? "تظهر في النصوص المتاحة زوايا مثل " + seen.join("، ") + "."
      : "لم يستطع الفحص تحديد زوايا كافية في النص المتاح؛ لا نضيف تفاصيل مستنتجة من العناوين.";
    const gapText = missing.length
      ? "ولا تظهر بوضوح معلومات عن " + missing.join("، ") + "؛ يلزم الرجوع إلى مصدر أصلي قبل نشرها."
      : "وتظل الأسماء والتواريخ والأرقام بحاجة إلى مراجعة المصدر الأصلي.";
    const next = sports
      ? "للمتابعة العملية، راجع جدول البطولة وتوقيت المباراة وحالة النتيجة من الجهة المنظمة، وتحقق من جدول الناقل الرسمي إذا كان السؤال عن البث."
      : entertainment
        ? "قبل اتخاذ قرار المشاهدة، تحقق من إعلان جهة الإنتاج أو المنصة بشأن فريق العمل وموعد العرض وبلد الإتاحة."
        : "لتحويل التغطية إلى فائدة عملية، حدّد سؤال القارئ ثم اربط الإجابة بصفحة الجهة صاحبة المعلومة وتاريخ تحديثها.";
    const dimensionCounts = Object.create(null);
    news.filter(function (entry) { return entry.articleRead; }).forEach(function (entry) {
      const source = sourceAssessment(entry.url, entry.domain);
      const publisher = source.publisher || source.host;
      new Set(entry.coverageDimensions || []).forEach(function (dimension) {
        dimensionCounts[dimension] = dimensionCounts[dimension] || new Set();
        dimensionCounts[dimension].add(publisher);
      });
    });
    const dimensionCoverage = Object.keys(dimensionCounts).map(function (dimension) {
      return { dimension: dimension, publisherCount: dimensionCounts[dimension].size };
    }).sort(function (a, b) { return b.publisherCount - a.publisherCount || a.dimension.localeCompare(b.dimension); });
    const sharedDimensions = dimensionCoverage.filter(function (row) { return row.publisherCount >= 2; }).map(function (row) { return row.dimension; });
    return {
      seen: seen,
      missing: missing,
      sharedTerms: sharedTerms,
      distinctTerms: distinctTerms,
      dimensionCoverage: dimensionCoverage,
      sharedDimensions: sharedDimensions,
      text: coverageText + " " + gapText + " " + next,
      sharedText: sharedTerms.length
        ? "تكررت في تحليلات نصوص أكثر من ناشر مفردات مثل «" + sharedTerms.join("»، «") + "». هذا تشابه في اللغة المستخدمة، وليس إثباتًا لصحة واقعة أو اتفاق على تفاصيلها."
        : "لا تظهر مفردات مشتركة كافية بين الناشرين؛ لذلك لا تدّعي المسودة وجود رواية موحدة.",
      summary: "قورنت عناوين وملخصات وبيانات مستخلصة من صفحات " + report.total + " مصادر؛ أمكن قراءة نص كافٍ من " + report.readablePages + " صفحات."
    };
  }
  function buildTrendArticleDraft(trend, settings) {
    const config = settings || {};
    const topic = String(trend.title || "").trim();
    const news = selectTrendSources(trend, config.allowUntrusted === true).slice(0, 12);
    const report = createTrendFactReview(trend, news);
    activeTrendFactReport = report;
    const analysis = trendCoverageAnalysis(trend, news, report);
    const sourceTimestamp = trend.updatedAt || trendUpdatedAt;
    const checkedAt = sourceTimestamp ? new Date(sourceTimestamp) : null;
    const dateText = checkedAt && !Number.isNaN(checkedAt.getTime())
      ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "long", timeZone: "Asia/Riyadh" }).format(checkedAt)
      : "وقت البحث الحالي";
    const sourcesSection = news.map(function (entry) {
      const assessment = sourceAssessment(entry.url, entry.domain);
      const sourceName = entry.source || assessment.host;
      const dimensions = Array.isArray(entry.coverageDimensions) && entry.coverageDimensions.length
        ? entry.coverageDimensions.join("، ")
        : "لم يحدد الفحص الآلي زاوية واضحة من النص المتاح";
      const terms = Array.isArray(entry.analysisTerms) && entry.analysisTerms.length
        ? entry.analysisTerms.slice(0, 5).join("، ")
        : "لا توجد مفردات كافية للتحليل الآلي";
      const pageStatus = entry.articleRead
        ? "استُخرج من الصفحة نص يقارب " + (Number(entry.articleWordCount) || 0) + " كلمة" + (entry.articleTextMethod ? " عبر " + entry.articleTextMethod : "") + "."
        : "تعذرت قراءة نص كافٍ من الصفحة؛ اعتمد الفحص على العنوان والملخص المتاح فقط.";
      const summaryWords = String(entry.description || "").trim().split(/\s+/).filter(Boolean);
      const summary = summaryWords.length
        ? "الوصف التعريفي المتاح: «" + summaryWords.slice(0, 22).join(" ") + (summaryWords.length > 22 ? "…" : "") + "»."
        : "لا يتوفر وصف نصي كافٍ؛ لا نستنتج من العنوان وحده.";
      return "### " + sourceName + " — " + entry.title + "\n\n" +
        pageStatus + " " + summary + " الزوايا التي رصدها الفحص: " + dimensions + ". مفردات بارزة في النص المستخرج: " + terms + ".";
    }).join("\n\n");
    const datedSources = news.filter(function (entry) { return entry.publishedAt; }).slice().sort(function (a, b) {
      return String(a.publishedAt).localeCompare(String(b.publishedAt));
    }).map(function (entry) {
      const assessment = sourceAssessment(entry.url, entry.domain);
      return "- " + entry.publishedAt + " — " + (entry.source || assessment.host) + ": " + entry.title;
    });
    const sourceOverview = "اعتمدت هذه المسودة على " + report.total + " تغطيات من " + report.domains +
      " ناشرين وجهات مختلفة؛ أمكن استخراج نص كافٍ من " + report.readablePages + " صفحات، بنحو " + report.extractedWords +
      " كلمة إجمالًا. بقية الصفحات قد تعرض عنوانًا أو ملخصًا فقط.";
    const lead = config.tone === "simple"
      ? "إذا كنت تبحث عن «" + topic + "»، فهذه قراءة أولية لما نشرته المصادر حتى " + dateText + ". نوضح ما أمكن استخلاصه وما يحتاج إلى الرجوع للأصل."
      : config.tone === "analysis"
        ? "تُظهر مقارنة التغطيات المتاحة عن «" + topic + "» حتى " + dateText + " تباينًا في الزوايا ومستوى التفاصيل؛ لذلك نفصل بين ما رصده النص وما بقي غير محسوم."
        : "تجمع هذه المسودة أبرز ما أمكن رصده في تغطيات «" + topic + "» حتى " + dateText + "، مع فصل الإشارات المشتركة عن التفاصيل التي تحتاج إلى تحقق مباشر.";
    const commonCoverage = analysis.sharedDimensions.length
      ? "تكررت زوايا " + analysis.sharedDimensions.join("، ") + " في نصوص أكثر من ناشر."
      : "لم تظهر زاوية تغطية مشتركة بوضوح في نصوص الصفحات التي أمكن قراءتها.";
    const coverageMatrix = analysis.dimensionCoverage.length
      ? analysis.dimensionCoverage.map(function (row) { return "- " + row.dimension + ": رصدها الفحص في " + row.publisherCount + " من " + report.readablePages + " صفحات مقروءة."; }).join("\n")
      : "- لم تُستخرج بيانات كافية لبناء مقارنة بين زوايا المقالات.";
    const distinctIdeaText = analysis.distinctTerms.length
      ? "مصطلحات بارزة ظهرت في نص مصدر واحد ضمن المجموعة: " + analysis.distinctTerms.join("، ") + ". ظهورها مرة واحدة لا يؤكد أهميتها أو صحتها، لكنه يوضح زاوية تستحق فتح المصدر ومراجعتها."
      : "لم يرصد التحليل مفردات منفردة كافية للتمييز بين زوايا الناشرين.";
    const originality = "الملاحظة التحليلية: " + commonCoverage + (analysis.missing.length
      ? " بينما لم تتضح معلومات " + analysis.missing.join("، ") + " في المجموعة التي فحصناها."
      : " ومع ذلك لا يكفي تكرار الزوايا لإثبات صحة الوقائع.");
    const readerUse = trend.category === "sports"
      ? "قبل نقل أي موعد أو نتيجة، طابقها مع صفحة البطولة أو النادي، ثم راجع الناقل الرسمي لمعرفة البث. اذكر وقت التحقق لأن هذه التفاصيل تتغير."
      : trend.category === "entertainment"
        ? "قبل إضافة أسماء أو مواعيد عرض، ارجع إلى إعلان جهة الإنتاج أو منصة العرض؛ فقد تختلف الإتاحة حسب البلد وتتغير الخطط."
        : "قبل اعتماد معلومة أو نصيحة، راجع الجهة صاحبة المعلومة وتاريخها والسياق الذي تنطبق عليه، ثم أضف مثالًا عمليًا من تحرير الموقع.";
    const intentText = config.intent === "compare"
      ? "تركيز هذه المسودة هو مقارنة ما تغطيه المصادر والفجوات بينها."
      : config.intent === "list"
        ? "تقدم المسودة قائمة مراجعة منظمة تساعد القارئ على متابعة جوانب الموضوع."
        : config.intent === "explainer"
          ? "تشرح المسودة الموضوع من خلال ما ظهر في المصادر وحدود ما يمكن تأكيده."
          : "ترتب المسودة المعلومات في قراءة عملية تميز بين الرصد والاستنتاج.";
    const quick = [
      "- الموضوع: " + topic + ".",
      "- المصادر: " + report.total + " من " + report.domains + " ناشرين معروفين.",
      "- صفحات قُرئ منها نص كافٍ: " + report.readablePages + ".",
      "- أهم ما يحتاج مراجعة: " + (analysis.missing.length ? analysis.missing.join("، ") : "الأسماء والأرقام والتواريخ من المصدر الأصلي") + "."
    ].join("\n");
    const faq = [
      "### ما الذي تقوله التغطيات المتاحة عن " + topic + "؟",
      "تعرض المسودة روابط المصادر والزوايا التي أمكن رصدها في نصوصها. افتح كل رابط لقراءة التفاصيل الكاملة وتاريخ التحديث.",
      "### هل يعني تكرار كلمة أو زاوية أن المعلومة مؤكدة؟",
      "لا. التشابه اللفظي أو تكرار زاوية التغطية إشارة للمقارنة فقط؛ تأكيد الواقعة يتطلب مصدرًا أصليًا أو تحققًا مستقلًا.",
      "### ما الذي يجب التحقق منه قبل نشر المقال؟",
      "راجع أسماء الأشخاص والجهات والأرقام والتواريخ، وطابقها مع المصدر الأصلي. اذكر أي اختلاف بين التغطيات بدل دمج روايات متباينة."
    ];
    const sections = [
      "## ملخص سريع",
      lead + " " + intentText,
      quick,
      "## ما الأفكار التي تناولها كل ناشر؟",
      sourceOverview + " يلخص هذا القسم وصف كل صفحة على حدة، ثم تقارن الأقسام التالية الزوايا والمفردات التي تكررت أو غابت.",
      sourcesSection,
      datedSources.length ? "## توقيت التغطيات\n\n" + datedSources.join("\n") : "",
      "## نقاط الالتقاء والاختلاف",
      analysis.text + " " + analysis.sharedText,
      "## خريطة الأفكار بحسب عدد المصادر",
      coverageMatrix + "\n\n" + distinctIdeaText,
      "## إضافة تحليلية للقارئ",
      originality + " هذه مقارنة لتوزيع الأفكار في المواد المتاحة، وليست نتيجة تحقق مستقل من الوقائع.",
      "## ما الذي ينبغي التحقق منه؟",
      readerUse + (analysis.missing.length ? " وتحتاج الجوانب التالية إلى مصدر مباشر: " + analysis.missing.join("، ") + "." : ""),
      "## أسئلة شائعة",
      faq.join("\n\n"),
      "## المصادر",
      news.map(function (entry) {
        const assessment = sourceAssessment(entry.url, entry.domain);
        return "- [" + (entry.source || assessment.host) + " — " + entry.title + "](" + entry.url + ")";
      }).join("\n"),
      "## منهجية وحدود المسودة",
      "بحثت الأداة في خلاصات أخبار معروفة، ثم حاولت قراءة صفحات الناشرين عبر HTTPS. حُللت الكلمات وزوايا التغطية المتاحة فقط؛ لا يُحفظ النص الكامل للناشرين، وقد لا تعرض بعض الصفحات نصًا كافيًا بسبب الحماية أو طريقة تحميلها. الفحص الآلي لا يثبت صحة كل ادعاء ولا يضمن ترتيبًا في نتائج البحث. افتح المصادر الأصلية، أضف معلومة أو تحليلًا خاصًا بالموقع، وراجع المقال قبل نشره."
    ];
    if (config.length === "long") {
      sections.splice(sections.length - 3, 0,
        "## قائمة تحقق للمحرر",
        "- هل لكل اسم أو تاريخ أو رقم رابط أصلي يدعمه؟\n- هل تميز المسودة بين ما ظهر في المصدر وما استنتجناه من المقارنة؟\n- هل أضفت سياقًا محليًا أو مثالًا عمليًا لا تكرره التغطيات؟\n- هل حذفت أي معلومة لا يمكن التحقق منها؟");
    }
    return sections.filter(Boolean).join("\n\n");
  }
  function buildArticleDraft(topic, keyword, audience, intent, length, brief) {
    const subject = topic.trim().replace(/[.!؟?]+$/g, "");
    const audienceText = audience || "جمهور عام";
    const notes = String(brief || "").split(/\r?\n|(?<=[.!؟])\s+/).map(function (line) {
      return line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim();
    }).filter(Boolean).slice(0, 20);
    const firstFact = notes[0] || "";
    const intro = "يتناول هذا التحديث موضوع «" + subject + "» للقراء المهتمين بـ" + audienceText + ". نعرض ما توفر من عناوين ومصادر مرتبطة، ونفصل بين مؤشر الاهتمام وبين الوقائع التي تؤكدها المصادر الأصلية." +
      (firstFact ? " وتشمل ملاحظات التحرير: " + firstFact + "." : "");
    let angleHeading = "## ما الذي يحتاج القارئ إلى معرفته عن " + subject + "؟";
    let angleText = "ابدأ بتحديد السؤال العملي الذي يقصده القارئ، ثم اشرح المصطلحات والحدود اللازمة للإجابة عنه. رتّب المعلومة الأساسية أولًا، وأضف بعدها التفاصيل التي تساعد على تطبيقها أو اتخاذ قرار على أساسها.";
    if (intent === "list") {
      angleHeading = "## كيف نختار ترشيحات مناسبة عن " + subject + "؟";
      angleText = "اعرض كل اختيار مع سبب واضح للترشيح، ونوعه، ولمن يناسب، وأي ملاحظة قد تؤثر في قرار المشاهدة. اذكر أسماء الأعمال وبياناتها الفعلية بعد التحقق منها، وميّز الرأي التحريري عن التقييم المنشور لدى جهة أخرى.";
    } else if (intent === "compare") {
      angleHeading = "## مقارنة الخيارات المرتبطة بـ " + subject;
      angleText = "حدّد الخيارات التي تقارنها، ثم طبّق المعايير نفسها على كل واحد: الاستخدام أو النوع، المزايا، القيود، التكلفة أو التوفر إن انطبق. اربط كل معلومة متغيرة بمصدرها، واترك للقارئ اختيار ما يناسب أولوياته.";
    } else if (intent === "explainer") {
      angleHeading = "## شرح " + subject + " خطوة بخطوة";
      angleText = "عرّف الفكرة بجملة مباشرة، ثم اشرح مراحلها بالترتيب مع مثال واقعي من المعلومات التي راجعتها. عرّف أي مصطلح متخصص عند ظهوره للمرة الأولى، وافصل ما هو مؤكد عما يختلف باختلاف الحالة.";
    }
    const sections = [
      intro,
      angleHeading,
      angleText,
      "## ما الذي نعرفه من المعلومات المتاحة؟",
      notes.length ? "تسجل خلاصة Google Trends هذا الموضوع ضمن الاتجاهات المتابعة في السعودية. ويعرض المصدر قيمة تقريبية للاتجاه عند توفرها؛ وهي إشارة إلى الاهتمام وليست إثباتًا لصحة خبر أو نتيجة أو تقييم.\n\nعناوين التغطية التي جُمعت للمراجعة:\n" + notes.map(function (line) { return "- " + line; }).join("\n") : "لم تُرفق تفاصيل أو عناوين مصادر بعد. أضف هنا معلومة أصلية محددة مع رابط المصدر الذي يؤيدها.",
      "## كيف نقرأ هذا الاتجاه؟",
      "ظهور موضوع في قائمة الاتجاهات يصف اهتمامًا آنيًا لدى الباحثين، وقد يتغير سريعًا. لفهم سبب الاهتمام، افتح المصادر المرتبطة واقرأ تفاصيلها وتاريخها، ثم قارن ما تقوله بالمصدر الرسمي أو صاحب الإعلان. لا يكفي عنوان الخبر وحده لتأكيد تفاصيل الحدث.",
      "## ما الذي يفيد القارئ؟",
      "للوصول إلى معلومة دقيقة، حدّد السؤال الذي تريد إجابته عن هذا الموضوع، ثم ارجع إلى الجهة صاحبة المعلومة وتحقق من التاريخ والسياق. عند وجود اختلاف بين التغطيات، اذكر الاختلاف بوضوح ولا تدمج روايات متعارضة في حقيقة واحدة.",
      "## خلاصة",
      "يعرض المقال سبب متابعة الموضوع والمصادر المتاحة له حتى وقت التحديث. راجع روابط المصادر قبل الاعتماد على أي معلومة متغيرة، وتابع الصفحة عند ظهور معلومات مؤكدة جديدة."
    ];
    if (length === "long") sections.push("## أسئلة شائعة", "### هل يعني تصدر الترند أن الخبر مؤكد؟", "لا. الترند مؤشر اهتمام بالبحث، أما تأكيد التفاصيل فيحتاج إلى مصدر أصلي موثوق.", "### كيف أتابع أي تحديث جديد؟", "راجع المصادر المرتبطة وتواريخ تحديثها، وحدّث المقال عند ظهور معلومة مؤكدة مع الإشارة إلى تاريخ المراجعة.");
    return sections.join("\n\n");
  }
  function classifyResearchTopic(topic, sources) {
    const evidence = normalizeSearchText(String(topic || "") + " " + (sources || []).map(function (entry) {
      return String(entry.title || "") + " " + String(entry.description || "");
    }).join(" "));
    if (/رياض|مبار|دوري|كرة|بطول|cricket|football|soccer|basketball|nba|nfl|match|tournament|champions league|asia cup/i.test(evidence)) return "sports";
    if (/فيلم|سينما|مسلسل|دراما|ممثل|برنامج|netflix|shahid|movie|film|series|actor|episode|television/i.test(evidence)) return "entertainment";
    return "general";
  }
  function waitForResearch(ms) {
    return new Promise(function (resolve) { window.setTimeout(resolve, ms); });
  }
  async function requestTopicResearch(topic) {
    const random = Math.random().toString(36).slice(2, 11);
    const requestId = "research-" + Date.now().toString(36) + "-" + random;
    const resultPath = ".github/article-research/" + requestId + ".json";
    await api("/dispatches", {
      method: "POST",
      body: { event_type: "article-research", client_payload: { topic: topic, request_id: requestId } }
    });
    for (let attempt = 0; attempt < 75; attempt += 1) {
      $("#saWriterNotice").textContent = "جارٍ البحث عن تغطيات موثوقة للموضوع (" + (attempt + 1) + "/75)…";
      await waitForResearch(2000);
      try {
        const resultFile = await api("/contents/" + apiPath(resultPath) + "?ref=" + encodeURIComponent(BRANCH));
        const result = JSON.parse(decodeBase64(resultFile.content || ""));
        if (result.requestId !== requestId || !Array.isArray(result.sources)) throw new Error("تعذّرت مطابقة نتيجة البحث.");
        return result;
      } catch (error) {
        if (error && error.status === 404) continue;
        throw error;
      }
    }
    throw new Error("تأخر البحث عن المصادر. حدّث المحاولة بعد قليل.");
  }
  async function requestProductImport(sourceUrl) {
    const random = Math.random().toString(36).slice(2, 11);
    const requestId = "product-" + Date.now().toString(36) + "-" + random;
    const resultPath = ".github/product-imports/" + requestId + ".json";
    await api("/dispatches", {
      method: "POST",
      body: { event_type: "product-import", client_payload: { source_url: sourceUrl, request_id: requestId } }
    });
    for (let attempt = 0; attempt < 75; attempt += 1) {
      $("#saProductImportStatus").textContent = "جارٍ قراءة بيانات صفحة المنتج (" + (attempt + 1) + "/75)…";
      await waitForResearch(2000);
      try {
        const resultFile = await api("/contents/" + apiPath(resultPath) + "?ref=" + encodeURIComponent(BRANCH));
        const result = JSON.parse(decodeBase64(resultFile.content || ""));
        if (result.requestId !== requestId) throw new Error("تعذّرت مطابقة نتيجة الاستيراد.");
        return result;
      } catch (error) {
        if (error && error.status === 404) continue;
        throw error;
      }
    }
    throw new Error("تأخر استيراد المنتج. أعد المحاولة بعد قليل.");
  }
  async function checkArticleLinks() {
    const form = $("#saArticleForm");
    const sourceField = form.elements.sources;
    const urls = Array.from(new Set(sourceField.value.split(/\r?\n/).map(function (value) { return value.trim(); }).filter(Boolean)));
    if (!urls.length) { toast("أضف رابطًا واحدًا على الأقل ثم افحصه."); sourceField.focus(); return; }
    if (urls.length > 12) { toast("افحص حتى 12 رابطًا في المرة الواحدة."); return; }
    if (articleLinkCheckInProgress) { toast("فحص الروابط جارٍ بالفعل."); return; }
    if (!window.confirm("ستُرسل الروابط إلى فاحص الخادم، وتُحفظ نتيجة الفحص في مستودع الموقع العام. لا تضع روابط خاصة أو تتضمن رموز دخول. هل تتابع؟")) return;

    const requestId = "linkcheck-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
    const resultPath = ".github/article-research/" + requestId + ".json";
    const button = $("#saCheckArticleLinks"), panel = $("#saArticleLinkCheckResult");
    articleLinkCheckInProgress = true;
    button.disabled = true;
    panel.hidden = false;
    panel.innerHTML = "<b>فحص الروابط</b><p class=\"hint\">جارٍ فحص " + urls.length + " رابطًا…</p>";
    try {
      await api("/dispatches", {
        method: "POST",
        body: { event_type: "article-link-check", client_payload: { request_id: requestId, topic: $("#saWriterTopic").value.trim(), urls: urls } }
      });
      let result = null;
      for (let attempt = 0; attempt < 45; attempt += 1) {
        panel.innerHTML = "<b>فحص الروابط</b><p class=\"hint\">جارٍ فحص استجابة الناشرين (" + (attempt + 1) + "/45)…</p>";
        await waitForResearch(2000);
        try {
          const file = await api("/contents/" + apiPath(resultPath) + "?ref=" + encodeURIComponent(BRANCH));
          result = JSON.parse(decodeBase64(file.content || ""));
          if (result.requestId !== requestId || result.mode !== "link-check" || !Array.isArray(result.links)) throw new Error("نتيجة فحص الروابط غير مطابقة.");
          break;
        } catch (error) {
          if (error && error.status === 404) continue;
          throw error;
        }
      }
      if (!result) throw new Error("انتهت مهلة انتظار فحص الروابط.");
      activeLinkCheckResults = result.links.map(function (item) {
        return {
          url: item.inputUrl || "",
          finalUrl: item.finalUrl || "",
          title: item.pageTitle || "",
          source: item.domain || "",
          domain: item.domain || "",
          description: item.description || "",
          reachable: item.reachable === true,
          httpStatus: item.httpStatus,
          checkedAt: item.checkedAt || result.updatedAt || "",
          publisherTier: item.publisherTier || "unlisted",
          articleRead: item.articleRead === true,
          articleWordCount: Number(item.articleWordCount) || 0,
          analysisTerms: Array.isArray(item.analysisTerms) ? item.analysisTerms : [],
          coverageDimensions: Array.isArray(item.coverageDimensions) ? item.coverageDimensions : [],
          articleTextMethod: item.articleTextMethod || "",
          reason: item.reason || ""
        };
      });
      activeLinkCheckReport = { topic: $("#saWriterTopic").value.trim(), updatedAt: result.updatedAt || new Date().toISOString() };
      const accessible = result.links.filter(function (item) { return item.reachable === true; }).length;
      panel.innerHTML = "<b>نتيجة الفحص: " + accessible + " من " + result.links.length + " روابط استجابت</b>" +
        result.links.map(function (item) {
          const url = item.finalUrl || item.inputUrl || "";
          const assessment = sourceAssessment(url, item.domain);
          const ok = item.reachable === true && assessment.trusted;
          const headline = item.pageTitle || item.domain || item.inputUrl || "رابط";
          const status = ok ? "متاح عبر HTTPS · " + (item.httpStatus || "استجابة ناجحة") : item.reason || "لم يتم التحقق";
          const finalLink = item.finalUrl && assessment.valid
            ? '<a href="' + escapeHtml(item.finalUrl) + '" target="_blank" rel="noopener noreferrer">فتح الرابط النهائي ↗</a>'
            : "";
          const description = item.description ? "<p>" + escapeHtml(item.description) + "</p>" : "";
          const analysis = item.articleRead
            ? "<p class=\"hint\">نص مستخرج: نحو " + item.articleWordCount + " كلمة" + (item.articleTextMethod ? " عبر " + escapeHtml(item.articleTextMethod) : "") + " · الزوايا: " + escapeHtml((item.coverageDimensions || []).join("، ") || "غير محددة") + " · مفردات: " + escapeHtml((item.analysisTerms || []).slice(0, 6).join("، ") || "غير كافية") + "</p>"
            : "<p class=\"hint\">لم يُستخرج نص كافٍ من صفحة الناشر.</p>";
          return '<div class="sa-source-review-row"><span>' + escapeHtml(headline) + '</span><b>' + (ok ? "✓ " : "• ") + escapeHtml(status) +
            (item.checkedAt ? " · " + escapeHtml(item.checkedAt) : "") + "</b>" + description + analysis +
            '<small>' + escapeHtml(item.inputUrl || "") + (item.finalUrl && item.finalUrl !== item.inputUrl ? " → " + escapeHtml(item.finalUrl) : "") + "</small>" + finalLink + "</div>";
        }).join("");
      articleAudit(form);
      toast("اكتمل فحص الروابط. راجع حالة كل رابط وافتح الأصل قبل اعتماد المعلومات.");
    } catch (error) {
      panel.innerHTML = "<b>تعذر فحص الروابط</b><p class=\"hint\">" + escapeHtml(friendlyGitHubError(error) || error.message || "حدث خطأ أثناء الفحص.") + "</p>";
      toast("تعذر فحص الروابط. تحقق من صلاحية GitHub ثم أعد المحاولة.");
    } finally {
      articleLinkCheckInProgress = false;
      button.disabled = false;
    }
  }
  async function generateArticleDraft(options) {
    const form = $("#saArticleForm"), topic = $("#saWriterTopic").value.trim();
    if (!topic) { toast("اكتب موضوع المقال أولًا."); $("#saWriterTopic").focus(); return; }
    if (articleResearchInProgress) { toast("البحث عن المصادر جارٍ بالفعل."); return; }
    if (form.elements.body.value.trim() && !window.confirm("ستُستبدل مسودة المقال الحالية. هل تريد المتابعة؟")) return;
    if (!window.confirm("سيُرسل الموضوع إلى بحث الأخبار، وستُحفظ العناوين والروابط وبيانات التحليل الموجزة في المستودع العام للموقع. لا يُحفظ النص الكامل للناشرين. لا تستخدم موضوعًا سريًا. هل تتابع؟")) return;

    articleResearchInProgress = true;
    activeResearchSources = [];
    activeTrendFactReport = null;
    activeLinkCheckResults = [];
    activeLinkCheckReport = null;
    const button = $("#saGenerateArticle");
    button.disabled = true;
    $("#saWriterNotice").textContent = "جارٍ البحث في المصادر المعروفة وقراءة الصفحات المتاحة…";
    try {
      const result = await requestTopicResearch(topic);
      activeResearchSources = Array.isArray(result.sources) ? result.sources : [];
      const trend = {
        title: topic,
        category: classifyResearchTopic(topic, activeResearchSources),
        traffic: "",
        publishedAt: "",
        updatedAt: result.updatedAt || new Date().toISOString(),
        news: activeResearchSources
      };
      const trustedSources = selectTrendSources(trend).slice(0, 12);
      const sources = trustedSources.length ? trustedSources : selectTrendSources(trend, true).slice(0, 12);
      const hasTrustedSource = sources.some(function (entry) { return sourceAssessment(entry.url, entry.domain).trusted; });
      if (!sources.length) {
        activeTrendFactReport = null;
        $("#saWriterSourcesPreview").hidden = false;
        $("#saWriterSourcesPreview").innerHTML = '<p class="hint">اكتمل البحث لكن لم تُرجع خدمة المصادر روابط صالحة أو موثوقة لهذا الموضوع.</p>';
        $("#saWriterNotice").textContent = "لم أكتب مسودة بلا مصادر. جرّب موضوعًا أدق أو أضف مصادر موثوقة يدويًا.";
        toast("لم تُعثر على مصادر صالحة؛ لم تُنشأ مسودة.");
        return;
      }
      const sourcePreview = $("#saWriterSourcesPreview");
      sourcePreview.hidden = false;
      sourcePreview.innerHTML = '<b>المصادر التي بُنيت عليها المسودة</b>' + sources.map(function (entry) {
        const assessment = sourceAssessment(entry.url, entry.domain);
        return '<div class="sa-source-review-row"><span><b>' + escapeHtml(entry.title || entry.source || assessment.host) + '</b><small>' + escapeHtml(assessment.publisher || assessment.host || "") + ' · ' + (entry.articleRead === true ? 'قُرئت الصفحة (' + (Number(entry.articleWordCount) || 0) + ' كلمة)' : 'لم يُستخرج نص كافٍ من الصفحة') + '</small></span><a href="' + escapeHtml(safeDashboardUrl(entry.url)) + '" target="_blank" rel="noopener noreferrer">فتح المصدر ↗</a></div>';
      }).join("");
      const readablePages = sources.filter(function (entry) { return entry.articleRead === true; }).length;
      const keywordField = $("#saWriterKeyword"), keyword = keywordField.value.trim() || topic;
      keywordField.value = keyword;
      const title = (topic + ": ما الذي تقوله المصادر؟ قراءة وتحليل").slice(0, 100);
      const description = ("قراءة مقارنة عن " + topic + " من مصادر موثوقة، مع توضيح زوايا التغطية وما يحتاج إلى تحقق.").slice(0, 160);
      const slug = transliterateSlug(keyword || topic) || ("article-" + Date.now());
      activeTrendFactReport = null;
      activeLinkCheckReport = null;
      form.elements.title.value = title;
      form.elements.slug.value = slug;
      form.elements.description.value = description;
      form.elements.sources.value = sources.map(function (entry) { return entry.url; }).join("\n");
      $("#saWriterBrief").value = "الموضوع: " + topic + "\nناشرون معروفون مختلفون: " + sources.length +
        "\nصفحات استُخرج منها نص كافٍ: " + readablePages +
        "\nالمسودة تعرض ما رصده الفحص الآلي من زوايا ومفردات؛ أضف معلومة أصلية أو تحليلًا خاصًا بالموقع، وراجع كل حقيقة من رابطها.";
      form.elements.body.value = buildTrendArticleDraft(trend, {
        tone: $("#saWriterTone").value,
        audience: $("#saWriterAudience").value,
        intent: $("#saWriterIntent").value,
        length: $("#saWriterLength").value,
        allowUntrusted: !hasTrustedSource
      });
      const topicNormalized = normalizeSearchText(topic);
      const category = trend.category === "sports" ? "رياضة" :
        /فيلم|سينما/.test(topicNormalized) ? "سينما" :
        trend.category === "entertainment" ? "مسلسلات" :
        /تطبيق|اشتراك|موقع/.test(topicNormalized) ? "التطبيق" : "عام";
      form.elements.category.value = category;
      const researchNote = !hasTrustedSource
        ? "تنبيه: المصادر التي عُثر عليها خارج قائمة الناشرين المعتمدين؛ راجعها يدويًا وأضف مصدرًا موثوقًا قبل النشر."
        : sources.length < 2
          ? "تنبيه: ظهر مصدر موثوق واحد فقط؛ هذه مسودة أولية للمراجعة وليست مقارنة ولا تُنشر قبل إضافة مصدر مستقل آخر."
          : readablePages >= 2
            ? "استُخرج نص كافٍ من " + readablePages + " صفحات؛ الفحص يرصد الزوايا والمفردات ولا يؤكد صحة الوقائع."
            : "تنبيه: استُخرج نص كافٍ من " + readablePages + " صفحات فقط؛ راجع كل حقيقة وأضف مصدرًا مستقلًا أمكن قراءة نصه قبل النشر.";
      $("#saWriterNotice").textContent = "أُعدت مسودة أولية عن «" + topic + "» من " + sources.length + " ناشرين معروفين. " + researchNote;
      updateSearchPreview(form);
      articleAudit(form);
      form.elements.body.scrollIntoView({ behavior: "smooth", block: "center" });
      toast(hasTrustedSource && sources.length >= 2 && readablePages >= 2 ? "اكتملت المسودة الأولية. راجع النص والحقائق قبل النشر." : "ظهرت المسودة والمصادر؛ استكمل التحقق قبل النشر.");
    } catch (error) {
      activeResearchSources = [];
      activeTrendFactReport = null;
      $("#saWriterSourcesPreview").hidden = true;
      $("#saWriterSourcesPreview").replaceChildren();
      $("#saWriterNotice").textContent = friendlyGitHubError(error) || error.message || "تعذّر البحث في المصادر.";
      toast("تعذّر تنفيذ البحث المباشر؛ لم نستخدم لقطة قديمة بدل المصادر.");
    } finally {
      articleResearchInProgress = false;
      button.disabled = false;
    }
  }
  function articleAudit(form) {
    const value = function (name) { return String(new FormData(form).get(name) || "").trim(); };
    const title = value("title"), description = value("description"), body = value("body"), slug = value("slug");
    const keyword = $("#saWriterKeyword").value.trim(), topic = $("#saWriterTopic").value.trim();
    const normalizedKeyword = normalizeSearchText(keyword), normalizedTopic = normalizeSearchText(topic);
    const normalizedTitle = normalizeSearchText(title), normalizedBody = normalizeSearchText(body);
    const words = body.split(/\s+/).filter(Boolean).length;
    const headings = (body.match(/^##\s+.+$/gm) || []).length;
    const paragraphs = body.split(/\n\s*\n/).map(function (part) { return part.trim(); }).filter(function (part) { return part && part.indexOf("## ") !== 0 && part.indexOf("### ") !== 0; });
    const repeatedBlocks = paragraphs.length - new Set(paragraphs.map(normalizeSearchText)).size;
    const occurrences = countPhrase(normalizedBody, normalizedKeyword);
    const sources = value("sources").split(/\r?\n/).map(function (url) { return url.trim(); }).filter(Boolean);
    const validSources = sources.length > 0 && sources.every(function (url) { return sourceAssessment(url).valid; });
    const sourceReview = reviewSourceSet(sources, topic);
    const usesTrendSources = sourceReview.rows.some(function (row) { return Boolean(row.entry); });
    const currentFactReport = activeTrendFactReport && normalizeSearchText(activeTrendFactReport.topic) === normalizedTopic ? activeTrendFactReport : null;
    const currentLinkCheck = activeLinkCheckReport && (!normalizedTopic || normalizeSearchText(activeLinkCheckReport.topic) === normalizedTopic) ? activeLinkCheckReport : null;
    const researchTimestamp = currentLinkCheck && currentLinkCheck.updatedAt || currentFactReport && currentFactReport.updatedAt || trendUpdatedAt;
    const trendSnapshotTime = researchTimestamp ? new Date(researchTimestamp).getTime() : 0;
    const trendSnapshotFresh = !usesTrendSources || (trendSnapshotTime > 0 && Date.now() - trendSnapshotTime <= 48 * 60 * 60 * 1000);
    const needsFreshSources = /اليوم|غد|مباراة|مباريات|تقييم|القنوات|القناة|موعد|السعر|يعرض|عرض|رمضان\s*2027|2026|2027/i.test(body);
    const hasDraftInstructions = /لا تتضمن المدخلات الحالية|أضف هنا المعلومات الفعلية|أجب هنا عن السؤال الأساسي/i.test(body);
    const firstBodyParagraph = body.split(/\n\s*\n/).map(function (part) { return part.trim(); }).find(function (part) { return part && part.indexOf("## ") !== 0 && part.indexOf("### ") !== 0; }) || "";
    const earlyContent = normalizeSearchText(firstBodyParagraph);
    const hasTopicUpFront = Boolean(normalizedTopic) && earlyContent.includes(normalizedTopic.slice(0, Math.min(normalizedTopic.length, 20)));
    const checks = [
      ["عنوان الصفحة", Boolean(title) && normalizedTitle.includes(normalizedTopic.slice(0, Math.min(normalizedTopic.length, 16))), title ? title.length + " حرفًا. تأكد أن العنوان يصف ما يقدمه المقال فعلًا." : "اكتب عنوانًا واضحًا يطابق المحتوى."],
      ["وصف موجز دقيق", description.length >= 40, description.length + " حرفًا. لخص الصفحة للقارئ؛ لا يوجد طول ثابت يضمن مقتطفًا أو ترتيبًا."],
      ["الإجابة مرتبطة بالموضوع", Boolean(normalizedTopic) && normalizedBody.includes(normalizedTopic.slice(0, Math.min(normalizedTopic.length, 20))), topic ? "تحقق أن النص يجيب عن موضوع المقال مباشرة." : "حدد موضوع المقال أولًا."],
      ["مقدمة مباشرة", hasTopicUpFront, "اجعل أول فقرة تجيب عن السؤال وتوضح نطاق المقال."],
      ["تفاصيل خاصة بالموضوع", !hasDraftInstructions && (Boolean($("#saWriterBrief").value.trim()) || words > 180), hasDraftInstructions ? "ما زالت هناك تعليمات تحريرية داخل النص؛ استبدلها بمعلومات وأمثلة حقيقية." : "أضف أمثلة أو أسماء أو خطوات دقيقة تخص هذا الموضوع، لا وصفًا عامًا فقط."],
      ["تنظيم يسهل القراءة", headings >= 1 && paragraphs.length >= 3, headings + " عنوانًا فرعيًا و" + paragraphs.length + " فقرات؛ اجعل لكل عنوان فكرة واضحة."],
      ["تكرار النص", repeatedBlocks === 0 && !(occurrences > 12 && normalizedKeyword.length < 18), repeatedBlocks ? "عُثر على فقرات مكررة؛ احذف النسخ الزائدة." : (occurrences > 12 && normalizedKeyword.length < 18 ? "تكررت عبارة البحث كثيرًا؛ أعد القراءة واجعلها طبيعية." : "لا يظهر تكرار آلي واضح؛ راجع القراءة بصوت عالٍ.")],
      ["رابط مختصر سليم", /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), "استخدم أحرفًا صغيرة وكلمات مفصولة بشرطة، وتأكد أنه غير مستخدم."],
      ["مصادر HTTPS", validSources, sources.length ? sources.length + " رابطًا آمنًا؛ يلزم فتح صفحات المصدر وقراءة النص الأصلي." : (needsFreshSources ? "المقال يتناول معلومات متغيرة؛ أضف روابط رسمية أو مصادر أصلية." : "أضف مصدرًا عند إيراد حقائق قابلة للتحقق.")],
      ["مصدران مستقلان معروفان", sourceReview.trustedDomains >= 2, sourceReview.trustedDomains + " نطاقًا مختلفًا من قائمة الناشرين والجهات المعروفة؛ تصنيف النطاق لا يثبت صحة المعلومة."],
      ["حداثة البحث عن المصادر", trendSnapshotFresh, usesTrendSources ? (trendSnapshotFresh ? "جُمعت المصادر خلال آخر 48 ساعة." : "مرّ أكثر من 48 ساعة على جمع المصادر؛ أعد البحث قبل النشر.") : "لا يعتمد المقال على لقطة الترند."],
      ["توفر ملخصات المصدر", sourceReview.summaryCount >= 2, sourceReview.summaryCount + " ملخصًا آليًا متاحًا؛ إذا نقص الملخص فلا تستنتج الخبر من العنوان."],
      ["قراءة نص صفحات الناشرين", sourceReview.rows.filter(function (row) { return row.entry && row.entry.articleRead === true; }).length >= 2, sourceReview.rows.filter(function (row) { return row.entry && row.entry.articleRead === true; }).length + " صفحات أمكن استخراج نص كافٍ منها؛ لا يُحفظ النص الكامل."],
      ["فحص الوصول للمصادر", sourceReview.checkedCount > 0 && sourceReview.reachableCount >= Math.min(2, sourceReview.checkedCount), sourceReview.checkedCount ? sourceReview.reachableCount + " من " + sourceReview.checkedCount + " صفحات فُتحت في آخر تحديث للبيانات." : "لا يوجد فحص آلي لاتصال هذه الروابط؛ افتح كل صفحة بنفسك."],
      ["ارتباط التغطيات بالموضوع", sourceReview.matchedCount > 0, sourceReview.matchedCount ? "وجدت الأداة عنوانًا أو ملخصًا مرتبطًا بموضوع المقال." : "لا تتوفر بيانات مصدرية كافية لمطابقة الروابط مع الموضوع."],
      ["مراجعة الحقائق", $("#saFactCheck").checked, $("#saFactCheck").checked ? "أكدت مراجعة الأسماء والأرقام والتواريخ والمصادر." : "افحص كل معلومة واقعية قبل النشر."],
      ["فائدة أصلية", $("#saOriginalCheck").checked, $("#saOriginalCheck").checked ? "أكدت إضافة تحليل أو خبرة أو فائدة خاصة." : "أضف رأيًا تحريريًا أو مقارنة أو تجربة تخص الموقع."],
      ["بديل الصورة", !value("image") || Boolean(value("imageAlt")), value("image") && !value("imageAlt") ? "أضف وصفًا نصيًا يشرح الصورة." : "أضف صورة فقط إذا كانت تخدم موضوع المقال."]
    ];
    const factReport = activeTrendFactReport && normalizeSearchText(activeTrendFactReport.topic) === normalizedTopic ? activeTrendFactReport : null;
    if (factReport) factReport.checks.forEach(function (check) {
      checks.push(["فحص آلي: " + check.title, check.ok, check.detail]);
    });
    const passed = checks.filter(function (check) { return check[1]; }).length;
    const generatedFactHtml = factReport
      ? '<section class="sa-source-review-list"><b>نتيجة الفحص الأولي للمقال والمصادر</b>' +
        factReport.checks.map(function (check) { return '<div class="sa-source-review-row"><span>' + escapeHtml(check.title) + '</span><b>' + (check.ok ? "✓ " : "• ") + escapeHtml(check.detail) + '</b></div>'; }).join("") +
        '<p class="hint">اعتمد الفحص على نصوص مستخرجة جزئيًا من الصفحات المتاحة وعناوينها وملخصاتها. لا يُحفظ النص الكامل، ولا يثبت الفحص صحة كل ادعاء؛ افتح المصادر وراجعها يدويًا.</p></section>'
      : "";
    $("#saSeoReport").innerHTML = '<div class="sa-audit-score">' + passed + ' من ' + checks.length + ' مراجعات مستوفاة · ' + words + ' كلمة للاستئناس فقط</div>' +
      checks.map(function (check) { return '<div class="sa-audit-row ' + (check[1] ? "good" : "needs-work") + '"><b>' + (check[1] ? "✓ " : "• ") + escapeHtml(check[0]) + '</b><span>' + escapeHtml(check[2]) + '</span></div>'; }).join("") +
      generatedFactHtml +
      '<div class="sa-source-review-list"><b>تفاصيل المصادر</b>' + sourceReview.rows.map(function (row) { return '<div class="sa-source-review-row"><span>' + escapeHtml(row.assessment.host || row.url) + '</span><b>' + escapeHtml(row.assessment.label) + (row.reachable === true ? " · متاح" : row.reachable === false ? " · لا يستجيب" : " · لم يُفحص آليًا") + '</b></div>'; }).join("") + '</div>' +
      '<p class="hint">المراجعة الآلية تفحص بنية المقال، ونطاقات الناشرين، والملخصات، وإشارات الاختلاف الرقمية؛ لا تثبت صحة كل ادعاء ولا تضمن ترتيبًا في البحث. افتح المصادر الأصلية وراجع الوقائع قبل النشر.</p>';
    $("#saSeoReport").hidden = false;
    updateSearchPreview(form);
    return { checks: checks, sourceReview: sourceReview, words: words, factReport: factReport };
  }
  $("#saGenerateArticle").addEventListener("click", generateArticleDraft);
  $("#saCheckArticleLinks").addEventListener("click", checkArticleLinks);
  $("#saRefreshTrends").addEventListener("click", function () { loadTrendSnapshot(true); });
  $("#saTrendList").addEventListener("click", function (event) {
    const button = event.target.closest("[data-trend-index]");
    if (!button) return;
    const item = trendItems[Number(button.dataset.trendIndex)];
    if (item) useTrendItem(item);
  });
  loadTrendSnapshot(false);
  $("#saWriterTopic").addEventListener("input", renderKeywordIdeas);
  $("#saSuggestKeywords").addEventListener("click", renderKeywordIdeas);
  $("#saKeywordIdeas").addEventListener("click", function (event) {
    const button = event.target.closest("[data-keyword]");
    if (!button) return;
    $("#saWriterKeyword").value = button.dataset.keyword;
    toast("تم اختيار العبارة. جهّز المسودة لتحديث العنوان والوصف.");
  });
  $("#saCopySnippet").addEventListener("click", async function () {
    const form = $("#saArticleForm"), text = metaField(form, "title") + "\n" + metaField(form, "description");
    try { await navigator.clipboard.writeText(text); toast("نُسخ العنوان والوصف."); }
    catch (_) { toast("تعذّر النسخ؛ حدّد النص وانسخه يدويًا."); }
  });
  $("#saSeoAudit").addEventListener("click", function () { articleAudit($("#saArticleForm")); });
  $("#saArticleForm").addEventListener("input", function (event) {
    if (["title", "slug", "description"].includes(event.target.name)) updateSearchPreview(event.currentTarget);
    if (!$("#saSeoReport").hidden) articleAudit(event.currentTarget);
  });
  $("#saArticleForm").addEventListener("change", function (event) {
    if (event.target.type === "checkbox" && !$("#saSeoReport").hidden) articleAudit(event.currentTarget);
  });
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
  async function publishPendingPaths(requestedPaths) {
    if (publishInProgress) {
      (requestedPaths || []).forEach(function (path) { autoPublishPaths.add(path); });
      return false;
    }
    const allPaths = Array.from(new Set(Object.keys(pending).concat(Object.keys(binaryPending), Object.keys(pendingDeletes)))).sort();
    const paths = requestedPaths ? Array.from(new Set(requestedPaths)).filter(function (path) { return allPaths.includes(path); }).sort() : allPaths;
    if (!paths.length) return false;
    const publishedSnapshot = { text: Object.create(null), binary: Object.create(null), deletes: [] };
    paths.forEach(function (path) {
      if (pendingDeletes[path]) publishedSnapshot.deletes.push(path);
      else if (Object.prototype.hasOwnProperty.call(binaryPending, path)) publishedSnapshot.binary[path] = binaryPending[path];
      else publishedSnapshot.text[path] = pending[path];
    });
    publishInProgress = true;
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
        if (expected !== latest && !pendingDeletes[path]) throw new Error("تغيّر الملف " + path + " على GitHub منذ تحميله. حدّث الملف ثم أعد الحفظ.");
      }
      const treeEntries = [];
      for (const path of paths) {
        if (pendingDeletes[path]) treeEntries.push({ path: path, mode: "100644", type: "blob", sha: null });
        else if (Object.prototype.hasOwnProperty.call(binaryPending, path)) {
          const blob = await api("/git/blobs", { method: "POST", body: { content: binaryPending[path], encoding: "base64" } });
          treeEntries.push({ path: path, mode: "100644", type: "blob", sha: blob.sha });
        } else treeEntries.push({ path: path, mode: "100644", type: "blob", content: pending[path] });
      }
      const newTree = await api("/git/trees", { method: "POST", body: { base_tree: baseTree, tree: treeEntries } });
      const commit = await api("/git/commits", { method: "POST", body: {
        message: ($("#saCommitMessage").value || "تحديث موقع DIAMOND TV").trim(),
        tree: newTree.sha,
        parents: [baseCommit]
      } });
      await api("/git/refs/heads/" + BRANCH, { method: "PATCH", body: { sha: commit.sha, force: false } });
      paths.forEach(function (path) { delete pending[path]; delete binaryPending[path]; delete pendingDeletes[path]; delete original[path]; });
      renderPending();
      setStatus("حُفظت التغييرات · جارٍ تحديث الموقع…", true);
      toast("حُفظ التحديث؛ نتحقق الآن من ظهوره على الموقع.");
      try { await loadTree(); } catch (_) { /* A saved commit remains valid if the list refresh fails. */ }
      if (paths.includes(selectedPath)) {
        $("#saEditor").value = "";
        $("#saEditorMeta").textContent = "";
        $("#saEditorTitle").textContent = "اختر ملفًا للتحرير";
        selectedPath = "";
      }
      const appeared = await waitForPublicFiles(publishedSnapshot);
      if (appeared) {
        setStatus("ظهرت التغييرات على الموقع", true);
        toast("تم التحقق: الملفات المحفوظة ظاهرة على الموقع.");
      } else {
        setStatus("حُفظت · النشر ما زال جاريًا", true);
        $("#saPublishError").textContent = "حُفظ التحديث في GitHub وما زال GitHub Pages ينشره. سيظهر على الموقع بعد اكتمال النشر.";
      }
      return true;
    } catch (error) {
      $("#saPublishError").textContent = friendlyGitHubError(error);
      setStatus("تعذّر الحفظ؛ بقيت تعديلاتك محفوظة هنا", false);
      return false;
    } finally {
      publishInProgress = false;
      renderPending();
      if (autoPublishPaths.size) queueAutoPublish(Array.from(autoPublishPaths));
    }
  }
  $("#saPublish").addEventListener("click", function () { publishPendingPaths(); });
  window.addEventListener("beforeunload", function () {
    token = "";
  });
  switchMainPanel(sitePanel.id);
  switchView("dashboard");
})();



