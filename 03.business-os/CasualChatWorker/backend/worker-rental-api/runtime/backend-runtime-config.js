const ALLOWED_MODES = new Set([
  "mock",
  "local_in_memory",
  "nonprod_db_dry_run",
  "real_backend"
]);

function getBackendRuntimeConfig(env = process.env) {
  const mode = env.CCW_BACKEND_MODE || "local_in_memory";

  if (!ALLOWED_MODES.has(mode)) {
    throw new Error(`Invalid CCW_BACKEND_MODE: ${mode}`);
  }

  if (env.DATABASE_URL && mode !== "mock") {
    throw new Error("ERP database env must not be used for WorkerRentalCore backend.");
  }

  const config = {
    mode,
    appCode: "CasualChatWorker",
    serviceCode: "casual_chat_worker",
    requireAuth: env.CCW_REQUIRE_AUTH !== "0",
    allowDbWrite: false,
    allowDryRunRollback: false,
    hasPersonaDatabaseUrl: Boolean(env.PERSONA_DATABASE_URL)
  };

  if (mode === "nonprod_db_dry_run") {
    config.allowDryRunRollback =
      env.CCW_ENABLE_NONPROD_DB_DRY_RUN === "1" &&
      env.CCW_CONFIRM_ROLLBACK_TEST === "1";
    config.allowDbWrite = false;
  }

  if (mode === "real_backend") {
    config.allowDbWrite = env.CCW_REAL_BACKEND_WRITE_ENABLED === "1";
  }

  return config;
}

function assertCanStartBackend(config) {
  if (!config) {
    throw new Error("Runtime config required.");
  }

  if (config.mode === "nonprod_db_dry_run" && !config.allowDryRunRollback) {
    throw new Error("Non-production dry-run rollback flags are required.");
  }

  if ((config.mode === "nonprod_db_dry_run" || config.mode === "real_backend") && !config.hasPersonaDatabaseUrl) {
    throw new Error("PERSONA_DATABASE_URL is required on backend runtime.");
  }

  if (config.mode === "real_backend" && config.allowDbWrite !== true) {
    throw new Error("Real backend write is not enabled.");
  }

  return true;
}

module.exports = {
  ALLOWED_MODES,
  getBackendRuntimeConfig,
  assertCanStartBackend
};
