(function (global) {
  "use strict";

  var VERSION = "phase-ic-if";

  function AicmDepartmentWriteRollbackSmokeExecuted(metadata) {
    this.metadata = metadata || {};
    this.version = VERSION;
    this.phase = "IC-IF";
    this.departmentWriteRollbackSmoke = true;
    this.persistentDbWrite = false;
    this.organizationWrite = false;
    this.ledgerWrite = false;
    this.reviewAction = false;
    this.csvImport = false;
    this.workflowStart = false;
    this.liveAiworkerosCall = false;
  }

  AicmDepartmentWriteRollbackSmokeExecuted.prototype.status = function () {
    return {
      ok: true,
      data: {
        version: this.version,
        phase: this.phase,
        departmentWriteRollbackSmoke: this.departmentWriteRollbackSmoke,
        persistentDbWrite: this.persistentDbWrite,
        organizationWrite: this.organizationWrite,
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
      request_id: "department_write_rollback_smoke_executed_status"
    };
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmDepartmentWriteRollbackSmokeExecuted = AicmDepartmentWriteRollbackSmokeExecuted;
})(window);
