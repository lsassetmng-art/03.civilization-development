# 11.aiworker-os bridge contract

status: active
owner: Boss
prepared_by: Zero

role:
Bridge OS-specific APIs, local state, device capability, and runtime boundary into CommonOS usage surface.

allowed:
- API bridge\n- local storage bridge\n- capability bridge\n- environment bridge

forbidden:
- business decision core\n- approval/accounting authority logic\n- canonical domain ownership transfer

common_rules:
- pricing decision core stays outside CommonOS
- entitlement decision core stays outside CommonOS
- approval/accounting/inventory/ledger canon stays outside CommonOS
- API payload canon stays in each OS/app side
- secrets and keys must not be placed here
