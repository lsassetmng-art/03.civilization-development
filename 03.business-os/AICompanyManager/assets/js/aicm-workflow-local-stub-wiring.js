(function (global) {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var LAST_WORKFLOW_KEY = "AICM_LAST_WORKFLOW_RUN";

  var WORKFLOW_ACTIONS = {
    "start-workflow": true,
    "start-ai-workflow": true,
    "run-workflow": true
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

    if (button && button.getAttribute && button.getAttribute("data-ledger-id")) {
      return button.getAttribute("data-ledger-id");
    }

    if (editId && editId.value) return editId.value;

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

  function isWorkflowAction(action) {
    return !!WORKFLOW_ACTIONS[action];
  }

  function localWorkflowRun(payload) {
    var run = {
      ai_workflow_run_id: "wf-local-" + Date.now().toString(36),
      company_id: payload.company_id || "",
      department_id: payload.department_id || "",
      ledger_row_id: payload.ledger_row_id || "",
      workflow_status: "queued",
      mode: "local_stub",
      live_aiworkeros_call: false,
      real_api_connect: false,
      db_apply: false,
      rls_apply: false,
      created_at: new Date().toISOString()
    };

    sessionStorage.setItem(LAST_WORKFLOW_KEY, JSON.stringify(run));

    return {
      ok: true,
      data: {
        ai_workflow_run: run
      },
      warnings: [
        "local_stub_only",
        "live_aiworkeros_call_not_executed",
        "real_api_connect_not_executed"
      ],
      request_id: "workflow_local_" + Date.now().toString(36)
    };
  }

  function handleWorkflowAction(action, button) {
    var repository = createRepository();
    var payload = {
      company_id: getCurrentCompanyId(),
      department_id: getCurrentDepartmentId(),
      ledger_row_id: getCurrentLedgerRowId(button)
    };

    setCurrentCompany(payload.company_id);
    setPendingDepartment(payload.department_id);
    setPendingLedgerRow(payload.ledger_row_id);

    if (!isWorkflowAction(action)) {
      return Promise.resolve({
        ok: false,
        error_code: "WORKFLOW_ACTION_NOT_SUPPORTED",
        error_message: "Workflow action is not supported: " + action,
        details: { action: action },
        request_id: "workflow_action_not_supported"
      });
    }

    if (!payload.company_id || !payload.department_id) {
      return Promise.resolve({
        ok: false,
        error_code: "WORKFLOW_REQUIRES_COMPANY_AND_DEPARTMENT",
        error_message: "Workflow start requires company_id and department_id.",
        details: payload,
        request_id: "workflow_guard"
      });
    }

    if (repository && repository.startWorkflow) {
      return repository.startWorkflow(payload).then(function (result) {
        var finalResult = result && result.ok ? result : localWorkflowRun(payload);

        if (finalResult && finalResult.data && finalResult.data.ai_workflow_run) {
          finalResult.data.ai_workflow_run.mode = "local_stub";
          finalResult.data.ai_workflow_run.live_aiworkeros_call = false;
          finalResult.data.ai_workflow_run.real_api_connect = false;
          finalResult.data.ai_workflow_run.db_apply = false;
          finalResult.data.ai_workflow_run.rls_apply = false;
          sessionStorage.setItem(LAST_WORKFLOW_KEY, JSON.stringify(finalResult.data.ai_workflow_run));
        }

        return finalResult;
      });
    }

    return Promise.resolve(localWorkflowRun(payload));
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
      if (!isWorkflowAction(action)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      handleWorkflowAction(action, button).then(function (result) {
        if (result && result.ok === false) {
          alert(result.error_message || "ワークフロー開始に失敗しました。");
          return;
        }

        alert("AI自動処理をローカルスタブで開始しました。実AIWorkerOS呼び出しは未実行です。");
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
    global.AICM.workflowLocalStubWiring = {
      storageKey: STORAGE_KEY,
      workflowActionsOnly: true,
      workflowLocalStubOnly: true,
      realApiConnect: false,
      liveAiworkerosCall: false,
      dbApply: false,
      rlsApply: false,
      isWorkflowAction: isWorkflowAction,
      handleWorkflowAction: handleWorkflowAction,
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
