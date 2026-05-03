# AICompanyManager production core contract

## File

assets/js/aicm-production-core.js

## Purpose

Clean production UI candidate for AICompanyManager.

## Core rules

- One state owner
- One API client
- One renderer
- One root-scoped action dispatcher
- v2 DB/API only
- No old localStorage company source
- No edit-company-select as canonical
- No debug card
- No broad document click/touch interception
- No MutationObserver
- No raw DB error or DATABASE_URL exposure

## Canonical state

state.ownerCivilizationId
state.selectedCompanyId
state.selectedDepartmentId
state.selectedSectionId
state.context.companies
state.context.departments
state.context.sections
state.context.placements
state.context.robotCatalog

## API contract

GET /api/aicm/v2/context?owner_civilization_id=...

POST /api/aicm/v2/company/create
POST /api/aicm/v2/department/create
POST /api/aicm/v2/section/create
POST /api/aicm/v2/placement/create

## UI screens

- dashboard
- company-new
- department-new
- section-new
- placement-new
- settings placeholder

## Not included yet

- edit company
- delete company
- edit department
- delete department
- edit section
- delete section
- approval/review workflows
