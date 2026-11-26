/* تحميل صور بكل الصيغ: JPG PNG GIF WEBP AVIF BMP ICO SVG TIFF (+HEIC عند دعم المتصفح) */
(function(g){
function tiff(buf){var dv=new DataView(buf),le=dv.getUint16(0)===0x4949;function u16(o){return dv.getUint16(o,le)}function u32(o){return dv.getUint32(o,le)}
 if(u16(2)!==42)throw new Error('TIFF غير صالح');var ifd=u32(4),n=u16(ifd),T={};
 for(var i=0;i<n;i++){var e=ifd+2+i*12,tag=u16(e),ty=u16(e+2),c=u32(e+4),sz=ty===3?2:ty===4?4:1,vo=sz*c<=4?e+8:u32(e+8),a=[];for(var k=0;k<c&&k<100000;k++)a.push(ty===3?u16(vo+2*k):ty===4?u32(vo+4*k):dv.getUint8(vo+k));T[tag]=a}
 var w=T[256][0],h=T[257][0],spp=(T[277]||[1])[0],bps=(T[258]||[8])[0],comp=(T[259]||[1])[0],ph=(T[262]||[2])[0],pred=(T[317]||[1])[0],rps=(T[278]||[h])[0];
 if(bps!==8)throw new Error('TIFF بعمق غير 8 بت غير مدعوم — احفظه كـ PNG أو JPG');if((T[284]||[1])[0]!==1)throw new Error('TIFF مفصول القنوات غير مدعوم');
 var off=T[273],cnt=T[279]||[buf.byteLength-off[0]],rowB=w*spp,raw=new Uint8Array(rowB*h),rp=0;
 for(var s=0;s<off.length;s++){var src=new Uint8Array(buf,off[s],cnt[s]),rows=Math.min(rps,h-s*rps),need=rows*rowB,d;
  if(comp===1)d=src.subarray(0,need);else if(comp===32773)d=packbits(src,need);else if(comp===5)d=lzw(src,need);else throw new Error('ضغط TIFF غير مدعوم ('+comp+') — احفظه كـ PNG أو JPG');
  if(pred===2)for(var r=0;r<rows;r++)for(var x=spp;x<rowB;x++)d[r*rowB+x]=(d[r*rowB+x]+d[r*rowB+x-spp])&255;
  raw.set(d.subarray(0,need),rp);rp+=need}
 var out=new Uint8ClampedArray(w*h*4),pal=T[320],ex=(T[338]||[0])[0];
 for(var p=0;p<w*h;p++){var q=p*4,b=p*spp;
  if(ph===3&&pal){var ix=raw[b],L=pal.length/3;out[q]=pal[ix]>>8;out[q+1]=pal[L+ix]>>8;out[q+2]=pal[2*L+ix]>>8;out[q+3]=255}
  else if(spp>=3){out[q]=raw[b];out[q+1]=raw[b+1];out[q+2]=raw[b+2];out[q+3]=spp>=4&&ex?raw[b+3]:255}
  else{var v=ph===0?255-raw[b]:raw[b];out[q]=out[q+1]=out[q+2]=v;out[q+3]=spp===2?raw[b+1]:255}}
 return new ImageData(out,w,h)}
function packbits(s,len){var o=new Uint8Array(len),op=0,ip=0;while(ip<s.length&&op<len){var n=s[ip++];if(n<128){for(var i=0;i<=n&&op<len;i++)o[op++]=s[ip++]}else if(n>128){var v=s[ip++];for(var i=0;i<257-n&&op<len;i++)o[op++]=v}}return o}
function lzw(s,len){var o=new Uint8Array(len),op=0,pre=new Int32Array(4096),suf=new Uint8Array(4096),ln=new Int32Array(4096),nx,bits,bp=0,bb=0,bc=0,ip=0,prev=-1,stack=new Uint8Array(4097);
 function init(){nx=258;bits=9;for(var i=0;i<256;i++){pre[i]=-1;suf[i]=i;ln[i]=1}}
 function rd(){while(bc<bits){if(ip>=s.length)return 257;bb=(bb<<8)|s[ip++];bc+=8}var c=(bb>>>(bc-bits))&((1<<bits)-1);bc-=bits;bb&=(1<<bc)-1;return c}
 function str(code){var l=ln[code],i=l;while(code>=0&&i>0){stack[--i]=suf[code];code=pre[code]}return l}
 function first(code){while(pre[code]>=0)code=pre[code];return suf[code]}
 init();
 while(op<len){var c=rd();if(c===257)break;if(c===256){init();c=rd();if(c===257)break;var l=str(c);for(var i=0;i<l&&op<len;i++)o[op++]=stack[i];prev=c;continue}
  if(c<nx){var l=str(c);for(var i=0;i<l&&op<len;i++)o[op++]=stack[i];if(prev>=0&&nx<4096){pre[nx]=prev;suf[nx]=stack[0];ln[nx]=ln[prev]+1;nx++}}
  else{var f=first(prev);pre[nx]=prev;suf[nx]=f;ln[nx]=ln[prev]+1;nx++;var l=str(nx-1);for(var i=0;i<l&&op<len;i++)o[op++]=stack[i]}
  prev=c;if(nx>=2047)bits=12;else if(nx>=1023)bits=11;else if(nx>=511)bits=10}
 return o}
function svgSize(txt){var m=txt.match(/viewBox\s*=\s*["']\s*[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)/),w=txt.match(/<svg[^>]*\swidth\s*=\s*["']([\d.]+)/),h=txt.match(/<svg[^>]*\sheight\s*=\s*["']([\d.]+)/);return[+(w&&w[1])||(m&&+m[1])||1024,+(h&&h[1])||(m&&+m[2])||1024]}
function viaImg(url,fix){return new Promise(function(res,rej){var im=new Image();im.onload=function(){res(im)};im.onerror=function(){rej(new Error('تعذّر فك ترميز الصورة'))};im.src=url})}

async function pdfPage(f,max){var m=await import('/assets/vendor/pdfjs/pdf.min.mjs');m.GlobalWorkerOptions.workerSrc='/assets/vendor/pdfjs/pdf.worker.min.mjs';var doc=await m.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise,n=doc.numPages,pn=1;if(n>1){var a=prompt('الملف فيه '+n+' صفحة. أي صفحة تريد استيرادها؟ (1 – '+n+')','1');pn=Math.min(n,Math.max(1,parseInt(a,10)||1))}var pg=await doc.getPage(pn),v0=pg.getViewport({scale:1}),sc=Math.min(3,max/Math.max(v0.width,v0.height)),v=pg.getViewport({scale:sc}),c=document.createElement('canvas');c.width=Math.round(v.width);c.height=Math.round(v.height);var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);await pg.render({canvasContext:x,viewport:v}).promise;return c}
// يعيد {canvas, alpha}
g.loadImageFile=async function(f,max){max=max||2400;var n=(f.name||'').toLowerCase(),ext=(n.match(/\.([a-z0-9]+)$/)||[])[1]||'',t=f.type||'',src,w,h,alpha=!/jpe?g|jfif|bmp/.test(ext+t);
 try{
  if(ext==='tif'||ext==='tiff'||t==='image/tiff'){var id=tiff(await f.arrayBuffer()),c0=document.createElement('canvas');c0.width=id.width;c0.height=id.height;c0.getContext('2d').putImageData(id,0,0);src=c0;w=id.width;h=id.height}
  else if(ext==='pdf'||t==='application/pdf'){var pc=await pdfPage(f,max);src=pc;w=pc.width;h=pc.height;alpha=false}
  else if(ext==='svg'||t==='image/svg+xml'){var tx=await f.text(),sz=svgSize(tx);if(!/<svg[^>]*\swidth/.test(tx))tx=tx.replace(/<svg/,'<svg width="'+sz[0]+'" height="'+sz[1]+'"');var im=await viaImg('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(tx));src=im;w=im.naturalWidth||sz[0];h=im.naturalHeight||sz[1]}
  else{try{var bm=await createImageBitmap(f);src=bm;w=bm.width;h=bm.height}catch(e){var u=URL.createObjectURL(f);try{var im2=await viaImg(u);src=im2;w=im2.naturalWidth;h=im2.naturalHeight}catch(e2){if(/hei[cf]/.test(ext+t))throw new Error('صيغة HEIC/HEIF لا يدعمها هذا المتصفح — افتحها من سفاري، أو حوّلها لـ JPG من الجوال (الإعدادات ← الكاميرا ← التنسيقات ← الأكثر توافقًا)');throw new Error('صيغة الملف غير مدعومة في هذا المتصفح: '+(ext||t||'غير معروفة'))}finally{URL.revokeObjectURL(u)}}}
 }catch(e){throw e}
 var sc=Math.min(1,max/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*sc));c.height=Math.max(1,Math.round(h*sc));var x=c.getContext('2d');x.drawImage(src,0,0,c.width,c.height);return{canvas:c,alpha:alpha,w:w,h:h}};
g.imgError=function(msg){var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl';o.innerHTML='<div style="background:#fff;color:#1e1b4b;max-width:460px;border-radius:16px;padding:22px;font-family:inherit;line-height:1.9"><b style="font-size:1.1em">تعذّر فتح الصورة</b><p style="margin:8px 0"></p><p style="margin:8px 0;color:#475569;font-size:.92em">الصيغ المدعومة: JPG وPNG وGIF وWEBP وAVIF وBMP وICO وSVG وTIFF وPDF. إن كانت صورتك بصيغة HEIC (آيفون) فحوّلها إلى JPG أولًا أو ارفعها من متصفح سفاري على الجوال.</p><button style="background:#7c3aed;color:#fff;border:0;border-radius:10px;padding:10px 22px;font:inherit;font-weight:700;cursor:pointer">حسنًا</button></div>';o.querySelector('p').textContent=msg;o.querySelector('button').onclick=function(){o.remove()};document.body.appendChild(o)};
g.IMG_ACCEPT='image/*,.tif,.tiff,.avif,.svg,.bmp,.ico,.jfif,.webp,.gif,.jpg,.jpeg,.png,.pdf,application/pdf';
})(window);
