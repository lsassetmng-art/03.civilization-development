import fs from 'fs';

const [,, corePath, verifyOut, decisionOut, extractOut, markerOut] = process.argv;
const src = fs.readFileSync(corePath, 'utf8');

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), 'g')) || []).length;
}

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function findOpenBrace(text, fromIndex) {
  let state = 'normal';
  let escape = false;

  for (let i = fromIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i += 1;
      }
      continue;
    }
    if (state === 'single') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === "'") state = 'normal';
      continue;
    }
    if (state === 'double') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') state = 'normal';
      continue;
    }
    if (state === 'template') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '`') state = 'normal';
      continue;
    }

    if (ch === '/' && nx === '/') {
      state = 'lineComment';
      i += 1;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = 'single';
      continue;
    }
    if (ch === '"') {
      state = 'double';
      continue;
    }
    if (ch === '`') {
      state = 'template';
      continue;
    }

    if (ch === '{') return i;
  }

  return -1;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let state = 'normal';
  let escape = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i += 1;
      }
      continue;
    }
    if (state === 'single') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === "'") state = 'normal';
      continue;
    }
    if (state === 'double') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') state = 'normal';
      continue;
    }
    if (state === 'template') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '`') state = 'normal';
      continue;
    }

    if (ch === '/' && nx === '/') {
      state = 'lineComment';
      i += 1;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = 'single';
      continue;
    }
    if (ch === '"') {
      state = 'double';
      continue;
    }
    if (ch === '`') {
      state = 'template';
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function findFunctionRange(text, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + escRe(name) + '\\s*\\(', 'm');
  const m = re.exec(text);
  if (!m) return null;

  const start = m.index;
  const open = findOpenBrace(text, start);
  if (open < 0) return null;

  const close = findMatchingBrace(text, open);
  if (close < 0) return null;

  return {
    name,
    start,
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

const functions = [
  'aicmR8zMgrMajorCardState',
  'aicmR8zC2cBag',
  'aicmR8zC2cChoice',
  'aicmR8zC2cApplySectionChoice',
  'aicmR8zC2cEffectiveRoute',
  'aicmR8zC2cRenderRoutePicker',
  'aicmR8zC2cSectionCandidates',
  'aicmR8zC2cNormalizeSection',
  'aicmR8zMgrMajorCardRenderConfirm',
  'aicmR8zMgrMajorCardOpenConfirm',
  'aicmR8zMgrMajorCardHandleAction',
  'aicmR8zC2bValidateLeaderHandoffRows',
  'aicmR8zC2bBuildLeaderHandoffPayload'
];

const ranges = {};
for (const name of functions) {
  ranges[name] = findFunctionRange(src, name);
}

const handle = ranges.aicmR8zMgrMajorCardHandleAction ? ranges.aicmR8zMgrMajorCardHandleAction.text : '';
const stateFn = ranges.aicmR8zMgrMajorCardState ? ranges.aicmR8zMgrMajorCardState.text : '';
const bagFn = ranges.aicmR8zC2cBag ? ranges.aicmR8zC2cBag.text : '';
const confirmFn = ranges.aicmR8zMgrMajorCardRenderConfirm ? ranges.aicmR8zMgrMajorCardRenderConfirm.text : '';
const applyFn = ranges.aicmR8zC2cApplySectionChoice ? ranges.aicmR8zC2cApplySectionChoice.text : '';
const effectiveFn = ranges.aicmR8zC2cEffectiveRoute ? ranges.aicmR8zC2cEffectiveRoute.text : '';
const pickerFn = ranges.aicmR8zC2cRenderRoutePicker ? ranges.aicmR8zC2cRenderRoutePicker.text : '';

const markerCounts = [
  ['C2C_MARKER', 'AICM_R8Z_MGR_MAJOR_CARD_C2C_BATCH_SECTION_LEADER_ROUTE'],
  ['C2C2_MARKER', 'AICM_R8Z_MGR_MAJOR_CARD_C2C2_SECTION_LEADER_COMBOBOX'],
  ['C2C3_MARKER', 'AICM_R8Z_MGR_MAJOR_CARD_C2C3_COMBOBOX_APPLY_FIX'],
  ['C2C4_MARKER', 'AICM_R8Z_MGR_MAJOR_CARD_C2C4_ROUTE_STATE_PERSIST_FIX'],
  ['C1F_MARKER', 'AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1'],
  ['C2B_MARKER', 'AICM_R8Z_MGR_MAJOR_CARD_C2B_PAYLOAD_VALIDATION']
];

const actionCounts = [
  ['OLD_BUTTON_SELECT_SECTION_ACTION', 'r8z-c2c-select-section'],
  ['OLD_BUTTON_SELECT_LEADER_ACTION', 'r8z-c2c-select-leader'],
  ['C2C2_APPLY_SECTION_ACTION', 'r8z-c2c-apply-section-select'],
  ['C2C2_APPLY_LEADER_ACTION', 'r8z-c2c-apply-leader-select'],
  ['C2C3_APPLY_SECTION_ACTION', 'r8z-c2c3-apply-section-select'],
  ['C2C3_APPLY_LEADER_ACTION', 'r8z-c2c3-apply-leader-select'],
  ['C2C4_APPLY_SECTION_ACTION', 'r8z-c2c4-apply-section-select'],
  ['C2C4_APPLY_LEADER_ACTION', 'r8z-c2c4-apply-leader-select'],
  ['CLEAR_ROUTE_ACTION', 'r8z-c2c-clear-route']
];

const markerLines = [];
markerLines.push('AICompanyManager V10L-C2C5 marker/action counts');
markerLines.push('DB_WRITE=NO');
markerLines.push('API_POST=NO');
markerLines.push('CORE_PATCH=NO');
markerLines.push('SERVER_PATCH=NO');
markerLines.push('');

for (const [label, needle] of markerCounts) {
  markerLines.push(label + '_COUNT=' + count(src, needle));
}
markerLines.push('');
for (const [label, needle] of actionCounts) {
  markerLines.push(label + '_TOTAL_COUNT=' + count(src, needle));
  markerLines.push(label + '_IN_HANDLE_COUNT=' + count(handle, needle));
}
markerLines.push('');
markerLines.push('STATE_FUNCTION_FOUND=' + (ranges.aicmR8zMgrMajorCardState ? 'YES' : 'NO'));
markerLines.push('BAG_FUNCTION_FOUND=' + (ranges.aicmR8zC2cBag ? 'YES' : 'NO'));
markerLines.push('APPLY_FUNCTION_FOUND=' + (ranges.aicmR8zC2cApplySectionChoice ? 'YES' : 'NO'));
markerLines.push('EFFECTIVE_ROUTE_FUNCTION_FOUND=' + (ranges.aicmR8zC2cEffectiveRoute ? 'YES' : 'NO'));
markerLines.push('RENDER_CONFIRM_FUNCTION_FOUND=' + (ranges.aicmR8zMgrMajorCardRenderConfirm ? 'YES' : 'NO'));
markerLines.push('PICKER_FUNCTION_FOUND=' + (ranges.aicmR8zC2cRenderRoutePicker ? 'YES' : 'NO'));
markerLines.push('');
markerLines.push('STATE_FN_CONTAINS_STATE_DOT=' + (stateFn.includes('state.') ? 'YES' : 'NO'));
markerLines.push('STATE_FN_CONTAINS_WINDOW=' + (stateFn.includes('window') ? 'YES' : 'NO'));
markerLines.push('BAG_FN_WRITES_HANDOFF_BATCH_ROUTE=' + (bagFn.includes('handoffBatchRoute') ? 'YES' : 'NO'));
markerLines.push('APPLY_FN_WRITES_ROUTE_APPLIED_AT=' + (applyFn.includes('routeAppliedAt') ? 'YES' : 'NO'));
markerLines.push('CONFIRM_FN_USES_EFFECTIVE_ROUTE=' + (confirmFn.includes('aicmR8zC2cEffectiveRoute') ? 'YES' : 'NO'));
markerLines.push('PICKER_FN_HAS_OPTION_DATA_DEPARTMENT=' + (pickerFn.includes('data-department-label') ? 'YES' : 'NO'));
fs.writeFileSync(markerOut, markerLines.join('\n') + '\n');

const extract = [];
extract.push('AICompanyManager V10L-C2C5 relevant function extracts');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('CORE_PATCH=NO');
extract.push('SERVER_PATCH=NO');
extract.push('');

for (const name of functions) {
  extract.push('============================================================');
  if (ranges[name]) {
    extract.push('FUNCTION=' + name + ' L' + ranges[name].startLine + '-L' + ranges[name].endLine);
    extract.push(ranges[name].text);
  } else {
    extract.push('FUNCTION=' + name + ' NOT_FOUND');
  }
  extract.push('');
}
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const totalC2Markers =
  count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2C_BATCH_SECTION_LEADER_ROUTE') +
  count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2C2_SECTION_LEADER_COMBOBOX') +
  count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2C3_COMBOBOX_APPLY_FIX') +
  count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2C4_ROUTE_STATE_PERSIST_FIX');

const totalApplyActionsInHandle =
  count(handle, 'r8z-c2c-apply-section-select') +
  count(handle, 'r8z-c2c3-apply-section-select') +
  count(handle, 'r8z-c2c4-apply-section-select');

const oldButtonActionsInPicker =
  count(pickerFn, 'r8z-c2c-select-section') +
  count(pickerFn, 'r8z-c2c-select-leader');

const risk = [];
const recommendation = [];

if (totalC2Markers >= 4) {
  risk.push('HIGH: C2C/C2C2/C2C3/C2C4 layers all exist. Further add-on patching is not maintainable.');
}
if (totalApplyActionsInHandle > 1) {
  risk.push('HIGH: Multiple section apply action families exist inside handleAction.');
}
if (!stateFn.includes('state.')) {
  risk.push('HIGH: selection state function may not persist through rerender if it does not bind to state.');
}
if (!bagFn.includes('handoffBatchRoute')) {
  risk.push('HIGH: route bag may not be stored in the same state object.');
}
if (!confirmFn.includes('aicmR8zC2cEffectiveRoute')) {
  risk.push('MEDIUM: confirm render may display stale confirm.route instead of current effective route.');
}
if (!pickerFn.includes('data-department-label')) {
  risk.push('MEDIUM: selected option does not carry department label.');
}
if (oldButtonActionsInPicker > 0) {
  risk.push('MEDIUM: old button action still appears in route picker.');
}

if (!risk.length) {
  risk.push('LOW: static audit did not find major maintainability warning, but runtime state still needs browser-side confirmation.');
}

recommendation.push('STOP adding C2C5 repair layers.');
recommendation.push('Next should be C2D consolidation, not another incremental patch.');
recommendation.push('C2D should leave only one route picker, one apply-section action, one apply-leader action, and one persistent state location.');
recommendation.push('Route state should be stored in the same canonical state object used by aicmR8zMgrMajorCardSelectedRows().');
recommendation.push('If state persistence is ambiguous, centralize on state.r8zMgrMajorCardSelection.handoffBatchRoute or the existing exact C1F bag object, not a new parallel object.');
recommendation.push('After consolidation, remove or neutralize old C2C2/C2C3/C2C4 action branches.');

const decision = [];
decision.push('AICompanyManager V10L-C2C5 maintainability decision');
decision.push('DB_WRITE=NO');
decision.push('API_POST=NO');
decision.push('CORE_PATCH=NO');
decision.push('SERVER_PATCH=NO');
decision.push('');
decision.push('MAINTAINABILITY_JUDGEMENT=' + (risk.some(x => x.startsWith('HIGH')) ? 'NOT_OK_FOR_MORE_ADDON_PATCHES' : 'OK_WITH_CAUTION'));
decision.push('');
decision.push('RISK_FINDINGS');
for (const r of risk) decision.push('- ' + r);
decision.push('');
decision.push('RECOMMENDED_NEXT_ACTION');
for (const r of recommendation) decision.push('- ' + r);
decision.push('');
decision.push('EXPECTED_NEXT_PHASE=V10L-C2D_ROUTE_SELECTION_CONSOLIDATION_PATCH');
decision.push('PATCH_POLICY_FOR_C2D=remove/replace duplicate C2C route layers, do not add another layer');
fs.writeFileSync(decisionOut, decision.join('\n') + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C2C5 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('CORE_PATCH=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('TOTAL_C2_MARKER_COUNT=' + totalC2Markers);
verify.push('TOTAL_SECTION_APPLY_ACTIONS_IN_HANDLE=' + totalApplyActionsInHandle);
verify.push('OLD_BUTTON_ACTIONS_IN_PICKER=' + oldButtonActionsInPicker);
verify.push('STATE_FUNCTION_FOUND=' + (ranges.aicmR8zMgrMajorCardState ? 'YES' : 'NO'));
verify.push('STATE_FN_CONTAINS_STATE_DOT=' + (stateFn.includes('state.') ? 'YES' : 'NO'));
verify.push('BAG_FN_WRITES_HANDOFF_BATCH_ROUTE=' + (bagFn.includes('handoffBatchRoute') ? 'YES' : 'NO'));
verify.push('CONFIRM_FN_USES_EFFECTIVE_ROUTE=' + (confirmFn.includes('aicmR8zC2cEffectiveRoute') ? 'YES' : 'NO'));
verify.push('PICKER_FN_HAS_OPTION_DATA_DEPARTMENT=' + (pickerFn.includes('data-department-label') ? 'YES' : 'NO'));
verify.push('MAINTAINABILITY_JUDGEMENT=' + (risk.some(x => x.startsWith('HIGH')) ? 'NOT_OK_FOR_MORE_ADDON_PATCHES' : 'OK_WITH_CAUTION'));
verify.push('DECISION_OUT=' + decisionOut);
verify.push('EXTRACT_OUT=' + extractOut);
verify.push('MARKER_OUT=' + markerOut);
fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
