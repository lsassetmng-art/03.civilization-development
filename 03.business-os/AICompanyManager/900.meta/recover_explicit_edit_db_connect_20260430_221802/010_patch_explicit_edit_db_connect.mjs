import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const marker = "AICM_EXPLICIT_EDIT_DB_CONNECT_AVA_AVD_REDO_V1";

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
  if (functionName === "renderShell") {
    throw new Error("STOP: renderShell replacement prohibited");
  }
  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + replacement + source.slice(fn.end);
}

function insertBeforeFunction(source, functionName, code) {
  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + code + "\n\n  " + source.slice(fn.start);
}

const renderShellBeforeHash = hashText(extractFunction(src, "renderShell").text);

const requiredFunctions = [
  "renderCompanyEditPlaceholder",
  "renderDepartmentEditPlaceholder",
  "renderSectionEditPlaceholder",
  "saveCompanyUpdateFromForm",
  "saveDepartmentUpdateFromForm",
  "saveSectionUpdateFromForm"
];

for (const fn of requiredFunctions) {
  extractFunction(src, fn);
}

const helperCode = `
// ${marker}
function aicmAvdCtx() {
    if (typeof ctx !== "undefined" && ctx) return ctx;
    if (typeof state !== "undefined" && state && state.context) return state.context;
    if (typeof state !== "undefined" && state && state.ctx) return state.ctx;
    return {};
  }

function aicmAvdArray(value) {
    return Array.isArray(value) ? value : [];
  }

function aicmAvdOwnerId() {
    var c = aicmAvdCtx();
    if (c.owner_civilization_id) return c.owner_civilization_id;
    if (typeof state !== "undefined" && state && state.owner_civilization_id) return state.owner_civilization_id;
    if (typeof state !== "undefined" && state && state.ownerCivilizationId) return state.ownerCivilizationId;
    return "00000000-0000-4000-8000-000000000001";
  }

function aicmAvdCurrentCompany() {
    var c = aicmAvdCtx();
    var rows = aicmAvdArray(c.companies);
    var selected = null;

    try {
      if (typeof selectedCompany === "function") selected = selectedCompany();
    } catch (_) {}

    if (selected && selected.aicm_user_company_id) return selected;

    for (var i = 0; i < rows.length; i++) {
      if (rows[i] && rows[i].selected_flag) return rows[i];
    }

    return rows[0] || null;
  }

function aicmAvdCurrentDepartment(companyId) {
    var c = aicmAvdCtx();
    var rows = aicmAvdArray(c.departments);
    var id = companyId || (aicmAvdCurrentCompany() || {}).aicm_user_company_id;

    for (var i = 0; i < rows.length; i++) {
      if (rows[i] && rows[i].aicm_user_company_id === id) return rows[i];
    }

    return rows[0] || null;
  }

function aicmAvdCurrentSection(companyId, departmentId) {
    var c = aicmAvdCtx();
    var rows = aicmAvdArray(c.sections);
    var cid = companyId || (aicmAvdCurrentCompany() || {}).aicm_user_company_id;
    var did = departmentId || (aicmAvdCurrentDepartment(cid) || {}).aicm_user_company_department_id;

    for (var i = 0; i < rows.length; i++) {
      if (!rows[i]) continue;
      if (rows[i].aicm_user_company_id === cid && rows[i].aicm_user_company_department_id === did) return rows[i];
    }

    for (var j = 0; j < rows.length; j++) {
      if (rows[j] && rows[j].aicm_user_company_id === cid) return rows[j];
    }

    return rows[0] || null;
  }

function aicmAvdTextById(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

function aicmAvdRoleSelect(id, roleCode) {
    return [
      '<label>' + escapeHtml(roleCode.label) + 'ロボット',
      '<select id="' + escapeHtml(id) + '">',
      aicmInlineRobotOptions(roleCode.code),
      '</select>',
      '</label>',
      '<label>' + escapeHtml(roleCode.label) + '社内通称',
      '<input id="' + escapeHtml(id + "-nickname") + '" type="text" placeholder="例: ' + escapeHtml(roleCode.placeholder) + '">',
      '</label>'
    ].join("");
  }

function aicmAvdWorkerRows() {
    if (typeof renderAicmWorkerInlineRows === "function") {
      return renderAicmWorkerInlineRows();
    }

    return [
      '<div class="aicm-inline-worker-row" data-worker-slot-index="0">',
      '<label>従業員ロボット<select id="aicm-inline-worker-0-robot">' + aicmInlineRobotOptions("worker") + '</select></label>',
      '<label>従業員社内通称<input id="aicm-inline-worker-0-nickname" type="text" placeholder="例: 作業担当A"></label>',
      '</div>'
    ].join("");
  }

function aicmAvdRoleSummaryRows(prefix) {
    var rows = [];

    function push(label, robotId, nicknameId) {
      var robot = aicmAvdTextById(robotId);
      var nickname = aicmAvdTextById(nicknameId);
      rows.push([label + "ロボット", robot || "未設定"]);
      rows.push([label + "社内通称", nickname || "未設定"]);
    }

    if (prefix === "company") {
      push("社長", "aicm-company-president-robot", "aicm-company-president-robot-nickname");
    }

    if (prefix === "department") {
      push("部長", "aicm-department-manager-robot", "aicm-department-manager-robot-nickname");
    }

    if (prefix === "section") {
      push("課長", "aicm-section-leader-robot", "aicm-section-leader-robot-nickname");

      var workerRows = [];
      var index = 0;

      while (true) {
        var robotEl = document.getElementById("aicm-inline-worker-" + index + "-robot");
        var nickEl = document.getElementById("aicm-inline-worker-" + index + "-nickname");

        if (!robotEl && !nickEl) break;

        workerRows.push({
          robot_pool_id: robotEl ? String(robotEl.value || "") : "",
          internal_nickname: nickEl ? String(nickEl.value || "") : ""
        });

        index++;
      }

      rows.push(["従業員設定", workerRows.length ? JSON.stringify(workerRows) : "未設定"]);
    }

    return rows;
  }

function aicmAvdShowDbConfirm(payload) {
    if (!payload || !payload.endpoint || !payload.body) {
      setMessage("error", "確認画面を表示できません。");
      return;
    }

    if (typeof aicmOrgShowUpdateConfirm === "function") {
      aicmOrgShowUpdateConfirm(payload);
      return;
    }

    if (typeof state !== "undefined") {
      state.pendingOrgUpdate = payload;
    }

    var root = document.getElementById("aicm-root");
    if (!root) return;

    root.innerHTML = renderAicmOrgUpdateConfirmation(payload);
  }

function aicmAvdSummaryHtml(payload) {
    var rows = payload && Array.isArray(payload.summary_rows) ? payload.summary_rows : [];

    if (!rows.length) return "";

    return [
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">保存内容</p>',
      '  <h2>確認対象</h2>',
      '  <dl class="aicm-summary-list">',
      rows.map(function (row) {
        return '<div><dt>' + escapeHtml(row[0] || "") + '</dt><dd>' + escapeHtml(row[1] || "") + '</dd></div>';
      }).join(""),
      '  </dl>',
      '</section>'
    ].join("");
  }
`;

