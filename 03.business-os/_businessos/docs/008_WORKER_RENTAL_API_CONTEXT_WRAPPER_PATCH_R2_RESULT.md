# WorkerRentalCore API Context Wrapper Patch R2 Result

## Status
- FINAL_STATUS: API_CURRENT_CIVILIZATION_CONTEXT_PATCH_R2_E2E_PASS_READY_FOR_RLS_APPLY_DESIGN
- API patch: applied
- RLS apply: not applied

## Patch
Added helper:

```js
sqlSetCurrentCivilizationContext(context)
```

Owner-scoped RobotRentalStore SQL transactions now inject:

```sql
SELECT set_config('app.current_civilization_id', <owner_civilization_id>, true);
```

inside the same transaction as the write operation.

## Patched functions
- persistQuote
- confirmContract
- createPaymentIntent
- startRental
- endRental
- cancelRental

## Verified
- quote -> confirm -> payment -> start -> end
- quote -> confirm -> payment -> cancel
- RLS remains disabled
- persistent rows retained
- owner_civilization_id remains canonical row owner

## Contracts
- ended contract: 597dbce3-1117-47f3-91a3-38520c0f5e1a
- canceled contract: b5a31dc8-4fad-47d4-b5f1-2256ed4aebd2

## Next
Generate exact RLS apply design/script. Do not enable RLS until explicit GO.
