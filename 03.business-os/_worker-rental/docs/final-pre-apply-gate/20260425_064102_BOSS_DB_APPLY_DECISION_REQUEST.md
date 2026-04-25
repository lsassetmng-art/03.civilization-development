# Boss DB Apply Decision Request

status: boss-decision-required
generated_at: 20260425_064102

## 1. 結論

WorkerRentalCore の DB apply は、まだ実行していません。

現時点の gate status:

- READY_FOR_REVIEW

## 2. 次の判断

DB apply に進むには、以下が必要です。

1. 佐藤（DB担当）が GO
2. Boss が明示的に「DB applyして」と指示
3. STOP条件に該当しない
4. PERSONA_DATABASE_URL で実行する

## 3. 今回の対象

WorkerRentalCore:

- 汎用 worker rental 基盤
- minute / hour / day / month / year 対応
- 汎用最大2年
- アプリ別最大契約
- アプリ別価格
- アプリ別最短契約時間分の月初無料チケット

CasualChatWorker:

- 最大2時間
- 最短30分
- 月初無料チケット2枚
- 1枚30分無料

## 4. 実行コマンド

佐藤GO + Boss承認後のみ実行:

/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh

検証のみ:

/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh

## 5. Boss判断欄

- [ ] DB apply 承認
- [ ] まだ承認しない
- [ ] 修正してから再提示

