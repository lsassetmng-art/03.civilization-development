# AICompanyManager user-company v2 table design

## 1. Canonical decision

BusinessOS is user / CivilizationID scoped.

AICompanyManager app company is not ERP company master.
AICompanyManager app company is a user-owned object registered inside this app.

## 2. Canonical hierarchy

owner_civilization_id
  -> aicm_user_company
  -> aicm_user_company_department
  -> aicm_user_company_section
  -> aicm_user_company_worker_placement

## 3. Table responsibilities

### business.aicm_user_company

User-owned AICompanyManager company.
This is the AI企業 registered in this app.

It is not:
- ERP company master
- robot entitlement owner
- aiworker robot master

### business.aicm_user_company_department

Department under the user-owned AICompanyManager company.

### business.aicm_user_company_section

Section under department.
User-facing label is 課.

### business.aicm_user_company_worker_placement

Placement of robot/worker into President / Manager / Leader / Worker role.

This table stores placement facts only.
It references robot_pool_id and aiworker_model_code, but it does not own robot master data.

### business.aicm_user_company_worker_placement_event

Audit/event trail for worker placement changes.

## 4. Robot catalog rule

Robot candidates are not owned by AICompanyManager company_id.

Current system-use unlimited candidate source:
business.vw_ai_company_manager_system_robot_selector_options

Future clearer name candidate:
business.vw_ai_company_manager_system_robot_catalog_options

## 5. Why v2 add-only tables

Existing tables have ambiguous company_id meaning.

Examples:
- business.aicm_company
- business.company_robot_entitlement
- business.company_robot_placement

The new v2 tables make ownership explicit through:
owner_civilization_id

## 6. Enterprise Builder reuse

Enterprise Builder can reuse the same structure with different table names.

Example:
builder_user_company
builder_user_company_department
builder_user_company_section
builder_user_company_worker_placement

For map-based builder usage, company table can additionally hold:
- map_id
- map_area_id
- map_tile_id
- location_id
- active_editing_flag

Rule:
A user may own multiple companies.
The UI editing context selects one company at a time.
