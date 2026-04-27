(function (global) {
  "use strict";

  var VERSION = "phase-jy-kb";

  function AicmOrganizationPersistentWriteSmokeExecuted(metadata) {
    this.metadata = metadata || {};
    this.version = VERSION;
    this.phase = "JY-KB";
    this.organizationPersistentWriteSmoke = true;
    this.persistentDbWrite = true;
    this.ledgerPersistentWrite = false;
    this.reviewAction = false;
    this.csvImport = false;
    this.workflowStart = false;
    this.liveAiworkerosCall = false;
  }

  AicmOrganizationPersistentWriteSmokeExecuted.prototype.status = function () {
    return {
      ok: true,
      data: {
        version: this.version,
        phase: this.phase,
        organizationPersistentWriteSmoke: this.organizationPersistentWriteSmoke,
        persistentDbWrite: this.persistentDbWrite,
        ledgerPersistentWrite: this.ledgerPersistentWrite,
        reviewAction: this.reviewAction,
        csvImport: this.csvImport,
        workflowStart: this.workflowStart,
        liveAiworkerosCall: this.liveAiworkerosCall
      },
      warnings: [
        "final_ui_not_modified",
        "organization_scope_only",
        "persistent_smoke_organization_row_created"
      ],
      request_id: "organization_persistent_write_smoke_executed_status"
    };
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmOrganizationPersistentWriteSmokeExecuted = AicmOrganizationPersistentWriteSmokeExecuted;
})(window);