if (!src.includes(marker)) {
  src = insertBeforeFunction(src, "renderCompanyEditPlaceholder", helperCode);
}

const companyRender = `
function renderCompanyEditPlaceholder() {
    var company = aicmAvdCurrentCompany();

    if (!company) {
      return renderShell([
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">企業変更</p>',
        '  <h2>AI企業が選択されていません</h2>',
        '  <p class="aicm-core-empty">AI企業ダッシュボードで企業を作成または選択してください。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
        '  </div>',
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
      '  <label>状態<select id="aicm-company-edit-status">',
      '    <option value="active"' + ((company.company_status || "active") === "active" ? " selected" : "") + '>有効</option>',
      '    <option value="inactive"' + ((company.company_status || "active") === "inactive" ? " selected" : "") + '>無効</option>',
      '  </select></label>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">社長設定</p>',
      '  <h2>社長ロボット</h2>',
      aicmAvdRoleSelect("aicm-company-president-robot", { code: "president", label: "社長", placeholder: "社長" }),
      '</section>',
      '<section class="aicm-core-card aicm-operation-card">',
      '  <p class="aicm-eyebrow">操作</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="company-update-save">変更を保存</button>',
      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
      '  </div>',
      '</section>'
    ].join(""));
  }
`;

const departmentRender = `
function renderDepartmentEditPlaceholder() {
    var company = aicmAvdCurrentCompany();
    var department = aicmAvdCurrentDepartment(company && company.aicm_user_company_id);

    if (!company) {
      return renderShell([
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">部門変更</p>',
        '  <h2>AI企業を選択してください</h2>',
        '  <div class="aicm-dashboard-action-row"><button type="button" data-core-action="go" data-screen="dashboard">戻る</button></div>',
        '</section>'
      ].join(""));
    }

    if (!department) {
      return renderShell([
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">部門変更</p>',
        '  <h2>部門がありません</h2>',
        '  <p class="aicm-core-empty">先に部門を追加してください。</p>',
        '  <div class="aicm-dashboard-action-row"><button type="button" data-core-action="go" data-screen="dashboard">戻る</button></div>',
        '</section>'
      ].join(""));
    }

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門変更</p>',
      '  <h2>部門情報を変更</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>',
      '  <input id="aicm-department-edit-id" type="hidden" value="' + escapeHtml(department.aicm_user_company_department_id || "") + '">',
      '  <input id="aicm-department-edit-company-id" type="hidden" value="' + escapeHtml(company.aicm_user_company_id || "") + '">',
      '  <label>部門名<input id="aicm-department-edit-name" type="text" value="' + escapeHtml(department.department_name || "") + '" placeholder="例: 開発部"></label>',
      '  <label>目的<textarea id="aicm-department-edit-purpose" rows="3" placeholder="部門の目的">' + escapeHtml(department.purpose || "") + '</textarea></label>',
      '  <label>状態<select id="aicm-department-edit-status">',
      '    <option value="active"' + ((department.department_status || "active") === "active" ? " selected" : "") + '>有効</option>',
      '    <option value="inactive"' + ((department.department_status || "active") === "inactive" ? " selected" : "") + '>無効</option>',
      '  </select></label>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部長設定</p>',
      '  <h2>部長ロボット</h2>',
      aicmAvdRoleSelect("aicm-department-manager-robot", { code: "manager", label: "部長", placeholder: "部長" }),
      '</section>',
      '<section class="aicm-core-card aicm-operation-card">',
      '  <p class="aicm-eyebrow">操作</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="department-update-save">変更を保存</button>',
      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
      '  </div>',
      '</section>'
    ].join(""));
  }
`;

