\set ON_ERROR_STOP on

SELECT
  'cx_depth_catalog_count' AS check_name,
  count(*)::text AS value
FROM cx22073jw.brain_data_depth_catalog;

SELECT
  'cx_domain_catalog_count' AS check_name,
  count(*)::text AS value
FROM cx22073jw.brain_data_domain_catalog;

SELECT
  'cx_registry_count' AS check_name,
  count(*)::text AS value
FROM cx22073jw.brain_data_registry;

SELECT
  'cx_registry_existing_source_count' AS check_name,
  count(*)::text AS value
FROM cx22073jw.vw_brain_data_registry_v1
WHERE source_exists_flag = true;

SELECT
  model_code,
  role_code,
  count(*) AS total_brain_candidates,
  count(*) FILTER (WHERE can_read_flag = true) AS readable_count,
  count(*) FILTER (WHERE can_read_flag = false) AS denied_count
FROM aiworker.vw_robot_brain_effective_access_v1
GROUP BY model_code, role_code
ORDER BY model_code, role_code;

SELECT
  model_code,
  role_code,
  brain_domain_code,
  readable_source_count,
  existing_source_count
FROM aiworker.vw_robot_brain_compact_context_v1
ORDER BY model_code, brain_domain_code
LIMIT 80;
