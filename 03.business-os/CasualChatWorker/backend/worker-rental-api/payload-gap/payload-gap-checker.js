const REQUIRED = {
  serviceCatalog: [
    "app_code",
    "service_code",
    "service_name",
    "supported_units",
    "minimum_contract",
    "app_max_contract",
    "monthly_free_ticket_rule"
  ],

  quoteResponse: [
    "quote_id",
    "app_code",
    "service_code",
    "rental_unit_kind",
    "rental_unit_count",
    "base_price_jpy",
    "applied_entitlement_count",
    "free_unit_count",
    "paid_unit_count",
    "final_price_jpy",
    "entitlement_source_rule",
    "price_version",
    "currency_code"
  ],

  confirmResponse: [
    "rental_contract_id",
    "rental_period_id",
    "app_code",
    "service_code",
    "status",
    "rental_unit_kind",
    "rental_unit_count",
    "final_price_jpy",
    "remaining_entitlement_count"
  ]
};

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value || {}, key);
}

function checkRequiredFields(payloadName, payload) {
  const requiredFields = REQUIRED[payloadName];

  if (!requiredFields) {
    throw new Error(`Unknown payload name: ${payloadName}`);
  }

  const missing = requiredFields.filter((field) => !hasOwn(payload, field));

  return {
    payloadName,
    ok: missing.length === 0,
    missing,
    requiredFields
  };
}

function assertCasualChatWorkerPayload(payload) {
  if (payload.app_code !== "CasualChatWorker") {
    throw new Error("app_code must be CasualChatWorker.");
  }

  if (payload.service_code !== "casual_chat_worker") {
    throw new Error("service_code must be casual_chat_worker.");
  }

  return true;
}

function runPayloadGapCheck(samples) {
  const results = [];

  for (const [payloadName, payload] of Object.entries(samples)) {
    const result = checkRequiredFields(payloadName, payload);
    if (payload && payload.app_code) {
      assertCasualChatWorkerPayload(payload);
    }
    results.push(result);
  }

  return {
    ok: results.every((result) => result.ok),
    results
  };
}

module.exports = {
  REQUIRED,
  checkRequiredFields,
  assertCasualChatWorkerPayload,
  runPayloadGapCheck
};
