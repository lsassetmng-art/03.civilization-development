const route = require("../assets/js/aicm-business-aiworker-route-integration.js");

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assertOk(Array.isArray(route.ROUTE_DEFINITIONS), "ROUTE_DEFINITIONS should be array");
assertOk(route.ROUTE_DEFINITIONS.length >= 4, "route definitions should have 4 or more items");

const president = route.getRouteDefinition("company_settings_president");
assertOk(president.roleCode === "President", "president role mismatch");
assertOk(president.targetLevelCode === "company", "president target mismatch");
assertOk(president.defaultModelCode === "HD-R5", "president model mismatch");

const manager = route.getRouteDefinition("department_detail_manager");
assertOk(manager.roleCode === "Manager", "manager role mismatch");
assertOk(manager.targetLevelCode === "department", "manager target mismatch");

const leader = route.getRouteDefinition("section_detail_leader");
assertOk(leader.roleCode === "Leader", "leader role mismatch");
assertOk(leader.targetLevelCode === "section", "leader target mismatch");

const worker = route.getRouteDefinition("section_worker_placement");
assertOk(worker.roleCode === "Worker", "worker role mismatch");
assertOk(worker.defaultModelCode === "HD-R3", "worker model mismatch");

const state = route.buildBridgeState("company_settings_president", {
  companyId: "00000000-0000-4000-8000-000000000999"
});

assertOk(state.companyId === "00000000-0000-4000-8000-000000000999", "company override mismatch");
assertOk(state.roleCode === "President", "state role mismatch");
assertOk(state.aiworkerModelCode === "HD-R5", "state model mismatch");
assertOk(state.internalNickname === "社長AI", "state nickname mismatch");

const html = route.buildRouteIntegrationHtml();
assertOk(html.indexOf("AICompanyManager ロボット設定導線") >= 0, "panel title missing");
assertOk(html.indexOf("AI企業設定") >= 0, "company settings card missing");
assertOk(html.indexOf("部門詳細") >= 0, "department card missing");
assertOk(html.indexOf("課詳細") >= 0, "section card missing");
assertOk(html.indexOf("Worker配置") >= 0, "worker card missing");
assertOk(html.indexOf("data-aicm-aiworker-route-action") >= 0, "route action missing");

console.log("AICM_BUSINESS_AIWORKER_ROUTE_INTEGRATION_SMOKE_PASS=true");
