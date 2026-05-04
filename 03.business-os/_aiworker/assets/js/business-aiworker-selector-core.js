(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BusinessAIWorkerSelectorCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

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

  function normalizeSelectorOption(row) {
    var source = row || {};
    var modelCode = text(source.aiworker_model_code || source.aiworkerModelCode);
    var displayName = text(source.display_name || source.displayName);
    return {
      robotPoolId: text(source.robot_pool_id || source.robotPoolId),
      companyRobotEntitlementId: text(source.company_robot_entitlement_id || source.companyRobotEntitlementId),
      companyId: text(source.company_id || source.companyId),
      aiworkerModelCode: modelCode,
      aiworkerSeriesCode: text(source.aiworker_series_code || source.aiworkerSeriesCode),
      manufacturerCode: text(source.manufacturer_code || source.manufacturerCode),
      displayName: displayName,
      selectorLabel: text(source.selector_label || source.selectorLabel) || buildSelectorLabel(displayName, modelCode),
      businessOfferCode: text(source.business_offer_code || source.businessOfferCode || "standard"),
      availableQuantity: number(source.available_quantity || source.availableQuantity),
      reservedQuantity: number(source.reserved_quantity || source.reservedQuantity),
      usableQuantity: number(source.usable_quantity || source.usableQuantity),
      assignmentModeCode: text(source.assignment_mode_code || source.assignmentModeCode || "unlimited_placement"),
      recommendedRoleCodes: array(source.recommended_role_codes || source.recommendedRoleCodes),
      statusCode: text(source.status_code || source.statusCode || "active")
    };
  }

  function buildSelectorLabel(displayName, modelCode) {
    var name = text(displayName);
    var code = text(modelCode);
    if (name && code) return name + " / " + code;
    return name || code;
  }

  function optionSupportsRole(option, roleCode) {
    var normalized = normalizeSelectorOption(option);
    var role = text(roleCode);
    if (!role) return true;
    if (!normalized.recommendedRoleCodes.length) return true;
    return normalized.recommendedRoleCodes.indexOf(role) >= 0;
  }

  function filterOptionsByRole(options, roleCode) {
    var rows = Array.isArray(options) ? options : [];
    return rows
      .map(normalizeSelectorOption)
      .filter(function (option) {
        return option.statusCode === "active" && optionSupportsRole(option, roleCode);
      });
  }

  function buildEntitlementGrantPayload(input) {
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
      placement_quantity: number(source.placement_quantity || source.placementQuantity || 1) || 1
    };
  }

  function validateEntitlementGrantPayload(payload) {
    var row = buildEntitlementGrantPayload(payload);
    var errors = [];
    if (!row.company_id) errors.push("company_id_required");
    if (!row.aiworker_model_code) errors.push("aiworker_model_code_required");
    if (row.quantity < 1) errors.push("quantity_must_be_positive");
    return {
      ok: errors.length === 0,
      errors: errors,
      payload: row
    };
  }

  function validatePlacementPayload(payload) {
    var row = buildPlacementPayload(payload);
    var errors = [];
    if (!row.company_id) errors.push("company_id_required");
    if (!row.aiworker_model_code) errors.push("aiworker_model_code_required");
    if (!row.target_level_code) errors.push("target_level_code_required");
    if (!row.role_code) errors.push("role_code_required");
    if (!row.internal_nickname) errors.push("internal_nickname_required");
    return {
      ok: errors.length === 0,
      errors: errors,
      payload: row
    };
  }

  function buildPlacementDisplayLabel(payload) {
    var row = buildPlacementPayload(payload);
    if (row.internal_nickname && row.role_code) {
      return row.internal_nickname + "@" + row.role_code;
    }
    return row.internal_nickname || row.role_code || "";
  }

  return {
    normalizeSelectorOption: normalizeSelectorOption,
    buildSelectorLabel: buildSelectorLabel,
    optionSupportsRole: optionSupportsRole,
    filterOptionsByRole: filterOptionsByRole,
    buildEntitlementGrantPayload: buildEntitlementGrantPayload,
    buildPlacementPayload: buildPlacementPayload,
    validateEntitlementGrantPayload: validateEntitlementGrantPayload,
    validatePlacementPayload: validatePlacementPayload,
    buildPlacementDisplayLabel: buildPlacementDisplayLabel
  };
});
