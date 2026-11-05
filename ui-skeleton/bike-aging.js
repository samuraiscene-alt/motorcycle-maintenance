(()=>{'use strict';
/* Seven year-based wear stages and a shared, verified-part-mask library.
   Untagged motorcycle images retain their original artwork; no invented rust/damage spots. */
const REG='motorcycle-skeleton-registrations-v1';
const originals=new WeakMap(),activeUrls=new WeakMap();
let serial=0;
function registrations(){try{return JSON.parse(localStorage.getItem(REG)||'{}')||{}}catch{return {}}}
function findImage(id){
 const slides=[...document.querySelectorAll('.showroom-slide')];
 if(id==='pcx125')return slides[0]?.querySelector('.motorcycle-hero');
 if(id==='sample-b')return slides[1]?.querySelector('.motorcycle-hero');
 const regs=registrations(),extra=Object.keys(regs).filter(k=>k!=='pcx125'&&k!=='sample-b'&&typeof regs[k]?.name==='string');
 const n=extra.indexOf(id);return n<0?null:slides[n+2]?.querySelector('.motorcycle-hero');
}
function original(img){if(!originals.has(img))originals.set(img,img.src);return originals.get(img)}
function clean(img){
 if(!img)return;const src=original(img),url=activeUrls.get(img);
 if(img.src!==src)img.src=src;
 if(url){activeUrls.delete(img);URL.revokeObjectURL(url)}
 img.removeAttribute('data-wear-stage');img.removeAttribute('data-wear-status');
}
function decode(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src})}
function hasTransparentEdges(ctx,w,h){
 if(w<4||h<4)return false;
 try{return [[1,1],[w-2,1],[1,h-2],[w-2,h-2]].filter(([x,y])=>ctx.getImageData(x,y,1,1).data[3]<24).length>=3}catch{return false}
}
async function process(id){
 const token=++serial,registration=registrations()[id],img=findImage(id);
 if(!img)return;clean(img);
 const library=window.MotorcycleWearLibrary,profile=library?.profile(registration?.year);
 if(!profile||profile.stage===0){img.dataset.wearStatus='original';return}
 try{
  const loaded=await decode(original(img));if(token!==serial)return;
  const w=loaded.naturalWidth,h=loaded.naturalHeight;
  if(!w||!h||w*h>3000000)return;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return;
  ctx.drawImage(loaded,0,0,w,h);
  // Only reviewed region maps activate shared scratches and rust.
  const painted=library.draw(ctx,id,registration.year,w,h);
  if(!painted){
   img.dataset.wearStatus='no-verified-mask';
   return;
  }
  // Even a verified polygon must never paint an opaque garage picture.
  // The verified model mask's source image must have transparent outside pixels.
  if(!hasTransparentEdges(ctx,w,h)){img.dataset.wearStatus='unsafe-opaque-source';return}
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(token!==serial||!blob)return;
  const url=URL.createObjectURL(blob);activeUrls.set(img,url);img.src=url;
  img.dataset.wearStage=String(profile.stage);img.dataset.wearStatus='part-masked';
 }catch{img.dataset.wearStatus='unavailable'}
}
function refresh(){const id=document.body.dataset.activeBike;if(id)process(id)}
document.addEventListener('motorcycle:change',refresh);
document.addEventListener('motorcycle:appearance-changed',refresh);
document.addEventListener('motorcycle:vehicle-saved',refresh);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();