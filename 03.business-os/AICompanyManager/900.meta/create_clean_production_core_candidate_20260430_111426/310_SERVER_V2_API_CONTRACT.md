# Server v2 API contract for clean production core

## Required routes

GET /api/aicm/v2/context

Query:
- owner_civilization_id

Response:
- result: ok
- companies
- departments
- sections
- placements
- robot_catalog

POST /api/aicm/v2/company/create

Body:
- owner_civilization_id
- company_name
- business_domain

POST /api/aicm/v2/department/create

Body:
- owner_civilization_id
- aicm_user_company_id
- department_name
- purpose

POST /api/aicm/v2/section/create

Body:
- owner_civilization_id
- aicm_user_company_id
- aicm_user_company_department_id
- section_name
- purpose

POST /api/aicm/v2/placement/create

Body:
- owner_civilization_id
- aicm_user_company_id
- aicm_user_company_department_id
- aicm_user_company_section_id
- target_level_code
- target_id
- role_code
- robot_pool_id
- aiworker_model_code
- internal_nickname

## Server safety

Server must not expose:
- DATABASE_URL
- raw psql command
- raw stack trace
- raw SQL text
- passwords or connection strings

## Validation

Department create must verify the company exists in business.aicm_user_company.

Section create must verify the department exists in business.aicm_user_company_department.

Placement create must verify selected company/dept/section are v2 records.
