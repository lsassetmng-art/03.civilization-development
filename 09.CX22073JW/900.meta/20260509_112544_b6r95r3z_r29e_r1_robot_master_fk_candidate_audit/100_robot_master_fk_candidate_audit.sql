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
\echo '02 CANDIDATE ROBOT MASTER TABLE COLUMNS'
\echo '============================================================'
WITH candidate(table_name) AS (
  VALUES
    ('worker_model_catalog'),
    ('model_public_registry'),
    ('model_identity_spec'),
    ('robot_model_capability_profile'),
    ('worker_model_extension_catalog'),
    ('president_model_catalog'),
    ('model_service_assignment'),
    ('model_style_assignment')
)
SELECT
  '02_candidate_columns' AS section,
  c.table_schema,
  c.table_name,
  string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) AS columns
FROM information_schema.columns c
JOIN candidate x ON x.table_name = c.table_name
WHERE c.table_schema = 'aiworker'
GROUP BY c.table_schema, c.table_name
ORDER BY c.table_name;

\echo '============================================================'
\echo '03 UNIQUE / PRIMARY KEY CANDIDATES'
\echo '============================================================'
WITH candidate(table_name) AS (
  VALUES
    ('worker_model_catalog'),
    ('model_public_registry'),
    ('model_identity_spec'),
    ('robot_model_capability_profile'),
    ('worker_model_extension_catalog'),
    ('president_model_catalog'),
    ('model_service_assignment'),
    ('model_style_assignment')
),
idx AS (
  SELECT
    ns.nspname AS table_schema,
    cls.relname AS table_name,
    idxcls.relname AS index_name,
    i.indisprimary,
    i.indisunique,
    string_agg(att.attname, ', ' ORDER BY k.ord) AS index_columns
  FROM pg_index i
  JOIN pg_class cls ON cls.oid = i.indrelid
  JOIN pg_namespace ns ON ns.oid = cls.relnamespace
  JOIN pg_class idxcls ON idxcls.oid = i.indexrelid
  JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord) ON true
  JOIN pg_attribute att ON att.attrelid = cls.oid AND att.attnum = k.attnum
  JOIN candidate c ON c.table_name = cls.relname
  WHERE ns.nspname = 'aiworker'
    AND i.indisunique = true
  GROUP BY ns.nspname, cls.relname, idxcls.relname, i.indisprimary, i.indisunique
)
SELECT
  '03_unique_or_pk' AS section,
  table_schema,
  table_name,
  index_name,
  indisprimary,
  indisunique,
  index_columns
FROM idx
ORDER BY table_name, indisprimary DESC, index_name;

\echo '============================================================'
\echo '04 PUBLIC CODE / RUNTIME CODE VALUE SHAPE'
\echo '============================================================'
SELECT
  '04_worker_model_catalog_byd' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.worker_model_catalog t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 20;

SELECT
  '04_model_public_registry_byd' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.model_public_registry t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 20;

SELECT
  '04_model_identity_spec_byd' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.model_identity_spec t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 20;

SELECT
  '04_robot_model_capability_profile_byd' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.robot_model_capability_profile t
WHERE to_jsonb(t)::text ILIKE '%BYD2%'
   OR to_jsonb(t)::text ILIKE '%byd2%'
LIMIT 20;

