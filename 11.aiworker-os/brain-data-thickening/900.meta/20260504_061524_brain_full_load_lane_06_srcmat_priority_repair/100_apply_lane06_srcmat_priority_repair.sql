\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 0. Guard
-- ============================================================

DO $$
BEGIN
  IF to_regclass('aiworker.vw_robot_readable_brain_runtime_material_v1') IS NULL THEN
    RAISE EXCEPTION 'Required view missing: aiworker.vw_robot_readable_brain_runtime_material_v1';
  END IF;

  IF to_regprocedure('aiworker.fn_robot_brain_runtime_material_select_v1(text,text,text[],integer,integer)') IS NULL THEN
    RAISE EXCEPTION 'Required function missing: aiworker.fn_robot_brain_runtime_material_select_v1';
  END IF;
END $$;

-- ============================================================
-- 1. Policy note
-- ============================================================

INSERT INTO aiworker.brain_runtime_selection_policy_catalog
(policy_code, policy_order, policy_title_ja, policy_summary_ja, active_flag)
VALUES
('source_registry_priority_repair', 65, 'source registry優先補正', 'Lane05 fillupが増えた後も、既存CX source由来のsrcmat_ materialがruntime選抜から押し出されないよう優先度を補正する。', true)
ON CONFLICT (policy_code) DO UPDATE SET
  policy_order = EXCLUDED.policy_order,
  policy_title_ja = EXCLUDED.policy_title_ja,
  policy_summary_ja = EXCLUDED.policy_summary_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 2. Scoring base repair
-- srcmat_ は既存CX source実体由来なので lane05 より優先。
-- lane05 は全載せ補強なので、srcmat_の次に厚く残す。
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
    WHEN m.unit_code LIKE 'srcmat_%' THEN 1100
    WHEN m.unit_code LIKE 'lane05_%' THEN 820
    WHEN m.unit_code LIKE 'pack05_%' THEN 760
    WHEN m.unit_code LIKE 'pack04_%' THEN 700
    WHEN m.unit_code LIKE 'pack03_%' THEN 560
    WHEN m.unit_code LIKE 'pack02_%' THEN 510
    WHEN m.unit_code LIKE 'pack01_%' THEN 460
    ELSE 400
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
-- 3. Selector repair
-- source_registry bonusを上げる。
-- ただしlane05も十分残るよう、lane05 bonusも維持。
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
    AND (
      p_domain_codes IS NULL
      OR array_length(p_domain_codes, 1) IS NULL
      OR m.brain_domain_code = ANY(p_domain_codes)
    )
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
          WHEN f.unit_code LIKE 'srcmat_%' THEN 700
          WHEN f.unit_code LIKE 'lane05_%' THEN 320
          WHEN f.unit_code LIKE 'pack05_%' THEN 250
          WHEN f.unit_code LIKE 'pack04_%' THEN 200
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
IS 'AIWorkerOS runtime brain material selection function. Lane06 repaired: srcmat/source_registry is prioritized so existing CX source materials are not pushed out by Lane05 fill-up materials.';

-- smoke board は既存定義を利用。function差し替えで自動的に結果が変わる。

COMMIT;
