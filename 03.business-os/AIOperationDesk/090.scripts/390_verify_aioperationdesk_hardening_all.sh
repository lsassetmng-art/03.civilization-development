#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/HARDENING_ROADMAP.md" \
  "$APP_ROOT/000.docs/HARDENING_ENTRY_CHECKLIST.md" \
  "$APP_ROOT/000.docs/RUNTIME_ENV_EXACT.md" \
  "$APP_ROOT/000.docs/AUTH_PERMISSION_PROVIDER_EXACT.md" \
  "$APP_ROOT/000.docs/HARDENED_RUNTIME_ENTRY.md" \
  "$APP_ROOT/000.docs/HARDENED_POST_WRITE_FLOW.md" \
  "$APP_ROOT/000.docs/HARDENED_DB_POST_WRITE_FLOW.md" \
  "$APP_ROOT/000.docs/PROVIDER_DELIVERY_RESULT_FLOW.md" \
  "$APP_ROOT/000.docs/RETENTION_CLEANUP_REPLAY_POLICY.md" \
  "$APP_ROOT/000.docs/HARDENING_RUNBOOK.md" \
  "$APP_ROOT/020.backend/lib/aiod_env.js" \
  "$APP_ROOT/020.backend/lib/aiod_auth_stub.js" \
  "$APP_ROOT/020.backend/lib/aiod_permission_stub.js" \
  "$APP_ROOT/020.backend/lib/aiod_auth_contract.js" \
  "$APP_ROOT/020.backend/lib/aiod_permission_contract.js" \
  "$APP_ROOT/020.backend/lib/aiod_request_context.js" \
  "$APP_ROOT/020.backend/lib/aiod_hardening_policy.js" \
  "$APP_ROOT/020.backend/lib/aiod_runtime_audit_stub.js" \
  "$APP_ROOT/020.backend/lib/aiod_hardening_post_write.js" \
  "$APP_ROOT/020.backend/lib/aiod_post_write_persistence_psql.js" \
  "$APP_ROOT/020.backend/lib/aiod_hardening_post_write_db.js" \
  "$APP_ROOT/020.backend/lib/aiod_notification_retry_policy.js" \
  "$APP_ROOT/020.backend/lib/aiod_provider_dispatch_journal_stub.js" \
  "$APP_ROOT/020.backend/lib/aiod_provider_result_backwrite_psql.js" \
  "$APP_ROOT/020.backend/lib/aiod_provider_result_follow_on.js" \
  "$APP_ROOT/020.backend/lib/aiod_notification_replay_candidates.js" \
  "$APP_ROOT/020.backend/lib/aiod_retention_review_psql.js" \
  "$APP_ROOT/020.backend/edge/routes/write_routes_hardened.js" \
  "$APP_ROOT/020.backend/edge/routes/route_dispatch_hardened.js" \
  "$APP_ROOT/020.backend/edge/index_hardened.ts" \
  "$APP_ROOT/040.integrations/line/README.md" \
  "$APP_ROOT/040.integrations/line/LINE_PROVIDER_CONTRACT_EXACT.md" \
  "$APP_ROOT/080.notifications/line_provider_stub.js" \
  "$APP_ROOT/080.notifications/line_provider_contract.js" \
  "$APP_ROOT/070.jobs/aiod_retention_jobs_stub.js" \
  "$APP_ROOT/070.jobs/aiod_replay_jobs_stub.js" \
  "$APP_ROOT/090.scripts/230_run_aioperationdesk_hardening_precheck.sh" \
  "$APP_ROOT/090.scripts/250_run_aioperationdesk_auth_provider_precheck.sh" \
  "$APP_ROOT/090.scripts/270_run_aioperationdesk_edge_hardened_local.sh" \
  "$APP_ROOT/090.scripts/280_test_aioperationdesk_hardened_write_guard.sh" \
  "$APP_ROOT/090.scripts/290_verify_aioperationdesk_hardening_bundle_3.sh" \
  "$APP_ROOT/090.scripts/300_run_aioperationdesk_hardened_mock_stack.sh" \
  "$APP_ROOT/090.scripts/301_stop_aioperationdesk_hardened_mock_stack.sh" \
  "$APP_ROOT/090.scripts/302_run_aioperationdesk_hardened_db_stack.sh" \
  "$APP_ROOT/090.scripts/303_stop_aioperationdesk_hardened_db_stack.sh" \
  "$APP_ROOT/090.scripts/320_test_aioperationdesk_hardened_post_write_flow.sh" \
  "$APP_ROOT/090.scripts/321_test_aioperationdesk_hardened_db_post_write_flow.sh" \
  "$APP_ROOT/090.scripts/322_query_aioperationdesk_hardened_follow_on_state.sh" \
  "$APP_ROOT/090.scripts/330_verify_aioperationdesk_hardening_bundle_4.sh" \
  "$APP_ROOT/090.scripts/340_verify_aioperationdesk_hardening_bundle_4_db.sh" \
  "$APP_ROOT/090.scripts/350_test_aioperationdesk_provider_result_follow_on.sh" \
  "$APP_ROOT/090.scripts/351_query_aioperationdesk_provider_follow_on_state.sh" \
  "$APP_ROOT/090.scripts/360_verify_aioperationdesk_hardening_bundle_6.sh" \
  "$APP_ROOT/090.scripts/370_query_aioperationdesk_retention_review_state.sh" \
  "$APP_ROOT/090.scripts/371_run_aioperationdesk_notification_replay_review.sh" \
  "$APP_ROOT/090.scripts/372_run_aioperationdesk_retention_precheck.sh" \
  "$APP_ROOT/090.scripts/380_verify_aioperationdesk_hardening_bundle_7.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
