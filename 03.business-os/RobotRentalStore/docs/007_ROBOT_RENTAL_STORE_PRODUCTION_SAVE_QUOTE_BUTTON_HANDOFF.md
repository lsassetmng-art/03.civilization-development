# RobotRentalStore Production Save Quote Button Handoff

## Status
- phase: production-save-quote-button
- STATIC_HTML: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/index.html

## UI
Visible user actions:
- 見積を保存
- 申込確認へ進む

Removed from user screen:
- API base input
- civilization id input
- rollback smoke button
- raw persistence flags

## Test
This phase performs one real /quote/persist call and leaves the created quoted row.

## Manual run
ROBOT_RENTAL_STORE_API_PORT=9020 node "/data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/api/robot-rental-store-local-api.js"

Open:
/data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/index.html

## Next
- contract confirm endpoint
- contract confirm UI
- RLS after ownership smoke
