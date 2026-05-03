global.AICMBusinessAIWorkerAuthTokenClient = {
  buildHeaders: function buildHeaders(headers) {
    return Object.assign({}, headers || {}, {
      "X-AICM-AIWORKER-TOKEN": "local-aicm-aiworker-dev-token"
    });
  }
};

const client = require("../assets/js/aicm-business-aiworker-api-config-client.js");

function assertOk(condition, message) {
  if (!condition) throw new Error(message);
}

assertOk(client.getBaseUrl() === "http://127.0.0.1:8801", "default base url mismatch");

client.setBaseUrl("http://127.0.0.1:9999/");
assertOk(client.getBaseUrl() === "http://127.0.0.1:9999", "set base url mismatch");

const url = client.buildUrl("/api/v1/test", {
  role_code: "President",
  empty: "",
  none: null
});

assertOk(url === "http://127.0.0.1:9999/api/v1/test?role_code=President", "url build mismatch");

const options = client.buildFetchOptions({
  method: "POST",
  json: {
    ok: true
  }
});

assertOk(options.method === "POST", "method mismatch");
assertOk(options.headers["Content-Type"] === "application/json", "content type missing");
assertOk(options.headers["X-AICM-AIWORKER-TOKEN"] === "local-aicm-aiworker-dev-token", "token header missing");
assertOk(options.body === JSON.stringify({ ok: true }), "json body mismatch");

client.clearBaseUrl();
assertOk(client.getBaseUrl() === "http://127.0.0.1:8801", "clear base url mismatch");

console.log("AICM_BUSINESS_AIWORKER_API_CONFIG_CLIENT_SMOKE_PASS=true");
