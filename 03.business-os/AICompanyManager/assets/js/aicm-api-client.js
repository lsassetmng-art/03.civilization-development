(function (global) {
  "use strict";

  function createRequestId() {
    return "aicm_req_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  }

  function AicmApiClient(options) {
    this.options = options || {};
    this.baseUrl = this.options.baseUrl || "";
    this.allowNetwork = this.options.allowNetwork === true;
  }

  AicmApiClient.prototype.request = function request(method, path, body) {
    var requestId = createRequestId();

    if (!this.allowNetwork) {
      return Promise.resolve({
        ok: false,
        error_code: "API_NETWORK_DISABLED",
        error_message: "API network calls are disabled in this phase.",
        details: {
          method: method,
          path: path,
          body: body || null
        },
        request_id: requestId
      });
    }

    return fetch(this.baseUrl + path, {
      method: method,
      headers: {
        "content-type": "application/json",
        "x-aicm-request-id": requestId
      },
      body: body == null ? undefined : JSON.stringify(body)
    }).then(function (response) {
      return response.json();
    }).catch(function (error) {
      return {
        ok: false,
        error_code: "API_CLIENT_ERROR",
        error_message: String(error && error.message ? error.message : error),
        details: {},
        request_id: requestId
      };
    });
  };

  global.AICM = global.AICM || {};
  global.AICM.AicmApiClient = AicmApiClient;
})(window);
