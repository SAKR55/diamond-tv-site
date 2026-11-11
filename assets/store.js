(function () {
  "use strict";
  var host = document.getElementById("store-grid");
  if (!host) return;
  var products = [], activeCategory = "all", savedOnly = false, availableOnly = false, searchText = "", sortMode = "recommended";
  var saved = new Set(), compared = new Set(), storefront = {};
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
  function productImages(item) {
    var input = [item.image].concat(Array.isArray(item.images) ? item.images : []);
    return Array.from(new Set(input.map(safeUrl).filter(Boolean))).slice(0, 8);
  }
  function productVideos(item) { return (Array.isArray(item.videos) ? item.videos : []).map(safeUrl).filter(Boolean).slice(0, 6); }
  function unavailable(item) { return item.availability === "unavailable" || item.stock === 0; }
  function renderStorefront() {
    var config = storefront || {};
    var title = String(config.title || "متجر DIAMOND TV");
    document.getElementById("store-title").textContent = title;
    document.getElementById("store-subtitle").textContent = String(config.subtitle || "اكتشف منتجات وخدمات مختارة بعناية، وتصفّح الأقسام واحفظ ما يناسبك.");
    document.title = title + " | DIAMOND TV";
    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && config.metaDescription) metaDescription.content = String(config.metaDescription).slice(0, 170);
    var storeRoot = document.getElementById("store-content");
    var primaryColor = /^#[0-9a-f]{6}$/i.test((config.colors || {}).primary || "") ? config.colors.primary : "#6d4aff";
    var secondaryColor = /^#[0-9a-f]{6}$/i.test((config.colors || {}).secondary || "") ? config.colors.secondary : "#0c9fa2";
    if (storeRoot) { storeRoot.style.setProperty("--accent", primaryColor); storeRoot.style.setProperty("--accent2", secondaryColor); }
    var logo = safeUrl(config.logo);
    var logoNode = document.getElementById("store-brand-logo");
    if (logoNode) {
      if (logo) { logoNode.src = logo; logoNode.hidden = false; }
      else logoNode.hidden = true;
      logoNode.alt = title;
    }
    var heroLogoNode = document.getElementById("store-hero-logo");
    if (heroLogoNode) {
      if (logo) { heroLogoNode.src = logo; heroLogoNode.hidden = false; }
      else heroLogoNode.hidden = true;
    }
    var announcement = document.getElementById("store-announcement");
    announcement.textContent = String(config.announcement || "");
    announcement.hidden = !announcement.textContent.trim();
    var categories = Array.isArray(config.categories) ? config.categories.filter(function (item) { return item && item.name; }) : [];
    if (!categories.length) {
      categories = Array.from(new Set(products.map(function (item) { return String(item.category || "").trim(); }).filter(Boolean))).map(function (name) {
        return { name: name, description: "تصفّح منتجات " + name, image: "/assets/store-category-default.svg" };
      });
    }
    var tiles = document.getElementById("store-category-tiles");
    if (!tiles) return;
    tiles.innerHTML = categories.map(function (item, index) {
      var image = safeUrl(item.image) || "/assets/store-category-" + ["subscriptions", "devices", "accessories", "offers"][index % 4] + ".svg";
      var color = /^#[0-9a-f]{6}$/i.test(item.color || "") ? item.color : primaryColor;
      var count = products.filter(function (product) { return String(product.category || "").trim() === String(item.name).trim(); }).length;
      return '<button type="button" class="store-category-card" style="--category-color:' + color + '" data-category="' + esc(item.name) + '">' +
        '<img src="' + esc(image) + '" alt="" loading="lazy"><span class="store-category-card-copy"><b>' + esc(item.name) + '</b><small>' + esc(item.description || "اكتشف المنتجات") + '</small><em>' + count + ' منتجات <span aria-hidden="true">←</span></em></span></button>';
    }).join("");
  }
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
  function updateCompareBar() {
    var bar = document.getElementById("store-compare-bar");
    if (!bar) return;
    var label = document.getElementById("store-compare-label");
    bar.hidden = compared.size === 0;
    label.textContent = compared.size < 2 ? "اختر منتجًا آخر للمقارنة (" + compared.size + "/3)" : "تم اختيار " + compared.size + " منتجات للمقارنة";
    document.getElementById("store-compare-open").disabled = compared.size < 2;
  }
  function renderCategories() {
    var box = document.getElementById("store-categories");
    var configuredCategories = (Array.isArray(storefront.categories) ? storefront.categories : []).map(function (item) { return String(item.name || "").trim(); }).filter(Boolean);
    var categories = Array.from(new Set(products.map(function (p) { return String(p.category || "منتج").trim(); }).filter(Boolean).concat(configuredCategories)));
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
      var images = productImages(item);
      if (images.length) product.image = images;
      if (item.brand) product.brand = { "@type": "Brand", name: String(item.brand) };
      if (item.sku) product.sku = String(item.sku);
      if (Array.isArray(item.specifications) && item.specifications.length) product.additionalProperty = item.specifications.map(function (entry) {
        return { "@type": "PropertyValue", name: String(entry.name || ""), value: String(entry.value || "") };
      }).filter(function (entry) { return entry.name && entry.value; });
      if (productVideos(item).length) product.video = productVideos(item).map(function (url) { return { "@type": "VideoObject", name: String(item.title || "فيديو المنتج"), contentUrl: url }; });
      var price = priceNumber(item.price), currency = currencyMap[String(item.currency || "").trim()];
      if (price !== null && Number.isFinite(price) && currency) {
        var availability = unavailable(item) ? "https://schema.org/OutOfStock" : item.availability === "preorder" ? "https://schema.org/PreOrder" : "https://schema.org/InStock";
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
    if (availableOnly && (unavailable(item) || item.stock === 0)) return false;
    var query = searchText.toLowerCase();
    var specs = (Array.isArray(item.specifications) ? item.specifications : []).flatMap(function (entry) { return [entry.name, entry.value]; });
    return !query || [item.title, item.description, item.category, item.brand, item.sku].concat(item.highlights || [], item.tags || [], specs).some(function (value) { return String(value || "").toLowerCase().includes(query); });
  }
  function productCard(item, index) {
    var id = idOf(item, index), images = productImages(item), image = images[0], link = safeUrl(item.downloadable ? (item.downloadUrl || item.url) : item.url), isSaved = saved.has(id), isCompared = compared.has(id);
    var imageHtml = image ? '<img class="store-image" src="' + esc(image) + '" alt="' + esc(item.imageAlt || item.title) + '" loading="lazy">' : '<div class="store-image store-placeholder" aria-hidden="true"><span>✦</span><b>DIAMOND</b></div>';
    var description = String(item.description || ""), out = unavailable(item);
    var state = item.downloadable ? "متاح مجانًا للتنزيل" : item.availability === "preorder" ? "طلب مسبق" : out ? (item.stock === 0 ? "نفدت الكمية" : "غير متاح مؤقتًا") : "متوفر";
    var oldPrice = priceNumber(item.oldPrice), price = priceNumber(item.price);
    var discount = oldPrice && price && oldPrice > price ? Math.round((oldPrice - price) * 100 / oldPrice) : 0;
    return '<article class="store-card' + (item.downloadable ? " store-downloadable" : "") + '" data-product-card="' + esc(id) + '">' +
      '<div class="store-card-media">' + imageHtml + (discount ? '<span class="store-discount">-' + discount + '%</span>' : '') +
      (item.featured ? '<span class="store-featured">اختيار المتجر</span>' : '') +
      '<button type="button" class="store-save ' + (isSaved ? "saved" : "") + '" data-save-product="' + esc(id) + '" aria-pressed="' + isSaved + '" aria-label="' + (isSaved ? "إزالة من المحفوظات" : "حفظ المنتج") + '">' + (isSaved ? "♥" : "♡") + '</button></div>' +
      '<div class="store-card-body"><span class="store-category">' + esc(item.category || "منتج") + '</span>' +
      '<h3>' + esc(item.title || "منتج") + '</h3>' + (item.brand ? '<small class="store-brand-name">' + esc(item.brand) + '</small>' : '') + '<p class="store-card-description">' + esc(description) + '</p>' +
      '<span class="store-availability ' + (out ? "is-unavailable" : "") + '">' + esc(state) + '</span>' +
      (item.downloadable || item.free ? '<p class="store-price store-price-free">مجاني للتنزيل</p>' : item.price ? '<p class="store-price">' + esc(item.price) + (item.currency ? ' <small>' + esc(item.currency) + '</small>' : '') + (item.oldPrice ? ' <del>' + esc(item.oldPrice) + (item.currency ? ' ' + esc(item.currency) : '') + '</del>' : '') + '</p>' : '<p class="store-price store-price-unlisted">تواصل لمعرفة السعر</p>') +
      '<div class="store-card-actions"><button type="button" class="store-details" data-open-product="' + esc(id) + '">التفاصيل</button>' +
      (link && !out ? '<a class="store-order" href="' + esc(link) + '"' + (item.downloadable ? " download" : ' target="_blank" rel="noopener noreferrer"') + '>' + (item.downloadable ? "تحميل مجاني" : item.availability === "preorder" ? "طلب مسبق" : "اطلب الآن") + ' <span aria-hidden="true">←</span></a>' : '<span class="store-order disabled">' + (out ? "غير متاح حاليًا" : "الطلب غير متاح") + '</span>') +
      '</div><button type="button" class="store-compare-toggle ' + (isCompared ? "active" : "") + '" data-compare-product="' + esc(id) + '" aria-pressed="' + isCompared + '">' + (isCompared ? "✓ محدد للمقارنة" : "＋ أضف للمقارنة") + '</button>' +
      (images.length + productVideos(item).length > 1 ? '<span class="store-media-count">✦ ' + images.length + ' صور · ' + productVideos(item).length + ' فيديو</span>' : '') +
      '</div></article>';
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
    else if (sortMode === "newest") filtered.sort(function (a, b) { return (Date.parse(b.item.createdAt || "") || 0) - (Date.parse(a.item.createdAt || "") || 0); });
    else if (sortMode === "featured") filtered.sort(function (a, b) { return Number(Boolean(b.item.featured)) - Number(Boolean(a.item.featured)); });
    host.innerHTML = filtered.length ? filtered.map(function (entry) { return productCard(entry.item, entry.index); }).join("") :
      '<div class="store-empty"><b>' + (savedOnly ? "لا توجد منتجات محفوظة" : "لا توجد منتجات مطابقة") + '</b><p>' + (products.length ? "جرّب تغيير كلمة البحث أو القسم المختار." : "ستظهر المنتجات التي يضيفها فريق المتجر هنا.") + '</p></div>';
    document.getElementById("store-count").textContent = products.length + " منتج";
    document.getElementById("store-visible-count").textContent = "عرض " + filtered.length + " من " + products.length;
    updateSavedButton();
    updateCompareBar();
    renderStorefront();
    updateProductSchema();
  }
  function videoMarkup(url, index) {
    var safe = safeUrl(url);
    if (!safe) return "";
    var parsed;
    try { parsed = new URL(safe); } catch (_) { return ""; }
    var hostName = parsed.hostname.toLowerCase().replace(/^www\./, "");
    var youtubeId = "";
    if (hostName === "youtu.be") youtubeId = parsed.pathname.split("/").filter(Boolean)[0] || "";
    else if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(hostName)) {
      youtubeId = parsed.searchParams.get("v") || (parsed.pathname.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/) || [])[1] || "";
    }
    if (/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
      return '<div class="store-video"><iframe title="فيديو المنتج ' + (index + 1) + '" src="https://www.youtube-nocookie.com/embed/' + youtubeId + '" loading="lazy" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';
    }
    var vimeoMatch = hostName === "player.vimeo.com" ? parsed.pathname.match(/^\/video\/(\d+)/) : (hostName === "vimeo.com" ? parsed.pathname.match(/^\/(\d+)/) : null);
    if (vimeoMatch) {
      return '<div class="store-video"><iframe title="فيديو المنتج ' + (index + 1) + '" src="https://player.vimeo.com/video/' + vimeoMatch[1] + '" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';
    }
    if (/\.(?:mp4|webm|ogg)$/i.test(parsed.pathname)) {
      return '<div class="store-video"><video controls preload="metadata" playsinline><source src="' + esc(safe) + '"></video></div>';
    }
    return '<a class="store-video-link" href="' + esc(safe) + '" target="_blank" rel="noopener noreferrer">مشاهدة فيديو المنتج ' + (index + 1) + ' ↗</a>';
  }
  function openProduct(id) {
    var index = products.findIndex(function (item, i) { return idOf(item, i) === id; });
    var item = products[index];
    if (!item) return;
    var images = productImages(item), link = safeUrl(item.downloadable ? (item.downloadUrl || item.url) : item.url), videos = productVideos(item);
    var gallery = images.length ? '<div class="store-gallery' + (item.downloadable ? " store-downloadable" : "") + '"><img class="store-gallery-main" id="store-gallery-main" src="' + esc(images[0]) + '" alt="' + esc(item.imageAlt || item.title) + '">' +
      (images.length > 1 ? '<div class="store-gallery-thumbs">' + images.map(function (image, imageIndex) { return '<button type="button" class="store-gallery-thumb ' + (imageIndex === 0 ? "active" : "") + '" data-gallery-image="' + esc(image) + '" aria-label="عرض الصورة ' + (imageIndex + 1) + '"><img src="' + esc(image) + '" alt="" loading="lazy"></button>'; }).join("") + '</div>' : '') + '</div>' : '';
    var specs = Array.isArray(item.specifications) ? item.specifications.filter(function (entry) { return entry && entry.name && entry.value; }) : [];
    var videosHtml = videos.length ? '<section class="store-product-videos"><h3>فيديوهات المنتج</h3><div class="store-video-grid">' + videos.map(videoMarkup).join("") + '</div></section>' : '';
    var details = [
      item.brand ? ["العلامة التجارية", item.brand] : null,
      item.sku ? ["رمز المنتج", item.sku] : null,
      item.warranty ? ["الضمان", item.warranty] : null,
      item.delivery ? ["التسليم", item.delivery] : null,
      item.stock !== null && item.stock !== undefined ? ["الكمية المتاحة", String(item.stock)] : null
    ].filter(Boolean);
    document.getElementById("store-dialog-content").innerHTML =
      gallery +
      '<span class="store-category">' + esc(item.category || "منتج") + '</span><h2 id="store-dialog-title">' + esc(item.title || "تفاصيل المنتج") + '</h2>' +
      (details.length ? '<dl class="store-product-meta">' + details.map(function (entry) { return '<div><dt>' + esc(entry[0]) + '</dt><dd>' + esc(entry[1]) + '</dd></div>'; }).join("") + '</dl>' : '') +
      '<p class="store-dialog-description">' + esc(item.description || "لا توجد تفاصيل إضافية.") + '</p>' +
      (Array.isArray(item.highlights) && item.highlights.length ? '<ul class="store-highlights">' + item.highlights.map(function (line) { return '<li>' + esc(line) + '</li>'; }).join("") + '</ul>' : '') +
      (specs.length ? '<section class="store-spec-section"><h3>المواصفات</h3><dl class="store-spec-list">' + specs.map(function (entry) { return '<div><dt>' + esc(entry.name) + '</dt><dd>' + esc(entry.value) + '</dd></div>'; }).join("") + '</dl></section>' : '') +
      (Array.isArray(item.tags) && item.tags.length ? '<div class="store-tag-list">' + item.tags.map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join("") + '</div>' : '') +
      videosHtml +
      '<span class="store-availability ' + (unavailable(item) ? "is-unavailable" : "") + '">' + esc(item.availability === "preorder" ? "طلب مسبق" : (unavailable(item) ? (item.stock === 0 ? "نفدت الكمية" : "غير متاح مؤقتًا") : "متوفر")) + '</span>' +
      (item.downloadable || item.free ? '<p class="store-price store-price-free">مجاني للتنزيل</p>' : item.price ? '<p class="store-price">' + esc(item.price) + (item.currency ? ' <small>' + esc(item.currency) + '</small>' : '') + (item.oldPrice ? ' <del>' + esc(item.oldPrice) + (item.currency ? ' ' + esc(item.currency) : '') + '</del>' : '') + '</p>' : '<p class="store-price store-price-unlisted">تواصل لمعرفة السعر</p>') +
      (link && !unavailable(item) ? '<a class="store-order" href="' + esc(link) + '"' + (item.downloadable ? " download" : ' target="_blank" rel="noopener noreferrer"') + '>' + (item.downloadable ? "تنزيل الكتاب مجانًا" : item.availability === "preorder" ? "طلب مسبق" : "تفاصيل الطلب") + ' <span aria-hidden="true">←</span></a>' : '<span class="store-order disabled">' + (unavailable(item) ? "غير متاح حاليًا" : "الطلب غير متاح حاليًا") + '</span>');
    dialog.showModal();
  }
  function compareProducts() {
    var items = products.filter(function (item, index) { return compared.has(idOf(item, index)); }).slice(0, 3);
    if (items.length < 2) return;
    var rows = [
      ["الصورة", function (item) { var image = productImages(item)[0]; return image ? '<img class="store-compare-image" src="' + esc(image) + '" alt="">' : "—"; }],
      ["القسم", function (item) { return esc(item.category || "—"); }],
      ["العلامة التجارية", function (item) { return esc(item.brand || "—"); }],
      ["السعر", function (item) { return esc(item.price || "غير محدد") + (item.currency ? " " + esc(item.currency) : ""); }],
      ["الحالة", function (item) { return esc(item.availability === "preorder" ? "طلب مسبق" : unavailable(item) ? "غير متاح" : "متوفر"); }],
      ["الضمان", function (item) { return esc(item.warranty || "—"); }],
      ["التسليم", function (item) { return esc(item.delivery || "—"); }],
      ["المميزات", function (item) { return esc((item.highlights || []).join(" • ") || "—"); }]
    ];
    document.getElementById("store-dialog-content").innerHTML = '<h2 id="store-dialog-title">مقارنة المنتجات</h2><div class="store-compare-table-wrap"><table class="store-compare-table"><thead><tr><th>التفصيل</th>' + items.map(function (item) { return '<th>' + esc(item.title || "منتج") + '</th>'; }).join("") + '</tr></thead><tbody>' +
      rows.map(function (row) { return '<tr><th>' + esc(row[0]) + '</th>' + items.map(function (item) { return '<td>' + row[1](item) + '</td>'; }).join("") + '</tr>'; }).join("") +
      '</tbody></table></div>';
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
  document.getElementById("store-category-tiles").addEventListener("click", function (event) {
    var button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    render();
    document.getElementById("store-products").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.getElementById("store-available-only").addEventListener("change", function (event) { availableOnly = event.target.checked; render(); });
  document.getElementById("store-favorites-toggle").addEventListener("click", function () { savedOnly = !savedOnly; render(); });
  document.getElementById("store-compare-open").addEventListener("click", compareProducts);
  document.getElementById("store-compare-clear").addEventListener("click", function () { compared.clear(); render(); });
  host.addEventListener("click", function (event) {
    var saveButton = event.target.closest("[data-save-product]");
    if (saveButton) {
      var id = saveButton.dataset.saveProduct;
      if (saved.has(id)) saved.delete(id); else saved.add(id);
      persistSaved(); render(); return;
    }
    var compareButton = event.target.closest("[data-compare-product]");
    if (compareButton) {
      var compareId = compareButton.dataset.compareProduct;
      if (compared.has(compareId)) compared.delete(compareId);
      else if (compared.size < 3) compared.add(compareId);
      else { window.alert("يمكن مقارنة ثلاثة منتجات كحد أقصى."); }
      render(); return;
    }
    var detailsButton = event.target.closest("[data-open-product]");
    if (detailsButton) openProduct(detailsButton.dataset.openProduct);
  });
  document.getElementById("store-dialog").addEventListener("click", function (event) {
    if (event.target === dialog) { dialog.close(); return; }
    var thumb = event.target.closest("[data-gallery-image]");
    if (thumb) {
      var main = document.getElementById("store-gallery-main");
      if (main) main.src = thumb.dataset.galleryImage;
      dialog.querySelectorAll(".store-gallery-thumb").forEach(function (item) { item.classList.toggle("active", item === thumb); });
    }
  });
  readSaved();
  function applyProducts(config) {
    products = (config.products || []).filter(function (item) { return item && item.active !== false; });
    storefront = config.storefront || {};
    compared = new Set(Array.from(compared).filter(function (id) { return products.some(function (item, index) { return idOf(item, index) === id; }); }));
    renderStorefront();
    render();
  }
  window.DIAMOND_CONFIG_READY.then(applyProducts).catch(function () { products = []; render(); });
  window.addEventListener("diamond:config-updated", function (event) { applyProducts(event.detail || window.DIAMOND_CONFIG || {}); });
})();

