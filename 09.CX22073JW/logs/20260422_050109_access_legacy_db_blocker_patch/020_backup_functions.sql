-- cx22073jw.fn_create_ai_employee_manual_apply_receipt_batch(p_batch_code text, p_actor_name text, p_note_text text)
CREATE OR REPLACE FUNCTION cx22073jw.fn_create_ai_employee_manual_apply_receipt_batch(p_batch_code text, p_actor_name text DEFAULT 'Zero'::text, p_note_text text DEFAULT 'Seeded from latest final handoff pass items awaiting manual confirmation.'::text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_batch_id uuid;
  v_source_run_code text;
  v_source_export_root_path text;
  v_item_count integer := 0;
BEGIN
  SELECT
    run_code,
    export_root_path
  INTO
    v_source_run_code,
    v_source_export_root_path
  FROM cx22073jw.v_ai_employee_final_handoff_export_latest_summary
  LIMIT 1;

  IF COALESCE(v_source_run_code, '') = '' THEN
    RAISE EXCEPTION 'latest final handoff export summary not found';
  END IF;

  INSERT INTO cx22073jw.ai_employee_manual_apply_receipt_batch (
    batch_code,
    source_handoff_run_code,
    source_export_root_path,
    batch_status,
    actor_name,
    note_text
  )
  VALUES (
    p_batch_code,
    v_source_run_code,
    v_source_export_root_path,
    'running',
    p_actor_name,
    p_note_text
  )
  RETURNING manual_apply_receipt_batch_id INTO v_batch_id;

  INSERT INTO cx22073jw.ai_employee_manual_apply_receipt_item (
    manual_apply_receipt_batch_id,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    expected_db_role_name,
    receipt_status,
    manual_executor_name,
    manual_apply_note
  )
  SELECT
    v_batch_id,
    i.request_code,
    i.target_domain_code,
    i.target_role_code,
    i.actual_view_code,
    i.logical_view_name,
    i.expected_db_role_name,
    'pending_confirmation',
    NULL,
    'Awaiting manual apply confirmation.'
  FROM cx22073jw.v_ai_employee_final_handoff_export_latest_items i
  WHERE i.handoff_bucket = 'pass_item';

  GET DIAGNOSTICS v_item_count = ROW_COUNT;

  UPDATE cx22073jw.ai_employee_manual_apply_receipt_batch
     SET requested_item_count = v_item_count,
         seeded_item_count    = v_item_count,
         batch_status         = CASE
                                  WHEN v_item_count > 0 THEN 'pass'
                                  ELSE 'error'
                                END,
         ended_at             = NOW(),
         updated_at           = NOW()
   WHERE manual_apply_receipt_batch_id = v_batch_id;

  RETURN v_batch_id;
END;
$function$


