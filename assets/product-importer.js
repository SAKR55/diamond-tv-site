(function(){
  "use strict";
  var OWNER="SAKR55", REPO="diamond-tv-site", BRANCH="main";
  var API="https://api.github.com/repos/"+OWNER+"/"+REPO;
  var token="", connected=false, busy=false, mediaBusy=false, currentProducts=[];
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
  function moneyInput(value){
    var text=String(value==null?"":value).trim()
      .replace(/[٠-٩]/g,function(d){return String("٠١٢٣٤٥٦٧٨٩".indexOf(d));})
      .replace(/[۰-۹]/g,function(d){return String("۰۱۲۳۴۵۶۷۸۹".indexOf(d));})
      .replace(/[^0-9.,-]/g,"");
    if(text.indexOf(",")>=0&&text.indexOf(".")<0)text=text.replace(",",".");
    else text=text.replace(/,/g,"");
    return text;
  }
  function setField(name,value){
    if(value!==undefined&&value!==null&&String(value)!==""&&form.elements[name]) form.elements[name].value=String(value);
  }
  function fillProduct(data,sourceUrl){
    if((form.elements.title.value.trim()||form.elements.description.value.trim())&&!window.confirm("سيتم استبدال الحقول التي عُثر لها على بيانات. هل تتابع؟")) return;
    setField("title",data.title); setField("category",data.category); setField("brand",data.brand);
    setField("sku",data.sku); setField("description",data.description); setField("price",moneyInput(data.price)); setField("seoTitle",data.seoTitle); setField("seoDescription",data.seoDescription); setField("tags",(data.tags||[]).join("، "));
    setField("oldPrice",moneyInput(data.oldPrice)); if(Object.prototype.hasOwnProperty.call(data,"currency")) form.elements.currency.value=String(data.currency||""); setField("warranty",data.warranty);
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
  function isAliExpressHost(host){return /(^|\\.)aliexpress\\.(com|us|ru)$/i.test(String(host||""));}
  function openDsersImport(){
    var source=$("piSourceUrl").value.trim(), parsed;
    try{parsed=new URL(source);}catch(_){status("piImportStatus","الصق رابط منتج AliExpress أولًا.","error");return;}
    if(parsed.protocol!=="https:"||!isAliExpressHost(parsed.hostname)){status("piImportStatus","أدخل رابط HTTPS مباشرًا من AliExpress.","error");return;}
    if(!$("piRights").checked){status("piImportStatus","أكد امتلاك إذن استخدام بيانات وصور المنتج.","error");return;}
    window.open("https://accounts.dsers.com/","_blank","noopener,noreferrer");
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(source).then(function(){status("piImportStatus","نُسخ الرابط. الصقه في قائمة استيراد DSers لإضافة المنتج إلى حسابك.","success");}).catch(function(){status("piImportStatus","فتحنا DSers. انسخ الرابط من الحقل والصقه في قائمة استيراد المنتجات.");});}
    else status("piImportStatus","فتحنا DSers. انسخ الرابط من الحقل والصقه في قائمة استيراد المنتجات.");
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
    if(isAliExpressHost(parsed.hostname)){status("piImportStatus","روابط AliExpress تُستورد من خلال DSers الرسمي. استخدم زر «إرسال رابط AliExpress إلى DSers»؛ الاستيراد المباشر إلى هذا الموقع المخصص يحتاج WooCommerce أو موافقة على تطبيق DSers مخصص.","error");return;}
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
    var productId=form.elements.id.value.trim();
    if(!productId){productId="product-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);form.elements.id.value=productId;}
    var product={
      id:productId,
      title:title,category:form.elements.category.value.trim().slice(0,60)||"عام",
      description:description,seoTitle:form.elements.seoTitle.value.trim().slice(0,70),seoDescription:form.elements.seoDescription.value.trim().slice(0,320),brand:form.elements.brand.value.trim().slice(0,80),
      sku:form.elements.sku.value.trim().slice(0,60),supplierSku:form.elements.supplierSku.value.trim().slice(0,100),warranty:form.elements.warranty.value.trim().slice(0,100),
      delivery:form.elements.delivery.value.trim().slice(0,100),
      highlights:splitLines(form.elements.highlights.value,16).map(function(x){return x.slice(0,140);}),
      specifications:parseSpecs(form.elements.specifications.value),
      tags:form.elements.tags.value.split(/[،,]/).map(function(value){return value.trim();}).filter(Boolean).slice(0,24),price:form.elements.price.value.trim().slice(0,30),oldPrice:form.elements.oldPrice.value.trim().slice(0,30),
      currency:form.elements.currency.value.trim().slice(0,12)||"ر.س",
      stock:stockText===""?null:Math.max(0,Math.min(999999,Number(stockText)||0)),
      image:image,images:images,videos:videos,imageAlt:form.elements.imageAlt.value.trim().slice(0,150)||title,
      url:buyUrl,sourceUrl:sourceUrl,availability:["available","preorder","unavailable"].indexOf(form.elements.availability.value)>=0?form.elements.availability.value:"available",featured:form.elements.featured.checked,
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
    if(!connected){status("piSaveStatus","اتصل بالمتجر من الأعلى للنشر المباشر. تنزيل ملفات CSV وJSON لا يحتاج اتصالًا.","error");return;}
    var product; try{product=buildProduct();}catch(error){status("piSaveStatus",error.message,"error");return;}
    var duplicate=currentProducts.some(function(item){
      return (product.sku&&item.sku&&String(product.sku).toLowerCase()===String(item.sku).toLowerCase())||
        String(product.title).trim().toLowerCase()===String(item.title||"").trim().toLowerCase();
    });
    if(duplicate&&!window.confirm("يوجد منتج بالاسم أو SKU نفسه في متجر DIAMOND. هل تريد المتابعة؟"))return;
    busy=true;$("piSave").disabled=true;
    try{
      status("piSaveStatus","جارٍ إضافة المنتج إلى متجر DIAMOND…");
      await saveProduct(product);
      currentProducts.push(product);
      status("piSaveStatus","أُضيف المنتج إلى متجر DIAMOND. سيظهر بعد تحديث GitHub Pages.","success");
      updatePreview();
    }catch(error){status("piSaveStatus",error.message||"تعذّر حفظ المنتج.","error");}
    finally{busy=false;$("piSave").disabled=false;}
  }
  function csvCell(value){
    var text=String(value==null?"":value);
    return '"'+text.replace(/"/g,'""')+'"';
  }
  function downloadCsv(headers,rows,filename){
    var lines=[headers].concat(rows).map(function(row){return row.map(csvCell).join(",");}).join("\r\n");
    var blob=new Blob(["\ufeff"+lines],{type:"text/csv;charset=utf-8"});
    downloadBlob(blob,filename);
  }
  function downloadBlob(blob,filename){
    var url=URL.createObjectURL(blob), link=document.createElement("a");
    link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  function moneyValue(value){return String(value==null?"":value).trim().replace(/[^0-9.-]/g,"");}
  function fileSlug(product){
    var base=String(product.title||"product").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
    return (base||"diamond-product")+"-"+String(product.id||"item").slice(-6).replace(/[^a-z0-9]/gi,"").toLowerCase();
  }
  function publicImage(value){
    if(!value)return "";
    return value.charAt(0)==="/"?location.origin+value:value;
  }
  function exportProduct(format){
    var product;try{product=buildProduct();}catch(error){status("piSaveStatus",error.message,"error");return;}
    var images=[product.image].concat(product.images||[]).filter(Boolean).filter(function(value,index,array){return array.indexOf(value)===index;}).map(publicImage);
    var file=fileSlug(product);
    if(format==="shopify"){
      var headers=["URL handle","Title","Description","Vendor","Product category","Type","Tags","Published on online store","Status","SKU","Option1 name","Option1 value","Price","Compare-at price","Inventory quantity","Product image URL","Image position","Image alt text","SEO title","SEO description"];
      var statusValue=product.active?"active":"draft";
      var first=[file,product.title,product.description,product.brand,"",product.category,(product.tags||[]).join(", "),product.active?"true":"false",statusValue,product.sku,"Title","Default Title",moneyValue(product.price),moneyValue(product.oldPrice),product.stock==null?"":product.stock,images[0]||"",images.length?1:"",product.imageAlt,product.seoTitle||product.title.slice(0,70),product.seoDescription||product.description.slice(0,320)];
      var rows=[first];
      for(var i=1;i<images.length;i+=1){var row=new Array(headers.length).fill("");row[0]=file;row[15]=images[i];row[16]=i+1;row[17]=product.imageAlt;rows.push(row);}
      downloadCsv(headers,rows,file+"-shopify.csv");
      status("piSaveStatus","تم تنزيل ملف Shopify CSV. راجع العملة والتصنيف قبل استيراده في Shopify.","success");return;
    }
    if(format==="dsers"){
      if(!product.sku){status("piSaveStatus","أدخل رمز SKU قبل تنزيل ملف DSers؛ هذا الحقل مطلوب في قالبهم.","error");return;}
      var dsersHeaders=["Product ID","SKU","Supplier URL","SKU (Supplier SKU)"];
      var dsersRow=[product.id,product.sku,product.sourceUrl||"",product.supplierSku||""];
      downloadCsv(dsersHeaders,[dsersRow],file+"-dsers.csv");
      status("piSaveStatus","تم تنزيل ملف DSers. ارفعه من CSV Upload ثم Product، وأكمل مطابقة المورد داخل DSers.","success");return;
    }
    if(format==="woo"){
      var wooHeaders=["Type","SKU","Name","Published","Is featured?","Visibility in catalog","Short description","Description","Regular price","Sale price","In stock?","Stock","Categories","Tags","Images","External URL","meta:seo_title","meta:seo_description"];
      var wooRow=["simple",product.sku,product.title,product.active?"1":"-1",product.featured?"1":"0",product.active?"visible":"hidden",product.description.slice(0,300),product.description,moneyValue(product.price),moneyValue(product.oldPrice),(product.availability==="unavailable"||product.stock===0)?"0":"1",product.stock==null?"":product.stock,String(product.category||"").replace(/,/g,"\\,"),(product.tags||[]).join(", "),images.join(", "),product.url||"",product.seoTitle||product.title,product.seoDescription||product.description];
      downloadCsv(wooHeaders,[wooRow],file+"-woocommerce.csv");
      status("piSaveStatus","تم تنزيل ملف WooCommerce CSV. راجع الحقول في شاشة المطابقة قبل التشغيل.","success");return;
    }
    if(format==="genericCsv"){
      var genericHeaders=["title","description","short_description","category","brand","sku","price","old_price","currency","stock","availability","featured","image","images","videos","highlights","specifications","tags","seo_title","seo_description","source_url","product_url"];
      var genericRow=[product.title,product.description,product.description.slice(0,240),product.category,product.brand,product.sku,product.price,product.oldPrice,product.currency,product.stock==null?"":product.stock,product.availability,product.featured?"true":"false",publicImage(product.image),images.join(" | "),(product.videos||[]).map(publicImage).join(" | "),(product.highlights||[]).join(" | "),(product.specifications||[]).map(function(item){return item.name+": "+item.value;}).join(" | "),(product.tags||[]).join(" | "),product.seoTitle||product.title,product.seoDescription||product.description,product.sourceUrl,product.url];
      downloadCsv(genericHeaders,[genericRow],file+"-generic.csv");
      status("piSaveStatus","تم تنزيل CSV عام. طابق الأعمدة مع نموذج الاستيراد في منصتك.","success");return;
    }
    var blob=new Blob(["\ufeff",JSON.stringify(product,null,2)],{type:"application/json;charset=utf-8"});
    downloadBlob(blob,file+".json");
    status("piSaveStatus","تم تنزيل بيانات المنتج بصيغة JSON عامة.","success");
  }
  function auditProduct(){
    var title=form.elements.title.value.trim(), description=form.elements.description.value.trim();
    var image=safeUrl(form.elements.image.value,true), alt=form.elements.imageAlt.value.trim();
    var price=form.elements.price.value.trim(), currency=form.elements.currency.value.trim();
    var sku=form.elements.sku.value.trim(), category=form.elements.category.value.trim();
    var highlights=splitLines(form.elements.highlights.value,20), specs=splitLines(form.elements.specifications.value,32);
    var tags=form.elements.tags.value.split(/[،,]/).map(function(x){return x.trim();}).filter(Boolean);
    var duplicate=currentProducts.some(function(item){return (sku&&item.sku&&sku.toLowerCase()===String(item.sku).toLowerCase())|| (title&&title.toLowerCase()===String(item.title||"").trim().toLowerCase());});
    var checks=[
      ["عنوان المنتج واضح ومحدد",title.length>=12&&title.length<=80],
      ["عنوان SEO قصير وواضح",form.elements.seoTitle.value.trim().length>0&&form.elements.seoTitle.value.trim().length<=70],
      ["وصف SEO مكتوب وموجز",form.elements.seoDescription.value.trim().length>=50&&form.elements.seoDescription.value.trim().length<=320],
      ["وصف المنتج مكتمل",description.length>=60],
      ["القسم محدد",!!category],
      ["صورة رئيسية موجودة",!!image],
      ["النص البديل للصورة مكتوب",!!alt],
      ["السعر والعملة محددان",!!price&&!!currency],
      ["رمز SKU موجود",!!sku],
      ["أضفت ميزتين أو أكثر",highlights.length>=2],
      ["أضفت مواصفات أو ضمانًا",specs.length>0||!!form.elements.warranty.value.trim()],
      ["أضفت وسومًا مناسبة",tags.length>0],
      ["لا يوجد تطابق واضح مع منتج سابق",!duplicate]
    ];
    var passed=checks.filter(function(item){return item[1];}).length;
    $("piAuditScore").textContent=Math.round(passed/checks.length*100)+"%";
    var list=$("piAuditList");list.textContent="";
    checks.forEach(function(item){
      var row=document.createElement("div");row.className="pi-audit-item "+(item[1]?"ok":"warn");
      var icon=document.createElement("span");icon.textContent=item[1]?"✓":"•";
      var label=document.createElement("span");label.textContent=item[0];
      row.appendChild(icon);row.appendChild(label);list.appendChild(row);
    });
  }
  function calculatePrice(){
    var cost=Number($("piCost").value), margin=Number($("piMargin").value), tax=Number($("piTax").value);
    if(!Number.isFinite(cost)||cost<=0||!Number.isFinite(margin)||margin<0||margin>=90||!Number.isFinite(tax)||tax<0||tax>100){
      status("piPricingStatus","أدخل تكلفة أكبر من صفر، وهامشًا أقل من 90%، وضريبة بين 0 و100%.","error");return;
    }
    var suggested=cost/(1-margin/100)*(1+tax/100);
    form.elements.price.value=suggested.toFixed(2);
    status("piPricingStatus","السعر المقترح "+suggested.toFixed(2)+" "+(form.elements.currency.value.trim()||"ر.س")+"؛ التكلفة والهامش لا يُحفظان.","success");
    updatePreview();
  }
  function generateSku(){
    if(form.elements.sku.value.trim()&&!window.confirm("استبدال رمز SKU الحالي؟"))return;
    form.elements.sku.value="DMD-"+Date.now().toString(36).toUpperCase().slice(-8);
    updatePreview();
  }
  function generateTags(){
    var text=[form.elements.title.value,form.elements.brand.value,form.elements.category.value].join(" ");
    var words=text.split(/[\s،,|/]+/).map(function(value){return value.trim();}).filter(function(value){return value.length>2;});
    var tags=Array.from(new Set(words)).slice(0,10);
    form.elements.tags.value=tags.join("، ");
    updatePreview();
  }
  function generateAlt(){
    var title=form.elements.title.value.trim(), category=form.elements.category.value.trim();
    if(!title){status("piSaveStatus","اكتب اسم المنتج أولًا.","error");return;}
    form.elements.imageAlt.value=title+(category?" من قسم "+category:"");
    updatePreview();
  }
  function formatDescription(){
    var description=form.elements.description.value.trim();
    var highlights=splitLines(form.elements.highlights.value,16);
    if(!description&&!highlights.length){status("piSaveStatus","أضف وصفًا أو مميزات مؤكدة قبل التنسيق.","error");return;}
    var parts=[];
    if(description)parts.push(description);
    if(highlights.length&&!description.includes(highlights[0]))parts.push("أبرز المميزات:\n"+highlights.map(function(item){return "• "+item;}).join("\n"));
    form.elements.description.value=parts.join("\n\n").slice(0,1200);
    updatePreview();
    status("piSaveStatus","نُسّق الوصف باستخدام المعلومات التي أدخلتها فقط. راجعه قبل النشر.","success");
  }
  function updatePreview(){
    var title=form.elements.title.value.trim(), description=form.elements.description.value.trim();
    $("piPreviewTitle").textContent=title||"اسم المنتج";
    $("piPreviewDescription").textContent=description||"سيظهر وصف المنتج هنا.";
    $("piPreviewCategory").textContent=form.elements.category.value.trim()||"القسم";
    var price=form.elements.price.value.trim(), currency=form.elements.currency.value.trim()||"ر.س";
    $("piPreviewPrice").textContent=price?price+" "+currency:"السعر غير محدد";
    $("piPreviewSeoTitle").textContent=form.elements.seoTitle.value.trim()||title||"سيظهر عنوان الصفحة";
    $("piPreviewSeoDescription").textContent=form.elements.seoDescription.value.trim()||description.slice(0,160)||"سيظهر وصف الصفحة هنا.";
    var image=safeUrl(form.elements.image.value,true), box=$("piPreviewImage");
    box.innerHTML="";
    if(image){var img=document.createElement("img");img.src=image;img.alt=form.elements.imageAlt.value.trim()||title||"صورة المنتج";box.appendChild(img);}
    else{var span=document.createElement("span");span.textContent="صورة المنتج";box.appendChild(span);}
    var tags=form.elements.tags.value.split(/[،,]/).map(function(value){return value.trim();}).filter(Boolean).slice(0,8);
    $("piPreviewTags").innerHTML="";
    tags.forEach(function(tag){var chip=document.createElement("span");chip.textContent=tag;$("piPreviewTags").appendChild(chip);});
    auditProduct();
  }
  async function fileToBase64(file){
    var reader=new FileReader();
    return await new Promise(function(resolve,reject){
      reader.onload=function(){resolve(String(reader.result).split(",")[1]||"");};
      reader.onerror=function(){reject(new Error("تعذّرت قراءة الملف المختار."));};
      reader.readAsDataURL(file);
    });
  }
  async function uploadMedia(kind){
    if(!connected){status("piMediaStatus","اتصل بالمتجر أولًا لرفع الملفات.","error");return;}
    if(mediaBusy||busy)return;
    var input=kind==="image"?$("piImageFiles"):$("piVideoFiles");
    var files=Array.from(input.files||[]);
    if(!files.length){status("piMediaStatus","اختر ملفًا واحدًا على الأقل.","error");return;}
    var formItems=kind==="image"?[form.elements.image.value.trim()].concat(splitLines(form.elements.images.value,20)).filter(Boolean):splitLines(form.elements.videos.value,20);
    var maxCount=kind==="image"?8:2;
    if(formItems.length+files.length>maxCount){status("piMediaStatus",kind==="image"?"الحد الأقصى 8 صور للمنتج.":"الحد الأقصى فيديوهان للمنتج.","error");return;}
    mediaBusy=true;
    $("piUploadImages").disabled=true;$("piUploadVideos").disabled=true;
    var uploaded=[];
    try{
      for(var i=0;i<files.length;i+=1){
        var file=files[i], validType=kind==="image"?/^image\/(png|jpeg|webp|avif)$/.test(file.type):/^video\/(mp4|webm)$/.test(file.type);
        var maxSize=kind==="image"?4*1024*1024:15*1024*1024;
        if(!validType||file.size>maxSize)throw new Error(kind==="image"?"اختر صورة PNG أو JPG أو WebP أو AVIF حتى 4 ميغابايت.":"اختر فيديو MP4 أو WebM حتى 15 ميغابايت.");
        var filename=file.name.replace(/[^a-zA-Z0-9._-]/g,"-").replace(/^\.+/,"").slice(-70)||("product-media"+(kind==="image"?".png":".mp4"));
        var path="assets/products/"+(kind==="image"?"image-":"video-")+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7)+"-"+filename;
        status("piMediaStatus","جارٍ رفع الملف "+(i+1)+" من "+files.length+"…");
        await github("/contents/"+path.split("/").map(encodeURIComponent).join("/"),{method:"PUT",body:{message:"store: upload product media",content:await fileToBase64(file),branch:BRANCH}});
        uploaded.push("/"+path);
        if(kind==="image"){
          if(!form.elements.image.value.trim())form.elements.image.value=uploaded[0];
          else form.elements.images.value=Array.from(new Set(splitLines(form.elements.images.value,20).concat([uploaded[uploaded.length-1]]))).join("\n");
        }else form.elements.videos.value=Array.from(new Set(splitLines(form.elements.videos.value,20).concat([uploaded[uploaded.length-1]]))).join("\n");
      }
      status("piMediaStatus","تم رفع "+uploaded.length+" ملف وإضافته إلى بيانات المنتج.","success");
      updatePreview();
    }catch(error){
      status("piMediaStatus",(uploaded.length?"تم رفع "+uploaded.length+" ملف؛ ":"")+ (error.message||"تعذّر رفع الوسائط."),"error");
      updatePreview();
    }finally{
      input.value="";mediaBusy=false;
      $("piUploadImages").disabled=!connected;$("piUploadVideos").disabled=!connected;
    }
  }
  function renderCategories(config){
    var categories=((config.storefront||{}).categories||[]).map(function(item){return item.name;}).filter(Boolean);
    $("piCategories").innerHTML=categories.map(function(name){var option=document.createElement("option");option.value=name;return option;}).reduce(function(html,option){return html+option.outerHTML;},"");
  }
  $("piConnect").addEventListener("click",async function(){
    token=$("piToken").value.trim();
    if(!token){status("piConnectionStatus","أدخل رمز الوصول.","error");return;}
    $("piConnect").disabled=true;status("piConnectionStatus","جارٍ الاتصال وقراءة إعدادات المتجر…");
    try{var result=await readConfig();connected=true;currentProducts=Array.isArray(result.config.products)?result.config.products.slice():[];renderCategories(result.config);$("piWorkspace").hidden=false;$("piSave").disabled=false;$("piImport").disabled=false;$("piUploadImages").disabled=false;$("piUploadVideos").disabled=false;$("piToken").value="";updatePreview();status("piConnectionStatus","تم الاتصال. المنتجات الحالية محفوظة قبل أي تعديل.","success");}
    catch(error){token="";connected=false;$("piToken").value="";status("piConnectionStatus",error.message||"فشل الاتصال.","error");}
    finally{$("piConnect").disabled=false;}
  });
  $("piCalculatePrice").addEventListener("click",calculatePrice);
  $("piGenerateSku").addEventListener("click",generateSku);
  $("piGenerateTags").addEventListener("click",generateTags);
  $("piGenerateAlt").addEventListener("click",generateAlt);
  $("piFormatDescription").addEventListener("click",formatDescription);
  $("piGenerateSeo").addEventListener("click",function(){
    var title=form.elements.title.value.trim(),description=form.elements.description.value.trim();
    if(!title||!description){status("piSaveStatus","أدخل اسم المنتج ووصفه أولًا.","error");return;}
    form.elements.seoTitle.value=title.slice(0,70);
    form.elements.seoDescription.value=description.slice(0,320);
    updatePreview();
  });
  $("piExportShopify").addEventListener("click",function(){exportProduct("shopify");});
  $("piExportWoo").addEventListener("click",function(){exportProduct("woo");});
  $("piExportDsers").addEventListener("click",function(){exportProduct("dsers");});
  $("piDsersOpen").addEventListener("click",openDsersImport);
  $("piExportGenericCsv").addEventListener("click",function(){exportProduct("genericCsv");});
  $("piExportGeneric").addEventListener("click",function(){exportProduct("json");});
  $("piUploadImages").addEventListener("click",function(){uploadMedia("image");});
  $("piUploadVideos").addEventListener("click",function(){uploadMedia("video");});
  $("piImport").addEventListener("click",importFromUrl);
  form.addEventListener("submit",publishProduct);
  form.addEventListener("reset",function(){setTimeout(updatePreview,0);});
  form.addEventListener("input",updatePreview);
  form.addEventListener("change",updatePreview);
})();