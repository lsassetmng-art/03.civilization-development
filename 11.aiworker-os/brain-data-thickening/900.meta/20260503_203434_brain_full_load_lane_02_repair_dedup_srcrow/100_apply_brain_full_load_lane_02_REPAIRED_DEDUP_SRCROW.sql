\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 1. Source object inventory
-- ============================================================

CREATE OR REPLACE VIEW cx22073jw.vw_brain_source_object_inventory_v1 AS
SELECT
  n.nspname AS source_schema_name,
  c.relname AS source_object_name,
  CASE c.relkind
    WHEN 'r' THEN 'table'
    WHEN 'p' THEN 'partitioned_table'
    WHEN 'v' THEN 'view'
    WHEN 'm' THEN 'materialized_view'
    ELSE c.relkind::text
  END AS source_object_kind,
  c.reltuples::bigint AS estimated_row_count,
  obj_description(c.oid, 'pg_class') AS object_comment,
  CASE
    WHEN c.relname LIKE 'brain_%'
      OR c.relname LIKE 'vw_brain_%'
      OR c.relname LIKE 'idx_%'
      OR c.relname LIKE 'pg_%'
    THEN true
    ELSE false
  END AS internal_brain_management_flag
FROM pg_class c
JOIN pg_namespace n
  ON n.oid = c.relnamespace
WHERE n.nspname = 'cx22073jw'
  AND c.relkind IN ('r','p','v','m');

-- ============================================================
-- 2. Source-object ingestion catalog
-- ============================================================

CREATE TABLE IF NOT EXISTS cx22073jw.brain_source_object_ingestion_catalog (
  object_code text PRIMARY KEY,
  source_schema_name text NOT NULL DEFAULT 'cx22073jw',
  source_object_name text NOT NULL,
  expected_object_kind text NOT NULL DEFAULT 'table_or_view',
  brain_domain_code text NOT NULL REFERENCES cx22073jw.brain_data_domain_catalog(brain_domain_code),
  default_depth_code text NOT NULL REFERENCES cx22073jw.brain_data_depth_catalog(depth_code),
  default_risk_class_code text NOT NULL REFERENCES cx22073jw.brain_data_risk_class_catalog(risk_class_code),
  default_allowed_use_purpose_codes text[] NOT NULL DEFAULT ARRAY['reference','review']::text[],
  code_candidate_columns text[] NOT NULL DEFAULT ARRAY['entry_code','detail_code','history_code','question_code','material_code','topic_code','source_record_code','record_code','code','id']::text[],
  title_candidate_columns text[] NOT NULL DEFAULT ARRAY['entry_title_ja','detail_title_ja','title_ja','question_title_ja','material_title_ja','topic_title_ja','name_ja','label_ja','title','name']::text[],
  summary_candidate_columns text[] NOT NULL DEFAULT ARRAY['summary_ja','entry_summary_ja','detail_summary_ja','description_ja','body_ja','content_ja','explanation_ja','note_ja','summary','description']::text[],
  safety_boundary_ja text NOT NULL,
  ingestion_note_ja text NOT NULL,
  row_level_ingestion_flag boolean NOT NULL DEFAULT true,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_schema_name, source_object_name)
);

-- ============================================================
-- 3. Known CX source objects
-- 存在しないものはcatalogには残るが、registry登録はしない。
-- ============================================================

