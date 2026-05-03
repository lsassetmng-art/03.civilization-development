(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(typeof globalThis !== "undefined" ? globalThis : undefined);
  } else {
    root.AICMBusinessAIWorkerSaveClient = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  var DEFAULT_API_BASE_URL = "http://127.0.0.1:8789";

  function text(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function getApiBaseUrl() {
    if (root && root.AICM_BUSINESS_AIWORKER_API_BASE_URL) {
      return text(root.AICM_BUSINESS_AIWORKER_API_BASE_URL).replace(/\/+$/, "");
    }

    try {
      var stored = root && root.localStorage
        ? root.localStorage.getItem("aicm_business_aiworker_api_base_url")
        : "";
      if (stored) return text(stored).replace(/\/+$/, "");
    } catch (error) {
      /* ignore */
    }

    return DEFAULT_API_BASE_URL;
  }

  function getBridge() {
    return root && root.AICMBusinessAIWorkerBridge ? root.AICMBusinessAIWorkerBridge : null;
  }

  function getConnector() {
    return root && root.BusinessAIWorkerAICMConnector ? root.BusinessAIWorkerAICMConnector : null;
  }

  function readPanelState() {
    var panel = root.document && root.document.getElementById("aicm-business-aiworker-bridge-panel");
    var state = {};

    if (!panel) return state;

    var fields = panel.querySelectorAll("[data-aicm-aiworker-field]");
    Array.prototype.forEach.call(fields, function (field) {
      var key = field.getAttribute("data-aicm-aiworker-field");
      state[key] = field.value;
    });

    return state;
  }

  function buildDraftFromPanel() {
    var bridge = getBridge();
    var state = readPanelState();

    if (bridge && typeof bridge.buildDraft === "function") {
      var initial = typeof bridge.getInitialState === "function" ? bridge.getInitialState() : {};
      return bridge.buildDraft(Object.assign(initial, state));
    }

    var connector = getConnector();

    if (connector && typeof connector.buildAicmRobotSettingDraft === "function") {
      return connector.buildAicmRobotSettingDraft({
        company_id: state.companyId,
        aiworker_model_code: state.aiworkerModelCode,
        target_level_code: state.targetLevelCode,
        target_id: state.targetId,
        app_code: "AICompanyManager",
        role_code: state.roleCode,
        internal_nickname: state.internalNickname,
        quantity: 1,
        metadata_jsonb: {
          source: "AICompanyManagerSaveClient"
        }
      });
    }

    return {
      ok: false,
      errors: ["bridge_or_connector_unavailable"]
    };
  }

  function requestJson(path, method, body, options) {
    var fetchImpl = root && root.fetch;
    var apiBaseUrl = options && options.apiBaseUrl ? text(options.apiBaseUrl).replace(/\/+$/, "") : getApiBaseUrl();
    var dryRun = options && options.dryRun;

    if (typeof fetchImpl !== "function") {
      return Promise.resolve({
        ok: false,
        error: "fetch_unavailable"
      });
    }

    var headers = {
      "Content-Type": "application/json"
    };

    if (dryRun) {
      headers["X-AICM-Dry-Run"] = "true";
    }

    return fetchImpl(apiBaseUrl + path, {
      method: method || "GET",
      headers: headers,
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

  function loadGlobalOptions(roleCode, options) {
    var role = encodeURIComponent(text(roleCode));
    return requestJson(
      "/api/v1/business/aiworker/aicm/global-selector-options?role_code=" + role,
      "GET",
      null,
      options
    );
  }

  function loadCompanyOptions(companyId, roleCode, options) {
    var cid = encodeURIComponent(text(companyId));
    var role = encodeURIComponent(text(roleCode));
    return requestJson(
      "/api/v1/business/aiworker/aicm/company-selector-options?company_id=" + cid + "&role_code=" + role,
      "GET",
      null,
      options
    );
  }

  function grantEntitlement(grantPayload, options) {
    return requestJson(
      "/api/v1/business/aiworker/company-entitlement/grant",
      "POST",
      grantPayload,
      options
    );
  }

  function placeRobot(placementPayload, options) {
    return requestJson(
      "/api/v1/business/aiworker/company-robot/place",
      "POST",
      placementPayload,
      options
    );
  }

  function saveDraft(draft, options) {
    if (!draft || draft.ok === false) {
      return Promise.resolve({
        ok: false,
        error: "invalid_draft",
        draft: draft || null
      });
    }

    if (!draft.grantPayload || !draft.placementPayload) {
      return Promise.resolve({
        ok: false,
        error: "missing_payloads"
      });
    }

    return grantEntitlement(draft.grantPayload, options).then(function (grantResult) {
      if (!grantResult.ok) {
        return {
          ok: false,
          step: "grant",
          grantResult: grantResult
        };
      }

      return placeRobot(draft.placementPayload, options).then(function (placementResult) {
        if (!placementResult.ok) {
          return {
            ok: false,
            step: "place",
            grantResult: grantResult,
            placementResult: placementResult
          };
        }

        return {
          ok: true,
          displayLabel: draft.displayLabel || placementResult.display_label,
          grantResult: grantResult,
          placementResult: placementResult
        };
      });
    });
  }

  function writeOutput(message) {
    var output = root.document && root.document.querySelector("[data-aicm-aiworker-output='draft']");
    if (!output) return;

    output.textContent = typeof message === "string" ? message : JSON.stringify(message, null, 2);
  }

  function ensureSaveButton() {
    if (!root.document) return false;

    var panel = root.document.getElementById("aicm-business-aiworker-bridge-panel");
    if (!panel) return false;

    if (panel.querySelector("[data-aicm-aiworker-action='save-db']")) return true;

    var actionArea = panel.querySelector("[data-aicm-aiworker-action='build-draft']");
    if (!actionArea || !actionArea.parentNode) return false;

    var button = root.document.createElement("button");
    button.type = "button";
    button.setAttribute("data-aicm-aiworker-action", "save-db");
    button.textContent = "DB保存";
    button.style.padding = "8px 12px";
    button.style.borderRadius = "10px";
    button.style.border = "1px solid #1a7f37";
    button.style.background = "#1a7f37";
    button.style.color = "#fff";

    actionArea.parentNode.appendChild(button);
    return true;
  }

  function bindPanelSave() {
    if (!root.document) {
      return {
        ok: false,
        reason: "document_unavailable"
      };
    }

    ensureSaveButton();

    root.document.addEventListener("click", function (event) {
      var action = event.target && event.target.getAttribute("data-aicm-aiworker-action");

      if (action !== "save-db") return;

      var draft = buildDraftFromPanel();

      if (!draft || draft.ok === false) {
        writeOutput({
          ok: false,
          error: "draft_validation_failed",
          draft: draft
        });
        return;
      }

      writeOutput({
        ok: true,
        saving: true,
        draft: draft
      });

      saveDraft(draft, { dryRun: false }).then(function (result) {
        writeOutput(result);
      });
    });

    if (root.MutationObserver) {
      var observer = new root.MutationObserver(function () {
        ensureSaveButton();
      });

      observer.observe(root.document.body, {
        childList: true,
        subtree: true
      });
    }

    return {
      ok: true,
      bound: true
    };
  }

  function buildSmokeDraft() {
    return {
      ok: true,
      displayLabel: "社長AI@President",
      grantPayload: {
        company_id: "00000000-0000-4000-8000-000000000001",
        aiworker_model_code: "HD-R5",
        quantity: 1,
        business_offer_code: "standard",
        entitlement_scope_code: "company",
        assignment_mode_code: "unlimited_placement"
      },
      placementPayload: {
        company_id: "00000000-0000-4000-8000-000000000001",
        aiworker_model_code: "HD-R5",
        target_level_code: "company",
        target_id: "",
        app_code: "AICompanyManager",
        role_code: "President",
        internal_nickname: "社長AI",
        placement_quantity: 1,
        metadata_jsonb: {
          source: "node_smoke"
        }
      }
    };
  }

  if (root && root.document) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bindPanelSave);
    } else {
      bindPanelSave();
    }
  }

  return {
    DEFAULT_API_BASE_URL: DEFAULT_API_BASE_URL,
    getApiBaseUrl: getApiBaseUrl,
    readPanelState: readPanelState,
    buildDraftFromPanel: buildDraftFromPanel,
    requestJson: requestJson,
    loadGlobalOptions: loadGlobalOptions,
    loadCompanyOptions: loadCompanyOptions,
    grantEntitlement: grantEntitlement,
    placeRobot: placeRobot,
    saveDraft: saveDraft,
    ensureSaveButton: ensureSaveButton,
    bindPanelSave: bindPanelSave,
    buildSmokeDraft: buildSmokeDraft
  };
});
