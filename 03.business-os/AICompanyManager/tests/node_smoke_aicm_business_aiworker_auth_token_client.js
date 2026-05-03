const client = require("../assets/js/aicm-business-aiworker-auth-token-client.js");

function assertOk(condition, message) {
  if (!condition) throw new Error(message);
}

client.setToken("local-aicm-aiworker-dev-token");
assertOk(client.getToken() === "local-aicm-aiworker-dev-token", "token get/set mismatch");

const headers = client.buildHeaders({
  "Content-Type": "application/json"
});

assertOk(headers["Content-Type"] === "application/json", "content type missing");
assertOk(headers["X-AICM-AIWORKER-TOKEN"] === "local-aicm-aiworker-dev-token", "token header missing");

client.clearToken();
assertOk(client.getToken() === "", "token clear mismatch");

console.log("AICM_BUSINESS_AIWORKER_AUTH_TOKEN_CLIENT_SMOKE_PASS=true");
