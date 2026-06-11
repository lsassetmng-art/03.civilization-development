# BusinessOS Multilingual R2 Patch Gate

## Required previous status
PASS_BUSINESSOS_MULTILINGUAL_CONTRACT_UI_R1_EXACT_DESIGN_NO_PATCH_READY_FOR_R2

## R2 allowed
PATCH=YES
HTML_PATCH=YES

Targets:
- RobotRentalStore/ui/static/index.html
- RobotRentalStore/ui/static/contracts.html
- RobotRentalStore/ui/static/application-contracts.html

## R2 forbidden
DB_CONNECTION=NO
DB_WRITE=NO
DDL_APPLY=NO
API_POST=NO
DELETE=NO
RLS_CHANGE=NO
API_PATCH=NO
PORTAL_COMMON_PATCH=NO
CIVILIZATIONOS_PATCH=NO
AIWORKEROS_PATCH=NO
PERSONAOS_PATCH=NO
GIT_COMMIT=NO
GIT_PUSH=NO
PYTHON=NO

## R2 goal
Add inline BusinessOS i18n core and dictionary scaffolding.
Do not rewrite every UI label in R2.

## Required verification
- each target HTML has i18n core marker
- locale normalization supports ja/en variants
- no external script dependency is added
- no debug/prototype text is exposed
- API syntax remains valid
- existing titles still exist
- rollback on failed patch
