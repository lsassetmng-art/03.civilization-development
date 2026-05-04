import fs from 'fs';

const [
  ,
  ,
  corePath,
  serverPath,
  coreExtractsPath,
  serverContextPath,
  payloadScanPath,
  decisionOutPath,
  canonOutPath,
  verifyOutPath
] = process.argv;

const core = fs.readFileSync(corePath, 'utf8');
const server = fs.readFileSync(serverPath, 'utf8');

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

  for (let i = fromIndex; i < text.length; i++) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }

    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i++;
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
      i++;
      continue;
    }

    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i++;
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

  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }

    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i++;
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
      i++;
      continue;
    }

    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i++;
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

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function findFunctionRange(text, name) {
  const patterns = [
    new RegExp('(?:async\\s+)?function\\s+' + escRe(name) + '\\s*\\(', 'm'),
    new RegExp('(?:const|let|var)\\s+' + escRe(name) + '\\s*=\\s*(?:async\\s*)?(?:function\\s*)?\\(', 'm')
  ];

  for (const re of patterns) {
    const m = re.exec(text);
    if (!m) continue;

    const start = m.index;
    const open = findOpenBrace(text, start);
    if (open < 0) {
      return {
        name,
        found: true,
        startLine: lineNoAt(text, start),
        endLine: -1,
        text: text.slice(start, Math.min(text.length, start + 8000)),
        note: 'OPEN_BRACE_NOT_FOUND'
      };
    }

    const close = findMatchingBrace(text, open);
    if (close < 0) {
      return {
        name,
        found: true,
        startLine: lineNoAt(text, start),
        endLine: -1,
        text: text.slice(start, Math.min(text.length, start + 12000)),
        note: 'CLOSE_BRACE_NOT_FOUND'
      };
    }

    return {
      name,
      found: true,
      startLine: lineNoAt(text, start),
      endLine: lineNoAt(text, close),
      text: text.slice(start, close + 1),
      note: 'FOUND'
    };
  }

  return {
    name,
    found: false,
    startLine: -1,
    endLine: -1,
    text: '',
    note: 'NOT_FOUND'
  };
}

function contextAroundLines(text, patterns, radius = 18) {
  const lines = text.split(/\r?\n/);
  const out = [];
  const used = new Set();

  for (let i = 0; i < lines.length; i += 1) {
    for (const pattern of patterns) {
      const re = pattern instanceof RegExp ? pattern : new RegExp(escRe(pattern));
      if (!re.test(lines[i])) continue;

      const start = Math.max(0, i - radius);
      const end = Math.min(lines.length - 1, i + radius);
      const key = start + '-' + end;

      if (used.has(key)) break;
      used.add(key);

      out.push('------------------------------------------------------------');
      out.push('hitLine=' + String(i + 1) + ' pattern=' + String(pattern));
      for (let j = start; j <= end; j += 1) {
        out.push(String(j + 1).padStart(6, ' ') + ': ' + lines[j]);
      }
      out.push('');
      break;
    }
  }

  return out.join('\n') || 'NO_CONTEXT_HITS\n';
}

const coreFunctionNames = [
  'aicmR8zMgrMajorCardState',
  'aicmR8zMgrMajorCardRowId',
  'aicmR8zMgrMajorCardTitle',
  'aicmR8zMgrMajorCardIsSelectable',
  'aicmR8zMgrMajorCardIsSelected',
  'aicmR8zMgrMajorCardAllRows',
  'aicmR8zMgrMajorCardSelectedRows',
  'aicmR8zMgrMajorCardRenderCheckbox',
  'aicmR8zMgrMajorCardRenderConfirm',
  'aicmR8zMgrMajorCardRenderOperationPanel',
  'aicmR8zMgrMajorCardOpenConfirm',
  'aicmR8zMgrMajorCardHandleAction',
  'aicmOpenLeaderHandoffConfirmR8S',
  'aicmExecuteMajorLeaderHandoffConfirmR8S',
  'aicmFindMajorForLeaderHandoffR8S',
  'aicmLeaderHandoffSummaryR8S',
  'aicmRenderManagerMajorRows',
  'aicmRenderTaskLedgerSafeR8V4'
];

