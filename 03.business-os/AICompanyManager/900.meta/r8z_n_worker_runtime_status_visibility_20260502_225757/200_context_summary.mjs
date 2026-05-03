import fs from 'node:fs';

const path = process.argv[2];
let json = {};
try {
  json = JSON.parse(fs.readFileSync(path, 'utf8'));
} catch (error) {
  console.log(JSON.stringify({
    result: 'parse_error',
    error_message: error.message
  }, null, 2));
  process.exit(0);
}

const rows = Array.isArray(json.pmlw_worker_work_units) ? json.pmlw_worker_work_units : [];

function meta(row) {
  const m = row && row.metadata_jsonb || {};
  return m && typeof m === 'object' ? m : {};
}

const summary = {
  result: json.result || null,
  worker_work_unit_count: rows.length,
  todo_count: rows.filter((r) => String(r.work_status_code || '') === 'todo').length,
  in_progress_count: rows.filter((r) => String(r.work_status_code || '') === 'in_progress').length,
  auto_execution_count: rows.filter((r) => String(meta(r).auto_execution || '') === 'worker_runtime_request').length,
  r8z_i_count: rows.filter((r) => String(meta(r).auto_execution_version || '') === 'r8z_i').length,
  runtime_ok_count: rows.filter((r) => {
    const runtime = meta(r).runtime_result || {};
    return String(runtime.result || '') === 'ok';
  }).length,
  latest: rows
    .slice()
    .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
    .slice(0, 5)
    .map((r) => {
      const m = meta(r);
      const runtime = m.runtime_result || {};
      const request = runtime.runtime_request || {};
      const response = runtime.aiworker_response || {};
      return {
        id: r.aicm_worker_work_unit_id,
        name: r.work_unit_name,
        worker: r.assigned_worker_label,
        model: r.worker_model_code,
        work_status_code: r.work_status_code,
        review_status_code: r.review_status_code,
        auto_execution: m.auto_execution || null,
        auto_execution_version: m.auto_execution_version || null,
        runtime_result: runtime.result || null,
        request_id: request.request_id || response.request_id || null,
        aiworker_status: response.status || response.result || null,
        updated_at: r.updated_at
      };
    })
};

console.log(JSON.stringify(summary, null, 2));

console.log('WORKER_WORK_UNIT_COUNT=' + summary.worker_work_unit_count);
console.log('IN_PROGRESS_COUNT=' + summary.in_progress_count);
console.log('AUTO_EXECUTION_COUNT=' + summary.auto_execution_count);
console.log('R8Z_I_COUNT=' + summary.r8z_i_count);
console.log('RUNTIME_OK_COUNT=' + summary.runtime_ok_count);
