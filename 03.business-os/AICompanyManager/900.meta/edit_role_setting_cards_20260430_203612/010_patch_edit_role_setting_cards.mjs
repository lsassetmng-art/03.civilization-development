import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const marker = "AICM_EDIT_ROLE_SETTING_CARDS_ATM_ATP_V1";

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function extractFunction(source, functionName) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error("Opening brace not found: " + functionName);

  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return { start, end: i + 1, text: source.slice(start, i + 1) };
      }
    }
  }

  throw new Error("Function end not found: " + functionName);
}

function removeFunctionIfExists(source, functionName) {
  while (source.includes("function " + functionName + "(")) {
    const fn = extractFunction(source, functionName);
    source = source.slice(0, fn.start) + source.slice(fn.end);
  }
  return source;
}

function replaceFunction(source, functionName, replacement) {
  if (functionName === "renderShell") throw new Error("STOP: renderShell replacement prohibited");
  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + replacement + source.slice(fn.end);
}

function insertBeforeFunction(source, functionName, insertion) {
  const pos = source.indexOf("function " + functionName + "(");
  if (pos < 0) throw new Error("Insertion anchor not found: " + functionName);
  return source.slice(0, pos) + insertion + "\n\n  " + source.slice(pos);
}

function findActionBlockByAction(source, action) {
  const token = `action === "${action}"`;
  const tokenPos = source.indexOf(token);
  if (tokenPos < 0) return null;

  const ifPos = source.lastIndexOf("if", tokenPos);
  const braceStart = source.indexOf("{", tokenPos);
  if (ifPos < 0 || braceStart < 0) throw new Error("action block malformed: " + action);

  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return { start: ifPos, end: i + 1, text: source.slice(ifPos, i + 1) };
    }
  }

  throw new Error("action block end not found: " + action);
}

function insertActionBeforeGo(source, action, blockText) {
  if (source.includes(`action === "${action}"`)) return source;

  const goBlock = findActionBlockByAction(source, "go");
  if (!goBlock) throw new Error("go action anchor not found");

  return source.slice(0, goBlock.start) + blockText + "\n\n    " + source.slice(goBlock.start);
}

function helpers() {
  return `
// ${marker}
// Role setting cards are UI navigation only in this phase.
// Actual DB writes must go through confirmation screen in a later API-connected phase.

function aicmPlacementRoleText(row) {
    if (!row || typeof row !== "object") return "";
    return [
      row.role_code,
      row.placement_role_code,
      row.assignment_role_code,
      row.worker_role_code,
      row.role_name,
      row.role_label,
      row.position_code,
      row.position_label,
      row.display_role,
      row.role_display_name
    ].filter(Boolean).join(" ").toLowerCase();
  }

function aicmPlacementMatchesRole(row, roleCode) {
    var text = aicmPlacementRoleText(row);

    if (roleCode === "president") {
      return text.indexOf("president") >= 0 || text.indexOf("社長") >= 0 || text.indexOf("プレジデント") >= 0;
    }

    if (roleCode === "manager") {
      return text.indexOf("manager") >= 0 || text.indexOf("部長") >= 0 || text.indexOf("マネージャ") >= 0;
    }

    if (roleCode === "leader") {
      return text.indexOf("leader") >= 0 || text.indexOf("課長") >= 0 || text.indexOf("リーダ") >= 0;
    }

    if (roleCode === "worker") {
      return text.indexOf("worker") >= 0 || text.indexOf("従業員") >= 0 || text.indexOf("ワーカー") >= 0;
    }

    return false;
  }

function aicmPlacementRobotLabel(row) {
    if (!row) return "未設定";

    return (
      row.internal_nickname ||
      row.placement_nickname ||
      row.robot_internal_nickname ||
      row.aiworker_model_name ||
      row.aiworker_model_code ||
      row.robot_name ||
      row.robot_pool_label ||
      row.robot_pool_id ||
      "設定済み"
    );
  }

function aicmRoleScopeMatches(row, scope) {
    if (!row || !scope) return false;

    if (scope.companyId && row.aicm_user_company_id && row.aicm_user_company_id !== scope.companyId) return false;

    if (scope.departmentId) {
      var rowDepartmentId = row.aicm_user_company_department_id || row.department_id || "";
      if (rowDepartmentId && rowDepartmentId !== scope.departmentId) return false;
    }

    if (scope.sectionId) {
      var rowSectionId = row.aicm_user_company_section_id || row.section_id || "";
      if (rowSectionId && rowSectionId !== scope.sectionId) return false;
    }

    return true;
  }

function aicmCurrentRolePlacements(roleCode, scope) {
    var ctx = typeof aicmCtxSafe === "function" ? aicmCtxSafe() : (state.context || state || {});
    var placements = Array.isArray(ctx.placements) ? ctx.placements : [];

    return placements.filter(function (row) {
      return aicmPlacementMatchesRole(row, roleCode) && aicmRoleScopeMatches(row, scope);
    });
  }

function renderAicmRoleSettingCard(roleCode, title, subtitle, scope) {
    var rows = aicmCurrentRolePlacements(roleCode, scope);
    var body = "";

    if (rows.length === 0) {
      body = '<p class="aicm-core-empty">未設定</p>';
    } else if (roleCode === "worker") {
      body = '<ul class="aicm-mini-list">' + rows.map(function (row) {
        return '<li>' + escapeHtml(aicmPlacementRobotLabel(row)) + '</li>';
      }).join("") + '</ul>';
    } else {
      body = '<p class="aicm-selected-note">現在: <strong>' + escapeHtml(aicmPlacementRobotLabel(rows[0])) + '</strong></p>';
    }

    return [
      '<section class="aicm-core-card aicm-role-setting-card">',
      '  <p class="aicm-eyebrow">役職設定</p>',
      '  <h2>' + escapeHtml(title) + '</h2>',
      subtitle ? '  <p class="aicm-selected-note">' + escapeHtml(subtitle) + '</p>' : '',
      body,
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="role-setting-open" data-role-code="' + escapeHtml(roleCode) + '" data-company-id="' + escapeHtml(scope.companyId || "") + '" data-department-id="' + escapeHtml(scope.departmentId || "") + '" data-section-id="' + escapeHtml(scope.sectionId || "") + '">' + escapeHtml(title) + 'へ</button>',
      '  </div>',
      '</section>'
    ].join("");
  }
`;
}

