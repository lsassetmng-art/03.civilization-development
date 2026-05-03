# Safe patch plan: BusinessOS DB company binding card

generated_at: 2026-04-30 06:59:22 +0900

## Decision

Do not disable the whole script if WHOLE_SCRIPT_DISABLE_RISK is HIGH.

Current risk:
- CARD_HITS=7
- STATE_HITS=15
- OBSERVER_HITS=8
- WHOLE_SCRIPT_DISABLE_RISK=HIGH

## Safe direction

1. Keep:
   - aicm-businessos-db-company-binding.js loaded
   - company state / binding / compatibility logic if present

2. Remove only:
   - visible BusinessOS DB 会社バインド card rendering

3. Avoid:
   - index.html script disable
   - broad display:none on parent containers
   - document.body/root rewrite
   - removing .aicm-card by text from outside scripts

4. Preferred next patch:
   - Patch the exact function/block inside aicm-businessos-db-company-binding.js that creates the card.
   - Make that card-render function return without DOM insertion.
   - Leave all other functions active.

## Files to review

- INDEX_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/businessos_db_company_binding_card_dependency_diag_20260430_065922/100_index_binding_scan.txt
- BINDING_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/businessos_db_company_binding_card_dependency_diag_20260430_065922/110_binding_js_card_scan.txt
- BINDING_RISK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/businessos_db_company_binding_card_dependency_diag_20260430_065922/120_binding_js_dependency_risk.txt
- TARGET_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/businessos_db_company_binding_card_dependency_diag_20260430_065922/130_phase_de_dh_company_binding_related_scan.txt

