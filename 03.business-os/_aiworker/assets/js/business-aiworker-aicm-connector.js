(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BusinessAIWorkerAICMConnector = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var ROLE_CODES = {
    PRESIDENT: "President",
    EXECUTIVE_MANAGER: "ExecutiveManager",
    MANAGER: "Manager",
    LEADER: "Leader",
    WORKER: "Worker",
    HELPER: "Helper",
    FRIEND: "Friend",
    SPECIALIST: "Specialist"
  };

  var TARGET_LEVEL_CODES = {
    COMPANY: "company",
    DEPARTMENT: "department",
    SECTION: "section",
    ORGANIZATION: "organization"
  };

  function text(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function number(value) {
    var parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    if (parsed < 0) return 0;
    return Math.floor(parsed);
  }

  function array(value) {
    if (Array.isArray(value)) return value.map(text).filter(Boolean);
    if (typeof value === "string" && value.trim()) {
      return value.split(",").map(text).filter(Boolean);
    }
    return [];
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeOption(row) {
    var source = row || {};
    var modelCode = text(source.aiworker_model_code || source.aiworkerModelCode);
    var displayName = text(source.display_name || source.displayName || source.model_display_name || source.modelDisplayName);
    var selectorLabel = text(source.selector_label || source.selectorLabel);

    if (!selectorLabel) {
      selectorLabel = displayName && modelCode ? displayName + " / " + modelCode : displayName || modelCode;
    }

    return {
      companyRobotEntitlementId: text(source.company_robot_entitlement_id || source.companyRobotEntitlementId),
      robotPoolId: text(source.robot_pool_id || source.robotPoolId),
      companyId: text(source.company_id || source.companyId),
      aiworkerModelCode: modelCode,
      aiworkerSeriesCode: text(source.aiworker_series_code || source.aiworkerSeriesCode),
      manufacturerCode: text(source.manufacturer_code || source.manufacturerCode),
      displayName: displayName,
      selectorLabel: selectorLabel,
      businessOfferCode: text(source.business_offer_code || source.businessOfferCode || "standard"),
      usableQuantity: number(source.usable_quantity || source.usableQuantity),
      visibleAvailableQuantity: number(source.visible_available_quantity || source.visibleAvailableQuantity),
      assignmentModeCode: text(source.assignment_mode_code || source.assignmentModeCode || "unlimited_placement"),
      recommendedRoleCodes: array(source.recommended_role_codes || source.recommendedRoleCodes),
      statusCode: text(source.status_code || source.statusCode || "active"),
      sortRank: number(source.sort_rank || source.sortRank)
    };
  }

  function normalizeOptions(rows) {
    return (Array.isArray(rows) ? rows : []).map(normalizeOption);
  }

  function supportsRole(option, roleCode) {
    var normalized = normalizeOption(option);
    var role = text(roleCode);
    if (!role) return true;
    if (!normalized.recommendedRoleCodes.length) return true;
    return normalized.recommendedRoleCodes.indexOf(role) >= 0;
  }

  function buildRoleSelectorModel(input) {
    var source = input || {};
    var roleCode = text(source.role_code || source.roleCode);
    var selectedModelCode = text(source.selected_aiworker_model_code || source.selectedAiworkerModelCode);
    var options = normalizeOptions(source.options || source.items).filter(function (option) {
      return option.statusCode === "active" && supportsRole(option, roleCode);
    });

    return {
      roleCode: roleCode,
      targetLevelCode: text(source.target_level_code || source.targetLevelCode),
      targetId: text(source.target_id || source.targetId),
      selectedAiworkerModelCode: selectedModelCode,
      options: options,
      empty: options.length === 0
    };
  }

  function renderSelectHtml(input) {
    var model = buildRoleSelectorModel(input);
    var name = text((input || {}).name || "aiworker_model_code");
    var id = text((input || {}).id || "aiworker-model-selector-" + model.roleCode);

    var html = '<select id="' + escapeHtml(id) + '" name="' + escapeHtml(name) + '" data-role-code="' + escapeHtml(model.roleCode) + '">';
    html += '<option value="">ロボットを選択</option>';

    model.options.forEach(function (option) {
      var selected = option.aiworkerModelCode === model.selectedAiworkerModelCode ? " selected" : "";
      html += '<option value="' + escapeHtml(option.aiworkerModelCode) + '"' + selected + '>';
      html += escapeHtml(option.selectorLabel);
      html += '</option>';
    });

    html += '</select>';
    return html;
  }

  function buildGrantPayload(input) {
    var source = input || {};
    return {
      company_id: text(source.company_id || source.companyId),
      aiworker_model_code: text(source.aiworker_model_code || source.aiworkerModelCode),
      quantity: number(source.quantity || source.contracted_quantity || source.contractedQuantity || 1) || 1,
      business_offer_code: text(source.business_offer_code || source.businessOfferCode || "standard"),
      entitlement_scope_code: text(source.entitlement_scope_code || source.entitlementScopeCode || "company"),
      assignment_mode_code: text(source.assignment_mode_code || source.assignmentModeCode || "unlimited_placement")
    };
  }

  function buildPlacementPayload(input) {
    var source = input || {};
    return {
      company_id: text(source.company_id || source.companyId),
      aiworker_model_code: text(source.aiworker_model_code || source.aiworkerModelCode),
      target_level_code: text(source.target_level_code || source.targetLevelCode),
      target_id: text(source.target_id || source.targetId),
      app_code: text(source.app_code || source.appCode || "AICompanyManager"),
      role_code: text(source.role_code || source.roleCode),
      internal_nickname: text(source.internal_nickname || source.internalNickname),
      placement_quantity: number(source.placement_quantity || source.placementQuantity || 1) || 1,
      metadata_jsonb: source.metadata_jsonb || source.metadataJsonb || { source: "AICompanyManager" }
    };
  }

  function validateGrantPayload(input) {
    var payload = buildGrantPayload(input);
    var errors = [];

    if (!payload.company_id) errors.push("company_id_required");
    if (!payload.aiworker_model_code) errors.push("aiworker_model_code_required");
    if (payload.quantity < 1) errors.push("quantity_must_be_positive");

    return {
      ok: errors.length === 0,
      errors: errors,
      payload: payload
    };
  }

  function validatePlacementPayload(input) {
    var payload = buildPlacementPayload(input);
    var errors = [];

    if (!payload.company_id) errors.push("company_id_required");
    if (!payload.aiworker_model_code) errors.push("aiworker_model_code_required");
    if (!payload.target_level_code) errors.push("target_level_code_required");
    if (!payload.role_code) errors.push("role_code_required");
    if (!payload.internal_nickname) errors.push("internal_nickname_required");

    return {
      ok: errors.length === 0,
      errors: errors,
      payload: payload
    };
  }

  function buildDisplayLabel(input) {
    var payload = buildPlacementPayload(input);
    if (payload.internal_nickname && payload.role_code) {
      return payload.internal_nickname + "@" + payload.role_code;
    }
    return payload.internal_nickname || payload.role_code || "";
  }

  function buildRpcCallPlan(input) {
    var grant = buildGrantPayload(input);
    var placement = buildPlacementPayload(input);

    return {
      grant: {
        rpc: "business.fn_company_robot_grant_entitlement",
        args: grant
      },
      placement: {
        rpc: "business.fn_company_robot_place",
        args: placement
      },
      displayLabel: buildDisplayLabel(input)
    };
  }

  function buildAicmRobotSettingDraft(input) {
    var source = input || {};
    var placement = buildPlacementPayload(source);
    var grant = buildGrantPayload({
      company_id: placement.company_id,
      aiworker_model_code: placement.aiworker_model_code,
      quantity: source.quantity || 1,
      business_offer_code: source.business_offer_code || source.businessOfferCode || "standard",
      entitlement_scope_code: source.entitlement_scope_code || source.entitlementScopeCode || "company",
      assignment_mode_code: source.assignment_mode_code || source.assignmentModeCode || "unlimited_placement"
    });

    return {
      ok: validatePlacementPayload(placement).ok && validateGrantPayload(grant).ok,
      displayLabel: buildDisplayLabel(placement),
      grantPayload: grant,
      placementPayload: placement,
      rpcPlan: buildRpcCallPlan(Object.assign({}, grant, placement))
    };
  }

  return {
    ROLE_CODES: ROLE_CODES,
    TARGET_LEVEL_CODES: TARGET_LEVEL_CODES,
    normalizeOption: normalizeOption,
    normalizeOptions: normalizeOptions,
    supportsRole: supportsRole,
    buildRoleSelectorModel: buildRoleSelectorModel,
    renderSelectHtml: renderSelectHtml,
    buildGrantPayload: buildGrantPayload,
    buildPlacementPayload: buildPlacementPayload,
    validateGrantPayload: validateGrantPayload,
    validatePlacementPayload: validatePlacementPayload,
    buildDisplayLabel: buildDisplayLabel,
    buildRpcCallPlan: buildRpcCallPlan,
    buildAicmRobotSettingDraft: buildAicmRobotSettingDraft
  };
});
