(()=>{'use strict';
const $=id=>document.getElementById(id);
const stage=$('garage'),track=$('showroom-track'),counter=$('showroom-count'),check=$('showroom-check'),tint=$('showroom-tint'),name=document.querySelector('.bike-model'),meta=document.querySelector('.bike-meta'),brand=$('brand-slot');
const regMask=$('registration-mask'),regForm=$('registration-form'),regClose=$('registration-close'),regTitle=$('registration-model'),regKm=$('registration-km'),regHint=$('registration-hint'),regError=$('registration-error');
const currentKm=$('registration-current-km'),recordMask=$('record-mask'),recordForm=$('record-form'),recordClose=$('record-close'),recordTitle=$('record-title'),recordAt=$('record-odometer'),recordDate=$('record-date'),recordInterval=$('record-interval'),recordError=$('record-error'),recordHistory=$('record-history');
const bikes=[{id:'pcx125',name:'HONDA PCX125',brand:'honda',demo:'중고차 · 시작 12,300km'},{id:'sample-b',name:'스쿠터 B · 시연',brand:'unknown',demo:'등록되지 않은 시연 차량'}];
const items=[{id:'oil',interval:3000},{id:'brake',interval:12000},{id:'tire',interval:10000},{id:'coolant',interval:20000},{id:'filter',interval:12000}];
const regKey='motorcycle-skeleton-registrations-v1',dataKey='motorcycle-skeleton-maintenance-v1',chosenKey='motorcycle-skeleton-selected-vehicle-v1';
function load(key){try{const x=JSON.parse(localStorage.getItem(key)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}}
let registered=load(regKey),database=load(dataKey),index=0,chosen=-1,pointer=null,moved=false,animating=false,checkTimer=0,formTimer=0,returnFocus=null,editingItem=null;
function appendVehicleView(bike){
 if(bikes.some(x=>x.id===bike.id))return;
 bikes.push(bike);
 const slide=document.createElement('div');slide.className='showroom-slide';slide.dataset.index=String(bikes.length-1);slide.setAttribute('role','group');slide.setAttribute('aria-label',bike.name);
 slide.innerHTML='<div class="ground-shadow"></div><img class="motorcycle-hero" src="./alternate-scooter.svg" alt="등록된 오토바이" draggable="false">';
 track.appendChild(slide);
}
for(const [id,r] of Object.entries(registered)){if(!bikes.some(x=>x.id===id)&&r&&typeof r.name==='string')appendVehicleView({id,name:r.name,brand:r.brand||'unknown',demo:'등록 차량'})}

const selectedBike=localStorage.getItem(chosenKey);
const selectedIndex=bikes.findIndex(b=>b.id===selectedBike&&registered[b.id]);
const firstRegistered=bikes.findIndex(b=>!!registered[b.id]);
if(selectedIndex>=0)index=selectedIndex;else if(firstRegistered>=0)index=firstRegistered;
const isLocked=()=>!!registered[bikes[index]?.id];
const hondaLogo=brand.innerHTML,unknownLogo='<svg viewBox="0 0 64 42" aria-hidden="true" class="generic-bike-mark"><circle cx="15" cy="30" r="8"/><circle cx="49" cy="30" r="8"/><path d="M15 30 26 14h13l10 16M25 14l8 16H15m18 0 10-13h8"/></svg><strong>BRAND</strong>';
const fmt=n=>Number(n).toLocaleString('ko-KR'),valid=n=>Number.isSafeInteger(n)&&n>=0&&n<=9999999;
function currentBike(){return bikes[index]}function currentRegistration(){return registered[currentBike().id]}
function getVehicleData(id){const x=database[id];return x&&typeof x==='object'&&!Array.isArray(x)?x:{records:{}}}
function getOdometer(){const r=currentRegistration(),v=getVehicleData(currentBike().id);return r?valid(v.odometer)&&v.odometer>=r.km?v.odometer:r.km:null}
function write(key,obj){localStorage.setItem(key,JSON.stringify(obj))}
document.addEventListener('motorcycle:register-new-vehicle',event=>{
 const info=event.detail||{},id=info.id,name=String(info.name||'').trim(),at=Number(info.km);
 if(!/^bike-[a-z0-9-]+$/.test(id)||!name||name.length>100||registered[id]||!valid(at)||!Number.isSafeInteger(info.cc)||info.cc<1||info.cc>3000||!String(info.brand||'').trim()||!String(info.model||'').trim())return;
 const nextReg={...registered,[id]:{name,brand:String(info.brand).trim(),model:String(info.model).trim(),cc:info.cc,km:at,year:Number.isSafeInteger(info.year)?info.year:null,wear:'auto'}};
 const nextData={...database,[id]:{odometer:at,records:{},odometerHistory:[{at,date:new Date().toISOString()}]}};
 try{write(regKey,nextReg);write(dataKey,nextData);localStorage.setItem(chosenKey,id)}
 catch{alert('차량 저장에 실패했어. 기기 저장공간을 확인해.');return}
 registered=nextReg;database=nextData;appendVehicleView({id,name,brand:String(info.brand).trim(),demo:'등록 차량'});
 index=bikes.findIndex(x=>x.id===id);position(0,false);renderInfo();
 document.dispatchEvent(new CustomEvent('motorcycle:vehicle-saved',{detail:{id}}));
});
document.addEventListener('motorcycle:select-vehicle',event=>{
 const id=event.detail?.id,at=bikes.findIndex(x=>x.id===id&&registered[id]);if(at<0)return;
 index=at;localStorage.setItem(chosenKey,id);position(0,false);renderInfo();
});
function width(){return stage.getBoundingClientRect().width||1}
function position(offset,animate){track.style.transition=animate?'transform 370ms cubic-bezier(.22,.75,.19,1)':'none';track.style.transform='translate3d('+(-index*width()+offset)+'px,0,0)'}
function renderInfo(){const b=currentBike(),r=currentRegistration(),odo=getOdometer();name.textContent=b.name;
meta.textContent=r?'시작 '+fmt(r.km)+'km · 현재 '+fmt(odo)+'km':b.demo;const odometerReadout=$('odometer-readout');if(odometerReadout)odometerReadout.textContent=r?fmt(odo)+'km':'등록 전';
brand.innerHTML=b.brand==='honda'?hondaLogo:unknownLogo;brand.setAttribute('aria-label',b.brand==='honda'?'혼다':'제조사 미정');
counter.textContent=isLocked()?'':bikes.map((_,i)=>i===index?'●':'○').join(' ');document.body.classList.toggle('vehicle-locked',isLocked());stage.setAttribute('aria-label',isLocked()?'등록된 내 오토바이 이미지':'오토바이 이미지: 좌우 스와이프로 차량 선택');document.body.dataset.activeBike=b.id;renderParts();document.dispatchEvent(new CustomEvent('motorcycle:change',{detail:{bikeId:b.id}}))}
function renderParts(){const reg=currentRegistration(),odo=getOdometer(),data=getVehicleData(currentBike().id);
document.querySelectorAll('.part:not(.part-add-card)').forEach((row,i)=>{const id=row.dataset.partId||items[i]?.id;const item=items.find(x=>x.id===id)||{id,interval:Number(row.dataset.interval)||0};if(!id)return;const records=data.records&&Array.isArray(data.records[item.id])?data.records[item.id]:[],last=records.length?[...records].sort((a,b)=>Number(a.at)-Number(b.at)||String(a.date).localeCompare(String(b.date)))[records.length-1]:null;
const text=row.querySelector('.part-line span'),bar=row.querySelector('.gauge-fill'),btn=row.querySelector('.service');
bar.classList.remove('blue','amber','red');bar.classList.add('blue');btn.classList.remove('blue','amber','red');btn.classList.add('blue');
if(!reg){text.textContent='차량 등록 후 확인';bar.style.width='0%';row.classList.add('part-unregistered');}
else{
 const interval=last&&valid(last.interval)&&last.interval>0?last.interval:item.interval;
 const knownBase=last?last.at:reg.km===0?0:null;
 if(knownBase===null||!Number.isFinite(interval)||interval<=0){
  text.textContent=interval>0?'교체기록 없음 / 주기 '+fmt(interval)+'km':'교체주기 미설정';
  bar.style.width='0%';row.classList.add('part-unregistered');
 }else{
  const used=Math.max(0,odo-knownBase),percent=Math.floor(used/interval*100),ratio=Math.min(100,percent);
  text.textContent=used>interval?fmt(used)+' / '+fmt(interval)+'km · '+fmt(used-interval)+'km 초과':fmt(used)+' / '+fmt(interval)+'km';
  bar.style.width=ratio+'%';row.classList.remove('part-unregistered');
  const color=percent<=50?'blue':percent<=80?'amber':'red';
  bar.classList.remove('blue','amber','red');bar.classList.add(color);
  btn.classList.remove('blue','amber','red');btn.classList.add(color);
  row.dataset.maintenancePercent=String(percent);
 }
}
btn.setAttribute('role','button');btn.tabIndex=0;btn.setAttribute('aria-label',row.querySelector('strong').textContent+' 정비기록 등록');});
}
document.addEventListener('motorcycle:custom-parts-change',()=>renderParts());
function hideCheck(){clearTimeout(checkTimer);check.classList.remove('visible');check.setAttribute('aria-hidden','true')}
function openReg(){returnFocus=document.activeElement;const r=currentRegistration(),odo=getOdometer();regTitle.textContent=currentBike().name;document.getElementById('registration-title').textContent=r?'오토바이 정보 수정':'오토바이 등록';regForm.querySelector('.registration-save').textContent=r?'변경사항 저장':'이 오토바이 등록';

regKm.value=r?String(r.km):'0';currentKm.value=r?String(odo):String(Number(regKm.value)||0);regError.textContent='';syncReg();
regMask.hidden=false;document.body.classList.add('registration-open');regClose.focus()}
function closeReg(){regMask.hidden=true;document.body.classList.remove('registration-open');if(returnFocus?.focus)returnFocus.focus()}
function selectVisible(){if(animating||!regMask.hidden||!recordMask.hidden)return;chosen=index;hideCheck();void check.offsetWidth;check.classList.add('visible');check.setAttribute('aria-hidden','false');clearTimeout(formTimer);formTimer=setTimeout(()=>{hideCheck();openReg()},640)}
function change(next){if(isLocked()||next<0||next>=bikes.length||animating){position(0,true);return}animating=true;hideCheck();clearTimeout(formTimer);index=next;position(0,true);renderInfo();tint.classList.remove('flash');void tint.offsetWidth;tint.classList.add('flash');setTimeout(()=>animating=false,385)}
function syncReg(){regHint.textContent='앱에서 이 오토바이의 관리를 시작한 당시 주행거리'}
regForm.addEventListener('submit',e=>{e.preventDefault();const at=Number(regKm.value),now=Number(currentKm.value),previous=currentRegistration();
if(regKm.value.trim()===''||currentKm.value.trim()===''||!valid(at)||!valid(now)||now<at){regError.textContent='시작·현재 주행거리를 확인해. 현재 주행거리는 시작보다 작을 수 없어.';return}
const old=getVehicleData(currentBike().id),all=Object.values(old.records||{}).flat().filter(x=>valid(x.at)),maxAt=all.reduce((v,x)=>Math.max(v,x.at),0);
if(now<maxAt){regError.textContent='이미 기록된 정비 주행거리보다 현재 주행거리를 낮출 수 없어.';return}
if(previous&&at!==previous.km&&maxAt&&at>maxAt){regError.textContent='시작 주행거리는 기록된 정비 주행거리보다 클 수 없어.';return}
const fresh=load(regKey),nextReg={...fresh,[currentBike().id]:{...fresh[currentBike().id],...previous,year:fresh[currentBike().id]?.year??previous?.year??null,wear:fresh[currentBike().id]?.wear??previous?.wear??'auto',km:at}},nextData={...database,[currentBike().id]:{...old,odometer:now,records:old.records||{},odometerHistory:[...(old.odometerHistory||[]),{at:now,date:new Date().toISOString()}]}};
try{write(regKey,nextReg);write(dataKey,nextData);localStorage.setItem(chosenKey,currentBike().id);registered=nextReg;database=nextData;renderInfo();closeReg();check.classList.add('visible');checkTimer=setTimeout(hideCheck,720)}catch{regError.textContent='저장할 수 없어. 브라우저 저장공간을 확인해.'}
});
regClose.addEventListener('click',closeReg);regMask.addEventListener('click',e=>{if(e.target===regMask)closeReg()});
const odoButton=$('odometer-button'),odoMask=$('odometer-mask'),odoForm=$('odometer-form'),odoInput=$('odometer-input'),odoError=$('odometer-error'),odoClose=$('odometer-close'),odoDisplay=$('odometer-display'),odoKeypad=$('odometer-keypad');
let odoReplaceOnDigit=true;
function showOdometerValue(){odoDisplay.replaceChildren(document.createTextNode(odoInput.value?fmt(Number(odoInput.value))+' ':'— '));const unit=document.createElement('small');unit.textContent='km';odoDisplay.appendChild(unit)}
function closeOdometer(){odoMask.hidden=true;document.body.classList.remove('registration-open');odoError.textContent='';}
function openOdometer(){
 if(!odoMask.hidden||!recordMask.hidden||!regMask.hidden)return;
 if(!currentRegistration()){openReg();return}
 odoInput.value=String(getOdometer());odoReplaceOnDigit=true;odoError.textContent='';showOdometerValue();
 odoMask.hidden=false;document.body.classList.add('registration-open');
}
odoKeypad.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 const digit=button.dataset.digit,action=button.dataset.action;
 if(digit!==undefined){
  const value=odoReplaceOnDigit?'':odoInput.value;
  if(value.length>=7)return;
  odoInput.value=String(Number(value+digit));odoReplaceOnDigit=false;
 }else if(action==='clear'){odoInput.value='';odoReplaceOnDigit=false}
 else if(action==='backspace'){odoInput.value=odoReplaceOnDigit?'':odoInput.value.slice(0,-1);odoReplaceOnDigit=false}
 odoError.textContent='';showOdometerValue();
});
odoButton.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openOdometer()});
odoButton.addEventListener('keydown',e=>e.stopPropagation());
odoClose.addEventListener('click',closeOdometer);
odoMask.addEventListener('click',e=>{if(e.target===odoMask)closeOdometer()});
odoForm.addEventListener('submit',e=>{
 e.preventDefault();
 const r=currentRegistration(),before=getOdometer(),raw=odoInput.value.trim(),at=Number(raw);
 if(!r){odoError.textContent='먼저 오토바이 등록을 완료해.';return}
 if(!raw||!valid(at)||at<r.km||at<before){odoError.textContent='현재 주행거리는 이전 주행거리보다 작을 수 없어.';return}
 const old=getVehicleData(currentBike().id),all=Object.values(old.records||{}).flat().filter(x=>valid(x.at)),latest=all.reduce((m,x)=>Math.max(m,x.at),0);
 if(at<latest){odoError.textContent='저장된 정비 주행거리보다 낮게 입력할 수 없어.';return}
 const updated={...database,[currentBike().id]:{...old,odometer:at,records:old.records||{},odometerHistory:[...(old.odometerHistory||[]),{at,date:new Date().toISOString()}]}};
 try{write(dataKey,updated);database=updated;renderInfo();closeOdometer()}
 catch{odoError.textContent='주행거리를 저장하지 못했어. 저장공간을 확인해.'}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!odoMask.hidden){e.stopImmediatePropagation();closeOdometer()}});

