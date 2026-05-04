(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BusinessAIWorkerPoolCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function toSafeText(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function toSafeNumber(value) {
    var numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return 0;
    if (numberValue < 0) return 0;
    return Math.floor(numberValue);
  }

  function normalizePoolRow(row) {
    var source = row || {};
    return {
      robotPoolId: toSafeText(source.robot_pool_id || source.robotPoolId),
      aiworkerModelCode: toSafeText(source.aiworker_model_code || source.aiworkerModelCode),
      aiworkerSeriesCode: toSafeText(source.aiworker_series_code || source.aiworkerSeriesCode),
      manufacturerCode: toSafeText(source.manufacturer_code || source.manufacturerCode),
      displayName: toSafeText(source.display_name || source.displayName),
      businessOfferCode: toSafeText(source.business_offer_code || source.businessOfferCode || "standard"),
      poolScopeCode: toSafeText(source.pool_scope_code || source.poolScopeCode || "business_global"),
      availableQuantity: toSafeNumber(source.available_quantity || source.availableQuantity),
      reservedQuantity: toSafeNumber(source.reserved_quantity || source.reservedQuantity),
      unlimitedAssignmentFlag: Boolean(
        source.unlimited_assignment_flag !== undefined
          ? source.unlimited_assignment_flag
          : source.unlimitedAssignmentFlag !== undefined
            ? source.unlimitedAssignmentFlag
            : true
      ),
      rentalUnitCode: toSafeText(source.rental_unit_code || source.rentalUnitCode || "month"),
      statusCode: toSafeText(source.status_code || source.statusCode || "active")
    };
  }

  function getVisibleAvailableQuantity(poolRow) {
    var row = normalizePoolRow(poolRow);
    var visible = row.availableQuantity - row.reservedQuantity;
    return visible > 0 ? visible : 0;
  }

  function canPlaceRobot(poolRow) {
    var row = normalizePoolRow(poolRow);
    if (row.statusCode !== "active") return false;
    if (row.unlimitedAssignmentFlag) return true;
    return getVisibleAvailableQuantity(row) > 0;
  }

  function buildRobotDisplayName(poolRow) {
    var row = normalizePoolRow(poolRow);
    if (row.displayName && row.aiworkerModelCode) {
      return row.displayName + " / " + row.aiworkerModelCode;
    }
    if (row.displayName) return row.displayName;
    return row.aiworkerModelCode;
  }

  function buildPlacementLabel(placementRow) {
    var row = placementRow || {};
    var nickname = toSafeText(row.internal_nickname || row.internalNickname);
    var roleCode = toSafeText(row.role_code || row.roleCode);
    if (nickname && roleCode) return nickname + "@" + roleCode;
    if (nickname) return nickname;
    return roleCode;
  }

  function summarizePool(poolRows) {
    var rows = Array.isArray(poolRows) ? poolRows : [];
    return rows.reduce(
      function (acc, row) {
        var normalized = normalizePoolRow(row);
        acc.totalPools += 1;
        acc.totalAvailableQuantity += normalized.availableQuantity;
        acc.totalReservedQuantity += normalized.reservedQuantity;
        if (normalized.statusCode === "active") acc.activePools += 1;
        if (canPlaceRobot(normalized)) acc.placeablePools += 1;
        return acc;
      },
      {
        totalPools: 0,
        activePools: 0,
        placeablePools: 0,
        totalAvailableQuantity: 0,
        totalReservedQuantity: 0
      }
    );
  }

  function validatePlacementDraft(draft) {
    var row = draft || {};
    var errors = [];

    if (!toSafeText(row.company_id || row.companyId)) errors.push("company_id_required");
    if (!toSafeText(row.aiworker_model_code || row.aiworkerModelCode)) errors.push("aiworker_model_code_required");
    if (!toSafeText(row.target_level_code || row.targetLevelCode)) errors.push("target_level_code_required");
    if (!toSafeText(row.role_code || row.roleCode)) errors.push("role_code_required");
    if (!toSafeText(row.internal_nickname || row.internalNickname)) errors.push("internal_nickname_required");

    return {
      ok: errors.length === 0,
      errors: errors
    };
  }

  return {
    normalizePoolRow: normalizePoolRow,
    getVisibleAvailableQuantity: getVisibleAvailableQuantity,
    canPlaceRobot: canPlaceRobot,
    buildRobotDisplayName: buildRobotDisplayName,
    buildPlacementLabel: buildPlacementLabel,
    summarizePool: summarizePool,
    validatePlacementDraft: validatePlacementDraft
  };
});
