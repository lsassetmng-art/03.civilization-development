(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(typeof globalThis !== "undefined" ? globalThis : undefined);
  } else {
    root.AICMBusinessAIWorkerSaveDoubleSubmitGuard = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  var ORIGINAL_SAVE_DRAFT_KEY = "__aicmBusinessAiworkerDoubleSubmitOriginalSaveDraft";
  var STATE_KEY = "__aicmBusinessAiworkerDoubleSubmitState";

  function nowIso() {
    return new Date().toISOString();
  }

  function text(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function getState() {
    if (!root[STATE_KEY]) {
      root[STATE_KEY] = {
        inFlight: false,
        startedAt: "",
        finishedAt: "",
        lastResult: null,
        blockedCount: 0
      };
    }
    return root[STATE_KEY];
  }

  function isInFlight() {
    return getState().inFlight === true;
  }

  function buildBlockedResult(draft) {
    var state = getState();
    state.blockedCount += 1;

    return {
      ok: false,
      blocked: true,
      step: "double_submit_guard",
      error: "save_already_in_progress",
      reason: "A save request is already running.",
      blocked_count: state.blockedCount,
      started_at: state.startedAt,
      draft: draft || null
    };
  }

  function findSaveButtons() {
    if (!root || !root.document) return [];

    var selectors = [
      "[data-aicm-aiworker-action='save-db']",
      "[data-aicm-aiworker-action='save']",
      "[data-aicm-aiworker-action='confirm-save']"
    ];

    var nodes = [];
    selectors.forEach(function (selector) {
      Array.prototype.forEach.call(root.document.querySelectorAll(selector), function (node) {
        if (nodes.indexOf(node) < 0) nodes.push(node);
      });
    });

    return nodes;
  }

  function setSaveButtonsBusy(flag) {
    var buttons = findSaveButtons();

    buttons.forEach(function (button) {
      if (flag) {
        if (!button.getAttribute("data-aicm-original-disabled")) {
          button.setAttribute("data-aicm-original-disabled", button.disabled ? "true" : "false");
        }
        if (!button.getAttribute("data-aicm-original-text")) {
          button.setAttribute("data-aicm-original-text", button.textContent || "");
        }
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        button.textContent = "保存中...";
      } else {
        var originalDisabled = button.getAttribute("data-aicm-original-disabled");
        var originalText = button.getAttribute("data-aicm-original-text");

        button.disabled = originalDisabled === "true";

        if (originalText !== null) {
          button.textContent = originalText;
        }

        button.removeAttribute("aria-busy");
        button.removeAttribute("data-aicm-original-disabled");
        button.removeAttribute("data-aicm-original-text");
      }
    });

    return buttons.length;
  }

  function writeOutput(payload) {
    if (!root || !root.document) return false;

    var output = root.document.querySelector("[data-aicm-aiworker-output='draft']");
    if (!output) return false;

    output.textContent = JSON.stringify(payload, null, 2);
    return true;
  }

  function markStart() {
    var state = getState();
    state.inFlight = true;
    state.startedAt = nowIso();
    state.finishedAt = "";
    setSaveButtonsBusy(true);

    return {
      ok: true,
      started_at: state.startedAt
    };
  }

  function markFinish(result) {
    var state = getState();
    state.inFlight = false;
    state.finishedAt = nowIso();
    state.lastResult = result || null;
    setSaveButtonsBusy(false);

    return {
      ok: true,
      finished_at: state.finishedAt
    };
  }

  function wrapSaveClient() {
    var saveClient = root && root.AICMBusinessAIWorkerSaveClient;

    if (!saveClient || typeof saveClient.saveDraft !== "function") {
      return {
        ok: false,
        reason: "save_client_unavailable"
      };
    }

    if (saveClient[ORIGINAL_SAVE_DRAFT_KEY]) {
      return {
        ok: true,
        wrapped: false,
        reason: "already_wrapped"
      };
    }

    saveClient[ORIGINAL_SAVE_DRAFT_KEY] = saveClient.saveDraft;

    saveClient.saveDraft = function guardedSaveDraft(draft, options) {
      if (isInFlight()) {
        var blocked = buildBlockedResult(draft);
        writeOutput(blocked);
        return Promise.resolve(blocked);
      }

      markStart();

      return Promise.resolve()
        .then(function () {
          return saveClient[ORIGINAL_SAVE_DRAFT_KEY].call(saveClient, draft, options);
        })
        .then(function (result) {
          markFinish(result);
          return result;
        })
        .catch(function (error) {
          var failed = {
            ok: false,
            step: "save_double_submit_guard",
            error: "save_failed",
            detail: error && error.message ? error.message : String(error)
          };
          markFinish(failed);
          throw error;
        });
    };

    return {
      ok: true,
      wrapped: true
    };
  }

  function bindClickGuard() {
    if (!root || !root.document) {
      return {
        ok: false,
        reason: "document_unavailable"
      };
    }

    root.document.addEventListener("click", function (event) {
      var action = event.target && event.target.getAttribute("data-aicm-aiworker-action");
      if (action !== "save-db" && action !== "save" && action !== "confirm-save") return;

      if (isInFlight()) {
        event.preventDefault();
        event.stopPropagation();

        var blocked = buildBlockedResult(null);
        writeOutput(blocked);
      }
    }, true);

    return {
      ok: true,
      bound: true
    };
  }

  function installMountObserver() {
    if (!root || !root.document || !root.MutationObserver) {
      return {
        ok: false,
        reason: "mutation_observer_unavailable"
      };
    }

    var observer = new root.MutationObserver(function () {
      if (isInFlight()) {
        setSaveButtonsBusy(true);
      }
    });

    observer.observe(root.document.body, {
      childList: true,
      subtree: true
    });

    return {
      ok: true,
      observed: true
    };
  }

  function init() {
    var wrapResult = wrapSaveClient();
    var bindResult = bindClickGuard();
    var observerResult = installMountObserver();

    return {
      ok: true,
      wrapResult: wrapResult,
      bindResult: bindResult,
      observerResult: observerResult
    };
  }

  function resetForTest() {
    var state = getState();
    state.inFlight = false;
    state.startedAt = "";
    state.finishedAt = "";
    state.lastResult = null;
    state.blockedCount = 0;
  }

  if (root && root.document) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  return {
    ORIGINAL_SAVE_DRAFT_KEY: ORIGINAL_SAVE_DRAFT_KEY,
    STATE_KEY: STATE_KEY,
    getState: getState,
    isInFlight: isInFlight,
    buildBlockedResult: buildBlockedResult,
    setSaveButtonsBusy: setSaveButtonsBusy,
    writeOutput: writeOutput,
    markStart: markStart,
    markFinish: markFinish,
    wrapSaveClient: wrapSaveClient,
    bindClickGuard: bindClickGuard,
    installMountObserver: installMountObserver,
    init: init,
    resetForTest: resetForTest
  };
});
