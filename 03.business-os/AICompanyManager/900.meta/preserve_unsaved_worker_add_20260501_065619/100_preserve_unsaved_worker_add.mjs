import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_PRESERVE_UNSAVED_WORKER_ADD_AXO_V1';

function countText(needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionRange(functionName) {
  const start = src.indexOf(`function ${functionName}(`);
  if (start < 0) return null;
  const open = src.indexOf('{', start);
  if (open < 0) return null;

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

    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;

    if (depth === 0) return { start, open, end: i + 1 };
  }

  return null;
}

function replaceFunction(functionName, replacement) {
  const range = findFunctionRange(functionName);
  if (!range) {
    console.error(`Function not found: ${functionName}`);
    process.exit(1);
  }
  src = src.slice(0, range.start) + replacement + src.slice(range.end);
}

function insertBeforeFunction(functionName, text) {
  const idx = src.indexOf(`function ${functionName}(`);
  if (idx < 0) {
    console.error(`Insertion anchor not found: ${functionName}`);
    process.exit(1);
  }
  src = src.slice(0, idx) + text + "\n" + src.slice(idx);
}

// ------------------------------------------------------------
// 1. Add small draft helpers before renderAicmWorkerInlineRows.
// ------------------------------------------------------------
if (!src.includes(marker)) {
  insertBeforeFunction('renderAicmWorkerInlineRows', `
// ${marker}
// Preserve unsaved edit-form values when adding worker rows.
// This is UI draft only. It does not write DB and does not change API payload canon.
function aicmAxoEnsureDraft() {
    if (!state.aicmAxoFormDraft) {
      state.aicmAxoFormDraft = {
        fields: {},
        workers: []
      };
    }
    if (!state.aicmAxoFormDraft.fields) state.aicmAxoFormDraft.fields = {};
    if (!Array.isArray(state.aicmAxoFormDraft.workers)) state.aicmAxoFormDraft.workers = [];
    return state.aicmAxoFormDraft;
  }

function aicmAxoFieldValue(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "") : "";
  }

function aicmAxoCaptureField(id) {
    var el = document.getElementById(id);
    if (!el) return;
    aicmAxoEnsureDraft().fields[id] = String(el.value || "");
  }

function aicmAxoDraftValue(id, fallback) {
    var draft = state.aicmAxoFormDraft;
    if (draft && draft.fields && Object.prototype.hasOwnProperty.call(draft.fields, id)) {
      return String(draft.fields[id] || "");
    }
    return String(fallback || "");
  }

function aicmAxoCaptureCurrentEditFormDraft() {
    var draft = aicmAxoEnsureDraft();

    [
      "aicm-company-edit-id",
      "aicm-company-edit-name",
      "aicm-company-edit-domain",
      "aicm-company-edit-rules",
      "aicm-company-edit-policy",
      "aicm-company-edit-status",
      "aicm-company-president-robot",
      "aicm-company-president-robot-nickname",

      "aicm-department-edit-id",
      "aicm-department-edit-company-id",
      "aicm-department-edit-name",
      "aicm-department-edit-purpose",
      "aicm-department-edit-status",
      "aicm-department-manager-robot",
      "aicm-department-manager-robot-nickname",

      "aicm-section-edit-id",
      "aicm-section-edit-company-id",
      "aicm-section-edit-department-id",
      "aicm-section-edit-name",
      "aicm-section-edit-purpose",
      "aicm-section-edit-status",
      "aicm-section-leader-robot",
      "aicm-section-leader-robot-nickname"
    ].forEach(aicmAxoCaptureField);

    var workers = [];
    var index = 0;

    while (index < 60) {
      var robotIds = [
        "aicm-inline-worker-" + String(index) + "-robot",
        "aicm-role-worker-robot-" + String(index),
        "aicm-role-worker-section-robot-" + String(index),
        "aicm-role-worker-section-new-robot-" + String(index)
      ];

      var nicknameIds = [
        "aicm-inline-worker-" + String(index) + "-nickname",
        "aicm-role-worker-nickname-" + String(index),
        "aicm-role-worker-section-nickname-" + String(index),
        "aicm-role-worker-section-new-nickname-" + String(index)
      ];

      var robotEl = null;
      var nicknameEl = null;

      for (var r = 0; r < robotIds.length; r += 1) {
        robotEl = document.getElementById(robotIds[r]);
        if (robotEl) break;
      }

      for (var n = 0; n < nicknameIds.length; n += 1) {
        nicknameEl = document.getElementById(nicknameIds[n]);
        if (nicknameEl) break;
      }

      if (!robotEl && !nicknameEl) break;

      workers.push({
        robot_pool_id: robotEl ? String(robotEl.value || "") : "",
        internal_nickname: nicknameEl ? String(nicknameEl.value || "") : ""
      });

      index += 1;
    }

    draft.workers = workers;
    return draft;
  }

function aicmAxoClearDraftAfterSuccessfulSave() {
    state.aicmAxoFormDraft = null;
  }
`);
}

