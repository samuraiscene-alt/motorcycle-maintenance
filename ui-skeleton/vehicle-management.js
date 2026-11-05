(()=>{'use strict';
const root=document.querySelector('.backup-panel');if(!root)return;
const REG='motorcycle-skeleton-registrations-v1',DATA='motorcycle-skeleton-maintenance-v1',SEL='motorcycle-skeleton-selected-vehicle-v1';
const KEY_PREFIX='motorcycle-skeleton-';
function parse(key){try{const v=JSON.parse(localStorage.getItem(key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return {}}}
const css=document.createElement('style');
css.textContent='.fleet-list{display:flex;flex-direction:column;gap:7px;margin-top:12px}.fleet-item{display:flex;gap:9px;align-items:center;justify-content:space-between;background:#1a334b;border:1px solid #607d98;border-radius:9px;padding:10px}.fleet-item span{font-size:13px;color:#e3f4ff;min-width:0;overflow-wrap:anywhere}.fleet-item small{font-size:11px;color:#b5ccdf;display:block;margin-top:3px}.fleet-item button,.fleet-actions button{border-radius:8px;border:1px solid #8cb0cd;background:#31577a;color:white;padding:9px;font-size:12px;font-weight:800;white-space:nowrap}.fleet-new-form[hidden]{display:none!important}.fleet-new-form{margin-top:12px;display:grid;gap:11px}.fleet-new-form label{font-size:12px;font-weight:850;color:#dceeff}.fleet-new-form input,.fleet-new-form select{display:block;width:100%;margin-top:5px;min-height:43px;padding:8px 10px;border-radius:8px;border:1px solid #98b8d0;background:#f7fbff;color:#1a2d41;font-size:16px}.fleet-actions{display:flex;gap:8px}.fleet-actions button{flex:1}.fleet-message{color:#ffd6ac;font-size:12px;line-height:1.6;min-height:17px}.fleet-reset{border-color:#c77777!important;background:linear-gradient(#9a414d,#63242d)!important}';
css.textContent+='.fleet-odometer-history{margin:-3px 0 4px;border:1px solid #456078;border-radius:8px;padding:8px 11px;background:#10273e;color:#d1eaff;font-size:12px}.fleet-odometer-history summary{cursor:pointer;font-weight:800}.fleet-odometer-history>div{max-height:180px;overflow-y:auto;padding:7px 0;line-height:1.8;color:#c2d6e8}';
css.textContent+='.fleet-appearance{border:1px solid #577992;border-radius:11px;padding:12px;margin:14px 0;background:#142c42}.fleet-appearance-form{display:grid;gap:10px;margin-top:9px}.fleet-appearance-form label{color:#d6e8f7;font-size:12px;font-weight:800}.fleet-appearance-form input,.fleet-appearance-form select{display:block;width:100%;margin-top:5px;height:43px;border:1px solid #9bbed8;border-radius:8px;padding:6px 10px;font-size:16px;background:#f4f9ff;color:#12263a}.fleet-appearance-feedback{min-height:18px;color:#a9e6ff!important}';
css.textContent+='.fleet-swipe-shell{position:relative;margin-top:7px;overflow:hidden;border-radius:9px;touch-action:pan-y}.fleet-swipe-shell .fleet-item{position:relative;z-index:1;margin-top:0;transform:translateX(0);transition:transform .2s ease;touch-action:pan-y;user-select:none;-webkit-user-select:none}.fleet-swipe-shell.open .fleet-item{transform:translateX(-84px)}.fleet-swipe-delete{position:absolute;right:0;top:0;bottom:0;width:84px;background:#bd3445;color:white;border:0;border-radius:0 9px 9px 0;font-size:13px;font-weight:900;z-index:0}.fleet-swipe-shell:focus-within .fleet-swipe-delete{outline-offset:-3px}';
document.head.appendChild(css);
const section=document.createElement('section');
section.innerHTML='<strong>차량별 기록 관리</strong><p>기존 차량 기록은 보관하고 새 오토바이를 등록할 수 있어. 차량을 선택하면 해당 차량의 정비기록과 소모품 상태를 확인할 수 있어.</p><div class="fleet-list"></div><div class="fleet-appearance"><strong>현재 차량 연식 설정</strong><p>제조 연식을 입력하면 노후 단계를 자동으로 계산해. 검증된 부품 영역이 없는 차종에는 임의의 녹·파손을 추가하지 않아.</p><form class="fleet-appearance-form"><label>제조 연식<input name="year" type="number" inputmode="numeric" min="1950" max="2100" placeholder="예: 2020"></label><p class="fleet-auto-aging" aria-live="polite">제조 연식을 입력하면 사용감 단계가 자동 계산돼.</p><button class="backup-btn secondary" type="submit">차량 외관 설정 저장</button><p class="fleet-appearance-feedback" aria-live="polite"></p></form></div><button class="backup-btn secondary fleet-add" type="button" style="margin-top:12px">새 차량으로 시작</button><form class="fleet-new-form" hidden><label>제조사<input name="brand" maxlength="40" required placeholder="예: YAMAHA"></label><label>기종<input name="model" maxlength="55" required placeholder="예: NMAX"></label><label>배기량 (cc)<input name="cc" type="number" min="1" max="3000" step="1" inputmode="numeric" required placeholder="예: 125"></label><label>제조 연식 (필수)<input name="year" type="number" inputmode="numeric" min="1950" max="2100" required placeholder="예: 2020"></label><label>앱 사용 시작 주행거리 (km)<input name="km" type="number" inputmode="numeric" min="0" max="9999999" step="1" required value="0"></label><p>기존 차량은 삭제되지 않으며, 새 차량의 정비기록은 별도로 시작돼.</p><div class="fleet-actions"><button type="button" class="fleet-cancel">취소</button><button type="submit">새 차량 저장</button></div></form><p class="fleet-message" aria-live="polite"></p>';
const reset=document.createElement('section');
reset.innerHTML='<strong>전체 데이터 초기화</strong><p>등록 차량, 주행거리, 정비기록, 소모품 설정 및 사진을 모두 삭제하고 처음부터 시작해. 되돌릴 수 없으니 먼저 전체 백업을 저장해.</p><button type="button" class="backup-btn fleet-reset">전체 데이터 초기화</button>';
root.querySelector('.backup-panel-header')?.after(section);
root.querySelector('.backup-status')?.before(reset);
const list=section.querySelector('.fleet-list'),form=section.querySelector('.fleet-new-form'),message=section.querySelector('.fleet-message');
let openedSwipe=null;
function closeSwipe(){if(openedSwipe){openedSwipe.classList.remove('open');openedSwipe=null}}
function enableSwipe(shell){
 const front=shell.querySelector('.fleet-item'),del=shell.querySelector('.fleet-swipe-delete');
 let startX=0,startY=0,tracking=false,consumed=false;
 shell.addEventListener('touchstart',e=>{
  if(e.touches.length!==1||e.target.closest('button'))return;
  startX=e.touches[0].clientX;startY=e.touches[0].clientY;tracking=true;consumed=false;
 },{passive:true});
 shell.addEventListener('touchmove',e=>{
  if(!tracking||e.touches.length!==1)return;
  const dx=e.touches[0].clientX-startX,dy=e.touches[0].clientY-startY;
  if(Math.abs(dx)>18&&Math.abs(dx)>Math.abs(dy)*1.25)consumed=true;
 },{passive:true});
 shell.addEventListener('touchend',e=>{
  if(!tracking)return;tracking=false;
  const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;
  if(!consumed||Math.abs(dx)<45||Math.abs(dx)<Math.abs(dy)*1.25)return;
  if(dx<0){if(openedSwipe!==shell)closeSwipe();shell.classList.add('open');openedSwipe=shell}
  else if(openedSwipe===shell)closeSwipe();
 },{passive:true});
 shell.addEventListener('keydown',e=>{
  if(e.target===del)return;
  if(e.key==='ArrowLeft'){e.preventDefault();if(openedSwipe!==shell)closeSwipe();shell.classList.add('open');openedSwipe=shell}
  if(e.key==='ArrowRight'||e.key==='Escape'){closeSwipe()}
 });
 front.addEventListener('click',e=>{if(consumed){e.preventDefault();e.stopPropagation();consumed=false}else if(openedSwipe===shell&&!e.target.closest('button'))closeSwipe()},true);
}
async function removeBikePhotos(bikeId){
 if(!('indexedDB' in window))return;
 await new Promise((resolve,reject)=>{
  const request=indexedDB.open('motorcycle-skeleton-added-images-v1',1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('images'))request.result.createObjectStore('images')};
  request.onerror=()=>reject(request.error||new Error('사진 저장소를 열지 못했어.'));
  request.onsuccess=()=>{
   const db=request.result;
   if(!db.objectStoreNames.contains('images')){db.close();resolve();return}
   const tx=db.transaction('images','readwrite'),store=tx.objectStore('images');
   const cursor=store.openCursor();
   cursor.onsuccess=()=>{const item=cursor.result;if(!item)return;if(typeof item.key==='string'&&item.key.startsWith(bikeId+':'))item.delete();item.continue()};
   tx.oncomplete=()=>{db.close();resolve()};
   tx.onerror=()=>{db.close();reject(tx.error||new Error('사진 삭제 실패'))};
   tx.onabort=()=>{db.close();reject(tx.error||new Error('사진 삭제 중단'))};
  };
 });
}
async function deleteVehicle(bikeId,bikeName){
 const regs=parse(REG);if(!Object.prototype.hasOwnProperty.call(regs,bikeId))return;
 if(!confirm('['+bikeName+'] 차량을 삭제할까?\\n연결된 정비기록과 주행거리·추가 부품·사진도 삭제돼.\\n다른 차량의 기록은 유지돼.'))return;
 const data=parse(DATA),nextRegs={...regs},nextData={...data};delete nextRegs[bikeId];delete nextData[bikeId];
 const associated=['motorcycle-skeleton-added-parts-v1','motorcycle-skeleton-part-appearance-v1','motorcycle-skeleton-part-order-v1'];
 const changes=[[REG,JSON.stringify(nextRegs)],[DATA,JSON.stringify(nextData)]];
 for(const key of associated){const original=localStorage.getItem(key);if(original===null)continue;const next=parse(key);delete next[bikeId];changes.push([key,JSON.stringify(next)])}
 const previous=localStorage.getItem(SEL),nextSelected=previous===bikeId||!nextRegs[previous]?Object.keys(nextRegs)[0]||null:previous;
 changes.push([SEL,nextSelected]);
 const snapshot=changes.map(([key])=>[key,localStorage.getItem(key)]);
 try{
  // Persist a consistent set of registration and per-bike records before touching photos.
  for(const [key,value] of changes){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}
  try{await removeBikePhotos(bikeId)}catch(err){console.warn('차량 사진 정리:',err);message.textContent='차량 기록은 삭제됐지만 사진 정리 중 오류가 발생했어.'}
  location.reload();
 }catch(err){
  for(const [key,value] of snapshot){try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}catch{}}
  message.textContent='차량 삭제에 실패했어. 저장공간을 확인해.';
 }
}
function describeYear(form){
 const text=section.querySelector('.fleet-auto-aging'),raw=form.elements.year.value.trim(),year=Number(raw);
 if(!raw||!Number.isSafeInteger(year)||year<1950||year>new Date().getFullYear()){text.textContent='연식 입력 시 외관 단계가 자동 계산돼.';return}
 const lib=window.MotorcycleWearLibrary;
 const profile=lib?.profile(year);
 text.textContent=profile?profile.age+'년 경과 · '+profile.description:'연식 계산 정보를 확인해.';
}
section.querySelector('.fleet-appearance-form').elements.year.addEventListener('input',e=>describeYear(e.target.form));
function refresh(){
 const regs=parse(REG),db=parse(DATA),selected=localStorage.getItem(SEL);
 const appearanceForm=section.querySelector('.fleet-appearance-form'),activeReg=regs[selected];
 section.querySelector('.fleet-appearance').hidden=!activeReg;
 if(activeReg){appearanceForm.elements.year.value=activeReg.year||'';describeYear(appearanceForm)}
 closeSwipe();list.replaceChildren();
 for(const [id,r] of Object.entries(regs)){
  if(!r||typeof r!=='object')continue;
  const name=r.name||(id==='pcx125'?'HONDA PCX125':id==='sample-b'?'스쿠터 B':id),row=document.createElement('div');row.className='fleet-item';
  const title=document.createElement('span'),details=document.createElement('small'),action=document.createElement('button');
  title.textContent=name;const odo=db[id]?.odometer??r.km??0;
  details.textContent='현재 '+Number(odo).toLocaleString('ko-KR')+'km · 정비 '+Object.values(db[id]?.records||{}).reduce((sum,a)=>sum+(Array.isArray(a)?a.length:0),0)+'건';
  title.appendChild(details);action.type='button';action.textContent=id===selected?'선택됨':'차량 보기';
  action.disabled=id===selected;action.addEventListener('click',()=>{document.dispatchEvent(new CustomEvent('motorcycle:select-vehicle',{detail:{id}}));root.closest('.backup-overlay').hidden=true;refresh()});
  row.append(title,action);
  const shell=document.createElement('div');shell.className='fleet-swipe-shell';shell.tabIndex=0;shell.setAttribute('aria-label',name+' 차량. 왼쪽으로 밀어 삭제');
  const del=document.createElement('button');del.type='button';del.className='fleet-swipe-delete';del.textContent='삭제';del.setAttribute('aria-label',name+' 차량 삭제');
  shell.append(del,row);list.appendChild(shell);enableSwipe(shell);
  del.addEventListener('click',()=>deleteVehicle(id,name));
  const reads=Array.isArray(db[id]?.odometerHistory)?db[id].odometerHistory:[];
  const history=document.createElement('details');history.className='fleet-odometer-history';
  const summary=document.createElement('summary');summary.textContent='주행거리 저장 내역 ('+reads.length+'건)';
  const content=document.createElement('div');
  if(!reads.length){content.textContent='이전에 저장된 주행거리 내역은 없어. 새로 입력하는 거리부터 저장돼.'}
  else for(const entry of [...reads].reverse()){
   const line=document.createElement('div');line.textContent=(entry.date?new Date(entry.date).toLocaleString('ko-KR'):'날짜 미상')+' · '+Number(entry.at).toLocaleString('ko-KR')+'km';content.appendChild(line)
  }
  history.append(summary,content);list.appendChild(history);
 }
 if(!list.childElementCount){const p=document.createElement('p');p.textContent='아직 등록된 차량이 없어.';list.appendChild(p)}
}
section.querySelector('.fleet-appearance-form').addEventListener('submit',e=>{
 e.preventDefault();
 const id=localStorage.getItem(SEL),regs=parse(REG),r=regs[id],form=e.currentTarget;
 const message=section.querySelector('.fleet-appearance-feedback');
 if(!r){message.textContent='현재 등록된 차량이 없어.';return}
 const raw=form.elements.year.value.trim(),year=raw===''?null:Number(raw);
 const current=new Date().getFullYear();
 if(year!==null&&(!Number.isSafeInteger(year)||year<1950||year>current)){message.textContent='제조 연식을 확인해.';return}
 try{
  localStorage.setItem(REG,JSON.stringify({...regs,[id]:{...r,year,wear:'auto'}}));
  message.textContent='연식과 외관 상태를 저장했어.';
  document.dispatchEvent(new CustomEvent('motorcycle:appearance-changed',{detail:{bikeId:id}}));
 }catch{message.textContent='저장공간을 확인해.'}
});
section.querySelector('.fleet-add').addEventListener('click',()=>{form.hidden=false;message.textContent='';form.elements.name.focus({preventScroll:true})});
section.querySelector('.fleet-cancel').addEventListener('click',()=>{form.hidden=true;form.reset()});
form.addEventListener('submit',e=>{
 e.preventDefault();
 const brand=form.elements.brand.value.trim(),model=form.elements.model.value.trim(),cc=Number(form.elements.cc.value),name=(brand+' '+model).trim(),km=Number(form.elements.km.value),yearValue=form.elements.year.value.trim(),year=yearValue?Number(yearValue):null;
 if(!brand||brand.length>40||!model||model.length>55||name.length>100||!Number.isSafeInteger(cc)||cc<1||cc>3000||!Number.isSafeInteger(km)||km<0||km>9999999||(!Number.isSafeInteger(year)||year<1950||year>new Date().getFullYear())){message.textContent='제조사·기종·배기량·제조 연식·시작 주행거리를 확인해.';return}
 const id='bike-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
 document.dispatchEvent(new CustomEvent('motorcycle:register-new-vehicle',{detail:{id,name,brand,model,cc,km,year,wear:'auto'}}));
 if(localStorage.getItem(SEL)!==id){message.textContent='새 차량을 저장하지 못했어. 저장공간을 확인해.';return}
 form.hidden=true;form.reset();message.textContent='새 차량으로 시작했어. 이전 차량의 기록은 그대로 보관했어.';refresh();
});
document.addEventListener('motorcycle:vehicle-saved',refresh);
for(const t of document.querySelectorAll('.tabs .tab'))if(t.textContent.trim()==='설정')t.addEventListener('click',refresh);
reset.querySelector('.fleet-reset').addEventListener('click',async()=>{
 if(!confirm('전체 차량과 모든 정비기록을 삭제할까?\n전체 백업을 먼저 저장하는 것을 권장해.'))return;
 if(prompt('정말 모두 삭제하려면 아래 입력창에 초기화를 입력해.')!=='초기화')return;
 try{
  if('indexedDB' in window){
   await new Promise((resolve,reject)=>{
    const req=indexedDB.open('motorcycle-skeleton-added-images-v1',1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('images'))req.result.createObjectStore('images')};
    req.onerror=()=>reject(req.error||new Error('사용자 사진 저장소를 열지 못했어.'));
    req.onsuccess=()=>{
     const db=req.result;
     if(!db.objectStoreNames.contains('images')){db.close();resolve();return}
     const tx=db.transaction('images','readwrite');tx.objectStore('images').clear();
     tx.oncomplete=()=>{db.close();resolve()};
     tx.onerror=()=>{db.close();reject(tx.error||new Error('사진 기록을 초기화하지 못했어.'))};
     tx.onabort=()=>{db.close();reject(tx.error||new Error('사진 기록 초기화가 중단됐어.'))};
    };
   });
  }
  for(const key of Object.keys(localStorage))if(key.startsWith(KEY_PREFIX))localStorage.removeItem(key);
  location.reload();
 }catch(err){message.textContent='초기화 중 오류가 발생했어: '+err.message}
});
refresh();
})();