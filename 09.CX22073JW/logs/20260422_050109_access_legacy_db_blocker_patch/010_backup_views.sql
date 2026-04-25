-- cx22073jw.v_access_activation_request_compiled_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_activation_request_compiled_summary AS  SELECT request_code,
    target_domain_code,
    target_role_code,
    requested_rank_code,
    requested_app_scope,
    request_status,
    requested_by,
    total_decision_count,
    allowed_upper_bound_count,
    requires_gate_count,
    requires_scope_count,
    requires_rank_count,
    rejected_count,
    note_text,
    created_at
   FROM v_ai_employee_activation_request_compiled_summary;;

-- cx22073jw.v_access_activation_request_intersection_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_activation_request_intersection_summary AS  SELECT request_code,
    target_domain_code,
    target_role_code,
    requested_rank_code,
    requested_app_scope,
    request_status,
    total_decision_count,
    allowed_upper_bound_count,
    requires_gate_count,
    requires_scope_count,
    requires_rank_count,
    rejected_count,
    note_text,
    created_at
   FROM v_ai_employee_activation_request_intersection_summary;;

-- cx22073jw.v_access_activation_request_latest_decisions
CREATE OR REPLACE VIEW cx22073jw.v_access_activation_request_latest_decisions AS  SELECT request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    bundle_inclusion_mode,
    gate_needed,
    decision_status,
    decision_note,
    created_at
   FROM v_ai_employee_activation_request_latest_decisions;;

-- cx22073jw.v_access_activation_request_latest_intersection_decisions
CREATE OR REPLACE VIEW cx22073jw.v_access_activation_request_latest_intersection_decisions AS  SELECT request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    bundle_inclusion_mode,
    gate_needed,
    decision_status,
    decision_note,
    created_at
   FROM v_ai_employee_activation_request_latest_intersection_decisions;;

-- cx22073jw.v_access_activation_request_latest_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_activation_request_latest_summary AS  SELECT request_code,
    target_domain_code,
    target_role_code,
    requested_rank_code,
    requested_app_scope,
    request_status,
    requested_by,
    reviewer_name,
    approver_name,
    note_text,
    created_at
   FROM v_ai_employee_activation_request_latest_summary;;

-- cx22073jw.v_access_activation_review_decision_latest_batch_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_activation_review_decision_latest_batch_summary AS  SELECT batch_code,
    source_export_run_code,
    source_export_root_path,
    request_count,
    item_count,
    approved_candidate_count,
    gate_hold_count,
    scope_hold_count,
    rank_hold_count,
    rejected_hold_count,
    batch_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_activation_review_decision_latest_batch_summary;;

-- cx22073jw.v_access_activation_review_decision_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_activation_review_decision_latest_items AS  SELECT batch_code,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    source_decision_status,
    source_action_hint,
    review_bucket,
    human_review_status,
    governed_apply_ready,
    review_note,
    created_at
   FROM v_ai_employee_activation_review_decision_latest_items;;

-- cx22073jw.v_access_activation_review_export_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_activation_review_export_latest_items AS  SELECT run_code,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    decision_status,
    gate_needed,
    decision_action_hint
   FROM v_ai_employee_activation_review_export_latest_items;;

-- cx22073jw.v_access_activation_review_export_latest_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_activation_review_export_latest_summary AS  SELECT run_code,
    export_root_path,
    request_count,
    decision_count,
    allowed_count,
    gate_count,
    scope_count,
    rank_count,
    rejected_count,
    run_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_activation_review_export_latest_summary;;

-- cx22073jw.v_access_actual_view_family_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_actual_view_family_summary AS  SELECT domain_code,
    view_family_code,
    family_name,
    sensitivity_code,
    actual_view_count
   FROM v_ai_employee_actual_view_family_summary;;

-- cx22073jw.v_access_actual_view_registry_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_actual_view_registry_summary AS  SELECT domain_code,
    view_family_code,
    actual_view_code,
    logical_view_name,
    sensitivity_code,
    exposure_scope,
    lifecycle_status,
    gate_required,
    grantable_readonly
   FROM v_ai_employee_actual_view_registry_summary;;