function companyRenderer() {
  return `
function renderCompanyEditPlaceholder() {
    var company = aicmSelectedCompanySafe();

    if (!company) {
      return renderShell([
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">企業変更</p>',
        '  <h2>AI企業が選択されていません</h2>',
        '  <p class="aicm-core-empty">AI企業ダッシュボードで企業を作成または選択してください。</p>',
        '  <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
        '</section>'
      ].join(""));
    }

    var companyId = company.aicm_user_company_id || "";

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">企業変更</p>',
      '  <h2>企業情報を変更</h2>',
      '  <input id="aicm-company-edit-id" type="hidden" value="' + escapeHtml(companyId) + '">',
      '  <label>企業名<input id="aicm-company-edit-name" type="text" value="' + escapeHtml(company.company_name || "") + '" placeholder="例: ウルフ"></label>',
      '  <label>事業領域<textarea id="aicm-company-edit-domain" rows="3" placeholder="例: 開発 / 運営 / 管理">' + escapeHtml(company.business_domain || "") + '</textarea></label>',
      '  <label>会社共通ルール<textarea id="aicm-company-edit-rules" rows="3" placeholder="会社共通ルール">' + escapeHtml(company.company_common_rules_text || "") + '</textarea></label>',
      '  <label>Presidentへの方針指示<textarea id="aicm-company-edit-president-policy" rows="3" placeholder="Presidentへの方針指示">' + escapeHtml(company.president_policy_instruction_text || "") + '</textarea></label>',
      '  <label>状態<select id="aicm-company-edit-status">',
      '    <option value="active"' + ((company.company_status || "active") === "active" ? " selected" : "") + '>有効</option>',
      '    <option value="paused"' + ((company.company_status || "") === "paused" ? " selected" : "") + '>一時停止</option>',
      '    <option value="archived"' + ((company.company_status || "") === "archived" ? " selected" : "") + '>アーカイブ</option>',
      '  </select></label>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="company-update-save">変更を保存</button>',
      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
      '  </div>',
      '</section>',
      renderAicmRoleSettingCard("president", "社長設定", "AI企業全体の方針を受けるPresidentを設定します。", { companyId: companyId })
    ].join(""));
  }`;
}

