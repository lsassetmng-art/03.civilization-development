# AICompanyManager Company Context Foundation Canon

## Purpose
Prepare AICompanyManager / BusinessOS AIWorker API for future company-scoped RLS.

## New smoke endpoint
POST /api/v1/business/aiworker/company-context/rollback-smoke

## Expected behavior
- valid token can set and verify company context inside rollback transaction
- invalid token is denied
- combined rollback-smoke sets company context before write chain
- no persistent rows are created

## Still not applied
- business.company_robot_entitlement RLS
- business.company_robot_placement RLS
