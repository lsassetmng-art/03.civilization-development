# アプリケーション契約閲覧 R2 API Patch Handoff

## Status
- FINAL_STATUS: PASS_APPLICATION_CONTRACT_VIEWER_R2_API_PATCHED_GET_ONLY_VERIFIED
- REPORT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/verification/20260526_083412_application_contract_viewer_r2_api_patch/000_APPLICATION_CONTRACT_VIEWER_R2_API_PATCH_REPORT.md

## Added
- GET /api/v1/business/application-contracts
- GET /api/v1/business/application-contracts/:application_contract_id

## Verified
- GET list
- GET detail
- cross-owner denial
- JSON shape
- RLS read-only state

## Not executed
- DB write
- API POST
- RLS change
- UI patch
- Portal patch
- commit
- push

## Next
R3 static UI patch.
