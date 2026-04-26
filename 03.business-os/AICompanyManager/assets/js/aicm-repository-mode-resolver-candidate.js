(function (global) {
  "use strict";

  var VERSION = "phase-fa-fd";
  var ACTIVE_MODE = "local";

  var ALLOWED_MODES = [
    "local",
    "api_readonly_candidate",
    "api_write_candidate",
    "api_with_workflow_stub",
    "api_with_live_aiworkeros"
  ];

  function safeResult(payload) {
    return {
      ok: true,
      data: payload,
      warnings: [
        "candidate_only",
        "not_loaded_by_index",
        "no_network_execution",
        "active_mode_remains_local"
      ],
      request_id: "repository_mode_candidate"
    };
  }

  function AicmRepositoryModeResolverCandidate(options) {
    this.options = options || {};
    this.activeMode = "local";
    this.allowNetwork = false;
    this.realApiConnect = false;
    this.liveAiworkerosCall = false;
    this.autoSwitchEnabled = false;
  }

  AicmRepositoryModeResolverCandidate.prototype.getStatus = function () {
    return safeResult({
      version: VERSION,
      activeMode: this.activeMode,
      allowedModes: ALLOWED_MODES,
      allowNetwork: this.allowNetwork,
      realApiConnect: this.realApiConnect,
      liveAiworkerosCall: this.liveAiworkerosCall,
      autoSwitchEnabled: this.autoSwitchEnabled
    });
  };

  AicmRepositoryModeResolverCandidate.prototype.resolveMode = function () {
    return safeResult({
      selectedMode: "local",
      reason: "real API connect is disabled until Boss implementation OK",
      allowNetwork: false,
      realApiConnect: false,
      liveAiworkerosCall: false
    });
  };

  AicmRepositoryModeResolverCandidate.prototype.canSwitchToApiReadonly = function () {
    return {
      ok: false,
      error_code: "BOSS_IMPLEMENTATION_OK_REQUIRED",
      error_message: "API readonly mode requires Boss implementation OK before connection.",
      details: {
        requestedMode: "api_readonly_candidate",
        currentMode: "local",
        realApiConnect: false,
        allowNetwork: false
      },
      request_id: "api_readonly_blocked"
    };
  };

  AicmRepositoryModeResolverCandidate.prototype.createRepository = function () {
    return {
      ok: false,
      error_code: "MODE_RESOLVER_CANDIDATE_DISABLED",
      error_message: "Mode resolver candidate does not create active ApiRepository yet.",
      details: {
        activeMode: "local",
        realApiConnect: false,
        allowNetwork: false,
        liveAiworkerosCall: false
      },
      request_id: "mode_resolver_disabled"
    };
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmRepositoryModeResolverCandidate = AicmRepositoryModeResolverCandidate;
  global.AICM.repositoryModeResolverCandidateMetadata = {
    version: VERSION,
    activeMode: ACTIVE_MODE,
    allowedModes: ALLOWED_MODES,
    candidateOnly: true,
    notLoadedByIndex: true,
    allowNetwork: false,
    realApiConnect: false,
    liveAiworkerosCall: false
  };
})(window);
