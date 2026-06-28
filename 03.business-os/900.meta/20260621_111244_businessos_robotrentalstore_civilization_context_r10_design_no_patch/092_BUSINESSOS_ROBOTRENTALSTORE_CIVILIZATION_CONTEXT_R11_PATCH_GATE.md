# BusinessOS RobotRentalStore Civilization Context R11 Patch Gate

## Required previous status

PASS_BUSINESSOS_ROBOTRENTALSTORE_CIVILIZATION_CONTEXT_R10_DESIGN_NO_PATCH_READY_FOR_R11_PATCH

## Allowed

PATCH=YES

Allowed files only:

- 03.business-os/RobotRentalStore/ui/static/civilization-context-bridge.js
- 03.business-os/RobotRentalStore/ui/static/index.html
- 03.business-os/RobotRentalStore/ui/static/contracts.html
- 03.business-os/RobotRentalStore/ui/static/application-contracts.html
- 03.business-os/900.meta/*businessos_robotrentalstore_civilization_context_r11*

## Forbidden

- DB_CONNECTION=NO
- DB_WRITE=NO
- DDL_APPLY=NO
- API_POST=NO
- DELETE=NO
- RLS_CHANGE=NO
- LOGIN_ENFORCEMENT=NO
- SESSION_VERIFICATION=NO
- AIWORKEROS_PATCH=NO
- AICM_SCAN=NO
- AICM_LOGIN_WIRING=NO
- PORTAL_PATCH=NO
- CIVILIZATIONOS_PATCH=NO
- PERSONAOS_PATCH=NO
- BROAD_GIT_ADD=NO
- GIT_COMMIT=NO
- GIT_PUSH=NO
- PYTHON=NO

## Patch purpose

Add RobotRentalStore static UI browser bridge for CivilizationOS login context.

## Patch non-purpose

Do not implement real authentication.
Do not verify CivilizationOS session.
Do not connect AIWorkerOS.
Do not make AICompanyManager login-required.
