(()=>{'use strict';
const LEGACY_KEYS=['motorcycle-skeleton-registrations-v1','motorcycle-skeleton-maintenance-v1','motorcycle-skeleton-selected-vehicle-v1','motorcycle-skeleton-added-parts-v1','motorcycle-skeleton-part-appearance-v1','motorcycle-skeleton-part-order-v1'];
const MIGRATION_KEY='motorcycle-skeleton-priority-layout-v1';
const KEYS=[...LEGACY_KEYS,MIGRATION_KEY];
const DB='motorcycle-skeleton-added-images-v1',MAGIC='motorcycle-maintenance-full-backup';
const style=document.createElement('style');
style.textContent='.backup-overlay[hidden]{display:none!important}.backup-overlay{position:fixed;inset:0;z-index:180;background:#02070dd9;display:flex;align-items:flex-end;justify-content:center;padding:12px 12px max(24px,env(safe-area-inset-bottom))}.backup-panel{width:100%;max-width:540px;max-height:88dvh;overflow:auto;border:1px solid #92afc8;border-radius:17px;padding:18px;background:linear-gradient(150deg,#344c65,#13263a 34%,#09121e);color:#edf8ff}.backup-panel-header{display:flex;align-items:center;justify-content:space-between}.backup-panel-header strong{font-size:19px}.backup-panel-header button{border:1px solid #8ca8c1;border-radius:8px;background:#172e43;color:white;width:36px;height:36px;font-size:24px}.backup-panel p{font-size:12px;color:#c4d9ea;line-height:1.7}.backup-panel section{border:1px solid #58738c;border-radius:12px;background:#091c2e;padding:13px;margin:14px 0}.backup-panel section strong{font-size:15px}.backup-btn{width:100%;height:48px;border:1px solid #a2d8fc;border-radius:10px;background:linear-gradient(#4bb2fa,#0860ad);color:white;font-size:15px;font-weight:850}.backup-btn.secondary{background:linear-gradient(#465d73,#21344c);border-color:#92a9bf}.backup-btn:disabled{opacity:.5}.backup-status{min-height:18px;color:#aadfff!important;white-space:pre-line}.backup-file{position:absolute;opacity:0;width:1px;height:1px}';
document.head.appendChild(style);
const overlay=document.createElement('div');overlay.className='backup-overlay';overlay.hidden=true;
overlay.innerHTML='<div class="backup-panel" role="dialog" aria-modal="true" aria-label="백업 및 복원"><div class="backup-panel-header"><strong>설정 · 백업 및 복원</strong><button type="button" class="backup-close" aria-label="닫기">×</button></div><p>차량 정보, 정비기록, 주행거리, 소모품 설정과 순서, 직접 추가한 항목 및 사용자 사진까지 백업해.</p><section><strong>전체 백업</strong><p>현재 기기 데이터를 파일 앱이나 iCloud Drive에 보관해.</p><button type="button" class="backup-btn backup-save">전체 백업 파일 저장</button></section><section><strong>백업 파일 검사 (읽기 전용)</strong><p>현재 기록을 바꾸지 않고 백업 파일의 손상 여부와 차량·정비기록·사진 개수를 확인해.</p><button type="button" class="backup-btn secondary backup-check">백업 파일 검사</button><input type="file" class="backup-file backup-check-file" accept=".json,application/json"><p class="backup-check-result" role="status" aria-live="polite"></p></section><section><strong>전체 복원</strong><p>백업 파일을 선택하면 해당 앱 데이터가 백업 시점으로 변경돼.</p><button type="button" class="backup-btn secondary backup-load">백업 파일 선택하여 복원</button><input type="file" class="backup-file" accept=".json,application/json"></section><p>복원 전에는 현재 데이터도 백업해. Safari 웹사이트 데이터를 삭제하면 기록이 사라질 수 있어.</p><p class="backup-status" role="status" aria-live="polite"></p></div>';
document.body.appendChild(overlay);
const transferSection=document.createElement('section');
transferSection.className='browser-transfer-section';
transferSection.innerHTML='<strong>Safari ↔ 다른 브라우저 기록 옮기기</strong><p>두 브라우저는 저장 공간이 달라 자동으로 같은 기록을 사용하지 않아. 기록이 맞는 브라우저에서 내보낸 파일을 다른 브라우저에서 가져오면 돼.</p><div class="browser-transfer-details" role="status" aria-live="polite"></div><button type="button" class="backup-btn browser-transfer-export">① 이 브라우저 기록 파일로 내보내기</button><button type="button" class="backup-btn secondary browser-transfer-import" style="margin-top:9px">② 다른 브라우저의 기록 파일 가져오기</button><p>가져오기는 기존 기록과 합치는 것이 아니라 <b>이 브라우저의 모든 차량·정비기록·설정을 파일 내용으로 교체</b>해. 가져오기 전에 이쪽 기록도 백업하는 걸 권장해.</p>';
overlay.querySelector('.backup-panel-header').after(transferSection);
function recordCount(raw){
 try{const all=JSON.parse(raw||'{}');return Object.values(all).reduce((sum,b)=>sum+Object.values(b?.records||{}).reduce((n,entries)=>n+(Array.isArray(entries)?entries.length:0),0),0)}catch{return 0}
}
function vehicleCount(raw){try{return Object.keys(JSON.parse(raw||'{}')).length}catch{return 0}}
const transferInfo=transferSection.querySelector('.browser-transfer-details');
function refreshTransferInfo(){
 const registered=localStorage.getItem('motorcycle-skeleton-registrations-v1'),maintenance=localStorage.getItem('motorcycle-skeleton-maintenance-v1');
 transferInfo.textContent='현재 이 브라우저: 등록 차량 '+vehicleCount(registered)+'대 · 정비기록 '+recordCount(maintenance)+'건';
}
transferSection.querySelector('.browser-transfer-export').addEventListener('click',()=>overlay.querySelector('.backup-save').click());
transferSection.querySelector('.browser-transfer-import').addEventListener('click',()=>overlay.querySelector('.backup-load').click());
const extraStyle=document.createElement('style');
extraStyle.textContent='.browser-transfer-section{border-color:#69a0cc!important}.browser-transfer-details{padding:10px;border-radius:8px;background:#213c56;color:#e9f5ff;font-size:12px;font-weight:850;margin:10px 0}.browser-transfer-section b{color:#ffdbb7}';
document.head.appendChild(extraStyle);
const checkStyle=document.createElement('style');
checkStyle.textContent='.backup-check-result{white-space:pre-line;overflow-wrap:anywhere;border-radius:10px;padding:11px 12px;margin-top:12px!important;border:1px solid #49647c;background:#162a3d;color:#d9ebf7!important}.backup-check-result[data-state="idle"]{display:none}.backup-check-result[data-state="checking"]{border-color:#6493b8;background:#18364f;color:#cfe9ff!important}.backup-check-result[data-state="ok"]{border-color:#477f72;background:#16372f;color:#b9f5db!important}.backup-check-result[data-state="warning"]{border-color:#a98143;background:#3d311b;color:#ffe0a0!important}.backup-check-result[data-state="error"]{border-color:#b96a74;background:#40232b;color:#ffd0d5!important}';
document.head.appendChild(checkStyle);

const get=x=>overlay.querySelector(x),save=get('.backup-save'),load=get('.backup-load'),pick=get('.backup-file:not(.backup-check-file)'),check=get('.backup-check'),checkPick=get('.backup-check-file'),checkResult=get('.backup-check-result'),status=get('.backup-status');
let busy=false;
checkResult.dataset.state='idle';
function showCheckResult(state,lines){
 checkResult.dataset.state=state;
 checkResult.textContent=lines;
}
function message(x){status.textContent=x}
function lock(x){busy=x;save.disabled=x;load.disabled=x;check.disabled=x;selfTestButton.disabled=x;if(typeof simulationButton!=='undefined')simulationButton.disabled=x;get('.backup-close').disabled=x}
function hide(){if(!busy)overlay.hidden=true}
get('.backup-close').addEventListener('click',hide);
overlay.addEventListener('click',e=>{if(e.target===overlay)hide()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)hide()});
for(const el of [...document.querySelectorAll('.tabs .tab'),...document.querySelectorAll('.bottom .nav')]){
 if(el.textContent.trim()!=='설정')continue;
 el.tabIndex=0;el.setAttribute('role','button');el.addEventListener('click',()=>{overlay.hidden=false;message('');refreshTransferInfo()});
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();overlay.hidden=false;message('');refreshTransferInfo()}});
}
function locals(){const result={};for(const k of KEYS)result[k]=localStorage.getItem(k);return result}
function setLocals(result){
 for(const k of KEYS){
  // Legacy backups omit the migration marker. Clear only that absent
  // optional key so a newer device's card order cannot leak into restore.
  if(!Object.prototype.hasOwnProperty.call(result,k)){
   if(k===MIGRATION_KEY)localStorage.removeItem(k);
   continue;
  }
  if(result[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,result[k]);
 }
}
function verifyLocals(expected){
 for(const k of KEYS){
  if(!Object.prototype.hasOwnProperty.call(expected,k)){
   if(k===MIGRATION_KEY&&localStorage.getItem(k)!==null)
    throw new Error('구버전 복원 후 카드 정렬 설정이 남아 있어.');
   continue;
  }
  if(localStorage.getItem(k)!==expected[k])throw new Error('복원한 설정을 다시 확인할 수 없어: '+k);
 }
}
function openDb(){return new Promise((resolve,reject)=>{
 const req=indexedDB.open(DB,1);
 req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('images'))req.result.createObjectStore('images')};
 req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('사진 저장소 오류'));
 req.onblocked=()=>reject(new Error('다른 앱 창을 닫고 다시 실행해.'));
})}
async function getImages(){
 const db=await openDb();
 try{return await new Promise((resolve,reject)=>{
 const tx=db.transaction('images','readonly'),store=tx.objectStore('images'),keys=store.getAllKeys(),values=store.getAll();
 tx.oncomplete=()=>resolve(keys.result.map((k,i)=>({key:k,blob:values.result[i]})));
 tx.onerror=()=>reject(tx.error||new Error('사진 읽기 오류'));tx.onabort=()=>reject(tx.error||new Error('사진 읽기 중단'));
 })}finally{db.close()}
}
async function setImages(entries){
 const db=await openDb();
 try{return await new Promise((resolve,reject)=>{
 const tx=db.transaction('images','readwrite'),store=tx.objectStore('images');
 store.clear();for(const item of entries)store.put(item.blob,item.key);
 tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error('사진 저장 오류'));tx.onabort=()=>reject(tx.error||new Error('사진 저장 중단'));
 })}finally{db.close()}
}
function base64(bytes){let str='';for(let i=0;i<bytes.length;i+=32768)str+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(str)}
function unbase64(value){const raw=atob(value),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return bytes}
async function packImages(images){const out=[];for(const item of images){
 if(typeof item.key!=='string'||!(item.blob instanceof Blob))throw new Error('사진 데이터 형식이 올바르지 않아.');
 out.push({key:item.key,mime:item.blob.type||'image/png',data:base64(new Uint8Array(await item.blob.arrayBuffer()))});
}return out}
function unpackImages(images){return images.map(item=>({key:item.key,blob:new Blob([unbase64(item.data)],{type:item.mime})}))}
async function blobDigest(blob){
 const bytes=new Uint8Array(await blob.arrayBuffer());
 const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
 return Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');
}
async function verifyImages(expected){
 const actual=await getImages();
 if(actual.length!==expected.length)throw new Error('복원 사진 개수가 일치하지 않아.');
 const current=new Map(actual.map(item=>[item.key,item.blob]));
 for(const item of expected){
  const blob=current.get(item.key);
  if(!(blob instanceof Blob)||blob.size!==item.blob.size||blob.type!==item.blob.type)
   throw new Error('복원한 사진의 정보가 일치하지 않아: '+item.key);
  if(await blobDigest(blob)!==await blobDigest(item.blob))
   throw new Error('복원한 사진의 내용이 일치하지 않아: '+item.key);
 }
}
function obj(x){return x!==null&&typeof x==='object'&&!Array.isArray(x)}
function validate(payload){
 if(!obj(payload)||!obj(payload.local)||!Array.isArray(payload.images))throw new Error('백업 파일 형식이 맞지 않아.');
 const storedKeys=Object.keys(payload.local);
 if(storedKeys.length!==LEGACY_KEYS.length&&storedKeys.length!==KEYS.length)throw new Error('백업 저장 항목 수가 맞지 않아.');
 if(storedKeys.some(k=>!KEYS.includes(k)))throw new Error('알 수 없는 백업 항목이 있어.');
 for(const k of LEGACY_KEYS){
  if(!Object.prototype.hasOwnProperty.call(payload.local,k))throw new Error('백업 항목이 누락됐어.');
  const x=payload.local[k];if(x!==null&&typeof x!=='string')throw new Error('백업 설정이 올바르지 않아.');
  if(x!==null&&k!=='motorcycle-skeleton-selected-vehicle-v1'){
   let parsed;try{parsed=JSON.parse(x)}catch{throw new Error('백업 설정을 읽을 수 없어.')}
   if(!obj(parsed))throw new Error('백업 설정 구조가 맞지 않아.');
  }
 }
 if(Object.prototype.hasOwnProperty.call(payload.local,MIGRATION_KEY)){
  const migration=payload.local[MIGRATION_KEY];
  if(migration!==null){
   if(typeof migration!=='string')throw new Error('카드 순서 변환 설정이 올바르지 않아.');
   let parsed;try{parsed=JSON.parse(migration)}catch{throw new Error('카드 순서 변환 설정을 읽을 수 없어.');}
   if(!obj(parsed))throw new Error('카드 순서 변환 설정 구조가 맞지 않아.');
  }
 }
 const registrations=JSON.parse(payload.local['motorcycle-skeleton-registrations-v1']||'{}');
 const maintenance=JSON.parse(payload.local['motorcycle-skeleton-maintenance-v1']||'{}');
 // Registrations may exist before the first maintenance log, but saved
 // maintenance data must always belong to a registered motorcycle.
 for(const [bikeId,registration] of Object.entries(registrations)){
  if(!obj(registration))throw new Error('차량 등록정보 형식이 잘못됐어: '+bikeId);
  if(!Number.isSafeInteger(registration.km)||registration.km<0||registration.km>9999999)
   throw new Error('차량 등록 시 주행거리를 확인해: '+bikeId);
 }
 for(const bikeId of Object.keys(maintenance)){
  if(!Object.prototype.hasOwnProperty.call(registrations,bikeId))
   throw new Error('등록되지 않은 차량의 정비기록이 있어: '+bikeId);
 }
 const now=new Date();
 const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 const validDate=(date)=>{
  if(typeof date!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date))return false;
  const [y,m,d]=date.split('-').map(Number);
  const parsed=new Date(y,m-1,d);
  return parsed.getFullYear()===y&&parsed.getMonth()===m-1&&parsed.getDate()===d;
 };
 for(const [bikeId,vehicle] of Object.entries(maintenance)){
  if(!obj(vehicle)||!obj(vehicle.records))throw new Error('정비 데이터 구조가 올바르지 않아.');
  const registration=registrations[bikeId];
  const odo=vehicle.odometer;
  // A saved odometer must never be below the motorcycle's registration reading.
  if(odo!==undefined&&(!Number.isSafeInteger(odo)||odo<0||odo>9999999))
   throw new Error('계기판 주행거리 형식이 잘못됐어: '+bikeId);
  if(obj(registration)&&Number.isSafeInteger(registration.km)&&Number.isSafeInteger(odo)&&odo<registration.km)
   throw new Error('현재 주행거리가 등록 시 주행거리보다 작아: '+bikeId);
  // Older backups can have no odometer history; validate only saved entries.
  if(vehicle.odometerHistory!==undefined){
   if(!Array.isArray(vehicle.odometerHistory))throw new Error('주행거리 변경 이력 형식이 잘못됐어: '+bikeId);
   for(const entry of vehicle.odometerHistory){
    if(!obj(entry)||!Number.isSafeInteger(entry.at)||entry.at<0||entry.at>9999999||
       typeof entry.date!=='string'||!Number.isFinite(Date.parse(entry.date)))
     throw new Error('주행거리 변경 이력 값이 잘못됐어: '+bikeId);
    if(entry.type!==undefined&&entry.type!=='correction')
     throw new Error('주행거리 정정 이력 종류가 잘못됐어: '+bikeId);
    if(entry.previous!==undefined&&(!Number.isSafeInteger(entry.previous)||entry.previous<0||entry.previous>9999999))
     throw new Error('정정 이전 주행거리 값이 잘못됐어: '+bikeId);
   }
  }
  for(const [partId,records] of Object.entries(vehicle.records)){
   if(!Array.isArray(records))throw new Error('정비기록 목록 형식이 잘못됐어: '+partId);
   const seen=new Set();
   for(const item of records){
    if(!obj(item)||!Number.isSafeInteger(item.at)||item.at<0||item.at>9999999||
       !Number.isSafeInteger(item.interval)||item.interval<0||item.interval>1000000||
       !validDate(item.date)||item.date>today)
     throw new Error('정비 날짜·거리·주기가 유효하지 않아: '+partId);
    // Older records without an action represent replacement, not an error.
    const action=item.action||'replace';
    if(!['replace','inspect','clean'].includes(action))
     throw new Error('정비 작업 종류를 확인해: '+partId);
    if(Number.isSafeInteger(odo)&&item.at>odo)
     throw new Error('정비 당시 주행거리가 현재 주행거리를 초과해: '+partId);
    const identity=item.date+'|'+item.at+'|'+action;
    if(seen.has(identity))throw new Error('중복된 정비기록이 있어: '+partId);
    seen.add(identity);
   }
  }
 }
 if(payload.images.length>2000)throw new Error('사진이 너무 많아.');
 const keys=new Set();
 for(const image of payload.images){
  if(!obj(image)||typeof image.key!=='string'||!image.key.length||image.key.length>300||keys.has(image.key)||typeof image.mime!=='string'||!/^image\/[a-z0-9.+-]+$/i.test(image.mime)||typeof image.data!=='string'||!image.data.length||image.data.length>30000000||image.data.length%4!==0)
   throw new Error('이미지 데이터가 올바르지 않아.');
  // A valid SHA-256 proves the backup was not accidentally altered, but it
  // cannot prove an image payload can actually be restored from Base64.
  // Validate its alphabet, padding and decodability before reporting success.
  if(!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(image.data))
   throw new Error('사진 데이터가 손상됐어: '+image.key);
  try{if(!atob(image.data).length)throw new Error('empty')}
  catch{throw new Error('사진을 복원할 수 없는 파일이야: '+image.key)}
  keys.add(image.key);
 }
}
function recordChronologyWarnings(payload){
 const maintenance=JSON.parse(payload.local['motorcycle-skeleton-maintenance-v1']||'{}'),warnings=[];
 for(const [bikeId,vehicle] of Object.entries(maintenance)){
  const history=vehicle.odometerHistory;
  if(Array.isArray(history)&&history.length&&Number.isSafeInteger(vehicle.odometer)){
   const latest=history[history.length-1];
   if(latest.at!==vehicle.odometer)
    warnings.push(bikeId+': 마지막 이력 '+latest.at+'km / 현재 계기판 '+vehicle.odometer+'km 불일치');
   for(let i=1;i<history.length;i++){
    const prev=history[i-1],next=history[i];
    if(next.at<prev.at&&next.type!=='correction')
     warnings.push(bikeId+': '+prev.at+'km → '+next.at+'km 감소 (정정 표시 없음)');
   }
  }
  // Compare each dated service only with unambiguous odometer snapshots on
  // different days. Correction entries can invalidate a simple monotonic rule.
  const snapshots=Array.isArray(history)?history.map(h=>({
   day:String(h.date).slice(0,10),at:h.at,correction:h.type==='correction'
  })).filter(h=>/^\d{4}-\d{2}-\d{2}$/.test(h.day)):[];
  for(const [partId,records] of Object.entries(vehicle.records||{})){
   const byAction=new Map();
   for(const item of records){
    const action=item.action||'replace';
    if(!byAction.has(action))byAction.set(action,[]);
    byAction.get(action).push(item);
    // Older used-bike maintenance can predate all odometer history; no
    // previous reading is required for a valid historical service entry.
    if(!snapshots.length)continue;
    const prior=[...snapshots].filter(h=>h.day<item.date).sort((a,b)=>b.day.localeCompare(a.day))[0];
    const after=[...snapshots].filter(h=>h.day>item.date).sort((a,b)=>a.day.localeCompare(b.day))[0];
    if(prior&&prior.at>item.at){
     const correctionBetween=snapshots.some(h=>h.correction&&h.day>=prior.day&&h.day<=item.date);
     if(!correctionBetween)warnings.push(bikeId+' / '+partId+': '+item.date+' 정비 '+item.at+'km가 이전 '+prior.day+' 계기판 '+prior.at+'km보다 작아');
    }
    if(after&&after.at<item.at){
     const correctionBetween=snapshots.some(h=>h.correction&&h.day>=item.date&&h.day<=after.day);
     if(!correctionBetween)warnings.push(bikeId+' / '+partId+': '+item.date+' 정비 '+item.at+'km가 이후 '+after.day+' 계기판 '+after.at+'km보다 커');
    }
   }
   for(const [action,entries] of byAction){
    const ordered=[...entries].sort((a,b)=>a.date.localeCompare(b.date)||a.at-b.at);
    for(let i=1;i<ordered.length;i++){
     if(ordered[i].date!==ordered[i-1].date&&ordered[i].at<ordered[i-1].at){
      warnings.push(bikeId+' / '+partId+' / '+action+': '+ordered[i-1].date+' '+ordered[i-1].at+'km → '+ordered[i].date+' '+ordered[i].at+'km');
      break;
     }
    }
   }
  }
 }
 return warnings;
}
async function checksum(payload){const input=new TextEncoder().encode(JSON.stringify(payload)),bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',input));return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
async function inspectBackupFile(file){
 if(file.size>160*1024*1024)throw new Error('160MB 이하 백업 파일만 지원해.');
 let doc;try{doc=JSON.parse(await file.text())}catch{throw new Error('JSON 파일을 읽을 수 없어.')}
 if(!obj(doc)||doc.format!==MAGIC||doc.version!==1||!obj(doc.payload)||typeof doc.sha256!=='string')
  throw new Error('이 앱에서 만든 백업 파일이 아니야.');
 validate(doc.payload);
 if(await checksum(doc.payload)!==doc.sha256)throw new Error('백업 파일이 손상되었거나 수정됐어.');
 // The hash covers the complete payload, including every encoded photo.
 // Only calculate the summary here; never open a writable database or update localStorage.
 return {doc,vehicles:vehicleCount(doc.payload.local['motorcycle-skeleton-registrations-v1']),
  records:recordCount(doc.payload.local['motorcycle-skeleton-maintenance-v1']),
  images:doc.payload.images.length,warnings:recordChronologyWarnings(doc.payload)};
}
const selfTestButton=document.createElement('button');
selfTestButton.type='button';selfTestButton.className='backup-btn secondary';
selfTestButton.style.marginTop='9px';selfTestButton.textContent='백업 자가진단 (가상 데이터)';
checkResult.after(selfTestButton);
selfTestButton.addEventListener('click',async()=>{
 if(busy)return;
 lock(true);showCheckResult('checking','가상 백업 검증 중…');
 try{
  const local=Object.fromEntries(KEYS.map(k=>[k,k==='motorcycle-skeleton-selected-vehicle-v1'?null:'{}']));
  local['motorcycle-skeleton-registrations-v1']=JSON.stringify({'bike-test':{km:1000}});
  local['motorcycle-skeleton-maintenance-v1']=JSON.stringify({'bike-test':{
   odometer:1500,records:{oil:[{at:1200,interval:5000,date:'2025-01-10',action:'replace'}]}
  }});
  const payload={local,images:await packImages([{key:'test-photo',blob:new Blob(['test'],{type:'image/png'})}])};
  const file=new Blob([JSON.stringify({format:MAGIC,version:1,payload,sha256:await checksum(payload)})],{type:'application/json'});
  const result=await inspectBackupFile(file);
  const bytes=unpackImages(result.doc.payload.images);
  if(result.vehicles!==1||result.records!==1||result.images!==1||bytes.length!==1||await bytes[0].blob.text()!=='test')
   throw new Error('① 정상 백업·사진 복원 확인 실패');
  const validSha=await checksum(payload);
  const damagedFile=new Blob([JSON.stringify({format:MAGIC,version:1,payload,sha256:'0'.repeat(64)})],{type:'application/json'});
  let blocked=false;
  try{await inspectBackupFile(damagedFile)}catch{blocked=true}
  if(!blocked)throw new Error('② 손상된 백업 파일 차단 실패');
  const badRecords={...payload,local:{...local}};
  badRecords.local['motorcycle-skeleton-maintenance-v1']=JSON.stringify({'bike-test':{
   odometer:1500,records:{oil:[{at:1800,interval:5000,date:'2025-01-10',action:'replace'}]}
  }});
  blocked=false;try{validate(badRecords)}catch{blocked=true}
  if(!blocked)throw new Error('③ 현재 주행거리를 초과한 정비기록 차단 실패');
  const badPhoto={...payload,images:[{...payload.images[0],data:'!!!!'}]};
  blocked=false;try{validate(badPhoto)}catch{blocked=true}
  if(!blocked)throw new Error('④ 손상된 사진 데이터 차단 실패');
  if(validSha!==result.doc.sha256)throw new Error('검증값이 일치하지 않아.');
  // Older backups have six localStorage keys without the optional migration key.
  const legacyPayload={local:Object.fromEntries(LEGACY_KEYS.map(k=>[k,local[k]])),images:payload.images};
  const legacyFile=new Blob([JSON.stringify({
   format:MAGIC,version:1,payload:legacyPayload,sha256:await checksum(legacyPayload)
  })],{type:'application/json'});
  const legacy=await inspectBackupFile(legacyFile);
  if(legacy.vehicles!==1||legacy.records!==1||legacy.images!==1||
     Object.prototype.hasOwnProperty.call(legacy.doc.payload.local,MIGRATION_KEY))
   throw new Error('⑤ 구버전 백업 호환 검사 실패');
  // An orphan maintenance record must not be accepted during inspection.
  const orphan={...payload,local:{...local}};
  orphan.local['motorcycle-skeleton-maintenance-v1']=JSON.stringify({'bike-missing':{
   odometer:1500,records:{oil:[{at:1200,interval:5000,date:'2025-01-10',action:'replace'}]}
  }});
  blocked=false;try{validate(orphan)}catch{blocked=true}
  if(!blocked)throw new Error('⑥ 미등록 차량 정비기록 차단 실패');
  showCheckResult('ok','✓ 자가진단 6/6 통과\n① 정상 백업·사진 확인\n② 손상된 파일 차단\n③ 잘못된 정비기록 차단\n④ 손상된 사진 차단\n⑤ 구버전 6개 항목 백업 호환\n⑥ 미등록 차량 기록 차단\n실제 사용자 데이터는 변경하지 않았어.');
 }catch(e){showCheckResult('error','✕ 자가진단 실패 · '+(e.message||e))}
 finally{lock(false)}
});
async function applyRestore(adapter,incoming,faultStage){
 const previous={local:await adapter.readLocal(),images:await adapter.readImages()};
 let changedImages=false,changedLocal=false;
 try{
  changedImages=true;await adapter.writeImages(incoming.images);
  if(faultStage==='images')throw new Error('강제 오류: 사진 저장 직후');
  changedLocal=true;await adapter.writeLocal(incoming.local);
  if(faultStage==='local')throw new Error('강제 오류: 차량 기록 저장 직후');
  await adapter.verifyLocal(incoming.local);await adapter.verifyImages(incoming.images);
 }catch(err){
  const failures=[];
  if(changedLocal)try{await adapter.writeLocal(previous.local);await adapter.verifyLocal(previous.local)}
   catch(e){failures.push('차량 기록: '+(e.message||e))}
  if(changedImages)try{await adapter.writeImages(previous.images);await adapter.verifyImages(previous.images)}
   catch(e){failures.push('사진: '+(e.message||e))}
  if(failures.length)throw new Error('복원 및 자동 원상복구 일부 실패. 새로고침하지 말고 백업 파일을 보관해. '+failures.join(' / '));
  throw new Error('복원이 완료되지 않아 기존 데이터로 되돌렸어. 원인: '+(err.message||err));
 }
}
const actualRestore={
 readLocal:async()=>locals(),readImages:getImages,
 writeLocal:async v=>setLocals(v),writeImages:setImages,
 verifyLocal:async v=>verifyLocals(v),verifyImages
};
// An isolated database is used for simulated restore; the production DB is never opened.
const simulationButton=document.createElement('button');
simulationButton.type='button';simulationButton.className='backup-btn secondary';
simulationButton.style.marginTop='9px';simulationButton.textContent='복원 모의실험 (별도 저장소)';
selfTestButton.after(simulationButton);
async function simulateRestore(){
 const databaseName='motorcycle-maintenance-restore-simulation-v1';
 let db,passed=false;
 const oldData={bike:'original-test-bike',km:1000,service:{at:700,interval:5000},photo:new Blob(['old-photo'],{type:'image/png'})};
 const newData={bike:'restored-test-bike',km:1700,service:{at:1200,interval:5000},photo:new Blob(['new-photo'],{type:'image/png'})};
 try{
  db=await new Promise((resolve,reject)=>{
   const request=indexedDB.open(databaseName,1);
   request.onupgradeneeded=()=>{
    const created=request.result;
    if(!created.objectStoreNames.contains('data'))created.createObjectStore('data');
   };
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error||new Error('시험 저장소 생성 실패'));
   request.onblocked=()=>reject(new Error('이전 자가진단 창을 닫고 다시 시도해.'));
  });
  const write=values=>new Promise((resolve,reject)=>{
   const tx=db.transaction('data','readwrite'),store=tx.objectStore('data');
   store.clear();
   for(const key of ['bike','km','service','photo'])store.put(values[key],key);
   tx.oncomplete=()=>resolve();
   tx.onerror=()=>reject(tx.error||new Error('시험 기록 저장 실패'));
   tx.onabort=()=>reject(tx.error||new Error('시험 기록 저장 중단'));
  });
  const read=()=>new Promise((resolve,reject)=>{
   const tx=db.transaction('data','readonly'),store=tx.objectStore('data');
   const result={};
   for(const key of ['bike','km','service','photo'])
    store.get(key).onsuccess=e=>{result[key]=e.target.result};
   tx.oncomplete=()=>resolve(result);
   tx.onerror=()=>reject(tx.error||new Error('시험 기록 읽기 실패'));
   tx.onabort=()=>reject(tx.error||new Error('시험 기록 읽기 중단'));
  });
  const verify=async expected=>{
   const actual=await read();
   if(actual.bike!==expected.bike||actual.km!==expected.km||
      JSON.stringify(actual.service)!==JSON.stringify(expected.service)||
      !(actual.photo instanceof Blob)||actual.photo.type!==expected.photo.type||
      await blobDigest(actual.photo)!==await blobDigest(expected.photo))
    throw new Error('복원·원상복구 데이터 검증 실패');
  };
  const sandboxAdapter={
   readLocal:async()=>{const v=await read();return {bike:v.bike,km:v.km,service:v.service}},
   readImages:async()=>[{key:'photo',blob:(await read()).photo}],
   writeLocal:async v=>write({...v,photo:(await read()).photo}),
   writeImages:async v=>write({...await read(),photo:v[0].blob}),
   verifyLocal:async v=>{const a=await read();if(a.bike!==v.bike||a.km!==v.km||JSON.stringify(a.service)!==JSON.stringify(v.service))throw new Error('차량 기록 불일치')},
   verifyImages:async v=>{const a=await read();if(!(a.photo instanceof Blob)||a.photo.type!==v[0].blob.type||await blobDigest(a.photo)!==await blobDigest(v[0].blob))throw new Error('사진 불일치')}
  };
  const old={local:{bike:oldData.bike,km:oldData.km,service:oldData.service},images:[{key:'photo',blob:oldData.photo}]};
  const incoming={local:{bike:newData.bike,km:newData.km,service:newData.service},images:[{key:'photo',blob:newData.photo}]};
  await write(oldData);
  await applyRestore(sandboxAdapter,incoming);
  await sandboxAdapter.verifyLocal(incoming.local);await sandboxAdapter.verifyImages(incoming.images);
  for(const stage of ['images','local']){
   await write(oldData);
   let caught=false;
   try{await applyRestore(sandboxAdapter,incoming,stage)}
   catch(err){if(!String(err.message).includes('강제 오류:'))throw err;caught=true}
   if(!caught)throw new Error('강제 오류 감지 실패');
   await sandboxAdapter.verifyLocal(old.local);await sandboxAdapter.verifyImages(old.images);
  }
  passed=true;
 }finally{
  if(db)db.close();
  // Remove the isolated database only. Never open or clear the real user database.
  await new Promise((resolve,reject)=>{
   const req=indexedDB.deleteDatabase(databaseName);
   req.onsuccess=()=>resolve();
   req.onerror=()=>reject(req.error||new Error('시험 저장소 삭제 실패'));
   req.onblocked=()=>reject(new Error('시험 저장소 정리가 지연됐어.'));
  });
 }
 if(!passed)throw new Error('복원 모의실험이 완료되지 않았어.');
 return '✓ 공통 복원·원상복구 모의실험 4/4 통과\n① 가상 데이터 복원\n② 사진 저장 후 강제 오류\n③ 기록 저장 후 강제 오류\n④ 기존 데이터 원상복구 확인\n실제 사용자 데이터는 변경하지 않았어.';
}
simulationButton.addEventListener('click',async()=>{
 if(busy)return;
 lock(true);simulationButton.disabled=true;
 showCheckResult('checking','별도 저장소에서 복원 모의실험 중…');
 try{showCheckResult('ok',await simulateRestore())}
 catch(e){showCheckResult('error','✕ 복원 모의실험 실패\n'+(e.message||e))}
 finally{lock(false);simulationButton.disabled=false}
});
check.addEventListener('click',()=>{if(busy)return;checkPick.value='';checkPick.click()});
checkPick.addEventListener('change',async()=>{
 const file=checkPick.files?.[0];if(!file||busy)return;
 lock(true);showCheckResult('checking','검사 중 · 백업 파일을 확인하고 있어.');
 try{
  const info=await inspectBackupFile(file);
  const summary='차량 '+info.vehicles+'대 · 정비기록 '+info.records+'건 · 사진 '+info.images+'개';
  if(info.warnings.length){
   showCheckResult('warning','⚠ 주의 · 백업 파일 자체는 정상\n'+summary+
    '\n주행거리·정비이력 확인 필요 '+info.warnings.length+'건\n'+info.warnings.slice(0,3).join('\n')+
    '\n복원 전 내용을 확인해. 현재 데이터는 변경하지 않았어.');
  }else{
   showCheckResult('ok','✓ 정상 · 백업 파일 검사 통과\n'+summary+
    '\n파일 구조와 해시 확인 완료. 현재 데이터는 변경하지 않았어.');
  }
 }catch(err){showCheckResult('error','✕ 오류 · 백업 파일 검사 실패\n'+(err.message||'파일을 검사할 수 없어.')+'\n현재 데이터는 변경하지 않았어.')}
 finally{lock(false);checkPick.value=''}
});
function filename(){const d=new Date(),p=x=>String(x).padStart(2,'0');return '오토바이정비_전체백업_'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'_'+p(d.getHours())+p(d.getMinutes())+'.json'}
save.addEventListener('click',async()=>{
 if(busy)return;lock(true);message('전체 데이터를 수집하는 중…');
 try{
  const payload={local:locals(),images:await packImages(await getImages())};validate(payload);
  const backup={format:MAGIC,version:1,createdAt:new Date().toISOString(),payload,sha256:await checksum(payload)};
  const blob=new Blob([JSON.stringify(backup)],{type:'application/json'});
  // Validate the generated file before offering it. This is read-only.
  const verified=await inspectBackupFile(blob);
  if(verified.vehicles!==vehicleCount(payload.local['motorcycle-skeleton-registrations-v1'])||
     verified.records!==recordCount(payload.local['motorcycle-skeleton-maintenance-v1'])||
     verified.images!==payload.images.length)
   throw new Error('생성된 백업 파일의 데이터 개수가 맞지 않아.');
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=filename();document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  message('백업 파일 자체 검사 통과 · 차량 '+verified.vehicles+'대 · 기록 '+verified.records+'건 · 사진 '+verified.images+'개. 파일 앱에서 실제 저장 여부를 확인해.');
 }catch(err){message('백업 실패: '+(err.message||'저장할 수 없어.'))}finally{lock(false)}
});
load.addEventListener('click',()=>{if(!busy){pick.value='';pick.click()}});
pick.addEventListener('change',async()=>{
 const file=pick.files&&pick.files[0];if(!file||busy)return;lock(true);message('백업 파일 검사 중…');
 try{
  const inspection=await inspectBackupFile(file),doc=inspection.doc;
  const incoming=unpackImages(doc.payload.images);
  const incomingRegs=inspection.vehicles;
  const incomingRecords=inspection.records;
  const existingRegs=vehicleCount(localStorage.getItem('motorcycle-skeleton-registrations-v1'));
  const existingRecords=recordCount(localStorage.getItem('motorcycle-skeleton-maintenance-v1'));
  const summary='가져올 파일: 차량 '+incomingRegs+'대 / 정비기록 '+incomingRecords+'건 / 사진 '+incoming.length+'개\n현재 브라우저: 차량 '+existingRegs+'대 / 정비기록 '+existingRecords+'건'+(inspection.warnings.length?'\n\n주의: 주행거리 이력 일치 여부 확인 필요 '+inspection.warnings.length+'건. 백업 파일 검사에서 내용을 확인해.':'')+'\n\n현재 브라우저의 기존 자료를 파일 내용으로 완전히 교체할까?\n두 곳의 기록을 합치지 않아. 필요하다면 먼저 현재 브라우저도 백업해.';
  if(!confirm(summary)){message('복원 취소: 기존 데이터 유지');return}
  message('전체 데이터를 복원 중…');
  await applyRestore(actualRestore,{local:doc.payload.local,images:incoming});
  alert('전체 복원이 완료됐어. 앱을 새로고침할게.');location.reload();
 }catch(err){message('복원 실패: '+(err.message||'파일을 확인해.'))}finally{lock(false);pick.value=''}
});
})();