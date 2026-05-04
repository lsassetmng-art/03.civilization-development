# Entitlement / Placement Company-Scoped RLS Canon

## Purpose
Apply company-scoped RLS to:
- business.company_robot_entitlement
- business.company_robot_placement

## Context source
Policies use:
- current_setting('app.current_company_id', true)

## Required API path
Write APIs must use ctx wrapper path:
- business.fn_company_robot_grant_entitlement_ctx
- business.fn_company_robot_place_ctx
- business.fn_company_robot_placement_update_ctx
- business.fn_company_robot_placement_deactivate_ctx

## Policy model
For both entitlement and placement:
- SELECT: company_id matches app.current_company_id
- INSERT: company_id matches app.current_company_id
- UPDATE: existing and new company_id match app.current_company_id
- DELETE: no policy in this phase

## Not applied yet
- FORCE ROW LEVEL SECURITY

Reason:
- Keep first company-scoped RLS phase reversible and compatible.
