(function () {
  "use strict";
  var host = document.getElementById("store-grid");
  if (!host) return;
  var products = [], activeCategory = "all", savedOnly = false, searchText = "", sortMode = "recommended";
  var saved = new Set();
  var dialog = document.getElementById("store-dialog");
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(value) {
    try {
      var url = new URL(value, location.origin);
      return url.protocol === "https:" || url.origin === location.origin ? url.href : "";
    } catch (_) { return ""; }
  }
  function idOf(item, index) { return String(item.id || (item.title || "product") + "-" + index); }
  function readSaved() {
    try { saved = new Set(JSON.parse(localStorage.getItem("diamond-store-saved") || "[]").map(String)); }
    catch (_) { saved = new Set(); }
  }
  function persistSaved() {
    try { localStorage.setItem("diamond-store-saved", JSON.stringify(Array.from(saved))); } catch (_) {}
    updateSavedButton();
  }
  function updateSavedButton() {
    document.getElementById("store-favorite-count").textContent = String(saved.size);
    var toggle = document.getElementById("store-favorites-toggle");
    toggle.setAttribute("aria-pressed", savedOnly ? "true" : "false");
    toggle.classList.toggle("active", savedOnly);
  }
  function renderCategories() {
    var box = document.getElementById("store-categories");
    var categories = Array.from(new Set(products.map(function (p) { return String(p.category || "منتج").trim(); }).filter(Boolean)));
    if (activeCategory !== "all" && !categories.includes(activeCategory)) activeCategory = "all";
    box.innerHTML = '<button type="button" class="store-chip ' + (activeCategory === "all" ? "active" : "") + '" data-category="all" aria-pressed="' + (activeCategory === "all") + '">الكل</button>' +
      categories.map(function (category) {
        return '<button type="button" class="store-chip ' + (activeCategory === category ? "active" : "") + '" data-category="' + esc(category) + '" aria-pressed="' + (activeCategory === category) + '">' + esc(category) + '</button>';
      }).join("");
  }
  function priceNumber(value) {
    var normalized = String(value || "").replace(/[٠-٩]/g, function (digit) { return String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)); }).replace(/٫/g, ".").replace(/٬/g, "").replace(/,(\d{1,2})$/, ".$1").replace(/,/g, "");
    if (/\d\s*[-–]\s*\d/.test(normalized)) return null;
    var match = normalized.match(/[0-9]+(?:\.[0-9]+)?/);
    return match ? Number(match[0]) : null;
  }
  function updateProductSchema() {
    var old = document.getElementById("store-item-list-schema");
    if (old) old.remove();
    var currencyMap = { "ر.س": "SAR", "ريال سعودي": "SAR", "SAR": "SAR", "ر.إ": "AED", "د.إ": "AED", "AED": "AED", "د.ك": "KWD", "KWD": "KWD", "ر.ع": "OMR", "OMR": "OMR", "د.ب": "BHD", "BHD": "BHD", "ر.ق": "QAR", "QAR": "QAR", "ج.م": "EGP", "EGP": "EGP", "USD": "USD", "$": "USD", "EUR": "EUR", "GBP": "GBP" };
    var list = products.map(function (item, index) {
      var product = { "@type": "Product", name: String(item.title || "").trim(), description: String(item.description || "").trim(), category: String(item.category || "").trim() };
      var image = safeUrl(item.image);
      if (image) product.image = [image];
      var price = priceNumber(item.price), currency = currencyMap[String(item.currency || "").trim()];
      if (price !== null && Number.isFinite(price) && currency) {
        var availability = item.availability === "unavailable" ? "https://schema.org/OutOfStock" : item.availability === "preorder" ? "https://schema.org/PreOrder" : "https://schema.org/InStock";
        product.offers = { "@type": "Offer", priceCurrency: currency, price: String(price), availability: availability, url: safeUrl(item.url) || "https://diamond-tv.shop/store/" };
      }
      return { "@type": "ListItem", position: index + 1, item: product };
    }).filter(function (entry) { return entry.item.name; });
    var schema = document.createElement("script");
    schema.id = "store-item-list-schema";
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "منتجات متجر DIAMOND TV", itemListElement: list });
    document.head.appendChild(schema);
  }
  function matches(item, index) {
    if (activeCategory !== "all" && String(item.category || "منتج").trim() !== activeCategory) return false;
    if (savedOnly && !saved.has(idOf(item, index))) return false;
    var query = searchText.toLowerCase();
    return !query || [item.title, item.description, item.category].concat(item.highlights || []).some(function (value) { return String(value || "").toLowerCase().includes(query); });
  }
  function productCard(item, index) {
    var id = idOf(item, index), image = safeUrl(item.image), link = safeUrl(item.url), isSaved = saved.has(id);
    var imageHtml = image ? '<img class="store-image" src="' + esc(image) + '" alt="' + esc(item.imageAlt || item.title) + '" loading="lazy">' : '<div class="store-image store-placeholder" aria-hidden="true"><span>✦</span><b>DIAMOND</b></div>';
    var description = String(item.description || "");
    var state = item.availability === "preorder" ? "طلب مسبق" : item.availability === "unavailable" ? "غير متاح مؤقتًا" : "متوفر";
    var unavailable = item.availability === "unavailable";
    return '<article class="store-card" data-product-card="' + esc(id) + '">' + imageHtml +
      (item.featured ? '<span class="store-featured">اختيار المتجر</span>' : '') +
      '<button type="button" class="store-save ' + (isSaved ? "saved" : "") + '" data-save-product="' + esc(id) + '" aria-pressed="' + isSaved + '" aria-label="' + (isSaved ? "إزالة من المحفوظات" : "حفظ المنتج") + '">' + (isSaved ? "♥" : "♡") + '</button>' +
      '<div class="store-card-body"><span class="store-category">' + esc(item.category || "منتج") + '</span>' +
      '<h3>' + esc(item.title || "منتج") + '</h3><p class="store-card-description">' + esc(description) + '</p>' +
      '<span class="store-availability ' + (unavailable ? "is-unavailable" : "") + '">' + esc(state) + '</span>' +
      (item.price ? '<p class="store-price">' + esc(item.price) + (item.currency ? ' <small>' + esc(item.currency) + '</small>' : '') + (item.oldPrice ? ' <del>' + esc(item.oldPrice) + (item.currency ? ' ' + esc(item.currency) : '') + '</del>' : '') + '</p>' : '<p class="store-price store-price-unlisted">تواصل لمعرفة السعر</p>') +
      '<div class="store-card-actions"><button type="button" class="store-details" data-open-product="' + esc(id) + '">التفاصيل</button>' +
      (link && !unavailable ? '<a class="store-order" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + (item.availability === "preorder" ? "طلب مسبق" : "اطلب الآن") + ' <span aria-hidden="true">←</span></a>' : '<span class="store-order disabled">' + (unavailable ? "غير متاح حاليًا" : "الطلب غير متاح") + '</span>') +
      '</div></div></article>';
  }
  function render() {
    renderCategories();
    var filtered = products.map(function (item, index) { return { item: item, index: index }; }).filter(function (entry) { return matches(entry.item, entry.index); });
    if (sortMode === "price-low" || sortMode === "price-high") {
      filtered.sort(function (a, b) {
        var ap = priceNumber(a.item.price), bp = priceNumber(b.item.price);
        if (ap === null) return 1;
        if (bp === null) return -1;
        return sortMode === "price-low" ? ap - bp : bp - ap;
      });
    } else if (sortMode === "name") filtered.sort(function (a, b) { return String(a.item.title || "").localeCompare(String(b.item.title || ""), "ar"); });
    host.innerHTML = filtered.length ? filtered.map(function (entry) { return productCard(entry.item, entry.index); }).join("") :
      '<div class="store-empty"><b>' + (savedOnly ? "لا توجد منتجات محفوظة" : "لا توجد منتجات مطابقة") + '</b><p>' + (products.length ? "جرّب تغيير كلمة البحث أو القسم المختار." : "ستظهر المنتجات التي يضيفها فريق المتجر هنا.") + '</p></div>';
    document.getElementById("store-count").textContent = products.length + " منتج";
    document.getElementById("store-visible-count").textContent = "عرض " + filtered.length + " من " + products.length;
    updateSavedButton();
    updateProductSchema();
  }
  function openProduct(id) {
    var index = products.findIndex(function (item, i) { return idOf(item, i) === id; });
    var item = products[index];
    if (!item) return;
    var image = safeUrl(item.image), link = safeUrl(item.url);
    document.getElementById("store-dialog-content").innerHTML =
      (image ? '<img class="store-dialog-image" src="' + esc(image) + '" alt="' + esc(item.imageAlt || item.title) + '">' : "") +
      '<span class="store-category">' + esc(item.category || "منتج") + '</span><h2 id="store-dialog-title">' + esc(item.title || "تفاصيل المنتج") + '</h2>' +
      '<p class="store-dialog-description">' + esc(item.description || "لا توجد تفاصيل إضافية.") + '</p>' +
      (Array.isArray(item.highlights) && item.highlights.length ? '<ul class="store-highlights">' + item.highlights.map(function (line) { return '<li>' + esc(line) + '</li>'; }).join("") + '</ul>' : "") +
      '<span class="store-availability ' + (item.availability === "unavailable" ? "is-unavailable" : "") + '">' + esc(item.availability === "preorder" ? "طلب مسبق" : item.availability === "unavailable" ? "غير متاح مؤقتًا" : "متوفر") + '</span>' +
      (item.price ? '<p class="store-price">' + esc(item.price) + (item.currency ? ' <small>' + esc(item.currency) + '</small>' : '') + (item.oldPrice ? ' <del>' + esc(item.oldPrice) + (item.currency ? ' ' + esc(item.currency) : '') + '</del>' : '') + '</p>' : '<p class="store-price store-price-unlisted">تواصل لمعرفة السعر</p>') +
      (link && item.availability !== "unavailable" ? '<a class="store-order" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + (item.availability === "preorder" ? "طلب مسبق" : "تفاصيل الطلب") + ' <span aria-hidden="true">←</span></a>' : '<span class="store-order disabled">' + (item.availability === "unavailable" ? "غير متاح حاليًا" : "الطلب غير متاح حاليًا") + '</span>');
    dialog.showModal();
  }
  document.getElementById("store-search").addEventListener("input", function (event) { searchText = event.target.value.trim(); render(); });
  document.getElementById("store-sort").addEventListener("change", function (event) { sortMode = event.target.value; render(); });
  document.getElementById("store-categories").addEventListener("click", function (event) {
    var button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    render();
  });
  document.getElementById("store-favorites-toggle").addEventListener("click", function () { savedOnly = !savedOnly; render(); });
  host.addEventListener("click", function (event) {
    var saveButton = event.target.closest("[data-save-product]");
    if (saveButton) {
      var id = saveButton.dataset.saveProduct;
      if (saved.has(id)) saved.delete(id); else saved.add(id);
      persistSaved(); render(); return;
    }
    var detailsButton = event.target.closest("[data-open-product]");
    if (detailsButton) openProduct(detailsButton.dataset.openProduct);
  });
  document.getElementById("store-dialog").addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
  readSaved();
  window.DIAMOND_CONFIG_READY.then(function (config) {
    products = (config.products || []).filter(function (item) { return item && item.active !== false; });
    render();
  }).catch(function () { products = []; render(); });
})();

