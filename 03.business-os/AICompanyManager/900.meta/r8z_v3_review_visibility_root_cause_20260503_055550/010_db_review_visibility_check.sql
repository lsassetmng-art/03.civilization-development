\pset format aligned
\pset null '(null)'

SELECT
  'target_company' AS section,
  aicm_user_company_id,
  company_name,
  owner_civilization_id,
  created_at,
  updated_at
FROM business.aicm_user_company
WHERE aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid;

SELECT
  'human_review_target_company_status' AS section,
  human_review_status_code,
  review_kind_code,
  artifact_kind_code,
  count(*) AS count
FROM business.aicm_human_review_item
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
GROUP BY human_review_status_code, review_kind_code, artifact_kind_code
ORDER BY human_review_status_code, review_kind_code, artifact_kind_code;

SELECT
  'human_review_r8z_v2_rows' AS section,
  aicm_human_review_item_id,
  related_worker_work_unit_id,
  review_title,
  human_review_status_code,
  review_kind_code,
  artifact_kind_code,
  priority_code,
  left(delivery_summary_text, 220) AS delivery_summary_preview,
  metadata_jsonb ->> 'review_bridge_version' AS review_bridge_version,
  metadata_jsonb ->> 'source_request_id' AS source_request_id,
  created_at,
  updated_at
FROM business.aicm_human_review_item
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
  AND (
    metadata_jsonb ->> 'review_bridge_version' = 'r8z_v2'
    OR related_worker_work_unit_id IS NOT NULL
    OR review_kind_code = 'delivery_summary'
  )
ORDER BY created_at DESC;

SELECT
  'view_wait_display_target_company' AS section,
  aicm_human_review_item_id,
  related_worker_work_unit_id,
  review_title,
  human_review_status_code,
  review_kind_code,
  artifact_kind_code,
  priority_code,
  left(delivery_summary_text, 220) AS delivery_summary_preview,
  created_at,
  updated_at
FROM business.vw_aicm_human_review_wait_display
WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
ORDER BY created_at DESC;

SELECT
  'recent_human_review_any_company' AS section,
  aicm_user_company_id,
  owner_civilization_id,
  aicm_human_review_item_id,
  related_worker_work_unit_id,
  review_title,
  human_review_status_code,
  review_kind_code,
  artifact_kind_code,
  metadata_jsonb ->> 'review_bridge_version' AS review_bridge_version,
  created_at
FROM business.aicm_human_review_item
ORDER BY created_at DESC
LIMIT 10;

SELECT
  'view_definition_contains' AS section,
  CASE
    WHEN pg_get_viewdef('business.vw_aicm_human_review_wait_display'::regclass, true) LIKE '%pending%' THEN 'contains_pending'
    ELSE 'no_pending_text'
  END AS pending_filter_hint,
  CASE
    WHEN pg_get_viewdef('business.vw_aicm_human_review_wait_display'::regclass, true) LIKE '%delivery_summary%' THEN 'contains_delivery_summary'
    ELSE 'no_delivery_summary_text'
  END AS delivery_summary_filter_hint,
  CASE
    WHEN pg_get_viewdef('business.vw_aicm_human_review_wait_display'::regclass, true) LIKE '%review_kind_code%' THEN 'contains_review_kind_code'
    ELSE 'no_review_kind_code_text'
  END AS review_kind_filter_hint;

\pset format unaligned
\pset tuples_only on
\o /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v3_review_visibility_root_cause_20260503_055550/030_db_review_visibility_summary.json
WITH
table_rows AS (
  SELECT count(*)::int AS c
  FROM business.aicm_human_review_item
  WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
),
pending_table_rows AS (
  SELECT count(*)::int AS c
  FROM business.aicm_human_review_item
  WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
    AND human_review_status_code = 'pending'
),
r8z_v2_rows AS (
  SELECT count(*)::int AS c
  FROM business.aicm_human_review_item
  WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
    AND metadata_jsonb ->> 'review_bridge_version' = 'r8z_v2'
),
view_rows AS (
  SELECT count(*)::int AS c
  FROM business.vw_aicm_human_review_wait_display
  WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
),
recent_rows AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC), '[]'::jsonb) AS rows
  FROM (
    SELECT
      aicm_human_review_item_id,
      related_worker_work_unit_id,
      review_title,
      human_review_status_code,
      review_kind_code,
      artifact_kind_code,
      priority_code,
      metadata_jsonb ->> 'review_bridge_version' AS review_bridge_version,
      created_at
    FROM business.aicm_human_review_item
    WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
      AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
    ORDER BY created_at DESC
    LIMIT 10
  ) x
),
view_recent_rows AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC), '[]'::jsonb) AS rows
  FROM (
    SELECT
      aicm_human_review_item_id,
      related_worker_work_unit_id,
      review_title,
      human_review_status_code,
      review_kind_code,
      artifact_kind_code,
      priority_code,
      created_at
    FROM business.vw_aicm_human_review_wait_display
    WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
      AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
    ORDER BY created_at DESC
    LIMIT 10
  ) x
),
any_company_recent AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC), '[]'::jsonb) AS rows
  FROM (
    SELECT
      aicm_user_company_id,
      owner_civilization_id,
      aicm_human_review_item_id,
      related_worker_work_unit_id,
      review_title,
      human_review_status_code,
      review_kind_code,
      artifact_kind_code,
      metadata_jsonb ->> 'review_bridge_version' AS review_bridge_version,
      created_at
    FROM business.aicm_human_review_item
    ORDER BY created_at DESC
    LIMIT 10
  ) x
),
view_def AS (
  SELECT pg_get_viewdef('business.vw_aicm_human_review_wait_display'::regclass, true) AS def
)
SELECT jsonb_pretty(jsonb_build_object(
  'result', 'ok',
  'owner_civilization_id', '00000000-0000-4000-8000-000000000001',
  'aicm_user_company_id', '8b9be487-7b74-4517-9b59-6c84a82ae6aa',
  'human_review_table_count', (SELECT c FROM table_rows),
  'human_review_pending_table_count', (SELECT c FROM pending_table_rows),
  'human_review_r8z_v2_count', (SELECT c FROM r8z_v2_rows),
  'view_wait_display_count', (SELECT c FROM view_rows),
  'recent_table_rows', (SELECT rows FROM recent_rows),
  'recent_view_rows', (SELECT rows FROM view_recent_rows),
  'recent_any_company_rows', (SELECT rows FROM any_company_recent),
  'view_def_contains_pending', ((SELECT def FROM view_def) LIKE '%pending%'),
  'view_def_contains_delivery_summary', ((SELECT def FROM view_def) LIKE '%delivery_summary%'),
  'view_def_contains_review_kind_code', ((SELECT def FROM view_def) LIKE '%review_kind_code%')
));
\o
