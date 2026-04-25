const { EventEmitter } = require("events");
const { createInMemoryWorkerRentalRepository } = require("../backend/worker-rental-api/repositories/in-memory-worker-rental-repository");
const { createWorkerRentalHttpHandler } = require("../backend/worker-rental-api/server/worker-rental-http-router");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

class MockReq extends EventEmitter {
  constructor(method, url, body) {
    super();
    this.method = method;
    this.url = url;
    this.body = body;
  }

  start() {
    if (this.body) {
      this.emit("data", Buffer.from(JSON.stringify(this.body)));
    }
    this.emit("end");
  }
}

class MockRes {
  constructor() {
    this.headers = {};
    this.statusCode = 0;
    this.body = "";
  }

  setHeader(key, value) {
    this.headers[key] = value;
  }

  end(value) {
    this.body = value;
    if (this.resolve) this.resolve();
  }

  wait() {
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  json() {
    return JSON.parse(this.body);
  }
}

async function invoke(handler, method, url, body) {
  const req = new MockReq(method, url, body);
  const res = new MockRes();
  const wait = res.wait();
  handler(req, res);
  req.start();
  await wait;
  return res;
}

async function main() {
  const repository = createInMemoryWorkerRentalRepository();
  const userId = "00000000-0000-0000-0000-000000000001";
  const handler = createWorkerRentalHttpHandler({
    workerRentalRepository: repository,
    contextProvider: async () => ({
      actorType: "member",
      actorUserId: userId
    }),
    idFactory: {
      quoteId: () => "quote-http-test"
    }
  });

  const catalogRes = await invoke(
    handler,
    "GET",
    "/api/v1/business/worker-rental/service/catalog?app_code=CasualChatWorker&service_code=casual_chat_worker"
  );

  assert(catalogRes.statusCode === 200, "catalog status mismatch");
  assert(catalogRes.json().app_code === "CasualChatWorker", "catalog app mismatch");

  const quoteRes = await invoke(
    handler,
    "POST",
    "/api/v1/business/worker-rental/quote",
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

  assert(quoteRes.statusCode === 200, "quote status mismatch");
  assert(quoteRes.json().final_price_jpy === 500, "quote final mismatch");

  const confirmRes = await invoke(
    handler,
    "POST",
    "/api/v1/business/worker-rental/confirm",
    {
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      user_id: userId,
      quote_id: "quote-http-test",
      worker_owner_schema: "aiworker",
      worker_id: "lover-ren",
      worker_type: "Lover",
      rental_unit_kind: "minute",
      rental_unit_count: 90,
      apply_entitlement_count: 2,
      confirmed_price_jpy: 500
    }
  );

  assert(confirmRes.statusCode === 200, "confirm status mismatch");
  assert(confirmRes.json().status === "confirmed", "confirm result mismatch");

  const badRes = await invoke(
    handler,
    "POST",
    "/api/v1/business/worker-rental/quote",
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

  assert(badRes.statusCode === 400, "150 minute quote should fail");

  console.log("HTTP endpoint wiring candidate test PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
