# RobotRentalStore Persistent Quote Endpoint Handoff

## Status
- phase: persistent-quote-endpoint
- API_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/api/robot-rental-store-local-api.js

## Added endpoints
- POST /api/v1/business/robot-rental/quote/persist
- POST /api/v1/business/robot-rental/quote/rollback-smoke

## Write path
/quote/persist inserts:
- business.worker_rental_contract
- business.worker_rental_contract_line
- business.worker_rental_status_history

## Smoke path
/quote/rollback-smoke uses the same insert chain but ROLLBACKs.

## Required header
X-Civilization-Id

## Not done
- RLS not enabled
- contract confirm not implemented
- payment not implemented
- ERP not touched
- AICompanyManager not touched
