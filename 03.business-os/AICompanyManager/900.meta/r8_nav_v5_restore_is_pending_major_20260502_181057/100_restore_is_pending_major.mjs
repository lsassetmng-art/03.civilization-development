import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

let src = fs.readFileSync(corePath, 'utf8');

const MARK = 'AICM_R8_NAV_V5_RESTORE_IS_PENDING_MAJOR';
const START = '// ' + MARK + '_START';
const END = '// ' + MARK + '_END';

function count(text, needle) {
  return text.split(needle).length - 1;
}

function removeMarkedBlock(text, startMarker, endMarker) {
  const s = text.indexOf(startMarker);
  if (s < 0) return text;

  const e = text.indexOf(endMarker, s);
  if (e < 0) throw new Error('marked block end not found: ' + startMarker);

  return text.slice(0, s) + text.slice(e + endMarker.length);
}

function insertBeforeNeedle(text, needle, block) {
  const idx = text.indexOf(needle);
  if (idx < 0) throw new Error('insert anchor not found: ' + needle);
  return text.slice(0, idx) + block.trimEnd() + '\n\n  ' + text.slice(idx);
}

const before = {
  mark: count(src, MARK),
  helper: count(src, 'function isPendingMajor'),
  calls: count(src, 'isPendingMajor(row)'),
  renderMajor: count(src, 'function aicmRenderManagerMajorRows'),
  safeRender: count(src, 'function aicmRenderTaskLedgerSafeR8V4'),
  renderTaskLedger: count(src, 'function renderTaskLedgerPlaceholder'),
  r8m: count(src, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(src, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1')
};

src = removeMarkedBlock(src, START, END);

if (count(src, 'function isPendingMajor') === 0) {
  const helperBlock = `
${START}
  function isPendingMajor(row) {
    if (!row || typeof row !== "object") return false;

    var handoff = String(row.handoff_status_code || "").toLowerCase();
    var decomposition = String(row.decomposition_status_code || "").toLowerCase();
    var deleted = String(row.deleted_flag || row.is_deleted || "").toLowerCase();
    var archived = String(row.archived_flag || row.is_archived || "").toLowerCase();

    if (deleted === "true" || deleted === "1") return false;
    if (archived === "true" || archived === "1") return false;

    if (
      handoff === "archived" ||
      handoff === "deleted" ||
      handoff === "cancelled" ||
      handoff === "canceled" ||
      handoff === "sent" ||
      handoff === "handed_off" ||
      handoff === "completed" ||
      handoff === "done"
    ) {
      return false;
    }

    if (
      decomposition === "completed" ||
      decomposition === "complete" ||
      decomposition === "done"
    ) {
      return false;
    }

    return true;
  }
${END}
`;

  src = insertBeforeNeedle(src, 'function aicmRenderManagerMajorRows', helperBlock);
}

const after = {
  mark: count(src, MARK),
  helper: count(src, 'function isPendingMajor'),
  calls: count(src, 'isPendingMajor(row)'),
  renderMajor: count(src, 'function aicmRenderManagerMajorRows'),
  safeRender: count(src, 'function aicmRenderTaskLedgerSafeR8V4'),
  renderTaskLedger: count(src, 'function renderTaskLedgerPlaceholder'),
  r8m: count(src, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(src, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1')
};

if (after.helper !== 1) throw new Error('isPendingMajor helper count invalid: ' + after.helper);
if (after.calls < 1) throw new Error('isPendingMajor call missing');
if (after.renderMajor !== 1) throw new Error('aicmRenderManagerMajorRows count invalid: ' + after.renderMajor);
if (after.safeRender !== 1) throw new Error('safe render helper count invalid: ' + after.safeRender);
if (after.renderTaskLedger !== 1) throw new Error('renderTaskLedgerPlaceholder count invalid: ' + after.renderTaskLedger);
if (after.r8m < 1) throw new Error('R8M marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');

fs.writeFileSync(corePath, src, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'restore one missing helper only',
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  delete_executed: 'NO'
}, null, 2));
