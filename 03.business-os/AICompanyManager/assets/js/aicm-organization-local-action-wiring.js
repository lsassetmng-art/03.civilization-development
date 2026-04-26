(function (global) {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var ORGANIZATION_ACTIONS = {
    "add-organization": true,
    "save-organization": true,
    "delete-organization": true
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

  function setPendingOrganization(organizationId) {
    if (organizationId) {
      sessionStorage.setItem("AICM_PENDING_ORGANIZATION_ID", organizationId);
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
    var orgAddDepartment = byId("org-add-department");
    var departmentSelect = byId("department-select");
    var company;

    if (orgAddDepartment && orgAddDepartment.value) return orgAddDepartment.value;
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

  function getCurrentOrganizationId() {
    var organizationSelect = byId("organization-select");
    var department;

    if (organizationSelect && organizationSelect.value) return organizationSelect.value;

    if (sessionStorage.getItem("AICM_PENDING_ORGANIZATION_ID")) {
      return sessionStorage.getItem("AICM_PENDING_ORGANIZATION_ID");
    }

    department = getCurrentDepartment();

    if (department && department.organizations && department.organizations[0]) {
      return department.organizations[0].id || department.organizations[0].organization_id || "";
    }

    return "";
  }

  function selectedValues(id) {
    var select = byId(id);
    var values = [];
    var i;

    if (!select) return values;

    for (i = 0; i < select.options.length; i += 1) {
      if (select.options[i].selected) {
        values.push(select.options[i].value);
      }
    }

    return values;
  }

  function robotAssignments(selectId, companyId, departmentId, organizationId) {
    return selectedValues(selectId).map(function (robotId) {
      return {
        company_id: companyId || "",
        department_id: departmentId || "",
        organization_id: organizationId || "",
        aiworker_robot_id: robotId,
        role_name: "Worker",
        display_name: "",
        assignment_status: "active"
      };
    });
  }

  function createRepository() {
    if (!global.AICM || !global.AICM.AicmLocalRepository) {
      return null;
    }

    return new global.AICM.AicmLocalRepository({
      storageKey: STORAGE_KEY
    });
  }

  function buildCreateOrganizationPayload() {
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();

    return {
      company_id: companyId,
      department_id: departmentId,
      parent_organization_id: "",
      organization_name: byId("new-org-name") ? byId("new-org-name").value : "新規組織",
      purpose: byId("new-org-purpose") ? byId("new-org-purpose").value : "",
      display_order: 100,
      robot_assignments: robotAssignments("new-org-robots", companyId, departmentId, "")
    };
  }

  function buildSaveOrganizationPayload() {
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();
    var organizationId = getCurrentOrganizationId();

    return {
      company_id: companyId,
      department_id: departmentId,
      organization_id: organizationId,
      parent_organization_id: "",
      organization_name: byId("edit-org-name") ? byId("edit-org-name").value : "",
      purpose: byId("edit-org-purpose") ? byId("edit-org-purpose").value : "",
      organization_status: "active",
      display_order: 100,
      robot_assignments: robotAssignments("edit-org-robots", companyId, departmentId, organizationId)
    };
  }

  function buildDeleteOrganizationPayload() {
    return {
      company_id: getCurrentCompanyId(),
      department_id: getCurrentDepartmentId(),
      organization_id: getCurrentOrganizationId()
    };
  }

  function isOrganizationAction(action) {
    return !!ORGANIZATION_ACTIONS[action];
  }

  function resultOrganizationId(result) {
    if (!result || !result.data) return "";

    if (result.data.organization && (result.data.organization.id || result.data.organization.organization_id)) {
      return result.data.organization.id || result.data.organization.organization_id;
    }

    return "";
  }

  function handleOrganizationAction(action) {
    var repository = createRepository();
    var payload;

    if (!repository) {
      return Promise.resolve({
        ok: false,
        error_code: "ORGANIZATION_WIRING_NOT_READY",
        error_message: "Organization wiring is not ready.",
        details: {},
        request_id: "organization_wiring_not_ready"
      });
    }

    setCurrentCompany(getCurrentCompanyId());
    setPendingDepartment(getCurrentDepartmentId());

    if (action === "add-organization") {
      payload = buildCreateOrganizationPayload();

      if (!payload.company_id || !payload.department_id) {
        return Promise.resolve({
          ok: false,
          error_code: "ORGANIZATION_ADD_REQUIRES_COMPANY_AND_DEPARTMENT",
          error_message: "Organization add requires company_id and department_id.",
          details: payload,
          request_id: "organization_add_guard"
        });
      }

      return repository.createOrganization(payload).then(function (result) {
        var organizationId = resultOrganizationId(result);
        if (organizationId) setPendingOrganization(organizationId);
        return result;
      });
    }

    if (action === "save-organization") {
      payload = buildSaveOrganizationPayload();

      return repository.saveOrganization(payload).then(function (result) {
        setPendingOrganization(getCurrentOrganizationId());
        return result;
      });
    }

    if (action === "delete-organization") {
      payload = buildDeleteOrganizationPayload();

      return repository.deleteOrganization(payload).then(function (result) {
        sessionStorage.removeItem("AICM_PENDING_ORGANIZATION_ID");
        return result;
      });
    }

    return Promise.resolve({
      ok: false,
      error_code: "ORGANIZATION_ACTION_NOT_SUPPORTED",
      error_message: "Organization action is not supported: " + action,
      details: { action: action },
      request_id: "organization_action_not_supported"
    });
  }

  function installMemoryHandlers() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-action]") : null;
      var action;
      var companySelect;
      var departmentSelect;
      var organizationSelect;

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

      if (action === "switch-organization") {
        organizationSelect = byId("organization-select");
        if (organizationSelect && organizationSelect.value) setPendingOrganization(organizationSelect.value);
      }
    }, true);

    document.addEventListener("change", function (event) {
      if (!event.target) return;

      if (event.target.id === "company-select" && event.target.value) {
        setCurrentCompany(event.target.value);
      }

      if ((event.target.id === "department-select" || event.target.id === "org-add-department") && event.target.value) {
        setPendingDepartment(event.target.value);
      }

      if (event.target.id === "organization-select" && event.target.value) {
        setPendingOrganization(event.target.value);
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
      if (!isOrganizationAction(action)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      handleOrganizationAction(action).then(function () {
        location.reload();
      });
    }, true);
  }

  function init() {
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();
    var organizationId = getCurrentOrganizationId();

    if (companyId) setCurrentCompany(companyId);
    if (departmentId) setPendingDepartment(departmentId);
    if (organizationId) setPendingOrganization(organizationId);

    global.AICM = global.AICM || {};
    global.AICM.organizationLocalActionWiring = {
      storageKey: STORAGE_KEY,
      organizationActionsOnly: true,
      realApiConnect: false,
      dbApply: false,
      rlsApply: false,
      isOrganizationAction: isOrganizationAction,
      handleOrganizationAction: handleOrganizationAction,
      getCurrentCompanyId: getCurrentCompanyId,
      getCurrentDepartmentId: getCurrentDepartmentId,
      getCurrentOrganizationId: getCurrentOrganizationId
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
