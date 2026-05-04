import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;
let src = fs.readFileSync(corePath, 'utf8');

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
  if (!m) throw new Error('FUNCTION_NOT_FOUND: ' + name);

  const start = m.index;
  const open = findOpenBrace(text, start);
  if (open < 0) throw new Error('OPEN_BRACE_NOT_FOUND: ' + name);

  const close = findMatchingBrace(text, open);
  if (close < 0) throw new Error('CLOSE_BRACE_NOT_FOUND: ' + name);

  return {
    name,
    start,
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

function replaceFunction(text, name, replacement) {
  const fn = findFunctionRange(text, name);
  return text.slice(0, fn.start) + replacement + text.slice(fn.close + 1);
}

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2C2_SECTION_LEADER_COMBOBOX';

if (!src.includes('AICM_R8Z_MGR_MAJOR_CARD_C2C_BATCH_SECTION_LEADER_ROUTE_HELPERS_START')) {
  throw new Error('C2C_HELPERS_NOT_FOUND');
}

if (!src.includes('function aicmR8zC2cRenderRoutePicker')) {
  throw new Error('C2C_ROUTE_PICKER_NOT_FOUND');
}

const renderRoutePickerReplacement = `
  function aicmR8zC2cRenderRoutePicker() {
    var sections = aicmR8zC2cSectionCandidates();
    var choice = aicmR8zC2cChoice();
    var selectedSectionId = aicmR8zC2cText(choice.sectionId || "");
    var leaders = selectedSectionId ? aicmR8zC2cLeaderCandidatesForSection(selectedSectionId) : [];

    var sectionOptions = ['<option value="">課を選択してください</option>'].concat(
      sections.map(function (section) {
        var selected = selectedSectionId && section.sectionId === selectedSectionId ? " selected" : "";
        var label = (section.departmentLabel ? section.departmentLabel + " / " : "") + section.sectionLabel;
        return '<option value="' + escapeHtml(section.sectionId) + '"' + selected + '>' + escapeHtml(label) + '</option>';
      })
    ).join("");

    var sectionSelectHtml = sections.length
      ? [
          '<div class="aicm-form-row" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">',
          '  <label class="aicm-selected-note" for="aicm-r8z-c2c-section-select">課</label>',
          '  <select id="aicm-r8z-c2c-section-select" style="min-width:260px;max-width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;">' + sectionOptions + '</select>',
          '  <button type="button" data-core-action="r8z-c2c-apply-section-select">課を適用</button>',
          '</div>'
        ].join("")
      : '<p class="aicm-selected-note">選択できる課がありません。部門/課の設定またはcontext読込を確認してください。</p>';

    var leaderSelectHtml = "";

    if (!selectedSectionId) {
      leaderSelectHtml = '<p class="aicm-selected-note">先に課を選択してください。</p>';
    } else if (!leaders.length) {
      leaderSelectHtml = '<p class="aicm-selected-note">この課にLeaderが配置されていません。</p>';
    } else if (leaders.length === 1) {
      leaderSelectHtml = '<p class="aicm-selected-note">Leaderは1人のため自動確定: ' + escapeHtml(leaders[0].leaderLabel) + '</p>';
    } else {
      var selectedLeaderId = aicmR8zC2cText(choice.leaderPlacementId || "");
      var leaderOptions = ['<option value="">Leaderを選択してください</option>'].concat(
        leaders.map(function (leader) {
          var selected = selectedLeaderId && leader.leaderPlacementId === selectedLeaderId ? " selected" : "";
          return '<option value="' + escapeHtml(leader.leaderPlacementId) + '"' + selected + '>' + escapeHtml(leader.leaderLabel) + '</option>';
        })
      ).join("");

      leaderSelectHtml = [
        '<div class="aicm-form-row" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">',
        '  <label class="aicm-selected-note" for="aicm-r8z-c2c-leader-select">Leader</label>',
        '  <select id="aicm-r8z-c2c-leader-select" style="min-width:260px;max-width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;">' + leaderOptions + '</select>',
        '  <button type="button" data-core-action="r8z-c2c-apply-leader-select">Leaderを適用</button>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-core-card" data-r8z-c2c-route-picker="1" style="margin:12px 0;border:1px solid #c7d2fe;">',
      '  <p class="aicm-eyebrow">引き渡し先 一括選択</p>',
      '  <h4>選択済み大項目をまとめて送る課を選択</h4>',
      '  <p class="aicm-selected-note">大項目ごとの個別課選択は行いません。ここで選んだ課/Leaderを、選択済み大項目すべてに適用します。</p>',
      '  <p class="aicm-selected-note">課はコンボボックスから1つ選び、「課を適用」を押してください。</p>',
      sectionSelectHtml,
      '  <h4>Leader</h4>',
      leaderSelectHtml,
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="r8z-c2c-clear-route">引き渡し先を解除</button>',
      '  </div>',
      '</div>'
    ].join("");
  }
`;

src = replaceFunction(src, 'aicmR8zC2cRenderRoutePicker', renderRoutePickerReplacement);

const handleFn = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');
let handleText = handleFn.text;

if (!handleText.includes(marker + '_ACTION_ROUTE')) {
  const insertNeedle = 'if (action === "r8z-mgr-major-card-confirm-yes") {';
  const idx = handleText.indexOf(insertNeedle);

  if (idx < 0) {
    throw new Error('CONFIRM_YES_BRANCH_NOT_FOUND');
  }

  const actionBlock = `
      // ${marker}_ACTION_ROUTE
      if (action === "r8z-c2c-apply-section-select") {
        var c2cSectionSelect = typeof document !== "undefined" ? document.getElementById("aicm-r8z-c2c-section-select") : null;
        var c2cSectionId = c2cSectionSelect ? String(c2cSectionSelect.value || "").trim() : "";
        if (!c2cSectionId) {
          if (typeof setMessage === "function") setMessage("error", "課を選択してください。");
          aicmR8zMgrMajorCardRerender("r8z_c2c2_section_select_empty");
          return;
        }
        aicmR8zC2cApplySectionChoice(c2cSectionId);
        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

      if (action === "r8z-c2c-apply-leader-select") {
        var c2cLeaderSelect = typeof document !== "undefined" ? document.getElementById("aicm-r8z-c2c-leader-select") : null;
        var c2cLeaderPlacementId = c2cLeaderSelect ? String(c2cLeaderSelect.value || "").trim() : "";
        if (!c2cLeaderPlacementId) {
          if (typeof setMessage === "function") setMessage("error", "Leaderを選択してください。");
          aicmR8zMgrMajorCardRerender("r8z_c2c2_leader_select_empty");
          return;
        }
        aicmR8zC2cApplyLeaderChoice(c2cLeaderPlacementId);
        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

`;

  handleText = handleText.slice(0, idx) + actionBlock + handleText.slice(idx);
  src = src.slice(0, handleFn.start) + handleText + src.slice(handleFn.close + 1);
}

const routePickerFn = findFunctionRange(src, 'aicmR8zC2cRenderRoutePicker');
const newHandleFn = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');

const extract = [];
extract.push('AICompanyManager V10L-C2C2 combobox extracts');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zC2cRenderRoutePicker');
extract.push(routePickerFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zMgrMajorCardHandleAction');
extract.push(newHandleFn.text);
extract.push('');
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const c2c2Scope = routePickerFn.text + '\n' + newHandleFn.text;

const verify = [];
verify.push('AICompanyManager V10L-C2C2 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=SERVER_AWARE');
verify.push('');
verify.push('C2C2_ACTION_ROUTE_COUNT=' + count(newHandleFn.text, marker + '_ACTION_ROUTE'));
verify.push('SECTION_SELECT_ID_COUNT=' + count(routePickerFn.text, 'aicm-r8z-c2c-section-select'));
verify.push('LEADER_SELECT_ID_COUNT=' + count(routePickerFn.text, 'aicm-r8z-c2c-leader-select'));
verify.push('SECTION_APPLY_ACTION_COUNT=' + count(src, 'r8z-c2c-apply-section-select'));
verify.push('LEADER_APPLY_ACTION_COUNT=' + count(src, 'r8z-c2c-apply-leader-select'));
verify.push('OLD_SECTION_BUTTON_ACTION_COUNT_IN_PICKER=' + count(routePickerFn.text, 'r8z-c2c-select-section'));
verify.push('OLD_LEADER_BUTTON_ACTION_COUNT_IN_PICKER=' + count(routePickerFn.text, 'r8z-c2c-select-leader'));
verify.push('COMBOBOX_COPY_COUNT=' + count(src, '課はコンボボックスから1つ選び'));
verify.push('FETCH_COUNT_IN_C2C2_SCOPE=' + count(c2c2Scope, 'fetch('));

if (count(newHandleFn.text, marker + '_ACTION_ROUTE') !== 1) throw new Error('C2C2_ACTION_ROUTE_COUNT_NOT_1');
if (count(routePickerFn.text, 'aicm-r8z-c2c-section-select') < 1) throw new Error('SECTION_SELECT_MISSING');
if (count(src, 'r8z-c2c-apply-section-select') < 1) throw new Error('SECTION_APPLY_ACTION_MISSING');
if (count(routePickerFn.text, 'r8z-c2c-select-section') !== 0) throw new Error('OLD_SECTION_BUTTON_ACTION_STILL_IN_PICKER');
if (count(routePickerFn.text, 'r8z-c2c-select-leader') !== 0) throw new Error('OLD_LEADER_BUTTON_ACTION_STILL_IN_PICKER');
if (count(c2c2Scope, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_C2C2_SCOPE');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
fs.writeFileSync(corePath, src);
