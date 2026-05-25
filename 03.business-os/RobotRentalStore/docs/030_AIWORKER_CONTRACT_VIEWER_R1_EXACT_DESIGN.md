# AI Worker契約閲覧 R1 Exact Design

## Status
- Phase: R1 exact design
- Patch: no
- DB write: no
- API POST: no
- Python: no
- Menu layout patch: no

## Product goal
ログインユーザ、正確には Civilization session の owner_civilization_id に紐づく AI Worker契約状態を一覧表示し、タップで契約詳細を確認できるようにする。

## Canonical route
/aiworker-menu/aiworker-contracts

## Data owner
WorkerRentalCore
business.worker_rental_*

## API owner
RobotRentalStore local API
/data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/api/robot-rental-store-local-api.js

## Screen owner
RobotRentalStore static UI
Candidate: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/contracts.html

## Scope and security
- owner column: owner_civilization_id
- request context: X-Civilization-Id
- DB session context: app.current_civilization_id
- RLS: already applied
- FORCE RLS: already applied
- direct RLS denial: already confirmed by aiemp_role__app_worker

## New API endpoints
GET /api/v1/business/robot-rental/contracts
GET /api/v1/business/robot-rental/contracts/:rental_contract_id

## Required next implementation order
1. R2 API patch
   - list contracts endpoint
   - detail endpoint
   - GET-only smoke
   - cross-owner not-found check
2. R3 static UI patch
   - contracts.html
   - list/detail UI
   - no debug exposure
3. R4 Portal route patch
   - /aiworker-menu/aiworker-contracts
   - existing node target
4. R5 UI-centered E2E
   - list appears
   - card tap opens detail
   - API GET only
   - RLS read-only check
5. Commit/push only after explicit request.

## Generated design docs
- API: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/031_AIWORKER_CONTRACT_VIEWER_API_CONTRACT_DESIGN.md
- UI: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/032_AIWORKER_CONTRACT_VIEWER_UI_DESIGN.md
- Portal handoff: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/033_AIWORKER_CONTRACT_VIEWER_PORTAL_HANDOFF.md
