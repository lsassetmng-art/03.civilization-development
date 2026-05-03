const calls = [];

global.AICMBusinessAIWorkerApiConfigClient = {
  fetchJson: function fetchJson(path, options) {
    calls.push({ path, options });
    return Promise.resolve({
      ok: true,
      path,
      params: options.params || {},
      items: []
    });
  }
};

const client = require("../assets/js/aicm-business-aiworker-reference-client.js");

function assertOk(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  assertOk(client.buildQuery({ role_code: "Lover", empty: "", none: null }) === "?role_code=Lover", "query build mismatch");

  const roles = await client.listRoles({ role_code: "Lover" });
  const personalities = await client.listPersonalities({ aiworker_model_code: "HD-R5P" });
  const profiles = await client.listPublicProfiles({ aiworker_series_code: "MEGAMI" });
  const full = await client.listModelFull({ aiworker_model_code: "HD-R3" });

  assertOk(roles.path === "/api/v1/business/aiworker/reference/roles", "roles path mismatch");
  assertOk(personalities.path === "/api/v1/business/aiworker/reference/personalities", "personalities path mismatch");
  assertOk(profiles.path === "/api/v1/business/aiworker/reference/public-profiles", "profiles path mismatch");
  assertOk(full.path === "/api/v1/business/aiworker/reference/model-full", "full path mismatch");
  assertOk(calls.length === 4, "call count mismatch");

  console.log("AICM_BUSINESS_AIWORKER_REFERENCE_CLIENT_SMOKE_PASS=true");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
