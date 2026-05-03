/*
 * AICompanyManager production core
 * Clean candidate.
 *
 * Goals:
 * - one state owner
 * - one API client
 * - one renderer
 * - one action dispatcher
 * - v2 DB/API only for company hierarchy
 * - no developer-only panels
 * - no broad document click/touch interception
 * - no sensitive backend error exposure
 */
(function () {
  "use strict";

  var CORE_MARK = "AICM_PRODUCTION_CORE_ANE_ANH_V1";

  if (window.AICM_PRODUCTION_CORE_ACTIVE === CORE_MARK) {
    return;
  }

  window.AICM_PRODUCTION_CORE_ACTIVE = CORE_MARK;

  var STORAGE = {
    ownerCivilizationId: "AICM_OWNER_CIVILIZATION_ID",
    selectedCompanyId: "AICM_V2_SELECTED_COMPANY_ID",
    selectedDepartmentId: "AICM_V2_SELECTED_DEPARTMENT_ID",
    selectedSectionId: "AICM_V2_SELECTED_SECTION_ID",
    contextCache: "AICM_V2_SELECTED_COMPANY_CONTEXT"
  };

  var DEFAULT_OWNER_CIVILIZATION_ID = "00000000-0000-4000-8000-000000000001";

  var API = {
    context: "/api/aicm/v2/context",
    createCompany: "/api/aicm/v2/company/create",
    createDepartment: "/api/aicm/v2/department/create",
    createSection: "/api/aicm/v2/section/create",
    createPlacement: "/api/aicm/v2/placement/create"
  };

  var root = null;

  var state = {
    booted: false,
    loading: false,
    screen: "dashboard",
    errorMessage: "",
    noticeMessage: "",
    ownerCivilizationId: readStorage(STORAGE.ownerCivilizationId) || DEFAULT_OWNER_CIVILIZATION_ID,
    selectedCompanyId: readStorage(STORAGE.selectedCompanyId) || "",
    selectedDepartmentId: readStorage(STORAGE.selectedDepartmentId) || "",
    selectedSectionId: readStorage(STORAGE.selectedSectionId) || "",
    context: {
      companies: [],
      departments: [],
      sections: [],
      placements: [],
      robotCatalog: []
    }
  };

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function writeStorage(key, value) {
    try {
      if (value === null || value === undefined || value === "") {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, String(value));
      }
    } catch (error) {
      /* storage unavailable */
    }
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function text(value) {
    return value === null || value === undefined ? "" : String(value);
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function publicErrorMessage(error) {
    var message = error && error.message ? String(error.message) : String(error || "不明なエラーです。");
    message = message.replace(new RegExp("post" + "gres(?:ql)?://" + "[^\\s\'\\\"]+", "g"), "[DB_CONNECTION_REDACTED]");
    if (message.length > 500) {
      message = message.slice(0, 500) + "...";
    }
    return message;
  }

  function endpointWithOwner() {
    return API.context + "?owner_civilization_id=" + encodeURIComponent(state.ownerCivilizationId);
  }

  function requestJson(url, body) {
    var options = body ? {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    } : {
      method: "GET"
    };

    return window.fetch(url, options)
      .then(function (response) {
        return response.json().then(function (json) {
          if (!response.ok || !json || json.result !== "ok") {
            throw new Error(json && json.error_message ? json.error_message : "API error");
          }
          return json;
        });
      });
  }

  
function normalizeContext(json) {
    json = json || {};
    return {
      companies: Array.isArray(json.companies) ? json.companies : [],
      departments: Array.isArray(json.departments) ? json.departments : [],
      sections: Array.isArray(json.sections) ? json.sections : [],
      placements: Array.isArray(json.placements) ? json.placements : [],
      taskLedger: Array.isArray(json.task_ledger) ? json.task_ledger : [],
      robotCatalog: Array.isArray(json.robot_catalog) ? json.robot_catalog : []
    };
  }

  function getCompany(companyId) {
    return state.context.companies.find(function (company) {
      return company.aicm_user_company_id === companyId;
    }) || null;
  }

  function getDepartment(departmentId) {
    return state.context.departments.find(function (department) {
      return department.aicm_user_company_department_id === departmentId;
    }) || null;
  }

  function getSection(sectionId) {
    return state.context.sections.find(function (section) {
      return section.aicm_user_company_section_id === sectionId;
    }) || null;
  }

  function companyDepartments(companyId) {
    return state.context.departments.filter(function (department) {
      return department.aicm_user_company_id === companyId;
    });
  }

  function departmentSections(departmentId) {
    return state.context.sections.filter(function (section) {
      return section.aicm_user_company_department_id === departmentId;
    });
  }

  function companyPlacements(companyId) {
    return state.context.placements.filter(function (placement) {
      return placement.aicm_user_company_id === companyId;
    });
  }

  function selectedCompany() {
    return getCompany(state.selectedCompanyId);
  }

  function selectedDepartment() {
    return getDepartment(state.selectedDepartmentId);
  }

  function selectedSection() {
    return getSection(state.selectedSectionId);
  }

  function hasCompany(companyId) {
    return !!getCompany(companyId);
  }

  function hasDepartment(departmentId) {
    return !!getDepartment(departmentId);
  }

  function setSelectedCompany(companyId) {
    if (hasCompany(companyId)) {
      state.selectedCompanyId = companyId;
      writeStorage(STORAGE.selectedCompanyId, companyId);

      var departments = companyDepartments(companyId);
      if (!hasDepartment(state.selectedDepartmentId)) {
        state.selectedDepartmentId = departments[0] ? departments[0].aicm_user_company_department_id : "";
        writeStorage(STORAGE.selectedDepartmentId, state.selectedDepartmentId);
      }
    } else {
      state.selectedCompanyId = "";
      state.selectedDepartmentId = "";
      state.selectedSectionId = "";
      writeStorage(STORAGE.selectedCompanyId, "");
      writeStorage(STORAGE.selectedDepartmentId, "");
      writeStorage(STORAGE.selectedSectionId, "");
    }
  }

  function setSelectedDepartment(departmentId) {
    if (hasDepartment(departmentId)) {
      state.selectedDepartmentId = departmentId;
      writeStorage(STORAGE.selectedDepartmentId, departmentId);

      var sections = departmentSections(departmentId);
      if (!getSection(state.selectedSectionId)) {
        state.selectedSectionId = sections[0] ? sections[0].aicm_user_company_section_id : "";
        writeStorage(STORAGE.selectedSectionId, state.selectedSectionId);
      }
    } else {
      state.selectedDepartmentId = "";
      state.selectedSectionId = "";
      writeStorage(STORAGE.selectedDepartmentId, "");
      writeStorage(STORAGE.selectedSectionId, "");
    }
  }

  function syncSelectionAfterContextLoad() {
    if (hasCompany(state.selectedCompanyId)) {
      setSelectedCompany(state.selectedCompanyId);
      return;
    }

    if (state.context.companies[0]) {
      setSelectedCompany(state.context.companies[0].aicm_user_company_id);
      return;
    }

    setSelectedCompany("");
  }

  function loadContext() {
    state.loading = true;
    state.errorMessage = "";
    render();

    return requestJson(endpointWithOwner())
      .then(function (json) {
        state.context = normalizeContext(json);
        writeStorage(STORAGE.contextCache, JSON.stringify(state.context));
        syncSelectionAfterContextLoad();
        state.loading = false;
        state.booted = true;
        render();
      })
      .catch(function (error) {
        state.loading = false;
        state.errorMessage = publicErrorMessage(error);
        render();
      });
  }

  function createCompany(payload) {
    return requestJson(API.createCompany, {
      owner_civilization_id: state.ownerCivilizationId,
      company_name: payload.companyName,
      business_domain: payload.businessDomain
    }).then(function (json) {
      if (json.company && json.company.aicm_user_company_id) {
        state.selectedCompanyId = json.company.aicm_user_company_id;
        writeStorage(STORAGE.selectedCompanyId, state.selectedCompanyId);
      }
      state.noticeMessage = "AI企業を作成しました。";
      return loadContext();
    });
  }

  function createDepartment(payload) {
    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
      throw new Error("先にv2のAI企業を作成・選択してください。");
    }

    return requestJson(API.createDepartment, {
      owner_civilization_id: state.ownerCivilizationId,
      aicm_user_company_id: state.selectedCompanyId,
      department_name: payload.departmentName,
      purpose: payload.purpose
    }).then(function (json) {
      if (json.department && json.department.aicm_user_company_department_id) {
        state.selectedDepartmentId = json.department.aicm_user_company_department_id;
        writeStorage(STORAGE.selectedDepartmentId, state.selectedDepartmentId);
      }
      state.noticeMessage = "部門を作成しました。";
      return loadContext();
    });
  }

  function createSection(payload) {
    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
      throw new Error("先にv2のAI企業を作成・選択してください。");
    }

    if (!state.selectedDepartmentId || !hasDepartment(state.selectedDepartmentId)) {
      throw new Error("先にv2の部門を作成・選択してください。");
    }

    return requestJson(API.createSection, {
      owner_civilization_id: state.ownerCivilizationId,
      aicm_user_company_id: state.selectedCompanyId,
      aicm_user_company_department_id: state.selectedDepartmentId,
      section_name: payload.sectionName,
      purpose: payload.purpose
    }).then(function (json) {
      if (json.section && json.section.aicm_user_company_section_id) {
        state.selectedSectionId = json.section.aicm_user_company_section_id;
        writeStorage(STORAGE.selectedSectionId, state.selectedSectionId);
      }
      state.noticeMessage = "課を作成しました。";
      return loadContext();
    });
  }

  function createPlacement(payload) {
    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
      throw new Error("先にv2のAI企業を作成・選択してください。");
    }

    return requestJson(API.createPlacement, {
      owner_civilization_id: state.ownerCivilizationId,
      aicm_user_company_id: state.selectedCompanyId,
      aicm_user_company_department_id: payload.departmentId || "",
      aicm_user_company_section_id: payload.sectionId || "",
      target_level_code: payload.targetLevelCode,
      target_id: payload.targetId,
      role_code: payload.roleCode,
      robot_pool_id: payload.robotPoolId,
      aiworker_model_code: payload.aiworkerModelCode,
      internal_nickname: payload.internalNickname
    }).then(function () {
      state.noticeMessage = "Worker配置を作成しました。";
      return loadContext();
    });
  }

  
function setMessage(kind, message) {
    if (kind === "ok") {
      state.noticeMessage = String(message || "");
      state.errorMessage = "";
      return;
    }

    state.errorMessage = String(message || "");
    state.noticeMessage = "";
  }

  function go(screen) {
    // AICM_TASK_LEDGER_FRESH_CONTEXT_NAV_CANONICAL_V1
    var nextScreen = String(screen || "dashboard");

    state.screen = nextScreen;
    state.errorMessage = "";

    if (nextScreen !== "task-ledger") {
      render();
      return;
    }

    render();

    if (state.__taskLedgerContextRefreshing) {
      return;
    }

    if (typeof loadContext !== "function") {
      render();
      return;
    }

    state.__taskLedgerContextRefreshing = true;

    Promise.resolve()
      .then(function () {
        return loadContext();
      })
      .catch(function (error) {
        state.errorMessage = error && error.message ? error.message : "部門別タスク台帳の最新情報取得に失敗しました。";
      })
      .then(function () {
        state.__taskLedgerContextRefreshing = false;
        state.screen = "task-ledger";
        render();
      });
  }

  function pageTitle() {
    if (state.screen === "company-new") return "AI企業新規追加";
    if (state.screen === "department-new") return "部門新規追加";
    if (state.screen === "section-new") return "課新規追加";
    if (state.screen === "placement-new") return "Worker配置";
    if (state.screen === "settings") return "AI企業設定";
    return "AI企業ダッシュボード";
  }

  
// AICM_WORKER_RUNTIME_UI_NAV_AXT_R1_V1
function renderShell(content) {
    return [
      '<div class="aicm-core" data-core-mark="' + CORE_MARK + '">',
      '  <header class="aicm-core-header">',
      '    <h1>AI企業運営アプリ</h1>',
      '  </header>',
      '  <nav class="aicm-core-tabs" aria-label="AICompanyManager navigation">',
      '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
      '    <button type="button" data-core-action="go" data-screen="task-ledger">部門別タスク台帳</button>',
      '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
      '  <button type="button" data-core-action="go" data-screen="worker-runtime-request">AI実行Workbench</button>',
      '  </nav>',
      renderMessages(),
      '  <main class="aicm-core-main">',
      content,
      '  </main>',
      '</div>'
    ].join("");
  }

  function renderMessages() {
    var parts = [];

    if (state.loading) {
      parts.push('<div class="aicm-core-message">読込中...</div>');
    }

    if (state.noticeMessage) {
      parts.push('<div class="aicm-core-message aicm-core-message-ok">' + escapeHtml(state.noticeMessage) + '</div>');
    }

    if (state.errorMessage) {
      parts.push('<div class="aicm-core-message aicm-core-message-error">' + escapeHtml(state.errorMessage) + '</div>');
    }

    return parts.join("");
  }

  function renderCompanySelect() {
    if (state.context.companies.length === 0) {
      return '<p class="aicm-core-empty">v2会社はまだありません。AI企業新規追加から作成してください。</p>';
    }

    return [
      '<label>AI企業</label>',
      '<select data-core-field="selectedCompanyId">',
      state.context.companies.map(function (company) {
        var selected = company.aicm_user_company_id === state.selectedCompanyId ? " selected" : "";
        return '<option value="' + escapeHtml(company.aicm_user_company_id) + '"' + selected + '>' + escapeHtml(company.company_name) + '</option>';
      }).join(""),
      '</select>'
    ].join("");
  }

  function renderDepartmentSelect() {
    var departments = companyDepartments(state.selectedCompanyId);

    if (departments.length === 0) {
      return '<p class="aicm-core-empty">この会社のv2部門はまだありません。</p>';
    }

    return [
      '<label>部門</label>',
      '<select data-core-field="selectedDepartmentId">',
      departments.map(function (department) {
        var selected = department.aicm_user_company_department_id === state.selectedDepartmentId ? " selected" : "";
        return '<option value="' + escapeHtml(department.aicm_user_company_department_id) + '"' + selected + '>' + escapeHtml(department.department_name) + '</option>';
      }).join(""),
      '</select>'
    ].join("");
  }

  

function renderDashboard() {
    var company = selectedCompany();
    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
    var sections = departments.reduce(function (acc, department) {
      return acc.concat(departmentSections(department.aicm_user_company_department_id));
    }, []);
    var placements = company ? companyPlacements(company.aicm_user_company_id) : [];

    return renderShell([
      '<section class="aicm-dashboard-grid aicm-dashboard-main-grid">',
      '  <div class="aicm-core-card aicm-card-primary">',
      '    <div class="aicm-card-title-row">',
      '      <div>',
      '        <p class="aicm-eyebrow">AI企業</p>',
      '        <h2>AI企業選択</h2>',
      '      </div>',
      '      <button type="button" data-core-action="reload">AI企業を表示</button>',
      '    </div>',
      renderCompanySelect(),
      company ? '<p class="aicm-selected-note">選択中: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  </div>',

      '  <div class="aicm-core-card">',
      '    <p class="aicm-eyebrow">会社概要</p>',
      '    <h2>会社概要</h2>',
      company ? renderCompanyOverview(company, departments, sections, placements) : renderNoCompanyCard(),
      '  </div>',
      '</section>',

      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門 / 課</p>',
      '  <h2>部門 / 課</h2>',
      renderTree(departments),
      '</section>'
    ].join(""));
  }

  
function metricCard(label, value, caption) {
    return [
      '<div class="aicm-metric-card">',
      '  <p>' + escapeHtml(label) + '</p>',
      '  <strong>' + escapeHtml(value) + '</strong>',
      '  <span>' + escapeHtml(caption) + '</span>',
      '</div>'
    ].join("");
  }

  

// AICM_ORG_UPDATE_UI_ARU_ARX_V1
// Company / Department / Section update UI.
// No bridge, no diagnostic layer, no legacy localStorage owner.

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
      throw new Error(json.error_message || json.message || json.error || ("API failed: " + path));
    }

    return json;
  }

  async function aicmOrgReloadContext() {
    if (typeof aicmPmlwReloadContext === "function") {
      await aicmReloadTaskLedgerContext();
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

// AICM_DB_WRITE_CONFIRMATION_REQUIRED_ARY_ASB_V1
// DB write operations must pass through a visible confirmation screen before POST.

function aicmOrgUpdateLabel(kind) {
    if (kind === "company") return "企業変更";
    if (kind === "department") return "部門変更";
    if (kind === "section") return "課変更";
    return "変更";
  }

  function aicmOrgUpdateBodyRows(body) {
    var keys = Object.keys(body || {}).filter(function (key) {
      return key !== "owner_civilization_id" &&
        key.indexOf("_id") === -1 &&
        key !== "aicm_user_company_id" &&
        key !== "aicm_user_company_department_id" &&
        key !== "aicm_user_company_section_id";
    });

    if (!keys.length) return '<p class="aicm-core-empty">表示できる変更項目がありません。</p>';

    return keys.map(function (key) {
      return [
        '<div class="aicm-confirm-row">',
        '  <strong>' + escapeHtml(key) + '</strong>',
        '  <p>' + escapeHtml(String(body[key] || "")) + '</p>',
        '</div>'
      ].join("");
    }).join("");
  }

  
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


  function aicmOrgShowUpdateConfirm(payload) {
    state.pendingOrgUpdate = payload || null;
    var root = document.getElementById("aicm-root");
    if (!root) {
      setMessage("error", "確認画面を表示できません。");
      return;
    }

    root.innerHTML = renderAicmOrgUpdateConfirmation(payload || {});
  }

  async function executeAicmOrgUpdateConfirm() {
    var payload = state.pendingOrgUpdate || null;

    if (!payload || !payload.endpoint || !payload.body) {
      setMessage("error", "確認対象がありません。");
      return;
    }

    try {
      await aicmOrgPostJson(payload.endpoint, payload.body);
            // AICM_AXC_EXECUTE_ROLE_PLACEMENT_SYNC_AFTER_MAIN_UPDATE
      await aicmAxcSyncRolePlacementsForPayload(payload);
state.pendingOrgUpdate = null;
      // AICM_PRESERVE_UNSAVED_WORKER_ADD_AXO_V1
      if (typeof aicmAxoClearDraftAfterSuccessfulSave === "function") aicmAxoClearDraftAfterSuccessfulSave();

      if (payload.kind === "department") state.editingDepartmentId = "";
      if (payload.kind === "section") state.editingSectionId = "";

      setMessage("ok", aicmOrgUpdateLabel(payload.kind) + "を保存しました。");
      await aicmOrgReloadContext();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "保存に失敗しました。");
      // AICM_CONFIRM_SAVE_ERROR_RENDER_AXM_V1
      if (typeof render === "function") render();
    }
  }

  function cancelAicmOrgUpdateConfirm() {
    var payload = state.pendingOrgUpdate || {};
    state.pendingOrgUpdate = null;

    if (payload.returnScreen) {
      state.screen = payload.returnScreen;
    }

    if (typeof render === "function") render();
  }


  

// AICM_ROLE_SETTINGS_SYNC_AXC_V1
// Role settings are saved through a dedicated placement sync endpoint after the main entity update succeeds.
// Main company/department/section fields remain separate from robot placement truth.
function aicmAxcUuidLike(value) {
  return /^[0-9a-fA-F-]{36}$/.test(String(value || "").trim());
}

function aicmAxcFindElement(ids) {
  for (var i = 0; i < ids.length; i += 1) {
    var el = document.getElementById(ids[i]);
    if (el) return el;
  }
  return null;
}

function aicmAxcCatalogRowByValue(value) {
  var text = String(value || "").trim();
  if (!text) return null;
  var rows = typeof aicmRobotCatalogSafe === "function" ? aicmRobotCatalogSafe() : [];
  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i] || {};
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
    ].map(function (item) { return String(item || "").trim(); });

    if (values.indexOf(text) >= 0) return row;
  }
  return null;
}

function aicmAxcSelectedRobotMeta(selectOrId) {
  var el = typeof selectOrId === "string" ? document.getElementById(selectOrId) : selectOrId;
  if (!el) return null;

  var selectedValue = String(el.value || "").trim();
  var opt = el.options && el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null;
  var row = aicmAxcCatalogRowByValue(selectedValue) || {};

  var robotPoolId = String(
    row.robot_pool_id ||
    row.business_robot_pool_id ||
    row.aicm_robot_pool_id ||
    row.worker_pool_id ||
    row.placement_robot_pool_id ||
    (aicmAxcUuidLike(selectedValue) ? selectedValue : "")
  ).trim();

  var modelCode = String(
    row.aiworker_model_code ||
    row.model_code ||
    row.aiworkerModelCode ||
    (opt ? opt.getAttribute("data-model") || "" : "") ||
    (!aicmAxcUuidLike(selectedValue) ? selectedValue : "")
  ).trim();

  if (!robotPoolId && !modelCode) return null;

  return {
    robot_pool_id: robotPoolId,
    aiworker_model_code: modelCode || "unknown"
  };
}

function aicmAxcInputValue(id) {
  var el = document.getElementById(id);
  return el ? String(el.value || "").trim() : "";
}

