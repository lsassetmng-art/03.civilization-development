# 保守課 参照資料: cleanup対象外確認

## 目的
台帳CSVに指定した既存参照ファイルが、AIWorkerOS cleanup により誤削除されないことを確認する。

## 重要
このファイルは AICM storage/runtime-source-files/tmp 配下ではない。
cleanup対象は runtime-source-files/tmp 配下に限定されるべきである。

## 期待
- 成果物作成後もこのファイルは残る
- metadata_jsonb の cleanup skipped / deleted 情報で tmp root 外の削除が発生していない
