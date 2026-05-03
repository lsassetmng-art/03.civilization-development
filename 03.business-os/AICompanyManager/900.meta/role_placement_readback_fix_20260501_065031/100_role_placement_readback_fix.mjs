import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_ROLE_PLACEMENT_READBACK_AXN_V1';

function countText(needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionRange(functionName) {
  const start = src.indexOf(`function ${functionName}(`);
  if (start < 0) return null;
  const open = src.indexOf('{', start);
  if (open < 0) return null;

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;

    if (depth === 0) return { start, open, end: i + 1 };
  }

  return null;
}

function replaceFunction(functionName, replacement) {
  const range = findFunctionRange(functionName);
  if (!range) {
    console.error(`Function not found: ${functionName}`);
    process.exit(1);
  }
  src = src.slice(0, range.start) + replacement + src.slice(range.end);
}

function insertBeforeFunction(functionName, text) {
  const idx = src.indexOf(`function ${functionName}(`);
  if (idx < 0) {
    console.error(`Insertion anchor not found: ${functionName}`);
    process.exit(1);
  }
  src = src.slice(0, idx) + text + "\n" + src.slice(idx);
}

if (!src.includes(marker)) {
  insertBeforeFunction('aicmInlineRobotOptions', `
// ${marker}
// Read back saved AICompanyManager role placements into edit forms.
// Source: state.context.placements from business.vw_aicm_user_company_worker_placement_display.
// This is UI prefill only. It does not write DB.
function aicmAxnText(value) {
    return String(value || "").trim();
  }

function aicmAxnLower(value) {
    return aicmAxnText(value).toLowerCase();
  }

function aicmAxnCurrentCompany() {
    if (typeof aicmOrgSelectedCompany === "function") {
      var orgCompany = aicmOrgSelectedCompany();
      if (orgCompany) return orgCompany;
    }

    if (typeof selectedCompany === "function") {
      var selected = selectedCompany();
      if (selected) return selected;
    }

    if (typeof aicmAvdCurrentCompany === "function") {
      var avd = aicmAvdCurrentCompany();
      if (avd) return avd;
    }

    var companies = state && state.context && Array.isArray(state.context.companies) ? state.context.companies : [];
    if (state && state.selectedCompanyId) {
      for (var i = 0; i < companies.length; i += 1) {
        if (companies[i] && companies[i].aicm_user_company_id === state.selectedCompanyId) return companies[i];
      }
    }

    return companies[0] || null;
  }

function aicmAxnCompanyId() {
    var company = aicmAxnCurrentCompany();
    return company ? aicmAxnText(company.aicm_user_company_id) : "";
  }

function aicmAxnDepartmentId() {
    var el = document.getElementById("aicm-department-edit-id");
    if (el && el.value) return aicmAxnText(el.value);
    if (state && state.editingDepartmentId) return aicmAxnText(state.editingDepartmentId);
    if (state && state.selectedDepartmentId) return aicmAxnText(state.selectedDepartmentId);
    return "";
  }

function aicmAxnSectionId() {
    var el = document.getElementById("aicm-section-edit-id");
    if (el && el.value) return aicmAxnText(el.value);
    if (state && state.editingSectionId) return aicmAxnText(state.editingSectionId);
    if (state && state.selectedSectionId) return aicmAxnText(state.selectedSectionId);
    return "";
  }

function aicmAxnNormalizeRole(roleCode) {
    var text = aicmAxnLower(roleCode);
    if (text === "president" || text.indexOf("president") >= 0 || text.indexOf("社長") >= 0) return "president";
    if (text === "manager" || text.indexOf("manager") >= 0 || text.indexOf("部長") >= 0) return "manager";
    if (text === "leader" || text.indexOf("leader") >= 0 || text.indexOf("課長") >= 0) return "leader";
    if (text === "worker" || text.indexOf("worker") >= 0 || text.indexOf("従業員") >= 0) return "worker";
    return text;
  }

function aicmAxnPlacementRole(row) {
    row = row || {};
    return aicmAxnNormalizeRole(
      row.role_code ||
      row.placement_role_code ||
      row.assignment_role_code ||
      row.worker_role_code ||
      row.role_name ||
      row.role_label ||
      row.display_role ||
      row.role_display_name
    );
  }

function aicmAxnPlacementMatches(roleCode, row) {
    row = row || {};
    var role = aicmAxnNormalizeRole(roleCode);
    if (aicmAxnPlacementRole(row) !== role) return false;

    var companyId = aicmAxnCompanyId();
    var departmentId = aicmAxnDepartmentId();
    var sectionId = aicmAxnSectionId();

    if (companyId && row.aicm_user_company_id && aicmAxnText(row.aicm_user_company_id) !== companyId) return false;

    if (role === "president") {
      return aicmAxnLower(row.target_level_code) === "company" || aicmAxnText(row.target_id) === companyId;
    }

    if (role === "manager") {
      if (departmentId && row.aicm_user_company_department_id && aicmAxnText(row.aicm_user_company_department_id) !== departmentId) return false;
      return aicmAxnLower(row.target_level_code) === "department" || aicmAxnText(row.target_id) === departmentId;
    }

    if (role === "leader" || role === "worker") {
      if (sectionId && row.aicm_user_company_section_id && aicmAxnText(row.aicm_user_company_section_id) !== sectionId) return false;
      return aicmAxnLower(row.target_level_code) === "section" || aicmAxnText(row.target_id) === sectionId;
    }

    return false;
  }

function aicmAxnActivePlacements() {
    var ctx = state && state.context ? state.context : {};
    var rows = Array.isArray(ctx.placements) ? ctx.placements : [];
    return rows.filter(function (row) {
      return !row.status_code || aicmAxnLower(row.status_code) === "active";
    });
  }

function aicmAxnCurrentPlacements(roleCode) {
    return aicmAxnActivePlacements().filter(function (row) {
      return aicmAxnPlacementMatches(roleCode, row);
    });
  }

function aicmAxnFirstPlacement(roleCode) {
    var rows = aicmAxnCurrentPlacements(roleCode);
    return rows[0] || null;
  }

function aicmAxnPlacementValue(row) {
    row = row || {};
    return aicmAxnText(
      row.robot_pool_id ||
      row.business_robot_pool_id ||
      row.aicm_robot_pool_id ||
      row.worker_pool_id ||
      row.placement_robot_pool_id ||
      row.aiworker_model_code ||
      row.model_code ||
      row.robot_id
    );
  }

function aicmAxnPlacementNickname(row) {
    row = row || {};
    return aicmAxnText(
      row.internal_nickname ||
      row.placement_nickname ||
      row.robot_internal_nickname
    );
  }

function aicmAxnPlacementLabel(row) {
    row = row || {};
    return aicmAxnText(
      row.robot_pool_display_name ||
      row.display_label ||
      row.aiworker_model_name ||
      row.aiworker_model_code ||
      row.robot_name ||
      row.robot_pool_label ||
      row.robot_pool_id
    );
  }

function aicmAxnOptionSelected(row, selectedValue) {
    var selected = aicmAxnText(selectedValue);
    if (!selected) return false;

    var values = [
      typeof aicmRobotValue === "function" ? aicmRobotValue(row) : "",
      row.robot_pool_id,
      row.business_robot_pool_id,
      row.aicm_robot_pool_id,
      row.worker_pool_id,
      row.placement_robot_pool_id,
      row.aiworker_model_code,
      row.model_code,
      row.robot_id
    ].map(aicmAxnText);

    return values.indexOf(selected) >= 0;
  }
`);
}

