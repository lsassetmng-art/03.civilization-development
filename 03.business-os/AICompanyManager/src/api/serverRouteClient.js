window.AICM_SERVER_ROUTE_CLIENT = {
  request: function (method, path, payload) {
    if (window.AICM_RUNTIME_CONFIG.isMock()) {
      return Promise.resolve({
        ok: true,
        mock: true,
        method: method,
        path: path,
        payload: payload,
        created_at: new Date().toISOString()
      });
    }

    return window.fetch(window.AICM_RUNTIME_CONFIG.serverRouteBase + path, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: payload ? JSON.stringify(payload) : undefined
    }).then(function (response) {
      return response.json();
    });
  },

  startPipeline: function (payload) {
    return window.AICM_SERVER_ROUTE_CLIENT.request("POST", "/pipeline/start", payload);
  },

  pullSnapshot: function (request) {
    return window.AICM_SERVER_ROUTE_CLIENT.request("POST", "/pipeline/snapshot", request);
  }
};
