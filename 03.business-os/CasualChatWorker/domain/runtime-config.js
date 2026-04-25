window.CCW_RUNTIME_CONFIG = {
  apiMode: "mock",
  apiBaseUrl: "",
  appCode: "CasualChatWorker",
  serviceCode: "casual_chat_worker",
  allowRealApi: false,

  canUseRealApi() {
    return this.apiMode === "real" && this.allowRealApi === true && Boolean(this.apiBaseUrl);
  }
};
