import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const marker = "AICM_DEDUPE_EDIT_FALLBACK_HELPERS_ATI_ATL_V1";

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

function helpers() {
  return `
// ${marker}
// Single canonical edit fallback helper block.
// Do not duplicate these helpers.

function aicmCtxSafe() {
    var candidates = [];

    if (typeof aicmOrgCtx === "function") {
      try { candidates.push(aicmOrgCtx()); } catch (_) {}
    }

    if (state) {
      candidates.push(state.context);
      candidates.push(state.ctx);
      candidates.push(state.aicmContext);
      candidates.push(state.contextData);
      candidates.push(state.latestContext);
      candidates.push(state.data);
      candidates.push(state);
    }

    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      if (!c || typeof c !== "object") continue;

      if (
        Array.isArray(c.companies) ||
        Array.isArray(c.departments) ||
        Array.isArray(c.sections)
      ) {
        return c;
      }

      if (c.context && typeof c.context === "object") {
        if (
          Array.isArray(c.context.companies) ||
          Array.isArray(c.context.departments) ||
          Array.isArray(c.context.sections)
        ) {
          return c.context;
        }
      }
    }

    return {};
  }

function aicmCompaniesSafe() {
    var ctx = aicmCtxSafe();
    return Array.isArray(ctx.companies) ? ctx.companies : [];
  }

function aicmSelectedCompanySafe() {
    var company = null;
    var companies = aicmCompaniesSafe();

    if (typeof selectedCompany === "function") {
      try { company = selectedCompany(); } catch (_) { company = null; }
    }

    if (!company && typeof aicmOrgSelectedCompany === "function") {
      try { company = aicmOrgSelectedCompany(); } catch (_) { company = null; }
    }

    var selectedIds = [];

    if (state) {
      selectedIds.push(state.selectedCompanyId);
      selectedIds.push(state.selected_company_id);
      selectedIds.push(state.currentCompanyId);
      selectedIds.push(state.companyId);
      selectedIds.push(state.aicm_user_company_id);
    }

    for (var i = 0; !company && i < selectedIds.length; i++) {
      var id = selectedIds[i];
      if (!id) continue;

      company = companies.find(function (row) {
        return row.aicm_user_company_id === id;
      }) || null;
    }

    if (!company) {
      company = companies.find(function (row) {
        return row.selected_flag === true || row.selected_flag === "true" || row.selected_flag === 1;
      }) || companies[0] || null;
    }

    if (company && state) {
      var cid = company.aicm_user_company_id || "";
      state.selectedCompanyId = cid;
      state.selected_company_id = cid;
      state.currentCompanyId = cid;
    }

    return company;
  }

function aicmDepartmentsForCompanySafe(companyId) {
    if (!companyId) return [];

    if (typeof aicmOrgDepartmentsForCompany === "function") {
      try {
        var viaHelper = aicmOrgDepartmentsForCompany(companyId);
        if (Array.isArray(viaHelper) && viaHelper.length > 0) return viaHelper;
      } catch (_) {}
    }

    var ctx = aicmCtxSafe();
    return Array.isArray(ctx.departments) ? ctx.departments.filter(function (row) {
      return row.aicm_user_company_id === companyId;
    }) : [];
  }

function aicmSectionsForCompanySafe(companyId) {
    if (!companyId) return [];

    if (typeof aicmOrgSectionsForCompany === "function") {
      try {
        var viaHelper = aicmOrgSectionsForCompany(companyId);
        if (Array.isArray(viaHelper) && viaHelper.length > 0) return viaHelper;
      } catch (_) {}
    }

    var ctx = aicmCtxSafe();
    return Array.isArray(ctx.sections) ? ctx.sections.filter(function (row) {
      return row.aicm_user_company_id === companyId;
    }) : [];
  }

function aicmDepartmentNameByIdSafe(departmentId) {
    var ctx = aicmCtxSafe();
    var rows = Array.isArray(ctx.departments) ? ctx.departments : [];
    var found = rows.find(function (row) {
      return row.aicm_user_company_department_id === departmentId;
    });

    return found ? (found.department_name || "") : "";
  }

function aicmActionTargetSafe(event, button) {
    if (button && button.getAttribute) return button;

    if (event && event.target && event.target.closest) {
      var found = event.target.closest("[data-core-action]");
      if (found) return found;
    }

    if (event && event.target && event.target.getAttribute) return event.target;

    return null;
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

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">企業変更</p>',
      '  <h2>企業情報を変更</h2>',
      '  <input id="aicm-company-edit-id" type="hidden" value="' + escapeHtml(company.aicm_user_company_id || "") + '">',
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
      '</section>'
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

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門変更</p>',
      '  <h2>部門情報を変更</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>',
      '  <input id="aicm-department-edit-id" type="hidden" value="' + escapeHtml(editing.aicm_user_company_department_id || "") + '">',
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
      '</section>'
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

    var departmentName = aicmDepartmentNameByIdSafe(editing.aicm_user_company_department_id || "");

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">課変更</p>',
      '  <h2>課情報を変更</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>',
      '  <input id="aicm-section-edit-id" type="hidden" value="' + escapeHtml(editing.aicm_user_company_section_id || "") + '">',
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
      '    <button type="button" data-core-action="section-worker-update-open" data-section-id="' + escapeHtml(editing.aicm_user_company_section_id || "") + '">Worker配置を更新</button>',
      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
      '  </div>',
      '</section>'
    ].join(""));
  }`;
}

