# BusinessOS RobotRentalStore Context Header Propagation R16 Patch Gate

## Gate

R16 patch is allowed only after explicit user GO.

Required phrase:

BUSINESSOS_ROBOTRENTALSTORE_CONTEXT_HEADER_PROPAGATION_R16 patch GO

## Allowed

- BusinessOS only
- RobotRentalStore only
- static runtime header propagation only
- no API POST execution
- no DB connection
- no DB write
- no login enforcement
- no browser session verification
- exact target files only

## Allowed runtime targets

- 03.business-os/RobotRentalStore/ui/static/civilization-context-bridge.js
- 03.business-os/RobotRentalStore/ui/static/index.html
- 03.business-os/RobotRentalStore/ui/static/contracts.html
- 03.business-os/RobotRentalStore/ui/static/application-contracts.html

## Forbidden

- AICompanyManager patch
- AIWorkerOS patch
- Portal patch
- CivilizationOS patch
- PersonaOS patch
- DB/DDL/RLS change
- API POST execution
- git add/commit/push without separate explicit GO
- broad git add
- Authorization/Bearer/token/password/secret generation
