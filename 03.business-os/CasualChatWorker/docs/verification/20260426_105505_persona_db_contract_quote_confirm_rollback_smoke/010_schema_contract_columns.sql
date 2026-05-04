\pset pager off
\pset null '(null)'
\echo ============================================================
\echo CCW CONTRACT / CONFIRM SCHEMA COLUMN CHECK
\echo ============================================================

select
  table_schema,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'business'
  and table_name in (
    'worker_rental_contract',
    'worker_rental_contract_line',
    'worker_rental_period',
    'worker_rental_payment_intent',
    'worker_rental_status_history',
    'worker_rental_entitlement_grant',
    'worker_rental_entitlement_balance',
    'worker_rental_entitlement_usage'
  )
order by table_name, ordinal_position;
