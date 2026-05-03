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
    raw_preview: raw.slice(0, 1000)
  }, null, 2));
  process.exit(0);
}

const out = {
  ok: Boolean(json),
  result: json && json.result || null,
  dry_run: json && json.dry_run,
  candidate_count: json && json.candidate_count || 0,
  executed_count: json && json.executed_count || 0,
  failed_count: json && json.failed_count || 0,
  first_request_body: json && json.executed && json.executed[0] && json.executed[0].request_body || null,
  failed: json && json.failed || []
};

console.log(JSON.stringify(out, null, 2));
