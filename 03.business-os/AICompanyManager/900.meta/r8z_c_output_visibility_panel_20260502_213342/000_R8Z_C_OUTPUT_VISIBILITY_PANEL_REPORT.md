# AICompanyManager R8Z-C output visibility panel

## Scope
- core file write: YES
- server file write: NO
- api post: NO
- db write: NO
- persistent db write: NO

## Purpose
Show where auto-created outputs appear after Leader auto decomposition.

UI location:
- 部門別タスク台帳
- Manager大項目サマリ直下
- Leader以降の成果物/作業単位 panel

DB source:
- business.aicm_leader_middle_work_item
- business.aicm_leader_deliverable_requirement
- business.aicm_worker_work_unit

## Note
Actual deliverable files are not created in this phase.
This phase shows deliverable requirements and worker work units.
