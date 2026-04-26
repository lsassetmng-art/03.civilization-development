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
