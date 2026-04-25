# CommonTokenSet contract

status: active
owner: Boss
prepared_by: Zero

role:
Own shared design tokens and token-set level variant entrypoints.

allowed:
- design token definition\n- token aliasing\n- visual variant base

forbidden:
- business decision values\n- pricing/entitlement rules\n- domain source-of-truth mutation

common_rules:
- pricing decision core stays outside CommonOS
- entitlement decision core stays outside CommonOS
- approval/accounting/inventory/ledger canon stays outside CommonOS
- API payload canon stays in each OS/app side
- secrets and keys must not be placed here
