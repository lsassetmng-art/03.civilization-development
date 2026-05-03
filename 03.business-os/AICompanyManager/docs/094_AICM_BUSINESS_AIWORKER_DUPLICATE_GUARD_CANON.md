# AICompanyManager BusinessOS AIWorker Duplicate Guard Canon

## Purpose
Prevent accidental duplicate robot placements for single-slot roles.

## Role rule
Single-slot roles:
- President
- ExecutiveManager
- Manager
- Leader

Multi-slot roles:
- Worker
- Helper
- Friend
- Specialist
- Butler
- Security

## Duplicate scope
The duplicate guard checks active placements by:
- company_id
- app_code = AICompanyManager
- role_code
- target_level_code
- target_id

For target_id, NULL and empty target are treated as the same target bucket.

## Behavior
- If role is single-slot and an active placement already exists for the same scope, saving is blocked.
- If role is multi-slot, saving is allowed.
- Editing/deactivation remains handled by placement management.
- Delete is still prohibited.

## Boundary
AIWorkerOS owns robot model canon.
BusinessOS _aiworker owns placement and duplicate guard.
AICompanyManager owns save UX and displays the guard result.

## Safety
- No existing main JS modification.
- Existing save client is wrapped, not edited.
- index.html is script-append only.
