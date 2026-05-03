import fs from 'node:fs';

const corePath = process.argv[2];
let text = fs.readFileSync(corePath, 'utf8');

const MARK = 'AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE';
const START = '// ' + MARK + '_START';
const END = '// ' + MARK + '_END';

function count(src, needle) {
  return src.split(needle).length - 1;
}

function removeMarkedBlock(src, start, end) {
  const s = src.indexOf(start);
  if (s < 0) return src;
  const e = src.indexOf(end, s);
  if (e < 0) throw new Error('marked block end not found');
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
      if (ch === quote) quote = null;
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
  outputPanel: count(text, 'aicmRenderPmlwAutoOutputsPanelR8ZC'),
  reloadFunction: count(text, 'async function aicmReloadTaskLedgerContext')
};

text = removeMarkedBlock(text, START, END);

if (count(text, 'aicmHydrateChildOutputsIntoContextR8ZE') > 0) {
  throw new Error('unmarked R8Z-E helper exists');
}

const reloadRange = findFunctionRange(text, 'aicmReloadTaskLedgerContext');

const helperBlock = String.raw`
// AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE_START
  function aicmR8ZEText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8ZEOwnerId() {
    if (state && state.ownerCivilizationId) return aicmR8ZEText(state.ownerCivilizationId);
    if (state && state.owner_civilization_id) return aicmR8ZEText(state.owner_civilization_id);

    try {
      if (typeof OWNER_CIVILIZATION_ID !== "undefined" && OWNER_CIVILIZATION_ID) {
        return aicmR8ZEText(OWNER_CIVILIZATION_ID);
      }
    } catch (_) {}

    return "00000000-0000-4000-8000-000000000001";
  }

  function aicmHydrateChildOutputsIntoContextR8ZE(rawContext) {
    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
    var target = state && state.context && typeof state.context === "object" ? state.context : {};

    if (state) {
      state.context = target;
    }

    function assignArray(key) {
      if (Array.isArray(raw[key])) {
        target[key] = raw[key];
        state[key] = raw[key];
      } else if (!Array.isArray(target[key])) {
        target[key] = [];
        state[key] = [];
      }
    }

    assignArray("pmlw_middle_items");
    assignArray("pmlw_deliverable_requirements");
    assignArray("pmlw_worker_work_units");
    assignArray("pmlw_workflow_tree");

    target.pmlwMiddleItems = target.pmlw_middle_items;
    target.pmlwDeliverableRequirements = target.pmlw_deliverable_requirements;
    target.pmlwWorkerWorkUnits = target.pmlw_worker_work_units;

    state.pmlwMiddleItems = target.pmlw_middle_items;
    state.pmlwDeliverableRequirements = target.pmlw_deliverable_requirements;
    state.pmlwWorkerWorkUnits = target.pmlw_worker_work_units;

    return target;
  }

  async function aicmRefreshChildOutputsContextR8ZE() {
    var owner = encodeURIComponent(aicmR8ZEOwnerId());
    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner + "&v=" + Date.now(), {
      method: "GET",
      cache: "no-store"
    });

    var json = null;
    try {
      json = await response.json();
    } catch (_) {
      json = null;
    }

    if (!response.ok || !json) {
      throw new Error("Leader以降の出力contextを再取得できません。");
    }

    aicmHydrateChildOutputsIntoContextR8ZE(json);
    return json;
  }
// AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE_END
`;

text = text.slice(0, reloadRange.start) + helperBlock + '\n\n' + text.slice(reloadRange.start);

let patched = text;

const callNeedle = 'await loadContext();';
const callReplacement = `await loadContext();
      // AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE_RELOAD_CALL
      if (typeof aicmRefreshChildOutputsContextR8ZE === "function") {
        await aicmRefreshChildOutputsContextR8ZE();
      }`;

if (!patched.includes(callNeedle)) {
  throw new Error('reload loadContext call not found');
}

if (!patched.includes('AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE_RELOAD_CALL')) {
  patched = patched.replace(callNeedle, callReplacement);
}

const after = {
  mark: count(patched, MARK),
  hydrateHelper: count(patched, 'aicmHydrateChildOutputsIntoContextR8ZE'),
  refreshHelper: count(patched, 'aicmRefreshChildOutputsContextR8ZE'),
  reloadCall: count(patched, 'AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE_RELOAD_CALL'),
  pmlwMiddle: count(patched, 'pmlw_middle_items'),
  pmlwReq: count(patched, 'pmlw_deliverable_requirements'),
  pmlwWorker: count(patched, 'pmlw_worker_work_units')
};

if (after.mark < 2) throw new Error('R8Z-E marker missing');
if (after.hydrateHelper < 2) throw new Error('hydrate helper missing');
if (after.refreshHelper < 2) throw new Error('refresh helper missing');
if (after.reloadCall !== 1) throw new Error('reload call count invalid: ' + after.reloadCall);
if (after.pmlwMiddle < 2 || after.pmlwReq < 2 || after.pmlwWorker < 2) {
  throw new Error('child output keys missing');
}

fs.writeFileSync(corePath, patched, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  before,
  after,
  core_file_write: 'YES',
  server_file_write: 'NO',
  api_post: 'NO',
  db_write: 'NO',
  persistent_db_write: 'NO'
}, null, 2));