INSERT INTO cx22073jw.brain_source_object_ingestion_catalog
(
  object_code,
  source_object_name,
  expected_object_kind,
  brain_domain_code,
  default_depth_code,
  default_risk_class_code,
  default_allowed_use_purpose_codes,
  safety_boundary_ja,
  ingestion_note_ja,
  row_level_ingestion_flag,
  active_flag
)
VALUES
('earth_history_detail_entry','earth_history_detail_entry','table_or_view','history_worldview','advanced','medium',ARRAY['reference','education','worldbuilding','review']::text[],'歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。','Earth history detail source ingestion target.',true,true),
('civilization_foundation_history_detail_entry','civilization_foundation_history_detail_entry','table_or_view','civilization_foundation_history','advanced','medium',ARRAY['reference','review','risk_check','executive_planning','worldbuilding']::text[],'Civilization基礎史・統治・AI依存リスクの理解とレビューに限定する。支配・監視・攻撃の正当化に使わない。','Civilization foundation history detail source ingestion target.',true,true),
('civilization_exam_question_bank','civilization_exam_question_bank','table_or_view','exam_learning','standard','low',ARRAY['exam_practice','education','review','reference']::text[],'試験演習・復習・理解確認に限定する。実試験中の不正支援・漏洩利用・回答代行は禁止。','Civilization exam question bank ingestion target.',true,true),
('foundation_knowledge_material','foundation_knowledge_material','table_or_view','education_learning','standard','low',ARRAY['education','reference','review','design_reference']::text[],'学習・説明・レビュー補助に使う。誤情報や出典不明情報は確定判断にしない。','Foundation knowledge material ingestion target.',true,true),
('foundation_knowledge_topic','foundation_knowledge_topic','table_or_view','education_learning','standard','low',ARRAY['education','reference','review','design_reference']::text[],'学習・説明・レビュー補助に使う。通常知識と問題データを混同しない。','Foundation knowledge topic ingestion target.',true,true),
('casual_knowledge_material','casual_knowledge_material','table_or_view','hobby_entertainment','basic','low',ARRAY['smalltalk','reference']::text[],'軽い雑談・気分転換・安全な話題提供に限定する。依存誘導や個人情報要求に使わない。','Casual/smalltalk knowledge material ingestion target.',true,true),
('casual_knowledge_topic','casual_knowledge_topic','table_or_view','hobby_entertainment','basic','low',ARRAY['smalltalk','reference']::text[],'軽い雑談・気分転換・安全な話題提供に限定する。依存誘導や個人情報要求に使わない。','Casual/smalltalk knowledge topic ingestion target.',true,true),
('robot_model_reference','robot_model_reference','table_or_view','robot_aiworker','standard','medium',ARRAY['reference','review','design_reference']::text[],'ロボット説明・設計参照・レビュー補助に限定する。読取権限を実行権限にしない。','Robot model reference ingestion target.',true,true),
('robot_series_reference','robot_series_reference','table_or_view','robot_aiworker','standard','medium',ARRAY['reference','review','design_reference']::text[],'ロボット説明・設計参照・レビュー補助に限定する。シリーズ差は安全境界を緩めない。','Robot series reference ingestion target.',true,true),
('aiworker_robot_reference','aiworker_robot_reference','table_or_view','robot_aiworker','standard','medium',ARRAY['reference','review','design_reference']::text[],'AIWorker/robot参照材料として使う。業務実行・外部操作・承認は別レイヤー。','AIWorker robot reference ingestion target.',true,true),
('security_crisis_reference','security_crisis_reference','table_or_view','security_crisis','specialist','high',ARRAY['risk_check','design_reference','safety_training','review','worldbuilding']::text[],'防災・危機管理・安全設計・フィクション/ゲーム/世界観参照に限定する。現実の攻撃・破壊・監視・強制・違法行為支援は禁止。','Security/crisis reference ingestion target.',true,true),
('city_art_game_reference','city_art_game_reference','table_or_view','city_art_game','standard','low',ARRAY['worldbuilding','design_reference','review','reference']::text[],'都市・アート・ゲーム・Builder設計の参考に使う。権利のない素材利用や危険転用に使わない。','City/art/game reference ingestion target.',true,true),
('culture_region_reference','culture_region_reference','table_or_view','culture_region','standard','low',ARRAY['smalltalk','reference','education','worldbuilding','review']::text[],'文化・地域説明に使う。差別・偏見・優劣付けに使わない。','Culture/region reference ingestion target.',true,true),
('health_life_metrics_reference','health_life_metrics_reference','table_or_view','health_life_metrics','standard','medium',ARRAY['health_life_review','reference','review']::text[],'生活指標の説明・整理・レビュー補助に限定する。医療診断・治療判断ではない。','Health/life metrics reference ingestion target.',true,true),
('business_operation_reference','business_operation_reference','table_or_view','business_operation','standard','medium',ARRAY['business_planning','review','risk_check','design_reference','reference']::text[],'業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤー。','Business operation reference ingestion target.',true,true),
('professional_basic_reference','professional_basic_reference','table_or_view','professional_basic','advanced','medium',ARRAY['reference','review','risk_check','education','design_reference']::text[],'法務・会計・人事などの専門基礎説明・レビュー補助に使う。確定判断は専門家または該当OS/ERPの業務正本で行う。','Professional basic reference ingestion target.',true,true)
ON CONFLICT (object_code) DO UPDATE SET
  source_object_name = EXCLUDED.source_object_name,
  expected_object_kind = EXCLUDED.expected_object_kind,
  brain_domain_code = EXCLUDED.brain_domain_code,
  default_depth_code = EXCLUDED.default_depth_code,
  default_risk_class_code = EXCLUDED.default_risk_class_code,
  default_allowed_use_purpose_codes = EXCLUDED.default_allowed_use_purpose_codes,
  safety_boundary_ja = EXCLUDED.safety_boundary_ja,
  ingestion_note_ja = EXCLUDED.ingestion_note_ja,
  row_level_ingestion_flag = EXCLUDED.row_level_ingestion_flag,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 4. Catalog status / backlog views
