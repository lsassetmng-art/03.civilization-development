# 04.life-os mapper contract

status: active
owner: Boss
prepared_by: Zero

role:
Map domain output into screen/list/detail/form/sync presentation models.

allowed:
- domain result to display model\n- list/detail/form view model mapping\n- sync display mapping

forbidden:
- canonical writes\n- domain rule ownership\n- pricing/entitlement source-of-truth

common_rules:
- pricing decision core stays outside CommonOS
- entitlement decision core stays outside CommonOS
- approval/accounting/inventory/ledger canon stays outside CommonOS
- API payload canon stays in each OS/app side
- secrets and keys must not be placed here