replaceFunction('aicmInlineRobotOptions', `function aicmInlineRobotOptions(roleCode, selectedValue, selectedLabel) {
    // ${marker}
    var rows = aicmInlineRobotRows(roleCode);
    var selected = aicmAxnText(selectedValue);
    var selectedFound = false;

    if (!rows.length && !selected) {
      return '<option value="">未設定</option><option value="" disabled>候補がありません</option>';
    }

    var options = ['<option value="">未設定</option>'];

    rows.forEach(function (row) {
      var value = typeof aicmRobotValue === "function" ? aicmRobotValue(row) : "";
      var isSelected = selected && aicmAxnOptionSelected(row, selected);
      if (isSelected) selectedFound = true;
      options.push('<option value="' + escapeHtml(value) + '"' + (isSelected ? ' selected' : '') + '>' + escapeHtml(aicmRobotOptionLabel(row)) + '</option>');
    });

    if (selected && !selectedFound) {
      options.push('<option value="' + escapeHtml(selected) + '" selected>' + escapeHtml(selectedLabel || selected) + '</option>');
    }

    return options.join("");
  }`);

replaceFunction('aicmAvdRoleSelect', `function aicmAvdRoleSelect(id, roleCode) {
    // ${marker}
    var role = roleCode || {};
    var existing = aicmAxnFirstPlacement(role.code);
    var selectedValue = aicmAxnPlacementValue(existing);
    var selectedLabel = aicmAxnPlacementLabel(existing);
    var nickname = aicmAxnPlacementNickname(existing);

    return [
      '<label>' + escapeHtml(role.label) + 'ロボット',
      '<select id="' + escapeHtml(id) + '" data-inline-role-code="' + escapeHtml(role.code) + '">',
      aicmInlineRobotOptions(role.code, selectedValue, selectedLabel),
      '</select></label>',
      '<label>' + escapeHtml(role.label) + '社内通称',
      '<input id="' + escapeHtml(id + "-nickname") + '" type="text" value="' + escapeHtml(nickname) + '" placeholder="例: ' + escapeHtml(role.placeholder) + '">',
      '</label>'
    ].join("");
  }`);

