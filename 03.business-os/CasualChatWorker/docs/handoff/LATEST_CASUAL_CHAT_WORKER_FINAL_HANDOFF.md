# CasualChatWorker Final Handoff

status: PASS
generated_at: 20260425_063657

## 1. 引き継ぎ対象

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- category: 03.business-app
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. 現在位置

CasualChatWorker は以下まで完了。

- 設計骨格
- 無料チケット正本
- HTML/CSS/JSプロトタイプ
- 実装モジュール分解
- API payload fixtures
- WorkerRentalCore 汎用化
- CasualChatWorker 最大2時間制限
- 月初無料チケット = アプリ最短契約時間分無料
- AIWorker最新シリーズ傾向反映
- LoVerS個体性格特色反映
- ビジネスヤンデレ強安全注意反映
- 最終受入検証パッケージ作成

## 3. 正本

### CasualChatWorker

- 最短契約: 30分
- 最大契約: 120分
- 契約時間: 30 / 60 / 90 / 120分
- 価格: 30分500円
- 60分: 1,000円
- 90分: 1,500円
- 120分: 2,000円
- worker rental unit: minute
- app_code: CasualChatWorker
- service_code: casual_chat_worker

### 月初無料チケット

- 各アプリの最短契約時間1回分を無料にする
- CasualChatWorkerでは1枚30分無料
- 月初2枚配布
- 最大60分無料
- v1繰越なし

### WorkerRentalCore

- 汎用基盤は minute / hour / day / month / year 対応
- 汎用最大2年
- 各アプリごとに最短契約・最大契約・価格が異なる
- 金額は app_code / service_code ごとの price catalog で管理

### AIWorker

- HD Series: initiative medium / user_influence none / action_restriction strict_policy
- LoVerS Series: initiative per_model / user_influence soft / action_restriction strict_policy
- LoVerS個体性格特色は style card として表示
- style 12 ビジネスヤンデレは強安全注意対象

## 4. 境界

- business: 契約、価格、利用権、無料チケット、利用履歴
- aiworker: AIワーカー正本、シリーズ傾向、個体性格特色、安全境界
- cx22073jw: 雑談材料
- app_common / CommonOS: UI表現
- ERP: v1直接連携なし

## 5. 重要ファイル

Final package:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/20260425_063657_CASUAL_CHAT_WORKER_FINAL_ACCEPTANCE_PACKAGE.md

Final verify:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260425_063657_final_acceptance_verify.txt

Implementation:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/index.html
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/assets/js/app.modular.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/domain/worker-rental-mapping.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/worker-rental-payload-client.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/aiworker-reference/series-tendency-reference.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/aiworker-reference/lovers-style-selection-cards.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/components/ui-renderers.js

WorkerRentalCore:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification

## 6. 禁止事項

- DB apply を勝手に実行しない
- ERP直接連携をv1に入れない
- AIWorkerOS正本をCasualChatWorkerに複製しない
- CX22073JW正本をCasualChatWorkerに複製しない
- Loverを現実の交際関係にしない
- 監視、脅し、依存誘導、性的サービス化を許可しない

## 7. 次の推奨

final_status が PASS の場合:

- DB apply decision bundle を作る
- 佐藤（DB担当）レビュー用に WorkerRentalCore DDL package を提示する

final_status が FAIL の場合:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260425_063657_final_acceptance_verify.txt を確認
- FAIL のみ修正
- 破壊的に作り直さない

## 8. 実行コマンド

プロトタイプを開く:

termux-open /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/index.html

最終検証:

/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/verify_final_acceptance.sh

