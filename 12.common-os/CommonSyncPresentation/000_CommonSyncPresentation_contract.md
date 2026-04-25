# CommonSyncPresentation contract

status: active
owner: Boss
prepared_by: Zero

role:
Own shared queue/retry/conflict/offline presentation components.

allowed:
- queue status presentation\n- retry presentation\n- conflict presentation

forbidden:
- queue meaning definition\n- sync authority logic\n- business reconciliation canon

common_rules:
- pricing decision core stays outside CommonOS
- entitlement decision core stays outside CommonOS
- approval/accounting/inventory/ledger canon stays outside CommonOS
- API payload canon stays in each OS/app side
- secrets and keys must not be placed here
