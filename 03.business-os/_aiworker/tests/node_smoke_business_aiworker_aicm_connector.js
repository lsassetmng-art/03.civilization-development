const connector = require("../assets/js/business-aiworker-aicm-connector.js");

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const options = [
  {
    robot_pool_id: "pool-001",
    aiworker_model_code: "HD-R5",
    aiworker_series_code: "HD",
    manufacturer_code: "helios_dynamics",
    display_name: "Manager",
    selector_label: "Manager / HD-R5",
    recommended_role_codes: ["President", "ExecutiveManager", "Manager"],
    status_code: "active",
    sort_rank: 1
  },
  {
    robot_pool_id: "pool-002",
    aiworker_model_code: "HD-R3",
    aiworker_series_code: "HD",
    manufacturer_code: "helios_dynamics",
    display_name: "Worker",
    selector_label: "Worker / HD-R3",
    recommended_role_codes: ["Worker"],
    status_code: "active",
    sort_rank: 1
  }
];

const presidentModel = connector.buildRoleSelectorModel({
  role_code: "President",
  options: options
});

assertOk(presidentModel.options.length === 1, "President selector should have one option");
assertOk(presidentModel.options[0].aiworkerModelCode === "HD-R5", "President selector should choose HD-R5");

const workerModel = connector.buildRoleSelectorModel({
  role_code: "Worker",
  options: options
});

assertOk(workerModel.options.length === 1, "Worker selector should have one option");
assertOk(workerModel.options[0].aiworkerModelCode === "HD-R3", "Worker selector should choose HD-R3");

const selectHtml = connector.renderSelectHtml({
  role_code: "President",
  options: options,
  selected_aiworker_model_code: "HD-R5"
});

assertOk(selectHtml.indexOf("<select") >= 0, "select html missing");
assertOk(selectHtml.indexOf("HD-R5") >= 0, "select html missing model code");
assertOk(selectHtml.indexOf("selected") >= 0, "select html missing selected");

const draft = connector.buildAicmRobotSettingDraft({
  company_id: "00000000-0000-4000-8000-000000000001",
  aiworker_model_code: "HD-R5",
  target_level_code: "company",
  target_id: "",
  role_code: "President",
  internal_nickname: "Zeus",
  quantity: 1
});

assertOk(draft.ok === true, "draft should be ok");
assertOk(draft.displayLabel === "Zeus@President", "display label failed");
assertOk(draft.grantPayload.aiworker_model_code === "HD-R5", "grant payload model failed");
assertOk(draft.placementPayload.role_code === "President", "placement payload role failed");
assertOk(draft.rpcPlan.grant.rpc === "business.fn_company_robot_grant_entitlement", "grant rpc name failed");
assertOk(draft.rpcPlan.placement.rpc === "business.fn_company_robot_place", "placement rpc name failed");

const invalidDraft = connector.buildAicmRobotSettingDraft({
  company_id: "00000000-0000-4000-8000-000000000001",
  aiworker_model_code: "HD-R5",
  role_code: "President"
});

assertOk(invalidDraft.ok === false, "invalid draft should fail");

console.log("BUSINESS_AIWORKER_AICM_CONNECTOR_SMOKE_PASS=true");