const coreExtract = [];
coreExtract.push('AICompanyManager V10L-C2A core relevant function extracts');
coreExtract.push('DB_WRITE=NO');
coreExtract.push('API_POST=NO');
coreExtract.push('CORE_PATCH=NO');
coreExtract.push('SERVER_PATCH=NO');
coreExtract.push('');

for (const name of coreFunctionNames) {
  const fn = findFunctionRange(core, name);
  coreExtract.push('============================================================');
  coreExtract.push('FUNCTION=' + name);
  coreExtract.push('FOUND=' + (fn.found ? 'YES' : 'NO'));
  coreExtract.push('LINES=' + fn.startLine + '-' + fn.endLine);
  coreExtract.push('NOTE=' + fn.note);
  coreExtract.push('------------------------------------------------------------');
  coreExtract.push(fn.text || 'NO_FUNCTION_TEXT');
  coreExtract.push('');
}
fs.writeFileSync(coreExtractsPath, coreExtract.join('\n') + '\n');

const serverPatterns = [
  /manager-major\/update/,
  /\/api\/aicm\/v2\/manager-major/,
  /pmlw.*major/i,
  /leader/i,
  /handoff_status_code/,
  /decomposition_status_code/,
  /assigned_leader_label/,
  /section_id/,
  /leader_placement/,
  /app\.post|POST|method/i,
  /UPDATE\s+/i,
  /insert|update|delete/i
];

const serverContext = [];
serverContext.push('AICompanyManager V10L-C2A server relevant route context');
serverContext.push('DB_WRITE=NO');
serverContext.push('API_POST=NO');
serverContext.push('CORE_PATCH=NO');
serverContext.push('SERVER_PATCH=NO');
serverContext.push('');
serverContext.push(contextAroundLines(server, serverPatterns, 24));
fs.writeFileSync(serverContextPath, serverContext.join('\n') + '\n');

const payloadPatterns = [
  'endpoint: "/api/aicm/v2/manager-major/update"',
  'aicm_manager_major_work_item_id',
  'assigned_leader_label',
  'decomposition_status_code',
  'handoff_status_code',
  'owner_civilization_id',
  'note:',
  'managerMajorLeaderHandoffConfirm',
  'r8z-mgr-major-card-confirm-yes',
  'r8z-mgr-major-card-open-handoff-confirm',
  'leaderLabel',
  'section_id',
  'leader_placement_id'
];

const payloadScan = [];
payloadScan.push('AICompanyManager V10L-C2A payload and validation scan');
payloadScan.push('DB_WRITE=NO');
payloadScan.push('API_POST=NO');
payloadScan.push('CORE_PATCH=NO');
payloadScan.push('SERVER_PATCH=NO');
payloadScan.push('');
payloadScan.push('CORE_CONTEXT');
payloadScan.push(contextAroundLines(core, payloadPatterns.map(p => new RegExp(escRe(p))), 18));
payloadScan.push('');
payloadScan.push('SERVER_CONTEXT');
payloadScan.push(contextAroundLines(server, payloadPatterns.map(p => new RegExp(escRe(p))), 18));
fs.writeFileSync(payloadScanPath, payloadScan.join('\n') + '\n');

const oldConfirmFn = findFunctionRange(core, 'aicmOpenLeaderHandoffConfirmR8S');
const oldExecuteFn = findFunctionRange(core, 'aicmExecuteMajorLeaderHandoffConfirmR8S');
const cleanHandleFn = findFunctionRange(core, 'aicmR8zMgrMajorCardHandleAction');
const cleanOpenConfirmFn = findFunctionRange(core, 'aicmR8zMgrMajorCardOpenConfirm');

const endpointCountCore = count(core, '/api/aicm/v2/manager-major/update');
const endpointCountServer = count(server, '/api/aicm/v2/manager-major/update') + count(server, 'manager-major/update');

const hasOldPayload = oldConfirmFn.text.includes('body:') &&
  oldConfirmFn.text.includes('aicm_manager_major_work_item_id') &&
  oldConfirmFn.text.includes('assigned_leader_label') &&
  oldConfirmFn.text.includes('decomposition_status_code') &&
  oldConfirmFn.text.includes('handoff_status_code');

