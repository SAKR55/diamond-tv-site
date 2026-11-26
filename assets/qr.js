/* مولّد QR (وضع البايت، إصدارات 1-10، مستويات L/M/Q/H) */
(function(g){
var ECC=[[7,10,15,20,26,18,20,24,30,18],[10,16,26,18,24,16,18,22,22,26],[13,22,18,26,18,24,18,22,20,24],[17,28,22,16,22,28,26,26,24,28]];
var BLK=[[1,1,1,1,1,2,2,2,2,4],[1,1,1,2,2,4,4,4,5,5],[1,1,2,2,4,4,6,6,8,8],[1,1,2,4,4,4,5,6,8,11]];
var FMT=[1,0,3,2];
function raw(v){var r=(16*v+128)*v+64;if(v>=2){var n=Math.floor(v/7)+2;r-=(25*n-10)*n-55;if(v>=7)r-=36}return r}
function dataCW(v,e){return Math.floor(raw(v)/8)-ECC[e][v-1]*BLK[e][v-1]}
function mul(x,y){var z=0;for(var i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z}
function rsDiv(deg){var r=[];for(var i=0;i<deg-1;i++)r.push(0);r.push(1);var root=1;for(var i=0;i<deg;i++){for(var j=0;j<r.length;j++){r[j]=mul(r[j],root);if(j+1<r.length)r[j]^=r[j+1]}root=mul(root,2)}return r}
function rsRem(data,div){var r=div.map(function(){return 0});data.forEach(function(b){var f=b^r.shift();r.push(0);div.forEach(function(c,i){r[i]^=mul(c,f)})});return r}
function bit(x,i){return((x>>>i)&1)!==0}
function make(text,eclName){var e={L:0,M:1,Q:2,H:3}[eclName||'M'],bytes=[];var u=unescape(encodeURIComponent(text));for(var i=0;i<u.length;i++)bytes.push(u.charCodeAt(i));
 var v,cap;for(v=1;v<=10;v++){var cb=v<10?8:16;if(4+cb+bytes.length*8<=dataCW(v,e)*8)break}
 if(v>10)throw new Error('النص طويل جدًا لـ QR (الحد نحو 200 حرف)');
 var bits=[];function put(val,n){for(var i=n-1;i>=0;i--)bits.push((val>>>i)&1)}
 put(4,4);put(bytes.length,v<10?8:16);bytes.forEach(function(b){put(b,8)});var cap8=dataCW(v,e)*8;put(0,Math.min(4,cap8-bits.length));while(bits.length%8)bits.push(0);for(var p=0xEC;bits.length<cap8;p^=0xEC^0x11)put(p,8);
 var data=[];for(var i=0;i<bits.length;i+=8){var b=0;for(var j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b)}
 var nb=BLK[e][v-1],el=ECC[e][v-1],rc=Math.floor(raw(v)/8),ns=nb-rc%nb,sl=Math.floor(rc/nb),blocks=[],k=0,div=rsDiv(el);
 for(var i=0;i<nb;i++){var d=data.slice(k,k+sl-el+(i<ns?0:1));k+=d.length;var ec=rsRem(d,div);if(i<ns)d.push(0);blocks.push(d.concat(ec))}
 var all=[];for(var i=0;i<blocks[0].length;i++)blocks.forEach(function(bl,j){if(i!==sl-el||j>=ns)all.push(bl[i])});
 var size=v*4+17,M=[],F=[];for(var y=0;y<size;y++){M.push(new Array(size).fill(false));F.push(new Array(size).fill(false))}
 function sf(x,y,d){M[y][x]=d;F[y][x]=true}
 for(var i=0;i<size;i++){sf(6,i,i%2===0);sf(i,6,i%2===0)}
 function finder(x,y){for(var dy=-4;dy<=4;dy++)for(var dx=-4;dx<=4;dx++){var d=Math.max(Math.abs(dx),Math.abs(dy)),xx=x+dx,yy=y+dy;if(xx>=0&&xx<size&&yy>=0&&yy<size)sf(xx,yy,d!==2&&d!==4)}}
 finder(3,3);finder(size-4,3);finder(3,size-4);
 var ap=[];if(v>1){var na=Math.floor(v/7)+2,step=Math.ceil((v*4+4)/(na*2-2))*2;ap=[6];for(var pos=size-7;ap.length<na;pos-=step)ap.splice(1,0,pos)}
 for(var i=0;i<ap.length;i++)for(var j=0;j<ap.length;j++){if((i===0&&j===0)||(i===0&&j===ap.length-1)||(i===ap.length-1&&j===0))continue;for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++)sf(ap[i]+dx,ap[j]+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}
 function fmt(mask){var d=(FMT[e]<<3)|mask,r=d;for(var i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);var b=((d<<10)|r)^0x5412;
  for(var i=0;i<=5;i++)sf(8,i,bit(b,i));sf(8,7,bit(b,6));sf(8,8,bit(b,7));sf(7,8,bit(b,8));for(var i=9;i<15;i++)sf(14-i,8,bit(b,i));
  for(var i=0;i<8;i++)sf(size-1-i,8,bit(b,i));for(var i=8;i<15;i++)sf(8,size-15+i,bit(b,i));sf(8,size-8,true)}
 fmt(0);
 if(v>=7){var r=v;for(var i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);var b=(v<<12)|r;for(var i=0;i<18;i++){var a=size-11+i%3,c=Math.floor(i/3);sf(a,c,bit(b,i));sf(c,a,bit(b,i))}}
 var i2=0;for(var right=size-1;right>=1;right-=2){if(right===6)right=5;for(var vert=0;vert<size;vert++)for(var j=0;j<2;j++){var x=right-j,up=((right+1)&2)===0,y=up?size-1-vert:vert;if(!F[y][x]&&i2<all.length*8){M[y][x]=bit(all[i2>>>3],7-(i2&7));i2++}}}
 function mask(m){for(var y=0;y<size;y++)for(var x=0;x<size;x++){if(F[y][x])continue;var inv;switch(m){case 0:inv=(x+y)%2===0;break;case 1:inv=y%2===0;break;case 2:inv=x%3===0;break;case 3:inv=(x+y)%3===0;break;case 4:inv=(Math.floor(x/3)+Math.floor(y/2))%2===0;break;case 5:inv=x*y%2+x*y%3===0;break;case 6:inv=(x*y%2+x*y%3)%2===0;break;default:inv=((x+y)%2+x*y%3)%2===0}if(inv)M[y][x]=!M[y][x]}}
 function pen(){var s=0,dark=0;for(var y=0;y<size;y++){var run=1;for(var x=0;x<size;x++){if(M[y][x])dark++;if(x>0&&M[y][x]===M[y][x-1]){run++;if(run===5)s+=3;else if(run>5)s++}else run=1}}
  for(var x=0;x<size;x++){var run=1;for(var y=1;y<size;y++){if(M[y][x]===M[y-1][x]){run++;if(run===5)s+=3;else if(run>5)s++}else run=1}}
  for(var y=0;y<size-1;y++)for(var x=0;x<size-1;x++){var c=M[y][x];if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1])s+=3}
  var tot=size*size;s+=Math.floor(Math.abs(dark*20-tot*10)/tot)*10;return s}
 var best=0,bp=1e9;for(var m=0;m<8;m++){mask(m);fmt(m);var p=pen();if(p<bp){bp=p;best=m}mask(m)}
 mask(best);fmt(best);return M}
g.QR={make:make}})(window);
