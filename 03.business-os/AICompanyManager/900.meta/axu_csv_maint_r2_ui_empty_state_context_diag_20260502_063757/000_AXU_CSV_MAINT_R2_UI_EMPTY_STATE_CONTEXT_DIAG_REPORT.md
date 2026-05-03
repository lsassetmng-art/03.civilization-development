# AXU-CSV-MAINT-R2 UI empty diagnostic

FINAL_STATUS=DIAG_DONE_REVIEW_REQUIRED
DIAGNOSIS=LIKELY_BROWSER_STATE_OR_RENDER_NOT_REFRESHED

## Key result
- CONTEXT_MAJOR=100
- WOLF_MAJOR=100
- ROWS_HELPER=1
- RENDER_HELPER=1
- PLACEHOLDER_RENDER=true
- PLACEHOLDER_OLD=false

## Files
- CONTEXT_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r2_ui_empty_state_context_diag_20260502_063757/020_context_summary.txt
- DB_COMPANY_MAJOR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r2_ui_empty_state_context_diag_20260502_063757/030_db_company_major_counts.tsv
- CORE_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r2_ui_empty_state_context_diag_20260502_063757/040_core_analysis.txt

## Next by diagnosis
- SERVER_CONTEXT_DOES_NOT_RETURN_MAJOR_ROWS:
  fix server context payload mapping.
- SELECTED_COMPANY_OR_COMPANY_ID_MISMATCH:
  fix selected company id / imported row company binding.
- CORE_CANONICAL_HELPER_STRUCTURE_INVALID:
  clean core canonical helper structure, not add patch helpers.
- PLACEHOLDER_NOT_USING_CANONICAL_RENDER_PATH:
  replace only renderTaskLedgerPlaceholder body.
- LIKELY_BROWSER_STATE_OR_RENDER_NOT_REFRESHED:
  add reload-context-after-import or force fresh context before task-ledger render.
