# BusinessOS Login Context Multilingual R2 Patch Gate

## Required previous status

PASS_BUSINESSOS_LOGIN_CONTEXT_MULTILINGUAL_R1_DESIGN_NO_PATCH_READY_FOR_R2

## R2 allowed

PATCH=YES

Allowed target files only:

- 03.business-os/shared/login-context/businessos-login-context.mjs
- 03.business-os/shared/login-context/README.md
- 03.business-os/900.meta/*businessos_login_context_multilingual_r2*

## R2 forbidden

- DB_CONNECTION=NO
- DB_WRITE=NO
- DDL_APPLY=NO
- API_POST=NO
- DELETE=NO
- RLS_CHANGE=NO
- ROBOTRENTALSTORE_CONSUMER_WIRING=NO
- AICM_CONSUMER_WIRING=NO
- PORTAL_PATCH=NO
- CIVILIZATIONOS_PATCH=NO
- AIWORKEROS_PATCH=NO
- PERSONAOS_PATCH=NO
- GIT_ADD=NO
- GIT_COMMIT=NO
- GIT_PUSH=NO
- PYTHON=NO

## R2 purpose

Create parse-only BusinessOS login context foundation.

BusinessOS remains a consumer.
CivilizationOS remains login authority.

## R2 must not

- enforce login
- validate session against DB
- create login page
- store password
- store OAuth token
- accept refresh token
- modify existing BusinessOS app behavior

## Required R2 checks

- R1 PASS confirmed
- helper syntax check with node
- exported functions exist
- locale normalization checks pass
- forbidden secret detection checks pass
- redaction checks pass
- no existing app behavior files patched
- no broad git add
