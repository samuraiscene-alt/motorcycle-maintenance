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
// Linked manufacturer marks; preserve readable names when image loading fails.
const brandLogos=Object.freeze({
 SUZUKI:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Suzuki_logo_2025_(vertical).svg',
 KAWASAKI:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kawasaki_Motors_logo.svg',
 BMW:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Logo_BMW_Motorrad_2021.svg',
 VESPA:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Vespa-logo.svg'
});
// Known release-year restrictions: do not infer model years from the model name.
const knownFirstModelYears=Object.freeze({'BMW|R1300GS':2024});
const officialProfiles=Object.freeze({
 'HONDA|CT125|2026':Object.freeze({
  verified:true,coverage:'partial',region:'JP 8BJ-JA65 (frame JA65-1200001+)',modelCode:'JA65',year:2026,
  source:'https://www.honda.co.jp/customer/motor/ct125/faq/qa009/',
  sourceText:'https://www.honda.co.jp/customer/motor/ct125/faq/qa010/',
  sourceType:'Honda Japan CT125 2026 JA65 model-specific official owner FAQ; oil and replaceable filter',
  sourcePages:['Honda JP qa009','Honda JP qa010'],
  intervals:Object.freeze({oil:3000,filter:12000,'oil-filter':12000}),
  tasks:Object.freeze({
   oil:{replaceKm:3000,firstReplaceKm:1000,firstRegularOdometerKm:4000,replaceMonths:12},
   filter:{replaceKm:12000,firstReplaceKm:13000,firstRegularOdometerKm:25000},
   'oil-filter':{replaceKm:12000,firstReplaceKm:13000,firstRegularOdometerKm:25000}
  }),
  specs:Object.freeze({oilChangeLiters:0.8,oilAndFilterChangeLiters:0.85,engineOilTotalLiters:1.0}),
  notes:Object.freeze({firstOilCalendar:'First oil change by 1 month or 1000 km, whichever comes first; initial 1-month calculation not supported by app.'}),
  actionByPart:Object.freeze({})
 }),
 'HONDA|C125|2022':Object.freeze({
  verified:true,coverage:'partial',region:'US',modelCode:'C125A',year:2022,
  source:'https://cdn.powersports.honda.com/documentum/MWOM/ml.remawmom.2022_c125__super_cub__owner_s_manual.pdf',
  sourceType:'Honda 2022 C125A US official maintenance schedule',sourcePages:[61,62],
  intervals:Object.freeze({oil:6400,filter:12800,'oil-filter':12800,'air-filter':19200,'spark-plug':12800,'valve-clearance':6400,'oil-strainer':12800,'chain-sprockets':500}),
  tasks:Object.freeze({
   oil:{replaceKm:6400,firstReplaceKm:1000,firstRegularOdometerKm:6400,replaceMonths:12},
   filter:{replaceKm:12800},'oil-filter':{replaceKm:12800},
   'air-filter':{replaceKm:19200},'spark-plug':{inspectKm:6400,replaceKm:12800},
   'valve-clearance':{inspectKm:6400},'oil-strainer':{cleanKm:12800},
   'chain-sprockets':{inspectKm:500},'brake-fluid':{replaceMonths:24}
  }),
  actionByPart:Object.freeze({'valve-clearance':'inspect','oil-strainer':'clean','chain-sprockets':'inspect'})
 }),
 'HONDA|C125|2026':Object.freeze({
  verified:true,coverage:'partial',region:'JP 8BJ-JA71 (2026), frame JA71-1100001+',modelCode:'JA71',year:2026,
  source:'https://www.honda.co.jp/customer/motor/supercub110/faq/qa009/',
  sourceText:'https://www.honda.co.jp/customer/motor/supercub110/faq/qa010/',
  sourceType:'Honda Japan Super Cub C125 JA71 2026 factory oil & oil-filter FAQ; model/year specific',
  sourcePages:['Honda Japan FAQ qa009','Honda Japan FAQ qa010','Honda Japan FAQ qa013'],
  // Oil first at 1,000 km or 1 month, later every 3,000 km or 1 year.
  // Initial 1-month limit is documentation only; app currently lacks an initial-date trigger.
  // Filter first at 13,000 km and subsequently 25,000 km, 37,000 km ...
  intervals:Object.freeze({oil:3000,filter:12000}),
  tasks:Object.freeze({
   oil:{replaceKm:3000,firstReplaceKm:1000,firstRegularOdometerKm:4000,replaceMonths:12},
   filter:{replaceKm:12000,firstReplaceKm:13000,firstRegularOdometerKm:25000}
  }),
  specs:Object.freeze({
   oilQuantityAtChangeL:0.8,oilQuantityWithFilterL:0.85,
   chainSlackMm:[25,35],chainSize:'420-106 links',
   chainSlackSource:'https://www.honda.co.jp/customer/motor/supercub110/faq/qa013/'
  }),
  actionByPart:Object.freeze({})
 }),
 'HONDA|SUPER CUB110|2022':Object.freeze({
  verified:true,coverage:'partial',region:'JP 8BJ-JA59 (frame JA59-1000001+)',modelCode:'JA59',year:2022,
  source:'https://www.honda.co.jp/customer/motor/supercub110/faq/qa009/',
  sourceText:'https://www.honda.co.jp/customer/motor/supercub110/faq/qa010/',
  sourceType:'Honda Japan official Super Cub 110 JA59 oil and oil-filter FAQ, applicable model specified as 2022',
  sourcePages:['Honda FAQ qa009','Honda FAQ qa010','Honda FAQ qa013'],
  // Oil: 1,000 km / 1 month initial, then 3,000 km / 1 year.
  // Filter: first at 13,000 km, then every 12,000 km (25,000 km, 37,000 km ...).
  // The app records 12-month replacement guidance; initial 1-month time limit is in source metadata.
  intervals:Object.freeze({oil:3000,filter:12000}),
  tasks:Object.freeze({
   oil:{replaceKm:3000,firstReplaceKm:1000,firstRegularOdometerKm:4000,replaceMonths:12},
   filter:{replaceKm:12000,firstReplaceKm:13000,firstRegularOdometerKm:25000}
  }),
  specs:Object.freeze({chainSlackMm:[20,30],chainSlackSource:'https://www.honda.co.jp/customer/motor/supercub110/faq/qa013/'}),
  actionByPart:Object.freeze({})
 }),
 'HONDA|FORZA350|2025':Object.freeze({
  verified:true,coverage:'partial',region:'HMEE European NSS350A, IV ED / VI ED',modelCode:'NSS350A',year:2025,
  source:'https://2rom-prd-data.hondamotopub.com/om/HMEE/NSS250A_350A/2025/FORZA%20250350%20%28NSS250A-350A%29_32K1BF300_web.pdf',
  sourceType:'Honda MotoPub 2025 Forza 250/350 NSS350A European owner manual; maintenance schedule',
  sourcePages:[107,108],
  // Confirmed R/I/C symbols: do not confuse periodic inspection or cleaning with replacement.
  intervals:Object.freeze({oil:12000,filter:24000,'air-filter':24000,'spark-plug':12000,'drive-belt':24000,
   'valve-clearance':24000,'belt-case-air-filter':12000}),
  tasks:Object.freeze({
   oil:{replaceKm:12000,firstReplaceKm:1000,firstRegularOdometerKm:12000},
   filter:{replaceKm:24000,firstReplaceKm:1000,firstRegularOdometerKm:24000},
   'air-filter':{replaceKm:24000},
   'spark-plug':{replaceKm:12000},
   'drive-belt':{inspectKm:12000,replaceKm:24000},
   'belt-case-air-filter':{cleanKm:12000},
   'valve-clearance':{inspectKm:24000},
   'gear-oil':{replaceMonths:24},
   'brake-fluid':{replaceMonths:24},
   coolant:{replaceMonths:36},
   'clutch-shoe':{inspectKm:12000},
   brake:{inspectKm:12000,replaceWhenWorn:true},
   tire:{inspectKm:12000,replaceWhenWorn:true}
  }),
  actionByPart:Object.freeze({'valve-clearance':'inspect','belt-case-air-filter':'clean'})
 }),
 'HONDA|ADV350|2025':Object.freeze({
  verified:true,coverage:'partial',region:'HMEE ADV350A (English owner manual)',modelCode:'ADV350A',year:2025,
  source:'https://2rom-prd-data.hondamotopub.com/om/HMEE/ADV350A/2025/ADV350A_32K2LA10_eng_WEB.pdf',
  sourceType:'Honda MotoPub ADV350A 2025 owner manual; maintenance schedule, model/region specific',
  sourcePages:[106,107],
  // The first service and subsequent maintenance milestones differ. Avoid treating the inspection as replacement.
  intervals:Object.freeze({oil:12000,filter:24000,'spark-plug':12000}),
  tasks:Object.freeze({
   oil:{replaceKm:12000,firstReplaceKm:1000,firstRegularOdometerKm:12000},
   filter:{replaceKm:24000,firstReplaceKm:1000,firstRegularOdometerKm:24000},
   'spark-plug':{replaceKm:12000},
   coolant:{replaceMonths:36}
  }),
  actionByPart:Object.freeze({})
 }),
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
 brandLogos,
 knownFirstModelYears,
 validateModelYear(brand,model,year){
  const first=knownFirstModelYears[String(brand).trim().toUpperCase()+'|'+String(model).trim().toUpperCase()];
  return !first||!Number.isSafeInteger(year)||year>=first?null:{first,description:model+' '+year+'년형은 확인된 출시 연식보다 이전이야 ('+first+'년형부터).'};
 },
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
