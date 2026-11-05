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
function width(){return stage.getBoundingClientRect().width||1}
function position(offset,animate){track.style.transition=animate?'transform 370ms cubic-bezier(.22,.75,.19,1)':'none';track.style.transform='translate3d('+(-index*width()+offset)+'px,0,0)'}
function renderInfo(){const b=currentBike(),r=currentRegistration(),odo=getOdometer();name.textContent=b.name;
meta.textContent=r?(r.condition==='new'?'신차':'중고차')+' · 시작 '+fmt(r.km)+'km · 현재 '+fmt(odo)+'km':b.demo;
brand.innerHTML=b.brand==='honda'?hondaLogo:unknownLogo;brand.setAttribute('aria-label',b.brand==='honda'?'혼다':'제조사 미정');
counter.textContent=isLocked()?'':bikes.map((_,i)=>i===index?'●':'○').join(' ');document.body.classList.toggle('vehicle-locked',isLocked());stage.setAttribute('aria-label',isLocked()?'등록된 내 오토바이 이미지':'오토바이 이미지: 좌우 스와이프로 차량 선택');document.body.dataset.activeBike=b.id;renderParts();document.dispatchEvent(new CustomEvent('motorcycle:change',{detail:{bikeId:b.id}}))}
function renderParts(){const reg=currentRegistration(),odo=getOdometer(),data=getVehicleData(currentBike().id);
document.querySelectorAll('.part:not(.part-add-card)').forEach((row,i)=>{const id=row.dataset.partId||items[i]?.id;const item=items.find(x=>x.id===id)||{id,interval:Number(row.dataset.interval)||0};if(!id)return;const records=data.records&&Array.isArray(data.records[item.id])?data.records[item.id]:[],last=records.length?records[records.length-1]:null;
const text=row.querySelector('.part-line span'),bar=row.querySelector('.gauge-fill'),btn=row.querySelector('.service');
bar.classList.remove('blue','amber');bar.classList.add('blue');btn.classList.remove('blue','amber');btn.classList.add('blue');
if(!reg){text.textContent='차량 등록 후 확인';bar.style.width='0%';row.classList.add('part-unregistered');}
else if(!last){text.textContent=item.interval?'기록 없음 / '+fmt(item.interval)+'km':'기록 없음';bar.style.width='0%';row.classList.add('part-unregistered');}
else{const used=Math.max(0,odo-last.at),interval=valid(last.interval)&&last.interval>0?last.interval:item.interval;const ratio=Math.min(100,Math.round(used/interval*100));text.textContent=fmt(used)+' / '+fmt(interval)+'km';bar.style.width=ratio+'%';row.classList.remove('part-unregistered');bar.classList.toggle('amber',ratio>=70);bar.classList.toggle('blue',ratio<70);btn.classList.toggle('amber',ratio>=70);btn.classList.toggle('blue',ratio<70)}
btn.setAttribute('role','button');btn.tabIndex=0;btn.setAttribute('aria-label',row.querySelector('strong').textContent+' 정비기록 등록');});
}
function hideCheck(){clearTimeout(checkTimer);check.classList.remove('visible');check.setAttribute('aria-hidden','true')}
function openReg(){returnFocus=document.activeElement;const r=currentRegistration(),odo=getOdometer();regTitle.textContent=currentBike().name;document.getElementById('registration-title').textContent=r?'오토바이 정보 수정':'오토바이 등록';regForm.querySelector('.registration-save').textContent=r?'변경사항 저장':'이 오토바이 등록';
regForm.querySelector('input[name="condition"][value="new"]').checked=!!r&&r.condition==='new';regForm.querySelector('input[name="condition"][value="used"]').checked=!r||r.condition!=='new';
regKm.value=r?String(r.km):'0';currentKm.value=r?String(odo):String(Number(regKm.value)||0);regError.textContent='';syncReg();
regMask.hidden=false;document.body.classList.add('registration-open');regClose.focus()}
function closeReg(){regMask.hidden=true;document.body.classList.remove('registration-open');if(returnFocus?.focus)returnFocus.focus()}
function selectVisible(){if(animating||!regMask.hidden||!recordMask.hidden)return;chosen=index;hideCheck();void check.offsetWidth;check.classList.add('visible');check.setAttribute('aria-hidden','false');clearTimeout(formTimer);formTimer=setTimeout(()=>{hideCheck();openReg()},640)}
function change(next){if(isLocked()||next<0||next>=bikes.length||animating){position(0,true);return}animating=true;hideCheck();clearTimeout(formTimer);index=next;position(0,true);renderInfo();tint.classList.remove('flash');void tint.offsetWidth;tint.classList.add('flash');setTimeout(()=>animating=false,385)}
function syncReg(){const isNew=regForm.querySelector('input[name="condition"]:checked')?.value==='new';regHint.textContent=isNew?'신차 인수 당시 주행거리를 입력해':'중고차 인수 당시 계기판 주행거리를 입력해'}
regForm.querySelectorAll('input[name="condition"]').forEach(x=>x.addEventListener('change',syncReg));
regForm.addEventListener('submit',e=>{e.preventDefault();const at=Number(regKm.value),now=Number(currentKm.value),condition=regForm.querySelector('input[name="condition"]:checked').value,previous=currentRegistration();
if(regKm.value.trim()===''||currentKm.value.trim()===''||!valid(at)||!valid(now)||now<at){regError.textContent='시작·현재 주행거리를 확인해. 현재 주행거리는 시작보다 작을 수 없어.';return}
const old=getVehicleData(currentBike().id),all=Object.values(old.records||{}).flat().filter(x=>valid(x.at)),maxAt=all.reduce((v,x)=>Math.max(v,x.at),0);
if(now<maxAt){regError.textContent='이미 기록된 정비 주행거리보다 현재 주행거리를 낮출 수 없어.';return}
if(previous&&at!==previous.km&&maxAt&&at>maxAt){regError.textContent='시작 주행거리는 기록된 정비 주행거리보다 클 수 없어.';return}
const nextReg={...registered,[currentBike().id]:{condition,km:at}},nextData={...database,[currentBike().id]:{...old,odometer:now,records:old.records||{}}};
try{write(regKey,nextReg);write(dataKey,nextData);localStorage.setItem(chosenKey,currentBike().id);registered=nextReg;database=nextData;renderInfo();closeReg();check.classList.add('visible');checkTimer=setTimeout(hideCheck,720)}catch{regError.textContent='저장할 수 없어. 브라우저 저장공간을 확인해.'}
});
regClose.addEventListener('click',closeReg);regMask.addEventListener('click',e=>{if(e.target===regMask)closeReg()});
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
stage.addEventListener('pointerup',e=>finish(e,false));stage.addEventListener('pointercancel',e=>finish(e,true));
stage.addEventListener('keydown',e=>{if(!regMask.hidden||!recordMask.hidden||isLocked())return;if(e.key==='ArrowRight'){e.preventDefault();change(index+1)}else if(e.key==='ArrowLeft'){e.preventDefault();change(index-1)}});
stage.tabIndex=0;stage.setAttribute('role','group');stage.setAttribute('aria-label','오토바이 전시 이미지');
window.addEventListener('resize',()=>position(0,false));window.addEventListener('pageshow',()=>position(0,false));

