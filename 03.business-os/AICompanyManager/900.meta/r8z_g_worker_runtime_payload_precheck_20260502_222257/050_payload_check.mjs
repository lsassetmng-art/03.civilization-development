import fs from 'node:fs';

const path = process.argv[2];
const raw = fs.readFileSync(path, 'utf8').trim();

if (!raw) {
  console.error('ERROR: payload file is empty');
  process.exit(1);
}

let json;
try {
  json = JSON.parse(raw);
} catch (error) {
  console.error('ERROR: payload is not JSON');
  console.error(raw);
  process.exit(1);
}

const body = json.request_body_candidate || {};
const placement = json.selected_worker_placement || null;
const unit = json.worker_work_unit || {};

const checks = {
  endpoint: json.endpoint === '/api/aicm/v2/worker-runtime/request',
  has_worker_work_unit_id: Boolean(unit.aicm_worker_work_unit_id),
  has_placement: Boolean(placement && placement.aicm_user_company_worker_placement_id),
  has_placement_id_in_body: Boolean(body.aicm_user_company_worker_placement_id),
  has_model_code: Boolean(body.model_code),
  has_title: Boolean(body.title),
  has_instruction: Boolean(body.instruction),
  has_source_request_ref: Boolean(body.source_request_ref)
};

const ok = Object.values(checks).every(Boolean);

console.log(JSON.stringify({
  ok,
  checks,
  selected_worker_placement: placement,
  request_body_candidate: body
}, null, 2));

if (!ok) {
  console.error('ERROR: runtime payload candidate is incomplete');
  process.exit(1);
}
