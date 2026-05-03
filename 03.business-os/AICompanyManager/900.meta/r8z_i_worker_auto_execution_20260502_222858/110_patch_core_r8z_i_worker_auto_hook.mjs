import fs from 'node:fs';

const corePath = process.argv[2];
let text = fs.readFileSync(corePath, 'utf8');

const MARK = 'AICM_R8Z_I_WORKER_AUTO_EXECUTION';
const START = '// ' + MARK + '_CORE_START';
const END = '// ' + MARK + '_CORE_END';

function count(src, needle) {
  return src.split(needle).length - 1;
}

function removeMarkedBlock(src, start, end) {
  const s = src.indexOf(start);
  if (s < 0) return src;
  const e = src.indexOf(end, s);
  if (e < 0) throw new Error('marked block end not found: ' + start);
  return src.slice(0, s) + src.slice(e + end.length);
}

function findFunctionRange(src, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\([^)]*\\)\\s*\\{', 'm');
  const m = re.exec(src);
  if (!m) throw new Error('function not found: ' + name);

  const start = m.index;
  const open = src.indexOf('{', start);

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (ch === '\\') {
        escaped = true;
        continue;
      }

      if (ch === quote) {
        quote = null;
      }

      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') {
      depth += 1;
      continue;
    }

    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return { start, end: i + 1, oldText: src.slice(start, i + 1) };
      }
    }
  }

  throw new Error('closing brace not found: ' + name);
}

const before = {
  mark: count(text, MARK),
  autoDecompHelper: count(text, 'aicmRunLeaderAutoDecompositionAfterHandoffR8ZB'),
  autoDecompCall: count(text, 'aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(aicmR8zBMajorIdForAuto)'),
  workerAutoRoute: count(text, '/api/aicm/v2/worker-auto-execution/run')
};

text = removeMarkedBlock(text, START, END);

if (count(text, 'aicmRunWorkerAutoExecutionAfterDecompositionR8ZI') > 0) {
  throw new Error('unmarked R8Z-I core helper exists');
}

const helperInsertRange = findFunctionRange(text, 'aicmRunLeaderAutoDecompositionAfterHandoffR8ZB');

const helperBlock = String.raw`
// AICM_R8Z_I_WORKER_AUTO_EXECUTION_CORE_START
  async function aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(majorId) {
    var body = {
      owner_civilization_id: state && state.ownerCivilizationId ? state.ownerCivilizationId : "00000000-0000-4000-8000-000000000001",
      aicm_user_company_id: state && state.selectedCompanyId ? state.selectedCompanyId : "",
      aicm_manager_major_work_item_id: majorId || "",
      limit: 10
    };

    var response = await fetch("/api/aicm/v2/worker-auto-execution/run", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    var json = null;
    try {
      json = await response.json();
    } catch (_) {
      json = null;
    }

    if (!response.ok || (json && json.result && json.result !== "ok")) {
      throw new Error(json && (json.error_message || json.message || json.error) ? (json.error_message || json.message || json.error) : "Worker自動実行に失敗しました。");
    }

    return json || {};
  }

  function aicmWorkerAutoExecutionMessageR8ZI(result) {
    var executed = result && typeof result.executed_count !== "undefined" ? Number(result.executed_count || 0) : 0;
    var failed = result && typeof result.failed_count !== "undefined" ? Number(result.failed_count || 0) : 0;

    if (failed > 0) {
      return "Leader自動分解後、Worker自動実行で一部エラーがありました。成功 " + String(executed) + "件 / 失敗 " + String(failed) + "件。";
    }

    return "Leader自動分解後、Worker自動実行requestを " + String(executed) + "件作成しました。";
  }
// AICM_R8Z_I_WORKER_AUTO_EXECUTION_CORE_END
`;

text = text.slice(0, helperInsertRange.end) + '\n\n' + helperBlock + text.slice(helperInsertRange.end);

const callNeedle = 'var aicmR8zBAutoResult = await aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(aicmR8zBMajorIdForAuto);';

if (text.indexOf(callNeedle) < 0) {
  throw new Error('R8Z-B auto decomposition call not found');
}

if (text.indexOf('aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(aicmR8zBMajorIdForAuto)') < 0) {
  const replacement = [
    callNeedle,
    '      var aicmR8zIWorkerAutoResult = await aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(aicmR8zBMajorIdForAuto);',
    '      if (typeof aicmWorkerAutoExecutionMessageR8ZI === "function") {',
    '        setMessage("ok", aicmWorkerAutoExecutionMessageR8ZI(aicmR8zIWorkerAutoResult));',
    '      }'
  ].join('\n');

  text = text.replace(callNeedle, replacement);
}

const after = {
  mark: count(text, MARK),
  helper: count(text, 'aicmRunWorkerAutoExecutionAfterDecompositionR8ZI'),
  messageHelper: count(text, 'aicmWorkerAutoExecutionMessageR8ZI'),
  workerAutoRoute: count(text, '/api/aicm/v2/worker-auto-execution/run'),
  workerAutoCall: count(text, 'aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(aicmR8zBMajorIdForAuto)'),
  autoDecompCall: count(text, 'aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(aicmR8zBMajorIdForAuto)')
};

if (after.mark < 2) throw new Error('R8Z-I core markers missing');
if (after.helper < 2) throw new Error('core helper missing');
if (after.messageHelper < 2) throw new Error('message helper missing');
if (after.workerAutoRoute !== 1) throw new Error('worker auto route count invalid: ' + after.workerAutoRoute);
if (after.workerAutoCall !== 1) throw new Error('worker auto call count invalid: ' + after.workerAutoCall);
if (after.autoDecompCall !== 1) throw new Error('auto decomp call count invalid: ' + after.autoDecompCall);

fs.writeFileSync(corePath, text, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  before,
  after,
  core_file_write: 'YES',
  api_post: 'NO_IN_PATCH',
  db_write: 'NO_IN_PATCH',
  persistent_db_write: 'NO_IN_PATCH',
  runtime_post_after_user_handoff_confirm: 'YES'
}, null, 2));