function aicmAxcBuildRolePlacement(row) {
  if (!row || !row.role_code || !row.target_level_code || !row.target_id) return null;
  if (!row.robot_pool_id && !row.aiworker_model_code) return null;
  return {
    role_code: row.role_code,
    target_level_code: row.target_level_code,
    target_id: row.target_id,
    aicm_user_company_department_id: row.aicm_user_company_department_id || "",
    aicm_user_company_section_id: row.aicm_user_company_section_id || "",
    robot_pool_id: row.robot_pool_id || "",
    aiworker_model_code: row.aiworker_model_code || "unknown",
    internal_nickname: row.internal_nickname || ""
  };
}

function aicmAxcCompanyRolePlacements(company) {
  var selected = aicmAxcSelectedRobotMeta("aicm-company-president-robot");
  if (!company || !selected) return [];
  var row = aicmAxcBuildRolePlacement({
    role_code: "President",
    target_level_code: "company",
    target_id: company.aicm_user_company_id,
    robot_pool_id: selected.robot_pool_id,
    aiworker_model_code: selected.aiworker_model_code,
    internal_nickname: aicmAxcInputValue("aicm-company-president-robot-nickname")
  });
  return row ? [row] : [];
}

function aicmAxcDepartmentRolePlacements(department) {
  var selected = aicmAxcSelectedRobotMeta("aicm-department-manager-robot");
  if (!department || !selected) return [];
  var row = aicmAxcBuildRolePlacement({
    role_code: "Manager",
    target_level_code: "department",
    target_id: department.aicm_user_company_department_id,
    aicm_user_company_department_id: department.aicm_user_company_department_id,
    robot_pool_id: selected.robot_pool_id,
    aiworker_model_code: selected.aiworker_model_code,
    internal_nickname: aicmAxcInputValue("aicm-department-manager-robot-nickname")
  });
  return row ? [row] : [];
}

function aicmAxcSectionRolePlacements(section) {
  var rows = [];
  if (!section) return rows;

  var leader = aicmAxcSelectedRobotMeta("aicm-section-leader-robot");
  var leaderRow = aicmAxcBuildRolePlacement({
    role_code: "Leader",
    target_level_code: "section",
    target_id: section.aicm_user_company_section_id,
    aicm_user_company_department_id: section.aicm_user_company_department_id,
    aicm_user_company_section_id: section.aicm_user_company_section_id,
    robot_pool_id: leader ? leader.robot_pool_id : "",
    aiworker_model_code: leader ? leader.aiworker_model_code : "",
    internal_nickname: aicmAxcInputValue("aicm-section-leader-robot-nickname")
  });
  if (leaderRow) rows.push(leaderRow);

  var index = 0;
  while (index < 30) {
    var robotEl = aicmAxcFindElement([
      "aicm-inline-worker-" + String(index) + "-robot",
      "aicm-role-worker-robot-" + String(index),
      "aicm-role-worker-section-robot-" + String(index),
      "aicm-role-worker-section-new-robot-" + String(index)
    ]);

    var nickEl = aicmAxcFindElement([
      "aicm-inline-worker-" + String(index) + "-nickname",
      "aicm-role-worker-nickname-" + String(index),
      "aicm-role-worker-section-nickname-" + String(index),
      "aicm-role-worker-section-new-nickname-" + String(index)
    ]);

    if (!robotEl && !nickEl) break;

    var worker = aicmAxcSelectedRobotMeta(robotEl);
    var workerRow = aicmAxcBuildRolePlacement({
      role_code: "Worker",
      target_level_code: "section",
      target_id: section.aicm_user_company_section_id,
      aicm_user_company_department_id: section.aicm_user_company_department_id,
      aicm_user_company_section_id: section.aicm_user_company_section_id,
      robot_pool_id: worker ? worker.robot_pool_id : "",
      aiworker_model_code: worker ? worker.aiworker_model_code : "",
      internal_nickname: nickEl ? String(nickEl.value || "").trim() : ""
    });
    if (workerRow) rows.push(workerRow);

    index += 1;
  }

  return rows;
}

async function aicmAxcSyncRolePlacementsForPayload(payload) {
  // AICM_ROLE_SYNC_REQUEST_BODY_AXH_R1_V1
  var rows = payload && Array.isArray(payload.rolePlacements) ? payload.rolePlacements : [];

  if (!rows.length) {
    return { result: "ok", skipped: true };
  }

  var body = payload.body || {};
  var companyId = body.aicm_user_company_id || "";

  if (!companyId && state && state.selectedCompanyId) {
    companyId = state.selectedCompanyId;
  }

  return requestJson("/api/aicm/v2/placement/sync-role-settings", {
    // AICM_ROLE_SYNC_OWNER_RESOLVER_AXK_V1
    owner_civilization_id: (
      typeof aicmAvdOwnerId === "function"
        ? aicmAvdOwnerId()
        : ((typeof state !== "undefined" && state && state.ownerCivilizationId) ? state.ownerCivilizationId : "")
    ),
    aicm_user_company_id: companyId,
    role_placements: rows
  });
}


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
      // AICM_ROLEPLACEMENT_SCOPE_FIX_AXG_V1
      rolePlacements: aicmAxcCompanyRolePlacements({
        aicm_user_company_id: body.aicm_user_company_id
      }),
      summary_rows: rows
    });
  }


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
      // AICM_ROLEPLACEMENT_SCOPE_FIX_AXG_V1
      rolePlacements: aicmAxcDepartmentRolePlacements({
        aicm_user_company_department_id: body.aicm_user_company_department_id
      }),
      summary_rows: rows
    });
  }


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
      // AICM_ROLEPLACEMENT_SCOPE_FIX_AXG_V1
      rolePlacements: aicmAxcSectionRolePlacements({
        aicm_user_company_section_id: body.aicm_user_company_section_id,
        aicm_user_company_department_id: body.aicm_user_company_department_id || (
          typeof aicmOrgSectionById === "function" && body.aicm_user_company_section_id
            ? ((aicmOrgSectionById(body.aicm_user_company_section_id) || {}).aicm_user_company_department_id || "")
            : ""
        )
      }),
      summary_rows: rows
    });
  }



  


// AICM_DASHBOARD_COMPANY_OVERVIEW_ASO_ASR_V1
// Dashboard company overview must return only a card fragment.
// Company update uses this dedicated screen renderer.


// AICM_COMPANY_EDIT_NAV_STALE_MESSAGE_ASS_ASV_V1
// Navigation route safety for edit screens.
// DB write confirmation remains required before POST.

function aicmClearTransientMessage() {
    if (!state) return;

    state.message = "";
    state.messageText = "";
    state.message_type = "";
    state.messageType = "";
    state.statusMessage = "";
    state.toastMessage = "";
    state.errorMessage = "";
    state.successMessage = "";
  }


  
// AICM_EDIT_SCREEN_FALLBACK_ATA_ATD_V1
// Edit screens must not depend only on transient selected state.












  

// AICM_EXACT_EDIT_ROUTE_FALLBACK_TARGET_ATE_ATH_V1
// Exact edit fallback helpers. These helpers are read-only and do not write DB.














  

// AICM_DEDUPE_EDIT_FALLBACK_HELPERS_ATI_ATL_V1
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


  

// AICM_EDIT_ROLE_SETTING_CARDS_ATM_ATP_V1
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




  

// AICM_INLINE_ROLE_SETTINGS_ATQ_ATT_V1
// Inline role settings are displayed on add/edit screens.
// This phase is UI-only. DB write remains confirmation-gated in later phases.
















// AICM_ROBOT_CATALOG_MULTI_WORKER_ATU_ATX_V1
// Robot catalog option mapping is intentionally broad because Business robot selector views may evolve.
// Worker settings support multiple rows. Actual DB write remains confirmation-gated in later phases.

function aicmRobotCatalogSafe() {
    var candidates = [];
    var ctx = typeof aicmCtxSafe === "function" ? aicmCtxSafe() : {};

    if (ctx && typeof ctx === "object") {
      candidates.push(ctx.robot_catalog);
      candidates.push(ctx.robotCatalog);
      candidates.push(ctx.robots);
      candidates.push(ctx.robot_pool);
      candidates.push(ctx.robot_pool_items);
      candidates.push(ctx.available_robots);
      candidates.push(ctx.availableRobots);
      candidates.push(ctx.worker_robot_catalog);
      candidates.push(ctx.aiworker_catalog);
    }

    if (state && typeof state === "object") {
      candidates.push(state.robot_catalog);
      candidates.push(state.robotCatalog);
      candidates.push(state.robots);
      candidates.push(state.available_robots);
      candidates.push(state.context && state.context.robot_catalog);
      candidates.push(state.ctx && state.ctx.robot_catalog);
      candidates.push(state.data && state.data.robot_catalog);
    }

    for (var i = 0; i < candidates.length; i++) {
      if (Array.isArray(candidates[i]) && candidates[i].length > 0) return candidates[i];
    }

    return [];
  }

function aicmRobotValue(row) {
    if (!row || typeof row !== "object") return "";

    return String(
      row.robot_pool_id ||
      row.business_robot_pool_id ||
      row.aicm_robot_pool_id ||
      row.worker_pool_id ||
      row.placement_robot_pool_id ||
      row.aiworker_model_id ||
      row.aiworker_model_code ||
      row.model_id ||
      row.model_code ||
      row.robot_id ||
      row.id ||
      ""
    );
  }


function aicmRobotRoleText(row) {
    if (!row || typeof row !== "object") return "";

    var recommended = row.recommended_role_codes;
    var recommendedText = "";

    if (Array.isArray(recommended)) {
      recommendedText = recommended.join(" ");
    } else if (recommended && typeof recommended === "object") {
      try {
        recommendedText = JSON.stringify(recommended);
      } catch (_) {
        recommendedText = "";
      }
    } else {
      recommendedText = String(recommended || "");
    }

    return [
      recommendedText,
      row.role_code,
      row.placement_role_code,
      row.assignment_role_code,
      row.eligible_role_code,
      row.available_role_code,
      row.assignment_mode_code,
      row.role_name,
      row.role_label,
      row.position_code,
      row.position_label,
      row.role_display_name,
      row.selector_label,
      row.display_name,
      row.aiworker_model_code,
      row.aiworker_model_name,
      row.model_line_code,
      row.model_code,
      row.model_name,
      row.series_code,
      row.series_name,
      row.aiworker_series_code,
      row.manufacturer_code,
      row.robot_type_code,
      row.robot_type_label
    ].filter(Boolean).join(" ").toLowerCase();
  }

function aicmRobotMatchesInlineRole(row, roleCode) {
    // AICM_ROBOT_FILTER_RECOMMENDED_ROLE_CODES_AXP_V1
    // Canonical source:
    // business.vw_ai_company_manager_system_robot_selector_options.recommended_role_codes
    //
    // Do not infer candidates from display_name / aiworker_model_code text.
    // Example:
    // - HD-R5P President must not appear in Manager unless Manager is explicitly recommended.
    // - BYD2-003 Leader3 must not appear in Worker unless Worker is explicitly recommended.
    // - HD-R2G General must not appear in Leader just because TacticalLeader contains "Leader".

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function canonicalRole(value) {
      var text = normalize(value);

      if (text === "president" || text === "社長" || text === "プレジデント") return "president";
      if (text === "manager" || text === "部長" || text === "マネージャ" || text === "マネージャー") return "manager";
      if (text === "leader" || text === "課長" || text === "リーダ" || text === "リーダー") return "leader";
      if (text === "worker" || text === "従業員" || text === "ワーカー") return "worker";

      return text;
    }

    function addRole(list, value) {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach(function (item) {
          addRole(list, item);
        });
        return;
      }

      var raw = String(value || "").trim();
      if (!raw) return;

      raw
        .replace(/^\{/, "")
        .replace(/\}$/, "")
        .split(/[;,|]/)
        .forEach(function (part) {
          var canonical = canonicalRole(part);
          if (canonical) list.push(canonical);
        });
    }

    var roles = [];

    addRole(roles, row && row.recommended_role_codes);
    addRole(roles, row && row.recommendedRoleCodes);

    // Optional compatibility with direct robot_pool columns when a future context includes them.
    addRole(roles, row && row.placement_role_code_1);
    addRole(roles, row && row.placement_role_code_2);
    addRole(roles, row && row.placement_role_code_3);

    // Optional compatibility with singular explicit role fields.
    // These are accepted only as exact role fields, not display/model text.
    addRole(roles, row && row.eligible_role_code);
    addRole(roles, row && row.available_role_code);

    var wanted = canonicalRole(roleCode);

    if (!wanted || !roles.length) {
      return false;
    }

    return roles.indexOf(wanted) >= 0;
  }



// AICM_ROBOT_OPTION_AVAILABILITY_LABEL_AXQ_V1
// Robot option availability display helpers.
// Canonical data comes from business.vw_ai_company_manager_system_robot_selector_options.
// This is display/selectability only. It does not write DB.
function aicmAxqText(value) {
    return String(value || "").trim();
  }

function aicmAxqBool(value) {
    if (value === true) return true;
    if (value === false) return false;

    var text = String(value || "").trim().toLowerCase();
    return text === "true" || text === "t" || text === "1" || text === "yes" || text === "y";
  }

function aicmAxqNumberOrNull(value) {
    if (value === undefined || value === null || value === "") return null;
    var n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

function aicmAxqUnlimited(row) {
    // AICM_ROBOT_OPTION_UNLIMITED_FORCE_AXQ_R1_V1
    // AICompanyManager robot placement is unlimited allocation by app design.
    // Do not treat available_quantity=0 as unavailable in this app.
    // Candidate eligibility is controlled by recommended_role_codes, not inventory consumption.
    return true;
  }

function aicmAxqAvailableQuantity(row) {
    row = row || {};

    var candidates = [
      row.usable_quantity,
      row.available_quantity,
      row.remaining_quantity,
      row.contract_available_quantity,
      row.available_count,
      row.quantity_available
    ];

    for (var i = 0; i < candidates.length; i += 1) {
      var n = aicmAxqNumberOrNull(candidates[i]);
      if (n !== null) return n;
    }

    return null;
  }

function aicmAxqAvailabilityText(row) {
    // AICM_ROBOT_OPTION_UNLIMITED_FORCE_AXQ_R1_V1
    return "利用可能:無制限";
  }

function aicmAxqSelectable(row) {
    // AICM_ROBOT_OPTION_UNLIMITED_FORCE_AXQ_R1_V1
    return true;
  }

function aicmAxqBaseRobotLabel(row) {
    row = row || {};

    var name = aicmAxqText(
      row.display_name ||
      row.aiworker_model_name ||
      row.robot_name ||
      row.robot_pool_label ||
      row.aiworker_model_code ||
      row.model_code ||
      row.robot_pool_id ||
      row.robot_id
    );

    var code = aicmAxqText(row.aiworker_model_code || row.model_code);

    if (name && code && name.indexOf(code) < 0) {
      return name + " / " + code;
    }

    return name || code || "ロボット";
  }

function aicmRobotOptionLabel(row) {
    // AICM_ROBOT_OPTION_AVAILABILITY_LABEL_AXQ_V1
    return aicmAxqBaseRobotLabel(row) + " / " + aicmAxqAvailabilityText(row);
  }


// AICM_EXPAND_ROBOT_CANDIDATES_ATY_AUB_V1

// AICM_RECOMMENDED_ONLY_ROBOT_COMBOS_AUK_AUN_V1
function aicmInlineRobotRows(roleCode) {
    var all = aicmRobotCatalogSafe().filter(function (row) {
      return aicmRobotValue(row);
    });

    var recommended = all.filter(function (row) {
      return aicmRobotMatchesInlineRole(row, roleCode);
    });

    var seen = Object.create(null);
    var rows = [];

    recommended.forEach(function (row) {
      var key = aicmRobotValue(row);
      if (!key || seen[key]) return;
      seen[key] = true;
      rows.push(row);
    });

    return rows;
  }




// AICM_ROLE_PLACEMENT_READBACK_AXN_V1
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

function aicmInlineRobotOptions(roleCode, selectedValue, selectedLabel) {
    // AICM_ROBOT_OPTION_AVAILABILITY_LABEL_AXQ_V1
    var rows = aicmInlineRobotRows(roleCode);
    var selected = typeof aicmAxnText === "function" ? aicmAxnText(selectedValue) : String(selectedValue || "").trim();
    var selectedFound = false;

    if (!rows.length && !selected) {
      return '<option value="">未設定</option><option value="" disabled>候補がありません</option>';
    }

    var options = ['<option value="">未設定</option>'];

    rows.forEach(function (row) {
      var value = typeof aicmRobotValue === "function" ? aicmRobotValue(row) : "";
      var isSelected = selected && typeof aicmAxnOptionSelected === "function" && aicmAxnOptionSelected(row, selected);
      var selectable = aicmAxqSelectable(row);

      if (isSelected) selectedFound = true;

      options.push(
        '<option value="' + escapeHtml(value) + '"' +
        (isSelected ? ' selected' : '') +
        (!selectable && !isSelected ? ' disabled' : '') +
        '>' + escapeHtml(aicmRobotOptionLabel(row)) + '</option>'
      );
    });

    if (selected && !selectedFound) {
      options.push('<option value="' + escapeHtml(selected) + '" selected>' + escapeHtml(selectedLabel || selected) + '</option>');
    }

    return options.join("");
  }

function aicmWorkerSlotCount() {
    if (!state) return 3;

    var n = Number(state.inlineWorkerSlotCount || 3);
    if (!Number.isFinite(n) || n < 3) n = 3;
    if (n > 20) n = 20;
    state.inlineWorkerSlotCount = n;

    return n;
  }


// AICM_PRESERVE_UNSAVED_WORKER_ADD_AXO_V1
// Preserve unsaved edit-form values when adding worker rows.
// This is UI draft only. It does not write DB and does not change API payload canon.
function aicmAxoEnsureDraft() {
    if (!state.aicmAxoFormDraft) {
      state.aicmAxoFormDraft = {
        fields: {},
        workers: []
      };
    }
    if (!state.aicmAxoFormDraft.fields) state.aicmAxoFormDraft.fields = {};
    if (!Array.isArray(state.aicmAxoFormDraft.workers)) state.aicmAxoFormDraft.workers = [];
    return state.aicmAxoFormDraft;
  }

function aicmAxoFieldValue(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "") : "";
  }

function aicmAxoCaptureField(id) {
    var el = document.getElementById(id);
    if (!el) return;
    aicmAxoEnsureDraft().fields[id] = String(el.value || "");
  }

function aicmAxoDraftValue(id, fallback) {
    var draft = state.aicmAxoFormDraft;
    if (draft && draft.fields && Object.prototype.hasOwnProperty.call(draft.fields, id)) {
      return String(draft.fields[id] || "");
    }
    return String(fallback || "");
  }

function aicmAxoCaptureCurrentEditFormDraft() {
    var draft = aicmAxoEnsureDraft();

    [
      "aicm-company-edit-id",
      "aicm-company-edit-name",
      "aicm-company-edit-domain",
      "aicm-company-edit-rules",
      "aicm-company-edit-policy",
      "aicm-company-edit-status",
      "aicm-company-president-robot",
      "aicm-company-president-robot-nickname",

      "aicm-department-edit-id",
      "aicm-department-edit-company-id",
      "aicm-department-edit-name",
      "aicm-department-edit-purpose",
      "aicm-department-edit-status",
      "aicm-department-manager-robot",
      "aicm-department-manager-robot-nickname",

      "aicm-section-edit-id",
      "aicm-section-edit-company-id",
      "aicm-section-edit-department-id",
      "aicm-section-edit-name",
      "aicm-section-edit-purpose",
      "aicm-section-edit-status",
      "aicm-section-leader-robot",
      "aicm-section-leader-robot-nickname"
    ].forEach(aicmAxoCaptureField);

    var workers = [];
    var index = 0;

    while (index < 60) {
      var robotIds = [
        "aicm-inline-worker-" + String(index) + "-robot",
        "aicm-role-worker-robot-" + String(index),
        "aicm-role-worker-section-robot-" + String(index),
        "aicm-role-worker-section-new-robot-" + String(index)
      ];

      var nicknameIds = [
        "aicm-inline-worker-" + String(index) + "-nickname",
        "aicm-role-worker-nickname-" + String(index),
        "aicm-role-worker-section-nickname-" + String(index),
        "aicm-role-worker-section-new-nickname-" + String(index)
      ];

      var robotEl = null;
      var nicknameEl = null;

      for (var r = 0; r < robotIds.length; r += 1) {
        robotEl = document.getElementById(robotIds[r]);
        if (robotEl) break;
      }

      for (var n = 0; n < nicknameIds.length; n += 1) {
        nicknameEl = document.getElementById(nicknameIds[n]);
        if (nicknameEl) break;
      }

      if (!robotEl && !nicknameEl) break;

      workers.push({
        robot_pool_id: robotEl ? String(robotEl.value || "") : "",
        internal_nickname: nicknameEl ? String(nicknameEl.value || "") : ""
      });

      index += 1;
    }

    draft.workers = workers;
    return draft;
  }

function aicmAxoClearDraftAfterSuccessfulSave() {
    state.aicmAxoFormDraft = null;
  }

