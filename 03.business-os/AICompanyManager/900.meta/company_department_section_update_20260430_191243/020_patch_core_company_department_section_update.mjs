import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");
const marker = "AICM_ORG_UPDATE_UI_ARU_ARX_V1";

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

function listFunctions(source) {
  const names = [];
  const re = /function\s+([A-Za-z0-9_]+)\s*\(/g;
  let m;
  while ((m = re.exec(source))) names.push(m[1]);
  return names;
}

function replaceFunction(source, functionName, replacement) {
  if (functionName === "renderShell") throw new Error("STOP: renderShell replacement prohibited");
  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + replacement + source.slice(fn.end);
}

function functionExists(source, name) {
  return source.includes("function " + name + "(");
}

function scoreRenderer(fnText, labels) {
  let score = 0;
  for (const label of labels) {
    if (fnText.includes(label)) score += 5;
  }
  if (fnText.includes("renderShell(")) score += 3;
  if (fnText.includes("return [") || fnText.includes("join(")) score += 2;
  if (fnText.includes("data-screen")) score += 1;
  return score;
}

function findRenderer(source, kind) {
  const config = {
    company: {
      preferred: [
        "renderCompanyEditPlaceholder",
        "renderCompanyChangePlaceholder",
        "renderCompanyUpdatePlaceholder",
        "renderCompanyEditScreen",
        "renderCompanyChangeScreen"
      ],
      labels: ["企業変更", "会社変更", "AI企業変更", "企業名変更"]
    },
    department: {
      preferred: [
        "renderDepartmentEditPlaceholder",
        "renderDepartmentChangePlaceholder",
        "renderDepartmentUpdatePlaceholder",
        "renderDepartmentEditScreen",
        "renderDepartmentChangeScreen"
      ],
      labels: ["部門変更", "部門詳細", "部門設定"]
    },
    section: {
      preferred: [
        "renderSectionEditPlaceholder",
        "renderSectionChangePlaceholder",
        "renderSectionUpdatePlaceholder",
        "renderSectionEditScreen",
        "renderSectionChangeScreen",
        "renderOrganizationEditPlaceholder",
        "renderOrganizationChangePlaceholder"
      ],
      labels: ["課変更", "課詳細", "課設定"]
    }
  }[kind];

  for (const name of config.preferred) {
    if (functionExists(source, name)) return name;
  }

  const excluded = new Set([
    "renderShell",
    "renderDashboard",
    "renderTree",
    "renderNav",
    "renderHeader",
    "renderMenu",
    "renderHumanReviewRows",
    "renderCsvImportCard",
    "renderTaskLedgerPlaceholder"
  ]);

  const candidates = [];

  for (const name of listFunctions(source)) {
    if (excluded.has(name)) continue;

    let fn = "";
    try {
      fn = extractFunction(source, name).text;
    } catch (_) {
      continue;
    }

    const score = scoreRenderer(fn, config.labels);
    if (score >= 5) candidates.push({ name, score });
  }

  candidates.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  if (candidates.length > 0) return candidates[0].name;

  throw new Error("STOP: " + kind + " renderer not found");
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
      if (depth === 0) return { start: ifPos, end: i + 1 };
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

function insertBeforeFunction(source, functionName, insertion) {
  if (source.includes(marker)) return source;

  const pos = source.indexOf("function " + functionName + "(");
  if (pos < 0) throw new Error("core insertion anchor not found: " + functionName);

  return source.slice(0, pos) + insertion + "\n\n  " + source.slice(pos);
}

function makeHelperCode() {
  return `
// ${marker}
// Company / Department / Section update UI.
// No bridge, no debug layer, no legacy localStorage owner.

function aicmOrgCtx() {
    return state.context || state || {};
  }

  function aicmOrgOwnerId() {
    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
    if (state && state.owner_civilization_id) return state.owner_civilization_id;
    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
    return "00000000-0000-4000-8000-000000000001";
  }

  function aicmOrgCompanies() {
    var ctx = aicmOrgCtx();
    var rows = ctx.companies || state.companies || [];
    return Array.isArray(rows) ? rows : [];
  }

  function aicmOrgDepartments() {
    var ctx = aicmOrgCtx();
    var rows = ctx.departments || state.departments || [];
    return Array.isArray(rows) ? rows : [];
  }

  function aicmOrgSections() {
    var ctx = aicmOrgCtx();
    var rows = ctx.sections || state.sections || [];
    return Array.isArray(rows) ? rows : [];
  }

  function aicmOrgSelectedCompany() {
    if (typeof selectedCompany === "function") {
      var c = selectedCompany();
      if (c) return c;
    }

    return aicmOrgCompanies()[0] || null;
  }

  function aicmOrgCompanyById(id) {
    return aicmOrgCompanies().find(function (row) {
      return row.aicm_user_company_id === id;
    }) || null;
  }

  function aicmOrgDepartmentById(id) {
    return aicmOrgDepartments().find(function (row) {
      return row.aicm_user_company_department_id === id;
    }) || null;
  }

  function aicmOrgSectionById(id) {
    return aicmOrgSections().find(function (row) {
      return row.aicm_user_company_section_id === id;
    }) || null;
  }

  function aicmOrgDepartmentsForCompany(companyId) {
    return aicmOrgDepartments().filter(function (row) {
      return !companyId || row.aicm_user_company_id === companyId;
    });
  }

  function aicmOrgSectionsForCompany(companyId) {
    return aicmOrgSections().filter(function (row) {
      return !companyId || row.aicm_user_company_id === companyId;
    });
  }

  function aicmOrgSectionsForDepartment(departmentId) {
    return aicmOrgSections().filter(function (row) {
      return !departmentId || row.aicm_user_company_department_id === departmentId;
    });
  }

  function aicmOrgValue(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function aicmOrgSetScreen(screen) {
    state.screen = screen;
    if (typeof render === "function") render();
  }

  async function aicmOrgPostJson(path, body) {
    var response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });

    var text = await response.text();
    var json = {};

    try {
      json = text ? JSON.parse(text) : {};
    } catch (_) {
      json = { result: "error", message: text || "Invalid server response" };
    }

    if (!response.ok || (json.result && json.result !== "ok")) {
      throw new Error(json.message || json.error || ("API failed: " + path));
    }

    return json;
  }

  async function aicmOrgReloadContext() {
    if (typeof aicmPmlwReloadContext === "function") {
      await aicmPmlwReloadContext();
      return;
    }

    if (typeof aicmHumanReviewReload === "function") {
      await aicmHumanReviewReload();
      return;
    }

    if (typeof loadContext === "function") {
      await loadContext();
      return;
    }

    var owner = encodeURIComponent(aicmOrgOwnerId());
    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
    var json = await response.json();

    if (json && json.result === "ok") state.context = json;
    if (typeof render === "function") render();
  }

  function renderCompanyUpdateForm(company) {
    if (!company) {
      return [
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">企業変更</p>',
        '  <h2>AI企業が選択されていません</h2>',
        '  <p class="aicm-core-empty">先にAI企業ダッシュボードで企業を選択してください。</p>',
        '</section>'
      ].join("");
    }

    return [
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">企業変更</p>',
      '  <h2>企業情報を変更</h2>',
      '  <input type="hidden" id="aicm-company-edit-id" value="' + escapeHtml(company.aicm_user_company_id || '') + '">',
      '  <label>企業名<input id="aicm-company-edit-name" type="text" value="' + escapeHtml(company.company_name || '') + '"></label>',
      '  <label>事業領域<textarea id="aicm-company-edit-domain" rows="3">' + escapeHtml(company.business_domain || '') + '</textarea></label>',
      '  <label>会社共通ルール<textarea id="aicm-company-edit-rules" rows="4">' + escapeHtml(company.company_common_rules_text || '') + '</textarea></label>',
      '  <label>President方針指示<textarea id="aicm-company-edit-policy" rows="4">' + escapeHtml(company.president_policy_instruction_text || '') + '</textarea></label>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="company-update-save">変更を保存</button>',
      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function renderDepartmentUpdatePicker(company, rows) {
    if (!company) {
      return '<section class="aicm-core-card"><p class="aicm-eyebrow">部門変更</p><h2>AI企業を選択してください</h2></section>';
    }

    if (!rows.length) {
      return [
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">部門変更</p>',
        '  <h2>変更できる部門がありません</h2>',
        '  <p class="aicm-core-empty">先に部門新規追加で部門を作成してください。</p>',
        '</section>'
      ].join("");
    }

    return [
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門変更</p>',
      '  <h2>変更する部門を選択</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || '') + '</strong></p>',
      rows.map(function (row) {
        return [
          '<article class="aicm-org-update-row">',
          '  <div>',
          '    <strong>' + escapeHtml(row.department_name || '部門') + '</strong>',
          '    <p>' + escapeHtml(row.purpose || '') + '</p>',
          '  </div>',
          '  <button type="button" data-core-action="department-update-select" data-department-id="' + escapeHtml(row.aicm_user_company_department_id || '') + '">変更</button>',
          '</article>'
        ].join("");
      }).join(""),
      '</section>'
    ].join("");
  }

  function renderDepartmentUpdateForm(department) {
    return [
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門変更</p>',
      '  <h2>部門情報を変更</h2>',
      '  <input type="hidden" id="aicm-department-edit-id" value="' + escapeHtml(department.aicm_user_company_department_id || '') + '">',
      '  <label>部門名<input id="aicm-department-edit-name" type="text" value="' + escapeHtml(department.department_name || '') + '"></label>',
      '  <label>目的<textarea id="aicm-department-edit-purpose" rows="4">' + escapeHtml(department.purpose || '') + '</textarea></label>',
      '  <label>状態<select id="aicm-department-edit-status">',
      '    <option value="active"' + ((department.department_status || 'active') === 'active' ? ' selected' : '') + '>active</option>',
      '    <option value="inactive"' + ((department.department_status || '') === 'inactive' ? ' selected' : '') + '>inactive</option>',
      '    <option value="archived"' + ((department.department_status || '') === 'archived' ? ' selected' : '') + '>archived</option>',
      '  </select></label>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="department-update-save">変更を保存</button>',
      '    <button type="button" data-core-action="department-update-clear">一覧へ戻る</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function renderSectionUpdatePicker(company, rows) {
    if (!company) {
      return '<section class="aicm-core-card"><p class="aicm-eyebrow">課変更</p><h2>AI企業を選択してください</h2></section>';
    }

    if (!rows.length) {
      return [
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">課変更</p>',
        '  <h2>変更できる課がありません</h2>',
        '  <p class="aicm-core-empty">先に課新規追加で課を作成してください。</p>',
        '</section>'
      ].join("");
    }

    return [
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">課変更</p>',
      '  <h2>変更する課を選択</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || '') + '</strong></p>',
      rows.map(function (row) {
        var dept = aicmOrgDepartmentById(row.aicm_user_company_department_id) || {};
        return [
          '<article class="aicm-org-update-row">',
          '  <div>',
          '    <strong>' + escapeHtml(row.section_name || '課') + '</strong>',
          '    <p>' + escapeHtml(dept.department_name || '') + (row.purpose ? ' / ' + escapeHtml(row.purpose || '') : '') + '</p>',
          '  </div>',
          '  <button type="button" data-core-action="section-update-select" data-section-id="' + escapeHtml(row.aicm_user_company_section_id || '') + '">変更</button>',
          '</article>'
        ].join("");
      }).join(""),
      '</section>'
    ].join("");
  }

  function renderSectionUpdateForm(section) {
    return [
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">課変更</p>',
      '  <h2>課情報を変更</h2>',
      '  <input type="hidden" id="aicm-section-edit-id" value="' + escapeHtml(section.aicm_user_company_section_id || '') + '">',
      '  <label>課名<input id="aicm-section-edit-name" type="text" value="' + escapeHtml(section.section_name || '') + '"></label>',
      '  <label>目的<textarea id="aicm-section-edit-purpose" rows="4">' + escapeHtml(section.purpose || '') + '</textarea></label>',
      '  <label>状態<select id="aicm-section-edit-status">',
      '    <option value="active"' + ((section.section_status || 'active') === 'active' ? ' selected' : '') + '>active</option>',
      '    <option value="inactive"' + ((section.section_status || '') === 'inactive' ? ' selected' : '') + '>inactive</option>',
      '    <option value="archived"' + ((section.section_status || '') === 'archived' ? ' selected' : '') + '>archived</option>',
      '  </select></label>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="section-update-save">変更を保存</button>',
      '    <button type="button" data-core-action="section-update-clear">一覧へ戻る</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function renderAicmCompanyUpdateScreen() {
    return renderShell(renderCompanyUpdateForm(aicmOrgSelectedCompany()));
  }

  function renderAicmDepartmentUpdateScreen() {
    var company = aicmOrgSelectedCompany();
    var selectedId = state.editingDepartmentId || "";
    var selected = selectedId ? aicmOrgDepartmentById(selectedId) : null;
    var rows = company ? aicmOrgDepartmentsForCompany(company.aicm_user_company_id) : [];
    return renderShell(selected ? renderDepartmentUpdateForm(selected) : renderDepartmentUpdatePicker(company, rows));
  }

  function renderAicmSectionUpdateScreen() {
    var company = aicmOrgSelectedCompany();
    var selectedId = state.editingSectionId || "";
    var selected = selectedId ? aicmOrgSectionById(selectedId) : null;
    var rows = company ? aicmOrgSectionsForCompany(company.aicm_user_company_id) : [];
    return renderShell(selected ? renderSectionUpdateForm(selected) : renderSectionUpdatePicker(company, rows));
  }

  async function saveCompanyUpdateFromForm() {
    var company = aicmOrgSelectedCompany();
    var companyId = aicmOrgValue("aicm-company-edit-id") || (company && company.aicm_user_company_id) || "";

    if (!companyId) {
      setMessage("error", "変更する企業を特定できません。");
      return;
    }

    try {
      await aicmOrgPostJson("/api/aicm/v2/company/update", {
        owner_civilization_id: aicmOrgOwnerId(),
        aicm_user_company_id: companyId,
        company_name: aicmOrgValue("aicm-company-edit-name"),
        business_domain: aicmOrgValue("aicm-company-edit-domain"),
        company_common_rules_text: aicmOrgValue("aicm-company-edit-rules"),
        president_policy_instruction_text: aicmOrgValue("aicm-company-edit-policy")
      });

      setMessage("ok", "企業情報を変更しました。");
      await aicmOrgReloadContext();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "企業変更に失敗しました。");
    }
  }

  async function saveDepartmentUpdateFromForm() {
    var departmentId = aicmOrgValue("aicm-department-edit-id");

    if (!departmentId) {
      setMessage("error", "変更する部門を特定できません。");
      return;
    }

    try {
      await aicmOrgPostJson("/api/aicm/v2/department/update", {
        owner_civilization_id: aicmOrgOwnerId(),
        aicm_user_company_department_id: departmentId,
        department_name: aicmOrgValue("aicm-department-edit-name"),
        purpose: aicmOrgValue("aicm-department-edit-purpose"),
        department_status: aicmOrgValue("aicm-department-edit-status") || "active"
      });

      setMessage("ok", "部門情報を変更しました。");
      state.editingDepartmentId = "";
      await aicmOrgReloadContext();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "部門変更に失敗しました。");
    }
  }

  async function saveSectionUpdateFromForm() {
    var sectionId = aicmOrgValue("aicm-section-edit-id");

    if (!sectionId) {
      setMessage("error", "変更する課を特定できません。");
      return;
    }

    try {
      await aicmOrgPostJson("/api/aicm/v2/section/update", {
        owner_civilization_id: aicmOrgOwnerId(),
        aicm_user_company_section_id: sectionId,
        section_name: aicmOrgValue("aicm-section-edit-name"),
        purpose: aicmOrgValue("aicm-section-edit-purpose"),
        section_status: aicmOrgValue("aicm-section-edit-status") || "active"
      });

      setMessage("ok", "課情報を変更しました。");
      state.editingSectionId = "";
      await aicmOrgReloadContext();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "課変更に失敗しました。");
    }
  }
`;
}

function makeRenderer(functionName, target) {
  const call = {
    company: "renderAicmCompanyUpdateScreen",
    department: "renderAicmDepartmentUpdateScreen",
    section: "renderAicmSectionUpdateScreen"
  }[target];

  return `
function ${functionName}() {
    return ${call}();
  }`;
}

const renderShellBeforeHash = hashText(extractFunction(src, "renderShell").text);

const companyRenderer = findRenderer(src, "company");
const departmentRenderer = findRenderer(src, "department");
const sectionRenderer = findRenderer(src, "section");

if ([companyRenderer, departmentRenderer, sectionRenderer].includes("renderShell")) {
  throw new Error("STOP: renderShell selected as renderer target");
}

src = insertBeforeFunction(src, companyRenderer, makeHelperCode());
src = replaceFunction(src, companyRenderer, makeRenderer(companyRenderer, "company"));
src = replaceFunction(src, departmentRenderer, makeRenderer(departmentRenderer, "department"));
src = replaceFunction(src, sectionRenderer, makeRenderer(sectionRenderer, "section"));

src = insertActionBeforeGo(src, "department-update-select", `if (action === "department-update-select") {
      state.editingDepartmentId = (typeof target !== "undefined" && target && target.getAttribute) ? target.getAttribute("data-department-id") : "";
      if (typeof render === "function") render();
      return;
    }`);

src = insertActionBeforeGo(src, "department-update-clear", `if (action === "department-update-clear") {
      state.editingDepartmentId = "";
      if (typeof render === "function") render();
      return;
    }`);

src = insertActionBeforeGo(src, "section-update-select", `if (action === "section-update-select") {
      state.editingSectionId = (typeof target !== "undefined" && target && target.getAttribute) ? target.getAttribute("data-section-id") : "";
      if (typeof render === "function") render();
      return;
    }`);

src = insertActionBeforeGo(src, "section-update-clear", `if (action === "section-update-clear") {
      state.editingSectionId = "";
      if (typeof render === "function") render();
      return;
    }`);

src = insertActionBeforeGo(src, "company-update-save", `if (action === "company-update-save") {
      saveCompanyUpdateFromForm();
      return;
    }`);

src = insertActionBeforeGo(src, "department-update-save", `if (action === "department-update-save") {
      saveDepartmentUpdateFromForm();
      return;
    }`);

src = insertActionBeforeGo(src, "section-update-save", `if (action === "section-update-save") {
      saveSectionUpdateFromForm();
      return;
    }`);

if (!src.includes(".aicm-org-update-row{")) {
  const cssAdditions = `
      ".aicm-org-update-row{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px;border:1px solid #e5e7eb;border-radius:16px;background:#f8fafc;margin-top:10px}",
      ".aicm-org-update-row p{margin:4px 0 0;color:#64748b}",
`;
  const markerCss = '      "@media(min-width:820px)';
  const pos = src.indexOf(markerCss);
  if (pos >= 0) src = src.slice(0, pos) + cssAdditions + src.slice(pos);
}

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);

if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

console.log(JSON.stringify({
  changed: true,
  companyRenderer,
  departmentRenderer,
  sectionRenderer,
  renderShellChanged: false,
  markerCount: count(src, marker),
  companyUpdateEndpointCount: count(src, "/api/aicm/v2/company/update"),
  departmentUpdateEndpointCount: count(src, "/api/aicm/v2/department/update"),
  sectionUpdateEndpointCount: count(src, "/api/aicm/v2/section/update"),
  companySaveActionCount: count(src, "company-update-save"),
  departmentSaveActionCount: count(src, "department-update-save"),
  sectionSaveActionCount: count(src, "section-update-save")
}));
