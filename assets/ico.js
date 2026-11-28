/* أيقونات SVG احترافية بمظهر فاتح تستبدل الإيموجي في بطاقات الأدوات */
(function(){
var P={
receipt:'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8 M12 17.5v-11',
bank:'M3 22h18 M6 18v-7 M10 18v-7 M14 18v-7 M18 18v-7 M12 2 20 7H4z',
scale:'M12 3v18 M5 21h14 M5 7h14 M5 7l-3 8a3.5 3.5 0 0 0 6 0z M19 7l-3 8a3.5 3.5 0 0 0 6 0z',
chart:'M3 3v18h18 M7 16v-5 M12 16V7 M17 16v-8',
drop:'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z',
calc:'M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z M8 6h8 M8 11h.01 M12 11h.01 M16 11h.01 M8 15h.01 M12 15h.01 M16 15h.01 M8 19h.01 M12 19h.01 M16 19h.01',
ruler:'M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z M14.5 12.5l2-2 M11.5 9.5l2-2 M8.5 6.5l2-2 M17.5 15.5l2-2',
moon:'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
bot:'M12 8V4H8 M4 8h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z M2 14h2 M20 14h2 M15 13v2 M9 13v2',
dollar:'M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
calendar:'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
pen:'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
link:'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
search:'M21 21l-4.3-4.3 M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',
users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
target:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
flask:'M9 2h6 M10 2v6.5L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8.5V2 M7 15h10',
refresh:'M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5',
truck:'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2 M15 18H9 M19 18h2a1 1 0 0 0 1-1v-3.7a1 1 0 0 0-.2-.6l-3.3-4.4a1 1 0 0 0-.8-.4H14 M9 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z M19 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
gift:'M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
clip:'M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 12h6 M9 16h4',
rocket:'M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z M12 15l-3-3a22 22 0 0 1 2-3.95A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0 M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
msg:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
layers:'M12 2 2 7l10 5 10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
mic:'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3',
brief:'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16 M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z',
star:'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1z',
factory:'M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z M17 18h1 M12 18h1 M7 18h1',
box:'M16.5 9.4 7.5 4.2 M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z M3.3 7 12 12l8.7-5 M12 22V12',
tag:'M12.6 2.6a2 2 0 0 0-1.4-.6H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z M7 7h.01',
up:'M22 7l-8.5 8.5-5-5L2 17 M16 7h6v6',
down:'M22 17l-8.5-8.5-5 5L2 7 M16 17h6v-6',
phone:'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M12 18h.01',
bulb:'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5 M9 18h6 M10 22h4',
mail:'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 7l-10 6L2 7',
plane:'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z',
alert:'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01',
exit:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
cap:'M22 10 12 5 2 10l10 5z M6 12v5c3 3 9 3 12 0v-5',
clock:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
book:'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20',
spark:'M12 3l1.9 5.8L20 10.7l-6.1 1.9L12 18.5l-1.9-5.9L4 10.7l6.1-1.9z M19 3v4 M21 5h-4',
trophy:'M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.7V17c0 .6-.5 1-1.2 1.2C7.8 18.5 7 20 7 22 M14 14.7V17c0 .6.5 1 1.2 1.2 1 .3 1.8 1.8 1.8 3.8 M18 2H6v7a6 6 0 0 0 12 0z',
compass:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z',
zap:'M13 2 3 14h9l-1 8 10-12h-9z',
mega:'M3 11l18-5v12L3 14v-3z M11.6 16.8a3 3 0 1 1-5.8-1.6',
radio:'M4.9 19.1C1 15.2 1 8.8 4.9 4.9 M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5 M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5 M19.1 4.9C23 8.8 23 15.1 19.1 19 M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
send:'M22 2 11 13 M22 2l-7 20-4-9-9-4z',
cart:'M8 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M19 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12',
store:'M3 9l1-5h16l1 5 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 M5 21V12 M19 21V12 M3 21h18',
camera:'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
globe:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10A15 15 0 0 1 12 2z',
shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
build:'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4',
call:'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
hourglass:'M5 22h14 M5 2h14 M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22 M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4A2 2 0 0 0 17 6.2V2',
check:'M22 11.1V12a10 10 0 1 1-5.9-9.1 M22 4 12 14l-3-3',
wrench:'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z',
palette:'M12 22a10 10 0 1 1 10-10c0 2.8-2 3-4 3h-2a2 2 0 0 0-1.5 3.3c.6.8.3 2.7-2.5 3.7z M7.5 11h.01 M10.5 7h.01 M15.5 7h.01',
film:'M2 4h20v16H2z M7 4v16 M17 4v16 M2 12h20 M2 8h5 M2 16h5 M17 8h5 M17 16h5',
image:'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M21 15l-5-5L5 21',
qr:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3h-3z M20 14v.01 M14 20v.01 M20 20v.01 M17 17v3h3',
dice:'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M8 8h.01 M16 8h.01 M8 16h.01 M16 16h.01 M12 12h.01',
home:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
grid:'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
ship:'M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 M19.4 17 21 11l-9-3-9 3 1.6 6 M12 8V2 M8 4h4'
};
var M={'🧾':'receipt','🏦':'bank','🏧':'bank','🏛':'bank','⚖':'scale','📊':'chart','📈':'up','📉':'down','💹':'up','💧':'drop','🧮':'calc','📐':'ruler','📏':'ruler','🕌':'moon','🤖':'bot','💸':'dollar','💵':'dollar','💲':'dollar','💰':'dollar','🪙':'dollar','💱':'refresh','🗓':'calendar','📅':'calendar','📆':'calendar','✍':'pen','📝':'pen','📓':'book','📒':'book','📘':'book','📚':'book','🔗':'link','⛓':'link','🔎':'search','🔍':'search','🕵':'search','🔭':'search','🧑‍🤝‍🧑':'users','🤝':'users','👥':'users','🧑‍💼':'brief','💼':'brief','🎯':'target','🧲':'target','🧪':'flask','🧬':'flask','🔮':'spark','♻':'refresh','🔄':'refresh','🔁':'refresh','🚚':'truck','🚛':'truck','🎁':'gift','📋':'clip','🚀':'rocket','🛫':'plane','✈':'plane','💬':'msg','🗣':'msg','📨':'mail','✉':'mail','📤':'send','🧩':'layers','🧱':'layers','🧺':'layers','📄':'file','🎤':'mic','🎧':'mic','🧳':'brief','🎒':'brief','🏖':'plane','⭐':'star','🌟':'star','🏅':'trophy','🏆':'trophy','🏭':'factory','🏗':'factory','🚧':'factory','📦':'box','🏷':'tag','🎟':'tag','🐖':'dollar','🔢':'calc','📱':'phone','💡':'bulb','🚪':'exit','🛗':'exit','⚠':'alert','🚨':'alert','🎓':'cap','⏱':'clock','🕒':'clock','⏰':'clock','🕰':'clock','⏳':'hourglass','📌':'target','🧠':'spark','🪞':'spark','🙏':'spark','😊':'spark','😵':'alert','🥧':'chart','🥊':'target','🧭':'compass','🌍':'globe','🔋':'zap','⚡':'zap','📣':'mega','📡':'radio','↩':'refresh','🛒':'cart','🏬':'store','📷':'camera','♾':'refresh','🛟':'shield','🛡':'shield','🏢':'build','📞':'call','🩺':'shield','🎛':'wrench','🎚':'wrench','✅':'check','🏁':'check','💎':'star','🛃':'shield','🔬':'flask','🏠':'home','🚢':'ship','🎨':'palette','🎬':'film','🖼':'image','🧰':'wrench','▦':'qr','🎲':'dice','🟢':'msg','🗺':'compass','🕘':'clock','⚙':'wrench','🛠':'wrench','🎮':'dice','📇':'clip','🗂':'clip','📰':'file','✨':'spark','📸':'camera','📺':'film','👤':'users','🆕':'spark'};
var C=[['#e0f2fe','#0369a1'],['#ede9fe','#6d28d9'],['#d1fae5','#047857'],['#fef3c7','#b45309'],['#ffe4e6','#be123c'],['#ccfbf1','#0f766e']];
function nm(t){t=(t||'').replace(/️/g,'').trim();return M[t]||null}
function svg(n,s){return '<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+P[n].split(' M').map(function(d,i){return '<path d="'+(i?'M':'')+d+'"/>'}).join('')+'</svg>'}
function hash(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
function tile(el){if(el.getAttribute('data-svg'))return;var t=el.textContent.trim();if(!t||el.querySelector('svg,img'))return;var n=nm(t)||(/^[^\u0000-ɏ؀-ۿ]+$/.test(t)?'grid':null);if(!n||!P[n])return;var c=C[hash(n)%C.length];el.setAttribute('data-svg',1);el.classList.add('ics');el.style.setProperty('--ib',c[0]);el.style.setProperty('--ic',c[1]);el.innerHTML=svg(n,el.classList.contains('sm')?18:26)}
var RE=/^\s*((?:[←-⯿\u{1F300}-\u{1FAFF}][️‍]?)+)\s*/u;
function lead(el){var tn=el.firstChild;if(!tn||tn.nodeType!==3||el.getAttribute('data-svg'))return;var m=tn.nodeValue.match(RE);if(!m)return;var n=nm(m[1]);if(!n)return;el.setAttribute('data-svg',1);var s=document.createElement('span');s.className='li';s.innerHTML=svg(n,17);tn.nodeValue=tn.nodeValue.slice(m[0].length);el.insertBefore(s,tn)}
function run(){[].forEach.call(document.querySelectorAll('div.ic,span.ic,span.ni'),tile);[].forEach.call(document.querySelectorAll('.grp-h>span'),function(e){e.classList.add('ic','sm');tile(e)});[].forEach.call(document.querySelectorAll('.path a,.chip,.thead h2,.tab,.sbtn,.pnav .links>a,.pnav .ddb,.pnav .dd a'),lead)}
var st=document.createElement('style');st.textContent='.ics{background:var(--ib)!important;color:var(--ic);box-shadow:none!important;border:1px solid rgba(15,23,42,.06);font-size:0}.ics svg{display:block}.ni.ics{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;margin-bottom:6px}.ic.ics.sm{width:34px;height:34px;border-radius:10px;display:inline-grid;vertical-align:middle;margin:0 0 0 8px}.li{display:inline-flex;vertical-align:-3px;margin-inline-end:6px;opacity:.85}a:hover .ics{transform:scale(1.06)}.ics{transition:transform .2s}';document.head.appendChild(st);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();addEventListener('load',run);
})();
