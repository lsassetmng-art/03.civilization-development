# API課 参照資料: 台帳CSV参照ファイルパス確認

## 目的
部門別タスク台帳CSVに設定した既存参照ファイルパスが reference_files_text として worker-runtime/request へ渡るか確認する。

## 前提
このファイルは既存参照ファイルであり、ローカルアップロードtmpではない。

## 期待
- reference_files_text にこのファイルパスが残る
- AIWorkerOS reader が本文を読める
- cleanup janitor はこのファイルを削除しない