const sectionRender = `
function renderSectionEditPlaceholder() {
    var company = aicmAvdCurrentCompany();
    var department = aicmAvdCurrentDepartment(company && company.aicm_user_company_id);
    var section = aicmAvdCurrentSection(company && company.aicm_user_company_id, department && department.aicm_user_company_department_id);

    if (!company) {
      return renderShell([
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">課変更</p>',
        '  <h2>AI企業を選択してください</h2>',
        '  <div class="aicm-dashboard-action-row"><button type="button" data-core-action="go" data-screen="dashboard">戻る</button></div>',
        '</section>'
      ].join(""));
    }

    if (!department || !section) {
      return renderShell([
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">課変更</p>',
        '  <h2>課がありません</h2>',
        '  <p class="aicm-core-empty">先に部門と課を追加してください。</p>',
        '  <div class="aicm-dashboard-action-row"><button type="button" data-core-action="go" data-screen="dashboard">戻る</button></div>',
        '</section>'
      ].join(""));
    }

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">課変更</p>',
      '  <h2>課情報を変更</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>',
      '  <p class="aicm-selected-note">所属部門: <strong>' + escapeHtml(department.department_name || "") + '</strong></p>',
      '  <input id="aicm-section-edit-id" type="hidden" value="' + escapeHtml(section.aicm_user_company_section_id || "") + '">',
      '  <input id="aicm-section-edit-company-id" type="hidden" value="' + escapeHtml(company.aicm_user_company_id || "") + '">',
      '  <input id="aicm-section-edit-department-id" type="hidden" value="' + escapeHtml(department.aicm_user_company_department_id || "") + '">',
      '  <label>課名<input id="aicm-section-edit-name" type="text" value="' + escapeHtml(section.section_name || "") + '" placeholder="例: UI課"></label>',
      '  <label>目的<textarea id="aicm-section-edit-purpose" rows="3" placeholder="課の目的">' + escapeHtml(section.purpose || "") + '</textarea></label>',
      '  <label>状態<select id="aicm-section-edit-status">',
      '    <option value="active"' + ((section.section_status || "active") === "active" ? " selected" : "") + '>有効</option>',
      '    <option value="inactive"' + ((section.section_status || "active") === "inactive" ? " selected" : "") + '>無効</option>',
      '  </select></label>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">課長設定</p>',
      '  <h2>課長ロボット</h2>',
      aicmAvdRoleSelect("aicm-section-leader-robot", { code: "leader", label: "課長", placeholder: "課長" }),
      '</section>',
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">従業員設定</p>',
      '  <h2>従業員ロボット</h2>',
      '  <p class="aicm-selected-note">従業員は複数設定できます。</p>',
      aicmAvdWorkerRows(),
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="inline-worker-slot-add">従業員行を追加</button>',
      '  </div>',
      '</section>',
      '<section class="aicm-core-card aicm-operation-card">',
      '  <p class="aicm-eyebrow">操作</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="section-update-save">変更を保存</button>',
      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
      '  </div>',
      '</section>'
    ].join(""));
  }
`;