function openRecord(row){const id=row.dataset.partId;editingItem=items.find(x=>x.id===id)||{id,interval:Number(row.dataset.interval)||0};returnFocus=document.activeElement;recordTitle.textContent=row.querySelector('strong').textContent+' 정비기록';recordAt.value=String(getOdometer()??0);recordDate.value=[new Date().getFullYear(),String(new Date().getMonth()+1).padStart(2,'0'),String(new Date().getDate()).padStart(2,'0')].join('-');recordInterval.value=editingItem.interval?String(editingItem.interval):'';recordError.textContent='';renderHistory();recordMask.hidden=false;document.body.classList.add('registration-open');recordClose.focus()}
function closeRecord(){recordMask.hidden=true;document.body.classList.remove('registration-open');if(returnFocus?.focus)returnFocus.focus()}
function renderHistory(){const d=getVehicleData(currentBike().id),arr=Array.isArray(d.records?.[editingItem.id])?d.records[editingItem.id]:[];recordHistory.replaceChildren();if(!arr.length){recordHistory.textContent='저장된 정비기록이 없습니다.';return}const ul=document.createElement('ul');[...arr].reverse().slice(0,8).forEach(x=>{const li=document.createElement('li');li.textContent=x.date+' · '+fmt(x.at)+'km · 주기 '+fmt(x.interval)+'km';ul.appendChild(li)});recordHistory.appendChild(ul)}
document.querySelector('.rows').addEventListener('click',e=>{const btn=e.target.closest('.part:not(.part-add-card) .service');if(btn)openRecord(btn.closest('.part'))});document.querySelector('.rows').addEventListener('keydown',e=>{const btn=e.target.closest('.part:not(.part-add-card) .service');if(btn&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openRecord(btn.closest('.part'))}});
recordForm.addEventListener('submit',e=>{e.preventDefault();if(!editingItem)return;const at=Number(recordAt.value),interval=Number(recordInterval.value),date=recordDate.value,reg=currentRegistration(),odo=getOdometer();
if(!reg){recordError.textContent='정비기록을 저장하려면 먼저 오토바이 등록이 필요해.';return}
if(recordAt.value.trim()===''||!valid(at)||at<reg.km||at>odo||!valid(interval)||interval<1||interval>1000000||!/^\d{4}-\d\d-\d\d$/.test(date)||!Number.isFinite(Date.parse(date))){recordError.textContent='주행거리·날짜·교체주기를 확인해. 정비 주행거리는 시작~현재 범위여야 해.';return}
const d=getVehicleData(currentBike().id),records={...(d.records||{})},old=Array.isArray(records[editingItem.id])?records[editingItem.id]:[];
records[editingItem.id]=[...old,{at,interval,date}].sort((a,b)=>a.at-b.at||a.date.localeCompare(b.date));
const next={...database,[currentBike().id]:{...d,odometer:odo,records}};
try{write(dataKey,next);database=next;renderParts();closeRecord()}catch{recordError.textContent='저장에 실패했어. 기기 저장공간을 확인해.'}});
recordClose.addEventListener('click',closeRecord);recordMask.addEventListener('click',e=>{if(e.target===recordMask)closeRecord()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!recordMask.hidden)closeRecord();else if(!regMask.hidden)closeReg()}});
stage.addEventListener('pointerdown',e=>{if(animating||isLocked()||!regMask.hidden||!recordMask.hidden||!e.isPrimary||e.button!==0)return;pointer={id:e.pointerId,start:e.clientX,y:e.clientY,at:Date.now(),vertical:false};moved=false;try{stage.setPointerCapture(e.pointerId)}catch{}});
stage.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.id||animating)return;const dx=e.clientX-pointer.start,dy=e.clientY-pointer.y;if(Math.abs(dy)>Math.abs(dx)*1.5&&Math.abs(dy)>12){pointer.vertical=true;return}if(pointer.vertical)return;moved=moved||Math.abs(dx)>9;const blocked=(index===0&&dx>0)||(index===bikes.length-1&&dx<0);position(blocked?dx*.25:dx,false)});
function finish(e,cancel){if(!pointer||e.pointerId!==pointer.id)return;const delta=e.clientX-pointer.start,vertical=e.clientY-pointer.y,elapsed=Date.now()-pointer.at,wasMoved=moved,wasVertical=pointer.vertical;pointer=null;if(cancel||wasVertical){position(0,true);return}if(Math.abs(delta)>=48||(Math.abs(delta)>22&&elapsed<220)){const next=index+(delta<0?1:-1);if(next>=0&&next<bikes.length){change(next);return}}position(0,true);if(!wasMoved&&Math.abs(delta)<9&&Math.abs(vertical)<12)hideCheck()}
const vehicleCard=document.querySelector('.vehicle');vehicleCard.tabIndex=0;vehicleCard.setAttribute('role','button');vehicleCard.setAttribute('aria-label','오토바이 정보 등록 또는 수정');vehicleCard.addEventListener('click',()=>{if(regMask.hidden&&recordMask.hidden)openReg()});vehicleCard.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&regMask.hidden&&recordMask.hidden){e.preventDefault();openReg()}});
const vehicleTab=[...document.querySelectorAll('.tabs .tab')].find(el=>el.textContent.trim()==='차량정보');if(vehicleTab){vehicleTab.tabIndex=0;vehicleTab.setAttribute('role','button');vehicleTab.addEventListener('click',openReg);vehicleTab.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openReg()}})}
const consumablesTab=[...document.querySelectorAll('.tabs .tab')].find(el=>el.textContent.trim()==='소모품');if(consumablesTab){consumablesTab.tabIndex=0;consumablesTab.setAttribute('role','button');consumablesTab.addEventListener('click',()=>document.querySelector('.rows')?.scrollIntoView({behavior:'smooth',block:'start'}));consumablesTab.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();document.querySelector('.rows')?.scrollIntoView({behavior:'smooth',block:'start'})}})}
stage.addEventListener('pointerup',e=>finish(e,false));stage.addEventListener('pointercancel',e=>finish(e,true));
stage.addEventListener('keydown',e=>{if(!regMask.hidden||!recordMask.hidden||isLocked())return;if(e.key==='ArrowRight'){e.preventDefault();change(index+1)}else if(e.key==='ArrowLeft'){e.preventDefault();change(index-1)}});
stage.tabIndex=0;stage.setAttribute('role','group');stage.setAttribute('aria-label','오토바이 전시 이미지');
window.addEventListener('resize',()=>position(0,false));window.addEventListener('pageshow',()=>position(0,false));

