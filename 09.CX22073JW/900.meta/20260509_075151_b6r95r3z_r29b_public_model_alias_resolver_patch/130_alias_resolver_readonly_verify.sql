\set ON_ERROR_STOP on
SET default_transaction_read_only = on;

SELECT
  '01_readonly_guard' AS section,
  current_setting('transaction_read_only') AS transaction_read_only,
  current_setting('default_transaction_read_only') AS default_transaction_read_only;

SELECT
  '02_byd_public_taika_rows_v3' AS section,
  COUNT(*) AS rows_found
FROM aiworker.vw_robot_readable_brain_runtime_material_v3 t
WHERE t.model_code = 'BYD2-003'
  AND (
       to_jsonb(t)::text ILIKE '%大化%'
    OR to_jsonb(t)::text ILIKE '%taika%'
    OR to_jsonb(t)::text ILIKE '%乙巳%'
    OR to_jsonb(t)::text ILIKE '%改新の詔%'
    OR to_jsonb(t)::text ILIKE '%公地公民%'
    OR to_jsonb(t)::text ILIKE '%日本書紀%'
    OR to_jsonb(t)::text ILIKE '%律令%'
  );

SELECT
  '03_byd_public_taika_sample_v3' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  unit_title_ja,
  left(coalesce(unit_summary_ja, ''), 220) AS unit_summary_head
FROM aiworker.vw_robot_readable_brain_runtime_material_v3 t
WHERE t.model_code = 'BYD2-003'
  AND (
       to_jsonb(t)::text ILIKE '%大化%'
    OR to_jsonb(t)::text ILIKE '%taika%'
    OR to_jsonb(t)::text ILIKE '%乙巳%'
    OR to_jsonb(t)::text ILIKE '%改新の詔%'
    OR to_jsonb(t)::text ILIKE '%公地公民%'
    OR to_jsonb(t)::text ILIKE '%日本書紀%'
    OR to_jsonb(t)::text ILIKE '%律令%'
  )
ORDER BY unit_code
LIMIT 12;