replaceFunction('renderAicmWorkerInlineRows', `function renderAicmWorkerInlineRows(fieldPrefix) {
    // ${marker}
    var savedRows = aicmAxnCurrentPlacements("worker");
    var baseCount = typeof aicmWorkerSlotCount === "function" ? aicmWorkerSlotCount() : 3;
    var count = Math.max(baseCount, savedRows.length || 0, 1);
    var safePrefix = fieldPrefix || "worker";
    var html = [];

    for (var i = 0; i < count; i += 1) {
      var existing = savedRows[i] || null;
      var selectedValue = aicmAxnPlacementValue(existing);
      var selectedLabel = aicmAxnPlacementLabel(existing);
      var nickname = aicmAxnPlacementNickname(existing);

      html.push([
        '<div class="aicm-worker-inline-row">',
        '  <label>従業員設定ロボット ' + String(i + 1) + '<select id="aicm-role-' + escapeHtml(safePrefix) + '-robot-' + String(i) + '" data-inline-role-code="worker" data-worker-slot-index="' + String(i) + '">',
        aicmInlineRobotOptions("worker", selectedValue, selectedLabel),
        '  </select></label>',
        '  <label>社内通称<input id="aicm-role-' + escapeHtml(safePrefix) + '-nickname-' + String(i) + '" type="text" value="' + escapeHtml(nickname) + '" placeholder="例: ウルフ@従業員' + String(i + 1) + '"></label>',
        '</div>'
      ].join(""));
    }

    return html.join("");
  }`);

fs.writeFileSync(coreFile, src, 'utf8');

console.log(`coreChanged=${src !== before}`);
console.log(`markerCount=${countText(marker)}`);
console.log(`helperCount=${countText('function aicmAxnFirstPlacement')}`);
console.log(`inlineOptionsCount=${countText('function aicmInlineRobotOptions')}`);
console.log(`roleSelectCount=${countText('function aicmAvdRoleSelect')}`);
console.log(`workerRowsCount=${countText('function renderAicmWorkerInlineRows')}`);
console.log(`asyncAsyncCount=${countText('async async function')}`);
