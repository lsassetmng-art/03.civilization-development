const { getBackendRuntimeConfig, assertCanStartBackend } = require("../backend/worker-rental-api/runtime/backend-runtime-config");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const defaultConfig = getBackendRuntimeConfig({});
  assert(defaultConfig.mode === "local_in_memory", "default mode should be local_in_memory");
  assert(defaultConfig.appCode === "CasualChatWorker", "appCode mismatch");

  let blockedErp = false;
  try {
    getBackendRuntimeConfig({
      CCW_BACKEND_MODE: "local_in_memory",
      DATABASE_URL: "postgres://erp"
    });
  } catch (_error) {
    blockedErp = true;
  }

  assert(blockedErp === true, "ERP DB env should be blocked");

  let blockedDryRun = false;
  try {
    const dry = getBackendRuntimeConfig({
      CCW_BACKEND_MODE: "nonprod_db_dry_run",
      PERSONA_DATABASE_URL: "postgres://persona"
    });
    assertCanStartBackend(dry);
  } catch (_error) {
    blockedDryRun = true;
  }

  assert(blockedDryRun === true, "dry-run without flags should be blocked");

  const allowedDryRun = getBackendRuntimeConfig({
    CCW_BACKEND_MODE: "nonprod_db_dry_run",
    PERSONA_DATABASE_URL: "postgres://persona",
    CCW_ENABLE_NONPROD_DB_DRY_RUN: "1",
    CCW_CONFIRM_ROLLBACK_TEST: "1"
  });

  assert(allowedDryRun.allowDryRunRollback === true, "dry-run flags should enable rollback test");
  assertCanStartBackend(allowedDryRun);

  console.log("Backend runtime config test PASS");
}

main();
