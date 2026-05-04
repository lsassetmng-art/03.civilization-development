# RobotRentalStore Local API Create-or-patch v2 Handoff

## Status
- phase: api-create-or-patch-v2
- API_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/api/robot-rental-store-local-api.js
- STATIC_HTML: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/index.html

## Manual run
ROBOT_RENTAL_STORE_API_PORT=9020 node "/data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/api/robot-rental-store-local-api.js"

Open:
/data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/index.html

## Endpoints
- GET /health
- GET /api/v1/business/robot-rental/catalog
- GET /api/v1/business/robot-rental/models/{model_code}
- POST /api/v1/business/robot-rental/quote

## Context
- header: X-Civilization-Id
- catalog: context not required
- quote: dry-run / no-persist / context-aware

## Next
- owner_civilization_id column apply after approval
- persistent quote after column apply
- contract confirm after quote smoke
- RLS after write path is civilization-aware
