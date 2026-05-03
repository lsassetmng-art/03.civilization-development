(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(typeof globalThis !== "undefined" ? globalThis : undefined);
  } else {
    root.AICMBusinessAIWorkerDuplicateGuard = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  var DEFAULT_API_BASE_URL = "http://127.0.0.1:8797";
  var ORIGINAL_SAVE_DRAFT_KEY = "__aicmBusinessAiworkerOriginalSaveDraft";

  function text(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function getApiBaseUrl(options) {
    if (options && options.apiBaseUrl) {
      return text(options.apiBaseUrl).replace(/\/+$/, "");
    }

    if (root && root.AICM_BUSINESS_AIWORKER_DUPLICATE_GUARD_API_BASE_URL) {
      return text(root.AICM_BUSINESS_AIWORKER_DUPLICATE_GUARD_API_BASE_URL).replace(/\/+$/, "");
    }

    try {
      var stored = root && root.localStorage
        ? root.localStorage.getItem("aicm_business_aiworker_duplicate_guard_api_base_url")
        : "";
      if (stored) return text(stored).replace(/\/+$/, "");
    } catch (error) {
      /* ignore */
    }

    return DEFAULT_API_BASE_URL;
  }

  function requestJson(path, method, body, options) {
    var fetchImpl = root && root.fetch;
    var apiBaseUrl = getApiBaseUrl(options || {});

    if (typeof fetchImpl !== "function") {
      return Promise.resolve({
        ok: false,
        error: "fetch_unavailable"
      });
    }

    return fetchImpl(apiBaseUrl + path, {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (response) {
      return response.json().then(function (json) {
        if (!response.ok) {
          json.ok = false;
          json.http_status = response.status;
        }
        return json;
      });
    }).catch(function (error) {
      return {
        ok: false,
        error: "request_failed",
        detail: error.message
      };
    });
  }

  function buildGuardPayloadFromDraft(draft) {
    var placement = draft && draft.placementPayload ? draft.placementPayload : {};
    return {
      company_id: text(placement.company_id || placement.companyId),
      role_code: text(placement.role_code || placement.roleCode),
      target_level_code: text(placement.target_level_code || placement.targetLevelCode),
      target_id: text(placement.target_id || placement.targetId),
      exclude_company_robot_placement_id: text(
        placement.exclude_company_robot_placement_id || placement.excludeCompanyRobotPlacementId
      )
    };
  }

  function validateGuardPayload(payload) {
    var errors = [];

    if (!text(payload.company_id)) errors.push("company_id_required");
    if (!text(payload.role_code)) errors.push("role_code_required");
    if (!text(payload.target_level_code)) errors.push("target_level_code_required");

    return {
      ok: errors.length === 0,
      errors: errors,
      payload: payload
    };
  }

  function checkDuplicateGuard(payload, options) {
    var validation = validateGuardPayload(payload);

    if (!validation.ok) {
      return Promise.resolve({
        ok: false,
        allowed: false,
        reason: "invalid_guard_payload",
        errors: validation.errors
      });
    }

    return requestJson(
      "/api/v1/business/aiworker/aicm/duplicate-guard",
      "POST",
      validation.payload,
      options
    );
  }

  function buildBlockedResult(draft, guardResult) {
    return {
      ok: false,
      blocked: true,
      step: "duplicate_guard",
      error: "duplicate_guard_blocked",
      reason: guardResult && guardResult.reason ? guardResult.reason : "duplicate_single_slot_role_blocked",
      guardResult: guardResult,
      draft: draft
    };
  }

  function wrapSaveClient(options) {
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

    saveClient.saveDraft = function guardedSaveDraft(draft, saveOptions) {
      var guardPayload = buildGuardPayloadFromDraft(draft);
      var mergedOptions = Object.assign({}, options || {}, saveOptions || {});

      return checkDuplicateGuard(guardPayload, mergedOptions).then(function (guardResult) {
        if (!guardResult.ok) {
          return {
            ok: false,
            blocked: true,
            step: "duplicate_guard",
            error: "duplicate_guard_unavailable_or_failed",
            guardResult: guardResult,
            draft: draft
          };
        }

        if (guardResult.allowed !== true) {
          return buildBlockedResult(draft, guardResult);
        }

        return saveClient[ORIGINAL_SAVE_DRAFT_KEY].call(saveClient, draft, saveOptions);
      });
    };

    return {
      ok: true,
      wrapped: true
    };
  }

  function readPanelDraft() {
    var saveClient = root && root.AICMBusinessAIWorkerSaveClient;

    if (saveClient && typeof saveClient.buildDraftFromPanel === "function") {
      return saveClient.buildDraftFromPanel();
    }

    return {
      ok: false,
      errors: ["save_client_buildDraftFromPanel_unavailable"]
    };
  }

  function writeOutput(payload) {
    if (!root || !root.document) return false;

    var output = root.document.querySelector("[data-aicm-aiworker-output='draft']");
    if (!output) return false;

    output.textContent = JSON.stringify(payload, null, 2);
    return true;
  }

  function addManualGuardButton() {
    if (!root || !root.document) return false;

    var panel = root.document.getElementById("aicm-business-aiworker-bridge-panel");
    if (!panel) return false;

    if (panel.querySelector("[data-aicm-aiworker-action='duplicate-guard-check']")) {
      return true;
    }

    var anchor = panel.querySelector("[data-aicm-aiworker-action='save-db']");
    if (!anchor) {
      anchor = panel.querySelector("[data-aicm-aiworker-action='build-draft']");
    }

    if (!anchor || !anchor.parentNode) return false;

    var button = root.document.createElement("button");
    button.type = "button";
    button.setAttribute("data-aicm-aiworker-action", "duplicate-guard-check");
    button.textContent = "重複チェック";
    button.style.padding = "8px 12px";
    button.style.borderRadius = "10px";
    button.style.border = "1px solid #8250df";
    button.style.background = "#fff";
    button.style.color = "#8250df";

    anchor.parentNode.appendChild(button);
    return true;
  }

  function bindManualGuardButton() {
    if (!root || !root.document) {
      return {
        ok: false,
        reason: "document_unavailable"
      };
    }

    root.document.addEventListener("click", function (event) {
      var action = event.target && event.target.getAttribute("data-aicm-aiworker-action");
      if (action !== "duplicate-guard-check") return;

      var draft = readPanelDraft();
      var payload = buildGuardPayloadFromDraft(draft);

      checkDuplicateGuard(payload).then(function (result) {
        writeOutput({
          ok: result.ok === true,
          duplicateGuardResult: result,
          draft: draft
        });
      });
    });

    return {
      ok: true,
      bound: true
    };
  }

  function init() {
    var wrapResult = wrapSaveClient();
    var bindResult = bindManualGuardButton();
    addManualGuardButton();

    if (root && root.MutationObserver && root.document) {
      var observer = new root.MutationObserver(function () {
        addManualGuardButton();
      });

      observer.observe(root.document.body, {
        childList: true,
        subtree: true
      });
    }

    return {
      ok: true,
      wrapResult: wrapResult,
      bindResult: bindResult
    };
  }

  function buildSmokeDraft(roleCode) {
    return {
      ok: true,
      displayLabel: "社長AI@" + (roleCode || "President"),
      placementPayload: {
        company_id: "00000000-0000-4000-8000-000000000001",
        role_code: roleCode || "President",
        target_level_code: roleCode === "Worker" ? "section" : "company",
        target_id: "",
        app_code: "AICompanyManager",
        internal_nickname: roleCode === "Worker" ? "ワーカーAI" : "社長AI"
      }
    };
  }

  if (root && root.document) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  return {
    DEFAULT_API_BASE_URL: DEFAULT_API_BASE_URL,
    buildGuardPayloadFromDraft: buildGuardPayloadFromDraft,
    validateGuardPayload: validateGuardPayload,
    checkDuplicateGuard: checkDuplicateGuard,
    buildBlockedResult: buildBlockedResult,
    wrapSaveClient: wrapSaveClient,
    readPanelDraft: readPanelDraft,
    addManualGuardButton: addManualGuardButton,
    bindManualGuardButton: bindManualGuardButton,
    init: init,
    buildSmokeDraft: buildSmokeDraft
  };
});
