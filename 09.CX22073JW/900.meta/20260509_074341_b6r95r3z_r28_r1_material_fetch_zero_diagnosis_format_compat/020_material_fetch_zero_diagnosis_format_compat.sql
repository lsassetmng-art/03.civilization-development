\set ON_ERROR_STOP on
SET default_transaction_read_only = on;

\echo '============================================================'
\echo '01 READONLY GUARD'
\echo '============================================================'
SELECT
  '01_readonly_guard' AS section,
  current_setting('transaction_read_only') AS transaction_read_only,
  current_setting('default_transaction_read_only') AS default_transaction_read_only,
  current_database() AS database_name,
  current_user AS db_user;

\echo '============================================================'
\echo '02 MATERIAL VIEW EXISTENCE'
\echo '============================================================'
SELECT
  '02_material_view_existence' AS section,
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'aiworker'
  AND table_name IN (
    'vw_robot_readable_brain_runtime_material_v3',
    'vw_robot_readable_brain_runtime_material_v2',
    'vw_robot_readable_brain_runtime_material_v1',
    'vw_robot_brain_runtime_material_quality_overlay_v1'
  )
ORDER BY table_name;

\echo '============================================================'
\echo '03 MATERIAL VIEW COLUMNS'
\echo '============================================================'
SELECT
  '03_material_view_columns' AS section,
  table_name,
  string_agg(column_name, ', ' ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_schema = 'aiworker'
  AND table_name IN (
    'vw_robot_readable_brain_runtime_material_v3',
    'vw_robot_readable_brain_runtime_material_v2',
    'vw_robot_readable_brain_runtime_material_v1',
    'vw_robot_brain_runtime_material_quality_overlay_v1'
  )
GROUP BY table_name
ORDER BY table_name;

\echo '============================================================'
\echo '04 MODEL CODE EXACT COUNT'
\echo '============================================================'
SELECT format($fmt$
SELECT
  %L AS section,
  %L AS view_name,
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE model_code = %L) AS exact_normalized_model_rows,
  COUNT(*) FILTER (WHERE model_code = %L) AS exact_public_model_rows,
  COUNT(*) FILTER (WHERE model_code ILIKE %L OR model_code ILIKE %L) AS fuzzy_byd2003_rows
FROM %I.%I;
$fmt$,
  '04_model_code_exact_count',
  c.table_name,
  'byd2_003_asic_leader3',
  'BYD2-003',
  '%byd2%003%',
  '%BYD2%003%',
  c.table_schema,
  c.table_name
)
FROM information_schema.columns c
WHERE c.table_schema = 'aiworker'
  AND c.column_name = 'model_code'
  AND c.table_name IN (
    'vw_robot_readable_brain_runtime_material_v3',
    'vw_robot_readable_brain_runtime_material_v2',
    'vw_robot_readable_brain_runtime_material_v1',
    'vw_robot_brain_runtime_material_quality_overlay_v1'
  )
GROUP BY c.table_schema, c.table_name
ORDER BY c.table_name
\gexec

\echo '============================================================'
\echo '05 TAIKA TERM COUNT BY VIEW'
\echo '============================================================'
SELECT format($fmt$
SELECT
  %L AS section,
  %L AS view_name,
  COUNT(*) AS taika_total_rows,
  COUNT(*) FILTER (WHERE model_code = %L) AS taika_normalized_model_rows,
  COUNT(*) FILTER (WHERE model_code = %L) AS taika_public_model_rows,
  COUNT(*) FILTER (WHERE model_code ILIKE %L OR model_code ILIKE %L) AS taika_fuzzy_byd2003_rows
FROM %I.%I t
WHERE to_jsonb(t)::text ILIKE %L
   OR to_jsonb(t)::text ILIKE %L
   OR to_jsonb(t)::text ILIKE %L
   OR to_jsonb(t)::text ILIKE %L
   OR to_jsonb(t)::text ILIKE %L;
$fmt$,
  '05_taika_term_count_by_view',
  c.table_name,
  'byd2_003_asic_leader3',
  'BYD2-003',
  '%byd2%003%',
  '%BYD2%003%',
  c.table_schema,
  c.table_name,
  '%大化%',
  '%taika%',
  '%乙巳%',
  '%改新の詔%',
  '%公地公民%'
)
FROM information_schema.columns c
WHERE c.table_schema = 'aiworker'
  AND c.column_name = 'model_code'
  AND c.table_name IN (
    'vw_robot_readable_brain_runtime_material_v3',
    'vw_robot_readable_brain_runtime_material_v2',
    'vw_robot_readable_brain_runtime_material_v1',
    'vw_robot_brain_runtime_material_quality_overlay_v1'
  )
GROUP BY c.table_schema, c.table_name
ORDER BY c.table_name
\gexec