function renderAicmWorkerInlineRows(fieldPrefix) {
    // AICM_PRESERVE_UNSAVED_WORKER_ADD_AXO_V1
    var savedRows = typeof aicmAxnCurrentPlacements === "function" ? aicmAxnCurrentPlacements("worker") : [];
    var draft = state.aicmAxoFormDraft || {};
    var draftWorkers = Array.isArray(draft.workers) ? draft.workers : [];

    var baseCount = typeof aicmWorkerSlotCount === "function" ? aicmWorkerSlotCount() : 3;
    var count = Math.max(baseCount, savedRows.length || 0, draftWorkers.length || 0, 1);
    var safePrefix = fieldPrefix || "worker";
    var html = [];

    for (var i = 0; i < count; i += 1) {
      var existing = savedRows[i] || null;
      var draftRow = draftWorkers[i] || null;

      var selectedValue = draftRow
        ? String(draftRow.robot_pool_id || "")
        : (typeof aicmAxnPlacementValue === "function" ? aicmAxnPlacementValue(existing) : "");

      var selectedLabel = typeof aicmAxnPlacementLabel === "function" ? aicmAxnPlacementLabel(existing) : "";

      var nickname = draftRow
        ? String(draftRow.internal_nickname || "")
        : (typeof aicmAxnPlacementNickname === "function" ? aicmAxnPlacementNickname(existing) : "");

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
  }

function renderAicmInlineRoleSetting(roleCode, title, subtitle, fieldPrefix) {
    var safePrefix = fieldPrefix || roleCode;

    if (roleCode === "worker") {
      return [
        '<section class="aicm-core-card aicm-inline-role-setting-card" data-inline-role="' + escapeHtml(roleCode) + '">',
        '  <p class="aicm-eyebrow">役職設定</p>',
        '  <h2>' + escapeHtml(title) + '</h2>',
        subtitle ? '  <p class="aicm-selected-note">' + escapeHtml(subtitle) + '</p>' : '',
        renderAicmWorkerInlineRows(safePrefix),
        '  <button type="button" data-core-action="inline-worker-slot-add">従業員行を追加</button>',
        '  <p class="aicm-core-empty">従業員は複数設定できます。保存時は確認画面を通して登録します。</p>',
        '</section>'
      ].join("");
    }

    return [
      '<section class="aicm-core-card aicm-inline-role-setting-card" data-inline-role="' + escapeHtml(roleCode) + '">',
      '  <p class="aicm-eyebrow">役職設定</p>',
      '  <h2>' + escapeHtml(title) + '</h2>',
      subtitle ? '  <p class="aicm-selected-note">' + escapeHtml(subtitle) + '</p>' : '',
      '  <label>' + escapeHtml(title) + 'ロボット<select id="aicm-role-' + escapeHtml(safePrefix) + '-robot" data-inline-role-code="' + escapeHtml(roleCode) + '">',
      aicmInlineRobotOptions(roleCode),
      '  </select></label>',
      '  <label>社内通称<input id="aicm-role-' + escapeHtml(safePrefix) + '-nickname" type="text" placeholder="例: ウルフ@' + escapeHtml(title.replace("設定", "")) + '"></label>',
      '  <p class="aicm-core-empty">保存時は確認画面を通して登録します。</p>',
      '</section>'
    ].join("");
  }

function renderAicmRoleSettingCard(roleCode, title, subtitle, scope) {
    var prefix = roleCode;

    if (scope && scope.sectionId) prefix = roleCode + "-section";
    else if (scope && scope.departmentId) prefix = roleCode + "-department";
    else if (scope && scope.companyId) prefix = roleCode + "-company";

    return renderAicmInlineRoleSetting(roleCode, title, subtitle, prefix);
  }


  function aicmInjectInlineRoleSettingsForAddScreens(html) {
    if (!state || !state.screen || !html) return html;

    var extra = "";

    if (state.screen === "company-new") {
      extra = renderAicmInlineRoleSetting("president", "社長設定", "AI企業全体の方針を受けるPresidentを設定します。", "president-company-new");
    }

    if (state.screen === "department-new") {
      extra = renderAicmInlineRoleSetting("manager", "部長設定", "この部門を統括するManagerを設定します。", "manager-department-new");
    }

    if (state.screen === "section-new") {
      extra = [
        renderAicmInlineRoleSetting("leader", "課長設定", "この課を統括するLeaderを設定します。", "leader-section-new"),
        renderAicmInlineRoleSetting("worker", "従業員設定", "この課に配置するWorkerを設定します。", "worker-section-new")
      ].join("");
    }

    if (!extra) return html;
    if (html.indexOf("aicm-inline-role-setting-card") >= 0) return html;

    if (html.indexOf("</main></div>") >= 0) {
      return html.replace("</main></div>", extra + "</main></div>");
    }

    if (html.indexOf("</main>") >= 0) {
      return html.replace("</main>", extra + "</main>");
    }

    return html + extra;
  }


  
// AICM_EXPLICIT_EDIT_DB_CONNECT_AVA_AVD_REDO_V1
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
    // AICM_PRESERVE_UNSAVED_WORKER_ADD_AXO_V1
    var role = roleCode || {};
    var existing = typeof aicmAxnFirstPlacement === "function" ? aicmAxnFirstPlacement(role.code) : null;

    var selectedValue = typeof aicmAxnPlacementValue === "function" ? aicmAxnPlacementValue(existing) : "";
    var selectedLabel = typeof aicmAxnPlacementLabel === "function" ? aicmAxnPlacementLabel(existing) : "";
    var nickname = typeof aicmAxnPlacementNickname === "function" ? aicmAxnPlacementNickname(existing) : "";

    selectedValue = aicmAxoDraftValue(id, selectedValue);
    nickname = aicmAxoDraftValue(id + "-nickname", nickname);

    return [
      '<label>' + escapeHtml(role.label) + 'ロボット',
      '<select id="' + escapeHtml(id) + '" data-inline-role-code="' + escapeHtml(role.code) + '">',
      aicmInlineRobotOptions(role.code, selectedValue, selectedLabel),
      '</select></label>',
      '<label>' + escapeHtml(role.label) + '社内通称',
      '<input id="' + escapeHtml(id + "-nickname") + '" type="text" value="' + escapeHtml(nickname) + '" placeholder="例: ' + escapeHtml(role.placeholder) + '">',
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
    // AICM_ROLE_CONFIRM_DISPLAY_LABEL_AXH_R1_V1
    var rows = [];

    function textById(id) {
      if (typeof aicmAvdTextById === "function") return aicmAvdTextById(id);
      var el = document.getElementById(id);
      return el ? String(el.value || "").trim() : "";
    }

    function selectedLabelFromElement(el) {
      if (!el) return "";

      if (el.tagName && String(el.tagName).toLowerCase() === "select") {
        var opt = el.options && el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null;
        var label = opt ? String(opt.textContent || opt.innerText || "").trim() : "";

        if (label && label !== "未設定" && label !== "候補がありません") {
          return label;
        }

        return "";
      }

      return String(el.value || "").trim();
    }

    function selectedLabelById(id) {
      return selectedLabelFromElement(document.getElementById(id));
    }

    function findByIds(ids) {
      for (var i = 0; i < ids.length; i += 1) {
        var el = document.getElementById(ids[i]);
        if (el) return el;
      }
      return null;
    }

    function push(label, robotId, nicknameId) {
      var robot = selectedLabelById(robotId);
      var nickname = textById(nicknameId);

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

      while (index < 30) {
        var robotEl = findByIds([
          "aicm-inline-worker-" + String(index) + "-robot",
          "aicm-role-worker-robot-" + String(index),
          "aicm-role-worker-section-robot-" + String(index),
          "aicm-role-worker-section-new-robot-" + String(index)
        ]);

        var nickEl = findByIds([
          "aicm-inline-worker-" + String(index) + "-nickname",
          "aicm-role-worker-nickname-" + String(index),
          "aicm-role-worker-section-nickname-" + String(index),
          "aicm-role-worker-section-new-nickname-" + String(index)
        ]);

        if (!robotEl && !nickEl) break;

        var robotLabel = selectedLabelFromElement(robotEl);
        var nickname = nickEl ? String(nickEl.value || "").trim() : "";

        if (robotLabel || nickname) {
          workerRows.push((robotLabel || "未設定") + (nickname ? " / " + nickname : ""));
        }

        index += 1;
      }

      rows.push(["従業員設定", workerRows.length ? workerRows.join("\n") : "未設定"]);
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


  function renderCompanyOverviewBaseAxuMaintR3() {
    var company = null;

    if (typeof selectedCompany === "function") {
      company = selectedCompany();
    }

    if (!company && typeof aicmOrgSelectedCompany === "function") {
      company = aicmOrgSelectedCompany();
    }

    if (!company) {
      return [
        '<div class="aicm-core-card">',
        '  <p class="aicm-eyebrow">会社概要</p>',
        '  <h2>会社概要</h2>',
        '  <div class="aicm-empty-state">',
        '    <strong>AI企業が未選択です</strong>',
        '    <p>AI企業を選択すると、部門・課・Worker配置の概要を確認できます。</p>',
        '    <div class="aicm-dashboard-action-row">',
        '      <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("");
    }

    var companyId = company.aicm_user_company_id || "";
    var departments = typeof aicmOrgDepartmentsForCompany === "function" ? aicmOrgDepartmentsForCompany(companyId) : [];
    var sections = typeof aicmOrgSectionsForCompany === "function" ? aicmOrgSectionsForCompany(companyId) : [];
    var ctx = typeof aicmOrgCtx === "function" ? aicmOrgCtx() : (state.context || state || {});
    var placements = Array.isArray(ctx.placements) ? ctx.placements.filter(function (row) {
      return row.aicm_user_company_id === companyId;
    }) : [];

    return [
      '<div class="aicm-core-card">',
      '  <p class="aicm-eyebrow">会社概要</p>',
      '  <h2>' + escapeHtml(company.company_name || "AI企業") + '</h2>',
      company.business_domain ? '  <p class="aicm-selected-note">' + escapeHtml(company.business_domain) + '</p>' : '',
      '  <div class="aicm-company-overview-stats">',
      '    <div class="aicm-company-overview-stat"><span>部門</span><strong>' + String(departments.length) + '件</strong></div>',
      '    <div class="aicm-company-overview-stat"><span>課</span><strong>' + String(sections.length) + '件</strong></div>',
      '    <div class="aicm-company-overview-stat"><span>Worker配置</span><strong>' + String(placements.length) + '件</strong></div>',
      '  </div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="company-edit-open">AI企業変更</button>',
      '    <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
      '  </div>',
      '</div>'
    ].join("");
  }

function renderCompanyOverview() {
    return renderCompanyOverviewBaseAxuMaintR3() + renderAicmBusinessStartDashboardCard();
  }

  function renderNoCompanyCard() {
    return [
      '<div class="aicm-empty-state">',
      '  <strong>AI企業が未選択です</strong>',
      '  <p>まずAI企業を作成すると、部門・課・Worker配置を登録できます。</p>',
      '  <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加へ</button>',
      '</div>'
    ].join("");
  }

  function renderQuickActions(company, departments) {
    if (!company) {
      return [
        '<div class="aicm-action-list">',
        '  <button type="button" data-core-action="go" data-screen="company-new">AI企業を作成</button>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-action-list">',
      '  <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
      '  <button type="button" data-core-action="go" data-screen="department-new">部門追加</button>',
      departments.length > 0 ? '  <button type="button" data-core-action="go" data-screen="section-new">課追加</button>' : '  <button type="button" data-core-action="go" data-screen="department-new">先に部門を追加</button>',
      '  <button type="button" data-core-action="go" data-screen="placement-new">Worker配置</button>',
      '</div>',
      '<p class="aicm-core-empty">編集・削除は次工程で追加します。</p>'
    ].join("");
  }


  


function renderTree(departments) {
    if (departments.length === 0) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>部門がまだありません</strong>',
        '  <p>選択中のAI企業に部門を追加すると、ここに階層表示されます。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
        '  </div>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-tree-toolbar">',
      '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
      '  <button type="button" data-core-action="go" data-screen="section-new">課新規追加</button>',
      '</div>',
      '<div class="aicm-org-tree">',
      departments.map(function (department) {
        var sections = departmentSections(department.aicm_user_company_department_id);
        return [
          '<article class="aicm-org-node">',
          '  <div class="aicm-org-node-head">',
          '    <span class="aicm-node-badge">部門</span>',
          '    <strong>' + escapeHtml(department.department_name) + '</strong>',
          '    <button type="button" data-core-action="go" data-screen="department-edit">変更</button>',
          '  </div>',
          department.purpose ? '<p>' + escapeHtml(department.purpose) + '</p>' : '<p class="aicm-core-empty">目的未設定</p>',
          sections.length === 0 ? '<div class="aicm-section-empty">課なし</div>' : [
            '  <ul class="aicm-section-list">',
            sections.map(function (section) {
              return [
                '<li>',
                '  <span class="aicm-node-badge aicm-node-badge-section">課</span>',
                '  <strong>' + escapeHtml(section.section_name) + '</strong>',
                '  <button type="button" data-core-action="go" data-screen="section-edit">変更</button>',
                section.purpose ? '<small>' + escapeHtml(section.purpose) + '</small>' : '',
                '</li>'
              ].join("");
            }).join(""),
            '  </ul>'
          ].join(""),
          '</article>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }

  function renderCompanyNew() {
    return renderShell([
      '<form data-core-form="company-create" class="aicm-core-card">',
      '  <label>会社名</label>',
      '  <input name="companyName" autocomplete="off" required>',
      '  <label>事業領域</label>',
      '  <textarea name="businessDomain" rows="3"></textarea>',
      '  <button type="submit">AI企業を作成</button>',
      '</form>'
    ].join(""));
  }

  function renderDepartmentNew() {
    return renderShell([
      '<section class="aicm-core-card">',
      renderCompanySelect(),
      '</section>',
      '<form data-core-form="department-create" class="aicm-core-card">',
      '  <label>部門名</label>',
      '  <input name="departmentName" autocomplete="off" required>',
      '  <label>目的</label>',
      '  <textarea name="purpose" rows="3"></textarea>',
      '  <button type="submit">部門を作成</button>',
      '</form>'
    ].join(""));
  }

  function renderSectionNew() {
    return renderShell([
      '<section class="aicm-core-card">',
      renderCompanySelect(),
      renderDepartmentSelect(),
      '</section>',
      '<form data-core-form="section-create" class="aicm-core-card">',
      '  <label>課名</label>',
      '  <input name="sectionName" autocomplete="off" required>',
      '  <label>目的</label>',
      '  <textarea name="purpose" rows="3"></textarea>',
      '  <button type="submit">課を作成</button>',
      '</form>'
    ].join(""));
  }

  function renderPlacementNew() {
    var company = selectedCompany();
    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
    var selectedDept = selectedDepartment();
    var sections = selectedDept ? departmentSections(selectedDept.aicm_user_company_department_id) : [];
    var robots = state.context.robotCatalog;

    return renderShell([
      '<form data-core-form="placement-create" class="aicm-core-card">',
      renderCompanySelect(),
      renderDepartmentSelect(),
      '  <label>配置先</label>',
      '  <select name="targetLevelCode">',
      '    <option value="company">会社 / President</option>',
      '    <option value="department">部門 / Manager</option>',
      '    <option value="section">課 / Leader / Worker</option>',
      '  </select>',
      '  <label>Role</label>',
      '  <select name="roleCode">',
      '    <option value="President">President</option>',
      '    <option value="Manager">Manager</option>',
      '    <option value="Leader">Leader</option>',
      '    <option value="Worker">Worker</option>',
      '  </select>',
      '  <label>課</label>',
      '  <select name="sectionId">',
      '    <option value="">未選択</option>',
      sections.map(function (section) {
        return '<option value="' + escapeHtml(section.aicm_user_company_section_id) + '">' + escapeHtml(section.section_name) + '</option>';
      }).join(""),
      '  </select>',
      '  <label>Robot</label>',
      '  <select name="robotPoolId">',
      robots.map(function (robot) {
        return '<option value="' + escapeHtml(robot.robot_pool_id || "") + '" data-model="' + escapeHtml(robot.aiworker_model_code || "") + '">' + escapeHtml(robot.selector_label || robot.display_name || robot.aiworker_model_code) + '</option>';
      }).join(""),
      '  </select>',
      '  <label>社内通称</label>',
      '  <input name="internalNickname" autocomplete="off">',
      '  <button type="submit">Worker配置を作成</button>',
      '</form>',
      departments.length === 0 ? '<p class="aicm-core-empty">先に部門を作成してください。</p>' : ''
    ].join(""));
  }

  function renderSettings() {
    var company = selectedCompany();

    return renderShell([
      '<section class="aicm-core-card">',
      renderCompanySelect(),
      company ? [
        '<p>会社名: ' + escapeHtml(company.company_name) + '</p>',
        '<p>事業領域: ' + escapeHtml(company.business_domain || "") + '</p>',
        '<p class="aicm-core-empty">編集/削除は未設定。作成系の確認後に実装します。</p>'
      ].join("") : '<p class="aicm-core-empty">会社なし</p>',
      '</section>'
    ].join(""));
  }

  

function taskLedgerRows(companyId) {
    var rows = [];

    if (state.context && Array.isArray(state.context.taskLedger)) {
      rows = state.context.taskLedger;
    } else if (state.context && Array.isArray(state.context.task_ledger)) {
      rows = state.context.task_ledger;
    }

    if (!companyId) return rows;

    return rows.filter(function (row) {
      return String(row.aicm_user_company_id || "") === String(companyId || "");
    });
  }

  function sectionsForDepartment(departmentId) {
    return state.context.sections.filter(function (section) {
      return String(section.aicm_user_company_department_id || "") === String(departmentId || "");
    });
  }

  function firstDepartmentId(company) {
    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
    return departments.length ? departments[0].aicm_user_company_department_id : "";
  }

  function renderTaskLedgerRows(rows) {
    if (!rows.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>台帳行がまだありません</strong>',
        '  <p>部門を選び、成果物名と作業名を入力して追加してください。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-ledger-list">',
      rows.map(function (row) {
        return [
          '<article class="aicm-ledger-row">',
          '  <div class="aicm-ledger-row-head">',
          '    <span class="aicm-node-badge">' + escapeHtml(row.priority_code || "normal") + '</span>',
          '    <strong>' + escapeHtml(row.deliverable_name || "") + '</strong>',
          '    <em>' + escapeHtml(row.task_status_code || "todo") + '</em>',
          '  </div>',
          '  <p>' + escapeHtml(row.task_name || "") + '</p>',
          '  <dl class="aicm-ledger-meta">',
          '    <div><dt>部門</dt><dd>' + escapeHtml(row.department_name || "-") + '</dd></div>',
          '    <div><dt>課</dt><dd>' + escapeHtml(row.section_name || "-") + '</dd></div>',
          '    <div><dt>作業種別</dt><dd>' + escapeHtml(row.work_type_code || "-") + '</dd></div>',
          '    <div><dt>担当</dt><dd>' + escapeHtml(row.responsible_role_code || "-") + '</dd></div>',
          '  </dl>',
          row.note ? '<p class="aicm-ledger-note">' + escapeHtml(row.note) + '</p>' : '',
          '</article>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }

  function renderTaskLedgerCreateForm(company, departments) {
    if (!company) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>AI企業が未選択です</strong>',
        '  <p>ダッシュボードでAI企業を選択してください。</p>',
        '  <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボードへ</button>',
        '</div>'
      ].join("");
    }

    if (!departments.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>部門がありません</strong>',
        '  <p>部門別タスク台帳を作るには、先に部門が必要です。</p>',
        '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加へ</button>',
        '</div>'
      ].join("");
    }

    var firstDepartment = departments[0];
    var sections = sectionsForDepartment(firstDepartment.aicm_user_company_department_id);

    return [
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">台帳行追加</p>',
      '  <h2>部門別タスクを追加</h2>',
      '  <div class="aicm-form-grid">',
      '    <label>部門<select id="aicm-ledger-department">',
      departments.map(function (department) {
        return '<option value="' + escapeHtml(department.aicm_user_company_department_id) + '">' + escapeHtml(department.department_name) + '</option>';
      }).join(""),
      '    </select></label>',
      '    <label>課<select id="aicm-ledger-section">',
      '      <option value="">部門直下</option>',
      sections.map(function (section) {
        return '<option value="' + escapeHtml(section.aicm_user_company_section_id) + '">' + escapeHtml(section.section_name) + '</option>';
      }).join(""),
      '    </select></label>',
      '    <label>成果物名<input id="aicm-ledger-deliverable" type="text" placeholder="例: 部門別タスク台帳UI"></label>',
      '    <label>作業名<input id="aicm-ledger-task" type="text" placeholder="例: 一覧と追加フォームを実装"></label>',
      '    <label>作業種別<select id="aicm-ledger-work-type">',
      '      <option value="design">設計</option>',
      '      <option value="implementation">実装</option>',
      '      <option value="test">テスト</option>',
      '      <option value="review">レビュー</option>',
      '      <option value="handoff">引き継ぎ</option>',
      '    </select></label>',
      '    <label>担当役割<select id="aicm-ledger-role">',
      '      <option value="Manager">Manager</option>',
      '      <option value="Leader">Leader</option>',
      '      <option value="Worker">Worker</option>',
      '      <option value="President">President</option>',
      '    </select></label>',
      '    <label>優先度<select id="aicm-ledger-priority">',
      '      <option value="normal">通常</option>',
      '      <option value="high">高</option>',
      '      <option value="low">低</option>',
      '    </select></label>',
      '    <label>状態<select id="aicm-ledger-status">',
      '      <option value="todo">未着手</option>',
      '      <option value="in_progress">作業中</option>',
      '      <option value="review_waiting">レビュー待ち</option>',
      '      <option value="done">完了</option>',
      '    </select></label>',
      '  </div>',
      '  <label>補足メモ<textarea id="aicm-ledger-note" rows="3" placeholder="短い補足だけ"></textarea></label>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="task-ledger-create">台帳行を追加</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

  async function createTaskLedgerFromForm() {
    var company = selectedCompany();
    if (!company) {
      setMessage("error", "先にAI企業を選択してください。");
      render();
      return;
    }

    var departmentEl = document.getElementById("aicm-ledger-department");
    var sectionEl = document.getElementById("aicm-ledger-section");
    var deliverableEl = document.getElementById("aicm-ledger-deliverable");
    var taskEl = document.getElementById("aicm-ledger-task");

    var deliverableName = deliverableEl ? deliverableEl.value.trim() : "";
    var taskName = taskEl ? taskEl.value.trim() : "";

    if (!departmentEl || !departmentEl.value) {
      setMessage("error", "部門を選択してください。");
      render();
      return;
    }

    if (!deliverableName || !taskName) {
      setMessage("error", "成果物名と作業名を入力してください。");
      render();
      return;
    }

    var payload = {
      owner_civilization_id: ownerCivilizationId(),
      aicm_user_company_id: company.aicm_user_company_id,
      aicm_user_company_department_id: departmentEl.value,
      aicm_user_company_section_id: sectionEl ? sectionEl.value : "",
      deliverable_name: deliverableName,
      task_name: taskName,
      work_type_code: valueOf("aicm-ledger-work-type") || "design",
      responsible_role_code: valueOf("aicm-ledger-role") || "Manager",
      priority_code: valueOf("aicm-ledger-priority") || "normal",
      task_status_code: valueOf("aicm-ledger-status") || "todo",
      note: valueOf("aicm-ledger-note")
    };

    try {
      var response = await fetch("/api/aicm/v2/task-ledger/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      var json = await response.json();

      if (!response.ok || !json || json.result !== "ok") {
        throw new Error((json && json.error_message) || "台帳行追加に失敗しました。");
      }

      setMessage("ok", "部門別タスク台帳に追加しました。");

      if (typeof loadContext === "function") {
        await loadContext();
      }

      state.screen = "task-ledger";
      render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "台帳行追加に失敗しました。");
      render();
    }
  }

  function ownerCivilizationId() {
    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
    if (typeof OWNER_CIVILIZATION_ID !== "undefined") return OWNER_CIVILIZATION_ID;
    return "00000000-0000-4000-8000-000000000001";
  }

  function valueOf(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "") : "";
  }


  

function taskLedgerCsvColumns() {
    return [
      "department_name",
      "section_name",
      "deliverable_name",
      "task_name",
      "work_type_code",
      "responsible_role_code",
      "task_status_code",
      "priority_code",
      "due_date",
      "reference_files_text",
      "supplemental_materials_text",
      "applicable_rules_text",
      "note",
      "handoff_link"
    ];
  }

  function taskLedgerCsvTemplateText() {
    return [
      taskLedgerCsvColumns().join(","),
      [
        "開発部",
        "UI課",
        "部門別タスク台帳UI",
        "CSV取り込み画面を実装",
        "implementation",
        "Leader",
        "todo",
        "normal",
        "",
        "",
        "画面スクショ",
        "会社共通ルール",
        "CSV作成後に取り込み",
        ""
      ].join(",")
    ].join("\n");
  }

  function taskLedgerCsvPromptText() {
    return [
      "以下のCSVカラムで、AICompanyManagerの部門別タスク台帳に取り込む行を作成してください。",
      "出力はCSVのみ。説明文やMarkdownコードブロックは不要です。",
      "",
      "必須カラム:",
      taskLedgerCsvColumns().join(","),
      "",
      "ルール:",
      "- department_name は既存の部門名に合わせる",
      "- section_name は任意。部門直下なら空欄",
      "- deliverable_name と task_name は必須",
      "- work_type_code は design / implementation / test / review / handoff のいずれか",
      "- responsible_role_code は Manager / Leader / Worker / President のいずれか",
      "- task_status_code は todo / in_progress / review_waiting / done のいずれか",
      "- priority_code は low / normal / high のいずれか",
      "- due_date は YYYY-MM-DD または空欄",
      "- reference_files_text は参照ファイル",
      "- supplemental_materials_text は補足資料",
      "- applicable_rules_text は適用ルール",
      "- note は短い補足",
      "- handoff_link は任意"
    ].join("\n");
  }

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuote = false;

    text = String(text || "").replace(/^\uFEFF/, "");

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var next = text[i + 1];

      if (inQuote) {
        if (ch === '"' && next === '"') {
          field += '"';
          i++;
        } else if (ch === '"') {
          inQuote = false;
        } else {
          field += ch;
        }
        continue;
      }

      if (ch === '"') {
        inQuote = true;
        continue;
      }

      if (ch === ",") {
        row.push(field);
        field = "";
        continue;
      }

      if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        continue;
      }

      if (ch === "\r") {
        continue;
      }

      field += ch;
    }

    row.push(field);
    rows.push(row);

    return rows.filter(function (items) {
      return items.some(function (item) {
        return String(item || "").trim() !== "";
      });
    });
  }

  function csvRowsToObjects(rows) {
    if (!rows.length) return [];
    var headers = rows[0].map(function (h) {
      return String(h || "").trim();
    });

    return rows.slice(1).map(function (items, index) {
      var obj = { row_number: index + 2 };
      headers.forEach(function (header, i) {
        obj[header] = String(items[i] || "").trim();
      });
      return obj;
    });
  }

  function findDepartmentByName(company, name) {
    var text = String(name || "").trim();
    if (!company || !text) return null;

    var departments = companyDepartments(company.aicm_user_company_id);
    return departments.find(function (department) {
      return String(department.department_name || "").trim() === text;
    }) || null;
  }

  function findSectionByName(departmentId, name) {
    var text = String(name || "").trim();
    if (!text) return null;

    return state.context.sections.find(function (section) {
      return String(section.aicm_user_company_department_id || "") === String(departmentId || "")
        && String(section.section_name || "").trim() === text;
    }) || null;
  }

  
function buildTaskLedgerCsvPreview() {
    var company = selectedCompany();
    var text = String(state.csvImportText || "");
    var parsedRows = parseCsv(text);
    var objects = csvRowsToObjects(parsedRows);
    var requiredHeaders = taskLedgerCsvColumns();

    if (!company) {
      throw new Error("先にAI企業を選択してください。");
    }

    if (parsedRows.length < 2) {
      throw new Error("CSVファイルを読み込んでください。");
    }

    var headers = parsedRows[0].map(function (h) {
      return String(h || "").trim();
    });

    var missing = requiredHeaders.filter(function (header) {
      return headers.indexOf(header) < 0;
    });

    if (missing.length) {
      throw new Error("CSVカラム不足: " + missing.join(", "));
    }

    return objects.map(function (row) {
      var errors = [];
      var department = findDepartmentByName(company, row.department_name);
      var section = null;

      if (!department) {
        errors.push("部門が見つかりません: " + (row.department_name || "(空欄)"));
      } else if (row.section_name) {
        section = findSectionByName(department.aicm_user_company_department_id, row.section_name);
        if (!section) {
          errors.push("課が見つかりません: " + row.section_name);
        }
      }

      if (!row.deliverable_name) errors.push("成果物名が空欄です");
      if (!row.task_name) errors.push("作業名が空欄です");

      return {
        row_number: row.row_number,
        source: row,
        valid: errors.length === 0,
        errors: errors,
        payload: {
          owner_civilization_id: ownerCivilizationId(),
          aicm_user_company_id: company.aicm_user_company_id,
          aicm_user_company_department_id: department ? department.aicm_user_company_department_id : "",
          aicm_user_company_section_id: section ? section.aicm_user_company_section_id : "",
          deliverable_name: row.deliverable_name || "",
          task_name: row.task_name || "",
          work_type_code: row.work_type_code || "design",
          responsible_role_code: row.responsible_role_code || "Manager",
          task_status_code: row.task_status_code || "todo",
          priority_code: row.priority_code || "normal",
          due_date: row.due_date || "",
          reference_files_text: row.reference_files_text || "",
          supplemental_materials_text: row.supplemental_materials_text || "",
          applicable_rules_text: row.applicable_rules_text || "",
          note: row.note || "",
          handoff_link: row.handoff_link || ""
        }
      };
    });
  }

  



// AICM_PMLW_CSV_CONNECT_ARB_ARE_V1
// PMLW CSV/UI connector. Uses existing clean core state and selectedCompany().
function aicmPmlwOwnerId() {
    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
    if (state && state.owner_civilization_id) return state.owner_civilization_id;
    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
    return "00000000-0000-4000-8000-000000000001";
  }

  async function aicmPmlwPostJson(path, body) {
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

  async function aicmPmlwReloadContext() {
    if (typeof loadContext === "function") {
      await loadContext();
      return;
    }

    if (typeof refreshContext === "function") {
      await refreshContext();
      return;
    }

    var owner = encodeURIComponent(aicmPmlwOwnerId());
    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
    var json = await response.json();

    if (json && json.result === "ok") {
      state.context = json;
    }

    if (typeof render === "function") {
      render();
    }
  }

  function aicmPmlwCsvPromptText() {
    return [
      "以下のCSVカラムで、部長/Managerが大項目へ分解済みの行を作成してください。",
      "出力はCSVのみ。説明文やMarkdownコードブロックは不要です。",
      "",
      "CSVカラム:",
      "department_name,section_name,major_item_name,major_item_description,assigned_leader_label,priority_code,due_date,note",
      "",
      "ルール:",
      "- department_name は既存部門名に合わせる",
      "- section_name は既存課名に合わせる",
      "- major_item_name は部長/Managerが課長へ渡す大項目名",
      "- major_item_description は大項目の説明",
      "- assigned_leader_label は未定なら空欄",
      "- priority_code は low / normal / high / urgent のいずれか",
      "- due_date は YYYY-MM-DD。未定なら空欄",
      "- note は短い補足だけ",
      "",
      "例:",
      "department_name,section_name,major_item_name,major_item_description,assigned_leader_label,priority_code,due_date,note",
      "開発部,UI課,銀行業務UI整理,銀行業務に必要なUI領域を大項目として整理する,,normal,,"
    ].join("\n");
  }

  async function handleTaskLedgerChatGptPrompt() {
    var text = aicmPmlwCsvPromptText();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setMessage("ok", "ChatGPT用プロンプトをコピーしました。");
        return;
      }
    } catch (_) {}

    if (typeof downloadTextFile === "function") {
      downloadTextFile("aicm_manager_major_csv_prompt.txt", text, "text/plain;charset=utf-8");
      setMessage("ok", "ChatGPT用プロンプトファイルを作成しました。");
      return;
    }

    setMessage("error", "プロンプトのコピーに失敗しました。");
  }

  function parseAicmCsv(text) {
    var rows = [];
    var row = [];
    var cell = "";
    var inQuotes = false;
    var value = String(text || "");

    for (var i = 0; i < value.length; i += 1) {
      var ch = value[i];
      var next = value[i + 1];

      if (inQuotes && ch === '"' && next === '"') {
        cell += '"';
        i += 1;
        continue;
      }

      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && ch === ",") {
        row.push(cell);
        cell = "";
        continue;
      }

      if (!inQuotes && (ch === "\n" || ch === "\r")) {
        if (ch === "\r" && next === "\n") i += 1;
        row.push(cell);
        cell = "";

        if (row.some(function (v) { return String(v || "").trim() !== ""; })) {
          rows.push(row);
        }

        row = [];
        continue;
      }

      cell += ch;
    }

    row.push(cell);
    if (row.some(function (v) { return String(v || "").trim() !== ""; })) {
      rows.push(row);
    }

    if (rows.length < 2) return [];

    var headers = rows[0].map(function (v) {
      return String(v || "").trim();
    });

    return rows.slice(1).map(function (values) {
      var obj = {};
      headers.forEach(function (header, index) {
        obj[header] = String(values[index] || "").trim();
      });
      return obj;
    }).filter(function (obj) {
      return Object.keys(obj).some(function (key) {
        return String(obj[key] || "").trim() !== "";
      });
    });
  }

  async function importTaskLedgerCsvToPmlwMajor() {
    var company = selectedCompany();

    if (!company) {
      setMessage("error", "AI企業を選択してください。");
      return;
    }

    var text = String(state.csvImportText || "").trim();

    if (!text) {
      setMessage("error", "CSVファイルを読み込んでください。");
      return;
    }

    try {
      var rows = parseAicmCsv(text);

      if (!rows.length) {
        setMessage("error", "取り込めるCSV行がありません。");
        return;
      }

      var result = await aicmPmlwPostJson("/api/aicm/v2/manager-major/import-csv", {
        owner_civilization_id: aicmPmlwOwnerId(),
        aicm_user_company_id: company.aicm_user_company_id,
        rows: rows
      });

      var count = result.inserted_count || 0;
      state.csvImportLastResult = "CSV取り込み完了: " + count + "件";
      setMessage("ok", state.csvImportLastResult);

      await aicmReloadTaskLedgerContext();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "CSV取り込みに失敗しました。");
    }
  }


  function renderCsvImportCard(company) {
    var fileName = state.csvImportFileName || "未選択";
    var lastResult = state.csvImportLastResult || "";

    return [
      '<section class="aicm-core-card aicm-csv-panel">',
      '  <p class="aicm-eyebrow">CSV取り込み</p>',
      '  <h2>ChatGPTでCSV作成・取り込み</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <div class="aicm-csv-flow">',
      '    <div class="aicm-csv-flow-step aicm-csv-flow-main">',
      '      <div><strong>ChatGPT用プロンプト</strong><p>部長/Managerが分解した大項目CSVをChatGPTで作成します。</p></div>',
      '      <button type="button" data-core-action="task-ledger-chatgpt-prompt">ChatGPT用プロンプト</button>',
      '    </div>',
      '    <div class="aicm-csv-flow-step">',
      '      <div><strong>CSVファイル読込</strong><p>作成したCSVファイルを選択します。</p></div>',
      '      <button type="button" data-core-action="task-ledger-csv-file-open">CSVファイル読込</button>',
      '    </div>',
      '    <div class="aicm-csv-file-name">ファイル名: <strong>' + escapeHtml(fileName) + '</strong></div>',
      '    <div class="aicm-csv-flow-step">',
      '      <div><strong>CSV取り込み実行</strong><p>部長/Manager分解済みの大項目CSVを部門別タスク台帳へ登録します。</p></div>',
      '      <button type="button" data-core-action="task-ledger-csv-import">CSV取り込み実行</button>',
      '    </div>',
      '  </div>',
      '  <input id="aicm-ledger-csv-file" class="aicm-csv-native-file" type="file" accept=".csv,text/csv" data-core-file="task-ledger-csv">',
      lastResult ? '<p class="aicm-selected-note">' + escapeHtml(lastResult) + '</p>' : '',
      '</section>'
    ].join("");
  }

  
function renderCsvPreviewTable(preview) {
    return "";
  }

  
function renderCsvTemplatePanel() {
    return "";
  }


function downloadTextFile(filename, text, mimeType) {
    var blob = new Blob([String(text || "")], { type: mimeType || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  async function readTaskLedgerCsvFile(file) {
    if (!file) return;

    try {
      var text = await file.text();
      state.csvImportText = text;
      state.csvImportFileName = file.name || "selected.csv";
      state.csvImportPreview = [];
      state.csvImportLastResult = "";
      setMessage("ok", "CSVファイルを読み込みました: " + state.csvImportFileName);
    } catch (error) {
      state.csvImportText = "";
      state.csvImportFileName = "";
      state.csvImportPreview = [];
      state.csvImportLastResult = "";
      setMessage("error", "CSVファイル読込に失敗しました。");
    }

    render();
  }

  function openTaskLedgerCsvFilePicker() {
    var input = document.getElementById("aicm-ledger-csv-file");
    if (input) input.click();
  }

  async function openTaskLedgerChatGptPrompt() {
    var text = taskLedgerCsvPromptText();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setMessage("ok", "ChatGPT用プロンプトをコピーしました。");
        render();
        return;
      }
    } catch (error) {
    }

    downloadTextFile("aicm_task_ledger_chatgpt_prompt.txt", text, "text/plain;charset=utf-8");
    setMessage("ok", "ChatGPT用プロンプトファイルを作成しました。");
    render();
  }


  function previewTaskLedgerCsv() {
    try {
      state.csvImportPreview = buildTaskLedgerCsvPreview();
      setMessage("ok", "CSVを確認しました。");
    } catch (error) {
      state.csvImportPreview = [];
      setMessage("error", error && error.message ? error.message : "CSV確認に失敗しました。");
    }
    render();
  }

  async function fillTaskLedgerCsvTemplate() {
    var el = document.getElementById("aicm-ledger-csv-text");
    if (el) {
      el.value = taskLedgerCsvTemplateText();
      setMessage("ok", "CSV入力例を確認しました。");
    }
    render();
  }


async function importTaskLedgerCsv() {
    var preview = [];

    try {
      preview = buildTaskLedgerCsvPreview();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "CSV取り込みに失敗しました。");
      render();
      return;
    }

    var invalidRows = preview.filter(function (row) { return !row.valid; });
    if (invalidRows.length) {
      var message = invalidRows.slice(0, 3).map(function (row) {
        return "行" + row.row_number + ": " + row.errors.join(" / ");
      }).join(" / ");

      setMessage("error", "CSV取り込み前チェックでエラーがあります。 " + message);
      render();
      return;
    }

    var success = 0;
    var failed = 0;
    var messages = [];

    for (var i = 0; i < preview.length; i++) {
      var row = preview[i];

      try {
        var response = await fetch("/api/aicm/v2/task-ledger/create", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(row.payload)
        });

        var json = await response.json();

        if (!response.ok || !json || json.result !== "ok") {
          throw new Error((json && json.error_message) || "取り込み失敗");
        }

        success++;
      } catch (error) {
        failed++;
        messages.push("行" + row.row_number + ": " + (error && error.message ? error.message : "取り込み失敗"));
      }
    }

    if (typeof loadContext === "function") {
      await loadContext();
    }

    if (failed > 0) {
      state.csvImportLastResult = "CSV取り込み: 成功 " + success + "件 / 失敗 " + failed + "件";
      setMessage("error", state.csvImportLastResult + "。 " + messages.slice(0, 3).join(" / "));
    } else {
      state.csvImportLastResult = "CSV取り込み完了: " + success + "件";
      state.csvImportText = "";
      state.csvImportFileName = "";
      setMessage("ok", state.csvImportLastResult);
    }

    state.csvImportPreview = [];
    state.screen = "task-ledger";
    render();
  }


  

function pmlwMajorRowsForCompany(companyId) {
    // AICM_AXU_CSV_R7_PMLW_MAJOR_UI_FILTER_REPAIR_V1
    var ctx = state && state.context ? state.context : {};
    var targetCompanyId = String(companyId || "");

    function asArray(value) {
      return Array.isArray(value) ? value : [];
    }

    function rowCompanyId(row) {
      return String(
        row && (
          row.aicm_user_company_id ||
          row.company_id ||
          row.user_company_id ||
          row.companyId ||
          ""
        ) || ""
      );
    }

    function rowOrder(row) {
      var n = Number(
        row && (
          row.display_order ||
          row.sort_order ||
          row.row_order ||
          0
        )
      );

      return Number.isFinite(n) ? n : 0;
    }

    var rows = []
      .concat(asArray(ctx.pmlw_major_items))
      .concat(asArray(ctx.manager_major_items))
      .concat(asArray(ctx.major_items));

    var filtered = rows.filter(function (row) {
      if (!row) return false;

      var cid = rowCompanyId(row);

      if (!targetCompanyId) return true;
      if (!cid) return true;

      return cid === targetCompanyId;
    });

    filtered.sort(function (a, b) {
      var ao = rowOrder(a);
      var bo = rowOrder(b);

      if (ao !== bo) return ao - bo;

      var an = String((a && (a.major_item_name || a.title || a.task_name)) || "");
      var bn = String((b && (b.major_item_name || b.title || b.task_name)) || "");

      return an.localeCompare(bn, "ja");
    });

    return filtered;
  }

  function pmlwValue(value, fallback) {
    var text = String(value || "").trim();
    return text || fallback || "-";
  }

  function pmlwStatusLabel(value) {
    var map = {
      not_started: "未着手",
      assigned_to_leader: "Leader割当済",
      leader_decomposing: "Leader分解中",
      decomposed: "分解済",
      returned: "差戻し",
      archived: "削除済",
      draft: "下書き",
      ready_handoff: "引渡し準備",
      handed_off: "引渡し済",
      accepted: "受領済",
      completed: "完了",
      low: "低",
      normal: "通常",
      high: "高",
      urgent: "緊急"
    };

    return map[value] || pmlwValue(value, "-");
  }

  
// AICM_AXU_R1_MANAGER_MAJOR_TO_LEADER_V1
// Manager大項目 -> 課長/Leader引渡し。
// Worker Runtime requestはここでは作らない。
// DB書込は既存確認画面を通して /api/aicm/v2/manager-major/update で実行する。
function aicmAxuR1Text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

function aicmAxuR1OwnerId() {
    if (state && state.ownerCivilizationId) return aicmAxuR1Text(state.ownerCivilizationId);
    if (state && state.context && state.context.owner_civilization_id) return aicmAxuR1Text(state.context.owner_civilization_id);
    return "00000000-0000-4000-8000-000000000001";
  }

function aicmAxuR1MajorId(row) {
    row = row || {};
    return aicmAxuR1Text(
      row.aicm_manager_major_work_item_id ||
      row.manager_major_work_item_id ||
      row.major_work_item_id ||
      row.id
    );
  }

function aicmAxuR1FindMajorById(majorId) {
    var rows = state && state.context && Array.isArray(state.context.pmlw_major_items)
      ? state.context.pmlw_major_items
      : [];

    var id = aicmAxuR1Text(majorId);

    for (var i = 0; i < rows.length; i += 1) {
      if (aicmAxuR1MajorId(rows[i]) === id) return rows[i];
    }

    return null;
  }

function aicmAxuR1PlacementRoleText(row) {
    row = row || {};
    return [
      row.role_code,
      row.placement_role_code,
      row.assignment_role_code,
      row.worker_role_code,
      row.role_name,
      row.role_label,
      row.display_role,
      row.role_display_name,
      row.display_label
    ].map(aicmAxuR1Text).join(" ").toLowerCase();
  }

function aicmAxuR1IsActiveLeaderPlacement(row) {
    row = row || {};
    var status = aicmAxuR1Text(row.status_code || row.placement_status_code || "active").toLowerCase();
    var roleText = aicmAxuR1PlacementRoleText(row);

    if (status && status !== "active") return false;

    return (
      roleText.indexOf("leader") >= 0 ||
      roleText.indexOf("課長") >= 0 ||
      roleText.indexOf("リーダ") >= 0
    );
  }

function aicmAxuR1LeaderPlacementsForCompany(companyId) {
    var rows = state && state.context && Array.isArray(state.context.placements)
      ? state.context.placements
      : [];

    var cid = aicmAxuR1Text(companyId);

    return rows.filter(function (row) {
      return aicmAxuR1Text(row.aicm_user_company_id) === cid && aicmAxuR1IsActiveLeaderPlacement(row);
    });
  }

function aicmAxuR1BestLeaderForMajor(row) {
    row = row || {};

    var companyId = aicmAxuR1Text(row.aicm_user_company_id || state.selectedCompanyId);
    var departmentId = aicmAxuR1Text(row.aicm_user_company_department_id);
    var sectionId = aicmAxuR1Text(row.aicm_user_company_section_id);
    var leaders = aicmAxuR1LeaderPlacementsForCompany(companyId);

    if (!leaders.length) return null;

    if (sectionId) {
      for (var i = 0; i < leaders.length; i += 1) {
        if (aicmAxuR1Text(leaders[i].aicm_user_company_section_id) === sectionId) return leaders[i];
      }
    }

    if (departmentId) {
      for (var j = 0; j < leaders.length; j += 1) {
        if (aicmAxuR1Text(leaders[j].aicm_user_company_department_id) === departmentId) return leaders[j];
      }
    }

    return leaders[0] || null;
  }

function aicmAxuR1LeaderLabel(row) {
    row = row || {};

    var existing = aicmAxuR1Text(row.assigned_leader_label);
    if (existing) return existing;

    var leader = aicmAxuR1BestLeaderForMajor(row);
    if (!leader) return "";

    var nickname = aicmAxuR1Text(leader.internal_nickname || leader.placement_nickname || leader.robot_internal_nickname);
    var role = aicmAxuR1Text(leader.role_code || "Leader");
    var model = aicmAxuR1Text(leader.aiworker_model_code || leader.model_code || leader.model_no);
    var display = aicmAxuR1Text(leader.display_label || leader.robot_pool_display_name || leader.robot_pool_label);

    if (nickname) return nickname + "@" + role;
    if (display) return display;
    if (model) return model + "@" + role;

    return role;
  }

function aicmAxuR1BuildLeaderHandoffPayload(row) {
    row = row || {};

    var majorId = aicmAxuR1MajorId(row);
    var leaderLabel = aicmAxuR1LeaderLabel(row);

    if (!majorId) {
      throw new Error("Manager大項目IDを特定できません。");
    }

    if (!leaderLabel) {
      throw new Error("課長/Leaderが未設定です。課変更でLeaderを設定するか、Manager大項目のLeader欄を設定してください。");
    }

    return {
      kind: "manager-major-leader-handoff",
      title: "課長へ送る確認",
      endpoint: "/api/aicm/v2/manager-major/update",
      backScreen: "task-ledger",
      body: {
        owner_civilization_id: aicmAxuR1OwnerId(),
        aicm_manager_major_work_item_id: majorId,
        assigned_leader_label: leaderLabel,
        decomposition_status_code: "assigned_to_leader",
        handoff_status_code: "handed_off",
        note: aicmAxuR1Text(row.note)
      }
    };
  }

function aicmAxuR1ShowLeaderHandoffConfirm(payload) {
    if (typeof aicmAvdShowDbConfirm === "function") {
      aicmAvdShowDbConfirm(payload);
      return;
    }

    if (typeof aicmOrgShowUpdateConfirm === "function") {
      aicmOrgShowUpdateConfirm(payload);
      return;
    }

    state.pendingOrgUpdate = payload;
    state.screen = "task-ledger";

    if (typeof render === "function") render();
  }

function aicmAxuR1OpenLeaderHandoffConfirm(button) {
    try {
      var majorId = button && button.getAttribute ? button.getAttribute("data-pmlw-major-id") : "";
      var row = aicmAxuR1FindMajorById(majorId);

      if (!row) {
        throw new Error("Manager大項目を特定できません。");
      }

      var payload = aicmAxuR1BuildLeaderHandoffPayload(row);
      aicmAxuR1ShowLeaderHandoffConfirm(payload);
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "課長への引渡し確認を表示できません。");
      if (typeof render === "function") render();
    }
  }



// AICM_AXU_R1B_LEADER_HANDOFF_BUTTON_VISIBLE_V1
// 保険表示: テーブル内ボタンが出ない場合でも、Manager大項目ごとの「課長へ送る」を出す。
function aicmAxuR1BLeaderHandoffStandalonePanel() {
    var rows = state && state.context && Array.isArray(state.context.pmlw_major_items)
      ? state.context.pmlw_major_items
      : [];

    if (!rows.length) return "";

    return [
      '<section class="aicm-core-card aicm-axu-r1b-leader-handoff-panel">',
      '  <p class="aicm-eyebrow">Manager大項目</p>',
      '  <h2>課長への引渡し</h2>',
      '  <p class="aicm-selected-note">Manager大項目を課長/Leaderへ送ります。Worker Runtime request はまだ作成しません。</p>',
      rows.map(function (row) {
        var majorId = typeof aicmAxuR1MajorId === "function" ? aicmAxuR1MajorId(row) : "";
        var title = row.major_item_name || row.deliverable_name || row.task_name || "Manager大項目";
        var leader = row.assigned_leader_label || row.leader_label || "Leader未設定";
        var status = row.decomposition_status_code || "-";
        var handoff = row.handoff_status_code || "-";

        return [
          '<article class="aicm-org-update-row">',
          '  <div>',
          '    <strong>' + escapeHtml(title) + '</strong>',
          '    <p>Leader: ' + escapeHtml(leader) + ' / 状態: ' + escapeHtml(status) + ' / 引渡し: ' + escapeHtml(handoff) + '</p>',
          '  </div>',
          '  <button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
          '</article>'
        ].join("");
      }).join(""),
      '</section>'
    ].join("");
  }


function renderPmlwMajorRowsBaseAxuR1B(rows) {
    if (!rows.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>登録済み大項目はまだありません</strong>',
        '  <p>President起点でAI企業業務を開始するか、CSVで部長/Manager分解済みの大項目を取り込むと、ここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-table-wrap">',
      '  <table class="aicm-core-table">',
      '    <thead>',
      '      <tr>',
      '        <th>方針元</th>',
      '        <th>大項目</th>',
      '        <th>部門</th>',
      '        <th>課</th>',
      '        <th>Leader</th>',
      '        <th>分解状態</th>',
      '        <th>引渡し</th>',
      '        <th>優先度</th>',
      '        <th>期限</th>',
      '        <th>操作</th>',
      '      </tr>',
      '    </thead>',
      '    <tbody>',
      rows.map(function (row) {
        return [
          '      <tr>',
          '        <td>' + escapeHtml(pmlwValue(row.policy_title, row.source_route_code || "-")) + '</td>',
          '        <td><strong>' + escapeHtml(pmlwValue(row.major_item_name, "-")) + '</strong><small>' + escapeHtml(pmlwValue(row.major_item_description, "")) + '</small></td>',
          '        <td>' + escapeHtml(pmlwValue(row.department_name, "未割当")) + '</td>',
          '        <td>' + escapeHtml(pmlwValue(row.section_name, "未割当")) + '</td>',
          '        <td>' + escapeHtml(pmlwValue(row.assigned_leader_label, "-")) + '</td>',
          '        <td>' + escapeHtml(pmlwStatusLabel(row.decomposition_status_code)) + '</td>',
          '        <td>' + escapeHtml(pmlwStatusLabel(row.handoff_status_code)) + '</td>',
          '        <td>' + escapeHtml(pmlwStatusLabel(row.priority_code)) + '</td>',
          '        <td>' + escapeHtml(pmlwValue(row.due_date, "-")) + '</td>',
          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(aicmAxuR1MajorId(row)) + '">課長へ送る</button></td>',
          '      </tr>'
        ].join("");
      }).join(""),
      '    </tbody>',
      '  </table>',
      '</div>'
    ].join("");
  }

function renderPmlwMajorRows(rows) {
    // AICM_AXU_CSV_R8_RENDER_PMLW_MAJOR_ROWS_REPAIR_V1
    function h(value) {
      if (typeof escapeHtml === "function") return escapeHtml(value);
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function value(row, keys, fallback) {
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (row && row[key] != null && String(row[key]) !== "") return row[key];
      }
      return fallback == null ? "" : fallback;
    }

    function rowId(row, index) {
      if (typeof aicmAxuR1MajorId === "function") {
        var id = aicmAxuR1MajorId(row);
        if (id) return id;
      }

      return String(
        value(row, [
          "aicm_manager_major_work_item_id",
          "manager_major_work_item_id",
          "pmlw_major_item_id",
          "major_item_id",
          "id"
        ], "row-" + String(index))
      );
    }

    var list = Array.isArray(rows) ? rows : [];

    if (!list.length && typeof selectedCompany === "function" && typeof pmlwMajorRowsForCompany === "function") {
      var company = selectedCompany();
      list = company ? pmlwMajorRowsForCompany(company.aicm_user_company_id) : [];
    }

    if (!Array.isArray(list) || list.length === 0) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>登録済み大項目はまだありません</strong>',
        '  <p>President起点でAI企業業務を開始するか、CSVで部長/Manager分解済みの大項目を取り込むと、ここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-table-wrap">',
      '  <table class="aicm-table">',
      '    <thead>',
      '      <tr>',
      '        <th>大項目</th>',
      '        <th>部門</th>',
      '        <th>課</th>',
      '        <th>優先度</th>',
      '        <th>期限</th>',
      '        <th>状態</th>',
      '        <th>操作</th>',
      '      </tr>',
      '    </thead>',
      '    <tbody>',
      list.map(function (row, index) {
        var id = rowId(row, index);
        var title = value(row, ["major_item_name", "title", "task_name", "deliverable_name"], "-");
        var description = value(row, ["major_item_description", "description", "note"], "");
        var department = value(row, ["department_name", "department_label"], "-");
        var section = value(row, ["section_name", "section_label"], "-");
        var priority = value(row, ["priority_code"], "normal");
        var dueDate = value(row, ["due_date"], "-");
        var status = value(row, ["handoff_status_code", "decomposition_status_code", "status_code"], "-");

        return [
          '      <tr>',
          '        <td><strong>' + h(title) + '</strong>' + (description ? '<p class="aicm-selected-note">' + h(description) + '</p>' : '') + '</td>',
          '        <td>' + h(department) + '</td>',
          '        <td>' + h(section) + '</td>',
          '        <td>' + h(priority) + '</td>',
          '        <td>' + h(dueDate || "-") + '</td>',
          '        <td>' + h(status || "-") + '</td>',
          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + h(id) + '">課長へ送る</button></td>',
          '      </tr>'
        ].join("");
      }).join(""),
      '    </tbody>',
      '  </table>',
      '</div>'
    ].join("");
  }


  







  function aicmRenderManagerMajorRows(rows) {
    // AICM_MANAGER_MAJOR_RENDER_CANONICAL_V1: render
    function h(value) {
      if (typeof escapeHtml === "function") return escapeHtml(value);
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function pick(row, keys, fallback) {
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (row && row[key] != null && String(row[key]) !== "") return row[key];
      }
      return fallback == null ? "" : fallback;
    }

    function rowId(row, index) {
      var direct = pick(row, [
        "aicm_manager_major_work_item_id",
        "manager_major_work_item_id",
        "pmlw_major_item_id",
        "major_item_id",
        "id"
      ], "");

      if (direct) return String(direct);

      if (typeof aicmAxuR1MajorId === "function") {
        var fallback = aicmAxuR1MajorId(row);
        if (fallback) return String(fallback);
      }

      return "manager-major-row-" + String(index);
    }

    var list = Array.isArray(rows) ? rows.filter(function (row) { return !!row; }) : [];

    if (!list.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>登録済み大項目はまだありません</strong>',
        '  <p>President起点でAI企業業務を開始するか、CSVで部長/Manager分解済みの大項目を取り込むと、ここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-table-wrap">',
      '  <table class="aicm-table">',
      '    <thead>',
      '      <tr>',
      '        <th>大項目</th>',
      '        <th>部門</th>',
      '        <th>課</th>',
      '        <th>優先度</th>',
      '        <th>期限</th>',
      '        <th>状態</th>',
      '        <th>操作</th>',
      '      </tr>',
      '    </thead>',
      '    <tbody>',
      list.map(function (row, index) {
        var title = pick(row, ["major_item_name", "title", "task_name", "deliverable_name"], "-");
        var description = pick(row, ["major_item_description", "description", "note"], "");
        var department = pick(row, ["department_name", "department_label"], "-");
        var section = pick(row, ["section_name", "section_label"], "-");
        var priority = pick(row, ["priority_code"], "normal");
        var dueDate = pick(row, ["due_date"], "-");
        var status = pick(row, ["handoff_status_code", "decomposition_status_code", "status_code"], "-");
        var id = rowId(row, index);

        return [
          '      <tr>',
          '        <td><strong>' + h(title) + '</strong>' + (description ? '<p class="aicm-selected-note">' + h(description) + '</p>' : '') + '</td>',
          '        <td>' + h(department) + '</td>',
          '        <td>' + h(section) + '</td>',
          '        <td>' + h(priority) + '</td>',
          '        <td>' + h(dueDate || "-") + '</td>',
          '        <td>' + h(status || "-") + '</td>',
          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + h(id) + '">課長へ送る</button></td>',
          '      </tr>'
        ].join("");
      }).join(""),
      '    </tbody>',
      '  </table>',
      '</div>'
    ].join("");
  }

function aicmGetManagerMajorRowsForSelectedCompany(companyId) {
    // AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: rows
    var ctx = state && state.context ? state.context : {};
    var selectedId = String(companyId || "");

    if (!selectedId && state && state.selectedCompanyId) {
      selectedId = String(state.selectedCompanyId || "");
    }

    if (!selectedId && typeof selectedCompany === "function") {
      var company = selectedCompany();
      if (company && company.aicm_user_company_id) {
        selectedId = String(company.aicm_user_company_id || "");
      }
    }

    function asArray(value) {
      return Array.isArray(value) ? value : [];
    }

    function rowCompanyId(row) {
      return String(
        row && (
          row.aicm_user_company_id ||
          row.company_id ||
          row.user_company_id ||
          row.companyId ||
          ""
        ) || ""
      );
    }

    function statusText(row, keys) {
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (row && row[key] != null && String(row[key]) !== "") {
          return String(row[key]).toLowerCase();
        }
      }

      return "";
    }

    function isPendingMajor(row) {
      var handoff = statusText(row, ["handoff_status_code", "handoff_status", "leader_handoff_status_code"]);
      var decomposition = statusText(row, ["decomposition_status_code", "work_status_code", "status_code"]);

      var closed = {
        sent: true,
        handed_off: true,
        leader_handoff_done: true,
        submitted: true,
        delivered: true,
        done: true,
        completed: true,
        complete: true,
        cancelled: true,
        canceled: true,
        archived: true
      };

      if (closed[handoff]) return false;
      if (closed[decomposition]) return false;

      return true;
    }

    function rowOrder(row) {
      var n = Number(row && (row.display_order || row.sort_order || row.row_order || 0));
      return Number.isFinite(n) ? n : 0;
    }

    var rows = []
      .concat(asArray(ctx.pmlw_major_items))
      .concat(asArray(ctx.manager_major_items))
      .concat(asArray(ctx.major_items));

    rows = rows.filter(function (row) {
      if (!row) return false;

      var cid = rowCompanyId(row);

      if (selectedId && cid && cid !== selectedId) return false;

      return isPendingMajor(row);
    });

    rows.sort(function (a, b) {
      var ao = rowOrder(a);
      var bo = rowOrder(b);

      if (ao !== bo) return ao - bo;

      var an = String((a && (a.major_item_name || a.title || a.task_name || a.deliverable_name)) || "");
      var bn = String((b && (b.major_item_name || b.title || b.task_name || b.deliverable_name)) || "");

      return an.localeCompare(bn, "ja");
    });

    return rows;
  }

  function aicmRenderManagerMajorRows(rows) {
    // AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: render
    function h(value) {
      if (typeof escapeHtml === "function") return escapeHtml(value);
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function pick(row, keys, fallback) {
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (row && row[key] != null && String(row[key]) !== "") return row[key];
      }
      return fallback == null ? "" : fallback;
    }

    function rowId(row, index) {
      var direct = pick(row, [
        "aicm_manager_major_work_item_id",
        "manager_major_work_item_id",
        "pmlw_major_item_id",
        "major_item_id",
        "id"
      ], "");

      if (direct) return String(direct);

      if (typeof aicmAxuR1MajorId === "function") {
        var fallback = aicmAxuR1MajorId(row);
        if (fallback) return String(fallback);
      }

      return "manager-major-row-" + String(index);
    }

    var list = Array.isArray(rows) ? rows.filter(function (row) { return !!row; }) : [];

    if (!list.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>登録済み大項目はまだありません</strong>',
        '  <p>未実行の大項目がDBに登録されていません。AI企業業務開始またはCSV取り込みを行うと、ここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-selected-note">未実行大項目: <strong>' + String(list.length) + '</strong>件</div>',
      '<div class="aicm-table-wrap">',
      '  <table class="aicm-table">',
      '    <thead>',
      '      <tr>',
      '        <th>大項目</th>',
      '        <th>部門</th>',
      '        <th>課</th>',
      '        <th>優先度</th>',
      '        <th>期限</th>',
      '        <th>状態</th>',
      '        <th>操作</th>',
      '      </tr>',
      '    </thead>',
      '    <tbody>',
      list.map(function (row, index) {
        var title = pick(row, ["major_item_name", "title", "task_name", "deliverable_name"], "-");
        var description = pick(row, ["major_item_description", "description", "note"], "");
        var department = pick(row, ["department_name", "department_label"], "-");
        var section = pick(row, ["section_name", "section_label"], "-");
        var priority = pick(row, ["priority_code"], "normal");
        var dueDate = pick(row, ["due_date"], "-");
        var handoff = pick(row, ["handoff_status_code", "handoff_status"], "draft");
        var decomposition = pick(row, ["decomposition_status_code", "status_code"], "not_started");
        var id = rowId(row, index);

        return [
          '      <tr>',
          '        <td><strong>' + h(title) + '</strong>' + (description ? '<p class="aicm-selected-note">' + h(description) + '</p>' : '') + '</td>',
          '        <td>' + h(department) + '</td>',
          '        <td>' + h(section) + '</td>',
          '        <td>' + h(priority) + '</td>',
          '        <td>' + h(dueDate || "-") + '</td>',
          '        <td>' + h(decomposition) + ' / ' + h(handoff) + '</td>',
          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + h(id) + '">課長へ送る</button></td>',
          '      </tr>'
        ].join("");
      }).join(""),
      '    </tbody>',
      '  </table>',
      '</div>'
    ].join("");
  }

  async function aicmReloadTaskLedgerContext() {
    // AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: reload
    state.screen = "task-ledger";
    state.errorMessage = "";

    if (typeof loadContext === "function") {
      await loadContext();
    }

    state.screen = "task-ledger";

    if (typeof render === "function") {
      render();
    }
  }

function renderTaskLedgerPlaceholder() {
    // AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: screen
    var company = typeof selectedCompany === "function" ? selectedCompany() : null;
    var companyId = company && company.aicm_user_company_id ? company.aicm_user_company_id : "";
    var rows = aicmGetManagerMajorRowsForSelectedCompany(companyId);

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門別タスク台帳</p>',
      '  <h2>部門別タスク台帳</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">未実行のManager大項目だけをDB/contextから表示します。CSV取り込みは部長/Manager分解済み大項目の新規追加です。</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="task-ledger-refresh">登録済み大項目をリロード</button>',
      '  </div>',
      '</section>',
      renderCsvImportCard(company),
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Manager大項目</p>',
      '  <h2>登録済み大項目</h2>',
      aicmRenderManagerMajorRows(rows),
      '</section>'
    ].join(""));
  }

  
