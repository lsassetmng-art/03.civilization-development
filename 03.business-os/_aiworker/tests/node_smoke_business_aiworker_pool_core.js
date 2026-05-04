const core = require("../assets/js/business-aiworker-pool-core.js");

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const pool = {
  robot_pool_id: "pool-001",
  aiworker_model_code: "HD-R3",
  aiworker_series_code: "HD",
  manufacturer_code: "helios_dynamics",
  display_name: "Worker",
  available_quantity: 50,
  reserved_quantity: 0,
  unlimited_assignment_flag: true,
  status_code: "active"
};

const normalized = core.normalizePoolRow(pool);
assertOk(normalized.aiworkerModelCode === "HD-R3", "model code normalize failed");
assertOk(normalized.availableQuantity === 50, "quantity normalize failed");
assertOk(core.canPlaceRobot(pool) === true, "active unlimited pool should be placeable");
assertOk(core.getVisibleAvailableQuantity(pool) === 50, "visible quantity failed");

const label = core.buildPlacementLabel({
  internal_nickname: "Zeus",
  role_code: "President"
});
assertOk(label === "Zeus@President", "placement label failed");

const invalidDraft = core.validatePlacementDraft({
  company_id: "00000000-0000-4000-8000-000000000001",
  aiworker_model_code: "HD-R3"
});
assertOk(invalidDraft.ok === false, "invalid placement draft should fail");
assertOk(invalidDraft.errors.includes("target_level_code_required"), "missing target error failed");

const summary = core.summarizePool([
  pool,
  {
    aiworker_model_code: "HD-R4",
    available_quantity: 20,
    reserved_quantity: 2,
    unlimited_assignment_flag: false,
    status_code: "active"
  }
]);

assertOk(summary.totalPools === 2, "summary total failed");
assertOk(summary.totalAvailableQuantity === 70, "summary quantity failed");
assertOk(summary.placeablePools === 2, "summary placeable failed");

console.log("BUSINESS_AIWORKER_POOL_CORE_SMOKE_PASS=true");