\echo '============================================================'
\echo '06 TAIKA MODEL CODE SAMPLE'
\echo '============================================================'
SELECT format($fmt$
SELECT
  %L AS section,
  %L AS view_name,
  model_code,
  COUNT(*) AS row_count
FROM %I.%I t
WHERE to_jsonb(t)::text ILIKE %L
   OR to_jsonb(t)::text ILIKE %L
   OR to_jsonb(t)::text ILIKE %L
   OR to_jsonb(t)::text ILIKE %L
   OR to_jsonb(t)::text ILIKE %L
GROUP BY model_code
ORDER BY row_count DESC, model_code
LIMIT 30;
$fmt$,
  '06_taika_model_code_sample',
  c.table_name,
  c.table_schema,
  c.table_name,
  '%大化%',
  '%taika%',
  '%乙巳%',
  '%改新の詔%',
  '%公地公民%'
)
FROM information_schema.columns c
WHERE c.table_schema = 'aiworker'
  AND c.column_name = 'model_code'
  AND c.table_name IN (
    'vw_robot_readable_brain_runtime_material_v3',
    'vw_robot_readable_brain_runtime_material_v2',
    'vw_robot_readable_brain_runtime_material_v1',
    'vw_robot_brain_runtime_material_quality_overlay_v1'
  )
GROUP BY c.table_schema, c.table_name
ORDER BY c.table_name
\gexec

\echo '============================================================'
\echo '07 BYD2-003 READABLE SAMPLE ROWS'
\echo '============================================================'
SELECT format($fmt$
SELECT
  %L AS section,
  %L AS view_name,
  to_jsonb(t) AS row_json
FROM %I.%I t
WHERE model_code = %L
   OR model_code = %L
   OR model_code ILIKE %L
   OR model_code ILIKE %L
LIMIT 5;
$fmt$,
  '07_byd2003_readable_sample_rows',
  c.table_name,
  c.table_schema,
  c.table_name,
  'byd2_003_asic_leader3',
  'BYD2-003',
  '%byd2%003%',
  '%BYD2%003%'
)
FROM information_schema.columns c
WHERE c.table_schema = 'aiworker'
  AND c.column_name = 'model_code'
  AND c.table_name IN (
    'vw_robot_readable_brain_runtime_material_v3',
    'vw_robot_readable_brain_runtime_material_v2',
    'vw_robot_readable_brain_runtime_material_v1',
    'vw_robot_brain_runtime_material_quality_overlay_v1'
  )
GROUP BY c.table_schema, c.table_name
ORDER BY c.table_name
\gexec

\echo '============================================================'
\echo '08 EXACT R24 HELPER QUERY SIMULATION'
\echo '============================================================'
SELECT format($fmt$
SELECT
  %L AS section,
  %L AS view_name,
  COUNT(*) AS simulated_rows
FROM %I.%I t
WHERE t.model_code = %L
  AND (
       to_jsonb(t)::text ILIKE %L
    OR to_jsonb(t)::text ILIKE %L
    OR to_jsonb(t)::text ILIKE %L
    OR to_jsonb(t)::text ILIKE %L
    OR to_jsonb(t)::text ILIKE %L
    OR to_jsonb(t)::text ILIKE %L
    OR to_jsonb(t)::text ILIKE %L
    OR to_jsonb(t)::text ILIKE %L
  );
$fmt$,
  '08_exact_r24_helper_query_simulation',
  c.table_name,
  c.table_schema,
  c.table_name,
  'byd2_003_asic_leader3',
  '%大化%',
  '%大化の改新%',
  '%taika%',
  '%乙巳%',
  '%改新の詔%',
  '%公地公民%',
  '%日本書紀%',
  '%律令%'
)
FROM information_schema.columns c
WHERE c.table_schema = 'aiworker'
  AND c.column_name = 'model_code'
  AND c.table_name IN (
    'vw_robot_readable_brain_runtime_material_v3',
    'vw_robot_readable_brain_runtime_material_v2',
    'vw_robot_readable_brain_runtime_material_v1',
    'vw_robot_brain_runtime_material_quality_overlay_v1'
  )
GROUP BY c.table_schema, c.table_name
ORDER BY c.table_name
\gexec

\echo '============================================================'
\echo '09 CX/AIWORKER MATERIAL TABLE CANDIDATES'
\echo '============================================================'
SELECT
  '09_material_table_candidates' AS section,
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname IN ('cx22073jw', 'aiworker')
  AND (
       tablename ILIKE '%brain%'
    OR tablename ILIKE '%material%'
    OR tablename ILIKE '%detail%'
    OR tablename ILIKE '%reference%'
    OR tablename ILIKE '%quality%'
  )
ORDER BY schemaname, tablename
LIMIT 120;

\echo '============================================================'
\echo '10 R28-R1 DIAGNOSIS HINT'
\echo '============================================================'
SELECT
  '10_diagnosis_hint' AS section,
  'If section 05 has taika_total_rows > 0 but taika_normalized_model_rows = 0, patch should map model_code or remove too-strict exact model filter.' AS hint
UNION ALL
SELECT
  '10_diagnosis_hint',
  'If section 05 has all zero, runtime views do not expose Taika material; patch should query CX material/source tables or fix view connection.'
UNION ALL
SELECT
  '10_diagnosis_hint',
  'If section 08 has rows but runtime returned cx_material_rows_found=0, Node helper/psql execution/parsing path is failing.'
UNION ALL
SELECT
  '10_diagnosis_hint',
  'If section 07 has rows but section 08 is zero, term search is too narrow.';
