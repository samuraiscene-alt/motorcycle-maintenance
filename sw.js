const CACHE='motorcycle-maintenance-v2.9.125';
const ROOT=new URL('./',self.location.href);
const SHELL=new URL('./ui-skeleton/index.html',ROOT).href;
const PRECACHE=[
  SHELL,
  new URL('./ui-skeleton/garage-clean.png?v=5',ROOT).href,
  new URL('./ui-skeleton/cb125r-2025.svg?v=1',ROOT).href,
  new URL('./ui-skeleton/honda-cb125r-studio.png?v=111',ROOT).href,
  new URL('./ui-skeleton/honda-pcx125-studio.png?v=111',ROOT).href,
  new URL('./ui-skeleton/bike-placeholder.svg?v=109',ROOT).href,
  new URL('./ui-skeleton/cb650r-2024.svg?v=1',ROOT).href,
  new URL('./ui-skeleton/honda-cb650r-studio.png?v=116',ROOT).href,
  new URL('./ui-skeleton/honda-forza350-studio.png?v=117',ROOT).href,
  new URL('./ui-skeleton/honda-forza350-2022-studio.png?v=118',ROOT).href,
  new URL('./ui-skeleton/kawasaki-z900-2025-studio.png?v=119',ROOT).href,
  new URL('./ui-skeleton/kawasaki-z900-2024-studio.png?v=124',ROOT).href,
  new URL('./ui-skeleton/yamaha-nmax125-studio.png?v=125',ROOT).href,
  new URL('./ui-skeleton/yamaha-xmax300-studio.png?v=125',ROOT).href,
  new URL('./ui-skeleton/yamaha-xmax125-studio.png?v=125',ROOT).href,
  new URL('./ui-skeleton/yamaha-tmax560-studio.png?v=125',ROOT).href,
  new URL('./ui-skeleton/motorcycle.svg',ROOT).href,
  new URL('./ui-skeleton/alternate-scooter.svg',ROOT).href,
  new URL('./ui-skeleton/vehicle-catalog.js?v=filter-map-104',ROOT).href,
  new URL('./ui-skeleton/vehicle-data.js?v=yamaha-four-125',ROOT).href,
  new URL('./ui-skeleton/part-customize.js?v=accordion-order-3',ROOT).href,
  new URL('./ui-skeleton/priority-parts.js?v=priority-13-2',ROOT).href,
  new URL('./ui-skeleton/priority-images.js?v=studio-icons-4',ROOT).href,
  new URL('./ui-skeleton/part-swipe-edit.js?v=preview-height-20',ROOT).href,
  new URL('./ui-skeleton/backup-restore.js?v=backup-check-105',ROOT).href,
  new URL('./ui-skeleton/i18n.js?v=locale-scaffold-1',ROOT).href,
  new URL('./ui-skeleton/vehicle-management.js?v=first-use-103',ROOT).href,
  new URL('./ui-skeleton/version-check.js?v=app-version-425',ROOT).href,
  new URL('./ui-skeleton/wear-library.js?v=shared-materials-1',ROOT).href,
  new URL('./ui-skeleton/bike-aging.js?v=parts-safe-2',ROOT).href,
  new URL('./icon-bike-192.jpg',ROOT).href,
  new URL('./icon-bike-512.jpg',ROOT).href,
  new URL('./ui-skeleton/xmax300-transparent.svg?v=cutout-1',ROOT).href,
  new URL('./version.json',ROOT).href,
  new URL('./manifest.webmanifest',ROOT).href
];
self.addEventListener('install',event=>{
 // Only core files gate installation. A missing optional illustration must never block an update.
 // The garage background is essential. Refresh it independently; don't fail installation
 // if one optional asset is temporarily unreachable.
 event.waitUntil(caches.open(CACHE).then(async cache=>{
   const critical=[SHELL,new URL('./version.json',ROOT).href,new URL('./ui-skeleton/garage-clean.png?v=5',ROOT).href];
   await Promise.allSettled(critical.map(url=>cache.add(new Request(url,{cache:'reload'}))));
 }).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 // Retain one previous app version as an offline rollback, including its garage artwork.
 event.waitUntil(caches.keys().then(async keys=>{
   const older=keys.filter(key=>key.startsWith('motorcycle-maintenance-')&&key!==CACHE).sort();
   await Promise.all(older.slice(0,-1).map(key=>caches.delete(key)));
   await self.clients.claim();
 }));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith(ROOT.pathname))return;
 // Version checks and recovery pages always consult the network.
 if(url.pathname.endsWith('/version.json')||url.pathname.endsWith('/safe-refresh-111.html'))return;
 // Prefer fresh files on every online visit, fall back to previous app only when offline.
 const request=new Request(event.request,{cache:'no-store'});
 event.respondWith(fetch(request).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{}));}
   return response;
 }).catch(async()=>{
   const stored=await caches.match(event.request);
   if(stored)return stored;
   if(event.request.mode==='navigate')return caches.match(SHELL);
   return Response.error();
 }));
});
