const http = require("http");
const { createLocalInMemoryServer } = require("../backend/worker-rental-api/server/local-in-memory-worker-rental-server");
const { runPayloadGapCheck } = require("../backend/worker-rental-api/payload-gap/payload-gap-checker");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requestJson({ method, port, path, body }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;

    const req = http.request({
      hostname: "127.0.0.1",
      port,
      path,
      method,
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
  const userId = "00000000-0000-0000-0000-000000000001";
  const local = createLocalInMemoryServer({ userId });
  const address = await local.listen(0);

  try {
    const catalog = await requestJson({
      method: "GET",
      port: address.port,
      path: "/api/v1/business/worker-rental/service/catalog?app_code=CasualChatWorker&service_code=casual_chat_worker"
    });

    assert(catalog.statusCode === 200, "catalog status should be 200");
    assert(catalog.body.app_code === "CasualChatWorker", "catalog app mismatch");
    assert(catalog.body.app_max_contract.total_minutes === 120, "catalog max mismatch");

    const quote30 = await requestJson({
      method: "POST",
      port: address.port,
      path: "/api/v1/business/worker-rental/quote",
      body: {
        app_code: "CasualChatWorker",
        service_code: "casual_chat_worker",
        user_id: userId,
        worker_owner_schema: "aiworker",
        worker_id: "friend-sora",
        worker_type: "Friend",
        rental_unit_kind: "minute",
        rental_unit_count: 30,
        requested_entitlement_kind: "monthly_shortest_contract_free_ticket",
        requested_entitlement_count: 1,
        currency_code: "JPY"
      }
    });

    assert(quote30.statusCode === 200, "quote30 should be 200");
    assert(quote30.body.final_price_jpy === 0, "quote30 should be free");

    const quote90 = await requestJson({
      method: "POST",
      port: address.port,
      path: "/api/v1/business/worker-rental/quote",
      body: {
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
    });

    assert(quote90.statusCode === 200, "quote90 should be 200");
    assert(quote90.body.final_price_jpy === 500, "quote90 should be 500");

    const badQuote = await requestJson({
      method: "POST",
      port: address.port,
      path: "/api/v1/business/worker-rental/quote",
      body: {
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
    });

    assert(badQuote.statusCode === 400, "150 min should be rejected");

    const confirm90 = await requestJson({
      method: "POST",
      port: address.port,
      path: "/api/v1/business/worker-rental/confirm",
      body: {
        app_code: "CasualChatWorker",
        service_code: "casual_chat_worker",
        user_id: userId,
        quote_id: "quote-local-90",
        worker_owner_schema: "aiworker",
        worker_id: "lover-ren",
        worker_type: "Lover",
        rental_unit_kind: "minute",
        rental_unit_count: 90,
        apply_entitlement_count: 2,
        confirmed_price_jpy: 500
      }
    });

    assert(confirm90.statusCode === 200, "confirm90 should be 200");
    assert(confirm90.body.status === "confirmed", "confirm should be confirmed");
    assert(confirm90.body.remaining_entitlement_count === 0, "remaining ticket should be 0");

    const gap = runPayloadGapCheck({
      serviceCatalog: catalog.body,
      quoteResponse: quote90.body,
      confirmResponse: confirm90.body
    });

    assert(gap.ok === true, "payload gap check should pass");

    console.log("Local endpoint integration test PASS");
  } finally {
    await local.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
