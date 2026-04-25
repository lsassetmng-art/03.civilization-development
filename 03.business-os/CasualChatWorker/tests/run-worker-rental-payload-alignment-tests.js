const fs = require("fs");
const vm = require("vm");
const path = require("path");

const implRoot = "/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker";

global.window = global;

function load(relativePath) {
  const fullPath = path.join(implRoot, relativePath);
  const code = fs.readFileSync(fullPath, "utf8");
  vm.runInThisContext(code, { filename: fullPath });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(implRoot, relativePath), "utf8"));
}

function main() {
  load("domain/constants.js");
  load("pricing/pricing-domain.js");
  load("domain/worker-rental-mapping.js");
  load("api-client/worker-rental-payload-client.js");

  assert(window.CCW_WORKER_RENTAL_MAPPING.appCode === "CasualChatWorker", "appCode mismatch");
  assert(window.CCW_WORKER_RENTAL_MAPPING.serviceCode === "casual_chat_worker", "serviceCode mismatch");

  const min = window.CCW_WORKER_RENTAL_MAPPING.minimumContract;
  const max = window.CCW_WORKER_RENTAL_MAPPING.appMaximumContract;
  assert(min.rentalUnitKind === "minute", "minimum unit must be minute");
  assert(min.rentalUnitCount === 30, "minimum must be 30 minutes");
  assert(max.rentalUnitKind === "minute", "maximum unit must be minute");
  assert(max.rentalUnitCount === 120, "maximum must be 120 minutes");

  const ticket = window.CCW_WORKER_RENTAL_MAPPING.monthlyFreeTicketRule;
  assert(ticket.sourceRule === "shortest_contract_duration", "free ticket source rule mismatch");
  assert(ticket.quantity === 2, "ticket quantity must be 2");
  assert(ticket.entitlementUnitKind === "minute", "ticket unit kind must be minute");
  assert(ticket.entitlementUnitCount === 30, "ticket unit count must be 30");
  assert(ticket.freeMinutesEach === 30, "one ticket must be 30 minutes for this app");

  assert(window.CCW_WORKER_RENTAL_MAPPING.validateRentalDuration("minute", 30).valid === true, "30 minutes should be valid");
  assert(window.CCW_WORKER_RENTAL_MAPPING.validateRentalDuration("minute", 120).valid === true, "120 minutes should be valid");
  assert(window.CCW_WORKER_RENTAL_MAPPING.validateRentalDuration("minute", 150).valid === false, "150 minutes should be invalid");
  assert(window.CCW_WORKER_RENTAL_MAPPING.validateRentalDuration("hour", 1).valid === false, "hour should be invalid for CasualChatWorker v1");

  const quote = window.CCW_PRICING_DOMAIN.calculateQuote(90, 2, true);
  assert(quote.finalPriceJpy === 500, "90 minutes with two tickets must be 500 JPY");

  const worker = {
    aiWorkerId: "lover-ren",
    workerType: "Lover"
  };

  const request = window.CCW_WORKER_RENTAL_PAYLOAD_CLIENT.buildQuoteRequest({
    userId: "00000000-0000-0000-0000-000000000001",
    worker,
    durationMinutes: 90,
    requestedFreeTicketCount: 2
  });

  assert(request.app_code === "CasualChatWorker", "quote request app_code mismatch");
  assert(request.service_code === "casual_chat_worker", "quote request service_code mismatch");
  assert(request.rental_unit_kind === "minute", "quote request unit kind mismatch");
  assert(request.rental_unit_count === 90, "quote request unit count mismatch");
  assert(request.requested_entitlement_kind === "monthly_shortest_contract_free_ticket", "quote request entitlement mismatch");

  const quoteResponse = readJson("api-client/fixtures/worker-rental-quote-response-90-lover-two-tickets.json");
  assert(quoteResponse.final_price_jpy === 500, "fixture quote final price mismatch");
  assert(quoteResponse.entitlement_source_rule === "shortest_contract_duration", "fixture entitlement source mismatch");

  const balance = readJson("api-client/fixtures/worker-rental-free-ticket-balance-response.json");
  assert(balance.entitlement_unit_count === 30, "fixture ticket unit count mismatch");
  assert(balance.remaining_quantity === 2, "fixture remaining quantity mismatch");

  console.log("CasualChatWorker WorkerRentalCore payload alignment test PASS");
}

main();