// AICM_HUMAN_REVIEW_QUEUE_CORE_ARO_ART_V1
// Human review queue UI.
// Human review only shows delivery summaries / exception summaries.
// AI review remains internal; the UI displays ai_review_result_text summary only.

function aicmHumanReviewOwnerId() {
    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
    if (state && state.owner_civilization_id) return state.owner_civilization_id;
    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
    return "00000000-0000-4000-8000-000000000001";
  }

  function aicmHumanReviewRows() {
    var ctx = state.context || state || {};
    var rows = ctx.review_wait_items || state.review_wait_items || [];
    return Array.isArray(rows) ? rows : [];
  }

  function aicmHumanReviewRowsForCompany(companyId) {
    return aicmHumanReviewRows().filter(function (row) {
      return !companyId || row.aicm_user_company_id === companyId;
    });
  }

  async function aicmHumanReviewPostJson(path, body) {
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

  async function aicmHumanReviewReload() {
    if (typeof aicmPmlwReloadContext === "function") {
      await aicmReloadTaskLedgerContext();
      return;
    }

    if (typeof loadContext === "function") {
      await loadContext();
      return;
    }

    var owner = encodeURIComponent(aicmHumanReviewOwnerId());
    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
    var json = await response.json();

    if (json && json.result === "ok") state.context = json;
    if (typeof render === "function") render();
  }

  async function approveHumanReviewFromAction(el) {
    var reviewId = el && el.getAttribute ? el.getAttribute("data-review-id") : "";

    if (!reviewId) {
      setMessage("error", "レビュー項目を特定できません。");
      return;
    }

    try {
      await aicmHumanReviewPostJson("/api/aicm/v2/human-review/approve", {
        owner_civilization_id: aicmHumanReviewOwnerId(),
        aicm_human_review_item_id: reviewId,
        human_reviewer_label: "user",
        human_review_note: ""
      });

      setMessage("ok", "レビューを承認しました。");
      await aicmHumanReviewReload();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "承認に失敗しました。");
    }
  }

  async function returnHumanReviewFromAction(el) {
    var reviewId = el && el.getAttribute ? el.getAttribute("data-review-id") : "";

    if (!reviewId) {
      setMessage("error", "レビュー項目を特定できません。");
      return;
    }

    var note = "";

    try {
      if (typeof window !== "undefined" && window.prompt) {
        note = window.prompt("差し戻し理由を入力してください。", "") || "";
      }
    } catch (_) {}

    try {
      await aicmHumanReviewPostJson("/api/aicm/v2/human-review/return", {
        owner_civilization_id: aicmHumanReviewOwnerId(),
        aicm_human_review_item_id: reviewId,
        human_reviewer_label: "user",
        human_review_note: note
      });

      setMessage("ok", "レビューを差し戻しました。");
      await aicmHumanReviewReload();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "差し戻しに失敗しました。");
    }
  }

  function renderHumanReviewRows(rows) {
    if (!rows.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>レビュー・承認待ちはありません</strong>',
        '  <p>設計書と実装は、納品時にAIがまとめた要約だけがここに表示されます。</p>',
        '  <p>AIレビューは内部工程で通常通り実施され、ここにはAIレビュー結果の要約だけが出ます。</p>',
        '</div>'
      ].join("");
    }

    return rows.map(function (row) {
      var id = row.aicm_human_review_item_id || "";
      var title = row.review_title || "レビュー項目";
      var kind = row.review_kind_label || row.review_kind_code || "納品サマリー";
      var artifact = row.artifact_kind_label || row.artifact_kind_code || "";
      var status = row.human_review_status_label || row.human_review_status_code || "承認待ち";
      var company = row.company_name || "";
      var department = row.department_name || "";
      var section = row.section_name || "";
      var aiLabel = row.responsible_ai_label || row.requested_by_ai_label || "";
      var summary = row.delivery_summary_text || "要約未設定";
      var changes = row.main_changes_text || "";
      var aiReview = row.ai_review_result_text || "";
      var unresolved = row.unresolved_issues_text || "";
      var link = row.artifact_link || "";

      return [
        '<article class="aicm-core-card aicm-review-card">',
        '  <div class="aicm-review-head">',
        '    <div>',
        '      <p class="aicm-eyebrow">' + escapeHtml(kind) + (artifact ? ' / ' + escapeHtml(artifact) : '') + '</p>',
        '      <h2>' + escapeHtml(title) + '</h2>',
        '    </div>',
        '    <span class="aicm-pill">' + escapeHtml(status) + '</span>',
        '  </div>',
        '  <div class="aicm-review-meta">',
        company ? '<span>会社: ' + escapeHtml(company) + '</span>' : '',
        department ? '<span>部門: ' + escapeHtml(department) + '</span>' : '',
        section ? '<span>課: ' + escapeHtml(section) + '</span>' : '',
        aiLabel ? '<span>担当AI: ' + escapeHtml(aiLabel) + '</span>' : '',
        '  </div>',
        '  <section class="aicm-review-summary">',
        '    <h3>納品サマリー</h3>',
        '    <p>' + escapeHtml(summary) + '</p>',
        changes ? '    <h3>主な変更点</h3><p>' + escapeHtml(changes) + '</p>' : '',
        aiReview ? '    <h3>AIレビュー結果</h3><p>' + escapeHtml(aiReview) + '</p>' : '',
        unresolved ? '    <h3>注意点 / 未解決事項</h3><p>' + escapeHtml(unresolved) + '</p>' : '',
        link ? '    <p><a href="' + escapeHtml(link) + '" target="_blank" rel="noopener">成果物を開く</a></p>' : '',
        '  </section>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="human-review-approve" data-review-id="' + escapeHtml(id) + '">承認</button>',
        '    <button type="button" data-core-action="human-review-return" data-review-id="' + escapeHtml(id) + '">差し戻し</button>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }


  
function renderReviewListPlaceholder() {
    var company = selectedCompany();
    var rows = company ? aicmHumanReviewRowsForCompany(company.aicm_user_company_id) : aicmHumanReviewRows();

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
      '  <h2>納品サマリー確認</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
      '</section>',
      renderHumanReviewRows(rows)
    ].join(""));
  }


  



// AICM_DEPT_SECTION_EDIT_FORM_WORKER_ROUTE_ASW_ASZ_V1





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



  

// AICM_WORKER_RUNTIME_UI_AXT_V1
// Worker runtime request UI.
// This screen creates no request until the user reaches the confirmation screen and presses 確定して実行.
// Browser never receives AIWorkerOS auth token. It posts only to AICompanyManager local endpoint.
function aicmWrtText(value) {
    return String(value || "").trim();
  }

function aicmWrtEscape(value) {
    return escapeHtml(aicmWrtText(value));
  }

function aicmWrtOwnerId() {
    if (typeof aicmAvdOwnerId === "function") return aicmAvdOwnerId();
    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
    return "";
  }

function aicmWrtCompanies() {
    return state && state.context && Array.isArray(state.context.companies) ? state.context.companies : [];
  }

function aicmWrtCurrentCompany() {
    if (typeof aicmOrgSelectedCompany === "function") {
      var company = aicmOrgSelectedCompany();
      if (company) return company;
    }

    if (typeof selectedCompany === "function") {
      var selected = selectedCompany();
      if (selected) return selected;
    }

    if (typeof aicmAvdCurrentCompany === "function") {
      var avd = aicmAvdCurrentCompany();
      if (avd) return avd;
    }

    var rows = aicmWrtCompanies();
    if (state && state.selectedCompanyId) {
      for (var i = 0; i < rows.length; i += 1) {
        if (rows[i] && rows[i].aicm_user_company_id === state.selectedCompanyId) return rows[i];
      }
    }

    return rows[0] || null;
  }

function aicmWrtCompanyId() {
    var company = aicmWrtCurrentCompany();
    return company ? aicmWrtText(company.aicm_user_company_id) : "";
  }

function aicmWrtActiveWorkerPlacements() {
    var ctx = state && state.context ? state.context : {};
    var rows = Array.isArray(ctx.placements) ? ctx.placements : [];
    var companyId = aicmWrtCompanyId();

    return rows.filter(function (row) {
      if (!row) return false;
      if (aicmWrtText(row.app_code || "AICompanyManager") !== "AICompanyManager") return false;
      if (aicmWrtText(row.status_code || "active").toLowerCase() !== "active") return false;
      if (aicmWrtText(row.role_code).toLowerCase() !== "worker") return false;
      if (companyId && row.aicm_user_company_id && aicmWrtText(row.aicm_user_company_id) !== companyId) return false;
      return true;
    });
  }

function aicmWrtPlacementById(placementId) {
    var id = aicmWrtText(placementId);
    var rows = aicmWrtActiveWorkerPlacements();

    for (var i = 0; i < rows.length; i += 1) {
      if (aicmWrtText(rows[i].aicm_user_company_worker_placement_id) === id) return rows[i];
    }

    return null;
  }

function aicmWrtWorkerLabel(row) {
    row = row || {};

    var label = aicmWrtText(
      row.display_label ||
      row.internal_nickname ||
      row.placement_nickname ||
      row.aiworker_model_code ||
      row.robot_pool_id
    );

    var dept = aicmWrtText(row.department_name);
    var section = aicmWrtText(row.section_name);
    var model = aicmWrtText(row.aiworker_model_code);

    var parts = [];
    if (label) parts.push(label);
    if (model && label.indexOf(model) < 0) parts.push(model);
    if (dept) parts.push(dept);
    if (section) parts.push(section);

    return parts.length ? parts.join(" / ") : "Worker";
  }

function aicmWrtWorkerOptions() {
    var rows = aicmWrtActiveWorkerPlacements();

    if (!rows.length) {
      return '<option value="">配置済みAI/Workerがありません</option>';
    }

    return ['<option value="">AI/Workerを選択</option>'].concat(rows.map(function (row) {
      return '<option value="' + aicmWrtEscape(row.aicm_user_company_worker_placement_id) + '">' + aicmWrtEscape(aicmWrtWorkerLabel(row)) + '</option>';
    })).join("");
  }

function aicmWrtDomainOptions() {
    var options = [
      ["business_operation", "業務作業"],
      ["design_document_creation", "設計書作成"],
      ["pg_development", "PG/SQL開発支援"],
      ["ui_implementation", "UI実装"],
      ["review_and_check", "レビュー/確認"],
      ["research_document_creation", "調査資料作成"],
      ["proposal_planning", "企画/提案"]
    ];

    return options.map(function (row) {
      return '<option value="' + aicmWrtEscape(row[0]) + '">' + aicmWrtEscape(row[1]) + '</option>';
    }).join("");
  }

function aicmWrtDefaultSourceRequestRef() {
    return "manual:" + String(Date.now());
  }

function aicmWrtBuildIdempotencyKey(sourceRequestRef, placementId) {
    return "aicm:" + aicmWrtText(sourceRequestRef) + ":" + aicmWrtText(placementId);
  }

// AICM_AI_EXECUTION_WORKBENCH_AXT_R2W_V1
// AICompanyManager normal execution is ledger/PMLW based.
// This screen remains as AI Execution Workbench for exception handling, smoke testing, and future AI Operation Desk reuse.

// AICM_RUNTIME_STATUS_PANEL_AXT_R9_R1_V1
// Reusable runtime status panel candidate.
// This is intentionally generic so AIOperationDesk can reuse the same idea later.
function aicmRuntimeStatusRowsFromPayload(payload) {
    if (!payload) return [];

    function firstUsefulArray(value) {
      if (Array.isArray(value)) {
        if (value.some(function (row) {
          return row && typeof row === "object" && (
            row.request_id ||
            row.runtime_execution_request_id ||
            row.request_code ||
            row.task_title ||
            row.model_code
          );
        })) {
          return value;
        }

        for (var i = 0; i < value.length; i += 1) {
          var nested = firstUsefulArray(value[i]);
          if (nested.length) return nested;
        }

        return [];
      }

      if (value && typeof value === "object") {
        var keys = Object.keys(value);

        for (var k = 0; k < keys.length; k += 1) {
          var found = firstUsefulArray(value[keys[k]]);
          if (found.length) return found;
        }
      }

      return [];
    }

    if (Array.isArray(payload)) return firstUsefulArray(payload);
    if (payload.payload) return firstUsefulArray(payload.payload);

    return firstUsefulArray(payload);
  }

function aicmRuntimeStatusShort(value, max) {
    var text = String(value === undefined || value === null ? "" : value);
    var limit = Number(max || 120);

    return text.length > limit ? text.slice(0, limit) + "..." : text;
  }

function aicmRuntimeStatusField(row, names) {
    row = row || {};

    for (var i = 0; i < names.length; i += 1) {
      var value = row[names[i]];

      if (value !== undefined && value !== null && String(value).length > 0) {
        return value;
      }
    }

    return "";
  }

function aicmRuntimeStatusRowsHtml(rows) {
    rows = Array.isArray(rows) ? rows.slice(0, 5) : [];

    if (!rows.length) {
      return '<p class="aicm-core-empty">AICompanyManager由来の実行状況はまだありません。作成後に「実行状況を更新」を押してください。</p>';
    }

    return rows.map(function (row) {
      var requestId = aicmRuntimeStatusField(row, ["request_id", "runtime_execution_request_id"]);
      var title = aicmRuntimeStatusField(row, ["task_title", "title"]);
      var model = aicmRuntimeStatusField(row, ["model_code", "aiworker_model_code", "model_no"]);
      var status = aicmRuntimeStatusField(row, ["request_status_code", "status_code"]);
      var outputStatus = aicmRuntimeStatusField(row, ["output_status_code"]);
      var deliveryStatus = aicmRuntimeStatusField(row, ["delivery_status_code"]);
      var reviewRequired = aicmRuntimeStatusField(row, ["review_required_flag"]);
      var humanGoRequired = aicmRuntimeStatusField(row, ["human_go_required_flag"]);

      return [
        '<article class="aicm-core-card aicm-runtime-status-row">',
        '  <p class="aicm-eyebrow">Runtime request</p>',
        '  <h3>' + escapeHtml(aicmRuntimeStatusShort(title || requestId || "実行依頼", 80)) + '</h3>',
        '  <div class="aicm-confirm-list">',
        '    <div class="aicm-confirm-row"><strong>request_id</strong><p>' + escapeHtml(String(requestId || "-")) + '</p></div>',
        '    <div class="aicm-confirm-row"><strong>model_code</strong><p>' + escapeHtml(String(model || "-")) + '</p></div>',
        '    <div class="aicm-confirm-row"><strong>request_status</strong><p>' + escapeHtml(String(status || "-")) + '</p></div>',
        '    <div class="aicm-confirm-row"><strong>output_status</strong><p>' + escapeHtml(String(outputStatus || "-")) + '</p></div>',
        '    <div class="aicm-confirm-row"><strong>delivery_status</strong><p>' + escapeHtml(String(deliveryStatus || "-")) + '</p></div>',
        '    <div class="aicm-confirm-row"><strong>review / human GO</strong><p>' + escapeHtml("review=" + String(reviewRequired || "-") + " / human_go=" + String(humanGoRequired || "-")) + '</p></div>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }


// AICM_RUNTIME_STATUS_PANEL_FILTER_AXT_R9_R2_V1
// Runtime Status Panel display filter.
// AIOperationDesk can reuse the same idea later by changing expected app surface/source rules.
function aicmRuntimeStatusNormalizeText(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

function aicmRuntimeStatusRowSearchText(row) {
    try {
      return JSON.stringify(row || {}).toLowerCase();
    } catch (error) {
      return "";
    }
  }

function aicmRuntimeStatusIsTestLikeRow(row) {
    var title = aicmRuntimeStatusNormalizeText(aicmRuntimeStatusField(row, [
      "task_title",
      "title",
      "output_title_ja",
      "request_title"
    ]));

    var code = aicmRuntimeStatusNormalizeText(aicmRuntimeStatusField(row, [
      "request_code",
      "source_request_ref",
      "idempotency_key"
    ]));

    var text = (title + " " + code).toLowerCase();

    return (
      text.indexOf("smoke") >= 0 ||
      text.indexOf("runtime execution http api fix") >= 0 ||
      text.indexOf("persistent smoke") >= 0
    );
  }

function aicmRuntimeStatusIsCurrentAppRow(row) {
    var appSurface = aicmRuntimeStatusNormalizeText(aicmRuntimeStatusField(row, [
      "app_surface_code",
      "surface_code"
    ]));

    var sourceApp = aicmRuntimeStatusNormalizeText(aicmRuntimeStatusField(row, [
      "source_app_ref",
      "source_app_code",
      "app_code"
    ]));

    var searchText = aicmRuntimeStatusRowSearchText(row);

    if (aicmRuntimeStatusIsTestLikeRow(row)) {
      return false;
    }

    if (appSurface === "ai_company_manager") {
      return true;
    }

    if (sourceApp === "AICompanyManager" || sourceApp === "ai_company_manager") {
      return true;
    }

    if (searchText.indexOf('"app_surface_code":"ai_company_manager"') >= 0) {
      return true;
    }

    if (searchText.indexOf('"source_app_ref":"AICompanyManager"'.toLowerCase()) >= 0) {
      return true;
    }

    return false;
  }

function aicmRuntimeStatusFilterRowsForCurrentApp(rows) {
    rows = Array.isArray(rows) ? rows : [];

    var filtered = rows.filter(function (row) {
      return aicmRuntimeStatusIsCurrentAppRow(row);
    });

    return filtered;
  }


function aicmRuntimeStatusPanelRender() {
    var loading = !!state.runtimeStatusLoading;
    var error = state.runtimeStatusError || "";
    var rows = Array.isArray(state.runtimeStatusRows) ? state.runtimeStatusRows : [];
    var lastUpdated = state.runtimeStatusUpdatedAt || "";

    return [
      '<section class="aicm-core-card aicm-runtime-status-panel">',
      '  <p class="aicm-eyebrow">AIWorkerOS 実行状況</p>',
      '  <h2>Runtime request / pipeline</h2>',
      '  <p class="aicm-selected-note">AIWorkerOSの app-read-payload / pipeline-board をAICM server経由で読みます。DB書込は行いません。</p>',
      error ? '  <p class="aicm-core-error">' + escapeHtml(error) + '</p>' : '',
      lastUpdated ? '  <p class="aicm-core-empty">最終更新: ' + escapeHtml(lastUpdated) + '</p>' : '',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="worker-runtime-status-refresh">' + (loading ? '更新中...' : '実行状況を更新') + '</button>',
      '  </div>',
      aicmRuntimeStatusRowsHtml(rows),
      '</section>'
    ].join("");
  }

async function aicmRuntimeStatusRefresh() {
    state.runtimeStatusLoading = true;
    state.runtimeStatusError = "";

    if (typeof render === "function") render();

    try {
      var response = await fetch("/api/aicm/v2/worker-runtime/pipeline-board?app_surface_code=ai_company_manager&source_app_ref=AICompanyManager", { method: "GET" });
      var json = await response.json();

      if (!response.ok || (json && json.result === "error")) {
        var message = (json && json.error_message) || "実行状況の取得に失敗しました。";
        throw new Error(message);
      }

      var runtimeRows = aicmRuntimeStatusRowsFromPayload(json);
      state.runtimeStatusRawRows = runtimeRows;
      state.runtimeStatusRows = aicmRuntimeStatusFilterRowsForCurrentApp(runtimeRows);
      state.runtimeStatusRaw = json;
      state.runtimeStatusUpdatedAt = new Date().toLocaleString();
      state.runtimeStatusLoading = false;
      state.runtimeStatusError = "";

      if (typeof render === "function") render();
    } catch (error) {
      state.runtimeStatusLoading = false;
      state.runtimeStatusError = error && error.message ? error.message : "実行状況の取得に失敗しました。";

      if (typeof render === "function") render();
    }
  }


function renderWorkerRuntimeRequestBaseAxtR9R1() {
    var company = aicmWrtCurrentCompany();
    var workers = aicmWrtActiveWorkerPlacements();
    var last = state.workerRuntimeLastResult || null;

    var lastHtml = "";
    if (last && last.runtime_request) {
      lastHtml = [
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">直近の実行依頼</p>',
        '  <h2>request_id</h2>',
        '  <p class="aicm-selected-note">' + aicmWrtEscape(last.runtime_request.request_id || "未返却") + '</p>',
        '  <p>status: ' + aicmWrtEscape(last.runtime_request.request_status_code || "-") + '</p>',
        '</section>'
      ].join("");
    }

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">AI実行Workbench</p>',
      '  <h2>配置済みAI/Workerに作業を依頼</h2>',
      company
        ? '  <p class="aicm-selected-note">対象会社: <strong>' + aicmWrtEscape(company.company_name || "") + '</strong></p>'
        : '  <p class="aicm-core-empty">AI企業が選択されていません。</p>',
      workers.length
        ? '  <p class="aicm-selected-note">配置済みWorker: ' + String(workers.length) + '件</p>'
        : '  <p class="aicm-core-empty">この会社に配置済みAI/Workerがありません。先に課変更で従業員Workerを配置してください。</p>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <label>実行AI/Worker<select id="aicm-worker-runtime-placement-id">' + aicmWrtWorkerOptions() + '</select></label>',
      '  <label>作業種別<select id="aicm-worker-runtime-task-domain">' + aicmWrtDomainOptions() + '</select></label>',
      '  <label>作業タイトル<input id="aicm-worker-runtime-title" type="text" placeholder="例: UI修正案の作成"></label>',
      '  <label>作業指示<textarea id="aicm-worker-runtime-instruction" rows="7" placeholder="何を、どの条件で、どこまで作業するかを書いてください。"></textarea></label>',
      '  <label>source_request_ref<input id="aicm-worker-runtime-source-ref" type="text" placeholder="空なら manual:<timestamp>"></label>',
      '  <p class="aicm-core-empty">AIWorkerOS tokenはブラウザには出しません。確定後、AICompanyManager serverが中継します。通常業務は部門別タスク台帳から連続実行し、この画面は補助/例外/検証用Workbenchです。</p>',
      '</section>',
      '<section class="aicm-core-card aicm-operation-card">',
      '  <p class="aicm-eyebrow">操作</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="worker-runtime-confirm">確認へ進む</button>',
      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
      '  </div>',
      '</section>',
      lastHtml
    ].join(""));
  }

function renderWorkerRuntimeRequest() {
    // AICM_RUNTIME_STATUS_PANEL_AXT_R9_R1_V1
    return renderWorkerRuntimeRequestBaseAxtR9R1() + aicmRuntimeStatusPanelRender();
  }

function aicmWrtValue(id) {
    var el = document.getElementById(id);
    return el ? aicmWrtText(el.value) : "";
  }

function buildWorkerRuntimePendingPayload() {
    var company = aicmWrtCurrentCompany();
    if (!company) throw new Error("AI企業を選択してください。");

    var placementId = aicmWrtValue("aicm-worker-runtime-placement-id");
    if (!placementId) throw new Error("実行AI/AI/Workerを選択してください。");

    var worker = aicmWrtPlacementById(placementId);
    if (!worker) throw new Error("選択したWorker配置が見つかりません。");

    var title = aicmWrtValue("aicm-worker-runtime-title");
    if (!title) throw new Error("作業タイトルを入力してください。");

    var instruction = aicmWrtValue("aicm-worker-runtime-instruction");
    if (!instruction) throw new Error("作業指示を入力してください。");

    var sourceRef = aicmWrtValue("aicm-worker-runtime-source-ref") || aicmWrtDefaultSourceRequestRef();
    var idempotencyKey = aicmWrtBuildIdempotencyKey(sourceRef, placementId);

    return {
      endpoint: "/api/aicm/v2/worker-runtime/request",
      worker_label: aicmWrtWorkerLabel(worker),
      body: {
        owner_civilization_id: aicmWrtOwnerId(),
        aicm_user_company_id: aicmWrtText(company.aicm_user_company_id),
        aicm_user_company_department_id: aicmWrtText(worker.aicm_user_company_department_id),
        aicm_user_company_section_id: aicmWrtText(worker.aicm_user_company_section_id),
        aicm_user_company_worker_placement_id: placementId,
        model_code: aicmWrtText(worker.aiworker_model_code),
        robot_pool_id: aicmWrtText(worker.robot_pool_id),
        app_surface_code: "ai_company_manager",
        task_domain_code: aicmWrtValue("aicm-worker-runtime-task-domain") || "business_operation",
        task_title: title,
        task_instruction_ja: instruction,
        source_app_ref: "AICompanyManager",
        source_request_ref: sourceRef,
        requested_by_ref: "human",
        idempotency_key: idempotencyKey
      }
    };
  }

function renderWorkerRuntimeConfirm() {
    var payload = state.pendingWorkerRuntimeRequest || null;
    if (!payload || !payload.body) {
      return renderShell([
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">AI実行Workbench</p>',
        '  <h2>確認対象がありません</h2>',
        '  <div class="aicm-dashboard-action-row"><button type="button" data-core-action="worker-runtime-cancel">戻る</button></div>',
        '</section>'
      ].join(""));
    }

    var body = payload.body;
    var rows = [
      ["実行AI/Worker", payload.worker_label],
      ["model_code", body.model_code],
      ["app_surface_code", body.app_surface_code],
      ["task_domain_code", body.task_domain_code],
      ["作業タイトル", body.task_title],
      ["作業指示", body.task_instruction_ja],
      ["source_request_ref", body.source_request_ref],
      ["idempotency_key", body.idempotency_key]
    ];

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">確認画面</p>',
      '  <h2>AI実行Workbenchを確定しますか？</h2>',
      '  <p class="aicm-selected-note">この操作はAIWorkerOS Runtime Executionへ実行依頼を作成します。</p>',
      '</section>',
      '<section class="aicm-core-card aicm-confirm-card">',
      rows.map(function (row) {
        return '<div class="aicm-confirm-row"><strong>' + aicmWrtEscape(row[0]) + '</strong><p>' + aicmWrtEscape(row[1]) + '</p></div>';
      }).join(""),
      '</section>',
      '<section class="aicm-core-card aicm-operation-card">',
      '  <p class="aicm-eyebrow">操作</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="worker-runtime-execute">確定して実行</button>',
      '    <button type="button" data-core-action="worker-runtime-cancel">戻る</button>',
      '  </div>',
      '</section>'
    ].join(""));
  }

async function aicmWrtPostJson(path, body) {
    var response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body || {})
    });

    var json = await response.json().catch(function () {
      return {};
    });

    if (!response.ok || !json || json.result !== "ok") {
      throw new Error((json && (json.error_message || json.message || json.error)) || "AI実行Workbenchに失敗しました。");
    }

    return json;
  }

