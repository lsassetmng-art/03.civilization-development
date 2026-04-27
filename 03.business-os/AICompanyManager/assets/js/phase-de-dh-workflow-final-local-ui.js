/* ============================================================
 * AICompanyManager Phase DE-DH Workflow Final Local Bundle
 * generated_at: 20260427_080044
 * real_api_connect: false
 * live_aiworkeros_call: false
 * db_apply: false
 * company_wiring: true
 * department_wiring: true
 * organization_wiring: true
 * ledger_wiring: true
 * csv_wiring: true
 * review_wiring: true
 * workflow_local_stub_wiring: true
 * storage_key: AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE
 * ============================================================ */

/* ============================================================
 * AICompanyManager Phase DA-DD Review Local Wiring Bundle
 * generated_at: 20260427_080027
 * real_api_connect: false
 * db_apply: false
 * company_wiring: true
 * department_wiring: true
 * organization_wiring: true
 * ledger_wiring: true
 * csv_wiring: true
 * review_actions_only: true
 * workflow_wiring: false
 * storage_key: AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE
 * ============================================================ */

/* ============================================================
 * AICompanyManager Phase CW-CZ CSV Local Wiring Bundle
 * generated_at: 20260427_075844
 * real_api_connect: false
 * db_apply: false
 * company_wiring: true
 * department_wiring: true
 * organization_wiring: true
 * ledger_wiring: true
 * csv_actions_only: true
 * review_wiring: false
 * storage_key: AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE
 * ============================================================ */

/* ============================================================
 * AICompanyManager Phase CS-CV Ledger Local Wiring Bundle
 * generated_at: 20260427_075716
 * real_api_connect: false
 * db_apply: false
 * company_wiring: true
 * department_wiring: true
 * organization_wiring: true
 * ledger_actions_only: true
 * csv_wiring: false
 * review_wiring: false
 * storage_key: AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE
 * ============================================================ */

/* ============================================================
 * AICompanyManager Phase CO-CR Organization Local Wiring Bundle
 * generated_at: 20260427_075541
 * real_api_connect: false
 * db_apply: false
 * company_wiring: true
 * department_wiring: true
 * organization_actions_only: true
 * ledger_wiring: false
 * csv_wiring: false
 * review_wiring: false
 * storage_key: AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE
 * ============================================================ */

/* ============================================================
 * AICompanyManager Phase CK-CN Department Local Wiring Bundle
 * generated_at: 20260427_075416
 * real_api_connect: false
 * db_apply: false
 * company_wiring: true
 * department_actions_only: true
 * organization_wiring: false
 * storage_key: AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE
 * ============================================================ */

/* ============================================================
 * AICompanyManager Phase CG-CJ Company Local Wiring Bundle
 * generated_at: 20260427_073703
 * real_api_connect: false
 * db_apply: false
 * company_actions_only: true
 * department_wiring: false
 * storage_key: AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE
 * ============================================================ */

/* ============================================================
 * AICompanyManager Phase CC-CF Local Wiring Pilot Bundle
 * generated_at: 20260427_073437
 * real_api_connect: false
 * accepted_handleAction_replacement: false
 * ============================================================ */

/* ============================================================
 * AICompanyManager Phase BY-CB Action Handlers Ready Bundle
 * generated_at: 20260427_071629
 * real_api_connect: false
 * accepted_handleAction_replacement: false
 * ============================================================ */

/* ============================================================
 * AICompanyManager Phase BU-BX Action Adapter Ready Bundle
 * generated_at: 20260427_070917
 * real_api_connect: false
 * db_apply: false
 * ============================================================ */

/* ============================================================
 * AICompanyManager Phase BQ-BT Repository Ready Bundle
 * generated_at: 20260427_070708
 * real_api_connect: false
 * db_apply: false
 * ============================================================ */

