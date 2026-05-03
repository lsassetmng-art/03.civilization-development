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
    state.screen = screen;
    state.errorMessage = "";
    render();
  }

  function pageTitle() {
    if (state.screen === "company-new") return "AI企業新規追加";
    if (state.screen === "department-new") return "部門新規追加";
    if (state.screen === "section-new") return "課新規追加";
    if (state.screen === "placement-new") return "Worker配置";
    if (state.screen === "settings") return "AI企業設定";
    return "AI企業ダッシュボード";
  }

  
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

  
function renderCompanyOverview(company, departments, sections, placements) {
    return [
      '<div class="aicm-overview-block">',
      '  <div class="aicm-overview-main">',
      '    <strong>' + escapeHtml(company.company_name) + '</strong>',
      '    <span>' + escapeHtml(company.business_domain || "事業領域なし") + '</span>',
      '  </div>',
      '  <div class="aicm-overview-count-row">',
      '    <div><dt>部門</dt><dd>' + departments.length + '件</dd></div>',
      '    <div><dt>課</dt><dd>' + sections.length + '件</dd></div>',
      '    <div><dt>Worker配置</dt><dd>' + placements.length + '件</dd></div>',
      '  </div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="go" data-screen="settings">AI企業変更</button>',
      '    <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
      '  </div>',
      '</div>'
    ].join("");
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
      '      <div><strong>ChatGPT用プロンプト</strong><p>部門別タスク台帳の大項目CSVをChatGPTで作成します。</p></div>',
      '      <button type="button" data-core-action="task-ledger-chatgpt-prompt">ChatGPT用プロンプト</button>',
      '    </div>',
      '    <div class="aicm-csv-flow-step">',
      '      <div><strong>CSVファイル読込</strong><p>作成したCSVファイルを選択します。</p></div>',
      '      <button type="button" data-core-action="task-ledger-csv-file-open">CSVファイル読込</button>',
      '    </div>',
      '    <div class="aicm-csv-file-name">ファイル名: <strong>' + escapeHtml(fileName) + '</strong></div>',
      '    <div class="aicm-csv-flow-step">',
      '      <div><strong>CSV取り込み実行</strong><p>読み込んだCSVを部門別タスク台帳へ登録します。</p></div>',
      '      <button type="button" data-core-action="task-ledger-csv-import">CSV取り込み実行</button>',
      '    </div>',
      '  </div>',
      '  <input id="aicm-ledger-csv-file" class="aicm-hidden-file" type="file" accept=".csv,text/csv" data-core-file="task-ledger-csv">',
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
    return (state.context.pmlw_major_items || []).filter(function (row) {
      return String(row.aicm_user_company_id || "") === String(companyId || "");
    });
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

  function renderPmlwMajorRows(rows) {
    if (!rows.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>Manager大項目はまだありません</strong>',
        '  <p>President方針またはユーザー依頼からManagerが大項目を作ると、ここに表示されます。</p>',
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
          '      </tr>'
        ].join("");
      }).join(""),
      '    </tbody>',
      '  </table>',
      '</div>'
    ].join("");
  }


  

function renderTaskLedgerPlaceholder() {
    var company = selectedCompany();
    var rows = company ? pmlwMajorRowsForCompany(company.aicm_user_company_id) : [];

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門別タスク台帳</p>',
      '  <h2>部門別タスク台帳</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">President方針やユーザー依頼を、Managerが大項目として整理し、部門・課・Leaderへ引き渡すための台帳です。</p>',
      '</section>',
      renderCsvImportCard(company),
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Manager大項目</p>',
      '  <h2>登録済み大項目</h2>',
      renderPmlwMajorRows(rows),
      '</section>'
    ].join(""));
  }

  function renderReviewListPlaceholder() {
    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
      '  <h2>レビュー・承認待ち一覧</h2>',
      '  <p class="aicm-core-empty">この画面は次工程で clean core に接続します。</p>',
      '</section>'
    ].join(""));
  }


  

function renderDepartmentEditPlaceholder() {
    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門変更</p>',
      '  <h2>部門変更</h2>',
      '  <p class="aicm-core-empty">部門変更は次工程で保存処理を接続します。</p>',
      '  <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボードへ戻る</button>',
      '</section>'
    ].join(""));
  }

  function renderSectionEditPlaceholder() {
    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">課変更</p>',
      '  <h2>課変更</h2>',
      '  <p class="aicm-core-empty">課変更は次工程で保存処理を接続します。</p>',
      '  <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボードへ戻る</button>',
      '</section>'
    ].join(""));
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
    } else if (state.screen === "settings") {
      html = renderSettings();
    } else if (state.screen === "department-edit") {
      html = renderDepartmentEditPlaceholder();
    } else if (state.screen === "section-edit") {
      html = renderSectionEditPlaceholder();
    } else if (state.screen === "task-ledger") {
      html = renderTaskLedgerPlaceholder();
    } else if (state.screen === "review-list") {
      html = renderReviewListPlaceholder();
    } else {
      html = renderDashboard();
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

  function handleRootClick(event) {
    var button = event.target.closest("[data-core-action]");
    if (!button) return;

    var action = button.getAttribute("data-core-action") || "";

            if (action === "task-ledger-fill-csv-template") {
      fillTaskLedgerCsvTemplate();
      return;
    }

        if (action === "task-ledger-csv-file-open") {
      openTaskLedgerCsvFilePicker();
      return;
    }

    if (action === "task-ledger-chatgpt-prompt") {
      openTaskLedgerChatGptPrompt();
      return;
    }
if (action === "task-ledger-csv-preview") {
      previewTaskLedgerCsv();
      return;
    }

    if (action === "task-ledger-csv-import") {
      importTaskLedgerCsv();
      return;
    }
if (action === "task-ledger-create") {
      createTaskLedgerFromForm();
      return;
    }
if (action === "go") {
      go(button.getAttribute("data-screen") || "dashboard");
      return;
    }

    if (action === "reload") {
      loadContext();
      return;
    }
  }

  function handleRootChange(event) {
    var field = event.target;
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
