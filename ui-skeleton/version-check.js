(()=>{'use strict';
const CURRENT='2.9.129';
const SCRIPT=document.currentScript;
const ROOT=new URL('../',SCRIPT?.src||location.href);
let remote=CURRENT,checking=false,autoApplying=false;
const standalone=window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
const compare=(a,b)=>{const aa=String(a).split('.').map(Number),bb=String(b).split('.').map(Number);for(let i=0;i<Math.max(aa.length,bb.length);i++){if((aa[i]||0)!==(bb[i]||0))return (aa[i]||0)-(bb[i]||0)}return 0};
function hasPendingInput(){const el=document.activeElement;return !!(el&&(/INPUT|TEXTAREA|SELECT/.test(el.tagName))&&!el.disabled)||!!document.querySelector('.registration-mask:not([hidden]),.backup-overlay:not([hidden])')}
// Do not purge caches from the page. A previous cache can be the only copy of the garage asset while offline.
async function prepareServiceWorker(){if(!('serviceWorker' in navigator))return;const reg=await navigator.serviceWorker.getRegistration(ROOT.pathname);if(reg)await reg.update();}
async function applyVersion(target,automatic=false){
 if(autoApplying||automatic&&hasPendingInput())return;
 autoApplying=true;
 try{
  // Keep the previous version until the new worker has finished trying to refresh its shell.
  await Promise.race([prepareServiceWorker(),new Promise(resolve=>setTimeout(resolve,2500))]).catch(()=>{});
  const url=new URL('./ui-skeleton/index.html',ROOT);url.searchParams.set('app-version',target);url.searchParams.set('refresh',String(Date.now()));
  location.replace(url.href);
 }catch(error){autoApplying=false;writeInfo('업데이트 적용 실패: '+String(error?.message||error));}
}

const css=document.createElement('style');
css.textContent='.app-version-panel{margin:13px 0;padding:12px 13px;border:1px solid #66829b;border-radius:11px;background:#10283e;color:#e5f4ff}.app-version-panel strong{font-size:13px}.app-version-panel small{display:block;margin-top:6px;font-size:11px;color:#b7d0e4;line-height:1.6}.app-version-panel button,.app-update-banner button{margin-top:9px;width:100%;min-height:41px;border-radius:9px;border:1px solid #91bfe2;background:linear-gradient(#416d96,#163f68);color:#fff;font-weight:850}.app-update-banner[hidden]{display:none!important}.app-update-banner{position:fixed;z-index:250;bottom:max(13px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:calc(100% - 26px);max-width:500px;border:1px solid #97cff5;border-radius:15px;background:#112e48;box-shadow:0 8px 26px #000b;padding:13px;color:#fff}.app-update-banner strong{font-size:14px}.app-update-banner p{margin:6px 0;font-size:12px;color:#d1e9fa}.app-update-banner .app-update-dismiss{border-color:#72889a;background:#24384b;margin-top:6px}';
document.head.appendChild(css);
const holder=document.createElement('div');holder.className='app-version-panel';
holder.innerHTML='<strong>앱 버전 v'+CURRENT+'</strong><small class="app-version-description">이 화면의 앱 코드 버전을 표시해. Safari와 ChatGPT 내부 브라우저의 데이터는 별도로 저장될 수 있어.</small><button type="button" class="app-version-check">업데이트 확인</button>';
const settings=document.querySelector('.backup-panel');
if(settings){const header=settings.querySelector('.backup-panel-header');header?.after(holder)}
const banner=document.createElement('aside');banner.className='app-update-banner';banner.hidden=true;
banner.innerHTML='<strong class="app-update-title">새 버전이 있어</strong><p>정비기록은 삭제하지 않고 앱 파일만 새로 불러와.</p><button class="app-update-apply" type="button">새 버전 적용</button><button class="app-update-dismiss" type="button">나중에</button>';
document.body.appendChild(banner);
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
   // Home-screen PWA is the primary environment; update automatically only when no editor is in use.
   const refreshKey='motorcycle-auto-refresh-'+remote;
   if(standalone&&!hasPendingInput()&&sessionStorage.getItem(refreshKey)!=='done'){
    sessionStorage.setItem(refreshKey,'done');
    await applyVersion(remote,true);
   }
  }
  else if(!automatic){button.textContent='최신 버전 확인됨';setTimeout(()=>button.textContent='업데이트 확인',1800)}
 }catch(e){writeInfo('업데이트 확인에 실패했어. 인터넷 연결을 확인해.')}
 finally{checking=false;button.disabled=false}
}
holder.querySelector('.app-version-check').addEventListener('click',()=>check(false));
banner.querySelector('.app-update-dismiss').addEventListener('click',()=>banner.hidden=true);
banner.querySelector('.app-update-apply').addEventListener('click',()=>{void applyVersion(remote,false)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check(true)});
window.addEventListener('online',()=>check(true));
window.addEventListener('pageshow',e=>{writeInfo();if(e.persisted)check(true)});
window.addEventListener('load',()=>check(true),{once:true});
})();