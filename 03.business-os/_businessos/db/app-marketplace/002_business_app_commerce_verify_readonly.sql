-- READ ONLY verification for R15B3.
-- Run only after explicit DB APPLY GO.

SELECT
  table_schema,
  table_name
FROM information_schema.tables
WHERE table_schema = 'business'
  AND table_name IN (
    'app_product',
    'app_sku',
    'app_subscription_plan',
    'app_order',
    'app_order_line',
    'app_subscription',
    'app_entitlement',
    'app_module_installation',
    'app_module_activation',
    'business_persona_event_outbox'
  )
ORDER BY table_name;

SELECT
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'business'
  AND table_name IN (
    'app_product',
    'app_sku',
    'app_subscription_plan',
    'app_order',
    'app_order_line',
    'app_subscription',
    'app_entitlement',
    'app_module_installation',
    'app_module_activation',
    'business_persona_event_outbox'
  )
ORDER BY table_name, ordinal_position;

SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'business'
  AND tablename IN (
    'app_product',
    'app_sku',
    'app_subscription_plan',
    'app_order',
    'app_order_line',
    'app_subscription',
    'app_entitlement',
    'app_module_installation',
    'app_module_activation',
    'business_persona_event_outbox'
  )
ORDER BY tablename, indexname;
