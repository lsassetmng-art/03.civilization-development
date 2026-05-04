\pset pager off
\pset null '(null)'
\echo ============================================================
\echo CCW QUOTE READ SMOKE
\echo ============================================================

with request as (
  select
    'CasualChatWorker'::text as app_code,
    'casual_chat_worker'::text as service_code,
    'minute'::text as rental_unit_kind,
    90::int as rental_unit_count,
    2::int as requested_ticket_count
),
service as (
  select s.*
  from business.v_worker_rental_service_catalog_active s
  join request r
    on r.app_code = s.app_code
   and r.service_code = s.service_code
),
price as (
  select p.*
  from business.v_worker_rental_price_catalog_active p
  join request r
    on r.app_code = p.app_code
   and r.service_code = p.service_code
   and r.rental_unit_kind = p.rental_unit_kind
   and r.rental_unit_count = p.rental_unit_count
),
ticket_rule as (
  select t.*
  from business.v_worker_rental_monthly_free_ticket_rule t
  join request r
    on r.app_code = t.app_code
   and r.service_code = t.service_code
),
quote as (
  select
    r.app_code,
    r.service_code,
    r.rental_unit_kind,
    r.rental_unit_count,
    p.base_price_jpy,
    least(r.requested_ticket_count, t.monthly_free_ticket_quantity) as applied_entitlement_count,
    least(r.requested_ticket_count, t.monthly_free_ticket_quantity) * t.free_ticket_minutes_each as free_unit_count,
    greatest(r.rental_unit_count - (least(r.requested_ticket_count, t.monthly_free_ticket_quantity) * t.free_ticket_minutes_each), 0) as paid_unit_count,
    greatest(
      p.base_price_jpy - ((least(r.requested_ticket_count, t.monthly_free_ticket_quantity) * t.free_ticket_minutes_each) / 30 * 500),
      0
    ) as final_price_jpy,
    t.monthly_free_ticket_source_rule as entitlement_source_rule,
    p.price_version,
    p.currency_code
  from request r
  join service s on true
  join price p on true
  join ticket_rule t on true
  where r.rental_unit_count <= s.app_max_contract_minutes
)
select
  'QUOTE_90_WITH_TWO_TICKETS' as check_name,
  *
from quote;

\echo ============================================================
\echo CCW 150 MINUTE REJECTION CHECK
\echo ============================================================

with request as (
  select
    'CasualChatWorker'::text as app_code,
    'casual_chat_worker'::text as service_code,
    'minute'::text as rental_unit_kind,
    150::int as rental_unit_count
),
service as (
  select s.*
  from business.v_worker_rental_service_catalog_active s
  join request r
    on r.app_code = s.app_code
   and r.service_code = s.service_code
)
select
  'QUOTE_150_REJECTION_EXPECTED' as check_name,
  case
    when r.rental_unit_count > s.app_max_contract_minutes then 'REJECTED_OK'
    else 'ERROR_NOT_REJECTED'
  end as result,
  r.rental_unit_count,
  s.app_max_contract_minutes
from request r
join service s on true;
