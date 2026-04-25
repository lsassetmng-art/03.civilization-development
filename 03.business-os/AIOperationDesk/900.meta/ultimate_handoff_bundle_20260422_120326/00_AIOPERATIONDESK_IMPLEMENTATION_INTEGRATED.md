# ============================================================
# AI OPERATION DESK IMPLEMENTATION INTEGRATED
# ============================================================

status: implementation-stub-integrated
app: AIOperationDesk
category: 03.business-app
owner: Boss
prepared_by: Zero

purpose:
Summarize the current implementation-side integrated state of
AI Operation Desk under ~/03.civilization-development/03.business-os/AIOperationDesk.

current_position:
- design-side implementation-ready freeze candidate is already prepared
- implementation-side folder skeleton is created
- database bootstrap runners are created
- frontend stub surfaces are created
- edge stub runtime is created
- mock and db_psql local run modes are created
- local stack start / stop / smoke test runners are created

implementation_identity:
- governed operational hub
- free only
- text + voice intake capable at design / stub level
- resident support targets:
  - ERP
  - Builder families across OS domains
- nonresident help mode for other supported apps
- batch summary on AIOperationDesk side
- realtime summary / response on PocketSecretary side

db_scope:
- schema: business
- current business tables prefixed with aiod_
- exact DDL file copied into implementation root
- seed SQL copied into implementation root

runtime_modes:
- mock
- db_psql

current_db_backed_scope:
- read routes:
  - supported-apps
  - queue
  - review-inbox
  - approval-inbox
  - failures
  - summary-batches
- write routes:
  - requests
  - erp provisional voucher
  - execution-requests
  - reviews/decide
  - approvals/decide
  - retries/schedule
  - notification-rules

remaining_stub_or_partial_areas:
- supported-app-specific explain remains stub-routed
- frontend still uses lightweight stub html/js structure
- runtime host is local Deno-serve style, not production packaging
- full authenticated user / permission wiring is not yet added
- production notification bridge delivery is not yet finalized

major_folders:
- 000.docs
- 010.database
- 020.backend
- 030.frontend
- 040.integrations
- 050.resident-surfaces
- 060.console
- 070.jobs
- 080.notifications
- 090.scripts
- 900.meta

important_scripts:
- 010.database/010010_apply_aioperationdesk_ddl.sh
- 010.database/010020_apply_aioperationdesk_seed.sh
- 010.database/010030_verify_aioperationdesk_db.sh
- 090.scripts/010_run_aioperationdesk_db_bootstrap.sh
- 090.scripts/050_run_aioperationdesk_edge_stub_local.sh
- 090.scripts/055_run_aioperationdesk_edge_db_mode.sh
- 090.scripts/080_run_aioperationdesk_web_preview.sh
- 090.scripts/100_run_aioperationdesk_local_mock_stack.sh
- 090.scripts/110_run_aioperationdesk_local_db_stack.sh
- 090.scripts/120_stop_aioperationdesk_local_stack.sh
- 090.scripts/130_smoke_test_aioperationdesk_local_stack.sh
- 090.scripts/140_verify_aioperationdesk_impl_all.sh
- 090.scripts/150_run_aioperationdesk_full_local_mock_walkthrough.sh
- 090.scripts/160_run_aioperationdesk_full_local_db_walkthrough.sh
- 090.scripts/170_collect_aioperationdesk_local_run_artifacts.sh
- 090.scripts/180_run_aioperationdesk_final_precheck.sh

hard_boundaries_preserved:
- unsupported app execution still excluded
- unsupported app specific QA still excluded
- raw aiworker / business direct AI reads still excluded
- cx22073jw remains the AI-worker read-view expectation side
- controlled write surfaces remain the only execution route concept
- ungated final posting remains excluded
- free-chat mode remains excluded
EOF

cat > "$APP_ROOT/000.docs/FIRST_LOCAL_WALKTHROUGH.md" <<'MD'
# ============================================================
# AI OPERATION DESK FIRST LOCAL WALKTHROUGH
# ============================================================

status: implementation-stub
app: AIOperationDesk
owner: Boss
prepared_by: Zero

goal:
Run the current AIOperationDesk implementation stub locally from bootstrap
through smoke test.

recommended_order_mock:
1. verify design-side bundle:
   - 090.scripts/020_run_aioperationdesk_design_verification_from_dev.sh
2. verify implementation-side files:
   - 090.scripts/140_verify_aioperationdesk_impl_all.sh
3. optional db bootstrap:
   - 090.scripts/010_run_aioperationdesk_db_bootstrap.sh
4. start mock local stack:
   - 090.scripts/100_run_aioperationdesk_local_mock_stack.sh
5. smoke test:
   - 090.scripts/130_smoke_test_aioperationdesk_local_stack.sh
6. stop stack:
   - 090.scripts/120_stop_aioperationdesk_local_stack.sh

recommended_order_db:
1. verify design-side bundle
2. verify implementation-side files
3. bootstrap db:
   - 090.scripts/010_run_aioperationdesk_db_bootstrap.sh
4. start db local stack:
   - 090.scripts/110_run_aioperationdesk_local_db_stack.sh
5. smoke test:
   - 090.scripts/130_smoke_test_aioperationdesk_local_stack.sh
6. optional db read / write tests:
   - 090.scripts/065_test_aioperationdesk_edge_db_read_routes.sh
   - 090.scripts/075_test_aioperationdesk_edge_db_write_routes.sh
   - 090.scripts/077_test_aioperationdesk_edge_db_write_routes_remaining.sh
7. inspect db state:
   - 090.scripts/076_query_aioperationdesk_db_recent_write_state.sh
   - 090.scripts/078_query_aioperationdesk_db_recent_request_state.sh
8. stop stack:
   - 090.scripts/120_stop_aioperationdesk_local_stack.sh

notes:
- db_psql mode requires PERSONA_DATABASE_URL and psql
- some db write test scripts intentionally contain replace_me placeholders and should be edited with actual ids after initial inserts
- current stack is local validation oriented, not production packaged
