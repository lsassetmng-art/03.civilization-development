function endRental(body, context) {
  const contextCheck = validateCivilizationContext(context);

  if (!contextCheck.ok || !contextCheck.persist_allowed || !context.owner_civilization_id) {
    return {
      ok: false,
      error: contextCheck.error || "civilization_context_required_for_rental_end",
      owner_civilization_id: context && context.owner_civilization_id ? context.owner_civilization_id : null
    };
  }

  const contractId = String(body.rental_contract_id || body.contract_id || "").trim();
  const endedReason = String(body.ended_reason || "user ended rental").trim();

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
    app_code,
    service_code,
    user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    contract_status
  FROM business.worker_rental_contract
  WHERE rental_contract_id = ${sqlUuid(contractId)}
    AND owner_civilization_id = ${sqlUuid(owner)}
    AND contract_status = 'active'
  FOR UPDATE
),
active_period AS (
  SELECT
    p.rental_period_id,
    p.rental_contract_id,
    p.owner_civilization_id,
    p.period_status,
    p.actual_started_at
  FROM business.worker_rental_period p
  JOIN target t
    ON t.rental_contract_id = p.rental_contract_id
   AND t.owner_civilization_id = p.owner_civilization_id
  WHERE p.period_status = 'active'
  ORDER BY p.created_at DESC
  LIMIT 1
),
upd_contract AS (
  UPDATE business.worker_rental_contract c
  SET
    contract_status = 'ended',
    updated_at = now(),
    metadata_jsonb = COALESCE(c.metadata_jsonb, '{}'::jsonb)
      || jsonb_build_object(
        'ended_at', now(),
        'end_source', 'RobotRentalStore'
      )
  FROM target t
  WHERE c.rental_contract_id = t.rental_contract_id
  RETURNING
    c.rental_contract_id,
    c.owner_civilization_id,
    c.app_code,
    c.service_code,
    c.user_id,
    c.worker_owner_schema,
    c.worker_id,
    c.worker_type,
    c.contract_status
),
upd_period AS (
  UPDATE business.worker_rental_period p
  SET
    period_status = 'ended',
    actual_ended_at = COALESCE(p.actual_ended_at, now()),
    remaining_seconds_snapshot = 0,
    updated_at = now()
  FROM active_period ap
  WHERE p.rental_period_id = ap.rental_period_id
  RETURNING
    p.rental_period_id,
    p.period_status,
    p.actual_started_at::text AS actual_started_at,
    p.actual_ended_at::text AS actual_ended_at,
    0::integer AS remaining_seconds_snapshot,
    GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (p.actual_ended_at - p.actual_started_at))))::integer AS used_seconds
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
    'active',
    'ended',
    ${sqlLit(endedReason)}
  FROM upd_contract
  RETURNING rental_status_history_id
),
summary AS (
  INSERT INTO business.worker_rental_end_summary (
    rental_contract_id,
    rental_period_id,
    owner_civilization_id,
    app_code,
    service_code,
    user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    ended_reason,
    used_seconds,
    summary_text
  )
  SELECT
    c.rental_contract_id,
    p.rental_period_id,
    c.owner_civilization_id,
    c.app_code,
    c.service_code,
    c.user_id,
    c.worker_owner_schema,
    c.worker_id,
    c.worker_type,
    ${sqlLit(endedReason)},
    p.used_seconds,
    'RobotRentalStore rental ended by user'
  FROM upd_contract c
  JOIN upd_period p ON true
  RETURNING rental_end_summary_id
)
SELECT
  'END_RESULT',
  (SELECT rental_contract_id::text FROM upd_contract),
  (SELECT owner_civilization_id::text FROM upd_contract),
  (SELECT contract_status FROM upd_contract),
  (SELECT rental_period_id::text FROM upd_period),
  (SELECT period_status FROM upd_period),
  (SELECT actual_ended_at FROM upd_period),
  (SELECT remaining_seconds_snapshot::text FROM upd_period),
  (SELECT used_seconds::text FROM upd_period),
  (SELECT rental_status_history_id::text FROM hist),
  (SELECT rental_end_summary_id::text FROM summary);

COMMIT;
`;

  const out = psql(sql).trim();
  const line = out.split("\n").find((x) => x.startsWith("END_RESULT\t")) || "";
  const parts = line.split("\t");

  if (parts.length < 11 || !parts[1]) {
    return {
      ok: false,
      error: "contract_not_active_or_active_period_missing_or_owner_mismatch",
      rental_contract_id: contractId,
      owner_civilization_id: owner,
      detail: out
    };
  }

  return {
    ok: true,
    rental_contract_id: parts[1],
    owner_civilization_id: parts[2],
    contract_status: parts[3],
    rental_period_id: parts[4],
    period_status: parts[5],
    actual_ended_at: parts[6],
    remaining_seconds_snapshot: Number(parts[7]),
    used_seconds: Number(parts[8]),
    rental_status_history_id: parts[9],
    rental_end_summary_id: parts[10],
    next_action: "rental_ended"
  };
}

