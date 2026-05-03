import fs from 'node:fs';

const path = process.argv[2];
const json = JSON.parse(fs.readFileSync(path, 'utf8'));

function arr(name) {
  return Array.isArray(json[name]) ? json[name] : [];
}

const workerUnits = arr('pmlw_worker_work_units');
const latest = workerUnits
  .slice()
  .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')));

const summary = {
  result: json.result || null,
  worker_work_unit_count: workerUnits.length,
  in_progress_count: workerUnits.filter((r) => String(r.work_status_code || '') === 'in_progress').length,
  todo_count: workerUnits.filter((r) => String(r.work_status_code || '') === 'todo').length,
  auto_execution_count: workerUnits.filter((r) => {
    const meta = r.metadata_jsonb || {};
    return String(meta.auto_execution || '') === 'worker_runtime_request';
  }).length,
  latest_worker_work_units: latest.slice(0, 5).map((r) => ({
    id: r.aicm_worker_work_unit_id,
    name: r.work_unit_name,
    worker: r.assigned_worker_label,
    model: r.worker_model_code,
    work_status_code: r.work_status_code,
    review_status_code: r.review_status_code,
    auto_execution: r.metadata_jsonb && r.metadata_jsonb.auto_execution,
    auto_execution_version: r.metadata_jsonb && r.metadata_jsonb.auto_execution_version,
    runtime_result: r.metadata_jsonb && r.metadata_jsonb.runtime_result && r.metadata_jsonb.runtime_result.result,
    updated_at: r.updated_at
  }))
};

console.log(JSON.stringify(summary, null, 2));
