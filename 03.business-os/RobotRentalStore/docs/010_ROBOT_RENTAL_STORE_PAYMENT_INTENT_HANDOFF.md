# RobotRentalStore Payment Intent Handoff

## Status
- phase: payment-intent-endpoint-ui
- API_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/api/robot-rental-store-local-api.js
- STATIC_HTML: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/index.html

## Added
- POST /api/v1/business/robot-rental/payments/intent/create
- UI button: 決済へ進む

## Production flow
1. 見積を保存
2. 申込を確定
3. 決済へ進む

## Payment behavior
- creates worker_rental_payment_intent
- payment_status = pending
- provider_code = local_placeholder

## Not done
- external payment provider
- payment capture
- rental start
- RLS
- ERP integration
