# RobotRentalStore Rental Start Handoff

## Status
- phase: rental-start-endpoint-ui
- API_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/api/robot-rental-store-local-api.js
- STATIC_HTML: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/index.html

## Added
- POST /api/v1/business/robot-rental/rentals/start
- UI button: 利用開始

## Production flow
1. 見積を保存
2. 申込を確定
3. 決済へ進む
4. 利用開始

## Start behavior
- contract_status confirmed -> active
- period_status pending -> active
- actual_started_at set
- status history confirmed -> active
- local placeholder payment status pending -> authorized

## Not done
- external payment provider
- payment capture
- rental end/cancel
- RLS
- ERP integration
