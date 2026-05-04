\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 0. Guard
-- ============================================================

DO $$
BEGIN
  IF to_regclass('aiworker.vw_robot_readable_brain_runtime_material_v1') IS NULL THEN
    RAISE EXCEPTION 'Required view missing: aiworker.vw_robot_readable_brain_runtime_material_v1. Run Lane04 first.';
  END IF;

  IF to_regclass('cx22073jw.vw_brain_full_load_coverage_v1') IS NULL THEN
    RAISE EXCEPTION 'Required view missing: cx22073jw.vw_brain_full_load_coverage_v1. Run Lane05 first.';
  END IF;
END $$;

-- ============================================================
-- 1. Runtime selection policy table
-- ============================================================

CREATE TABLE IF NOT EXISTS aiworker.brain_runtime_selection_policy_catalog (
  policy_code text PRIMARY KEY,
  policy_order integer NOT NULL,
  policy_title_ja text NOT NULL,
  policy_summary_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO aiworker.brain_runtime_selection_policy_catalog
(policy_code, policy_order, policy_title_ja, policy_summary_ja, active_flag)
VALUES
('purpose_match_first', 10, 'purpose一致優先', 'runtime request の use_purpose_code と material の effective_use_purpose_codes が一致するものを優先する。', true),
('domain_filter_respected', 20, 'domain filter尊重', '指定domainがある場合、そのdomainだけを選抜対象にする。', true),
('high_risk_safe_purpose_only', 30, '高リスク安全用途限定', 'security_crisis等のhigh risk materialはrisk_check/design_reference/safety_training/review/worldbuilding等に限定する。', true),
('domain_top_n', 40, 'domain別上限', '一つのdomainがruntime contextを占有しないようdomain_rankで制限する。', true),
('total_top_n', 50, '全体上限', 'runtime promptを肥大化させないようoverall_rankで制限する。', true),
('lane_and_srcmat_kept', 60, 'lane/srcmat保持', 'Lane05の補強materialとLane04のsrcmat materialが押し出されないようsource種別をscoreへ反映する。', true),
('forbidden_boundary_preserved', 70, '禁止境界維持', 'HD-R1CやHD-R2系のdomain denyはeffective access view側で維持する。', true)
ON CONFLICT (policy_code) DO UPDATE SET
  policy_order = EXCLUDED.policy_order,
  policy_title_ja = EXCLUDED.policy_title_ja,
  policy_summary_ja = EXCLUDED.policy_summary_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 2. Material scoring view
-- 汎用score。request-specificなpurpose/domain制御はfunction側で行う。
-- ============================================================

CREATE OR REPLACE VIEW aiworker.vw_robot_brain_runtime_material_scoring_base_v1 AS
SELECT
  m.*,
  CASE
    WHEN m.unit_code LIKE 'srcmat_%' THEN 'source_registry'
    WHEN m.unit_code LIKE 'lane05_%' THEN 'lane05_fillup'
    WHEN m.unit_code LIKE 'pack05_%' THEN 'pack05_full_load'
    WHEN m.unit_code LIKE 'pack04_%' THEN 'pack04_robot_diff'
    WHEN m.unit_code LIKE 'pack03_%' THEN 'pack03_life_learning_city'
    WHEN m.unit_code LIKE 'pack02_%' THEN 'pack02_professional'
    WHEN m.unit_code LIKE 'pack01_%' THEN 'pack01_base'
    ELSE 'base_material'
  END AS material_source_kind,
  CASE
    WHEN m.unit_code LIKE 'lane05_%' THEN 700
    WHEN m.unit_code LIKE 'srcmat_%' THEN 650
    WHEN m.unit_code LIKE 'pack05_%' THEN 620
    WHEN m.unit_code LIKE 'pack04_%' THEN 600
    WHEN m.unit_code LIKE 'pack03_%' THEN 500
    WHEN m.unit_code LIKE 'pack02_%' THEN 450
    WHEN m.unit_code LIKE 'pack01_%' THEN 400
    ELSE 350
  END AS source_kind_score,
  COALESCE(c.full_load_priority, 999) AS full_load_priority,
  GREATEST(0, 1000 - COALESCE(c.full_load_priority, 999)) AS domain_priority_score,
  CASE m.risk_class_code
    WHEN 'low' THEN 80
    WHEN 'medium' THEN 50
    WHEN 'high' THEN 20
    ELSE 30
  END AS risk_base_score,
  COALESCE(m.data_depth_level, 0) * 10 AS depth_score
FROM aiworker.vw_robot_readable_brain_runtime_material_v1 m
LEFT JOIN cx22073jw.vw_brain_full_load_coverage_v1 c
  ON c.brain_domain_code = m.brain_domain_code;

-- ============================================================
-- 3. Runtime material selection function
-- DB選抜入口。
-- provider patchは次工程でこのfunctionへ差し替えればよい。
-- ============================================================

CREATE OR REPLACE FUNCTION aiworker.fn_robot_brain_runtime_material_select_v1(
  p_model_code text,
  p_use_purpose_code text DEFAULT 'reference',
  p_domain_codes text[] DEFAULT NULL,
  p_limit_per_domain integer DEFAULT 20,
  p_total_limit integer DEFAULT 80
)
RETURNS TABLE (
  profile_source_type text,
  model_code text,
  series_code text,
  role_code text,
  brain_data_code text,
  brain_domain_code text,
  brain_domain_label_ja text,
  depth_code text,
  data_depth_level integer,
  risk_class_code text,
  granularity_code text,
  effective_use_purpose_codes text[],
  access_decision_code text,
  source_exists_flag boolean,
  unit_code text,
  unit_title_ja text,
  unit_summary_ja text,
  unit_detail_ja text,
  practical_use_ja text,
  example_prompt_ja text,
  safety_boundary_ja text,
  tags text[],
  material_source_kind text,
  selection_score integer,
  domain_rank bigint,
  overall_rank bigint,
  selection_reason_ja text
)
LANGUAGE sql
STABLE
AS $$
WITH filtered AS (
  SELECT
    m.*,
    CASE
      WHEN m.effective_use_purpose_codes && ARRAY[p_use_purpose_code]::text[] THEN 1
      ELSE 0
    END AS purpose_match_flag,
    CASE
      WHEN p_domain_codes IS NULL OR array_length(p_domain_codes, 1) IS NULL THEN 1
      WHEN m.brain_domain_code = ANY(p_domain_codes) THEN 1
      ELSE 0
    END AS domain_match_flag,
    CASE
      WHEN m.risk_class_code = 'high'
       AND p_use_purpose_code NOT IN ('risk_check','design_reference','safety_training','review','worldbuilding','executive_planning')
      THEN 0
      ELSE 1
    END AS high_risk_safe_flag
  FROM aiworker.vw_robot_brain_runtime_material_scoring_base_v1 m
  WHERE m.model_code = p_model_code
    AND (p_domain_codes IS NULL OR array_length(p_domain_codes, 1) IS NULL OR m.brain_domain_code = ANY(p_domain_codes))
    AND (
      m.effective_use_purpose_codes && ARRAY[p_use_purpose_code]::text[]
      OR p_use_purpose_code IN ('reference','review')
      OR m.effective_use_purpose_codes && ARRAY['reference']::text[]
    )
),
scored AS (
  SELECT
    f.*,
    (
      CASE WHEN f.purpose_match_flag = 1 THEN 100000 ELSE 0 END
      + CASE WHEN f.domain_match_flag = 1 THEN 20000 ELSE -20000 END
      + CASE WHEN f.high_risk_safe_flag = 1 THEN 0 ELSE -100000 END
      + f.source_kind_score
      + f.domain_priority_score
      + f.risk_base_score
      + f.depth_score
      + CASE
          WHEN f.unit_code LIKE 'lane05_%' THEN 250
          WHEN f.unit_code LIKE 'srcmat_%' THEN 220
          WHEN f.unit_code LIKE 'pack05_%' THEN 200
          WHEN f.unit_code LIKE 'pack04_%' THEN 180
          ELSE 0
        END
    )::integer AS selection_score
  FROM filtered f
  WHERE f.domain_match_flag = 1
    AND f.high_risk_safe_flag = 1
),
ranked AS (
  SELECT
    s.*,
    row_number() OVER (
      PARTITION BY s.brain_domain_code
      ORDER BY
        s.selection_score DESC,
        s.source_kind_score DESC,
        s.data_depth_level DESC NULLS LAST,
        s.unit_code ASC
    ) AS domain_rank,
    row_number() OVER (
      ORDER BY
        s.selection_score DESC,
        s.domain_priority_score DESC,
        s.source_kind_score DESC,
        s.data_depth_level DESC NULLS LAST,
        s.brain_domain_code ASC,
        s.unit_code ASC
    ) AS overall_rank
  FROM scored s
)
SELECT
  r.profile_source_type::text,
  r.model_code::text,
  r.series_code::text,
  r.role_code::text,
  r.brain_data_code::text,
  r.brain_domain_code::text,
  r.brain_domain_label_ja::text,
  r.depth_code::text,
  r.data_depth_level::integer,
  r.risk_class_code::text,
  r.granularity_code::text,
  r.effective_use_purpose_codes::text[],
  r.access_decision_code::text,
  r.source_exists_flag::boolean,
  r.unit_code::text,
  r.unit_title_ja::text,
  r.unit_summary_ja::text,
  r.unit_detail_ja::text,
  r.practical_use_ja::text,
  r.example_prompt_ja::text,
  r.safety_boundary_ja::text,
  r.tags::text[],
  r.material_source_kind::text,
  r.selection_score::integer,
  r.domain_rank::bigint,
  r.overall_rank::bigint,
  (
    'purpose=' || p_use_purpose_code
    || ' / source=' || r.material_source_kind
    || ' / domain_rank=' || r.domain_rank
    || ' / overall_rank=' || r.overall_rank
    || ' / score=' || r.selection_score
  )::text AS selection_reason_ja
FROM ranked r
WHERE r.domain_rank <= GREATEST(p_limit_per_domain, 1)
  AND r.overall_rank <= GREATEST(p_total_limit, 1)
ORDER BY r.overall_rank;
$$;

COMMENT ON FUNCTION aiworker.fn_robot_brain_runtime_material_select_v1(text, text, text[], integer, integer)
IS 'AIWorkerOS runtime brain material selection function. Selects readable materials by model/purpose/domain with top-N ranking while preserving safety boundaries.';

-- ============================================================
-- 4. Smoke case catalog
-- ============================================================

CREATE TABLE IF NOT EXISTS aiworker.brain_runtime_selection_smoke_case_catalog (
  smoke_case_code text PRIMARY KEY,
  model_code text NOT NULL,
  use_purpose_code text NOT NULL,
  domain_codes text[],
  limit_per_domain integer NOT NULL DEFAULT 10,
  total_limit integer NOT NULL DEFAULT 40,
  min_result_count integer NOT NULL DEFAULT 1,
  forbidden_domain_codes text[] NOT NULL DEFAULT ARRAY[]::text[],
  required_source_kinds text[] NOT NULL DEFAULT ARRAY[]::text[],
  smoke_note_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO aiworker.brain_runtime_selection_smoke_case_catalog
(smoke_case_code, model_code, use_purpose_code, domain_codes, limit_per_domain, total_limit, min_result_count, forbidden_domain_codes, required_source_kinds, smoke_note_ja, active_flag)
VALUES
('hd_r5p_executive', 'HD-R5P', 'executive_planning', ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[], 12, 36, 6, ARRAY['security_crisis']::text[], ARRAY['lane05_fillup','source_registry','pack05_full_load']::text[], 'President executive planning selection smoke.', true),
('hd_r5_manager', 'HD-R5', 'business_planning', ARRAY['business_operation','robot_aiworker','education_learning']::text[], 12, 36, 6, ARRAY['security_crisis']::text[], ARRAY['lane05_fillup','pack05_full_load']::text[], 'Manager business planning selection smoke.', true),
('hd_r3_worker_exam', 'HD-R3', 'exam_practice', ARRAY['exam_learning','education_learning']::text[], 10, 30, 4, ARRAY['security_crisis','professional_basic']::text[], ARRAY['lane05_fillup','source_registry','pack05_full_load']::text[], 'Worker exam/education selection smoke.', true),
('hd_r1c_smalltalk', 'HD-R1C', 'smalltalk', ARRAY['culture_region','food_nutrition','hobby_entertainment','season_calendar']::text[], 10, 40, 4, ARRAY['business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning']::text[], ARRAY['lane05_fillup','pack05_full_load']::text[], 'Friend smalltalk selection smoke.', true),
('hd_r2_risk', 'HD-R2', 'risk_check', ARRAY['security_crisis','robot_aiworker','city_art_game']::text[], 10, 35, 4, ARRAY['business_operation','professional_basic']::text[], ARRAY['lane05_fillup','source_registry','pack05_full_load']::text[], 'Security risk_check selection smoke.', true),
('byd2003_review', 'BYD2-003', 'review', ARRAY['business_operation','professional_basic','robot_aiworker','history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[], 8, 56, 10, ARRAY['security_crisis']::text[], ARRAY['lane05_fillup','source_registry','pack05_full_load']::text[], 'Beyond integrated review selection smoke.', true),
('mg_norn_002_health', 'MG-NORN-002', 'health_life_review', ARRAY['health_life_metrics','culture_region','robot_aiworker']::text[], 10, 35, 4, ARRAY['security_crisis','business_operation','professional_basic']::text[], ARRAY['lane05_fillup','pack05_full_load']::text[], 'Verdandi health/life review selection smoke.', true),
('mg_norn_003_business', 'MG-NORN-003', 'business_planning', ARRAY['business_operation','robot_aiworker','city_art_game']::text[], 10, 35, 4, ARRAY['security_crisis']::text[], ARRAY['lane05_fillup','pack05_full_load']::text[], 'Skuld business/future planning selection smoke.', true)
ON CONFLICT (smoke_case_code) DO UPDATE SET
  model_code = EXCLUDED.model_code,
  use_purpose_code = EXCLUDED.use_purpose_code,
  domain_codes = EXCLUDED.domain_codes,
  limit_per_domain = EXCLUDED.limit_per_domain,
  total_limit = EXCLUDED.total_limit,
  min_result_count = EXCLUDED.min_result_count,
  forbidden_domain_codes = EXCLUDED.forbidden_domain_codes,
  required_source_kinds = EXCLUDED.required_source_kinds,
  smoke_note_ja = EXCLUDED.smoke_note_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 5. Smoke board view
-- ============================================================

CREATE OR REPLACE VIEW aiworker.vw_brain_runtime_selection_smoke_board_v1 AS
WITH selected AS (
  SELECT
    c.smoke_case_code,
    c.model_code,
    c.use_purpose_code,
    c.domain_codes,
    c.limit_per_domain,
    c.total_limit,
    c.min_result_count,
    c.forbidden_domain_codes,
    c.required_source_kinds,
    m.brain_domain_code,
    m.unit_code,
    m.material_source_kind,
    m.selection_score,
    m.domain_rank,
    m.overall_rank
  FROM aiworker.brain_runtime_selection_smoke_case_catalog c
  CROSS JOIN LATERAL aiworker.fn_robot_brain_runtime_material_select_v1(
    c.model_code,
    c.use_purpose_code,
    c.domain_codes,
    c.limit_per_domain,
    c.total_limit
  ) m
  WHERE c.active_flag = true
),
summary AS (
  SELECT
    c.smoke_case_code,
    c.model_code,
    c.use_purpose_code,
    c.domain_codes,
    c.limit_per_domain,
    c.total_limit,
    c.min_result_count,
    c.forbidden_domain_codes,
    c.required_source_kinds,
    count(s.unit_code) AS selected_count,
    max(s.domain_rank) AS max_domain_rank,
    max(s.overall_rank) AS max_overall_rank,
    array_agg(DISTINCT s.brain_domain_code ORDER BY s.brain_domain_code) FILTER (WHERE s.brain_domain_code IS NOT NULL) AS selected_domains,
    array_agg(DISTINCT s.material_source_kind ORDER BY s.material_source_kind) FILTER (WHERE s.material_source_kind IS NOT NULL) AS selected_source_kinds,
    count(*) FILTER (WHERE s.brain_domain_code = ANY(c.forbidden_domain_codes)) AS forbidden_hit_count
  FROM aiworker.brain_runtime_selection_smoke_case_catalog c
  LEFT JOIN selected s
    ON s.smoke_case_code = c.smoke_case_code
  WHERE c.active_flag = true
  GROUP BY
    c.smoke_case_code,
    c.model_code,
    c.use_purpose_code,
    c.domain_codes,
    c.limit_per_domain,
    c.total_limit,
    c.min_result_count,
    c.forbidden_domain_codes,
    c.required_source_kinds
)
SELECT
  smoke_case_code,
  model_code,
  use_purpose_code,
  selected_count,
  min_result_count,
  max_domain_rank,
  limit_per_domain,
  max_overall_rank,
  total_limit,
  selected_domains,
  selected_source_kinds,
  forbidden_hit_count,
  CASE
    WHEN selected_count < min_result_count THEN 'FAIL_TOO_FEW'
    WHEN forbidden_hit_count > 0 THEN 'FAIL_FORBIDDEN_DOMAIN'
    WHEN max_domain_rank > limit_per_domain THEN 'FAIL_DOMAIN_LIMIT'
    WHEN max_overall_rank > total_limit THEN 'FAIL_TOTAL_LIMIT'
    ELSE 'PASS'
  END AS smoke_result_code
FROM summary;

COMMIT;
