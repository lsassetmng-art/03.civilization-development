\pset pager off
\pset null '(null)'
\echo ============================================================
\echo CCW CONTRACT / QUOTE / CONFIRM ROLLBACK SMOKE SEQUENTIAL FIX
\echo ============================================================

begin;

create temp table ccw_smoke_context (
  smoke_marker text not null,
  test_user_id uuid not null,
  worker_owner_schema text not null,
  worker_id text not null,
  worker_type text not null,
  entitlement_grant_id uuid,
  entitlement_balance_id uuid,
  rental_contract_id uuid,
  rental_period_id uuid,
  rental_payment_intent_id uuid,
  entitlement_usage_id uuid,
  rental_status_history_id uuid
) on commit drop;

insert into ccw_smoke_context (
  smoke_marker,
  test_user_id,
  worker_owner_schema,
  worker_id,
  worker_type
)
select
  :'smoke_marker',
  md5(clock_timestamp()::text || random()::text)::uuid,
  'aiworker',
  'rollback-smoke-lover-worker-' || :'smoke_marker',
  'Lover';

with inserted as (
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
    smoke_marker,
    'monthly_shortest_contract_free_ticket',
    'shortest_contract_duration',
    'minute',
    30,
    2,
    60,
    false,
    'granted'
  from ccw_smoke_context
  returning entitlement_grant_id
)
update ccw_smoke_context c
set entitlement_grant_id = i.entitlement_grant_id
from inserted i;

with inserted as (
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
    'CasualChatWorker',
    'casual_chat_worker',
    test_user_id,
    smoke_marker,
    'monthly_shortest_contract_free_ticket',
    'shortest_contract_duration',
    'minute',
    30,
    2,
    0,
    2,
    60,
    'active'
  from ccw_smoke_context
  returning entitlement_balance_id
)
update ccw_smoke_context c
set entitlement_balance_id = i.entitlement_balance_id
from inserted i;

with inserted as (
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
    test_user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
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
  from ccw_smoke_context
  returning rental_contract_id
)
update ccw_smoke_context c
set rental_contract_id = i.rental_contract_id
from inserted i;

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
  'rollback smoke base rental sequential fix'
from ccw_smoke_context
union all
select
  rental_contract_id,
  'entitlement_discount',
  'minute',
  60,
  2,
  500,
  -1000,
  'rollback smoke monthly shortest contract free ticket sequential fix'
from ccw_smoke_context;

with inserted as (
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
    rental_contract_id,
    test_user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    'scheduled',
    90 * 60
  from ccw_smoke_context
  returning rental_period_id
)
update ccw_smoke_context c
set rental_period_id = i.rental_period_id
from inserted i;

with inserted as (
  insert into business.worker_rental_payment_intent (
    rental_contract_id,
    user_id,
    amount_jpy,
    currency_code,
    payment_status
  )
  select
    rental_contract_id,
    test_user_id,
    500,
    'JPY',
    'pending'
  from ccw_smoke_context
  returning rental_payment_intent_id
)
update ccw_smoke_context c
set rental_payment_intent_id = i.rental_payment_intent_id
from inserted i;

with inserted as (
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
    entitlement_grant_id,
    entitlement_balance_id,
    rental_contract_id,
    rental_period_id,
    'CasualChatWorker',
    'casual_chat_worker',
    test_user_id,
    'monthly_shortest_contract_free_ticket',
    'shortest_contract_duration',
    2,
    'minute',
    60,
    1000,
    500,
    'reserved'
  from ccw_smoke_context
  returning entitlement_usage_id
)
update ccw_smoke_context c
set entitlement_usage_id = i.entitlement_usage_id
from inserted i;

update business.worker_rental_entitlement_balance b
set
  used_quantity = b.used_quantity + 2,
  remaining_quantity = b.remaining_quantity - 2,
  remaining_total_units = (b.remaining_quantity - 2) * b.entitlement_unit_count
from ccw_smoke_context c
where b.entitlement_balance_id = c.entitlement_balance_id
  and b.remaining_quantity >= 2;

with inserted as (
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
    'rollback smoke confirm sequential fix'
  from ccw_smoke_context
  returning rental_status_history_id
)
update ccw_smoke_context c
set rental_status_history_id = i.rental_status_history_id
from inserted i;

\echo ============================================================
\echo FINAL CONFIRM CHECK
\echo ============================================================

select
  'CONFIRM_ROLLBACK_SMOKE_OK' as smoke_status,
  c.rental_contract_id,
  c.rental_period_id,
  c.rental_payment_intent_id,
  c.entitlement_usage_id,
  c.rental_status_history_id,
  wr.app_code,
  wr.service_code,
  wr.rental_unit_count,
  wr.base_price_jpy,
  wr.applied_entitlement_count,
  wr.free_unit_count,
  wr.paid_unit_count,
  wr.final_price_jpy,
  line_summary.line_count,
  line_summary.line_amount_total,
  b.used_quantity,
  b.remaining_quantity,
  b.remaining_total_units
from ccw_smoke_context c
join business.worker_rental_contract wr
  on wr.rental_contract_id = c.rental_contract_id
join business.worker_rental_entitlement_balance b
  on b.entitlement_balance_id = c.entitlement_balance_id
join (
  select
    rental_contract_id,
    count(*) as line_count,
    sum(amount_jpy) as line_amount_total
  from business.worker_rental_contract_line
  group by rental_contract_id
) line_summary
  on line_summary.rental_contract_id = c.rental_contract_id
where wr.app_code = 'CasualChatWorker'
  and wr.service_code = 'casual_chat_worker'
  and wr.rental_unit_count = 90
  and wr.base_price_jpy = 1500
  and wr.final_price_jpy = 500
  and b.used_quantity = 2
  and b.remaining_quantity = 0
  and b.remaining_total_units = 0
  and line_summary.line_count = 2
  and line_summary.line_amount_total = 500;

rollback;

\echo ============================================================
\echo ROLLBACK DONE
\echo ============================================================

\echo ============================================================
\echo POST ROLLBACK RESIDUAL CHECK
\echo ============================================================

with residual as (
  select
    (
      select count(*)
      from business.worker_rental_entitlement_grant
      where grant_period = :'smoke_marker'
    ) as grant_count,
    (
      select count(*)
      from business.worker_rental_contract
      where worker_id = 'rollback-smoke-lover-worker-' || :'smoke_marker'
    ) as contract_count
)
select
  'POST_ROLLBACK_ALL_CLEAR' as check_name,
  case
    when grant_count = 0 and contract_count = 0 then 'ALL_CLEAR'
    else 'RESIDUAL_FOUND'
  end as result,
  grant_count,
  contract_count
from residual;
