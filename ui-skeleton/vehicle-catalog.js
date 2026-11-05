(()=>{'use strict';
/* Vehicle-picker candidates only. This is not a manufacturer-verified model-year or service table.
 * Official maintenance profiles must be introduced separately, after documentation review.
 */
const brands=[
 {id:'HONDA',label:'HONDA',models:[['PCX125',125],['FORZA350',350],['ADV350',350],['SUPER CUB110',110]]},
 {id:'YAMAHA',label:'YAMAHA',models:[['NMAX125',125],['XMAX300',300],['XMAX125',125],['TMAX560',560]]},
 {id:'SUZUKI',label:'SUZUKI',models:[['BURGMAN125',125],['BURGMAN400',400]]},
 {id:'SYM',label:'SYM',models:[['JET14',125],['JOYMAX',300]]},
 {id:'KYMCO',label:'KYMCO',models:[['DOWNTOWN',350],['AK550',550]]},
 {id:'VESPA',label:'VESPA',models:[['PRIMAVERA125',125],['GTS300',300]]}
];
const officialProfiles=Object.freeze({
 'YAMAHA|NMAX125|2022':Object.freeze({
  verified:true,coverage:'partial',region:'GPD125 / Yamaha Korea 2022',modelCode:'GPD125',year:2022,
  source:'https://www.ysk.co.kr/support/manual.php?boardid=manual&idx=57&mNum=5&mode=view&sNum=7',
  sourceText:'https://ownersmanuals2.com/yamaha/nmax-125-2022-owners-manual-95466',
  sourceType:'Yamaha NMAX125 2022 user manual, manufacturer document linked by Yamaha Korea',
  sourcePages:['9-2','9-3','9-4','9-5'],
  intervals:Object.freeze({oil:6000,filter:18000}),
  tasks:Object.freeze({
   oil:{replaceKm:6000,firstReplaceKm:1000,firstRegularOdometerKm:5000,indicator:true},
   filter:{replaceKm:18000},'drive-belt':{replaceOnIndicator:true},
   'brake-fluid':{replaceMonths:24},'brake-hose':{replaceMonths:48},
   coolant:{replaceMonths:36},
   brake:{inspectAsScheduled:true,replaceWhenWorn:true},
   tire:{inspectAsScheduled:true,replaceWhenWorn:true}
  }),
  actionByPart:Object.freeze({})
 }),
 'HONDA|PCX125|2024':Object.freeze({
  verified:true,coverage:'partial',region:'KO/ED',modelCode:'WW125S/A',year:2024,
  source:'https://www.manualslib.com/manual/3601308/Honda-Pcx125-2024.html',
  sourceType:'Honda PCX125 (WW125S/A) 2024 manufacturer owner manual, reproduced by ManualsLib',
  sourcePages:[133,134,135],
  intervals:Object.freeze({
   oil:6000,filter:18000,'spark-plug':12000,'drive-belt':24000,
   'oil-strainer':12000,'valve-clearance':6000
  }),
  tasks:Object.freeze({
   oil:{replaceKm:6000,firstReplaceKm:1000,firstRegularOdometerKm:6000},
   filter:{replaceKm:18000},
   'spark-plug':{inspectKm:6000,replaceKm:12000},
   'drive-belt':{inspectKm:12000,replaceKm:24000},
   'oil-strainer':{cleanKm:12000},
   'valve-clearance':{inspectKm:6000},
   'brake-fluid':{replaceMonths:24},
   'gear-oil':{replaceMonths:24},
   coolant:{replaceMonths:36},
   brake:{replaceWhenWorn:true},
   tire:{replaceWhenWorn:true}
  }),
  actionByPart:Object.freeze({'oil-strainer':'clean','valve-clearance':'inspect'})
 }),
 'YAMAHA|NMAX125|2025':Object.freeze({
  verified:true,region:'2025 GPD125-A',modelCode:'GPD125-A',year:2025,
  source:'https://www.ysk.co.kr/support/manual.php?boardid=manual&idx=62&mode=view',
  sourceText:'https://manualzz.com/doc/91138987/yamaha-nmax-125-scooter-owner-s-manual',
  sourcePages:['4-8','7-3','7-4','7-5'],
  sourceType:'Yamaha NMAX GPD125-A 2025 owner manual (model-specific)',
  intervals:Object.freeze({
   oil:6000,filter:18000,'drive-belt':18000
  }),
  tasks:Object.freeze({
   oil:{replaceKm:6000,firstReplaceKm:1000,firstRegularOdometerKm:6000,indicator:true},
   filter:{replaceKm:18000},
   'drive-belt':{replaceKm:18000,indicator:true},
   'brake-fluid':{replaceMonths:24},
   'brake-hose':{replaceMonths:48,inspectKm:6000},
   coolant:{replaceMonths:36,inspectKm:6000},
   brake:{inspectKm:6000,replaceWhenWorn:true},
   tire:{inspectKm:6000,replaceWhenWorn:true},
   'oil-strainer':{cleanAtService:true},
   'valve-clearance':{inspectAsScheduled:true},
   'spark-plug':{inspectAsScheduled:true}
  }),
  actionByPart:Object.freeze({'oil-strainer':'clean','valve-clearance':'inspect'})
 }),
 'HONDA|PCX125|2025':Object.freeze({
  verified:true,region:'KO',modelCode:'WW125A',year:2025,
  source:'https://2rom-prd-data.hondamotopub.com/om/HMEE/WW125S_A%20%28PCX%29/2025/WW125SA_OM_32K1YE00_web.pdf',
  sourcePages:[130,131],sourceType:'Honda 2025 PCX125 owner manual',
  intervals:Object.freeze({
   oil:6000,filter:18000,'spark-plug':12000,'drive-belt':24000,
   'oil-strainer':12000,'valve-clearance':6000
  }),
  // Separate tasks; inspection/cleaning must not be counted as a replacement.
  tasks:Object.freeze({
   oil:{replaceKm:6000,firstReplaceKm:1000,firstRegularOdometerKm:6000},
   filter:{replaceKm:18000},
   'spark-plug':{inspectKm:6000,replaceKm:12000},
   'drive-belt':{inspectKm:12000,replaceKm:24000},
   'oil-strainer':{cleanKm:12000},
   'valve-clearance':{inspectKm:6000},
   'brake-fluid':{replaceMonths:24,inspectKm:6000},
   'gear-oil':{replaceMonths:24},
   coolant:{replaceMonths:36,inspectKm:6000},
   brake:{inspectKm:6000,replaceWhenWorn:true},
   tire:{inspectKm:6000,replaceWhenWorn:true},
   'clutch-shoe':{inspectKm:12000}
  }),
  actionByPart:Object.freeze({'oil-strainer':'clean','valve-clearance':'inspect'})
 })
});
const profileKey=(brand,model,year)=>[String(brand).trim().toUpperCase(),String(model).trim().toUpperCase(),String(year)].join('|');
window.MotorcycleCatalog=Object.freeze({
 brands,
 officialProfiles,
 profileKey,
 findOfficialProfile(brand,model,year){
  const value=officialProfiles[profileKey(brand,model,year)];
  return value&&value.verified===true&&value.source?value:null;
 }
});
})();
