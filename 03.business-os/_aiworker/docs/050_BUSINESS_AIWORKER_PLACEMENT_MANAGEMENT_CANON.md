# BusinessOS AIWorker Placement Management Canon

## Purpose
Manage already-saved AICompanyManager robot placements.

## Scope
This phase adds:
- placement list
- placement update
- placement deactivate
- placement event ledger
- AICompanyManager placement management panel

## Canonical boundary
AIWorkerOS owns:
- robot model canon
- series
- personality
- safety boundary
- release state

BusinessOS _aiworker owns:
- business robot pool
- company robot entitlement
- company robot placement
- placement update/deactivation history

AICompanyManager owns:
- user-facing display
- company/department/section placement UX
- bridge/client integration

## Placement rule
A placement row represents one actual role placement:
- President
- Manager
- Leader
- Worker
- Helper
- Friend
- Specialist

## Display rule
Display label is:
internal_nickname@role_code

## Deactivate rule
Do not delete placement rows.
Deactivate by setting status_code = inactive and recording event metadata.

## Update rule
Editable fields:
- internal_nickname
- role_code
- target_level_code
- target_id
- metadata patch

Do not update AIWorkerOS model canon here.