const cleanConfirmIsUiOnly = cleanHandleFn.text.includes('DB更新/API POSTは実行していません') ||
  cleanHandleFn.text.includes('DB更新/API POST') ||
  cleanHandleFn.text.includes('confirm_yes_no_write');

const decision = [];
decision.push('AICompanyManager V10L-C2A readonly decision');
decision.push('DB_WRITE=NO');
decision.push('API_POST=NO');
decision.push('CORE_PATCH=NO');
decision.push('SERVER_PATCH=NO');
decision.push('');
decision.push('MAINTAINABILITY_POLICY');
decision.push('- Existing structure first; no new bridge/helper/action route in C2A.');
decision.push('- C1F manager-major-card-selection helpers are the UI source of truth for current card selection.');
decision.push('- Do not reintroduce DOM afterpatch, setInterval, MutationObserver, or table/card mixed renderer patches.');
decision.push('- C2B should reuse C1F selected rows and confirmation state instead of creating another parallel selection model.');
decision.push('');
decision.push('FINDINGS');
decision.push('- C1F clean card selection UI exists: ' + (count(core, 'AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_HELPER_START') > 0 ? 'YES' : 'NO'));
decision.push('- C1F clean action route exists: ' + (count(core, 'AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_ACTION_ROUTE_START') > 0 ? 'YES' : 'NO'));
decision.push('- Current C1F Yes is UI-only: ' + (cleanConfirmIsUiOnly ? 'YES' : 'UNKNOWN'));
decision.push('- Existing old leader handoff confirm function found: ' + (oldConfirmFn.found ? 'YES' : 'NO'));
decision.push('- Existing old leader handoff execute function found: ' + (oldExecuteFn.found ? 'YES' : 'NO'));
decision.push('- Existing endpoint references in core /api/aicm/v2/manager-major/update: ' + endpointCountCore);
decision.push('- Existing endpoint references in server manager-major/update: ' + endpointCountServer);
decision.push('- Old confirm payload appears to include manager major id / leader label / decomposition status / handoff status: ' + (hasOldPayload ? 'YES' : 'NO'));
decision.push('');
decision.push('C2B_PAYLOAD_CANDIDATE');
decision.push('- endpoint candidate: /api/aicm/v2/manager-major/update');
decision.push('- source candidate: selected rows from aicmR8zMgrMajorCardSelectedRows()');
decision.push('- row id candidate: aicmR8zMgrMajorCardRowId(row, index)');
decision.push('- title candidate: aicmR8zMgrMajorCardTitle(row)');
decision.push('- eligible check candidate: aicmR8zMgrMajorCardIsSelectable(row)');
decision.push('- old payload reference: aicmOpenLeaderHandoffConfirmR8S state.managerMajorLeaderHandoffConfirm.body');
decision.push('');
decision.push('C2B_REQUIRED_VALIDATION');
decision.push('1. selected rows must be non-empty');
decision.push('2. every selected row must have stable manager major id');
decision.push('3. every selected row must still be selectable/pending');
decision.push('4. target Leader / section must be clear before POST');
decision.push('5. if assigned_leader_label / leader_placement_id / section_id is missing, stop before write');
decision.push('6. if multiple Leader candidates are possible, stop before write and require explicit target selection');
decision.push('7. confirmation screen must display target item titles and target Leader/section before POST unlock');
decision.push('');
decision.push('C2A_CONCLUSION');
decision.push('- Do not enable API POST yet.');
decision.push('- Next phase C2B should create payload exact canon and validation UI using existing C1F helpers.');
decision.push('- Server/API/DB write remains locked.');
fs.writeFileSync(decisionOutPath, decision.join('\n') + '\n');