function departmentRenderer() {
  return `
function renderDepartmentEditPlaceholder() {
    var company = aicmSelectedCompanySafe();

    if (!company) {
      return renderShell('<section class="aicm-core-card"><p class="aicm-eyebrow">部門変更</p><h2>AI企業を選択してください</h2></section>');
    }

    var companyId = company.aicm_user_company_id || "";
    var departments = aicmDepartmentsForCompanySafe(companyId);

    var editingId = state.editingDepartmentId || "";
    var editing = departments.find(function (row) {
      return row.aicm_user_company_department_id === editingId;
    }) || departments[0] || null;

    if (!editing) {
      return renderShell([
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">部門変更</p>',
        '  <h2>変更する部門がありません</h2>',
        '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>',
        '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
        '</section>'
      ].join(""));
    }

    state.editingDepartmentId = editing.aicm_user_company_department_id || "";

    var departmentId = editing.aicm_user_company_department_id || "";

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門変更</p>',
      '  <h2>部門情報を変更</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>',
      '  <input id="aicm-department-edit-id" type="hidden" value="' + escapeHtml(departmentId) + '">',
      '  <label>部門名<input id="aicm-department-edit-name" type="text" value="' + escapeHtml(editing.department_name || "") + '" placeholder="例: 開発部"></label>',
      '  <label>目的<textarea id="aicm-department-edit-purpose" rows="3" placeholder="部門の目的">' + escapeHtml(editing.purpose || "") + '</textarea></label>',
      '  <label>状態<select id="aicm-department-edit-status">',
      '    <option value="active"' + ((editing.department_status || "active") === "active" ? " selected" : "") + '>有効</option>',
      '    <option value="paused"' + ((editing.department_status || "") === "paused" ? " selected" : "") + '>一時停止</option>',
      '    <option value="archived"' + ((editing.department_status || "") === "archived" ? " selected" : "") + '>アーカイブ</option>',
      '  </select></label>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="department-update-save">変更を保存</button>',
      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
      '  </div>',
      '</section>',
      renderAicmRoleSettingCard("manager", "部長設定", "この部門を統括するManagerを設定します。", { companyId: companyId, departmentId: departmentId })
    ].join(""));
  }`;
}

function sectionRenderer() {
  return `
function renderSectionEditPlaceholder() {
    var company = aicmSelectedCompanySafe();

    if (!company) {
      return renderShell('<section class="aicm-core-card"><p class="aicm-eyebrow">課変更</p><h2>AI企業を選択してください</h2></section>');
    }

    var companyId = company.aicm_user_company_id || "";
    var sections = aicmSectionsForCompanySafe(companyId);

    var editingId = state.editingSectionId || "";
    var editing = sections.find(function (row) {
      return row.aicm_user_company_section_id === editingId;
    }) || sections[0] || null;

    if (!editing) {
      return renderShell([
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">課変更</p>',
        '  <h2>変更する課がありません</h2>',
        '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>',
        '  <button type="button" data-core-action="go" data-screen="section-new">課新規追加</button>',
        '</section>'
      ].join(""));
    }

    state.editingSectionId = editing.aicm_user_company_section_id || "";

    var sectionId = editing.aicm_user_company_section_id || "";
    var departmentId = editing.aicm_user_company_department_id || "";
    var departmentName = aicmDepartmentNameByIdSafe(departmentId);

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">課変更</p>',
      '  <h2>課情報を変更</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>',
      '  <input id="aicm-section-edit-id" type="hidden" value="' + escapeHtml(sectionId) + '">',
      '  <label>課名<input id="aicm-section-edit-name" type="text" value="' + escapeHtml(editing.section_name || "") + '" placeholder="例: UI課"></label>',
      departmentName ? '  <p class="aicm-selected-note">所属部門: <strong>' + escapeHtml(departmentName) + '</strong></p>' : '',
      '  <label>目的<textarea id="aicm-section-edit-purpose" rows="3" placeholder="課の目的">' + escapeHtml(editing.purpose || "") + '</textarea></label>',
      '  <label>状態<select id="aicm-section-edit-status">',
      '    <option value="active"' + ((editing.section_status || "active") === "active" ? " selected" : "") + '>有効</option>',
      '    <option value="paused"' + ((editing.section_status || "") === "paused" ? " selected" : "") + '>一時停止</option>',
      '    <option value="archived"' + ((editing.section_status || "") === "archived" ? " selected" : "") + '>アーカイブ</option>',
      '  </select></label>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="section-update-save">変更を保存</button>',
      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
      '  </div>',
      '</section>',
      renderAicmRoleSettingCard("leader", "課長設定", "この課を統括するLeaderを設定します。", { companyId: companyId, departmentId: departmentId, sectionId: sectionId }),
      renderAicmRoleSettingCard("worker", "従業員設定", "この課に配置するWorkerを設定します。", { companyId: companyId, departmentId: departmentId, sectionId: sectionId })
    ].join(""));
  }`;
}

