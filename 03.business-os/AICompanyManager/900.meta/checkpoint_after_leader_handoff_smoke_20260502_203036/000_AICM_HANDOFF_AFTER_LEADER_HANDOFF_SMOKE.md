# AICompanyManager 引き継ぎチェックポイント
# 課長へ送る smoke 後 / Leader受け皿前

## 対象
- AICompanyManager
- BusinessOS / 03.business-os
- 部門別タスク台帳
- Manager大項目
- 課長/Leader引き継ぎ導線

## 作業場所
- APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- META=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta
- PORT=8794
- DB=Persona側DB
- DB env=PERSONA_DATABASE_URL
- ERP DATABASE_URL は使わない

## 今回チェックポイント
- DB_WRITE=NO
- API_POST=NO
- PHYSICAL_DELETE=NO
- このチェックポイント作成ではDB更新なし

## 現在位置
1. 旧125件時代の細かいManager大項目は整理済み
2. 旧124件は物理DELETE済み
3. 再登録用37件CSVからManager大項目を再登録済み
4. 1件を「課長へ送る」で送信済み
5. UI上の未引き継ぎ件数は 36件 表示を確認済み
6. 「課長へ送る」確認カード表示OK
7. 「課長へ送るを確定」OK
8. キャンセルOK
9. 削除確認カード表示OK
10. 削除確定OK

## DB確認結果
- owner_id: 00000000-0000-4000-8000-000000000001
- pending_not_handed_off_count: 36
- handed_off_to_leader_count: 1
- 詳細ログ: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/checkpoint_after_leader_handoff_smoke_20260502_203036/020_db_state_verify.log

## 実装済み機能
### Manager大項目一覧
- 登録済み大項目をカード表示
- ページングあり
- 未実行/未引き継ぎのみ表示
- 削除ボタンあり
- 課長へ送るボタンあり

### 削除
- 削除確認カード表示
- 削除確定で archive API / update 経由ではなく既存 archive route を使用
- 手動確認後のみDB更新
- 旧124件物理DELETEは別途実施済み
- 旧124件バックアップCSVあり

### 課長へ送る
- 確認カード表示
- 確定時に /api/aicm/v2/manager-major/update へPOST
- 更新値:
  - decomposition_status_code = assigned_to_leader
  - handoff_status_code = handed_off
- 成功後、未引き継ぎ一覧から消える
- 37件 → 36件をUIで確認済み

## 保守性判断
- renderTaskLedgerPlaceholder は太らせない方針
- rows helper / render helper / context hydration / action helper を分離
- 課長へ送るは R8S helper と action block に集約
- server route は変更していない
- DB/API書込は画面の確認後のみ

## 重要な注意
- 現時点では Leader受信箱 / Leader中項目分解画面は未実装
- 課長へ送った1件はDB上で handed_off 状態になっている
- 次工程では handed_off の Manager大項目を Leader受信箱に表示する
- その後、Leaderが中項目へ分解し、Worker作業単位へ渡す

## 次工程
### R8T 推奨
Leader受信箱の実装:
1. handed_off / assigned_to_leader のManager大項目を取得
2. 「Leader受信箱」カードまたは画面に表示
3. 受信済み大項目ごとに「中項目へ分解」ボタンを出す
4. まずはDB書込なしで表示だけ実装
5. 表示確認後、中項目分解の確認カードへ進む

## 証跡
- node_check: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/checkpoint_after_leader_handoff_smoke_20260502_203036/010_node_check.log
- db_verify: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/checkpoint_after_leader_handoff_smoke_20260502_203036/020_db_state_verify.log
- core_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/checkpoint_after_leader_handoff_smoke_20260502_203036/030_core_feature_scan.log
- server_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/checkpoint_after_leader_handoff_smoke_20260502_203036/040_server_route_scan.log
- ui_curl: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/checkpoint_after_leader_handoff_smoke_20260502_203036/050_ui_curl.log
- handoff: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/checkpoint_after_leader_handoff_smoke_20260502_203036/000_AICM_HANDOFF_AFTER_LEADER_HANDOFF_SMOKE.md
