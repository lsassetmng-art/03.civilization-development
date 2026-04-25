# 05.game-os adapter contract

status: active
owner: Boss
prepared_by: Zero

role:
Translate OS/app feature state into CommonOS-friendly input models.

allowed:
- feature state to CommonOS input model translation\n- input normalization for shared components

forbidden:
- business canon mutation\n- pricing/entitlement decision\n- secret embedding

common_rules:
- pricing decision core stays outside CommonOS
- entitlement decision core stays outside CommonOS
- approval/accounting/inventory/ledger canon stays outside CommonOS
- API payload canon stays in each OS/app side
- secrets and keys must not be placed here
