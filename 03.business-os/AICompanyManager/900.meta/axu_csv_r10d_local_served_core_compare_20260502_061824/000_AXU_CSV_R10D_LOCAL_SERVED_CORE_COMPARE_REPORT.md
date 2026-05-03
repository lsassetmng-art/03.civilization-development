# AICompanyManager AXU-CSV-R10D local/served core compare

## Result
- DIAGNOSIS=SERVED_CORE_HAS_DUPLICATE_R10_HELPER
- PASS_COUNT=6
- WARN_COUNT=2
- FAIL_COUNT=0

## Key counts
- CORE_MATCH=YES
- LOCAL_FUNC_COUNT=3
- SERVED_FUNC_COUNT=3
- LOCAL_MARKER_COUNT=3
- SERVED_MARKER_COUNT=3

## Files
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10d_local_served_core_compare_20260502_061824/060_http.txt
- LOCAL_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10d_local_served_core_compare_20260502_061824/030_local_core_analysis.txt
- SERVED_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10d_local_served_core_compare_20260502_061824/040_served_core_analysis.txt
- DIFF_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_r10d_local_served_core_compare_20260502_061824/050_local_served_diff.txt

## Next
- SERVED_CORE_DIFFERS_FROM_LOCAL_CORE: server is serving another/stale file. Fix server static route or restart harder.
- SERVED_CORE_HAS_DUPLICATE_R10_HELPER: canonicalize served/source duplication by exact line evidence.
- MARKER_DUPLICATE_ONLY_OR_OLD_MARKER_COMMENTS: marker count is not fatal; browser UI state/render route should be checked.
- CORE_DELIVERY_OK_CHECK_BROWSER_STATE_OR_RENDER_ROUTE: next inspect actual render function used by current screen.
