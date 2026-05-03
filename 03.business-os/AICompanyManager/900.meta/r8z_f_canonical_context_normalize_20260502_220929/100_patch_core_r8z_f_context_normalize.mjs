import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

let text = fs.readFileSync(corePath, 'utf8');

const MARK_F = 'AICM_R8Z_F_CANONICAL_CONTEXT_NORMALIZE';
const START_F = '// ' + MARK_F + '_START';
const END_F = '// ' + MARK_F + '_END';

const START_E = '// AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE_START';
const END_E = '// AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE_END';

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

function removeR8ZECalls(src) {
  return src
    .replace(/\n\s*\/\/ AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE_RELOAD_CALL\s*\n\s*if \(typeof aicmRefreshChildOutputsContextR8ZE === "function"\) \{\s*\n\s*await aicmRefreshChildOutputsContextR8ZE\(\);\s*\n\s*\}\s*/g, '\n')
    .replace(/\n\s*\/\/ AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE_RELOAD_CALL\s*\n\s*if \(typeof aicmRefreshChildOutputsContextR8ZE === 'function'\) \{\s*\n\s*await aicmRefreshChildOutputsContextR8ZE\(\);\s*\n\s*\}\s*/g, '\n');
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
        return {
          start,
          end: i + 1,
          oldText: src.slice(start, i + 1)
        };
      }
    }
  }

  throw new Error('closing brace not found: ' + name);
}

const before = {
  r8eMark: count(text, 'AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE'),
  r8fMark: count(text, MARK_F),
  loadContext: count(text, 'function loadContext') + count(text, 'async function loadContext'),
  normalizeContext: count(text, 'function normalizeContext'),
  pmlwMiddle: count(text, 'pmlw_middle_items'),
  pmlwReq: count(text, 'pmlw_deliverable_requirements'),
  pmlwWorker: count(text, 'pmlw_worker_work_units')
};

text = removeMarkedBlock(text, START_F, END_F);
text = removeMarkedBlock(text, START_E, END_E);
text = removeR8ZECalls(text);

if (count(text, 'aicmNormalizePmlwContextR8ZF') > 0) {
  throw new Error('unmarked R8Z-F helper exists');
}

const loadRange = findFunctionRange(text, 'loadContext');

const hasNormalizeContext = count(text, 'function normalizeContext') > 0;

