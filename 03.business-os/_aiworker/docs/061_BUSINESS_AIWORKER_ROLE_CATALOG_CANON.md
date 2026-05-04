# BusinessOS AIWorker Role Catalog Canon

## Purpose
Define placement roles available for BusinessOS AIWorker / AICompanyManager.

## Scope
This catalog defines roles only.
It does not assign roles to robot models.

## Canonical split
Robot model identity:
- business.robot_pool.aiworker_model_code
- business.robot_pool.display_name
- business.robot_pool.aiworker_series_code
- business.robot_pool.manufacturer_code

Placement role definition:
- business.robot_placement_role_catalog.role_code

Robot model role slots:
- business.robot_pool.placement_role_code_1
- business.robot_pool.placement_role_code_2
- business.robot_pool.placement_role_code_3

Actual placement:
- business.company_robot_placement.role_code

## Single slot roles
These are normally one active placement per target:
- President
- ExecutiveManager
- Manager
- Leader

## Multi slot roles
These can have multiple placements:
- Worker
- Helper
- Friend
- Specialist
- Advisor
- Butler
- Security

## Display rule
Actual assigned display remains:
internal_nickname@role_code
