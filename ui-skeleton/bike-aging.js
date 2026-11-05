(()=>{'use strict';
/* Model-specific metal/body masks must be checked against each artwork before texture wear is enabled.
   Until verified masks exist, restrict gentle aging to the opaque silhouette of a transparent image.
   A fully opaque embedded picture is left unchanged rather than painting over empty garage space. */
const REG='motorcycle-skeleton-registrations-v1';
const source=new WeakMap(),modified=new WeakMap();
let serial=0;
function registrations(){try{return JSON.parse(localStorage.getItem(REG)||'{}')||{}}catch{return {}}}
function levelFor(r){
 if(!r)return 0;
 if(['0','1','2','3'].includes(String(r.wear)))return Number(r.wear);
 if(!Number.isSafeInteger(r.year)||r.year<1950)return 0;
 const age=Math.max(0,new Date().getFullYear()-r.year);
 return age<=2?0:age<=5?1:age<=10?2:3;
}
function getBikeImage(id){
 const slides=[...document.querySelectorAll('.showroom-slide')];
 if(id==='pcx125')return slides[0]?.querySelector('.motorcycle-hero');
 if(id==='sample-b')return slides[1]?.querySelector('.motorcycle-hero');
 const regs=registrations(),extra=Object.keys(regs).filter(key=>key!=='pcx125'&&key!=='sample-b'&&typeof regs[key]?.name==='string');
 const i=extra.indexOf(id);
 return i>=0?slides[i+2]?.querySelector('.motorcycle-hero'):null;
}
function clean(img){
 if(!img)return;
 const original=source.get(img);
 if(original&&img.src!==original)img.src=original;
 const blob=modified.get(img);if(blob){URL.revokeObjectURL(blob);modified.delete(img)}
 img.style.filter='';img.removeAttribute('data-wear-level');
}
function decode(src){
 return new Promise((resolve,reject)=>{
  const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('차량 그림을 읽지 못했어.'));
  img.src=src;
 });
}
function isTransparentBike(ctx,w,h){
 try{
  const points=[[1,1],[w-2,1],[1,h-2],[w-2,h-2]],samples=points.map(([x,y])=>ctx.getImageData(x,y,1,1).data[3]);
  return samples.filter(alpha=>alpha<24).length>=3;
 }catch{return false}
}
async function process(id){
 const token=++serial,r=registrations()[id],img=getBikeImage(id);if(!img)return;
 if(!source.has(img))source.set(img,img.src);
 clean(img);
 const level=levelFor(r);if(!level)return;
 const original=source.get(img);
 try{
  const picture=await decode(original);if(token!==serial)return;
  const w=picture.naturalWidth,h=picture.naturalHeight;
  if(!w||!h||w*h>3000000)return;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return;
  ctx.drawImage(picture,0,0,w,h);
  // Reject flat/opaque artwork; these files may include garage/background pixels.
  if(!isTransparentBike(ctx,w,h))return;
  ctx.globalCompositeOperation='source-atop';
  ctx.globalAlpha=[0,.05,.10,.17][level];
  ctx.fillStyle='#968d81';ctx.fillRect(0,0,w,h);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  // A transparent-alpha mask clips all fading inside the actual drawn bike.
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(token!==serial||!blob)return;
  const url=URL.createObjectURL(blob);
  modified.set(img,url);img.src=url;img.dataset.wearLevel=String(level);
 }catch{
  // Unsupported images are intentionally kept pristine; no invalid rust textures.
 }
}
function refresh(){
 const id=document.body.dataset.activeBike;if(id)process(id);
}
document.addEventListener('motorcycle:change',refresh);
document.addEventListener('motorcycle:appearance-changed',refresh);
document.addEventListener('motorcycle:vehicle-saved',refresh);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();