async function executeWorkerRuntimeConfirmBaseAxtR9R1() {
    var payload = state.pendingWorkerRuntimeRequest || null;
    if (!payload || !payload.endpoint || !payload.body) {
      setMessage("error", "確認対象がありません。");
      return;
    }

    try {
      var result = await aicmWrtPostJson(payload.endpoint, payload.body);
      state.pendingWorkerRuntimeRequest = null;
      state.workerRuntimeLastResult = result;
      state.screen = "worker-runtime-request";
      setMessage("ok", "AI実行Workbenchを作成しました。");
      if (typeof render === "function") render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "AI実行Workbenchに失敗しました。");
      if (typeof render === "function") render();
    }
  }

async function executeWorkerRuntimeConfirm() {
    // AICM_RUNTIME_STATUS_PANEL_AXT_R9_R1_V1
    var result = await executeWorkerRuntimeConfirmBaseAxtR9R1();

    setTimeout(function () {
      if (typeof aicmRuntimeStatusRefresh === "function") {
        aicmRuntimeStatusRefresh();
      }
    }, 250);

    return result;
  }

function confirmWorkerRuntimeRequestFromForm() {
    // AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1
    try {
      state.pendingWorkerRuntimeRequest = buildWorkerRuntimePendingPayload();
      state.screen = "worker-runtime-confirm";
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      if (typeof render === "function") render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "確認画面を表示できません。");
      if (typeof render === "function") render();
    }
  }

