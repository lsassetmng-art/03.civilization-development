# CasualChatWorker Real API Connection Preparation Handoff

status: PASS
generated_at: 20260425_064246

## 1. 対象

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. 今回作成したもの

設計:

- /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/070.api/070030_CASUAL_CHAT_WORKER_WORKER_RENTAL_REAL_API_CONNECTION_CONTRACT.md
- /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/060.integration/060040_CASUAL_CHAT_WORKER_REAL_API_CONNECTION_PREPARATION_APPEND.md
- /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/170.implementation-ready-freeze/170030_CASUAL_CHAT_WORKER_REAL_API_CONNECTION_WAITING_GATE.md

実装:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/domain/runtime-config.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/real-worker-rental-api-adapter.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/repository/worker-rental-repository.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/service/contract-service.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/contracts/worker-rental-payload-contract.json

検証:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/verify_real_api_connection_preparation.sh
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/run-real-api-connection-preparation-tests.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/post_apply_payload_gap_check.sh

## 3. 重要な状態

- DB apply は未実行
- runtime default は mock mode
- real API は allowRealApi=false でブロック
- frontend に DB env / psql / secret は置かない
- 実DB接続は BusinessOS backend 側だけが行う

## 4. real mode へ進める条件

- WorkerRentalCore DB apply PASS
- WorkerRentalCore verify SQL PASS
- backend endpoints 実装
- auth/session policy 実装
- API payload gap check PASS
- Boss承認
- 佐藤（DB担当）GO

