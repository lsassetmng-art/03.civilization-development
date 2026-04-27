(function (global) {
  "use strict";

  var VERSION = "phase-ji-jl";

  function AicmCompanyPersistentWriteSmokeExecuted(metadata) {
    this.metadata = metadata || {};
    this.version = VERSION;
    this.phase = "JI-JL";
    this.companyPersistentWriteSmoke = true;
    this.persistentDbWrite = true;
    this.departmentPersistentWrite = false;
    this.organizationPersistentWrite = false;
    this.ledgerPersistentWrite = false;
    this.reviewAction = false;
    this.csvImport = false;
    this.workflowStart = false;
    this.liveAiworkerosCall = false;
  }

  AicmCompanyPersistentWriteSmokeExecuted.prototype.status = function () {
    return {
      ok: true,
      data: {
        version: this.version,
        phase: this.phase,
        companyPersistentWriteSmoke: this.companyPersistentWriteSmoke,
        persistentDbWrite: this.persistentDbWrite,
        departmentPersistentWrite: this.departmentPersistentWrite,
        organizationPersistentWrite: this.organizationPersistentWrite,
        ledgerPersistentWrite: this.ledgerPersistentWrite,
        reviewAction: this.reviewAction,
        csvImport: this.csvImport,
        workflowStart: this.workflowStart,
        liveAiworkerosCall: this.liveAiworkerosCall
      },
      warnings: [
        "final_ui_not_modified",
        "company_scope_only",
        "persistent_smoke_row_created"
      ],
      request_id: "company_persistent_write_smoke_executed_status"
    };
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmCompanyPersistentWriteSmokeExecuted = AicmCompanyPersistentWriteSmokeExecuted;
})(window);
