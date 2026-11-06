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
const hasRegisteredBikes=()=>Object.values(registered).some(r=>r&&typeof r==='object');
const isLocked=()=>!!registered[bikes[index]?.id];
const hondaLogo=brand.innerHTML,unknownLogo='<svg viewBox="0 0 64 42" aria-hidden="true" class="generic-bike-mark"><circle cx="15" cy="30" r="8"/><circle cx="49" cy="30" r="8"/><path d="M15 30 26 14h13l10 16M25 14l8 16H15m18 0 10-13h8"/></svg><strong>BRAND</strong>';
const fmt=n=>Number(n).toLocaleString('ko-KR'),valid=n=>Number.isSafeInteger(n)&&n>=0&&n<=9999999;
function todayLocal(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function validMaintenanceDate(raw){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(raw))return false;
 const date=new Date(raw+'T00:00:00');
 return Number.isFinite(date.getTime())&&date.getFullYear()===Number(raw.slice(0,4))&&date.getMonth()+1===Number(raw.slice(5,7))&&date.getDate()===Number(raw.slice(8,10));
}
function currentBike(){return bikes[index]}function currentRegistration(){return registered[currentBike().id]}
function getVehicleData(id){const x=database[id];return x&&typeof x==='object'&&!Array.isArray(x)?x:{records:{}}}
function getOdometer(){const r=currentRegistration(),v=getVehicleData(currentBike().id);return r?valid(v.odometer)&&v.odometer>=r.km?v.odometer:r.km:null}
function write(key,obj){localStorage.setItem(key,JSON.stringify(obj))}
function officialCycleSettings(profile){
 const result={};
 if(!profile)return result;
 const add=(part,field,value)=>{
  if(!Number.isSafeInteger(value)||value<=0||value>1000000)return;
  const source=field+'Source',entry=result[part]||(result[part]={});
  entry[field]=value;entry[source]='official';
 };
 for(const [part,km] of Object.entries(profile.intervals||{})){
  const action=profile.actionByPart?.[part]||'replace';
  add(part,action==='inspect'?'inspectInterval':action==='clean'?'cleanInterval':'interval',km);
 }
 for(const [part,task] of Object.entries(profile.tasks||{})){
  add(part,'inspectInterval',task.inspectKm);
  add(part,'cleanInterval',task.cleanKm);
  if(task.replaceKm&&!Object.prototype.hasOwnProperty.call(result[part]||{},'interval'))
   add(part,'interval',task.replaceKm);
 }
 return result;
}
function mergeOfficialCycles(previous,cycles){
 const updated={...previous};
 for(const [part,cycle] of Object.entries(cycles)){
  const cfg={...(previous[part]||{})};
  // A cleaning or inspection-only component must never inherit a false
  // official replacement interval from older app versions.
  if(!Object.prototype.hasOwnProperty.call(cycle,'interval')&&cfg.intervalSource==='official'){
   delete cfg.interval;delete cfg.intervalSource;
  }
  for(const field of ['interval','inspectInterval','cleanInterval']){
   if(!Object.prototype.hasOwnProperty.call(cycle,field))continue;
   const source=field+'Source';
   if(cfg[source]==='user'||(Object.prototype.hasOwnProperty.call(cfg,field)&&cfg[source]!=='official'))continue;
   cfg[field]=cycle[field];cfg[source]='official';
  }
  updated[part]=cfg;
 }
 return updated;
}
function reconcileVehicleOfficialCycles(previous,profile){
 const cycles=officialCycleSettings(profile),cleaned={};
 for(const [part,settings] of Object.entries(previous)){
  const cfg={...settings};
  for(const field of ['interval','inspectInterval','cleanInterval']){
   if(cfg[field+'Source']==='official'&&!Object.prototype.hasOwnProperty.call(cycles[part]||{},field)){
    delete cfg[field];delete cfg[field+'Source'];
   }
  }
  cleaned[part]=cfg;
 }
 return mergeOfficialCycles(cleaned,cycles);
}
function reconnectOfficialProfile(id){
 const reg=registered[id];if(!reg)return false;
 const profile=window.MotorcycleCatalog?.findOfficialProfile(reg.brand,reg.model,reg.year)||null;
 const key='motorcycle-skeleton-part-appearance-v1',all=load(key),existing=all[id]||{};
 const updated=reconcileVehicleOfficialCycles(existing,profile);
 const settingsChanged=JSON.stringify(updated)!==JSON.stringify(existing);
 const status=profile?'official':'unverified',source=profile?.source||null;
 const registrationChanged=reg.maintenanceProfileStatus!==status||(reg.maintenanceProfileSource||null)!==source;
 if(!settingsChanged&&!registrationChanged)return false;
 const nextReg=registrationChanged?{...registered,[id]:{...reg,maintenanceProfileStatus:status,maintenanceProfileSource:source}}:registered;
 try{
  if(settingsChanged)write(key,{...all,[id]:updated});
  if(registrationChanged){write(regKey,nextReg);registered=nextReg}
  return true;
 }catch(err){console.warn('공식 정비주기 연결 실패:',err);return false}
}
for(const id of Object.keys(registered))reconnectOfficialProfile(id);
document.addEventListener('motorcycle:year-changed',event=>{
 const id=event.detail?.bikeId,reg=registered[id];if(!reg)return;
 const current=load(regKey)[id];if(!current)return;
 registered={...registered,[id]:current};
 if(reconnectOfficialProfile(id))renderInfo();
 else renderInfo();
});
function partSettings(bikeId,partId){return load('motorcycle-skeleton-part-appearance-v1')[bikeId]?.[partId]||{}}
function officialProfile(reg){
 return reg?window.MotorcycleCatalog?.findOfficialProfile(reg.brand,reg.model,reg.year)||null:null;
}
function officialTask(reg,partId){return officialProfile(reg)?.tasks?.[partId]||null}
function partAction(reg,partId){
 return officialProfile(reg)?.actionByPart?.[partId]||'replace';
}
function actionText(action){return action==='inspect'?'점검':action==='clean'?'청소':'교체'}
function officialActionInterval(profile,id,action){
 if(!profile)return 0;
 const task=profile.tasks?.[id]||{},declared=profile.actionByPart?.[id]||'replace';
 const taskField=action==='inspect'?'inspectKm':action==='clean'?'cleanKm':'replaceKm';
 const taskKm=task[taskField];
 if(Number.isSafeInteger(taskKm)&&taskKm>0)return taskKm;
 // Profile intervals are for the declared task only; inspection is not replacement.
 return declared===action&&Number.isSafeInteger(profile.intervals?.[id])?profile.intervals[id]:0;
}
function actionInterval(reg,id,action){
 const settings=partSettings(currentBike().id,id);
 const field=action==='inspect'?'inspectInterval':action==='clean'?'cleanInterval':'interval';
 const fallback=officialActionInterval(officialProfile(reg),id,action);
 return Number.isSafeInteger(settings[field])&&settings[field]>=0?settings[field]:fallback;
}
// Keep card gauges, secondary actions and due notices on one saved-cycle rule.
function resolveServiceCycleDetails(settings,action,last,configured,officialDefault=0){
 const field=action==='inspect'?'inspectInterval':action==='clean'?'cleanInterval':'interval';
 const source=field+'Source';
 if(Number.isSafeInteger(settings[field])&&settings[field]>=0&&['user','official'].includes(settings[source]))
  return {km:settings[field],origin:settings[source]};
 if(last&&Number.isSafeInteger(last.interval)&&last.interval>0)
  return {km:last.interval,origin:'record'};
 if(Number.isSafeInteger(settings[field])&&settings[field]>=0)
  return {km:settings[field],origin:'legacy'};
 if(Number.isSafeInteger(officialDefault)&&officialDefault>0&&configured===officialDefault)
  return {km:configured,origin:'official'};
 return {km:configured,origin:'default'};
}
function resolveServiceCycle(settings,action,last,configured){
 return resolveServiceCycleDetails(settings,action,last,configured).km;
}
// One distance schedule for the part card and the maintenance notice.
function nextServiceDistance(reg,task,action,settings,interval,last){
 const sourceField=action==='inspect'?'inspectIntervalSource':action==='clean'?'cleanIntervalSource':'intervalSource';
 const firstEligible=action==='replace'&&reg.km===0&&settings[sourceField]!=='user'&&
  Number.isSafeInteger(task?.firstReplaceKm)&&task.firstReplaceKm>0;
 const first=firstEligible?task.firstReplaceKm:interval;
 const firstRegular=Number.isSafeInteger(task?.firstRegularOdometerKm)&&task.firstRegularOdometerKm>first
  ?task.firstRegularOdometerKm:0;
 if(!last)return {due:firstEligible?first:reg.km+interval,base:reg.km,firstEligible};
 if(firstEligible&&last.at<=first&&firstRegular)return {due:firstRegular,base:last.at,firstEligible};
 return {due:last.at+interval,base:last.at,firstEligible};
}
function actionCycleStatus(reg,id,records,action,odo){
 const configured=actionInterval(reg,id,action);
 const last=records.filter(r=>r&&(r.action||'replace')===action&&valid(r.at)&&r.at<=odo).sort((a,b)=>a.at-b.at||String(a.date||'').localeCompare(String(b.date||''))).at(-1);
 const cfg=partSettings(currentBike().id,id);
 const cycle=resolveServiceCycle(cfg,action,last,configured);
 if(!Number.isSafeInteger(cycle)||cycle<=0)return '';
 const schedule=nextServiceDistance(reg,officialTask(reg,id),action,cfg,cycle,last);
 if(!last&&(reg.km!==0||odo>schedule.due))
  return actionText(action)+' '+fmt(cycle)+'km 주기 · 이전 이력 확인 필요';
 const due=schedule.due;
 return actionText(action)+' '+fmt(cycle)+'km 주기 · 다음 '+fmt(due)+'km'+(odo>=due?' (도래)':'');
}
function effectiveInterval(bikeId,partId,defaultInterval){
 const cfg=partSettings(bikeId,partId);
 return Number.isSafeInteger(cfg.interval)&&cfg.interval>=0?cfg.interval:defaultInterval;
}
function addCalendarMonths(yyyyMMdd,months){
 if(!validMaintenanceDate(yyyyMMdd)||!Number.isSafeInteger(months)||months<1)return null;
 const [year,month,day]=yyyyMMdd.split('-').map(Number);
 const first=new Date(Date.UTC(year,month-1+months,1));
 const last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 const due=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth(),Math.min(day,last)));
 return due.toISOString().slice(0,10);
}
function dateBasedStatus(reg,partId,records){
 const months=officialTask(reg,partId)?.replaceMonths;
 if(!Number.isSafeInteger(months)||months<1)return null;
 const past=records.filter(x=>x&&validMaintenanceDate(x.date)&&(x.action||'replace')==='replace'&&x.date<=todayLocal())
  .sort((a,b)=>String(a.date).localeCompare(String(b.date))||Number(a.at)-Number(b.at));
 const last=past.at(-1);
 if(!last)return {months,missing:true};
 const due=addCalendarMonths(last.date,months);
 if(!due)return {months,missing:true};
 const today=todayLocal();
 const days=Math.round((Date.parse(due+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);
 return {months,due,days,missing:false};
}
function timingDescription(task){
 if(!task)return '';
 const messages=[];
 if(Number.isSafeInteger(task.replaceMonths))messages.push(task.replaceMonths+'개월마다 교체');
 // Inspection interval is shown by actionCycleStatus so it is not repeated here.
 if(task.replaceWhenWorn)messages.push('마모 상태에 따라 교체');
 return messages.join(' · ');
}
document.addEventListener('motorcycle:register-new-vehicle',event=>{
 const info=event.detail||{},id=info.id,name=String(info.name||'').trim(),at=Number(info.km);
 if(!/^bike-[a-z0-9-]+$/.test(id)||!name||name.length>100||registered[id]||!valid(at)||!Number.isSafeInteger(info.cc)||info.cc<1||info.cc>3000||!String(info.brand||'').trim()||!String(info.model||'').trim()||!Number.isSafeInteger(info.year)||info.year<1950||info.year>new Date().getFullYear())return;
 const verifiedProfile=window.MotorcycleCatalog?.findOfficialProfile(info.brand,info.model,info.year)||null;
 const nextReg={...registered,[id]:{name,brand:String(info.brand).trim(),model:String(info.model).trim(),cc:info.cc,km:at,year:Number.isSafeInteger(info.year)?info.year:null,wear:'auto',maintenanceProfileStatus:verifiedProfile?'official':'unverified',maintenanceProfileSource:verifiedProfile?.source||null}};
 const nextData={...database,[id]:{odometer:at,records:{},odometerHistory:[{at,date:new Date().toISOString()}]}};
 try{
  write(regKey,nextReg);write(dataKey,nextData);
  if(verifiedProfile){
   const key='motorcycle-skeleton-part-appearance-v1',appearance=load(key),current=appearance[id]||{};
   write(key,{...appearance,[id]:mergeOfficialCycles(current,officialCycleSettings(verifiedProfile))});
  }
  localStorage.setItem(chosenKey,id)
 }
 catch{alert('차량 저장에 실패했어. 기기 저장공간을 확인해.');return}
 registered=nextReg;database=nextData;appendVehicleView({id,name,brand:String(info.brand).trim(),demo:'등록 차량'});
 index=bikes.findIndex(x=>x.id===id);position(0,false);renderInfo();
 document.dispatchEvent(new CustomEvent('motorcycle:vehicle-saved',{detail:{id}}));
});
document.addEventListener('motorcycle:update-vehicle',event=>{
 const d=event.detail||{},id=d.id,prior=registered[id];
 if(!prior||typeof id!=='string'||typeof d.brand!=='string'||typeof d.model!=='string')return;
 const brandName=d.brand.trim(),modelName=d.model.trim(),display=(brandName+' '+modelName).trim();
 if(!brandName||brandName.length>40||!modelName||modelName.length>55||display.length>100
  ||!Number.isSafeInteger(d.cc)||d.cc<1||d.cc>3000
  ||!Number.isSafeInteger(d.year)||d.year<1950||d.year>new Date().getFullYear()
  ||!valid(d.km))return;
 const entries=Object.values(getVehicleData(id).records||{}).flat();
 const lastService=entries.reduce((max,v)=>valid(v?.at)?Math.max(max,v.at):max,0);
 const current=Number.isSafeInteger(database[id]?.odometer)?database[id].odometer:prior.km;
 if(d.km>current||(lastService&&d.km>lastService))return;
 const changedProfile=String(prior.brand||'').toUpperCase()!==brandName.toUpperCase()
  ||String(prior.model||'').toUpperCase()!==modelName.toUpperCase()||prior.year!==d.year;
 const newProfile=changedProfile?window.MotorcycleCatalog?.findOfficialProfile(brandName,modelName,d.year)||null:null;
 const profileFields=changedProfile?{
  maintenanceProfileStatus:newProfile?'official':'unverified',
  maintenanceProfileSource:newProfile?.source||null
 }:{};
 const next={...registered,[id]:{...prior,name:display,brand:brandName,model:modelName,cc:d.cc,year:d.year,km:d.km,wear:'auto',...profileFields}};
 try{
  if(changedProfile){
   const key='motorcycle-skeleton-part-appearance-v1',all=load(key),existing=all[id]||{},updated={};
   for(const [part,cfg] of Object.entries(existing)){
    const clean={...cfg};
    for(const field of ['interval','inspectInterval','cleanInterval']){
     if(clean[field+'Source']==='official'){delete clean[field];delete clean[field+'Source']}
    }
    updated[part]=clean;
   }
   Object.assign(updated,mergeOfficialCycles(updated,officialCycleSettings(newProfile)));
   write(key,{...all,[id]:updated});
  }
  write(regKey,next);
 }catch{return}
 registered=next;
 const bike=bikes.find(b=>b.id===id);
 if(bike){bike.name=display;bike.brand=brandName.toLowerCase()==='honda'?'honda':brandName}
 const slide=bikes.indexOf(bike)>=0?track.children[bikes.indexOf(bike)]:null;
 if(slide)slide.setAttribute('aria-label',display);
 renderInfo();
 document.dispatchEvent(new CustomEvent('motorcycle:appearance-changed',{detail:{bikeId:id}}));
});
document.addEventListener('motorcycle:select-vehicle',event=>{
 const id=event.detail?.id,at=bikes.findIndex(x=>x.id===id&&registered[id]);if(at<0)return;
 index=at;localStorage.setItem(chosenKey,id);position(0,false);renderInfo();
});
function width(){return stage.getBoundingClientRect().width||1}
function position(offset,animate){track.style.transition=animate?'transform 370ms cubic-bezier(.22,.75,.19,1)':'none';track.style.transform='translate3d('+(-index*width()+offset)+'px,0,0)'}
/* Distance-based, in-app notices. Existing maintenance records are never altered. */
const noticePanel=document.createElement('details');
noticePanel.className='maintenance-notices';
noticePanel.innerHTML='<summary><strong>정비 알림</strong><span class="maintenance-notice-count">확인 중</span></summary><div class="maintenance-notice-items" aria-live="polite"></div>';
document.querySelector('.tabs')?.after(noticePanel);
function updateMaintenanceNotices(){
 const count=noticePanel.querySelector('.maintenance-notice-count'),box=noticePanel.querySelector('.maintenance-notice-items');
 box.replaceChildren();const reg=currentRegistration(),odo=getOdometer();
 if(!reg||!valid(odo)){noticePanel.hidden=true;return}
 noticePanel.hidden=false;
 const vehicle=getVehicleData(currentBike().id),notices=[],unknownEntries=[],missingDates=[];
 const rows=[...document.querySelectorAll('.rows .part[data-part-id]')];
 for(const row of rows){
  if(row.closest('.part-swipe-wrap')?.hidden||row.hidden)continue;
  const id=row.dataset.partId,title=row.querySelector('.part-line strong')?.textContent||id;
  const task=officialTask(reg,id),profile=officialProfile(reg);
  const records=Array.isArray(vehicle.records?.[id])?vehicle.records[id]:[];
  for(const action of ['replace','inspect','clean']){
   const defaultKm=actionInterval(reg,id,action);
   const last=records.filter(x=>x&&valid(x.at)&&x.at<=odo&&(x.action||'replace')===action).sort((a,b)=>a.at-b.at||String(a.date||'').localeCompare(String(b.date||''))).at(-1);
   const cfg=partSettings(currentBike().id,id);
   const km=resolveServiceCycle(cfg,action,last,defaultKm);
   if(!Number.isSafeInteger(km)||km<=0)continue;
   const schedule=nextServiceDistance(reg,task,action,cfg,km,last);
   if(!last&&(reg.km!==0||odo>schedule.due)){unknownEntries.push({id,title,action,km});continue}
   const due=schedule.due;
   const remaining=due-odo;if(remaining>500)continue;
   notices.push({id,title,action,due,remaining,kind:'distance'});
  }
  if(Number.isSafeInteger(task?.replaceMonths)&&task.replaceMonths>0){
   const calendar=dateBasedStatus(reg,id,records);
   if(calendar?.missing){missingDates.push({id,title,months:task.replaceMonths})}
   else if(calendar&&calendar.days<=30){
    notices.push({id,title,action:'replace',due:calendar.due,remaining:calendar.days,kind:'calendar'});
   }
  }
 }
 notices.sort((a,b)=>a.remaining-b.remaining||a.title.localeCompare(b.title));
 const dueCount=notices.filter(x=>x.remaining<=0).length,soon=notices.length-dueCount;
 const profile=officialProfile(reg),parts=[];
 if(!profile)parts.push('공식 주기 확인');
 if(dueCount)parts.push('도래 '+dueCount+'건');
 if(soon)parts.push('임박 '+soon+'건');
 if(missingDates.length)parts.push('날짜 확인 '+missingDates.length+'건');
 if(unknownEntries.length)parts.push('이력 확인 '+unknownEntries.length+'건');
 count.textContent=parts.join(' · ')||'도래·임박 없음';
 for(const n of notices){
  const item=document.createElement('button');item.type='button';item.className='maintenance-notice-item';item.dataset.level=n.remaining<=0?'due':'soon';
 item.setAttribute('aria-label',n.title+' '+actionText(n.action)+' 정비기록 열기');
 item.addEventListener('click',()=>{
  const partRow=[...document.querySelectorAll('.rows .part[data-part-id]')].find(row=>row.dataset.partId===n.id);
  if(!partRow)return;
  partRow.classList.add('maintenance-notice-target');
  openRecord(partRow,{action:n.action});
  setTimeout(()=>partRow.classList.remove('maintenance-notice-target'),1800);
 });
  const title=document.createElement('strong');title.textContent=n.title+' · '+actionText(n.action);
  const detail=document.createElement('span');
  detail.textContent=n.kind==='calendar'
   ?n.remaining<0?'기한 '+fmt(-n.remaining)+'일 경과 · '+n.due:n.remaining===0?'오늘 교체 기한 · '+n.due:'교체까지 '+fmt(n.remaining)+'일 · '+n.due
   :n.remaining<=0?'정비 예정 거리 '+fmt(-n.remaining)+'km 경과 · '+fmt(n.due)+'km 기준':'정비까지 '+fmt(n.remaining)+'km · '+fmt(n.due)+'km 예정';
  item.append(title,detail);box.appendChild(item);
 }
 if(!profile){
  const p=document.createElement('p');p.className='maintenance-notice-disclaimer';
  p.textContent=(reg.year?reg.year+'년형':'연식 미입력')+' '+String(reg.brand||'')+' '+String(reg.model||'')+'의 공식 정비주기가 연결되지 않았어. 차량정보에서 제조사·기종·연식을 확인해.';box.appendChild(p);
 }
 if(!notices.length&&!missingDates.length&&!unknownEntries.length&&profile){const p=document.createElement('p');p.textContent='현재 500km 또는 30일 이내의 정비 알림이 없어.';box.appendChild(p)}
 if(missingDates.length){
  const p=document.createElement('p');p.className='maintenance-notice-disclaimer';
  p.textContent='마지막 교체일 확인 필요 ('+missingDates.length+'건). 실제 교체한 날짜와 당시 주행거리를 알고 있다면 아래 항목을 눌러 기록해.';box.appendChild(p);
  for(const entry of missingDates){
   const btn=document.createElement('button');btn.type='button';btn.className='maintenance-notice-item maintenance-missing-date';
   const label=document.createElement('strong');label.textContent=entry.title+' · '+entry.months+'개월마다 교체';
   const subtitle=document.createElement('span');subtitle.textContent='마지막 교체일 입력 필요 · 기록 추가';
   btn.append(label,subtitle);
   btn.addEventListener('click',()=>{
    const row=[...document.querySelectorAll('.rows .part[data-part-id]')].find(x=>x.dataset.partId===entry.id);
    if(!row)return;
    openRecord(row,{historical:true,action:'replace'});
   });
   box.appendChild(btn);
  }
 }
 if(unknownEntries.length){
  const p=document.createElement('p');p.className='maintenance-notice-disclaimer';
  p.textContent='정비 이력 확인 필요 '+unknownEntries.length+'건. 이전 작업의 실제 날짜와 당시 주행거리를 아는 항목만 등록해.';
  box.appendChild(p);
  for(const entry of unknownEntries){
   const btn=document.createElement('button');
   btn.type='button';btn.className='maintenance-notice-item maintenance-unknown-history';
   const label=document.createElement('strong');
   label.textContent=entry.title+' · '+actionText(entry.action);
   const detail=document.createElement('span');
   detail.textContent='기준 '+fmt(entry.km)+'km · 이전 정비 이력 확인 필요';
   btn.append(label,detail);
   btn.addEventListener('click',()=>{
    const row=[...document.querySelectorAll('.rows .part[data-part-id]')].find(x=>x.dataset.partId===entry.id);
    if(row)openRecord(row,{historical:true,action:entry.action});
   });
   box.appendChild(btn);
  }
 }
 const p=document.createElement('p');p.className='maintenance-notice-disclaimer';
 p.textContent='거리·날짜 기준 앱 내부 참고 알림이야. 정비 이력과 제조사 설명서의 운행 조건도 확인해.';box.appendChild(p);
}
document.addEventListener('motorcycle:change',updateMaintenanceNotices);
document.addEventListener('motorcycle:vehicle-saved',updateMaintenanceNotices);
document.addEventListener('motorcycle:appearance-changed',updateMaintenanceNotices);

/* Wall signage: Honda remains in the original garage scene; Yamaha uses a documented, real illuminated dealer sign photo. */
const garageSign=document.createElement('div');
garageSign.className='garage-sign';garageSign.setAttribute('aria-label','정비소 벽 간판');
garageSign.innerHTML='<span class="garage-sign-caption">MOTORCYCLE SERVICE</span><img alt="야마하 모터 2025 공식 로고" loading="eager">';
/* Mounted into the active showroom slide, behind the motorcycle, not on top of the whole garage. */
 garageSign.hidden=true;
/* Yamaha Motor's real, unmodified 2025 logomark (not a newly invented logo). */
const yamahaSignPhoto='https://commons.wikimedia.org/wiki/Special:Redirect/file/Yamaha_Motor_2025.svg';
const yamahaSignImg=garageSign.querySelector('img');
yamahaSignImg.addEventListener('load',()=>garageSign.classList.add('sign-photo-ready'));
yamahaSignImg.addEventListener('error',()=>garageSign.classList.remove('sign-photo-ready'));
function setGarageSign(maker){
 const wall=track.children[index];
 if(wall&&garageSign.parentElement!==wall)wall.appendChild(garageSign);
 garageSign.classList.remove('sign-photo-ready');
 garageSign.dataset.brand=maker==='HONDA'?'HONDA':maker==='YAMAHA'?'YAMAHA':'GENERAL';
 document.body.classList.toggle('garage-sign-honda',maker==='HONDA');
 document.body.classList.toggle('garage-sign-yamaha',maker==='YAMAHA');
 document.body.classList.toggle('garage-sign-general',maker!=='HONDA'&&maker!=='YAMAHA');
 garageSign.hidden=maker==='HONDA';
 garageSign.querySelector('.garage-sign-caption').textContent=maker==='YAMAHA'?'YAMAHA':'MOTORCYCLE SERVICE';
 if(maker==='YAMAHA'){
  if(yamahaSignImg.getAttribute('src')!==yamahaSignPhoto)yamahaSignImg.src=yamahaSignPhoto;
  else if(yamahaSignImg.complete&&yamahaSignImg.naturalWidth>0)garageSign.classList.add('sign-photo-ready');
 }else yamahaSignImg.removeAttribute('src');
}
const xmaxHero=document.createElement('img');
xmaxHero.className='xmax-model-photo';xmaxHero.alt='2025 Yamaha XMAX300 계열 공식 이미지에서 배경을 제거한 참고용 사진';
xmaxHero.loading='eager';xmaxHero.decoding='async';xmaxHero.hidden=true;
xmaxHero.addEventListener('load',()=>{
 if(xmaxHero.naturalWidth&&document.body.dataset.xmaxRequested==='true'){
  document.body.classList.add('xmax-2025-photo-ready');
  showroomNotice.textContent='XMAX300 계열 공식 사진 · 세부 트림 참고용';
 }
});
xmaxHero.addEventListener('error',()=>{
 document.body.classList.remove('xmax-2025-photo-ready');
 showroomNotice.textContent='차종 전용 이미지 미등록 · 참고용 스쿠터';
});
const xmaxPhotoUrl='./xmax300-transparent.svg?v=cutout-1';
const showroomNotice=document.createElement('span');
showroomNotice.className='showroom-reference-note';
showroomNotice.textContent='차종 전용 이미지 미등록 · 참고용 스쿠터';
stage.appendChild(showroomNotice);
function renderInfo(){
 // Each motorcycle keeps its own garage scene when the active brand changes.
 [...track.children].forEach((slide,i)=>slide.classList.toggle('current-bike-slide',i===index));
 const empty=!hasRegisteredBikes();
 document.body.classList.toggle('no-registered-vehicles',empty);
 track.hidden=false;counter.hidden=empty;check.hidden=empty;
 brand.hidden=empty;
 const odometerButton=$('odometer-button');
 if(odometerButton){odometerButton.hidden=empty;odometerButton.disabled=empty}
 if(empty){
  name.textContent='등록된 차량 없음';meta.textContent='설정에서 새 차량을 등록해.';
  document.body.classList.remove('vehicle-locked','non-honda-bike','garage-sign-honda','garage-sign-yamaha','garage-sign-general');
 garageSign.hidden=true;
  stage.setAttribute('aria-label','차량이 없는 정비소');
  document.body.dataset.activeBike='';
  renderParts();
  document.dispatchEvent(new CustomEvent('motorcycle:change',{detail:{bikeId:null}}));
  return;
 }
 const b=currentBike(),r=currentRegistration(),odo=getOdometer();name.textContent=b.name;name.title=b.name;
const maker=String(r?.brand||b.brand||'').trim().toUpperCase(),isHonda=maker==='HONDA';
document.body.classList.toggle('non-honda-bike',!isHonda);
setGarageSign(maker);
const xmaxRequested=maker==='YAMAHA'&&String(r?.model||'').trim().toUpperCase()==='XMAX300'&&Number(r?.year)===2025;
const referenceImageAllowed=maker==='HONDA'&&String(r?.model||'').trim().toUpperCase()==='PCX125';
const activeSlide=track.children[index];
if(activeSlide){const fallbackHero=activeSlide.querySelector('.motorcycle-hero');if(fallbackHero)fallbackHero.hidden=!referenceImageAllowed;const shadow=activeSlide.querySelector('.ground-shadow');if(shadow)shadow.hidden=!referenceImageAllowed&&!xmaxRequested;}
document.body.dataset.xmaxRequested=String(xmaxRequested);
if(xmaxRequested){
 const slide=track.children[index];if(slide&&xmaxHero.parentElement!==slide)slide.appendChild(xmaxHero);
 xmaxHero.hidden=false;
 if(xmaxHero.getAttribute('src')!==xmaxPhotoUrl)xmaxHero.src=xmaxPhotoUrl;
 else if(xmaxHero.complete&&xmaxHero.naturalWidth>0)document.body.classList.add('xmax-2025-photo-ready');
}else{xmaxHero.hidden=true;document.body.classList.remove('xmax-2025-photo-ready')}
const yearWarning=window.MotorcycleCatalog?.validateModelYear(maker,r?.model,Number(r?.year));
showroomNotice.textContent=yearWarning?yearWarning.description
 :xmaxRequested&&document.body.classList.contains('xmax-2025-photo-ready')?'XMAX300 계열 공식 사진 · 세부 트림 참고용'
 :referenceImageAllowed?'차종 전용 이미지 미등록 · 참고용 스쿠터'
 :'차종 전용 이미지 준비 중';
meta.replaceChildren();
if(r){
 const yearLine=document.createElement('span');yearLine.className='bike-meta-year';yearLine.textContent=r.year?r.year+'년형':'연식 미확인';
 const kmLine=document.createElement('span');kmLine.className='bike-meta-km';kmLine.textContent='시작 '+fmt(r.km)+'km · 현재 '+fmt(odo)+'km';
 meta.append(yearLine,kmLine);
}else meta.textContent=b.demo;
const odometerReadout=$('odometer-readout');if(odometerReadout)odometerReadout.textContent=r?fmt(odo)+'km':'등록 전';
brand.innerHTML=isHonda?hondaLogo:unknownLogo;
if(!isHonda){const mark=brand.querySelector('strong');if(mark)mark.textContent=maker||'BRAND'}
brand.classList.remove('brand-logo-loaded');
const logoUrl=maker==='YAMAHA'
 ?'https://commons.wikimedia.org/wiki/Special:Redirect/file/Yamaha_Motor_2025.svg'
 :window.MotorcycleCatalog?.brandLogos?.[maker];
if(logoUrl){
 const logo=document.createElement('img');
 logo.className=maker==='YAMAHA'?'yamaha-official-brand-logo':'manufacturer-brand-logo';
 logo.alt=maker+' 제조사 로고';
 logo.decoding='async';logo.loading='lazy';
 logo.addEventListener('load',()=>{
  if(logo.isConnected&&logo.naturalWidth>0)brand.classList.add('brand-logo-loaded');
 },{once:true});
 logo.addEventListener('error',()=>{logo.remove();brand.classList.remove('brand-logo-loaded')},{once:true});
 logo.src=logoUrl;
 brand.appendChild(logo);
}
brand.classList.toggle('brand-yamaha',maker==='YAMAHA');
brand.classList.toggle('brand-with-logo',!!logoUrl);
brand.setAttribute('aria-label',maker||'제조사 미정');
counter.textContent=isLocked()?'':bikes.map((_,i)=>i===index?'●':'○').join(' ');document.body.classList.toggle('vehicle-locked',isLocked());stage.setAttribute('aria-label',isLocked()?'등록된 내 오토바이 이미지':'오토바이 이미지: 좌우 스와이프로 차량 선택');document.body.dataset.activeBike=b.id;renderParts();document.dispatchEvent(new CustomEvent('motorcycle:change',{detail:{bikeId:b.id}}))}
function renderParts(){const reg=currentRegistration(),odo=getOdometer(),data=getVehicleData(currentBike().id);
document.querySelectorAll('.part:not(.part-add-card)').forEach((row,i)=>{const id=row.dataset.partId||items[i]?.id;const item=items.find(x=>x.id===id)||{id,interval:Number(row.dataset.interval)||0};if(!id)return;const records=data.records&&Array.isArray(data.records[item.id])?data.records[item.id]:[];
const action=partAction(reg,id);
const usable=records.filter(record=>record&&valid(record.at)&&valid(record.interval)&&record.at<=odo&&(record.action||'replace')===action);
const last=usable.length?[...usable].sort((a,b)=>a.at-b.at||String(a.date||'').localeCompare(String(b.date||'')))[usable.length-1]:null;
const text=row.querySelector('.part-line span'),bar=row.querySelector('.gauge-fill'),btn=row.querySelector('.service');
const body=row.querySelector('.part-body');
let sourceTag=body?.querySelector('.part-interval-source');
if(body&&!sourceTag){sourceTag=document.createElement('small');sourceTag.className='part-interval-source';const gauge=body.querySelector('.gauge');if(gauge)body.insertBefore(sourceTag,gauge);else body.appendChild(sourceTag)}
if(sourceTag){sourceTag.textContent='';sourceTag.dataset.source='unknown';sourceTag.hidden=true}
bar.classList.remove('blue','amber','red');bar.classList.add('blue');btn.classList.remove('blue','amber','red');btn.classList.add('blue');delete row.dataset.maintenancePercent;
if(!reg){text.textContent='차량 등록 후 확인';if(sourceTag)sourceTag.textContent='차량 등록 후 확인';bar.style.width='0%';row.classList.add('part-unregistered');}
else{
 const profile=officialProfile(reg),task=officialTask(reg,id),settings=partSettings(currentBike().id,id);
 const fallback=reg.maintenanceProfileStatus?0:item.interval;
 const officialDefault=officialActionInterval(profile,id,action);
 const defaultInterval=action==='replace'?actionInterval(reg,id,action)||officialDefault||fallback:actionInterval(reg,id,action);
 const interval=resolveServiceCycle(settings,action,last,defaultInterval);
 const schedule=nextServiceDistance(reg,task,action,settings,interval,last);
 const knownBase=schedule.base,firstService=schedule.firstEligible;
 const initialDue=firstService?task.firstReplaceKm:interval;
 const due=schedule.due;
 const span=Math.max(1,due-knownBase);
 const calendar=dateBasedStatus(reg,id,records);
 // An existing motorcycle may have been serviced before registration.
 // Do not treat registration mileage as a confirmed service event.
 const historyUnknown=!last&&(reg.km!==0||odo>due);
 if(sourceTag){
  const cfgKey=action==='inspect'?'inspectInterval':action==='clean'?'cleanInterval':'interval';
  const srcKey=action==='inspect'?'inspectIntervalSource':action==='clean'?'cleanIntervalSource':'intervalSource';
  const calculated=resolveServiceCycleDetails(settings,action,last,defaultInterval,officialDefault);
  let origin=calculated.origin,label={user:'사용자 설정',official:'제조사 공식',record:'정비기록 기준',legacy:'기존 설정 · 출처 미확인',default:'앱 기본값'}[origin];
  if(interval<=0&&!last&&calendar){origin='official';label='제조사 공식 · 기간 기준'}
  sourceTag.dataset.source=origin;
  const hasKnownCycle=interval>0||!!calendar;
  sourceTag.hidden=!hasKnownCycle||origin==='unknown';
  sourceTag.textContent=sourceTag.hidden?'':label;
 }
 if(historyUnknown&&Number.isSafeInteger(interval)&&interval>0){
  text.textContent=actionText(action)+' 이력 확인 필요 · 적용 주기 '+fmt(interval)+'km';
  if(calendar&&!calendar.missing)text.textContent+=' · 날짜 기준 '+calendar.due;
  bar.style.width='0%';row.classList.add('part-unregistered');
 }else if(!valid(knownBase)||!Number.isSafeInteger(interval)||interval<=0){
  text.textContent=calendar?(calendar.missing?'마지막 교체일 입력 필요 · '+calendar.months+'개월 주기':calendar.days<0?'교체기한 '+Math.abs(calendar.days)+'일 초과 · '+calendar.due:calendar.days<=30?'교체까지 '+calendar.days+'일 · '+calendar.due:'다음 교체 '+calendar.due)
  :interval>0?actionText(action)+' 기록 없음 / 주기 '+fmt(interval)+'km'
  :timingDescription(task)||(reg.maintenanceProfileStatus?'공식 거리주기 미확인':'교체주기 미설정');
  if(calendar&&!calendar.missing){
   const fullDays=Math.max(1,calendar.months*30.4375);
   bar.style.width=Math.min(100,Math.max(0,Math.round((fullDays-calendar.days)/fullDays*100)))+'%';
   const color=calendar.days<0?'red':calendar.days<=30?'amber':'blue';
   bar.classList.add(color);bar.classList.remove(...['blue','amber','red'].filter(x=>x!==color));
   btn.classList.add(color);btn.classList.remove(...['blue','amber','red'].filter(x=>x!==color));
   row.classList.remove('part-unregistered');
  }else{bar.style.width='0%';row.classList.add('part-unregistered');}
 }else{
  const used=Math.max(0,odo-knownBase),percent=Math.floor(used/span*100),ratio=Math.min(100,percent);
  const overdue=odo>due;
  const distanceLabel=overdue?'교체 기준 '+fmt(due)+'km · '+fmt(odo-due)+'km 초과':fmt(used)+' / '+fmt(span)+'km · '+fmt(percent)+'%';
  const inspectLabel=action!=='inspect'&&actionInterval(reg,id,'inspect')>0?' · 점검 '+fmt(actionInterval(reg,id,'inspect'))+'km 주기':'';
  text.textContent=calendar&&!calendar.missing
   ?distanceLabel+' · '+(calendar.days<0?'날짜 '+Math.abs(calendar.days)+'일 초과':calendar.days<=30?'날짜 '+calendar.days+'일 남음':'날짜 '+calendar.due)
   :distanceLabel;
  text.textContent+=(overdue?' · 정비기록 확인 필요':' · 다음 '+fmt(due)+'km')+inspectLabel;
  if(firstService&&!last&&due===initialDue&&initialDue>0&&interval>0&&initialDue!==interval){
   text.textContent+=' · 최초 교체 (이후 정기 '+fmt(interval)+'km)';
  }
  bar.style.width=ratio+'%';row.classList.remove('part-unregistered');
  const color=calendar&&!calendar.missing&&calendar.days<0?'red':calendar&&!calendar.missing&&calendar.days<=30?'amber':percent<=50?'blue':percent<=80?'amber':'red';
  bar.classList.remove('blue','amber','red');bar.classList.add(color);
  btn.classList.remove('blue','amber','red');btn.classList.add(color);
  row.dataset.maintenancePercent=String(percent);
 }
}
if(reg){
 const task=officialTask(reg,id),note=[];
 if(actionInterval(reg,id,'inspect')>0&&partAction(reg,id)!=='inspect')note.push(actionCycleStatus(reg,id,records,'inspect',odo));
 if(actionInterval(reg,id,'clean')>0&&partAction(reg,id)!=='clean')note.push(actionCycleStatus(reg,id,records,'clean',odo));
 if(note.length)text.textContent+=' · '+note.filter(Boolean).join(' · ');
}
btn.setAttribute('role','button');btn.tabIndex=0;btn.setAttribute('aria-label',row.querySelector('strong').textContent+' 정비기록 등록');});
 updateMaintenanceNotices();
}
document.addEventListener('motorcycle:custom-parts-change',()=>renderParts());
function hideCheck(){clearTimeout(checkTimer);check.classList.remove('visible');check.setAttribute('aria-hidden','true')}
function openReg(){
 if(!currentRegistration()){
  document.dispatchEvent(new CustomEvent('motorcycle:open-new-vehicle'));
  return;
 }
 returnFocus=document.activeElement;const r=currentRegistration(),odo=getOdometer();regTitle.textContent=currentBike().name;document.getElementById('registration-title').textContent=r?'오토바이 정보 수정':'오토바이 등록';regForm.querySelector('.registration-save').textContent=r?'변경사항 저장':'이 오토바이 등록';

regKm.value=r?String(r.km):'0';currentKm.value=r?String(odo):String(Number(regKm.value)||0);regError.textContent='';syncReg();
regMask.hidden=false;document.body.classList.add('registration-open');regClose.focus()}
function closeReg(){regMask.hidden=true;document.body.classList.remove('registration-open');if(returnFocus?.focus)returnFocus.focus()}
function selectVisible(){if(!hasRegisteredBikes()||animating||!regMask.hidden||!recordMask.hidden)return;chosen=index;hideCheck();void check.offsetWidth;check.classList.add('visible');check.setAttribute('aria-hidden','false');clearTimeout(formTimer);formTimer=setTimeout(()=>{hideCheck();openReg()},640)}
function change(next){if(!hasRegisteredBikes()||isLocked()||next<0||next>=bikes.length||animating){position(0,true);return}animating=true;hideCheck();clearTimeout(formTimer);index=next;position(0,true);renderInfo();tint.classList.remove('flash');void tint.offsetWidth;tint.classList.add('flash');setTimeout(()=>animating=false,385)}
function syncReg(){regHint.textContent='앱에서 이 오토바이의 관리를 시작한 당시 주행거리'}
regForm.addEventListener('submit',e=>{e.preventDefault();const at=Number(regKm.value),now=Number(currentKm.value),previous=currentRegistration();
 if(!previous){regError.textContent='새 차량은 제조사와 기종을 입력해서 등록해.';return}
if(regKm.value.trim()===''||currentKm.value.trim()===''||!valid(at)||!valid(now)||now<at){regError.textContent='시작·현재 주행거리를 확인해. 현재 주행거리는 시작보다 작을 수 없어.';return}
const old=getVehicleData(currentBike().id),all=Object.values(old.records||{}).flat().filter(x=>valid(x.at)),maxAt=all.reduce((v,x)=>Math.max(v,x.at),0);
const previousKm=getOdometer(),correction=now<previousKm;
if(now<maxAt){regError.textContent='이미 기록된 정비 주행거리보다 현재 주행거리를 낮출 수 없어.';return}
if(previous&&at!==previous.km&&maxAt&&at>maxAt){regError.textContent='시작 주행거리는 기록된 정비 주행거리보다 클 수 없어.';return}
if(correction&&!confirm('현재 주행거리를 '+fmt(previousKm)+'km에서 '+fmt(now)+'km로 정정할까?\n정비기록은 유지되고 소모품 상태를 다시 계산해.'))return;
const history=Array.isArray(old.odometerHistory)?old.odometerHistory:[];
const nextHistory=now===previousKm?history:[...history,{at:now,date:new Date().toISOString(),...(correction?{type:'correction',previous:previousKm}:{})}];
const fresh=load(regKey),nextReg={...fresh,[currentBike().id]:{...fresh[currentBike().id],...previous,year:fresh[currentBike().id]?.year??previous?.year??null,wear:fresh[currentBike().id]?.wear??previous?.wear??'auto',km:at}},nextData={...database,[currentBike().id]:{...old,odometer:now,records:old.records||{},odometerHistory:nextHistory}};
try{write(regKey,nextReg);write(dataKey,nextData);localStorage.setItem(chosenKey,currentBike().id);registered=nextReg;database=nextData;renderInfo();closeReg();check.classList.add('visible');checkTimer=setTimeout(hideCheck,720)}catch{regError.textContent='저장할 수 없어. 브라우저 저장공간을 확인해.'}
});
regClose.addEventListener('click',closeReg);regMask.addEventListener('click',e=>{if(e.target===regMask)closeReg()});
const odoButton=$('odometer-button'),odoMask=$('odometer-mask'),odoForm=$('odometer-form'),odoInput=$('odometer-input'),odoError=$('odometer-error'),odoClose=$('odometer-close'),odoDisplay=$('odometer-display'),odoKeypad=$('odometer-keypad'),odoCorrection=$('odometer-correction');
let odoReplaceOnDigit=true;
function showOdometerValue(){odoDisplay.replaceChildren(document.createTextNode(odoInput.value?fmt(Number(odoInput.value))+' ':'— '));const unit=document.createElement('small');unit.textContent='km';odoDisplay.appendChild(unit)}
function closeOdometer(){odoMask.hidden=true;document.body.classList.remove('registration-open');odoError.textContent='';}
function openOdometer(){
 if(!odoMask.hidden||!recordMask.hidden||!regMask.hidden)return;
 if(!currentRegistration()){openReg();return}
 odoInput.value=String(getOdometer());odoReplaceOnDigit=true;odoCorrection.checked=false;odoError.textContent='';showOdometerValue();
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
 if(!raw||!valid(at)||at<r.km){odoError.textContent='주행거리는 시작 주행거리보다 작을 수 없어.';return}
 if(at<before&&!odoCorrection.checked){odoError.textContent='이전 주행거리보다 작은 값이야. 오입력 정정을 선택해.';return}
 const old=getVehicleData(currentBike().id),all=Object.values(old.records||{}).flat().filter(x=>valid(x.at)),latest=all.reduce((m,x)=>Math.max(m,x.at),0);
 if(at<latest){odoError.textContent='이미 저장된 정비 주행거리보다 작은 값으로 정정할 수 없어.';return}
 const correcting=at<before;
 if(correcting&&!confirm('현재 주행거리를 '+fmt(before)+'km에서 '+fmt(at)+'km로 정정할까?\n정비기록은 유지되고 소모품 상태를 다시 계산해.'))return;
 const updated={...database,[currentBike().id]:{...old,odometer:at,records:old.records||{},odometerHistory:[...(old.odometerHistory||[]),{at,date:new Date().toISOString(),...(correcting?{type:'correction',previous:before}:{})}]}};
 try{write(dataKey,updated);database=updated;renderInfo();closeOdometer()}
 catch{odoError.textContent='주행거리를 저장하지 못했어. 저장공간을 확인해.'}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!odoMask.hidden){e.stopImmediatePropagation();closeOdometer()}});

