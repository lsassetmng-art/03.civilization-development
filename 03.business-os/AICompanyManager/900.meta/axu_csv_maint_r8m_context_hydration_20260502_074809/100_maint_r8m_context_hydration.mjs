import fs from 'node:fs';

const file = process.env.CORE;
const before = fs.readFileSync(file, 'utf8');
let src = before;

const helperMarker = 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1';
const hydrateCallMarker = 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_CALL';
const reloadCallMarker = 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_RELOAD_CALL';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

function insertHelper(source) {
  if (source.includes(helperMarker)) return source;

  const anchor =
    source.indexOf('function renderTaskLedgerPlaceholder') >= 0
      ? 'function renderTaskLedgerPlaceholder'
      : 'function handleRootClick';

  const anchorIndex = source.indexOf(anchor);
  if (anchorIndex < 0) {
    throw new Error('helper anchor not found');
  }

  const helper = `
  function aicmHydrateManagerMajorContextArraysR8M(rawContext) {
    // ${helperMarker}
    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
    var target = state && state.context && typeof state.context === "object" ? state.context : {};

    if (state) {
      state.context = target;
    }

    function arrayFrom(names) {
      for (var i = 0; i < names.length; i += 1) {
        var name = names[i];

        if (Array.isArray(raw[name])) {
          return raw[name];
        }

        if (Array.isArray(target[name])) {
          return target[name];
        }
      }

      return [];
    }

    var pmlwMajorItems = arrayFrom(["pmlw_major_items", "pmlwMajorItems"]);
    var managerMajorItems = arrayFrom(["manager_major_items", "managerMajorItems"]);
    var majorItems = arrayFrom(["major_items", "majorItems"]);
    var taskLedger = arrayFrom(["task_ledger", "taskLedger"]);
    var robotCatalog = arrayFrom(["robot_catalog", "robotCatalog"]);

    target.pmlw_major_items = pmlwMajorItems;
    target.pmlwMajorItems = pmlwMajorItems;

    target.manager_major_items = managerMajorItems;
    target.managerMajorItems = managerMajorItems;

    target.major_items = majorItems;
    target.majorItems = majorItems;

    target.task_ledger = taskLedger;
    target.taskLedger = taskLedger;

    target.robot_catalog = robotCatalog;
    target.robotCatalog = robotCatalog;

    target.__managerMajorHydrationR8M = {
      pmlw_major_items: pmlwMajorItems.length,
      manager_major_items: managerMajorItems.length,
      major_items: majorItems.length,
      task_ledger: taskLedger.length
    };

    return target;
  }

  async function aicmFetchAndHydrateManagerMajorContextR8M() {
    var owner = "";

    if (state && state.ownerCivilizationId) {
      owner = String(state.ownerCivilizationId || "");
    }

    if (!owner && typeof ownerCivilizationId === "function") {
      owner = String(ownerCivilizationId() || "");
    }

    if (!owner && typeof aicmPmlwOwnerId === "function") {
      owner = String(aicmPmlwOwnerId() || "");
    }

    if (!owner) {
      owner = "00000000-0000-4000-8000-000000000001";
    }

    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner) + "&v=" + Date.now());
    var json = await response.json();

    if (json && json.result === "ok") {
      aicmHydrateManagerMajorContextArraysR8M(json);
    }

    return json;
  }

`;

  return source.slice(0, anchorIndex) + helper + source.slice(anchorIndex);
}

function patchContextAssignments(source) {
  let output = '';
  let pos = 0;
  let patched = 0;

  while (true) {
    const idx = source.indexOf('state.context', pos);
    if (idx < 0) {
      output += source.slice(pos);
      break;
    }

    output += source.slice(pos, idx);

    const rest = source.slice(idx);
    const match = rest.match(/^state\.context\s*=/);

    if (!match) {
      output += 'state.context';
      pos = idx + 'state.context'.length;
      continue;
    }

    const semicolon = source.indexOf(';', idx);
    if (semicolon < 0 || semicolon - idx > 5000) {
      output += 'state.context';
      pos = idx + 'state.context'.length;
      continue;
    }

    const assignment = source.slice(idx, semicolon + 1);
    const after = source.slice(semicolon + 1, semicolon + 800);

    if (after.includes(hydrateCallMarker)) {
      output += assignment;
      pos = semicolon + 1;
      continue;
    }

    const call = `
    // ${hydrateCallMarker}
    if (typeof aicmHydrateManagerMajorContextArraysR8M === "function") {
      aicmHydrateManagerMajorContextArraysR8M(
        typeof json !== "undefined" ? json :
        (typeof data !== "undefined" ? data :
        (typeof contextJson !== "undefined" ? contextJson :
        (typeof ctx !== "undefined" ? ctx : null)))
      );
    }`;

    output += assignment + call;
    patched += 1;
    pos = semicolon + 1;
  }

  return { source: output, patched };
}

