\pset pager off

select
  'unit_policy_count' as check_name,
  count(*) as actual_count
from business.worker_rental_unit_policy
where rental_unit_kind in ('minute', 'hour', 'day', 'month', 'year');

select
  'casual_service_catalog' as check_name,
  app_code,
  service_code,
  minimum_contract_unit_kind,
  minimum_contract_unit_count,
  app_max_contract_unit_kind,
  app_max_contract_unit_count,
  monthly_free_ticket_enabled,
  monthly_free_ticket_quantity,
  monthly_free_ticket_source_rule,
  monthly_free_ticket_unit_kind,
  monthly_free_ticket_unit_count
from business.v_worker_rental_service_catalog_active
where app_code = 'CasualChatWorker'
  and service_code = 'casual_chat_worker';

select
  'casual_monthly_free_ticket_rule' as check_name,
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
  'casual_price_catalog' as check_name,
  app_code,
  service_code,
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
  'expected_price_rows' as check_name,
  count(*) as actual_count
from business.v_worker_rental_price_catalog_active
where app_code = 'CasualChatWorker'
  and service_code = 'casual_chat_worker'
  and rental_unit_kind = 'minute'
  and (
    (rental_unit_count = 30 and base_price_jpy = 500)
    or (rental_unit_count = 60 and base_price_jpy = 1000)
    or (rental_unit_count = 90 and base_price_jpy = 1500)
    or (rental_unit_count = 120 and base_price_jpy = 2000)
  );

select
  'views_exist' as check_name,
  count(*) as actual_count
from pg_views
where schemaname = 'business'
  and viewname in (
    'v_worker_rental_service_catalog_active',
    'v_worker_rental_monthly_free_ticket_rule',
    'v_worker_rental_price_catalog_active',
    'v_worker_rental_contract_summary',
    'v_worker_rental_entitlement_balance_active'
  );

select
  'tables_exist' as check_name,
  count(*) as actual_count
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
  );
