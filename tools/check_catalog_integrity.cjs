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

const vehicleSource = fs.readFileSync(path.join(root,'ui-skeleton/vehicle-data.js'),'utf8');
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
