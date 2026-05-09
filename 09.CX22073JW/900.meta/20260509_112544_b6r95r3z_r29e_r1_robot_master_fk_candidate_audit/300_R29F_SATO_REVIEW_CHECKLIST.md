# R29F 佐藤レビュー チェックリスト

## レビュー対象

- ロボットマスタ実テーブル
- 型番列
- unique / primary key
- FK付き `robot_model_identifier_canon` 設計

## 判断すること

1. FK先にするロボットマスタ実テーブルはどれか。
2. FK先の型番列は public model code として正しいか。
3. その列に unique または primary key があるか。
4. なければ、既存テーブルにunique制約を追加すべきか、新規マスタ/identifier canonを作るべきか。
5. `BYD2-003` と `byd2_003_asic_leader3` の対応を seed として入れてよいか。
6. 今後HD/MEGAMI/LoVerSにも同じ設計を広げられるか。

## 禁止

- 既存値の破壊的UPDATE
- DELETE
- server.jsの機種別決め打ちalias
- AICM側での補正
- viewへのFK想定