function patchReloadFunction(source) {
  const fnStart = source.indexOf('async function aicmReloadTaskLedgerContext');
  if (fnStart < 0) {
    return { source, patched: 0, reason: 'reload function not found' };
  }

  let fnEnd = source.indexOf('function renderTaskLedgerPlaceholder', fnStart);
  if (fnEnd < 0) {
    fnEnd = source.indexOf('// AICM_HUMAN_REVIEW_QUEUE_CORE_ARO_ART_V1', fnStart);
  }

  if (fnEnd < 0) {
    return { source, patched: 0, reason: 'reload function end anchor not found' };
  }

  let win = source.slice(fnStart, fnEnd);

  if (win.includes(reloadCallMarker)) {
    return { source, patched: 0, reason: 'already patched' };
  }

  const needle = 'await loadContext();';
  if (!win.includes(needle)) {
    return { source, patched: 0, reason: 'await loadContext not found in reload function' };
  }

  const replacement = `await loadContext();
      // ${reloadCallMarker}
      if (typeof aicmFetchAndHydrateManagerMajorContextR8M === "function") {
        await aicmFetchAndHydrateManagerMajorContextR8M();
      }`;

  win = win.replace(needle, replacement);

  return {
    source: source.slice(0, fnStart) + win + source.slice(fnEnd),
    patched: 1,
    reason: 'patched'
  };
}

const beforeHelperCount = countText(src, helperMarker);
const beforeHydrateCallCount = countText(src, hydrateCallMarker);
const beforeReloadCallCount = countText(src, reloadCallMarker);
const beforeContextAssignmentCount = countText(src, 'state.context');

let patchedAssignments = 0;
let patchedReload = 0;
let reloadReason = '';

if (!src.includes(helperMarker)) {
  const result = patchContextAssignments(src);
  src = result.source;
  patchedAssignments = result.patched;

  const reloadResult = patchReloadFunction(src);
  src = reloadResult.source;
  patchedReload = reloadResult.patched;
  reloadReason = reloadResult.reason;

  src = insertHelper(src);
} else {
  reloadReason = 'helper already exists';
}

fs.writeFileSync(file, src, 'utf8');

const after = fs.readFileSync(file, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('beforeHelperCount=' + beforeHelperCount);
console.log('beforeHydrateCallCount=' + beforeHydrateCallCount);
console.log('beforeReloadCallCount=' + beforeReloadCallCount);
console.log('beforeContextAssignmentTextCount=' + beforeContextAssignmentCount);
console.log('patchedAssignments=' + patchedAssignments);
console.log('patchedReload=' + patchedReload);
console.log('reloadPatchReason=' + reloadReason);
console.log('helperMarkerCount=' + countText(after, helperMarker));
console.log('hydrateCallMarkerCount=' + countText(after, hydrateCallMarker));
console.log('reloadCallMarkerCount=' + countText(after, reloadCallMarker));
console.log('pmlwMajorSnakeRefCount=' + countText(after, 'pmlw_major_items'));
console.log('pmlwMajorCamelRefCount=' + countText(after, 'pmlwMajorItems'));
console.log('hydrationStateRefCount=' + countText(after, '__managerMajorHydrationR8M'));
console.log('rowsHelperCount=' + countText(after, 'function aicmGetManagerMajorRowsForSelectedCompany'));
console.log('renderHelperCount=' + countText(after, 'function aicmRenderManagerMajorRows'));
console.log('placeholderCount=' + countText(after, 'function renderTaskLedgerPlaceholder'));
console.log('debugPanelCount=' + countText(after, 'DEBUG / state.context & rows'));
console.log('tokenLeakCountCore=' + countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN'));
console.log('asyncAsyncCountCore=' + countText(after, 'async async function'));