const actionField=document.createElement('label');actionField.className='registration-section';
actionField.innerHTML='<span class="registration-label">작업 종류</span><select id="service-action" style="width:100%;height:47px;background:#eaf2fb;color:#12263c;border:2px solid #a6c3de;border-radius:11px;font-size:17px;font-weight:800;padding:0 12px"><option value="replace">교체</option><option value="inspect">점검</option><option value="clean">청소</option></select>';
recordDate.closest('label').before(actionField);
const actionSelect=actionField.querySelector('select');
function syncAction(){
 const reg=currentRegistration(),id=editingItem?.id;if(!reg||!id)return;
 const action=actionSelect.value,task=officialTask(reg,id);
 const arr=getVehicleData(currentBike().id).records?.[id]||[];
 const last=[...arr].filter(r=>r&&(r.action||'replace')===action&&valid(r.interval)&&r.interval>0).sort((a,b)=>a.at-b.at).at(-1);
 const official=actionInterval(reg,id,action);
 const settings=partSettings(currentBike().id,id);
 const settingKey=action==='inspect'?'inspectInterval':action==='clean'?'cleanInterval':'interval';
 const settingSourceKey=action==='inspect'?'inspectIntervalSource':action==='clean'?'cleanIntervalSource':'intervalSource';
 const configured=Number.isSafeInteger(settings[settingKey])&&settings[settingKey]>=0;
 // Saved user edits outrank old record snapshots; an explicitly disabled cycle (0) stays disabled.
 const hasUserCycle=configured&&settings[settingSourceKey]==='user';
 const km=hasUserCycle?settings[settingKey]
  :(configured&&settings[settingSourceKey]==='official'?official
  :last?.interval||official||(action==='replace'?editingItem.interval||0:0));
 const timeOnly=action==='replace'&&!!task?.replaceMonths&&!km;
 const wrap=recordInterval.closest('label');wrap.hidden=timeOnly;
 wrap.querySelector('.registration-label').textContent=actionText(action)+' 주기 (km)';
 const unscheduled=km<=0&&!timeOnly;
 recordInterval.required=!timeOnly&&!unscheduled;
 recordInterval.min=unscheduled?'0':'1';
 recordInterval.value=km>0?String(km):unscheduled?'0':'';
 if(unscheduled)wrap.querySelector('.registration-label').textContent=actionText(action)+' 주기 (km · 미설정 시 0)';
 // A record's interval is a snapshot, not an edit to the part's configured maintenance cycle.
 recordInterval.readOnly=false;
 recordTitle.textContent=currentPartName(id)+' '+actionText(action)+' 기록';
 recordForm.querySelector('button[type="submit"]').textContent=actionText(action)+' 완료 저장';
}
actionSelect.addEventListener('change',syncAction);
function openRecord(row,options={}){
 if(!currentRegistration()){alert('먼저 차량을 등록해.');return}
 const id=row.dataset.partId;editingItem=items.find(x=>x.id===id)||{id,interval:Number(row.dataset.interval)||0};
 returnFocus=document.activeElement;
 const historical=options.historical===true;
 recordAt.value=historical?'':String(getOdometer()??0);
 recordAt.readOnly=!historical;
 recordAt.min=historical?'0':String(currentRegistration().km);
 recordAt.max=String(getOdometer());
 recordAt.placeholder=historical?'당시 주행거리 입력':'';
 recordDate.max=todayLocal();recordDate.value=historical?'':todayLocal();
 actionSelect.value=['replace','inspect','clean'].includes(options.action)?options.action:partAction(currentRegistration(),id);
 recordError.textContent=historical?'실제 정비한 날짜와 당시 주행거리를 입력해. 구입 전 정비기록도 입력할 수 있어. 모르면 기록을 저장하지 마.':'';
 syncAction();renderHistory();
 recordMask.hidden=false;document.body.classList.add('registration-open');recordClose.focus();
}
function closeRecord(){recordMask.hidden=true;recordAt.readOnly=true;recordAt.placeholder='';document.body.classList.remove('registration-open');if(returnFocus?.focus)returnFocus.focus()}
function renderHistory(){const d=getVehicleData(currentBike().id),arr=Array.isArray(d.records?.[editingItem.id])?d.records[editingItem.id]:[];recordHistory.replaceChildren();if(!arr.length){recordHistory.textContent='저장된 정비기록이 없습니다.';return}const ul=document.createElement('ul');[...arr].sort((a,b)=>Number(b.at)-Number(a.at)||String(b.date||'').localeCompare(String(a.date||''))).slice(0,8).forEach(x=>{const li=document.createElement('li');const kind=x.action||'replace';const timeOnly=kind==='replace'&&Number(x.interval)===0&&!!officialTask(currentRegistration(),editingItem.id)?.replaceMonths;li.textContent=x.date+' · '+actionText(kind)+' · '+fmt(x.at)+'km'+(Number(x.interval)>0?' · 주기 '+fmt(x.interval)+'km':timeOnly?' · 기간 기준':' · 주기 미설정');ul.appendChild(li)});recordHistory.appendChild(ul)}
document.querySelector('.rows').addEventListener('click',e=>{const btn=e.target.closest('.part:not(.part-add-card) .service');if(btn)openRecord(btn.closest('.part'))});document.querySelector('.rows').addEventListener('keydown',e=>{const btn=e.target.closest('.part:not(.part-add-card) .service');if(btn&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openRecord(btn.closest('.part'))}});
recordForm.addEventListener('submit',e=>{e.preventDefault();if(!editingItem)return;const at=Number(recordAt.value),interval=Number(recordInterval.value),date=recordDate.value,reg=currentRegistration(),odo=getOdometer(),action=actionSelect.value;
if(!reg){recordError.textContent='정비기록을 저장하려면 먼저 오토바이 등록이 필요해.';return}
if(recordAt.value.trim()===''||!valid(at)||at>odo||(recordAt.readOnly&&at<reg.km)||(!recordAt.readOnly&&recordDate.value.trim()==='')||!valid(interval)||(recordInterval.required?interval<1:interval<0)||interval>1000000||!validMaintenanceDate(date)||date>todayLocal()){recordError.textContent='정비 당시 주행거리·작업 주기·날짜를 확인해. 과거 정비기록은 현재 주행거리 이하로 입력해.';return}
const d=getVehicleData(currentBike().id),records={...(d.records||{})},old=Array.isArray(records[editingItem.id])?records[editingItem.id]:[];
if(old.some(item=>item&&item.at===at&&item.date===date&&(item.action||'replace')===action)){recordError.textContent='같은 날짜와 주행거리의 정비기록이 이미 있어. 기존 기록을 수정해.';return}
records[editingItem.id]=[...old,{at,interval,date,action}].sort((a,b)=>a.at-b.at||a.date.localeCompare(b.date));
const next={...database,[currentBike().id]:{...d,odometer:odo,records}};
try{write(dataKey,next);database=next;renderInfo();closeRecord()}catch{recordError.textContent='저장에 실패했어. 기기 저장공간을 확인해.'}});
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
historyCSS.textContent+='.maintenance-history-review{margin:10px 0 15px;padding:12px;border:1px solid #9c7d4b;border-radius:10px;background:#33291c;color:#ffe4b4;font-size:12px;line-height:1.5}.maintenance-history-review[hidden]{display:none!important}.maintenance-history-review strong{display:block;font-size:14px}.maintenance-history-review p{margin:6px 0}.maintenance-history-review ul{margin:6px 0 0;padding-left:18px}.maintenance-history-review li{margin:4px 0}';
historyCSS.textContent+='.maintenance-km-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid #41556d}.maintenance-km-row span{min-width:0;overflow-wrap:anywhere}.maintenance-km-actions{display:flex;gap:5px;flex-shrink:0}.maintenance-km-actions button{border:1px solid #759dbd;border-radius:7px;background:#254c70;color:#fff;font-size:11px;font-weight:800;padding:7px}.maintenance-km-actions button:last-child{background:#933443;border-color:#bd737a}';
document.head.appendChild(historyCSS);
function currentPartName(id){
 const row=[...document.querySelectorAll('.rows .part[data-part-id]')].find(el=>el.dataset.partId===id);
 return row?.querySelector('.part-line strong')?.textContent || id;
}
// Read-only chronology review: findings are prompts to check records, not proof of fraud or damage.
function maintenanceChronologyFindings(vehicle){
 const findings=[],history=Array.isArray(vehicle?.odometerHistory)?vehicle.odometerHistory:[];
 const validKm=n=>Number.isSafeInteger(n)&&n>=0&&n<=9999999;
 const snapshots=history.filter(h=>h&&validKm(h.at)&&typeof h.date==='string'&&Number.isFinite(Date.parse(h.date)))
  .map(h=>({day:h.date.slice(0,10),km:h.at,corrected:h.type==='correction'}))
  .filter(h=>/^\d{4}-\d{2}-\d{2}$/.test(h.day));
 if(snapshots.length&&validKm(vehicle.odometer)&&snapshots.at(-1).km!==vehicle.odometer)
  findings.push('최근 주행거리 이력과 현재 계기판 값이 달라. 입력 내역을 확인해.');
 for(let i=1;i<snapshots.length;i++){
  const prior=snapshots[i-1],now=snapshots[i];
  if(now.km<prior.km&&!now.corrected)
   findings.push('주행거리 이력 '+prior.km.toLocaleString('ko-KR')+'km → '+now.km.toLocaleString('ko-KR')+'km 감소: 정정 여부를 확인해.');
 }
 for(const [partId,entries] of Object.entries(vehicle?.records||{})){
  if(!Array.isArray(entries))continue;
  const byAction=new Map();
  for(const entry of entries){
   if(!entry||!validKm(entry.at)||typeof entry.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(entry.date))continue;
   const action=entry.action||'replace';
   if(!byAction.has(action))byAction.set(action,[]);
   byAction.get(action).push(entry);
   const before=snapshots.filter(h=>h.day<entry.date).sort((a,b)=>b.day.localeCompare(a.day))[0];
   const after=snapshots.filter(h=>h.day>entry.date).sort((a,b)=>a.day.localeCompare(b.day))[0];
   if(before&&before.km>entry.at&&!snapshots.some(h=>h.corrected&&h.day>=before.day&&h.day<=entry.date))
    findings.push(partId+' · '+entry.date+' 정비 거리가 이전 '+before.day+' 계기판 기록보다 낮아. 확인해.');
   if(after&&after.km<entry.at&&!snapshots.some(h=>h.corrected&&h.day>=entry.date&&h.day<=after.day))
    findings.push(partId+' · '+entry.date+' 정비 거리가 이후 '+after.day+' 계기판 기록보다 높아. 확인해.');
  }
  for(const [action,events] of byAction){
   const sorted=[...events].sort((a,b)=>a.date.localeCompare(b.date)||a.at-b.at);
   for(let i=1;i<sorted.length;i++){
    if(sorted[i].date!==sorted[i-1].date&&sorted[i].at<sorted[i-1].at){
     findings.push(partId+' · '+action+' 기록의 날짜와 주행거리 순서를 확인해.');
     break;
    }
   }
  }
 }
 return findings;
}
let expandedOlder=false;
function showHistory(){
 const select=historyMask.querySelector('.maintenance-vehicle-select');select.replaceChildren();
 if(!hasRegisteredBikes()){
  select.disabled=true;
  historyMask.querySelector('.maintenance-list-vehicle').textContent='등록된 차량 없음';
  const box=historyMask.querySelector('.maintenance-list-items');box.replaceChildren();
  const empty=document.createElement('p');empty.className='maintenance-empty';empty.textContent='차량을 등록하면 정비기록을 확인할 수 있어.';box.appendChild(empty);
  const kmBox=historyMask.querySelector('.maintenance-odometer-entries');kmBox.replaceChildren();
  const kmEmpty=document.createElement('div');kmEmpty.textContent='등록된 차량이 없어.';kmBox.appendChild(kmEmpty);
  historyMask.hidden=false;document.body.classList.add('registration-open');return;
 }
 select.disabled=false;
 for(const bike of bikes.filter(b=>registered[b.id])){const opt=document.createElement('option');opt.value=bike.id;opt.textContent=bike.name;select.appendChild(opt)}
 select.value=currentBike().id;
 const all=getVehicleData(currentBike().id).records||{};
 const events=Object.entries(all).flatMap(([id,arr])=>Array.isArray(arr)?arr.map((item,seq)=>({id,...item,seq})):[])
  .sort((a,b)=>String(b.date).localeCompare(String(a.date))||Number(b.at)-Number(a.at));
 const box=historyMask.querySelector('.maintenance-list-items');box.replaceChildren();
 historyMask.querySelector('.maintenance-list-vehicle').textContent=currentBike().name+' · 총 '+events.length+'건';
 let review=historyMask.querySelector('.maintenance-history-review');
 if(!review){
  review=document.createElement('div');
  review.className='maintenance-history-review';
  historyMask.querySelector('.maintenance-list-items').before(review);
 }
 const findings=maintenanceChronologyFindings(getVehicleData(currentBike().id));
 review.replaceChildren();review.hidden=!findings.length;
 if(findings.length){
  const heading=document.createElement('strong');heading.textContent='이력 확인 권장 '+findings.length+'건';
  const explain=document.createElement('p');explain.textContent='날짜·주행거리 기준으로 발견한 확인 항목이야. 오입력이나 계기판 정정일 수 있어. 기록은 변경하지 않았어.';
  const list=document.createElement('ul');
  for(const message of findings.slice(0,5)){const li=document.createElement('li');li.textContent=message;list.appendChild(li)}
  if(findings.length>5){const li=document.createElement('li');li.textContent='그 밖에 '+(findings.length-5)+'건은 백업 파일 검사에서도 확인할 수 있어.';list.appendChild(li)}
  review.append(heading,explain,list);
 }
 if(!events.length){const empty=document.createElement('p');empty.className='maintenance-empty';empty.textContent='저장된 정비기록이 없습니다.';box.appendChild(empty)}
 else {
  const older=document.createElement('div');older.className='maintenance-older maintenance-list-items';older.hidden=!expandedOlder;
  for(const [i,e] of events.entries()){
   const wrap=document.createElement('div');wrap.className='maintenance-swipe';
   const actions=document.createElement('div');actions.className='maintenance-swipe-actions';
   actions.innerHTML='<button type="button" class="maintenance-history-edit">수정</button><button type="button" class="maintenance-history-delete">삭제</button>';
   const card=document.createElement('article');card.className='maintenance-entry';
   const title=document.createElement('strong');title.textContent=currentPartName(e.id);
   const detail=document.createElement('small');detail.textContent=e.date+' · '+actionText(e.action||'replace')+' · 당시 '+fmt(e.at)+'km'+(Number(e.interval)>0?' · 주기 '+fmt(e.interval)+'km':' · 주기 미설정');
   const due=document.createElement('span');due.className='maintenance-record-next';
   const task=officialTask(currentRegistration(),e.id);
   const actualAction=e.action||'replace';
   const sameAction=Array.isArray(all[e.id])?all[e.id].filter(v=>v&&(v.action||'replace')===actualAction&&valid(v.at)).sort((a,b)=>a.at-b.at||String(a.date).localeCompare(String(b.date))):[];
   const latest=sameAction.at(-1),isLatest=latest===all[e.id]?.[e.seq];
   const settings=partSettings(currentBike().id,e.id);
   const field=actualAction==='inspect'?'inspectInterval':actualAction==='clean'?'cleanInterval':'interval';
   const cycle=resolveServiceCycle(settings,actualAction,latest,actionInterval(currentRegistration(),e.id,actualAction));
   const next=cycle>0?nextServiceDistance(currentRegistration(),task,actualAction,settings,cycle,latest).due:null;
   const currentOdometer=getOdometer();
   const nextDescription=next!==null&&currentOdometer>next
    ?actionText(actualAction)+' 기준 '+fmt(next)+'km 초과 · 이력 확인 필요'
    :next!==null?'다음 '+actionText(actualAction)+' 예정 '+fmt(next)+'km':'다음 정비 주기 미설정';
   due.textContent=!isLatest?'이후 정비기록 있음 · 과거 이력':
    actualAction==='replace'&&task?.replaceMonths?'날짜 기준 다음 교체 '+addCalendarMonths(e.date,task.replaceMonths):
    nextDescription;card.append(title,detail,due);wrap.append(actions,card);(i<5?box:older).appendChild(wrap);
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
 else kmLog.forEach((x,i)=>{
  if(!valid(Number(x.at)))return;
  const line=document.createElement('div');line.className='maintenance-km-row';
  const caption=document.createElement('span'),date=new Date(x.date);
  caption.textContent=(Number.isFinite(date.getTime())?date.toLocaleString('ko-KR'):'날짜 미상')+' · '+fmt(x.at)+'km';
  const actions=document.createElement('div');actions.className='maintenance-km-actions';
  for(const [label,callback] of [['수정',()=>editOdometerEntry(i)],['삭제',()=>deleteOdometerEntry(i)]]){
   const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',callback);actions.appendChild(button);
  }
  line.append(caption,actions);kmBox.prepend(line);
 });
 historyMask.hidden=false;document.body.classList.add('registration-open');
}

// Only the selected record is replaced/deleted; other records and maintenance metadata remain unchanged.
const maintenanceEditMask=document.createElement('div');
maintenanceEditMask.className='maintenance-edit-mask';maintenanceEditMask.hidden=true;
maintenanceEditMask.setAttribute('role','dialog');maintenanceEditMask.setAttribute('aria-modal','true');
maintenanceEditMask.innerHTML='<form class="maintenance-edit-sheet"><div class="maintenance-edit-head"><strong>정비기록 수정</strong><button type="button" class="maintenance-edit-close" aria-label="닫기">×</button></div><div class="maintenance-edit-part"></div><label>정비 날짜<input name="date" type="date" required></label><label>정비 당시 주행거리 (km)<input name="at" type="number" min="0" max="9999999" step="1" required></label><label>작업 주기 (km · 미설정 시 0)<input name="interval" type="number" min="0" max="1000000" step="1" required></label><p class="maintenance-edit-error" aria-live="polite"></p><button type="submit" class="maintenance-edit-save">변경사항 저장</button></form>';
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
 const timeOnly=Number(item.interval)===0&&(item.action||'replace')==='replace'&&!!officialTask(currentRegistration(),id)?.replaceMonths;
 const intervalLabel=maintenanceEditForm.elements.interval.closest('label');
 if(intervalLabel)intervalLabel.hidden=timeOnly;
 maintenanceEditForm.elements.interval.required=!timeOnly;
 maintenanceEditForm.elements.interval.min='0';
 if(intervalLabel)intervalLabel.firstChild.textContent=actionText(item.action||'replace')+' 주기 (km · 미설정 시 0)';
 maintenanceEditMask.querySelector('.maintenance-edit-part').textContent=currentPartName(id)+' · '+actionText(item.action||'replace');
 maintenanceEditForm.elements.date.max=todayLocal();
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
 if(!reg||!validMaintenanceDate(date)||date>todayLocal()||maintenanceEditForm.elements.at.value.trim()===''||!valid(at)||at>maximum||maintenanceEditForm.elements.interval.required&&maintenanceEditForm.elements.interval.value.trim()===''||!Number.isSafeInteger(interval)||interval<0||interval>1000000){
  err.textContent='날짜·정비 주행거리·작업 주기를 확인해. 과거 정비기록은 등록 이전 주행거리도 가능하지만 현재 주행거리를 넘길 수 없어.';return;
 }
 const source=getVehicleData(ref.bikeId),arr=source.records?.[ref.id]||[];
 if(!arr[ref.seq]||JSON.stringify(arr[ref.seq])!==JSON.stringify(ref.original)){err.textContent='기록이 변경되었어. 다시 열어 수정해.';return}
 const action=ref.original.action||'replace';
 if(arr.some((v,i)=>i!==ref.seq&&v&&v.date===date&&v.at===at&&(v.action||'replace')===action)){
  err.textContent='같은 날짜·주행거리·작업 종류의 정비기록이 이미 있어. 다른 값을 입력해.';return;
 }
 const newArr=arr.map((v,i)=>i===ref.seq?{...v,date,at,interval}:v).sort((a,b)=>a.at-b.at||String(a.date).localeCompare(String(b.date)));
 const next={...database,[ref.bikeId]:{...source,records:{...source.records,[ref.id]:newArr}}};
 try{write(dataKey,next);database=next;closeMaintenanceEdit();renderInfo();showHistory()}catch(e){err.textContent='변경사항을 저장하지 못했어.'}
});
function deleteMaintenanceRecord(id,seq){
 const bikeId=currentBike().id,source=getVehicleData(bikeId),arr=source.records?.[id]||[],item=arr[seq];if(!item)return;
 if(!confirm('“'+currentPartName(id)+'” 정비기록 ('+item.date+') 1건을 삭제할까?\n다른 기록은 유지돼.'))return;
 const nextArr=arr.filter((_,i)=>i!==seq);
 const records={...source.records,[id]:nextArr};
 const next={...database,[bikeId]:{...source,records}};
 try{write(dataKey,next);database=next;renderInfo();showHistory()}catch(e){alert('삭제하지 못했어. 저장공간을 확인해.')}
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!maintenanceEditMask.hidden)closeMaintenanceEdit()});

