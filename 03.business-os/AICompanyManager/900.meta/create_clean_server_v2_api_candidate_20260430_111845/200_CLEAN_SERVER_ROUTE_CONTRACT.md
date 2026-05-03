# AICompanyManager clean server v2 API route contract

## Candidate file

server/aicm-clean-v2-api-server.candidate.mjs

## Runtime note

This candidate is not active until a later switch phase.

## Routes

GET /api/aicm/v2/context
- query: owner_civilization_id
- returns companies, departments, sections, placements, robot_catalog

POST /api/aicm/v2/company/create
- creates business.aicm_user_company

POST /api/aicm/v2/department/create
- verifies v2 company exists
- creates business.aicm_user_company_department

POST /api/aicm/v2/section/create
- verifies v2 department exists
- creates business.aicm_user_company_section

POST /api/aicm/v2/placement/create
- verifies v2 company exists
- creates business.aicm_user_company_worker_placement

## Safety

The server candidate must not expose:
- raw backend connection strings
- raw stack traces
- raw command output
- raw SQL text in browser response

## Not included

- update
- delete
- RLS apply
- migration
