(function (global) {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var LEDGER_ACTIONS = {
    "add-ledger-row": true,
    "save-ledger-row": true,
    "delete-ledger-row": true
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function fieldValue(ids, fallback) {
    var i;
    var el;

    for (i = 0; i < ids.length; i += 1) {
      el = byId(ids[i]);
      if (el && el.value !== undefined && String(el.value).length > 0) {
        return el.value;
      }
    }

    return fallback || "";
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

  function setPendingDepartment(departmentId) {
    if (departmentId) {
      sessionStorage.setItem("AICM_PENDING_DEPARTMENT_ID", departmentId);
    }
  }

  function setPendingLedgerRow(ledgerRowId) {
    if (ledgerRowId) {
      sessionStorage.setItem("AICM_PENDING_LEDGER_ROW_ID", ledgerRowId);
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

  function getCurrentCompany() {
    var state = getState();
    var companyId = getCurrentCompanyId();

    return (state.companies || []).find(function (company) {
      return company.id === companyId || company.company_id === companyId;
    }) || null;
  }

  function getCurrentDepartmentId() {
    var departmentSelect = byId("department-select");
    var company;

    if (departmentSelect && departmentSelect.value) return departmentSelect.value;

    if (sessionStorage.getItem("AICM_PENDING_DEPARTMENT_ID")) {
      return sessionStorage.getItem("AICM_PENDING_DEPARTMENT_ID");
    }

    company = getCurrentCompany();

    if (company && company.departments && company.departments[0]) {
      return company.departments[0].id || company.departments[0].department_id || "";
    }

    return "";
  }

  function getCurrentDepartment() {
    var company = getCurrentCompany();
    var departmentId = getCurrentDepartmentId();

    if (!company) return null;

    return (company.departments || []).find(function (department) {
      return department.id === departmentId || department.department_id === departmentId;
    }) || null;
  }

  function getCurrentLedgerRowId(button) {
    var editId = byId("edit-ledger-id");
    var department;

    if (editId && editId.value) return editId.value;

    if (button && button.getAttribute && button.getAttribute("data-ledger-id")) {
      return button.getAttribute("data-ledger-id");
    }

    if (sessionStorage.getItem("AICM_PENDING_LEDGER_ROW_ID")) {
      return sessionStorage.getItem("AICM_PENDING_LEDGER_ROW_ID");
    }

    department = getCurrentDepartment();

    if (department && department.task_ledger && department.task_ledger[0]) {
      return department.task_ledger[0].id || department.task_ledger[0].ledger_row_id || "";
    }

    return "";
  }

  function createRepository() {
    if (!global.AICM || !global.AICM.AicmLocalRepository) {
      return null;
    }

    return new global.AICM.AicmLocalRepository({
      storageKey: STORAGE_KEY
    });
  }

  function buildAddLedgerPayload() {
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();

    return {
      company_id: companyId,
      department_id: departmentId,
      ledger_row: {
        ledger_row_id: null,
        deliverable_name: fieldValue(["add-deliverable", "new-deliverable", "ledger-deliverable"], ""),
        task_name: fieldValue(["add-task", "new-task", "ledger-task"], ""),
        work_type: fieldValue(["add-work-type", "new-work-type", "ledger-work-type"], "設計"),
        task_status: fieldValue(["add-status", "new-status", "ledger-status"], "未着手"),
        priority: fieldValue(["add-priority", "new-priority", "ledger-priority"], "中"),
        due_date: fieldValue(["add-due-date", "new-due-date", "ledger-due-date"], ""),
        reference_files: fieldValue(["add-reference", "new-reference", "ledger-reference"], ""),
        supplemental_materials: fieldValue(["add-supplemental", "new-supplemental", "ledger-supplemental"], ""),
        note: fieldValue(["add-note", "new-note", "ledger-note"], ""),
        source_type: "manual"
      }
    };
  }

  function buildSaveLedgerPayload(button) {
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();
    var ledgerRowId = getCurrentLedgerRowId(button);

    return {
      company_id: companyId,
      department_id: departmentId,
      ledger_row: {
        ledger_row_id: ledgerRowId || null,
        deliverable_name: fieldValue(["edit-deliverable", "add-deliverable", "ledger-deliverable"], ""),
        task_name: fieldValue(["edit-task", "add-task", "ledger-task"], ""),
        work_type: fieldValue(["edit-work-type", "add-work-type", "ledger-work-type"], "設計"),
        task_status: fieldValue(["edit-status", "add-status", "ledger-status"], "未着手"),
        priority: fieldValue(["edit-priority", "add-priority", "ledger-priority"], "中"),
        due_date: fieldValue(["edit-due-date", "add-due-date", "ledger-due-date"], ""),
        reference_files: fieldValue(["edit-reference", "add-reference", "ledger-reference"], ""),
        supplemental_materials: fieldValue(["edit-supplemental", "add-supplemental", "ledger-supplemental"], ""),
        note: fieldValue(["edit-note", "add-note", "ledger-note"], ""),
        source_type: "manual"
      }
    };
  }

  function buildDeleteLedgerPayload(button) {
    return {
      company_id: getCurrentCompanyId(),
      department_id: getCurrentDepartmentId(),
      ledger_row_id: getCurrentLedgerRowId(button)
    };
  }

  function isLedgerAction(action) {
    return !!LEDGER_ACTIONS[action];
  }

  function resultLedgerRowId(result) {
    if (!result || !result.data) return "";

    if (result.data.ledger_row && (result.data.ledger_row.id || result.data.ledger_row.ledger_row_id)) {
      return result.data.ledger_row.id || result.data.ledger_row.ledger_row_id;
    }

    if (result.data.ledger_row_id) {
      return result.data.ledger_row_id;
    }

    return "";
  }

  function handleLedgerAction(action, button) {
    var repository = createRepository();
    var payload;

    if (!repository) {
      return Promise.resolve({
        ok: false,
        error_code: "LEDGER_WIRING_NOT_READY",
        error_message: "Ledger wiring is not ready.",
        details: {},
        request_id: "ledger_wiring_not_ready"
      });
    }

    setCurrentCompany(getCurrentCompanyId());
    setPendingDepartment(getCurrentDepartmentId());

    if (action === "add-ledger-row") {
      payload = buildAddLedgerPayload();

      if (!payload.company_id || !payload.department_id) {
        return Promise.resolve({
          ok: false,
          error_code: "LEDGER_ADD_REQUIRES_COMPANY_AND_DEPARTMENT",
          error_message: "Ledger add requires company_id and department_id.",
          details: payload,
          request_id: "ledger_add_guard"
        });
      }

      return repository.saveLedgerRow(payload).then(function (result) {
        var ledgerRowId = resultLedgerRowId(result);
        if (ledgerRowId) setPendingLedgerRow(ledgerRowId);
        return result;
      });
    }

    if (action === "save-ledger-row") {
      payload = buildSaveLedgerPayload(button);

      return repository.saveLedgerRow(payload).then(function (result) {
        var ledgerRowId = resultLedgerRowId(result) || payload.ledger_row.ledger_row_id;
        if (ledgerRowId) setPendingLedgerRow(ledgerRowId);
        return result;
      });
    }

    if (action === "delete-ledger-row") {
      payload = buildDeleteLedgerPayload(button);

      return repository.deleteLedgerRow(payload).then(function (result) {
        sessionStorage.removeItem("AICM_PENDING_LEDGER_ROW_ID");
        return result;
      });
    }

    return Promise.resolve({
      ok: false,
      error_code: "LEDGER_ACTION_NOT_SUPPORTED",
      error_message: "Ledger action is not supported: " + action,
      details: { action: action },
      request_id: "ledger_action_not_supported"
    });
  }

  function installMemoryHandlers() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-action]") : null;
      var action;
      var companySelect;
      var departmentSelect;

      if (!button) return;

      action = button.getAttribute("data-action");

      if (action === "switch-company") {
        companySelect = byId("company-select");
        if (companySelect && companySelect.value) setCurrentCompany(companySelect.value);
      }

      if (action === "switch-department") {
        departmentSelect = byId("department-select");
        if (departmentSelect && departmentSelect.value) setPendingDepartment(departmentSelect.value);
      }

      if (action === "load-ledger-edit" && button.getAttribute("data-ledger-id")) {
        setPendingLedgerRow(button.getAttribute("data-ledger-id"));
      }
    }, true);

    document.addEventListener("change", function (event) {
      if (!event.target) return;

      if (event.target.id === "company-select" && event.target.value) {
        setCurrentCompany(event.target.value);
      }

      if (event.target.id === "department-select" && event.target.value) {
        setPendingDepartment(event.target.value);
      }

      if (event.target.id === "edit-ledger-id" && event.target.value) {
        setPendingLedgerRow(event.target.value);
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
      if (!isLedgerAction(action)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      handleLedgerAction(action, button).then(function (result) {
        if (result && result.ok === false) {
          alert(result.error_message || "台帳操作に失敗しました。");
          return;
        }
        location.reload();
      });
    }, true);
  }

  function init() {
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();
    var ledgerRowId = getCurrentLedgerRowId(null);

    if (companyId) setCurrentCompany(companyId);
    if (departmentId) setPendingDepartment(departmentId);
    if (ledgerRowId) setPendingLedgerRow(ledgerRowId);

    global.AICM = global.AICM || {};
    global.AICM.ledgerLocalActionWiring = {
      storageKey: STORAGE_KEY,
      ledgerActionsOnly: true,
      realApiConnect: false,
      dbApply: false,
      rlsApply: false,
      isLedgerAction: isLedgerAction,
      handleLedgerAction: handleLedgerAction,
      getCurrentCompanyId: getCurrentCompanyId,
      getCurrentDepartmentId: getCurrentDepartmentId,
      getCurrentLedgerRowId: getCurrentLedgerRowId
    };

    installMemoryHandlers();
    installCaptureHandler();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