// Vehicle-scoped maintenance history: previously saved records are read, never rewritten.
const historyMask=document.createElement('div');historyMask.className='registration-mask';historyMask.hidden=true;
historyMask.setAttribute('role','dialog');historyMask.setAttribute('aria-modal','true');historyMask.setAttribute('aria-label','정비기록 전체 보기');
historyMask.innerHTML='<section class="registration-panel maintenance-list-panel"><div class="registration-heading"><strong>정비기록</strong><button type="button" aria-label="닫기" class="maintenance-list-close">×</button></div><p class="maintenance-list-vehicle"></p><label class="maintenance-vehicle-label" for="maintenance-vehicle-select">차량 선택</label><select class="maintenance-vehicle-select" id="maintenance-vehicle-select"></select><div class="maintenance-list-items"></div><details class="maintenance-odometer-section"><summary>주행거리 입력 내역</summary><div class="maintenance-odometer-entries"></div></details></section>';
document.body.appendChild(historyMask);
const historyCSS=document.createElement('style');historyCSS.textContent=
'.vehicle-locked .showroom-count{display:none!important}' +
'.maintenance-list-panel{max-height:85dvh;overflow:auto}.maintenance-list-vehicle{color:#b6d5ed;font-size:13px;font-weight:750;margin:8px 0 12px}' +
'.maintenance-list-items{display:flex;flex-direction:column;gap:9px}.maintenance-entry{border:1px solid #58728e;border-radius:11px;background:#122338;padding:12px;color:#eff8ff}' +
'.maintenance-entry strong{display:block;font-size:15px;margin-bottom:5px}.maintenance-entry small{display:block;color:#bdd2e6;font-size:12px;line-height:1.6}' +
'.maintenance-empty{color:#b7cce0;font-size:14px;padding:22px 3px;text-align:center}' +
'.maintenance-older{margin-top:12px}.maintenance-older[hidden]{display:none!important}.maintenance-expand{width:100%;min-height:45px;margin-top:12px;border:1px solid #799cb9;border-radius:11px;background:linear-gradient(#324c66,#162a40);color:#f3faff;font-size:14px;font-weight:850}.maintenance-expand:focus-visible{outline:3px solid #89d3ff;outline-offset:2px}' +
'.maintenance-swipe{position:relative;overflow:hidden;border-radius:11px;touch-action:pan-y}.maintenance-swipe .maintenance-entry{position:relative;z-index:2;transition:transform .2s ease;touch-action:pan-y;-webkit-user-select:none;user-select:none}.maintenance-swipe.open .maintenance-entry{transform:translateX(-136px)}' +
'.maintenance-swipe-actions{position:absolute;inset:0 0 0 auto;width:136px;display:flex}.maintenance-swipe-actions button{flex:1;border:0;color:#fff;font-size:13px;font-weight:850}.maintenance-history-edit{background:#1673c8}.maintenance-history-delete{background:#b73542}' +
'.maintenance-edit-mask[hidden]{display:none!important}.maintenance-edit-mask{position:fixed;inset:0;z-index:115;background:#02060bce;display:flex;align-items:flex-end;justify-content:center;padding:12px 12px max(24px,env(safe-area-inset-bottom))}' +
'.maintenance-edit-sheet{width:100%;max-width:520px;max-height:90dvh;overflow:auto;background:linear-gradient(150deg,#30445c,#0b192a);border:1px solid #90adc8;border-radius:18px;padding:19px;color:#f2faff}' +
'.maintenance-edit-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:13px}.maintenance-edit-head strong{font-size:18px}.maintenance-edit-close{width:36px;height:36px;font-size:25px;color:white;border:1px solid #7794ae;background:#162b40;border-radius:9px}' +
'.maintenance-edit-sheet label{display:block;font-size:13px;font-weight:800;margin-top:12px}.maintenance-edit-sheet input{width:100%;height:47px;margin-top:7px;padding:0 12px;border-radius:10px;border:2px solid #a5c5e3;background:#f3f9ff;color:#14283b;font-size:18px;font-weight:800}' +
'.maintenance-edit-save{width:100%;height:48px;margin-top:17px;border:1px solid #80d4ff;border-radius:10px;background:linear-gradient(#52b0f6,#0d61b6);color:#fff;font-size:16px;font-weight:850}.maintenance-edit-error{min-height:19px;color:#ffd3b3;font-size:12px;margin:8px 0 0}' +
 '.maintenance-vehicle-label{display:block;color:#bbd3e8;font-size:12px;font-weight:800;margin:7px 0 5px}.maintenance-vehicle-select{width:100%;height:43px;border:1px solid #91afc8;border-radius:9px;background:#f2f8ff;color:#132b41;padding:0 10px;font-size:16px;font-weight:850;margin-bottom:13px}.maintenance-odometer-section{margin-top:17px;padding:12px;border:1px solid #5f819f;border-radius:11px;color:#dfedfa;font-size:13px}.maintenance-odometer-section summary{cursor:pointer;font-weight:850}.maintenance-odometer-entries{display:flex;flex-direction:column;gap:7px;margin-top:9px;color:#bed5e8;font-size:12px;max-height:200px;overflow:auto}.maintenance-record-next{display:block;margin-top:5px;color:#8bd2ff;font-size:12px;font-weight:850}';