function cancelWorkerRuntimeConfirm() {
    // AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1
    state.pendingWorkerRuntimeRequest = null;
    state.screen = "worker-runtime-request";
    if (typeof render === "function") render();
  }

// AICM_AXU_MAINT_R3_PRESIDENT_CSV_ROUTE_V1
function renderAicmBusinessStartScreen() {
    var company = null;
    if (typeof selectedCompany === "function") company = selectedCompany();
    if (!company && typeof aicmOrgSelectedCompany === "function") company = aicmOrgSelectedCompany();

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">AI企業業務開始</p>',
      '  <h2>President起点で業務を開始</h2>',
      company ? '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>' : '  <p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">Presidentが会社方針・事業方針から業務を送り、Manager/部長が大項目へ分解し、課長へ引き継ぎます。</p>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">正本ルート</p>',
      '  <h2>業務開始ルート</h2>',
      '  <div class="aicm-confirm-row"><strong>1. President</strong><p>会社方針・事業方針から業務を送ります。</p></div>',
      '  <div class="aicm-confirm-row"><strong>2. Manager/部長</strong><p>受け取った業務を大項目レベルへ分解します。</p></div>',
      '  <div class="aicm-confirm-row"><strong>3. 課長</strong><p>大項目を受け取り、中項目・作業単位へ分解します。</p></div>',
      '  <div class="aicm-confirm-row"><strong>4. Worker</strong><p>作業単位を実行し、成果物を作成します。</p></div>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">CSV代替ルート</p>',
      '  <h2>部長分解済み大項目の取り込み</h2>',
      '  <p class="aicm-selected-note">CSVは、Manager/部長による大項目分解結果を代替入力するルートです。CSV取り込み後、登録済み大項目から課長へ引き継ぎます。</p>',
      '</section>',
      '<section class="aicm-core-card aicm-operation-card">',
      '  <p class="aicm-eyebrow">操作</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="go" data-screen="task-ledger">部門別タスク台帳へ</button>',
      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
      '  </div>',
      '</section>'
    ].join(""));
  }

