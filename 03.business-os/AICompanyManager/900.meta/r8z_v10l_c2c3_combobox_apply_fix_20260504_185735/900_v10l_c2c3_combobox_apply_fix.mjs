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

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2C3_COMBOBOX_APPLY_FIX';

if (!src.includes('function aicmR8zC2cRenderRoutePicker')) {
  throw new Error('ROUTE_PICKER_NOT_FOUND');
}
if (!src.includes('function aicmR8zC2cSectionCandidates')) {
  throw new Error('SECTION_CANDIDATES_NOT_FOUND');
}
if (!src.includes('function aicmR8zC2cNormalizeSection')) {
  throw new Error('NORMALIZE_SECTION_NOT_FOUND');
}
if (!src.includes('function aicmR8zC2cEffectiveRoute')) {
  throw new Error('EFFECTIVE_ROUTE_NOT_FOUND');
}

const normalizeSectionReplacement = `
  function aicmR8zC2cNormalizeSection(row, index) {
    row = row && typeof row === "object" ? row : {};

    var sectionId = aicmR8zC2cField(row, [
      "section_id",
      "aicm_section_id",
      "organization_id",
      "department_section_id"
    ]);

    var sectionLabel = aicmR8zC2cField(row, [
      "section_name",
      "section_label",
      "organization_name",
      "organization_label"
    ]);

    var departmentId = aicmR8zC2cField(row, [
      "department_id",
      "aicm_department_id",
      "parent_department_id",
      "parent_organization_id"
    ]);

    var departmentLabel = aicmR8zC2cField(row, [
      "department_name",
      "department_label",
      "parent_department_name",
      "parent_organization_name"
    ]);

    sectionLabel = aicmR8zC2cText(sectionLabel);
    sectionId = aicmR8zC2cText(sectionId);

    if (!sectionLabel && !sectionId) return null;

    // 偽候補除外: labelが単なる「課」の行は、実課ではなくfallback由来の可能性が高い。
    if (sectionLabel === "課" && !sectionId) return null;
    if (sectionLabel === "課" && sectionId.indexOf("section-label-") === 0) return null;

    // department row単体が混ざるのを防ぐ。
    var maybeDepartmentOnly = !!aicmR8zC2cField(row, ["department_name", "department_label"]) &&
      !aicmR8zC2cField(row, ["section_name", "section_label"]) &&
      !aicmR8zC2cField(row, ["organization_name", "organization_label"]);

    if (maybeDepartmentOnly) return null;

    if (!sectionId) sectionId = "section-label-" + String(index);

    return {
      sectionId: sectionId,
      sectionLabel: sectionLabel || sectionId,
      departmentId: aicmR8zC2cText(departmentId),
      departmentLabel: aicmR8zC2cText(departmentLabel)
    };
  }
`;

