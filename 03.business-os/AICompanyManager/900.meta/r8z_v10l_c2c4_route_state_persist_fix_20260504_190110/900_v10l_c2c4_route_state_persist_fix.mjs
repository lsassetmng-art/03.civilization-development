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

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2C4_ROUTE_STATE_PERSIST_FIX';

if (!src.includes('function aicmR8zC2cRenderRoutePicker')) throw new Error('ROUTE_PICKER_NOT_FOUND');
if (!src.includes('function aicmR8zC2cApplySectionChoice')) throw new Error('APPLY_SECTION_CHOICE_NOT_FOUND');
if (!src.includes('function aicmR8zC2cEffectiveRoute')) throw new Error('EFFECTIVE_ROUTE_NOT_FOUND');
if (!src.includes('function aicmR8zMgrMajorCardRenderConfirm')) throw new Error('RENDER_CONFIRM_NOT_FOUND');
if (!src.includes('function aicmR8zMgrMajorCardHandleAction')) throw new Error('HANDLE_ACTION_NOT_FOUND');

const applySectionChoiceReplacement = `
  function aicmR8zC2cApplySectionChoice(sectionId, sectionSnapshot) {
    var bag = aicmR8zC2cBag();

    var section = sectionSnapshot && typeof sectionSnapshot === "object"
      ? sectionSnapshot
      : aicmR8zC2cFindSection(sectionId);

    bag.handoffBatchRoute = {
      sectionId: section ? aicmR8zC2cText(section.sectionId || sectionId) : "",
      sectionLabel: section ? aicmR8zC2cText(section.sectionLabel || "") : "",
      departmentId: section ? aicmR8zC2cText(section.departmentId || "") : "",
      departmentLabel: section ? aicmR8zC2cText(section.departmentLabel || "") : "",
      leaderPlacementId: "",
      leaderId: "",
      leaderLabel: "",
      routeAppliedAt: Date.now(),
      routeSource: "c2c4-section-combobox"
    };

    var leaders = aicmR8zC2cLeaderCandidatesForSection(bag.handoffBatchRoute.sectionId);
    if (leaders.length === 1) {
      bag.handoffBatchRoute.leaderPlacementId = leaders[0].leaderPlacementId;
      bag.handoffBatchRoute.leaderId = leaders[0].leaderId;
      bag.handoffBatchRoute.leaderLabel = leaders[0].leaderLabel;
    }

    return bag.handoffBatchRoute;
  }
`;

