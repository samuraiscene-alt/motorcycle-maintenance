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
css.textContent+='.fleet-identity{display:flex;align-items:center;flex-wrap:wrap;gap:5px;margin:4px 0 2px}.fleet-identity-badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:20px;background:#0c76bb;border:1px solid #75caff;color:white;font-size:11px;font-weight:900;white-space:nowrap}.fleet-identity-alias{font-size:11px;font-weight:800;color:#cce9fa}.fleet-item>span{min-width:0;flex:1}.fleet-item .fleet-actions{max-width:none!important}';
css.textContent+='.fleet-swipe-hint{font-size:10px!important;color:#a8d0ec!important}.fleet-swipe-shell.open .fleet-swipe-delete{background:#d83a4e}.fleet-item .fleet-actions{min-width:0;max-width:55%;gap:4px}.fleet-item .fleet-actions button{min-width:0}';
css.textContent+='.fleet-edit[hidden]{display:none!important}.fleet-edit{display:grid;gap:9px;margin:10px 0;padding:12px;border:1px solid #8bb0cd;border-radius:10px;background:#142e45}.fleet-edit label{font-size:12px;font-weight:800;color:#dceeff}.fleet-edit input{width:100%;height:43px;margin-top:5px;padding:8px;font-size:16px;border-radius:8px;border:1px solid #8eaec9;background:#f6faff;color:#132a3b}.fleet-edit-buttons{display:flex;gap:8px}.fleet-edit-buttons button{flex:1;min-height:42px;border-radius:8px;border:1px solid #8eaec9;background:#31577a;color:white;font-weight:800}.fleet-edit-feedback{font-size:12px;color:#ace0ff}.fleet-item .fleet-actions{flex-shrink:0}.fleet-item .fleet-actions button{padding:8px}';
css.textContent+='.fleet-brand-other[hidden],.fleet-model-other[hidden]{display:none!important}.fleet-catalog-hint{font-size:12px;color:#bcd6e9;line-height:1.5;margin:3px 0}.fleet-new-overlay[hidden]{display:none!important}.fleet-new-overlay{position:fixed;inset:0;z-index:220;display:flex;align-items:flex-end;justify-content:center;padding:12px 12px max(24px,env(safe-area-inset-bottom));background:#02070ddb}.fleet-new-panel{width:100%;max-width:520px;max-height:88dvh;overflow-y:auto;overscroll-behavior:contain;border:1px solid #91b5d1;border-radius:17px;background:linear-gradient(150deg,#344a61,#14293d 40%,#0b1b2c);padding:17px;box-shadow:0 15px 45px #000a}.fleet-new-head{display:flex;justify-content:space-between;align-items:center;color:#edf7ff}.fleet-new-head strong{font-size:18px}.fleet-new-close{width:36px;height:36px;border:1px solid #89a9c4;border-radius:9px;background:#1b344b;color:#fff;font-size:26px}.fleet-new-overlay .fleet-new-form{display:grid;margin-top:12px}.fleet-new-overlay .fleet-new-form[hidden]{display:none!important}';
css.textContent+='.fleet-research{margin:16px 0 8px;border:1px solid #48677d;border-radius:11px;background:#10273e;color:#d8ecfa;padding:10px}.fleet-research summary{cursor:pointer;font-weight:850;font-size:13px;line-height:1.65}.fleet-research p{font-size:11px;color:#b7d0e2;line-height:1.6}.fleet-research-group{margin:8px 0;border:1px solid #3e5c75;border-radius:7px;padding:7px}.fleet-research-group summary{font-size:12px}.fleet-research-row{padding:7px 2px;border-top:1px solid #2d465b;display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;font-size:11px}.fleet-research-row strong{color:#fff;min-width:100px}.fleet-research-row span{color:#bcd3e8;flex:1}.fleet-research-row a{color:#91d8ff;font-size:11px;text-decoration:underline}';
document.head.appendChild(css);
const section=document.createElement('section');
section.innerHTML='<strong>차량별 기록 관리</strong><p>기존 차량 기록은 보관하고 새 오토바이를 등록할 수 있어. 차량을 선택하면 해당 차량의 정비기록과 소모품 상태를 확인할 수 있어.</p><div class="fleet-list"></div><div class="fleet-appearance"><strong>현재 차량 연식 설정</strong><p>제조 연식을 입력하면 노후 단계를 자동으로 계산해. 검증된 부품 영역이 없는 차종에는 임의의 녹·파손을 추가하지 않아.</p><form class="fleet-appearance-form"><label>제조 연식<input name="year" type="number" inputmode="numeric" min="1950" max="2100" placeholder="예: 2020"></label><p class="fleet-auto-aging" aria-live="polite">제조 연식을 입력하면 사용감 단계가 자동 계산돼.</p><button class="backup-btn secondary" type="submit">차량 외관 설정 저장</button><p class="fleet-appearance-feedback" aria-live="polite"></p></form></div><button class="backup-btn secondary fleet-add" type="button" style="margin-top:12px">새 차량으로 시작</button><form class="fleet-new-form" hidden><label>제조사<select name="brand" required></select></label><label class="fleet-brand-other" hidden>제조사 직접 입력<input name="brandOther" maxlength="40" placeholder="제조사명"></label><label>기종<select name="model" required></select></label><label class="fleet-model-other" hidden>기종 직접 입력<input name="modelOther" maxlength="55" placeholder="기종명"></label><label>배기량 (cc)<input name="cc" type="number" min="1" max="3000" step="1" inputmode="numeric" required placeholder="예: 125"></label><label>제조 연식 (필수)<select name="year" required></select></label><label>앱 사용 시작 주행거리 (km)<input name="km" type="number" inputmode="numeric" min="0" max="9999999" step="1" required value="0"></label><label>최초 운행일 (선택)<input name="firstUseDate" type="date"></label><p class="fleet-catalog-hint">신차의 실제 최초 운행일을 알 때만 입력해. 앱 설치일이나 중고차 구입일로 추정하지 않아.</p><p>기존 차량은 삭제되지 않으며, 새 차량의 정비기록은 별도로 시작돼.</p><div class="fleet-actions"><button type="button" class="fleet-cancel">취소</button><button type="submit">새 차량 저장</button></div></form><p class="fleet-message" aria-live="polite"></p>';
const reset=document.createElement('section');
reset.innerHTML='<strong>전체 데이터 초기화</strong><p>등록 차량, 주행거리, 정비기록, 소모품 설정 및 사진을 모두 삭제하고 처음부터 시작해. 되돌릴 수 없으니 먼저 전체 백업을 저장해.</p><button type="button" class="backup-btn fleet-reset">전체 데이터 초기화</button>';
root.querySelector('.backup-panel-header')?.after(section);
root.querySelector('.backup-status')?.before(reset);
const list=section.querySelector('.fleet-list'),form=section.querySelector('.fleet-new-form'),message=section.querySelector('.fleet-message');
const newOverlay=document.createElement('div');newOverlay.className='fleet-new-overlay';newOverlay.hidden=true;newOverlay.setAttribute('role','dialog');newOverlay.setAttribute('aria-modal','true');newOverlay.setAttribute('aria-label','새 차량 등록');
const newPanel=document.createElement('div');newPanel.className='fleet-new-panel';
const newHead=document.createElement('div');newHead.className='fleet-new-head';newHead.innerHTML='<strong>새 차량 등록</strong><button type="button" class="fleet-new-close" aria-label="닫기">×</button>';
const newFeedback=document.createElement('p');newFeedback.className='fleet-message';newFeedback.setAttribute('aria-live','polite');
const catalogHint=document.createElement('p');catalogHint.className='fleet-catalog-hint';
catalogHint.textContent='차종·연식은 등록 정보 선택용이야. 공식 정비자료가 검증되지 않은 차종은 교체주기를 자동으로 채우지 않아.';
form.querySelector('.fleet-actions').before(catalogHint,newFeedback);
const catalog=window.MotorcycleCatalog;
// All listed models are accounted for, but only document-verified model/year
// profiles generate manufacturer maintenance intervals. Research ≠ verification.
if(Array.isArray(catalog?.researchInventory)){
 const all=catalog.researchInventory;
 const verified=all.filter(x=>x.status==='verified-year-profiles').length;
 const found=all.filter(x=>x.status==='manual-found-not-verified').length;
 const pending=all.length-verified-found;
 const report=document.createElement('details');report.className='fleet-research';
 const title=document.createElement('summary');
 title.textContent='공식 정비표 적용 현황 · '+verified+'/'+all.length+'기종 연식별 확인';
 report.appendChild(title);
 const info=document.createElement('p');
 const confirmedParts=all.filter(x=>x.verifiedPartYears.length).length;
 const variantPending=all.filter(x=>x.verifiedPartYears.some(year=>catalog.findPartEvidenceForYear?.(x.brand,x.model,year)?.variantMatchRequired)).length;
 info.textContent='전체 '+all.length+'기종 기술자료 연결 · 정비주기 일부 검증 '+verified+'기종 · 연식별 부품자료 '+confirmedParts+'기종 · 세부 트림 확인 필요 '+variantPending+'기종. 연식별 정비주기와 단종 연도는 별도로 검증 중이며, 자료만 있다고 교체주기를 자동 생성하지 않아.';
 report.appendChild(info);
 for(const brandGroup of catalog.brands){
  const group=document.createElement('details');group.className='fleet-research-group';
  const heading=document.createElement('summary');heading.textContent=brandGroup.label;
  group.appendChild(heading);
  for(const row of all.filter(x=>x.brand===brandGroup.id)){
   const line=document.createElement('div');line.className='fleet-research-row';
   const name=document.createElement('strong');name.textContent=row.model;line.appendChild(name);
   const status=document.createElement('span');
   status.textContent=row.verifiedYears.length?'검증된 연식 '+row.verifiedYears.join(', '):
    row.manual?'제조사 자료 발견 · 주기 미확인':'공식 주기 확인 필요';
   line.appendChild(status);
   if(row.generalServiceYears?.length){
    const general=catalog.findGeneralService(row.brand,row.model,row.generalServiceYears[0]);
    const notice=document.createElement('small');notice.style.display='block';
    const periodicKm=Number.isSafeInteger(general.everyKm)?general.everyKm.toLocaleString('ko-KR')+'km 또는 ':'';
    notice.textContent='제조사 정기 서비스 '+periodicKm+general.everyMonths+'개월 (부품별 교체주기와 별개)';
    line.appendChild(notice);
   }
   const parts=document.createElement('small');parts.style.display='block';parts.style.color='#bdd5e9';
   const variantYears=row.verifiedPartYears.filter(year=>catalog.findPartEvidenceForYear?.(row.brand,row.model,year)?.variantMatchRequired);
   parts.textContent=variantYears.length
    ?'부품 자료 연식 '+row.verifiedPartYears.join(', ')+' · 세부 트림 확인 후 적용'
    :row.verifiedPartYears.length?'부품 구성: 확인 연식 '+row.verifiedPartYears.join(', ')
    :row.partEvidence?'부품 구성: 기종 계열 자료 있음 · 연식 검증 필요':'부품 구성: 추가 조사 필요';
   line.appendChild(parts);
   const newestYear=row.verifiedYears.at(-1);
   const key=row.brand+'|'+row.model;
   const source=newestYear?catalog.findOfficialProfile(row.brand,row.model,newestYear)?.source
    :row.manual?.url||row.partEvidence?.source||catalog.modelReleaseSources?.[key]||catalog.verifiedPartApplicability?.[key+'|'+row.verifiedPartYears.at(-1)]?.source;
   if(typeof source==='string'&&/^https:\/\//.test(source)){
    const link=document.createElement('a');link.href=source;link.target='_blank';link.rel='noopener noreferrer';
    link.textContent='제조사 자료';line.appendChild(link);
   }
   group.appendChild(line);
  }
  report.appendChild(group);
 }
 section.appendChild(report);
}