const saveCompany = `
function saveCompanyUpdateFromForm() {
    var companyId = aicmAvdTextById("aicm-company-edit-id");

    if (!companyId) {
      setMessage("error", "変更対象の企業が見つかりません。");
      return;
    }

    var body = {
      owner_civilization_id: aicmAvdOwnerId(),
      aicm_user_company_id: companyId,
      company_name: aicmAvdTextById("aicm-company-edit-name"),
      business_domain: aicmAvdTextById("aicm-company-edit-domain"),
      company_status: aicmAvdTextById("aicm-company-edit-status") || "active"
    };

    var rows = [
      ["操作", "企業変更"],
      ["企業名", body.company_name],
      ["事業領域", body.business_domain || "未設定"],
      ["状態", body.company_status]
    ].concat(aicmAvdRoleSummaryRows("company"));

    aicmAvdShowDbConfirm({
      kind: "company-update",
      title: "企業変更",
      endpoint: "/api/aicm/v2/company/update",
      body: body,
      summary_rows: rows
    });
  }
`;

const saveDepartment = `
function saveDepartmentUpdateFromForm() {
    var departmentId = aicmAvdTextById("aicm-department-edit-id");
    var companyId = aicmAvdTextById("aicm-department-edit-company-id");

    if (!departmentId || !companyId) {
      setMessage("error", "変更対象の部門が見つかりません。");
      return;
    }

    var body = {
      owner_civilization_id: aicmAvdOwnerId(),
      aicm_user_company_id: companyId,
      aicm_user_company_department_id: departmentId,
      department_name: aicmAvdTextById("aicm-department-edit-name"),
      purpose: aicmAvdTextById("aicm-department-edit-purpose"),
      department_status: aicmAvdTextById("aicm-department-edit-status") || "active"
    };

    var rows = [
      ["操作", "部門変更"],
      ["部門名", body.department_name],
      ["目的", body.purpose || "未設定"],
      ["状態", body.department_status]
    ].concat(aicmAvdRoleSummaryRows("department"));

    aicmAvdShowDbConfirm({
      kind: "department-update",
      title: "部門変更",
      endpoint: "/api/aicm/v2/department/update",
      body: body,
      summary_rows: rows
    });
  }
`;

