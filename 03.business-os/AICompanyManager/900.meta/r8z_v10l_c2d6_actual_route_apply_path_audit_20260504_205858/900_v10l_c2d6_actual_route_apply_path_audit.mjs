import fs from 'fs';

const [
  ,
  ,
  corePath,
  verifyOut,
  decisionOut,
  buttonRenderExtract,
  actionDispatchExtract,
  markerOut
] = process.argv;

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

function allFunctionRanges(text) {
  const ranges = [];
  const re = /(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/g;
  let m;

  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    const start = m.index;
    const open = findOpenBrace(text, start);
    if (open < 0) continue;
    const close = findMatchingBrace(text, open);
    if (close < 0) continue;

    ranges.push({
      name,
      start,
      open,
      close,
      startLine: lineNoAt(text, start),
      endLine: lineNoAt(text, close),
      text: text.slice(start, close + 1)
    });
  }

  return ranges;
}

function contextAround(text, needle, radius = 35) {
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

const fns = allFunctionRanges(src);

const actionNeedles = [
  '課を適用',
  'r8z-mgr-major-card-route-apply-section',
  'r8z-c2d-apply-section-select',
  'apply-section',
  'data-core-action'
];

const buttonHits = [];
for (const fn of fns) {
  let score = 0;
  const reasons = [];

  if (fn.text.includes('課を適用')) {
    score += 100;
    reasons.push('HAS_APPLY_LABEL');
  }
  if (fn.text.includes('r8z-mgr-major-card-route-apply-section')) {
    score += 100;
    reasons.push('HAS_EXPECTED_ROUTE_ACTION');
  }
  if (fn.text.includes('r8z-c2d-apply-section-select')) {
    score += 80;
    reasons.push('HAS_OLD_C2D_ACTION');
  }
  if (fn.text.includes('select') && fn.text.includes('option')) {
    score += 30;
    reasons.push('HAS_SELECT_OPTION');
  }
  if (fn.text.includes('data-core-action')) {
    score += 30;
    reasons.push('HAS_DATA_CORE_ACTION');
  }
  if (fn.text.includes('routePickerHtml') || fn.text.includes('引き渡し先')) {
    score += 30;
    reasons.push('HAS_ROUTE_PICKER');
  }

  if (score > 0) {
    buttonHits.push({ fn, score, reasons });
  }
}

buttonHits.sort((a, b) => b.score - a.score || (a.fn.close - a.fn.start) - (b.fn.close - b.fn.start));

const dispatchHits = [];
for (const fn of fns) {
  let score = 0;
  const reasons = [];

  if (fn.text.includes('addEventListener') && fn.text.includes('click')) {
    score += 80;
    reasons.push('HAS_CLICK_LISTENER');
  }
  if (fn.text.includes('data-core-action')) {
    score += 50;
    reasons.push('HAS_DATA_CORE_ACTION');
  }
  if (fn.text.includes('getAttribute("data-core-action")') || fn.text.includes("getAttribute('data-core-action')")) {
    score += 30;
    reasons.push('READS_DATA_CORE_ACTION');
  }
  if (fn.text.includes('closest("[data-core-action]")') || fn.text.includes("closest('[data-core-action]')")) {
    score += 30;
    reasons.push('USES_CLOSEST_DATA_CORE_ACTION');
  }
  if (fn.text.includes('aicmR8zMgrMajorCardHandleAction')) {
    score += 40;
    reasons.push('CALLS_CARD_HANDLER');
  }
  if (fn.text.includes('r8z-mgr-major-card-route-')) {
    score += 30;
    reasons.push('HAS_ROUTE_PREFIX');
  }

  if (score > 0) {
    dispatchHits.push({ fn, score, reasons });
  }
}

dispatchHits.sort((a, b) => b.score - a.score || (a.fn.close - a.fn.start) - (b.fn.close - b.fn.start));

const buttonLines = [];
buttonLines.push('AICompanyManager V10L-C2D6 button/render extract');
buttonLines.push('DB_WRITE=NO');
buttonLines.push('API_POST=NO');
buttonLines.push('CORE_PATCH=NO');
buttonLines.push('');

for (const hit of buttonHits.slice(0, 12)) {
  buttonLines.push('============================================================');
  buttonLines.push('score=' + hit.score + '; function=' + hit.fn.name + '; lines=' + hit.fn.startLine + '-' + hit.fn.endLine + '; reasons=' + hit.reasons.join(','));
  buttonLines.push(hit.fn.text);
  buttonLines.push('');
}

buttonLines.push('============================================================');
buttonLines.push('RAW CONTEXT: 課を適用');
buttonLines.push(contextAround(src, '課を適用', 45));
buttonLines.push('============================================================');
buttonLines.push('RAW CONTEXT: r8z-mgr-major-card-route-apply-section');
buttonLines.push(contextAround(src, 'r8z-mgr-major-card-route-apply-section', 45));
buttonLines.push('============================================================');
buttonLines.push('RAW CONTEXT: r8z-c2d-apply-section-select');
buttonLines.push(contextAround(src, 'r8z-c2d-apply-section-select', 45));
fs.writeFileSync(buttonRenderExtract, buttonLines.join('\n') + '\n');

const dispatchLines = [];
dispatchLines.push('AICompanyManager V10L-C2D6 action dispatch extract');
dispatchLines.push('DB_WRITE=NO');
dispatchLines.push('API_POST=NO');
dispatchLines.push('CORE_PATCH=NO');
dispatchLines.push('');

for (const hit of dispatchHits.slice(0, 16)) {
  dispatchLines.push('============================================================');
  dispatchLines.push('score=' + hit.score + '; function=' + hit.fn.name + '; lines=' + hit.fn.startLine + '-' + hit.fn.endLine + '; reasons=' + hit.reasons.join(','));
  dispatchLines.push(hit.fn.text);
  dispatchLines.push('');
}

dispatchLines.push('============================================================');
dispatchLines.push('RAW CONTEXT: addEventListener');
dispatchLines.push(contextAround(src, 'addEventListener', 35));
dispatchLines.push('============================================================');
dispatchLines.push('RAW CONTEXT: aicmR8zMgrMajorCardHandleAction');
dispatchLines.push(contextAround(src, 'aicmR8zMgrMajorCardHandleAction', 35));
fs.writeFileSync(actionDispatchExtract, dispatchLines.join('\n') + '\n');

const markerLines = [];
markerLines.push('AICompanyManager V10L-C2D6 marker counts');
markerLines.push('DB_WRITE=NO');
markerLines.push('API_POST=NO');
markerLines.push('CORE_PATCH=NO');
markerLines.push('');
[
  'AICM_R8Z_MGR_MAJOR_CARD_C2D5R2A_ROUTE_APPLY_RUNTIME_DEBUG_RETRY',
  'AICM_R8Z_MGR_MAJOR_CARD_C2D5R3_ROUTE_ACTION_DISPATCHER_APPLY_FIX',
  'r8z-mgr-major-card-route-apply-section',
  'r8z-c2d-apply-section-select',
  '課を適用',
  'aicmR8zMgrMajorCardHandleAction',
  'closest("[data-core-action]")',
  "closest('[data-core-action]')",
  'data-core-action'
].forEach((needle) => {
  markerLines.push(needle + '=' + count(src, needle));
});
fs.writeFileSync(markerOut, markerLines.join('\n') + '\n');

const topButton = buttonHits[0] || null;
const topDispatch = dispatchHits[0] || null;

const expectedActionCount = count(src, 'r8z-mgr-major-card-route-apply-section');
const oldActionCount = count(src, 'r8z-c2d-apply-section-select');

const topButtonHasExpected = topButton ? topButton.fn.text.includes('r8z-mgr-major-card-route-apply-section') : false;
const topButtonHasOld = topButton ? topButton.fn.text.includes('r8z-c2d-apply-section-select') : false;
const topButtonHasApplyLabel = topButton ? topButton.fn.text.includes('課を適用') : false;

const topDispatchCallsCard = topDispatch ? topDispatch.fn.text.includes('aicmR8zMgrMajorCardHandleAction') : false;
const topDispatchHasRoutePrefix = topDispatch ? topDispatch.fn.text.includes('r8z-mgr-major-card-route-') : false;

const verify = [];
verify.push('AICompanyManager V10L-C2D6 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('CORE_PATCH=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('BUTTON_RENDER_CANDIDATE_COUNT=' + buttonHits.length);
verify.push('DISPATCH_CANDIDATE_COUNT=' + dispatchHits.length);
verify.push('TOP_BUTTON_FUNCTION=' + (topButton ? topButton.fn.name : 'NONE'));
verify.push('TOP_BUTTON_LINES=' + (topButton ? topButton.fn.startLine + '-' + topButton.fn.endLine : 'NONE'));
verify.push('TOP_BUTTON_HAS_APPLY_LABEL=' + (topButtonHasApplyLabel ? 'YES' : 'NO'));
verify.push('TOP_BUTTON_HAS_EXPECTED_ROUTE_ACTION=' + (topButtonHasExpected ? 'YES' : 'NO'));
verify.push('TOP_BUTTON_HAS_OLD_ACTION=' + (topButtonHasOld ? 'YES' : 'NO'));
verify.push('TOP_DISPATCH_FUNCTION=' + (topDispatch ? topDispatch.fn.name : 'NONE'));
verify.push('TOP_DISPATCH_LINES=' + (topDispatch ? topDispatch.fn.startLine + '-' + topDispatch.fn.endLine : 'NONE'));
verify.push('TOP_DISPATCH_CALLS_CARD_HANDLER=' + (topDispatchCallsCard ? 'YES' : 'NO'));
verify.push('TOP_DISPATCH_HAS_ROUTE_PREFIX=' + (topDispatchHasRoutePrefix ? 'YES' : 'NO'));
verify.push('EXPECTED_ROUTE_ACTION_TOTAL=' + expectedActionCount);
verify.push('OLD_C2D_ACTION_TOTAL=' + oldActionCount);
verify.push('C2D5R2A_DEBUG_MARKER_COUNT=' + count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2D5R2A_ROUTE_APPLY_RUNTIME_DEBUG_RETRY'));
verify.push('C2D5R3_DISPATCH_FIX_MARKER_COUNT=' + count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2D5R3_ROUTE_ACTION_DISPATCHER_APPLY_FIX'));
verify.push('BUTTON_RENDER_EXTRACT=' + buttonRenderExtract);
verify.push('ACTION_DISPATCH_EXTRACT=' + actionDispatchExtract);
verify.push('MARKER_OUT=' + markerOut);
fs.writeFileSync(verifyOut, verify.join('\n') + '\n');

const decision = [];
decision.push('AICompanyManager V10L-C2D6 decision');
decision.push('DB_WRITE=NO');
decision.push('API_POST=NO');
decision.push('CORE_PATCH=NO');
decision.push('SERVER_PATCH=NO');
decision.push('');

if (!topButton) {
  decision.push('CONCLUSION=APPLY_BUTTON_RENDERER_NOT_FOUND');
  decision.push('LIKELY_CAUSE=課を適用buttonのレンダー元を特定できていない。');
  decision.push('NEXT=030_button_render_extractを目視確認。');
} else if (topButtonHasOld && !topButtonHasExpected) {
  decision.push('CONCLUSION=VISIBLE_BUTTON_USES_OLD_ACTION');
  decision.push('LIKELY_CAUSE=表示されている「課を適用」buttonが r8z-mgr-major-card-route-apply-section ではなく古いactionを使っている。');
  decision.push('NEXT=レンダー元のbutton actionを既存handlerに合わせる最小修正。dispatcher追加ではなくbutton action統一。');
} else if (topButtonHasExpected && !topDispatchCallsCard) {
  decision.push('CONCLUSION=BUTTON_ACTION_OK_BUT_ACTUAL_DISPATCHER_NOT_CALLING_CARD_HANDLER');
  decision.push('LIKELY_CAUSE=buttonのactionは正しいが、実click listenerがカードhandlerへ渡していない。');
  decision.push('NEXT=実click listener関数だけに route prefix gate を統合。候補は040_action_dispatch_extractの最上位。');
} else if (topButtonHasExpected && topDispatchCallsCard && !topDispatchHasRoutePrefix) {
  decision.push('CONCLUSION=DISPATCHER_CALLS_CARD_HANDLER_BUT_ROUTE_PREFIX_GATE_MISSING');
  decision.push('LIKELY_CAUSE=dispatcherはカードhandlerを呼ぶがroute action prefixを許可していない。');
  decision.push('NEXT=そのdispatcherの既存gateにroute prefixを統合。');
} else if (topButtonHasExpected && topDispatchCallsCard && topDispatchHasRoutePrefix) {
  decision.push('CONCLUSION=STATICALLY_OK_BUT_RUNTIME_EVENT_LISTENER_DIFFERENT_OR_BUTTON_DISABLED');
  decision.push('LIKELY_CAUSE=静的にはbutton/dispatcherが揃っているが、実ブラウザでは別listener/別button/disabled/overlayが押されている可能性。');
  decision.push('NEXT=buttonレンダー元に一時onclick debugではなく、既存button action属性とdisabled条件を確認。');
} else {
  decision.push('CONCLUSION=UNKNOWN_REVIEW_EXTRACTS');
  decision.push('LIKELY_CAUSE=静的判定では確定不能。');
  decision.push('NEXT=030_button_render_extract / 040_action_dispatch_extract を確認。');
}

decision.push('');
decision.push('MAINTAINABILITY_POLICY=STOP_ADDON_DISPATCHER_PATCHES');
decision.push('PATCH_NEXT=ONLY_AFTER_ACTUAL_BUTTON_ACTION_AND_ACTUAL_DISPATCHER_CONFIRMED');
fs.writeFileSync(decisionOut, decision.join('\n') + '\n');
