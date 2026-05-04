const core = require("../assets/js/business-aiworker-selector-core.js");

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const options = [
  {
    robot_pool_id: "pool-hd-r5",
    aiworker_model_code: "HD-R5",
    display_name: "Manager",
    selector_label: "Manager / HD-R5",
    recommended_role_codes: ["President", "ExecutiveManager", "Manager"],
    status_code: "active"
  },
  {
    robot_pool_id: "pool-hd-r3",
    aiworker_model_code: "HD-R3",
    display_name: "Worker",
    selector_label: "Worker / HD-R3",
    recommended_role_codes: ["Worker"],
    status_code: "active"
  }
];

const presidentOptions = core.filterOptionsByRole(options, "President");
assertOk(presidentOptions.length === 1, "President filter should return one option");
assertOk(presidentOptions[0].aiworkerModelCode === "HD-R5", "President should map to HD-R5");

const workerOptions = core.filterOptionsByRole(options, "Worker");
assertOk(workerOptions.length === 1, "Worker filter should return one option");
assertOk(workerOptions[0].aiworkerModelCode === "HD-R3", "Worker should map to HD-R3");

const grantValidation = core.validateEntitlementGrantPayload({
  company_id: "00000000-0000-4000-8000-000000000001",
  aiworker_model_code: "HD-R5",
  quantity: 1
});
assertOk(grantValidation.ok === true, "grant validation should pass");

const placementValidation = core.validatePlacementPayload({
  company_id: "00000000-0000-4000-8000-000000000001",
  aiworker_model_code: "HD-R5",
  target_level_code: "company",
  role_code: "President",
  internal_nickname: "Zeus"
});
assertOk(placementValidation.ok === true, "placement validation should pass");

const displayLabel = core.buildPlacementDisplayLabel({
  internal_nickname: "Zeus",
  role_code: "President"
});
assertOk(displayLabel === "Zeus@President", "placement display label failed");

const invalidPlacement = core.validatePlacementPayload({
  company_id: "00000000-0000-4000-8000-000000000001",
  aiworker_model_code: "HD-R5"
});
assertOk(invalidPlacement.ok === false, "invalid placement should fail");
assertOk(invalidPlacement.errors.includes("target_level_code_required"), "target required error missing");

console.log("BUSINESS_AIWORKER_SELECTOR_CORE_SMOKE_PASS=true");
