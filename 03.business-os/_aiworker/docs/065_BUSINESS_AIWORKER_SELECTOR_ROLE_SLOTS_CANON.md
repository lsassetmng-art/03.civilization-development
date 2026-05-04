# BusinessOS AIWorker Selector Role Slots Canon

## Purpose
Make BusinessOS AIWorker selectors use robot_pool placement role slots.

## Source of selector roles
Selector roles come from:
- business.robot_pool.placement_role_code_1
- business.robot_pool.placement_role_code_2
- business.robot_pool.placement_role_code_3

## Not source
Do not infer role from:
- aiworker_model_code
- display_name
- aiworker_series_code
- manufacturer_code

## Views updated
- business.vw_business_robot_selector_options
- business.vw_company_robot_selector_options

## Functions updated
- business.fn_business_robot_selector_options_for_role
- business.fn_company_robot_selector_options_for_role

## Sorting rule
If a role is requested:
- role_1 match => sort_rank 1
- role_2 match => sort_rank 2
- role_3 match => sort_rank 3

## Duplicate guard
Duplicate guard role rules come from:
- business.robot_placement_role_catalog

## Display
Selector label remains:
display_name / aiworker_model_code

Actual placement display remains:
internal_nickname@role_code