document.head.appendChild(historyCSS);
function currentPartName(id){
 const row=[...document.querySelectorAll('.rows .part[data-part-id]')].find(el=>el.dataset.partId===id);
 return row?.querySelector('.part-line strong')?.textContent || id;
}
let expandedOlder=false;
function showHistory(){
 const select=historyMask.querySelector('.maintenance-vehicle-select');select.replaceChildren();
 for(const bike of bikes.filter(b=>registered[b.id])){const opt=document.createElement('option');opt.value=bike.id;opt.textContent=bike.name;select.appendChild(opt)}
 select.value=currentBike().id;
 const all=getVehicleData(currentBike().id).records||{};
 const events=Object.entries(all).flatMap(([id,arr])=>Array.isArray(arr)?arr.map((item,seq)=>({id,...item,seq})):[])
  .sort((a,b)=>String(b.date).localeCompare(String(a.date))||Number(b.at)-Number(a.at));
 const box=historyMask.querySelector('.maintenance-list-items');box.replaceChildren();
 historyMask.querySelector('.maintenance-list-vehicle').textContent=currentBike().name+' · 총 '+events.length+'건';
 if(!events.length){const empty=document.createElement('p');empty.className='maintenance-empty';empty.textContent='저장된 정비기록이 없습니다.';box.appendChild(empty)}
 else {
  const older=document.createElement('div');older.className='maintenance-older maintenance-list-items';older.hidden=!expandedOlder;
  for(const [i,e] of events.entries()){
   const wrap=document.createElement('div');wrap.className='maintenance-swipe';
   const actions=document.createElement('div');actions.className='maintenance-swipe-actions';
   actions.innerHTML='<button type="button" class="maintenance-history-edit">수정</button><button type="button" class="maintenance-history-delete">삭제</button>';
   const card=document.createElement('article');card.className='maintenance-entry';
   const title=document.createElement('strong');title.textContent=currentPartName(e.id);
   const detail=document.createElement('small');detail.textContent=e.date+' · 정비 당시 '+fmt(e.at)+'km · 교체주기 '+fmt(e.interval)+'km';
   const due=document.createElement('span');due.className='maintenance-record-next';due.textContent='다음 교체 예정 '+fmt(Number(e.at)+Number(e.interval))+'km';card.append(title,detail,due);wrap.append(actions,card);(i<5?box:older).appendChild(wrap);
   actions.querySelector('.maintenance-history-edit').addEventListener('click',()=>openMaintenanceEdit(e.id,e.seq));
   actions.querySelector('.maintenance-history-delete').addEventListener('click',()=>deleteMaintenanceRecord(e.id,e.seq));
   let startX=0,startY=0;
   wrap.addEventListener('touchstart',ev=>{if(ev.touches.length!==1)return;startX=ev.touches[0].clientX;startY=ev.touches[0].clientY},{passive:true});
   wrap.addEventListener('touchend',ev=>{const t=ev.changedTouches[0],dx=t.clientX-startX,dy=t.clientY-startY;if(Math.abs(dx)<35||Math.abs(dx)<Math.abs(dy)*1.25)return;box.querySelectorAll('.maintenance-swipe.open').forEach(x=>{if(x!==wrap)x.classList.remove('open')});if(dx<0)wrap.classList.add('open');else wrap.classList.remove('open')},{passive:true});
  }
  if(events.length>5){
   const toggle=document.createElement('button');toggle.type='button';toggle.className='maintenance-expand';
   toggle.setAttribute('aria-expanded',String(expandedOlder));toggle.textContent=expandedOlder?'이전 기록 접기 ▴':'이전 기록 펼치기 ('+(events.length-5)+'건) ▾';
   toggle.addEventListener('click',()=>{older.hidden=!older.hidden;expandedOlder=!older.hidden;toggle.setAttribute('aria-expanded',String(expandedOlder));toggle.textContent=older.hidden?'이전 기록 펼치기 ('+(events.length-5)+'건) ▾':'이전 기록 접기 ▴'});
   box.append(toggle,older);
  }
 }
 const kmBox=historyMask.querySelector('.maintenance-odometer-entries');kmBox.replaceChildren();
 const kmLog=Array.isArray(getVehicleData(currentBike().id).odometerHistory)?getVehicleData(currentBike().id).odometerHistory:[];
 if(!kmLog.length){const line=document.createElement('div');line.textContent='저장된 주행거리 변경 내역이 없어.';kmBox.appendChild(line)}
 else for(const x of [...kmLog].reverse()){
  if(!valid(Number(x.at)))continue;const line=document.createElement('div'),date=new Date(x.date);
  line.textContent=(Number.isFinite(date.getTime())?date.toLocaleString('ko-KR'):'날짜 미상')+' · '+fmt(x.at)+'km';kmBox.appendChild(line);
 }
 historyMask.hidden=false;document.body.classList.add('registration-open');
}

