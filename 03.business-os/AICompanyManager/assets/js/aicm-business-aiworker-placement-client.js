(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(typeof globalThis !== "undefined" ? globalThis : undefined);
  } else {
    root.AICMBusinessAIWorkerPlacementClient = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  var DEFAULT_API_BASE_URL = "http://127.0.0.1:8789";
  var DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-1db11893cb24";

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

  function requestJson(path, method, body, options) {
    var fetchImpl = root && root.fetch;
    var apiBaseUrl = getApiBaseUrl(options || {});
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

  function listPlacements(companyId, statusCode, options) {
    var cid = encodeURIComponent(text(companyId || DEFAULT_COMPANY_ID));
    var status = encodeURIComponent(text(statusCode || ""));
    return requestJson(
      "/api/v1/business/aiworker/aicm/placements?company_id=" + cid + "&status_code=" + status,
      "GET",
      null,
      options
    );
  }

  function updatePlacement(payload, options) {
    return requestJson(
      "/api/v1/business/aiworker/company-robot/update",
      "POST",
      payload,
      options
    );
  }

  function deactivatePlacement(placementId, reason, options) {
    return requestJson(
      "/api/v1/business/aiworker/company-robot/deactivate",
      "POST",
      {
        company_robot_placement_id: placementId,
        reason: reason || "manual_deactivate",
        metadata_patch_jsonb: {
          source: "AICompanyManagerPlacementClient"
        }
      },
      options
    );
  }

  function normalizePlacement(row) {
    var source = row || {};
    return {
      companyRobotPlacementId: text(source.company_robot_placement_id || source.companyRobotPlacementId),
      companyId: text(source.company_id || source.companyId),
      targetLevelCode: text(source.target_level_code || source.targetLevelCode),
      targetId: text(source.target_id || source.targetId),
      appCode: text(source.app_code || source.appCode),
      roleCode: text(source.role_code || source.roleCode),
      internalNickname: text(source.internal_nickname || source.internalNickname),
      displayLabel: text(source.display_label || source.displayLabel),
      aiworkerModelCode: text(source.aiworker_model_code || source.aiworkerModelCode),
      modelDisplayName: text(source.model_display_name || source.modelDisplayName),
      selectorLabel: text(source.selector_label || source.selectorLabel),
      statusCode: text(source.status_code || source.statusCode),
      updatedAt: text(source.updated_at || source.updatedAt)
    };
  }

  function renderPlacementListHtml(items) {
    var rows = Array.isArray(items) ? items.map(normalizePlacement) : [];

    if (!rows.length) {
      return '<p style="margin:8px 0;color:#57606a;">保存済みロボット配置はまだありません。</p>';
    }

    return rows.map(function (row) {
      return [
        '<div data-aicm-aiworker-placement-id="' + escapeHtml(row.companyRobotPlacementId) + '" style="border:1px solid #d0d7de;border-radius:10px;padding:10px;margin:8px 0;background:#fff;">',
        '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;flex-wrap:wrap;">',
        '<div>',
        '<strong>' + escapeHtml(row.displayLabel || (row.internalNickname + "@" + row.roleCode)) + '</strong>',
        '<div style="font-size:12px;color:#57606a;">' + escapeHtml(row.selectorLabel || row.aiworkerModelCode) + '</div>',
        '<div style="font-size:12px;color:#57606a;">target=' + escapeHtml(row.targetLevelCode) + ' / status=' + escapeHtml(row.statusCode) + '</div>',
        '</div>',
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">',
        '<button type="button" data-aicm-aiworker-placement-action="edit" data-placement-id="' + escapeHtml(row.companyRobotPlacementId) + '" style="padding:6px 10px;border-radius:8px;border:1px solid #d0d7de;background:#f6f8fa;">編集</button>',
        '<button type="button" data-aicm-aiworker-placement-action="deactivate" data-placement-id="' + escapeHtml(row.companyRobotPlacementId) + '" style="padding:6px 10px;border-radius:8px;border:1px solid #cf222e;background:#cf222e;color:#fff;">解除</button>',
        '</div>',
        '</div>',
        '</div>'
      ].join("");
    }).join("");
  }

  function buildPanelHtml(state) {
    var companyId = text(state && state.companyId) || DEFAULT_COMPANY_ID;
    var statusCode = text(state && state.statusCode) || "active";
    var output = state && state.output ? state.output : "未読み込み";

    return [
      '<section id="aicm-business-aiworker-placement-panel" style="border:1px solid #d0d7de;border-radius:12px;padding:16px;margin:16px 0;background:#fff;">',
      '<h2 style="margin:0 0 8px;font-size:18px;">保存済みロボット配置</h2>',
      '<p style="margin:0 0 12px;color:#57606a;font-size:13px;">BusinessOS _aiworker から AICompanyManager 用配置を一覧表示します。</p>',
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">',
      '<label style="display:block;font-size:13px;">会社ID',
      '<input data-aicm-aiworker-placement-field="companyId" value="' + escapeHtml(companyId) + '" style="width:100%;box-sizing:border-box;padding:8px;margin-top:4px;">',
      '</label>',
      '<label style="display:block;font-size:13px;">状態',
      '<select data-aicm-aiworker-placement-field="statusCode" style="width:100%;box-sizing:border-box;padding:8px;margin-top:4px;">',
      '<option value="active"' + (statusCode === "active" ? " selected" : "") + '>active</option>',
      '<option value="inactive"' + (statusCode === "inactive" ? " selected" : "") + '>inactive</option>',
      '<option value=""' + (statusCode === "" ? " selected" : "") + '>all</option>',
      '</select>',
      '</label>',
      '</div>',
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">',
      '<button type="button" data-aicm-aiworker-placement-action="load" style="padding:8px 12px;border-radius:10px;border:1px solid #0969da;background:#0969da;color:#fff;">一覧読み込み</button>',
      '</div>',
      '<div data-aicm-aiworker-placement-output="list" style="margin-top:12px;">',
      typeof output === "string" ? '<pre style="white-space:pre-wrap;background:#f6f8fa;border-radius:10px;padding:12px;">' + escapeHtml(output) + '</pre>' : renderPlacementListHtml(output),
      '</div>',
      '</section>'
    ].join("");
  }

  function ensureMount() {
    if (!root || !root.document) return null;

    var existing = root.document.getElementById("aicm-business-aiworker-placement-root");
    if (existing) return existing;

    var rootEl = root.document.createElement("div");
    rootEl.id = "aicm-business-aiworker-placement-root";

    var bridgeRoot = root.document.getElementById("aicm-business-aiworker-bridge-root");
    if (bridgeRoot && bridgeRoot.parentNode) {
      bridgeRoot.parentNode.insertBefore(rootEl, bridgeRoot.nextSibling);
      return rootEl;
    }

    var main = root.document.querySelector("main") || root.document.body;
    main.appendChild(rootEl);
    return rootEl;
  }

  function readPanelState(panel) {
    var state = {
      companyId: DEFAULT_COMPANY_ID,
      statusCode: "active"
    };

    if (!panel) return state;

    var fields = panel.querySelectorAll("[data-aicm-aiworker-placement-field]");
    Array.prototype.forEach.call(fields, function (field) {
      var key = field.getAttribute("data-aicm-aiworker-placement-field");
      state[key] = field.value;
    });

    return state;
  }

  function render(rootEl, state) {
    rootEl.innerHTML = buildPanelHtml(state || {});

    var panel = rootEl.querySelector("#aicm-business-aiworker-placement-panel");

    panel.addEventListener("click", function (event) {
      var action = event.target && event.target.getAttribute("data-aicm-aiworker-placement-action");
      if (!action) return;

      if (action === "load") {
        var next = readPanelState(panel);
        var outputEl = panel.querySelector("[data-aicm-aiworker-placement-output='list']");
        outputEl.innerHTML = '<pre style="white-space:pre-wrap;background:#f6f8fa;border-radius:10px;padding:12px;">読み込み中...</pre>';

        listPlacements(next.companyId, next.statusCode).then(function (result) {
          if (!result.ok) {
            outputEl.innerHTML = '<pre style="white-space:pre-wrap;background:#fff5f5;border-radius:10px;padding:12px;">' + escapeHtml(JSON.stringify(result, null, 2)) + '</pre>';
            return;
          }
          outputEl.innerHTML = renderPlacementListHtml(result.items || []);
        });
      }

      if (action === "deactivate") {
        var placementId = event.target.getAttribute("data-placement-id");
        var output = panel.querySelector("[data-aicm-aiworker-placement-output='list']");
        deactivatePlacement(placementId, "ui_deactivate").then(function (result) {
          output.innerHTML = '<pre style="white-space:pre-wrap;background:#f6f8fa;border-radius:10px;padding:12px;">' + escapeHtml(JSON.stringify(result, null, 2)) + '</pre>';
        });
      }

      if (action === "edit") {
        var editId = event.target.getAttribute("data-placement-id");
        var newNickname = root.prompt ? root.prompt("新しい社内通称", "") : "";
        if (!newNickname) return;

        var editOutput = panel.querySelector("[data-aicm-aiworker-placement-output='list']");
        updatePlacement({
          company_robot_placement_id: editId,
          internal_nickname: newNickname,
          metadata_patch_jsonb: {
            source: "AICompanyManagerPlacementClient",
            ui_action: "nickname_update"
          }
        }).then(function (result) {
          editOutput.innerHTML = '<pre style="white-space:pre-wrap;background:#f6f8fa;border-radius:10px;padding:12px;">' + escapeHtml(JSON.stringify(result, null, 2)) + '</pre>';
        });
      }
    });
  }

  function init(customState) {
    var rootEl = ensureMount();
    if (!rootEl) return { ok: false, reason: "document_unavailable" };

    render(rootEl, customState || {
      companyId: DEFAULT_COMPANY_ID,
      statusCode: "active",
      output: "未読み込み"
    });

    return {
      ok: true,
      mounted: true,
      rootId: rootEl.id
    };
  }

  function buildSmokeItems() {
    return [
      {
        company_robot_placement_id: "00000000-0000-4000-8000-000000000301",
        company_id: DEFAULT_COMPANY_ID,
        target_level_code: "company",
        role_code: "President",
        internal_nickname: "社長AI",
        display_label: "社長AI@President",
        aiworker_model_code: "HD-R5",
        selector_label: "Manager / HD-R5",
        status_code: "active"
      }
    ];
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
    requestJson: requestJson,
    listPlacements: listPlacements,
    updatePlacement: updatePlacement,
    deactivatePlacement: deactivatePlacement,
    normalizePlacement: normalizePlacement,
    renderPlacementListHtml: renderPlacementListHtml,
    buildPanelHtml: buildPanelHtml,
    init: init,
    buildSmokeItems: buildSmokeItems
  };
});