const helperBlock = String.raw`
// AICM_R8Z_F_CANONICAL_CONTEXT_NORMALIZE_START
  function aicmR8ZFArrayFromContext(rawContext, targetContext, names) {
    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
    var target = targetContext && typeof targetContext === "object" ? targetContext : {};
    var current = state && state.context && typeof state.context === "object" ? state.context : {};

    for (var i = 0; i < names.length; i += 1) {
      var key = names[i];

      if (Array.isArray(raw[key])) return raw[key];
      if (Array.isArray(target[key])) return target[key];
      if (Array.isArray(current[key])) return current[key];
      if (Array.isArray(state && state[key])) return state[key];
    }

    return [];
  }

  function aicmNormalizePmlwContextR8ZF(rawContext, targetContext) {
    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
    var target = targetContext && typeof targetContext === "object" ? targetContext : {};

    if (!target || typeof target !== "object") {
      target = {};
    }

    var middleItems = aicmR8ZFArrayFromContext(raw, target, [
      "pmlw_middle_items",
      "pmlwMiddleItems",
      "leader_middle_items",
      "leaderMiddleItems"
    ]);

    var deliverableRequirements = aicmR8ZFArrayFromContext(raw, target, [
      "pmlw_deliverable_requirements",
      "pmlwDeliverableRequirements",
      "deliverable_requirements",
      "deliverableRequirements"
    ]);

    var workerWorkUnits = aicmR8ZFArrayFromContext(raw, target, [
      "pmlw_worker_work_units",
      "pmlwWorkerWorkUnits",
      "worker_work_units",
      "workerWorkUnits"
    ]);

    var workflowTree = aicmR8ZFArrayFromContext(raw, target, [
      "pmlw_workflow_tree",
      "pmlwWorkflowTree",
      "workflow_tree",
      "workflowTree"
    ]);

    target.pmlw_middle_items = middleItems;
    target.pmlwMiddleItems = middleItems;

    target.pmlw_deliverable_requirements = deliverableRequirements;
    target.pmlwDeliverableRequirements = deliverableRequirements;

    target.pmlw_worker_work_units = workerWorkUnits;
    target.pmlwWorkerWorkUnits = workerWorkUnits;

    target.pmlw_workflow_tree = workflowTree;
    target.pmlwWorkflowTree = workflowTree;

    if (state) {
      state.context = target;

      state.pmlw_middle_items = middleItems;
      state.pmlwMiddleItems = middleItems;

      state.pmlw_deliverable_requirements = deliverableRequirements;
      state.pmlwDeliverableRequirements = deliverableRequirements;

      state.pmlw_worker_work_units = workerWorkUnits;
      state.pmlwWorkerWorkUnits = workerWorkUnits;

      state.pmlw_workflow_tree = workflowTree;
      state.pmlwWorkflowTree = workflowTree;
    }

    return target;
  }

  if (typeof normalizeContext === "function" && !normalizeContext.__aicmR8ZF) {
    var aicmNormalizeContextBeforeR8ZF = normalizeContext;

    normalizeContext = function normalizeContext(rawContext) {
      var normalizedContext = aicmNormalizeContextBeforeR8ZF.apply(this, arguments);
      return aicmNormalizePmlwContextR8ZF(rawContext, normalizedContext);
    };

    normalizeContext.__aicmR8ZF = true;
  }

  if (typeof loadContext === "function" && !loadContext.__aicmR8ZF) {
    var aicmLoadContextBeforeR8ZF = loadContext;

    loadContext = async function loadContext() {
      var result = await aicmLoadContextBeforeR8ZF.apply(this, arguments);

      if (state && state.context) {
        aicmNormalizePmlwContextR8ZF(state.context, state.context);
      }

      return result;
    };

    loadContext.__aicmR8ZF = true;
  }
// AICM_R8Z_F_CANONICAL_CONTEXT_NORMALIZE_END
`;

text = text.slice(0, loadRange.end) + '\n\n' + helperBlock + text.slice(loadRange.end);

const after = {
  r8eMark: count(text, 'AICM_R8Z_E_CHILD_OUTPUT_CONTEXT_HYDRATE'),
  r8fMark: count(text, MARK_F),
  normalizeHelper: count(text, 'aicmNormalizePmlwContextR8ZF'),
  normalizeWrapper: count(text, 'aicmNormalizeContextBeforeR8ZF'),
  loadWrapper: count(text, 'aicmLoadContextBeforeR8ZF'),
  hasNormalizeContext,
  pmlwMiddle: count(text, 'pmlw_middle_items'),
  pmlwReq: count(text, 'pmlw_deliverable_requirements'),
  pmlwWorker: count(text, 'pmlw_worker_work_units'),
  pmlwWorkflowTree: count(text, 'pmlw_workflow_tree')
};

if (after.r8eMark !== 0) throw new Error('R8Z-E markers still remain: ' + after.r8eMark);
if (after.r8fMark < 2) throw new Error('R8Z-F markers missing');
if (after.normalizeHelper < 2) throw new Error('normalize helper missing');
if (after.loadWrapper !== 1) throw new Error('loadContext wrapper count invalid: ' + after.loadWrapper);
if (after.pmlwMiddle < 2 || after.pmlwReq < 2 || after.pmlwWorker < 2) {
  throw new Error('PMLW child keys missing after patch');
}

fs.writeFileSync(corePath, text, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  before,
  after,
  decision: hasNormalizeContext
    ? 'normalizeContext boundary + loadContext boundary patched'
    : 'loadContext boundary patched; normalizeContext was not found',
  core_file_write: 'YES',
  server_file_write: 'NO',
  api_post: 'NO',
  db_write: 'NO',
  persistent_db_write: 'NO'
}, null, 2));