-- ============================================================

CREATE OR REPLACE VIEW cx22073jw.vw_brain_source_object_ingestion_catalog_status_v1 AS
SELECT
  c.object_code,
  c.source_schema_name,
  c.source_object_name,
  inv.source_object_kind,
  c.brain_domain_code,
  dc.brain_domain_label_ja,
  c.default_depth_code,
  c.default_risk_class_code,
  c.default_allowed_use_purpose_codes,
  CASE WHEN inv.source_object_name IS NOT NULL THEN true ELSE false END AS source_object_exists_flag,
  inv.estimated_row_count,
  c.row_level_ingestion_flag,
  c.active_flag,
  c.safety_boundary_ja,
  c.ingestion_note_ja
FROM cx22073jw.brain_source_object_ingestion_catalog c
JOIN cx22073jw.brain_data_domain_catalog dc
  ON dc.brain_domain_code = c.brain_domain_code
LEFT JOIN cx22073jw.vw_brain_source_object_inventory_v1 inv
  ON inv.source_schema_name = c.source_schema_name
 AND inv.source_object_name = c.source_object_name
WHERE c.active_flag = true;

CREATE OR REPLACE VIEW cx22073jw.vw_brain_source_object_discovery_backlog_v1 AS
SELECT
  inv.source_schema_name,
  inv.source_object_name,
  inv.source_object_kind,
  inv.estimated_row_count,
  inv.object_comment,
  'needs_domain_mapping' AS backlog_status,
  '未分類のCX source object。brain_source_object_ingestion_catalogへdomain/depth/risk/purpose付きで追加する対象。' AS note_ja
FROM cx22073jw.vw_brain_source_object_inventory_v1 inv
LEFT JOIN cx22073jw.brain_source_object_ingestion_catalog c
  ON c.source_schema_name = inv.source_schema_name
 AND c.source_object_name = inv.source_object_name
WHERE c.object_code IS NULL
  AND inv.internal_brain_management_flag = false
ORDER BY inv.source_object_kind, inv.source_object_name;

-- ============================================================
-- 5. Object-level registry rows for existing cataloged objects
-- ============================================================

INSERT INTO cx22073jw.brain_data_registry
(
  brain_data_code,
  brain_domain_code,
  source_schema_name,
  source_object_name,
  source_record_code,
  source_title_ja,
  depth_code,
  allowed_use_purpose_codes,
  risk_class_code,
  granularity_code,
  safety_boundary_ja,
  active_flag
)
SELECT
  'srcobj:' || c.object_code AS brain_data_code,
  c.brain_domain_code,
  c.source_schema_name,
  c.source_object_name,
  c.object_code AS source_record_code,
  'CX source object: ' || c.source_object_name AS source_title_ja,
  c.default_depth_code,
  c.default_allowed_use_purpose_codes,
  c.default_risk_class_code,
  'record' AS granularity_code,
  c.safety_boundary_ja,
  true AS active_flag
