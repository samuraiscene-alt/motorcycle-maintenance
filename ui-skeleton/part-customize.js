(()=>{'use strict';
const list=document.querySelector('.rows'),base=[...list.querySelectorAll('.part')];
const storageKey='motorcycle-skeleton-added-parts-v1';
const bikeId=()=>document.body.dataset.activeBike||'pcx125';
let registered={};try{const x=JSON.parse(localStorage.getItem(storageKey)||'{}');if(x&&typeof x==='object'&&!Array.isArray(x))registered=x}catch{}
let imageDb=null;const urls=new Map();
function db(){if(imageDb)return imageDb;imageDb=new Promise((resolve,reject)=>{if(!window.indexedDB){reject(new Error('이미지 저장을 지원하지 않는 환경이야.'));return}const req=indexedDB.open('motorcycle-skeleton-added-images-v1',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('images'))req.result.createObjectStore('images')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return imageDb}
async function storeImage(id,blob){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('images','readwrite');tx.objectStore('images').put(blob,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('사진 저장 실패'));tx.onabort=()=>reject(tx.error||new Error('사진 저장 중단'))})}
async function readImage(id){const d=await db();return new Promise((resolve,reject)=>{const req=d.transaction('images').objectStore('images').get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}
async function imageToBlob(file){if(!file||(!file.type.startsWith('image/')&&!/\.(png|jpe?g|webp|heic|heif)$/i.test(file.name)))throw new Error('그림 파일만 선택할 수 있어.');if(file.size>18*1024*1024)throw new Error('사진은 18MB 이하로 선택해.');const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();const ratio=Math.min(1,640/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.round(img.naturalWidth*ratio);canvas.height=Math.round(img.naturalHeight*ratio);const ctx=canvas.getContext('2d');if(!ctx)throw new Error('이미지를 변환할 수 없어.');ctx.drawImage(img,0,0,canvas.width,canvas.height);return await new Promise((resolve,reject)=>canvas.toBlob(x=>x?resolve(x):reject(new Error('사진 변환 실패')),'image/png'))}finally{URL.revokeObjectURL(url)}}
const ico='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 7.2a5.3 5.3 0 0 1-7 6.8l-7.3 7.3-3.5-3.5 7.3-7.3a5.3 5.3 0 0 1 6.8-7l-3.3 3.3 3.7 3.7z"/></svg>';
const standardParts=[
{id:'drive-belt',name:'구동벨트',symbol:'belt'},
{id:'weights',name:'웨이트롤러',symbol:'roller'},
{id:'spark-plug',name:'점화플러그',symbol:'plug'},
{id:'brake-fluid',name:'브레이크액',symbol:'fluid'},
{id:'gear-oil',name:'기어오일',symbol:'fluid'},
{id:'battery',name:'배터리',symbol:'battery'},
{id:'slide-piece',name:'슬라이드피스',symbol:'roller'}];
const extraParts=[
{id:'oil-strainer',name:'오일 거름망',symbol:'filter'},
{id:'valve-clearance',name:'밸브 간극 점검',symbol:'tool'},
{id:'engine-gasket',name:'엔진 가스켓',symbol:'filter'},
{id:'intake',name:'흡기 계통 점검',symbol:'tool'},
{id:'clutch-shoe',name:'클러치 슈',symbol:'brake'},
{id:'clutch-bell',name:'클러치 벨',symbol:'roller'},
{id:'drive-pulley',name:'구동 풀리',symbol:'roller'},
{id:'drive-bearing',name:'구동계 베어링',symbol:'roller'},
{id:'brake-disc',name:'브레이크 디스크',symbol:'brake'},
{id:'brake-caliper',name:'브레이크 캘리퍼',symbol:'brake'},
{id:'brake-hose',name:'브레이크 호스',symbol:'fluid'},
{id:'wheel-bearing',name:'휠 베어링',symbol:'roller'},
{id:'fork-oil',name:'앞 포크 오일·오일씰',symbol:'fluid'},
{id:'rear-shock',name:'뒤 쇼크업소버',symbol:'tool'},
{id:'steering-bearing',name:'스티어링 베어링',symbol:'roller'},
{id:'headlamp',name:'전조등·방향지시등',symbol:'battery'},
{id:'fuse',name:'퓨즈',symbol:'battery'},
{id:'starter',name:'시동·충전계통',symbol:'battery'},
{id:'coolant-hose',name:'냉각 호스',symbol:'fluid'},
{id:'thermostat',name:'서모스탯',symbol:'tool'},
{id:'water-pump',name:'워터펌프',symbol:'tool'},
{id:'fuel-pump',name:'연료펌프·인젝터',symbol:'tool'}];
const symbols={
belt:'<path d="M13 17c-5-5-9-5-9-2s7 7 13 10 14 1 13-4-9-9-17-4Z" fill="#252e3c" stroke="#798593" stroke-width="3"/><path d="M11 19c10 6 13 7 15 6" fill="none" stroke="#a8b8c7" stroke-width="2"/>',
roller:'<circle cx="21" cy="21" r="17" fill="#333a43" stroke="#8f9ba7" stroke-width="3"/><circle cx="21" cy="21" r="8" fill="#adb7c2" stroke="#424c56" stroke-width="3"/><circle cx="21" cy="21" r="3" fill="#455564"/>',
plug:'<path d="M16 6h10v8l-3 3v13h-4V17l-3-3Z" fill="#e6ebef" stroke="#697785" stroke-width="2"/><path d="M14 14h14m-14 5h14m-14 4h14" stroke="#6e7985" stroke-width="2"/><path d="M21 6V2m0 28v7m0-1h7" stroke="#555b65" stroke-width="3"/>',
fluid:'<rect x="10" y="10" width="22" height="26" rx="4" fill="#afc9c8" stroke="#526e7e" stroke-width="3"/><rect x="15" y="5" width="12" height="7" rx="2" fill="#303945"/><path d="M12 22h18v10H12Z" fill="#70aa8a" opacity=".9"/>',
battery:'<rect x="5" y="12" width="32" height="24" rx="4" fill="#272e38" stroke="#768995" stroke-width="3"/><path d="M13 9h6m5 0h6" stroke="#434b55" stroke-width="4"/><path d="M11 24h9m-4.5-4v8m10-4h7" stroke="#d4dde2" stroke-width="3"/>',
filter:'<rect x="6" y="11" width="31" height="24" rx="5" fill="#333740" stroke="#7d8b9a" stroke-width="3"/><path d="M11 15v16m5-16v16m5-16v16m5-16v16m5-16v16" stroke="#c87739" stroke-width="2.8"/>',
brake:'<path d="M8 30Q2 13 19 9Q36 7 35 24Q32 38 17 35Z" fill="#434a52" stroke="#8b99a6" stroke-width="3"/><path d="M15 18h16v9H15Z" fill="#b1a093"/>',
tool:'<path d="M29 7a11 11 0 0 0-14 13L5 30l7 7 11-10A11 11 0 0 0 35 13l-7 7-8-7Z" fill="#637586" stroke="#26394d" stroke-width="2"/>'};
// Reuse approved premium WebP icons. Remaining items use high-detail studio 3D image sheets.
const catalogIcons={
'drive-belt':{file:'belt.webp'},'weights':{file:'rollers.webp'},
'spark-plug':{file:'spark.webp'},'brake-fluid':{file:'brake-fluid.webp'},
'gear-oil':{file:'gear-oil.webp'},'battery':{file:'battery.webp'},
'slide-piece':{file:'slides.webp'},
'oil-strainer':{atlas:'a',col:0,row:0},'valve-clearance':{atlas:'c',col:2,row:1},
'engine-gasket':{atlas:'c',col:0,row:2},'intake':{atlas:'c',col:1,row:1},
'clutch-shoe':{file:'clutch.webp'},'clutch-bell':{atlas:'a',col:2,row:1},
'drive-pulley':{atlas:'a',col:1,row:2},'drive-bearing':{atlas:'a',col:2,row:2},
'brake-disc':{file:'disc.webp'},'brake-caliper':{atlas:'d',col:0,row:0},
'brake-hose':{atlas:'b',col:1,row:0},'wheel-bearing':{atlas:'b',col:2,row:1},
'fork-oil':{atlas:'d',col:0,row:1},'rear-shock':{atlas:'c',col:2,row:2},
'steering-bearing':{atlas:'b',col:2,row:1},
'headlamp':{atlas:'b',col:0,row:2},'fuse':{atlas:'d',col:1,row:0},
'starter':{atlas:'b',col:1,row:2},'coolant-hose':{atlas:'b',col:2,row:2},
'thermostat':{atlas:'c',col:1,row:0},'water-pump':{atlas:'c',col:0,row:0},
'fuel-pump':{atlas:'d',col:1,row:1}};
function partPicture(part){
 const asset=catalogIcons[part.id];
 if(!asset)return '<span class="stock-fallback">🔧</span>';
 if(asset.file)return '<img class="stock-part-photo" src="../assets/'+asset.file+'" alt="" loading="lazy">';
 const size=asset.atlas==='d'?2:3;
 const xy=n=>size===2?(n?'100%':'0%'):(n===0?'0%':n===1?'50%':'100%');
 return '<span class="stock-atlas-picture atlas-'+size+'" style="background-image:url(\'./realistic-parts-atlas-'+asset.atlas+'.svg\');background-position:'+xy(asset.col)+' '+xy(asset.row)+'" aria-hidden="true"></span>';
}
function stockRow(part){const row=document.createElement('article');row.className='part stock-part';row.dataset.partId=part.id;row.dataset.interval='0';row.innerHTML='<div class="part-img stock-picture">'+partPicture(part)+'</div><div class="part-body"><div class="part-line"><strong></strong><span>기록 없음</span></div><div class="gauge"><div class="gauge-fill blue" style="width:0%"></div></div></div><div class="service blue">'+ico+'</div>';row.querySelector('strong').textContent=part.name;return row}
const standardRoot=document.createElement('div');standardRoot.className='stock-part-container';list.appendChild(standardRoot);
standardParts.forEach(part=>standardRoot.appendChild(stockRow(part)));
const expand=document.createElement('button');expand.type='button';expand.className='extra-parts-toggle';expand.setAttribute('aria-expanded','false');expand.textContent='추가 정비 항목 펼치기 ('+extraParts.length+'개) ▾';list.appendChild(expand);
const extraRoot=document.createElement('div');extraRoot.className='stock-part-container extra-stock-container';extraRoot.hidden=true;list.appendChild(extraRoot);
extraParts.forEach(part=>extraRoot.appendChild(stockRow(part)));
expand.addEventListener('click',()=>{extraRoot.hidden=!extraRoot.hidden;expand.setAttribute('aria-expanded',String(!extraRoot.hidden));expand.textContent=extraRoot.hidden?'추가 정비 항목 펼치기 ('+extraParts.length+'개) ▾':'추가 정비 항목 접기 ▴'});
const customRoot=document.createElement('div');customRoot.className='custom-part-container';list.appendChild(customRoot);
const addCard=document.createElement('button');addCard.type='button';addCard.className='part part-add-card';addCard.innerHTML='<span class="part-img add-picture"><span>＋</span></span><span class="part-body"><span class="part-line"><strong>+ 직접 추가</strong></span><span class="add-subtitle">사진 선택 · 이름 입력 · 교체 주기</span></span><span class="service blue add-service">'+ico+'</span>';list.appendChild(addCard);
const overlay=document.createElement('div');overlay.hidden=true;overlay.className='part-add-mask';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','part-add-title');
overlay.innerHTML='<form class="part-add-sheet" id="part-add-form"><header><strong id="part-add-title">새 부품 직접 추가</strong><button type="button" id="part-add-close" aria-label="닫기">×</button></header><div class="part-add-preview"><img id="part-add-preview-img" alt="부품 사진 미리보기" hidden><span id="part-add-default">＋</span></div><div class="part-add-choose"><button type="button" id="part-add-photos">사진첩</button><button type="button" id="part-add-files">파일함</button></div><label>부품·소모품 이름<input id="part-add-name" type="text" maxlength="35" placeholder="예: 스마트키 배터리" required></label><label>교체 주기 (km, 선택)<input id="part-add-interval" type="number" inputmode="numeric" min="1" max="1000000" placeholder="예: 5000"></label><p id="part-add-error" class="part-add-error" aria-live="polite"></p><button type="submit" class="part-add-submit">부품 추가하기</button><small>기존 부품은 변경되지 않고, 추가한 부품은 현재 오토바이에만 저장돼.</small><input id="part-add-photo-input" type="file" accept="image/*" hidden><input id="part-add-file-input" type="file" accept="image/*,.png,.jpg,.jpeg,.webp,.heic,.heif" hidden></form>';
document.body.appendChild(overlay);const q=id=>document.getElementById(id);
const form=q('part-add-form'),input=q('part-add-name'),interval=q('part-add-interval'),error=q('part-add-error'),prev=q('part-add-preview-img'),defaultI=q('part-add-default'),photo=q('part-add-photo-input'),files=q('part-add-file-input');
let draftBlob=null,draftURL=null,editingBike=null,previousFocus=null,generation=0;
function clearURL(){if(draftURL){URL.revokeObjectURL(draftURL);draftURL=null}}
function open(){previousFocus=document.activeElement;editingBike=bikeId();draftBlob=null;clearURL();prev.hidden=true;defaultI.hidden=false;input.value='';interval.value='';error.textContent='';overlay.hidden=false;document.body.classList.add('part-add-open');input.focus({preventScroll:true})}
function close(){overlay.hidden=true;document.body.classList.remove('part-add-open');draftBlob=null;clearURL();photo.value='';files.value='';if(previousFocus?.focus)previousFocus.focus()}
addCard.addEventListener('click',open);q('part-add-close').addEventListener('click',close);overlay.addEventListener('click',e=>{if(e.target===overlay)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden){e.stopImmediatePropagation();close()}});
q('part-add-photos').addEventListener('click',()=>{photo.value='';photo.click()});q('part-add-files').addEventListener('click',()=>{files.value='';files.click()});
async function choose(e){const file=e.target.files?.[0];if(!file)return;error.textContent='사진 확인 중…';try{const b=await imageToBlob(file);draftBlob=b;clearURL();draftURL=URL.createObjectURL(b);prev.src=draftURL;prev.hidden=false;defaultI.hidden=true;error.textContent=''}catch(err){error.textContent=err.message||'이미지를 열 수 없어.'}finally{e.target.value=''}}
photo.addEventListener('change',choose);files.addEventListener('change',choose);
function recordFor(bike){return Array.isArray(registered[bike])?registered[bike]:[]}
function makeRow(part){const row=document.createElement('article');row.className='part custom-part';row.dataset.partId=part.id;row.dataset.interval=part.interval||0;row.innerHTML='<div class="part-img custom-picture"><span class="custom-fallback">🔧</span></div><div class="part-body"><div class="part-line"><strong></strong><span>기록 없음</span></div><div class="gauge"><div class="gauge-fill blue" style="width:0%"></div></div></div><div class="service blue">'+ico+'</div>';
row.querySelector('strong').textContent=part.name;return row}
function cleanup(){for(const url of urls.values())URL.revokeObjectURL(url);urls.clear();customRoot.replaceChildren()}
function announce(){document.dispatchEvent(new CustomEvent('motorcycle:custom-parts-change'))}
async function render(){const serial=++generation;const bike=bikeId();cleanup();const selected=recordFor(bike);selected.forEach(x=>customRoot.appendChild(makeRow(x)));announce();for(const item of selected){try{const blob=await readImage(bike+':'+item.id);if(serial!==generation||bike!==bikeId())return;if(blob){const row=[...customRoot.children].find(x=>x.dataset.partId===item.id);if(!row)continue;const url=URL.createObjectURL(blob);urls.set(item.id,url);const pic=row.querySelector('.custom-picture');const img=document.createElement('img');img.alt=item.name;img.src=url;img.className='personal-part-image';pic.replaceChildren(img)}}catch(err){console.warn('Custom part image:',err)}}}
form.addEventListener('submit',async e=>{e.preventDefault();const n=input.value.trim(),raw=interval.value.trim(),i=raw===''?0:Number(raw);if(!n){error.textContent='부품 이름을 입력해.';return}if(!Number.isSafeInteger(i)||i<0||i>1000000){error.textContent='교체 주기는 1~1,000,000km로 입력하거나 비워 둬.';return}const bike=editingBike;if(!bike){error.textContent='오토바이를 먼저 선택해.';return}const id='custom-'+Date.now()+'-'+Math.random().toString(36).slice(2,9);const entry={id,name:n,interval:i};const updated={...registered,[bike]:[...recordFor(bike),entry]};
try{if(draftBlob)await storeImage(bike+':'+id,draftBlob);localStorage.setItem(storageKey,JSON.stringify(updated));registered=updated;close();await render()}catch(err){error.textContent='저장하지 못했어. 저장공간 또는 브라우저 설정을 확인해.'}});
document.addEventListener('motorcycle:change',render);
base.forEach((row,i)=>{row.dataset.partId=['oil','brake','tire','coolant','filter'][i]});
render();
})();