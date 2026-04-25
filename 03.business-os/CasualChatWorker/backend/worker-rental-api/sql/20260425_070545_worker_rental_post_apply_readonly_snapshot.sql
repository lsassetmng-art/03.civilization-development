\pset pager off

select
  'service_catalog' as section,
  app_code,
  service_code,
  service_name,
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
  monthly_free_ticket_unit_count,
  monthly_free_ticket_carryover_enabled
from business.v_worker_rental_service_catalog_active
where app_code = 'CasualChatWorker'
  and service_code = 'casual_chat_worker';

select
  'monthly_free_ticket_rule' as section,
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
  'price_catalog' as section,
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
  'table_count' as section,
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

select
  'view_count' as section,
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
  'expected_price_row_count' as section,
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
