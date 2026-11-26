/* عدّاد زوّار خفيف يحترم الخصوصية: لا كوكيز ولا بصمة، ويحترم DNT */
(function(){try{
var U="https://ygcgzlbozumksnebawpm.supabase.co",K="sb_publishable_0H7jrAXUH1aRrTBYba8d-A_IWWC-Dyk";
var h=location.hostname,p=location.pathname;
if(h==='localhost'||h==='127.0.0.1'||navigator.doNotTrack==='1'||window.doNotTrack==='1')return;
if(/^\/(admin|account|distributor)/.test(p))return;
if(localStorage.getItem('dh_notrack')==='1'||/bot|crawl|spider|preview|headless/i.test(navigator.userAgent))return;
function rid(){return Math.random().toString(36).slice(2,12)+Date.now().toString(36).slice(-4)}
var sid=sessionStorage.getItem('dh_sid');if(!sid){sid=rid();sessionStorage.setItem('dh_sid',sid)}
var vid=localStorage.getItem('dh_vid'),isNew=false;if(!vid){vid=rid();localStorage.setItem('dh_vid',vid);isNew=true}
var last=sessionStorage.getItem('dh_last');if(last===p)return;sessionStorage.setItem('dh_last',p);
var ref='';try{var r=document.referrer;if(r){var rh=new URL(r).hostname.replace(/^www\./,'');if(rh&&rh!==h.replace(/^www\./,''))ref=rh}}catch(e){}
var w=Math.min(screen.width||innerWidth,innerWidth||9999),dev=w<700?'mobile':w<1100?'tablet':'desktop';
var ua=navigator.userAgent,br=/Edg\//.test(ua)?'Edge':/OPR\/|Opera/.test(ua)?'Opera':/SamsungBrowser/.test(ua)?'Samsung':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'Other',os=/Android/.test(ua)?'Android':/iPhone|iPad|iPod/.test(ua)?'iOS':/Windows/.test(ua)?'Windows':/Mac OS/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'Other',utm='';try{var sp=new URLSearchParams(location.search);utm=(sp.get('utm_source')||sp.get('ref')||'')+(sp.get('utm_campaign')?'/'+sp.get('utm_campaign'):'')}catch(e){}
var uid=null;try{var a=JSON.parse(localStorage.getItem('dh_auth')||'null');if(a&&a.user&&a.user.id)uid=a.user.id}catch(e){}
fetch(U+'/rest/v1/dh_page_views',{method:'POST',keepalive:true,headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({sid:sid,vid:vid,path:p.slice(0,300),ref:ref.slice(0,120),device:dev,lang:(navigator.language||'').slice(0,12),uid:uid,is_new:isNew,browser:br,os:os,utm:utm.slice(0,60)})}).catch(function(){});
}catch(e){}})();
