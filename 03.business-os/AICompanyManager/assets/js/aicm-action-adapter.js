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