// Vehicle-scoped maintenance history: previously saved records are read, never rewritten.
const historyMask=document.createElement('div');historyMask.className='registration-mask';historyMask.hidden=true;
historyMask.setAttribute('role','dialog');historyMask.setAttribute('aria-modal','true');historyMask.setAttribute('aria-label','정비기록 전체 보기');
historyMask.innerHTML='<section class="registration-panel maintenance-list-panel"><div class="registration-heading"><strong>정비기록</strong><button type="button" aria-label="닫기" class="maintenance-list-close">×</button></div><p class="maintenance-list-vehicle"></p><div class="maintenance-list-items"></div></section>';
document.body.appendChild(historyMask);
const historyCSS=document.createElement('style');historyCSS.textContent=
'.vehicle-locked .showroom-count{display:none!important}' +
'.maintenance-list-panel{max-height:85dvh;overflow:auto}.maintenance-list-vehicle{color:#b6d5ed;font-size:13px;font-weight:750;margin:8px 0 12px}' +
'.maintenance-list-items{display:flex;flex-direction:column;gap:9px}.maintenance-entry{border:1px solid #58728e;border-radius:11px;background:#122338;padding:12px;color:#eff8ff}' +
'.maintenance-entry strong{display:block;font-size:15px;margin-bottom:5px}.maintenance-entry small{display:block;color:#bdd2e6;font-size:12px;line-height:1.6}' +
'.maintenance-empty{color:#b7cce0;font-size:14px;padding:22px 3px;text-align:center}' +
'.maintenance-older{margin-top:12px}.maintenance-older[hidden]{display:none!important}.maintenance-expand{width:100%;min-height:45px;margin-top:12px;border:1px solid #799cb9;border-radius:11px;background:linear-gradient(#324c66,#162a40);color:#f3faff;font-size:14px;font-weight:850}.maintenance-expand:focus-visible{outline:3px solid #89d3ff;outline-offset:2px}';
document.head.appendChild(historyCSS);
function currentPartName(id){
 const row=[...document.querySelectorAll('.rows .part[data-part-id]')].find(el=>el.dataset.partId===id);
 return row?.querySelector('.part-line strong')?.textContent || id;
}
function showHistory(){
 const all=getVehicleData(currentBike().id).records||{};
 const events=Object.entries(all).flatMap(([id,arr])=>Array.isArray(arr)?arr.map((item,seq)=>({id,...item,seq})):[])
  .sort((a,b)=>String(b.date).localeCompare(String(a.date))||Number(b.at)-Number(a.at));
 const box=historyMask.querySelector('.maintenance-list-items');box.replaceChildren();
 historyMask.querySelector('.maintenance-list-vehicle').textContent=currentBike().name+' · 총 '+events.length+'건';
 if(!events.length){const empty=document.createElement('p');empty.className='maintenance-empty';empty.textContent='저장된 정비기록이 없습니다.';box.appendChild(empty)}
 else {
  const older=document.createElement('div');older.className='maintenance-older maintenance-list-items';older.hidden=true;
  for(const [i,e] of events.entries()){
   const card=document.createElement('article');card.className='maintenance-entry';
   const title=document.createElement('strong');title.textContent=currentPartName(e.id);
   const detail=document.createElement('small');detail.textContent=e.date+' · 정비 당시 '+fmt(e.at)+'km · 교체주기 '+fmt(e.interval)+'km';
   card.append(title,detail);(i<5?box:older).appendChild(card);
  }
  if(events.length>5){
   const toggle=document.createElement('button');toggle.type='button';toggle.className='maintenance-expand';
   toggle.setAttribute('aria-expanded','false');toggle.textContent='이전 기록 펼치기 ('+(events.length-5)+'건) ▾';
   toggle.addEventListener('click',()=>{older.hidden=!older.hidden;toggle.setAttribute('aria-expanded',String(!older.hidden));toggle.textContent=older.hidden?'이전 기록 펼치기 ('+(events.length-5)+'건) ▾':'이전 기록 접기 ▴'});
   box.append(toggle,older);
  }
 }
 historyMask.hidden=false;document.body.classList.add('registration-open');
}
function closeHistory(){historyMask.hidden=true;document.body.classList.remove('registration-open')}
historyMask.querySelector('.maintenance-list-close').addEventListener('click',closeHistory);
historyMask.addEventListener('click',e=>{if(e.target===historyMask)closeHistory()});
const historyTab=[...document.querySelectorAll('.tabs .tab')].find(el=>el.textContent.trim()==='정비기록');
if(historyTab){historyTab.setAttribute('role','button');historyTab.tabIndex=0;historyTab.addEventListener('click',showHistory);historyTab.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showHistory()}})}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!historyMask.hidden)closeHistory()});

document.addEventListener('motorcycle:custom-parts-change',renderParts);renderInfo();position(0,false);
})();