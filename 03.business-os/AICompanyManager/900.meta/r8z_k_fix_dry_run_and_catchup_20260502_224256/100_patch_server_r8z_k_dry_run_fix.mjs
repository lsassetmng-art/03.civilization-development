import fs from 'node:fs';

const serverPath = process.argv[2];
let text = fs.readFileSync(serverPath, 'utf8');

function count(src, needle) {
  return src.split(needle).length - 1;
}

const before = {
  r8zi: count(text, 'AICM_R8Z_I_WORKER_AUTO_EXECUTION'),
  badDryRunShorthand: count(text, '\n    dry_run,\n'),
  goodDryRunMapping: count(text, 'dry_run: dryRun'),
  route: count(text, '/api/aicm/v2/worker-auto-execution/run'),
  helper: count(text, 'runWorkerAutoExecutionR8ZI')
};

if (before.route !== 1) {
  throw new Error('worker-auto-execution route count invalid: ' + before.route);
}

if (before.helper < 2) {
  throw new Error('runWorkerAutoExecutionR8ZI helper missing');
}

if (before.badDryRunShorthand < 1 && before.goodDryRunMapping >= 1) {
  console.log(JSON.stringify({
    status: 'ALREADY_FIXED',
    before,
    after: before
  }, null, 2));
  process.exit(0);
}

text = text.replace(/\n\s*dry_run,\n/g, '\n    dry_run: dryRun,\n');

const after = {
  r8zi: count(text, 'AICM_R8Z_I_WORKER_AUTO_EXECUTION'),
  badDryRunShorthand: count(text, '\n    dry_run,\n'),
  goodDryRunMapping: count(text, 'dry_run: dryRun'),
  route: count(text, '/api/aicm/v2/worker-auto-execution/run'),
  helper: count(text, 'runWorkerAutoExecutionR8ZI')
};

if (after.badDryRunShorthand !== 0) {
  throw new Error('bad dry_run shorthand still remains: ' + after.badDryRunShorthand);
}

if (after.goodDryRunMapping < 1) {
  throw new Error('dry_run: dryRun mapping not found');
}

fs.writeFileSync(serverPath, text, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  before,
  after,
  server_file_write: 'YES',
  core_file_write: 'NO',
  api_post: 'NO_IN_PATCH',
  db_write: 'NO_IN_PATCH'
}, null, 2));
