import fs from 'fs';

const [
  ,
  ,
  corePath,
  prevActionContextPath,
  verifyOut,
  decisionOut,
  dispatchExtractOut,
  stateExtractOut
] = process.argv;

const src = fs.readFileSync(corePath, 'utf8');
const prevActionContext = fs.existsSync(prevActionContextPath)
  ? fs.readFileSync(prevActionContextPath, 'utf8')
  : '';

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

function functionRangesContaining(needle) {
  const out = [];
  const fnRe = /(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/g;
  let m;

  while ((m = fnRe.exec(src)) !== null) {
    const name = m[1];
    const range = findFunctionRange(src, name);
    if (!range) continue;
    if (range.text.includes(needle)) {
      out.push(range);
    }
  }

  return out;
}

function contextAround(text, needle, radius = 25) {
  const lines = text.split(/\r?\n/);
  const out = [];

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes(needle)) {
      const start = Math.max(0, i - radius);
      const end = Math.min(lines.length - 1, i + radius);
      out.push('--- needle=' + needle + ' around L' + (i + 1));
      for (let j = start; j <= end; j += 1) {
        out.push(String(j + 1).padStart(6, ' ') + ': ' + lines[j]);
      }
      out.push('');
    }
  }

  return out.join('\n');
}

const routeAction = 'r8z-mgr-major-card-route-apply-section';
const oldC2dAction = 'r8z-c2d-apply-section-select';

const handle = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');
const stateFn = findFunctionRange(src, 'aicmR8zMgrMajorCardState');
const bagFn = findFunctionRange(src, 'aicmR8zC2cBag');
const applyFn = findFunctionRange(src, 'aicmR8zC2cApplySectionChoice');
const openConfirmFn = findFunctionRange(src, 'aicmR8zMgrMajorCardOpenConfirm');
const renderConfirmFn = findFunctionRange(src, 'aicmR8zMgrMajorCardRenderConfirm');

const actionCallerRanges = functionRangesContaining('aicmR8zMgrMajorCardHandleAction');
const dataCoreGetterRanges = functionRangesContaining('data-core-action');
const routeActionRanges = functionRangesContaining(routeAction);
const stateSelectionRanges = functionRangesContaining('r8zMgrMajorCardSelection');
const handoffBatchRouteRanges = functionRangesContaining('handoffBatchRoute');

const dispatchLines = [];
dispatchLines.push('AICompanyManager V10L-C2D4 dispatcher extract');
dispatchLines.push('DB_WRITE=NO');
dispatchLines.push('API_POST=NO');
dispatchLines.push('CORE_PATCH=NO');
dispatchLines.push('SERVER_PATCH=NO');
dispatchLines.push('');

dispatchLines.push('============================================================');
dispatchLines.push('FUNCTIONS_CONTAINING_aicmR8zMgrMajorCardHandleAction');
for (const r of actionCallerRanges) {
  dispatchLines.push('FUNCTION=' + r.name + ' L' + r.startLine + '-L' + r.endLine);
  dispatchLines.push(r.text);
  dispatchLines.push('');
}

dispatchLines.push('============================================================');
dispatchLines.push('FUNCTIONS_CONTAINING_data-core-action');
for (const r of dataCoreGetterRanges) {
  dispatchLines.push('FUNCTION=' + r.name + ' L' + r.startLine + '-L' + r.endLine);
  dispatchLines.push(r.text);
  dispatchLines.push('');
}

dispatchLines.push('============================================================');
dispatchLines.push('FUNCTIONS_CONTAINING_ROUTE_ACTION');
for (const r of routeActionRanges) {
  dispatchLines.push('FUNCTION=' + r.name + ' L' + r.startLine + '-L' + r.endLine);
  dispatchLines.push(r.text);
  dispatchLines.push('');
}

dispatchLines.push('============================================================');
dispatchLines.push('RAW_CONTEXT_ROUTE_ACTION');
dispatchLines.push(contextAround(src, routeAction, 25));
dispatchLines.push('============================================================');
dispatchLines.push('RAW_CONTEXT_HANDLE_CALL');
dispatchLines.push(contextAround(src, 'aicmR8zMgrMajorCardHandleAction', 25));
dispatchLines.push('============================================================');
dispatchLines.push('PREVIOUS_ACTION_CONTEXT');
dispatchLines.push(prevActionContext);
fs.writeFileSync(dispatchExtractOut, dispatchLines.join('\n') + '\n');

const stateLines = [];
stateLines.push('AICompanyManager V10L-C2D4 state extract');
stateLines.push('DB_WRITE=NO');
stateLines.push('API_POST=NO');
stateLines.push('CORE_PATCH=NO');
stateLines.push('SERVER_PATCH=NO');
stateLines.push('');

for (const r of [stateFn, bagFn, applyFn, openConfirmFn, renderConfirmFn].filter(Boolean)) {
  stateLines.push('============================================================');
  stateLines.push('FUNCTION=' + r.name + ' L' + r.startLine + '-L' + r.endLine);
  stateLines.push(r.text);
  stateLines.push('');
}

