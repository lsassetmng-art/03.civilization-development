# AI Worker契約閲覧 R2 Patch Gate

## Ready condition
R2 may patch only after explicit user GO.

## R2 allowed patch
/data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/api/robot-rental-store-local-api.js

## R2 not allowed
- DB schema change
- RLS change
- DELETE
- API POST for verification
- Portal route patch
- UI patch
- git commit
- git push
- menu layout patch
- application contract viewer patch

## R2 verification
- node --check API
- GET /health
- GET /api/v1/business/robot-rental/contracts
- GET /api/v1/business/robot-rental/contracts/:id
- wrong X-Civilization-Id returns contract_not_found
- no raw owner leakage
