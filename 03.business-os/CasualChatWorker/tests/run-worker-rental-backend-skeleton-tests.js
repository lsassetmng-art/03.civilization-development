const service = require("../backend/worker-rental-api/worker-rental-backend-service");
const routes = require("../backend/worker-rental-api/routes/worker-rental-routes");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  assert(service.CANON.appCode === "CasualChatWorker", "appCode mismatch");
  assert(service.CANON.serviceCode === "casual_chat_worker", "serviceCode mismatch");

  assert(service.validateRentalDuration("minute", 30).valid === true, "30 should be valid");
  assert(service.validateRentalDuration("minute", 120).valid === true, "120 should be valid");
  assert(service.validateRentalDuration("minute", 150).valid === false, "150 should be invalid");
  assert(service.validateRentalDuration("hour", 1).valid === false, "hour should be invalid");

  const catalog = service.buildServiceCatalogResponse({
    app_code: "CasualChatWorker",
    service_code: "casual_chat_worker",
    service_name: "雑談ワーカー",
    supports_minute: true,
    supports_hour: false,
    supports_day: false,
    supports_month: false,
    supports_year: false,
    minimum_contract_unit_kind: "minute",
    minimum_contract_unit_count: 30,
    minimum_contract_minutes: 30,
    app_max_contract_unit_kind: "minute",
    app_max_contract_unit_count: 120,
    app_max_contract_minutes: 120,
    monthly_free_ticket_enabled: true,
    monthly_free_ticket_quantity: 2,
    monthly_free_ticket_source_rule: "shortest_contract_duration",
    monthly_free_ticket_unit_kind: "minute",
    monthly_free_ticket_unit_count: 30,
    monthly_free_ticket_carryover_enabled: false
  });

  assert(catalog.minimum_contract.total_minutes === 30, "min minutes mismatch");
  assert(catalog.app_max_contract.total_minutes === 120, "max minutes mismatch");
  assert(catalog.monthly_free_ticket_rule.quantity === 2, "ticket quantity mismatch");

  const quote = service.buildQuoteResponse({
    quoteId: "quote-test",
    payload: {
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      worker_owner_schema: "aiworker",
      worker_id: "lover-ren",
      worker_type: "Lover",
      rental_unit_kind: "minute",
      rental_unit_count: 90,
      requested_entitlement_count: 2
    },
    priceRow: {
      base_price_jpy: 1500,
      price_version: "v1",
      currency_code: "JPY"
    },
    balanceRow: {
      remaining_quantity: 2
    }
  });

  assert(quote.final_price_jpy === 500, "90 min with two tickets should be 500");
  assert(quote.free_unit_count === 60, "free units should be 60");

  const deps = {
    idFactory: {
      quoteId: () => "quote-route-test"
    },
    repositories: {
      serviceCatalog: {
        findActive: async () => ({
          app_code: "CasualChatWorker",
          service_code: "casual_chat_worker",
          service_name: "雑談ワーカー",
          supports_minute: true,
          supports_hour: false,
          supports_day: false,
          supports_month: false,
          supports_year: false,
          minimum_contract_unit_kind: "minute",
          minimum_contract_unit_count: 30,
          minimum_contract_minutes: 30,
          app_max_contract_unit_kind: "minute",
          app_max_contract_unit_count: 120,
          app_max_contract_minutes: 120,
          monthly_free_ticket_enabled: true,
          monthly_free_ticket_quantity: 2,
          monthly_free_ticket_source_rule: "shortest_contract_duration",
          monthly_free_ticket_unit_kind: "minute",
          monthly_free_ticket_unit_count: 30,
          monthly_free_ticket_carryover_enabled: false
        })
      },
      entitlementBalance: {
        findActive: async () => ({
          remaining_quantity: 2
        })
      },
      priceCatalog: {
        findActive: async () => ({
          base_price_jpy: 1500,
          price_version: "v1",
          currency_code: "JPY"
        })
      }
    }
  };

  const routeQuote = await routes.postQuote({
    body: {
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      user_id: "00000000-0000-0000-0000-000000000001",
      worker_owner_schema: "aiworker",
      worker_id: "lover-ren",
      worker_type: "Lover",
      rental_unit_kind: "minute",
      rental_unit_count: 90,
      requested_entitlement_kind: "monthly_shortest_contract_free_ticket",
      requested_entitlement_count: 2,
      currency_code: "JPY"
    }
  }, deps);

  assert(routeQuote.final_price_jpy === 500, "route quote final mismatch");

  console.log("WorkerRental backend skeleton test PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