const canon = [];
canon.push('# AICompanyManager V10L-C2A leader handoff read-only investigation canon');
canon.push('');
canon.push('## 1. Status');
canon.push('');
canon.push('- DB_WRITE: NO');
canon.push('- API_POST: NO');
canon.push('- CORE_PATCH: NO');
canon.push('- SERVER_PATCH: NO');
canon.push('- Purpose: read-only investigation before execution unlock');
canon.push('');
canon.push('## 2. Maintainability decision');
canon.push('');
canon.push('C2 must not add another parallel bridge/helper/selection model.');
canon.push('');
canon.push('Use the C1F clean card-selection model as the UI source of truth:');
canon.push('');
canon.push('- aicmR8zMgrMajorCardSelectedRows');
canon.push('- aicmR8zMgrMajorCardRowId');
canon.push('- aicmR8zMgrMajorCardTitle');
canon.push('- aicmR8zMgrMajorCardIsSelectable');
canon.push('- aicmR8zMgrMajorCardOpenConfirm');
canon.push('- aicmR8zMgrMajorCardHandleAction');
canon.push('');
canon.push('## 3. Endpoint candidate');
canon.push('');
canon.push('Endpoint candidate for C2B/C2D:');
canon.push('');
canon.push('- /api/aicm/v2/manager-major/update');
canon.push('');
canon.push('This endpoint must not be POSTed in C2A.');
canon.push('');
canon.push('## 4. Payload candidate');
canon.push('');
canon.push('Payload candidate should be derived from the existing old confirm payload, not invented from scratch.');
canon.push('');
canon.push('Candidate fields:');
canon.push('');
canon.push('- owner_civilization_id');
canon.push('- aicm_manager_major_work_item_id');
canon.push('- assigned_leader_label');
canon.push('- decomposition_status_code');
canon.push('- handoff_status_code');
canon.push('- note');
canon.push('');
canon.push('C2B must confirm whether section_id / leader_placement_id / assigned_leader_id are available and should be added.');
canon.push('');
canon.push('## 5. Routing validation');
canon.push('');
canon.push('Before actual execution:');
canon.push('');
canon.push('1. selected rows must exist');
canon.push('2. each selected row must have a stable id');
canon.push('3. each selected row must be pending/selectable');
canon.push('4. each selected row must have clear Leader routing');
canon.push('5. ambiguous multiple Leader routing must stop before write');
canon.push('6. confirmation UI must show item titles and target Leader/section');
canon.push('');
canon.push('## 6. Next phase');
canon.push('');
canon.push('Next phase: V10L-C2B payload exact canon and validation UI.');
canon.push('');
canon.push('C2B remains:');
canon.push('');
canon.push('- DB_WRITE: NO');
canon.push('- API_POST: NO');
canon.push('- CORE_PATCH: possible only for validation UI, if approved');
canon.push('- SERVER_PATCH: NO unless read-only route evidence requires otherwise');
fs.writeFileSync(canonOutPath, canon.join('\n') + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C2A verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('CORE_PATCH=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=NO');
verify.push('');
verify.push('C1F_HELPER_COUNT=' + count(core, 'AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_HELPER_START'));
verify.push('C1F_ROUTE_COUNT=' + count(core, 'AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_ACTION_ROUTE_START'));
verify.push('OLD_CONFIRM_FUNCTION_FOUND=' + (oldConfirmFn.found ? 'YES' : 'NO'));
verify.push('OLD_EXECUTE_FUNCTION_FOUND=' + (oldExecuteFn.found ? 'YES' : 'NO'));
verify.push('ENDPOINT_CORE_COUNT=' + endpointCountCore);
verify.push('ENDPOINT_SERVER_COUNT=' + endpointCountServer);
verify.push('OLD_PAYLOAD_SHAPE_FOUND=' + (hasOldPayload ? 'YES' : 'NO'));
verify.push('CLEAN_CONFIRM_UI_ONLY=' + (cleanConfirmIsUiOnly ? 'YES' : 'UNKNOWN'));
verify.push('CORE_EXTRACTS=' + coreExtractsPath);
verify.push('SERVER_CONTEXT=' + serverContextPath);
verify.push('PAYLOAD_SCAN=' + payloadScanPath);
verify.push('DECISION_OUT=' + decisionOutPath);
verify.push('CANON_OUT=' + canonOutPath);
fs.writeFileSync(verifyOutPath, verify.join('\n') + '\n');