FROM cx22073jw.vw_brain_source_object_ingestion_catalog_status_v1 c
WHERE c.source_object_exists_flag = true
ON CONFLICT (brain_data_code) DO UPDATE SET
  brain_domain_code = EXCLUDED.brain_domain_code,
  source_schema_name = EXCLUDED.source_schema_name,
  source_object_name = EXCLUDED.source_object_name,
  source_record_code = EXCLUDED.source_record_code,
  source_title_ja = EXCLUDED.source_title_ja,
  depth_code = EXCLUDED.depth_code,
  allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
  risk_class_code = EXCLUDED.risk_class_code,
  granularity_code = EXCLUDED.granularity_code,
  safety_boundary_ja = EXCLUDED.safety_boundary_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 6. Row-level registry ingestion where safe candidate columns exist
-- ============================================================

DO $$
DECLARE
  r record;
  code_col text;
  title_col text;
  dyn_sql text;
  rel_exists regclass;
BEGIN
  FOR r IN
    SELECT *
    FROM cx22073jw.brain_source_object_ingestion_catalog
    WHERE active_flag = true
      AND row_level_ingestion_flag = true
  LOOP
    SELECT to_regclass(format('%I.%I', r.source_schema_name, r.source_object_name))
      INTO rel_exists;

    IF rel_exists IS NULL THEN
      CONTINUE;
    END IF;

    SELECT candidate_col
      INTO code_col
    FROM unnest(r.code_candidate_columns) WITH ORDINALITY AS x(candidate_col, ord)
    WHERE EXISTS (
      SELECT 1
      FROM information_schema.columns col
      WHERE col.table_schema = r.source_schema_name
        AND col.table_name = r.source_object_name
        AND col.column_name = x.candidate_col
    )
    ORDER BY ord
    LIMIT 1;

    IF code_col IS NULL THEN
      CONTINUE;
    END IF;

    SELECT candidate_col
      INTO title_col
    FROM unnest(r.title_candidate_columns) WITH ORDINALITY AS x(candidate_col, ord)
    WHERE EXISTS (
      SELECT 1
      FROM information_schema.columns col
      WHERE col.table_schema = r.source_schema_name
        AND col.table_name = r.source_object_name
        AND col.column_name = x.candidate_col
    )
    ORDER BY ord
    LIMIT 1;

    IF title_col IS NULL THEN
      dyn_sql := format($fmt$
        INSERT INTO cx22073jw.brain_data_registry
        (
          brain_data_code,
          brain_domain_code,
          source_schema_name,
          source_object_name,
          source_record_code,
          source_title_ja,
          depth_code,
          allowed_use_purpose_codes,
          risk_class_code,
          granularity_code,
          safety_boundary_ja,
          active_flag
        )
        SELECT
          'srcrow:' || %L || ':' || md5(%L || ':' || COALESCE(t.%I::text, '')) AS brain_data_code,
          %L AS brain_domain_code,
          %L AS source_schema_name,
          %L AS source_object_name,
          left(COALESCE(t.%I::text, ''), 240) AS source_record_code,
          left(%L || ': ' || COALESCE(t.%I::text, ''), 240) AS source_title_ja,
          %L AS depth_code,
          %L::text[] AS allowed_use_purpose_codes,
          %L AS risk_class_code,
          'record' AS granularity_code,
          %L AS safety_boundary_ja,
          true AS active_flag
        FROM %I.%I t
        WHERE t.%I IS NOT NULL
          AND COALESCE(t.%I::text, '') <> ''
        ON CONFLICT (brain_data_code) DO UPDATE SET
          brain_domain_code = EXCLUDED.brain_domain_code,
          source_schema_name = EXCLUDED.source_schema_name,
          source_object_name = EXCLUDED.source_object_name,
          source_record_code = EXCLUDED.source_record_code,
          source_title_ja = EXCLUDED.source_title_ja,
          depth_code = EXCLUDED.depth_code,
          allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
          risk_class_code = EXCLUDED.risk_class_code,
          granularity_code = EXCLUDED.granularity_code,
          safety_boundary_ja = EXCLUDED.safety_boundary_ja,
          active_flag = true,
          updated_at = now()
      $fmt$,
        r.object_code, r.object_code, code_col,
        r.brain_domain_code,
        r.source_schema_name,
        r.source_object_name,
        code_col,
        r.source_object_name, code_col,
        r.default_depth_code,
        r.default_allowed_use_purpose_codes,
        r.default_risk_class_code,
        r.safety_boundary_ja,
        r.source_schema_name, r.source_object_name,
        code_col,
        code_col
      );
    ELSE
      dyn_sql := format($fmt$
        INSERT INTO cx22073jw.brain_data_registry
        (
          brain_data_code,
          brain_domain_code,
          source_schema_name,
          source_object_name,
          source_record_code,
          source_title_ja,
          depth_code,
          allowed_use_purpose_codes,
          risk_class_code,
          granularity_code,
          safety_boundary_ja,
          active_flag
        )
        SELECT
          'srcrow:' || %L || ':' || md5(%L || ':' || COALESCE(t.%I::text, '')) AS brain_data_code,
          %L AS brain_domain_code,
          %L AS source_schema_name,
          %L AS source_object_name,
          left(COALESCE(t.%I::text, ''), 240) AS source_record_code,
          left(COALESCE(NULLIF(t.%I::text, ''), %L || ': ' || COALESCE(t.%I::text, '')), 240) AS source_title_ja,
          %L AS depth_code,
          %L::text[] AS allowed_use_purpose_codes,
          %L AS risk_class_code,
          'record' AS granularity_code,
          %L AS safety_boundary_ja,
          true AS active_flag
        FROM %I.%I t
        WHERE t.%I IS NOT NULL
          AND COALESCE(t.%I::text, '') <> ''
        ON CONFLICT (brain_data_code) DO UPDATE SET
          brain_domain_code = EXCLUDED.brain_domain_code,
          source_schema_name = EXCLUDED.source_schema_name,
          source_object_name = EXCLUDED.source_object_name,
          source_record_code = EXCLUDED.source_record_code,
          source_title_ja = EXCLUDED.source_title_ja,
          depth_code = EXCLUDED.depth_code,
          allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
          risk_class_code = EXCLUDED.risk_class_code,
          granularity_code = EXCLUDED.granularity_code,
          safety_boundary_ja = EXCLUDED.safety_boundary_ja,
          active_flag = true,
          updated_at = now()
      $fmt$,
        r.object_code, r.object_code, code_col,
        r.brain_domain_code,
        r.source_schema_name,
        r.source_object_name,
        code_col,
        title_col, r.source_object_name, code_col,
        r.default_depth_code,
        r.default_allowed_use_purpose_codes,
        r.default_risk_class_code,
        r.safety_boundary_ja,
        r.source_schema_name, r.source_object_name,
        code_col,
        code_col
      );
    END IF;

    EXECUTE dyn_sql;
  END LOOP;
