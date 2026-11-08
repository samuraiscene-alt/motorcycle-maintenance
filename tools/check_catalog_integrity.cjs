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
console.log('PASS: ' + pairs.length + ' models, ' + keys.length + ' exact-year official profiles for ' + modelSet.size + ' models; regional isolation verified');
