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
    return {
      companies: list(json.companies),
      departments: list(json.departments),
      sections: list(json.sections),
      placements: list(json.placements),
      robotCatalog: list(json.robot_catalog || json.robotCatalog)
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
      '    <p class="aicm-core-subtitle">v2正本UI候補 / owner_civilization_id単位</p>',
      '  </header>',
      '  <nav class="aicm-core-tabs" aria-label="AICompanyManager navigation">',
      '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
      '    <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
      '    <button type="button" data-core-action="go" data-screen="department-new">部門追加</button>',
      '    <button type="button" data-core-action="go" data-screen="section-new">課追加</button>',
      '    <button type="button" data-core-action="go" data-screen="placement-new">Worker配置</button>',
      '  </nav>',
      renderMessages(),
      '  <main class="aicm-core-main">',
      '    <h2>' + escapeHtml(pageTitle()) + '</h2>',
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
      '<section class="aicm-core-card">',
      '  <h3>AI企業選択</h3>',
      renderCompanySelect(),
      '  <button type="button" data-core-action="reload">AI企業を表示</button>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <h3>会社概要</h3>',
      company ? [
        '<p><strong>' + escapeHtml(company.company_name) + '</strong></p>',
        '<p>' + escapeHtml(company.business_domain || "事業領域なし") + '</p>',
        '<p>会社共通ルール: ' + escapeHtml(company.company_common_rules_text ? "1件" : "0件") + '</p>'
      ].join("") : '<p class="aicm-core-empty">会社なし</p>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <h3>全体状況</h3>',
      '  <p>会社数: ' + state.context.companies.length + '</p>',
      '  <p>部門数: ' + departments.length + '</p>',
      '  <p>課数: ' + sections.length + '</p>',
      '  <p>Worker配置数: ' + placements.length + '</p>',
      '  <p>Robot候補数: ' + state.context.robotCatalog.length + '</p>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <h3>部門 / 課</h3>',
      renderTree(departments),
      '</section>'
    ].join(""));
  }

  function renderTree(departments) {
    if (departments.length === 0) {
      return '<p class="aicm-core-empty">部門なし</p>';
    }

    return departments.map(function (department) {
      var sections = departmentSections(department.aicm_user_company_department_id);
      return [
        '<div class="aicm-core-tree-node">',
        '  <strong>' + escapeHtml(department.department_name) + '</strong>',
        sections.length === 0 ? '<p class="aicm-core-empty">課なし</p>' : [
          '<ul>',
          sections.map(function (section) {
            return '<li>' + escapeHtml(section.section_name) + '</li>';
          }).join(""),
          '</ul>'
        ].join(""),
        '</div>'
      ].join("");
    }).join("");
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
        '<p class="aicm-core-empty">編集/削除は未接続。作成系の確認後に実装します。</p>'
      ].join("") : '<p class="aicm-core-empty">会社なし</p>',
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
      ".aicm-core{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:980px;margin:0 auto;padding:20px;color:#1f2937}",
      ".aicm-core-header h1{font-size:34px;margin:0 0 6px}",
      ".aicm-core-subtitle{color:#6b7280;margin:0 0 18px}",
      ".aicm-core-tabs{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px}",
      ".aicm-core button{border:1px solid #d8dee9;background:#eef2ff;border-radius:14px;padding:12px 16px;font-weight:700}",
      ".aicm-core-main h2{font-size:28px;margin:16px 0}",
      ".aicm-core-card{background:#fff;border:1px solid #e5e7eb;border-radius:22px;padding:20px;margin:16px 0;box-shadow:0 8px 24px rgba(15,23,42,.06)}",
      ".aicm-core-card h3{font-size:22px;margin:0 0 14px}",
      ".aicm-core label{display:block;font-weight:700;margin:12px 0 6px}",
      ".aicm-core input,.aicm-core select,.aicm-core textarea{width:100%;box-sizing:border-box;border:1px solid #cfd6e4;border-radius:14px;padding:12px;font-size:16px;background:#fff}",
      ".aicm-core-message{border-radius:14px;padding:12px 14px;margin:12px 0;background:#f3f4f6}",
      ".aicm-core-message-ok{background:#ecfdf5;color:#047857}",
      ".aicm-core-message-error{background:#fef2f2;color:#b91c1c}",
      ".aicm-core-empty{color:#6b7280}",
      ".aicm-core-tree-node{padding:12px;border-left:4px solid #dbeafe;margin:10px 0;background:#f8fafc;border-radius:12px}"
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
