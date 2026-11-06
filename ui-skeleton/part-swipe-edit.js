(()=>{'use strict';
/* Per-bike appearance and reversible hide; maintenance records are never rewritten. */
const rows=document.querySelector('.rows');
if(!rows)return;
const key='motorcycle-skeleton-part-appearance-v1';
const addedKey='motorcycle-skeleton-added-parts-v1';
const dbName='motorcycle-skeleton-added-images-v1';
const orderKey='motorcycle-skeleton-part-order-v1';
let orders={};try{orders=JSON.parse(localStorage.getItem(orderKey)||'{}')||{}}catch{orders={}}
const bike=()=>document.body.dataset.activeBike||'pcx125';
let data={};try{data=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{data={}}
function readCurrentSettings(){try{const latest=JSON.parse(localStorage.getItem(key)||'{}');if(latest&&typeof latest==='object'&&!Array.isArray(latest))data=latest}catch{}return data}
const active=()=>readCurrentSettings()[bike()]||{};
const cache=new Map(),originals=new WeakMap();
let openWrap=null,gesture=null,editing=null,draft=null,previewUrl=null,updateNumber=0,drag=null,suppressUntil=0;
function persist(){localStorage.setItem(key,JSON.stringify(data))}
function setPart(id,changes){const b=bike();try{const latest=JSON.parse(localStorage.getItem(key)||'{}');if(latest&&typeof latest==='object')data=latest}catch{}data[b]={...(data[b]||{}),[id]:{...(data[b]?.[id]||{}),...changes}};persist()}
const style=document.createElement('style');style.textContent=
'.rows .part-swipe-wrap,.rows .part-swipe-wrap *{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}' +
'.part-swipe-wrap{position:relative;overflow:hidden;border-radius:15px;flex:0 0 auto;touch-action:pan-y}' +
'.part-swipe-wrap>.part{position:relative;z-index:2;width:100%;margin:0;transition:transform .18s ease;touch-action:pan-y}' +
'.part-swipe-wrap.swiped>.part{transform:translate3d(-136px,0,0)}' +
'.part-swipe-actions{position:absolute;right:0;top:0;bottom:0;width:136px;display:flex;align-items:stretch;z-index:1}' +
'.part-swipe-actions button{border:0;color:white;font-weight:900;font-size:14px;flex:1;min-width:0}' +
'.part-swipe-edit{background:linear-gradient(#2498e7,#0959a3)}.part-swipe-delete{background:linear-gradient(#e56867,#a52f39)}' +
'.part-restore-button{width:100%;margin:4px 0 0;padding:13px;border-radius:12px;border:1px solid #7898b3;background:#14273b;color:#ecf8ff;font-weight:800;font-size:13px}.part-restore-button:disabled{opacity:.48}' +
'.part-img.part-user-picture img.part-user-replacement{position:absolute;inset:0;left:0;top:0;transform:none;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;mix-blend-mode:normal;filter:none;z-index:5}' +
'.part-swipe-wrap[hidden]{display:none!important}' +
'.part-swipe-wrap.drag-source{background:transparent!important;box-shadow:none!important;border-color:transparent!important}' +
'.part-swipe-wrap.drag-source>.part,.part-swipe-wrap.drag-source>.part-swipe-actions{visibility:hidden!important}' +
'.part-drop-gap{flex:0 0 12px;height:12px;min-height:12px;border-radius:7px;margin:0 1px;background:linear-gradient(180deg,#63bdff10,#63bdff25,#63bdff10);border:1px dashed #80ccff82;pointer-events:none;box-sizing:border-box;animation:partGapOpen .16s ease-out both}' +
'@keyframes partGapOpen{from{height:0;min-height:0;flex-basis:0;opacity:0}to{height:12px;min-height:12px;flex-basis:12px;opacity:1}}' +
'.part-drag-ghost{position:fixed!important;z-index:999!important;pointer-events:none!important;margin:0!important;box-shadow:0 12px 25px #000b,0 0 0 1px #79cfff!important;opacity:.97;transform-origin:center;animation:partLift .22s ease-out both!important}' +
'@keyframes partLift{from{transform:scale(1);filter:brightness(1)}to{transform:scale(1.025);filter:brightness(1.07)}}' +
'.part-swipe-wrap{transition:transform .16s cubic-bezier(.22,.8,.32,1)}' +
'.part-swipe-wrap.part-drop-before{transform:translateY(4px)}.part-swipe-wrap.part-drop-after{transform:translateY(-4px)}' +
'.part-swipe-wrap.part-drop-neighbor-up{transform:translateY(-3px)}.part-swipe-wrap.part-drop-neighbor-down{transform:translateY(3px)}' +
'.extra-parts-toggle.part-drop-before,.extra-parts-toggle.part-drop-after{box-shadow:inset 0 0 0 2px #79cfff,0 3px 6px #0009}' +
'@media(prefers-reduced-motion:reduce){.part-drag-ghost{animation:none!important}.part-swipe-wrap{transition:none!important}}' +
'.part-edit-mask[hidden]{display:none!important}.part-edit-mask{position:fixed;inset:0;background:#02060bd0;z-index:110;display:flex;align-items:flex-end;justify-content:center;padding:12px 12px max(22px,env(safe-area-inset-bottom))}' +
'.part-edit-panel{width:100%;max-width:520px;max-height:92dvh;overflow:auto;border-radius:18px;padding:18px;background:linear-gradient(150deg,#30455c,#0b1725);border:1px solid #90adc8;color:#f5f9ff;box-shadow:0 12px 35px #000b}' +
'.part-edit-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;font-size:18px}.part-edit-head button{border:1px solid #7590a9;background:#15283e;border-radius:9px;color:white;font-size:24px;width:37px;height:37px}' +
'.part-edit-preview{width:105px;height:95px;margin:0 auto 14px;background:#f5f5f5;border:1px solid #aebed1;border-radius:10px;display:grid;place-items:center;overflow:hidden;color:#54697b;font-size:30px}' +
'.part-edit-preview img{display:block;width:100%;height:100%;object-fit:contain}' +
'.part-edit-pickers{display:flex;gap:10px;margin-bottom:16px}.part-edit-pickers button{flex:1;padding:13px 6px;background:linear-gradient(#398edf,#084e99);color:white;border:1px solid #80c5ff;border-radius:10px;font-weight:800}' +
'.part-edit-panel label{display:block;font-size:13px;font-weight:800}.part-edit-panel input[type=text]{width:100%;margin-top:8px;height:49px;padding:10px 12px;border:2px solid #a5c5e3;border-radius:10px;background:#f3f9ff;color:#14283b;font-size:17px;font-weight:800}' +
'.part-edit-panel input[type=number]{width:100%;margin-top:8px;height:49px;padding:10px 12px;border:2px solid #a5c5e3;border-radius:10px;background:#f3f9ff;color:#14283b;font-size:17px;font-weight:800}' +
'.part-edit-save{width:100%;height:49px;margin-top:18px;background:linear-gradient(#55b6f6,#0960b6);color:white;border:1px solid #8bd6ff;border-radius:10px;font-size:16px;font-weight:900}' +
'.part-edit-error{min-height:17px;margin-top:8px;color:#ffd1aa;font-size:12px}' +
'.part-edit-official-reset{display:block;width:100%;min-height:41px;margin-top:10px;border:1px solid #7db8e2;border-radius:9px;background:#163650;color:#e4f5ff;font-size:13px;font-weight:850}.part-edit-official-reset[hidden]{display:none!important}.part-edit-official-reset:disabled{opacity:.55}';
document.head.appendChild(style);
const mask=document.createElement('div');mask.className='part-edit-mask';mask.hidden=true;mask.setAttribute('role','dialog');mask.setAttribute('aria-modal','true');mask.innerHTML=
'<form class="part-edit-panel"><div class="part-edit-head"><strong>정비 항목 수정</strong><button type="button" class="part-edit-close" aria-label="닫기">×</button></div>' +
'<div class="part-edit-preview"><img alt="현재 부품 이미지" hidden><span>🔧</span></div>' +
'<div class="part-edit-pickers"><button type="button" class="part-edit-photos">사진첩</button><button type="button" class="part-edit-files">파일함</button></div>' +
'<label>부품 이름<input type="text" maxlength="35" required></label><label style="margin-top:12px">교체 주기 (km)<input type="number" class="part-edit-interval" min="1" max="1000000" step="1" inputmode="numeric" placeholder="교체 주기 미설정"></label><button class="part-edit-official-reset" type="button" hidden>제조사 공식 주기로 복원</button><div class="part-edit-error" aria-live="polite"></div>' +
'<button type="submit" class="part-edit-save">저장</button><input class="part-edit-photo-input" type="file" accept="image/*" hidden><input class="part-edit-file-input" type="file" accept="image/*,.png,.jpg,.jpeg,.webp,.heic,.heif" hidden></form>';
document.body.appendChild(mask);
const form=mask.querySelector('form'),nameInput=form.querySelector('input[type=text]'),error=form.querySelector('.part-edit-error'),preview=form.querySelector('.part-edit-preview img'),fallback=form.querySelector('.part-edit-preview span');
const photo=form.querySelector('.part-edit-photo-input'),fileInput=form.querySelector('.part-edit-file-input'),cycleInput=form.querySelector('.part-edit-interval'),officialReset=form.querySelector('.part-edit-official-reset');
let restoreOfficial=false,availableOfficialKm=0;
function officialKmFor(bikeId,partId){
 let registrations={};try{registrations=JSON.parse(localStorage.getItem('motorcycle-skeleton-registrations-v1')||'{}')||{}}catch{}
 const reg=registrations[bikeId];if(!reg)return 0;
 const profile=window.MotorcycleCatalog?.findOfficialProfile(reg.brand,reg.model,reg.year);
 const km=profile?.intervals?.[partId];return Number.isSafeInteger(km)&&km>0&&km<=1000000?km:0;
}
officialReset.addEventListener('click',()=>{
 if(!editing||!availableOfficialKm)return;
 cycleInput.value=String(availableOfficialKm);restoreOfficial=true;
 error.textContent='제조사 공식 주기 '+availableOfficialKm.toLocaleString('ko-KR')+'km로 변경할 준비가 됐어. 저장을 누르면 적용돼.';
});
cycleInput.addEventListener('input',()=>{restoreOfficial=false;error.textContent=''});
let databasePromise;
function db(){if(!databasePromise)databasePromise=new Promise((resolve,reject)=>{const request=indexedDB.open(dbName,1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('images'))request.result.createObjectStore('images')};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)}).catch(err=>{databasePromise=null;throw err});return databasePromise}
async function imageRead(k){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction('images').objectStore('images').get(k);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function imageWrite(k,blob){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('images','readwrite');tx.objectStore('images').put(blob,k);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
async function shrinkImage(f){if(!f||(!f.type.startsWith('image/')&&!/\.(png|jpe?g|webp|heic|heif)$/i.test(f.name)))throw Error('이미지 파일을 선택해.');if(f.size>18*1024*1024)throw Error('18MB 이하의 이미지를 선택해.');const source=URL.createObjectURL(f);try{const img=new Image();img.src=source;await img.decode();const ratio=Math.min(1,640/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(Error('이미지 변환 실패')),'image/png'))}finally{URL.revokeObjectURL(source)}}
function closeSwipe(){if(openWrap){openWrap.classList.remove('swiped');openWrap=null}}
function revokePreview(){if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null}}
function closeModal(){mask.hidden=true;editing=null;draft=null;restoreOfficial=false;availableOfficialKm=0;revokePreview();photo.value='';fileInput.value='';document.body.style.overflow=''}
function visiblePreview(img){if(img){preview.src=img;preview.hidden=false;fallback.hidden=true}else{preview.hidden=true;preview.removeAttribute('src');fallback.hidden=false}}
function edit(row){closeSwipe();readCurrentSettings();editing={id:row.dataset.partId,bike:bike(),row};draft=null;revokePreview();error.textContent='';nameInput.value=row.querySelector('.part-line strong')?.textContent||'';
 const cycle=active()[row.dataset.partId]?.interval;
 const builtIn={oil:3000,filter:12000,brake:12000,tire:10000,coolant:20000};
 let unverified=false;
 try{const regs=JSON.parse(localStorage.getItem('motorcycle-skeleton-registrations-v1')||'{}');unverified=!!regs[bike()]?.maintenanceProfileStatus}catch{}
 cycleInput.value=Number.isSafeInteger(cycle)&&cycle>0?String(cycle):unverified?'':String(Number(row.dataset.interval)||builtIn[row.dataset.partId]||'');
 editing.initialInterval=Number(cycleInput.value)||0;
 availableOfficialKm=officialKmFor(editing.bike,editing.id);restoreOfficial=false;
 officialReset.hidden=!availableOfficialKm||(active()[editing.id]?.intervalSource==='official'&&active()[editing.id]?.interval===availableOfficialKm);
 officialReset.textContent=availableOfficialKm?'제조사 공식 주기로 복원 ('+availableOfficialKm.toLocaleString('ko-KR')+'km)':'제조사 공식 주기로 복원';
 const img=row.querySelector('.part-img img');visiblePreview(img?.src||'');mask.hidden=false;document.body.style.overflow='hidden';nameInput.focus({preventScroll:true})}
mask.querySelector('.part-edit-close').addEventListener('click',closeModal);mask.addEventListener('click',e=>{if(e.target===mask)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!mask.hidden)closeModal();else closeSwipe()}});
mask.querySelector('.part-edit-photos').addEventListener('click',()=>{photo.value='';photo.click()});
mask.querySelector('.part-edit-files').addEventListener('click',()=>{fileInput.value='';fileInput.click()});
async function choose(e){const f=e.target.files?.[0];if(!f)return;error.textContent='이미지 확인 중…';try{const b=await shrinkImage(f);draft=b;revokePreview();previewUrl=URL.createObjectURL(b);visiblePreview(previewUrl);error.textContent=''}catch(err){error.textContent=err.message||'이미지를 열 수 없어.'}finally{e.target.value=''}}
photo.addEventListener('change',choose);fileInput.addEventListener('change',choose);
form.addEventListener('submit',async e=>{e.preventDefault();if(!editing)return;const n=nameInput.value.trim(),rawInterval=cycleInput.value.trim(),cycle=rawInterval?Number(rawInterval):0;if(!n){error.textContent='부품 이름을 입력해.';return}
 if(!Number.isSafeInteger(cycle)||cycle<0||cycle>1000000){error.textContent='교체주기는 1~1,000,000km로 입력하거나 비워 둬.';return}const target=editing;const button=form.querySelector('.part-edit-save');button.disabled=true;try{
 if(draft){await imageWrite('appearance:'+target.bike+':'+target.id,draft);const cacheKey=target.bike+':'+target.id;if(cache.has(cacheKey)){URL.revokeObjectURL(cache.get(cacheKey));cache.delete(cacheKey)}}
 if(target.bike!==bike())throw Error('차량이 변경되었어. 다시 시도해.');
 const previous=active()[target.id]||{};
 const initialCycle=Number.isSafeInteger(target.initialInterval)?target.initialInterval:0;
 const unchanged=initialCycle===cycle;
 const source=restoreOfficial&&availableOfficialKm===cycle?'official':unchanged?previous.intervalSource:'user';
 const changes={name:n,interval:cycle,hasImage:!!draft||!!previous.hasImage};
 if(source)changes.intervalSource=source;
 setPart(target.id,changes);
  document.dispatchEvent(new CustomEvent('motorcycle:custom-parts-change'));
 if(target.id.startsWith('custom-')){try{const all=JSON.parse(localStorage.getItem(addedKey)||'{}');if(Array.isArray(all[target.bike])){const entry=all[target.bike].find(x=>x.id===target.id);if(entry){entry.name=n;localStorage.setItem(addedKey,JSON.stringify(all))}}}catch(err){console.warn('Custom label sync:',err)}}
 closeModal();refresh();
}catch(err){error.textContent=err.message||'저장하지 못했어.'}finally{button.disabled=false}});
function imageKey(b,id){return 'appearance:'+b+':'+id}
function wrap(row){if(!row.dataset.partId||row.closest('.part-swipe-wrap'))return;const parent=row.parentNode;const shell=document.createElement('div');shell.className='part-swipe-wrap';shell.dataset.partId=row.dataset.partId;const actions=document.createElement('div');actions.className='part-swipe-actions';actions.innerHTML='<button class="part-swipe-edit" type="button">수정</button><button class="part-swipe-delete" type="button">삭제</button>';parent.insertBefore(shell,row);shell.append(actions,row);actions.querySelector('.part-swipe-edit').addEventListener('click',()=>edit(row));actions.querySelector('.part-swipe-delete').addEventListener('click',()=>remove(row));shell.addEventListener('touchstart',start,{passive:true});shell.addEventListener('touchmove',move,{passive:false});shell.addEventListener('touchend',finish,{passive:true});shell.addEventListener('touchcancel',cancelGesture,{passive:true});
}
/* A 380ms stationary hold starts a card reorder; a quick left swipe still reveals actions. */
/* A single sortable top area plus an expandable area. Any card may move between them. */
const topZone=rows.querySelector('.stock-part-container:not(.extra-stock-container)');
const extraZone=rows.querySelector('.extra-stock-container');
const toggle=rows.querySelector('.extra-parts-toggle');
let arranging=false;
function directCards(zone){return [...zone.children].filter(el=>el.classList.contains('part-swipe-wrap'))}
function allCards(){return [...rows.querySelectorAll('.part-swipe-wrap')]}
function normalizeZones(){
 if(!topZone||!extraZone)return;
 // The original five cards began as direct children of rows; move them to the same freely sortable area.
 const originalFive=directCards(rows);for(let i=originalFive.length-1;i>=0;i--)topZone.insertBefore(originalFive[i],topZone.firstChild);
 const custom=extraZone.querySelector('.custom-part-container');
 if(custom)for(const shell of directCards(custom))extraZone.insertBefore(shell,custom);
}
function saveOrder(){
 if(!topZone||!extraZone)return;
 const current={top:directCards(topZone).map(el=>el.dataset.partId),extra:directCards(extraZone).map(el=>el.dataset.partId)};
 orders[bike()]=current;localStorage.setItem(orderKey,JSON.stringify(orders));
 updateToggleCount();
}
function restoreOrder(){
 if(!topZone||!extraZone||arranging)return;
 arranging=true;
 try{
  normalizeZones();
  const saved=orders[bike()]||{};
  // Convert positions from older builds without deleting existing user settings.
  const topIds=Array.isArray(saved.top)?saved.top:[...(saved.base||[]),...(saved.standard||[])];
  const extraIds=Array.isArray(saved.extra)?saved.extra:[...(saved.extra||[]),...(saved.custom||[])];
  const available=new Map(allCards().map(el=>[el.dataset.partId,el]));
  for(const [zone,ids] of [[topZone,topIds],[extraZone,extraIds]]){
   for(const id of ids){const shell=available.get(id);if(shell)zone.appendChild(shell)}
   // Reinsert saved cards first, preserving their order and leaving unlisted newcomers after them.
   const ordered=ids.map(id=>available.get(id)).filter(el=>el&&el.parentElement===zone);
   const other=directCards(zone).filter(el=>!ordered.includes(el));
   const desired=[...ordered,...other];
   for(const el of desired)zone.appendChild(el);
  }
  updateToggleCount();
 }finally{arranging=false}
}
function updateToggleCount(){
 if(!extraZone||!toggle)return;
 const count=allCards().filter(el=>extraZone.contains(el)).length;
 toggle.textContent=extraZone.hidden?'추가 정비 항목 펼치기 ('+count+'개) ▾':'추가 정비 항목 접기 ▴';
}
function canTarget(shell,target){return !!target&&target!==shell&&!target.hidden}
function findTarget(x,y){
 if(!drag)return null;
 const rect=toggle?.getBoundingClientRect();
 if(rect&&y>=rect.top-10&&y<=rect.bottom+10)return toggle;
 const eligible=allCards().filter(el=>canTarget(drag.shell,el)&&el.getClientRects().length&&!el.closest('[hidden]'));
 let nearest=null,distance=Infinity;
 for(const el of eligible){const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)continue;
  const gap=y<r.top?r.top-y:y>r.bottom?y-r.bottom:0;
  if(gap<distance){distance=gap;nearest=el}
 }
 return distance<90?nearest:null;
}
function start(e){if(e.touches.length!==1||!mask.hidden)return;const t=e.touches[0],shell=e.currentTarget;
 gesture={wrap:shell,x:t.clientX,y:t.clientY,currentX:t.clientX,currentY:t.clientY,dragging:false,timer:null};
 // Do not initiate a drag on an action button or the service wrench.
 if(e.target.closest('.part-swipe-actions,.service'))return;
 const g=gesture;g.timer=setTimeout(()=>{if(gesture===g)beginDrag(g)},380);
}
function beginDrag(g){const shell=g.wrap;if(!shell?.isConnected)return;closeSwipe();window.getSelection()?.removeAllRanges();const row=shell.querySelector(':scope > .part');if(!row)return;const rect=row.getBoundingClientRect();const ghost=row.cloneNode(true);ghost.classList.add('part-drag-ghost');Object.assign(ghost.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',transition:'none'});document.body.appendChild(ghost);shell.classList.add('drag-source');g.dragging=true;
 const gap=document.createElement('div');gap.className='part-drop-gap';gap.setAttribute('aria-hidden','true');drag={g,shell,ghost,gap,from:shell.parentElement,y:g.currentY,target:null,after:false};
 if(navigator.vibrate)try{navigator.vibrate(18)}catch{}
}
function move(e){const g=gesture;if(!g||g.wrap!==e.currentTarget||e.touches.length!==1)return;const t=e.touches[0];g.currentX=t.clientX;g.currentY=t.clientY;
 if(!g.dragging){if(Math.hypot(t.clientX-g.x,t.clientY-g.y)>12){clearTimeout(g.timer);g.timer=null}return}
 e.preventDefault();if(!drag)return;
 drag.ghost.style.top=(t.clientY-(g.y-drag.shell.getBoundingClientRect().top))+'px';
 const candidate=findTarget(t.clientX,t.clientY);
 if(candidate){
  const after=candidate===toggle?false:t.clientY>candidate.getBoundingClientRect().top+candidate.getBoundingClientRect().height/2;
  const changed=drag.target!==candidate||drag.after!==after;
  if(changed){
   clearDropHint();
   drag.target=candidate;drag.after=after;
   if(candidate===toggle){
    toggle.classList.add('part-drop-before');
    drag.gap.remove();
   }else{
    const parent=candidate.parentElement;
    parent.insertBefore(drag.gap,after?candidate.nextSibling:candidate);
    // The real 12px gap gently moves the adjacent cards apart.
   }
  }
 }else{
  clearDropHint();
  drag.target=null;
  drag.gap.remove();
 }
 // Scroll the page near the viewport edges while the finger holds the card.
 if(t.clientY>innerHeight-105)window.scrollBy(0,11);else if(t.clientY<100)window.scrollBy(0,-11);
}
function clearDropHint(){for(const el of rows.querySelectorAll('.part-drop-before,.part-drop-after,.part-drop-neighbor-up,.part-drop-neighbor-down'))el.classList.remove('part-drop-before','part-drop-after','part-drop-neighbor-up','part-drop-neighbor-down')}
function cleanupDrag(commit){if(!drag)return;const d=drag;
 const target=commit?d.target:null;
 const gapInUse=d.gap.isConnected;
 const destination=target===toggle?extraZone:(gapInUse?d.gap.parentElement:target?.parentElement);
 clearDropHint();
 d.shell.classList.remove('drag-source');
 d.ghost.remove();
 if(commit&&target&&destination){
  if(target===toggle)destination.insertBefore(d.shell,destination.firstElementChild);
  else if(gapInUse)destination.insertBefore(d.shell,d.gap);
  else destination.insertBefore(d.shell,d.after?target.nextSibling:target);
  try{saveOrder();document.dispatchEvent(new CustomEvent('motorcycle:parts-reordered'))}catch(err){console.warn('Part order could not be saved:',err)}
 }
 d.gap.remove();
 drag=null;
 suppressUntil=Date.now()+600;
}
function finish(e){if(!gesture||gesture.wrap!==e.currentTarget)return;const g=gesture;clearTimeout(g.timer);gesture=null;if(g.dragging){cleanupDrag(true);return}
 const touch=e.changedTouches[0],dx=touch.clientX-g.x,dy=touch.clientY-g.y;if(Math.abs(dx)<37||Math.abs(dx)<Math.abs(dy)*1.3)return;const shell=e.currentTarget;if(dx<0){closeSwipe();shell.classList.add('swiped');openWrap=shell}else if(shell===openWrap)closeSwipe()}
function cancelGesture(){if(gesture)clearTimeout(gesture.timer);gesture=null;cleanupDrag(false)}
rows.addEventListener('click',e=>{if(Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
rows.addEventListener('contextmenu',e=>{if(e.target.closest('.part-swipe-wrap'))e.preventDefault()});
document.addEventListener('selectionchange',()=>{if(gesture||drag)window.getSelection()?.removeAllRanges()});
document.addEventListener('click',e=>{if(openWrap&&!openWrap.contains(e.target))closeSwipe()});
function remove(row){const id=row.dataset.partId,label=row.querySelector('.part-line strong')?.textContent||'항목';closeSwipe();if(!confirm('“'+label+'” 항목을 목록에서 삭제할까?\n기존 정비 기록은 삭제되지 않고, 아래 복원 버튼으로 되돌릴 수 있어.'))return;try{setPart(id,{hidden:true});refresh()}catch{alert('삭제 상태를 저장하지 못했어.')}}
const restore=document.createElement('button');restore.type='button';restore.className='part-restore-button';restore.hidden=true;restore.textContent='삭제한 정비 항목 복원';rows.insertBefore(restore,rows.firstChild);
restore.addEventListener('click',()=>{const b=bike(),hidden=Object.entries(active()).filter(([id,x])=>x.hidden).map(([id])=>id);if(!hidden.length)return;if(!confirm('숨긴 정비 항목 '+hidden.length+'개를 다시 표시할까?'))return;hidden.forEach(id=>setPart(id,{hidden:false}));refresh()});
function ensureName(row){if(!originals.has(row)){const strong=row.querySelector('.part-line strong');const pic=row.querySelector('.part-img');originals.set(row,{name:strong?.textContent||'',html:pic?.innerHTML||'',cls:pic?.className||''})}}
async function decorate(){const serial=++updateNumber,b=bike();const all=[...rows.querySelectorAll('.part:not(.part-add-card)')];all.forEach(wrap);restoreOrder();
 const values=active(),hidden=Object.values(values).filter(v=>v.hidden).length;restore.hidden=false;restore.disabled=!hidden;restore.textContent=hidden?'삭제한 정비 항목 복원 ('+hidden+'개)':'삭제된 정비 항목 없음';
 for(const row of all){if(serial!==updateNumber||bike()!==b)return;const id=row.dataset.partId;if(!id)continue;ensureName(row);const defaults=originals.get(row),cfg=values[id]||{},shell=row.closest('.part-swipe-wrap'),title=row.querySelector('.part-line strong'),pic=row.querySelector('.part-img');if(shell)shell.hidden=!!cfg.hidden;
 if(title)title.textContent=cfg.name||defaults.name;
 // Preserve original SVG/asset rendering and custom uploaded images unless an override exists.
 const token=b+':'+id,prev=cache.get(token);
 if(cfg.hasImage){try{let url=prev;if(!url){const blob=await imageRead(imageKey(b,id));if(!blob)continue;url=URL.createObjectURL(blob);cache.set(token,url)}if(serial!==updateNumber||bike()!==b)return;
 let img=pic.querySelector('img.part-user-replacement');if(!img){pic.replaceChildren();img=document.createElement('img');img.className='part-user-replacement';img.alt='';pic.appendChild(img)}img.src=url;pic.classList.add('part-user-picture');
 }catch(err){console.warn('Part image:',err)}}
 else if(pic.classList.contains('part-user-picture')){pic.innerHTML=defaults.html;pic.className=defaults.cls}
 }
}
function refresh(){if(!drag)decorate()}
document.addEventListener('motorcycle:vehicle-saved',()=>{try{data=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}refresh()});
document.addEventListener('motorcycle:appearance-changed',()=>{try{data=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}refresh()});
document.addEventListener('motorcycle:change',refresh);
document.addEventListener('motorcycle:custom-parts-change',()=>queueMicrotask(refresh));
const observer=new MutationObserver(records=>{if(arranging||drag)return;if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.classList?.contains('custom-part')||n.querySelector?.('.custom-part:not(.part-swipe-wrap .custom-part)')||(n.matches?.('img')&&n.closest?.('.custom-part'))))))refresh()});
observer.observe(rows,{subtree:true,childList:true});
refresh();
})();