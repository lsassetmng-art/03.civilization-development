(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(typeof globalThis !== "undefined" ? globalThis : undefined);
  } else {
    root.AICMBusinessAIWorkerScreenFilter = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  var DEFAULT_API_BASE_URL = "http://127.0.0.1:8796";
  var DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-1db11893cb24";

  var SCREEN_ROUTES = [
    {
      routeCode: "company_settings_president",
      screenLabel: "AI企業設定",
      targetLevelCode: "company",
      roleCode: "President",
      defaultModelCode: "HD-R5",
      defaultInternalNickname: "社長AI"
    },
    {
      routeCode: "department_detail_manager",
      screenLabel: "部門詳細",
      targetLevelCode: "department",
      roleCode: "Manager",
      defaultModelCode: "HD-R4",
      defaultInternalNickname: "部門長AI"
    },
    {
      routeCode: "section_detail_leader",
      screenLabel: "課詳細",
      targetLevelCode: "section",
      roleCode: "Leader",
      defaultModelCode: "HD-R4",
      defaultInternalNickname: "課長AI"
    },
    {
      routeCode: "section_worker_placement",
      screenLabel: "Worker配置",
      targetLevelCode: "section",
      roleCode: "Worker",
      defaultModelCode: "HD-R3",
      defaultInternalNickname: "ワーカーAI"
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

  function getApiBaseUrl(options) {
    if (options && options.apiBaseUrl) {
      return text(options.apiBaseUrl).replace(/\/+$/, "");
    }

    if (root && root.AICM_BUSINESS_AIWORKER_SCREEN_FILTER_API_BASE_URL) {
      return text(root.AICM_BUSINESS_AIWORKER_SCREEN_FILTER_API_BASE_URL).replace(/\/+$/, "");
    }

    try {
      var stored = root && root.localStorage
        ? root.localStorage.getItem("aicm_business_aiworker_screen_filter_api_base_url")
        : "";
      if (stored) return text(stored).replace(/\/+$/, "");
    } catch (error) {
      /* ignore */
    }

    return DEFAULT_API_BASE_URL;
  }

  function requestJson(path, options) {
    var fetchImpl = root && root.fetch;
    var apiBaseUrl = getApiBaseUrl(options || {});

    if (typeof fetchImpl !== "function") {
      return Promise.resolve({
        ok: false,
        error: "fetch_unavailable"
      });
    }

    return fetchImpl(apiBaseUrl + path, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
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

  function getRoute(routeCode) {
    var code = text(routeCode);
    for (var i = 0; i < SCREEN_ROUTES.length; i += 1) {
      if (SCREEN_ROUTES[i].routeCode === code) return SCREEN_ROUTES[i];
    }
    return null;
  }

  function buildFilter(routeCode, overrides) {
    var route = getRoute(routeCode) || SCREEN_ROUTES[0];
    var extra = overrides || {};

    return {
      routeCode: route.routeCode,
      screenLabel: route.screenLabel,
      companyId: text(extra.companyId || extra.company_id || DEFAULT_COMPANY_ID),
      targetLevelCode: text(extra.targetLevelCode || extra.target_level_code || route.targetLevelCode),
      targetId: text(extra.targetId || extra.target_id || ""),
      roleCode: text(extra.roleCode || extra.role_code || route.roleCode),
      statusCode: text(extra.statusCode || extra.status_code || "active")
    };
  }

  function loadFilteredPlacements(routeCode, overrides, options) {
    var filter = buildFilter(routeCode, overrides || {});
    var params = [
      "company_id=" + encodeURIComponent(filter.companyId),
      "role_code=" + encodeURIComponent(filter.roleCode),
      "target_level_code=" + encodeURIComponent(filter.targetLevelCode),
      "target_id=" + encodeURIComponent(filter.targetId),
      "status_code=" + encodeURIComponent(filter.statusCode)
    ].join("&");

    return requestJson("/api/v1/business/aiworker/aicm/placements-filtered?" + params, options)
      .then(function (result) {
        result.localFilter = filter;
        return result;
      });
  }

  function normalizePlacement(row) {
    var source = row || {};
    return {
      companyRobotPlacementId: text(source.company_robot_placement_id || source.companyRobotPlacementId),
      targetLevelCode: text(source.target_level_code || source.targetLevelCode),
      targetId: text(source.target_id || source.targetId),
      roleCode: text(source.role_code || source.roleCode),
      internalNickname: text(source.internal_nickname || source.internalNickname),
      displayLabel: text(source.display_label || source.displayLabel),
      aiworkerModelCode: text(source.aiworker_model_code || source.aiworkerModelCode),
      selectorLabel: text(source.selector_label || source.selectorLabel),
      statusCode: text(source.status_code || source.statusCode),
      updatedAt: text(source.updated_at || source.updatedAt)
    };
  }

  function renderPlacementItems(items) {
    var rows = Array.isArray(items) ? items.map(normalizePlacement) : [];

    if (!rows.length) {
      return '<p style="margin:8px 0;color:#57606a;">この画面条件に一致する保存済み配置はありません。</p>';
    }

    return rows.map(function (row) {
      return [
        '<div style="border:1px solid #d0d7de;border-radius:10px;background:#fff;padding:10px;margin:8px 0;">',
        '<strong>' + escapeHtml(row.displayLabel || (row.internalNickname + "@" + row.roleCode)) + '</strong>',
        '<div style="font-size:12px;color:#57606a;">' + escapeHtml(row.selectorLabel || row.aiworkerModelCode) + '</div>',
        '<div style="font-size:12px;color:#57606a;">target=' + escapeHtml(row.targetLevelCode) + ' / role=' + escapeHtml(row.roleCode) + ' / status=' + escapeHtml(row.statusCode) + '</div>',
        '</div>'
      ].join("");
    }).join("");
  }

  function buildRouteCardHtml(route) {
    return [
      '<article data-aicm-screen-filter-route="' + escapeHtml(route.routeCode) + '" style="border:1px solid #d0d7de;border-radius:12px;padding:12px;background:#fff;">',
      '<h3 style="margin:0 0 4px;font-size:15px;">' + escapeHtml(route.screenLabel) + '</h3>',
      '<div style="font-size:12px;color:#57606a;margin-bottom:8px;">target=' + escapeHtml(route.targetLevelCode) + ' / role=' + escapeHtml(route.roleCode) + '</div>',
      '<button type="button" data-aicm-screen-filter-action="load" data-route-code="' + escapeHtml(route.routeCode) + '" style="padding:7px 10px;border-radius:9px;border:1px solid #0969da;background:#0969da;color:#fff;">表示</button>',
      '<div data-aicm-screen-filter-output="' + escapeHtml(route.routeCode) + '" style="margin-top:8px;"></div>',
      '</article>'
    ].join("");
  }

  function buildPanelHtml(state) {
    var companyId = text(state && state.companyId) || DEFAULT_COMPANY_ID;
    var targetId = text(state && state.targetId) || "";
    var cards = SCREEN_ROUTES.map(buildRouteCardHtml).join("");

    return [
      '<section id="aicm-business-aiworker-screen-filter-panel" style="border:1px solid #d0d7de;border-radius:12px;padding:16px;margin:16px 0;background:#f6f8fa;">',
      '<h2 style="margin:0 0 8px;font-size:18px;">画面別ロボット配置フィルタ</h2>',
      '<p style="margin:0 0 12px;color:#57606a;font-size:13px;">AI企業設定・部門詳細・課詳細・Worker配置ごとに、保存済みロボット配置を絞り込みます。</p>',
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:12px;">',
      '<label style="display:block;font-size:13px;">会社ID',
      '<input data-aicm-screen-filter-field="companyId" value="' + escapeHtml(companyId) + '" style="width:100%;box-sizing:border-box;padding:8px;margin-top:4px;">',
      '</label>',
      '<label style="display:block;font-size:13px;">対象ID',
      '<input data-aicm-screen-filter-field="targetId" value="' + escapeHtml(targetId) + '" placeholder="画面対象ID。空ならtarget_id無指定" style="width:100%;box-sizing:border-box;padding:8px;margin-top:4px;">',
      '</label>',
      '</div>',
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">',
      cards,
      '</div>',
      '</section>'
    ].join("");
  }

  function ensureMount() {
    if (!root || !root.document) return null;

    var existing = root.document.getElementById("aicm-business-aiworker-screen-filter-root");
    if (existing) return existing;

    var rootEl = root.document.createElement("div");
    rootEl.id = "aicm-business-aiworker-screen-filter-root";

    var routeRoot = root.document.getElementById("aicm-business-aiworker-route-integration-root");
    if (routeRoot && routeRoot.parentNode) {
      routeRoot.parentNode.insertBefore(rootEl, routeRoot.nextSibling);
      return rootEl;
    }

    var placementRoot = root.document.getElementById("aicm-business-aiworker-placement-root");
    if (placementRoot && placementRoot.parentNode) {
      placementRoot.parentNode.insertBefore(rootEl, placementRoot);
      return rootEl;
    }

    var main = root.document.querySelector("main") || root.document.body;
    main.appendChild(rootEl);
    return rootEl;
  }

  function readPanelState(panel) {
    var state = {
      companyId: DEFAULT_COMPANY_ID,
      targetId: ""
    };

    if (!panel) return state;

    var fields = panel.querySelectorAll("[data-aicm-screen-filter-field]");
    Array.prototype.forEach.call(fields, function (field) {
      var key = field.getAttribute("data-aicm-screen-filter-field");
      state[key] = field.value;
    });

    return state;
  }

  function render(rootEl, state) {
    rootEl.innerHTML = buildPanelHtml(state || {});

    var panel = rootEl.querySelector("#aicm-business-aiworker-screen-filter-panel");

    panel.addEventListener("click", function (event) {
      var action = event.target && event.target.getAttribute("data-aicm-screen-filter-action");
      if (action !== "load") return;

      var routeCode = event.target.getAttribute("data-route-code");
      var current = readPanelState(panel);
      var output = panel.querySelector("[data-aicm-screen-filter-output='" + routeCode + "']");

      if (output) {
        output.innerHTML = '<pre style="white-space:pre-wrap;background:#f6f8fa;border-radius:10px;padding:10px;">読み込み中...</pre>';
      }

      loadFilteredPlacements(routeCode, current).then(function (result) {
        if (!output) return;

        if (!result.ok) {
          output.innerHTML = '<pre style="white-space:pre-wrap;background:#fff5f5;border-radius:10px;padding:10px;">' + escapeHtml(JSON.stringify(result, null, 2)) + '</pre>';
          return;
        }

        output.innerHTML = renderPlacementItems(result.items || []);
      });
    });
  }

  function init(customState) {
    var rootEl = ensureMount();
    if (!rootEl) {
      return {
        ok: false,
        reason: "document_unavailable"
      };
    }

    render(rootEl, customState || {});
    return {
      ok: true,
      mounted: true,
      rootId: rootEl.id
    };
  }

  function buildSmokeFilters() {
    return SCREEN_ROUTES.map(function (route) {
      return buildFilter(route.routeCode, {
        companyId: DEFAULT_COMPANY_ID,
        targetId: ""
      });
    });
  }

  if (root && root.document) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        init();
      });
    } else {
      init();
    }
  }

  return {
    DEFAULT_API_BASE_URL: DEFAULT_API_BASE_URL,
    DEFAULT_COMPANY_ID: DEFAULT_COMPANY_ID,
    SCREEN_ROUTES: SCREEN_ROUTES,
    getRoute: getRoute,
    buildFilter: buildFilter,
    loadFilteredPlacements: loadFilteredPlacements,
    normalizePlacement: normalizePlacement,
    renderPlacementItems: renderPlacementItems,
    buildRouteCardHtml: buildRouteCardHtml,
    buildPanelHtml: buildPanelHtml,
    init: init,
    buildSmokeFilters: buildSmokeFilters
  };
});
