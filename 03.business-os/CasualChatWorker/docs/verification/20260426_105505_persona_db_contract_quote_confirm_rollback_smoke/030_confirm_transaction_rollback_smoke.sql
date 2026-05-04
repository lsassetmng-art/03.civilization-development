\pset pager off
\pset null '(null)'
\echo ============================================================
\echo CCW CONTRACT / QUOTE / CONFIRM ROLLBACK SMOKE
\echo ============================================================

begin;

with params as (
  select
    md5(clock_timestamp()::text || random()::text)::uuid as test_user_id,
    'aiworker'::text as worker_owner_schema,
    'rollback-smoke-lover-worker'::text as worker_id,
    'Lover'::text as worker_type,
    to_char(now(), 'YYYY-MM') || '-confirm-rollback-smoke' as grant_period
),
grant_insert as (
  insert into business.worker_rental_entitlement_grant (
    app_code,
    service_code,
    user_id,
    grant_period,
    entitlement_kind,
    entitlement_source_rule,
    entitlement_unit_kind,
    entitlement_unit_count,
    granted_quantity,
    total_granted_units,
    carryover_enabled,
    grant_status
  )
  select
    'CasualChatWorker',
    'casual_chat_worker',
    test_user_id,
    grant_period,
    'monthly_shortest_contract_free_ticket',
    'shortest_contract_duration',
    'minute',
    30,
    2,
    60,
    false,
    'granted'
  from params
  returning *
),
balance_insert as (
  insert into business.worker_rental_entitlement_balance (
    entitlement_grant_id,
    app_code,
    service_code,
    user_id,
    grant_period,
    entitlement_kind,
    entitlement_source_rule,
    entitlement_unit_kind,
    entitlement_unit_count,
    granted_quantity,
    used_quantity,
    remaining_quantity,
    remaining_total_units,
    balance_status
  )
  select
    entitlement_grant_id,
    app_code,
    service_code,
    user_id,
    grant_period,
    'monthly_shortest_contract_free_ticket',
    'shortest_contract_duration',
    'minute',
    30,
    2,
    0,
    2,
    60,
    'active'
  from grant_insert
  returning *
),
contract_insert as (
  insert into business.worker_rental_contract (
    app_code,
    service_code,
    user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    rental_unit_kind,
    rental_unit_count,
    base_price_jpy,
    applied_entitlement_count,
    free_unit_count,
    paid_unit_count,
    final_price_jpy,
    contract_status,
    price_version,
    locale
  )
  select
    'CasualChatWorker',
    'casual_chat_worker',
    p.test_user_id,
    p.worker_owner_schema,
    p.worker_id,
    p.worker_type,
    'minute',
    90,
    1500,
    2,
    60,
    30,
    500,
    'confirmed',
    'v1',
    'ja'
  from params p
  returning *
),
contract_line_insert as (
  insert into business.worker_rental_contract_line (
    rental_contract_id,
    line_type,
    rental_unit_kind,
    rental_unit_count,
    quantity,
    unit_price_jpy,
    amount_jpy,
    note
  )
  select
    rental_contract_id,
    'base_rental',
    'minute',
    90,
    1,
    1500,
    1500,
    'rollback smoke base rental'
  from contract_insert
  union all
  select
    rental_contract_id,
    'entitlement_discount',
    'minute',
    60,
    2,
    500,
    -1000,
    'rollback smoke monthly shortest contract free ticket'
  from contract_insert
  returning *
),
period_insert as (
  insert into business.worker_rental_period (
    rental_contract_id,
    user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    period_status,
    remaining_seconds_snapshot
  )
  select
    c.rental_contract_id,
    c.user_id,
    c.worker_owner_schema,
    c.worker_id,
    c.worker_type,
    'scheduled',
    90 * 60
  from contract_insert c
  returning *
),
payment_insert as (
  insert into business.worker_rental_payment_intent (
    rental_contract_id,
    user_id,
    amount_jpy,
    currency_code,
    payment_status
  )
  select
    rental_contract_id,
    user_id,
    500,
    'JPY',
    'pending'
  from contract_insert
  returning *
),
usage_insert as (
  insert into business.worker_rental_entitlement_usage (
    entitlement_grant_id,
    entitlement_balance_id,
    rental_contract_id,
    rental_period_id,
    app_code,
    service_code,
    user_id,
    entitlement_kind,
    entitlement_source_rule,
    used_quantity,
    used_unit_kind,
    used_unit_count,
    discounted_amount_jpy,
    final_price_jpy,
    usage_status
  )
  select
    b.entitlement_grant_id,
    b.entitlement_balance_id,
    c.rental_contract_id,
    p.rental_period_id,
    c.app_code,
    c.service_code,
    c.user_id,
    'monthly_shortest_contract_free_ticket',
    'shortest_contract_duration',
    2,
    'minute',
    60,
    1000,
    500,
    'reserved'
  from balance_insert b
  cross join contract_insert c
  cross join period_insert p
  returning *
),
balance_update as (
  update business.worker_rental_entitlement_balance b
  set
    used_quantity = used_quantity + 2,
    remaining_quantity = remaining_quantity - 2,
    remaining_total_units = (remaining_quantity - 2) * entitlement_unit_count
  from usage_insert u
  where b.entitlement_balance_id = u.entitlement_balance_id
    and b.remaining_quantity >= 2
  returning
    b.entitlement_balance_id,
    b.used_quantity,
    b.remaining_quantity,
    b.remaining_total_units
),
status_insert as (
  insert into business.worker_rental_status_history (
    rental_contract_id,
    from_status,
    to_status,
    reason
  )
  select
    rental_contract_id,
    'quoted',
    'confirmed',
    'rollback smoke confirm'
  from contract_insert
  returning *
)
select
  'CONFIRM_ROLLBACK_SMOKE_OK' as smoke_status,
  c.rental_contract_id,
  p.rental_period_id,
  pay.rental_payment_intent_id,
  u.entitlement_usage_id,
  s.rental_status_history_id,
  c.app_code,
  c.service_code,
  c.rental_unit_count,
  c.base_price_jpy,
  c.applied_entitlement_count,
  c.free_unit_count,
  c.paid_unit_count,
  c.final_price_jpy,
  bu.remaining_quantity,
  bu.remaining_total_units
from contract_insert c
cross join period_insert p
cross join payment_insert pay
cross join usage_insert u
cross join status_insert s
cross join balance_update bu;

rollback;

\echo ============================================================
\echo ROLLBACK DONE
\echo ============================================================
