\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 1. Explicit deny:
-- HD-R2 / HD-R2S / HD-R2G are security/specialist系。
-- business_operation / professional_basic は通常仕事系・専門基礎系なので、
-- brain accessとしては明示denyに寄せる。
-- ============================================================

INSERT INTO aiworker.robot_brain_model_domain_policy
(
  model_code,
  brain_domain_code,
  policy_code,
  allowed_use_purpose_codes,
  safety_note_ja,
  active_flag
)
VALUES
('HD-R2',  'business_operation', 'deny', ARRAY[]::text[], 'HD-R2は戦闘/警備系。通常業務domainは読取不可。', true),
('HD-R2',  'professional_basic', 'deny', ARRAY[]::text[], 'HD-R2は戦闘/警備系。専門基礎domainは読取不可。', true),
('HD-R2S', 'business_operation', 'deny', ARRAY[]::text[], 'HD-R2Sは特殊/高精度対象特化系。通常業務domainは読取不可。', true),
('HD-R2S', 'professional_basic', 'deny', ARRAY[]::text[], 'HD-R2Sは特殊/高精度対象特化系。専門基礎domainは読取不可。', true),
('HD-R2G', 'business_operation', 'deny', ARRAY[]::text[], 'HD-R2Gは警備/統制/危機対応系として扱う場合、通常業務domainは読取不可。', true),
('HD-R2G', 'professional_basic', 'deny', ARRAY[]::text[], 'HD-R2Gは警備/統制/危機対応系として扱う場合、専門基礎domainは読取不可。', true)
ON CONFLICT (model_code, brain_domain_code) DO UPDATE SET
  policy_code = EXCLUDED.policy_code,
  allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
  safety_note_ja = EXCLUDED.safety_note_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 2. Hygiene:
-- focus_domain_codes から business/professional を除外。
-- model_domain_policy deny が最終的に効くが、profile上も読みやすくする。
-- ============================================================

UPDATE aiworker.robot_brain_model_profile p
SET
  focus_domain_codes = COALESCE(
    (
      SELECT array_agg(x ORDER BY x)
      FROM unnest(p.focus_domain_codes) AS u(x)
      WHERE x NOT IN ('business_operation', 'professional_basic')
    ),
    ARRAY[]::text[]
  ),
  updated_at = now()
WHERE p.model_code IN ('HD-R2', 'HD-R2S', 'HD-R2G');

COMMIT;