(function (global) {
  "use strict";

  function createRequestId() {
    return "aicm_req_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  }

  function AicmApiClient(options) {
    this.options = options || {};
    this.baseUrl = this.options.baseUrl || "";
    this.allowNetwork = this.options.allowNetwork === true;
  }

  AicmApiClient.prototype.request = function request(method, path, body) {
    var requestId = createRequestId();

    if (!this.allowNetwork) {
      return Promise.resolve({
        ok: false,
        error_code: "API_NETWORK_DISABLED",
        error_message: "API network calls are disabled in this phase.",
        details: {
          method: method,
          path: path,
          body: body || null
        },
        request_id: requestId
      });
    }

    return fetch(this.baseUrl + path, {
      method: method,
      headers: {
        "content-type": "application/json",
        "x-aicm-request-id": requestId
      },
      body: body == null ? undefined : JSON.stringify(body)
    }).then(function (response) {
      return response.json();
    }).catch(function (error) {
      return {
        ok: false,
        error_code: "API_CLIENT_ERROR",
        error_message: String(error && error.message ? error.message : error),
        details: {},
        request_id: requestId
      };
    });
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmApiClient = AicmApiClient;
})(window);

(function (global) {
  "use strict";

  function clone(value) {
    return JSON.parse(JSON.stringify(value == null ? null : value));
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function fileStringToMetadata(companyId, departmentId, ledgerRowId, value, role) {
    return String(value || "")
      .split("|")
      .map(function (x) { return x.trim(); })
      .filter(Boolean)
      .map(function (name) {
        return {
          company_id: companyId,
          department_id: departmentId,
          ledger_row_id: ledgerRowId,
          file_role: role,
          file_name: name,
          storage_scope: "metadata_only",
          storage_ref: null,
          note: ""
        };
      });
  }

  function metadataToFileString(files, role) {
    return ensureArray(files)
      .filter(function (f) { return f.file_role === role; })
      .map(function (f) { return f.file_name; })
      .join("|");
  }

  function normalizeUiState(state) {
    var next = clone(state || {});
    next.companies = ensureArray(next.companies);
    next.aiworkers = ensureArray(next.aiworkers);

    next.companies.forEach(function (company) {
      company.company_common_rules = ensureArray(company.company_common_rules);
      company.departments = ensureArray(company.departments);
      company.departments.forEach(function (department) {
        department.organizations = ensureArray(department.organizations);
        department.task_ledger = ensureArray(department.task_ledger);
        department.review_items = ensureArray(department.review_items);
        department.organizations.forEach(function (organization) {
          organization.robot_ids = ensureArray(organization.robot_ids);
        });
      });
    });

    return next;
  }

  function bootstrapToUiState(payload) {
    var data = payload && payload.data ? payload.data : payload;
    var state = {
      companies: ensureArray(data && data.companies),
      aiworkers: ensureArray(data && data.aiworkers_reference)
    };
    return normalizeUiState(state);
  }

  function ledgerRowToSavePayload(companyId, departmentId, row) {
    return {
      company_id: companyId,
      department_id: departmentId,
      ledger_row: {
        ledger_row_id: row.ledger_row_id || row.id || null,
        deliverable_name: row.deliverable_name || "",
        task_name: row.task_name || "",
        work_type: row.work_type || "",
        task_status: row.task_status || row.status || "未着手",
        priority: row.priority || "中",
        due_date: row.due_date || null,
        reference_files: fileStringToMetadata(companyId, departmentId, row.ledger_row_id || row.id || null, row.reference_files, "reference_file"),
        supplemental_materials: fileStringToMetadata(companyId, departmentId, row.ledger_row_id || row.id || null, row.supplemental_materials, "supplemental_material"),
        note: row.note || "",
        source_type: row.source_type || "manual"
      }
    };
  }

  function dbLedgerRowToUi(row, files) {
    var metadata = ensureArray(files);
    return {
      id: row.ledger_row_id,
      ledger_row_id: row.ledger_row_id,
      deliverable_name: row.deliverable_name,
      task_name: row.task_name,
      work_type: row.work_type,
      status: row.task_status,
      task_status: row.task_status,
      priority: row.priority,
      due_date: row.due_date || "",
      reference_files: metadataToFileString(metadata, "reference_file"),
      supplemental_materials: metadataToFileString(metadata, "supplemental_material"),
      note: row.note || ""
    };
  }

  global.AICM = global.AICM || {};
  global.AICM.AicmStateAdapter = {
    normalizeUiState: normalizeUiState,
    bootstrapToUiState: bootstrapToUiState,
    ledgerRowToSavePayload: ledgerRowToSavePayload,
    dbLedgerRowToUi: dbLedgerRowToUi,
    fileStringToMetadata: fileStringToMetadata,
    metadataToFileString: metadataToFileString
  };
})(window);

(function (global) {
  "use strict";

  function notImplemented(methodName) {
    return function () {
      return Promise.resolve({
        ok: false,
        error_code: "AICM_REPOSITORY_NOT_IMPLEMENTED",
        error_message: methodName + " is not implemented.",
        details: {},
        request_id: "local_not_implemented"
      });
    };
  }

  function AicmRepository() {}

  AicmRepository.prototype.loadBootstrap = notImplemented("loadBootstrap");
  AicmRepository.prototype.createCompany = notImplemented("createCompany");
  AicmRepository.prototype.saveCompany = notImplemented("saveCompany");
  AicmRepository.prototype.deleteCompany = notImplemented("deleteCompany");
  AicmRepository.prototype.saveCompanyRules = notImplemented("saveCompanyRules");
  AicmRepository.prototype.createDepartment = notImplemented("createDepartment");
  AicmRepository.prototype.saveDepartment = notImplemented("saveDepartment");
  AicmRepository.prototype.deleteDepartment = notImplemented("deleteDepartment");
  AicmRepository.prototype.createOrganization = notImplemented("createOrganization");
  AicmRepository.prototype.saveOrganization = notImplemented("saveOrganization");
  AicmRepository.prototype.deleteOrganization = notImplemented("deleteOrganization");
  AicmRepository.prototype.saveLedgerRow = notImplemented("saveLedgerRow");
  AicmRepository.prototype.deleteLedgerRow = notImplemented("deleteLedgerRow");
  AicmRepository.prototype.previewCsv = notImplemented("previewCsv");
  AicmRepository.prototype.importCsv = notImplemented("importCsv");
  AicmRepository.prototype.listReviews = notImplemented("listReviews");
  AicmRepository.prototype.approveReview = notImplemented("approveReview");
  AicmRepository.prototype.rejectReview = notImplemented("rejectReview");
  AicmRepository.prototype.requestReviewRevision = notImplemented("requestReviewRevision");
  AicmRepository.prototype.startWorkflow = notImplemented("startWorkflow");

  global.AICM = global.AICM || {};
  global.AICM.AicmRepository = AicmRepository;
})(window);

(function (global) {
  "use strict";

  var DEFAULT_STORAGE_KEY = "AICM_PHASE_AO_ADD_ONLY_SPLIT_STATE";

  function makeId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function ok(data) {
    return Promise.resolve({
      ok: true,
      data: data || {},
      warnings: [],
      request_id: "local_" + Date.now().toString(36)
    });
  }

  function fail(code, message, details) {
    return Promise.resolve({
      ok: false,
      error_code: code,
      error_message: message,
      details: details || {},
      request_id: "local_" + Date.now().toString(36)
    });
  }

  function defaultState() {
    return {
      aiworkers: [],
      companies: []
    };
  }

  function AicmLocalRepository(options) {
    this.options = options || {};
    this.storageKey = this.options.storageKey || DEFAULT_STORAGE_KEY;
    this.adapter = global.AICM && global.AICM.AicmStateAdapter;
  }

  AicmLocalRepository.prototype.loadState = function loadState() {
    try {
      var raw = localStorage.getItem(this.storageKey);
      var state = raw ? JSON.parse(raw) : defaultState();
      if (this.adapter && this.adapter.normalizeUiState) {
        return this.adapter.normalizeUiState(state);
      }
      return state;
    } catch (error) {
      return defaultState();
    }
  };

  AicmLocalRepository.prototype.saveState = function saveState(state) {
    var next = this.adapter && this.adapter.normalizeUiState ? this.adapter.normalizeUiState(state) : state;
    localStorage.setItem(this.storageKey, JSON.stringify(next));
    return next;
  };

  AicmLocalRepository.prototype.loadBootstrap = function loadBootstrap() {
    return ok({
      state: this.loadState()
    });
  };

  AicmLocalRepository.prototype.createCompany = function createCompany(input) {
    var state = this.loadState();
    var company = {
      id: makeId("company"),
      company_id: null,
      name: input.company_name || input.name || "新規AI企業",
      company_name: input.company_name || input.name || "新規AI企業",
      business_domain: input.business_domain || "",
      company_common_rules: [],
      departments: []
    };
    state.companies.push(company);
    this.saveState(state);
    return ok({ company: company, state: state });
  };

  AicmLocalRepository.prototype.saveCompany = function saveCompany(input) {
    var state = this.loadState();
    var companyId = input.company_id || input.id;
    var found = null;

    state.companies.forEach(function (company) {
      if (company.id === companyId || company.company_id === companyId) {
        found = company;
      }
    });

    if (!found) return fail("COMPANY_NOT_FOUND", "Company not found.", input);

    found.name = input.company_name || input.name || found.name;
    found.company_name = found.name;
    found.business_domain = input.business_domain || found.business_domain || "";

    this.saveState(state);
    return ok({ company: found, state: state });
  };

  AicmLocalRepository.prototype.deleteCompany = function deleteCompany(input) {
    var state = this.loadState();
    var companyId = input.company_id || input.id;
    state.companies = state.companies.filter(function (company) {
      return company.id !== companyId && company.company_id !== companyId;
    });
    this.saveState(state);
    return ok({ company_id: companyId, state: state });
  };

  AicmLocalRepository.prototype.saveCompanyRules = function saveCompanyRules(input) {
    var state = this.loadState();
    var companyId = input.company_id || input.id;
    var files = input.files || [];
    var found = null;

    state.companies.forEach(function (company) {
      if (company.id === companyId || company.company_id === companyId) {
        found = company;
      }
    });

    if (!found) return fail("COMPANY_NOT_FOUND", "Company not found.", input);

    found.company_common_rules = found.company_common_rules || [];
    files.forEach(function (file) {
      found.company_common_rules.push({
        name: file.file_name || file.name || "",
        file_name: file.file_name || file.name || "",
        size: file.file_size_bytes || file.size || 0
      });
    });

    this.saveState(state);
    return ok({ rule_files: found.company_common_rules, state: state });
  };

  AicmLocalRepository.prototype.createDepartment = function createDepartment(input) {
    var state = this.loadState();
    var companyId = input.company_id;
    var company = state.companies.find(function (c) { return c.id === companyId || c.company_id === companyId; });
    if (!company) return fail("COMPANY_NOT_FOUND", "Company not found.", input);

    var department = {
      id: makeId("dept"),
      department_id: null,
      name: input.department_name || input.name || "新規部門",
      department_name: input.department_name || input.name || "新規部門",
      purpose: input.purpose || "",
      organizations: [],
      task_ledger: [],
      review_items: []
    };

    company.departments.push(department);
    this.saveState(state);
    return ok({ department: department, state: state });
  };

  AicmLocalRepository.prototype.saveDepartment = function saveDepartment(input) {
    var state = this.loadState();
    var company = state.companies.find(function (c) { return c.id === input.company_id || c.company_id === input.company_id; });
    if (!company) return fail("COMPANY_NOT_FOUND", "Company not found.", input);

    var department = company.departments.find(function (d) { return d.id === input.department_id || d.department_id === input.department_id; });
    if (!department) return fail("DEPARTMENT_NOT_FOUND", "Department not found.", input);

    department.name = input.department_name || input.name || department.name;
    department.department_name = department.name;
    department.purpose = input.purpose || department.purpose || "";

    this.saveState(state);
    return ok({ department: department, state: state });
  };

  AicmLocalRepository.prototype.deleteDepartment = function deleteDepartment(input) {
    var state = this.loadState();
    var company = state.companies.find(function (c) { return c.id === input.company_id || c.company_id === input.company_id; });
    if (!company) return fail("COMPANY_NOT_FOUND", "Company not found.", input);

    company.departments = company.departments.filter(function (d) {
      return d.id !== input.department_id && d.department_id !== input.department_id;
    });

    this.saveState(state);
    return ok({ department_id: input.department_id, state: state });
  };

  AicmLocalRepository.prototype.createOrganization = function createOrganization(input) {
    var state = this.loadState();
    var company = state.companies.find(function (c) { return c.id === input.company_id || c.company_id === input.company_id; });
    if (!company) return fail("COMPANY_NOT_FOUND", "Company not found.", input);

    var department = company.departments.find(function (d) { return d.id === input.department_id || d.department_id === input.department_id; });
    if (!department) return fail("DEPARTMENT_NOT_FOUND", "Department not found.", input);

    var organization = {
      id: makeId("org"),
      organization_id: null,
      name: input.organization_name || input.name || "新規組織",
      organization_name: input.organization_name || input.name || "新規組織",
      parent_id: input.parent_organization_id || "",
      parent_organization_id: input.parent_organization_id || "",
      purpose: input.purpose || "",
      robot_ids: (input.robot_assignments || []).map(function (r) { return r.aiworker_robot_id; })
    };

    department.organizations.push(organization);
    this.saveState(state);
    return ok({ organization: organization, state: state });
  };

  AicmLocalRepository.prototype.saveOrganization = function saveOrganization(input) {
    var state = this.loadState();
    var company = state.companies.find(function (c) { return c.id === input.company_id || c.company_id === input.company_id; });
    if (!company) return fail("COMPANY_NOT_FOUND", "Company not found.", input);

    var found = null;
    company.departments.forEach(function (department) {
      department.organizations.forEach(function (organization) {
        if (organization.id === input.organization_id || organization.organization_id === input.organization_id) {
          found = organization;
        }
      });
    });

    if (!found) return fail("ORGANIZATION_NOT_FOUND", "Organization not found.", input);

    found.name = input.organization_name || input.name || found.name;
    found.organization_name = found.name;
    found.purpose = input.purpose || found.purpose || "";
    found.robot_ids = (input.robot_assignments || []).map(function (r) { return r.aiworker_robot_id; });

    this.saveState(state);
    return ok({ organization: found, state: state });
  };

  AicmLocalRepository.prototype.deleteOrganization = function deleteOrganization(input) {
    var state = this.loadState();
    var company = state.companies.find(function (c) { return c.id === input.company_id || c.company_id === input.company_id; });
    if (!company) return fail("COMPANY_NOT_FOUND", "Company not found.", input);

    company.departments.forEach(function (department) {
      department.organizations = department.organizations.filter(function (organization) {
        return organization.id !== input.organization_id && organization.organization_id !== input.organization_id;
      });
    });

    this.saveState(state);
    return ok({ organization_id: input.organization_id, state: state });
  };

  AicmLocalRepository.prototype.saveLedgerRow = function saveLedgerRow(input) {
    var state = this.loadState();
    var company = state.companies.find(function (c) { return c.id === input.company_id || c.company_id === input.company_id; });
    if (!company) return fail("COMPANY_NOT_FOUND", "Company not found.", input);

    var department = company.departments.find(function (d) { return d.id === input.department_id || d.department_id === input.department_id; });
    if (!department) return fail("DEPARTMENT_NOT_FOUND", "Department not found.", input);

    var rowInput = input.ledger_row || input;
    var rowId = rowInput.ledger_row_id || rowInput.id || makeId("tl");
    var row = department.task_ledger.find(function (r) { return r.id === rowId || r.ledger_row_id === rowId; });

    if (!row) {
      row = { id: rowId, ledger_row_id: rowId };
      department.task_ledger.push(row);
    }

    row.deliverable_name = rowInput.deliverable_name || "";
    row.task_name = rowInput.task_name || "";
    row.work_type = rowInput.work_type || "";
    row.status = rowInput.task_status || rowInput.status || "未着手";
    row.task_status = row.status;
    row.priority = rowInput.priority || "中";
    row.due_date = rowInput.due_date || "";
    row.reference_files = rowInput.reference_files || "";
    row.supplemental_materials = rowInput.supplemental_materials || "";
    row.note = rowInput.note || "";

    this.saveState(state);
    return ok({ ledger_row: row, state: state });
  };

  AicmLocalRepository.prototype.deleteLedgerRow = function deleteLedgerRow(input) {
    var state = this.loadState();
    state.companies.forEach(function (company) {
      company.departments.forEach(function (department) {
        department.task_ledger = department.task_ledger.filter(function (row) {
          return row.id !== input.ledger_row_id && row.ledger_row_id !== input.ledger_row_id;
        });
      });
    });
    this.saveState(state);
    return ok({ ledger_row_id: input.ledger_row_id, state: state });
  };

  AicmLocalRepository.prototype.previewCsv = function previewCsv(input) {
    return ok({
      csv_import_batch: {
        csv_import_batch_id: makeId("csv"),
        original_file_name: input.original_file_name || "",
        import_status: "previewed"
      },
      rows: []
    });
  };

  AicmLocalRepository.prototype.importCsv = function importCsv(input) {
    return ok({
      csv_import_batch_id: input.csv_import_batch_id,
      imported_ledger_rows: [],
      invalid_rows: []
    });
  };

  AicmLocalRepository.prototype.listReviews = function listReviews() {
    var state = this.loadState();
    var items = [];
    state.companies.forEach(function (company) {
      company.departments.forEach(function (department) {
        department.review_items.forEach(function (review) {
          items.push(review);
        });
      });
    });
    return ok({ review_items: items });
  };

  AicmLocalRepository.prototype.approveReview = function approveReview(input) {
    return this.updateReviewStatus(input.review_item_id, "承認済み");
  };

  AicmLocalRepository.prototype.rejectReview = function rejectReview(input) {
    return this.updateReviewStatus(input.review_item_id, "差し戻し");
  };

  AicmLocalRepository.prototype.requestReviewRevision = function requestReviewRevision(input) {
    return this.updateReviewStatus(input.review_item_id, "修正待ち");
  };

  AicmLocalRepository.prototype.updateReviewStatus = function updateReviewStatus(reviewItemId, status) {
    var state = this.loadState();
    var found = null;
    state.companies.forEach(function (company) {
      company.departments.forEach(function (department) {
        department.review_items.forEach(function (review) {
          if (review.id === reviewItemId || review.review_item_id === reviewItemId) {
            review.status = status;
            review.review_status = status;
            found = review;
          }
        });
      });
    });
    this.saveState(state);
    return ok({ review_item: found, state: state });
  };

  AicmLocalRepository.prototype.startWorkflow = function startWorkflow(input) {
    return ok({
      ai_workflow_run: {
        ai_workflow_run_id: makeId("wf"),
        company_id: input.company_id,
        department_id: input.department_id,
        ledger_row_id: input.ledger_row_id,
        workflow_status: "queued"
      }
    });
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmLocalRepository = AicmLocalRepository;
})(window);

(function (global) {
  "use strict";

  function disabled(methodName, endpoint, input) {
    return Promise.resolve({
      ok: false,
      error_code: "AICM_API_STUB_DISABLED",
      error_message: "Real API calls are disabled. " + methodName + " is a stub only.",
      details: {
        endpoint: endpoint,
        input: input || null
      },
      request_id: "api_stub_" + Date.now().toString(36)
    });
  }

  function AicmApiRepositoryStub(apiClient) {
    this.apiClient = apiClient || null;
  }

  AicmApiRepositoryStub.prototype.loadBootstrap = function (input) { return disabled("loadBootstrap", "GET /api/aicm/bootstrap", input); };
  AicmApiRepositoryStub.prototype.createCompany = function (input) { return disabled("createCompany", "POST /api/aicm/company/create", input); };
  AicmApiRepositoryStub.prototype.saveCompany = function (input) { return disabled("saveCompany", "POST /api/aicm/company/save", input); };
  AicmApiRepositoryStub.prototype.deleteCompany = function (input) { return disabled("deleteCompany", "POST /api/aicm/company/delete", input); };
  AicmApiRepositoryStub.prototype.saveCompanyRules = function (input) { return disabled("saveCompanyRules", "POST /api/aicm/company/rules/save", input); };
  AicmApiRepositoryStub.prototype.createDepartment = function (input) { return disabled("createDepartment", "POST /api/aicm/department/create", input); };
  AicmApiRepositoryStub.prototype.saveDepartment = function (input) { return disabled("saveDepartment", "POST /api/aicm/department/save", input); };
  AicmApiRepositoryStub.prototype.deleteDepartment = function (input) { return disabled("deleteDepartment", "POST /api/aicm/department/delete", input); };
  AicmApiRepositoryStub.prototype.createOrganization = function (input) { return disabled("createOrganization", "POST /api/aicm/organization/create", input); };
  AicmApiRepositoryStub.prototype.saveOrganization = function (input) { return disabled("saveOrganization", "POST /api/aicm/organization/save", input); };
  AicmApiRepositoryStub.prototype.deleteOrganization = function (input) { return disabled("deleteOrganization", "POST /api/aicm/organization/delete", input); };
  AicmApiRepositoryStub.prototype.saveLedgerRow = function (input) { return disabled("saveLedgerRow", "POST /api/aicm/task-ledger/save", input); };
  AicmApiRepositoryStub.prototype.deleteLedgerRow = function (input) { return disabled("deleteLedgerRow", "POST /api/aicm/task-ledger/delete", input); };
  AicmApiRepositoryStub.prototype.previewCsv = function (input) { return disabled("previewCsv", "POST /api/aicm/csv/preview", input); };
  AicmApiRepositoryStub.prototype.importCsv = function (input) { return disabled("importCsv", "POST /api/aicm/csv/import", input); };
  AicmApiRepositoryStub.prototype.listReviews = function (input) { return disabled("listReviews", "GET /api/aicm/review/list", input); };
  AicmApiRepositoryStub.prototype.approveReview = function (input) { return disabled("approveReview", "POST /api/aicm/review/approve", input); };
  AicmApiRepositoryStub.prototype.rejectReview = function (input) { return disabled("rejectReview", "POST /api/aicm/review/reject", input); };
  AicmApiRepositoryStub.prototype.requestReviewRevision = function (input) { return disabled("requestReviewRevision", "POST /api/aicm/review/request-revision", input); };
  AicmApiRepositoryStub.prototype.startWorkflow = function (input) { return disabled("startWorkflow", "POST /api/aicm/workflow/start", input); };

  global.AICM = global.AICM || {};
  global.AICM.AicmApiRepositoryStub = AicmApiRepositoryStub;
})(window);

/* ============================================================
 * Accepted UI starts below
 * ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var CSV_ROWS = [];

  var app = {
    screen: "dashboard",
    companyId: "company-001",
    departmentId: "dept-dev",
    organizationId: "org-dev",
    editCompanyId: "",
    editLedgerId: ""
  };

  var csvPrompt = [
    "以下の条件で、AICompanyManagerにアップロードする部門別タスク台帳CSVを作成してください。",
    "",
    "CSVヘッダー:",
    "deliverable_name,task_name,work_type,status,priority,due_date,reference_files,supplemental_materials,note",
    "",
    "入力ルール:",
    "- deliverable_name は成果物名",
    "- task_name は具体的な作業名",
    "- work_type は 設計 / 実装 / デザイン / 修正 / 調査 / レビュー / 資料作成 / 納品準備 / 引き継ぎ のいずれか",
    "- status は 未着手 / 進行中 / レビュー中 / 完了 / 保留 のいずれか",
    "- priority は 高 / 中 / 低 のいずれか",
    "- due_date は YYYY-MM-DD 形式。未定なら空欄",
    "- reference_files は作業前・作業中に読む資料。複数ある場合は | で区切る",
    "- supplemental_materials は補足資料。複数ある場合は | で区切る",
    "- note は短い補足だけ",
    "",
    "出力条件:",
    "- CSVのみ出力",
    "- 説明文は付けない",
    "- Markdownコードブロックに入れない"
  ].join("\n");

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function makeId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function baseData() {
    return {
      aiworkers: [
        { id: "aiw-manager-001", name: "Manager Alpha", role: "Manager", organization_id: "org-dev" },
        { id: "aiw-leader-001", name: "Leader Alpha", role: "Leader", organization_id: "org-dev" },
        { id: "aiw-worker-001", name: "Worker Alpha", role: "Worker", organization_id: "org-dev" },
        { id: "aiw-worker-002", name: "Worker Beta", role: "Worker", organization_id: "org-dev" },
        { id: "aiw-leader-002", name: "Design Leader", role: "Leader", organization_id: "org-design" },
        { id: "aiw-worker-003", name: "Design Worker", role: "Worker", organization_id: "org-design" }
      ],
      companies: [
        {
          id: "company-001",
          name: "AI Company Alpha",
          business_domain: "業務設計・制作・開発支援",
          company_common_rules: [],
          departments: [
            {
              id: "dept-dev",
              name: "開発部",
              purpose: "設計・実装・テスト",
              organizations: [
                { id: "org-dev", name: "開発第1組織", parent_id: "", purpose: "BusinessOS開発", robot_ids: ["aiw-manager-001", "aiw-leader-001", "aiw-worker-001", "aiw-worker-002"] }
              ],
              task_ledger: [
                {
                  id: "tl-001",
                  deliverable_name: "AICompanyManager",
                  task_name: "AICompanyManager画面構成整理",
                  work_type: "設計",
                  status: "未着手",
                  priority: "高",
                  due_date: "",
                  reference_files: "AICompanyManager統合設計.md|会社共通ルール",
                  supplemental_materials: "画面レビュー結果",
                  note: "設定/追加/詳細/編集を別画面化"
                }
              ],
              review_items: [
                { id: "rev-001", title: "AICompanyManager画面構成整理レビュー", status: "承認待ち", target: "AICompanyManager", note: "Phase AN確認" }
              ]
            },
            {
              id: "dept-design",
              name: "デザイン部",
              purpose: "デザイン制作・資料作成",
              organizations: [
                { id: "org-design", name: "デザイン第1組織", parent_id: "", purpose: "デザイン制作", robot_ids: ["aiw-leader-002", "aiw-worker-003"] }
              ],
              task_ledger: [],
              review_items: []
            }
          ]
        }
      ]
    };
  }

  function normalize(data) {
    var i;
    var j;
    var c;
    var d;

    if (!data || !data.companies) return baseData();
    if (!data.aiworkers) data.aiworkers = [];

    for (i = 0; i < data.companies.length; i += 1) {
      c = data.companies[i];
      if (!c.company_common_rules) c.company_common_rules = [];
      if (!c.departments) c.departments = [];
      for (j = 0; j < c.departments.length; j += 1) {
        d = c.departments[j];
        if (!d.organizations) d.organizations = [];
        if (!d.task_ledger) d.task_ledger = [];
        if (!d.review_items) d.review_items = [];
      }
    }

    return data;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (error) {
      return baseData();
    }
    return baseData();
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(data)));
  }

  function currentCompany(data) {
    var i;
    for (i = 0; i < data.companies.length; i += 1) {
      if (data.companies[i].id === app.companyId) return data.companies[i];
    }
    return data.companies[0] || null;
  }

  function currentDepartment(company) {
    var i;
    if (!company || !company.departments || !company.departments.length) return null;
    for (i = 0; i < company.departments.length; i += 1) {
      if (company.departments[i].id === app.departmentId) return company.departments[i];
    }
    return company.departments[0];
  }

  function currentOrganization(company) {
    var all = allOrganizations(company);
    var i;
    for (i = 0; i < all.length; i += 1) {
      if (all[i].org.id === app.organizationId) return all[i];
    }
    return all[0] || null;
  }

  function findCompany(data, id) {
    var i;
    for (i = 0; i < data.companies.length; i += 1) {
      if (data.companies[i].id === id) return data.companies[i];
    }
    return null;
  }

  function findDepartment(company, id) {
    var i;
    if (!company) return null;
    for (i = 0; i < company.departments.length; i += 1) {
      if (company.departments[i].id === id) return company.departments[i];
    }
    return null;
  }

  function findOrgInCompany(company, orgId) {
    var i;
    var j;
    if (!company) return null;
    for (i = 0; i < company.departments.length; i += 1) {
      for (j = 0; j < company.departments[i].organizations.length; j += 1) {
        if (company.departments[i].organizations[j].id === orgId) {
          return { dept: company.departments[i], org: company.departments[i].organizations[j] };
        }
      }
    }
    return null;
  }

  function findLedgerRow(dept, id) {
    var i;
    if (!dept) return null;
    for (i = 0; i < dept.task_ledger.length; i += 1) {
      if (dept.task_ledger[i].id === id) return dept.task_ledger[i];
    }
    return null;
  }

  function allOrganizations(company) {
    var rows = [];
    if (!company) return rows;
    company.departments.forEach(function (d) {
      d.organizations.forEach(function (o) {
        rows.push({ dept: d, org: o });
      });
    });
    return rows;
  }

  function robotLabels(data, ids) {
    var labels = [];
    data.aiworkers.forEach(function (w) {
      if (ids.indexOf(w.id) >= 0) labels.push(w.name + "@" + w.role);
    });
    return labels;
  }

  function selectedValues(id) {
    var select = document.getElementById(id);
    var values = [];
    var i;
    if (!select) return values;
    for (i = 0; i < select.options.length; i += 1) {
      if (select.options[i].selected) values.push(select.options[i].value);
    }
    return values;
  }

  function companyOptions(data) {
    return data.companies.map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (c.id === app.companyId ? " selected" : "") + '>' + esc(c.name) + '</option>';
    }).join("");
  }

  function departmentOptions(company, selected) {
    var selectedId = selected || app.departmentId;
    if (!company || !company.departments.length) return '<option value="">部門なし</option>';
    return company.departments.map(function (d) {
      return '<option value="' + esc(d.id) + '"' + (d.id === selectedId ? " selected" : "") + '>' + esc(d.name) + '</option>';
    }).join("");
  }

  function organizationOptions(company, selected) {
    var rows = allOrganizations(company);
    var selectedId = selected || app.organizationId;
    if (!rows.length) return '<option value="">組織なし</option>';
    return rows.map(function (r) {
      return '<option value="' + esc(r.org.id) + '"' + (r.org.id === selectedId ? " selected" : "") + '>' + esc(r.dept.name + " / " + r.org.name) + '</option>';
    }).join("");
  }

  function aiworkerOptions(data, selectedIds) {
    return data.aiworkers.map(function (w) {
      return '<option value="' + esc(w.id) + '"' + (selectedIds.indexOf(w.id) >= 0 ? " selected" : "") + '>' + esc(w.name + "@" + w.role) + '</option>';
    }).join("");
  }

  function tab(label, screen) {
    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
  }

  function shell(body) {
    return [
      '<main class="aicm-shell">',
      '<header>',
      '<h1 class="aicm-title">AI企業運営アプリ</h1>',
      '</header>',
      '<nav class="aicm-tabs">',
      tab("AI企業ダッシュボード", "dashboard"),
      tab("部門別タスク台帳", "task-ledger"),
      tab("レビュー・承認待ち一覧", "review"),
      '</nav>',
      body,
      '</main>'
    ].join("");
  }

  function field(label, id, value) {
    return '<div class="aicm-field"><label>' + esc(label) + '</label><input id="' + esc(id) + '" value="' + esc(value || "") + '"></div>';
  }

  function textArea(label, id, value) {
    return '<div class="aicm-field"><label>' + esc(label) + '</label><textarea id="' + esc(id) + '">' + esc(value || "") + '</textarea></div>';
  }

  function selectField(label, id, values, selected) {
    return '<div class="aicm-field"><label>' + esc(label) + '</label><select id="' + esc(id) + '">' + values.map(function (v) {
      return '<option value="' + esc(v) + '"' + (v === selected ? " selected" : "") + '>' + esc(v) + '</option>';
    }).join("") + '</select></div>';
  }

  /* AICM_DIRECT_SOURCE_REPAIR_HELPERS_BEGIN */
  function aicmSeedBusinessRobots() {
    return [
      { id: "aiw-president-001", name: "President候補ロボット", role: "President", robot_kind: "ai_robot", assignment_policy: "unlimited_system_use", assignable_company_president: true },
      { id: "aiw-manager-001", name: "Manager Alpha", role: "Manager", robot_kind: "ai_robot", assignment_policy: "unlimited_system_use" },
      { id: "aiw-leader-001", name: "Leader Alpha", role: "Leader", robot_kind: "ai_robot", assignment_policy: "unlimited_system_use" },
      { id: "aiw-worker-001", name: "Worker Alpha", role: "Worker", robot_kind: "ai_robot", assignment_policy: "unlimited_system_use" },
      { id: "aiw-worker-002", name: "Worker Beta", role: "Worker", robot_kind: "ai_robot", assignment_policy: "unlimited_system_use" },
      { id: "aiw-reviewer-001", name: "Reviewer Alpha", role: "Reviewer", robot_kind: "ai_robot", assignment_policy: "unlimited_system_use" }
    ];
  }

  function aicmRobotId(robot) {
    return robot.aiworker_robot_id || robot.robot_id || robot.id || "";
  }

  function aicmRobotName(robot) {
    return robot.display_name || robot.robot_name || robot.name || aicmRobotId(robot);
  }

  function aicmRobotRole(robot) {
    return robot.aicm_role || robot.role || robot.worker_role || "";
  }

  function aicmEnsureBusinessRobots(data) {
    var robots;
    var seeds;
    var existingIds;

    if (!data) return [];
    if (!data.aiworkers) data.aiworkers = [];

    robots = data.aiworkers;
    seeds = aicmSeedBusinessRobots();
    existingIds = {};

    robots.forEach(function (robot) {
      existingIds[aicmRobotId(robot)] = true;
      if (!robot.assignment_policy) robot.assignment_policy = "unlimited_system_use";
    });

    seeds.forEach(function (seed) {
      if (!existingIds[seed.id]) robots.push(seed);
    });

    return robots.filter(function (robot) {
      return robot && aicmRobotId(robot) && (robot.robot_kind === "ai_robot" || !robot.robot_kind);
    });
  }

  function aicmFindBusinessRobot(data, robotId) {
    var robots = aicmEnsureBusinessRobots(data);
    var i;

    for (i = 0; i < robots.length; i += 1) {
      if (aicmRobotId(robots[i]) === robotId) return robots[i];
    }

    return null;
  }

  function aicmBusinessRobotOptions(data, selectedIds, mode) {
    var robots = aicmEnsureBusinessRobots(data);
    var selected = selectedIds || [];
    var rows = [];

    if (!Array.isArray(selected)) selected = selected ? [selected] : [];

    robots.forEach(function (robot) {
      var id = aicmRobotId(robot);
      var role = aicmRobotRole(robot);
      var isPresident = role === "President" || robot.assignable_company_president === true;

      if (mode === "president" && !isPresident) return;
      if (mode === "organization" && isPresident) return;

      rows.push(
        '<option value="' + esc(id) + '"' +
        (selected.indexOf(id) >= 0 ? " selected" : "") +
        '>' + esc(aicmRobotName(robot) + " / " + role + " / システム用: 無制限割当") + '</option>'
      );
    });

    if (!rows.length) {
      rows.push('<option value="">Business側ロボットプールにAi(ロボット)なし</option>');
    }

    return rows.join("");
  }

  function aicmRobotLabels(data, ids) {
    var values = ids || [];
    if (!Array.isArray(values)) values = values ? [values] : [];

    return values.map(function (id) {
      var robot = aicmFindBusinessRobot(data, id);
      return robot ? aicmRobotName(robot) + "@" + aicmRobotRole(robot) : id;
    });
  }

  function aicmPresidentRobotSummary(data, company) {
    var robot;

    if (!company || !company.president_robot_id) {
      return '<p class="aicm-muted">Presidentロボット未設定</p>';
    }

    robot = aicmFindBusinessRobot(data, company.president_robot_id);

    return '<p><strong>' + esc(robot ? aicmRobotName(robot) : company.president_robot_id) + '</strong></p>' +
      '<p class="aicm-muted">役割: President / Business側ロボットプール: ' + esc(company.president_robot_id) + ' / システム用: 無制限割当</p>';
  }

  function aicmPresidentPolicySummary(company) {
    if (!company || !company.company_business_policy_instruction_to_president) {
      return '<p class="aicm-muted">Presidentへの会社事業方針指示は未登録</p>';
    }

    return '<p>' + esc(company.company_business_policy_instruction_to_president) + '</p>';
  }
  /* AICM_DIRECT_SOURCE_REPAIR_HELPERS_END */



  function renderDashboard(data, company) {
    var totalTasks = 0;
    var totalReview = 0;
    var totalDone = 0;
    var orgRows = allOrganizations(company);

    aicmEnsureBusinessRobots(data);

    if (company) {
      company.departments.forEach(function (d) {
        totalTasks += d.task_ledger.length;
        totalReview += d.review_items.length;
        d.task_ledger.forEach(function (r) {
          if (r.status === "完了") totalDone += 1;
        });
      });
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="dashboard">',
      '<div class="aicm-card"><h2>AI企業選択</h2>',
      '<div class="aicm-field"><label>AI企業</label><select id="company-select">' + companyOptions(data) + '</select></div>',
      '<button class="primary" data-action="switch-company">AI企業を表示</button>',
      '</div>',
      '<div class="aicm-card"><h2>会社概要</h2>',
      company ? '<p><strong>' + esc(company.name) + '</strong></p><p class="aicm-muted">' + esc(company.business_domain) + '</p><p>会社共通ルール: ' + company.company_common_rules.length + '件</p>' : '<p class="aicm-muted">会社なし</p>',
      '<div class="aicm-card-footer">',
      '<button class="primary" data-screen="settings">AI企業設定</button>',
      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
      '</div>',
      '</div>',
      '<div class="aicm-card"><h2>全体状況</h2>',
      '<p>部門数: ' + (company ? company.departments.length : 0) + '</p>',
      '<p>組織数: ' + orgRows.length + '</p>',
      '<p>台帳行: ' + totalTasks + '</p>',
      '<p>完了: ' + totalDone + '</p>',
      '<p>レビュー・承認待ち: ' + totalReview + '</p>',
      '</div>',
      '<div class="aicm-card"><h2>部門一覧</h2>',
      company && company.departments.length ? company.departments.map(function (d) {
        return '<div class="aicm-row"><strong>' + esc(d.name) + '</strong><p class="aicm-muted">' + esc(d.purpose) + '</p><p>組織: ' + d.organizations.length + ' / 台帳: ' + d.task_ledger.length + '</p></div>';
      }).join("") : '<p class="aicm-muted">部門なし。新規追加から作成してください。</p>',
      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
      '</div>',
      '<div class="aicm-card"><h2>組織一覧</h2>',
      orgRows.length ? orgRows.map(function (r) {
        return '<div class="aicm-row"><strong>' + esc(r.org.name) + '</strong><p class="aicm-muted">' + esc(r.dept.name + " / " + r.org.purpose) + '</p><p>ロボット: ' + esc(aicmRobotLabels(data, r.org.robot_ids).join(" / ")) + '</p></div>';
      }).join("") : '<p class="aicm-muted">組織なし。先に部門を作成し、その後に組織を追加してください。</p>',
      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderCompanyAdd() {
    return shell([
      '<section class="aicm-grid" data-screen-scope="company-add">',
      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
      '<div class="aicm-card">',
      field("会社名", "new-company-name", "新規AI企業"),
      field("事業領域", "new-company-domain", "業務支援"),
      '<button class="primary" data-action="add-company">AI企業を追加</button>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderSettings(data, company) {
    var editing = app.editCompanyId ? findCompany(data, app.editCompanyId) : company;

    aicmEnsureBusinessRobots(data);

    return shell([
      '<section class="aicm-grid" data-screen-scope="settings">',
      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理、Presidentロボット設定、会社事業方針指示を行います。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
      '<div class="aicm-card"><h2>会社 変更・削除</h2>',
      '<div class="aicm-field"><label>変更対象</label><select id="edit-company-select">' + companyOptions(data) + '</select></div>',
      '<button data-action="load-company-edit">読み込み</button>',
      field("会社名", "edit-company-name", editing ? editing.name : ""),
      field("事業領域", "edit-company-domain", editing ? editing.business_domain : ""),
      '<button class="primary" data-action="save-company">会社を変更</button> ',
      '<button class="danger" data-action="delete-company">会社を削除</button>',
      '</div>',
      '<div class="aicm-card"><h2>Presidentロボット</h2>',
      '<p class="aicm-muted">会社単位のPresidentはAI企業設定で設定します。Business側ロボットプールから選択します。AICompanyManagerはシステム用のため数量消費せず無制限割当です。</p>',
      '<div class="aicm-field"><label>Presidentロボット</label><select id="company-president-robot">' + aicmBusinessRobotOptions(data, editing && editing.president_robot_id ? [editing.president_robot_id] : [], "president") + '</select></div>',
      '<button class="primary" data-action="save-company-president">Presidentを設定</button>',
      aicmPresidentRobotSummary(data, editing),
      '</div>',
      '<div class="aicm-card"><h2>会社事業方針をPresidentへ指示</h2>',
      '<p class="aicm-muted">会社の事業方針をPresidentロボットへ指示します。local UI状態へ保存します。</p>',
      textArea("事業方針", "company-president-policy", editing ? editing.company_business_policy_instruction_to_president : ""),
      '<button class="primary" data-action="instruct-company-president-policy">Presidentへ指示</button>',
      aicmPresidentPolicySummary(editing),
      '</div>',
      '<div class="aicm-card"><h2>会社共通ルール</h2>',
      '<div class="aicm-field"><label>会社共通ルールファイル</label><input id="common-rule-files" type="file" multiple></div>',
      '<button class="primary" data-action="add-common-rules">会社共通ルールを追加</button>',
      company && company.company_common_rules.length ? company.company_common_rules.map(function (f) {
        return '<span class="aicm-badge">' + esc(f.name) + '</span>';
      }).join("") : '<p class="aicm-muted">未登録</p>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderDepartmentDetail(company) {
    var dept = currentDepartment(company);

    return shell([
      '<section class="aicm-grid" data-screen-scope="department-detail">',
      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
      '<div class="aicm-card"><h2>部門選択</h2>',
      '<div class="aicm-field"><label>部門</label><select id="department-select">' + departmentOptions(company) + '</select></div>',
      '<button class="primary" data-action="switch-department">部門を表示</button>',
      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
      '</div>',
      '<div class="aicm-card aicm-wide"><h2>現在の部門</h2>',
      dept ? '<p><strong>' + esc(dept.name) + '</strong></p><p class="aicm-muted">' + esc(dept.purpose) + '</p><p>組織数: ' + dept.organizations.length + '</p><p>台帳行: ' + dept.task_ledger.length + '</p>' : '<p class="aicm-muted">部門がありません。新規追加を押して作成してください。</p>',
      '</div>',
      dept ? '<div class="aicm-card"><h2>部門変更・削除</h2>' +
        field("部門名", "edit-department-name", dept.name) +
        field("目的", "edit-department-purpose", dept.purpose) +
        '<div class="aicm-card-footer"><button class="primary" data-action="save-department">部門を変更</button><button class="danger" data-action="delete-department">部門を削除</button></div>' +
        '</div>' : '',
      '</section>'
    ].join(""));
  }
  function renderDepartmentAdd() {
    return shell([
      '<section class="aicm-grid" data-screen-scope="department-add">',
      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      field("部門名", "new-department-name", "新規部門"),
      field("目的", "new-department-purpose", "部門目的"),
      '<button class="primary" data-action="add-department">部門を追加</button>',
      '</div></section>'
    ].join(""));
  }

  function renderDepartmentEdit(company) {
    var dept = currentDepartment(company);
    if (!dept) {
      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="department-edit">',
      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      '<div class="aicm-field"><label>変更対象部門</label><select id="department-select">' + departmentOptions(company) + '</select></div>',
      '<button data-action="switch-department">読み込み</button>',
      field("部門名", "edit-department-name", dept.name),
      field("目的", "edit-department-purpose", dept.purpose),
      '<button class="primary" data-action="save-department">部門を変更</button>',
      '</div></section>'
    ].join(""));
  }

  function renderDepartmentDelete(company) {
    var dept = currentDepartment(company);
    return shell([
      '<section class="aicm-grid" data-screen-scope="department-delete">',
      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      dept ? '<p>削除対象: <strong>' + esc(dept.name) + '</strong></p><button class="danger" data-action="delete-department">部門を削除</button>' : '<p class="aicm-muted">削除できる部門がありません。</p>',
      '</div></section>'
    ].join(""));
  }

  function renderOrganizationDetail(data, company) {
    var current = currentOrganization(company);
    var org = current ? current.org : null;

    aicmEnsureBusinessRobots(data);

    return shell([
      '<section class="aicm-grid" data-screen-scope="organization-detail">',
      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。ロボットはBusiness側ロボットプールから選択します。システム用のため数量消費はしません。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
      '<div class="aicm-card"><h2>組織選択</h2>',
      '<div class="aicm-field"><label>組織</label><select id="organization-select">' + organizationOptions(company) + '</select></div>',
      '<button class="primary" data-action="switch-organization">組織を表示</button>',
      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
      '</div>',
      '<div class="aicm-card aicm-wide"><h2>現在の組織</h2>',
      current ? '<p><strong>' + esc(org.name) + '</strong></p><p class="aicm-muted">' + esc(current.dept.name + " / " + org.purpose) + '</p><p>ロボット: ' + esc(aicmRobotLabels(data, org.robot_ids).join(" / ")) + '</p>' : '<p class="aicm-muted">組織がありません。先に部門を作成し、その後に新規追加を押してください。</p>',
      '</div>',
      current ? '<div class="aicm-card"><h2>組織変更・削除</h2>' +
        field("組織名", "edit-org-name", org.name) +
        field("目的", "edit-org-purpose", org.purpose) +
        '<div class="aicm-field"><label>ロボット配置</label><select id="edit-org-robots" multiple size="6">' + aicmBusinessRobotOptions(data, org.robot_ids, "organization") + '</select><p class="aicm-muted">Business側ロボットプールから選択します。AICompanyManagerはシステム用のため無制限割当です。</p></div>' +
        '<div class="aicm-card-footer"><button class="primary" data-action="save-organization">組織を変更</button><button class="danger" data-action="delete-organization">組織を削除</button></div>' +
        '</div>' : '',
      '</section>'
    ].join(""));
  }

  function renderOrganizationAdd(data, company) {
    aicmEnsureBusinessRobots(data);

    if (!company || !company.departments.length) {
      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="organization-add">',
      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。ロボットはBusiness側ロボットプールから選択します。数量消費はしません。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      '<div class="aicm-field"><label>所属部門</label><select id="org-add-department">' + departmentOptions(company) + '</select></div>',
      field("組織名", "new-org-name", "新規組織"),
      field("目的", "new-org-purpose", "組織目的"),
      '<div class="aicm-field"><label>ロボット配置</label><select id="new-org-robots" multiple size="6">' + aicmBusinessRobotOptions(data, [], "organization") + '</select><p class="aicm-muted">Business側ロボットプールから選択します。システム用のため無制限割当です。</p></div>',
      '<button class="primary" data-action="add-organization">組織を追加</button>',
      '</div></section>'
    ].join(""));
  }

  function renderOrganizationEdit(data, company) {
    var current = currentOrganization(company);
    var org = current ? current.org : null;

    aicmEnsureBusinessRobots(data);

    if (!org) {
      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="organization-edit">',
      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      '<div class="aicm-field"><label>変更対象組織</label><select id="organization-select">' + organizationOptions(company) + '</select></div>',
      '<button data-action="switch-organization">読み込み</button>',
      field("組織名", "edit-org-name", org.name),
      field("目的", "edit-org-purpose", org.purpose),
      '<div class="aicm-field"><label>ロボット配置</label><select id="edit-org-robots" multiple size="6">' + aicmBusinessRobotOptions(data, org.robot_ids, "organization") + '</select><p class="aicm-muted">Business側ロボットプールから選択します。数量消費なし・無制限割当です。</p></div>',
      '<button class="primary" data-action="save-organization">組織を変更</button>',
      '</div></section>'
    ].join(""));
  }

  function renderOrganizationDelete(company) {
    var current = currentOrganization(company);
    return shell([
      '<section class="aicm-grid" data-screen-scope="organization-delete">',
      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      current ? '<p>削除対象: <strong>' + esc(current.org.name) + '</strong></p><p class="aicm-muted">' + esc(current.dept.name) + '</p><button class="danger" data-action="delete-organization">組織を削除</button>' : '<p class="aicm-muted">削除できる組織がありません。</p>',
      '</div></section>'
    ].join(""));
  }

  function renderTaskLedger(company) {
    var dept = currentDepartment(company);

    if (!dept) {
      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="task-ledger">',
      '<div class="aicm-card"><h2>部門選択</h2>',
      '<div class="aicm-field"><label>部門</label><select id="department-select">' + departmentOptions(company) + '</select></div>',
      '<button data-action="switch-department">部門を表示</button>',
      '</div>',
      '<div class="aicm-card"><h2>台帳 追加</h2>',
      field("成果物名", "add-deliverable", "窓口業務システム"),
      field("タスク名", "add-task", "窓口業務システム設計"),
      selectField("仕事種別", "add-work-type", ["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"], "設計"),
      selectField("状態", "add-status", ["未着手", "進行中", "レビュー中", "完了", "保留"], "未着手"),
      selectField("優先度", "add-priority", ["高", "中", "低"], "中"),
      field("期限", "add-due-date", ""),
      field("参照ファイル", "add-reference", ""),
      field("補足資料", "add-supplemental", ""),
      textArea("補足メモ", "add-note", ""),
      '<button class="primary" data-action="add-ledger-row">台帳行を追加</button>',
      '</div>',
      '<div class="aicm-card"><h2>台帳 変更・削除</h2>',
      '<div class="aicm-field"><label>台帳行</label><select id="edit-ledger-select">' + ledgerOptions(dept) + '</select></div>',
      '<button data-action="load-ledger-edit">読み込み</button>',
      '<div id="ledger-edit-form">' + renderLedgerEditForm(dept) + '</div>',
      '</div>',
      '<div class="aicm-card aicm-wide"><h2>台帳一覧</h2>',
      renderLedgerTable(dept),
      '</div>',
      '<div class="aicm-card"><h2>CSV操作</h2>',
      '<div class="aicm-field"><label>CSVファイル</label><input id="csv-file" type="file" accept=".csv,text/csv"></div>',
      '<button class="primary" data-action="preview-csv">プレビュー</button> ',
      '<button class="primary" data-action="import-csv">取り込み</button>',
      '<div id="csv-preview"><p class="aicm-muted">未プレビュー</p></div>',
      '</div>',
      '<div class="aicm-card"><h2>作成テンプレ</h2>',
      '<button class="primary" data-action="copy-csv-prompt">CSV作成プロンプトをコピー</button>',
      '<p id="copy-result" class="aicm-muted"></p>',
      '<textarea class="aicm-output" readonly>' + esc(csvPrompt) + '</textarea>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function ledgerOptions(dept) {
    if (!dept || !dept.task_ledger.length) return '<option value="">台帳行なし</option>';
    return dept.task_ledger.map(function (r) {
      return '<option value="' + esc(r.id) + '"' + (r.id === app.editLedgerId ? " selected" : "") + '>' + esc(r.deliverable_name + " / " + r.task_name) + '</option>';
    }).join("");
  }

  function renderLedgerEditForm(dept) {
    var row = app.editLedgerId ? findLedgerRow(dept, app.editLedgerId) : dept.task_ledger[0];
    if (!row) return '<p class="aicm-muted">変更する台帳行を選んでください。</p>';

    return [
      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
      field("成果物名", "edit-deliverable", row.deliverable_name),
      field("タスク名", "edit-task", row.task_name),
      selectField("仕事種別", "edit-work-type", ["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"], row.work_type),
      selectField("状態", "edit-status", ["未着手", "進行中", "レビュー中", "完了", "保留"], row.status),
      selectField("優先度", "edit-priority", ["高", "中", "低"], row.priority),
      field("期限", "edit-due-date", row.due_date),
      field("参照ファイル", "edit-reference", row.reference_files),
      field("補足資料", "edit-supplemental", row.supplemental_materials),
      textArea("補足メモ", "edit-note", row.note),
      '<button class="primary" data-action="save-ledger-row">台帳を変更</button> ',
      '<button class="danger" data-action="delete-ledger-row">台帳を削除</button>'
    ].join("");
  }

  function renderLedgerTable(dept) {
    if (!dept || !dept.task_ledger.length) return '<p class="aicm-muted">台帳行なし</p>';
    return [
      '<table class="aicm-table">',
      '<thead><tr><th>成果物名</th><th>タスク名</th><th>仕事種別</th><th>状態</th><th>優先度</th><th>参照ファイル</th><th>補足資料</th></tr></thead>',
      '<tbody>',
      dept.task_ledger.map(function (r) {
        return '<tr><td>' + esc(r.deliverable_name) + '</td><td>' + esc(r.task_name) + '</td><td>' + esc(r.work_type) + '</td><td>' + esc(r.status) + '</td><td>' + esc(r.priority) + '</td><td>' + esc(r.reference_files) + '</td><td>' + esc(r.supplemental_materials) + '</td></tr>';
      }).join(""),
      '</tbody></table>'
    ].join("");
  }

  function renderReview(company) {
    var items = [];
    if (company) {
      company.departments.forEach(function (d) {
        d.review_items.forEach(function (r) {
          items.push({ department: d.name, item: r });
        });
      });
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="review">',
      '<div class="aicm-card"><h2>レビュー・承認待ち一覧</h2>',
      '<p class="aicm-muted">AI自動レビュー後の納品候補を人間が最終確認します。</p>',
      items.length ? items.map(function (x) {
        return '<div class="aicm-row warn"><strong>' + esc(x.item.title) + '</strong><p class="aicm-muted">' + esc(x.department + " / " + x.item.status + " / " + x.item.target) + '</p><p>' + esc(x.item.note) + '</p><button class="ok" data-action="approve-review" data-review-id="' + esc(x.item.id) + '">承認</button> <button class="danger" data-action="reject-review" data-review-id="' + esc(x.item.id) + '">差し戻し</button></div>';
      }).join("") : '<p class="aicm-muted">承認待ちはありません。</p>',
      '</div>',
      '<div class="aicm-card"><h2>自動処理ステータス</h2>',
      '<p>Manager分解: 自動</p>',
      '<p>Leader割当: 自動</p>',
      '<p>Worker成果物作成: 自動</p>',
      '<p>AI自動レビュー: 自動</p>',
      '<p>人間操作: 最終承認のみ</p>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function render() {
    var data = load();
    var company = currentCompany(data);
    var html;

    if (app.screen === "dashboard") html = renderDashboard(data, company);
    else if (app.screen === "company-add") html = renderCompanyAdd();
    else if (app.screen === "settings") html = renderSettings(data, company);
    else if (app.screen === "department-detail") html = renderDepartmentDetail(company);
    else if (app.screen === "department-add") html = renderDepartmentAdd();
    else if (app.screen === "department-edit") html = renderDepartmentEdit(company);
    else if (app.screen === "department-delete") html = renderDepartmentDelete(company);
    else if (app.screen === "organization-detail") html = renderOrganizationDetail(data, company);
    else if (app.screen === "organization-add") html = renderOrganizationAdd(data, company);
    else if (app.screen === "organization-edit") html = renderOrganizationEdit(data, company);
    else if (app.screen === "organization-delete") html = renderOrganizationDelete(company);
    else if (app.screen === "task-ledger") html = renderTaskLedger(company);
    else if (app.screen === "review") html = renderReview(company);
    else html = renderDashboard(data, company);

    document.getElementById("aicm-root").innerHTML = html;
    bind();
  }

  function bind() {
    document.querySelectorAll("[data-screen]").forEach(function (button) {
      button.onclick = function () {
        app.screen = button.getAttribute("data-screen");
        render();
      };
    });

    document.querySelectorAll("[data-action]").forEach(function (button) {
      button.onclick = function () {
        handleAction(button.getAttribute("data-action"), button);
      };
    });
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }

  function handleAction(action, button) {
    var data = load();
    var company = currentCompany(data);
    var dept = currentDepartment(company);
    var orgInfo;

    if (action === "save-company-president") {
      if (company) {
        aicmEnsureBusinessRobots(data);
        company.president_robot_id = val("company-president-robot");
        save(data);
      }
      app.screen = "settings";
      render();
      return;
    }

    if (action === "instruct-company-president-policy") {
      if (company) {
        company.company_business_policy_instruction_to_president = val("company-president-policy");
        save(data);
      }
      app.screen = "settings";
      render();
      return;
    }

    if (action === "switch-company") {
      app.companyId = val("company-select");
      company = currentCompany(data);
      app.departmentId = company && company.departments[0] ? company.departments[0].id : "";
      app.organizationId = company && company.departments[0] && company.departments[0].organizations[0] ? company.departments[0].organizations[0].id : "";
      render();
      return;
    }

    if (action === "add-company") {
      var newCompany = {
        id: makeId("company"),
        name: val("new-company-name"),
        business_domain: val("new-company-domain"),
        company_common_rules: [],
        departments: []
      };
      data.companies.push(newCompany);
      app.companyId = newCompany.id;
      app.departmentId = "";
      app.organizationId = "";
      save(data);
      app.screen = "dashboard";
      render();
      return;
    }

    if (action === "load-company-edit") {
      app.editCompanyId = val("edit-company-select");
      render();
      return;
    }

    if (action === "save-company") {
      var editCompany = findCompany(data, val("edit-company-select"));
      if (editCompany) {
        editCompany.name = val("edit-company-name");
        editCompany.business_domain = val("edit-company-domain");
      }
      save(data);
      render();
      return;
    }

    if (action === "delete-company") {
      if (data.companies.length > 1) {
        data.companies = data.companies.filter(function (c) { return c.id !== val("edit-company-select"); });
        app.companyId = data.companies[0].id;
        app.departmentId = data.companies[0].departments[0] ? data.companies[0].departments[0].id : "";
      }
      save(data);
      app.screen = "dashboard";
      render();
      return;
    }

    if (action === "add-common-rules") {
      var files = document.getElementById("common-rule-files").files || [];
      Array.prototype.forEach.call(files, function (f) {
        company.company_common_rules.push({ name: f.name, size: f.size });
      });
      save(data);
      render();
      return;
    }

    if (action === "switch-department") {
      app.departmentId = val("department-select");
      render();
      return;
    }

    if (action === "add-department") {
      var newDept = {
        id: makeId("dept"),
        name: val("new-department-name"),
        purpose: val("new-department-purpose"),
        organizations: [],
        task_ledger: [],
        review_items: []
      };
      company.departments.push(newDept);
      app.departmentId = newDept.id;
      save(data);
      app.screen = "department-detail";
      render();
      return;
    }

    if (action === "save-department") {
      dept = currentDepartment(company);
      if (dept) {
        dept.name = val("edit-department-name");
        dept.purpose = val("edit-department-purpose");
      }
      save(data);
      app.screen = "department-detail";
      render();
      return;
    }

    if (action === "delete-department") {
      if (dept) {
        company.departments = company.departments.filter(function (d) { return d.id !== app.departmentId; });
        app.departmentId = company.departments[0] ? company.departments[0].id : "";
        app.organizationId = company.departments[0] && company.departments[0].organizations[0] ? company.departments[0].organizations[0].id : "";
      }
      save(data);
      app.screen = "department-detail";
      render();
      return;
    }

    if (action === "switch-organization") {
      app.organizationId = val("organization-select");
      orgInfo = findOrgInCompany(company, app.organizationId);
      if (orgInfo) app.departmentId = orgInfo.dept.id;
      render();
      return;
    }

    if (action === "add-organization") {
      var targetDept = findDepartment(company, val("org-add-department")) || dept;
      if (!targetDept) {
        app.screen = "department-add";
        render();
        return;
      }
      var newOrg = {
        id: makeId("org"),
        name: val("new-org-name"),
        parent_id: "",
        purpose: val("new-org-purpose"),
        robot_ids: selectedValues("new-org-robots")
      };
      targetDept.organizations.push(newOrg);
      app.departmentId = targetDept.id;
      app.organizationId = newOrg.id;
      save(data);
      app.screen = "organization-detail";
      render();
      return;
    }

    if (action === "save-organization") {
      orgInfo = findOrgInCompany(company, app.organizationId);
      if (orgInfo) {
        orgInfo.org.name = val("edit-org-name");
        orgInfo.org.purpose = val("edit-org-purpose");
        orgInfo.org.robot_ids = selectedValues("edit-org-robots");
      }
      save(data);
      app.screen = "organization-detail";
      render();
      return;
    }

    if (action === "delete-organization") {
      orgInfo = findOrgInCompany(company, app.organizationId);
      if (orgInfo) {
        orgInfo.dept.organizations = orgInfo.dept.organizations.filter(function (o) { return o.id !== app.organizationId; });
        app.organizationId = orgInfo.dept.organizations[0] ? orgInfo.dept.organizations[0].id : "";
      }
      save(data);
      app.screen = "organization-detail";
      render();
      return;
    }

    if (action === "add-ledger-row") {
      if (!dept) return;
      dept.task_ledger.push({
        id: makeId("tl"),
        deliverable_name: val("add-deliverable"),
        task_name: val("add-task"),
        work_type: val("add-work-type"),
        status: val("add-status"),
        priority: val("add-priority"),
        due_date: val("add-due-date"),
        reference_files: val("add-reference"),
        supplemental_materials: val("add-supplemental"),
        note: val("add-note")
      });
      save(data);
      render();
      return;
    }

    if (action === "load-ledger-edit") {
      app.editLedgerId = val("edit-ledger-select");
      render();
      return;
    }

    if (action === "save-ledger-row") {
      var row = findLedgerRow(dept, val("edit-ledger-id"));
      if (row) {
        row.deliverable_name = val("edit-deliverable");
        row.task_name = val("edit-task");
        row.work_type = val("edit-work-type");
        row.status = val("edit-status");
        row.priority = val("edit-priority");
        row.due_date = val("edit-due-date");
        row.reference_files = val("edit-reference");
        row.supplemental_materials = val("edit-supplemental");
        row.note = val("edit-note");
      }
      save(data);
      render();
      return;
    }

    if (action === "delete-ledger-row") {
      if (dept) {
        dept.task_ledger = dept.task_ledger.filter(function (r) { return r.id !== val("edit-ledger-id"); });
      }
      app.editLedgerId = "";
      save(data);
      render();
      return;
    }

    if (action === "preview-csv") {
      previewCsv();
      return;
    }

    if (action === "import-csv") {
      if (!dept) return;
      CSV_ROWS.forEach(function (r) {
        if (validCsvRow(r).length === 0) {
          dept.task_ledger.push(csvToRow(r));
        }
      });
      save(data);
      render();
      return;
    }

    if (action === "copy-csv-prompt") {
      copyText(csvPrompt);
      document.getElementById("copy-result").textContent = "コピーしました。";
      return;
    }

    if (action === "approve-review" || action === "reject-review") {
      updateReview(data, button.getAttribute("data-review-id"), action === "approve-review" ? "承認済み" : "差し戻し");
      save(data);
      render();
    }
  }

  function updateReview(data, id, status) {
    data.companies.forEach(function (c) {
      c.departments.forEach(function (d) {
        d.review_items.forEach(function (r) {
          if (r.id === id) r.status = status;
        });
      });
    });
  }

  function parseCsv(text) {
    var rows = [];
    var current = [];
    var field = "";
    var inQuotes = false;
    var i;
    var ch;
    var next;

    for (i = 0; i < text.length; i += 1) {
      ch = text[i];
      next = text[i + 1];

      if (ch === '"' && inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        current.push(field);
        field = "";
      } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
        if (ch === "\r" && next === "\n") i += 1;
        current.push(field);
        if (current.join("").trim()) rows.push(current);
        current = [];
        field = "";
      } else {
        field += ch;
      }
    }

    current.push(field);
    if (current.join("").trim()) rows.push(current);

    if (!rows.length) return [];

    var header = rows[0].map(function (x) { return x.trim(); });
    return rows.slice(1).map(function (r) {
      var obj = {};
      header.forEach(function (h, idx) { obj[h] = r[idx] || ""; });
      return obj;
    });
  }

  function previewCsv() {
    var input = document.getElementById("csv-file");
    var preview = document.getElementById("csv-preview");

    if (!input.files || !input.files[0]) {
      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      CSV_ROWS = parseCsv(String(reader.result || ""));
      preview.innerHTML = CSV_ROWS.map(function (r) {
        var errors = validCsvRow(r);
        return '<div class="aicm-row"><strong>' + esc(r.deliverable_name || "(成果物名なし)") + '</strong><p class="aicm-muted">' + esc(r.task_name || "") + '</p>' + (errors.length ? '<p style="color:#9f1239;">ERROR: ' + esc(errors.join(" / ")) + '</p>' : '<p class="aicm-row ok">OK</p>') + '</div>';
      }).join("");
    };
    reader.readAsText(input.files[0]);
  }

  function validCsvRow(r) {
    var errors = [];
    if (!String(r.deliverable_name || "").trim()) errors.push("deliverable_name required");
    if (!String(r.task_name || "").trim()) errors.push("task_name required");
    if (["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"].indexOf(r.work_type) < 0) errors.push("work_type invalid");
    if (["未着手", "進行中", "レビュー中", "完了", "保留"].indexOf(r.status) < 0) errors.push("status invalid");
    return errors;
  }

  function csvToRow(r) {
    return {
      id: makeId("tl"),
      deliverable_name: r.deliverable_name || "",
      task_name: r.task_name || "",
      work_type: r.work_type || "",
      status: r.status || "未着手",
      priority: r.priority || "",
      due_date: r.due_date || "",
      reference_files: r.reference_files || "",
      supplemental_materials: r.supplemental_materials || "",
      note: r.note || ""
    };
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return;
    }
    var area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
  }

  document.addEventListener("DOMContentLoaded", render);
})();

/* ============================================================
 * Action adapter starts below
 * ============================================================ */
(function (global) {
  "use strict";

  function ok(data) {
    return Promise.resolve({
      ok: true,
      data: data || {},
      warnings: [],
      request_id: "action_" + Date.now().toString(36)
    });
  }

  function fail(code, message, details) {
    return Promise.resolve({
      ok: false,
      error_code: code,
      error_message: message,
      details: details || {},
      request_id: "action_" + Date.now().toString(36)
    });
  }

  function AicmActionAdapter(repository) {
    this.repository = repository || null;
  }

  AicmActionAdapter.prototype.requireRepository = function requireRepository() {
    if (!this.repository) {
      return null;
    }
    return this.repository;
  };

  AicmActionAdapter.prototype.switchCompany = function switchCompany(input) {
    return ok({ selected_company_id: input && input.company_id ? input.company_id : "" });
  };

  AicmActionAdapter.prototype.createCompany = function createCompany(input) {
    var repo = this.requireRepository();
    return repo && repo.createCompany ? repo.createCompany(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.saveCompany = function saveCompany(input) {
    var repo = this.requireRepository();
    return repo && repo.saveCompany ? repo.saveCompany(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.deleteCompany = function deleteCompany(input) {
    var repo = this.requireRepository();
    return repo && repo.deleteCompany ? repo.deleteCompany(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.saveCompanyRules = function saveCompanyRules(input) {
    var repo = this.requireRepository();
    return repo && repo.saveCompanyRules ? repo.saveCompanyRules(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.switchDepartment = function switchDepartment(input) {
    return ok({ selected_department_id: input && input.department_id ? input.department_id : "" });
  };

  AicmActionAdapter.prototype.createDepartment = function createDepartment(input) {
    var repo = this.requireRepository();
    return repo && repo.createDepartment ? repo.createDepartment(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.saveDepartment = function saveDepartment(input) {
    var repo = this.requireRepository();
    return repo && repo.saveDepartment ? repo.saveDepartment(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.deleteDepartment = function deleteDepartment(input) {
    var repo = this.requireRepository();
    return repo && repo.deleteDepartment ? repo.deleteDepartment(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.switchOrganization = function switchOrganization(input) {
    return ok({ selected_organization_id: input && input.organization_id ? input.organization_id : "" });
  };

  AicmActionAdapter.prototype.createOrganization = function createOrganization(input) {
    var repo = this.requireRepository();
    return repo && repo.createOrganization ? repo.createOrganization(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.saveOrganization = function saveOrganization(input) {
    var repo = this.requireRepository();
    return repo && repo.saveOrganization ? repo.saveOrganization(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.deleteOrganization = function deleteOrganization(input) {
    var repo = this.requireRepository();
    return repo && repo.deleteOrganization ? repo.deleteOrganization(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.saveLedgerRow = function saveLedgerRow(input) {
    var repo = this.requireRepository();
    return repo && repo.saveLedgerRow ? repo.saveLedgerRow(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.deleteLedgerRow = function deleteLedgerRow(input) {
    var repo = this.requireRepository();
    return repo && repo.deleteLedgerRow ? repo.deleteLedgerRow(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.previewCsv = function previewCsv(input) {
    var repo = this.requireRepository();
    return repo && repo.previewCsv ? repo.previewCsv(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.importCsv = function importCsv(input) {
    var repo = this.requireRepository();
    return repo && repo.importCsv ? repo.importCsv(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.approveReview = function approveReview(input) {
    var repo = this.requireRepository();
    return repo && repo.approveReview ? repo.approveReview(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.rejectReview = function rejectReview(input) {
    var repo = this.requireRepository();
    return repo && repo.rejectReview ? repo.rejectReview(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.requestReviewRevision = function requestReviewRevision(input) {
    var repo = this.requireRepository();
    return repo && repo.requestReviewRevision ? repo.requestReviewRevision(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  AicmActionAdapter.prototype.startWorkflow = function startWorkflow(input) {
    var repo = this.requireRepository();
    return repo && repo.startWorkflow ? repo.startWorkflow(input || {}) : fail("REPOSITORY_NOT_READY", "Repository is not ready.", input);
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmActionAdapter = AicmActionAdapter;
})(window);

/* ============================================================
 * Repository runtime starts below
 * ============================================================ */
(function (global) {
  "use strict";

  function createRepository(options) {
    var opts = options || {};
    var mode = opts.mode || "local";

    if (!global.AICM) {
      throw new Error("AICM namespace is not available.");
    }

    if (mode === "local") {
      return new global.AICM.AicmLocalRepository(opts.local || {});
    }

    if (mode === "api_stub") {
      return new global.AICM.AicmApiRepositoryStub(null);
    }

    return new global.AICM.AicmLocalRepository(opts.local || {});
  }

  function createRuntime(options) {
    var opts = options || {};
    var repository = createRepository(opts);
    var actionAdapter = new global.AICM.AicmActionAdapter(repository);

    return {
      mode: opts.mode || "local",
      repository: repository,
      actionAdapter: actionAdapter,
      realApiConnect: false,
      dbApply: false,
      rlsApply: false
    };
  }

  global.AICM = global.AICM || {};
  global.AICM.createRepository = createRepository;
  global.AICM.createRuntime = createRuntime;
  global.AICM.runtime = global.AICM.runtime || null;
})(window);

/* ============================================================
 * Action payload builders start below
 * ============================================================ */
(function (global) {
  "use strict";

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }

  function files(id) {
    var input = document.getElementById(id);
    if (!input || !input.files) return [];
    return Array.prototype.map.call(input.files, function (file) {
      return {
        file_name: file.name,
        name: file.name,
        file_size_bytes: file.size,
        size: file.size,
        mime_type: file.type || "",
        storage_scope: "metadata_only",
        storage_ref: null,
        note: ""
      };
    });
  }

  function selectedValues(id) {
    var select = document.getElementById(id);
    var values = [];
    var i;
    if (!select) return values;
    for (i = 0; i < select.options.length; i += 1) {
      if (select.options[i].selected) values.push(select.options[i].value);
    }
    return values;
  }

  function robotAssignments(id, companyId, departmentId, organizationId) {
    return selectedValues(id).map(function (robotId) {
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

  function buildCreateCompanyPayload() {
    return {
      company_name: val("new-company-name"),
      business_domain: val("new-company-domain")
    };
  }

  function buildSaveCompanyPayload() {
    return {
      company_id: val("edit-company-select"),
      company_name: val("edit-company-name"),
      business_domain: val("edit-company-domain"),
      company_status: "active"
    };
  }

  function buildDeleteCompanyPayload() {
    return {
      company_id: val("edit-company-select")
    };
  }

  function buildCompanyRulesPayload(companyId) {
    return {
      company_id: companyId || val("company-select") || val("edit-company-select"),
      files: files("common-rule-files")
    };
  }

  function buildCreateDepartmentPayload(companyId) {
    return {
      company_id: companyId || val("company-select"),
      department_name: val("new-department-name"),
      purpose: val("new-department-purpose"),
      display_order: 100
    };
  }

  function buildSaveDepartmentPayload(companyId, departmentId) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      department_name: val("edit-department-name"),
      purpose: val("edit-department-purpose"),
      department_status: "active",
      display_order: 100
    };
  }

  function buildDeleteDepartmentPayload(companyId, departmentId) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select")
    };
  }

  function buildCreateOrganizationPayload(companyId) {
    var departmentId = val("org-add-department") || val("department-select");
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId,
      parent_organization_id: "",
      organization_name: val("new-org-name"),
      purpose: val("new-org-purpose"),
      display_order: 100,
      robot_assignments: robotAssignments("new-org-robots", companyId || val("company-select"), departmentId, "")
    };
  }

  function buildSaveOrganizationPayload(companyId, departmentId, organizationId) {
    var cid = companyId || val("company-select");
    var did = departmentId || val("department-select");
    var oid = organizationId || val("organization-select");
    return {
      company_id: cid,
      department_id: did,
      organization_id: oid,
      parent_organization_id: "",
      organization_name: val("edit-org-name"),
      purpose: val("edit-org-purpose"),
      organization_status: "active",
      display_order: 100,
      robot_assignments: robotAssignments("edit-org-robots", cid, did, oid)
    };
  }

  function buildDeleteOrganizationPayload(companyId, departmentId, organizationId) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      organization_id: organizationId || val("organization-select")
    };
  }

  function buildSaveLedgerRowPayload(companyId, departmentId) {
    var ledgerId = val("edit-ledger-id");
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      ledger_row: {
        ledger_row_id: ledgerId || null,
        deliverable_name: val(ledgerId ? "edit-deliverable" : "add-deliverable"),
        task_name: val(ledgerId ? "edit-task" : "add-task"),
        work_type: val(ledgerId ? "edit-work-type" : "add-work-type"),
        task_status: val(ledgerId ? "edit-status" : "add-status"),
        priority: val(ledgerId ? "edit-priority" : "add-priority"),
        due_date: val(ledgerId ? "edit-due-date" : "add-due-date"),
        reference_files: val(ledgerId ? "edit-reference" : "add-reference"),
        supplemental_materials: val(ledgerId ? "edit-supplemental" : "add-supplemental"),
        note: val(ledgerId ? "edit-note" : "add-note"),
        source_type: "manual"
      }
    };
  }

  function buildDeleteLedgerRowPayload(companyId, departmentId) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      ledger_row_id: val("edit-ledger-id")
    };
  }

  function buildCsvPreviewPayload(companyId, departmentId, csvText, fileName) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      original_file_name: fileName || "",
      csv_text: csvText || ""
    };
  }

  function buildCsvImportPayload(companyId, departmentId, batchId) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      csv_import_batch_id: batchId || ""
    };
  }

  function buildReviewActionPayload(reviewItemId, comment) {
    return {
      review_item_id: reviewItemId || "",
      comment: comment || ""
    };
  }

  global.AICM = global.AICM || {};
  global.AICM.AicmActionPayloadBuilders = {
    val: val,
    files: files,
    selectedValues: selectedValues,
    buildCreateCompanyPayload: buildCreateCompanyPayload,
    buildSaveCompanyPayload: buildSaveCompanyPayload,
    buildDeleteCompanyPayload: buildDeleteCompanyPayload,
    buildCompanyRulesPayload: buildCompanyRulesPayload,
    buildCreateDepartmentPayload: buildCreateDepartmentPayload,
    buildSaveDepartmentPayload: buildSaveDepartmentPayload,
    buildDeleteDepartmentPayload: buildDeleteDepartmentPayload,
    buildCreateOrganizationPayload: buildCreateOrganizationPayload,
    buildSaveOrganizationPayload: buildSaveOrganizationPayload,
    buildDeleteOrganizationPayload: buildDeleteOrganizationPayload,
    buildSaveLedgerRowPayload: buildSaveLedgerRowPayload,
    buildDeleteLedgerRowPayload: buildDeleteLedgerRowPayload,
    buildCsvPreviewPayload: buildCsvPreviewPayload,
    buildCsvImportPayload: buildCsvImportPayload,
    buildReviewActionPayload: buildReviewActionPayload
  };
})(window);

/* ============================================================
 * Category action handlers start below
 * ============================================================ */
(function (global) {
  "use strict";

  function createHandlers(runtime) {
    var rt = runtime || {};
    var adapter = rt.actionAdapter;
    var builders = global.AICM && global.AICM.AicmActionPayloadBuilders;

    function unavailable(name) {
      return Promise.resolve({
        ok: false,
        error_code: "ACTION_HANDLER_NOT_READY",
        error_message: name + " is not ready.",
        details: {},
        request_id: "handler_" + Date.now().toString(36)
      });
    }

    function call(method, payload) {
      if (!adapter || typeof adapter[method] !== "function") {
        return unavailable(method);
      }
      return adapter[method](payload || {});
    }

    return {
      company: {
        switchCompany: function (companyId) { return call("switchCompany", { company_id: companyId || "" }); },
        createCompany: function () { return call("createCompany", builders.buildCreateCompanyPayload()); },
        saveCompany: function () { return call("saveCompany", builders.buildSaveCompanyPayload()); },
        deleteCompany: function () { return call("deleteCompany", builders.buildDeleteCompanyPayload()); },
        saveCompanyRules: function (companyId) { return call("saveCompanyRules", builders.buildCompanyRulesPayload(companyId)); }
      },
      department: {
        switchDepartment: function (departmentId) { return call("switchDepartment", { department_id: departmentId || "" }); },
        createDepartment: function (companyId) { return call("createDepartment", builders.buildCreateDepartmentPayload(companyId)); },
        saveDepartment: function (companyId, departmentId) { return call("saveDepartment", builders.buildSaveDepartmentPayload(companyId, departmentId)); },
        deleteDepartment: function (companyId, departmentId) { return call("deleteDepartment", builders.buildDeleteDepartmentPayload(companyId, departmentId)); }
      },
      organization: {
        switchOrganization: function (organizationId) { return call("switchOrganization", { organization_id: organizationId || "" }); },
        createOrganization: function (companyId) { return call("createOrganization", builders.buildCreateOrganizationPayload(companyId)); },
        saveOrganization: function (companyId, departmentId, organizationId) { return call("saveOrganization", builders.buildSaveOrganizationPayload(companyId, departmentId, organizationId)); },
        deleteOrganization: function (companyId, departmentId, organizationId) { return call("deleteOrganization", builders.buildDeleteOrganizationPayload(companyId, departmentId, organizationId)); }
      },
      ledger: {
        saveLedgerRow: function (companyId, departmentId) { return call("saveLedgerRow", builders.buildSaveLedgerRowPayload(companyId, departmentId)); },
        deleteLedgerRow: function (companyId, departmentId) { return call("deleteLedgerRow", builders.buildDeleteLedgerRowPayload(companyId, departmentId)); }
      },
      csv: {
        previewCsv: function (companyId, departmentId, csvText, fileName) { return call("previewCsv", builders.buildCsvPreviewPayload(companyId, departmentId, csvText, fileName)); },
        importCsv: function (companyId, departmentId, batchId) { return call("importCsv", builders.buildCsvImportPayload(companyId, departmentId, batchId)); }
      },
      review: {
        approveReview: function (reviewItemId, comment) { return call("approveReview", builders.buildReviewActionPayload(reviewItemId, comment)); },
        rejectReview: function (reviewItemId, comment) { return call("rejectReview", builders.buildReviewActionPayload(reviewItemId, comment)); },
        requestReviewRevision: function (reviewItemId, comment) { return call("requestReviewRevision", builders.buildReviewActionPayload(reviewItemId, comment)); }
      },
      workflow: {
        startWorkflow: function (input) { return call("startWorkflow", input || {}); }
      }
    };
  }

  global.AICM = global.AICM || {};
  global.AICM.createActionHandlers = createHandlers;
})(window);

/* ============================================================
 * Action router starts below
 * ============================================================ */
(function (global) {
  "use strict";

  function createActionRouter(handlers) {
    var h = handlers || {};

    var routes = {
      "add-company": function () { return h.company.createCompany(); },
      "save-company": function () { return h.company.saveCompany(); },
      "delete-company": function () { return h.company.deleteCompany(); },
      "add-common-rules": function () { return h.company.saveCompanyRules(); },

      "add-department": function () { return h.department.createDepartment(); },
      "save-department": function () { return h.department.saveDepartment(); },
      "delete-department": function () { return h.department.deleteDepartment(); },

      "add-organization": function () { return h.organization.createOrganization(); },
      "save-organization": function () { return h.organization.saveOrganization(); },
      "delete-organization": function () { return h.organization.deleteOrganization(); },

      "add-ledger-row": function () { return h.ledger.saveLedgerRow(); },
      "save-ledger-row": function () { return h.ledger.saveLedgerRow(); },
      "delete-ledger-row": function () { return h.ledger.deleteLedgerRow(); },

      "preview-csv": function () { return h.csv.previewCsv(); },
      "import-csv": function () { return h.csv.importCsv(); },

      "approve-review": function (button) { return h.review.approveReview(button && button.getAttribute ? button.getAttribute("data-review-id") : ""); },
      "reject-review": function (button) { return h.review.rejectReview(button && button.getAttribute ? button.getAttribute("data-review-id") : ""); }
    };

    return {
      route: function route(action, button) {
        if (!routes[action]) {
          return Promise.resolve({
            ok: false,
            error_code: "ACTION_ROUTE_NOT_FOUND",
            error_message: "Action route not found: " + action,
            details: { action: action },
            request_id: "route_" + Date.now().toString(36)
          });
        }
        return routes[action](button || null);
      },
      hasRoute: function hasRoute(action) {
        return !!routes[action];
      }
    };
  }

  global.AICM = global.AICM || {};
  global.AICM.createActionRouter = createActionRouter;
})(window);

/* ============================================================
 * Local wiring pilot starts below
 * ============================================================ */
(function (global) {
  "use strict";

  function readyResult(ok, code, message, details) {
    if (ok) {
      return {
        ok: true,
        data: details || {},
        warnings: [],
        request_id: "pilot_" + Date.now().toString(36)
      };
    }

    return {
      ok: false,
      error_code: code,
      error_message: message,
      details: details || {},
      request_id: "pilot_" + Date.now().toString(36)
    };
  }

  function AicmLocalWiringPilot(options) {
    this.options = options || {};
    this.runtime = null;
    this.handlers = null;
    this.companyPilot = null;
    this.departmentPilot = null;
  }

  AicmLocalWiringPilot.prototype.init = function init() {
    if (!global.AICM) {
      return readyResult(false, "AICM_NAMESPACE_MISSING", "AICM namespace is missing.", {});
    }

    if (typeof global.AICM.createRuntime !== "function") {
      return readyResult(false, "AICM_RUNTIME_FACTORY_MISSING", "AICM runtime factory is missing.", {});
    }

    if (typeof global.AICM.createActionHandlers !== "function") {
      return readyResult(false, "AICM_ACTION_HANDLERS_FACTORY_MISSING", "AICM action handlers factory is missing.", {});
    }

    this.runtime = global.AICM.createRuntime({
      mode: "local",
      local: {
        storageKey: this.options.storageKey || "AICM_PHASE_AO_ADD_ONLY_SPLIT_STATE"
      }
    });

    this.handlers = global.AICM.createActionHandlers(this.runtime);

    this.companyPilot = {
      createCompany: this.handlers.company.createCompany,
      saveCompany: this.handlers.company.saveCompany,
      deleteCompany: this.handlers.company.deleteCompany,
      saveCompanyRules: this.handlers.company.saveCompanyRules
    };

    this.departmentPilot = {
      createDepartment: this.handlers.department.createDepartment,
      saveDepartment: this.handlers.department.saveDepartment,
      deleteDepartment: this.handlers.department.deleteDepartment
    };

    return readyResult(true, "", "", {
      mode: this.runtime.mode,
      realApiConnect: this.runtime.realApiConnect,
      dbApply: this.runtime.dbApply,
      rlsApply: this.runtime.rlsApply,
      companyPilot: true,
      departmentPilot: true
    });
  };

  AicmLocalWiringPilot.prototype.selfCheck = function selfCheck() {
    var checks = {
      namespace: !!global.AICM,
      runtimeFactory: !!(global.AICM && global.AICM.createRuntime),
      actionHandlersFactory: !!(global.AICM && global.AICM.createActionHandlers),
      localRepository: !!(global.AICM && global.AICM.AicmLocalRepository),
      apiStub: !!(global.AICM && global.AICM.AicmApiRepositoryStub),
      companyPilot: !!this.companyPilot,
      departmentPilot: !!this.departmentPilot,
      realApiConnect: this.runtime ? this.runtime.realApiConnect === false : true,
      dbApply: this.runtime ? this.runtime.dbApply === false : true,
      rlsApply: this.runtime ? this.runtime.rlsApply === false : true
    };

    var ok = Object.keys(checks).every(function (key) {
      return checks[key] === true;
    });

    return readyResult(ok, ok ? "" : "AICM_LOCAL_WIRING_SELF_CHECK_FAIL", ok ? "" : "Local wiring self check failed.", checks);
  };

  function autoInit() {
    global.AICM = global.AICM || {};
    global.AICM.localWiringPilot = new AicmLocalWiringPilot();
    global.AICM.localWiringPilotInitResult = global.AICM.localWiringPilot.init();
  }

  global.AICM = global.AICM || {};
  global.AICM.AicmLocalWiringPilot = AicmLocalWiringPilot;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
})(window);

/* ============================================================
 * Company local action wiring starts below
 * ============================================================ */
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

/* ============================================================
 * Department local action wiring starts below
 * ============================================================ */
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

/* ============================================================
 * Organization local action wiring starts below
 * ============================================================ */
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

/* ============================================================
 * Ledger local action wiring starts below
 * ============================================================ */
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

/* ============================================================
 * CSV local action wiring starts below
 * ============================================================ */
(function (global) {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var PREVIEW_KEY = "AICM_CSV_PREVIEW_ROWS";
  var IMPORT_RESULT_KEY = "AICM_CSV_IMPORT_RESULT";

  var CSV_ACTIONS = {
    "preview-csv": true,
    "import-csv": true
  };

  var REQUIRED_HEADER = [
    "deliverable_name",
    "task_name",
    "work_type",
    "status",
    "priority",
    "due_date",
    "reference_files",
    "supplemental_materials",
    "note"
  ];

  var WORK_TYPES = ["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"];
  var STATUSES = ["未着手", "進行中", "レビュー中", "完了", "保留"];
  var PRIORITIES = ["高", "中", "低"];

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

  function createRepository() {
    if (!global.AICM || !global.AICM.AicmLocalRepository) {
      return null;
    }

    return new global.AICM.AicmLocalRepository({
      storageKey: STORAGE_KEY
    });
  }

  function readCsvTextFromDom() {
    var ids = [
      "csv-text",
      "csv-input",
      "csv-import-text",
      "task-ledger-csv",
      "ledger-csv-text",
      "csv-preview-text"
    ];
    var i;
    var el;

    for (i = 0; i < ids.length; i += 1) {
      el = byId(ids[i]);
      if (el && typeof el.value === "string" && el.value.trim().length > 0) {
        return el.value;
      }
    }

    return "";
  }

  function parseCsvLine(line) {
    var cells = [];
    var current = "";
    var inQuotes = false;
    var i;
    var ch;
    var next;

    for (i = 0; i < line.length; i += 1) {
      ch = line.charAt(i);
      next = line.charAt(i + 1);

      if (ch === '"' && inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }

    cells.push(current);
    return cells.map(function (cell) {
      return cell.trim();
    });
  }

  function parseCsv(text) {
    var lines = String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter(function (line) {
        return line.trim().length > 0;
      });

    var header;
    var rows = [];

    if (lines.length === 0) {
      return {
        header: [],
        rows: [],
        errors: ["CSVが空です。"]
      };
    }

    header = parseCsvLine(lines[0]);

    lines.slice(1).forEach(function (line, index) {
      var cells = parseCsvLine(line);
      var raw = {};
      var i;

      for (i = 0; i < header.length; i += 1) {
        raw[header[i]] = cells[i] || "";
      }

      rows.push({
        row_number: index + 2,
        raw: raw,
        cells: cells
      });
    });

    return {
      header: header,
      rows: rows,
      errors: []
    };
  }

  function sameHeader(header) {
    if (!header || header.length !== REQUIRED_HEADER.length) return false;

    return REQUIRED_HEADER.every(function (name, index) {
      return header[index] === name;
    });
  }

  function validateRow(raw) {
    var errors = [];
    var dueDate = raw.due_date || "";

    if (!raw.deliverable_name) errors.push("deliverable_name is required");
    if (!raw.task_name) errors.push("task_name is required");
    if (WORK_TYPES.indexOf(raw.work_type) === -1) errors.push("work_type is invalid");
    if (STATUSES.indexOf(raw.status) === -1) errors.push("status is invalid");
    if (PRIORITIES.indexOf(raw.priority) === -1) errors.push("priority is invalid");

    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      errors.push("due_date must be YYYY-MM-DD");
    }

    return errors;
  }

  function previewCsv() {
    var text = readCsvTextFromDom();
    var parsed = parseCsv(text);
    var result;

    if (parsed.errors.length > 0) {
      result = {
        ok: false,
        errors: parsed.errors,
        rows: []
      };
      sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(result));
      return Promise.resolve(result);
    }

    if (!sameHeader(parsed.header)) {
      result = {
        ok: false,
        errors: ["CSVヘッダーが正本と一致しません。"],
        expected_header: REQUIRED_HEADER,
        actual_header: parsed.header,
        rows: []
      };
      sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(result));
      return Promise.resolve(result);
    }

    result = {
      ok: true,
      errors: [],
      row_count: parsed.rows.length,
      rows: parsed.rows.map(function (row) {
        var validationErrors = validateRow(row.raw);
        return {
          row_number: row.row_number,
          parsed_row: row.raw,
          validation_status: validationErrors.length === 0 ? "valid" : "invalid",
          validation_errors: validationErrors
        };
      })
    };

    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(result));
    return Promise.resolve(result);
  }

  function importCsv() {
    var repository = createRepository();
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();
    var previewRaw = sessionStorage.getItem(PREVIEW_KEY);
    var preview;
    var validRows;
    var chain;
    var imported = [];

    if (!repository) {
      return Promise.resolve({
        ok: false,
        error_code: "CSV_WIRING_NOT_READY",
        error_message: "CSV wiring is not ready.",
        details: {},
        request_id: "csv_wiring_not_ready"
      });
    }

    if (!companyId || !departmentId) {
      return Promise.resolve({
        ok: false,
        error_code: "CSV_IMPORT_REQUIRES_COMPANY_AND_DEPARTMENT",
        error_message: "CSV import requires company_id and department_id.",
        details: {
          company_id: companyId,
          department_id: departmentId
        },
        request_id: "csv_import_guard"
      });
    }

    if (!previewRaw) {
      return Promise.resolve({
        ok: false,
        error_code: "CSV_PREVIEW_REQUIRED",
        error_message: "CSV preview is required before import.",
        details: {},
        request_id: "csv_preview_required"
      });
    }

    try {
      preview = JSON.parse(previewRaw);
    } catch (error) {
      return Promise.resolve({
        ok: false,
        error_code: "CSV_PREVIEW_PARSE_FAILED",
        error_message: "CSV preview result could not be parsed.",
        details: {},
        request_id: "csv_preview_parse_failed"
      });
    }

    if (!preview.ok) {
      return Promise.resolve({
        ok: false,
        error_code: "CSV_PREVIEW_INVALID",
        error_message: "CSV preview is invalid.",
        details: preview,
        request_id: "csv_preview_invalid"
      });
    }

    validRows = (preview.rows || []).filter(function (row) {
      return row.validation_status === "valid";
    });

    chain = Promise.resolve();

    validRows.forEach(function (row) {
      chain = chain.then(function () {
        return repository.saveLedgerRow({
          company_id: companyId,
          department_id: departmentId,
          ledger_row: {
            ledger_row_id: null,
            deliverable_name: row.parsed_row.deliverable_name,
            task_name: row.parsed_row.task_name,
            work_type: row.parsed_row.work_type,
            task_status: row.parsed_row.status,
            priority: row.parsed_row.priority,
            due_date: row.parsed_row.due_date,
            reference_files: row.parsed_row.reference_files,
            supplemental_materials: row.parsed_row.supplemental_materials,
            note: row.parsed_row.note,
            source_type: "csv"
          }
        }).then(function (result) {
          imported.push(result);
        });
      });
    });

    return chain.then(function () {
      var result = {
        ok: true,
        imported_count: imported.length,
        invalid_count: (preview.rows || []).length - validRows.length,
        imported: imported
      };

      sessionStorage.setItem(IMPORT_RESULT_KEY, JSON.stringify(result));
      setCurrentCompany(companyId);
      setPendingDepartment(departmentId);

      return result;
    });
  }

  function isCsvAction(action) {
    return !!CSV_ACTIONS[action];
  }

  function handleCsvAction(action) {
    if (action === "preview-csv") return previewCsv();
    if (action === "import-csv") return importCsv();

    return Promise.resolve({
      ok: false,
      error_code: "CSV_ACTION_NOT_SUPPORTED",
      error_message: "CSV action is not supported: " + action,
      details: { action: action },
      request_id: "csv_action_not_supported"
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
    }, true);

    document.addEventListener("change", function (event) {
      if (!event.target) return;

      if (event.target.id === "company-select" && event.target.value) {
        setCurrentCompany(event.target.value);
      }

      if (event.target.id === "department-select" && event.target.value) {
        setPendingDepartment(event.target.value);
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
      if (!isCsvAction(action)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      handleCsvAction(action).then(function (result) {
        if (result && result.ok === false) {
          alert(result.error_message || (result.errors ? result.errors.join("\n") : "CSV操作に失敗しました。"));
          return;
        }

        if (action === "preview-csv") {
          alert("CSVプレビュー完了: " + String(result.row_count || 0) + "行");
          return;
        }

        location.reload();
      });
    }, true);
  }

  function init() {
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();

    if (companyId) setCurrentCompany(companyId);
    if (departmentId) setPendingDepartment(departmentId);

    global.AICM = global.AICM || {};
    global.AICM.csvLocalActionWiring = {
      storageKey: STORAGE_KEY,
      csvActionsOnly: true,
      realApiConnect: false,
      dbApply: false,
      rlsApply: false,
      requiredHeader: REQUIRED_HEADER,
      isCsvAction: isCsvAction,
      handleCsvAction: handleCsvAction,
      previewCsv: previewCsv,
      importCsv: importCsv
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

/* ============================================================
 * Review local action wiring starts below
 * ============================================================ */
(function (global) {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var REVIEW_ACTIONS = {
    "approve-review": true,
    "reject-review": true,
    "request-review-revision": true
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

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state || { aiworkers: [], companies: [] }));
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

  function setPendingReview(reviewItemId) {
    if (reviewItemId) {
      sessionStorage.setItem("AICM_PENDING_REVIEW_ITEM_ID", reviewItemId);
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

  function firstReviewItem() {
    var state = getState();
    var found = null;

    (state.companies || []).forEach(function (company) {
      (company.departments || []).forEach(function (department) {
        if (!found && department.review_items && department.review_items[0]) {
          found = department.review_items[0];
        }
      });
    });

    return found;
  }

  function getReviewItemId(button) {
    var item;

    if (button && button.getAttribute) {
      if (button.getAttribute("data-review-id")) return button.getAttribute("data-review-id");
      if (button.getAttribute("data-review_item_id")) return button.getAttribute("data-review_item_id");
      if (button.getAttribute("data-id")) return button.getAttribute("data-id");
    }

    if (sessionStorage.getItem("AICM_PENDING_REVIEW_ITEM_ID")) {
      return sessionStorage.getItem("AICM_PENDING_REVIEW_ITEM_ID");
    }

    item = firstReviewItem();
    if (item) return item.id || item.review_item_id || "";

    return "";
  }

  function ensureDemoReviewIfMissing() {
    var state = getState();
    var company;
    var department;
    var reviewId;

    if (!state.companies || state.companies.length === 0) return "";

    company = state.companies[0];
    company.departments = company.departments || [];

    if (company.departments.length === 0) return "";

    department = company.departments[0];
    department.review_items = department.review_items || [];

    if (department.review_items.length > 0) {
      return department.review_items[0].id || department.review_items[0].review_item_id || "";
    }

    reviewId = "review-" + Date.now().toString(36);

    department.review_items.push({
      id: reviewId,
      review_item_id: reviewId,
      title: "納品候補レビュー",
      review_title: "納品候補レビュー",
      status: "承認待ち",
      review_status: "承認待ち",
      target_name: "LocalRepository pilot",
      note: "local review wiring demo item"
    });

    saveState(state);
    return reviewId;
  }

  function createRepository() {
    if (!global.AICM || !global.AICM.AicmLocalRepository) {
      return null;
    }

    return new global.AICM.AicmLocalRepository({
      storageKey: STORAGE_KEY
    });
  }

  function updateReviewStatusDirect(reviewItemId, status) {
    var state = getState();
    var found = null;

    (state.companies || []).forEach(function (company) {
      (company.departments || []).forEach(function (department) {
        (department.review_items || []).forEach(function (review) {
          if (review.id === reviewItemId || review.review_item_id === reviewItemId) {
            review.status = status;
            review.review_status = status;
            found = review;
          }
        });
      });
    });

    if (found) {
      saveState(state);
      return {
        ok: true,
        data: {
          review_item: found,
          state: state
        },
        warnings: [],
        request_id: "review_direct_" + Date.now().toString(36)
      };
    }

    return {
      ok: false,
      error_code: "REVIEW_ITEM_NOT_FOUND",
      error_message: "Review item not found.",
      details: {
        review_item_id: reviewItemId
      },
      request_id: "review_not_found_" + Date.now().toString(36)
    };
  }

  function isReviewAction(action) {
    return !!REVIEW_ACTIONS[action];
  }

  function handleReviewAction(action, button) {
    var repository = createRepository();
    var reviewItemId = getReviewItemId(button);
    var payload;

    if (!reviewItemId) {
      reviewItemId = ensureDemoReviewIfMissing();
    }

    if (!reviewItemId) {
      return Promise.resolve({
        ok: false,
        error_code: "REVIEW_ITEM_ID_REQUIRED",
        error_message: "Review item id is required.",
        details: {},
        request_id: "review_id_required"
      });
    }

    setCurrentCompany(getCurrentCompanyId());
    setPendingDepartment(getCurrentDepartmentId());
    setPendingReview(reviewItemId);

    payload = {
      review_item_id: reviewItemId,
      comment: ""
    };

    if (repository) {
      if (action === "approve-review" && repository.approveReview) {
        return repository.approveReview(payload);
      }

      if (action === "reject-review" && repository.rejectReview) {
        return repository.rejectReview(payload);
      }

      if (action === "request-review-revision" && repository.requestReviewRevision) {
        return repository.requestReviewRevision(payload);
      }
    }

    if (action === "approve-review") {
      return Promise.resolve(updateReviewStatusDirect(reviewItemId, "承認済み"));
    }

    if (action === "reject-review") {
      return Promise.resolve(updateReviewStatusDirect(reviewItemId, "差し戻し"));
    }

    if (action === "request-review-revision") {
      return Promise.resolve(updateReviewStatusDirect(reviewItemId, "修正待ち"));
    }

    return Promise.resolve({
      ok: false,
      error_code: "REVIEW_ACTION_NOT_SUPPORTED",
      error_message: "Review action is not supported: " + action,
      details: { action: action },
      request_id: "review_action_not_supported"
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

      if (isReviewAction(action)) {
        setPendingReview(getReviewItemId(button));
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
    }, true);
  }

  function installCaptureHandler() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-action]") : null;
      var action;

      if (!button) return;

      action = button.getAttribute("data-action");
      if (!isReviewAction(action)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      handleReviewAction(action, button).then(function (result) {
        if (result && result.ok === false) {
          alert(result.error_message || "レビュー操作に失敗しました。");
          return;
        }

        location.reload();
      });
    }, true);
  }

  function init() {
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();

    if (companyId) setCurrentCompany(companyId);
    if (departmentId) setPendingDepartment(departmentId);

    global.AICM = global.AICM || {};
    global.AICM.reviewLocalActionWiring = {
      storageKey: STORAGE_KEY,
      reviewActionsOnly: true,
      realApiConnect: false,
      dbApply: false,
      rlsApply: false,
      isReviewAction: isReviewAction,
      handleReviewAction: handleReviewAction,
      getReviewItemId: getReviewItemId,
      ensureDemoReviewIfMissing: ensureDemoReviewIfMissing
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

/* ============================================================
 * Workflow local stub wiring starts below
 * ============================================================ */
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