const renderShellBeforeHash = hashText(extractFunction(src, "renderShell").text);

src = removeFunctionIfExists(src, "aicmPlacementRoleText");
src = removeFunctionIfExists(src, "aicmPlacementMatchesRole");
src = removeFunctionIfExists(src, "aicmPlacementRobotLabel");
src = removeFunctionIfExists(src, "aicmRoleScopeMatches");
src = removeFunctionIfExists(src, "aicmCurrentRolePlacements");
src = removeFunctionIfExists(src, "renderAicmRoleSettingCard");

src = insertBeforeFunction(src, "renderCompanyEditPlaceholder", helpers());

src = replaceFunction(src, "renderCompanyEditPlaceholder", companyRenderer());
src = replaceFunction(src, "renderDepartmentEditPlaceholder", departmentRenderer());
src = replaceFunction(src, "renderSectionEditPlaceholder", sectionRenderer());

src = insertActionBeforeGo(src, "role-setting-open", `if (action === "role-setting-open") {
      var actionTarget = typeof aicmActionTargetSafe === "function" ? aicmActionTargetSafe(event, button) : (event && event.target ? event.target : null);
      state.workerPlacementRoleCode = actionTarget && actionTarget.getAttribute ? String(actionTarget.getAttribute("data-role-code") || "") : "";
      state.workerPlacementCompanyId = actionTarget && actionTarget.getAttribute ? String(actionTarget.getAttribute("data-company-id") || "") : "";
      state.workerPlacementDepartmentId = actionTarget && actionTarget.getAttribute ? String(actionTarget.getAttribute("data-department-id") || "") : "";
      state.workerPlacementSectionId = actionTarget && actionTarget.getAttribute ? String(actionTarget.getAttribute("data-section-id") || "") : "";
      state.screen = "worker-placement";
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      if (typeof render === "function") render();
      return;
    }`);

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);
if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

const companyFn = extractFunction(src, "renderCompanyEditPlaceholder").text;
const departmentFn = extractFunction(src, "renderDepartmentEditPlaceholder").text;
const sectionFn = extractFunction(src, "renderSectionEditPlaceholder").text;
const roleCardFn = extractFunction(src, "renderAicmRoleSettingCard").text;
const companySaveFn = extractFunction(src, "saveCompanyUpdateFromForm").text;
const departmentSaveFn = extractFunction(src, "saveDepartmentUpdateFromForm").text;
const sectionSaveFn = extractFunction(src, "saveSectionUpdateFromForm").text;

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  renderShellChanged: false,
  roleCardHelperCount: count(src, "function renderAicmRoleSettingCard("),
  companyPresidentCount: count(companyFn, "社長設定"),
  departmentManagerCount: count(departmentFn, "部長設定"),
  sectionLeaderCount: count(sectionFn, "課長設定"),
  sectionWorkerCount: count(sectionFn, "従業員設定"),
  roleSettingOpenActionCount: count(src, 'action === "role-setting-open"'),
  roleSettingButtonCount: count(src, 'data-core-action="role-setting-open"'),
  companyNameInputCount: count(companyFn, "aicm-company-edit-name"),
  departmentNameInputCount: count(departmentFn, "aicm-department-edit-name"),
  sectionNameInputCount: count(sectionFn, "aicm-section-edit-name"),
  roleCardUsesCurrentPlacementCount: count(roleCardFn, "aicmCurrentRolePlacements"),
  confirmMarkerCount: count(src, "AICM_DB_WRITE_CONFIRMATION_REQUIRED_ARY_ASB_V1"),
  directCompanySavePostCount: count(companySaveFn, "aicmOrgPostJson("),
  directDepartmentSavePostCount: count(departmentSaveFn, "aicmOrgPostJson("),
  directSectionSavePostCount: count(sectionSaveFn, "aicmOrgPostJson(")
}));
