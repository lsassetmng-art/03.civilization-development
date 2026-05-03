global.fetch = function (url, options) {
  const body = options && options.body ? JSON.parse(options.body) : null;

  if (String(url).indexOf("/company-entitlement/grant") >= 0) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        ok: true,
        dry_run: true,
        company_robot_entitlement_id: "00000000-0000-4000-8000-000000000101",
        received_model: body.aiworker_model_code
      })
    });
  }

  if (String(url).indexOf("/company-robot/place") >= 0) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        ok: true,
        dry_run: true,
        company_robot_placement_id: "00000000-0000-4000-8000-000000000202",
        display_label: body.internal_nickname + "@" + body.role_code
      })
    });
  }

  if (String(url).indexOf("/global-selector-options") >= 0) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        ok: true,
        items: [
          {
            aiworker_model_code: "HD-R5",
            selector_label: "Manager / HD-R5"
          }
        ]
      })
    });
  }

  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({
      ok: false,
      error: "not_found"
    })
  });
};

const client = require("../assets/js/aicm-business-aiworker-save-client.js");

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const draft = client.buildSmokeDraft();
  assertOk(draft.ok === true, "smoke draft should be ok");
  assertOk(draft.displayLabel === "社長AI@President", "display label mismatch");

  const globalOptions = await client.loadGlobalOptions("President", {
    apiBaseUrl: "http://127.0.0.1:8789",
    dryRun: true
  });

  assertOk(globalOptions.ok === true, "global options should be ok");
  assertOk(globalOptions.items.length === 1, "global options item count mismatch");

  const saveResult = await client.saveDraft(draft, {
    apiBaseUrl: "http://127.0.0.1:8789",
    dryRun: true
  });

  assertOk(saveResult.ok === true, "save result should be ok");
  assertOk(saveResult.displayLabel === "社長AI@President", "save display label mismatch");
  assertOk(saveResult.grantResult.ok === true, "grant result should be ok");
  assertOk(saveResult.placementResult.ok === true, "placement result should be ok");

  console.log("AICM_BUSINESS_AIWORKER_SAVE_CLIENT_SMOKE_PASS=true");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