\echo '============================================================'
\echo '05 FK TARGET FITNESS'
\echo '============================================================'
WITH candidate_table AS (
  SELECT *
  FROM (VALUES
    ('worker_model_catalog'),
    ('model_public_registry'),
    ('model_identity_spec'),
    ('robot_model_capability_profile'),
    ('worker_model_extension_catalog'),
    ('president_model_catalog')
  ) AS v(table_name)
),
cols AS (
  SELECT
    c.table_schema,
    c.table_name,
    MAX(CASE WHEN c.column_name = 'model_code' THEN 1 ELSE 0 END) AS has_model_code,
    MAX(CASE WHEN c.column_name = 'model_no' THEN 1 ELSE 0 END) AS has_model_no,
    MAX(CASE WHEN c.column_name = 'public_model_code' THEN 1 ELSE 0 END) AS has_public_model_code,
    MAX(CASE WHEN c.column_name = 'runtime_model_code' THEN 1 ELSE 0 END) AS has_runtime_model_code,
    MAX(CASE WHEN c.column_name = 'aiworker_model_code' THEN 1 ELSE 0 END) AS has_aiworker_model_code,
    MAX(CASE WHEN c.column_name = 'active_flag' THEN 1 ELSE 0 END) AS has_active_flag
  FROM information_schema.columns c
  JOIN candidate_table ct ON ct.table_name = c.table_name
  WHERE c.table_schema = 'aiworker'
  GROUP BY c.table_schema, c.table_name
),
uniq AS (
  SELECT
    ns.nspname AS table_schema,
    cls.relname AS table_name,
    string_agg(att.attname, ', ' ORDER BY k.ord) AS index_columns
  FROM pg_index i
  JOIN pg_class cls ON cls.oid = i.indrelid
  JOIN pg_namespace ns ON ns.oid = cls.relnamespace
  JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord) ON true
  JOIN pg_attribute att ON att.attrelid = cls.oid AND att.attnum = k.attnum
  WHERE ns.nspname = 'aiworker'
    AND i.indisunique = true
  GROUP BY ns.nspname, cls.relname, i.indexrelid
)
SELECT
  '05_fk_target_fitness' AS section,
  c.table_schema,
  c.table_name,
  c.has_model_code,
  c.has_model_no,
  c.has_public_model_code,
  c.has_runtime_model_code,
  c.has_aiworker_model_code,
  c.has_active_flag,
  COALESCE(string_agg(u.index_columns, ' / ' ORDER BY u.index_columns), '') AS unique_columns,
  CASE
    WHEN c.has_public_model_code = 1 AND bool_or(u.index_columns = 'public_model_code') THEN 'BEST_PUBLIC_MODEL_CODE_FK_TARGET'
    WHEN c.has_model_code = 1 AND bool_or(u.index_columns = 'model_code') THEN 'POSSIBLE_MODEL_CODE_FK_TARGET'
    WHEN c.has_model_no = 1 AND bool_or(u.index_columns = 'model_no') THEN 'POSSIBLE_MODEL_NO_FK_TARGET'
    ELSE 'NOT_FK_READY_OR_NEEDS_REVIEW'
  END AS fk_fitness
FROM cols c
LEFT JOIN uniq u
  ON u.table_schema = c.table_schema
 AND u.table_name = c.table_name
GROUP BY
  c.table_schema,
  c.table_name,
  c.has_model_code,
  c.has_model_no,
  c.has_public_model_code,
  c.has_runtime_model_code,
  c.has_aiworker_model_code,
  c.has_active_flag
ORDER BY
  CASE
    WHEN c.has_public_model_code = 1 THEN 1
    WHEN c.has_model_code = 1 THEN 2
    WHEN c.has_model_no = 1 THEN 3
    ELSE 9
  END,
  c.table_name;

\echo '============================================================'
\echo '06 MATERIAL VS MASTER BYD2-003 JOIN CHECK'
\echo '============================================================'
SELECT
  '06_material_byd_rows' AS section,
  model_code,
  COUNT(*) AS material_rows
FROM aiworker.vw_robot_readable_brain_runtime_material_v3
WHERE model_code = 'BYD2-003'
GROUP BY model_code;

SELECT
  '06_worker_model_catalog_join_byd2003' AS section,
  COUNT(*) AS master_rows
FROM aiworker.worker_model_catalog
WHERE to_jsonb(worker_model_catalog)::text ILIKE '%BYD2-003%';

SELECT
  '06_model_public_registry_join_byd2003' AS section,
  COUNT(*) AS master_rows
FROM aiworker.model_public_registry
WHERE to_jsonb(model_public_registry)::text ILIKE '%BYD2-003%';

SELECT
  '06_model_identity_spec_join_byd2003' AS section,
  COUNT(*) AS master_rows
FROM aiworker.model_identity_spec
WHERE to_jsonb(model_identity_spec)::text ILIKE '%BYD2-003%';

\echo '============================================================'
\echo '07 DECISION HINT'
\echo '============================================================'
SELECT
  '07_decision_hint' AS section,
  'Use an FK-backed identifier canon. canonical_public_model_code should reference the chosen robot master real table, not a view. input aliases should reference identifier canon, not free text.' AS recommendation;
