import fs from 'node:fs';

const path = process.argv[2];
const raw = fs.readFileSync(path, 'utf8');
let json;

try {
  json = JSON.parse(raw);
} catch (error) {
  console.error('ERROR: API response is not JSON');
  console.error(raw);
  process.exit(1);
}

console.log(JSON.stringify({
  result: json.result || null,
  created_leader_middle_count: json.created_leader_middle_count ?? json.inserted_middle_count ?? null,
  created_deliverable_requirement_count: json.created_deliverable_requirement_count ?? json.inserted_requirement_count ?? null,
  created_worker_work_unit_count: json.created_worker_work_unit_count ?? json.inserted_worker_unit_count ?? null,
  updated_manager_count: json.updated_manager_count ?? null,
  skipped_count: json.skipped_count ?? null
}, null, 2));

if (json.result !== 'ok') {
  console.error('ERROR: API result is not ok');
  process.exit(1);
}
