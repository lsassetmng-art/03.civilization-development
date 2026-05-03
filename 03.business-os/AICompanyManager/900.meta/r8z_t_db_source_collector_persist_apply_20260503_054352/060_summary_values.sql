\pset format unaligned
\pset tuples_only on

WITH vals AS (
  SELECT
    (SELECT count(*)
     FROM business.aicm_worker_work_unit
     WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
       AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
       AND metadata_jsonb ->> 'output_collection_version' = 'r8z_s'
       AND metadata_jsonb ->> 'output_collection_persist_version' = 'r8z_t') AS output_collection_mark_count,
    (SELECT count(*)
     FROM business.aicm_worker_work_unit
     WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
       AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
       AND work_status_code = 'review_waiting'
       AND review_status_code = 'waiting'
       AND metadata_jsonb ->> 'output_collection_persist_version' = 'r8z_t') AS review_waiting_count,
    (SELECT count(*)
     FROM business.aicm_worker_work_unit
     WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid
       AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid
       AND COALESCE(result_summary_text, '') <> ''
       AND metadata_jsonb ->> 'output_collection_persist_version' = 'r8z_t') AS result_summary_filled_count
)
SELECT
  'OUTPUT_COLLECTION_MARK_COUNT=' || output_collection_mark_count || E'\n' ||
  'REVIEW_WAITING_COUNT=' || review_waiting_count || E'\n' ||
  'RESULT_SUMMARY_FILLED_COUNT=' || result_summary_filled_count || E'\n' ||
  'FINAL_JUDGEMENT=' ||
    CASE
      WHEN output_collection_mark_count >= 2
       AND review_waiting_count >= 2
       AND result_summary_filled_count >= 2
      THEN 'PERSISTENT_APPLY_CONFIRMED'
      ELSE 'PERSISTENT_APPLY_NEEDS_REVIEW'
    END
FROM vals;
