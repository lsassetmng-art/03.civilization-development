# BusinessOS Login Context Civilization Reuse R6 Patch Gate

## Required previous status

PASS_BUSINESSOS_LOGIN_CONTEXT_CIVILIZATION_REUSE_R5_DESIGN_NO_PATCH_READY_FOR_R6

## R6 allowed

PATCH=YES

Allowed target files only:

- 03.business-os/shared/login-context/businessos-login-context.mjs
- 03.business-os/shared/login-context/README.md
- 03.business-os/900.meta/*businessos_login_context_civilization_reuse_r6*

## R6 forbidden

- DB_CONNECTION=NO
- DB_WRITE=NO
- DDL_APPLY=NO
- API_POST=NO
- DELETE=NO
- RLS_CHANGE=NO
- ROBOTRENTALSTORE_WIRING=NO
- AICM_LOGIN_WIRING=NO
- AIWORKEROS_PATCH=NO
- PORTAL_PATCH=NO
- CIVILIZATIONOS_PATCH=NO
- PERSONAOS_PATCH=NO
- GIT_ADD=NO
- GIT_COMMIT=NO
- GIT_PUSH=NO
- PYTHON=NO

## R6 purpose

Clarify that BusinessOS reuses CivilizationOS login context through a thin consumer adapter.

Do not create OS-specific login-context schema.
Do not wire apps yet.
