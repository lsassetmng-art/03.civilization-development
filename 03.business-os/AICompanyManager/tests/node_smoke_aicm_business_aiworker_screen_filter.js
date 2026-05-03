global.fetch = function (url) {
  if (String(url).indexOf("/placements-filtered") >= 0) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        ok: true,
        items: [
          {
            company_robot_placement_id: "00000000-0000-4000-8000-000000000501",
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

  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({
      ok: false,
      error: "not_found"
    })
  });
};

const screenFilter = require("../assets/js/aicm-business-aiworker-screen-filter.js");

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  assertOk(screenFilter.SCREEN_ROUTES.length === 4, "screen route count mismatch");

  const president = screenFilter.buildFilter("company_settings_president", {
    companyId: "00000000-0000-4000-8000-000000000999"
  });

  assertOk(president.roleCode === "President", "president role mismatch");
  assertOk(president.targetLevelCode === "company", "president target mismatch");

  const manager = screenFilter.buildFilter("department_detail_manager", {});
  assertOk(manager.roleCode === "Manager", "manager role mismatch");
  assertOk(manager.targetLevelCode === "department", "manager target mismatch");

  const leader = screenFilter.buildFilter("section_detail_leader", {});
  assertOk(leader.roleCode === "Leader", "leader role mismatch");
  assertOk(leader.targetLevelCode === "section", "leader target mismatch");

  const worker = screenFilter.buildFilter("section_worker_placement", {});
  assertOk(worker.roleCode === "Worker", "worker role mismatch");
  assertOk(worker.targetLevelCode === "section", "worker target mismatch");

  const html = screenFilter.buildPanelHtml({
    companyId: "00000000-0000-4000-8000-000000000999",
    targetId: ""
  });

  assertOk(html.indexOf("画面別ロボット配置フィルタ") >= 0, "panel title missing");
  assertOk(html.indexOf("AI企業設定") >= 0, "company settings missing");
  assertOk(html.indexOf("部門詳細") >= 0, "department detail missing");
  assertOk(html.indexOf("課詳細") >= 0, "section detail missing");
  assertOk(html.indexOf("Worker配置") >= 0, "worker placement missing");

  const loadResult = await screenFilter.loadFilteredPlacements(
    "company_settings_president",
    {
      companyId: "00000000-0000-4000-8000-000000000999"
    },
    {
      apiBaseUrl: "http://127.0.0.1:8796"
    }
  );

  assertOk(loadResult.ok === true, "load result should be ok");
  assertOk(loadResult.items.length === 1, "load item count mismatch");
  assertOk(loadResult.localFilter.roleCode === "President", "local filter role mismatch");

  console.log("AICM_BUSINESS_AIWORKER_SCREEN_FILTER_SMOKE_PASS=true");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
