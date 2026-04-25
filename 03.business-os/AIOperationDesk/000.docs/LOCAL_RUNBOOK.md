# ============================================================
# AI OPERATION DESK LOCAL RUNBOOK
# ============================================================

status: implementation-stub
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the local run sequence for the current implementation stub stack.

stack_components:
- edge api server
- static web preview server

runtime_modes:
- mock
- db_psql

ports_default:
- edge:
  - 8787
- web:
  - 8087

mock_mode_start:
- 090.scripts/100_run_aioperationdesk_local_mock_stack.sh

db_mode_start:
- 090.scripts/110_run_aioperationdesk_local_db_stack.sh

stop_stack:
- 090.scripts/120_stop_aioperationdesk_local_stack.sh

smoke_test:
- 090.scripts/130_smoke_test_aioperationdesk_local_stack.sh

rules:
- db_psql mode requires PERSONA_DATABASE_URL and psql
- db_psql mode currently supports read routes and current db-backed write routes already added
- unsupported write paths still remain stub-routed where not yet migrated