-- cx22073jw.v_access_app_scope_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_app_scope_summary AS  SELECT app_scope_code,
    domain_code,
    scope_name,
    scope_group,
    provisional_flag,
    allowlisted_view_count
   FROM v_ai_employee_app_scope_summary;;

-- cx22073jw.v_access_db_role_provision_latest_batch_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_db_role_provision_latest_batch_summary AS  SELECT batch_code,
    requested_role_count,
    created_role_count,
    existing_role_count,
    failed_role_count,
    batch_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_db_role_provision_latest_batch_summary;;

-- cx22073jw.v_access_db_role_provision_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_db_role_provision_latest_items AS  SELECT batch_code,
    role_code,
    domain_code,
    expected_db_role_name,
    provision_status,
    error_text,
    created_at
   FROM v_ai_employee_db_role_provision_latest_items;;

-- cx22073jw.v_access_db_role_registry_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_db_role_registry_summary AS  SELECT role_code,
    domain_code,
    expected_db_role_name,
    role_status,
    role_exists_flag,
    login_allowed,
    inherit_flag,
    superuser_flag,
    createrole_flag,
    createdb_flag,
    replication_flag,
    bypassrls_flag
   FROM v_ai_employee_db_role_registry_summary;;

-- cx22073jw.v_access_domain_bootstrap_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_domain_bootstrap_summary AS  SELECT domain_code,
    domain_name,
    role_count,
    view_family_count,
    policy_count
   FROM v_ai_employee_domain_bootstrap_summary;;

-- cx22073jw.v_access_final_handoff_export_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_final_handoff_export_latest_items AS  SELECT run_code,
    source_execution_run_code,
    source_batch_code,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    expected_db_role_name,
    preflight_status,
    execution_status,
    handoff_bucket,
    prepared_sql_text,
    result_note,
    created_at
   FROM v_ai_employee_final_handoff_export_latest_items;;

-- cx22073jw.v_access_final_handoff_export_latest_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_final_handoff_export_latest_summary AS  SELECT run_code,
    source_execution_run_code,
    source_batch_code,
    export_root_path,
    requested_item_count,
    pass_item_count,
    fail_item_count,
    skipped_item_count,
    run_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_final_handoff_export_latest_summary;;

-- cx22073jw.v_access_gate_controlled_actual_views
CREATE OR REPLACE VIEW cx22073jw.v_access_gate_controlled_actual_views AS  SELECT domain_code,
    view_family_code,
    actual_view_code,
    logical_view_name,
    sensitivity_code,
    exposure_scope,
    gate_required,
    notes
   FROM v_ai_employee_gate_controlled_actual_views;;

-- cx22073jw.v_access_governed_apply_attempt_latest_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_attempt_latest_summary AS  SELECT batch_code,
    attempt_code,
    attempt_status,
    executor_name,
    note_text,
    created_at
   FROM v_ai_employee_governed_apply_attempt_latest_summary;;

-- cx22073jw.v_access_governed_apply_batch_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_batch_latest_items AS  SELECT batch_code,
    source_queue_batch_code,
    queue_code,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    gate_check_required,
    runtime_apply_ready,
    apply_status,
    prepared_sql_text,
    note_text,
    created_at
   FROM v_ai_employee_governed_apply_batch_latest_items;;

-- cx22073jw.v_access_governed_apply_batch_latest_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_batch_latest_summary AS  SELECT batch_code,
    source_queue_batch_code,
    item_count,
    prepared_count,
    waiting_runtime_count,
    skipped_gate_count,
    batch_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_governed_apply_batch_latest_summary;;

-- cx22073jw.v_access_governed_apply_execution_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_execution_latest_items AS  SELECT run_code,
    batch_code,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    expected_db_role_name,
    apply_status_before,
    runtime_apply_ready,
    gate_check_required,
    role_exists_flag,
    view_exists_flag,
    sql_present_flag,
    preflight_status,
    execution_status,
    prepared_sql_text,
    result_note,
    created_at
   FROM v_ai_employee_governed_apply_execution_latest_items;;

