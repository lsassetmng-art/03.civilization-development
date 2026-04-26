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
