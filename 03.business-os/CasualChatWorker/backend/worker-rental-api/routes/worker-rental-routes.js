const service = require("../worker-rental-backend-service");

function requireQuery(query, key) {
  if (!query || !query[key]) {
    throw new Error(`Missing required query: ${key}`);
  }
  return query[key];
}

function requireBody(body, key) {
  if (!body || body[key] === undefined || body[key] === null || body[key] === "") {
    throw new Error(`Missing required body: ${key}`);
  }
  return body[key];
}

async function getServiceCatalog(req, deps) {
  const appCode = requireQuery(req.query, "app_code");
  const serviceCode = requireQuery(req.query, "service_code");

  const row = await deps.repositories.serviceCatalog.findActive(appCode, serviceCode);
  return service.buildServiceCatalogResponse(row);
}

async function getEntitlementBalance(req, deps) {
  const appCode = requireQuery(req.query, "app_code");
  const serviceCode = requireQuery(req.query, "service_code");
  const userId = requireQuery(req.query, "user_id");
  const grantPeriod = requireQuery(req.query, "grant_period");

  return deps.repositories.entitlementBalance.findActive(appCode, serviceCode, userId, grantPeriod);
}

async function postQuote(req, deps) {
  const payload = req.body || {};

  [
    "app_code",
    "service_code",
    "user_id",
    "worker_owner_schema",
    "worker_id",
    "worker_type",
    "rental_unit_kind",
    "rental_unit_count",
    "requested_entitlement_kind",
    "requested_entitlement_count",
    "currency_code"
  ].forEach((key) => requireBody(payload, key));

  service.assertCasualChatWorkerRequest(payload);

  const validation = service.validateRentalDuration(payload.rental_unit_kind, payload.rental_unit_count);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const priceRow = await deps.repositories.priceCatalog.findActive(
    payload.app_code,
    payload.service_code,
    payload.rental_unit_kind,
    Number(payload.rental_unit_count)
  );

  const balanceRow = await deps.repositories.entitlementBalance.findActive(
    payload.app_code,
    payload.service_code,
    payload.user_id,
    "current"
  );

  return service.buildQuoteResponse({
    quoteId: deps.idFactory.quoteId(),
    payload,
    priceRow,
    balanceRow
  });
}

async function postConfirm(req, deps) {
  const payload = req.body || {};

  [
    "app_code",
    "service_code",
    "user_id",
    "quote_id",
    "worker_owner_schema",
    "worker_id",
    "worker_type",
    "rental_unit_kind",
    "rental_unit_count",
    "apply_entitlement_count",
    "confirmed_price_jpy"
  ].forEach((key) => requireBody(payload, key));

  service.assertCasualChatWorkerRequest(payload);

  const validation = service.validateRentalDuration(payload.rental_unit_kind, payload.rental_unit_count);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  return {
    status: "skeleton_only",
    message: "Confirm endpoint requires transactional backend implementation.",
    accepted_payload_shape: true,
    app_code: payload.app_code,
    service_code: payload.service_code
  };
}

module.exports = {
  getServiceCatalog,
  getEntitlementBalance,
  postQuote,
  postConfirm
};
