(function (global) {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var DEPARTMENT_ACTIONS = {
    "add-department": true,
    "save-department": true,
    "delete-department": true
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function getState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { aiworkers: [], companies: [] };
    } catch (error) {
      return { aiworkers: [], companies: [] };
    }
  }

  function setCurrentCompany(companyId) {
    if (companyId) {
      sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", companyId);
      sessionStorage.setItem("AICM_PENDING_COMPANY_ID", companyId);
    }
  }

  function getCurrentCompanyId() {
    var select = byId("company-select");
    var state;

    if (select && select.value) return select.value;

    if (sessionStorage.getItem("AICM_CURRENT_COMPANY_ID")) {
      return sessionStorage.getItem("AICM_CURRENT_COMPANY_ID");
    }

    if (sessionStorage.getItem("AICM_PENDING_COMPANY_ID")) {
      return sessionStorage.getItem("AICM_PENDING_COMPANY_ID");
    }

    state = getState();
    if (state.companies && state.companies[0]) {
      return state.companies[0].id || state.companies[0].company_id || "";
    }

    return "";
  }

  function setPendingDepartment(departmentId) {
    if (departmentId) {
      sessionStorage.setItem("AICM_PENDING_DEPARTMENT_ID", departmentId);
    }
  }

  function createRepository() {
    if (!global.AICM || !global.AICM.AicmLocalRepository) {
      return null;
    }

    return new global.AICM.AicmLocalRepository({
      storageKey: STORAGE_KEY
    });
  }

  function getRepository() {
    return createRepository();
  }

  function resultDepartmentId(result) {
    if (!result || !result.data) return "";
    if (result.data.department && (result.data.department.id || result.data.department.department_id)) {
      return result.data.department.id || result.data.department.department_id;
    }
    return "";
  }

  function currentDepartmentId() {
    var select = byId("department-select");
    var state;
    var companyId;
    var company;

    if (select && select.value) return select.value;

    if (sessionStorage.getItem("AICM_PENDING_DEPARTMENT_ID")) {
      return sessionStorage.getItem("AICM_PENDING_DEPARTMENT_ID");
    }

    companyId = getCurrentCompanyId();
    state = getState();

    company = (state.companies || []).find(function (c) {
      return c.id === companyId || c.company_id === companyId;
    });

    if (company && company.departments && company.departments[0]) {
      return company.departments[0].id || company.departments[0].department_id || "";
    }

    return "";
  }

  function buildCreateDepartmentPayload() {
    return {
      company_id: getCurrentCompanyId(),
      department_name: byId("new-department-name") ? byId("new-department-name").value : "新規部門",
      purpose: byId("new-department-purpose") ? byId("new-department-purpose").value : "",
      display_order: 100
    };
  }

  function buildSaveDepartmentPayload() {
    return {
      company_id: getCurrentCompanyId(),
      department_id: currentDepartmentId(),
      department_name: byId("edit-department-name") ? byId("edit-department-name").value : "",
      purpose: byId("edit-department-purpose") ? byId("edit-department-purpose").value : "",
      department_status: "active",
      display_order: 100
    };
  }

  function buildDeleteDepartmentPayload() {
    return {
      company_id: getCurrentCompanyId(),
      department_id: currentDepartmentId()
    };
  }

  function isDepartmentAction(action) {
    return !!DEPARTMENT_ACTIONS[action];
  }

  function handleDepartmentAction(action) {
    var repository = getRepository();
    var companyId;

    if (!repository) {
      return Promise.resolve({
        ok: false,
        error_code: "DEPARTMENT_WIRING_NOT_READY",
        error_message: "Department wiring is not ready.",
        details: {},
        request_id: "department_wiring_not_ready"
      });
    }

    companyId = getCurrentCompanyId();
    setCurrentCompany(companyId);

    if (action === "add-department") {
      return repository.createDepartment(buildCreateDepartmentPayload()).then(function (result) {
        var departmentId = resultDepartmentId(result);
        if (departmentId) setPendingDepartment(departmentId);
        return result;
      });
    }

    if (action === "save-department") {
      return repository.saveDepartment(buildSaveDepartmentPayload()).then(function (result) {
        setPendingDepartment(currentDepartmentId());
        return result;
      });
    }

    if (action === "delete-department") {
      return repository.deleteDepartment(buildDeleteDepartmentPayload()).then(function (result) {
        sessionStorage.removeItem("AICM_PENDING_DEPARTMENT_ID");
        return result;
      });
    }

    return Promise.resolve({
      ok: false,
      error_code: "DEPARTMENT_ACTION_NOT_SUPPORTED",
      error_message: "Department action is not supported: " + action,
      details: { action: action },
      request_id: "department_action_not_supported"
    });
  }

  function installCompanyMemoryHandler() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-action]") : null;
      var action;
      var select;

      if (!button) return;

      action = button.getAttribute("data-action");
      if (action !== "switch-company") return;

      select = byId("company-select");
      if (select && select.value) {
        setCurrentCompany(select.value);
      }
    }, true);

    document.addEventListener("change", function (event) {
      if (event.target && event.target.id === "company-select" && event.target.value) {
        setCurrentCompany(event.target.value);
      }
    }, true);
  }

  function installCaptureHandler() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-action]") : null;
      var action;

      if (!button) return;

      action = button.getAttribute("data-action");
      if (!isDepartmentAction(action)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      handleDepartmentAction(action).then(function () {
        location.reload();
      });
    }, true);
  }

  function init() {
    var companyId = getCurrentCompanyId();

    if (companyId) setCurrentCompany(companyId);

    global.AICM = global.AICM || {};
    global.AICM.departmentLocalActionWiring = {
      storageKey: STORAGE_KEY,
      departmentActionsOnly: true,
      realApiConnect: false,
      dbApply: false,
      rlsApply: false,
      isDepartmentAction: isDepartmentAction,
      handleDepartmentAction: handleDepartmentAction,
      getCurrentCompanyId: getCurrentCompanyId,
      currentDepartmentId: currentDepartmentId
    };

    installCompanyMemoryHandler();
    installCaptureHandler();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
