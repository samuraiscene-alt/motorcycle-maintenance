(()=>{'use strict';
/* Locale foundation. Only tagged interface strings are localized in this stage.
   Vehicle names, user notes, records and untagged legacy UI stay untouched. */
const KEY='motorcycle-ui-language-v1';
const supported=['ko','en-US','en-GB','it','zh-CN','ja'];
const dict={
 ko:{consumables:'소모품',records:'정비기록',vehicle:'차량정보',settings:'설정',language:'언어',languageHelp:'앱 표시 언어를 선택해. 현재 기본 메뉴부터 적용되며, 나머지 화면은 단계적으로 번역할 예정이야.',preview:'다국어 번역 1차 적용 · 일부 화면은 한국어로 표시돼.'},
 'en-US':{consumables:'Parts',records:'Service Log',vehicle:'My Bike',settings:'Settings',language:'Language',languageHelp:'Choose the app language. Main navigation is translated first; other screens will follow.',preview:'Language preview · some screens remain in Korean.'},
 'en-GB':{consumables:'Parts',records:'Service History',vehicle:'My Bike',settings:'Settings',language:'Language',languageHelp:'Choose the app language. Main navigation is translated first; other screens will follow.',preview:'Language preview · some screens remain in Korean.'},
 it:{consumables:'Ricambi',records:'Manutenzione',vehicle:'La mia moto',settings:'Impostazioni',language:'Lingua',languageHelp:'Scegli la lingua. Per ora sono tradotti i menu principali; le altre schermate seguiranno.',preview:'Anteprima lingua · alcune schermate restano in coreano.'},
 'zh-CN':{consumables:'耗材',records:'保养记录',vehicle:'车辆信息',settings:'设置',language:'语言',languageHelp:'选择应用语言。目前先翻译主菜单，其他页面将逐步支持。',preview:'语言预览 · 部分页面仍使用韩语。'},
 ja:{consumables:'消耗品',records:'整備記録',vehicle:'車両情報',settings:'設定',language:'言語',languageHelp:'表示言語を選択できます。現在はメインメニューのみ翻訳され、他の画面は順次対応予定です。',preview:'言語プレビュー · 一部の画面は韓国語のままです。'}
};
const labels={'ko':'한국어','en-US':'English (US)','en-GB':'English (UK)','it':'Italiano','zh-CN':'简体中文','ja':'日本語'};
function normalize(code){
 const value=String(code||'').toLowerCase().replace('_','-');
 if(value==='ko'||value.startsWith('ko-'))return 'ko';
 if(value==='en-gb')return 'en-GB';
 if(value==='en'||value.startsWith('en-'))return 'en-US';
 if(value==='it'||value.startsWith('it-'))return 'it';
 if(value==='zh'||value.startsWith('zh-'))return 'zh-CN';
 if(value==='ja'||value.startsWith('ja-'))return 'ja';
 return 'ko';
}
function initial(){
 try{const saved=localStorage.getItem(KEY);if(saved&&supported.includes(saved))return saved}catch{}
 return normalize(navigator.languages?.[0]||navigator.language||'ko');
}
let active=initial();
function translate(key,locale=active){return dict[locale]?.[key]||dict.ko[key]||key}
function apply(){
 document.documentElement.lang=active;
 const nav=[...document.querySelectorAll('.tabs .tab span')];
 ['consumables','records','vehicle','settings'].forEach((key,i)=>{if(nav[i])nav[i].textContent=translate(key)});
 if(panel){
  panel.querySelector('.language-title').textContent=translate('language');
  panel.querySelector('.language-help').textContent=translate('languageHelp');
  panel.querySelector('.language-preview').textContent=translate('preview');
  panel.querySelector('select').value=active;
 }
 document.dispatchEvent(new CustomEvent('motorcycle:locale-change',{detail:{locale:active}}));
}
function setLanguage(next){
 if(!supported.includes(next))return false;
 try{localStorage.setItem(KEY,next)}catch{return false}
 active=next;apply();return true;
}
const panel=document.createElement('section');panel.className='language-settings';
panel.innerHTML='<strong class="language-title"></strong><p class="language-help"></p><label class="language-label" for="motorcycle-language">🌐 <span class="language-title-alt">Language / 언어</span></label><select id="motorcycle-language" aria-label="Language / 언어"></select><p class="language-preview" aria-live="polite"></p>';
const css=document.createElement('style');
css.textContent='.language-settings{margin:12px 0;padding:12px 13px;background:#10283e;border:1px solid #66829b;border-radius:11px;color:#e5f4ff}.language-settings strong{font-size:14px}.language-settings p{font-size:12px;line-height:1.6;color:#c2d9eb;margin:7px 0}.language-settings .language-label{display:block;font-size:12px;font-weight:800;margin:10px 0 6px}.language-settings select{width:100%;height:45px;font-size:16px;border:1px solid #a9c7e0;border-radius:9px;background:#f4f9ff;color:#172c40;padding:6px 10px}.language-settings .language-preview{font-size:11px;color:#a5c6db}';
document.head.appendChild(css);
const select=panel.querySelector('select');
supported.forEach(code=>{const option=document.createElement('option');option.value=code;option.textContent=labels[code];select.appendChild(option)});
select.addEventListener('change',()=>{if(!setLanguage(select.value))select.value=active});
const settings=document.querySelector('.backup-panel');
if(settings){const header=settings.querySelector('.backup-panel-header');if(header)header.after(panel);else settings.prepend(panel)}
window.MotorcycleI18n=Object.freeze({getLanguage:()=>active,setLanguage,translate,supported:Object.freeze([...supported])});
apply();
})();