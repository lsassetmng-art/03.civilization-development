#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/README.md" \
  "$APP_ROOT/000.docs/IMPLEMENTATION_SOURCE_MAP.md" \
  "$APP_ROOT/000.docs/LOCAL_RUNBOOK.md" \
  "$APP_ROOT/010.database/010010_apply_aioperationdesk_ddl.sh" \
  "$APP_ROOT/010.database/010020_apply_aioperationdesk_seed.sh" \
  "$APP_ROOT/010.database/010030_verify_aioperationdesk_db.sh" \
  "$APP_ROOT/020.backend/lib/aiod_manifest.json" \
  "$APP_ROOT/020.backend/lib/aiod_constants.js" \
  "$APP_ROOT/020.backend/lib/aiod_response.js" \
  "$APP_ROOT/020.backend/lib/aiod_mock_store.js" \
  "$APP_ROOT/020.backend/lib/aiod_sql_catalog.js" \
  "$APP_ROOT/020.backend/lib/aiod_db_gateway_stub.js" \
  "$APP_ROOT/020.backend/lib/aiod_db_gateway_psql.js" \
  "$APP_ROOT/020.backend/lib/aiod_db_gateway.js" \
  "$APP_ROOT/020.backend/lib/aiod_write_gateway_psql.js" \
  "$APP_ROOT/020.backend/lib/aiod_write_gateway.js" \
  "$APP_ROOT/020.backend/lib/aiod_request_gateway_psql.js" \
  "$APP_ROOT/020.backend/lib/aiod_request_gateway.js" \
  "$APP_ROOT/020.backend/edge/index.ts" \
  "$APP_ROOT/020.backend/edge/aiod_handlers_stub.js" \
  "$APP_ROOT/020.backend/edge/aiod_http_response.js" \
  "$APP_ROOT/020.backend/edge/aiod_router_stub.js" \
  "$APP_ROOT/020.backend/edge/README.md" \
  "$APP_ROOT/020.backend/edge/README_RUNTIME.md" \
  "$APP_ROOT/020.backend/edge/routes/health_route.js" \
  "$APP_ROOT/020.backend/edge/routes/read_routes.js" \
  "$APP_ROOT/020.backend/edge/routes/write_routes.js" \
  "$APP_ROOT/020.backend/edge/routes/route_dispatch.js" \
  "$APP_ROOT/030.frontend/web/index.html" \
  "$APP_ROOT/030.frontend/web/dev_server.ts" \
  "$APP_ROOT/030.frontend/web/assets/aiod.css" \
  "$APP_ROOT/030.frontend/web/assets/aiod.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_api_client.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_console.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_console_live.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_resident.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_resident_live.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_render.js" \
  "$APP_ROOT/030.frontend/web/console/main_console.html" \
  "$APP_ROOT/030.frontend/web/console/dashboard_live.js" \
  "$APP_ROOT/030.frontend/web/console/queue_board.html" \
  "$APP_ROOT/030.frontend/web/console/queue_board_live.js" \
  "$APP_ROOT/030.frontend/web/console/review_inbox.html" \
  "$APP_ROOT/030.frontend/web/console/review_inbox_live.js" \
  "$APP_ROOT/030.frontend/web/console/approval_inbox.html" \
  "$APP_ROOT/030.frontend/web/console/approval_inbox_live.js" \
  "$APP_ROOT/030.frontend/web/console/failure_retry_center.html" \
  "$APP_ROOT/030.frontend/web/console/failure_retry_center_live.js" \
  "$APP_ROOT/030.frontend/web/console/summary_center.html" \
  "$APP_ROOT/030.frontend/web/console/summary_center_live.js" \
  "$APP_ROOT/030.frontend/web/console/registry_manager.html" \
  "$APP_ROOT/030.frontend/web/console/notification_settings.html" \
  "$APP_ROOT/030.frontend/web/console/resident_surface_monitor.html" \
  "$APP_ROOT/030.frontend/web/resident/erp_resident.html" \
  "$APP_ROOT/030.frontend/web/resident/erp_resident_live.js" \
  "$APP_ROOT/030.frontend/web/resident/erp_quick_panel.html" \
  "$APP_ROOT/030.frontend/web/resident/builder_resident.html" \
  "$APP_ROOT/030.frontend/web/resident/builder_resident_live.js" \
  "$APP_ROOT/030.frontend/web/resident/builder_quick_panel.html" \
  "$APP_ROOT/070.jobs/README.md" \
  "$APP_ROOT/070.jobs/aiod_jobs_stub.js" \
  "$APP_ROOT/080.notifications/README.md" \
  "$APP_ROOT/090.scripts/010_run_aioperationdesk_db_bootstrap.sh" \
  "$APP_ROOT/090.scripts/020_run_aioperationdesk_design_verification_from_dev.sh" \
  "$APP_ROOT/090.scripts/030_verify_aioperationdesk_impl_stub_bundle.sh" \
  "$APP_ROOT/090.scripts/040_verify_aioperationdesk_impl_stub_bundle_2.sh" \
  "$APP_ROOT/090.scripts/050_run_aioperationdesk_edge_stub_local.sh" \
  "$APP_ROOT/090.scripts/055_run_aioperationdesk_edge_db_mode.sh" \
  "$APP_ROOT/090.scripts/060_test_aioperationdesk_edge_stub_routes.sh" \
  "$APP_ROOT/090.scripts/065_test_aioperationdesk_edge_db_read_routes.sh" \
  "$APP_ROOT/090.scripts/070_verify_aioperationdesk_impl_stub_bundle_3.sh" \
  "$APP_ROOT/090.scripts/075_test_aioperationdesk_edge_db_write_routes.sh" \
  "$APP_ROOT/090.scripts/076_query_aioperationdesk_db_recent_write_state.sh" \
  "$APP_ROOT/090.scripts/077_test_aioperationdesk_edge_db_write_routes_remaining.sh" \
  "$APP_ROOT/090.scripts/078_query_aioperationdesk_db_recent_request_state.sh" \
  "$APP_ROOT/090.scripts/080_run_aioperationdesk_web_preview.sh" \
  "$APP_ROOT/090.scripts/090_verify_aioperationdesk_impl_stub_bundle_4.sh" \
  "$APP_ROOT/090.scripts/095_verify_aioperationdesk_impl_stub_bundle_5.sh" \
  "$APP_ROOT/090.scripts/096_verify_aioperationdesk_impl_stub_bundle_6.sh" \
  "$APP_ROOT/090.scripts/097_verify_aioperationdesk_impl_stub_bundle_7.sh" \
  "$APP_ROOT/090.scripts/100_run_aioperationdesk_local_mock_stack.sh" \
  "$APP_ROOT/090.scripts/110_run_aioperationdesk_local_db_stack.sh" \
  "$APP_ROOT/090.scripts/120_stop_aioperationdesk_local_stack.sh" \
  "$APP_ROOT/090.scripts/130_smoke_test_aioperationdesk_local_stack.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
