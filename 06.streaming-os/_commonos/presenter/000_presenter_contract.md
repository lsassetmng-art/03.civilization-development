# 06.streaming-os presenter contract

status: active
owner: Boss
prepared_by: Zero

role:
Compose CommonOS components into OS-specific screens while keeping business logic outside presenter.

allowed:
- screen composition\n- layout composition\n- component binding\n- presentation-only branching

forbidden:
- domain decision logic\n- approval logic\n- accounting/inventory logic

common_rules:
- pricing decision core stays outside CommonOS
- entitlement decision core stays outside CommonOS
- approval/accounting/inventory/ledger canon stays outside CommonOS
- API payload canon stays in each OS/app side
- secrets and keys must not be placed here
