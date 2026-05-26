# アプリケーション契約閲覧 R1 Exact Design Handoff

## Status
- FINAL_STATUS: PASS_APPLICATION_CONTRACT_VIEWER_R1_EXACT_DESIGN_NO_PATCH_READY_FOR_R2
- REPORT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/verification/20260526_081826_application_contract_viewer_r1_exact_design_no_patch/000_APPLICATION_CONTRACT_VIEWER_R1_EXACT_DESIGN_NO_PATCH_REPORT.md

## Fixed decisions
- Canonical read surface: WorkerRentalCore existing contract tables
- Route: /aiworker-menu/application-contracts
- List API: GET /api/v1/business/application-contracts
- Detail API: GET /api/v1/business/application-contracts/:application_contract_id
- UI file: RobotRentalStore/ui/static/application-contracts.html
- Scope: owner_civilization_id / X-Civilization-Id / app.current_civilization_id

## Generated
- MAIN_DESIGN: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/048_APPLICATION_CONTRACT_VIEWER_R1_EXACT_DESIGN.md
- API_DESIGN: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/049_APPLICATION_CONTRACT_VIEWER_API_CONTRACT_DESIGN.md
- UI_DESIGN: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/050_APPLICATION_CONTRACT_VIEWER_UI_DESIGN.md
- PORTAL_HANDOFF: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/051_APPLICATION_CONTRACT_VIEWER_PORTAL_HANDOFF.md
- R2_GATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/052_APPLICATION_CONTRACT_VIEWER_R2_PATCH_GATE.md

## Next
R2 API list/detail patch after explicit GO.
