# BusinessOS AIWorker Missing Robot Pool Add Canon

## Purpose
Add currently missing AIWorker models into BusinessOS robot_pool.

## Scope
This step only adds missing robot_pool rows.

It does not:
- assign placement_role_code_1
- assign placement_role_code_2
- assign placement_role_code_3
- change selector views
- change functions
- delete rows
- change existing 9 registered models

## Added series
- HD / helios_dynamics additional models
- Beyond / asic
- LoVerS / lavi_corporation

## LoVerS version note
LoVerS model codes require version format:
LVS-{personality_number}{F/M}v{version}

This initial BusinessOS pool registration uses v001 as the initial registration version.
Future version-specific releases can be added as additional rows.

## Next
After model rows are present, assign placement_role_code_1〜3.
