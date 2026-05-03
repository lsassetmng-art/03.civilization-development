import fs from 'node:fs';

const path = process.argv[2];
const raw = fs.readFileSync(path, 'utf8');

let json;
try {
  json = JSON.parse(raw);
} catch (error) {
  console.error('ERROR: context is not JSON');
  console.error(raw.slice(0, 1000));
  process.exit(1);
}

const keys = Object.keys(json).sort();

function arr(name) {
  return Array.isArray(json[name]) ? json[name] : [];
}

function first(name) {
  const rows = arr(name);
  return rows.length ? rows[0] : null;
}

const out = {
  result: json.result || null,
  keys,
  counts: {
    pmlw_major_items: arr('pmlw_major_items').length,
    manager_major_items: arr('manager_major_items').length,
    major_items: arr('major_items').length,
    pmlw_middle_items: arr('pmlw_middle_items').length,
    pmlw_deliverable_requirements: arr('pmlw_deliverable_requirements').length,
    pmlw_worker_work_units: arr('pmlw_worker_work_units').length,
    pmlwMiddleItems: arr('pmlwMiddleItems').length,
    pmlwDeliverableRequirements: arr('pmlwDeliverableRequirements').length,
    pmlwWorkerWorkUnits: arr('pmlwWorkerWorkUnits').length
  },
  samples: {
    pmlw_middle_items: first('pmlw_middle_items'),
    pmlw_deliverable_requirements: first('pmlw_deliverable_requirements'),
    pmlw_worker_work_units: first('pmlw_worker_work_units')
  }
};

console.log(JSON.stringify(out, null, 2));

const middle = out.counts.pmlw_middle_items + out.counts.pmlwMiddleItems;
const req = out.counts.pmlw_deliverable_requirements + out.counts.pmlwDeliverableRequirements;
const worker = out.counts.pmlw_worker_work_units + out.counts.pmlwWorkerWorkUnits;

if (middle === 0 && req === 0 && worker === 0) {
  console.log('CONCLUSION_HINT=context_has_no_child_outputs');
} else {
  console.log('CONCLUSION_HINT=context_has_child_outputs_ui_filter_or_render_issue');
}