// ------------------------------------------------------------
// 2. Replace role select helper to prefer draft values.
// ------------------------------------------------------------
replaceFunction('aicmAvdRoleSelect', `function aicmAvdRoleSelect(id, roleCode) {
    // ${marker}
    var role = roleCode || {};
    var existing = typeof aicmAxnFirstPlacement === "function" ? aicmAxnFirstPlacement(role.code) : null;

    var selectedValue = typeof aicmAxnPlacementValue === "function" ? aicmAxnPlacementValue(existing) : "";
    var selectedLabel = typeof aicmAxnPlacementLabel === "function" ? aicmAxnPlacementLabel(existing) : "";
    var nickname = typeof aicmAxnPlacementNickname === "function" ? aicmAxnPlacementNickname(existing) : "";

    selectedValue = aicmAxoDraftValue(id, selectedValue);
    nickname = aicmAxoDraftValue(id + "-nickname", nickname);

    return [
      '<label>' + escapeHtml(role.label) + 'ロボット',
      '<select id="' + escapeHtml(id) + '" data-inline-role-code="' + escapeHtml(role.code) + '">',
      aicmInlineRobotOptions(role.code, selectedValue, selectedLabel),
      '</select></label>',
      '<label>' + escapeHtml(role.label) + '社内通称',
      '<input id="' + escapeHtml(id + "-nickname") + '" type="text" value="' + escapeHtml(nickname) + '" placeholder="例: ' + escapeHtml(role.placeholder) + '">',
      '</label>'
    ].join("");
  }`);

// ------------------------------------------------------------
// 3. Replace worker rows helper to prefer draft workers over DB readback.
// ------------------------------------------------------------
replaceFunction('renderAicmWorkerInlineRows', `function renderAicmWorkerInlineRows(fieldPrefix) {
    // ${marker}
    var savedRows = typeof aicmAxnCurrentPlacements === "function" ? aicmAxnCurrentPlacements("worker") : [];
    var draft = state.aicmAxoFormDraft || {};
    var draftWorkers = Array.isArray(draft.workers) ? draft.workers : [];

    var baseCount = typeof aicmWorkerSlotCount === "function" ? aicmWorkerSlotCount() : 3;
    var count = Math.max(baseCount, savedRows.length || 0, draftWorkers.length || 0, 1);
    var safePrefix = fieldPrefix || "worker";
    var html = [];

    for (var i = 0; i < count; i += 1) {
      var existing = savedRows[i] || null;
      var draftRow = draftWorkers[i] || null;

      var selectedValue = draftRow
        ? String(draftRow.robot_pool_id || "")
        : (typeof aicmAxnPlacementValue === "function" ? aicmAxnPlacementValue(existing) : "");

      var selectedLabel = typeof aicmAxnPlacementLabel === "function" ? aicmAxnPlacementLabel(existing) : "";

      var nickname = draftRow
        ? String(draftRow.internal_nickname || "")
        : (typeof aicmAxnPlacementNickname === "function" ? aicmAxnPlacementNickname(existing) : "");

      html.push([
        '<div class="aicm-worker-inline-row">',
        '  <label>従業員設定ロボット ' + String(i + 1) + '<select id="aicm-role-' + escapeHtml(safePrefix) + '-robot-' + String(i) + '" data-inline-role-code="worker" data-worker-slot-index="' + String(i) + '">',
        aicmInlineRobotOptions("worker", selectedValue, selectedLabel),
        '  </select></label>',
        '  <label>社内通称<input id="aicm-role-' + escapeHtml(safePrefix) + '-nickname-' + String(i) + '" type="text" value="' + escapeHtml(nickname) + '" placeholder="例: ウルフ@従業員' + String(i + 1) + '"></label>',
        '</div>'
      ].join(""));
    }

    return html.join("");
  }`);

// ------------------------------------------------------------
// 4. Patch inline-worker-slot-add click branch to capture draft before render.
// ------------------------------------------------------------
if (!src.includes('aicmAxoCaptureCurrentEditFormDraft();')) {
  const needle = 'if (action === "inline-worker-slot-add")';
  const idx = src.indexOf(needle);
  if (idx < 0) {
    console.error('inline-worker-slot-add branch not found');
    process.exit(1);
  }

  const open = src.indexOf('{', idx);
  if (open < 0) {
    console.error('inline-worker-slot-add branch open brace not found');
    process.exit(1);
  }

  src = src.slice(0, open + 1)
    + '\n      // ' + marker + '\n      aicmAxoCaptureCurrentEditFormDraft();'
    + src.slice(open + 1);
}

// ------------------------------------------------------------
// 5. Clear draft after successful confirmed save so DB readback becomes source.
// ------------------------------------------------------------
if (!src.includes('aicmAxoClearDraftAfterSuccessfulSave();')) {
  const successNeedle = 'state.pendingOrgUpdate = null;';
  const successIdx = src.indexOf(successNeedle);
  if (successIdx >= 0) {
    const insertAt = successIdx + successNeedle.length;
    src = src.slice(0, insertAt)
      + '\n      // ' + marker + '\n      if (typeof aicmAxoClearDraftAfterSuccessfulSave === "function") aicmAxoClearDraftAfterSuccessfulSave();'
      + src.slice(insertAt);
  }
}

fs.writeFileSync(coreFile, src, 'utf8');

console.log(`coreChanged=${src !== before}`);
console.log(`markerCount=${countText(marker)}`);
console.log(`draftHelperCount=${countText('function aicmAxoCaptureCurrentEditFormDraft')}`);
console.log(`draftCaptureCallCount=${countText('aicmAxoCaptureCurrentEditFormDraft();')}`);
console.log(`draftClearCallCount=${countText('aicmAxoClearDraftAfterSuccessfulSave();')}`);
console.log(`roleSelectCount=${countText('function aicmAvdRoleSelect')}`);
console.log(`workerRowsCount=${countText('function renderAicmWorkerInlineRows')}`);
console.log(`asyncAsyncCount=${countText('async async function')}`);