-- cx22073jw.v_access_governed_apply_execution_latest_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_execution_latest_summary AS  SELECT run_code,
    source_batch_code,
    dry_run_flag,
    requested_item_count,
    preflight_pass_count,
    preflight_fail_count,
    skipped_count,
    run_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_governed_apply_execution_latest_summary;;

-- cx22073jw.v_access_governed_apply_queue_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_queue_latest_items AS  SELECT source_batch_code,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    queue_status,
    gate_check_required,
    runtime_apply_ready,
    note_text,
    created_at
   FROM v_ai_employee_governed_apply_queue_latest_items;;

-- cx22073jw.v_access_governed_apply_queue_latest_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_queue_latest_summary AS  SELECT source_batch_code,
    queue_item_count,
    queued_count,
    prepared_count,
    applied_count,
    skipped_count,
    cancelled_count,
    first_created_at,
    last_created_at
   FROM v_ai_employee_governed_apply_queue_latest_summary;;

-- cx22073jw.v_access_grant_export_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_grant_export_latest_items AS  SELECT run_code,
    domain_code,
    role_code,
    actual_view_code,
    logical_view_name,
    suggested_db_role_name,
    grant_mode,
    gate_needed,
    role_sql_file_path,
    domain_sql_file_path
   FROM v_ai_employee_grant_export_latest_items;;

-- cx22073jw.v_access_grant_export_latest_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_grant_export_latest_summary AS  SELECT run_code,
    export_root_path,
    total_role_count,
    total_domain_count,
    total_actual_view_grant_count,
    total_sql_file_count,
    run_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_grant_export_latest_summary;;

-- cx22073jw.v_access_human_review_latest_action_log
CREATE OR REPLACE VIEW cx22073jw.v_access_human_review_latest_action_log AS  SELECT batch_code,
    request_code,
    actual_view_code,
    logical_view_name,
    previous_human_review_status,
    new_human_review_status,
    reviewer_name,
    review_note,
    created_at
   FROM v_ai_employee_human_review_latest_action_log;;

-- cx22073jw.v_access_manual_apply_receipt_latest_batch_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_manual_apply_receipt_latest_batch_summary AS  SELECT batch_code,
    source_handoff_run_code,
    source_export_root_path,
    requested_item_count,
    seeded_item_count,
    batch_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_manual_apply_receipt_latest_batch_summary;;

-- cx22073jw.v_access_manual_apply_receipt_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_manual_apply_receipt_latest_items AS  SELECT batch_code,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    expected_db_role_name,
    receipt_status,
    manual_executor_name,
    manual_apply_note,
    created_at
   FROM v_ai_employee_manual_apply_receipt_latest_items;;

-- cx22073jw.v_access_post_apply_verification_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_post_apply_verification_latest_items AS  SELECT run_code,
    source_receipt_batch_code,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    expected_db_role_name,
    role_exists_flag,
    view_exists_flag,
    select_grant_present_flag,
    verification_status,
    result_note,
    created_at
   FROM v_ai_employee_post_apply_verification_latest_items;;

-- cx22073jw.v_access_post_apply_verification_latest_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_post_apply_verification_latest_summary AS  SELECT run_code,
    source_receipt_batch_code,
    requested_item_count,
    verified_applied_count,
    not_yet_applied_count,
    precheck_fail_count,
    run_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_post_apply_verification_latest_summary;;

-- cx22073jw.v_access_privileged_family_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_privileged_family_summary AS  SELECT domain_code,
    view_family_code,
    family_name,
    sensitivity_code,
    access_boundary_note
   FROM v_ai_employee_privileged_family_summary;;

-- cx22073jw.v_access_rank_registry_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_rank_registry_summary AS  SELECT rank_code,
    rank_name,
    provisional_flag,
    allow_public,
    allow_masked,
    allow_support,
    allow_operational,
    allow_audit,
    allow_safety,
    allow_privileged,
    allow_restricted,
    description
   FROM v_ai_employee_rank_registry_summary;;

-- cx22073jw.v_access_role_access_bundle_item_matrix
CREATE OR REPLACE VIEW cx22073jw.v_access_role_access_bundle_item_matrix AS  SELECT bundle_code,
    domain_code,
    role_code,
    actual_view_code,
    logical_view_name,
    view_family_code,
    grant_mode,
    gate_needed,
    audit_obligation,
    sort_order
   FROM v_ai_employee_role_access_bundle_item_matrix;;

