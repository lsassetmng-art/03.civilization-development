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
