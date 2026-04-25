# CommonUIRuntime contract

status: active
owner: Boss
prepared_by: Zero

role:
Own reusable HTML UI runtime and shared UI primitives.

allowed:
- button/input/card/list/table/dialog/state panel base\n- reusable rendering/runtime utilities

forbidden:
- OS-specific business logic\n- app-specific domain branching\n- authority decision core

common_rules:
- pricing decision core stays outside CommonOS
- entitlement decision core stays outside CommonOS
- approval/accounting/inventory/ledger canon stays outside CommonOS
- API payload canon stays in each OS/app side
- secrets and keys must not be placed here
