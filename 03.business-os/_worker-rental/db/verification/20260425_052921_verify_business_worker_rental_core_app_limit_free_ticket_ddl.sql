-- BusinessOS WorkerRentalCore verification SQL

select
  rental_unit_kind,
  display_name,
  max_unit_count,
  max_total_minutes,
  max_human_label,
  is_active
from business.worker_rental_unit_policy
order by
  case rental_unit_kind
    when 'minute' then 1
    when 'hour' then 2
    when 'day' then 3
    when 'month' then 4
    when 'year' then 5
    else 99
  end;

select
  app_code,
  service_code,
  service_name,
  supports_minute,
  supports_hour,
  supports_day,
  supports_month,
  supports_year,
  minimum_contract_unit_kind,
  minimum_contract_unit_count,
  minimum_contract_minutes,
  app_max_contract_unit_kind,
  app_max_contract_unit_count,
  app_max_contract_minutes,
  monthly_free_ticket_enabled,
  monthly_free_ticket_quantity,
  monthly_free_ticket_source_rule,
  monthly_free_ticket_unit_kind,
  monthly_free_ticket_unit_count
from business.v_worker_rental_service_catalog_active
where app_code = 'CasualChatWorker'
  and service_code = 'casual_chat_worker';

select
  app_code,
  service_code,
  monthly_free_ticket_quantity,
  monthly_free_ticket_source_rule,
  monthly_free_ticket_unit_kind,
  monthly_free_ticket_unit_count,
  free_ticket_minutes_each,
  free_ticket_minutes_total,
  monthly_free_ticket_carryover_enabled
from business.v_worker_rental_monthly_free_ticket_rule
where app_code = 'CasualChatWorker'
  and service_code = 'casual_chat_worker';

select
  app_code,
  service_code,
  price_version,
  rental_unit_kind,
  rental_unit_count,
  rental_total_minutes,
  base_price_jpy,
  currency_code,
  is_active
from business.v_worker_rental_price_catalog_active
where app_code = 'CasualChatWorker'
  and service_code = 'casual_chat_worker'
order by rental_unit_count;

select
  schemaname,
  tablename
from pg_tables
where schemaname = 'business'
  and tablename in (
    'worker_rental_unit_policy',
    'worker_rental_service_catalog',
    'worker_rental_price_catalog',
    'worker_rental_contract',
    'worker_rental_contract_line',
    'worker_rental_period',
    'worker_rental_usage_log',
    'worker_rental_payment_intent',
    'worker_rental_status_history',
    'worker_rental_safety_event',
    'worker_rental_end_summary',
    'worker_rental_entitlement_grant',
    'worker_rental_entitlement_balance',
    'worker_rental_entitlement_usage'
  )
order by tablename;

select
  schemaname,
  viewname
from pg_views
where schemaname = 'business'
  and viewname in (
    'v_worker_rental_service_catalog_active',
    'v_worker_rental_monthly_free_ticket_rule',
    'v_worker_rental_price_catalog_active',
    'v_worker_rental_contract_summary',
    'v_worker_rental_entitlement_balance_active'
  )
order by viewname;
