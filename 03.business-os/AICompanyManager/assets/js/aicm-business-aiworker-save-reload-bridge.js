(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(typeof globalThis !== "undefined" ? globalThis : undefined);
  } else {
    root.AICMBusinessAIWorkerSaveReloadBridge = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  var DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-1db11893cb24";
  var ROUTE_CONTEXT_KEY = "aicm_business_aiworker_route_context";
  var LAST_RELOAD_KEY = "aicm_business_aiworker_last_reload_result";

  function text(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeJsonParse(value) {
    try {
      return {
        ok: true,
        value: JSON.parse(value)
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  function readRouteContext() {
    if (!root || !root.localStorage) {
      return {
        ok: false,
        reason: "localStorage_unavailable",
        routeCode: "company_settings_president",
        state: {
          companyId: DEFAULT_COMPANY_ID
        }
      };
    }

    var raw = "";

    try {
      raw = root.localStorage.getItem(ROUTE_CONTEXT_KEY) || "";
    } catch (error) {
      return {
        ok: false,
        reason: "localStorage_read_failed",
        error: error.message,
        routeCode: "company_settings_president",
        state: {
          companyId: DEFAULT_COMPANY_ID
        }
      };
    }

    if (!raw) {
      return {
        ok: false,
        reason: "route_context_missing",
        routeCode: "company_settings_president",
        state: {
          companyId: DEFAULT_COMPANY_ID
        }
      };
    }

    var parsed = safeJsonParse(raw);

    if (!parsed.ok || !parsed.value) {
      return {
        ok: false,
        reason: "route_context_invalid_json",
        routeCode: "company_settings_president",
        state: {
          companyId: DEFAULT_COMPANY_ID
        }
      };
    }

    return {
      ok: true,
      routeCode: text(parsed.value.routeCode || "company_settings_president"),
      state: parsed.value.state || {
        companyId: DEFAULT_COMPANY_ID
      },
      savedAt: parsed.value.savedAt || ""
    };
  }

  function isSaveSuccessPayload(payload) {
    if (!payload || payload.ok !== true) return false;

    if (payload.placementResult && payload.placementResult.ok === true) {
      return true;
    }

    if (payload.company_robot_placement_id) {
      return true;
    }

    if (payload.displayLabel && payload.grantResult && payload.placementResult) {
      return true;
    }

    return false;
  }

  function readSaveOutputPayload() {
    if (!root || !root.document) {
      return {
        ok: false,
        reason: "document_unavailable"
      };
    }

    var output = root.document.querySelector("[data-aicm-aiworker-output='draft']");
    if (!output) {
      return {
        ok: false,
        reason: "save_output_not_found"
      };
    }

    var raw = text(output.textContent || output.innerText || "");
    var parsed = safeJsonParse(raw);

    if (!parsed.ok) {
      return {
        ok: false,
        reason: "output_not_json",
        raw: raw
      };
    }

    return {
      ok: true,
      payload: parsed.value
    };
  }

  function findScreenFilterOutput(routeCode) {
    if (!root || !root.document) return null;
    return root.document.querySelector("[data-aicm-screen-filter-output='" + routeCode + "']");
  }

  function writeScreenFilterOutput(routeCode, content, isHtml) {
    var output = findScreenFilterOutput(routeCode);
    if (!output) return false;

    if (isHtml) {
      output.innerHTML = content;
    } else {
      output.innerHTML = '<pre style="white-space:pre-wrap;background:#f6f8fa;border-radius:10px;padding:10px;">' + escapeHtml(content) + '</pre>';
    }

    return true;
  }

  function buildReloadFilter(routeContext) {
    var state = routeContext && routeContext.state ? routeContext.state : {};

    return {
      routeCode: text(routeContext && routeContext.routeCode) || "company_settings_president",
      companyId: text(state.companyId || state.company_id || DEFAULT_COMPANY_ID),
      targetId: text(state.targetId || state.target_id || "")
    };
  }

  function saveReloadResult(result) {
    try {
      if (root && root.localStorage) {
        root.localStorage.setItem(LAST_RELOAD_KEY, JSON.stringify(result));
      }
    } catch (error) {
      /* ignore */
    }
  }

  function reloadCurrentScreenList(options) {
    var screenFilter = root && root.AICMBusinessAIWorkerScreenFilter;
    var routeContext = readRouteContext();
    var filter = buildReloadFilter(routeContext);

    if (!screenFilter || typeof screenFilter.loadFilteredPlacements !== "function") {
      var missing = {
        ok: false,
        reason: "screen_filter_client_unavailable",
        filter: filter
      };
      saveReloadResult(missing);
      return Promise.resolve(missing);
    }

    writeScreenFilterOutput(filter.routeCode, "保存後の再読み込み中...", false);

    return screenFilter.loadFilteredPlacements(
      filter.routeCode,
      {
        companyId: filter.companyId,
        targetId: filter.targetId
      },
      options || {}
    ).then(function (result) {
      var finalResult = {
        ok: result && result.ok === true,
        routeCode: filter.routeCode,
        filter: filter,
        result: result
      };

      if (result && result.ok === true && typeof screenFilter.renderPlacementItems === "function") {
        writeScreenFilterOutput(filter.routeCode, screenFilter.renderPlacementItems(result.items || []), true);
      } else {
        writeScreenFilterOutput(filter.routeCode, JSON.stringify(result, null, 2), false);
      }

      saveReloadResult(finalResult);
      return finalResult;
    }).catch(function (error) {
      var failed = {
        ok: false,
        reason: "reload_failed",
        detail: error.message,
        filter: filter
      };
      writeScreenFilterOutput(filter.routeCode, JSON.stringify(failed, null, 2), false);
      saveReloadResult(failed);
      return failed;
    });
  }

  function ensureManualReloadButton() {
    if (!root || !root.document) return false;

    var panel = root.document.getElementById("aicm-business-aiworker-route-integration-panel");
    if (!panel) {
      panel = root.document.getElementById("aicm-business-aiworker-screen-filter-panel");
    }

    if (!panel) return false;

    if (panel.querySelector("[data-aicm-aiworker-reload-action='reload-current-screen']")) {
      return true;
    }

    var button = root.document.createElement("button");
    button.type = "button";
    button.setAttribute("data-aicm-aiworker-reload-action", "reload-current-screen");
    button.textContent = "保存後リスト再読込";
    button.style.padding = "8px 12px";
    button.style.borderRadius = "10px";
    button.style.border = "1px solid #0969da";
    button.style.background = "#fff";
    button.style.color = "#0969da";
    button.style.margin = "8px 8px 0 0";

    panel.appendChild(button);
    return true;
  }

  function bindManualReload() {
    if (!root || !root.document) {
      return {
        ok: false,
        reason: "document_unavailable"
      };
    }

    root.document.addEventListener("click", function (event) {
      var action = event.target && event.target.getAttribute("data-aicm-aiworker-reload-action");
      if (action !== "reload-current-screen") return;

      reloadCurrentScreenList();
    });

    return {
      ok: true,
      bound: true
    };
  }

  function handleSaveOutputMutation() {
    var read = readSaveOutputPayload();

    if (!read.ok || !isSaveSuccessPayload(read.payload)) {
      return {
        ok: false,
        reason: read.reason || "not_save_success"
      };
    }

    return reloadCurrentScreenList();
  }

  function observeSaveOutput() {
    if (!root || !root.document || !root.MutationObserver) {
      return {
        ok: false,
        reason: "mutation_observer_unavailable"
      };
    }

    var output = root.document.querySelector("[data-aicm-aiworker-output='draft']");
    if (!output) {
      return {
        ok: false,
        reason: "save_output_not_found"
      };
    }

    var lastText = "";

    var observer = new root.MutationObserver(function () {
      var current = text(output.textContent || output.innerText || "");
      if (!current || current === lastText) return;
      lastText = current;

      var read = safeJsonParse(current);
      if (!read.ok || !isSaveSuccessPayload(read.value)) return;

      reloadCurrentScreenList();
    });

    observer.observe(output, {
      childList: true,
      characterData: true,
      subtree: true
    });

    return {
      ok: true,
      observed: true
    };
  }

  function init() {
    if (!root || !root.document) {
      return {
        ok: false,
        reason: "document_unavailable"
      };
    }

    ensureManualReloadButton();
    bindManualReload();

    var observeResult = observeSaveOutput();

    if (root.MutationObserver) {
      var mountObserver = new root.MutationObserver(function () {
        ensureManualReloadButton();

        var output = root.document.querySelector("[data-aicm-aiworker-output='draft']");
        if (output && observeResult && observeResult.ok !== true) {
          observeResult = observeSaveOutput();
        }
      });

      mountObserver.observe(root.document.body, {
        childList: true,
        subtree: true
      });
    }

    return {
      ok: true,
      initialized: true,
      observeResult: observeResult
    };
  }

  function buildSmokeSaveSuccessPayload() {
    return {
      ok: true,
      displayLabel: "社長AI@President",
      grantResult: {
        ok: true,
        company_robot_entitlement_id: "00000000-0000-4000-8000-000000000701"
      },
      placementResult: {
        ok: true,
        company_robot_placement_id: "00000000-0000-4000-8000-000000000702",
        display_label: "社長AI@President"
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
    DEFAULT_COMPANY_ID: DEFAULT_COMPANY_ID,
    ROUTE_CONTEXT_KEY: ROUTE_CONTEXT_KEY,
    LAST_RELOAD_KEY: LAST_RELOAD_KEY,
    safeJsonParse: safeJsonParse,
    readRouteContext: readRouteContext,
    isSaveSuccessPayload: isSaveSuccessPayload,
    readSaveOutputPayload: readSaveOutputPayload,
    buildReloadFilter: buildReloadFilter,
    reloadCurrentScreenList: reloadCurrentScreenList,
    ensureManualReloadButton: ensureManualReloadButton,
    handleSaveOutputMutation: handleSaveOutputMutation,
    observeSaveOutput: observeSaveOutput,
    init: init,
    buildSmokeSaveSuccessPayload: buildSmokeSaveSuccessPayload
  };
});