-- cx22073jw.v_access_role_access_bundle_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_role_access_bundle_summary AS  SELECT bundle_code,
    domain_code,
    role_code,
    bundle_status,
    gate_needed_view_count,
    non_gate_view_count,
    total_view_count,
    note_text,
    created_at
   FROM v_ai_employee_role_access_bundle_summary;;

-- cx22073jw.v_access_role_actual_view_grant_matrix
CREATE OR REPLACE VIEW cx22073jw.v_access_role_actual_view_grant_matrix AS  SELECT domain_code,
    role_code,
    role_name,
    actual_view_code,
    logical_view_name,
    view_family_code,
    grant_mode,
    gate_needed,
    audit_obligation,
    notes
   FROM v_ai_employee_role_actual_view_grant_matrix;;

-- cx22073jw.v_access_role_policy_matrix
CREATE OR REPLACE VIEW cx22073jw.v_access_role_policy_matrix AS  SELECT domain_code,
    role_code,
    role_name,
    view_family_code,
    family_name,
    access_mode,
    scope_note,
    sensitivity_code
   FROM v_ai_employee_role_policy_matrix;;

-- cx22073jw.v_access_runtime_ready_promotion_latest_batch_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_runtime_ready_promotion_latest_batch_summary AS  SELECT batch_code,
    source_queue_batch_code,
    target_request_code,
    promoted_count,
    skipped_gate_count,
    unchanged_count,
    batch_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_runtime_ready_promotion_latest_batch_summary;;

-- cx22073jw.v_access_runtime_ready_promotion_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_runtime_ready_promotion_latest_items AS  SELECT batch_code,
    queue_code,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    previous_runtime_apply_ready,
    new_runtime_apply_ready,
    gate_check_required,
    action_status,
    note_text,
    created_at
   FROM v_ai_employee_runtime_ready_promotion_latest_items;;

-- cx22073jw.v_access_stub_smoke_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_stub_smoke_latest_items AS  SELECT run_code,
    actual_view_code,
    logical_view_name,
    domain_code,
    view_family_code,
    smoke_status,
    column_count,
    row_count,
    error_text,
    created_at
   FROM v_ai_employee_stub_smoke_latest_items;;

-- cx22073jw.v_access_stub_smoke_latest_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_stub_smoke_latest_summary AS  SELECT run_code,
    requested_view_count,
    passed_view_count,
    failed_view_count,
    missing_view_count,
    run_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_stub_smoke_latest_summary;;

-- cx22073jw.v_access_stub_view_generation_latest_items
CREATE OR REPLACE VIEW cx22073jw.v_access_stub_view_generation_latest_items AS  SELECT run_code,
    actual_view_code,
    logical_view_name,
    domain_code,
    view_family_code,
    generation_status,
    error_text,
    created_at
   FROM v_ai_employee_stub_view_generation_latest_items;;

-- cx22073jw.v_access_stub_view_generation_latest_summary
CREATE OR REPLACE VIEW cx22073jw.v_access_stub_view_generation_latest_summary AS  SELECT run_code,
    requested_view_count,
    created_view_count,
    existing_view_count,
    error_view_count,
    run_status,
    note_text,
    created_at,
    ended_at
   FROM v_ai_employee_stub_view_generation_latest_summary;;

-- cx22073jw.v_access_stub_view_missing
CREATE OR REPLACE VIEW cx22073jw.v_access_stub_view_missing AS  SELECT domain_code,
    view_family_code,
    actual_view_code,
    logical_view_name,
    sensitivity_code,
    exposure_scope,
    gate_required,
    stub_view_exists
   FROM v_ai_employee_stub_view_missing;;

-- cx22073jw.v_access_stub_view_runtime_catalog
CREATE OR REPLACE VIEW cx22073jw.v_access_stub_view_runtime_catalog AS  SELECT domain_code,
    view_family_code,
    actual_view_code,
    logical_view_name,
    sensitivity_code,
    exposure_scope,
    gate_required,
    stub_view_exists
   FROM v_ai_employee_stub_view_runtime_catalog;;

