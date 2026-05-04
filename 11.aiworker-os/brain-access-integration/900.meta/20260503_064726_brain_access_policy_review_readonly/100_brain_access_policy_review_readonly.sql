\set ON_ERROR_STOP on

SELECT
  '01_policy_summary_by_model' AS section,
  model_code,
  role_code,
  count(*) AS candidate_count,
  count(*) FILTER (WHERE can_read_flag = true) AS readable_count,
  count(*) FILTER (WHERE can_read_flag = false) AS denied_count
FROM aiworker.vw_robot_brain_effective_access_v1
GROUP BY model_code, role_code
ORDER BY model_code, role_code;

SELECT
  '02_readable_domains_by_model' AS section,
  model_code,
  role_code,
  string_agg(brain_domain_code, ', ' ORDER BY brain_domain_code) AS readable_domains
FROM (
  SELECT DISTINCT
    model_code,
    role_code,
    brain_domain_code
  FROM aiworker.vw_robot_brain_effective_access_v1
  WHERE can_read_flag = true
) s
GROUP BY model_code, role_code
ORDER BY model_code, role_code;

SELECT
  '03_security_specialist_business_professional_review_candidates' AS section,
  model_code,
  role_code,
  brain_domain_code,
  brain_data_code,
  can_read_flag,
  access_decision_code,
  effective_use_purpose_codes,
  profile_safety_note_ja,
  model_policy_safety_note_ja,
  role_policy_safety_note_ja
FROM aiworker.vw_robot_brain_effective_access_v1
WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
  AND brain_domain_code IN ('business_operation','professional_basic')
  AND can_read_flag = true
ORDER BY model_code, brain_domain_code, brain_data_code;

SELECT
  '04_friend_lover_forbidden_domain_check' AS section,
  model_code,
  role_code,
  brain_domain_code,
  brain_data_code,
  can_read_flag,
  access_decision_code
FROM aiworker.vw_robot_brain_effective_access_v1
WHERE role_code IN ('Friend','Lover')
  AND brain_domain_code IN ('business_operation','professional_basic','security_crisis')
ORDER BY model_code, brain_domain_code, brain_data_code;

SELECT
  '05_high_risk_readable_check' AS section,
  model_code,
  role_code,
  brain_domain_code,
  brain_data_code,
  risk_class_code,
  can_read_flag,
  access_decision_code,
  effective_use_purpose_codes,
  registry_safety_boundary_ja
FROM aiworker.vw_robot_brain_effective_access_v1
WHERE risk_class_code IN ('high','restricted')
  AND can_read_flag = true
ORDER BY model_code, brain_domain_code, brain_data_code;

SELECT
  '06_source_missing_review' AS section,
  brain_data_code,
  brain_domain_code,
  source_schema_name,
  source_object_name,
  source_record_code,
  source_title_ja,
  source_exists_flag
FROM cx22073jw.vw_brain_data_registry_v1
WHERE source_exists_flag = false
ORDER BY brain_domain_code, brain_data_code;

SELECT
  '07_access_decision_distribution' AS section,
  access_decision_code,
  count(*) AS count
FROM aiworker.vw_robot_brain_effective_access_v1
GROUP BY access_decision_code
ORDER BY access_decision_code;

WITH anomaly_candidates AS (
  SELECT
    'security_specialist_reads_business_or_professional' AS anomaly_code,
    count(*) AS candidate_count
  FROM aiworker.vw_robot_brain_effective_access_v1
  WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
    AND brain_domain_code IN ('business_operation','professional_basic')
    AND can_read_flag = true

  UNION ALL
  SELECT
    'friend_lover_reads_forbidden_domain',
    count(*)
  FROM aiworker.vw_robot_brain_effective_access_v1
  WHERE role_code IN ('Friend','Lover')
    AND brain_domain_code IN ('business_operation','professional_basic','security_crisis')
    AND can_read_flag = true

  UNION ALL
  SELECT
    'high_risk_readable_without_safe_purpose',
    count(*)
  FROM aiworker.vw_robot_brain_effective_access_v1
  WHERE risk_class_code IN ('high','restricted')
    AND can_read_flag = true
    AND NOT (
      effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
    )

  UNION ALL
  SELECT
    'cx_registry_source_missing',
    count(*)
  FROM cx22073jw.vw_brain_data_registry_v1
  WHERE source_exists_flag = false
)
SELECT
  '08_anomaly_candidate_summary' AS section,
  anomaly_code,
  candidate_count,
  CASE
    WHEN candidate_count = 0 THEN 'OK'
    ELSE 'REVIEW_REQUIRED'
  END AS review_status
FROM anomaly_candidates
ORDER BY anomaly_code;
