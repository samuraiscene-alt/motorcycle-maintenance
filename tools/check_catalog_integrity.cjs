'use strict';
/* Read-only test: validate the 44-model catalogue and exact-year official profiles. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const file = fs.readFileSync(path.join(root, 'ui-skeleton/vehicle-catalog.js'), 'utf8');
const context = {window: {}};
vm.runInNewContext(file, context, {filename: 'vehicle-catalog.js', timeout: 5000});
const catalog = context.window.MotorcycleCatalog;
assert.ok(catalog, 'MotorcycleCatalog must be exposed');
const pairs = catalog.brands.flatMap(b => b.models.map(m => b.id + '|' + m[0]));
assert.equal(pairs.length, 44, '44 unique selectable motorcycles');
assert.equal(new Set(pairs).size, 44, 'no duplicate model definitions');
assert.equal(catalog.researchInventory.length, 44, 'research inventory covers all models');
for (const row of catalog.researchInventory) {
  assert.ok(pairs.includes(row.brand + '|' + row.model), 'research references registered model');
}
const keys = Object.keys(catalog.officialProfiles);
let modelSet = new Set();
for (const key of keys) {
  const [brand, model, year] = key.split('|');
  assert.ok(pairs.includes(brand + '|' + model), 'official profile model belongs to catalog: ' + key);
  assert.match(year, /^20\d{2}$/, 'official profile year must be exact: ' + key);
  const profile = catalog.findOfficialProfile(brand, model, Number(year));
  assert.ok(profile, 'official profile lookup must succeed: ' + key);
  assert.equal(profile.verified, true, 'official flag required: ' + key);
  assert.match(profile.source, /^https:\/\//, 'official source URL required: ' + key);
  modelSet.add(brand + '|' + model);
}
assert.equal(catalog.findOfficialProfile('SUZUKI', 'ADDRESS125', 2025), null,
  'regional Address specification must not become unverified automatic service cycles');
assert.ok(catalog.findModelTechnicalVariant('SUZUKI', 'ADDRESS125', 2025, 'EU-UZ125NEWM6'),
  'EU Address specification must stay independently retrievable');
assert.equal(catalog.findOfficialProfile('HONDA', 'PCX125', 1990), null,
  'unverified model year must not silently inherit other-year service intervals');

const avenis = catalog.findOfficialProfile('SUZUKI', 'AVENIS125', 2023);
assert.equal(avenis?.modelCode, 'UN125NE', 'Korean Avenis profile must be specific');
assert.equal(avenis?.tasks?.oil?.replaceKm, 4000, 'Korean Avenis oil change interval');
assert.equal(avenis?.tasks?.oil?.firstReplaceKm, 1000, 'Korean Avenis first oil change');
assert.equal(avenis?.tasks?.['oil-strainer']?.firstInspectKm, 1000,
  'Korean Avenis oil strainer first inspection, not a false oil filter replacement');
assert.equal(avenis?.tasks?.['drive-belt']?.replaceKm, 20000,
  'Belt-only replacement must stay separate from the combined roller card');
assert.equal(avenis?.tasks?.['gear-oil']?.replaceKm, 8000,
  'Avenis final reduction gear oil period');
assert.equal(catalog.findOfficialProfile('SUZUKI', 'AVENIS125', 2025), null,
  'Do not copy Korean 2023 data into other years without a shared manual');
assert.equal(catalog.findOfficialProfile('YAMAHA', 'MT-07', 2023), null,
  'Thai-market MT-07 schedule cannot apply to Korean registration by year alone');
assert.equal(catalog.findScheduleReference('YAMAHA','MT-07')?.autoApply, false,
  'Thai-market MT-07 data must remain a non-automatic reference');

const pcx26 = catalog.findOfficialProfile('HONDA','PCX125',2026);
assert.equal(pcx26?.regionalApplicabilityUnverified, true,
  '2026 PCX must retain explicit overseas-reference caveat');
assert.equal(pcx26?.tasks?.oil?.firstReplaceKm,1000,'2026 PCX first oil change');
assert.equal(pcx26?.tasks?.oil?.firstRegularOdometerKm,6000,'2026 PCX next oil milestone');
assert.equal(pcx26?.tasks?.filter?.replaceKm,18000,'2026 PCX air-cleaner element');
assert.equal(pcx26?.tasks?.['drive-belt']?.inspectKm,12000,'2026 PCX belt inspection');
assert.equal(pcx26?.tasks?.['drive-belt']?.replaceKm,24000,'2026 PCX belt replacement');
assert.equal(pcx26?.tasks?.['oil-strainer']?.cleanKm,12000,'2026 PCX oil screen cleaning');
assert.equal(pcx26?.tasks?.['gear-oil']?.replaceMonths,24,'2026 PCX final-drive oil');
assert.equal(pcx26?.tasks?.['brake-fluid']?.replaceMonths,24,'2026 PCX brake fluid');
assert.equal(pcx26?.tasks?.coolant?.replaceMonths,36,'2026 PCX coolant');
assert.equal(pcx26?.tasks?.['oil-filter'],undefined,'no false PCX cartridge oil filter');
assert.ok(catalog.findVerifiedPartApplicability('HONDA','PCX125',2026)?.unsupported.includes('oil-filter'),
  'hide only confirmed absent factory oil filter, retaining user records');
assert.ok(catalog.findOfficialProfile('HONDA','PCX125',2025),
  '2025 Korean profile preserved');
// The official lookup remains exact, while the UI may reuse near-year cycles
// in an explicitly marked, provisional same-generation window.
assert.equal(catalog.findOfficialProfile('HONDA','CBR650R',2026),null,
  'exact 2026 CBR650R manual not independently validated');
const nearby=catalog.findMaintenanceProfile('HONDA','CBR650R',2026);
assert.equal(nearby?.sourceYear,2024,'2026 CBR650R adopts 2024 reference as estimate');
assert.equal(nearby?.inheritedServiceCycle,true,'near-year cycle must be identified as inferred');
assert.equal(nearby?.tasks?.oil?.replaceKm,12000,'same-generation nearby oil schedule');
assert.equal(catalog.findMaintenanceProfile('HONDA','CBR650R',2024)?.inheritedServiceCycle,undefined,
  'exact-year official documentation is never tagged inherited');
assert.equal(catalog.findMaintenanceProfile('HONDA','C125',2025),null,
  'conflicting 2022 / 2026 model codes cannot be bridged');
assert.equal(catalog.findMaintenanceProfile('HONDA','PCX125',2010),null,
  'far-away model year must not pick unrelated modern intervals');
assert.equal(catalog.findMaintenanceProfile('BMW','R1300GS',2023),null,
  'must not adopt service schedules before confirmed first model year');
const vehicleSource = fs.readFileSync(path.join(root,'ui-skeleton/vehicle-data.js'),'utf8');
assert.ok(vehicleSource.includes("label='제조사 해외형 참고 · 국내형 확인 필요'"),
  '2026 overseas manual must be clearly labeled in maintenance cards');
const funcStart=vehicleSource.indexOf('function nextServiceDistance(');
const funcEnd=vehicleSource.indexOf('function actionCycleStatus(',funcStart);
assert.ok(funcStart>=0 && funcEnd>funcStart,'service cycle calculator must exist');
const compute=vm.runInNewContext(vehicleSource.slice(funcStart,funcEnd)+'; nextServiceDistance');
let first=compute({km:0},avenis.tasks['oil-strainer'],'inspect',{},8000,null);
assert.equal(first.due,1000,'new Avenis first strainer inspection should be at 1000');
let next=compute({km:0},avenis.tasks['oil-strainer'],'inspect',{},8000,{at:1000});
assert.equal(next.due,8000,'after first inspection, next one is 8000');
let custom=compute({km:0},avenis.tasks['oil-strainer'],'inspect',{inspectIntervalSource:'user'},9000,null);
assert.equal(custom.due,9000,'user-adjusted inspection interval must take precedence');

// Audit all declared exact-year profiles: never silently default another year's task.
for(const [key,profile] of Object.entries(catalog.officialProfiles)){
  const [brand,model,yearText] = key.split('|');
  assert.equal(catalog.findOfficialProfile(brand,model,Number(yearText)),profile,
    'exact model/year lookup must return its original profile');
  for(const [part,task] of Object.entries(profile.tasks||{})){
    assert.ok(task && typeof task==='object','bad task for '+key+' '+part);
    for(const [field,value] of Object.entries(task)){
      if(/^(replaceKm|inspectKm|cleanKm|firstReplaceKm|firstInspectKm|firstCleanKm|firstRegularOdometerKm|replaceMonths|inspectMonths|cleanMonths)$/.test(field)){
        assert.ok(Number.isSafeInteger(value)&&value>0, 'invalid service cycle '+key+'/'+part+'/'+field);
      }
    }
  }
  for(const [part,action] of Object.entries(profile.actionByPart||{})){
    assert.ok(['replace','inspect','clean'].includes(action),'invalid maintenance action '+key+'/'+part);
  }
}
assert.ok(vehicleSource.includes("const distanceLabel=overdue?actionText(action)+' 기준 '"),
  'inspection and cleaning overdue labels must never say replacement');
assert.ok(vehicleSource.includes("' · 최초 '+actionText(action)+' (이후 정기 '"),
  'initial inspection/cleaning label should not pretend to be replacement');
assert.ok(vehicleSource.includes('const initialDue=firstService?schedule.due:interval;'),
  'all initial maintenance types must use their actual first due distance');

// Registered vehicle header swipe uses the same persisted bike ID as Settings.
assert.ok(vehicleSource.includes("const ownedBikeIds=()=>bikes.filter(b=>!!registered[b.id]).map(b=>b.id);"),
  'header switcher must never include unregistered showroom demos');
assert.ok(vehicleSource.includes('localStorage.setItem(chosenKey,nextId)'),
  'header switcher must persist the selected vehicle');
assert.ok(vehicleSource.includes('renderInfo();\n return true;'),
  'header switcher must re-render vehicle-specific gauges and history');
assert.ok(vehicleSource.includes("if(Math.abs(dx)<50||Math.abs(dx)<Math.abs(dy)*1.35)return;"),
  'vehicle header switch must ignore vertical scrolling and accidental tiny swipes');
assert.ok(vehicleSource.includes("const nextId=ids[(current+direction+ids.length)%ids.length];"),
  'header switcher should wrap among registered bikes');
assert.ok(vehicleSource.includes("headerSwipeSuppressClick=false;e.preventDefault();e.stopImmediatePropagation()"),
  'header swipes should not open the edit-vehicle modal');
const htmlSource=fs.readFileSync(path.join(root,'ui-skeleton/index.html'),'utf8');
assert.match(htmlSource,/\.vehicle-lines\{position:absolute;[^}]*pointer-events:auto/,
 'header must accept pointer events; the old pointer-events:none broke iPhone swiping');
assert.match(htmlSource,/\.vehicle-lines\{position:absolute;[^}]*touch-action:pan-y/,
 'allow vertical scroll while recognizing horizontal header swipes');
console.log('PASS: ' + pairs.length + ' models, ' + keys.length + ' exact-year official profiles for ' + modelSet.size + ' models; regional isolation verified');
