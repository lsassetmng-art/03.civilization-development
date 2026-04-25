const http = require("http");
const https = require("https");
const { runPayloadGapCheck } = require("./payload-gap-checker");

function requestJson(baseUrl, path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const payload = body ? JSON.stringify(body) : null;
    const lib = url.protocol === "https:" ? https : http;

    const req = lib.request({
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload ? Buffer.byteLength(payload) : 0
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : {}
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  const baseUrl = process.env.CCW_API_BASE_URL;
  const userId = process.env.CCW_TEST_USER_ID || "00000000-0000-0000-0000-000000000001";

  if (process.env.CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK !== "1") {
    throw new Error("Set CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK=1 to run live payload gap check.");
  }

  if (!baseUrl) {
    throw new Error("CCW_API_BASE_URL is required.");
  }

  const serviceCatalog = await requestJson(
    baseUrl,
    "/api/v1/business/worker-rental/service/catalog?app_code=CasualChatWorker&service_code=casual_chat_worker"
  );

  if (serviceCatalog.statusCode !== 200) {
    throw new Error(`service catalog failed: ${serviceCatalog.statusCode}`);
  }

  const quote90 = await requestJson(
    baseUrl,
    "/api/v1/business/worker-rental/quote",
    "POST",
    {
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      user_id: userId,
      worker_owner_schema: "aiworker",
      worker_id: "lover-ren",
      worker_type: "Lover",
      rental_unit_kind: "minute",
      rental_unit_count: 90,
      requested_entitlement_kind: "monthly_shortest_contract_free_ticket",
      requested_entitlement_count: 2,
      currency_code: "JPY"
    }
  );

  if (quote90.statusCode !== 200) {
    throw new Error(`quote90 failed: ${quote90.statusCode}`);
  }

  const badQuote = await requestJson(
    baseUrl,
    "/api/v1/business/worker-rental/quote",
    "POST",
    {
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      user_id: userId,
      worker_owner_schema: "aiworker",
      worker_id: "lover-ren",
      worker_type: "Lover",
      rental_unit_kind: "minute",
      rental_unit_count: 150,
      requested_entitlement_kind: "monthly_shortest_contract_free_ticket",
      requested_entitlement_count: 0,
      currency_code: "JPY"
    }
  );

  if (badQuote.statusCode < 400) {
    throw new Error("150 minute quote must be rejected.");
  }

  const samples = {
    serviceCatalog: serviceCatalog.body,
    quoteResponse: quote90.body
  };

  if (process.env.CCW_ALLOW_LIVE_CONFIRM_TEST === "1") {
    const confirm90 = await requestJson(
      baseUrl,
      "/api/v1/business/worker-rental/confirm",
      "POST",
      {
        app_code: "CasualChatWorker",
        service_code: "casual_chat_worker",
        user_id: userId,
        quote_id: quote90.body.quote_id || `quote-live-${Date.now()}`,
        worker_owner_schema: "aiworker",
        worker_id: "lover-ren",
        worker_type: "Lover",
        rental_unit_kind: "minute",
        rental_unit_count: 90,
        apply_entitlement_count: 2,
        confirmed_price_jpy: 500
      }
    );

    if (confirm90.statusCode !== 200) {
      throw new Error(`confirm90 failed: ${confirm90.statusCode}`);
    }

    samples.confirmResponse = confirm90.body;
  }

  const result = runPayloadGapCheck(samples);

  if (!result.ok) {
    throw new Error(`payload gap check failed: ${JSON.stringify(result.results)}`);
  }

  console.log("LIVE PAYLOAD GAP CHECK PASS");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
