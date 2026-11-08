/* عرض قوائم الترتيب — مشترك بين صفحات الأفلام والمسلسلات والعربي
   كل عنصر: { ar, en, year, rate, genres:[], desc } */
function rankPage(sets){
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const keys = Object.keys(sets);
  let cur = keys[0], q = "", g = "all", sort = "rate";
  const tabs = document.getElementById("tabs"), box = document.getElementById("list");
  const search = document.getElementById("q"), genre = document.getElementById("g"), sortEl = document.getElementById("sort");

  function fillGenres(){
    const all = [...new Set(sets[cur].items.flatMap(i => i.genres || []))].sort();
    genre.innerHTML = `<option value="all">كل التصنيفات</option>` + all.map(x => `<option>${esc(x)}</option>`).join("");
    genre.value = g = "all";
  }
  function draw(){
    if (keys.length > 1) tabs.innerHTML = keys.map(k =>
      `<button class="chip ${k===cur?"on":""}" data-k="${k}">${esc(sets[k].label)}</button>`).join("");
    let items = sets[cur].items.map((x, i) => ({...x, _i:i}));
    items.sort((a,b)=> sort==="rate" ? b.rate-a.rate || a._i-b._i : sort==="new" ? b.year-a.year : a.year-b.year);
    items = items.map((x, i) => ({...x, _r:i+1}));
    const ql = q.trim().toLowerCase();
    const list = items.filter(x => (g==="all" || (x.genres||[]).includes(g)) &&
      (!ql || (x.ar+" "+x.en).toLowerCase().includes(ql)));
    box.innerHTML = list.length ? list.map(x => `
      <article class="it">
        <div class="rank">${x._r}</div>
        <div>
          <h3>${esc(x.ar)}</h3>
          <div class="en">${esc(x.en)} · ${x.year}</div>
          <div class="rate">★ ${x.rate.toFixed(1)} <small>/ 10 · ${esc(sets[cur].src || "IMDb")}</small></div>
          ${x.desc ? `<p class="desc">${esc(x.desc)}</p>` : ""}
          <div class="meta">${(x.genres||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
        </div>
      </article>`).join("") : `<div class="empty" style="grid-column:1/-1">لا نتائج مطابقة.</div>`;
  }
  tabs.onclick = e => { const b = e.target.closest(".chip"); if (!b) return; cur = b.dataset.k; fillGenres(); draw(); };
  search.oninput = e => { q = e.target.value; draw(); };
  genre.onchange = e => { g = e.target.value; draw(); };
  sortEl.onchange = e => { sort = e.target.value; draw(); };
  fillGenres(); draw();
}
