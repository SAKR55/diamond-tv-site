/* مصادقة Supabase خفيفة (REST) — حسابات الزوار */
(function(g){
var U="https://ygcgzlbozumksnebawpm.supabase.co",K="sb_publishable_0H7jrAXUH1aRrTBYba8d-A_IWWC-Dyk",SK='dh_auth';
function H(tok,extra){var h={apikey:K,'Content-Type':'application/json'};h.Authorization='Bearer '+(tok||K);return Object.assign(h,extra||{})}
function load(){try{return JSON.parse(localStorage.getItem(SK)||'null')}catch(e){return null}}
function save(s){if(s)localStorage.setItem(SK,JSON.stringify(s));else localStorage.removeItem(SK)}
function pack(j){return{access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),user:j.user}}
function err(j){var m=(j&&(j.msg||j.error_description||j.message||j.error))||'تعذّر تنفيذ الطلب';var t={'Invalid login credentials':'البريد أو كلمة المرور غير صحيحة','Email not confirmed':'لم يُؤكَّد البريد بعد — افتح رسالة التأكيد في بريدك','User already registered':'هذا البريد مسجّل مسبقًا — سجّل الدخول','Password should be at least 6 characters':'كلمة المرور يجب ألا تقل عن 6 أحرف'};for(var k in t)if(String(m).indexOf(k)>=0)return t[k];if(/rate limit|too many/i.test(m))return'محاولات كثيرة — انتظر دقيقة ثم أعد المحاولة';return m}
async function post(path,body,tok){var r=await fetch(U+path,{method:'POST',headers:H(tok),body:JSON.stringify(body)});var j={};try{j=await r.json()}catch(e){}if(!r.ok)throw new Error(err(j));return j}
var A={
 url:U,key:K,
 session:async function(){var s=load();if(!s)return null;if(s.expires_at&&s.expires_at-60<Date.now()/1000){try{var j=await post('/auth/v1/token?grant_type=refresh_token',{refresh_token:s.refresh_token});s=pack(j);save(s)}catch(e){save(null);return null}}return s},
 signIn:async function(email,pw){var j=await post('/auth/v1/token?grant_type=password',{email:email,password:pw});var s=pack(j);save(s);return s},
 signUp:async function(email,pw,name){var j=await post('/auth/v1/signup',{email:email,password:pw,data:{name:name||''}});if(j.access_token){var s=pack(j);save(s);return{session:s}}return{confirm:true}},
 recover:function(email){return post('/auth/v1/recover',{email:email})},
 signOut:async function(){var s=load();try{if(s)await fetch(U+'/auth/v1/logout',{method:'POST',headers:H(s.access_token)})}catch(e){}save(null)},
 rest:async function(path,opt){var s=await A.session();opt=opt||{};var r=await fetch(U+'/rest/v1/'+path,{method:opt.method||'GET',headers:H(s&&s.access_token,Object.assign({Prefer:opt.prefer||'return=representation'},opt.headers||{})),body:opt.body?JSON.stringify(opt.body):undefined});var j=null;try{j=await r.json()}catch(e){}if(!r.ok)throw new Error((j&&(j.message||j.hint))||'خطأ '+r.status);return j},
 rpc:async function(name,body){var s=await A.session();var r=await fetch(U+'/rest/v1/rpc/'+name,{method:'POST',headers:H(s&&s.access_token),body:JSON.stringify(body||{})});var j=null;try{j=await r.json()}catch(e){}if(!r.ok)throw new Error((j&&(j.message||j.hint))||'خطأ '+r.status);return j}
};
g.DHAuth=A})(window);
