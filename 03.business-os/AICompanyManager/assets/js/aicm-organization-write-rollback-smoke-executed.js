(function (global) {
  "use strict";

  var VERSION = "phase-ik-in";

  function AicmOrganizationWriteRollbackSmokeExecuted(metadata) {
    this.metadata = metadata || {};
    this.version = VERSION;
    this.phase = "IK-IN";
    this.organizationWriteRollbackSmoke = true;
    this.persistentDbWrite = false;
    this.ledgerWrite = false;
    this.reviewAction = false;
    this.csvImport = false;
    this.workflowStart = false;
    this.liveAiworkerosCall = false;
  }

  AicmOrganizationWriteRollbackSmokeExecuted.prototype.status = function () {
    return {
      ok: true,
      data: {
        version: this.version,
        phase: this.phase,
        organizationWriteRollbackSmoke: this.organizationWriteRollbackSmoke,
        persistentDbWrite: this.persistentDbWrite,
        ledgerWrite: this.ledgerWrite,
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
      request_id: "organization_write_rollback_smoke_executed_status"
    };
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmOrganizationWriteRollbackSmokeExecuted = AicmOrganizationWriteRollbackSmokeExecuted;
})(window);
