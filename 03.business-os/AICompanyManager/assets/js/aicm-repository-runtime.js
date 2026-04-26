(function (global) {
  "use strict";

  function createRepository(options) {
    var opts = options || {};
    var mode = opts.mode || "local";

    if (!global.AICM) {
      throw new Error("AICM namespace is not available.");
    }

    if (mode === "local") {
      return new global.AICM.AicmLocalRepository(opts.local || {});
    }

    if (mode === "api_stub") {
      return new global.AICM.AicmApiRepositoryStub(null);
    }

    return new global.AICM.AicmLocalRepository(opts.local || {});
  }

  function createRuntime(options) {
    var opts = options || {};
    var repository = createRepository(opts);
    var actionAdapter = new global.AICM.AicmActionAdapter(repository);

    return {
      mode: opts.mode || "local",
      repository: repository,
      actionAdapter: actionAdapter,
      realApiConnect: false,
      dbApply: false,
      rlsApply: false
    };
  }

  global.AICM = global.AICM || {};
  global.AICM.createRepository = createRepository;
  global.AICM.createRuntime = createRuntime;
  global.AICM.runtime = global.AICM.runtime || null;
})(window);
