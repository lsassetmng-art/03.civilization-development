# ============================================================
# ACCESS COMMAND PACK
# ============================================================

commands:
- ./access_status.sh
- ./access_show_latest_batch.sh
- ./access_confirm_request.sh REQUEST_CODE [STATUS] [EXECUTOR_NAME] [NOTE] [BATCH_CODE]
- ./access_reverify_confirmed.sh [BATCH_CODE] [ACTOR_NAME]
- ./access_export_current_bundle.sh

status values:
- confirmed_applied
- confirmed_skipped
- confirmed_failed

notes:
- PERSONA_DATABASE_URL must be exported
- latest batch is used by default where batch code is optional

additional_commands:
- ./access_legacy_readiness.sh
- ./access_daily_refresh.sh

daily_flow:
1. ./access_daily_refresh.sh
2. confirm requests when needed
3. ./access_reverify_confirmed.sh
4. ./access_export_current_bundle.sh

reporting_commands:
- ./access_open_blockers.sh
- ./access_make_shift_report.sh

launcher_commands:
- ./access_menu.sh
- ./access_doctor.sh

incident_commands:
- ./access_latest_artifacts.sh
- ./access_collect_incident_bundle.sh

history_commands:
- ./access_history.sh
- ./access_make_timeline_report.sh

latest_link_commands:
- ./access_refresh_latest_links.sh
- ./access_show_latest_links.sh

latest_dir:
- ../latest

batch_commands:
- ./access_list_pending_requests.sh
- ./access_bulk_confirm_all_pending.sh [STATUS] [EXECUTOR_NAME] [NOTE] [BATCH_CODE]
- ./access_bulk_apply_cycle.sh [STATUS] [EXECUTOR_NAME] [NOTE] [BATCH_CODE]

recommended_bulk_flow:
1. ./access_list_pending_requests.sh
2. ./access_bulk_apply_cycle.sh confirmed_applied

trace_commands:
- ./access_trace_request.sh REQUEST_CODE [BATCH_CODE]
- ./access_trace_logical_view.sh LOGICAL_VIEW_NAME [BATCH_CODE]

trace_bundle_commands:
- ./access_make_request_trace_bundle.sh REQUEST_CODE [BATCH_CODE]
- ./access_make_logical_view_trace_bundle.sh LOGICAL_VIEW_NAME [BATCH_CODE]

catalog_search_commands:
- ./access_catalog.sh
- ./access_find_keyword.sh KEYWORD [all|tools|docs|scripts]

recommended_find_flow:
1. ./access_catalog.sh
2. ./access_find_keyword.sh trace
3. ./access_find_keyword.sh bundle docs

workflow_preset_commands:
- ./access_run_review_flow.sh
- ./access_run_request_investigation_flow.sh REQUEST_CODE [BATCH_CODE]
- ./access_run_handoff_flow.sh

recommended_preset_flow:
1. ./access_run_review_flow.sh
2. ./access_run_request_investigation_flow.sh REQUEST_CODE
3. ./access_run_handoff_flow.sh

delta_compare_commands:
- ./access_compare_latest_runs.sh
- ./access_make_delta_report.sh

recommended_delta_flow:
1. ./access_compare_latest_runs.sh
2. ./access_make_delta_report.sh

checkpoint_commands:
- ./access_make_checkpoint.sh
- ./access_list_checkpoints.sh

recommended_checkpoint_flow:
1. ./access_make_checkpoint.sh
2. ./access_list_checkpoints.sh

checkpoint_compare_commands:
- ./access_compare_checkpoints.sh [LATEST_DIR] [PREVIOUS_DIR]
- ./access_make_checkpoint_diff_report.sh [LATEST_DIR] [PREVIOUS_DIR]

recommended_checkpoint_compare_flow:
1. ./access_list_checkpoints.sh
2. ./access_compare_checkpoints.sh
3. ./access_make_checkpoint_diff_report.sh

regression_commands:
- ./access_smoke_suite.sh
- ./access_make_regression_bundle.sh

recommended_regression_flow:
1. ./access_smoke_suite.sh
2. ./access_make_regression_bundle.sh

master_commands:
- ./access_run_master_flow.sh
- ./access_make_master_bundle.sh

recommended_master_flow:
1. ./access_run_master_flow.sh
2. ./access_make_master_bundle.sh

dashboard_onboarding_commands:
- ./access_dashboard.sh
- ./access_quickstart.sh
- ./access_validate_workspace.sh
- ./access_make_command_matrix.sh

recommended_entry_flow:
1. ./access_dashboard.sh
2. ./access_quickstart.sh
3. ./access_validate_workspace.sh
4. ./access_make_command_matrix.sh

storage_cleanup_commands:
- ./access_workspace_stats.sh
- ./access_make_storage_report.sh
- ./access_cleanup_preview.sh [AGE_DAYS]
- ./access_cleanup_empty_dirs.sh

recommended_storage_flow:
1. ./access_workspace_stats.sh
2. ./access_make_storage_report.sh
3. ./access_cleanup_preview.sh 14
4. ./access_cleanup_empty_dirs.sh

finalization_commands:
- ./access_release_readiness.sh
- ./access_make_final_handoff_bundle.sh

recommended_final_flow:
1. ./access_release_readiness.sh
2. ./access_make_final_handoff_bundle.sh

manifest_archive_commands:
- ./access_make_workspace_manifest.sh
- ./access_make_operator_handbook.sh
- ./access_archive_old_artifacts_preview.sh [AGE_DAYS]
- ./access_archive_old_artifacts_move.sh [AGE_DAYS] [dry_run|apply]

recommended_manifest_archive_flow:
1. ./access_make_workspace_manifest.sh
2. ./access_make_operator_handbook.sh
3. ./access_archive_old_artifacts_preview.sh 30
4. ./access_archive_old_artifacts_move.sh 30 dry_run

closeout_commands:
- ./access_show_end_state.sh
- ./access_run_closeout_flow.sh
- ./access_make_closeout_bundle.sh

recommended_closeout_flow:
1. ./access_show_end_state.sh
2. ./access_run_closeout_flow.sh
3. ./access_make_closeout_bundle.sh

completion_finishline_commands:
- ./access_completion_gate.sh
- ./access_make_completion_bundle.sh
- ./access_finish_line.sh

recommended_finish_line_flow:
1. ./access_completion_gate.sh
2. ./access_make_completion_bundle.sh
3. ./access_finish_line.sh
