# BusinessOS AIWorker Role Slot Columns Canon

## Purpose
Add placement role slot columns to BusinessOS robot_pool.

## Scope
This step only adds columns.
It does not fill values.
It does not change selector views.
It does not change functions.
It does not create role proposals.

## Added columns
- placement_role_code_1
- placement_role_code_2
- placement_role_code_3
- placement_role_config_status_code
- placement_role_config_note
- placement_role_config_updated_at

## Meaning
Model identity and placement role are separate.

Model identity:
- aiworker_model_code
- display_name
- aiworker_series_code
- manufacturer_code

Placement role candidates:
- placement_role_code_1
- placement_role_code_2
- placement_role_code_3

Actual placement:
- business.company_robot_placement.role_code

## Rule
Maximum role slots on robot_pool: 3.
