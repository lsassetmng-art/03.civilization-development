\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- CX registry seed repair
-- Add missing brain data rows for business_operation / professional_basic.
-- This is additive metadata only.
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
VALUES
(
  'business_operation_reference',
  'business_operation',
  'cx22073jw',
  'foundation_knowledge_topic',
  'business_operation',
  '業務運用参照',
  'standard',
  ARRAY['reference','review','business_planning','design_reference']::text[],
  'medium',
  'topic',
  '業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。',
  true
),
(
  'professional_basic_reference',
  'professional_basic',
  'cx22073jw',
  'foundation_knowledge_topic',
  'professional_basic',
  '専門基礎参照',
  'advanced',
  ARRAY['reference','review','risk_check','education']::text[],
  'medium',
  'topic',
  '法務・会計・人事などの専門基礎説明・レビュー補助に使う。確定判断は専門家または該当OS/ERPの業務正本で行う。',
  true
)
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

COMMIT;