const sectionCandidatesReplacement = `
  function aicmR8zC2cSectionCandidates() {
    var ctx = aicmR8zC2cContext();

    function departmentRows() {
      return []
        .concat(aicmR8zC2cAsArray(ctx.departments))
        .concat(aicmR8zC2cAsArray(ctx.department_list))
        .concat(aicmR8zC2cAsArray(ctx.aicm_departments));
    }

    function deptId(row) {
      return aicmR8zC2cField(row, [
        "department_id",
        "aicm_department_id",
        "id",
        "organization_id"
      ]);
    }

    function deptLabel(row) {
      return aicmR8zC2cField(row, [
        "department_name",
        "department_label",
        "name",
        "organization_name",
        "label"
      ]);
    }

    function enrichDepartment(section) {
      if (!section || section.departmentLabel) return section;

      var depts = departmentRows();
      for (var i = 0; i < depts.length; i += 1) {
        var d = depts[i] || {};
        var id = deptId(d);
        if (id && section.departmentId && String(id) === String(section.departmentId)) {
          section.departmentLabel = deptLabel(d);
          return section;
        }
      }

      return section;
    }

    var explicitSections = []
      .concat(aicmR8zC2cAsArray(ctx.sections))
      .concat(aicmR8zC2cAsArray(ctx.section_list))
      .concat(aicmR8zC2cAsArray(ctx.aicm_sections));

    var organizationSections = []
      .concat(aicmR8zC2cAsArray(ctx.organizations))
      .concat(aicmR8zC2cAsArray(ctx.organization_list))
      .filter(function (row) {
        row = row && typeof row === "object" ? row : {};
        var level = String(
          row.organization_level ||
          row.org_level ||
          row.level_code ||
          row.type_code ||
          row.organization_type ||
          ""
        ).toLowerCase();

        if (level.indexOf("department") >= 0 || level.indexOf("部門") >= 0) return false;
        if (level.indexOf("section") >= 0 || level.indexOf("課") >= 0) return true;

        if (row.section_name || row.section_label || row.parent_department_id || row.parent_organization_id) return true;

        return false;
      });

    var source = explicitSections.length ? explicitSections : organizationSections;

    // 最後のfallback。ただし、選択済み大項目からは section_name/section_label が本当に入っている場合だけ使う。
    if (!source.length) {
      source = aicmR8zMgrMajorCardSelectedRows().filter(function (row) {
        return !!(row && (row.section_name || row.section_label || row.aicm_section_id || row.section_id));
      });
    }

    var seen = {};
    var list = [];

    source.forEach(function (row, index) {
      var section = aicmR8zC2cNormalizeSection(row, index);
      if (!section) return;

      section = enrichDepartment(section);

      var key = section.sectionId || section.sectionLabel;
      if (!key || seen[key]) return;

      if (!section.sectionLabel || section.sectionLabel === "-") return;
      if (section.sectionLabel === "課" && !section.sectionId) return;

      seen[key] = true;
      list.push(section);
    });

    list.sort(function (a, b) {
      var ak = String((a.departmentLabel || "") + " " + (a.sectionLabel || ""));
      var bk = String((b.departmentLabel || "") + " " + (b.sectionLabel || ""));
      return ak.localeCompare(bk, "ja");
    });

    return list;
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
        return '<option value="' + escapeHtml(section.sectionId) + '"' + selected + '>' + escapeHtml(label) + '</option>';
      })
    ).join("");

    var sectionSelectHtml = sections.length
      ? [
          '<div class="aicm-form-row" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">',
          '  <label class="aicm-selected-note" for="aicm-r8z-c2c-section-select">課</label>',
          '  <select id="aicm-r8z-c2c-section-select" data-r8z-c2c-section-select="1" style="min-width:260px;max-width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;">' + sectionOptions + '</select>',
          '  <button type="button" data-core-action="r8z-c2c3-apply-section-select">課を適用</button>',
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
        '  <button type="button" data-core-action="r8z-c2c3-apply-leader-select">Leaderを適用</button>',
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

src = replaceFunction(src, 'aicmR8zC2cNormalizeSection', normalizeSectionReplacement);
src = replaceFunction(src, 'aicmR8zC2cSectionCandidates', sectionCandidatesReplacement);
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
      if (action === "r8z-c2c3-apply-section-select") {
        var c2cRouteRoot = target && target.closest ? target.closest("[data-r8z-c2c-route-picker]") : null;
        var c2cSectionSelect = c2cRouteRoot && c2cRouteRoot.querySelector
          ? c2cRouteRoot.querySelector("[data-r8z-c2c-section-select]")
          : (typeof document !== "undefined" ? document.getElementById("aicm-r8z-c2c-section-select") : null);

        var c2cSectionId = c2cSectionSelect ? String(c2cSectionSelect.value || "").trim() : "";

        if (!c2cSectionId) {
          if (typeof setMessage === "function") setMessage("error", "課を選択してください。");
          aicmR8zMgrMajorCardRerender("r8z_c2c3_section_select_empty");
          return;
        }

        var selectedSection = aicmR8zC2cFindSection(c2cSectionId);
        if (!selectedSection) {
          if (typeof setMessage === "function") setMessage("error", "選択した課を確認できません。再読み込みしてください。");
          aicmR8zMgrMajorCardRerender("r8z_c2c3_section_not_found");
          return;
        }

        aicmR8zC2cApplySectionChoice(c2cSectionId);

        if (typeof setMessage === "function") {
          setMessage("ok", "引き渡し先の課を適用しました: " + selectedSection.sectionLabel);
        }

        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

      if (action === "r8z-c2c3-apply-leader-select") {
        var c2cLeaderRoot = target && target.closest ? target.closest("[data-r8z-c2c-route-picker]") : null;
        var c2cLeaderSelect = c2cLeaderRoot && c2cLeaderRoot.querySelector
          ? c2cLeaderRoot.querySelector("[data-r8z-c2c-leader-select]")
          : (typeof document !== "undefined" ? document.getElementById("aicm-r8z-c2c-leader-select") : null);

        var c2cLeaderPlacementId = c2cLeaderSelect ? String(c2cLeaderSelect.value || "").trim() : "";

        if (!c2cLeaderPlacementId) {
          if (typeof setMessage === "function") setMessage("error", "Leaderを選択してください。");
          aicmR8zMgrMajorCardRerender("r8z_c2c3_leader_select_empty");
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

const normalizeFn = findFunctionRange(src, 'aicmR8zC2cNormalizeSection');
const candidatesFn = findFunctionRange(src, 'aicmR8zC2cSectionCandidates');
const pickerFn = findFunctionRange(src, 'aicmR8zC2cRenderRoutePicker');
const newHandleFn = findFunctionRange(src, 'aicmR8zMgrMajorCardHandleAction');

const extract = [];
extract.push('AICompanyManager V10L-C2C3 combobox apply fix extracts');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zC2cNormalizeSection');
extract.push(normalizeFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zC2cSectionCandidates');
extract.push(candidatesFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zC2cRenderRoutePicker');
extract.push(pickerFn.text);
extract.push('');
extract.push('============================================================');
extract.push('FUNCTION=aicmR8zMgrMajorCardHandleAction');
extract.push(newHandleFn.text);
extract.push('');
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const scope = normalizeFn.text + '\n' + candidatesFn.text + '\n' + pickerFn.text + '\n' + newHandleFn.text;

const verify = [];
verify.push('AICompanyManager V10L-C2C3 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('SERVER_RESTART=SERVER_AWARE');
verify.push('');
verify.push('C2C3_ACTION_ROUTE_COUNT=' + count(newHandleFn.text, marker + '_ACTION_ROUTE'));
verify.push('C2C3_SECTION_APPLY_ACTION_COUNT=' + count(src, 'r8z-c2c3-apply-section-select'));
verify.push('C2C3_LEADER_APPLY_ACTION_COUNT=' + count(src, 'r8z-c2c3-apply-leader-select'));
verify.push('C2C3_SECTION_SELECT_DATA_ATTR_COUNT=' + count(pickerFn.text, 'data-r8z-c2c-section-select'));
verify.push('C2C3_FAKE_SECTION_FILTER_COUNT=' + count(candidatesFn.text + normalizeFn.text, '偽候補除外'));
verify.push('C2C3_PARENT_DEPARTMENT_COPY_COUNT=' + count(pickerFn.text, '選択した課の親部門'));
verify.push('C2C3_NO_OLD_BUTTON_ACTION_IN_PICKER_SECTION=' + count(pickerFn.text, 'r8z-c2c-select-section'));
verify.push('C2C3_NO_OLD_BUTTON_ACTION_IN_PICKER_LEADER=' + count(pickerFn.text, 'r8z-c2c-select-leader'));
verify.push('C2C3_LOCAL_SELECT_QUERY_COUNT=' + count(newHandleFn.text, 'querySelector("[data-r8z-c2c-section-select]")'));
verify.push('FETCH_COUNT_IN_C2C3_SCOPE=' + count(scope, 'fetch('));

if (count(newHandleFn.text, marker + '_ACTION_ROUTE') !== 1) throw new Error('C2C3_ACTION_ROUTE_COUNT_NOT_1');
if (count(src, 'r8z-c2c3-apply-section-select') < 1) throw new Error('C2C3_SECTION_APPLY_ACTION_MISSING');
if (count(pickerFn.text, 'data-r8z-c2c-section-select') < 1) throw new Error('C2C3_SECTION_SELECT_DATA_ATTR_MISSING');
if (count(candidatesFn.text + normalizeFn.text, '偽候補除外') < 1) throw new Error('C2C3_FAKE_SECTION_FILTER_MISSING');
if (count(pickerFn.text, '選択した課の親部門') < 1) throw new Error('C2C3_PARENT_DEPARTMENT_COPY_MISSING');
if (count(pickerFn.text, 'r8z-c2c-select-section') !== 0) throw new Error('OLD_SECTION_BUTTON_ACTION_STILL_IN_PICKER');
if (count(pickerFn.text, 'r8z-c2c-select-leader') !== 0) throw new Error('OLD_LEADER_BUTTON_ACTION_STILL_IN_PICKER');
if (count(scope, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_C2C3_SCOPE');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
fs.writeFileSync(corePath, src);
