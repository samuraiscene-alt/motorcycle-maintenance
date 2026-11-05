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
const active=()=>data[bike()]||{};
const cache=new Map(),originals=new WeakMap();
let openWrap=null,gesture=null,editing=null,draft=null,previewUrl=null,updateNumber=0,drag=null,suppressUntil=0;
function persist(){localStorage.setItem(key,JSON.stringify(data))}
function setPart(id,changes){const b=bike();data[b]={...(data[b]||{}),[id]:{...(data[b]?.[id]||{}),...changes}};persist()}
const style=document.createElement('style');style.textContent=
'.part-swipe-wrap{position:relative;overflow:hidden;border-radius:15px;flex:0 0 auto;touch-action:pan-y}' +
'.part-swipe-wrap>.part{position:relative;z-index:2;width:100%;margin:0;transition:transform .18s ease;touch-action:pan-y}' +
'.part-swipe-wrap.swiped>.part{transform:translate3d(-136px,0,0)}' +
'.part-swipe-actions{position:absolute;right:0;top:0;bottom:0;width:136px;display:flex;align-items:stretch;z-index:1}' +
'.part-swipe-actions button{border:0;color:white;font-weight:900;font-size:14px;flex:1;min-width:0}' +
'.part-swipe-edit{background:linear-gradient(#2498e7,#0959a3)}.part-swipe-delete{background:linear-gradient(#e56867,#a52f39)}' +
'.part-restore-button{width:100%;margin:4px 0 0;padding:13px;border-radius:12px;border:1px solid #7898b3;background:#14273b;color:#ecf8ff;font-weight:800;font-size:13px}' +
'.part-img.part-user-picture img.part-user-replacement{position:absolute;inset:0;left:0;top:0;transform:none;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;mix-blend-mode:normal;filter:none;z-index:5}' +
'.part-swipe-wrap[hidden]{display:none!important}' +
'.part-swipe-wrap.drag-source{opacity:.24}' +
'.part-drag-ghost{position:fixed!important;z-index:999!important;pointer-events:none!important;margin:0!important;box-shadow:0 7px 24px #000d,0 0 0 2px #64c7ff!important;opacity:.96}' +
'.part-drop-before{box-shadow:0 -4px 0 #60c7ff!important}.part-drop-after{box-shadow:0 4px 0 #60c7ff!important}' +
'.part-edit-mask[hidden]{display:none!important}.part-edit-mask{position:fixed;inset:0;background:#02060bd0;z-index:110;display:flex;align-items:flex-end;justify-content:center;padding:12px 12px max(22px,env(safe-area-inset-bottom))}' +
'.part-edit-panel{width:100%;max-width:520px;max-height:92dvh;overflow:auto;border-radius:18px;padding:18px;background:linear-gradient(150deg,#30455c,#0b1725);border:1px solid #90adc8;color:#f5f9ff;box-shadow:0 12px 35px #000b}' +
'.part-edit-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;font-size:18px}.part-edit-head button{border:1px solid #7590a9;background:#15283e;border-radius:9px;color:white;font-size:24px;width:37px;height:37px}' +
'.part-edit-preview{width:105px;height:95px;margin:0 auto 14px;background:#f5f5f5;border:1px solid #aebed1;border-radius:10px;display:grid;place-items:center;overflow:hidden;color:#54697b;font-size:30px}' +
'.part-edit-preview img{display:block;width:100%;height:100%;object-fit:contain}' +
'.part-edit-pickers{display:flex;gap:10px;margin-bottom:16px}.part-edit-pickers button{flex:1;padding:13px 6px;background:linear-gradient(#398edf,#084e99);color:white;border:1px solid #80c5ff;border-radius:10px;font-weight:800}' +
'.part-edit-panel label{display:block;font-size:13px;font-weight:800}.part-edit-panel input[type=text]{width:100%;margin-top:8px;height:49px;padding:10px 12px;border:2px solid #a5c5e3;border-radius:10px;background:#f3f9ff;color:#14283b;font-size:17px;font-weight:800}' +
'.part-edit-save{width:100%;height:49px;margin-top:18px;background:linear-gradient(#55b6f6,#0960b6);color:white;border:1px solid #8bd6ff;border-radius:10px;font-size:16px;font-weight:900}' +
'.part-edit-error{min-height:17px;margin-top:8px;color:#ffd1aa;font-size:12px}';
document.head.appendChild(style);
const mask=document.createElement('div');mask.className='part-edit-mask';mask.hidden=true;mask.setAttribute('role','dialog');mask.setAttribute('aria-modal','true');mask.innerHTML=
'<form class="part-edit-panel"><div class="part-edit-head"><strong>정비 항목 수정</strong><button type="button" class="part-edit-close" aria-label="닫기">×</button></div>' +
'<div class="part-edit-preview"><img alt="현재 부품 이미지" hidden><span>🔧</span></div>' +
'<div class="part-edit-pickers"><button type="button" class="part-edit-photos">사진첩</button><button type="button" class="part-edit-files">파일함</button></div>' +
'<label>부품 이름<input type="text" maxlength="35" required></label><div class="part-edit-error" aria-live="polite"></div>' +
'<button type="submit" class="part-edit-save">저장</button><input class="part-edit-photo-input" type="file" accept="image/*" hidden><input class="part-edit-file-input" type="file" accept="image/*,.png,.jpg,.jpeg,.webp,.heic,.heif" hidden></form>';
document.body.appendChild(mask);
const form=mask.querySelector('form'),nameInput=form.querySelector('input[type=text]'),error=form.querySelector('.part-edit-error'),preview=form.querySelector('.part-edit-preview img'),fallback=form.querySelector('.part-edit-preview span');
const photo=form.querySelector('.part-edit-photo-input'),fileInput=form.querySelector('.part-edit-file-input');
let databasePromise;
function db(){if(!databasePromise)databasePromise=new Promise((resolve,reject)=>{const request=indexedDB.open(dbName,1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('images'))request.result.createObjectStore('images')};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)}).catch(err=>{databasePromise=null;throw err});return databasePromise}
async function imageRead(k){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction('images').objectStore('images').get(k);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function imageWrite(k,blob){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('images','readwrite');tx.objectStore('images').put(blob,k);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
async function shrinkImage(f){if(!f||(!f.type.startsWith('image/')&&!/\.(png|jpe?g|webp|heic|heif)$/i.test(f.name)))throw Error('이미지 파일을 선택해.');if(f.size>18*1024*1024)throw Error('18MB 이하의 이미지를 선택해.');const source=URL.createObjectURL(f);try{const img=new Image();img.src=source;await img.decode();const ratio=Math.min(1,640/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(Error('이미지 변환 실패')),'image/png'))}finally{URL.revokeObjectURL(source)}}
function closeSwipe(){if(openWrap){openWrap.classList.remove('swiped');openWrap=null}}
function revokePreview(){if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null}}
function closeModal(){mask.hidden=true;editing=null;draft=null;revokePreview();photo.value='';fileInput.value='';document.body.style.overflow=''}
function visiblePreview(img){if(img){preview.src=img;preview.hidden=false;fallback.hidden=true}else{preview.hidden=true;preview.removeAttribute('src');fallback.hidden=false}}
function edit(row){closeSwipe();editing={id:row.dataset.partId,bike:bike(),row};draft=null;revokePreview();error.textContent='';nameInput.value=row.querySelector('.part-line strong')?.textContent||'';const img=row.querySelector('.part-img img');visiblePreview(img?.src||'');mask.hidden=false;document.body.style.overflow='hidden';nameInput.focus({preventScroll:true})}
mask.querySelector('.part-edit-close').addEventListener('click',closeModal);mask.addEventListener('click',e=>{if(e.target===mask)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!mask.hidden)closeModal();else closeSwipe()}});
mask.querySelector('.part-edit-photos').addEventListener('click',()=>{photo.value='';photo.click()});
mask.querySelector('.part-edit-files').addEventListener('click',()=>{fileInput.value='';fileInput.click()});
async function choose(e){const f=e.target.files?.[0];if(!f)return;error.textContent='이미지 확인 중…';try{const b=await shrinkImage(f);draft=b;revokePreview();previewUrl=URL.createObjectURL(b);visiblePreview(previewUrl);error.textContent=''}catch(err){error.textContent=err.message||'이미지를 열 수 없어.'}finally{e.target.value=''}}
photo.addEventListener('change',choose);fileInput.addEventListener('change',choose);
form.addEventListener('submit',async e=>{e.preventDefault();if(!editing)return;const n=nameInput.value.trim();if(!n){error.textContent='부품 이름을 입력해.';return}const target=editing;const button=form.querySelector('.part-edit-save');button.disabled=true;try{
 if(draft){await imageWrite('appearance:'+target.bike+':'+target.id,draft);const cacheKey=target.bike+':'+target.id;if(cache.has(cacheKey)){URL.revokeObjectURL(cache.get(cacheKey));cache.delete(cacheKey)}}
 if(target.bike!==bike())throw Error('차량이 변경되었어. 다시 시도해.');
 setPart(target.id,{name:n,hasImage:!!draft||!!active()[target.id]?.hasImage});
 if(target.id.startsWith('custom-')){try{const all=JSON.parse(localStorage.getItem(addedKey)||'{}');if(Array.isArray(all[target.bike])){const entry=all[target.bike].find(x=>x.id===target.id);if(entry){entry.name=n;localStorage.setItem(addedKey,JSON.stringify(all))}}}catch(err){console.warn('Custom label sync:',err)}}
 closeModal();refresh();
}catch(err){error.textContent=err.message||'저장하지 못했어.'}finally{button.disabled=false}});
function imageKey(b,id){return 'appearance:'+b+':'+id}
function wrap(row){if(!row.dataset.partId||row.closest('.part-swipe-wrap'))return;const parent=row.parentNode;const shell=document.createElement('div');shell.className='part-swipe-wrap';shell.dataset.partId=row.dataset.partId;const actions=document.createElement('div');actions.className='part-swipe-actions';actions.innerHTML='<button class="part-swipe-edit" type="button">수정</button><button class="part-swipe-delete" type="button">삭제</button>';parent.insertBefore(shell,row);shell.append(actions,row);actions.querySelector('.part-swipe-edit').addEventListener('click',()=>edit(row));actions.querySelector('.part-swipe-delete').addEventListener('click',()=>remove(row));shell.addEventListener('touchstart',start,{passive:true});shell.addEventListener('touchmove',move,{passive:false});shell.addEventListener('touchend',finish,{passive:true});shell.addEventListener('touchcancel',cancelGesture,{passive:true});
}
/* A 380ms stationary hold starts a card reorder; a quick left swipe still reveals actions. */
function groupKey(parent){if(parent===rows)return 'base';if(parent.classList.contains('extra-stock-container'))return 'extra';if(parent.classList.contains('custom-part-container'))return 'custom';if(parent.classList.contains('stock-part-container'))return 'standard';return null}
function cardChildren(parent){return [...parent.children].filter(el=>el.classList.contains('part-swipe-wrap'))}
function saveOrder(parent){const group=groupKey(parent);if(!group)return;orders[bike()]={...(orders[bike()]||{}),[group]:cardChildren(parent).map(el=>el.dataset.partId)};localStorage.setItem(orderKey,JSON.stringify(orders))}
function restoreOrder(){for(const group of [rows,...rows.querySelectorAll('.stock-part-container,.custom-part-container')]){const key=groupKey(group),saved=orders[bike()]?.[key];if(!key||!Array.isArray(saved))continue;const cards=cardChildren(group);if(cards.length<2)continue;const indexes=new Map(saved.map((id,i)=>[id,i]));const ranked=cards.map((el,i)=>({el,rank:indexes.has(el.dataset.partId)?indexes.get(el.dataset.partId):10000+i})).sort((a,b)=>a.rank-b.rank).map(x=>x.el);for(let i=0;i<ranked.length;i++){const current=cardChildren(group);if(current[i]!==ranked[i])group.insertBefore(ranked[i],current[i]||null)}}}
function start(e){if(e.touches.length!==1||!mask.hidden)return;const t=e.touches[0],shell=e.currentTarget;
 gesture={wrap:shell,x:t.clientX,y:t.clientY,currentX:t.clientX,currentY:t.clientY,dragging:false,timer:null};
 // Do not initiate a drag on an action button or the service wrench.
 if(e.target.closest('.part-swipe-actions,.service'))return;
 const g=gesture;g.timer=setTimeout(()=>{if(gesture===g)beginDrag(g)},380);
}
function beginDrag(g){const shell=g.wrap;if(!shell?.isConnected)return;closeSwipe();const row=shell.querySelector(':scope > .part');if(!row)return;const rect=row.getBoundingClientRect();const ghost=row.cloneNode(true);ghost.classList.add('part-drag-ghost');Object.assign(ghost.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',transition:'none',transform:'none'});document.body.appendChild(ghost);shell.classList.add('drag-source');g.dragging=true;
 drag={g,shell,ghost,from:shell.parentElement,y:g.currentY,target:null,after:false};
 if(navigator.vibrate)try{navigator.vibrate(18)}catch{}
}
function findTarget(x,y){if(!drag)return;const el=document.elementFromPoint(x,y),shell=el?.closest('.part-swipe-wrap');if(!shell||shell===drag.shell||shell.parentElement!==drag.from||shell.hidden)return;return shell}
function move(e){const g=gesture;if(!g||g.wrap!==e.currentTarget||e.touches.length!==1)return;const t=e.touches[0];g.currentX=t.clientX;g.currentY=t.clientY;
 if(!g.dragging){if(Math.hypot(t.clientX-g.x,t.clientY-g.y)>12){clearTimeout(g.timer);g.timer=null}return}
 e.preventDefault();if(!drag)return;
 drag.ghost.style.top=(t.clientY-(g.y-drag.shell.getBoundingClientRect().top))+'px';
 const candidate=findTarget(t.clientX,t.clientY);
 if(drag.target&&drag.target!==candidate)drag.target.classList.remove('part-drop-before','part-drop-after');
 if(candidate){const after=t.clientY>candidate.getBoundingClientRect().top+candidate.getBoundingClientRect().height/2;
 if(drag.target===candidate)candidate.classList.remove('part-drop-before','part-drop-after');
 candidate.classList.add(after?'part-drop-after':'part-drop-before');drag.target=candidate;drag.after=after}
 else{drag.target=null}
 // Scroll the page near the viewport edges while the finger holds the card.
 if(t.clientY>innerHeight-105)window.scrollBy(0,11);else if(t.clientY<100)window.scrollBy(0,-11);
}
function cleanupDrag(commit){if(!drag)return;const d=drag;if(d.target)d.target.classList.remove('part-drop-before','part-drop-after');d.shell.classList.remove('drag-source');d.ghost.remove();drag=null;
 if(commit&&d.target&&d.target.parentElement===d.from){d.from.insertBefore(d.shell,d.after?d.target.nextSibling:d.target);try{saveOrder(d.from)}catch(err){console.warn('Part order could not be saved:',err)}}suppressUntil=Date.now()+550}
function finish(e){if(!gesture||gesture.wrap!==e.currentTarget)return;const g=gesture;clearTimeout(g.timer);gesture=null;if(g.dragging){cleanupDrag(true);return}
 const touch=e.changedTouches[0],dx=touch.clientX-g.x,dy=touch.clientY-g.y;if(Math.abs(dx)<37||Math.abs(dx)<Math.abs(dy)*1.3)return;const shell=e.currentTarget;if(dx<0){closeSwipe();shell.classList.add('swiped');openWrap=shell}else if(shell===openWrap)closeSwipe()}
function cancelGesture(){if(gesture)clearTimeout(gesture.timer);gesture=null;cleanupDrag(false)}
rows.addEventListener('click',e=>{if(Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
document.addEventListener('click',e=>{if(openWrap&&!openWrap.contains(e.target))closeSwipe()});
function remove(row){const id=row.dataset.partId,label=row.querySelector('.part-line strong')?.textContent||'항목';closeSwipe();if(!confirm('“'+label+'” 항목을 목록에서 삭제할까?\n기존 정비 기록은 삭제되지 않고, 아래 복원 버튼으로 되돌릴 수 있어.'))return;try{setPart(id,{hidden:true});refresh()}catch{alert('삭제 상태를 저장하지 못했어.')}}
const restore=document.createElement('button');restore.type='button';restore.className='part-restore-button';restore.hidden=true;restore.textContent='삭제한 정비 항목 복원';rows.appendChild(restore);
restore.addEventListener('click',()=>{const b=bike(),hidden=Object.entries(active()).filter(([id,x])=>x.hidden).map(([id])=>id);if(!hidden.length)return;if(!confirm('숨긴 정비 항목 '+hidden.length+'개를 다시 표시할까?'))return;hidden.forEach(id=>setPart(id,{hidden:false}));refresh()});
function ensureName(row){if(!originals.has(row)){const strong=row.querySelector('.part-line strong');const pic=row.querySelector('.part-img');originals.set(row,{name:strong?.textContent||'',html:pic?.innerHTML||'',cls:pic?.className||''})}}
async function decorate(){const serial=++updateNumber,b=bike();const all=[...rows.querySelectorAll('.part:not(.part-add-card)')];all.forEach(wrap);restoreOrder();
 const values=active(),hidden=Object.values(values).filter(v=>v.hidden).length;restore.hidden=!hidden;restore.textContent='삭제한 정비 항목 복원 ('+hidden+'개)';
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
function refresh(){decorate()}
document.addEventListener('motorcycle:change',refresh);
document.addEventListener('motorcycle:custom-parts-change',()=>queueMicrotask(refresh));
const observer=new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.part')||n.querySelector?.('.part')||(n.matches?.('img')&&n.closest?.('.custom-part'))))))refresh()});
observer.observe(rows,{subtree:true,childList:true});
refresh();
})();