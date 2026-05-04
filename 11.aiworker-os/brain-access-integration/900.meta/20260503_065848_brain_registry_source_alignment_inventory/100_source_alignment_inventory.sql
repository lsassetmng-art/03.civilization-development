\set ON_ERROR_STOP on

SELECT
  '01_registry_source_summary' AS section,
  count(*) AS total_registry_count,
  count(*) FILTER (WHERE source_exists_flag = true) AS existing_source_count,
  count(*) FILTER (WHERE source_exists_flag = false) AS missing_source_count
FROM cx22073jw.vw_brain_data_registry_v1;

SELECT
  '02_missing_registry_sources' AS section,
  brain_data_code,
  brain_domain_code,
  source_schema_name,
  source_object_name,
  source_record_code,
  source_title_ja,
  depth_code,
  risk_class_code,
  granularity_code
FROM cx22073jw.vw_brain_data_registry_v1
WHERE source_exists_flag = false
ORDER BY source_schema_name, source_object_name, brain_data_code;

SELECT
  '03_existing_registry_sources' AS section,
  brain_data_code,
  brain_domain_code,
  source_schema_name,
  source_object_name,
  source_record_code,
  source_title_ja
FROM cx22073jw.vw_brain_data_registry_v1
WHERE source_exists_flag = true
ORDER BY source_schema_name, source_object_name, brain_data_code;

SELECT
  '04_aiworker_tables_candidates' AS section,
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'aiworker'
  AND (
    tablename ILIKE '%robot%'
    OR tablename ILIKE '%series%'
    OR tablename ILIKE '%model%'
    OR tablename ILIKE '%catalog%'
    OR tablename ILIKE '%profile%'
  )
ORDER BY tablename;

SELECT
  '05_aiworker_views_candidates' AS section,
  schemaname,
  viewname
FROM pg_views
WHERE schemaname = 'aiworker'
  AND (
    viewname ILIKE '%robot%'
    OR viewname ILIKE '%series%'
    OR viewname ILIKE '%model%'
    OR viewname ILIKE '%catalog%'
    OR viewname ILIKE '%profile%'
  )
ORDER BY viewname;

SELECT
  '06_cx_tables_candidates' AS section,
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'cx22073jw'
  AND (
    tablename ILIKE '%history%'
    OR tablename ILIKE '%knowledge%'
    OR tablename ILIKE '%topic%'
    OR tablename ILIKE '%question%'
    OR tablename ILIKE '%brain%'
  )
ORDER BY tablename;

SELECT
  '07_cx_views_candidates' AS section,
  schemaname,
  viewname
FROM pg_views
WHERE schemaname = 'cx22073jw'
  AND (
    viewname ILIKE '%history%'
    OR viewname ILIKE '%knowledge%'
    OR viewname ILIKE '%topic%'
    OR viewname ILIKE '%question%'
    OR viewname ILIKE '%brain%'
  )
ORDER BY viewname;

WITH object_candidates AS (
  SELECT
    schemaname AS schema_name,
    tablename AS object_name,
    'table' AS object_type
  FROM pg_tables
  WHERE schemaname IN ('cx22073jw','aiworker')

  UNION ALL

  SELECT
    schemaname AS schema_name,
    viewname AS object_name,
    'view' AS object_type
  FROM pg_views
  WHERE schemaname IN ('cx22073jw','aiworker')
),
missing AS (
  SELECT
    brain_data_code,
    brain_domain_code,
    source_schema_name,
    source_object_name,
    source_record_code,
    source_title_ja
  FROM cx22073jw.vw_brain_data_registry_v1
  WHERE source_exists_flag = false
)
SELECT
  '08_name_similarity_candidates' AS section,
  m.brain_data_code,
  m.brain_domain_code,
  m.source_schema_name AS missing_schema,
  m.source_object_name AS missing_object,
  c.object_type,
  c.schema_name AS candidate_schema,
  c.object_name AS candidate_object
FROM missing m
JOIN object_candidates c
  ON c.schema_name = m.source_schema_name
 AND (
   c.object_name ILIKE '%' || split_part(m.source_object_name, '_', 1) || '%'
   OR m.source_object_name ILIKE '%' || split_part(c.object_name, '_', 1) || '%'
   OR c.object_name ILIKE '%' || replace(m.brain_domain_code, '_', '%') || '%'
   OR c.object_name ILIKE '%' || replace(m.brain_data_code, '_', '%') || '%'
 )
ORDER BY m.brain_data_code, c.object_type, c.object_name
LIMIT 120;

SELECT
  '09_missing_source_exact_fix_hint' AS section,
  brain_data_code,
  brain_domain_code,
  source_schema_name,
  source_object_name,
  CASE
    WHEN brain_data_code = 'robot_aiworker_series_reference' THEN 'Likely fix: point to existing aiworker robot/series/model view or keep as logical reference if no source table exists.'
    WHEN brain_data_code = 'robot_aiworker_model_reference' THEN 'Likely fix: point to existing aiworker robot/model/catalog view or keep as logical reference if no source table exists.'
    ELSE 'Review actual source object.'
  END AS fix_hint
FROM cx22073jw.vw_brain_data_registry_v1
WHERE source_exists_flag = false
ORDER BY brain_data_code;
