(function(){
  "use strict";
  var OWNER="SAKR55", REPO="diamond-tv-site", BRANCH="main";
  var API="https://api.github.com/repos/"+OWNER+"/"+REPO;
  var token="", connected=false, busy=false;
  var $=function(id){return document.getElementById(id);};
  var form=$("piProductForm");
  function status(id,message,tone){
    var node=$(id); node.textContent=message||""; node.classList.remove("error","success");
    if(tone) node.classList.add(tone);
  }
  function githubHeaders(json){
    var headers={Accept:"application/vnd.github+json",Authorization:"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28"};
    if(json) headers["Content-Type"]="application/json";
    return headers;
  }
  async function github(path,options){
    options=options||{};
    var response=await fetch(API+path,{method:options.method||"GET",headers:githubHeaders(!!options.body),body:options.body?JSON.stringify(options.body):undefined});
    var data={}; try{data=await response.json();}catch(_){}
    if(!response.ok){
      var message=data.message||"تعذّر تنفيذ الطلب إلى GitHub.";
      if(response.status===401) message="رمز GitHub غير صحيح أو منتهي.";
      if(response.status===403) message="لا يملك الرمز صلاحية Contents للقراءة والكتابة، أو تجاوز حد الطلبات.";
      var error=new Error(message); error.status=response.status; throw error;
    }
    return data;
  }
  function apiFile(path){
    return "/contents/"+path.split("/").map(encodeURIComponent).join("/")+"?ref="+encodeURIComponent(BRANCH);
  }
  function decodeBase64(value){
    var binary=atob(String(value||"").replace(/\s/g,""));
    var bytes=Uint8Array.from(binary,function(ch){return ch.charCodeAt(0);});
    return new TextDecoder("utf-8").decode(bytes);
  }
  function encodeBase64(value){
    var bytes=new TextEncoder().encode(value), binary="";
    for(var i=0;i<bytes.length;i+=1) binary+=String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  async function readConfig(){
    var file=await github(apiFile("assets/site-config.json"));
    var config=JSON.parse(decodeBase64(file.content||""));
    if(!config||typeof config!=="object") throw new Error("ملف إعدادات المتجر غير صالح.");
    return {file:file,config:config};
  }
  function safeUrl(value,allowLocal){
    var text=String(value||"").trim(); if(!text) return "";
    try{
      var url=new URL(text,location.origin);
      if(url.username||url.password||(url.port&&url.port!=="443")) return "";
      if(url.protocol==="https:") return url.href;
      if(allowLocal&&url.origin===location.origin&&/^\/assets\/[a-zA-Z0-9._/-]+$/.test(url.pathname)) return url.pathname;
    }catch(_){}
    return "";
  }
  function uniqueLines(value,limit,mediaType){
    var seen=new Set(), out=[];
    String(value||"").split(/\r?\n/).map(function(line){return line.trim();}).filter(Boolean).forEach(function(line){
      var safe=safeUrl(line,true);
      if(!safe) throw new Error("أحد روابط "+mediaType+" غير صالح. استخدم HTTPS أو مسارًا داخل assets.");
      if(!seen.has(safe)){seen.add(safe);out.push(safe);}
    });
    if(out.length>limit) throw new Error("الحد الأقصى لـ "+mediaType+" هو "+limit+".");
    return out;
  }
  function setField(name,value){
    if(value!==undefined&&value!==null&&String(value)!==""&&form.elements[name]) form.elements[name].value=String(value);
  }
  function fillProduct(data,sourceUrl){
    if((form.elements.title.value.trim()||form.elements.description.value.trim())&&!window.confirm("سيتم استبدال الحقول التي عُثر لها على بيانات. هل تتابع؟")) return;
    setField("title",data.title); setField("category",data.category); setField("brand",data.brand);
    setField("sku",data.sku); setField("description",data.description); setField("price",data.price);
    setField("oldPrice",data.oldPrice); if(Object.prototype.hasOwnProperty.call(data,"currency")) form.elements.currency.value=String(data.currency||""); setField("warranty",data.warranty);
    setField("image",data.image||(data.images||[])[0]);
    setField("images",(data.images||[]).slice(data.image?0:1).join("\n"));
    setField("videos",(data.videos||[]).join("\n"));
    setField("highlights",(data.highlights||[]).join("\n"));
    setField("specifications",(data.specifications||[]).map(function(item){return [item.name||"",item.value||""].join(" | ");}).join("\n"));
    setField("sourceUrl",sourceUrl||data.sourceUrl); setField("imageAlt",data.title);
    if(data.stock!==undefined&&data.stock!==null)setField("stock",data.stock);
    if(["available","preorder","unavailable"].indexOf(data.availability)>=0) form.elements.availability.value=data.availability;
    updatePreview();
  }
  async function sleep(ms){return new Promise(function(resolve){setTimeout(resolve,ms);});}
  async function importFromUrl(){
    if(busy)return;
    var source=$("piSourceUrl").value.trim();
    if(!source){status("piImportStatus","الصق رابط المنتج أولًا.","error");return;}
    var parsed; try{parsed=new URL(source);}catch(_){status("piImportStatus","الرابط غير صالح.","error");return;}
    if(parsed.protocol!=="https:"||parsed.username||parsed.password||(parsed.port&&parsed.port!=="443")){
      status("piImportStatus","استخدم رابط HTTPS عامًّا دون اسم مستخدم أو كلمة مرور.","error");return;
    }
    if(!$("piRights").checked){status("piImportStatus","أكد امتلاك إذن استخدام بيانات وصور المنتج.","error");return;}
    busy=true; $("piImport").disabled=true;
    try{
      var requestId="product-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,10);
      status("piImportStatus","جارٍ إرسال رابط المنتج إلى أداة القراءة…");
      await github("/dispatches",{method:"POST",body:{event_type:"product-import",client_payload:{source_url:source,request_id:requestId}}});
      var resultPath=".github/product-imports/"+requestId+".json";
      for(var attempt=0;attempt<60;attempt+=1){
        status("piImportStatus","يجري فحص الصفحة المسموح بها. انتظر قليلًا ("+(attempt+1)+"/60)…");
        await sleep(5000);
        try{
          var resultFile=await github(apiFile(resultPath));
          var result=JSON.parse(decodeBase64(resultFile.content||""));
          if(result.requestId!==requestId) throw new Error("تعذرت مطابقة نتيجة الاستيراد.");
          if(!result.ok||!result.product) throw new Error(result.error||"لم تتوفر بيانات قابلة للاستيراد من هذه الصفحة.");
          fillProduct(result.product,result.finalUrl||source);
          status("piImportStatus","تمت تعبئة البيانات المتاحة: "+(result.found||[]).join("، ")+" — راجع كل حقل والصورة قبل الإضافة."+((result.warnings||[]).length?" ملاحظات: "+result.warnings.join(" · "):""),"success");
          return;
        }catch(error){if(error.status===404)continue;throw error;}
      }
      throw new Error("لم تصل نتيجة القراءة خلال 5 دقائق. يمكنك إدخال البيانات يدويًا أو المحاولة لاحقًا.");
    }catch(error){status("piImportStatus",error.message||"تعذّر استيراد الرابط.","error");}
    finally{busy=false;$("piImport").disabled=false;}
  }
  function splitLines(value,limit){return String(value||"").split(/\r?\n/).map(function(line){return line.trim();}).filter(Boolean).slice(0,limit);}
  function parseSpecs(value){
    return splitLines(value,32).map(function(line){
      var parts=line.split("|");
      if(parts.length<2) throw new Error("اكتب كل مواصفة بهذا الشكل: اسم الخاصية | القيمة.");
      return {name:parts[0].trim().slice(0,60),value:parts.slice(1).join("|").trim().slice(0,140)};
    }).filter(function(item){return item.name&&item.value;});
  }
  function buildProduct(){
    var title=form.elements.title.value.trim().slice(0,100), description=form.elements.description.value.trim().slice(0,1200);
    if(!title||!description) throw new Error("أدخل اسم المنتج ووصفه قبل النشر.");
    var sourceUrl=safeUrl(form.elements.sourceUrl.value,true), buyUrl=safeUrl(form.elements.url.value,true);
    if(form.elements.sourceUrl.value.trim()&&!sourceUrl) throw new Error("رابط المصدر غير صالح.");
    if(form.elements.url.value.trim()&&!buyUrl) throw new Error("رابط الطلب غير صالح.");
    var image=safeUrl(form.elements.image.value,true);
    if(form.elements.image.value.trim()&&!image) throw new Error("رابط الصورة الرئيسية غير صالح.");
    var images=uniqueLines(form.elements.images.value,7,"الصور");
    var videos=uniqueLines(form.elements.videos.value,6,"الفيديوهات");
    if(image) images=[image].concat(images.filter(function(item){return item!==image;})).slice(0,8);
    var stockText=form.elements.stock.value;
    var product={
      id:"product-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8),
      title:title,category:form.elements.category.value.trim().slice(0,60)||"عام",
      description:description,brand:form.elements.brand.value.trim().slice(0,80),
      sku:form.elements.sku.value.trim().slice(0,60),warranty:form.elements.warranty.value.trim().slice(0,100),
      delivery:form.elements.delivery.value.trim().slice(0,100),
      highlights:splitLines(form.elements.highlights.value,16).map(function(x){return x.slice(0,140);}),
      specifications:parseSpecs(form.elements.specifications.value),
      tags:[],price:form.elements.price.value.trim().slice(0,30),oldPrice:form.elements.oldPrice.value.trim().slice(0,30),
      currency:form.elements.currency.value.trim().slice(0,12)||"ر.س",
      stock:stockText===""?null:Math.max(0,Math.min(999999,Number(stockText)||0)),
      image:image,images:images,videos:videos,imageAlt:form.elements.imageAlt.value.trim().slice(0,150)||title,
      url:buyUrl,sourceUrl:sourceUrl,availability:"available",featured:form.elements.featured.checked,
      active:form.elements.active.checked,createdAt:new Date().toISOString()
    };
    return product;
  }
  async function saveProduct(product){
    for(var attempt=0;attempt<2;attempt+=1){
      var current=await readConfig();
      if(!Array.isArray(current.config.products)) current.config.products=[];
      if(current.config.products.some(function(item){return item.id===product.id;})) return;
      current.config.products.push(product);
      try{
        return await github(apiFile("assets/site-config.json").split("?")[0],{method:"PUT",body:{
          message:"store: add "+product.title.slice(0,55),
          content:encodeBase64(JSON.stringify(current.config,null,2)+"\n"),
          sha:current.file.sha,branch:BRANCH
        }});
      }catch(error){if(attempt===0&&(error.status===409||error.status===422))continue;throw error;}
    }
  }
  async function publishProduct(event){
    event.preventDefault(); if(busy)return;
    if(!connected){status("piSaveStatus","اتصل بالمتجر أولًا.","error");return;}
    var product; try{product=buildProduct();}catch(error){status("piSaveStatus",error.message,"error");return;}
    busy=true;$("piSave").disabled=true;status("piSaveStatus","جارٍ إضافة المنتج إلى ملف المتجر…");
    try{
      await saveProduct(product);
      status("piSaveStatus","أُضيف المنتج بنجاح. ستظهر صفحة المتجر بعد تحديث GitHub Pages.","success");
      status("piConnectionStatus","متصل بالمتجر · "+new Date().toLocaleTimeString("ar-SA"));
      window.scrollTo({top:0,behavior:"smooth"});
    }catch(error){status("piSaveStatus",error.message||"تعذّر حفظ المنتج.","error");}
    finally{busy=false;$("piSave").disabled=false;}
  }
  function updatePreview(){
    var title=form.elements.title.value.trim(), description=form.elements.description.value.trim();
    $("piPreviewTitle").textContent=title||"اسم المنتج";
    $("piPreviewDescription").textContent=description||"سيظهر وصف المنتج هنا.";
    $("piPreviewCategory").textContent=form.elements.category.value.trim()||"القسم";
    var price=form.elements.price.value.trim(), currency=form.elements.currency.value.trim()||"ر.س";
    $("piPreviewPrice").textContent=price?price+" "+currency:"السعر غير محدد";
    var image=safeUrl(form.elements.image.value,true), box=$("piPreviewImage");
    box.innerHTML="";
    if(image){var img=document.createElement("img");img.src=image;img.alt=form.elements.imageAlt.value.trim()||title||"صورة المنتج";box.appendChild(img);}
    else{var span=document.createElement("span");span.textContent="صورة المنتج";box.appendChild(span);}
  }
  function renderCategories(config){
    var categories=((config.storefront||{}).categories||[]).map(function(item){return item.name;}).filter(Boolean);
    $("piCategories").innerHTML=categories.map(function(name){var option=document.createElement("option");option.value=name;return option;}).reduce(function(html,option){return html+option.outerHTML;},"");
  }
  $("piConnect").addEventListener("click",async function(){
    token=$("piToken").value.trim();
    if(!token){status("piConnectionStatus","أدخل رمز الوصول.","error");return;}
    $("piConnect").disabled=true;status("piConnectionStatus","جارٍ الاتصال وقراءة إعدادات المتجر…");
    try{var result=await readConfig();connected=true;renderCategories(result.config);$("piWorkspace").hidden=false;$("piSave").disabled=false;$("piToken").value="";status("piConnectionStatus","تم الاتصال. المنتجات الحالية محفوظة قبل أي تعديل.","success");}
    catch(error){token="";connected=false;$("piToken").value="";status("piConnectionStatus",error.message||"فشل الاتصال.","error");}
    finally{$("piConnect").disabled=false;}
  });
  $("piImport").addEventListener("click",importFromUrl);
  form.addEventListener("submit",publishProduct);
  form.addEventListener("reset",function(){setTimeout(updatePreview,0);});
  form.addEventListener("input",updatePreview);
  form.addEventListener("change",updatePreview);
})();