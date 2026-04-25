window.CCW_REAL_WORKER_RENTAL_API_ADAPTER = {
  async requestJson(path, options = {}) {
    const config = window.CCW_RUNTIME_CONFIG;

    if (!config || !config.canUseRealApi()) {
      throw new Error("Real API mode is not enabled.");
    }

    const url = `${config.apiBaseUrl}${path}`;
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`WorkerRentalCore API error ${response.status}: ${text}`);
    }

    return response.json();
  },

  getServiceCatalog() {
    const config = window.CCW_RUNTIME_CONFIG;
    const params = new URLSearchParams({
      app_code: config.appCode,
      service_code: config.serviceCode
    });

    return this.requestJson(`/api/v1/business/worker-rental/service/catalog?${params.toString()}`);
  },

  getEntitlementBalance(userId, grantPeriod = "current") {
    const config = window.CCW_RUNTIME_CONFIG;
    const params = new URLSearchParams({
      app_code: config.appCode,
      service_code: config.serviceCode,
      user_id: userId,
      grant_period: grantPeriod
    });

    return this.requestJson(`/api/v1/business/worker-rental/entitlement/balance?${params.toString()}`);
  },

  quoteRental(payload) {
    return this.requestJson("/api/v1/business/worker-rental/quote", {
      method: "POST",
      body: payload
    });
  },

  confirmRental(payload) {
    return this.requestJson("/api/v1/business/worker-rental/confirm", {
      method: "POST",
      body: payload
    });
  },

  endPeriod(payload) {
    return this.requestJson("/api/v1/business/worker-rental/period/end", {
      method: "POST",
      body: payload
    });
  },

  getHistory(userId, page = 1, pageSize = 20) {
    const config = window.CCW_RUNTIME_CONFIG;
    const params = new URLSearchParams({
      app_code: config.appCode,
      service_code: config.serviceCode,
      user_id: userId,
      page: String(page),
      page_size: String(pageSize)
    });

    return this.requestJson(`/api/v1/business/worker-rental/history?${params.toString()}`);
  }
};
