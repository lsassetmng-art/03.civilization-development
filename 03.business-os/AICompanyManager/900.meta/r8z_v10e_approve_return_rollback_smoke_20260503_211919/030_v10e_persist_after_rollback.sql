\set ON_ERROR_STOP on
\pset pager off
\pset format unaligned
\pset fieldsep '\t'
\pset tuples_only on

BEGIN READ ONLY;

SELECT
  'PERSIST_DB_VIEW_WAIT_DISPLAY_COUNT',
  count(*)::text
FROM business.vw_aicm_human_review_wait_display v
WHERE v.owner_civilization_id::text = '00000000-0000-4000-8000-000000000001'
  AND v.aicm_user_company_id::text = '8b9be487-7b74-4517-9b59-6c84a82ae6aa';

SELECT
  'PERSIST_DB_HUMAN_REVIEW_PENDING_COUNT',
  count(*)::text
FROM business.aicm_human_review_item h
WHERE h.owner_civilization_id::text = '00000000-0000-4000-8000-000000000001'
  AND h.aicm_user_company_id::text = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'
  AND h.human_review_status_code = 'pending';

SELECT
  'PERSIST_TARGET_STATUS',
  COALESCE(h.human_review_status_code, '')
FROM business.aicm_human_review_item h
WHERE h.aicm_human_review_item_id::text = 'bc553839-ebca-4610-81e3-31dc21476a48'
LIMIT 1;

ROLLBACK;
