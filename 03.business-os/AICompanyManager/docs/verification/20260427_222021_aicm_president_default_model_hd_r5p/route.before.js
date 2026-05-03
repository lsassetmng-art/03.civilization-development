(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(typeof globalThis !== "undefined" ? globalThis : undefined);
  } else {
    root.AICMBusinessAIWorkerRouteIntegration = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  var DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-1db11893cb24";

  var ROUTE_DEFINITIONS = [
    {
      routeCode: "company_settings_president",
      title: "AI企業設定",
      subtitle: "President robot / 社長ロボット",
      description: "AI企業設定で、会社方針を受ける President ロボットを設定します。",
      targetLevelCode: "company",
      roleCode: "President",
      defaultNickname: "社長AI",
      defaultModelCode: "HD-R5",
      badge: "company"
    },
    {
      routeCode: "department_detail_manager",
      title: "部門詳細",
      subtitle: "Manager robot / 部門長ロボット",
      description: "部門詳細で、部門を統括する Manager ロボットを設定します。",
      targetLevelCode: "department",
      roleCode: "Manager",
      defaultNickname: "部門長AI",
      defaultModelCode: "HD-R4",
      badge: "department"
    },
    {
      routeCode: "section_detail_leader",
      title: "課詳細",
      subtitle: "Leader robot / 課長・リーダーロボット",
      description: "課詳細で、課を統括する Leader ロボットを設定します。",
      targetLevelCode: "section",
      roleCode: "Leader",
      defaultNickname: "課長AI",
      defaultModelCode: "HD-R4",
      badge: "section"
    },
    {
      routeCode: "section_worker_placement",
      title: "Worker配置",
      subtitle: "Worker robot / 実行ワーカー",
      description: "課・部門に実行担当 Worker ロボットを追加配置します。",
      targetLevelCode: "section",
      roleCode: "Worker",
      defaultNickname: "ワーカーAI",
      defaultModelCode: "HD-R3",
      badge: "worker"
    }
  ];

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

  function getRouteDefinition(routeCode) {
    var code = text(routeCode);
    for (var i = 0; i < ROUTE_DEFINITIONS.length; i += 1) {
      if (ROUTE_DEFINITIONS[i].routeCode === code) return ROUTE_DEFINITIONS[i];
    }
    return null;
  }

  function buildBridgeState(routeCode, overrides) {
    var route = getRouteDefinition(routeCode) || ROUTE_DEFINITIONS[0];
    var extra = overrides || {};

    return {
      companyId: text(extra.companyId || extra.company_id || DEFAULT_COMPANY_ID),
      targetLevelCode: text(extra.targetLevelCode || extra.target_level_code || route.targetLevelCode),
      targetId: text(extra.targetId || extra.target_id || ""),
      roleCode: text(extra.roleCode || extra.role_code || route.roleCode),
      internalNickname: text(extra.internalNickname || extra.internal_nickname || route.defaultNickname),
      aiworkerModelCode: text(extra.aiworkerModelCode || extra.aiworker_model_code || route.defaultModelCode),
      lastDraft: null
    };
  }

  function saveRouteContext(routeCode, state) {
    var payload = {
      routeCode: routeCode,
      state: state,
      savedAt: new Date().toISOString()
    };

    try {
      if (root && root.localStorage) {
        root.localStorage.setItem("aicm_business_aiworker_route_context", JSON.stringify(payload));
      }
    } catch (error) {
      /* localStorage may be unavailable */
    }

    return payload;
  }

  function applyStateToExistingBridgePanel(state) {
    if (!root || !root.document) {
      return {
        ok: false,
        reason: "document_unavailable"
      };
    }

    var panel = root.document.getElementById("aicm-business-aiworker-bridge-panel");
    if (!panel) {
      return {
        ok: false,
        reason: "bridge_panel_not_found"
      };
    }

    var map = {
      companyId: state.companyId,
      targetLevelCode: state.targetLevelCode,
      targetId: state.targetId,
      roleCode: state.roleCode,
      internalNickname: state.internalNickname,
      aiworkerModelCode: state.aiworkerModelCode
    };

    Object.keys(map).forEach(function (key) {
      var field = panel.querySelector("[data-aicm-aiworker-field='" + key + "']");
      if (field) {
        field.value = map[key];
        try {
          field.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (error) {
          /* older runtime fallback */
        }
      }
    });

    return {
      ok: true,
      applied: true
    };
  }

  function openRobotSetting(routeCode, overrides) {
    var state = buildBridgeState(routeCode, overrides || {});
    saveRouteContext(routeCode, state);

    var bridgeResult = {
      ok: false,
      reason: "bridge_unavailable"
    };

    if (root && root.AICMBusinessAIWorkerBridge && typeof root.AICMBusinessAIWorkerBridge.init === "function") {
      bridgeResult = root.AICMBusinessAIWorkerBridge.init(state);
    }

    var applyResult = applyStateToExistingBridgePanel(state);

    scrollToBridgePanel();

    return {
      ok: true,
      routeCode: routeCode,
      state: state,
      bridgeResult: bridgeResult,
      applyResult: applyResult
    };
  }

  function scrollToBridgePanel() {
    if (!root || !root.document) return false;

    var target =
      root.document.getElementById("aicm-business-aiworker-bridge-panel") ||
      root.document.getElementById("aicm-business-aiworker-bridge-root");

    if (!target) return false;

    if (typeof target.scrollIntoView === "function") {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    return true;
  }

  function buildRouteCardHtml(route) {
    return [
      '<article data-aicm-aiworker-route-card="' + escapeHtml(route.routeCode) + '" style="border:1px solid #d0d7de;border-radius:12px;padding:14px;background:#fff;">',
      '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">',
      '<div>',
      '<div style="font-size:12px;color:#57606a;">' + escapeHtml(route.badge) + '</div>',
      '<h3 style="margin:2px 0 4px;font-size:16px;">' + escapeHtml(route.title) + '</h3>',
      '<div style="font-size:13px;font-weight:600;">' + escapeHtml(route.subtitle) + '</div>',
      '</div>',
      '<span style="font-size:12px;border:1px solid #d0d7de;border-radius:999px;padding:3px 8px;background:#f6f8fa;">' + escapeHtml(route.roleCode) + '</span>',
      '</div>',
      '<p style="font-size:13px;color:#57606a;line-height:1.5;margin:10px 0;">' + escapeHtml(route.description) + '</p>',
      '<div style="font-size:12px;color:#57606a;margin-bottom:10px;">',
      'target=' + escapeHtml(route.targetLevelCode) + ' / model=' + escapeHtml(route.defaultModelCode),
      '</div>',
      '<button type="button" data-aicm-aiworker-route-action="open" data-route-code="' + escapeHtml(route.routeCode) + '" style="padding:8px 12px;border-radius:10px;border:1px solid #0969da;background:#0969da;color:#fff;">',
      'ロボット設定を開く',
      '</button>',
      '</article>'
    ].join("");
  }

  function buildRouteIntegrationHtml() {
    var cards = ROUTE_DEFINITIONS.map(buildRouteCardHtml).join("");

    return [
      '<section id="aicm-business-aiworker-route-integration-panel" style="border:1px solid #d0d7de;border-radius:12px;padding:16px;margin:16px 0;background:#f6f8fa;">',
      '<h2 style="margin:0 0 8px;font-size:18px;">AICompanyManager ロボット設定導線</h2>',
      '<p style="margin:0 0 12px;color:#57606a;font-size:13px;">AI企業設定・部門詳細・課詳細から BusinessOS AIWorker のロボット配置へ接続します。</p>',
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">',
      cards,
      '</div>',
      '<pre data-aicm-aiworker-route-output="result" style="white-space:pre-wrap;word-break:break-word;background:#fff;border-radius:10px;padding:12px;margin-top:12px;max-height:260px;overflow:auto;font-size:12px;">導線を選択してください。</pre>',
      '</section>'
    ].join("");
  }

  function ensureMount() {
    if (!root || !root.document) return null;

    var existing = root.document.getElementById("aicm-business-aiworker-route-integration-root");
    if (existing) return existing;

    var rootEl = root.document.createElement("div");
    rootEl.id = "aicm-business-aiworker-route-integration-root";

    var placementRoot = root.document.getElementById("aicm-business-aiworker-placement-root");
    if (placementRoot && placementRoot.parentNode) {
      placementRoot.parentNode.insertBefore(rootEl, placementRoot);
      return rootEl;
    }

    var bridgeRoot = root.document.getElementById("aicm-business-aiworker-bridge-root");
    if (bridgeRoot && bridgeRoot.parentNode) {
      bridgeRoot.parentNode.insertBefore(rootEl, bridgeRoot);
      return rootEl;
    }

    var main = root.document.querySelector("main") || root.document.body;
    if (main.firstChild) {
      main.insertBefore(rootEl, main.firstChild);
    } else {
      main.appendChild(rootEl);
    }

    return rootEl;
  }

  function render(rootEl) {
    rootEl.innerHTML = buildRouteIntegrationHtml();

    var panel = rootEl.querySelector("#aicm-business-aiworker-route-integration-panel");
    panel.addEventListener("click", function (event) {
      var action = event.target && event.target.getAttribute("data-aicm-aiworker-route-action");
      if (action !== "open") return;

      var routeCode = event.target.getAttribute("data-route-code");
      var result = openRobotSetting(routeCode, {});
      var output = panel.querySelector("[data-aicm-aiworker-route-output='result']");

      if (output) {
        output.textContent = JSON.stringify(result, null, 2);
      }
    });
  }

  function init() {
    var rootEl = ensureMount();
    if (!rootEl) {
      return {
        ok: false,
        reason: "document_unavailable"
      };
    }

    render(rootEl);

    return {
      ok: true,
      mounted: true,
      rootId: rootEl.id
    };
  }

  function buildSmokeRouteResult() {
    return openRobotSetting("company_settings_president", {
      companyId: DEFAULT_COMPANY_ID
    });
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
    ROUTE_DEFINITIONS: ROUTE_DEFINITIONS,
    getRouteDefinition: getRouteDefinition,
    buildBridgeState: buildBridgeState,
    saveRouteContext: saveRouteContext,
    openRobotSetting: openRobotSetting,
    buildRouteCardHtml: buildRouteCardHtml,
    buildRouteIntegrationHtml: buildRouteIntegrationHtml,
    init: init,
    buildSmokeRouteResult: buildSmokeRouteResult
  };
});
