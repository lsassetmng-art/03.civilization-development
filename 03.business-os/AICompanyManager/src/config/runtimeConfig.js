window.AICM_RUNTIME_CONFIG = {
  appName: "AICompanyManager",
  displayName: "AI企業運営アプリ",
  mode: "mock",
  serverRouteBase: "/api/v1/business/ai-company-manager",
  aiworkerBridgeMode: "server-mediated",
  dbTargetLabel: "persona-side-db",
  rlsApplyStatus: "NOT_EXECUTED",

  isMock: function () {
    return window.AICM_RUNTIME_CONFIG.mode !== "live";
  }
};