const saveSection = `
function saveSectionUpdateFromForm() {
    var sectionId = aicmAvdTextById("aicm-section-edit-id");
    var companyId = aicmAvdTextById("aicm-section-edit-company-id");
    var departmentId = aicmAvdTextById("aicm-section-edit-department-id");

    if (!sectionId || !companyId || !departmentId) {
      setMessage("error", "変更対象の課が見つかりません。");
      return;
    }

    var body = {
      owner_civilization_id: aicmAvdOwnerId(),
      aicm_user_company_id: companyId,
      aicm_user_company_department_id: departmentId,
      aicm_user_company_section_id: sectionId,
      section_name: aicmAvdTextById("aicm-section-edit-name"),
      purpose: aicmAvdTextById("aicm-section-edit-purpose"),
      section_status: aicmAvdTextById("aicm-section-edit-status") || "active"
    };

    var rows = [
      ["操作", "課変更"],
      ["課名", body.section_name],
      ["目的", body.purpose || "未設定"],
      ["状態", body.section_status]
    ].concat(aicmAvdRoleSummaryRows("section"));

    aicmAvdShowDbConfirm({
      kind: "section-update",
      title: "課変更",
      endpoint: "/api/aicm/v2/section/update",
      body: body,
      summary_rows: rows
    });
  }
`;

src = replaceFunction(src, "renderCompanyEditPlaceholder", companyRender);
src = replaceFunction(src, "renderDepartmentEditPlaceholder", departmentRender);
src = replaceFunction(src, "renderSectionEditPlaceholder", sectionRender);
src = replaceFunction(src, "saveCompanyUpdateFromForm", saveCompany);
src = replaceFunction(src, "saveDepartmentUpdateFromForm", saveDepartment);
src = replaceFunction(src, "saveSectionUpdateFromForm", saveSection);

if (src.includes("function renderAicmOrgUpdateConfirmation(")) {
  const original = extractFunction(src, "renderAicmOrgUpdateConfirmation").text;
  if (!original.includes("aicmAvdSummaryHtml")) {
    const confirmation = `
function renderAicmOrgUpdateConfirmation(payload) {
    payload = payload || {};

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">確認画面</p>',
      '  <h2>' + escapeHtml(payload.title || "変更内容の確認") + '</h2>',
      '  <p class="aicm-selected-note">この操作はDBへ保存されます。内容を確認してから確定してください。</p>',
      '</section>',
      aicmAvdSummaryHtml(payload),
      '<section class="aicm-core-card aicm-operation-card">',
      '  <p class="aicm-eyebrow">操作</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="org-update-confirm-execute">確定して保存</button>',
      '    <button type="button" data-core-action="org-update-confirm-cancel">戻る</button>',
      '  </div>',
      '</section>'
    ].join(""));
  }
`;
    src = replaceFunction(src, "renderAicmOrgUpdateConfirmation", confirmation);
  }
}

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);
if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  renderShellChanged: false,
  companyRendererCount: count(src, "function renderCompanyEditPlaceholder("),
  departmentRendererCount: count(src, "function renderDepartmentEditPlaceholder("),
  sectionRendererCount: count(src, "function renderSectionEditPlaceholder("),
  companyEndpointCount: count(src, "/api/aicm/v2/company/update"),
  departmentEndpointCount: count(src, "/api/aicm/v2/department/update"),
  sectionEndpointCount: count(src, "/api/aicm/v2/section/update"),
  confirmSummaryCount: count(src, "aicmAvdSummaryHtml"),
  operationCardCount: count(src, "aicm-operation-card"),
  recommendedOnlyMarkerCount: count(src, "AICM_RECOMMENDED_ONLY_ROBOT_COMBOS_AUK_AUN_V1"),
  roleSettingOpenCount: count(src, "role-setting-open"),
  workerMultiCount: count(src, "従業員は複数設定できます"),
  workerAddActionCount: count(src, "inline-worker-slot-add"),
  confirmationMarkerCount: count(src, "AICM_DB_WRITE_CONFIRMATION_REQUIRED_ARY_ASB_V1")
}));
