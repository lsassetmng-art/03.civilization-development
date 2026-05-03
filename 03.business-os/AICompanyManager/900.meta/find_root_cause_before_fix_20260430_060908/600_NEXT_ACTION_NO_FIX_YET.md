# Next action before fixing

1. Read:
   - /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/find_root_cause_before_fix_20260430_060908/500_root_cause_ranking.md
   - /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/find_root_cause_before_fix_20260430_060908/200_save_client_event_handlers.txt
   - /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/find_root_cause_before_fix_20260430_060908/210_save_client_nav_ignored_hits.txt
   - /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/find_root_cause_before_fix_20260430_060908/300_target_switch_company_context.txt
   - /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/find_root_cause_before_fix_20260430_060908/310_target_bind_context.txt

2. Decide based on evidence:

If save client has touchend/nav ignored:
- Do not patch phase-de-dh again.
- Fix or temporarily disable save client's broad document event handling.

If switch-company is absent:
- Patch switch-company in phase-de-dh.

If served HTML is stale:
- Fix server/cache/script query version first.

3. Do not touch DB.
