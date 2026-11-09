(function () {
  "use strict";
  var host = document.getElementById("store-grid");
  if (!host) return;
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
  function render(config) {
    var products = (config.products || []).filter(function (item) { return item && item.active !== false; });
    if (!products.length) {
      host.innerHTML = '<div class="store-empty"><b>قريبًا</b><p>سيتم عرض المنتجات هنا عند إضافتها من لوحة إدارة الموقع.</p></div>';
      return;
    }
    host.innerHTML = products.map(function (item) {
      var image = safeUrl(item.image);
      var link = safeUrl(item.url);
      var imageHtml = image ? '<img class="store-image" src="' + esc(image) + '" alt="' + esc(item.imageAlt || item.title) + '" loading="lazy">' : '<div class="store-image store-placeholder" aria-hidden="true">DIAMOND</div>';
      return '<article class="store-card">' + imageHtml +
        '<div class="store-card-body"><span class="store-category">' + esc(item.category || "منتج") + '</span>' +
        '<h2>' + esc(item.title) + '</h2><p>' + esc(item.description) + '</p>' +
        (item.price ? '<p class="store-price">' + esc(item.price) + (item.currency ? ' <small>' + esc(item.currency) + '</small>' : '') + '</p>' : '') +
        (link ? '<a class="store-order" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">تفاصيل المنتج والطلب</a>' : '<span class="store-order disabled">الطلب غير متاح حاليًا</span>') +
        '</div></article>';
    }).join("");
  }
  window.DIAMOND_CONFIG_READY.then(render);
})();