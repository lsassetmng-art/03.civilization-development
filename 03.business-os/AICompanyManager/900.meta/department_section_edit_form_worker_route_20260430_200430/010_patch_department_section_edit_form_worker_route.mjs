import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const marker = "AICM_DEPT_SECTION_EDIT_FORM_WORKER_ROUTE_ASW_ASZ_V1";

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
        return {
          start,
          end: i + 1,
          text: source.slice(start, i + 1)
        };
      }
    }
  }

  throw new Error("Function end not found: " + functionName);
}

function replaceFunction(source, functionName, replacement) {
  if (functionName === "renderShell") throw new Error("STOP: renderShell replacement prohibited");
  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + replacement + source.slice(fn.end);
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

function departmentRenderer() {
  return `
function renderDepartmentEditPlaceholder() {
    var company = typeof selectedCompany === "function" ? selectedCompany() : null;

    if (!company && typeof aicmOrgSelectedCompany === "function") {
      company = aicmOrgSelectedCompany();
    }

    if (!company) {
      return renderShell('<section class="aicm-core-card"><p class="aicm-eyebrow">部門変更</p><h2>AI企業を選択してください</h2></section>');
    }

    var companyId = company.aicm_user_company_id || "";
    var departments = [];

    if (typeof aicmOrgDepartmentsForCompany === "function") {
      departments = aicmOrgDepartmentsForCompany(companyId);
    } else {
      var ctx = typeof aicmOrgCtx === "function" ? aicmOrgCtx() : (state.context || state || {});
      departments = Array.isArray(ctx.departments) ? ctx.departments.filter(function (row) {
        return row.aicm_user_company_id === companyId;
      }) : [];
    }

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

    var list = departments.map(function (row) {
      var id = row.aicm_user_company_department_id || "";
      var active = id === state.editingDepartmentId ? " selected" : "";

      return [
        '<div class="aicm-list-item' + active + '">',
        '  <div>',
        '    <strong>' + escapeHtml(row.department_name || "部門") + '</strong>',
        '    <p>' + escapeHtml(row.purpose || "目的未設定") + '</p>',
        '  </div>',
        '  <button type="button" data-core-action="department-edit-pick" data-department-id="' + escapeHtml(id) + '">選択</button>',
        '</div>'
      ].join("");
    }).join("");

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門変更</p>',
      '  <h2>部門情報を変更</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>',
      departments.length > 1 ? '<div class="aicm-mini-list">' + list + '</div>' : '',
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
    var company = typeof selectedCompany === "function" ? selectedCompany() : null;

    if (!company && typeof aicmOrgSelectedCompany === "function") {
      company = aicmOrgSelectedCompany();
    }

    if (!company) {
      return renderShell('<section class="aicm-core-card"><p class="aicm-eyebrow">課変更</p><h2>AI企業を選択してください</h2></section>');
    }

    var companyId = company.aicm_user_company_id || "";
    var ctx = typeof aicmOrgCtx === "function" ? aicmOrgCtx() : (state.context || state || {});
    var departments = typeof aicmOrgDepartmentsForCompany === "function" ? aicmOrgDepartmentsForCompany(companyId) : [];
    var sections = [];

    if (typeof aicmOrgSectionsForCompany === "function") {
      sections = aicmOrgSectionsForCompany(companyId);
    } else {
      sections = Array.isArray(ctx.sections) ? ctx.sections.filter(function (row) {
        return row.aicm_user_company_id === companyId;
      }) : [];
    }

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

    var departmentName = "";
    var department = departments.find(function (row) {
      return row.aicm_user_company_department_id === editing.aicm_user_company_department_id;
    });

    if (department) departmentName = department.department_name || "";

    var list = sections.map(function (row) {
      var id = row.aicm_user_company_section_id || "";
      var dept = departments.find(function (d) {
        return d.aicm_user_company_department_id === row.aicm_user_company_department_id;
      });
      var active = id === state.editingSectionId ? " selected" : "";

      return [
        '<div class="aicm-list-item' + active + '">',
        '  <div>',
        '    <strong>' + escapeHtml(row.section_name || "課") + '</strong>',
        '    <p>' + escapeHtml((dept && dept.department_name ? dept.department_name : "部門未設定") + " / " + (row.purpose || "目的未設定")) + '</p>',
        '  </div>',
        '  <button type="button" data-core-action="section-edit-pick" data-section-id="' + escapeHtml(id) + '">選択</button>',
        '</div>'
      ].join("");
    }).join("");

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">課変更</p>',
      '  <h2>課情報を変更</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>',
      sections.length > 1 ? '<div class="aicm-mini-list">' + list + '</div>' : '',
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

src = replaceFunction(src, "renderDepartmentEditPlaceholder", departmentRenderer());
src = replaceFunction(src, "renderSectionEditPlaceholder", sectionRenderer());

src = insertActionBeforeGo(src, "department-edit-pick", `if (action === "department-edit-pick") {
      state.editingDepartmentId = target && target.getAttribute ? String(target.getAttribute("data-department-id") || "") : "";
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      if (typeof render === "function") render();
      return;
    }`);

src = insertActionBeforeGo(src, "section-edit-pick", `if (action === "section-edit-pick") {
      state.editingSectionId = target && target.getAttribute ? String(target.getAttribute("data-section-id") || "") : "";
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      if (typeof render === "function") render();
      return;
    }`);

src = insertActionBeforeGo(src, "section-worker-update-open", `if (action === "section-worker-update-open") {
      state.editingSectionId = target && target.getAttribute ? String(target.getAttribute("data-section-id") || "") : (state.editingSectionId || "");
      state.workerPlacementSectionId = state.editingSectionId || "";
      state.screen = "worker-placement";
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      if (typeof render === "function") render();
      return;
    }`);

if (!src.includes(marker)) {
  src = src.replace("function renderDepartmentEditPlaceholder()", "// " + marker + "\nfunction renderDepartmentEditPlaceholder()");
}

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);
if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

const departmentFn = extractFunction(src, "renderDepartmentEditPlaceholder").text;
const sectionFn = extractFunction(src, "renderSectionEditPlaceholder").text;
const companySaveFn = extractFunction(src, "saveCompanyUpdateFromForm").text;
const departmentSaveFn = extractFunction(src, "saveDepartmentUpdateFromForm").text;
const sectionSaveFn = extractFunction(src, "saveSectionUpdateFromForm").text;

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  renderShellChanged: false,
  departmentNameInputCount: count(departmentFn, "aicm-department-edit-name"),
  departmentPurposeInputCount: count(departmentFn, "aicm-department-edit-purpose"),
  departmentStatusInputCount: count(departmentFn, "aicm-department-edit-status"),
  departmentSaveActionCount: count(departmentFn, "department-update-save"),
  sectionNameInputCount: count(sectionFn, "aicm-section-edit-name"),
  sectionPurposeInputCount: count(sectionFn, "aicm-section-edit-purpose"),
  sectionStatusInputCount: count(sectionFn, "aicm-section-edit-status"),
  sectionSaveActionCount: count(sectionFn, "section-update-save"),
  sectionWorkerUpdateButtonCount: count(sectionFn, "section-worker-update-open"),
  departmentPickActionCount: count(src, 'action === "department-edit-pick"'),
  sectionPickActionCount: count(src, 'action === "section-edit-pick"'),
  sectionWorkerUpdateActionCount: count(src, 'action === "section-worker-update-open"'),
  confirmMarkerCount: count(src, "AICM_DB_WRITE_CONFIRMATION_REQUIRED_ARY_ASB_V1"),
  directCompanySavePostCount: count(companySaveFn, "aicmOrgPostJson("),
  directDepartmentSavePostCount: count(departmentSaveFn, "aicmOrgPostJson("),
  directSectionSavePostCount: count(sectionSaveFn, "aicmOrgPostJson(")
}));
