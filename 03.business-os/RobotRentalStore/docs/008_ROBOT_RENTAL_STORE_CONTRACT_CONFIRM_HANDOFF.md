# RobotRentalStore Contract Confirm Handoff

## Status
- phase: contract-confirm-endpoint-ui
- API_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/api/robot-rental-store-local-api.js
- STATIC_HTML: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/index.html

## Added
- POST /api/v1/business/robot-rental/contracts/confirm
- UI button: 申込を確定

## Production flow
1. 見積を保存
2. 申込を確定

## Confirm behavior
- quoted -> confirmed
- creates worker_rental_period with period_status=pending
- creates status history quoted -> confirmed

## Not done
- payment
- runtime start
- RLS
- ERP integration
