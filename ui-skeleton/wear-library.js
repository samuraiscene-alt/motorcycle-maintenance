(()=>{'use strict';
/* Common 2D motorcycle wear engine. Damage is only drawn within verified, model-specific part masks.
   An absent/unchecked mask never creates a rust spot, scratch, hole, dent, or repaired panel. */
const MATERIALS=Object.freeze({
 plastic:Object.freeze({effects:['fade','scratch','crack','break','patch']}),
 metal:Object.freeze({effects:['dull','rust','dent','scratch']}),
 paintedMetal:Object.freeze({effects:['fade','scratch','rust','dent','patch']}),
 mirror:Object.freeze({effects:['scratch','crack','break']}),
 light:Object.freeze({effects:['fade','crack','break']}),
 seat:Object.freeze({effects:['fade','tear','patch']}),
 rubber:Object.freeze({effects:['fade','scuff']}),
 wheel:Object.freeze({effects:['dull','rust','scuff']}),
 exhaust:Object.freeze({effects:['dull','rust','dent']})
});
const PART_TYPES=Object.freeze({
 handlebar:'metal',frontBumper:'plastic',brakeDisc:'metal',brakePedal:'metal',exhaust:'exhaust',
 rearCarrier:'metal',indicator:'light',tailLamp:'light',seat:'seat',fuelTank:'paintedMetal',
 frontFender:'plastic',wheel:'wheel',mirror:'mirror',cowl:'plastic',suspension:'metal',
 caliper:'metal',frame:'metal',footrest:'metal',windscreen:'plastic'
});
const YEARS=Object.freeze([
 {max:1,text:'새 차 수준',effects:[]},
 {max:2,text:'작은 흠집',effects:['scratch']},
 {max:3,text:'광택 저하 · 차체 흠집',effects:['fade','dull','scratch']},
 {max:4,text:'광택 저하 · 차체 흠집 · 녹',effects:['fade','dull','scratch','rust']},
 {max:5,text:'광택 저하 · 심한 흠집 · 녹',effects:['fade','dull','scratch','rust']},
 {max:9,text:'심한 흠집 · 부식 · 일부 파손',effects:['fade','dull','scratch','rust','crack','break','dent']},
 {max:Infinity,text:'노후 · 파손 · 땜빵 · 다른 색상의 부품',effects:['fade','dull','scratch','rust','crack','break','dent','patch','tear']}
]);
const maskRegistry=Object.create(null);
function profile(year,now=new Date().getFullYear()){
 if(!Number.isInteger(year)||year<1950||year>now)return null;
 const age=Math.max(0,now-year),stage=YEARS.findIndex(x=>age<=x.max);
 return {age,stage,effects:YEARS[stage].effects.slice(),description:YEARS[stage].text};
}
function registerMask(modelId,config){
 if(!/^[a-z0-9-]{2,64}$/i.test(modelId)||!config||config.verified!==true||!Number.isInteger(config.width)||!Number.isInteger(config.height))return false;
 if(!Array.isArray(config.parts)||config.parts.length>80)return false;
 const parts=[];
 for(const part of config.parts){
  if(!part||!Object.prototype.hasOwnProperty.call(PART_TYPES,part.id))return false;
  const material=part.material||PART_TYPES[part.id];
  if(!Object.prototype.hasOwnProperty.call(MATERIALS,material))return false;
  if(!Array.isArray(part.polygon)||part.polygon.length<3||part.polygon.length>100)return false;
  if(!part.polygon.every(point=>Array.isArray(point)&&point.length===2&&point.every(n=>Number.isFinite(n)&&n>=0&&n<=1)))return false;
  parts.push({id:part.id,material,polygon:part.polygon.map(point=>point.slice())});
 }
 maskRegistry[modelId]={width:config.width,height:config.height,parts};
 return true;
}
function regions(modelId,width,height){
 const mask=maskRegistry[modelId];
 if(!mask||mask.width!==width||mask.height!==height)return [];
 return mask.parts;
}
function seed(value){let h=2166136261;for(const ch of value){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function random(seedValue){let x=seedValue|0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function draw(ctx,modelId,year,width,height){
 const wear=profile(year),parts=regions(modelId,width,height);
 if(!wear||wear.stage===0||!parts.length)return false;
 for(const part of parts){
  const allowed=MATERIALS[part.material].effects.filter(e=>wear.effects.includes(e));
  if(!allowed.length)continue;
  const pts=part.polygon,rx=pts.map(p=>p[0]*width),ry=pts.map(p=>p[1]*height);
  const minX=Math.min(...rx),maxX=Math.max(...rx),minY=Math.min(...ry),maxY=Math.max(...ry);
  const rand=random(seed(modelId+part.id+String(year)));
  ctx.save();ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*width,y*height):ctx.moveTo(x*width,y*height));ctx.closePath();ctx.clip();
  if(allowed.includes('fade')||allowed.includes('dull')){
   ctx.fillStyle=part.material==='metal'?'#777d80':'#77736d';
   ctx.globalAlpha=Math.min(.28,Math.max(0,wear.stage-1)*.047);
   ctx.fillRect(minX,minY,maxX-minX,maxY-minY);ctx.globalAlpha=1;
  }
  if(allowed.includes('scratch')){
   const total=Math.min(25,Math.floor(wear.stage*1.4));
   for(let i=0;i<total;i++){
    const x=minX+rand()*(maxX-minX),y=minY+rand()*(maxY-minY);
    ctx.strokeStyle=i%3===0?'#423d3b':'#d5d1c9';ctx.globalAlpha=.16+wear.stage*.065;
    ctx.lineWidth=Math.max(.5,width/800);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rand()-.25)*width*.012,y+(rand()-.5)*height*.006);ctx.stroke();
   }
   ctx.globalAlpha=1;
  }
  if(allowed.includes('rust')){
   const n=Math.min(35,wear.stage*4);
   for(let i=0;i<n;i++){
    const x=minX+rand()*(maxX-minX),y=minY+rand()*(maxY-minY);
    ctx.fillStyle=i%2===0?'#a45128':'#744026';ctx.globalAlpha=.12+wear.stage*.054;
    ctx.beginPath();ctx.ellipse(x,y,Math.max(1,width*(.001+rand()*.003)),Math.max(.6,height*(.001+rand()*.003)),rand()*Math.PI,0,2*Math.PI);ctx.fill();
   }
   ctx.globalAlpha=1;
  }
  // Structural break, dent and patch require dedicated artwork variants.
  // They are never randomly removed from a bitmap; avoiding holes in empty background.
  ctx.restore();
 }
 return true;
}
window.MotorcycleWearLibrary=Object.freeze({profile,draw,registerMask,regions,materials:MATERIALS,partTypes:PART_TYPES});
})();