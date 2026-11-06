const CACHE='motorcycle-maintenance-v2.9.28';
const ROOT=new URL('./',self.location.href);
const SHELL=new URL('./ui-skeleton/index.html',ROOT).href;
const PRECACHE=[
  SHELL,
  new URL('./ui-skeleton/vehicle-catalog.js?v=pcx-2021-2023-5',ROOT).href,
  new URL('./ui-skeleton/vehicle-data.js?v=calendar-maintenance-48-source-label',ROOT).href,
  new URL('./ui-skeleton/part-customize.js?v=accordion-order-3',ROOT).href,
  new URL('./ui-skeleton/priority-parts.js?v=priority-13-2',ROOT).href,
  new URL('./ui-skeleton/priority-images.js?v=studio-icons-4',ROOT).href,
  new URL('./ui-skeleton/part-swipe-edit.js?v=official-cycle-safe-12',ROOT).href,
  new URL('./ui-skeleton/backup-restore.js?v=browser-transfer-2-backupfix-298',ROOT).href,
  new URL('./ui-skeleton/i18n.js?v=locale-scaffold-1',ROOT).href,
  new URL('./ui-skeleton/vehicle-management.js?v=brand-model-picker-15-yearlink',ROOT).href,
  new URL('./ui-skeleton/version-check.js?v=app-version-328',ROOT).href,
  new URL('./ui-skeleton/wear-library.js?v=shared-materials-1',ROOT).href,
  new URL('./ui-skeleton/bike-aging.js?v=parts-safe-2',ROOT).href,
  new URL('./icon-bike-192.jpg',ROOT).href,
  new URL('./icon-bike-512.jpg',ROOT).href,
  new URL('./ui-skeleton/yamaha-garage-scene.svg?v=scene-1',ROOT).href,
  new URL('./version.json',ROOT).href,
  new URL('./manifest.webmanifest',ROOT).href
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(
   keys.filter(key=>key.startsWith('motorcycle-maintenance-')&&key!==CACHE).map(key=>caches.delete(key))
 )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith(ROOT.pathname))return;
 const request=event.request.mode==='navigate'?new Request(event.request,{cache:'no-store'}):event.request;
 event.respondWith(fetch(request).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}
   return response;
 }).catch(async()=>{
   const stored=await caches.match(event.request);
   if(stored)return stored;
   if(event.request.mode==='navigate')return caches.match(SHELL);
   return Response.error();
 }));
});
