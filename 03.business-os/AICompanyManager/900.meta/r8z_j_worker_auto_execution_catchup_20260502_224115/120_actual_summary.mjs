import fs from 'node:fs';

const path = process.argv[2];
const raw = fs.existsSync(path) ? fs.readFileSync(path, 'utf8').trim() : '';
let json = null;

try {
  json = raw ? JSON.parse(raw) : null;
} catch (error) {
  console.log(JSON.stringify({
    ok: false,
    parse_error: error.message,
    raw_preview: raw.slice(0, 1500)
  }, null, 2));
  console.log('ACTUAL_RESULT=parse_error');
  console.log('ACTUAL_EXECUTED_COUNT=0');
  console.log('ACTUAL_FAILED_COUNT=0');
  process.exit(0);
}

const out = {
  ok: Boolean(json),
  result: json && json.result || null,
  dry_run: json && json.dry_run,
  candidate_count: json && json.candidate_count || 0,
  executed_count: json && json.executed_count || 0,
  failed_count: json && json.failed_count || 0,
  executed_preview: json && json.executed ? json.executed.slice(0, 3).map((row) => ({
    aicm_worker_work_unit_id: row.aicm_worker_work_unit_id,
    result: row.result,
    source_request_ref: row.request_body && row.request_body.source_request_ref,
    runtime_result: row.runtime_result && row.runtime_result.result
  })) : [],
  failed: json && json.failed || []
};

console.log(JSON.stringify(out, null, 2));
console.log('ACTUAL_RESULT=' + String(out.result || 'null'));
console.log('ACTUAL_EXECUTED_COUNT=' + String(out.executed_count || 0));
console.log('ACTUAL_FAILED_COUNT=' + String(out.failed_count || 0));
