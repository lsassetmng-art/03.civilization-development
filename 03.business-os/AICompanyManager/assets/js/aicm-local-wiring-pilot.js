(function (global) {
  "use strict";

  function readyResult(ok, code, message, details) {
    if (ok) {
      return {
        ok: true,
        data: details || {},
        warnings: [],
        request_id: "pilot_" + Date.now().toString(36)
      };
    }

    return {
      ok: false,
      error_code: code,
      error_message: message,
      details: details || {},
      request_id: "pilot_" + Date.now().toString(36)
    };
  }

  function AicmLocalWiringPilot(options) {
    this.options = options || {};
    this.runtime = null;
    this.handlers = null;
    this.companyPilot = null;
    this.departmentPilot = null;
  }

  AicmLocalWiringPilot.prototype.init = function init() {
    if (!global.AICM) {
      return readyResult(false, "AICM_NAMESPACE_MISSING", "AICM namespace is missing.", {});
    }

    if (typeof global.AICM.createRuntime !== "function") {
      return readyResult(false, "AICM_RUNTIME_FACTORY_MISSING", "AICM runtime factory is missing.", {});
    }

    if (typeof global.AICM.createActionHandlers !== "function") {
      return readyResult(false, "AICM_ACTION_HANDLERS_FACTORY_MISSING", "AICM action handlers factory is missing.", {});
    }

    this.runtime = global.AICM.createRuntime({
      mode: "local",
      local: {
        storageKey: this.options.storageKey || "AICM_PHASE_AO_ADD_ONLY_SPLIT_STATE"
      }
    });

    this.handlers = global.AICM.createActionHandlers(this.runtime);

    this.companyPilot = {
      createCompany: this.handlers.company.createCompany,
      saveCompany: this.handlers.company.saveCompany,
      deleteCompany: this.handlers.company.deleteCompany,
      saveCompanyRules: this.handlers.company.saveCompanyRules
    };

    this.departmentPilot = {
      createDepartment: this.handlers.department.createDepartment,
      saveDepartment: this.handlers.department.saveDepartment,
      deleteDepartment: this.handlers.department.deleteDepartment
    };

    return readyResult(true, "", "", {
      mode: this.runtime.mode,
      realApiConnect: this.runtime.realApiConnect,
      dbApply: this.runtime.dbApply,
      rlsApply: this.runtime.rlsApply,
      companyPilot: true,
      departmentPilot: true
    });
  };

  AicmLocalWiringPilot.prototype.selfCheck = function selfCheck() {
    var checks = {
      namespace: !!global.AICM,
      runtimeFactory: !!(global.AICM && global.AICM.createRuntime),
      actionHandlersFactory: !!(global.AICM && global.AICM.createActionHandlers),
      localRepository: !!(global.AICM && global.AICM.AicmLocalRepository),
      apiStub: !!(global.AICM && global.AICM.AicmApiRepositoryStub),
      companyPilot: !!this.companyPilot,
      departmentPilot: !!this.departmentPilot,
      realApiConnect: this.runtime ? this.runtime.realApiConnect === false : true,
      dbApply: this.runtime ? this.runtime.dbApply === false : true,
      rlsApply: this.runtime ? this.runtime.rlsApply === false : true
    };

    var ok = Object.keys(checks).every(function (key) {
      return checks[key] === true;
    });

    return readyResult(ok, ok ? "" : "AICM_LOCAL_WIRING_SELF_CHECK_FAIL", ok ? "" : "Local wiring self check failed.", checks);
  };

  function autoInit() {
    global.AICM = global.AICM || {};
    global.AICM.localWiringPilot = new AicmLocalWiringPilot();
    global.AICM.localWiringPilotInitResult = global.AICM.localWiringPilot.init();
  }

  global.AICM = global.AICM || {};
  global.AICM.AicmLocalWiringPilot = AicmLocalWiringPilot;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
})(window);
