(function (global) {
  "use strict";

  var VERSION = "phase-he-hh";
  var ENDPOINT = "/api/aicm/v1/bootstrap";

  function AicmReadonlyFetchSmokeExecuted(metadata) {
    this.metadata = metadata || {};
    this.version = VERSION;
    this.endpoint = ENDPOINT;
    this.phase = "HE-HH";
    this.readonlyOnly = true;
    this.writeExecuted = false;
    this.workflowStarted = false;
    this.liveAiworkerosCall = false;
  }

  AicmReadonlyFetchSmokeExecuted.prototype.status = function () {
    return {
      ok: true,
      data: {
        version: this.version,
        endpoint: this.endpoint,
        phase: this.phase,
        readonlyOnly: this.readonlyOnly,
        writeExecuted: this.writeExecuted,
        workflowStarted: this.workflowStarted,
        liveAiworkerosCall: this.liveAiworkerosCall
      },
      warnings: [
        "final_ui_not_modified",
        "local_repository_fallback_maintained"
      ],
      request_id: "readonly_fetch_smoke_executed_status"
    };
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmReadonlyFetchSmokeExecuted = AicmReadonlyFetchSmokeExecuted;
})(window);
