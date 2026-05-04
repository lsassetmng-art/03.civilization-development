# Individual API ctx-wrapper switch closeout v2 canon

## Purpose
Close out individual API ctx-wrapper switch with correct dry-run semantics.

## Important correction
The place endpoint requires an existing entitlement.
If grant is called with dry_run=true, it rolls back and does not create entitlement for the next HTTP request.
Therefore, a standalone place dry-run with a fresh company_id is expected to fail with:
- company_robot_entitlement_not_found

## Correct verification model
- grant endpoint dry-run must pass.
- standalone place endpoint with no entitlement must fail safely.
- combined rollback-smoke must pass because it grants and places in one transaction.
- no entitlement/placement rows may persist.
- entitlement/placement RLS remains unchanged.
