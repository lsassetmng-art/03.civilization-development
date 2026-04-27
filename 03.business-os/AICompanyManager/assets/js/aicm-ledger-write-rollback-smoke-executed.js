(function (global) {
  "use strict";

  var VERSION = "phase-is-iv";

  function AicmLedgerWriteRollbackSmokeExecuted(metadata) {
    this.metadata = metadata || {};
    this.version = VERSION;
    this.phase = "IS-IV";
    this.ledgerWriteRollbackSmoke = true;
    this.persistentDbWrite = false;
    this.reviewAction = false;
    this.csvImport = false;
    this.workflowStart = false;
    this.liveAiworkerosCall = false;
  }

  AicmLedgerWriteRollbackSmokeExecuted.prototype.status = function () {
    return {
      ok: true,
      data: {
        version: this.version,
        phase: this.phase,
        ledgerWriteRollbackSmoke: this.ledgerWriteRollbackSmoke,
        persistentDbWrite: this.persistentDbWrite,
        reviewAction: this.reviewAction,
        csvImport: this.csvImport,
        workflowStart: this.workflowStart,
        liveAiworkerosCall: this.liveAiworkerosCall
      },
      warnings: [
        "final_ui_not_modified",
        "local_repository_fallback_maintained",
        "rollback_smoke_only"
      ],
      request_id: "ledger_write_rollback_smoke_executed_status"
    };
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmLedgerWriteRollbackSmokeExecuted = AicmLedgerWriteRollbackSmokeExecuted;
})(window);
