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
const officialProfiles=Object.freeze({});
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
