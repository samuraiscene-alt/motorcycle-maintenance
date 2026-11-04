(()=>{
'use strict';
const cards=[...document.querySelectorAll('.part')];
const types=[{id:'oil',label:'엔진오일'},{id:'brake',label:'브레이크 패드'},{id:'tire',label:'타이어'},{id:'coolant',label:'냉각수'},{id:'filter',label:'에어필터'}];
const namesKey='motorcycle-skeleton-card-labels-v1';
let names={};try{const loaded=JSON.parse(localStorage.getItem(namesKey)||'{}');if(loaded&&typeof loaded==='object'&&!Array.isArray(loaded))names=loaded}catch{}
let active=document.body.dataset.activeBike||'pcx125',editing=-1,urls=cards.map(()=>null),seq=0;
const defaults=cards.map(card=>({label:card.querySelector('.part-line strong').textContent,src:card.querySelector('.part-img img').getAttribute('src')}));
const dlg=document.createElement('div');
dlg.className='part-edit-mask';dlg.id='part-edit-mask';dlg.hidden=true;dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-labelledby','part-edit-title');
dlg.innerHTML='<div class="part-edit-sheet"><header><strong id="part-edit-title">소모품 수정</strong><button type="button" id="part-edit-close" aria-label="닫기">×</button></header><div class="part-edit-preview"><img id="part-edit-preview" alt="선택한 부품 이미지 미리보기"></div><div class="part-edit-fileactions"><button type="button" id="part-edit-photos">사진첩</button><button type="button" id="part-edit-files">파일함</button></div><label for="part-edit-name">부품·소모품 이름</label><input type="text" id="part-edit-name" maxlength="24" autocomplete="off" placeholder="부품 이름"><p class="part-edit-error" id="part-edit-error" role="alert"></p><button type="button" id="part-edit-save">이름 저장</button><small>사진과 이름은 현재 오토바이에만 적용돼. 기존 기록·교체 주기는 그대로 유지돼.</small><input id="part-edit-photo-input" type="file" accept="image/*" hidden><input id="part-edit-files-input" type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.png,.jpg,.jpeg,.webp,.heic,.heif" hidden></div>';
document.body.appendChild(dlg);
const el=id=>document.getElementById(id);
const nameInput=el('part-edit-name'),preview=el('part-edit-preview'),error=el('part-edit-error'),photoInput=el('part-edit-photo-input'),fileInput=el('part-edit-files-input');
function key(i,bike=active){return bike+':'+types[i].id}
function displayName(i,bike=active){const value=names[key(i,bike)];return typeof value==='string'&&value.trim()?value:defaults[i].label}
function updateLabel(i){const row=cards[i],label=displayName(i);row.querySelector('.part-line strong').textContent=label;row.querySelector('.service').setAttribute('aria-label',label+' 정비기록 등록');row.querySelector('.part-img').setAttribute('aria-label',label+' 사진 변경')}
function currentImage(i){return urls[i]||defaults[i].src}
let connectionPromise;
function db(){if(!('indexedDB'in window))return Promise.reject(new Error('현재 브라우저는 이미지 저장을 지원하지 않아.'));
if(!connectionPromise)connectionPromise=new Promise((resolve,reject)=>{const request=indexedDB.open('motorcycle-skeleton-card-pictures',1);request.onupgradeneeded=()=>{const database=request.result;if(!database.objectStoreNames.contains('photos'))database.createObjectStore('photos')};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('이미지 저장소 연결 실패'))});
return connectionPromise}
async function getImage(k){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('photos','readonly'),req=tx.objectStore('photos').get(k);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}
async function putImage(k,blob){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('photos','readwrite');tx.objectStore('photos').put(blob,k);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('이미지 저장 실패'));tx.onabort=()=>reject(tx.error||new Error('이미지 저장 중단'))})}
function renderImage(i,blob,bike){if(bike!==active)return;const img=cards[i].querySelector('.part-img img');if(urls[i])URL.revokeObjectURL(urls[i]);urls[i]=blob?URL.createObjectURL(blob):null;img.src=currentImage(i);img.classList.toggle('personal-part-image',!!blob)}
async function renderAll(){const requested=active,generation=++seq;cards.forEach((row,i)=>{updateLabel(i);if(urls[i])URL.revokeObjectURL(urls[i]);urls[i]=null;const img=row.querySelector('.part-img img');img.classList.remove('personal-part-image');img.src=defaults[i].src});
try{const loaded=await Promise.all(cards.map((_,i)=>getImage(key(i,requested))));if(generation!==seq||active!==requested)return;loaded.forEach((blob,i)=>renderImage(i,blob,requested))}catch(e){console.warn('Custom image loading:',e)}}
function open(i){editing=i;error.textContent='';nameInput.value=displayName(i);preview.src=currentImage(i);dlg.hidden=false;document.body.classList.add('part-edit-open');nameInput.focus({preventScroll:true})}
function close(){editing=-1;dlg.hidden=true;document.body.classList.remove('part-edit-open');photoInput.value='';fileInput.value='';error.textContent=''}
el('part-edit-close').addEventListener('click',close);
dlg.addEventListener('click',e=>{if(e.target===dlg)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dlg.hidden){e.stopPropagation();close()}});
el('part-edit-photos').addEventListener('click',()=>{photoInput.value='';photoInput.click()});
el('part-edit-files').addEventListener('click',()=>{fileInput.value='';fileInput.click()});
function commitName(){if(editing<0)return;const label=nameInput.value.trim();if(!label){error.textContent='부품 이름을 입력해.';nameInput.focus();return}try{const next={...names,[key(editing)]:label};localStorage.setItem(namesKey,JSON.stringify(next));names=next;updateLabel(editing);close()}catch{error.textContent='이름을 저장할 수 없어. 기기 저장공간을 확인해.'}}
el('part-edit-save').addEventListener('click',commitName);
nameInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commitName()}});
async function scaleImage(file){
const allowed=/^image\//.test(file.type)||/\.(png|jpe?g|webp|heic|heif)$/i.test(file.name||'');
if(!allowed)throw new Error('이미지 파일만 선택할 수 있어.');
if(file.size>18*1024*1024)throw new Error('이미지는 18MB 이하로 선택해.');
const source=URL.createObjectURL(file);
try{const img=new Image();img.src=source;await img.decode();const max=640,ratio=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('이미지 변환을 지원하지 않아.');ctx.drawImage(img,0,0,canvas.width,canvas.height);
return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('이미지 변환 실패')),'image/png'))}
finally{URL.revokeObjectURL(source)}
}
async function handlePick(e){const file=e.target.files?.[0],i=editing,bike=active;if(!file||i<0)return;error.textContent='이미지 처리 중…';
try{const blob=await scaleImage(file);await putImage(key(i,bike),blob);if(active===bike)renderImage(i,blob,bike);if(editing===i&&active===bike){preview.src=currentImage(i);error.textContent='그림 저장 완료'} }
catch(err){error.textContent=err?.message||'파일을 열 수 없어. JPG/PNG 이미지를 사용해 줘.'}
finally{e.target.value=''}}
photoInput.addEventListener('change',handlePick);fileInput.addEventListener('change',handlePick);
cards.forEach((row,i)=>{const picture=row.querySelector('.part-img'),title=row.querySelector('.part-line strong');for(const target of [picture,title]){target.setAttribute('role','button');target.setAttribute('tabindex','0');target.setAttribute('title','사진 또는 부품 이름 변경');target.addEventListener('click',()=>open(i));target.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(i)}})}})
document.addEventListener('motorcycle:change',e=>{active=e.detail?.bikeId||document.body.dataset.activeBike||'pcx125';renderAll()});
renderAll();
})();