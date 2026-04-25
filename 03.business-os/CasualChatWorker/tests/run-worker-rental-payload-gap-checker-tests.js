const { runPayloadGapCheck } = require("../backend/worker-rental-api/payload-gap/payload-gap-checker");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const result = runPayloadGapCheck({
    serviceCatalog: {
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      service_name: "雑談ワーカー",
      supported_units: { minute: true },
      minimum_contract: { unit_kind: "minute", unit_count: 30, total_minutes: 30 },
      app_max_contract: { unit_kind: "minute", unit_count: 120, total_minutes: 120 },
      monthly_free_ticket_rule: { source_rule: "shortest_contract_duration", quantity: 2, unit_count: 30 }
    },
    quoteResponse: {
      quote_id: "quote-gap",
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      rental_unit_kind: "minute",
      rental_unit_count: 90,
      base_price_jpy: 1500,
      applied_entitlement_count: 2,
      free_unit_count: 60,
      paid_unit_count: 30,
      final_price_jpy: 500,
      entitlement_source_rule: "shortest_contract_duration",
      price_version: "v1",
      currency_code: "JPY"
    },
    confirmResponse: {
      rental_contract_id: "contract-gap",
      rental_period_id: "period-gap",
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      status: "confirmed",
      rental_unit_kind: "minute",
      rental_unit_count: 90,
      final_price_jpy: 500,
      remaining_entitlement_count: 0
    }
  });

  assert(result.ok === true, "payload gap check should pass");

  const bad = runPayloadGapCheck({
    quoteResponse: {
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker"
    }
  });

  assert(bad.ok === false, "bad payload gap check should fail");

  console.log("Payload gap checker test PASS");
}

main();
