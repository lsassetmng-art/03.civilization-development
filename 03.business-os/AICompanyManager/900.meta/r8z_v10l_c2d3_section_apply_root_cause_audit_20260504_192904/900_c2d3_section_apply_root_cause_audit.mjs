import fs from 'fs';

const [
  ,
  ,
  localCorePath,
  servedCorePath,
  verifyOut,
  decisionOut,
  localExtractOut,
  servedExtractOut,
  actionContextOut
] = process.argv;

function readMaybe(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (_) {
    return '';
  }
}

const localSrc = readMaybe(localCorePath);
const servedSrc = readMaybe(servedCorePath);

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), 'g')) || []).length;
}

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function contextAround(text, needle, radius = 18) {
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

function extract(label, src, outPath) {
  const names = [
    'aicmR8zMgrMajorCardHandleAction',
    'aicmR8zC2cRenderRoutePicker',
    'aicmR8zC2cApplySectionChoice',
    'aicmR8zC2cEffectiveRoute',
    'aicmR8zC2d2LedgerDepartmentFromSelectedRows',
    'aicmR8zMgrMajorCardOpenConfirm',
    'aicmR8zMgrMajorCardRenderConfirm',
    'aicmR8zC2bValidateLeaderHandoffRows',
    'aicmR8zC2bBuildLeaderHandoffPayload'
  ];

  const out = [];
  out.push('AICompanyManager V10L-C2D3 extract: ' + label);
  out.push('DB_WRITE=NO');
  out.push('API_POST=NO');
  out.push('CORE_PATCH=NO');
  out.push('SERVER_PATCH=NO');
  out.push('');

  for (const name of names) {
    const fn = findFunctionRange(src, name);
    out.push('============================================================');
    if (fn) {
      out.push('FUNCTION=' + name + ' L' + fn.startLine + '-L' + fn.endLine);
      out.push(fn.text);
    } else {
      out.push('FUNCTION=' + name + ' NOT_FOUND');
    }
    out.push('');
  }

  fs.writeFileSync(outPath, out.join('\n') + '\n');
}

function callerCount(src) {
  const re = /aicmR8zMgrMajorCardHandleAction\s*\(/g;
  let m;
  let total = 0;
  let definition = 0;
  while ((m = re.exec(src)) !== null) {
    total += 1;
    const before = src.slice(Math.max(0, m.index - 40), m.index);
    if (/function\s+$/.test(before) || /function\s*$/.test(before)) {
      definition += 1;
    }
  }
  return { total, definition, calls: total - definition };
}

function metrics(label, src) {
  const handle = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');
  const picker = findFunctionRange(src, 'aicmR8zC2cRenderRoutePicker');
  const apply = findFunctionRange(src, 'aicmR8zC2cApplySectionChoice');
  const effective = findFunctionRange(src, 'aicmR8zC2cEffectiveRoute');
  const confirm = findFunctionRange(src, 'aicmR8zMgrMajorCardRenderConfirm');
  const callers = callerCount(src);

  const handleText = handle ? handle.text : '';
  const pickerText = picker ? picker.text : '';
  const applyText = apply ? apply.text : '';
  const effectiveText = effective ? effective.text : '';
  const confirmText = confirm ? confirm.text : '';

  return {
    label,
    size: src.length,
    hashPresent: src.length > 1000 ? 'YES' : 'NO',
    handleFound: handle ? 'YES' : 'NO',
    pickerFound: picker ? 'YES' : 'NO',
    applyFound: apply ? 'YES' : 'NO',
    effectiveFound: effective ? 'YES' : 'NO',
    confirmFound: confirm ? 'YES' : 'NO',

    callerTotal: callers.total,
    callerDefinition: callers.definition,
    callerCalls: callers.calls,

    actionTotal: count(src, 'r8z-mgr-major-card-route-apply-section'),
    actionInHandle: count(handleText, 'r8z-mgr-major-card-route-apply-section'),
    actionInPicker: count(pickerText, 'r8z-mgr-major-card-route-apply-section'),

    pickerButton: count(pickerText, 'data-core-action="r8z-mgr-major-card-route-apply-section"'),
    pickerSelectAttr: count(pickerText, 'data-r8z-mgr-major-card-route-section-select'),
    handleSelectAttr: count(handleText, 'data-r8z-mgr-major-card-route-section-select'),
    handleClosestPicker: count(handleText, 'data-r8z-mgr-major-card-route-picker'),

    oldC2dActionInHandle: count(handleText, 'r8z-c2d-apply-section-select'),
    oldC2cActionInHandle:
      count(handleText, 'r8z-c2c-apply-section-select') +
      count(handleText, 'r8z-c2c3-apply-section-select') +
      count(handleText, 'r8z-c2c4-apply-section-select'),

    applyWritesRoute: count(applyText, 'bag.handoffBatchRoute'),
    applyUsesLedgerDept: count(applyText, 'aicmR8zC2d2LedgerDepartmentFromSelectedRows'),
    effectiveUsesLedgerDept: count(effectiveText, 'aicmR8zC2d2LedgerDepartmentFromSelectedRows'),
    confirmLiveValidation: count(confirmText, 'liveValidation'),

    globalDataCoreActionCount: count(src, 'data-core-action'),
    globalGetCoreActionCount:
      count(src, 'getAttribute("data-core-action")') +
      count(src, "getAttribute('data-core-action')") +
      count(src, 'dataset.coreAction')
  };
}

extract('LOCAL_CORE', localSrc, localExtractOut);
extract('SERVED_CORE', servedSrc, servedExtractOut);

const local = metrics('LOCAL', localSrc);
const served = metrics('SERVED', servedSrc);

const actionContext = [];
actionContext.push('AICompanyManager V10L-C2D3 action dispatch contexts');
actionContext.push('DB_WRITE=NO');
actionContext.push('API_POST=NO');
actionContext.push('');

for (const [label, src] of [['LOCAL', localSrc], ['SERVED', servedSrc]]) {
  actionContext.push('============================================================');
  actionContext.push(label + ' contexts: r8z-mgr-major-card-route-apply-section');
  actionContext.push(contextAround(src, 'r8z-mgr-major-card-route-apply-section', 16));
  actionContext.push('============================================================');
  actionContext.push(label + ' contexts: aicmR8zMgrMajorCardHandleAction');
  actionContext.push(contextAround(src, 'aicmR8zMgrMajorCardHandleAction', 18));
  actionContext.push('============================================================');
  actionContext.push(label + ' contexts: data-core-action getter');
  actionContext.push(contextAround(src, 'getAttribute("data-core-action")', 18));
  actionContext.push(contextAround(src, "getAttribute('data-core-action')", 18));
  actionContext.push(contextAround(src, 'dataset.coreAction', 18));
}
fs.writeFileSync(actionContextOut, actionContext.join('\n') + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C2D3 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('CORE_PATCH=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');

for (const m of [local, served]) {
  verify.push('[' + m.label + ']');
  verify.push(m.label + '_SIZE=' + m.size);
  verify.push(m.label + '_HANDLE_FOUND=' + m.handleFound);
  verify.push(m.label + '_PICKER_FOUND=' + m.pickerFound);
  verify.push(m.label + '_APPLY_FOUND=' + m.applyFound);
  verify.push(m.label + '_EFFECTIVE_FOUND=' + m.effectiveFound);
  verify.push(m.label + '_CONFIRM_FOUND=' + m.confirmFound);
  verify.push(m.label + '_CARD_HANDLER_CALL_TOTAL=' + m.callerTotal);
  verify.push(m.label + '_CARD_HANDLER_DEFINITION_COUNT=' + m.callerDefinition);
  verify.push(m.label + '_CARD_HANDLER_CALLER_COUNT=' + m.callerCalls);
  verify.push(m.label + '_SECTION_ACTION_TOTAL=' + m.actionTotal);
  verify.push(m.label + '_SECTION_ACTION_IN_HANDLE=' + m.actionInHandle);
  verify.push(m.label + '_SECTION_ACTION_IN_PICKER=' + m.actionInPicker);
  verify.push(m.label + '_PICKER_BUTTON_COUNT=' + m.pickerButton);
  verify.push(m.label + '_PICKER_SELECT_ATTR_COUNT=' + m.pickerSelectAttr);
  verify.push(m.label + '_HANDLE_SELECT_ATTR_COUNT=' + m.handleSelectAttr);
  verify.push(m.label + '_HANDLE_CLOSEST_PICKER_COUNT=' + m.handleClosestPicker);
  verify.push(m.label + '_OLD_C2D_ACTION_IN_HANDLE=' + m.oldC2dActionInHandle);
  verify.push(m.label + '_OLD_C2C_ACTIONS_IN_HANDLE=' + m.oldC2cActionInHandle);
  verify.push(m.label + '_APPLY_WRITES_ROUTE=' + m.applyWritesRoute);
  verify.push(m.label + '_APPLY_USES_LEDGER_DEPT=' + m.applyUsesLedgerDept);
  verify.push(m.label + '_EFFECTIVE_USES_LEDGER_DEPT=' + m.effectiveUsesLedgerDept);
  verify.push(m.label + '_CONFIRM_LIVE_VALIDATION=' + m.confirmLiveValidation);
  verify.push(m.label + '_GLOBAL_DATA_CORE_ACTION_COUNT=' + m.globalDataCoreActionCount);
  verify.push(m.label + '_GLOBAL_GET_CORE_ACTION_COUNT=' + m.globalGetCoreActionCount);
  verify.push('');
}

verify.push('LOCAL_EXTRACT=' + localExtractOut);
verify.push('SERVED_EXTRACT=' + servedExtractOut);
verify.push('ACTION_CONTEXT=' + actionContextOut);
fs.writeFileSync(verifyOut, verify.join('\n') + '\n');

const decision = [];
decision.push('AICompanyManager V10L-C2D3 root cause decision');
decision.push('DB_WRITE=NO');
decision.push('API_POST=NO');
decision.push('CORE_PATCH=NO');
decision.push('SERVER_PATCH=NO');
decision.push('');

if (!servedSrc || served.size < 1000) {
  decision.push('CONCLUSION=SERVED_JS_NOT_FETCHED_OR_TOO_SMALL');
  decision.push('LIKELY_CAUSE=サーバー配信JS取得失敗または静的配信経路異常。');
  decision.push('NEXT=サーバー配信経路を確認。COREパッチ禁止。');
} else if (local.actionInHandle > 0 && served.actionInHandle === 0) {
  decision.push('CONCLUSION=BROWSER_SERVED_OLD_CORE');
  decision.push('LIKELY_CAUSE=ローカルCOREには課適用branchがあるが、ブラウザ配信JSにない。キャッシュ/サーバー古い配信。');
  decision.push('NEXT=サーバー再起動とcache bust。COREパッチ禁止。');
} else if (served.actionInPicker === 0) {
  decision.push('CONCLUSION=PICKER_BUTTON_ACTION_NOT_RENDERED');
  decision.push('LIKELY_CAUSE=表示中の「課を適用」ボタンがC2D2の想定actionではない、または別レンダラー経路。');
  decision.push('NEXT=SERVED_EXTRACTのrender picker/confirm経路を確認。');
} else if (served.actionInHandle === 0) {
  decision.push('CONCLUSION=HANDLE_BRANCH_MISSING');
  decision.push('LIKELY_CAUSE=ボタンはあるがhandleActionに課適用branchがない。C2D2 patch未反映または別CORE。');
  decision.push('NEXT=統合patchの反映状態を確認。');
} else if (served.callerCalls === 0) {
  decision.push('CONCLUSION=CARD_HANDLER_NOT_CALLED_ANYWHERE');
  decision.push('LIKELY_CAUSE=aicmR8zMgrMajorCardHandleActionが定義だけで、click dispatchから呼ばれていない。');
  decision.push('NEXT=既存click dispatcherへ最小統合。新helper追加は禁止。');
} else if (served.pickerButton > 0 && served.actionInHandle > 0 && served.callerCalls > 0 && served.handleSelectAttr === 0) {
  decision.push('CONCLUSION=HANDLE_SELECTOR_MISMATCH');
  decision.push('LIKELY_CAUSE=button actionは届く可能性があるが、handle側がselectを取得できない。');
  decision.push('NEXT=selector名をpickerとhandleで1本化。');
} else if (served.pickerButton > 0 && served.actionInHandle > 0 && served.applyWritesRoute === 0) {
  decision.push('CONCLUSION=APPLY_FUNCTION_DOES_NOT_WRITE_ROUTE');
  decision.push('LIKELY_CAUSE=apply関数がhandoffBatchRouteへ保存していない。');
  decision.push('NEXT=既存apply関数を置換。追加レイヤー禁止。');
} else if (served.pickerButton > 0 && served.actionInHandle > 0 && served.applyWritesRoute > 0 && served.confirmLiveValidation > 0) {
  decision.push('CONCLUSION=STATICALLY_OK_RUNTIME_CLICK_OR_STATE_ISSUE');
  decision.push('LIKELY_CAUSE=静的には揃っている。実際のclick dispatch gateがactionを握りつぶしているか、ブラウザruntime stateが別objectへ保存されている可能性。');
  decision.push('NEXT=ACTION_CONTEXTを確認し、dispatch gateにr8z-mgr-major-card-route-*が通るかを見る。');
} else {
  decision.push('CONCLUSION=UNKNOWN_REVIEW_EXTRACTS');
  decision.push('LIKELY_CAUSE=静的条件だけでは確定不能。');
  decision.push('NEXT=VERIFY/ACTION_CONTEXT/SERVED_EXTRACTを貼って確認。');
}

decision.push('');
decision.push('MAINTAINABILITY_POLICY=NO_MORE_C2C_ADDON_PATCHES');
decision.push('PATCH_NEXT=NO_UNTIL_ROOT_CAUSE_CONFIRMED');
fs.writeFileSync(decisionOut, decision.join('\n') + '\n');
