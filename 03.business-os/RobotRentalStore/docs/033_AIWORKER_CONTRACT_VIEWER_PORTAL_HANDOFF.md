# AI Worker契約閲覧 Portal Handoff

## Existing AIWorker menu node
AI Worker契約閲覧

## Node target
/aiworker-menu/aiworker-contracts

## Portal route
app/aiworker-menu/aiworker-contracts/route.ts

## Display target
/data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/contracts.html

## Auth
Use the same auth gate as AIWorker menu functions.

## Context
The screen must send:
X-Civilization-Id

Portal only routes/displays the screen.
RobotRentalStore API owns list/detail endpoints.
WorkerRentalCore DB owns persisted contract data.
