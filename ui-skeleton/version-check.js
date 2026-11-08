(()=>{'use strict';
const CURRENT='2.9.162';
const UPDATE_PENDING_KEY='motorcycle-update-pending-v132';
const SCRIPT=document.currentScript;
const ROOT=new URL('../',SCRIPT?.src||location.href);
let remote=CURRENT,checking=false,autoApplying=false;
const standalone=window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
const compare=(a,b)=>{const aa=String(a).split('.').map(Number),bb=String(b).split('.').map(Number);for(let i=0;i<Math.max(aa.length,bb.length);i++){if((aa[i]||0)!==(bb[i]||0))return (aa[i]||0)-(bb[i]||0)}return 0};
function hasPendingInput(){const el=document.activeElement;return !!(el&&(/INPUT|TEXTAREA|SELECT/.test(el.tagName))&&!el.disabled)||!!document.querySelector('.registration-mask:not([hidden]),.backup-overlay:not([hidden])')}
// Do not purge caches from the page. A previous cache can be the only copy of the garage asset while offline.
async function prepareServiceWorker(){if(!('serviceWorker' in navigator))return;const reg=await navigator.serviceWorker.getRegistration(ROOT.pathname);if(reg)await reg.update();}
async function applyVersion(){
 if(autoApplying)return;
 autoApplying=true;
 showResult('busy','업데이트 진행 중','새 버전을 확인하고 파일을 준비하고 있어.');
 try{
  const u=new URL('version.json',ROOT);u.searchParams.set('check',String(Date.now()));
  const r=await fetch(u.href,{cache:'no-store'});
  if(!r.ok)throw Error('업데이트 서버 연결 실패');
  const next=(await r.json()).version;
  if(compare(next,CURRENT)<=0){autoApplying=false;banner.hidden=true;showResult('success','최신 버전 확인','이미 v'+CURRENT+'이 적용되어 있어.');return;}
  const shell=new URL('ui-skeleton/index.html',ROOT);shell.searchParams.set('verify',String(Date.now()));
  const response=await fetch(shell.href,{cache:'no-store'});
  if(!response.ok)throw Error('새 화면 파일 확인 실패');
  if('serviceWorker' in navigator){
   const reg=await navigator.serviceWorker.getRegistration(ROOT.pathname);
   if(reg)await Promise.race([reg.update(),new Promise((_,reject)=>setTimeout(()=>reject(Error('캐시 갱신 시간 초과')),12000))]);
  }
  sessionStorage.setItem(UPDATE_PENDING_KEY,next);
  showResult('busy','업데이트 적용 중','새 화면으로 다시 열고 있어.');
  const url=new URL('ui-skeleton/index.html',ROOT);
  url.searchParams.set('app-version',next);url.searchParams.set('refresh',String(Date.now()));
  location.replace(url.href);
 }catch(e){
  autoApplying=false;
  try{sessionStorage.removeItem(UPDATE_PENDING_KEY)}catch{}
  showResult('error','업데이트 실패','앱 버전은 변경되지 않았어. 연결 상태를 확인하고 다시 시도해. '+String(e?.message||e));
 }
}

const css=document.createElement('style');
css.textContent='.app-version-panel{margin:13px 0;padding:12px 13px;border:1px solid #66829b;border-radius:11px;background:#10283e;color:#e5f4ff}.app-version-panel strong{font-size:13px}.app-version-panel small{display:block;margin-top:6px;font-size:11px;color:#b7d0e4;line-height:1.6}.app-version-panel button,.app-update-banner button{margin-top:9px;width:100%;min-height:41px;border-radius:9px;border:1px solid #91bfe2;background:linear-gradient(#416d96,#163f68);color:#fff;font-weight:850}.app-update-banner[hidden]{display:none!important}.app-update-banner{position:fixed;z-index:250;bottom:max(13px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:calc(100% - 26px);max-width:500px;border:1px solid #97cff5;border-radius:15px;background:#112e48;box-shadow:0 8px 26px #000b;padding:13px;color:#fff}.app-update-banner strong{font-size:14px}.app-update-banner p{margin:6px 0;font-size:12px;color:#d1e9fa}.app-update-banner .app-update-dismiss{border-color:#72889a;background:#24384b;margin-top:6px}';
css.textContent+=' .update-mask[hidden]{display:none!important}.update-mask{position:fixed;inset:0;z-index:9999;background:#020912dc;display:grid;place-items:center;padding:20px;backdrop-filter:blur(5px)}.update-dialog{max-width:360px;width:100%;text-align:center;padding:25px 20px 20px;color:white;background:linear-gradient(150deg,#1a3956,#071624);border:1px solid #91ceff;border-radius:18px;box-shadow:0 12px 50px #000c}.update-symbol{display:grid;place-items:center;width:82px;height:82px;border-radius:50%;margin:0 auto 15px;font-size:53px;font-weight:900;border:3px solid #e1f6ff;background:linear-gradient(#5ac7ff,#0865bb);box-shadow:0 0 0 8px #2eaeff33,0 0 24px #168dff99}.update-symbol.busy{animation:update-pulse .8s ease-in-out infinite alternate}.update-symbol.error{background:linear-gradient(#ef8a72,#9b2538)}@keyframes update-pulse{to{transform:scale(.9);opacity:.7}}.update-dialog h2{font-size:22px;margin:0}.update-dialog p{font-size:13px;line-height:1.7;color:#d4e6f4}.update-dialog button{height:43px;width:100%;border-radius:10px;background:#1769ba;color:#fff;border:1px solid #8dccff;font-weight:900}.update-dialog button[hidden]{display:none!important}';
document.head.appendChild(css);
const holder=document.createElement('div');holder.className='app-version-panel';
holder.innerHTML='<strong>앱 버전 v'+CURRENT+'</strong><small class="app-version-description">이 화면의 앱 코드 버전을 표시해. Safari와 ChatGPT 내부 브라우저의 데이터는 별도로 저장될 수 있어.</small><button type="button" class="app-version-check">업데이트 확인</button>';
const settings=document.querySelector('.backup-panel');
if(settings){const header=settings.querySelector('.backup-panel-header');header?.after(holder)}
const banner=document.createElement('aside');banner.className='app-update-banner';banner.hidden=true;
banner.innerHTML='<strong class="app-update-title">새 버전이 있어</strong><p>정비기록은 삭제하지 않고 앱 파일만 새로 불러와.</p><button class="app-update-apply" type="button">새 버전 적용</button><button class="app-update-dismiss" type="button">나중에</button>';
document.body.appendChild(banner);
const mask=document.createElement('div');mask.className='update-mask';mask.hidden=true;
mask.innerHTML='<section class="update-dialog" role="dialog" aria-modal="true"><div class="update-symbol">✓</div><h2></h2><p></p><button type="button">확인</button></section>';
document.body.appendChild(mask);
function showResult(mode,title,msg){
 mask.hidden=false;const symbol=mask.querySelector('.update-symbol');
 symbol.className='update-symbol'+(mode==='busy'?' busy':mode==='error'?' error':'');
 symbol.textContent=mode==='busy'?'↻':mode==='error'?'!':'✓';
 mask.querySelector('h2').textContent=title;mask.querySelector('p').textContent=msg;
 mask.querySelector('button').hidden=mode==='busy';
}
mask.querySelector('button').addEventListener('click',()=>mask.hidden=true);
try{
 const pending=sessionStorage.getItem(UPDATE_PENDING_KEY);
 if(pending){sessionStorage.removeItem(UPDATE_PENDING_KEY);
  if(compare(CURRENT,pending)>=0){banner.hidden=true;showResult('success','업데이트 완료!','v'+CURRENT+'이 정상 적용됐어. 차량 정보와 정비기록은 유지돼.');}
  else showResult('error','업데이트 확인 필요','현재 실행 중인 버전은 v'+CURRENT+'이야. 요청 버전 v'+pending+'이 아직 적용되지 않았어.');
 }
}catch(e){}
const description=holder.querySelector('.app-version-description');
function countRecords(){
 try{const all=JSON.parse(localStorage.getItem('motorcycle-skeleton-maintenance-v1')||'{}');return Object.values(all).reduce((n,b)=>n+Object.values(b.records||{}).reduce((m,entries)=>m+(Array.isArray(entries)?entries.length:0),0),0)}catch{return 0}
}
function writeInfo(extra=''){description.textContent='이 브라우저에 저장된 정비기록 '+countRecords()+'건 · 다른 브라우저와 데이터는 자동 동기화되지 않아.'+(extra?' '+extra:'')}
writeInfo(standalone?'홈 화면 웹앱 기준 사용 중.':'Safari·ChatGPT는 별도 저장공간일 수 있어.');
async function check(automatic=false){
 if(checking)return;checking=true;const button=holder.querySelector('.app-version-check');button.disabled=true;
 try{
  // Fetch version first. A stalled service worker update must not block the check.
  const url=new URL('version.json',ROOT);
  url.searchParams.set('check',Date.now().toString());
  const response=await fetch(url.href,{cache:'no-store',credentials:'same-origin'});
  if(!response.ok)throw Error('업데이트 정보를 가져오지 못했어.');
  const latest=await response.json();
  if(typeof latest.version!=='string')throw Error('버전 정보가 올바르지 않아.');
  remote=latest.version;
  const newer=compare(remote,CURRENT)>0;
  writeInfo(newer?'새 버전 v'+remote+'을 사용할 수 있어.':'앱 코드가 최신 버전이야.');
  if('serviceWorker' in navigator){
   navigator.serviceWorker.getRegistration(ROOT.pathname).then(reg=>reg?.update()).catch(()=>{});
  }
  if(newer){
   banner.querySelector('.app-update-title').textContent='새 버전 v'+remote+'이 있어';banner.hidden=false;
   // Updates require a user click; never reload silently.
  }
  else if(!automatic)showResult('success','최신 버전 확인','v'+CURRENT+'을 사용 중이야. 추가 업데이트가 필요하지 않아.')
 }catch(e){writeInfo('업데이트 확인에 실패했어. 인터넷 연결을 확인해.');if(!automatic)showResult('error','확인 실패','인터넷 연결을 확인하고 다시 시도해.')}
 finally{checking=false;button.disabled=false}
}
holder.querySelector('.app-version-check').addEventListener('click',()=>check(false));
banner.querySelector('.app-update-dismiss').addEventListener('click',()=>banner.hidden=true);
banner.querySelector('.app-update-apply').addEventListener('click',()=>{void applyVersion()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check(true)});
window.addEventListener('online',()=>check(true));
window.addEventListener('pageshow',e=>{writeInfo();if(e.persisted)check(true)});
window.addEventListener('load',()=>check(true),{once:true});
})();