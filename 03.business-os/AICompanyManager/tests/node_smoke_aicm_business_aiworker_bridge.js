const bridge = require("../assets/js/aicm-business-aiworker-bridge.js");

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const initial = bridge.getInitialState();
assertOk(initial.roleCode === "President", "initial role should be President");
assertOk(initial.aiworkerModelCode === "HD-R5", "initial model should be HD-R5");

const presidentOptions = bridge.filterOptionsByRole(bridge.FALLBACK_OPTIONS, "President");
assertOk(presidentOptions.length === 1, "President should have one fallback option");
assertOk(presidentOptions[0].aiworker_model_code === "HD-R5", "President option should be HD-R5");

const workerOptions = bridge.filterOptionsByRole(bridge.FALLBACK_OPTIONS, "Worker");
assertOk(workerOptions.length >= 1, "Worker should have fallback option");

const draft = bridge.buildSmokeDraft();
assertOk(draft.ok === true, "smoke draft should be ok");
assertOk(draft.displayLabel === "社長AI@President", "display label mismatch");
assertOk(draft.grantPayload.aiworker_model_code === "HD-R5", "grant payload model mismatch");
assertOk(draft.placementPayload.app_code === "AICompanyManager", "placement app code mismatch");

const html = bridge.buildPanelHtml(initial);
assertOk(html.indexOf("BusinessOS AIWorker ロボット設定") >= 0, "panel title missing");
assertOk(html.indexOf("HD-R5") >= 0, "panel model missing");
assertOk(html.indexOf("data-aicm-aiworker-action") >= 0, "panel action missing");

console.log("AICM_BUSINESS_AIWORKER_BRIDGE_SMOKE_PASS=true");
