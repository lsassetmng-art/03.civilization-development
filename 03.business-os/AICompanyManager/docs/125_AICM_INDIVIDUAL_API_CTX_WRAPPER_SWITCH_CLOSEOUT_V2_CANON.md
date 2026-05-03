# AICompanyManager individual API ctx-wrapper switch closeout v2 canon

## Purpose
Confirm individual write endpoints use context wrappers without confusing dry-run rollback semantics.

## Final interpretation
- individual grant endpoint can be dry-run verified alone
- individual place endpoint needs entitlement precondition
- combined rollback-smoke is the compatibility verification for grant/place/update/deactivate chain
