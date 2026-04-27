(function (global) {
  "use strict";

  var VERSION = "phase-hm-hp";

  function AicmBrowserWriteApiDisabled(options) {
    this.options = options || {};
    this.enabled = false;
    this.allowFetch = false;
    this.writeApiConnect = false;
    this.reviewAction = false;
    this.csvImport = false;
    this.workflowStart = false;
    this.liveAiworkerosCall = false;
    this.loadedByIndex = false;
  }

  AicmBrowserWriteApiDisabled.prototype.status = function () {
    return {
      ok: true,
      data: {
        version: VERSION,
        enabled: this.enabled,
        allowFetch: this.allowFetch,
        writeApiConnect: this.writeApiConnect,
        reviewAction: this.reviewAction,
        csvImport: this.csvImport,
        workflowStart: this.workflowStart,
        liveAiworkerosCall: this.liveAiworkerosCall,
        loadedByIndex: this.loadedByIndex
      },
      warnings: [
        "candidate_only",
        "disabled_until_boss_write_ok",
        "local_repository_draft_required"
      ],
      request_id: "browser_write_api_disabled_status"
    };
  };

  AicmBrowserWriteApiDisabled.prototype.prepareWriteRequest = function (action, payload) {
    return {
      ok: false,
      error_code: "AICM_BROWSER_WRITE_API_DISABLED",
      error_message: "Browser write API wiring is disabled until Boss write API OK.",
      details: {
        action: action || "",
        payload: payload || {},
        allowFetch: false,
        writeApiConnect: false,
        reviewAction: false,
        csvImport: false,
        workflowStart: false,
        liveAiworkerosCall: false
      },
      request_id: "browser_write_api_disabled"
    };
  };

  AicmBrowserWriteApiDisabled.prototype.rollbackToLocalDraft = function () {
    return {
      ok: true,
      data: {
        activeRepository: "LocalRepository",
        localDraftPreserved: true,
        serverWriteExecuted: false,
        workflowStarted: false,
        liveAiworkerosCall: false
      },
      warnings: [
        "fallback_to_local_draft",
        "candidate_only"
      ],
      request_id: "browser_write_api_rollback"
    };
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmBrowserWriteApiDisabled = AicmBrowserWriteApiDisabled;
  global.AICM.browserWriteApiDisabledMetadata = {
    version: VERSION,
    candidateOnly: true,
    enabled: false,
    loadedByIndex: false,
    allowFetch: false,
    writeApiConnect: false,
    reviewAction: false,
    csvImport: false,
    workflowStart: false,
    liveAiworkerosCall: false
  };
})(window);
