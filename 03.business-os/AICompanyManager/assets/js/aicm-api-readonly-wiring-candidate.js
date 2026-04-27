(function (global) {
  "use strict";

  var VERSION = "phase-gg-gj";
  var READONLY_BOOTSTRAP_ENDPOINT = "/api/aicm/v1/bootstrap";

  function AicmApiReadonlyWiringCandidate(options) {
    this.options = options || {};
    this.mode = "candidate_disabled";
    this.endpoint = READONLY_BOOTSTRAP_ENDPOINT;
    this.allowFetch = false;
    this.realApiConnect = false;
    this.liveAiworkerosCall = false;
    this.loadedByIndex = false;
  }

  AicmApiReadonlyWiringCandidate.prototype.status = function () {
    return {
      ok: true,
      data: {
        version: VERSION,
        endpoint: this.endpoint,
        mode: this.mode,
        allowFetch: this.allowFetch,
        realApiConnect: this.realApiConnect,
        liveAiworkerosCall: this.liveAiworkerosCall,
        loadedByIndex: this.loadedByIndex
      },
      warnings: [
        "candidate_only",
        "not_loaded_by_index",
        "fetch_not_executed",
        "local_repository_fallback_required"
      ],
      request_id: "api_readonly_wiring_candidate_status"
    };
  };

  AicmApiReadonlyWiringCandidate.prototype.prepareBootstrapRequest = function () {
    return {
      ok: false,
      error_code: "AICM_API_READONLY_WIRING_CANDIDATE_DISABLED",
      error_message: "Readonly API wiring candidate exists but browser fetch is disabled.",
      details: {
        method: "GET",
        endpoint: this.endpoint,
        allowFetch: false,
        realApiConnect: false,
        liveAiworkerosCall: false
      },
      request_id: "api_readonly_wiring_disabled"
    };
  };

  AicmApiReadonlyWiringCandidate.prototype.mapBootstrapResponseToState = function (response) {
    var data = response && response.data ? response.data : {};
    return {
      companies: Array.isArray(data.companies) ? data.companies : [],
      currentCompanyId: data.current_company_id || "",
      departments: Array.isArray(data.departments) ? data.departments : [],
      organizations: Array.isArray(data.organizations) ? data.organizations : [],
      taskLedger: Array.isArray(data.task_ledger) ? data.task_ledger : [],
      reviewItems: Array.isArray(data.review_items) ? data.review_items : [],
      repositoryMode: data.repository_mode || "api_readonly_candidate"
    };
  };

  AicmApiReadonlyWiringCandidate.prototype.rollbackToLocalRepository = function () {
    return {
      ok: true,
      data: {
        activeRepository: "LocalRepository",
        localStoragePreserved: true,
        serverWriteExecuted: false,
        workflowStarted: false,
        liveAiworkerosCall: false
      },
      warnings: [
        "fallback_to_local_repository",
        "candidate_only"
      ],
      request_id: "api_readonly_wiring_rollback"
    };
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmApiReadonlyWiringCandidate = AicmApiReadonlyWiringCandidate;
  global.AICM.apiReadonlyWiringCandidateMetadata = {
    version: VERSION,
    endpoint: READONLY_BOOTSTRAP_ENDPOINT,
    candidateOnly: true,
    loadedByIndex: false,
    allowFetch: false,
    realApiConnect: false,
    liveAiworkerosCall: false
  };
})(window);
