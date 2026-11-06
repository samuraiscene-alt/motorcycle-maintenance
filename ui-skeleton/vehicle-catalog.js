(()=>{'use strict';
/* Vehicle-picker candidates only. This is not a manufacturer-verified model-year or service table.
 * Official maintenance profiles must be introduced separately, after documentation review.
 */
// Candidate model names and displacement defaults; verify the exact model year when registering.
// These entries never imply a verified maintenance interval for any model year.
const brands=[
 {id:'HONDA',label:'HONDA',models:[['PCX125',125],['FORZA350',350],['ADV350',350],['SUPER CUB110',110],['C125',125],['CT125',125],['CB125R',125],['CB650R',649],['CBR650R',649],['REBEL500',471]]},
 {id:'YAMAHA',label:'YAMAHA',models:[['NMAX125',125],['XMAX300',300],['XMAX125',125],['TMAX560',560],['MT-03',321],['MT-07',689],['YZF-R3',321],['TRICITY125',125]]},
 {id:'SUZUKI',label:'SUZUKI',models:[['BURGMAN125',125],['BURGMAN400',400],['ADDRESS125',125],['AVENIS125',125],['GSX-S125',125]]},
 {id:'KAWASAKI',label:'KAWASAKI',models:[['NINJA500',451],['Z500',451],['Z900',948]]},
 {id:'BMW',label:'BMW Motorrad',models:[['G310R',313],['R1300GS',1300]]},
 {id:'DUCATI',label:'DUCATI',models:[['MONSTER',937]]},
 {id:'TRIUMPH',label:'TRIUMPH',models:[['SPEED400',400]]},
 {id:'SYM',label:'SYM',models:[['JET14',125],['JOYMAX',300],['JET X 125',125]]},
 {id:'KYMCO',label:'KYMCO',models:[['DOWNTOWN',350],['AK550',550],['LIKE125',125]]},
 {id:'VESPA',label:'VESPA',models:[['PRIMAVERA125',125],['GTS300',300],['SPRINT125',125],['GTV300',300]]}
];

// A classification is not a physical dimension or an image scaling instruction.
// Keep the standard garage asset unchanged until a model-specific graphic is available.
const modelStyles=Object.freeze({
 HONDA:Object.freeze({'PCX125':'scooter-compact','FORZA350':'scooter-mid','ADV350':'scooter-adventure','SUPER CUB110':'underbone','C125':'underbone','CT125':'underbone-trail','CB125R':'naked-light','CB650R':'naked-mid','CBR650R':'sport-mid','REBEL500':'cruiser'}),
 YAMAHA:Object.freeze({'NMAX125':'scooter-compact','XMAX300':'scooter-mid','XMAX125':'scooter-mid','TMAX560':'scooter-large','MT-03':'naked-light','MT-07':'naked-mid','YZF-R3':'sport-light','TRICITY125':'scooter-three-wheel'}),
 SUZUKI:Object.freeze({'BURGMAN125':'scooter-compact','BURGMAN400':'scooter-large','ADDRESS125':'scooter-compact','AVENIS125':'scooter-compact','GSX-S125':'naked-light'}),
 KAWASAKI:Object.freeze({'NINJA500':'sport-mid','Z500':'naked-mid','Z900':'naked-large'}),
 BMW:Object.freeze({'G310R':'naked-light','R1300GS':'adventure-large'}),
 DUCATI:Object.freeze({'MONSTER':'naked-large'}),
 TRIUMPH:Object.freeze({'SPEED400':'modern-classic'}),
 SYM:Object.freeze({'JET14':'scooter-compact','JOYMAX':'scooter-mid','JET X 125':'scooter-compact'}),
 KYMCO:Object.freeze({'DOWNTOWN':'scooter-mid','AK550':'scooter-large','LIKE125':'scooter-compact'}),
 VESPA:Object.freeze({'PRIMAVERA125':'scooter-classic','GTS300':'scooter-classic-large','SPRINT125':'scooter-classic','GTV300':'scooter-classic-large'})
});
// Verified dimensions are tied to region and model year, never extrapolated to all years.
// Values measure the real vehicle's envelope (mm), not its drawn asset bounding box.
const verifiedDimensions=Object.freeze({
 'HONDA|PCX125|2025':Object.freeze({lengthMm:1935,widthMm:740,heightMm:1125,region:'EU',source:'https://hondanews.eu/eu/en/motorcycles/media/pressreleases/503766/25ym-honda-pcx125-press-kit'}),
 'YAMAHA|XMAX300|2025':Object.freeze({lengthMm:2184,widthMm:775,heightMm:1410,region:'US',heightRangeMm:[1410,1506],source:'https://www.yamahamotorsports.com/models/25-xmax/specs'})
});
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
  source:'https://www.hondamotopub.com/om/HMEE/WW125A%20(PCX)/2023-2024',
  sourceType:'Honda MotoPub official shared 2023–2024 WW125A PCX manual (32K1YC11)',
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
 'YAMAHA|XMAX300|2025':Object.freeze({
  verified:true,coverage:'partial',region:'2025 XMAX300 owner manual',modelCode:'XMAX 300',year:2025,
  source:'https://www.ysk.co.kr/support/manual.php?boardid=manual&idx=64&mNum=5&mode=view&sNum=7',
  sourceText:'https://www.manualpdf.in/yamaha/xmax-300-2025/manual?p=91',
  sourceType:'Yamaha Korea 2025 XMAX300 owner manual listing; model-year maintenance charts cross-checked against 2025 manual pages 89–92',
  sourcePages:['8-3','8-4','8-5','8-6'],
  intervals:Object.freeze({
   oil:5000,filter:20000,'air-filter':20000,'drive-belt':20000,
   'gear-oil':20000,'spark-plug':20000
  }),
  tasks:Object.freeze({
   oil:{replaceKm:5000,firstReplaceKm:1000,firstRegularOdometerKm:4000,indicator:true},
   filter:{replaceKm:20000,firstReplaceKm:1000,firstRegularOdometerKm:20000},
   'air-filter':{replaceKm:20000},
   'drive-belt':{replaceKm:20000,indicator:true},
   'gear-oil':{replaceKm:20000,firstReplaceKm:1000,firstRegularOdometerKm:20000},
   'spark-plug':{inspectKm:10000,replaceKm:20000},
   'valve-clearance':{inspectKm:20000},
   'pre-air-filter':{cleanKm:20000},
   'sub-air-filter':{replaceKm:20000},
   'brake-fluid':{replaceMonths:24},
   'brake-hose':{replaceMonths:48,inspectKm:10000},
   coolant:{replaceMonths:36,inspectKm:10000},
   brake:{inspectKm:10000,replaceWhenWorn:true},
   tire:{inspectKm:10000,replaceWhenWorn:true}
  }),
  actionByPart:Object.freeze({'valve-clearance':'inspect','pre-air-filter':'clean'})
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
// Honda officially publishes shared manuals for 2021–2022 and 2023–2024 model years.
// These additions use only the cross-checked maintenance fields from those manual families.
const honda2122=Object.freeze({
 ...officialProfiles['HONDA|PCX125|2024'],
 verified:true,coverage:'partial',
 modelCode:'WW125A',
 source:'https://www.hondamotopub.com/om/HMEE/WW125A%20(PCX)/2021-2022',
 sourceType:'Honda MotoPub official 2021–2022 WW125A PCX manual (32K1YC001)',
 sourcePages:['Maintenance Schedule'],
 intervals:Object.freeze({
  oil:6000,filter:18000,'spark-plug':12000,'drive-belt':24000,'valve-clearance':6000
 }),
 tasks:Object.freeze({
  oil:{replaceKm:6000,firstReplaceKm:1000,firstRegularOdometerKm:6000},
  filter:{replaceKm:18000},'spark-plug':{inspectKm:6000,replaceKm:12000},
  'drive-belt':{inspectKm:12000,replaceKm:24000},
  'valve-clearance':{inspectKm:6000},'brake-fluid':{replaceMonths:24},
  'gear-oil':{replaceMonths:24},coolant:{replaceMonths:36}
 }),
 actionByPart:Object.freeze({'valve-clearance':'inspect'})
});
const expandedOfficialProfiles=Object.freeze({
 ...officialProfiles,
 'HONDA|PCX125|2021':Object.freeze({...honda2122,year:2021}),
 'HONDA|PCX125|2022':Object.freeze({...honda2122,year:2022}),
 'HONDA|PCX125|2023':Object.freeze({
  ...officialProfiles['HONDA|PCX125|2024'],year:2023,
  source:'https://www.hondamotopub.com/om/HMEE/WW125A%20(PCX)/2023-2024',
  sourceType:'Honda MotoPub official shared 2023–2024 WW125A PCX manual (32K1YC11)',
  coverage:'partial'
 })
});
const profileKey=(brand,model,year)=>[String(brand).trim().toUpperCase(),String(model).trim().toUpperCase(),String(year)].join('|');
window.MotorcycleCatalog=Object.freeze({
 brands,
 officialProfiles:expandedOfficialProfiles,
 profileKey,
 modelStyles,
 verifiedDimensions,
 findBodyStyle(brand,model){
  return modelStyles[String(brand).trim().toUpperCase()]?.[String(model).trim().toUpperCase()]||'unclassified';
 },
 findVerifiedDimensions(brand,model,year){
  return verifiedDimensions[profileKey(brand,model,year)]||null;
 },
 findOfficialProfile(brand,model,year){
  const value=expandedOfficialProfiles[profileKey(brand,model,year)];
  return value&&value.verified===true&&value.source?value:null;
 }
});
})();
