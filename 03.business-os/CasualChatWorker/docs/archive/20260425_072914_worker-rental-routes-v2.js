const baseRoutes = require("./worker-rental-routes");
const txService = require("../transactions/confirm-rental-transaction-service");

function requireBody(body, key) {
  if (!body || body[key] === undefined || body[key] === null || body[key] === "") {
    throw new Error(`Missing required body: ${key}`);
  }
  return body[key];
}

async function postConfirmWithTransaction(req, deps) {
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

  return txService.confirmRental({
    repository: deps.workerRentalRepository,
    context: deps.context,
    payload,
    quoteId: payload.quote_id
  });
}

module.exports = {
  ...baseRoutes,
  postConfirmWithTransaction
};
