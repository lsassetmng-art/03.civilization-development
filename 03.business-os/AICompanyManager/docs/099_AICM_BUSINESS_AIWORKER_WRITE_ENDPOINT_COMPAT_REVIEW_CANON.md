# AICompanyManager Write Endpoint Compatibility Review Canon

## Purpose
Document the current write endpoint verification boundary from the UI/API side.

## Current safe verification
- grant endpoint: HTTP dry-run
- place endpoint: HTTP dry-run
- update/deactivate: DB rollback chain

## Reason
HTTP dry-run place rolls back before update/deactivate can reference the placement_id.

## Next options
1. Add combined API rollback-smoke endpoint for grant/place/update/deactivate.
2. Use temporary persistent test company rows, then cleanup after explicit approval.
3. Move to production hardening only after combined smoke is added.
