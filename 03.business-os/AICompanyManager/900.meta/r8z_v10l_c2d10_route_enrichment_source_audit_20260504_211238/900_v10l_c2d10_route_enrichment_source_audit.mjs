import fs from 'fs';

const [,, corePath, verifyOut, decisionOut, extractOut] = process.argv;
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
    open,
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

function listFunctions(text) {
  const out = [];
  const re = /(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const fn = findFunctionRange(text, m[1]);
    if (fn) out.push(fn);
  }
  return out;
}

const functions = listFunctions(src);

const names = [
  'aicmR8zC2cRenderRoutePicker',
  'aicmR8zC2cApplySectionRoute',
  'aicmR8zC2cEffectiveHandoffRoute',
  'aicmR8zMgrMajorCardRenderConfirm',
  'aicmR8zMgrMajorCardHandleAction',
  'aicmR8zMgrMajorCardSelectionState',
  'aicmR8zMgrMajorCardSelectedRows'
];

const extracts = [];
extracts.push('AICompanyManager V10L-C2D10 relevant extracts');
extracts.push('DB_WRITE=NO');
extracts.push('API_POST=NO');
extracts.push('CORE_PATCH=NO');

for (const name of names) {
  const fn = findFunctionRange(src, name);
  extracts.push('');
  extracts.push('============================================================');
  extracts.push('FUNCTION=' + name);
  if (!fn) {
    extracts.push('NOT_FOUND');
  } else {
    extracts.push('LINES=' + fn.startLine + '-' + fn.endLine);
    extracts.push(fn.text);
  }
}

const sourceCandidates = functions
  .map(fn => {
    let score = 0;
    const reasons = [];
    const t = fn.text;

    if (t.includes('department_id') || t.includes('departmentId')) {
      score += 40; reasons.push('HAS_DEPARTMENT_ID');
    }
    if (t.includes('department_name') || t.includes('departmentLabel') || t.includes('department_label')) {
      score += 40; reasons.push('HAS_DEPARTMENT_LABEL');
    }
    if (t.includes('section_id') || t.includes('sectionId')) {
      score += 30; reasons.push('HAS_SECTION_ID');
    }
    if (t.includes('section_name') || t.includes('sectionLabel') || t.includes('section_label')) {
      score += 30; reasons.push('HAS_SECTION_LABEL');
    }
    if (t.includes('leader_placement') || t.includes('leaderPlacement') || t.includes('assigned_leader') || t.includes('Leader')) {
      score += 40; reasons.push('HAS_LEADER_HINT');
    }
    if (t.includes('placements') || t.includes('robotCatalog')) {
      score += 25; reasons.push('HAS_PLACEMENT_CONTEXT');
    }
    if (t.includes('ctx.sections') || t.includes('context.sections')) {
      score += 30; reasons.push('USES_CONTEXT_SECTIONS');
    }
    if (t.includes('ctx.departments') || t.includes('context.departments')) {
      score += 30; reasons.push('USES_CONTEXT_DEPARTMENTS');
    }
    if (t.includes('pmlw_major_items') || t.includes('manager_major_items') || t.includes('major_items')) {
      score += 25; reasons.push('USES_LEDGER_ROWS');
    }

    return { fn, score, reasons };
  })
  .filter(x => x.score > 0)
  .sort((a, b) => b.score - a.score);

extracts.push('');
extracts.push('============================================================');
extracts.push('SOURCE CANDIDATE RANKING');
for (const c of sourceCandidates.slice(0, 30)) {
  extracts.push([
    'score=' + c.score,
    'function=' + c.fn.name,
    'lines=' + c.fn.startLine + '-' + c.fn.endLine,
    'reasons=' + c.reasons.join(',')
  ].join('; '));
}

fs.writeFileSync(extractOut, extracts.join('\n') + '\n');

const routePicker = findFunctionRange(src, 'aicmR8zC2cRenderRoutePicker');
const applyFn = findFunctionRange(src, 'aicmR8zC2cApplySectionRoute');
const effectiveFn = findFunctionRange(src, 'aicmR8zC2cEffectiveHandoffRoute');
const confirmFn = findFunctionRange(src, 'aicmR8zMgrMajorCardRenderConfirm');

