# BusinessOS RobotRentalStore Context Header Propagation R18 Commit Gate

## Required explicit GO

BUSINESSOS_ROBOTRENTALSTORE_CONTEXT_HEADER_PROPAGATION_R18 commit GO

## Scope

- BusinessOS only
- RobotRentalStore only
- exact add only
- commit only unless push is explicitly included separately

## Allowed files for exact add

- 03.business-os/RobotRentalStore/ui/static/civilization-context-bridge.js
- 03.business-os/RobotRentalStore/ui/static/index.html
- 03.business-os/RobotRentalStore/ui/static/contracts.html
- 03.business-os/RobotRentalStore/ui/static/application-contracts.html
- 03.business-os/900.meta/*businessos_robotrentalstore_context_header_propagation_r15_design_no_patch/*
- 03.business-os/900.meta/*businessos_robotrentalstore_context_header_propagation_r16_r2_patch/*
- 03.business-os/900.meta/*businessos_robotrentalstore_context_header_propagation_r17_r1_readiness_no_commit/*

## Forbidden

- broad git add
- AICompanyManager patch
- AIWorkerOS patch
- Portal patch
- CivilizationOS patch
- PersonaOS patch
- DB connection/write
- API POST
- login enforcement
- browser session verification
- Authorization/Bearer generation
