# UI課 参照資料: 個別依頼画面UI確認

## 目的
AICM個別依頼画面で、元データ添付UI、確認画面表示、実行時アップロードの責務が分離されているか確認する。

## 確認観点
- ファイル選択時にアップロードしない
- 確認画面遷移だけではアップロードしない
- 確定して実行時のみ multipart/form-data で一時アップロードする
- local_upload_pending 件数が確認画面で表示される
- saved_path / metadata のみ worker-runtime/request に渡る

## 成果物に含めるべき内容
- UI上の期待挙動
- 画面責務
- NG挙動
- 次回E2E確認観点
