\pset pager off
\pset null '(null)'
\echo ============================================================
\echo CCW PERSONA DB ROLLBACK-ONLY ENTITLEMENT WRITE SMOKE
\echo ============================================================

begin;

with params as (
  select
    md5(clock_timestamp()::text)::uuid as test_user_id,
    to_char(now(), 'YYYY-MM') || '-rollback-smoke' as grant_period
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
  returning
    entitlement_grant_id,
    app_code,
    service_code,
    user_id,
    grant_period,
    granted_quantity,
    total_granted_units
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
  returning
    entitlement_balance_id,
    entitlement_grant_id,
    app_code,
    service_code,
    user_id,
    remaining_quantity,
    remaining_total_units
)
select
  'ROLLBACK_SMOKE_INSERT_OK' as smoke_status,
  g.entitlement_grant_id,
  b.entitlement_balance_id,
  g.app_code,
  g.service_code,
  g.user_id,
  b.remaining_quantity,
  b.remaining_total_units
from grant_insert g
join balance_insert b
  on b.entitlement_grant_id = g.entitlement_grant_id;

rollback;

\echo ============================================================
\echo ROLLBACK DONE
\echo ============================================================