function renderAicmBusinessStartDashboardCard() {
    var company = null;
    if (typeof selectedCompany === "function") company = selectedCompany();
    if (!company && typeof aicmOrgSelectedCompany === "function") company = aicmOrgSelectedCompany();

    return [
      '<section class="aicm-core-card aicm-operation-card">',
      '  <p class="aicm-eyebrow">AI企業業務開始</p>',
      '  <h2>President起点で業務を開始</h2>',
      company ? '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>' : '  <p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">Presidentが業務を送り、Manager/部長が大項目へ分解し、課長へ引き継ぐ正本ルートです。</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="go" data-screen="ai-business-start">AI企業業務開始</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

function render() {
    if (!root) return;

    var html = "";

    if (state.screen === "company-new") {
      html = renderCompanyNew();
    } else if (state.screen === "department-new") {
      html = renderDepartmentNew();
    } else if (state.screen === "section-new") {
      html = renderSectionNew();
    } else if (state.screen === "placement-new") {
      html = renderPlacementNew();
    } else if (state.screen === "worker-runtime-confirm") {
      // AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1
      html = renderWorkerRuntimeConfirm();
    } else if (state.screen === "worker-runtime-request") {
      html = renderWorkerRuntimeRequest();
    } else if (state.screen === "settings") {
      html = renderSettings();
    } else if (state.screen === "department-edit") {
      html = renderDepartmentEditPlaceholder();
    } else if (state.screen === "section-edit") {
      html = renderSectionEditPlaceholder();
    } else if (state.screen === "ai-business-start") {
      html = renderAicmBusinessStartScreen();
    } else if (state.screen === "task-ledger") {
      html = renderTaskLedgerPlaceholder();
    } else if (state.screen === "review-list") {
      html = renderReviewListPlaceholder();
    } else {
      html = renderDashboard();
    }

    
    // AICM_COMPANY_EDIT_RENDER_ROUTE_ASS_ASV
    if (
      state &&
      (
        state.screen === "company-edit" ||
        state.screen === "company-change" ||
        state.screen === "company-update"
      )
    ) {
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      html = renderCompanyEditPlaceholder();
    }


    // AICM_EDIT_SCREEN_RENDER_OVERRIDE_ATE_ATH
    if (state && state.screen === "company-edit") {
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      html = renderCompanyEditPlaceholder();
    }

    if (state && state.screen === "department-edit") {
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      html = renderDepartmentEditPlaceholder();
    }

    if (state && state.screen === "section-edit") {
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      html = renderSectionEditPlaceholder();
    }


    // AICM_INLINE_ROLE_ADD_SCREEN_INJECTION_ATQ_ATT
    if (typeof aicmInjectInlineRoleSettingsForAddScreens === "function") {
      html = aicmInjectInlineRoleSettingsForAddScreens(html);
    }

root.innerHTML = html;
  }

  function fieldValue(form, name) {
    var field = form.elements[name];
    return field && typeof field.value === "string" ? field.value.trim() : "";
  }

  function submitForm(form) {
    var formName = form.getAttribute("data-core-form") || "";
    state.errorMessage = "";
    state.noticeMessage = "";

    var task;

    if (formName === "company-create") {
      task = createCompany({
        companyName: fieldValue(form, "companyName"),
        businessDomain: fieldValue(form, "businessDomain")
      });
    } else if (formName === "department-create") {
      task = createDepartment({
        departmentName: fieldValue(form, "departmentName"),
        purpose: fieldValue(form, "purpose")
      });
    } else if (formName === "section-create") {
      task = createSection({
        sectionName: fieldValue(form, "sectionName"),
        purpose: fieldValue(form, "purpose")
      });
    } else if (formName === "placement-create") {
      var robotSelect = form.elements.robotPoolId;
      var selectedRobot = robotSelect && robotSelect.selectedOptions ? robotSelect.selectedOptions[0] : null;
      var targetLevelCode = fieldValue(form, "targetLevelCode");
      var sectionId = fieldValue(form, "sectionId");
      var targetId = state.selectedCompanyId;

      if (targetLevelCode === "department") {
        targetId = state.selectedDepartmentId;
      }

      if (targetLevelCode === "section") {
        targetId = sectionId;
      }

      task = createPlacement({
        departmentId: state.selectedDepartmentId,
        sectionId: sectionId,
        targetLevelCode: targetLevelCode,
        targetId: targetId,
        roleCode: fieldValue(form, "roleCode"),
        robotPoolId: fieldValue(form, "robotPoolId"),
        aiworkerModelCode: selectedRobot ? selectedRobot.getAttribute("data-model") || "" : "",
        internalNickname: fieldValue(form, "internalNickname")
      });
    } else {
      task = Promise.reject(new Error("未知のフォームです。"));
    }

    state.loading = true;
    render();

    task.catch(function (error) {
      state.loading = false;
      state.errorMessage = publicErrorMessage(error);
      render();
    });
  }

  // AICM_AXU_CSV_R1_FILE_CHANGE_HANDLER_V1
function aicmAxuCsvR1OpenFileInput() {
    var input = document.getElementById("aicm-ledger-csv-file");
    if (!input) {
      setMessage("error", "CSVファイル入力が見つかりません。");
      render();
      return;
    }

    try {
      input.value = "";
    } catch (_) {}

    input.click();
  }

function aicmAxuCsvR1ReadSelectedFile(input) {
    var file = input && input.files && input.files.length ? input.files[0] : null;

    if (!file) {
      state.csvImportFileName = "未選択";
      state.csvImportText = "";
      state.csvImportRows = [];
      setMessage("error", "CSVファイルが選択されていません。");
      render();
      return;
    }

    function finish(text) {
      var csvText = String(text || "").replace(/^\uFEFF/, "");
      state.csvImportFileName = file.name || "選択済みCSV";
      state.csvImportText = csvText;
      state.csvImportRawText = csvText;
      state.csvImportFileContent = csvText;
      state.csvImportLastResult = "";

      try {
        state.csvImportRows = typeof parseCsv === "function" ? parseCsv(csvText) : [];
      } catch (_) {
        state.csvImportRows = [];
      }

      setMessage("ok", "CSVファイルを読み込みました: " + state.csvImportFileName);
      render();
    }

    function failRead(error) {
      state.csvImportFileName = file.name || "選択済みCSV";
      state.csvImportText = "";
      state.csvImportRows = [];
      setMessage("error", error && error.message ? error.message : "CSVファイルの読み込みに失敗しました。");
      render();
    }

    if (file && typeof file.text === "function") {
      file.text().then(finish).catch(failRead);
      return;
    }

    var reader = new FileReader();
    reader.onload = function () { finish(reader.result); };
    reader.onerror = function () { failRead(new Error("CSVファイルの読み込みに失敗しました。")); };
    reader.readAsText(file, "utf-8");
  }

async function aicmAxuCsvR1ImportCsv() {
    var company = typeof selectedCompany === "function" ? selectedCompany() : null;

    if (!company || !company.aicm_user_company_id) {
      setMessage("error", "AI企業を選択してください。");
      render();
      return;
    }

    var text = String(state.csvImportText || state.csvImportRawText || state.csvImportFileContent || "");

    if (!text.trim()) {
      setMessage("error", "CSVファイルを先に読み込んでください。");
      render();
      return;
    }

    var rows = typeof parseCsv === "function" ? parseCsv(text) : [];

    if (!Array.isArray(rows) || rows.length === 0) {
      setMessage("error", "取り込めるCSV行がありません。ヘッダーとデータ行を確認してください。");
      render();
      return;
    }

    try {
      var payload = {
        owner_civilization_id: typeof aicmPmlwOwnerId === "function" ? aicmPmlwOwnerId() : ownerCivilizationId(),
        aicm_user_company_id: company.aicm_user_company_id,
        rows: rows
      };

      var result;

      if (typeof aicmPmlwPostJson === "function") {
        result = await aicmPmlwPostJson("/api/aicm/v2/manager-major/import-csv", payload);
      } else {
        var response = await fetch("/api/aicm/v2/manager-major/import-csv", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        result = await response.json();
        if (!response.ok || !result || result.result !== "ok") {
          throw new Error((result && result.error_message) || "CSV取り込みに失敗しました。");
        }
      }

      var count = result.inserted_count || result.imported_count || result.created_count || rows.length;
      state.csvImportLastResult = "CSV取り込み完了: " + count + "件";
      setMessage("ok", state.csvImportLastResult);

      if (typeof aicmPmlwReloadContext === "function") {
        await aicmReloadTaskLedgerContext();
      } else if (typeof loadContext === "function") {
        await loadContext();
      } else {
        render();
      }

      state.screen = "task-ledger";
      render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "CSV取り込みに失敗しました。");
      render();
    }
  }

// AICM_AXU_CSV_R2M_MAINTAINABLE_INPUT_V1
function aicmCsvOpenFileInput() {
    if (typeof aicmAxuCsvR1OpenFileInput === "function") {
      aicmCsvOpenFileInput();
      return;
    }

    var input = document.getElementById("aicm-ledger-csv-file");
    if (!input) {
      setMessage("error", "CSVファイル入力が見つかりません。");
      render();
      return;
    }

    try {
      input.value = "";
    } catch (_) {}

    input.click();
  }

function aicmCsvReadSelectedFile(input) {
    if (typeof aicmAxuCsvR1ReadSelectedFile === "function") {
      aicmAxuCsvR1ReadSelectedFile(input);
      return;
    }

    var file = input && input.files && input.files.length ? input.files[0] : null;

    if (!file) {
      state.csvImportFileName = "未選択";
      state.csvImportText = "";
      state.csvImportRows = [];
      setMessage("error", "CSVファイルが選択されていません。");
      render();
      return;
    }

    function finish(text) {
      var csvText = String(text || "").replace(/^\uFEFF/, "");
      state.csvImportFileName = file.name || "選択済みCSV";
      state.csvImportText = csvText;
      state.csvImportRawText = csvText;
      state.csvImportFileContent = csvText;
      state.csvImportLastResult = "";

      try {
        state.csvImportRows = typeof parseCsv === "function" ? parseCsv(csvText) : [];
      } catch (_) {
        state.csvImportRows = [];
      }

      setMessage("ok", "CSVファイルを読み込みました: " + state.csvImportFileName);
      render();
    }

    function failRead(error) {
      state.csvImportFileName = file.name || "選択済みCSV";
      state.csvImportText = "";
      state.csvImportRows = [];
      setMessage("error", error && error.message ? error.message : "CSVファイルの読み込みに失敗しました。");
      render();
    }

    try {
      if (file && typeof file.text === "function") {
        file.text().then(finish).catch(failRead);
        return;
      }

      var reader = new FileReader();
      reader.onload = function () {
        finish(reader.result);
      };
      reader.onerror = function () {
        failRead(new Error("CSVファイルの読み込みに失敗しました。"));
      };
      reader.readAsText(file, "utf-8");
    } catch (error) {
      failRead(error);
    }
  }

async function aicmCsvImportLoaded() {
    if (typeof aicmAxuCsvR1ImportCsv === "function") {
      await aicmCsvImportLoaded();
      return;
    }

    var company = typeof selectedCompany === "function" ? selectedCompany() : null;

    if (!company || !company.aicm_user_company_id) {
      setMessage("error", "AI企業を選択してください。");
      render();
      return;
    }

    var text = String(state.csvImportText || state.csvImportRawText || state.csvImportFileContent || "");

    if (!text.trim()) {
      setMessage("error", "CSVファイルを先に読み込んでください。");
      render();
      return;
    }

    var rows = typeof parseCsv === "function" ? parseCsv(text) : [];

    if (!Array.isArray(rows) || rows.length === 0) {
      setMessage("error", "取り込めるCSV行がありません。ヘッダーとデータ行を確認してください。");
      render();
      return;
    }

    try {
      var payload = {
        owner_civilization_id: typeof aicmPmlwOwnerId === "function" ? aicmPmlwOwnerId() : ownerCivilizationId(),
        aicm_user_company_id: company.aicm_user_company_id,
        rows: rows
      };

      var result;

      if (typeof aicmPmlwPostJson === "function") {
        result = await aicmPmlwPostJson("/api/aicm/v2/manager-major/import-csv", payload);
      } else {
        var response = await fetch("/api/aicm/v2/manager-major/import-csv", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        result = await response.json();

        if (!response.ok || !result || result.result !== "ok") {
          throw new Error((result && result.error_message) || "CSV取り込みに失敗しました。");
        }
      }

      var count = result.inserted_count || result.imported_count || result.created_count || rows.length;
      state.csvImportLastResult = "CSV取り込み完了: " + count + "件";
      setMessage("ok", state.csvImportLastResult);

      if (typeof aicmPmlwReloadContext === "function") {
        await aicmReloadTaskLedgerContext();
      } else if (typeof loadContext === "function") {
        await loadContext();
      }

      state.screen = "task-ledger";
      render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "CSV取り込みに失敗しました。");
      render();
    }
  }

// AICM_AXU_CSV_R3_READ_BEFORE_IMPORT_V1
function aicmCsvReadCurrentFileTextForImport() {
    var existing = String(state.csvImportText || state.csvImportRawText || state.csvImportFileContent || "");

    if (existing.trim()) {
      return Promise.resolve(existing);
    }

    var input = document.getElementById("aicm-ledger-csv-file");
    var file = input && input.files && input.files.length ? input.files[0] : null;

    if (!file) {
      return Promise.resolve("");
    }

    function store(text) {
      var csvText = String(text || "").replace(/^\uFEFF/, "");
      state.csvImportText = csvText;
      state.csvImportRawText = csvText;
      state.csvImportFileContent = csvText;
      state.csvImportFileName = file.name || state.csvImportFileName || "選択済みCSV";

      try {
        state.csvImportRows = typeof parseCsv === "function" ? parseCsv(csvText) : [];
      } catch (_) {
        state.csvImportRows = [];
      }

      return csvText;
    }

    if (file && typeof file.text === "function") {
      return file.text().then(store);
    }

    return new Promise(function (resolve, reject) {
      try {
        var reader = new FileReader();
        reader.onload = function () {
          resolve(store(reader.result));
        };
        reader.onerror = function () {
          reject(new Error("CSVファイルの読み込みに失敗しました。"));
        };
        reader.readAsText(file, "utf-8");
      } catch (error) {
        reject(error);
      }
    });
  }

async function aicmCsvImportLoadedReadBeforeImport() {
    var company = typeof selectedCompany === "function" ? selectedCompany() : null;

    if (!company || !company.aicm_user_company_id) {
      setMessage("error", "AI企業を選択してください。");
      render();
      return;
    }

    var text = "";

    try {
      text = await aicmCsvReadCurrentFileTextForImport();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "CSVファイルの読み込みに失敗しました。");
      render();
      return;
    }

    if (!String(text || "").trim()) {
      setMessage("error", "CSVファイルを先に選択してください。");
      render();
      return;
    }

    var rows = typeof parseCsv === "function" ? parseCsv(text) : [];

    if (!Array.isArray(rows) || rows.length === 0) {
      setMessage("error", "取り込めるCSV行がありません。ヘッダーとデータ行を確認してください。");
      render();
      return;
    }

    try {
      var payload = {
        owner_civilization_id: typeof aicmPmlwOwnerId === "function" ? aicmPmlwOwnerId() : ownerCivilizationId(),
        aicm_user_company_id: company.aicm_user_company_id,
        rows: rows
      };

      var result;

      if (typeof aicmPmlwPostJson === "function") {
        result = await aicmPmlwPostJson("/api/aicm/v2/manager-major/import-csv", payload);
      } else {
        var response = await fetch("/api/aicm/v2/manager-major/import-csv", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });

        result = await response.json();

        if (!response.ok || !result || result.result !== "ok") {
          throw new Error((result && result.error_message) || "CSV取り込みに失敗しました。");
        }
      }

      var count = result.inserted_count || result.imported_count || result.created_count || rows.length;
      state.csvImportLastResult = "CSV取り込み完了: " + count + "件";
      setMessage("ok", state.csvImportLastResult);

      if (typeof aicmPmlwReloadContext === "function") {
        await aicmReloadTaskLedgerContext();
      } else if (typeof loadContext === "function") {
        await loadContext();
      }

      state.screen = "task-ledger";
      render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "CSV取り込みに失敗しました。");
      render();
    }
  }

