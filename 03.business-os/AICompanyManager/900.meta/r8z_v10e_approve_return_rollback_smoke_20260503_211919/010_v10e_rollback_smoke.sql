\set ON_ERROR_STOP on
\pset pager off
\pset format unaligned
\pset fieldsep '\t'
\pset tuples_only on

BEGIN;

CREATE TEMP TABLE _v10e_result (
  seq bigserial,
  k text,
  v text
) ON COMMIT DROP;

INSERT INTO _v10e_result(k, v)
SELECT 'DB_VIEW_WAIT_DISPLAY_COUNT_BEFORE', count(*)::text
FROM business.vw_aicm_human_review_wait_display v
WHERE v.owner_civilization_id::text = '00000000-0000-4000-8000-000000000001'
  AND v.aicm_user_company_id::text = '8b9be487-7b74-4517-9b59-6c84a82ae6aa';

INSERT INTO _v10e_result(k, v)
SELECT 'DB_HUMAN_REVIEW_PENDING_COUNT_BEFORE', count(*)::text
FROM business.aicm_human_review_item h
WHERE h.owner_civilization_id::text = '00000000-0000-4000-8000-000000000001'
  AND h.aicm_user_company_id::text = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'
  AND h.human_review_status_code = 'pending';

INSERT INTO _v10e_result(k, v)
SELECT 'EXISTING_STATUS_CODES', COALESCE(string_agg(DISTINCT h.human_review_status_code, ',' ORDER BY h.human_review_status_code), '')
FROM business.aicm_human_review_item h
WHERE h.owner_civilization_id::text = '00000000-0000-4000-8000-000000000001'
  AND h.aicm_user_company_id::text = '8b9be487-7b74-4517-9b59-6c84a82ae6aa';

INSERT INTO _v10e_result(k, v)
SELECT 'CHECK_CONSTRAINTS', COALESCE(string_agg(pg_get_constraintdef(c.oid), ' || ' ORDER BY c.conname), '')
FROM pg_constraint c
WHERE c.conrelid = 'business.aicm_human_review_item'::regclass
  AND pg_get_constraintdef(c.oid) ILIKE '%human_review_status_code%';

DO $$
DECLARE
  target_id text;
  before_status text;
  code text;
  updated_count integer;
  visible_count integer;
  approve_first_ok text := '';
  return_first_ok text := '';
BEGIN
  SELECT v.aicm_human_review_item_id::text
    INTO target_id
  FROM business.vw_aicm_human_review_wait_display v
  WHERE v.owner_civilization_id::text = '00000000-0000-4000-8000-000000000001'
    AND v.aicm_user_company_id::text = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'
  ORDER BY v.requested_at DESC NULLS LAST, v.created_at DESC NULLS LAST
  LIMIT 1;

  INSERT INTO _v10e_result(k, v) VALUES ('TARGET_REVIEW_ID', COALESCE(target_id, ''));

  IF target_id IS NULL OR target_id = '' THEN
    INSERT INTO _v10e_result(k, v) VALUES ('ROLLBACK_SMOKE_ERROR', 'NO_TARGET_REVIEW_ID');
    RETURN;
  END IF;

  SELECT h.human_review_status_code
    INTO before_status
  FROM business.aicm_human_review_item h
  WHERE h.aicm_human_review_item_id::text = target_id
  FOR UPDATE;

  INSERT INTO _v10e_result(k, v) VALUES ('BEFORE_STATUS', COALESCE(before_status, ''));

  -- 承認候補。先頭から試し、成功した最初のcodeを採用候補にする。
  FOREACH code IN ARRAY ARRAY['approved','approve','accepted','completed'] LOOP
    BEGIN
      UPDATE business.aicm_human_review_item
         SET human_review_status_code = code
       WHERE aicm_human_review_item_id::text = target_id;

      GET DIAGNOSTICS updated_count = ROW_COUNT;

      SELECT count(*) INTO visible_count
      FROM business.vw_aicm_human_review_wait_display v
      WHERE v.aicm_human_review_item_id::text = target_id;

      INSERT INTO _v10e_result(k, v)
      VALUES ('APPROVE_TRY_' || code, 'updated=' || updated_count::text || ',visible_after=' || visible_count::text);

      IF approve_first_ok = '' AND updated_count = 1 THEN
        approve_first_ok := code;
      END IF;

      UPDATE business.aicm_human_review_item
         SET human_review_status_code = before_status
       WHERE aicm_human_review_item_id::text = target_id;

    EXCEPTION WHEN OTHERS THEN
      INSERT INTO _v10e_result(k, v)
      VALUES ('APPROVE_TRY_' || code || '_ERROR', SQLERRM);

      BEGIN
        UPDATE business.aicm_human_review_item
           SET human_review_status_code = before_status
         WHERE aicm_human_review_item_id::text = target_id;
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO _v10e_result(k, v)
        VALUES ('APPROVE_RESET_ERROR', SQLERRM);
      END;
    END;
  END LOOP;

  INSERT INTO _v10e_result(k, v)
  VALUES ('APPROVE_FIRST_OK', COALESCE(NULLIF(approve_first_ok, ''), 'NONE'));

  -- 差し戻し候補。先頭から試し、成功した最初のcodeを採用候補にする。
  FOREACH code IN ARRAY ARRAY['returned','return_requested','needs_revision','rejected','sent_back'] LOOP
    BEGIN
      UPDATE business.aicm_human_review_item
         SET human_review_status_code = code
       WHERE aicm_human_review_item_id::text = target_id;

      GET DIAGNOSTICS updated_count = ROW_COUNT;

      SELECT count(*) INTO visible_count
      FROM business.vw_aicm_human_review_wait_display v
      WHERE v.aicm_human_review_item_id::text = target_id;

      INSERT INTO _v10e_result(k, v)
      VALUES ('RETURN_TRY_' || code, 'updated=' || updated_count::text || ',visible_after=' || visible_count::text);

      IF return_first_ok = '' AND updated_count = 1 THEN
        return_first_ok := code;
      END IF;

      UPDATE business.aicm_human_review_item
         SET human_review_status_code = before_status
       WHERE aicm_human_review_item_id::text = target_id;

    EXCEPTION WHEN OTHERS THEN
      INSERT INTO _v10e_result(k, v)
      VALUES ('RETURN_TRY_' || code || '_ERROR', SQLERRM);

      BEGIN
        UPDATE business.aicm_human_review_item
           SET human_review_status_code = before_status
         WHERE aicm_human_review_item_id::text = target_id;
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO _v10e_result(k, v)
        VALUES ('RETURN_RESET_ERROR', SQLERRM);
      END;
    END;
  END LOOP;

  INSERT INTO _v10e_result(k, v)
  VALUES ('RETURN_FIRST_OK', COALESCE(NULLIF(return_first_ok, ''), 'NONE'));

  INSERT INTO _v10e_result(k, v)
  SELECT 'INSIDE_STATUS_AFTER_RESET', COALESCE(h.human_review_status_code, '')
  FROM business.aicm_human_review_item h
  WHERE h.aicm_human_review_item_id::text = target_id;

  INSERT INTO _v10e_result(k, v)
  SELECT 'INSIDE_VIEW_WAIT_COUNT_AFTER_RESET', count(*)::text
  FROM business.vw_aicm_human_review_wait_display v
  WHERE v.owner_civilization_id::text = '00000000-0000-4000-8000-000000000001'
    AND v.aicm_user_company_id::text = '8b9be487-7b74-4517-9b59-6c84a82ae6aa';
END
$$;

SELECT k, v
FROM _v10e_result
ORDER BY seq;

ROLLBACK;
