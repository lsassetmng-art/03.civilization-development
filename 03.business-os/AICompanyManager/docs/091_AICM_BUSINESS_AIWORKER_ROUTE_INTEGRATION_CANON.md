# AICompanyManager BusinessOS AIWorker Route Integration Canon

## Purpose
Add AIWorker robot-setting entrances to AICompanyManager user-facing routes without modifying existing main JS.

## Integrated user-facing routes
- AI企業設定
  - President robot setting
  - target_level_code = company
  - role_code = President

- 部門詳細
  - Manager robot setting
  - target_level_code = department
  - role_code = Manager

- 課詳細
  - Leader robot setting
  - target_level_code = section
  - role_code = Leader

- Worker配置
  - Worker robot setting
  - target_level_code = section
  - role_code = Worker

## Boundary
AIWorkerOS owns:
- robot model canon
- series
- personality
- safety boundary
- release state

BusinessOS _aiworker owns:
- Business robot pool
- company entitlement
- placement
- update/deactivate API
- selector options

AICompanyManager owns:
- UI route
- robot setting entrance
- placement display
- bridge to BusinessOS _aiworker

## Rule
Existing AICompanyManager main JS must not be modified in this phase.
This phase adds only:
- route integration JS
- script tag in index.html
- docs / smoke test

## Display
Assigned robot display label:
internal_nickname@role_code