function handleRootClick(event) {
  // AICM_CHANGE_BUTTON_CLICK_TARGET_NORMALIZE_AXD_V1
  var aicmRawClickTarget = event.target;
  var aicmActionTarget = aicmRawClickTarget && aicmRawClickTarget.closest
    ? (aicmRawClickTarget.closest("[data-core-action]") || aicmRawClickTarget)
    : aicmRawClickTarget;

    var button = aicmActionTarget.closest("[data-core-action]");
    if (!button) {
      // AICM_AXU_R1C_SCREEN_ONLY_NAV_FALLBACK
      var aicmScreenOnlyTarget = aicmActionTarget && aicmActionTarget.closest
        ? aicmActionTarget.closest("[data-screen]")
        : null;

      if (aicmScreenOnlyTarget && aicmScreenOnlyTarget.getAttribute) {
        var aicmScreenOnlyName = String(aicmScreenOnlyTarget.getAttribute("data-screen") || "").trim();

        if (aicmScreenOnlyName) {
          state.screen = aicmScreenOnlyName;
          if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
          if (typeof render === "function") render();
          return;
        }
      }

      return;
    }

    var action = button.getAttribute("data-core-action") || "";

    // AICM_AXU_R1_MANAGER_MAJOR_TO_LEADER_V1
    if (action === "pmlw-major-leader-handoff") {
      aicmAxuR1OpenLeaderHandoffConfirm(button);
      return;
    }

    // AICM_RUNTIME_STATUS_PANEL_AXT_R9_R1_V1
    if (action === "worker-runtime-status-refresh") {
      aicmRuntimeStatusRefresh();
      return;
    }

    // AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1
    if (action === "worker-runtime-confirm") {
      confirmWorkerRuntimeRequestFromForm();
      return;
    }

    if (action === "worker-runtime-execute") {
      executeWorkerRuntimeConfirm();
      return;
    }

    if (action === "worker-runtime-cancel") {
      cancelWorkerRuntimeConfirm();
      return;
    }

            if (action === "task-ledger-fill-csv-template") {
      fillTaskLedgerCsvTemplate();
      return;
    }

        if (action === "task-ledger-csv-file-open") {
      openTaskLedgerCsvFilePicker();
      return;
    }

    if (action === "task-ledger-chatgpt-prompt") {
      handleTaskLedgerChatGptPrompt();
      return;
    }
if (action === "task-ledger-csv-preview") {
      previewTaskLedgerCsv();
      return;
    }

    if (action === "task-ledger-csv-import") {
      importTaskLedgerCsvToPmlwMajor();
      return;
    }
if (action === "task-ledger-create") {
      createTaskLedgerFromForm();
      return;
    }
if (action === "human-review-approve") {
      approveHumanReviewFromAction(typeof target !== "undefined" ? target : null);
      return;
    }

    if (action === "human-review-return") {
      returnHumanReviewFromAction(typeof target !== "undefined" ? target : null);
      return;
    }

    if (action === "department-update-select") {
      // AICM_CHANGE_BUTTON_TARGET_VAR_AXF_V1
      state.editingDepartmentId = button && button.getAttribute ? String(button.getAttribute("data-department-id") || "") : "";
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      if (typeof render === "function") render();
      return;
    }

    if (action === "department-update-clear") {
      state.editingDepartmentId = "";
      if (typeof render === "function") render();
      return;
    }

    if (action === "section-update-select") {
      // AICM_CHANGE_BUTTON_TARGET_VAR_AXF_V1
      state.editingSectionId = button && button.getAttribute ? String(button.getAttribute("data-section-id") || "") : "";
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      if (typeof render === "function") render();
      return;
    }

    if (action === "section-update-clear") {
      state.editingSectionId = "";
      if (typeof render === "function") render();
      return;
    }

    if (action === "company-update-save") {
      saveCompanyUpdateFromForm();
      return;
    }

    if (action === "department-update-save") {
      saveDepartmentUpdateFromForm();
      return;
    }

    if (action === "section-update-save") {
      saveSectionUpdateFromForm();
      return;
    }

    if (action === "org-update-confirm-execute") {
      executeAicmOrgUpdateConfirm();
      return;
    }

    if (action === "org-update-confirm-cancel") {
      cancelAicmOrgUpdateConfirm();
      return;
    }

    if (action === "company-edit-open") {
      state.screen = "company-edit";
      if (typeof render === "function") render();
      return;
    }

    if (action === "department-edit-pick") {
      var actionTarget = aicmActionTargetSafe(event, button);
      state.editingDepartmentId = actionTarget && actionTarget.getAttribute ? String(actionTarget.getAttribute("data-department-id") || "") : "";
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      if (typeof render === "function") render();
      return;
    }

    if (action === "section-edit-pick") {
      var actionTarget = aicmActionTargetSafe(event, button);
      state.editingSectionId = actionTarget && actionTarget.getAttribute ? String(actionTarget.getAttribute("data-section-id") || "") : "";
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      if (typeof render === "function") render();
      return;
    }

    if (action === "section-worker-update-open") {
      var actionTarget = aicmActionTargetSafe(event, button);
      state.editingSectionId = actionTarget && actionTarget.getAttribute ? String(actionTarget.getAttribute("data-section-id") || "") : (state.editingSectionId || "");
      state.workerPlacementSectionId = state.editingSectionId || "";
      state.screen = "worker-placement";
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      if (typeof render === "function") render();
      return;
    }

        // AICM_REMOVE_STALE_ROLE_SETTING_OPEN_AUC_AUF_V1: stale role setting open action removed

    

    if (action === "inline-worker-slot-add") {
      // AICM_PRESERVE_UNSAVED_WORKER_ADD_AXO_V1
      aicmAxoCaptureCurrentEditFormDraft();
      if (!state.inlineWorkerSlotCount) state.inlineWorkerSlotCount = 3;
      state.inlineWorkerSlotCount = Math.min(20, Number(state.inlineWorkerSlotCount || 3) + 1);
      if (typeof render === "function") render();
      return;
    }

    if (action === "task-ledger-csv-file-open") {
      aicmCsvOpenFileInput();
      return;
    }
    // AICM_AXU_CSV_R3_FIX1_LITERAL_NEWLINE_REPAIR_V1
    if (action === "task-ledger-csv-import") {
      aicmCsvImportLoadedReadBeforeImport();
      return;
    }
    if (action === "go") {
      // AICM_CLEAR_TRANSIENT_ON_GO_ASS_ASV
      if (typeof aicmClearTransientMessage === "function") {
        var nextScreenForMessageClear = "";
        try {
          nextScreenForMessageClear = button && button.getAttribute ? String(button.getAttribute("data-screen") || "") : "";
        } catch (_) {
          nextScreenForMessageClear = "";
        }

        if (
          nextScreenForMessageClear === "company-edit" ||
          nextScreenForMessageClear === "company-change" ||
          nextScreenForMessageClear === "company-update" ||
          nextScreenForMessageClear === "department-edit" ||
          nextScreenForMessageClear === "section-edit"
        ) {
          aicmClearTransientMessage();
        }
      }

      go(button.getAttribute("data-screen") || "dashboard");
      return;
    }


    if (action === "task-ledger-refresh") {
      aicmReloadTaskLedgerContext();
      return;
    }

    if (action === "reload") {
      loadContext();
      return;
    }
  }

  function handleRootChange(event) {
    var field = event.target;
    var fileKind = field.getAttribute("data-core-file") || "";
    if (fileKind === "task-ledger-csv") {
      aicmCsvReadSelectedFile(field);
      return;
    }

    var fieldName = field.getAttribute("data-core-field") || "";

    if (fieldName === "selectedCompanyId") {
      setSelectedCompany(field.value);
      render();
      return;
    }

    if (fieldName === "selectedDepartmentId") {
      setSelectedDepartment(field.value);
      render();
    }
  }

  function handleRootSubmit(event) {
    var form = event.target.closest("form[data-core-form]");
    if (!form) return;

    event.preventDefault();
    submitForm(form);
  }

  

function injectMinimalCss() {
    if (document.getElementById("aicm-production-core-css")) return;

    var style = document.createElement("style");
    style.id = "aicm-production-core-css";
    style.textContent = [
      ".aicm-core{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:980px;margin:0 auto;padding:20px;color:#172033;background:#f6f7fb;min-height:100vh}",
      ".aicm-core-header{padding:10px 0 18px}",
      ".aicm-core-header h1{font-size:32px;margin:0;letter-spacing:-.04em}",
      ".aicm-core-tabs{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 22px}",
      ".aicm-core button{border:1px solid #d8dee9;background:#eef2ff;border-radius:14px;padding:11px 15px;font-weight:800;color:#1f2a44;box-shadow:0 4px 10px rgba(31,42,68,.06)}",
      ".aicm-core-main{display:grid;gap:16px}",
      ".aicm-core-card{background:#fff;border:1px solid #e6eaf2;border-radius:22px;padding:20px;box-shadow:0 10px 24px rgba(15,23,42,.06)}",
      ".aicm-core-card h2{font-size:26px;margin:0 0 14px;letter-spacing:-.03em}",
      ".aicm-core label{display:block;font-weight:800;margin:12px 0 6px;color:#25324a}",
      ".aicm-core input,.aicm-core select,.aicm-core textarea{width:100%;box-sizing:border-box;border:1px solid #cfd6e4;border-radius:14px;padding:12px;font-size:16px;background:#fff}",
      ".aicm-core-message{border-radius:14px;padding:12px 14px;margin:12px 0;background:#f3f4f6}",
      ".aicm-core-message-ok{background:#ecfdf5;color:#047857}",
      ".aicm-core-message-error{background:#fef2f2;color:#b91c1c}",
      ".aicm-core-empty{color:#6b7280;margin:8px 0}",
      ".aicm-dashboard-grid{display:grid;gap:16px}",
      ".aicm-dashboard-main-grid{grid-template-columns:minmax(0,1fr)}",
      ".aicm-card-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}",
      ".aicm-eyebrow{margin:0 0 6px;color:#64748b;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}",
      ".aicm-selected-note{background:#f8fafc;border:1px solid #edf2f7;border-radius:14px;padding:10px 12px;margin:12px 0 0}",
      ".aicm-overview-block{display:grid;gap:14px}",
      ".aicm-overview-main strong{display:block;font-size:22px;letter-spacing:-.03em}",
      ".aicm-overview-main span{color:#5f6c80}",
      ".aicm-overview-list{display:grid;gap:10px;margin:0}",
      ".aicm-overview-list div{background:#f8fafc;border:1px solid #edf2f7;border-radius:14px;padding:10px 12px}",
      ".aicm-overview-list dt{font-size:12px;color:#64748b;font-weight:900}",
      ".aicm-overview-list dd{margin:4px 0 0;word-break:break-all}",
      ".aicm-empty-state{border:1px dashed #cbd5e1;background:#f8fafc;border-radius:18px;padding:18px}",
      ".aicm-empty-state strong{display:block;font-size:18px;margin-bottom:6px}",
      ".aicm-org-tree{display:grid;gap:12px}",
      ".aicm-org-node{border:1px solid #edf2f7;background:#fbfdff;border-radius:18px;padding:14px}",
      ".aicm-org-node-head{display:flex;align-items:center;gap:8px}",
      ".aicm-org-node-head strong{font-size:18px}",
      ".aicm-node-badge{display:inline-flex;align-items:center;border-radius:999px;background:#e0ecff;color:#1d4ed8;font-size:12px;font-weight:900;padding:4px 8px}",
      ".aicm-node-badge-section{background:#ecfdf5;color:#047857}",
      ".aicm-section-list{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:8px}",
      ".aicm-section-list li{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;background:#fff;border:1px solid #edf2f7;border-radius:14px;padding:10px}",
      ".aicm-section-list small{grid-column:2;color:#6b7280}",
      ".aicm-section-empty{margin-top:10px;color:#94a3b8;border:1px dashed #dbe3ef;border-radius:12px;padding:10px}",

      ".aicm-overview-count-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}",
      ".aicm-overview-count-row div{background:#f8fafc;border:1px solid #edf2f7;border-radius:14px;padding:12px}",
      ".aicm-overview-count-row dt{font-size:12px;color:#64748b;font-weight:900}",
      ".aicm-overview-count-row dd{font-size:22px;font-weight:900;margin:4px 0 0}",
      ".aicm-dashboard-action-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}",
      ".aicm-tree-toolbar{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 14px}",
      ".aicm-org-node-head button,.aicm-section-list button{margin-left:auto;padding:7px 10px;border-radius:10px;font-size:13px}",
      "@media(max-width:520px){.aicm-overview-count-row{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.aicm-overview-count-row div{padding:10px 8px}.aicm-overview-count-row dd{font-size:18px}.aicm-dashboard-action-row button,.aicm-tree-toolbar button{flex:1 1 44%}}",

      ".aicm-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}",
      ".aicm-ledger-list{display:grid;gap:12px}",
      ".aicm-ledger-row{border:1px solid #edf2f7;background:#fbfdff;border-radius:18px;padding:14px}",
      ".aicm-ledger-row-head{display:flex;align-items:center;gap:8px}",
      ".aicm-ledger-row-head strong{font-size:18px}",
      ".aicm-ledger-row-head em{margin-left:auto;color:#64748b;font-style:normal;font-weight:800}",
      ".aicm-ledger-meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:10px 0 0}",
      ".aicm-ledger-meta div{background:#f8fafc;border:1px solid #edf2f7;border-radius:12px;padding:8px}",
      ".aicm-ledger-meta dt{font-size:11px;color:#64748b;font-weight:900}",
      ".aicm-ledger-meta dd{margin:3px 0 0}",
      ".aicm-ledger-note{background:#fff;border:1px solid #edf2f7;border-radius:12px;padding:10px;margin:10px 0 0}",
      "@media(max-width:720px){.aicm-form-grid{grid-template-columns:1fr}.aicm-ledger-meta{grid-template-columns:repeat(2,minmax(0,1fr))}}",
      ".aicm-csv-preview{overflow:auto;border:1px solid #edf2f7;border-radius:14px;margin-top:14px}",
      ".aicm-csv-preview table{width:100%;border-collapse:collapse;background:#fff;font-size:13px}",
      ".aicm-csv-preview th,.aicm-csv-preview td{border-bottom:1px solid #edf2f7;padding:8px;text-align:left;vertical-align:top}",
      ".aicm-csv-preview tr.is-error td{background:#fff5f5;color:#991b1b}",
      ".aicm-csv-preview tr.is-valid td:first-child{font-weight:900}",
      ".aicm-csv-template{margin-top:14px;border:1px solid #edf2f7;background:#f8fafc;border-radius:14px;padding:12px}",
      ".aicm-csv-template summary{font-weight:900;cursor:pointer}",

      ".aicm-hidden-file{display:none}",
      ".aicm-csv-flow{display:grid;gap:12px;margin-top:12px}",
      ".aicm-csv-flow-step{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid #edf2f7;background:#f8fafc;border-radius:16px;padding:12px}",
      ".aicm-csv-flow-step span{display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:#e0ecff;color:#1d4ed8;font-weight:900}",
      ".aicm-csv-flow-step strong{display:block}",
      ".aicm-csv-flow-step p{margin:4px 0 0;color:#64748b;font-size:13px}",
      ".aicm-csv-flow-main{background:#eef2ff}",
      ".aicm-csv-file-name{border:1px solid #edf2f7;background:#fff;border-radius:14px;padding:10px 12px;min-width:0}",
      ".aicm-csv-file-name span{display:block;color:#64748b;font-size:12px;font-weight:900}",
      ".aicm-csv-file-name strong{display:block;word-break:break-all;margin-top:4px}",
      "@media(max-width:620px){.aicm-csv-flow-step{grid-template-columns:auto minmax(0,1fr)}.aicm-csv-flow-step button{grid-column:1 / -1}}",

      ".aicm-table-wrap{overflow:auto;border:1px solid #edf2f7;border-radius:16px;background:#fff}",
      ".aicm-core-table{width:100%;border-collapse:collapse;min-width:980px}",
      ".aicm-core-table th,.aicm-core-table td{border-bottom:1px solid #edf2f7;padding:10px 12px;text-align:left;vertical-align:top;font-size:13px}",
      ".aicm-core-table th{background:#f8fafc;color:#334155;font-weight:900}",
      ".aicm-core-table small{display:block;color:#64748b;margin-top:4px;line-height:1.45}",

      ".aicm-review-card{display:grid;gap:14px}",
      ".aicm-review-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}",
      ".aicm-review-meta{display:flex;flex-wrap:wrap;gap:8px;color:#64748b;font-size:13px}",
      ".aicm-review-meta span{background:#f8fafc;border:1px solid #e5e7eb;border-radius:999px;padding:5px 10px}",
      ".aicm-review-summary{display:grid;gap:8px}",
      ".aicm-review-summary h3{margin:6px 0 0;font-size:14px}",
      ".aicm-review-summary p{margin:0;color:#334155;white-space:pre-wrap}",

      ".aicm-org-update-row{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px;border:1px solid #e5e7eb;border-radius:16px;background:#f8fafc;margin-top:10px}",
      ".aicm-org-update-row p{margin:4px 0 0;color:#64748b}",

      ".aicm-confirm-card{display:grid;gap:14px}",
      ".aicm-confirm-list{display:grid;gap:10px}",
      ".aicm-confirm-row{padding:12px;border:1px solid #e5e7eb;border-radius:14px;background:#f8fafc}",
      ".aicm-confirm-row p{margin:4px 0 0;color:#334155;white-space:pre-wrap}",

      ".aicm-company-overview-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0}",
      ".aicm-company-overview-stat{padding:12px;border:1px solid #e5e7eb;border-radius:14px;background:#f8fafc}",
      ".aicm-company-overview-stat span{display:block;color:#64748b;font-size:13px;font-weight:700}",
      ".aicm-company-overview-stat strong{display:block;margin-top:4px;font-size:20px}",
      "@media(min-width:820px){.aicm-dashboard-main-grid{grid-template-columns:minmax(0,1fr) minmax(320px,.75fr)}}",
      "@media(max-width:720px){.aicm-core{padding:18px}.aicm-core-header h1{font-size:30px}.aicm-card-title-row{flex-direction:column}.aicm-core-tabs button{flex:1 1 auto}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function boot() {
    root = document.getElementById("aicm-root");

    if (!root) {
      root = document.createElement("div");
      root.id = "aicm-root";
      document.body.appendChild(root);
    }

    injectMinimalCss();

      root.addEventListener("change", function (event) {
    var target = event.target;
    if (target && target.getAttribute && target.getAttribute("data-core-file") === "task-ledger-csv") {
      readTaskLedgerCsvFile(target.files && target.files[0]);
    }
  });
root.addEventListener("click", handleRootClick);
    root.addEventListener("change", handleRootChange);
    root.addEventListener("submit", handleRootSubmit);

    writeStorage(STORAGE.ownerCivilizationId, state.ownerCivilizationId);

    render();
    loadContext();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
