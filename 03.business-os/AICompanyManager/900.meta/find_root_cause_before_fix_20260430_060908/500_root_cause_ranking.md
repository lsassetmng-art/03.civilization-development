# Root cause candidate ranking

generated_at: 2026-04-30 06:09:10 +0900

## A. company save client still intercepts AI企業を表示

risk_touchend_handler: HIGH
risk_nav_ignored_path: HIGH
risk_blocks_other_handlers: HIGH

Evidence files:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/find_root_cause_before_fix_20260430_060908/200_save_client_event_handlers.txt
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/find_root_cause_before_fix_20260430_060908/210_save_client_nav_ignored_hits.txt

This matches the screenshot if toast says:
company save client v6: touchend nav ignored: AI企業を表示

## B. switch-company action/bind is missing or not reached

risk: LOW

Evidence:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/find_root_cause_before_fix_20260430_060908/300_target_switch_company_context.txt
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/find_root_cause_before_fix_20260430_060908/310_target_bind_context.txt

If switch-company exists but save client runs first and blocks, A is stronger.

## C. served browser HTML/JS is stale

risk: LOW

Evidence:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/find_root_cause_before_fix_20260430_060908/111_served_script_lines.txt

If served HTML still loads old script URLs or disabled lines, browser may be reading old logic.

## D. currentCompany still falls back to first company

risk: LOW

Evidence:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/find_root_cause_before_fix_20260430_060908/320_target_current_company_context.txt

If currentCompany has return data.companies[0], it can still reset to first company.

## Current best hypothesis

Primary:
- company save client is still attached too broadly, especially touchend.

Secondary:
- switch-company may not be reached after touchend interception.

Do not fix yet until reviewing files listed above.
