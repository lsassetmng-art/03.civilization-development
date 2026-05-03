import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;

if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let core = fs.readFileSync(coreFile, 'utf8');
const beforeCore = core;

const marker = 'AICM_RUNTIME_STATUS_PANEL_FILTER_AXT_R9_R2_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

function insertBefore(anchor, text) {
  const idx = core.indexOf(anchor);

  if (idx < 0) {
    console.error('Core anchor not found: ' + anchor);
    process.exit(1);
  }

  core = core.slice(0, idx) + text + '\n\n' + core.slice(idx);
}

/*
 * 1. Add reusable filter helpers.
 * This is app-local now, but intentionally structured for AIOperationDesk reuse later.
 */
if (!core.includes('function aicmRuntimeStatusFilterRowsForCurrentApp')) {
  const helper = `
// ${marker}
// Runtime Status Panel display filter.
// AIOperationDesk can reuse the same idea later by changing expected app surface/source rules.
function aicmRuntimeStatusNormalizeText(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

function aicmRuntimeStatusRowSearchText(row) {
    try {
      return JSON.stringify(row || {}).toLowerCase();
    } catch (error) {
      return "";
    }
  }

function aicmRuntimeStatusIsTestLikeRow(row) {
    var title = aicmRuntimeStatusNormalizeText(aicmRuntimeStatusField(row, [
      "task_title",
      "title",
      "output_title_ja",
      "request_title"
    ]));

    var code = aicmRuntimeStatusNormalizeText(aicmRuntimeStatusField(row, [
      "request_code",
      "source_request_ref",
      "idempotency_key"
    ]));

    var text = (title + " " + code).toLowerCase();

    return (
      text.indexOf("smoke") >= 0 ||
      text.indexOf("runtime execution http api fix") >= 0 ||
      text.indexOf("persistent smoke") >= 0
    );
  }

function aicmRuntimeStatusIsCurrentAppRow(row) {
    var appSurface = aicmRuntimeStatusNormalizeText(aicmRuntimeStatusField(row, [
      "app_surface_code",
      "surface_code"
    ]));

    var sourceApp = aicmRuntimeStatusNormalizeText(aicmRuntimeStatusField(row, [
      "source_app_ref",
      "source_app_code",
      "app_code"
    ]));

    var searchText = aicmRuntimeStatusRowSearchText(row);

    if (aicmRuntimeStatusIsTestLikeRow(row)) {
      return false;
    }

    if (appSurface === "ai_company_manager") {
      return true;
    }

    if (sourceApp === "AICompanyManager" || sourceApp === "ai_company_manager") {
      return true;
    }

    if (searchText.indexOf('"app_surface_code":"ai_company_manager"') >= 0) {
      return true;
    }

    if (searchText.indexOf('"source_app_ref":"AICompanyManager"'.toLowerCase()) >= 0) {
      return true;
    }

    return false;
  }

function aicmRuntimeStatusFilterRowsForCurrentApp(rows) {
    rows = Array.isArray(rows) ? rows : [];

    var filtered = rows.filter(function (row) {
      return aicmRuntimeStatusIsCurrentAppRow(row);
    });

    return filtered;
  }
`;

  insertBefore('function aicmRuntimeStatusPanelRender', helper);
}

/*
 * 2. Make pipeline-board GET carry app filter hints.
 * Even if upstream ignores them, local UI still filters rows after response.
 */
core = core.split('fetch("/api/aicm/v2/worker-runtime/pipeline-board", { method: "GET" })')
  .join('fetch("/api/aicm/v2/worker-runtime/pipeline-board?app_surface_code=ai_company_manager&source_app_ref=AICompanyManager", { method: "GET" })');

/*
 * 3. Replace raw assignment with filtered assignment.
 */
const rawAssign = 'state.runtimeStatusRows = aicmRuntimeStatusRowsFromPayload(json);';
const filteredAssign = `var runtimeRows = aicmRuntimeStatusRowsFromPayload(json);
      state.runtimeStatusRawRows = runtimeRows;
      state.runtimeStatusRows = aicmRuntimeStatusFilterRowsForCurrentApp(runtimeRows);`;

if (core.includes(rawAssign)) {
  core = core.split(rawAssign).join(filteredAssign);
} else if (!core.includes('state.runtimeStatusRows = aicmRuntimeStatusFilterRowsForCurrentApp(runtimeRows);')) {
  console.error('Runtime status rows assignment not found');
  process.exit(1);
}

/*
 * 4. Improve empty message so it is clear filter is active.
 */
core = core.split('まだ表示できる実行状況がありません。作成後に「実行状況を更新」を押してください。')
  .join('AICompanyManager由来の実行状況はまだありません。作成後に「実行状況を更新」を押してください。');

fs.writeFileSync(coreFile, core, 'utf8');

console.log('coreChanged=' + String(core !== beforeCore));
console.log('markerCount=' + String(countText(core, marker)));
console.log('filterFunctionCount=' + String(countText(core, 'function aicmRuntimeStatusFilterRowsForCurrentApp')));
console.log('currentAppPredicateCount=' + String(countText(core, 'function aicmRuntimeStatusIsCurrentAppRow')));
console.log('testLikePredicateCount=' + String(countText(core, 'function aicmRuntimeStatusIsTestLikeRow')));
console.log('filteredAssignCount=' + String(countText(core, 'state.runtimeStatusRows = aicmRuntimeStatusFilterRowsForCurrentApp(runtimeRows);')));
console.log('rawAssignCount=' + String(countText(core, 'state.runtimeStatusRows = aicmRuntimeStatusRowsFromPayload(json);')));
console.log('pipelineFilterHintCount=' + String(countText(core, 'app_surface_code=ai_company_manager&source_app_ref=AICompanyManager')));
console.log('smokeTextGuardCount=' + String(countText(core, 'runtime execution http api fix')));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
