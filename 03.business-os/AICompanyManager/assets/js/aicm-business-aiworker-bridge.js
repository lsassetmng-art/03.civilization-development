(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.AICMBusinessAIWorkerBridge = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  var DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-1db11893cb24";

  var ROLE_OPTIONS = [
    { roleCode: "President", label: "President / 社長" },
    { roleCode: "Manager", label: "Manager / 部門長" },
    { roleCode: "Leader", label: "Leader / 課長・リーダー" },
    { roleCode: "Worker", label: "Worker / ワーカー" },
    { roleCode: "Helper", label: "Helper / ヘルパー" },
    { roleCode: "Friend", label: "Friend / フレンド" },
    { roleCode: "Specialist", label: "Specialist / 専門担当" }
  ];

  var FALLBACK_OPTIONS = [
    {
      aiworker_model_code: "HD-R5",
      display_name: "Manager",
      selector_label: "Manager / HD-R5",
      recommended_role_codes: ["President", "ExecutiveManager", "Manager"],
      status_code: "active"
    },
    {
      aiworker_model_code: "HD-R4",
      display_name: "Leader",
      selector_label: "Leader / HD-R4",
      recommended_role_codes: ["Manager", "Leader"],
      status_code: "active"
    },
    {
      aiworker_model_code: "HD-R3",
      display_name: "Worker",
      selector_label: "Worker / HD-R3",
      recommended_role_codes: ["Worker"],
      status_code: "active"
    },
    {
      aiworker_model_code: "HD-R1",
      display_name: "Helper",
      selector_label: "Helper / HD-R1",
      recommended_role_codes: ["Helper", "Secretary"],
      status_code: "active"
    },
    {
      aiworker_model_code: "HD-R1C",
      display_name: "Friend",
      selector_label: "Friend / HD-R1C",
      recommended_role_codes: ["Friend", "Support"],
      status_code: "active"
    },
    {
      aiworker_model_code: "MG-NORN-001",
      display_name: "Urd",
      selector_label: "Urd / MG-NORN-001",
      recommended_role_codes: ["Specialist", "Advisor", "Worker"],
      status_code: "active"
    },
    {
      aiworker_model_code: "MG-NORN-002",
      display_name: "Verdandi",
      selector_label: "Verdandi / MG-NORN-002",
      recommended_role_codes: ["Specialist", "Advisor", "Worker"],
      status_code: "active"
    },
    {
      aiworker_model_code: "MG-NORN-003",
      display_name: "Skuld",
      selector_label: "Skuld / MG-NORN-003",
      recommended_role_codes: ["Specialist", "Advisor", "Worker"],
      status_code: "active"
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

  function getConnector() {
    if (root && root.BusinessAIWorkerAICMConnector) {
      return root.BusinessAIWorkerAICMConnector;
    }

    return {
      supportsRole: function (option, roleCode) {
        var roles = option && Array.isArray(option.recommended_role_codes)
          ? option.recommended_role_codes
          : option && Array.isArray(option.recommendedRoleCodes)
            ? option.recommendedRoleCodes
            : [];
        if (!roleCode) return true;
        if (!roles.length) return true;
        return roles.indexOf(roleCode) >= 0;
      },
      buildAicmRobotSettingDraft: function (input) {
        var companyId = text(input.company_id || input.companyId);
        var modelCode = text(input.aiworker_model_code || input.aiworkerModelCode);
        var targetLevel = text(input.target_level_code || input.targetLevelCode);
        var targetId = text(input.target_id || input.targetId);
        var roleCode = text(input.role_code || input.roleCode);
        var nickname = text(input.internal_nickname || input.internalNickname);
        var errors = [];

        if (!companyId) errors.push("company_id_required");
        if (!modelCode) errors.push("aiworker_model_code_required");
        if (!targetLevel) errors.push("target_level_code_required");
        if (!roleCode) errors.push("role_code_required");
        if (!nickname) errors.push("internal_nickname_required");

        return {
          ok: errors.length === 0,
          errors: errors,
          displayLabel: nickname && roleCode ? nickname + "@" + roleCode : "",
          grantPayload: {
            company_id: companyId,
            aiworker_model_code: modelCode,
            quantity: 1,
            business_offer_code: "standard",
            entitlement_scope_code: "company",
            assignment_mode_code: "unlimited_placement"
          },
          placementPayload: {
            company_id: companyId,
            aiworker_model_code: modelCode,
            target_level_code: targetLevel,
            target_id: targetId,
            app_code: "AICompanyManager",
            role_code: roleCode,
            internal_nickname: nickname,
            placement_quantity: 1,
            metadata_jsonb: { source: "AICompanyManagerBridge" }
          }
        };
      }
    };
  }

  function filterOptionsByRole(options, roleCode) {
    var connector = getConnector();
    var rows = Array.isArray(options) ? options : [];
    return rows.filter(function (option) {
      var status = text(option.status_code || option.statusCode || "active");
      return status === "active" && connector.supportsRole(option, roleCode);
    });
  }

  function getInitialState() {
    return {
      companyId: DEFAULT_COMPANY_ID,
      targetLevelCode: "company",
      targetId: "",
      roleCode: "President",
      internalNickname: "社長AI",
      aiworkerModelCode: "HD-R5",
      options: FALLBACK_OPTIONS.slice(),
      lastDraft: null
    };
  }

  function buildDraft(state) {
    var connector = getConnector();
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
        source: "AICompanyManagerBridge",
        bridge_version: "phase_bm_bp"
      }
    });
  }

  function toOptionValue(option) {
    return text(option.aiworker_model_code || option.aiworkerModelCode);
  }

  function toOptionLabel(option) {
    return text(option.selector_label || option.selectorLabel || option.display_name || option.displayName || toOptionValue(option));
  }

  function buildPanelHtml(state) {
    var roleOptionsHtml = ROLE_OPTIONS.map(function (role) {
      var selected = role.roleCode === state.roleCode ? " selected" : "";
      return '<option value="' + escapeHtml(role.roleCode) + '"' + selected + '>' + escapeHtml(role.label) + '</option>';
    }).join("");

    var filteredOptions = filterOptionsByRole(state.options, state.roleCode);
    var robotOptionsHtml = filteredOptions.map(function (option) {
      var value = toOptionValue(option);
      var selected = value === state.aiworkerModelCode ? " selected" : "";
      return '<option value="' + escapeHtml(value) + '"' + selected + '>' + escapeHtml(toOptionLabel(option)) + '</option>';
    }).join("");

    if (!robotOptionsHtml) {
      robotOptionsHtml = '<option value="">選択可能なロボットがありません</option>';
    } else {
      robotOptionsHtml = '<option value="">ロボットを選択</option>' + robotOptionsHtml;
    }

    var draftText = state.lastDraft
      ? JSON.stringify(state.lastDraft, null, 2)
      : "まだpayloadは作成されていません。";

    return [
      '<section id="aicm-business-aiworker-bridge-panel" style="border:1px solid #d0d7de;border-radius:12px;padding:16px;margin:16px 0;background:#fff;">',
      '<h2 style="margin:0 0 8px;font-size:18px;">BusinessOS AIWorker ロボット設定</h2>',
      '<p style="margin:0 0 12px;color:#57606a;font-size:13px;">Business側ロボットプールから、AICompanyManager用の配置payloadを作成します。DB保存は次工程です。</p>',

      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">',

      '<label style="display:block;font-size:13px;">会社ID',
      '<input data-aicm-aiworker-field="companyId" value="' + escapeHtml(state.companyId) + '" style="width:100%;box-sizing:border-box;padding:8px;margin-top:4px;">',
      '</label>',

      '<label style="display:block;font-size:13px;">対象階層',
      '<select data-aicm-aiworker-field="targetLevelCode" style="width:100%;box-sizing:border-box;padding:8px;margin-top:4px;">',
      '<option value="company"' + (state.targetLevelCode === "company" ? " selected" : "") + '>company / 会社</option>',
      '<option value="department"' + (state.targetLevelCode === "department" ? " selected" : "") + '>department / 部門</option>',
      '<option value="section"' + (state.targetLevelCode === "section" ? " selected" : "") + '>section / 課</option>',
      '<option value="organization"' + (state.targetLevelCode === "organization" ? " selected" : "") + '>organization / 内部互換</option>',
      '</select>',
      '</label>',

      '<label style="display:block;font-size:13px;">対象ID',
      '<input data-aicm-aiworker-field="targetId" value="' + escapeHtml(state.targetId) + '" placeholder="会社直下なら空で可" style="width:100%;box-sizing:border-box;padding:8px;margin-top:4px;">',
      '</label>',

      '<label style="display:block;font-size:13px;">役割',
      '<select data-aicm-aiworker-field="roleCode" style="width:100%;box-sizing:border-box;padding:8px;margin-top:4px;">',
      roleOptionsHtml,
      '</select>',
      '</label>',

      '<label style="display:block;font-size:13px;">社内通称',
      '<input data-aicm-aiworker-field="internalNickname" value="' + escapeHtml(state.internalNickname) + '" placeholder="例: 佐藤" style="width:100%;box-sizing:border-box;padding:8px;margin-top:4px;">',
      '</label>',

      '<label style="display:block;font-size:13px;">ロボット',
      '<select data-aicm-aiworker-field="aiworkerModelCode" style="width:100%;box-sizing:border-box;padding:8px;margin-top:4px;">',
      robotOptionsHtml,
      '</select>',
      '</label>',

      '</div>',

      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">',
      '<button type="button" data-aicm-aiworker-action="build-draft" style="padding:8px 12px;border-radius:10px;border:1px solid #0969da;background:#0969da;color:#fff;">配置payload作成</button>',
      '<button type="button" data-aicm-aiworker-action="reset" style="padding:8px 12px;border-radius:10px;border:1px solid #d0d7de;background:#f6f8fa;">リセット</button>',
      '</div>',

      '<pre data-aicm-aiworker-output="draft" style="white-space:pre-wrap;word-break:break-word;background:#f6f8fa;border-radius:10px;padding:12px;margin-top:12px;max-height:360px;overflow:auto;font-size:12px;">',
      escapeHtml(draftText),
      '</pre>',

      '</section>'
    ].join("");
  }

  function readStateFromPanel(panel, state) {
    var next = Object.assign({}, state);
    var fields = panel.querySelectorAll("[data-aicm-aiworker-field]");

    Array.prototype.forEach.call(fields, function (field) {
      var key = field.getAttribute("data-aicm-aiworker-field");
      next[key] = field.value;
    });

    return next;
  }

  function ensureMount() {
    var existing = document.getElementById("aicm-business-aiworker-bridge-root");
    if (existing) return existing;

    var rootEl = document.createElement("div");
    rootEl.id = "aicm-business-aiworker-bridge-root";

    var preferred = document.querySelector("[data-aicm-aiworker-mount]");
    if (preferred) {
      preferred.appendChild(rootEl);
      return rootEl;
    }

    var main = document.querySelector("main") || document.body;
    if (main.firstChild) {
      main.insertBefore(rootEl, main.firstChild);
    } else {
      main.appendChild(rootEl);
    }

    return rootEl;
  }

  function render(rootEl, state) {
    rootEl.innerHTML = buildPanelHtml(state);

    var panel = rootEl.querySelector("#aicm-business-aiworker-bridge-panel");

    panel.addEventListener("change", function (event) {
      if (!event.target || !event.target.getAttribute("data-aicm-aiworker-field")) return;
      var next = readStateFromPanel(panel, state);

      if (event.target.getAttribute("data-aicm-aiworker-field") === "roleCode") {
        var filtered = filterOptionsByRole(next.options || state.options, next.roleCode);
        next.aiworkerModelCode = filtered.length ? toOptionValue(filtered[0]) : "";
      }

      render(rootEl, next);
    });

    panel.addEventListener("input", function (event) {
      if (!event.target || !event.target.getAttribute("data-aicm-aiworker-field")) return;
      state = readStateFromPanel(panel, state);
    });

    panel.addEventListener("click", function (event) {
      var action = event.target && event.target.getAttribute("data-aicm-aiworker-action");
      if (!action) return;

      if (action === "reset") {
        render(rootEl, getInitialState());
        return;
      }

      if (action === "build-draft") {
        var next = readStateFromPanel(panel, state);
        next.lastDraft = buildDraft(next);

        try {
          window.localStorage.setItem("aicm_business_aiworker_last_draft", JSON.stringify(next.lastDraft));
        } catch (error) {
          /* localStorage may be unavailable */
        }

        render(rootEl, next);
      }
    });
  }

  function init(customState) {
    if (typeof document === "undefined") {
      return {
        ok: false,
        reason: "document_unavailable"
      };
    }

    var rootEl = ensureMount();
    var state = Object.assign(getInitialState(), customState || {});
    render(rootEl, state);

    return {
      ok: true,
      mounted: true,
      rootId: rootEl.id
    };
  }

  function buildSmokeDraft() {
    return buildDraft({
      companyId: DEFAULT_COMPANY_ID,
      targetLevelCode: "company",
      targetId: "",
      roleCode: "President",
      internalNickname: "社長AI",
      aiworkerModelCode: "HD-R5",
      options: FALLBACK_OPTIONS.slice()
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
    DEFAULT_COMPANY_ID: DEFAULT_COMPANY_ID,
    ROLE_OPTIONS: ROLE_OPTIONS,
    FALLBACK_OPTIONS: FALLBACK_OPTIONS,
    getInitialState: getInitialState,
    filterOptionsByRole: filterOptionsByRole,
    buildDraft: buildDraft,
    buildPanelHtml: buildPanelHtml,
    init: init,
    buildSmokeDraft: buildSmokeDraft
  };
});
