const CANON = {
  appCode: "CasualChatWorker",
  serviceCode: "casual_chat_worker",
  supportedUnit: "minute",
  allowedMinutes: [30, 60, 90, 120],
  minMinutes: 30,
  maxMinutes: 120,
  monthlyFreeTicketKind: "monthly_shortest_contract_free_ticket",
  monthlyFreeTicketSourceRule: "shortest_contract_duration"
};

function assertCasualChatWorkerRequest(payload) {
  if (!payload || payload.app_code !== CANON.appCode) {
    throw new Error("Invalid app_code.");
  }

  if (payload.service_code !== CANON.serviceCode) {
    throw new Error("Invalid service_code.");
  }
}

function validateRentalDuration(rentalUnitKind, rentalUnitCount) {
  if (rentalUnitKind !== CANON.supportedUnit) {
    return {
      valid: false,
      reason: "CasualChatWorker supports minute rental only."
    };
  }

  if (!CANON.allowedMinutes.includes(Number(rentalUnitCount))) {
    return {
      valid: false,
      reason: "CasualChatWorker supports only 30 / 60 / 90 / 120 minutes."
    };
  }

  if (Number(rentalUnitCount) > CANON.maxMinutes) {
    return {
      valid: false,
      reason: "CasualChatWorker maximum contract is 120 minutes."
    };
  }

  return {
    valid: true,
    reason: "ok"
  };
}

function buildServiceCatalogResponse(row) {
  if (!row) {
    throw new Error("Service catalog row not found.");
  }

  return {
    app_code: row.app_code,
    service_code: row.service_code,
    service_name: row.service_name,
    supported_units: {
      minute: Boolean(row.supports_minute),
      hour: Boolean(row.supports_hour),
      day: Boolean(row.supports_day),
      month: Boolean(row.supports_month),
      year: Boolean(row.supports_year)
    },
    minimum_contract: {
      unit_kind: row.minimum_contract_unit_kind,
      unit_count: Number(row.minimum_contract_unit_count),
      total_minutes: Number(row.minimum_contract_minutes)
    },
    app_max_contract: {
      unit_kind: row.app_max_contract_unit_kind,
      unit_count: Number(row.app_max_contract_unit_count),
      total_minutes: Number(row.app_max_contract_minutes)
    },
    monthly_free_ticket_rule: {
      enabled: Boolean(row.monthly_free_ticket_enabled),
      quantity: Number(row.monthly_free_ticket_quantity),
      source_rule: row.monthly_free_ticket_source_rule,
      unit_kind: row.monthly_free_ticket_unit_kind,
      unit_count: Number(row.monthly_free_ticket_unit_count),
      carryover_enabled: Boolean(row.monthly_free_ticket_carryover_enabled)
    }
  };
}

function buildQuoteResponse({ quoteId, payload, priceRow, balanceRow }) {
  assertCasualChatWorkerRequest(payload);

  const validation = validateRentalDuration(payload.rental_unit_kind, payload.rental_unit_count);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  if (!priceRow) {
    throw new Error("Price row not found.");
  }

  const basePriceJpy = Number(priceRow.base_price_jpy);
  const requestedCount = Number(payload.requested_entitlement_count || 0);
  const remainingQuantity = balanceRow ? Number(balanceRow.remaining_quantity || 0) : 0;
  const maxTicketByDuration = Math.floor(Number(payload.rental_unit_count) / 30);
  const appliedEntitlementCount = Math.min(requestedCount, remainingQuantity, maxTicketByDuration, 2);
  const freeUnitCount = appliedEntitlementCount * 30;
  const paidUnitCount = Math.max(0, Number(payload.rental_unit_count) - freeUnitCount);
  const finalPriceJpy = Math.max(0, paidUnitCount / 30 * 500);

  return {
    quote_id: quoteId,
    app_code: payload.app_code,
    service_code: payload.service_code,
    worker_owner_schema: payload.worker_owner_schema,
    worker_id: payload.worker_id,
    worker_type: payload.worker_type,
    rental_unit_kind: payload.rental_unit_kind,
    rental_unit_count: Number(payload.rental_unit_count),
    rental_total_minutes: Number(payload.rental_unit_count),
    base_price_jpy: basePriceJpy,
    available_entitlement_count: remainingQuantity,
    applied_entitlement_count: appliedEntitlementCount,
    free_unit_count: freeUnitCount,
    paid_unit_count: paidUnitCount,
    final_price_jpy: finalPriceJpy,
    entitlement_kind: CANON.monthlyFreeTicketKind,
    entitlement_source_rule: CANON.monthlyFreeTicketSourceRule,
    price_version: priceRow.price_version || "v1",
    currency_code: priceRow.currency_code || "JPY"
  };
}

function buildConfirmResponse({ contractRow, periodRow, remainingEntitlementCount }) {
  if (!contractRow) {
    throw new Error("Contract row not found.");
  }

  return {
    rental_contract_id: contractRow.rental_contract_id,
    rental_period_id: periodRow ? periodRow.rental_period_id : null,
    app_code: contractRow.app_code,
    service_code: contractRow.service_code,
    status: contractRow.contract_status,
    worker_owner_schema: contractRow.worker_owner_schema,
    worker_id: contractRow.worker_id,
    worker_type: contractRow.worker_type,
    rental_unit_kind: contractRow.rental_unit_kind,
    rental_unit_count: Number(contractRow.rental_unit_count),
    rental_total_minutes: Number(contractRow.rental_total_minutes || contractRow.rental_unit_count),
    applied_entitlement_count: Number(contractRow.applied_entitlement_count || 0),
    free_unit_count: Number(contractRow.free_unit_count || 0),
    paid_unit_count: Number(contractRow.paid_unit_count || 0),
    final_price_jpy: Number(contractRow.final_price_jpy || 0),
    remaining_entitlement_count: Number(remainingEntitlementCount || 0)
  };
}

module.exports = {
  CANON,
  assertCasualChatWorkerRequest,
  validateRentalDuration,
  buildServiceCatalogResponse,
  buildQuoteResponse,
  buildConfirmResponse
};
