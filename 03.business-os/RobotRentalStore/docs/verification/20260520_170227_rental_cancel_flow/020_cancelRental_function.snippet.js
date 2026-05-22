function cancelRental(body, context) {
  const contextCheck = validateCivilizationContext(context);

  if (!contextCheck.ok || !contextCheck.persist_allowed || !context.owner_civilization_id) {
    return {
      ok: false,
      error: contextCheck.error || "civilization_context_required_for_rental_cancel",
      owner_civilization_id: context && context.owner_civilization_id ? context.owner_civilization_id : null
    };
  }

  const contractId = String(body.rental_contract_id || body.contract_id || "").trim();
  const cancelReason = String(body.cancel_reason || "user canceled rental").trim();

  if (!isUuidLike(contractId)) {
    return { ok: false, error: "invalid_rental_contract_id" };
  }

  const owner = context.owner_civilization_id;

  const sql = `
BEGIN;

WITH target AS (
  SELECT
    rental_contract_id,
    owner_civilization_id,
    contract_status
  FROM business.worker_rental_contract
  WHERE rental_contract_id = ${sqlUuid(contractId)}
    AND owner_civilization_id = ${sqlUuid(owner)}
    AND contract_status IN ('quoted', 'confirmed')
  FOR UPDATE
),
upd_contract AS (
  UPDATE business.worker_rental_contract c
  SET
    contract_status = 'canceled',
    updated_at = now(),
    metadata_jsonb = COALESCE(c.metadata_jsonb, '{}'::jsonb)
      || jsonb_build_object(
        'canceled_at', now(),
        'cancel_source', 'RobotRentalStore',
        'cancel_reason', ${sqlLit(cancelReason)}
      )
  FROM target t
  WHERE c.rental_contract_id = t.rental_contract_id
  RETURNING
    c.rental_contract_id,
    c.owner_civilization_id,
    t.contract_status AS from_status,
    c.contract_status
),
upd_period AS (
  UPDATE business.worker_rental_period p
  SET
    period_status = 'canceled',
    actual_ended_at = COALESCE(p.actual_ended_at, now()),
    remaining_seconds_snapshot = 0,
    updated_at = now()
  FROM upd_contract c
  WHERE p.rental_contract_id = c.rental_contract_id
    AND p.owner_civilization_id = c.owner_civilization_id
    AND p.period_status IN ('pending')
  RETURNING
    p.rental_period_id,
    p.period_status
),
upd_payment AS (
  UPDATE business.worker_rental_payment_intent pi
  SET
    payment_status = 'canceled',
    updated_at = now()
  FROM upd_contract c
  WHERE pi.rental_contract_id = c.rental_contract_id
    AND pi.owner_civilization_id = c.owner_civilization_id
    AND pi.payment_status IN ('pending', 'authorized')
  RETURNING
    pi.rental_payment_intent_id,
    pi.payment_status
),
hist AS (
  INSERT INTO business.worker_rental_status_history (
    rental_contract_id,
    owner_civilization_id,
    from_status,
    to_status,
    reason
  )
  SELECT
    rental_contract_id,
    owner_civilization_id,
    from_status,
    'canceled',
    ${sqlLit(cancelReason)}
  FROM upd_contract
  RETURNING rental_status_history_id
)
SELECT
  'CANCEL_RESULT',
  (SELECT rental_contract_id::text FROM upd_contract),
  (SELECT owner_civilization_id::text FROM upd_contract),
  (SELECT from_status FROM upd_contract),
  (SELECT contract_status FROM upd_contract),
  COALESCE((SELECT rental_period_id::text FROM upd_period LIMIT 1), ''),
  COALESCE((SELECT period_status FROM upd_period LIMIT 1), ''),
  COALESCE((SELECT rental_payment_intent_id::text FROM upd_payment LIMIT 1), ''),
  COALESCE((SELECT payment_status FROM upd_payment LIMIT 1), ''),
  (SELECT rental_status_history_id::text FROM hist);

COMMIT;
`;

  const out = psql(sql).trim();
  const line = out.split("\n").find((x) => x.startsWith("CANCEL_RESULT\t")) || "";
  const parts = line.split("\t");

  if (parts.length < 10 || !parts[1]) {
    return {
      ok: false,
      error: "contract_not_cancelable_or_owner_mismatch",
      rental_contract_id: contractId,
      owner_civilization_id: owner,
      detail: out
    };
  }

  return {
    ok: true,
    rental_contract_id: parts[1],
    owner_civilization_id: parts[2],
    from_status: parts[3],
    contract_status: parts[4],
    rental_period_id: parts[5] || null,
    period_status: parts[6] || null,
    rental_payment_intent_id: parts[7] || null,
    payment_status: parts[8] || null,
    rental_status_history_id: parts[9],
    next_action: "rental_canceled"
  };
}