stateLines.push('============================================================');
stateLines.push('FUNCTIONS_CONTAINING_r8zMgrMajorCardSelection');
for (const r of stateSelectionRanges) {
  stateLines.push('FUNCTION=' + r.name + ' L' + r.startLine + '-L' + r.endLine);
}
stateLines.push('');
stateLines.push('============================================================');
stateLines.push('FUNCTIONS_CONTAINING_handoffBatchRoute');
for (const r of handoffBatchRouteRanges) {
  stateLines.push('FUNCTION=' + r.name + ' L' + r.startLine + '-L' + r.endLine);
}
stateLines.push('');
fs.writeFileSync(stateExtractOut, stateLines.join('\n') + '\n');

function likelyGateInfo(r) {
  const text = r.text;
  return {
    name: r.name,
    line: r.startLine,
    hasExactRouteAction: text.includes(routeAction),
    hasOldC2dAction: text.includes(oldC2dAction),
    hasMgrMajorCardPrefix: text.includes('r8z-mgr-major-card'),
    hasRoutePrefix: text.includes('r8z-mgr-major-card-route'),
    hasHandlerCall: text.includes('aicmR8zMgrMajorCardHandleAction'),
    hasActionStartsWith: text.includes('.startsWith(') || text.includes('startsWith('),
    hasActionSwitch: text.includes('switch') && text.includes('action'),
    hasIfAction: text.includes('if (action') || text.includes('if(action') || text.includes('else if (action')
  };
}

const callerInfos = actionCallerRanges.map(likelyGateInfo);
const dataCoreInfos = dataCoreGetterRanges.map(likelyGateInfo);

const nonDefinitionCallers = callerInfos.filter(x => x.name !== 'aicmR8zMgrMajorCardHandleAction');
const callerHasExactAction = nonDefinitionCallers.some(x => x.hasExactRouteAction);
const callerHasRoutePrefix = nonDefinitionCallers.some(x => x.hasRoutePrefix);
const callerHasMgrPrefix = nonDefinitionCallers.some(x => x.hasMgrMajorCardPrefix);
const callerHasHandlerCall = nonDefinitionCallers.some(x => x.hasHandlerCall);

