(function (global) {
  "use strict";

  var VERSION = "phase-ew-ez-restored-for-fa-fd";
  var API_BASE_PATH = "/api/aicm/v1";

  var ENDPOINTS = {
    createCompany: API_BASE_PATH + "/companies/create",
    saveCompany: API_BASE_PATH + "/companies/save",
    deleteCompany: API_BASE_PATH + "/companies/delete",
    saveCompanyRules: API_BASE_PATH + "/companies/rules/save",

    createDepartment: API_BASE_PATH + "/departments/create",
    saveDepartment: API_BASE_PATH + "/departments/save",
    deleteDepartment: API_BASE_PATH + "/departments/delete",

    createOrganization: API_BASE_PATH + "/organizations/create",
    saveOrganization: API_BASE_PATH + "/organizations/save",
    deleteOrganization: API_BASE_PATH + "/organizations/delete",

    saveLedgerRow: API_BASE_PATH + "/ledger/save",
    deleteLedgerRow: API_BASE_PATH + "/ledger/delete",
    previewCsv: API_BASE_PATH + "/ledger/csv/preview",
    importCsv: API_BASE_PATH + "/ledger/csv/import",

    applyReviewAction: API_BASE_PATH + "/reviews/action",
    startWorkflow: API_BASE_PATH + "/workflows/start-local-stub"
  };

  function disabledResult(methodName, payload) {
    return Promise.resolve({
      ok: false,
      error_code: "AICM_API_REPOSITORY_CANDIDATE_DISABLED",
      error_message: "ApiRepository candidate exists, but real API connect is disabled.",
      details: {
        method: methodName,
        endpoint: ENDPOINTS[methodName] || "",
        payload: payload || {},
        realApiConnect: false,
        allowNetwork: false,
        liveAiworkerosCall: false
      },
      warnings: [
        "candidate_only",
        "network_not_executed",
        "final_ui_still_local_repository"
      ],
      request_id: "api_candidate_disabled"
    });
  }

  function AicmApiRepositoryCandidate(options) {
    this.options = options || {};
    this.mode = this.options.mode || "candidate_disabled";
    this.allowNetwork = false;
    this.realApiConnect = false;
    this.liveAiworkerosCall = false;
    this.endpoints = ENDPOINTS;
  }

  AicmApiRepositoryCandidate.prototype.status = function () {
    return {
      ok: true,
      data: {
        version: VERSION,
        mode: this.mode,
        allowNetwork: this.allowNetwork,
        realApiConnect: this.realApiConnect,
        liveAiworkerosCall: this.liveAiworkerosCall,
        endpoints: this.endpoints
      },
      warnings: [
        "candidate_only",
        "not_loaded_by_index",
        "no_network_execution"
      ],
      request_id: "api_candidate_status"
    };
  };

  AicmApiRepositoryCandidate.prototype.createCompany = function (payload) {
    return disabledResult("createCompany", payload);
  };

  AicmApiRepositoryCandidate.prototype.saveCompany = function (payload) {
    return disabledResult("saveCompany", payload);
  };

  AicmApiRepositoryCandidate.prototype.deleteCompany = function (payload) {
    return disabledResult("deleteCompany", payload);
  };

  AicmApiRepositoryCandidate.prototype.saveCompanyRules = function (payload) {
    return disabledResult("saveCompanyRules", payload);
  };

  AicmApiRepositoryCandidate.prototype.createDepartment = function (payload) {
    return disabledResult("createDepartment", payload);
  };

  AicmApiRepositoryCandidate.prototype.saveDepartment = function (payload) {
    return disabledResult("saveDepartment", payload);
  };

  AicmApiRepositoryCandidate.prototype.deleteDepartment = function (payload) {
    return disabledResult("deleteDepartment", payload);
  };

  AicmApiRepositoryCandidate.prototype.createOrganization = function (payload) {
    return disabledResult("createOrganization", payload);
  };

  AicmApiRepositoryCandidate.prototype.saveOrganization = function (payload) {
    return disabledResult("saveOrganization", payload);
  };

  AicmApiRepositoryCandidate.prototype.deleteOrganization = function (payload) {
    return disabledResult("deleteOrganization", payload);
  };

  AicmApiRepositoryCandidate.prototype.saveLedgerRow = function (payload) {
    return disabledResult("saveLedgerRow", payload);
  };

  AicmApiRepositoryCandidate.prototype.deleteLedgerRow = function (payload) {
    return disabledResult("deleteLedgerRow", payload);
  };

  AicmApiRepositoryCandidate.prototype.previewCsv = function (payload) {
    return disabledResult("previewCsv", payload);
  };

  AicmApiRepositoryCandidate.prototype.importCsv = function (payload) {
    return disabledResult("importCsv", payload);
  };

  AicmApiRepositoryCandidate.prototype.applyReviewAction = function (payload) {
    return disabledResult("applyReviewAction", payload);
  };

  AicmApiRepositoryCandidate.prototype.approveReview = function (payload) {
    return disabledResult("applyReviewAction", {
      review_item_id: payload && payload.review_item_id,
      action_type: "approve",
      comment: payload && payload.comment,
      idempotency_key: payload && payload.idempotency_key
    });
  };

  AicmApiRepositoryCandidate.prototype.rejectReview = function (payload) {
    return disabledResult("applyReviewAction", {
      review_item_id: payload && payload.review_item_id,
      action_type: "reject",
      comment: payload && payload.comment,
      idempotency_key: payload && payload.idempotency_key
    });
  };

  AicmApiRepositoryCandidate.prototype.requestReviewRevision = function (payload) {
    return disabledResult("applyReviewAction", {
      review_item_id: payload && payload.review_item_id,
      action_type: "request_revision",
      comment: payload && payload.comment,
      idempotency_key: payload && payload.idempotency_key
    });
  };

  AicmApiRepositoryCandidate.prototype.startWorkflow = function (payload) {
    return disabledResult("startWorkflow", payload);
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmApiRepositoryCandidate = AicmApiRepositoryCandidate;
  global.AICM.apiRepositoryCandidateMetadata = {
    version: VERSION,
    apiBasePath: API_BASE_PATH,
    endpoints: ENDPOINTS,
    realApiConnect: false,
    allowNetwork: false,
    liveAiworkerosCall: false,
    candidateOnly: true
  };
})(window);
