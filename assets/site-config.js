(function () {
  "use strict";
  var script = document.currentScript;
  var assetsRoot = new URL(".", script && script.src ? script.src : location.href);
  var configUrl = new URL("site-config.json", assetsRoot);
  var defaults = {
    version: 1,
    theme: { accent: "#6d4aff", accent2: "#0c9fa2" },
    sections: { live: true, recommendations: true, store: true },
    leagues: [
      { id: "ksa.1", ar: "دوري روشن السعودي", tv: ["ثمانية"] },
      { id: "uefa.champions", ar: "دوري أبطال أوروبا", tv: ["beIN SPORTS"] },
      { id: "eng.1", ar: "الدوري الإنجليزي", tv: ["beIN SPORTS"] },
      { id: "esp.1", ar: "الدوري الإسباني", tv: ["beIN SPORTS"] },
      { id: "ita.1", ar: "الدوري الإيطالي", tv: ["STARZPLAY"] },
      { id: "ger.1", ar: "الدوري الألماني", tv: ["MBC Action", "شاهد"] },
      { id: "fra.1", ar: "الدوري الفرنسي", tv: ["beIN SPORTS"] },
      { id: "uefa.europa", ar: "الدوري الأوروبي", tv: ["beIN SPORTS"] },
      { id: "egy.1", ar: "الدوري المصري", tv: ["ON Sports"] },
      { id: "afc.champions", ar: "دوري أبطال آسيا للنخبة", tv: ["beIN SPORTS"] }
    ],
    recommendations: { tvmazeIds: [], movies: [] },
    products: []
  };
  function apply(config) {
    var theme = config.theme || {};
    if (/^#[0-9a-f]{6}$/i.test(theme.accent || "")) document.documentElement.style.setProperty("--accent", theme.accent);
    if (/^#[0-9a-f]{6}$/i.test(theme.accent2 || "")) document.documentElement.style.setProperty("--accent2", theme.accent2);
    var sections = config.sections || {};
    if (sections.live === false) {
      var live = document.getElementById("live-board-section");
      if (live) live.hidden = true;
    }
    if (sections.recommendations === false) {
      var rec = document.getElementById("recommendations");
      if (rec) rec.hidden = true;
      var evening = document.getElementById("evening-content");
      if (evening) evening.hidden = true;
      document.querySelectorAll('a[href*="/evening/"], a[href="evening/"]').forEach(function (link) { link.hidden = true; });
    }
    if (sections.store === false) {
      document.querySelectorAll('a[href*="/store/"], a[href="store/"]').forEach(function (link) { link.hidden = true; });
      var store = document.getElementById("store-content");
      if (store) store.hidden = true;
    }
  }
  window.DIAMOND_CONFIG_ROOT = assetsRoot;
  window.DIAMOND_CONFIG_READY = fetch(configUrl.href, { cache: "no-cache" })
    .then(function (response) { if (!response.ok) throw new Error("site config unavailable"); return response.json(); })
    .catch(function () { return defaults; })
    .then(function (loaded) {
      var config = Object.assign({}, defaults, loaded || {});
      config.theme = Object.assign({}, defaults.theme, config.theme || {});
      config.sections = Object.assign({}, defaults.sections, config.sections || {});
      config.recommendations = Object.assign({}, defaults.recommendations, config.recommendations || {});
      config.leagues = Array.isArray(config.leagues) ? config.leagues : defaults.leagues;
      config.products = Array.isArray(config.products) ? config.products : [];
      window.DIAMOND_CONFIG = config;
      apply(config);
      return config;
    });
})();

