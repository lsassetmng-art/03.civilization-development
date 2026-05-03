import fs from 'node:fs';

const responsePath = process.argv[2];
const raw = responsePath && fs.existsSync(responsePath) ? fs.readFileSync(responsePath, 'utf8').trim() : '';

let json = null;
try {
  json = raw ? JSON.parse(raw) : null;
} catch (error) {
  console.log(JSON.stringify({
    parse_ok: false,
    parse_error: error.message,
    raw_preview: raw.slice(0, 2000)
  }, null, 2));
  process.exit(0);
}

const failed = Array.isArray(json?.failed) ? json.failed : [];
const executed = Array.isArray(json?.executed) ? json.executed : [];

const errors = failed.map((row) => ({
  aicm_worker_work_unit_id: row.aicm_worker_work_unit_id || null,
  result: row.result || null,
  error_message: row.error_message || null
}));

const out = {
  parse_ok: true,
  result: json?.result || null,
  candidate_count: json?.candidate_count || 0,
  executed_count: json?.executed_count || 0,
  failed_count: json?.failed_count || 0,
  executed_preview: executed.slice(0, 3),
  failed_errors: errors
};

console.log(JSON.stringify(out, null, 2));

let category = 'UNKNOWN';
const joined = errors.map((e) => String(e.error_message || '')).join('\n').toLowerCase();

if (joined.includes('fetch failed') || joined.includes('econnrefused') || joined.includes('connection refused')) {
  category = 'AIWORKEROS_SERVER_NOT_REACHABLE';
} else if (joined.includes('401') || joined.includes('unauthorized') || joined.includes('forbidden') || joined.includes('403')) {
  category = 'AIWORKEROS_AUTH_OR_TOKEN_FAILURE';
} else if (joined.includes('404') || joined.includes('not found')) {
  category = 'AIWORKEROS_ENDPOINT_NOT_FOUND';
} else if (joined.includes('timeout') || joined.includes('timed out')) {
  category = 'AIWORKEROS_TIMEOUT';
} else if (joined.includes('model') || joined.includes('robot') || joined.includes('worker')) {
  category = 'AIWORKEROS_PAYLOAD_OR_MODEL_REJECTED';
}

console.log('FAILURE_CATEGORY=' + category);
