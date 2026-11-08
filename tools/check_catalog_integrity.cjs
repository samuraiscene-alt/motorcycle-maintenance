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
const vehicleSource = fs.readFileSync(path.join(root,'ui-skeleton/vehicle-data.js'),'utf8');
assert.ok(vehicleSource.includes("label='2026 혼다 해외형 참고 · 국내형 확인 필요'"),
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
console.log('PASS: ' + pairs.length + ' models, ' + keys.length + ' exact-year official profiles for ' + modelSet.size + ' models; regional isolation verified');
