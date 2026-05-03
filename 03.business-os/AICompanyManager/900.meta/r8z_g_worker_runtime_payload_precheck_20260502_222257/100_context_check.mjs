import fs from 'node:fs';

const path = process.argv[2];
const raw = fs.readFileSync(path, 'utf8');
const json = JSON.parse(raw);

function arr(name) {
  return Array.isArray(json[name]) ? json[name] : [];
}

const workers = arr('pmlw_worker_work_units');
const placements = arr('placements');

const out = {
  result: json.result || null,
  worker_work_units: workers.length,
  placements: placements.length,
  active_worker_placements: placements.filter((row) => {
    const role = String(row.role_code || '').toLowerCase();
    const status = String(row.status_code || '').toLowerCase();
    return role === 'worker' && status === 'active';
  }).length,
  first_worker_work_unit: workers[0] || null
};

console.log(JSON.stringify(out, null, 2));

if (out.worker_work_units < 1) {
  console.error('ERROR: context has no pmlw_worker_work_units');
  process.exit(1);
}