const verify = [];
verify.push('AICompanyManager V10L-C2D10 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('CORE_PATCH=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('ROUTE_PICKER_FOUND=' + (routePicker ? 'YES' : 'NO'));
verify.push('APPLY_SECTION_FUNCTION_FOUND=' + (applyFn ? 'YES' : 'NO'));
verify.push('EFFECTIVE_ROUTE_FUNCTION_FOUND=' + (effectiveFn ? 'YES' : 'NO'));
verify.push('CONFIRM_RENDER_FUNCTION_FOUND=' + (confirmFn ? 'YES' : 'NO'));
verify.push('');
verify.push('ROUTE_PICKER_DATA_DEPARTMENT_ID_COUNT=' + (routePicker ? count(routePicker.text, 'data-department-id') : 0));
verify.push('ROUTE_PICKER_DATA_DEPARTMENT_LABEL_COUNT=' + (routePicker ? count(routePicker.text, 'data-department-label') : 0));
verify.push('ROUTE_PICKER_DATA_LEADER_COUNT=' + (routePicker ? count(routePicker.text, 'data-leader') : 0));
verify.push('APPLY_WRITES_DEPARTMENT_ID_COUNT=' + (applyFn ? count(applyFn.text, 'departmentId') + count(applyFn.text, 'department_id') : 0));
verify.push('APPLY_WRITES_DEPARTMENT_LABEL_COUNT=' + (applyFn ? count(applyFn.text, 'departmentLabel') + count(applyFn.text, 'department_label') : 0));
verify.push('APPLY_WRITES_LEADER_COUNT=' + (applyFn ? count(applyFn.text, 'leaderLabel') + count(applyFn.text, 'leader_placement') + count(applyFn.text, 'assigned_leader') : 0));
verify.push('EFFECTIVE_USES_LEDGER_DEPT_COUNT=' + (effectiveFn ? count(effectiveFn.text, 'department') : 0));
verify.push('EFFECTIVE_USES_LEADER_COUNT=' + (effectiveFn ? count(effectiveFn.text, 'leader') + count(effectiveFn.text, 'Leader') : 0));
verify.push('CONFIRM_DISPLAYS_DEPARTMENT_COUNT=' + (confirmFn ? count(confirmFn.text, '部門') + count(confirmFn.text, 'department') : 0));
verify.push('CONFIRM_DISPLAYS_LEADER_COUNT=' + (confirmFn ? count(confirmFn.text, 'Leader') + count(confirmFn.text, 'leader') : 0));
verify.push('');
verify.push('SOURCE_CANDIDATE_TOP=' + (sourceCandidates[0] ? sourceCandidates[0].fn.name : 'NONE'));
verify.push('SOURCE_CANDIDATE_TOP_SCORE=' + (sourceCandidates[0] ? sourceCandidates[0].score : 0));
verify.push('EXTRACT_OUT=' + extractOut);

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');

const decision = [];
decision.push('AICompanyManager V10L-C2D10 route enrichment source decision');
decision.push('DB_WRITE=NO');
decision.push('API_POST=NO');
decision.push('CORE_PATCH=NO');
decision.push('SERVER_PATCH=NO');
decision.push('');

const routeHasDept = routePicker && count(routePicker.text, 'data-department-id') > 0;
const routeHasLeader = routePicker && count(routePicker.text, 'data-leader') > 0;
const applyWritesDept = applyFn && (count(applyFn.text, 'departmentId') + count(applyFn.text, 'department_id')) > 0;
const applyWritesLeader = applyFn && (count(applyFn.text, 'leaderLabel') + count(applyFn.text, 'leader_placement') + count(applyFn.text, 'assigned_leader')) > 0;

if (!routeHasDept) {
  decision.push('CONCLUSION=SECTION_OPTION_MISSING_DEPARTMENT_DATA');
  decision.push('LIKELY_CAUSE=課optionに部門ID/部門名が入っていないため、適用後に部門が補完できていない。');
} else if (!applyWritesDept) {
  decision.push('CONCLUSION=APPLY_FUNCTION_DOES_NOT_PERSIST_DEPARTMENT_TO_ROUTE_STATE');
  decision.push('LIKELY_CAUSE=optionには部門情報があるが、apply関数がroute stateへ書いていない。');
} else if (!routeHasLeader && !applyWritesLeader) {
  decision.push('CONCLUSION=LEADER_SOURCE_NOT_BOUND_TO_ROUTE');
  decision.push('LIKELY_CAUSE=課/配置/Leader情報をroute stateへ補完する経路がない。');
} else {
  decision.push('CONCLUSION=STATICALLY_PARTIAL_OR_OK_NEED_EXTRACT_REVIEW');
  decision.push('LIKELY_CAUSE=静的には一部存在。030_relevant_extractsでどの関数が表示値を落としているか確認。');
}

decision.push('');
decision.push('RECOMMENDED_C2D11_PATCH_POLICY');
decision.push('- 新しいbridge/helperを増やさない');
decision.push('- 既存 aicmR8zC2cApplySectionRoute / aicmR8zC2cEffectiveHandoffRoute のどちらか1か所に寄せる');
decision.push('- 部門は selected section option → sections context → selected ledger row の順で補完');
decision.push('- Leaderは section/placement から補完。存在しなければ未設定としてPOST不可にする');
decision.push('- DB/API/server routeは触らない');
decision.push('- debug除去はC2Eでまとめる');

fs.writeFileSync(decisionOut, decision.join('\n') + '\n');