const renderShellBeforeHash = hashText(extractFunction(src, "renderShell").text);

const helperNames = [
  "aicmCtxSafe",
  "aicmCompaniesSafe",
  "aicmSelectedCompanySafe",
  "aicmDepartmentsForCompanySafe",
  "aicmSectionsForCompanySafe",
  "aicmDepartmentNameByIdSafe",
  "aicmActionTargetSafe"
];

for (const name of helperNames) {
  src = removeFunctionIfExists(src, name);
}

src = insertBeforeFunction(src, "renderCompanyEditPlaceholder", helpers());

src = replaceFunction(src, "renderCompanyEditPlaceholder", companyRenderer());
src = replaceFunction(src, "renderDepartmentEditPlaceholder", departmentRenderer());
src = replaceFunction(src, "renderSectionEditPlaceholder", sectionRenderer());

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);
if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

const companyFn = extractFunction(src, "renderCompanyEditPlaceholder").text;
const departmentFn = extractFunction(src, "renderDepartmentEditPlaceholder").text;
const sectionFn = extractFunction(src, "renderSectionEditPlaceholder").text;
const companySaveFn = extractFunction(src, "saveCompanyUpdateFromForm").text;
const departmentSaveFn = extractFunction(src, "saveDepartmentUpdateFromForm").text;
const sectionSaveFn = extractFunction(src, "saveSectionUpdateFromForm").text;

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  renderShellChanged: false,
  helperCompanySafeCount: count(src, "function aicmSelectedCompanySafe("),
  helperCtxSafeCount: count(src, "function aicmCtxSafe("),
  actionTargetHelperCount: count(src, "function aicmActionTargetSafe("),
  companyFormLabelCount: count(companyFn, "企業情報を変更"),
  companyNeedsSelectionCount: count(companyFn, "AI企業が選択されていません"),
  departmentNameInputCount: count(departmentFn, "aicm-department-edit-name"),
  departmentSaveActionCount: count(departmentFn, "department-update-save"),
  sectionNameInputCount: count(sectionFn, "aicm-section-edit-name"),
  sectionSaveActionCount: count(sectionFn, "section-update-save"),
  sectionWorkerUpdateButtonCount: count(sectionFn, "section-worker-update-open"),
  confirmMarkerCount: count(src, "AICM_DB_WRITE_CONFIRMATION_REQUIRED_ARY_ASB_V1"),
  directCompanySavePostCount: count(companySaveFn, "aicmOrgPostJson("),
  directDepartmentSavePostCount: count(departmentSaveFn, "aicmOrgPostJson("),
  directSectionSavePostCount: count(sectionSaveFn, "aicmOrgPostJson(")
}));
