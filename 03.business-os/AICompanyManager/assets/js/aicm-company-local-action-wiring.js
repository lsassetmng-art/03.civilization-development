(function (global) {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var COMPANY_ACTIONS = {
    "add-company": true,
    "save-company": true,
    "delete-company": true,
    "add-common-rules": true
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

  function setPendingCompany(companyId) {
    if (companyId) {
      sessionStorage.setItem("AICM_PENDING_COMPANY_ID", companyId);
    }
  }

  function consumePendingCompany() {
    var companyId = sessionStorage.getItem("AICM_PENDING_COMPANY_ID");
    if (!companyId) return;

    var select = byId("company-select");
    if (!select) return;

    var found = false;
    Array.prototype.forEach.call(select.options, function (option) {
      if (option.value === companyId) found = true;
    });

    if (!found) return;

    select.value = companyId;
    sessionStorage.removeItem("AICM_PENDING_COMPANY_ID");

    var button = document.querySelector('[data-action="switch-company"]');
    if (button && typeof button.click === "function") {
      setTimeout(function () {
        button.click();
      }, 0);
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

  function createHandlers() {
    if (!global.AICM || !global.AICM.AicmActionAdapter || !global.AICM.createActionHandlers) {
      return null;
    }

    var repository = createRepository();
    if (!repository) return null;

    var actionAdapter = new global.AICM.AicmActionAdapter(repository);
    return global.AICM.createActionHandlers({
      actionAdapter: actionAdapter
    });
  }

  function isCompanyAction(action) {
    return !!COMPANY_ACTIONS[action];
  }

  function resultCompanyId(result) {
    if (!result || !result.data) return "";
    if (result.data.company && (result.data.company.id || result.data.company.company_id)) {
      return result.data.company.id || result.data.company.company_id;
    }
    return "";
  }

  function handleCompanyAction(action) {
    var handlers = createHandlers();
    var state;

    if (!handlers || !handlers.company) {
      return Promise.resolve({
        ok: false,
        error_code: "COMPANY_WIRING_NOT_READY",
        error_message: "Company wiring is not ready.",
        details: {},
        request_id: "company_wiring_not_ready"
      });
    }

    if (action === "add-company") {
      return handlers.company.createCompany().then(function (result) {
        var companyId = resultCompanyId(result);
        if (companyId) setPendingCompany(companyId);
        return result;
      });
    }

    if (action === "save-company") {
      return handlers.company.saveCompany().then(function (result) {
        var selected = byId("edit-company-select");
        if (selected && selected.value) setPendingCompany(selected.value);
        return result;
      });
    }

    if (action === "delete-company") {
      state = getState();
      if (!state.companies || state.companies.length <= 1) {
        return Promise.resolve({
          ok: false,
          error_code: "COMPANY_DELETE_LAST_COMPANY_BLOCKED",
          error_message: "Last company delete is blocked in local wiring.",
          details: { company_count: state.companies ? state.companies.length : 0 },
          request_id: "company_delete_blocked"
        });
      }

      return handlers.company.deleteCompany().then(function (result) {
        state = getState();
        if (state.companies && state.companies[0]) {
          setPendingCompany(state.companies[0].id || state.companies[0].company_id);
        }
        return result;
      });
    }

    if (action === "add-common-rules") {
      return handlers.company.saveCompanyRules().then(function (result) {
        var selected = byId("company-select") || byId("edit-company-select");
        if (selected && selected.value) setPendingCompany(selected.value);
        return result;
      });
    }

    return Promise.resolve({
      ok: false,
      error_code: "COMPANY_ACTION_NOT_SUPPORTED",
      error_message: "Company action is not supported: " + action,
      details: { action: action },
      request_id: "company_action_not_supported"
    });
  }

  function installCaptureHandler() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-action]") : null;
      var action;

      if (!button) return;

      action = button.getAttribute("data-action");
      if (!isCompanyAction(action)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      handleCompanyAction(action).then(function () {
        location.reload();
      });
    }, true);
  }

  function init() {
    global.AICM = global.AICM || {};
    global.AICM.companyLocalActionWiring = {
      storageKey: STORAGE_KEY,
      companyActionsOnly: true,
      realApiConnect: false,
      dbApply: false,
      rlsApply: false,
      isCompanyAction: isCompanyAction,
      handleCompanyAction: handleCompanyAction
    };

    consumePendingCompany();
    installCaptureHandler();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
