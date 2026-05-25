# AI Worker Contract Viewer R0 Inventory Handoff

## Status
- FINAL_STATUS: PASS_AIWORKER_CONTRACT_VIEWER_R0_INVENTORY_NO_PATCH
- REPORT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/verification/20260524_053951_aiworker_contract_viewer_r0_inventory_no_patch/000_AIWORKER_CONTRACT_VIEWER_R0_INVENTORY_NO_PATCH_REPORT.md

## Target
- Node label: AI Worker契約閲覧
- Proposed route: /aiworker-menu/aiworker-contracts
- Data source: business.worker_rental_* through RobotRentalStore local API
- Owner scope: owner_civilization_id
- Context header: X-Civilization-Id

## Proposed API
- GET /api/v1/business/robot-rental/contracts
- GET /api/v1/business/robot-rental/contracts/:rental_contract_id

## Proposed UI
- Contract list for current civilization
- Tap contract card to open detail
- No debug controls

## Next
- R1 exact design / no patch
- R2 API list/detail patch
- R3 static UI patch
- R4 Portal AIWorker menu route patch
- R5 UI-centered E2E
