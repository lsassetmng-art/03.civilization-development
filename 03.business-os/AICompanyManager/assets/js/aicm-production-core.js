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
    // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_CALL
    if (typeof aicmHydrateManagerMajorContextArraysR8M === "function") {
      aicmHydrateManagerMajorContextArraysR8M(
        typeof json !== "undefined" ? json :
        (typeof data !== "undefined" ? data :
        (typeof contextJson !== "undefined" ? contextJson :
        (typeof ctx !== "undefined" ? ctx : null)))
      );
    }
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


// AICM_R8Z_F_CANONICAL_CONTEXT_NORMALIZE_START
  function aicmR8ZFArrayFromContext(rawContext, targetContext, names) {
    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
    var target = targetContext && typeof targetContext === "object" ? targetContext : {};
    var current = state && state.context && typeof state.context === "object" ? state.context : {};

    for (var i = 0; i < names.length; i += 1) {
      var key = names[i];

      if (Array.isArray(raw[key])) return raw[key];
      if (Array.isArray(target[key])) return target[key];
      if (Array.isArray(current[key])) return current[key];
      if (Array.isArray(state && state[key])) return state[key];
    }

    return [];
  }

  function aicmNormalizePmlwContextR8ZF(rawContext, targetContext) {
    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
    var target = targetContext && typeof targetContext === "object" ? targetContext : {};

    if (!target || typeof target !== "object") {
      target = {};
    }

    var middleItems = aicmR8ZFArrayFromContext(raw, target, [
      "pmlw_middle_items",
      "pmlwMiddleItems",
      "leader_middle_items",
      "leaderMiddleItems"
    ]);

    var deliverableRequirements = aicmR8ZFArrayFromContext(raw, target, [
      "pmlw_deliverable_requirements",
      "pmlwDeliverableRequirements",
      "deliverable_requirements",
      "deliverableRequirements"
    ]);

    var workerWorkUnits = aicmR8ZFArrayFromContext(raw, target, [
      "pmlw_worker_work_units",
      "pmlwWorkerWorkUnits",
      "worker_work_units",
      "workerWorkUnits"
    ]);

    var workflowTree = aicmR8ZFArrayFromContext(raw, target, [
      "pmlw_workflow_tree",
      "pmlwWorkflowTree",
      "workflow_tree",
      "workflowTree"
    ]);

    target.pmlw_middle_items = middleItems;
    target.pmlwMiddleItems = middleItems;

    target.pmlw_deliverable_requirements = deliverableRequirements;
    target.pmlwDeliverableRequirements = deliverableRequirements;

    target.pmlw_worker_work_units = workerWorkUnits;
    target.pmlwWorkerWorkUnits = workerWorkUnits;

    target.pmlw_workflow_tree = workflowTree;
    target.pmlwWorkflowTree = workflowTree;

    if (state) {
      state.context = target;

      state.pmlw_middle_items = middleItems;
      state.pmlwMiddleItems = middleItems;

      state.pmlw_deliverable_requirements = deliverableRequirements;
      state.pmlwDeliverableRequirements = deliverableRequirements;

      state.pmlw_worker_work_units = workerWorkUnits;
      state.pmlwWorkerWorkUnits = workerWorkUnits;

      state.pmlw_workflow_tree = workflowTree;
      state.pmlwWorkflowTree = workflowTree;
    }

    return target;
  }

  if (typeof normalizeContext === "function" && !normalizeContext.__aicmR8ZF) {
    var aicmNormalizeContextBeforeR8ZF = normalizeContext;

    normalizeContext = function normalizeContext(rawContext) {
      var normalizedContext = aicmNormalizeContextBeforeR8ZF.apply(this, arguments);
      return aicmNormalizePmlwContextR8ZF(rawContext, normalizedContext);
    };

    normalizeContext.__aicmR8ZF = true;
  }

  if (typeof loadContext === "function" && !loadContext.__aicmR8ZF) {
    var aicmLoadContextBeforeR8ZF = loadContext;

    loadContext = async function loadContext() {
      var result = await aicmLoadContextBeforeR8ZF.apply(this, arguments);

      if (state && state.context) {
        aicmNormalizePmlwContextR8ZF(state.context, state.context);
      }

      return result;
    };

    loadContext.__aicmR8ZF = true;
  }
// AICM_R8Z_F_CANONICAL_CONTEXT_NORMALIZE_END


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
      '    <button type="button" data-core-action="task-ledger-open">部門別タスク台帳</button>',
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
    // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_CALL
    if (typeof aicmHydrateManagerMajorContextArraysR8M === "function") {
      aicmHydrateManagerMajorContextArraysR8M(
        typeof json !== "undefined" ? json :
        (typeof data !== "undefined" ? data :
        (typeof contextJson !== "undefined" ? contextJson :
        (typeof ctx !== "undefined" ? ctx : null)))
      );
    }
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
    if (typeof aicmR8zV10f4aIsSectionCreateScreen === "function" && aicmR8zV10f4aIsSectionCreateScreen()) {
      return ""; // AICM_R8Z_V10F4A_REVIEW_LIST_COMMON_NAV_AND_SECTION_WORKER_SOURCE_GUARD_WORKER_GUARD_CALL
    }

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
    return aicmPmlwCsvPromptText();
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
    // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_CALL
    if (typeof aicmHydrateManagerMajorContextArraysR8M === "function") {
      aicmHydrateManagerMajorContextArraysR8M(
        typeof json !== "undefined" ? json :
        (typeof data !== "undefined" ? data :
        (typeof contextJson !== "undefined" ? contextJson :
        (typeof ctx !== "undefined" ? ctx : null)))
      );
    }
    }

    if (typeof render === "function") {
      render();
    }
  }


function aicmPmlwCsvPromptText() {
    return [
      "あなたはAICompanyManagerの部長/Managerです。",
      "President方針を受けて、課長/Leaderへ渡す前段の「粗いManager大項目CSV」を作成してください。",
      "",
      "重要:",
      "- 出力はCSVのみ。説明文、Markdown、コードブロック、箇条書きは禁止。",
      "- 大項目は粗い業務領域にしてください。",
      "- 目安は20〜40行です。125行のような細かい粒度は禁止です。",
      "- 中項目、作業単位、関数名、DOM id、個別バグ修正、実装手順は書かないでください。",
      "- 課長/Leaderが後で中項目と作業単位へ分解する前提で書いてください。",
      "- 1行=1つのManager大項目です。",
      "- noteは短文にしてください。",
      "",
      "CSVヘッダー:",
      "department_name,section_name,major_item_name,major_item_description,assigned_leader_label,priority_code,due_date,note",
      "",
      "列ルール:",
      "- department_name: 部門名",
      "- section_name: 課名。未定なら空欄可",
      "- major_item_name: 粗い大項目名",
      "- major_item_description: 大項目の目的や範囲を1文で説明",
      "- assigned_leader_label: 課長/Leader候補。未定なら空欄可",
      "- priority_code: low / normal / high / urgent のいずれか",
      "- due_date: YYYY-MM-DD。未定なら空欄可",
      "- note: 補足。短文のみ",
      "",
      "粒度の良い例:",
      "開発部,UI課,AI企業業務開始導線の整備,President起点からManager大項目登録までの導線を整理する,,high,,課長分解前の粗い領域",
      "開発部,UI課,部門別タスク台帳のCSV運用整備,Manager大項目CSVの作成と取り込み運用を整える,,normal,,細かい実装手順は書かない",
      "開発部,API課,課長引き継ぎフローの整備,Manager大項目をLeaderへ安全に引き継ぐ流れを整備する,,high,,確認画面を含む",
      "",
      "細かすぎるため禁止の例:",
      "- rowsLengthのDEBUG表示確認",
      "- 特定関数のtry/catch追加",
      "- CSV due_date cast修正",
      "- リロードボタンのDOM id確認",
      "- node --checkの個別実行行",
      "",
      "上記ルールに従ってCSVのみ出力してください。"
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
      // AICM_V10L_C2G_B2_SIMPLE_MULTI_HANDOFF_OPEN_START
      var ids = [];

      function pushId(v) {
        var s = String(v === undefined || v === null ? "" : v).trim();
        if (s && ids.indexOf(s) < 0) ids.push(s);
      }

      function idFromElement(el) {
        if (!el || !el.getAttribute) return "";
        var attrs = [
          "data-pmlw-major-id",
          "data-major-id",
          "data-manager-major-id",
          "data-aicm-manager-major-work-item-id",
          "data-manager-major-work-item-id",
          "value"
        ];
        for (var i = 0; i < attrs.length; i += 1) {
          var v = el.getAttribute(attrs[i]);
          if (v) return String(v).trim();
        }
        return "";
      }

      function pushFromElement(el) {
        if (!el) return;
        pushId(idFromElement(el));
        if (el.closest) {
          pushId(idFromElement(el.closest("[data-pmlw-major-id]")));
          pushId(idFromElement(el.closest("[data-major-id]")));
          pushId(idFromElement(el.closest("[data-manager-major-id]")));
          pushId(idFromElement(el.closest("[data-aicm-manager-major-work-item-id]")));
        }
      }

      try {
        var keys = [
          "r8zMgrMajorCardSelectedMajorItemIds",
          "r8zMgrMajorCardSelectedIds",
          "selectedManagerMajorItemIds",
          "selectedMajorItemIds",
          "managerMajorSelectedIds"
        ];
        for (var k = 0; k < keys.length; k += 1) {
          var v = state && state[keys[k]];
          if (Array.isArray(v)) {
            for (var ai = 0; ai < v.length; ai += 1) pushId(v[ai]);
          } else if (v && typeof v === "object") {
            Object.keys(v).forEach(function (key) {
              if (v[key]) pushId(key);
            });
          }
        }
      } catch (_) {}

      try {
        if (typeof document !== "undefined" && document.querySelectorAll) {
          var checked = document.querySelectorAll(
            'input[data-core-action="r8z-mgr-major-card-toggle"]:checked,' +
            'input[data-major-id]:checked,' +
            'input[data-manager-major-id]:checked,' +
            '[data-core-action="r8z-mgr-major-card-toggle"][aria-pressed="true"],' +
            '[data-core-action="r8z-mgr-major-card-toggle"][data-selected="true"]'
          );
          for (var ci = 0; ci < checked.length; ci += 1) pushFromElement(checked[ci]);
        }
      } catch (_) {}

      if (!ids.length) pushFromElement(button);

      if (!ids.length) {
        throw new Error("Manager大項目IDを特定できません。");
      }

      var items = [];
      for (var ii = 0; ii < ids.length; ii += 1) {
        var row = aicmAxuR1FindMajorById(ids[ii]);
        if (!row) continue;
        var summary = aicmMajorItemSummaryR8O(row);
        items.push({
          id: ids[ii],
          row: row,
          title: summary.title,
          description: summary.description,
          leader: summary.leader,
          due: summary.due,
          priority: summary.priority,
          status: summary.status
        });
      }

      if (!items.length) {
        throw new Error("Manager大項目を特定できません。");
      }

      var payload = aicmAxuR1BuildLeaderHandoffPayload(items[0].row);
      payload.ids = items.map(function (item) { return item.id; });
      payload.items = items;
      payload.count = items.length;
      payload.majorId = items[0].id;

      if (items.length > 1) {
        payload.title = items[0].title + " ほか" + String(items.length - 1) + "件";
        payload.description = "複数のManager大項目を同じ引き渡し先へ送ります。";
      }

      aicmAxuR1ShowLeaderHandoffConfirm(payload);
      // AICM_V10L_C2G_B2_SIMPLE_MULTI_HANDOFF_OPEN_END
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


// AICM_R8_V6C_CLEAN_PENDING_MAJOR_HELPER_START
  function aicmIsPendingManagerMajorRowR8V6(row) {
    if (!row || typeof row !== "object") return false;

    var handoff = String(row.handoff_status_code || "").toLowerCase();
    var decomposition = String(row.decomposition_status_code || "").toLowerCase();
    var deleted = String(row.deleted_flag || row.is_deleted || "").toLowerCase();
    var archived = String(row.archived_flag || row.is_archived || "").toLowerCase();

    if (deleted === "true" || deleted === "1") return false;
    if (archived === "true" || archived === "1") return false;

    if (
      handoff === "archived" ||
      handoff === "deleted" ||
      handoff === "cancelled" ||
      handoff === "canceled" ||
      handoff === "sent" ||
      handoff === "handed_off" ||
      handoff === "completed" ||
      handoff === "done"
    ) {
      return false;
    }

    if (
      decomposition === "completed" ||
      decomposition === "complete" ||
      decomposition === "done"
    ) {
      return false;
    }

    return true;
  }
// AICM_R8_V6C_CLEAN_PENDING_MAJOR_HELPER_END


  

  // AICM_R8Z_V9F3_RESTORE_LEADER_HANDOFF_OPEN_CONFIRM_ONLY
  // Restore only the missing open-confirm entrypoint for data-core-action="pmlw-major-leader-handoff".
  // This function does not write DB and does not call any API.
  function aicmOpenLeaderHandoffConfirmR8S(ev, btn) {
    try {
      btn = btn || (typeof aicmActionTargetSafe === "function" ? aicmActionTargetSafe(ev, null) : null);
      if (!btn && ev && ev.target && typeof ev.target.closest === "function") {
        btn = ev.target.closest("[data-core-action]");
      }

      var majorId = "";
      if (btn && btn.getAttribute) {
        majorId = String(btn.getAttribute("data-major-id") || btn.getAttribute("data-manager-major-id") || "").trim();
      }

      if (!majorId && btn && btn.dataset) {
        majorId = String(btn.dataset.majorId || btn.dataset.managerMajorId || "").trim();
      }

      if (!majorId) {
        if (typeof setMessage === "function") setMessage("error", "課長へ送る対象のManager大項目IDを特定できません。");
        if (typeof render === "function") render();
        return;
      }

      var ctx = state && state.context && typeof state.context === "object" ? state.context : {};
      var rows = [];
      function addRows(value) {
        if (Array.isArray(value)) rows = rows.concat(value);
      }

      addRows(ctx.pmlw_major_items);
      addRows(ctx.manager_major_items);
      addRows(ctx.major_items);
      addRows(state && state.pmlw_major_items);
      addRows(state && state.manager_major_items);
      addRows(state && state.major_items);

      var row = null;
      for (var i = 0; i < rows.length; i += 1) {
        var candidate = rows[i] || {};
        var candidateId = String(
          candidate.aicm_manager_major_work_item_id ||
          candidate.manager_major_work_item_id ||
          candidate.major_work_item_id ||
          candidate.major_id ||
          candidate.id ||
          ""
        ).trim();

        if (candidateId === majorId) {
          row = candidate;
          break;
        }
      }

      row = row || {};

      var title = String(
        row.major_item_name ||
        row.task_name ||
        row.deliverable_name ||
        row.title ||
        "Manager大項目"
      ).trim();

      var leader = String(
        row.assigned_leader_label ||
        row.leader_robot_label ||
        row.responsible_robot_label ||
        row.responsible_role_code ||
        "課長/Leader"
      ).trim();

      state.managerMajorLeaderHandoffConfirm = {
        kind: "manager-major-leader-handoff",
        title: "課長へ送る確認",
        majorId: majorId,
        aicm_manager_major_work_item_id: majorId,
        major_item_name: title,
        targetTitle: title,
        leaderLabel: leader,
        leaderRaw: leader,
        row: row,
        endpoint: "/api/aicm/v2/manager-major/update",
        backScreen: "task-ledger",
        body: {
          owner_civilization_id: typeof aicmLeaderHandoffOwnerIdR8S === "function"
            ? aicmLeaderHandoffOwnerIdR8S(row)
            : ((state && state.ownerCivilizationId) || (state && state.owner_civilization_id) || (ctx && ctx.owner_civilization_id) || "00000000-0000-4000-8000-000000000001"),
          aicm_manager_major_work_item_id: majorId,
          assigned_leader_label: leader,
          decomposition_status_code: "assigned_to_leader",
          handoff_status_code: "handed_off",
          note: String(row.note || "").trim()
        }
      };

      state.screen = "task-ledger";

      if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
        aicmRenderTaskLedgerSafeR8V4("r8z_v9f3_open_confirm");
        return;
      }

      if (typeof render === "function") {
        render();
      }
    } catch (error) {
      try {
        if (typeof setMessage === "function") {
          setMessage("error", error && error.message ? error.message : "課長へ送る確認の表示に失敗しました。");
        }
        if (typeof render === "function") render();
      } catch (_) {}
    }
  }

// AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_HELPER_START
  function aicmLeaderHandoffTextR8S(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmLeaderHandoffOwnerIdR8S(payload) {
    var p = payload && typeof payload === "object" ? payload : {};
    if (p.owner_civilization_id) return aicmLeaderHandoffTextR8S(p.owner_civilization_id);
    if (p.ownerCivilizationId) return aicmLeaderHandoffTextR8S(p.ownerCivilizationId);
    if (state && state.ownerCivilizationId) return aicmLeaderHandoffTextR8S(state.ownerCivilizationId);
    if (state && state.owner_civilization_id) return aicmLeaderHandoffTextR8S(state.owner_civilization_id);
    if (state && state.context && state.context.owner_civilization_id) return aicmLeaderHandoffTextR8S(state.context.owner_civilization_id);
    if (state && state.context && state.context.ownerCivilizationId) return aicmLeaderHandoffTextR8S(state.context.ownerCivilizationId);
    if (typeof aicmHumanReviewOwnerId === "function") return aicmLeaderHandoffTextR8S(aicmHumanReviewOwnerId());
    return "00000000-0000-4000-8000-000000000001";
  }

  function aicmLeaderHandoffActionTargetR8S(ev, btn) {
    if (typeof aicmActionTargetSafe === "function") {
      var safeTarget = aicmActionTargetSafe(ev, btn);
      if (safeTarget && safeTarget.getAttribute) return safeTarget;
    }

    if (btn && btn.getAttribute) return btn;

    if (ev && ev.target) {
      if (ev.target.closest) {
        var closest = ev.target.closest("[data-core-action]");
        if (closest && closest.getAttribute) return closest;
      }

      if (ev.target.getAttribute) return ev.target;
    }

    return null;
  }

  function aicmLeaderHandoffMajorIdFromTargetR8S(target) {
    if (!target || !target.getAttribute) return "";
    return aicmLeaderHandoffTextR8S(
      target.getAttribute("data-major-id") ||
      target.getAttribute("data-pmlw-major-id") ||
      target.getAttribute("data-manager-major-id") ||
      ""
    );
  }

  function aicmFindMajorForLeaderHandoffR8S(majorId) {
    var id = aicmLeaderHandoffTextR8S(majorId);
    if (!id) return null;

    if (typeof aicmAxuR1FindMajorById === "function") {
      var found = aicmAxuR1FindMajorById(id);
      if (found) return found;
    }

    var ctx = state && state.context ? state.context : {};
    var rows = [];
    function add(list) {
      if (Array.isArray(list)) rows = rows.concat(list);
    }

    add(ctx.pmlw_major_items);
    add(ctx.pmlwMajorItems);
    add(ctx.manager_major_items);
    add(ctx.managerMajorItems);
    add(ctx.major_items);
    add(ctx.majorItems);

    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i] || {};
      var rowId = aicmLeaderHandoffTextR8S(
        row.aicm_manager_major_work_item_id ||
        row.manager_major_work_item_id ||
        row.majorId ||
        row.major_id ||
        row.id
      );
      if (rowId === id) return row;
    }

    return null;
  }

  function aicmLeaderHandoffSummaryR8S(row) {
    var base = null;
    if (typeof aicmMajorItemSummaryR8O === "function") {
      base = aicmMajorItemSummaryR8O(row);
    }

    var title = base && base.title ? base.title : (row && (row.major_item_name || row.deliverable_name || row.task_name)) || "Manager大項目";
    var description = base && base.description ? base.description : (row && (row.major_item_description || row.task_description || row.note)) || "";
    var due = base && base.due ? base.due : (row && row.due_date ? String(row.due_date) : "未設定");
    var status = base && base.status ? base.status : ((row && row.handoff_status_code) || "draft");
    var leaderRaw = aicmLeaderHandoffTextR8S(row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label));
    var leader = leaderRaw || "未設定（課へ引き継ぎ）";

    return {
      title: String(title),
      description: String(description),
      due: String(due),
      status: String(status),
      leader: String(leader),
      leaderRaw: leaderRaw
    };
  }

  function aicmOpenMajorLeaderHandoffConfirmR8S(ev, btn) {
    try {
      var target = aicmLeaderHandoffActionTargetR8S(ev, btn);
      var majorId = aicmLeaderHandoffMajorIdFromTargetR8S(target);
      if (!majorId) throw new Error("Manager大項目IDを特定できません。");

      var row = aicmFindMajorForLeaderHandoffR8S(majorId);
      if (!row) throw new Error("Manager大項目を特定できません。");

      var summary = aicmLeaderHandoffSummaryR8S(row);

      state.managerMajorLeaderHandoffConfirm = {
        majorId: majorId,
        title: summary.title,
        description: summary.description,
        leader: summary.leader,
        leaderRaw: summary.leaderRaw,
        due: summary.due,
        status: summary.status
      };

      state.screen = "task-ledger";
      setMessage("ok", "課長へ送る確認を表示しました。内容を確認してから確定してください。");
      render();

      setTimeout(function () {
        try {
          var card = document.getElementById("aicm-manager-major-leader-handoff-confirm");
          if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (_) {}
      }, 50);
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "課長へ送る確認を表示できません。");
      render();
    }
  }

  function aicmRenderMajorLeaderHandoffConfirmCardR8S() {
    var payload = state.managerMajorLeaderHandoffConfirm || null;
    if (!payload) return "";

    return [
      '<section id="aicm-manager-major-leader-handoff-confirm" class="aicm-core-card" style="border:2px solid #2563eb;">',
      '  <p class="aicm-eyebrow">課長へ送る確認</p>',
      '  <h2>このManager大項目を課長/Leaderへ送りますか？</h2>',
      // AICM_V10L_C2G_B2_SIMPLE_MULTI_HANDOFF_COUNT_RENDER
      payload.ids && payload.ids.length > 1 ? '  <p class="aicm-selected-note">対象: ' + escapeHtml(String(payload.ids.length)) + '件</p>' : '',
      '  <p class="aicm-selected-note">確定するとDBへ保存されます。ステータスを assigned_to_leader / handed_off に更新し、その後Leader中項目/成果物要件/Worker作業単位を自動作成します。</p>',
      '  <dl class="aicm-core-detail-list">',
      '    <dt>大項目</dt><dd>' + escapeHtml(payload.title || "") + '</dd>',
      '    <dt>課長/Leader</dt><dd>' + escapeHtml(payload.leader || "未設定") + '</dd>',
      '    <dt>状態</dt><dd>' + escapeHtml(payload.status || "") + '</dd>',
      '    <dt>期限</dt><dd>' + escapeHtml(payload.due || "未設定") + '</dd>',
      '  </dl>',
      payload.description ? '<p class="aicm-selected-note">' + escapeHtml(payload.description) + '</p>' : '',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="pmlw-major-leader-handoff-execute">課長へ送るを確定</button>',
      '    <button type="button" data-core-action="pmlw-major-leader-handoff-cancel">キャンセル</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function aicmCancelMajorLeaderHandoffConfirmR8S() {
    state.managerMajorLeaderHandoffConfirm = null;
    state.screen = "task-ledger";
    setMessage("ok", "課長へ送るをキャンセルしました。");
    render();
  }

  function aicmLeaderHandoffApiErrorTextR8S(response, json, rawText) {
    var parts = [];
    if (response && response.status) parts.push("HTTP " + response.status);
    if (json && json.result && json.result !== "ok") parts.push("result=" + String(json.result));
    if (json && json.error_message) parts.push(String(json.error_message));
    if (json && json.error) parts.push(String(json.error));
    if (json && json.message) parts.push(String(json.message));
    if (!parts.length && rawText) parts.push(String(rawText).slice(0, 500));
    if (!parts.length) parts.push("課長へ送るAPIでエラーが発生しました。");
    return parts.join(" / ");
  }

  async function aicmExecuteMajorLeaderHandoffConfirmR8S() {
    var payload = state.managerMajorLeaderHandoffConfirm || null;
    if (!payload || !payload.majorId) {
      setMessage("error", "課長へ送る対象がありません。");
      render();
      return;
    }

    // AICM_V10L_C2G_B2_SIMPLE_MULTI_HANDOFF_EXECUTE_START
    var aicmC2gHandoffIds = [];
    if (payload && Array.isArray(payload.ids)) {
      for (var aicmC2gHi = 0; aicmC2gHi < payload.ids.length; aicmC2gHi += 1) {
        var aicmC2gHv = String(payload.ids[aicmC2gHi] || "").trim();
        if (aicmC2gHv && aicmC2gHandoffIds.indexOf(aicmC2gHv) < 0) aicmC2gHandoffIds.push(aicmC2gHv);
      }
    }
    if (!aicmC2gHandoffIds.length && payload.majorId) aicmC2gHandoffIds.push(String(payload.majorId).trim());

    if (aicmC2gHandoffIds.length > 1) {
      var aicmC2gHandoffOk = 0;
      var aicmC2gHandoffNg = [];

      for (var aicmC2gHj = 0; aicmC2gHj < aicmC2gHandoffIds.length; aicmC2gHj += 1) {
        var aicmC2gMajorId = aicmC2gHandoffIds[aicmC2gHj];

        try {
          var body = {
            owner_civilization_id: ownerCivilizationId,
            aicm_manager_major_work_item_id: aicmC2gMajorId,
            decomposition_status_code: "assigned_to_leader",
            handoff_status_code: "handed_off"
          };

          if (payload.leaderRaw) {
            body.assigned_leader_label = payload.leaderRaw;
          }

          var response = await fetch("/api/aicm/v2/manager-major/update", {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify(body)
          });

          var rawText = await response.text();
          var json = null;
          try {
            json = rawText ? JSON.parse(rawText) : null;
          } catch (_) {
            json = null;
          }

          if (!response.ok || (json && json.result && json.result !== "ok")) {
            throw new Error(aicmLeaderHandoffApiErrorTextR8S(response, json, rawText));
          }

          if (typeof aicmRunLeaderAutoDecompositionAfterHandoffR8ZB === "function") {
            await aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(aicmC2gMajorId);
          }
          if (typeof aicmRunWorkerAutoExecutionAfterDecompositionR8ZI === "function") {
            await aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(aicmC2gMajorId);
          }

          aicmC2gHandoffOk += 1;
        } catch (aicmC2gErr) {
          aicmC2gHandoffNg.push(aicmC2gMajorId + ": " + (aicmC2gErr && aicmC2gErr.message ? aicmC2gErr.message : "失敗"));
        }
      }

      state.managerMajorLeaderHandoffConfirm = null;
      state.screen = "task-ledger";

      if (aicmC2gHandoffNg.length) {
        setMessage("error", "課長へ送る: " + String(aicmC2gHandoffOk) + "件成功 / " + String(aicmC2gHandoffNg.length) + "件失敗");
      } else {
        setMessage("ok", String(aicmC2gHandoffOk) + "件を課長へ送りました。");
      }

      if (typeof aicmReloadTaskLedgerContext === "function") {
        await aicmReloadTaskLedgerContext();
      } else {
        render();
      }
      return;
    }
    // AICM_V10L_C2G_B2_SIMPLE_MULTI_HANDOFF_EXECUTE_END

    var ownerCivilizationId = aicmLeaderHandoffOwnerIdR8S(payload);
    if (!ownerCivilizationId) {
      setMessage("error", "owner_civilization_idを特定できません。");
      render();
      return;
    }

    try {
      var body = {
        owner_civilization_id: ownerCivilizationId,
        aicm_manager_major_work_item_id: payload.majorId,
        decomposition_status_code: "assigned_to_leader",
        handoff_status_code: "handed_off"
      };

      if (payload.leaderRaw) {
        body.assigned_leader_label = payload.leaderRaw;
      }

      var response = await fetch("/api/aicm/v2/manager-major/update", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      });

      var rawText = await response.text();
      var json = null;
      try {
        json = rawText ? JSON.parse(rawText) : null;
      } catch (_) {
        json = null;
      }

      if (!response.ok || (json && json.result && json.result !== "ok")) {
        throw new Error(aicmLeaderHandoffApiErrorTextR8S(response, json, rawText));
      }

      state.managerMajorLeaderHandoffConfirm = null;
      state.screen = "task-ledger";
      setMessage("ok", "課長へ送信しました。");

      if (typeof aicmReloadTaskLedgerContext === "function") {
        
      // AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_CALL_START
      var aicmR8zBMajorIdForAuto = "";
      try {
        aicmR8zBMajorIdForAuto = aicmR8ZBText(
          (payload && (payload.majorId || payload.aicm_manager_major_work_item_id || payload.manager_major_work_item_id)) || ""
        );
      } catch (_) {
        aicmR8zBMajorIdForAuto = "";
      }

      var aicmR8zBAutoResult = await aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(aicmR8zBMajorIdForAuto);
      var aicmR8zIWorkerAutoResult = await aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(aicmR8zBMajorIdForAuto);
      if (typeof aicmWorkerAutoExecutionMessageR8ZI === "function") {
        setMessage("ok", aicmWorkerAutoExecutionMessageR8ZI(aicmR8zIWorkerAutoResult));
      }
      if (aicmR8zBAutoResult && aicmR8zBAutoResult.ok) {
        setMessage("ok", aicmR8zBAutoResult.message || "課長へ送信し、Leader自動分解を実行しました。");
      } else {
        setMessage(
          "error",
          "課長へ送信しましたが、Leader自動分解に失敗しました: " +
          (aicmR8zBAutoResult && aicmR8zBAutoResult.message ? aicmR8zBAutoResult.message : "原因不明")
        );
      }
      // AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_CALL_END

await aicmReloadTaskLedgerContext();
      } else {
        render();
      }
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "課長へ送る処理に失敗しました。");
      render();
    }
  }
// AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_HELPER_END


// AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1_START
  function aicmMajorItemPageSizeR8O() {
    return 20;
  }

  function aicmMajorItemCurrentPageR8O(totalRows) {
    var pageSize = aicmMajorItemPageSizeR8O();
    var total = Number(totalRows || 0);
    var totalPages = Math.max(1, Math.ceil(total / pageSize));
    var page = Number(state.managerMajorPage || 1);

    if (!Number.isFinite(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    state.managerMajorPage = page;
    return page;
  }

  function aicmMajorItemSetPageR8O(delta) {
    var current = Number(state.managerMajorPage || 1);
    if (!Number.isFinite(current) || current < 1) current = 1;
    state.managerMajorPage = current + Number(delta || 0);
    render();
  }

  function aicmMajorItemPriorityLabelR8O(code) {
    var map = {
      urgent: "緊急",
      high: "高",
      normal: "通常",
      low: "低"
    };
    return map[String(code || "")] || String(code || "normal");
  }

  function aicmMajorItemStatusLabelR8O(row) {
    var handoff = String(row && row.handoff_status_code || "");
    var decomposition = String(row && row.decomposition_status_code || "");

    if (handoff === "archived" || handoff === "deleted") return "削除済";
    if (handoff === "sent" || handoff === "handed_off") return "課長送付済";
    if (decomposition === "in_progress") return "分解中";
    if (decomposition === "done" || decomposition === "completed") return "分解済";
    return "未実行";
  }

  function aicmMajorItemSummaryR8O(row) {
    var title = row && (row.major_item_name || row.deliverable_name || row.task_name) || "Manager大項目";
    var description = row && (row.major_item_description || row.task_description || row.note) || "";
    var leader = row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label) || "未設定";
    var due = row && row.due_date ? String(row.due_date) : "未設定";
    var priority = aicmMajorItemPriorityLabelR8O(row && row.priority_code);
    var status = aicmMajorItemStatusLabelR8O(row);

    return {
      title: String(title),
      description: String(description),
      leader: String(leader),
      due: String(due),
      priority: String(priority),
      status: String(status)
    };
  }

  function aicmRenderMajorItemDeleteConfirmCardR8P() {
    var payload = state.managerMajorDeleteConfirm || null;
    if (!payload) return "";

    return [
      '<section class="aicm-core-card" style="border:2px solid #f97316;">',
      '  <p class="aicm-eyebrow">削除確認</p>',
      '  <h2>登録済み大項目を削除しますか？</h2>',
      // AICM_V10L_C2G_B2_SIMPLE_MULTI_DELETE_COUNT_RENDER
      payload.ids && payload.ids.length > 1 ? '  <p class="aicm-selected-note">対象: ' + escapeHtml(String(payload.ids.length)) + '件</p>' : '',
      '  <p class="aicm-selected-note">この操作は確認後にDBへ保存されます。物理DELETEではなく、既存APIで削除済み扱いにします。</p>',
      '  <dl class="aicm-core-detail-list">',
      '    <dt>大項目</dt><dd>' + escapeHtml(payload.title || "") + '</dd>',
      '    <dt>課長/Leader</dt><dd>' + escapeHtml(payload.leader || "未設定") + '</dd>',
      '    <dt>状態</dt><dd>' + escapeHtml(payload.status || "") + '</dd>',
      '    <dt>期限</dt><dd>' + escapeHtml(payload.due || "未設定") + '</dd>',
      '  </dl>',
      payload.description ? '<p class="aicm-selected-note">' + escapeHtml(payload.description) + '</p>' : '',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="pmlw-major-delete-execute">削除を確定</button>',
      '    <button type="button" data-core-action="pmlw-major-delete-cancel">キャンセル</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function aicmOpenMajorItemDeleteConfirmR8P(button) {
    try {
      // AICM_V10L_C2G_B2_SIMPLE_MULTI_DELETE_OPEN_START
      var ids = [];

      function pushId(v) {
        var s = String(v === undefined || v === null ? "" : v).trim();
        if (s && ids.indexOf(s) < 0) ids.push(s);
      }

      function idFromElement(el) {
        if (!el || !el.getAttribute) return "";
        var attrs = [
          "data-major-id",
          "data-manager-major-id",
          "data-pmlw-major-id",
          "data-aicm-manager-major-work-item-id",
          "data-manager-major-work-item-id",
          "value"
        ];
        for (var i = 0; i < attrs.length; i += 1) {
          var v = el.getAttribute(attrs[i]);
          if (v) return String(v).trim();
        }
        return "";
      }

      function pushFromElement(el) {
        if (!el) return;
        pushId(idFromElement(el));
        if (el.closest) {
          pushId(idFromElement(el.closest("[data-major-id]")));
          pushId(idFromElement(el.closest("[data-manager-major-id]")));
          pushId(idFromElement(el.closest("[data-pmlw-major-id]")));
          pushId(idFromElement(el.closest("[data-aicm-manager-major-work-item-id]")));
        }
      }

      try {
        var keys = [
          "r8zMgrMajorCardSelectedMajorItemIds",
          "r8zMgrMajorCardSelectedIds",
          "selectedManagerMajorItemIds",
          "selectedMajorItemIds",
          "managerMajorSelectedIds"
        ];
        for (var k = 0; k < keys.length; k += 1) {
          var v = state && state[keys[k]];
          if (Array.isArray(v)) {
            for (var ai = 0; ai < v.length; ai += 1) pushId(v[ai]);
          } else if (v && typeof v === "object") {
            Object.keys(v).forEach(function (key) {
              if (v[key]) pushId(key);
            });
          }
        }
      } catch (_) {}

      try {
        if (typeof document !== "undefined" && document.querySelectorAll) {
          var checked = document.querySelectorAll(
            'input[data-core-action="r8z-mgr-major-card-toggle"]:checked,' +
            'input[data-major-id]:checked,' +
            'input[data-manager-major-id]:checked,' +
            '[data-core-action="r8z-mgr-major-card-toggle"][aria-pressed="true"],' +
            '[data-core-action="r8z-mgr-major-card-toggle"][data-selected="true"]'
          );
          for (var ci = 0; ci < checked.length; ci += 1) pushFromElement(checked[ci]);
        }
      } catch (_) {}

      if (!ids.length) pushFromElement(button);

      if (!ids.length) {
        throw new Error("Manager大項目IDを特定できません。");
      }

      var items = [];
      for (var ii = 0; ii < ids.length; ii += 1) {
        var row = aicmAxuR1FindMajorById(ids[ii]);
        if (!row) continue;
        var summary = aicmMajorItemSummaryR8O(row);
        items.push({
          id: ids[ii],
          row: row,
          title: summary.title,
          description: summary.description,
          leader: summary.leader,
          due: summary.due,
          priority: summary.priority,
          status: summary.status
        });
      }

      if (!items.length) {
        throw new Error("Manager大項目を特定できません。");
      }

      state.managerMajorDeleteConfirm = {
        majorId: items[0].id,
        ids: items.map(function (item) { return item.id; }),
        items: items,
        count: items.length,
        title: items.length > 1 ? items[0].title + " ほか" + String(items.length - 1) + "件" : items[0].title,
        description: items.length > 1 ? "複数のManager大項目を削除済み扱いにします。" : items[0].description,
        leader: items[0].leader,
        due: items[0].due,
        priority: items[0].priority,
        status: items[0].status
      };

      state.screen = "task-ledger";
      setMessage("ok", "削除確認を表示しました。内容を確認してから確定してください。");
      render();
      // AICM_V10L_C2G_B2_SIMPLE_MULTI_DELETE_OPEN_END
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "削除確認を表示できません。");
      render();
    }
  }

  function aicmCancelMajorItemDeleteConfirmR8P() {
    state.managerMajorDeleteConfirm = null;
    setMessage("ok", "削除をキャンセルしました。");
    state.screen = "task-ledger";
    render();
  }

  async function aicmExecuteMajorItemDeleteConfirmR8P() {
    var payload = state.managerMajorDeleteConfirm || null;
    if (!payload || !payload.majorId) {
      setMessage("error", "削除確認対象がありません。");
      render();
      return;
    }

    try {
      var response = await fetch("/api/aicm/v2/manager-major/archive", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          aicm_manager_major_work_item_id: payload.majorId
        })
      });

      var json = null;
      try {
        json = await response.json();
      } catch (_) {
        json = null;
      }

      if (!response.ok || (json && json.result && json.result !== "ok")) {
        throw new Error(json && (json.error || json.message) ? (json.error || json.message) : "大項目の削除に失敗しました。");
      }

      state.managerMajorDeleteConfirm = null;
      setMessage("ok", "大項目を削除済みにしました。");
      await aicmReloadTaskLedgerContext();
      state.screen = "task-ledger";
      render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "大項目の削除に失敗しました。");
      render();
    }
  }
// AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1_END


  

  // AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_HELPER_START
  // Consolidated card-selection helpers for aicmRenderManagerMajorRows.
  // DB_WRITE=NO / API_POST=NO. These helpers only manage browser-side UI state.
  function aicmR8zMgrMajorCardState() {
    if (typeof state === "undefined" || !state) {
      return { selectedIds: {}, confirm: null };
    }

    if (!state.r8zMgrMajorCardSelection || typeof state.r8zMgrMajorCardSelection !== "object") {
      state.r8zMgrMajorCardSelection = { selectedIds: {}, confirm: null };
    }

    if (!state.r8zMgrMajorCardSelection.selectedIds || typeof state.r8zMgrMajorCardSelection.selectedIds !== "object") {
      state.r8zMgrMajorCardSelection.selectedIds = {};
    }

    return state.r8zMgrMajorCardSelection;
  }

  function aicmR8zMgrMajorCardRowId(row, index) {
    if (typeof aicmAxuR1MajorId === "function") {
      var existingId = aicmAxuR1MajorId(row);
      if (existingId) return String(existingId).trim();
    }

    return String(
      (row && (
        row.aicm_manager_major_work_item_id ||
        row.manager_major_work_item_id ||
        row.pmlw_major_item_id ||
        row.major_work_item_id ||
        row.major_item_id ||
        row.majorId ||
        row.major_id ||
        row.id
      )) ||
      ("row-" + String(typeof index === "number" ? index : 0))
    ).trim();
  }

  function aicmR8zMgrMajorCardTitle(row) {
    return String(
      (row && (
        row.major_item_name ||
        row.task_name ||
        row.deliverable_name ||
        row.title
      )) ||
      "Manager大項目"
    ).trim();
  }

  function aicmR8zMgrMajorCardIsSelectable(row) {
    if (typeof aicmIsPendingManagerMajorRowR8V6 === "function") {
      return !!aicmIsPendingManagerMajorRowR8V6(row);
    }

    var handoff = String((row && (row.handoff_status_code || row.handoff_status || row.leader_handoff_status_code)) || "").toLowerCase();
    var decomposition = String((row && (row.decomposition_status_code || row.work_status_code || row.status_code)) || "").toLowerCase();
    var deleted = String((row && (row.deleted_flag || row.is_deleted)) || "").toLowerCase();
    var archived = String((row && (row.archived_flag || row.is_archived)) || "").toLowerCase();

    if (deleted === "true" || deleted === "1") return false;
    if (archived === "true" || archived === "1") return false;

    var closed = {
      archived: true,
      deleted: true,
      cancelled: true,
      canceled: true,
      sent: true,
      handed_off: true,
      leader_handoff_done: true,
      submitted: true,
      delivered: true,
      completed: true,
      complete: true,
      done: true
    };

    if (closed[handoff]) return false;
    if (closed[decomposition]) return false;
    return true;
  }

  function aicmR8zMgrMajorCardIsSelected(id) {
    var bag = aicmR8zMgrMajorCardState();
    var selected = bag && bag.selectedIds && typeof bag.selectedIds === "object" ? bag.selectedIds : {};
    return !!(id && selected[id]);
  }

  function aicmR8zMgrMajorCardAllRows() {
    var ctx = state && state.context && typeof state.context === "object" ? state.context : {};
    var rows = [];

    function add(list) {
      if (Array.isArray(list)) rows = rows.concat(list);
    }

    add(ctx.pmlw_major_items);
    add(ctx.pmlwMajorItems);
    add(ctx.manager_major_items);
    add(ctx.managerMajorItems);
    add(ctx.major_items);
    add(ctx.majorItems);
    add(state && state.pmlw_major_items);
    add(state && state.pmlwMajorItems);
    add(state && state.manager_major_items);
    add(state && state.managerMajorItems);
    add(state && state.major_items);
    add(state && state.majorItems);

    var seen = {};
    var out = [];

    rows.forEach(function (row, index) {
      var id = aicmR8zMgrMajorCardRowId(row, index);
      if (!id || seen[id]) return;
      seen[id] = true;
      out.push(row);
    });

    return out;
  }

  function aicmR8zMgrMajorCardSelectedRows() {
    // AICM_V10L_C2G_B5R5_STALE_SELECTED_PRUNE_SELECTED_ROWS
    return aicmR8zMgrMajorCardAllRows().filter(function (row, index) {
      return aicmR8zMgrMajorCardIsSelectable(row) && aicmR8zMgrMajorCardIsSelected(aicmR8zMgrMajorCardRowId(row, index));
    });
  }

  function aicmR8zMgrMajorCardRenderCheckbox(row, index) {
    var id = aicmR8zMgrMajorCardRowId(row, index);
    var checked = aicmR8zMgrMajorCardIsSelected(id) ? " checked" : "";
    var disabled = aicmR8zMgrMajorCardIsSelectable(row) ? "" : " disabled";

    return [
      '<label class="aicm-selected-note" style="display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 12px;border:1px solid #dbe3f0;border-radius:12px;background:#f8fafc;font-size:14px;line-height:1;white-space:nowrap;">',
      '<input type="checkbox" style="width:18px;height:18px;min-width:18px;margin:0;" data-core-action="r8z-mgr-major-card-toggle" data-r8z-mgr-major-id="' + escapeHtml(id) + '"' + checked + disabled + '>',
      '選択',
      '</label>'
    ].join("");
  }

  
  // AICM_R8Z_MGR_MAJOR_CARD_C2B_PAYLOAD_VALIDATION_HELPERS_START
  // C2B is validation/payload preview only. DB_WRITE=NO / API_POST=NO.
  function aicmR8zC2bText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8zC2bFirstText(row, keys) {
    row = row && typeof row === "object" ? row : {};
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (row[key] !== null && typeof row[key] !== "undefined" && String(row[key]).trim() !== "") {
        return String(row[key]).trim();
      }
    }
    return "";
  }

  function aicmR8zC2bOwnerId(row) {
    row = row && typeof row === "object" ? row : {};

    return aicmR8zC2bText(
      row.owner_civilization_id ||
      row.ownerCivilizationId ||
      (state && state.ownerCivilizationId) ||
      (state && state.owner_civilization_id) ||
      (state && state.context && state.context.owner_civilization_id) ||
      (state && state.context && state.context.ownerCivilizationId) ||
      "00000000-0000-4000-8000-000000000001"
    );
  }

  function aicmR8zC2bLeaderRoute(row) {
    row = row && typeof row === "object" ? row : {};

    var leaderPlacementId = aicmR8zC2bFirstText(row, [
      "leader_placement_id",
      "assigned_leader_placement_id",
      "leader_robot_placement_id",
      "responsible_leader_placement_id"
    ]);

    var leaderId = aicmR8zC2bFirstText(row, [
      "assigned_leader_id",
      "leader_id",
      "leader_robot_id",
      "responsible_leader_id"
    ]);

    var leaderLabel = aicmR8zC2bFirstText(row, [
      "assigned_leader_label",
      "leader_robot_label",
      "responsible_robot_label",
      "responsible_role_code",
      "leader_label"
    ]);

    var sectionId = aicmR8zC2bFirstText(row, [
      "section_id",
      "aicm_section_id",
      "organization_id",
      "department_section_id"
    ]);

    var sectionLabel = aicmR8zC2bFirstText(row, [
      "section_name",
      "section_label",
      "organization_name",
      "organization_label"
    ]);

    var departmentId = aicmR8zC2bFirstText(row, [
      "department_id",
      "aicm_department_id"
    ]);

    var departmentLabel = aicmR8zC2bFirstText(row, [
      "department_name",
      "department_label"
    ]);

    var clear = !!(leaderPlacementId || leaderId || leaderLabel) && !!(sectionId || sectionLabel);

    return {
      clear: clear,
      leaderPlacementId: leaderPlacementId,
      leaderId: leaderId,
      leaderLabel: leaderLabel,
      sectionId: sectionId,
      sectionLabel: sectionLabel,
      departmentId: departmentId,
      departmentLabel: departmentLabel,
      displayLeader: leaderLabel || leaderPlacementId || leaderId || "",
      displaySection: sectionLabel || sectionId || "",
      displayDepartment: departmentLabel || departmentId || ""
    };
  }

  
  // AICM_R8Z_MGR_MAJOR_CARD_C2C_BATCH_SECTION_LEADER_ROUTE_HELPERS_START
  // C2C: selected major items share one batch section route. DB_WRITE=NO / API_POST=NO.
  function aicmR8zC2cAttr(target, name) {
    if (!target || !target.getAttribute) return "";
    return String(target.getAttribute(name) || "").trim();
  }

  
  
  function aicmR8zC2cBag() {
    var bag = null;

    if (typeof aicmR8zMgrMajorCardState === "function") {
      bag = aicmR8zMgrMajorCardState();
    }

    if (!bag || typeof bag !== "object") {
      if (state && typeof state === "object") {
        if (!state.r8zMgrMajorCardSelection || typeof state.r8zMgrMajorCardSelection !== "object") {
          state.r8zMgrMajorCardSelection = {};
        }
        bag = state.r8zMgrMajorCardSelection;
      } else {
        bag = {};
      }
    }

    if (state && typeof state === "object") {
      if (!state.r8zMgrMajorCardSelection || typeof state.r8zMgrMajorCardSelection !== "object") {
        state.r8zMgrMajorCardSelection = bag;
      }
      bag = state.r8zMgrMajorCardSelection;
    }

    if (!bag.handoffBatchRoute || typeof bag.handoffBatchRoute !== "object") {
      bag.handoffBatchRoute = {
        sectionId: "",
        sectionLabel: "",
        departmentId: "",
        departmentLabel: "",
        leaderPlacementId: "",
        leaderId: "",
        leaderLabel: "",
        routeApplied: false,
        routeSource: "c2d2-canonical"
      };
    }

    return bag;
  }


  
  
  function aicmR8zC2cChoice() {
    return aicmR8zC2cBag().handoffBatchRoute;
  }


  function aicmR8zC2cAsArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function aicmR8zC2cContext() {
    return state && state.context && typeof state.context === "object" ? state.context : {};
  }

  function aicmR8zC2cField(row, keys) {
    row = row && typeof row === "object" ? row : {};
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (row[key] !== null && typeof row[key] !== "undefined" && String(row[key]).trim() !== "") {
        return String(row[key]).trim();
      }
    }
    return "";
  }

  
  
  
  function aicmR8zC2d2LedgerDepartmentFromSelectedRows() {
    var rows = typeof aicmR8zMgrMajorCardSelectedRows === "function"
      ? aicmR8zMgrMajorCardSelectedRows()
      : [];

    var seen = {};
    var list = [];

    function field(row, keys) {
      row = row && typeof row === "object" ? row : {};
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (row[key] !== null && typeof row[key] !== "undefined" && String(row[key]).trim() !== "") {
          return String(row[key]).trim();
        }
      }
      return "";
    }

    rows.forEach(function (row) {
      var id = field(row, [
        "department_id",
        "aicm_department_id",
        "responsible_department_id",
        "assigned_department_id"
      ]);

      var label = field(row, [
        "department_name",
        "department_label",
        "responsible_department_name",
        "assigned_department_name"
      ]);

      if (!id && !label) return;

      var key = id || label;
      if (seen[key]) return;

      seen[key] = true;
      list.push({
        departmentId: id,
        departmentLabel: label || id
      });
    });

    if (list.length === 1) {
      return {
        ok: true,
        ambiguous: false,
        departmentId: list[0].departmentId,
        departmentLabel: list[0].departmentLabel,
        count: 1
      };
    }

    if (list.length > 1) {
      return {
        ok: false,
        ambiguous: true,
        departmentId: "",
        departmentLabel: "複数部門",
        count: list.length,
        departments: list
      };
    }

    return {
      ok: false,
      ambiguous: false,
      departmentId: "",
      departmentLabel: "",
      count: 0
    };
  }


  function aicmR8zC2cNormalizeSection(row, index, parentDepartment) {
    row = row && typeof row === "object" ? row : {};
    parentDepartment = parentDepartment && typeof parentDepartment === "object" ? parentDepartment : null;

    var sectionId = aicmR8zC2cField(row, [
      "section_id",
      "aicm_section_id",
      "organization_id",
      "department_section_id",
      "id"
    ]);

    var sectionLabel = aicmR8zC2cField(row, [
      "section_name",
      "section_label",
      "organization_name",
      "organization_label",
      "name",
      "label"
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

    if (parentDepartment) {
      if (!departmentId) {
        departmentId = aicmR8zC2cField(parentDepartment, [
          "department_id",
          "aicm_department_id",
          "organization_id",
          "id"
        ]);
      }

      if (!departmentLabel) {
        departmentLabel = aicmR8zC2cField(parentDepartment, [
          "department_name",
          "department_label",
          "organization_name",
          "name",
          "label"
        ]);
      }
    }

    sectionId = aicmR8zC2cText(sectionId);
    sectionLabel = aicmR8zC2cText(sectionLabel);
    departmentId = aicmR8zC2cText(departmentId);
    departmentLabel = aicmR8zC2cText(departmentLabel);

    if (!sectionId && sectionLabel) sectionId = "section-label-" + String(index);
    if (!sectionId || !sectionLabel) return null;

    if (sectionLabel === "課") return null;
    if (sectionLabel === "-") return null;

    var deptOnly = !!departmentLabel && !row.section_name && !row.section_label && !row.organization_name && !row.organization_label;
    if (deptOnly && !parentDepartment) return null;

    return {
      sectionId: sectionId,
      sectionLabel: sectionLabel,
      departmentId: departmentId,
      departmentLabel: departmentLabel
    };
  }


  
  
  
  function aicmR8zC2cSectionCandidates() {
    var ctx = aicmR8zC2cContext();

    function asRows(value) {
      return Array.isArray(value) ? value : [];
    }

    function deptRows() {
      return []
        .concat(asRows(ctx.departments))
        .concat(asRows(ctx.department_list))
        .concat(asRows(ctx.aicm_departments));
    }

    function nestedSectionsFromDepartment(dept) {
      var rows = []
        .concat(asRows(dept.sections))
        .concat(asRows(dept.section_list))
        .concat(asRows(dept.organizations))
        .concat(asRows(dept.children))
        .concat(asRows(dept.units));

      return rows.map(function (row, index) {
        return aicmR8zC2cNormalizeSection(row, index, dept);
      }).filter(Boolean);
    }

    var raw = [];

    raw = raw
      .concat(asRows(ctx.sections))
      .concat(asRows(ctx.section_list))
      .concat(asRows(ctx.aicm_sections));

    deptRows().forEach(function (dept) {
      raw = raw.concat(nestedSectionsFromDepartment(dept));
    });

    asRows(ctx.organizations)
      .concat(asRows(ctx.organization_list))
      .forEach(function (row, index) {
        row = row && typeof row === "object" ? row : {};
        var level = String(
          row.organization_level ||
          row.org_level ||
          row.level_code ||
          row.type_code ||
          row.organization_type ||
          ""
        ).toLowerCase();

        var sectionLike =
          level.indexOf("section") >= 0 ||
          level.indexOf("課") >= 0 ||
          !!row.section_name ||
          !!row.section_label ||
          !!row.parent_department_id ||
          !!row.parent_organization_id;

        var departmentLike =
          level.indexOf("department") >= 0 ||
          level.indexOf("部門") >= 0;

        if (sectionLike && !departmentLike) {
          raw.push(row);
        }
      });

    if (!raw.length && typeof aicmR8zMgrMajorCardSelectedRows === "function") {
      aicmR8zMgrMajorCardSelectedRows().forEach(function (row) {
        if (row && (row.section_name || row.section_label || row.section_id || row.aicm_section_id)) {
          raw.push(row);
        }
      });
    }

    var seen = {};
    var list = [];

    raw.forEach(function (row, index) {
      var section = row && row.sectionId && row.sectionLabel ? row : aicmR8zC2cNormalizeSection(row, index, null);
      if (!section) return;

      var key = section.sectionId || section.sectionLabel;
      if (!key || seen[key]) return;

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


  function aicmR8zC2cPlacementRole(row) {
    return String(
      aicmR8zC2cField(row, [
        "placement_role_code",
        "role_code",
        "assigned_role_code",
        "worker_role_code",
        "aicm_role_code",
        "placement_role_code_1",
        "placement_role_code_2",
        "placement_role_code_3",
        "role_label"
      ])
    ).toLowerCase();
  }

  function aicmR8zC2cIsLeaderPlacement(row) {
    var role = aicmR8zC2cPlacementRole(row);
    var label = String(
      aicmR8zC2cField(row, [
        "placement_role_label",
        "role_label",
        "internal_nickname",
        "display_name",
        "robot_display_name",
        "robot_model_name"
      ])
    ).toLowerCase();

    return role.indexOf("leader") >= 0 ||
      role.indexOf("課長") >= 0 ||
      label.indexOf("leader") >= 0 ||
      label.indexOf("課長") >= 0;
  }

  function aicmR8zC2cPlacementSectionId(row) {
    return aicmR8zC2cField(row, [
      "section_id",
      "aicm_section_id",
      "organization_id",
      "department_section_id",
      "assigned_section_id"
    ]);
  }

  function aicmR8zC2cNormalizeLeader(row, index) {
    row = row && typeof row === "object" ? row : {};
    var leaderPlacementId = aicmR8zC2cField(row, [
      "placement_id",
      "robot_placement_id",
      "leader_placement_id",
      "aicm_robot_placement_id",
      "id"
    ]);

    var leaderId = aicmR8zC2cField(row, [
      "robot_id",
      "leader_id",
      "assigned_leader_id",
      "worker_robot_id",
      "aiworker_robot_id"
    ]);

    var leaderLabel = aicmR8zC2cField(row, [
      "internal_nickname",
      "placement_label",
      "robot_display_name",
      "robot_model_name",
      "display_name",
      "name",
      "leader_label"
    ]);

    var sectionId = aicmR8zC2cPlacementSectionId(row);

    if (!leaderPlacementId && leaderLabel) leaderPlacementId = "leader-label-" + String(index);

    return {
      leaderPlacementId: leaderPlacementId,
      leaderId: leaderId,
      leaderLabel: leaderLabel || leaderPlacementId || leaderId || "Leader",
      sectionId: sectionId
    };
  }

  function aicmR8zC2cLeaderCandidatesForSection(sectionId) {
    var ctx = aicmR8zC2cContext();
    var source = []
      .concat(aicmR8zC2cAsArray(ctx.placements))
      .concat(aicmR8zC2cAsArray(ctx.robotPlacements))
      .concat(aicmR8zC2cAsArray(ctx.robot_placements))
      .concat(aicmR8zC2cAsArray(ctx.organizationPlacements))
      .concat(aicmR8zC2cAsArray(ctx.section_placements));

    var list = [];
    var seen = {};

    source.forEach(function (row, index) {
      if (!aicmR8zC2cIsLeaderPlacement(row)) return;

      var placementSectionId = aicmR8zC2cPlacementSectionId(row);
      if (sectionId && placementSectionId && placementSectionId !== sectionId) return;

      var leader = aicmR8zC2cNormalizeLeader(row, index);
      var key = leader.leaderPlacementId || leader.leaderId || leader.leaderLabel;
      if (!key || seen[key]) return;

      seen[key] = true;
      list.push(leader);
    });

    list.sort(function (a, b) {
      return String(a.leaderLabel || "").localeCompare(String(b.leaderLabel || ""), "ja");
    });

    return list;
  }

  function aicmR8zC2cFindSection(sectionId) {
    var sections = aicmR8zC2cSectionCandidates();
    for (var i = 0; i < sections.length; i += 1) {
      if (String(sections[i].sectionId || "") === String(sectionId || "")) return sections[i];
    }
    return null;
  }

  function aicmR8zC2cFindLeader(sectionId, leaderPlacementId) {
    var leaders = aicmR8zC2cLeaderCandidatesForSection(sectionId);
    for (var i = 0; i < leaders.length; i += 1) {
      if (String(leaders[i].leaderPlacementId || "") === String(leaderPlacementId || "")) return leaders[i];
    }
    return null;
  }

  
  
  
  function aicmR8zC2cApplySectionChoice(sectionId, sectionSnapshot) {
    var bag = aicmR8zC2cBag();
    var section = sectionSnapshot && typeof sectionSnapshot === "object"
      ? sectionSnapshot
      : aicmR8zC2cFindSection(sectionId);

    if (!section) {
      return null;
    }

    var ledgerDept = typeof aicmR8zC2d2LedgerDepartmentFromSelectedRows === "function"
      ? aicmR8zC2d2LedgerDepartmentFromSelectedRows()
      : { ok: false, ambiguous: false, departmentId: "", departmentLabel: "" };

    var departmentId = ledgerDept.ok
      ? ledgerDept.departmentId
      : aicmR8zC2cText(section.departmentId || "");

    var departmentLabel = ledgerDept.ok
      ? ledgerDept.departmentLabel
      : aicmR8zC2cText(section.departmentLabel || "");

    if (ledgerDept.ambiguous) {
      departmentLabel = "複数部門";
      departmentId = "";
    }

    bag.handoffBatchRoute = {
      sectionId: aicmR8zC2cText(section.sectionId || sectionId),
      sectionLabel: aicmR8zC2cText(section.sectionLabel || ""),
      departmentId: departmentId,
      departmentLabel: departmentLabel,
      departmentSource: ledgerDept.ok ? "selected-ledger-row" : "section-candidate",
      departmentAmbiguous: !!ledgerDept.ambiguous,
      leaderPlacementId: "",
      leaderId: "",
      leaderLabel: "",
      routeApplied: true,
      routeAppliedAt: Date.now(),
      routeSource: "c2d2-ledger-department-section-select"
    };

    var leaders = aicmR8zC2cLeaderCandidatesForSection(bag.handoffBatchRoute.sectionId);
    if (leaders.length === 1) {
      bag.handoffBatchRoute.leaderPlacementId = leaders[0].leaderPlacementId;
      bag.handoffBatchRoute.leaderId = leaders[0].leaderId;
      bag.handoffBatchRoute.leaderLabel = leaders[0].leaderLabel;
    }

    return bag.handoffBatchRoute;
  }


  
  
  function aicmR8zC2cApplyLeaderChoice(leaderPlacementId) {
    var bag = aicmR8zC2cBag();
    var choice = bag.handoffBatchRoute || {};
    var leader = aicmR8zC2cFindLeader(choice.sectionId, leaderPlacementId);

    if (leader) {
      choice.leaderPlacementId = leader.leaderPlacementId;
      choice.leaderId = leader.leaderId;
      choice.leaderLabel = leader.leaderLabel;
      choice.routeApplied = true;
      choice.routeAppliedAt = Date.now();
      choice.routeSource = "c2d2-canonical-leader-select";
    }

    bag.handoffBatchRoute = choice;
    return choice;
  }


  
  
  function aicmR8zC2cClearRouteChoice() {
    var bag = aicmR8zC2cBag();
    bag.handoffBatchRoute = {
      sectionId: "",
      sectionLabel: "",
      departmentId: "",
      departmentLabel: "",
      departmentSource: "",
      departmentAmbiguous: false,
      leaderPlacementId: "",
      leaderId: "",
      leaderLabel: "",
      routeApplied: false,
      routeSource: "c2d2-canonical-cleared"
    };
    return bag.handoffBatchRoute;
  }


  
  
  
  function aicmR8zC2cEffectiveRoute() {
    var choice = aicmR8zC2cChoice();

    var sectionId = aicmR8zC2cText(choice.sectionId || "");
    var sectionLabel = aicmR8zC2cText(choice.sectionLabel || "");
    var departmentId = aicmR8zC2cText(choice.departmentId || "");
    var departmentLabel = aicmR8zC2cText(choice.departmentLabel || "");

    if (sectionId && !sectionLabel) {
      var foundSection = aicmR8zC2cFindSection(sectionId);
      if (foundSection) {
        sectionLabel = aicmR8zC2cText(foundSection.sectionLabel || "");
      }
    }

    if (!departmentLabel && typeof aicmR8zC2d2LedgerDepartmentFromSelectedRows === "function") {
      var ledgerDept = aicmR8zC2d2LedgerDepartmentFromSelectedRows();
      if (ledgerDept.ok) {
        departmentId = ledgerDept.departmentId;
        departmentLabel = ledgerDept.departmentLabel;
      } else if (ledgerDept.ambiguous) {
        departmentId = "";
        departmentLabel = "複数部門";
      }
    }

    var leaders = sectionId ? aicmR8zC2cLeaderCandidatesForSection(sectionId) : [];
    var leaderPlacementId = aicmR8zC2cText(choice.leaderPlacementId || "");
    var leaderId = aicmR8zC2cText(choice.leaderId || "");
    var leaderLabel = aicmR8zC2cText(choice.leaderLabel || "");

    if (!leaderPlacementId && !leaderId && !leaderLabel && leaders.length === 1) {
      leaderPlacementId = leaders[0].leaderPlacementId;
      leaderId = leaders[0].leaderId;
      leaderLabel = leaders[0].leaderLabel;
    }

    return {
      clear: !!sectionId && !!departmentLabel && departmentLabel !== "複数部門" && !!(leaderPlacementId || leaderId || leaderLabel) && leaders.length > 0,
      sectionId: sectionId,
      sectionLabel: sectionLabel,
      departmentId: departmentId,
      departmentLabel: departmentLabel,
      departmentSource: choice.departmentSource || "",
      departmentAmbiguous: !!choice.departmentAmbiguous || departmentLabel === "複数部門",
      leaderPlacementId: leaderPlacementId,
      leaderId: leaderId,
      leaderLabel: leaderLabel,
      leaderCount: leaders.length,
      displayDepartment: departmentLabel || "-",
      displaySection: sectionLabel || sectionId || "-",
      displayLeader: leaderLabel || leaderPlacementId || leaderId || "-",
      routeApplied: !!choice.routeApplied,
      routeAppliedAt: choice.routeAppliedAt || null,
      routeSource: choice.routeSource || ""
    };
  }


  function aicmR8zC2cText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  
  
  
  
  
  function aicmR8zC2cRenderRoutePicker() {
  // AICM_R8Z_MGR_MAJOR_CARD_C2D12_LEADER_GENERIC_OPTION_FILTER_START
  // Keep route picker as the single UI source.
  // Filter only generic Leader role labels from rendered option HTML.
  // No DB write. No API POST. No fetch.
  function aicmC2d12StripTags(value) {
    return String(value == null ? "" : value)
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#x2F;/g, "/")
      .replace(/&#47;/g, "/")
      .trim();
  }

  function aicmC2d12NormalizeLeaderOption(value) {
    return aicmC2d12StripTags(value)
      .replace(/[\s　]+/g, "")
      .toLowerCase();
  }

  function aicmC2d12IsGenericLeaderOption(label, attrs) {
    var visible = aicmC2d12StripTags(label);
    var normalized = aicmC2d12NormalizeLeaderOption(label);
    var normalizedAttrs = aicmC2d12NormalizeLeaderOption(attrs);

    if (!normalized) return false;

    // Placeholder must stay.
    if (visible.indexOf("選択してください") >= 0) return false;
    if (visible.indexOf("Leaderを選択") >= 0) return false;
    if (visible.indexOf("課長を選択") >= 0) return false;

    if (normalized === "leader") return true;
    if (normalized === "課長") return true;
    if (normalized === "課長/leader") return true;
    if (normalized === "leader/課長") return true;
    if (normalized === "section_leader") return true;
    if (normalized === "-") return true;
    if (normalized === "未設定") return true;

    // Keep real nicknames such as ガチ.
    // Remove only if both value/label are generic role-ish.
    if (normalizedAttrs.indexOf('value="leader"') >= 0 && normalized === "leader") return true;
    if (normalizedAttrs.indexOf("value='leader'") >= 0 && normalized === "leader") return true;

    return false;
  }

  function aicmC2d12FilterGenericLeaderOptions(html) {
    if (typeof html !== "string") return html;

    return html.replace(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi, function (match, attrs, label) {
      if (aicmC2d12IsGenericLeaderOption(label, attrs)) {
        return "";
      }
      return match;
    });
  }

  var aicmC2d12Args = arguments;
  var aicmC2d12Html = (function () {

    var sections = aicmR8zC2cSectionCandidates();
    var choice = aicmR8zC2cChoice();
    var selectedSectionId = aicmR8zC2cText(choice.sectionId || "");
    var leaders = selectedSectionId ? aicmR8zC2cLeaderCandidatesForSection(selectedSectionId) : [];
    var ledgerDept = typeof aicmR8zC2d2LedgerDepartmentFromSelectedRows === "function"
      ? aicmR8zC2d2LedgerDepartmentFromSelectedRows()
      : { ok: false, ambiguous: false, departmentLabel: "" };

    var sectionOptions = ['<option value="">課を選択してください</option>'].concat(
      sections.map(function (section) {
        var selected = selectedSectionId && section.sectionId === selectedSectionId ? " selected" : "";
        var departmentLabelForDisplay = ledgerDept.ok ? ledgerDept.departmentLabel : (section.departmentLabel || "");
        var label = (departmentLabelForDisplay ? departmentLabelForDisplay + " / " : "") + section.sectionLabel;
        return [
          '<option',
          ' value="' + escapeHtml(section.sectionId) + '"',
          selected,
          ' data-section-id="' + escapeHtml(section.sectionId || "") + '"',
          ' data-section-label="' + escapeHtml(section.sectionLabel || "") + '"',
          ' data-department-id="' + escapeHtml(ledgerDept.ok ? ledgerDept.departmentId : (section.departmentId || "")) + '"',
          ' data-department-label="' + escapeHtml(ledgerDept.ok ? ledgerDept.departmentLabel : (section.departmentLabel || "")) + '"',
          '>',
          escapeHtml(label),
          '</option>'
        ].join("");
      })
    ).join("");

    var departmentHint = "";
    if (ledgerDept.ok) {
      departmentHint = '<p class="aicm-selected-note">部門は選択済み台帳行から取得: ' + escapeHtml(ledgerDept.departmentLabel) + '</p>';
    } else if (ledgerDept.ambiguous) {
      departmentHint = '<p class="aicm-selected-note">選択済み台帳行の部門が複数あります。対象大項目の部門を揃えてください。</p>';
    } else {
      departmentHint = '<p class="aicm-selected-note">部門は台帳行から取得します。台帳行に部門がない場合は課候補の情報を使います。</p>';
    }

    var sectionSelectHtml = sections.length
      ? [
          '<div class="aicm-form-row" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">',
          '  <label class="aicm-selected-note" for="aicm-r8z-mgr-major-card-route-section-select">課</label>',
          '  <select id="aicm-r8z-mgr-major-card-route-section-select" data-r8z-mgr-major-card-route-section-select="1" style="min-width:260px;max-width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;">' + sectionOptions + '</select>',
          '  <button type="button" data-core-action="r8z-mgr-major-card-route-apply-section">課を適用</button>',
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
        '  <label class="aicm-selected-note" for="aicm-r8z-mgr-major-card-route-leader-select">Leader</label>',
        '  <select id="aicm-r8z-mgr-major-card-route-leader-select" data-r8z-mgr-major-card-route-leader-select="1" style="min-width:260px;max-width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;">' + leaderOptions + '</select>',
        '  <button type="button" data-core-action="r8z-mgr-major-card-route-apply-leader">Leaderを適用</button>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-core-card" data-r8z-mgr-major-card-route-picker="1" style="margin:12px 0;border:1px solid #c7d2fe;">',
      '  <p class="aicm-eyebrow">引き渡し先 一括選択</p>',
      '  <h4>選択済み大項目をまとめて送る課を選択</h4>',
      '  <p class="aicm-selected-note">大項目ごとの個別課選択は行いません。ここで選んだ課/Leaderを、選択済み大項目すべてに適用します。</p>',
      departmentHint,
      sectionSelectHtml,
      '  <h4>Leader</h4>',
      leaderSelectHtml,
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="r8z-mgr-major-card-route-clear">引き渡し先を解除</button>',
      '  </div>',
      '</div>'
    ].join("");
  
  }).apply(this, aicmC2d12Args);

  return aicmC2d12FilterGenericLeaderOptions(aicmC2d12Html);
  // AICM_R8Z_MGR_MAJOR_CARD_C2D12_LEADER_GENERIC_OPTION_FILTER_END
}


  // AICM_R8Z_MGR_MAJOR_CARD_C2C_BATCH_SECTION_LEADER_ROUTE_HELPERS_END


  
  
  
  function aicmR8zC2bBuildLeaderHandoffPayload(row, index) {
    row = row && typeof row === "object" ? row : {};

    var majorId = typeof aicmR8zMgrMajorCardRowId === "function"
      ? aicmR8zMgrMajorCardRowId(row, index)
      : "";

    var route = typeof aicmR8zC2cEffectiveRoute === "function"
      ? aicmR8zC2cEffectiveRoute()
      : { sectionId: "", leaderPlacementId: "", leaderId: "", displayLeader: "" };

    var payload = {
      owner_civilization_id: aicmR8zC2bOwnerId(row),
      aicm_manager_major_work_item_id: majorId,
      assigned_leader_label: route.displayLeader && route.displayLeader !== "-" ? route.displayLeader : "",
      decomposition_status_code: "assigned_to_leader",
      handoff_status_code: "handed_off",
      note: aicmR8zC2bText(row.note || "")
    };

    if (route.departmentId) payload.department_id = route.departmentId;
    if (route.sectionId) payload.section_id = route.sectionId;
    if (route.leaderPlacementId) payload.leader_placement_id = route.leaderPlacementId;
    if (route.leaderId) payload.assigned_leader_id = route.leaderId;

    return payload;
  }


  
  
  
  
  function aicmR8zC2bValidateLeaderHandoffRows(rows) {
    rows = Array.isArray(rows) ? rows : [];

    var errors = [];
    var items = [];
    var payloads = [];
    var route = typeof aicmR8zC2cEffectiveRoute === "function"
      ? aicmR8zC2cEffectiveRoute()
      : { clear: false, leaderCount: 0, displayLeader: "", displaySection: "", displayDepartment: "" };

    if (!rows.length) {
      errors.push("対象の大項目を選択してください。");
    }

    if (route.departmentAmbiguous) {
      errors.push("選択済み大項目の部門が複数あります。対象大項目の部門を揃えてください。");
    }

    if (!route.displayDepartment || route.displayDepartment === "-") {
      errors.push("台帳行から引き渡し先部門を特定できません。");
    }

    if (!route.sectionId) {
      errors.push("引き渡し先の課を一括選択してください。");
    } else if (route.leaderCount === 0) {
      errors.push("選択した課にLeaderが配置されていません。");
    } else if (route.leaderCount > 1 && !route.leaderPlacementId && !route.leaderId && (!route.leaderLabel || route.leaderLabel === "-")) {
      errors.push("選択した課にLeaderが複数います。Leaderを1人選択してください。");
    } else if (!route.clear) {
      errors.push("引き渡し先の課/Leaderが未確定です。");
    }

    rows.forEach(function (row, index) {
      var title = typeof aicmR8zMgrMajorCardTitle === "function"
        ? aicmR8zMgrMajorCardTitle(row)
        : "Manager大項目";

      var id = typeof aicmR8zMgrMajorCardRowId === "function"
        ? aicmR8zMgrMajorCardRowId(row, index)
        : "";

      var selectable = typeof aicmR8zMgrMajorCardIsSelectable === "function"
        ? aicmR8zMgrMajorCardIsSelectable(row)
        : true;

      if (!id) {
        errors.push(title + ": Manager大項目IDを特定できません。");
      }

      if (!selectable) {
        errors.push(title + ": すでに引渡し済み、完了、削除、または対象外です。");
      }

      var payload = aicmR8zC2bBuildLeaderHandoffPayload(row, index);

      items.push({
        id: id,
        title: title,
        route: route,
        payload: payload
      });

      payloads.push(payload);
    });

    return {
      ok: errors.length === 0,
      errors: errors,
      items: items,
      payloads: payloads,
      route: route,
      endpoint: "/api/aicm/v2/manager-major/update"
    };
  }


  // AICM_R8Z_MGR_MAJOR_CARD_C2B_PAYLOAD_VALIDATION_HELPERS_END


  
  
  
  
  
  function aicmR8zMgrMajorCardRenderConfirm() {
    // AICM_V10L_C2G_B5R1_MIN_ROUTE_PICKER_GUARD: route picker is handoff only; delete confirm must not show it.
    var bag = aicmR8zMgrMajorCardState();
    var confirm = bag.confirm || null;

    if (!confirm || !Array.isArray(confirm.items) || !confirm.items.length) {
      return "";
    }

    var liveValidation = confirm.kind === "leader-handoff" && typeof aicmR8zC2bValidateLeaderHandoffRows === "function"
      ? aicmR8zC2bValidateLeaderHandoffRows(aicmR8zMgrMajorCardSelectedRows())
      : null;

    if (liveValidation) {
      confirm.ok = liveValidation.ok;
      confirm.errors = liveValidation.errors || [];
      confirm.items = liveValidation.items || confirm.items;
      confirm.payloads = liveValidation.payloads || [];
      confirm.route = liveValidation.route || {};
      confirm.endpoint = liveValidation.endpoint || confirm.endpoint;
      bag.confirm = confirm;
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
      ? ((confirm && confirm.kind === "leader-handoff" && typeof aicmR8zC2cRenderRoutePicker === "function") ? aicmR8zC2cRenderRoutePicker() : "")
      : "";


    var routeApplyDebugData = state && state.r8zMgrMajorCardRouteApplyDebug
      ? state.r8zMgrMajorCardRouteApplyDebug
      : null;

    var routeApplyDebugHtml = routeApplyDebugData
      ? [
        ].join("")
      : [
        ].join("");


    var handlerEntryDebugData = state && state.r8zMgrMajorCardHandlerEntryDebug
      ? state.r8zMgrMajorCardHandlerEntryDebug
      : null;

    var handlerEntryDebugHtml = handlerEntryDebugData
      ? [
        ].join("")
      : [
        ].join("");

    // AICM_V10L_C2G_B5R4P_SECOND_CONFIRM_PINPOINT_SUMMARY
    var summaryHtml = confirm && confirm.kind === "delete"
      ? ""
      : [
          '<div class="aicm-core-card" style="margin:12px 0;">',
          '<p class="aicm-eyebrow">一括引き渡し先</p>',
          '<div class="aicm-selected-note">部門: ' + escapeHtml(route.displayDepartment || "-") + '</div>',
          '<div class="aicm-selected-note">課: ' + escapeHtml(route.displaySection || "-") + '</div>',
          '<div class="aicm-selected-note">Leader: ' + escapeHtml(route.displayLeader || "-") + '</div>',
          route.routeApplied ? '<div class="aicm-selected-note">適用済み</div>' : '',
          '</div>'
        ].join("");

    var itemHtml = confirm.items.map(function (item) {
      return '<li><strong>' + escapeHtml(item.title || item.id || "Manager大項目") + '</strong></li>';
    }).join("");

    // AICM_V10L_C2G_B5R4P_SECOND_CONFIRM_PINPOINT_ERRORHTML
    var errorHtml = hasErrors
      ? '<div class="aicm-core-card" style="border:1px solid #ef4444;background:#fff7f7;margin:12px 0;"><p class="aicm-eyebrow">実行前チェック</p><ul class="aicm-selected-note">' + errors.map(function (message) { return '<li>' + escapeHtml(message) + '</li>'; }).join("") + '</ul></div>'
      : "";

    // AICM_V10L_C2G_B5R4P_SECOND_CONFIRM_PINPOINT_PAYLOAD_PREVIEW
    var payloadPreviewHtml = "";

    var aicmB5r2ConfirmHtml = [
      '<div class="aicm-core-card" data-r8z-mgr-major-confirm="1" style="margin-top:12px;border:1px solid #f59e0b;">',
      '  <p class="aicm-eyebrow">確認</p>',
      '  <h3>' + escapeHtml(confirm.title || "確認") + '</h3>',
      '  <p class="aicm-selected-note">endpoint: ' + escapeHtml(confirm.endpoint || "/api/aicm/v2/manager-major/update") + '</p>',
      routePickerHtml,
      routeApplyDebugHtml,
      handlerEntryDebugHtml,
      summaryHtml,
      '  <p class="aicm-eyebrow">対象大項目</p>',
      '  <ul class="aicm-selected-note">' + itemHtml + '</ul>',
      errorHtml,
      payloadPreviewHtml,
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="r8z-mgr-major-card-confirm-yes"' + yesDisabled + yesStyle + '>Yes</button>',
      '    <button type="button" data-core-action="r8z-mgr-major-card-confirm-no">No</button>',
      '  </div>',
      // AICM_V10L_C2G_B5R4P_SECOND_CONFIRM_PINPOINT_DRYRUN_NOTE_REMOVED
      '',
      '</div>'
    ].join("");

    // AICM_V10L_C2G_B5R2_DELETE_CONFIRM_UI_CLEANUP_START
    if (confirm && confirm.kind === "delete") {
      try {
        if (typeof document !== "undefined" && document.createElement) {
          var aicmB5r2Root = document.createElement("div");
          aicmB5r2Root.innerHTML = aicmB5r2ConfirmHtml;

          Array.prototype.slice.call(aicmB5r2Root.querySelectorAll("*")).forEach(function (node) {
            var text = String(node && node.textContent || "");
            if (text.indexOf("一括引き渡し先") >= 0 || text.indexOf("引き渡し先 一括選択") >= 0) {
              var removeTarget = node.closest ? node.closest(".aicm-core-card, [data-r8z-mgr-major-card-route-picker]") : node;
              if (removeTarget && removeTarget.parentNode) removeTarget.parentNode.removeChild(removeTarget);
            }
          });

          Array.prototype.slice.call(aicmB5r2Root.querySelectorAll("p, div, section, article")).forEach(function (node) {
            var text = String(node && node.textContent || "").trim();
            if (
              text.indexOf("実行前チェックOK") >= 0 ||
              text.indexOf("この確認画面ではDB更新/API POST") >= 0 ||
              text.indexOf("API POST解放前に佐藤") >= 0
            ) {
              if (node.parentNode) node.parentNode.removeChild(node);
            }
          });

          aicmB5r2ConfirmHtml = aicmB5r2Root.innerHTML;
        }
      } catch (_) {
        aicmB5r2ConfirmHtml = String(aicmB5r2ConfirmHtml || "")
          .replace(/<[^>]*>[^<]*(実行前チェックOK|API POST解放前に佐藤|この確認画面ではDB更新\/API POST)[\s\S]*?<\/[^>]+>/g, "");
      }
    }
    // AICM_V10L_C2G_B5R2_DELETE_CONFIRM_UI_CLEANUP_END

    return aicmB5r2ConfirmHtml;
  }


  function aicmR8zMgrMajorCardRenderOperationPanel(rows) {
    rows = Array.isArray(rows) ? rows : [];

    var selectedCount = rows.filter(function (row, index) {
      // AICM_V10L_C2G_B5R5_STALE_SELECTED_PRUNE_SELECTED_COUNT
      return aicmR8zMgrMajorCardIsSelectable(row) && aicmR8zMgrMajorCardIsSelected(aicmR8zMgrMajorCardRowId(row, index));
    }).length;

    var eligibleCount = rows.filter(function (row) {
      return aicmR8zMgrMajorCardIsSelectable(row);
    }).length;

    return [
      '<div class="aicm-core-card" data-r8z-mgr-major-operation-panel="1" style="margin:12px 0;">',
      '  <p class="aicm-eyebrow">登録済み大項目 操作</p>',
      '  <h3>選択操作</h3>',
      '  <p class="aicm-selected-note">選択 ' + String(selectedCount) + ' / 未送信 ' + String(eligibleCount) + ' / 全件 ' + String(rows.length) + '</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="r8z-mgr-major-card-open-handoff-confirm">課長へ送る</button>',
      '    <button type="button" data-core-action="r8z-mgr-major-card-open-delete-confirm">削除</button>',
      '    <button type="button" data-core-action="r8z-mgr-major-card-select-all">全件選択</button>',
      '    <button type="button" data-core-action="r8z-mgr-major-card-clear">解除</button>',
      '  </div>',
      aicmR8zMgrMajorCardRenderConfirm(),
      '</div>'
    ].join("");
  }

  function aicmR8zMgrMajorCardRerender(sourceLabel) {
    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4(sourceLabel || "r8z_mgr_major_card_selection_clean_v1");
      return;
    }

    if (typeof render === "function") {
      render();
    }
  }

  
  
  
  
  
  function aicmR8zMgrMajorCardOpenConfirm(kind) {
    var bag = aicmR8zMgrMajorCardState();
    var rows = aicmR8zMgrMajorCardSelectedRows();

    // AICM_V10L_C2G_B5R5_STALE_SELECTED_PRUNE_OPEN_CONFIRM
    try {
      bag.selectedIds = {};
      rows.forEach(function (row, index) {
        var id = aicmR8zMgrMajorCardRowId(row, index);
        if (id) bag.selectedIds[id] = true;
      });
    } catch (_) {}

    if (!rows.length) {
      bag.confirm = null;
      if (typeof setMessage === "function") {
        setMessage("error", "対象の大項目を選択してください。");
      }
      aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_empty");
      return;
    }

    var validation = kind === "leader-handoff" && typeof aicmR8zC2bValidateLeaderHandoffRows === "function"
      ? aicmR8zC2bValidateLeaderHandoffRows(rows)
      : {
          ok: true,
          errors: [],
          items: rows.map(function (row, index) {
            return {
              id: aicmR8zMgrMajorCardRowId(row, index),
              title: aicmR8zMgrMajorCardTitle(row),
              route: {},
              payload: {}
            };
          }),
          payloads: [],
          route: {},
          endpoint: ""
        };

    bag.confirm = {
      kind: kind,
      title: kind === "delete" ? "削除確認" : "課長へ送る確認",
      endpoint: validation.endpoint || "/api/aicm/v2/manager-major/update",
      ok: validation.ok,
      errors: validation.errors || [],
      items: validation.items || [],
      payloads: validation.payloads || [],
      route: validation.route || {}
    };

    if (typeof setMessage === "function") {
      if (validation.ok) {
        setMessage("ok", "確認画面を表示しました。");
      } else {
        setMessage("error", "引き渡し先の課/Leaderを選択してください。");
      }
    }

    aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_open_c2d2");
  }


  function aicmR8zMgrMajorCardHandleAction(ev, target, action) {
      // AICM_R8Z_MGR_MAJOR_CARD_C2D11R1_ROUTE_ENRICHMENT_PATCH_RETRY_START
      // Route enrichment when section is applied.
      // No DB write. No API POST. No fetch.
      try {
        var c2d11r1Action = "";
        var c2d11r1Event = null;
        var c2d11r1Target = null;

        for (var c2d11r1I = 0; c2d11r1I < arguments.length; c2d11r1I += 1) {
          var c2d11r1Arg = arguments[c2d11r1I];

          if (!c2d11r1Event && c2d11r1Arg && c2d11r1Arg.preventDefault) c2d11r1Event = c2d11r1Arg;
          if (!c2d11r1Action && typeof c2d11r1Arg === "string") c2d11r1Action = String(c2d11r1Arg || "").trim();
          if (!c2d11r1Target && c2d11r1Arg && c2d11r1Arg.getAttribute) c2d11r1Target = c2d11r1Arg;

          if (!c2d11r1Target && c2d11r1Arg && c2d11r1Arg.target) {
            if (c2d11r1Arg.target.closest) {
              c2d11r1Target = c2d11r1Arg.target.closest("[data-core-action]");
            } else if (c2d11r1Arg.target.getAttribute) {
              c2d11r1Target = c2d11r1Arg.target;
            }
          }
        }

        if (!c2d11r1Action && c2d11r1Target && c2d11r1Target.getAttribute) {
          c2d11r1Action = String(c2d11r1Target.getAttribute("data-core-action") || "").trim();
        }

        if (c2d11r1Action === "r8z-mgr-major-card-route-apply-section") {
          if (c2d11r1Event && c2d11r1Event.preventDefault) c2d11r1Event.preventDefault();
          if (c2d11r1Event && c2d11r1Event.stopPropagation) c2d11r1Event.stopPropagation();

          function c2d11r1Text(v) {
            if (v === null || typeof v === "undefined") return "";
            return String(v).trim();
          }

          function c2d11r1Get(obj, keys) {
            if (!obj || typeof obj !== "object") return "";
            for (var gi = 0; gi < keys.length; gi += 1) {
              var k = keys[gi];
              if (obj[k] !== null && typeof obj[k] !== "undefined" && String(obj[k]).trim() !== "") {
                return String(obj[k]).trim();
              }
            }
            return "";
          }

          function c2d11r1Arr(v) {
            return Array.isArray(v) ? v : [];
          }

          function c2d11r1Attr(el, keys) {
            if (!el || !el.getAttribute) return "";
            for (var ai = 0; ai < keys.length; ai += 1) {
              var av = c2d11r1Text(el.getAttribute(keys[ai]));
              if (av) return av;
            }
            return "";
          }

          var c2d11r1Root = null;
          if (c2d11r1Target && c2d11r1Target.closest) {
            c2d11r1Root =
              c2d11r1Target.closest("[data-r8z-mgr-major-card-route-picker]") ||
              c2d11r1Target.closest("[data-aicm-route-picker]") ||
              c2d11r1Target.closest(".aicm-core-card") ||
              c2d11r1Target.closest("section") ||
              c2d11r1Target.closest("div");
          }

          var c2d11r1Select = null;
          if (c2d11r1Root && c2d11r1Root.querySelector) {
            c2d11r1Select =
              c2d11r1Root.querySelector("select[data-r8z-c2d-route-section-select]") ||
              c2d11r1Root.querySelector("select[data-section-select]") ||
              c2d11r1Root.querySelector("select");
          }

          var c2d11r1Option = null;
          if (c2d11r1Select && c2d11r1Select.options && c2d11r1Select.selectedIndex >= 0) {
            c2d11r1Option = c2d11r1Select.options[c2d11r1Select.selectedIndex];
          }

          var c2d11r1Ctx = state && state.context && typeof state.context === "object" ? state.context : {};

          var c2d11r1Rows = [];
          if (typeof aicmR8zMgrMajorCardSelectedRows === "function") {
            try {
              c2d11r1Rows = aicmR8zMgrMajorCardSelectedRows() || [];
            } catch (_) {
              c2d11r1Rows = [];
            }
          }
          var c2d11r1Row = c2d11r1Rows.length ? (c2d11r1Rows[0] || {}) : {};

          var sectionId =
            c2d11r1Attr(c2d11r1Option, ["data-section-id", "data-aicm-section-id", "value"]) ||
            c2d11r1Text(c2d11r1Select && c2d11r1Select.value) ||
            c2d11r1Get(c2d11r1Row, ["section_id", "sectionId"]);

          var sectionLabel =
            c2d11r1Attr(c2d11r1Option, ["data-section-label", "data-section-name", "data-label"]) ||
            c2d11r1Text(c2d11r1Option && (c2d11r1Option.textContent || c2d11r1Option.innerText)) ||
            c2d11r1Get(c2d11r1Row, ["section_name", "section_label", "sectionLabel"]);

          var departmentId =
            c2d11r1Attr(c2d11r1Option, ["data-department-id", "data-aicm-department-id"]) ||
            c2d11r1Get(c2d11r1Row, ["department_id", "departmentId"]);

          var departmentLabel =
            c2d11r1Attr(c2d11r1Option, ["data-department-label", "data-department-name"]) ||
            c2d11r1Get(c2d11r1Row, ["department_name", "department_label", "departmentLabel"]);

          var leaderLabel =
            c2d11r1Attr(c2d11r1Option, ["data-leader-label", "data-assigned-leader-label", "data-leader-name"]) ||
            c2d11r1Get(c2d11r1Row, ["assigned_leader_label", "leader_robot_label", "responsible_robot_label", "leaderLabel"]);

          var leaderPlacementId =
            c2d11r1Attr(c2d11r1Option, ["data-leader-placement-id", "data-placement-id"]) ||
            c2d11r1Get(c2d11r1Row, ["leader_placement_id", "leaderPlacementId", "assigned_leader_placement_id"]);

          var sections = []
            .concat(c2d11r1Arr(c2d11r1Ctx.sections))
            .concat(c2d11r1Arr(c2d11r1Ctx.organizations))
            .concat(c2d11r1Arr(c2d11r1Ctx.department_sections));

          var matchedSection = null;
          for (var si = 0; si < sections.length; si += 1) {
            var s = sections[si] || {};
            var sid = c2d11r1Get(s, ["aicm_user_company_section_id", "section_id", "organization_id", "id", "sectionId"]);
            var slabel = c2d11r1Get(s, ["section_name", "organization_name", "name", "section_label", "sectionLabel"]);

            if ((sectionId && sid === sectionId) || (sectionLabel && slabel === sectionLabel)) {
              matchedSection = s;
              break;
            }
          }

          if (matchedSection) {
            sectionId = sectionId || c2d11r1Get(matchedSection, ["aicm_user_company_section_id", "section_id", "organization_id", "id", "sectionId"]);
            sectionLabel = sectionLabel || c2d11r1Get(matchedSection, ["section_name", "organization_name", "name", "section_label", "sectionLabel"]);

            departmentId = departmentId || c2d11r1Get(matchedSection, [
              "department_id",
              "parent_department_id",
              "aicm_user_company_department_id",
              "departmentId"
            ]);

            departmentLabel = departmentLabel || c2d11r1Get(matchedSection, [
              "department_name",
              "parent_department_name",
              "department_label",
              "departmentLabel"
            ]);

            leaderLabel = leaderLabel || c2d11r1Get(matchedSection, [
              "assigned_leader_label",
              "leader_robot_label",
              "leader_label",
              "responsible_robot_label",
              "responsible_role_label",
              "leaderLabel"
            ]);

            leaderPlacementId = leaderPlacementId || c2d11r1Get(matchedSection, [
              "leader_placement_id",
              "leaderPlacementId",
              "assigned_leader_placement_id"
            ]);
          }

          var departments = []
            .concat(c2d11r1Arr(c2d11r1Ctx.departments))
            .concat(c2d11r1Arr(c2d11r1Ctx.departmentList));

          if (departmentId && !departmentLabel) {
            for (var di = 0; di < departments.length; di += 1) {
              var d = departments[di] || {};
              var did = c2d11r1Get(d, ["aicm_user_company_department_id", "department_id", "id", "departmentId"]);
              if (did === departmentId) {
                departmentLabel = c2d11r1Get(d, ["department_name", "name", "department_label", "departmentLabel"]);
                break;
              }
            }
          }

          var placements = []
            .concat(c2d11r1Arr(c2d11r1Ctx.placements))
            .concat(c2d11r1Arr(c2d11r1Ctx.robot_placements))
            .concat(c2d11r1Arr(c2d11r1Ctx.organization_placements));

          if (!leaderLabel || !leaderPlacementId) {
            for (var pi = 0; pi < placements.length; pi += 1) {
              var p = placements[pi] || {};
              var psid = c2d11r1Get(p, ["section_id", "organization_id", "aicm_user_company_section_id", "sectionId"]);
              var pslabel = c2d11r1Get(p, ["section_name", "organization_name", "section_label", "sectionLabel"]);
              var role = c2d11r1Get(p, ["role_code", "placement_role_code", "assigned_role_code", "roleCode"]).toLowerCase();
              var roleLabel = c2d11r1Get(p, ["role_label", "placement_role_label"]);

              var sameSection =
                (sectionId && psid === sectionId) ||
                (sectionLabel && pslabel === sectionLabel);

              var isLeader =
                role === "leader" ||
                role === "section_leader" ||
                role === "課長" ||
                roleLabel.indexOf("Leader") >= 0 ||
                roleLabel.indexOf("課長") >= 0;

              if (sameSection && isLeader) {
                leaderLabel = leaderLabel || c2d11r1Get(p, [
                  "internal_nickname",
                  "robot_internal_nickname",
                  "placement_label",
                  "robot_display_name",
                  "robot_name",
                  "display_name",
                  "name"
                ]);
                leaderPlacementId = leaderPlacementId || c2d11r1Get(p, [
                  "placement_id",
                  "robot_placement_id",
                  "aicm_robot_placement_id",
                  "id"
                ]);
                break;
              }
            }
          }

          var selectionState = null;
          if (typeof aicmR8zMgrMajorCardSelectionState === "function") {
            try {
              selectionState = aicmR8zMgrMajorCardSelectionState();
            } catch (_) {
              selectionState = null;
            }
          }

          if (!selectionState) {
            if (!state.r8zMgrMajorCardSelection || typeof state.r8zMgrMajorCardSelection !== "object") {
              state.r8zMgrMajorCardSelection = {};
            }
            selectionState = state.r8zMgrMajorCardSelection;
          }

          if (!selectionState.handoffBatchRoute || typeof selectionState.handoffBatchRoute !== "object") {
            selectionState.handoffBatchRoute = {};
          }

          var route = selectionState.handoffBatchRoute;

          route.applied = true;
          route.applied_flag = true;
          route.appliedLabel = "適用済み";
          route.applied_label = "適用済み";

          route.sectionId = sectionId;
          route.section_id = sectionId;
          route.sectionLabel = sectionLabel;
          route.section_label = sectionLabel;
          route.sectionName = sectionLabel;
          route.section_name = sectionLabel;

          route.departmentId = departmentId;
          route.department_id = departmentId;
          route.departmentLabel = departmentLabel;
          route.department_label = departmentLabel;
          route.departmentName = departmentLabel;
          route.department_name = departmentLabel;

          // AICM_R8Z_MGR_MAJOR_CARD_C2F_D2B_R3_SECTION_APPLY_CLEAR_AUTO_LEADER_START
          // Section apply must not auto-confirm Leader. Leader is confirmed only by the dedicated Leader apply action.
          leaderPlacementId = "";
          leaderLabel = "";
          // AICM_R8Z_MGR_MAJOR_CARD_C2F_D2B_R3_SECTION_APPLY_CLEAR_AUTO_LEADER_END
          route.leaderPlacementId = leaderPlacementId;
          route.leader_placement_id = leaderPlacementId;
          route.leaderLabel = leaderLabel;
          route.leader_label = leaderLabel;
          route.assigned_leader_label = leaderLabel;

          route.departmentMissing = !departmentLabel;
          route.leaderMissing = !leaderLabel;
          route.lastAppliedAt = (new Date()).toISOString();

          state.r8zMgrMajorCardRouteEnrichmentDebug = {
            marker: "AICM_R8Z_MGR_MAJOR_CARD_C2D11R1_ROUTE_ENRICHMENT_PATCH_RETRY",
            at: route.lastAppliedAt,
            action: c2d11r1Action,
            sectionId: sectionId,
            sectionLabel: sectionLabel,
            departmentId: departmentId,
            departmentLabel: departmentLabel,
            leaderPlacementId: leaderPlacementId,
            leaderLabel: leaderLabel,
            matchedSection: !!matchedSection,
            selectedRows: c2d11r1Rows.length
          };

          if (typeof setMessage === "function") {
            if (departmentLabel && leaderLabel) {
              setMessage("ok", "課・部門・Leaderを一括引き渡し先へ適用しました。");
            } else if (departmentLabel) {
              setMessage("ok", "課と部門を一括引き渡し先へ適用しました。Leaderは未設定です。");
            } else {
              setMessage("error", "課は適用しましたが、部門情報を特定できません。課設定または台帳行を確認してください。");
            }
          }

          if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
            aicmRenderTaskLedgerSafeR8V4("c2d11r1-route-enrichment");
            return;
          }

          if (typeof render === "function") {
            render();
            return;
          }

          return;
        }
      } catch (c2d11r1Error) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("C2D11R1 route enrichment failed", c2d11r1Error);
        }
      }
      // AICM_R8Z_MGR_MAJOR_CARD_C2D11R1_ROUTE_ENRICHMENT_PATCH_RETRY_END


      try {
        var aicmR8zC2d7Args = [];
        for (var aicmR8zC2d7I = 0; aicmR8zC2d7I < arguments.length; aicmR8zC2d7I += 1) {
          var aicmR8zC2d7Arg = arguments[aicmR8zC2d7I];
          var aicmR8zC2d7Item = {
            index: aicmR8zC2d7I,
            type: typeof aicmR8zC2d7Arg,
            stringValue: typeof aicmR8zC2d7Arg === "string" ? String(aicmR8zC2d7Arg) : "",
            hasTarget: !!(aicmR8zC2d7Arg && aicmR8zC2d7Arg.target),
            tagName: aicmR8zC2d7Arg && aicmR8zC2d7Arg.tagName ? String(aicmR8zC2d7Arg.tagName) : "",
            id: aicmR8zC2d7Arg && aicmR8zC2d7Arg.id ? String(aicmR8zC2d7Arg.id) : "",
            className: aicmR8zC2d7Arg && aicmR8zC2d7Arg.className ? String(aicmR8zC2d7Arg.className) : "",
            dataCoreAction: aicmR8zC2d7Arg && aicmR8zC2d7Arg.getAttribute ? String(aicmR8zC2d7Arg.getAttribute("data-core-action") || "") : "",
            targetDataCoreAction: aicmR8zC2d7Arg && aicmR8zC2d7Arg.target && aicmR8zC2d7Arg.target.getAttribute
              ? String(aicmR8zC2d7Arg.target.getAttribute("data-core-action") || "")
              : "",
            closestDataCoreAction: aicmR8zC2d7Arg && aicmR8zC2d7Arg.target && aicmR8zC2d7Arg.target.closest
              ? String((aicmR8zC2d7Arg.target.closest("[data-core-action]") || {}).getAttribute ? aicmR8zC2d7Arg.target.closest("[data-core-action]").getAttribute("data-core-action") || "" : "")
              : ""
          };
          aicmR8zC2d7Args.push(aicmR8zC2d7Item);
        }

        if (state && typeof state === "object") {
          state.r8zMgrMajorCardHandlerEntryDebug = {
            at: (new Date()).toISOString(),
            phase: "handler-entry",
            args: aicmR8zC2d7Args,
            actionVar: typeof action !== "undefined" ? String(action || "") : "__ACTION_VAR_UNDEFINED__",
            targetVarTag: typeof target !== "undefined" && target && target.tagName ? String(target.tagName) : "",
            targetVarAction: typeof target !== "undefined" && target && target.getAttribute ? String(target.getAttribute("data-core-action") || "") : ""
          };
        }

        if (typeof console !== "undefined" && console.info) {
        }
      } catch (aicmR8zC2d7Error) {
        if (typeof console !== "undefined" && console.warn) {
        }
      }


    try {
      if (ev && typeof ev.preventDefault === "function") ev.preventDefault();

      target = target || null;

      if (!target && ev && ev.target && typeof ev.target.closest === "function") {
        target = ev.target.closest("[data-core-action]");
      }

      var bag = aicmR8zMgrMajorCardState();

      if (action === "r8z-mgr-major-card-toggle") {
        var id = "";

        if (target && target.getAttribute) {
          id = String(target.getAttribute("data-r8z-mgr-major-id") || "").trim();
        }

        if (!id && target && target.dataset) {
          id = String(target.dataset.r8zMgrMajorId || "").trim();
        }

        if (!id) {
          if (typeof setMessage === "function") setMessage("error", "選択対象の大項目IDを特定できません。");
          aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_toggle_missing_id");
          return;
        }

        if (target && target.checked) {
          bag.selectedIds[id] = true;
        } else {
          delete bag.selectedIds[id];
        }

        bag.confirm = null;
        aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_toggle");
        return;
      }

      if (action === "r8z-mgr-major-card-select-all") {
        bag.selectedIds = {};

        aicmR8zMgrMajorCardAllRows().forEach(function (row, index) {
          if (!aicmR8zMgrMajorCardIsSelectable(row)) return;
          var id = aicmR8zMgrMajorCardRowId(row, index);
          if (id) bag.selectedIds[id] = true;
        });

        bag.confirm = null;

        if (typeof setMessage === "function") {
          setMessage("ok", "未送信の大項目を全件選択しました。");
        }

        aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_select_all");
        return;
      }

      if (action === "r8z-mgr-major-card-clear") {
        bag.selectedIds = {};
        bag.confirm = null;

        if (typeof setMessage === "function") {
          setMessage("ok", "大項目の選択を解除しました。");
        }

        aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_clear");
        return;
      }

      if (action === "r8z-mgr-major-card-open-handoff-confirm") {
        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

      if (action === "r8z-mgr-major-card-open-delete-confirm") {
        aicmR8zMgrMajorCardOpenConfirm("delete");
        return;
      }

      if (action === "r8z-mgr-major-card-confirm-no") {
        bag.confirm = null;

        if (typeof setMessage === "function") {
          setMessage("ok", "操作をキャンセルしました。");
        }

        aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_no");
        return;
      }

      


      // AICM_R8Z_MGR_MAJOR_CARD_C2D2_LEDGER_DEPARTMENT_ROUTE_ACTION_ROUTE
      if (action === "r8z-mgr-major-card-route-apply-section") {
        var aicmR8zC2d5r2aDebug = {
          phase: "branch-enter",
          at: (new Date()).toISOString(),
          action: String(action || ""),
          targetTag: target && target.tagName ? String(target.tagName) : "",
          targetAction: target && target.getAttribute ? String(target.getAttribute("data-core-action") || "") : "",
          targetId: target && target.id ? String(target.id) : "",
          targetClass: target && target.className ? String(target.className) : ""
        };

        try {
          if (state && typeof state === "object") {
            state.r8zMgrMajorCardRouteApplyDebug = aicmR8zC2d5r2aDebug;
          }
          if (typeof console !== "undefined" && console.info) {
            console.info("AICM C2D5R2A route apply debug", aicmR8zC2d5r2aDebug);
          }
        } catch (_) {}

        var routeRoot = target && target.closest ? target.closest("[data-r8z-mgr-major-card-route-picker]") : null;
        var sectionSelect = routeRoot && routeRoot.querySelector
          ? routeRoot.querySelector("[data-r8z-mgr-major-card-route-section-select]")
          : (typeof document !== "undefined" ? document.getElementById("aicm-r8z-mgr-major-card-route-section-select") : null);

        var option = sectionSelect && sectionSelect.options
          ? sectionSelect.options[sectionSelect.selectedIndex]
          : null;

        var sectionId = sectionSelect ? String(sectionSelect.value || "").trim() : "";
        try {
          aicmR8zC2d5r2aDebug.phase = "after-select-read";
          aicmR8zC2d5r2aDebug.routeRootFound = !!routeRoot;
          aicmR8zC2d5r2aDebug.sectionSelectFound = !!sectionSelect;
          aicmR8zC2d5r2aDebug.optionFound = !!option;
          aicmR8zC2d5r2aDebug.selectedIndex = sectionSelect ? sectionSelect.selectedIndex : null;
          aicmR8zC2d5r2aDebug.sectionId = sectionId;
          aicmR8zC2d5r2aDebug.optionText = option ? String(option.textContent || "").trim() : "";
          aicmR8zC2d5r2aDebug.optionSectionId = option && option.getAttribute ? String(option.getAttribute("data-section-id") || "") : "";
          aicmR8zC2d5r2aDebug.optionSectionLabel = option && option.getAttribute ? String(option.getAttribute("data-section-label") || "") : "";
          aicmR8zC2d5r2aDebug.optionDepartmentId = option && option.getAttribute ? String(option.getAttribute("data-department-id") || "") : "";
          aicmR8zC2d5r2aDebug.optionDepartmentLabel = option && option.getAttribute ? String(option.getAttribute("data-department-label") || "") : "";

          if (state && typeof state === "object") {
            state.r8zMgrMajorCardRouteApplyDebug = aicmR8zC2d5r2aDebug;
          }
          if (typeof console !== "undefined" && console.info) {
            console.info("AICM C2D5R2A route apply after select", aicmR8zC2d5r2aDebug);
          }
        } catch (_) {}


        if (!sectionId || !option) {
          if (typeof setMessage === "function") setMessage("error", "課を選択してください。");
          aicmR8zMgrMajorCardRerender("r8z_c2d2_section_select_empty");
          return;
        }

        var sectionSnapshot = {
          sectionId: String(option.getAttribute("data-section-id") || sectionId || "").trim(),
          sectionLabel: String(option.getAttribute("data-section-label") || option.textContent || "").trim(),
          departmentId: String(option.getAttribute("data-department-id") || "").trim(),
          departmentLabel: String(option.getAttribute("data-department-label") || "").trim()
        };

        var appliedRoute = aicmR8zC2cApplySectionChoice(sectionId, sectionSnapshot);
        try {
          aicmR8zC2d5r2aDebug.phase = "after-apply";
          aicmR8zC2d5r2aDebug.appliedRouteOk = !!appliedRoute;
          aicmR8zC2d5r2aDebug.appliedRoute = appliedRoute || null;
          aicmR8zC2d5r2aDebug.choiceAfterApply = typeof aicmR8zC2cChoice === "function" ? aicmR8zC2cChoice() : null;
          aicmR8zC2d5r2aDebug.stateSelectionAfterApply = state && state.r8zMgrMajorCardSelection ? state.r8zMgrMajorCardSelection : null;
          aicmR8zC2d5r2aDebug.confirmAfterApply = state && state.r8zMgrMajorCardSelection ? state.r8zMgrMajorCardSelection.confirm || null : null;

          if (state && typeof state === "object") {
            state.r8zMgrMajorCardRouteApplyDebug = aicmR8zC2d5r2aDebug;
          }
          if (typeof console !== "undefined" && console.info) {
            console.info("AICM C2D5R2A route apply after apply", aicmR8zC2d5r2aDebug);
          }
        } catch (_) {}


        if (!appliedRoute || !appliedRoute.sectionId) {
          if (typeof setMessage === "function") setMessage("error", "選択した課を適用できません。再読み込みしてください。");
          aicmR8zMgrMajorCardRerender("r8z_c2d2_section_apply_failed");
          return;
        }

        if (typeof setMessage === "function") {
          setMessage("ok", "引き渡し先の課を適用しました: " + appliedRoute.sectionLabel);
        }

        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

      if (action === "r8z-mgr-major-card-route-apply-leader") {
        var leaderRoot = target && target.closest ? target.closest("[data-r8z-mgr-major-card-route-picker]") : null;
        var leaderSelect = leaderRoot && leaderRoot.querySelector
          ? leaderRoot.querySelector("[data-r8z-mgr-major-card-route-leader-select]")
          : (typeof document !== "undefined" ? document.getElementById("aicm-r8z-mgr-major-card-route-leader-select") : null);

        var leaderPlacementId = leaderSelect ? String(leaderSelect.value || "").trim() : "";

        if (!leaderPlacementId) {
          if (typeof setMessage === "function") setMessage("error", "Leaderを選択してください。");
          aicmR8zMgrMajorCardRerender("r8z_c2d2_leader_select_empty");
          return;
        }

        aicmR8zC2cApplyLeaderChoice(leaderPlacementId);

        if (typeof setMessage === "function") {
          setMessage("ok", "Leaderを適用しました。");
        }

        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

      if (action === "r8z-mgr-major-card-route-clear") {
        aicmR8zC2cClearRouteChoice();
        aicmR8zMgrMajorCardOpenConfirm("leader-handoff");
        return;
      }

if (action === "r8z-mgr-major-card-confirm-yes") {
        // AICM_V10L_C2G_B5R1_MIN_CONFIRM_YES_POST_START
        if (bag.confirm && Array.isArray(bag.confirm.errors) && bag.confirm.errors.length) {
          if (typeof setMessage === "function") {
            setMessage("error", "実行前チェックが未解決のため、Yesは実行できません。");
          }
          aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_yes_blocked_b5r1");
          return;
        }

        var confirm = bag.confirm || null;

        if (!confirm) {
          if (typeof setMessage === "function") setMessage("error", "確認情報が見つかりません。");
          aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_yes_missing_b5r1");
          return;
        }

        void (async function aicmV10lC2gB5r1ConfirmYesPost() {
          try {
            var kind = String(confirm.kind || "");
            var items = Array.isArray(confirm.items) ? confirm.items : [];
            var payloads = Array.isArray(confirm.payloads) ? confirm.payloads : [];

            if (!items.length) {
              if (typeof setMessage === "function") setMessage("error", "対象の大項目がありません。");
              aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_yes_empty_b5r1");
              return;
            }

            if (typeof setMessage === "function") {
              setMessage("info", (kind === "delete" ? "削除" : "課長へ送る") + "を実行しています。対象件数: " + String(items.length));
            }

            var ok = 0;
            var ng = [];

            for (var i = 0; i < items.length; i += 1) {
              var item = items[i] || {};
              var payload = payloads[i] && typeof payloads[i] === "object"
                ? payloads[i]
                : (item.payload && typeof item.payload === "object" ? item.payload : {});

              var body = {};
              Object.keys(payload).forEach(function (key) {
                body[key] = payload[key];
              });

              if (!body.owner_civilization_id) {
                body.owner_civilization_id =
                  item.owner_civilization_id ||
                  item.ownerCivilizationId ||
                  (item.row && (item.row.owner_civilization_id || item.row.ownerCivilizationId)) ||
                  "";
              }

              if (!body.owner_civilization_id && typeof aicmR8zC2bOwnerId === "function") {
                try {
                  body.owner_civilization_id = aicmR8zC2bOwnerId(item.row || item);
                } catch (_) {}
              }

              if (!body.aicm_manager_major_work_item_id) {
                body.aicm_manager_major_work_item_id =
                  item.id ||
                  item.majorId ||
                  item.major_item_id ||
                  item.aicm_manager_major_work_item_id ||
                  item.manager_major_work_item_id ||
                  (item.row && (
                    item.row.aicm_manager_major_work_item_id ||
                    item.row.manager_major_work_item_id ||
                    item.row.major_item_id ||
                    item.row.id
                  )) ||
                  "";
              }

              if (kind === "delete") {
                body.decomposition_status_code = "archived";
                body.handoff_status_code = "archived";
              } else {
                body.decomposition_status_code = body.decomposition_status_code || "assigned_to_leader";
                body.handoff_status_code = body.handoff_status_code || "handed_off";
              }

              try {
                if (!body.owner_civilization_id) throw new Error("owner_civilization_idがありません。");
                if (!body.aicm_manager_major_work_item_id) throw new Error("Manager大項目IDがありません。");

                var response = await fetch("/api/aicm/v2/manager-major/update", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify(body)
                });

                var rawText = await response.text();
                var json = null;

                try {
                  json = rawText ? JSON.parse(rawText) : null;
                } catch (_) {
                  json = null;
                }

                if (!response.ok || (json && json.result && json.result !== "ok")) {
                  throw new Error(
                    json && (json.error_message || json.message || json.error)
                      ? (json.error_message || json.message || json.error)
                      : rawText || "POSTに失敗しました。"
                  );
                }

                // AICM_V10L_C2G_B6R4B_CONFIRM_YES_AUTO_CHAIN_START
                if (kind === "leader-handoff") {
                  var aicmB6r4bMajorId = String(
                    body.aicm_manager_major_work_item_id ||
                    item.id ||
                    item.majorId ||
                    item.aicm_manager_major_work_item_id ||
                    item.manager_major_work_item_id ||
                    ""
                  ).trim();

                  if (!aicmB6r4bMajorId) {
                    throw new Error("自動連携対象のManager大項目IDを特定できません。");
                  }

                  if (typeof aicmRunLeaderAutoDecompositionAfterHandoffR8ZB !== "function") {
                    throw new Error("Leader自動分解関数が見つかりません。");
                  }

                  var aicmB6r4bLeaderAutoResult = await aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(aicmB6r4bMajorId);

                  if (aicmB6r4bLeaderAutoResult && aicmB6r4bLeaderAutoResult.ok === false) {
                    throw new Error(aicmB6r4bLeaderAutoResult.message || "Leader自動分解に失敗しました。");
                  }

                  if (typeof aicmRunWorkerAutoExecutionAfterDecompositionR8ZI === "function") {
                    await aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(aicmB6r4bMajorId);
                  }
                }
                // AICM_V10L_C2G_B6R4B_CONFIRM_YES_AUTO_CHAIN_END
                ok += 1;
              } catch (oneErr) {
                ng.push((item.title || body.aicm_manager_major_work_item_id || "対象") + ": " + (oneErr && oneErr.message ? oneErr.message : "失敗"));
              }
            }

            bag.confirm = null;

            if (ng.length) {
              if (typeof setMessage === "function") {
                setMessage("error", (kind === "delete" ? "削除" : "課長へ送る") + ": " + String(ok) + "件成功 / " + String(ng.length) + "件失敗");
              }
            } else {
              if (typeof setMessage === "function") {
                setMessage("ok", String(ok) + "件を" + (kind === "delete" ? "削除済み扱いにしました。" : "課長へ送りました。"));
              }
            }

            if (typeof aicmReloadTaskLedgerContext === "function") {
              await aicmReloadTaskLedgerContext();
            } else {
              aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_yes_post_done_b5r1");
            }
          } catch (error) {
            if (typeof setMessage === "function") {
              setMessage("error", error && error.message ? error.message : "確認Yesの実行に失敗しました。");
            }
            aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_confirm_yes_post_error_b5r1");
          }
        }());

        return;
        // AICM_V10L_C2G_B5R1_MIN_CONFIRM_YES_POST_END
      }
    } catch (error) {
      try {
        if (typeof setMessage === "function") {
          setMessage("error", error && error.message ? error.message : "大項目選択操作に失敗しました。");
        }
        aicmR8zMgrMajorCardRerender("r8z_mgr_major_card_action_error");
      } catch (_) {}
    }
  }
  // AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_HELPER_END

function aicmRenderManagerMajorRows(rows) {
    var sourceRows = Array.isArray(rows) ? rows : [];
    var pendingRows = sourceRows.filter(function (row) {
      // AICM_R8Z_V9D1_IS_PENDING_MAJOR_SCOPE_CALLSITE_FIX: use existing visible canonical helper, not the scope-local isPendingMajor
      if (typeof aicmIsPendingManagerMajorRowR8V6 === "function") {
        return aicmIsPendingManagerMajorRowR8V6(row);
      }
      return !!row;
    });

    var confirmCard = aicmRenderMajorItemDeleteConfirmCardR8P();

    if (!pendingRows.length) {
      return [
        confirmCard,
        '<div class="aicm-core-empty">',
        '  <strong>登録済み大項目はまだありません</strong>',
        '  <p>CSV取り込み後、未実行/未引き継ぎのManager大項目だけが表示されます。</p>',
        '</div>'
      ].join("");
    }

    var pageSize = aicmMajorItemPageSizeR8O();
    var totalRows = pendingRows.length;
    var totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    var page = aicmMajorItemCurrentPageR8O(totalRows);
    var start = (page - 1) * pageSize;
    var pageRows = pendingRows.slice(start, start + pageSize);

    var pager = [
      '<div class="aicm-dashboard-action-row">',
      '<!-- AICM_R8Z_MGR_MAJOR_CARD_SELECTION_C1G_VISIBLE_PANEL_POLISH_PANEL -->',
      aicmR8zMgrMajorCardRenderOperationPanel(rows),
      '  <button type="button" data-core-action="pmlw-major-page-prev"' + (page <= 1 ? ' disabled' : '') + '>前ページ</button>',
      '  <span class="aicm-selected-note">ページ ' + escapeHtml(String(page)) + ' / ' + escapeHtml(String(totalPages)) + '　表示 ' + escapeHtml(String(start + 1)) + '-' + escapeHtml(String(start + pageRows.length)) + ' / ' + escapeHtml(String(totalRows)) + '件</span>',
      '  <button type="button" data-core-action="pmlw-major-page-next"' + (page >= totalPages ? ' disabled' : '') + '>次ページ</button>',
      '</div>'
    ].join("");

    var cards = pageRows.map(function (row, index) {
      // AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_RENDERER_ROW_START
      var r8zMgrMajorCardIndex = typeof index === "number" ? index : 0;
      var r8zMgrMajorCardCheckboxHtml = aicmR8zMgrMajorCardRenderCheckbox(row, r8zMgrMajorCardIndex);
      // AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_RENDERER_ROW_END
      var majorId = aicmAxuR1MajorId(row);
      var summary = aicmMajorItemSummaryR8O(row);
      var displayNo = start + index + 1;

      return [
        '<article class="aicm-core-card aicm-major-item-row">',
        '  <p class="aicm-eyebrow">Manager大項目 #' + escapeHtml(String(displayNo)) + '</p>',
        '  <h3>' + escapeHtml(summary.title) + '</h3>',
        summary.description ? '  <p class="aicm-selected-note">' + escapeHtml(summary.description) + '</p>' : '',
        '  <dl class="aicm-core-detail-list">',
        '    <dt>課長/Leader</dt><dd>' + escapeHtml(summary.leader) + '</dd>',
        '    <dt>優先度</dt><dd>' + escapeHtml(summary.priority) + '</dd>',
        '    <dt>期限</dt><dd>' + escapeHtml(summary.due) + '</dd>',
        '    <dt>状態</dt><dd>' + escapeHtml(summary.status) + '</dd>',
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        r8zMgrMajorCardCheckboxHtml,
        '<!-- AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_RENDERER_CHECKBOX -->',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");

    return [
      confirmCard,
      pager,
      '<div class="aicm-manager-major-list">',
      cards,
      '</div>',
      pager
    ].join("");
  }

    function aicmRenderTaskLedgerSafeR8V4(sourceLabel) {
    state.screen = "task-ledger";

    try {
      if (!root) return;

      var html = renderTaskLedgerPlaceholder();
      root.innerHTML = html;

      return true;
    } catch (error) {
      var message = error && error.message ? error.message : String(error || "unknown error");
      var stack = error && error.stack ? String(error.stack) : "";

      if (typeof console !== "undefined" && console && console.error) {
        console.error("AICM task-ledger render failed", {
          sourceLabel: sourceLabel || "",
          message: message,
          stack: stack
        });
      }

      if (root) {
        root.innerHTML = renderShell([
          '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
          '  <p class="aicm-eyebrow">TASK LEDGER RENDER ERROR</p>',
          '  <h2>部門別タスク台帳の描画でエラーが発生しました</h2>',
          '  <p class="aicm-selected-note">クリック処理と画面遷移は動いています。以下はブラウザ側の描画エラーです。</p>',
          '  <dl class="aicm-core-detail-list">',
          '    <dt>source</dt><dd>' + escapeHtml(sourceLabel || "") + '</dd>',
          '    <dt>message</dt><dd>' + escapeHtml(message) + '</dd>',
          '  </dl>',
          stack ? '<pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + escapeHtml(stack) + '</pre>' : '',
          '  <div class="aicm-dashboard-action-row">',
          '    <button type="button" data-core-action="task-ledger-refresh">再読み込み</button>',
          '    <button type="button" data-core-action="go" data-screen="dashboard">ダッシュボードへ戻る</button>',
          '  </div>',
          '</section>'
        ].join(""));
      }

      return false;
    }
  }
// AICM_R8_NAV_TASK_LEDGER_SAFE_RENDER_V4_END

  function aicmOpenTaskLedgerScreenR8V3Clean() {
    state.screen = "task-ledger";
    state.managerMajorDeleteConfirm = null;

    if (typeof setMessage === "function") {
      setMessage("ok", "部門別タスク台帳を表示します。");
    }

    aicmRenderTaskLedgerSafeR8V4("open:initial");

    Promise.resolve()
      .then(function () {
        if (typeof aicmReloadTaskLedgerContext === "function") {
          return aicmReloadTaskLedgerContext();
        }
        return null;
      })
      .then(function () {
        state.screen = "task-ledger";
        render();
      })
      .catch(function (error) {
        state.screen = "task-ledger";

        if (typeof setMessage === "function") {
          setMessage("error", error && error.message ? error.message : "部門別タスク台帳の読込に失敗しました。");
        }

        aicmRenderTaskLedgerSafeR8V4("open:error");
      });
  }
// AICM_R8_NAV_TASK_LEDGER_V3_CLEAN_HELPER_END

  


async function aicmReloadTaskLedgerContext() {
    // AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: reload
    state.screen = "task-ledger";
    state.errorMessage = "";

    if (typeof loadContext === "function") {
      await loadContext();
      // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_RELOAD_CALL
      if (typeof aicmFetchAndHydrateManagerMajorContextR8M === "function") {
        await aicmFetchAndHydrateManagerMajorContextR8M();
      }
    }

    state.screen = "task-ledger";

    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4("reload:complete");
    } else if (typeof render === "function") {
      render();
    }
  }


  function aicmHydrateManagerMajorContextArraysR8M(rawContext) {
    // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1
    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
    var target = state && state.context && typeof state.context === "object" ? state.context : {};

    if (state) {
      state.context = target;
    }

    function arrayFrom(names) {
      for (var i = 0; i < names.length; i += 1) {
        var name = names[i];

        if (Array.isArray(raw[name])) {
          return raw[name];
        }

        if (Array.isArray(target[name])) {
          return target[name];
        }
      }

      return [];
    }

    var pmlwMajorItems = arrayFrom(["pmlw_major_items", "pmlwMajorItems"]);
    var managerMajorItems = arrayFrom(["manager_major_items", "managerMajorItems"]);
    var majorItems = arrayFrom(["major_items", "majorItems"]);
    var taskLedger = arrayFrom(["task_ledger", "taskLedger"]);
    var robotCatalog = arrayFrom(["robot_catalog", "robotCatalog"]);

    target.pmlw_major_items = pmlwMajorItems;
    target.pmlwMajorItems = pmlwMajorItems;

    target.manager_major_items = managerMajorItems;
    target.managerMajorItems = managerMajorItems;

    target.major_items = majorItems;
    target.majorItems = majorItems;

    target.task_ledger = taskLedger;
    target.taskLedger = taskLedger;

    target.robot_catalog = robotCatalog;
    target.robotCatalog = robotCatalog;

    target.__managerMajorHydrationR8M = {
      pmlw_major_items: pmlwMajorItems.length,
      manager_major_items: managerMajorItems.length,
      major_items: majorItems.length,
      task_ledger: taskLedger.length
    };

    return target;
  }

  async function aicmFetchAndHydrateManagerMajorContextR8M() {
    var owner = "";

    if (state && state.ownerCivilizationId) {
      owner = String(state.ownerCivilizationId || "");
    }

    if (!owner && typeof ownerCivilizationId === "function") {
      owner = String(ownerCivilizationId() || "");
    }

    if (!owner && typeof aicmPmlwOwnerId === "function") {
      owner = String(aicmPmlwOwnerId() || "");
    }

    if (!owner) {
      owner = "00000000-0000-4000-8000-000000000001";
    }

    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner) + "&v=" + Date.now());
    var json = await response.json();

    if (json && json.result === "ok") {
      aicmHydrateManagerMajorContextArraysR8M(json);
    }

    return json;
  }

// AICM_R8T_LEADER_INBOX_DISPLAY_HELPER_START
  function aicmLeaderInboxTextR8T(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmLeaderInboxMajorIdR8T(row) {
    var r = row && typeof row === "object" ? row : {};
    return aicmLeaderInboxTextR8T(
      r.aicm_manager_major_work_item_id ||
      r.manager_major_work_item_id ||
      r.majorId ||
      r.major_id ||
      r.id
    );
  }

  function aicmLeaderInboxAllMajorRowsR8T() {
    var ctx = state && state.context ? state.context : {};
    var rows = [];
    var seen = {};

    function add(list) {
      if (!Array.isArray(list)) return;
      for (var i = 0; i < list.length; i += 1) {
        var row = list[i];
        var id = aicmLeaderInboxMajorIdR8T(row);
        var key = id || ("row_" + rows.length);
        if (seen[key]) continue;
        seen[key] = true;
        rows.push(row);
      }
    }

    add(ctx.pmlw_major_items);
    add(ctx.pmlwMajorItems);
    add(ctx.manager_major_items);
    add(ctx.managerMajorItems);
    add(ctx.major_items);
    add(ctx.majorItems);

    return rows;
  }

  function aicmLeaderInboxSelectedCompanyIdR8T() {
    if (state && state.selectedCompanyId) return aicmLeaderInboxTextR8T(state.selectedCompanyId);
    if (typeof selectedCompany === "function") {
      var company = selectedCompany();
      if (company && company.aicm_user_company_id) return aicmLeaderInboxTextR8T(company.aicm_user_company_id);
    }
    return "";
  }

  function aicmLeaderInboxIsRowR8T(row) {
    if (!row || typeof row !== "object") return false;

    var handoff = aicmLeaderInboxTextR8T(row.handoff_status_code).toLowerCase();
    var decomposition = aicmLeaderInboxTextR8T(row.decomposition_status_code).toLowerCase();
    var companyId = aicmLeaderInboxSelectedCompanyIdR8T();
    var rowCompanyId = aicmLeaderInboxTextR8T(row.aicm_user_company_id);

    if (companyId && rowCompanyId && companyId !== rowCompanyId) return false;
    if (handoff === "archived" || decomposition === "archived") return false;

    return handoff === "handed_off" || decomposition === "assigned_to_leader";
  }

  function aicmLeaderInboxRowsR8T() {
    var rows = aicmLeaderInboxAllMajorRowsR8T().filter(aicmLeaderInboxIsRowR8T);

    rows.sort(function (a, b) {
      var au = aicmLeaderInboxTextR8T(a && (a.updated_at || a.created_at));
      var bu = aicmLeaderInboxTextR8T(b && (b.updated_at || b.created_at));
      if (au && bu && au !== bu) return au < bu ? 1 : -1;

      var ad = Number(a && a.display_order);
      var bd = Number(b && b.display_order);
      if (!Number.isFinite(ad)) ad = 999999;
      if (!Number.isFinite(bd)) bd = 999999;
      return ad - bd;
    });

    return rows;
  }

  function aicmLeaderInboxPriorityLabelR8T(value) {
    var code = aicmLeaderInboxTextR8T(value).toLowerCase();
    if (code === "urgent") return "緊急";
    if (code === "high") return "高";
    if (code === "normal") return "通常";
    if (code === "low") return "低";
    return code || "未設定";
  }

  function aicmRenderLeaderInboxR8T() {
    var rows = aicmLeaderInboxRowsR8T();

    if (!rows.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>Leader受信箱はまだ空です</strong>',
        '  <p>課長へ送ったManager大項目がここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    var cards = rows.map(function (row, index) {
      var majorId = aicmLeaderInboxMajorIdR8T(row);
      var title = aicmLeaderInboxTextR8T(row && (row.major_item_name || row.deliverable_name || row.task_name)) || "Manager大項目";
      var description = aicmLeaderInboxTextR8T(row && (row.major_item_description || row.task_description || row.note));
      var leader = aicmLeaderInboxTextR8T(row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label)) || "未設定";
      var due = aicmLeaderInboxTextR8T(row && row.due_date) || "未設定";
      var handoff = aicmLeaderInboxTextR8T(row && row.handoff_status_code) || "handed_off";
      var decomposition = aicmLeaderInboxTextR8T(row && row.decomposition_status_code) || "assigned_to_leader";

      return [
        '<article class="aicm-ledger-row">',
        '  <p class="aicm-eyebrow">Leader受信 #' + escapeHtml(String(index + 1)) + '</p>',
        '  <h3>' + escapeHtml(title) + '</h3>',
        description ? '  <p class="aicm-selected-note">' + escapeHtml(description) + '</p>' : '',
        '  <dl class="aicm-ledger-meta">',
        '    <div><dt>課長/Leader</dt><dd>' + escapeHtml(leader) + '</dd></div>',
        '    <div><dt>優先度</dt><dd>' + escapeHtml(aicmLeaderInboxPriorityLabelR8T(row && row.priority_code)) + '</dd></div>',
        '    <div><dt>期限</dt><dd>' + escapeHtml(due) + '</dd></div>',
        '    <div><dt>状態</dt><dd>' + escapeHtml(decomposition + " / " + handoff) + '</dd></div>',
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="leader-inbox-middle-breakdown-open" data-major-id="' + escapeHtml(majorId) + '">中項目へ分解</button>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");

    return [
      '<p class="aicm-selected-note">Leader受信箱: <strong>' + escapeHtml(String(rows.length)) + '件</strong></p>',
      '<div class="aicm-ledger-list">',
      cards,
      '</div>'
    ].join("");
  }
// AICM_R8T_LEADER_INBOX_DISPLAY_HELPER_END

// AICM_R8U_MANAGER_MAJOR_SUMMARY_HELPER_START
  function aicmSummaryTextR8U(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmSummaryMajorIdR8U(row) {
    var r = row && typeof row === "object" ? row : {};
    return aicmSummaryTextR8U(
      r.aicm_manager_major_work_item_id ||
      r.manager_major_work_item_id ||
      r.majorId ||
      r.major_id ||
      r.id
    );
  }

  function aicmSummarySelectedCompanyIdR8U() {
    if (state && state.selectedCompanyId) return aicmSummaryTextR8U(state.selectedCompanyId);
    if (typeof selectedCompany === "function") {
      var company = selectedCompany();
      if (company && company.aicm_user_company_id) return aicmSummaryTextR8U(company.aicm_user_company_id);
    }
    return "";
  }

  function aicmManagerMajorSummaryRowsR8U() {
    var ctx = state && state.context ? state.context : {};
    var rows = [];
    var seen = {};
    var selectedCompanyId = aicmSummarySelectedCompanyIdR8U();

    function add(list) {
      if (!Array.isArray(list)) return;
      for (var i = 0; i < list.length; i += 1) {
        var row = list[i];
        if (!row || typeof row !== "object") continue;

        var rowCompanyId = aicmSummaryTextR8U(row.aicm_user_company_id);
        if (selectedCompanyId && rowCompanyId && selectedCompanyId !== rowCompanyId) continue;

        var id = aicmSummaryMajorIdR8U(row);
        var key = id || ("summary_row_" + rows.length);
        if (seen[key]) continue;
        seen[key] = true;
        rows.push(row);
      }
    }

    add(ctx.pmlw_major_items);
    add(ctx.pmlwMajorItems);
    add(ctx.manager_major_items);
    add(ctx.managerMajorItems);
    add(ctx.major_items);
    add(ctx.majorItems);

    return rows;
  }

  function aicmManagerMajorSummaryBucketR8U(row) {
    var handoff = aicmSummaryTextR8U(row && row.handoff_status_code).toLowerCase();
    var decomposition = aicmSummaryTextR8U(row && row.decomposition_status_code).toLowerCase();
    var deleted = aicmSummaryTextR8U(row && (row.deleted_flag || row.is_deleted)).toLowerCase();
    var archived = aicmSummaryTextR8U(row && (row.archived_flag || row.is_archived)).toLowerCase();

    if (deleted === "true" || deleted === "1") return "archived";
    if (archived === "true" || archived === "1") return "archived";
    if (handoff === "archived" || decomposition === "archived" || handoff === "deleted" || decomposition === "deleted") return "archived";

    if (
      handoff === "completed" ||
      handoff === "done" ||
      decomposition === "completed" ||
      decomposition === "complete" ||
      decomposition === "done" ||
      decomposition === "decomposed"
    ) {
      return "completed";
    }

    if (
      decomposition === "leader_decomposing" ||
      decomposition === "worker_assigned" ||
      decomposition === "in_progress" ||
      handoff === "accepted" ||
      handoff === "in_progress"
    ) {
      return "auto_processing";
    }

    if (handoff === "handed_off" || decomposition === "assigned_to_leader") {
      return "leader_received";
    }

    if (
      handoff === "draft" ||
      handoff === "ready_handoff" ||
      decomposition === "not_started" ||
      (!handoff && !decomposition)
    ) {
      return "pending";
    }

    return "other";
  }

  function aicmManagerMajorSummaryBucketsR8U() {
    return [
      { code: "pending", label: "未引き継ぎ", note: "Manager大項目として登録済み。まだ課長へ送っていない件数。" },
      { code: "leader_received", label: "Leader受信済み", note: "課長/Leaderへ送信済み。以降は自動処理対象。" },
      { code: "auto_processing", label: "自動処理中", note: "Leader以降の自動分解・Worker展開中の件数。" },
      { code: "completed", label: "完了/分解済み", note: "分解または後続処理が完了した件数。" },
      { code: "archived", label: "削除済み", note: "削除済みまたはアーカイブ済みの件数。" },
      { code: "other", label: "その他", note: "想定外または移行中ステータスの件数。" }
    ];
  }

  function aicmManagerMajorSummaryCountsR8U() {
    var rows = aicmManagerMajorSummaryRowsR8U();
    var buckets = aicmManagerMajorSummaryBucketsR8U();
    var map = {};

    for (var i = 0; i < buckets.length; i += 1) {
      map[buckets[i].code] = {
        code: buckets[i].code,
        label: buckets[i].label,
        note: buckets[i].note,
        count: 0,
        rows: []
      };
    }

    for (var j = 0; j < rows.length; j += 1) {
      var row = rows[j];
      var code = aicmManagerMajorSummaryBucketR8U(row);
      if (!map[code]) code = "other";
      map[code].count += 1;
      map[code].rows.push(row);
    }

    return {
      total: rows.length,
      buckets: buckets.map(function (bucket) { return map[bucket.code]; }),
      map: map
    };
  }

  function aicmManagerMajorSummaryPriorityLabelR8U(value) {
    var code = aicmSummaryTextR8U(value).toLowerCase();
    if (code === "urgent") return "緊急";
    if (code === "high") return "高";
    if (code === "normal") return "通常";
    if (code === "low") return "低";
    return code || "未設定";
  }

  function aicmRenderManagerMajorSummaryDetailRowsR8U(rows, label) {
    if (!Array.isArray(rows) || !rows.length) {
      return '<div class="aicm-empty-state"><strong>該当する大項目はありません</strong><p>' + escapeHtml(label || "選択条件") + 'の行はありません。</p></div>';
    }

    var limit = 20;
    var visible = rows.slice(0, limit);
    var cards = visible.map(function (row, index) {
      var title = aicmSummaryTextR8U(row && (row.major_item_name || row.deliverable_name || row.task_name)) || "Manager大項目";
      var description = aicmSummaryTextR8U(row && (row.major_item_description || row.task_description || row.note));
      var leader = aicmSummaryTextR8U(row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label)) || "未設定";
      var due = aicmSummaryTextR8U(row && row.due_date) || "未設定";
      var handoff = aicmSummaryTextR8U(row && row.handoff_status_code) || "未設定";
      var decomposition = aicmSummaryTextR8U(row && row.decomposition_status_code) || "未設定";

      return [
        '<article class="aicm-ledger-row">',
        '  <p class="aicm-eyebrow">詳細 #' + escapeHtml(String(index + 1)) + '</p>',
        '  <h3>' + escapeHtml(title) + '</h3>',
        description ? '  <p class="aicm-selected-note">' + escapeHtml(description) + '</p>' : '',
        '  <dl class="aicm-ledger-meta">',
        '    <div><dt>課長/Leader</dt><dd>' + escapeHtml(leader) + '</dd></div>',
        '    <div><dt>優先度</dt><dd>' + escapeHtml(aicmManagerMajorSummaryPriorityLabelR8U(row && row.priority_code)) + '</dd></div>',
        '    <div><dt>期限</dt><dd>' + escapeHtml(due) + '</dd></div>',
        '    <div><dt>状態</dt><dd>' + escapeHtml(decomposition + " / " + handoff) + '</dd></div>',
        '  </dl>',
        '</article>'
      ].join("");
    }).join("");

    var more = rows.length > limit ? '<p class="aicm-selected-note">表示は先頭' + escapeHtml(String(limit)) + '件です。全件確認は次工程で詳細画面化します。</p>' : '';

    return [
      '<div class="aicm-ledger-list">',
      cards,
      '</div>',
      more
    ].join("");
  }

  function aicmRenderManagerMajorSummaryDetailR8U(summary) {
    var filter = aicmSummaryTextR8U(state && state.managerMajorSummaryFilterR8U);
    if (!filter) {
      return '<p class="aicm-selected-note">件数カードを押すと、その分類の詳細をここで確認できます。</p>';
    }

    var bucket = summary.map[filter] || summary.map.other;
    var label = bucket ? bucket.label : "詳細";
    var rows = bucket ? bucket.rows : [];

    return [
      '<section class="aicm-core-card" style="border:1px solid #c7d2fe;">',
      '  <p class="aicm-eyebrow">サマリ詳細</p>',
      '  <h3>' + escapeHtml(label) + ' の詳細</h3>',
      '  <p class="aicm-selected-note">対象: <strong>' + escapeHtml(String(rows.length)) + '件</strong></p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="manager-major-summary-filter-clear">詳細表示を閉じる</button>',
      '  </div>',
      aicmRenderManagerMajorSummaryDetailRowsR8U(rows, label),
      '</section>'
    ].join("");
  }

  function aicmRenderManagerMajorSummarySectionR8U() {
    var summary = aicmManagerMajorSummaryCountsR8U();
    var cards = summary.buckets.map(function (bucket) {
      var selected = aicmSummaryTextR8U(state && state.managerMajorSummaryFilterR8U) === bucket.code;
      return [
        '<button type="button" data-core-action="manager-major-summary-filter" data-summary-filter="' + escapeHtml(bucket.code) + '" style="text-align:left;display:block;">',
        '  <span style="display:block;font-size:12px;color:#64748b;font-weight:900;">' + escapeHtml(bucket.label) + '</span>',
        '  <strong style="display:block;font-size:24px;margin-top:4px;">' + escapeHtml(String(bucket.count)) + '件</strong>',
        '  <span style="display:block;font-size:12px;margin-top:4px;color:#64748b;">' + escapeHtml(selected ? "選択中" : bucket.note) + '</span>',
        '</button>'
      ].join("");
    }).join("");

    return [
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Manager大項目サマリ</p>',
      '  <h2>大項目 件数サマリ</h2>',
      '  <p class="aicm-selected-note">Manager大項目から現在の状態別件数を表示します。件数カードを押すと詳細を確認できます。</p>',
      '  <p class="aicm-selected-note">合計: <strong>' + escapeHtml(String(summary.total)) + '件</strong></p>',
      '  <div class="aicm-dashboard-action-row">',
      cards,
      '  </div>',
      aicmRenderManagerMajorSummaryDetailR8U(summary),
      '</section>'
    ].join("");
  }

  function aicmManagerMajorSummaryActionTargetR8U(ev, btn) {
    if (typeof aicmActionTargetSafe === "function") {
      var safeTarget = aicmActionTargetSafe(ev, btn);
      if (safeTarget && safeTarget.getAttribute) return safeTarget;
    }

    if (btn && btn.getAttribute) return btn;

    if (ev && ev.target && ev.target.closest) {
      var closest = ev.target.closest("[data-core-action]");
      if (closest && closest.getAttribute) return closest;
    }

    return null;
  }
// AICM_R8U_MANAGER_MAJOR_SUMMARY_HELPER_END

// AICM_R8W_LEADER_AUTO_FLOW_DISPLAY_HELPER_START
  function aicmLeaderAutoTextR8W(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmLeaderAutoMajorIdR8W(row) {
    var r = row && typeof row === "object" ? row : {};
    return aicmLeaderAutoTextR8W(
      r.aicm_manager_major_work_item_id ||
      r.manager_major_work_item_id ||
      r.majorId ||
      r.major_id ||
      r.id
    );
  }

  function aicmLeaderAutoSelectedCompanyIdR8W() {
    if (state && state.selectedCompanyId) return aicmLeaderAutoTextR8W(state.selectedCompanyId);
    if (typeof selectedCompany === "function") {
      var company = selectedCompany();
      if (company && company.aicm_user_company_id) return aicmLeaderAutoTextR8W(company.aicm_user_company_id);
    }
    return "";
  }

  function aicmLeaderAutoAllMajorRowsR8W() {
    var ctx = state && state.context ? state.context : {};
    var rows = [];
    var seen = {};
    var selectedCompanyId = aicmLeaderAutoSelectedCompanyIdR8W();

    function add(list) {
      if (!Array.isArray(list)) return;
      for (var i = 0; i < list.length; i += 1) {
        var row = list[i];
        if (!row || typeof row !== "object") continue;

        var rowCompanyId = aicmLeaderAutoTextR8W(row.aicm_user_company_id);
        if (selectedCompanyId && rowCompanyId && selectedCompanyId !== rowCompanyId) continue;

        var id = aicmLeaderAutoMajorIdR8W(row);
        var key = id || ("auto_row_" + rows.length);
        if (seen[key]) continue;
        seen[key] = true;
        rows.push(row);
      }
    }

    add(ctx.pmlw_major_items);
    add(ctx.pmlwMajorItems);
    add(ctx.manager_major_items);
    add(ctx.managerMajorItems);
    add(ctx.major_items);
    add(ctx.majorItems);

    return rows;
  }

  function aicmLeaderAutoFlowRowsR8W() {
    var rows = aicmLeaderAutoAllMajorRowsR8W().filter(function (row) {
      var handoff = aicmLeaderAutoTextR8W(row && row.handoff_status_code).toLowerCase();
      var decomposition = aicmLeaderAutoTextR8W(row && row.decomposition_status_code).toLowerCase();

      if (handoff === "archived" || decomposition === "archived") return false;
      if (handoff === "deleted" || decomposition === "deleted") return false;

      return handoff === "handed_off" || decomposition === "assigned_to_leader";
    });

    rows.sort(function (a, b) {
      var au = aicmLeaderAutoTextR8W(a && (a.updated_at || a.created_at));
      var bu = aicmLeaderAutoTextR8W(b && (b.updated_at || b.created_at));
      if (au && bu && au !== bu) return au < bu ? 1 : -1;

      var ad = Number(a && a.display_order);
      var bd = Number(b && b.display_order);
      if (!Number.isFinite(ad)) ad = 999999;
      if (!Number.isFinite(bd)) bd = 999999;
      return ad - bd;
    });

    return rows;
  }

  function aicmLeaderAutoFlowStatusLabelR8W(row) {
    var handoff = aicmLeaderAutoTextR8W(row && row.handoff_status_code).toLowerCase();
    var decomposition = aicmLeaderAutoTextR8W(row && row.decomposition_status_code).toLowerCase();

    if (decomposition === "assigned_to_leader" || handoff === "handed_off") {
      return "自動分解待ち";
    }

    return "自動処理対象";
  }

  function aicmLeaderAutoPriorityLabelR8W(value) {
    var code = aicmLeaderAutoTextR8W(value).toLowerCase();
    if (code === "urgent") return "緊急";
    if (code === "high") return "高";
    if (code === "normal") return "通常";
    if (code === "low") return "低";
    return code || "未設定";
  }

  function aicmRenderLeaderAutoFlowRowsR8W(rows) {
    if (!Array.isArray(rows) || !rows.length) {
      return '<div class="aicm-empty-state"><strong>自動処理対象はまだありません</strong><p>課長へ送った大項目がここに表示されます。</p></div>';
    }

    var limit = 5;
    var visible = rows.slice(0, limit);
    var cards = visible.map(function (row, index) {
      var title = aicmLeaderAutoTextR8W(row && (row.major_item_name || row.deliverable_name || row.task_name)) || "Manager大項目";
      var description = aicmLeaderAutoTextR8W(row && (row.major_item_description || row.task_description || row.note));
      var leader = aicmLeaderAutoTextR8W(row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label)) || "自動割当";
      var due = aicmLeaderAutoTextR8W(row && row.due_date) || "未設定";
      var status = aicmLeaderAutoFlowStatusLabelR8W(row);

      return [
        '<article class="aicm-ledger-row">',
        '  <p class="aicm-eyebrow">自動処理対象 #' + escapeHtml(String(index + 1)) + '</p>',
        '  <h3>' + escapeHtml(title) + '</h3>',
        description ? '  <p class="aicm-selected-note">' + escapeHtml(description) + '</p>' : '',
        '  <dl class="aicm-ledger-meta">',
        '    <div><dt>自動状態</dt><dd>' + escapeHtml(status) + '</dd></div>',
        '    <div><dt>課長/Leader</dt><dd>' + escapeHtml(leader) + '</dd></div>',
        '    <div><dt>優先度</dt><dd>' + escapeHtml(aicmLeaderAutoPriorityLabelR8W(row && row.priority_code)) + '</dd></div>',
        '    <div><dt>期限</dt><dd>' + escapeHtml(due) + '</dd></div>',
        '  </dl>',
        '</article>'
      ].join("");
    }).join("");

    var more = rows.length > limit ? '<p class="aicm-selected-note">ほか ' + escapeHtml(String(rows.length - limit)) + '件はサマリ詳細で確認できます。</p>' : '';

    return [
      '<div class="aicm-ledger-list">',
      cards,
      '</div>',
      more
    ].join("");
  }

  function aicmRenderLeaderAutoFlowStatusR8W() {
    var rows = aicmLeaderAutoFlowRowsR8W();

    return [
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Leader以降自動処理</p>',
      '  <h2>課長以降は自動処理</h2>',
      '  <p class="aicm-selected-note">課長へ送ったManager大項目は、ユーザー操作なしでLeader分解・Worker展開へ進む前提です。ここでは自動処理対象の状態だけを確認します。</p>',
      '  <p class="aicm-selected-note">自動分解対象: <strong>' + escapeHtml(String(rows.length)) + '件</strong></p>',
      aicmRenderLeaderAutoFlowRowsR8W(rows),
      '</section>'
    ].join("");
  }
// AICM_R8W_LEADER_AUTO_FLOW_DISPLAY_HELPER_END

// AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_START
  function aicmR8ZBText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8ZBOwnerId() {
    if (state && state.ownerCivilizationId) return aicmR8ZBText(state.ownerCivilizationId);
    if (state && state.owner_civilization_id) return aicmR8ZBText(state.owner_civilization_id);
    if (state && state.context && state.context.owner_civilization_id) return aicmR8ZBText(state.context.owner_civilization_id);
    if (typeof aicmHumanReviewOwnerId === "function") {
      try {
        var ownerFromReview = aicmHumanReviewOwnerId();
        if (ownerFromReview) return aicmR8ZBText(ownerFromReview);
      } catch (_) {}
    }
    return "00000000-0000-4000-8000-000000000001";
  }

  function aicmR8ZBCompanyId() {
    if (state && state.selectedCompanyId) return aicmR8ZBText(state.selectedCompanyId);

    try {
      if (typeof selectedCompany === "function") {
        var company = selectedCompany();
        if (company && company.aicm_user_company_id) return aicmR8ZBText(company.aicm_user_company_id);
      }
    } catch (_) {}

    if (state && state.context && state.context.selectedCompanyId) return aicmR8ZBText(state.context.selectedCompanyId);
    if (state && state.context && state.context.aicm_user_company_id) return aicmR8ZBText(state.context.aicm_user_company_id);

    return "";
  }

  function aicmR8ZBAutoMessage(result) {
    var json = result && result.json ? result.json : {};
    var createdMiddle = Number(json.created_leader_middle_count || 0);
    var createdRequirement = Number(json.created_deliverable_requirement_count || 0);
    var createdWorker = Number(json.created_worker_work_unit_count || 0);
    var skipped = Number(json.skipped_count || 0);

    if (createdMiddle || createdRequirement || createdWorker) {
      return "課長へ送信し、Leader中項目/成果物要件/Worker作業単位を自動作成しました。";
    }

    if (skipped) {
      return "課長へ送信しました。Leader自動分解は既存データがあるためスキップしました。";
    }

    return "課長へ送信しました。Leader自動分解の対象はありませんでした。";
  }

  async function aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(majorId) {
    var safeMajorId = aicmR8ZBText(majorId);

    if (!safeMajorId && state && state.managerMajorLeaderHandoffConfirm) {
      safeMajorId = aicmR8ZBText(
        state.managerMajorLeaderHandoffConfirm.majorId ||
        state.managerMajorLeaderHandoffConfirm.aicm_manager_major_work_item_id ||
        state.managerMajorLeaderHandoffConfirm.manager_major_work_item_id
      );
    }

    var companyId = aicmR8ZBCompanyId();
    var ownerId = aicmR8ZBOwnerId();

    if (!safeMajorId) {
      return {
        ok: false,
        message: "Leader自動分解対象のManager大項目IDを特定できません。"
      };
    }

    if (!companyId) {
      return {
        ok: false,
        message: "Leader自動分解対象のAI企業IDを特定できません。"
      };
    }

    try {
      var response = await fetch("/api/aicm/v2/leader-auto-decomposition/run", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          owner_civilization_id: ownerId,
          aicm_user_company_id: companyId,
          aicm_manager_major_work_item_id: safeMajorId,
          mode: "single",
          source_app_ref: "AICompanyManager",
          auto_decomposition_version: "r8z_v1"
        })
      });

      var json = null;
      try {
        json = await response.json();
      } catch (_) {
        json = null;
      }

      if (!response.ok || !json || json.result !== "ok") {
        return {
          ok: false,
          json: json,
          message: json && (json.error_message || json.message || json.error)
            ? String(json.error_message || json.message || json.error)
            : "Leader自動分解APIに失敗しました。"
        };
      }

      return {
        ok: true,
        json: json,
        message: aicmR8ZBAutoMessage({ json: json })
      };
    } catch (error) {
      return {
        ok: false,
        message: error && error.message ? error.message : "Leader自動分解APIに失敗しました。"
      };
    }
  }


// AICM_R8Z_I_WORKER_AUTO_EXECUTION_CORE_START
  async function aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(majorId) {
    var body = {
      owner_civilization_id: state && state.ownerCivilizationId ? state.ownerCivilizationId : "00000000-0000-4000-8000-000000000001",
      aicm_user_company_id: state && state.selectedCompanyId ? state.selectedCompanyId : "",
      aicm_manager_major_work_item_id: majorId || "",
      limit: 10
    };

    var response = await fetch("/api/aicm/v2/worker-auto-execution/run", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    var json = null;
    try {
      json = await response.json();
    } catch (_) {
      json = null;
    }

    if (!response.ok || (json && json.result && json.result !== "ok")) {
      throw new Error(json && (json.error_message || json.message || json.error) ? (json.error_message || json.message || json.error) : "Worker自動実行に失敗しました。");
    }

    return json || {};
  }

  function aicmWorkerAutoExecutionMessageR8ZI(result) {
    var executed = result && typeof result.executed_count !== "undefined" ? Number(result.executed_count || 0) : 0;
    var failed = result && typeof result.failed_count !== "undefined" ? Number(result.failed_count || 0) : 0;

    if (failed > 0) {
      return "Leader自動分解後、Worker自動実行で一部エラーがありました。成功 " + String(executed) + "件 / 失敗 " + String(failed) + "件。";
    }

    return "Leader自動分解後、Worker自動実行requestを " + String(executed) + "件作成しました。";
  }
// AICM_R8Z_I_WORKER_AUTO_EXECUTION_CORE_END

// AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_END


function renderTaskLedgerPlaceholder() {
    // AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: screen
    var company = typeof selectedCompany === "function" ? selectedCompany() : null;
    var companyId = company && company.aicm_user_company_id ? company.aicm_user_company_id : "";
    var rows = aicmGetManagerMajorRowsForSelectedCompany(companyId);
    

    // AICM_R8V_REMOVE_LEADER_INBOX_UI_START
  // Leader受信箱 routine section removed.
  // Manager大項目サマリの Leader受信済み 件数/詳細を正面表示として使う。
// AICM_R8V_REMOVE_LEADER_INBOX_UI_END
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
      aicmRenderManagerMajorSummarySectionR8U(),
      aicmRenderLeaderAutoFlowStatusR8W(),
      renderCsvImportCard(company),
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Manager大項目</p>',
      '  <h2>登録済み大項目</h2>',
      aicmRenderManagerMajorRows(rows),
      '</section>'
    ].join(""));
  }
// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_START
  function aicmR8ZCText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8ZCHtml(value) {
    if (typeof escapeHtml === "function") return escapeHtml(aicmR8ZCText(value));
    return aicmR8ZCText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function aicmR8ZCContextArray(names) {
    var ctx = state && state.context && typeof state.context === "object" ? state.context : {};

    for (var i = 0; i < names.length; i += 1) {
      var key = names[i];

      if (Array.isArray(ctx[key])) return ctx[key];
      if (Array.isArray(state && state[key])) return state[key];
    }

    return [];
  }

  function aicmR8ZCSelectedCompanyId() {
    if (state && state.selectedCompanyId) return aicmR8ZCText(state.selectedCompanyId);

    try {
      if (typeof selectedCompany === "function") {
        var company = selectedCompany();
        if (company && company.aicm_user_company_id) return aicmR8ZCText(company.aicm_user_company_id);
      }
    } catch (_) {}

    return "";
  }

  function aicmR8ZCCompanyRows(rows) {
    var companyId = aicmR8ZCSelectedCompanyId();
    var source = Array.isArray(rows) ? rows : [];

    if (!companyId) return source;

    return source.filter(function (row) {
      return aicmR8ZCText(row && row.aicm_user_company_id) === companyId;
    });
  }

  function aicmR8ZCOutputRows() {
    return {
      middles: aicmR8ZCCompanyRows(aicmR8ZCContextArray([
        "pmlw_middle_items",
        "pmlwMiddleItems",
        "leader_middle_items",
        "leaderMiddleItems"
      ])),
      requirements: aicmR8ZCCompanyRows(aicmR8ZCContextArray([
        "pmlw_deliverable_requirements",
        "pmlwDeliverableRequirements",
        "deliverable_requirements",
        "deliverableRequirements"
      ])),
      workers: aicmR8ZCCompanyRows(aicmR8ZCContextArray([
        "pmlw_worker_work_units",
        "pmlwWorkerWorkUnits",
        "worker_work_units",
        "workerWorkUnits"
      ]))
    };
  }

  function aicmR8ZCStatusText(row, names) {
    for (var i = 0; i < names.length; i += 1) {
      var value = aicmR8ZCText(row && row[names[i]]);
      if (value) return value;
    }

    return "-";
  }

  function aicmRenderPmlwRequirementRowsR8ZC(rows) {
    var list = Array.isArray(rows) ? rows.slice(0, 8) : [];

    if (!list.length) {
      return '<p class="aicm-core-empty">成果物要件はまだありません。課長へ送る確定後、Leader自動分解が成功するとここに出ます。</p>';
    }

    return [
      '<div class="aicm-ledger-list">',
      list.map(function (row) {
        var name = aicmR8ZCStatusText(row, ["deliverable_name", "requirement_name", "title"]);
        var type = aicmR8ZCStatusText(row, ["deliverable_type_code", "deliverable_type"]);
        var status = aicmR8ZCStatusText(row, ["requirement_status_code", "status_code"]);
        var priority = aicmR8ZCStatusText(row, ["priority_code"]);
        var due = aicmR8ZCStatusText(row, ["due_date"]);
        var desc = aicmR8ZCStatusText(row, ["deliverable_description", "description", "required_quality_text"]);

        return [
          '<article class="aicm-ledger-row">',
          '  <div class="aicm-ledger-row-head"><strong>' + aicmR8ZCHtml(name) + '</strong><em>' + aicmR8ZCHtml(status) + '</em></div>',
          '  <dl class="aicm-ledger-meta">',
          '    <div><dt>種類</dt><dd>' + aicmR8ZCHtml(type) + '</dd></div>',
          '    <div><dt>優先度</dt><dd>' + aicmR8ZCHtml(priority) + '</dd></div>',
          '    <div><dt>期限</dt><dd>' + aicmR8ZCHtml(due) + '</dd></div>',
          '    <div><dt>出力先</dt><dd>成果物要件</dd></div>',
          '  </dl>',
          desc && desc !== "-" ? '  <p class="aicm-ledger-note">' + aicmR8ZCHtml(desc) + '</p>' : '',
          '</article>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }

  function aicmRenderPmlwWorkerRowsR8ZC(rows) {
    var list = Array.isArray(rows) ? rows.slice(0, 8) : [];

    if (!list.length) {
      return '<p class="aicm-core-empty">Worker作業単位はまだありません。成果物要件と同時に自動作成されます。</p>';
    }

    return [
      '<div class="aicm-ledger-list">',
      list.map(function (row) {
        var name = aicmR8ZCStatusText(row, ["work_unit_name", "task_name", "title"]);
        var worker = aicmR8ZCStatusText(row, ["assigned_worker_label", "worker_label"]);
        var model = aicmR8ZCStatusText(row, ["worker_model_code", "aiworker_model_code", "model_code"]);
        var status = aicmR8ZCStatusText(row, ["work_status_code", "status_code"]);
        var review = aicmR8ZCStatusText(row, ["review_status_code"]);
        var desc = aicmR8ZCStatusText(row, ["work_unit_description", "description", "expected_output_text"]);

        return [
          '<article class="aicm-ledger-row">',
          '  <div class="aicm-ledger-row-head"><strong>' + aicmR8ZCHtml(name) + '</strong><em>' + aicmR8ZCHtml(status) + '</em></div>',
          '  <dl class="aicm-ledger-meta">',
          '    <div><dt>Worker</dt><dd>' + aicmR8ZCHtml(worker) + '</dd></div>',
          '    <div><dt>モデル</dt><dd>' + aicmR8ZCHtml(model) + '</dd></div>',
          '    <div><dt>レビュー</dt><dd>' + aicmR8ZCHtml(review) + '</dd></div>',
          '    <div><dt>出力先</dt><dd>Worker作業単位</dd></div>',
          '  </dl>',
          desc && desc !== "-" ? '  <p class="aicm-ledger-note">' + aicmR8ZCHtml(desc) + '</p>' : '',
          '</article>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }

  function aicmRenderPmlwAutoOutputsPanelR8ZC() {
    var rows = aicmR8ZCOutputRows();
    var middleCount = rows.middles.length;
    var reqCount = rows.requirements.length;
    var workerCount = rows.workers.length;

    return [
      '<section class="aicm-core-card aicm-r8z-output-panel">',
      '  <p class="aicm-eyebrow">Leader以降の出力</p>',
      '  <h2>成果物要件 / Worker作業単位</h2>',
      '  <p class="aicm-selected-note">実ファイルの成果物ではなく、まず成果物要件とWorker作業単位が自動作成されます。Worker実行後の実成果物はレビュー・承認待ち一覧やhandoff_link側に出す流れです。</p>',
      '  <dl class="aicm-overview-count-row">',
      '    <div><dt>Leader中項目</dt><dd>' + aicmR8ZCHtml(String(middleCount)) + '</dd></div>',
      '    <div><dt>成果物要件</dt><dd>' + aicmR8ZCHtml(String(reqCount)) + '</dd></div>',
      '    <div><dt>Worker作業単位</dt><dd>' + aicmR8ZCHtml(String(workerCount)) + '</dd></div>',
      '  </dl>',
      '  <section class="aicm-csv-template">',
      '    <h3>成果物要件</h3>',
      aicmRenderPmlwRequirementRowsR8ZC(rows.requirements),
      '  </section>',
      '  <section class="aicm-csv-template">',
      '    <h3>Worker作業単位</h3>',
      aicmRenderPmlwWorkerRowsR8ZC(rows.workers),
      '  </section>',
      '</section>'
    ].join("");
  }

  function aicmInjectPmlwAutoOutputsPanelR8ZC(html) {
    var panel = aicmRenderPmlwAutoOutputsPanelR8ZC();
    var source = String(html || "");

    // AICM_R8Z_C2_OUTPUT_PANEL_POSITION_V1
    // Prefer showing this directly after Manager大項目サマリ and before CSV/import/list sections.
    var anchors = [
      '<section class="aicm-core-card aicm-csv-panel">',
      '<section class="aicm-core-card"><p class="aicm-eyebrow">Manager大項目</p>',
      '<section class="aicm-core-card">\n  <p class="aicm-eyebrow">Manager大項目</p>',
      '<p class="aicm-eyebrow">CSV取り込み</p>'
    ];

    for (var i = 0; i < anchors.length; i += 1) {
      var anchor = anchors[i];
      var index = source.indexOf(anchor);

      if (index >= 0) {
        return source.slice(0, index) + panel + source.slice(index);
      }
    }

    if (source.indexOf('</main>') >= 0) {
      return source.replace('</main>', panel + '</main>');
    }

    return source + panel;
  }

  var aicmRenderTaskLedgerPlaceholderBeforeR8ZC = renderTaskLedgerPlaceholder;

  renderTaskLedgerPlaceholder = function renderTaskLedgerPlaceholder() {
    return aicmInjectPmlwAutoOutputsPanelR8ZC(
      aicmRenderTaskLedgerPlaceholderBeforeR8ZC()
    );
  };
// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_END


// AICM_R8Z_N_WORKER_RUNTIME_STATUS_PANEL_START
  function aicmR8ZNText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8ZNHtml(value) {
    var text = aicmR8ZNText(value);
    if (typeof escapeHtml === "function") return escapeHtml(text);
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function aicmR8ZNMetadata(row) {
    var meta = row && (row.metadata_jsonb || row.metadata || row.meta) || {};
    if (typeof meta === "string") {
      try {
        meta = JSON.parse(meta);
      } catch (_) {
        meta = {};
      }
    }
    if (!meta || typeof meta !== "object") meta = {};
    return meta;
  }

  function aicmR8ZNDeepGet(source, path) {
    var cur = source;
    for (var i = 0; i < path.length; i += 1) {
      if (!cur || typeof cur !== "object") return "";
      cur = cur[path[i]];
    }
    return cur;
  }

  function aicmR8ZNRowsFromContext() {
    var ctx = state && state.context ? state.context : {};
    var keys = [
      "pmlw_worker_work_units",
      "pmlwWorkerWorkUnits",
      "worker_work_units",
      "workerWorkUnits"
    ];

    for (var i = 0; i < keys.length; i += 1) {
      var rows = ctx[keys[i]];
      if (Array.isArray(rows)) return rows.slice();
    }

    return [];
  }

  function aicmR8ZNRuntimeStatus(row) {
    var meta = aicmR8ZNMetadata(row);
    var runtimeResult = meta.runtime_result || {};
    var runtimeRequest = runtimeResult.runtime_request || {};
    var aiworkerResponse = runtimeResult.aiworker_response || {};

    return {
      requestId: aicmR8ZNText(
        runtimeRequest.request_id ||
        aiworkerResponse.request_id ||
        meta.request_id ||
        ""
      ),
      runtimeResult: aicmR8ZNText(runtimeResult.result || ""),
      aiworkerResult: aicmR8ZNText(aiworkerResponse.result || ""),
      aiworkerStatus: aicmR8ZNText(aiworkerResponse.status || ""),
      sourceRequestRef: aicmR8ZNText(
        runtimeRequest.source_request_ref ||
        meta.source_request_ref ||
        ""
      ),
      idempotencyKey: aicmR8ZNText(
        runtimeRequest.idempotency_key ||
        aiworkerResponse.idempotency_key ||
        ""
      ),
      modelCode: aicmR8ZNText(
        runtimeRequest.model_code ||
        row.worker_model_code ||
        row.model_code ||
        ""
      ),
      autoExecution: aicmR8ZNText(meta.auto_execution || ""),
      autoExecutionVersion: aicmR8ZNText(meta.auto_execution_version || ""),
      startedAt: aicmR8ZNText(meta.started_at || "")
    };
  }

  function aicmR8ZNStatusLabel(row) {
    var work = aicmR8ZNText(row && row.work_status_code);
    var review = aicmR8ZNText(row && row.review_status_code);
    var rt = aicmR8ZNRuntimeStatus(row);

    if (work === "in_progress" && rt.requestId) return "実行依頼済み / 進行中";
    if (work === "in_progress") return "進行中";
    if (work === "todo") return "実行待ち";
    if (work === "done" || work === "completed") return "完了";
    if (work === "review_waiting") return "レビュー待ち";
    if (work === "blocked") return "停止中";
    return work || review || "未設定";
  }

  function aicmR8ZNWorkerRuntimeSummary(rows) {
    var summary = {
      total: rows.length,
      todo: 0,
      inProgress: 0,
      done: 0,
      reviewWaiting: 0,
      autoExecution: 0,
      runtimeOk: 0,
      accepted: 0
    };

    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i] || {};
      var work = aicmR8ZNText(row.work_status_code);
      var rt = aicmR8ZNRuntimeStatus(row);

      if (work === "todo") summary.todo += 1;
      if (work === "in_progress") summary.inProgress += 1;
      if (work === "done" || work === "completed") summary.done += 1;
      if (work === "review_waiting") summary.reviewWaiting += 1;
      if (rt.autoExecution === "worker_runtime_request") summary.autoExecution += 1;
      if (rt.runtimeResult === "ok") summary.runtimeOk += 1;
      if (rt.aiworkerResult === "accepted" || rt.aiworkerStatus === "REQUESTED_INTERNAL_ONLY") summary.accepted += 1;
    }

    return summary;
  }

  function aicmR8ZNSortRows(rows) {
    return rows.slice().sort(function (a, b) {
      var au = aicmR8ZNText(a && a.updated_at);
      var bu = aicmR8ZNText(b && b.updated_at);
      if (au !== bu) return bu.localeCompare(au);

      var ad = Number(a && a.display_order || 0);
      var bd = Number(b && b.display_order || 0);
      return ad - bd;
    });
  }

  function aicmRenderR8ZNWorkerRuntimeStatusPanel() {
    var rows = aicmR8ZNSortRows(aicmR8ZNRowsFromContext());
    var summary = aicmR8ZNWorkerRuntimeSummary(rows);

    var cards = rows.slice(0, 10).map(function (row) {
      var rt = aicmR8ZNRuntimeStatus(row);
      var title = aicmR8ZNText(row && (row.work_unit_name || row.task_title || row.task_name)) || "Worker作業単位";
      var worker = aicmR8ZNText(row && (row.assigned_worker_label || row.worker_label)) || "未割当";
      var model = rt.modelCode || aicmR8ZNText(row && row.worker_model_code) || "-";
      var statusLabel = aicmR8ZNStatusLabel(row);
      var requestId = rt.requestId || "-";
      var accepted = rt.aiworkerStatus || rt.aiworkerResult || "-";
      var sourceRef = rt.sourceRequestRef || "-";
      var updatedAt = aicmR8ZNText(row && row.updated_at) || "-";

      return [
        '<article class="aicm-core-card" style="box-shadow:none;border-radius:16px;padding:14px;">',
        '  <div class="aicm-card-title-row">',
        '    <div>',
        '      <p class="aicm-eyebrow">Worker作業単位</p>',
        '      <h3 style="margin:0;font-size:18px;">' + aicmR8ZNHtml(title) + '</h3>',
        '    </div>',
        '    <strong>' + aicmR8ZNHtml(statusLabel) + '</strong>',
        '  </div>',
        '  <dl class="aicm-overview-list">',
        '    <div><dt>Worker</dt><dd>' + aicmR8ZNHtml(worker) + '</dd></div>',
        '    <div><dt>model</dt><dd>' + aicmR8ZNHtml(model) + '</dd></div>',
        '    <div><dt>request_id</dt><dd>' + aicmR8ZNHtml(requestId) + '</dd></div>',
        '    <div><dt>AIWorkerOS受付</dt><dd>' + aicmR8ZNHtml(accepted) + '</dd></div>',
        '    <div><dt>source_request_ref</dt><dd>' + aicmR8ZNHtml(sourceRef) + '</dd></div>',
        '    <div><dt>updated_at</dt><dd>' + aicmR8ZNHtml(updatedAt) + '</dd></div>',
        '  </dl>',
        '</article>'
      ].join("");
    }).join("");

    if (!rows.length) {
      cards = [
        '<div class="aicm-empty-state">',
        '  <strong>Worker作業単位はまだありません。</strong>',
        '  <p>課長へ送る後、Leader自動分解とWorker作業単位作成が完了するとここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<section id="aicm-r8z-n-worker-runtime-status" class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Worker実行状況</p>',
      '  <h2>AIWorkerOS実行受付状況</h2>',
      '  <p class="aicm-selected-note">Worker作業単位がAIWorkerOS runtimeへ依頼されたか、request_idと受付状態で確認します。ここは表示専用です。</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <span>合計: <strong>' + aicmR8ZNHtml(summary.total) + '</strong></span>',
      '    <span>実行待ち: <strong>' + aicmR8ZNHtml(summary.todo) + '</strong></span>',
      '    <span>進行中: <strong>' + aicmR8ZNHtml(summary.inProgress) + '</strong></span>',
      '    <span>自動実行依頼済み: <strong>' + aicmR8ZNHtml(summary.autoExecution) + '</strong></span>',
      '    <span>runtime ok: <strong>' + aicmR8ZNHtml(summary.runtimeOk) + '</strong></span>',
      '    <span>accepted: <strong>' + aicmR8ZNHtml(summary.accepted) + '</strong></span>',
      '  </div>',
      '  <div class="aicm-dashboard-grid" style="margin-top:14px;">',
      cards,
      '  </div>',
      '</section>'
    ].join("");
  }

  (function aicmInstallR8ZNWorkerRuntimeStatusPanel() {
    try {
      if (typeof aicmRenderR8ZCOutputVisibilityPanel === "function" && !aicmRenderR8ZCOutputVisibilityPanel.__r8znWrapped) {
        var originalR8ZCOutputPanel = aicmRenderR8ZCOutputVisibilityPanel;
        var wrappedR8ZCOutputPanel = function () {
          var baseHtml = "";
          try {
            baseHtml = originalR8ZCOutputPanel.apply(this, arguments) || "";
          } catch (error) {
            baseHtml = [
              '<section class="aicm-core-card">',
              '  <p class="aicm-eyebrow">Leader以降の出力</p>',
              '  <p class="aicm-core-message aicm-core-message-error">Leader以降の出力パネル描画に失敗しました。</p>',
              '</section>'
            ].join("");
          }

          return String(baseHtml || "") + aicmRenderR8ZNWorkerRuntimeStatusPanel();
        };

        wrappedR8ZCOutputPanel.__r8znWrapped = true;
        wrappedR8ZCOutputPanel.__r8znOriginal = originalR8ZCOutputPanel;
        aicmRenderR8ZCOutputVisibilityPanel = wrappedR8ZCOutputPanel;
        return;
      }

      if (typeof renderTaskLedgerPlaceholder === "function" && !renderTaskLedgerPlaceholder.__r8znWrapped) {
        var originalTaskLedgerPlaceholder = renderTaskLedgerPlaceholder;
        var wrappedTaskLedgerPlaceholder = function () {
          var base = originalTaskLedgerPlaceholder.apply(this, arguments);
          return String(base || "") + aicmRenderR8ZNWorkerRuntimeStatusPanel();
        };

        wrappedTaskLedgerPlaceholder.__r8znWrapped = true;
        wrappedTaskLedgerPlaceholder.__r8znOriginal = originalTaskLedgerPlaceholder;
        renderTaskLedgerPlaceholder = wrappedTaskLedgerPlaceholder;
      }
    } catch (error) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("AICM R8Z-N worker runtime status panel install skipped", error);
      }
    }
  })();
// AICM_R8Z_N_WORKER_RUNTIME_STATUS_PANEL_END


  


/* AICM_R8Z_V9G5_RESTORE_DELETE_CONFIRM_EXECUTE_BRIDGE_ONLY
 * Restore only delete-confirm execute/cancel click bridge.
 * Patch itself does not call API.
 * User click on delete-confirm execute will POST/archive the selected Manager大項目.
 */
function aicmR8zV9g5Text(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function aicmR8zV9g5DeleteConfirmState() {
  return state && state.managerMajorDeleteConfirm && typeof state.managerMajorDeleteConfirm === "object"
    ? state.managerMajorDeleteConfirm
    : null;
}

function aicmR8zV9g5OwnerId(payload) {
  payload = payload || {};
  var body = payload.body && typeof payload.body === "object" ? payload.body : {};
  return aicmR8zV9g5Text(
    body.owner_civilization_id ||
    payload.owner_civilization_id ||
    (payload.row && payload.row.owner_civilization_id) ||
    (state && state.ownerCivilizationId) ||
    (state && state.owner_civilization_id) ||
    (state && state.context && state.context.owner_civilization_id) ||
    "00000000-0000-4000-8000-000000000001"
  );
}

function aicmR8zV9g5MajorId(payload, btn) {
  payload = payload || {};
  var body = payload.body && typeof payload.body === "object" ? payload.body : {};

  var fromButton = "";
  try {
    if (btn && btn.getAttribute) {
      fromButton = btn.getAttribute("data-major-id") ||
        btn.getAttribute("data-manager-major-id") ||
        btn.getAttribute("data-id") ||
        "";
    }
  } catch (_) {}

  return aicmR8zV9g5Text(
    body.aicm_manager_major_work_item_id ||
    payload.aicm_manager_major_work_item_id ||
    payload.majorId ||
    payload.managerMajorId ||
    (payload.row && (
      payload.row.aicm_manager_major_work_item_id ||
      payload.row.manager_major_work_item_id ||
      payload.row.major_work_item_id ||
      payload.row.id
    )) ||
    fromButton ||
    ""
  );
}

async function aicmR8zV9g5ExecuteDeleteConfirm(btn) {
  // AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE: V9G5 owns confirmed delete via manager-major/update fallback.
  var payload = aicmR8zV9g5DeleteConfirmState();

  if (!payload) {
    if (typeof setMessage === "function") setMessage("error", "削除確認情報が見つかりません。もう一度削除を押してください。");
    if (typeof render === "function") render();
    return;
  }

  var majorId = aicmR8zV9g5MajorId(payload, btn);
  var owner = aicmR8zV9g5OwnerId(payload);

  if (!majorId) {
    if (typeof setMessage === "function") setMessage("error", "削除対象のManager大項目IDを特定できません。");
    if (typeof render === "function") render();
    return;
  }

  // AICM_V10L_C2G_B2_SIMPLE_MULTI_DELETE_EXECUTE_START
  var aicmC2gDeleteIds = [];
  if (payload && Array.isArray(payload.ids)) {
    for (var aicmC2gDi = 0; aicmC2gDi < payload.ids.length; aicmC2gDi += 1) {
      var aicmC2gDv = String(payload.ids[aicmC2gDi] || "").trim();
      if (aicmC2gDv && aicmC2gDeleteIds.indexOf(aicmC2gDv) < 0) aicmC2gDeleteIds.push(aicmC2gDv);
    }
  }
  if (!aicmC2gDeleteIds.length && majorId) aicmC2gDeleteIds.push(String(majorId).trim());

  if (aicmC2gDeleteIds.length > 1) {
    var aicmC2gDeleteOk = 0;
    var aicmC2gDeleteNg = [];

    try {
      if (typeof setMessage === "function") setMessage("info", "複数件削除を実行しています。");

      for (var aicmC2gDj = 0; aicmC2gDj < aicmC2gDeleteIds.length; aicmC2gDj += 1) {
        var aicmC2gDeleteId = aicmC2gDeleteIds[aicmC2gDj];

        try {
          var postBody = {
            owner_civilization_id: owner,
            aicm_manager_major_work_item_id: aicmC2gDeleteId,
            decomposition_status_code: "archived",
            handoff_status_code: "archived",
            note: aicmR8zV9g5Text(
              (payload.body && payload.body.note) ||
              (payload.row && payload.row.note) ||
              ""
            )
          };

          var result = null;

          if (typeof requestJson === "function") {
            result = await requestJson("/api/aicm/v2/manager-major/update", postBody);
          } else {
            var response = await fetch("/api/aicm/v2/manager-major/update", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(postBody)
            });

            var json = null;
            try { json = await response.json(); } catch (_) { json = null; }

            if (!response.ok || (json && json.result && json.result !== "ok")) {
              throw new Error(
                json && (json.error_message || json.message || json.error)
                  ? (json.error_message || json.message || json.error)
                  : "削除更新に失敗しました。"
              );
            }

            result = json || {};
          }

          aicmC2gDeleteOk += 1;
        } catch (aicmC2gDeleteErr) {
          aicmC2gDeleteNg.push(aicmC2gDeleteId + ": " + (aicmC2gDeleteErr && aicmC2gDeleteErr.message ? aicmC2gDeleteErr.message : "失敗"));
        }
      }

      state.managerMajorDeleteConfirm = null;
      state.screen = "task-ledger";

      if (aicmC2gDeleteNg.length) {
        if (typeof setMessage === "function") setMessage("error", "削除: " + String(aicmC2gDeleteOk) + "件成功 / " + String(aicmC2gDeleteNg.length) + "件失敗");
      } else {
        if (typeof setMessage === "function") setMessage("ok", String(aicmC2gDeleteOk) + "件を削除済み扱いにしました。");
      }

      if (typeof aicmReloadTaskLedgerContext === "function") {
        await aicmReloadTaskLedgerContext();
      } else if (typeof render === "function") {
        render();
      }
      return;
    } catch (aicmC2gOuterDeleteErr) {
      if (typeof setMessage === "function") setMessage("error", aicmC2gOuterDeleteErr && aicmC2gOuterDeleteErr.message ? aicmC2gOuterDeleteErr.message : "複数件削除に失敗しました。");
      if (typeof render === "function") render();
      return;
    }
  }
  // AICM_V10L_C2G_B2_SIMPLE_MULTI_DELETE_EXECUTE_END

  try {
    if (typeof setMessage === "function") setMessage("info", "削除を実行しています。");

    if (false && typeof aicmExecuteMajorItemDeleteConfirmR8P === "function") { // AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE: skip old1
      try {
        await aicmExecuteMajorItemDeleteConfirmR8P();
        return;
      } catch (existingError1) {
        if (typeof console !== "undefined" && console.warn) console.warn("existing delete execute R8P failed; fallback follows", existingError1);
      }
    }

    if (false && typeof aicmExecuteManagerMajorDeleteConfirmR8P === "function") { // AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE: skip old2
      try {
        await aicmExecuteManagerMajorDeleteConfirmR8P();
        return;
      } catch (existingError2) {
        if (typeof console !== "undefined" && console.warn) console.warn("existing manager delete execute R8P failed; fallback follows", existingError2);
      }
    }

    var postBody = {
      owner_civilization_id: owner,
      aicm_manager_major_work_item_id: majorId,
      decomposition_status_code: "archived",
      handoff_status_code: "archived",
      note: aicmR8zV9g5Text(
        (payload.body && payload.body.note) ||
        (payload.row && payload.row.note) ||
        ""
      )
    };

    var result = null;

    if (typeof requestJson === "function") {
      result = await requestJson("/api/aicm/v2/manager-major/update", postBody);
    } else {
      var response = await fetch("/api/aicm/v2/manager-major/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(postBody)
      });

      var json = null;
      try { json = await response.json(); } catch (_) { json = null; }

      if (!response.ok || (json && json.result && json.result !== "ok")) {
        throw new Error(
          json && (json.error_message || json.message || json.error)
            ? (json.error_message || json.message || json.error)
            : "削除更新に失敗しました。"
        );
      }

      result = json || {};
    }

    state.managerMajorDeleteConfirm = null;
    state.screen = "task-ledger";

    try {
      if (typeof aicmReloadTaskLedgerContext === "function") {
        await aicmReloadTaskLedgerContext();
      } else if (typeof refreshContext === "function") {
        await refreshContext();
      } else if (typeof loadContext === "function") {
        await loadContext();
      } else {
        var responseReload = await fetch("/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner) + "&v=r8z_v9g5_" + Date.now());
        var contextJson = await responseReload.json();
        if (contextJson && contextJson.result === "ok") state.context = contextJson;
      }
    } catch (reloadError) {
      if (typeof console !== "undefined" && console.warn) console.warn("delete context reload skipped", reloadError);
    }

    if (typeof setMessage === "function") setMessage("ok", "Manager大項目を削除しました。");

    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_execute_done");
    } else if (typeof render === "function") {
      render();
    }

    return result || {};
  } catch (error) {
    if (typeof setMessage === "function") {
      setMessage("error", error && error.message ? error.message : "削除に失敗しました。");
    }
    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_execute_error");
    } else if (typeof render === "function") {
      render();
    }
    throw error;
  }
}

function aicmR8zV9g5CancelDeleteConfirm() {
  if (state) state.managerMajorDeleteConfirm = null;
  if (typeof setMessage === "function") setMessage("info", "削除をキャンセルしました。");

  if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
    aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_cancel");
  } else if (typeof render === "function") {
    render();
  }
}

(function aicmInstallR8zV9g5DeleteConfirmExecuteBridge() {
  try {
    if (typeof document !== "undefined" && document.addEventListener && typeof window !== "undefined") {
      if (!window.__aicmR8zV9g5DeleteConfirmExecuteBridgeInstalled) {
        window.__aicmR8zV9g5DeleteConfirmExecuteBridgeInstalled = true;

        document.addEventListener("click", function aicmR8zV9g5DeleteConfirmClickBridge(ev) {
          try {
            var target = ev && ev.target;
            var btn = target && typeof target.closest === "function"
              ? target.closest("[data-core-action], button")
              : null;

            if (!btn || !btn.getAttribute) return;

            var action = aicmR8zV9g5Text(btn.getAttribute("data-core-action"));
            var label = aicmR8zV9g5Text(btn.textContent || btn.innerText || "");

            var isDeleteExecuteAction =
              action === "pmlw-major-delete-execute" ||
              action === "manager-major-delete-execute" ||
              action === "major-delete-execute" ||
              action === "delete-major-confirm" ||
              action === "r8z-v9g-delete-execute" ||
              action === "r8z-v9g5-delete-execute";

            var isDeleteCancelAction =
              action === "pmlw-major-delete-cancel" ||
              action === "manager-major-delete-cancel" ||
              action === "major-delete-cancel" ||
              action === "delete-major-cancel" ||
              action === "r8z-v9g-delete-cancel" ||
              action === "r8z-v9g5-delete-cancel";

            var hasDeleteState = !!aicmR8zV9g5DeleteConfirmState();

            if (!isDeleteExecuteAction && hasDeleteState && /削除/.test(label) && /確定|実行|削除する|はい/.test(label)) {
              isDeleteExecuteAction = true;
            }

            if (!isDeleteCancelAction && hasDeleteState && /キャンセル|戻る|いいえ/.test(label)) {
              isDeleteCancelAction = true;
            }

            if (isDeleteExecuteAction) {
              ev.preventDefault();
              ev.stopPropagation();
              aicmR8zV9g5ExecuteDeleteConfirm(btn);
              return;
            }

            if (isDeleteCancelAction) {
              ev.preventDefault();
              ev.stopPropagation();
              aicmR8zV9g5CancelDeleteConfirm();
            }
          } catch (error) {
            try {
              if (typeof setMessage === "function") setMessage("error", error && error.message ? error.message : "削除操作でエラーが発生しました。");
              if (typeof render === "function") render();
            } catch (_) {}
          }
        }, true);
      }
    }
  } catch (error) {
    try {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("AICM R8Z-V9G5 delete confirm execute bridge install skipped", error);
      }
    } catch (_) {}
  }
})();

/* AICM_R8Z_V9F6_RESTORE_LEADER_HANDOFF_EXECUTE_ONLY
 * Restore only the missing execute entrypoint for the already-visible
 * Manager大項目 -> 課長へ送る confirmation card.
 * Patch execution itself does not write DB or call API.
 * User click on the confirm button will POST to /api/aicm/v2/manager-major/update.
 */
async function aicmExecuteLeaderHandoffConfirmR8S() {
  var payload = state && state.managerMajorLeaderHandoffConfirm;

  try {
    if (!payload || typeof payload !== "object") {
      throw new Error("課長へ送る確認情報が見つかりません。もう一度「課長へ送る」を押してください。");
    }

    var body = payload.body && typeof payload.body === "object" ? payload.body : {};

    var owner = String(
      body.owner_civilization_id ||
      (typeof aicmLeaderHandoffOwnerIdR8S === "function" ? aicmLeaderHandoffOwnerIdR8S(payload.row || payload) : "") ||
      (state && state.ownerCivilizationId) ||
      (state && state.owner_civilization_id) ||
      (state && state.context && state.context.owner_civilization_id) ||
      "00000000-0000-4000-8000-000000000001"
    ).trim();

    var majorId = String(
      body.aicm_manager_major_work_item_id ||
      payload.majorId ||
      payload.aicm_manager_major_work_item_id ||
      ""
    ).trim();

    if (!owner) throw new Error("owner_civilization_idを特定できません。");
    if (!majorId) throw new Error("Manager大項目IDを特定できません。");

    var leader = String(
      body.assigned_leader_label ||
      payload.leaderLabel ||
      payload.leaderRaw ||
      (payload.row && (payload.row.assigned_leader_label || payload.row.leader_robot_label)) ||
      "課長/Leader"
    ).trim();

    var postBody = {
      owner_civilization_id: owner,
      aicm_manager_major_work_item_id: majorId,
      assigned_leader_label: leader,
      decomposition_status_code: "assigned_to_leader",
      handoff_status_code: "handed_off",
      note: String(body.note || (payload.row && payload.row.note) || "").trim()
    };

    if (typeof setMessage === "function") {
      setMessage("info", "課長へ送る処理を実行しています。");
    }

    var result = null;

    if (typeof requestJson === "function") {
      result = await requestJson("/api/aicm/v2/manager-major/update", postBody);
    } else {
    // AICM_R8Z_MGR_MAJOR_CARD_C2F_D2_EXECUTE_PAYLOAD_VALIDATION_GATE_START
    // Execute-path payload validation gate.
    // Validates the existing postBody variable immediately before the network request.
    // This phase intentionally keeps API POST locked until explicit approval.
    try {
      function aicmC2fD2Text(value) {
        if (value === null || typeof value === "undefined") return "";
        return String(value).trim();
      }

      function aicmC2fD2IsObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
      }

      function aicmC2fD2FindFirst(obj, keys, depth) {
        if (depth > 6 || obj === null || typeof obj === "undefined") return "";
        if (Array.isArray(obj)) {
          for (var aicmC2fD2AI = 0; aicmC2fD2AI < obj.length; aicmC2fD2AI += 1) {
            var aicmC2fD2AValue = aicmC2fD2FindFirst(obj[aicmC2fD2AI], keys, depth + 1);
            if (aicmC2fD2AValue) return aicmC2fD2AValue;
          }
          return "";
        }
        if (!aicmC2fD2IsObject(obj)) return "";
        for (var aicmC2fD2KI = 0; aicmC2fD2KI < keys.length; aicmC2fD2KI += 1) {
          var aicmC2fD2Key = keys[aicmC2fD2KI];
          if (Object.prototype.hasOwnProperty.call(obj, aicmC2fD2Key)) {
            var aicmC2fD2Direct = aicmC2fD2Text(obj[aicmC2fD2Key]);
            if (aicmC2fD2Direct) return aicmC2fD2Direct;
          }
        }
        var aicmC2fD2ObjKeys = Object.keys(obj);
        for (var aicmC2fD2OI = 0; aicmC2fD2OI < aicmC2fD2ObjKeys.length; aicmC2fD2OI += 1) {
          var aicmC2fD2Nested = aicmC2fD2FindFirst(obj[aicmC2fD2ObjKeys[aicmC2fD2OI]], keys, depth + 1);
          if (aicmC2fD2Nested) return aicmC2fD2Nested;
        }
        return "";
      }

      function aicmC2fD2FindArray(obj, keys, depth) {
        if (depth > 6 || obj === null || typeof obj === "undefined") return [];
        if (Array.isArray(obj)) {
          return obj;
        }
        if (!aicmC2fD2IsObject(obj)) return [];
        for (var aicmC2fD2KI = 0; aicmC2fD2KI < keys.length; aicmC2fD2KI += 1) {
          var aicmC2fD2Key = keys[aicmC2fD2KI];
          if (Object.prototype.hasOwnProperty.call(obj, aicmC2fD2Key) && Array.isArray(obj[aicmC2fD2Key])) {
            return obj[aicmC2fD2Key];
          }
        }
        var aicmC2fD2ObjKeys = Object.keys(obj);
        for (var aicmC2fD2OI = 0; aicmC2fD2OI < aicmC2fD2ObjKeys.length; aicmC2fD2OI += 1) {
          var aicmC2fD2NestedArray = aicmC2fD2FindArray(obj[aicmC2fD2ObjKeys[aicmC2fD2OI]], keys, depth + 1);
          if (aicmC2fD2NestedArray.length) return aicmC2fD2NestedArray;
        }
        return [];
      }

      var aicmC2fD2Payload = postBody || {};
      var aicmC2fD2Missing = [];

      var aicmC2fD2Ids = aicmC2fD2FindArray(aicmC2fD2Payload, [
        "selected_manager_major_item_ids",
        "manager_major_item_ids",
        "managerMajorItemIds",
        "selectedIds",
        "ids"
      ], 0).filter(function (value) { return aicmC2fD2Text(value); });

      var aicmC2fD2SingleId = aicmC2fD2FindFirst(aicmC2fD2Payload, [
        "manager_major_item_id",
        "managerMajorItemId",
        "pmlw_major_item_id",
        "major_item_id",
        "majorItemId",
        "id",
        "uuid"
      ], 0);

      var aicmC2fD2Department = aicmC2fD2FindFirst(aicmC2fD2Payload, [
        "department_id",
        "departmentId",
        "department_label",
        "departmentLabel",
        "department_name",
        "departmentName"
      ], 0);

      var aicmC2fD2Section = aicmC2fD2FindFirst(aicmC2fD2Payload, [
        "section_id",
        "sectionId",
        "section_label",
        "sectionLabel",
        "section_name",
        "sectionName"
      ], 0);

      var aicmC2fD2Leader = aicmC2fD2FindFirst(aicmC2fD2Payload, [
        "leader_label",
        "leaderLabel",
        "assigned_leader_label",
        "leader_name",
        "leaderName"
      ], 0);

      var aicmC2fD2LeaderPlacement = aicmC2fD2FindFirst(aicmC2fD2Payload, [
        "leader_placement_id",
        "leaderPlacementId",
        "assigned_leader_placement_id",
        "placement_id",
        "placementId"
      ], 0);

      if (!aicmC2fD2Ids.length && !aicmC2fD2SingleId) aicmC2fD2Missing.push("対象大項目IDがありません");
      if (!aicmC2fD2Department) aicmC2fD2Missing.push("部門がありません");
      if (!aicmC2fD2Section) aicmC2fD2Missing.push("課がありません");
      if (!aicmC2fD2Leader) aicmC2fD2Missing.push("Leaderがありません");
      if (!aicmC2fD2LeaderPlacement) aicmC2fD2Missing.push("Leader配置IDがありません");

      var aicmC2fD2Summary = {
        ok: aicmC2fD2Missing.length === 0,
        missing: aicmC2fD2Missing,
        selected_count: aicmC2fD2Ids.length || (aicmC2fD2SingleId ? 1 : 0),
        department: aicmC2fD2Department || "",
        section: aicmC2fD2Section || "",
        leader: aicmC2fD2Leader || "",
        leader_placement_id: aicmC2fD2LeaderPlacement || "",
        api_post: "LOCKED_BY_C2F_D2_EXECUTE_GATE",
        db_write: "NO"
      };

      if (typeof state !== "undefined" && state && typeof state === "object") {
        state.managerMajorLeaderHandoffConfirm = state.managerMajorLeaderHandoffConfirm || {};
        state.managerMajorLeaderHandoffConfirm.executeValidation = aicmC2fD2Summary;
        state.managerMajorLeaderHandoffConfirm.executeLocked = true;
      }

      if (typeof window !== "undefined" && window && typeof window.alert === "function") {
        window.alert(
          aicmC2fD2Missing.length
            ? "実行前チェックNG: " + aicmC2fD2Missing.join(" / ")
            : "実行前チェックOK。API POSTはまだ未解放です。"
        );
      }

      if (typeof aicmR8zMgrMajorCardRerender === "function") {
        try {
          aicmR8zMgrMajorCardRerender("c2f-d2-execute-payload-validation-gate");
        } catch (_) {}
      }

      return {
        ok: false,
        reason: aicmC2fD2Missing.length ? "C2F_D2_PRE_POST_VALIDATION_NG" : "C2F_D2_API_POST_LOCKED_PENDING_APPROVAL",
        validation: aicmC2fD2Summary
      };
    } catch (aicmC2fD2Error) {
      if (typeof window !== "undefined" && window && typeof window.alert === "function") {
        window.alert("実行前チェックでエラーが発生しました。API POSTは実行していません。");
      }
      return {
        ok: false,
        reason: "C2F_D2_VALIDATION_ERROR_POST_NOT_EXECUTED",
        message: String(aicmC2fD2Error && aicmC2fD2Error.message ? aicmC2fD2Error.message : aicmC2fD2Error)
      };
    }
    // AICM_R8Z_MGR_MAJOR_CARD_C2F_D2_EXECUTE_PAYLOAD_VALIDATION_GATE_END

      var response = await fetch("/api/aicm/v2/manager-major/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(postBody)
      });

      var json = null;
      try {
        json = await response.json();
      } catch (_) {
        json = null;
      }

      if (!response.ok || (json && json.result && json.result !== "ok")) {
        throw new Error(
          json && (json.error_message || json.message || json.error)
            ? (json.error_message || json.message || json.error)
            : "課長へ送る更新に失敗しました。"
        );
      }

      result = json || {};
    }

    var autoMessages = [];

    async function callOptionalAutoFunction(fnName, arg) {
      try {
        if (typeof globalThis !== "undefined" && typeof globalThis[fnName] === "function") {
          return await globalThis[fnName](arg);
        }
      } catch (_) {}
      return null;
    }

    try {
      var autoResult = null;

      if (typeof aicmRunLeaderAutoDecompositionAfterHandoffR8ZB === "function") {
        autoResult = await aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(majorId);
      } else if (typeof aicmRunLeaderAutoDecompositionAfterConfirmR8ZB === "function") {
        autoResult = await aicmRunLeaderAutoDecompositionAfterConfirmR8ZB(majorId);
      } else if (typeof aicmRunLeaderAutoDecompositionForMajorR8ZB === "function") {
        autoResult = await aicmRunLeaderAutoDecompositionForMajorR8ZB(majorId);
      } else {
        autoResult = await callOptionalAutoFunction("aicmRunLeaderAutoDecompositionAfterHandoffR8ZB", majorId);
      }

      if (autoResult && autoResult.message) {
        autoMessages.push(String(autoResult.message));
      }
    } catch (autoError) {
      autoMessages.push("Leader自動分解は後続確認が必要です: " + String(autoError && autoError.message ? autoError.message : autoError));
    }

    try {
      if (typeof aicmRunWorkerAutoExecutionAfterDecompositionR8ZI === "function") {
        var workerAuto = await aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(majorId);
        if (typeof aicmWorkerAutoExecutionMessageR8ZI === "function") {
          autoMessages.push(aicmWorkerAutoExecutionMessageR8ZI(workerAuto));
        }
      }
    } catch (workerAutoError) {
      autoMessages.push("Worker自動実行は後続確認が必要です: " + String(workerAutoError && workerAutoError.message ? workerAutoError.message : workerAutoError));
    }

    state.managerMajorLeaderHandoffConfirm = null;
    state.screen = "task-ledger";

    try {
      if (typeof aicmReloadTaskLedgerContext === "function") {
        await aicmReloadTaskLedgerContext();
      } else if (typeof refreshContext === "function") {
        await refreshContext();
      } else if (typeof loadContext === "function") {
        await loadContext();
      } else {
        var ownerForReload = encodeURIComponent(owner);
        var responseReload = await fetch("/api/aicm/v2/context?owner_civilization_id=" + ownerForReload + "&v=r8z_v9f6_" + Date.now());
        var contextJson = await responseReload.json();
        if (contextJson && contextJson.result === "ok") {
          state.context = contextJson;
        }
      }
    } catch (reloadError) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("AICM V9F6 context reload skipped", reloadError);
      }
    }

    var okMessage = "課長へ送りました。";
    if (autoMessages.length) {
      okMessage += " " + autoMessages.join(" / ");
    }

    if (typeof setMessage === "function") {
      setMessage("ok", okMessage);
    }

    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4("r8z_v9f6_execute_done");
    } else if (typeof render === "function") {
      render();
    }

    return result || {};
  } catch (error) {
    if (typeof setMessage === "function") {
      setMessage("error", error && error.message ? error.message : "課長へ送る処理に失敗しました。");
    }

    if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
      aicmRenderTaskLedgerSafeR8V4("r8z_v9f6_execute_error");
    } else if (typeof render === "function") {
      render();
    }

    throw error;
  }
}

/* AICM_R8Z_V9F4B_CONFIRM_CARD_POST_RENDER_WRAPPER
 * Display-only repair for Manager大項目 -> 課長へ送る confirmation card.
 * This block is intentionally installed AFTER renderTaskLedgerPlaceholder exists.
 * It does not write DB and does not call API.
 */
function aicmRenderLeaderHandoffConfirmCardR8SV9F4B() {
  var payload = state && state.managerMajorLeaderHandoffConfirm;
  if (!payload || typeof payload !== "object") return "";

  var esc = typeof escapeHtml === "function" ? escapeHtml : function(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  var majorId = String(
    payload.majorId ||
    payload.aicm_manager_major_work_item_id ||
    (payload.body && payload.body.aicm_manager_major_work_item_id) ||
    ""
  ).trim();

  var row = payload.row || {};
  var title = String(
    payload.major_item_name ||
    payload.targetTitle ||
    row.major_item_name ||
    row.task_name ||
    row.deliverable_name ||
    "Manager大項目"
  ).trim();

  var leader = String(
    payload.leaderLabel ||
    payload.leaderRaw ||
    payload.assigned_leader_label ||
    (payload.body && payload.body.assigned_leader_label) ||
    row.assigned_leader_label ||
    row.leader_robot_label ||
    "課長/Leader"
  ).trim();

  return [
    '<section class="aicm-core-card aicm-leader-handoff-confirm-r8s" style="border:2px solid #f59e0b;">',
    '  <p class="aicm-eyebrow">課長へ送る確認</p>',
    '  <h2>このManager大項目を課長へ送りますか？</h2>',
    '  <p class="aicm-selected-note">DB更新前の確認カードです。内容を確認してから確定してください。</p>',
    '  <dl class="aicm-core-detail-list">',
    '    <dt>対象</dt><dd>' + esc(title) + '</dd>',
    '    <dt>課長/Leader</dt><dd>' + esc(leader) + '</dd>',
    '    <dt>Manager大項目ID</dt><dd>' + esc(majorId || '-') + '</dd>',
    '  </dl>',
    '  <div class="aicm-dashboard-action-row">',
    '    <button type="button" data-core-action="r8z-v9f4b-leader-handoff-confirm-cancel">キャンセル</button>',
    '    <button type="button" data-core-action="r8z-v9f4b-leader-handoff-confirm-execute" data-major-id="' + esc(majorId) + '">確認して課長へ送る</button>',
    '  </div>',
    '</section>'
  ].join("");
}

function aicmInjectLeaderHandoffConfirmCardR8SV9F4B(html) {
  var source = String(html || "");
  var card = aicmRenderLeaderHandoffConfirmCardR8SV9F4B();

  if (!card) return source;
  if (source.indexOf("aicm-leader-handoff-confirm-r8s") >= 0) return source;

  var anchor = '<p class="aicm-eyebrow">Manager大項目</p>';
  var idx = source.indexOf(anchor);

  if (idx >= 0) {
    var sectionIdx = source.lastIndexOf("<section", idx);
    if (sectionIdx >= 0) {
      return source.slice(0, sectionIdx) + card + source.slice(sectionIdx);
    }
    return source.slice(0, idx) + card + source.slice(idx);
  }

  if (source.indexOf("</main>") >= 0) {
    return source.replace("</main>", card + "</main>");
  }

  return card + source;
}

(function aicmInstallLeaderHandoffConfirmCardBridgeR8SV9F4B() {

    // AICM_R8Z_MGR_MAJOR_CARD_C2D5R3_ROUTE_ACTION_DISPATCHER_APPLY_FIX_START
    // Route action gate for manager-major-card handoff picker.
    // Scope: existing dispatcher only. No DB write. No API POST. No new fetch.
    try {
      var aicmR8zC2d5r3Event = null;
      var aicmR8zC2d5r3Target = null;
      var aicmR8zC2d5r3Action = "";

      for (var aicmR8zC2d5r3I = 0; aicmR8zC2d5r3I < arguments.length; aicmR8zC2d5r3I += 1) {
        var aicmR8zC2d5r3Arg = arguments[aicmR8zC2d5r3I];

        if (!aicmR8zC2d5r3Event && aicmR8zC2d5r3Arg && aicmR8zC2d5r3Arg.preventDefault) {
          aicmR8zC2d5r3Event = aicmR8zC2d5r3Arg;
        }

        if (!aicmR8zC2d5r3Action && typeof aicmR8zC2d5r3Arg === "string") {
          aicmR8zC2d5r3Action = String(aicmR8zC2d5r3Arg || "").trim();
        }

        if (!aicmR8zC2d5r3Target && aicmR8zC2d5r3Arg && aicmR8zC2d5r3Arg.target) {
          if (aicmR8zC2d5r3Arg.target.closest) {
            aicmR8zC2d5r3Target = aicmR8zC2d5r3Arg.target.closest("[data-core-action]");
          } else if (aicmR8zC2d5r3Arg.target.getAttribute) {
            aicmR8zC2d5r3Target = aicmR8zC2d5r3Arg.target;
          }
        }

        if (!aicmR8zC2d5r3Target && aicmR8zC2d5r3Arg && aicmR8zC2d5r3Arg.closest) {
          aicmR8zC2d5r3Target = aicmR8zC2d5r3Arg.closest("[data-core-action]");
        }

        if (!aicmR8zC2d5r3Target && aicmR8zC2d5r3Arg && aicmR8zC2d5r3Arg.getAttribute) {
          aicmR8zC2d5r3Target = aicmR8zC2d5r3Arg;
        }
      }

      if (!aicmR8zC2d5r3Action && aicmR8zC2d5r3Target && aicmR8zC2d5r3Target.getAttribute) {
        aicmR8zC2d5r3Action = String(aicmR8zC2d5r3Target.getAttribute("data-core-action") || "").trim();
      }

      if (!aicmR8zC2d5r3Action && aicmR8zC2d5r3Target && aicmR8zC2d5r3Target.dataset) {
        aicmR8zC2d5r3Action = String(aicmR8zC2d5r3Target.dataset.coreAction || "").trim();
      }

      if (
        aicmR8zC2d5r3Action &&
        aicmR8zC2d5r3Action.indexOf("r8z-mgr-major-card-route-") === 0 &&
        typeof aicmR8zMgrMajorCardHandleAction === "function"
      ) {
        if (aicmR8zC2d5r3Event && aicmR8zC2d5r3Event.preventDefault) {
          aicmR8zC2d5r3Event.preventDefault();
        }
        if (aicmR8zC2d5r3Event && aicmR8zC2d5r3Event.stopPropagation) {
          aicmR8zC2d5r3Event.stopPropagation();
        }

        aicmR8zMgrMajorCardHandleAction(
          aicmR8zC2d5r3Event,
          aicmR8zC2d5r3Target,
          aicmR8zC2d5r3Action
        );
        return;
      }
    } catch (aicmR8zC2d5r3Error) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("C2D5R3 route dispatcher target fix skipped", aicmR8zC2d5r3Error);
      }
    }
    // AICM_R8Z_MGR_MAJOR_CARD_C2D5R3_ROUTE_ACTION_DISPATCHER_APPLY_FIX_END


    // AICM_R8Z_MGR_MAJOR_CARD_C2D5R1_ROUTE_DISPATCHER_NO_NEW_FETCH_START
    // Normalize browser click target for manager-major-card route actions.
    // Scope: existing dispatcher only. No DB write. No API POST. No new fetch.
    try {
      var aicmR8zC2d5r1Event = null;
      var aicmR8zC2d5r1Target = null;
      var aicmR8zC2d5r1Action = "";

      for (var aicmR8zC2d5r1I = 0; aicmR8zC2d5r1I < arguments.length; aicmR8zC2d5r1I += 1) {
        var aicmR8zC2d5r1Arg = arguments[aicmR8zC2d5r1I];

        if (!aicmR8zC2d5r1Event && aicmR8zC2d5r1Arg && aicmR8zC2d5r1Arg.preventDefault) {
          aicmR8zC2d5r1Event = aicmR8zC2d5r1Arg;
        }

        if (!aicmR8zC2d5r1Action && typeof aicmR8zC2d5r1Arg === "string") {
          aicmR8zC2d5r1Action = String(aicmR8zC2d5r1Arg || "").trim();
        }

        if (!aicmR8zC2d5r1Target && aicmR8zC2d5r1Arg && aicmR8zC2d5r1Arg.target) {
          if (aicmR8zC2d5r1Arg.target.closest) {
            aicmR8zC2d5r1Target = aicmR8zC2d5r1Arg.target.closest("[data-core-action]");
          } else if (aicmR8zC2d5r1Arg.target.getAttribute) {
            aicmR8zC2d5r1Target = aicmR8zC2d5r1Arg.target;
          }
        }

        if (!aicmR8zC2d5r1Target && aicmR8zC2d5r1Arg && aicmR8zC2d5r1Arg.closest) {
          aicmR8zC2d5r1Target = aicmR8zC2d5r1Arg.closest("[data-core-action]");
        }

        if (!aicmR8zC2d5r1Target && aicmR8zC2d5r1Arg && aicmR8zC2d5r1Arg.getAttribute) {
          aicmR8zC2d5r1Target = aicmR8zC2d5r1Arg;
        }
      }

      if (!aicmR8zC2d5r1Action && aicmR8zC2d5r1Target && aicmR8zC2d5r1Target.getAttribute) {
        aicmR8zC2d5r1Action = String(aicmR8zC2d5r1Target.getAttribute("data-core-action") || "").trim();
      }

      if (!aicmR8zC2d5r1Action && aicmR8zC2d5r1Target && aicmR8zC2d5r1Target.dataset) {
        aicmR8zC2d5r1Action = String(aicmR8zC2d5r1Target.dataset.coreAction || "").trim();
      }

      if (
        aicmR8zC2d5r1Action &&
        aicmR8zC2d5r1Action.indexOf("r8z-mgr-major-card-route-") === 0 &&
        typeof aicmR8zMgrMajorCardHandleAction === "function"
      ) {
        if (aicmR8zC2d5r1Event && aicmR8zC2d5r1Event.preventDefault) {
          aicmR8zC2d5r1Event.preventDefault();
        }
        if (aicmR8zC2d5r1Event && aicmR8zC2d5r1Event.stopPropagation) {
          aicmR8zC2d5r1Event.stopPropagation();
        }

        aicmR8zMgrMajorCardHandleAction(
          aicmR8zC2d5r1Event,
          aicmR8zC2d5r1Target,
          aicmR8zC2d5r1Action
        );
        return;
      }
    } catch (aicmR8zC2d5r1Error) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("C2D5R1 route dispatcher target fix skipped", aicmR8zC2d5r1Error);
      }
    }
    // AICM_R8Z_MGR_MAJOR_CARD_C2D5R1_ROUTE_DISPATCHER_NO_NEW_FETCH_END


  try {
    if (typeof renderTaskLedgerPlaceholder === "function" && !renderTaskLedgerPlaceholder.__r8zV9f4bLeaderConfirmWrapped) {
      var originalTaskLedgerPlaceholderR8zV9f4b = renderTaskLedgerPlaceholder;
      var wrappedTaskLedgerPlaceholderR8zV9f4b = function renderTaskLedgerPlaceholder() {
        return aicmInjectLeaderHandoffConfirmCardR8SV9F4B(
          originalTaskLedgerPlaceholderR8zV9f4b.apply(this, arguments)
        );
      };
      wrappedTaskLedgerPlaceholderR8zV9f4b.__r8zV9f4bLeaderConfirmWrapped = true;
      wrappedTaskLedgerPlaceholderR8zV9f4b.__r8zV9f4bOriginal = originalTaskLedgerPlaceholderR8zV9f4b;
      renderTaskLedgerPlaceholder = wrappedTaskLedgerPlaceholderR8zV9f4b;
    }

    if (typeof document !== "undefined" && document.addEventListener && typeof window !== "undefined") {
      if (!window.__aicmR8zV9f4bLeaderHandoffClickBridgeInstalled) {
        window.__aicmR8zV9f4bLeaderHandoffClickBridgeInstalled = true;

        document.addEventListener("click", function aicmR8zV9f4bLeaderHandoffClickBridge(ev) {
        // AICM_R8Z_MGR_MAJOR_CARD_C2D9_BRIDGE_CLICK_CALLBACK_ROUTE_ACTION_FIX_START
        // Route picker action gate inside existing bridge click callback.
        // This fixes dynamic confirm-panel controls that are not reaching the card handler.
        // No DB write. No API POST. No fetch.
        try {
          var aicmR8zC2d9Event = arguments && arguments.length ? arguments[0] : null;
          var aicmR8zC2d9Target = null;
          var aicmR8zC2d9Action = "";

          if (aicmR8zC2d9Event && aicmR8zC2d9Event.target) {
            if (aicmR8zC2d9Event.target.closest) {
              aicmR8zC2d9Target = aicmR8zC2d9Event.target.closest("[data-core-action]");
            } else if (aicmR8zC2d9Event.target.getAttribute) {
              aicmR8zC2d9Target = aicmR8zC2d9Event.target;
            }
          }

          if (aicmR8zC2d9Target && aicmR8zC2d9Target.getAttribute) {
            aicmR8zC2d9Action = String(aicmR8zC2d9Target.getAttribute("data-core-action") || "").trim();
          }

          if (!aicmR8zC2d9Action && aicmR8zC2d9Target && aicmR8zC2d9Target.dataset) {
            aicmR8zC2d9Action = String(aicmR8zC2d9Target.dataset.coreAction || "").trim();
          }

          if (
            aicmR8zC2d9Action &&
            aicmR8zC2d9Action.indexOf("r8z-mgr-major-card-route-") === 0 &&
            typeof aicmR8zMgrMajorCardHandleAction === "function"
          ) {
            if (aicmR8zC2d9Event && aicmR8zC2d9Event.preventDefault) {
              aicmR8zC2d9Event.preventDefault();
            }
            if (aicmR8zC2d9Event && aicmR8zC2d9Event.stopPropagation) {
              aicmR8zC2d9Event.stopPropagation();
            }

            aicmR8zMgrMajorCardHandleAction(
              aicmR8zC2d9Event,
              aicmR8zC2d9Target,
              aicmR8zC2d9Action
            );
            return;
          }
        } catch (aicmR8zC2d9Error) {
          if (typeof console !== "undefined" && console.warn) {
            console.warn("C2D9 bridge route action gate failed", aicmR8zC2d9Error);
          }
        }
        // AICM_R8Z_MGR_MAJOR_CARD_C2D9_BRIDGE_CLICK_CALLBACK_ROUTE_ACTION_FIX_END


          try {
            var target = ev && ev.target;
            var btn = target && typeof target.closest === "function"
              ? target.closest("[data-core-action]")
              : null;

            if (!btn || !btn.getAttribute) return;

            var action = String(btn.getAttribute("data-core-action") || "").trim();


            // AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_ACTION_ROUTE_START


            if (["r8z-mgr-major-card-toggle", "r8z-mgr-major-card-select-all", "r8z-mgr-major-card-clear", "r8z-mgr-major-card-open-handoff-confirm", "r8z-mgr-major-card-open-delete-confirm", "r8z-mgr-major-card-confirm-yes", "r8z-mgr-major-card-confirm-no"].indexOf(action) >= 0) {


              if (typeof aicmR8zMgrMajorCardHandleAction === "function") {


                aicmR8zMgrMajorCardHandleAction(


                  (typeof ev !== "undefined" ? ev : (typeof event !== "undefined" ? event : null)),


                  (typeof btn !== "undefined" ? btn : (typeof target !== "undefined" ? target : (typeof el !== "undefined" ? el : null))),


                  action


                );


              }


              return;


            }


            // AICM_R8Z_MGR_MAJOR_CARD_SELECTION_CLEAN_V1_ACTION_ROUTE_END

            if (action === "pmlw-major-leader-handoff") {
              if (typeof aicmOpenLeaderHandoffConfirmR8S === "function") {
                ev.preventDefault();
                ev.stopPropagation();
                aicmOpenLeaderHandoffConfirmR8S(ev, btn);
              }
              return;
            }

            if (action === "r8z-v9f4b-leader-handoff-confirm-cancel") {
              ev.preventDefault();
              ev.stopPropagation();
              if (state) state.managerMajorLeaderHandoffConfirm = null;

              if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
                aicmRenderTaskLedgerSafeR8V4("r8z_v9f4b_confirm_cancel");
              } else if (typeof render === "function") {
                render();
              }
              return;
            }

            if (action === "r8z-v9f4b-leader-handoff-confirm-execute") {
              if (typeof aicmExecuteLeaderHandoffConfirmR8S === "function") {
                ev.preventDefault();
                ev.stopPropagation();
                aicmExecuteLeaderHandoffConfirmR8S();
              }
            }
          } catch (error) {
            try {
              if (typeof setMessage === "function") {
                setMessage("error", error && error.message ? error.message : "課長へ送る確認の操作に失敗しました。");
              }
              if (typeof render === "function") render();
            } catch (_) {}
          }
        }, true);
      }
    }
  } catch (error) {
    try {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("AICM leader handoff confirm bridge V9F4B install skipped", error);
      }
    } catch (_) {}
  }
})();

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
    // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_CALL
    if (typeof aicmHydrateManagerMajorContextArraysR8M === "function") {
      aicmHydrateManagerMajorContextArraysR8M(
        typeof json !== "undefined" ? json :
        (typeof data !== "undefined" ? data :
        (typeof contextJson !== "undefined" ? contextJson :
        (typeof ctx !== "undefined" ? ctx : null)))
      );
    }
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

  // AICM_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_START
  var ctx = state && state.context ? state.context : {};
  var rows = [];

  if (ctx && Array.isArray(ctx.review_wait_items)) {
    rows = ctx.review_wait_items;
  } else if (state && Array.isArray(state.review_wait_items)) {
    rows = state.review_wait_items;
  } else if (ctx && Array.isArray(ctx.human_review_items)) {
    rows = ctx.human_review_items;
  }

  function r8zV4bText(value, fallback) {
    if (value === null || typeof value === "undefined") return fallback || "";
    var text = String(value);
    return text.length ? text : (fallback || "");
  }

  function r8zV4bEsc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(r8zV4bText(value));
    return r8zV4bText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function r8zV4bCompanyName() {
    if (state && state.selectedCompanyName) return state.selectedCompanyName;
    if (ctx && Array.isArray(ctx.companies)) {
      for (var i = 0; i < ctx.companies.length; i += 1) {
        var c = ctx.companies[i] || {};
        var id = r8zV4bText(c.aicm_user_company_id || c.company_id || c.id);
        if (id && id === r8zV4bText(state && state.selectedCompanyId)) {
          return r8zV4bText(c.company_name || c.name || c.display_name, "選択中の会社");
        }
      }
      if (ctx.companies[0]) return r8zV4bText(ctx.companies[0].company_name || ctx.companies[0].name, "選択中の会社");
    }
    return "選択中の会社";
  }

  function r8zV4bSummary(row) {
    return r8zV4bText(
      row.delivery_summary_text ||
      row.delivery_summary_preview ||
      row.result_summary_text ||
      row.summary_text ||
      row.note,
      "要約未設定"
    );
  }

  var html = [
    '<section class="aicm-core-card aicm-review-list-card">',
    '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
    '  <h2>納品サマリー確認</h2>',
    '  <div class="aicm-info-box">対象会社: <strong>' + r8zV4bEsc(r8zV4bCompanyName()) + '</strong></div>',
    '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
    '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + r8zV4bEsc(String(rows.length)) + '件</strong></p>',
    '</section>'
  ];

  if (!rows.length) {
    html.push(
      '<section class="aicm-core-card aicm-empty-card">',
      '  <strong>レビュー・承認待ちはありません</strong>',
      '  <p>設計書と実装は、納品時にAIがまとめた要約だけがここに表示されます。</p>',
      '  <p>AIレビューは内部工程で通常通り実施され、ここにはAIレビュー結果の要約だけが出ます。</p>',
      '</section>'
    );
    return html.join("");
  }

  html.push('<section class="aicm-core-card aicm-review-list-items">');
  html.push('  <h3>承認待ちサマリー</h3>');

  rows.forEach(function(row, index) {
    row = row || {};
    var id = r8zV4bText(row.aicm_human_review_item_id || row.review_id || row.id);
    var title = r8zV4bText(row.review_title || row.title, "レビュー項目");
    var kind = r8zV4bText(row.review_kind_label || row.review_kind_code, "納品サマリー");
    var artifact = r8zV4bText(row.artifact_kind_label || row.artifact_kind_code, "delivery_package");
    var status = r8zV4bText(row.human_review_status_label || row.human_review_status_code, "pending");
    var priority = r8zV4bText(row.priority_label || row.priority_code, "-");
    var summary = r8zV4bSummary(row);
    var aiReview = r8zV4bText(row.ai_review_result_text || row.ai_review_summary_text || "");

    html.push(
      '<article class="aicm-core-card aicm-review-card">',
      '  <div class="aicm-review-head">',
      '    <div>',
      '      <p class="aicm-eyebrow">承認待ち #' + r8zV4bEsc(String(index + 1)) + '</p>',
      '      <h3>' + r8zV4bEsc(title) + '</h3>',
      '    </div>',
      '    <strong>' + r8zV4bEsc(status) + '</strong>',
      '  </div>',
      '  <div class="aicm-review-meta">',
      '    <span>' + r8zV4bEsc(kind) + '</span>',
      '    <span>' + r8zV4bEsc(artifact) + '</span>',
      '    <span>優先度: ' + r8zV4bEsc(priority) + '</span>',
      '  </div>',
      '  <section class="aicm-review-summary">',
      '    <h3>納品サマリー</h3>',
      '    <p>' + r8zV4bEsc(summary) + '</p>',
      aiReview ? '    <h3>AIレビュー要約</h3><p>' + r8zV4bEsc(aiReview) + '</p>' : '',
      '  </section>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="human-review-approve" data-review-id="' + r8zV4bEsc(id) + '">承認</button>',
      '    <button type="button" data-core-action="human-review-return" data-review-id="' + r8zV4bEsc(id) + '">差し戻し</button>',
      '  </div>',
      '</article>'
    );
  });

  html.push('</section>');
  return html.join("");
  // AICM_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_END

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
      '    <button type="button" data-core-action="task-ledger-open">部門別タスク台帳へ</button>',
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


  // AICM_R8Z_V10F2G_SECTION_NEW_ENTRY_STATE_HYGIENE_HELPER_START
  function aicmR8zV10f2gClearSectionNewEntryState(nextScreen) {
    var screen = String(nextScreen === undefined || nextScreen === null ? "" : nextScreen).trim();
    if (screen !== "section-new") return;

    try {
      if (typeof state !== "undefined" && state && typeof state === "object") {
        state.selectedSectionId = "";
        state.selectedSection = null;
        state.currentSection = null;
        state.editingSectionId = "";
        state.sectionEditId = "";
        state.placementEditingSectionId = "";
        state.workerPlacementSectionId = "";
        state.sectionPlacementDraft = [];
        state.workerPlacementDraft = [];
        state.sectionNewDraft = state.sectionNewDraft && typeof state.sectionNewDraft === "object" ? state.sectionNewDraft : {};
        state.sectionNewDraft.workerPlacements = [];
        state.sectionNewDraft.placements = [];
        state.aicmR8zV10f2gSectionNewStateCleared = true;
        state.aicmR8zV10f2gSectionNewStateClearedAt = new Date().toISOString();
      }

      if (typeof window !== "undefined" && window.state && window.state !== state && typeof window.state === "object") {
        window.state.selectedSectionId = "";
        window.state.selectedSection = null;
        window.state.currentSection = null;
        window.state.editingSectionId = "";
        window.state.sectionEditId = "";
        window.state.placementEditingSectionId = "";
        window.state.workerPlacementSectionId = "";
        window.state.sectionPlacementDraft = [];
        window.state.workerPlacementDraft = [];
        window.state.sectionNewDraft = window.state.sectionNewDraft && typeof window.state.sectionNewDraft === "object" ? window.state.sectionNewDraft : {};
        window.state.sectionNewDraft.workerPlacements = [];
        window.state.sectionNewDraft.placements = [];
        window.state.aicmR8zV10f2gSectionNewStateCleared = true;
        window.state.aicmR8zV10f2gSectionNewStateClearedAt = new Date().toISOString();
      }
    } catch (error) {
      if (typeof console !== "undefined" && console && console.warn) {
        console.warn("AICM V10F2G section-new state hygiene skipped", error);
      }
    }
  }
  // AICM_R8Z_V10F2G_SECTION_NEW_ENTRY_STATE_HYGIENE_HELPER_END


  // AICM_R8Z_V10F4A_REVIEW_LIST_COMMON_NAV_AND_SECTION_WORKER_SOURCE_GUARD_COMMON_NAV_START
  function aicmR8zV10f4aText(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

  function aicmR8zV10f4aIsSectionCreateScreen() {
    try {
      if (typeof state !== "undefined" && state && state.screen === "section-new") return true;
      if (typeof window !== "undefined" && window.state && window.state.screen === "section-new") return true;
    } catch (_) {}
    return false;
  }

  function aicmR8zV10f4aCommonNavHtml() {
    return [
      '<section id="aicm-v10f4a-common-screen-nav" class="aicm-core-card" style="border:2px solid #cbd5e1;background:#f8fafc;">',
      '  <p class="aicm-eyebrow">AI企業運営アプリ</p>',
      '  <h1>AI企業運営アプリ</h1>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
      '    <button type="button" data-core-action="go" data-screen="task-ledger">部門別タスク台帳</button>',
      '  </div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
      '  </div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="go" data-screen="worker-runtime-request">AI実行Workbench</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function aicmR8zV10f4aInstallReviewListCommonNav() {
    try {
      if (typeof window === "undefined") return false;
      if (typeof window.aicmR8zV7RenderReviewList !== "function") return false;
      if (window.aicmR8zV7RenderReviewList.__aicmR8zV10f4aWrapped) return true;

      var original = window.aicmR8zV7RenderReviewList;
      var wrapped = function() {
        var html = String(original.apply(this, arguments) || "");
        html = html.replace(/<section id="aicm-v10f3b-review-list-back"[\s\S]*?<\/section>/g, "");
        html = html.replace(/<section id="aicm-v10f3c-review-list-back-simple"[\s\S]*?<\/section>/g, "");
        html = html.replace(/<section id="aicm-v10f3d-review-list-back-single"[\s\S]*?<\/section>/g, "");
        html = html.replace(/<section id="aicm-v10f4a-common-screen-nav"[\s\S]*?<\/section>/g, "");
        return aicmR8zV10f4aCommonNavHtml() + html;
      };

      wrapped.__aicmR8zV10f4aWrapped = true;
      wrapped.__aicmR8zV10f4aOriginal = original;
      window.aicmR8zV7RenderReviewList = wrapped;
      return true;
    } catch (_) {
      return false;
    }
  }

  (function aicmR8zV10f4aInstallCommonNavBootstrap() {
    aicmR8zV10f4aInstallReviewListCommonNav();
    setTimeout(aicmR8zV10f4aInstallReviewListCommonNav, 0);
    setTimeout(aicmR8zV10f4aInstallReviewListCommonNav, 250);
  })();
  // AICM_R8Z_V10F4A_REVIEW_LIST_COMMON_NAV_AND_SECTION_WORKER_SOURCE_GUARD_COMMON_NAV_END
function render() {
    if (!root) return;

    var html = "";

    if (state.screen === "company-new") {
      html = renderCompanyNew();
    } else if (state.screen === "department-new") {
      html = renderDepartmentNew();
    } else if (state.screen === "section-new") {
            aicmR8zV10f2gClearSectionNewEntryState("section-new"); // AICM_R8Z_V10F2G_SECTION_NEW_ENTRY_STATE_HYGIENE_RENDER_BRANCH_CALL
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
      html = (typeof window !== "undefined" && typeof window.aicmR8zV7RenderReviewList === "function" ? window.aicmR8zV7RenderReviewList(state) : renderReviewListPlaceholder()); // AICM_R8Z_V7_ROUTE_BRIDGE_CALL
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


    


    
// AICM_R8_NAV_TASK_LEDGER_V3_CLEAN_ACTION_HANDLER_START
    if (action === "task-ledger-open") {
      aicmOpenTaskLedgerScreenR8V3Clean();
      return;
    }
// AICM_R8_NAV_TASK_LEDGER_V3_CLEAN_ACTION_HANDLER_END

    
// AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER_ACTION_HANDLER_START
    if (action === "pmlw-major-page-prev") {
      aicmMoveMajorItemPageFromActionR8V7C2(-1);
      return;
    }

    if (action === "pmlw-major-page-next") {
      aicmMoveMajorItemPageFromActionR8V7C2(1);
      return;
    }

    // AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_ACTION_HANDLER_START
    if (action === "pmlw-major-leader-handoff") {
      aicmOpenMajorLeaderHandoffConfirmR8S(event, button);
      return;
    }

    if (action === "pmlw-major-leader-handoff-cancel") {
      aicmCancelMajorLeaderHandoffConfirmR8S();
      return;
    }

    if (action === "pmlw-major-leader-handoff-execute") {
      aicmExecuteMajorLeaderHandoffConfirmR8S();
      return;
    }
// AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_ACTION_HANDLER_END

    if (action === "pmlw-major-delete-open") {
      aicmOpenMajorDeleteConfirmFromActionR8V7C2(event, button);
      return;
    }

    if (action === "pmlw-major-delete-cancel") {
      aicmCancelMajorDeleteConfirmFromActionR8V7C2();
      return;
    }

    if (action === "pmlw-major-delete-execute") {
      aicmExecuteMajorDeleteConfirmFromActionR8V7C2();
      return;
    }
// AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER_ACTION_HANDLER_END

    // AICM_R8T_LEADER_INBOX_DISPLAY_ACTION_HANDLER_START
    if (action === "leader-inbox-middle-breakdown-open") {
      setMessage("ok", "中項目分解は次工程で実装します。まずLeader受信箱の表示を確認してください。");
      render();
      return;
    }
// AICM_R8T_LEADER_INBOX_DISPLAY_ACTION_HANDLER_END

    // AICM_R8U_MANAGER_MAJOR_SUMMARY_ACTION_HANDLER_START
    if (action === "manager-major-summary-filter") {
      var summaryTarget = aicmManagerMajorSummaryActionTargetR8U(event, button);
      var filterCode = summaryTarget && summaryTarget.getAttribute ? summaryTarget.getAttribute("data-summary-filter") : "";
      state.managerMajorSummaryFilterR8U = filterCode || "";
      state.screen = "task-ledger";
      setMessage("ok", "大項目サマリ詳細を表示します。");
      render();
      return;
    }

    if (action === "manager-major-summary-filter-clear") {
      state.managerMajorSummaryFilterR8U = "";
      state.screen = "task-ledger";
      setMessage("ok", "大項目サマリ詳細を閉じました。");
      render();
      return;
    }
// AICM_R8U_MANAGER_MAJOR_SUMMARY_ACTION_HANDLER_END

    
// AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1_ACTION_HANDLER_START
    if (action === "pmlw-major-page-prev") {
      aicmMajorItemSetPageR8O(-1);
      return;
    }

    if (action === "pmlw-major-page-next") {
      aicmMajorItemSetPageR8O(1);
      return;
    }

    if (action === "pmlw-major-delete-open") {
      aicmOpenMajorItemDeleteConfirmR8P(target);
      return;
    }

    if (action === "pmlw-major-delete-cancel") {
      aicmCancelMajorItemDeleteConfirmR8P();
      return;
    }

    if (action === "pmlw-major-delete-execute") {
      aicmExecuteMajorItemDeleteConfirmR8P();
      return;
    }
// AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1_ACTION_HANDLER_END

    if (action === "task-ledger-refresh") {
      aicmReloadTaskLedgerContext();
      return;
    }

    if (action === "reload") {
      loadContext();
      return;
    }
  }

  
// AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER_HELPER_START
  // AICM_R8_V7D2_DELETE_CONFIRM_VISIBLE_START
  function aicmScrollMajorDeleteConfirmIntoViewR8V7D2() {
    try {
      var card = document.getElementById("aicm-manager-major-delete-confirm");
      if (card && card.scrollIntoView) {
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (_) {
    }
  }
// AICM_R8_V7D2_DELETE_CONFIRM_VISIBLE_END

  function aicmResolveMajorDeleteActionTargetR8V7C2(ev, btn) {
    if (typeof aicmActionTargetSafe === "function") {
      var safeTarget = aicmActionTargetSafe(ev, btn);
      if (safeTarget && safeTarget.getAttribute) return safeTarget;
    }

    if (btn && btn.getAttribute) return btn;

    if (ev && ev.target) {
      if (ev.target.closest) {
        var closest = ev.target.closest("[data-core-action]");
        if (closest && closest.getAttribute) return closest;
      }

      if (ev.target.getAttribute) return ev.target;
    }

    return null;
  }

  function aicmOpenMajorDeleteConfirmFromActionR8V7C2(ev, btn) {
    var deleteTarget = aicmResolveMajorDeleteActionTargetR8V7C2(ev, btn);

    if (!deleteTarget || !deleteTarget.getAttribute) {
      setMessage("error", "削除対象のボタンを特定できません。");
      render();
      return;
    }

    if (typeof aicmOpenMajorItemDeleteConfirmR8P !== "function") {
      setMessage("error", "削除確認処理が見つかりません。");
      render();
      return;
    }

    aicmOpenMajorItemDeleteConfirmR8P(deleteTarget);

    if (typeof aicmScrollMajorDeleteConfirmIntoViewR8V7D2 === "function") {
      setTimeout(aicmScrollMajorDeleteConfirmIntoViewR8V7D2, 50);
    }
  }
  function aicmCancelMajorDeleteConfirmFromActionR8V7C2() {
    if (typeof aicmCancelMajorItemDeleteConfirmR8P === "function") {
      aicmCancelMajorItemDeleteConfirmR8P();
      return;
    }

    if (state) {
      state.managerMajorDeleteConfirm = null;
      state.screen = "task-ledger";
    }

    setMessage("ok", "削除をキャンセルしました。");
    render();
  }

  function aicmExecuteMajorDeleteConfirmFromActionR8V7C2() {
    if (typeof aicmExecuteMajorItemDeleteConfirmR8P === "function") {
      aicmExecuteMajorItemDeleteConfirmR8P();
      return;
    }

    setMessage("error", "削除確定処理が見つかりません。");
    render();
  }

  function aicmMoveMajorItemPageFromActionR8V7C2(delta) {
    if (typeof aicmMajorItemSetPageR8O === "function") {
      aicmMajorItemSetPageR8O(delta);
      return;
    }

    var current = Number(state.managerMajorPage || 1);
    if (!Number.isFinite(current) || current < 1) current = 1;
    state.managerMajorPage = Math.max(1, current + Number(delta || 0));
    render();
  }
// AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER_HELPER_END


// AICM_R8Z_O_PRODUCTION_SUMMARY_UI_START
  function aicmR8ZOText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function aicmR8ZOEscape(value) {
    var text = aicmR8ZOText(value);
    if (typeof escapeHtml === "function") return escapeHtml(text);
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function aicmR8ZOContext() {
    return state && state.context && typeof state.context === "object" ? state.context : {};
  }

  function aicmR8ZOArray() {
    var ctx = aicmR8ZOContext();
    for (var i = 0; i < arguments.length; i += 1) {
      var key = arguments[i];
      if (Array.isArray(ctx[key])) return ctx[key];
      if (state && Array.isArray(state[key])) return state[key];
    }
    return [];
  }

  function aicmR8ZOLower(value) {
    return aicmR8ZOText(value).toLowerCase();
  }

  function aicmR8ZOMajorStatus(row) {
    var handoff = aicmR8ZOLower(row && row.handoff_status_code);
    var decomposition = aicmR8ZOLower(row && row.decomposition_status_code);

    if (
      handoff === "archived" ||
      handoff === "deleted" ||
      decomposition === "archived" ||
      decomposition === "deleted"
    ) {
      return "archived";
    }

    if (
      handoff === "completed" ||
      decomposition === "decomposed" ||
      decomposition === "completed" ||
      decomposition === "complete" ||
      decomposition === "done"
    ) {
      return "manager_completed";
    }

    if (
      decomposition === "leader_decomposing" ||
      decomposition === "worker_assigned" ||
      decomposition === "in_progress"
    ) {
      return "auto_processing";
    }

    if (
      handoff === "handed_off" ||
      handoff === "sent" ||
      decomposition === "assigned_to_leader"
    ) {
      return "auto_waiting";
    }

    if (
      !handoff ||
      !decomposition ||
      handoff === "draft" ||
      handoff === "ready_handoff" ||
      decomposition === "not_started" ||
      decomposition === "draft"
    ) {
      return "unhandoff";
    }

    return "needs_check";
  }

  function aicmR8ZOWorkerStatus(row) {
    var work = aicmR8ZOLower(row && row.work_status_code);
    var review = aicmR8ZOLower(row && row.review_status_code);
    var meta = row && row.metadata_jsonb && typeof row.metadata_jsonb === "object" ? row.metadata_jsonb : {};
    var runtime = meta.runtime_result && typeof meta.runtime_result === "object" ? meta.runtime_result : {};

    if (
      work === "blocked" ||
      work === "returned" ||
      work === "error" ||
      work === "failed" ||
      runtime.result === "error"
    ) {
      return "worker_needs_check";
    }

    if (
      work === "review_waiting" ||
      review === "waiting" ||
      review === "pending"
    ) {
      return "review_waiting";
    }

    if (
      work === "done" ||
      work === "completed" ||
      review === "approved"
    ) {
      return "worker_completed";
    }

    if (
      work === "in_progress" ||
      work === "processing" ||
      work === "requested" ||
      meta.auto_execution === "worker_runtime_request"
    ) {
      return "worker_running";
    }

    if (work === "todo") return "worker_todo";

    return "worker_other";
  }

  function aicmR8ZOCountBy(rows, classifier) {
    var out = {};
    for (var i = 0; i < rows.length; i += 1) {
      var code = classifier(rows[i]);
      out[code] = (out[code] || 0) + 1;
    }
    return out;
  }

  function aicmR8ZOMajorRowsBy(code) {
    return aicmR8ZOArray("pmlw_major_items", "managerMajorItems", "manager_major_items").filter(function(row) {
      return aicmR8ZOMajorStatus(row) === code;
    });
  }

  function aicmR8ZOWorkerRowsBy(code) {
    return aicmR8ZOArray("pmlw_worker_work_units", "pmlwWorkerWorkUnits").filter(function(row) {
      return aicmR8ZOWorkerStatus(row) === code;
    });
  }

  function aicmR8ZOTitle(row) {
    return aicmR8ZOText(
      row && (
        row.major_item_name ||
        row.work_unit_name ||
        row.deliverable_name ||
        row.middle_item_name ||
        row.task_name ||
        row.title
      )
    ) || "項目";
  }

  function aicmR8ZODescription(row) {
    return aicmR8ZOText(
      row && (
        row.major_item_description ||
        row.work_unit_description ||
        row.deliverable_description ||
        row.middle_item_description ||
        row.note ||
        row.expected_output_text
      )
    );
  }

  function aicmR8ZOStatusText(row) {
    var work = aicmR8ZOText(row && row.work_status_code);
    var review = aicmR8ZOText(row && row.review_status_code);
    var handoff = aicmR8ZOText(row && row.handoff_status_code);
    var decomposition = aicmR8ZOText(row && row.decomposition_status_code);

    if (work || review) {
      if (work === "in_progress") return "実行依頼済み / 進行中";
      if (work === "todo") return "実行待ち";
      if (work === "review_waiting") return "レビュー待ち";
      if (work === "done") return "完了";
      return [work, review].filter(Boolean).join(" / ") || "-";
    }

    if (decomposition === "decomposed" || handoff === "completed") return "分解済み";
    if (decomposition === "assigned_to_leader" || handoff === "handed_off") return "自動処理待ち";
    if (decomposition === "not_started" || handoff === "draft") return "未引き継ぎ";
    if (decomposition === "archived" || handoff === "archived") return "削除済み";
    return [decomposition, handoff].filter(Boolean).join(" / ") || "-";
  }

  function aicmR8ZODetailRows(filter) {
    if (filter === "worker_running") return aicmR8ZOWorkerRowsBy("worker_running");
    if (filter === "review_waiting") return aicmR8ZOWorkerRowsBy("review_waiting");
    if (filter === "worker_completed") return aicmR8ZOWorkerRowsBy("worker_completed");
    if (filter === "worker_needs_check") return aicmR8ZOWorkerRowsBy("worker_needs_check");
    return aicmR8ZOMajorRowsBy(filter);
  }

  function aicmR8ZOFilterLabel(filter) {
    var labels = {
      unhandoff: "未引き継ぎ",
      auto_waiting: "自動処理待ち",
      auto_processing: "自動処理中",
      manager_completed: "分解済み",
      worker_running: "Worker実行中",
      review_waiting: "レビュー待ち",
      worker_completed: "Worker完了",
      needs_check: "要確認",
      worker_needs_check: "Worker要確認",
      archived: "削除済み"
    };
    return labels[filter] || "詳細";
  }

  function aicmR8ZOSummaryButton(code, label, count, note) {
    return [
      '<button type="button" data-core-action="manager-major-summary-filter" data-summary-filter="' + aicmR8ZOEscape(code) + '" style="text-align:left;display:block;">',
      '  <span class="aicm-eyebrow">' + aicmR8ZOEscape(label) + '</span>',
      '  <strong style="display:block;font-size:30px;margin:6px 0;">' + aicmR8ZOEscape(String(count || 0)) + '件</strong>',
      note ? '  <span style="display:block;color:#64748b;font-weight:800;">' + aicmR8ZOEscape(note) + '</span>' : '',
      '</button>'
    ].join("");
  }

  function aicmR8ZORenderDetail(filter) {
    if (!filter) return "";

    var rows = aicmR8ZODetailRows(filter);
    var label = aicmR8ZOFilterLabel(filter);

    var body = rows.length ? rows.slice(0, 20).map(function(row, index) {
      var title = aicmR8ZOTitle(row);
      var description = aicmR8ZODescription(row);
      var worker = aicmR8ZOText(row && (row.assigned_worker_label || row.assigned_leader_label || row.leader_robot_label || row.responsible_robot_label));
      var priority = aicmR8ZOText(row && row.priority_code) || "-";
      var due = aicmR8ZOText(row && row.due_date) || "-";
      var status = aicmR8ZOStatusText(row);

      return [
        '<article class="aicm-core-card" style="box-shadow:none;">',
        '  <p class="aicm-eyebrow">詳細 #' + aicmR8ZOEscape(String(index + 1)) + '</p>',
        '  <h3>' + aicmR8ZOEscape(title) + '</h3>',
        description ? '  <p class="aicm-selected-note">' + aicmR8ZOEscape(description) + '</p>' : '',
        '  <dl class="aicm-core-detail-list">',
        '    <dt>状態</dt><dd>' + aicmR8ZOEscape(status) + '</dd>',
        '    <dt>担当</dt><dd>' + aicmR8ZOEscape(worker || "-") + '</dd>',
        '    <dt>優先度</dt><dd>' + aicmR8ZOEscape(priority) + '</dd>',
        '    <dt>期限</dt><dd>' + aicmR8ZOEscape(due) + '</dd>',
        '  </dl>',
        '</article>'
      ].join("");
    }).join("") : '<div class="aicm-empty-state"><strong>対象はありません</strong><p>この分類に該当する行はありません。</p></div>';

    return [
      '<section class="aicm-core-card" style="border:2px solid #c7d2fe;">',
      '  <p class="aicm-eyebrow">サマリ詳細</p>',
      '  <h2>' + aicmR8ZOEscape(label) + ' の詳細</h2>',
      '  <p class="aicm-selected-note">対象: <strong>' + aicmR8ZOEscape(String(rows.length)) + '件</strong></p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="manager-major-summary-filter-clear">詳細表示を閉じる</button>',
      '  </div>',
      body,
      '</section>'
    ].join("");
  }

  function aicmRenderManagerMajorSummaryPanelR8U() {
    var majorRows = aicmR8ZOArray("pmlw_major_items", "managerMajorItems", "manager_major_items");
    var workerRows = aicmR8ZOArray("pmlw_worker_work_units", "pmlwWorkerWorkUnits");
    var majorCounts = aicmR8ZOCountBy(majorRows, aicmR8ZOMajorStatus);
    var workerCounts = aicmR8ZOCountBy(workerRows, aicmR8ZOWorkerStatus);
    var filter = state && state.managerMajorSummaryFilter ? String(state.managerMajorSummaryFilter) : "";

    return [
      '<section class="aicm-core-card aicm-manager-major-summary-card">',
      '  <p class="aicm-eyebrow">本番サマリ</p>',
      '  <h2>部門別タスク台帳サマリ</h2>',
      '  <p class="aicm-selected-note">合計: <strong>' + aicmR8ZOEscape(String(majorRows.length)) + '件</strong> / Worker作業単位: <strong>' + aicmR8ZOEscape(String(workerRows.length)) + '件</strong></p>',
      '  <div class="aicm-dashboard-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">',
      aicmR8ZOSummaryButton("unhandoff", "未引き継ぎ", majorCounts.unhandoff || 0, "課長へ送る前"),
      aicmR8ZOSummaryButton("auto_waiting", "自動処理待ち", majorCounts.auto_waiting || 0, "Leader以降の開始待ち"),
      aicmR8ZOSummaryButton("manager_completed", "分解済み", majorCounts.manager_completed || 0, "Worker作業単位まで作成"),
      aicmR8ZOSummaryButton("worker_running", "Worker実行中", workerCounts.worker_running || 0, "AIWorkerOS受付済み"),
      aicmR8ZOSummaryButton("review_waiting", "レビュー待ち", workerCounts.review_waiting || 0, "承認待ちへ表示予定"),
      aicmR8ZOSummaryButton("archived", "削除済み", majorCounts.archived || 0, "非表示・保管扱い"),
      '  </div>',
      '  <p class="aicm-selected-note">件数カードを押すと、その分類の詳細だけ確認できます。request_id などの開発者情報は通常表示しません。</p>',
      aicmR8ZORenderDetail(filter),
      '</section>'
    ].join("");
  }

  function aicmRenderLeaderAutoFlowStatusR8W() {
    return "";
  }

  function aicmRenderPmlwAutoOutputsPanelR8ZC() {
    return "";
  }

  function aicmRenderR8ZNWorkerRuntimeStatusPanel() {
    return "";
  }
// AICM_R8Z_O_PRODUCTION_SUMMARY_UI_END


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
      ".aicm-core-message-error{background:#ffffff;color:#b91c1c}",
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

// AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_START
(function () {
  "use strict";

  function r8zV5dText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function r8zV5dEscape(value) {
    var s = r8zV5dText(value);
    if (typeof escapeHtml === "function") return escapeHtml(s);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function r8zV5dFirst(row, keys, fallback) {
    row = row || {};
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        var value = r8zV5dText(row[key]);
        if (value) return value;
      }
    }
    return fallback || "";
  }

  function r8zV5dState() {
    if (!window.state || typeof window.state !== "object") {
      window.state = {};
    }
    return window.state;
  }

  function r8zV5dContext() {
    var state = r8zV5dState();
    if (!state.context || typeof state.context !== "object") {
      state.context = {};
    }
    return state.context;
  }

  function r8zV5dNormalizeContext(ctx) {
    var state = r8zV5dState();

    if (!ctx || typeof ctx !== "object") {
      ctx = {};
    }

    var rows = [];
    if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
    else if (Array.isArray(ctx.reviewWaitItems)) rows = ctx.reviewWaitItems;
    else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
    else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;
    else if (Array.isArray(state.review_wait_items)) rows = state.review_wait_items;

    ctx.review_wait_items = rows;
    state.context = ctx;
    state.review_wait_items = rows;

    if (ctx.owner_civilization_id) state.owner_civilization_id = ctx.owner_civilization_id;
    if (ctx.aicm_user_company_id) state.selectedCompanyId = ctx.aicm_user_company_id;

    return ctx;
  }

  function r8zV5dReviewRows() {
    var state = r8zV5dState();
    var ctx = r8zV5dNormalizeContext(r8zV5dContext());

    var candidates = [
      ctx.review_wait_items,
      state.review_wait_items,
      ctx.reviewWaitItems,
      ctx.human_review_wait_items,
      ctx.humanReviewWaitItems
    ];

    for (var i = 0; i < candidates.length; i += 1) {
      if (Array.isArray(candidates[i])) {
        return candidates[i].filter(function (row) {
          return row && typeof row === "object";
        });
      }
    }

    return [];
  }

  function r8zV5dOwnerId() {
    var state = r8zV5dState();
    var ctx = r8zV5dContext();
    return r8zV5dText(
      state.owner_civilization_id ||
      state.ownerCivilizationId ||
      ctx.owner_civilization_id ||
      ctx.ownerCivilizationId ||
      "00000000-0000-4000-8000-000000000001"
    );
  }

  function r8zV5dCompanyId() {
    var state = r8zV5dState();
    var ctx = r8zV5dContext();
    return r8zV5dText(
      state.selectedCompanyId ||
      state.aicm_user_company_id ||
      ctx.aicm_user_company_id ||
      ctx.selectedCompanyId ||
      ctx.company_id
    );
  }

  function r8zV5dCompanyName() {
    var state = r8zV5dState();
    var ctx = r8zV5dContext();
    var cid = r8zV5dCompanyId();

    var direct = r8zV5dText(
      state.selectedCompanyName ||
      ctx.selectedCompanyName ||
      ctx.company_name ||
      ctx.aicm_user_company_name
    );

    if (direct) return direct;

    var companies = [];
    if (Array.isArray(ctx.companies)) companies = ctx.companies;
    else if (Array.isArray(state.companies)) companies = state.companies;

    for (var i = 0; i < companies.length; i += 1) {
      var row = companies[i] || {};
      var id = r8zV5dText(row.aicm_user_company_id || row.company_id || row.id);
      if (cid && id === cid) {
        return r8zV5dText(row.company_name || row.name || row.display_name) || "選択中";
      }
    }

    return "選択中";
  }

  function r8zV5dRenderAgain() {
    if (typeof window.render === "function") {
      window.render();
      return;
    }
    if (typeof window.renderApp === "function") {
      window.renderApp();
      return;
    }
    if (typeof window.aicmRender === "function") {
      window.aicmRender();
    }
  }

  function r8zV5dHydrateIfNeeded() {
    var state = r8zV5dState();
    if (state.aicmR8zV5dHydrating) return;
    if (r8zV5dReviewRows().length > 0) return;

    var owner = r8zV5dOwnerId();
    var company = r8zV5dCompanyId();

    if (!owner || !company || typeof fetch !== "function") return;

    state.aicmR8zV5dHydrating = true;

    // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE: expose callback on globalThis as well as window
    try {
      if (typeof globalThis !== "undefined" && typeof window !== "undefined" && window.__aicmR8zV9ReviewContextCallback) {
        globalThis.__aicmR8zV9ReviewContextCallback = window.__aicmR8zV9ReviewContextCallback;
      }
    } catch (_r8zV9cGlobalBindError) {}

    var params = new URLSearchParams();
    params.set("owner_civilization_id", owner);
    params.set("aicm_user_company_id", company);
    params.set("v", "r8z_v5d_" + Date.now());

    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
      .then(function (res) {
        return res.text().then(function (bodyText) {
          var payload = {};
          try {
            payload = bodyText ? JSON.parse(bodyText) : {};
          } catch (error) {
            payload = {};
          }

          if (res.ok && payload && payload.result === "ok") {
            r8zV5dNormalizeContext(payload);
          } else {
            state.aicmR8zV5dHydrationError = payload.error_message || ("context status " + String(res.status));
          }
        });
      })
      .catch(function (error) {
        state.aicmR8zV5dHydrationError = String(error && error.message ? error.message : error);
      })
      .finally(function () {
        state.aicmR8zV5dHydrating = false;
        if (state.screen === "review-list") {
          r8zV5dRenderAgain();
        }
      });
  }

  function r8zV5dStatusLabel(row) {
    var status = r8zV5dFirst(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
    if (status === "pending") return "承認待ち";
    if (status === "approved") return "承認済み";
    if (status === "returned") return "差し戻し";
    if (status === "archived") return "アーカイブ";
    return status;
  }

  window.renderReviewListPlaceholder = function renderReviewListPlaceholderR8zV5d() {
    var rows = r8zV5dReviewRows();

    if (!rows.length) {
      r8zV5dHydrateIfNeeded();
    }

    var html = [
      '<section class="aicm-core-card aicm-review-list-stable-r8z-v5d">',
      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
      '  <h2>納品サマリー確認</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + r8zV5dEscape(r8zV5dCompanyName()) + '</strong></p>',
      '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
      '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + r8zV5dEscape(String(rows.length)) + '件</strong></p>'
    ];

    if (!rows.length) {
      var state = r8zV5dState();
      var err = r8zV5dText(state.aicmR8zV5dHydrationError);
      html.push(
        '  <article class="aicm-core-card">',
        '    <strong>レビュー・承認待ちはありません</strong>',
        '    <p>context反映待ちです。数秒後に再描画されます。</p>',
        err ? '    <p>context error: ' + r8zV5dEscape(err) + '</p>' : '',
        '  </article>',
        '</section>'
      );
      return html.join("");
    }

    rows.forEach(function (row, index) {
      var id = r8zV5dFirst(row, ["aicm_human_review_item_id", "review_id", "id"], "");
      var title = r8zV5dFirst(row, ["review_title", "title"], "レビュー項目");
      var kind = r8zV5dFirst(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
      var artifact = r8zV5dFirst(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
      var priority = r8zV5dFirst(row, ["priority_label", "priority_code"], "-");
      var summary = r8zV5dFirst(row, [
        "delivery_summary_text",
        "delivery_summary_preview",
        "result_summary_text",
        "ai_review_result_text",
        "review_summary_text",
        "summary"
      ], "要約未設定");
      var requestId = r8zV5dFirst(row, ["source_request_id", "request_id"], "");
      var workerUnitId = r8zV5dFirst(row, ["related_worker_work_unit_id"], "");

      html.push(
        '  <article class="aicm-core-card aicm-review-card">',
        '    <div class="aicm-review-head">',
        '      <div>',
        '        <p class="aicm-eyebrow">レビュー #' + r8zV5dEscape(String(index + 1)) + '</p>',
        '        <h3>' + r8zV5dEscape(title) + '</h3>',
        '      </div>',
        '      <strong>' + r8zV5dEscape(r8zV5dStatusLabel(row)) + '</strong>',
        '    </div>',
        '    <div class="aicm-review-meta">',
        '      <span>種別: ' + r8zV5dEscape(kind) + '</span>',
        '      <span>成果物: ' + r8zV5dEscape(artifact) + '</span>',
        '      <span>優先度: ' + r8zV5dEscape(priority) + '</span>',
        requestId ? '      <span>request_id: ' + r8zV5dEscape(requestId) + '</span>' : '',
        workerUnitId ? '      <span>worker_unit: ' + r8zV5dEscape(workerUnitId) + '</span>' : '',
        '    </div>',
        '    <section class="aicm-review-summary">',
        '      <h3>納品サマリー</h3>',
        '      <p>' + r8zV5dEscape(summary) + '</p>',
        '    </section>',
        '    <div class="aicm-dashboard-action-row">',
        '      <button type="button" data-core-action="human-review-approve" data-review-id="' + r8zV5dEscape(id) + '">承認</button>',
        '      <button type="button" data-core-action="human-review-return" data-review-id="' + r8zV5dEscape(id) + '">差し戻し</button>',
        '    </div>',
        '  </article>'
      );
    });

    html.push('</section>');
    return html.join("");
  };

  window.aicmR8zV5dReviewRows = r8zV5dReviewRows;
  window.aicmR8zV5dHydrateReviewContext = r8zV5dHydrateIfNeeded;
})();
// AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_END

// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_START
(function () {
  "use strict";

  function t(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function esc(value) {
    var s = t(value);
    if (typeof escapeHtml === "function") return escapeHtml(s);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function first(row, keys, fallback) {
    row = row || {};
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        var value = t(row[key]);
        if (value) return value;
      }
    }
    return fallback || "";
  }

  function normalize(appState, ctx) {
    appState = appState || {};
    if (!ctx || typeof ctx !== "object") ctx = {};

    var rows = [];
    if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
    else if (Array.isArray(ctx.reviewWaitItems)) rows = ctx.reviewWaitItems;
    else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
    else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;
    else if (Array.isArray(appState.review_wait_items)) rows = appState.review_wait_items;

    ctx.review_wait_items = rows;
    appState.context = ctx;
    appState.review_wait_items = rows;

    if (ctx.owner_civilization_id) appState.owner_civilization_id = ctx.owner_civilization_id;
    if (ctx.aicm_user_company_id) appState.selectedCompanyId = ctx.aicm_user_company_id;

    return ctx;
  }

  function ctx(appState) {
    appState = appState || {};
    return normalize(appState, appState.context && typeof appState.context === "object" ? appState.context : {});
  }

  function rows(appState) {
    appState = appState || {};
    var c = ctx(appState);
    var candidates = [
      c.review_wait_items,
      appState.review_wait_items,
      c.reviewWaitItems,
      c.human_review_wait_items,
      c.humanReviewWaitItems
    ];

    for (var i = 0; i < candidates.length; i += 1) {
      if (Array.isArray(candidates[i])) {
        return candidates[i].filter(function (row) {
          return row && typeof row === "object";
        });
      }
    }
    return [];
  }

  function ownerId(appState) {
    appState = appState || {};
    var c = appState.context || {};
    return t(appState.owner_civilization_id || appState.ownerCivilizationId || c.owner_civilization_id || c.ownerCivilizationId || "00000000-0000-4000-8000-000000000001");
  }

  function companyId(appState) {
    appState = appState || {};
    var c = appState.context || {};
    return t(appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || c.aicm_user_company_id || c.selectedCompanyId || c.company_id);
  }

  function companyName(appState) {
    appState = appState || {};
    var c = appState.context || {};
    var cid = companyId(appState);

    var direct = t(appState.selectedCompanyName || c.selectedCompanyName || c.company_name || c.aicm_user_company_name);
    if (direct) return direct;

    var companies = Array.isArray(c.companies) ? c.companies : [];
    for (var i = 0; i < companies.length; i += 1) {
      var row = companies[i] || {};
      var id = t(row.aicm_user_company_id || row.company_id || row.id);
      if (cid && id === cid) return t(row.company_name || row.name || row.display_name) || "選択中";
    }
    return "選択中";
  }

  function rerender() {
    if (typeof window.render === "function") return window.render();
    if (typeof window.renderApp === "function") return window.renderApp();
    if (typeof window.aicmRender === "function") return window.aicmRender();
  }

  function hydrateIfNeeded(appState) {

  // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper begin
  function aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload) {
    appState = appState || {};
    payload = payload && typeof payload === "object" ? payload : {};

    var payloadContext = payload.context && typeof payload.context === "object" ? payload.context : {};
    var payloadData = payload.data && typeof payload.data === "object" ? payload.data : {};

    var rows = [];
    if (Array.isArray(payload.review_wait_items)) rows = payload.review_wait_items;
    else if (Array.isArray(payloadContext.review_wait_items)) rows = payloadContext.review_wait_items;
    else if (Array.isArray(payloadData.review_wait_items)) rows = payloadData.review_wait_items;
    else if (Array.isArray(payload.human_review_wait_items)) rows = payload.human_review_wait_items;
    else if (Array.isArray(payload.reviewWaitItems)) rows = payload.reviewWaitItems;
    else if (Array.isArray(payload.humanReviewWaitItems)) rows = payload.humanReviewWaitItems;

    if (!Array.isArray(rows)) rows = [];

    if (!appState.context || typeof appState.context !== "object") {
      appState.context = {};
    }

    appState.context.review_wait_items = rows;
    appState.review_wait_items = rows;

    if (payload.owner_civilization_id) {
      appState.context.owner_civilization_id = payload.owner_civilization_id;
      appState.owner_civilization_id = payload.owner_civilization_id;
    }

    if (payload.aicm_user_company_id) {
      appState.context.aicm_user_company_id = payload.aicm_user_company_id;
      appState.selectedCompanyId = payload.aicm_user_company_id;
    }

    if (typeof state !== "undefined" && state && state !== appState) {
      if (!state.context || typeof state.context !== "object") {
        state.context = {};
      }
      state.context.review_wait_items = rows;
      state.review_wait_items = rows;

      if (payload.owner_civilization_id) {
        state.context.owner_civilization_id = payload.owner_civilization_id;
        state.owner_civilization_id = payload.owner_civilization_id;
      }

      if (payload.aicm_user_company_id) {
        state.context.aicm_user_company_id = payload.aicm_user_company_id;
        state.selectedCompanyId = payload.aicm_user_company_id;
      }
    }

    appState.aicmR8zV8gReviewWaitItemsMergedCount = rows.length;
    return rows;
  }
  // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper end

    appState = appState || {};
    if (appState.aicmR8zV7Hydrating) return;
    if (rows(appState).length > 0) return;

    var owner = ownerId(appState);
    var company = companyId(appState);

    if (!owner || !company || typeof fetch !== "function") {
      appState.aicmR8zV7HydrationError = "missing owner/company owner=" + owner + " company=" + company;
      return;
    }

    appState.aicmR8zV7Hydrating = true;
    // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: runtime debug start
    appState.aicmR8zV8kDebug = "fetch-start";
    appState.aicmR8zV8kFetchStartedAt = new Date().toISOString();
    appState.aicmR8zV8kOwner = owner;
    appState.aicmR8zV8kCompany = company;
    appState.aicmR8zV8kPayloadCount = -1;
    appState.aicmR8zV8kMergedCount = -1;
    appState.aicmR8zV8kError = "";
    if (typeof state !== "undefined" && state && state !== appState) {
      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
      state.aicmR8zV8kFetchStartedAt = appState.aicmR8zV8kFetchStartedAt;
      state.aicmR8zV8kOwner = owner;
      state.aicmR8zV8kCompany = company;
      state.aicmR8zV8kPayloadCount = -1;
      state.aicmR8zV8kMergedCount = -1;
      state.aicmR8zV8kError = "";
    }
    // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: runtime debug end

    var params = new URLSearchParams();
    params.set("owner_civilization_id", owner);
    params.set("aicm_user_company_id", company);
    params.set("v", "r8z_v7_" + Date.now());

    // AICM_R8Z_V8L_V7_FETCH_TIMEOUT_XHR_FALLBACK: timeout + XMLHttpRequest fallback begin
    try {
      setTimeout(function aicmR8zV8lFetchTimeoutXhrFallback() {
        try {
          var alreadyMerged = Number(appState && appState.aicmR8zV8kMergedCount);
          if (Number.isFinite(alreadyMerged) && alreadyMerged >= 0) return;

          if (!appState || typeof appState !== "object") return;

          appState.aicmR8zV8kDebug = "fetch-timeout-xhr-start";
          appState.aicmR8zV8kError = "";
          appState.aicmR8zV8lFallbackStartedAt = new Date().toISOString();

          if (typeof state !== "undefined" && state && state !== appState) {
            state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
            state.aicmR8zV8kError = "";
            state.aicmR8zV8lFallbackStartedAt = appState.aicmR8zV8lFallbackStartedAt;
          }

          if (typeof XMLHttpRequest === "undefined") {
            appState.aicmR8zV8kDebug = "xhr-unavailable";
            appState.aicmR8zV8kError = "XMLHttpRequest is undefined";
            appState.aicmR8zV7Hydrating = false;
            if (typeof state !== "undefined" && state) {
              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
              state.aicmR8zV8kError = appState.aicmR8zV8kError;
              state.aicmR8zV7Hydrating = false;
            }
            try { if (typeof render === "function") render(); } catch (_) {}
            return;
          }

          var xhr = new XMLHttpRequest();
          var xhrUrl = "/api/aicm/v2/context?" + params.toString();

          xhr.open("GET", xhrUrl, true);
          xhr.setRequestHeader("cache-control", "no-store");

          xhr.onreadystatechange = function aicmR8zV8lXhrReadyStateChange() {
            if (xhr.readyState !== 4) return;

            try {
              if (xhr.status < 200 || xhr.status >= 300) {
                appState.aicmR8zV8kDebug = "xhr-error";
                appState.aicmR8zV8kError = "status=" + String(xhr.status);
                appState.aicmR8zV7Hydrating = false;

                if (typeof state !== "undefined" && state && state !== appState) {
                  state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
                  state.aicmR8zV8kError = appState.aicmR8zV8kError;
                  state.aicmR8zV7Hydrating = false;
                }

                try { if (typeof render === "function") render(); } catch (_) {}
                return;
              }

              var payload = {};
              try {
                payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
              } catch (parseError) {
                appState.aicmR8zV8kDebug = "xhr-parse-error";
                appState.aicmR8zV8kError = String(parseError && parseError.message ? parseError.message : parseError);
                appState.aicmR8zV7Hydrating = false;

                if (typeof state !== "undefined" && state && state !== appState) {
                  state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
                  state.aicmR8zV8kError = appState.aicmR8zV8kError;
                  state.aicmR8zV7Hydrating = false;
                }

                try { if (typeof render === "function") render(); } catch (_) {}
                return;
              }

              var payloadRows = [];
              if (Array.isArray(payload.review_wait_items)) payloadRows = payload.review_wait_items;
              else if (payload.context && Array.isArray(payload.context.review_wait_items)) payloadRows = payload.context.review_wait_items;
              else if (payload.data && Array.isArray(payload.data.review_wait_items)) payloadRows = payload.data.review_wait_items;

              var mergedRows = aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);

              appState.aicmR8zV8kDebug = "xhr-merged";
              appState.aicmR8zV8kPayloadCount = payloadRows.length;
              appState.aicmR8zV8kMergedCount = Array.isArray(mergedRows) ? mergedRows.length : -2;
              appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
              appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
              appState.aicmR8zV8kMergedAt = new Date().toISOString();
              appState.aicmR8zV7Hydrating = false;
              appState.aicmR8zV7HydrationError = "";

              if (typeof state !== "undefined" && state && state !== appState) {
                if (!state.context || typeof state.context !== "object") state.context = {};
                state.context.review_wait_items = appState.context.review_wait_items || appState.review_wait_items || [];
                state.review_wait_items = appState.review_wait_items || state.context.review_wait_items || [];
                state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
                state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
                state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
                state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
                state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
                state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
                state.aicmR8zV7Hydrating = false;
                state.aicmR8zV7HydrationError = "";
              }

              try {
                setTimeout(function aicmR8zV8lRerenderAfterXhrMerge() {
                  try {
                    if (typeof render === "function") {
                      render();
                      return;
                    }
                  } catch (_) {}

                  try {
                    if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
                      window.aicmRender();
                    }
                  } catch (_) {}
                }, 0);
              } catch (_) {}
            } catch (runtimeError) {
              try {
                appState.aicmR8zV8kDebug = "xhr-runtime-error";
                appState.aicmR8zV8kError = String(runtimeError && runtimeError.message ? runtimeError.message : runtimeError);
                appState.aicmR8zV7Hydrating = false;
                if (typeof state !== "undefined" && state) {
                  state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
                  state.aicmR8zV8kError = appState.aicmR8zV8kError;
                  state.aicmR8zV7Hydrating = false;
                }
                if (typeof render === "function") render();
              } catch (_) {}
            }
          };

          xhr.onerror = function aicmR8zV8lXhrError() {
            try {
              appState.aicmR8zV8kDebug = "xhr-network-error";
              appState.aicmR8zV8kError = "XMLHttpRequest onerror";
              appState.aicmR8zV7Hydrating = false;
              if (typeof state !== "undefined" && state) {
                state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
                state.aicmR8zV8kError = appState.aicmR8zV8kError;
                state.aicmR8zV7Hydrating = false;
              }
              if (typeof render === "function") render();
            } catch (_) {}
          };

          xhr.send();
        } catch (error) {
          try {
            appState.aicmR8zV8kDebug = "xhr-fallback-error";
            appState.aicmR8zV8kError = String(error && error.message ? error.message : error);
            appState.aicmR8zV7Hydrating = false;
            if (typeof state !== "undefined" && state) {
              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
              state.aicmR8zV8kError = appState.aicmR8zV8kError;
              state.aicmR8zV7Hydrating = false;
            }
            if (typeof render === "function") render();
          } catch (_) {}
        }
      }, 2500);
    } catch (_r8zV8lScheduleError) {}
    // AICM_R8Z_V8L_V7_FETCH_TIMEOUT_XHR_FALLBACK: timeout + XMLHttpRequest fallback end


    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
      .then(function (res) {
        return res.text().then(function (bodyText) {
          var payload = {};
          try {
            payload = bodyText ? JSON.parse(bodyText) : {};
          } catch (_error) {
            payload = {};
          }

          // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: merge payload review_wait_items into appState/state
          var aicmR8zV8kMergedRows = aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
          // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: payload/merge debug
          try {
            var aicmR8zV8kPayloadRows = [];
            if (payload && Array.isArray(payload.review_wait_items)) aicmR8zV8kPayloadRows = payload.review_wait_items;
            else if (payload && payload.context && Array.isArray(payload.context.review_wait_items)) aicmR8zV8kPayloadRows = payload.context.review_wait_items;
            else if (payload && payload.data && Array.isArray(payload.data.review_wait_items)) aicmR8zV8kPayloadRows = payload.data.review_wait_items;

            appState.aicmR8zV8kDebug = "payload-merged";
            appState.aicmR8zV8kPayloadCount = aicmR8zV8kPayloadRows.length;
            appState.aicmR8zV8kMergedCount = Array.isArray(aicmR8zV8kMergedRows) ? aicmR8zV8kMergedRows.length : -2;
            appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
            appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
            appState.aicmR8zV8kMergedAt = new Date().toISOString();

            if (typeof state !== "undefined" && state && state !== appState) {
              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
              state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
              state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
              state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
              state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
              state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
            }
          } catch (_r8zV8kMergeDebugError) {}

          // AICM_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER: force finalizer and one-shot rerender after review_wait_items merge
          try {
            if (appState && typeof appState === "object") {
              appState.aicmR8zV7Hydrating = false;
              appState.aicmR8zV7HydrationError = "";
            }

            if (typeof state !== "undefined" && state && typeof state === "object") {
              state.aicmR8zV7Hydrating = false;
              state.aicmR8zV7HydrationError = "";

              if (appState && appState.review_wait_items && Array.isArray(appState.review_wait_items)) {
                state.review_wait_items = appState.review_wait_items;
              }

              if (appState && appState.context && typeof appState.context === "object") {
                if (!state.context || typeof state.context !== "object") state.context = {};
                state.context.review_wait_items = appState.context.review_wait_items || appState.review_wait_items || [];
              }
            }
          } catch (_r8zV8hFinalizeError) {}

          try {
            setTimeout(function aicmR8zV8hReviewListRerender() {
              try {
                if (typeof render === "function") {
                  render();
                  return;
                }
              } catch (_r8zV8hRenderError) {}

              try {
                if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
                  window.aicmRender();
                  return;
                }
              } catch (_r8zV8hWindowRenderError) {}
            }, 0);
          } catch (_r8zV8hScheduleError) {}


          if (res.ok && payload && payload.result === "ok") {
            normalize(appState, payload);
          } else {
            appState.aicmR8zV7HydrationError = payload.error_message || ("context status " + String(res.status));
          }
        });
      })
      .catch(function (error) {
        appState.aicmR8zV7HydrationError = String(error && error.message ? error.message : error);
      })
      .finally(function () {
        appState.aicmR8zV7Hydrating = false;
        if (appState.screen === "review-list") rerender();
      });
  }

  function statusLabel(row) {
    var status = first(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
    if (status === "pending") return "承認待ち";
    if (status === "approved") return "承認済み";
    if (status === "returned") return "差し戻し";
    if (status === "archived") return "アーカイブ";
    return status;
  }

  

  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper begin
  function aicmR8zV9ReviewRowsFromPayload(payload) {
    payload = payload && typeof payload === "object" ? payload : {};
    if (Array.isArray(payload.review_wait_items)) return payload.review_wait_items;
    if (payload.context && Array.isArray(payload.context.review_wait_items)) return payload.context.review_wait_items;
    if (payload.data && Array.isArray(payload.data.review_wait_items)) return payload.data.review_wait_items;
    if (Array.isArray(payload.human_review_wait_items)) return payload.human_review_wait_items;
    if (Array.isArray(payload.reviewWaitItems)) return payload.reviewWaitItems;
    if (Array.isArray(payload.humanReviewWaitItems)) return payload.humanReviewWaitItems;
    return [];
  }

  function aicmR8zV9MergeReviewPayload(appState, payload) {
    appState = appState || {};
    payload = payload && typeof payload === "object" ? payload : {};

    var rows = aicmR8zV9ReviewRowsFromPayload(payload);

    if (typeof aicmR8zV8gMergeReviewWaitItemsFromPayload === "function") {
      try {
        var mergedByV8g = aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
        if (Array.isArray(mergedByV8g)) rows = mergedByV8g;
      } catch (_) {}
    }

    if (!appState.context || typeof appState.context !== "object") appState.context = {};
    appState.context.review_wait_items = rows;
    appState.review_wait_items = rows;

    if (payload.owner_civilization_id) {
      appState.context.owner_civilization_id = payload.owner_civilization_id;
      appState.owner_civilization_id = payload.owner_civilization_id;
    }

    if (payload.aicm_user_company_id) {
      appState.context.aicm_user_company_id = payload.aicm_user_company_id;
      appState.selectedCompanyId = payload.aicm_user_company_id;
    }

    if (typeof state !== "undefined" && state && state !== appState) {
      if (!state.context || typeof state.context !== "object") state.context = {};
      state.context.review_wait_items = rows;
      state.review_wait_items = rows;

      if (payload.owner_civilization_id) {
        state.context.owner_civilization_id = payload.owner_civilization_id;
        state.owner_civilization_id = payload.owner_civilization_id;
      }

      if (payload.aicm_user_company_id) {
        state.context.aicm_user_company_id = payload.aicm_user_company_id;
        state.selectedCompanyId = payload.aicm_user_company_id;
      }
    }

    appState.aicmR8zV7Hydrating = false;
    appState.aicmR8zV7HydrationError = "";
    appState.aicmR8zV9Hydrating = false;
    appState.aicmR8zV9Hydrated = true;
    appState.aicmR8zV9Rows = rows.length;

    appState.aicmR8zV8kDebug = "v9-script-merged";
    appState.aicmR8zV8kPayloadCount = rows.length;
    appState.aicmR8zV8kMergedCount = rows.length;
    appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
    appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
    appState.aicmR8zV8kMergedAt = new Date().toISOString();

    if (typeof state !== "undefined" && state && state !== appState) {
      state.aicmR8zV7Hydrating = false;
      state.aicmR8zV7HydrationError = "";
      state.aicmR8zV9Hydrating = false;
      state.aicmR8zV9Hydrated = true;
      state.aicmR8zV9Rows = rows.length;
      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
      state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
      state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
      state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
      state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
      state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
    }

    return rows;
  }

  function aicmR8zV9RerenderReviewList() {
    // AICM_R8Z_V9E_REVIEW_LIST_LOCAL_RENDER_ONLY
    // AICM_R8Z_V9E2_LOCAL_RENDER_STATIC_GATE_CORRECTION
    // Keep review-list hydration local. Avoid the app-wide renderer because it can re-enter
    // task-ledger/dashboard paths and surface unrelated screen regressions.
    try {
      var appState = (typeof state !== "undefined" && state) ? state : {};
      var screen = String(appState.screen || "");

      if (screen && screen !== "review-list") {
        appState.aicmR8zV8kDebug = "v9-local-skip-non-review";
        appState.aicmR8zV8kError = "screen=" + screen;
        return;
      }

      if (typeof root === "undefined" || !root) {
        appState.aicmR8zV8kDebug = "v9-local-root-missing";
        appState.aicmR8zV8kError = "root is unavailable";
        return;
      }

      if (typeof window === "undefined" || typeof window.aicmR8zV7RenderReviewList !== "function") {
        appState.aicmR8zV8kDebug = "v9-local-renderer-missing";
        appState.aicmR8zV8kError = "aicmR8zV7RenderReviewList is unavailable";
        return;
      }

      appState.screen = "review-list";
      appState.aicmR8zV8kDebug = "v9-local-render-start";

      root.innerHTML = window.aicmR8zV7RenderReviewList(appState);

      appState.aicmR8zV8kDebug = "v9-local-render-done";
      appState.aicmR8zV8kError = "";
    } catch (error) {
      try {
        if (typeof state !== "undefined" && state) {
          state.aicmR8zV8kDebug = "v9-local-render-error";
          state.aicmR8zV8kError = String(error && error.message ? error.message : error);
        }
      } catch (_) {}
    }
  }

  function aicmR8zV9ReviewListScriptHydrate(appState) {
    appState = appState || {};

    var existingRows = [];
    try {
      existingRows = typeof rows === "function" ? rows(appState) : [];
    } catch (_) {
      existingRows = [];
    }

    if (Array.isArray(existingRows) && existingRows.length > 0) return;
    if (appState.aicmR8zV9Hydrating) return;

    var owner = "";
    var company = "";

    try {
      owner = typeof ownerId === "function" ? ownerId(appState) : "";
    } catch (_) {}

    try {
      company = typeof companyId === "function" ? companyId(appState) : "";
    } catch (_) {}

    if (!owner) {
      owner = (appState.owner_civilization_id || appState.ownerCivilizationId || (appState.context && (appState.context.owner_civilization_id || appState.context.ownerCivilizationId)) || "00000000-0000-4000-8000-000000000001");
    }

    if (!company) {
      company = (appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || (appState.context && (appState.context.aicm_user_company_id || appState.context.selectedCompanyId || appState.context.company_id)) || "");
    }

    if (typeof document === "undefined" || !document.body) {
      appState.aicmR8zV8kDebug = "v9-document-unavailable";
      appState.aicmR8zV8kError = "document/body unavailable";
      return;
    }

    appState.aicmR8zV9Hydrating = true;
    appState.aicmR8zV7Hydrating = true;
    appState.aicmR8zV8kDebug = "v9-script-start";
    appState.aicmR8zV8kPayloadCount = -1;
    appState.aicmR8zV8kMergedCount = -1;
    appState.aicmR8zV8kError = "";
    appState.aicmR8zV9StartedAt = new Date().toISOString();

    if (typeof state !== "undefined" && state && state !== appState) {
      state.aicmR8zV9Hydrating = true;
      state.aicmR8zV7Hydrating = true;
      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
      state.aicmR8zV8kPayloadCount = -1;
      state.aicmR8zV8kMergedCount = -1;
      state.aicmR8zV8kError = "";
      state.aicmR8zV9StartedAt = appState.aicmR8zV9StartedAt;
    }

    try {
      var oldScript = document.getElementById("aicm-r8z-v9-context-script");
      if (oldScript && oldScript.parentNode) oldScript.parentNode.removeChild(oldScript);
    } catch (_) {}

    window.__aicmR8zV9ReviewContextCallback = function aicmR8zV9ReviewContextCallback(payload) {
      try {
        aicmR8zV9MergeReviewPayload(appState, payload);
      } catch (error) {
        appState.aicmR8zV8kDebug = "v9-merge-error";
        appState.aicmR8zV8kError = String(error && error.message ? error.message : error);
        appState.aicmR8zV9Hydrating = false;
        appState.aicmR8zV7Hydrating = false;
      }

      try {
        setTimeout(aicmR8zV9RerenderReviewList, 0);
      } catch (_) {
        aicmR8zV9RerenderReviewList();
      }
    };

    var params = new URLSearchParams();
    params.set("owner_civilization_id", owner);
    if (company) params.set("aicm_user_company_id", company);
    params.set("callback", "window.__aicmR8zV9ReviewContextCallback"); // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE
    params.set("v", "r8z_v9_" + Date.now());

    var script = document.createElement("script");
    script.id = "aicm-r8z-v9-context-script";
    script.async = true;
    script.src = "/api/aicm/v2/context-script?" + params.toString();

    script.onerror = function aicmR8zV9ScriptError() {
      appState.aicmR8zV8kDebug = "v9-script-error";
      appState.aicmR8zV8kError = "context-script load failed";
      appState.aicmR8zV9Hydrating = false;
      appState.aicmR8zV7Hydrating = false;

      if (typeof state !== "undefined" && state && state !== appState) {
        state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
        state.aicmR8zV8kError = appState.aicmR8zV8kError;
        state.aicmR8zV9Hydrating = false;
        state.aicmR8zV7Hydrating = false;
      }

      aicmR8zV9RerenderReviewList();
    };

    // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE: loaded-without-callback diagnostics
    script.onload = function aicmR8zV9cScriptLoaded() {
      try {
        setTimeout(function aicmR8zV9cCheckCallbackCompletion() {
          try {
            var merged = Number(appState && appState.aicmR8zV8kMergedCount);
            if (Number.isFinite(merged) && merged >= 0) return;
            if (appState && appState.aicmR8zV9Hydrated) return;

            appState.aicmR8zV8kDebug = "v9-script-loaded-no-callback";
            appState.aicmR8zV8kError = String(
              (typeof window !== "undefined" && window.__aicmR8zV9ReviewContextError)
                ? window.__aicmR8zV9ReviewContextError
                : "script loaded but callback did not merge"
            );
            appState.aicmR8zV9Hydrating = false;
            appState.aicmR8zV7Hydrating = false;

            if (typeof state !== "undefined" && state && state !== appState) {
              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
              state.aicmR8zV8kError = appState.aicmR8zV8kError;
              state.aicmR8zV9Hydrating = false;
              state.aicmR8zV7Hydrating = false;
            }

            try {
              if (typeof render === "function") {
                render();
                return;
              }
            } catch (_) {}

            try {
              if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
                window.aicmRender();
              }
            } catch (_) {}
          } catch (_) {}
        }, 600);
      } catch (_) {}
    };

    document.body.appendChild(script);
  }
  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper end

window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
    appState = appState || {};
    var list = rows(appState);

    if (!list.length && typeof aicmR8zV9ReviewListScriptHydrate === "function") aicmR8zV9ReviewListScriptHydrate(appState);
    if (!list.length) hydrateIfNeeded(appState);

    var debug = [
      "selectedCompanyId=" + companyId(appState),
      "owner=" + ownerId(appState),
      "rows=" + String(list.length),
      appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",
      appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : "",
      // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: visible debug fields
      "v8k=" + t(appState.aicmR8zV8kDebug || (typeof state !== "undefined" && state ? state.aicmR8zV8kDebug : "") || "none"),
      "payload=" + String(appState.aicmR8zV8kPayloadCount !== undefined ? appState.aicmR8zV8kPayloadCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kPayloadCount !== undefined) ? state.aicmR8zV8kPayloadCount : "na")),
      "merged=" + String(appState.aicmR8zV8kMergedCount !== undefined ? appState.aicmR8zV8kMergedCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kMergedCount !== undefined) ? state.aicmR8zV8kMergedCount : "na")),
      "stRows=" + String(appState.aicmR8zV8kAfterMergeStateRows !== undefined ? appState.aicmR8zV8kAfterMergeStateRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeStateRows !== undefined) ? state.aicmR8zV8kAfterMergeStateRows : "na")),
      "ctxRows=" + String(appState.aicmR8zV8kAfterMergeContextRows !== undefined ? appState.aicmR8zV8kAfterMergeContextRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeContextRows !== undefined) ? state.aicmR8zV8kAfterMergeContextRows : "na")),
      appState.aicmR8zV8kError ? "v8kError=" + t(appState.aicmR8zV8kError) : ""
    ].filter(Boolean).join(" / ");

    var html = [
      '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',
      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
      '  <h2>納品サマリー確認</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + esc(companyName(appState)) + '</strong></p>',
      '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + esc(String(list.length)) + '件</strong></p>',
      '  <p class="aicm-selected-note">R8Z-V7: ' + esc(debug) + '</p>'
    ];

    if (!list.length) {
      html.push(
        '  <article class="aicm-core-card">',
        '    <strong>レビュー・承認待ちはありません</strong>',
        '    <p>context反映待ちです。数秒後に再描画されます。</p>',
        '  </article>',
        '</section>'
      );
      return html.join("");
    }

    list.forEach(function (row, index) {
      var id = first(row, ["aicm_human_review_item_id", "review_id", "id"], "");
      var title = first(row, ["review_title", "title"], "レビュー項目");
      var kind = first(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
      var artifact = first(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
      var priority = first(row, ["priority_label", "priority_code"], "-");
      var summary = first(row, [
        "delivery_summary_text",
        "delivery_summary_preview",
        "result_summary_text",
        "ai_review_result_text",
        "review_summary_text",
        "summary"
      ], "要約未設定");
      var requestId = first(row, ["source_request_id", "request_id"], "");
      var workerUnitId = first(row, ["related_worker_work_unit_id"], "");

      html.push(
        '  <article class="aicm-core-card aicm-review-card">',
        '    <div class="aicm-review-head">',
        '      <div>',
        '        <p class="aicm-eyebrow">レビュー #' + esc(String(index + 1)) + '</p>',
        '        <h3>' + esc(title) + '</h3>',
        '      </div>',
        '      <strong>' + esc(statusLabel(row)) + '</strong>',
        '    </div>',
        '    <div class="aicm-review-meta">',
        '      <span>種別: ' + esc(kind) + '</span>',
        '      <span>成果物: ' + esc(artifact) + '</span>',
        '      <span>優先度: ' + esc(priority) + '</span>',
        requestId ? '      <span>request_id: ' + esc(requestId) + '</span>' : '',
        workerUnitId ? '      <span>worker_unit: ' + esc(workerUnitId) + '</span>' : '',
        '    </div>',
        '    <section class="aicm-review-summary">',
        '      <h3>納品サマリー</h3>',
        '      <p>' + esc(summary) + '</p>',
        '    </section>',
        '    <div class="aicm-dashboard-action-row">',
        '      <button type="button" data-core-action="human-review-approve" data-review-id="' + esc(id) + '">承認</button>',
        '      <button type="button" data-core-action="human-review-return" data-review-id="' + esc(id) + '">差し戻し</button>',
        '    </div>',
        '  </article>'
      );
    });

    html.push('</section>');
    return html.join("");
  };
})();


  // AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER_START
  // Final review-list renderer override. Scope is review-list display only.
  // It does not touch task ledger / leader handoff / delete paths.
  (function installAicmR8zV10cReviewListDirectContextRenderer() {
    function v10cText(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function v10cEsc(value) {
      var text = v10cText(value);
      if (typeof escapeHtml === "function") return escapeHtml(text);
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function v10cState(appState) {
      if (appState && typeof appState === "object") return appState;
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      return {};
    }

    function v10cContext(appState) {
      appState = v10cState(appState);
      if (!appState.context || typeof appState.context !== "object") appState.context = {};
      return appState.context;
    }

    function v10cOwnerId(appState) {
      appState = v10cState(appState);
      var ctx = v10cContext(appState);
      return v10cText(
        appState.owner_civilization_id ||
        appState.ownerCivilizationId ||
        ctx.owner_civilization_id ||
        ctx.ownerCivilizationId ||
        "00000000-0000-4000-8000-000000000001"
      );
    }

    function v10cCompanyId(appState) {
      appState = v10cState(appState);
      var ctx = v10cContext(appState);
      return v10cText(
        appState.selectedCompanyId ||
        appState.aicm_user_company_id ||
        appState.companyId ||
        ctx.aicm_user_company_id ||
        ctx.selectedCompanyId ||
        ctx.company_id ||
        ""
      );
    }

    function v10cRowsFromPayload(payload) {
      payload = payload && typeof payload === "object" ? payload : {};

      var candidates = [
        payload.review_wait_items,
        payload.human_review_wait_items,
        payload.humanReviewWaitItems,
        payload.context && payload.context.review_wait_items,
        payload.data && payload.data.review_wait_items
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        if (Array.isArray(candidates[i])) {
          return candidates[i].filter(function(row) {
            return row && typeof row === "object";
          });
        }
      }

      return [];
    }

    function v10cMergePayload(appState, payload) {
      appState = v10cState(appState);
      payload = payload && typeof payload === "object" ? payload : {};

      var rows = v10cRowsFromPayload(payload);
      var ctx = v10cContext(appState);

      if (payload.result === "ok") {
        Object.keys(payload).forEach(function(key) {
          ctx[key] = payload[key];
        });
      }

      if (rows.length > 0) {
        ctx.review_wait_items = rows;
        appState.review_wait_items = rows;

        if (typeof state !== "undefined" && state && state !== appState) {
          if (!state.context || typeof state.context !== "object") state.context = {};
          state.context.review_wait_items = rows;
          state.review_wait_items = rows;
        }
      }

      if (payload.owner_civilization_id) {
        appState.owner_civilization_id = payload.owner_civilization_id;
      }

      appState.aicmR8zV10cPayloadRows = rows.length;
      appState.aicmR8zV10cMergedAt = new Date().toISOString();

      return rows;
    }

    function v10cRows(appState) {
      appState = v10cState(appState);
      var ctx = v10cContext(appState);

      var rows = v10cRowsFromPayload(ctx);
      if (!rows.length && Array.isArray(appState.review_wait_items)) rows = appState.review_wait_items;

      var companyId = v10cCompanyId(appState);
      if (companyId) {
        rows = rows.filter(function(row) {
          var rowCompany = v10cText(row.aicm_user_company_id || row.company_id || row.companyId);
          return !rowCompany || rowCompany === companyId;
        });
      }

      return rows;
    }

    function v10cSyncFetch(appState) {
      appState = v10cState(appState);

      if (v10cRows(appState).length > 0) return v10cRows(appState);
      if (typeof XMLHttpRequest === "undefined") {
        appState.aicmR8zV10cError = "XMLHttpRequest unavailable";
        return [];
      }

      var owner = v10cOwnerId(appState);
      var company = v10cCompanyId(appState);

      if (!owner) {
        appState.aicmR8zV10cError = "owner missing";
        return [];
      }

      var url = "/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner);
      if (company) url += "&aicm_user_company_id=" + encodeURIComponent(company);
      url += "&v=r8z_v10c_" + Date.now();

      appState.aicmR8zV10cFetchUrl = url;
      appState.aicmR8zV10cFetchStatus = "start";

      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        appState.aicmR8zV10cHttpStatus = xhr.status;
        appState.aicmR8zV10cFetchStatus = "done";

        if (xhr.status < 200 || xhr.status >= 300) {
          appState.aicmR8zV10cError = "context http " + String(xhr.status);
          return [];
        }

        var payload = {};
        try {
          payload = JSON.parse(xhr.responseText || "{}");
        } catch (parseError) {
          appState.aicmR8zV10cError = "parse error: " + v10cText(parseError && parseError.message ? parseError.message : parseError);
          return [];
        }

        var rows = v10cMergePayload(appState, payload);
        appState.aicmR8zV10cFetchStatus = "merged";
        return rows;
      } catch (error) {
        appState.aicmR8zV10cFetchStatus = "error";
        appState.aicmR8zV10cError = v10cText(error && error.message ? error.message : error);
        return [];
      }
    }

    function v10cReviewId(row) {
      return v10cText(
        row.aicm_human_review_item_id ||
        row.human_review_item_id ||
        row.review_id ||
        row.id ||
        ""
      );
    }

    function v10cRenderRow(row, index) {
      var reviewId = v10cReviewId(row);
      var title = v10cText(row.review_title || row.title || row.delivery_title || "レビュー項目");
      var summary = v10cText(row.delivery_summary_text || row.summary || row.description || "");
      var aiReview = v10cText(row.ai_review_result_text || "");
      var kind = v10cText(row.review_kind_label || row.review_kind_code || "");
      var artifact = v10cText(row.artifact_kind_label || row.artifact_kind_code || "");
      var priority = v10cText(row.priority_code || "");
      var requested = v10cText(row.requested_at || row.created_at || "");
      var responsible = v10cText(row.responsible_ai_label || row.requested_by_ai_label || "");

      var buttons = reviewId
        ? [
            '<div class="aicm-dashboard-action-row">',
            '  <button type="button" data-core-action="human-review-approve" data-review-id="' + v10cEsc(reviewId) + '" data-human-review-id="' + v10cEsc(reviewId) + '">承認</button>',
            '  <button type="button" data-core-action="human-review-return" data-review-id="' + v10cEsc(reviewId) + '" data-human-review-id="' + v10cEsc(reviewId) + '">差し戻し</button>',
            '</div>'
          ].join("")
        : [
            '<p class="aicm-core-message aicm-core-message-error">',
            'レビューIDがcontextに含まれていないため、承認/差し戻しは次工程でID露出を確認します。',
            '</p>'
          ].join("");

      return [
        '<article class="aicm-core-card" style="border:1px solid #dbeafe;">',
        '  <p class="aicm-eyebrow">レビュー待ち #' + v10cEsc(String(index + 1)) + '</p>',
        '  <h3>' + v10cEsc(title) + '</h3>',
        summary ? '  <p class="aicm-selected-note">' + v10cEsc(summary) + '</p>' : '',
        aiReview ? '  <p class="aicm-selected-note"><strong>AIレビュー:</strong> ' + v10cEsc(aiReview) + '</p>' : '',
        '  <dl class="aicm-core-detail-list">',
        '    <dt>種別</dt><dd>' + v10cEsc(kind || "-") + '</dd>',
        '    <dt>成果物</dt><dd>' + v10cEsc(artifact || "-") + '</dd>',
        '    <dt>優先度</dt><dd>' + v10cEsc(priority || "-") + '</dd>',
        '    <dt>依頼日時</dt><dd>' + v10cEsc(requested || "-") + '</dd>',
        '    <dt>担当AI</dt><dd>' + v10cEsc(responsible || "-") + '</dd>',
        '    <dt>review_id</dt><dd>' + v10cEsc(reviewId || "-") + '</dd>',
        '  </dl>',
        buttons,
        '</article>'
      ].join("");
    }

    function v10cRenderReviewList(appState) {
      appState = v10cState(appState);

      var beforeRows = v10cRows(appState);
      if (!beforeRows.length) {
        v10cSyncFetch(appState);
      }

      var rows = v10cRows(appState);
      var debug = [
        "V10C",
        "selectedCompanyId=" + v10cCompanyId(appState),
        "owner=" + v10cOwnerId(appState),
        "rows=" + String(rows.length),
        "payloadRows=" + String(appState.aicmR8zV10cPayloadRows !== undefined ? appState.aicmR8zV10cPayloadRows : "na"),
        "http=" + String(appState.aicmR8zV10cHttpStatus !== undefined ? appState.aicmR8zV10cHttpStatus : "na"),
        "status=" + v10cText(appState.aicmR8zV10cFetchStatus || "none"),
        appState.aicmR8zV10cError ? "error=" + v10cText(appState.aicmR8zV10cError) : ""
      ].filter(Boolean).join(" / ");

      var body = rows.length
        ? [
            '<section class="aicm-core-card">',
            '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
            '  <h2>レビュー・承認待ち: ' + v10cEsc(String(rows.length)) + '件</h2>',
            '  <p class="aicm-selected-note">' + v10cEsc(debug) + '</p>',
            '</section>',
            rows.map(v10cRenderRow).join("")
          ].join("")
        : [
            '<section class="aicm-core-card" style="border:1px solid #e5e7eb;">',
            '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
            '  <h2>レビュー・承認待ち: 0件</h2>',
            '  <p class="aicm-selected-note">' + v10cEsc(debug) + '</p>',
            '  <p class="aicm-core-message aicm-core-message-error">context APIからレビュー・承認待ちはありませんでした。</p>',
            '  <div class="aicm-dashboard-action-row">',
            '    <button type="button" data-core-action="go" data-screen="dashboard">ダッシュボードへ戻る</button>',
            '    <button type="button" data-core-action="go" data-screen="task-ledger">部門別タスク台帳へ</button>',
            '  </div>',
            '</section>'
          ].join("");

      if (typeof renderShell === "function") {
        return renderShell(body);
      }

      return body;
    }

    if (typeof window !== "undefined") {
      window.aicmR8zV10cRenderReviewList = v10cRenderReviewList;
      window.aicmR8zV7RenderReviewList = v10cRenderReviewList;
    }
  })();
  // AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER_END

  // AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD_START
  // Review artifact detail card. Scope: review-list only. No DB write / no API POST.
  (function installAicmR8zV10dReviewArtifactDetailCard() {
    function t(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function esc(value) {
      var text = t(value);
      if (typeof escapeHtml === "function") return escapeHtml(text);
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function app(appState) {
      if (appState && typeof appState === "object") return appState;
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      return {};
    }

    function ctx(appState) {
      appState = app(appState);
      if (!appState.context || typeof appState.context !== "object") appState.context = {};
      return appState.context;
    }

    function ownerId(appState) {
      appState = app(appState);
      var c = ctx(appState);
      return t(appState.owner_civilization_id || appState.ownerCivilizationId || c.owner_civilization_id || c.ownerCivilizationId || "00000000-0000-4000-8000-000000000001");
    }

    function companyId(appState) {
      appState = app(appState);
      var c = ctx(appState);
      return t(appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || c.aicm_user_company_id || c.selectedCompanyId || c.company_id || "");
    }

    function rowsFromPayload(payload) {
      payload = payload && typeof payload === "object" ? payload : {};
      var candidates = [
        payload.review_wait_items,
        payload.human_review_wait_items,
        payload.humanReviewWaitItems,
        payload.context && payload.context.review_wait_items,
        payload.data && payload.data.review_wait_items
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        if (Array.isArray(candidates[i])) {
          return candidates[i].filter(function(row) {
            return row && typeof row === "object";
          });
        }
      }

      return [];
    }

    function rows(appState) {
      appState = app(appState);
      var c = ctx(appState);
      var r = rowsFromPayload(c);

      if (!r.length && Array.isArray(appState.review_wait_items)) r = appState.review_wait_items;

      var cid = companyId(appState);
      if (cid) {
        r = r.filter(function(row) {
          var rowCompany = t(row.aicm_user_company_id || row.company_id || row.companyId);
          return !rowCompany || rowCompany === cid;
        });
      }

      return r;
    }

    function mergePayload(appState, payload) {
      appState = app(appState);
      payload = payload && typeof payload === "object" ? payload : {};
      var c = ctx(appState);
      var r = rowsFromPayload(payload);

      if (payload.result === "ok") {
        Object.keys(payload).forEach(function(key) {
          c[key] = payload[key];
        });
      }

      if (r.length) {
        c.review_wait_items = r;
        appState.review_wait_items = r;
      }

      appState.aicmR8zV10dPayloadRows = r.length;
      appState.aicmR8zV10dMergedAt = new Date().toISOString();

      return r;
    }

    function syncFetch(appState) {
      appState = app(appState);
      if (rows(appState).length > 0) return rows(appState);

      if (typeof XMLHttpRequest === "undefined") {
        appState.aicmR8zV10dError = "XMLHttpRequest unavailable";
        return [];
      }

      var owner = ownerId(appState);
      var cid = companyId(appState);
      var url = "/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner);
      if (cid) url += "&aicm_user_company_id=" + encodeURIComponent(cid);
      url += "&v=r8z_v10d_" + Date.now();

      appState.aicmR8zV10dFetchUrl = url;
      appState.aicmR8zV10dFetchStatus = "start";

      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        appState.aicmR8zV10dHttpStatus = xhr.status;

        if (xhr.status < 200 || xhr.status >= 300) {
          appState.aicmR8zV10dFetchStatus = "http-error";
          appState.aicmR8zV10dError = "context http " + String(xhr.status);
          return [];
        }

        var payload = {};
        try {
          payload = JSON.parse(xhr.responseText || "{}");
        } catch (parseError) {
          appState.aicmR8zV10dFetchStatus = "parse-error";
          appState.aicmR8zV10dError = t(parseError && parseError.message ? parseError.message : parseError);
          return [];
        }

        appState.aicmR8zV10dFetchStatus = "merged";
        return mergePayload(appState, payload);
      } catch (error) {
        appState.aicmR8zV10dFetchStatus = "error";
        appState.aicmR8zV10dError = t(error && error.message ? error.message : error);
        return [];
      }
    }

    function reviewId(row) {
      return t(row && (
        row.aicm_human_review_item_id ||
        row.human_review_item_id ||
        row.review_id ||
        row.id ||
        ""
      ));
    }

    function selectedReviewId(appState) {
      appState = app(appState);
      return t(appState.aicmR8zV10dSelectedReviewId || "");
    }

    function findSelectedRow(appState) {
      var id = selectedReviewId(appState);
      if (!id) return null;

      var r = rows(appState);
      for (var i = 0; i < r.length; i += 1) {
        if (reviewId(r[i]) === id) return r[i];
      }

      return null;
    }

    function meta(row) {
      var m = row && (row.metadata_jsonb || row.metadata || row.meta) || {};
      if (typeof m === "string") {
        try {
          m = JSON.parse(m);
        } catch (_) {
          m = { raw_metadata_text: m };
        }
      }
      if (!m || typeof m !== "object") m = {};
      return m;
    }

    function jsonPreview(value, maxLen) {
      var text = "";
      try {
        text = JSON.stringify(value || {}, null, 2);
      } catch (_) {
        text = t(value);
      }
      maxLen = maxLen || 2400;
      if (text.length > maxLen) text = text.slice(0, maxLen) + "\n...省略";
      return text;
    }

    function nestedOutputs(row) {
      var m = meta(row);
      var ocp = m.output_collection_payload || m.aiworker_output_collection_payload || {};
      var blocks = [];

      function addArrayBlock(label, value) {
        if (!Array.isArray(value) || !value.length) return;
        blocks.push([
          '<section class="aicm-core-card" style="background:#f8fafc;">',
          '  <p class="aicm-eyebrow">' + esc(label) + '</p>',
          '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:280px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(value, 2200)) + '</pre>',
          '</section>'
        ].join(""));
      }

      addArrayBlock("AIWorkerOS app read payload", ocp.aiworker_app_read_payload);
      addArrayBlock("AIWorkerOS full pipeline board", ocp.aiworker_full_pipeline_board);
      addArrayBlock("AIWorkerOS handoff packet board", ocp.aiworker_handoff_packet_board);
      addArrayBlock("Runtime handoff packet", ocp.aiworker_runtime_handoff_packet);

      return blocks.join("");
    }

    function renderField(label, value) {
      var text = t(value);
      if (!text) text = "-";
      return '<dt>' + esc(label) + '</dt><dd>' + esc(text) + '</dd>';
    }

    function renderTextSection(label, value) {
      var text = t(value);
      if (!text) return "";
      return [
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">' + esc(label) + '</p>',
        '  <p class="aicm-selected-note" style="white-space:pre-wrap;">' + esc(text) + '</p>',
        '</section>'
      ].join("");
    }

    function renderArtifactLink(row) {
      var link = t(row && row.artifact_link);
      if (!link) {
        return '<p class="aicm-selected-note">成果物リンク: 未登録</p>';
      }

      return [
        '<p class="aicm-selected-note">',
        '成果物リンク: <a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + esc(link) + '</a>',
        '</p>'
      ].join("");
    }

    function renderDetailCard(appState) {
      appState = app(appState);
      var row = findSelectedRow(appState);
      if (!row) return "";

      var id = reviewId(row);
      var m = meta(row);
      var title = t(row.review_title || row.title || "レビュー項目");

      return [
        '<section class="aicm-core-card" style="border:2px solid #f59e0b;">',
        '  <p class="aicm-eyebrow">成果物確認</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">承認/差し戻しの前に、成果物内容を確認してください。ここではDB更新しません。</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", id),
        renderField("レビュー種別", row.review_kind_label || row.review_kind_code),
        renderField("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        renderField("優先度", row.priority_code),
        renderField("依頼日時", row.requested_at || row.created_at),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        renderField("会社", row.company_name),
        renderField("部門", row.department_name),
        renderField("課", row.section_name),
        '  </dl>',
        renderArtifactLink(row),
        '</section>',
        renderTextSection("納品サマリー", row.delivery_summary_text),
        renderTextSection("主な変更点", row.main_changes_text),
        renderTextSection("AIレビュー結果", row.ai_review_result_text),
        renderTextSection("未解決事項", row.unresolved_issues_text),
        nestedOutputs(row),
        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
        '  <p class="aicm-eyebrow">次工程</p>',
        '  <h3>承認/差し戻しへ進む前の確認</h3>',
        '  <p class="aicm-selected-note">V10DではまだDB更新しません。次のV10Eでrollback smokeを行います。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d-close-detail">一覧へ戻る</button>',
        '  </div>',
        '</section>',
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3200)) + '</pre>',
        '</section>'
      ].join("");
    }

    function renderPreviewDecisionCard(appState) {
      appState = app(appState);
      var mode = t(appState.aicmR8zV10dDecisionPreviewMode || "");
      var row = findSelectedRow(appState);

      if (!mode || !row) return "";

      var title = mode === "approve" ? "承認確認プレビュー" : "差し戻し確認プレビュー";
      var note = mode === "approve"
        ? "次工程V10Eでrollback smoke後に承認DB更新を確認します。"
        : "次工程V10Eでrollback smoke後に差し戻しDB更新を確認します。";

      return [
        '<section class="aicm-core-card" style="border:2px solid #38bdf8;">',
        '  <p class="aicm-eyebrow">' + esc(title) + '</p>',
        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
        '  <p class="aicm-selected-note">' + esc(note) + '</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", reviewId(row)),
        renderField("操作予定", mode === "approve" ? "承認" : "差し戻し"),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d-clear-preview">プレビューを閉じる</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function renderListRow(row, index, currentId) {
      var id = reviewId(row);
      var title = t(row.review_title || row.title || "レビュー項目");
      var summary = t(row.delivery_summary_text || row.summary || row.description || "");
      var selected = id && id === currentId;

      return [
        '<article class="aicm-core-card" style="' + (selected ? 'border:2px solid #f59e0b;' : 'border:1px solid #dbeafe;') + '">',
        '  <p class="aicm-eyebrow">レビュー待ち #' + esc(String(index + 1)) + '</p>',
        '  <h3>' + esc(title) + '</h3>',
        summary ? '  <p class="aicm-selected-note">' + esc(summary) + '</p>' : '',
        '  <dl class="aicm-core-detail-list">',
        renderField("種別", row.review_kind_label || row.review_kind_code),
        renderField("成果物", row.artifact_kind_label || row.artifact_kind_code),
        renderField("優先度", row.priority_code),
        renderField("依頼日時", row.requested_at || row.created_at),
        renderField("review_id", id),
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function renderReviewList(appState) {
      appState = app(appState);

      if (!rows(appState).length) {
        syncFetch(appState);
      }

      var r = rows(appState);
      var currentId = selectedReviewId(appState);

      var debug = [
        "V10D",
        "selectedCompanyId=" + companyId(appState),
        "owner=" + ownerId(appState),
        "rows=" + String(r.length),
        "payloadRows=" + String(appState.aicmR8zV10dPayloadRows !== undefined ? appState.aicmR8zV10dPayloadRows : "na"),
        "http=" + String(appState.aicmR8zV10dHttpStatus !== undefined ? appState.aicmR8zV10dHttpStatus : "na"),
        "status=" + t(appState.aicmR8zV10dFetchStatus || "context"),
        currentId ? "selectedReviewId=" + currentId : "",
        appState.aicmR8zV10dError ? "error=" + t(appState.aicmR8zV10dError) : ""
      ].filter(Boolean).join(" / ");

      var body = [
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
        '  <h2>レビュー・承認待ち: ' + esc(String(r.length)) + '件</h2>',
        '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
        '  <p class="aicm-selected-note">成果物を確認してから、次工程で承認/差し戻しを行います。</p>',
        '</section>',
        renderDetailCard(appState),
        renderPreviewDecisionCard(appState),
        r.length
          ? r.map(function(row, index) { return renderListRow(row, index, currentId); }).join("")
          : [
              '<section class="aicm-core-card" style="border:1px solid #e5e7eb;">',
              '  <h3>レビュー・承認待ちはありません</h3>',
              '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
              '</section>'
            ].join("")
      ].join("");

      if (typeof renderShell === "function") return renderShell(body);
      return body;
    }

    function rerender() {
      try {
        if (typeof render === "function") {
          render();
          return;
        }
      } catch (_) {}

      try {
        if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
          window.aicmRender();
        }
      } catch (_) {}
    }

    function setDetail(id) {
      var s = app();
      s.aicmR8zV10dSelectedReviewId = t(id);
      s.aicmR8zV10dDecisionPreviewMode = "";
      rerender();
    }

    function closeDetail() {
      var s = app();
      s.aicmR8zV10dSelectedReviewId = "";
      s.aicmR8zV10dDecisionPreviewMode = "";
      rerender();
    }

    function previewDecision(mode, id) {
      var s = app();
      s.aicmR8zV10dSelectedReviewId = t(id) || selectedReviewId(s);
      s.aicmR8zV10dDecisionPreviewMode = mode;
      rerender();
    }

    function clearPreview() {
      var s = app();
      s.aicmR8zV10dDecisionPreviewMode = "";
      rerender();
    }

    function installClickBridge() {
      if (typeof document === "undefined" || document.__aicmR8zV10dReviewDetailClickBridge) return;
      document.__aicmR8zV10dReviewDetailClickBridge = true;

      document.addEventListener("click", function(event) {
        var target = event.target;
        while (target && target !== document && !target.getAttribute("data-core-action")) {
          target = target.parentNode;
        }

        if (!target || target === document) return;

        var action = target.getAttribute("data-core-action");
        if (!action || action.indexOf("review-v10d-") !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        var id = target.getAttribute("data-review-id") || target.getAttribute("data-human-review-id") || "";

        if (action === "review-v10d-open-detail") return setDetail(id);
        if (action === "review-v10d-close-detail") return closeDetail();
        if (action === "review-v10d-preview-approve") return previewDecision("approve", id);
        if (action === "review-v10d-preview-return") return previewDecision("return", id);
        if (action === "review-v10d-clear-preview") return clearPreview();
      }, true);
    }

    installClickBridge();

    if (typeof window !== "undefined") {
      window.aicmR8zV10dRenderReviewList = renderReviewList;
      window.aicmR8zV7RenderReviewList = renderReviewList;
    }
  })();
  // AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD_END

  // AICM_R8Z_V10D2_INLINE_ARTIFACT_DETAIL_UNDER_ROW_START
  // V10D2: show artifact detail inline directly under the clicked review row.
  // Scope: review-list only. No DB write / no API POST.
  (function installAicmR8zV10d2InlineArtifactDetail() {
    function t(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function esc(value) {
      var text = t(value);
      if (typeof escapeHtml === "function") return escapeHtml(text);
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function app(appState) {
      if (appState && typeof appState === "object") return appState;
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      return {};
    }

    function ctx(appState) {
      appState = app(appState);
      if (!appState.context || typeof appState.context !== "object") appState.context = {};
      return appState.context;
    }

    function ownerId(appState) {
      appState = app(appState);
      var c = ctx(appState);
      return t(appState.owner_civilization_id || appState.ownerCivilizationId || c.owner_civilization_id || c.ownerCivilizationId || "00000000-0000-4000-8000-000000000001");
    }

    function companyId(appState) {
      appState = app(appState);
      var c = ctx(appState);
      return t(appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || c.aicm_user_company_id || c.selectedCompanyId || c.company_id || "");
    }

    function rowsFromPayload(payload) {
      payload = payload && typeof payload === "object" ? payload : {};
      var candidates = [
        payload.review_wait_items,
        payload.human_review_wait_items,
        payload.humanReviewWaitItems,
        payload.context && payload.context.review_wait_items,
        payload.data && payload.data.review_wait_items
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        if (Array.isArray(candidates[i])) {
          return candidates[i].filter(function(row) {
            return row && typeof row === "object";
          });
        }
      }

      return [];
    }

    function rows(appState) {
      appState = app(appState);
      var c = ctx(appState);
      var r = rowsFromPayload(c);

      if (!r.length && Array.isArray(appState.review_wait_items)) r = appState.review_wait_items;

      var cid = companyId(appState);
      if (cid) {
        r = r.filter(function(row) {
          var rowCompany = t(row.aicm_user_company_id || row.company_id || row.companyId);
          return !rowCompany || rowCompany === cid;
        });
      }

      return r;
    }

    function mergePayload(appState, payload) {
      appState = app(appState);
      payload = payload && typeof payload === "object" ? payload : {};
      var c = ctx(appState);
      var r = rowsFromPayload(payload);

      if (payload.result === "ok") {
        Object.keys(payload).forEach(function(key) {
          c[key] = payload[key];
        });
      }

      if (r.length) {
        c.review_wait_items = r;
        appState.review_wait_items = r;
      }

      appState.aicmR8zV10d2PayloadRows = r.length;
      appState.aicmR8zV10d2MergedAt = new Date().toISOString();
      return r;
    }

    function syncFetch(appState) {
      appState = app(appState);
      if (rows(appState).length > 0) return rows(appState);

      if (typeof XMLHttpRequest === "undefined") {
        appState.aicmR8zV10d2Error = "XMLHttpRequest unavailable";
        return [];
      }

      var owner = ownerId(appState);
      var cid = companyId(appState);
      var url = "/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner);
      if (cid) url += "&aicm_user_company_id=" + encodeURIComponent(cid);
      url += "&v=r8z_v10d2_" + Date.now();

      appState.aicmR8zV10d2FetchUrl = url;
      appState.aicmR8zV10d2FetchStatus = "start";

      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        appState.aicmR8zV10d2HttpStatus = xhr.status;

        if (xhr.status < 200 || xhr.status >= 300) {
          appState.aicmR8zV10d2FetchStatus = "http-error";
          appState.aicmR8zV10d2Error = "context http " + String(xhr.status);
          return [];
        }

        var payload = {};
        try {
          payload = JSON.parse(xhr.responseText || "{}");
        } catch (parseError) {
          appState.aicmR8zV10d2FetchStatus = "parse-error";
          appState.aicmR8zV10d2Error = t(parseError && parseError.message ? parseError.message : parseError);
          return [];
        }

        appState.aicmR8zV10d2FetchStatus = "merged";
        return mergePayload(appState, payload);
      } catch (error) {
        appState.aicmR8zV10d2FetchStatus = "error";
        appState.aicmR8zV10d2Error = t(error && error.message ? error.message : error);
        return [];
      }
    }

    function reviewId(row) {
      return t(row && (
        row.aicm_human_review_item_id ||
        row.human_review_item_id ||
        row.review_id ||
        row.id ||
        ""
      ));
    }

    function selectedReviewId(appState) {
      appState = app(appState);
      return t(appState.aicmR8zV10d2SelectedReviewId || appState.aicmR8zV10dSelectedReviewId || "");
    }

    function meta(row) {
      var m = row && (row.metadata_jsonb || row.metadata || row.meta) || {};
      if (typeof m === "string") {
        try {
          m = JSON.parse(m);
        } catch (_) {
          m = { raw_metadata_text: m };
        }
      }
      if (!m || typeof m !== "object") m = {};
      return m;
    }

    function jsonPreview(value, maxLen) {
      var text = "";
      try {
        text = JSON.stringify(value || {}, null, 2);
      } catch (_) {
        text = t(value);
      }

      maxLen = maxLen || 2600;
      if (text.length > maxLen) text = text.slice(0, maxLen) + "\n...省略";
      return text;
    }

    function renderField(label, value) {
      var text = t(value) || "-";
      return '<dt>' + esc(label) + '</dt><dd>' + esc(text) + '</dd>';
    }

    function renderTextSection(label, value) {
      var text = t(value);
      if (!text) return "";
      return [
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">' + esc(label) + '</p>',
        '  <p class="aicm-selected-note" style="white-space:pre-wrap;">' + esc(text) + '</p>',
        '</section>'
      ].join("");
    }

    function renderArtifactLink(row) {
      var link = t(row && row.artifact_link);
      if (!link) return '<p class="aicm-selected-note">成果物リンク: 未登録</p>';

      return [
        '<p class="aicm-selected-note">',
        '成果物リンク: <a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + esc(link) + '</a>',
        '</p>'
      ].join("");
    }

    function nestedOutputs(row) {
      var m = meta(row);
      var ocp = m.output_collection_payload || m.aiworker_output_collection_payload || {};
      var blocks = [];

      function addBlock(label, value) {
        if (!Array.isArray(value) || !value.length) return;
        blocks.push([
          '<section class="aicm-core-card" style="background:#f8fafc;">',
          '  <p class="aicm-eyebrow">' + esc(label) + '</p>',
          '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:300px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(value, 2400)) + '</pre>',
          '</section>'
        ].join(""));
      }

      addBlock("AIWorkerOS app read payload", ocp.aiworker_app_read_payload);
      addBlock("AIWorkerOS full pipeline board", ocp.aiworker_full_pipeline_board);
      addBlock("AIWorkerOS handoff packet board", ocp.aiworker_handoff_packet_board);
      addBlock("Runtime handoff packet", ocp.aiworker_runtime_handoff_packet);

      return blocks.join("");
    }

    function renderInlineDetail(row) {
      if (!row) return "";

      var id = reviewId(row);
      var m = meta(row);
      var title = t(row.review_title || row.title || "レビュー項目");

      return [
        '<section id="aicm-v10d2-detail-' + esc(id) + '" class="aicm-core-card" style="border:3px solid #f59e0b;background:#fffbeb;">',
        '  <p class="aicm-eyebrow">成果物確認 / 選択中</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">このカードは押したレビュー項目の直下に表示しています。承認/差し戻しの前に内容を確認してください。</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", id),
        renderField("レビュー種別", row.review_kind_label || row.review_kind_code),
        renderField("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        renderField("優先度", row.priority_code),
        renderField("依頼日時", row.requested_at || row.created_at),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        renderField("会社", row.company_name),
        renderField("部門", row.department_name),
        renderField("課", row.section_name),
        '  </dl>',
        renderArtifactLink(row),
        '</section>',
        renderTextSection("納品サマリー", row.delivery_summary_text),
        renderTextSection("主な変更点", row.main_changes_text),
        renderTextSection("AIレビュー結果", row.ai_review_result_text),
        renderTextSection("未解決事項", row.unresolved_issues_text),
        nestedOutputs(row),
        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
        '  <p class="aicm-eyebrow">次工程</p>',
        '  <h3>承認/差し戻しへ進む前の確認</h3>',
        '  <p class="aicm-selected-note">ここではDB更新しません。次のV10Eでrollback smokeを行います。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d2-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d2-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d2-close-detail">詳細を閉じる</button>',
        '  </div>',
        '</section>',
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3200)) + '</pre>',
        '</section>'
      ].join("");
    }

    function renderPreview(appState, row) {
      appState = app(appState);
      var mode = t(appState.aicmR8zV10d2DecisionPreviewMode || "");
      if (!mode || !row) return "";

      var title = mode === "approve" ? "承認確認プレビュー" : "差し戻し確認プレビュー";

      return [
        '<section class="aicm-core-card" style="border:2px solid #38bdf8;">',
        '  <p class="aicm-eyebrow">' + esc(title) + '</p>',
        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
        '  <p class="aicm-selected-note">これはプレビューです。DB更新はまだ実行しません。</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", reviewId(row)),
        renderField("操作予定", mode === "approve" ? "承認" : "差し戻し"),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d2-clear-preview">プレビューを閉じる</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function renderListRow(appState, row, index, currentId) {
      var id = reviewId(row);
      var title = t(row.review_title || row.title || "レビュー項目");
      var summary = t(row.delivery_summary_text || row.summary || row.description || "");
      var selected = id && id === currentId;

      return [
        '<article class="aicm-core-card" style="' + (selected ? 'border:2px solid #f59e0b;' : 'border:1px solid #dbeafe;') + '">',
        '  <p class="aicm-eyebrow">レビュー待ち #' + esc(String(index + 1)) + '</p>',
        '  <h3>' + esc(title) + '</h3>',
        summary ? '  <p class="aicm-selected-note">' + esc(summary) + '</p>' : '',
        '  <dl class="aicm-core-detail-list">',
        renderField("種別", row.review_kind_label || row.review_kind_code),
        renderField("成果物", row.artifact_kind_label || row.artifact_kind_code),
        renderField("優先度", row.priority_code),
        renderField("依頼日時", row.requested_at || row.created_at),
        renderField("review_id", id),
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d2-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
        '  </div>',
        '</article>',
        selected ? renderInlineDetail(row) + renderPreview(appState, row) : ''
      ].join("");
    }

    function renderReviewList(appState) {
      appState = app(appState);

      if (!rows(appState).length) syncFetch(appState);

      var r = rows(appState);
      var currentId = selectedReviewId(appState);

      var debug = [
        "V10D2",
        "selectedCompanyId=" + companyId(appState),
        "owner=" + ownerId(appState),
        "rows=" + String(r.length),
        "payloadRows=" + String(appState.aicmR8zV10d2PayloadRows !== undefined ? appState.aicmR8zV10d2PayloadRows : "na"),
        "http=" + String(appState.aicmR8zV10d2HttpStatus !== undefined ? appState.aicmR8zV10d2HttpStatus : "na"),
        "status=" + t(appState.aicmR8zV10d2FetchStatus || "context"),
        currentId ? "selectedReviewId=" + currentId : "",
        appState.aicmR8zV10d2Error ? "error=" + t(appState.aicmR8zV10d2Error) : ""
      ].filter(Boolean).join(" / ");

      var body = [
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
        '  <h2>レビュー・承認待ち: ' + esc(String(r.length)) + '件</h2>',
        '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
        '  <p class="aicm-selected-note">「成果物を確認」を押すと、その項目の直下に詳細カードを表示します。</p>',
        '</section>',
        r.length
          ? r.map(function(row, index) { return renderListRow(appState, row, index, currentId); }).join("")
          : [
              '<section class="aicm-core-card" style="border:1px solid #e5e7eb;">',
              '  <h3>レビュー・承認待ちはありません</h3>',
              '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
              '</section>'
            ].join("")
      ].join("");

      if (typeof renderShell === "function") return renderShell(body);
      return body;
    }

    function rerenderAndScroll(id) {
      try {
        if (typeof render === "function") render();
        else if (typeof window !== "undefined" && typeof window.aicmRender === "function") window.aicmRender();
      } catch (_) {}

      if (!id || typeof document === "undefined") return;

      setTimeout(function() {
        try {
          var el = document.getElementById("aicm-v10d2-detail-" + id);
          if (el && typeof el.scrollIntoView === "function") {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } catch (_) {}
      }, 80);
    }

    function setDetail(id) {
      var s = app();
      s.aicmR8zV10d2SelectedReviewId = t(id);
      s.aicmR8zV10dSelectedReviewId = t(id);
      s.aicmR8zV10d2DecisionPreviewMode = "";
      rerenderAndScroll(t(id));
    }

    function closeDetail() {
      var s = app();
      s.aicmR8zV10d2SelectedReviewId = "";
      s.aicmR8zV10dSelectedReviewId = "";
      s.aicmR8zV10d2DecisionPreviewMode = "";
      rerenderAndScroll("");
    }

    function preview(mode, id) {
      var s = app();
      s.aicmR8zV10d2SelectedReviewId = t(id) || selectedReviewId(s);
      s.aicmR8zV10dSelectedReviewId = s.aicmR8zV10d2SelectedReviewId;
      s.aicmR8zV10d2DecisionPreviewMode = mode;
      rerenderAndScroll(s.aicmR8zV10d2SelectedReviewId);
    }

    function clearPreview() {
      var s = app();
      s.aicmR8zV10d2DecisionPreviewMode = "";
      rerenderAndScroll(selectedReviewId(s));
    }

    function installClickBridge() {
      if (typeof document === "undefined" || document.__aicmR8zV10d2InlineDetailClickBridge) return;
      document.__aicmR8zV10d2InlineDetailClickBridge = true;

      document.addEventListener("click", function(event) {
        var target = event.target;
        while (target && target !== document && !(target.getAttribute && target.getAttribute("data-core-action"))) {
          target = target.parentNode;
        }

        if (!target || target === document || !(target.getAttribute)) return;

        var action = target.getAttribute("data-core-action");
        if (!action || action.indexOf("review-v10d2-") !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        var id = target.getAttribute("data-review-id") || "";

        if (action === "review-v10d2-open-detail") return setDetail(id);
        if (action === "review-v10d2-close-detail") return closeDetail();
        if (action === "review-v10d2-preview-approve") return preview("approve", id);
        if (action === "review-v10d2-preview-return") return preview("return", id);
        if (action === "review-v10d2-clear-preview") return clearPreview();
      }, true);
    }

    installClickBridge();

    if (typeof window !== "undefined") {
      window.aicmR8zV10d2RenderReviewList = renderReviewList;
      window.aicmR8zV7RenderReviewList = renderReviewList;
    }
  })();
  // AICM_R8Z_V10D2_INLINE_ARTIFACT_DETAIL_UNDER_ROW_END

  // AICM_R8Z_V10D4_REVIEW_DETAIL_COMPAT_CLICK_BRIDGE_START
  // V10D4: compatibility click bridge for review artifact detail.
  // Scope: review-list only. No DB write / no API POST.
  (function installAicmR8zV10d4ReviewDetailCompatClickBridge() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function esc(value) {
      var s = text(value);
      if (typeof escapeHtml === "function") return escapeHtml(s);
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function app() {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
      return {};
    }

    // AICM_R8Z_V10D5_REVIEW_DETAIL_BRIDGE_CONTEXT_FALLBACK_START
    function rowsFromPayloadV10D5(payload) {
      payload = payload && typeof payload === "object" ? payload : {};

      var candidates = [
        payload.review_wait_items,
        payload.human_review_wait_items,
        payload.humanReviewWaitItems,
        payload.context && payload.context.review_wait_items,
        payload.data && payload.data.review_wait_items
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        if (Array.isArray(candidates[i])) {
          return candidates[i].filter(function(row) {
            return row && typeof row === "object";
          });
        }
      }

      return [];
    }

    function ownerFromStateV10D5() {
      var s = app();
      var c = s && s.context && typeof s.context === "object" ? s.context : {};
      return text(
        s.owner_civilization_id ||
        s.ownerCivilizationId ||
        c.owner_civilization_id ||
        c.ownerCivilizationId ||
        "00000000-0000-4000-8000-000000000001"
      );
    }

    function companyFromStateV10D5() {
      var s = app();
      var c = s && s.context && typeof s.context === "object" ? s.context : {};
      return text(
        s.selectedCompanyId ||
        s.aicm_user_company_id ||
        s.companyId ||
        c.aicm_user_company_id ||
        c.selectedCompanyId ||
        c.company_id ||
        "8b9be487-7b74-4517-9b59-6c84a82ae6aa"
      );
    }

    function fetchRowsByContextV10D5() {
      if (typeof window !== "undefined" && Array.isArray(window.__aicmR8zV10d5ContextRows) && window.__aicmR8zV10d5ContextRows.length) {
        return window.__aicmR8zV10d5ContextRows;
      }

      if (typeof XMLHttpRequest === "undefined") return [];

      var s = app();
      var owner = ownerFromStateV10D5();
      var company = companyFromStateV10D5();

      var url = "/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner);
      if (company) url += "&aicm_user_company_id=" + encodeURIComponent(company);
      url += "&v=r8z_v10d5_" + Date.now();

      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        s.aicmR8zV10d5HttpStatus = xhr.status;
        s.aicmR8zV10d5FetchUrl = url;

        if (xhr.status < 200 || xhr.status >= 300) {
          s.aicmR8zV10d5FetchStatus = "http-error";
          s.aicmR8zV10d5Error = "context http " + String(xhr.status);
          return [];
        }

        var payload = {};
        try {
          payload = JSON.parse(xhr.responseText || "{}");
        } catch (parseError) {
          s.aicmR8zV10d5FetchStatus = "parse-error";
          s.aicmR8zV10d5Error = text(parseError && parseError.message ? parseError.message : parseError);
          return [];
        }

        var rows = rowsFromPayloadV10D5(payload);

        if (rows.length) {
          if (typeof window !== "undefined") window.__aicmR8zV10d5ContextRows = rows;

          try {
            if (!s.context || typeof s.context !== "object") s.context = {};
            s.context.review_wait_items = rows;
            s.review_wait_items = rows;
          } catch (_) {}
        }

        s.aicmR8zV10d5FetchStatus = "merged";
        s.aicmR8zV10d5Rows = rows.length;

        return rows;
      } catch (error) {
        s.aicmR8zV10d5FetchStatus = "error";
        s.aicmR8zV10d5Error = text(error && error.message ? error.message : error);
        return [];
      }
    }

    function rowsFromState() {
      var s = app();
      var ctx = s.context && typeof s.context === "object" ? s.context : {};
      var candidates = [
        ctx.review_wait_items,
        s.review_wait_items,
        ctx.human_review_wait_items,
        s.human_review_wait_items,
        typeof window !== "undefined" ? window.__aicmR8zV10d5ContextRows : null
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        if (Array.isArray(candidates[i]) && candidates[i].length) return candidates[i];
      }

      return fetchRowsByContextV10D5();
    }
    // AICM_R8Z_V10D5_REVIEW_DETAIL_BRIDGE_CONTEXT_FALLBACK_END

  // AICM_R8Z_V10F_REVIEW_APPROVE_RETURN_CONFIRM_UI_START
  // V10F: confirmation UI only. No DB write / no API POST.
  (function installAicmR8zV10fReviewConfirmUi() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function esc(value) {
      var s = text(value);
      if (typeof escapeHtml === "function") return escapeHtml(s);
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function app() {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
      return {};
    }

    function rowsFromPayload(payload) {
      payload = payload && typeof payload === "object" ? payload : {};

      var candidates = [
        payload.review_wait_items,
        payload.human_review_wait_items,
        payload.humanReviewWaitItems,
        payload.context && payload.context.review_wait_items,
        payload.data && payload.data.review_wait_items
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        if (Array.isArray(candidates[i])) {
          return candidates[i].filter(function(row) {
            return row && typeof row === "object";
          });
        }
      }

      return [];
    }

    function rowsFromState() {
      var s = app();
      var c = s.context && typeof s.context === "object" ? s.context : {};
      var candidates = [
        c.review_wait_items,
        s.review_wait_items,
        typeof window !== "undefined" ? window.__aicmR8zV10d5ContextRows : null,
        typeof window !== "undefined" ? window.__aicmR8zV10fContextRows : null
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        if (Array.isArray(candidates[i]) && candidates[i].length) return candidates[i];
      }

      return [];
    }

    function ownerFromState() {
      var s = app();
      var c = s.context && typeof s.context === "object" ? s.context : {};
      return text(
        s.owner_civilization_id ||
        s.ownerCivilizationId ||
        c.owner_civilization_id ||
        c.ownerCivilizationId ||
        "00000000-0000-4000-8000-000000000001"
      );
    }

    function companyFromState() {
      var s = app();
      var c = s.context && typeof s.context === "object" ? s.context : {};
      return text(
        s.selectedCompanyId ||
        s.aicm_user_company_id ||
        s.companyId ||
        c.aicm_user_company_id ||
        c.selectedCompanyId ||
        c.company_id ||
        "8b9be487-7b74-4517-9b59-6c84a82ae6aa"
      );
    }

    function fetchRows() {
      var cached = rowsFromState();
      if (cached.length) return cached;

      if (typeof XMLHttpRequest === "undefined") return [];

      var s = app();
      var owner = ownerFromState();
      var company = companyFromState();

      var url = "/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner);
      if (company) url += "&aicm_user_company_id=" + encodeURIComponent(company);
      url += "&v=r8z_v10f_" + Date.now();

      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        s.aicmR8zV10fHttpStatus = xhr.status;
        s.aicmR8zV10fFetchUrl = url;

        if (xhr.status < 200 || xhr.status >= 300) {
          s.aicmR8zV10fError = "context http " + String(xhr.status);
          return [];
        }

        var payload = {};
        try {
          payload = JSON.parse(xhr.responseText || "{}");
        } catch (parseError) {
          s.aicmR8zV10fError = text(parseError && parseError.message ? parseError.message : parseError);
          return [];
        }

        var rows = rowsFromPayload(payload);

        if (rows.length) {
          if (typeof window !== "undefined") window.__aicmR8zV10fContextRows = rows;
          if (!s.context || typeof s.context !== "object") s.context = {};
          s.context.review_wait_items = rows;
          s.review_wait_items = rows;
        }

        s.aicmR8zV10fRows = rows.length;
        return rows;
      } catch (error) {
        s.aicmR8zV10fError = text(error && error.message ? error.message : error);
        return [];
      }
    }

    function reviewId(row) {
      return text(row && (
        row.aicm_human_review_item_id ||
        row.human_review_item_id ||
        row.review_id ||
        row.id ||
        ""
      ));
    }

    function findRowById(id) {
      id = text(id);
      var rows = fetchRows();

      for (var i = 0; i < rows.length; i += 1) {
        if (reviewId(rows[i]) === id) return rows[i];
      }

      return null;
    }

    function field(label, value) {
      return '<dt>' + esc(label) + '</dt><dd>' + esc(text(value) || "-") + '</dd>';
    }

    function removeExistingConfirm() {
      if (typeof document === "undefined") return;

      var nodes = document.querySelectorAll('[data-aicm-v10f-confirm="true"]');
      for (var i = 0; i < nodes.length; i += 1) {
        if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
      }
    }

    function renderConfirm(row, mode, id) {
      var isApprove = mode === "approve";
      var title = isApprove ? "承認前の最終確認" : "差し戻し前の最終確認";
      var nextStatus = isApprove ? "approved" : "returned";
      var operation = isApprove ? "承認" : "差し戻し";
      var border = isApprove ? "#22c55e" : "#f97316";
      var bg = isApprove ? "#f0fdf4" : "#fff7ed";

      return [
        '<section class="aicm-core-card" style="border:3px solid ' + border + ';background:' + bg + ';">',
        '  <p class="aicm-eyebrow">V10F / DB更新前確認</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">この確認画面で内容を確認し、問題なければDB更新を実行します。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("操作予定", operation),
        field("status遷移予定", "pending → " + nextStatus),
        field("review_id", id),
        field("レビュー", row.review_title || row.title || "レビュー項目"),
        field("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        field("優先度", row.priority_code),
        field("依頼日時", row.requested_at || row.created_at),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        field("会社", row.company_name),
        '  </dl>',
        '  <div class="aicm-core-card" style="background:#ffffff;">',
        '    <p class="aicm-eyebrow">確認事項</p>',
        '    <p class="aicm-selected-note">成果物内容・AIレビュー・未解決事項を確認したうえで、下のボタンからDB更新を実行します。</p>',
        '  </div>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10f-cancel-confirm" data-review-id="' + esc(id) + '">確認を閉じる</button>',
        '    <button type="button" class="aicm-primary-button" data-core-action="review-decision-execute" data-review-decision="' + esc(nextStatus) + '" data-review-item-id="' + esc(id) + '" data-owner-civilization-id="' + esc(row.owner_civilization_id || row.ownerCivilizationId || row.owner_id || row.ownerId || "") + '" data-human-reviewer-label="' + esc(row.human_reviewer_label || row.humanReviewerLabel || row.reviewer_label || row.reviewerLabel || "user") + '">' + esc(operation) + 'を実行する</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function findActionElement(target) {
      while (target && target !== document) {
        if (target.getAttribute && target.getAttribute("data-core-action")) return target;
        target = target.parentNode;
      }
      return null;
    }

    function findInsertHost(actionEl) {
      var host = actionEl;

      while (host && host !== document) {
        if (
          host.className &&
          String(host.className).indexOf("aicm-core-card") >= 0 &&
          host.innerHTML &&
          String(host.innerHTML).indexOf("次工程") >= 0
        ) {
          return host;
        }
        host = host.parentNode;
      }

      host = actionEl;
      while (host && host !== document) {
        if (host.className && String(host.className).indexOf("aicm-core-card") >= 0) return host;
        host = host.parentNode;
      }

      return null;
    }

    function visibleDebug(message) {
      try {
        var root = document.querySelector(".aicm-core-card");
        var node = document.getElementById("aicm-v10f-visible-debug");

        if (!node) {
          node = document.createElement("div");
          node.id = "aicm-v10f-visible-debug";
          node.className = "aicm-core-card";
          node.style.border = "2px solid #a855f7";
          node.style.background = "#faf5ff";
          node.innerHTML = '<p class="aicm-eyebrow">V10F confirm debug</p><p class="aicm-selected-note">' + esc(message) + '</p>';
          if (root && root.parentNode) root.parentNode.insertBefore(node, root.nextSibling);
        } else {
          node.innerHTML = '<p class="aicm-eyebrow">V10F confirm debug</p><p class="aicm-selected-note">' + esc(message) + '</p>';
        }
      } catch (_) {}
    }

    function showConfirm(actionEl, mode, id, eventSource) {
      id = text(id);
      var row = findRowById(id);

      removeExistingConfirm();

      if (!row) {
        visibleDebug("confirm row not found / mode=" + mode + " / id=" + id + " / rows=" + String(rowsFromState().length) + " / source=" + eventSource);
        return true;
      }

      var host = findInsertHost(actionEl);
      if (!host || !host.parentNode) {
        visibleDebug("confirm host not found / mode=" + mode + " / id=" + id + " / source=" + eventSource);
        return true;
      }

      var wrap = document.createElement("div");
      wrap.setAttribute("data-aicm-v10f-confirm", "true");
      wrap.innerHTML = renderConfirm(row, mode, id);

      host.parentNode.insertBefore(wrap, host.nextSibling);

      visibleDebug("confirm shown / mode=" + mode + " / id=" + id + " / source=" + eventSource);

      setTimeout(function() {
        try {
          var el = wrap.querySelector(".aicm-core-card");
          if (el && typeof el.scrollIntoView === "function") {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } catch (_) {}
      }, 80);

      return true;
    }

    function handle(actionEl, event, source) {
      if (!actionEl) return false;

      var action = actionEl.getAttribute("data-core-action") || "";
      var id = actionEl.getAttribute("data-review-id") || actionEl.getAttribute("data-human-review-id") || "";

      var mode = "";
      if (
        action === "review-v10d-preview-approve" ||
        action === "review-v10d2-preview-approve" ||
        action === "review-v10d4-preview-approve" ||
        action === "review-v10f-preview-approve"
      ) mode = "approve";

      if (
        action === "review-v10d-preview-return" ||
        action === "review-v10d2-preview-return" ||
        action === "review-v10d4-preview-return" ||
        action === "review-v10f-preview-return"
      ) mode = "return";

      
      if (action === "review-v10f-back-list") {
        if (event) {
          try { event.preventDefault(); } catch (_) {}
          try { event.stopPropagation(); } catch (_) {}
          try { event.stopImmediatePropagation(); } catch (_) {}
        }

        removeExistingConfirm();
        try {
          var s = app();
          s.screen = "review-list";
          if (typeof render === "function") render();
        } catch (_) {}
        visibleDebug("back to review-list / id=" + id);
        return true;
      }

if (action === "review-v10f-cancel-confirm") {
        if (event) {
          try { event.preventDefault(); } catch (_) {}
          try { event.stopPropagation(); } catch (_) {}
          try { event.stopImmediatePropagation(); } catch (_) {}
        }

        removeExistingConfirm();
        visibleDebug("confirm closed / id=" + id);
        return true;
      }

      if (!mode) return false;

      if (event) {
        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}
      }

      var s = app();
      s.aicmR8zV10fLastAction = action;
      s.aicmR8zV10fLastReviewId = id;
      s.aicmR8zV10fLastMode = mode;
      s.aicmR8zV10fLastSource = source || "";

      return showConfirm(actionEl, mode, id, source || "");
    }

    function bridge(event) {
      var actionEl = findActionElement(event && event.target);
      if (!actionEl) return;

      var action = actionEl.getAttribute("data-core-action") || "";
      if (action.indexOf("review-v10d") !== 0 && action.indexOf("review-v10f") !== 0) return;

      handle(actionEl, event, event && event.type ? event.type : "event");
    }

    function installBridge() {
      if (typeof document === "undefined" || document.__aicmR8zV10fReviewConfirmUiBridge) return;
      document.__aicmR8zV10fReviewConfirmUiBridge = true;

      document.addEventListener("click", bridge, true);
      document.addEventListener("pointerup", bridge, true);
      document.addEventListener("touchend", bridge, true);
    }

    installBridge();

    if (typeof window !== "undefined") {
      window.aicmR8zV10fShowReviewConfirm = function(actionEl, mode, id) {
        return showConfirm(actionEl, mode, id, "manual");
      };
    }
  })();
  // AICM_R8Z_V10F_REVIEW_APPROVE_RETURN_CONFIRM_UI_END


    function reviewId(row) {
      return text(row && (
        row.aicm_human_review_item_id ||
        row.human_review_item_id ||
        row.review_id ||
        row.id ||
        ""
      ));
    }

    function findRowById(id) {
      id = text(id);
      if (!id) return null;

      var rows = rowsFromState();
      for (var i = 0; i < rows.length; i += 1) {
        if (reviewId(rows[i]) === id) return rows[i];
      }

      return null;
    }

    function detailId(id) {
      return "aicm-v10d4-detail-" + text(id);
    }

    function meta(row) {
      var m = row && (row.metadata_jsonb || row.metadata || row.meta) || {};
      if (typeof m === "string") {
        try {
          m = JSON.parse(m);
        } catch (_) {
          m = { raw_metadata_text: m };
        }
      }
      if (!m || typeof m !== "object") m = {};
      return m;
    }

    function jsonPreview(value, maxLen) {
      var out = "";
      try {
        out = JSON.stringify(value || {}, null, 2);
      } catch (_) {
        out = text(value);
      }
      maxLen = maxLen || 3200;
      if (out.length > maxLen) out = out.slice(0, maxLen) + "\n...省略";
      return out;
    }

    function field(label, value) {
      return '<dt>' + esc(label) + '</dt><dd>' + esc(text(value) || "-") + '</dd>';
    }

    function section(label, value) {
      var v = text(value);
      if (!v) return "";
      return [
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">' + esc(label) + '</p>',
        '  <p class="aicm-selected-note" style="white-space:pre-wrap;">' + esc(v) + '</p>',
        '</section>'
      ].join("");
    }

    function artifactLink(row) {
      var link = text(row && row.artifact_link);
      if (!link) return '<p class="aicm-selected-note">成果物リンク: 未登録</p>';
      return '<p class="aicm-selected-note">成果物リンク: <a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + esc(link) + '</a></p>';
    }

    function nestedOutputs(row) {
      var m = meta(row);
      var ocp = m.output_collection_payload || m.aiworker_output_collection_payload || {};
      var blocks = [];

      function add(label, value) {
        if (!Array.isArray(value) || !value.length) return;
        blocks.push([
          '<section class="aicm-core-card" style="background:#f8fafc;">',
          '  <p class="aicm-eyebrow">' + esc(label) + '</p>',
          '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:300px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(value, 2600)) + '</pre>',
          '</section>'
        ].join(""));
      }

      add("AIWorkerOS app read payload", ocp.aiworker_app_read_payload);
      add("AIWorkerOS full pipeline board", ocp.aiworker_full_pipeline_board);
      add("AIWorkerOS handoff packet board", ocp.aiworker_handoff_packet_board);
      add("Runtime handoff packet", ocp.aiworker_runtime_handoff_packet);

      return blocks.join("");
    }

    function renderDetail(row, id) {
      var m = meta(row);
      var title = text(row.review_title || row.title || "レビュー項目");

      return [
        '<section id="' + esc(detailId(id)) + '" class="aicm-core-card" style="border:3px solid #f59e0b;background:#fffbeb;">',
        '  <p class="aicm-eyebrow">成果物確認 / V10D4</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">この詳細カードはクリック互換bridgeで押した行の直下に挿入しています。承認/差し戻しの前に確認してください。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("review_id", id),
        field("レビュー種別", row.review_kind_label || row.review_kind_code),
        field("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        field("優先度", row.priority_code),
        field("依頼日時", row.requested_at || row.created_at),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        field("会社", row.company_name),
        field("部門", row.department_name),
        field("課", row.section_name),
        '  </dl>',
        artifactLink(row),
        '</section>',
        section("納品サマリー", row.delivery_summary_text),
        section("主な変更点", row.main_changes_text),
        section("AIレビュー結果", row.ai_review_result_text),
        section("未解決事項", row.unresolved_issues_text),
        nestedOutputs(row),
        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
        '  <p class="aicm-eyebrow">次工程</p>',
        '  <h3>承認/差し戻しへ進む前の確認</h3>',
        '  <p class="aicm-selected-note">ここではDB更新しません。次のV10Eでrollback smokeを行います。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d4-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d4-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d4-close-detail" data-review-id="' + esc(id) + '">詳細を閉じる</button>',
        '  </div>',
        '</section>',
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3400)) + '</pre>',
        '</section>'
      ].join("");
    }

    function renderPreview(row, mode, id) {
      var title = mode === "approve" ? "承認確認プレビュー / V10D4" : "差し戻し確認プレビュー / V10D4";
      return [
        '<section class="aicm-core-card" style="border:2px solid #38bdf8;">',
        '  <p class="aicm-eyebrow">' + esc(title) + '</p>',
        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
        '  <p class="aicm-selected-note">これはプレビューです。DB更新はまだ実行しません。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("review_id", id),
        field("操作予定", mode === "approve" ? "承認" : "差し戻し"),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        '  </dl>',
        '</section>'
      ].join("");
    }

    function removeExistingDetails() {
      if (typeof document === "undefined") return;
      var existing = document.querySelectorAll('[data-aicm-v10d4-detail="true"]');
      for (var i = 0; i < existing.length; i += 1) {
        if (existing[i] && existing[i].parentNode) existing[i].parentNode.removeChild(existing[i]);
      }
    }

    function findActionElement(target) {
      while (target && target !== document) {
        if (target.getAttribute && target.getAttribute("data-core-action")) return target;
        target = target.parentNode;
      }
      return null;
    }

    function setVisibleDebug(message) {
      var s = app();
      s.aicmR8zV10d4Debug = message;
      s.aicmR8zV10d4ClickedAt = new Date().toISOString();

      try {
        var root = document.querySelector(".aicm-core-card");
        if (root && !document.getElementById("aicm-v10d4-visible-debug")) {
          var node = document.createElement("div");
          node.id = "aicm-v10d4-visible-debug";
          node.className = "aicm-core-card";
          node.style.border = "2px solid #38bdf8";
          node.style.background = "#eff6ff";
          node.innerHTML = '<p class="aicm-eyebrow">V10D4 click debug</p><p class="aicm-selected-note">' + esc(message) + '</p>';
          root.parentNode.insertBefore(node, root.nextSibling);
        } else {
          var debug = document.getElementById("aicm-v10d4-visible-debug");
          if (debug) debug.innerHTML = '<p class="aicm-eyebrow">V10D4 click debug</p><p class="aicm-selected-note">' + esc(message) + '</p>';
        }
      } catch (_) {}
    }

    function insertDetailAfterButton(actionEl, row, id, previewMode) {
      if (!actionEl || typeof document === "undefined") return false;

      removeExistingDetails();

      var host = actionEl;
      while (host && host !== document) {
        if (host.className && String(host.className).indexOf("aicm-core-card") >= 0) break;
        host = host.parentNode;
      }

      if (!host || host === document || !host.parentNode) return false;

      var wrap = document.createElement("div");
      wrap.setAttribute("data-aicm-v10d4-detail", "true");
      wrap.innerHTML = renderDetail(row, id) + (previewMode ? renderPreview(row, previewMode, id) : "");

      host.parentNode.insertBefore(wrap, host.nextSibling);

      setTimeout(function() {
        try {
          var el = document.getElementById(detailId(id));
          if (el && typeof el.scrollIntoView === "function") {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } catch (_) {}
      }, 80);

      return true;
    }

    function handle(actionEl, event, source) {
      if (!actionEl) return false;

      var action = actionEl.getAttribute("data-core-action") || "";
      var id = actionEl.getAttribute("data-review-id") || actionEl.getAttribute("data-human-review-id") || "";

      var supported = {
        "review-v10d-open-detail": "open",
        "review-v10d2-open-detail": "open",
        "review-v10d4-open-detail": "open",
        "review-v10d-preview-approve": "approve",
        "review-v10d2-preview-approve": "approve",
        "review-v10d4-preview-approve": "approve",
        "review-v10d-preview-return": "return",
        "review-v10d2-preview-return": "return",
        "review-v10d4-preview-return": "return",
        "review-v10d-close-detail": "close",
        "review-v10d2-close-detail": "close",
        "review-v10d4-close-detail": "close"
      };

      var mode = supported[action];
      if (!mode) return false;

      if (event) {
        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}
      }

      var s = app();
      s.aicmR8zV10d4LastAction = action;
      s.aicmR8zV10d4LastReviewId = id;
      s.aicmR8zV10d4LastSource = source || "";

      if (mode === "close") {
        removeExistingDetails();
        s.aicmR8zV10d4SelectedReviewId = "";
        setVisibleDebug("closed / action=" + action);
        return true;
      }

      var row = findRowById(id);
      if (!row) {
        setVisibleDebug("clicked but row not found / action=" + action + " / id=" + id + " / rows=" + String(rowsFromState().length));
        return true;
      }

      s.aicmR8zV10d4SelectedReviewId = id;
      s.aicmR8zV10d2SelectedReviewId = id;
      s.aicmR8zV10dSelectedReviewId = id;

      var previewMode = "";
      if (mode === "approve") previewMode = "approve";
      if (mode === "return") previewMode = "return";

      var inserted = insertDetailAfterButton(actionEl, row, id, previewMode);
      setVisibleDebug("clicked / source=" + (source || "") + " / action=" + action + " / id=" + id + " / inserted=" + String(inserted));

      return true;
    }

    function bridge(event) {
      var actionEl = findActionElement(event && event.target);
      if (!actionEl) return;

      var action = actionEl.getAttribute("data-core-action") || "";
      if (action.indexOf("review-v10d") !== 0) return;

      handle(actionEl, event, event && event.type ? event.type : "event");
    }

    function installBridge() {
      if (typeof document === "undefined" || document.__aicmR8zV10d4CompatClickBridge) return;
      document.__aicmR8zV10d4CompatClickBridge = true;

      document.addEventListener("click", bridge, true);
      document.addEventListener("pointerup", bridge, true);
      document.addEventListener("touchend", bridge, true);
    }

    installBridge();

    if (typeof window !== "undefined") {
      window.aicmR8zV10d4HandleReviewDetailAction = function(actionEl) {
        return handle(actionEl, null, "manual");
      };
    }
  })();
  // AICM_R8Z_V10D4_REVIEW_DETAIL_COMPAT_CLICK_BRIDGE_END


// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_END


// AICM_R8Z_V10F3_REVIEW_CONFIRM_BACK_BUTTON_APPLIED


// AICM_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON_START
// Canonical review decision handler for renderConfirm(row, mode, id).
// No DOM post-render normalization, no observer, no hardcoded owner fallback.
function aicmR8zV10gc3iText(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function aicmR8zV10gc3iApp() {
  if (typeof state !== "undefined" && state && typeof state === "object") return state;
  if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
  return {};
}

function aicmR8zV10gc3iNoteValue() {
  try {
    var node = document.querySelector('[data-aicm-review-decision-note], textarea[name="human_review_note"], textarea[name="review_decision_note"], textarea[name="return_reason"]');
    return node ? aicmR8zV10gc3iText(node.value) : "";
  } catch (_) {
    return "";
  }
}

function aicmR8zV10gc3iSetMessage(kind, value) {
  try {
    if (typeof setMessage === "function") {
      setMessage(kind, value);
      return;
    }
  } catch (_) {}

  try {
    var s = aicmR8zV10gc3iApp();
    s.messageKind = kind;
    s.messageText = value;
  } catch (_) {}
}

function aicmR8zV10gc3iBuildPayload(button) {
  return {
    aicm_human_review_item_id: aicmR8zV10gc3iText(button.getAttribute("data-review-item-id") || ""),
    owner_civilization_id: aicmR8zV10gc3iText(button.getAttribute("data-owner-civilization-id") || ""),
    human_reviewer_label: aicmR8zV10gc3iText(button.getAttribute("data-human-reviewer-label") || "user") || "user",
    human_review_note: aicmR8zV10gc3iNoteValue()
  };
}

function aicmR8zV10gc3iMissingPayloadKeys(payload) {
  return ["aicm_human_review_item_id", "owner_civilization_id", "human_reviewer_label"].filter(function(key) {
    return !aicmR8zV10gc3iText(payload[key]);
  });
}

function aicmR8zV10gc3iRoute(decision) {
  return decision === "returned" ? "/api/aicm/v2/human-review/return" : "/api/aicm/v2/human-review/approve";
}

async function aicmR8zV10gc3iPostDecision(decision, payload) {
  var response = await fetch(aicmR8zV10gc3iRoute(decision), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  var json = null;
  try { json = await response.json(); } catch (_) { json = null; }

  if (!response.ok || (json && json.result === "error")) {
    throw new Error(json && (json.error || json.message) ? (json.error || json.message) : "レビュー更新に失敗しました。");
  }

  return json || { result: "ok" };
}

function aicmR8zV10gc3iRemoveReviewFromState(reviewId) {
  var s = aicmR8zV10gc3iApp();
  var id = aicmR8zV10gc3iText(reviewId);

  function same(row) {
    return aicmR8zV10gc3iText(row && (
      row.aicm_human_review_item_id ||
      row.human_review_item_id ||
      row.review_item_id ||
      row.review_id ||
      row.id ||
      ""
    )) === id;
  }

  function filterRows(rows) {
    return Array.isArray(rows) ? rows.filter(function(row) { return !same(row); }) : rows;
  }

  try {
    s.review_wait_items = filterRows(s.review_wait_items);
    s.reviewWaitItems = filterRows(s.reviewWaitItems);
    s.reviewRows = filterRows(s.reviewRows);

    if (s.context && typeof s.context === "object") {
      Object.keys(s.context).forEach(function(key) {
        if (Array.isArray(s.context[key])) {
          s.context[key] = filterRows(s.context[key]);
        }
      });
    }

    s.aicmR8zV10fReviewConfirm = null;
    s.reviewDecisionConfirm = null;
    s.reviewConfirm = null;
    s.aicmReviewConfirm = null;
    s.selectedReview = null;
    s.reviewDetail = null;
    s.screen = "review-list";
  } catch (_) {}
}

async function aicmR8zV10gc3iRefreshReviewList(reviewId) {
  aicmR8zV10gc3iRemoveReviewFromState(reviewId);

  try {
    if (typeof aicmR8zV9ReviewListScriptHydrate === "function") {
      aicmR8zV9ReviewListScriptHydrate(aicmR8zV10gc3iApp());
    }
  } catch (_) {}

  try {
    if (typeof render === "function") render();
  } catch (_) {}


  // AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL_CALL
  try {
    if (typeof aicmR8zV10gc4bAfterReviewDecisionSuccess === "function") {
      aicmR8zV10gc4bAfterReviewDecisionSuccess();
    }
  } catch (_) {}

}

async function aicmR8zV10gc3iExecuteReviewDecision(button) {
  var decision = aicmR8zV10gc3iText(button.getAttribute("data-review-decision") || "");
  var payload = aicmR8zV10gc3iBuildPayload(button);
  var missing = aicmR8zV10gc3iMissingPayloadKeys(payload);

  if (decision !== "approved" && decision !== "returned") {
    aicmR8zV10gc3iSetMessage("error", "レビュー操作種別が不明です。");
    return;
  }

  if (missing.length > 0) {
    aicmR8zV10gc3iSetMessage("error", "レビュー更新に必要な値が不足しています: " + missing.join(", "));
    try {
      if (typeof window !== "undefined") {
        window.aicmR8zV10gc3iLastMissingPayload = payload;
      }
    } catch (_) {}
    if (typeof render === "function") render();
    return;
  }

  try {
    button.disabled = true;
    aicmR8zV10gc3iSetMessage("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");

    await aicmR8zV10gc3iPostDecision(decision, payload);

    aicmR8zV10gc3iSetMessage("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");

    await aicmR8zV10gc3iRefreshReviewList(payload.aicm_human_review_item_id);
  } catch (error) {
    button.disabled = false;
    aicmR8zV10gc3iSetMessage("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
    if (typeof render === "function") render();
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("click", function(event) {
    var target = event && event.target;
    var button = target && target.closest ? target.closest('button[data-core-action="review-decision-execute"]') : null;
    if (!button) return;

    try { event.preventDefault(); } catch (_) {}
    try { event.stopPropagation(); } catch (_) {}
    try { event.stopImmediatePropagation(); } catch (_) {}

    aicmR8zV10gc3iExecuteReviewDecision(button);
  }, true);
}

if (typeof window !== "undefined") {
  window.aicmR8zV10gc3iExecuteReviewDecision = aicmR8zV10gc3iExecuteReviewDecision;
}
// AICM_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON_END


// AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL_START
// Review list screen-control guard.
// Shows pending review items only and clears stale confirm/detail/metadata state after review decisions.
function aicmR8zV10gc4bText(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function aicmR8zV10gc4bApp() {
  if (typeof state !== "undefined" && state && typeof state === "object") return state;
  if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
  return {};
}

function aicmR8zV10gc4bIsReviewRow(row) {
  return !!(row && typeof row === "object" && (
    Object.prototype.hasOwnProperty.call(row, "aicm_human_review_item_id") ||
    Object.prototype.hasOwnProperty.call(row, "human_review_status_code") ||
    Object.prototype.hasOwnProperty.call(row, "review_kind_code") ||
    Object.prototype.hasOwnProperty.call(row, "artifact_kind_code")
  ));
}

function aicmR8zV10gc4bStatus(row) {
  return aicmR8zV10gc4bText(row && (
    row.human_review_status_code ||
    row.review_status ||
    row.status_code ||
    row.status ||
    ""
  ));
}

function aicmR8zV10gc4bFilterReviewRows(rows) {
  if (!Array.isArray(rows)) return rows;

  var hasReviewRows = rows.some(aicmR8zV10gc4bIsReviewRow);
  if (!hasReviewRows) return rows;

  return rows.filter(function(row) {
    return aicmR8zV10gc4bStatus(row) === "pending";
  });
}

function aicmR8zV10gc4bFilterObjectReviewRows(obj) {
  if (!obj || typeof obj !== "object") return obj;

  Object.keys(obj).forEach(function(key) {
    var value = obj[key];

    if (Array.isArray(value)) {
      obj[key] = aicmR8zV10gc4bFilterReviewRows(value);
    } else if (value && typeof value === "object") {
      aicmR8zV10gc4bFilterObjectReviewRows(value);
    }
  });

  return obj;
}

function aicmR8zV10gc4bClearReviewConfirmAndDetailState() {
  var app = aicmR8zV10gc4bApp();

  try {
    app.aicmR8zV10fReviewConfirm = null;
    app.reviewDecisionConfirm = null;
    app.reviewConfirm = null;
    app.aicmReviewConfirm = null;
    app.selectedReview = null;
    app.reviewDetail = null;
    app.selectedReviewDetail = null;
    app.reviewMetadata = null;
    app.reviewArtifactDetail = null;
    app.aicmReviewArtifactDetail = null;
  } catch (_) {}
}

function aicmR8zV10gc4bScrubReviewListState() {
  var app = aicmR8zV10gc4bApp();

  try {
    aicmR8zV10gc4bFilterObjectReviewRows(app);

    if (app.context && typeof app.context === "object") {
      aicmR8zV10gc4bFilterObjectReviewRows(app.context);
    }
  } catch (_) {}

  return app;
}

function aicmR8zV10gc4bAfterReviewDecisionSuccess() {
  var app = aicmR8zV10gc4bScrubReviewListState();

  try {
    app.screen = "review-list";
  } catch (_) {}

  aicmR8zV10gc4bClearReviewConfirmAndDetailState();

  try {
    if (typeof window !== "undefined" && window.scrollTo) {
      window.scrollTo(0, 0);
    }
  } catch (_) {}
}

function aicmR8zV10gc4bInstallOneShotScrub() {
  try {
    setTimeout(function() {
      try {
        aicmR8zV10gc4bScrubReviewListState();
        if (typeof render === "function") render();
      } catch (_) {}
    }, 0);
  } catch (_) {}
}

if (typeof window !== "undefined") {
  window.aicmR8zV10gc4bScrubReviewListState = aicmR8zV10gc4bScrubReviewListState;
  window.aicmR8zV10gc4bAfterReviewDecisionSuccess = aicmR8zV10gc4bAfterReviewDecisionSuccess;
  aicmR8zV10gc4bInstallOneShotScrub();
}
// AICM_R8Z_V10GC4B_REVIEW_PENDING_ONLY_SCREEN_CONTROL_END


// AICM_R8Z_V10GC4C_REVIEW_EMPTY_STATE_FIX_START
// Empty review list state normalized.
// pending=0 is not a fetch failure.
// AICM_R8Z_V10GC4C_REVIEW_EMPTY_STATE_FIX_END


// AICM_R8Z_V10GC4D_REMAINING_REVIEW_EMPTY_BAD_TEXT_CLEANUP_START
// Remaining old empty-state wording removed.
// pending=0 is a valid empty state, not a fetch failure.
// AICM_R8Z_V10GC4D_REMAINING_REVIEW_EMPTY_BAD_TEXT_CLEANUP_END


// AICM_R8Z_V10GC4E_REVIEW_EMPTY_RED_BORDER_CLEANUP_START
// pending=0 review empty-state card should not look like an error.
// Red border cleanup is limited to the empty review-state window.
// AICM_R8Z_V10GC4E_REVIEW_EMPTY_RED_BORDER_CLEANUP_END
