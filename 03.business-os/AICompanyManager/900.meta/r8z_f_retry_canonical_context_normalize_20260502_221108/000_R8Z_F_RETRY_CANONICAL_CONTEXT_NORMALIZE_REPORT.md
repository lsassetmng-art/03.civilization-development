# AICompanyManager R8Z-F retry canonical context normalize fix

## Roadmap
1. R8Z-D confirmed DB/API child output creation success.
2. Cause check confirmed context API returns child arrays.
3. UI still shows 0/0/0, so issue is core-side state/context hydration.
4. R8Z-F fixes the canonical context boundary instead of stacking display-only patches.

## Retry reason
Previous R8Z-F stopped because validation expected aicmLoadContextBeforeR8ZF once.
Correct behavior is:
- declaration once
- invocation once
- token count twice

## Scope
- core file write: YES
- server file write: NO
- api post: NO
- db write: NO
- persistent db write: NO

## Expected UI
Leader以降の出力:
- Leader中項目: 1
- 成果物要件: 1
- Worker作業単位: 1

## Checks
- node_check_before: PASS
- precheck_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_f_retry_canonical_context_normalize_20260502_221108/020_precheck_scan.log
- patch_result: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_f_retry_canonical_context_normalize_20260502_221108/110_patch_result.json
- node_check_after: PASS
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_f_retry_canonical_context_normalize_20260502_221108/130_core_scan_after.log
- context_api_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_f_retry_canonical_context_normalize_20260502_221108/160_context_api_check.log
- ui_server_restart: PASS

## Result
- final_status: R8Z_F_RETRY_CANONICAL_CONTEXT_NORMALIZE_DONE_REVIEW_REQUIRED

## Manual UI check
Open:
- 部門別タスク台帳
- Leader以降の出力

Expected:
- Leader中項目: 1
- 成果物要件: 1
- Worker作業単位: 1

## Notes
R8Z-E extra fetch/hydrate block was removed from core.
Child outputs are now normalized at the context boundary.
