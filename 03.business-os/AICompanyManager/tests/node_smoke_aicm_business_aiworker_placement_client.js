global.fetch = function (url, options) {
  const body = options && options.body ? JSON.parse(options.body) : null;

  if (String(url).indexOf("/aicm/placements") >= 0) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        ok: true,
        items: [
          {
            company_robot_placement_id: "00000000-0000-4000-8000-000000000301",
            company_id: "00000000-0000-4000-8000-1db11893cb24",
            target_level_code: "company",
            role_code: "President",
            internal_nickname: "社長AI",
            display_label: "社長AI@President",
            aiworker_model_code: "HD-R5",
            selector_label: "Manager / HD-R5",
            status_code: "active"
          }
        ]
      })
    });
  }

  if (String(url).indexOf("/company-robot/update") >= 0) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        ok: true,
        dry_run: true,
        company_robot_placement_id: body.company_robot_placement_id
      })
    });
  }

  if (String(url).indexOf("/company-robot/deactivate") >= 0) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        ok: true,
        dry_run: true,
        company_robot_placement_id: body.company_robot_placement_id
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

const client = require("../assets/js/aicm-business-aiworker-placement-client.js");

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const items = client.buildSmokeItems();
  assertOk(items.length === 1, "smoke items length failed");

  const html = client.renderPlacementListHtml(items);
  assertOk(html.indexOf("社長AI@President") >= 0, "display label missing");
  assertOk(html.indexOf("Manager / HD-R5") >= 0, "selector label missing");
  assertOk(html.indexOf("data-aicm-aiworker-placement-action") >= 0, "action attr missing");

  const listResult = await client.listPlacements(
    "00000000-0000-4000-8000-1db11893cb24",
    "active",
    { apiBaseUrl: "http://127.0.0.1:8789" }
  );

  assertOk(listResult.ok === true, "list result should be ok");
  assertOk(listResult.items.length === 1, "list item count failed");

  const updateResult = await client.updatePlacement(
    {
      company_robot_placement_id: "00000000-0000-4000-8000-000000000301",
      internal_nickname: "社長AI更新"
    },
    { apiBaseUrl: "http://127.0.0.1:8789", dryRun: true }
  );

  assertOk(updateResult.ok === true, "update result should be ok");

  const deactivateResult = await client.deactivatePlacement(
    "00000000-0000-4000-8000-000000000301",
    "node_smoke",
    { apiBaseUrl: "http://127.0.0.1:8789", dryRun: true }
  );

  assertOk(deactivateResult.ok === true, "deactivate result should be ok");

  const panelHtml = client.buildPanelHtml({
    companyId: "00000000-0000-4000-8000-1db11893cb24",
    statusCode: "active",
    output: items
  });

  assertOk(panelHtml.indexOf("保存済みロボット配置") >= 0, "panel title missing");

  console.log("AICM_BUSINESS_AIWORKER_PLACEMENT_CLIENT_SMOKE_PASS=true");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
