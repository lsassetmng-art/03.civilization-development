# CasualChatWorker / 雑談ワーカー Implementation Handoff

status: generated
generated_at: 20260425_051327
final_status: FAIL

## 1. 対象

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- category: 03.business-app
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker

## 2. 現在位置

CasualChatWorker は、設計骨格、無料チケット正本、HTML/CSS/JS 実装スケルトンまで作成済み。

今回、実装スケルトン検証を実行した。

## 3. 実装済みプロトタイプ

- Friend / Lover AIワーカー選択
- Worker type filter
- 月初無料チケット残数表示
- 30 / 60 / 90 / 120分の契約時間選択
- 30分500円ベースの価格見積
- 無料チケット自動適用
- 契約確定モック
- チャットセッションモック
- 残時間タイマー
- 安全リダイレクトモック
- 利用履歴モック
- localStorage 保存

## 4. 正本

- 価格: 30分500円
- 契約時間: 30 / 60 / 90 / 120分
- 月初無料チケット: 毎月2枚
- 1枚につき30分無料
- 最大60分無料
- Friend / Lover 共通
- Lover: 擬似恋人 / レンタル彼氏・彼女型AIワーカー
- Loverは現実の交際関係ではない

## 5. 境界

- business: 契約、課金、利用履歴、無料チケット
- aiworker: AIワーカー正本、Friend / Lover分類、会話制御、安全境界
- cx22073jw: 雑談材料、話題材料
- app_common / CommonOS: UI、component、presentation metadata
- ERP: v1直接連携なし

## 6. 生成済み主要ファイル

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/index.html
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/assets/css/app.css
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/assets/js/domain.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/assets/js/mock-api.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/assets/js/app.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/commonos/commonos-adapter.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/smoke-test.js
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/verify_implementation_skeleton.sh
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/README.md

## 7. 実行方法

Termux で開く:

termux-open /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/index.html

検証を再実行:

/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/verify_implementation_skeleton.sh

## 8. 次の作業候補

次は以下のどちらか。

A. 実装スケルトンの構造を本番用フォルダへ分解する
- components
- screens
- state
- api-client
- domain
- pricing
- ticket
- safety

B. DB DDL実装に進む
- business.chat_worker_price_catalog
- business.chat_worker_contract
- business.chat_worker_session
- business.chat_worker_free_ticket_grant
- business.chat_worker_free_ticket_balance
- business.chat_worker_free_ticket_usage

推奨は A。
まだDB applyには進まず、まずフロント実装構造を分解して設計準拠に寄せる。

## 9. 検証結果

- final_status: FAIL
- verify_exit: 1
- verify_result: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260425_051327_implementation_skeleton_verify.txt

