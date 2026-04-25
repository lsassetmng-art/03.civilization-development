# AppCommonStarter contract

status: active
owner: Boss
prepared_by: Zero

role:
Own app_common starter boundary and shared mutable metadata starter only.

allowed:
- theme registry starter\n- component catalog starter\n- locale/template starter\n- sync policy metadata starter

forbidden:
- ERP voucher canon\n- business transaction canon\n- secrets\n- final entitlement decision

common_rules:
- pricing decision core stays outside CommonOS
- entitlement decision core stays outside CommonOS
- approval/accounting/inventory/ledger canon stays outside CommonOS
- API payload canon stays in each OS/app side
- secrets and keys must not be placed here