const brandSelect=form.elements.brand,modelSelect=form.elements.model,yearSelect=form.elements.year;
function setChoices(select,rows,placeholder){
 select.replaceChildren();const first=new Option(placeholder,'');select.add(first);
 for(const [label,value] of rows)select.add(new Option(label,String(value)));
}
function refreshModels(){
 const brand=brandSelect.value,found=catalog?.brands.find(x=>x.id===brand);
 form.querySelector('.fleet-brand-other').hidden=brand!=='OTHER';
 const options=found?.models.map(([model])=>[model,model])||[];
 setChoices(modelSelect,[...options,['기종 직접 입력','OTHER']],'기종 선택');
 form.querySelector('.fleet-model-other').hidden=true;
 form.elements.modelOther.value='';form.elements.cc.value='';
 refreshYears();
}
function refreshModelChoice(){
 const other=modelSelect.value==='OTHER';
 form.querySelector('.fleet-model-other').hidden=!other;
 const found=catalog?.brands.find(x=>x.id===brandSelect.value);
 const model=found?.models.find(([name])=>name===modelSelect.value);
 form.elements.cc.value=model?String(model[1]):'';
 refreshYears();
}
setChoices(brandSelect,[...(catalog?.brands||[]).map(x=>[x.label,x.id]),['기타 제조사 (직접 입력)','OTHER']],'제조사 선택');
function syncModelDisplacement(){
 if(brandSelect.value!=='DUCATI'||modelSelect.value!=='MONSTER')return;
 const year=Number(yearSelect.value);
 if(year===2026)form.elements.cc.value='890';
 else if(year>=2021&&year<=2025)form.elements.cc.value='937';
}
yearSelect.addEventListener('change',syncModelDisplacement);
function refreshYears(){
 const previous=yearSelect.value;
 const currentYear=new Date().getFullYear();
 const key=brandSelect.value+'|'+modelSelect.value;
 const first=catalog?.knownFirstModelYears?.[key]||1950;
 const years=Array.from({length:Math.max(0,currentYear-first+1)},(_,i)=>currentYear-i);
 setChoices(yearSelect,years.map(y=>[y+'년',y]),'연식 선택');
 if(years.some(y=>String(y)===previous))yearSelect.value=previous;
 syncModelDisplacement();
}
refreshYears();
brandSelect.addEventListener('change',refreshModels);
modelSelect.addEventListener('change',refreshModelChoice);
refreshModels();
newPanel.append(newHead,form);newOverlay.appendChild(newPanel);document.body.appendChild(newOverlay);
let newFormReturnFocus=null;
function closeNewVehicleForm(){newOverlay.hidden=true;form.hidden=true;form.reset();refreshModels();message.textContent='';newFeedback.textContent='';if(newFormReturnFocus?.focus&&newFormReturnFocus.isConnected)newFormReturnFocus.focus({preventScroll:true});newFormReturnFocus=null}
newHead.querySelector('.fleet-new-close').addEventListener('click',closeNewVehicleForm);
newOverlay.addEventListener('click',e=>{if(e.target===newOverlay)closeNewVehicleForm()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!newOverlay.hidden){e.stopImmediatePropagation();closeNewVehicleForm()}});
let editingId=null;
const edit=document.createElement('form');edit.className='fleet-edit';edit.hidden=true;
edit.innerHTML='<strong>차량정보 수정</strong><label>제조사<input name="brand" required maxlength="40"></label><label>기종<input name="model" required maxlength="55"></label><label>배기량 (cc)<input name="cc" required type="number" min="1" max="3000" step="1" inputmode="numeric"></label><label>제조 연식<input name="year" required type="number" min="1950" max="2100" inputmode="numeric"></label><label>앱 사용 시작 주행거리 (km)<input name="km" required type="number" min="0" max="9999999" step="1" inputmode="numeric"></label><label>최초 운행일 (선택)<input name="firstUseDate" type="date"></label><label>차량 별명 (선택)<input name="alias" maxlength="24" placeholder="예: 출퇴근용"></label><p>현재 주행거리는 계기판에서 수정할 수 있어. 기존 정비기록은 유지돼.</p><p class="fleet-edit-feedback" aria-live="polite"></p><div class="fleet-edit-buttons"><button type="button" class="fleet-edit-cancel">취소</button><button type="submit">변경사항 저장</button></div>';
section.querySelector('.fleet-add').before(edit);
function closeEdit(){editingId=null;edit.hidden=true;edit.reset();edit.querySelector('.fleet-edit-feedback').textContent=''}
function openEdit(id){const r=parse(REG)[id];if(!r)return;closeSwipe();editingId=id;form.hidden=true;edit.hidden=false;
 const words=String(r.name||'').trim().split(/\\s+/);
 edit.elements.brand.value=r.brand&&String(r.brand).toLowerCase()!=='unknown'?r.brand:(words.length>1?words[0]:'');
 edit.elements.model.value=r.model||(words.length>1?words.slice(1).join(' '):r.name||'');
 edit.elements.cc.value=r.cc??'';edit.elements.year.value=r.year??'';edit.elements.km.value=r.km??0;edit.elements.firstUseDate.value=r.firstUseDate||'';edit.elements.alias.value=r.alias||'';
 edit.querySelector('.fleet-edit-feedback').textContent='';edit.scrollIntoView({block:'nearest'});
}
edit.querySelector('.fleet-edit-cancel').addEventListener('click',closeEdit);
edit.addEventListener('submit',e=>{
 e.preventDefault();const id=editingId,status=edit.querySelector('.fleet-edit-feedback');
 const brand=edit.elements.brand.value.trim(),model=edit.elements.model.value.trim(),rawCC=edit.elements.cc.value.trim(),rawYear=edit.elements.year.value.trim(),rawKM=edit.elements.km.value.trim(),cc=Number(rawCC),year=Number(rawYear),km=Number(rawKM);
 if(!id||!brand||brand.length>40||!model||model.length>55||brand.length+model.length+1>100||!rawCC||!Number.isSafeInteger(cc)||cc<1||cc>3000||!rawYear||!Number.isSafeInteger(year)||year<1950||year>new Date().getFullYear()||!rawKM||!Number.isSafeInteger(km)||km<0||km>9999999){status.textContent='제조사·기종·배기량·연식·주행거리를 확인해.';return}
 const yearWarning=catalog?.validateModelYear(brand,model,year);
 if(yearWarning){status.textContent=yearWarning.description;return}
 const r=parse(REG)[id];if(!r){status.textContent='차량을 찾지 못했어.';return}
 const data=parse(DATA)[id]||{},odometer=Number.isSafeInteger(data.odometer)?data.odometer:Number(r.km)||0;
 const maxService=Object.values(data.records||{}).flat().reduce((max,item)=>Number.isSafeInteger(item?.at)?Math.max(max,item.at):max,0);
 if(km>odometer){status.textContent='시작 주행거리는 현재 주행거리보다 클 수 없어.';return}
 if(maxService&&km>maxService){status.textContent='기록된 정비 주행거리보다 시작 주행거리를 높일 수 없어.';return}
 const firstUseDate=edit.elements.firstUseDate.value.trim();
 if(firstUseDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(firstUseDate)||!Number.isFinite(Date.parse(firstUseDate))||firstUseDate>new Date().toLocaleDateString('sv-SE'))){status.textContent='최초 운행일을 확인해.';return}
 const detail={id,name:(brand+' '+model).trim(),brand,model,cc,year,km,firstUseDate,alias:edit.elements.alias.value.trim().slice(0,24)};
 document.dispatchEvent(new CustomEvent('motorcycle:update-vehicle',{detail}));
 const saved=parse(REG)[id];if(!saved||saved.name!==detail.name||saved.brand!==brand||saved.model!==model||saved.cc!==cc||saved.year!==year||saved.km!==km){status.textContent='저장에 실패했어. 저장공간을 확인해.';return}
 closeEdit();message.textContent='차량정보 수정 완료 · 기존 기록 유지';refresh();
});
let openedSwipe=null;
function closeSwipe(){if(openedSwipe){openedSwipe.classList.remove('open');openedSwipe=null}}
function enableSwipe(shell){
 const front=shell.querySelector('.fleet-item'),del=shell.querySelector('.fleet-swipe-delete');
 let startX=0,startY=0,tracking=false,consumed=false,lastSwipeAt=0;
 shell.addEventListener('touchstart',e=>{
  if(e.touches.length!==1||e.target.closest('.fleet-swipe-delete'))return;
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
  lastSwipeAt=Date.now();
  if(dx<0){if(openedSwipe!==shell)closeSwipe();shell.classList.add('open');openedSwipe=shell}
  else if(openedSwipe===shell)closeSwipe();
 },{passive:true});
 shell.addEventListener('keydown',e=>{
  if(e.target===del)return;
  if(e.key==='ArrowLeft'){e.preventDefault();if(openedSwipe!==shell)closeSwipe();shell.classList.add('open');openedSwipe=shell}
  if(e.key==='ArrowRight'||e.key==='Escape'){closeSwipe()}
 });
 front.addEventListener('click',e=>{if(consumed||Date.now()-lastSwipeAt<600){e.preventDefault();e.stopPropagation();consumed=false}else if(openedSwipe===shell&&!e.target.closest('button'))closeSwipe()},true);
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
 const modelKey=r=>(String(r.brand||'').trim().toUpperCase()+'|'+String(r.model||'').trim().toUpperCase())||String(r.name||'').trim().toUpperCase();
 const modelCounts=new Map();
 for(const r of Object.values(regs)){if(!r||typeof r!=='object')continue;const key=modelKey(r);modelCounts.set(key,(modelCounts.get(key)||0)+1)}
 const appearanceForm=section.querySelector('.fleet-appearance-form'),activeReg=regs[selected];
 section.querySelector('.fleet-appearance').hidden=!activeReg;
 if(activeReg){appearanceForm.elements.year.value=activeReg.year||'';describeYear(appearanceForm)}
 closeSwipe();list.replaceChildren();
 for(const [id,r] of Object.entries(regs)){
  if(!r||typeof r!=='object')continue;
  const name=r.name||(id==='pcx125'?'HONDA PCX125':id==='sample-b'?'스쿠터 B':id),row=document.createElement('div');row.className='fleet-item';
  const title=document.createElement('span'),details=document.createElement('small'),action=document.createElement('button'),editButton=document.createElement('button');
  title.textContent=name;
   const identity=document.createElement('div');identity.className='fleet-identity';
   const number=document.createElement('span');number.className='fleet-identity-badge';number.textContent=(Number.isSafeInteger(r.fleetNumber)&&r.fleetNumber>0?r.fleetNumber:'?')+'호차';
   if((modelCounts.get(modelKey(r))||0)>1)identity.appendChild(number);
   if(r.alias){const alias=document.createElement('span');alias.className='fleet-identity-alias';alias.textContent=String(r.alias).slice(0,24);identity.appendChild(alias)}
   if(r.year){const year=document.createElement('span');year.className='fleet-identity-alias';year.textContent=String(r.year)+'년형';identity.appendChild(year)}
   const odo=db[id]?.odometer??r.km??0;
  details.textContent='현재 '+Number(odo).toLocaleString('ko-KR')+'km · 정비 '+Object.values(db[id]?.records||{}).reduce((sum,a)=>sum+(Array.isArray(a)?a.length:0),0)+'건';
  const hint=document.createElement('small');hint.textContent='← 왼쪽으로 밀어 삭제';hint.className='fleet-swipe-hint';
  title.append(identity,details,hint);action.type='button';action.textContent=id===selected?'선택됨':'차량 보기';
  action.disabled=id===selected;action.addEventListener('click',()=>{document.dispatchEvent(new CustomEvent('motorcycle:select-vehicle',{detail:{id}}));root.closest('.backup-overlay').hidden=true;refresh()});
  editButton.type='button';editButton.textContent='수정';editButton.setAttribute('aria-label',name+' 정보 수정');editButton.addEventListener('click',()=>openEdit(id));
  const actions=document.createElement('div');actions.className='fleet-actions';actions.append(editButton,action);
  row.append(title,actions);
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
  document.dispatchEvent(new CustomEvent('motorcycle:year-changed',{detail:{bikeId:id}}));
   document.dispatchEvent(new CustomEvent('motorcycle:appearance-changed',{detail:{bikeId:id}}));
 }catch{message.textContent='저장공간을 확인해.'}
});
function showNewVehicleForm(){
 closeEdit();newFormReturnFocus=document.activeElement;
 const settingsOverlay=root.closest('.backup-overlay');
 if(settingsOverlay)settingsOverlay.hidden=true;
 form.hidden=false;newOverlay.hidden=false;message.textContent='';newFeedback.textContent='';refresh();
 form.elements.brand.focus({preventScroll:true});
}
section.querySelector('.fleet-add').addEventListener('click',showNewVehicleForm);
document.addEventListener('motorcycle:open-new-vehicle',showNewVehicleForm);
form.querySelector('.fleet-cancel').addEventListener('click',closeNewVehicleForm);
form.addEventListener('submit',e=>{
 e.preventDefault();
 const brand=(form.elements.brand.value==='OTHER'?form.elements.brandOther.value:form.elements.brand.value).trim(),model=(form.elements.model.value==='OTHER'?form.elements.modelOther.value:form.elements.model.value).trim(),cc=Number(form.elements.cc.value),name=(brand+' '+model).trim(),km=Number(form.elements.km.value),yearValue=form.elements.year.value.trim(),year=yearValue?Number(yearValue):null;
 if(!brand||brand.length>40||!model||model.length>55||name.length>100||!Number.isSafeInteger(cc)||cc<1||cc>3000||!Number.isSafeInteger(km)||km<0||km>9999999||(!Number.isSafeInteger(year)||year<1950||year>new Date().getFullYear())){newFeedback.textContent='제조사·기종·배기량·제조 연식·시작 주행거리를 확인해.';return}
 const yearWarning=catalog?.validateModelYear(brand,model,year);
 if(yearWarning){newFeedback.textContent=yearWarning.description;return}
 const firstUseDate=form.elements.firstUseDate.value.trim();
 if(firstUseDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(firstUseDate)||!Number.isFinite(Date.parse(firstUseDate))||firstUseDate>new Date().toLocaleDateString('sv-SE'))){newFeedback.textContent='최초 운행일을 확인해.';return}
 const id='bike-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
 document.dispatchEvent(new CustomEvent('motorcycle:register-new-vehicle',{detail:{id,name,brand,model,cc,km,year,wear:'auto',firstUseDate}}));
 if(localStorage.getItem(SEL)!==id){newFeedback.textContent='새 차량을 저장하지 못했어. 저장공간을 확인해.';return}
 closeNewVehicleForm();message.textContent='새 차량으로 시작했어. 이전 차량의 기록은 그대로 보관했어.';refresh();
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