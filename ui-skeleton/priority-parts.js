(()=>{'use strict';
const rows=document.querySelector('.rows');
const top=rows?.querySelector('.stock-part-container:not(.extra-stock-container)');
const extra=rows?.querySelector('.extra-stock-container');
if(!rows||!top||!extra)return;
const iconTool='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 7.2a5.3 5.3 0 0 1-7 6.8l-7.3 7.3-3.5-3.5 7.3-7.3a5.3 5.3 0 0 1 6.8-7l-3.3 3.3 3.7 3.7z"/></svg>';
const img=(svg)=>'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
const artworks={oilFilter:img("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><linearGradient id=\"metal\" x2=\"1\" y2=\".25\"><stop stop-color=\"#474f58\"/><stop offset=\".22\" stop-color=\"#bfc9d2\"/><stop offset=\".45\" stop-color=\"#f6f8fb\"/><stop offset=\".68\" stop-color=\"#8c9ca8\"/><stop offset=\"1\" stop-color=\"#343f4a\"/></linearGradient><linearGradient id=\"paper\" x2=\"1\"><stop stop-color=\"#ded2af\"/><stop offset=\".48\" stop-color=\"#fff6d7\"/><stop offset=\"1\" stop-color=\"#b9ad8c\"/></linearGradient><filter id=\"shadow\"><feGaussianBlur stdDeviation=\"3\"/></filter></defs><rect width=\"100\" height=\"100\" fill=\"#f7f7f7\"/><ellipse cx=\"51\" cy=\"86\" rx=\"34\" ry=\"5\" fill=\"#7b8999\" opacity=\".24\" filter=\"url(#shadow)\"/><g transform=\"rotate(-15 50 50)\"><rect x=\"30\" y=\"24\" width=\"42\" height=\"58\" rx=\"9\" fill=\"url(#metal)\" stroke=\"#64717e\" stroke-width=\"1.5\"/><rect x=\"33\" y=\"32\" width=\"36\" height=\"40\" rx=\"3\" fill=\"url(#paper)\"/><path d=\"M37 34v36m5-36v36m5-36v36m5-36v36m5-36v36m5-36v36m5-36v36\" stroke=\"#b5a684\" stroke-width=\"1.2\" opacity=\".9\"/><ellipse cx=\"51\" cy=\"24\" rx=\"21\" ry=\"8\" fill=\"url(#metal)\" stroke=\"#687785\" stroke-width=\"1.7\"/><ellipse cx=\"51\" cy=\"24\" rx=\"10\" ry=\"4\" fill=\"#37434d\" stroke=\"#d5dde5\" stroke-width=\"2\"/><ellipse cx=\"51\" cy=\"81\" rx=\"20\" ry=\"6\" fill=\"#7e8a96\" stroke=\"#44515e\" stroke-width=\"1.3\"/></g></svg>"),fuelFilter:img("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><linearGradient id=\"c\" x2=\"1\" y2=\".24\"><stop stop-color=\"#47545f\"/><stop offset=\".25\" stop-color=\"#b7c4cd\"/><stop offset=\".55\" stop-color=\"#eff3f6\"/><stop offset=\".77\" stop-color=\"#8a9ba7\"/><stop offset=\"1\" stop-color=\"#38434b\"/></linearGradient><filter id=\"s\"><feGaussianBlur stdDeviation=\"3\"/></filter></defs><rect width=\"100\" height=\"100\" fill=\"#f7f7f7\"/><ellipse cx=\"51\" cy=\"83\" rx=\"34\" ry=\"5\" fill=\"#596c7c\" opacity=\".24\" filter=\"url(#s)\"/><g transform=\"rotate(-31 50 50)\"><path d=\"M42 9h16v14H42z\" fill=\"#6b7780\" stroke=\"#3d4b57\" stroke-width=\"2\"/><rect x=\"29\" y=\"23\" width=\"42\" height=\"56\" rx=\"17\" fill=\"url(#c)\" stroke=\"#667886\" stroke-width=\"2\"/><rect x=\"34\" y=\"34\" width=\"32\" height=\"32\" rx=\"5\" fill=\"#e8e0c7\" stroke=\"#8c9aa3\" stroke-width=\"1.5\"/><path d=\"M39 36v27m5-27v27m5-27v27m5-27v27m5-27v27\" stroke=\"#a2a698\" stroke-width=\"1.5\"/><rect x=\"39\" y=\"73\" width=\"22\" height=\"12\" rx=\"3\" fill=\"url(#c)\" stroke=\"#51616e\" stroke-width=\"1.5\"/><rect x=\"43\" y=\"84\" width=\"14\" height=\"9\" rx=\"2\" fill=\"#7f8990\" stroke=\"#485664\" stroke-width=\"1.7\"/></g></svg>"),chain:img("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><radialGradient id=\"g\"><stop stop-color=\"#e1e7ee\"/><stop offset=\".56\" stop-color=\"#798792\"/><stop offset=\"1\" stop-color=\"#303a45\"/></radialGradient><filter id=\"s\"><feGaussianBlur stdDeviation=\"2.5\"/></filter></defs><rect width=\"100\" height=\"100\" fill=\"#f7f7f7\"/><ellipse cx=\"50\" cy=\"87\" rx=\"39\" ry=\"5\" fill=\"#6a7787\" opacity=\".24\" filter=\"url(#s)\"/><g transform=\"translate(0 2)\"><circle cx=\"31\" cy=\"39\" r=\"22\" fill=\"url(#g)\" stroke=\"#424d58\" stroke-width=\"3\"/><circle cx=\"31\" cy=\"39\" r=\"12\" fill=\"#e5e9ec\" stroke=\"#5c6976\" stroke-width=\"2\"/><circle cx=\"31\" cy=\"39\" r=\"5\" fill=\"#4b5660\"/><circle cx=\"70\" cy=\"55\" r=\"19\" fill=\"url(#g)\" stroke=\"#364653\" stroke-width=\"3\"/><circle cx=\"70\" cy=\"55\" r=\"9\" fill=\"#dce4ea\" stroke=\"#647482\" stroke-width=\"2\"/><circle cx=\"70\" cy=\"55\" r=\"3.5\" fill=\"#4b5967\"/><path d=\"M20 63C35 81 61 84 84 63L83 42C70 19 42 14 27 19\" fill=\"none\" stroke=\"#202933\" stroke-width=\"8\" stroke-linecap=\"round\" stroke-dasharray=\"6 3\"/><path d=\"M20 63C35 81 61 84 84 63L83 42C70 19 42 14 27 19\" fill=\"none\" stroke=\"#7b8792\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-dasharray=\"3 6\"/></g></svg>"),drive:img("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><radialGradient id=\"m\"><stop stop-color=\"#f0f4f7\"/><stop offset=\".4\" stop-color=\"#aab4bf\"/><stop offset=\"1\" stop-color=\"#454f5c\"/></radialGradient><filter id=\"blur\"><feGaussianBlur stdDeviation=\"2.5\"/></filter></defs><rect width=\"100\" height=\"100\" fill=\"#f7f7f7\"/><ellipse cx=\"49\" cy=\"85\" rx=\"37\" ry=\"6\" fill=\"#677685\" opacity=\".25\" filter=\"url(#blur)\"/><g transform=\"translate(-3 5)\"><path d=\"M20 31C35 18 62 17 79 36L68 54C49 43 32 47 24 61L14 51Z\" fill=\"#252c34\" stroke=\"#5c6874\" stroke-width=\"3\"/><path d=\"M26 34C45 25 61 26 75 40\" stroke=\"#aeb6c0\" stroke-width=\"2\" fill=\"none\"/><circle cx=\"34\" cy=\"55\" r=\"23\" fill=\"url(#m)\" stroke=\"#485461\" stroke-width=\"2.6\"/><circle cx=\"34\" cy=\"55\" r=\"13\" fill=\"#a5b1bc\" stroke=\"#5c6775\" stroke-width=\"2\"/><circle cx=\"34\" cy=\"55\" r=\"5\" fill=\"#303f4d\" stroke=\"#e2ebf0\" stroke-width=\"1.4\"/><g fill=\"url(#m)\" stroke=\"#54616e\" stroke-width=\"2\"><circle cx=\"76\" cy=\"48\" r=\"9\"/><circle cx=\"76\" cy=\"68\" r=\"9\"/><circle cx=\"58\" cy=\"76\" r=\"9\"/></g></g></svg>")};
function add(id,label,src,interval){
 const row=document.createElement('article');row.className='part stock-part';row.dataset.partId=id;row.dataset.interval=String(interval||0);
 const picture=document.createElement('div');picture.className='part-img stock-picture';
 const image=document.createElement('img');image.className='stock-part-photo';image.src=src;image.alt=label;
 picture.appendChild(image);
 const body=document.createElement('div');body.className='part-body';
 const titleLine=document.createElement('div');titleLine.className='part-line';
 const title=document.createElement('strong');title.textContent=label;
 const text=document.createElement('span');text.textContent='기록 없음';
 titleLine.append(title,text);
 const gauge=document.createElement('div');gauge.className='gauge';
 const fill=document.createElement('div');fill.className='gauge-fill blue';fill.style.width='0%';gauge.appendChild(fill);
 body.append(titleLine,gauge);
 const button=document.createElement('div');button.className='service blue';button.innerHTML=iconTool;
 row.append(picture,body,button);top.appendChild(row);return row;
}
const existing=()=>[...rows.querySelectorAll('.part:not(.part-add-card)')];
const byId=id=>existing().find(el=>el.dataset.partId===id);
function label(id,name){const row=byId(id);if(row)row.querySelector('.part-line strong').textContent=name}
const tireSource=byId('tire')?.querySelector('.part-img img')?.getAttribute('src')||'../assets/tire.webp';
add('oil-filter','오일필터',artworks.oilFilter,0);
add('rear-tire','뒷타이어',tireSource,10000);
add('front-tire','앞타이어',tireSource,10000);
add('drive-system-service','구동계(벨트,무브볼)',artworks.drive,0);
add('chain-sprockets','체인 및 대소기어',artworks.chain,0);
add('fuel-filter','연료필터',artworks.fuelFilter,0);
label('gear-oil','구동계오일(미션오일)');
label('spark-plug','스파크 플러그');
label('brake-fluid','브레이크 오일');
label('tire','타이어 (기존 통합 기록)');
const priority=['oil','oil-filter','filter','brake','gear-oil','rear-tire','front-tire','drive-system-service','coolant','chain-sprockets','spark-plug','fuel-filter','brake-fluid'];
const prioritySet=new Set(priority),customRoot=extra.querySelector('.custom-part-container');
for(const id of priority){const el=byId(id);if(el)top.appendChild(el)}
for(const row of existing()){if(prioritySet.has(row.dataset.partId))continue;if(!extra.contains(row))extra.insertBefore(row,customRoot||null)}
const key='motorcycle-skeleton-part-order-v1',migration='motorcycle-skeleton-priority-layout-v1';
try{
 const raw=localStorage.getItem(key),orders=raw?JSON.parse(raw):{},migrated=JSON.parse(localStorage.getItem(migration)||'{}');
 const bikes=new Set(['pcx125','sample-b',...Object.keys(orders)]);
 let dirty=false;
 for(const bike of bikes){
  if(migrated[bike])continue;
  const saved=orders[bike]||{};
  const oldOrder=[...(saved.top||saved.base||[]),...(saved.standard||[]),...(saved.extra||[]),...(saved.custom||[])];
  const currentExtras=existing().filter(row=>!prioritySet.has(row.dataset.partId)).map(row=>row.dataset.partId);
  const extraIds=[...new Set([...oldOrder,...currentExtras])].filter(id=>!prioritySet.has(id));
  orders[bike]={top:[...priority],extra:extraIds};
  migrated[bike]=true;dirty=true;
 }
 if(dirty){localStorage.setItem(key,JSON.stringify(orders));localStorage.setItem(migration,JSON.stringify(migrated))}
}catch(err){console.warn('기본 정비 카드 순서 저장 실패',err)}
document.dispatchEvent(new CustomEvent('motorcycle:custom-parts-change'));
})();