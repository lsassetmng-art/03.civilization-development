# アプリケーション契約閲覧 R2 Patch Gate

## R2 allowed
- Patch RobotRentalStore API only
- Add GET /api/v1/business/application-contracts
- Add GET /api/v1/business/application-contracts/:application_contract_id
- GET-only smoke

## R2 forbidden
- DB_WRITE
- API_POST
- DELETE
- RLS_CHANGE
- UI_PATCH
- PORTAL_PATCH
- GIT_COMMIT
- GIT_PUSH
