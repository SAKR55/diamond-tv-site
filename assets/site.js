(function(){
  const ROOT=(document.currentScript&&document.currentScript.src||"").replace(/assets\/site\.js.*$/i,"");
  const ready=window.DIAMOND_CONFIG_READY||fetch(ROOT+"assets/site-config.json",{cache:"no-cache"}).then(r=>r.ok?r.json():{}).catch(()=>({}));
  const path=location.pathname.split("/").filter(Boolean);
  const page=path.includes("articles")?"articles":path.includes("store")?"store":"home";
  const links=[
    ["home","index.html","📚 مكتبة الأطفال","children"],
    ["articles","articles/","🧠 مقالات التربية والتعليم","articles"],
    ["store","store/","🎁 متجر المكتبة","store"]
  ];
  const header=document.createElement("header");header.className="top";
  header.innerHTML='<div class="wrap"><a class="brand" href="'+ROOT+'index.html" aria-label="المكتبة الماسية - الرئيسية">المكتبة الماسية</a><nav class="nav" aria-label="القائمة الرئيسية">'+links.map(function(x){return '<a href="'+ROOT+x[1]+'"'+(x[0]===page?' class="on"':'')+' data-site-section="'+x[3]+'">'+x[2]+'</a>';}).join("")+'</nav></div>';
  document.body.prepend(header);
  const footer=document.createElement("footer");
  footer.innerHTML='<div class="wrap"><nav class="flinks">'+links.map(function(x){return '<a href="'+ROOT+x[1]+'" data-site-section="'+x[3]+'">'+x[2].replace(/^\\S+\\s/,"")+'</a>';}).join("")+'</nav>المكتبة الماسية © '+new Date().getFullYear()+'</div>';
  document.body.appendChild(footer);
  function apply(config){
    const theme=config&&config.theme||{};
    if(/^#[0-9a-f]{6}$/i.test(theme.accent||""))document.documentElement.style.setProperty("--accent",theme.accent);
    if(/^#[0-9a-f]{6}$/i.test(theme.accent2||""))document.documentElement.style.setProperty("--accent2",theme.accent2);
    const sections=config&&config.sections||{};
    document.querySelectorAll('[data-site-section="children"]').forEach(function(el){el.hidden=sections.children===false;});
    document.querySelectorAll('[data-site-section="store"]').forEach(function(el){el.hidden=sections.store===false;});
    document.querySelectorAll('[data-site-section="articles"]').forEach(function(el){el.hidden=sections.articles===false;});
    const library=document.querySelector(".children-library");if(library)library.hidden=sections.children===false;
  }
  Promise.resolve(ready).then(apply);
  window.addEventListener("diamond:config-updated",function(e){apply(e.detail||window.DIAMOND_CONFIG||{});});
})();
