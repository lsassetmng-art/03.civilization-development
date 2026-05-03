# AICompanyManager R8Z-F canonical context normalize fix

## Roadmap
1. R8Z-D confirmed DB/API child output creation success.
2. Cause check confirmed context API returns child arrays.
3. UI still shows 0/0/0, so issue is core-side state/context hydration.
4. R8Z-F fixes the canonical context boundary instead of stacking display-only patches.

## Scope
- core file write: YES
- server file write: NO
- api post: NO
- db write: NO
- persistent db write: NO

## Maintainability decision
Do not keep adding display wrappers or extra fetches.
Use one canonical path:

loadContext / normalizeContext
-> state.context
-> renderTaskLedgerPlaceholder
-> Leader以降の出力 panel

## Expected UI
Leader以降の出力:
- Leader中項目: 1
- 成果物要件: 1
- Worker作業単位: 1
