(function (global) {
  "use strict";

  var VERSION = "phase-ha-hd-prep";
  var ENDPOINT = "/api/aicm/v1/bootstrap";

  function AicmBrowserReadonlyFetchDisabled(options) {
    this.options = options || {};
    this.endpoint = ENDPOINT;
    this.enabled = false;
    this.allowFetch = false;
    this.realApiConnect = false;
    this.liveAiworkerosCall = false;
    this.loadedByIndex = false;
  }

  AicmBrowserReadonlyFetchDisabled.prototype.status = function () {
    return {
      ok: true,
      data: {
        version: VERSION,
        endpoint: this.endpoint,
        enabled: this.enabled,
        allowFetch: this.allowFetch,
        realApiConnect: this.realApiConnect,
        liveAiworkerosCall: this.liveAiworkerosCall,
        loadedByIndex: this.loadedByIndex
      },
      warnings: [
        "candidate_only",
        "disabled_until_boss_ok",
        "fetch_not_executed",
        "local_repository_fallback_required"
      ],
      request_id: "browser_readonly_fetch_disabled_status"
    };
  };

  AicmBrowserReadonlyFetchDisabled.prototype.prepareRequest = function () {
    return {
      ok: false,
      error_code: "AICM_BROWSER_READONLY_FETCH_DISABLED",
      error_message: "Browser readonly fetch is disabled until Boss implementation OK.",
      details: {
        method: "GET",
        endpoint: this.endpoint,
        allowFetch: false,
        realApiConnect: false,
        liveAiworkerosCall: false
      },
      request_id: "browser_readonly_fetch_disabled"
    };
  };

  AicmBrowserReadonlyFetchDisabled.prototype.rollbackToLocalRepository = function () {
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
      request_id: "browser_readonly_fetch_rollback"
    };
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmBrowserReadonlyFetchDisabled = AicmBrowserReadonlyFetchDisabled;
  global.AICM.browserReadonlyFetchDisabledMetadata = {
    version: VERSION,
    endpoint: ENDPOINT,
    candidateOnly: true,
    enabled: false,
    loadedByIndex: false,
    allowFetch: false,
    realApiConnect: false,
    liveAiworkerosCall: false
  };
})(window);