// Only the selected record is replaced/deleted; other records and maintenance metadata remain unchanged.
const maintenanceEditMask=document.createElement('div');
maintenanceEditMask.className='maintenance-edit-mask';maintenanceEditMask.hidden=true;
maintenanceEditMask.setAttribute('role','dialog');maintenanceEditMask.setAttribute('aria-modal','true');
maintenanceEditMask.innerHTML='<form class="maintenance-edit-sheet"><div class="maintenance-edit-head"><strong>정비기록 수정</strong><button type="button" class="maintenance-edit-close" aria-label="닫기">×</button></div><div class="maintenance-edit-part"></div><label>정비 날짜<input name="date" type="date" required></label><label>정비 당시 주행거리 (km)<input name="at" type="number" min="0" max="9999999" step="1" required></label><label>교체 주기 (km)<input name="interval" type="number" min="1" max="1000000" step="1" required></label><p class="maintenance-edit-error" aria-live="polite"></p><button type="submit" class="maintenance-edit-save">변경사항 저장</button></form>';
document.body.appendChild(maintenanceEditMask);
const maintenanceEditForm=maintenanceEditMask.querySelector('form');
let editingRecordRef=null;
function closeMaintenanceEdit(){maintenanceEditMask.hidden=true;editingRecordRef=null}
function openMaintenanceEdit(id,seq){
 const arr=getVehicleData(currentBike().id).records?.[id],item=arr?.[seq];if(!item)return;
 editingRecordRef={bikeId:currentBike().id,id,seq,original:{...item}};
 maintenanceEditForm.elements.date.value=item.date;
 maintenanceEditForm.elements.at.value=item.at;
 maintenanceEditForm.elements.interval.value=item.interval;
 maintenanceEditMask.querySelector('.maintenance-edit-part').textContent=currentPartName(id);
 maintenanceEditMask.querySelector('.maintenance-edit-error').textContent='';
 maintenanceEditMask.hidden=false;maintenanceEditForm.elements.date.focus({preventScroll:true});
}
maintenanceEditMask.querySelector('.maintenance-edit-close').addEventListener('click',closeMaintenanceEdit);
maintenanceEditMask.addEventListener('click',e=>{if(e.target===maintenanceEditMask)closeMaintenanceEdit()});
maintenanceEditForm.addEventListener('submit',e=>{
 e.preventDefault();const ref=editingRecordRef;if(!ref)return;
 const date=maintenanceEditForm.elements.date.value,at=Number(maintenanceEditForm.elements.at.value),interval=Number(maintenanceEditForm.elements.interval.value);
 const reg=registered[ref.bikeId],vehicle=database[ref.bikeId],maximum=vehicle?.odometer;
 const err=maintenanceEditMask.querySelector('.maintenance-edit-error');
 if(!reg||!/^\d{4}-\d{2}-\d{2}$/.test(date)||(!Number.isFinite(Date.parse(date+'T00:00:00'))||new Date(date+'T00:00:00').getDate()!==Number(date.slice(8,10)))||maintenanceEditForm.elements.at.value.trim()===''||!valid(at)||at<reg.km||at>maximum||maintenanceEditForm.elements.interval.value.trim()===''||!Number.isSafeInteger(interval)||interval<1||interval>1000000){
  err.textContent='날짜·정비 주행거리·교체 주기를 확인해. 정비 주행거리는 시작~현재 범위여야 해.';return;
 }
 const source=getVehicleData(ref.bikeId),arr=source.records?.[ref.id]||[];
 if(!arr[ref.seq]||JSON.stringify(arr[ref.seq])!==JSON.stringify(ref.original)){err.textContent='기록이 변경되었어. 다시 열어 수정해.';return}
 const newArr=arr.map((v,i)=>i===ref.seq?{...v,date,at,interval}:v).sort((a,b)=>a.at-b.at||String(a.date).localeCompare(String(b.date)));
 const next={...database,[ref.bikeId]:{...source,records:{...source.records,[ref.id]:newArr}}};
 try{write(dataKey,next);database=next;closeMaintenanceEdit();renderParts();showHistory()}catch(e){err.textContent='변경사항을 저장하지 못했어.'}
});
function deleteMaintenanceRecord(id,seq){
 const bikeId=currentBike().id,source=getVehicleData(bikeId),arr=source.records?.[id]||[],item=arr[seq];if(!item)return;
 if(!confirm('“'+currentPartName(id)+'” 정비기록 ('+item.date+') 1건을 삭제할까?\n다른 기록은 유지돼.'))return;
 const nextArr=arr.filter((_,i)=>i!==seq);
 const records={...source.records,[id]:nextArr};
 const next={...database,[bikeId]:{...source,records}};
 try{write(dataKey,next);database=next;renderParts();showHistory()}catch(e){alert('삭제하지 못했어. 저장공간을 확인해.')}
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!maintenanceEditMask.hidden)closeMaintenanceEdit()});

function closeHistory(){historyMask.hidden=true;document.body.classList.remove('registration-open')}
historyMask.querySelector('.maintenance-vehicle-select').addEventListener('change',e=>{
 document.dispatchEvent(new CustomEvent('motorcycle:select-vehicle',{detail:{id:e.target.value}}));expandedOlder=false;showHistory();
});
historyMask.querySelector('.maintenance-list-close').addEventListener('click',closeHistory);
historyMask.addEventListener('click',e=>{if(e.target===historyMask)closeHistory()});
const historyTab=[...document.querySelectorAll('.tabs .tab')].find(el=>el.textContent.trim()==='정비기록');
if(historyTab){historyTab.setAttribute('role','button');historyTab.tabIndex=0;historyTab.addEventListener('click',showHistory);historyTab.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showHistory()}})}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!historyMask.hidden)closeHistory()});

document.addEventListener('motorcycle:custom-parts-change',renderParts);renderInfo();position(0,false);
})();