END $$;

-- ============================================================
-- 7. Source ingestion summary view
-- ============================================================

CREATE OR REPLACE VIEW cx22073jw.vw_brain_source_object_ingestion_summary_v1 AS
SELECT
  c.object_code,
  c.source_schema_name,
  c.source_object_name,
  c.source_object_kind,
  c.brain_domain_code,
  c.brain_domain_label_ja,
  c.source_object_exists_flag,
  c.estimated_row_count,
  count(r.brain_data_code) FILTER (WHERE r.brain_data_code LIKE 'srcobj:%') AS object_registry_count,
  count(r.brain_data_code) FILTER (WHERE r.brain_data_code LIKE 'srcrow:%') AS row_registry_count,
  count(r.brain_data_code) FILTER (WHERE r.source_exists_flag = true) AS registry_source_exists_count,
  count(r.brain_data_code) FILTER (WHERE r.source_exists_flag = false) AS registry_source_missing_count,
  c.safety_boundary_ja,
  c.ingestion_note_ja
FROM cx22073jw.vw_brain_source_object_ingestion_catalog_status_v1 c
LEFT JOIN cx22073jw.vw_brain_data_registry_v1 r
  ON r.source_schema_name = c.source_schema_name
 AND r.source_object_name = c.source_object_name
 AND (
   r.brain_data_code = 'srcobj:' || c.object_code
   OR r.brain_data_code LIKE 'srcrow:' || c.object_code || ':%'
 )