const effectiveRouteReplacement = `
  function aicmR8zC2cEffectiveRoute() {
    var choice = aicmR8zC2cChoice();

    var sectionId = aicmR8zC2cText(choice.sectionId || "");
    var leaders = sectionId ? aicmR8zC2cLeaderCandidatesForSection(sectionId) : [];

    var leaderPlacementId = aicmR8zC2cText(choice.leaderPlacementId || "");
    var leaderId = aicmR8zC2cText(choice.leaderId || "");
    var leaderLabel = aicmR8zC2cText(choice.leaderLabel || "");

    if (!leaderPlacementId && leaders.length === 1) {
      leaderPlacementId = leaders[0].leaderPlacementId;
      leaderId = leaders[0].leaderId;
      leaderLabel = leaders[0].leaderLabel;
    }

    var sectionLabel = aicmR8zC2cText(choice.sectionLabel || "");
    var departmentLabel = aicmR8zC2cText(choice.departmentLabel || "");
    var departmentId = aicmR8zC2cText(choice.departmentId || "");

    if (sectionId && (!sectionLabel || !departmentLabel)) {
      var foundSection = aicmR8zC2cFindSection(sectionId);
      if (foundSection) {
        if (!sectionLabel) sectionLabel = aicmR8zC2cText(foundSection.sectionLabel || "");
        if (!departmentLabel) departmentLabel = aicmR8zC2cText(foundSection.departmentLabel || "");
        if (!departmentId) departmentId = aicmR8zC2cText(foundSection.departmentId || "");
      }
    }

    return {
      clear: !!sectionId && !!(leaderPlacementId || leaderId || leaderLabel) && leaders.length > 0,
      sectionId: sectionId,
      sectionLabel: sectionLabel,
      departmentId: departmentId,
      departmentLabel: departmentLabel,
      leaderPlacementId: leaderPlacementId,
      leaderId: leaderId,
      leaderLabel: leaderLabel,
      leaderCount: leaders.length,
      displayLeader: leaderLabel || leaderPlacementId || leaderId || "",
      displaySection: sectionLabel || sectionId || "",
      displayDepartment: departmentLabel || departmentId || "",
      routeAppliedAt: choice.routeAppliedAt || null,
      routeSource: choice.routeSource || ""
    };
  }
`;

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
        return [
          '<option',
          ' value="' + escapeHtml(section.sectionId) + '"',
          selected,
          ' data-section-id="' + escapeHtml(section.sectionId) + '"',
          ' data-section-label="' + escapeHtml(section.sectionLabel || "") + '"',
          ' data-department-id="' + escapeHtml(section.departmentId || "") + '"',
          ' data-department-label="' + escapeHtml(section.departmentLabel || "") + '"',
          '>',
          escapeHtml(label),
          '</option>'
        ].join("");
      })
    ).join("");

    var sectionSelectHtml = sections.length
      ? [
          '<div class="aicm-form-row" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">',
          '  <label class="aicm-selected-note" for="aicm-r8z-c2c-section-select">課</label>',
          '  <select id="aicm-r8z-c2c-section-select" data-r8z-c2c-section-select="1" style="min-width:260px;max-width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;">' + sectionOptions + '</select>',
          '  <button type="button" data-core-action="r8z-c2c4-apply-section-select">課を適用</button>',
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
        '  <select id="aicm-r8z-c2c-leader-select" data-r8z-c2c-leader-select="1" style="min-width:260px;max-width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;">' + leaderOptions + '</select>',
        '  <button type="button" data-core-action="r8z-c2c4-apply-leader-select">Leaderを適用</button>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-core-card" data-r8z-c2c-route-picker="1" style="margin:12px 0;border:1px solid #c7d2fe;">',
      '  <p class="aicm-eyebrow">引き渡し先 一括選択</p>',
      '  <h4>選択済み大項目をまとめて送る課を選択</h4>',
      '  <p class="aicm-selected-note">大項目ごとの個別課選択は行いません。ここで選んだ課/Leaderを、選択済み大項目すべてに適用します。</p>',
      '  <p class="aicm-selected-note">課はコンボボックスから1つ選び、「課を適用」を押してください。</p>',
      '  <p class="aicm-selected-note">割り当て先の部門は、選択した課の親部門です。</p>',
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

const renderConfirmReplacement = `
  function aicmR8zMgrMajorCardRenderConfirm() {
    var bag = aicmR8zMgrMajorCardState();
    var confirm = bag.confirm || null;

    if (!confirm || !Array.isArray(confirm.items) || !confirm.items.length) {
      return "";
    }

    var errors = Array.isArray(confirm.errors) ? confirm.errors : [];
    var payloads = Array.isArray(confirm.payloads) ? confirm.payloads : [];
    var hasErrors = errors.length > 0;
    var yesDisabled = hasErrors ? " disabled" : "";
    var yesStyle = hasErrors ? ' style="opacity:0.45;cursor:not-allowed;"' : "";

    var route = typeof aicmR8zC2cEffectiveRoute === "function"
      ? aicmR8zC2cEffectiveRoute()
      : (confirm.route || {});

    var routePickerHtml = typeof aicmR8zC2cRenderRoutePicker === "function"
      ? aicmR8zC2cRenderRoutePicker()
      : "";

    var summaryHtml = [
      '<div class="aicm-core-card" style="margin:12px 0;">',
      '<p class="aicm-eyebrow">一括引き渡し先</p>',
      '<div class="aicm-selected-note">部門: ' + escapeHtml(route.displayDepartment || "-") + '</div>',
      '<div class="aicm-selected-note">課: ' + escapeHtml(route.displaySection || "-") + '</div>',
      '<div class="aicm-selected-note">Leader: ' + escapeHtml(route.displayLeader || "-") + '</div>',
      route.routeAppliedAt ? '<div class="aicm-selected-note">適用済み</div>' : '',
      '</div>'
    ].join("");

    var itemHtml = confirm.items.map(function (item) {
      return '<li><strong>' + escapeHtml(item.title || item.id || "Manager大項目") + '</strong></li>';
    }).join("");

    var errorHtml = hasErrors
      ? '<div class="aicm-core-card" style="border:1px solid #ef4444;background:#fff7f7;margin:12px 0;"><p class="aicm-eyebrow">実行前チェック</p><ul class="aicm-selected-note">' + errors.map(function (message) { return '<li>' + escapeHtml(message) + '</li>'; }).join("") + '</ul></div>'
      : '<p class="aicm-selected-note">実行前チェックOK。次工程でAPI POST解放前に佐藤(DB担当)レビューが必要です。</p>';

    var payloadPreviewHtml = payloads.length
      ? '<details class="aicm-selected-note" style="margin-top:12px;"><summary>payload preview（POST未実行）</summary><pre style="white-space:pre-wrap;max-height:240px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + escapeHtml(JSON.stringify(payloads, null, 2)) + '</pre></details>'
      : "";

    return [
      '<div class="aicm-core-card" data-r8z-mgr-major-confirm="1" style="margin-top:12px;border:1px solid #f59e0b;">',
      '  <p class="aicm-eyebrow">確認</p>',
      '  <h3>' + escapeHtml(confirm.title || "確認") + '</h3>',
      '  <p class="aicm-selected-note">endpoint: ' + escapeHtml(confirm.endpoint || "/api/aicm/v2/manager-major/update") + '</p>',
      routePickerHtml,
      summaryHtml,
      '  <p class="aicm-eyebrow">対象大項目</p>',
      '  <ul class="aicm-selected-note">' + itemHtml + '</ul>',
      errorHtml,
      payloadPreviewHtml,
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="r8z-mgr-major-card-confirm-yes"' + yesDisabled + yesStyle + '>Yes</button>',
      '    <button type="button" data-core-action="r8z-mgr-major-card-confirm-no">No</button>',
      '  </div>',
      '  <p class="aicm-selected-note">この確認画面ではDB更新/API POSTは実行しません。</p>',
      '</div>'
    ].join("");
  }
`;

src = replaceFunction(src, 'aicmR8zC2cApplySectionChoice', applySectionChoiceReplacement);
src = replaceFunction(src, 'aicmR8zC2cEffectiveRoute', effectiveRouteReplacement);
src = replaceFunction(src, 'aicmR8zC2cRenderRoutePicker', renderRoutePickerReplacement);
src = replaceFunction(src, 'aicmR8zMgrMajorCardRenderConfirm', renderConfirmReplacement);

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
      if (action === "r8z-c2c4-apply-section-select") {
        var c2cRouteRoot = target && target.closest ? target.closest("[data-r8z-c2c-route-picker]") : null;
        var c2cSectionSelect = c2cRouteRoot && c2cRouteRoot.querySelector
          ? c2cRouteRoot.querySelector("[data-r8z-c2c-section-select]")
          : (typeof document !== "undefined" ? document.getElementById("aicm-r8z-c2c-section-select") : null);

        var c2cOption = c2cSectionSelect && c2cSectionSelect.options
          ? c2cSectionSelect.options[c2cSectionSelect.selectedIndex]
          : null;

        var c2cSectionId = c2cSectionSelect ? String(c2cSectionSelect.value || "").trim() : "";

        if (!c2cSectionId || !c2cOption) {
          if (typeof setMessage === "function") setMessage("error", "課を選択してください。");
          aicmR8zMgrMajorCardRerender("r8z_c2c4_section_select_empty");
          return;
        }

        var sectionSnapshot = {
          sectionId: String(c2cOption.getAttribute("data-section-id") || c2cSectionId || "").trim(),
          sectionLabel: String(c2cOption.getAttribute("data-section-label") || c2cOption.textContent || "").trim(),
          departmentId: String(c2cOption.getAttribute("data-department-id") || "").trim(),
          departmentLabel: String(c2cOption.getAttribute("data-department-label") || "").trim()
        };

        if (!sectionSnapshot.sectionLabel) {
          var selectedSection = aicmR8zC2cFindSection(c2cSectionId);
          if (selectedSection) sectionSnapshot = selectedSection;
        }

        if (!sectionSnapshot.sectionId || !sectionSnapshot.sectionLabel) {
          if (typeof setMessage === "function") setMessage("error", "選択した課を確認できません。再読み込みしてください。");
          aicmR8zMgrMajorCardRerender("r8z_c2c4_section_not_found");
          return;
        }

        aicmR8zC2cApplySectionChoice(c2cSectionId, sectionSnapshot);

        if (typeof setMessage === "function") {
          setMessage("ok", "引き渡し先の課を適用しました: " + sectionSnapshot.sectionLabel);
        }

        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

      if (action === "r8z-c2c4-apply-leader-select") {
        var c2cLeaderRoot = target && target.closest ? target.closest("[data-r8z-c2c-route-picker]") : null;
        var c2cLeaderSelect = c2cLeaderRoot && c2cLeaderRoot.querySelector
          ? c2cLeaderRoot.querySelector("[data-r8z-c2c-leader-select]")
          : (typeof document !== "undefined" ? document.getElementById("aicm-r8z-c2c-leader-select") : null);

        var c2cLeaderPlacementId = c2cLeaderSelect ? String(c2cLeaderSelect.value || "").trim() : "";

        if (!c2cLeaderPlacementId) {
          if (typeof setMessage === "function") setMessage("error", "Leaderを選択してください。");
          aicmR8zMgrMajorCardRerender("r8z_c2c4_leader_select_empty");
          return;
        }

        aicmR8zC2cApplyLeaderChoice(c2cLeaderPlacementId);

        if (typeof setMessage === "function") {
          setMessage("ok", "Leaderを適用しました。");
        }

        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

`;

  handleText = handleText.slice(0, idx) + actionBlock + handleText.slice(idx);
  src = src.slice(0, handleFn.start) + handleText + src.slice(handleFn.close + 1);
}

const applyFn = findFunctionRange(src, 'aicmR8zC2cApplySectionChoice');
const effectiveFn = findFunctionRange(src, 'aicmR8zC2cEffectiveRoute');
const pickerFn = findFunctionRange(src, 'aicmR8zC2cRenderRoutePicker');
const confirmFn = findFunctionRange(src, 'aicmR8zMgrMajorCardRenderConfirm');
const newHandleFn = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');

const extract = [];
extract.push('AICompanyManager V10L-C2C4 route state persist fix extracts');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zC2cApplySectionChoice');
extract.push(applyFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zC2cEffectiveRoute');
extract.push(effectiveFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zC2cRenderRoutePicker');
extract.push(pickerFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zMgrMajorCardRenderConfirm');
extract.push(confirmFn.text);
extract.push('');
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const scope = applyFn.text + '\n' + effectiveFn.text + '\n' + pickerFn.text + '\n' + confirmFn.text + '\n' + newHandleFn.text;

const verify = [];
verify.push('AICompanyManager V10L-C2C4 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=SERVER_AWARE');
verify.push('');
verify.push('C2C4_ACTION_ROUTE_COUNT=' + count(newHandleFn.text, marker + '_ACTION_ROUTE'));
verify.push('C2C4_SECTION_APPLY_ACTION_COUNT=' + count(src, 'r8z-c2c4-apply-section-select'));
verify.push('C2C4_LEADER_APPLY_ACTION_COUNT=' + count(src, 'r8z-c2c4-apply-leader-select'));
verify.push('C2C4_OPTION_SECTION_DATA_COUNT=' + count(pickerFn.text, 'data-section-label'));
verify.push('C2C4_OPTION_DEPARTMENT_DATA_COUNT=' + count(pickerFn.text, 'data-department-label'));
verify.push('C2C4_SECTION_SNAPSHOT_COUNT=' + count(newHandleFn.text, 'sectionSnapshot'));
verify.push('C2C4_ROUTE_APPLIED_AT_COUNT=' + count(scope, 'routeAppliedAt'));
verify.push('C2C4_CONFIRM_USES_EFFECTIVE_ROUTE_COUNT=' + count(confirmFn.text, 'aicmR8zC2cEffectiveRoute'));
verify.push('C2C4_APPLIED_LABEL_COUNT=' + count(confirmFn.text, '適用済み'));
verify.push('FETCH_COUNT_IN_C2C4_SCOPE=' + count(scope, 'fetch('));

if (count(newHandleFn.text, marker + '_ACTION_ROUTE') !== 1) throw new Error('C2C4_ACTION_ROUTE_COUNT_NOT_1');
if (count(src, 'r8z-c2c4-apply-section-select') < 1) throw new Error('C2C4_SECTION_APPLY_ACTION_MISSING');
if (count(pickerFn.text, 'data-section-label') < 1) throw new Error('C2C4_OPTION_SECTION_DATA_MISSING');
if (count(pickerFn.text, 'data-department-label') < 1) throw new Error('C2C4_OPTION_DEPARTMENT_DATA_MISSING');
if (count(newHandleFn.text, 'sectionSnapshot') < 1) throw new Error('C2C4_SECTION_SNAPSHOT_MISSING');
if (count(scope, 'routeAppliedAt') < 1) throw new Error('C2C4_ROUTE_APPLIED_AT_MISSING');
if (count(scope, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_C2C4_SCOPE');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
fs.writeFileSync(corePath, src);
