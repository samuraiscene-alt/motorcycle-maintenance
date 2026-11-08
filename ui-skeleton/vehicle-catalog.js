(()=>{'use strict';
/* Vehicle-picker candidates only. This is not a manufacturer-verified model-year or service table.
 * Official maintenance profiles must be introduced separately, after documentation review.
 */
// Candidate model names and displacement defaults; verify the exact model year when registering.
// These entries never imply a verified maintenance interval for any model year.
const brands=[
 {id:'HONDA',label:'HONDA',models:[['PCX125',125],['FORZA350',350],['ADV350',350],['SUPER CUB110',110],['C125',125],['CT125',125],['MONKEY125',125],['CB125R',125],['CB650R',649],['CBR650R',649],['REBEL500',471]]},
 {id:'YAMAHA',label:'YAMAHA',models:[['NMAX125',125],['XMAX300',300],['XMAX125',125],['TMAX560',560],['MT-03',321],['MT-07',689],['YZF-R3',321],['TRICITY125',125]]},
 {id:'SUZUKI',label:'SUZUKI',models:[['BURGMAN125',125],['BURGMAN400',400],['ADDRESS125',125],['AVENIS125',125],['GSX-S125',125]]},
 {id:'KAWASAKI',label:'KAWASAKI',models:[['NINJA500',451],['Z500',451],['Z900',948]]},
 {id:'BMW',label:'BMW Motorrad',models:[['G310R',313],['R1300GS',1300]]},
 {id:'DUCATI',label:'DUCATI',models:[['MONSTER',937]]},
 {id:'TRIUMPH',label:'TRIUMPH',models:[['SPEED400',400]]},
 {id:'SYM',label:'SYM',models:[['JET14',125],['JOYMAX',300],['JET X 125',125]]},
 {id:'KYMCO',label:'KYMCO',models:[['DOWNTOWN',350],['AK550',550],['LIKE125',125]]},
 {id:'VESPA',label:'VESPA',models:[['PRIMAVERA125',125],['GTS300',300],['SPRINT125',125],['GTV300',300]]},
 {id:'DNA MOTORS',label:'DNA MOTORS',models:[['UHR125',125]]},
 {id:'ZONTES',label:'ZONTES',models:[['125G1',125],['125D',125]]}
];

// A classification is not a physical dimension or an image scaling instruction.
// Keep the standard garage asset unchanged until a model-specific graphic is available.
const modelStyles=Object.freeze({
 HONDA:Object.freeze({'PCX125':'scooter-compact','FORZA350':'scooter-mid','ADV350':'scooter-adventure','SUPER CUB110':'underbone','C125':'underbone','CT125':'underbone-trail','MONKEY125':'mini-bike','CB125R':'naked-light','CB650R':'naked-mid','CBR650R':'sport-mid','REBEL500':'cruiser'}),
 YAMAHA:Object.freeze({'NMAX125':'scooter-compact','XMAX300':'scooter-mid','XMAX125':'scooter-mid','TMAX560':'scooter-large','MT-03':'naked-light','MT-07':'naked-mid','YZF-R3':'sport-light','TRICITY125':'scooter-three-wheel'}),
 SUZUKI:Object.freeze({'BURGMAN125':'scooter-compact','BURGMAN400':'scooter-large','ADDRESS125':'scooter-compact','AVENIS125':'scooter-compact','GSX-S125':'naked-light'}),
 KAWASAKI:Object.freeze({'NINJA500':'sport-mid','Z500':'naked-mid','Z900':'naked-large'}),
 BMW:Object.freeze({'G310R':'naked-light','R1300GS':'adventure-large'}),
 DUCATI:Object.freeze({'MONSTER':'naked-large'}),
 TRIUMPH:Object.freeze({'SPEED400':'modern-classic'}),
 SYM:Object.freeze({'JET14':'scooter-compact','JOYMAX':'scooter-mid','JET X 125':'scooter-compact'}),
 KYMCO:Object.freeze({'DOWNTOWN':'scooter-mid','AK550':'scooter-large','LIKE125':'scooter-compact'}),
 VESPA:Object.freeze({'PRIMAVERA125':'scooter-classic','GTS300':'scooter-classic-large','SPRINT125':'scooter-classic','GTV300':'scooter-classic-large'}),
 'DNA MOTORS':Object.freeze({'UHR125':'scooter-compact'}),
 ZONTES:Object.freeze({'125G1':'scrambler-light','125D':'scooter-mid'})
});
// Verified dimensions are tied to region and model year, never extrapolated to all years.
// Values measure the real vehicle's envelope (mm), not its drawn asset bounding box.
const verifiedDimensions=Object.freeze({
 'DNA MOTORS|UHR125|2025':Object.freeze({lengthMm:1950,widthMm:755,heightMm:1120,region:'KR',source:'https://www.dnamotors.co.kr/brand/scooter_UHR125'}),
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
const knownFirstModelYears=Object.freeze({
 'BMW|R1300GS':2024,'DNA MOTORS|UHR125':2022,'KAWASAKI|NINJA500':2024,'KAWASAKI|Z500':2024,'KAWASAKI|Z900':2017,
 'VESPA|PRIMAVERA125':2013,'VESPA|SPRINT125':2014,'VESPA|GTS300':2008,'VESPA|GTV300':2023
});
// These source-verified model introductions are not claims of availability in every market.
const modelReleaseSources=Object.freeze({
 'VESPA|PRIMAVERA125':'https://press.piaggiogroup.com/en_EN/post/show/109335/storia-vespa-1946-2024.html',
 'VESPA|SPRINT125':'https://press.piaggiogroup.com/en_EN/post/show/109335/storia-vespa-1946-2024.html',
 'VESPA|GTS300':'https://press.piaggiogroup.com/en_EN/post/show/109335/storia-vespa-1946-2024.html',
 'VESPA|GTV300':'https://press.piaggiogroup.com/en_EN/post/show/253279/new-vespa-gtv.html',
 'KAWASAKI|Z500':'https://storage.kawasaki.eu/repository/be/fr-BE/Accessoires/Kawasaki_Genuine_Chain_Kits_20251121.pdf',
 'KAWASAKI|Z900':'https://storage.kawasaki.eu/repository/be/fr-BE/Accessoires/Kawasaki_Genuine_Chain_Kits_20251121.pdf'
});
// Exact-year OEM technical specifications: physical part presence, NOT a maintenance-cycle assertion.
// Research evidence for remaining catalog models. Family references NEVER silently
// disable parts on a specific model year. Exact-year applicability remains separate.
const modelFamilyPartEvidence=Object.freeze({
 'HONDA|SUPER CUB110':Object.freeze({source:"https://www.honda.co.jp/SUPERCUB/",cooling:'air',drive:'chain',scope:'model-family-reference',notes:"110cc JPN model; no cross-market interval"}),
 'HONDA|CT125':Object.freeze({source:"https://www.honda.co.jp/CT125/",cooling:'air',drive:'chain',scope:'model-family-reference',notes:"JA65 generation"}),
 'HONDA|REBEL500':Object.freeze({source:"https://hondanews.eu/eu/lv/motorcycles/media/pressreleases/500051/25ym-honda-cmx500-rebel-press-kit",cooling:'liquid',drive:'chain',scope:'model-family-reference',notes:"2025 CMX500 Rebel press specification"}),
 'YAMAHA|XMAX125':Object.freeze({source:"https://www.yamaha-motor.eu/kv/en/scooters/sport/pdp/xmax-125-2025/",cooling:'liquid',drive:'cvt',scope:'model-family-reference',notes:"EU XMAX 125; variant/market verify"}),
 'YAMAHA|TRICITY125':Object.freeze({source:"https://www.yamaha-motor.eu/gb/en/scooters/urban-mobility/pdp/tricity-125-abs/",cooling:'liquid',drive:'cvt',scope:'model-family-reference',notes:"three wheel model; do not unify front-tire count"}),
 'SUZUKI|BURGMAN125':Object.freeze({source:"https://www.globalsuzuki.com/motorcycle/smgs/products/2026burgman-street-125ex/",cooling:'air',drive:'cvt',scope:'model-family-reference',notes:"Burgman Street 125EX; verify EX variant"}),
 'SUZUKI|ADDRESS125':Object.freeze({source:"https://www.suzukimotorcycle.co.in/product-details/all-new-access-125-bluetooth-enabled/price",cooling:'air',drive:'cvt',scope:'model-family-reference',notes:"Indian Access 125 is NOT same as global Address 125; REFERENCE ONLY"}),
 'SUZUKI|AVENIS125':Object.freeze({source:"https://www.suzukimotorcycle.co.in/product-details/avenis/accessories",cooling:'air',drive:'cvt',scope:'model-family-reference',notes:"India Avenis 125 product"}),
 'SUZUKI|GSX-S125':Object.freeze({source:"https://bikes.suzuki.co.uk/bikes/street/gsx-s125/",cooling:'liquid',drive:'unverified',scope:'model-family-reference',notes:"engine cooling documented; final-drive confirmation pending"}),
 'BMW|G310R':Object.freeze({source:"https://manuals.bmw-motorrad.com/manuals/BA-Extern/IN/BA-INTERNET-COM/PDF/G_0G41_RM_0320_01.pdf",cooling:'liquid',drive:'chain',scope:'model-family-reference',notes:"BMW 2020 owner manual; may differ 2025"}),
 'BMW|R1300GS':Object.freeze({source:"https://www.bmw-motorrad.co.kr/ko/models/adventure/r1300gs/technicaldata.html",cooling:'mixed',drive:'shaft',scope:'model-family-reference',notes:"cardan shaft; NOT chain, not CVT"}),
 'DUCATI|MONSTER':Object.freeze({source:"https://www.ducati.com/us/en/bikes/monster/monster-sp",cooling:'liquid',drive:'chain',scope:'model-family-reference',notes:"937cc Monster; 2026 890cc variant differs"}),
 'SYM|JET14':Object.freeze({source:"https://www.sym-global.com/jet14-liquid-e5",cooling:'liquid',drive:'cvt',scope:'model-family-reference',notes:"JET14 125 liquid variant; air variant ALSO exists"}),
 'SYM|JOYMAX':Object.freeze({source:"https://www.sym-global.com/joymaxz300",cooling:'liquid',drive:'cvt',scope:'model-family-reference',notes:"JOYMAX Z 300 spec; verify JOYMAX trim"}),
 'SYM|JET X 125':Object.freeze({source:"https://www.sym-global.com/jetx",cooling:'liquid',drive:'cvt',scope:'model-family-reference',notes:"JET X 125 technical spec"}),
 'KYMCO|DOWNTOWN':Object.freeze({source:"https://www.kymco.com/product/downtown-350i-tcs",cooling:'liquid',drive:'cvt',scope:'model-family-reference',notes:"Downtown 350i 320.6cc; catalog says 350cc nominal"}),
 'KYMCO|AK550':Object.freeze({source:"https://www.kymco.com/uploads/new8/AK550%2055th/AK550_55th_PRESS%20INFORMATION.pdf",cooling:'liquid',drive:'cvt',scope:'model-family-reference',notes:"AK550 55th; CVT with secondary drive variant differences"}),
 'KYMCO|LIKE125':Object.freeze({source:"https://www.kymco.com/uploads/new8/Like%20S/Like_S_PRESS%20INFORMATION.pdf",cooling:'air',drive:'cvt',scope:'model-family-reference',notes:"Like S 125 variant; normal Like125 may differ"}),
 'DNA MOTORS|UHR125':Object.freeze({source:"https://www.dnamotors.co.kr/brand/scooter_UHR125",cooling:'liquid',drive:'unverified',scope:'model-family-reference',notes:"CVT suspected but official page only confirms liquid cooling"}),
 'ZONTES|125G1':Object.freeze({source:"https://www.zontes.co.kr/home/125g1/",cooling:'liquid',drive:'unverified',scope:'model-family-reference',notes:"6 speed 125G1; chain final drive not validated by provided page"}),
 'ZONTES|125D':Object.freeze({source:"https://www.zontes.co.kr/home/125d/",cooling:'liquid',drive:'unverified',scope:'model-family-reference',notes:"scooter type; final drive not validated"}),
});
const verifiedPartApplicability=Object.freeze({
 'YAMAHA|XMAX125|2025':Object.freeze({source:"https://www.yamaha-motor.eu/kv/en/scooters/sport/pdp/xmax-125-2025/",region:'OEM model specification',cooling:'liquid',drive:'cvt',notes:"EU 2025 XMAX 125; automatic V-Belt transmission; confirm regional trim",unsupported:["chain-sprockets"]}),
 'YAMAHA|TRICITY125|2025':Object.freeze({source:"https://www.yamaha-motor.eu/gb/en/scooters/urban-mobility/pdp/tricity-125-abs/",region:'OEM model specification',cooling:'liquid',drive:'cvt',frontTyres:2,notes:"EU 2025 Tricity 125 ABS, TWO front tyres; independent left/right service history may be added later",unsupported:["chain-sprockets"]}),
 'SUZUKI|BURGMAN125|2026':Object.freeze({source:"https://www.globalsuzuki.com/motorcycle/smgs/products/2026burgman-street-125ex/",region:'OEM model specification',cooling:'air',drive:'cvt',variantMatchRequired:true,notes:"Applies to Burgman Street 125EX; generic BURGMAN125 picker does not yet distinguish trim; no automatic exclusion",unsupported:[]}),
 'DUCATI|MONSTER|2025':Object.freeze({source:"https://www.ducati.com/us/en/bikes/monster/monster-937/insights",region:'OEM model specification',cooling:'liquid',drive:'chain',notes:"MY25 Monster 937cc. MY26 890cc changes; never extend this 2025 profile to 2026",unsupported:["drive-system-service","drive-belt","weights","slide-piece","gear-oil"]}),
 'SYM|JET X 125|2025':Object.freeze({source:"https://www.sym-global.com/jetx?engine=125cc",region:'OEM model specification',cooling:'liquid',drive:'cvt',notes:"SYM 2025 model catalogue JET X125, confirmed liquid cooling and CVT",unsupported:["chain-sprockets"]}),
 'SYM|JOYMAX|2025':Object.freeze({source:"https://www.sym-global.com/joymaxz300",region:'OEM model specification',cooling:'liquid',drive:'cvt',variantMatchRequired:true,notes:"JOYMAX Z300 specification, generic JOYMAX must identify Z300 trim before hiding parts",unsupported:[]}),
 'DNA MOTORS|UHR125|2025':Object.freeze({source:"https://www.dnamotors.co.kr/brand/scooter_UHR125",region:'OEM model specification',cooling:'liquid',drive:'unverified',notes:"Korean official UHR125 2025 product sheet confirms cooling, not final-drive method",unsupported:[]}),
 'ZONTES|125D|2025':Object.freeze({source:"https://www.zontes.co.kr/home/125d/",region:'OEM model specification',cooling:'liquid',drive:'unverified',notes:"Korean Zontes 125D product, cooling confirmed; final drive is not explicitly specified",unsupported:[]}),
 'SUZUKI|AVENIS125|2024':Object.freeze({source:"https://www.globalsuzuki.com/motorcycle/smgs/products/2024avenis125/",region:"Suzuki Global",cooling:'air',drive:'cvt',notes:"Global Suzuki 2024 Avenis125 technical specification, not maintenance schedule",unsupported:["coolant","chain-sprockets"]}),
 'SUZUKI|GSX-S125|2025':Object.freeze({source:"https://www.globalsuzuki.com/motorcycle/smgs/products/2025gsx-s125/",region:"EU spec via Suzuki Global",cooling:'liquid',drive:'chain',notes:"Global Suzuki 2025 6-speed chain final-drive configuration; replacement cycles require owner manual",unsupported:["drive-system-service","drive-belt","weights","slide-piece","gear-oil"]}),
 'BMW|R1300GS|2025':Object.freeze({source:"https://www.bmw-motorrad.co.kr/ko/models/adventure/r1300gs/technicaldata.html",region:"KR model line (year mapping pending)",cooling:'mixed',drive:'shaft',notes:"Korean BMW model specification current family: Cardan shaft; 2025 model listing, drivetrain year-specific verification pending",unsupported:["chain-sprockets","drive-system-service","drive-belt","weights","slide-piece"]}),
 'HONDA|CT125|2026':Object.freeze({source:'https://www.honda.co.jp/customer/motor/ct125/faq/qa015/',region:'JP',cooling:'air',drive:'chain',notes:"JP 8BJ-JA65; 2026 chain 428-108; air cooled 2026 technical sheet",unsupported:["drive-system-service","drive-belt","weights","slide-piece","gear-oil","coolant"]}),
 'HONDA|SUPER CUB110|2022':Object.freeze({source:'https://www.honda.co.jp/customer/motor/supercub110/faq/qa015/',region:'JP',cooling:'air',drive:'chain',notes:"JP JA59 2022 chain 428-100; air cooled Honda 2022 technical specification",unsupported:["drive-system-service","drive-belt","weights","slide-piece","gear-oil","coolant"]}),
 'HONDA|REBEL500|2025':Object.freeze({source:'https://hondanews.eu/eu/lv/motorcycles/media/pressreleases/500051/25ym-honda-cmx500-rebel-press-kit',region:'EU',cooling:'liquid',drive:'chain',notes:"EU 2025 Honda CMX500 manufacturer technical specification",unsupported:["drive-system-service","drive-belt","weights","slide-piece","gear-oil"]}),
 'SUZUKI|ADDRESS125|2025':Object.freeze({source:'https://www1.suzuki.co.jp/motor/lineup/files/pdf/uz125neym6.pdf',region:'JP 8BJ-EN11J',cooling:'air',drive:'cvt',notes:"JP 8BJ-EN11J AF26 Suzuki official environmental sheet; regional trim difference",unsupported:["chain-sprockets","coolant"]}),

 'YAMAHA|MT-03|2025':Object.freeze({source:'https://www.yamaha-motor.eu/al/en/motorcycles/hyper-naked/pdp/mt-03-2025/',region:'EU',cooling:'liquid',drive:'chain',unsupported:['drive-system-service','drive-belt','weights','slide-piece']}),
 'YAMAHA|YZF-R3|2026':Object.freeze({source:'https://www.yamaha-motor.eu/cy/en/motorcycles/supersport/pdp/r3/',region:'EU',cooling:'liquid',drive:'chain',unsupported:['drive-system-service','drive-belt','weights','slide-piece']}),

 'YAMAHA|TMAX560|2026':Object.freeze({source:'https://www.yamaha-motor.eu/kv/en/scooters/sport/pdp/tmax/',region:'EU',cooling:'liquid',drive:'cvt',unsupported:['chain-sprockets']}),
 'YAMAHA|TMAX560|2025':Object.freeze({source:'https://www.yamaha-motor.eu/cy/en/scooters/sport/pdp/tmax-2025/',region:'EU',cooling:'liquid',drive:'cvt',unsupported:['chain-sprockets']}),
 'SUZUKI|BURGMAN400|2026':Object.freeze({source:'https://bikes.suzuki.co.uk/bikes/scooter/burgman-400/specs/',region:'UK',cooling:'liquid',drive:'cvt',unsupported:['chain-sprockets']}),

 // Verified factory physical equipment; NOT permission to invent maintenance mileage.
 'HONDA|PCX125|2025':Object.freeze({source:'https://hondanews.eu/eu/en/motorcycles/media/pressreleases/503766/25ym-honda-pcx125-press-kit',region:'OEM published spec',cooling:'liquid',drive:'cvt',unsupported:["chain-sprockets"]}),
 'HONDA|FORZA350|2025':Object.freeze({source:'https://hondanews.eu/eu/lv/motorcycles/media/pressreleases/492951/25ym-honda-forza-350-press-kit',region:'OEM published spec',cooling:'liquid',drive:'cvt',unsupported:["chain-sprockets"]}),
 'HONDA|ADV350|2025':Object.freeze({source:'https://hondanews.eu/gb/en/motorcycles/media/pressreleases/506410/25ym-honda-adv350-press-kit',region:'OEM published spec',cooling:'liquid',drive:'cvt',unsupported:["chain-sprockets"]}),
 'HONDA|C125|2025':Object.freeze({source:'https://hondanews.eu/eu/el/cars/media/pressreleases/525819/25ym-honda-super-cub-c125',region:'OEM published spec',cooling:'air',drive:'chain',unsupported:["coolant","drive-system-service","drive-belt","weights","slide-piece"]}),
 'HONDA|MONKEY125|2025':Object.freeze({source:'https://hondanews.eu/gb/en/cars/media/pressreleases/526071/25ym-honda-monkey-125',region:'OEM published spec',cooling:'air',drive:'chain',unsupported:["coolant","drive-system-service","drive-belt","weights","slide-piece"]}),
 'HONDA|CB125R|2026':Object.freeze({source:'https://hondanews.eu/eu/et/motorcycles/media/pressreleases/567258/26ym-honda-cb125r',region:'OEM published spec',cooling:'liquid',drive:'chain',unsupported:["drive-system-service","drive-belt","weights","slide-piece"]}),
 'HONDA|CB650R|2024':Object.freeze({source:'https://hondanews.eu/eu/lt/motorcycles/media/pressreleases/457025/24ym-honda-cb650r',region:'OEM published spec',cooling:'liquid',drive:'chain',unsupported:["drive-system-service","drive-belt","weights","slide-piece"]}),
 'HONDA|CBR650R|2026':Object.freeze({source:'https://hondanews.eu/eu/lt/cars/media/pressreleases/548692/26ym-honda-cbr650r',region:'OEM published spec',cooling:'liquid',drive:'chain',unsupported:["drive-system-service","drive-belt","weights","slide-piece"]}),
 'YAMAHA|NMAX125|2025':Object.freeze({source:'https://www.yamaha-motor.eu/is/en/scooters/sport/pdp/nmax-125-2025/',region:'OEM published spec',cooling:'liquid',drive:'cvt',unsupported:["chain-sprockets"]}),
 'YAMAHA|XMAX300|2025':Object.freeze({source:'https://www.yamaha-motor.eu/is/en/scooters/sport/pdp/xmax-300-2025/',region:'OEM published spec',cooling:'liquid',drive:'cvt',unsupported:["chain-sprockets"]}),
 'YAMAHA|MT-07|2025':Object.freeze({source:'https://www.yamaha-motor.eu/kv/en/motorcycles/hyper-naked/pdp/mt-07-2025/',region:'OEM published spec',cooling:'liquid',drive:'chain',unsupported:["drive-system-service","drive-belt","weights","slide-piece"]}),
 'KAWASAKI|NINJA500|2024':Object.freeze({source:'https://content.kawasaki.com/en-us/products/ProductSpecSheetPDF/2024-ninja-500',region:'US Kawasaki 2024 official technical datasheet',cooling:'liquid',drive:'chain',unsupported:["drive-system-service","drive-belt","weights","slide-piece"]}),
 'KAWASAKI|Z500|2024':Object.freeze({source:'https://content.kawasaki.com/en-us/products/ProductSpecSheetPDF/2024-z500-abs',region:'US Kawasaki 2024 official technical datasheet',cooling:'liquid',drive:'chain',unsupported:["drive-system-service","drive-belt","weights","slide-piece"]}),
 'KAWASAKI|Z900|2025':Object.freeze({source:'https://storage.kawasaki.eu/repository/be/fr-BE/Accessoires/Kawasaki_Genuine_Chain_Kits_20251121.pdf',region:'OEM published spec',cooling:'unverified',drive:'chain',unsupported:["drive-system-service","drive-belt","weights","slide-piece"]}),
 'TRIUMPH|SPEED400|2025':Object.freeze({source:'https://www.triumphmotorcycles.com/motorcycles/classic/speed-400/specification',region:'OEM published spec',cooling:'liquid',drive:'chain',unsupported:["drive-system-service","drive-belt","weights","slide-piece"]}),
 'VESPA|PRIMAVERA125|2024':Object.freeze({source:'https://wlassets.vespa.com/wlassets/vespa/gb/tech_spec/2024/Vespa-Primavera-Tech-125/original/Vespa%2BPrimavera%2BTech%2B125.pdf',cooling:'air',drive:'cvt',unsupported:['coolant','chain-sprockets']}),
 'VESPA|SPRINT125|2024':Object.freeze({source:'https://wlassets.vespa.com/wlassets/vespa/master/APAC/tech_spec/2024/Sprint/Vespa_Sprint-S-125_technical_sheet_EN/original/Vespa_Sprint%2BS%2B125_technical_sheet_EN.pdf',cooling:'air',drive:'cvt',unsupported:['coolant','chain-sprockets']}),
 'VESPA|GTS300|2024':Object.freeze({source:'https://wlassets.vespa.com/wlassets/vespa/master/APAC/tech_spec/2024/GTS-Super-Sport/APAC_Vespa_GTS_Super-Sport_300_technical_sheet_EN/original/APAC_Vespa_GTS_Super%2BSport_300_technical_sheet_EN.pdf',cooling:'liquid',drive:'cvt',unsupported:['chain-sprockets']}),
 'VESPA|GTV300|2023':Object.freeze({source:'https://press.piaggiogroup.com/en_EN/post/show/253279/new-vespa-gtv.html',cooling:'liquid',drive:'cvt',unsupported:['chain-sprockets']})
});
const officialProfiles=Object.freeze({
 'DUCATI|MONSTER|2025':Object.freeze({
  verified:true,coverage:'partial',region:'US Monster 937 MY25',modelCode:'Monster 937',year:2025,
  source:'https://www.ducati.com/us/en/bikes/monster/monster-937/insights',
  sourceType:'Ducati Monster 937 MY25 manufacturer engine oil change and valve check guidance',
  sourcePages:['Maintenance intervals','Testastretta 11 degrees'],
  // Ducati confirms 15,000 km oil change and 30,000 km valve clearance check.
  // 24 months is an overall SERVICE interval, not automatically an oil-change period.
  intervals:Object.freeze({oil:15000,'valve-clearance':30000}),
  tasks:Object.freeze({oil:{replaceKm:15000},'valve-clearance':{inspectKm:30000}}),
  actionByPart:Object.freeze({'valve-clearance':'inspect'})
 }),
 'HONDA|CB125R|2025':Object.freeze({
  verified:true,coverage:'partial',region:'HMEE CBF125NA 2025',modelCode:'CBF125NA',year:2025,
  source:'https://2rom-prd-data.hondamotopub.com/om/HMEE/CBF125NA%20%28CB125R%29/2025/CBF125NA-R_32K98B20_EN_WEB.pdf',
  sourceType:'Honda 2025 CBF125NA (CB125R) owner manual, factory maintenance schedule',
  sourcePages:[69,70,71],
  intervals:Object.freeze({oil:6000,'air-filter':18000,'spark-plug':12000,'chain-sprockets':1000}),
  tasks:Object.freeze({
   oil:{replaceKm:6000,firstReplaceKm:1000,firstRegularOdometerKm:6000,replaceMonths:12},
   'air-filter':{replaceKm:18000},
   'spark-plug':{inspectKm:6000,replaceKm:12000},
   'chain-sprockets':{inspectKm:1000},
   'brake-fluid':{replaceMonths:24},
   coolant:{replaceMonths:36},brake:{replaceWhenWorn:true},tire:{replaceWhenWorn:true}
  }),
  notes:Object.freeze({'oil-strainer':'Clean at 6000, 18000, 30000 km. Nonuniform first occurrence is recorded as a note, not yet auto-filled.'}),
  actionByPart:Object.freeze({'chain-sprockets':'inspect'})
 }),
 'HONDA|CB650R|2024':Object.freeze({
  verified:true,coverage:'partial',region:'HMEE ED/KO/U type, excludes alternate 6000-km market chart',modelCode:'CB650RA',year:2024,
  source:'https://2rom-prd-data.hondamotopub.com/om/HMEE/CBR650R/2024/CB650RA_CBR650RA-R%20OM%2032MKYB20_eng_WEB.pdf',
  sourceType:'Honda 2024 CB650RA/CBR650RA combined owner manual: KO/ED maintenance chart',
  sourcePages:[103,104],
  intervals:Object.freeze({oil:12000,filter:24000,'oil-filter':24000,'air-filter':24000,'spark-plug':24000,'valve-clearance':36000,'chain-sprockets':1000}),
  tasks:Object.freeze({
   oil:{replaceKm:12000,firstReplaceKm:1000,firstRegularOdometerKm:12000},
   filter:{replaceKm:24000,firstReplaceKm:1000,firstRegularOdometerKm:24000},
   'oil-filter':{replaceKm:24000,firstReplaceKm:1000,firstRegularOdometerKm:24000},
   'air-filter':{replaceKm:24000},'spark-plug':{replaceKm:24000},
   'valve-clearance':{inspectKm:36000},
   'chain-sprockets':{inspectKm:1000},
   'brake-fluid':{replaceMonths:24},coolant:{replaceMonths:36},
   brake:{replaceWhenWorn:true},tire:{replaceWhenWorn:true}
  }),
  actionByPart:Object.freeze({'valve-clearance':'inspect','chain-sprockets':'inspect'})
 }),
 'HONDA|CBR650R|2024':Object.freeze({
  verified:true,coverage:'partial',region:'HMEE ED/KO/U type, excludes alternate 6000-km market chart',modelCode:'CBR650RA',year:2024,
  source:'https://2rom-prd-data.hondamotopub.com/om/HMEE/CBR650R/2024/CB650RA_CBR650RA-R%20OM%2032MKYB20_eng_WEB.pdf',
  sourceType:'Honda 2024 CB650RA/CBR650RA combined owner manual: KO/ED maintenance chart',
  sourcePages:[103,104],
  intervals:Object.freeze({oil:12000,filter:24000,'oil-filter':24000,'air-filter':24000,'spark-plug':24000,'valve-clearance':36000,'chain-sprockets':1000}),
  tasks:Object.freeze({
   oil:{replaceKm:12000,firstReplaceKm:1000,firstRegularOdometerKm:12000},
   filter:{replaceKm:24000,firstReplaceKm:1000,firstRegularOdometerKm:24000},
   'oil-filter':{replaceKm:24000,firstReplaceKm:1000,firstRegularOdometerKm:24000},
   'air-filter':{replaceKm:24000},'spark-plug':{replaceKm:24000},
   'valve-clearance':{inspectKm:36000},
   'chain-sprockets':{inspectKm:1000},
   'brake-fluid':{replaceMonths:24},coolant:{replaceMonths:36},
   brake:{replaceWhenWorn:true},tire:{replaceWhenWorn:true}
  }),
  actionByPart:Object.freeze({'valve-clearance':'inspect','chain-sprockets':'inspect'})
 }),
 'YAMAHA|MT-07|2021':Object.freeze({
  verified:true,coverage:'partial',region:'US MT07M/MT07MC Yamaha 2021',modelCode:'MT07M',year:2021,
  source:'https://library.ymcapps.net/library/om/contents/html/10/BAT-28199-10_02/7-4.html',
  sourceText:'https://www.ysk.co.kr/support/manual.php?boardid=manual&category=&idx=44&mode=view&offset=20&sk=&sw=',
  sourceType:'Yamaha factory 2021 MT-07 general maintenance and lubrication chart',
  sourcePages:['7-4','7-5'],
  // Verified chart fields only; engine-oil schedule omitted until full model-year table is checked.
  intervals:Object.freeze({'air-filter':37000,'chain-sprockets':1000}),
  tasks:Object.freeze({
   'air-filter':{replaceKm:37000},
   'chain-sprockets':{inspectKm:1000},
   'brake-hose':{replaceMonths:48},
   'brake-fluid':{replaceMonths:24},
   brake:{replaceWhenWorn:true},tire:{replaceWhenWorn:true}
  }),
  actionByPart:Object.freeze({'chain-sprockets':'inspect'})
 }),
 'HONDA|REBEL500|2025':Object.freeze({
  verified:true,coverage:'partial',region:'HMEE CMX500A/A2',modelCode:'CMX500A',year:2025,
  source:'https://2rom-prd-data.hondamotopub.com/om/HMEE/CMX500/2025/CMX500A_OM_32MLHB10_ENG_web.pdf',
  sourceType:'Honda CMX500A/A2 2025 owner manual maintenance schedule',sourcePages:[49,50,51],
  intervals:Object.freeze({oil:12000,filter:24000,'oil-filter':24000,'air-filter':24000,'spark-plug':24000,'valve-clearance':24000,'chain-sprockets':1000}),
  tasks:Object.freeze({
   oil:{replaceKm:12000,firstReplaceKm:1000,firstRegularOdometerKm:12000},
   filter:{replaceKm:24000,firstReplaceKm:1000,firstRegularOdometerKm:24000},
   'oil-filter':{replaceKm:24000,firstReplaceKm:1000,firstRegularOdometerKm:24000},
   'air-filter':{replaceKm:24000},'spark-plug':{replaceKm:24000},
   'valve-clearance':{inspectKm:24000},'chain-sprockets':{inspectKm:1000},
   'brake-fluid':{replaceMonths:24},coolant:{replaceMonths:36},
   brake:{inspectKm:12000,replaceWhenWorn:true},tire:{inspectKm:12000,replaceWhenWorn:true}
  }),
  actionByPart:Object.freeze({'valve-clearance':'inspect','chain-sprockets':'inspect'})
 }),
 'BMW|G310R|2020':Object.freeze({
  verified:true,coverage:'partial',region:'BMW international 03/2020 rider manual',modelCode:'0G41',year:2020,
  source:'https://manuals.bmw-motorrad.com/manuals/BA-Extern/IN/BA-INTERNET-COM/PDF/G_0G41_RM_0320_01.pdf',
  sourceType:'BMW G 310 R riders manual revision 03/2020: service schedule',sourcePages:[136,137,138],
  intervals:Object.freeze({oil:10000,filter:10000,'oil-filter':10000,'air-filter':20000,'spark-plug':20000,'valve-clearance':20000}),
  tasks:Object.freeze({
   oil:{replaceKm:10000},filter:{replaceKm:10000},'oil-filter':{replaceKm:10000},
   'air-filter':{replaceKm:20000},'spark-plug':{replaceKm:20000},
   'valve-clearance':{inspectKm:20000},'brake-fluid':{replaceMonths:24}
  }),
  specs:Object.freeze({runningInServiceKmRange:[500,1200]}),
  notes:Object.freeze({initialService:'500~1200km 최초 길들이기 정비, 오일 포함; 정비시점 범위로 자동 단일 교체값 미설정',initialBrakeFluid:'first after one year, then every two years; first-year calendar not auto calculated'}),
  actionByPart:Object.freeze({'valve-clearance':'inspect'})
 }),
 'BMW|R1300GS|2024':Object.freeze({
  verified:true,coverage:'partial',region:'BMW international 02/2023 manual for launch generation',modelCode:'0M21',year:2024,
  source:'https://manuals.bmw-motorrad.com/manuals/BA-Extern/IN/BA-INTERNET-COM/PDF/R_0M21_RM_0223_01.pdf',
  sourceType:'BMW R 1300 GS riders manual revision 02/2023: maintenance schedule',sourcePages:[280,281,282],
  intervals:Object.freeze({oil:10000,filter:10000,'oil-filter':10000,'air-filter':20000,'spark-plug':20000,'valve-clearance':20000}),
  tasks:Object.freeze({
   oil:{replaceKm:10000},filter:{replaceKm:10000},'oil-filter':{replaceKm:10000},
   'air-filter':{replaceKm:20000},'spark-plug':{replaceKm:20000},
   'valve-clearance':{inspectKm:20000},'brake-fluid':{replaceMonths:24}
  }),
  specs:Object.freeze({runningInServiceKmRange:[500,1250]}),
  notes:Object.freeze({initialService:'First running-in service 500~1250km, including oil and filter',initialBrakeFluid:'first at one year, then every two years; first-year calendar not auto calculated'}),
  actionByPart:Object.freeze({'valve-clearance':'inspect'})
 }),
 'HONDA|CT125|2026':Object.freeze({
  verified:true,coverage:'partial',region:'JP 8BJ-JA65 (frame JA65-1200001+)',modelCode:'JA65',year:2026,
  source:'https://www.honda.co.jp/customer/motor/ct125/faq/qa009/',
  sourceText:'https://www.honda.co.jp/customer/motor/ct125/faq/qa010/',
  sourceType:'Honda Japan CT125 2026 JA65 model-specific official owner FAQ; oil and replaceable filter',
  sourcePages:['Honda JP qa009','Honda JP qa010'],
  intervals:Object.freeze({oil:3000,filter:12000,'oil-filter':12000}),
  tasks:Object.freeze({
   oil:{replaceKm:3000,firstReplaceMonths:1,firstReplaceKm:1000,firstRegularOdometerKm:4000,replaceMonths:12},
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
   oil:{replaceKm:3000,firstReplaceMonths:1,firstReplaceKm:1000,firstRegularOdometerKm:4000,replaceMonths:12},
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
   oil:{replaceKm:3000,firstReplaceMonths:1,firstReplaceKm:1000,firstRegularOdometerKm:4000,replaceMonths:12},
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

// Model-by-model source audit. These references establish that a manufacturer document
// or manufacturer statement exists, NOT that its replacement/inspection chart has
// been validated. Only exact brand|model|year keys in officialProfiles are automatable.
const sourceAudit=Object.freeze({
 'ZONTES|125D':Object.freeze({year:2025,url:'https://www.zontes.co.kr/home/125d/',type:'Zontes Korea official specifications; maintenance intervals not verified'}),
 'ZONTES|125G1':Object.freeze({year:2024,url:'https://www.zontes.co.kr/home/downloads/?order_by=fn_hit&order_type=asc&vid=1',type:'Zontes Korea combined G1/U1/GK manual; exact-year maintenance not verified'}),
 'DNA MOTORS|UHR125':Object.freeze({year:2025,url:'https://www.dnamotors.co.kr/brand/scooter_UHR125',type:'DNA Motors official product specifications; maintenance schedule not verified'}),
 'HONDA|CB125R':Object.freeze({year:2025,url:'https://www.hondamotopub.com/om/HMEE/CBF125NA%20%28CB125R%29/2025',type:'Honda owner manual listing'}),
 'HONDA|CB650R':Object.freeze({year:2025,url:'https://www.hondamotopub.com/model/THM/MKY251',type:'Honda 2025 CB650R/CBR650R manual catalog'}),
 'HONDA|CBR650R':Object.freeze({year:2025,url:'https://www.hondamotopub.com/model/THM/MKY251',type:'Honda 2025 CB650R/CBR650R manual catalog'}),
 'YAMAHA|MT-03':Object.freeze({year:2021,url:'https://www.ysk.co.kr/support/manual.php?boardid=manual&category=&offset=20&sk=&sw=',type:'Yamaha Korea 2021 manual listing'}),
 'YAMAHA|YZF-R3':Object.freeze({year:2021,url:'https://www.ysk.co.kr/support/manual.php?boardid=manual&category=&idx=48&mode=view&offset=20&sk=&sw=',type:'Yamaha Korea 2021 owner manual'}),
 'YAMAHA|MT-07':Object.freeze({year:2021,url:'https://www.ysk.co.kr/support/manual.php?boardid=manual&category=&idx=44&mode=view&offset=20&sk=&sw=',type:'Yamaha Korea 2021 owner manual'}),
 'YAMAHA|TMAX560':Object.freeze({year:2022,url:'https://www.ysk.co.kr/support/manual.php?boardid=manual&category=&offset=20&sk=&sw=',type:'Yamaha Korea 2022–2024 owner manual listing'}),
 'KAWASAKI|NINJA500':Object.freeze({year:2024,url:'https://kawasakikorea.com/ownersmanual',type:'Kawasaki Korea Korean-language Ninja 500 2024+ owner manual; maintenance chart requires row-by-row verification'}),
 'KAWASAKI|Z500':Object.freeze({year:2024,url:'https://www.kawasaki.com/en-us/owner-center/service-manuals/2024/ER500ERFNL',type:'Kawasaki US 2024 owner manual listing; Malaysia service package is market-specific, not auto-applied'}),
 'KAWASAKI|Z900':Object.freeze({year:2025,url:'https://www.kawasaki.com/en-us/owner-center/service-manuals/2025/ZR900SSFAL',type:'Kawasaki US 2025 owner manual listing'}),
 'TRIUMPH|SPEED400':Object.freeze({year:2024,url:'https://www.triumphmotorcycles.com/for-the-ride/news/motorcycles/t-series-q-and-a-2024-03-28',type:'Triumph T-Series official general service interval 16000 km or 12 months; not a part schedule'})
});
const researchInventory=Object.freeze(brands.flatMap(brand=>brand.models.map(([model])=>{
 const key=brand.id+'|'+model;
 const years=Object.keys(expandedOfficialProfiles).filter(x=>x.startsWith(key+'|'))
  .map(x=>Number(x.slice(key.length+1))).filter(Number.isFinite).sort((a,b)=>a-b);
 const manual=sourceAudit[key]||null;
 const familyEvidence=modelFamilyPartEvidence[key]||null;
 const partYears=Object.keys(verifiedPartApplicability).filter(x=>x.startsWith(key+'|'))
  .map(x=>Number(x.slice(key.length+1))).filter(Number.isFinite).sort((a,b)=>a-b);
 const first=knownFirstModelYears[key]||null;
 return Object.freeze({brand:brand.id,model,verifiedYears:Object.freeze(years),manual,
  firstConfirmedYear:first,lastConfirmedYear:null,releaseSource:modelReleaseSources[key]||null,
  verifiedPartYears:Object.freeze(partYears),partEvidence:familyEvidence,
  partsStatus:partYears.length?'verified-exact-year':familyEvidence?'family-reference-needs-year-check':'verification-pending',
  serviceStatus:years.length?'verified-exact-year':'verification-pending',
  status:years.length?'verified-year-profiles':manual?'manual-found-not-verified':'verification-pending'});
})));
// Canonical app part IDs: 'filter' is the visible AIR filter card and
// 'oil-filter' is the independent engine-oil filter card. Earlier profiles
// sometimes used 'filter' for an oil filter; normalize without moving user records.
const oilFilterAliasKeys=new Set([
 'HONDA|ADV350|2025','HONDA|FORZA350|2025','HONDA|CT125|2026',
 'HONDA|C125|2022','HONDA|C125|2026','HONDA|SUPER CUB110|2022',
 'YAMAHA|XMAX300|2025'
]);
const canonicalOfficialProfiles=Object.freeze(Object.fromEntries(
 Object.entries(expandedOfficialProfiles).map(([key,profile])=>{
  const tasks={...(profile.tasks||{})},intervals={...(profile.intervals||{})};
  const actionByPart={...(profile.actionByPart||{})};
  const previousFilter=tasks.filter,previousInterval=intervals.filter;
  const oilAlias=oilFilterAliasKeys.has(key)||!!tasks['oil-filter'];
  if(oilAlias){
   if(previousFilter&&!tasks['oil-filter'])tasks['oil-filter']=previousFilter;
   if(Number.isSafeInteger(previousInterval)&&!intervals['oil-filter'])intervals['oil-filter']=previousInterval;
   delete tasks.filter;delete intervals.filter;
   delete actionByPart.filter;
  }
  // The display's air-filter card uses 'filter' even when a source profile
  // originally labelled it 'air-filter'. Do not create duplicate alerts.
  if(tasks['air-filter']){
   tasks.filter=tasks['air-filter'];delete tasks['air-filter'];
   if(Number.isSafeInteger(intervals['air-filter']))intervals.filter=intervals['air-filter'];
   delete intervals['air-filter'];delete actionByPart['air-filter'];
  }
  return [key,Object.freeze({...profile,
   tasks:Object.freeze(tasks),intervals:Object.freeze(intervals),
   actionByPart:Object.freeze(actionByPart)})];
 })
));
const profileKey=(brand,model,year)=>[String(brand).trim().toUpperCase(),String(model).trim().toUpperCase(),String(year)].join('|');
window.MotorcycleCatalog=Object.freeze({
 brands,
 officialProfiles:canonicalOfficialProfiles,
 researchInventory,
 findResearchStatus(brand,model){return researchInventory.find(x=>x.brand===String(brand).trim().toUpperCase()&&x.model===String(model).trim().toUpperCase())||null},
 profileKey,
 brandLogos,
 knownFirstModelYears,
 modelReleaseSources,
 verifiedPartApplicability,
 modelFamilyPartEvidence,
 findModelFamilyPartEvidence(brand,model){return modelFamilyPartEvidence[String(brand).trim().toUpperCase()+'|'+String(model).trim().toUpperCase()]||null},
 findVerifiedPartApplicability(brand,model,year){
  const record=verifiedPartApplicability[profileKey(brand,model,year)]||null;
  return record?.variantMatchRequired?null:record;
 },
 findPartEvidenceForYear(brand,model,year){return verifiedPartApplicability[profileKey(brand,model,year)]||null},
 getModelResearch(brand,model){return researchInventory.find(x=>x.brand===String(brand).trim().toUpperCase()&&x.model===String(model).trim().toUpperCase())||null},
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
  const value=canonicalOfficialProfiles[profileKey(brand,model,year)];
  return value&&value.verified===true&&value.source?value:null;
 }
});
})();