const verify = [];
verify.push('AICompanyManager V10L-C2D4 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('CORE_PATCH=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('HANDLE_FUNCTION_FOUND=' + (handle ? 'YES' : 'NO'));
verify.push('STATE_FUNCTION_FOUND=' + (stateFn ? 'YES' : 'NO'));
verify.push('BAG_FUNCTION_FOUND=' + (bagFn ? 'YES' : 'NO'));
verify.push('APPLY_FUNCTION_FOUND=' + (applyFn ? 'YES' : 'NO'));
verify.push('OPEN_CONFIRM_FUNCTION_FOUND=' + (openConfirmFn ? 'YES' : 'NO'));
verify.push('RENDER_CONFIRM_FUNCTION_FOUND=' + (renderConfirmFn ? 'YES' : 'NO'));
verify.push('');
verify.push('ROUTE_ACTION_TOTAL_COUNT=' + count(src, routeAction));
verify.push('ROUTE_ACTION_IN_HANDLE_COUNT=' + (handle ? count(handle.text, routeAction) : 0));
verify.push('ROUTE_ACTION_IN_DISPATCH_CALLERS_COUNT=' + nonDefinitionCallers.reduce((n, x) => n + (x.hasExactRouteAction ? 1 : 0), 0));
verify.push('DISPATCH_CALLER_FUNCTION_COUNT=' + nonDefinitionCallers.length);
verify.push('DISPATCH_CALLER_HAS_HANDLER_CALL=' + (callerHasHandlerCall ? 'YES' : 'NO'));
verify.push('DISPATCH_CALLER_HAS_EXACT_ROUTE_ACTION=' + (callerHasExactAction ? 'YES' : 'NO'));
verify.push('DISPATCH_CALLER_HAS_ROUTE_PREFIX=' + (callerHasRoutePrefix ? 'YES' : 'NO'));
verify.push('DISPATCH_CALLER_HAS_MGR_MAJOR_CARD_PREFIX=' + (callerHasMgrPrefix ? 'YES' : 'NO'));
verify.push('');
verify.push('DATA_CORE_ACTION_GETTER_FUNCTION_COUNT=' + dataCoreGetterRanges.length);
verify.push('DATA_CORE_ACTION_GETTER_HAS_ROUTE_PREFIX=' + (dataCoreInfos.some(x => x.hasRoutePrefix) ? 'YES' : 'NO'));
verify.push('DATA_CORE_ACTION_GETTER_HAS_MGR_PREFIX=' + (dataCoreInfos.some(x => x.hasMgrMajorCardPrefix) ? 'YES' : 'NO'));
verify.push('');
verify.push('STATE_SELECTION_FUNCTION_COUNT=' + stateSelectionRanges.length);
verify.push('HANDOFF_BATCH_ROUTE_FUNCTION_COUNT=' + handoffBatchRouteRanges.length);
verify.push('STATE_FN_RETURNS_STATE_SELECTION=' + (stateFn && stateFn.text.includes('r8zMgrMajorCardSelection') ? 'YES' : 'NO'));
verify.push('BAG_FN_RETURNS_STATE_SELECTION=' + (bagFn && bagFn.text.includes('state.r8zMgrMajorCardSelection') ? 'YES' : 'NO'));
verify.push('APPLY_FN_WRITES_HANDOFF_BATCH_ROUTE=' + (applyFn && applyFn.text.includes('bag.handoffBatchRoute') ? 'YES' : 'NO'));
verify.push('OPEN_CONFIRM_REBUILDS_VALIDATION=' + (openConfirmFn && openConfirmFn.text.includes('aicmR8zC2bValidateLeaderHandoffRows') ? 'YES' : 'NO'));
verify.push('RENDER_CONFIRM_LIVE_VALIDATION=' + (renderConfirmFn && renderConfirmFn.text.includes('liveValidation') ? 'YES' : 'NO'));
verify.push('');
verify.push('DISPATCH_EXTRACT=' + dispatchExtractOut);
verify.push('STATE_EXTRACT=' + stateExtractOut);
fs.writeFileSync(verifyOut, verify.join('\n') + '\n');

const decision = [];
decision.push('AICompanyManager V10L-C2D4 dispatcher/state decision');
decision.push('DB_WRITE=NO');
decision.push('API_POST=NO');
decision.push('CORE_PATCH=NO');
decision.push('SERVER_PATCH=NO');
decision.push('');

if (!handle) {
  decision.push('CONCLUSION=HANDLE_FUNCTION_MISSING');
  decision.push('LIKELY_CAUSE=カード操作handler自体がない。');
  decision.push('NEXT=既存構造へ復旧。');
} else if (!callerHasHandlerCall) {
  decision.push('CONCLUSION=NO_DISPATCH_CALL_TO_CARD_HANDLER');
  decision.push('LIKELY_CAUSE=課を適用buttonのdata-core-actionは存在するが、クリックdispatcherからカードhandlerへ渡されていない。');
  decision.push('NEXT=既存click dispatcherに、r8z-mgr-major-card-route-* を aicmR8zMgrMajorCardHandleAction へ渡す最小統合。');
} else if (!callerHasExactAction && !callerHasRoutePrefix && !callerHasMgrPrefix) {
  decision.push('CONCLUSION=DISPATCH_GATE_DOES_NOT_ALLOW_ROUTE_ACTION');
  decision.push('LIKELY_CAUSE=dispatcherはカードhandlerを呼ぶが、許可action/gateにroute action prefixが含まれていない。');
  decision.push('NEXT=既存dispatcher gateへ r8z-mgr-major-card-route- prefix を追加。新helper禁止。');
} else if (callerHasHandlerCall && (callerHasRoutePrefix || callerHasMgrPrefix || callerHasExactAction) && (!bagFn || !bagFn.text.includes('state.r8zMgrMajorCardSelection'))) {
  decision.push('CONCLUSION=ROUTE_ACTION_DISPATCH_OK_BUT_STATE_NOT_CANONICAL');
  decision.push('LIKELY_CAUSE=clickは届くが、route stateがC1F canonical selection stateに保存されていない。');
  decision.push('NEXT=aicmR8zC2cBag を state.r8zMgrMajorCardSelection に統一。');
} else if (callerHasHandlerCall && (callerHasRoutePrefix || callerHasMgrPrefix || callerHasExactAction) && applyFn && applyFn.text.includes('bag.handoffBatchRoute') && renderConfirmFn && renderConfirmFn.text.includes('liveValidation')) {
  decision.push('CONCLUSION=DISPATCH_AND_STATE_STATICALLY_OK_NEED_BROWSER_EVENT_PROBE');
  decision.push('LIKELY_CAUSE=静的にはdispatcher/stateともにOK。実ブラウザでevent targetがbuttonではなく内側要素になり、target.closestまたはaction取得がズレている可能性。');
  decision.push('NEXT=既存dispatcherのaction target取得処理だけ確認し、closest("[data-core-action]") へ統一する最小修正候補。');
} else {
  decision.push('CONCLUSION=UNKNOWN_REVIEW_EXTRACTS');
  decision.push('LIKELY_CAUSE=静的判定では確定不能。');
  decision.push('NEXT=030_dispatcher_extract と 040_state_extract を確認。');
}

decision.push('');
decision.push('MAINTAINABILITY_POLICY=NO_MORE_C2C_ADDON_PATCHES');
decision.push('PATCH_NEXT=C2D5_ONLY_IF_DECISION_IDENTIFIES_ONE_EXISTING_FUNCTION_TO_CHANGE');
decision.push('C2D5_POLICY=既存dispatcherまたは既存state関数の1箇所だけ。新規bridge/helper/setInterval/DOM後付け禁止。');
fs.writeFileSync(decisionOut, decision.join('\n') + '\n');
