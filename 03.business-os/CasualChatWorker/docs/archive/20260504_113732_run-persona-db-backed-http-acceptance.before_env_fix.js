const http = require("http");
const { createPersonaDbBackedLocalWorkerRentalServer } = require("../backend/worker-rental-api/server/persona-db-backed-local-worker-rental-server");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requestJson({ port, method, path, body }) {
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
  if (!process.env.PERSONA_DATABASE_URL) {
    throw new Error("PERSONA_DATABASE_URL is required.");
  }
  if (process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be unset for this test.");
  }

  process.env.CCW_ALLOW_ROLLBACK_CONFIRM = "1";

  const server = createPersonaDbBackedLocalWorkerRentalServer();

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  const port = address.port;

  try {
    const health = await requestJson({
      port,
      method: "GET",
      path: "/health"
    });

    assert(health.statusCode === 200, "health should be 200");
    assert(health.body.ok === true, "health ok");
    assert(health.body.db_env === "PERSONA_DATABASE_URL", "db env should be PERSONA_DATABASE_URL");

    const catalog = await requestJson({
      port,
      method: "GET",
      path: "/api/v1/business/worker-rental/service/catalog?app_code=CasualChatWorker&service_code=casual_chat_worker"
    });

    assert(catalog.statusCode === 200, "catalog should be 200");
    assert(catalog.body.app_code === "CasualChatWorker", "catalog app");
    assert(catalog.body.service_code === "casual_chat_worker", "catalog service");
    assert(catalog.body.minimum_contract.total_minutes === 30, "min 30");
    assert(catalog.body.app_max_contract.total_minutes === 120, "max 120");
    assert(catalog.body.monthly_free_ticket.quantity === 2, "ticket qty 2");
    assert(catalog.body.monthly_free_ticket.source_rule === "shortest_contract_duration", "ticket rule");

    const quote90 = await requestJson({
      port,
      method: "POST",
      path: "/api/v1/business/worker-rental/quote",
      body: {
        app_code: "CasualChatWorker",
        service_code: "casual_chat_worker",
        rental_unit_kind: "minute",
        rental_unit_count: 90,
        requested_entitlement_count: 2
      }
    });

    assert(quote90.statusCode === 200, "quote90 should be 200");
    assert(quote90.body.ok === true, "quote90 ok");
    assert(quote90.body.base_price_jpy === 1500, "quote90 base 1500");
    assert(quote90.body.applied_entitlement_count === 2, "quote90 2 tickets");
    assert(quote90.body.free_unit_count === 60, "quote90 60 free");
    assert(quote90.body.paid_unit_count === 30, "quote90 paid 30");
    assert(quote90.body.final_price_jpy === 500, "quote90 final 500");

    const quote150 = await requestJson({
      port,
      method: "POST",
      path: "/api/v1/business/worker-rental/quote",
      body: {
        app_code: "CasualChatWorker",
        service_code: "casual_chat_worker",
        rental_unit_kind: "minute",
        rental_unit_count: 150,
        requested_entitlement_count: 0
      }
    });

    assert(quote150.statusCode === 400, "quote150 should be rejected");
    assert(quote150.body.ok === false, "quote150 not ok");
    assert(quote150.body.reason === "APP_MAX_CONTRACT_EXCEEDED", "quote150 reason");

    const confirm = await requestJson({
      port,
      method: "POST",
      path: "/api/v1/business/worker-rental/confirm",
      body: {
        app_code: "CasualChatWorker",
        service_code: "casual_chat_worker",
        rental_unit_kind: "minute",
        rental_unit_count: 90,
        apply_entitlement_count: 2
      }
    });

    assert(confirm.statusCode === 200, `confirm should be 200: ${JSON.stringify(confirm.body)}`);
    assert(confirm.body.ok === true, "confirm ok");
    assert(confirm.body.rollback_only === true, "confirm rollback only");
    assert(confirm.body.status === "confirmed", "confirm status");
    assert(confirm.body.final_price_jpy === 500, "confirm final 500");
    assert(confirm.body.remaining_entitlement_count === 0, "remaining tickets 0");
    assert(confirm.body.remaining_entitlement_units === 0, "remaining units 0");
    assert(confirm.body.line_count === 2, "line count 2");
    assert(confirm.body.line_amount_total === 500, "line total 500");
    assert(confirm.body.remaining_seconds_snapshot === 5400, "remaining seconds");
    assert(confirm.body.residual.grant_count === 0, "grant residual 0");
    assert(confirm.body.residual.contract_count === 0, "contract residual 0");

    console.log("PERSONA_DB_BACKED_HTTP_ACCEPTANCE_PASS");
    console.log(JSON.stringify({
      health: health.body,
      catalog: catalog.body,
      quote90: quote90.body,
      quote150: quote150.body,
      confirm: confirm.body
    }, null, 2));
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
