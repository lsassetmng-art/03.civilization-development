# 02.persona-os test contract

status: active
owner: Boss
prepared_by: Zero

role:
Hold CommonOS consumption tests for rendering, mapping, bridge contracts, and screen composition.

allowed:
- render test\n- mapper contract test\n- bridge contract test\n- presenter smoke test

forbidden:
- replacing domain acceptance canon\n- overriding business source-of-truth

common_rules:
- pricing decision core stays outside CommonOS
- entitlement decision core stays outside CommonOS
- approval/accounting/inventory/ledger canon stays outside CommonOS
- API payload canon stays in each OS/app side
- secrets and keys must not be placed here
