const baseService = require("../worker-rental-backend-service");
const authPolicy = require("../policy/auth-session-policy");

function buildQuotePayloadFromConfirm(payload) {
  return {
    app_code: payload.app_code,
    service_code: payload.service_code,
    worker_owner_schema: payload.worker_owner_schema,
    worker_id: payload.worker_id,
    worker_type: payload.worker_type,
    rental_unit_kind: payload.rental_unit_kind,
    rental_unit_count: payload.rental_unit_count,
    requested_entitlement_count: payload.apply_entitlement_count
  };
}

async function issueMonthlyFreeTicketIfNeeded({ repository, appCode, serviceCode, userId, grantPeriod = "current" }) {
  return repository.ensureMonthlyEntitlementBalance({
    appCode,
    serviceCode,
    userId,
    grantPeriod
  });
}

async function quoteRental({ repository, payload, quoteId }) {
  baseService.assertCasualChatWorkerRequest(payload);

  const validation = baseService.validateRentalDuration(payload.rental_unit_kind, payload.rental_unit_count);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  await issueMonthlyFreeTicketIfNeeded({
    repository,
    appCode: payload.app_code,
    serviceCode: payload.service_code,
    userId: payload.user_id,
    grantPeriod: "current"
  });

  const priceRow = await repository.findPriceRow(
    payload.app_code,
    payload.service_code,
    payload.rental_unit_kind,
    Number(payload.rental_unit_count)
  );

  const balanceRow = await repository.findEntitlementBalance(
    payload.app_code,
    payload.service_code,
    payload.user_id,
    "current"
  );

  return baseService.buildQuoteResponse({
    quoteId,
    payload,
    priceRow,
    balanceRow
  });
}

async function confirmRental({ repository, context, payload, quoteId }) {
  authPolicy.assertUserScope(context, payload.user_id);
  authPolicy.assertCasualChatWorkerScope(payload);

  const quotePayload = buildQuotePayloadFromConfirm(payload);
  const quote = await quoteRental({
    repository,
    payload: quotePayload,
    quoteId
  });

  if (Number(quote.final_price_jpy) !== Number(payload.confirmed_price_jpy)) {
    throw new Error("Confirmed price mismatch.");
  }

  if (Number(quote.applied_entitlement_count) !== Number(payload.apply_entitlement_count || 0)) {
    throw new Error("Applied entitlement count mismatch.");
  }

  const txResult = await repository.createConfirmedRentalTransaction({
    payload,
    quote
  });

  return baseService.buildConfirmResponse({
    contractRow: txResult.contract,
    periodRow: txResult.period,
    remainingEntitlementCount: txResult.balance.remaining_quantity
  });
}

module.exports = {
  issueMonthlyFreeTicketIfNeeded,
  quoteRental,
  confirmRental
};
