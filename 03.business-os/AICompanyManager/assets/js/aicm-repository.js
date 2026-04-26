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
