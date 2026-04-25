# 05.game-os sync contract

status: active
owner: Boss
prepared_by: Zero

role:
Connect queue/retry/conflict/offline domain states to CommonOS sync presentation.

allowed:
- queue status mapping\n- retry mapping\n- conflict display mapping\n- offline presentation mapping

forbidden:
- redefine queue meaning\n- domain reconciliation canon\n- authority rules

common_rules:
- pricing decision core stays outside CommonOS
- entitlement decision core stays outside CommonOS
- approval/accounting/inventory/ledger canon stays outside CommonOS
- API payload canon stays in each OS/app side
- secrets and keys must not be placed here
