\pset format aligned
\pset null '(null)'

BEGIN;

CREATE TEMP TABLE r8z_t_collect_ready_rows (
  aicm_worker_work_unit_id uuid NOT NULL,
  result_summary_text text NOT NULL,
  handoff_link text NOT NULL,
  collection_json jsonb NOT NULL
);

\copy r8z_t_collect_ready_rows FROM '/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_s_db_source_collector_rollback_20260503_053051/050_db_source_collect_ready_rows.csv' WITH (FORMAT csv, HEADER true)

SELECT
  'input_rows' AS section,
  count(*) AS count
FROM r8z_t_collect_ready_rows;

WITH updated AS (
  UPDATE business.aicm_worker_work_unit w
  SET
    result_summary_text = c.result_summary_text,
    handoff_link = COALESCE(NULLIF(c.handoff_link, ''), w.handoff_link),
    work_status_code = CASE
      WHEN w.work_status_code IN ('todo', 'in_progress') THEN 'review_waiting'
      ELSE w.work_status_code
    END,
    review_status_code = CASE
      WHEN w.review_status_code IN ('required', 'not_required') THEN 'waiting'
      ELSE w.review_status_code
    END,
    metadata_jsonb = COALESCE(w.metadata_jsonb, '{}'::jsonb) || jsonb_build_object(
      'output_collection', 'aiworker_db_source_bundle',
      'output_collection_version', 'r8z_s',
      'output_collection_persist_version', 'r8z_t',
      'output_collection_at', now()::text,
      'output_collection_payload', c.collection_json
    ),
    updated_at = now()
  FROM r8z_t_collect_ready_rows c
  WHERE w.aicm_worker_work_unit_id = c.aicm_worker_work_unit_id
    AND w.owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
    AND w.aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
  RETURNING
    w.aicm_worker_work_unit_id,
    w.work_unit_name,
    w.work_status_code,
    w.review_status_code,
    w.result_summary_text,
    w.handoff_link,
    w.metadata_jsonb
)
SELECT
  'updated_rows' AS section,
  count(*) AS updated_count
FROM updated;

SELECT
  'updated_preview' AS section,
  w.aicm_worker_work_unit_id,
  w.work_unit_name,
  w.work_status_code,
  w.review_status_code,
  left(w.result_summary_text, 220) AS result_summary_preview,
  w.handoff_link,
  w.metadata_jsonb ->> 'output_collection_version' AS output_collection_version,
  w.metadata_jsonb ->> 'output_collection_persist_version' AS output_collection_persist_version
FROM business.aicm_worker_work_unit w
WHERE w.owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
  AND w.aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
  AND w.aicm_worker_work_unit_id IN (
    SELECT aicm_worker_work_unit_id FROM r8z_t_collect_ready_rows
  )
ORDER BY w.updated_at DESC;

COMMIT;
