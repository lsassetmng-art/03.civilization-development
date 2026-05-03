# AICompanyManager BusinessOS AIWorker Screen Filter Canon

## Purpose
Filter saved robot placements by AICompanyManager screen context.

## Screen mapping
| Screen | target_level_code | role_code |
|---|---|---|
| AI企業設定 | company | President |
| 部門詳細 | department | Manager |
| 課詳細 Leader | section | Leader |
| Worker配置 | section | Worker |

## Boundary
AIWorkerOS owns robot model canon.
BusinessOS _aiworker owns pool / entitlement / placement.
AICompanyManager owns UI route and screen-specific display.

## Rule
This phase does not modify existing main JS.
This phase adds a separate screen filter client and script tag.

## Deactivation
Rows are not deleted.
Inactive rows remain available through status_code filter.

## Display
Display label remains:
internal_nickname@role_code