// Odometer history entries are independently editable; changes to the latest entry also
// update the vehicle's displayed odometer, while retaining all maintenance records.
function maxServiceOdometer(bikeId){
 const records=getVehicleData(bikeId).records||{};
 return Object.values(records).flat().reduce((max,item)=>valid(item?.at)?Math.max(max,item.at):max,0);
}
function editOdometerEntry(seq){
 const bikeId=currentBike().id,source=getVehicleData(bikeId),arr=Array.isArray(source.odometerHistory)?source.odometerHistory:[],entry=arr[seq],reg=registered[bikeId];
 if(!entry||!reg)return;
 const answer=prompt('주행거리 기록 수정 (km)',String(entry.at));
 if(answer===null)return;
 const value=Number(answer.trim());
 if(!answer.trim()||!valid(value)||value<reg.km){alert('시작 주행거리 이상인 올바른 숫자를 입력해.');return}
 const isLatest=seq===arr.length-1,minService=maxServiceOdometer(bikeId);
 if(!isLatest&&value>getOdometer()){
  alert('과거 주행거리 기록은 현재 계기판 주행거리보다 클 수 없어.');return;
 }
 if(isLatest&&value<minService){alert('현재 주행거리는 저장된 정비기록보다 낮을 수 없어.');return}
 // A lower latest reading is an odometer correction, not ordinary mileage progress.
 // Ask before changing the displayed reading and preserve correction provenance.
 const correction=isLatest&&value<Number(entry.at);
 if(correction&&!confirm('최신 주행거리 기록을 '+fmt(entry.at)+'km에서 '+fmt(value)+'km로 낮출까?\n계기판과 소모품 게이지를 다시 계산하고 정정 이력을 남겨.'))return;
 const oldDate=new Date(entry.date);
 const storedDate=Number.isFinite(oldDate.getTime())?[oldDate.getFullYear(),String(oldDate.getMonth()+1).padStart(2,'0'),String(oldDate.getDate()).padStart(2,'0')].join('-'):todayLocal();
 const dateAnswer=prompt('주행거리 이력 날짜 (YYYY-MM-DD)',storedDate);
 if(dateAnswer===null)return;
 const newDate=dateAnswer.trim();
 if(!validMaintenanceDate(newDate)||newDate>todayLocal()){alert('올바른 과거 또는 오늘 날짜를 입력해.');return}
 const nextArr=arr.map((item,i)=>{
  if(i!==seq)return item;
  const edited={...item,at:value,date:new Date(newDate+'T12:00:00').toISOString(),editedAt:new Date().toISOString()};
  if(correction){edited.type='correction';edited.previous=Number(entry.at)}
  else if(isLatest&&edited.type==='correction'&&Number.isSafeInteger(edited.previous)&&value>=edited.previous){
   // Re-editing above the original reading is no longer a downward correction.
   delete edited.type;delete edited.previous;
  }
  return edited;
 });
 const next={...database,[bikeId]:{...source,odometer:isLatest?value:source.odometer,odometerHistory:nextArr}};
 try{write(dataKey,next);database=next;renderInfo();showHistory()}
 catch{alert('주행거리 이력 수정에 실패했어.')}
}
function deleteOdometerEntry(seq){
 const bikeId=currentBike().id,source=getVehicleData(bikeId),arr=Array.isArray(source.odometerHistory)?source.odometerHistory:[],entry=arr[seq],reg=registered[bikeId];
 if(!entry||!reg)return;
 const isLatest=seq===arr.length-1,nextArr=arr.filter((_,i)=>i!==seq);
 const nextOdo=isLatest?(nextArr.length?nextArr[nextArr.length-1].at:reg.km):source.odometer;
 if(isLatest&&(!valid(nextOdo)||nextOdo<reg.km||nextOdo<maxServiceOdometer(bikeId))){
  alert('이 기록을 삭제하면 현재 주행거리가 저장된 정비기록보다 낮아져. 먼저 주행거리나 정비기록을 수정해.');return;
 }
 if(!confirm(fmt(entry.at)+'km 주행거리 이력 1건을 삭제할까?'+(isLatest?'\n현재 계기판도 남은 마지막 기록으로 변경돼.':'')))return;
 const next={...database,[bikeId]:{...source,odometer:isLatest?nextOdo:source.odometer,odometerHistory:nextArr}};
 try{write(dataKey,next);database=next;renderInfo();showHistory()}
 catch{alert('주행거리 이력 삭제에 실패했어.')}
}
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