GROUP BY
  c.object_code,
  c.source_schema_name,
  c.source_object_name,
  c.source_object_kind,
  c.brain_domain_code,
  c.brain_domain_label_ja,
  c.source_object_exists_flag,
  c.estimated_row_count,
  c.safety_boundary_ja,
  c.ingestion_note_ja;

-- ============================================================
-- 8. Refresh full-load coverage view to include new registry rows
-- ============================================================

CREATE OR REPLACE VIEW cx22073jw.vw_brain_full_load_coverage_v1 AS
WITH unit_counts AS (
  SELECT
    brain_domain_code,
    count(*) FILTER (WHERE active_flag = true) AS active_unit_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack02_%') AS pack02_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack03_%') AS pack03_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack04_%') AS pack04_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack05_%') AS pack05_count
  FROM cx22073jw.brain_knowledge_unit
  GROUP BY brain_domain_code
),
registry_counts AS (
  SELECT
    brain_domain_code,
    count(*) AS registry_count,
    count(*) FILTER (WHERE brain_data_code LIKE 'srcobj:%') AS source_object_registry_count,
    count(*) FILTER (WHERE brain_data_code LIKE 'srcrow:%') AS source_row_registry_count,
    count(*) FILTER (WHERE source_exists_flag = true) AS source_exists_count,
    count(*) FILTER (WHERE source_exists_flag = false) AS source_missing_count
  FROM cx22073jw.vw_brain_data_registry_v1
  GROUP BY brain_domain_code
),
readable_counts AS (
  SELECT
    brain_domain_code,
    count(DISTINCT model_code) AS readable_model_count,
    count(*) AS readable_material_row_count
  FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
  GROUP BY brain_domain_code
)
SELECT
  s.brain_domain_code,
  dc.brain_domain_label_ja,
  s.full_load_priority,
  s.target_min_unit_count,
  COALESCE(u.active_unit_count, 0) AS active_unit_count,
  COALESCE(u.pack02_count, 0) AS pack02_count,
  COALESCE(u.pack03_count, 0) AS pack03_count,
  COALESCE(u.pack04_count, 0) AS pack04_count,
  COALESCE(u.pack05_count, 0) AS pack05_count,
  COALESCE(r.registry_count, 0) AS registry_count,
  COALESCE(r.source_object_registry_count, 0) AS source_object_registry_count,
  COALESCE(r.source_row_registry_count, 0) AS source_row_registry_count,
  COALESCE(r.source_exists_count, 0) AS source_exists_count,
  COALESCE(r.source_missing_count, 0) AS source_missing_count,
  COALESCE(rc.readable_model_count, 0) AS readable_model_count,
  COALESCE(rc.readable_material_row_count, 0) AS readable_material_row_count,
  CASE
    WHEN COALESCE(u.active_unit_count, 0) >= s.target_min_unit_count
     AND COALESCE(r.source_missing_count, 0) = 0
    THEN 'loaded'
    WHEN COALESCE(u.active_unit_count, 0) > 0
     AND COALESCE(r.source_missing_count, 0) = 0
    THEN 'partial_loaded'
    ELSE 'needs_load'
  END AS full_load_status,
  s.full_load_note_ja
FROM cx22073jw.brain_full_load_scope_catalog s
JOIN cx22073jw.brain_data_domain_catalog dc
  ON dc.brain_domain_code = s.brain_domain_code
LEFT JOIN unit_counts u
  ON u.brain_domain_code = s.brain_domain_code
LEFT JOIN registry_counts r
  ON r.brain_domain_code = s.brain_domain_code
LEFT JOIN readable_counts rc
  ON rc.brain_domain_code = s.brain_domain_code
WHERE s.active_flag = true;

COMMIT;
