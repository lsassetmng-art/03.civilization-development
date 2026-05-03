const bridge = require("../assets/js/aicm-business-aiworker-save-reload-bridge.js");

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const success = bridge.buildSmokeSaveSuccessPayload();
assertOk(bridge.isSaveSuccessPayload(success) === true, "success payload should be detected");

const failed = {
  ok: false
};
assertOk(bridge.isSaveSuccessPayload(failed) === false, "failed payload should not be detected");

const parsed = bridge.safeJsonParse(JSON.stringify(success));
assertOk(parsed.ok === true, "safe json parse should pass");
assertOk(parsed.value.displayLabel === "社長AI@President", "parsed display label mismatch");

const invalid = bridge.safeJsonParse("{bad json");
assertOk(invalid.ok === false, "invalid json should fail");

const filter = bridge.buildReloadFilter({
  routeCode: "company_settings_president",
  state: {
    companyId: "00000000-0000-4000-8000-000000000999",
    targetId: ""
  }
});

assertOk(filter.routeCode === "company_settings_president", "route filter mismatch");
assertOk(filter.companyId === "00000000-0000-4000-8000-000000000999", "company filter mismatch");

const fallbackFilter = bridge.buildReloadFilter({
  state: {}
});

assertOk(fallbackFilter.routeCode === "company_settings_president", "fallback route mismatch");
assertOk(fallbackFilter.companyId === bridge.DEFAULT_COMPANY_ID, "fallback company mismatch");

console.log("AICM_BUSINESS_AIWORKER_SAVE_RELOAD_BRIDGE_SMOKE_PASS=true");
