import fs from 'node:fs';

const path = process.argv[2];
const raw = fs.readFileSync(path, 'utf8');
const json = JSON.parse(raw);

function countArray(name) {
  return Array.isArray(json[name]) ? json[name].length : 0;
}

const out = {
  result: json.result || null,
  pmlw_middle_items: countArray('pmlw_middle_items'),
  pmlw_deliverable_requirements: countArray('pmlw_deliverable_requirements'),
  pmlw_worker_work_units: countArray('pmlw_worker_work_units'),
  pmlw_workflow_tree: countArray('pmlw_workflow_tree')
};

console.log(JSON.stringify(out, null, 2));

if (out.pmlw_middle_items < 1 || out.pmlw_deliverable_requirements < 1 || out.pmlw_worker_work_units < 1) {
  console.error('ERROR: context API itself no longer returns expected child arrays');
  process.exit(1);
}
